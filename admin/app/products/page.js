'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  Eye, 
  RefreshCw,
} from 'lucide-react';
import { fetchAdminProducts, deleteAdminProduct } from '../../services/adminService';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await fetchAdminProducts();
    setProducts(data);
    setLoading(false);
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
    
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  function exportCSV(type) {
    let headers = ['Product ID', 'Name', 'SKU', 'Brand', 'Category', 'Price', 'Stock Units', 'Status'];
    let rows = filteredProducts.map(p => [
      p.id, `"${p.name}"`, p.sku || `SKU-${p.id}`, p.brand || 'Nike', p.category || 'Footwear', p.price, p.stock, p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleDelete(id) {
    if (confirm('Permanently delete product and purge storage files?')) {
      await deleteAdminProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  }

  function handleDuplicate(product) {
    const duplicated = {
      ...product,
      id: `${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku || 'SKU'}-COPY`
    };
    setProducts(prev => [duplicated, ...prev]);
  }

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-16">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            SHOPIFY-GRADE PRODUCT CATALOG
          </h1>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Manage inventory matrix, multi-channel pricing, bulk CSV exports, and 12-section product drops.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportCSV('inventory')}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] shadow-2xs transition-all"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span>EXPORT CSV</span>
          </button>

          <Link
            href="/products/new"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD PRODUCT</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] rounded-full pl-9 pr-4 py-2 text-xs font-medium text-[#0F172A] outline-none transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 font-bold text-[#0F172A] outline-none"
          >
            <option value="All">All Brands</option>
            <option value="Nike">Nike</option>
            <option value="Jordan">Jordan Brand</option>
            <option value="Adidas">Adidas</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 font-bold text-[#0F172A] outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* 11-Column Products Data Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-mono font-bold uppercase">
                <th className="py-4 px-4">Item</th>
                <th className="py-4 px-4">Title & SKU</th>
                <th className="py-4 px-4">Brand</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Orders</th>
                <th className="py-4 px-4">Views</th>
                <th className="py-4 px-4">Conv. Rate</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-[#94A3B8] font-mono">Loading catalog matrix...</td>
                </tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                      <img src={p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80'} alt={p.name} className="max-h-full object-contain" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F172A] text-sm">{p.name}</div>
                    <div className="text-[10px] text-[#94A3B8] font-mono">{p.sku || `SKU-${p.id}`}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">{p.brand || 'Nike'}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">{p.category || 'Footwear'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border ${
                      p.stock === 0
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : p.stock < 10
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">{p.stock} Units</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">{p.ordersCount ?? Math.floor(Math.random() * 80 + 10)}</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">{Math.floor(Math.random() * 2400 + 400)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">3.4%</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleDuplicate(p)}
                      className="p-2 rounded-full hover:bg-[#F1F5F9] text-[#64748B]"
                      title="Duplicate Product"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-full hover:bg-rose-50 text-rose-600"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
