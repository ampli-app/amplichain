
import { useState, useRef } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Image, 
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
import { useHashtagSuggestions } from '@/hooks/useHashtagSuggestions';
import { HashtagSuggestions } from '@/components/common/HashtagSuggestions';
import { PollOptions } from '@/components/social/PollOptions';
import { MediaPreview, type MediaFile } from '@/components/social/MediaPreview';
import { handleFileUpload, uploadMediaToStorage, extractHashtags } from '@/utils/mediaUtils';

interface FeedPostCreateProps {
  onPostCreated?: () => void;
}

export function FeedPostCreate({ onPostCreated }: FeedPostCreateProps) {
  const { currentUser } = useSocial();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const { 
    hashtagSuggestions, 
    showHashtagSuggestions, 
    isLoadingHashtags,
    suggestionsRef,
    insertHashtag,
    setShowHashtagSuggestions 
  } = useHashtagSuggestions({ 
    content, 
    cursorPosition
  });
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCursorPosition(e.target.selectionStart);
  };
  
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
    
    if (isPollMode) {
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
      // 1. Utwórz post w tabeli feed_posts
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
      
      // 3. Ręczne przetwarzanie hashtagów zamiast polegania na triggerze
      const hashtags = extractHashtags(content);
      if (hashtags.length > 0) {
        for (const tag of hashtags) {
          // 3.1 Sprawdź czy hashtag już istnieje
          const { data: existingTag, error: lookupError } = await supabase
            .from('hashtags')
            .select('id')
            .eq('name', tag.toLowerCase())
            .maybeSingle();
            
          if (lookupError) {
            console.error(`Błąd podczas sprawdzania hashtaga ${tag}:`, lookupError);
            continue;
          }
          
          let hashtagId;
          
          if (existingTag) {
            // 3.2 Jeśli hashtag istnieje, użyj jego ID
            hashtagId = existingTag.id;
          } else {
            // 3.3 Jeśli hashtag nie istnieje, utwórz nowy
            const { data: newTag, error: insertError } = await supabase
              .from('hashtags')
              .insert([{ name: tag.toLowerCase() }])
              .select('id')
              .single();
            
            if (insertError) {
              console.error(`Błąd podczas tworzenia hashtaga ${tag}:`, insertError);
              continue;
            }
            
            hashtagId = newTag.id;
          }
          
          // 3.4 Powiąż hashtag z postem
          const { error: linkError } = await supabase
            .from('feed_post_hashtags')
            .insert([{ post_id: postId, hashtag_id: hashtagId }]);
          
          if (linkError) {
            console.error(`Błąd podczas łączenia posta z hashtagiem ${tag}:`, linkError);
          }
        }
      }
      
      // 4. Przetwarzanie mediów
      if (media.length > 0) {
        const mediaPromises = media.map(async (mediaItem) => {
          if (mediaItem.file) {
            const publicUrl = await uploadMediaToStorage(mediaItem.file, 'feed_media');
            
            if (publicUrl) {
              if (mediaItem.type === 'document') {
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
      
      toast({
        title: "Post utworzony",
        description: "Twój post został pomyślnie opublikowany",
      });
      
      setContent('');
      setIsPollMode(false);
      setPollOptions(['', '']);
      setMedia([]);
      setIsExpanded(false);
      
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
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Co słychać?"
            className="resize-none mb-3 min-h-24"
            onFocus={() => setIsExpanded(true)}
            disabled={loading}
          />
          
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
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaUpload}
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
