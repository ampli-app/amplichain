
import { supabase } from '@/integrations/supabase/client';
import { formatComments, Comment } from '@/utils/commentUtils';
import { convertEmoticons } from '@/utils/emoticonUtils';

export async function fetchPostComments(postId: string): Promise<Comment[]> {
  if (!postId) return [];
  
  try {
    // Pobierz komentarze dla danego posta
    const { data: commentsData, error: commentsError } = await supabase
      .from('feed_post_comments')
      .select(`
        id, 
        content, 
        created_at, 
        user_id
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Błąd pobierania komentarzy:', commentsError);
      return [];
    }
    
    // Pobierz odpowiedzi dla tych komentarzy
    const parentIds = commentsData.map(comment => comment.id);
    
    if (parentIds.length === 0) {
      return [];
    }
    
    const { data: repliesData, error: repliesError } = await supabase
      .from('feed_post_comments')
      .select(`
        id, 
        content, 
        created_at, 
        user_id,
        parent_id
      `)
      .in('parent_id', parentIds)
      .order('created_at', { ascending: true });
    
    if (repliesError) {
      console.error('Błąd pobierania odpowiedzi:', repliesError);
    }
    
    // Pobierz dane profilowe dla wszystkich użytkowników
    const userIds = [
      ...new Set([
        ...(commentsData?.map(comment => comment.user_id) || []),
        ...(repliesData?.map(reply => reply.user_id) || [])
      ])
    ];
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Błąd pobierania profili użytkowników:', profilesError);
    }
    
    // Formatuj dane komentarzy
    return formatComments(commentsData, repliesData, profilesData);
  } catch (error) {
    console.error('Nieoczekiwany błąd:', error);
    return [];
  }
}

export async function addComment(postId: string, userId: string, content: string): Promise<boolean> {
  if (!userId || !content.trim()) return false;
  
  try {
    // Konwertuj emotikony na emoji
    const convertedContent = convertEmoticons(content.trim());
    
    const { error } = await supabase
      .from('feed_post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: convertedContent
      });
    
    if (error) {
      console.error('Błąd dodawania komentarza:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Nieoczekiwany błąd:', error);
    return false;
  }
}

export async function addReply(postId: string, userId: string, commentId: string, content: string): Promise<boolean> {
  if (!userId || !commentId || !content.trim()) return false;
  
  try {
    // Konwertuj emotikony na emoji
    const convertedContent = convertEmoticons(content.trim());
    
    const { error } = await supabase
      .from('feed_post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: convertedContent,
        parent_id: commentId
      });
    
    if (error) {
      console.error('Błąd dodawania odpowiedzi:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Nieoczekiwany błąd:', error);
    return false;
  }
}
