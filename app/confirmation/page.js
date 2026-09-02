'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { getOrderDetails } from '@/services/storeService';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNum = searchParams.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNum) {
      setLoading(false);
      return;
    }
    getOrderDetails(orderNum).then((data) => {
      setOrder(data);
      setLoading(false);
    });
  }, [orderNum]);

  if (loading) {
    return <div className="p-12 text-center font-mono text-xs uppercase tracking-widest">Loading Order Confirmation...</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <CheckCircle2 className="w-16 h-16 text-black mx-auto mb-4" />
      <h1 className="text-3xl font-black uppercase tracking-tight">Order Confirmed</h1>

      {order ? (
        <>
          <p className="text-xs font-mono text-gray-500 mt-2">ORDER REF: #{order.order_number}</p>
          <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-6 text-left mt-8 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Shipped To</span>
              <p className="text-xs font-bold mt-0.5">{order.shipping_address?.recipient_name || order.shipping_address?.name}</p>
              <p className="text-xs text-gray-600">
                {order.shipping_address?.street || order.shipping_address?.address}, {order.shipping_address?.city} {order.shipping_address?.postal_code || order.shipping_address?.postalCode}
              </p>
            </div>
            <div className="border-t border-[#E5E5E5] pt-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Items</span>
              {(order.order_items || []).map((i) => (
                <p key={i.id} className="text-xs mt-1">
                  {i.product_name || i.product_variants?.products?.name || 'Item'} (Size: {i.size || 'OS'} x {i.quantity})
                </p>
              ))}
            </div>
            <div className="border-t border-[#E5E5E5] pt-3 flex justify-between font-bold text-xs">
              <span>Total Paid</span>
              <span className="font-mono">${Number(order.total_amount ?? order.total ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs font-mono text-gray-500 mt-2">
          {orderNum ? `We couldn't find order #${orderNum}.` : 'No order reference was provided.'} Check your full order history instead.
        </p>
      )}

      <div className="flex gap-4 justify-center mt-8">
        <Link href="/orders" className="px-6 py-3 border border-[#111111] rounded-full text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
          View All Orders
        </Link>
        <Link href="/shop" className="px-6 py-3 bg-[#111111] text-white rounded-full text-xs font-bold uppercase hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono">Loading Order Confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}