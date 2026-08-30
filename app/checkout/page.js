'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { getCart, createOrder, getCurrentUser } from '@/services/storeService';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';

const SUPABASE_INTENT_URL =
  'https://zofzrpigxontxfoedazx.supabase.co/functions/v1/create-unified-payment-intent-index-ts';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stripeObj, setStripeObj] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakeGooglePay, setCanMakeGooglePay] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [activeOrderNumber, setActiveOrderNumber] = useState(null);
  const [elements, setElements] = useState(null);
  const cardElementMountRef = useRef(null);
  const router = useRouter();

  const [form, setForm] = useState({
    name: 'Athlete Customer',
    email: 'athlete@ulixies.com',
    address: 'KN 4 Ave, Kigali',
    city: 'Kigali',
    postalCode: '00000',
    shippingSpeed: 'standard',
  });

  const itemsList = cart?.items || [];
  const subtotal = itemsList.reduce((acc, item) => {
    const price =
      item.product_variants?.price_override ??
      item.product_variants?.products?.sale_price ??
      item.product_variants?.products?.base_price ??
      0;
    return acc + price * item.quantity;
  }, 0);

  const displaySubtotal = subtotal > 0 ? subtotal : 165.0;
  const shippingCost = form.shippingSpeed === 'express' ? 15 : 0;
  const finalTotal = displaySubtotal + shippingCost;

  // 1. Initial Load: Load Cart & Fetch Dynamic Stripe Session from Supabase Secrets
  useEffect(() => {
    async function initCheckout() {
      try {
        const data = await getCart();
        setCart(data || { items: [] });
        const user = await getCurrentUser();
        if (user) {
          setForm((prev) => ({
            ...prev,
            email: user.email || prev.email,
            name: user.user_metadata?.full_name || prev.name
          }));
        }

        const generatedOrderNumber = `ULX-${Date.now().toString().slice(-6)}`;
        setActiveOrderNumber(generatedOrderNumber);

        // Fetch intent & publishableKey dynamically from Supabase Secrets
        const res = await fetch(SUPABASE_INTENT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'usd',
            order_number: generatedOrderNumber,
            customer_email: form.email
          })
        });

        const intentData = await res.json();
        if (intentData.error) throw new Error(intentData.error);

        setClientSecret(intentData.clientSecret);

        // Initialize Stripe instance with the publishable key returned from backend
        const stripe = await loadStripe(intentData.publishableKey);
        setStripeObj(stripe);

        if (stripe) {
          // Initialize Stripe Elements
          const elems = stripe.elements({ clientSecret: intentData.clientSecret });
          setElements(elems);

          // Configure Stripe-Managed Payment Request (Google Pay / Wallets)
          const pr = stripe.paymentRequest({
            country: 'US',
            currency: 'usd',
            total: {
              label: 'ULIXIES ATHLETE CORP',
              amount: Math.round(finalTotal * 100),
            },
            requestPayerName: true,
            requestPayerEmail: true,
            requestShipping: false,
          });

          const result = await pr.canMakePayment();
          if (result) {
            setPaymentRequest(pr);
            setCanMakeGooglePay(true);

            pr.on('paymentmethod', async (ev) => {
              const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                intentData.clientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
              );

              if (confirmError) {
                ev.complete('fail');
                alert(`Payment Failed: ${confirmError.message}`);
              } else {
                ev.complete('success');
                if (paymentIntent.status === 'requires_action') {
                  await stripe.confirmCardPayment(intentData.clientSecret);
                }
                await handleOrderSuccess(generatedOrderNumber, 'Google Pay');
              }
            });
          }
        }
      } catch (err) {
        console.error('Checkout initialization failed:', err);
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [finalTotal]);

  // Mount Stripe Card Payment Element when elements is ready
  useEffect(() => {
    if (elements && cardElementMountRef.current) {
      cardElementMountRef.current.innerHTML = '';
      const paymentElement = elements.create('payment');
      paymentElement.mount(cardElementMountRef.current);
    }
  }, [elements]);

  const handleOrderSuccess = async (orderNum, method) => {
    setSubmitting(true);
    try {
      await createOrder({
        order_number: orderNum,
        customer: {
          recipient_name: form.name,
          email: form.email,
          street: form.address,
          city: form.city,
          postal_code: form.postalCode
        },
        items: itemsList,
        total: finalTotal,
        subtotal: displaySubtotal,
        shippingCost: shippingCost,
        shippingSpeed: form.shippingSpeed === 'express' ? 'Express Delivery' : 'Standard Delivery'
      });
      router.push('/orders');
    } catch (err) {
      alert(`Order saving failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStandardCardSubmit = async (e) => {
    e.preventDefault();
    if (!stripeObj || !elements || !clientSecret) return;

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripeObj.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
          receipt_email: form.email,
        },
        redirect: 'if_required',
      });

      if (error) {
        alert(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await handleOrderSuccess(activeOrderNumber, 'Card');
      }
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerGooglePay = () => {
    if (paymentRequest) {
      paymentRequest.show();
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center font-mono text-xs uppercase tracking-widest text-gray-500">
        INITIALIZING SECURE STRIPE GATEWAY...
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* CONTACT & SHIPPING FORM */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">1. Contact & Shipping Details</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">2. Delivery Speed</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, shippingSpeed: 'standard' })}
                className={`p-4 rounded border flex flex-col text-left transition-all ${
                  form.shippingSpeed === 'standard' ? 'border-2 border-black bg-[#F5F5F5]' : 'border-[#E5E5E5]'
                }`}
              >
                <span className="font-bold text-xs">Standard Delivery</span>
                <span className="text-xs text-gray-500 font-mono">Free</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, shippingSpeed: 'express' })}
                className={`p-4 rounded border flex flex-col text-left transition-all ${
                  form.shippingSpeed === 'express' ? 'border-2 border-black bg-[#F5F5F5]' : 'border-[#E5E5E5]'
                }`}
              >
                <span className="font-bold text-xs">Express Delivery</span>
                <span className="text-xs text-gray-500 font-mono">+$15.00</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">3. Payment Authorization</h2>

            {/* Official Google Pay Button (Auto-rendered through Stripe Engine) */}
            {canMakeGooglePay && (
              <button
                type="button"
                onClick={triggerGooglePay}
                disabled={submitting}
                className="w-full py-4 bg-black text-white rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.99] transition-all shadow-lg mb-4 cursor-pointer"
              >
                <span className="text-xs font-bold uppercase tracking-wider">Pay with</span>
                <span className="text-base font-black tracking-tighter">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                  <span className="text-white ml-1 font-sans">Pay</span>
                </span>
              </button>
            )}

            {/* Stripe Card Payment Container */}
            <form onSubmit={handleStandardCardSubmit} className="space-y-4">
              <div className="p-4 bg-gray-50 border rounded-2xl">
                <div ref={cardElementMountRef} id="payment-element" />
              </div>

              <button
                type="submit"
                disabled={submitting || !stripeObj}
                className="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {submitting ? 'AUTHORIZING TRANSACTION...' : `PAY $${finalTotal.toFixed(2)}`}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono mt-3">
              <Lock className="w-3 h-3 text-green-600" /> End-to-End Encrypted by Stripe Gateway
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:col-span-5 bg-[#F5F5F5] p-6 rounded-2xl border border-[#E5E5E5] h-fit space-y-4">
          <h3 className="font-bold uppercase tracking-wider text-sm mb-2">Order Summary</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {itemsList.length > 0 ? (
              itemsList.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">{item.product_variants?.products?.name || 'Athletic Gear'}</p>
                    <p className="text-gray-500 font-mono">
                      Size: {item.product_variants?.size || 'OS'} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold">
                    $
                    {(
                      (item.product_variants?.price_override ??
                        item.product_variants?.products?.sale_price ??
                        item.product_variants?.products?.base_price ??
                        165) * item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold">Air Max Pulse 26</p>
                  <p className="text-gray-500 font-mono">Size: US 10 x 1</p>
                </div>
                <span className="font-mono font-bold">$165.00</span>
              </div>
            )}
          </div>

          <div className="border-t border-[#E5E5E5] pt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-mono font-bold">${displaySubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-mono font-bold">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#E5E5E5]">
              <span>Total</span>
              <span className="font-mono">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}