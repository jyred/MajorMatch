import { Link, useLocation } from "wouter";
import { GraduationCap, Menu, User, LogOut, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { href: "/assessment", label: "성향 진단" },
    { href: "/chat", label: "AI 상담" },
    { href: "/profile", label: "내 프로필" },
    { href: "/riasec-info", label: "RIASEC이란?" },
    { href: "/help", label: "도움말" },
  ];

  return (
    <header className="bg-white shadow-sm border-b-2 border-primary/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="text-white text-sm sm:text-lg" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">전공 알래말래</h1>
              <p className="text-xs sm:text-sm text-neutral-600 truncate hidden sm:block">창의융합학부 전공 매칭 시스템</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={`font-medium ${
                      location === item.href 
                        ? "text-primary" 
                        : "text-neutral-700 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4 border-l pl-6">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">
                      {user?.username}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      toast({
                        title: "로그아웃 완료",
                        description: "안전하게 로그아웃되었습니다.",
                      });
                    }}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-1" />
                      로그인
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-1" />
                      회원가입
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                {/* User Info for Mobile */}
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">
                      {user?.username}
                    </span>
                  </div>
                )}

                {/* Navigation Items */}
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${
                        location === item.href 
                          ? "text-primary bg-primary/10" 
                          : "text-neutral-700"
                      }`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}

                {/* Auth Buttons for Mobile */}
                <div className="border-t pt-4 space-y-2">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        logout();
                        toast({
                          title: "로그아웃 완료",
                          description: "안전하게 로그아웃되었습니다.",
                        });
                      }}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                    </Button>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline" className="w-full justify-start">
                          <LogIn className="h-4 w-4 mr-2" />
                          로그인
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button className="w-full justify-start">
                          <UserPlus className="h-4 w-4 mr-2" />
                          회원가입
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
