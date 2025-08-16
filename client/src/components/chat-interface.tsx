import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, RIASECScores } from "@shared/schema";

interface ChatInterfaceProps {
  riasecScores?: RIASECScores | null;
  recommendedMajors?: string[] | null;
  className?: string;
}

export default function ChatInterface({ 
  riasecScores, 
  recommendedMajors,
  className = ""
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "안녕하세요! 전공 상담 AI입니다. 😊\n\n창의융합학부의 다양한 전공에 대해 궁금한 점이 있으시면 언제든지 물어보세요. RIASEC 진단 결과가 있다면 더욱 맞춤형 상담을 받으실 수 있습니다.",
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
        riasecScores,
        recommendedMajors
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
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "메시지 전송 중 문제가 발생했습니다. 다시 시도해주세요.",
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
    "📚 전공별 커리큘럼이 궁금해요",
    "💼 졸업 후 진로는 어떻게 되나요?", 
    "🎯 전공 선택할 때 고려사항은?",
    "💰 전공별 취업 전망이 궁금해요"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
            <Bot className="text-white text-lg" />
          </div>
          <div>
            <h2 className="font-semibold text-white">전공 상담 AI</h2>
            <p className="text-white/80 text-sm flex items-center">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              온라인
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
                ? 'chat-bubble-user text-white'
                : 'chat-bubble-bot text-neutral-800 border border-neutral-200'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
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
            <div className="chat-bubble-bot px-4 py-3 rounded-2xl border border-neutral-200">
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
        <div className="flex flex-wrap gap-2 mt-3">
          {quickQuestions.map((question, index) => (
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
      </CardContent>
    </Card>
  );
}
