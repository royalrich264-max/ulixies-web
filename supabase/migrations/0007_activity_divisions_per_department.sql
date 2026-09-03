-- Activity divisions were shared identically across every department (Men/Women/Kids/Sports),
-- keyed only by primary_category. The admin wants divisions scoped per department instead, so
-- adding one under Men no longer silently shows up under Women/Kids/Sports too.
--
-- Existing rows are cloned into all four departments first, so nothing disappears from any
-- department's dropdown/menu — from this point on, additions/deletions are department-specific.

alter table activity_divisions add column if not exists department text;

update activity_divisions set department = 'men' where department is null;

insert into activity_divisions (department, primary_category, name, sort_order)
select d.dept, a.primary_category, a.name, a.sort_order
from activity_divisions a
cross join (values ('women'), ('kids'), ('sports')) as d(dept)
where a.department = 'men'
on conflict do nothing;

alter table activity_divisions alter column department set not null;
alter table activity_divisions add constraint activity_divisions_department_check
  check (department in ('men', 'women', 'kids', 'sports'));

alter table activity_divisions drop constraint if exists activity_divisions_primary_category_name_key;
alter table activity_divisions add constraint activity_divisions_department_category_name_key
  unique (department, primary_category, name);
