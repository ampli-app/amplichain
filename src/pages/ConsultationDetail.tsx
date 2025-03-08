
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Star, MapPin, Calendar, Video, Phone, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Consultation, ConsultationOrder } from '@/types/consultation';

export function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchConsultation();
      if (user) {
        checkIfPurchased();
      }
    }
  }, [id, user]);
  
  const fetchConsultation = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Sprawdzamy, czy data ma poprawną strukturę
        if (data.profiles && typeof data.profiles === 'object') {
          setConsultation(data as unknown as Consultation);
        } else {
          // Jeśli profiles nie jest obiektem, obsługujemy to jako błąd
          console.error("Invalid profiles data structure:", data.profiles);
          setError("Nie udało się załadować danych eksperta. Spróbuj ponownie później.");
        }
      } else {
        setError("Nie znaleziono konsultacji");
      }
    } catch (err) {
      console.error('Error fetching consultation:', err);
      setError("Wystąpił błąd podczas ładowania danych konsultacji");
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfPurchased = async () => {
    if (!user || !id) return;
    
    try {
      // Sprawdzamy, czy tabela consultation_orders istnieje
      const { count, error: checkError } = await supabase
        .from('consultation_orders')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Tabela consultation_orders nie istnieje lub wystąpił błąd:', checkError);
        return;
      }
      
      const { data, error } = await supabase
        .from('consultation_orders')
        .select('*')
        .eq('consultation_id', id)
        .eq('client_id', user.id)
        .not('status', 'eq', 'cancelled');
      
      if (error) {
        console.error('Error checking purchase status:', error);
        return;
      }
      
      setHasPurchased(data && data.length > 0);
    } catch (err) {
      console.error('Unexpected error checking purchase status:', err);
    }
  };
  
  const handlePurchase = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby zakupić konsultację, musisz być zalogowany.",
        variant: "destructive"
      });
      return;
    }
    
    if (!consultation || !user) return;
    
    try {
      setPurchasing(true);
      
      // Sprawdź, czy nie kupujesz własnej konsultacji
      if (consultation.user_id === user.id) {
        toast({
          title: "Nie możesz kupić własnej konsultacji",
          description: "Nie możesz zakupić konsultacji, której jesteś autorem.",
          variant: "destructive"
        });
        return;
      }
      
      // Utworzenie daty wygaśnięcia (za 7 dni)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Sprawdzamy, czy tabela consultation_orders istnieje
      const { count, error: checkError } = await supabase
        .from('consultation_orders')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Tabela consultation_orders nie istnieje lub wystąpił błąd:', checkError);
        toast({
          title: "Błąd zakupu",
          description: "Wystąpił błąd podczas przetwarzania zamówienia. Spróbuj ponownie później.",
          variant: "destructive"
        });
        return;
      }
      
      // Tworzymy nowe zamówienie
      const { data, error } = await supabase
        .from('consultation_orders')
        .insert({
          consultation_id: consultation.id,
          client_id: user.id,
          expert_id: consultation.user_id,
          amount: consultation.price,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Konsultacja zakupiona",
        description: "Pomyślnie zakupiono konsultację. Możesz teraz skontaktować się z ekspertem.",
      });
      
      setHasPurchased(true);
      
      // Po zakupie moglibyśmy przekierować do strony zamówień lub czatu
      // navigate('/messages');
      
    } catch (err) {
      console.error('Error purchasing consultation:', err);
      toast({
        title: "Błąd zakupu",
        description: "Wystąpił błąd podczas przetwarzania zamówienia. Spróbuj ponownie później.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error || !consultation) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-destructive">{error || "Nie znaleziono konsultacji"}</h2>
          <Button variant="outline" onClick={() => navigate('/marketplace')}>
            Powrót do rynku
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Szczegóły konsultacji */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-3">{consultation.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {consultation.categories.map((category, idx) => (
                <Badge key={idx} variant="outline" className="bg-primary/10">
                  {category}
                </Badge>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="prose dark:prose-invert max-w-none">
              <p>{consultation.description}</p>
            </div>
            
            {consultation.experience && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Doświadczenie</h3>
                <p>{consultation.experience}</p>
              </div>
            )}
            
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold mb-2">Szczegóły konsultacji</h3>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{consultation.is_online ? 'Online' : consultation.location}</span>
              </div>
              
              {consultation.availability && consultation.availability.length > 0 && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="font-medium">Dostępność:</span>
                    <ul className="list-disc list-inside ml-2">
                      {consultation.availability.map((time, idx) => (
                        <li key={idx}>{time}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <span className="font-medium">Formy kontaktu:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="flex items-center">
                      <Video className="h-3 w-3 mr-1" /> Wideo
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" /> Telefon
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" /> Czat
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Termin realizacji: 7 dni od zakupu</span>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Profil eksperta i akcje */}
        <div className="space-y-6">
          {/* Podsumowanie i cena */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Cena</h2>
            <div className="text-3xl font-bold mb-4">
              {consultation.price} PLN
            </div>
            
            <Button 
              className="w-full mb-3" 
              size="lg"
              onClick={handlePurchase}
              disabled={purchasing || hasPurchased || (user && consultation.user_id === user.id)}
            >
              {purchasing ? 'Przetwarzanie...' : hasPurchased ? 'Zakupiono' : 'Kup teraz'}
            </Button>
            
            {user && consultation.user_id === user.id && (
              <p className="text-sm text-muted-foreground text-center">
                Nie możesz zakupić własnej konsultacji
              </p>
            )}
            
            {hasPurchased && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md text-sm">
                <p className="font-medium">Konsultacja zakupiona!</p>
                <p className="mt-1">Skontaktuj się z ekspertem, aby rozpocząć konsultację.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => navigate('/messages')}
                >
                  Przejdź do wiadomości
                </Button>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-4">
              Po zakupie masz 7 dni na kontakt z ekspertem i przeprowadzenie konsultacji. Płatność zostaje zwrócona, jeśli ekspert nie odpowie w ciągu określonego czasu.
            </p>
          </Card>
          
          {/* Profil eksperta */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">O ekspercie</h2>
            
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={consultation.profiles.avatar_url} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-medium">{consultation.profiles.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{consultation.profiles.username}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/profile/${consultation.profiles.username}`)}
            >
              Zobacz profil
            </Button>
          </Card>
          
          {/* Informacje o bezpieczeństwie */}
          <Card className="p-6 bg-muted/30">
            <h2 className="text-lg font-semibold mb-2">Bezpieczne płatności</h2>
            <p className="text-sm text-muted-foreground">
              Płatność jest zabezpieczona i zostanie przekazana ekspertowi dopiero po potwierdzeniu wykonania usługi.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Add default export to fix the import issue in App.tsx
export default ConsultationDetail;
