'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  ArrowUpRight,
  Plus,
  Clock,
  Sparkles,
  Layers,
  Boxes
} from 'lucide-react';
import SalesChart from '../components/SalesChart';
import AiForecastWidget from '../components/AiForecastWidget';
import { fetchDashboardStats, fetchAdminOrders, fetchAnalyticsData } from '../services/adminService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 18,
    totalOrders: 142,
    totalRevenue: 148900,
    pendingOrders: 12,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [dashStats, ordersData, analyticsData] = await Promise.all([
        fetchDashboardStats(),
        fetchAdminOrders(),
        fetchAnalyticsData(),
      ]);

      setStats(dashStats);
      setRecentOrders(ordersData.slice(0, 5));
      setAnalytics(analyticsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const cards = [
    {
      title: 'TOTAL GROSS REVENUE',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+14.2% THIS MONTH',
      icon: DollarSign,
    },
    {
      title: 'TOTAL ORDERS PROCESSED',
      value: stats.totalOrders,
      change: '+8.1% THIS WEEK',
      icon: ShoppingBag,
    },
    {
      title: 'ACTIVE CATALOG SKUs',
      value: stats.totalProducts,
      change: 'INVENTORY CATALOG',
      icon: Package,
    },
    {
      title: 'PENDING FULFILLMENT',
      value: stats.pendingOrders,
      change: 'REQUIRES REVIEW',
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-8 max-w-[1280px] mx-auto pb-16">
      {/* Top CEO Overview Banner */}
      <div className="bg-[#0F172A] text-white p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold uppercase backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>LIVE EXECUTIVE METRICS ENGINE</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            ENTERPRISE CONTROL TOWER
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Real-time analytics, revenue pipeline, inventory ledger, and direct storefront sync.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/products/new"
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-[#0F172A] font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] p-6 rounded-3xl flex flex-col justify-between hover:border-[#0F172A] transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">{card.title}</span>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <Icon className="w-5 h-5 text-[#0F172A]" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-[#0F172A] font-mono">
                  {loading ? '...' : card.value}
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-[#64748B] mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & AI Demand Forecast Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <SalesChart series={analytics?.revenueSeries} />
        </div>
        <div className="lg:col-span-5">
          <AiForecastWidget forecasts={analytics?.aiDemandForecasts} />
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#0F172A]">RECENT TRANSACTIONS</h2>
              <p className="text-xs text-[#64748B]">Latest customer purchases and order fulfillment</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-bold uppercase tracking-wider text-[#0F172A] hover:underline font-mono"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-mono font-bold uppercase">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Customer</th>
                  <th className="pb-3 px-2">Total</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-2 font-mono font-bold text-[#0F172A]">{order.id}</td>
                    <td className="py-4 px-2 font-semibold text-[#0F172A]">{order.customer || order.email || 'Guest User'}</td>
                    <td className="py-4 px-2 font-mono font-bold text-[#0F172A]">${order.total || order.total_amount || 0}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border ${
                        order.status === 'Completed' || order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'Processing' || order.status === 'shipped'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right text-[#64748B] font-mono">{order.date || 'Today'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Module Shortcuts */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-4 shadow-2xs">
          <h2 className="text-base font-black uppercase tracking-tight text-[#0F172A] border-b border-[#F1F5F9] pb-3">
            ENTERPRISE QUICK LINKS
          </h2>

          <div className="space-y-2 text-xs">
            <Link href="/inventory" className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold uppercase hover:bg-[#0F172A] hover:text-white transition-all">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4" />
                <span>Multi-Warehouse Logs</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link href="/products/categories" className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold uppercase hover:bg-[#0F172A] hover:text-white transition-all">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Categories & Brands</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link href="/marketing" className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold uppercase hover:bg-[#0F172A] hover:text-white transition-all">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Flash Sales & Coupons</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
