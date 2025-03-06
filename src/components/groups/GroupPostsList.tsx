
import { useEffect, useState } from 'react';
import { GroupPost } from '@/types/group';
import { PostItem } from './posts/PostItem';
import { supabase } from '@/integrations/supabase/client';

interface GroupPostsListProps {
  posts: GroupPost[];
  searchQuery: string;
  groupId?: string;
}

export function GroupPostsList({ posts: initialPosts, searchQuery, groupId }: GroupPostsListProps) {
  const [posts, setPosts] = useState<GroupPost[]>(initialPosts);
  const [loading, setLoading] = useState(groupId ? true : false);

  useEffect(() => {
    // Jeśli mamy groupId, pobieramy posty z Supabase
    if (groupId) {
      const fetchPosts = async () => {
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

          // Pobierz dane autorów postów
          const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          if (usersError) {
            console.error('Błąd podczas pobierania danych użytkowników:', usersError);
          }

          // Przetwórz dane na format GroupPost
          const formattedPosts: GroupPost[] = postsData?.map(post => {
            const author = usersData?.find(user => user.id === post.user_id) || { 
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
            
            // Sprawdź, czy użytkownik zagłosował
            const userVoted = post.is_poll ? 
              (post.group_post_poll_options?.find(option => 
                option.group_post_poll_votes?.some(vote => vote.user_id === author.id)
              )?.id || undefined) : 
              undefined;
            
            const timeAgo = formatTimeAgo(new Date(post.created_at));
            
            return {
              id: post.id,
              content: post.content,
              author: {
                id: author.id,
                name: author.full_name || 'Użytkownik',
                avatar: author.avatar_url || ''
              },
              createdAt: post.created_at,
              timeAgo,
              media: media.length > 0 ? media : undefined,
              files: files.length > 0 ? files : undefined,
              likes: post.group_post_likes?.length || 0,
              comments: post.group_post_comments?.length || 0,
              isPoll: post.is_poll || false,
              pollOptions,
              userVoted
            };
          }) || [];

          setPosts(formattedPosts);
        } catch (error) {
          console.error('Nieoczekiwany błąd:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    } else {
      // Jeśli nie mamy groupId, używamy przekazanych postów
      setPosts(initialPosts);
    }
  }, [groupId, initialPosts]);

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
        <PostItem key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}

// Funkcja pomocnicza do formatowania czasu
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
