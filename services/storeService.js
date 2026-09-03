import { supabase } from '@/lib/supabaseClient';

// ================= AUTHENTICATION =================
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function signUpUser(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw error;
  return data;
}

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email) {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updateUserPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ================= STORAGE & MEDIA =================
export async function uploadProductImage(file) {
  const fileExt = file.name.split('.').pop();
  const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `products/${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteProductImageFile(publicUrl) {
  try {
    if (!publicUrl) return;
    const urlParts = publicUrl.split('/product-images/');
    if (urlParts.length < 2) return;
    const filePath = decodeURIComponent(urlParts[1]);

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) console.warn('Storage file deletion error:', error);
  } catch (err) {
    console.error('Failed to remove image from storage bucket:', err);
  }
}

// ================= STOREFRONT PRODUCT QUERIES =================
export async function getSplashShoes() {
  const { data, error } = await supabase
    .from('product_images')
    .select('url')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error || !data || data.length === 0) return [];
  return data.map((img) => img.url);
}

export async function getHomeProducts(department = null) {
  let query = supabase
    .from('products')
    .select(`
      *,
      brands ( name ),
      product_images ( id, url, sort_order, view_angle, alt_text ),
      product_variants ( id, color, size, stock, sku, price_override )
    `)
    .order('display_priority', { ascending: true })
    .order('created_at', { ascending: false });

  if (department && department !== 'all') {
    query = query.eq('department', department);
  }

  const { data, error } = await query;
  if (error) {
    console.error('getHomeProducts error:', error);
    return [];
  }
  return data || [];
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brands ( name ),
      product_images ( id, url, sort_order, view_angle, alt_text ),
      product_variants ( id, color, size, stock, sku, price_override ),
      reviews (*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getProductBySlug error:', error);
    return null;
  }
  return data;
}

export async function getProducts({ search, department, category } = {}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      brands ( name ),
      product_images ( id, url, sort_order ),
      product_variants ( id, color, size, stock, price_override )
    `)
    .order('display_priority', { ascending: true });

  if (search) query = query.ilike('name', `%${search}%`);
  if (department && department !== 'all') query = query.eq('department', department);
  if (category && category !== 'all') query = query.eq('primary_category', category);

  const { data, error } = await query;
  if (error) {
    console.error('getProducts error:', error);
    return [];
  }
  return data || [];
}

// ================= WISHLIST / SAVED GEAR =================
export function getLocalWishlist() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('ulx_saved_gear');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function toggleWishlistProduct(product) {
  if (typeof window === 'undefined' || !product) return [];
  try {
    const current = getLocalWishlist();
    const exists = current.some((item) => item.id === product.id);
    let updated;
    if (exists) {
      updated = current.filter((item) => item.id !== product.id);
    } else {
      updated = [
        ...current,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          department: product.department,
          primary_category: product.primary_category,
          base_price: product.base_price,
          sale_price: product.sale_price,
          image_url: product.product_images?.[0]?.url || ''
        }
      ];
    }
    localStorage.setItem('ulx_saved_gear', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
    return updated;
  } catch (e) {
    console.error('Wishlist error:', e);
    return [];
  }
}

