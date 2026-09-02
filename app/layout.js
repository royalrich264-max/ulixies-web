'use client';

import './globals.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  getCart,
  getCurrentUser,
  getHomeProducts,
  getWishlist,
  getStoreContent,
  getStoreSettings,
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
  ImageOff
} from 'lucide-react';

const DIVISION_ACTIVITIES = {
  shoes: ['Gym & Training', 'Running', 'Lifestyle / Everyday', 'Basketball', 'Football / Soccer', 'Trail & Outdoor'],
  clothing: ['Gym & Workout Shirts', 'Hoodies & Sweatshirts', 'Training Shorts', 'Track Pants & Tights', 'Jackets & Outerwear', 'Everyday Casual'],
  accessories: ['Training Bags & Backpacks', 'Performance Socks', 'Caps & Headwear', 'Gloves & Gym Straps'],
};

export default function RootLayout({ children }) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDept, setHoveredDept] = useState(null);
  const [deptData, setDeptData] = useState({});
  const [announcementBar, setAnnouncementBar] = useState('');
  const [siteSettings, setSiteSettings] = useState({ store_name: 'ULIXIES RESELLER CORP', contact_email: '', phone: '' });

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

        const saved = await getWishlist();
        setWishlistCount(saved.length);

        const cmsContent = await getStoreContent('homepage_hero');
        if (cmsContent?.announcementBar) setAnnouncementBar(cmsContent.announcementBar);

        const generalSettings = await getStoreSettings('general');
        if (generalSettings) setSiteSettings((prev) => ({ ...prev, ...generalSettings }));

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

    const handleWishlistUpdate = async () => {
      const list = await getWishlist();
      setWishlistCount(list.length);
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

  const activeMegaDept = navDepartments.find((d) => d.id === hoveredDept);
  const megaDeptQuery = hoveredDept && hoveredDept !== 'all' ? `dept=${hoveredDept}&` : '';

  return (
    <html lang="en">
      <body className="bg-white text-[#111111] antialiased min-h-screen flex flex-col font-sans selection:bg-[#111111] selection:text-white">

        {/* ANNOUNCEMENT BAR (admin-configurable via Storefront CMS) */}
        {announcementBar && (
          <div className="bg-black text-[#CCFF00] text-center text-[11px] font-bold uppercase tracking-wider py-2 px-4">
            {announcementBar}
          </div>
        )}

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
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E5E5E5] px-6 h-16 flex items-center justify-between relative">
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

            {/* DESKTOP DEPARTMENT NAV */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider h-full">
              {navDepartments.map((dept) => (
                <Link
                  key={dept.id}
                  href={dept.href}
                  onMouseEnter={() => setHoveredDept(dept.id)}
                  onMouseLeave={() => setHoveredDept(null)}
                  className="h-full flex items-center text-gray-800 hover:text-black transition-colors"
                >
                  {dept.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* FULL-WIDTH MEGA MENU PANEL */}
          {activeMegaDept && (
            <div
              onMouseEnter={() => setHoveredDept(activeMegaDept.id)}
              onMouseLeave={() => setHoveredDept(null)}
              className="hidden lg:block absolute left-0 right-0 top-full bg-white border-b border-[#E5E5E5] shadow-lg z-50"
            >
              <div className="max-w-[1440px] mx-auto px-10 py-10 grid grid-cols-4 gap-10 text-left normal-case">

                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-black mb-4">Highlights</h4>
                  <div className="flex flex-col gap-2.5 text-[13px] font-medium">
                    <Link href={`/?${megaDeptQuery}sub=all`} className="text-gray-500 hover:text-black hover:underline w-fit">All Articles</Link>
                    <Link href={`/?${megaDeptQuery}sub=new-arrivals`} className="text-gray-500 hover:text-black hover:underline w-fit">New Arrivals</Link>
                    <Link href={`/?${megaDeptQuery}sub=best-sellers`} className="text-gray-500 hover:text-black hover:underline w-fit">Best Sellers</Link>
                    <Link href={`/?${megaDeptQuery}sub=sale`} className="text-red-600 hover:underline w-fit">Sale</Link>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-black mb-4">Shoes</h4>
                  <div className="flex flex-col gap-2.5 text-[13px] font-medium">
                    <Link href={`/?${megaDeptQuery}sub=shoes`} className="text-gray-500 hover:text-black hover:underline w-fit">All Shoes</Link>
                    {DIVISION_ACTIVITIES.shoes.map((act) => (
                      <Link key={act} href={`/?${megaDeptQuery}sub=shoes&activity=${encodeURIComponent(act)}`} className="text-gray-500 hover:text-black hover:underline w-fit">
                        {act}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-black mb-4">Clothing</h4>
                  <div className="flex flex-col gap-2.5 text-[13px] font-medium">
                    <Link href={`/?${megaDeptQuery}sub=clothes`} className="text-gray-500 hover:text-black hover:underline w-fit">All Clothing</Link>
                    {DIVISION_ACTIVITIES.clothing.map((act) => (
                      <Link key={act} href={`/?${megaDeptQuery}sub=clothes&activity=${encodeURIComponent(act)}`} className="text-gray-500 hover:text-black hover:underline w-fit">
                        {act}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-black mb-4">Accessories</h4>
                  <div className="flex flex-col gap-2.5 text-[13px] font-medium">
                    <Link href={`/?${megaDeptQuery}sub=accessories`} className="text-gray-500 hover:text-black hover:underline w-fit">All Accessories</Link>
                    {DIVISION_ACTIVITIES.accessories.map((act) => (
                      <Link key={act} href={`/?${megaDeptQuery}sub=accessories&activity=${encodeURIComponent(act)}`} className="text-gray-500 hover:text-black hover:underline w-fit">
                        {act}
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

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
                        const img = prod.product_images?.[0]?.url;
                        return (
                          <Link
                            key={prod.id}
                            href={`/product?slug=${prod.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-[#E5E5E5] transition-all"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg p-1 shrink-0 flex items-center justify-center border">
                              {img ? (
                                <img src={img} alt={prod.name} className="object-contain max-h-full max-w-full" />
                              ) : (
                                <ImageOff className="w-4 h-4 text-gray-300" />
                              )}
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
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#CCFF00]" />
                <span>© {new Date().getFullYear()} {siteSettings.store_name}. ALL RIGHTS RESERVED.</span>
              </div>
              {(siteSettings.contact_email || siteSettings.phone) && (
                <div className="text-[11px] text-gray-500">
                  {siteSettings.contact_email}
                  {siteSettings.contact_email && siteSettings.phone && ' • '}
                  {siteSettings.phone}
                </div>
              )}
            </div>
            <div className="flex gap-6 uppercase font-bold">
              <Link href="/orders" className="hover:text-white">Orders</Link>
              <Link href="/addresses" className="hover:text-white">Addresses</Link>
              <Link href="/wishlist" className="hover:text-white">Saved Gear</Link>
              <Link href="/support" className="hover:text-white">Customer Support</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}