
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { GroupPost } from '@/types/group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PostContent } from '@/components/social/PostContent';
import { PostHeader } from '@/components/social/PostHeader';
import { PostFooter } from '@/components/social/PostFooter';
import { PostPoll } from './PostPoll';
import { PostMedia } from './PostMedia';
import { PostFiles } from './PostFiles';
import { CommentsList } from '../comments/CommentsList';
import { CommentInput } from '../comments/CommentInput';

interface PostItemProps {
  post: GroupPost;
  index: number;
  groupId: string;
  onLikeToggle?: (postId: string, isLiked: boolean) => Promise<void>;
  onAddComment?: (postId: string, content: string) => Promise<void | boolean>;
  onAddReply?: (postId: string, commentId: string, content: string) => Promise<void | boolean>;
}

export function PostItem({ 
  post, 
  index, 
  groupId,
  onLikeToggle,
  onAddComment,
  onAddReply
}: PostItemProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Funkcja do pobierania komentarzy
  const fetchComments = async () => {
    if (!showComments) return;
    
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('group_post_comments')
        .select(`
          id,
          content,
          user_id,
          created_at,
          parent_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('post_id', post.id)
        .is('parent_id', null)
        .order('created_at', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      // Pobierz odpowiedzi dla każdego komentarza
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies, error: repliesError } = await supabase
            .from('group_post_comments')
            .select(`
              id,
              content,
              user_id,
              created_at,
              parent_id,
              profiles:user_id (
                id,
                full_name,
                avatar_url,
                role
              )
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });
            
          if (repliesError) {
            console.error('Błąd podczas pobierania odpowiedzi:', repliesError);
            return {
              ...comment,
              replies: []
            };
          }
          
          return {
            ...comment,
            replies: replies || []
          };
        })
      );
      
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Błąd podczas pobierania komentarzy:', error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Pobierz komentarze przy pierwszym renderze i gdy showComments się zmienia
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post.id]);
  
  const handleLike = async () => {
    if (!user || !onLikeToggle) return;
    
    try {
      await onLikeToggle(post.id, liked);
      
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
      await onAddComment(post.id, newComment);
      setNewComment('');
      await fetchComments();
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
      await onAddReply(post.id, commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Błąd podczas dodawania odpowiedzi:', error);
    } finally {
      setCommentLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 mb-6">
        <div className="flex-1 min-w-0">
          <PostHeader 
            author={{
              id: post.author.id,
              name: post.author.name,
              avatar: post.author.avatar,
              role: post.author.role || ''
            }} 
            timeAgo={post.timeAgo} 
            postType="group"
          />
          
          <div className="mt-4">
            <PostContent content={post.content} hashtags={post.hashtags} />
          </div>
          
          {post.isPoll && post.pollOptions && (
            <PostPoll 
              options={post.pollOptions} 
              userVoted={post.userVoted} 
              postId={post.id} 
              groupId={groupId}
            />
          )}
          
          {post.media && post.media.length > 0 && (
            <PostMedia media={post.media} />
          )}
          
          {post.files && post.files.length > 0 && (
            <PostFiles files={post.files} />
          )}
          
          <div className="mt-4">
            <PostFooter 
              postId={post.id}
              likesCount={likesCount} 
              commentsCount={post.comments} 
              liked={liked}
              onLikeClick={handleLike}
              onCommentClick={() => setShowComments(!showComments)}
            />
          </div>
          
          {showComments && (
            <div className="mt-4 space-y-4">
              <CommentInput 
                commentText={newComment}
                setCommentText={setNewComment}
                onAddComment={handleAddComment}
                disabled={commentLoading}
              />
              
              <CommentsList 
                comments={comments}
                loadingComments={loadingComments}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
                onAddReply={handleAddReply}
                disabled={commentLoading}
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
