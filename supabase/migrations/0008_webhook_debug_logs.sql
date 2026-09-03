-- Temporary debug aid: every dashboard/log-navigation attempt to see the webhook's real
-- error text has failed to surface it, so the webhook now writes its own failure straight
-- into this table (using the service-role client it already holds, which bypasses RLS on
-- insert). Public read is intentionally enabled so it can be queried directly with the
-- anon key for debugging, without needing the Supabase dashboard at all. This should be
-- dropped (or locked down) once the webhook is confirmed working.

create table if not exists webhook_debug_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  stage text,
  message text,
  detail text,
  created_at timestamptz not null default now()
);

alter table webhook_debug_logs enable row level security;
create policy "webhook_debug_logs_public_read" on webhook_debug_logs for select using (true);
