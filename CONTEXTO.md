# Contexto del proyecto QuesoWeb

> Este archivo es para que, en una próxima conversación, el usuario solo diga
> "lee CONTEXTO.md" y Claude tenga todo el panorama sin volver a preguntar.
> Cómo está organizado el código: `docs/ARQUITECTURA.md`.

**Última actualización: 2026-10-11.**

## 📍 Dónde quedamos (retomar desde aquí)

- **Producción** (`main`): la web está desplegada en Vercel
  (`https://cheese-web-phi.vercel.app`, repo `https://github.com/DekuBot22/CheeseWeb`).
  Supabase y el bot de Telegram ya existen y funcionan.
- **Rediseño del panel `/admin` ("El Cuaderno")**, reestructura de carpetas por
  funcionalidad y correcciones de contabilidad (ver abajo): ya está en `main` y
  desplegado.
- **Rama `animaciones` (2026-10-11, sin commitear ni desplegar):** 7 animaciones
  del panel, sutiles y baratas (hoja que sube/entra, aviso de "guardado" tras
  abono/compra en hojas, respuesta al pulsar, barrita de carga en filtros y
  pestañas, fundido esqueleto→contenido, mensajes en línea, color suave en
  insignias). CSS puro, sin dependencias; detalle, tokens, lo que NO se hace y
  movimiento reducido en `docs/ARQUITECTURA.md` (sección "Movimiento del panel").
  Falta probar en el teléfono (Xiaomi Poco X8 Pro): teclado + hoja del abono y la
  opción "Quitar animaciones".
- **Descuentos, precio por libra e ícono (2026-10-11, ya en `main` y desplegado;
  la migración 004 ya está corrida en Supabase):**
  1. **Descuentos del proveedor** en Compras (nota crédito: queso salado, mal
     estado, faltante, otro). Bajan el saldo con el proveedor y el costo real de
     su semana; la compra original no se toca. Tabla nueva `provider_discounts`.
     ⚠️ **ANTES de desplegar, el dueño debe correr
     `supabase/migrations/004_descuentos_proveedor.sql` en el SQL Editor de
     Supabase.** Si se despliega antes, nada se rompe (las lecturas devuelven
     vacío y guardar da un aviso claro), pero la función no sirve.
  2. **Precio por libra** en Ajustes: el dueño edita precio y costo por LIBRA, ve
     en vivo su ganancia por libra (13.000 − 11.000 = 2.000) y el kilo como
     estimado. La base sigue guardando por kg. Nueva métrica "ganancia por libra"
     real en Ganancias, Inicio y el libro semanal.
  3. **Ícono nuevo** ("cuña contable": queso con renglones de cuaderno y doble
     raya de total) y favicon simplificado; service worker en `cuaderno-v2`.
  4. Se corrigió un error de validación de campos opcionales que ya estaba en
     producción (ver abajo).
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
6. **Error de zod 4 corregido (rama `descuentos-libra-icono`):** un campo opcional
   escrito como `z.unknown().transform(...)` rechaza la clave cuando FALTA en el
   JSON ("expected nonoptional"), y los formularios omiten los campos vacíos. Esto
   rompía compras sin descripción, pagos al proveedor sin método/nota y abonos sin
   método. Regla: `.optional()` antes de `transform` (ver `lib/zod-helpers.ts` y
   `features/purchases/schemas.regression.test.ts`).

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
   es lo comprado **menos los descuentos del proveedor** (costo neto, nunca
   negativo); si no, kg × costo por kg estimado. Un descuento en una semana SIN
   compras no se resta del estimado (solo baja el saldo, con aviso en Ganancias).
   Saldo con el proveedor = comprado − descontado − pagado.
10. **El dueño piensa por libra:** Ajustes edita precio y costo por libra; se
    guarda por kg (`perLbToPerKg`, exacto con 1 kg = 2 lb).
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

`supabase/migrations/` (001 base, 002 compras al proveedor, 003 índices, 004
descuentos del proveedor) y `supabase/schema.sql` consolidado. Tablas:
`settings` (fila única), `clients`, `orders`, `payments`, `purchases`,
`provider_payments`, `provider_discounts`. RLS activado sin
políticas públicas (todo pasa por la service role desde el servidor).
**Regla:** cada cambio de esquema = migración nueva + `schema.sql` actualizado.

## Funcionalidad

- **Pública `/`:** formulario por cantidad o por valor, botón de WhatsApp
  (número en `src/features/storefront/constants.ts`).
- **Panel:** Inicio (resumen), Pedidos (filtros en la URL), Clientes, Compras
  (libro del proveedor con compras, pagos y descuentos), Ganancias (semana / 12
  semanas / todo, gráficas, ganancia por libra, Excel), Ajustes (precio y costo
  por libra, instalación en el teléfono).

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
