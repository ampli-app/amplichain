
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Post } from '@/types/social';
import { PostContent } from './PostContent';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostMedia } from './PostMedia';
import { PostCommentSection } from './PostCommentSection';
import { usePostInteractions } from '@/hooks/usePostInteractions';

interface PostItemProps {
  post: Post;
  index: number;
  onLikeToggle?: (postId: string, isLiked: boolean) => Promise<void>;
  onAddComment?: (postId: string, content: string) => Promise<void | boolean>;
  onAddReply?: (postId: string, commentId: string, content: string) => Promise<void | boolean>;
}

export function PostItem({ 
  post, 
  index, 
  onLikeToggle,
  onAddComment,
  onAddReply
}: PostItemProps) {
  const {
    liked,
    likesCount,
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    commentLoading,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleLike,
    handleAddComment,
    handleAddReply
  } = usePostInteractions({
    postId: post.id,
    initialLikes: post.likes,
    initialLiked: post.userLiked || false,
    onLikeToggle,
    onAddComment,
    onAddReply
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 mb-6">
        <div className="flex-1 min-w-0">
          <PostHeader 
            author={{
              id: post.userId,
              name: post.author.name,
              avatar: post.author.avatar,
              role: post.author.role || ''
            }} 
            timeAgo={post.timeAgo} 
          />
          
          <div className="mt-4">
            <PostContent content={post.content} hashtags={post.hashtags} />
          </div>
          
          {post.media && post.media.length > 0 && (
            <PostMedia media={post.media} />
          )}
          
          <div className="mt-4">
            <PostFooter 
              postId={post.id}
              likesCount={likesCount} 
              commentsCount={post.comments} 
              liked={liked}
              onLikeClick={handleLike}
              onCommentClick={() => setShowComments(!showComments)}
            />
          </div>
          
          <PostCommentSection
            postId={post.id}
            showComments={showComments}
            newComment={newComment}
            setNewComment={setNewComment}
            commentLoading={commentLoading}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
          />
        </div>
      </Card>
    </motion.div>
  );
}
