
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Post } from '@/types/social';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PostContent } from './PostContent';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostCommentSection } from './PostCommentSection';
import { usePostComments } from '@/hooks/usePostComments';

interface PostItemProps {
  post: Post;
  index: number;
  onLikeToggle?: (postId: string, isLiked: boolean) => Promise<void>;
  onAddComment?: (postId: string, content: string) => Promise<boolean | undefined>;
  onAddReply?: (postId: string, parentCommentId: string, content: string) => Promise<boolean | undefined>;
}

export function PostItem({ 
  post, 
  index, 
  onLikeToggle, 
  onAddComment, 
  onAddReply 
}: PostItemProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { 
    comments,
    loadingComments,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    fetchComments
  } = usePostComments(post.id, showComments);
  
  // Pobierz komentarze przy pierwszym renderze i gdy showComments się zmienia
  useEffect(() => {
    if (showComments && post.comments > 0) {
      fetchComments();
    }
  }, [showComments, post.id, fetchComments]);
  
  const handleLike = async () => {
    setLoading(true);
    try {
      if (onLikeToggle) {
        await onLikeToggle(post.id, liked);
        
        // Zaktualizuj lokalny stan
        if (liked) {
          setLikesCount(prev => prev - 1);
        } else {
          setLikesCount(prev => prev + 1);
        }
        setLiked(!liked);
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji polubienia:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    setLoading(true);
    try {
      if (onAddComment) {
        const success = await onAddComment(post.id, commentText);
        if (success) {
          setCommentText('');
          // Odśwież komentarze
          await fetchComments();
        }
      }
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    
    setLoading(true);
    try {
      if (onAddReply) {
        const success = await onAddReply(post.id, commentId, replyText);
        if (success) {
          setReplyText('');
          setReplyingTo(null);
          // Odśwież komentarze
          await fetchComments();
        }
      }
    } catch (error) {
      console.error('Błąd podczas dodawania odpowiedzi:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <PostHeader author={post.author} timeAgo={post.timeAgo} />
            
            <PostContent post={post} />
            
            <PostFooter 
              likesCount={likesCount} 
              commentsCount={post.comments} 
              liked={liked}
              onLikeClick={handleLike}
              onCommentClick={() => setShowComments(!showComments)}
              disabled={loading}
            />
            
            <PostCommentSection
              showComments={showComments}
              commentText={commentText}
              setCommentText={setCommentText}
              onAddComment={handleAddComment}
              comments={comments}
              loadingComments={loadingComments}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onAddReply={handleAddReply}
              disabled={loading}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
