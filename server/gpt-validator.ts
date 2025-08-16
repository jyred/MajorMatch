import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  confidence: number;
}

interface RiasecValidationData {
  responses: Record<string, number>;
  riasecScores: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  recommendedMajors: string[];
}

interface SurveyValidationData {
  assessmentId: string;
  overallSatisfaction: number;
  accuracyRating: number;
  usefulnessRating: number;
  selectedMajor?: string;
  feedback?: string;
}

export class GPTValidator {
  // RIASEC 진단 결과 무결성 검사
  async validateRiasecAssessment(data: RiasecValidationData): Promise<ValidationResult> {
    try {
      const prompt = `다음 RIASEC 성향 진단 결과의 무결성을 검사해주세요:

응답 데이터: ${JSON.stringify(data.responses)}
계산된 RIASEC 점수: ${JSON.stringify(data.riasecScores)}
추천 전공: ${JSON.stringify(data.recommendedMajors)}

검사 항목:
1. 응답 데이터가 1-5 범위 내에 있는지
2. RIASEC 점수가 0-1 범위 내에 있는지  
3. 추천 전공이 충남대학교 실제 전공인지
4. 점수와 추천 전공의 논리적 일관성
5. 데이터 형식의 정확성

다음 JSON 형식으로 응답해주세요:
{
  "isValid": boolean,
  "issues": ["발견된 문제점들"],
  "suggestions": ["개선 제안사항들"], 
  "confidence": 0-1사이의 신뢰도
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "당신은 데이터 무결성 검사 전문가입니다. RIASEC 진단 결과의 정확성과 일관성을 검증해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return {
        isValid: result.isValid || false,
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error("GPT validation error:", error);
      return {
        isValid: false,
        issues: ["GPT 검증 중 오류가 발생했습니다"],
        suggestions: ["시스템 관리자에게 문의하세요"],
        confidence: 0
      };
    }
  }

  // 만족도 조사 데이터 무결성 검사
  async validateSatisfactionSurvey(data: SurveyValidationData): Promise<ValidationResult> {
    try {
      const prompt = `다음 만족도 조사 데이터의 무결성을 검사해주세요:

만족도 조사 데이터:
- 전체 만족도: ${data.overallSatisfaction}
- 정확도 평가: ${data.accuracyRating}
- 유용성 평가: ${data.usefulnessRating}
- 선택한 전공: ${data.selectedMajor || "없음"}
- 피드백: ${data.feedback || "없음"}

검사 항목:
1. 평점이 1-5 범위 내에 있는지
2. 선택한 전공이 실제 전공명인지
3. 피드백 내용의 적절성
4. 데이터 일관성 (높은 만족도와 낮은 평가의 모순 등)
5. 필수 필드 누락 여부

다음 JSON 형식으로 응답해주세요:
{
  "isValid": boolean,
  "issues": ["발견된 문제점들"],
  "suggestions": ["개선 제안사항들"],
  "confidence": 0-1사의 신뢰도
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: "당신은 데이터 무결성 검사 전문가입니다. 사용자 만족도 조사 데이터를 검증해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return {
        isValid: result.isValid || false,
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error("GPT validation error:", error);
      return {
        isValid: false,
        issues: ["GPT 검증 중 오류가 발생했습니다"],
        suggestions: ["시스템 관리자에게 문의하세요"],
        confidence: 0
      };
    }
  }

  // 전공 추천 일관성 검사
  async validateMajorRecommendations(riasecScores: any, recommendedMajors: string[]): Promise<ValidationResult> {
    try {
      const prompt = `다음 RIASEC 점수에 따른 전공 추천의 일관성을 검사해주세요:

RIASEC 점수: ${JSON.stringify(riasecScores)}
추천된 전공들: ${JSON.stringify(recommendedMajors)}

충남대학교 창의융합학부 실제 전공 목록:
- 컴퓨터공학과 (R,I 높음)
- 소프트웨어학과 (I,C 높음)  
- 정보통계학과 (I,C 높음)
- 디지털미디어학과 (A,I 높음)
- 산업공학과 (I,E 높음)
- 건축학과 (R,A 높음)
- 도시계획학과 (I,S 높음)
- 환경공학과 (I,S 높음)
- 신소재공학과 (R,I 높음)
- 화학공학과 (R,I 높음)

검사 항목:
1. 추천 전공이 실제 존재하는 전공인지
2. RIASEC 점수와 전공 특성의 매칭 적절성
3. 추천 전공 개수의 적절성 (보통 3-5개)
4. 점수 대비 추천의 논리적 일관성

다음 JSON 형식으로 응답해주세요:
{
  "isValid": boolean,
  "issues": ["발견된 문제점들"],
  "suggestions": ["개선 제안사항들"],
  "confidence": 0-1사이의 신뢰도
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "당신은 전공 추천 시스템 검증 전문가입니다. RIASEC 기반 전공 추천의 논리적 일관성을 검사해주세요."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return {
        isValid: result.isValid || false,
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error("GPT validation error:", error);
      return {
        isValid: false,
        issues: ["GPT 검증 중 오류가 발생했습니다"],
        suggestions: ["시스템 관리자에게 문의하세요"],
        confidence: 0
      };
    }
  }

  // 사용자 데이터 일관성 검사
  async validateUserData(userData: any): Promise<ValidationResult> {
    try {
      const prompt = `다음 사용자 데이터의 무결성을 검사해주세요:

사용자 데이터: ${JSON.stringify(userData)}

검사 항목:
1. 학번 형식 (YYYY + 5자리 숫자)
2. 사용자명과 비밀번호 보안 요구사항
3. 이메일 형식 (선택사항)
4. 필수 필드 존재 여부
5. 데이터 타입 정확성

다음 JSON 형식으로 응답해주세요:
{
  "isValid": boolean,
  "issues": ["발견된 문제점들"],
  "suggestions": ["개선 제안사항들"],
  "confidence": 0-1사이의 신뢰도
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "당신은 사용자 데이터 검증 전문가입니다. 대학생 사용자 정보의 형식과 무결성을 검사해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return {
        isValid: result.isValid || false,
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error("GPT validation error:", error);
      return {
        isValid: false,
        issues: ["GPT 검증 중 오류가 발생했습니다"],
        suggestions: ["시스템 관리자에게 문의하세요"],
        confidence: 0
      };
    }
  }
}

export const gptValidator = new GPTValidator();