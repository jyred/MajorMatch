import { useState, useEffect } from 'react';
import { Brain, Lightbulb, Target, Users, Search, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface AnalysisLoadingProps {
  isVisible: boolean;
  type: 'assessment' | 'recommendation';
}

const analysisSteps = {
  assessment: [
    { icon: Brain, text: "응답 데이터 분석 중...", duration: 3000 },
    { icon: Search, text: "RIASEC 성향 계산 중...", duration: 4000 },
    { icon: Target, text: "성향별 점수 산출 중...", duration: 3000 },
    { icon: Users, text: "유사 사례 검색 중...", duration: 4000 },
    { icon: Lightbulb, text: "전공 추천 생성 중...", duration: 6000 },
    { icon: CheckCircle, text: "분석 완료!", duration: 1000 }
  ],
  recommendation: [
    { icon: Brain, text: "RIASEC 점수 분석 중...", duration: 2000 },
    { icon: Target, text: "전공 적합성 계산 중...", duration: 4000 },
    { icon: Users, text: "유사 사례 검색 중...", duration: 3000 },
    { icon: Lightbulb, text: "맞춤형 추천 생성 중...", duration: 5000 },
    { icon: CheckCircle, text: "추천 완료!", duration: 1000 }
  ]
};

export function AnalysisLoading({ isVisible, type }: AnalysisLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const steps = analysisSteps[type];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) return;

      setCurrentStep(stepIndex);
      const step = steps[stepIndex];
      
      // Progress animation for current step
      let currentProgress = 0;
      const progressIncrement = 100 / (step.duration / 50);
      
      progressTimer = setInterval(() => {
        currentProgress += progressIncrement;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressTimer);
        }
        setProgress(currentProgress);
      }, 50);

      // Move to next step
      stepTimer = setTimeout(() => {
        if (stepIndex < steps.length - 1) {
          runStep(stepIndex + 1);
        }
      }, step.duration);
    };

    runStep(0);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, [isVisible, type]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData?.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="relative">
                  {Icon && <Icon className="w-10 h-10 text-primary animate-pulse" />}
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                AI 분석 진행 중
              </h3>
              <p className="text-neutral-600 mb-4">
                {currentStepData?.text}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index <= currentStep ? 'bg-primary' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-sm text-neutral-500">
              단계 {currentStep + 1} / {steps.length}
            </p>

            {/* Motivational Messages */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                {type === 'assessment' 
                  ? "정확한 분석을 위해 AI가 신중하게 검토하고 있습니다"
                  : "최적의 전공 추천을 위해 다양한 요소를 분석하고 있습니다"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}