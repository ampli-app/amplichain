
import { Hash } from 'lucide-react';
import { type HashtagSuggestion } from '@/hooks/useHashtagSuggestions';

interface HashtagSuggestionsProps {
  showSuggestions: boolean;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  suggestions: HashtagSuggestion[];
  isLoading: boolean;
  onSelectHashtag: (hashtag: string) => void;
  position?: 'top' | 'bottom';
}

export function HashtagSuggestions({
  showSuggestions,
  suggestionsRef,
  suggestions,
  isLoading,
  onSelectHashtag,
  position = 'bottom'
}: HashtagSuggestionsProps) {
  if (!showSuggestions) return null;
  
  return (
    <div 
      ref={suggestionsRef}
      className="absolute z-10 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto w-64"
      style={{ 
        [position === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 5px)', 
        left: '20px' 
      }}
    >
      <div className="p-2 border-b text-xs font-medium text-rhythm-500 flex items-center">
        <Hash className="h-3 w-3 mr-1" />
        Popularne hashtagi
      </div>
      
      {isLoading ? (
        <div className="p-3 text-center text-sm text-rhythm-500">
          Ładowanie...
        </div>
      ) : suggestions.length > 0 ? (
        <ul>
          {suggestions.map((hashtag) => (
            <li 
              key={hashtag.id}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm transition-colors"
              onClick={() => onSelectHashtag(hashtag.name)}
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
  );
}
