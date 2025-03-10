
import { CheckoutStep } from '@/hooks/checkout/useCheckout';
import { Check } from 'lucide-react';

interface CheckoutProgressProps {
  activeStep: CheckoutStep;
}

export function CheckoutProgress({ activeStep }: CheckoutProgressProps) {
  const steps = [
    { id: 'personal' as const, label: 'Dane osobowe' },
    { id: 'delivery' as const, label: 'Dostawa' },
    { id: 'payment' as const, label: 'Płatność' },
    { id: 'summary' as const, label: 'Podsumowanie' }
  ];

  return (
    <div className="mb-10 px-4">
      <div className="relative">
        {/* Linia postępu */}
        <div className="absolute inset-0 flex items-center">
          <div className="h-1 w-full mx-auto bg-muted"></div>
        </div>
        
        {/* Kroki */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = activeStep === step.id;
            const isCompleted = steps.findIndex(s => s.id === activeStep) > index;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                    isActive || isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={`mt-2 text-xs sm:text-sm ${
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
