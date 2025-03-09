
import { Link } from "react-router-dom";

interface ColoredHashtagProps {
  hashtag: string;
  linkable?: boolean;
}

export function ColoredHashtag({ hashtag, linkable = true }: ColoredHashtagProps) {
  const hashtagText = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
  
  if (linkable) {
    return (
      <Link 
        to={`/hashtag/${hashtagText}`} 
        className="text-primary hover:underline font-medium"
      >
        #{hashtagText}
      </Link>
    );
  }
  
  return (
    <span className="text-primary font-medium">
      #{hashtagText}
    </span>
  );
}
