-- ============================================================================
-- NEW FEATURE: Customer Support tickets.
-- Adds a support_tickets table, RLS, audit logging, and an admin
-- notification trigger for new tickets -- matching the pattern already
-- used for orders/returns.
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Run. Safe to re-run.
-- ============================================================================

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table support_tickets enable row level security;

drop policy if exists "support_tickets_owner_or_admin_select" on support_tickets;
create policy "support_tickets_owner_or_admin_select" on support_tickets for select
  using (is_admin() or auth.uid() = user_id or email = (auth.jwt() ->> 'email'));

drop policy if exists "support_tickets_open_insert" on support_tickets;
create policy "support_tickets_open_insert" on support_tickets for insert with check (true);

drop policy if exists "support_tickets_admin_update" on support_tickets;
create policy "support_tickets_admin_update" on support_tickets for update
  using (is_admin()) with check (is_admin());

drop policy if exists "support_tickets_admin_delete" on support_tickets;
create policy "support_tickets_admin_delete" on support_tickets for delete using (is_admin());

-- Audit trail (reuses the log_audit_event() function from 0001)
drop trigger if exists trg_audit_support_tickets on support_tickets;
create trigger trg_audit_support_tickets after insert or update or delete on support_tickets
  for each row execute function log_audit_event();

-- Admin notification on new ticket (reuses admin_notifications from 0001)
create or replace function notify_new_support_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into admin_notifications (type, severity, message)
  values (
    'new_support_ticket',
    'info',
    'New support ticket from ' || new.name || ': ' || new.subject
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_support_ticket on support_tickets;
create trigger trg_notify_new_support_ticket after insert on support_tickets
  for each row execute function notify_new_support_ticket();
