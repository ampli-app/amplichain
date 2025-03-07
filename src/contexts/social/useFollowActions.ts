
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from './types';

export const useFollowActions = (
  user: any | null, 
  setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>,
  currentUser: SocialUser | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<SocialUser | null>>
) => {
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

      // Natychmiastowa aktualizacja stanu użytkowników - kluczowa poprawka
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.id === userId) {
            // Zachowaj bieżący connectionStatus, ale dodaj flag following jeśli status to 'none'
            const newConnectionStatus = u.connectionStatus === 'none' ? 'following' : u.connectionStatus;
            return { 
              ...u, 
              connectionStatus: newConnectionStatus, 
              followersCount: u.followersCount + 1 
            };
          }
          return u;
        })
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
        prevUsers.map(u => {
          if (u.id === userId) {
            // Ustaw connectionStatus na 'none' tylko jeśli był 'following', zachowaj inne statusy
            const newConnectionStatus = u.connectionStatus === 'following' ? 'none' : u.connectionStatus;
            return { 
              ...u, 
              connectionStatus: newConnectionStatus, 
              followersCount: Math.max(0, u.followersCount - 1) 
            };
          }
          return u;
        })
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
    } catch (err) {
      console.error('Unexpected error unfollowing user:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  return {
    followUser,
    unfollowUser
  };
};
