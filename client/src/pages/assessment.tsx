import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AnalysisLoading } from "@/components/analysis-loading";
import { ChevronLeft, ChevronRight, FileCheck, Play } from "lucide-react";
import { assessmentQuestions, answerOptions } from "@/data/questions";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RIASECScores } from "@shared/schema";
import ProtectedRoute from "@/components/ProtectedRoute";

function AssessmentContent() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [showExistingForm, setShowExistingForm] = useState(false);
  const [existingScores, setExistingScores] = useState({
    realistic: '',
    investigative: '',
    artistic: '',
    social: '',
    enterprising: '',
    conventional: ''
  });
  const [maxScore, setMaxScore] = useState(100);
  const { toast } = useToast();

  const analyzeRiasecMutation = useMutation({
    mutationFn: async (responses: Record<number, number>) => {
      return await apiRequest("/api/analyze-riasec", "POST", { responses });
    },
    onSuccess: (data: { assessmentId: string; riasecScores: RIASECScores; recommendations: any[]; explanation: string; similarCasesFeedback?: string }) => {
      setLocation(`/results/${data.assessmentId}`);
      toast({
        title: "진단 완료!",
        description: "RIASEC 성향 분석이 완료되었습니다. 결과를 확인해보세요.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "진단 분석 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const submitExistingScoresMutation = useMutation({
    mutationFn: async (riasecScores: RIASECScores) => {
      // riasecScores already in 0-100 range from user input
      console.log("Submitting existing scores:", riasecScores);
      const majorData = await apiRequest("/api/recommend-majors", "POST", { riasecScores });

      const assessment = await apiRequest("/api/assessments", "POST", {
        responses: {},
        riasecScores,
        recommendedMajors: majorData.recommendations.map((r: any) => r.major),
        explanation: majorData.explanation
      });
      return assessment;
    },
    onSuccess: (assessment: { id: string }) => {
      setLocation(`/results/${assessment.id}`);
      toast({
        title: "분석 완료!",
        description: "기존 RIASEC 점수를 바탕으로 전공 추천이 완료되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "전공 추천 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  const question = assessmentQuestions[currentQuestion];

  const handleAnswerChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [question.id]: parseInt(value)
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      analyzeRiasecMutation.mutate(responses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleExistingScoreChange = (type: keyof typeof existingScores, value: string) => {
    setExistingScores(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const normalizeScores = () => {
    const normalized = {};
    Object.entries(existingScores).forEach(([key, value]) => {
      const numValue = parseFloat(value as string) || 0;
      // Convert from maxScore scale to 100-point scale
      normalized[key] = Math.round((numValue / maxScore) * 100);
    });
    return normalized;
  };

  const handleSubmitExistingScores = () => {
    const normalizedScores = normalizeScores();
    const riasecScores: RIASECScores = {
      realistic: normalizedScores.realistic,
      investigative: normalizedScores.investigative,
      artistic: normalizedScores.artistic,
      social: normalizedScores.social,
      enterprising: normalizedScores.enterprising,
      conventional: normalizedScores.conventional
    };

    console.log("Submitting normalized scores (0-100 range):", riasecScores);
    submitExistingScoresMutation.mutate(riasecScores);
  };

  const canProceed = responses[question.id] !== undefined;
  const isLastQuestion = currentQuestion === assessmentQuestions.length - 1;
  const canSubmitExisting = Object.values(existingScores).some(score => parseFloat(score as string) > 0);

  if (showExistingForm) {
    return (
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">기존 RIASEC 점수 입력</h1>
            <p className="text-lg text-neutral-600">이미 받은 RIASEC 점수를 입력해주세요</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                RIASEC 점수 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 만점 기준 설정 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label htmlFor="maxScore" className="text-sm font-medium text-blue-900">
                  각 항목의 만점은 몇 점인가요?
                </Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    max="1000"
                    value={maxScore}
                    onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
                    className="w-24"
                  />
                  <span className="text-sm text-blue-700">점 (기본: 100점)</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  입력하신 점수는 자동으로 100점 기준으로 변환됩니다
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="realistic">현실형 (Realistic)</Label>
                  <Input
                    id="realistic"
                    type="number"
                    min="0"
                    max={maxScore}
                    value={existingScores.realistic}
                    onChange={(e) => handleExistingScoreChange('realistic', e.target.value)}
                    placeholder={`0-${maxScore}점`}
                  />
                  <p className="text-sm text-neutral-600">실용적이고 현실적인 성향</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investigative">탐구형 (Investigative)</Label>
                  <Input
                    id="investigative"
                    type="number"
                    min="0"
                    max={maxScore}
                    value={existingScores.investigative}
                    onChange={(e) => handleExistingScoreChange('investigative', e.target.value)}
                    placeholder={`0-${maxScore}점`}
                  />
                  <p className="text-sm text-neutral-600">분석적이고 연구지향적 성향</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artistic">예술형 (Artistic)</Label>
                  <Input
                    id="artistic"
                    type="number"
                    min="0"
                    max={maxScore}
                    value={existingScores.artistic}
                    onChange={(e) => handleExistingScoreChange('artistic', e.target.value)}
                    placeholder={`0-${maxScore}점`}
                  />
                  <p className="text-sm text-neutral-600">창의적이고 예술적 성향</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social">사회형 (Social)</Label>
                  <Input
                    id="social"
                    type="number"
                    min="0"
                    max={maxScore}
                    value={existingScores.social}
                    onChange={(e) => handleExistingScoreChange('social', e.target.value)}
                    placeholder={`0-${maxScore}점`}
                  />
                  <p className="text-sm text-neutral-600">사교적이고 도움을 주는 성향</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enterprising">진취형 (Enterprising)</Label>
                  <Input
                    id="enterprising"
                    type="number"
                    min="0"
                    max={maxScore}
                    value={existingScores.enterprising}
                    onChange={(e) => handleExistingScoreChange('enterprising', e.target.value)}
                    placeholder={`0-${maxScore}점`}
                  />
                  <p className="text-sm text-neutral-600">리더십과 설득력을 가진 성향</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conventional">관습형 (Conventional)</Label>
                  <Input
                    id="conventional"
                    type="number"
                    min="0"
                    max={maxScore}
                    value={existingScores.conventional}
                    onChange={(e) => handleExistingScoreChange('conventional', e.target.value)}
                    placeholder={`0-${maxScore}점`}
                  />
                  <p className="text-sm text-neutral-600">체계적이고 논리적 성향</p>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowExistingForm(false)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  뒤로가기
                </Button>
                
                <Button 
                  onClick={handleSubmitExistingScores}
                  disabled={!canSubmitExisting || submitExistingScoresMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {submitExistingScoresMutation.isPending ? (
                    "AI 분석 중..."
                  ) : (
                    <>
                      AI 전공 추천 받기
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-white">
      {/* Analysis Loading Overlay */}
      <AnalysisLoading 
        isVisible={analyzeRiasecMutation.isPending || submitExistingScoresMutation.isPending} 
        type={analyzeRiasecMutation.isPending ? "assessment" : "recommendation"} 
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">RIASEC 성향 진단</h1>
          <p className="text-lg text-neutral-600">간단한 질문들을 통해 당신의 성향을 파악해보세요</p>
        </div>

        {/* 기존 결과 있음/없음 선택 */}
        {currentQuestion === 0 && !hasExistingResults && (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  이미 RIASEC 결과를 받아보신 적이 있나요?
                </h2>
                <p className="text-neutral-600">
                  기존 점수가 있다면 직접 입력하여 시간을 절약할 수 있습니다.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => {
                    setHasExistingResults(true);
                    setShowExistingForm(true);
                  }}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <FileCheck className="h-5 w-5" />
                  네, 기존 점수 입력하기
                </Button>
                
                <Button 
                  onClick={() => {
                    setHasExistingResults(true);
                    setCurrentQuestion(0);
                  }}
                  size="lg"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Play className="h-5 w-5" />
                  아니요, 새로 진단받기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasExistingResults && !showExistingForm && (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-700">진행률</span>
                <span className="text-sm font-medium text-primary">
                  {currentQuestion + 1}/{assessmentQuestions.length}
                </span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>

            {/* Question Card */}
            <Card className="mb-8 animate-slide-up">
              <CardContent className="p-8">
                <div className="mb-6">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                    질문 {currentQuestion + 1}
                  </span>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                    {question.text}
                  </h2>
                  <p className="text-neutral-600">
                    자신의 성향과 가장 가까운 답변을 선택해주세요.
                  </p>
                </div>

                {/* Answer Options */}
                <RadioGroup 
                  value={responses[question.id]?.toString() || ""} 
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {answerOptions.map((option) => {
                    const isSelected = responses[question.id] === option.value;
                    return (
                      <div key={option.value} className="relative">
                        <RadioGroupItem 
                          value={option.value.toString()} 
                          id={`option-${option.value}`}
                          className="sr-only"
                        />
                        <Label 
                          htmlFor={`option-${option.value}`}
                          className={`flex items-center space-x-4 cursor-pointer p-5 rounded-xl border-2 transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-100 shadow-md' 
                              : 'border-neutral-200 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-neutral-400'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className={`font-medium flex-1 ${
                            isSelected ? 'text-blue-800' : 'text-neutral-800'
                          }`}>
                            {option.label}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="ghost" 
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="text-neutral-600 hover:text-neutral-800"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    이전
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!canProceed || analyzeRiasecMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {analyzeRiasecMutation.isPending ? (
                      "AI 분석 중..."
                    ) : isLastQuestion ? (
                      <>
                        AI 진단 시작
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        다음
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function Assessment() {
  return (
    <ProtectedRoute>
      <AssessmentContent />
    </ProtectedRoute>
  );
}