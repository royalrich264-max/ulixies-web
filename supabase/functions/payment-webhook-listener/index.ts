// supabase/functions/payment-webhook-listener/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!signature || !webhookSecret || !stripeSecretKey) {
    return new Response("Webhook secret or signature missing.", { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderNumber = intent.metadata?.order_number;

      if (orderNumber) {
        // 1. Fetch Order Record and Order Items
        const { data: order } = await supabase
          .from("orders")
          .select("id, status, payment_status, order_items(id, variant_id, quantity)")
          .eq("order_number", orderNumber)
          .single();

        if (order) {
          // Idempotency guard: Stripe delivers webhooks at-least-once and retries on
          // timeout/non-200, so this event can and will arrive more than once for the
          // same payment. Without this guard, reserved_stock below gets incremented
          // again on every retry and never released.
          if (order.payment_status === "paid") {
            return new Response(JSON.stringify({ received: true, alreadyProcessed: true }), {
              headers: { "Content-Type": "application/json" },
              status: 200,
            });
          }

          // 2. Advance Status to 'paid' (Stage 2)
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "paid"
            })
            .eq("id", order.id);

          // 3. Automatically Lock Inventory: Increment reserved_stock atomically
          // (a plain select-then-update here is a race condition under concurrent orders).
          if (order.order_items && order.order_items.length > 0) {
            for (const item of order.order_items) {
              if (item.variant_id) {
                await supabase.rpc("increment_reserved_stock", {
                  p_variant_id: item.variant_id,
                  p_qty: item.quantity || 1,
                });
              }
            }
          }

          // 4. Log Payment with order_id foreign key
          await supabase.from("payments").upsert({
            order_id: order.id,
            transaction_id: intent.id,
            amount: intent.amount / 100,
            currency: intent.currency.toUpperCase(),
            provider: "stripe",
            status: "succeeded",
          }, { onConflict: "transaction_id" });
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderNumber = intent.metadata?.order_number;

      if (orderNumber) {
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("order_number", orderNumber)
          .neq("payment_status", "paid");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
