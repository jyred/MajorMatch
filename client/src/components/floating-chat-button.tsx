import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function FloatingChatButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/chat">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </Link>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-16 right-0 bg-neutral-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
          AI 전공 상담
          <div className="absolute -bottom-1 right-4 w-2 h-2 bg-neutral-800 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}