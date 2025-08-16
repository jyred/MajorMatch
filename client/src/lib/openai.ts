// OpenAI integration utilities for RIASEC assessment system
// This file contains helper functions for formatting prompts and processing responses

export interface RIASECAnalysisRequest {
  responses: Record<number, number>;
}

export interface RIASECAnalysisResponse {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface MajorRecommendationRequest {
  riasecScores: RIASECAnalysisResponse;
}

export interface MajorRecommendationResponse {
  recommendations: Array<{
    major: string;
    matchRate: number;
    reason: string;
  }>;
  explanation: string;
}

// Format RIASEC analysis prompt for OpenAI
export function formatRIASECPrompt(responses: Record<number, number>): string {
  return `다음은 사용자의 RIASEC 성향 진단 응답입니다. 각 질문에 대한 답변(1-5 척도)을 분석하여 RIASEC 6개 유형별 점수를 0-1 사이의 값으로 정확히 계산해주세요.

응답 데이터: ${JSON.stringify(responses)}

RIASEC 유형별 특성:
- R (Realistic): 실용적, 기계나 도구 다루기 선호, 손으로 만드는 작업 좋아함
- I (Investigative): 탐구적, 분석과 연구 선호, 논리적 사고와 문제해결 중시
- A (Artistic): 예술적, 창의적 표현 선호, 독창적이고 자유로운 환경 추구
- S (Social): 사회적, 사람들과의 교류 선호, 협력과 도움 주기를 중시
- E (Enterprising): 진취적, 리더십과 경영 선호, 경쟁적 환경에서 성과 추구
- C (Conventional): 관습적, 체계적이고 규칙적인 업무 선호, 안정성과 정확성 중시

점수 계산 시 고려사항:
- 각 응답의 점수(1-5)를 해당 유형의 강도로 반영
- 총합이 1.0이 되도록 정규화하지 말고, 각 유형별로 독립적으로 0-1 사이 값으로 계산
- 높은 점수(4-5)는 해당 유형에 대한 강한 선호를 의미
- 낮은 점수(1-2)는 해당 유형에 대한 약한 관심을 의미

JSON 형식으로만 응답해주세요:`;
}

// Format major recommendation prompt for OpenAI
export function formatMajorRecommendationPrompt(riasecScores: RIASECAnalysisResponse): string {
  return `다음 RIASEC 성향 분석 결과를 바탕으로 충남대학교 창의융합대학의 전공을 추천해주세요.

RIASEC 점수: ${JSON.stringify(riasecScores)}

충남대학교 정보:
- 창의융합대학: 2025년 신설 독립 단과대학, 전공자율선택제 운영 (1학년 전공 탐색 후 2학년 진학시 64개 전공 선택)
- 컴퓨터융합학부: 공과대학 소속, 기존 컴퓨터공학과에서 명칭 변경, AI·빅데이터·SW·정보보호 교육
- 주요 진출기업: 삼성전자, LG전자, 네이버, SK텔레콤, KT 등

충남대학교 전공 목록과 특성:
- 컴퓨터융합학부: AI, 소프트웨어, 데이터과학, 정보보호, IoT (I, R 중심)
- 감성인지소프트웨어전공: 심리학+컴퓨터공학 융합, UX 연구 (A, I, S 중심)
- 정보통계학과: 빅데이터 분석, 통계적 추론 (I, C 중심)
- 산업공학과: 생산관리, 품질관리, 시스템 최적화 (E, I, C 중심)
- 건축학과: 건축 설계, 공간 디자인 (A, R, E 중심)
- 심리학과: 인간 행동 연구, 상담 (S, I 중심)
- 경영학과: 경영전략, 마케팅, 리더십 (E, S, C 중심)
- 디자인학과: 시각디자인, 산업디자인 (A, E 중심)

추천 기준:
- 사용자의 가장 높은 RIASEC 점수 2-3개를 중심으로 분석
- 각 전공의 핵심 RIASEC 유형과의 매칭도 계산
- 충남대학교 특색 교육과정과 진출 현황 고려
- 매칭률은 퍼센트로 표시 (70% 이상만 추천)
- 추천 이유는 충남대 전공의 특징과 함께 구체적이고 개인화된 설명 제공

Chain-of-Thought 방식으로 분석한 후 JSON 형식으로 응답해주세요:`;
}

// Parse and validate RIASEC scores from OpenAI response
export function parseRIASECResponse(response: string): RIASECAnalysisResponse {
  try {
    const parsed = JSON.parse(response);
    
    // Validate that all required fields exist and are numbers between 0-1
    const requiredFields = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
    for (const field of requiredFields) {
      if (!(field in parsed) || typeof parsed[field] !== 'number' || parsed[field] < 0 || parsed[field] > 1) {
        throw new Error(`Invalid ${field} score`);
      }
    }
    
    return parsed as RIASECAnalysisResponse;
  } catch (error) {
    throw new Error('Invalid RIASEC response format');
  }
}

// Parse and validate major recommendations from OpenAI response
export function parseMajorRecommendationResponse(response: string): MajorRecommendationResponse {
  try {
    const parsed = JSON.parse(response);
    
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid recommendations format');
    }
    
    if (!parsed.explanation || typeof parsed.explanation !== 'string') {
      throw new Error('Invalid explanation format');
    }
    
    // Validate each recommendation
    for (const rec of parsed.recommendations) {
      if (!rec.major || !rec.reason || typeof rec.matchRate !== 'number') {
        throw new Error('Invalid recommendation format');
      }
    }
    
    return parsed as MajorRecommendationResponse;
  } catch (error) {
    throw new Error('Invalid major recommendation response format');
  }
}

// Generate contextual chat prompt
export function formatChatPrompt(
  message: string, 
  riasecScores?: RIASECAnalysisResponse | null,
  recommendedMajors?: string[] | null
): string {
  let context = "당신은 충남대학교 창의융합학부 전공 상담 AI입니다.\n";
  context += "학생들의 전공 선택을 도와주며, 친근하고 전문적인 조언을 제공해주세요.\n\n";
  
  if (riasecScores) {
    context += `학생의 RIASEC 성향 분석 결과:\n${JSON.stringify(riasecScores, null, 2)}\n\n`;
  }
  
  if (recommendedMajors && recommendedMajors.length > 0) {
    context += `추천된 전공: ${recommendedMajors.join(', ')}\n\n`;
  }
  
  context += "이 정보를 바탕으로 학생의 질문에 맞춤형 답변을 제공해주세요.\n";
  context += "답변은 한국어로, 대학생에게 적합한 톤으로 작성해주세요.\n\n";
  context += `학생 질문: ${message}`;
  
  return context;
}

// Quality check for AI responses
export function validateAIResponse(response: string): boolean {
  if (!response || response.trim().length < 10) {
    return false;
  }
  
  // Check for Korean content (basic validation)
  const koreanRegex = /[가-힣]/;
  if (!koreanRegex.test(response)) {
    return false;
  }
  
  return true;
}