// Logged-in users get a real, cross-device wishlist backed by the
// database; guests keep using localStorage. NOTE: a guest's saved items
// do not automatically transfer once they log in.
async function getOrCreateUserWishlist(userId) {
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

export async function getWishlist() {
  const user = await getCurrentUser();
  if (!user) return getLocalWishlist();

  const wishlistId = await getOrCreateUserWishlist(user.id);
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      id,
      added_at,
      products (
        id, name, slug, department, primary_category, base_price, sale_price,
        product_images ( url )
      )
    `)
    .eq('wishlist_id', wishlistId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('getWishlist error:', error);
    return [];
  }

  return (data || [])
    .filter((item) => item.products)
    .map((item) => ({
      id: item.products.id,
      name: item.products.name,
      slug: item.products.slug,
      department: item.products.department,
      primary_category: item.products.primary_category,
      base_price: item.products.base_price,
      sale_price: item.products.sale_price,
      image_url: item.products.product_images?.[0]?.url || ''
    }));
}

export async function toggleWishlistItem(product) {
  if (!product) return [];
  const user = await getCurrentUser();
  if (!user) return toggleWishlistProduct(product);

  const wishlistId = await getOrCreateUserWishlist(user.id);

  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlistId)
    .eq('product_id', product.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id);
  } else {
    await supabase.from('wishlist_items').insert({ wishlist_id: wishlistId, product_id: product.id });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wishlist-updated'));
  }

  return getWishlist();
}

// ================= USER PROFILE & ADDRESSES =================
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return {
    user,
    profile: profile || { full_name: user.user_metadata?.full_name || 'Athlete', email: user.email }
  };
}

export async function getUserAddresses() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  if (error) return [];
  return data || [];
}

// ================= ADMIN PRODUCT CREATION & SAFE DELETION =================
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
    currency,
    sale_start_date,
    sale_end_date,
    materials,
    fit,
    weight_spec,
    care_instructions,
    country_of_manufacture,
    features,
    package_weight,
    dimensions,
    shipping_category,
    is_free_shipping,
    seo_title,
    meta_description,
    slug,
    is_new,
    is_best_seller,
    is_featured,
    is_on_sale,
    is_homepage,
    display_priority,
    images,
    variants
  } = productData;

  let baseSlug = (slug || name || 'product')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!baseSlug) baseSlug = `item-${Date.now().toString().slice(-4)}`;

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle();

  const finalSlug = existing 
    ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` 
    : baseSlug;

  const { data: product, error: prodErr } = await supabase
    .from('products')
    .insert({
      name,
      department: department || 'men',
      primary_category: primary_category || 'shoes',
      subcategory: subcategory || 'Lifestyle',
      slug: finalSlug,
      brand_id: brand_id || null,
      category_id: category_id || null,
      description: description || '',
      short_description: short_description || '',
      sku: sku || null,
      tags: tags || [],
      status: status || 'active',
      base_price: Number(base_price),
      sale_price: sale_price ? Number(sale_price) : null,
      currency: currency || 'USD',
      sale_start_date: sale_start_date || null,
      sale_end_date: sale_end_date || null,
      materials: materials || '',
      fit: fit || '',
      weight_spec: weight_spec || '',
      care_instructions: care_instructions || '',
      country_of_manufacture: country_of_manufacture || '',
      features: features || [],
      package_weight: package_weight ? Number(package_weight) : null,
      dimensions: dimensions || { length: 0, width: 0, height: 0 },
      shipping_category: shipping_category || 'standard',
      is_free_shipping: Boolean(is_free_shipping),
      seo_title: seo_title || name,
      meta_description: meta_description || short_description || '',
      is_new: Boolean(is_new),
      is_best_seller: Boolean(is_best_seller),
      is_featured: Boolean(is_featured),
      is_on_sale: Boolean(is_on_sale),
      is_homepage: Boolean(is_homepage),
      display_priority: Number(display_priority) || 10,
    })
    .select()
    .single();

  if (prodErr) throw prodErr;

  if (is_best_seller) {
    await supabase
      .from('products')
      .update({ is_best_seller: false })
      .eq('department', product.department)
      .neq('id', product.id);
  }

  if (images && images.length > 0) {
    const imagesToInsert = images.map((img, index) => ({
      product_id: product.id,
      url: img.url,
      view_angle: img.view_angle || 'side',
      alt_text: img.alt_text || `${name} angle ${index + 1}`,
      sort_order: index,
    }));
    await supabase.from('product_images').insert(imagesToInsert);
  }

  if (variants && variants.length > 0) {
    const variantsToInsert = variants.map((v) => ({
      product_id: product.id,
      color: v.color || null,
      size: v.size || 'OS',
      sku: v.sku || `${sku || 'SKU'}-${v.color || 'CLR'}-${v.size || 'OS'}`,
      stock: Number(v.stock) || 0,
      price_override: v.price_override ? Number(v.price_override) : null,
    }));
    await supabase.from('product_variants').insert(variantsToInsert);
  }

  return product;
}

export async function deleteProduct(productId) {
  try {
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', productId);

    if (images && images.length > 0) {
      for (const img of images) {
        try {
          await deleteProductImageFile(img.url);
        } catch (storageErr) {
          console.warn('Storage delete skipped:', storageErr);
        }
      }
    }
  } catch (err) {
    console.warn('Image lookup failed, proceeding with DB delete:', err);
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Failed to delete product from database:', error);
    throw error;
  }
}

export async function duplicateProduct(productId) {
  const { data: original, error } = await supabase
    .from('products')
    .select(`*, product_images (*), product_variants (*)`)
    .eq('id', productId)
    .single();

  if (error || !original) throw new Error('Product not found for duplication.');

  return await createFullAdminProduct({
    ...original,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
    images: original.product_images || [],
    variants: original.product_variants || [],
  });
}

// ================= INVENTORY & AUDIT LOGS =================
export async function getInventoryVariants() {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      *,
      products ( id, name, sku, base_price, sale_price, department, primary_category, product_images ( url ) )
    `)
    .order('stock', { ascending: true });

  if (error) throw error;
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

// ================= ORDERS & FULFILLMENT =================
export async function getAllAdminOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateOrderFulfillment(orderId, { status, tracking_number, shipping_carrier }) {
  const payload = {};
  if (status) payload.status = status;
  if (tracking_number !== undefined) payload.tracking_number = tracking_number;
  if (shipping_carrier !== undefined) payload.shipping_carrier = shipping_carrier;

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================= CUSTOMERS =================
export async function getAllCustomers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];

  const { data: orders } = await supabase.from('orders').select('user_id, total_amount, total, created_at');

  return profiles.map((cust) => {
    const userOrders = (orders || []).filter((o) => o.user_id === cust.id);
    const totalSpent = userOrders.reduce((acc, o) => acc + Number(o.total_amount ?? o.total ?? 0), 0);
    const lastOrder = userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return {
      ...cust,
      ordersCount: userOrders.length,
      totalSpent,
      lastOrderDate: lastOrder ? lastOrder.created_at : cust.created_at,
    };
  });
}

// ================= RETURNS ENGINE =================
export async function getAllReturns() {
  const { data, error } = await supabase
    .from('returns')
    .select(`*, orders ( order_number )`)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
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

export async function submitProductReturn({
  order_id,
  order_number,
  customer_name,
  customer_email,
  product_name,
  variant_size,
  quantity = 1,
  refund_amount,
  reason,
  details = '',
  photos = [],
  return_method = 'Mail return',
  shipping_payer = 'Customer pays'
}) {
  const { data, error } = await supabase
    .from('returns')
    .insert({
      order_id,
      order_number,
      customer_name,
      customer_email,
      product_name,
      variant_size,
      quantity,
      refund_amount: Number(refund_amount) || 0,
      reason,
      details,
      photos,
      return_method,
      shipping_payer,
      status: 'requested',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating return claim:', error);
    throw new Error(error.message || 'Failed to submit return request.');
  }

  return data;
}

export async function uploadReturnPhoto(file) {
  const fileExt = file.name.split('.').pop();
  const cleanName = `return-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `returns/${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// ================= REVIEWS =================
export async function getAllReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, products ( name, slug )`)
    .order('created_at', { ascending: false });

  if (error) return [];
  const reviews = data || [];

  const userIds = [...new Set(reviews.map((r) => r.user_id).filter(Boolean))];
  if (userIds.length === 0) return reviews;

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const nameById = new Map((profilesData || []).map((p) => [p.id, p.full_name]));
  return reviews.map((r) => ({ ...r, reviewer_name: nameById.get(r.user_id) || 'Verified Athlete' }));
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

export async function deleteReview(reviewId) {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}

// ================= COUPONS & PROMOTIONS =================
export async function getAllCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('code', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function createCoupon(couponData) {
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: couponData.code.toUpperCase().trim(),
      discount_type: couponData.discount_type,
      discount_value: Number(couponData.discount_value),
      usage_limit: Number(couponData.usage_limit) || 500,
      per_user_limit: Number(couponData.per_user_limit) || 1,
      starts_at: couponData.starts_at || new Date().toISOString(),
      expires_at: couponData.expires_at || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCouponActive(couponId, is_active) {
  const { data, error } = await supabase
    .from('coupons')
    .update({ is_active })
    .eq('id', couponId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCoupon(couponId) {
  const { error } = await supabase.from('coupons').delete().eq('id', couponId);
  if (error) throw error;
}

export async function getCouponUsageCounts() {
  const { data, error } = await supabase.from('coupon_usage').select('coupon_id');
  if (error) return {};
  const counts = {};
  (data || []).forEach((row) => {
    counts[row.coupon_id] = (counts[row.coupon_id] || 0) + 1;
  });
  return counts;
}

export async function validateCoupon(code, subtotal) {
  const normalizedCode = (code || '').toUpperCase().trim();
  if (!normalizedCode) return { valid: false, message: 'Enter a coupon code.' };

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !coupon) return { valid: false, message: 'Invalid or inactive coupon code.' };

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, message: 'This coupon is not active yet.' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, message: 'This coupon has expired.' };
  }

  if (coupon.usage_limit) {
    const { count } = await supabase
      .from('coupon_usage')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id);
    if ((count || 0) >= coupon.usage_limit) {
      return { valid: false, message: 'This coupon has reached its usage limit.' };
    }
  }

  const user = await getCurrentUser();
  if (user && coupon.per_user_limit) {
    const { count: userCount } = await supabase
      .from('coupon_usage')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id);
    if ((userCount || 0) >= coupon.per_user_limit) {
      return { valid: false, message: 'You have already used this coupon the maximum number of times.' };
    }
  }

  const discountAmount = coupon.discount_type === 'percentage'
    ? Number((Number(subtotal) * (Number(coupon.discount_value) / 100)).toFixed(2))
    : Math.min(Number(coupon.discount_value), Number(subtotal));

  return { valid: true, coupon, discountAmount };
}

