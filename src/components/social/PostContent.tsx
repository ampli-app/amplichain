
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Post } from '@/types/social';
import { ContentRenderer } from '@/components/common/ContentRenderer';

interface PostContentProps {
  content: string;
  hashtags?: string[];
  post?: Post;
}

export function PostContent({ content, hashtags, post }: PostContentProps) {
  // Używamy content i hashtags z propsów, a jeśli przekazano post, to bierzemy z niego
  const postContent = post ? post.content : content;
  
  return (
    <Card className="p-4 bg-background">
      <div className="whitespace-pre-wrap break-words">
        <ContentRenderer content={postContent} />
      </div>
    </Card>
  );
}
