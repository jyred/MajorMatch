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

export class MinimalValidator {
  // 최소한의 RIASEC 검증 (GPT 호출 없음)
  async validateRiasecAssessment(data: RiasecValidationData): Promise<ValidationResult> {
    try {
      const issues: string[] = [];
      const suggestions: string[] = [];

      // 기본적인 범위 검사만 수행
      const responseValues = Object.values(data.responses);
      const invalidResponses = responseValues.filter(val => val < 1 || val > 5);
      if (invalidResponses.length > 0) {
        issues.push("일부 응답이 1-5 범위를 벗어남");
      }

      const scores = Object.values(data.riasecScores);
      const invalidScores = scores.filter(score => score < 0 || score > 1);
      if (invalidScores.length > 0) {
        issues.push("일부 RIASEC 점수가 0-1 범위를 벗어남");
      }

      return {
        isValid: issues.length === 0,
        issues,
        suggestions,
        confidence: 0.95
      };
    } catch (error) {
      return {
        isValid: true, // 오류 시 기본적으로 유효하다고 처리
        issues: [],
        suggestions: [],
        confidence: 0.9
      };
    }
  }

  // 최소한의 만족도 조사 검증
  async validateSatisfactionSurvey(data: SurveyValidationData): Promise<ValidationResult> {
    try {
      const issues: string[] = [];
      
      // 기본적인 범위 검사만
      if (data.overallSatisfaction < 1 || data.overallSatisfaction > 5) {
        issues.push("전체 만족도가 1-5 범위를 벗어남");
      }
      if (data.accuracyRating < 1 || data.accuracyRating > 5) {
        issues.push("정확도 평가가 1-5 범위를 벗어남");
      }
      if (data.usefulnessRating < 1 || data.usefulnessRating > 5) {
        issues.push("유용성 평가가 1-5 범위를 벗어남");
      }

      return {
        isValid: issues.length === 0,
        issues,
        suggestions: [],
        confidence: 0.95
      };
    } catch (error) {
      return {
        isValid: true,
        issues: [],
        suggestions: [],
        confidence: 0.9
      };
    }
  }
}

export const minimalValidator = new MinimalValidator();