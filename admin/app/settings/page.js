'use client';

import { useState } from 'react';
import { Globe, Database, Save, Check, CreditCard, Shield, DollarSign } from 'lucide-react';

export default function SettingsPage() {
  const [subdomain, setSubdomain] = useState('admin.ulixies.com');
  const [currency, setCurrency] = useState('USD ($)');
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
          ENTERPRISE SYSTEM SETTINGS
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Subdomain routing, tax rules, payment gateways, and multi-currency internationalization.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Subdomain & Domain Config */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-black text-sm uppercase">
            <Globe className="w-5 h-5 text-indigo-500" />
            <h2>Subdomain & Domain Mapping</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">Subdomain Host Header</label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Primary host mapping for admin OS.</p>
            </div>

            <div>
              <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">Storefront URL</label>
              <input
                type="text"
                disabled
                value="http://localhost:3000"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-400 font-mono cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Root monorepo storefront address.</p>
            </div>
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-black text-sm uppercase">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h2>Multi-Currency & Regional Taxes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 outline-none font-mono font-bold"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">Automated Sales Tax</label>
              <input
                type="text"
                disabled
                value="8.0% Standard Tax Rate"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'SETTINGS SAVED!' : 'SAVE SYSTEM CONFIGURATION'}</span>
        </button>
      </form>
    </div>
  );
}
