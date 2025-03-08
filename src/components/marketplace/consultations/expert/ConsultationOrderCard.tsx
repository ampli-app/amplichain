
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, User, X, Check, MessageSquare, Video, Phone, ExternalLink } from 'lucide-react';
import { ConsultationOrderCardProps } from './types';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export const ConsultationOrderCard = ({ 
  order, 
  onAcceptOrder, 
  onRejectOrder, 
  onCompleteOrder,
  processingOrderId 
}: ConsultationOrderCardProps) => {
  const navigate = useNavigate();

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

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const renderPendingActions = () => {
    if (!onAcceptOrder || !onRejectOrder) return null;
    
    return (
      <div className="flex gap-2 mt-4 justify-end">
        <Button
          variant="outline"
          onClick={() => onRejectOrder(order.id)}
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
          onClick={() => onAcceptOrder(order.id)}
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
    );
  };

  const renderActiveActions = () => {
    if (!onCompleteOrder) return null;
    
    return (
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
          onClick={() => onCompleteOrder(order.id)}
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
    );
  };

  const renderCompletedActions = () => {
    return (
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
    );
  };

  const renderCardContent = () => {
    return (
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
          
          {order.status === 'accepted' && order.expires_at && (
            <div className={`text-sm mt-2 ${isExpired(order.expires_at) ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
              {isExpired(order.expires_at)
                ? "Termin realizacji minął!"
                : `Termin realizacji: ${new Date(order.expires_at).toLocaleDateString()}`}
            </div>
          )}
          
          {order.status === 'completed' && order.completed_at && (
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
    );
  };

  return (
    <Card className={order.status === 'accepted' && isExpired(order.expires_at) ? "border-red-300" : ""}>
      <CardContent className="p-4">
        {renderCardContent()}
        
        {order.status === 'pending' && renderPendingActions()}
        {order.status === 'accepted' && !order.is_completed && renderActiveActions()}
        {(order.status === 'completed' || order.is_completed) && renderCompletedActions()}
      </CardContent>
    </Card>
  );
};
