
import React from 'react';
import { ColoredHashtag } from './ColoredHashtag';

interface ContentRendererProps {
  content: string;
  linkableHashtags?: boolean;
}

export function ContentRenderer({ content, linkableHashtags = true }: ContentRendererProps) {
  if (!content) return null;
  
  // Regex dla URL, hashtagów i zachowania pozostałego tekstu
  const regex = /(https?:\/\/[^\s]+)|(#\w+)|([^#https]?[\s\S]*?)(?=#|\bhttps?:\/\/|$)/g;
  const parts: React.ReactNode[] = [];
  
  let match;
  let key = 0;
  
  // Używamy exec w pętli, aby przetwarzać każde dopasowanie
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
    // Hashtag
    else if (match[2]) {
      parts.push(
        <ColoredHashtag key={key++} hashtag={match[2]} linkable={linkableHashtags} />
      );
    }
    // Zwykły tekst (z zachowaniem spacji i znaków nowej linii)
    else if (match[3]) {
      // Podziel tekst na wiersze, aby zachować znaki nowej linii
      const textLines = match[3].split('\n');
      
      textLines.forEach((line, index) => {
        if (index > 0) {
          // Dodaj element br dla każdej nowej linii (oprócz pierwszej)
          parts.push(<br key={`br-${key++}`} />);
        }
        
        if (line.length > 0) {
          parts.push(<span key={key++}>{line}</span>);
        }
      });
    }
  }
  
  // Jeśli nie znaleziono żadnych dopasowań, po prostu zwróć oryginalny tekst
  if (parts.length === 0 && content.trim().length > 0) {
    return <span>{content}</span>;
  }
  
  return <>{parts}</>;
}
