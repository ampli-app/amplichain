
import { Post } from '@/types/social';
import { PostItem } from './PostItem';

export interface SocialFeedContentProps {
  posts: Post[];
  onLikeToggle?: (postId: string, isLiked: boolean) => Promise<void>;
  onAddComment?: (postId: string, content: string) => Promise<boolean | undefined>;
  onAddReply?: (postId: string, parentCommentId: string, content: string) => Promise<boolean | undefined>;
}

export function SocialFeedContent({ 
  posts, 
  onLikeToggle,
  onAddComment,
  onAddReply
}: SocialFeedContentProps) {
  return (
    <div className="w-full space-y-6">
      {posts.map((post, index) => (
        <PostItem 
          key={post.id} 
          post={post} 
          index={index} 
          onLikeToggle={onLikeToggle}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
        />
      ))}
    </div>
  );
}
