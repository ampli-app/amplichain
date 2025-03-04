
import { Post } from '@/types/social';
import { PostItem } from './PostItem';

export interface SocialFeedContentProps {
  posts: Post[];
}

export function SocialFeedContent({ posts }: SocialFeedContentProps) {
  return (
    <div className="w-full space-y-6">
      {posts.map((post, index) => (
        <PostItem key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
