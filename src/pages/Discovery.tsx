
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Save, MessageCircle, PlusCircle, Filter, UserPlus, CheckCircle, UserCheck, Users, User, Globe, ChevronDown, Copy, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { CreatePostModal } from '@/components/CreatePostModal';
import { SocialFeedContent } from '@/components/social/SocialFeedContent';
import { Post } from '@/types/social';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  role: string;
  bio: string;
  website: string;
  location: string;
  created_at: string;
  updated_at: string;
  email: string;
}

const calculateTimeAgo = (createdAt: string): string => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sek. temu`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min. temu`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} godz. temu`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} dni temu`;
  }
};

export default function Discovery() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { posts: socialPosts } = useSocial();
  
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        
        // Transform the raw post data to match Post type
        const transformedPosts: Post[] = (data || []).map(post => ({
          id: post.id,
          userId: post.user_id,
          author: {
            name: 'Loading...', // Will be populated later
            avatar: '/placeholder.svg',
            role: ''
          },
          timeAgo: calculateTimeAgo(post.created_at),
          content: post.content,
          mediaUrl: post.media_url || undefined,
          likes: 0,
          comments: 0,
          hashtags: []
        }));
        
        setPosts(transformedPosts);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        // Transform the data to match UserProfile type
        const transformedProfiles: UserProfile[] = data.map(profile => ({
          id: profile.id,
          full_name: profile.full_name || '',
          username: profile.username || '',
          avatar_url: profile.avatar_url || '',
          role: profile.role || '',
          bio: profile.bio || '',
          website: profile.website || '',
          location: profile.location || '',
          created_at: profile.joined_date || '',
          updated_at: profile.updated_at || '',
          email: '' // This field might not be in your profiles table, but required by UserProfile
        }));
        
        setProfiles(transformedProfiles);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Odkrywaj</h1>
          <p className="text-gray-600 dark:text-gray-400">Poznaj nowych mentorów, oferty i treści</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {socialPosts && socialPosts.length > 0 ? (
              <SocialFeedContent posts={socialPosts} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Ładowanie postów...</p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sugerowane profile</h2>
                <div className="space-y-4">
                  {profiles.slice(0, 5).map((profile) => (
                    <div key={profile.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || '/placeholder.svg'} alt={profile.full_name} />
                        <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{profile.full_name}</h3>
                        <p className="text-sm text-gray-500 truncate">{profile.role}</p>
                      </div>
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Śledź
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link to="/connections">Zobacz więcej</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Popularne hashtagi</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #mentoring
                  </Badge>
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #przedsiębiorczość
                  </Badge>
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #networking
                  </Badge>
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #rozwój
                  </Badge>
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #wiedza
                  </Badge>
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #technologia
                  </Badge>
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #innowacje
                  </Badge>
                  <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                    #biznes
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
