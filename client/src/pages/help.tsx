import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, MessageCircle, BarChart3, Users, Lightbulb, Database, Bot } from "lucide-react";

export default function Help() {
  const steps = [
    {
      title: "1단계: RIASEC 성향 진단",
      description: "간단한 질문들에 답하여 당신의 성향을 파악하세요",
      icon: CheckCircle,
      color: "bg-blue-500"
    },
    {
      title: "2단계: AI 전공 추천",
      description: "OpenAI GPT-4o가 당신의 성향에 맞는 전공을 추천합니다",
      icon: BarChart3,
      color: "bg-green-500"
    },
    {
      title: "3단계: 유사 사례 확인",
      description: "비슷한 성향의 선배들의 경험담을 확인하세요",
      icon: Users,
      color: "bg-purple-500"
    },
    {
      title: "4단계: AI 상담 받기",
      description: "궁금한 점이나 고민을 AI 상담사에게 물어보세요",
      icon: MessageCircle,
      color: "bg-orange-500"
    }
  ];

  const features = [
    {
      title: "RIASEC 성향 진단",
      description: "홀랜드의 직업 성격 유형 이론을 바탕으로 한 과학적 진단",
      icon: CheckCircle,
      details: [
        "6가지 성격 유형 (현실형, 탐구형, 예술형, 사회형, 진취형, 관습형)",
        "개인별 맞춤 분석 결과 제공",
        "시각적 차트로 성향 비교"
      ]
    },
    {
      title: "AI 기반 전공 추천",
      description: "OpenAI GPT-4o를 활용한 개인 맞춤형 전공 추천 시스템",
      icon: Lightbulb,
      details: [
        "창의융합학부 10개 전공 데이터베이스",
        "성향별 적합도 분석",
        "상세한 추천 이유 설명"
      ]
    },
    {
      title: "벡터 기반 유사 사례 검색",
      description: "Pinecone 벡터 데이터베이스로 비슷한 성향의 사례를 찾아드립니다",
      icon: Database,
      details: [
        "실제 선배들의 전공 선택 경험담",
        "만족도 및 진로 정보 제공",
        "AI 임베딩을 통한 정확한 유사성 매칭"
      ]
    },
    {
      title: "지능형 상담 챗봇",
      description: "Rasa 스타일의 대화 관리로 맥락을 이해하는 AI 상담",
      icon: Bot,
      details: [
        "의도 분류 및 엔티티 추출",
        "대화 흐름 관리 및 슬롯 추적",
        "개인화된 상담 및 조언 제공"
      ]
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">사용 가이드</h1>
          <p className="text-lg text-neutral-600">
            전공 알래말래 시스템의 사용법을 단계별로 안내해드립니다.
          </p>
        </div>

        {/* How to Use Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">이용 방법</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-neutral-700 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">시스템 특징</h2>
          <div className="space-y-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-neutral-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-neutral-700 mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        <ul className="space-y-2">
                          {feature.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center text-neutral-600">
                              <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">자주 묻는 질문</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                  Q. 진단 결과가 정확한가요?
                </h3>
                <p className="text-neutral-700">
                  RIASEC 모델은 심리학적으로 검증된 이론이며, OpenAI GPT-4o와 Pinecone 벡터 데이터베이스를 
                  활용하여 더욱 정확하고 개인화된 결과를 제공합니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                  Q. 진단 시간은 얼마나 걸리나요?
                </h3>
                <p className="text-neutral-700">
                  총 24개 질문으로 구성되어 있으며, 약 5-10분 정도 소요됩니다. 
                  각 질문에 신중히 답변할수록 더 정확한 결과를 얻을 수 있습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                  Q. AI 상담은 어떻게 이용하나요?
                </h3>
                <p className="text-neutral-700">
                  진단 완료 후 또는 우측 하단의 채팅 버튼을 통해 언제든지 AI 상담을 받을 수 있습니다. 
                  전공 관련 질문, 진로 고민, 학과 정보 등 다양한 주제로 상담 가능합니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                  Q. 개인정보는 안전하게 보호되나요?
                </h3>
                <p className="text-neutral-700">
                  네, 모든 개인정보는 암호화되어 저장되며, 개인정보 보호법에 따라 안전하게 관리됩니다. 
                  자세한 내용은 개인정보 처리방침을 참고해주세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">지금 시작해보세요!</h2>
          <p className="text-neutral-600 mb-6">
            간단한 진단으로 당신에게 맞는 전공을 찾아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4">
                성향 진단 시작하기
              </Button>
            </Link>
            <Link href="/riasec-info">
              <Button variant="outline" size="lg" className="px-8 py-4">
                RIASEC 알아보기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}