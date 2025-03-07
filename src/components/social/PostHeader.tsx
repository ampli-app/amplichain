
import { User, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Calendar } from 'lucide-react';

interface PostHeaderProps {
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  timeAgo: string;
}

export function PostHeader({ author, timeAgo }: PostHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-semibold">{author.name}</h3>
          <div className="text-sm text-rhythm-500 flex items-center gap-2">
            <span>{author.role}</span>
            <span className="text-xs">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
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
  );
}
