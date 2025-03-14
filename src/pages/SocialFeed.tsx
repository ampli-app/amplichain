
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FeedPostsList } from '@/components/social/FeedPostsList';
import { UserSuggestions } from '@/components/UserSuggestions';
import { FeedPostCreate } from '@/components/social/FeedPostCreate';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Users, Star, Filter, LogIn, Rss, PlusCircle } from 'lucide-react';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useSocial } from '@/contexts/SocialContext';

export default function SocialFeed() {
  const { isLoggedIn } = useAuth();
  const { getPopularHashtags } = useSocial();
  const [feedType, setFeedType] = useState<'all' | 'following' | 'connections'>('all');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [popularHashtags, setPopularHashtags] = useState<{id: string, name: string, postsCount: number}[]>([]);
  const [reload, setReload] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    loadHashtags();
  }, []);
  
  const loadHashtags = async () => {
    try {
      const hashtags = await getPopularHashtags();
      setPopularHashtags(hashtags);
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas ładowania hashtagów:', error);
    }
  };
  
  const handlePostCreated = () => {
    // Odśwież listę postów
    setReload(prev => !prev);
    // Odśwież listę hashtagów
    loadHashtags();
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
                <h1 className="text-2xl font-bold mb-2">Dołącz do konwersacji</h1>
                <p className="text-rhythm-600 mb-6">
                  Zaloguj się, aby uzyskać dostęp do spersonalizowanego feedu, udostępniać aktualizacje i angażować się z innymi profesjonalistami z branży muzycznej.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Zaloguj się
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/signup">Utwórz konto</Link>
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
                      Filtruj
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
                      <span>Wszyscy</span>
                    </TabsTrigger>
                    <TabsTrigger value="following" className="flex items-center gap-1.5">
                      <Star className="h-4 w-4" />
                      <span>Obserwowani</span>
                    </TabsTrigger>
                    <TabsTrigger value="connections" className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>Połączeni</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <FeedPostCreate onPostCreated={handlePostCreated} />
                
                <FeedPostsList posts={[]} key={String(reload)} />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                <UserSuggestions />
                
                <div className="glass-card rounded-xl border p-5">
                  <h3 className="font-semibold mb-4">Popularne hashtagi</h3>
                  <div className="space-y-3">
                    {popularHashtags.map((tag) => (
                      <div key={tag.id}>
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
