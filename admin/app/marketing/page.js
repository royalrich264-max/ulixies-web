'use client';

import { useState, useEffect } from 'react';
import { Tag, Mail, ShoppingCart, Plus, TrendingUp, Sparkles } from 'lucide-react';
import { fetchMarketingData } from '../../services/adminService';

export default function MarketingPage() {
  const [data, setData] = useState({ coupons: [], emailCampaigns: [], abandonedCarts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchMarketingData();
      setData(res);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
            MARKETING, PROMOTIONS & ABANDONED CARTS
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage promotional coupon codes, flash sale drops, email newsletters, and cart recovery workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('New coupon created.')}
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promotion Code</span>
        </button>
      </div>

      {/* Grid: Active Coupons & Abandoned Cart Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Coupons (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-black uppercase text-base text-slate-900 dark:text-slate-100">
              <Tag className="w-5 h-5 text-indigo-500" />
              <h2>ACTIVE PROMO CODES</h2>
            </div>
          </div>

          <div className="space-y-3">
            {data.coupons.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{c.code}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.discount}</div>
                  <div className="text-[10px] font-mono text-slate-500">Expires: {c.expires}</div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {c.usageCount} Redeemed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abandoned Cart Recovery (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 dark:bg-indigo-950 text-white rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 font-black uppercase text-base">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <h2>ABANDONED CART RECOVERY</h2>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-black uppercase">
              AUTO-NUDGE ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            {data.abandonedCarts.map((ab) => (
              <div key={ab.id} className="p-4 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold">{ab.customer}</div>
                  <div className="text-[10px] text-slate-300">{ab.items}</div>
                  <div className="text-[10px] font-mono text-slate-400">Abandoned: {ab.abandonedAt}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-300">${ab.value}</div>
                  <button className="mt-1 px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-[10px] uppercase hover:bg-slate-200">
                    Send Discount Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
