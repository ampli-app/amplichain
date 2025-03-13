
export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  inpostPoint: string;
  comments: string;
  blikCode: string;
}

export type CheckoutStep = 'personal' | 'delivery' | 'payment' | 'summary';

export interface UseCheckoutProps {
  productId: string;
  isTestMode: boolean;
}

export interface DiscountData {
  id: string;
  code: string;
  type: string;
  value: number;
}
