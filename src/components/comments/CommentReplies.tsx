
import { Comment } from '@/types/social';
import { motion } from 'framer-motion';
import { CommentItem } from './CommentItem';

interface CommentRepliesProps {
  replies: Comment[];
  level: number;
  maxLevel: number;
}

export function CommentReplies({ replies, level, maxLevel }: CommentRepliesProps) {
  if (replies.length === 0) return null;
  
  return (
    <div className="mt-2">
      {replies.map((reply) => (
        <motion.div
          key={reply.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CommentItem 
            comment={reply}
            level={level + 1}
            maxLevel={maxLevel}
          />
        </motion.div>
      ))}
    </div>
  );
}
