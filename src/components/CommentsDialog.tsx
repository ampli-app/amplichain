
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CommentsSection } from "./CommentsSection";
import { MessageCircle } from "lucide-react";

interface CommentsDialogProps {
  postId: string;
  commentsCount: number;
}

export function CommentsDialog({ postId, commentsCount }: CommentsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogDescription className="sr-only">
          Sekcja komentarzy do posta
        </DialogDescription>
        <CommentsSection postId={postId} />
      </DialogContent>
    </Dialog>
  );
}
