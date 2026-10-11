# Arquitectura de QuesoWeb

Guía corta para saber **dónde va cada cosa** y **cómo agregar un módulo nuevo**.
Si eres una IA: lee esto antes de crear o mover archivos.

## Principios

1. **El dominio es puro.** Las reglas de dinero y semanas (`src/domain/`) no conocen React, Next ni Supabase. Por eso se prueban solas.
2. **Los datos entran por un solo sitio:** los repositorios (`*.repo.ts`). Nadie más llama a `db()`.
3. **Páginas y rutas solo orquestan:** validan → llaman a un caso de uso → responden. Sin cálculos.
4. **Sin barrels (`index.ts`).** Se importa siempre la ruta exacta; un barrel mezclaría código de servidor y de cliente.
5. **Nada especulativo.** Sin DTOs ni capas "por si acaso". Los tipos del dominio tienen la forma de la fila (snake_case).

## Mapa de carpetas

```
src/
├─ app/            Solo rutas: page, layout, loading, error, route. Componen features.
│  ├─ page.tsx                     /  (pedido público)
│  ├─ admin/login · admin/(panel)/ Inicio, pedidos, clientes, compras, ganancias, ajustes
│  └─ api/                         Route handlers finos (≤40 líneas)
├─ features/       Un módulo de negocio por carpeta
│  └─ <modulo>/
│     ├─ components/   UI del módulo (props en, JSX out; sin consultar la base)
│     ├─ server/       repos, casos de uso (get-*, create-*), todo con `import "server-only"`
│     └─ schemas.ts    validación con zod (segura en el cliente)
│     auth · shell · storefront · orders · clients · purchases · settings · reports · pwa
├─ domain/         Reglas puras + tipos de entidad. Las pruebas (*.test.ts) van al lado.
├─ server/         Infraestructura solo-servidor: env, db, http, errors, telegram
├─ ui/             Sistema de diseño "El Cuaderno" (sin negocio): Button, Card, DataTable, charts/…
├─ lib/            Utilidades genéricas y puras: cx, format, bogota-time, search-params, zod-helpers
├─ proxy.ts        Protege /admin y /api/admin (Next 16); renueva la sesión; modo local
public/            cuaderno.webmanifest · sw.js · offline.html · icons/ (app instalable)
scripts/           generate-icons.mjs + icons/*.svg (fuente de los íconos)
└─ instrumentation.ts  Valida las variables de entorno al arrancar el servidor
supabase/migrations/   001_base · 002_compras_proveedor · 003_indices · 004_descuentos_proveedor (en orden)
supabase/schema.sql    Foto consolidada para crear una base nueva
docs/ARQUITECTURA.md   Este archivo
```

## Reglas de dependencia

```
app ──► features ──► domain ──► lib
  │        ├────────► server ──► lib
  │        └────────► ui ─────► lib
  └──► ui, lib, domain      (app nunca importa @supabase ni @/server/db)
```

- `domain/` solo importa de `domain/` y `lib/`. ESLint lo bloquea.
- `ui/` y `lib/` no conocen el negocio: no importan `features`, `domain` ni `server`.
- `features/*/components/` nunca importa código de servidor: los datos llegan por props.
- Entre features: `reports` y `shell` son consumidores y pueden importar de cualquier feature base. Entre features base solo se comparten `server/*.repo.ts`, `schemas.ts` y componentes explícitos. Sin ciclos.

## Reglas con números

| Qué | Límite |
|---|---|
| Líneas por archivo | ideal ≤150, **máximo 250** (aviso de ESLint) |
| Líneas por componente o función | **≤100** (aviso de ESLint) |
| `page.tsx` / route handler | ≤80 / ≤40 líneas |
| Props por componente | ≤7 (con más, agrupa en un objeto) |
| Parámetros por función | ≤3 ideal, 4 máximo (aviso) |
| Anidación / complejidad | 3 / 15 (aviso) |
| Profundidad de carpetas bajo `src/` | ≤3 (`app/` exento: son rutas) |
| Componentes por archivo | 1 exportado; ayudantes privados ≤30 líneas (en `ui/` se permiten familias: `Card/CardHeader/CardBody`) |
| Extraer cuando… | se repite 3 veces · un bloque JSX >40 líneas con nombre propio · un `reduce/filter/sort` de negocio en una página (va a `domain/`) · una consulta fuera de un `.repo.ts` |

## Nombres

