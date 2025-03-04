
import { useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocial } from '@/contexts/SocialContext';
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
  const { likePost, unlikePost, savePost, unsavePost, commentOnPost, getPostComments, loading } = useSocial();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  
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
  
  const toggleComments = async () => {
    if (!showComments && !commentsLoaded) {
      try {
        const fetchedComments = await getPostComments(post.id);
        setComments(fetchedComments);
        setCommentsLoaded(true);
      } catch (err) {
        console.error("Błąd podczas ładowania komentarzy:", err);
        setComments([]);
      }
    }
    setShowComments(!showComments);
  };
  
  const handleCommentSubmit = async (commentText: string) => {
    if (!commentText.trim() || loading) return;
    
    await commentOnPost(post.id, commentText);
    
    // Odśwież komentarze po dodaniu nowego
    try {
      const fetchedComments = await getPostComments(post.id);
      setComments(fetchedComments);
      setCommentsLoaded(true);
    } catch (err) {
      console.error("Błąd podczas odświeżania komentarzy:", err);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-background rounded-xl border w-full overflow-hidden"
    >
      <div className="p-6">
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
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base">Komentarze</h3>
                <PostCommentsToggle showComments={showComments} onClick={toggleComments} />
              </div>
              
              {comments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Brak komentarzy. Napisz pierwszy komentarz!
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground mb-1">{comment.timeAgo}</span>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <PostCommentForm 
                loading={loading} 
                onCommentSubmit={handleCommentSubmit} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
