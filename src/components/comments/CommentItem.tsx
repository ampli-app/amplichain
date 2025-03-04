
import { useState } from 'react';
import { Comment } from '@/types/social';
import { useSocial } from '@/contexts/SocialContext';
import { CommentHeader } from './CommentHeader';
import { CommentContent } from './CommentContent';
import { CommentActions } from './CommentActions';
import { CommentReplyForm } from './CommentReplyForm';
import { CommentReplies } from './CommentReplies';
import { toast } from '@/components/ui/use-toast';

interface CommentItemProps {
  comment: Comment;
  level?: number;
  maxLevel?: number;
}

export function CommentItem({ comment, level = 0, maxLevel = 3 }: CommentItemProps) {
  const { likeComment, unlikeComment, commentOnPost, getPostComments, loading } = useSocial();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [localHasLiked, setLocalHasLiked] = useState(comment.hasLiked);
  const [localLikes, setLocalLikes] = useState(comment.likes);
  
  // Sprawdź czy możemy odpowiedzieć na ten komentarz (tylko dla głównych komentarzy)
  const canReply = level < maxLevel;
  
  const handleLikeToggle = async () => {
    if (loading) return;
    
    if (localHasLiked) {
      await unlikeComment(comment.id);
      // Optymistyczna aktualizacja UI
      setLocalHasLiked(false);
      setLocalLikes(prev => Math.max(0, prev - 1));
    } else {
      await likeComment(comment.id);
      // Optymistyczna aktualizacja UI
      setLocalHasLiked(true);
      setLocalLikes(prev => prev + 1);
    }
  };
  
  const handleReplySubmit = async (content: string) => {
    if (!content.trim() || loading) return;
    
    await commentOnPost(comment.postId, content, comment.id);
    setIsReplying(false);
    
    // Odśwież odpowiedzi jeśli były już załadowane
    if (repliesLoaded) {
      loadReplies();
    }
  };
  
  const loadReplies = async () => {
    if (comment.replies > 0 && !repliesLoading) {
      try {
        setRepliesLoading(true);
        console.log("Loading replies for comment:", comment.id);
        const fetchedReplies = await getPostComments(comment.postId, comment.id);
        console.log("Fetched replies:", fetchedReplies);
        if (fetchedReplies && Array.isArray(fetchedReplies)) {
          setReplies(fetchedReplies);
          setRepliesLoaded(true);
          setShowReplies(true); // Automatically show replies after loading
        } else {
          console.error("Invalid replies data received");
          setReplies([]);
          toast({
            title: "Błąd",
            description: "Nie udało się załadować odpowiedzi",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Błąd podczas ładowania odpowiedzi:", err);
        setReplies([]);
        toast({
          title: "Błąd",
          description: "Wystąpił błąd podczas ładowania odpowiedzi",
          variant: "destructive"
        });
      } finally {
        setRepliesLoading(false);
      }
    }
  };
  
  const toggleReplies = async () => {
    if (!repliesLoaded && !showReplies) {
      await loadReplies();
    } else {
      setShowReplies(!showReplies);
    }
  };
  
  return (
    <div className={level > 0 ? "pl-4" : ""}>      
      <div className="flex items-start gap-3 py-2 w-full">
        <div className="flex-1 min-w-0 w-full">
          <div className="glass-card rounded-lg p-3 border w-full">
            <CommentHeader comment={comment} />
            <CommentContent content={comment.content} />
          </div>
          
          <CommentActions 
            likes={localLikes}
            hasLiked={localHasLiked}
            hasReplies={comment.replies > 0}
            repliesCount={comment.replies}
            showReplies={showReplies}
            canReply={canReply}
            loading={loading || repliesLoading}
            onLikeToggle={handleLikeToggle}
            onReplyToggle={() => setIsReplying(!isReplying)}
            onShowRepliesToggle={toggleReplies}
          />
          
          {isReplying && (
            <CommentReplyForm 
              loading={loading}
              onCancel={() => setIsReplying(false)}
              onSubmit={handleReplySubmit}
            />
          )}
          
          {showReplies && (
            <CommentReplies 
              replies={replies}
              level={level}
              maxLevel={maxLevel}
            />
          )}
        </div>
      </div>
    </div>
  );
}
