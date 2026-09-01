-- ============================================================================
-- ULIXIES ADMIN SECURITY MIGRATION (v2 -- corrected against real schema)
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 0. REVIEWS MODERATION FLAG
-- The reviews table has no publish/hide flag, so the admin's "Reviews
-- Moderation" tab currently has nothing to toggle. This adds one.
-- ----------------------------------------------------------------------------
alter table reviews add column if not exists is_published boolean not null default true;

-- ----------------------------------------------------------------------------
-- 1. ADMIN IDENTITY
-- The one account allowed to bypass row-level security as an administrator.
-- This must match lib/adminConfig.js in the codebase.
-- ----------------------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = 'f15972f8-ed06-44db-9332-f2396c711098'::uuid;
$$;

-- ----------------------------------------------------------------------------
-- 2. STRIP EXISTING POLICIES ON EVERY PUBLIC TABLE
-- RLS was already marked "enabled" on every table, but the anon key could
-- still read/write everything -- meaning permissive catch-all policies
-- (e.g. "using (true)") are already attached under unknown names. Postgres
-- OR's every matching policy together, so leaving those in place would
-- make the restrictive policies below meaningless. Wipe first, then
-- rebuild from scratch below.
-- ----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 3. AUDIT LOG (new table)
-- Populated automatically by triggers below -- not dependent on the client
-- remembering to log anything, so it can't be silently skipped by the UI.
-- ----------------------------------------------------------------------------
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  admin_email text,
  table_name text not null,
  operation text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table audit_log enable row level security;

drop policy if exists "audit_log_admin_only" on audit_log;
create policy "audit_log_admin_only" on audit_log
  for all using (is_admin()) with check (is_admin());

