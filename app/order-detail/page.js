'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserOrders, getCurrentUser } from '@/services/storeService';
import { Package, Truck, CheckCircle2, Clock, FileText, ArrowRight, Layers, Crown } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        await getCurrentUser();
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
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-gray-400 mb-1">
        <Crown className="w-4 h-4 text-black" /> ATHLETE PASSPORT // LOGISTICS
      </div>
      <div className="flex justify-between items-baseline mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">My Orders</h1>
        <span className="text-xs font-mono font-bold text-gray-500">{orders.length} TOTAL DELIVERIES</span>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-gray-400">LOADING LOGISTICS PIPELINE...</div>
      ) : orders.length === 0 ? (
        <div className="p-16 bg-[#F5F5F5] rounded-3xl text-center border border-[#E5E5E5]">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold uppercase">No Deliveries Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">You haven't placed any athlete gear orders yet.</p>
          <Link href="/" className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full">
            Explore Releases
          </Link>
        </div>
      ) : (
        /* COMPACT ORDER CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const firstItem = order.order_items?.[0];
            const itemCount = order.order_items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1;

            return (
              <div 
                key={order.id} 
                className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between hover:border-black hover:shadow-md transition-all"
              >
                <div>
                  {/* CARD HEADER */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">ORDER NO.</span>
                      <span className="font-mono font-black text-xs text-black">{order.order_number}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'delivered' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {order.status === 'shipped' && <Truck className="w-2.5 h-2.5" />}
                      {order.status === 'processing' && <Clock className="w-2.5 h-2.5" />}
                      {order.status}
                    </span>
                  </div>

                  {/* VISUAL THUMBNAIL & LINE ITEM SUMMARY */}
                  <div className="flex items-center gap-2.5 p-2.5 bg-[#F9F9F9] rounded-xl mb-3 border border-[#E5E5E5]">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-black/5">
                      <img 
                        src={firstItem?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80'} 
                        alt={firstItem?.product_name || 'Gear Item'} 
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-black truncate">{firstItem?.product_name || 'Athletic Gear'}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} • Size: {firstItem?.variant_size || 'OS'}
                      </div>
                      <div className="text-[9px] text-gray-400 font-mono">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-gray-400 block font-bold">TOTAL</span>
                    <span className="font-mono font-black text-xs text-black">${order.total_amount ?? order.total}</span>
                  </div>

                  <Link
                    href={`/order-detail?number=${order.order_number}`}
                    className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors"
                  >
                    <FileText className="w-3 h-3" /> Invoice <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}