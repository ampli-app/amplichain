
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";

interface PostContentProps {
  content: string;
  hashtags?: string[];
}

export function PostContent({ content, hashtags }: PostContentProps) {
  // Konwertuj linki URL i hashtagi na klikalne elementy
  const renderContent = () => {
    if (!content) return null;
    
    // Regex wzorce dla URL i hashtagów
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /#(\w+)/g;
    
    // Podziel zawartość na części i zastąp linki i hashtagi elementami React
    let parts = content.split(urlRegex);
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
      
      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {hashtags.map((tag, index) => (
            <Link 
              key={index} 
              to={`/hashtag/${tag}`} 
              className="text-primary hover:underline text-sm"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
