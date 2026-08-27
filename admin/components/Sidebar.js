'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Boxes, 
  ShoppingBag, 
  Users, 
  Megaphone, 
  Star, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  Settings, 
  Globe, 
  LogOut,
  ArrowLeftRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

const navigation = [
  {
    group: 'CORE OPERATING OS',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Products & Matrix', href: '/products', icon: Package },
      { name: 'Categories & Brands', href: '/products/categories', icon: Layers },
      { name: 'Multi-Warehouse', href: '/inventory', icon: Boxes },
      { name: 'Orders & Invoices', href: '/orders', icon: ShoppingBag },
    ]
  },
  {
    group: 'CRM & RELATIONSHIPS',
    items: [
      { name: 'Customers & VIP', href: '/customers', icon: Users },
      { name: 'Returns & Claims', href: '/returns', icon: ArrowLeftRight },
      { name: 'Marketing & Promos', href: '/marketing', icon: Megaphone },
      { name: 'Review Moderation', href: '/reviews', icon: Star },
      { name: 'Analytics & AI', href: '/analytics', icon: BarChart3 },
    ]
  },
  {
    group: 'ENTERPRISE & CMS',
    items: [
      { name: 'Staff & Roles', href: '/staff', icon: ShieldCheck },
      { name: 'Storefront CMS', href: '/cms', icon: Sparkles },
      { name: 'System Settings', href: '/settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col h-screen z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-base shadow-xs">
            U
          </div>
          <div>
            <div className="font-black text-base tracking-tight text-[#111111] flex items-center space-x-1.5">
              <span>ULIXIES</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#475569] font-bold border border-[#E5E7EB]">OS</span>
            </div>
            <div className="text-[10px] font-mono text-[#64748B] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>storefront active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigation.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3 text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              {group.group}
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                        : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <div className="pt-2">
          <Link
            href="/login"
            className="flex items-center space-x-3 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A]"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </Link>
        </div>

        {/* Bottom Help Widget Card matching screenshot */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 mt-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0F172A]">
            <HelpCircle className="w-4 h-4 text-[#64748B]" />
            <span>Need help?</span>
          </div>
          <p className="text-[11px] text-[#64748B]">View docs or contact support.</p>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[10px] font-bold uppercase text-[#0F172A] hover:bg-[#F1F5F9] transition-all"
          >
            <span>VIEW DOCUMENTATION</span>
            <ExternalLink className="w-3 h-3 text-[#64748B]" />
          </a>
        </div>
      </div>
    </aside>
  );
}
