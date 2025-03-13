
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';

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
  const [initAttempt, setInitAttempt] = useState(0);
  
  const {
    initiateOrder,
    checkExistingReservation,
    reservationData
  } = useOrderReservation({ productId, isTestMode });

  // Efekt do inicjalizacji rezerwacji
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const handleInitialization = async () => {
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
        // Sprawdź istniejącą rezerwację
        const existingReservation = await checkExistingReservation();
        
        if (existingReservation && mounted) {
          console.log("Znaleziono istniejącą rezerwację:", existingReservation);
          if (mounted) {
            setOrderInitialized(true);
            setInitializing(false);
          }
          return;
        }
        
        if (mounted) {
          console.log("Inicjowanie nowego zamówienia z produktem:", product);
          const reservation = await initiateOrder(product);
          
          if (reservation && mounted) {
            console.log("Rezerwacja utworzona pomyślnie:", reservation);
            toast({
              title: "Rezerwacja produktu",
              description: "Produkt został zarezerwowany na 10 minut. Dokończ zamówienie.",
            });
            setOrderInitialized(true);
          } else {
            console.error("Nie udało się utworzyć rezerwacji");
            if (initAttempt < 2) {
              // Spróbuj jeszcze raz po krótkim opóźnieniu
              setTimeout(() => {
                if (mounted) {
                  setInitAttempt(prev => prev + 1);
                }
              }, 1000);
            } else {
              toast({
                title: "Błąd rezerwacji",
                description: "Nie udało się utworzyć rezerwacji. Spróbuj ponownie później.",
                variant: "destructive",
              });
            }
          }
          
          // Zawsze ustaw setInitializing(false) po próbie rezerwacji
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
    
    // Uruchom inicjalizację z małym opóźnieniem
    timeoutId = setTimeout(() => {
      handleInitialization();
    }, 100);
    
    // Dodaj timeout bezpieczeństwa, który zakończy stan ładowania po 5 sekundach
    const safetyTimeoutId = setTimeout(() => {
      if (mounted && !orderInitialized) {
        console.log("Timeout bezpieczeństwa - kończę inicjalizację");
        setInitializing(false);
      }
    }, 5000);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeoutId);
    };
  }, [product, user, productId, orderInitialized, checkExistingReservation, initiateOrder, isTestMode, setOrderInitialized, setInitializing, initAttempt, reservationData]);

  return null;
}
