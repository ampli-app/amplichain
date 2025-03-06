
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
  Calendar
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
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
