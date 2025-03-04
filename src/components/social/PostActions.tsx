
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostActionsProps {
  comments: number;
}

export function PostActions({ comments }: PostActionsProps) {
  return (
    <div className="flex items-center justify-between mt-4 border-t pt-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 h-8 px-2"
            type="button"
            disabled
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{comments}</span>
        </div>
      </div>
    </div>
  );
}
