'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';
import { 
  getHomeProducts, 
  getCart, 
  addToCart, 
  getLocalWishlist, 
  toggleWishlistProduct 
} from '@/services/storeService';
import { 
  Plus, 
  Sparkles, 
  ArrowRight,
  Heart,
  Layers,
  Footprints,
  Shirt,
  Briefcase,
  Percent,
  Crown,
  RotateCw,
  Pause,
  Play
} from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get('dept') || 'all';
  const subParam = searchParams.get('sub') || 'all';

  const [activeDept, setActiveDept] = useState(deptParam);
  const [activeSub, setActiveSub] = useState(subParam);

  const [products, setProducts] = useState([]);
  const [heroProduct, setHeroProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  const isDragging = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    setActiveDept(deptParam);
    setActiveSub(subParam);
  }, [deptParam, subParam]);

  useEffect(() => {
    async function loadData() {
      const liveProducts = await getHomeProducts(activeDept === 'all' ? null : activeDept);
      setProducts(liveProducts || []);

      if (liveProducts && liveProducts.length > 0) {
        const featured = liveProducts.find((p) => p.is_best_seller || p.is_featured) || liveProducts[0];
        setHeroProduct(featured);
        if (featured.product_variants && featured.product_variants.length > 0) {
          setSelectedVariant(featured.product_variants[0]);
        }
      } else {
        setHeroProduct(null);
        setSelectedVariant(null);
      }

      const saved = getLocalWishlist();
      setWishlistIds(saved.map((s) => s.id));
    }

    loadData();
  }, [activeDept]);

  const heroFrames = (heroProduct?.product_images || []).sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  // Smooth auto-rotation for the hero
  useEffect(() => {
    if (!isAutoRotating || heroFrames.length <= 1) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % heroFrames.length);
    }, 450);

    return () => clearInterval(interval);
  }, [isAutoRotating, heroFrames.length]);

  const handleSubChange = (subKey) => {
    setActiveSub(subKey);
    const query = new URLSearchParams();
    if (activeDept !== 'all') query.set('dept', activeDept);
    if (subKey !== 'all') query.set('sub', subKey);
    const targetUrl = query.toString() ? `/?${query.toString()}` : '/';
    router.push(targetUrl);
  };

  const handleToggleHeart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleWishlistProduct(product);
    setWishlistIds(updated.map((u) => u.id));
  };

  const handlePointerDown = (e) => {
    setIsAutoRotating(false);
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || heroFrames.length <= 1) return;
    const deltaX = e.clientX - startX.current;
    if (Math.abs(deltaX) > 15) {
      setFrameIndex((prev) => 
        deltaX > 0 
          ? (prev + 1) % heroFrames.length 
          : (prev - 1 + heroFrames.length) % heroFrames.length
      );
      startX.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleAddHeroToBag = async () => {
    if (!heroProduct) return;
    setLoadingAdd(true);
    try {
      const { id: cartId } = await getCart();
      const variantToUse = selectedVariant || heroProduct.product_variants?.[0];
      await addToCart(cartId, variantToUse?.id, 1, heroProduct.id);
      alert(`${heroProduct.name} added to your bag.`);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Error adding item to bag.');
    } finally {
      setLoadingAdd(false);
    }
  };

  // Filter items based on the active sub-section
  const displayedProducts = products.filter((p) => {
    if (activeSub === 'all') return true;
    if (activeSub === 'shoes') return p.primary_category === 'shoes';
    if (activeSub === 'clothes') return p.primary_category === 'clothing';
    if (activeSub === 'accessories') return p.primary_category === 'accessories';
    if (activeSub === 'sale') return p.is_on_sale || (p.sale_price && Number(p.sale_price) < Number(p.base_price));
    return true;
  });

  const subNavTabs = [
    { id: 'all', label: 'All Articles', icon: Layers },
    { id: 'shoes', label: 'Shoes', icon: Footprints },
    { id: 'clothes', label: 'Clothes', icon: Shirt },
    { id: 'accessories', label: 'Accessories', icon: Briefcase },
    { id: 'sale', label: 'Sales', icon: Percent },
  ];

  return (
    <div className="bg-white min-h-screen text-[#111111]">
      <SplashScreen />

      {/* 1. EDITORIAL LIFESTYLE BANNER (ALL RELEASES VIEW) */}
      {activeDept === 'all' && activeSub === 'all' && (
        <section className="relative w-full h-[420px] bg-black overflow-hidden flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80" 
            alt="Athletes in training" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>

          <div className="relative max-w-[1440px] mx-auto px-6 w-full text-white z-10">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#CCFF00] uppercase mb-3">
              <Crown className="w-4 h-4 text-[#CCFF00]" />
              OFFICIAL ULIXIES PERFORMANCE ARCHIVE
            </div>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight max-w-2xl leading-none">
              ENGINEERED FOR THE APEX ATHLETE
            </h1>
            <p className="text-gray-300 text-sm max-w-lg mt-4 leading-relaxed font-medium">
              Explore dynamic 360° footwear rotations, reactive cushion matrices, and competition gear.
            </p>
          </div>
        </section>
      )}

      {/* 2. SUB-SECTION TABS STRIP */}
      <div className="border-b border-[#E5E5E5] bg-[#F9F9F9] sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 py-3">
            {subNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSub === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSubChange(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive 
                      ? 'bg-black text-white shadow-sm' 
                      : 'bg-white border border-[#E5E5E5] text-gray-700 hover:border-black'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono font-bold text-gray-500 whitespace-nowrap pl-4 hidden sm:block">
            {displayedProducts.length} ARTICLES IN ARCHIVE
          </div>
        </div>
      </div>

      {/* 3. AUTO-ROTATING 360° HERO SHOWCASE (ALL ARTICLES VIEW) */}
      {activeSub === 'all' && heroProduct && (
        <section id="hero-rotator" className="max-w-[1440px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 bg-[#F5F5F5] border border-[#E5E5E5] rounded-3xl p-6 relative flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center z-10 mb-4">
                <span className="text-[10px] font-bold tracking-widest text-[#111111] bg-white px-2.5 py-1 rounded border border-[#E5E5E5] uppercase font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-black" /> {activeDept.toUpperCase()} // 360° LIVE ROTATION
                </span>
                
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className="text-xs text-[#707072] flex items-center gap-1 font-bold hover:text-black bg-white px-2.5 py-1 rounded-full border shadow-sm"
                >
                  {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isAutoRotating ? 'Auto Rotating' : 'Paused'}
                </button>
              </div>

              <div
                className="h-[320px] sm:h-[440px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none relative"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <img
                  src={
                    heroFrames[frameIndex]?.url ||
                    heroProduct.product_images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt={heroProduct.name}
                  className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-2xl transition-all duration-150"
                />

                <div className="absolute bottom-2 left-2 bg-white/95 border border-[#E5E5E5] px-3 py-1 rounded-lg text-[10px] font-mono shadow-sm flex items-center gap-1.5">
                  <RotateCw className="w-3 h-3 animate-spin text-gray-500" />
                  ANGLE: <span className="font-bold">{Math.round((frameIndex / Math.max(heroFrames.length, 1)) * 360)}°</span>
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max={Math.max(heroFrames.length - 1, 0)}
                  value={frameIndex}
                  onChange={(e) => {
                    setIsAutoRotating(false);
                    setFrameIndex(Number(e.target.value));
                  }}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#707072]">
                    {heroProduct.department?.toUpperCase()} // {heroProduct.primary_category?.toUpperCase()}
                  </span>
                  {heroProduct.sale_price && (
                    <span className="bg-red-600 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Percent className="w-2.5 h-2.5" /> -{Math.round(((heroProduct.base_price - heroProduct.sale_price) / heroProduct.base_price) * 100)}% SALE
                    </span>
                  )}
                  {heroProduct.is_new && !heroProduct.sale_price && (
                    <span className="bg-black text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                      NEW DROP
                    </span>
                  )}
                </div>

                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] mt-2 leading-none">
                  {heroProduct.name}
                </h2>
                
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-3xl font-black text-[#111111] font-mono">
                    ${selectedVariant?.price_override ?? heroProduct.sale_price ?? heroProduct.base_price}
                  </span>
                  {heroProduct.sale_price && (
                    <span className="text-base text-gray-400 line-through font-mono">
                      ${heroProduct.base_price}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#707072] mt-3 leading-relaxed">
                  {heroProduct.short_description || heroProduct.description || 'Calibrated athlete gear engineered for optimal performance.'}
                </p>
              </div>

              {heroProduct.product_variants?.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider">Select Size</label>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {selectedVariant?.stock ?? 15} IN STOCK
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {heroProduct.product_variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                          selectedVariant?.id === v.id
                            ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                            : 'bg-white border-[#E5E5E5] hover:border-black text-[#111111]'
                        }`}
                      >
                        {v.size || 'OS'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddHeroToBag}
                  disabled={loadingAdd}
                  className="w-full py-4 rounded-full bg-[#111111] text-white font-bold uppercase text-xs tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {loadingAdd ? 'Adding to Bag...' : 'Add to Bag'}
                </button>
                <Link
                  href={`/product?slug=${heroProduct.slug}`}
                  className="w-full py-3 rounded-full border border-[#E5E5E5] text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 hover:border-black transition-colors"
                >
                  View Technical Specifications <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 4. FILTERED ARTICLES GRID */}
      <section className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#707072]">
              {activeDept.toUpperCase()} // {activeSub.toUpperCase()}
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-1">
              {activeSub === 'all' && `${activeDept.toUpperCase()} ARCHIVE RELEASES`}
              {activeSub === 'shoes' && `${activeDept.toUpperCase()}'S FOOTWEAR`}
              {activeSub === 'clothes' && `${activeDept.toUpperCase()}'S APPAREL`}
              {activeSub === 'accessories' && `${activeDept.toUpperCase()}'S GEAR`}
              {activeSub === 'sale' && `${activeDept.toUpperCase()}'S SALES`}
            </h1>
          </div>
          <span className="text-xs font-mono font-bold text-gray-500">{displayedProducts.length} ITEMS</span>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="p-16 text-center bg-[#F5F5F5] rounded-3xl border border-[#E5E5E5]">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold uppercase text-sm">No Articles Found</h3>
            <p className="text-xs text-gray-500 mt-1">Switch sub-sections or check back soon for new drops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((p) => {
              const isLiked = wishlistIds.includes(p.id);
              const mainImg = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80';
              const discountPct = p.sale_price ? Math.round(((p.base_price - p.sale_price) / p.base_price) * 100) : null;

              return (
                <div key={p.id} className="bg-white border border-[#E5E5E5] rounded-3xl p-4 flex flex-col justify-between hover:shadow-xl transition-all group">
                  <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 relative mb-3">
                    <Link href={`/product?slug=${p.slug}`} className="w-full h-full flex items-center justify-center">
                      <img
                        src={mainImg}
                        alt={p.name}
                        className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {discountPct && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                        -{discountPct}% OFF
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
                    <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">{p.department} // {p.primary_category}</div>
                    <Link href={`/product?slug=${p.slug}`}>
                      <h3 className="font-bold text-base text-black mt-0.5 group-hover:underline truncate">{p.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono font-black text-base text-black">${p.sale_price ?? p.base_price}</span>
                      {p.sale_price && (
                        <span className="text-xs text-gray-400 line-through font-mono">${p.base_price}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono">LOADING ARTICLES...</div>}>
      <HomeContent />
    </Suspense>
  );
}