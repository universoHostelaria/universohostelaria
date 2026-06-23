-- ═══════════════════════════════════════════════════════
-- UNIVERSO HOSTELERÍA — CMS Schema (Admin)
-- Execute no Supabase SQL Editor DEPOIS de schema.sql
-- ═══════════════════════════════════════════════════════

-- ── SITE CONTENT ────────────────────────────────────────
-- Conteúdo editável do site (home, navbar, footer, textos).
-- Cada linha = um bloco/seção, com um blob jsonb estruturado.
-- Ex.: key='home.hero' -> data={"title":"...","subtitle":"...","cta":"..."}
create table if not exists site_content (
  key         text primary key,          -- 'home.hero', 'navbar', 'footer', ...
  section     text,                       -- agrupador p/ o admin: 'home', 'global'
  label       text,                       -- nome amigável p/ exibir no admin
  data        jsonb not null default '{}'::jsonb,
  sort        int  default 0,             -- ordem de exibição no admin
  updated_at  timestamptz default now(),
  updated_by  uuid                        -- auth.uid() do último editor
);

create index if not exists idx_site_content_section on site_content(section);

alter table site_content enable row level security;

-- Público lê (o site renderiza a partir daqui)
drop policy if exists "Public read site_content" on site_content;
create policy "Public read site_content"
  on site_content for select using (true);

-- Admin (autenticado) escreve
drop policy if exists "Auth write site_content" on site_content;
create policy "Auth write site_content"
  on site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── ADMIN WRITE POLICIES: products / suppliers ──────────
-- schema.sql só dava SELECT público. Aqui liberamos escrita p/ admin.

drop policy if exists "Auth write products" on products;
create policy "Auth write products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Auth write suppliers" on suppliers;
create policy "Auth write suppliers"
  on suppliers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Admin lê produtos inativos também (a policy pública só mostra active=true)
drop policy if exists "Auth read all products" on products;
create policy "Auth read all products"
  on products for select
  using (auth.role() = 'authenticated');

-- ── ORDERS: admin pode atualizar status ─────────────────
drop policy if exists "Auth update orders" on orders;
create policy "Auth update orders"
  on orders for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── STORAGE: bucket de imagens do site ──────────────────
-- Cria bucket 'site-images' (público p/ leitura). Idempotente.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Garante que product-images existe e é público (caso não tenha sido criado na UI)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Leitura pública dos buckets de imagem
drop policy if exists "Public read images" on storage.objects;
create policy "Public read images"
  on storage.objects for select
  using (bucket_id in ('site-images', 'product-images'));

-- Admin faz upload/update/delete nesses buckets
drop policy if exists "Auth write images" on storage.objects;
create policy "Auth write images"
  on storage.objects for all
  using (auth.role() = 'authenticated' and bucket_id in ('site-images', 'product-images'))
  with check (auth.role() = 'authenticated' and bucket_id in ('site-images', 'product-images'));
