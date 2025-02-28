
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Phone, Video, User, ShoppingBag } from 'lucide-react';
import { Conversation } from '@/types/messages';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface ConversationHeaderProps {
  conversation: Conversation;
  onBackClick: () => void;
  isMobileView: boolean;
}

export function ConversationHeader({ conversation, onBackClick, isMobileView }: ConversationHeaderProps) {
  const { otherUser, product, type } = conversation;
  
  if (!otherUser) return null;
  
  const displayName = otherUser.full_name || otherUser.username || 'Użytkownik';
  const isOnline = otherUser.status === 'online';
  
  return (
    <div className="p-3 border-b dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobileView && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackClick}
            className="mr-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-9 w-9 border dark:border-gray-600">
          <AvatarImage src={otherUser.avatar_url || undefined} alt={displayName} />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{displayName}</h3>
          {type === 'marketplace' && product ? (
            <div className="flex items-center text-xs text-primary">
              <ShoppingBag className="h-3 w-3 mr-1" />
              <span className="truncate">{product.title} · {formatCurrency(product.price)}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              {isOnline ? 'Online' : otherUser.last_active ? `Ostatnio aktywny ${otherUser.last_active}` : 'Offline'}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
