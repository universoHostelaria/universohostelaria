-- ═══════════════════════════════════════════════════════
-- UNIVERSO HOSTELERÍA — Supabase Schema v1.0
-- Run this in Supabase SQL Editor (supabase.com > SQL Editor)
-- ═══════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- SUPPLIERS
create table if not exists suppliers (
  id          text primary key,
  name        text not null,
  logo_url    text,
  website     text,
  description text,
  created_at  timestamptz default now()
);

insert into suppliers (id, name, description) values
  ('tilia_romero', 'Tilia · Romero', 'Fabricante europeo de mobiliario para hostelería. Certificado CATAS.'),
  ('arkimueble',   'Arkimueble',     'Especialista en mobiliario de exterior y outdoor para hostelería.'),
  ('romero',       'Romero',         'Fabricante de mobiliario interior para restaurantes y hoteles.')
on conflict (id) do nothing;

-- PRODUCTS
create table if not exists products (
  id               text primary key,
  supplier_id      text references suppliers(id),
  name             text not null,
  category         text,
  uso              text,
  material         text,
  features         text,
  dimensions_raw   text,
  weight_kg        text,
  price            numeric(10,2),
  price_display    text,
  is_new           boolean default false,
  catas_certified  boolean default false,
  img_url          text,
  cod_interno      text,
  cod_comercial    text,
  alto_asiento     text,
  modelo           text,
  source           text,
  active           boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_products_category  on products(category);
create index if not exists idx_products_supplier  on products(supplier_id);
create index if not exists idx_products_uso       on products(uso);
create index if not exists idx_products_material  on products(material);
create index if not exists idx_products_price     on products(price);
create index if not exists idx_products_is_new    on products(is_new);
create index if not exists idx_products_active    on products(active);
create index if not exists idx_products_name      on products(name);

-- ROW LEVEL SECURITY
alter table products   enable row level security;
alter table suppliers  enable row level security;

create policy "Public read products"  on products  for select using (active = true);
create policy "Public read suppliers" on suppliers for select using (true);

-- CITA REQUESTS
create table if not exists cita_requests (
  id          uuid primary key default uuid_generate_v4(),
  name        text,
  email       text,
  phone       text,
  company     text,
  message     text,
  product_id  text references products(id),
  status      text default 'pending',
  created_at  timestamptz default now()
);
alter table cita_requests enable row level security;
create policy "Anyone can insert cita" on cita_requests for insert with check (true);

-- PEDIDO REQUESTS
create table if not exists pedido_requests (
  id          uuid primary key default uuid_generate_v4(),
  name        text,
  email       text,
  phone       text,
  company     text,
  product_id  text references products(id),
  quantity    int default 1,
  color       text,
  notes       text,
  status      text default 'pending',
  created_at  timestamptz default now()
);
alter table pedido_requests enable row level security;
create policy "Anyone can insert pedido" on pedido_requests for insert with check (true);

-- ── ORDERS (solicitudes de pedido) ──────────────────────────────
-- Drop old pedido_requests and replace with full orders table
create table if not exists orders (
  id                  uuid primary key default uuid_generate_v4(),
  -- Empresa
  empresa_nombre      text not null,
  empresa_cif         text,
  empresa_direccion   text,
  empresa_ciudad      text,
  empresa_cp          text,
  -- Responsable
  contacto_nombre     text not null,
  contacto_email      text not null,
  contacto_telefono   text,
  -- Productos (JSON array)
  items               jsonb not null,  -- [{product_id, name, qty, color, price, subtotal}]
  total_estimado      numeric(10,2),
  -- Estado
  status              text default 'pending',  -- pending | contacted | quoted | closed
  notas               text,
  created_at          timestamptz default now()
);

alter table orders enable row level security;
create policy "Anyone can insert order" on orders for insert with check (true);
-- Only authenticated (admin) can read orders
create policy "Auth can read orders" on orders for select using (auth.role() = 'authenticated');
