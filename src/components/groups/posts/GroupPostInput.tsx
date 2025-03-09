import { useRef, useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useHashtagSuggestions } from '@/hooks/useHashtagSuggestions';
import { HashtagSuggestions } from '@/components/common/HashtagSuggestions';
import { convertEmoticonOnInput } from '@/utils/emoticonUtils';

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
  const formattedContainerRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [formattedContent, setFormattedContent] = useState<React.ReactNode[]>([]);
  
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

  // Funkcja do formatowania tekstu z hashtagami
  const formatTextWithHashtags = (text: string): React.ReactNode[] => {
    if (!text) return [];

    // Regex do wyszukiwania hashtagów (#słowo)
    const hashtagRegex = /(#[^\s#]+)/g;
    
    // Dzielimy tekst na części
    const parts = text.split(hashtagRegex);
    
    return parts.map((part, index) => {
      // Jeśli część pasuje do wzorca hashtaga, stosujemy formatowanie w kolorze primary
      if (part.match(hashtagRegex)) {
        return (
          <span key={index} className="text-primary font-semibold">
            {part}
          </span>
        );
      }
      // W przeciwnym razie zwracamy zwykły tekst
      return <span key={index}>{part}</span>;
    });
  };
  
  // Aktualizujemy sformatowaną zawartość, gdy zmienia się tekst
  useEffect(() => {
    setFormattedContent(formatTextWithHashtags(content));
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

  // Synchronizujemy przewijanie między textarea a div z kolorowym formatowaniem
  useEffect(() => {
    const textarea = textareaRef.current;
    const formattedDiv = formattedContainerRef.current;
    
    if (!textarea || !formattedDiv) return;
    
    const syncScroll = () => {
      if (formattedDiv) {
        formattedDiv.scrollTop = textarea.scrollTop;
      }
    };
    
    textarea.addEventListener('scroll', syncScroll);
    return () => {
      textarea.removeEventListener('scroll', syncScroll);
    };
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onFocus) onFocus();
  };

  // Sprawdzamy, czy powinniśmy pokazać warstwę z formatowaniem
  const shouldShowFormatting = content.length > 0;

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
        {/* Zwykłe textarea z normalnym tekstem i placeholderem */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder={placeholder}
          className={`resize-none mb-3 min-h-24 ${shouldShowFormatting ? 'text-transparent' : ''}`}
          style={{ 
            caretColor: 'currentColor',
            // Tylko gdy mamy tekst, robimy go przezroczystym
            color: shouldShowFormatting ? 'transparent' : 'inherit' 
          }}
          onFocus={handleFocus}
          disabled={disabled}
        />
        
        {/* Warstwa z kolorowym formatowaniem hashtagów - pokazujemy tylko gdy jest jakaś zawartość */}
        {shouldShowFormatting && (
          <div 
            ref={formattedContainerRef}
            className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none p-2 pt-3 whitespace-pre-wrap break-words overflow-hidden text-foreground" 
          >
            {formattedContent}
          </div>
        )}
        
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
