
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useMarketplaceActions(userId: string) {
  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć produktu.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Produkt został usunięty.",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
        
      if (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć usługi.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Usługa została usunięta.",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  const handleDeleteConsultation = async (consultationId: string) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', consultationId);
        
      if (error) {
        console.error('Error deleting consultation:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć konsultacji.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Konsultacja została usunięta.",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  return {
    handleDeleteProduct,
    handleDeleteService,
    handleDeleteConsultation
  };
}
