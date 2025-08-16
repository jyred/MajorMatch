import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className
      )}
    />
  );
}

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ message = "로딩 중...", size = "md" }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <LoadingSpinner size={size} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function FullPageLoading({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingState message={message} size="lg" />
    </div>
  );
}