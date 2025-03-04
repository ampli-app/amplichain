
import { User, Calendar, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Post } from '@/types/social';

interface PostHeaderProps {
  post: Post;
  onSaveToggle: () => void;
}

export function PostHeader({ post, onSaveToggle }: PostHeaderProps) {
  return (
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
          <DropdownMenuItem onClick={onSaveToggle}>
            {post.hasSaved ? 'Usuń z zapisanych' : 'Zapisz post'}
          </DropdownMenuItem>
          <DropdownMenuItem>Zgłoś post</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
