
export interface OrderReservationProps {
  productId: string;
  isTestMode?: boolean;
}

export interface ReservationData {
  id: string;
  created_at?: string;
  updated_at?: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  delivery_option_id?: string;
  price?: number;
  is_test_order?: boolean;
  is_reserved?: boolean;
  reservation_expires_at?: string;
  payment_deadline?: string;
  shipping_address?: string;
  shipping_method?: string;
  payment_method?: string;
  notes?: string;
  delivery_price?: number;
  discount_value?: number;
  discount_code?: string;
  service_fee?: number;
  product_price?: number;
  total_amount?: number;  // Dodajemy pole total_amount
}
