
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from '../types';

export const sendConnectionRequest = async (
  user: any | null,
  userId: string, 
  setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>,
  loadUsers: () => Promise<void>
) => {
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

    // Tworzymy najpierw obserwację - wysyłający zaczyna obserwować odbierającego
    try {
      // Sprawdź czy już nie obserwujemy
      const { data: existingFollowing } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      // Jeśli nie obserwuje, dodaj obserwację
      if (!existingFollowing) {
        const { error: followError } = await supabase
          .from('followings')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (followError) {
          console.error('Error creating following when sending connection request:', followError);
          // Kontynuujemy mimo błędu obserwacji
        } else {
          console.log('Sender started following receiver');
        }
      } else {
        console.log('Sender already follows receiver, skipping follow creation');
      }
    } catch (followErr) {
      console.error('Error handling follow relationship:', followErr);
      // Kontynuujemy mimo błędu obserwacji
    }

    // Teraz tworzymy zaproszenie do połączenia
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
      prevUsers.map(u => {
        if (u.id === userId) {
          return { 
            ...u, 
            connectionStatus: 'pending_sent',
            // Dodajemy jeden do followersCount, bo wysyłający zaczyna obserwować odbierającego
            followersCount: u.followersCount + 1
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
