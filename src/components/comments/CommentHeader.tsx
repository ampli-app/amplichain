
import { User, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Comment } from '@/types/social';

interface CommentHeaderProps {
  comment: Comment;
}

export function CommentHeader({ comment }: CommentHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h4 className="font-semibold text-sm">{comment.author.name}</h4>
          <span className="text-xs text-rhythm-500">{comment.author.role} • {comment.timeAgo}</span>
        </div>
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
  );
}
