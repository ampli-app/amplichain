
import { useState } from 'react';
import { GroupPost } from '@/types/group';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  User,
  Calendar,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
  CornerDownRight
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface GroupPostsListProps {
  posts: GroupPost[];
  searchQuery: string;
}

export function GroupPostsList({ posts, searchQuery }: GroupPostsListProps) {
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium mb-2">Brak wyników dla "{searchQuery}"</h3>
            <p className="text-muted-foreground">Spróbuj innych słów kluczowych</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">Brak postów</h3>
            <p className="text-muted-foreground">Bądź pierwszy i napisz coś w tej grupie!</p>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {filteredPosts.map((post, index) => (
        <PostItem key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}

interface PostItemProps {
  post: GroupPost;
  index: number;
}

function PostItem({ post, index }: PostItemProps) {
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
  
  const renderPoll = () => {
    if (!post.isPoll || !post.pollOptions) return null;
    
    const totalVotes = post.pollOptions.reduce((sum, option) => sum + option.votes, 0);
    
    return (
      <div className="mt-4 space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
        {post.pollOptions.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isVoted = post.userVoted === option.id;
          
          return (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{option.text}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isVoted ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-500'} rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {option.votes} {option.votes === 1 ? 'głos' : 
                  option.votes % 10 >= 2 && option.votes % 10 <= 4 && 
                  (option.votes % 100 < 10 || option.votes % 100 > 20) ? 
                  'głosy' : 'głosów'}
              </div>
            </div>
          );
        })}
        <div className="text-sm text-muted-foreground mt-2">
          Łącznie: {totalVotes} {totalVotes === 1 ? 'głos' : 
            totalVotes % 10 >= 2 && totalVotes % 10 <= 4 && 
            (totalVotes % 100 < 10 || totalVotes % 100 > 20) ? 
            'głosy' : 'głosów'}
        </div>
      </div>
    );
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
            
            {renderPoll()}
            
            {post.media && post.media.length > 0 && (
              <div className={`grid ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
                {post.media.map((file, idx) => (
                  <div key={idx} className="relative rounded-md overflow-hidden">
                    {file.type === 'video' ? (
                      <video 
                        src={file.url}
                        controls
                        className="w-full h-auto max-h-96 object-cover rounded-md"
                      />
                    ) : (
                      <img 
                        src={file.url} 
                        alt={`Media ${idx + 1}`} 
                        className="w-full h-auto max-h-96 object-cover rounded-md" 
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {post.files && post.files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.files.map((file, idx) => (
                  <div key={idx} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
            
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
            
            {/* Comments section */}
            {showComments && (
              <div className="mt-4 pt-3 border-t">
                {/* Add comment input */}
                <div className="flex gap-3 mb-4">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Your profile" />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea 
                      placeholder="Napisz komentarz..." 
                      className="min-h-[40px] py-2 resize-none"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      className="h-10 px-3 self-end"
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Comments list */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="pb-3">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm">{comment.author.name}</h4>
                              <span className="text-xs text-rhythm-500">{comment.timeAgo}</span>
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                          
                          <div className="flex gap-4 mt-1 ml-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            >
                              Odpowiedz
                            </Button>
                          </div>
                          
                          {/* Reply input */}
                          {replyingTo === comment.id && (
                            <div className="mt-2 flex gap-2">
                              <div className="w-8 flex justify-center">
                                <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 flex gap-2">
                                <Textarea 
                                  placeholder="Napisz odpowiedź..." 
                                  className="min-h-[36px] py-2 text-sm resize-none"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                                <Button 
                                  size="sm" 
                                  className="h-9 px-3 self-end"
                                  onClick={() => handleAddReply(comment.id)}
                                  disabled={!replyText.trim()}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="mt-2 space-y-3 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                                    <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                      <div className="flex justify-between items-start">
                                        <h5 className="font-medium text-xs">{reply.author.name}</h5>
                                        <span className="text-xs text-rhythm-500">{reply.timeAgo}</span>
                                      </div>
                                      <p className="text-xs mt-1">{reply.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
