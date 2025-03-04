
import { Button } from "@/components/ui/button";
import { CommentsSection } from "./CommentsSection";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface CommentsDialogProps {
  postId: string;
  commentsCount: number;
}

export function CommentsDialog({ postId, commentsCount }: CommentsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1.5 h-8 px-2.5"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentsCount}</span>
      </Button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg max-w-lg w-full mx-auto relative">
            <CommentsSection 
              postId={postId} 
              onClose={() => setIsOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
