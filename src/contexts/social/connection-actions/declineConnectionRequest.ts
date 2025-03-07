
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from '../types';

export const declineConnectionRequest = async (
  user: any | null,
  userId: string,
  setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>,
  loadUsers: () => Promise<void>
) => {
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
