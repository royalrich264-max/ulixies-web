'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalWishlist, toggleWishlistProduct, getCart, addToCart } from '@/services/storeService';
import { Heart, Trash2, ShoppingBag, ExternalLink } from 'lucide-react';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loadingAdd, setLoadingAdd] = useState({});

  useEffect(() => {
    setItems(getLocalWishlist());
  }, []);

  const handleRemove = (product) => {
    const updated = toggleWishlistProduct(product);
    setItems(updated);
  };

  const handleMoveToBag = async (product) => {
    setLoadingAdd(prev => ({ ...prev, [product.id]: true }));
    try {
      const { id: cartId } = await getCart();
      await addToCart(cartId, null, 1, product.id);
      alert(`${product.name} moved to your bag.`);
      window.location.reload();
    } catch (e) {
      alert(e.message || 'Please open the product page to select your size.');
    } finally {
      setLoadingAdd(prev => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-5 h-5 text-red-600 fill-current" />
        <span className="text-xs font-mono uppercase font-bold text-gray-400">ATHLETE PASSPORT // LOCKER</span>
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight">Saved Gear ({items.length})</h1>
      <p className="text-xs text-gray-500 mt-1 mb-8">Items saved to your locker for fast checkout.</p>

      {items.length === 0 ? (
        <div className="p-16 bg-[#F5F5F5] rounded-3xl text-center border border-[#E5E5E5]">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold uppercase">Your Saved Locker is Empty</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">Click the heart icon on any release to save it here.</p>
          <Link href="/" className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full">
            Explore Releases
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <Link href={`/product?slug=${item.slug}`} className="block group">
                <div className="aspect-square bg-[#F5F5F5] rounded-xl p-4 flex items-center justify-center mb-3 relative overflow-hidden border border-[#E5E5E5]">
                  <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-lg border border-[#E5E5E5] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5 text-black" />
                  </span>
                </div>
                <div className="text-[10px] font-mono uppercase text-gray-400 font-bold">{item.department} // {item.primary_category}</div>
                <h3 className="font-bold text-sm text-black mt-1 group-hover:underline">{item.name}</h3>
                <div className="font-mono font-bold text-sm mt-1">${item.sale_price ?? item.base_price}</div>
              </Link>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => handleMoveToBag(item)}
                  disabled={loadingAdd[item.id]}
                  className="flex-1 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="p-2.5 border rounded-xl hover:text-red-600 transition-colors text-gray-400"
                  title="Remove from Saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}