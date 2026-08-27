'use client';

import { Search, Bell, ExternalLink } from 'lucide-react';

export default function Header({ onOpenCommandPalette }) {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Command Search Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center space-x-3 bg-white hover:bg-[#F8FAFC] border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] px-4 py-2 rounded-full text-xs font-medium w-80 shadow-2xs transition-all"
      >
        <Search className="w-4 h-4 text-[#94A3B8]" />
        <span className="flex-1 text-left text-xs">Search modules, products...</span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] rounded-md">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Storefront Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold shadow-2xs transition-all"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
        </a>

        {/* Notifications with counter 3 */}
        <button className="relative p-2 rounded-full text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
          <Bell className="w-5 h-5 text-[#334155]" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#0F172A] text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2.5 border-l border-[#E5E7EB] pl-4">
          <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-[#0F172A]">Super Admin</div>
            <div className="text-[10px] font-mono text-[#64748B]">admin@ulixies.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
