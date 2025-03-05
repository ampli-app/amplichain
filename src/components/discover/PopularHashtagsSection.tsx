
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POPULAR_HASHTAGS = [
  'mentoring',
  'przedsiębiorczość',
  'networking',
  'muzyka',
  'studia',
  'technologia',
  'innowacje',
  'biznes'
];

export function PopularHashtagsSection() {
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
        {POPULAR_HASHTAGS.map((tag) => (
          <Link key={tag} to={`/hashtag/${tag}`}>
            <Badge variant="secondary" className="hover:bg-secondary/90 cursor-pointer">
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
