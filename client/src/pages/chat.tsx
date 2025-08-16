import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Brain, Clock, GraduationCap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/schema";
import ProtectedRoute from "@/components/ProtectedRoute";

function ChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "안녕하세요! 저는 충남대학교 창의융합대학 전공 상담을 도와드리는 김상담입니다. 전공 선택이나 진로 고민이 있으시면 편하게 말씀해 주세요. 어떤 것이 가장 궁금하신가요?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId?: string | null }) => {
      return await apiRequest("/api/chat", "POST", { 
        message, 
        sessionId,
        riasecScores: null, // TODO: Get from assessment if available
        recommendedMajors: null
      });
    },
    onSuccess: (data: { response: string; sessionId: string }) => {
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString()
      }]);
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
      toast({
        title: "오류가 발생했습니다",
        description: error.message || "메시지 전송 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({ message: inputMessage, sessionId });
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "전공별 커리큘럼이 궁금해요",
    "졸업 후 진로는 어떻게 되나요?", 
    "어떤 분야에서 일하고 싶은지 고민이에요",
    "평소에 관심 있던 기술이 있어요",
    "대학 생활에서 뭘 해야 할지 모르겠어요",
    "취업 준비는 언제부터 해야 하나요?",
    "창업에 관심이 있어요",
    "대학원 진학을 고려하고 있어요"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">AI 전공 상담 챗봇</h1>
          <p className="text-lg text-neutral-600">궁금한 점이 있으시면 언제든지 물어보세요</p>
        </div>

        {/* Chat Interface */}
        <Card className="overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <Bot className="text-white text-lg" />
              </div>
              <div>
                <h2 className="font-semibold text-white">김상담 (전공 상담사)</h2>
                <p className="text-white/80 text-sm flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  상담 가능
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-neutral-50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                } animate-slide-up`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white text-sm" />
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-white border border-neutral-200 text-neutral-800'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-white text-sm" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {chatMutation.isPending && (
              <div className="flex items-start space-x-3 animate-slide-up">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white text-sm" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl border border-neutral-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <CardContent className="p-4 border-t border-neutral-200 bg-white">
            <div className="flex space-x-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="궁금한 것을 물어보세요..."
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Questions */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 4).map((question, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="cursor-pointer hover:bg-neutral-200 transition-colors text-xs"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
              {quickQuestions.length > 4 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickQuestions.slice(4).map((question, index) => (
                    <Badge 
                      key={index + 4}
                      variant="outline" 
                      className="cursor-pointer hover:bg-neutral-50 transition-colors text-xs"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-neutral-500 mt-2">
                💬 더 자세한 이야기를 나눌수록 더 정확한 상담을 받을 수 있어요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chat Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="text-primary text-xl" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">개인화된 상담</h3>
              <p className="text-sm text-neutral-600">당신의 RIASEC 결과를 바탕으로 맞춤형 조언을 제공합니다</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="text-secondary text-xl" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">24시간 이용</h3>
              <p className="text-sm text-neutral-600">언제든지 궁금한 점을 물어보고 답변을 받을 수 있습니다</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-accent text-xl" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">안전한 상담</h3>
              <p className="text-sm text-neutral-600">악용 방지 시스템으로 안전하고 건전한 상담 환경을 제공합니다</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}
