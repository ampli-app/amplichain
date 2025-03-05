
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
      <h3 className="text-lg font-medium mb-4">Popularne hashtagi</h3>
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
