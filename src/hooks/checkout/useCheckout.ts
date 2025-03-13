
import { useState } from 'react';
import { FormData, CheckoutStep, UseCheckoutProps } from './types';
import { useProductFetch } from './useProductFetch';
import { useCheckoutValidation } from './useCheckoutValidation';
import { useDiscountHandler } from './useDiscountHandler';
import { usePaymentSimulation } from './usePaymentSimulation';
import { usePriceCalculator } from './usePriceCalculator';

export * from './types';
export { SERVICE_FEE_PERCENTAGE } from './usePriceCalculator';

export function useCheckout({ productId, isTestMode = false }: UseCheckoutProps) {
  // Form state
  const [activeStep, setActiveStep] = useState<CheckoutStep>('personal');
  const [paymentMethod, setPaymentMethod] = useState('blik');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    inpostPoint: '',
    comments: '',
    blikCode: '',
  });
  
  // Fetch product data and delivery options
  const productFetch = useProductFetch(productId);
  
  // Payment processing
  const payment = usePaymentSimulation();
  
  // Price calculator (depends on product and delivery)
  const priceCalculator = usePriceCalculator(
    productFetch.product,
    isTestMode,
    productFetch.selectedDeliveryOption,
    () => discountHandler.getDiscountAmount()
  );
  
  // Discount handler (depends on price calculator functions)
  const discountHandler = useDiscountHandler(
    priceCalculator.getPrice,
    priceCalculator.getDeliveryCost,
    priceCalculator.getServiceFee
  );
  
  // Form validation
  const validation = useCheckoutValidation();
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const goToNextStep = () => {
    const steps: CheckoutStep[] = ['personal', 'delivery', 'payment', 'summary'];
    const currentIndex = steps.findIndex(step => step === activeStep);
    if (currentIndex < steps.length - 1) {
      if (activeStep === 'personal') {
        if (!validation.validatePersonalData(formData)) return;
      } else if (activeStep === 'delivery') {
        if (!validation.validateDeliveryData(formData, productFetch.deliveryMethod, productFetch.selectedDeliveryOption)) return;
      } else if (activeStep === 'payment') {
        if (!validation.validatePaymentData(paymentMethod, formData)) return;
      }
      
      setActiveStep(steps[currentIndex + 1]);
    }
  };
  
  const goToPreviousStep = () => {
    const steps: CheckoutStep[] = ['personal', 'delivery', 'payment', 'summary'];
    const currentIndex = steps.findIndex(step => step === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };
  
  const validateForm = () => validation.validateForm(
    formData, 
    agreeToTerms, 
    productFetch.deliveryMethod, 
    productFetch.selectedDeliveryOption, 
    paymentMethod
  );
  
  return {
    // Product data
    isLoading: productFetch.isLoading,
    product: productFetch.product,
    deliveryOptions: productFetch.deliveryOptions,
    selectedDeliveryOption: productFetch.selectedDeliveryOption,
    getProductImageUrl: productFetch.getProductImageUrl,
    
    // Form state
    formData,
    setFormData,
    activeStep,
    setActiveStep,
    deliveryMethod: productFetch.deliveryMethod,
    paymentMethod,
    setPaymentMethod,
    agreeToTerms,
    setAgreeToTerms,
    
    // Handlers
    handleInputChange,
    handleDeliveryMethodChange: productFetch.handleDeliveryMethodChange,
    goToNextStep,
    goToPreviousStep,
    validateForm,
    
    // Discount
    discountCode: discountHandler.discountCode,
    setDiscountCode: discountHandler.setDiscountCode,
    discountApplied: discountHandler.discountApplied,
    handleApplyDiscount: discountHandler.handleApplyDiscount,
    removeDiscount: discountHandler.removeDiscount,
    getDiscountAmount: discountHandler.getDiscountAmount,
    
    // Pricing
    getPrice: priceCalculator.getPrice,
    getDeliveryCost: priceCalculator.getDeliveryCost,
    getServiceFee: priceCalculator.getServiceFee,
    getTotalCost: priceCalculator.getTotalCost,
    
    // Payment
    isProcessing: payment.isProcessing,
    setIsProcessing: payment.setIsProcessing,
    simulatePaymentProcessing: payment.simulatePaymentProcessing,
  };
}
