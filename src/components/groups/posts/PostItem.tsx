
import { useState } from 'react';
import { GroupPost } from '@/types/group';
import { PostHeader } from '@/components/social/PostHeader';
import { PostContent } from '@/components/social/PostContent';
import { PostMedia } from './PostMedia';
import { PostFiles } from './PostFiles';
import { PostPoll } from './PostPoll';
import { PostFooter } from '@/components/social/PostFooter';
import { PostCommentSection } from '@/components/social/PostCommentSection';

interface PostItemProps {
  post: GroupPost;
  index: number;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onAddComment: (postId: string, content: string) => Promise<boolean | undefined>;
  onAddReply: (postId: string, parentCommentId: string, content: string) => Promise<boolean | undefined>;
  groupId?: string;
}

export function PostItem({ post, index, onLikeToggle, onAddComment, onAddReply, groupId }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };
  
  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4">
        <PostHeader 
          author={post.author} 
          timeAgo={post.timeAgo} 
          postType="group" 
        />
        
        <div className="mt-3">
          <PostContent 
            content={post.content} 
            hashtags={post.hashtags}
          />
        </div>
        
        {post.media && post.media.length > 0 && (
          <div className="mt-3">
            <PostMedia media={post.media} />
          </div>
        )}
        
        {post.files && post.files.length > 0 && (
          <div className="mt-3">
            <PostFiles files={post.files} />
          </div>
        )}
        
        {post.isPoll && post.pollOptions && (
          <div className="mt-3">
            <PostPoll 
              options={post.pollOptions} 
              postId={post.id} 
              userVoted={post.userVoted}
              groupId={groupId}
            />
          </div>
        )}
      </div>
      
      <PostFooter 
        postId={post.id}
        likes={post.likes} 
        comments={post.comments}
        userLiked={post.userLiked}
        onLikeToggle={onLikeToggle}
        onCommentToggle={handleCommentToggle}
      />
      
      {showComments && (
        <PostCommentSection 
          postId={post.id}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
          groupPostId={post.id}
          groupId={groupId}
        />
      )}
    </div>
  );
}
