
import { useState, useRef } from 'react';
import { Group } from '@/types/group';
import { useSocial } from '@/contexts/SocialContext';
import { PollOptions } from '@/components/social/PollOptions';
import { MediaPreview } from '@/components/social/MediaPreview';
import { handleFileUpload } from '@/utils/mediaUtils';
import { GroupPostInput } from './posts/GroupPostInput';
import { GroupPostActions } from './posts/GroupPostActions';
import { useGroupPostCreation } from '@/hooks/useGroupPostCreation';

interface GroupPostCreateProps {
  group: Group;
}

export function GroupPostCreate({ group }: GroupPostCreateProps) {
  const { currentUser } = useSocial();
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  } = useGroupPostCreation();
  
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event, media, setMedia, fileInputRef);
  };
  
  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
  };
  
  const isSubmitDisabled = () => {
    if (loading) return true;
    
    if (isPollMode) {
      const validPollOptions = pollOptions.filter(o => o.trim()).length >= 2;
      return !validPollOptions && !content.trim() && media.length === 0;
    }
    
    return !content.trim() && media.length === 0;
  };

  return (
    <div className="glass-card rounded-xl p-5 border shadow-sm">
      <GroupPostInput 
        avatarUrl={currentUser?.avatar}
        userName={currentUser?.name}
        placeholder={`Napisz coś do grupy "${group.name}"...`}
        content={content}
        setContent={setContent}
        disabled={loading}
        onFocus={() => setIsExpanded(true)}
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
        <GroupPostActions 
          onSubmit={handleSubmit}
          onAddMedia={handleAddMediaClick}
          onTogglePoll={togglePollMode}
          isPollMode={isPollMode}
          mediaCount={media.length}
          loading={loading}
          disabled={isSubmitDisabled()}
        />
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaUpload}
        className="hidden"
        accept="image/*, video/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
        multiple
        disabled={loading}
      />
    </div>
  );
}
