
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { type MediaFile } from '@/components/social/MediaPreview';
import { usePostSubmit } from '@/hooks/usePostSubmit';

interface UsePostCreationProps {
  onPostCreated?: () => void;
}

export function usePostCreation({ onPostCreated }: UsePostCreationProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [media, setMedia] = useState<MediaFile[]>([]);
  
  const { submitPost, loading } = usePostSubmit({ 
    userId: user?.id,
    onSuccess: () => {
      resetForm();
      if (onPostCreated) {
        onPostCreated();
      }
    }
  });
  
  const togglePollMode = () => {
    if (isPollMode) {
      setPollOptions(['', '']);
    }
    setIsPollMode(!isPollMode);
  };
  
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  const resetForm = () => {
    setContent('');
    setIsPollMode(false);
    setPollOptions(['', '']);
    setMedia([]);
  };
  
  const handleSubmit = async () => {
    await submitPost(content, isPollMode, pollOptions, media);
  };
  
  return {
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
  };
}
