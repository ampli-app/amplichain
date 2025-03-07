
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from '../types';

export const acceptConnectionRequest = async (
  user: any | null,
  userId: string,
  setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>,
  currentUser: SocialUser | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<SocialUser | null>>,
  loadUsers: () => Promise<void>
) => {
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
    
    const user_id1 = user.id < userId ? user.id : userId;
    const user_id2 = user.id < userId ? userId : user.id;

    console.log(`Creating connection with user_id1: ${user_id1}, user_id2: ${user_id2}`);

    const { data: existingConnection } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id1', user_id1)
      .eq('user_id2', user_id2)
      .maybeSingle();

    if (!existingConnection) {
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

    // Tworzenie obserwacji - tylko akceptujący zaczyna obserwować wysyłającego
    // Wysyłający już obserwuje (dodane przy wysyłaniu zaproszenia)
    try {
      // Sprawdź, czy akceptujący już obserwuje wysyłającego
      const { data: existingFollowing } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      // Jeśli nie obserwuje, to dodaj obserwację
      if (!existingFollowing) {
        const { error: followError } = await supabase
          .from('followings')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (followError) {
          console.error('Error creating following relationship:', followError);
          // Nie przerywamy procesu, jeśli obserwacja się nie udała
        } else {
          console.log('Created following relationship from accepter to sender');
        }
      } else {
        console.log('Accepter already follows sender, skipping following creation');
      }
    } catch (followErr) {
      console.error('Error handling follow relationship:', followErr);
      // Nie przerywamy procesu, jeśli obserwacja się nie udała
    }

    // Aktualizacja stanu UI po zaakceptowaniu zaproszenia
    setUsers(prevUsers => 
      prevUsers.map(u => {
        if (u.id === userId) {
          return { 
            ...u, 
            connectionStatus: 'connected', 
            connectionsCount: u.connectionsCount + 1,
            // Już jest obserwowany przez akceptującego
            followersCount: u.followersCount + 1
          };
        }
        return u;
      })
    );

    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        connectionsCount: currentUser.connectionsCount + 1,
        followingCount: currentUser.followingCount + 1
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
