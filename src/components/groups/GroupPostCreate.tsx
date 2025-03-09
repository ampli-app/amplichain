import { useState, useRef, useEffect } from 'react';
import { Group } from '@/types/group';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Image, 
  FileText, 
  BarChart2, 
  Send, 
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
import { useParams } from 'react-router-dom';
import { useHashtagSuggestions } from '@/hooks/useHashtagSuggestions';
import { HashtagSuggestions } from '@/components/common/HashtagSuggestions';
import { PollOptions } from '@/components/social/PollOptions';
import { MediaPreview, type MediaFile } from '@/components/social/MediaPreview';
import { handleFileUpload, uploadMediaToStorage } from '@/utils/mediaUtils';
import { convertEmoticonOnInput } from '@/utils/emoticonUtils';
import { ContentRenderer } from '@/components/common/ContentRenderer';
import { Card } from '@/components/ui/card';

interface GroupPostCreateProps {
  group: Group;
}

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
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
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
    
    // Pokaż podgląd tylko jeśli jest jakiś tekst
    setShowPreview(newContent.trim().length > 0);
  };
  
  useEffect(() => {
    // Aktualizuj podgląd po automatycznym uzupełnieniu hashtagu
    setShowPreview(content.trim().length > 0);
  }, [content]);
  
  const handleSelectHashtag = (hashtag: string) => {
    const { newContent, newPosition } = insertHashtag(content, hashtag, textareaRef);
    setContent(newContent);
    setCursorPosition(newPosition);
  };
  
  const togglePollMode = () => {
    if (isPollMode) {
      setPollOptions(['', '']);
    }
    setIsPollMode(!isPollMode);
  };
  
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event, media, setMedia, fileInputRef);
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
            const publicUrl = await uploadMediaToStorage(mediaItem.file, `group_media/${groupId}`);
            
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
          
          {showPreview && (
            <Card className="p-3 mb-3 bg-slate-50 dark:bg-slate-800">
              <div className="text-sm font-medium mb-1 text-rhythm-500">Podgląd:</div>
              <div className="break-words">
                <ContentRenderer content={content} linkableHashtags={false} />
              </div>
            </Card>
          )}
          
          <HashtagSuggestions 
            showSuggestions={showHashtagSuggestions}
            suggestionsRef={suggestionsRef}
            suggestions={hashtagSuggestions}
            isLoading={isLoadingHashtags}
            onSelectHashtag={handleSelectHashtag}
          />
          
          {isPollMode && (
            <PollOptions 
              options={pollOptions}
              onUpdateOptions={setPollOptions}
              disabled={loading}
            />
          )}
          
          <MediaPreview 
            media={media}
            onRemoveMedia={removeMedia}
            disabled={loading}
          />
          
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
                  onChange={handleMediaUpload}
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
