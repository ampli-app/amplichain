
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Consultation } from '@/types/consultations';
import { EditConsultationDialog } from '@/components/consultations/EditConsultationDialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function EditConsultation() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchConsultation();
    }
  }, [id]);
  
  useEffect(() => {
    if (consultation) {
      setDialogOpen(true);
    }
  }, [consultation]);
  
  const fetchConsultation = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Sprawdź czy użytkownik jest właścicielem
        if (data.user_id !== user.id) {
          toast({
            title: "Brak dostępu",
            description: "Nie masz uprawnień do edycji tej konsultacji.",
            variant: "destructive",
          });
          navigate('/marketplace?tab=consultations');
          return;
        }
        
        setConsultation(data as Consultation);
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych konsultacji.",
        variant: "destructive",
      });
      navigate('/marketplace?tab=consultations');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      navigate(`/consultations/${id}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Ładowanie danych konsultacji...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Edycja konsultacji</h1>
        <p className="text-muted-foreground">
          Zaktualizuj szczegóły swojej oferty konsultacji
        </p>
      </div>
      
      {!dialogOpen && (
        <div className="text-center py-8">
          <Button 
            variant="default" 
            onClick={() => setDialogOpen(true)}
          >
            Otwórz formularz edycji
          </Button>
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => navigate(`/consultations/${id}`)}
          >
            Wróć do szczegółów
          </Button>
        </div>
      )}
      
      <EditConsultationDialog 
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        consultation={consultation}
      />
    </div>
  );
}

export default EditConsultation;
