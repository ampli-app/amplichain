
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Post } from '@/types/social';

interface PostContentProps {
  content: string;
  hashtags?: string[];
  post?: Post;
}

export function PostContent({ content, hashtags, post }: PostContentProps) {
  // Używamy content i hashtags z propsów, a jeśli przekazano post, to bierzemy z niego
  const postContent = post ? post.content : content;
  const postHashtags = post ? post.hashtags : hashtags;
  
  // Konwertuj linki URL i hashtagi na klikalne elementy
  const renderContent = () => {
    if (!postContent) return null;
    
    // Regex wzorce dla URL i hashtagów
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /#(\w+)/g;
    
    // Podziel zawartość na części i zastąp linki i hashtagi elementami React
    let parts = postContent.split(urlRegex);
    let result = parts.map((part, i) => {
      // Sprawdź, czy część pasuje do wzorca URL
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      
      // Podziel tekst po hashtagach
      const hashtagParts = part.split(hashtagRegex);
      
      return hashtagParts.map((hashtagPart, j) => {
        // Sprawdź, czy część jest hashtagiem (zaczyna się od #)
        if (part.match(hashtagRegex)?.[j-1] === `#${hashtagPart}`) {
          return (
            <Link 
              key={`${i}-${j}`} 
              to={`/hashtag/${hashtagPart}`} 
              className="text-primary hover:underline"
            >
              #{hashtagPart}
            </Link>
          );
        }
        
        return hashtagPart;
      });
    });
    
    return result;
  };
  
  return (
    <Card className="p-4 bg-background">
      <div className="whitespace-pre-wrap break-words">
        {renderContent()}
      </div>
      
      {/* Usuwamy sekcję dodatkowych hashtagów na dole, 
          ponieważ są już wyświetlane w treści posta */}
    </Card>
  );
}
