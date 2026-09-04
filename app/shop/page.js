import Link from 'next/link';
import { getHomeProducts } from '@/services/storeService';
import { ImageOff } from 'lucide-react';
import Reveal from '@/components/Reveal';

export default async function ShopPage() {
  const products = await getHomeProducts();

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-8 fade-in-up">All Releases ({products.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p, i) => {
          const img = p.product_images?.[0]?.url;
          return (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <Link href={`/product?slug=${p.slug}`} className="hover-lift group flex flex-col justify-between rounded-2xl">
                <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 border border-[#E5E5E5] mb-3 transition-colors duration-300 group-hover:border-[#111111]/20">
                  {img ? (
                    <img src={img} alt={p.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" />
                  ) : (
                    <ImageOff className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                {p.brands?.name && (
                  <span className="text-[11px] font-semibold text-[#707072] uppercase">{p.brands.name}</span>
                )}
                <h3 className="font-bold text-sm text-[#111111]">{p.name}</h3>
                <span className="font-mono font-bold text-sm mt-2">${p.sale_price ?? p.base_price}</span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
