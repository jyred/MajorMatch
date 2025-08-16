import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Users, Lightbulb, Target, Zap, Brain, Settings } from "lucide-react";

export default function RiasecInfo() {
  const riasecTypes = [
    {
      code: "R",
      name: "현실형",
      englishName: "Realistic",
      description: "손을 쓰는 활동 선호, 도구·기계·자연 환경 다루기 좋아함",
      examples: ["엔지니어", "정비사", "건설 노동자", "조경사"],
      color: "bg-blue-500",
      icon: Settings
    },
    {
      code: "I", 
      name: "탐구형",
      englishName: "Investigative",
      description: "지적 호기심, 자료 수집·분석·문제 해결 선호",
      examples: ["연구원", "의사", "데이터 분석가", "과학자"],
      color: "bg-purple-500",
      icon: Brain
    },
    {
      code: "A",
      name: "예술형", 
      englishName: "Artistic",
      description: "창의적 표현 선호, 자유로운 구조·형식 선호",
      examples: ["디자이너", "작가", "음악가", "예술가"],
      color: "bg-pink-500",
      icon: Lightbulb
    },
    {
      code: "S",
      name: "사회형",
      englishName: "Social", 
      description: "사람과 상호작용 선호, 교육·상담·돌봄에 관심",
      examples: ["교사", "심리상담사", "간호사", "사회복지사"],
      color: "bg-green-500",
      icon: Users
    },
    {
      code: "E",
      name: "진취형",
      englishName: "Enterprising",
      description: "리더십·설득력·목표 지향형, 경영·영업·정치 활동 선호", 
      examples: ["경영자", "영업 사원", "정치인", "부동산 중개인"],
      color: "bg-orange-500",
      icon: Target
    },
    {
      code: "C",
      name: "관습형",
      englishName: "Conventional",
      description: "체계적·논리적 업무 선호, 자료 정리·문서화·규칙 준수",
      examples: ["회계사", "사무원", "은행 직원", "행정직"],
      color: "bg-gray-500", 
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">RIASEC 모델이란?</h1>
          <p className="text-lg text-neutral-600 leading-relaxed">
            미국 심리학자 존 L. 홀랜드(John L. Holland)가 제안한 직업 성격 유형 이론입니다. 
            개인의 흥미·성격 특성과 직업 환경이 잘 맞을 때 직업 만족도와 성과가 높다는 이론을 바탕으로 합니다.
          </p>
        </div>

        {/* RIASEC Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">RIASEC 육각형 모델</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-neutral-700 mb-4">
                  RIASEC 유형은 육각형 모형으로 배치되어, 이웃한 유형일수록 유사도가 높고 
                  맞은편에 있을수록 차이가 큽니다.
                </p>
                <div className="bg-neutral-100 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">인접성 관계</h3>
                  <ul className="text-sm text-neutral-700 space-y-1">
                    <li>• 현실형(R) ↔ 탐구형(I) ↔ 예술형(A)</li>
                    <li>• 예술형(A) ↔ 사회형(S) ↔ 진취형(E)</li>
                    <li>• 진취형(E) ↔ 관습형(C) ↔ 현실형(R)</li>
                  </ul>
                  <h3 className="font-semibold mt-4 mb-3">대립성 관계</h3>
                  <ul className="text-sm text-neutral-700 space-y-1">
                    <li>• 현실형(R) ↔ 사회형(S)</li>
                    <li>• 탐구형(I) ↔ 진취형(E)</li>
                    <li>• 예술형(A) ↔ 관습형(C)</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-64 h-64">
                  {/* Hexagon visualization */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <polygon
                      points="100,20 170,60 170,140 100,180 30,140 30,60"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                    />
                    {/* RIASEC labels */}
                    <text x="100" y="15" textAnchor="middle" className="text-sm font-bold fill-purple-600">I</text>
                    <text x="175" y="65" textAnchor="middle" className="text-sm font-bold fill-pink-600">A</text>
                    <text x="175" y="145" textAnchor="middle" className="text-sm font-bold fill-green-600">S</text>
                    <text x="100" y="195" textAnchor="middle" className="text-sm font-bold fill-orange-600">E</text>
                    <text x="25" y="145" textAnchor="middle" className="text-sm font-bold fill-gray-600">C</text>
                    <text x="25" y="65" textAnchor="middle" className="text-sm font-bold fill-blue-600">R</text>
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIASEC Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">6가지 성격 유형</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riasecTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card key={type.code} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mr-4`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900">
                          {type.name} ({type.code})
                        </h3>
                        <p className="text-sm text-neutral-600">{type.englishName}</p>
                      </div>
                    </div>
                    <p className="text-neutral-700 mb-4 text-sm leading-relaxed">
                      {type.description}
                    </p>
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-800 mb-2">예시 직업</h4>
                      <div className="flex flex-wrap gap-1">
                        {type.examples.map((example) => (
                          <span
                            key={example}
                            className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded text-xs"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How to Use */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">RIASEC 활용 방법</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">진단 받기</h3>
                <p className="text-neutral-700 text-sm">
                  간단한 질문들을 통해 자신의 RIASEC 성향을 파악합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">결과 분석</h3>
                <p className="text-neutral-700 text-sm">
                  상위 2-3개 유형을 조합해 자신만의 프로파일을 확인합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">전공 선택</h3>
                <p className="text-neutral-700 text-sm">
                  AI 추천을 바탕으로 적합한 전공과 진로를 탐색합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Profile */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">프로파일 해석 예시</h2>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg border border-pink-200">
              <h3 className="font-bold text-lg mb-3 text-purple-800">
                A(예술형) - I(탐구형) - S(사회형) 상위순
              </h3>
              <p className="text-purple-700 mb-4">
                창의적이면서도 지적 호기심이 강하고, 사람과 교류하는 데서 만족을 느끼는 유형
              </p>
              <div>
                <h4 className="font-semibold mb-2 text-purple-800">추천 직업</h4>
                <div className="flex flex-wrap gap-2">
                  {["UX 디자이너", "과학 커뮤니케이터", "교육 콘텐츠 기획자", "디지털미디어 전문가"].map((job) => (
                    <span key={job} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {job}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/assessment">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
              나의 RIASEC 성향 진단하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}