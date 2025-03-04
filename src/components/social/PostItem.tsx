import { useState } from 'react';
import { User, Calendar, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocial } from '@/contexts/SocialContext';
import { CommentsSection } from '@/components/CommentsSection';
import { Link } from 'react-router-dom';
import { Post } from '@/types/social';

interface PostItemProps {
  post: Post;
  index: number;
}

export function PostItem({ post, index }: PostItemProps) {
  const { likePost, unlikePost, savePost, unsavePost, loading } = useSocial();
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
  
  const formatContent = (content: string) => {
    // Zamień hashtagi na linki
    return content.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-primary hover:underline">#$1</a>');
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <motion.div
      key={post.id}
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
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{post.author.name}</h3>
              <div className="text-sm text-rhythm-500 flex items-center gap-2">
                <span>{post.author.role}</span>
                <span className="text-xs">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.timeAgo}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full flex-shrink-0">
                  <span className="sr-only">Więcej opcji</span>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSaveToggle}>
                  {post.hasSaved ? 'Usuń z zapisanych' : 'Zapisz post'}
                </DropdownMenuItem>
                <DropdownMenuItem>Zgłoś post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div 
            className="mt-2 mb-4 text-rhythm-700 break-words"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
          
          {post.mediaUrl && (
            <div className="mb-4 rounded-md overflow-hidden">
              {post.mediaType === 'video' ? (
                <video 
                  src={post.mediaUrl}
                  controls
                  className="w-full h-auto max-h-96 object-cover"
                />
              ) : (
                <img 
                  src={post.mediaUrl} 
                  alt="Post media" 
                  className="w-full h-auto max-h-96 object-cover" 
                />
              )}
            </div>
          )}
          
          {/* Obsługa wielu plików multimedialnych */}
          {post.mediaFiles && post.mediaFiles.length > 0 && !post.mediaUrl && (
            <div className={`grid ${post.mediaFiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
              {post.mediaFiles.map((file, idx) => (
                <div key={idx} className="relative rounded-md overflow-hidden">
                  {file.type === 'video' ? (
                    <video 
                      src={file.url}
                      controls
                      className="w-full h-auto max-h-80 object-cover"
                    />
                  ) : (
                    <img 
                      src={file.url} 
                      alt={`Media ${idx + 1}`} 
                      className="w-full h-auto max-h-80 object-cover" 
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.hashtags.map((tag) => (
                <Link 
                  key={tag} 
                  to={`/hashtag/${tag}`}
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()} // Zapobiegaj propagacji zdarzenia
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4 border-t pt-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 h-8 px-2.5 ${post.hasLiked ? 'text-red-500' : ''}`}
                onClick={handleLikeToggle}
                disabled={loading}
                type="button"
              >
                <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-red-500' : ''}`} />
                <span>{post.likes}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1.5 h-8 px-2.5"
                onClick={toggleComments}
                type="button"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 h-8 px-2.5 ${post.hasSaved ? 'text-primary' : ''}`}
                onClick={handleSaveToggle}
                disabled={loading}
                type="button"
              >
                <Bookmark className={`h-4 w-4 ${post.hasSaved ? 'fill-primary' : ''}`} />
                <span>{post.hasSaved ? 'Zapisano' : 'Zapisz'}</span>
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 overflow-hidden w-full"
              >
                <div className="border rounded-lg bg-background shadow-sm w-full">
                  <CommentsSection 
                    postId={post.id} 
                    onClose={toggleComments}
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