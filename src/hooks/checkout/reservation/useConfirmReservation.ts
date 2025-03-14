
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ReservationData } from './types';

export function useConfirmReservation({
  reservationData,
  reservationExpiresAt,
  setReservationData,
  setPaymentDeadline,
  setIsLoading
}: {
  reservationData: ReservationData | null;
  reservationExpiresAt: Date | null;
  setReservationData: (data: ReservationData | null) => void;
  setPaymentDeadline: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
}) {

  const confirmOrder = async (formData: any) => {
    if (!reservationData || !reservationData.id) {
      toast({
        title: "Błąd",
        description: "Brak aktywnej rezerwacji do potwierdzenia.",
        variant: "destructive",
      });
      return false;
    }
    
    const now = new Date();
    if (reservationExpiresAt && reservationExpiresAt < now) {
      toast({
        title: "Rezerwacja wygasła",
        description: "Czas na wypełnienie formularza upłynął. Rozpocznij proces od nowa.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const paymentDeadlineDate = new Date();
      paymentDeadlineDate.setHours(paymentDeadlineDate.getHours() + 24);
      
      // Definiujemy typ dla danych aktualizacji - rozszerzony o nowe pola
      interface UpdateData {
        status: string;
        payment_deadline: string;
        shipping_address: string;
        shipping_method: string;
        payment_method: string | null;
        notes: string | null;
        delivery_price?: number;
        discount_value?: number;
        discount_code?: string | null;
        service_fee?: number;
        product_price?: number;
        discount_code_id?: string | null;
      }
      
      // Przygotowanie danych do aktualizacji, zawierających wszystkie istotne informacje
      const updateData: UpdateData = {
        status: 'awaiting_payment',
        payment_deadline: paymentDeadlineDate.toISOString(),
        shipping_address: `${formData.address}, ${formData.postalCode} ${formData.city}`,
        shipping_method: formData.deliveryMethod || reservationData.delivery_option_id,
        payment_method: formData.paymentMethod || null,
        notes: formData.comments || null
      };
      
      // Sprawdzamy czy dane faktycznie istnieją zanim je dodamy do updateData
      if (formData.deliveryPrice !== undefined) {
        updateData.delivery_price = parseFloat(formData.deliveryPrice);
      }
      
      if (formData.discount !== undefined) {
        updateData.discount_value = parseFloat(formData.discount);
        updateData.discount_code = formData.discountCode || null;
      }
      
      if (formData.serviceFee !== undefined) {
        updateData.service_fee = parseFloat(formData.serviceFee);
      }
      
      if (formData.productPrice !== undefined) {
        updateData.product_price = parseFloat(formData.productPrice);
      }
      
      if (formData.discountCodeId !== undefined) {
        updateData.discount_code_id = formData.discountCodeId;
      }
      
      console.log('Aktualizacja zamówienia z danymi:', updateData);
      
      const { error } = await supabase
        .from('product_orders')
        .update(updateData)
        .eq('id', reservationData.id);
      
      if (error) {
        console.error('Błąd podczas potwierdzania zamówienia:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się potwierdzić zamówienia: " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      setPaymentDeadline(paymentDeadlineDate);
      setReservationData({
        ...reservationData,
        status: 'awaiting_payment',
        payment_deadline: paymentDeadlineDate.toISOString()
      });
      
      toast({
        title: "Zamówienie potwierdzone",
        description: "Masz 24 godziny na dokonanie płatności.",
      });
      
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas potwierdzania zamówienia:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas potwierdzania zamówienia.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    confirmOrder
  };
}
