
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentReplyFormProps {
  loading: boolean;
  onCancel: () => void;
  onSubmit: (content: string) => void;
}

export function CommentReplyForm({ loading, onCancel, onSubmit }: CommentReplyFormProps) {
  const [replyContent, setReplyContent] = useState('');
  
  const handleSubmit = () => {
    if (!replyContent.trim() || loading) return;
    onSubmit(replyContent);
    setReplyContent('');
  };
  
  return (
    <div className="mt-2 pl-1">
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Napisz odpowiedź..."
        className="text-sm min-h-[60px] mb-2"
        disabled={loading}
      />
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={loading}
          type="button"
        >
          Anuluj
        </Button>
        <Button 
          size="sm" 
          onClick={handleSubmit}
          disabled={!replyContent.trim() || loading}
          type="button"
        >
          Wyślij
        </Button>
      </div>
    </div>
  );
}
