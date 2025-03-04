
import { useState } from 'react';
import { Post, Comment } from '@/types/social';
import { useCommentLikes } from './useCommentLikes';
import { useCommentCreation } from './useCommentCreation';
import { useCommentsLoading } from './useCommentsLoading';

export const useCommentActions = (user: any | null, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
  const [loading, setLoading] = useState(false);
  
  // Użyj zrefaktoryzowanych hooków
  const { likeComment, unlikeComment, loading: likeLoading } = useCommentLikes(user);
  const { commentOnPost, loading: commentCreationLoading } = useCommentCreation(user, setPosts);
  const { getPostComments } = useCommentsLoading(user);
  
  // Połącz stan ładowania
  const combinedLoading = loading || likeLoading || commentCreationLoading;

  return {
    commentOnPost,
    getPostComments,
    likeComment,
    unlikeComment,
    loading: combinedLoading
  };
};
