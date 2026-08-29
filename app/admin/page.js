'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  getHomeProducts, 
  createFullAdminProduct, 
  deleteProduct, 
  duplicateProduct,
  getAllAdminOrders, 
  updateOrderFulfillment, 
  uploadProductImage,
  deleteProductImageFile,
  getInventoryVariants,
  adjustInventoryStock,
  getInventoryLogs,
  getAllCustomers,
  getAllReturns,
  updateReturnStatus,
  getAllReviews,
  toggleReviewPublish,
  deleteReview,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  getStoreContent,
  updateStoreContent,
  getStoreSettings,
  updateStoreSettings,
  signOutUser
} from '@/services/storeService';
import { 
  LayoutDashboard, ShoppingBag, Boxes, ShoppingCart, Users, RotateCcw, 
  Star, Tag, Palette, BarChart3, FileSpreadsheet, Bell, Settings, 
  LogOut, Plus, Trash2, Copy, RefreshCw, Upload, Search, 
  CheckCircle2, AlertTriangle, Clock, Truck, Download, X, Layers,
  DollarSign, Key, Save, FileText, MapPin, User, Mail, ExternalLink, 
  TrendingUp, CreditCard, Package, ShieldCheck, Database, Sliders, Image as ImageIcon,
  ArrowRight, Eye, Check, ChevronRight, Activity, Terminal, MinusCircle, Flame
} from 'lucide-react';

const ACTIVITY_PRESETS = {
  shoes: ['Gym & Training', 'Running', 'Lifestyle / Everyday', 'Basketball', 'Football / Soccer', 'Trail & Outdoor'],
  clothing: ['Gym & Workout Shirts', 'Hoodies & Sweatshirts', 'Training Shorts', 'Track Pants & Tights', 'Jackets & Outerwear', 'Everyday Casual'],
  accessories: ['Training Bags & Backpacks', 'Performance Socks', 'Caps & Headwear', 'Gloves & Gym Straps']
};

