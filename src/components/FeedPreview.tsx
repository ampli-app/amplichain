
import { User, Calendar, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const posts = [
  {
    id: 1,
    author: {
      name: 'Lisa Johnson',
      avatar: '/placeholder.svg',
      role: 'Music Producer',
    },
    timeAgo: '2h ago',
    content: 'Just wrapped up an amazing session with the talented @JamesBrown. The new single is going to blow everyone away! 🎵 #MusicProduction #NewRelease',
    likes: 46,
    comments: 8,
  },
  {
    id: 2,
    author: {
      name: 'Michael Chen',
      avatar: '/placeholder.svg',
      role: 'Studio Engineer',
    },
    timeAgo: '5h ago',
    content: 'Testing out the new SSL console today at the studio. The clarity and warmth this thing delivers is next level. What\'s your favorite mixing console?',
    likes: 29,
    comments: 12,
  },
  {
    id: 3,
    author: {
      name: 'Sophia Williams',
      avatar: '/placeholder.svg',
      role: 'A&R Executive',
    },
    timeAgo: '1d ago',
    content: 'Looking for emerging indie artists with strong songwriting skills for a new project. Send me your demos if you think you\'ve got what it takes!',
    likes: 73,
    comments: 24,
  },
];

export function FeedPreview() {
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full flex-shrink-0">
                  <span className="sr-only">More options</span>
                  <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0.333C9.10457 0.333 10 1.22843 10 2.33299C10 3.43756 9.10457 4.33299 8 4.33299C6.89543 4.33299 6 3.43756 6 2.33299C6 1.22843 6.89543 0.333 8 0.333Z" fill="currentColor"/>
                    <path d="M2 0.333C3.10457 0.333 4 1.22843 4 2.33299C4 3.43756 3.10457 4.33299 2 4.33299C0.895431 4.33299 0 3.43756 0 2.33299C0 1.22843 0.895431 0.333 2 0.333Z" fill="currentColor"/>
                    <path d="M14 0.333C15.1046 0.333 16 1.22843 16 2.33299C16 3.43756 15.1046 4.33299 14 4.33299C12.8954 4.33299 12 3.43756 12 2.33299C12 1.22843 12.8954 0.333 14 0.333Z" fill="currentColor"/>
                  </svg>
                </Button>
              </div>
              
              <p className="mt-2 mb-4 text-rhythm-700 break-words">{post.content}</p>
              
              <div className="flex items-center gap-4 text-sm text-rhythm-500">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      <div className="text-center pt-6">
        <Button variant="outline">View Full Feed</Button>
      </div>
    </div>
  );
}
