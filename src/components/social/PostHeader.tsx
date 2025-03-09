
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostHeaderProps {
  author: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  };
  timeAgo: string;
  postType?: 'feed' | 'group';
}

export function PostHeader({ author, timeAgo, postType = 'feed' }: PostHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Link to={`/profile/${author.id}`}>
        <Avatar className="h-10 w-10">
          {author.avatar ? (
            <AvatarImage src={author.avatar} alt={author.name} />
          ) : (
            <AvatarFallback>{author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link 
          to={`/profile/${author.id}`}
          className="font-medium hover:underline"
        >
          {author.name}
        </Link>
        <div className="text-muted-foreground text-xs">{timeAgo}</div>
      </div>
    </div>
  );
}
