
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeSubscriptions = (onDataChange: () => void) => {
  // Ustawienie słuchacza zmian w czasie rzeczywistym na odpowiednich tabelach
  const setUpRealtimeSubscriptions = () => {
    // Subskrypcja na zmiany w postach
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          onDataChange();
        }
      )
      .subscribe();
    
    // Subskrypcja na zmiany w polubieniach postów
    const likesChannel = supabase
      .channel('public:post_likes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => {
          onDataChange();
        }
      )
      .subscribe();
      
    // Subskrypcja na zmiany w zapisanych postach
    const savedChannel = supabase
      .channel('public:saved_posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'saved_posts' },
        () => {
          onDataChange();
        }
      )
      .subscribe();
    
    // Subskrypcja na zmiany w komentarzach
    const commentsChannel = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          onDataChange();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(savedChannel);
      supabase.removeChannel(commentsChannel);
    };
  };

  return {
    setUpRealtimeSubscriptions
  };
};
