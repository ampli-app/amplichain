
import { Image, BarChart2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostActionButtonsProps {
  onAddMedia: () => void;
  onTogglePoll: () => void;
  isPollMode: boolean;
  disabled: boolean;
  mediaLimitReached: boolean;
}

export function PostActionButtons({ 
  onAddMedia,
  onTogglePoll,
  isPollMode,
  disabled,
  mediaLimitReached
}: PostActionButtonsProps) {
  return (
    <div className="flex gap-1">
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-foreground"
        onClick={onAddMedia}
        disabled={disabled || mediaLimitReached}
      >
        <Image className="h-4 w-4 mr-1" />
        <span className="sr-only sm:not-sr-only sm:inline">Media</span>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onTogglePoll}>
            <BarChart2 className="h-4 w-4 mr-2" />
            {isPollMode ? 'Wyłącz tryb ankiety' : 'Dodaj ankietę'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
