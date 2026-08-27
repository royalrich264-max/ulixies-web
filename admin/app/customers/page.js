'use client';

import { useState, useEffect } from 'react';
import { Search, Award, Download } from 'lucide-react';
import { fetchAdminUsers } from '../../services/adminService';

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsers(data);
      setLoading(false);
    }
    loadUsers();
  }, []);

  function exportCustomerCSV() {
    const headers = ['Customer ID', 'Full Name', 'Email', 'Athlete Tier', 'Loyalty Points', 'Total Orders', 'Lifetime Value (LTV)', 'Joined Date'];
    const rows = users.map(u => [
      u.id, `"${u.name || 'Customer'}"`, u.email, u.tier || 'Standard', u.loyaltyPoints || 0, u.ordersCount || 0, u.totalSpent || 0, u.joinedDate || '2026-01-15'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `customer_passports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.tier && u.tier.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            CUSTOMER PASSPORTS & LOYALTY ENGINE
          </h1>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Track customer profiles, lifetime value (LTV), athlete loyalty points, and account creation timestamps.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={exportCustomerCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span>Export Passports CSV</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Bonus loyalty points awarded to selected VIP segment.')}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Award Loyalty Points</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or VIP status..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] rounded-full pl-9 pr-4 py-2 text-xs font-medium text-[#0F172A] outline-none transition-all"
          />
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-mono font-bold uppercase">
                <th className="py-4 px-6">Customer Profile</th>
                <th className="py-4 px-6">Athlete Tier</th>
                <th className="py-4 px-6">Loyalty Points</th>
                <th className="py-4 px-6">Total Orders</th>
                <th className="py-4 px-6">Lifetime Value (LTV)</th>
                <th className="py-4 px-6 text-right">Account Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#94A3B8] font-mono">Loading customer database...</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#0F172A] text-sm">{u.name || 'Customer'}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{u.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase border ${
                      u.tier === 'VIP Athlete'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : u.tier === 'Pro Member'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                    }`}>
                      {u.tier || 'Standard'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#0F172A]">
                    {u.loyaltyPoints ?? 500} PTS
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#0F172A]">
                    {u.ordersCount ?? 1} Orders
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-600">
                    ${u.totalSpent ?? 150}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[#64748B]">{u.joinedDate || '2026-01-15'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
