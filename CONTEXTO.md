# Contexto del proyecto QuesoWeb

> Este archivo es para que, en una próxima conversación, el usuario solo diga
> "lee CONTEXTO.md" (o "lee QuesoWeb\CONTEXTO.md") y Claude tenga todo el
> panorama sin tener que volver a explicar nada.

**Última actualización: 2026-09-04.**

## 📍 Dónde quedamos (retomar desde aquí)

Toda la app está **construida y funcionando localmente** (build de
producción probado, sin errores de tipos ni lint). Lo único que falta es
**desplegarla**, y ahí no se ha avanzado nada todavía — el usuario dijo que
seguía con esto "después". El siguiente paso al retomar es literalmente el
**paso 1** de la lista de pendientes más abajo: crear el proyecto de
Supabase. Nadie ha creado todavía ninguna cuenta/proyecto de Supabase ni el
bot de Telegram para este proyecto.

No hay código pendiente de escribir salvo que el usuario pida una función
nueva — lo que sigue es 100% configuración y despliegue (Supabase, Telegram,
variables de entorno, GitHub, Vercel), con los pasos exactos en la sección
"Estado actual" de este archivo y en `README.md`.

## Qué es esto

Web para que los clientes de un negocio de queso (Colombia, dueño: Jorge)
hagan pedidos en línea. El dueño recibe el aviso al instante por Telegram y
gestiona precio, clientes, pagos y ganancias desde un panel `/admin`.

