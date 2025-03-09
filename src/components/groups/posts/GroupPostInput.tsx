
import { useCallback, useMemo, useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createEditor, Descendant, Editor, Text, Transforms, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
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

// Definiujemy niestandardowe typy dla Slate.js
type CustomElement = {
  children: CustomText[];
}

type CustomText = {
  text: string;
  hashtag?: boolean;
}

// Niestandardowy renderer dla elementów
const renderElement = (props: any) => {
  const { attributes, children } = props;
  return <p {...attributes}>{children}</p>;
};

// Niestandardowy renderer dla liści (tekstu)
const renderLeaf = (props: any) => {
  const { attributes, children, leaf } = props;
  
  return (
    <span 
      {...attributes} 
      className={leaf.hashtag ? 'text-primary font-semibold' : ''}
    >
      {children}
    </span>
  );
};

// Konwersja zwykłego tekstu na format Slate.js
const deserialize = (text: string): Descendant[] => {
  // Jeśli text jest pusty, zwróć pusty paragraf
  if (!text) {
    return [{ children: [{ text: '' }] }];
  }

  // Podziel tekst na części, aby wyróżnić hashtagi
  const result = [{ 
    children: [] as { text: string; hashtag?: boolean }[]
  }];
  
  // Regex do wykrywania hashtagów
  const hashtagRegex = /(#[^\s#]+)|([^#]+)/g;
  const matches = text.matchAll(hashtagRegex);
  
  for (const match of matches) {
    const content = match[0];
    const isHashtag = content.startsWith('#');
    
    result[0].children.push({
      text: content,
      ...(isHashtag && { hashtag: true })
    });
  }
  
  return result;
};

// Konwersja formatu Slate.js z powrotem na zwykły tekst
const serialize = (nodes: Descendant[]): string => {
  return nodes
    .map(n => Node.string(n))
    .join('\n');
};

// Funkcja do sprawdzania, czy znak jest w hashtagu
const isInHashtag = (editor: Editor, point: any): boolean => {
  const { selection } = editor;
  if (!selection) return false;

  const [node] = Editor.node(editor, point);
  const text = (node as any).text as string;
  
  if (!text) return false;
  
  // Znajdź początek i koniec słowa
  let start = point.offset;
  while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') {
    start--;
  }
  
  // Sprawdź, czy słowo zaczyna się od #
  return text[start] === '#';
};

export function GroupPostInput({
  avatarUrl,
  userName,
  placeholder,
  content,
  setContent,
  disabled = false,
  onFocus
}: GroupPostInputProps) {
  // Tworzymy instancję edytora Slate
  const editor = useMemo(() => withReact(createEditor()), []);
  
  // Stan dla wartości edytora
  const [value, setValue] = useState<Descendant[]>(() => deserialize(content));
  
  const [cursorPosition, setCursorPosition] = useState(0);
  
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
  
  // Aktualizacja zaznaczenia hashtagów podczas wprowadzania tekstu
  const decorate = useCallback(([node, path]: any) => {
    const ranges: any[] = [];
    
    if (!Text.isText(node)) {
      return ranges;
    }
    
    const text = node.text as string;
    const hashtagRegex = /#[^\s#]+/g;
    let match;
    
    while ((match = hashtagRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: match.index },
        focus: { path, offset: match.index + match[0].length },
        hashtag: true,
      });
    }
    
    return ranges;
  }, []);
  
  // Obsługa zmiany wartości w edytorze
  const handleChange = (newValue: Descendant[]) => {
    setValue(newValue);
    
    // Konwertujemy wartość Slate na zwykły tekst
    const newContent = newValue.map(n => Node.string(n)).join('\n');
    
    // Aktualizujemy pozycję kursora
    const selection = editor.selection;
    if (selection) {
      const point = selection.focus;
      setCursorPosition(point.offset);
    }
    
    // Sprawdzamy, czy tekst zawiera emotikony do konwersji
    const { text, newPosition } = convertEmoticonOnInput(newContent, cursorPosition);
    
    if (text !== newContent) {
      // Jeśli emotikon został przekształcony, aktualizujemy wartość
      const newNodes = deserialize(text);
      setValue(newNodes);
      
      // Aktualizujemy pozycję kursora po konwersji emotikona
      setTimeout(() => {
        Transforms.select(editor, {
          path: [0, 0],
          offset: newPosition,
        });
        setCursorPosition(newPosition);
      }, 0);
      
      setContent(text);
    } else {
      setContent(newContent);
    }
  };
  
  // Obsługa wyboru hashtagu z sugestii
  const handleSelectHashtag = (hashtag: string) => {
    if (!editor.selection) return;
    
    // Znajdź obecny hashtag
    const { focus } = editor.selection;
    const wordBefore = Editor.before(editor, focus, { unit: 'word' });
    
    if (!wordBefore) return;
    
    const before = Editor.before(editor, wordBefore);
    const range = before ? { anchor: before, focus } : { anchor: wordBefore, focus };
    const currentText = Editor.string(editor, range);
    
    // Znajdź pozycję hashtagu w tekście
    const hashtagStart = currentText.lastIndexOf('#');
    if (hashtagStart === -1) return;
    
    // Utwórz nowy zakres obejmujący tylko hashtag
    const hashtagRange = {
      anchor: { path: range.anchor.path, offset: range.anchor.offset + hashtagStart },
      focus,
    };
    
    // Zastąp bieżący hashtag nowym
    Transforms.select(editor, hashtagRange);
    Transforms.insertText(editor, hashtag);
    
    // Aktualizuj stan content
    const newContent = value.map(n => Node.string(n)).join('\n');
    setContent(newContent);
  };
  
  // Obsługa focusu
  const handleFocus = () => {
    if (onFocus) onFocus();
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
        <Slate 
          editor={editor} 
          initialValue={value} 
          onChange={handleChange}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            decorate={decorate}
            placeholder={placeholder}
            className="resize-none mb-3 min-h-24 p-2 border rounded-md"
            onFocus={handleFocus}
            readOnly={disabled}
          />
        </Slate>
        
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

// Import potrzebny do serializacji
import { Node } from 'slate';

