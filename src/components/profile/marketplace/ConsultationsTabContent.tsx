
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsultationCard } from '@/components/marketplace/consultations/ConsultationCard';
import { ExpertConsultationsPanel } from '@/components/marketplace/consultations/expert/ExpertConsultationsPanel';
import { MarketplaceEmptyState } from './MarketplaceEmptyState';
import { EditConsultationDialog } from '@/components/EditConsultationDialog';
import { Consultation } from '@/types/consultations';

interface ConsultationsTabContentProps {
  consultations: any[];
  activeConsultationsTab: string;
  setActiveConsultationsTab: (value: string) => void;
  onDelete: (id: string) => void;
  onAddConsultation: () => void;
}

export function ConsultationsTabContent({
  consultations,
  activeConsultationsTab,
  setActiveConsultationsTab,
  onDelete,
  onAddConsultation
}: ConsultationsTabContentProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const handleEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setEditDialogOpen(true);
  };

  return (
    <>
      <Tabs value={activeConsultationsTab} onValueChange={setActiveConsultationsTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="items">Moje oferty</TabsTrigger>
          <TabsTrigger value="orders">Panel eksperta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items">
          {consultations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultations.map(consultation => (
                <ConsultationCard 
                  key={consultation.id}
                  consultation={consultation} 
                  isFavorite={false}
                  isOwner={true}
                  onToggleFavorite={() => {}}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <MarketplaceEmptyState 
              message="Nie masz jeszcze żadnych konsultacji."
              buttonText="Dodaj pierwszą konsultację"
              onButtonClick={onAddConsultation}
            />
          )}
        </TabsContent>
        
        <TabsContent value="orders">
          <ExpertConsultationsPanel />
        </TabsContent>
      </Tabs>

      {/* Dialog edycji konsultacji */}
      <EditConsultationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        consultation={selectedConsultation}
      />
    </>
  );
}
