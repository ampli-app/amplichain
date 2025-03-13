
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('Brak klucza webhook secret Stripe');
    return new Response(
      JSON.stringify({ error: 'Błąd konfiguracji' }),
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
    
    const body = await req.text();
    
    // Normalnie należy zweryfikować podpis Stripe
    // const signature = req.headers.get('stripe-signature') || '';
    // const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    
    // Dla uproszczenia przyjmujemy dane bezpośrednio
    const event: WebhookPayload = JSON.parse(body);
    
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
        JSON.stringify({ error: 'Błąd zapisu webhook' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Webhook przetworzony: ${event.type}`);
    
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
      JSON.stringify({ error: 'Błąd przetwarzania webhook' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
