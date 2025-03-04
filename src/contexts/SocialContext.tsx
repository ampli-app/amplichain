
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Post, Comment, Hashtag } from '@/types/social';

export type UserConnectionStatus = 'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received';

export interface SocialUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  bio?: string;
  connectionStatus?: UserConnectionStatus;
  isCurrentUser?: boolean;
  isFollower?: boolean;
  followersCount: number;
  followingCount: number;
  connectionsCount: number;
}

export interface Notification {
  id: string;
  type: 'follow' | 'connection_request' | 'connection_accepted' | 'like' | 'comment';
  from: {
    id: string;
    name: string;
    avatar: string;
  };
  read: boolean;
  time: string;
  postId?: string;
}

interface SocialContextType {
  currentUser: SocialUser | null;
  users: SocialUser[];
  posts: Post[];
  notifications: Notification[];
  unreadNotifications: number;
  fetchUserProfile: (userId: string) => Promise<SocialUser | null>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptConnectionRequest: (userId: string) => Promise<void>;
  declineConnectionRequest: (userId: string) => Promise<void>;
  removeConnection: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<SocialUser[]>;
  createPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, content: string, parentId?: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  getPostComments: (postId: string, parentId?: string) => Promise<Comment[]>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  getPostsByHashtag: (hashtag: string) => Promise<Post[]>;
  getPopularHashtags: () => Promise<Hashtag[]>;
  loading: boolean;
}

const SocialContext = createContext<SocialContextType | null>(null);

