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
import { loginUserSchema, type LoginUser } from "@shared/schema";
import { BookOpen, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      return await apiRequest("/api/auth/login", "POST", data);
    },
    onSuccess: (data) => {
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update the auth cache with the user data
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
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

        {/* Login Form */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
              로그인
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              계정에 로그인하여 개인 맞춤형 서비스를 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">사용자명</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="사용자명을 입력하세요"
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
                          placeholder="비밀번호를 입력하세요"
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
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    "로그인 중..."
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      로그인
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                계정이 없으신가요?{" "}
                <Link href="/register">
                  <Button variant="link" className="p-0 h-auto text-indigo-600 dark:text-indigo-400">
                    <UserPlus className="mr-1 h-4 w-4" />
                    회원가입
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