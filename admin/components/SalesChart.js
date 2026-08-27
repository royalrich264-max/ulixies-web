'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function SalesChart({ series }) {
  const [activeRange, setActiveRange] = useState('8M');

  const data = series || [
    { month: 'Jan', revenue: 112000, orders: 840 },
    { month: 'Feb', revenue: 128000, orders: 920 },
    { month: 'Mar', revenue: 145000, orders: 1100 },
    { month: 'Apr', revenue: 139000, orders: 1020 },
    { month: 'May', revenue: 168000, orders: 1340 },
    { month: 'Jun', revenue: 182000, orders: 1480 },
    { month: 'Jul', revenue: 195000, orders: 1610 },
    { month: 'Aug', revenue: 210000, orders: 1750 },
  ];

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const svgWidth = 700;
  const svgHeight = 220;
  const padding = 30;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - (d.revenue / maxRevenue) * (svgHeight - padding * 2);
    return { x, y, month: d.month, revenue: d.revenue };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-emerald-500" /> FINANCIAL REVENUE ANALYTICS
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0F172A] mt-1">
            GROSS SALES VELOCITY
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-full text-xs font-bold uppercase">
          {['1M', '3M', '8M', 'YTD'].map(r => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`px-3 py-1 rounded-full transition-all ${
                activeRange === r
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Line Curve */}
          <path d={pathD} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Labels */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" className="fill-[#0F172A] stroke-white stroke-2 group-hover:r-7 transition-all" />
              <text x={p.x} y={svgHeight - 8} textAnchor="middle" className="text-[10px] font-mono fill-[#94A3B8] font-bold">
                {p.month}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex justify-between items-center text-xs font-mono">
        <span className="text-[#64748B]">PEAK REVENUE: <strong className="text-[#0F172A]">$210,000 / mo</strong></span>
        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> +24.8% YoY GROWTH
        </span>
      </div>
    </div>
  );
}
