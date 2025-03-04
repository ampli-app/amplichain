
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostCommentsToggleProps {
  showComments: boolean;
  onClick: () => void;
}

export function PostCommentsToggle({ showComments, onClick }: PostCommentsToggleProps) {
  return (
    <div className="flex justify-center mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="text-muted-foreground"
      >
        {showComments ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
        {showComments ? "Ukryj komentarze" : "Pokaż komentarze"}
      </Button>
    </div>
  );
}