- URLs, textos y comentarios en **español**; identificadores, archivos y carpetas en **inglés**. Los valores guardados en la base van en español (`'debe'`, `'pendiente'`).
- Componentes: `PascalCase.tsx` con **export nombrado** (`default` solo donde Next lo exige: page, layout, route, error, loading, not-found).
- Módulos que no son componentes: `kebab-case.ts`. Datos: `<tabla>.repo.ts`. Casos de uso: `verbo-sustantivo.ts` (`create-order.ts`, `get-dashboard.ts`). Hooks: `use-algo.ts`.
- Constantes de módulo: `SCREAMING_SNAKE`. Tipos: `PascalCase`, sin prefijo `I`.
- `"use client"` solo en hojas con estado, efectos o eventos. Nunca en `page.tsx` ni `layout.tsx` (salvo `error.tsx`, que Next exige).

## Datos y API

- **Route handlers**, no Server Actions. Forma: `export const POST = handle(async (req) => { …parseJson → caso de uso → ok/created })`.
- Respuesta de error: `{ error: string }` con 400 (validación), 401 (sin sesión), 404, 500. Éxito: la clave que ya usan los componentes (`{ order }`, `{ purchase }`…).
- Errores: lanza `AppError` / `ValidationError` / `NotFoundError` (`server/errors.ts`); `handle()` los convierte en respuesta.
- Variables de entorno: solo con `env()` (`server/env.ts`, validado con zod). Nunca `process.env` suelto.
- **Abonos no atómicos:** `register-payment.ts` hace 3 escrituras seguidas (pago, pedido, saldo a favor). Si falla a la mitad o llegan dos abonos a la vez, el saldo puede quedar mal. Mejora pendiente: una función SQL llamada por RPC.
- Fechas y semanas: siempre hora de Colombia (`lib/bogota-time.ts`, `domain/week.ts`). La semana de negocio va de sábado a viernes.
- **Campos opcionales con zod 4:** `z.unknown().transform(...)` rechaza la clave si FALTA en el JSON ("expected nonoptional"). Escribe `z.unknown().optional().transform(...)` (o usa `optionalText`); los formularios omiten los campos vacíos. Hay pruebas de regresión en `features/purchases/schemas.regression.test.ts`.
- **Tabla que puede no existir (`provider_discounts`, migración 004):** sus lecturas pasan por `orEmptyIfMissing` (`provider-discounts.repo.ts`), que usa `isMissingTableError` (`server/db.ts`) y devuelve vacío en vez de romper la pantalla; guardar responde 503 con el mensaje de "corre la migración 004". Úsalo como patrón al desplegar código antes que el SQL.
- **Descuentos del proveedor:** `domain/accounting.ts` (`computeStats` recibe `discounts` como 4.º parámetro: costo neto = compras − descuentos, nunca negativo; sin compras no se resta del estimado) y `domain/provider-ledger.ts` (saldo = comprado − descontado − pagado; `remainingForDiscount` da el tope por compra).
- **Precios por libra:** la base guarda por kg; la pantalla de Ajustes edita por libra y convierte con `perLbToPerKg`/`perKgToPerLb` (`domain/units.ts`) antes de enviar. `domain/pricing.ts`: `unitProfit` (ganancia y margen por unidad) y `profitPerLb` (ganancia real ÷ libras vendidas).

## Tema oscuro del panel ("Bodega de curado")

- Los tokens (colores, sombras) viven en `src/app/globals.css`: los claros en `:root` (reserva) y los **oscuros solo bajo `[data-theme="oscuro"]`**. El atributo se pone en el `div.admin-root` de `src/app/admin/layout.tsx`.
- **No cambies los valores de `:root` para oscurecer el panel**: la página pública comparte `--tinta` y se rompería. Un tema nuevo = otro bloque `[data-theme="..."]` con los **mismos nombres de token** y el atributo en el layout; ningún componente cambia.
- Los componentes usan solo clases de token (`bg-hoja`, `text-tinta-2`, `bg-acento`, `text-sobre-acento`…). Nada de hex, `zinc-*`, `bg-white` ni `text-white` dentro de `ui/`, `features/` y `app/admin` (excepto `backdrop:bg-black/70` del `Sheet`, porque `::backdrop` no hereda bien las variables).
- Gráficas: series `serie-1/2/3` y `serie-1-claro`; antigüedad de deuda `--aging-1..4`. Si cambias una paleta, valida contraste (≥4.5:1 texto, ≥3:1 UI) y daltonismo.

## Autenticación

