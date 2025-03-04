
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1"
          type="button"
          onClick={(e) => {
            e.preventDefault(); // Zapobiega propagacji zdarzenia
            setIsOpen(true);
          }}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogDescription className="sr-only">
          Sekcja komentarzy do posta
        </DialogDescription>
        <CommentsSection 
          postId={postId} 
          onClose={() => setIsOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
