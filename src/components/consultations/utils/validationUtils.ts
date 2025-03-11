
import { ConsultationFormData } from '../types';
import { toast } from '@/components/ui/use-toast';

export const validateConsultationForm = (formData: ConsultationFormData): boolean => {
  if (!formData.title.trim()) {
    toast({
      title: "Brak tytułu",
      description: "Podaj tytuł dla swoich konsultacji.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
    toast({
      title: "Nieprawidłowa cena",
      description: "Podaj prawidłową cenę za konsultacje.",
      variant: "destructive",
    });
    return false;
  }
  
  if (formData.selectedCategories.length === 0) {
    toast({
      title: "Brak kategorii",
      description: "Wybierz przynajmniej jedną kategorię dla swoich konsultacji.",
      variant: "destructive",
    });
    return false;
  }
  
  if (formData.isInPerson && !formData.location.trim()) {
    toast({
      title: "Brak lokalizacji",
      description: "Podaj lokalizację dla konsultacji stacjonarnych.",
      variant: "destructive",
    });
    return false;
  }
  
  if (formData.contactMethods.length === 0) {
    toast({
      title: "Brak metod kontaktu",
      description: "Wybierz przynajmniej jedną metodę kontaktu dla swoich konsultacji.",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
