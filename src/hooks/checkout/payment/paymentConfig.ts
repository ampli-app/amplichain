
export const PAYMENT_PROVIDERS = {
  STRIPE: 'Stripe',
  PRZELEWY24: 'Przelewy24',
  BLIK: 'BLIK'
};

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
  REFUNDED: 'refunded',
  EXPIRED: 'expired'
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  BLIK: 'blik',
  P24: 'p24'
};

export const DEFAULT_PAYMENT_EXPIRY_MINUTES = 30;
