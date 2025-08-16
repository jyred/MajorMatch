export interface Major {
  id: string;
  name: string;
  description: string;
  riasecTypes: string[];
  careers: string[];
  curriculum: string[];
}

export const majors: Major[] = [
  {
    id: "computer-science",
    name: "컴퓨터공학과",
    description: "소프트웨어 개발, 알고리즘 설계, 시스템 구축 등 컴퓨터 과학의 전반적인 분야를 다룹니다.",
    riasecTypes: ["I", "R"],
    careers: ["소프트웨어 개발자", "시스템 엔지니어", "데이터 사이언티스트", "AI 연구원"],
    curriculum: ["프로그래밍", "자료구조", "알고리즘", "데이터베이스", "인공지능"]
  },
  {
    id: "software",
    name: "소프트웨어학과", 
    description: "소프트웨어 설계, 개발, 유지보수에 특화된 실무 중심의 교육을 제공합니다.",
    riasecTypes: ["I", "R", "A"],
    careers: ["웹 개발자", "모바일 앱 개발자", "게임 개발자", "소프트웨어 아키텍트"],
    curriculum: ["웹 프로그래밍", "모바일 개발", "소프트웨어 공학", "UI/UX 디자인"]
  },
  {
    id: "statistics",
    name: "정보통계학과",
    description: "빅데이터 분석, 통계적 추론, 데이터 마이닝 등 데이터 과학 분야를 전문으로 합니다.",
    riasecTypes: ["I", "C"],
    careers: ["데이터 분석가", "통계학자", "시장조사원", "리스크 매니저"],
    curriculum: ["통계학", "데이터 마이닝", "머신러닝", "빅데이터 분석", "R/Python"]
  },
  {
    id: "digital-media",
    name: "디지털미디어학과",
    description: "디지털 콘텐츠 제작, 멀티미디어 기술, 인터랙티브 미디어 등을 다룹니다.",
    riasecTypes: ["A", "I", "E"],
    careers: ["게임 디자이너", "웹 디자이너", "영상 편집자", "UX/UI 디자이너"],
    curriculum: ["디지털 아트", "3D 모델링", "게임 디자인", "영상 제작", "인터랙션 디자인"]
  },
  {
    id: "industrial-engineering",
    name: "산업공학과",
    description: "생산성 향상, 품질 관리, 시스템 최적화 등 산업 시스템을 효율적으로 설계합니다.",
    riasecTypes: ["E", "I", "C"],
    careers: ["생산관리자", "품질관리자", "경영컨설턴트", "프로젝트 매니저"],
    curriculum: ["경영과학", "품질관리", "생산계획", "물류관리", "시스템 분석"]
  },
  {
    id: "architecture",
    name: "건축학과",
    description: "건축 설계, 도시 계획, 공간 디자인 등 건축 전반의 이론과 실무를 학습합니다.",
    riasecTypes: ["A", "R", "E"],
    careers: ["건축사", "건축 설계사", "인테리어 디자이너", "도시계획가"],
    curriculum: ["건축 설계", "구조역학", "건축사", "도시계획", "건축 재료"]
  },
  {
    id: "urban-planning",
    name: "도시계획학과", 
    description: "도시 개발, 지역 계획, 교통 계획 등 도시 환경의 체계적 계획을 다룹니다.",
    riasecTypes: ["S", "E", "I"],
    careers: ["도시계획가", "교통계획가", "지역개발 전문가", "환경계획가"],
    curriculum: ["도시설계", "교통계획", "환경계획", "GIS", "지역개발론"]
  },
  {
    id: "environmental-engineering",
    name: "환경공학과",
    description: "환경 보호, 오염 방지, 지속가능한 개발 등 환경 문제 해결을 위한 공학을 학습합니다.",
    riasecTypes: ["I", "S", "R"],
    careers: ["환경 엔지니어", "환경 컨설턴트", "환경 연구원", "환경영향평가사"],
    curriculum: ["환경화학", "수처리공학", "대기오염제어", "폐기물처리", "환경영향평가"]
  },
  {
    id: "materials-science",
    name: "신소재공학과",
    description: "첨단 소재 개발, 나노 기술, 재료 특성 분석 등 신소재 분야를 연구합니다.",
    riasecTypes: ["I", "R"],
    careers: ["소재 연구원", "품질관리자", "기술개발자", "소재 엔지니어"],
    curriculum: ["재료과학", "나노기술", "세라믹공학", "금속공학", "복합재료"]
  },
  {
    id: "chemical-engineering",
    name: "화학공학과",
    description: "화학 반응, 공정 설계, 제품 개발 등 화학 공업의 이론과 응용을 다룹니다.",
    riasecTypes: ["I", "R", "C"],
    careers: ["화학 엔지니어", "공정 엔지니어", "연구개발자", "품질관리자"],
    curriculum: ["화학공학", "반응공학", "분리공정", "공정제어", "화학공정설계"]
  }
];
