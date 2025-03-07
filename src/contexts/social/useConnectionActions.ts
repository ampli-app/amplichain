
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

      // Usunięto automatyczne tworzenie obserwacji przy wysyłaniu zaproszenia

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

      // Zmieniono logikę tak, aby samo wysłanie zaproszenia nie tworzyło obserwacji
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.id === userId) {
            return { 
              ...u, 
              connectionStatus: 'pending_sent',
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

      console.log(`Accepting connection request from user: ${userId}`);

      const { data: requestData, error: findError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (findError || !requestData) {
        console.error('Error finding connection request:', findError);
        console.log('Request data:', requestData);
        toast({
          title: "Błąd",
          description: "Nie znaleziono zaproszenia do połączenia.",
          variant: "destructive",
        });
        return;
      }

      console.log('Found request data:', requestData);

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

      console.log('Connection request updated to accepted');
      
      // Poprawiona kolejność user_id1 i user_id2 aby zawsze mniejszy ID był user_id1
      // i to jest kluczowe dla poprawnego działania
      const user_id1 = user.id < userId ? user.id : userId;
      const user_id2 = user.id < userId ? userId : user.id;

      console.log(`Creating connection with user_id1: ${user_id1}, user_id2: ${user_id2}`);

      // Sprawdź, czy połączenie już nie istnieje
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id1', user_id1)
        .eq('user_id2', user_id2)
        .maybeSingle();

      if (!existingConnection) {
        // Jeśli połączenie nie istnieje, utwórz je
        const { error: connectionError } = await supabase
          .from('connections')
          .insert({
            user_id1: user_id1,
            user_id2: user_id2
          });

        if (connectionError) {
          console.error('Error creating connection:', connectionError);
          console.log(`Connection data: user_id1=${user_id1}, user_id2=${user_id2}`);
          toast({
            title: "Błąd",
            description: "Nie udało się utworzyć połączenia.",
            variant: "destructive",
          });
          return;
        }

        console.log('Connection created successfully');
      } else {
        console.log('Connection already exists, skipping creation');
      }

      // Dodaj wzajemną obserwację, jeśli jeszcze nie istnieje
      // Sprawdź, czy already user_id obserwuje userId
      const { data: alreadyFollowing, error: checkFollowingError } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (checkFollowingError) {
        console.error('Error checking following status:', checkFollowingError);
      }

      console.log('Already following?', alreadyFollowing);

      // Jeśli user_id jeszcze nie obserwuje userId, dodaj obserwację
      if (!alreadyFollowing) {
        const { error: followError } = await supabase
          .from('followings')
          .insert({
            follower_id: user.id,
            following_id: userId
          })
          .onConflict(['follower_id', 'following_id'])
          .ignore(); // Ignoruj błąd duplikatu

        if (followError) {
          console.error('Error creating following relationship:', followError);
        } else {
          console.log(`User ${user.id} is now following ${userId}`);
        }
      }

      // Sprawdź, czy already userId obserwuje user_id
      const { data: alreadyFollowed, error: checkFollowedError } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', userId)
        .eq('following_id', user.id)
        .maybeSingle();

      if (checkFollowedError) {
        console.error('Error checking followed status:', checkFollowedError);
      }

      console.log('Already followed?', alreadyFollowed);

      // Jeśli userId jeszcze nie obserwuje user_id, dodaj obserwację
      if (!alreadyFollowed) {
        const { error: beingFollowedError } = await supabase
          .from('followings')
          .insert({
            follower_id: userId,
            following_id: user.id
          })
          .onConflict(['follower_id', 'following_id'])
          .ignore(); // Ignoruj błąd duplikatu

        if (beingFollowedError) {
          console.error('Error creating being followed relationship:', beingFollowedError);
        } else {
          console.log(`User ${userId} is now following ${user.id}`);
        }
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                connectionStatus: 'connected', 
                connectionsCount: u.connectionsCount + 1,
                isFollower: true // ustawienie isFollower na true, ponieważ teraz na pewno nas obserwuje
              } 
            : u
        )
      );

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          connectionsCount: currentUser.connectionsCount + 1,
          followingCount: !alreadyFollowing ? currentUser.followingCount + 1 : currentUser.followingCount,
          followersCount: !alreadyFollowed ? currentUser.followersCount + 1 : currentUser.followersCount
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
