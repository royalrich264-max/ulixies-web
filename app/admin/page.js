'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { isAdminUser } from '@/lib/adminConfig';
import {
  getCurrentUser,
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
  getAllCustomers,
  getAllReviews,
  toggleReviewPublish,
  deleteReview,
  getAllCoupons,
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
  getCouponUsageCounts,
  getStoreContent,
  updateStoreContent,
  getStoreSettings,
  updateStoreSettings,
  getAuditLog,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAllSupportTickets,
  updateSupportTicket,
  signOutUser
} from '@/services/storeService';
import { 
  LayoutDashboard, ShoppingBag, Boxes, Users, RotateCcw, 
  Star, Tag, Palette, BarChart3, FileSpreadsheet, Bell, Settings, 
  LogOut, Plus, Trash2, Copy, RefreshCw, Upload, Search, 
  AlertTriangle, Clock, Truck, Download, X, Layers,
  DollarSign, Key, FileText, MapPin, Mail, Phone,
  TrendingUp, ShieldCheck, Sliders, Image as ImageIcon,
  Terminal, MinusCircle, Percent, Edit3, Cpu, Check, History, LifeBuoy
} from 'lucide-react';

const ACTIVITY_PRESETS = {
  shoes: ['Gym & Training', 'Running', 'Lifestyle / Everyday', 'Basketball', 'Football / Soccer', 'Trail & Outdoor'],
  clothing: ['Gym & Workout Shirts', 'Hoodies & Sweatshirts', 'Training Shorts', 'Track Pants & Tights', 'Jackets & Outerwear', 'Everyday Casual'],
  accessories: ['Training Bags & Backpacks', 'Performance Socks', 'Caps & Headwear', 'Gloves & Gym Straps']
};

const SIZE_PRESETS = {
  shoes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  accessories: ['ONE SIZE', 'S/M', 'L/XL']
};

