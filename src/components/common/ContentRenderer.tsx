
import React from 'react';
import { ColoredHashtag } from './ColoredHashtag';

interface ContentRendererProps {
  content: string;
  linkableHashtags?: boolean;
}

export function ContentRenderer({ content, linkableHashtags = true }: ContentRendererProps) {
  if (!content) return null;
  
  // Regex dla URL, hashtagów i spacji po hashtagach
  const regex = /(https?:\/\/[^\s]+)|(\s|^)(#\w+)(\s|$)|(\S+)/g;
  const parts: React.ReactNode[] = [];
  
  let lastIndex = 0;
  let match;
  let key = 0;
  
  while ((match = regex.exec(content)) !== null) {
    // URL
    if (match[1]) {
      parts.push(
        <a 
          key={key++}
          href={match[1]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline"
        >
          {match[1]}
        </a>
      );
    }
    // Hashtag ze spacją przed/po
    else if (match[3]) {
      // Dodaj spację przed, jeśli istnieje
      if (match[2] && match[2] !== '^') {
        parts.push(<span key={key++}>{match[2]}</span>);
      }
      
      // Dodaj hashtag
      parts.push(
        <ColoredHashtag key={key++} hashtag={match[3]} linkable={linkableHashtags} />
      );
      
      // Dodaj spację po, jeśli istnieje
      if (match[4] && match[4] !== '$') {
        parts.push(<span key={key++}>{match[4]}</span>);
      }
    }
    // Dowolny inny tekst
    else if (match[5]) {
      parts.push(<span key={key++}>{match[5]}</span>);
    }
    
    lastIndex = regex.lastIndex;
  }
  
  return <>{parts}</>;
}
