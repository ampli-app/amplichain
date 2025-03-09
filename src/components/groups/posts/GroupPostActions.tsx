
import { useRef } from 'react';
import { ChevronDown, Image, BarChart2, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroupPostActionsProps {
  onSubmit: () => void;
  onAddMedia: () => void;
  onTogglePoll: () => void;
  isPollMode: boolean;
  mediaCount: number;
  loading: boolean;
  disabled: boolean;
}

export function GroupPostActions({
  onSubmit,
  onAddMedia,
  onTogglePoll,
  isPollMode,
  mediaCount,
  loading,
  disabled
}: GroupPostActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="flex justify-between items-center mt-3">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="gap-1.5 text-rhythm-600"
              disabled={loading}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="hidden md:inline">Rodzaj posta</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => onTogglePoll()}
            >
              <FileText className="h-4 w-4" />
              <span>Zwykły post</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={onTogglePoll}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Ankieta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="gap-1.5 text-rhythm-600"
          onClick={onAddMedia}
          disabled={mediaCount >= 6 || loading}
        >
          <Image className="h-4 w-4" />
          <span className="hidden md:inline">Media ({mediaCount}/6)</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
          multiple
          disabled={loading}
        />
      </div>
      
      <Button
        type="button"
        size="sm"
        className="gap-1.5"
        onClick={onSubmit}
        disabled={disabled || loading}
      >
        <Send className="h-4 w-4" />
        {loading ? 'Wysyłanie...' : 'Opublikuj'}
      </Button>
    </div>
  );
}
