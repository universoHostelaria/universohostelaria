-- Tabla de variantes (acabado × medida → precio sin IVA) por producto.
-- Editable desde el CMS. Ejecutar en Supabase > SQL Editor.
alter table products add column if not exists variants jsonb;
