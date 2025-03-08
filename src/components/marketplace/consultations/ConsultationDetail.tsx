
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Consultation, ConsultationOrder } from "@/types/consultations";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone, 
  Video, 
  DollarSign, 
  MapPin, 
  User 
} from 'lucide-react';

export function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [contactMethod, setContactMethod] = useState<string>('');
  const [orders, setOrders] = useState<ConsultationOrder[]>([]);

  useEffect(() => {
    if (id) {
      fetchConsultationDetails();
      if (user) {
        fetchOrders();
      }
    }
  }, [id, user]);

  const fetchConsultationDetails = async () => {
    try {
      console.log("Fetching consultation with ID:", id);
      
      // Pobierz dane konsultacji
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
        console.log("Consultation data:", data);
        setConsultation(data as Consultation);
        
        // Pobierz dane profilu właściciela
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', data.user_id)
          .single();
          
        if (profileError) {
          console.error('Error fetching owner profile:', profileError);
        } else {
          console.log("Owner profile:", profileData);
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

  const fetchOrders = async () => {
    if (!id || !user) return;
    
    try {
      console.log("Fetching orders for consultation:", id, "and user:", user.id);
      
      const { data, error } = await supabase
        .from('consultation_orders')
        .select('*')
        .eq('consultation_id', id)
        .eq('client_id', user.id);

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      if (data) {
        console.log("Orders data:", data);
        setOrders(data as ConsultationOrder[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleBook = async () => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby zarezerwować konsultację, musisz być zalogowany.",
        variant: "destructive",
      });
      return;
    }

    if (!consultation) return;

    if (!selectedDate || !selectedTime || !contactMethod) {
      toast({
        title: "Uzupełnij dane",
        description: "Wybierz datę, godzinę oraz preferowaną metodę kontaktu dla konsultacji.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate expiration date (7 days from selected date)
      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const expiresAt = new Date(selectedDateTime);
      expiresAt.setDate(expiresAt.getDate() + 7);

      const orderData = {
        consultation_id: consultation.id,
        client_id: user.id,
        expert_id: consultation.user_id,
        status: 'pending_payment',
        amount: consultation.price,
        price: consultation.price,
        date: selectedDate,
        time: selectedTime,
        contact_method: contactMethod,
        is_paid: false,
        is_completed: false,
        is_client_confirmed: false,
        is_expert_confirmed: false,
        is_online: consultation.is_online,
        location: consultation.location,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };

      const { data, error } = await supabase
        .from('consultation_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Sukces!",
        description: "Twoja konsultacja została zarezerwowana. Teraz przejdź do płatności, aby sfinalizować rezerwację.",
      });

      setBookingDialogOpen(false);
      fetchOrders();
      
      // Tutaj można dodać przekierowanie do strony płatności
      // navigate(`/checkout/consultation/${data.id}`);
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zarezerwować konsultacji. Spróbuj ponownie później.",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('client_id', user?.id || '');

      if (error) throw error;

      toast({
        title: "Anulowano",
        description: "Twoja rezerwacja została anulowana. Środki wrócą na Twoje konto.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się anulować rezerwacji. Spróbuj ponownie później.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Oczekuje na płatność</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Oczekujące</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Zaakceptowane</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Odrzucone</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Zakończone</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Anulowane</Badge>;
      default:
        return <Badge variant="outline">Nieznany</Badge>;
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'video':
        return <Video className="h-4 w-4 text-muted-foreground" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-muted-foreground" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
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
        className="mb-4"
        onClick={() => navigate('/marketplace?tab=consultations')}
      >
        ← Wróć do listy konsultacji
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{consultation.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {consultation.categories?.map((category, index) => (
                  <Badge key={index} variant="outline">{category}</Badge>
                ))}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={owner?.avatar_url || ''} alt={owner?.full_name} />
                  <AvatarFallback>{owner?.full_name?.substring(0, 2) || 'XX'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{owner?.full_name || 'Nieznany ekspert'}</div>
                  <div className="text-sm text-muted-foreground">
                    {consultation.experience ? `${consultation.experience} lat doświadczenia` : 'Ekspert'}
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{consultation.description}</p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Szczegóły konsultacji</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium min-w-32">Cena:</span>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{consultation.price} PLN / godzina</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium min-w-32">Forma:</span>
                      <div>
                        {consultation.is_online && (
                          <Badge variant="outline" className="mr-2 bg-green-50 text-green-700">Online</Badge>
                        )}
                        {consultation.location && (
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{consultation.location}</span>
                          </div>
                        )}
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium min-w-32">Doświadczenie:</span>
                      <span>{consultation.experience ? `${consultation.experience} lat` : 'Nie podano'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium min-w-32">Metody kontaktu:</span>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Rozmowa wideo</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Telefon</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Chat</span>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium min-w-32">Realizacja:</span>
                      <span>7 dni od daty zakupu na przeprowadzenie konsultacji</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Proces zakupu i realizacji</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Dokonaj płatności, aby zarezerwować konsultację</li>
                    <li>Ekspert otrzyma powiadomienie o Twoim zamówieniu</li>
                    <li>Skontaktujcie się ze sobą wybraną metodą kontaktu</li>
                    <li>Przeprowadźcie konsultację w ciągu 7 dni od daty zakupu</li>
                    <li>Po konsultacji potwierdź jej wykonanie w systemie</li>
                  </ol>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              {!isOwner && (
                <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">Zarezerwuj konsultację</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Zarezerwuj konsultację</DialogTitle>
                      <DialogDescription>
                        Wybierz termin konsultacji z {owner?.full_name || 'ekspertem'}.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="date" className="text-right col-span-1">
                          Data
                        </label>
                        <input
                          id="date"
                          type="date"
                          className="col-span-3 p-2 border rounded"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="time" className="text-right col-span-1">
                          Godzina
                        </label>
                        <input
                          id="time"
                          type="time"
                          className="col-span-3 p-2 border rounded"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="contact-method" className="text-right col-span-1">
                          Metoda kontaktu
                        </label>
                        <select
                          id="contact-method"
                          className="col-span-3 p-2 border rounded"
                          value={contactMethod}
                          onChange={(e) => setContactMethod(e.target.value)}
                        >
                          <option value="">Wybierz metodę kontaktu</option>
                          <option value="video">Rozmowa wideo</option>
                          <option value="phone">Telefon</option>
                          <option value="chat">Chat</option>
                        </select>
                      </div>
                      <div className="col-span-4 bg-yellow-50 p-3 rounded text-sm text-yellow-800 mt-2">
                        <p><strong>Uwaga:</strong> Po zarezerwowaniu konsultacji masz 7 dni na jej przeprowadzenie.</p>
                        <p className="mt-1">Po dokonaniu rezerwacji zostaniesz poproszony o dokonanie płatności.</p>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                        Anuluj
                      </Button>
                      <Button onClick={handleBook}>Zarezerwuj</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Twoje rezerwacje</CardTitle>
            </CardHeader>
            
            <CardContent>
              {!user ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Zaloguj się, aby zobaczyć swoje rezerwacje</p>
                  <Button onClick={() => navigate('/login')}>Zaloguj się</Button>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">Rezerwacja #{order.id.substring(0, 8)}</div>
                          <div className="text-sm">{order.date} | {order.time}</div>
                          
                          {order.contact_method && (
                            <div className="flex items-center text-sm mt-1">
                              {getContactMethodIcon(order.contact_method)}
                              <span className="ml-1 capitalize">{order.contact_method}</span>
                            </div>
                          )}
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="flex justify-between mt-3">
                        <div className="text-sm text-muted-foreground">
                          Utworzono: {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        
                        {order.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Anuluj
                          </Button>
                        )}
                        
                        {order.status === 'pending_payment' && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              // navigate(`/checkout/consultation/${order.id}`);
                              toast({
                                title: "Przekierowanie do płatności",
                                description: "Ta funkcjonalność jest w trakcie implementacji.",
                              });
                            }}
                          >
                            Zapłać
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nie masz jeszcze żadnych rezerwacji
                </p>
              )}
            </CardContent>
          </Card>
          
          {isOwner && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Panel eksperta</CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-center text-muted-foreground mb-4">
                  Zarządzaj swoimi konsultacjami i rezerwacjami
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/profile?tab=marketplace&marketplaceTab=consultations')}
                >
                  Przejdź do panelu eksperta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConsultationDetail;
