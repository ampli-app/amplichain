
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/utils/commentUtils';
import { fetchPostComments, addComment, addReply } from '@/services/commentService';

export const usePostComments = (postId: string, enabled = false) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setLoadingComments(true);
    try {
      const commentsData = await fetchPostComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Błąd podczas pobierania komentarzy:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);
  
  // Dodawanie komentarza
  const handleAddComment = async (content: string) => {
    if (!user || !content.trim()) return false;
    
    try {
      const success = await addComment(postId, user.id, content);
      
      if (success) {
        await fetchComments();
      }
      
      return success;
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
      return false;
    }
  };
  
  // Dodawanie odpowiedzi na komentarz
  const handleAddReply = async (commentId: string, content: string) => {
    if (!user || !commentId || !content.trim()) return false;
    
    try {
      const success = await addReply(postId, user.id, commentId, content);
      
      if (success) {
        await fetchComments();
      }
      
      return success;
    } catch (error) {
      console.error('Błąd podczas dodawania odpowiedzi:', error);
      return false;
    }
  };
  
  return {
    comments,
    loadingComments,
    fetchComments,
    addComment: handleAddComment,
    addReply: handleAddReply,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText
  };
};
