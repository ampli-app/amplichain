
import { useState } from 'react';

export function usePaymentSimulation() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const simulatePaymentProcessing = (callback: (success: boolean) => void) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      // W prawdziwym systemie, tutaj byśmy użyli Stripe do przetworzenia płatności
      // Dla celów demonstracyjnych zawsze zwracamy sukces
      const success = true;
      
      callback(success);
    }, 2000);
  };

  return {
    isProcessing,
    setIsProcessing,
    simulatePaymentProcessing
  };
}
