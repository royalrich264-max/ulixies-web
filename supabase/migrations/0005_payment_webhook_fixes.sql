-- Fixes support for the Stripe payment webhook:
-- 1. Atomic reserved_stock increment (removes the read-then-write race condition).
-- 2. A real unique constraint backing the payments.upsert(... onConflict: 'transaction_id') call,
--    so duplicate webhook deliveries update the existing payment row instead of throwing.

create or replace function public.increment_reserved_stock(p_variant_id uuid, p_qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update product_variants
  set reserved_stock = coalesce(reserved_stock, 0) + p_qty
  where id = p_variant_id;
$$;

grant execute on function public.increment_reserved_stock(uuid, integer) to service_role;

create unique index if not exists payments_transaction_id_key on payments (transaction_id);
