
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Consultation } from '@/types/consultations';
import { ConsultationCard } from '@/components/marketplace/consultations/ConsultationCard';
import { toast } from '@/components/ui/use-toast';
import { MarketplaceEmptyState } from './MarketplaceEmptyState';

export function MyConsultations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserConsultations();
    }
  }, [user]);

  const fetchUserConsultations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Pobierz konsultacje użytkownika
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (consultationsError) throw consultationsError;
      
      // 2. Pobierz profil użytkownika
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // 3. Przetwórz dane konsultacji
      const processedConsultations = consultationsData?.map(consultation => {
        // Użyj obrazów z bazy danych jeśli są dostępne, w przeciwnym razie użyj domyślnego obrazka
        const images = consultation.images && Array.isArray(consultation.images) && consultation.images.length > 0
          ? consultation.images
          : ["https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop"];
        
        return {
          id: consultation.id,
          user_id: consultation.user_id,
          title: consultation.title,
          description: consultation.description || '',
          price: consultation.price,
          categories: consultation.categories || [],
          experience: consultation.experience || '',
          availability: consultation.availability || [],
          is_online: consultation.is_online || false,
          location: consultation.location || '',
          contact_methods: consultation.contact_methods || [],
          created_at: consultation.created_at,
          updated_at: consultation.updated_at,
          images: images,
          profiles: {
            id: profileData.id,
            username: profileData.username || '',
            full_name: profileData.full_name || 'Ekspert',
            avatar_url: profileData.avatar_url || ''
          }
        } as Consultation;
      }) || [];
      
      setConsultations(processedConsultations);
    } catch (error) {
      console.error('Error fetching user consultations:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać Twoich konsultacji.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddConsultation = () => {
    navigate('/edit-consultation');
  };

  const handleEditConsultation = (id: string) => {
    navigate(`/edit-consultation/${id}`);
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę konsultację?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Usunięto",
        description: "Konsultacja została usunięta pomyślnie.",
      });
      
      // Odśwież listę konsultacji
      setConsultations(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć konsultacji.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <MarketplaceEmptyState
        title="Nie masz jeszcze żadnych konsultacji"
        description="Dodaj swoją pierwszą ofertę konsultacji i zacznij dzielić się swoją wiedzą"
        buttonText="Dodaj konsultację"
        buttonIcon={<PlusCircle className="h-4 w-4 mr-2" />}
        onButtonClick={handleAddConsultation}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Moje konsultacje ({consultations.length})</h2>
        <Button onClick={handleAddConsultation}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Dodaj konsultację
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultations.map(consultation => (
          <ConsultationCard
            key={consultation.id}
            consultation={consultation}
            isFavorite={false}
            isOwner={true}
            onToggleFavorite={() => {}}
            onDelete={handleDeleteConsultation}
          />
        ))}
      </div>
    </div>
  );
}
