import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ''
});

export interface ConversationTopic {
  category: string;
  topics: string[];
  questions: string[];
}

export class ConversationEnhancer {
  private readonly conversationTopics: ConversationTopic[] = [
    {
      category: "전공 탐색",
      topics: ["전공별 특징", "커리큘럼", "교수진", "연구실", "졸업 요건"],
      questions: [
        "어떤 분야에서 일하는 모습을 상상해보신 적 있나요?",
        "평소에 관심 있던 기술이나 분야가 있으신가요?",
        "어떤 프로젝트를 해보고 싶으신가요?"
      ]
    },
    {
      category: "진로와 취업",
      topics: ["취업 전망", "대기업 vs 스타트업", "대학원 진학", "창업", "해외 취업"],
      questions: [
        "졸업 후 어떤 환경에서 일하고 싶으신가요?",
        "10년 후 본인의 모습을 어떻게 그려보시나요?",
        "어떤 규모의 회사에서 일하고 싶으신가요?"
      ]
    },
    {
      category: "대학 생활",
      topics: ["동아리", "학회", "인턴십", "공모전", "교환학생", "봉사활동"],
      questions: [
        "대학 생활에서 가장 중요하게 생각하는 것은 무엇인가요?",
        "어떤 경험을 통해 성장하고 싶으신가요?",
        "평소 관심 있는 활동이나 취미가 있나요?"
      ]
    },
    {
      category: "개인적 관심사",
      topics: ["취미", "특기", "성격", "가치관", "학습 스타일"],
      questions: [
        "평소에 시간 가는 줄 모르고 하는 일이 있나요?",
        "어떤 상황에서 가장 집중이 잘 되시나요?",
        "팀 프로젝트와 개인 작업 중 어느 쪽을 선호하시나요?"
      ]
    },
    {
      category: "실무와 기술",
      topics: ["프로그래밍", "디자인", "데이터 분석", "하드웨어", "연구"],
      questions: [
        "실제로 만들어보고 싶은 것이 있나요?",
        "어떤 문제를 해결해보고 싶으신가요?",
        "기술적인 것과 창의적인 것 중 어느 쪽에 더 흥미가 있으신가요?"
      ]
    }
  ];

  // 대화 주제 제안
  suggestTopics(currentStage: string, discussedTopics: string[]): string[] {
    const availableTopics = this.conversationTopics
      .flatMap(category => category.topics)
      .filter(topic => !discussedTopics.includes(topic));

    return availableTopics.slice(0, 3);
  }

  // 대화를 확장할 수 있는 질문 생성
  async generateFollowUpQuestions(
    message: string, 
    userInterests: string[], 
    context: string
  ): Promise<string[]> {
    try {
      const prompt = `
사용자 메시지: "${message}"
사용자 관심사: ${userInterests.join(', ')}
대화 맥락: ${context}

위 정보를 바탕으로 자연스럽게 대화를 이어갈 수 있는 3개의 질문을 JSON 배열로 생성해주세요.
질문들은 다음 조건을 만족해야 합니다:
1. 사용자가 더 많이 이야기할 수 있도록 개방형 질문
2. 전공이나 진로와 연관성 있는 내용
3. 개인적 경험이나 생각을 묻는 질문
4. 자연스럽고 부담스럽지 않은 어조

결과는 다음 형식으로 JSON 배열로만 응답해주세요:
["질문1", "질문2", "질문3"]
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '[]');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Follow-up question generation error:', error);
      return this.getDefaultFollowUpQuestions();
    }
  }

  // 기본 후속 질문들
  private getDefaultFollowUpQuestions(): string[] {
    return [
      "그 부분에 대해 더 자세히 말씀해 주실 수 있나요?",
      "어떤 점이 가장 관심 있게 느껴지시나요?",
      "실제로 경험해보신 적이 있으신가요?"
    ];
  }

  // 대화 깊이 평가
  evaluateConversationDepth(conversationHistory: any[]): {
    depth: 'shallow' | 'moderate' | 'deep';
    suggestions: string[];
  } {
    const messageCount = conversationHistory.length;
    const userMessages = conversationHistory.filter(msg => msg.role === 'user');
    const avgMessageLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;

    let depth: 'shallow' | 'moderate' | 'deep' = 'shallow';
    let suggestions: string[] = [];

    if (messageCount > 10 && avgMessageLength > 50) {
      depth = 'deep';
      suggestions = [
        "구체적인 계획이나 목표에 대해 더 논의해보세요",
        "실제 경험담을 공유해보세요"
      ];
    } else if (messageCount > 5 && avgMessageLength > 30) {
      depth = 'moderate';
      suggestions = [
        "개인적인 경험에 대해 물어보세요",
        "구체적인 예시를 요청해보세요"
      ];
    } else {
      suggestions = [
        "개방형 질문으로 더 많은 정보를 얻어보세요",
        "관심사에 대해 더 깊이 탐구해보세요"
      ];
    }

    return { depth, suggestions };
  }

  // 대화 다양성 확인
  checkConversationDiversity(discussedTopics: string[]): {
    diversity: 'low' | 'medium' | 'high';
    unexploredAreas: string[];
  } {
    const totalCategories = this.conversationTopics.length;
    const coveredCategories = this.conversationTopics.filter(category =>
      category.topics.some(topic => discussedTopics.includes(topic))
    ).length;

    const diversityRatio = coveredCategories / totalCategories;
    
    let diversity: 'low' | 'medium' | 'high' = 'low';
    if (diversityRatio > 0.7) diversity = 'high';
    else if (diversityRatio > 0.4) diversity = 'medium';

    const unexploredAreas = this.conversationTopics
      .filter(category => !category.topics.some(topic => discussedTopics.includes(topic)))
      .map(category => category.category);

    return { diversity, unexploredAreas };
  }
}

export const conversationEnhancer = new ConversationEnhancer();