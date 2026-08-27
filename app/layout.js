'use client';

import './globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  Flame,
  ArrowRight,
  Footprints,
  Shirt,
  Briefcase
} from 'lucide-react';

export default function RootLayout({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDept, setHoveredDept] = useState(null);
  const [deptData, setDeptData] = useState({});

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
        
        const depts = ['all', 'men', 'women', 'kids', 'sports', 'sale'];
        const compiled = {};

        depts.forEach((d) => {
          let list = allProds;
          if (d === 'sale') {
            list = allProds.filter(p => p.is_on_sale || p.sale_price);
          } else if (d !== 'all') {
            list = allProds.filter(p => p.department === d);
          }

          compiled[d] = {
            total: list.length,
            newDrops: list.filter(p => p.is_new).length,
            shoes: list.filter(p => p.primary_category === 'shoes').length,
            clothes: list.filter(p => p.primary_category === 'clothing').length,
            accessories: list.filter(p => p.primary_category === 'accessories').length,
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
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, []);

  const navDepartments = [
    { id: 'all', label: 'All Releases', href: '/' },
    { id: 'men', label: 'Men', href: '/?dept=men' },
    { id: 'women', label: 'Women', href: '/?dept=women' },
    { id: 'kids', label: 'Kids', href: '/?dept=kids' },
    { id: 'sports', label: 'Sports & Performance', href: '/?dept=sports' },
    { id: 'sale', label: 'Sale', href: '/?dept=sale' },
  ];

  return (
    <html lang="en">
      <body className="bg-white text-[#111111] antialiased min-h-screen flex flex-col font-sans">
        
        {/* TOP ATHLETE BAR */}
        <div className="bg-[#111111] text-white px-6 h-9 flex items-center justify-between text-[11px] font-mono border-b border-white/10 z-50 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
            <span className="font-bold tracking-wider">ULIXIES // PERFORMANCE ARCHIVE</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/orders" className="hover:text-[#CCFF00] transition-colors flex items-center gap-1.5 font-bold">
              <Package className="w-3.5 h-3.5 text-[#CCFF00]" /> My Orders
            </Link>
            <Link href="/addresses" className="hover:text-[#CCFF00] transition-colors flex items-center gap-1.5 font-bold">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> Delivery Addresses
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3 border-l border-white/20 pl-4">
                <span className="text-[#CCFF00] font-bold flex items-center gap-1">
                  <User className="w-3 h-3" /> {user.email}
                </span>
                <button
                  onClick={async () => { await signOutUser(); window.location.reload(); }}
                  className="text-gray-400 hover:text-red-400 font-bold transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hover:text-[#CCFF00] transition-colors font-bold border-l border-white/20 pl-4">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>

        {/* MAIN NAVIGATION HEADER */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E5E5E5] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8 h-full">
            <Link href="/" className="font-black text-2xl tracking-tighter uppercase font-mono">
              ULIXIES
            </Link>

            {/* DESKTOP HOVERABLE FLYOUT MENU WITH LIVE PRODUCT IMAGES */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider h-full">
              {navDepartments.map((dept) => {
                const stats = deptData[dept.id] || { total: 0, newDrops: 0, shoes: 0, clothes: 0, recentProducts: [] };

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
                      <div className="absolute top-16 left-0 w-[520px] bg-white border border-[#E5E5E5] shadow-2xl rounded-2xl p-5 z-50 text-left grid grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN: STATS & CATEGORY LINKS */}
                        <div className="col-span-6 border-r border-[#E5E5E5] pr-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2 mb-3">
                              <span className="font-black text-xs uppercase tracking-wider">{dept.label}</span>
                              <span className="text-[10px] font-mono font-bold bg-[#111111] text-white px-2 py-0.5 rounded">
                                {stats.total} TOTAL
                              </span>
                            </div>

                            <div className="mb-3 bg-red-50 p-2 rounded-xl flex items-center justify-between border border-red-100">
                              <span className="text-[11px] font-bold flex items-center gap-1.5 text-red-900">
                                <Flame className="w-3.5 h-3.5 text-red-600" /> New Arrivals
                              </span>
                              <span className="font-mono text-xs font-black text-red-600">
                                +{stats.newDrops}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs font-bold">
                              <Link
                                href={dept.id === 'all' ? '/#shoes-section' : `/?dept=${dept.id}#shoes-section`}
                                className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Footprints className="w-3.5 h-3.5 text-gray-700" /> Footwear</span>
                                <span className="font-mono text-gray-400 font-normal">{stats.shoes}</span>
                              </Link>

                              <Link
                                href={dept.id === 'all' ? '/#clothing-section' : `/?dept=${dept.id}#clothing-section`}
                                className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Shirt className="w-3.5 h-3.5 text-gray-700" /> Apparel</span>
                                <span className="font-mono text-gray-400 font-normal">{stats.clothes}</span>
                              </Link>

                              <Link
                                href={dept.id === 'all' ? '/#accessories-section' : `/?dept=${dept.id}#accessories-section`}
                                className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-gray-700" /> Accessories</span>
                                <span className="font-mono text-gray-400 font-normal">{stats.accessories || 0}</span>
                              </Link>
                            </div>
                          </div>

                          <Link
                            href={dept.href}
                            className="text-[10px] font-mono font-bold text-black flex items-center justify-between hover:underline pt-3 border-t border-[#E5E5E5] mt-3"
                          >
                            <span>EXPLORE FULL ARCHIVE</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* RIGHT COLUMN: REAL RECENT PRODUCT PREVIEWS */}
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
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
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
                            <div className="text-[10px] text-gray-400 italic py-4 text-center">No active drops in this category</div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* ACTION ICONS */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/wishlist"
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors relative"
              title="Saved Gear"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors relative"
              title="Athlete Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-black rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* MOBILE SLIDE-OUT MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-25 bg-white z-50 p-6 flex flex-col justify-between border-b border-[#E5E5E5] overflow-y-auto">
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase font-bold text-gray-400">Department Releases</div>
              <div className="flex flex-col space-y-3 text-lg font-black uppercase tracking-tight">
                {navDepartments.map((dept) => (
                  <Link
                    key={dept.id}
                    href={dept.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-gray-500 transition-colors flex justify-between items-center"
                  >
                    <span>{dept.label}</span>
                    <span className="text-xs font-mono font-normal text-gray-400">{deptData[dept.id]?.total || 0} items</span>
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

        <footer className="bg-[#111111] text-white border-t border-[#222222] py-12 px-6 mt-20">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 font-mono">
            <div>© {new Date().getFullYear()} ULIXIES ATHLETICS. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-6 uppercase font-bold">
              <Link href="/orders" className="hover:text-white">Orders</Link>
              <Link href="/addresses" className="hover:text-white">Addresses</Link>
              <Link href="/wishlist" className="hover:text-white">Saved Gear</Link>
              <Link href="/admin" className="hover:text-[#CCFF00]">Owner Control Tower</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}