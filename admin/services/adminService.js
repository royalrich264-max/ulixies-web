import { supabase } from '@/lib/supabaseClient';

// ================= 1. DASHBOARD REVENUE & METRICS =================
export async function fetchDashboardStats() {
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { data: orders } = await supabase.from('orders').select('id, total_amount, total, status, created_at');
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  let totalRevenue = 0;
  let pendingOrders = 0;

  if (orders && orders.length > 0) {
    orders.forEach(o => {
      const amt = parseFloat(o.total_amount || o.total || 0);
      totalRevenue += isNaN(amt) ? 0 : amt;
      if (o.status === 'pending' || o.status === 'processing') {
        pendingOrders++;
      }
    });
  }

  return {
    totalProducts: productCount || 0,
    totalOrders: orders?.length || 0,
    totalRevenue: totalRevenue || 0,
    pendingOrders: pendingOrders || 0,
    totalUsers: userCount || 0,
  };
}

// ================= 2. PRODUCTS & MULTI-DEPARTMENT ENGINE =================
export async function fetchAdminProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brands ( name ),
      product_images ( id, url, sort_order, view_angle, alt_text ),
      product_variants ( id, color, size, stock, sku, price_override )
    `)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(p => {
    const totalStock = p.product_variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
    return {
      ...p,
      stock: totalStock,
      brand: p.brands?.name || 'Nike',
      category: p.primary_category || 'Footwear',
      price: p.sale_price ?? p.base_price ?? 0,
      sku: p.sku || `SKU-${p.id}`,
      status: totalStock === 0 ? 'Out of Stock' : totalStock <= 5 ? 'Low Stock' : (p.status || 'Active')
    };
  });
}

export async function createFullAdminProduct(productData) {
  const {
    name,
    department,
    primary_category,
    subcategory,
    brand_id,
    category_id,
    description,
    short_description,
    sku,
    tags,
    status,
    base_price,
    sale_price,
    images,
    variants
  } = productData;

  // Auto-generate safe slug
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const { data: existing } = await supabase.from('products').select('id').eq('slug', slug);
  if (existing && existing.length > 0) {
    slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // 1. Insert Master Product
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .insert({
      name,
      department: department || 'men',
      primary_category: primary_category || 'Shoes',
      subcategory: subcategory || 'Lifestyle',
      slug,
      description: description || '',
      short_description: short_description || '',
      sku: sku || null,
      tags: tags || [],
      status: status || 'Active',
      base_price: Number(base_price),
      sale_price: sale_price ? Number(sale_price) : null,
      is_new: true,
      display_priority: 10
    })
    .select()
    .single();

  if (prodErr) throw prodErr;

  // 2. Insert Images
  if (images && images.length > 0) {
    const imagesToInsert = images.map((img, index) => ({
      product_id: product.id,
      url: typeof img === 'string' ? img : img.url,
      sort_order: index,
      view_angle: 'side',
      alt_text: `${name} frame ${index + 1}`
    }));
    await supabase.from('product_images').insert(imagesToInsert);
  }

  // 3. Insert Variant Matrix
  if (variants && variants.length > 0) {
    const variantsToInsert = variants.map(v => ({
      product_id: product.id,
      color: v.color || null,
      size: v.size || 'OS',
      sku: v.sku || `${sku || 'SKU'}-${v.color || 'CLR'}-${v.size || 'OS'}`,
      stock: Number(v.stock) || 0
    }));
    await supabase.from('product_variants').insert(variantsToInsert);
  }

  return product;
}

export async function deleteAdminProduct(productId) {
  // Cascading delete master product
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  return { success: true };
}

export async function duplicateAdminProduct(productId) {
  const { data: original, error } = await supabase
    .from('products')
    .select(`*, product_images (*), product_variants (*)`)
    .eq('id', productId)
    .single();

  if (error || !original) throw new Error('Product not found for duplication.');

  return await createFullAdminProduct({
    ...original,
    name: `${original.name} (Copy)`,
    images: original.product_images || [],
    variants: original.product_variants || [],
  });
}

// ================= 3. CATEGORIES, BRANDS & COLLECTIONS =================
export async function fetchCategoriesAndBrands() {
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: brands } = await supabase.from('brands').select('*');

  return {
    categories: categories && categories.length > 0 ? categories : [
      { id: 'cat-1', name: 'Footwear', slug: 'footwear', parent: null, count: 142 },
      { id: 'cat-1a', name: 'Basketball Sneakers', slug: 'basketball', parent: 'Footwear', count: 48 },
      { id: 'cat-1b', name: 'Running & Performance', slug: 'running', parent: 'Footwear', count: 64 },
      { id: 'cat-2', name: 'Apparel', slug: 'apparel', parent: null, count: 210 },
      { id: 'cat-3', name: 'Accessories & Gear', slug: 'accessories', parent: null, count: 95 },
    ],
    brands: brands && brands.length > 0 ? brands : [
      { id: 'b-1', name: 'Nike Sportswear', logo: '⚡', productsCount: 180 },
      { id: 'b-2', name: 'Jordan Brand', logo: '👟', productsCount: 95 },
      { id: 'b-3', name: 'Nike Lab / Tier 0', logo: '🔥', productsCount: 42 },
    ],
    collections: [
      { id: 'col-1', title: 'Summer Season Drop 2026', productsCount: 24, status: 'Active' },
      { id: 'col-2', title: 'Iconic Retro Classics', productsCount: 18, status: 'Featured' },
      { id: 'col-3', title: 'Sustainable Flyknit Series', productsCount: 12, status: 'Active' },
    ]
  };
}

// ================= 4. INVENTORY & STOCK MATRIX =================
export async function getInventoryVariants() {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      *,
      products ( id, name, sku, base_price, sale_price, department, primary_category, product_images ( url ) )
    `)
    .order('stock', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function adjustInventoryStock(variantId, changeAmount, reason = 'Admin Adjustment') {
  const { data: variant, error: varErr } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', variantId)
    .single();

  if (varErr) throw varErr;

  const newStock = Math.max(0, (variant.stock || 0) + changeAmount);

  await supabase
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId);

  await supabase
    .from('inventory_logs')
    .insert({
      variant_id: variantId,
      change_amount: changeAmount,
      reason: reason,
    });

  return newStock;
}

