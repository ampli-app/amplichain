
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SocialFeedContent } from '@/components/SocialFeedContent';
import { UserSuggestions } from '@/components/UserSuggestions';
import { CreatePost } from '@/components/CreatePost';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSocial } from '@/contexts/SocialContext';
import { Globe, Users, Star, Filter } from 'lucide-react';

export default function SocialFeed() {
  const { posts } = useSocial();
  const [feedType, setFeedType] = useState<'all' | 'following' | 'connections'>('all');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredPosts = posts.filter(post => {
    if (feedType === 'all') return true;
    // In a real app, we would filter based on the actual connection status
    // For now, we'll just show all posts for demo purposes
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main feed */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold">Social Feed</h1>
                  
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                
                <Tabs 
                  value={feedType} 
                  onValueChange={(value) => setFeedType(value as 'all' | 'following' | 'connections')}
                  className="mb-6"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all" className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      <span>All</span>
                    </TabsTrigger>
                    <TabsTrigger value="following" className="flex items-center gap-1.5">
                      <Star className="h-4 w-4" />
                      <span>Following</span>
                    </TabsTrigger>
                    <TabsTrigger value="connections" className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>Connections</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <CreatePost />
                
                <SocialFeedContent posts={filteredPosts} />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                <UserSuggestions />
                
                <div className="glass-card rounded-xl border p-5">
                  <h3 className="font-semibold mb-4">Trending Topics</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">#MusicProduction</p>
                      <p className="text-sm text-rhythm-500">1,245 posts</p>
                    </div>
                    <div>
                      <p className="font-medium">#StudioLife</p>
                      <p className="text-sm text-rhythm-500">879 posts</p>
                    </div>
                    <div>
                      <p className="font-medium">#NewRelease</p>
                      <p className="text-sm text-rhythm-500">652 posts</p>
                    </div>
                    <div>
                      <p className="font-medium">#MusicTech</p>
                      <p className="text-sm text-rhythm-500">524 posts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
