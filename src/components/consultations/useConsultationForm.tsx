
import { useState, useEffect } from 'react';
import { Consultation } from '@/types/consultations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ConsultationFormData, MediaFile } from './types';
import { validateConsultationForm } from './utils/validationUtils';
import { uploadConsultationImages } from './utils/uploadUtils';

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
  
  const handleSubmit = async () => {
    if (!consultation || !consultation.id) {
      toast({
        title: "Błąd",
        description: "Brak danych konsultacji do edycji.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateConsultationForm(formData)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const uploadedImages = await uploadConsultationImages(consultation.id, formData.media);
      
      const consultationData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        experience: formData.experienceYears,
        categories: formData.selectedCategories,
        is_online: formData.isOnline,
        location: formData.isInPerson ? formData.location : null,
        contact_methods: formData.contactMethods,
        images: uploadedImages, // Tablica stringów, bez JSON.stringify
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
