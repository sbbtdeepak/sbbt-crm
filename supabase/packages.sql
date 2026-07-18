-- Packages table for construction packages
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  price numeric not null,
  short_description text,
  description text,
  brands text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.packages enable row level security;

create policy "Authenticated users can read packages"
  on public.packages
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert packages"
  on public.packages
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update packages"
  on public.packages
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete packages"
  on public.packages
  for delete
  to authenticated
  using (true);

-- Package features table for accordion data from Excel
create table if not exists public.package_features (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  feature text not null,
  solid_structure text,
  essential text,
  premium text,
  custom text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

alter table public.package_features enable row level security;

create policy "Authenticated users can read package_features"
  on public.package_features
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert package_features"
  on public.package_features
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update package_features"
  on public.package_features
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete package_features"
  on public.package_features
  for delete
  to authenticated
  using (true);