
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface PostFooterProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  onLikeClick: () => void;
  onCommentClick: () => void;
  disabled?: boolean;
}

export function PostFooter({ 
  postId,
  likesCount, 
  commentsCount, 
  liked, 
  onLikeClick, 
  onCommentClick, 
  disabled = false 
}: PostFooterProps) {
  const handleShare = () => {
    const url = window.location.href;
    
    // Spróbuj użyć API Clipboard do skopiowania
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link skopiowany",
          description: "Link do posta został skopiowany do schowka.",
        });
      }).catch(() => {
        // Jeśli API Clipboard zawiedzie, wyświetl link
        toast({
          title: "Kopiowanie nieudane",
          description: "Spróbuj skopiować link ręcznie: " + url,
        });
      });
    } else {
      // Fallback dla przeglądarek bez dostępu do Clipboard API
      toast({
        title: "Link do udostępnienia",
        description: url,
      });
    }
  };

  return (
    <div className="flex items-center justify-between border-t pt-3 text-sm">
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 h-8 px-2 ${liked ? 'text-red-500' : ''}`}
          onClick={onLikeClick}
          disabled={disabled}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-red-500' : ''}`} />
          <span>{likesCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 h-8 px-2"
          onClick={onCommentClick}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 h-8 px-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
