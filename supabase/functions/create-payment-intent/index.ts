
// Follow this setup guide to integrate the Deno runtime and the Stripe SDK in edge functions:
// https://github.com/stripe/stripe-deno

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
    const { amount, currency = 'pln', metadata = {}, orderId } = await req.json()
    
    console.log(`Tworzenie intencji płatności dla zamówienia ${orderId}: ${amount} ${currency}`)
    console.log('Używany klucz Stripe:', stripeSecretKey.substring(0, 8) + '...')
    
    if (!amount || amount <= 0) {
      throw new Error('Nieprawidłowa kwota płatności')
    }
    
    // Metadane do później identyfikacji płatności
    const paymentMetadata = {
      ...metadata,
      order_id: orderId || 'unknown'
    }
    
    // Tworzenie intencji płatności w Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe wymaga kwoty w najmniejszej jednostce waluty (grosze)
        currency: currency,
        metadata: paymentMetadata,
        payment_method_types: ['card'],
      })
      
      console.log(`Utworzono intencję płatności: ${paymentIntent.id}`)
      
      // Zwracamy dane intencji płatności
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: amount,
          currency: currency
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    } catch (stripeError) {
      console.error('Błąd Stripe podczas tworzenia intencji płatności:', stripeError)
      return new Response(
        JSON.stringify({
          error: `Błąd Stripe: ${stripeError.message}`,
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
  } catch (error) {
    console.error('Błąd podczas tworzenia intencji płatności:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Wystąpił błąd podczas przetwarzania płatności',
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
