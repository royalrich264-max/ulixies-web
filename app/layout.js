'use client';
import './globals.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, Heart, Search, User } from 'lucide-react';

export default function RootLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <html lang="en">
      <body className="bg-white text-[#111111] antialiased min-h-screen flex flex-col justify-between">
        {/* Global Navbar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black tracking-tight uppercase font-sans">
              ULIXIES
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#111111]">
              <Link href="/shop" className="hover:text-[#707072] transition-colors">Shop All</Link>
              <Link href="/shop?category=men" className="hover:text-[#707072] transition-colors">Men</Link>
              <Link href="/shop?category=women" className="hover:text-[#707072] transition-colors">Women</Link>
              <Link href="/orders" className="hover:text-[#707072] transition-colors">My Orders</Link>
              <Link href="/addresses" className="hover:text-[#707072] transition-colors">Addresses</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Functional Global Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search shoes, gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#F5F5F5] text-xs font-medium pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-black outline-none w-44 focus:w-64 transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </form>

            <Link href="/wishlist" className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </Link>
            <Link href="/login" className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-[#111111] text-white py-12 px-6 border-t border-[#333333]">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-black text-xl tracking-tighter uppercase">ULIXIES INC.</div>
            <div className="flex gap-6 text-xs text-gray-400">
              <Link href="/shop" className="hover:text-white">Shop</Link>
              <Link href="/orders" className="hover:text-white">My Orders</Link>
              <Link href="/addresses" className="hover:text-white">Shipping Addresses</Link>
            </div>
            <div className="text-[11px] text-gray-500 font-mono">© 2026 ULIXIES RESELLER SYSTEM</div>
          </div>
        </footer>
      </body>
    </html>
  );
}