export const SocialProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  const unreadNotifications = notifications.filter(notif => !notif.read).length;
  
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCurrentUserProfile();
      loadPosts();
      setUpRealtimeSubscriptions();
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, [isLoggedIn, user]);
  
  // Funkcja ustawiająca subskrypcje realtime
  const setUpRealtimeSubscriptions = () => {
    // Subskrypcja na zmiany w postach
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
    
    // Subskrypcja na zmiany w polubieniach postów
    const likesChannel = supabase
      .channel('public:post_likes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
      
    // Subskrypcja na zmiany w zapisanych postach
    const savedChannel = supabase
      .channel('public:saved_posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'saved_posts' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
    
    // Subskrypcja na zmiany w komentarzach
    const commentsChannel = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(savedChannel);
      supabase.removeChannel(commentsChannel);
    };
  };
  
  const loadCurrentUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error('Error loading current user profile:', error);
        return;
      }

      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.full_name || '',
          username: data.username || '',
          avatar: data.avatar_url || '/placeholder.svg',
          role: data.role || '',
          bio: data.bio,
          isCurrentUser: true,
          followersCount: data.followers || 0,
          followingCount: data.following || 0,
          connectionsCount: data.connections || 0
        });
      }
    } catch (err) {
      console.error('Unexpected error loading current user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (full_name, username, avatar_url, role),
          post_hashtags!inner (
            hashtags:hashtag_id (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error loading posts:', postsError);
        return;
      }
      
      let postsWithMetadata = [];
      
      for (const post of postsData || []) {
        // Pobierz liczbę polubień posta
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę komentarzy posta
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę zapisań posta
        const { count: savesCount } = await supabase
          .from('saved_posts')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Sprawdź, czy zalogowany użytkownik polubił post
        let hasLiked = false;
        let hasSaved = false;
        
        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();
          
          hasLiked = !!likeData;
          
          const { data: saveData } = await supabase
            .from('saved_posts')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();
          
          hasSaved = !!saveData;
        }
        
        // Wyodrębnij hashtagi
        const hashtags = post.post_hashtags.map((ph: any) => ph.hashtags.name);
        
        // Oblicz czas względny
        const createdDate = new Date(post.created_at);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
        
        let timeAgo;
        if (diffInSeconds < 60) {
          timeAgo = `${diffInSeconds} sek. temu`;
        } else if (diffInSeconds < 3600) {
          timeAgo = `${Math.floor(diffInSeconds / 60)} min. temu`;
        } else if (diffInSeconds < 86400) {
          timeAgo = `${Math.floor(diffInSeconds / 3600)} godz. temu`;
        } else {
          timeAgo = `${Math.floor(diffInSeconds / 86400)} dni temu`;
        }
        
        postsWithMetadata.push({
          id: post.id,
          userId: post.user_id,
          author: {
            name: post.profiles.full_name || '',
            avatar: post.profiles.avatar_url || '/placeholder.svg',
            role: post.profiles.role || '',
          },
          timeAgo,
          content: post.content,
          mediaUrl: post.media_url,
          likes: likesCount || 0,
          comments: commentsCount || 0,
          saves: savesCount || 0,
          hasLiked,
          hasSaved,
          hashtags
        });
      }
      
      setPosts(postsWithMetadata);
    } catch (err) {
      console.error('Unexpected error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do tworzenia nowego posta
  const createPost = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby utworzyć post",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          media_url: mediaUrl
        })
        .select();
      
      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć posta",
          variant: "destructive",
        });
        return;
      }
      
      // Odśwież posty
      loadPosts();
      
      toast({
        title: "Sukces",
        description: "Post został utworzony",
      });
    } catch (err) {
      console.error('Unexpected error creating post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas tworzenia posta",
        variant: "destructive",
      });
    }
  };

  // Funkcja do polubienia posta
  const likePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby polubić post",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          toast({
            title: "Informacja",
            description: "Już polubiłeś ten post",
          });
        } else {
          console.error('Error liking post:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się polubić posta",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasLiked: true, likes: post.likes + 1 } 
            : post
        )
      );
    } catch (err) {
      console.error('Unexpected error liking post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas polubienia posta",
        variant: "destructive",
      });
    }
  };

  // Funkcja do usunięcia polubienia posta
  const unlikePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć polubienie",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unliking post:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć polubienia",
          variant: "destructive",
        });
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasLiked: false, likes: Math.max(0, post.likes - 1) } 
            : post
        )
      );
    } catch (err) {
      console.error('Unexpected error unliking post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania polubienia",
        variant: "destructive",
      });
    }
  };

  // Funkcja do zapisania posta
  const savePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby zapisać post",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          post_id: postId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          toast({
            title: "Informacja",
            description: "Już zapisałeś ten post",
          });
        } else {
          console.error('Error saving post:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się zapisać posta",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasSaved: true, saves: post.saves + 1 } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: "Post został zapisany",
      });
    } catch (err) {
      console.error('Unexpected error saving post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas zapisywania posta",
        variant: "destructive",
      });
    }
  };

  // Funkcja do usunięcia zapisanego posta
  const unsavePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć zapis",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unsaving post:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć zapisu",
          variant: "destructive",
        });
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasSaved: false, saves: Math.max(0, post.saves - 1) } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: "Zapis posta został usunięty",
      });
    } catch (err) {
      console.error('Unexpected error unsaving post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania zapisu",
        variant: "destructive",
      });
    }
  };

  // Funkcja do dodawania komentarza do posta
  const commentOnPost = async (postId: string, content: string, parentId?: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby dodać komentarz",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId
        });
      
      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się dodać komentarza",
          variant: "destructive",
        });
        return;
      }
      
      // Aktualizuj stan lokalny - zwiększ licznik komentarzy posta
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: parentId ? "Odpowiedź została dodana" : "Komentarz został dodany",
      });
    } catch (err) {
      console.error('Unexpected error adding comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas dodawania komentarza",
        variant: "destructive",
      });
    }
  };

  // Funkcja do pobierania komentarzy do posta
  const getPostComments = async (postId: string, parentId?: string): Promise<Comment[]> => {
    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (full_name, username, avatar_url, role)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      const commentsWithMetadata: Comment[] = await Promise.all(
        (data || []).map(async (comment) => {
          // Pobierz liczbę polubień komentarza
          const { count: likesCount } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);
          
          // Pobierz liczbę odpowiedzi na komentarz
          const { count: repliesCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', comment.id);
          
          // Sprawdź, czy zalogowany użytkownik polubił komentarz
          let hasLiked = false;
          
          if (user) {
            const { data: likeData } = await supabase
              .from('comment_likes')
              .select('*')
              .eq('comment_id', comment.id)
              .eq('user_id', user.id)
              .single();
            
            hasLiked = !!likeData;
          }
          
          // Oblicz czas względny
          const createdDate = new Date(comment.created_at);
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
          
          let timeAgo;
          if (diffInSeconds < 60) {
            timeAgo = `${diffInSeconds} sek. temu`;
          } else if (diffInSeconds < 3600) {
            timeAgo = `${Math.floor(diffInSeconds / 60)} min. temu`;
          } else if (diffInSeconds < 86400) {
            timeAgo = `${Math.floor(diffInSeconds / 3600)} godz. temu`;
          } else {
            timeAgo = `${Math.floor(diffInSeconds / 86400)} dni temu`;
          }
          
          return {
            id: comment.id,
            postId: comment.post_id,
            parentId: comment.parent_id,
            userId: comment.user_id,
            author: {
              name: comment.profiles.full_name || '',
              avatar: comment.profiles.avatar_url || '/placeholder.svg',
              role: comment.profiles.role || '',
            },
            content: comment.content,
            createdAt: comment.created_at,
            timeAgo,
            likes: likesCount || 0,
            replies: repliesCount || 0,
            hasLiked
          };
        })
      );
      
      return commentsWithMetadata;
    } catch (err) {
      console.error('Unexpected error fetching comments:', err);
      return [];
    }
  };

  // Funkcja do polubienia komentarza
  const likeComment = async (commentId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby polubić komentarz",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          toast({
            title: "Informacja",
            description: "Już polubiłeś ten komentarz",
          });
        } else {
          console.error('Error liking comment:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się polubić komentarza",
            variant: "destructive",
          });
        }
        return;
      }
    } catch (err) {
      console.error('Unexpected error liking comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas polubienia komentarza",
        variant: "destructive",
      });
    }
  };

  // Funkcja do usunięcia polubienia komentarza
  const unlikeComment = async (commentId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć polubienie",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unliking comment:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć polubienia",
          variant: "destructive",
        });
        return;
      }
    } catch (err) {
      console.error('Unexpected error unliking comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania polubienia",
        variant: "destructive",
      });
    }
  };

  // Funkcja do pobierania postów z określonym hashtagiem
  const getPostsByHashtag = async (hashtag: string): Promise<Post[]> => {
    try {
      setLoading(true);
      
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', hashtag.toLowerCase())
        .single();
      
      if (hashtagError || !hashtagData) {
        console.error('Error fetching hashtag:', hashtagError);
        return [];
      }
      
      const { data: postHashtagsData, error: postHashtagsError } = await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtagData.id);
      
      if (postHashtagsError) {
        console.error('Error fetching post hashtags:', postHashtagsError);
        return [];
      }
      
      const postIds = postHashtagsData.map(ph => ph.post_id);
      
      if (postIds.length === 0) {
        return [];
      }
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (full_name, username, avatar_url, role),
          post_hashtags (
            hashtags:hashtag_id (name)
          )
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching posts by hashtag:', postsError);
        return [];
      }
      
      // Przetwarzanie postów tak jak w funkcji loadPosts
      let postsWithMetadata = [];
      
      for (const post of postsData || []) {
        // Pobierz liczbę polubień posta
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę komentarzy posta
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę zapisań posta
        const { count: savesCount } = await supabase
          .from('saved_posts')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Sprawdź, czy zalogowany użytkownik polubił post
        let hasLiked = false;
        let hasSaved = false;
        
        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();
          
          hasLiked = !!likeData;
          
          const { data: saveData } = await supabase
            .from('saved_posts')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();
          
          hasSaved = !!saveData;
        }
        
        // Wyodrębnij hashtagi
        const hashtags = post.post_hashtags.map((ph: any) => ph.hashtags.name);
        
        // Oblicz czas względny
        const createdDate = new Date(post.created_at);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
        
        let timeAgo;
        if (diffInSeconds < 60) {
          timeAgo = `${diffInSeconds} sek. temu`;
        } else if (diffInSeconds < 3600) {
          timeAgo = `${Math.floor(diffInSeconds / 60)} min. temu`;
        } else if (diffInSeconds < 86400) {
          timeAgo = `${Math.floor(diffInSeconds / 3600)} godz. temu`;
        } else {
          timeAgo = `${Math.floor(diffInSeconds / 86400)} dni temu`;
        }
        
        postsWithMetadata.push({
          id: post.id,
          userId: post.user_id,
          author: {
            name: post.profiles.full_name || '',
            avatar: post.profiles.avatar_url || '/placeholder.svg',
            role: post.profiles.role || '',
          },
          timeAgo,
          content: post.content,
          mediaUrl: post.media_url,
          likes: likesCount || 0,
          comments: commentsCount || 0,
          saves: savesCount || 0,
          hasLiked,
          hasSaved,
          hashtags
        });
      }
      
      return postsWithMetadata;
    } catch (err) {
      console.error('Unexpected error fetching posts by hashtag:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do pobierania popularnych hashtagów
  const getPopularHashtags = async (): Promise<Hashtag[]> => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select(`
          id,
          name,
          post_hashtags (id)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching hashtags:', error);
        return [];
      }
      
      return data.map((hashtag) => ({
        id: hashtag.id,
        name: hashtag.name,
        postsCount: hashtag.post_hashtags.length
      })).sort((a, b) => b.postsCount - a.postsCount);
    } catch (err) {
      console.error('Unexpected error fetching hashtags:', err);
      return [];
    }
  };

  // Zachowanie istniejących funkcji
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      const { data: followingsData, error: followingsError } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id);

      if (followingsError) {
        console.error('Error loading followings:', followingsError);
      }

      const { data: followersData, error: followersError } = await supabase
        .from('followings')
        .select('*')
        .eq('following_id', user.id);

      if (followersError) {
        console.error('Error loading followers:', followersError);
      }

      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (connectionsError) {
        console.error('Error loading connections:', connectionsError);
      }

      const { data: sentRequestsData, error: sentRequestsError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (sentRequestsError) {
        console.error('Error loading sent connection requests:', sentRequestsError);
      }

      const { data: receivedRequestsData, error: receivedRequestsError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (receivedRequestsError) {
        console.error('Error loading received connection requests:', receivedRequestsError);
      }

      const followingIds = new Set((followingsData || []).map(f => f.following_id));
      const followerIds = new Set((followersData || []).map(f => f.follower_id));
      
      const connectionIds = new Set(
        (connectionsData || []).flatMap(c => {
          if (c.user_id1 === user.id) return [c.user_id2];
          if (c.user_id2 === user.id) return [c.user_id1];
          return [];
        })
      );
      
      const sentRequestIds = new Set((sentRequestsData || []).map(r => r.receiver_id));
      const receivedRequestIds = new Set((receivedRequestsData || []).map(r => r.sender_id));

      const usersList = (profilesData || []).map(profile => {
        let connectionStatus: UserConnectionStatus = 'none';
        
        if (connectionIds.has(profile.id)) {
          connectionStatus = 'connected';
        } else if (sentRequestIds.has(profile.id)) {
          connectionStatus = 'pending_sent';
        } else if (receivedRequestIds.has(profile.id)) {
          connectionStatus = 'pending_received';
        } else if (followingIds.has(profile.id)) {
          connectionStatus = 'following';
        }

        return {
          id: profile.id,
          name: profile.full_name || '',
          username: profile.username || '',
          avatar: profile.avatar_url || '/placeholder.svg',
          role: profile.role || '',
          bio: profile.bio,
          connectionStatus,
          isFollower: followerIds.has(profile.id),
          followersCount: profile.followers || 0,
          followingCount: profile.following || 0,
          connectionsCount: profile.connections || 0
        };
      });

      setUsers(usersList);
    } catch (err) {
      console.error('Unexpected error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const cachedUser = users.find(u => u.id === userId);
      if (cachedUser) return cachedUser;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) return null;

      let connectionStatus: UserConnectionStatus = 'none';
      let isFollower = false;
      
      if (user) {
        const { data: connectionData } = await supabase
          .from('connections')
          .select('*')
          .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
          .single();

        if (connectionData) {
          connectionStatus = 'connected';
        } else {
          const { data: sentRequest } = await supabase
            .from('connection_requests')
            .select('*')
            .eq('sender_id', user.id)
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .single();

          if (sentRequest) {
            connectionStatus = 'pending_sent';
          } else {
            const { data: receivedRequest } = await supabase
              .from('connection_requests')
              .select('*')
              .eq('sender_id', userId)
              .eq('receiver_id', user.id)
              .eq('status', 'pending')
              .single();

            if (receivedRequest) {
              connectionStatus = 'pending_received';
            } else {
              const { data: followingData } = await supabase
                .from('followings')
                .select('*')
                .eq('follower_id', user.id)
                .eq('following_id', userId)
                .single();

              if (followingData) {
                connectionStatus = 'following';
              }
            }
          }
        }
        
        const { data: followerData } = await supabase
          .from('followings')
          .select('*')
          .eq('follower_id', userId)
          .eq('following_id', user.id)
          .single();
          
        if (followerData) {
          isFollower = true;
        }
      }

      const userProfile: SocialUser = {
        id: data.id,
        name: data.full_name || '',
        username: data.username || '',
        avatar: data.avatar_url || '/placeholder.svg',
        role: data.role || '',
        bio: data.bio,
        connectionStatus,
        isFollower,
        followersCount: data.followers || 0,
        followingCount: data.following || 0,
        connectionsCount: data.connections || 0
      };

      return userProfile;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  const searchUsers = async (query: string): Promise<SocialUser[]> => {
    try {
      if (!query.trim()) return [];

      const searchTerm = query.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .neq('id', user?.id || '');

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      if (!data || data.length === 0) return [];

      const userProfiles = await Promise.all(
        data.map(async (profile) => {
          const userProfile = await fetchUserProfile(profile.id);
          return userProfile;
        })
      );

      return userProfiles.filter(Boolean) as SocialUser[];
    } catch (err) {
      console.error('Error in searchUsers:', err);
      return [];
    }
  };

  const followUser = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby obserwować użytkowników.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('followings')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        console.error('Error following user:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się obserwować użytkownika.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'following', followersCount: u.followersCount + 1 } 
            : u
        )
      );

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          followingCount: currentUser.followingCount + 1
        });
      }

      toast({
        title: "Sukces",
        description: "Pomyślnie obserwujesz użytkownika.",
      });

      loadUsers();
    } catch (err) {
      console.error('Unexpected error following user:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby przestać obserwować użytkowników.",
          variant: "destructive",
        });
        return;
      }

      const { data: connectionData } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
        .single();

      if (connectionData) {
        toast({
          title: "Nie można przestać obserwować",
          description: "Nie możesz przestać obserwować użytkownika, z którym masz połączenie. Najpierw usuń połączenie.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('followings')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się przestać obserwować użytkownika.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'none', followersCount: Math.max(0, u.followersCount - 1) } 
            : u
        )
      );

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          followingCount: Math.max(0, currentUser.followingCount - 1)
        });
      }

      toast({
        title: "Sukces",
        description: "Pomyślnie przestałeś obserwować użytkownika.",
      });

      loadUsers();
    } catch (err) {
      console.error('Unexpected error unfollowing user:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby wysłać zaproszenie do połączenia.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingConnection } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
        .maybeSingle();

      if (existingConnection) {
        toast({
          title: "Informacja",
          description: "Jesteś już połączony z tym użytkownikiem.",
        });
        return;
      }

      const { data: incomingRequest, error: checkIncomingError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkIncomingError) {
        console.error('Error checking incoming request:', checkIncomingError);
      }

      if (incomingRequest) {
        toast({
          title: "Informacja",
          description: "Ten użytkownik już wysłał Ci zaproszenie. Możesz je zaakceptować w zakładce 'Oczekujące'.",
        });
        return;
      }

      const { data: pendingRequest, error: checkPendingError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkPendingError) {
        console.error('Error checking pending request:', checkPendingError);
      }

      if (pendingRequest) {
        toast({
          title: "Informacja",
          description: "Zaproszenie do tego użytkownika jest już aktywne.",
        });
        return;
      }

      const { data: existingRequest, error: checkExistingError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .or('status.eq.accepted,status.eq.rejected')
        .maybeSingle();

      if (checkExistingError) {
        console.error('Error checking existing request:', checkExistingError);
      }

      const { data: followingData, error: checkFollowingError } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (checkFollowingError) {
        console.error('Error checking if following:', checkFollowingError);
      }

      if (!followingData) {
        const { error: followError } = await supabase
          .from('followings')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (followError) {
          console.error('Error auto-following before connection request:', followError);
        }
      }

      const { error: insertError } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error creating new connection request:', insertError);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć nowego zaproszenia do połączenia.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'pending_sent' } 
            : u
        )
      );

      toast({
        title: "Sukces",
        description: "Zaproszenie do połączenia zostało wysłane.",
      });

      loadUsers();
    } catch (err) {
      console.error('Unexpected error sending connection request:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  const acceptConnectionRequest = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby zaakceptować zaproszenie.",
          variant: "destructive",
        });
        return;
      }

      const { data: requestData, error: findError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();

      if (findError || !requestData) {
        console.error('Error finding connection request:', findError);
        toast({
          title: "Błąd",
          description: "Nie znaleziono zaproszenia do połączenia.",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted' })
        .eq('id', requestData.id);

      if (updateError) {
        console.error('Error updating connection request:', updateError);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować zaproszenia.",
          variant: "destructive",
        });
        return;
      }

      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          user_id1: user.id < userId ? user.id : userId,
          user_id2: user.id < userId ? userId : user.id
        });

      if (connectionError) {
        console.error('Error creating connection:', connectionError);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć połączenia.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'connected', connectionsCount: u.connectionsCount + 1 } 
            : u
        )
      );

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          connectionsCount: currentUser.connectionsCount + 1
        });
      }

      toast({
        title: "Sukces",
        description: "Zaproszenie zostało zaakceptowane, połączenie utworzone.",
      });

      loadUsers();
    } catch (err) {
      console.error('Unexpected error accepting connection request:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  const declineConnectionRequest = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby odrzucić zaproszenie.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'rejected' })
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error declining connection request:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się odrzucić zaproszenia.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'none' } 
            : u
        )
      );

      toast({
        title: "Sukces",
        description: "Zaproszenie zostało odrzucone.",
      });

      loadUsers();
    } catch (err) {
      console.error('Unexpected error declining connection request:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  const removeConnection = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć połączenie.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('connections')
        .delete()
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`);

      if (error) {
        console.error('Error removing connection:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć połączenia.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'following', connectionsCount: Math.max(0, u.connectionsCount - 1) } 
            : u
        )
      );

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          connectionsCount: Math.max(0, currentUser.connectionsCount - 1)
        });
      }

      toast({
        title: "Sukces",
        description: "Połączenie zostało usunięte. Nadal obserwujesz tego użytkownika i on nadal Cię obserwuje.",
      });

      loadUsers();
    } catch (err) {
      console.error('Unexpected error removing connection:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  const createPost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', mediaFiles?: Array<{url: string, type: 'image' | 'video'}>) => {
    try {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        userId: currentUser?.id || 'unknown',
        author: {
          name: currentUser?.name || 'Unknown User',
          avatar: currentUser?.avatar || '/placeholder.svg',
          role: currentUser?.role || 'User',
        },
        timeAgo: 'teraz',
        content,
        mediaUrl,
        mediaType,
        mediaFiles,
        likes: 0,
        comments: 0,
        hasLiked: false,
      };
      
      setPosts(prev => [newPost, ...prev]);
      
      toast({
        title: "Sukces",
        description: "Post został opublikowany",
      });
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się opublikować posta",
        variant: "destructive",
      });
    }
  };

  const likePost = (postId: string) => {
    console.log('Like post functionality not implemented');
  };

  const unlikePost = (postId: string) => {
    console.log('Unlike post functionality not implemented');
  };

  const commentOnPost = (postId: string, comment: string) => {
    console.log('Comment post functionality not implemented');
  };

  const markNotificationAsRead = (notificationId: string) => {
    console.log('Mark notification as read functionality not implemented');
  };

  const markAllNotificationsAsRead = () => {
    console.log('Mark all notifications as read functionality not implemented');
  };

  return (
    <SocialContext.Provider value={{
      currentUser,
      users,
      posts,
      notifications,
      unreadNotifications,
      fetchUserProfile,
      followUser,
      unfollowUser,
      sendConnectionRequest,
      acceptConnectionRequest,
      declineConnectionRequest,
      removeConnection,
      searchUsers,
      createPost,
      likePost,
      unlikePost,
      savePost,
      unsavePost,
      commentOnPost,
      likeComment,
      unlikeComment,
      getPostComments,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      getPostsByHashtag,
      getPopularHashtags,
      loading
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
