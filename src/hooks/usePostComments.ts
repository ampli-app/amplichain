
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { convertEmoticons } from '@/components/social/PostCommentSection';

interface Comment {
  id: string;
  author: { id: string; name: string; avatar: string };
  content: string;
  timeAgo: string;
  replies: Array<{
    id: string;
    author: { id: string; name: string; avatar: string };
    content: string;
    timeAgo: string;
  }>;
}

export function usePostComments(postId: string, shouldFetch: boolean) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setLoadingComments(true);
    try {
      // Pobierz komentarze główne
      const { data: commentsData, error } = await supabase
        .from('feed_post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Błąd podczas pobierania komentarzy:', error);
        setLoadingComments(false);
        return;
      }
      
      // Pobierz odpowiedzi na komentarze
      const { data: repliesData, error: repliesError } = await supabase
        .from('feed_post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id
        `)
        .eq('post_id', postId)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true });
        
      if (repliesError) {
        console.error('Błąd podczas pobierania odpowiedzi:', repliesError);
      }
      
      // Pobierz dane autorów komentarzy i odpowiedzi
      const userIds = [
        ...new Set([
          ...(commentsData?.map(comment => comment.user_id) || []),
          ...(repliesData?.map(reply => reply.user_id) || [])
        ])
      ];
      
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
        
      if (usersError) {
        console.error('Błąd podczas pobierania danych użytkowników:', usersError);
      }
      
      // Formatuj komentarze z dołączonymi odpowiedziami
      const formattedComments = commentsData?.map(comment => {
        const authorProfile = usersData?.find(user => user.id === comment.user_id);
        const commentReplies = repliesData
          ?.filter(reply => reply.parent_id === comment.id)
          .map(reply => {
            const replyAuthorProfile = usersData?.find(user => user.id === reply.user_id);
            return {
              id: reply.id,
              author: {
                id: reply.user_id,
                name: replyAuthorProfile?.full_name || 'Nieznany użytkownik',
                avatar: replyAuthorProfile?.avatar_url || ''
              },
              content: reply.content,
              timeAgo: formatTimeAgo(new Date(reply.created_at))
            };
          }) || [];
          
        return {
          id: comment.id,
          author: {
            id: comment.user_id,
            name: authorProfile?.full_name || 'Nieznany użytkownik',
            avatar: authorProfile?.avatar_url || ''
          },
          content: comment.content,
          timeAgo: formatTimeAgo(new Date(comment.created_at)),
          replies: commentReplies
        };
      }) || [];
      
      setComments(formattedComments);
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania komentarzy:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);
  
  // Helper function to format time
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
  
  return {
    comments,
    loadingComments,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    fetchComments
  };
}
