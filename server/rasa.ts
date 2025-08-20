import axios from 'axios';
import type { RIASECScores, ChatMessage } from '@shared/schema';
import { pineconeService } from './pinecone';
import OpenAI from 'openai';

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

// Rasa-like slot management and conversation flow
export interface ConversationSlots {
  riasecScores?: RIASECScores;
  recommendedMajors?: string[];
  currentIntent?: string;
  majorInterest?: string;
  careerGoals?: string;
  userInfo?: {
    year?: number;
    interests?: string[];
    concerns?: string[];
  };
}

export interface ConversationState {
  sessionId: string;
  slots: ConversationSlots;
  conversationStage: 'greeting' | 'assessment_done' | 'exploring_majors' | 'deep_counseling' | 'conclusion';
  messageHistory: ChatMessage[];
}

export class RasaLikeService {
  private conversations: Map<string, ConversationState> = new Map();

  // Intent classification using OpenAI
  async classifyIntent(message: string, context?: ConversationSlots): Promise<string> {
    try {
      const prompt = `
다음 사용자 메시지의 의도를 분류해주세요:

메시지: "${message}"

가능한 의도들:
- greeting: 인사, 시작
- ask_major_info: 특정 전공에 대한 정보 문의
- ask_career_path: 진로, 취업 관련 질문
- ask_curriculum: 커리큘럼, 수업 내용 문의
- ask_admission: 입학, 전형 관련 질문
- express_concern: 걱정, 우려 표현
- ask_comparison: 전공 간 비교 요청
- ask_recommendation: 추가 추천 요청
- general_question: 일반적인 질문
- goodbye: 대화 종료

의도를 하나의 단어로만 답변해주세요.
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 50
      });

      const intent = response.choices[0].message.content?.trim().toLowerCase() || 'general_question';
      return intent;
    } catch (error) {
      console.error('Intent classification error:', error);
      return 'general_question';
    }
  }

  // Entity extraction using OpenAI
  async extractEntities(message: string): Promise<Record<string, any>> {
    try {
      const prompt = `
다음 사용자 메시지에서 엔티티를 추출해주세요:

메시지: "${message}"

추출할 엔티티들:
- major: 전공명 (예: 컴퓨터공학과, 소프트웨어학과 등)
- career: 직업명 (예: 개발자, 디자이너 등)
- year: 학년 또는 연도
- interest: 관심사
- concern: 걱정거리

JSON 형식으로 답변해주세요. 해당하는 엔티티가 없으면 빈 객체를 반환해주세요.
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 200
      });