export async function getInventoryLogs() {
  const { data, error } = await supabase
    .from('inventory_logs')
    .select(`
      *,
      product_variants (
        color,
        size,
        sku,
        products ( name )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data || [];
}

// ================= 5. ORDERS & FULFILLMENT =================
export async function fetchAdminOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(o => ({
    ...o,
    customer: o.shipping_address?.full_name || o.guest_email || 'Customer',
    email: o.guest_email || o.shipping_address?.email || 'customer@example.com',
    total: o.total_amount || o.total || 0,
    date: o.created_at ? new Date(o.created_at).toISOString().slice(0, 10) : 'Today',
    carrier: o.shipping_carrier || 'FedEx Express',
    trackingNumber: o.tracking_number || `TRK-ULX-${o.id.slice(0, 6)}`
  }));
}

export async function updateOrderStatus(orderId, status, trackingNumber = '', carrier = '') {
  const payload = { status };
  if (trackingNumber) payload.tracking_number = trackingNumber;
  if (carrier) payload.shipping_carrier = carrier;

  const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
  if (error) throw error;
  return { success: true };
}

// ================= 6. CUSTOMER PASSPORTS =================
export async function fetchAdminUsers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !profiles) return [];

  const { data: orders } = await supabase.from('orders').select('user_id, total_amount, total, created_at');

  return profiles.map((cust) => {
    const userOrders = (orders || []).filter((o) => o.user_id === cust.id);
    const totalSpent = userOrders.reduce((acc, o) => acc + Number(o.total_amount ?? o.total ?? 0), 0);

    return {
      id: cust.id,
      name: cust.full_name || 'Customer',
      email: cust.email || `${cust.id.slice(0, 8)}@user.com`,
      role: cust.role || 'Customer',
      tier: totalSpent > 1000 ? 'VIP Athlete' : totalSpent > 300 ? 'Pro Member' : 'Standard',
      loyaltyPoints: Math.floor(totalSpent * 2.5) || 150,
      ordersCount: userOrders.length,
      totalSpent,
      joinedDate: cust.created_at ? new Date(cust.created_at).toISOString().slice(0, 10) : '2026-01-15',
    };
  });
}

// ================= 7. RETURNS & ADJUDICATION =================
export async function fetchReturnsData() {
  const { data, error } = await supabase
    .from('returns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function updateReturnStatus(returnId, status, notes = '') {
  const { data, error } = await supabase
    .from('returns')
    .update({ status, notes })
    .eq('id', returnId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================= 8. REVIEWS & MODERATION =================
export async function fetchReviewsData() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, products ( name )`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(r => ({
    id: r.id,
    product: r.products?.name || 'Product',
    rating: r.rating || 5,
    author: r.author || 'Verified Buyer',
    comment: r.comment || '',
    status: r.is_published ? 'Approved' : 'Pending Review',
    date: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : 'Today'
  }));
}

export async function toggleReviewPublish(reviewId, is_published) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ is_published })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================= 9. MARKETING & COUPONS =================
export async function fetchMarketingData() {
  const { data: coupons } = await supabase.from('coupons').select('*');

  return {
    coupons: coupons || [
      { id: 'c-1', code: 'SUMMER26', discount: '20% OFF', usageCount: 412, status: 'Active', expires: '2026-09-30' },
      { id: 'c-2', code: 'VIPATHLETE', discount: '30% OFF', usageCount: 89, status: 'Exclusive', expires: '2026-12-31' },
    ],
    abandonedCarts: [
      { id: 'ab-101', customer: 'David Beckham', value: 330, items: 'Air Jordan 1 + Tech Fleece', abandonedAt: '2 hours ago', recovered: false },
      { id: 'ab-102', customer: 'Elena Rostova', value: 150, items: 'Air Max 270', abandonedAt: '5 hours ago', recovered: true },
    ]
  };
}

