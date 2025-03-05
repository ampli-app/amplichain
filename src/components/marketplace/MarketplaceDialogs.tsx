
import { AddProductDialog } from '@/components/AddProductDialog';
import { AddServiceFormDialog } from '@/components/AddServiceFormDialog';
import { AddConsultationDialog } from '@/components/AddConsultationDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

interface MarketplaceDialogsProps {
  showAddProductDialog: boolean;
  setShowAddProductDialog: (show: boolean) => void;
  showAddServiceDialog: boolean;
  setShowAddServiceDialog: (show: boolean) => void;
  showAddConsultationDialog: boolean;
  setShowAddConsultationDialog: (show: boolean) => void;
  showAuthDialog: boolean;
  setShowAuthDialog: (show: boolean) => void;
}

export function MarketplaceDialogs({
  showAddProductDialog,
  setShowAddProductDialog,
  showAddServiceDialog,
  setShowAddServiceDialog,
  showAddConsultationDialog,
  setShowAddConsultationDialog,
  showAuthDialog,
  setShowAuthDialog
}: MarketplaceDialogsProps) {
  return (
    <>
      <AddProductDialog 
        open={showAddProductDialog} 
        onOpenChange={setShowAddProductDialog} 
      />
      
      <AddServiceFormDialog
        open={showAddServiceDialog}
        onOpenChange={setShowAddServiceDialog}
      />
      
      <AddConsultationDialog
        open={showAddConsultationDialog}
        onOpenChange={setShowAddConsultationDialog}
      />
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać produkt lub usługę do rynku, musisz być zalogowany."
      />
    </>
  );
}
