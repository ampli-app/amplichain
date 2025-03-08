
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { TabCount } from './TabCount';
import { ConsultationTabContent } from './ConsultationTabContent';
import { useExpertConsultations } from './useExpertConsultations';
import { TabType } from './types';

export function ExpertConsultationsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  
  const {
    orders,
    loading,
    processingOrderId,
    handleAcceptOrder,
    handleRejectOrder,
    handleCompleteOrder,
    filterOrdersByStatus
  } = useExpertConsultations();

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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Oczekujące
            <TabCount count={filterOrdersByStatus('pending').length} />
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktywne
            <TabCount count={filterOrdersByStatus('active').length} />
          </TabsTrigger>
          <TabsTrigger value="completed">
            Zakończone
            <TabCount count={filterOrdersByStatus('completed').length} />
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Odrzucone
            <TabCount count={filterOrdersByStatus('rejected').length} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('pending')} 
            type="pending"
            onAcceptOrder={handleAcceptOrder}
            onRejectOrder={handleRejectOrder}
            processingOrderId={processingOrderId}
          />
        </TabsContent>

        <TabsContent value="active">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('active')} 
            type="active"
            onCompleteOrder={handleCompleteOrder}
            processingOrderId={processingOrderId}
          />
        </TabsContent>

        <TabsContent value="completed">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('completed')} 
            type="completed"
            processingOrderId={processingOrderId}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <ConsultationTabContent 
            orders={filterOrdersByStatus('rejected')} 
            type="rejected"
            processingOrderId={processingOrderId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
