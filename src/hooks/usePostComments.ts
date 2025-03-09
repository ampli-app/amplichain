
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment, formatComments } from '@/utils/commentUtils';

export function usePostComments(postId: string, showComments: boolean) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [postId, showComments]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Pobierz główne komentarze (bez rodzica)
      const { data: mainComments, error: commentsError } = await supabase
        .from('feed_post_comments')
        .select('*')
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Błąd podczas pobierania komentarzy:', commentsError);
        setLoading(false);
        return;
      }

      // Pobierz odpowiedzi (z rodzicem)
      const { data: replies, error: repliesError } = await supabase
        .from('feed_post_comments')
        .select('*')
        .eq('post_id', postId)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true });

      if (repliesError) {
        console.error('Błąd podczas pobierania odpowiedzi:', repliesError);
        setLoading(false);
        return;
      }

      // Pobierz dane użytkowników
      const userIds = [...new Set([
        ...mainComments.map(comment => comment.user_id),
        ...replies.map(reply => reply.user_id)
      ])];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Błąd podczas pobierania profili:', profilesError);
        setLoading(false);
        return;
      }

      // Formatuj komentarze z odpowiedziami
      const formattedComments = formatComments(mainComments, replies, profiles);
      setComments(formattedComments);
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
    } finally {
      setLoading(false);
    }
  };

  return { comments, loading, fetchComments };
}
