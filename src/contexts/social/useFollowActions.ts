
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

      // Natychmiastowa aktualizacja stanu użytkowników
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.id === userId) {
            // Zachowaj istniejący status połączenia, ale zaznacz że jest obserwowany
            return { 
              ...u, 
              isFollower: true,
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

      // Usunięto blokadę na usunięcie obserwacji, gdy istnieje połączenie

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
            // Zachowaj status połączenia, ale zmień flagę obserwacji
            return { 
              ...u, 
              isFollower: false,
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
