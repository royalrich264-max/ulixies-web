'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';
import { 
  getHomeProducts, 
  getCart, 
  addToCart, 
  getLocalWishlist, 
  toggleWishlistProduct 
} from '@/services/storeService';
import { 
  Move, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  ArrowRight,
  Heart,
  Layers,
  Footprints,
  Shirt,
  Briefcase
} from 'lucide-react';

const DEPARTMENT_HERO_ASSETS = {
  all: {
    bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80',
    title: 'UNRIVALED PERFORMANCE ARCHIVE',
    subtitle: 'Calibrated engineered athlete footwear and training apparel built for speed.'
  },
  men: {
    bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80',
    title: 'MEN\'S APEX TRAINING SERIES',
    subtitle: 'Explosive response runners, compression layers, and track footwear.'
  },
  women: {
    bgImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
    title: 'WOMEN\'S AERODYNAMIC SILHOUETTES',
    subtitle: 'High-energy cushioning systems and precision lifestyle apparel.'
  },
  kids: {
    bgImage: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1600&q=80',
    title: 'NEXT GENERATION ATHLETES',
    subtitle: 'Durable lightweight cushioning built for playground sprints and sport.'
  },
  sports: {
    bgImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
    title: 'ELITE PRO COMPETITION GEAR',
    subtitle: 'Carbon plate marathon runners and aerodynamic tech apparel.'
  },
  sale: {
    bgImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1600&q=80',
    title: 'SEASONAL ARCHIVE CLEARANCE',
    subtitle: 'Vault pricing on previous-generation colorways and athlete silhouettes.'
  }
};

