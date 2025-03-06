
import { useRef, useState } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { User } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHashtagSuggestions } from '@/hooks/useHashtagSuggestions';
import { HashtagSuggestions } from '@/components/common/HashtagSuggestions';
import { PollOptions } from '@/components/social/PollOptions';
import { MediaPreview, type MediaFile } from '@/components/social/MediaPreview';
import { handleFileUpload } from '@/utils/mediaUtils';
import { PostActionButtons } from '@/components/social/PostActionButtons';
import { PostSubmitButton } from '@/components/social/PostSubmitButton';
import { usePostCreation } from '@/hooks/usePostCreation';

interface FeedPostCreateProps {
  onPostCreated?: () => void;
}

export function FeedPostCreate({ onPostCreated }: FeedPostCreateProps) {
  const { currentUser } = useSocial();
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const {
    content,
    setContent,
    isPollMode,
    pollOptions,
    setPollOptions,
    media,
    setMedia,
    loading,
    togglePollMode,
    removeMedia,
    handleSubmit
  } = usePostCreation({ onPostCreated });
  
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
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };
  
  const handleSelectHashtag = (hashtag: string) => {
    const { newContent, newPosition } = insertHashtag(content, hashtag, textareaRef);
    setContent(newContent);
    setCursorPosition(newPosition);
  };
  
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event, media, setMedia, fileInputRef);
  };
  
  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              className="hidden"
              accept="image/*, video/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
              multiple
              disabled={loading}
            />
            
            <PostActionButtons 
              onAddMedia={handleAddMediaClick}
              onTogglePoll={togglePollMode}
              isPollMode={isPollMode}
              disabled={loading}
              mediaLimitReached={media.length >= 6}
            />
            
            <PostSubmitButton 
              loading={loading}
              disabled={!content.trim() && media.length === 0 && !isPollMode}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