Es un proyecto hermano de **QueseriaApp** (app de escritorio Python/Tkinter
en `Escritorio\All\QueseriaApp\QueseriaApp\`, contabilidad completa por
semanas con manejo de proveedor). QuesoWeb NO reemplaza esa app: es la cara
pública para tomar pedidos, con una versión "esencial" de la contabilidad
(ver decisiones abajo).

- **Ubicación**: `C:\Users\jorge\OneDrive - Universidad del Magdalena\Escritorio\QuesoWeb\`
- **Git**: inicializado localmente, varios commits. Aún **no subido a GitHub**.
- El usuario ya tiene cuentas de GitHub y Vercel (no hay que guiarlo a crearlas).

## Stack técnico

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres) — **solo se usa desde el servidor** con la
  `service_role key` (`src/lib/supabase.ts`). El navegador nunca habla
  directo con Supabase, todo pasa por route handlers de Next.
- Telegram Bot API para notificar pedidos nuevos (`src/lib/telegram.ts`)
- Auth del panel admin: cookie HMAC-SHA256 (Web Crypto, no Node `crypto`)
  derivada de `ADMIN_PASSWORD`, sin tabla de sesiones (`src/lib/auth.ts`).
  Protegido en `src/proxy.ts` (Next.js 16 renombró `middleware.ts` a
  `proxy.ts`; ya está migrado).
- Todo gratis: Vercel (hosting) + Supabase (DB, free tier).

## Decisiones clave tomadas (con el porqué)

1. **Notificación por Telegram**, no email/WhatsApp — el usuario lo eligió
   por ser gratis e instantáneo.
2. **Un solo precio por kg**, sin importar tipo de queso o nivel de sal — el
   usuario confirmó que el precio no varía por esas combinaciones; esos
   campos son solo informativos para que sepa qué preparar.
3. **Alcance de contabilidad "esencial"** (no portar TODO QueseriaApp): se
   le preguntó al usuario y se recomendó, y eligió, traer solo clientes +
   ventas con estado de pago/abonos + ganancias. Se dejó fuera a propósito:
   manejo de compras/inventario al proveedor (llegadas, pagos_prov) y el
   ciclo de cierre semanal — son back-office puro, no algo que encaje en un
   formulario web orientado al cliente.
4. **Clientes se crean solos**: no hay login de cliente. Al llegar un
   pedido, se busca un cliente por nombre normalizado (trim + lowercase) y
   si no existe se crea (`src/lib/clients.ts`, función
   `findOrCreateClient`). Riesgo aceptado: variaciones de escritura del
   mismo nombre crean clientes duplicados; el usuario puede fusionarlos
   manualmente si hace falta (no hay UI para fusionar todavía).
5. **Saldo a favor**: si un cliente abona más de lo que debe en un pedido,
   el excedente se guarda como `credit_balance` en su ficha de cliente
   (igual que el concepto `saldo_favor` de QueseriaApp). No se resta
   automáticamente del siguiente pedido — solo queda visible.

## Funcionalidad implementada (compila, pasa `tsc` y `eslint`, build de
producción probado con credenciales falsas)

### Página pública `/` (`src/app/page.tsx` + `src/components/OrderForm.tsx`)
Cliente escribe su nombre, elige **kg o lb**, **tipo de queso** (duro / semi
/ blando), **nivel de sal** (alto / intermedio / bajo), cantidad → ve precio
del día y total calculado en vivo → envía. `POST /api/orders`
(`src/app/api/orders/route.ts`) valida, busca/crea el cliente, calcula el
total con el precio vigente, guarda el pedido y notifica por Telegram.

### Panel `/admin` (contraseña = `ADMIN_PASSWORD`)
Layout con pestañas en `src/app/admin/(panel)/layout.tsx` +
`src/components/admin/AdminNav.tsx`. Login en `src/app/admin/login/page.tsx`
(fuera del grupo `(panel)`, sin nav).

- **Pedidos** (`/admin`, `src/app/admin/(panel)/page.tsx`):
  - `PriceEditor`: precio de venta por kg + costo por kg (opcional, para
    ganancias). Guarda con fecha automática.
  - `OrdersTable`: lista de pedidos, botón para marcar
    pendiente/completado (preparación), badge de estado de pago
    (debe/parcial/pagado) y botón **"Registrar abono"** que abre un mini
    formulario (monto + método) → `POST /api/admin/orders/[id]/payments`.
- **Clientes** (`/admin/clientes`, `/admin/clientes/[id]`):
  - Lista con buscador (`ClientsList`), muestra cuánto debe cada uno o su
    saldo a favor.
  - Detalle de cliente (`ClientEditor` para editar teléfono/notas +
    `OrdersTable` reutilizada mostrando solo los pedidos de ese cliente).
- **Ganancias** (`/admin/ganancias`): ingresos, cobrado, costo estimado y
  ganancia con margen %, filtrable por hoy / 7 días / 30 días / todo
  (`?rango=` en la URL).

## Modelo de datos (`supabase/schema.sql`)

- `settings` (fila única id=1): `price_per_kg`, `cost_per_kg`, `updated_at`
- `clients`: `name`, `name_key` (único, para find-or-create), `phone`,
  `notes`, `credit_balance`
- `orders`: `client_id`, `client_name`, `quantity`, `unit` (kg/lb),
  `cheese_type` (duro/semi/blando), `salt_level` (alto/intermedio/bajo),
  `price_per_kg_snapshot`, `cost_per_kg_snapshot`, `total`, `amount_paid`,
  `payment_status` (debe/parcial/pagado), `status` (pendiente/completado)
- `payments` (abonos): `order_id`, `amount`, `method`, `created_at`
- RLS activado en las 4 tablas, sin políticas públicas (todo pasa por la
  service role key desde el servidor).

## Estado actual: **NO desplegado**. Pendiente (pasos exactos en `README.md`)

1. Crear proyecto gratis en Supabase → correr `supabase/schema.sql` en el
   SQL Editor → copiar `Project URL` y `service_role key`.
2. Crear bot de Telegram con `@BotFather` → obtener `TELEGRAM_BOT_TOKEN` y,
   escribiéndole y consultando `getUpdates`, el `TELEGRAM_CHAT_ID`.
3. Copiar `.env.example` a `.env.local` y completar las 5 variables
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`,
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`). Probar con `npm run dev`.
4. Subir el repo a GitHub y conectarlo en Vercel, agregando las mismas 5
   variables de entorno ahí. Deploy → la URL de Vercel es lo que se
   comparte con los clientes; `/admin` es el panel.

## Notas para retomar

- Si el usuario dice "sigamos con QuesoWeb" o similar, ir directo al paso
  pendiente (probablemente el 1: crear el proyecto de Supabase).
- El proyecto ya fue probado con `npm run build` usando credenciales falsas
  en `.env.local` — compila limpio. Ese `.env.local` de prueba se borró al
  terminar (no debe quedar commiteado; `.gitignore` ya excluye `.env*`).
- Si se agregan más campos o tablas, actualizar tanto `supabase/schema.sql`
  como este archivo para que seguridad futura no se desalinee.
