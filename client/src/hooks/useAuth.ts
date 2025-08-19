import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        // Check localStorage for cached user data
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          return JSON.parse(cachedUser) as User;
        }
        
        // If no cached user, try API (this will likely return null for now)
        const data = await apiRequest("/api/auth/user");
        return data.user as User;
      } catch (error: any) {
        if (error.message?.includes("401")) {
          // Clear any cached user data on auth error
          localStorage.removeItem('user');
          return null; // Not authenticated
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Clear localStorage
      localStorage.removeItem('user');
      return apiRequest("/api/auth/logout", "POST");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}