# CMS — Guía de configuración

Panel de administración en `/admin` para gestionar el sitio (productos, pedidos y,
en la Fase 2, el contenido de la home).

## 1. Variables de entorno (direnv)

Las claves viven en `.env.local` (ignorado por git). Cárgalas con direnv:

```bash
# Edita .env.local con tus valores (Supabase → Settings → API):
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_KEY   ← service_role (secreta)

direnv allow
```

## 2. Base de datos

En **Supabase → SQL Editor**, ejecuta (una vez):

```
supabase/cms.sql
```

Crea la tabla `site_content`, las políticas RLS para que el admin pueda escribir,
y los buckets de Storage (`site-images`, `product-images`).

## 3. Crear un usuario admin

En **Supabase → Authentication → Users → Add user**, crea tu usuario
(email + contraseña). Ese será el login del panel.

> Cualquier usuario autenticado tiene acceso de admin. No habilites el registro
> público (sign-up) en Supabase Auth, o restríngelo, para que solo existan los
> usuarios que tú crees manualmente.

## 4. Usar el panel

```bash
npm run dev
# → http://localhost:3000/admin
```

- **Productos** — crear, editar, subir fotos, activar/ocultar, eliminar.
- **Pedidos** — ver solicitudes recibidas.
- **Contenido (Home)** — editar todos los textos e imágenes de la home
  (hero, categorías, «por qué», especialista, proceso, footer…). Los cambios
  se publican al pulsar «Guardar».

## Imágenes de la home

Las 6 imágenes base64 que estaban incrustadas en `app/page.tsx` se migraron al
Storage (bucket `site-images`) con `scripts/migrate_home.mjs` (ya ejecutado).
La página ahora pesa ~13 KB en vez de 4,6 MB. No hace falta volver a correrlo.

> Nota: los textos con formato (títulos con la palabra en azul, saltos de línea)
> se editan como HTML — usa `<br/>` y `<span class="blue">…</span>`.
