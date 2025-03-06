
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DiscoverHero } from '@/components/discover/DiscoverHero';
import { DiscoverSlider } from '@/components/discover/DiscoverSlider';
import { SuggestedProfilesSection } from '@/components/discover/SuggestedProfilesSection';
import { PopularHashtagsSection } from '@/components/discover/PopularHashtagsSection';
import { GroupsSection } from '@/components/discover/GroupsSection';
import { FeedSection } from '@/components/discover/FeedSection';
import { MarketplaceSection } from '@/components/discover/MarketplaceSection';
import { FeatureCard } from '@/components/discover/FeatureCard';
import { supabase } from '@/integrations/supabase/client';
import { useDiscoverSliders } from '@/hooks/useDiscoverSliders';
import { Post } from '@/types/social';

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const { sliders, loading: slidersLoading } = useDiscoverSliders();
  
  useEffect(() => {
    // Ładuj dane tylko raz przy montowaniu
    loadData();
  }, []);
  
  const loadData = async () => {
    await fetchTrendingPosts();
  };
  
  // Pobierz popularne posty
  const fetchTrendingPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }
      
      const formattedPosts = await Promise.all(
        (postsData || []).map(async (post) => {
          // Pobierz profil użytkownika
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('id', post.user_id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }
          
          // Oblicz czas względny
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
          
          // Pobierz media
          const { data: mediaData, error: mediaError } = await supabase
            .from('feed_post_media')
            .select('url, type')
            .eq('post_id', post.id);
            
          if (mediaError) {
            console.error('Error fetching media:', mediaError);
          }
          
          // Pobierz liczbę komentarzy
          const { count: commentsCount, error: commentsError } = await supabase
            .from('feed_post_comments')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          if (commentsError) {
            console.error('Error fetching comments count:', commentsError);
          }
          
          // Pobierz liczbę polubień
          const { count: likesCount, error: likesError } = await supabase
            .from('feed_post_likes')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          if (likesError) {
            console.error('Error fetching likes count:', likesError);
          }
          
          // Pobierz hashtagi
          const { data: tagData, error: tagError } = await supabase
            .from('feed_post_hashtags')
            .select(`
              hashtag_id,
              hashtags (name)
            `)
            .eq('post_id', post.id);
          
          if (tagError) {
            console.error('Error fetching hashtags:', tagError);
          }
          
          const hashtags = tagData 
            ? tagData.map((t) => t.hashtags?.name).filter(Boolean) as string[]
            : [];
          
          return {
            id: post.id,
            userId: post.user_id,
            author: {
              name: profileData?.full_name || 'Użytkownik',
              avatar: profileData?.avatar_url || '/placeholder.svg',
              role: profileData?.role || '',
            },
            content: post.content,
            createdAt: post.created_at,
            timeAgo,
            likes: likesCount || 0,
            comments: commentsCount || 0,
            hashtags,
            media: mediaData && mediaData.length > 0 ? mediaData.map(m => ({
              url: m.url,
              type: m.type as 'image' | 'video'
            })) : undefined,
            // Dla kompatybilności z pozostałymi komponentami
            isPoll: post.is_poll || false
          };
        })
      );
      
      setTrendingPosts(formattedPosts);
    } catch (error) {
      console.error('Unexpected error fetching trending posts:', error);
    }
  };
  
  const handleSearch = () => {
    console.log('Szukaj:', searchQuery);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10 pr-24"
                placeholder="Szukaj w serwisie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                className="absolute right-0 top-0 h-full rounded-l-none"
                onClick={handleSearch}
              >
                Szukaj
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="all">Wszystko</TabsTrigger>
                <TabsTrigger value="feed">Posty</TabsTrigger>
                <TabsTrigger value="groups">Grupy</TabsTrigger>
                <TabsTrigger value="marketplace">Produkty</TabsTrigger>
                <TabsTrigger value="users">Użytkownicy</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-12">
              {!slidersLoading && sliders.length > 0 && (
                <div className="mb-12">
                  <DiscoverSlider sliders={sliders} />
                </div>
              )}
              
              <DiscoverHero 
                title="Odkrywaj, Łącz, Twórz"
                description="Znajdź inspirujące osoby, grupy i produkty w swojej branży. Przeglądaj popularne treści i dołącz do społeczności."
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon="users"
                  title="Połącz się z profesjonalistami"
                  description="Buduj sieć kontaktów z ekspertami z Twojej branży."
                  link="/connections"
                  linkText="Poznaj osoby"
                />
                <FeatureCard
                  icon="groups"
                  title="Dołącz do grup branżowych"
                  description="Znajdź społeczności związane z Twoimi zainteresowaniami."
                  link="/groups"
                  linkText="Przeglądaj grupy"
                />
                <FeatureCard
                  icon="shopping"
                  title="Odkryj produkty i usługi"
                  description="Przeglądaj oferty specjalistów z Twojej branży."
                  link="/marketplace"
                  linkText="Idź do marketplace"
                />
              </div>
              
              <SuggestedProfilesSection />
              
              <FeedSection />
              
              <PopularHashtagsSection />
              
              <GroupsSection />
              
              <MarketplaceSection />
            </TabsContent>
            
            <TabsContent value="feed">
              <FeedSection />
            </TabsContent>
            
            <TabsContent value="groups">
              <GroupsSection fullView />
            </TabsContent>
            
            <TabsContent value="marketplace">
              <MarketplaceSection fullView />
            </TabsContent>
            
            <TabsContent value="users">
              <SuggestedProfilesSection fullView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