      const entities = JSON.parse(response.choices[0].message.content || '{}');
      return entities;
    } catch (error) {
      console.error('Entity extraction error:', error);
      return {};
    }
  }

  // Update conversation slots
  updateSlots(sessionId: string, newSlots: Partial<ConversationSlots>): void {
    const conversation = this.conversations.get(sessionId);
    if (conversation) {
      conversation.slots = { ...conversation.slots, ...newSlots };
    }
  }

  // Determine next action based on intent and slots
  async determineNextAction(
    sessionId: string,
    intent: string,
    entities: Record<string, any>,
    message: string
  ): Promise<string> {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return 'default_response';

    // Update slots with extracted entities
    if (entities.major) {
      this.updateSlots(sessionId, { majorInterest: entities.major });
    }
    if (entities.career) {
      this.updateSlots(sessionId, { careerGoals: entities.career });
    }

    // Action determination logic
    switch (intent) {
      case 'greeting':
        return 'action_greet';
      
      case 'ask_major_info':
        if (entities.major) {
          return 'action_provide_major_info';
        }
        return 'action_ask_which_major';
      
      case 'ask_career_path':
        return 'action_provide_career_info';
      
      case 'ask_curriculum':
        return 'action_provide_curriculum_info';
      
      case 'ask_comparison':
        return 'action_compare_majors';
      
      case 'ask_recommendation':
        if (conversation.slots.riasecScores) {
          return 'action_provide_similar_cases';
        }
        return 'action_suggest_assessment';
      
      case 'express_concern':
        return 'action_address_concern';
      
      default:
        return 'action_general_response';
    }
  }

  // Execute actions
  async executeAction(
    sessionId: string,
    action: string,
    message: string,
    entities: Record<string, any>
  ): Promise<string> {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return '죄송합니다. 대화를 찾을 수 없습니다.';

    switch (action) {
      case 'action_greet':
        return this.actionGreet(conversation);
      
      case 'action_provide_major_info':
        return this.actionProvideMajorInfo(conversation, entities.major);
      
      case 'action_provide_career_info':
        return this.actionProvideCareerInfo(conversation);
      
      case 'action_provide_curriculum_info':
        return this.actionProvideCurriculumInfo(conversation, entities.major);
      
      case 'action_compare_majors':
        return this.actionCompareMajors(conversation);
      
      case 'action_provide_similar_cases':
        return this.actionProvideSimilarCases(conversation);
      
      case 'action_address_concern':
        return this.actionAddressConcern(conversation, message);
      
      case 'action_ask_which_major':
        return '어떤 전공에 대해 더 자세히 알고 싶으신가요? 컴퓨터공학과, 소프트웨어학과, 디지털미디어학과 등 구체적인 전공명을 말씀해주세요.';
      
      case 'action_suggest_assessment':
        return '더 정확한 추천을 위해 먼저 RIASEC 성향 진단을 받아보시는 것을 추천합니다. 진단 페이지에서 간단한 테스트를 통해 당신의 성향을 파악할 수 있습니다.';
      
      default:
        return this.actionGeneralResponse(conversation, message);
    }
  }

  // Action implementations
  private actionGreet(conversation: ConversationState): string {
    if (conversation.slots.riasecScores) {
      return `안녕하세요! 다시 만나서 반갑습니다. RIASEC 진단 결과를 바탕으로 충남대학교 전공에 대한 더 구체적인 상담을 도와드릴게요. 어떤 것이 궁금하신가요?`;
    }
    return `안녕하세요! 충남대학교 전공 상담 AI입니다. 저는 RIASEC 성향 분석을 바탕으로 충남대 맞춤형 전공 상담을 제공합니다. 창의융합대학과 기존 학과들에 대해 모두 상담 가능합니다. 어떻게 도와드릴까요?`;
  }

  private async actionProvideMajorInfo(conversation: ConversationState, majorName?: string): Promise<string> {
    const major = majorName || conversation.slots.majorInterest;
    if (!major) {
      return '어떤 전공에 대해 알고 싶으신지 구체적으로 말씀해주세요.';
    }

    const majorInfo: Record<string, any> = {
      '컴퓨터융합학부': {
        description: '공과대학 소속, 기존 컴퓨터공학과에서 명칭 변경. AI, 빅데이터, SW, 정보보호 핵심 기술 교육을 통한 SW 우수 인재 양성.',
        careers: ['AI 엔지니어', '소프트웨어 개발자', '데이터 사이언티스트', '정보보호 전문가', 'IoT 개발자'],
        curriculum: ['인공지능', '데이터과학', '소프트웨어', 'IoT 임베디드시스템', '정보보호'],
        companies: '삼성전자, LG전자, 네이버, SK텔레콤, KT 등',
        admission: '공과대학 컴퓨터융합학부로 직접 입학'
      },
      '창의융합대학': {
        description: '2025년 신설된 독립 단과대학. 전공자율선택제로 1학년 전공 탐색 후 2학년 진학시 64개 전공 중 선택.',
        careers: ['융합 전문가', '창의적 문제해결자', '다학제 연구원', '혁신 기업가'],
        curriculum: ['자율전공융합학부', '인문사회융합학부', '공학융합학부', '자연과학융합학부', '첨단융합학부', '농생명융합학부'],
        features: '뉴비(New飛) 프로그램, 전공박람회 등 전공 탐색 지원',
        admission: '무전공으로 입학, 1년 탐색 후 전공 선택'
      },
      '감성인지소프트웨어': {
        description: 'SW 융합연계전공으로 심리학과 컴퓨터공학의 융합 교육을 통해 감성을 인지하는 소프트웨어 전문가를 양성합니다.',
        careers: ['감성 AI 개발자', 'UX 연구원', '인간-컴퓨터 상호작용 전문가', '감성 데이터 분석가'],
        curriculum: ['심리학', '컴퓨터공학', '웹 프로그래밍', '알고리즘', '융합 프로젝트']
      }
    };

    const info = majorInfo[major];
    if (!info) {
      return `${major}에 대한 상세 정보를 준비 중입니다. 다른 전공에 대해 문의해주세요.`;
    }

    return `**${major}** 정보를 알려드릴게요!

📖 **전공 소개**: ${info.description}

💼 **주요 진로**: ${info.careers.join(', ')}

📚 **핵심 교과목**: ${info.curriculum.join(', ')}

${info.admission ? `🎓 **입학 방식**: ${info.admission}` : ''}

더 궁금한 점이 있으시면 언제든 물어보세요!`;
  }

  private async actionProvideCareerInfo(conversation: ConversationState): Promise<string> {
    const { riasecScores, recommendedMajors } = conversation.slots;
    
    if (!riasecScores || !recommendedMajors) {
      return `충남대학교 진로 정보를 제공하기 위해 먼저 성향 진단을 받아보시는 것을 추천합니다. 당신의 RIASEC 성향에 맞는 구체적인 진로 정보를 제공해드릴 수 있습니다.`;
    }

    const careerMapping: Record<string, any> = {
      '컴퓨터융합학부': {
        careers: ['AI 엔지니어', '소프트웨어 개발자', '데이터 사이언티스트', '정보보호 전문가'],
        companies: ['삼성전자', 'LG전자', '네이버', 'SK텔레콤', 'KT'],
        salary: '신입 연봉 4000-5500만원'
      },
      '창의융합대학': {
        careers: ['융합 전문가', '창의적 문제해결자', '혁신 기업가'],
        features: ['64개 전공 선택', '전공자율선택제'],
        advantage: '전공 경계를 넘나드는 창의융합 인재'
      }
    };

    let careerInfo = '**충남대학교 추천 전공별 진로**\n\n';
    recommendedMajors.forEach(major => {
      const info = careerMapping[major];
      if (info) {
        careerInfo += `🎯 **${major}**: ${info.careers?.join(', ') || '전문가'}\n`;
        if (info.companies) {
          careerInfo += `   주요 기업: ${info.companies.join(', ')}\n`;
        }
        if (info.salary) {
          careerInfo += `   예상 연봉: ${info.salary}\n`;
        }
        careerInfo += '\n';
      }
    });

    careerInfo += '충남대학교는 대기업, 공공기관, 연구소 등 다양한 분야로 진출하고 있으며, 전체 취업률 64.1%를 기록하고 있습니다!';

    return careerInfo;
  }

  private async actionProvideCurriculumInfo(conversation: ConversationState, majorName?: string): Promise<string> {
    const major = majorName || conversation.slots.majorInterest;
    
    const curriculumInfo: Record<string, any> = {
      '컴퓨터융합학부': {
        overview: '충남대학교 컴퓨터융합학부는 AI, 빅데이터, SW, 정보보호 핵심 기술 교육을 통한 SW 우수 인재 양성',
        features: ['27명 전임교수진', '학부생 600여명+', '대학원생 200여명+'],
        areas: ['인공지능', '데이터과학', '소프트웨어', 'IoT 임베디드시스템', '정보보호'],
        career: '삼성전자, LG전자, 네이버, SK텔레콤, KT, 은행권 등'
      },
      '감성인지소프트웨어': {
        overview: 'SW 융합연계전공으로 심리학과 컴퓨터공학의 융합 교육',
        year1: '심리학 개론, 생물심리학, 웹 프로그래밍, 컴퓨터 프로그래밍',
        year2: '광고심리학, 임상심리학, 알고리즘, SW종합설계',
        year3: '심리학-컴퓨터공학 융합 프로젝트'
      },
      '창의융합대학': {
        overview: '2025년 신설, 전공자율선택제 운영',
        features: ['1학년 전공 탐색', '2학년 진학시 64개 전공 선택', '뉴비(New飛) 프로그램'],
        departments: ['자율전공융합학부', '인문사회융합학부', '공학융합학부', '자연과학융합학부', '첨단융합학부', '농생명융합학부']
      }
    };

    const info = curriculumInfo[major || ''];
    if (!info) {
      return `충남대학교 ${major || '해당 전공'}의 상세 정보를 준비 중입니다. 컴퓨터융합학부, 창의융합대학, 감성인지소프트웨어 전공에 대해 문의해주세요.`;
    }

    if (major === '컴퓨터융합학부') {
      return `**충남대학교 컴퓨터융합학부**

🎯 **교육 목표**: ${info.overview}

👥 **규모**: ${info.features.join(', ')}

📚 **주요 교육 분야**: ${info.areas.join(', ')}

💼 **주요 진출 기업**: ${info.career}

충남대 컴퓨터융합학부는 4차산업혁명의 핵심 기술 교육을 통해 실무능력을 갖춘 전문가를 양성합니다!`;
    }

    if (major === '창의융합대학') {
      return `**충남대학교 창의융합대학 (2025년 신설)**

🎯 **특징**: ${info.overview}

🏫 **구성 학부**: ${info.departments.join(', ')}

📋 **교육 시스템**: ${info.features.join(', ')}

전공 초월 진로 탐색과 창의융합 교육을 통해 미래사회를 선도하는 자기주도적 인재를 양성합니다!`;
    }

    return `**${major}**

${info.overview}

1단계: ${info.year1}
2단계: ${info.year2}
3단계: ${info.year3}`;
  }

  private async actionCompareMajors(conversation: ConversationState): Promise<string> {
    const { recommendedMajors } = conversation.slots;
    
    if (!recommendedMajors || recommendedMajors.length < 2) {
      return `전공 비교를 위해 관심 있는 전공들을 알려주세요. 예: "컴퓨터공학과와 소프트웨어학과 비교해주세요"`;
    }

    const comparisons = [
      `**${recommendedMajors[0]} vs ${recommendedMajors[1]}**`,
      '',
      `🔍 **학습 초점**:`,
      `• ${recommendedMajors[0]}: 이론과 시스템 구조에 중점`,
      `• ${recommendedMajors[1]}: 실무와 응용 개발에 중점`,
      '',
      `💼 **진로 방향**:`,
      `• ${recommendedMajors[0]}: 연구개발, 시스템 엔지니어`,
      `• ${recommendedMajors[1]}: 제품 개발, 창업`,
      '',
      `당신의 성향을 고려할 때 두 전공 모두 적합하지만, 더 구체적인 관심사를 알려주시면 더 정확한 추천을 드릴 수 있습니다.`
    ];

    return comparisons.join('\n');
  }

  private async actionProvideSimilarCases(conversation: ConversationState): Promise<string> {
    const { riasecScores } = conversation.slots;
    
    if (!riasecScores) {
      return '유사 사례를 제공하기 위해 먼저 RIASEC 진단을 받아보세요.';
    }

    try {
      const feedback = await pineconeService.generateFeedbackFromSimilarCases(
        riasecScores,
        conversation.slots.recommendedMajors || []
      );
      
      return `**비슷한 성향의 선배들 경험담**\n\n${feedback}\n\n이런 사례들이 도움이 되시나요? 더 구체적인 질문이 있으시면 언제든 말씀해주세요!`;
    } catch (error) {
      return '유사 사례 정보를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  }

  private async actionAddressConcern(conversation: ConversationState, message: string): Promise<string> {
    try {
      const prompt = `
사용자가 다음과 같은 걱정이나 우려를 표현했습니다:
"${message}"

전공 선택에 대한 걱정을 가진 학생에게 다음 관점에서 격려하고 조언해주세요:
1. 걱정하는 것이 자연스럽다는 공감
2. 구체적이고 실용적인 해결 방안
3. 긍정적인 격려와 동기부여
4. 추가 도움 방법 안내

따뜻하고 전문적인 톤으로 3-4문장으로 답변해주세요.
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content || '걱정하지 마세요. 충분히 고민하고 계신 것 자체가 좋은 선택을 할 수 있는 첫걸음입니다.';
    } catch (error) {
      return '걱정되는 마음 충분히 이해합니다. 전공 선택은 중요한 결정이지만, 언제든 수정하고 발전시킬 수 있어요. 더 구체적으로 어떤 부분이 걱정되시는지 말씀해주시면 도움을 드릴게요.';
    }
  }

  private async actionGeneralResponse(conversation: ConversationState, message: string): Promise<string> {
    const { riasecScores, recommendedMajors } = conversation.slots;
    
    const contextPrompt = riasecScores ? 
      `사용자의 RIASEC 성향: ${JSON.stringify(riasecScores)}
추천 전공: ${recommendedMajors?.join(', ') || '없음'}

이 정보를 바탕으로 답변해주세요.` : '';

    const prompt = `
당신은 충남대학교 창의융합대학 전공 상담 AI입니다. 충남대학교 정보를 기반으로 사용자의 모든 질문에 자유롭고 도움이 되도록 답변해주세요.

질문: "${message}"

${contextPrompt}

충남대학교 기본 정보:
- **창의융합대학**: 2025년 신설, 6개 융합학부로 구성된 새로운 대학 (전공자율선택제)
- **전공자율선택제**: 창의융합대학 학생은 1학년 전공 탐색 후 2학년 진학 시 64개 전공 중 선택
- **컴퓨터융합학부**: 공과대학 소속, 기존 컴퓨터공학과에서 명칭 변경된 학부
- **취업률**: 전체 64.1% (2024년 기준)
- **주요 진출기업**: 삼성전자, LG전자, 네이버, SK텔레콤, KT 등

답변 지침:
1. 충남대학교 정보를 중심으로 답변 (창의융합대학과 컴퓨터융합학부는 서로 다른 조직임을 명확히 구분)
2. 창의융합대학의 전공자율선택제와 기존 학과들의 차이점 설명
3. 구체적인 충남대 취업 현황과 진출 기업 정보 제공
4. 충남대 특색 교육과정과 프로그램 소개
5. 자연스럽고 친근한 대화 스타일 사용
6. 필요시 충남대 입학 관련 정보도 제공
7. 답변 길이에 제한 없이 충분히 상세하게 설명
8. 창의적이고 유익한 답변 제공
    `;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 1000
      });

      return response.choices[0].message.content || '죄송합니다. 다시 한번 질문해주시겠어요?';
    } catch (error) {
      return '죄송합니다. 답변 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  }

  // Main conversation processing method
  async processMessage(
    sessionId: string,
    message: string,
    riasecScores?: RIASECScores,
    recommendedMajors?: string[]
  ): Promise<string> {
    try {
      // Initialize conversation if not exists
      if (!this.conversations.has(sessionId)) {
        this.conversations.set(sessionId, {
          sessionId,
          slots: { riasecScores, recommendedMajors },
          conversationStage: 'greeting',
          messageHistory: []
        });
      }

      const conversation = this.conversations.get(sessionId)!;
      
      // Update slots if provided
      if (riasecScores) {
        this.updateSlots(sessionId, { riasecScores });
      }
      if (recommendedMajors) {
        this.updateSlots(sessionId, { recommendedMajors });
      }

      // Add user message to history
      conversation.messageHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // 제한적인 의도 분류 시스템을 우회하고 바로 자유로운 응답 생성
      const response = await this.actionGeneralResponse(conversation, message);

      // Add AI response to history
      conversation.messageHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error('Rasa-like processing error:', error);
      return '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  }

  // Get conversation state
  getConversation(sessionId: string): ConversationState | undefined {
    return this.conversations.get(sessionId);
  }

  // Clear conversation
  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }
}

export const rasaService = new RasaLikeService();