import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from '../types';

export const removeConnection = async (
  user: any | null,
  userId: string,
  setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>,
  currentUser: SocialUser | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<SocialUser | null>>,
  loadUsers: () => Promise<void>,
  keepFollowing: boolean = false
) => {
  try {
    if (!user) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany, aby usunąć połączenie.",
        variant: "destructive",
      });
      return;
    }

    const { data: connectionData } = await supabase
      .from('connections')
      .select('*')
      .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
      .maybeSingle();

    if (connectionData) {
      // Usuń połączenie
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

      // Usuń również obserwację - tylko jeśli keepFollowing jest false
      if (!keepFollowing) {
        const { error: unfollowError } = await supabase
          .from('followings')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (unfollowError) {
          console.error('Error unfollowing after connection removal:', unfollowError);
          // Kontynuujemy mimo błędu unfollow - połączenie zostało już usunięte
        } else {
          console.log(`User ${user.id} stopped following user ${userId}`);
        }

        // Zaktualizuj stan UI po usunięciu połączenia
        setUsers(prevUsers => 
          prevUsers.map(u => {
            if (u.id === userId) {
              // Usuń status połączenia, ale zaktualizuj licznik obserwujących,
              // ponieważ usuwający przestał obserwować
              return { 
                ...u, 
                connectionStatus: 'none', 
                connectionsCount: Math.max(0, u.connectionsCount - 1),
                followersCount: Math.max(0, u.followersCount - 1)
              };
            }
            return u;
          })
        );

        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            connectionsCount: Math.max(0, currentUser.connectionsCount - 1),
            followingCount: Math.max(0, currentUser.followingCount - 1)
          });
        }

        toast({
          title: "Sukces",
          description: "Połączenie zostało usunięte. Przestałeś obserwować tego użytkownika, ale on nadal może Cię obserwować.",
        });
      } else {
        // Jeśli zachowujemy obserwowanie
        setUsers(prevUsers => 
          prevUsers.map(u => {
            if (u.id === userId) {
              return { 
                ...u, 
                connectionStatus: 'none', 
                connectionsCount: Math.max(0, u.connectionsCount - 1)
              };
            }
            return u;
          })
        );

        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            connectionsCount: Math.max(0, currentUser.connectionsCount - 1)
          });
        }

        toast({
          title: "Sukces",
          description: "Połączenie zostało usunięte. Nadal obserwujesz tego użytkownika.",
        });
      }
    } else {
      const { data: pendingRequest } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingRequest) {
        // Usuń zaproszenie wysłane przez użytkownika
        const { error } = await supabase
          .from('connection_requests')
          .delete()
          .eq('id', pendingRequest.id);

        if (error) {
          console.error('Error canceling connection request:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się anulować zaproszenia.",
            variant: "destructive",
          });
          return;
        }

        // Dla anulowania zaproszenia zachowujemy obserwowanie, chyba że jawnie zażądano jego usunięcia
        if (!keepFollowing) {
          // Usuń również obserwację, gdy anulujemy zaproszenie
          const { error: unfollowError } = await supabase
            .from('followings')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', userId);

          if (unfollowError) {
            console.error('Error unfollowing after request cancellation:', unfollowError);
            // Kontynuujemy mimo błędu unfollow
          } else {
            console.log(`User ${user.id} stopped following user ${userId} after cancelling request`);
          }

          setUsers(prevUsers => 
            prevUsers.map(u => {
              if (u.id === userId) {
                return { 
                  ...u, 
                  connectionStatus: 'none',
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
            description: "Zaproszenie zostało anulowane. Przestałeś również obserwować tego użytkownika.",
          });
        } else {
          // Jeśli zachowujemy obserwowanie, nie aktualizujemy liczników obserwujących
          setUsers(prevUsers => 
            prevUsers.map(u => {
              if (u.id === userId) {
                return { 
                  ...u, 
                  connectionStatus: 'none'
                };
              }
              return u;
            })
          );

          toast({
            title: "Sukces",
            description: "Zaproszenie zostało anulowane. Nadal obserwujesz tego użytkownika.",
          });
        }
      } else {
        const { data: receivedRequest } = await supabase
          .from('connection_requests')
          .select('*')
          .eq('sender_id', userId)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (receivedRequest) {
          // Odrzuć otrzymane zaproszenie
          const { error } = await supabase
            .from('connection_requests')
            .delete()
            .eq('id', receivedRequest.id);

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
        }
      }
    }

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
