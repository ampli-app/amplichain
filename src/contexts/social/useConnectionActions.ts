
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from './types';

export const useConnectionActions = (
  user: any | null, 
  setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>,
  currentUser: SocialUser | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<SocialUser | null>>,
  loadUsers: () => Promise<void>
) => {
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

      // Kluczowa zmiana: Upewnij się, że użytkownik jest nadal oznaczony jako obserwowany
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.id === userId) {
            // Zachowaj informację, że użytkownik jest obserwowany
            const wasFollowing = u.connectionStatus === 'following' || followingData !== null;
            return { 
              ...u, 
              connectionStatus: 'pending_sent',
              // Jeśli użytkownik był wcześniej obserwowany lub właśnie go zaobserwowaliśmy, ustaw na true
              isFollower: u.isFollower // Zachowaj oryginalną wartość
            };
          }
          return u;
        })
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

      // Zamiast aktualizować status na 'rejected', usuwamy zaproszenie
      const { error } = await supabase
        .from('connection_requests')
        .delete()
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

      // Sprawdź, czy istnieje aktywne połączenie
      const { data: connectionData } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
        .maybeSingle();

      if (connectionData) {
        // Jeśli istnieje połączenie, usuń je
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
      } else {
        // Sprawdź, czy istnieje oczekujące zaproszenie
        const { data: pendingRequest } = await supabase
          .from('connection_requests')
          .select('*')
          .eq('sender_id', user.id)
          .eq('receiver_id', userId)
          .eq('status', 'pending')
          .maybeSingle();

        if (pendingRequest) {
          // Usuwamy zaproszenie, które zostało wysłane
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

          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.id === userId 
                ? { ...u, connectionStatus: 'none' } 
                : u
            )
          );

          toast({
            title: "Sukces",
            description: "Zaproszenie zostało anulowane.",
          });
        } else {
          // Sprawdź, czy istnieje otrzymane zaproszenie
          const { data: receivedRequest } = await supabase
            .from('connection_requests')
            .select('*')
            .eq('sender_id', userId)
            .eq('receiver_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

          if (receivedRequest) {
            // Usuwamy otrzymane zaproszenie (odrzucamy je)
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

  return {
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection
  };
};
