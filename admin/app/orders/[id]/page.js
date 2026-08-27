'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Printer, Truck, ArrowLeft, CheckCircle2, Clock, ShieldCheck, DollarSign } from 'lucide-react';

export default function OrderDetailPage({ params }) {
  const orderId = params?.id || 'ORD-9821';
  const [status, setStatus] = useState('Processing');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-900 dark:text-slate-100 hover:bg-slate-100 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={() => alert('Shipping label generated for carrier dispatch.')}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-slate-800"
          >
            <Truck className="w-4 h-4" />
            <span>Generate Shipping Label</span>
          </button>
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">ORDER {orderId} TIMELINE</h1>
            <p className="text-xs text-slate-500">Live fulfillment status & milestone logs</p>
          </div>
          <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400">
            CURRENT: {status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { step: 'Order Placed', time: 'Aug 27, 09:12 AM', done: true },
            { step: 'Payment Verified', time: 'Aug 27, 09:14 AM', done: true },
            { step: 'Warehouse Processing', time: 'In Progress', done: true },
            { step: 'Carrier Dispatch', time: 'Pending', done: false },
          ].map((st, i) => (
            <div key={i} className={`p-3 rounded-xl border text-xs space-y-1 ${st.done ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40'}`}>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className={`w-4 h-4 ${st.done ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{st.step}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">{st.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-8 space-y-6 shadow-md">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">ULIXIES INC.</h2>
            <p className="text-xs text-slate-500 font-mono">OFFICIAL INVOICE & PROOF OF PURCHASE</p>
            <p className="text-xs text-slate-500 mt-1">100 Reseller Way, Beaverton, OR 97005</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono font-bold">{orderId}</div>
            <div className="text-xs text-slate-500 font-mono">Date: 2026-08-27</div>
            <div className="text-xs text-slate-500 font-mono">Payment: Apple Pay (Verified)</div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
          <div>
            <span className="font-mono font-bold uppercase text-slate-400 block mb-1">Billed To</span>
            <div className="font-bold text-slate-900">John Doe</div>
            <div className="text-slate-600">john.doe@example.com</div>
            <div className="text-slate-600">+1 (555) 019-2831</div>
          </div>
          <div>
            <span className="font-mono font-bold uppercase text-slate-400 block mb-1">Shipping Destination</span>
            <div className="font-bold text-slate-900">742 Evergreen Terrace</div>
            <div className="text-slate-600">Springfield, OR 97477</div>
            <div className="text-slate-600">United States</div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-mono font-bold uppercase">
              <th className="pb-3">Item Description</th>
              <th className="pb-3">SKU</th>
              <th className="pb-3 text-center">Qty</th>
              <th className="pb-3 text-right">Price</th>
              <th className="pb-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3.5 font-bold">Air Jordan 1 Retro High OG (Size: 10 / Crimson)</td>
              <td className="py-3.5 font-mono text-slate-500">AJ1-RETRO-001</td>
              <td className="py-3.5 text-center font-mono font-bold">1</td>
              <td className="py-3.5 text-right font-mono">$180.00</td>
              <td className="py-3.5 text-right font-mono font-bold">$180.00</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end pt-4 border-t border-slate-200 text-xs">
          <div className="w-64 space-y-2 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>$180.00</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Standard Express Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%):</span>
              <span>$14.40</span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span>$194.40</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
