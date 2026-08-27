'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { fetchAdminOrders, updateOrderStatus } from '../../services/adminService';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const data = await fetchAdminOrders();
    setOrders(data);
    setLoading(false);
  }

  async function handleStatusChange(orderId, newStatus) {
    await updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  }

  function exportOrdersCSV() {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Total Amount', 'Status', 'Carrier', 'Tracking Number', 'Date'];
    const rows = filteredOrders.map(o => [
      o.id, `"${o.customer || 'Customer'}"`, o.email || 'N/A', o.total || o.total_amount || 0, o.status || 'Pending', o.carrier || 'FedEx Express', o.trackingNumber || `ULX-${o.id}`, o.date || 'Today'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `orders_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer && o.customer.toLowerCase().includes(search.toLowerCase())) ||
      (o.email && o.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || o.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            ORDER FULFILLMENT & TRACKING METADATA
          </h1>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Manage complete order status lifecycle, carrier assignment, tracking numbers, and CSV ledger downloads.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportOrdersCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span>Export Orders CSV</span>
          </button>

          <button
            onClick={loadOrders}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer name, or email..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] rounded-full pl-9 pr-4 py-2 text-xs font-medium text-[#0F172A] outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {['All', 'Pending', 'Processing', 'Shipped', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full font-bold uppercase text-[11px] tracking-wider transition-all ${
                  statusFilter === status
                    ? 'bg-[#0F172A] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-mono font-bold uppercase">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Carrier & Tracking</th>
                <th className="py-4 px-6">Status Pipeline</th>
                <th className="py-4 px-6 text-right">Details & Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#94A3B8] font-mono">Loading order records...</td>
                </tr>
              ) : filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#0F172A]">{o.id}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#0F172A]">{o.customer || 'Customer'}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{o.email || 'customer@example.com'}</div>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#0F172A]">${o.total || o.total_amount || 0}</td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#0F172A]">{o.carrier || 'FedEx Express'}</div>
                    <div className="text-[10px] font-mono text-[#64748B]">{o.trackingNumber || `TRK-ULX-${o.id}`}</div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={o.status || 'Pending'}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-bold rounded-xl px-3 py-1 text-xs outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/orders/${o.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full hover:bg-[#F8FAFC] text-[#0F172A] transition-colors font-semibold text-xs border border-[#E2E8F0]"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Invoice →</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
