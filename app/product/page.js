'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductBySlug, getCart, addToCart } from '@/services/storeService';
import { Plus } from 'lucide-react';

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (slug) {
      getProductBySlug(slug).then((p) => {
        setProduct(p);
        if (p?.product_variants?.length > 0) {
          setSelectedVariant(p.product_variants[0]);
        }
      });
    }
  }, [slug]);

  if (!product) {
    return <div className="p-12 text-center font-mono text-xs tracking-widest uppercase">Loading Product Details...</div>;
  }

  const handleAdd = async () => {
    if (!selectedVariant) return;
    const { cartId } = await getCart();
    await addToCart(cartId, selectedVariant.id, 1);
    alert(`${product.name} added to your bag.`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="bg-[#F5F5F5] rounded-3xl p-8 border border-[#E5E5E5] flex items-center justify-center">
        <img
          src={product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80'}
          alt={product.name}
          className="max-h-[400px] object-contain drop-shadow-xl"
        />
      </div>
      <div>
        <span className="text-xs uppercase font-bold text-gray-500">{product.brands?.name || 'Nike'}</span>
        <h1 className="text-4xl font-black uppercase mt-1">{product.name}</h1>
        <p className="text-2xl font-bold font-mono mt-3">
          ${selectedVariant?.price_override ?? product.sale_price ?? product.base_price}
        </p>
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>
        
        {product.product_variants?.length > 0 && (
          <div className="mt-6">
            <span className="text-xs font-bold uppercase block mb-2">Select Size</span>
            <div className="grid grid-cols-4 gap-2">
              {product.product_variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`py-3 text-xs font-bold border rounded ${
                    selectedVariant?.id === v.id ? 'bg-black text-white border-black' : 'bg-white hover:border-black'
                  }`}
                >
                  {v.size || 'OS'}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          className="w-full mt-8 py-4 bg-[#111111] text-white font-bold text-xs uppercase rounded-full flex items-center justify-center gap-2 hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" /> Add to Bag
        </button>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs tracking-widest uppercase">Initializing...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}