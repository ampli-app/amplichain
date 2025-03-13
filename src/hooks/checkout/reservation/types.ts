
// Types for reservation system
export interface OrderReservationProps {
  productId: string;
  isTestMode?: boolean;
}

export interface ReservationData {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  reservation_expires_at?: string;
  payment_deadline?: string;
  total_amount: number;
  delivery_option_id: string;
  order_type: string;
  payment_intent_id?: string;
  payment_method?: string;
  payment_status?: string;
  shipping_address?: string;
  shipping_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
