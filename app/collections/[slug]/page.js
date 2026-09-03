import Link from 'next/link';
import { getCollectionBySlug } from '@/services/storeService';
import { ImageOff } from 'lucide-react';

export default async function CollectionPage({ params }) {
  const collection = await getCollectionBySlug(params.slug);

  if (!collection) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-black uppercase">Collection Not Found</h1>
        <p className="text-sm text-gray-500 mt-2">This drop isn't live right now.</p>
        <Link href="/shop" className="inline-block mt-6 px-6 py-3 bg-[#111111] text-white rounded-full text-xs font-bold uppercase hover:bg-gray-800">
          Browse All Releases
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <h1 className="text-4xl font-black uppercase tracking-tight">{collection.name}</h1>
      {collection.description && (
        <p className="text-sm text-gray-500 mt-2 max-w-2xl">{collection.description}</p>
      )}
      <p className="text-xs font-mono text-gray-400 mt-3">{collection.products.length} item{collection.products.length === 1 ? '' : 's'}</p>

      {collection.products.length === 0 ? (
        <p className="text-sm text-gray-500 mt-10">No products in this collection yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {collection.products.map((p) => {
            const img = p.product_images?.[0]?.url;
            return (
              <Link key={p.id} href={`/product?slug=${p.slug}`} className="group flex flex-col justify-between">
                <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 border border-[#E5E5E5] mb-3">
                  {img ? (
                    <img src={img} alt={p.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300" />
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
            );
          })}
        </div>
      )}
    </div>
  );
}
