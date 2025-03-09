
import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, PaperclipIcon } from 'lucide-react';
import { useHashtagSuggestions } from '@/hooks/useHashtagSuggestions';
import { HashtagSuggestions } from '@/components/common/HashtagSuggestions';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSendMessage, disabled = false, placeholder = 'Napisz wiadomość...' }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const { 
    hashtagSuggestions, 
    showHashtagSuggestions, 
    isLoadingHashtags,
    suggestionsRef,
    insertHashtag
  } = useHashtagSuggestions({ 
    content: message, 
    cursorPosition
  });
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(convertEmoticons(message));
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
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setMessage(newContent);
    setCursorPosition(e.target.selectionStart);
    
    // Automatyczne dostosowanie wysokości
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };
  
  const handleSelectHashtag = (hashtag: string) => {
    const { newContent, newPosition } = insertHashtag(message, hashtag, textareaRef);
    setMessage(newContent);
    setCursorPosition(newPosition);
  };
  
  // Funkcja konwertująca emotikony tekstowe na emoji
  const convertEmoticons = (text: string): string => {
    const emoticonMap: Record<string, string> = {
      ':)': '😊',
      ':-)': '😊',
      ':D': '😃',
      ':-D': '😃',
      ';)': '😉',
      ';-)': '😉',
      ':(': '☹️',
      ':-(': '☹️',
      ':P': '😛',
      ':-P': '😛',
      ':p': '😛',
      ':-p': '😛',
      ':*': '😘',
      ':-*': '😘',
      '<3': '❤️',
      ':O': '😮',
      ':o': '😮',
      ':-O': '😮',
      ':-o': '😮',
      ':|': '😐',
      ':-|': '😐',
      ':S': '😖',
      ':s': '😖',
      ':-S': '😖',
      ':-s': '😖',
      '>:(': '😠',
      '>:-(': '😠',
      'xD': '😆',
      'XD': '😆',
      ':/': '😕',
      ':-/': '😕',
      ':3': '😺',
      '^_^': '😄',
      '^.^': '😄',
      '^-^': '😄',
      'O.o': '😳',
      'o.O': '😳',
      'O_o': '😳',
      'o_O': '😳',
      '-_-': '😒',
    };
    
    // Zamień wszystkie emotikony na emoji
    let convertedText = text;
    for (const [emoticon, emoji] of Object.entries(emoticonMap)) {
      // Używamy wyrażenia regularnego, aby uniknąć zastępowania części słów
      // Szukamy emotikona otoczonego spacjami lub na początku/końcu tekstu
      const regex = new RegExp(`(^|\\s)${emoticon.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")}(?=\\s|$)`, 'g');
      convertedText = convertedText.replace(regex, `$1${emoji}`);
    }
    
    return convertedText;
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
            className="resize-none min-h-10 py-2.5"
            rows={1}
          />
          
          <HashtagSuggestions 
            showSuggestions={showHashtagSuggestions}
            suggestionsRef={suggestionsRef}
            suggestions={hashtagSuggestions}
            isLoading={isLoadingHashtags}
            onSelectHashtag={handleSelectHashtag}
          />
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
