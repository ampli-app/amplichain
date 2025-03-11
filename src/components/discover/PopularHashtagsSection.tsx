
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useHashtags } from '@/contexts/social/useHashtags';
import { Hashtag } from '@/types/social';
import { Skeleton } from '@/components/ui/skeleton';

export function PopularHashtagsSection() {
  const { user } = useAuth();
  const { getPopularHashtags } = useHashtags(); // Removed user?.id parameter
  const [popularHashtags, setPopularHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHashtags() {
      try {
        setLoading(true);
        const hashtags = await getPopularHashtags();
        setPopularHashtags(hashtags);
      } catch (error) {
        console.error('Błąd podczas ładowania hashtagów:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHashtags();
  }, [getPopularHashtags]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Popularne hashtagi</h3>
        <Link to="/social" className="no-underline">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Zobacz wszystkie
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </>
        ) : popularHashtags.length > 0 ? (
          popularHashtags.map((tag) => (
            <Link key={tag.id} to={`/hashtag/${tag.name}`}>
              <Badge variant="secondary" className="hover:bg-secondary/90 cursor-pointer">
                #{tag.name}
              </Badge>
            </Link>
          ))
        ) : (
          <p className="text-sm text-rhythm-500">Brak popularnych hashtagów</p>
        )}
      </div>
    </div>
  );
}
