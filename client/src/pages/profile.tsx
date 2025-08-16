import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Calendar, BookOpen, MessageSquare, LogOut, TrendingUp, Award, Clock, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Assessment } from "@shared/schema";
import { useState, useRef } from "react";

function ProfileContent() {
  const { user, logout, isLoggingOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch user's assessments
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
    retry: false,
  });

  // Profile image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (imageData: string) => {
      return await apiRequest("/api/profile/image", "POST", { imageData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "프로필 사진 변경 완료",
        description: "프로필 사진이 성공적으로 변경되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "업로드 실패",
        description: error.message || "프로필 사진 업로드에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "5MB 이하의 이미지를 선택해 주세요.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setProfileImage(imageData);
      uploadImageMutation.mutate(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "로그아웃 완료",
      description: "안전하게 로그아웃되었습니다.",
    });
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLatestAssessment = (): Assessment | null => {
    if (!assessments || !Array.isArray(assessments) || assessments.length === 0) return null;
    return [...assessments].sort((a: Assessment, b: Assessment) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const latestAssessment = getLatestAssessment();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profileImage || user?.profileImage ? (
                  <img 
                    src={profileImage || user?.profileImage} 
                    alt="프로필 사진"
                    className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="text-white text-2xl" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  disabled={uploadImageMutation.isPending}
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
                <p className="text-gray-600">학번: {user?.studentId}</p>
                <p className="text-gray-600">사용자명: {user?.username}</p>
                {uploadImageMutation.isPending && (
                  <p className="text-sm text-primary">프로필 사진 업로드 중...</p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Assessment Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Latest Assessment */}
            {latestAssessment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="text-primary mr-2 h-5 w-5" />
                    최근 진단 결과
                  </CardTitle>
                  <CardDescription>
                    {formatDate(latestAssessment.createdAt)}에 완료
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* RIASEC Scores */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">RIASEC 성향 점수</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">실용형 (R)</span>
                          <span className="text-sm font-medium text-gray-900">{latestAssessment.riasecScores.realistic}점</span>
                        </div>
                        <Progress value={latestAssessment.riasecScores.realistic} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">탐구형 (I)</span>
                          <span className="text-sm font-medium text-gray-900">{latestAssessment.riasecScores.investigative}점</span>
                        </div>
                        <Progress value={latestAssessment.riasecScores.investigative} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">예술형 (A)</span>
                          <span className="text-sm font-medium text-gray-900">{latestAssessment.riasecScores.artistic}점</span>
                        </div>
                        <Progress value={latestAssessment.riasecScores.artistic} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">사회형 (S)</span>
                          <span className="text-sm font-medium text-gray-900">{latestAssessment.riasecScores.social}점</span>
                        </div>
                        <Progress value={latestAssessment.riasecScores.social} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">기업형 (E)</span>
                          <span className="text-sm font-medium text-gray-900">{latestAssessment.riasecScores.enterprising}점</span>
                        </div>
                        <Progress value={latestAssessment.riasecScores.enterprising} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">관습형 (C)</span>
                          <span className="text-sm font-medium text-gray-900">{latestAssessment.riasecScores.conventional}점</span>
                        </div>
                        <Progress value={latestAssessment.riasecScores.conventional} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Recommended Majors */}
                  {latestAssessment.recommendedMajors && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">추천 전공</h4>
                      <div className="flex flex-wrap gap-2">
                        {latestAssessment.recommendedMajors.map((major: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {major}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/results/${latestAssessment.id}`}>
                      <Button className="bg-primary hover:bg-primary/90">
                        <BookOpen className="mr-2 h-4 w-4" />
                        전체 결과 보기
                      </Button>
                    </Link>
                    <Link href={`/satisfaction-survey/${latestAssessment.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Award className="mr-2 h-4 w-4" />
                        만족도 조사 참여
                      </Button>
                    </Link>
                    <Link href="/chat">
                      <Button variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        AI 상담하기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>진단 기록이 없습니다</CardTitle>
                  <CardDescription>
                    RIASEC 성향 진단을 받아보시겠어요?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/assessment">
                    <Button className="bg-primary hover:bg-primary/90">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      성향 진단 시작하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Assessment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="text-blue-600 mr-2 h-5 w-5" />
                  진단 기록
                </CardTitle>
                <CardDescription>
                  이전에 받았던 진단 결과들을 확인할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessmentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">진단 기록을 불러오는 중...</p>
                  </div>
                ) : Array.isArray(assessments) && assessments.length > 0 ? (
                  <div className="space-y-3">
                    {assessments.slice(0, 5).map((assessment: Assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(assessment.createdAt)} 진단
                          </p>
                          <p className="text-sm text-gray-600">
                            주요 성향: 분석 완료
                          </p>
                        </div>
                        <Link href={`/results/${assessment.id}`}>
                          <Button size="sm" variant="outline">
                            결과 보기
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">아직 진단 기록이 없습니다</p>
                    <Link href="/assessment">
                      <Button className="mt-4" variant="outline">
                        첫 번째 진단 받기
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 기능</CardTitle>
                <CardDescription>
                  자주 사용하는 기능들에 빠르게 접근하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/assessment">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    새로운 진단 받기
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    AI 전공 상담
                  </Button>
                </Link>
                <Link href="/riasec-info">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    RIASEC 이론 알아보기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>계정 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">학번</span>
                  <span className="text-sm text-gray-900">{user?.studentId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">사용자명</span>
                  <span className="text-sm text-gray-900">{user?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">가입일</span>
                  <span className="text-sm text-gray-900">
                    {user?.createdAt ? formatDate(user.createdAt) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">진단 횟수</span>
                  <span className="text-sm text-gray-900">{Array.isArray(assessments) ? assessments.length : 0}회</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}