# 🧀 QuesoWeb — Pedidos y contabilidad de queso

Dos cosas en una sola web:

- **`/`** — página pública donde el cliente escribe su nombre, elige el tipo de
  queso (duro/semi/blando) y el nivel de sal, y pide **por cantidad** (kg o lb)
  **o por valor en pesos**. Ve el total con el precio del día y puede pedir
  también por WhatsApp. A ti te llega el aviso al instante por Telegram.
- **`/admin`** — "El Cuaderno": el panel privado (con contraseña) para llevar la
  contabilidad del negocio. Seis secciones:
  - **Inicio**: ganancia de la semana, vendido, cobrado, cuánto te deben y cuánto
    le debes al proveedor, comparación con la semana anterior, quién te debe y
    pedidos pendientes. Accesos rápidos para registrar una **venta**, un abono o
    una compra. Las gráficas están aparte (botón "Ver gráficas").
  - **Pedidos**: lista con filtros (cliente, estado, pago, período, anulados),
    marcar pedidos como listos, registrar abonos y ventas, y desde **Más**:
    ver los abonos, **editar** el pedido o **anularlo**.
  - **Clientes**: se crean solos con cada pedido; deuda, saldo a favor,
    antigüedad de la deuda, historial y datos de contacto.
  - **Compras**: compras, pagos y **descuentos** del proveedor (p. ej. un queso
    que llegó muy salado y hubo que venderlo más barato), con el "libro del
    proveedor" y su saldo acumulado. Un descuento baja lo que le debes y el costo
    de esa semana; la compra original no se modifica.
  - **Ganancias**: por semana (sábado a viernes), 12 semanas o todo el tiempo,
    con ganancia por libra, libro semanal y descarga a Excel. Sus gráficas viven
    en **Ganancias → Gráficas** (8, 12 o 26 semanas, kilos y antigüedad de la deuda). El costo usa las compras
    reales de cada semana (menos los descuentos); si no hay, usa el costo
    estimado.
  - **Ajustes**: precio de venta y costo **por libra** (muestra en vivo cuánto
    ganas por libra), **respaldo** y cómo instalar la app.

**Anular es definitivo:** pedidos, abonos, compras, pagos y descuentos no se
borran; se anulan con un motivo, dejan de contar en todo y quedan a la vista
(en el Excel, hoja "Anulados"). Para corregir algo: se anula y se registra de
nuevo (los pedidos además se pueden editar).

**Respaldo:** cada noche (~11 p. m. hora de Colombia) llega a tu Telegram un JSON
con todas las tablas (para restaurar) y el Excel de todo el tiempo. En Ajustes
hay un botón "Enviar respaldo ahora".

Tecnologías: Next.js 16 + TypeScript + Tailwind CSS (gratis en Vercel),
Supabase (Postgres gratis) y Telegram para los avisos.

Si vas a tocar el código, lee antes [`docs/ARQUITECTURA.md`](./docs/ARQUITECTURA.md).

## 1. Crear la base de datos (Supabase)

1. Crea una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto
   nuevo (guarda la contraseña de la base de datos).
2. En **SQL Editor > New query**:
   - **Base nueva:** pega todo [`supabase/schema.sql`](./supabase/schema.sql) y
     dale **Run**. Crea todas las tablas (`settings`, `clients`, `orders`,
     `payments`, `purchases`, `provider_payments`, `provider_discounts`) y sus
     índices.
   - **Base que ya estaba en marcha:** corre solo las migraciones que te falten
     de [`supabase/migrations/`](./supabase/migrations), en orden
     (`001_base`, `002_compras_proveedor`, `003_indices`,
     `004_descuentos_proveedor`, `005_anular_editar_limites`). Son idempotentes.
     **Corre la 004 antes de usar los descuentos del proveedor** y **la 005
     antes de usar anular/editar** (sin ellas el panel funciona y avisa qué
     falta). La 005 también hace atómico el abono y activa los límites del
     formulario público.
3. En **Project Settings > API** copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (no la `anon`) → `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ La `service_role key` es secreta: solo va en variables de entorno del
   servidor, nunca en el navegador ni en un repositorio público.

## 2. Crear el bot de Telegram (para recibir avisos)

1. En Telegram, escríbele a **@BotFather** `/newbot` y sigue los pasos: te da un
   **token** → `TELEGRAM_BOT_TOKEN`.
2. Escríbele un mensaje cualquiera a tu bot.
3. Abre `https://api.telegram.org/bot<TOKEN>/getUpdates` y busca
   `"chat":{"id":...}` → ese número es `TELEGRAM_CHAT_ID`.

Telegram es opcional: sin estas dos variables los pedidos se guardan igual, solo
que sin aviso.

