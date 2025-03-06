
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HashtagSuggestion = {
  id: string;
  name: string;
};

interface UseHashtagSuggestionsProps {
  content: string;
  cursorPosition: number;
}

export function useHashtagSuggestions({ content, cursorPosition }: UseHashtagSuggestionsProps) {
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestion[]>([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Sprawdź, czy użytkownik wpisuje hashtag
    const textBeforeCursor = content.substring(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      const query = hashtagMatch[1];
      setHashtagQuery(query);
      fetchHashtagSuggestions(query);
      setShowHashtagSuggestions(true);
    } else {
      setShowHashtagSuggestions(false);
    }
  }, [content, cursorPosition]);
  
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
  
  const insertHashtag = (text: string, hashtag: string, textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    const textBeforeCursor = text.substring(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      const startPos = cursorPosition - hashtagMatch[1].length;
      const newContent = 
        text.substring(0, startPos) + 
        hashtag + ' ' + 
        text.substring(cursorPosition);
      
      // Po wstawieniu tagu ustawić kursor na odpowiedniej pozycji
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition = startPos + hashtag.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
      
      setShowHashtagSuggestions(false);
      return { newContent, newPosition: startPos + hashtag.length + 1 };
    }
    
    return { newContent: text, newPosition: cursorPosition };
  };
  
  return {
    hashtagSuggestions,
    showHashtagSuggestions,
    hashtagQuery,
    isLoadingHashtags,
    suggestionsRef,
    insertHashtag,
    setShowHashtagSuggestions
  };
}
