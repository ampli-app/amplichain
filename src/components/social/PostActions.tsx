
import { Heart, MessageCircle, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostActionsProps {
  likes: number;
  hasLiked: boolean;
  comments: number;
  hasSaved: boolean;
  saves: number;
  showComments: boolean;
  loading: boolean;
  onLikeToggle: () => void;
  onCommentToggle: () => void;
  onSaveToggle: () => void;
}

export function PostActions({ 
  likes, 
  hasLiked, 
  comments, 
  hasSaved, 
  saves,
  showComments, 
  loading, 
  onLikeToggle, 
  onCommentToggle, 
  onSaveToggle 
}: PostActionsProps) {
  return (
    <div className="flex items-center justify-between mt-4 border-t pt-3">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1.5 h-8 px-2.5 ${hasLiked ? 'text-red-500' : ''}`}
          onClick={onLikeToggle}
          disabled={loading}
          type="button"
        >
          <Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-500' : ''}`} />
          <span>{likes}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1.5 h-8 px-2.5"
          onClick={onCommentToggle}
          type="button"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1.5 h-8 px-2.5 ${hasSaved ? 'text-primary' : ''}`}
          onClick={onSaveToggle}
          disabled={loading}
          type="button"
        >
          <Bookmark className={`h-4 w-4 ${hasSaved ? 'fill-primary' : ''}`} />
          <span>{hasSaved ? 'Zapisano' : 'Zapisz'}</span>
        </Button>
      </div>
    </div>
  );
}
