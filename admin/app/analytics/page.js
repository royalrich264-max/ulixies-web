'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, Globe, DollarSign, Users } from 'lucide-react';
import SalesChart from '../../components/SalesChart';
import AiForecastWidget from '../../components/AiForecastWidget';
import { fetchAnalyticsData } from '../../services/adminService';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetchAnalyticsData();
      setData(res);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
          ENTERPRISE ANALYTICS & AI FORECASTING
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Deep financial metrics, conversion funnels, regional demand heatmaps, and autonomous ML stockout predictions.
        </p>
      </div>

      {/* Grid: Sales Chart & AI Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <SalesChart series={data?.revenueSeries} />
        </div>
        <div className="lg:col-span-5">
          <AiForecastWidget forecasts={data?.aiDemandForecasts} />
        </div>
      </div>

      {/* Geographic Breakdown & Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>North America Region</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">$142,500</div>
          <p className="text-xs text-slate-500">68% of gross monthly sales. Top city: Los Angeles, CA.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>European Union Region</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">$54,200</div>
          <p className="text-xs text-slate-500">24% of gross sales. Top city: Amsterdam & London.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Users className="w-4 h-4" />
            <span>Cart Conversion Rate</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">3.82%</div>
          <p className="text-xs text-slate-500">+0.6% increase following 360° Hero rotation rollout.</p>
        </div>
      </div>
    </div>
  );
}
