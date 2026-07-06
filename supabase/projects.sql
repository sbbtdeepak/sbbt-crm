create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  cid text,
  package text check (
    package in ('Essential', 'Solid Structure', 'Premium Luxury', 'Custom')
  ),
  project_value numeric,
  plot_area text,
  road_facing text,
  floors integer,
  status text not null default 'planning' check (
    status in ('planning', 'ongoing', 'completed')
  ),
  rating numeric check (rating >= 0 and rating <= 5),
  location text,
  features text[] default '{}',
  timeline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Authenticated users can read projects"
  on public.projects
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert projects"
  on public.projects
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete projects"
  on public.projects
  for delete
  to authenticated
  using (true);