## 3. Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...        # contraseña para entrar a /admin
TELEGRAM_BOT_TOKEN=...    # opcional
TELEGRAM_CHAT_ID=...      # opcional (necesarias para el respaldo diario)
CRON_SECRET=...           # solo en Vercel: 16+ caracteres al azar, protege el respaldo diario
ADMIN_AUTH=off            # opcional, SOLO en .env.local: panel sin contraseña en tu PC
```

**`ADMIN_AUTH=off` es solo para trabajar en tu computador.** Se ignora en
producción, en Vercel y si entras desde otro aparato (por la IP de tu red): ahí
siempre pide contraseña. **No la pongas en Vercel.** Mientras está activa no verás cierre de sesión (no hay sesión).

Si falta alguna obligatoria, el servidor lo dice al arrancar (con el nombre de
la variable, nunca su valor).

## 4. Probar en tu computador

```bash
npm install
npm run dev      # http://localhost:3000  y  http://localhost:3000/admin
```

Otros comandos:

| Comando | Para qué |
|---|---|
| `npm run build` | Compilar para producción (usa webpack: el build de Vercel no resuelve bien las fuentes con Turbopack). |
| `npm test` | Pruebas del dominio (semanas, contabilidad, deudas). |
| `npm run check` | Tipos + lint + pruebas. Córrelo antes de subir cambios. |

## 5. Publicar gratis en Vercel

1. Sube el proyecto a GitHub.
2. En [vercel.com](https://vercel.com): **Add New > Project** e importa el repo.
3. En **Environment Variables** agrega las mismas variables del paso 3.
4. **Deploy**. La web pública queda en `https://tu-proyecto.vercel.app` y el
   panel en `/admin`.

## 6. Instalar la app en el teléfono (sin tiendas)

El panel es una app instalable (PWA): ícono propio, pantalla completa y la sesión
abierta. Escribes la contraseña **una sola vez**; la sesión dura 400 días y se
renueva cada vez que entras. Funciona con la dirección de Vercel (necesita HTTPS).

**Android (Chrome):**
1. Abre `https://tu-proyecto.vercel.app/admin` e inicia sesión.
2. En **Ajustes → Instalar Cuaderno** (o menú ⋮ → *Instalar app*) → Instalar.
3. Abre «Cuaderno» desde el escritorio. Mantén pulsado el ícono para los accesos
   directos (Pedidos, Compras, Ganancias).

**iPhone (Safari, iOS 16.4 o posterior):**
1. Abre la dirección en **Safari** (no en Chrome).
2. Compartir → **Agregar a pantalla de inicio** → Agregar.
3. Abre «Cuaderno» desde el ícono e **inicia sesión dentro de la app** (la app
   instalada guarda sus cookies aparte de las de Safari).

Sin internet muestra una pantalla de "Sin conexión": no guarda datos financieros
en el teléfono. **Quien tenga tu teléfono desbloqueado ve la contabilidad.** Para
cerrar todas las sesiones, cambia `ADMIN_PASSWORD` en Vercel y vuelve a desplegar.
Los íconos se regeneran con `node scripts/generate-icons.mjs`.

## Uso diario

1. Entra a `/admin/ajustes` y actualiza el precio **por libra** (y el costo por
   libra, si quieres ver cuánto ganas y las ganancias estimadas) antes de
   compartir el enlace.
2. Comparte el link de la página principal con tus clientes.
3. Cada pedido te llega por Telegram y queda en **Pedidos**; márcalo como listo
   cuando lo despaches.
4. Cuando alguien pague (todo o una parte), usa **Abonar**. Si paga de más, el
   excedente queda como saldo a favor del cliente.
5. Cuando llegue el queso (los sábados) registra la compra en **Compras** y los
   pagos que le hagas al proveedor: así las ganancias usan el costo real. Si un
   queso llegó mal (muy salado, faltante…), registra un **descuento** con su
   motivo para bajar lo que le debes.
6. **Inicio** y **Ganancias** te dicen cómo va el negocio; las gráficas están en
   **Ganancias → Gráficas**.
7. Una venta por WhatsApp o en persona: **+ Venta** (Inicio o Pedidos). Si te
   equivocas: **Pedidos → Más → Editar / Anular**.

## Notas

- Los precios se muestran en pesos colombianos (COP); el formato está en
  `src/lib/format.ts`.
- **1 kg = 2 lb** (así se maneja en la región); el factor está en
  `src/domain/units.ts` y todos los totales dependen de él.
- La **semana de negocio** va de sábado 00:00 a viernes 23:59, siempre en hora de
  Colombia, porque el queso llega los sábados (`src/domain/week.ts`).
- Para cambiar la contraseña del panel, actualiza `ADMIN_PASSWORD` en Vercel (y
  en `.env.local`); las sesiones anteriores dejan de funcionar solas.
