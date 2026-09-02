// supabase/functions/verify-stripe-payment/index.ts
//
// NOT CALLED FROM ANYWHERE IN THE APP (checked: no reference to
// "verify-stripe-payment" in app/ or services/). Saved here only so it's tracked
// in version control instead of living solely in the Supabase dashboard.
//
// If this is ever wired up, note it writes payments rows keyed by
// `order_number`, while payment-webhook-listener writes them keyed by
// `order_id` — those need to be reconciled to the real `payments` table
// schema before this is used, or it will either fail on missing columns or
// create a second, disconnected trail of payment records.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing server environment secrets.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { paymentIntentId, order_number } = await req.json();

    if (!paymentIntentId) {
      throw new Error("PaymentIntent ID is required.");
    }

    // Verify status directly with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === "succeeded") {
      const orderNum = order_number || intent.metadata?.order_number;

      if (orderNum) {
        // 1. Mark Order as Paid in database
        await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "processing" })
          .eq("order_number", orderNum);

        // 2. Add audit trail entry in payments table
        await supabase.from("payments").upsert({
          order_number: orderNum,
          amount: intent.amount / 100,
          currency: intent.currency.toUpperCase(),
          gateway: intent.payment_method_types?.[0] || "google_pay",
          transaction_id: intent.id,
          status: "succeeded",
        }, { onConflict: "transaction_id" });
      }

      return new Response(
        JSON.stringify({ success: true, status: "paid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, status: intent.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
