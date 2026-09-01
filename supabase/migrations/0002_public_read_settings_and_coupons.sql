-- ============================================================================
-- FOLLOW-UP PATCH: allow customers to actually read the settings/coupons
-- the storefront now depends on. Run this in Supabase Dashboard -> SQL
-- Editor -> New Query -> Run. Safe to re-run.
--
-- Why: 0001 locked coupons / store_settings / store_content behind
-- admin-only access entirely (including reads). That was correct at the
-- time -- nothing on the storefront read them yet. Now checkout validates
-- coupon codes and reads shipping rules, and the homepage/header read
-- store_content for the announcement bar and hero CMS text, so those
-- tables need public SELECT. WRITE access stays admin-only.
-- ============================================================================

-- ---- Coupons: anyone can look up a code to validate it at checkout ----
drop policy if exists "coupons_admin_only" on coupons;
drop policy if exists "coupons_public_read" on coupons;
drop policy if exists "coupons_admin_insert" on coupons;
drop policy if exists "coupons_admin_update" on coupons;
drop policy if exists "coupons_admin_delete" on coupons;

create policy "coupons_public_read" on coupons for select using (true);
create policy "coupons_admin_insert" on coupons for insert with check (is_admin());
create policy "coupons_admin_update" on coupons for update using (is_admin()) with check (is_admin());
create policy "coupons_admin_delete" on coupons for delete using (is_admin());

-- ---- Coupon usage: checkout needs to count total redemptions to enforce
-- usage_limit, and the admin needs it for the redemptions column ----
drop policy if exists "coupon_usage_owner_or_admin_select" on coupon_usage;
drop policy if exists "coupon_usage_public_read" on coupon_usage;

create policy "coupon_usage_public_read" on coupon_usage for select using (true);

-- ---- Store settings: checkout reads shipping_rules, homepage reads
-- general/payment_gateway reference notes. Writes stay admin-only. ----
drop policy if exists "store_settings_admin_only" on store_settings;
drop policy if exists "store_settings_public_read" on store_settings;
drop policy if exists "store_settings_admin_write" on store_settings;
drop policy if exists "store_settings_admin_update" on store_settings;
drop policy if exists "store_settings_admin_delete" on store_settings;

create policy "store_settings_public_read" on store_settings for select using (true);
create policy "store_settings_admin_write" on store_settings for insert with check (is_admin());
create policy "store_settings_admin_update" on store_settings for update using (is_admin()) with check (is_admin());
create policy "store_settings_admin_delete" on store_settings for delete using (is_admin());

-- ---- Store content: header announcement bar + homepage hero CMS text ----
drop policy if exists "store_content_admin_only" on store_content;
drop policy if exists "store_content_public_read" on store_content;
drop policy if exists "store_content_admin_write" on store_content;
drop policy if exists "store_content_admin_update" on store_content;
drop policy if exists "store_content_admin_delete" on store_content;

create policy "store_content_public_read" on store_content for select using (true);
create policy "store_content_admin_write" on store_content for insert with check (is_admin());
create policy "store_content_admin_update" on store_content for update using (is_admin()) with check (is_admin());
create policy "store_content_admin_delete" on store_content for delete using (is_admin());
