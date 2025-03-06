
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, PaperclipIcon, User, Hash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Dodane dla funkcjonalności hashtagów
  const [hashtagSuggestions, setHashtagSuggestions] = useState<{id: string, name: string}[]>([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
      e.preventDefault();
      onAddComment();
    }
  };
  
  // Funkcja do śledzenia pozycji kursora w textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCommentText(newContent);
    setCursorPosition(e.target.selectionStart);
    
    // Sprawdź, czy użytkownik wpisuje hashtag
    const textBeforeCursor = newContent.substring(0, e.target.selectionStart);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      const query = hashtagMatch[1];
      setHashtagQuery(query);
      fetchHashtagSuggestions(query);
      setShowHashtagSuggestions(true);
    } else {
      setShowHashtagSuggestions(false);
    }
  };
  
  // Zamknij sugestie po kliknięciu poza nimi
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowHashtagSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Funkcja pobierająca sugestie hashtagów z Supabase
  const fetchHashtagSuggestions = async (query: string) => {
    if (query.length === 0) {
      setHashtagSuggestions([]);
      return;
    }
    
    setIsLoadingHashtags(true);
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('id, name')
        .ilike('name', `${query}%`)
        .order('name')
        .limit(5);
      
      if (error) {
        console.error('Błąd podczas pobierania sugestii hashtagów:', error);
        return;
      }
      
      setHashtagSuggestions(data || []);
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
    } finally {
      setIsLoadingHashtags(false);
    }
  };
  
  // Funkcja do wstawiania wybranego hashtagu do treści
  const insertHashtag = (hashtag: string) => {
    const textBeforeCursor = commentText.substring(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      const startPos = cursorPosition - hashtagMatch[1].length;
      const newContent = 
        commentText.substring(0, startPos) + 
        hashtag + ' ' + 
        commentText.substring(cursorPosition);
      
      setCommentText(newContent);
      
      // Po wstawieniu tagu ustawić kursor na odpowiedniej pozycji
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition = startPos + hashtag.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          setCursorPosition(newCursorPosition);
        }
      }, 0);
    }
    
    setShowHashtagSuggestions(false);
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
      
      <div className="flex-1 flex gap-2 relative">
        <Textarea 
          ref={textareaRef}
          value={commentText}
          onChange={handleContentChange}
          onKeyPress={handleKeyPress}
          placeholder="Napisz komentarz..." 
          className="min-h-[40px] py-2 text-sm resize-none"
          disabled={disabled}
        />
        
        {/* Podpowiedzi hashtagów */}
        {showHashtagSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute z-10 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto w-64"
            style={{ top: 'calc(100% + 5px)', left: '20px' }}
          >
            <div className="p-2 border-b text-xs font-medium text-rhythm-500 flex items-center">
              <Hash className="h-3 w-3 mr-1" />
              Popularne hashtagi
            </div>
            
            {isLoadingHashtags ? (
              <div className="p-3 text-center text-sm text-rhythm-500">
                Ładowanie...
              </div>
            ) : hashtagSuggestions.length > 0 ? (
              <ul>
                {hashtagSuggestions.map((hashtag) => (
                  <li 
                    key={hashtag.id}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm transition-colors"
                    onClick={() => insertHashtag(hashtag.name)}
                  >
                    #{hashtag.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-center text-sm text-rhythm-500">
                Brak pasujących hashtagów
              </div>
            )}
          </div>
        )}
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="absolute right-1 bottom-1 text-gray-500"
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <Button 
          className="h-full self-end" 
          onClick={onAddComment} 
          disabled={!commentText.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
