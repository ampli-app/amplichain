
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommentsList } from '../comments/CommentsList';
import { CommentInput } from '../comments/CommentInput';

interface PostCommentsSectionProps {
  postId: string;
  showComments: boolean;
  newComment: string;
  setNewComment: (comment: string) => void;
  commentLoading: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onAddComment: () => void;
  onAddReply: (commentId: string) => void;
}

export function PostCommentsSection({
  postId,
  showComments,
  newComment,
  setNewComment,
  commentLoading,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onAddComment,
  onAddReply
}: PostCommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

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
        .eq('post_id', postId)
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
  }, [showComments, postId]);

  if (!showComments) return null;
  
  return (
    <div className="mt-4 space-y-4">
      <CommentInput 
        commentText={newComment}
        setCommentText={setNewComment}
        onAddComment={onAddComment}
        disabled={commentLoading}
      />
      
      <CommentsList 
        comments={comments}
        loadingComments={loadingComments}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        replyText={replyText}
        setReplyText={setReplyText}
        onAddReply={onAddReply}
        disabled={commentLoading}
      />
    </div>
  );
}
