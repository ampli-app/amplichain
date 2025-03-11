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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Consultation, ConsultationOrder } from "@/types/consultations";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Check, 
  X, 
  User,
  Video,
  Phone, 
  ExternalLink,
  Info,
  Eye,
  Pencil,
  Share2
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
  const [selectedContactMethod, setSelectedContactMethod] = useState<string>('');
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

        if (data.contact_methods && data.contact_methods.length > 0) {
          setSelectedContactMethod(data.contact_methods[0]);
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
        .select(`
          *,
          consultations:consultation_id(title, description)
        `)
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

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Uzupełnij dane",
        description: "Wybierz datę i godzinę konsultacji.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedContactMethod && consultation.contact_methods && consultation.contact_methods.length > 0) {
      toast({
        title: "Wybierz metodę kontaktu",
        description: "Wybierz preferowaną metodę kontaktu.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedDateTime = new Date(selectedDate);
      const expiresAt = new Date(selectedDateTime);
      expiresAt.setDate(expiresAt.getDate() + 7);

      const orderData = {
        consultation_id: consultation.id,
        client_id: user.id,
        expert_id: consultation.user_id,
        status: 'pending',
        price: consultation.price,
        amount: consultation.price,
        date: selectedDate,
        time: selectedTime,
        contact_method: selectedContactMethod,
        is_paid: false,
        is_completed: false,
        is_client_confirmed: false,
        is_expert_confirmed: false,
        is_online: consultation.is_online,
        location: consultation.location,
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
        description: "Twoja konsultacja została zarezerwowana. Oczekuj na kontakt eksperta.",
      });

      setBookingDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zarezerwować konsultacji. Spróbuj ponownie później.",
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
        return <Video className="h-4 w-4" aria-hidden="true" />;
      case 'phone':
        return <Phone className="h-4 w-4" aria-hidden="true" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" aria-hidden="true" />;
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
        className="mb-4"
        onClick={() => navigate('/marketplace?tab=consultations')}
      >
        ← Wróć do listy konsultacji
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{consultation.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {consultation.categories?.map((category, index) => (
                      <Badge key={index} variant="outline">{category}</Badge>
                    ))}
                  </div>
                </div>
                
                {isOwner && (
                  <Badge className="bg-green-500 hover:bg-green-500">
                    Twoja konsultacja
                  </Badge>
                )}
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
                      <span>{consultation.price} PLN / godzina</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium min-w-32">Forma:</span>
                      <span>
                        {consultation.is_online ? 'Online' : ''}
                        {consultation.is_online && consultation.location ? ' / ' : ''}
                        {consultation.location ? `Stacjonarnie (${consultation.location})` : ''}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium min-w-32">Doświadczenie:</span>
                      <span>{consultation.experience ? `${consultation.experience} lat` : 'Nie podano'}</span>
                    </li>
                    {consultation.contact_methods && consultation.contact_methods.length > 0 && (
                      <li className="flex items-start">
                        <span className="font-medium min-w-32">Metody kontaktu:</span>
                        <div className="flex flex-col gap-1">
                          {consultation.contact_methods.map((method, index) => (
                            <span key={index} className="flex items-center">
                              {getContactMethodIcon(method)}
                              <span className="ml-1">{getContactMethodLabel(method)}</span>
                            </span>
                          ))}
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {!isOwner && (
                <div className="bg-blue-50 p-4 rounded-md mt-6 text-sm">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Jak działa proces konsultacji?</p>
                      <ul className="mt-2 space-y-1 text-blue-700">
                        <li>1. Zarezerwuj konsultację wybierając preferowaną datę i godzinę.</li>
                        <li>2. Po zaakceptowaniu przez eksperta, dokonaj płatności.</li>
                        <li>3. Skontaktuj się z ekspertem przez wybraną metodę kontaktu.</li>
                        <li>4. Masz 7 dni na przeprowadzenie konsultacji od wybranej daty.</li>
                        <li>5. Po zakończeniu, potwierdź odbycie konsultacji w panelu klienta.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              {isOwner ? (
                <div className="flex justify-between w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1 h-9"
                    onClick={() => {}}
                    title="Zobacz konsultację"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Zobacz konsultację</span>
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-[#9E9D1B] hover:bg-[#7e7c14] flex items-center gap-1 h-9"
                      onClick={handleEditConsultation}
                      title="Edytuj"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="hidden sm:inline">Edytuj</span>
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleShareConsultation}
                      title="Udostępnij"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
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
                        <Label htmlFor="date" className="text-right col-span-1">
                          Data
                        </Label>
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
                        <Label htmlFor="time" className="text-right col-span-1">
                          Godzina
                        </Label>
                        <input
                          id="time"
                          type="time"
                          className="col-span-3 p-2 border rounded"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                      </div>

                      {consultation.contact_methods && consultation.contact_methods.length > 0 && (
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label className="text-right col-span-1 mt-2">
                            Metoda kontaktu
                          </Label>
                          <RadioGroup 
                            className="col-span-3"
                            value={selectedContactMethod}
                            onValueChange={setSelectedContactMethod}
                          >
                            {consultation.contact_methods.map((method) => (
                              <div key={method} className="flex items-center space-x-2">
                                <RadioGroupItem value={method} id={`contact-${method}`} />
                                <Label htmlFor={`contact-${method}`} className="flex items-center cursor-pointer">
                                  {getContactMethodIcon(method)}
                                  <span className="ml-2">{getContactMethodLabel(method)}</span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      <div className="bg-muted p-3 rounded-md col-span-4 text-sm">
                        <p className="flex items-center text-muted-foreground">
                          <Info className="h-4 w-4 mr-2" />
                          Po zarezerwowaniu terminu będziesz mieć 7 dni na przeprowadzenie konsultacji od wybranej daty.
                        </p>
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
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Utworzono: {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      {order.contact_method && (
                        <div className="text-sm mt-2 flex items-center">
                          {getContactMethodIcon(order.contact_method)}
                          <span className="ml-1">{getContactMethodLabel(order.contact_method)}</span>
                        </div>
                      )}
                      {order.expires_at && (
                        <div className="text-sm mt-1">
                          Termin ważności: {new Date(order.expires_at).toLocaleDateString()}
                        </div>
                      )}
                      
                      {order.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full text-red-600"
                          onClick={() => {
                            toast({
                              title: "Anulowanie",
                              description: "Funkcja anulowania jest w trakcie implementacji.",
                            });
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Anuluj rezerwację
                        </Button>
                      )}
                      
                      {order.status === 'accepted' && (
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => {
                            toast({
                              title: "Kontakt",
                              description: "Funkcja kontaktu jest w trakcie implementacji.",
                            });
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Skontaktuj się z ekspertem
                        </Button>
                      )}
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
        </div>
      </div>
    </div>
  );
}

export default ConsultationDetail;
