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

alter table public.paper_clicks enable row level security;

revoke all on table public.paper_clicks from anon, authenticated;
grant select, insert on table public.paper_clicks to service_role;
grant usage, select on sequence public.paper_clicks_id_seq to service_role;
