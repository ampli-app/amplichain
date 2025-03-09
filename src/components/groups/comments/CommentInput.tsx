
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useHashtagSuggestions } from '@/hooks/useHashtagSuggestions';
import { HashtagSuggestions } from '@/components/common/HashtagSuggestions';
import { convertEmoticonOnInput } from '@/utils/emoticonUtils';
import { ContentRenderer } from '@/components/common/ContentRenderer';

interface CommentInputProps {
  onAddComment: () => void;
  commentText: string;
  setCommentText: (text: string) => void;
  disabled?: boolean;
}

export function CommentInput({ 
  onAddComment, 
  commentText, 
  setCommentText, 
  disabled = false 
}: CommentInputProps) {
  const { user, isLoggedIn } = useAuth();
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
    content: commentText, 
    cursorPosition
  });
  
  useEffect(() => {
    // Kolorowanie hashtagów po naciśnięciu spacji
    const colorHashtagsOnSpace = () => {
      // Zmieniamy displayText tylko jeśli komentarz zawiera hashtagi
      if (commentText.includes('#')) {
        setDisplayText(commentText);
      } else {
        setDisplayText('');
      }
    };
    
    colorHashtagsOnSpace();
  }, [commentText]);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
      e.preventDefault();
      onAddComment();
    }
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCommentText(newContent);
    const currentPosition = e.target.selectionStart || 0;
    setCursorPosition(currentPosition);
    
    // Sprawdź, czy należy przekonwertować emotikon
    const { text, newPosition } = convertEmoticonOnInput(newContent, currentPosition);
    if (text !== newContent) {
      setCommentText(text);
      // Ustaw kursor na odpowiedniej pozycji w następnym cyklu renderowania
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          setCursorPosition(newPosition);
        }
      }, 0);
    }
  };
  
  const handleSelectHashtag = (hashtag: string) => {
    const { newContent, newPosition } = insertHashtag(commentText, hashtag, textareaRef);
    setCommentText(newContent);
    setCursorPosition(newPosition);
  };
  
  if (!isLoggedIn) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
        <p className="text-sm text-rhythm-500 mb-2">Zaloguj się, aby dodawać komentarze</p>
        <Link to="/login">
          <Button size="sm" variant="outline">Zaloguj się</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
      </Avatar>
      
      <div className="flex-1 flex flex-col gap-2 relative">
        <div className="relative">
          <Textarea 
            ref={textareaRef}
            value={commentText}
            onChange={handleContentChange}
            onKeyPress={handleKeyPress}
            placeholder="Napisz komentarz..." 
            className="min-h-[40px] py-2 text-sm resize-none"
            disabled={disabled}
          />
          
          {displayText && (
            <div 
              className="absolute inset-0 pointer-events-none p-3 overflow-hidden whitespace-pre-wrap break-words text-sm"
              style={{ opacity: 0 }}
            >
              <ContentRenderer content={displayText} linkableHashtags={false} />
            </div>
          )}
        </div>
        
        <HashtagSuggestions 
          showSuggestions={showHashtagSuggestions}
          suggestionsRef={suggestionsRef}
          suggestions={hashtagSuggestions}
          isLoading={isLoadingHashtags}
          onSelectHashtag={handleSelectHashtag}
        />
        
        <div className="flex justify-end">
          <Button 
            className="h-9 self-end" 
            onClick={onAddComment} 
            disabled={!commentText.trim() || disabled}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
