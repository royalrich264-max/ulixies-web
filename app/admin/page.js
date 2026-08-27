'use client';

import { useState, useEffect } from 'react';
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
  ArrowUpRight, CheckCircle2, AlertTriangle, Clock, Truck, Download, X, Layers
} from 'lucide-react';

export default function AdminControlTower() {
  const [activeTab, setActiveTab] = useState('products');
  const [selectedDept, setSelectedDept] = useState('all'); // 'all' | 'men' | 'women' | 'kids' | 'sports' | 'sale'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'shoes' | 'clothing' | 'accessories'
  const [loading, setLoading] = useState(true);

  // Database Records
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [storeContent, setStoreContentState] = useState({ headline: '', subheadline: '', cta_text: '', badge: '' });
  const [settingsData, setSettingsData] = useState({ store_name: 'ULIXIES', contact_email: 'owner@ulixies.com', phone: '', address: '', free_shipping_threshold: 150, standard_shipping_rate: 10, tax_rate: 8.5 });

  // Filtering
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [inventorySearch, setInventorySearch] = useState('');

  // 8-Step Add Product Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizDept, setWizDept] = useState('men');
  const [wizPrimaryCat, setWizPrimaryCat] = useState('shoes'); // 'shoes' | 'clothing' | 'accessories'
  const [wizActivity, setWizActivity] = useState('Gym & Training');
  const [wizName, setWizName] = useState('');
  const [wizBrand, setWizBrand] = useState('Nike');
  const [wizSku, setWizSku] = useState('');
  const [wizShortDesc, setWizShortDesc] = useState('');
  const [wizDesc, setWizDesc] = useState('');
  const [wizTags, setWizTags] = useState('performance, active');
  const [wizStatus, setWizStatus] = useState('active');

  // Media & True Deletion State
  const [wizImages, setWizImages] = useState([]);
  const [wizUploading, setWizUploading] = useState(false);
  const [draggedImgIdx, setDraggedImgIdx] = useState(null);

  // Sizing & Variants Presets per Category
  const sizePresets = {
    shoes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
    clothing: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    accessories: ['ONE SIZE', 'S/M', 'L/XL', 'Adjustable']
  };

  const activityPresets = {
    shoes: ['Gym & Training', 'Running', 'Lifestyle / Everyday', 'Basketball', 'Football / Soccer', 'Trail & Outdoor'],
    clothing: ['Gym & Workout Shirts', 'Hoodies & Sweatshirts', 'Training Shorts', 'Track Pants & Tights', 'Jackets & Outerwear', 'Everyday Casual'],
    accessories: ['Training Bags & Backpacks', 'Performance Socks', 'Caps & Headwear', 'Gloves & Gym Straps']
  };

  const [wizColors, setWizColors] = useState(['White', 'Black']);
  const [wizSizes, setWizSizes] = useState(['8.5', '9.5', '10', '10.5', '11']);
  const [customColorInput, setCustomColorInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [wizMatrix, setWizMatrix] = useState([]);
  const [bulkStockVal, setBulkStockVal] = useState('15');

  // Pricing & Specs
  const [wizRegPrice, setWizRegPrice] = useState('150.00');
  const [wizSalePrice, setWizSalePrice] = useState('120.00');
  const [wizMaterials, setWizMaterials] = useState('Flyknit mesh, Rubber Outsole');
  const [wizFit, setWizFit] = useState('True to standard athletic size');
  const [wizWeight, setWizWeight] = useState('8.2 oz / 232 g');
  const [wizCare, setWizCare] = useState('Spot clean with cold water.');
  const [wizOrigin, setWizOrigin] = useState('Vietnam');
  const [wizFeatures, setWizFeatures] = useState('Breathable Mesh, Responsive Cushioning, High-durability stitching');

  const [wizSeoTitle, setWizSeoTitle] = useState('');
  const [wizMetaDesc, setWizMetaDesc] = useState('');
  const [wizSlug, setWizSlug] = useState('');
  const [wizIsHero, setWizIsHero] = useState(false);
  const [wizIsNew, setWizIsNew] = useState(true);

  // New Coupon Form
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', discount_value: '20', min_order_amount: '100', max_uses: '500' });

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [p, o, inv, logs, cust, ret, rev, coup, cont, sett] = await Promise.all([
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
      ]);
      setProducts(p || []);
      setOrders(o || []);
      setInventory(inv || []);
      setInventoryLogs(logs || []);
      setCustomers(cust || []);
      setReturnsList(ret || []);
      setReviewsList(rev || []);
      setCouponsList(coup || []);
      if (cont) setStoreContentState(cont);
      if (sett) setSettingsData(sett);
    } catch (err) {
      console.error('Data reload error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Category switch: switches default sizes, subcategories and cleans up the active variant matrix
  const handlePrimaryCatChange = (newCat) => {
    setWizPrimaryCat(newCat);
    const newDefaults = sizePresets[newCat] || ['ONE SIZE'];
    
    // Set first 4-5 sizes by default
    if (newCat === 'shoes') {
      setWizSizes(['8.5', '9.5', '10', '10.5', '11']);
      setWizMaterials('Flyknit upper, Zoom Air units, rubber outsole');
    } else if (newCat === 'clothing') {
      setWizSizes(['S', 'M', 'L', 'XL']);
      setWizMaterials('100% Dri-FIT Recycled Polyester');
    } else {
      setWizSizes(['ONE SIZE']);
      setWizMaterials('High-density woven nylon & ripstop');
    }

    setWizActivity(activityPresets[newCat]?.[0] || 'General');
  };

  // Dynamically generate the variant matrix when colors, sizes, or category changes
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
          stock: existing?.stock !== undefined ? existing.stock : 15,
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

  // Handle Image Uploads
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
      setWizImages((prev) => [...prev, ...urls]);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setWizUploading(false);
      e.target.value = '';
    }
  };

  // Permanent Image Deletion (UI state + Supabase storage bucket)
  const handleDeleteImage = async (indexToRemove) => {
    const targetImage = wizImages[indexToRemove];
    if (!targetImage) return;

    setWizImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));

    if (targetImage.url) {
      await deleteProductImageFile(targetImage.url);
    }
  };

  const dropImg = (idx) => {
    if (draggedImgIdx === null || draggedImgIdx === idx) return;
    const reordered = [...wizImages];
    const [moved] = reordered.splice(draggedImgIdx, 1);
    reordered.splice(idx, 0, moved);
    setWizImages(reordered);
    setDraggedImgIdx(null);
  };

  // Apply Bulk Stock to All Variant Rows
  const applyBulkStock = () => {
    const val = Number(bulkStockVal) || 0;
    setWizMatrix((prev) => prev.map((row) => ({ ...row, stock: val })));
  };

  // Publish Form Action
  const handlePublishProduct = async () => {
    if (!wizName.trim()) return alert('Please enter product title.');
    if (wizImages.length === 0) return alert('Please upload at least 1 product image.');
    if (wizMatrix.length === 0) return alert('Please select at least 1 color and 1 size variant.');

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

      alert(`Product "${wizName}" successfully published to ${wizDept.toUpperCase()} // ${wizPrimaryCat.toUpperCase()}!`);
      setActiveTab('products');
      setWizardStep(1);
      setWizImages([]);
      setWizName('');
      setWizDesc('');
      setWizShortDesc('');
      setWizSku('');
      refreshAll();
    } catch (err) {
      alert(`Publishing Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CSV Exporter
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return alert('No records available to export.');
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

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchDept = selectedDept === 'all' || p.department === selectedDept;
    const matchCat = selectedCategory === 'all' || p.primary_category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase());
    return matchDept && matchCat && matchSearch;
  });

  const totalSales = orders.reduce((acc, o) => acc + Number(o.total_amount ?? o.total ?? 0), 0);
  const lowStockCount = inventory.filter((v) => (v.stock || 0) <= 5).length;
  const processingCount = orders.filter((o) => (o.status || 'processing') === 'processing').length;
  const returnReqCount = returnsList.filter((r) => r.status === 'requested').length;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#111111] antialiased">
      
      {/* ─────────────────────────────────────────────────────────── */}
      {/* SIDEBAR NAVIGATION                                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-[#111111] text-white flex flex-col justify-between shrink-0 border-r border-[#222222]">
        <div>
          <div className="p-6 border-b border-[#222222]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">CONTROL TOWER</div>
            <div className="text-xl font-black uppercase tracking-tight text-white mt-0.5">ULIXIES ADMIN</div>
          </div>

          <nav className="p-3 space-y-1 text-xs font-semibold">
            {[
              { id: 'products', label: 'Products & Departments', icon: ShoppingBag, count: products.length },
              { id: 'dashboard', label: 'Dashboard & Sales', icon: LayoutDashboard },
              { id: 'inventory', label: 'Inventory Matrix', icon: Boxes, alert: lowStockCount > 0 },
              { id: 'orders', label: 'Orders Fulfillment', icon: ShoppingCart, count: processingCount },
              { id: 'customers', label: 'Customers Passports', icon: Users, count: customers.length },
              { id: 'returns', label: 'Returns & Claims', icon: RotateCcw, count: returnReqCount },
              { id: 'reviews', label: 'Reviews Moderation', icon: Star, count: reviewsList.length },
              { id: 'coupons', label: 'Coupons & Promos', icon: Tag, count: couponsList.length },
              { id: 'content', label: 'Storefront Content', icon: Palette },
              { id: 'analytics', label: 'Analytics & Funnel', icon: BarChart3 },
              { id: 'reports', label: 'CSV Reports', icon: FileSpreadsheet },
              { id: 'notifications', label: 'Notifications', icon: Bell, alert: lowStockCount > 0 },
              { id: 'settings', label: 'Store Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); if (item.id === 'add-product') setWizardStep(1); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive ? 'bg-white text-black font-bold shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isActive ? 'bg-black text-white' : 'bg-white/10 text-gray-300'}`}>
                      {item.count}
                    </span>
                  )}
                  {item.alert && <span className="w-2 h-2 rounded-full bg-[#CCFF00]"></span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#222222]">
          <button
            onClick={async () => { await signOutUser(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out Owner
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MAIN VIEWPORT                                               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E5E5E5] px-8 h-16 flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider">
            PORTAL // {activeTab.toUpperCase()}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAll}
              className="p-2 border border-[#E5E5E5] rounded-xl hover:bg-gray-50 transition-colors text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setActiveTab('add-product'); setWizardStep(1); }}
              className="px-4 py-2 bg-[#111111] text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> + Add New Product
            </button>
          </div>
        </header>

        <div className="p-8 flex-1">

          {/* 1. PRODUCTS & MULTI-DEPARTMENT ENGINE */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-[1300px]">
              
              {/* Department Filter Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#E5E5E5] pb-4">
                {[
                  { id: 'all', label: 'All Departments' },
                  { id: 'men', label: "Men's Department" },
                  { id: 'women', label: "Women's Department" },
                  { id: 'kids', label: "Kids' Department" },
                  { id: 'sports', label: 'Sports & Performance' },
                  { id: 'sale', label: 'Sale & Clearance' },
                ].map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedDept === dept.id ? 'bg-black text-white' : 'bg-white border border-[#E5E5E5] text-gray-600 hover:border-black'
                    }`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>

              {/* Sub-Category Filter Buttons */}
              <div className="flex gap-2 items-center text-xs">
                <span className="text-gray-400 font-bold uppercase font-mono text-[11px]">Category:</span>
                {['all', 'shoes', 'clothing', 'accessories'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      selectedCategory === cat ? 'bg-gray-200 text-black font-black' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, SKU, or subcategory..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-xs outline-none focus:border-black"
                  />
                </div>
                <div className="text-xs font-mono text-gray-500 font-bold">
                  SHOWING {filteredProducts.length} ITEMS
                </div>
              </div>

              <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5] font-mono uppercase text-[#707072] text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Product Name & SKU</th>
                      <th className="py-3 px-4">Department / Section</th>
                      <th className="py-3 px-4">Retail Price</th>
                      <th className="py-3 px-4">Variants / Total Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 font-mono">
                          No items found in this department. Click "+ Add New Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const totalStock = (p.product_variants || []).reduce((acc, v) => acc + (v.stock || 0), 0);
                        const img = p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80';
                        return (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <img src={img} className="w-12 h-12 object-contain bg-[#F5F5F5] border rounded-lg p-1" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-sm text-[#111111]">{p.name}</div>
                              <div className="font-mono text-[10px] text-gray-400">SKU: {p.sku || 'N/A'} • /{p.slug}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-800">
                                {p.department || 'Men'} // {p.primary_category || 'Shoes'}
                              </span>
                              <div className="text-[10px] text-gray-500 font-medium mt-0.5">{p.subcategory || 'General'}</div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold">
                              {p.sale_price ? (
                                <div>
                                  <span className="text-black">${p.sale_price}</span>
                                  <span className="text-gray-400 line-through text-[10px] ml-1.5">${p.base_price}</span>
                                </div>
                              ) : (
                                `$${p.base_price}`
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              <span className={`font-bold ${totalStock <= 5 ? 'text-red-600' : 'text-black'}`}>
                                {totalStock} in stock
                              </span>
                              <div className="text-[10px] text-gray-400">({p.product_variants?.length || 0} variants)</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-green-100 text-green-800">
                                {p.status || 'active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                title="Duplicate"
                                onClick={async () => { await duplicateProduct(p.id); refreshAll(); }}
                                className="p-1.5 text-gray-400 hover:text-black rounded"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                title="Delete"
                                onClick={async () => { if (confirm(`Delete ${p.name}?`)) { await deleteProduct(p.id); refreshAll(); } }}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. 8-STEP ADD PRODUCT WIZARD (DYNAMIC SIZES + BULK STOCK MATRIX) */}
          {activeTab === 'add-product' && (
            <div className="max-w-4xl mx-auto bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#707072]">
                    STEP {wizardStep} OF 8: {[
                      'Department & Classification',
                      'Product Media & Frames',
                      'Colors & Dynamic Sizing Matrix',
                      'Pricing Setup',
                      'Inventory Stock Allocation',
                      'Technical Specifications',
                      'Search Engine Optimization',
                      'Review & Publish'
                    ][wizardStep - 1]}
                  </span>
                  <button onClick={() => setActiveTab('products')} className="text-xs font-bold underline">Cancel</button>
                </div>
                <div className="w-full h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#111111] transition-all duration-300" style={{ width: `${(wizardStep / 8) * 100}%` }}></div>
                </div>
              </div>

              {/* Step 1: Department & Primary Classification */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase">Step 1 — Department & Classification</h3>
                  
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Target Department *</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: 'men', label: "Men" },
                        { id: 'women', label: "Women" },
                        { id: 'kids', label: "Kids" },
                        { id: 'sports', label: "Sports" },
                        { id: 'sale', label: "Sale" },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setWizDept(d.id)}
                          className={`py-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                            wizDept === d.id ? 'bg-black text-white border-black' : 'bg-white border-[#E5E5E5] text-gray-700 hover:border-black'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Primary Category *</label>
                      <select
                        value={wizPrimaryCat}
                        onChange={(e) => handlePrimaryCatChange(e.target.value)}
                        className="w-full p-3 border rounded-xl text-xs font-bold uppercase outline-none bg-white"
                      >
                        <option value="shoes">Shoes / Footwear</option>
                        <option value="clothing">Clothes / Apparel</option>
                        <option value="accessories">Accessories & Gear</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Specific Section / Activity *</label>
                      <select
                        value={wizActivity}
                        onChange={(e) => setWizActivity(e.target.value)}
                        className="w-full p-3 border rounded-xl text-xs font-bold outline-none bg-white"
                      >
                        {(activityPresets[wizPrimaryCat] || []).map((act) => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Product Title *</label>
                      <input type="text" required value={wizName} onChange={(e) => setWizName(e.target.value)} placeholder="Nike Air Zoom Alpha or Pro Dri-FIT Tee" className="w-full p-3 border rounded-xl text-xs outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Brand</label>
                      <input type="text" value={wizBrand} onChange={(e) => setWizBrand(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Master Product SKU</label>
                    <input type="text" value={wizSku} onChange={(e) => setWizSku(e.target.value)} placeholder="ULX-M-APP-01" className="w-full p-3 border rounded-xl text-xs outline-none font-mono" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Short Description</label>
                    <input type="text" value={wizShortDesc} onChange={(e) => setWizShortDesc(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Detailed Technical Description</label>
                    <textarea rows={3} value={wizDesc} onChange={(e) => setWizDesc(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                  </div>
                </div>
              )}

              {/* Step 2: Media Upload with True Deletion */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase">Step 2 — Photos & Angle Frames</h3>
                    <span className="text-xs font-mono font-bold text-gray-500">{wizImages.length} Images Uploaded</span>
                  </div>

                  <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-bold uppercase">{wizUploading ? 'Uploading to Storage...' : 'Click or Drop Product Photos'}</span>
                    <span className="text-[10px] text-gray-400 mt-1">Upload Main, Side, Heel, Sole, Detail or Lifestyle photos</span>
                    <input type="file" multiple accept="image/*" onChange={handleImgUpload} disabled={wizUploading} className="hidden" />
                  </label>

                  {wizImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {wizImages.map((img, i) => (
                        <div key={i} draggable onDragStart={() => setDraggedImgIdx(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropImg(i)} className="relative aspect-square border rounded-xl overflow-hidden p-2 bg-gray-50 cursor-move group shadow-sm">
                          <img src={img.url} className="w-full h-full object-contain pointer-events-none" />
                          <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-mono px-1 rounded">#{i + 1}</span>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(i)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition-opacity shadow-md"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Colors & Dynamic Sizing Matrix */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase">
                      Step 3 — {wizPrimaryCat === 'shoes' ? 'Shoe Sizes' : wizPrimaryCat === 'clothing' ? 'Apparel Clothing Sizes' : 'Accessories Sizes'} Matrix
                    </h3>
                    <span className="text-[11px] font-mono text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded uppercase">
                      CATEGORY: {wizPrimaryCat}
                    </span>
                  </div>

                  {/* Colors Selector */}
                  <div>
                    <span className="text-xs font-bold uppercase block mb-2">Selected Colorways</span>
                    <div className="flex gap-2 flex-wrap items-center">
                      {['White', 'Black', 'Red', 'Navy', 'Grey', 'Volt', 'Olive'].map((c) => (
                        <button key={c} type="button" onClick={() => setWizColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${wizColors.includes(c) ? 'bg-black text-white border-black' : 'bg-white text-gray-700'}`}>
                          {wizColors.includes(c) ? '☑' : '☐'} {c}
                        </button>
                      ))}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="Add Color..."
                          value={customColorInput}
                          onChange={(e) => setCustomColorInput(e.target.value)}
                          className="px-2 py-1 border rounded text-xs w-24 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customColorInput && !wizColors.includes(customColorInput)) {
                              setWizColors([...wizColors, customColorInput]);
                              setCustomColorInput('');
                            }
                          }}
                          className="px-2 py-1 bg-black text-white rounded text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Category Sizes Selector */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase">
                        Available Sizes ({wizPrimaryCat === 'shoes' ? 'US Shoe Sizes' : wizPrimaryCat === 'clothing' ? 'Apparel Standard (XS-3XL)' : 'Gear Sizing'})
                      </span>
                      <button
                        type="button"
                        onClick={() => setWizSizes(sizePresets[wizPrimaryCat] || ['ONE SIZE'])}
                        className="text-[10px] font-mono underline text-gray-500"
                      >
                        Select All Category Sizes
                      </button>
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      {(sizePresets[wizPrimaryCat] || ['ONE SIZE']).map((s) => (
                        <button key={s} type="button" onClick={() => setWizSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${wizSizes.includes(s) ? 'bg-black text-white border-black' : 'bg-white text-gray-700'}`}>
                          {wizSizes.includes(s) ? '☑' : '☐'} {s}
                        </button>
                      ))}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="Custom Size..."
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          className="px-2 py-1 border rounded text-xs w-24 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customSizeInput && !wizSizes.includes(customSizeInput)) {
                              setWizSizes([...wizSizes, customSizeInput]);
                              setCustomSizeInput('');
                            }
                          }}
                          className="px-2 py-1 bg-black text-white rounded text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border rounded-xl text-xs font-mono flex justify-between items-center">
                    <span>Generated: <strong>{wizMatrix.length}</strong> combinations ({wizColors.length} Colors × {wizSizes.length} Sizes)</span>
                  </div>
                </div>
              )}

              {/* Step 4: Pricing */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase">Step 4 — Pricing & Promotion</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Regular Price ($) *</label>
                      <input type="number" step="0.01" value={wizRegPrice} onChange={(e) => setWizRegPrice(e.target.value)} className="w-full p-3 border rounded-xl text-xs font-mono font-bold outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Sale Price ($ Optional)</label>
                      <input type="number" step="0.01" value={wizSalePrice} onChange={(e) => setWizSalePrice(e.target.value)} className="w-full p-3 border rounded-xl text-xs font-mono font-bold outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Inventory Stock Allocation & Bulk Apply */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase">Step 5 — Inventory Stock Matrix</h3>
                    
                    {/* Bulk Set All Stock Tool */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Set All Stock:</span>
                      <input
                        type="number"
                        min="0"
                        value={bulkStockVal}
                        onChange={(e) => setBulkStockVal(e.target.value)}
                        className="w-16 p-1 border rounded text-xs font-mono text-center"
                      />
                      <button
                        type="button"
                        onClick={applyBulkStock}
                        className="px-3 py-1 bg-black text-white text-xs font-bold uppercase rounded-lg"
                      >
                        Apply All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto border rounded-2xl divide-y text-xs bg-white">
                    {wizMatrix.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 font-mono">No variants selected. Return to Step 3.</div>
                    ) : (
                      wizMatrix.map((row, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <span className="font-bold">{row.color} // Size: {row.size}</span>
                            <span className="text-[10px] text-gray-400 font-mono ml-2">SKU: {row.sku}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-[11px] font-mono">Stock:</span>
                            <input
                              type="number"
                              min="0"
                              value={row.stock}
                              onChange={(e) => {
                                const updated = [...wizMatrix];
                                updated[idx].stock = Number(e.target.value);
                                setWizMatrix(updated);
                              }}
                              className="w-20 p-1.5 border rounded text-right font-mono font-bold bg-white"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="text-right text-xs font-mono font-bold text-gray-500">
                    TOTAL ESTIMATED INVENTORY: {wizMatrix.reduce((acc, row) => acc + (Number(row.stock) || 0), 0)} UNITS
                  </div>
                </div>
              )}

              {/* Step 6: Technical Specs */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase">Step 6 — Technical Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Materials</label>
                      <input type="text" value={wizMaterials} onChange={(e) => setWizMaterials(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Fit & Sizing</label>
                      <input type="text" value={wizFit} onChange={(e) => setWizFit(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Weight Specification</label>
                      <input type="text" value={wizWeight} onChange={(e) => setWizWeight(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Country of Origin</label>
                      <input type="text" value={wizOrigin} onChange={(e) => setWizOrigin(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase block mb-1">Care Instructions</label>
                      <input type="text" value={wizCare} onChange={(e) => setWizCare(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Key Features (Comma-separated)</label>
                    <input type="text" value={wizFeatures} onChange={(e) => setWizFeatures(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                  </div>
                </div>
              )}

              {/* Step 7: SEO */}
              {wizardStep === 7 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase">Step 7 — Search Engine Optimization (SEO)</h3>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Meta Page Title</label>
                    <input type="text" value={wizSeoTitle} onChange={(e) => setWizSeoTitle(e.target.value)} className="w-full p-3 border rounded-xl text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">URL Slug</label>
                    <input type="text" value={wizSlug} onChange={(e) => setWizSlug(e.target.value)} className="w-full p-3 border rounded-xl text-xs font-mono outline-none" />
                  </div>
                </div>
              )}

              {/* Step 8: Review & Publish */}
              {wizardStep === 8 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase">Step 8 — Review & Placement</h3>
                  <div className="p-4 bg-gray-50 border rounded-2xl space-y-2 text-xs">
                    <div><strong>Department:</strong> {wizDept.toUpperCase()} // {wizPrimaryCat.toUpperCase()} ({wizActivity})</div>
                    <div><strong>Product:</strong> {wizName}</div>
                    <div><strong>Price:</strong> ${wizSalePrice || wizRegPrice} (${wizRegPrice})</div>
                    <div><strong>Variants:</strong> {wizMatrix.length} SKU combinations ({wizMatrix.reduce((acc, r) => acc + (Number(r.stock) || 0), 0)} total stock)</div>
                    <div><strong>Photos:</strong> {wizImages.length} frames uploaded</div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                      <input type="checkbox" checked={wizIsHero} onChange={(e) => setWizIsHero(e.target.checked)} className="accent-black" />
                      Set as Hero 360° Showcase
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                      <input type="checkbox" checked={wizIsNew} onChange={(e) => setWizIsNew(e.target.checked)} className="accent-black" />
                      Mark as New Drop
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-6 py-3 border rounded-full text-xs font-bold uppercase disabled:opacity-30"
                >
                  Back
                </button>
                {wizardStep < 8 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && !wizName) return alert('Please enter product title.');
                      setWizardStep(prev => prev + 1);
                    }}
                    className="px-8 py-3 bg-[#111111] text-white rounded-full text-xs font-bold uppercase"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublishProduct}
                    className="px-10 py-3 bg-green-600 text-white rounded-full text-xs font-bold uppercase hover:bg-green-700 transition-colors shadow-lg"
                  >
                    Publish to {wizDept.toUpperCase()}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DASHBOARD & SALES */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-[1300px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-gray-400">Total Store Earnings</div>
                  <div className="text-3xl font-black font-mono mt-2">${totalSales.toFixed(2)}</div>
                </div>
                <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-gray-400">Customer Orders</div>
                  <div className="text-3xl font-black font-mono mt-2">{orders.length}</div>
                </div>
                <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-gray-400">Registered Athletes</div>
                  <div className="text-3xl font-black font-mono mt-2">{customers.length}</div>
                </div>
                <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-gray-400">Inventory SKUs</div>
                  <div className="text-3xl font-black font-mono mt-2">{products.length}</div>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold uppercase text-sm">7-Day Sales & Earnings Curve</h3>
                <div className="w-full h-48 bg-[#FBFBFB] border border-[#E5E5E5] rounded-xl p-4 flex items-end justify-between relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 700 150">
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#111111" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#111111" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path d="M 0,130 Q 120,90 230,110 T 460,40 T 700,20 L 700,150 L 0,150 Z" fill="url(#grad)" />
                    <path d="M 0,130 Q 120,90 230,110 T 460,40 T 700,20" fill="none" stroke="#111111" strokeWidth="3" />
                  </svg>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="flex flex-col items-center z-10">
                      <div className="w-2.5 h-2.5 bg-black rounded-full mb-1"></div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F5] border-b font-mono uppercase text-[11px] text-gray-500">
                  <tr>
                    <th className="p-3.5">Product & Variant</th>
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {inventory.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">{v.products?.name} ({v.color} / {v.size})</td>
                      <td className="p-3.5 font-mono">{v.sku}</td>
                      <td className="p-3.5 font-mono font-bold">{v.stock} units</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button onClick={async () => { await adjustInventoryStock(v.id, -1, 'Manual Reduction'); refreshAll(); }} className="px-2.5 py-1 border rounded font-mono font-bold hover:bg-gray-100">-1</button>
                        <button onClick={async () => { await adjustInventoryStock(v.id, 1, 'Manual Restock'); refreshAll(); }} className="px-2.5 py-1 border rounded font-mono font-bold hover:bg-gray-100">+1</button>
                        <button onClick={async () => { await adjustInventoryStock(v.id, 10, 'Bulk Shipment'); refreshAll(); }} className="px-2.5 py-1 bg-black text-white rounded font-mono font-bold hover:bg-gray-800">+10</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-xs">ORDER #{o.order_number}</span>
                    <p className="text-xs text-gray-500">{o.shipping_address?.name} • ${Number(o.total_amount ?? o.total ?? 0).toFixed(2)}</p>
                  </div>
                  <select
                    value={o.status || 'processing'}
                    onChange={async (e) => { await updateOrderFulfillment(o.id, { status: e.target.value }); refreshAll(); }}
                    className="px-3 py-1.5 border rounded-lg text-xs font-bold uppercase outline-none bg-gray-50 cursor-pointer"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F5] border-b font-mono uppercase text-[11px] text-gray-500">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Orders Placed</th>
                    <th className="p-3.5">Total Lifetime Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">{c.full_name || 'Anonymous Athlete'}</td>
                      <td className="p-3.5 font-mono">{c.email}</td>
                      <td className="p-3.5 font-mono font-bold">{c.ordersCount} Orders</td>
                      <td className="p-3.5 font-mono font-bold">${c.totalSpent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RETURNS */}
          {activeTab === 'returns' && (
            <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F5] border-b font-mono uppercase text-[11px] text-gray-500">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {returnsList.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-mono">No return claims pending.</td></tr>
                  ) : (
                    returnsList.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-3.5 font-bold">{r.customer_name}</td>
                        <td className="p-3.5">{r.product_name} ({r.variant_size})</td>
                        <td className="p-3.5 text-gray-600">{r.reason}</td>
                        <td className="p-3.5 font-mono font-bold uppercase">{r.status}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button onClick={async () => { await updateReturnStatus(r.id, 'approved'); refreshAll(); }} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold uppercase">Approve</button>
                          <button onClick={async () => { await updateReturnStatus(r.id, 'rejected'); refreshAll(); }} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold uppercase">Reject</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-5 bg-white border border-[#E5E5E5] rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-yellow-500">{'★'.repeat(rev.rating || 5)}</span>
                      <span className="font-bold text-xs">{rev.products?.name}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">"{rev.comment}"</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">— {rev.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={async () => { await toggleReviewPublish(rev.id, !rev.is_published); refreshAll(); }} className="px-3 py-1 border rounded text-xs font-bold uppercase">
                      {rev.is_published ? 'Hide' : 'Publish'}
                    </button>
                    <button onClick={async () => { await deleteReview(rev.id); refreshAll(); }} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-4">
                <h3 className="font-bold uppercase text-xs text-gray-500">Create Promotion Coupon</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <input type="text" placeholder="CODE (e.g. SUMMER20)" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} className="p-2.5 border rounded-lg text-xs font-mono font-bold uppercase" />
                  <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className="p-2.5 border rounded-lg text-xs font-bold">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                  <input type="number" placeholder="Discount Value" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} className="p-2.5 border rounded-lg text-xs font-mono font-bold" />
                  <input type="number" placeholder="Min Order ($)" value={newCoupon.min_order_amount} onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })} className="p-2.5 border rounded-lg text-xs font-mono" />
                  <button onClick={async () => { await createCoupon(newCoupon); refreshAll(); }} className="bg-black text-white font-bold text-xs uppercase rounded-lg">Create Coupon</button>
                </div>
              </div>

              <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F5F5] border-b font-mono uppercase text-[11px] text-gray-500">
                    <tr>
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Discount</th>
                      <th className="p-3.5">Min Order</th>
                      <th className="p-3.5">Uses Count</th>
                      <th className="p-3.5 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {couponsList.map((c) => (
                      <tr key={c.id}>
                        <td className="p-3.5 font-mono font-black">{c.code}</td>
                        <td className="p-3.5 font-bold">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`}</td>
                        <td className="p-3.5 font-mono">${c.min_order_amount}</td>
                        <td className="p-3.5 font-mono">{c.uses_count} / {c.max_uses}</td>
                        <td className="p-3.5 text-right">
                          <button onClick={async () => { await deleteCoupon(c.id); refreshAll(); }} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STORE CONTENT */}
          {activeTab === 'content' && (
            <div className="max-w-3xl bg-white border border-[#E5E5E5] rounded-2xl p-8 space-y-6">
              <h3 className="font-black uppercase text-base">Storefront Visual Customizer</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase block mb-1">Hero Headline</label>
                  <input type="text" value={storeContent.headline} onChange={(e) => setStoreContentState({ ...storeContent, headline: e.target.value })} className="w-full p-3 border rounded-xl text-xs font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase block mb-1">Hero Subheadline</label>
                  <input type="text" value={storeContent.subheadline} onChange={(e) => setStoreContentState({ ...storeContent, subheadline: e.target.value })} className="w-full p-3 border rounded-xl text-xs" />
                </div>
              </div>
              <button onClick={async () => { await updateStoreContent('homepage_hero', storeContent); alert('Storefront hero updated live!'); }} className="px-8 py-3.5 bg-black text-white rounded-full text-xs font-bold uppercase">Save Live Content</button>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[1100px]">
              <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-3 shadow-sm">
                <h4 className="font-bold uppercase text-sm">Sales Ledger</h4>
                <button onClick={() => exportCSV(orders, 'orders-ledger')} className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export CSV ({orders.length} Orders)
                </button>
              </div>
              <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-3 shadow-sm">
                <h4 className="font-bold uppercase text-sm">Inventory Ledger</h4>
                <button onClick={() => exportCSV(inventory, 'inventory-ledger')} className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export CSV ({inventory.length} SKUs)
                </button>
              </div>
              <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-3 shadow-sm">
                <h4 className="font-bold uppercase text-sm">Customers Ledger</h4>
                <button onClick={() => exportCSV(customers, 'customers-ledger')} className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export CSV ({customers.length} Profiles)
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl bg-white border rounded-2xl p-6 space-y-3">
              <h3 className="font-bold uppercase text-xs text-gray-500 mb-4">Live Notification Feed</h3>
              {inventory.filter(v => (v.stock || 0) <= 5).map((v, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span><strong>Low Stock Warning:</strong> {v.products?.name} ({v.color} / {v.size}) has only {v.stock} units left.</span>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white border rounded-2xl p-8 space-y-6">
              <h3 className="font-black uppercase text-base">Store Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase block mb-1">Store Name</label>
                  <input type="text" value={settingsData.store_name} onChange={(e) => setSettingsData({ ...settingsData, store_name: e.target.value })} className="w-full p-3 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase block mb-1">Contact Email</label>
                  <input type="email" value={settingsData.contact_email} onChange={(e) => setSettingsData({ ...settingsData, contact_email: e.target.value })} className="w-full p-3 border rounded-xl text-xs" />
                </div>
              </div>
              <button onClick={async () => { await updateStoreSettings('general', settingsData); alert('Settings saved successfully!'); }} className="px-8 py-3.5 bg-black text-white rounded-full text-xs font-bold uppercase">Save Settings</button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}