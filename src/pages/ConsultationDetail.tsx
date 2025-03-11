
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Consultation } from "@/types/consultations";
import { 
  ArrowLeft,
  Edit,
  Share2,
  Heart,
  Music,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MessageSquare,
  Info,
  User
} from 'lucide-react';
import { ProductImage } from '@/components/marketplace/ProductImage';

export function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
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
        // Remove from favorites
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
        // Add to favorites
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

    // Tutaj dodać logikę zakupu konsultacji - przekierowanie do koszyka lub płatności
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Konsultacja nie znaleziona</h1>
        <p className="text-muted-foreground mb-6">
          Konsultacja, której szukasz, nie istnieje lub została usunięta.
        </p>
        <Button onClick={() => navigate('/marketplace?tab=consultations')}>
          Wróć do listy konsultacji
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4 gap-1"
        onClick={() => navigate('/marketplace?tab=consultations')}
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do Rynku
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lewa kolumna - zdjęcie produktu */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden">
            {consultation.images && consultation.images.length > 0 ? (
              <ProductImage 
                image={consultation.images} 
                title={consultation.title} 
              />
            ) : (
              <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
                <Music className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Opcjonalnie: miniatury zdjęć na dole */}
          {consultation.images && consultation.images.length > 1 && (
            <div className="flex mt-4 gap-2 overflow-x-auto">
              {/* Tu można dodać miniatury zdjęć, jeśli są potrzebne */}
            </div>
          )}
        </div>
        
        {/* Prawa kolumna - informacje o produkcie */}
        <div>
          <div className="flex flex-col space-y-4">
            {/* Kategoria i ew. odznaki */}
            <div className="flex gap-2 items-center">
              {consultation.categories && consultation.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="bg-gray-100">
                  {category}
                </Badge>
              ))}
              
              {isOwner && (
                <Badge className="ml-auto bg-green-500 hover:bg-green-500">
                  Twój produkt
                </Badge>
              )}
            </div>
            
            {/* Tytuł produktu */}
            <h1 className="text-3xl font-bold">{consultation.title}</h1>
            
            {/* Informacje o sprzedawcy */}
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={owner?.avatar_url || ''} alt={owner?.full_name} />
                <AvatarFallback>{owner?.full_name?.substring(0, 2) || 'XX'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Sprzedawca: {owner?.full_name || 'Nieznany ekspert'}</div>
                <div className="text-sm text-muted-foreground">
                  {consultation.experience ? `${consultation.experience} lat doświadczenia` : 'Ekspert'}
                </div>
              </div>
            </div>
            
            {/* Cena */}
            <div className="mt-4">
              <div className="text-3xl font-bold">{consultation.price},00 zł</div>
              <div className="text-sm text-muted-foreground">
                + opłata serwisowa 1,5%
              </div>
            </div>
            
            {/* Przyciski akcji */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              {isOwner ? (
                <div className="flex gap-4">
                  <Button 
                    variant="default" 
                    className="bg-[#9E9D1B] hover:bg-[#7e7c14] flex-1 gap-2"
                    onClick={handleEditConsultation}
                  >
                    <Edit className="h-4 w-4" />
                    Edytuj produkt
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="gap-2"
                    onClick={handleShareConsultation}
                  >
                    <Share2 className="h-4 w-4" />
                    Udostępnij
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    className="w-full gap-2"
                    onClick={() => setBuyDialogOpen(true)}
                  >
                    Kup teraz
                  </Button>
                  
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={toggleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite ? 'Dodano do ulubionych' : 'Dodaj do ulubionych'}
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      className="gap-2"
                      onClick={handleShareConsultation}
                    >
                      <Share2 className="h-4 w-4" />
                      Udostępnij
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            {/* Cechy produktu */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  {consultation.is_online && (
                    <div className="flex items-start gap-2">
                      <Video className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Online</div>
                        <div className="text-sm text-muted-foreground">Konsultacja zdalna</div>
                      </div>
                    </div>
                  )}
                  
                  {consultation.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Stacjonarnie</div>
                        <div className="text-sm text-muted-foreground">{consultation.location}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Czas trwania</div>
                      <div className="text-sm text-muted-foreground">60 minut</div>
                    </div>
                  </div>
                  
                  {consultation.experience && (
                    <div className="flex items-start gap-2">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Doświadczenie</div>
                        <div className="text-sm text-muted-foreground">{consultation.experience} lat</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {consultation.contact_methods && consultation.contact_methods.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="font-medium mb-2">Dostępne metody kontaktu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      {consultation.contact_methods.map((method, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {getContactMethodIcon(method)}
                          <span>{getContactMethodLabel(method)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Opis produktu */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Opis konsultacji</h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="whitespace-pre-line">{consultation.description}</p>
        </div>
      </div>
      
      {/* Dialog zakupu */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie zakupu</DialogTitle>
            <DialogDescription>
              Potwierdź zakup konsultacji od {owner?.full_name || 'eksperta'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span>Konsultacja:</span>
              <span className="font-medium">{consultation.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Cena:</span>
              <span className="font-medium">{consultation.price},00 zł</span>
            </div>
            <div className="flex justify-between">
              <span>Opłata serwisowa (1,5%):</span>
              <span className="font-medium">{(consultation.price * 0.015).toFixed(2)} zł</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Razem:</span>
              <span>{(consultation.price * 1.015).toFixed(2)} zł</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleBuyConsultation}>
              Kup teraz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ConsultationDetail;
