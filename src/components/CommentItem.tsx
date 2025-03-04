
import { useState } from 'react';
import { User, Heart, MessageCircle, MoreHorizontal, Reply } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useSocial } from '@/contexts/SocialContext';
import { Comment } from '@/types/social';
import { motion } from 'framer-motion';

interface CommentItemProps {
  comment: Comment;
  level?: number;
  maxLevel?: number;
}

export function CommentItem({ comment, level = 0, maxLevel = 3 }: CommentItemProps) {
  const { likeComment, unlikeComment, commentOnPost, getPostComments } = useSocial();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  
  const handleLikeToggle = () => {
    if (comment.hasLiked) {
      unlikeComment(comment.id);
      // Optymistyczna aktualizacja UI
      comment.hasLiked = false;
      comment.likes--;
    } else {
      likeComment(comment.id);
      // Optymistyczna aktualizacja UI
      comment.hasLiked = true;
      comment.likes++;
    }
  };
  
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    await commentOnPost(comment.postId, replyContent, comment.id);
    setReplyContent('');
    setIsReplying(false);
    
    // Odśwież odpowiedzi jeśli były już załadowane
    if (repliesLoaded) {
      loadReplies();
    }
  };
  
  const loadReplies = async () => {
    if (comment.replies > 0) {
      const fetchedReplies = await getPostComments(comment.postId, comment.id);
      setReplies(fetchedReplies);
      setRepliesLoaded(true);
    }
  };
  
  const toggleReplies = async () => {
    if (!repliesLoaded && !showReplies) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };
  
  return (
    <div className={`pl-${level > 0 ? 4 : 0}`}>
      <div className="flex items-start gap-3 py-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="glass-card rounded-lg p-3 border">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-sm">{comment.author.name}</h4>
                <span className="text-xs text-rhythm-500">{comment.author.role} • {comment.timeAgo}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Opcje komentarza</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Zgłoś komentarz</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="mt-1 text-sm break-words">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-3 mt-1 pl-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 h-6 px-2 text-xs ${comment.hasLiked ? 'text-red-500' : ''}`}
              onClick={handleLikeToggle}
            >
              <Heart className={`h-3 w-3 ${comment.hasLiked ? 'fill-red-500' : ''}`} />
              <span>{comment.likes > 0 ? comment.likes : ''}</span>
            </Button>
            
            {level < maxLevel && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 h-6 px-2 text-xs"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3" />
                <span>Odpowiedz</span>
              </Button>
            )}
            
            {comment.replies > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 h-6 px-2 text-xs"
                onClick={toggleReplies}
              >
                <MessageCircle className="h-3 w-3" />
                <span>{showReplies ? 'Ukryj odpowiedzi' : `Pokaż odpowiedzi (${comment.replies})`}</span>
              </Button>
            )}
          </div>
          
          {isReplying && (
            <div className="mt-2 pl-1">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Napisz odpowiedź..."
                className="text-sm min-h-[60px] mb-2"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsReplying(false)}
                >
                  Anuluj
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                >
                  Wyślij
                </Button>
              </div>
            </div>
          )}
          
          {showReplies && replies.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
