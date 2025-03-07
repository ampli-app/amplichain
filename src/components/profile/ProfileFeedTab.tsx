
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostItem } from '@/components/social/PostItem';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Rss } from 'lucide-react';

interface ProfileFeedTabProps {
  profileId: string;
}

export function ProfileFeedTab({ profileId }: ProfileFeedTabProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    async function fetchUserPosts() {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('feed_posts')
          .select(`
            id,
            content,
            created_at,
            is_poll,
            feed_post_media (id, url, type),
            feed_post_files (id, name, url, type, size),
            feed_post_poll_options (
              id, 
              text,
              feed_post_poll_votes (id, user_id)
            ),
            feed_post_likes (id, user_id),
            feed_post_comments (id)
          `)
          .eq('user_id', profileId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Błąd pobierania postów:', error);
          return;
        }
        
        // Pobierz dane profilu użytkownika dla postów
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('id', profileId)
          .single();
          
        if (profileError) {
          console.error('Błąd pobierania profilu:', profileError);
        }
        
        // Przetwórz dane postów
        const processedPosts = data?.map(post => {
          // Przetwórz media
          const media = post.feed_post_media?.map((m: any) => ({
            url: m.url,
            type: m.type
          })) || [];
          
          // Przetwórz pliki
          const files = post.feed_post_files?.map((f: any) => ({
            name: f.name,
            url: f.url,
            type: f.type,
            size: f.size
          })) || [];
          
          // Przetwórz opcje ankiety
          const pollOptions = post.is_poll ? post.feed_post_poll_options?.map((option: any) => ({
            id: option.id,
            text: option.text,
            votes: option.feed_post_poll_votes?.length || 0
          })) : undefined;
          
          // Sprawdź, czy użytkownik zagłosował
          const userVoted = post.is_poll && user ? 
            (post.feed_post_poll_options?.find((option: any) => 
              option.feed_post_poll_votes?.some((vote: any) => vote.user_id === user.id)
            )?.id || undefined) : 
            undefined;
          
          // Sprawdź, czy bieżący użytkownik polubił post
          const userLiked = user ? post.feed_post_likes?.some((like: any) => like.user_id === user.id) : false;
          
          // Utwórz obiekt posta
          return {
            id: post.id,
            userId: profileId,
            content: post.content,
            author: {
              name: profileData?.full_name || 'Nieznany użytkownik',
              avatar: profileData?.avatar_url || '',
              role: profileData?.role || ''
            },
            createdAt: post.created_at,
            timeAgo: formatTimeAgo(new Date(post.created_at)),
            isPoll: post.is_poll || false,
            pollOptions,
            userVoted,
            userLiked,
            likes: post.feed_post_likes?.length || 0,
            comments: post.feed_post_comments?.length || 0,
            media: media.length > 0 ? media : undefined,
            files: files.length > 0 ? files : undefined
          };
        }) || [];
        
        setPosts(processedPosts);
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (profileId) {
      fetchUserPosts();
    }
  }, [profileId, user]);
  
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-muted">
        <Rss className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Brak postów</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          Ten użytkownik nie opublikował jeszcze żadnych postów.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostItem 
          key={post.id}
          post={post}
          onLikeClick={() => {}}
          onCommentClick={() => {}}
        />
      ))}
    </div>
  );
}

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
