
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { User, ShoppingBag } from 'lucide-react';
import { Conversation } from '@/types/messages';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { otherUser, product, last_message_text, last_message_time, type, unread_count = 0 } = conversation;
  
  // Jeśli konwersacja nie ma drugiego użytkownika, nie wyświetlaj jej
  if (!otherUser) return null;
  
  const displayName = otherUser.full_name || otherUser.username || 'Użytkownik';
  const timeAgo = last_message_time ? formatDistanceToNow(new Date(last_message_time), { addSuffix: true, locale: pl }) : '';
  
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-4 w-full text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-start gap-3",
        isActive ? "bg-gray-100 dark:bg-gray-700/50" : "",
        unread_count > 0 ? "font-medium" : ""
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 border dark:border-gray-600">
          <AvatarImage src={otherUser.avatar_url || undefined} alt={displayName} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        {otherUser.status === 'online' && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-700"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className={cn("truncate", unread_count > 0 ? "font-medium" : "")}>{displayName}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
        </div>
        {type === 'marketplace' && product && (
          <div className="flex items-center text-xs text-primary mb-1">
            <ShoppingBag className="h-3 w-3 mr-1" />
            <span className="truncate">{product.title}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {last_message_text || 'Rozpocznij konwersację...'}
          </p>
          {unread_count > 0 && (
            <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
              {unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
