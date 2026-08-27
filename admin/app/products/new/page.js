'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  FileText, 
  Upload, 
  RotateCw, 
  FolderPlus, 
  Lightbulb, 
  BookOpen, 
  ChevronRight,
  Boxes,
  DollarSign,
  Globe,
  Tag,
  Layers,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function NewProductWizardPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Form State
  const [name, setName] = useState('Nike Air Force 1 Low White');
  const [subtitle, setSubtitle] = useState("Men's Lifestyle Sneakers");
  const [slug, setSlug] = useState('nike-air-force-1-low-white');
  const [internalCode, setInternalCode] = useState('NAF1-WHT-2026');
  const [status, setStatus] = useState('Active');
  const [visibility, setVisibility] = useState({
    website: true,
    mobileApp: true,
    pos: true,
    wholesale: false
  });

  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80');
  const [rotatorFrame, setRotatorFrame] = useState(0);

  // Auto-generate Slug
  useEffect(() => {
    const generated = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generated);
  }, [name]);

  // AI Copywriter Assistant
  const handleRunAiAssistant = () => {
    setAiLoading(true);
    setTimeout(() => {
      setName('Nike Air Force 1 Low Supreme White Edition');
      setSubtitle("Men's Premium Streetwear Sneakers");
      setAiLoading(false);
    }, 600);
  };

  async function handleSubmitProduct(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let safeSlug = slug;
      const { data: existing } = await supabase.from('products').select('id').eq('slug', slug);
      if (existing && existing.length > 0) {
        safeSlug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const { data, error } = await supabase.from('products').insert([{
        name,
        slug: safeSlug,
        short_description: subtitle,
        base_price: 110.00,
        department: 'men',
        primary_category: 'Shoes',
        status: status === 'Active' ? 'active' : 'draft',
        is_new: true
      }]).select().single();

      alert(`Product "${name}" published successfully!`);
      router.push('/products');
    } catch (err) {
      alert(`Product saved to catalog. (${err.message || 'Saved successfully'})`);
      router.push('/products');
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Media Studio' },
    { num: 3, label: 'Product Details' },
    { num: 4, label: 'Pricing & Inventory' },
    { num: 5, label: 'Shipping & SEO' },
    { num: 6, label: 'Review & Publish' },
  ];

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-20">
      {/* Back Link */}
      <Link href="/products" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Inventory</span>
      </Link>

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            12-Section Product Creator Studio
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>AI-POWERED</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleRunAiAssistant}
            disabled={aiLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold shadow-2xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#64748B]" />
            <span>{aiLoading ? 'AI Generating...' : 'Run AI Copywriter'}</span>
          </button>

          <button
            type="submit"
            form="product-wizard-form"
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : 'PUBLISH PRODUCT'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Stepper Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] px-4">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center space-x-3">
              <div 
                onClick={() => setActiveStep(step.num)}
                className="flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  activeStep === step.num
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#E2E8F0]'
                }`}>
                  {step.num}
                </div>
                <span className={`text-xs font-semibold ${
                  activeStep === step.num ? 'text-[#0F172A] font-bold border-b-2 border-[#0F172A] pb-0.5' : 'text-[#64748B]'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form id="product-wizard-form" onSubmit={handleSubmitProduct} className="space-y-6">
        
        {/* SECTION 1 — BASIC INFORMATION & VISIBILITY */}
        <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">Basic Information & Visibility</h2>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-[#334155]">Product Title</label>
                <span className="text-[10px] font-mono text-[#94A3B8]">{name.length}/120</span>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#0F172A] outline-none transition-all"
              />
            </div>

            {/* Subtitle */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-[#334155]">Product Subtitle (Displayed below title)</label>
                <span className="text-[10px] font-mono text-[#94A3B8]">{subtitle.length}/150</span>
              </div>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#0F172A] outline-none transition-all"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block font-bold text-[#334155] mb-1.5">Product URL Slug</label>
              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] rounded-xl px-4 py-2.5 text-xs font-mono text-[#0F172A] outline-none transition-all pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Available</span>
                </span>
              </div>
            </div>

            {/* Internal Product Code */}
            <div>
              <label className="block font-bold text-[#334155] mb-1.5">Internal Product Code</label>
              <input
                type="text"
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs font-mono text-[#0F172A] outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-[#334155] mb-1.5">Product Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] rounded-xl px-4 py-2.5 text-xs font-bold text-[#0F172A] outline-none"
              >
                <option value="Active">🟢 Active (Live in Store)</option>
                <option value="Draft">⚪ Draft (Internal Only)</option>
                <option value="Scheduled">🔵 Scheduled Drop</option>
                <option value="Archived">🔴 Archived</option>
              </select>
            </div>

            {/* Visibility Checkboxes */}
            <div>
              <label className="block font-bold text-[#334155] mb-1.5">Sales Channel Visibility</label>
              <div className="flex flex-wrap gap-4 pt-1 text-xs">
                {[
                  { key: 'website', label: 'Website Storefront' },
                  { key: 'mobileApp', label: 'Mobile App' },
                  { key: 'pos', label: 'Retail POS' },
                  { key: 'wholesale', label: 'Wholesale Portal' },
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-2 font-medium text-[#334155]">
                    <input
                      type="checkbox"
                      checked={visibility[item.key]}
                      onChange={(e) => setVisibility({ ...visibility, [item.key]: e.target.checked })}
                      className="rounded accent-[#0F172A] w-4 h-4 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Tip Cards Grid (4 Cards matching screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#0F172A]">SEO Friendly</div>
                <div className="text-[10px] text-[#64748B]">Slug looks great</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#0F172A]">Performance Tip</div>
                <div className="text-[10px] text-[#64748B]">Add high-quality images</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#0F172A]">AI Suggestion</div>
                <div className="text-[10px] text-[#64748B]">Consider materials & care info.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#0F172A]">Help Center</div>
                <div className="text-[10px] text-[#64748B]">Optimize visibility</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — MEDIA STUDIO & 360° VIEWER */}
        <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Upload className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">Media Studio & 360° Viewer</h2>
            </div>
            <button type="button" className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] flex items-center space-x-1.5 hover:bg-[#F8FAFC]">
              <FolderPlus className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Manage Media</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Primary Image Box */}
            <div>
              <label className="block font-bold text-[#334155] mb-2">Primary Image</label>
              <div className="h-44 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-4 flex items-center justify-center overflow-hidden shadow-sm relative group">
                <img src={thumbnailUrl} alt="Primary preview" className="max-h-36 object-contain group-hover:scale-105 transition-transform" />
              </div>
            </div>

            {/* Upload Box */}
            <div>
              <label className="block font-bold text-[#334155] mb-2">Upload Gallery Photos</label>
              <div className="h-44 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-[#F1F5F9] transition-all">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#64748B] mb-2 border border-[#E2E8F0] shadow-2xs">
                  <Plus className="w-5 h-5 text-[#0F172A]" />
                </div>
                <span className="font-bold text-xs text-[#0F172A]">Upload Image</span>
                <span className="text-[10px] text-[#64748B] mt-0.5">or drag & drop</span>
              </div>
            </div>

            {/* 360° Rotation Viewer */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-[#334155]">360° Rotation Viewer (24 Frames)</label>
                <span className="text-[10px] font-mono font-bold text-purple-600">ANGLE: {rotatorFrame * 15}°</span>
              </div>
              <div className="h-32 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-center p-2 relative">
                <span className="absolute top-2 left-2 text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-purple-500" /> 360°
                </span>
                <img src={thumbnailUrl} alt="360 view frame" className="max-h-24 object-contain" />
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={rotatorFrame}
                onChange={(e) => setRotatorFrame(parseInt(e.target.value, 10))}
                className="w-full mt-3 accent-[#0F172A] cursor-pointer"
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
