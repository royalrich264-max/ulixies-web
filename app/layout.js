'use client';

import './globals.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  getCart, 
  getCurrentUser, 
  getHomeProducts, 
  getLocalWishlist, 
  signOutUser 
} from '@/services/storeService';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  Package, 
  MapPin, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Crown,
  ShieldCheck,
  ArrowRight,
  Footprints,
  Shirt,
  Briefcase,
  Percent,
  Layers
} from 'lucide-react';

export default function RootLayout({ children }) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDept, setHoveredDept] = useState(null);
  const [deptData, setDeptData] = useState({});

  // Search Engine State
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const u = await getCurrentUser();
        setUser(u);

        const { items } = await getCart();
        const totalCart = (items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(totalCart);

        const saved = getLocalWishlist();
        setWishlistCount(saved.length);

        const allProds = await getHomeProducts();
        setAllProducts(allProds || []);
        
        const depts = ['all', 'men', 'women', 'kids', 'sports'];
        const compiled = {};

        depts.forEach((d) => {
          const list = d === 'all' ? allProds : allProds.filter(p => p.department === d);

          compiled[d] = {
            total: list.length,
            newDrops: list.filter(p => p.is_new).length,
            shoes: list.filter(p => p.primary_category === 'shoes').length,
            clothes: list.filter(p => p.primary_category === 'clothing').length,
            accessories: list.filter(p => p.primary_category === 'accessories').length,
            sale: list.filter(p => p.is_on_sale || (p.sale_price && Number(p.sale_price) < Number(p.base_price))).length,
            recentProducts: list.slice(0, 3)
          };
        });

        setDeptData(compiled);
      } catch (e) {
        console.error('Header data load error:', e);
      }
    }

    loadHeaderData();

    const handleWishlistUpdate = () => {
      setWishlistCount(getLocalWishlist().length);
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const q = val.toLowerCase();
    const matches = allProducts.filter((p) => 
      p.name?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      p.primary_category?.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    ).slice(0, 5);
    setSearchResults(matches);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navDepartments = [
    { id: 'all', label: 'All Releases', href: '/' },
    { id: 'men', label: 'Men', href: '/?dept=men' },
    { id: 'women', label: 'Women', href: '/?dept=women' },
    { id: 'kids', label: 'Kids', href: '/?dept=kids' },
    { id: 'sports', label: 'Sports & Performance', href: '/?dept=sports' },
  ];

  return (
    <html lang="en">
      <body className="bg-white text-[#111111] antialiased min-h-screen flex flex-col font-sans selection:bg-[#111111] selection:text-white">
        
        {/* ATHLETE PASSPORT BAR */}
        <div className="bg-[#F5F5F5] text-[#707072] border-b border-[#E5E5E5] px-6 h-9 flex items-center justify-between text-[11px] font-medium z-50 relative">
          <div className="flex items-center gap-6">
            <span className="text-[#111111] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" /> ATHLETE PASSPORT
            </span>
            <span className="hidden md:inline-block border-l border-[#E5E5E5] pl-4 text-[10px] font-mono uppercase">
              STATUS: PRO TIER VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/orders" className="hover:text-[#111111] transition-colors flex items-center gap-1 font-bold text-xs">
              <Package className="w-3.5 h-3.5 text-[#111111]" /> My Orders
            </Link>
            <Link href="/addresses" className="hover:text-[#111111] transition-colors flex items-center gap-1 font-bold text-xs">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> Delivery Addresses
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3 border-l border-[#E5E5E5] pl-4">
                <span className="text-[#111111] font-mono font-bold flex items-center gap-1">
                  <User className="w-3 h-3" /> {user.email}
                </span>
                <button
                  onClick={async () => { await signOutUser(); window.location.reload(); }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hover:text-[#111111] font-bold text-xs border-l border-[#E5E5E5] pl-4">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>

        {/* PRIMARY NAVIGATION HEADER */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E5E5E5] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8 h-full">
            
            {/* BRAND LOGO WITH CROWN */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-black text-[#CCFF00] flex items-center justify-center group-hover:bg-[#CCFF00] group-hover:text-black transition-colors shadow-sm">
                <Crown className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase font-mono text-black">
                ULIXIES
              </span>
            </Link>

            {/* DESKTOP HOVERABLE FLYOUT DIRECTORY */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider h-full">
              {navDepartments.map((dept) => {
                const stats = deptData[dept.id] || { total: 0, newDrops: 0, shoes: 0, clothes: 0, accessories: 0, sale: 0, recentProducts: [] };

                return (
                  <div
                    key={dept.id}
                    className="h-full flex items-center relative group"
                    onMouseEnter={() => setHoveredDept(dept.id)}
                    onMouseLeave={() => setHoveredDept(null)}
                  >
                    <Link
                      href={dept.href}
                      className="text-gray-800 hover:text-black transition-colors py-4 flex items-center gap-1 group-hover:text-black"
                    >
                      {dept.label}
                    </Link>

                    {hoveredDept === dept.id && (
                      <div className="absolute top-16 left-0 w-[540px] bg-white border border-[#E5E5E5] shadow-2xl rounded-2xl p-5 z-50 text-left grid grid-cols-12 gap-6">
                        
                        <div className="col-span-6 border-r border-[#E5E5E5] pr-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2 mb-3">
                              <span className="font-black text-xs uppercase tracking-wider">{dept.label}</span>
                              <span className="text-[10px] font-mono font-bold bg-[#111111] text-white px-2 py-0.5 rounded">
                                {stats.total} TOTAL
                              </span>
                            </div>

                            <div className="space-y-1 text-xs font-bold">
                              <Link
                                href={dept.id === 'all' ? '/?sub=all' : `/?dept=${dept.id}&sub=all`}
                                className="flex justify-between items-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-gray-700" /> All Articles</span>
                                <span className="font-mono text-gray-400 font-normal">{stats.total}</span>
                              </Link>

                              <Link
                                href={dept.id === 'all' ? '/?sub=shoes' : `/?dept=${dept.id}&sub=shoes`}
                                className="flex justify-between items-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Footprints className="w-3.5 h-3.5 text-gray-700" /> Shoes</span>
                                <span className="font-mono text-gray-400 font-normal">{stats.shoes}</span>
                              </Link>

                              <Link
                                href={dept.id === 'all' ? '/?sub=clothes' : `/?dept=${dept.id}&sub=clothes`}
                                className="flex justify-between items-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Shirt className="w-3.5 h-3.5 text-gray-700" /> Clothes</span>
                                <span className="font-mono text-gray-400 font-normal">{stats.clothes}</span>
                              </Link>

                              <Link
                                href={dept.id === 'all' ? '/?sub=accessories' : `/?dept=${dept.id}&sub=accessories`}
                                className="flex justify-between items-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-gray-700" /> Accessories</span>
                                <span className="font-mono text-gray-400 font-normal">{stats.accessories}</span>
                              </Link>

                              <Link
                                href={dept.id === 'all' ? '/?sub=sale' : `/?dept=${dept.id}&sub=sale`}
                                className="flex justify-between items-center p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Percent className="w-3.5 h-3.5" /> Sales</span>
                                <span className="font-mono font-bold">{stats.sale}</span>
                              </Link>
                            </div>
                          </div>

                          <Link
                            href={dept.href}
                            className="text-[10px] font-mono font-bold text-black flex items-center justify-between hover:underline pt-3 border-t border-[#E5E5E5] mt-3"
                          >
                            <span>EXPLORE ALL {dept.label.toUpperCase()}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="col-span-6 space-y-2">
                          <div className="text-[10px] font-mono uppercase font-bold text-gray-400">Featured Releases</div>
                          {stats.recentProducts && stats.recentProducts.length > 0 ? (
                            stats.recentProducts.map((p) => {
                              const img = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80';
                              return (
                                <Link
                                  key={p.id}
                                  href={`/product?slug=${p.slug}`}
                                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-[#E5E5E5] transition-all"
                                >
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden border">
                                    <img src={img} alt={p.name} className="object-contain max-h-full max-w-full" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="font-bold text-[11px] truncate text-black">{p.name}</div>
                                    <div className="font-mono text-[10px] text-gray-500 font-bold">${p.sale_price ?? p.base_price}</div>
                                  </div>
                                </Link>
                              );
                            })
                          ) : (
                            <div className="text-[10px] text-gray-400 italic py-4 text-center">No active drops</div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* ACTION BUTTONS & SEARCH INPUT */}
          <div className="flex items-center gap-3">
            <div ref={searchContainerRef} className="relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => setSearchOpen(true)}
                  className="w-40 sm:w-60 pl-9 pr-8 py-2 bg-[#F5F5F5] border border-[#E5E5E5] focus:border-black rounded-full text-xs font-bold outline-none transition-all focus:w-68"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="absolute right-3 text-gray-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {searchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-[#E5E5E5] shadow-2xl rounded-2xl p-4 z-50">
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((prod) => {
                        const img = prod.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80';
                        return (
                          <Link
                            key={prod.id}
                            href={`/product?slug=${prod.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-[#E5E5E5] transition-all"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg p-1 shrink-0 flex items-center justify-center border">
                              <img src={img} alt={prod.name} className="object-contain max-h-full max-w-full" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <div className="font-bold text-xs text-black truncate">{prod.name}</div>
                              <div className="font-mono text-[11px] text-gray-600">${prod.sale_price ?? prod.base_price}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-gray-400 font-mono">No results found</div>
                  )}
                </div>
              )}
            </div>

            <Link href="/wishlist" className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full relative" title="Saved Gear">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full relative" title="Bag">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-700">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* MOBILE SLIDE-OUT DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-25 bg-white z-50 p-6 flex flex-col justify-between border-b border-[#E5E5E5] overflow-y-auto">
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase font-bold text-gray-400">Departments</div>
              <div className="flex flex-col space-y-3 text-lg font-black uppercase tracking-tight">
                {navDepartments.map((dept) => (
                  <Link
                    key={dept.id}
                    href={dept.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-gray-500 transition-colors flex justify-between items-center"
                  >
                    <span>{dept.label}</span>
                    <span className="text-xs font-mono font-normal text-gray-400">{deptData[dept.id]?.total || 0}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-[#E5E5E5] space-y-3 text-sm font-bold uppercase">
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" /> Saved Gear ({wishlistCount})
                </Link>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                <Link href="/addresses" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Addresses
                </Link>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-[#111111] text-white border-t border-[#222222] py-12 px-6 mt-20">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#CCFF00]" />
              <span>© 2026 ULIXIES RESELLER CORP. ALL RIGHTS RESERVED.</span>[cite: 1]
            </div>
            <div className="flex gap-6 uppercase font-bold">
              <Link href="/orders" className="hover:text-white">Orders</Link>
              <Link href="/addresses" className="hover:text-white">Addresses</Link>
              <Link href="/wishlist" className="hover:text-white">Saved Gear</Link>
              <Link href="/admin" className="hover:text-[#CCFF00]">Admin Tower</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}