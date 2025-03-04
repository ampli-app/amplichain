
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
    <div className="flex flex-col">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 w-fit"
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
        <div className="mt-4">
          <CommentsSection 
            postId={postId} 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}
