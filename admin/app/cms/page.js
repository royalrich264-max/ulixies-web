'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Save, Check, Layers } from 'lucide-react';
import { getStoreContent, updateStoreContent } from '../../services/adminService';

export default function CMSPage() {
  const [heroContent, setHeroContent] = useState({
    headline: 'AIR ZOOM ALPHA 26',
    subheadline: 'ENGINEERED WITH FLYKNIT REBOUND & DUAL ZOOM AIR UNITS',
    badge: 'SEASON DROP // TIER 04',
    cta_text: 'DISCOVER COLLECTION',
    cta_link: '/shop'
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadCMS() {
      setLoading(true);
      const dbHero = await getStoreContent('homepage_hero');
      if (dbHero) {
        setHeroContent(prev => ({ ...prev, ...dbHero }));
      }
      setLoading(false);
    }
    loadCMS();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaved(false);
    try {
      await updateStoreContent('homepage_hero', heroContent);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(`Error saving CMS: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
          LIVE STOREFRONT CMS & HERO DROP MANAGER
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Directly controls the live storefront 360° Hero Showcase text, drop badges, and CTA links via Supabase.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Banner Config */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
            <Sparkles className="w-5 h-5" />
            <h2>Storefront 360° Hero Showcase (homepage_hero)</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">Headline</label>
              <input
                type="text"
                required
                value={heroContent.headline}
                onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-black uppercase text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">Subheadline Specs</label>
              <input
                type="text"
                required
                value={heroContent.subheadline}
                onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">Drop Badge Text</label>
                <input
                  type="text"
                  value={heroContent.badge}
                  onChange={(e) => setHeroContent({ ...heroContent, badge: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 dark:text-slate-100 font-bold uppercase mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={heroContent.cta_text}
                  onChange={(e) => setHeroContent({ ...heroContent, cta_text: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'PUBLISHED LIVE TO STOREFRONT!' : 'SAVE & PUBLISH TO STOREFRONT'}</span>
        </button>
      </form>
    </div>
  );
}
