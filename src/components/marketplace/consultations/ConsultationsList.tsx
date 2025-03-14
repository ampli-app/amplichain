
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ConsultationCard } from './ConsultationCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConsultationsListProps {
  consultations: any[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  favorites: Record<string, boolean>;
  onPageChange: (page: number) => void;
  onToggleFavorite: (consultationId: string, isFavorite: boolean) => void;
  onAddConsultationClick: () => void;
  refetchConsultations?: () => void;
}

export function ConsultationsList({
  consultations,
  loading,
  currentPage,
  totalPages,
  favorites,
  onPageChange,
  onToggleFavorite,
  onAddConsultationClick,
  refetchConsultations
}: ConsultationsListProps) {
  const { user } = useAuth();
  
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    const confirmed = window.confirm("Czy na pewno chcesz usunąć tę konsultację?");
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);  // Dodatkowe zabezpieczenie
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Usunięto konsultację",
        description: "Konsultacja została pomyślnie usunięta.",
      });
      
      // Odśwież listę konsultacji
      if (refetchConsultations) {
        refetchConsultations();
      }
    } catch (err) {
      console.error('Error deleting consultation:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć konsultacji.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="h-48 w-full" /> {/* Miejsce na obrazek */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } 
  
  if (consultations.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <div className="mb-4">
          <Search className="h-12 w-12 mx-auto text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">Nie znaleziono konsultacji</h3>
        <p className="text-muted-foreground mb-4">
          Spróbuj zmienić kryteria wyszukiwania lub dodaj swoją pierwszą konsultację
        </p>
        <Button onClick={onAddConsultationClick}>
          Dodaj konsultację
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultations.map(consultation => (
          <ConsultationCard 
            key={consultation.id} 
            consultation={consultation} 
            isFavorite={favorites[consultation.id] || false}
            isOwner={user?.id === consultation.user_id}
            onToggleFavorite={onToggleFavorite}
            onDelete={user?.id === consultation.user_id ? handleDelete : undefined}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Poprzednia
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Następna <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
