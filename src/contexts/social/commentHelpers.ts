
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

// Pomocnicza funkcja do formatowania czasu
export const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: pl
    });
  } catch (err) {
    console.error('Błąd formatowania daty:', err);
    return 'jakiś czas temu';
  }
};

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
