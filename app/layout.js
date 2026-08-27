'use client';

import './globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCart, getCurrentUser } from '@/services/storeService';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Heart, 
  Package, 
  MapPin, 
  ShieldCheck, 
  Menu, 
  X 
} from 'lucide-react';

export default function RootLayout({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        const { items } = await getCart();
        const total = (items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(total);
      } catch (e) {
        console.error('Header data loading error:', e);
      }
    }
    loadHeaderData();
  }, []);

  const navLinks = [
    { label: 'All Releases', href: '/' },
    { label: 'Men', href: '/?dept=men' },
    { label: 'Women', href: '/?dept=women' },
    { label: 'Kids', href: '/?dept=kids' },
    { label: 'Sports & Performance', href: '/?dept=sports' },
    { label: 'Sale', href: '/?dept=sale' },
  ];

  return (
    <html lang="en">
      <body className="bg-white text-[#111111] antialiased min-h-screen flex flex-col">
        
        {/* TOP UTILITY STRIP */}
        <div className="bg-[#111111] text-white px-6 h-9 flex items-center justify-between text-[11px] font-mono border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
            <span className="font-bold tracking-wider">ULIXIES // OFFICIAL ATHLETE STORE</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/orders" className="hover:text-[#CCFF00] transition-colors flex items-center gap-1.5 font-bold">
              <Package className="w-3.5 h-3.5" /> Orders
            </Link>
            <Link href="/addresses" className="hover:text-[#CCFF00] transition-colors flex items-center gap-1.5 font-bold">
              <MapPin className="w-3.5 h-3.5" /> Addresses
            </Link>
            {user ? (
              <span className="text-gray-400 font-bold">{user.email.split('@')[0]}</span>
            ) : (
              <Link href="/login" className="hover:text-[#CCFF00] transition-colors font-bold">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* MAIN STOREFRONT HEADER */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E5E5E5] px-6 h-16 flex items-center justify-between">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-8">
            <Link href="/" className="font-black text-2xl tracking-tighter uppercase font-mono">
              ULIXIES
            </Link>

            {/* DESKTOP DEPARTMENT LINKS */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-700 hover:text-black transition-colors hover:underline underline-offset-8"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT ICONS (Search, Wishlist, Cart, Mobile Toggle) */}
          <div className="flex items-center gap-4">
            <Link href="/search" className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors" title="Search">
              <Search className="w-5 h-5" />
            </Link>

            <Link href="/wishlist" className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors" title="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>

            <Link href="/cart" className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors relative" title="Bag">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* MOBILE HAMBURGER */}
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
              <div className="text-[10px] font-mono uppercase font-bold text-gray-400">Departments</div>
              <div className="flex flex-col space-y-3 text-lg font-black uppercase tracking-tight">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-gray-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-[#E5E5E5] space-y-3 text-sm font-bold uppercase">
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

        {/* MAIN BODY VIEW */}
        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-[#111111] text-white border-t border-[#222222] py-12 px-6 mt-20">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 font-mono">
            <div>© {new Date().getFullYear()} ULIXIES ATHLETICS. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-6 uppercase font-bold">
              <Link href="/orders" className="hover:text-white">Track Order</Link>
              <Link href="/addresses" className="hover:text-white">Shipping Book</Link>
              <Link href="/admin" className="hover:text-[#CCFF00]">Owner Tower</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}