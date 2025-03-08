
// File: src/components/marketplace/consultations/ExpertConsultationsPanel.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ExternalLink,
  Loader2
} from 'lucide-react';

export function ExpertConsultationsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ConsultationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      console.log("Fetching expert's consultation orders for user:", user.id);

      const { data, error } = await supabase
        .from('consultation_orders')
        .select(`
          *,
          consultations:consultation_id(id, user_id, title, description, price, categories, experience, availability, is_online, location, contact_methods, created_at, updated_at),
          profiles:client_id(id, username, full_name, avatar_url)
        `)
        .eq('expert_id', user.id);

      if (error) throw error;

      console.log("Expert consultation orders:", data);
      // Konwersja danych do właściwego typu
      const typedData = data as ConsultationOrder[];
      setOrders(typedData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expert consultation orders:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zamówień konsultacji.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    setProcessingOrderId(orderId);

    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({
          status: 'accepted',
          is_expert_confirmed: true
        })
        .eq('id', orderId)
        .eq('expert_id', user.id);

      if (error) throw error;

      toast({
        title: "Zaakceptowano",
        description: "Zamówienie zostało zaakceptowane. Skontaktuj się z klientem.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaakceptować zamówienia.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!user) return;
    setProcessingOrderId(orderId);

    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({
          status: 'rejected',
          is_expert_confirmed: false
        })
        .eq('id', orderId)
        .eq('expert_id', user.id);

      if (error) throw error;

      toast({
        title: "Odrzucono",
        description: "Zamówienie zostało odrzucone.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się odrzucić zamówienia.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (!user) return;
    setProcessingOrderId(orderId);

    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({
          status: 'completed',
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('expert_id', user.id);

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
    } finally {
      setProcessingOrderId(null);
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

  const getContactMethodIcon = (method: string | undefined) => {
    if (!method) return null;
    
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

  const filterOrdersByStatus = (status: string) => {
    if (status === 'pending') {
      return orders.filter(order => order.status === 'pending');
    } else if (status === 'active') {
      return orders.filter(order => order.status === 'accepted' && !order.is_completed);
    } else if (status === 'completed') {
      return orders.filter(order => order.status === 'completed' || order.is_completed);
    } else if (status === 'rejected') {
      return orders.filter(order => order.status === 'rejected' || order.status === 'cancelled');
    }
    return orders;
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Musisz być zalogowany, aby zobaczyć swoje konsultacje.
        </p>
        <Button onClick={() => navigate('/login')}>Zaloguj się</Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Panel Eksperta Konsultacji</CardTitle>
          <CardDescription>
            Zarządzaj zamówieniami na twoje usługi konsultacyjne
          </CardDescription>
        </CardHeader>
      </Card>

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
          <TabsTrigger value="rejected">Odrzucone</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {filterOrdersByStatus('pending').length > 0 ? (
            <div className="space-y-4">
              {filterOrdersByStatus('pending').map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {order.consultations?.title || 'Konsultacja #' + order.id.substring(0, 8)}
                        </h3>
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
                            Preferowana metoda kontaktu: {getContactMethodIcon(order.contact_method)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="text-lg font-semibold mt-2">
                          {order.price || order.amount} PLN
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleRejectOrder(order.id)}
                        disabled={processingOrderId === order.id}
                        className="text-red-600"
                      >
                        {processingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}
                        Odrzuć
                      </Button>
                      <Button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={processingOrderId === order.id}
                      >
                        {processingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Akceptuj
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nie masz żadnych oczekujących zamówień na konsultacje.
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
                        <h3 className="font-medium">
                          {order.consultations?.title || 'Konsultacja #' + order.id.substring(0, 8)}
                        </h3>
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
                          {order.price || order.amount} PLN
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <Button onClick={() => {
                        // TODO: Implement chat functionality
                        toast({
                          title: "Chat",
                          description: "Funkcjonalność czatu jest w trakcie implementacji.",
                        });
                      }}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Napisz do klienta
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleCompleteOrder(order.id)}
                        disabled={processingOrderId === order.id}
                      >
                        {processingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Oznacz jako zakończoną
                      </Button>

                      {isExpired(order.expires_at) && (
                        <div className="bg-red-50 p-3 rounded-md mt-2 text-sm text-red-600">
                          <p>Termin realizacji minął! Jeśli konsultacja się odbyła, oznacz ją jako zakończoną.</p>
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
                        <h3 className="font-medium">
                          {order.consultations?.title || 'Konsultacja #' + order.id.substring(0, 8)}
                        </h3>
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
                          {order.price || order.amount} PLN
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 justify-end">
                      <Button
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => {
                          if (order.consultation_id) {
                            navigate(`/consultations/${order.consultation_id}`);
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Zobacz szczegóły oferty
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

        <TabsContent value="rejected">
          {filterOrdersByStatus('rejected').length > 0 ? (
            <div className="space-y-4">
              {filterOrdersByStatus('rejected').map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {order.consultations?.title || 'Konsultacja #' + order.id.substring(0, 8)}
                        </h3>
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
                Nie masz żadnych odrzuconych zamówień.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
