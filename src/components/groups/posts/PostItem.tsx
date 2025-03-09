
import { useState } from 'react';
import { GroupPost } from '@/types/group';
import { PostHeader } from '@/components/social/PostHeader';
import { PostContent } from '@/components/social/PostContent';
import { PostMedia } from './PostMedia';
import { PostFiles } from './PostFiles';
import { PostPoll } from './PostPoll';
import { PostFooter } from '@/components/social/PostFooter';
import { PostCommentSection } from '@/components/social/PostCommentSection';
import { Comment } from '@/utils/commentUtils';

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
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleLikeClick = () => {
    onLikeToggle(post.id, post.userLiked || false);
  };
  
  const handleAddComment = () => {
    onAddComment(post.id, commentText).then(success => {
      if (success) {
        setCommentText('');
      }
    });
  };
  
  const handleAddReply = (commentId: string) => {
    if (replyingTo) {
      onAddReply(post.id, commentId, replyText).then(success => {
        if (success) {
          setReplyText('');
          setReplyingTo(null);
        }
      });
    }
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
        likesCount={post.likes}
        commentsCount={post.comments}
        liked={post.userLiked || false}
        onLikeClick={handleLikeClick}
        onCommentClick={handleCommentToggle}
      />
      
      {showComments && (
        <PostCommentSection 
          showComments={showComments}
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={handleAddComment}
          comments={comments}
          loadingComments={loadingComments}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          onAddReply={handleAddReply}
          disabled={false}
          postId={post.id}
          groupId={groupId}
        />
      )}
    </div>
  );
}
