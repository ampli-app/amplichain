
import { useRef, useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useHashtagSuggestions } from '@/hooks/useHashtagSuggestions';
import { HashtagSuggestions } from '@/components/common/HashtagSuggestions';
import { convertEmoticonOnInput } from '@/utils/emoticonUtils';
import { ContentRenderer } from '@/components/common/ContentRenderer';

interface GroupPostInputProps {
  avatarUrl?: string;
  userName?: string;
  placeholder: string;
  content: string;
  setContent: (content: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
}

export function GroupPostInput({
  avatarUrl,
  userName,
  placeholder,
  content,
  setContent,
  disabled = false,
  onFocus
}: GroupPostInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [displayText, setDisplayText] = useState('');
  
  const { 
    hashtagSuggestions, 
    showHashtagSuggestions, 
    isLoadingHashtags,
    suggestionsRef,
    insertHashtag
  } = useHashtagSuggestions({ 
    content, 
    cursorPosition
  });
  
  useEffect(() => {
    // Kolorowanie hashtagów w czasie rzeczywistym
    setDisplayText(content);
  }, [content]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const currentPosition = e.target.selectionStart || 0;
    setCursorPosition(currentPosition);
    
    // Sprawdź, czy należy przekonwertować emotikon
    const { text, newPosition } = convertEmoticonOnInput(newContent, currentPosition);
    
    if (text !== newContent) {
      setContent(text);
      // Ustaw kursor na odpowiedniej pozycji w następnym cyklu renderowania
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          setCursorPosition(newPosition);
        }
      }, 0);
    } else {
      setContent(newContent);
      setCursorPosition(currentPosition);
    }
  };
  
  const handleSelectHashtag = (hashtag: string) => {
    const { newContent, newPosition } = insertHashtag(content, hashtag, textareaRef);
    setContent(newContent);
    setCursorPosition(newPosition);
  };

  // Funkcja do kolorowania hashtagów w tekście
  const renderColoredContent = (text: string) => {
    if (!text) return null;
    
    // Regex do wyszukiwania hashtagów
    const parts = text.split(/(#\w+)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return <span key={index} className="text-primary font-medium">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage 
          src={avatarUrl} 
          alt={userName || "Profil użytkownika"} 
        />
        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
      </Avatar>
      
      <div className="flex-1 relative">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            className="resize-none mb-3 min-h-24"
            onFocus={onFocus}
            disabled={disabled}
            style={{ color: 'transparent', caretColor: 'black' }}
          />
          
          <div 
            className="absolute inset-0 p-3 overflow-hidden whitespace-pre-wrap break-words pointer-events-none"
            aria-hidden="true"
          >
            {displayText ? (
              renderColoredContent(displayText)
            ) : (
              <span className="text-muted-foreground">{!content && placeholder}</span>
            )}
          </div>
        </div>
        
        <HashtagSuggestions 
          showSuggestions={showHashtagSuggestions}
          suggestionsRef={suggestionsRef}
          suggestions={hashtagSuggestions}
          isLoading={isLoadingHashtags}
          onSelectHashtag={handleSelectHashtag}
        />
      </div>
    </div>
  );
}
