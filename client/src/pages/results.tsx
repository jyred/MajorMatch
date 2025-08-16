import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, RotateCcw, Download, Lightbulb, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/bookmark-button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ValidationAlert } from "@/components/validation-alert";
import type { Assessment } from "@shared/schema";
import ProtectedRoute from "@/components/ProtectedRoute";
import RIASECChart from "@/components/riasec-chart";

function ResultsContent() {
  const { id } = useParams();
  
  const { data: assessment, isLoading, error } = useQuery<Assessment>({
    queryKey: ["/api/assessments", id],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen py-16 bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">결과를 찾을 수 없습니다</h2>
            <p className="text-neutral-600 mb-6">진단 결과가 존재하지 않거나 만료되었습니다.</p>
            <Link href="/assessment">
              <Button>새로 진단하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riasecTypes = [
    { key: "realistic", name: "실용적", letter: "R", color: "bg-primary" },
    { key: "investigative", name: "탐구적", letter: "I", color: "bg-secondary" },
    { key: "artistic", name: "예술적", letter: "A", color: "bg-accent" },
    { key: "social", name: "사회적", letter: "S", color: "bg-yellow-500" },
    { key: "enterprising", name: "진취적", letter: "E", color: "bg-purple-500" },
    { key: "conventional", name: "관습적", letter: "C", color: "bg-neutral-500" }
  ];

  // Sort RIASEC scores by value
  const sortedScores = riasecTypes
    .map(type => ({
      ...type,
      score: assessment.riasecScores[type.key as keyof typeof assessment.riasecScores]
    }))
    .sort((a, b) => b.score - a.score);

  const primaryType = sortedScores[0];
  const secondaryType = sortedScores[1];

  return (
    <div className="min-h-screen py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">진단 결과</h1>
          <p className="text-lg text-neutral-600">당신의 RIASEC 성향 분석 결과입니다</p>
        </div>

        {/* GPT Validation Warnings */}
        <ValidationAlert 
          warnings={(assessment as any).validationWarnings}
          note={(assessment as any).validationNote}
          type="warning"
        />

        {/* Results Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">주요 성향</h2>
              <div className="flex justify-center items-center space-x-4">
                <span className={`inline-block ${primaryType.color} text-white px-4 py-2 rounded-full font-semibold text-lg`}>
                  {primaryType.name} ({primaryType.letter})
                </span>
                <span className="text-neutral-400">+</span>
                <span className={`inline-block ${secondaryType.color} text-white px-4 py-2 rounded-full font-semibold text-lg`}>
                  {secondaryType.name} ({secondaryType.letter})
                </span>
              </div>
            </div>

            {/* RIASEC Chart - Full Width */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-6 text-center">RIASEC 성향 육각형 차트 (100점 만점)</h3>
              <div className="h-[calc(100vh-200px)] min-h-[700px] w-full mb-8">
                <RIASECChart riasecScores={assessment.riasecScores} />
              </div>
            </div>

            {/* Scores and Recommendations */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">성향별 점수</h3>
                <div className="space-y-3">
                  {sortedScores.map((type) => (
                    <div key={type.key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${type.color} rounded-full flex items-center justify-center mr-3`}>
                          <span className="text-white text-sm font-bold">{type.letter}</span>
                        </div>
                        <span className="font-medium text-neutral-800">{type.name}</span>
                      </div>
                      <span className="text-lg font-bold text-neutral-700">
                        {Math.round(type.score)}점
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">추천 전공</h3>
                <div className="space-y-3">
                  {assessment.recommendedMajors.slice(0, 3).map((major, index) => (
                    <div key={index} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-neutral-900">{major}</h4>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          추천
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">
                        당신의 {primaryType.name}·{secondaryType.name} 성향에 적합한 전공입니다.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="mt-8 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                <Lightbulb className="text-accent mr-2 h-5 w-5" />
                왜 이 전공들이 적합한가요?
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                {assessment.explanation}
              </p>
            </div>

            {/* Similar Cases Feedback from Pinecone */}
            {assessment.similarCasesFeedback && (
              <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                  <MessageCircle className="text-blue-600 mr-2 h-5 w-5" />
                  비슷한 성향의 선배들 경험담
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  {assessment.similarCasesFeedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Majors with Bookmarks */}
        {assessment.recommendedMajors && assessment.recommendedMajors.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                추천 전공
              </h3>
              <div className="grid gap-4">
                {assessment.recommendedMajors.map((major, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{major}</h4>
                      <p className="text-sm text-neutral-600">충남대학교 창의융합학부</p>
                    </div>
                    <BookmarkButton majorName={major} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chat">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all shadow-lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              전공 상담 받기
            </Button>
          </Link>
          
          <Link href={`/satisfaction-survey/${assessment.id}`}>
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all shadow-lg"
            >
              <Star className="mr-2 h-5 w-5" />
              만족도 평가
            </Button>
          </Link>
          
          <Link href="/assessment">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-semibold"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              다시 진단하기
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-4 text-lg font-semibold"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-5 w-5" />
            결과 저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}
