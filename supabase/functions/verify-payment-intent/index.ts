
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Obsługa CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Pobierz STRIPE_SECRET_KEY z zmiennych środowiskowych
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('Brak klucza STRIPE_SECRET_KEY w zmiennych środowiskowych')
      throw new Error('Brak klucza STRIPE_SECRET_KEY w zmiennych środowiskowych')
    }
    
    // Inicjalizacja klienta Stripe z kluczem tajnym
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })
    
    // Parsowanie danych żądania
    const { paymentIntentId } = await req.json()
    
    if (!paymentIntentId) {
      throw new Error('Brak identyfikatora intencji płatności')
    }
    
    console.log(`Weryfikacja intencji płatności: ${paymentIntentId}`)
    console.log('Używany klucz Stripe:', stripeSecretKey.substring(0, 8) + '...')
    
    // Pobierz status intencji płatności ze Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    console.log(`Status intencji płatności ${paymentIntentId}: ${paymentIntent.status}`)
    
    // Zwracamy dane statusu płatności
    return new Response(
      JSON.stringify({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Konwersja z "centów" na główną jednostkę waluty
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Błąd podczas weryfikacji intencji płatności:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Wystąpił błąd podczas weryfikacji płatności',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})
