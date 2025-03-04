
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FeedPreview } from '@/components/FeedPreview';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { CreatePostModal } from '@/components/CreatePostModal';
import { SocialFeedContent } from '@/components/social/SocialFeedContent';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Feed() {
  const { isLoggedIn } = useAuth();
  const { posts, loading } = useSocial();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            
            <div className="w-full">
              {isLoggedIn ? (
                loading ? (
                  <div className="text-center py-8">Ładowanie postów...</div>
                ) : posts.length > 0 ? (
                  <SocialFeedContent posts={posts} />
                ) : (
                  <FeedPreview />
                )
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
      />
      
      <Footer />
    </div>
  );
}
