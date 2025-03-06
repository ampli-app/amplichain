
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface CommentInputProps {
  onAddComment: () => void;
  commentText: string;
  setCommentText: (text: string) => void;
  disabled?: boolean;
}

export function CommentInput({ 
  onAddComment, 
  commentText, 
  setCommentText, 
  disabled = false 
}: CommentInputProps) {
  const { user, isLoggedIn } = useAuth();
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
      e.preventDefault();
      onAddComment();
    }
  };
  
  if (!isLoggedIn) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
        <p className="text-sm text-rhythm-500 mb-2">Zaloguj się, aby dodawać komentarze</p>
        <Link to="/login">
          <Button size="sm" variant="outline">Zaloguj się</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
      </Avatar>
      
      <div className="flex-1 flex gap-2">
        <Textarea 
          placeholder="Napisz komentarz..." 
          className="min-h-[40px] py-2 text-sm resize-none"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        <Button 
          className="h-full self-end" 
          onClick={onAddComment} 
          disabled={!commentText.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
