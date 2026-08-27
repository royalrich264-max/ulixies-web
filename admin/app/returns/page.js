'use client';

import { useState } from 'react';
import { ArrowLeftRight, Check, X, ShieldAlert } from 'lucide-react';

export default function ReturnsPage() {
  const [claims, setClaims] = useState([
    { id: 'CLM-101', customer: 'John Doe', orderId: 'ORD-9821', item: 'Air Jordan 1 Retro High', size: '10', reason: 'Defective Stitching on Heel', status: 'Pending Review', date: '2026-08-26' },
    { id: 'CLM-102', customer: 'Sarah Connor', orderId: 'ORD-9822', item: 'Nike Air Max 270', size: '8.5', reason: 'Sizing Too Tight Across Bridge', status: 'Approved', date: '2026-08-25' },
  ]);

  function handleApprove(id) {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved & Refunded' } : c));
  }

  function handleReject(id) {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
          RETURNS, CLAIMS & ADJUDICATION PORTAL
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Review customer return requests, inspect defect descriptions, and issue automated store credits.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {claims.map((clm) => (
            <div key={clm.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{clm.id}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{clm.item} (Size: {clm.size})</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Reason: "{clm.reason}"</p>
                <div className="text-[10px] font-mono text-slate-500">Customer: {clm.customer} • Order: #{clm.orderId} • Date: {clm.date}</div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase border ${
                  clm.status.includes('Approved')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : clm.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400'
                    : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>
                  {clm.status}
                </span>

                {clm.status === 'Pending Review' && (
                  <>
                    <button
                      onClick={() => handleApprove(clm.id)}
                      className="px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold uppercase text-[10px]"
                    >
                      Approve & Refund
                    </button>
                    <button
                      onClick={() => handleReject(clm.id)}
                      className="px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]"
                    >
                      Reject Claim
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
