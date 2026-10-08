# Coillector

**Del aceite al combustible.** PWA que conecta a pequeños vendedores de comida de CDMX con recolectores de aceite de cocina usado: el vendedor pide la recolección, el recolector la valida y confirma, y el pago (simulado) llega en segundos.

MVP del Sprint 2 · Proyecto académico, Universidad La Salle México · **Pagos simulados**.

## Arquitectura

```
 Celular (PWA Next.js 15 en Vercel)
   │  Supabase Auth (cookies, @supabase/ssr)
   │  PostgREST con RLS  ── insert solicitudes / confirmaciones, lectura de vistas
   ▼
 Supabase Postgres (RLS en todas las tablas)
   │  trigger AFTER INSERT en confirmaciones (pg_net)
   ▼
 Make ── importe = litros × $2.00 ──► API de pago simulada (estilo CoDi/SPEI)
   │
   └─► UPDATE confirmaciones: estado_pago = simulado_ok | error, importe_mxn, referencia_pago = SIM-<id>
         │
         ▼
 Supabase Realtime (postgres_changes, respeta RLS) ──► la PWA actualiza la pantalla sin recargar
```

- El frontend **solo** usa la publishable key y la sesión del usuario: toda la seguridad la da RLS.
- El frontend **nunca** llama a Make ni escribe `estado_pago`, `importe_mxn`, `referencia_pago` o `error_pago`.
- Realtime escucha las tablas `solicitudes` y `confirmaciones` y vuelve a consultar la vista `solicitudes_estado`. Hay polling de respaldo (2–3 s mientras un pago se procesa) por si el canal tarda.

## Rutas

| Ruta | Quién | Qué hace |
|---|---|---|
| `/` | público | Landing, métricas en vivo (`resumen_publico`), cuentas demo, instalar app |
| `/dashboard` | público | Métricas + litros por día; "Tus números" si hay sesión |
| `/login`, `/registro/vendedor`, `/registro/recolector` | público | Auth por rol |
| `/auth/callback` | público | Intercambia el código del correo de confirmación |
| `/vendedor`, `/vendedor/nueva`, `/vendedor/solicitud/[id]` | vendedor | Solicitudes, nueva solicitud, detalle con QR y línea de tiempo |
| `/recolector`, `/recolector/escanear`, `/recolector/historial` | recolector | Pendientes, escáner, historial |
| `/recolector/solicitud/[id]` | recolector (destino del QR) | Confirmar recolección y ver el pago en vivo |
| `/perfil` | con sesión | Editar datos, instalar app, cerrar sesión |
| `/qr` | público | QR de 1024 px del sitio para la portada del reporte |
| `/offline` | — | Página que muestra el service worker sin conexión |

`middleware.ts` refresca la sesión y manda a `/login?next=…` si no hay sesión; cada layout de rol verifica el rol en `users` desde el servidor.

## Correr en local

```bash
cp .env.example .env.local   # y completa los valores
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # build de producción (el service worker solo se registra en producción)
```

### Variables de entorno

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (pública; la seguridad la da RLS) |
| `NEXT_PUBLIC_SITE_URL` | Dominio público (QR y `emailRedirectTo`). Si falta, se usa el origen actual |
| `NEXT_PUBLIC_DEMO_PASSWORD` | Contraseña de las cuentas demo; si falta, se oculta en la landing |

`.env.production` trae los valores públicos por defecto para que un deploy funcione aunque falte alguna variable en Vercel; las variables definidas en Vercel tienen prioridad. **Nunca** pongas la secret/service key en el frontend.

Cuentas demo: `vendedor.demo@ejemplo.com` y `recolector.demo@ejemplo.com`.

## Despliegue en Vercel

1. Importa el repositorio en Vercel (framework: Next.js; región por defecto `iad1`, la misma que Supabase `us-east-1`).
2. Agrega las 4 variables de arriba en *Production* (`NEXT_PUBLIC_SITE_URL` = dominio de Vercel) y vuelve a desplegar: las `NEXT_PUBLIC_*` se incrustan en el build.
3. En Supabase → Authentication → URL Configuration: *Site URL* = el dominio y agrega `https://<dominio>/auth/callback` a *Redirect URLs*.

## Decisiones técnicas

- **UI:** Tailwind CSS v4 con la paleta como tokens CSS (modo claro principal y oscuro), componentes estilo shadcn/ui, lucide-react, sonner. Fuentes Space Grotesk (títulos y cifras) e Inter.
- **QR:** se generan localmente con `qrcode` (sin APIs externas).
- **Escáner:** `BarcodeDetector` nativo cuando existe (Android/Chrome) y **jsQR** como respaldo (iOS Safari). Se descartó `html5-qrcode` porque su decodificador no leía entre 5 % y 15 % de nuestros QR en pruebas (fallo determinista según el contenido), mientras que jsQR leyó el 100 % de los mismos códigos. Si la cámara no está disponible se puede escribir el código corto de 8 caracteres que aparece bajo el QR.
- **PWA:** `app/manifest.ts`, íconos 192/512/maskable y un service worker manual (`public/sw.js`): precachea `/offline` con sus estilos, red-primero para navegación, cache-primero para `/_next/static` y **nunca** intercepta peticiones a Supabase.
- **Errores:** los errores de Postgres/RLS se traducen a mensajes en español (`lib/errors.ts`) y las mismas reglas de la BD se validan antes en el cliente (`lib/validation.ts`).
