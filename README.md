# 🧀 QuesoWeb — Pedidos de Queso

Web sencilla para que tus clientes hagan pedidos de queso (en kg o lb) y a ti
te llegue el aviso al instante por Telegram. Tú controlas el precio desde un
panel de administrador antes de compartir el enlace.

- **`/`** — página pública donde el cliente escribe su nombre, elige kg o lb,
  pone la cantidad y ve el total calculado con el precio del día.
- **`/admin`** — panel privado (con contraseña) donde cambias el precio por
  kg y ves/gestionas los pedidos.

Tecnologías: Next.js 16 + TypeScript + Tailwind CSS (gratis en Vercel) y
Supabase (base de datos Postgres gratis) + notificaciones por Telegram.

## 1. Crear la base de datos (Supabase)

1. Ve a [supabase.com](https://supabase.com), crea una cuenta gratis y un
   proyecto nuevo (elige una contraseña de base de datos y guárdala).
2. Dentro del proyecto, ve a **SQL Editor > New query**, pega todo el
   contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql) y
   dale **Run**. Esto crea las tablas `settings` (precio) y `orders`
   (pedidos), con un precio inicial de ejemplo ($20.000/kg) que luego
   cambias desde el panel.
3. Ve a **Project Settings > API** y copia:
   - **Project URL** → será `SUPABASE_URL`
   - **service_role key** (no la `anon` key) → será `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ La `service_role key` es secreta: nunca la subas a un repositorio
   público ni la pongas en código del navegador. Solo va en variables de
   entorno del servidor.

## 2. Crear el bot de Telegram (para recibir avisos)

1. En Telegram, busca **@BotFather** y envíale `/newbot`. Sigue las
   instrucciones (nombre y usuario del bot) y te dará un **token** — será
   `TELEGRAM_BOT_TOKEN`.
2. Escríbele cualquier mensaje a tu bot recién creado (por ejemplo "hola").
3. Abre en el navegador, reemplazando `<TOKEN>` por tu token:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Busca en el JSON el campo `"chat":{"id":...}` — ese número es
   `TELEGRAM_CHAT_ID`.

## 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...        # la contraseña para entrar a /admin
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

## 4. Probar en tu computador

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) (pedido de cliente) y
[http://localhost:3000/admin](http://localhost:3000/admin) (panel, pide la
contraseña `ADMIN_PASSWORD`).

## 5. Publicar gratis en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com), **Add New > Project**, importa el
   repositorio.
3. En **Environment Variables**, agrega las mismas 5 variables del paso 3
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`,
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
4. Dale **Deploy**. Cuando termine, tu web pública queda en algo como
   `https://tu-proyecto.vercel.app` — ese es el enlace que compartes con tus
   clientes. El panel queda en `https://tu-proyecto.vercel.app/admin`.

## Uso diario

1. Antes de compartir el link (por WhatsApp, redes, etc.), entra a
   `/admin`, actualiza el precio por kg y guarda. La fecha de actualización
   se registra sola.
2. Comparte el link de la página principal con tus clientes.
3. Cada pedido te llega al instante por Telegram y queda guardado en
   `/admin`, donde puedes marcarlo como "completado" cuando lo despaches.

## Notas

- Los precios se muestran en pesos colombianos (COP). Si necesitas otra
  moneda, cambia `formatCOP` en `src/lib/constants.ts`.
- La conversión kg ↔ lb usa el estándar 1 lb = 0.45359237 kg.
- Si algún día quieres cambiar la contraseña del panel, solo actualiza
  `ADMIN_PASSWORD` en Vercel (y en `.env.local` si pruebas localmente); las
  sesiones anteriores dejan de funcionar automáticamente.
