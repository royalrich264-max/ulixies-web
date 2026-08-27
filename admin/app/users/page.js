'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchAdminUsers } from '../../services/adminService';

export default function UsersPage() {
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

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#111111]">CUSTOMER & USER ACCOUNTS</h1>
        <p className="text-xs text-[#707072] font-medium mt-1">Manage registered accounts, view order history volume, and role assignments.</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707072]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or role..."
            className="w-full bg-[#F5F5F5] border border-transparent focus:border-black rounded-full pl-9 pr-4 py-2 text-xs font-medium text-[#111111] outline-none transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F5F5F5] text-[#707072] font-mono font-bold uppercase">
                <th className="py-4 px-6">User Profile</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Orders Volume</th>
                <th className="py-4 px-6">Total Spent</th>
                <th className="py-4 px-6 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#707072]">Loading profiles...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#707072]">No users found.</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#111111]">{u.name || u.full_name || 'Customer'}</div>
                    <div className="text-[10px] text-[#707072] font-mono">{u.email || u.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase border ${
                      u.role === 'Super Admin'
                        ? 'bg-black text-white border-black'
                        : 'bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]'
                    }`}>
                      {u.role || 'Customer'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#111111]">{u.ordersCount ?? 1} Orders</td>
                  <td className="py-4 px-6 font-mono font-bold text-[#111111]">${u.totalSpent ?? 150}</td>
                  <td className="py-4 px-6 text-right text-[#707072] font-mono">{u.joinedDate || '2026-01-15'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
