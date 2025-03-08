
import { ConsultationOrderCard } from './ConsultationOrderCard';
import { EmptyState } from './EmptyState';
import { ConsultationTabContentProps } from './types';

export const ConsultationTabContent = ({ 
  orders, 
  type,
  onAcceptOrder,
  onRejectOrder,
  onCompleteOrder,
  processingOrderId
}: ConsultationTabContentProps) => {
  
  if (orders.length === 0) {
    return <EmptyState type={type} />;
  }
  
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <ConsultationOrderCard 
          key={order.id} 
          order={order} 
          onAcceptOrder={onAcceptOrder}
          onRejectOrder={onRejectOrder}
          onCompleteOrder={onCompleteOrder}
          processingOrderId={processingOrderId}
        />
      ))}
    </div>
  );
};
