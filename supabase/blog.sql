-- ═══════════════════════════════════════════════════════
-- UNIVERSO HOSTELERÍA — Blog
-- Execute no Supabase SQL Editor (ou via Management API).
-- ═══════════════════════════════════════════════════════

create table if not exists blog_posts (
  slug             text primary key,
  title            text not null,
  excerpt          text,
  content          text,               -- Markdown
  cover_image      text,
  category         text,               -- 'Guías', 'Consejos', ...
  author           text default 'Universo Hostelería',
  meta_title       text,
  meta_description text,
  keywords         text[],
  reading_min      int default 5,
  published        boolean default true,
  published_at     timestamptz default now(),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_blog_published on blog_posts(published, published_at desc);

alter table blog_posts enable row level security;

drop policy if exists "Public read published posts" on blog_posts;
create policy "Public read published posts"
  on blog_posts for select using (published = true);

drop policy if exists "Auth read all posts" on blog_posts;
create policy "Auth read all posts"
  on blog_posts for select using (auth.role() = 'authenticated');

drop policy if exists "Auth write posts" on blog_posts;
create policy "Auth write posts"
  on blog_posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
