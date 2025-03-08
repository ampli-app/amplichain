
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ConsultationOrder } from '@/types/consultations';
import { Calendar, Check, Clock, ExternalLink, MessageSquare, Phone, User, Video, X } from 'lucide-react';
import { ConsultationOrderCardProps } from './types';

export const ConsultationOrderCard = ({ 
  order, 
  onCancelOrder,
  onConfirmConsultation,
  showActions = true
}: ConsultationOrderCardProps) => {
  
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

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Card key={order.id} className={isExpired(order.expires_at) ? "border-red-300" : ""}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{order.consultations?.title}</h3>
            <div className="flex items-center mt-1">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">
                {order.profiles?.full_name || 'Nieznany ekspert'}
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
        
        {showActions && (
          <>
            {order.status === 'pending_payment' && (
              <div className="flex gap-2 mt-4 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => onCancelOrder && onCancelOrder(order.id)}
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
                  onClick={() => onCancelOrder && onCancelOrder(order.id)}
                >
                  Anuluj rezerwację
                </Button>
              </div>
            )}
            
            {order.status === 'accepted' && !order.is_completed && (
              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={() => {
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
                  onClick={() => onConfirmConsultation && onConfirmConsultation(order.id)}
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
            )}
            
            {order.status === 'completed' && (
              <div className="flex flex-col gap-2 mt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
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
                    window.location.href = `/consultations/${order.consultation_id}`;
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Zobacz szczegóły konsultacji
                </Button>
              </div>
            )}
            
            {order.status === 'cancelled' || order.status === 'rejected' && (
              <Button 
                variant="ghost" 
                className="mt-4 text-muted-foreground w-full"
                onClick={() => {
                  window.location.href = `/consultations/${order.consultation_id}`;
                }}
              >
                Zarezerwuj ponownie
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
