'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderDetails } from '@/services/storeService';
import { Crown, Printer, ArrowLeft, CheckCircle2, ShieldCheck, Package } from 'lucide-react';

function InvoiceContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number');
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!orderNumber) {
        setLoading(false);
        return;
      }
      const data = await getOrderDetails(orderNumber);
      setOrder(data);
      setLoading(false);
    }
    load();
  }, [orderNumber]);

  if (loading) {
    return <div className="p-16 text-center font-mono text-xs">GENERATING OFFICIAL INVOICE...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold uppercase">Invoice Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">We could not locate the requested order invoice.</p>
        <Link href="/orders" className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full">
          Back to Deliveries
        </Link>
      </div>
    );
  }

  const shippingAddr = order.shipping_address || {};

  return (
    <div className="max-w-[850px] mx-auto px-6 py-10">
      
      {/* ACTION BAR */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link href="/orders" className="text-xs font-bold uppercase text-gray-600 hover:text-black flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
      </div>

      {/* OFFICIAL INVOICE CARD */}
      <div className="bg-white border-2 border-black rounded-3xl p-8 sm:p-12 shadow-xl print:border-none print:shadow-none print:p-0">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded bg-black text-[#CCFF00] flex items-center justify-center">
                <Crown className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-black text-xl tracking-tight font-mono">ULIXIES CORP</span>
            </div>
            <div className="text-[11px] text-gray-500 font-mono">
              Athletic Performance Equipment & Footwear<br />
              Logistics Hub: Official Verified Merchant
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded">
              OFFICIAL INVOICE
            </span>
            <div className="font-mono font-black text-sm text-black mt-2">{order.order_number}</div>
            <div className="text-[10px] text-gray-400 font-mono">
              {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* BILLING & SHIPPING DETAILS */}
        <div className="grid grid-cols-2 gap-8 text-xs mb-8 border-b border-gray-200 pb-6">
          <div>
            <span className="font-bold text-gray-400 font-mono uppercase block mb-1">Delivered To:</span>
            <div className="font-bold text-black text-sm">{shippingAddr.recipient_name || order.guest_email || 'Customer'}</div>
            <div className="text-gray-600 mt-0.5">{shippingAddr.street || shippingAddr.address}</div>
            <div className="text-gray-600">{shippingAddr.city} {shippingAddr.postal_code || shippingAddr.postalCode}</div>
            <div className="text-gray-400 font-mono text-[11px] mt-1">{order.guest_email}</div>
          </div>

          <div className="text-right font-mono">
            <span className="font-bold text-gray-400 uppercase block mb-1">Delivery Details:</span>
            <div className="text-black font-bold flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {order.status?.toUpperCase()}
            </div>
            <div className="text-gray-500 text-[11px] mt-0.5">{order.shipping_speed || 'Standard Courier'}</div>
            <div className="text-gray-500 text-[11px]">Payment: Google Pay / Verified</div>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="mb-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-black font-mono text-[10px] uppercase text-gray-500">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5">Specification</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(order.order_items || []).map((item) => (
                <tr key={item.id} className="py-3">
                  <td className="py-3 font-bold text-black">{item.product_name}</td>
                  <td className="py-3 font-mono text-gray-500">{item.color ? `${item.color} / ${item.size || 'OS'}` : (item.size || 'OS')}</td>
                  <td className="py-3 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 text-right font-mono">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold">${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS SUMMARY */}
        <div className="border-t-2 border-black pt-4 flex justify-end">
          <div className="w-64 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-black">${Number(order.subtotal || order.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee:</span>
              <span className="font-bold text-black">{order.shipping_cost ? `$${order.shipping_cost.toFixed(2)}` : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-base font-black text-black pt-2 border-t border-black">
              <span>Total Paid:</span>
              <span>${Number(order.total_amount ?? order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER GUARANTEE */}
        <div className="border-t border-gray-200 pt-6 mt-10 flex items-center justify-between text-[10px] font-mono text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-black" /> AUTHENTIC ATHLETIC GEAR GUARANTEED
          </span>
          <span>ULIXIES RESELLER CORP // TRANSACTION RECORD</span>
        </div>

      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center font-mono text-xs">PREPARING INVOICE...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}