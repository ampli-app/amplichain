
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useClientConsultations } from './useClientConsultations';
import { ConsultationTabContent } from './ConsultationTabContent';
import { TabCount } from './TabCount';
import { TabType } from './types';
import { useAuth } from '@/contexts/AuthContext';

export function ClientConsultationsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  
  const {
    orders,
    loading,
    handleConfirmConsultation,
    handleCancelOrder,
    filterOrdersByStatus
  } = useClientConsultations();

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
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Oczekujące
            <TabCount count={filterOrdersByStatus('pending').length} />
          </TabsTrigger>
          <TabsTrigger value="active">Aktywne</TabsTrigger>
          <TabsTrigger value="completed">Zakończone</TabsTrigger>
          <TabsTrigger value="cancelled">Anulowane</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('pending')}
            type="pending"
            onCancelOrder={handleCancelOrder}
            onConfirmConsultation={handleConfirmConsultation}
          />
        </TabsContent>
        
        <TabsContent value="active">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('active')}
            type="active"
            onCancelOrder={handleCancelOrder}
            onConfirmConsultation={handleConfirmConsultation}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('completed')}
            type="completed"
            onCancelOrder={handleCancelOrder}
            onConfirmConsultation={handleConfirmConsultation}
          />
        </TabsContent>
        
        <TabsContent value="cancelled">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('cancelled')}
            type="cancelled"
            onCancelOrder={handleCancelOrder}
            onConfirmConsultation={handleConfirmConsultation}
          />
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
