
import { useState } from 'react';
import { GroupPost } from '@/types/group';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CommentsList } from '../comments/CommentsList';
import { CommentInput } from '../comments/CommentInput';
import { PostPoll } from './PostPoll';
import { PostMedia } from './PostMedia';
import { PostFiles } from './PostFiles';

interface PostItemProps {
  post: GroupPost;
  index: number;
}

export function PostItem({ post, index }: PostItemProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Symulowane dane komentarzy dla demonstracji
  const [comments, setComments] = useState<Array<{
    id: string;
    author: { name: string; avatar: string };
    content: string;
    timeAgo: string;
    replies: Array<{
      id: string;
      author: { name: string; avatar: string };
      content: string;
      timeAgo: string;
    }>;
  }>>([
    {
      id: '1',
      author: { 
        name: 'Marcin Kowalski', 
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg' 
      },
      content: 'Super post! Dodaję do zakładek.',
      timeAgo: '1 godz. temu',
      replies: [
        {
          id: '1-1',
          author: { 
            name: 'Anna Nowak', 
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg' 
          },
          content: 'Dzięki! Cieszę się, że Ci się podoba.',
          timeAgo: '45 min. temu',
        },
      ],
    },
    {
      id: '2',
      author: { 
        name: 'Tomasz Zieliński', 
        avatar: 'https://randomuser.me/api/portraits/men/91.jpg' 
      },
      content: 'Mam podobne doświadczenia, chętnie porozmawiam na ten temat.',
      timeAgo: '3 godz. temu',
      replies: [],
    },
  ]);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };
  
  const handleShare = () => {
    toast({
      title: "Link skopiowany",
      description: "Link do posta został skopiowany do schowka.",
    });
  };
  
  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: `comment-${Date.now()}`,
        author: { 
          name: 'Ty', 
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg' 
        },
        content: commentText,
        timeAgo: 'przed chwilą',
        replies: [],
      };
      
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      
      toast({
        title: "Komentarz dodany",
        description: "Twój komentarz został pomyślnie dodany.",
      });
    }
  };
  
  const handleAddReply = (commentId: string) => {
    if (replyText.trim()) {
      const newReply = {
        id: `reply-${Date.now()}`,
        author: { 
          name: 'Ty', 
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg' 
        },
        content: replyText,
        timeAgo: 'przed chwilą',
      };
      
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setReplyText('');
      setReplyingTo(null);
      
      toast({
        title: "Odpowiedź dodana",
        description: "Twoja odpowiedź została pomyślnie dodana.",
      });
    }
  };
  
  const formatContent = (content: string) => {
    // Convert hashtags to links
    return content.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-primary hover:underline">#$1</a>');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{post.author.name}</h3>
                <div className="text-sm text-rhythm-500 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.timeAgo}
                  </span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <span className="sr-only">Opcje posta</span>
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Zapisz post</DropdownMenuItem>
                  <DropdownMenuItem>Zgłoś post</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div 
              className="mt-2 mb-4 text-rhythm-700 break-words"
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            />
            
            {post.isPoll && post.pollOptions && <PostPoll pollOptions={post.pollOptions} userVoted={post.userVoted} />}
            
            {post.media && post.media.length > 0 && <PostMedia media={post.media} />}
            
            {post.files && post.files.length > 0 && <PostFiles files={post.files} />}
            
            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 h-8 px-2 ${liked ? 'text-red-500' : ''}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-red-500' : ''}`} />
                  <span>{likesCount}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 h-8 px-2"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 h-8 px-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Comment input - always visible */}
            <div className="mt-4 pt-3 border-t">
              <CommentInput 
                onAddComment={handleAddComment}
                commentText={commentText}
                setCommentText={setCommentText}
              />
              
              {/* Comments section - expandable */}
              {(showComments && comments.length > 0) && (
                <CommentsList 
                  comments={comments}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onAddReply={handleAddReply}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
