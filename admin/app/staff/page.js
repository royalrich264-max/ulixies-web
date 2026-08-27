'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, History, Plus } from 'lucide-react';
import { fetchStaffAndAuditLogs } from '../../services/adminService';

export default function StaffPage() {
  const [data, setData] = useState({ staff: [], auditLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchStaffAndAuditLogs();
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
            STAFF MANAGEMENT & RBAC PERMISSIONS
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Control administrator access levels, role-based permissions, and inspect system action audit trails.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Invite administrator dialog triggered.')}
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Admin User</span>
        </button>
      </div>

      {/* Grid: Staff Members & Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Staff Members List (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-black uppercase text-base text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h2>AUTHORIZED ADMIN STAFF</h2>
            </div>
          </div>

          <div className="space-y-3">
            {data.staff.map((stf) => (
              <div key={stf.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{stf.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{stf.email}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">Active: {stf.lastActive}</div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase bg-slate-900 text-white dark:bg-indigo-600">
                    {stf.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-black uppercase text-base text-slate-900 dark:text-slate-100">
              <History className="w-5 h-5 text-indigo-500" />
              <h2>SYSTEM AUDIT HISTORY</h2>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{log.action}</div>
                  <div className="text-[10px] font-mono text-slate-500">By {log.staff} • Category: {log.category}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
