
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialFeedContent } from '@/components/social/SocialFeedContent';
import { Post } from '@/types/social';

export function FeedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        // Przekształć surowe dane do formatu Post
        const formattedPosts = await Promise.all(
          (data || []).map(async (post) => {
            // Pobierz profil użytkownika
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, role')
              .eq('id', post.user_id)
              .single();
            
            // Oblicz względny czas
            const createdDate = new Date(post.created_at);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
            
            let timeAgo;
            if (diffInSeconds < 60) {
              timeAgo = `${diffInSeconds} sek. temu`;
            } else if (diffInSeconds < 3600) {
              timeAgo = `${Math.floor(diffInSeconds / 60)} min. temu`;
            } else if (diffInSeconds < 86400) {
              timeAgo = `${Math.floor(diffInSeconds / 3600)} godz. temu`;
            } else {
              timeAgo = `${Math.floor(diffInSeconds / 86400)} dni temu`;
            }
            
            return {
              id: post.id,
              userId: post.user_id,
              author: {
                name: profileData?.full_name || 'Użytkownik',
                avatar: profileData?.avatar_url || '/placeholder.svg',
                role: profileData?.role || '',
              },
              timeAgo,
              content: post.content,
              mediaUrl: post.media_url,
              likes: 0,
              comments: 0,
              hashtags: []
            };
          })
        );
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Błąd pobierania postów:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Ładowanie postów...</div>;
  }

  return (
    <div className="mb-12">
      <h3 className="text-lg font-medium mb-4">Feed</h3>
      <SocialFeedContent posts={posts} />
    </div>
  );
}
