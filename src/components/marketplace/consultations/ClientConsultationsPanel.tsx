
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsultationOrder, Consultation } from '@/types/consultations';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Check, 
  X, 
  User,
  Video,
  Phone, 
  ExternalLink
} from 'lucide-react';

export function ClientConsultationsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ConsultationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('consultation_orders')
        .select(`
          *,
          profiles:expert_id(id, username, full_name, avatar_url),
          consultations:consultation_id(id, user_id, title, description, price, categories, experience, availability, is_online, location, contact_methods, created_at, updated_at)
        `)
        .eq('client_id', user.id);
        
      if (error) throw error;
      
      // Konwersja danych do właściwego typu
      const typedData = data as ConsultationOrder[];
      setOrders(typedData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać Twoich rezerwacji konsultacji.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleConfirmConsultation = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ 
          status: 'completed',
          is_client_confirmed: true,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast({
        title: "Potwierdzono",
        description: "Konsultacja została oznaczona jako zakończona.",
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error confirming consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się potwierdzić konsultacji.",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ 
          status: 'cancelled',
          is_client_confirmed: false
        })
        .eq('id', orderId);
        
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
        description: "Nie udało się anulować rezerwacji.",
        variant: "destructive",
      });
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'video':
        return <span className="flex items-center"><Video className="h-4 w-4 mr-1" /> Rozmowa wideo</span>;
      case 'phone':
        return <span className="flex items-center"><Phone className="h-4 w-4 mr-1" /> Telefon</span>;
      case 'chat':
        return <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> Chat</span>;
      default:
        return <span>Nieokreślony</span>;
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

  const filterOrdersByStatus = (status: string) => {
    if (status === 'pending') {
      return orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'pending_payment'
      );
    } else if (status === 'active') {
      return orders.filter(order => 
        order.status === 'accepted' && 
        !order.is_completed
      );
    } else if (status === 'completed') {
      return orders.filter(order => 
        order.status === 'completed' || 
        order.is_completed
      );
    } else if (status === 'cancelled') {
      return orders.filter(order => 
        order.status === 'rejected' || 
        order.status === 'cancelled'
      );
    }
    return orders;
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Musisz być zalogowany, aby zobaczyć swoje rezerwacje.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Moje Konsultacje</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Oczekujące
            {filterOrdersByStatus('pending').length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {filterOrdersByStatus('pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Aktywne</TabsTrigger>
          <TabsTrigger value="completed">Zakończone</TabsTrigger>
          <TabsTrigger value="cancelled">Anulowane</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {filterOrdersByStatus('pending').length > 0 ? (
            <div className="space-y-4">
              {filterOrdersByStatus('pending').map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.consultations?.title}</h3>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {(order.profiles as any)?.full_name || 'Nieznany ekspert'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{order.date}</span>
                          <Clock className="h-4 w-4 ml-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{order.time}</span>
                        </div>
                        {order.contact_method && (
                          <div className="text-sm mt-1">
                            Metoda kontaktu: {getContactMethodIcon(order.contact_method)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="text-lg font-semibold mt-2">
                          {order.price} PLN
                        </div>
                      </div>
                    </div>
                    
                    {order.status === 'pending_payment' && (
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Anuluj
                        </Button>
                        <Button onClick={() => {
                          toast({
                            title: "Płatność",
                            description: "Przekierowanie do systemu płatności w trakcie implementacji.",
                          });
                        }}>
                          Zapłać
                        </Button>
                      </div>
                    )}
                    
                    {order.status === 'pending' && (
                      <div className="mt-4">
                        <div className="text-sm text-muted-foreground mb-2">
                          Oczekiwanie na akceptację eksperta...
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Anuluj rezerwację
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nie masz żadnych oczekujących rezerwacji.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {filterOrdersByStatus('active').length > 0 ? (
            <div className="space-y-4">
              {filterOrdersByStatus('active').map((order) => (
                <Card key={order.id} className={isExpired(order.expires_at) ? "border-red-300" : ""}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.consultations?.title}</h3>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {(order.profiles as any)?.full_name || 'Nieznany ekspert'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{order.date}</span>
                          <Clock className="h-4 w-4 ml-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{order.time}</span>
                        </div>
                        {order.contact_method && (
                          <div className="text-sm mt-1">
                            Metoda kontaktu: {getContactMethodIcon(order.contact_method)}
                          </div>
                        )}
                        
                        {order.expires_at && (
                          <div className={`text-sm mt-2 ${isExpired(order.expires_at) ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                            {isExpired(order.expires_at) 
                              ? "Termin realizacji minął!" 
                              : `Termin realizacji: ${new Date(order.expires_at).toLocaleDateString()}`}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="text-lg font-semibold mt-2">
                          {order.price} PLN
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4">
                      <Button onClick={() => {
                        // To simulate chat functionality
                        toast({
                          title: "Chat",
                          description: "Funkcjonalność chatu w trakcie implementacji.",
                        });
                      }}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Napisz do eksperta
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handleConfirmConsultation(order.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Potwierdź wykonanie konsultacji
                      </Button>
                      
                      {isExpired(order.expires_at) && (
                        <div className="bg-red-50 p-3 rounded-md mt-2 text-sm text-red-600">
                          <p>Termin realizacji minął! Jeśli konsultacja się odbyła, potwierdź jej wykonanie.</p>
                          <p>Jeśli nie, możesz ubiegać się o zwrot środków.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nie masz żadnych aktywnych konsultacji.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {filterOrdersByStatus('completed').length > 0 ? (
            <div className="space-y-4">
              {filterOrdersByStatus('completed').map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.consultations?.title}</h3>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {(order.profiles as any)?.full_name || 'Nieznany ekspert'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{order.date}</span>
                        </div>
                        {order.completed_at && (
                          <div className="text-sm mt-1">
                            Zakończono: {new Date(order.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="text-lg font-semibold mt-2">
                          {order.price} PLN
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // To be implemented
                          toast({
                            title: "Opinie",
                            description: "Funkcjonalność oceniania w trakcie implementacji.",
                          });
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Oceń konsultację
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="text-muted-foreground"
                        onClick={() => {
                          navigate(`/consultations/${order.consultation_id}`);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Zobacz szczegóły konsultacji
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nie masz żadnych zakończonych konsultacji.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {filterOrdersByStatus('cancelled').length > 0 ? (
            <div className="space-y-4">
              {filterOrdersByStatus('cancelled').map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.consultations?.title}</h3>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {(order.profiles as any)?.full_name || 'Nieznany ekspert'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{order.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="mt-4 text-muted-foreground w-full"
                      onClick={() => {
                        navigate(`/consultations/${order.consultation_id}`);
                      }}
                    >
                      Zarezerwuj ponownie
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nie masz żadnych anulowanych konsultacji.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Button 
          onClick={() => navigate('/marketplace?tab=consultations')}
          variant="outline"
        >
          Przeglądaj dostępne konsultacje
        </Button>
      </div>
    </div>
  );
}
