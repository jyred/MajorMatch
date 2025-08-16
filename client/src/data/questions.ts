export interface AssessmentQuestion {
  id: number;
  text: string;
  type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // Realistic (R) - 실용적
  { id: 1, text: "기계나 도구를 다루는 작업에 흥미를 느끼시나요?", type: "R" },
  { id: 2, text: "손으로 무언가를 만들거나 조립하는 것을 좋아하시나요?", type: "R" },
  { id: 3, text: "야외에서 활동하는 것을 선호하시나요?", type: "R" },
  
  // Investigative (I) - 탐구적
  { id: 4, text: "복잡한 문제를 논리적으로 분석하는 것을 즐기시나요?", type: "I" },
  { id: 5, text: "새로운 지식을 탐구하고 연구하는 것에 흥미가 있으신가요?", type: "I" },
  { id: 6, text: "과학이나 수학 관련 과목을 좋아하시나요?", type: "I" },
  
  // Artistic (A) - 예술적
  { id: 7, text: "창작 활동이나 예술적 표현을 즐기시나요?", type: "A" },
  { id: 8, text: "독창적이고 새로운 아이디어를 생각해내는 것을 좋아하시나요?", type: "A" },
  { id: 9, text: "미술, 음악, 문학 등 예술 분야에 관심이 있으신가요?", type: "A" },
  
  // Social (S) - 사회적
  { id: 10, text: "다른 사람들을 도와주는 일에 보람을 느끼시나요?", type: "S" },
  { id: 11, text: "사람들과 대화하고 교류하는 것을 즐기시나요?", type: "S" },
  { id: 12, text: "팀워크를 중시하고 협업을 선호하시나요?", type: "S" },
  
  // Enterprising (E) - 진취적
  { id: 13, text: "리더십을 발휘하고 다른 사람들을 이끄는 것을 좋아하시나요?", type: "E" },
  { id: 14, text: "경쟁적인 환경에서 성과를 내는 것에 자신이 있으신가요?", type: "E" },
  { id: 15, text: "사업이나 경영 분야에 관심이 있으신가요?", type: "E" },
  
  // Conventional (C) - 관습적
  { id: 16, text: "체계적이고 규칙적인 업무를 선호하시나요?", type: "C" },
  { id: 17, text: "정확성과 세부사항을 중시하시나요?", type: "C" },
  { id: 18, text: "안정적이고 예측 가능한 환경을 선호하시나요?", type: "C" }
];

export const answerOptions = [
  { value: 5, label: "매우 그렇다" },
  { value: 4, label: "그렇다" },
  { value: 3, label: "보통이다" },
  { value: 2, label: "그렇지 않다" },
  { value: 1, label: "전혀 그렇지 않다" }
];
