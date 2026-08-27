'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCart, removeFromCart } from '@/services/storeService';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await getCart();
    setCart(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id) => {
    await removeFromCart(id);
    load();
  };

  const total = cart.items.reduce((acc, item) => {
    const price = item.product_variants?.price_override ?? item.product_variants?.products?.sale_price ?? item.product_variants?.products?.base_price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  if (loading) return <div className="p-12 text-center font-mono">Loading Cart...</div>;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-black uppercase mb-8">Your Bag ({cart.items.length})</h1>
      {cart.items.length === 0 ? (
        <div className="text-center py-16 bg-[#F5F5F5] rounded-2xl border border-[#E5E5E5]">
          <p className="text-gray-500 font-medium">Your bag is empty.</p>
          <Link href="/shop" className="inline-block mt-4 px-6 py-3 bg-[#111111] text-white text-xs font-bold uppercase rounded-full">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-[#E5E5E5] rounded-xl items-center justify-between">
                <img src={item.product_variants?.products?.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80'} className="w-20 h-20 object-contain bg-[#F5F5F5] rounded-lg p-2" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.product_variants?.products?.name}</h4>
                  <p className="text-xs text-gray-500 font-mono">Size: {item.product_variants?.size || 'OS'} | Qty: {item.quantity}</p>
                  <p className="font-bold font-mono text-sm mt-1">${item.product_variants?.price_override ?? item.product_variants?.products?.sale_price ?? item.product_variants?.products?.base_price}</p>
                </div>
                <button onClick={() => handleRemove(item.id)} className="p-2 text-gray-400 hover:text-black">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 border border-[#E5E5E5] rounded-2xl bg-[#F5F5F5] h-fit">
            <h3 className="font-bold uppercase tracking-wider text-sm mb-4">Summary</h3>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="block text-center w-full py-4 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-gray-800">
              Go to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}