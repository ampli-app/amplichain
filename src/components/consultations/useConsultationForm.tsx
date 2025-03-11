
import { useState, useEffect } from 'react';
import { Consultation } from '@/types/consultations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ConsultationFormData, MediaFile } from './types';

export function useConsultationForm(consultation: Consultation | null, onClose: () => void) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ConsultationFormData>({
    title: '',
    description: '',
    price: '',
    priceType: 'za godzinę',
    selectedCategories: [],
    experienceYears: '',
    isOnline: true,
    isInPerson: false,
    location: '',
    contactMethods: [],
    tags: [],
    media: []
  });
  
  useEffect(() => {
    if (consultation) {
      loadConsultationData(consultation);
    } else {
      resetForm();
    }
  }, [consultation]);
  
  const loadConsultationData = (data: Consultation) => {
    const mediaFiles: MediaFile[] = [];
    
    if (data.images) {
      let imageArray: string[] = [];
      
      if (typeof data.images === 'string') {
        try {
          imageArray = JSON.parse(data.images);
        } catch (e) {
          imageArray = [data.images];
        }
      } else if (Array.isArray(data.images)) {
        imageArray = data.images;
      }
      
      imageArray.forEach(url => {
        mediaFiles.push({
          url,
          preview: url,
          type: 'image'
        });
      });
    }
    
    setFormData({
      title: data.title || '',
      description: data.description || '',
      price: data.price ? data.price.toString() : '',
      priceType: 'za godzinę',
      selectedCategories: data.categories || [],
      experienceYears: data.experience || '',
      isOnline: data.is_online,
      isInPerson: !!data.location,
      location: data.location || '',
      contactMethods: data.contact_methods || [],
      tags: [],
      media: mediaFiles
    });
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      priceType: 'za godzinę',
      selectedCategories: [],
      experienceYears: '',
      isOnline: true,
      isInPerson: false,
      location: '',
      contactMethods: [],
      tags: [],
      media: []
    });
  };
  
  const handleChange = (field: keyof ConsultationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const validateForm = () => {
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
  
  const uploadImages = async (consultationId: string) => {
    const uploadedImages: string[] = [];
    
    // First add existing images (URLs)
    for (const item of formData.media) {
      if (item.url) {
        uploadedImages.push(item.url);
      }
    }
    
    // Then upload new files
    for (const item of formData.media) {
      if (item.file) {
        try {
          const fileName = `${Date.now()}_${item.file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('consultations')
            .upload(`${consultationId}/${fileName}`, item.file);
            
          if (uploadError) throw uploadError;
          
          if (uploadData) {
            const { data: urlData } = supabase.storage
              .from('consultations')
              .getPublicUrl(`${consultationId}/${fileName}`);
              
            if (urlData) {
              uploadedImages.push(urlData.publicUrl);
            }
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    }
    
    return uploadedImages;
  };
  
  const handleSubmit = async () => {
    if (!consultation || !consultation.id) {
      toast({
        title: "Błąd",
        description: "Brak danych konsultacji do edycji.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const uploadedImages = await uploadImages(consultation.id);
      
      const consultationData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        experience: formData.experienceYears,
        categories: formData.selectedCategories,
        is_online: formData.isOnline,
        location: formData.isInPerson ? formData.location : null,
        contact_methods: formData.contactMethods,
        images: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : null,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('consultations')
        .update(consultationData)
        .eq('id', consultation.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sukces!",
        description: "Twoje konsultacje zostały zaktualizowane pomyślnie.",
      });
      
      onClose();
      resetForm();
      navigate(`/consultations/${consultation.id}`);
      
    } catch (error) {
      console.error("Błąd podczas aktualizacji konsultacji:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować konsultacji. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
    resetForm
  };
}
