'use client';

import { useState, useEffect } from 'react';
import { Plus, ShieldCheck, Sparkles, FolderTree } from 'lucide-react';
import { fetchCategoriesAndBrands } from '../../../services/adminService';

export default function CategoriesPage() {
  const [data, setData] = useState({ categories: [], brands: [], collections: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchCategoriesAndBrands();
      setData(res);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            CATEGORIES, BRANDS & COLLECTIONS
          </h1>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Organize nested product taxonomy, brand logos, and seasonal marketing collections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('New taxonomy entry dialog triggered.')}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Entry</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-3">
        {[
          { id: 'categories', label: 'Nested Categories', icon: FolderTree },
          { id: 'brands', label: 'Brand Registry', icon: ShieldCheck },
          { id: 'collections', label: 'Featured Collections', icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold uppercase text-xs tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Nested Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] text-xs font-mono font-bold text-[#64748B] uppercase">
            PRODUCT TAXONOMY HIERARCHY
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {data.categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    cat.parent ? 'ml-6 bg-[#F1F5F9] text-[#64748B]' : 'bg-[#0F172A] text-white'
                  }`}>
                    {cat.parent ? '↳' : 'P'}
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A] text-sm">{cat.name}</div>
                    <div className="text-[10px] font-mono text-[#64748B]">Slug: /{cat.slug} {cat.parent ? `(Parent: ${cat.parent})` : ''}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-mono text-xs font-bold text-[#334155]">
                    {cat.count} Products
                  </span>
                  <button className="text-xs font-bold text-[#0F172A] hover:underline">
                    Edit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Brands */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.brands.map((b) => (
            <div key={b.id} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{b.logo}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                  {b.productsCount} SKUs
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-[#0F172A]">{b.name}</h3>
                <p className="text-xs text-[#64748B] mt-1">Official brand partner profile & authorization.</p>
              </div>
              <button className="w-full py-2.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#0F172A] hover:text-white text-xs font-bold uppercase transition-all">
                Manage Brand Portfolio
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Collections */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.collections.map((c) => (
            <div key={c.id} className="bg-[#0F172A] text-white rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-[#0F172A] uppercase">
                  {c.status}
                </span>
                <span className="text-xs font-mono">{c.productsCount} Items</span>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{c.title}</h3>
                <p className="text-xs text-slate-300 mt-1">Curated catalog drop for high-impact campaigns.</p>
              </div>
              <button className="w-full py-2.5 rounded-full bg-white text-[#0F172A] hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-all">
                Edit Collection Drop
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
