
import { Comment } from '@/types/social';

interface CommentContentProps {
  content: string;
}

export function CommentContent({ content }: CommentContentProps) {
  return (
    <p className="mt-1 text-sm break-words">{content}</p>
  );
}
