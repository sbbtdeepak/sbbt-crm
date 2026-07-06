create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_id_idx
  on public.project_images (project_id);

alter table public.project_images enable row level security;

create policy "Authenticated users can read project images"
  on public.project_images
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert project images"
  on public.project_images
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update project images"
  on public.project_images
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete project images"
  on public.project_images
  for delete
  to authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('projects', 'projects', true)
on conflict (id) do update
set public = excluded.public;

create policy "Authenticated users can upload project files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'projects');

create policy "Anyone can view project files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'projects');

create policy "Authenticated users can delete project files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'projects');

create policy "Authenticated users can update project files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'projects')
  with check (bucket_id = 'projects');
