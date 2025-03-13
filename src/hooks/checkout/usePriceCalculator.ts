
export const SERVICE_FEE_PERCENTAGE = 0.015;

export function usePriceCalculator(
  product: any | null, 
  isTestMode: boolean, 
  selectedDeliveryOption: { price: number } | null,
  getDiscountAmount: () => number
) {
  const getPrice = () => isTestMode && product?.testing_price 
    ? parseFloat(product.testing_price) 
    : parseFloat(product?.price || 0);
  
  const getDeliveryCost = () => selectedDeliveryOption ? selectedDeliveryOption.price : 0;
  
  const getServiceFee = () => {
    const productPrice = getPrice();
    const deliveryCost = getDeliveryCost();
    const subtotal = productPrice + deliveryCost;
    
    return parseFloat((subtotal * SERVICE_FEE_PERCENTAGE).toFixed(2));
  };
  
  const getTotalCost = () => {
    const productPrice = getPrice();
    const deliveryCost = getDeliveryCost();
    const discountAmount = getDiscountAmount();
    const serviceFee = getServiceFee();
    
    return productPrice + deliveryCost - discountAmount + serviceFee;
  };

  return {
    getPrice,
    getDeliveryCost,
    getServiceFee,
    getTotalCost
  };
}
