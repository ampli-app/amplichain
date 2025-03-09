
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { convertEmoticons } from '@/utils/emoticonUtils';

export const usePostComments = (postId: string, enabled = false) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setLoadingComments(true);
    try {
      // Pobierz komentarze dla danego posta
      const { data: commentsData, error: commentsError } = await supabase
        .from('feed_post_comments')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          profiles (id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error('Błąd pobierania komentarzy:', commentsError);
        setLoadingComments(false);
        return;
      }
      
      // Pobierz odpowiedzi dla tych komentarzy
      const parentIds = commentsData.map(comment => comment.id);
      
      const { data: repliesData, error: repliesError } = await supabase
        .from('feed_post_comments')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          parent_id,
          profiles (id, full_name, avatar_url)
        `)
        .in('parent_id', parentIds)
        .order('created_at', { ascending: true });
      
      if (repliesError) {
        console.error('Błąd pobierania odpowiedzi:', repliesError);
      }
      
      // Mapuj dane na format komentarzy
      const formattedComments = commentsData.map(comment => {
        // Znajdź odpowiedzi dla tego komentarza
        const commentReplies = repliesData?.filter(reply => reply.parent_id === comment.id) || [];
        
        // Formatuj czas dla komentarza
        const commentDate = new Date(comment.created_at);
        const timeAgo = formatTimeAgo(commentDate);
        
        // Formatuj odpowiedzi
        const formattedReplies = commentReplies.map(reply => {
          const replyDate = new Date(reply.created_at);
          const replyTimeAgo = formatTimeAgo(replyDate);
          
          return {
            id: reply.id,
            author: {
              id: reply.user_id,
              name: reply.profiles?.full_name || 'Użytkownik',
              avatar: reply.profiles?.avatar_url || ''
            },
            content: reply.content,
            timeAgo: replyTimeAgo
          };
        });
        
        // Zwróć sformatowany komentarz z odpowiedziami
        return {
          id: comment.id,
          author: {
            id: comment.user_id,
            name: comment.profiles?.full_name || 'Użytkownik',
            avatar: comment.profiles?.avatar_url || ''
          },
          content: comment.content,
          timeAgo,
          replies: formattedReplies
        };
      });
      
      setComments(formattedComments);
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);
  
  // Dodawanie komentarza
  const addComment = async (content: string) => {
    if (!user || !content.trim()) return false;
    
    try {
      // Konwertuj emotikony na emoji
      const convertedContent = convertEmoticons(content.trim());
      
      const { error } = await supabase
        .from('feed_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: convertedContent
        });
      
      if (error) {
        console.error('Błąd dodawania komentarza:', error);
        return false;
      }
      
      await fetchComments();
      return true;
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
      return false;
    }
  };
  
  // Dodawanie odpowiedzi na komentarz
  const addReply = async (commentId: string, content: string) => {
    if (!user || !commentId || !content.trim()) return false;
    
    try {
      // Konwertuj emotikony na emoji
      const convertedContent = convertEmoticons(content.trim());
      
      const { error } = await supabase
        .from('feed_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: convertedContent,
          parent_id: commentId
        });
      
      if (error) {
        console.error('Błąd dodawania odpowiedzi:', error);
        return false;
      }
      
      await fetchComments();
      return true;
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
      return false;
    }
  };
  
  return {
    comments,
    loadingComments,
    fetchComments,
    addComment,
    addReply,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText
  };
};

// Funkcja pomocnicza do formatowania czasu
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  if (diffYear > 0) {
    return `${diffYear} ${diffYear === 1 ? 'rok' : diffYear < 5 ? 'lata' : 'lat'} temu`;
  } else if (diffMonth > 0) {
    return `${diffMonth} ${diffMonth === 1 ? 'miesiąc' : diffMonth < 5 ? 'miesiące' : 'miesięcy'} temu`;
  } else if (diffDay > 0) {
    return `${diffDay} ${diffDay === 1 ? 'dzień' : 'dni'} temu`;
  } else if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'godz.' : 'godz.'} temu`;
  } else if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'min.' : 'min.'} temu`;
  } else {
    return 'przed chwilą';
  }
}
