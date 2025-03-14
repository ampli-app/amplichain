
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

// Konfiguracja Stripe
export const STRIPE_CONFIG = {
  // Prawdziwy klucz publikowalny Stripe będzie używany w produkcji
  PUBLISHABLE_KEY: 'pk_test_51OaWwhC4y8MScIejYTOZKMw4VCGrEyEDhm7mz6EGcXdbdHj9Jm4JGrxzTRKQmv6SyYKbdGCYJIeJVFAzSzLcw8v600PbmyL765',
  // Waluta używana w płatnościach
  CURRENCY: 'pln',
  // Przyjmowane metody płatności
  PAYMENT_METHODS: ['card', 'p24', 'blik'],
  // Automatyczne przekierowanie po płatności
  AUTOMATIC_REDIRECT: true
};

// Mapowanie wewnętrznych metod płatności na metody Stripe
export const PAYMENT_METHOD_TO_STRIPE = {
  [PAYMENT_METHODS.CARD]: 'card',
  [PAYMENT_METHODS.BLIK]: 'blik',
  [PAYMENT_METHODS.P24]: 'p24'
};
