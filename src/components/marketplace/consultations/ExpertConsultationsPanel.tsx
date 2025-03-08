import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Consultation, ConsultationOrder } from '@/types/consultations';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Check, 
  X, 
  User,
  Video,
  Phone
} from 'lucide-react';

export function ExpertConsultationsPanel() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [orders, setOrders] = useState<ConsultationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchConsultations();
      fetchOrders();
    }
  }, [user]);

  const fetchConsultations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać Twoich konsultacji.",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('consultation_orders')
        .select(`
          *,
          profiles:client_id(username, full_name, avatar_url),
          consultations:consultation_id(title)
        `)
        .eq('expert_id', user.id);
        
      if (error) throw error;
      
      setOrders(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać rezerwacji Twoich konsultacji.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ 
          status: 'accepted',
          is_expert_confirmed: true
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast({
        title: "Zaakceptowano",
        description: "Rezerwacja została zaakceptowana. Skontaktuj się z klientem.",
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaakceptować rezerwacji.",
        variant: "destructive",
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ 
          status: 'rejected',
          is_expert_confirmed: false
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast({
        title: "Odrzucono",
        description: "Rezerwacja została odrzucona.",
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się odrzucić rezerwacji.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ 
          status: 'completed',
          is_expert_confirmed: true,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast({
        title: "Zakończono",
        description: "Konsultacja została oznaczona jako zakończona.",
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zakończyć konsultacji.",
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
          Musisz być zalogowany, aby zobaczyć panel eksperta.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Panel Eksperta</h2>
      
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
                            {(order.profiles as any)?.full_name || 'Nieznany klient'}
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
                    
                    {order.status === 'pending' && (
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => handleRejectOrder(order.id)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Odrzuć
                        </Button>
                        <Button onClick={() => handleAcceptOrder(order.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Akceptuj
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
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.consultations?.title}</h3>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {(order.profiles as any)?.full_name || 'Nieznany klient'}
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
                    
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button onClick={() => handleCompleteOrder(order.id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Oznacz jako ukończone
                      </Button>
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
                            {(order.profiles as any)?.full_name || 'Nieznany klient'}
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
                            {(order.profiles as any)?.full_name || 'Nieznany klient'}
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
    </div>
  );
}
