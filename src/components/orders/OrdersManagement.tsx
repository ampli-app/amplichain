
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/orders/OrderCard';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

export function OrdersManagement() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const { 
    isLoading, 
    orders, 
    fetchOrders, 
    updateOrderStatus, 
    getStatusTranslation,
    checkExpiredReservations
  } = useOrderManagement();

  useEffect(() => {
    fetchOrders(activeTab === 'buyer');
    
    // Częstsze sprawdzanie wygasłych zamówień - co 10 sekund
    const intervalId = setInterval(() => {
      console.log('Automatyczne sprawdzanie wygasłych rezerwacji...');
      checkExpiredReservations().then(() => {
        fetchOrders(activeTab === 'buyer');
      });
    }, 10000); // 10 sekund
    
    return () => clearInterval(intervalId);
  }, [activeTab]);

  const handleRefresh = () => {
    console.log('Ręczne odświeżenie i sprawdzenie wygasłych rezerwacji...');
    checkExpiredReservations().then(() => {
      fetchOrders(activeTab === 'buyer');
    });
  };

  const groupOrdersByStatus = () => {
    const grouped: Record<string, any[]> = {};
    
    orders.forEach(order => {
      if (!grouped[order.status]) {
        grouped[order.status] = [];
      }
      grouped[order.status].push(order);
    });
    
    return grouped;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie zamówieniami</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Odśwież</span>
        </Button>
      </div>
      
      <Tabs 
        defaultValue="buyer" 
        onValueChange={(value) => setActiveTab(value as 'buyer' | 'seller')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buyer">Moje zakupy</TabsTrigger>
          <TabsTrigger value="seller">Moja sprzedaż</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buyer" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupOrdersByStatus()).map(([status, statusOrders]) => (
                <div key={status} className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {getStatusTranslation(status)} ({statusOrders.length})
                  </h3>
                  <div className="grid gap-4 grid-cols-1">
                    {statusOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isBuyer={true}
                        onUpdateStatus={updateOrderStatus}
                        getStatusTranslation={getStatusTranslation}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Brak zamówień</h3>
              <p className="text-muted-foreground">
                Nie dokonałeś/aś jeszcze żadnych zakupów.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="seller" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupOrdersByStatus()).map(([status, statusOrders]) => (
                <div key={status} className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {getStatusTranslation(status)} ({statusOrders.length})
                  </h3>
                  <div className="grid gap-4 grid-cols-1">
                    {statusOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isBuyer={false}
                        onUpdateStatus={updateOrderStatus}
                        getStatusTranslation={getStatusTranslation}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Brak zamówień</h3>
              <p className="text-muted-foreground">
                Nie masz jeszcze żadnych zamówień do realizacji.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
