
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { User } from 'lucide-react';
import { Message } from '@/types/messages';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

export function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;
  const sender = message.sender;
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: pl });
  
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
          <AvatarImage src={sender?.avatar_url || undefined} alt={sender?.full_name || 'Użytkownik'} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div 
        className={cn(
          "max-w-[80%]", 
          isOwn 
            ? "bg-primary text-white rounded-2xl rounded-tr-sm" 
            : "bg-white dark:bg-gray-700 dark:text-gray-100 rounded-2xl rounded-tl-sm border dark:border-gray-600"
        )}
      >
        <div className="p-3">
          <p>{message.text}</p>
        </div>
        <div className={cn("px-3 pb-1 text-xs", isOwn ? "text-primary-foreground/70" : "text-gray-500")}>
          {timeAgo}
        </div>
      </div>
    </div>
  );
}
