
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useConsultationForm(initialData?: any) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [priceType, setPriceType] = useState('za godzinę');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories || []);
  const [experienceYears, setExperienceYears] = useState(initialData?.experience || '');
  const [isOnline, setIsOnline] = useState(initialData?.is_online ?? true);
  const [isInPerson, setIsInPerson] = useState(!!initialData?.location);
  const [location, setLocation] = useState(initialData?.location || '');
  const [contactMethods, setContactMethods] = useState<string[]>(initialData?.contact_methods || []);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Brak tytułu",
        description: "Podaj tytuł dla swoich konsultacji.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Nieprawidłowa cena",
        description: "Podaj prawidłową cenę za konsultacje.",
        variant: "destructive",
      });
      return false;
    }
    
    if (selectedCategories.length === 0) {
      toast({
        title: "Brak kategorii",
        description: "Wybierz przynajmniej jedną kategorię dla swoich konsultacji.",
        variant: "destructive",
      });
      return false;
    }
    
    if (isInPerson && !location.trim()) {
      toast({
        title: "Brak lokalizacji",
        description: "Podaj lokalizację dla konsultacji stacjonarnych.",
        variant: "destructive",
      });
      return false;
    }
    
    if (contactMethods.length === 0) {
      toast({
        title: "Brak metod kontaktu",
        description: "Wybierz przynajmniej jedną metodę kontaktu dla swoich konsultacji.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const getFormData = () => ({
    title,
    description,
    price: Number(price),
    experience: experienceYears,
    categories: selectedCategories,
    is_online: isOnline,
    location: isInPerson ? location : null,
    availability: [],
    contact_methods: contactMethods,
  });

  return {
    title,
    setTitle,
    description,
    setDescription,
    price,
    setPrice,
    priceType,
    setPriceType,
    selectedCategories,
    setSelectedCategories,
    experienceYears,
    setExperienceYears,
    isOnline,
    setIsOnline,
    isInPerson,
    setIsInPerson,
    location,
    setLocation,
    contactMethods,
    setContactMethods,
    tagInput,
    setTagInput,
    tags,
    setTags,
    validateForm,
    getFormData,
  };
}
