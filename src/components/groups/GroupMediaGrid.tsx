
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ExternalLink, Image, Video } from 'lucide-react';

interface GroupMediaGridProps {
  groupId: string;
  searchQuery: string;
}

type GroupMedia = {
  id: string;
  url: string;
  type: 'image' | 'video';
  postId: string;
  createdAt: string;
  post?: {
    content: string;
  };
};

export function GroupMediaGrid({ groupId, searchQuery }: GroupMediaGridProps) {
  const [media, setMedia] = useState<GroupMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        // Najpierw pobierz wszystkie ID postów dla danej grupy
        const { data: postIds, error: postsError } = await supabase
          .from('group_posts')
          .select('id')
          .eq('group_id', groupId);
          
        if (postsError) {
          console.error('Błąd podczas pobierania postów:', postsError);
          return;
        }
        
        if (!postIds || postIds.length === 0) {
          setMedia([]);
          setLoading(false);
          return;
        }
        
        const postIdArray = postIds.map(post => post.id);
        
        // Następnie pobierz media dla tych postów
        const { data: mediaData, error } = await supabase
          .from('group_post_media')
          .select(`
            id,
            url,
            type,
            post_id,
            created_at,
            post:post_id (
              content
            )
          `)
          .in('post_id', postIdArray)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Błąd podczas pobierania mediów:', error);
          return;
        }
        
        const formattedMedia: GroupMedia[] = mediaData.map(item => ({
          id: item.id,
          url: item.url,
          type: item.type as 'image' | 'video',
          postId: item.post_id,
          createdAt: new Date(item.created_at).toLocaleDateString(),
          post: item.post ? {
            content: item.post.content
          } : undefined
        }));
        
        setMedia(formattedMedia);
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedia();
  }, [groupId]);
  
  // Filtrowanie mediów na podstawie zapytania (jeśli post zawiera tekst)
  const filteredMedia = media.filter(item => 
    !searchQuery || 
    (item.post?.content && 
      item.post.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse aspect-square bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        ))}
      </div>
    );
  }
  
  if (filteredMedia.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium mb-2">Brak wyników dla "{searchQuery}"</h3>
            <p className="text-muted-foreground">Spróbuj innych słów kluczowych</p>
          </>
        ) : (
          <>
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-2">Brak mediów</h3>
            <p className="text-muted-foreground">W tej grupie nie ma jeszcze zdjęć ani filmów</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {filteredMedia.map(item => (
        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
          {item.type === 'image' ? (
            <img 
              src={item.url} 
              alt="Media" 
              className="h-full w-full object-cover transition-all group-hover:scale-105" 
            />
          ) : (
            <div className="relative h-full w-full">
              <video 
                src={item.url}
                className="h-full w-full object-cover"
                controls={false}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="h-10 w-10 text-white opacity-80" />
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-black/50 text-white border-white hover:bg-black/70 hover:text-white"
              onClick={() => window.open(item.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Otwórz
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs truncate">{item.createdAt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
