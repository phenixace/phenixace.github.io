create table if not exists public.page_visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  source_path text not null check (source_path = '/'),
  country_code text check (char_length(country_code) <= 3),
  region text check (char_length(region) <= 180),
  ip_hash text check (char_length(ip_hash) = 64)
);

create index if not exists page_visits_created_at_idx
  on public.page_visits (created_at desc);

create index if not exists page_visits_ip_hash_created_at_idx
  on public.page_visits (ip_hash, created_at desc)
  where ip_hash is not null;

alter table public.page_visits enable row level security;

revoke all on table public.page_visits from anon, authenticated;
grant select, insert on table public.page_visits to service_role;
grant usage, select on sequence public.page_visits_id_seq to service_role;

create or replace view public.page_visit_summary as
select
  count(*)::bigint as visit_count,
  nullif(count(distinct ip_hash), 0)::bigint as hashed_visitor_count,
  min(created_at) as first_visited_at,
  max(created_at) as last_visited_at
from public.page_visits;

create or replace view public.page_visit_locations as
select
  country_code,
  region,
  count(*)::bigint as visit_count,
  nullif(count(distinct ip_hash), 0)::bigint as hashed_visitor_count,
  max(created_at) as last_visited_at
from public.page_visits
group by country_code, region;

revoke all on table public.page_visit_summary from anon, authenticated;
revoke all on table public.page_visit_locations from anon, authenticated;
grant select on table public.page_visit_summary to service_role;
grant select on table public.page_visit_locations to service_role;
