
import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, PaperclipIcon, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSendMessage, disabled = false, placeholder = 'Napisz wiadomość...' }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Dodane dla funkcjonalności hashtagów
  const [hashtagSuggestions, setHashtagSuggestions] = useState<{id: string, name: string}[]>([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      // Automatyczne dostosowanie wysokości
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      
      // Zresetuj wysokość
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Funkcja do śledzenia pozycji kursora w textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setMessage(newContent);
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
    const textBeforeCursor = message.substring(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      const startPos = cursorPosition - hashtagMatch[1].length;
      const newContent = 
        message.substring(0, startPos) + 
        hashtag + ' ' + 
        message.substring(cursorPosition);
      
      setMessage(newContent);
      
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
  
  return (
    <form onSubmit={handleSubmit} className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-end gap-2">
        <Button type="button" variant="ghost" size="icon" className="text-gray-500">
          <PaperclipIcon className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="resize-none min-h-10 pr-10 py-2.5"
            rows={1}
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
        </div>
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
