'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [returnRequested, setReturnRequested] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('last_order');
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-2">Order Details</h1>
      <p className="font-mono text-xs text-gray-500 mb-8">ORDER REF: #{id}</p>

      {order ? (
        <div className="space-y-6">
          <div className="border border-[#E5E5E5] rounded-2xl p-6 bg-[#F5F5F5]">
            <h3 className="text-xs uppercase font-bold text-gray-500 mb-4">Purchased Items</h3>
            <div className="space-y-4">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold">{i.product_variants?.products?.name}</span>
                    <span className="text-xs text-gray-500 ml-2 font-mono">Qty: {i.quantity}</span>
                  </div>
                  <span className="font-mono font-bold">
                    ${((i.product_variants?.price_override ?? i.product_variants?.products?.sale_price ?? i.product_variants?.products?.base_price) * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#E5E5E5] rounded-2xl p-6">
            <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Return or Exchange</h3>
            <p className="text-xs text-gray-600 mb-4">Eligible for return within 30 days of delivery.</p>
            {returnRequested ? (
              <p className="text-xs font-bold font-mono text-green-600">✓ Return request submitted. Prepaid shipping label emailed.</p>
            ) : (
              <button onClick={() => setReturnRequested(true)} className="px-6 py-3 border border-red-600 text-red-600 rounded-full text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition-colors">
                Request Return Label
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="font-mono text-xs">Order details not found.</div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono">Loading Order...</div>}>
      <OrderDetailContent />
    </Suspense>
  );
}