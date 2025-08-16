import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Brain, MessageSquare, BookOpen, Users, Play, HelpCircle, UserPlus, LogIn, Info, ArrowRight, Palette, Code, Music, Wrench } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-neutral-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        {/* Hero Section for Non-Authenticated Users */}
        <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6">
                전공 알래말래
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-800 mb-6">
                창의융합학부 전공 매칭 시스템
              </h2>
              <p className="text-xl text-neutral-700 mb-8 max-w-2xl mx-auto">
                RIASEC 성향 진단을 통해 창의융합학부의 다양한 전공 중 당신에게 가장 적합한 분야를 추천해드립니다.
              </p>
              
              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all shadow-lg"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    회원가입하고 시작하기
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-4 text-lg font-semibold border-2 hover:bg-neutral-50"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    로그인
                  </Button>
                </Link>
              </div>

              {/* Login Required Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-3">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">로그인이 필요합니다</span>
                </div>
                <p className="text-blue-700">
                  모든 기능을 이용하려면 학번으로 회원가입 후 로그인해주세요.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main home page for authenticated users - clean and simple design inspired by the image
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">
                나에게 맞는 전공을 <span className="text-blue-600">찾아보세요</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                RIASEC 성향 진단을 통해 창의융합학부의 다양한 전공 중 당신에게 가장 적합한 분야를 추천해드립니다.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="mr-2 h-5 w-5" />
                  진단 시작하기
                </Button>
              </Link>
              <Link href="/riasec-info">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg"
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  RIASEC이란?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RIASEC Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">RIASEC 성향 유형</h2>
            <p className="text-lg text-gray-600">6가지 성향 유형을 통해 당신의 특성을 파악해보세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Realistic */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <Wrench className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">실용형 (R)</h3>
                <p className="text-gray-600 mb-4">Realistic</p>
                <p className="text-sm text-gray-500">손으로 만들고 조작하는 활동을 선호하며 실제적이고 구체적인 과제를 좋아합니다.</p>
              </CardContent>
            </Card>

            {/* Investigative */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <Brain className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">탐구형 (I)</h3>
                <p className="text-gray-600 mb-4">Investigative</p>
                <p className="text-sm text-gray-500">관찰하고 분석하며 문제를 해결하는 것을 좋아하고 지적 호기심이 강합니다.</p>
              </CardContent>
            </Card>

            {/* Artistic */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                  <Palette className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">예술형 (A)</h3>
                <p className="text-gray-600 mb-4">Artistic</p>
                <p className="text-sm text-gray-500">창조적이고 독창적인 활동을 선호하며 예술적 표현에 관심이 높습니다.</p>
              </CardContent>
            </Card>

            {/* Social */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                  <Users className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">사회형 (S)</h3>
                <p className="text-gray-600 mb-4">Social</p>
                <p className="text-sm text-gray-500">사람들과 함께 일하고 도움을 주는 활동을 선호하며 협력적입니다.</p>
              </CardContent>
            </Card>

            {/* Enterprising */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                  <MessageSquare className="text-orange-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">기업형 (E)</h3>
                <p className="text-gray-600 mb-4">Enterprising</p>
                <p className="text-sm text-gray-500">리더십을 발휘하고 다른 사람을 설득하며 조직을 이끄는 것을 좋아합니다.</p>
              </CardContent>
            </Card>

            {/* Conventional */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-200 transition-colors">
                  <BookOpen className="text-teal-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">관습형 (C)</h3>
                <p className="text-gray-600 mb-4">Conventional</p>
                <p className="text-sm text-gray-500">체계적이고 논리적인 업무를 선호하며 규칙과 절차를 잘 따릅니다.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">제공 서비스</h2>
            <p className="text-lg text-gray-600">전공 알래말래가 제공하는 다양한 서비스를 확인해보세요</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Brain className="text-blue-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">RIASEC 진단</h3>
                </div>
                <p className="text-gray-600">과학적으로 검증된 RIASEC 이론을 바탕으로 한 정확한 성향 진단</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <MessageSquare className="text-green-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI 상담</h3>
                </div>
                <p className="text-gray-600">개인 맞춤형 AI 상담을 통한 전공 선택 가이드</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <BookOpen className="text-purple-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">전공 정보</h3>
                </div>
                <p className="text-gray-600">창의융합학부 내 모든 전공에 대한 상세 정보 제공</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white space-y-6">
            <h2 className="text-3xl font-bold">지금 바로 시작해보세요!</h2>
            <p className="text-xl text-blue-100">
              당신에게 완벽하게 맞는 전공을 찾아드립니다
            </p>
            <Link href="/assessment">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                성향 진단 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}