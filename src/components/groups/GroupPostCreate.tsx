import { useState, useRef, useEffect } from 'react';
import { Group } from '@/types/group';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Image, 
  FileText, 
  BarChart2, 
  Send, 
  X, 
  ChevronDown,
  User,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface GroupPostCreateProps {
  group: Group;
}

type MediaFile = {
  url: string;
  type: 'image' | 'video' | 'document';
  name?: string;
  size?: number;
  fileType?: string;
  file?: File;
};

export function GroupPostCreate({ group }: GroupPostCreateProps) {
  const { currentUser } = useSocial();
  const { user } = useAuth();
  const { id: groupId } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Dodane dla funkcjonalności hashtagów
  const [hashtagSuggestions, setHashtagSuggestions] = useState<{id: string, name: string}[]>([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Funkcja do śledzenia pozycji kursora w textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
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
    const textBeforeCursor = content.substring(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      const startPos = cursorPosition - hashtagMatch[1].length;
      const newContent = 
        content.substring(0, startPos) + 
        hashtag + ' ' + 
        content.substring(cursorPosition);
      
      setContent(newContent);
      
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
  
  const togglePollMode = () => {
    if (isPollMode) {
      setPollOptions(['', '']);
    }
    setIsPollMode(!isPollMode);
  };
  
  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    } else {
      toast({
        title: "Limit opcji",
        description: "Możesz dodać maksymalnie 10 opcji do ankiety",
      });
    }
  };
  
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    } else {
      toast({
        title: "Minimum opcji",
        description: "Ankieta musi mieć co najmniej 2 opcje",
      });
    }
  };
  
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Check if we don't exceed the maximum files limit (6)
    if (media.length + files.length > 6) {
      toast({
        title: "Limit plików",
        description: "Możesz dodać maksymalnie 6 plików do jednego posta",
        variant: "destructive",
      });
      return;
    }
    
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isDocument = !isImage && !isVideo;
      
      const mediaType = isImage ? 'image' as const : 
                        isVideo ? 'video' as const : 
                        'document' as const;
      
      const url = URL.createObjectURL(file);
      
      setMedia(prev => [...prev, { 
        url, 
        type: mediaType,
        name: file.name,
        size: file.size,
        fileType: file.type,
        file: file
      }]);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Funkcja do przesyłania plików do Supabase Storage
  const uploadMediaToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `group_media/${groupId}/${fileName}`;
      
      // Prześlij plik do Supabase Storage
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, file);
      
      if (error) {
        console.error('Błąd podczas przesyłania pliku:', error);
        return null;
      }
      
      // Pobierz publiczny URL pliku
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas przesyłania pliku:', error);
      return null;
    }
  };
  
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];
    
    return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby utworzyć post",
        variant: "destructive",
      });
      return;
    }
    
    if (!groupId) {
      toast({
        title: "Błąd",
        description: "Nie można utworzyć posta - brak identyfikatora grupy",
        variant: "destructive",
      });
      return;
    }
    
    if (isPollMode) {
      // Validate poll options
      const filledOptions = pollOptions.filter(option => option.trim() !== '');
      if (filledOptions.length < 2) {
        toast({
          title: "Nieprawidłowa ankieta",
          description: "Ankieta musi mieć co najmniej 2 uzupełnione opcje",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!content.trim() && media.length === 0 && !isPollMode) {
      toast({
        title: "Pusty post",
        description: "Post musi zawierać tekst, ankietę lub media",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Utwórz post
      const { data: postData, error: postError } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: content.trim(),
          is_poll: isPollMode
        })
        .select('id')
        .single();
      
      if (postError) {
        throw new Error(`Błąd podczas tworzenia posta: ${postError.message}`);
      }
      
      const postId = postData.id;
      
      // 2. Jeśli to ankieta, dodaj opcje
      if (isPollMode) {
        const validOptions = pollOptions.filter(option => option.trim() !== '');
        
        const pollOptionsData = validOptions.map(option => ({
          post_id: postId,
          text: option.trim()
        }));
        
        const { error: pollOptionsError } = await supabase
          .from('group_post_poll_options')
          .insert(pollOptionsData);
        
        if (pollOptionsError) {
          throw new Error(`Błąd podczas dodawania opcji ankiety: ${pollOptionsError.message}`);
        }
      }
      
      // 3. Jeśli są media, prześlij je do Storage i zapisz w bazie danych
      if (media.length > 0) {
        // Prześlij pliki do Supabase Storage
        const mediaPromises = media.map(async (mediaItem) => {
          if (mediaItem.file) {
            const publicUrl = await uploadMediaToStorage(mediaItem.file);
            
            if (publicUrl) {
              if (mediaItem.type === 'document') {
                // Zapisz jako plik
                return supabase
                  .from('group_post_files')
                  .insert({
                    post_id: postId,
                    name: mediaItem.name || 'Plik',
                    url: publicUrl,
                    type: mediaItem.fileType || 'application/octet-stream',
                    size: mediaItem.size || 0
                  });
              } else {
                // Zapisz jako media (zdjęcie lub wideo)
                return supabase
                  .from('group_post_media')
                  .insert({
                    post_id: postId,
                    url: publicUrl,
                    type: mediaItem.type
                  });
              }
            }
          }
          return null;
        });
        
        const mediaResults = await Promise.all(mediaPromises);
        const mediaErrors = mediaResults
          .filter(result => result && result.error)
          .map(result => result?.error);
        
        if (mediaErrors.length > 0) {
          console.error('Błędy podczas zapisywania mediów:', mediaErrors);
        }
      }
      
      // Pokaż komunikat sukcesu
      toast({
        title: "Post utworzony",
        description: "Twój post został pomyślnie opublikowany w grupie",
      });
      
      // Resetuj formularz
      setContent('');
      setIsPollMode(false);
      setPollOptions(['', '']);
      setMedia([]);
      setIsExpanded(false);
      
      // Odśwież posty - symulacja odświeżenia strony, ponieważ zakładamy,
      // że inne komponenty będą aktualizować widok postów
      window.location.reload();
      
    } catch (error) {
      console.error('Błąd podczas tworzenia posta:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas tworzenia posta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 border shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage 
            src={currentUser?.avatar} 
            alt={currentUser?.name || "Twój profil"} 
          />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={`Napisz coś do grupy "${group.name}"...`}
            className="resize-none mb-3 min-h-24"
            onFocus={() => setIsExpanded(true)}
            disabled={loading}
          />
          
          {/* Podpowiedzi hashtagów */}
          {showHashtagSuggestions && (
            <div 
              ref={suggestionsRef}
              className="absolute z-10 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto w-64"
              style={{ top: textareaRef.current ? `${textareaRef.current.offsetHeight + 5}px` : '100%', left: '20px' }}
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
          
          {isPollMode && (
            <div className="space-y-3 mb-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <h3 className="font-medium">Opcje ankiety:</h3>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    placeholder={`Opcja ${index + 1}`}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={loading}
                  />
                  {pollOptions.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removePollOption(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addPollOption}
                disabled={pollOptions.length >= 10 || loading}
                className="w-full justify-center"
              >
                Dodaj opcję
              </Button>
            </div>
          )}
          
          {media.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {media.map((item, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 opacity-90 z-10"
                    onClick={() => removeMedia(index)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={`Załącznik ${index + 1}`} 
                      className="w-full h-auto max-h-48 object-cover rounded-md" 
                    />
                  ) : item.type === 'video' ? (
                    <video 
                      src={item.url}
                      controls
                      className="w-full h-auto max-h-48 object-cover rounded-md"
                    />
                  ) : (
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md flex flex-col items-center justify-center min-h-[100px]">
                      <FileText className="h-10 w-10 mb-2 text-slate-500" />
                      <p className="text-sm font-medium truncate max-w-full">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {isExpanded && (
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 text-rhythm-600"
                      disabled={loading}
                    >
                      <ChevronDown className="h-4 w-4" />
                      <span className="hidden md:inline">Rodzaj posta</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => setIsPollMode(false)}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Zwykły post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={togglePollMode}
                    >
                      <BarChart2 className="h-4 w-4" />
                      <span>Ankieta</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-rhythm-600"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={media.length >= 6 || loading}
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden md:inline">Media ({media.length}/6)</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                  multiple
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>
              
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={handleSubmit}
                disabled={loading || ((isPollMode && pollOptions.filter(o => o.trim()).length < 2) && 
                          (!content.trim() && media.length === 0))}
              >
                <Send className="h-4 w-4" />
                {loading ? 'Wysyłanie...' : 'Opublikuj'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
