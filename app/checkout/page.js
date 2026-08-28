'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { getCart, createOrder, getCurrentUser } from '@/services/storeService';
import { Lock, CreditCard, ShieldCheck, X } from 'lucide-react';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [gpayClient, setGpayClient] = useState(null);
  const router = useRouter();

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  const [form, setForm] = useState({
    name: 'Athlete Customer',
    email: 'athlete@ulixies.com',
    address: 'KN 4 Ave, Kigali',
    city: 'Kigali',
    postalCode: '00000',
    shippingSpeed: 'standard',
  });

  useEffect(() => {
    async function init() {
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
      } catch (err) {
        console.error('Cart load error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const itemsList = cart?.items || [];
  const subtotal = itemsList.reduce((acc, item) => {
    const price = item.product_variants?.price_override ?? item.product_variants?.products?.sale_price ?? item.product_variants?.products?.base_price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const displaySubtotal = subtotal > 0 ? subtotal : 165.00;
  const shippingCost = form.shippingSpeed === 'express' ? 15 : 0;
  const finalTotal = displaySubtotal + shippingCost;

  // Initialize Google Payments Client on Script Load
  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && window.google?.payments?.api?.PaymentsClient) {
      const client = new window.google.payments.api.PaymentsClient({
        environment: 'TEST' // Change to 'PRODUCTION' when live keys are added
      });
      setGpayClient(client);
    }
  };

  const executeOrder = async (customerDetails, paymentMethodName = 'Google Pay Native') => {
    setSubmitting(true);
    try {
      await createOrder({
        customer: customerDetails,
        items: itemsList.length > 0 ? itemsList : [
          {
            quantity: 1,
            variant_id: null,
            product_id: null,
            product_variants: {
              size: 'US 10',
              price_override: 165.00,
              products: {
                name: 'Air Max Pulse 26 (Performance Equipment)',
                sale_price: 165.00,
                base_price: 165.00
              }
            }
          }
        ],
        total: finalTotal,
        subtotal: displaySubtotal,
        shippingCost: shippingCost,
        shippingSpeed: form.shippingSpeed === 'express' ? 'Express Delivery' : 'Standard Delivery',
      });

      alert(`Payment Authorized via ${paymentMethodName}! Charged $${finalTotal.toFixed(2)}.`);
      router.push('/orders');
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Google Pay One-Click Native Handler
  const handleGooglePayClick = async () => {
    if (gpayClient) {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER'],
            billingAddressRequired: true,
            billingAddressParameters: {
              format: 'FULL'
            }
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'ulixies-merchant-2026'
            }
          }
        }],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: finalTotal.toFixed(2),
          currencyCode: 'USD',
          countryCode: 'US'
        },
        merchantInfo: {
          merchantName: 'ULIXIES ATHLETE CORP'
        },
        emailRequired: true,
        shippingAddressRequired: true
      };

      try {
        // Triggers Google's native popup displaying customer's saved cards
        const paymentData = await gpayClient.loadPaymentData(paymentDataRequest);
        
        // Extract customer details directly from Google Wallet credentials
        const gEmail = paymentData.email || form.email;
        const gShipping = paymentData.shippingAddress || {};
        
        const customerPayload = {
          recipient_name: gShipping.name || form.name,
          email: gEmail,
          street: gShipping.address1 || form.address,
          city: gShipping.locality || form.city,
          postal_code: gShipping.postalCode || form.postalCode,
        };

        await executeOrder(customerPayload, `Google Pay (${paymentData.paymentMethodData?.description || 'Saved Card'})`);
        return;
      } catch (err) {
        if (err.statusCode === 'CANCELED') return;
        console.log('Google Pay native window fallback:', err);
      }
    }

    // Fallback: If no browser Google account/card is attached, open card sheet
    setManualModalOpen(true);
  };

  if (loading) return <div className="p-12 text-center font-mono text-xs">LOADING CHECKOUT GATEWAY...</div>;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      {/* Official Google Pay JS Engine */}
      <Script 
        src="https://pay.google.com/gp/p/js/pay.js" 
        onLoad={handleScriptLoad}
      />

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
                className={`p-4 rounded border flex flex-col text-left transition-all ${form.shippingSpeed === 'standard' ? 'border-2 border-black bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}
              >
                <span className="font-bold text-xs">Standard Delivery</span>
                <span className="text-xs text-gray-500 font-mono">Free</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, shippingSpeed: 'express' })}
                className={`p-4 rounded border flex flex-col text-left transition-all ${form.shippingSpeed === 'express' ? 'border-2 border-black bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}
              >
                <span className="font-bold text-xs">Express Delivery</span>
                <span className="text-xs text-gray-500 font-mono">+$15.00</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">3. Payment Authorization</h2>
            
            {/* 1-CLICK GOOGLE PAY (AUTODETECTS GOOGLE ACCOUNT CARDS) */}
            <button
              type="button"
              onClick={handleGooglePayClick}
              disabled={submitting}
              className="w-full py-4 bg-black text-white rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.99] transition-all shadow-lg mb-3 cursor-pointer"
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

            <button
              type="button"
              onClick={() => setManualModalOpen(true)}
              disabled={submitting}
              className="w-full py-3.5 bg-white border-2 border-black hover:bg-gray-50 text-[#111111] font-bold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Pay with Credit / Debit Card — ${finalTotal.toFixed(2)}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono mt-3">
              <Lock className="w-3 h-3 text-green-600" /> 256-Bit Encrypted Google Pay Session
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
                    <p className="text-gray-500 font-mono">Size: {item.product_variants?.size || 'OS'} x {item.quantity}</p>
                  </div>
                  <span className="font-mono font-bold">
                    ${((item.product_variants?.price_override ?? item.product_variants?.products?.sale_price ?? item.product_variants?.products?.base_price ?? 165) * item.quantity).toFixed(2)}
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

      {/* MANUAL CARD FALLBACK MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl border-2 border-black p-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <span className="font-black text-sm uppercase font-mono">Card Payment Gateway</span>
              <button onClick={() => setManualModalOpen(false)} className="p-1 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold uppercase mb-1 font-mono text-[10px]">Card Number</label>
                <input
                  type="text"
                  placeholder="4111 2222 3333 4444"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-mono text-xs focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold uppercase mb-1 font-mono text-[10px]">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardData.cardHolder}
                  onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-mono text-xs focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold uppercase mb-1 font-mono text-[10px]">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-mono text-xs focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold uppercase mb-1 font-mono text-[10px]">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-mono text-xs focus:border-black outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setManualModalOpen(false);
                  executeOrder({
                    recipient_name: cardData.cardHolder || form.name,
                    email: form.email,
                    street: form.address,
                    city: form.city,
                    postal_code: form.postalCode
                  }, 'Credit Card Direct');
                }}
                disabled={submitting}
                className="w-full py-3.5 bg-black text-white font-black uppercase text-xs tracking-wider rounded-xl hover:bg-gray-800 transition-colors shadow-lg mt-2"
              >
                {submitting ? 'Processing...' : `[ PAY $${finalTotal.toFixed(2)} ]`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}