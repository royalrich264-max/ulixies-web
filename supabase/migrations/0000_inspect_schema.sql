-- READ-ONLY. Does not change anything in your database.
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Copy the full result and send it back so the migration can be corrected
-- to match your real tables, columns, and relationships.

select
  t.table_name,

  (select jsonb_agg(jsonb_build_object(
      'column', c.column_name,
      'type', c.data_type,
      'nullable', c.is_nullable,
      'default', c.column_default
    ) order by c.ordinal_position)
   from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = t.table_name
  ) as columns,

  (select jsonb_agg(kcu.column_name)
   from information_schema.table_constraints tc
   join information_schema.key_column_usage kcu
     on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
   where tc.constraint_type = 'PRIMARY KEY' and tc.table_schema = 'public' and tc.table_name = t.table_name
  ) as primary_key,

  (select jsonb_agg(jsonb_build_object(
      'column', kcu.column_name,
      'references_table', ccu.table_name,
      'references_column', ccu.column_name
    ))
   from information_schema.table_constraints tc
   join information_schema.key_column_usage kcu
     on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
   join information_schema.constraint_column_usage ccu
     on tc.constraint_name = ccu.constraint_name and tc.table_schema = ccu.table_schema
   where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public' and tc.table_name = t.table_name
  ) as foreign_keys,

  (select relrowsecurity from pg_class where relname = t.table_name and relnamespace = 'public'::regnamespace) as rls_enabled

from information_schema.tables t
where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
order by t.table_name;
