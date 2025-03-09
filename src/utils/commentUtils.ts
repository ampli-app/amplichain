
import { formatTimeAgo as formatTime } from '@/lib/utils';

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timeAgo: string;
  replies: Comment[]; // Changed from optional to required
}

// Funkcja pomocnicza do formatowania czasu
export function formatTimeAgo(date: Date): string {
  return formatTime(date);
}

// Funkcja do formatowania komentarzy
export function formatComments(
  commentsData: any[], 
  repliesData: any[] | null,
  profilesData: any[] | null
): Comment[] {
  return commentsData.map(comment => {
    // Znajdź odpowiedzi dla tego komentarza
    const commentReplies = repliesData?.filter(reply => reply.parent_id === comment.id) || [];
    
    // Formatuj czas dla komentarza
    const commentDate = new Date(comment.created_at);
    const timeAgo = formatTimeAgo(commentDate);
    
    // Znajdź profil autora komentarza
    const authorProfile = profilesData?.find(profile => profile.id === comment.user_id);
    
    // Formatuj odpowiedzi
    const formattedReplies = commentReplies.map(reply => {
      const replyDate = new Date(reply.created_at);
      const replyTimeAgo = formatTimeAgo(replyDate);
      
      // Znajdź profil autora odpowiedzi
      const replyAuthorProfile = profilesData?.find(profile => profile.id === reply.user_id);
      
      return {
        id: reply.id,
        author: {
          id: reply.user_id,
          name: replyAuthorProfile?.full_name || 'Użytkownik',
          avatar: replyAuthorProfile?.avatar_url || ''
        },
        content: reply.content,
        timeAgo: replyTimeAgo,
        replies: [] // Since replies to replies aren't supported, use empty array
      };
    });
    
    // Zwróć sformatowany komentarz z odpowiedziami
    return {
      id: comment.id,
      author: {
        id: comment.user_id,
        name: authorProfile?.full_name || 'Użytkownik',
        avatar: authorProfile?.avatar_url || ''
      },
      content: comment.content,
      timeAgo,
      replies: formattedReplies
    };
  });
}
