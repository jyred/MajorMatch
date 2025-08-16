import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BookmarkedMajor } from "@shared/schema";

interface BookmarkButtonProps {
  majorName: string;
  notes?: string;
}

export function BookmarkButton({ majorName, notes }: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: bookmarks = [] } = useQuery<BookmarkedMajor[]>({
    queryKey: ["/api/bookmarks"],
  });

  const isBookmarked = bookmarks.some(bookmark => bookmark.majorName === majorName);
  const existingBookmark = bookmarks.find(bookmark => bookmark.majorName === majorName);

  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/bookmarks", "POST", { majorName, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "북마크 추가",
        description: `${majorName}을(를) 북마크에 추가했습니다.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "북마크 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!existingBookmark) throw new Error("북마크를 찾을 수 없습니다");
      return await apiRequest(`/api/bookmarks/${existingBookmark.id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "북마크 제거",
        description: `${majorName}을(를) 북마크에서 제거했습니다.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "북마크 제거 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmarkMutation.mutate();
    } else {
      addBookmarkMutation.mutate();
    }
  };

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size="sm"
      onClick={handleToggleBookmark}
      disabled={addBookmarkMutation.isPending || removeBookmarkMutation.isPending}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {isBookmarked ? "북마크됨" : "북마크"}
    </Button>
  );
}