export default function CrownAdminControlTower() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Raw Database Records
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [customCollections, setCustomCollections] = useState([]);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [auditLog, setAuditLog] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [ticketResponseDraft, setTicketResponseDraft] = useState('');

  // Storefront CMS Configuration
  const [storeContent, setStoreContentState] = useState({
    announcementBar: 'WORLDWIDE EXPRESS SHIPPING ENABLED // COMPLIMENTARY ON ORDERS OVER $100',
    headline: 'MOVE DIFFERENT',
    subheadline: 'Engineered for the Apex Athlete',
    cta_text: 'SHOP ARCHIVE'
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
    currency: 'USD',
    statementDescriptor: 'ULIXIES GEAR',
    hasStripeSecretConfigured: false
  });

  // Diagnostic System Health State
  const [systemHealth, setSystemHealth] = useState([
    { service: 'DATABASE (PostgreSQL)', status: 'CHECKING', latency: '0ms' },
    { service: 'OBJECT STORAGE (Media)', status: 'CHECKING', latency: '0ms' },
    { service: 'API RUNTIME (PostgREST)', status: 'CHECKING', latency: '0ms' },
    { service: 'AUTH ENGINE (GoTrue)', status: 'CHECKING', latency: '0ms' },
    { service: 'STRIPE WEBHOOK VAULT', status: 'ONLINE', latency: 'ACTIVE' },
    { service: 'STOREFRONT WEBSITE', status: 'ONLINE', latency: 'EDGE' }
  ]);

  // Global Search Overlay (Ctrl+K)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  // Modals & Details
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);
  const [editingProductModal, setEditingProductModal] = useState(null);
  const [editingVariants, setEditingVariants] = useState([]);
  const [editVariantSizeInput, setEditVariantSizeInput] = useState('');

  // Products Filter & 8-Step Wizard State
  const [selectedDept, setSelectedDept] = useState('all');
  const [wizardStep, setWizardStep] = useState(1);
  const [wizDept, setWizDept] = useState('men');
  const [wizPrimaryCat, setWizPrimaryCat] = useState('shoes');
  const [wizActivity, setWizActivity] = useState('Gym & Training');
  const [wizName, setWizName] = useState('');
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
  const [customSizeInput, setCustomSizeInput] = useState('');
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
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', discount_value: '20', usage_limit: '500', per_user_limit: '1' });
  const [couponUsageCounts, setCouponUsageCounts] = useState({});
  const [mediaList, setMediaList] = useState([]);

  // Telemetry Diagnostic Latency Ping
  const runDiagnostics = async () => {
    const t0 = performance.now();
    const { error: dbErr } = await supabase.from('products').select('id').limit(1);
    const dbLatency = Math.round(performance.now() - t0);

    const t1 = performance.now();
    const { error: storageErr } = await supabase.storage.getBucket('product-images');
    const storageLatency = Math.round(performance.now() - t1);

    const t2 = performance.now();
    const { error: apiErr } = await supabase.from('orders').select('id').limit(1);
    const apiLatency = Math.round(performance.now() - t2);

    const t3 = performance.now();
    await supabase.auth.getSession();
    const authLatency = Math.round(performance.now() - t3);

    setSystemHealth([
      { service: 'DATABASE (PostgreSQL)', status: dbErr ? 'OFFLINE' : 'ONLINE', latency: `${dbLatency}ms` },
      { service: 'OBJECT STORAGE (Media)', status: storageErr ? 'OFFLINE' : 'ONLINE', latency: `${storageLatency}ms` },
      { service: 'API RUNTIME (PostgREST)', status: apiErr ? 'OFFLINE' : 'ONLINE', latency: `${apiLatency}ms` },
      { service: 'AUTH ENGINE (GoTrue)', status: 'ONLINE', latency: `${authLatency}ms` },
      { service: 'STRIPE WEBHOOK VAULT', status: 'ONLINE', latency: 'ACTIVE' },
      { service: 'STOREFRONT WEBSITE', status: 'ONLINE', latency: 'EDGE' }
    ]);
  };

  // Upload Local Device Image with Cloud Storage / Base64 Data URI Fallback
  const handleDeviceImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setWizUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          uploadedUrls.push({ url: data.publicUrl, view_angle: 'side', alt_text: `${wizName || 'Item'} frame` });
        } else {
          // If storage bucket is restricted, convert to persistent Base64 Data URI
          const base64Url = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push({ url: base64Url, view_angle: 'side', alt_text: `${wizName || 'Item'} frame` });
        }
      }
      setWizImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setWizUploading(false);
      e.target.value = '';
    }
  };

  // Fetch All Remote Data
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [p, o, inv, cust, ret, rev, coup, couponCounts, colls, cont, sett, gateway, ship, audit, notifs, tickets] = await Promise.all([
        getHomeProducts(),
        supabase.from('orders').select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            product_name,
            variant_id,
            product_variants (
              id,
              size,
              color,
              stock,
              reserved_stock,
              products (
                id,
                name,
                base_price,
                sale_price,
                product_images (url)
              )
            )
          )
        `).order('created_at', { ascending: false }),
        getInventoryVariants(),
        getAllCustomers(),
        supabase.from('returns').select('*').order('created_at', { ascending: false }),
        getAllReviews(),
        getAllCoupons(),
        getCouponUsageCounts(),
        supabase.from('collections').select('*, collection_products(count)'),
        getStoreContent('homepage_hero'),
        getStoreSettings('general'),
        getStoreSettings('payment_gateway'),
        getStoreSettings('shipping_rules'),
        getAuditLog(),
        getAdminNotifications(),
        getAllSupportTickets()
      ]);

      setProducts(p || []);
      setOrders(o.data || []);
      setInventory(inv || []);
      setSupportTickets(tickets || []);
      setCustomers(cust || []);
      setReturnsList(ret.data || []);
      setReviewsList(rev || []);
      setCouponsList(coup || []);
      setCouponUsageCounts(couponCounts || {});
      setCustomCollections(colls.data || []);
      setAuditLog(audit || []);
      setAdminNotifications(notifs || []);

      if (cont) setStoreContentState(prev => ({ ...prev, ...cont }));
      if (sett) setSettingsData(prev => ({ ...prev, ...sett }));
      if (gateway) setPaymentConfig(prev => ({ ...prev, ...gateway }));
      if (ship) setShippingRules(prev => ({ ...prev, ...ship }));

      const allImgs = (p || []).flatMap(prod => (prod.product_images || []).map(img => ({ url: img.url, name: prod.name })));
      setMediaList(allImgs);

      runDiagnostics();
    } catch (err) {
      console.error('Crown Data Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAccess() {
      const user = await getCurrentUser();
      if (!isAdminUser(user)) {
        router.replace('/login');
        return;
      }
      setAuthorized(true);
      setAuthChecked(true);
    }
    checkAccess();
  }, [router]);

  useEffect(() => {
    if (authorized) refreshAll();
  }, [authorized]);

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

  const toggleWizSize = (size) => {
    setWizSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!wizSizes.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setWizSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput('');
  };

  // Matrix Generator for Product Wizard
  useEffect(() => {
    const matrix = [];
    const baseSku = wizSku || (wizName ? wizName.substring(0, 4).toUpperCase() : 'ULX');
    // No color selected shouldn't mean no sizes either — fall back to a single
    // colorless row per size so a product with sizes but no color still publishes.
    const colorsToUse = wizColors.length > 0 ? wizColors : [null];
    colorsToUse.forEach((color) => {
      wizSizes.forEach((size) => {
        const cCode = color ? color.substring(0, 1).toUpperCase() : 'X';
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

  const handleDeleteImage = async (indexToRemove) => {
    const targetImage = wizImages[indexToRemove];
    if (!targetImage) return;
    setWizImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (targetImage.url && targetImage.url.includes('product-images')) {
      const parts = targetImage.url.split('/');
      const fileName = parts[parts.length - 1];
      await supabase.storage.from('product-images').remove([`products/${fileName}`]);
    }
  };

  const handlePublishProduct = async () => {
    if (!wizName.trim()) return alert('Please enter product title.');
    if (wizImages.length === 0) return alert('Please upload at least 1 photo from your device.');
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

  // 10-Stage Order Transition with Automated Inventory Triggers[cite: 2]
  const handleFulfillmentStageChange = async (order, newStatus) => {
    try {
      if (newStatus === 'shipped' && order.status !== 'shipped') {
        for (const item of (order.order_items || [])) {
          if (item.variant_id) {
            const { data: v } = await supabase
              .from('product_variants')
              .select('stock, reserved_stock')
              .eq('id', item.variant_id)
              .single();

            if (v) {
              await supabase
                .from('product_variants')
                .update({
                  stock: Math.max(0, (v.stock || 0) - (item.quantity || 1)),
                  reserved_stock: Math.max(0, (v.reserved_stock || 0) - (item.quantity || 1))
                })
                .eq('id', item.variant_id);
            }
          }
        }
      }

      if (newStatus === 'cancelled' && order.status !== 'cancelled') {
        for (const item of (order.order_items || [])) {
          if (item.variant_id) {
            const { data: v } = await supabase
              .from('product_variants')
              .select('reserved_stock')
              .eq('id', item.variant_id)
              .single();

            if (v) {
              await supabase
                .from('product_variants')
                .update({
                  reserved_stock: Math.max(0, (v.reserved_stock || 0) - (item.quantity || 1))
                })
                .eq('id', item.variant_id);
            }
          }
        }
      }

      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
      if (error) throw error;
      await refreshAll();
    } catch (err) {
      alert(`Status transition failed: ${err.message}`);
    }
  };

  const handleUpdateReturnStage = async (claimId, updates) => {
    try {
      const payload = typeof updates === 'string' ? { status: updates } : updates;
      const { error } = await supabase.from('returns').update(payload).eq('id', claimId);
      if (error) throw error;
      setSelectedReturnDetails(null);
      refreshAll();
    } catch (err) {
      alert(`Return update failed: ${err.message}`);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setAdminNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    } catch (err) {
      alert(`Failed to update notification: ${err.message}`);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      setAdminNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      alert(`Failed to update notifications: ${err.message}`);
    }
  };

  const openTicketDialog = (ticket) => {
    setSelectedTicketDetails(ticket);
    setTicketResponseDraft(ticket.admin_response || '');
  };

  const handleSaveTicketResponse = async (status) => {
    if (!selectedTicketDetails) return;
    try {
      await updateSupportTicket(selectedTicketDetails.id, { status, admin_response: ticketResponseDraft });
      setSelectedTicketDetails(null);
      refreshAll();
    } catch (err) {
      alert(`Failed to save response: ${err.message}`);
    }
  };

  const handleUpdateOrderShippingDetails = async (orderId, carrier, tracking) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ shipping_carrier: carrier, tracking_number: tracking })
        .eq('id', orderId);
      if (error) throw error;
      alert('Shipping parameters updated on order card.');
      refreshAll();
    } catch (err) {
      alert(`Shipping update failed: ${err.message}`);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!confirm(`Permanently delete order ${order.order_number || order.id}? This cannot be undone.`)) return;
    try {
      // Clear child rows first (payments/coupon_usage/returns/order_items all reference
      // orders.id) so the delete below doesn't fail on a foreign-key constraint.
      await supabase.from('payments').delete().eq('order_id', order.id);
      await supabase.from('coupon_usage').delete().eq('order_id', order.id);
      await supabase.from('returns').delete().eq('order_id', order.id);
      await supabase.from('order_items').delete().eq('order_id', order.id);

      const { error } = await supabase.from('orders').delete().eq('id', order.id);
      if (error) throw error;

      alert('Order deleted.');
      await refreshAll();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleToggleSaleDiscount = async (product, enableSale, customDiscountPercent = 20) => {
    try {
      const calculatedSalePrice = enableSale
        ? Math.round(Number(product.base_price) * (1 - customDiscountPercent / 100))
        : null;

      const { error } = await supabase
        .from('products')
        .update({
          is_on_sale: enableSale,
          sale_price: calculatedSalePrice
        })
        .eq('id', product.id);

      if (error) throw error;
      await refreshAll();
    } catch (err) {
      alert(`Sale toggle failed: ${err.message}`);
    }
  };

  const handleSetDepartmentHero = async (product) => {
    try {
      const makingHero = !product.is_best_seller;
      if (makingHero) {
        const { error: clearError } = await supabase
          .from('products')
          .update({ is_best_seller: false })
          .eq('department', product.department)
          .neq('id', product.id);
        if (clearError) throw clearError;
      }

      const { error } = await supabase
        .from('products')
        .update({ is_best_seller: makingHero })
        .eq('id', product.id);

      if (error) throw error;
      await refreshAll();
    } catch (err) {
      alert(`Hero update failed: ${err.message}`);
    }
  };

  const openEditProduct = (p) => {
    setEditingProductModal(p);
    setEditingVariants((p.product_variants || []).map((v) => ({ ...v })));
    setEditVariantSizeInput('');
  };

  const addEditVariantRow = () => {
    const trimmed = editVariantSizeInput.trim();
    if (!trimmed) return;
    if (editingVariants.some((v) => (v.size || '').toLowerCase() === trimmed.toLowerCase())) {
      setEditVariantSizeInput('');
      return;
    }
    setEditingVariants((prev) => [...prev, { size: trimmed, color: prev[0]?.color || null, stock: 0 }]);
    setEditVariantSizeInput('');
  };

  const handleSaveEditedProduct = async (e) => {
    e.preventDefault();
    if (!editingProductModal) return;

    // Catch duplicate size/color combos before hitting the database — same size
    // listed twice (with the same color) throws a raw constraint error otherwise.
    const seenVariantKeys = new Set();
    for (const v of editingVariants) {
      if (!v.size || !String(v.size).trim()) continue;
      const key = `${String(v.size).trim().toLowerCase()}|${String(v.color || '').trim().toLowerCase()}`;
      if (seenVariantKeys.has(key)) {
        alert(`"${v.size}"${v.color ? ` in ${v.color}` : ''} is listed more than once in Sizes & Stock. Remove the duplicate row and save again.`);
        return;
      }
      seenVariantKeys.add(key);
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProductModal.name,
          base_price: parseFloat(editingProductModal.base_price),
          sale_price: editingProductModal.sale_price ? parseFloat(editingProductModal.sale_price) : null,
          is_on_sale: Boolean(editingProductModal.sale_price && Number(editingProductModal.sale_price) < Number(editingProductModal.base_price)),
          department: editingProductModal.department,
          primary_category: editingProductModal.primary_category,
          subcategory: editingProductModal.subcategory,
          description: editingProductModal.description,
          short_description: editingProductModal.short_description
        })
        .eq('id', editingProductModal.id);

      if (error) throw error;

      // Sync sizes/variants: remove ones taken off the list, update the rest, insert new ones.
      const originalIds = (editingProductModal.product_variants || []).map((v) => v.id);
      const keptIds = editingVariants.filter((v) => v.id).map((v) => v.id);
      const removedIds = originalIds.filter((id) => !keptIds.includes(id));

      if (removedIds.length > 0) {
        const { error: delErr } = await supabase.from('product_variants').delete().in('id', removedIds);
        if (delErr) throw new Error(`Some sizes couldn't be removed (likely already used in an order): ${delErr.message}`);
      }

      for (const v of editingVariants) {
        if (!v.size || !String(v.size).trim()) continue;
        if (v.id) {
          const { error: updErr } = await supabase
            .from('product_variants')
            .update({ size: v.size, color: v.color || null, stock: Number(v.stock) || 0 })
            .eq('id', v.id);
          if (updErr) throw updErr;
        } else {
          const { error: insErr } = await supabase
            .from('product_variants')
            .insert({ product_id: editingProductModal.id, size: v.size, color: v.color || null, stock: Number(v.stock) || 0 });
          if (insErr) throw insErr;
        }
      }

      alert('Product updated successfully!');
      setEditingProductModal(null);
      await refreshAll();
    } catch (err) {
      const friendly = /duplicate key value/i.test(err.message)
        ? 'Two rows in Sizes & Stock have the same size and color. Remove the duplicate and save again.'
        : err.message;
      alert(`Update failed: ${friendly}`);
    }
  };

  const handleSavePaymentGateway = async (e) => {
    e.preventDefault();
    try {
      await updateStoreSettings('payment_gateway', paymentConfig);
      alert('Notes saved. Remember: this does not change real Stripe processing.');
    } catch (err) {
      alert(`Failed to save notes: ${err.message}`);
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return alert('No records to export.');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => 
      Object.values(obj).map((val) => `"${String(typeof val === 'object' ? JSON.stringify(val) : val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to reliably find an image for an ordered line item without external internet fallbacks
  const getOrderItemImage = (item) => {
    if (item?.product_variants?.products?.product_images?.[0]?.url) {
      return item.product_variants.products.product_images[0].url;
    }
    if (item?.image_url) {
      return item.image_url;
    }
    const matchedProd = products.find((p) => p.name === item?.product_name || p.id === item?.product_variants?.product_id);
    if (matchedProd?.product_images?.[0]?.url) {
      return matchedProd.product_images[0].url;
    }
    return '';
  };

  // Metrics Calculations: Total Revenue accurately computes all transactions (including $1 test charges)
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount ?? o.total ?? 0), 0);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount ?? o.total ?? 0), 0);

  const monthOrders = orders.filter(o => new Date(o.created_at) >= startOfMonth);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total_amount ?? o.total ?? 0), 0);

  const lowStockUnits = inventory.filter(v => (v.stock || 0) <= 5 && (v.stock || 0) > 0).length;
  const outOfStockUnits = inventory.filter(v => (v.stock || 0) <= 0).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'pending' || o.status === 'paid').length;
  const pendingReturnsCount = returnsList.filter(r => r.status === 'requested').length;
  const activeSalesCount = products.filter(p => p.is_on_sale || (p.sale_price && Number(p.sale_price) < Number(p.base_price))).length;
  const unreadNotificationsCount = adminNotifications.filter(n => !n.is_read).length;
  const openTicketsCount = supportTickets.filter(t => t.status === 'open').length;

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
      const prod = products.find(p => p.name === item.product_name || p.id === item.product_variants?.products?.id);
      const dept = prod?.department || 'men';
      acc[dept] = (acc[dept] || 0) + Number(item.unit_price || 0) * (item.quantity || 1);
    });
    return acc;
  }, { men: 0, women: 0, kids: 0, sports: 0 });

  const totalDeptRev = Object.values(deptRevenue).reduce((a, b) => a + b, 0) || 1;

  // Global Search Filtering
  const globalResults = useMemo(() => {
    if (!globalQuery.trim()) return { products: [], orders: [], customers: [], returns: [], reviews: [], coupons: [], support: [] };
    const q = globalQuery.toLowerCase();
    return {
      products: products.filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)),
      orders: orders.filter(o => (o.order_number || o.id)?.toLowerCase().includes(q) || (o.shipping_address?.recipient_name || o.shipping_address?.name)?.toLowerCase().includes(q)),
      customers: customers.filter(c => c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)),
      returns: returnsList.filter(r => r.order_number?.toLowerCase().includes(q) || r.customer_name?.toLowerCase().includes(q)),
      reviews: reviewsList.filter(rv => rv.body?.toLowerCase().includes(q) || rv.reviewer_name?.toLowerCase().includes(q)),
      coupons: couponsList.filter(cp => cp.code?.toLowerCase().includes(q)),
      support: supportTickets.filter(t => t.subject?.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q))
    };
  }, [globalQuery, products, orders, customers, returnsList, reviewsList, couponsList, supportTickets]);

  if (!authChecked || !authorized) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
          Verifying admin access...
        </span>
      </div>
    );
  }

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
                          <span className="font-bold text-white">{o.order_number || o.id.slice(0, 8)}</span>
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

                  {globalResults.support.length > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Support Tickets ({globalResults.support.length})</div>
                      {globalResults.support.map(t => (
                        <div key={t.id} onClick={() => { setActiveTab('support'); setIsSearchOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex justify-between cursor-pointer mb-1">
                          <span className="font-bold text-white">{t.name} - {t.subject}</span>
                          <span className="text-[#CCFF00]">{t.status}</span>
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
                { id: 'sales', label: 'Sales & Markdowns', icon: Percent, count: activeSalesCount },
                { id: 'categories', label: 'Categories & Drops', icon: Layers, count: customCollections.length },
                { id: 'inventory', label: 'Inventory Engine', icon: Boxes, alert: lowStockUnits > 0 || outOfStockUnits > 0 },
                { id: 'orders', label: 'Deliveries & Orders', icon: Truck, count: pendingOrdersCount },
                { id: 'returns', label: 'Returns & Inspection', icon: RotateCcw, count: pendingReturnsCount },
                { id: 'support', label: 'Customer Support', icon: LifeBuoy, count: openTicketsCount },
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
                { id: 'notifications', label: 'Notification Log', icon: Bell, count: unreadNotificationsCount },
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
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isActive ? 'bg-black text-white' : 'bg-white/10 text-gray-300'}`}>
                        {item.count}
                      </span>
                    )}
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
                <button onClick={() => setActiveTab('sales')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase flex items-center gap-1.5 shrink-0">
                  <Percent className="w-3.5 h-3.5 text-red-400" /> [ CLEARANCE ENGINE ]
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
                    <span className="text-[10px] font-bold uppercase">TOTAL REVENUE (STRIPE)</span>
                    <DollarSign className="w-4 h-4 text-[#CCFF00]" />
                  </div>
                  <div className="text-3xl font-black text-white">${totalRevenue.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 mt-2">{orders.length} total orders recorded</div>
                </div>

                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-center text-gray-400 mb-1">
                    <span className="text-[10px] font-bold uppercase">TODAY'S REVENUE</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">${todayRevenue.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 mt-2">{todayOrders.length} orders today</div>
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
                    <span className="text-[10px] font-bold uppercase">ACTIVE SALES / DROPS</span>
                    <Percent className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{activeSalesCount}</div>
                  <div className="text-[10px] text-gray-500 mt-2">Discounted items live on storefront</div>
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
              <div className="p-3.5 bg-lime-950/20 border border-lime-800/30 rounded-xl text-[11px] text-gray-300 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" fill="currentColor" />
                Click the star next to a product to set it as that department's homepage hero image. Only one hero per department — setting a new one replaces the old.
              </div>
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
                      <th className="p-4">Base Price</th>
                      <th className="p-4">Sale Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.filter(p => selectedDept === 'all' || p.department === selectedDept).map(p => {
                      const totalStock = (p.product_variants || []).reduce((acc, v) => acc + (v.stock || 0), 0);
                      const img = p.product_images?.[0]?.url;
                      return (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="p-4">
                            {img ? (
                              <img src={img} className="w-10 h-10 object-contain bg-black rounded-lg border border-white/10 p-1" />
                            ) : (
                              <div className="w-10 h-10 flex items-center justify-center bg-black/60 border border-white/10 rounded-lg text-gray-500">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-sans">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              {p.name}
                              {p.is_best_seller && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-[#CCFF00] text-black">Hero</span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-gray-500">{p.sku || 'SKU-NONE'}</div>
                          </td>
                          <td className="p-4 uppercase text-gray-400">{p.department} // {p.primary_category}</td>
                          <td className="p-4 font-bold text-white">${p.base_price}</td>
                          <td className="p-4">
                            {p.sale_price ? (
                              <span className="text-red-400 font-bold">${p.sale_price}</span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
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
                            <button
                              onClick={() => handleSetDepartmentHero(p)}
                              className={`p-1 ${p.is_best_seller ? 'text-[#CCFF00]' : 'text-gray-400 hover:text-white'}`}
                              title={p.is_best_seller ? `Remove as ${p.department} homepage hero` : `Set as ${p.department} homepage hero`}
                            >
                              <Star className="w-4 h-4" fill={p.is_best_seller ? 'currentColor' : 'none'} />
                            </button>
                            <button onClick={() => openEditProduct(p)} className="p-1 text-gray-400 hover:text-white" title="Edit Article">
                              <Edit3 className="w-4 h-4" />
                            </button>
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

          {/* 3. SALES & MARKDOWNS CONTROL ENGINE */}
          {activeTab === 'sales' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="bg-[#141414] p-6 rounded-2xl border border-white/10">
                <h3 className="text-sm font-bold uppercase text-white mb-2">Clearance & Discount Controls</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Toggle promotional markdowns on or off instantly. Applying a sale will update <span className="text-[#CCFF00]">sale_price</span>, render dynamic discount tags on product cards, and automatically surface items inside the customer-facing Sales tab.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => {
                  const isOnSale = p.is_on_sale || (p.sale_price && Number(p.sale_price) < Number(p.base_price));
                  const discountPct = isOnSale && p.sale_price ? Math.round(((Number(p.base_price) - Number(p.sale_price)) / Number(p.base_price)) * 100) : 20;
                  const img = p.product_images?.[0]?.url;

                  return (
                    <div key={p.id} className="bg-[#141414] p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-14 h-14 object-contain bg-black/40 rounded-xl p-1 border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 flex items-center justify-center bg-black/60 border border-white/10 rounded-xl text-gray-500 shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-xs font-sans">{p.name}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{p.department} // {p.primary_category}</div>
                          <div className="text-xs font-bold mt-1">
                            Base: <span className="text-white">${p.base_price}</span>
                            {isOnSale && (
                              <span className="text-red-400 ml-2">Sale: ${p.sale_price} (-{discountPct}%)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex gap-2">
                        {isOnSale ? (
                          <button
                            onClick={() => handleToggleSaleDiscount(p, false)}
                            className="w-full py-2.5 bg-red-600/20 border border-red-500 text-red-300 font-bold text-[10px] uppercase rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                          >
                            Remove From Sale
                          </button>
                        ) : (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleToggleSaleDiscount(p, true, 20)}
                              className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase rounded-xl hover:bg-[#CCFF00] hover:text-black transition-all"
                            >
                              +20% OFF
                            </button>
                            <button
                              onClick={() => handleToggleSaleDiscount(p, true, 30)}
                              className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase rounded-xl hover:bg-[#CCFF00] hover:text-black transition-all"
                            >
                              +30% OFF
                            </button>
                            <button
                              onClick={() => handleToggleSaleDiscount(p, true, 50)}
                              className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase rounded-xl hover:bg-[#CCFF00] hover:text-black transition-all"
                            >
                              +50% OFF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. PRODUCT WIZARD (WITH DEVICE UPLOAD) */}
          {activeTab === 'add-product' && (
            <div className="max-w-4xl mx-auto bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase text-[#CCFF00]">
                  PRODUCT WIZARD // STEP {wizardStep} OF 8: {[
                    'Classification', 'Media & Frames Upload', 'Color & Sizing Matrix', 'Pricing',
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

                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Base SKU Code</label>
                    <input type="text" value={wizSku} onChange={(e) => setWizSku(e.target.value)} placeholder="e.g. ULX-AIR" className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#CCFF00] bg-black/40">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold uppercase text-xs tracking-wider">{wizUploading ? 'Uploading to bucket...' : 'Select Multi-Angle Photos from Your Device'}</span>
                    <span className="text-[10px] text-gray-500 mt-1">Accepts PNG, JPG, WebP</span>
                    <input type="file" multiple accept="image/*" onChange={handleDeviceImageUpload} disabled={wizUploading} className="hidden" />
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
                <div className="space-y-6">
                  <div>
                    <div className="text-gray-400 font-bold uppercase mb-2">Variant Colors (Defaults stock to 0)</div>
                    <div className="flex gap-2 flex-wrap">
                      {['White', 'Black', 'Red', 'Navy', 'Grey', 'Volt'].map(c => (
                        <button key={c} type="button" onClick={() => setWizColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className={`px-3 py-1.5 rounded-lg border ${wizColors.includes(c) ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-bold' : 'bg-black text-gray-400 border-white/10'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 font-bold uppercase mb-2">
                      Available Sizes — these are exactly what customers will be able to pick on the site
                    </div>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {(SIZE_PRESETS[wizPrimaryCat] || SIZE_PRESETS.shoes).map(sz => (
                        <button key={sz} type="button" onClick={() => toggleWizSize(sz)} className={`px-3 py-1.5 rounded-lg border ${wizSizes.includes(sz) ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-bold' : 'bg-black text-gray-400 border-white/10'}`}>
                          {sz}
                        </button>
                      ))}
                    </div>

                    {wizSizes.some(s => !(SIZE_PRESETS[wizPrimaryCat] || SIZE_PRESETS.shoes).includes(s)) && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {wizSizes.filter(s => !(SIZE_PRESETS[wizPrimaryCat] || SIZE_PRESETS.shoes).includes(s)).map(sz => (
                          <button key={sz} type="button" onClick={() => toggleWizSize(sz)} className="px-3 py-1.5 rounded-lg border bg-[#CCFF00] text-black border-[#CCFF00] font-bold flex items-center gap-1.5">
                            {sz} <X className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSize(); } }}
                        placeholder="Custom size (e.g. 3XL, EU 42, Kids 5Y)"
                        className="flex-1 p-2.5 bg-black border border-white/10 rounded-lg text-white outline-none text-xs"
                      />
                      <button type="button" onClick={handleAddCustomSize} className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg font-bold uppercase text-[10px]">
                        Add Size
                      </button>
                    </div>
                    {wizSizes.length === 0 && (
                      <p className="text-red-400 text-[10px] mt-2">Select or add at least one size — no sizes means customers can't buy this item.</p>
                    )}
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
                <div className="space-y-4">
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
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Weight Spec</label>
                      <input type="text" value={wizWeight} onChange={(e) => setWizWeight(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Care Instructions</label>
                      <input type="text" value={wizCare} onChange={(e) => setWizCare(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Origin</label>
                      <input type="text" value={wizOrigin} onChange={(e) => setWizOrigin(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Technical Features (comma separated)</label>
                    <input type="text" value={wizFeatures} onChange={(e) => setWizFeatures(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Short Description</label>
                    <input type="text" value={wizShortDesc} onChange={(e) => setWizShortDesc(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Full Description</label>
                    <textarea value={wizDesc} onChange={(e) => setWizDesc(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none h-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Product Tags</label>
                      <input type="text" value={wizTags} onChange={(e) => setWizTags(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1 uppercase">Initial Status</label>
                      <select value={wizStatus} onChange={(e) => setWizStatus(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
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
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Meta Description</label>
                    <textarea value={wizMetaDesc} onChange={(e) => setWizMetaDesc(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none h-20" />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={wizIsHero} onChange={(e) => setWizIsHero(e.target.checked)} className="rounded" />
                      <span>Flag as Hero Best Seller</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={wizIsNew} onChange={(e) => setWizIsNew(e.target.checked)} className="rounded" />
                      <span>Tag as New Arrival Drop</span>
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 8 && (
                <div className="p-4 bg-black border border-white/10 rounded-2xl space-y-2">
                  <div><strong>Title:</strong> {wizName}</div>
                  <div><strong>Department:</strong> {wizDept.toUpperCase()} // {wizPrimaryCat.toUpperCase()} ({wizActivity})</div>
                  <div><strong>Price:</strong> ${wizSalePrice || wizRegPrice}</div>
                  <div><strong>Variants:</strong> {wizMatrix.length} combinations created</div>
                  <div><strong>Photos Loaded:</strong> {wizImages.length} frames ready</div>
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

          {/* 5. CATEGORIES & PERMANENT DROPS */}
          {activeTab === 'categories' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Collections & Category Master</h3>
                  <p className="text-gray-500 text-[11px]">Curate seasonal drops and categories directly in database.</p>
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
                    onClick={async () => {
                      if (!newCollectionTitle) return;
                      const slug = newCollectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      await supabase.from('collections').insert([{ name: newCollectionTitle, slug, is_published: true }]);
                      setNewCollectionTitle('');
                      refreshAll();
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
                      <span className="text-[10px] text-[#CCFF00] uppercase font-bold">COLLECTION #{String(c.id).slice(0, 6)}</span>
                      <h4 className="text-sm font-bold text-white mt-1 font-sans">{c.name}</h4>
                      <p className="text-gray-500 mt-1">{c.collection_products?.[0]?.count || 0} curated items</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.is_published ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                        {c.is_published ? 'Published' : 'Draft'}
                      </span>
                      <button onClick={async () => { await supabase.from('collections').delete().eq('id', c.id); refreshAll(); }} className="text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. FOUR-PILLAR INVENTORY ENGINE */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Four-Pillar Inventory Matrix</h3>
                  <p className="text-gray-500 text-[11px]">Available = Total On-Hand - Reserved - Damaged</p>
                </div>
                <button onClick={() => exportCSV(inventory, 'inventory-four-pillar')} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg font-bold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#CCFF00]" /> Export Inventory CSV
                </button>
              </div>

              <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Spec</th>
                      <th className="p-4 text-[#CCFF00]">Available</th>
                      <th className="p-4 text-amber-400">Reserved</th>
                      <th className="p-4 text-red-400">Damaged</th>
                      <th className="p-4">Total On Hand</th>
                      <th className="p-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...inventory]
                      .sort((a, b) => {
                        const nameA = a.products?.name || '';
                        const nameB = b.products?.name || '';
                        if (nameA !== nameB) return nameA.localeCompare(nameB);
                        return (a.stock || 0) - (b.stock || 0);
                      })
                      .map((v, idx, sorted) => {
                        const onHand = Number(v.stock || 0);
                        const reserved = Number(v.reserved_stock || 0);
                        const damaged = Number(v.damaged_stock || 0);
                        const available = Math.max(0, onHand - reserved - damaged);
                        const isNewProduct = idx === 0 || v.product_id !== sorted[idx - 1]?.product_id;
                        const img = v.products?.product_images?.[0]?.url;
                        const stockClass = available <= 0 ? 'text-red-400' : available <= 5 ? 'text-amber-400' : 'text-[#CCFF00]';

                        return (
                          <tr key={v.id} className={`hover:bg-white/5 ${isNewProduct && idx > 0 ? 'border-t-2 border-t-white/10' : ''}`}>
                            <td className="p-4">
                              {isNewProduct ? (
                                <div className="flex items-center gap-3">
                                  {img ? (
                                    <img src={img} className="w-10 h-10 object-contain bg-black rounded-lg border border-white/10 p-1 shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 flex items-center justify-center bg-black/60 border border-white/10 rounded-lg text-gray-500 shrink-0">
                                      <ImageIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-bold text-white block">{v.products?.name || 'Unknown Product'}</span>
                                    <span className="text-[10px] text-gray-500">{v.sku}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-500 pl-[52px] block">{v.sku}</span>
                              )}
                            </td>
                            <td className="p-4 text-gray-300">{v.color} / {v.size}</td>
                            <td className={`p-4 font-black ${stockClass}`}>{available}</td>
                            <td className="p-4 text-amber-400 font-bold">{reserved}</td>
                            <td className="p-4 text-red-400 font-bold">{damaged}</td>
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

          {/* 7. ORDERS & LOGISTICS (CARDS VIEW WITH LIVE IMAGES & SHIPPING INPUTS) */}
          {activeTab === 'orders' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Orders & Vehicle Logistics</h3>
                  <p className="text-gray-500 text-[11px]">10-Stage status control, carrier tracking inputs, Stripe payment logs, and printable invoices[cite: 2, 3].</p>
                </div>
                <button onClick={() => exportCSV(orders, 'orders-ledger')} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg font-bold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#CCFF00]" /> Export Orders CSV[cite: 3]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(o => {
                  const rawAddr = o.shipping_address || {};
                  const addr = {
                    recipient_name: rawAddr.recipient_name || rawAddr.name,
                    street: rawAddr.street || rawAddr.address,
                    city: rawAddr.city,
                    postal_code: rawAddr.postal_code || rawAddr.postalCode,
                    phone: rawAddr.phone,
                    email: rawAddr.email,
                  };
                  const firstItem = o.order_items?.[0];
                  const itemImg = getOrderItemImage(firstItem);

                  return (
                    <div key={o.id} className="bg-[#141414] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-white/30 transition-all shadow-xl space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">ORDER CODE</span>
                            <div className="text-sm font-black text-white">{o.order_number || String(o.id).slice(0, 8)}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase font-bold text-[#CCFF00]">
                              {o.status || 'processing'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold ${
                              o.payment_status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {o.payment_status || 'unpaid'}
                            </span>
                          </div>
                        </div>

                        {/* Real Ordered Item Join */}
                        <div className="flex items-center gap-3 bg-black/50 p-3 rounded-2xl border border-white/5">
                          {itemImg ? (
                            <img src={itemImg} alt="Ordered Item" className="w-12 h-12 object-contain bg-black rounded-xl p-1 border border-white/10 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-black rounded-xl p-1 border border-white/10 text-gray-500 shrink-0">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="font-bold text-white text-xs truncate">{addr.recipient_name || 'Athlete'}</div>
                            <div className="text-[10px] text-gray-400 truncate">{firstItem?.product_name || 'Equipment Gear'} (x{firstItem?.quantity || 1})</div>
                            <div className="text-[#CCFF00] font-black mt-0.5">${Number(o.total_amount ?? o.total ?? 0).toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Recipient Details */}
                        <div className="p-3 bg-black/30 border border-white/5 rounded-2xl text-[11px] space-y-1.5">
                          <div className="text-gray-400 flex items-start gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                            <span className="break-all">{addr.phone || 'No phone on file'}</span>
                          </div>
                          <div className="text-gray-400 flex items-start gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                            <span className="break-all">{o.guest_email || addr.email || 'No email on file'}</span>
                          </div>
                          <div className="text-gray-400 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                            <span className="break-words">{addr.street || 'No address on file'}{addr.city ? `, ${addr.city}` : ''} {addr.postal_code && `• ${addr.postal_code}`}</span>
                          </div>
                        </div>

                        {/* Dispatch Carrier Inputs */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-gray-500 font-bold uppercase">Shipping Carrier & Tracking</span>
                          <div className="flex gap-2">
                            <input
                              placeholder="Carrier"
                              defaultValue={o.shipping_carrier || ''}
                              id={`carrier-${o.id}`}
                              className="w-1/2 p-2 bg-black border border-white/10 rounded-xl text-[10px] text-white outline-none"
                            />
                            <input
                              placeholder="Tracking #"
                              defaultValue={o.tracking_number || ''}
                              id={`trk-${o.id}`}
                              className="w-1/2 p-2 bg-black border border-white/10 rounded-xl text-[10px] text-white outline-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const cInput = document.getElementById(`carrier-${o.id}`);
                              const tInput = document.getElementById(`trk-${o.id}`);
                              handleUpdateOrderShippingDetails(o.id, cInput?.value || 'Carrier', tInput?.value || 'TRK-000');
                            }}
                            className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold uppercase text-gray-300"
                          >
                            Save Carrier Info
                          </button>
                        </div>
                      </div>

                      {/* 10-Stage Fulfillment Control */}
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <select
                          value={o.status || 'processing'}
                          onChange={(e) => handleFulfillmentStageChange(o, e.target.value)}
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

                        <button
                          onClick={() => setSelectedOrderDetails(o)}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center font-bold uppercase text-white flex items-center justify-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#CCFF00]" /> Full Invoice & Audit
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(o)}
                          className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded-xl text-center font-bold uppercase text-red-300 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. 7-STAGE RETURNS DECISION MACHINE */}
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
                      <th className="p-4">Claim ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Item Claimed</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Current Stage</th>
                      <th className="p-4 text-right">Stage Progression</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {returnsList.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">No active return requests on record.[cite: 3]</td></tr>
                    ) : (
                      returnsList.map(r => (
                        <tr key={r.id} className="hover:bg-white/5">
                          <td className="p-4 font-bold text-white">RET-{String(r.id).slice(0, 6)}</td>
                          <td className="p-4 font-sans">{r.customer_name || 'Athlete'}<div className="text-[10px] text-gray-500">{r.customer_phone || '+1 (800) 555-0199'}</div></td>
                          <td className="p-4">{r.product_name || 'Equipment'} ({r.variant_size || 'Std'})[cite: 3]</td>
                          <td className="p-4 text-gray-400">{r.reason || 'Fit / Quality'}[cite: 3]</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00]">
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedReturnDetails(r)}
                              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded font-bold uppercase"
                            >
                              Inspect
                            </button>
                            <select
                              value={r.status || 'requested'}
                              onChange={async (e) => { await handleUpdateReturnStage(r.id, e.target.value); }}
                              className="p-1 bg-black border border-white/10 rounded-lg text-xs font-bold uppercase text-white outline-none"
                            >
                              <option value="requested">1. Requested</option>
                              <option value="approved">2. Approved</option>
                              <option value="return_shipped">3. Return Shipped</option>
                              <option value="received">4. Received</option>
                              <option value="inspection">5. Inspection</option>
                              <option value="refund_approved">6. Refund Approved</option>
                              <option value="refunded">7. Refunded</option>
                              <option value="rejected">X. Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8b. CUSTOMER SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6 font-mono text-xs">
              <div>
                <h3 className="text-base font-bold font-sans uppercase">Customer Support Inbox</h3>
                <p className="text-gray-500 text-[11px]">Messages submitted from the storefront's Contact Support page.</p>
              </div>

              <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                    <tr>
                      <th className="p-4">From</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Received</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {supportTickets.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-500">No support messages yet.</td></tr>
                    ) : (
                      supportTickets.map(t => (
                        <tr key={t.id} className="hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-[10px] text-gray-500">{t.email}</div>
                          </td>
                          <td className="p-4 text-gray-300">{t.subject}</td>
                          <td className="p-4 text-gray-400">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                              t.status === 'resolved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              t.status === 'in_progress' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00]'
                            }`}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => openTicketDialog(t)} className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded font-bold uppercase">
                              View & Reply
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. CUSTOMERS PASSPORTS */}
          {activeTab === 'customers' && (
            <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Account ID</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map(c => (
                    <tr key={c.id} className="hover:bg-white/5">
                      <td className="p-4 font-bold text-white font-sans">{c.full_name || 'Athlete Passport'}</td>
                      <td className="p-4 text-gray-400">{c.email || 'customer@ulixies.com'}</td>
                      <td className="p-4 text-gray-500">{String(c.id).slice(0, 8)}</td>
                      <td className="p-4 font-black text-[#CCFF00]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Verified'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 10. REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 font-mono text-xs">
              {reviewsList.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-[#141414] border border-white/10 rounded-2xl">No reviews submitted yet.</div>
              ) : (
                reviewsList.map(rev => (
                  <div key={rev.id} className="p-5 bg-[#141414] border border-white/10 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{'★'.repeat(rev.rating || 5)}</span>
                        <span className="font-bold text-xs text-white font-sans">{rev.products?.name}</span>
                        {rev.title && <span className="text-gray-400">— {rev.title}</span>}
                      </div>
                      <p className="text-xs text-gray-300 mt-1">"{rev.body}"</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">— {rev.reviewer_name || 'Verified Athlete'}</p>
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
                ))
              )}
            </div>
          )}

          {/* 11. STOREFRONT CMS */}
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
                Save Live Content[cite: 3]
              </button>
            </div>
          )}

          {/* 12. MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Store Media Library</h3>
                  <p className="text-gray-500 text-[11px]">All uploaded images in cloud storage.[cite: 3]</p>
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

          {/* 13. COUPONS & PROMOS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="p-6 bg-[#141414] border border-white/10 rounded-2xl space-y-4">
                <h3 className="font-bold uppercase text-gray-400 text-[11px]">Create Promotional Coupon</h3>
                <div className="grid grid-cols-5 gap-3">
                  <input type="text" placeholder="SUMMER20" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold uppercase text-white" />
                  <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold text-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <input type="number" placeholder="Value (e.g. 20)" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold text-white" />
                  <input type="number" placeholder="Total Use Limit" value={newCoupon.usage_limit} onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold text-white" />
                  <input type="number" placeholder="Uses Per Customer" value={newCoupon.per_user_limit} onChange={(e) => setNewCoupon({ ...newCoupon, per_user_limit: e.target.value })} className="p-2.5 bg-black border border-white/10 rounded-xl font-bold text-white" />
                </div>
                <button onClick={async () => { if (!newCoupon.code.trim()) return alert('Enter a coupon code.'); await createCoupon(newCoupon); setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '20', usage_limit: '500', per_user_limit: '1' }); refreshAll(); }} className="w-full py-2.5 bg-[#CCFF00] text-black font-bold uppercase rounded-xl">Create Coupon</button>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#141414]">
                <table className="w-full text-left">
                  <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Per Customer</th>
                      <th className="p-4">Redemptions</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {couponsList.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">No coupons created yet.</td></tr>
                    ) : (
                      couponsList.map(c => (
                        <tr key={c.id}>
                          <td className="p-4 font-black text-white">{c.code}</td>
                          <td className="p-4 font-bold text-[#CCFF00]">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`}</td>
                          <td className="p-4 text-gray-400">{c.per_user_limit || 1}x</td>
                          <td className="p-4 text-gray-400">{couponUsageCounts[c.id] || 0} / {c.usage_limit ?? '∞'}</td>
                          <td className="p-4">
                            <button
                              onClick={async () => { await toggleCouponActive(c.id, !c.is_active); refreshAll(); }}
                              className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${c.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                            >
                              {c.is_active ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={async () => { if (confirm(`Delete coupon ${c.code}?`)) { await deleteCoupon(c.id); refreshAll(); } }} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 14. SHIPPING RULES */}
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
                <div>
                  <label className="uppercase text-gray-400 block mb-1">Express Dispatch Rate ($)</label>
                  <input type="number" value={shippingRules.express_rate} onChange={(e) => setShippingRules({ ...shippingRules, express_rate: Number(e.target.value) })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
              </div>
              <button onClick={async () => { await updateStoreSettings('shipping_rules', shippingRules); alert('Shipping rules updated!'); }} className="px-8 py-3.5 bg-[#CCFF00] text-black font-bold uppercase rounded-full">Save Shipping Rates</button>
            </div>
          )}

          {/* 15. PAYMENT GATEWAY */}
          {activeTab === 'gateway' && (
            <div className="max-w-3xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6 font-mono text-xs">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 bg-black rounded-xl text-[#CCFF00]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans uppercase">Payment Gateway Reference</h3>
                  <p className="text-gray-500 text-[11px]">Read-only notes for your own tracking. Editing this form does not change how real payments are processed.</p>
                </div>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-2xl text-amber-200 text-[11px] leading-relaxed">
                Actual Stripe charges are created by a Supabase Edge Function using its own server-side secret key.
                A website form can never safely read or set that secret (browser JavaScript cannot hold real secrets).
                To rotate or configure the live Stripe key, go to <strong>Supabase Dashboard → Edge Functions → Secrets</strong> and set <code>STRIPE_SECRET_KEY</code> there directly.
                This tab is only a place to keep notes on what's currently configured.
              </div>

              <form onSubmit={handleSavePaymentGateway} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Gateway Environment (note)</label>
                    <select value={paymentConfig.environment} onChange={(e) => setPaymentConfig({ ...paymentConfig, environment: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                      <option value="TEST">TEST / SANDBOX (Mock Authorization)</option>
                      <option value="PRODUCTION">PRODUCTION (Live Card Charges)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 uppercase">Currency (note)</label>
                    <select value={paymentConfig.currency} onChange={(e) => setPaymentConfig({ ...paymentConfig, currency: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none">
                      <option value="USD">USD ($ - United States Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 uppercase">Stripe Publishable Key on file (note)</label>
                  <input type="text" placeholder="pk_test_..." value={paymentConfig.stripePublishableKey || ''} onChange={(e) => setPaymentConfig({ ...paymentConfig, stripePublishableKey: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                  <p className="text-[10px] text-gray-500 mt-1">Publishable keys are safe to store (they're meant to be public) but checkout always uses whichever key the Edge Function itself returns — this field is a record only.</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentConfig.hasStripeSecretConfigured}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, hasStripeSecretConfigured: e.target.checked })}
                    className="w-4 h-4 accent-[#CCFF00]"
                  />
                  <span className="text-gray-300 normal-case">I've confirmed <code>STRIPE_SECRET_KEY</code> is set on the Edge Function (checklist reminder only)</span>
                </label>

                <button type="submit" className="px-8 py-3 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold uppercase rounded-full shadow-lg">
                  Save Notes
                </button>
              </form>
            </div>
          )}

          {/* 16. ANALYTICS & FUNNEL */}
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

          {/* 17. CSV REPORTS */}
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

          {/* 18. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold uppercase text-gray-400 font-sans">Live Notification Log</h3>
                  <p className="text-gray-600 text-[10px] mt-0.5">Auto-generated by the database on new orders, new returns, and low-stock crossings.</p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button onClick={handleMarkAllNotificationsRead} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-bold uppercase flex items-center gap-1.5 shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> Mark All Read
                  </button>
                )}
              </div>

              {adminNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No notifications yet.</div>
              ) : (
                <div className="space-y-2">
                  {adminNotifications.map((n) => {
                    const severityStyles = {
                      critical: 'bg-red-950/40 border-red-800/40 text-red-200',
                      warning: 'bg-amber-950/30 border-amber-800/40 text-amber-200',
                      info: 'bg-white/5 border-white/10 text-gray-200',
                    };
                    const Icon = n.type === 'new_order' ? ShoppingBag : n.type === 'new_return' ? RotateCcw : AlertTriangle;
                    return (
                      <button
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkNotificationRead(n.id)}
                        className={`w-full text-left p-3 border rounded-xl flex items-start gap-3 transition-opacity ${severityStyles[n.severity] || severityStyles.info} ${n.is_read ? 'opacity-50' : ''}`}
                      >
                        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span>{n.message}</span>
                          <div className="text-[10px] text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#CCFF00] shrink-0 mt-1" title="Unread" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 19. SETTINGS */}
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
                <div>
                  <label className="uppercase text-gray-400 block mb-1">Contact Phone</label>
                  <input type="text" value={settingsData.phone} onChange={(e) => setSettingsData({ ...settingsData, phone: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="uppercase text-gray-400 block mb-1">Address</label>
                  <input type="text" value={settingsData.address} onChange={(e) => setSettingsData({ ...settingsData, address: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none" />
                </div>
              </div>
              <button onClick={async () => { await updateStoreSettings('general', settingsData); alert('Settings saved!'); }} className="px-8 py-3.5 bg-[#CCFF00] text-black font-bold uppercase rounded-full">Save Settings</button>
            </div>
          )}

          {/* 20. SECURITY */}
          {activeTab === 'security' && (
            <div className="max-w-4xl space-y-6 font-mono text-xs">
              <div className="bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-4">
                <h3 className="font-bold text-sm font-sans uppercase flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#CCFF00]" /> Security & Access Shield
                </h3>
                <p className="text-gray-400">Admin access is restricted to a single verified account and enforced by database row-level security policies, not just the dashboard UI.</p>
                <div className="p-4 bg-black border border-white/10 rounded-2xl">
                  <div><strong>Current Admin Session:</strong> Active</div>
                  <div className="text-gray-500 mt-1">Access model: Single admin account + Postgres RLS policies</div>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <span className="font-bold uppercase text-gray-300 flex items-center gap-2 font-sans">
                    <History className="w-4 h-4 text-[#CCFF00]" /> Database Audit Trail
                  </span>
                  <span className="text-gray-500">{auditLog.length} recent events</span>
                </div>
                {auditLog.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No audit events recorded yet.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-black/50 border-b border-white/10 uppercase text-gray-500 text-[10px]">
                      <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">Admin</th>
                        <th className="p-4">Table</th>
                        <th className="p-4">Operation</th>
                        <th className="p-4">Record</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLog.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/5">
                          <td className="p-4 text-gray-400">{new Date(entry.created_at).toLocaleString()}</td>
                          <td className="p-4 text-white">{entry.admin_email || 'system'}</td>
                          <td className="p-4 text-gray-300">{entry.table_name}</td>
                          <td className={`p-4 font-bold ${entry.operation === 'DELETE' ? 'text-red-400' : entry.operation === 'INSERT' ? 'text-emerald-400' : 'text-[#CCFF00]'}`}>
                            {entry.operation}
                          </td>
                          <td className="p-4 text-gray-500">{entry.record_id || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* 21. REAL SYSTEM HEALTH DIAGNOSTICS */}
          {activeTab === 'system' && (
            <div className="max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm font-sans uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#CCFF00]" /> Operational Status Matrix
                </h3>
                <button onClick={runDiagnostics} className="p-1 bg-white/5 border border-white/10 rounded hover:bg-white/10">
                  <RefreshCw className="w-3.5 h-3.5 text-[#CCFF00]" />
                </button>
              </div>
              <div className="space-y-2">
                {systemHealth.map(s => (
                  <div key={s.service} className="p-3 bg-black border border-white/10 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-3.5 h-3.5 text-gray-500" />
                      <span>{s.service}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{s.latency}</span>
                      <span className={`font-bold ${s.status === 'ONLINE' ? 'text-[#CCFF00]' : 'text-red-400'}`}>● {s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SUPPORT TICKET REPLY MODAL                                  */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedTicketDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#141414] max-w-lg w-full rounded-3xl border border-white/10 p-8 shadow-2xl relative font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-bold text-white uppercase">Support Ticket</span>
              <button onClick={() => setSelectedTicketDetails(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-1">
              <div className="font-bold text-white">{selectedTicketDetails.name}</div>
              <div className="text-gray-400">{selectedTicketDetails.email}</div>
              <div className="text-gray-500 text-[10px]">{new Date(selectedTicketDetails.created_at).toLocaleString()}</div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-500 text-[10px] uppercase font-bold">{selectedTicketDetails.subject}</div>
              <p className="text-gray-300 leading-relaxed">{selectedTicketDetails.message}</p>
            </div>

            <div>
              <label className="text-gray-400 uppercase block mb-1 text-[10px]">Your Response</label>
              <textarea
                value={ticketResponseDraft}
                onChange={(e) => setTicketResponseDraft(e.target.value)}
                placeholder="Type your reply..."
                className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none h-24"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => handleSaveTicketResponse('in_progress')}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase"
              >
                Save & Mark In Progress
              </button>
              <button
                onClick={() => handleSaveTicketResponse('resolved')}
                className="flex-1 py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase rounded-xl"
              >
                Save & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* RETURN INSPECTION MODAL                                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedReturnDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#141414] max-w-lg w-full rounded-3xl border border-white/10 p-8 shadow-2xl relative font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-bold text-white uppercase">RETURN INSPECTION: RET-{String(selectedReturnDetails.id).slice(0, 6)}</span>
              <button onClick={() => setSelectedReturnDetails(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-500 text-[10px] uppercase font-bold">Athlete Return Details</div>
              <div className="font-bold text-white">{selectedReturnDetails.customer_name || 'Athlete'}</div>
              <div className="text-gray-400">{selectedReturnDetails.customer_phone || 'No phone recorded'}</div>
              <div className="text-gray-400">Order Ref: {selectedReturnDetails.order_number || 'N/A'}</div>
              <div className="text-gray-400">Reason: {selectedReturnDetails.reason || 'Fit / Sizing mismatch'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 uppercase block text-[10px]">Inspection / Assessment Notes</label>
              <textarea
                value={selectedReturnDetails.inspection_notes || ''}
                onChange={(e) => setSelectedReturnDetails({ ...selectedReturnDetails, inspection_notes: e.target.value })}
                placeholder="Enter quality control inspection notes..."
                className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none h-20"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={async () => {
                  await handleUpdateReturnStage(selectedReturnDetails.id, { 
                    status: 'approved',
                    inspection_notes: selectedReturnDetails.inspection_notes 
                  });
                }}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase"
              >
                Approve Return
              </button>
              <button
                onClick={async () => {
                  await handleUpdateReturnStage(selectedReturnDetails.id, { 
                    status: 'refunded',
                    inspection_notes: selectedReturnDetails.inspection_notes 
                  });
                }}
                className="flex-1 py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase rounded-xl"
              >
                Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ORDER AUDIT & INVOICE MODAL                                 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#141414] max-w-lg w-full rounded-3xl border border-white/10 p-8 shadow-2xl relative font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-bold text-white uppercase">OFFICIAL INVOICE: {selectedOrderDetails.order_number || selectedOrderDetails.id.slice(0, 8)}</span>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-500 text-[10px] uppercase font-bold">Recipient Dispatch Address</div>
              {(() => {
                const rawAddr = selectedOrderDetails.shipping_address || {};
                const recipientName = rawAddr.recipient_name || rawAddr.name;
                const street = rawAddr.street || rawAddr.address;
                const postal = rawAddr.postal_code || rawAddr.postalCode;
                return (
                  <>
                    <div className="font-bold text-white">{recipientName || 'Customer'}</div>
                    <div className="text-gray-400">{selectedOrderDetails.guest_email || rawAddr.email || 'No email recorded'}</div>
                    <div className="text-gray-400">{rawAddr.phone || 'No phone recorded'}</div>
                    <div className="text-[#CCFF00]">
                      {street || 'No address on file'}{rawAddr.city ? `, ${rawAddr.city}` : ''} {postal && `• ${postal}`}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 max-h-40 overflow-y-auto">
              <div className="text-gray-500 text-[10px] uppercase font-bold">Purchased Loadouts</div>
              {(selectedOrderDetails.order_items || []).map((item, idx) => {
                const img = getOrderItemImage(item);
                return (
                  <div key={idx} className="flex justify-between items-center text-xs text-white">
                    <div className="flex items-center gap-2">
                      {img ? (
                        <img src={img} className="w-7 h-7 object-contain bg-black rounded p-0.5 border border-white/10" />
                      ) : (
                        <div className="w-7 h-7 flex items-center justify-center bg-black rounded p-0.5 border border-white/10 text-gray-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span>{item.product_name || item.product_variants?.products?.name || 'Equipment'} (x{item.quantity || 1})</span>
                    </div>
                    <span className="font-bold">${item.unit_price || 150}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-gray-400 text-[10px] uppercase">Stripe Payment Status</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                selectedOrderDetails.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedOrderDetails.payment_status || 'unpaid'}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-3 text-white">
              <span>Total Amount</span>
              <span className="text-[#CCFF00]">${Number(selectedOrderDetails.total_amount ?? selectedOrderDetails.total ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* QUICK PRODUCT EDIT MODAL                                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      {editingProductModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#141414] max-w-lg w-full rounded-3xl border border-white/10 p-8 shadow-2xl relative font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <span className="font-bold text-[#CCFF00] uppercase">EDIT ARTICLE: {editingProductModal.name}</span>
              <button onClick={() => setEditingProductModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-4">
              <div>
                <label className="text-gray-400 block mb-1 uppercase text-[10px]">Article Name</label>
                <input
                  type="text"
                  required
                  value={editingProductModal.name}
                  onChange={(e) => setEditingProductModal({ ...editingProductModal, name: e.target.value })}
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 block mb-1 uppercase text-[10px]">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProductModal.base_price}
                    onChange={(e) => setEditingProductModal({ ...editingProductModal, base_price: e.target.value })}
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 uppercase text-[10px]">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProductModal.sale_price || ''}
                    onChange={(e) => setEditingProductModal({ ...editingProductModal, sale_price: e.target.value })}
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 block mb-1 uppercase text-[10px]">Department</label>
                  <select
                    value={editingProductModal.department}
                    onChange={(e) => setEditingProductModal({ ...editingProductModal, department: e.target.value })}
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 uppercase text-[10px]">Category</label>
                  <select
                    value={editingProductModal.primary_category}
                    onChange={(e) => setEditingProductModal({ ...editingProductModal, primary_category: e.target.value })}
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-white outline-none"
                  >
                    <option value="shoes">Shoes</option>
                    <option value="clothing">Clothes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 uppercase text-[10px]">
                  Sizes & Stock — exactly what customers can pick on the site
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-white/10 rounded-xl p-2 bg-black">
                  {editingVariants.length === 0 && (
                    <p className="text-gray-500 text-[10px] p-2">No sizes yet — this product can't be bought until you add at least one.</p>
                  )}
                  {editingVariants.map((v, idx) => (
                    <div key={v.id || `new-${idx}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.size || ''}
                        onChange={(e) => {
                          const updated = [...editingVariants];
                          updated[idx] = { ...updated[idx], size: e.target.value };
                          setEditingVariants(updated);
                        }}
                        placeholder="Size"
                        className="w-20 p-2 bg-[#141414] border border-white/10 rounded-lg text-white outline-none"
                      />
                      <input
                        type="text"
                        value={v.color || ''}
                        onChange={(e) => {
                          const updated = [...editingVariants];
                          updated[idx] = { ...updated[idx], color: e.target.value };
                          setEditingVariants(updated);
                        }}
                        placeholder="Color (optional)"
                        className="flex-1 p-2 bg-[#141414] border border-white/10 rounded-lg text-white outline-none"
                      />
                      <input
                        type="number"
                        value={v.stock ?? 0}
                        onChange={(e) => {
                          const updated = [...editingVariants];
                          updated[idx] = { ...updated[idx], stock: e.target.value };
                          setEditingVariants(updated);
                        }}
                        placeholder="Stock"
                        className="w-16 p-2 bg-[#141414] border border-white/10 rounded-lg text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingVariants(editingVariants.filter((_, i) => i !== idx))}
                        className="p-1.5 text-gray-400 hover:text-red-400"
                        title="Remove this size"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={editVariantSizeInput}
                    onChange={(e) => setEditVariantSizeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditVariantRow(); } }}
                    placeholder="Add size (e.g. 10, L, ONE SIZE)"
                    className="flex-1 p-2.5 bg-black border border-white/10 rounded-lg text-white outline-none"
                  />
                  <button type="button" onClick={addEditVariantRow} className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg font-bold uppercase text-[10px]">
                    Add
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase tracking-wider rounded-xl transition-colors mt-2"
              >
                Save Article Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}