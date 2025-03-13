
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Obsługa zapytania OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Brak wymaganych zmiennych środowiskowych');
    return new Response(
      JSON.stringify({ error: 'Błąd konfiguracji serwera' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parsuj body
    const { action, data } = await req.json();
    
    // Obsługa różnych akcji
    if (action === 'create_payment') {
      const { orderId, amount, currency, description, email, name } = data;
      
      // Tworzenie PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        description,
        payment_method_types: ['card', 'p24', 'blik'],
        metadata: {
          order_id: orderId
        }
      });
      
      // Zapisz dane w bazie
      const { error } = await supabase
        .from('stripe_payments')
        .insert({
          order_id: orderId,
          payment_intent_id: paymentIntent.id,
          payment_intent_client_secret: paymentIntent.client_secret,
          payment_method: 'stripe',
          amount_total: amount,
          currency,
          customer_email: email,
          customer_name: name,
          status: paymentIntent.status
        });
      
      if (error) {
        console.error('Błąd zapisywania danych płatności:', error);
        return new Response(
          JSON.stringify({ error: 'Błąd zapisywania danych płatności' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: amount,
          currency: currency,
          status: paymentIntent.status
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (action === 'check_payment_status') {
      const { paymentIntentId } = data;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Aktualizuj status w bazie danych
      const { error } = await supabase
        .from('stripe_payments')
        .update({ status: paymentIntent.status, updated_at: new Date().toISOString() })
        .eq('payment_intent_id', paymentIntentId);
      
      if (error) {
        console.error('Błąd aktualizacji statusu płatności:', error);
      }
      
      return new Response(
        JSON.stringify({ 
          status: paymentIntent.status,
          payment_intent_id: paymentIntent.id
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (action === 'cancel_payment') {
      const { paymentIntentId } = data;
      
      await stripe.paymentIntents.cancel(paymentIntentId);
      
      const { error } = await supabase
        .from('stripe_payments')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('payment_intent_id', paymentIntentId);
      
      if (error) {
        console.error('Błąd anulowania płatności:', error);
        return new Response(
          JSON.stringify({ error: 'Błąd anulowania płatności' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, status: 'canceled' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Nieznana akcja' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error(`Błąd przetwarzania żądania:`, err);
    return new Response(
      JSON.stringify({ error: 'Błąd przetwarzania żądania', details: err.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
