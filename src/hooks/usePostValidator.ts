
import { toast } from '@/components/ui/use-toast';

interface PostValidatorParams {
  userId: string | undefined;
  content: string;
  isPollMode: boolean;
  pollOptions: string[];
  mediaCount: number;
}

export function usePostValidator() {
  /**
   * Waliduje dane posta przed zapisem
   * @returns true jeśli walidacja przeszła pomyślnie, false w przeciwnym przypadku
   */
  const validatePost = ({
    userId,
    content,
    isPollMode,
    pollOptions,
    mediaCount
  }: PostValidatorParams): boolean => {
    // Sprawdź czy użytkownik jest zalogowany
    if (!userId) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby utworzyć post",
        variant: "destructive",
      });
      return false;
    }
    
    // Walidacja ankiety
    if (isPollMode) {
      const filledOptions = pollOptions.filter(option => option.trim() !== '');
      if (filledOptions.length < 2) {
        toast({
          title: "Nieprawidłowa ankieta",
          description: "Ankieta musi mieć co najmniej 2 uzupełnione opcje",
          variant: "destructive",
        });
        return false;
      }
    }
    
    // Sprawdź czy post nie jest pusty
    if (!content.trim() && mediaCount === 0 && !isPollMode) {
      toast({
        title: "Pusty post",
        description: "Post musi zawierać tekst, ankietę lub media",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  return { validatePost };
}
