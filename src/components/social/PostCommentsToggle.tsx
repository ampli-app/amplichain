
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostCommentsToggleProps {
  showComments: boolean;
  onClick: () => void;
}

export function PostCommentsToggle({ showComments, onClick }: PostCommentsToggleProps) {
  if (!showComments) return null;
  
  return (
    <div className="flex justify-end pb-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Zamknij komentarze</span>
      </Button>
    </div>
  );
}
