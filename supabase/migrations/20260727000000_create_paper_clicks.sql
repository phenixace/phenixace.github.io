create table if not exists public.paper_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  paper_title text not null check (char_length(paper_title) between 1 and 500),
  target_url text not null check (char_length(target_url) between 1 and 2000),
  source_path text not null check (char_length(source_path) between 1 and 500),
  country_code text check (char_length(country_code) <= 3),
  region text check (char_length(region) <= 180),
  city text check (char_length(city) <= 180),
  ip_hash text check (char_length(ip_hash) = 64)
);

create index if not exists paper_clicks_created_at_idx
  on public.paper_clicks (created_at desc);

create index if not exists paper_clicks_target_url_idx
  on public.paper_clicks (target_url);

create index if not exists paper_clicks_ip_hash_created_at_idx
  on public.paper_clicks (ip_hash, created_at desc)
  where ip_hash is not null;

alter table public.paper_clicks enable row level security;

revoke all on table public.paper_clicks from anon, authenticated;
grant select, insert on table public.paper_clicks to service_role;
grant usage, select on sequence public.paper_clicks_id_seq to service_role;

create or replace view public.paper_click_summary as
select
  paper_title,
  target_url,
  count(*)::bigint as click_count,
  nullif(count(distinct ip_hash), 0)::bigint as hashed_visitor_count,
  min(created_at) as first_clicked_at,
  max(created_at) as last_clicked_at
from public.paper_clicks
group by paper_title, target_url;

create or replace view public.paper_click_locations as
select
  country_code,
  region,
  city,
  count(*)::bigint as click_count,
  nullif(count(distinct ip_hash), 0)::bigint as hashed_visitor_count,
  max(created_at) as last_clicked_at
from public.paper_clicks
group by country_code, region, city;

revoke all on table public.paper_click_summary from anon, authenticated;
revoke all on table public.paper_click_locations from anon, authenticated;
grant select on table public.paper_click_summary to service_role;
grant select on table public.paper_click_locations to service_role;
