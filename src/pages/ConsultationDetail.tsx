
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarIcon, CheckCircle, Clock, Calendar, Globe, MapPin, MessageCircle, Phone, Video, ArrowLeft, HeartIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

// Definicja typów
interface Consultation {
  id: string;
  title: string;
  description: string;
  categories: string[];
  price: number;
  is_online: boolean;
  location: string | null;
  availability: string[];
  experience: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
    id: string;
  }
}

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  // Pobierz dane konsultacji
  useEffect(() => {
    async function fetchConsultation() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select(`
            *,
            profiles:user_id (id, username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching consultation:', error);
          setError('Nie udało się pobrać danych konsultacji.');
        } else {
          setConsultation(data);
          
          // Sprawdź, czy użytkownik już kupił tę konsultację
          if (isLoggedIn && user) {
            checkIfAlreadyPurchased(data.id, data.user_id);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Wystąpił nieoczekiwany błąd.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchConsultation();
  }, [id, isLoggedIn, user]);
  
  // Sprawdź, czy konsultacja jest w ulubionych
  useEffect(() => {
    if (!isLoggedIn || !user || !consultation) return;
    
    async function checkIfFavorited() {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', consultation.id)
          .eq('item_type', 'consultation')
          .maybeSingle();
          
        if (!error && data) {
          setIsFavorited(true);
        }
      } catch (err) {
        console.error('Error checking favorites status:', err);
      }
    }
    
    checkIfFavorited();
  }, [consultation, isLoggedIn, user]);
  
  // Sprawdź, czy użytkownik już kupił tę konsultację
  const checkIfAlreadyPurchased = async (consultationId: string, expertId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('consultation_orders')
        .select('id')
        .eq('consultation_id', consultationId)
        .eq('client_id', user.id)
        .eq('expert_id', expertId)
        .not('status', 'eq', 'cancelled')
        .maybeSingle();
        
      if (!error && data) {
        setAlreadyPurchased(true);
      }
    } catch (err) {
      console.error('Error checking purchase status:', err);
    }
  };
  
  // Obsługa dodawania/usuwania z ulubionych
  const handleToggleFavorite = async () => {
    if (!isLoggedIn || !user || !consultation) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      if (isFavorited) {
        // Usuń z ulubionych
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', consultation.id)
          .eq('item_type', 'consultation');
          
        if (error) throw error;
        
        setIsFavorited(false);
        toast({
          title: "Usunięto z ulubionych",
          description: "Konsultacja została usunięta z Twoich ulubionych."
        });
      } else {
        // Dodaj do ulubionych
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_id: consultation.id,
            item_type: 'consultation'
          });
          
        if (error) throw error;
        
        setIsFavorited(true);
        toast({
          title: "Dodano do ulubionych",
          description: "Konsultacja została dodana do Twoich ulubionych."
        });
      }
    } catch (err) {
      console.error('Error toggling favorite status:', err);
      toast({
        title: "Wystąpił błąd",
        description: "Nie udało się zaktualizować ulubionych. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };
  
  // Obsługa zakupu konsultacji
  const handlePurchase = async () => {
    if (!isLoggedIn || !user || !consultation) {
      setShowAuthDialog(true);
      return;
    }
    
    if (alreadyPurchased) {
      toast({
        title: "Konsultacja już zakupiona",
        description: "Ta konsultacja jest już w Twoim posiadaniu."
      });
      return;
    }
    
    if (user.id === consultation.user_id) {
      toast({
        title: "Nie możesz kupić własnej konsultacji",
        description: "Nie możesz zakupić konsultacji, której jesteś autorem."
      });
      return;
    }
    
    setPurchaseLoading(true);
    
    try {
      // Utwórz zamówienie konsultacji
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 dni na zrealizowanie
      
      const { data, error } = await supabase
        .from('consultation_orders')
        .insert({
          consultation_id: consultation.id,
          client_id: user.id,
          expert_id: consultation.user_id,
          amount: consultation.price,
          expires_at: expirationDate.toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Powodzenie
      setAlreadyPurchased(true);
      toast({
        title: "Konsultacja zakupiona!",
        description: "Skontaktuj się z ekspertem, aby ustalić szczegóły realizacji.",
      });
      
      // Tu byłaby integracja z systemem płatności, ale na razie pominiemy
      
    } catch (err) {
      console.error('Error purchasing consultation:', err);
      toast({
        title: "Błąd zakupu",
        description: "Nie udało się zrealizować zakupu. Spróbuj ponownie później.",
        variant: "destructive"
      });
    } finally {
      setPurchaseLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !consultation) {
    return (
      <div className="container py-8">
        <div className="bg-destructive/10 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Błąd</h2>
          <p className="text-muted-foreground mb-4">{error || "Nie znaleziono konsultacji."}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Wróć do listy konsultacji
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{consultation.title}</CardTitle>
                  <CardDescription>
                    {consultation.categories?.map((category, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mt-2">
                        {category}
                      </Badge>
                    ))}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={isFavorited ? "text-red-500" : ""}
                >
                  <HeartIcon className={`h-5 w-5 ${isFavorited ? "fill-red-500" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Opis konsultacji</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {consultation.description || "Brak opisu konsultacji."}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Szczegóły</h3>
                  <div className="space-y-3">
                    {consultation.is_online !== false && (
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span>Konsultacja online</span>
                      </div>
                    )}
                    
                    {consultation.location && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span>{consultation.location}</span>
                      </div>
                    )}
                    
                    {consultation.availability && consultation.availability.length > 0 && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                        <div>
                          <span className="block">Dostępność:</span>
                          <span className="text-sm text-muted-foreground">
                            {consultation.availability.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <span>Czas na realizację: 7 dni</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MessageCircle className="h-5 w-5 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block">Preferowana forma kontaktu:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline">
                            <Video className="h-3.5 w-3.5 mr-1" />
                            Rozmowa wideo
                          </Badge>
                          <Badge variant="outline">
                            <Phone className="h-3.5 w-3.5 mr-1" />
                            Rozmowa telefoniczna
                          </Badge>
                          <Badge variant="outline">
                            <MessageCircle className="h-3.5 w-3.5 mr-1" />
                            Wiadomości tekstowe
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {consultation.experience && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Doświadczenie eksperta</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {consultation.experience}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cena</CardTitle>
              <CardDescription>Płatność jednorazowa</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">
                {consultation.price.toFixed(2)} zł
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Zakup zawiera jednorazową konsultację z ekspertem.
              </p>
              
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handlePurchase}
                disabled={alreadyPurchased || consultation.user_id === user?.id || purchaseLoading}
              >
                {purchaseLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Przetwarzanie...
                  </span>
                ) : alreadyPurchased ? (
                  <span className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Zakupiono
                  </span>
                ) : consultation.user_id === user?.id ? (
                  "Twoja konsultacja"
                ) : (
                  "Kup teraz"
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Po zakupie masz 7 dni na kontakt z ekspertem i realizację konsultacji.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ekspert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={consultation.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {consultation.profiles?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{consultation.profiles?.full_name || 'Anonimowy'}</p>
                  <p className="text-sm text-muted-foreground">
                    @{consultation.profiles?.username || 'użytkownik'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">4.8</span>
                <span className="text-sm text-muted-foreground ml-1">(18 ocen)</span>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/profile/${consultation.profiles?.username}`)}
              >
                Zobacz profil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Wymagane logowanie"
        description="Aby wykonać tę akcję, musisz być zalogowany."
      />
    </div>
  );
}
