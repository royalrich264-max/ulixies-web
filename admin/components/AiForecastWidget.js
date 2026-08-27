'use client';

import { Sparkles, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function AiForecastWidget({ forecasts }) {
  const items = forecasts || [
    { sku: 'AJ1-RETRO-001', name: 'Air Jordan 1 Retro', currentStock: 45, predictedWeeklyDemand: 18, stockoutDays: 17, alertLevel: 'medium', alertText: 'Reorder suggested within 7 days' },
    { sku: 'AM270-BLK-002', name: 'Nike Air Max 270', currentStock: 8, predictedWeeklyDemand: 14, stockoutDays: 4, alertLevel: 'high', alertText: 'CRITICAL STOCKOUT RISK in 4 days' },
    { sku: 'TF-WIND-003', name: 'Tech Fleece Windrunner', currentStock: 62, predictedWeeklyDemand: 12, stockoutDays: 36, alertLevel: 'low', alertText: 'Stock levels optimal' },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2 text-[#0F172A] font-black uppercase text-sm">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2>AI DEMAND & STOCKOUT PREDICTOR</h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          AUTONOMOUS ML V3.2
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.sku}
            className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="font-bold text-[#0F172A]">{item.name}</div>
              <div className="text-[10px] font-mono text-[#64748B]">SKU: {item.sku} • Stock: {item.currentStock}</div>
            </div>

            <div className="text-right">
              <div className={`font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full border inline-block ${
                item.alertLevel === 'high'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : item.alertLevel === 'medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {item.alertText}
              </div>
              <div className="text-[9px] font-mono text-[#94A3B8] mt-0.5">
                Demand: ~{item.predictedWeeklyDemand}/wk
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          type="button"
          className="w-full py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Execute Auto-Reorder PO (#PO-8843)</span>
        </button>
      </div>
    </div>
  );
}
