
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Consultation } from '@/types/consultations';
import { toast } from '@/components/ui/use-toast';
import { Video, Phone, MessageSquare, User } from 'lucide-react';

export const useConsultationDetail = (id?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchConsultationDetails();
      if (user) {
        checkIsFavorite();
      }
    }
  }, [id, user]);

  const fetchConsultationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching consultation details:', error);
        throw error;
      }

      if (data) {
        setConsultation(data as Consultation);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', data.user_id)
          .single();
          
        if (profileError) {
          console.error('Error fetching owner profile:', profileError);
        } else {
          setOwner(profileData);
          setConsultation(prev => {
            if (prev) {
              return {
                ...prev,
                profiles: profileData
              };
            }
            return prev;
          });
        }
        
        if (user && data.user_id === user.id) {
          setIsOwner(true);
        }
      }
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać szczegółów konsultacji.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIsFavorite = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .eq('item_type', 'consultation')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite status:', error);
        return;
      }
      
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !id) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby dodać do ulubionych, musisz być zalogowany.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', 'consultation');
          
        if (error) throw error;
        
        setIsFavorite(false);
        toast({
          title: "Usunięto z ulubionych",
          description: "Konsultacja została usunięta z ulubionych.",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_id: id,
            item_type: 'consultation'
          });
          
        if (error) throw error;
        
        setIsFavorite(true);
        toast({
          title: "Dodano do ulubionych",
          description: "Konsultacja została dodana do ulubionych.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ulubionych.",
        variant: "destructive",
      });
    }
  };

  const handleEditConsultation = () => {
    navigate(`/edit-consultation/${consultation?.id}`);
  };

  const handleShareConsultation = () => {
    const consultationUrl = window.location.href;
    navigator.clipboard.writeText(consultationUrl);
    toast({
      title: "Link skopiowany",
      description: "Link do konsultacji został skopiowany do schowka.",
    });
  };

  const handleBuyConsultation = async () => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby kupić konsultację, musisz być zalogowany.",
        variant: "destructive",
      });
      return;
    }

    if (!consultation) return;

    toast({
      title: "Dodano do koszyka",
      description: "Konsultacja została dodana do koszyka.",
    });
    
    setBuyDialogOpen(false);
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'video':
        return <Video className="h-4 w-4" aria-hidden="true" />;
      case 'phone':
        return <Phone className="h-4 w-4" aria-hidden="true" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" aria-hidden="true" />;
      case 'live':
        return <User className="h-4 w-4" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case 'video':
        return 'Rozmowa wideo';
      case 'phone':
        return 'Rozmowa telefoniczna';
      case 'chat':
        return 'Czat tekstowy';
      case 'live':
        return 'Na żywo';
      default:
        return method;
    }
  };

  return {
    consultation,
    owner,
    isOwner,
    loading,
    isFavorite,
    buyDialogOpen,
    setBuyDialogOpen,
    toggleFavorite,
    handleEditConsultation,
    handleShareConsultation,
    handleBuyConsultation,
    getContactMethodIcon,
    getContactMethodLabel,
    navigate
  };
};
