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
  Heart,
  Layers,
  Footprints,
  Shirt,
  Briefcase,
  Percent,
  Crown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Pause,
  Play,
  Tag
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
  
  // 360 Turntable Variables[cite: 4]
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Loadout Calibration Station State[cite: 4]
  const [loadoutColor, setLoadoutColor] = useState('Crimson');
  const [loadoutImg, setLoadoutImg] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80');
  const [loadoutSize, setLoadoutSize] = useState('10');

  const isDragging = useRef(false);
  const dragStartX = useRef(0);

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

  const shoeAngleFrames = heroProduct?.product_images?.length > 0 
    ? heroProduct.product_images.map(img => img.url)
    : [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80"
      ];

  // Automatic slow continuous 360° rotation[cite: 4]
  useEffect(() => {
    if (!isAutoRotating || shoeAngleFrames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAngle((prev) => (prev + 3) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoRotating, shoeAngleFrames.length]);

  const frameIndex = Math.min(
    Math.floor((currentAngle / 360) * shoeAngleFrames.length),
    shoeAngleFrames.length - 1
  );

  const rad = (currentAngle * Math.PI) / 180;
  const scaleX = Math.cos(rad) < 0 ? -1 : 1;

  const handlePointerDown = (e) => {
    setIsAutoRotating(false);
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = e.clientX;
    setCurrentAngle((prev) => (prev + deltaX * 0.9 + 360) % 360);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const stepRotator = (step) => {
    setIsAutoRotating(false);
    setCurrentAngle((prev) => (prev + step + 360) % 360);
  };

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

  const handleAddHeroToBag = async () => {
    if (!heroProduct) return;
    setLoadingAdd(true);
    try {
      const { id: cartId } = await getCart();
      const variantToUse = selectedVariant || heroProduct.product_variants?.[0];
      await addToCart(cartId, variantToUse?.id, 1, heroProduct.id);
      alert(`${heroProduct.name} added to your equipment bag.`);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Error adding item to bag.');
    } finally {
      setLoadingAdd(false);
    }
  };

  const displayedProducts = products.filter((p) => {
    if (activeSub === 'all') return true;
    if (activeSub === 'shoes') return p.primary_category === 'shoes';
    if (activeSub === 'clothes') return p.primary_category === 'clothing';
    if (activeSub === 'accessories') return p.primary_category === 'accessories';
    if (activeSub === 'sale') return p.is_on_sale === true || (p.sale_price && Number(p.sale_price) < Number(p.base_price));
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

      {/* 1. EDITORIAL LIFESTYLE BANNER (ALL RELEASES)[cite: 4] */}
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
              ULIXIES // OFFICIAL PERFORMANCE ARCHIVE
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

      {/* 2. SUB-SECTION TABS STRIP[cite: 4] */}
      <div className="border-b border-[#E5E5E5] bg-[#F9F9F9] sticky top-16 z-30 shadow-sm">
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
                  <Icon className={`w-3.5 h-3.5 ${tab.id === 'sale' && !isActive ? 'text-red-600' : ''}`} />
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

      {/* 3. HERO 360° TURNTABLE (ONLY ON ALL ARTICLES VIEW)[cite: 4] */}
      {activeSub === 'all' && heroProduct && (
        <section id="hero-rotator" className="max-w-[1440px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              <div className="bg-[#F5F5F5] rounded-2xl p-6 relative flex flex-col justify-between border border-[#E5E5E5]">
                
                <div className="flex justify-between items-center z-10 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-widest text-[#111111] bg-white px-2.5 py-1 rounded border border-[#E5E5E5] uppercase font-mono">
                      360° INSPECTION
                    </span>
                    <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      DUAL ZOOM AIR
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    className="text-xs text-[#707072] flex items-center gap-1 font-bold hover:text-black bg-white px-2.5 py-1 rounded-full border border-[#E5E5E5] shadow-sm"
                  >
                    {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isAutoRotating ? 'Auto Rotating' : 'Paused'}
                  </button>
                </div>

                <div 
                  className="relative h-[320px] sm:h-[440px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  <img
                    src={shoeAngleFrames[frameIndex]}
                    alt={heroProduct.name}
                    style={{ transform: `scaleX(${scaleX})` }}
                    className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-2xl transition-transform duration-75"
                  />
                  
                  <div className="absolute bottom-2 left-2 bg-white/95 border border-[#E5E5E5] px-3 py-1.5 rounded text-[11px] font-mono flex items-center gap-1.5 shadow-sm">
                    <RotateCw className="w-3 h-3 animate-spin text-gray-400" />
                    ROTATION: <span className="font-bold text-black">{String(Math.round(currentAngle)).padStart(3, '0')}°</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button onClick={() => stepRotator(-45)} className="p-2 bg-white rounded border border-[#E5E5E5] hover:bg-gray-100 transition-colors shadow-sm">
                    <ChevronLeft className="w-4 h-4 text-black" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={Math.round(currentAngle)}
                    onChange={(e) => {
                      setIsAutoRotating(false);
                      setCurrentAngle(Number(e.target.value));
                    }}
                    className="w-full h-1 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <button onClick={() => stepRotator(45)} className="p-2 bg-white rounded border border-[#E5E5E5] hover:bg-gray-100 transition-colors shadow-sm">
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>
                </div>

              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#707072]">
                    {heroProduct.department?.toUpperCase()} // {heroProduct.primary_category?.toUpperCase()}
                  </span>
                  {heroProduct.sale_price && (
                    <span className="bg-red-600 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Percent className="w-2.5 h-2.5" /> -{Math.round(((heroProduct.base_price - heroProduct.sale_price) / heroProduct.base_price) * 100)}% SALE
                    </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
                  {heroProduct.name}
                </h1>

                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-3xl font-black text-black font-mono">
                    ${selectedVariant?.price_override ?? heroProduct.sale_price ?? heroProduct.base_price}
                  </span>
                  {heroProduct.sale_price && (
                    <span className="text-base text-gray-400 line-through font-mono">
                      ${heroProduct.base_price}
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#707072] mt-3 leading-relaxed">
                  {heroProduct.short_description || heroProduct.description || 'Constructed with high-tensile Flyknit mesh and pressurized dual Zoom Air units. Engineered for precision energy return and stability.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-y border-[#E5E5E5] py-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#707072]">Weight</div>
                  <div className="text-sm font-bold text-black mt-0.5">{heroProduct.weight_spec || '8.1 oz'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#707072]">Fit Profile</div>
                  <div className="text-sm font-bold text-black mt-0.5">{heroProduct.fit || 'True to Size'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#707072]">XP Bounty</div>
                  <div className="text-sm font-bold text-black mt-0.5">+250 XP</div>
                </div>
              </div>

              {heroProduct.product_variants?.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black">Select Size</label>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {selectedVariant?.stock ?? 15} IN STOCK
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {heroProduct.product_variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`py-3 rounded border text-xs font-semibold transition-colors ${
                          selectedVariant?.id === v.id
                            ? 'border-2 border-black bg-black text-white'
                            : 'border-[#E5E5E5] hover:border-black text-black'
                        }`}
                      >
                        {v.size || 'OS'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddHeroToBag}
                disabled={loadingAdd}
                className="w-full py-4 rounded-full bg-black text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> {loadingAdd ? 'Adding...' : 'Add to Bag'}
              </button>
            </div>

          </div>
        </section>
      )}

      {/* 4. FILTERED ARTICLES GRID[cite: 4] */}
      <section className="max-w-[1440px] mx-auto px-6 py-12 border-t border-[#E5E5E5]">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#707072]">
              {activeDept.toUpperCase()} // {activeSub.toUpperCase()}
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-1">
              {activeSub === 'all' && `${activeDept.toUpperCase()} RELEASES`}
              {activeSub === 'shoes' && `${activeDept.toUpperCase()}'S FOOTWEAR`}
              {activeSub === 'clothes' && `${activeDept.toUpperCase()}'S APPAREL`}
              {activeSub === 'accessories' && `${activeDept.toUpperCase()}'S GEAR`}
              {activeSub === 'sale' && `${activeDept.toUpperCase()}'S CLEARANCE SALES`}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-gray-500">{displayedProducts.length} ITEMS</span>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="p-16 text-center bg-[#F5F5F5] rounded-3xl border border-[#E5E5E5]">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold uppercase text-sm">No Articles Found in this Category</h3>
            <p className="text-xs text-gray-500 mt-1">Check other departments or configure products in the Admin Tower.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedProducts.map((p) => {
              const isLiked = wishlistIds.includes(p.id);
              const mainImg = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80';
              const discountPct = p.sale_price ? Math.round(((p.base_price - p.sale_price) / p.base_price) * 100) : null;

              return (
                <div key={p.id} className="group flex flex-col justify-between">
                  <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden relative aspect-square flex items-center justify-center mb-3 border border-[#E5E5E5]">
                    
                    <Link href={`/product?slug=${p.slug}`} className="w-full h-full flex items-center justify-center">
                      <img
                        src={mainImg}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300"
                      />
                    </Link>

                    {discountPct && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" /> -{discountPct}% OFF
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
                    <div className="text-[11px] text-[#707072] font-semibold uppercase">{p.department} // {p.primary_category}</div>
                    <Link href={`/product?slug=${p.slug}`}>
                      <h3 className="font-bold text-sm text-black mt-0.5 group-hover:underline truncate">{p.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-black">${p.sale_price ?? p.base_price}</span>
                        {p.sale_price && (
                          <span className="text-xs text-gray-400 line-through font-mono">${p.base_price}</span>
                        )}
                      </div>
                      <button 
                        onClick={async () => {
                          const { id: cartId } = await getCart();
                          await addToCart(cartId, null, 1, p.id);
                          window.location.reload();
                        }}
                        className="p-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-full transition-colors"
                      >
                        <Plus className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. LOADOUT ROOM CALIBRATION STATION[cite: 4] */}
      {activeDept === 'all' && activeSub === 'all' && (
        <section id="loadout-room" className="py-20 border-t border-[#E5E5E5] bg-[#111111] text-white">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="bg-[#1E1E1E] border border-white/10 rounded-3xl p-8 lg:p-14 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                <div className="lg:col-span-4 space-y-6">
                  <div className="text-xs font-mono uppercase text-[#CCFF00] tracking-widest">[ LOADOUT CALIBRATION ]</div>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans">
                    AIR MAX PULSE 26
                  </h2>
                  <div className="text-2xl font-mono font-bold text-white">$165.00</div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-400">ENERGY REBOUND</span>
                        <span className="text-white font-bold">92%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#CCFF00]" style={{ width: '92%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-400">CUSHION SOFTNESS</span>
                        <span className="text-white font-bold">88%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#CCFF00]" style={{ width: '88%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-400">TRACTION STABILITY</span>
                        <span className="text-white font-bold">95%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#CCFF00]" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex items-center justify-center">
                  <div className="relative w-full aspect-square bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center p-8">
                    <img
                      src={loadoutImg} 
                      alt="Air Max Loadout" 
                      className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]" 
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">CHASSIS COLORWAY: {loadoutColor}</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setLoadoutColor('Crimson');
                          setLoadoutImg('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80');
                        }} 
                        className={`w-9 h-9 rounded-full bg-red-600 border-2 ${loadoutColor === 'Crimson' ? 'border-white ring-2 ring-[#CCFF00]' : 'border-transparent'}`}
                      />
                      <button 
                        onClick={() => {
                          setLoadoutColor('White Smoke');
                          setLoadoutImg('https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80');
                        }} 
                        className={`w-9 h-9 rounded-full bg-white border-2 ${loadoutColor === 'White Smoke' ? 'border-white ring-2 ring-[#CCFF00]' : 'border-transparent'}`}
                      />
                      <button 
                        onClick={() => {
                          setLoadoutColor('Phantom Black');
                          setLoadoutImg('https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80');
                        }} 
                        className={`w-9 h-9 rounded-full bg-gray-900 border-2 ${loadoutColor === 'Phantom Black' ? 'border-white ring-2 ring-[#CCFF00]' : 'border-transparent'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">SPEC SIZE (US)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['8', '9', '10', '11'].map((sz) => (
                        <button 
                          key={sz}
                          onClick={() => setLoadoutSize(sz)} 
                          className={`py-2.5 rounded text-xs font-bold transition-all ${
                            loadoutSize === sz 
                              ? 'bg-white text-black border border-white' 
                              : 'bg-white/5 border border-white/10 text-white hover:border-white'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      const { id: cartId } = await getCart();
                      await addToCart(cartId, null, 1, heroProduct?.id);
                      alert(`Air Max Pulse 26 (${loadoutColor} - US ${loadoutSize}) added to bag.`);
                      window.location.reload();
                    }}
                    className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#CCFF00] transition-all shadow-xl"
                  >
                    [ EQUIP / ADD TO BAG ]
                  </button>
                </div>

              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono">LOADING PERFORMANCE ARCHIVE...</div>}>
      <HomeContent />
    </Suspense>
  );
}