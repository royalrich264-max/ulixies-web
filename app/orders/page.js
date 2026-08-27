'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserOrders, getCurrentUser } from '@/services/storeService';
import { Package, Truck, CheckCircle2, Clock, AlertCircle, ArrowRight, Layers } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        const data = await getUserOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-gray-400 mb-1">
        <Package className="w-4 h-4 text-black" /> ATHLETE PASSPORT // LOGISTICS
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight">Order History</h1>
      <p className="text-xs text-gray-500 mt-1 mb-8">Inspect your past gear deliveries and live tracking updates.</p>

      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-gray-400">LOADING LOGISTICS PIPELINE...</div>
      ) : orders.length === 0 ? (
        <div className="p-16 bg-[#F5F5F5] rounded-3xl text-center border border-[#E5E5E5]">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold uppercase">No Orders Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">You haven't placed any gear orders yet.</p>
          <Link href="/" className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full">
            Explore Releases
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4 mb-4">
                <div>
                  <div className="text-xs text-gray-400 font-mono">ORDER NUMBER</div>
                  <div className="font-mono font-black text-lg text-black">{order.order_number}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-mono">PLACED ON</div>
                  <div className="text-xs font-bold text-black">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-mono">TOTAL AMOUNT</div>
                  <div className="font-mono font-black text-sm text-black">${order.total_amount ?? order.total}</div>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase font-mono ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {order.status === 'shipped' && <Truck className="w-3.5 h-3.5" />}
                    {order.status === 'processing' && <Clock className="w-3.5 h-3.5" />}
                    {order.status}
                  </span>
                </div>
              </div>

              {/* TRACKING NUMBER IF SHIPPED */}
              {order.tracking_number && (
                <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Carrier: {order.shipping_carrier || 'Express'}
                  </span>
                  <span className="font-mono font-bold text-blue-950">Tracking: {order.tracking_number}</span>
                </div>
              )}

              {/* LINE ITEMS */}
              <div className="divide-y divide-[#E5E5E5]">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg p-1 flex items-center justify-center shrink-0 border border-[#E5E5E5]">
                        <img src={item.image_url} alt={item.product_name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-black">{item.product_name}</div>
                        <div className="text-xs text-gray-500 font-mono">Size: {item.variant_size} | Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm text-black">
                      ${item.unit_price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex justify-end">
                <Link
                  href={`/order-detail?number=${order.order_number}`}
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-black hover:underline"
                >
                  View Full Invoice & Tracking <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}