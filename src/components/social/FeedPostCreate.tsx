
import { useState, useRef } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Image, 
  FileText, 
  BarChart2, 
  Send, 
  X, 
  ChevronDown,
  User
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

type MediaFile = {
  url: string;
  type: 'image' | 'video' | 'document';
  name?: string;
  size?: number;
  fileType?: string;
  file?: File;
};

export function FeedPostCreate({ onPostCreated }: { onPostCreated?: () => void }) {
  const { currentUser } = useSocial();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      const filePath = `feed_media/${fileName}`;
      
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
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby utworzyć post",
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
        .from('feed_posts')
        .insert({
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
          .from('feed_post_poll_options')
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
                  .from('feed_post_files')
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
                  .from('feed_post_media')
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
        description: "Twój post został pomyślnie opublikowany",
      });
      
      // Resetuj formularz
      setContent('');
      setIsPollMode(false);
      setPollOptions(['', '']);
      setMedia([]);
      setIsExpanded(false);
      
      // Wywołaj callback, jeśli został przekazany
      if (onPostCreated) {
        onPostCreated();
      }
      
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
        
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Co słychać?"
            className="resize-none mb-3 min-h-24"
            onFocus={() => setIsExpanded(true)}
            disabled={loading}
          />
          
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
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => removePollOption(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addPollOption}
                disabled={loading || pollOptions.length >= 10}
                className="mt-2"
              >
                Dodaj opcję
              </Button>
            </div>
          )}
          
          {/* Wyświetlanie dodanych plików */}
          {media.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {media.map((item, index) => (
                <div 
                  key={index} 
                  className="relative group border rounded-md overflow-hidden"
                >
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt="Preview" 
                      className="w-full h-32 object-cover"
                    />
                  ) : item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      className="w-full h-32 object-cover" 
                      controls
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-slate-100 dark:bg-slate-800 p-3">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs font-medium truncate max-w-full">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                      </div>
                    </div>
                  )}
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-80"
                    onClick={() => removeMedia(index)}
                    disabled={loading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*, video/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
                multiple
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || media.length >= 6}
              >
                <Image className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only sm:inline">Media</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={togglePollMode}>
                    <BarChart2 className="h-4 w-4 mr-2" />
                    {isPollMode ? 'Wyłącz tryb ankiety' : 'Dodaj ankietę'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && media.length === 0 && !isPollMode)}
              className="gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Publikowanie...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publikuj
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
