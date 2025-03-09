
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UsePostInteractionsProps {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
  onLikeToggle?: (postId: string, isLiked: boolean) => Promise<void>;
  onAddComment?: (postId: string, content: string) => Promise<void | boolean>;
  onAddReply?: (postId: string, commentId: string, content: string) => Promise<void | boolean>;
}

export function usePostInteractions({
  postId,
  initialLikes,
  initialLiked,
  onLikeToggle,
  onAddComment,
  onAddReply
}: UsePostInteractionsProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleLike = async () => {
    if (!user || !onLikeToggle) return;
    
    try {
      await onLikeToggle(postId, liked);
      
      // Zaktualizuj lokalny stan
      if (liked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Błąd podczas aktualizacji polubienia:', error);
    }
  };
  
  const handleAddComment = async () => {
    if (!user || !newComment.trim() || !onAddComment) return;
    
    setCommentLoading(true);
    try {
      await onAddComment(postId, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
    } finally {
      setCommentLoading(false);
    }
  };
  
  const handleAddReply = async (commentId: string) => {
    if (!user || !replyText.trim() || !onAddReply) return;
    
    setCommentLoading(true);
    try {
      await onAddReply(postId, commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Błąd podczas dodawania odpowiedzi:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  return {
    liked,
    likesCount,
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    commentLoading,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleLike,
    handleAddComment,
    handleAddReply
  };
}
