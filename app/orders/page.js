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
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-gray-400 mb-1">
        <Crown className="w-4 h-4 text-black" /> ATHLETE PASSPORT // LOGISTICS
      </div>
      <div className="flex justify-between items-baseline mb-6 border-b border-[#E5E5E5] pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">My Orders</h1>
        <span className="text-xs font-mono font-bold text-gray-500">{orders.length} DELIVERIES</span>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-gray-400">LOADING LOGISTICS PIPELINE...</div>
      ) : orders.length === 0 ? (
        <div className="p-16 bg-[#F5F5F5] rounded-3xl text-center border border-[#E5E5E5]">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold uppercase">No Deliveries Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">You have not placed any athlete gear orders yet.</p>
          <Link href="/" className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full">
            Explore Releases
          </Link>
        </div>
      ) : (
        /* SHORT, COMPACT CARDS GRID (3 PER ROW) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const firstItem = order.order_items?.[0];
            const itemCount = order.order_items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1;

            return (
              <div 
                key={order.id} 
                className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between hover:border-black hover:shadow-md transition-all"
              >
                <div>
                  {/* CARD TOP ROW */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono font-black text-xs text-black">{order.order_number}</span>
                    
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

                  {/* MINI ITEM PREVIEW */}
                  <div className="flex items-center gap-3 p-2 bg-[#F9F9F9] rounded-xl mb-3 border border-[#E5E5E5]">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-black/5">
                      <img 
                        src={firstItem?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80'} 
                        alt={firstItem?.product_name || 'Gear'} 
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-bold text-xs text-black truncate">{firstItem?.product_name || 'Gear Item'}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} • Size: {firstItem?.variant_size || 'OS'}
                      </div>
                      <div className="text-[9px] text-gray-400 font-mono">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD ACTION BOTTOM ROW */}
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