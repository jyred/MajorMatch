import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  LogOut, 
  Home, 
  Brain, 
  MessageSquare, 
  BookOpen,
  Star,
  HelpCircle
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  if (!isAuthenticated) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <span className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                  전공 알래말래
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline">로그인</Button>
              </Link>
              <Link href="/register">
                <Button>회원가입</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                전공 알래말래
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                홈
              </Button>
            </Link>
            
            <Link href="/assessment">
              <Button 
                variant={location === "/assessment" ? "default" : "ghost"} 
                size="sm"
              >
                <Brain className="h-4 w-4 mr-2" />
                진단
              </Button>
            </Link>
            
            <Link href="/results">
              <Button 
                variant={location.startsWith("/results") ? "default" : "ghost"} 
                size="sm"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                결과
              </Button>
            </Link>
            
            <Link href="/chat">
              <Button 
                variant={location === "/chat" ? "default" : "ghost"} 
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                상담
              </Button>
            </Link>
            
            <Link href="/satisfaction-survey">
              <Button 
                variant={location === "/satisfaction-survey" ? "default" : "ghost"} 
                size="sm"
              >
                <Star className="h-4 w-4 mr-2" />
                만족도
              </Button>
            </Link>
            
            <Link href="/help">
              <Button 
                variant={location === "/help" ? "default" : "ghost"} 
                size="sm"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                도움말
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}