export async function recordCouponUsage(couponId, orderId) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from('coupon_usage')
    .insert({ coupon_id: couponId, order_id: orderId, user_id: user?.id || null });

  if (error) console.error('recordCouponUsage error:', error);
}

// ================= STORE CONTENT =================
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

// ================= STORE SETTINGS =================
export async function getStoreSettings(key = 'general') {
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return null;
  return data.value;
}

export async function updateStoreSettings(key, value) {
  const { data, error } = await supabase
    .from('store_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================= CUSTOMER SUPPORT =================
export async function submitSupportTicket({ name, email, subject, message }) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user?.id || null,
      name,
      email,
      subject,
      message,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw new Error(error.message || 'Failed to submit your message.');
  return data;
}

export async function getAllSupportTickets() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function updateSupportTicket(ticketId, { status, admin_response }) {
  const payload = { updated_at: new Date().toISOString() };
  if (status !== undefined) payload.status = status;
  if (admin_response !== undefined) payload.admin_response = admin_response;

  const { data, error } = await supabase
    .from('support_tickets')
    .update(payload)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================= AUDIT LOG & ADMIN NOTIFICATIONS =================
export async function getAuditLog() {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('getAuditLog error:', error);
    return [];
  }
  return data || [];
}

export async function getAdminNotifications() {
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('getAdminNotifications error:', error);
    return [];
  }
  return data || [];
}

