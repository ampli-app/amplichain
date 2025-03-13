
export interface OrderReservationProps {
  productId: string;
  isTestMode?: boolean;
}

export interface OrderData {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  reservation_expires_at?: string;
  product_id?: string;
  buyer_id?: string;
  seller_id?: string;
  total_amount?: number;
}

export interface PaymentIntentResponse {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status?: string;
}

export interface OrderDetails {
  address?: string;
  city?: string;
  postalCode?: string;
  comments?: string;
  paymentMethod: string;
}
