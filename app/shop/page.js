import Link from 'next/link';
import { getHomeProducts } from '@/services/storeService';

export default async function ShopPage() {
  const products = await getHomeProducts();

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-8">All Releases ({products.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => {
          const img = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80';
          return (
            <Link key={p.id} href={`/product?slug=${p.slug}`} className="group flex flex-col justify-between">
              <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 border border-[#E5E5E5] mb-3">
                <img src={img} alt={p.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="text-[11px] font-semibold text-[#707072] uppercase">{p.brands?.name || 'Nike'}</span>
              <h3 className="font-bold text-sm text-[#111111]">{p.name}</h3>
              <span className="font-mono font-bold text-sm mt-2">${p.sale_price ?? p.base_price}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}