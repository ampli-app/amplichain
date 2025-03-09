import { useEffect, useState } from 'react';
import { GroupPost } from '@/types/group';
import { PostItem } from './posts/PostItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { convertEmoticons } from '@/utils/emoticonUtils';

interface GroupPostsListProps {
  posts: GroupPost[];
  searchQuery: string;
  groupId?: string;
}

export function GroupPostsList({ posts: initialPosts, searchQuery, groupId }: GroupPostsListProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<GroupPost[]>(initialPosts);
  const [loading, setLoading] = useState(groupId ? true : false);

  useEffect(() => {
    if (groupId) {
      fetchPosts();
    } else {
      setPosts(initialPosts);
    }
  }, [groupId, initialPosts]);
  
  const fetchPosts = async () => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from('group_posts')
        .select(`
          id,
          content,
          created_at,
          is_poll,
          user_id,
          group_post_media (id, url, type),
          group_post_files (id, name, url, type, size),
          group_post_poll_options (
            id, 
            text,
            group_post_poll_votes (id, user_id)
          ),
          group_post_likes (id, user_id),
          group_post_comments (id)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Błąd podczas pobierania postów:', error);
        return;
      }

      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (usersError) {
        console.error('Błąd podczas pobierania danych użytkowników:', usersError);
      }

      const formattedPosts: GroupPost[] = postsData?.map(post => {
        const authorProfile = usersData?.find(user => user.id === post.user_id);
        
        const author = authorProfile ? {
          id: authorProfile.id,
          name: authorProfile.full_name || 'Nieznany użytkownik',
          avatar: authorProfile.avatar_url || ''
        } : { 
          id: post.user_id, 
          name: 'Nieznany użytkownik', 
          avatar: '' 
        };
        
        const media = post.group_post_media?.map(media => ({
          url: media.url,
          type: media.type as 'image' | 'video'
        })) || [];
        
        const files = post.group_post_files?.map(file => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size
        })) || [];
        
        const pollOptions = post.is_poll ? post.group_post_poll_options?.map(option => ({
          id: option.id,
          text: option.text,
          votes: option.group_post_poll_votes?.length || 0
        })) : undefined;
        
        const userVoted = post.is_poll && user ? 
          (post.group_post_poll_options?.find(option => 
            option.group_post_poll_votes?.some(vote => vote.user_id === user.id)
          )?.id || undefined) : 
          undefined;
        
        const timeAgo = formatTimeAgo(new Date(post.created_at));
        
        const userLiked = user ? post.group_post_likes?.some(like => like.user_id === user.id) : false;
        
        return {
          id: post.id,
          content: post.content,
          author,
          createdAt: post.created_at,
          timeAgo,
          media: media.length > 0 ? media : undefined,
          files: files.length > 0 ? files : undefined,
          likes: post.group_post_likes?.length || 0,
          comments: post.group_post_comments?.length || 0,
          isPoll: post.is_poll || false,
          pollOptions,
          userVoted,
          userLiked
        };
      }) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby polubić post",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isLiked) {
        await supabase
          .from('group_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('group_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }
      
      fetchPosts();
    } catch (error) {
      console.error('Błąd podczas aktualizacji polubienia:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować polubienia",
        variant: "destructive"
      });
    }
  };
  
  const handleAddComment = async (postId: string, content: string) => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby dodać komentarz",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) return;
    
    try {
      const convertedContent = convertEmoticons(content.trim());
      
      await supabase
        .from('group_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: convertedContent
        });
      
      fetchPosts();
      
      return true;
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać komentarza",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleAddReply = async (postId: string, parentCommentId: string, content: string) => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby odpowiedzieć na komentarz",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) return;
    
    try {
      const convertedContent = convertEmoticons(content.trim());
      
      await supabase
        .from('group_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: convertedContent,
          parent_id: parentCommentId
        });
      
      fetchPosts();
      
      return true;
    } catch (error) {
      console.error('Błąd podczas dodawania odpowiedzi:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać odpowiedzi",
        variant: "destructive"
      });
      return false;
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-6 w-3/4 rounded mb-2"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium mb-2">Brak wyników dla "{searchQuery}"</h3>
            <p className="text-muted-foreground">Spróbuj innych słów kluczowych</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">Brak postów</h3>
            <p className="text-muted-foreground">Bądź pierwszy i napisz coś w tej grupie!</p>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {filteredPosts.map((post, index) => (
        <PostItem 
          key={post.id} 
          post={post} 
          index={index} 
          onLikeToggle={handleLikeToggle}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          groupId={groupId}
        />
      ))}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  if (diffYear > 0) {
    return `${diffYear} ${diffYear === 1 ? 'rok' : diffYear < 5 ? 'lata' : 'lat'} temu`;
  } else if (diffMonth > 0) {
    return `${diffMonth} ${diffMonth === 1 ? 'miesiąc' : diffMonth < 5 ? 'miesiące' : 'miesięcy'} temu`;
  } else if (diffDay > 0) {
    return `${diffDay} ${diffDay === 1 ? 'dzień' : 'dni'} temu`;
  } else if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'godz.' : 'godz.'} temu`;
  } else if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'min.' : 'min.'} temu`;
  } else {
    return 'przed chwilą';
  }
}
