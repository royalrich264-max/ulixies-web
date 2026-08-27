'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, createOrder, getCurrentUser } from '@/services/storeService';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    shippingSpeed: 'standard',
  });

  useEffect(() => {
    async function init() {
      const data = await getCart();
      setCart(data);
      const user = await getCurrentUser();
      if (user) {
        setForm((prev) => ({
          ...prev,
          email: user.email || '',
          name: user.user_metadata?.full_name || ''
        }));
      }
      setLoading(false);
    }
    init();
  }, []);

  const subtotal = cart.items.reduce((acc, item) => {
    const price = item.product_variants?.price_override ?? item.product_variants?.products?.sale_price ?? item.product_variants?.products?.base_price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingCost = form.shippingSpeed === 'express' ? 15 : 0;
  const finalTotal = subtotal + shippingCost;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) return;
    setSubmitting(true);

    try {
      const order = await createOrder({
        customer: form,
        items: cart.items,
        total: finalTotal,
        subtotal: subtotal,
        shippingCost: shippingCost,
        shippingSpeed: form.shippingSpeed,
      });

      router.push(`/confirmation?order=${order.order_number}`);
    } catch (err) {
      alert(`Order placement failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono">Loading Checkout...</div>;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">1. Contact & Shipping Details</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              />
              <input
                type="text"
                placeholder="Street Address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  required
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
              <label className={`p-4 rounded border flex flex-col cursor-pointer ${form.shippingSpeed === 'standard' ? 'border-black bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                <input type="radio" name="speed" value="standard" checked={form.shippingSpeed === 'standard'} onChange={() => setForm({ ...form, shippingSpeed: 'standard' })} className="hidden" />
                <span className="font-bold text-xs">Standard Delivery</span>
                <span className="text-xs text-gray-500 font-mono">Free</span>
              </label>
              <label className={`p-4 rounded border flex flex-col cursor-pointer ${form.shippingSpeed === 'express' ? 'border-black bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                <input type="radio" name="speed" value="express" checked={form.shippingSpeed === 'express'} onChange={() => setForm({ ...form, shippingSpeed: 'express' })} className="hidden" />
                <span className="font-bold text-xs">Express Delivery</span>
                <span className="text-xs text-gray-500 font-mono">+$15.00</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || cart.items.length === 0}
            className="w-full py-4 bg-[#111111] text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors"
          >
            {submitting ? 'Connecting to Gateway...' : `Authorize & Place Order — $${finalTotal.toFixed(2)}`}
          </button>
        </form>

        <div className="lg:col-span-5 bg-[#F5F5F5] p-6 rounded-2xl border border-[#E5E5E5] h-fit space-y-4">
          <h3 className="font-bold uppercase tracking-wider text-sm mb-2">Order Summary</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold">{item.product_variants?.products?.name}</p>
                  <p className="text-gray-500 font-mono">Size: {item.product_variants?.size || 'OS'} x {item.quantity}</p>
                </div>
                <span className="font-mono font-bold">
                  ${((item.product_variants?.price_override ?? item.product_variants?.products?.sale_price ?? item.product_variants?.products?.base_price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5E5E5] pt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
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