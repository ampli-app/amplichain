
import { Heart, MessageCircle, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommentActionsProps {
  likes: number;
  hasLiked: boolean;
  hasReplies: boolean;
  repliesCount: number;
  showReplies: boolean;
  canReply: boolean;
  loading: boolean;
  onLikeToggle: () => void;
  onReplyToggle: () => void;
  onShowRepliesToggle: () => void;
}

export function CommentActions({
  likes,
  hasLiked,
  hasReplies,
  repliesCount,
  showReplies,
  canReply,
  loading,
  onLikeToggle,
  onReplyToggle,
  onShowRepliesToggle
}: CommentActionsProps) {
  return (
    <div className="flex items-center gap-3 mt-1 pl-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex items-center gap-1 h-6 px-2 text-xs ${hasLiked ? 'text-red-500' : ''}`}
        onClick={onLikeToggle}
        disabled={loading}
        type="button"
      >
        <Heart className={`h-3 w-3 ${hasLiked ? 'fill-red-500' : ''}`} />
        <span>{likes > 0 ? likes : ''}</span>
      </Button>
      
      {canReply && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 h-6 px-2 text-xs"
          onClick={onReplyToggle}
          disabled={loading}
          type="button"
        >
          <Reply className="h-3 w-3" />
          <span>Odpowiedz</span>
        </Button>
      )}
      
      {hasReplies && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 h-6 px-2 text-xs"
          onClick={onShowRepliesToggle}
          disabled={loading}
          type="button"
        >
          <MessageCircle className="h-3 w-3" />
          <span>{showReplies ? 'Ukryj odpowiedzi' : `Pokaż odpowiedzi (${repliesCount})`}</span>
        </Button>
      )}
    </div>
  );
}
