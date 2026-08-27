'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { 
  Search, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Layers, 
  Boxes, 
  BarChart3, 
  Tag, 
  ShieldCheck, 
  Sparkles, 
  Sun, 
  Moon, 
  Plus, 
  X,
  ArrowRight
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems = [
    { label: 'Dashboard Overview', href: '/', icon: LayoutDashboard, category: 'Navigation' },
    { label: 'Product Inventory & Matrix', href: '/products', icon: Package, category: 'Catalog' },
    { label: 'Categories & Brands', href: '/products/categories', icon: Layers, category: 'Catalog' },
    { label: 'Multi-Warehouse Stock', href: '/inventory', icon: Boxes, category: 'Inventory' },
    { label: 'Orders & Fulfillment', href: '/orders', icon: ShoppingBag, category: 'Sales' },
    { label: 'Customer CRM & Loyalty', href: '/customers', icon: Users, category: 'Customers' },
    { label: 'Marketing & Campaigns', href: '/marketing', icon: Tag, category: 'Promotions' },
    { label: 'Reviews & Ratings', href: '/reviews', icon: Sparkles, category: 'Feedback' },
    { label: 'Analytics & AI Forecasting', href: '/analytics', icon: BarChart3, category: 'Intelligence' },
    { label: 'Staff Management & RBAC', href: '/staff', icon: ShieldCheck, category: 'Enterprise' },
    { label: 'Storefront CMS', href: '/cms', icon: Layers, category: 'Content' },
    { label: 'Settings & Multi-Currency', href: '/settings', icon: Settings, category: 'System' },
  ];

  const actionItems = [
    { 
      label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 
      icon: theme === 'light' ? Moon : Sun, 
      action: () => { toggleTheme(); onClose(); } 
    },
    { 
      label: 'Create New Product', 
      icon: Plus, 
      action: () => { router.push('/products'); onClose(); } 
    },
    { 
      label: 'Open Storefront (New Tab)', 
      icon: ArrowRight, 
      action: () => { window.open('http://localhost:3000', '_blank'); onClose(); } 
    },
  ];

  const filteredNav = navigationItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search modules... (Esc to exit)"
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {/* Quick Actions */}
          {!query && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Quick Shortcuts & Actions
              </div>
              <div className="space-y-1">
                {actionItems.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      onClick={act.action}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-indigo-500" />
                        <span>{act.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Action</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Admin OS Modules
            </div>
            <div className="space-y-1">
              {filteredNav.length === 0 ? (
                <div className="px-3 py-4 text-xs text-center text-slate-400">
                  No matching module found.
                </div>
              ) : (
                filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
