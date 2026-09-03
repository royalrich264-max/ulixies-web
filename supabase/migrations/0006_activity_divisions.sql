-- Activity divisions (e.g. "Gym & Training", "Hoodies & Sweatshirts") were previously
-- hardcoded in app/admin/page.js as ACTIVITY_PRESETS, shared identically across every
-- department with no way for the admin to add, rename, or remove one. This table makes
-- them real, admin-manageable rows instead, seeded with the exact values that were
-- hardcoded so existing product data (products.subcategory) keeps matching.

create table if not exists activity_divisions (
  id uuid primary key default gen_random_uuid(),
  primary_category text not null check (primary_category in ('shoes', 'clothing', 'accessories')),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (primary_category, name)
);

alter table activity_divisions enable row level security;
create policy "activity_divisions_public_read" on activity_divisions for select using (true);
create policy "activity_divisions_admin_insert" on activity_divisions for insert with check (is_admin());
create policy "activity_divisions_admin_update" on activity_divisions for update using (is_admin()) with check (is_admin());
create policy "activity_divisions_admin_delete" on activity_divisions for delete using (is_admin());

insert into activity_divisions (primary_category, name, sort_order)
values
  ('shoes', 'Gym & Training', 0),
  ('shoes', 'Running', 1),
  ('shoes', 'Lifestyle / Everyday', 2),
  ('shoes', 'Basketball', 3),
  ('shoes', 'Football / Soccer', 4),
  ('shoes', 'Trail & Outdoor', 5),
  ('clothing', 'Gym & Workout Shirts', 0),
  ('clothing', 'Hoodies & Sweatshirts', 1),
  ('clothing', 'Training Shorts', 2),
  ('clothing', 'Track Pants & Tights', 3),
  ('clothing', 'Jackets & Outerwear', 4),
  ('clothing', 'Everyday Casual', 5),
  ('accessories', 'Training Bags & Backpacks', 0),
  ('accessories', 'Performance Socks', 1),
  ('accessories', 'Caps & Headwear', 2),
  ('accessories', 'Gloves & Gym Straps', 3)
on conflict (primary_category, name) do nothing;
