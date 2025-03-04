
import { useState } from 'react';
import { Post } from '@/types/social';
import { usePostCreation } from './usePostCreation';
import { usePostLikes } from './usePostLikes';
import { usePostSaves } from './usePostSaves';

export const usePostActions = (user: any | null, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
  const [loading, setLoading] = useState(false);
  
  // Zintegruj zrefaktoryzowane hooki
  const { createPost, loading: postCreationLoading } = usePostCreation(user, setPosts);
  const { likePost, unlikePost, loading: postLikesLoading } = usePostLikes(user, setPosts);
  const { savePost, unsavePost, loading: postSavesLoading } = usePostSaves(user, setPosts);
  
  // Połącz stan ładowania ze wszystkich hooków
  const combinedLoading = loading || postCreationLoading || postLikesLoading || postSavesLoading;

  return {
    createPost,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    loading: combinedLoading
  };
};
