
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Clock, Video, Phone, MessageCircle, Star, Shield, User, ChevronLeft, Share2, Heart } from 'lucide-react';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const [consultation, setConsultation] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  useEffect(() => {
    fetchConsultation();
    if (user) {
      checkIfFavorite();
    }
  }, [id, user]);
  
  const fetchConsultation = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setConsultation(data);
        
        // Pobierz dane eksperta
        const { data: expertData, error: expertError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .single();
          
        if (expertError) {
          console.error('Błąd pobierania danych eksperta:', expertError);
        } else {
          setExpert(expertData);
        }
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych konsultacji:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych konsultacji.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .eq('item_type', 'consultation');
        
      if (error) {
        throw error;
      }
      
      setIsFavorite(data && data.length > 0);
    } catch (error) {
      console.error('Błąd podczas sprawdzania ulubionych:', error);
    }
  };
  
  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      if (isFavorite) {
        // Usuń z ulubionych
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
          description: "Konsultacja została usunięta z listy ulubionych."
        });
      } else {
        // Dodaj do ulubionych
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
          description: "Konsultacja została dodana do listy ulubionych."
        });
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji ulubionych:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować listy ulubionych.",
        variant: "destructive",
      });
    }
  };
  
  const handleShareConsultation = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link skopiowany",
      description: "Link do konsultacji został skopiowany do schowka."
    });
  };
  
  const handlePurchaseClick = () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }
    
    setShowConfirmDialog(true);
  };
  
  const completePurchase = async () => {
    try {
      // Utworzenie zamówienia w bazie danych
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          expert_id: consultation.user_id,
          consultation_id: id,
          amount: consultation.price,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dni od teraz
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Przejście do strony płatności/podsumowania
      navigate(`/checkout/${data.id}`);
    } catch (error) {
      console.error('Błąd podczas tworzenia zamówienia:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zrealizować zamówienia. Spróbuj ponownie później.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-10">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex justify-center p-16">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!consultation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-10">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Konsultacja nie znaleziona</h2>
              <p className="text-muted-foreground mb-6">Konsultacja, której szukasz, nie istnieje lub została usunięta.</p>
              <Button onClick={() => navigate('/marketplace?tab=consultations')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Powrót do konsultacji
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Określ ikony dla preferowanych form kontaktu
  const contactIcons = {
    video: <Video className="h-5 w-5 text-blue-500" />,
    phone: <Phone className="h-5 w-5 text-green-500" />,
    chat: <MessageCircle className="h-5 w-5 text-purple-500" />
  };
  
  // Określ preferowane formy kontaktu na podstawie danych konsultacji
  const contactMethods = consultation.is_online 
    ? ['video', 'chat'] 
    : consultation.location ? ['phone', 'video'] : ['chat'];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-10">
        <div className="container max-w-6xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate('/marketplace?tab=consultations')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Powrót do konsultacji
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Informacje o ekspercie */}
            <div className="md:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={expert?.avatar_url} alt={expert?.full_name} />
                      <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="text-xl font-bold">{expert?.full_name}</h3>
                      <p className="text-muted-foreground">@{expert?.username}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Doświadczenie</h4>
                    <p>{consultation.experience ? `${consultation.experience} lat doświadczenia` : "Doświadczony ekspert"}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Lokalizacja</h4>
                    <p>{expert?.location || consultation.location || "Konsultacje online"}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Specjalizacje</h4>
                    <div className="flex flex-wrap gap-2">
                      {consultation.categories && consultation.categories.map((category: string) => (
                        <Badge key={category} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user/${expert?.id}`)}
                    className="w-full"
                  >
                    Zobacz profil eksperta
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Szczegóły konsultacji */}
            <div className="md:w-2/3">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">{consultation.title}</h1>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={handleShareConsultation}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {consultation.categories && consultation.categories.map((category: string) => (
                  <Badge key={category} variant="outline">{category}</Badge>
                ))}
              </div>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Opis konsultacji</h2>
                  <p className="whitespace-pre-line text-muted-foreground mb-6">
                    {consultation.description || "Brak szczegółowego opisu konsultacji."}
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <h2 className="text-xl font-bold mb-4">Preferowane formy kontaktu</h2>
                  <div className="flex gap-4 mb-6">
                    {contactMethods.map((method: string) => (
                      <div key={method} className="flex items-center gap-2">
                        {contactIcons[method as keyof typeof contactIcons]}
                        <span className="capitalize">{method === 'video' ? 'Wideorozmowa' : method === 'phone' ? 'Telefon' : 'Chat'}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="bg-muted/30 p-4 rounded-md">
                    <h3 className="font-bold mb-2">Jak działa proces konsultacji?</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                        <span>Dokonaj zakupu konsultacji, płacąc z góry</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                        <span>Skontaktuj się z ekspertem w ciągu 7 dni</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                        <span>Przeprowadź konsultację w wybranej formie</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">4</span>
                        <span>Potwierdź wykonanie usługi po zakończeniu</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Czas na realizację: 7 dni</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Bezpieczna płatność przez platformę</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Cena konsultacji</p>
                      <p className="text-3xl font-bold">{consultation.price} zł</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={handlePurchaseClick}
                    disabled={user && user.id === consultation.user_id}
                  >
                    {user && user.id === consultation.user_id 
                      ? "Nie możesz kupić własnej konsultacji" 
                      : "Kup konsultację"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Wymagane logowanie"
        description="Aby kupić konsultację lub dodać ją do ulubionych, musisz być zalogowany."
      />
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź zakup konsultacji</AlertDialogTitle>
            <AlertDialogDescription>
              Dokonujesz zakupu konsultacji "{consultation.title}" za kwotę {consultation.price} zł. 
              Po zakupie będziesz mieć 7 dni na skontaktowanie się z ekspertem i przeprowadzenie konsultacji.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={completePurchase}>Kupuję i płacę</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
