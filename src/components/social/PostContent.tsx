
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
      
      // Teraz przetwarzamy hashtagi - używamy regex do podziału
      const textParts = [];
      let lastIndex = 0;
      let match;
      
      // Utworzenie nowego regex dla każdego wykonania, aby uniknąć problemów z lastIndex
      const regex = new RegExp(hashtagRegex);
      
      while ((match = regex.exec(part)) !== null) {
        // Dodaj tekst przed hashtagiem
        if (match.index > lastIndex) {
          textParts.push(
            <span key={`text-${lastIndex}`}>
              {part.substring(lastIndex, match.index)}
            </span>
          );
        }
        
        // Dodaj hashtag jako link
        const hashtagText = match[1]; // Grupa z hashtagiem bez znaku #
        textParts.push(
          <Link 
            key={`hashtag-${match.index}`} 
            to={`/hashtag/${hashtagText}`} 
            className="text-primary hover:underline"
          >
            #{hashtagText}
          </Link>
        );
        
        lastIndex = regex.lastIndex;
      }
      
      // Dodaj pozostały tekst po ostatnim hashtagu
      if (lastIndex < part.length) {
        textParts.push(
          <span key={`text-${lastIndex}`}>
            {part.substring(lastIndex)}
          </span>
        );
      }
      
      return textParts.length > 0 ? textParts : part;
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
