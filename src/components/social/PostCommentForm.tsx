
import { useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface PostCommentFormProps {
  loading: boolean;
  onCommentSubmit: (text: string) => Promise<void>;
}

export function PostCommentForm({ loading, onCommentSubmit }: PostCommentFormProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  
  const handleSubmit = async () => {
    if (!commentText.trim() || loading) return;
    
    await onCommentSubmit(commentText);
    setCommentText('');
  };
  
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={user?.user_metadata.avatar_url} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 flex items-end gap-2">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Dodaj komentarz..."
          className="flex-1 min-h-[40px] text-sm"
          disabled={loading}
        />
        <Button
          onClick={handleSubmit}
          disabled={!commentText.trim() || loading}
          size="sm"
          className="h-8"
        >
          Wyślij
        </Button>
      </div>
    </div>
  );
}
