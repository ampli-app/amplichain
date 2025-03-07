
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from '../types';

export const removeConnection = async (
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
      const { data: pendingRequest } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingRequest) {
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
        const { data: receivedRequest } = await supabase
          .from('connection_requests')
          .select('*')
          .eq('sender_id', userId)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (receivedRequest) {
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