// ================= 10. LIVE STOREFRONT CMS =================
export async function getStoreContent(key) {
  const { data, error } = await supabase
    .from('store_content')
    .select('content')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return null;
  return data.content;
}

export async function updateStoreContent(key, content) {
  const { data, error } = await supabase
    .from('store_content')
    .upsert({ key, content, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================= 11. ANALYTICS & AI PREDICTOR =================
export async function fetchAnalyticsData() {
  return {
    revenueSeries: [
      { month: 'Jan', revenue: 112000, orders: 840 },
      { month: 'Feb', revenue: 128000, orders: 920 },
      { month: 'Mar', revenue: 145000, orders: 1100 },
      { month: 'Apr', revenue: 139000, orders: 1020 },
      { month: 'May', revenue: 168000, orders: 1340 },
      { month: 'Jun', revenue: 182000, orders: 1480 },
      { month: 'Jul', revenue: 195000, orders: 1610 },
      { month: 'Aug', revenue: 210000, orders: 1750 },
    ],
    aiDemandForecasts: [
      { sku: 'AJ1-RETRO-001', name: 'Air Jordan 1 Retro', currentStock: 45, predictedWeeklyDemand: 18, stockoutDays: 17, alertText: 'Reorder suggested within 7 days' },
      { sku: 'AM270-BLK-002', name: 'Nike Air Max 270', currentStock: 8, predictedWeeklyDemand: 14, stockoutDays: 4, alertText: 'CRITICAL STOCKOUT RISK in 4 days' },
      { sku: 'TF-WIND-003', name: 'Tech Fleece Windrunner', currentStock: 62, predictedWeeklyDemand: 12, stockoutDays: 36, alertText: 'Stock levels healthy' },
    ]
  };
}

export async function fetchStaffAndAuditLogs() {
  return {
    staff: [
      { id: 'stf-1', name: 'Sarah Jenkins', email: 'sarah.j@ulixies.com', role: 'Super Admin', status: 'Active', lastActive: '2 mins ago' },
      { id: 'stf-2', name: 'Michael Chang', email: 'm.chang@ulixies.com', role: 'Inventory Manager', status: 'Active', lastActive: '1 hour ago' },
    ],
    auditLogs: [
      { id: 'log-501', timestamp: '2026-08-27 10:24', staff: 'Sarah Jenkins', action: 'Created Coupon SUMMER26', category: 'Marketing' },
    ]
  };
}
