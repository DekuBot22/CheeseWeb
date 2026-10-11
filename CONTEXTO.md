# Contexto del proyecto QuesoWeb

> Este archivo es para que, en una próxima conversación, el usuario solo diga
> "lee CONTEXTO.md" y Claude tenga todo el panorama sin volver a preguntar.
> Cómo está organizado el código: `docs/ARQUITECTURA.md`.

**Última actualización: 2026-10-11.**

## 📍 Dónde quedamos (retomar desde aquí)

- **Producción** (`main`): la web está desplegada en Vercel
  (`https://cheese-web-phi.vercel.app`, repo `https://github.com/DekuBot22/CheeseWeb`).
  Supabase y el bot de Telegram ya existen y funcionan.
- **Rama `rediseno-admin` (sin commitear, sin desplegar):** rediseño completo del
  panel `/admin` ("El Cuaderno") + reestructura de carpetas por funcionalidad +
  correcciones de contabilidad (ver abajo). `npm run check` y `npm run build`
  pasan. **Falta:** revisar las pantallas en el navegador con datos reales,
  hacer commit y fusionar a `main`.
- Pendientes del dueño: borrar los datos de prueba de Supabase (cliente "Prueba
  Claude" con un pedido, una compra de $900.000 y un pago de $500.000) y poner
  el precio real en `/admin/ajustes` (la web pública dice "El precio aún no ha
  sido configurado" hasta entonces).
- Se canceló la automatización de pedidos por chat con n8n. No retomarla.
- **Tema oscuro, auth local y app instalable (2026-10-11, también sin commitear):**
  tema "Bodega de curado" (negro cálido + oro ámbar) solo para `/admin`; el
  usuario pidió "sin contraseña por ahora" → `ADMIN_AUTH=off` en `.env.local`
  (solo localhost, ignorado en producción); sesión de 400 días renovable para el
  teléfono; PWA instalable (manifest, service worker, íconos, página sin
  conexión). **Falta:** que el usuario cambie `ADMIN_PASSWORD` en Vercel (la
  contraseña local ya se cambió), desplegar y probar la instalación en el
  teléfono. Detalle en `docs/ARQUITECTURA.md` (secciones Tema, Autenticación, PWA).

### Correcciones de contabilidad hechas en esta rama (cambian cifras de semanas pasadas)

1. La semana de negocio se calcula en **hora de Colombia** (antes usaba la hora
   del servidor: en Vercel es UTC y el corte caía el viernes a las 7 p. m.).
2. Una compra o pago al proveedor hecho el **sábado de llegada** ya no cuenta en
   dos semanas (el fin de semana es el viernes, no el sábado siguiente).
3. El **saldo con el proveedor** usa todas las compras y pagos, no solo los
   últimos 30.
4. Los totales de "todo el tiempo" y el **Excel** piden los datos por páginas
   (Supabase corta en 1000 filas y los números salían incompletos en silencio).
5. Las fechas que se muestran y el aviso de Telegram usan hora de Colombia.

## Qué es esto

Web para que los clientes de un negocio de queso (Colombia, dueño: Jorge) hagan
pedidos en línea. El dueño recibe el aviso por Telegram y gestiona precio,
clientes, pagos, compras al proveedor y ganancias desde `/admin`. Es el
proyecto hermano de **QueseriaApp** (escritorio, Python/Tkinter, en
`Escritorio\All\QueseriaApp\`).

- Ubicación: `C:\Users\jorge\Desktop\All\QuesoWeb\`.
- Stack: Next.js 16 (App Router) + TypeScript + Tailwind 4 + Supabase (solo
  servidor, service role) + Telegram + `exceljs` + zod + vitest.
- **`AGENTS.md` avisa que este Next tiene cambios incompatibles**: lee
  `node_modules/next/dist/docs/` antes de escribir código de Next. Ejemplos:
  `error.tsx` recibe `retry` (no `reset`), el middleware se llama `proxy.ts`,
  `params`/`searchParams` son `Promise`.
- `npm run build` usa `next build --webpack` (con Turbopack el build de Vercel
  falla al resolver `next/font/google`).

## Decisiones clave (con el porqué)

1. **Telegram** para avisos: gratis e instantáneo (opcional: sin token el pedido se guarda igual).
2. **Un solo precio por kg**; tipo de queso y sal son informativos. Todo se guarda con precio por kg.
3. **1 kg = 2 lb** (no 0.4536): así se maneja en la región (`src/domain/units.ts`).
4. **Semana de negocio = sábado 00:00 a viernes 23:59, hora de Colombia**
   (`src/domain/week.ts`): el queso llega los sábados.
5. **Clientes se crean solos** al llegar un pedido (nombre normalizado). Riesgo
   aceptado: variaciones del nombre duplican clientes; no hay UI para fusionar.
6. **Saldo a favor:** el excedente de un abono queda en `credit_balance`; no se
   descuenta solo del siguiente pedido.
7. **Pedido por valor:** el cliente puede pedir "$15.000 de queso"; se guardan
   los kg equivalentes (2 decimales) pero el total queda exacto. Límites $1.000 a $5.000.000.
8. **Costo real vs estimado:** si una semana tiene compras registradas, el costo
   es lo comprado; si no, kg × costo por kg estimado.
9. **Route handlers, no Server Actions**, y el dominio puro con pruebas
   (detalle y razones en `docs/ARQUITECTURA.md`).

## Estructura (resumen; mapa completo en `docs/ARQUITECTURA.md`)

- `src/app/` rutas finas · `src/features/<modulo>/{components,server,schemas.ts}`
  (auth, shell, storefront, orders, clients, purchases, settings, reports) ·
  `src/domain/` reglas puras + pruebas · `src/server/` env, db, http, errors,
  telegram · `src/ui/` sistema de diseño "El Cuaderno" · `src/lib/` utilidades.
- Paleta del panel (tokens `papel`, `hoja`, `linea`, `tinta`, `acento`, `debe`,
  `cobrado`, `aviso`, `serie-*`, `aging-*`) en `src/app/globals.css`: los valores
  **oscuros** van bajo `[data-theme="oscuro"]` (atributo en `src/app/admin/layout.tsx`);
  los de `:root` son reserva clara. No cambiar `:root` para oscurecer: la página
  pública comparte `--tinta`. Fuente IBM Plex Sans solo en `/admin`; títulos en
  Fraunces. La página pública conserva su paleta (`cuajada`, `corteza`, `curado`, `terracota`).
- Auth del panel: cookie HMAC derivada de `ADMIN_PASSWORD`, sin tabla de
  sesiones (`src/features/auth/server/session.ts`), **400 días y renovada en cada
  navegación**; protegida en `src/proxy.ts`. Reglas puras y modo local en
  `src/features/auth/auth-mode.ts`. Para revocar sesiones: cambiar `ADMIN_PASSWORD`.
- App instalable: `public/{cuaderno.webmanifest,sw.js,offline.html,icons/}`,
  `src/features/pwa/`, íconos con `node scripts/generate-icons.mjs`. El service
  worker nunca cachea `/api/*` ni HTML (datos financieros).

## Modelo de datos

`supabase/migrations/` (001 base, 002 compras al proveedor, 003 índices) y
`supabase/schema.sql` consolidado. Tablas: `settings` (fila única), `clients`,
`orders`, `payments`, `purchases`, `provider_payments`. RLS activado sin
políticas públicas (todo pasa por la service role desde el servidor).
**Regla:** cada cambio de esquema = migración nueva + `schema.sql` actualizado.

## Funcionalidad

- **Pública `/`:** formulario por cantidad o por valor, botón de WhatsApp
  (número en `src/features/storefront/constants.ts`).
- **Panel:** Inicio (resumen), Pedidos (filtros en la URL), Clientes, Compras
  (libro del proveedor), Ganancias (semana / 12 semanas / todo, gráficas, Excel),
  Ajustes (precio y costo).

## Mejoras pendientes / ideas

- Abono atómico (función SQL por RPC): hoy son 3 escrituras seguidas.
- Fusionar clientes duplicados; descontar el saldo a favor en el siguiente pedido.
- Foto real del negocio en vez del dibujo SVG de `CheeseWedge.tsx`.
- Tipos generados de Supabase (`supabase gen types`).
- Nuevos módulos (gastos, inventario): sigue "Cómo agregar un módulo" en `docs/ARQUITECTURA.md`.

## Notas para retomar

- Si el usuario dice "sigamos con QuesoWeb" o "CheeseWeb", es este proyecto.
- `.env.local` tiene credenciales reales: **nunca** commitearlo ni imprimir sus valores.
- Antes de dar algo por terminado: `npm run check && npm run build`.
