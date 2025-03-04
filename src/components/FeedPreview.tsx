
import { User, Calendar, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CommentsDialog } from '@/components/CommentsDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/social';

const demoPostsData = [
  {
    id: '1',
    userId: 'user1',
    author: {
      name: 'Lisa Johnson',
      avatar: '/placeholder.svg',
      role: 'Music Producer',
    },
    timeAgo: '2h ago',
    content: 'Just wrapped up an amazing session with the talented @JamesBrown. The new single is going to blow everyone away! 🎵 #MusicProduction #NewRelease',
    likes: 46,
    comments: 8,
    saves: 5,
    hasLiked: false,
    hasSaved: false,
    hashtags: ['MusicProduction', 'NewRelease']
  },
  {
    id: '2',
    userId: 'user2',
    author: {
      name: 'Michael Chen',
      avatar: '/placeholder.svg',
      role: 'Studio Engineer',
    },
    timeAgo: '5h ago',
    content: 'Testing out the new SSL console today at the studio. The clarity and warmth this thing delivers is next level. What\'s your favorite mixing console?',
    likes: 29,
    comments: 12,
    saves: 3,
    hasLiked: false,
    hasSaved: false,
    hashtags: []
  },
  {
    id: '3',
    userId: 'user3',
    author: {
      name: 'Sophia Williams',
      avatar: '/placeholder.svg',
      role: 'A&R Executive',
    },
    timeAgo: '1d ago',
    content: 'Looking for emerging indie artists with strong songwriting skills for a new project. Send me your demos if you think you\'ve got what it takes! #IndieMusic #NewTalent',
    likes: 73,
    comments: 24,
    saves: 15,
    hasLiked: false,
    hasSaved: false,
    hashtags: ['IndieMusic', 'NewTalent']
  },
];

export function FeedPreview() {
  const { isLoggedIn } = useAuth();
  const posts: Post[] = demoPostsData;
  
  const formatContent = (content: string) => {
    // Zamień hashtagi na linki
    return content.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-primary hover:underline">#$1</a>');
  };
  
  const handleLikeToggle = (index: number) => {
    if (!isLoggedIn) return;
    // W przypadku wersji demo tylko symulacja
    posts[index].hasLiked = !posts[index].hasLiked;
    posts[index].likes += posts[index].hasLiked ? 1 : -1;
  };
  
  const handleSaveToggle = (index: number) => {
    if (!isLoggedIn) return;
    // W przypadku wersji demo tylko symulacja
    posts[index].hasSaved = !posts[index].hasSaved;
  };
  
  return (
    <div className="w-full space-y-6">
      {posts.map((post, index) => (
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
                    <DropdownMenuItem>Zapisz post</DropdownMenuItem>
                    <DropdownMenuItem>Zgłoś post</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div 
                className="mt-2 mb-4 text-rhythm-700 break-words"
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              />
              
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.hashtags.map((tag) => (
                    <Link 
                      key={tag} 
                      to={`/hashtag/${tag}`}
                      className="text-sm text-primary hover:underline"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-rhythm-500">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 h-8 px-2 ${post.hasLiked ? 'text-red-500' : ''}`}
                  onClick={() => handleLikeToggle(index)}
                >
                  <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-red-500' : ''}`} />
                  <span>{post.likes}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 h-8 px-2"
                  onClick={() => {}}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 h-8 px-2 ${post.hasSaved ? 'text-primary' : ''}`}
                  onClick={() => handleSaveToggle(index)}
                >
                  <Bookmark className={`h-4 w-4 ${post.hasSaved ? 'fill-primary' : ''}`} />
                  <span>{post.hasSaved ? 'Zapisano' : 'Zapisz'}</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      <div className="text-center pt-6">
        <Button 
          variant="outline" 
          asChild
        >
          <Link to="/feed">Zobacz pełny feed</Link>
        </Button>
      </div>
    </div>
  );
}
