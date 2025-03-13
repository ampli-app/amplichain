
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';
import { isValidUUID } from '@/utils/orderUtils';

interface CheckoutOrderInitializerProps {
  productId: string;
  isTestMode: boolean;
  product: any;
  orderInitialized: boolean;
  setOrderInitialized: (value: boolean) => void;
  setInitializing: (value: boolean) => void;
}

export function CheckoutOrderInitializer({
  productId,
  isTestMode,
  product,
  orderInitialized,
  setOrderInitialized,
  setInitializing
}: CheckoutOrderInitializerProps) {
  const { user } = useAuth();
  const [initializationAttempt, setInitializationAttempt] = useState(0);
  
  const {
    checkExpiredReservations,
    checkExistingReservation,
    cancelPreviousReservations,
    initiateOrder,
    reservationData
  } = useOrderReservation({ productId, isTestMode });

  // Efekt do inicjalizacji rezerwacji
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const handleReservation = async () => {
      if (!product || !user) {
        console.log("Brak produktu lub użytkownika, nie inicjuję rezerwacji");
        if (mounted) setInitializing(false);
        return;
      }
      
      // Jeśli inicjalizacja już się odbyła, nie rób nic
      if (orderInitialized) {
        console.log("Zamówienie już zainicjowane, pomijam inicjalizację");
        if (mounted) setInitializing(false);
        return;
      }

      // Jeśli istnieje reservationData, ale orderInitialized jest false
      if (reservationData && !orderInitialized) {
        console.log("Mamy dane rezerwacji, ale nie było ustawione orderInitialized - aktualizuję stan");
        if (mounted) {
          setOrderInitialized(true);
          setInitializing(false);
        }
        return;
      }
      
      console.log("CheckoutOrderInitializer: Inicjalizacja rezerwacji", { orderInitialized, productId });
      
      try {
        // Sprawdź wygasłe rezerwacje
        await checkExpiredReservations();
        
        // Sprawdź istniejącą rezerwację
        const existingReservation = await checkExistingReservation(productId);
        
        if (existingReservation && mounted) {
          console.log("Znaleziono istniejącą rezerwację:", existingReservation);
          if (mounted) {
            setOrderInitialized(true);
            setInitializing(false);
          }
          return;
        }
        
        if (mounted) {
          // Anuluj wszystkie poprzednie rezerwacje dla tego produktu
          await cancelPreviousReservations(productId);
          
          // Upewnijmy się, że przekazujemy owner_id jeśli nie ma user_id
          const productWithSeller = {
            ...product,
            user_id: product.user_id || product.owner_id
          };
          
          console.log("Inicjowanie zamówienia z produktem:", productWithSeller);
          const reservation = await initiateOrder(productWithSeller, isTestMode);
          
          if (reservation && mounted) {
            console.log("Rezerwacja utworzona pomyślnie:", reservation);
            setOrderInitialized(true);
          } else {
            console.error("Nie udało się utworzyć rezerwacji");
            if (initializationAttempt < 2) {
              // Spróbuj jeszcze raz po krótkim opóźnieniu
              setTimeout(() => {
                if (mounted) {
                  setInitializationAttempt(prev => prev + 1);
                }
              }, 1000);
            } else {
              toast({
                title: "Błąd rezerwacji",
                description: "Nie udało się utworzyć rezerwacji po kilku próbach. Spróbuj ponownie później.",
                variant: "destructive",
              });
            }
          }
          
          // Zawsze ustaw setInitializing(false) po próbie rezerwacji, niezależnie od wyniku
          if (mounted) setInitializing(false);
        }
      } catch (error) {
        console.error("Błąd podczas inicjalizacji rezerwacji:", error);
        if (mounted) {
          toast({
            title: "Błąd rezerwacji",
            description: "Wystąpił problem podczas inicjalizacji rezerwacji produktu.",
            variant: "destructive",
          });
          setInitializing(false);
        }
      }
    };
    
    // Uruchom inicjalizację z małym opóźnieniem, aby dać czas na załadowanie UI
    timeoutId = setTimeout(() => {
      handleReservation();
    }, 100);
    
    // Dodajmy dodatkowy timeout, który zawsze zakończy stan ładowania 
    // po 3 sekundach, aby nie dopuścić do zawieszenia interfejsu
    const safetyTimeoutId = setTimeout(() => {
      if (mounted && !orderInitialized) {
        console.log("Timeout bezpieczeństwa - kończę inicjalizację");
        setInitializing(false);
      }
    }, 3000);
    
    // Regularnie sprawdzaj wygasłe rezerwacje
    const intervalId = setInterval(() => {
      if (user && productId && isValidUUID(productId)) {
        checkExpiredReservations();
      }
    }, 30000);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeoutId);
      clearInterval(intervalId);
    };
  }, [product, user, productId, orderInitialized, checkExpiredReservations, checkExistingReservation, cancelPreviousReservations, initiateOrder, isTestMode, setOrderInitialized, setInitializing, initializationAttempt, reservationData]);

  return null;
}