- Cookie `queso_admin_session` = HMAC de `ADMIN_PASSWORD` (sin tabla de sesiones). **Dura 400 días** (el máximo del navegador) y `proxy.ts` la **renueva en cada navegación** de `/admin`: quien entra una vez queda con la sesión abierta mientras la use al menos una vez al año. Atributos: `httpOnly`, `secure` en producción, `sameSite=lax`. Comparaciones en tiempo constante.
- Reglas puras en `src/features/auth/auth-mode.ts` (con pruebas). Cerrar todas las sesiones: cambiar `ADMIN_PASSWORD` en Vercel y volver a desplegar.
- **Modo local sin contraseña:** `ADMIN_AUTH=off` en `.env.local`. Solo se apaga la auth si se cumplen **las cuatro** a la vez: valor exacto `off`, `NODE_ENV` distinto de `production`, sin variable `VERCEL`, y la petición llega por `localhost`/`127.0.0.1`/`::1` (se mira la cabecera `Host` y `x-forwarded-host` reales; `request.nextUrl` no sirve porque Next lo normaliza). No existe ninguna variable que lo permita en producción. Mientras está activo se ve la franja "Sin contraseña (modo local)" y se oculta "Cerrar sesión".
- `proxy.ts` pasa el estado al layout con la cabecera de petición `x-admin-auth` (la borra siempre antes, para que un cliente no la invente).

## App instalable (PWA)

- `public/cuaderno.webmanifest` (solo se enlaza desde `/admin`: la página pública no es instalable), `public/sw.js`, `public/offline.html`, `public/icons/*.png`.
- **Service worker** (`public/sw.js`): nunca cachea `/api/*`, HTML ni peticiones RSC; solo `/_next/static/`, `/icons/` y `offline.html`. Sin internet muestra la página "Sin conexión". No hay cola de envíos (evita abonos duplicados). Se registra solo en producción (`features/pwa/components/ServiceWorkerRegister.tsx`). Si cambias íconos u `offline.html`, sube `VERSION` en `sw.js`.
- **Íconos:** fuente en `scripts/icons/*.svg`; se regeneran con `node scripts/generate-icons.mjs` (usa `sharp`, que ya viene con Next) y los PNG se suben al repo. El build no depende de `sharp`.
- **Instalación:** tarjeta en `/admin/ajustes` (`features/pwa/components/InstallCard.tsx`); el aviso de Android (`beforeinstallprompt`) lo guarda `features/pwa/install-prompt-store.ts`.
- Cabeceras (`next.config.ts`): `sw.js` sin caché, manifest, íconos 7 días, `/admin` y `/api/admin` con `noindex`, `X-Frame-Options: DENY`.

## Pruebas

`npm test` (vitest). Solo para el dominio puro: son las reglas que mueven dinero. Corren con `TZ=Asia/Tokyo` a propósito: si algo depende de la zona del servidor, se rompe. Casos clave que ya están cubiertos: viernes 11 p. m. vs sábado 00:30 en Bogotá, compra del sábado de llegada que no se cuenta en dos semanas, 1 kg = 2 lb, abono con excedente.

`npm run check` = typecheck + lint + test. Córrelo antes de cada cambio grande, junto con `npm run build`.

## Cómo agregar un módulo (ejemplo: Gastos)

1. **SQL:** `supabase/migrations/004_gastos.sql` (tabla `expenses`: `id`, `expense_date date`, `category text check (…)`, `amount numeric(12,2) check (amount > 0)`, `notes`, `created_at`; índice por fecha; RLS activado). Actualiza `supabase/schema.sql` en el mismo cambio.
2. **Dominio:** `src/domain/expense.ts` con el tipo `Expense`, las etiquetas de categoría y las funciones puras (p. ej. `sumExpenses`), más `expense.test.ts`. Si los gastos deben restar de la ganancia, ese es un cambio de `computeStats` y de sus pruebas: decisión de negocio, hazlo a propósito.
3. **Validación:** `src/features/expenses/schemas.ts` (`createExpenseSchema`, con los helpers de `lib/zod-helpers.ts`).
4. **Datos:** `src/features/expenses/server/expenses.repo.ts` (`listExpenses`, `insertExpense`) y `get-expenses-overview.ts` para armar el modelo de la pantalla.
5. **API:** `src/app/api/admin/expenses/route.ts` con `handle` → `parseJson` → repo → `created`.
6. **UI:** `src/features/expenses/components/` (`ExpenseForm` con `"use client"` que llama a la API y hace `router.refresh()`, y `ExpensesTable` con `DataTable`).
7. **Página:** `src/app/admin/(panel)/gastos/page.tsx` (≤80 líneas, `export const dynamic = "force-dynamic"`), con `loading.tsx` si hace falta.
8. **Menú:** una línea en `src/features/shell/nav-items.ts`.
9. **Cierre:** actualiza `CONTEXTO.md` y `README.md`; corre `npm run check && npm run build`.
