
import { useState } from 'react';
import { Comment } from '@/types/social';

export const useCommentsLoading = (user: any | null) => {
  const [loading, setLoading] = useState(false);

  // Funkcja pobierająca komentarze posta - zwraca pustą tablicę
  const getPostComments = async (postId: string, parentId?: string): Promise<Comment[]> => {
    // Po usunięciu funkcjonalności komentarzy, zwracamy pustą tablicę
    return [];
  };

  return {
    getPostComments,
    loading
  };
};
