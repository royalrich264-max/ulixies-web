'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getProducts } from '@/services/storeService';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ search: query }).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [query]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Search Results</h1>
      <p className="text-xs text-gray-500 font-mono mb-8">QUERY: "{query}" ({results.length} MATCHES)</p>

      {loading ? (
        <div className="text-center py-12 font-mono">Scanning Inventory...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-[#F5F5F5] rounded-2xl border border-[#E5E5E5]">
          <p className="text-gray-500">No products match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {results.map((p) => (
            <Link key={p.id} href={`/product?slug=${p.slug}`} className="group flex flex-col justify-between">
              <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 border border-[#E5E5E5] mb-3">
                <img src={p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80'} alt={p.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="text-[11px] font-semibold text-[#707072] uppercase">{p.brands?.name || 'Nike'}</span>
              <h3 className="font-bold text-sm text-[#111111]">{p.name}</h3>
              <span className="font-mono font-bold text-sm mt-2">${p.sale_price ?? p.base_price}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono">Searching...</div>}>
      <SearchContent />
    </Suspense>
  );
}