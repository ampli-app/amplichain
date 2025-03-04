
import { useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocial } from '@/contexts/SocialContext';
import { CommentsSection } from '@/components/CommentsSection';
import { Post } from '@/types/social';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { PostCommentForm } from './PostCommentForm';
import { PostCommentsToggle } from './PostCommentsToggle';

interface PostItemProps {
  post: Post;
  index: number;
}

export function PostItem({ post, index }: PostItemProps) {
  const { likePost, unlikePost, savePost, unsavePost, commentOnPost, loading } = useSocial();
  const [showComments, setShowComments] = useState(false);
  
  const handleLikeToggle = () => {
    if (loading) return;
    
    if (post.hasLiked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };
  
  const handleSaveToggle = () => {
    if (loading) return;
    
    if (post.hasSaved) {
      unsavePost(post.id);
    } else {
      savePost(post.id);
    }
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const handleCommentSubmit = async (commentText: string) => {
    if (!commentText.trim() || loading) return;
    
    await commentOnPost(post.id, commentText);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-xl p-6 border w-full"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <PostHeader post={post} onSaveToggle={handleSaveToggle} />
          <PostContent post={post} />
          
          <PostActions 
            likes={post.likes}
            hasLiked={post.hasLiked || false}
            comments={post.comments}
            hasSaved={post.hasSaved || false}
            saves={post.saves}
            showComments={showComments}
            loading={loading}
            onLikeToggle={handleLikeToggle}
            onCommentToggle={toggleComments}
            onSaveToggle={handleSaveToggle}
          />
          
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden w-full"
              >
                <div className="border-t pt-3 pb-2">
                  <PostCommentForm 
                    loading={loading} 
                    onCommentSubmit={handleCommentSubmit} 
                  />
                  
                  <CommentsSection 
                    postId={post.id} 
                    onClose={toggleComments}
                    embedded={true}
                  />
                  
                  <PostCommentsToggle 
                    showComments={showComments} 
                    onClick={toggleComments} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