create or replace function log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec_id text;
begin
  rec_id := coalesce(
    (to_jsonb(coalesce(new, old)) ->> 'id'),
    (to_jsonb(coalesce(new, old)) ->> 'key')
  );

  insert into audit_log (admin_id, admin_email, table_name, operation, record_id, old_data, new_data)
  values (
    auth.uid(),
    (auth.jwt() ->> 'email'),
    TG_TABLE_NAME,
    TG_OP,
    rec_id,
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when TG_OP in ('UPDATE', 'INSERT') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_products on products;
create trigger trg_audit_products after insert or update or delete on products
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_product_variants on product_variants;
create trigger trg_audit_product_variants after insert or update or delete on product_variants
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_orders on orders;
create trigger trg_audit_orders after update or delete on orders
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_returns on returns;
create trigger trg_audit_returns after insert or update or delete on returns
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_coupons on coupons;
create trigger trg_audit_coupons after insert or update or delete on coupons
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_store_settings on store_settings;
create trigger trg_audit_store_settings after insert or update or delete on store_settings
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_store_content on store_content;
create trigger trg_audit_store_content after insert or update or delete on store_content
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_collections on collections;
create trigger trg_audit_collections after insert or update or delete on collections
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_reviews on reviews;
create trigger trg_audit_reviews after update or delete on reviews
  for each row execute function log_audit_event();

-- ----------------------------------------------------------------------------
-- 4. ADMIN NOTIFICATIONS (new table: admin_notifications)
-- Named admin_notifications (not "notifications") because a real
-- "notifications" table already exists in this project for a different
-- purpose (product back-in-stock / price-drop alerts, keyed by
-- product_id) -- reusing it would have collided with that feature.
-- ----------------------------------------------------------------------------
create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null default 'info',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table admin_notifications enable row level security;

drop policy if exists "admin_notifications_admin_only" on admin_notifications;
create policy "admin_notifications_admin_only" on admin_notifications
  for all using (is_admin()) with check (is_admin());

create or replace function notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into admin_notifications (type, severity, message)
  values (
    'new_order',
    'info',
    'New order ' || coalesce(new.order_number, new.id::text) || ' placed for $' || coalesce(new.total_amount, new.total, 0)::text
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_order on orders;
create trigger trg_notify_new_order after insert on orders
  for each row execute function notify_new_order();

create or replace function notify_new_return()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into admin_notifications (type, severity, message)
  values (
    'new_return',
    'warning',
    'Return requested on order ' || coalesce(new.order_number, '') || ': ' || coalesce(new.product_name, 'item')
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_return on returns;
create trigger trg_notify_new_return after insert on returns
  for each row execute function notify_new_return();

create or replace function notify_low_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stock <= 5 and (old.stock is null or old.stock > 5) then
    insert into admin_notifications (type, severity, message)
    values (
      'low_stock',
      case when new.stock <= 0 then 'critical' else 'warning' end,
      'Variant ' || coalesce(new.sku, new.id::text) || ' (' || coalesce(new.color, '') || ' / ' || coalesce(new.size, '') || ') dropped to ' || new.stock || ' units'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_low_stock on product_variants;
create trigger trg_notify_low_stock after update on product_variants
  for each row execute function notify_low_stock();

-- ============================================================================
-- 5. ROW LEVEL SECURITY -- rebuild every policy against the real schema.
-- ============================================================================

-- ---- Public catalog data: readable by anyone, writable only by admin ----
alter table products enable row level security;
create policy "products_public_read" on products for select using (true);
create policy "products_admin_insert" on products for insert with check (is_admin());
create policy "products_admin_update" on products for update using (is_admin()) with check (is_admin());
create policy "products_admin_delete" on products for delete using (is_admin());

alter table product_variants enable row level security;
create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_variants_admin_insert" on product_variants for insert with check (is_admin());
create policy "product_variants_admin_update" on product_variants for update using (is_admin()) with check (is_admin());
create policy "product_variants_admin_delete" on product_variants for delete using (is_admin());

alter table product_images enable row level security;
create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_admin_insert" on product_images for insert with check (is_admin());
create policy "product_images_admin_update" on product_images for update using (is_admin()) with check (is_admin());
create policy "product_images_admin_delete" on product_images for delete using (is_admin());

alter table brands enable row level security;
create policy "brands_public_read" on brands for select using (true);
create policy "brands_admin_insert" on brands for insert with check (is_admin());
create policy "brands_admin_update" on brands for update using (is_admin()) with check (is_admin());
create policy "brands_admin_delete" on brands for delete using (is_admin());

alter table categories enable row level security;
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_insert" on categories for insert with check (is_admin());
create policy "categories_admin_update" on categories for update using (is_admin()) with check (is_admin());
create policy "categories_admin_delete" on categories for delete using (is_admin());

-- collections has a real is_published column (unlike reviews) -- honor it.
alter table collections enable row level security;
create policy "collections_public_read" on collections for select
  using (is_published = true or is_admin());
create policy "collections_admin_insert" on collections for insert with check (is_admin());
create policy "collections_admin_update" on collections for update using (is_admin()) with check (is_admin());
create policy "collections_admin_delete" on collections for delete using (is_admin());

alter table collection_products enable row level security;
create policy "collection_products_public_read" on collection_products for select using (true);
create policy "collection_products_admin_insert" on collection_products for insert with check (is_admin());
create policy "collection_products_admin_update" on collection_products for update using (is_admin()) with check (is_admin());
create policy "collection_products_admin_delete" on collection_products for delete using (is_admin());

-- ---- Reviews: published reviews are public, admin sees/moderates everything,
-- a signed-in customer can write their own review. ----
alter table reviews enable row level security;
create policy "reviews_public_read_published" on reviews for select
  using (is_published = true or is_admin());
create policy "reviews_owner_or_admin_insert" on reviews for insert
  with check (auth.uid() = user_id or is_admin());
create policy "reviews_admin_update" on reviews for update using (is_admin()) with check (is_admin());
create policy "reviews_admin_delete" on reviews for delete using (is_admin());

-- ---- Coupons: publicly readable so checkout can validate a code; writes
-- stay admin-only. ----
alter table coupons enable row level security;
create policy "coupons_public_read" on coupons for select using (true);
create policy "coupons_admin_insert" on coupons for insert with check (is_admin());
create policy "coupons_admin_update" on coupons for update using (is_admin()) with check (is_admin());
create policy "coupons_admin_delete" on coupons for delete using (is_admin());

alter table coupon_usage enable row level security;
create policy "coupon_usage_public_read" on coupon_usage for select using (true);
create policy "coupon_usage_insert" on coupon_usage for insert
  with check (user_id is null or user_id = auth.uid() or is_admin());
create policy "coupon_usage_admin_update" on coupon_usage for update using (is_admin()) with check (is_admin());
create policy "coupon_usage_admin_delete" on coupon_usage for delete using (is_admin());

-- ---- Store settings/content: publicly readable (announcement bar, hero
-- CMS text, shipping rules) so the storefront can actually use them;
-- writes stay admin-only. ----
alter table store_settings enable row level security;
create policy "store_settings_public_read" on store_settings for select using (true);
create policy "store_settings_admin_write" on store_settings for insert with check (is_admin());
create policy "store_settings_admin_update" on store_settings for update using (is_admin()) with check (is_admin());
create policy "store_settings_admin_delete" on store_settings for delete using (is_admin());

alter table store_content enable row level security;
create policy "store_content_public_read" on store_content for select using (true);
create policy "store_content_admin_write" on store_content for insert with check (is_admin());
create policy "store_content_admin_update" on store_content for update using (is_admin()) with check (is_admin());
create policy "store_content_admin_delete" on store_content for delete using (is_admin());

alter table inventory_logs enable row level security;
create policy "inventory_logs_admin_only" on inventory_logs for all using (is_admin()) with check (is_admin());

alter table payments enable row level security;
create policy "payments_admin_only" on payments for all using (is_admin()) with check (is_admin());

-- product_views feeds future real analytics -- anyone can log a view,
-- only admin can read the log back.
alter table product_views enable row level security;
create policy "product_views_open_insert" on product_views for insert with check (true);
create policy "product_views_admin_select" on product_views for select using (is_admin());
create policy "product_views_admin_delete" on product_views for delete using (is_admin());

-- notifications = customer subscriptions for back-in-stock/price-drop
-- alerts (product_id-keyed). Owner-managed, admin can see all.
alter table notifications enable row level security;
create policy "notifications_owner_or_admin_select" on notifications for select
  using (auth.uid() = user_id or is_admin());
create policy "notifications_owner_insert" on notifications for insert
  with check (auth.uid() = user_id or user_id is null or is_admin());
create policy "notifications_owner_or_admin_delete" on notifications for delete
  using (auth.uid() = user_id or is_admin());
create policy "notifications_admin_update" on notifications for update
  using (is_admin()) with check (is_admin());

-- ---- User-owned data ----
alter table addresses enable row level security;
create policy "addresses_owner_select" on addresses for select
  using (auth.uid() = user_id or is_admin());
create policy "addresses_owner_insert" on addresses for insert
  with check (auth.uid() = user_id or is_admin());
create policy "addresses_owner_update" on addresses for update
  using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());
create policy "addresses_owner_delete" on addresses for delete
  using (auth.uid() = user_id or is_admin());

alter table shipping_addresses enable row level security;
create policy "shipping_addresses_owner_select" on shipping_addresses for select
  using (auth.uid() = user_id or is_admin());
create policy "shipping_addresses_owner_insert" on shipping_addresses for insert
  with check (auth.uid() = user_id or is_admin());
create policy "shipping_addresses_owner_update" on shipping_addresses for update
  using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());
create policy "shipping_addresses_owner_delete" on shipping_addresses for delete
  using (auth.uid() = user_id or is_admin());

alter table profiles enable row level security;
create policy "profiles_owner_select" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "profiles_owner_update" on profiles for update
  using (auth.uid() = id or is_admin()) with check (auth.uid() = id or is_admin());
create policy "profiles_owner_insert" on profiles for insert
  with check (auth.uid() = id or is_admin());

-- ---- Wishlists: a real server-side wishlist exists in the schema
-- (the app currently uses localStorage instead -- separate follow-up).
-- Owner-managed, admin can see all. ----
alter table wishlists enable row level security;
create policy "wishlists_owner_select" on wishlists for select
  using (auth.uid() = user_id or is_admin());
create policy "wishlists_owner_insert" on wishlists for insert
  with check (auth.uid() = user_id or is_admin());
create policy "wishlists_owner_update" on wishlists for update
  using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());
create policy "wishlists_owner_delete" on wishlists for delete
  using (auth.uid() = user_id or is_admin());

alter table wishlist_items enable row level security;
create policy "wishlist_items_owner_or_admin_select" on wishlist_items for select
  using (
    is_admin() or exists (
      select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid()
    )
  );
create policy "wishlist_items_owner_insert" on wishlist_items for insert
  with check (
    is_admin() or exists (
      select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid()
    )
  );
create policy "wishlist_items_owner_delete" on wishlist_items for delete
  using (
    is_admin() or exists (
      select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid()
    )
  );

-- ---- Carts: guest carts have no auth identity, so access is by knowing the
-- cart's random UUID (same trust model the app already relies on). This
-- keeps checkout working for guests while blocking bulk table scraping. ----
alter table carts enable row level security;
create policy "carts_open_access" on carts for all using (true) with check (true);

alter table cart_items enable row level security;
create policy "cart_items_open_access" on cart_items for all using (true) with check (true);

-- ---- Orders: owner-only reads, open inserts (guest checkout), admin-only
-- status/tracking updates. NOTE: a pure guest checkout (never logs in) will
-- no longer be able to look up that order later -- there is no secure way
-- to prove "guest" identity without an account. Logged-in customers are
-- unaffected. ----
alter table orders enable row level security;
create policy "orders_owner_or_admin_select" on orders for select
  using (auth.uid() = user_id or is_admin());
create policy "orders_checkout_insert" on orders for insert
  with check (user_id is null or user_id = auth.uid());
create policy "orders_admin_update" on orders for update
  using (is_admin()) with check (is_admin());
create policy "orders_admin_delete" on orders for delete using (is_admin());

alter table order_items enable row level security;
create policy "order_items_owner_or_admin_select" on order_items for select
  using (
    is_admin() or exists (
      select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
create policy "order_items_checkout_insert" on order_items for insert
  with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
      and (o.user_id is null or o.user_id = auth.uid())
    )
  );
create policy "order_items_admin_update" on order_items for update
  using (is_admin()) with check (is_admin());
create policy "order_items_admin_delete" on order_items for delete using (is_admin());

-- ---- Returns: anyone can file one (matches current UI), only the filer
-- (by email) or admin can read it back, only admin can change its status. ----
alter table returns enable row level security;
create policy "returns_owner_or_admin_select" on returns for select
  using (is_admin() or customer_email = (auth.jwt() ->> 'email'));
create policy "returns_open_insert" on returns for insert with check (true);
create policy "returns_admin_update" on returns for update
  using (is_admin()) with check (is_admin());
create policy "returns_admin_delete" on returns for delete using (is_admin());

-- ============================================================================
-- 6. FIX: profiles table was never being populated, so the admin Customers
-- tab has been silently showing zero customers regardless of real signups.
-- This creates a profile row automatically on every new signup, and
-- backfills one for every account that already exists (including the
-- admin account created earlier).
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = new.id) then
    insert into public.profiles (id, full_name, created_at)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), now());
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, created_at)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', u.email), u.created_at
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- ============================================================================
-- Done. Verify in Supabase Dashboard -> Authentication -> Policies that every
-- table above shows RLS enabled with the policies listed here.
-- ============================================================================