export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) throw error;
}

// ================= CART SYSTEM =================
function getLocalCartId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ulx_cart_id');
}

export async function getCart() {
  if (typeof window === 'undefined') return { id: null, items: [] };

  let cartId = getLocalCartId();
  const user = await getCurrentUser();

  if (cartId) {
    const { data: existingCart } = await supabase
      .from('carts')
      .select('id')
      .eq('id', cartId)
      .maybeSingle();

    if (!existingCart) cartId = null;
  }

  if (!cartId) {
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: user?.id || null })
      .select('id')
      .single();

    if (createError || !newCart) return { id: null, items: [] };
    cartId = newCart.id;
    localStorage.setItem('ulx_cart_id', cartId);
  }

  const { data: items, error: itemsError } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      variant_id,
      product_variants (
        id,
        color,
        size,
        price_override,
        products (
          id,
          name,
          base_price,
          sale_price,
          product_images ( url )
        )
      )
    `)
    .eq('cart_id', cartId);

  if (itemsError) return { id: cartId, items: [] };
  return { id: cartId, items: items || [] };
}

export async function addToCart(cartId, variantId, quantity = 1, fallbackProductId = null) {
  let activeCartId = cartId;
  if (!activeCartId) {
    const cartRes = await getCart();
    activeCartId = cartRes.id;
  }

  let activeVariantId = variantId;

  if (!activeVariantId && fallbackProductId) {
    const { data: existingVariant } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', fallbackProductId)
      .limit(1)
      .maybeSingle();

    if (existingVariant) {
      activeVariantId = existingVariant.id;
    } else {
      const { data: newVar } = await supabase
        .from('product_variants')
        .insert({ product_id: fallbackProductId, size: 'OS', stock: 50 })
        .select('id')
        .single();
      if (newVar) activeVariantId = newVar.id;
    }
  }

  if (!activeCartId || !activeVariantId) {
    throw new Error('Please select an available size.');
  }

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', activeCartId)
    .eq('variant_id', activeVariantId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ cart_id: activeCartId, variant_id: activeVariantId, quantity })
      .select();
    if (error) throw error;
    return data;
  }
}

export async function removeFromCart(itemId) {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
  if (error) throw error;
}

export async function clearCart(cartId) {
  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);
  if (error) console.error('Clear cart error:', error);
}

// ================= ORDERS =================
export async function createOrder({ order_number, customer, items, total, subtotal, shippingCost, shippingSpeed, discountAmount = 0 }) {
  const user = await getCurrentUser();
  const orderNumber = order_number || ('ULX-' + Math.floor(100000 + Math.random() * 900000));
  const parsedTotal = Number(total);

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user ? user.id : null,
      guest_email: user ? null : customer.email,
      total: parsedTotal,
      total_amount: parsedTotal,
      subtotal: Number(subtotal),
      discount_amount: Number(discountAmount) || 0,
      shipping_cost: Number(shippingCost),
      shipping_speed: shippingSpeed,
      shipping_address: customer,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single();

  if (orderErr) throw new Error(orderErr.message);

  if (items && items.length > 0) {
    const orderLineItems = items.map((item) => {
      const v = item.product_variants;
      const p = v?.products;
      const unitPrice = v?.price_override ?? p?.sale_price ?? p?.base_price ?? 0;

      return {
        order_id: order.id,
        variant_id: v?.id || null,
        product_name: p?.name || 'Footwear / Gear',
        size: v?.size || 'OS',
        color: v?.color || null,
        unit_price: Number(unitPrice),
        quantity: item.quantity
      };
    });

    const { error: itemsErr } = await supabase.from('order_items').insert(orderLineItems);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  return order;
}

export async function markOrderPaymentFailed(orderId) {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('id', orderId);
  if (error) console.error('markOrderPaymentFailed error:', error);
}

const ORDER_ITEMS_WITH_IMAGE = `
  *,
  product_variants (
    id,
    size,
    color,
    products ( product_images ( url ) )
  )
`;

export async function getUserOrders() {
  const user = await getCurrentUser();

  let query = supabase
    .from('orders')
    .select(`*, order_items ( ${ORDER_ITEMS_WITH_IMAGE} )`)
    .order('created_at', { ascending: false });

  if (user?.id) {
    query = query.or(`user_id.eq.${user.id},guest_email.eq.${user.email}`);
  } else {
    // If not logged in / testing checkout as guest, fetch recent deliveries
    query = query.limit(20);
  }

  const { data, error } = await query;
  if (error) {
    console.error('getUserOrders query error:', error);
    return [];
  }
  return data || [];
}

export async function getOrderDetails(orderNumber) {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items ( ${ORDER_ITEMS_WITH_IMAGE} )`)
    .eq('order_number', orderNumber)
    .single();

  if (error) return null;
  return data;
}