
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

export default function Feed() {
  const { isLoggedIn } = useAuth();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
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

      if (error) {
        throw new Error('Nie udało się pobrać postów');
      }

      return data || [];
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
