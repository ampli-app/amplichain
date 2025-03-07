import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeedPostsList } from '@/components/social/FeedPostsList';
import { CommentInput } from '@/components/groups/comments/CommentInput';

interface ProfileFeedTabProps {
  profileId: string;
}

export function ProfileFeedTab({ profileId }: ProfileFeedTabProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    fetchUserPosts();
  }, [profileId]);
  
  const fetchUserPosts = async () => {
    if (!profileId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (id, full_name, username, avatar_url),
          comments:post_comments (
            id,
            content,
            created_at,
            user:user_id (id, full_name, username, avatar_url)
          ),
          likes:post_likes (id, user_id),
          polls:post_polls (id, question, options)
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching user posts:', error);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching user posts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddComment = () => {
    // Ta funkcja byłaby zaimplementowana, gdyby była potrzebna
    // do dodawania komentarzy
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center p-12 bg-muted/30 rounded-lg border">
        <h3 className="text-lg font-medium mb-2">Brak postów</h3>
        <p className="text-muted-foreground">
          Ten użytkownik nie opublikował jeszcze żadnych postów.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <FeedPostsList 
        posts={posts} 
        onPostsUpdated={fetchUserPosts} 
      />
    </div>
  );
}