function HomeContent() {
  const searchParams = useSearchParams();
  const deptFromUrl = searchParams.get('dept') || 'all';

  const [activeDept, setActiveDept] = useState(deptFromUrl);
  const [products, setProducts] = useState([]);
  const [heroProduct, setHeroProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  const isDragging = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    setActiveDept(deptFromUrl);
  }, [deptFromUrl]);

  useEffect(() => {
    async function loadData() {
      const liveProducts = await getHomeProducts(activeDept);
      setProducts(liveProducts);

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

  const handleToggleHeart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleWishlistProduct(product);
    setWishlistIds(updated.map((u) => u.id));
  };

  const heroFrames = (heroProduct?.product_images || []).sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const handlePointerDown = (e) => {
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

  const stepRotator = (step) => {
    if (heroFrames.length <= 1) return;
    setFrameIndex((prev) => {
      const next = (prev + step) % heroFrames.length;
      return next < 0 ? heroFrames.length - 1 : next;
    });
  };

  const handleAddHeroToBag = async () => {
    if (!heroProduct) return;
    setLoadingAdd(true);
    try {
      const { id: cartId } = await getCart();
      const variantToUse = selectedVariant || heroProduct.product_variants?.[0];
      await addToCart(cartId, variantToUse?.id, 1, heroProduct.id);
      alert(`${heroProduct.name} (Size: ${variantToUse?.size || 'OS'}) added to your bag.`);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Error adding item to bag.');
    } finally {
      setLoadingAdd(false);
    }
  };

  const currentHeroAsset = DEPARTMENT_HERO_ASSETS[activeDept] || DEPARTMENT_HERO_ASSETS.all;
  const shoeProducts = products.filter((p) => p.primary_category === 'shoes');
  const clothingProducts = products.filter((p) => p.primary_category === 'clothing');
  const accessoryProducts = products.filter((p) => p.primary_category === 'accessories');

  return (
    <div className="bg-white min-h-screen text-[#111111]">
      <SplashScreen />

      {/* DYNAMIC EDITORIAL HERO BANNER */}
      <section className="relative w-full h-[480px] bg-black overflow-hidden flex items-center">
        <img 
          src={currentHeroAsset.bgImage} 
          alt={currentHeroAsset.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>

        <div className="relative max-w-[1440px] mx-auto px-6 w-full text-white z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#CCFF00] uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
            ULIXIES // {activeDept.toUpperCase()} DIVISION
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight max-w-2xl leading-none">
            {currentHeroAsset.title}
          </h1>
          <p className="text-gray-300 text-sm max-w-lg mt-4 leading-relaxed font-medium">
            {currentHeroAsset.subtitle}
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#shoes-section" className="px-6 py-3.5 bg-white text-black text-xs font-black uppercase tracking-wider rounded-full hover:bg-[#CCFF00] transition-colors">
              Explore Footwear
            </a>
            <a href="#clothing-section" className="px-6 py-3.5 border border-white/40 text-white text-xs font-black uppercase tracking-wider rounded-full hover:border-white transition-colors">
              Explore Apparel
            </a>
          </div>
        </div>
      </section>

      {/* 360° HERO ROTATOR */}
      {heroProduct && (
        <section id="hero-rotator" className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 bg-[#F5F5F5] border border-[#E5E5E5] rounded-3xl p-6 relative flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center z-10 mb-4">
                <span className="text-[10px] font-bold tracking-widest text-[#111111] bg-white px-2.5 py-1 rounded border border-[#E5E5E5] uppercase font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-black" /> 360° VIEWPORT
                </span>
                <span className="text-xs text-[#707072] flex items-center gap-1 font-medium">
                  <Move className="w-3.5 h-3.5" /> Drag or use slider to rotate
                </span>
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
                  className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-2xl transition-all duration-75"
                />

                <div className="absolute bottom-2 left-2 bg-white/95 border border-[#E5E5E5] px-3 py-1 rounded-lg text-[10px] font-mono shadow-sm">
                  ROTATION: <span className="font-bold">{Math.round((frameIndex / Math.max(heroFrames.length, 1)) * 360)}°</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => stepRotator(-1)}
                  className="p-2 bg-white rounded-lg border border-[#E5E5E5] hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0"
                  max={Math.max(heroFrames.length - 1, 0)}
                  value={frameIndex}
                  onChange={(e) => setFrameIndex(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => stepRotator(1)}
                  className="p-2 bg-white rounded-lg border border-[#E5E5E5] hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#707072]">
                    {heroProduct.department?.toUpperCase()} // {heroProduct.primary_category?.toUpperCase()}
                  </span>
                  {heroProduct.is_new && (
                    <span className="bg-black text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                      NEW DROP
                    </span>
                  )}
                </div>

                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] mt-2 leading-none">
                  {heroProduct.name}
                </h2>
                
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl font-black text-[#111111] font-mono">
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
                    <label className="text-xs font-bold uppercase tracking-wider">Select Size ({heroProduct.primary_category === 'shoes' ? 'US Shoe' : 'Apparel'})</label>
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

      {/* SECTION 1: FOOTWEAR & SHOES */}
      <section id="shoes-section" className="max-w-[1440px] mx-auto px-6 py-16 border-t border-[#E5E5E5]">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#707072] flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-black" /> FOOTWEAR ARCHIVE // {activeDept.toUpperCase()}
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-1">
              Performance Shoes & Runners
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500 font-bold">{shoeProducts.length} STYLES AVAILABLE</span>
        </div>

        {shoeProducts.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-gray-400 bg-gray-50 rounded-2xl">
            No footwear releases found in this department.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {shoeProducts.map((p) => {
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
                      title={isLiked ? 'Remove from Saved Gear' : 'Save Item'}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-[#707072] uppercase">{p.department} // {p.subcategory || 'Footwear'}</div>
                    <Link href={`/product?slug=${p.slug}`}>
                      <h3 className="font-bold text-sm text-[#111111] mt-0.5 group-hover:underline">{p.name}</h3>
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
      </section>

      {/* SECTION 2: CLOTHES & APPAREL */}
      <section id="clothing-section" className="max-w-[1440px] mx-auto px-6 py-16 border-t border-[#E5E5E5] bg-[#FBFBFB]">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#707072] flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-black" /> APPAREL ARCHIVE // {activeDept.toUpperCase()}
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-1">
              Training Clothes & Athletic Apparel
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500 font-bold">{clothingProducts.length} APPAREL STYLES</span>
        </div>

        {clothingProducts.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-gray-400 bg-white border border-[#E5E5E5] rounded-2xl">
            No apparel releases found in this department.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {clothingProducts.map((p) => {
              const isLiked = wishlistIds.includes(p.id);
              const img = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';
              return (
                <div key={p.id} className="group relative flex flex-col justify-between">
                  <div className="bg-white rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 border border-[#E5E5E5] mb-3 relative shadow-sm">
                    <Link href={`/product?slug=${p.slug}`} className="w-full h-full flex items-center justify-center">
                      <img
                        src={img}
                        alt={p.name}
                        className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {p.is_new && (
                      <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                        NEW DROP
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleToggleHeart(e, p)}
                      className={`absolute top-3 right-3 p-2 rounded-full border shadow-sm transition-all z-10 ${
                        isLiked ? 'bg-red-600 text-white border-red-600' : 'bg-white/90 text-gray-600 hover:text-black hover:bg-white border-[#E5E5E5]'
                      }`}
                      title={isLiked ? 'Remove from Saved Gear' : 'Save Item'}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-[#707072] uppercase">{p.department} // {p.subcategory || 'Apparel'}</div>
                    <Link href={`/product?slug=${p.slug}`}>
                      <h3 className="font-bold text-sm text-[#111111] mt-0.5 group-hover:underline">{p.name}</h3>
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
      </section>

      {/* SECTION 3: ACCESSORIES & GEAR */}
      {accessoryProducts.length > 0 && (
        <section id="accessories-section" className="max-w-[1440px] mx-auto px-6 py-16 border-t border-[#E5E5E5]">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#707072] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-black" /> GEAR & PERFORMANCE ACCESSORIES
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-1">
                Equipment & Bags
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {accessoryProducts.map((p) => {
              const isLiked = wishlistIds.includes(p.id);
              const img = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80';
              return (
                <div key={p.id} className="group relative flex flex-col justify-between">
                  <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 border border-[#E5E5E5] mb-3 relative">
                    <Link href={`/product?slug=${p.slug}`} className="w-full h-full flex items-center justify-center">
                      <img src={img} alt={p.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleToggleHeart(e, p)}
                      className={`absolute top-3 right-3 p-2 rounded-full border shadow-sm transition-all z-10 ${
                        isLiked ? 'bg-red-600 text-white border-red-600' : 'bg-white/90 text-gray-600 hover:text-black hover:bg-white border-[#E5E5E5]'
                      }`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#707072] uppercase">{p.department} // Accessories</div>
                    <Link href={`/product?slug=${p.slug}`}>
                      <h3 className="font-bold text-sm text-[#111111] mt-0.5 group-hover:underline">{p.name}</h3>
                    </Link>
                    <div className="font-mono font-bold text-sm mt-2">${p.sale_price ?? p.base_price}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono">LOADING ULIXIES ARCHIVE...</div>}>
      <HomeContent />
    </Suspense>
  );
}