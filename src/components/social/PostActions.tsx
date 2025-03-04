
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
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
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 h-8 px-2 ${hasLiked ? 'text-red-500' : ''}`}
            onClick={onLikeToggle}
            disabled={loading}
            type="button"
          >
            <Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-500' : ''}`} />
          </Button>
          <span className="text-sm text-muted-foreground">{likes}</span>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 h-8 px-2"
            onClick={onCommentToggle}
            type="button"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{comments}</span>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 h-8 px-2 ${hasSaved ? 'text-primary' : ''}`}
            onClick={onSaveToggle}
            disabled={loading}
            type="button"
          >
            <Bookmark className={`h-4 w-4 ${hasSaved ? 'fill-primary' : ''}`} />
          </Button>
          <span className="text-sm text-muted-foreground">{hasSaved ? 'Zapisano' : 'Zapisz'}</span>
        </div>
      </div>
    </div>
  );
}
