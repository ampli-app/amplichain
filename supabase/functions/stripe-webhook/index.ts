
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: any;
  };
  type: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
  
  if (!STRIPE_SECRET_KEY) {
    console.error('Brak klucza API Stripe');
    return new Response(
      JSON.stringify({ error: 'Błąd konfiguracji - brak klucza API Stripe' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Metoda niedozwolona' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    
    let event: WebhookPayload;
    
    // Weryfikuj podpis Stripe jeśli mamy skonfigurowany webhook secret
    if (STRIPE_WEBHOOK_SECRET) {
      try {
        event = await stripe.webhooks.constructEvent(
          body,
          signature,
          STRIPE_WEBHOOK_SECRET
        ) as any;
      } catch (err) {
        console.error(`Błąd weryfikacji podpisu webhook: ${err.message}`);
        return new Response(
          JSON.stringify({ error: `Błąd weryfikacji podpisu webhook: ${err.message}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      // Dla celów testowych, jeśli nie skonfigurowano webhook secret
      event = JSON.parse(body);
      console.log('Webhook bez weryfikacji podpisu (tryb testowy)');
    }
    
    // Tworzymy klienta Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Zapisz wydarzenie webhook do bazy danych
    const { data, error } = await supabase
      .from('stripe_webhook_events')
      .insert([{
        id: event.id,
        api_version: event.api_version,
        data: event,
        created: new Date(event.created * 1000).toISOString(),
        processed: false,
      }]);
      
    if (error) {
      console.error('Błąd zapisywania webhook:', error);
      return new Response(
        JSON.stringify({ error: 'Błąd zapisu webhook', details: error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Webhook zapisany: ${event.type}`);
    
    // Przetwarzanie wydarzenia
    if (event.type.startsWith('payment_intent.')) {
      const paymentIntent = event.data.object;
      console.log(`Przetwarzanie PaymentIntent ID: ${paymentIntent.id}, Status: ${paymentIntent.status}`);
      
      // Znajdź i zaktualizuj odpowiednie dane płatności
      const { data: paymentData, error: paymentQueryError } = await supabase
        .from('stripe_payments')
        .select('order_id')
        .eq('payment_intent_id', paymentIntent.id)
        .limit(1);
      
      if (paymentQueryError) {
        console.error('Błąd podczas wyszukiwania płatności:', paymentQueryError);
      } else if (paymentData && paymentData.length > 0) {
        const orderId = paymentData[0].order_id;
        
        // Aktualizuj status płatności
        const { error: paymentUpdateError } = await supabase
          .from('stripe_payments')
          .update({ status: paymentIntent.status, updated_at: new Date().toISOString() })
          .eq('payment_intent_id', paymentIntent.id);
        
        if (paymentUpdateError) {
          console.error('Błąd podczas aktualizacji statusu płatności:', paymentUpdateError);
        } else {
          console.log(`Status płatności zaktualizowany: ${paymentIntent.status}`);
          
          // Aktualizuj status zamówienia na podstawie statusu płatności
          let orderStatus = '';
          let paymentStatus = '';
          
          if (paymentIntent.status === 'succeeded') {
            orderStatus = 'payment_succeeded';
            paymentStatus = 'paid';
            
            // Automatyczna zmiana statusu na zaakceptowane po udanej płatności
            setTimeout(async () => {
              const { error: acceptError } = await supabase
                .from('product_orders')
                .update({ 
                  status: 'zaakceptowane',
                  updated_at: new Date().toISOString()
                })
                .eq('id', orderId);
              
              if (acceptError) {
                console.error('Błąd podczas aktualizacji statusu zamówienia na zaakceptowane:', acceptError);
              } else {
                console.log(`Zamówienie ID ${orderId} automatycznie zaakceptowane`);
              }
            }, 1000); // Dajemy 1 sekundę na przetworzenie poprzedniej aktualizacji
          } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'payment_failed') {
            orderStatus = 'payment_failed';
            paymentStatus = 'failed';
          } else {
            orderStatus = 'pending_payment';
            paymentStatus = 'processing';
          }
          
          if (orderStatus) {
            const { error: orderUpdateError } = await supabase
              .from('product_orders')
              .update({ 
                status: orderStatus,
                payment_status: paymentStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
            
            if (orderUpdateError) {
              console.error('Błąd podczas aktualizacji statusu zamówienia:', orderUpdateError);
            } else {
              console.log(`Status zamówienia ID ${orderId} zaktualizowany na ${orderStatus}`);
            }
          }
        }
      } else {
        console.log(`Nie znaleziono płatności dla PaymentIntent ID: ${paymentIntent.id}`);
      }
    }
    
    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error(`Błąd przetwarzania webhook:`, err);
    return new Response(
      JSON.stringify({ error: 'Błąd przetwarzania webhook', details: err.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
