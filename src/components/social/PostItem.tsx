
import { useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useSocial } from '@/contexts/SocialContext';
import { Post } from '@/types/social';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';

interface PostItemProps {
  post: Post;
  index: number;
}

export function PostItem({ post, index }: PostItemProps) {
  const { loading } = useSocial();
  
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
            <PostHeader post={post} />
            <PostContent post={post} />
            
            <PostActions 
              comments={post.comments}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
