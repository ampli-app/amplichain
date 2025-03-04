
import { toast } from '@/components/ui/use-toast';

// Pomocnicza funkcja do pokazywania powiadomień o błędach
export const showErrorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

// Pomocnicza funkcja do pokazywania powiadomień o sukcesie
export const showSuccessToast = (description: string) => {
  toast({
    title: "Sukces",
    description,
  });
};

// Funkcja pomocnicza do sprawdzania, czy użytkownik jest właścicielem posta
export const isUserOwnPost = async (supabase: any, postId: string, userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();
  
  return data && data.user_id === userId;
};
