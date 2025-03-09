
import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Comment, formatTimeAgo } from '@/utils/commentUtils';
import { convertEmoticons } from '@/utils/emoticonUtils';

interface PostItemProps {
  post: GroupPost;
  index: number;
  onLikeToggle?: (postId: string, isLiked: boolean) => Promise<void>;
  onAddComment?: (postId: string, content: string) => Promise<boolean | undefined>;
  onAddReply?: (postId: string, parentCommentId: string, content: string) => Promise<boolean | undefined>;
  groupId?: string;
}

export function PostItem({ 
  post, 
  index, 
  onLikeToggle, 
  onAddComment, 
  onAddReply,
  groupId 
}: PostItemProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  
  useEffect(() => {
    if (showComments && post.comments > 0) {
      fetchComments();
    }
  }, [showComments, post.id]);
  
  const fetchComments = async () => {
    if (!post.id) return;
    
    setLoadingComments(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('group_post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id
        `)
        .eq('post_id', post.id)
        .is('parent_id', null)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Błąd podczas pobierania komentarzy:', error);
        setLoadingComments(false);
        return;
      }
      
      const { data: repliesData, error: repliesError } = await supabase
        .from('group_post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id
        `)
        .eq('post_id', post.id)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true });
        
      if (repliesError) {
        console.error('Błąd podczas pobierania odpowiedzi:', repliesError);
      }
      
      const userIds = [
        ...new Set([
          ...(commentsData?.map(comment => comment.user_id) || []),
          ...(repliesData?.map(reply => reply.user_id) || [])
        ])
      ];
      
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
        
      if (usersError) {
        console.error('Błąd podczas pobierania danych użytkowników:', usersError);
      }
      
      const formattedComments = commentsData?.map(comment => {
        const authorProfile = usersData?.find(user => user.id === comment.user_id);
        const commentReplies = repliesData
          ?.filter(reply => reply.parent_id === comment.id)
          .map(reply => {
            const replyAuthorProfile = usersData?.find(user => user.id === reply.user_id);
            return {
              id: reply.id,
              author: {
                id: reply.user_id,
                name: replyAuthorProfile?.full_name || 'Nieznany użytkownik',
                avatar: replyAuthorProfile?.avatar_url || ''
              },
              content: reply.content,
              timeAgo: formatTimeAgo(new Date(reply.created_at)),
              replies: [] // Dodajemy pustą tablicę, ponieważ odpowiedzi nie mają swoich odpowiedzi
            };
          }) || [];
          
        return {
          id: comment.id,
          author: {
            id: comment.user_id,
            name: authorProfile?.full_name || 'Nieznany użytkownik',
            avatar: authorProfile?.avatar_url || ''
          },
          content: comment.content,
          timeAgo: formatTimeAgo(new Date(comment.created_at)),
          replies: commentReplies
        };
      }) || [];
      
      setComments(formattedComments);
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania komentarzy:', error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleLike = async () => {
    setLoading(true);
    try {
      if (onLikeToggle) {
        await onLikeToggle(post.id, liked);
        
        if (liked) {
          setLikesCount(prev => prev - 1);
        } else {
          setLikesCount(prev => prev + 1);
        }
        setLiked(!liked);
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji polubienia:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = () => {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link skopiowany",
          description: "Link do posta został skopiowany do schowka.",
        });
      }).catch(() => {
        toast({
          title: "Kopiowanie nieudane",
          description: "Spróbuj skopiować link ręcznie: " + url,
        });
      });
    } else {
      toast({
        title: "Link do udostępnienia",
        description: url,
      });
    }
  };
  
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    setLoading(true);
    try {
      if (onAddComment) {
        const success = await onAddComment(post.id, commentText);
        if (success) {
          setCommentText('');
          await fetchComments();
        }
      }
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    
    setLoading(true);
    try {
      if (onAddReply) {
        const success = await onAddReply(post.id, commentId, replyText);
        if (success) {
          setReplyText('');
          setReplyingTo(null);
          await fetchComments();
        }
      }
    } catch (error) {
      console.error('Błąd podczas dodawania odpowiedzi:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatContent = (content: string) => {
    const contentWithEmoticons = convertEmoticons(content);
    return contentWithEmoticons.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-primary hover:underline">#$1</a>');
  };

  function formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    if (diffYear > 0) {
      return `${diffYear} ${diffYear === 1 ? 'rok' : diffYear < 5 ? 'lata' : 'lat'} temu`;
    } else if (diffMonth > 0) {
      return `${diffMonth} ${diffMonth === 1 ? 'miesiąc' : diffMonth < 5 ? 'miesiące' : 'miesięcy'} temu`;
    } else if (diffDay > 0) {
      return `${diffDay} ${diffDay === 1 ? 'dzień' : 'dni'} temu`;
    } else if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'godz.' : 'godz.'} temu`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'min.' : 'min.'} temu`;
    } else {
      return 'przed chwilą';
    }
  }
  
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
                  disabled={loading}
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
                  <span>{post.comments}</span>
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
            
            <div className="mt-4 pt-3 border-t">
              <CommentInput 
                onAddComment={handleAddComment}
                commentText={commentText}
                setCommentText={setCommentText}
                disabled={loading}
              />
              
              {(showComments) && (
                <>
                  {loadingComments ? (
                    <div className="mt-4 space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="animate-pulse flex gap-3">
                          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg mb-2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <CommentsList 
                      comments={comments}
                      replyingTo={replyingTo}
                      setReplyingTo={setReplyingTo}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      onAddReply={handleAddReply}
                      disabled={loading}
                    />
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Brak komentarzy. Bądź pierwszy!
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
