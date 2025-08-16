import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { insertSatisfactionSurveySchema, type InsertSatisfactionSurvey } from "@shared/schema";
import { Star, Heart, ThumbsUp, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ValidationAlert } from "@/components/validation-alert";
import ProtectedRoute from "@/components/ProtectedRoute";

interface SatisfactionSurveyPageProps {
  params: { assessmentId: string };
}

function SatisfactionSurveyContent({ params }: SatisfactionSurveyPageProps) {
  const { assessmentId } = params;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const form = useForm<Omit<InsertSatisfactionSurvey, "userId">>({
    resolver: zodResolver(insertSatisfactionSurveySchema.omit({ userId: true })),
    defaultValues: {
      assessmentId,
      overallSatisfaction: 5,
      recommendationAccuracy: 5,
      systemUsability: 5,
      wouldRecommend: true,
      feedback: "",
      selectedMajor: "",
      majorSatisfaction: undefined,
    },
  });

  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const surveyMutation = useMutation({
    mutationFn: async (data: Omit<InsertSatisfactionSurvey, "userId">) => {
      return await apiRequest("/api/satisfaction-surveys", "POST", data);
    },
    onSuccess: (response: any) => {
      // GPT 검증 경고사항이 있으면 표시
      if (response.validationWarnings && response.validationWarnings.length > 0) {
        setValidationWarnings(response.validationWarnings);
        toast({
          title: "제출 완료 (검증 알림 있음)",
          description: "데이터가 저장되었지만 일부 검증 알림이 있습니다. 아래 내용을 확인해주세요.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "만족도 조사 완료",
          description: "소중한 의견을 주셔서 감사합니다! 더 나은 서비스 제공에 활용하겠습니다.",
        });
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "제출 실패",
        description: error.message || "만족도 조사 제출 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>만족도 조사를 진행하려면 먼저 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => setLocation("/login")}
            >
              로그인하기
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setLocation("/")}
            >
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: Omit<InsertSatisfactionSurvey, "userId">) => {
    surveyMutation.mutate(data);
  };

  const renderStarRating = (fieldName: keyof typeof form.control._defaultValues, label: string) => (
    <FormField
      control={form.control}
      name={fieldName as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg font-medium">{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => field.onChange(parseInt(value))}
              value={field.value?.toString()}
              className="flex space-x-2"
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="flex items-center space-x-1">
                  <RadioGroupItem
                    value={rating.toString()}
                    id={`${fieldName}-${rating}`}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`${fieldName}-${rating}`}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        field.value && field.value >= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            <Heart className="inline mr-2 h-8 w-8 text-red-500" />
            만족도 조사
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            서비스 개선을 위해 소중한 의견을 들려주세요
          </p>
        </div>

        {/* GPT Validation Warnings */}
        <ValidationAlert 
          warnings={validationWarnings}
          note="입력하신 데이터에 대한 GPT 검증 결과입니다."
          type="warning"
        />

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              서비스 평가
            </CardTitle>
            <CardDescription>
              1점(매우 불만족)부터 5점(매우 만족)까지 평가해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Overall Satisfaction */}
                {renderStarRating("overallSatisfaction", "전체적인 만족도")}

                {/* Recommendation Accuracy */}
                {renderStarRating("recommendationAccuracy", "추천 결과의 정확성")}

                {/* System Usability */}
                {renderStarRating("systemUsability", "시스템 사용 편의성")}

                {/* Would Recommend */}
                <FormField
                  control={form.control}
                  name="wouldRecommend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">
                        <ThumbsUp className="inline mr-2 h-5 w-5" />
                        다른 학생들에게 추천하시겠습니까?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value?.toString()}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="recommend-yes" />
                            <label htmlFor="recommend-yes" className="text-green-600 dark:text-green-400 font-medium">
                              네, 추천하겠습니다
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="recommend-no" />
                            <label htmlFor="recommend-no" className="text-red-600 dark:text-red-400 font-medium">
                              아니요, 추천하지 않겠습니다
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selected Major */}
                <FormField
                  control={form.control}
                  name="selectedMajor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">
                        실제로 선택하신 전공 (선택사항)
                      </FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          placeholder="예: 컴퓨터공학과"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Feedback */}
                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">
                        추가 의견 및 개선 사항 (선택사항)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="서비스에 대한 의견이나 개선 사항을 자유롭게 작성해주세요..."
                          className="min-h-[120px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation("/")}
                  >
                    나중에 하기
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    disabled={surveyMutation.isPending}
                  >
                    {surveyMutation.isPending ? (
                      "제출 중..."
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        제출하기
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SatisfactionSurveyPage({ params }: SatisfactionSurveyPageProps) {
  return (
    <ProtectedRoute>
      <SatisfactionSurveyContent params={params} />
    </ProtectedRoute>
  );
}