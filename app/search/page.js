'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getHomeProducts, toggleWishlistProduct, getLocalWishlist } from '@/services/storeService';
import { Search, Heart, X, Footprints, Shirt, Briefcase, Layers } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    async function fetchCatalog() {
      const data = await getHomeProducts();
      setProducts(data || []);
      setWishlistIds(getLocalWishlist().map((s) => s.id));
    }
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (searchParams.get('q')) {
      setQuery(searchParams.get('q'));
    }
  }, [searchParams]);

  const handleToggleHeart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleWishlistProduct(product);
    setWishlistIds(updated.map((u) => u.id));
  };

  const filtered = products.filter((p) => {
    const q = query.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      p.primary_category?.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'all' || p.department === selectedDept;
    const matchesCat = selectedCat === 'all' || p.primary_category === selectedCat;

    return matchesQuery && matchesDept && matchesCat;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      
      {/* SEARCH INPUT BAR */}
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider">
          LIVE CATALOG SEARCH ENGINE
        </span>
        <div className="relative mt-3">
          <Search className="w-6 h-6 absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Type shoes, apparel, collection name, or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-12 py-3.5 bg-gray-50 border-2 border-black rounded-2xl text-sm font-bold outline-none shadow-sm focus:bg-white transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-black p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* FILTER CHIPS (DEPARTMENTS & CATEGORIES) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6 mb-8">
        
        {/* Department Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'men', 'women', 'kids', 'sports', 'sale'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                selectedDept === d 
                  ? 'bg-black text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200'
              }`}
            >
              {d === 'all' ? 'All Departments' : d}
            </button>
          ))}
        </div>

        {/* Primary Category Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'shoes', label: 'Footwear', icon: Footprints },
            { id: 'clothing', label: 'Apparel', icon: Shirt },
            { id: 'accessories', label: 'Gear', icon: Briefcase },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                  selectedCat === cat.id 
                    ? 'bg-black text-white' 
                    : 'border border-[#E5E5E5] text-gray-600 hover:border-black'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xs font-mono font-bold text-gray-400 uppercase">
          FOUND {filtered.length} RELEASES MATCHING "{query || 'ALL'}"
        </div>
        {(selectedDept !== 'all' || selectedCat !== 'all' || query) && (
          <button
            onClick={() => { setQuery(''); setSelectedDept('all'); setSelectedCat('all'); }}
            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear All Filters
          </button>
        )}
      </div>

      {/* PRODUCT GRID */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-[#F5F5F5] rounded-3xl border border-[#E5E5E5]">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="font-bold uppercase text-sm">No Matching Releases Found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Try adjusting your search query or reset department and category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((p) => {
            const isLiked = wishlistIds.includes(p.id);
            const img = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80';
            
            return (
              <div key={p.id} className="group relative flex flex-col justify-between">
                <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 border border-[#E5E5E5] mb-3 relative">
                  <Link href={`/product?slug=${p.slug}`} className="w-full h-full flex items-center justify-center">
                    <img 
                      src={img} 
                      alt={p.name} 
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300" 
                    />
                  </Link>
                  {p.is_new && (
                    <span className="absolute top-3 left-3 bg-white text-[9px] font-mono font-bold px-2 py-0.5 border border-[#E5E5E5] rounded">
                      NEW DROP
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleToggleHeart(e, p)}
                    className={`absolute top-3 right-3 p-2 rounded-full border shadow-sm transition-all z-10 ${
                      isLiked ? 'bg-red-600 text-white border-red-600' : 'bg-white/90 text-gray-600 hover:text-black hover:bg-white border-[#E5E5E5]'
                    }`}
                    title={isLiked ? 'Remove from Saved' : 'Save Item'}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-[#707072] uppercase">
                    {p.department} // {p.primary_category}
                  </div>
                  <Link href={`/product?slug=${p.slug}`}>
                    <h3 className="font-bold text-sm text-[#111111] mt-0.5 group-hover:underline">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="font-mono font-bold text-sm mt-2">
                    ${p.sale_price ?? p.base_price}
                    {p.sale_price && (
                      <span className="text-xs text-gray-400 line-through ml-2 font-normal">
                        ${p.base_price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono">INITIALIZING SEARCH ENGINE...</div>}>
      <SearchContent />
    </Suspense>
  );
}