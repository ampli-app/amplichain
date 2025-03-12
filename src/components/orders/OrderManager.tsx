
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle, Package, Truck, Clock, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderDetails {
  order_id: string;
  product_id: string;
  product_title: string;
  product_image: string | null;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string | null;
  seller_id: string;
  seller_name: string;
  seller_avatar: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  total_amount: number;
  shipping_address: string | null;
  tracking_number: string | null;
  shipping_method: string | null;
  payment_method: string | null;
  notes: string | null;
  delivery_option_id: string | null;
  delivery_option_name: string | null;
  delivery_price: number | null;
}

interface OrderManagerProps {
  mode: 'buyer' | 'seller';
  productId?: string;
  orderId?: string;
}

export function OrderManager({ mode, productId, orderId }: OrderManagerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>([]);

  useEffect(() => {
    if (!user) return;

    if (orderId) {
      fetchOrderDetails(orderId);
    } else if (mode === 'buyer' || mode === 'seller') {
      fetchOrders();
    }
  }, [user, orderId, mode, productId]);

  const fetchOrderDetails = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq('order_id', id)
        .single();

      if (error) throw error;
      
      setOrderDetails(data);
    } catch (error) {
      console.error('Błąd podczas pobierania szczegółów zamówienia:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać szczegółów zamówienia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq(mode === 'buyer' ? 'buyer_id' : 'seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Błąd podczas pobierania zamówień:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy zamówień",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('product_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: `Status zamówienia został zaktualizowany na: ${newStatus}`,
      });
      
      // Odśwież dane
      if (orderId === orderDetails?.order_id) {
        fetchOrderDetails(orderId);
      } else {
        fetchOrders();
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu zamówienia:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu zamówienia",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'oczekujące':
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">Oczekujące</Badge>;
      case 'zaakceptowane':
        return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">Zaakceptowane</Badge>;
      case 'przygotowane_do_wysyłki':
        return <Badge variant="outline" className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300">Przygotowane do wysyłki</Badge>;
      case 'wysłane':
        return <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">Wysłane</Badge>;
      case 'dostarczone':
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">Dostarczone</Badge>;
      case 'anulowane':
        return <Badge variant="outline" className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">Anulowane</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderOrderActions = (order: OrderDetails) => {
    const { status, order_id } = order;
    
    // Akcje dla sprzedawcy
    if (mode === 'seller') {
      if (status === 'oczekujące') {
        return (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => updateOrderStatus(order_id, 'zaakceptowane')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Akceptuj zamówienie
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => updateOrderStatus(order_id, 'anulowane')}
            >
              <X className="mr-2 h-4 w-4" />
              Anuluj
            </Button>
          </div>
        );
      } else if (status === 'zaakceptowane') {
        return (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => updateOrderStatus(order_id, 'przygotowane_do_wysyłki')}
          >
            <Package className="mr-2 h-4 w-4" />
            Oznacz jako przygotowane do wysyłki
          </Button>
        );
      } else if (status === 'przygotowane_do_wysyłki') {
        return (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => updateOrderStatus(order_id, 'wysłane')}
          >
            <Truck className="mr-2 h-4 w-4" />
            Oznacz jako wysłane
          </Button>
        );
      }
    }
    
    // Akcje dla kupującego
    if (mode === 'buyer') {
      if (status === 'wysłane') {
        return (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => updateOrderStatus(order_id, 'dostarczone')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Potwierdź odbiór
          </Button>
        );
      } else if (status === 'oczekujące') {
        return (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => updateOrderStatus(order_id, 'anulowane')}
          >
            <X className="mr-2 h-4 w-4" />
            Anuluj zamówienie
          </Button>
        );
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Renderowanie pojedynczego zamówienia
  if (orderDetails) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Zamówienie #{orderDetails.order_id.split('-')[0]}</CardTitle>
              <CardDescription>
                Złożone: {new Date(orderDetails.created_at).toLocaleDateString('pl-PL')}
              </CardDescription>
            </div>
            {getStatusBadge(orderDetails.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={orderDetails.product_image || '/placeholder.svg'} 
                alt={orderDetails.product_title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">{orderDetails.product_title}</h3>
              <p className="text-sm text-muted-foreground">
                {mode === 'buyer' ? (
                  <>Sprzedawca: {orderDetails.seller_name}</>
                ) : (
                  <>Kupujący: {orderDetails.buyer_name}</>
                )}
              </p>
              <p className="font-medium mt-1">
                {formatCurrency(orderDetails.total_amount)}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold">Informacje o dostawie</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Metoda dostawy:</div>
              <div>{orderDetails.delivery_option_name || 'Nie określono'}</div>
              
              {orderDetails.shipping_address && (
                <>
                  <div className="text-muted-foreground">Adres dostawy:</div>
                  <div>{orderDetails.shipping_address}</div>
                </>
              )}
              
              {orderDetails.tracking_number && (
                <>
                  <div className="text-muted-foreground">Numer śledzenia:</div>
                  <div>{orderDetails.tracking_number}</div>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold">Podsumowanie płatności</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produkt:</span>
                <span>{formatCurrency(orderDetails.total_amount - (orderDetails.delivery_price || 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dostawa:</span>
                <span>{formatCurrency(orderDetails.delivery_price || 0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Razem:</span>
                <span>{formatCurrency(orderDetails.total_amount)}</span>
              </div>
            </div>
          </div>
          
          {orderDetails.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold">Uwagi</h4>
                <p className="text-sm">{orderDetails.notes}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          {renderOrderActions(orderDetails)}
          <Button 
            variant="outline" 
            onClick={() => navigate(mode === 'buyer' ? '/my-orders' : '/seller-orders')}
          >
            Wróć do listy zamówień
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Renderowanie listy zamówień
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {mode === 'buyer' ? 'Moje zamówienia' : 'Zamówienia do obsługi'}
      </h2>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-4">
              {mode === 'buyer' 
                ? 'Nie masz jeszcze żadnych zamówień.' 
                : 'Nie masz jeszcze żadnych zamówień do obsługi.'}
            </p>
            <Button 
              variant="default" 
              onClick={() => navigate('/marketplace')}
            >
              {mode === 'buyer' ? 'Przeglądaj produkty' : 'Wróć do panelu sprzedawcy'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.order_id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={order.product_image || '/placeholder.svg'} 
                        alt={order.product_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{order.product_title}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {mode === 'buyer' ? (
                          <>Sprzedawca: {order.seller_name}</>
                        ) : (
                          <>Kupujący: {order.buyer_name}</>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Zamówienie z: {new Date(order.created_at).toLocaleDateString('pl-PL')}
                      </p>
                      <p className="font-medium mt-1">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/order-details/${order.order_id}`)}
                    >
                      Szczegóły
                    </Button>
                    {renderOrderActions(order)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
