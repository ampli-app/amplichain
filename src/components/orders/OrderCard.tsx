
import { useState } from 'react';
import { Order, OrderStatusUpdate } from '@/hooks/useOrderManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Box,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderCardProps {
  order: Order;
  isBuyer: boolean;
  onUpdateStatus: (update: OrderStatusUpdate) => Promise<boolean>;
  getStatusTranslation: (status: string) => string;
}

export function OrderCard({ 
  order, 
  isBuyer, 
  onUpdateStatus,
  getStatusTranslation
}: OrderCardProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status: string): string => {
    const statusColorMap: Record<string, string> = {
      'oczekujące': 'bg-orange-500',
      'zaakceptowane': 'bg-blue-500',
      'przygotowane_do_wysyłki': 'bg-purple-500',
      'wysłane': 'bg-indigo-500',
      'dostarczone': 'bg-green-500',
      'anulowane': 'bg-red-500',
      'reservation_expired': 'bg-gray-500'  // Dodany nowy status w kolorze szarym
    };
    
    return statusColorMap[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'oczekujące':
        return <Package className="h-4 w-4" />;
      case 'zaakceptowane':
        return <CheckCircle className="h-4 w-4" />;
      case 'przygotowane_do_wysyłki':
        return <Box className="h-4 w-4" />;
      case 'wysłane':
        return <Truck className="h-4 w-4" />;
      case 'dostarczone':
        return <CheckCircle className="h-4 w-4" />;
      case 'anulowane':
        return <XCircle className="h-4 w-4" />;
      case 'reservation_expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setIsUpdating(true);
    
    try {
      await onUpdateStatus({
        status,
        orderId: order.id,
        trackingNumber: status === 'wysłane' ? trackingNumber : undefined,
        notes: notes || undefined
      });
      
      // Resetujemy pola po aktualizacji
      setTrackingNumber('');
      setNotes('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContinueCheckout = () => {
    const mode = order.order_type === 'test' ? 'test' : 'buy';
    navigate(`/checkout/${order.product_id}?mode=${mode}`);
  };

  const isReservationExpired = order.status === 'reservation_expired';
  const isWaitingForPayment = order.status === 'oczekujące';

  const renderSellerActions = () => {
    if (order.status === 'oczekujące') {
      return (
        <div className="space-y-4">
          <Textarea
            placeholder="Dodatkowe informacje (opcjonalne)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleUpdateStatus('zaakceptowane')}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Zaakceptuj zamówienie
            </Button>
            <Button
              onClick={() => handleUpdateStatus('anulowane')}
              variant="destructive"
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Anuluj zamówienie
            </Button>
          </div>
        </div>
      );
    }
    
    if (order.status === 'zaakceptowane') {
      return (
        <div className="space-y-4">
          <Textarea
            placeholder="Dodatkowe informacje (opcjonalne)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            onClick={() => handleUpdateStatus('przygotowane_do_wysyłki')}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Przygotuj do wysyłki
          </Button>
        </div>
      );
    }
    
    if (order.status === 'przygotowane_do_wysyłki') {
      return (
        <div className="space-y-4">
          <Input
            placeholder="Numer przesyłki (opcjonalnie)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Textarea
            placeholder="Dodatkowe informacje (opcjonalne)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            onClick={() => handleUpdateStatus('wysłane')}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Oznacz jako wysłane
          </Button>
        </div>
      );
    }
    
    return null;
  };

  const renderBuyerActions = () => {
    if (isWaitingForPayment && !isReservationExpired) {
      // Jeśli zamówienie czeka na płatność i nie wygasło
      return (
        <div className="space-y-4">
          <Button
            onClick={handleContinueCheckout}
            disabled={isUpdating}
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Dokończ zakup
          </Button>
        </div>
      );
    }

    if (order.status === 'wysłane') {
      return (
        <div className="space-y-4">
          <Button
            onClick={() => handleUpdateStatus('dostarczone')}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Potwierdź odbiór przesyłki
          </Button>
        </div>
      );
    }
    
    return null;
  };

  const renderReservationExpiryInfo = () => {
    if (order.reservation_expires_at && order.status === 'oczekujące') {
      const expiryDate = new Date(order.reservation_expires_at);
      const now = new Date();
      const isExpired = expiryDate < now;
      
      return (
        <div className={`text-sm mt-2 ${isExpired ? "text-red-500" : "text-amber-600"}`}>
          {isExpired ? 
            "Czas na opłacenie zamówienia upłynął" : 
            `Czas na opłacenie: ${expiryDate.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'numeric'
            })}`
          }
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <img
            src={order.product_image || '/placeholder.svg'}
            alt={order.product_title}
            className="h-10 w-10 rounded object-cover mr-3"
          />
          <div>
            <h3 className="font-semibold text-lg">{order.product_title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{getStatusTranslation(order.status)}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('pl-PL')}
              </span>
            </div>
            {renderReservationExpiryInfo()}
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">{formatCurrency(order.total_amount)}</p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="grid gap-2 text-sm">
          {order.tracking_number && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Numer przesyłki:</span>
              <span>{order.tracking_number}</span>
            </div>
          )}
          
          {order.notes && (
            <div className="mt-2">
              <span className="text-muted-foreground block mb-1">Notatki:</span>
              <p className="text-sm bg-muted/50 p-2 rounded">{order.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {isBuyer ? renderBuyerActions() : renderSellerActions()}
      </CardFooter>
    </Card>
  );
}
