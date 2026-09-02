// supabase/functions/create-unified-payment-intent/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");

    if (!stripeSecretKey || !stripePublishableKey) {
      throw new Error("Missing Stripe keys in Supabase secrets.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { amount, currency = "usd", order_number, customer_email, paymentIntentId } = await req.json();

    if (!amount || isNaN(Number(amount))) {
      throw new Error("Valid order amount is required.");
    }

    const amountInCents = Math.round(Number(amount) * 100);

    // If we're already tracking a PaymentIntent for this checkout session, update its
    // amount in place instead of creating a new one. Creating a fresh PaymentIntent every
    // time the total changes (shipping speed, coupon) orphans the old one, forces the
    // client to remount Payment Element (wiping anything typed), and risks the browser
    // confirming a stale amount if it still holds an old clientSecret.
    let paymentIntent;
    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: amountInCents,
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true }, // Serves Google Pay, Apple Pay & Cards automatically
        metadata: {
          order_number: order_number || "N/A",
          customer_email: customer_email || "athlete@ulixies.com",
        },
      });
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        publishableKey: stripePublishableKey,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
