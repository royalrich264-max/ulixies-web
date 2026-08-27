'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('last_order');
    if (raw) setOrders([JSON.parse(raw)]);
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#F5F5F5] rounded-2xl border border-[#E5E5E5]">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No order history found.</p>
          <Link href="/shop" className="inline-block mt-4 px-6 py-3 bg-[#111111] text-white text-xs font-bold uppercase rounded-full">
            Shop Releases
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.orderNumber} className="p-6 border border-[#E5E5E5] rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-gray-500">ORDER #{o.orderNumber}</span>
                <p className="font-bold text-sm mt-1">{o.items?.length} Item(s) • ${o.total.toFixed(2)}</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">Placed on {new Date(o.date).toLocaleDateString()}</p>
              </div>
              <Link href={`/order-detail?id=${o.orderNumber}`} className="px-5 py-2.5 bg-[#111111] text-white rounded-full text-xs font-bold uppercase hover:bg-gray-800">
                View & Return
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}