// supabase/functions/payment-webhook-listener/index.ts
//
// Imports Stripe and supabase-js via Deno's native `npm:` specifier rather than
// esm.sh — esm.sh's Deno-target bundle of Stripe pulls in a Node `process` polyfill
// that calls `Deno.core.runMicrotasks()`, which no longer exists on Supabase's
// current Deno 2.x edge runtime and crashes the whole request with an uncaught
// exception (surfaces as a bare 400 with no readable error). `npm:` specifiers use
// Deno's real Node-compat layer instead, which doesn't hit that broken path.
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.14.0";

// Every dashboard/log-navigation attempt to see this function's real error text has
// failed to surface it, so on any failure this writes straight into a table
// (webhook_debug_logs) that can be queried directly with the anon key — no Supabase
// dashboard required. Best-effort only: a logging failure must never break the response.
async function logDebug(supabase: any, stage: string, message: string, detail?: string) {
  try {
    await supabase.from("webhook_debug_logs").insert({
      source: "payment-webhook-listener",
      stage,
      message,
      detail: detail ? String(detail).slice(0, 4000) : null,
    });
  } catch (_e) {
    // ignore — logging must never mask or break the real response
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // A logging client only needs URL + service role — build it as early as possible so
  // even a missing-secret failure below gets recorded.
  const logSupabase = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null;

  if (!signature || !webhookSecret || !stripeSecretKey) {
    const missing = [
      !signature && "stripe-signature header",
      !webhookSecret && "STRIPE_WEBHOOK_SECRET env var",
      !stripeSecretKey && "STRIPE_SECRET_KEY env var",
    ].filter(Boolean).join(", ");
    if (logSupabase) await logDebug(logSupabase, "missing_config", `Missing: ${missing}`, null);
    return new Response("Webhook secret or signature missing.", { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Supabase URL or service role key missing.", { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const body = await req.text();

  try {
    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderNumber = intent.metadata?.order_number;

      if (!orderNumber) {
        await logDebug(supabase, "no_order_number", "payment_intent.succeeded had no metadata.order_number", JSON.stringify(intent.metadata));
      }

      if (orderNumber) {
        // 1. Fetch Order Record and Order Items
        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .select("id, status, payment_status, order_items(id, variant_id, quantity)")
          .eq("order_number", orderNumber)
          .single();

        if (orderErr) {
          await logDebug(supabase, "order_lookup_failed", orderErr.message, JSON.stringify({ orderNumber, orderErr }));
        }

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
          const { error: updateErr } = await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "paid"
            })
            .eq("id", order.id);

          if (updateErr) {
            await logDebug(supabase, "order_update_failed", updateErr.message, JSON.stringify({ orderId: order.id, updateErr }));
          }

          // 3. Automatically Lock Inventory: Increment reserved_stock atomically
          // (a plain select-then-update here is a race condition under concurrent orders).
          if (order.order_items && order.order_items.length > 0) {
            for (const item of order.order_items) {
              if (item.variant_id) {
                const { error: rpcErr } = await supabase.rpc("increment_reserved_stock", {
                  p_variant_id: item.variant_id,
                  p_qty: item.quantity || 1,
                });
                if (rpcErr) {
                  await logDebug(supabase, "increment_reserved_stock_failed", rpcErr.message, JSON.stringify({ variantId: item.variant_id, rpcErr }));
                }
              }
            }
          }

          // 4. Log Payment with order_id foreign key
          const { error: paymentErr } = await supabase.from("payments").upsert({
            order_id: order.id,
            transaction_id: intent.id,
            amount: intent.amount / 100,
            currency: intent.currency.toUpperCase(),
            provider: "stripe",
            status: "succeeded",
          }, { onConflict: "transaction_id" });

          if (paymentErr) {
            await logDebug(supabase, "payment_upsert_failed", paymentErr.message, JSON.stringify({ orderId: order.id, paymentErr }));
          }
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
    console.error("WEBHOOK_ERROR:", err.message, err.stack);
    await logDebug(supabase, "uncaught_exception", err.message, err.stack);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
