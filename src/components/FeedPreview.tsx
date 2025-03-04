
import { User, Calendar, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocial } from '@/contexts/SocialContext';
import { CommentsDialog } from '@/components/CommentsDialog';
import { Link } from 'react-router-dom';
import { Post } from '@/types/social';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function FeedPreview() {
  const { likePost, unlikePost, savePost, unsavePost, loading: socialLoading } = useSocial();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPostIds, setLoadingPostIds] = useState<Set<string>>(new Set());
  
  const isPostLoading = (postId: string) => loadingPostIds.has(postId) || socialLoading;
  
  const handleLikeToggle = async (post: Post) => {
    if (isPostLoading(post.id)) return;
    
    // Optymistyczna aktualizacja UI
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === post.id 
          ? { 
              ...p, 
              hasLiked: !p.hasLiked, 
              likes: p.hasLiked ? Math.max(0, p.likes - 1) : p.likes + 1 
            } 
          : p
      )
    );
    
    setLoadingPostIds(prev => {
      const newSet = new Set(prev);
      newSet.add(post.id);
      return newSet;
    });
    
    try {
      if (post.hasLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Cofnij optymistyczną aktualizację w przypadku błędu
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { 
                ...p, 
                hasLiked: post.hasLiked, 
                likes: post.hasLiked ? p.likes + 1 : Math.max(0, p.likes - 1) 
              } 
            : p
        )
      );
    } finally {
      setLoadingPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
  };
  
  const handleSaveToggle = async (post: Post) => {
    if (isPostLoading(post.id)) return;
    
    // Optymistyczna aktualizacja UI
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === post.id 
          ? { ...p, hasSaved: !p.hasSaved } 
          : p
      )
    );
    
    setLoadingPostIds(prev => {
      const newSet = new Set(prev);
      newSet.add(post.id);
      return newSet;
    });
    
    try {
      if (post.hasSaved) {
        await unsavePost(post.id);
      } else {
        await savePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // Cofnij optymistyczną aktualizację w przypadku błędu
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { ...p, hasSaved: post.hasSaved } 
            : p
        )
      );
    } finally {
      setLoadingPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
  };
  
  useEffect(() => {
    // Pobierz kilka najnowszych postów dla podglądu
    const fetchPreviewPosts = async () => {
      try {
        setLoading(true);
        
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (postsError) {
          console.error('Error fetching preview posts:', postsError);
          return;
        }
        
        // Pobierz dane zalogowanego użytkownika, jeśli istnieje
        const { data: { user } } = await supabase.auth.getUser();
        
        const formattedPosts = await Promise.all(
          (postsData || []).map(async (post) => {
            // Pobierz profil użytkownika
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, role')
              .eq('id', post.user_id)
              .maybeSingle();
            
            if (profileError) {
              console.error('Error fetching user profile:', profileError);
            }
            
            // Tworzymy domyślny pusty profil na wypadek błędu
            const userProfile = {
              full_name: '',
              avatar_url: '/placeholder.svg',
              role: ''
            };
            
            // Sprawdzamy czy mamy dane profilu i czy to nie jest błąd
            if (profileData && typeof profileData === 'object' && 'full_name' in profileData) {
              userProfile.full_name = profileData.full_name || '';
              userProfile.avatar_url = profileData.avatar_url || '/placeholder.svg';
              userProfile.role = profileData.role || '';
            }
            
            // Pobierz liczbę polubień posta
            const { count: likesCount } = await supabase
              .from('post_likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
            
            // Pobierz liczbę komentarzy posta
            const { count: commentsCount } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
            
            // Pobierz liczbę zapisów posta
            const { count: savesCount } = await supabase
              .from('saved_posts')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
            
            // Sprawdź, czy zalogowany użytkownik polubił post
            let hasLiked = false;
            if (user) {
              const { data: likeData } = await supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .maybeSingle();
                
              hasLiked = !!likeData;
            }
            
            // Sprawdź, czy zalogowany użytkownik zapisał post
            let hasSaved = false;
            if (user) {
              const { data: saveData } = await supabase
                .from('saved_posts')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .maybeSingle();
                
              hasSaved = !!saveData;
            }
            
            // Pobierz hashtagi
            const { data: tagData } = await supabase
              .from('post_hashtags')
              .select(`
                hashtags:hashtag_id (name)
              `)
              .eq('post_id', post.id);
            
            const hashtags = tagData ? tagData.map((t) => t.hashtags?.name).filter(Boolean) : [];
            
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
            
            return {
              id: post.id,
              userId: post.user_id,
              author: {
                name: userProfile.full_name,
                avatar: userProfile.avatar_url,
                role: userProfile.role,
              },
              timeAgo,
              content: post.content,
              mediaUrl: post.media_url,
              likes: likesCount || 0,
              comments: commentsCount || 0,
              saves: savesCount || 0,
              hasLiked,
              hasSaved,
              hashtags
            };
          })
        );
        
        setPosts(formattedPosts);
      } catch (err) {
        console.error('Unexpected error fetching preview posts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreviewPosts();
  }, []);
  
  const formatContent = (content: string) => {
    // Zamień hashtagi na linki
    return content.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-primary hover:underline">#$1</a>');
  };
  
  return (
    <div className="w-full space-y-6">
      {loading ? (
        <div className="text-center py-8">Ładowanie postów...</div>
      ) : posts.length > 0 ? (
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 border w-full"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{post.author.name}</h3>
                      <div className="text-sm text-rhythm-500 flex items-center gap-2">
                        <span>{post.author.role}</span>
                        <span className="text-xs">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.timeAgo}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full flex-shrink-0" type="button">
                          <span className="sr-only">Więcej opcji</span>
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSaveToggle(post)}>
                          {post.hasSaved ? 'Usuń z zapisanych' : 'Zapisz post'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Zgłoś post</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div 
                    className="mt-2 mb-4 text-rhythm-700 break-words"
                    dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                  />
                  
                  {post.mediaUrl && (
                    <div className="mb-4 rounded-md overflow-hidden">
                      <img 
                        src={post.mediaUrl} 
                        alt="Post media" 
                        className="w-full h-auto max-h-96 object-cover" 
                      />
                    </div>
                  )}
                  
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.hashtags.map((tag) => (
                        <Link 
                          key={tag} 
                          to={`/hashtag/${tag}`}
                          className="text-sm text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-rhythm-500">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center gap-1 h-8 px-2 ${post.hasLiked ? 'text-red-500' : ''} ${isPostLoading(post.id) ? 'opacity-50' : ''}`}
                      onClick={() => handleLikeToggle(post)}
                      disabled={isPostLoading(post.id)}
                      type="button"
                    >
                      <Heart className={`h-4 w-4 transition-all ${post.hasLiked ? 'fill-red-500 scale-110' : ''}`} />
                      <span>{post.likes}</span>
                    </Button>
                    
                    <CommentsDialog 
                      postId={post.id}
                      commentsCount={post.comments}
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center gap-1 h-8 px-2 ${post.hasSaved ? 'text-primary' : ''} ${isPostLoading(post.id) ? 'opacity-50' : ''}`}
                      onClick={() => handleSaveToggle(post)}
                      disabled={isPostLoading(post.id)}
                      type="button"
                    >
                      <Bookmark className={`h-4 w-4 transition-all ${post.hasSaved ? 'fill-primary scale-110' : ''}`} />
                      <span>{post.hasSaved ? 'Zapisano' : 'Zapisz'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nie znaleziono żadnych postów do wyświetlenia</p>
        </div>
      )}
      
      <div className="text-center pt-6">
        <Button 
          variant="outline" 
          asChild
        >
          <Link to="/feed">Zobacz pełny feed</Link>
        </Button>
      </div>
    </div>
  );
}