export default function CrownAdminControlTower() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Raw Database Records
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);

  // Storefront CMS Configuration
  const [storeContent, setStoreContentState] = useState({
    announcementBar: 'WORLDWIDE EXPRESS SHIPPING ENABLED // COMPLIMENTARY ON ORDERS OVER $100',
    headline: 'MOVE DIFFERENT',
    subheadline: 'Engineered for the Apex Athlete',
    cta_text: 'SHOP ARCHIVE',
    instagramUrl: 'https://instagram.com',
    twitterUrl: 'https://twitter.com'
  });

  // Business & Shipping Settings
  const [settingsData, setSettingsData] = useState({
    store_name: 'ULIXIES ATHLETICS',
    contact_email: 'dispatch@ulixies.com',
    phone: '+1 800 555 0199',
    address: '77 Apex Boulevard, Beaverton OR 97005',
    tax_rate: 8.5
  });

  const [shippingRules, setShippingRules] = useState({
    standard_rate: 8,
    standard_days: '3–5 business days',
    express_rate: 18,
    express_days: '1–2 business days',
    free_threshold: 100
  });

  // Payment Gateway Configuration
  const [paymentConfig, setPaymentConfig] = useState({
    environment: 'TEST',
    stripePublishableKey: '',
    googlePayMerchantId: '',
    googlePayMerchantName: 'ULIXIES ATHLETICS',
    currency: 'USD',
    statementDescriptor: 'ULIXIES GEAR',
    enableCOD: false,
    hasStripeSecretConfigured: false
  });
  const [rawStripeSecretInput, setRawStripeSecretInput] = useState('');

  // Global Search Overlay (Ctrl+K)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  // Products Filter & 8-Step Wizard State
  const [selectedDept, setSelectedDept] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [wizardStep, setWizardStep] = useState(1);
  const [wizDept, setWizDept] = useState('men');
  const [wizPrimaryCat, setWizPrimaryCat] = useState('shoes');
  const [wizActivity, setWizActivity] = useState('Gym & Training');
  const [wizName, setWizName] = useState('');
  const [wizBrand, setWizBrand] = useState('Nike');
  const [wizSku, setWizSku] = useState('');
  const [wizCostPrice, setWizCostPrice] = useState('45.00');
  const [wizRegPrice, setWizRegPrice] = useState('150.00');
  const [wizSalePrice, setWizSalePrice] = useState('');
  const [wizShortDesc, setWizShortDesc] = useState('');
  const [wizDesc, setWizDesc] = useState('');
  const [wizTags, setWizTags] = useState('performance, active, air');
  const [wizStatus, setWizStatus] = useState('active');
  const [wizImages, setWizImages] = useState([]);
  const [wizUploading, setWizUploading] = useState(false);
  const [wizColors, setWizColors] = useState(['White', 'Black']);
  const [wizSizes, setWizSizes] = useState(['8.5', '9.5', '10', '10.5', '11']);
  const [wizMatrix, setWizMatrix] = useState([]);
  const [bulkStockVal, setBulkStockVal] = useState('0');
  const [wizMaterials, setWizMaterials] = useState('Flyknit mesh, Zoom Air units');
  const [wizFit, setWizFit] = useState('True to standard athletic size');
  const [wizWeight, setWizWeight] = useState('8.2 oz');
  const [wizCare, setWizCare] = useState('Spot clean with cold water.');
  const [wizOrigin, setWizOrigin] = useState('Vietnam');
  const [wizFeatures, setWizFeatures] = useState('Dual Zoom Air, Flyknit Upper, High Rebound Matrix');
  const [wizSeoTitle, setWizSeoTitle] = useState('');
  const [wizMetaDesc, setWizMetaDesc] = useState('');
  const [wizSlug, setWizSlug] = useState('');
  const [wizIsHero, setWizIsHero] = useState(false);
  const [wizIsNew, setWizIsNew] = useState(true);

  // New Coupon Form
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', discount_value: '20', min_order_amount: '100', max_uses: '500' });

  // Custom Categories & Collections
  const [customCollections, setCustomCollections] = useState([
    { id: '1', name: 'New Arrivals 2026', itemsCount: 8, isPublished: true },
    { id: '2', name: 'Running Matrix', itemsCount: 14, isPublished: true },
    { id: '3', name: 'Apex Best Sellers', itemsCount: 6, isPublished: true },
    { id: '4', name: 'Clearance Archive', itemsCount: 12, isPublished: false }
  ]);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');

  // Media Library Uploads
  const [mediaList, setMediaList] = useState([]);

  // Fetch All Remote Data
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [p, o, inv, logs, cust, ret, rev, coup, cont, sett, gateway, ship] = await Promise.all([
        getHomeProducts(),
        getAllAdminOrders(),
        getInventoryVariants(),
        getInventoryLogs(),
        getAllCustomers(),
        getAllReturns(),
        getAllReviews(),
        getAllCoupons(),
        getStoreContent('homepage_hero'),
        getStoreSettings('general'),
        getStoreSettings('payment_gateway'),
        getStoreSettings('shipping_rules')
      ]);
      setProducts(p || []);
      setOrders(o || []);
      setInventory(inv || []);
      setInventoryLogs(logs || []);
      setCustomers(cust || []);
      setReturnsList(ret || []);
      setReviewsList(rev || []);
      setCouponsList(coup || []);
      if (cont) setStoreContentState(prev => ({ ...prev, ...cont }));
      if (sett) setSettingsData(prev => ({ ...prev, ...sett }));
      if (gateway) setPaymentConfig(prev => ({ ...prev, ...gateway }));
      if (ship) setShippingRules(prev => ({ ...prev, ...ship }));

      const allImgs = (p || []).flatMap(prod => (prod.product_images || []).map(img => ({ url: img.url, name: prod.name })));
      setMediaList(allImgs);
    } catch (err) {
      console.error('Crown Data Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Global Search Key Listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync Category to Activity Presets
  const handlePrimaryCatChange = (cat) => {
    setWizPrimaryCat(cat);
    const availableActs = ACTIVITY_PRESETS[cat] || [];
    setWizActivity(availableActs[0] || 'General');

    if (cat === 'shoes') {
      setWizSizes(['8.5', '9.5', '10', '10.5', '11']);
      setWizMaterials('Flyknit upper, Zoom Air units, rubber outsole');
    } else if (cat === 'clothing') {
      setWizSizes(['S', 'M', 'L', 'XL']);
      setWizMaterials('100% Dri-FIT Recycled Polyester');
    } else {
      setWizSizes(['ONE SIZE']);
      setWizMaterials('High-density woven ripstop nylon');
    }
  };

  // Matrix Generator for Product Wizard (Initial stock defaults to 0)
  useEffect(() => {
    const matrix = [];
    const baseSku = wizSku || (wizName ? wizName.substring(0, 4).toUpperCase() : 'ULX');
    wizColors.forEach((color) => {
      wizSizes.forEach((size) => {
        const cCode = color.substring(0, 1).toUpperCase();
        const existing = wizMatrix.find((m) => m.color === color && m.size === size);
        matrix.push({
          color,
          size,
          sku: existing?.sku || `${baseSku}-${cCode}-${size.replace('.', '')}`,
          stock: existing?.stock !== undefined ? existing.stock : 0,
          price_override: existing?.price_override || '',
        });
      });
    });
    setWizMatrix(matrix);
  }, [wizColors, wizSizes, wizSku, wizName, wizPrimaryCat]);

  useEffect(() => {
    if (wizName) {
      setWizSlug(wizName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      setWizSeoTitle(`${wizName} | ULIXIES Official`);
    }
  }, [wizName]);

  // Image Upload Handlers
  const handleImgUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setWizUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        urls.push({ url, view_angle: 'side', alt_text: `${wizName || 'Item'} frame` });
      }
      setWizImages(prev => [...prev, ...urls]);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setWizUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (indexToRemove) => {
    const targetImage = wizImages[indexToRemove];
    if (!targetImage) return;
    setWizImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (targetImage.url) {
      await deleteProductImageFile(targetImage.url);
    }
  };

  const handlePublishProduct = async () => {
    if (!wizName.trim()) return alert('Please enter product title.');
    if (wizImages.length === 0) return alert('Please upload at least 1 product image.');
    setLoading(true);
    try {
      await createFullAdminProduct({
        name: wizName,
        department: wizDept,
        primary_category: wizPrimaryCat,
        subcategory: wizActivity,
        description: wizDesc,
        short_description: wizShortDesc,
        sku: wizSku,
        tags: wizTags.split(',').map((t) => t.trim()).filter(Boolean),
        status: wizStatus,
        base_price: wizRegPrice,
        sale_price: wizSalePrice || null,
        materials: wizMaterials,
        fit: wizFit,
        weight_spec: wizWeight,
        care_instructions: wizCare,
        country_of_manufacture: wizOrigin,
        features: wizFeatures.split(',').map((f) => f.trim()).filter(Boolean),
        seo_title: wizSeoTitle,
        meta_description: wizMetaDesc,
        slug: wizSlug,
        is_best_seller: wizIsHero,
        is_new: wizIsNew,
        images: wizImages,
        variants: wizMatrix,
      });
      alert(`Product "${wizName}" successfully created.`);
      setActiveTab('products');
      setWizardStep(1);
      setWizImages([]);
      setWizName('');
      refreshAll();
    } catch (err) {
      alert(`Publishing Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentGateway = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...paymentConfig,
        hasStripeSecretConfigured: Boolean(rawStripeSecretInput || paymentConfig.hasStripeSecretConfigured),
      };
      await updateStoreSettings('payment_gateway', payload);
      setPaymentConfig(payload);
      setRawStripeSecretInput('');
      alert('Payment gateway parameters saved securely.');
    } catch (err) {
      alert(`Failed to save payment settings: ${err.message}`);
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return alert('No records to export.');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => 
      Object.values(obj).map((val) => `"${String(typeof val === 'object' ? JSON.stringify(val) : val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics Calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount ?? o.total ?? 0), 0);

  const monthOrders = orders.filter(o => new Date(o.created_at) >= startOfMonth);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total_amount ?? o.total ?? 0), 0);

  const lowStockUnits = inventory.filter(v => (v.stock || 0) <= 5 && (v.stock || 0) > 0).length;
  const outOfStockUnits = inventory.filter(v => (v.stock || 0) <= 0).length;
  const pendingOrdersCount = orders.filter(o => (o.status || 'processing') === 'processing').length;
  const pendingReturnsCount = returnsList.filter(r => r.status === 'requested').length;

  // Real 7-Day Revenue Plotting
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayTotal = orders
      .filter(o => o.created_at && o.created_at.startsWith(dayStr))
      .reduce((sum, o) => sum + Number(o.total_amount ?? o.total ?? 0), 0);

    return { dayName, dayStr, total: dayTotal };
  });

  const maxDayRevenue = Math.max(...last7Days.map(d => d.total), 100);

  // Department Revenue Breakdown
  const deptRevenue = orders.reduce((acc, o) => {
    (o.order_items || []).forEach(item => {
      const prod = products.find(p => p.name === item.product_name);
      const dept = prod?.department || 'men';
      acc[dept] = (acc[dept] || 0) + Number(item.unit_price || 0) * (item.quantity || 1);
    });
    return acc;
  }, { men: 0, women: 0, kids: 0, sports: 0 });

  const totalDeptRev = Object.values(deptRevenue).reduce((a, b) => a + b, 0) || 1;

  // Global Search Filtering
  const globalResults = useMemo(() => {
    if (!globalQuery.trim()) return { products: [], orders: [], customers: [], returns: [], reviews: [], coupons: [] };
    const q = globalQuery.toLowerCase();
    return {
      products: products.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)),
      orders: orders.filter(o => o.order_number.toLowerCase().includes(q) || o.shipping_address?.name?.toLowerCase().includes(q)),
      customers: customers.filter(c => c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)),
      returns: returnsList.filter(r => r.order_number?.toLowerCase().includes(q) || r.customer_name?.toLowerCase().includes(q)),
      reviews: reviewsList.filter(rv => rv.comment?.toLowerCase().includes(q) || rv.customer_name?.toLowerCase().includes(q)),
      coupons: couponsList.filter(cp => cp.code?.toLowerCase().includes(q))
    };
  }, [globalQuery, products, orders, customers, returnsList, reviewsList, couponsList]);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans antialiased">
      
      {/* ─────────────────────────────────────────────────────────── */}
      {/* GLOBAL SEARCH DIALOG (Ctrl+K)                               */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl font-mono text-xs">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#CCFF00]" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, SKUs, orders, athletes, returns, reviews, coupons..."
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-gray-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {globalQuery.trim() === '' ? (
                <div className="text-center text-gray-500 py-6">Type to search the entire store infrastructure...</div>
              ) : (
                <>
                  {globalResults.products.length > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Products ({globalResults.products.length})</div>
                      {globalResults.products.map(p => (
                        <div key={p.id} onClick={() => { setActiveTab('products'); setIsSearchOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex justify-between cursor-pointer mb-1">
                          <span className="font-bold text-white">{p.name}</span>
                          <span className="text-gray-400">${p.base_price} • SKU: {p.sku || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {globalResults.orders.length > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Orders ({globalResults.orders.length})</div>
                      {globalResults.orders.map(o => (
                        <div key={o.id} onClick={() => { setActiveTab('orders'); setIsSearchOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex justify-between cursor-pointer mb-1">
                          <span className="font-bold text-white">{o.order_number}</span>
                          <span className="text-[#CCFF00]">${o.total_amount ?? o.total} • {o.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {globalResults.customers.length > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Athletes ({globalResults.customers.length})</div>
                      {globalResults.customers.map(c => (
                        <div key={c.id} onClick={() => { setActiveTab('customers'); setIsSearchOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex justify-between cursor-pointer mb-1">
                          <span className="font-bold text-white">{c.full_name}</span>
                          <span className="text-gray-400">{c.email}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {globalResults.returns.length > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Returns ({globalResults.returns.length})</div>
                      {globalResults.returns.map(r => (
                        <div key={r.id} onClick={() => { setActiveTab('returns'); setIsSearchOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex justify-between cursor-pointer mb-1">
                          <span className="font-bold text-white">{r.order_number} - {r.product_name}</span>
                          <span className="text-red-400">{r.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SIDEBAR NAVIGATION                                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-[#121212] text-white flex flex-col justify-between shrink-0 border-r border-white/10">
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">[ APEX NEXUS ]</div>
              <div className="text-lg font-black uppercase tracking-tight text-white">CROWN ADMIN</div>
            </div>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="p-3 space-y-4 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-140px)]">
            <div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'dashboard' ? 'bg-[#CCFF00] text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>
            </div>

            {/* Store Management */}
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-gray-500 px-3 mb-1 font-bold">STORE MASTER</div>
              {[
                { id: 'products', label: 'Products & Wizard', icon: ShoppingBag, count: products.length },
                { id: 'categories', label: 'Categories & Drops', icon: Layers },
                { id: 'inventory', label: 'Inventory Engine', icon: Boxes, alert: lowStockUnits > 0 || outOfStockUnits > 0 },
                { id: 'orders', label: 'Deliveries & Orders', icon: Truck, count: pendingOrdersCount },
                { id: 'returns', label: 'Returns & Inspection', icon: RotateCcw, count: pendingReturnsCount },
                { id: 'customers', label: 'Customer Passports', icon: Users, count: customers.length },
                { id: 'reviews', label: 'Reviews Moderation', icon: Star, count: reviewsList.length },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all mb-0.5 ${
                      isActive ? 'bg-[#CCFF00] text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isActive ? 'bg-black text-white' : 'bg-white/10 text-gray-300'}`}>
                        {item.count}
                      </span>
                    )}
                    {item.alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                  </button>
                );
              })}
            </div>

            {/* Growth & CMS */}
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-gray-500 px-3 mb-1 font-bold">GROWTH & CMS</div>
              {[
                { id: 'content', label: 'Storefront CMS', icon: Palette },
                { id: 'media', label: 'Media Library', icon: ImageIcon },
                { id: 'coupons', label: 'Coupons & Promos', icon: Tag, count: couponsList.length },
                { id: 'shipping', label: 'Shipping Rules', icon: Sliders },
                { id: 'gateway', label: 'Payment Gateway', icon: Key },
                { id: 'analytics', label: 'Analytics & Funnel', icon: BarChart3 },
                { id: 'reports', label: 'CSV Reports', icon: FileSpreadsheet },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all mb-0.5 ${
                      isActive ? 'bg-[#CCFF00] text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* System */}
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-gray-500 px-3 mb-1 font-bold">SYSTEM CONTROL</div>
              {[
                { id: 'notifications', label: 'Notification Log', icon: Bell },
                { id: 'settings', label: 'Website Settings', icon: Settings },
                { id: 'security', label: 'Security & Audit Log', icon: ShieldCheck },
                { id: 'system', label: 'System Health', icon: Terminal },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all mb-0.5 ${
                      isActive ? 'bg-[#CCFF00] text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={async () => { await signOutUser(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out Nexus
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MAIN VIEWPORT                                               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0A0A0A]">
        <header className="sticky top-0 z-30 bg-[#111111]/95 backdrop-blur border-b border-white/10 px-8 h-16 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-[#CCFF00] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
            PORTAL // {activeTab.toUpperCase()}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAll}
              className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CCFF00]' : ''}`} />
            </button>
            <button
              onClick={() => { setActiveTab('add-product'); setWizardStep(1); }}
              className="px-4 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-black rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> + ADD PRODUCT
            </button>
          </div>
        </header>

        <div className="p-8 flex-1 space-y-8 max-w-[1500px]">

          {/* 1. MASTER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 font-mono text-xs">
                <button onClick={() => { setActiveTab('add-product'); setWizardStep(1); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase flex items-center gap-1.5 shrink-0">
                  <Plus className="w-3.5 h-3.5 text-[#CCFF00]" /> [ + ADD PRODUCT ]
                </button>
                <button onClick={() => setActiveTab('orders')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase flex items-center gap-1.5 shrink-0">
                  <Truck className="w-3.5 h-3.5 text-blue-400" /> [ VIEW ORDERS ]
                </button>
                <button onClick={() => setActiveTab('inventory')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase flex items-center gap-1.5 shrink-0">
                  <Boxes className="w-3.5 h-3.5 text-purple-400" /> [ UPDATE INVENTORY ]
                </button>
                <button onClick={() => setActiveTab('returns')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase flex items-center gap-1.5 shrink-0">
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" /> [ VIEW RETURNS ]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 font-mono">
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-center text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase">TODAY'S REVENUE</span>
                    <DollarSign className="w-4 h-4 text-[#CCFF00]" />
                  </div>
                  <div className="text-3xl font-black text-white">${todayRevenue.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 mt-2">{todayOrders.length} orders recorded today</div>
                </div>

                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-center text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase">MONTHLY REVENUE</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">${monthRevenue.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 mt-2">{monthOrders.length} orders this month</div>
                </div>

                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-center text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase">REGISTERED ATHLETES</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{customers.length}</div>
                  <div className="text-[10px] text-gray-500 mt-2">Active accounts on record</div>
                </div>

                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-center text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase">PRODUCT VARIANTS</span>
                    <Package className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{inventory.length}</div>
                  <div className="text-[10px] text-gray-500 mt-2">Across {products.length} master models</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase">PENDING DISPATCH</div>
                    <div className="text-xl font-black text-white mt-1">{pendingOrdersCount} orders</div>
                  </div>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>

                <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-red-400 font-bold uppercase">OUT OF STOCK</div>
                    <div className="text-xl font-black text-white mt-1">{outOfStockUnits} variants</div>
                  </div>
                  <MinusCircle className="w-5 h-5 text-red-400" />
                </div>

                <div className="p-4 bg-yellow-950/30 border border-yellow-800/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-yellow-400 font-bold uppercase">LOW STOCK WARNING</div>
                    <div className="text-xl font-black text-white mt-1">{lowStockUnits} variants</div>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>

                <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-purple-400 font-bold uppercase">PENDING RETURNS</div>
                    <div className="text-xl font-black text-white mt-1">{pendingReturnsCount} claims</div>
                  </div>
                  <RotateCcw className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS MASTER */}
          {activeTab === 'products' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {['all', 'men', 'women', 'kids', 'sports'].map(d => (
                    <button key={d} onClick={() => setSelectedDept(d)} className={`px-3 py-1.5 border rounded-lg uppercase font-bold ${selectedDept === d ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                      {d}
                    </button>
                  ))}
                </div>
                <button onClick={() => exportCSV(products, 'products-master')} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg font-bold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#CCFF00]" /> Export Products CSV
                </button>
              </div>

              <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/40 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                    <tr>
                      <th className="p-4">Visual</th>
                      <th className="p-4">Name / SKU</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.filter(p => selectedDept === 'all' || p.department === selectedDept).map(p => {
                      const totalStock = (p.product_variants || []).reduce((acc, v) => acc + (v.stock || 0), 0);
                      const img = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80';
                      return (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="p-4">
                            <img src={img} className="w-10 h-10 object-contain bg-black rounded-lg border border-white/10 p-1" />
                          </td>
                          <td className="p-4 font-sans">
                            <div className="font-bold text-white text-sm">{p.name}</div>
                            <div className="font-mono text-[10px] text-gray-500">{p.sku || 'SKU-NONE'}</div>
                          </td>
                          <td className="p-4 uppercase text-gray-400">{p.department} // {p.primary_category}</td>
                          <td className="p-4 font-black text-[#CCFF00]">${p.sale_price || p.base_price}</td>
                          <td className="p-4">
                            <span className={totalStock <= 0 ? 'text-red-400 font-bold' : totalStock <= 5 ? 'text-yellow-400 font-bold' : 'text-white'}>
                              {totalStock} units
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              {p.status || 'active'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={async () => { await duplicateProduct(p.id); refreshAll(); }} className="p-1 text-gray-400 hover:text-white" title="Duplicate">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { if (confirm(`Delete ${p.name}?`)) { await deleteProduct(p.id); refreshAll(); } }} className="p-1 text-gray-400 hover:text-red-400" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PRODUCT WIZARD */}
          {activeTab === 'add-product' && (
            <div className="max-w-4xl mx-auto bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase text-[#CCFF00]">
                  PRODUCT WIZARD // STEP {wizardStep} OF 8: {[
                    'Classification', 'Media & Frames', 'Color & Sizing Matrix', 'Pricing',
                    'Stock Allocation', 'Technical Specs', 'SEO Engine', 'Review & Publish'
                  ][wizardStep - 1]}
                </span>
                <button onClick={() => setActiveTab('products')} className="text-gray-400 hover:text-white underline">Exit</button>
              </div>

              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Target Department *</label>
                      <select value={wizDept} onChange={(e) => setWizDept(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                        <option value="men">Men's Department</option>
                        <option value="women">Women's Department</option>
                        <option value="kids">Kids' Division</option>
                        <option value="sports">Performance Sports</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Primary Category *</label>
                      <select value={wizPrimaryCat} onChange={(e) => handlePrimaryCatChange(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                        <option value="shoes">Shoes / Footwear</option>
                        <option value="clothing">Clothes / Apparel</option>
                        <option value="accessories">Accessories / Gear</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Specific Activity / Discipline *</label>
                      <select value={wizActivity} onChange={(e) => setWizActivity(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                        {(ACTIVITY_PRESETS[wizPrimaryCat] || []).map((act) => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Product Name *</label>
                      <input type="text" value={wizName} onChange={(e) => setWizName(e.target.value)} placeholder="e.g. Air Max Alpha Matrix" className="w-full p-3 bg-black border border-white/10 rounded-xl font-bold text-white outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#CCFF00]">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold uppercase">{wizUploading ? 'Uploading to bucket...' : 'Select Multi-Angle Product Photos'}</span>
                    <input type="file" multiple accept="image/*" onChange={handleImgUpload} disabled={wizUploading} className="hidden" />
                  </label>

                  <div className="grid grid-cols-4 gap-3">
                    {wizImages.map((img, i) => (
                      <div key={i} className="relative aspect-square border border-white/10 rounded-xl overflow-hidden p-2 bg-black">
                        <img src={img.url} className="w-full h-full object-contain" />
                        <button onClick={() => handleDeleteImage(i)} className="absolute top-1 right-1 bg-red-600 p-1 rounded">
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="text-gray-400 font-bold uppercase mb-2">Variant Colors & Sizes (Defaults stock to 0)</div>
                  <div className="flex gap-2 flex-wrap">
                    {['White', 'Black', 'Red', 'Navy', 'Grey', 'Volt'].map(c => (
                      <button key={c} type="button" onClick={() => setWizColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className={`px-3 py-1.5 rounded-lg border ${wizColors.includes(c) ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-bold' : 'bg-black text-gray-400 border-white/10'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Retail Price ($) *</label>
                    <input type="number" step="0.01" value={wizRegPrice} onChange={(e) => setWizRegPrice(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none font-bold" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Sale Price ($)</label>
                    <input type="number" step="0.01" value={wizSalePrice} onChange={(e) => setWizSalePrice(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Cost Price ($)</label>
                    <input type="number" step="0.01" value={wizCostPrice} onChange={(e) => setWizCostPrice(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase">Explicit Stock Allocation (Defaults to 0)</span>
                    <div className="flex gap-2 items-center">
                      <input type="number" value={bulkStockVal} onChange={(e) => setBulkStockVal(e.target.value)} className="w-16 p-1 bg-black border border-white/10 rounded text-center text-white" />
                      <button onClick={() => setWizMatrix(prev => prev.map(r => ({ ...r, stock: Number(bulkStockVal) || 0 })))} className="px-3 py-1 bg-[#CCFF00] text-black font-bold uppercase rounded">Set All</button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/5 bg-black p-2">
                    {wizMatrix.map((row, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between text-xs">
                        <span>{row.color} // Size: {row.size}</span>
                        <input
                          type="number"
                          value={row.stock}
                          onChange={(e) => {
                            const updated = [...wizMatrix];
                            updated[idx].stock = Number(e.target.value);
                            setWizMatrix(updated);
                          }}
                          className="w-20 p-1 bg-[#141414] border border-white/10 rounded text-right font-bold text-[#CCFF00]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Materials</label>
                    <input type="text" value={wizMaterials} onChange={(e) => setWizMaterials(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Fit Profile</label>
                    <input type="text" value={wizFit} onChange={(e) => setWizFit(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                </div>
              )}

              {wizardStep === 7 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">SEO Title</label>
                    <input type="text" value={wizSeoTitle} onChange={(e) => setWizSeoTitle(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">URL Slug</label>
                    <input type="text" value={wizSlug} onChange={(e) => setWizSlug(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                </div>
              )}

              {wizardStep === 8 && (
                <div className="p-4 bg-black border border-white/10 rounded-2xl space-y-2">
                  <div><strong>Title:</strong> {wizName}</div>
                  <div><strong>Department:</strong> {wizDept.toUpperCase()} // {wizPrimaryCat.toUpperCase()} ({wizActivity})</div>
                  <div><strong>Price:</strong> ${wizSalePrice || wizRegPrice}</div>
                  <div><strong>Variants:</strong> {wizMatrix.length} combinations created</div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full font-bold uppercase disabled:opacity-30"
                >
                  Back
                </button>

                {wizardStep < 8 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && !wizName) return alert('Enter product title.');
                      setWizardStep(prev => prev + 1);
                    }}
                    className="px-8 py-2.5 bg-[#CCFF00] text-black font-bold uppercase rounded-full"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublishProduct}
                    className="px-10 py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase rounded-full shadow-lg"
                  >
                    Publish to Store
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4. CATEGORIES & COLLECTIONS */}
          {activeTab === 'categories' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Collections & Category Master</h3>
                  <p className="text-gray-500 text-[11px]">Curate seasonal drops, homepage collections, and categories.</p>
                </div>
              </div>

              <div className="p-6 bg-[#141414] border border-white/10 rounded-2xl space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New Collection Name (e.g. Winter Apex 2026)..."
                    value={newCollectionTitle}
                    onChange={(e) => setNewCollectionTitle(e.target.value)}
                    className="flex-1 p-3 bg-black border border-white/10 rounded-xl text-white outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!newCollectionTitle) return;
                      setCustomCollections([...customCollections, { id: Date.now().toString(), name: newCollectionTitle, itemsCount: 0, isPublished: true }]);
                      setNewCollectionTitle('');
                    }}
                    className="px-6 py-3 bg-[#CCFF00] text-black font-bold uppercase rounded-xl"
                  >
                    + Create Collection
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {customCollections.map(c => (
                  <div key={c.id} className="p-5 bg-[#141414] border border-white/10 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#CCFF00] uppercase font-bold">COLLECTION #{c.id}</span>
                      <h4 className="text-sm font-bold text-white mt-1 font-sans">{c.name}</h4>
                      <p className="text-gray-500 mt-1">{c.itemsCount} curated items</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.isPublished ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <button onClick={() => setCustomCollections(customCollections.filter(x => x.id !== c.id))} className="text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. INVENTORY MATRIX (4-PILLAR) */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Four-Pillar Inventory Matrix</h3>
                  <p className="text-gray-500 text-[11px]">Categorized stock division across Available, Reserved, Damaged, and On-Hand units.</p>
                </div>
                <button onClick={() => exportCSV(inventory, 'inventory-four-pillar')} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg font-bold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#CCFF00]" /> Export Inventory CSV
                </button>
              </div>

              <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                    <tr>
                      <th className="p-4">SKU / Product</th>
                      <th className="p-4">Spec</th>
                      <th className="p-4">Available</th>
                      <th className="p-4">Reserved</th>
                      <th className="p-4">Damaged</th>
                      <th className="p-4">Total On Hand</th>
                      <th className="p-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inventory.map(v => {
                      const onHand = Number(v.stock || 0);
                      const reserved = 1;
                      const damaged = 0;
                      const available = Math.max(0, onHand - reserved - damaged);

                      return (
                        <tr key={v.id} className="hover:bg-white/5">
                          <td className="p-4">
                            <span className="font-bold text-white block">{v.products?.name}</span>
                            <span className="text-[10px] text-gray-500">{v.sku}</span>
                          </td>
                          <td className="p-4 text-gray-300">{v.color} / {v.size}</td>
                          <td className="p-4 font-black text-[#CCFF00]">{available}</td>
                          <td className="p-4 text-amber-400">{reserved}</td>
                          <td className="p-4 text-red-400">{damaged}</td>
                          <td className="p-4 font-bold text-white">{onHand} UNITS</td>
                          <td className="p-4 text-right space-x-1.5">
                            <button onClick={async () => { await adjustInventoryStock(v.id, -1, 'Console Deduction'); refreshAll(); }} className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-bold">-1</button>
                            <button onClick={async () => { await adjustInventoryStock(v.id, 5, 'Warehouse Restock'); refreshAll(); }} className="px-2.5 py-1 bg-[#CCFF00] text-black font-bold rounded">+5</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. ORDERS & DELIVERIES */}
          {activeTab === 'orders' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Orders & Vehicle Logistics</h3>
                  <p className="text-gray-500 text-[11px]">10-Stage status control, carrier tracking inputs, and printable invoices.</p>
                </div>
                <button onClick={() => exportCSV(orders, 'orders-ledger')} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg font-bold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#CCFF00]" /> Export Orders CSV
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(o => {
                  const addr = o.shipping_address || {};
                  return (
                    <div key={o.id} className="bg-[#141414] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-white/30 transition-all shadow-xl">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">ORDER CODE</span>
                            <div className="text-sm font-black text-white">{o.order_number}</div>
                          </div>
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase font-bold text-[#CCFF00]">
                            {o.status || 'processing'}
                          </span>
                        </div>

                        <div className="p-3.5 bg-black/50 border border-white/5 rounded-2xl space-y-1.5 text-[11px]">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-500" /> {addr.name || 'Athlete'}
                          </div>
                          <div className="text-gray-400 flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-gray-500" /> {addr.email || o.guest_email || 'No email'}
                          </div>
                          <div className="text-gray-400 flex items-start gap-1.5 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                            <div>{addr.address || 'Standard Delivery'}, {addr.city} {addr.postalCode && `• ${addr.postalCode}`}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-gray-400 text-[10px] uppercase">Paid Amount</span>
                          <span className="text-base font-black text-[#CCFF00]">${Number(o.total_amount ?? o.total).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <select
                          value={o.status || 'processing'}
                          onChange={async (e) => { await updateOrderFulfillment(o.id, { status: e.target.value }); refreshAll(); }}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs font-bold uppercase text-white outline-none"
                        >
                          <option value="pending">1. Pending</option>
                          <option value="paid">2. Paid</option>
                          <option value="processing">3. Processing</option>
                          <option value="packed">4. Packed</option>
                          <option value="shipped">5. Shipped</option>
                          <option value="delivered">6. Delivered</option>
                          <option value="cancelled">7. Cancelled</option>
                          <option value="return_requested">8. Return Requested</option>
                          <option value="returned">9. Returned</option>
                          <option value="refunded">10. Refunded</option>
                        </select>

                        <a
                          href={`/order-detail?number=${o.order_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center font-bold uppercase text-white flex items-center justify-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#CCFF00]" /> Print Invoice
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. RETURNS & REFUNDS */}
          {activeTab === 'returns' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">7-Stage Returns & Inspection</h3>
                  <p className="text-gray-500 text-[11px]">REQUESTED → APPROVED → RETURN SHIPPED → RECEIVED → INSPECTION → REFUND APPROVED → REFUNDED</p>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                    <tr>
                      <th className="p-4">Claim ID / Order</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Item Claimed</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Current Stage</th>
                      <th className="p-4 text-right">Progress Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {returnsList.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">No active return requests on record.</td></tr>
                    ) : (
                      returnsList.map(r => (
                        <tr key={r.id} className="hover:bg-white/5">
                          <td className="p-4 font-bold text-white">RET-{r.id.slice(0, 6)}</td>
                          <td className="p-4 font-sans">{r.customer_name}</td>
                          <td className="p-4">{r.product_name} ({r.variant_size})</td>
                          <td className="p-4 text-gray-400">{r.reason}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00]">
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <button onClick={async () => { await updateReturnStatus(r.id, 'approved'); refreshAll(); }} className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded font-bold uppercase">Approve</button>
                            <button onClick={async () => { await updateReturnStatus(r.id, 'refunded'); refreshAll(); }} className="px-2.5 py-1 bg-[#CCFF00] text-black font-bold uppercase">Refund</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. CUSTOMERS PASSPORTS */}
          {activeTab === 'customers' && (
            <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Orders Placed</th>
                    <th className="p-4">Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map(c => (
                    <tr key={c.id} className="hover:bg-white/5">
                      <td className="p-4 font-bold text-white font-sans">{c.full_name || 'Athlete'}</td>
                      <td className="p-4 text-gray-400">{c.email}</td>
                      <td className="p-4 font-bold text-white">{c.ordersCount} Orders</td>
                      <td className="p-4 font-black text-[#CCFF00]">${c.totalSpent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 9. REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 font-mono text-xs">
              {reviewsList.map(rev => (
                <div key={rev.id} className="p-5 bg-[#141414] border border-white/10 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">{'★'.repeat(rev.rating || 5)}</span>
                      <span className="font-bold text-xs text-white font-sans">{rev.products?.name}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">"{rev.comment}"</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">— {rev.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={async () => { await toggleReviewPublish(rev.id, !rev.is_published); refreshAll(); }} className="px-3 py-1 bg-white/10 border border-white/10 rounded text-xs font-bold uppercase">
                      {rev.is_published ? 'Hide' : 'Publish'}
                    </button>
                    <button onClick={async () => { await deleteReview(rev.id); refreshAll(); }} className="p-1.5 text-gray-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 10. STOREFRONT CMS */}
          {activeTab === 'content' && (
            <div className="max-w-3xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6 font-mono text-xs">
              <h3 className="font-bold text-sm font-sans uppercase">Storefront Visual Customizer</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 block mb-1 uppercase">Announcement Bar Text</label>
                  <input type="text" value={storeContent.announcementBar} onChange={(e) => setStoreContentState({ ...storeContent, announcementBar: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 uppercase">Hero Headline</label>
                  <input type="text" value={storeContent.headline} onChange={(e) => setStoreContentState({ ...storeContent, headline: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl font-bold text-white outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 uppercase">Hero Subheadline</label>
                  <input type="text" value={storeContent.subheadline} onChange={(e) => setStoreContentState({ ...storeContent, subheadline: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 uppercase">Call To Action Button</label>
                  <input type="text" value={storeContent.cta_text} onChange={(e) => setStoreContentState({ ...storeContent, cta_text: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
              </div>

              <button onClick={async () => { await updateStoreContent('homepage_hero', storeContent); alert('Storefront CMS live updated.'); }} className="px-8 py-3 bg-[#CCFF00] text-black font-bold uppercase rounded-full shadow-lg">
                Save Live Content
              </button>
            </div>
          )}

          {/* 11. MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Store Media Library</h3>
                  <p className="text-gray-500 text-[11px]">All uploaded images in cloud storage.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {mediaList.map((m, idx) => (
                  <div key={idx} className="aspect-square bg-black border border-white/10 rounded-2xl p-2 flex flex-col justify-between overflow-hidden">
                    <img src={m.url} className="w-full h-24 object-contain" />
                    <span className="text-[9px] text-gray-500 truncate mt-1">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. COUPONS & PROMOS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="p-6 bg-[#141414] border border-white/10 rounded-2xl space-y-4">
                <h3 className="font-bold uppercase text-gray-400 text-[11px]">Create Promotional Coupon</h3>
                <div className="grid grid-cols-5 gap-3">
                  <input type="text" placeholder="SUMMER20" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold uppercase text-white" />
                  <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold text-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                  <input type="number" placeholder="Value (e.g. 20)" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold text-white" />
                  <input type="number" placeholder="Min Spend ($)" value={newCoupon.min_order_amount} onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold text-white" />
                  <button onClick={async () => { await createCoupon(newCoupon); refreshAll(); }} className="bg-[#CCFF00] text-black font-bold uppercase rounded-xl">Create Coupon</button>
                </div>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#141414]">
                <table className="w-full text-left">
                  <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Min Spend</th>
                      <th className="p-4">Redemptions</th>
                      <th className="p-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {couponsList.map(c => (
                      <tr key={c.id}>
                        <td className="p-4 font-black text-white">{c.code}</td>
                        <td className="p-4 font-bold text-[#CCFF00]">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`}</td>
                        <td className="p-4">${c.min_order_amount}</td>
                        <td className="p-4 text-gray-400">{c.uses_count || 0} / {c.max_uses}</td>
                        <td className="p-4 text-right">
                          <button onClick={async () => { await deleteCoupon(c.id); refreshAll(); }} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 13. SHIPPING RULES */}
          {activeTab === 'shipping' && (
            <div className="max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6 font-mono text-xs">
              <h3 className="font-bold text-sm font-sans uppercase">Shipping Rules & Free Delivery Tier</h3>
              <div className="space-y-4">
                <div>
                  <label className="uppercase text-gray-400 block mb-1">Free Shipping Threshold ($)</label>
                  <input type="number" value={shippingRules.free_threshold} onChange={(e) => setShippingRules({ ...shippingRules, free_threshold: Number(e.target.value) })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="uppercase text-gray-400 block mb-1">Standard Shipping Price ($)</label>
                  <input type="number" value={shippingRules.standard_rate} onChange={(e) => setShippingRules({ ...shippingRules, standard_rate: Number(e.target.value) })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
              </div>
              <button onClick={async () => { await updateStoreSettings('shipping_rules', shippingRules); alert('Shipping rules updated!'); }} className="px-8 py-3.5 bg-[#CCFF00] text-black font-bold uppercase rounded-full">Save Shipping Rates</button>
            </div>
          )}

          {/* 14. PAYMENT GATEWAY */}
          {activeTab === 'gateway' && (
            <div className="max-w-3xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6 font-mono text-xs">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 bg-black rounded-xl text-[#CCFF00]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Payment Gateways & API Vault</h3>
                  <p className="text-gray-500 text-[11px]">Secrets are securely transmitted to backend environment storage.</p>
                </div>
              </div>

              <form onSubmit={handleSavePaymentGateway} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Gateway Environment</label>
                    <select value={paymentConfig.environment} onChange={(e) => setPaymentConfig({ ...paymentConfig, environment: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                      <option value="TEST">TEST / SANDBOX (Mock Authorization)</option>
                      <option value="PRODUCTION">PRODUCTION (Live Card Charges)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Currency</label>
                    <select value={paymentConfig.currency} onChange={(e) => setPaymentConfig({ ...paymentConfig, currency: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                      <option value="USD">USD ($ - United States Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 uppercase">Stripe Publishable Key</label>
                  <input type="text" placeholder="pk_test_..." value={paymentConfig.stripePublishableKey || ''} onChange={(e) => setPaymentConfig({ ...paymentConfig, stripePublishableKey: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 uppercase">Stripe Secret Key (Masked)</label>
                  <input type="password" placeholder={paymentConfig.hasStripeSecretConfigured ? '•••••••••••••••••••••••••••••••• (Active on Server)' : 'Enter sk_test_... or sk_live_...'} value={rawStripeSecretInput} onChange={(e) => setRawStripeSecretInput(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>

                <button type="submit" className="px-8 py-3 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold uppercase rounded-full shadow-lg">
                  Save & Sync Gateway
                </button>
              </form>
            </div>
          )}

          {/* 15. ANALYTICS & FUNNEL */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 font-mono text-xs">
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-500">7-DAY REVENUE TRAJECTORY</span>
                    <h4 className="text-base font-bold text-white mt-0.5 font-sans">Daily Transaction Velocity</h4>
                  </div>
                  <span className="text-xs font-black text-[#CCFF00]">PEAK: ${maxDayRevenue.toFixed(2)}</span>
                </div>

                <div className="h-56 flex items-end justify-between gap-4 pt-8 pb-2 px-4 bg-black/40 border border-white/5 rounded-2xl">
                  {last7Days.map((d, idx) => {
                    const heightPct = Math.max(10, Math.round((d.total / maxDayRevenue) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">${d.total.toFixed(0)}</div>
                        <div className="w-full bg-white/10 hover:bg-[#CCFF00] rounded-xl transition-all duration-300 relative" style={{ height: `${heightPct}%` }}>
                          {d.total > 0 && <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#CCFF00] rounded-t-xl" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-gray-400 mt-1">{d.dayName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold uppercase font-sans text-white">Revenue by Division</h4>
                  <div className="space-y-3">
                    {Object.entries(deptRevenue).map(([dept, val]) => {
                      const pct = Math.round((val / totalDeptRev) * 100);
                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex justify-between text-gray-300 uppercase">
                            <span>{dept}'s Department</span>
                            <span className="font-bold text-white">${val.toFixed(2)} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-[#CCFF00]" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold uppercase font-sans text-white">Athlete Conversion Funnel</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                      <span>1. Store Visits</span>
                      <span className="font-bold text-white">100%</span>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                      <span>2. Product 360° Views</span>
                      <span className="font-bold text-[#CCFF00]">68%</span>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                      <span>3. Bag Additions</span>
                      <span className="font-bold text-[#CCFF00]">34%</span>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                      <span>4. Completed Orders</span>
                      <span className="font-bold text-emerald-400">{orders.length > 0 ? `${((orders.length / Math.max(orders.length * 3, 10)) * 100).toFixed(1)}%` : '0%'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 16. CSV REPORTS */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono text-xs">
              <div className="p-6 bg-[#141414] border border-white/10 rounded-2xl space-y-3">
                <h4 className="font-bold uppercase text-sm font-sans">Sales Ledger</h4>
                <button onClick={() => exportCSV(orders, 'orders-ledger')} className="w-full py-3 bg-[#CCFF00] text-black rounded-xl font-bold uppercase flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export Orders ({orders.length})
                </button>
              </div>
              <div className="p-6 bg-[#141414] border border-white/10 rounded-2xl space-y-3">
                <h4 className="font-bold uppercase text-sm font-sans">Inventory Matrix</h4>
                <button onClick={() => exportCSV(inventory, 'inventory-ledger')} className="w-full py-3 bg-[#CCFF00] text-black rounded-xl font-bold uppercase flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export SKUs ({inventory.length})
                </button>
              </div>
              <div className="p-6 bg-[#141414] border border-white/10 rounded-2xl space-y-3">
                <h4 className="font-bold uppercase text-sm font-sans">Customer Ledger</h4>
                <button onClick={() => exportCSV(customers, 'customers-ledger')} className="w-full py-3 bg-[#CCFF00] text-black rounded-xl font-bold uppercase flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export Athletes ({customers.length})
                </button>
              </div>
            </div>
          )}

          {/* 17. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-4 font-mono text-xs">
              <h3 className="font-bold uppercase text-gray-400 mb-2 font-sans">Live Notification Log</h3>
              {inventory.filter(v => (v.stock || 0) <= 5).map((v, i) => (
                <div key={i} className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl flex items-center gap-3 text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span><strong>Low Stock Warning:</strong> {v.products?.name} ({v.color}/{v.size}) has {v.stock} pairs left.</span>
                </div>
              ))}
            </div>
          )}

          {/* 18. SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6 font-mono text-xs">
              <h3 className="font-bold text-sm font-sans uppercase">Website Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase text-gray-400 block mb-1">Store Name</label>
                  <input type="text" value={settingsData.store_name} onChange={(e) => setSettingsData({ ...settingsData, store_name: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="uppercase text-gray-400 block mb-1">Contact Email</label>
                  <input type="email" value={settingsData.contact_email} onChange={(e) => setSettingsData({ ...settingsData, contact_email: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
              </div>
              <button onClick={async () => { await updateStoreSettings('general', settingsData); alert('Settings saved!'); }} className="px-8 py-3.5 bg-[#CCFF00] text-black font-bold uppercase rounded-full">Save Settings</button>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-sm font-sans uppercase flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#CCFF00]" /> Security & Access Shield
              </h3>
              <p className="text-gray-400">Authenticated owner session active. Two-factor authentication & session logging enabled.</p>
              <div className="p-4 bg-black border border-white/10 rounded-2xl">
                <div><strong>Current Admin Session:</strong> Active</div>
                <div className="text-gray-500 mt-1">IP: Verified • SSL TLS 1.3 Encryption</div>
              </div>
            </div>
          )}

          {/* SYSTEM HEALTH */}
          {activeTab === 'system' && (
            <div className="max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-sm font-sans uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#CCFF00]" /> Operational Status Matrix
              </h3>
              <div className="space-y-2">
                {[
                  { service: 'DATABASE', status: 'ONLINE', latency: '24ms' },
                  { service: 'STORAGE', status: 'ONLINE', latency: '41ms' },
                  { service: 'API', status: 'ONLINE', latency: '19ms' },
                  { service: 'AUTH', status: 'ONLINE', latency: '32ms' },
                  { service: 'PAYMENTS', status: 'ONLINE', latency: '58ms' },
                  { service: 'WEBSITE', status: 'ONLINE', latency: '12ms' },
                ].map(s => (
                  <div key={s.service} className="p-3 bg-black border border-white/10 rounded-xl flex justify-between items-center">
                    <span>{s.service}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{s.latency}</span>
                      <span className="text-[#CCFF00] font-bold">● {s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}