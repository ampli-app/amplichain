
import { FeedPostsList } from '../social/FeedPostsList';
import { Post } from '@/types/social';

export function FeedSection() {
  return (
    <div className="mb-12">
      <h3 className="text-lg font-medium mb-4">Feed</h3>
      <FeedPostsList posts={[]} />
    </div>
  );
}
