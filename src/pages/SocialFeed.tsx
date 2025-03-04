
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SocialFeedContent } from '@/components/social/SocialFeedContent';
import { UserSuggestions } from '@/components/UserSuggestions';
import { CreatePost } from '@/components/CreatePost';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Users, Star, Filter, LogIn, Rss, PlusCircle } from 'lucide-react';
import { CreatePostModal } from '@/components/CreatePostModal';

export default function SocialFeed() {
  const { isLoggedIn } = useAuth();
  const { posts, getPopularHashtags } = useSocial();
  const [feedType, setFeedType] = useState<'all' | 'following' | 'connections'>('all');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [popularHashtags, setPopularHashtags] = useState<{name: string, postsCount: number}[]>([]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    loadHashtags();
  }, []);
  
  const loadHashtags = async () => {
    const hashtags = await getPopularHashtags();
    setPopularHashtags(hashtags.map(h => ({
      name: h.name,
      postsCount: h.postsCount
    })));
  };

  // If user is not logged in, show a prompt to log in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 pt-24 pb-16 flex items-center">
          <div className="container px-4 mx-auto">
            <div className="max-w-md mx-auto text-center">
              <div className="p-8 border rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm">
                <div className="mb-6 p-3 w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Rss className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Join the Conversation</h1>
                <p className="text-rhythm-600 mb-6">
                  Sign in to access your personalized feed, share updates, and engage with other music industry professionals.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/signup">Create Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  const filteredPosts = posts.filter(post => {
    if (feedType === 'all') return true;
    // W rzeczywistej aplikacji filtrowanie byłoby oparte na rzeczywistym statusie połączenia
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
                  <h3 className="font-semibold mb-4">Popularne hashtagi</h3>
                  <div className="space-y-3">
                    {popularHashtags.map((tag, index) => (
                      <div key={index}>
                        <Link 
                          to={`/hashtag/${tag.name}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          #{tag.name}
                        </Link>
                        <p className="text-sm text-rhythm-500">{tag.postsCount} postów</p>
                      </div>
                    ))}
                    {popularHashtags.length === 0 && (
                      <p className="text-sm text-rhythm-500">Brak popularnych hashtagów</p>
                    )}
                  </div>
                </div>
              </div>
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
