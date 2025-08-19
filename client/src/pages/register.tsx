import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { BookOpen, UserPlus, LogIn, GraduationCap } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      studentId: "",
      username: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return await apiRequest("/api/auth/register", "POST", data);
    },
    onSuccess: (data) => {
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update the auth cache with the user data
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "회원가입 성공",
        description: "환영합니다! 로그인되었습니다.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">전공 알래말래</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            창의융합학부 맞춤형 전공 추천 시스템
          </p>
        </div>

        {/* Register Form */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
              회원가입
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              개인 맞춤형 전공 추천 서비스를 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        <GraduationCap className="inline mr-1 h-4 w-4" />
                        학번
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="202400101 (9자리 숫자)"
                          maxLength={9}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        예시: 202400101 (입학년도 4자리 + 일련번호 5자리)
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">사용자명</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="사용자명을 입력하세요 (최소 3자)"
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="비밀번호를 입력하세요 (최소 6자)"
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    "회원가입 중..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      회원가입
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                이미 계정이 있으신가요?{" "}
                <Link href="/login">
                  <Button variant="link" className="p-0 h-auto text-indigo-600 dark:text-indigo-400">
                    <LogIn className="mr-1 h-4 w-4" />
                    로그인
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}