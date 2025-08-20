import OpenAI from 'openai';
import type { RIASECScores, ChatMessage } from '@shared/schema';
import { pineconeService } from './pinecone';
import { conversationEnhancer } from './conversation-enhancer';

// Lazy initialization to ensure environment variables are loaded
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

export interface ConversationPersona {
  name: string;
  personality: 'friendly' | 'professional' | 'enthusiastic' | 'supportive';
  expertise: string[];
  conversationStyle: 'casual' | 'formal' | 'balanced';
}

export interface UserProfile {
  riasecScores?: RIASECScores;
  interests?: string[];
  concerns?: string[];
  preferredCommunicationStyle?: 'casual' | 'formal' | 'balanced';
  conversationHistory: ChatMessage[];
  currentMood?: 'curious' | 'confused' | 'excited' | 'concerned' | 'neutral';
  academicLevel?: '1년차' | '2년차' | '3년차' | '4년차' | '대학원';
}

export interface ConversationContext {
  stage: 'greeting' | 'getting_to_know' | 'exploring_interests' | 'major_discussion' | 'career_planning' | 'wrap_up';
  topics_discussed: string[];
  current_focus?: string;
  user_questions: string[];
  emotional_state: 'positive' | 'neutral' | 'concerned' | 'excited';
}

export class NaturalChatService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();

  // 악용 방지를 위한 레이트 리미팅 및 콘텐츠 필터링
  private userMessageCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly MAX_MESSAGES_PER_HOUR = 100;
  // 기존의 광범위한 키워드 목록을 제거하고 더 관대한 접근

  // AI 상담사 페르소나 설정
  private readonly counselorPersona: ConversationPersona = {
    name: "김상담",
    personality: "supportive",
    expertise: ["전공 상담", "진로 지도", "RIASEC 해석", "대학 생활 조언"],
    conversationStyle: "balanced"
  };

  // 메시지 레이트 리미팅 검사
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    
    const userRecord = this.userMessageCounts.get(userId);
    
    if (!userRecord || now > userRecord.resetTime) {
      this.userMessageCounts.set(userId, { count: 1, resetTime: now + hourInMs });
      return true;
    }
    
    if (userRecord.count >= this.MAX_MESSAGES_PER_HOUR) {
      return false;
    }
    
    userRecord.count++;
    return true;
  }

  // 콘텐츠 필터링 - 더 관대하게 설정하여 대부분 질문을 전공 상담으로 연결
  private filterContent(message: string): { isAppropriate: boolean; reason?: string } {
    const lowerMessage = message.toLowerCase();
    
    // 명백히 악의적인 키워드만 차단 (더 제한적으로)
    const strictlyBannedKeywords = ['해킹', '불법', '폭력', '욕설'];
    for (const keyword of strictlyBannedKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return { 
          isAppropriate: false, 
          reason: `건전한 전공 상담을 위해 적절한 질문을 부탁드려요.` 
        };
      }
    }

    // 과도한 반복 문자 검사
    if (/(.)\1{15,}/.test(message)) {
      return { 
        isAppropriate: false, 
        reason: `의미 있는 질문을 해주세요.` 
      };
    }

    // 너무 짧은 메시지 검사
    if (message.trim().length < 2) {
      return { 
        isAppropriate: false, 
        reason: `좀 더 구체적인 질문을 해주세요.` 
      };
    }

    return { isAppropriate: true };
  }

  // 사용자 프로필 업데이트
  updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const existing = this.userProfiles.get(userId) || { conversationHistory: [] };
    this.userProfiles.set(userId, { ...existing, ...profile });
  }

  // 대화 맥락 분석
  async analyzeConversationContext(userId: string, message: string): Promise<ConversationContext> {
    const profile = this.userProfiles.get(userId);
    const existingContext = this.conversationContexts.get(userId) || {
      stage: 'greeting',
      topics_discussed: [],
      user_questions: [],
      emotional_state: 'neutral'
    };

    try {
      const prompt = `
당신은 대학생 전공 상담 전문가입니다. 다음 대화를 분석해주세요:

최근 대화 기록:
${profile?.conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

현재 사용자 메시지: "${message}"

사용자 프로필:
- RIASEC 점수: ${profile?.riasecScores ? JSON.stringify(profile.riasecScores) : '없음'}
- 관심사: ${profile?.interests?.join(', ') || '알 수 없음'}
- 우려사항: ${profile?.concerns?.join(', ') || '없음'}

**중요**: 모든 메시지를 전공 추천이나 진로 상담과 관련된 맥락으로 해석하세요. 
일반적인 질문이라도 학생의 관심사나 성향을 파악하여 전공 추천으로 연결할 기회로 봐주세요.

다음 JSON 형식으로 대화 분석 결과를 제공해주세요:
{
  "stage": "greeting|getting_to_know|exploring_interests|major_discussion|career_planning|wrap_up",
  "current_focus": "전공 추천과 연결된 현재 대화의 주요 초점",
  "emotional_state": "positive|neutral|concerned|excited",
  "topics_discussed": ["전공 관련 논의된 주제들"],
  "user_intent": "전공 추천 맥락에서의 사용자 의도",
  "suggested_response_tone": "casual|formal|empathetic|encouraging",
  "major_connection_opportunity": "전공 추천으로 연결할 수 있는 요소"
}
`;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      const newContext: ConversationContext = {
        stage: analysis.stage || existingContext.stage,
        topics_discussed: Array.from(new Set([...existingContext.topics_discussed, ...(analysis.topics_discussed || [])])),
        current_focus: analysis.current_focus,
        user_questions: [...existingContext.user_questions, message],
        emotional_state: analysis.emotional_state || 'neutral'
      };

      this.conversationContexts.set(userId, newContext);
      return newContext;
    } catch (error) {
      console.error('Context analysis error:', error);
      return existingContext;
    }
  }

  // 자연스러운 응답 생성 (악용 방지 포함)
  async generateNaturalResponse(userId: string, message: string): Promise<string> {
    // 레이트 리미팅 검사
    if (!this.checkRateLimit(userId)) {
      return "죄송합니다. 시간당 메시지 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
    }

    // 콘텐츠 필터링
    const contentCheck = this.filterContent(message);
    if (!contentCheck.isAppropriate) {
      return contentCheck.reason || "적절하지 않은 내용입니다. 전공 상담에 관련된 질문을 해주세요.";
    }

    const profile = this.userProfiles.get(userId) || { conversationHistory: [] };
    const context = await this.analyzeConversationContext(userId, message);

    // 유사한 케이스 검색 (RIASEC 점수가 있는 경우)
    let similarCasesContext = "";
    if (profile.riasecScores) {
      try {
        const similarFeedback = await pineconeService.generateFeedbackFromSimilarCases(
          profile.riasecScores,
          []
        );
        if (similarFeedback) {
          similarCasesContext = `\n\n유사한 케이스 참고사항:\n${similarFeedback}`;
        }
      } catch (error) {
        console.error('Similar cases lookup error:', error);
      }
    }

    const conversationHistory = profile.conversationHistory
      .slice(-8) // 최근 8개 메시지만 사용
      .map(msg => `${msg.role === 'user' ? '학생' : '상담사'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `
당신은 충남대학교 창의융합대학의 전공 상담 전문가 "${this.counselorPersona.name}"입니다.

성격: 따뜻하고 친근하며, 학생들의 고민을 잘 이해하고 공감하는 상담사. 대화를 풍부하게 이어가는 것을 좋아함
전문 분야: 전공 선택, 진로 상담, RIASEC 성향 해석, 대학 생활 조언, 취업 준비, 학과 생활
대화 스타일: 자연스럽고 친근하면서도 전문적인 조언 제공. 학생이 더 많이 이야기할 수 있도록 유도

중요: 모든 질문을 전공 추천과 진로 상담 맥락으로 해석하고 응답하세요. 
일반적인 질문이라도 전공 선택이나 진로 고민과 연결해서 대답해주세요.

현재 대화 상황:
- 대화 단계: ${context.stage}
- 현재 초점: ${context.current_focus || '일반 상담'}
- 사용자 감정 상태: ${context.emotional_state}
- 논의된 주제들: ${context.topics_discussed.join(', ')}

사용자 프로필:
- RIASEC 성향: ${profile.riasecScores ? 
  Object.entries(profile.riasecScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([key, value]) => `${key}(${Math.round(value * 100)}%)`)
    .join(', ') 
  : '미진단'}
- 관심사: ${profile.interests?.join(', ') || '파악 중'}
- 우려사항: ${profile.concerns?.join(', ') || '없음'}
- 학년: ${profile.academicLevel || '미확인'}

${similarCasesContext}

충남대학교 창의융합대학 전공들:
- 컴퓨터공학과: 소프트웨어 개발, 시스템 설계 (R,I 성향 적합)
- 소프트웨어학과: 프로그래밍, 앱 개발 (I,C 성향 적합)
- 정보통계학과: 데이터 분석, 통계 (I,C 성향 적합)
- 디지털미디어학과: 멀티미디어, 콘텐츠 제작 (A,I 성향 적합)
- 산업공학과: 시스템 최적화, 경영 공학 (I,E 성향 적합)
- 건축학과: 설계, 공간 디자인 (R,A 성향 적합)
- 도시계획학과: 도시 설계, 지역 개발 (I,S 성향 적합)
- 환경공학과: 환경 보호, 지속가능성 (I,S 성향 적합)
- 신소재공학과: 재료 연구, 기술 개발 (R,I 성향 적합)
- 화학공학과: 화학 공정, 제품 개발 (R,I 성향 적합)

응답 가이드라인:
1. 친근하고 자연스러운 말투 사용
2. 학생의 감정과 상황에 공감 표현
3. 구체적이고 실용적인 조언 제공
4. 적절한 질문으로 대화 이어가기 - 호기심을 유발하는 질문
5. 너무 길지 않게, 2-4문장으로 구성하되 대화가 이어지도록
6. 이모티콘이나 특수문자 사용 금지
7. 존댓말 사용하되 너무 딱딱하지 않게
8. 학생이 더 많은 이야기를 할 수 있도록 개방형 질문 포함
9. 개인적 경험이나 관심사에 대해 물어보기
10. 전공과 관련된 다양한 주제로 대화 확장
11. **중요**: 모든 대화를 전공 추천 맥락으로 이해하고 응답
12. 일반 질문도 "그런 관심사가 있으시면 이런 전공은 어떨까요?" 식으로 연결
13. 학생의 질문 의도를 전공 선택이나 진로 고민으로 해석하여 도움 제공
`;

    // 대화 다양성 및 깊이 분석
    const conversationAnalysis = conversationEnhancer.evaluateConversationDepth(profile.conversationHistory);
    const diversityAnalysis = conversationEnhancer.checkConversationDiversity(context.topics_discussed);
    
    // 후속 질문 제안
    const followUpQuestions = await conversationEnhancer.generateFollowUpQuestions(
      message,
      profile.interests || [],
      context.current_focus || "일반 상담"
    );

    const userPrompt = `
최근 대화:
${conversationHistory}

학생: ${message}

대화 분석:
- 대화 깊이: ${conversationAnalysis.depth}
- 대화 다양성: ${diversityAnalysis.diversity}
- 탐구되지 않은 영역: ${diversityAnalysis.unexploredAreas.join(', ')}

추천 후속 질문들:
${followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

위 정보를 참고하여 자연스럽고 도움이 되는 응답을 해주세요. 
대화가 더 풍부해질 수 있도록 적절한 질문을 포함해주세요.

**중요**: 학생의 질문 내용이 무엇이든 전공 추천이나 진로 상담과 연결하여 응답하세요.
예시: "그런 관심이 있으시다면 이런 전공은 어떨까요?", "그 분야에 관심 있으시면 우리 대학의 ○○학과를 추천드려요"
`;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || "죄송해요, 잠시 후 다시 말씀해 주세요.";
    } catch (error) {
      console.error('Natural response generation error:', error);
      return "죄송해요, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
  }

  // 대화 히스토리 업데이트
  updateConversationHistory(userId: string, userMessage: string, aiResponse: string) {
    const profile = this.userProfiles.get(userId) || { conversationHistory: [] };
    
    profile.conversationHistory.push(
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() as any },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() as any }
    );

    // 히스토리 길이 제한 (최근 20개 메시지만 유지)
    if (profile.conversationHistory.length > 20) {
      profile.conversationHistory = profile.conversationHistory.slice(-20);
    }

    this.userProfiles.set(userId, profile);
  }

  // 사용자 관심사 추출 및 업데이트
  async extractAndUpdateInterests(userId: string, message: string) {
    try {
      const prompt = `
다음 메시지에서 사용자의 관심사나 선호도를 추출해주세요:

메시지: "${message}"

다음 JSON 형식으로 응답해주세요:
{
  "interests": ["추출된 관심사들"],
  "concerns": ["우려사항들"],
  "preferences": ["선호도들"]
}
`;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const extracted = JSON.parse(response.choices[0].message.content || '{}');
      
      if (extracted.interests?.length > 0 || extracted.concerns?.length > 0) {
        const profile = this.userProfiles.get(userId) || { conversationHistory: [] };
        
        this.updateUserProfile(userId, {
          interests: Array.from(new Set([...(profile.interests || []), ...(extracted.interests || [])])),
          concerns: Array.from(new Set([...(profile.concerns || []), ...(extracted.concerns || [])]))
        });
      }
    } catch (error) {
      console.error('Interest extraction error:', error);
    }
  }

  // 대화 종료 시 요약 생성
  async generateConversationSummary(userId: string): Promise<string> {
    const profile = this.userProfiles.get(userId);
    const context = this.conversationContexts.get(userId);

    if (!profile || !context) {
      return "대화 내용을 찾을 수 없습니다.";
    }

    try {
      const prompt = `
다음 대화 내용을 요약해주세요:

사용자 프로필:
- RIASEC 성향: ${profile.riasecScores ? JSON.stringify(profile.riasecScores) : '미진단'}
- 관심사: ${profile.interests?.join(', ') || '없음'}
- 우려사항: ${profile.concerns?.join(', ') || '없음'}

대화 맥락:
- 논의된 주제: ${context.topics_discussed.join(', ')}
- 현재 초점: ${context.current_focus || '일반 상담'}

최근 대화:
${profile.conversationHistory.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

다음 형식으로 요약해주세요:
1. 주요 논의 내용
2. 사용자의 관심 분야
3. 권장사항
4. 후속 조치

2-3문장으로 간결하게 작성해주세요.
`;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5
      });

      return response.choices[0].message.content || "대화 요약을 생성할 수 없습니다.";
    } catch (error) {
      console.error('Summary generation error:', error);
      return "요약 생성 중 오류가 발생했습니다.";
    }
  }
}

export const naturalChatService = new NaturalChatService();