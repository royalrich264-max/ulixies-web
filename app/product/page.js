'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductBySlug, getCart, addToCart } from '@/services/storeService';
import { Plus, Minus, ImageOff } from 'lucide-react';

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

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
    setAdding(true);
    try {
      const { id: cartId } = await getCart();
      await addToCart(cartId, selectedVariant.id, quantity);
      alert(`${quantity} x ${product.name} added to your bag.`);
    } finally {
      setAdding(false);
    }
  };

  const productImage = product.product_images?.[0]?.url;
  const displayPrice = selectedVariant?.price_override ?? product.sale_price ?? product.base_price;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="bg-[#F5F5F5] rounded-3xl p-8 border border-[#E5E5E5] flex items-center justify-center aspect-square">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="max-h-[400px] object-contain drop-shadow-xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImageOff className="w-10 h-10" />
            <span className="text-xs font-mono uppercase">No image available</span>
          </div>
        )}
      </div>
      <div>
        {product.brands?.name && (
          <span className="text-xs uppercase font-bold text-gray-500">{product.brands.name}</span>
        )}
        <h1 className="text-4xl font-black uppercase mt-1">{product.name}</h1>
        <p className="text-2xl font-bold font-mono mt-3">
          ${displayPrice}
        </p>
        {product.description && (
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>
        )}

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

        <div className="mt-6">
          <span className="text-xs font-bold uppercase block mb-2">Quantity</span>
          <div className="flex items-center gap-3 border border-[#E5E5E5] rounded-full w-fit px-2 py-1">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-sm w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-full mt-8 py-4 bg-[#111111] text-white font-bold text-xs uppercase rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> {adding ? 'Adding...' : `Add ${quantity} to Bag`}
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