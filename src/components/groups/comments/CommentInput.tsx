
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';

interface CommentInputProps {
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: () => void;
}

export function CommentInput({ commentText, setCommentText, onAddComment }: CommentInputProps) {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Your profile" />
        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
      </Avatar>
      <div className="flex-1 flex gap-2">
        <Textarea 
          placeholder="Napisz komentarz..." 
          className="min-h-[40px] py-2 resize-none"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <Button 
          size="sm" 
          className="h-10 px-3 self-end"
          onClick={onAddComment}
          disabled={!commentText.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
