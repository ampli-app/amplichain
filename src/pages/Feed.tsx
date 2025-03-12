
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FeedPreview } from '@/components/FeedPreview';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { CreatePostModal } from '@/components/CreatePostModal';
import { FeedPostsList } from '@/components/social/FeedPostsList';
import { FeedPostCreate } from '@/components/social/FeedPostCreate';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/social';
import { formatTimeAgo } from '@/utils/timeFormatUtils';

export default function Feed() {
  const { isLoggedIn, user } = useAuth();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: async () => {
      // Pobierz dane postów
      const { data: postsData, error: postsError } = await supabase
        .from('feed_posts')
        .select(`
          *,
          feed_post_media (id, url, type),
          feed_post_files (id, name, url, type, size),
          feed_post_poll_options (
            id, 
            text,
            feed_post_poll_votes (id, user_id)
          ),
          feed_post_likes (id, user_id),
          feed_post_comments (id),
          feed_post_hashtags (
            hashtag_id,
            hashtags (id, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        throw new Error('Nie udało się pobrać postów');
      }

      if (!postsData || postsData.length === 0) {
        return [];
      }

      // Pobieramy dane profili dla wszystkich autorów postów
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', userIds);

      if (profilesError) {
        console.error('Błąd podczas pobierania profili:', profilesError);
      }

      // Konwertuj dane do formatu Post[]
      const formattedPosts: Post[] = postsData.map(post => {
        // Znajdź dane profilu dla autora posta
        const authorProfile = profilesData?.find(profile => profile.id === post.user_id);
        
        // Przygotuj autora
        const author = {
          name: authorProfile?.full_name || 'Nieznany użytkownik',
          avatar: authorProfile?.avatar_url || '',
          role: authorProfile?.role || ''
        };
        
        // Przygotuj media
        const media = post.feed_post_media?.map(media => ({
          url: media.url,
          type: media.type as 'image' | 'video'
        })) || [];
        
        // Przygotuj pliki
        const files = post.feed_post_files?.map(file => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size
        })) || [];
        
        // Przygotuj opcje ankiety
        const pollOptions = post.is_poll ? post.feed_post_poll_options?.map(option => ({
          id: option.id,
          text: option.text,
          votes: option.feed_post_poll_votes?.length || 0
        })) : undefined;
        
        // Sprawdź, czy użytkownik zagłosował
        const userVoted = post.is_poll && user ? 
          post.feed_post_poll_options?.find(option => 
            option.feed_post_poll_votes?.some(vote => vote.user_id === user.id)
          )?.id : 
          undefined;
        
        // Przygotuj hashtagi
        const hashtags = post.feed_post_hashtags
          ?.filter(ph => ph.hashtags)
          .map(ph => ph.hashtags.name) || [];
        
        // Sprawdź, czy użytkownik polubił post
        const userLiked = user ? post.feed_post_likes?.some(like => like.user_id === user.id) : false;
        
        return {
          id: post.id,
          userId: post.user_id,
          content: post.content,
          author,
          createdAt: post.created_at,
          timeAgo: formatTimeAgo(new Date(post.created_at)),
          media: media.length > 0 ? media : undefined,
          files: files.length > 0 ? files : undefined,
          isPoll: post.is_poll || false,
          pollOptions,
          userVoted,
          likes: post.feed_post_likes?.length || 0,
          comments: post.feed_post_comments?.length || 0,
          userLiked,
          hashtags: hashtags.length > 0 ? hashtags : undefined
        };
      });

      return formattedPosts;
    },
    enabled: isLoggedIn
  });

  if (error) {
    toast({
      title: "Błąd",
      description: "Wystąpił błąd podczas ładowania postów",
      variant: "destructive",
    });
  }

  const handlePostCreated = () => {
    setIsCreatePostModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 w-full">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold">Industry Feed</h1>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setIsCreatePostModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Nowy Post
                </Button>
              </div>
            </div>
            
            <div className="w-full space-y-6">
              {isLoggedIn && (
                <FeedPostCreate onPostCreated={handlePostCreated} />
              )}
              
              {isLoggedIn ? (
                <>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p>Ładowanie postów...</p>
                    </div>
                  ) : (
                    <FeedPostsList posts={posts || []} />
                  )}
                </>
              ) : (
                <FeedPreview />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
      
      <Footer />
    </div>
  );
}
