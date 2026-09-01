-- ============================================================================
-- FIX: Customer Passports tab shows a fake placeholder email for every
-- customer because `profiles` has no email column at all -- the real
-- email only exists in Supabase's protected auth.users table, which the
-- app can never query directly. This mirrors it into profiles instead.
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Run. Safe to re-run.
-- ============================================================================

alter table profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = new.id) then
    insert into public.profiles (id, full_name, email, created_at)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), new.email, now());
  else
    update public.profiles set email = new.email where id = new.id and email is distinct from new.email;
  end if;
  return new;
end;
$$;

-- Backfill real emails for every account that already exists.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email <> u.email);
