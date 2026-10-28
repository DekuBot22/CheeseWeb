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
│  ├─ admin/login · admin/(panel)/ Inicio, pedidos, clientes, compras, ganancias (+ ganancias/graficas), ajustes
│  └─ api/                         Route handlers finos (≤40 líneas); api/cron/backup (cron de Vercel, fuera de /api/admin)
├─ features/       Un módulo de negocio por carpeta
│  └─ <modulo>/
│     ├─ components/   UI del módulo (props en, JSX out; sin consultar la base)
│     ├─ server/       repos, casos de uso (get-*, create-*), todo con `import "server-only"`
│     └─ schemas.ts    validación con zod (segura en el cliente)
│     auth · shell · storefront · orders · clients · purchases · settings · reports · weeks · pwa
├─ domain/         Reglas puras + tipos de entidad. Las pruebas (*.test.ts) van al lado.
├─ server/         Infraestructura solo-servidor: env, db, http, errors, telegram
├─ ui/             Sistema de diseño "El Cuaderno" (sin negocio): Button, Card, DataTable, charts/…
├─ lib/            Utilidades genéricas y puras: cx, format, bogota-time, search-params, zod-helpers
├─ proxy.ts        Protege /admin y /api/admin (Next 16); renueva la sesión; modo local
public/            cuaderno.webmanifest · sw.js · offline.html · icons/ (app instalable)
scripts/           generate-icons.mjs + icons/*.svg (fuente de los íconos)
└─ instrumentation.ts  Valida las variables de entorno al arrancar el servidor
supabase/migrations/   001_base · 002_compras_proveedor · 003_indices · 004_descuentos_proveedor · 005_anular_editar_limites · 006_nota_en_pedido · 007_aperturas_de_semana (en orden)
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
- **Abonos atómicos (migración 005):** `register-payment.ts` llama a la función SQL `register_payment` (`order-rpc.repo.ts`): bloquea el pedido, inserta el abono, recalcula `amount_paid`/`payment_status` y mueve el saldo a favor del cliente en UNA transacción. Si la función no existe (005 sin correr), cae al camino viejo de 3 escrituras sueltas.
- Fechas y semanas: siempre hora de Colombia (`lib/bogota-time.ts`). La regla base (`domain/week.ts`) es sábado a viernes; las semanas que se muestran salen del calendario con aperturas a mano (`domain/week-calendar.ts`, ver "Semanas abiertas a mano").
- **Campos opcionales con zod 4:** `z.unknown().transform(...)` rechaza la clave si FALTA en el JSON ("expected nonoptional"). Escribe `z.unknown().optional().transform(...)` (o usa `optionalText`); los formularios omiten los campos vacíos. Hay pruebas de regresión en `features/purchases/schemas.regression.test.ts`.
- **Excel y respaldo:** `getExportData` separa lo vigente (hojas de siempre más Abonos y Clientes) de lo anulado (hoja "Anulados", `voided-rows.ts`).
- **Tabla que puede no existir (`provider_discounts`, migración 004):** sus lecturas pasan por `orEmptyIfMissing` (`provider-discounts.repo.ts`), que usa `isMissingTableError` (`server/db.ts`) y devuelve vacío en vez de romper la pantalla; guardar responde 503 con el mensaje de "corre la migración 004". Úsalo como patrón al desplegar código antes que el SQL.
- **Ganancia y proveedor:** `domain/accounting.ts` (`computeStats`): ganancia = cobrado − costo de lo cobrado (`costOfPaid`: kg × costo por kg × fracción pagada, en pesos enteros). Compras, descuentos y pagos del proveedor **no entran en la ganancia**; solo mueven el saldo en `domain/provider-ledger.ts` (saldo = comprado − descontado − pagado; `remainingForDiscount` da el tope por compra).
- **Precios por libra:** la base guarda por kg; la pantalla de Ajustes edita por libra y convierte con `perLbToPerKg`/`perKgToPerLb` (`domain/units.ts`) antes de enviar. `domain/pricing.ts`: `unitProfit` (ganancia y margen por unidad) y `profitPerLb` (ganancia real ÷ libras vendidas).

## Anular y editar (migración 005)

- **Nunca se borra una fila.** `orders`, `payments`, `purchases`, `provider_payments` y `provider_discounts` tienen `voided_at` y `void_reason` (null = vigente; una restricción exige motivo de 3 a 300 letras cuando está anulada); `orders` suma `edited_at`. **Anular es definitivo** (no hay "restaurar"): para corregir se anula y se registra de nuevo; los pedidos además se editan.
- **Dominio:** `domain/void.ts` (`isVoided`, `activeOnly`). Toda suma pasa por `activeOnly` (`computeStats`, `weeklySeries`, `kgSold`, `receivables`, `buildClientRows`, `providerTotals`, `remainingForDiscount`); `buildLedger` incluye lo anulado marcado pero no mueve el saldo. `settleOrder`/`previewOrderEdit`/`saleTimestamp` en `domain/order.ts`. **`settleOrder` es el espejo en TypeScript de `sync_order_payment`/`order_credit_excess` en SQL: si cambias una regla, cambia las dos.**
- **Saldo a favor:** solo nace del excedente de abonos vigentes sobre el total (un pedido anulado cuenta como total 0). Cada operación (abonar, anular abono, anular pedido, editar) mide el excedente antes y después y mueve al cliente solo la diferencia. Si algún día se implementa "usar el saldo a favor", regístralo como un abono con método "saldo a favor", o este modelo se rompe.
- **Funciones SQL** (`register_payment`, `void_payment`, `void_order`, `edit_order`, `hit_limit`…): solo `service_role` puede ejecutarlas (se revocan a `public`/`anon`/`authenticated`). Errores de negocio con `raise exception 'codigo'`; `order-rpc.repo.ts` los traduce a mensajes en español. Compras, pagos y descuentos del proveedor se anulan con un `update … where voided_at is null` (`voidRow` en `server/db.ts`), que ya es atómico.
- **Código antes que SQL:** `hasVoidColumns()` (`server/db.ts`) prueba `select voided_at` y recuerda el "sí" siempre y el "no" 60 s. Mientras sea no, los repos no filtran y anular/editar responden 503 con "corre la migración 005". Mismo patrón que `orEmptyIfMissing` de la 004. Las consultas "ForStats" filtran en SQL (`voided_at is null`); las listas completas (`*InRange`, `list*`, historial del cliente, libro del proveedor) traen todo y el dominio separa.
- **Anular una compra** exige anular antes sus descuentos vigentes (`void-purchase.ts`). **Anular un pedido con abonos:** "devolví el dinero" (también se anulan sus abonos) o "dejarlo como saldo a favor".
- **UI:** `ui/ReasonForm.tsx` (motivo + sugerencias, genérico), `OrderDetailSheet` (ver abonos / editar / anular, un solo contenido que cambia de vista), `VoidMovementButton` en el libro del proveedor (la hoja solo se monta tras el primer clic).

## Semanas abiertas a mano (migración 007)

El queso no siempre llega el sábado, así que el dueño marca el día en que empieza cada semana.

- **Datos:** tabla `week_openings` (`start_date`, `note`, `voided_at`/`void_reason`; una apertura vigente por día) y la función SQL `move_week_opening` (anula la vieja y crea la nueva en una transacción). Nunca se borra: anular es definitivo.
- **Regla (`domain/week-calendar.ts`, pura):** cada semana va del día de su apertura al día antes de la siguiente, por DÍA en hora de Bogotá (pedidos por `created_at`; compras, pagos y descuentos por su fecha, sin traslapes). **Antes de la primera apertura vigente rige sábado→viernes**, recortada si la primera apertura cae a mitad de semana. Desde la primera apertura solo cuentan las manuales: si se olvida abrir una, la semana en curso se alarga (mínimo 7 días). No se abre con fecha futura ni antes de la última apertura.
- **Un solo calendario por página:** `getWeekCalendar` (`features/weeks/server`) lee las aperturas (cache de React) y arma `buildCalendar(fechas, ahora)`; todo consumidor usa `weekOf`, `currentWeek`, `previousWeek`, `lastWeeks`, `weeksSince`. `weeklySeries` recibe las semanas ya calculadas. `WeekPoint.days` lleva la duración. **Si la tabla no existe, la lista llega vacía y todo da lo de siempre** (`orEmptyIfMissing`); guardar responde 503 con el mensaje de la 007. La prueba `week-calendar.test.ts` compara el calendario sin aperturas contra el `weekRange` viejo durante años.
- **Avisos y atajos (`domain/week-hint.ts`, `domain/week-effect.ts`):** `openWeekHint` decide el aviso de Inicio ("¿Llegó el queso?": primera compra del día en una semana que no empezó hoy, o semana a mano de 6 días o más); la casilla "Llegó el lote" de Nueva compra manda `open_week` y `createPurchase` abre la semana tras guardar la compra (si la apertura falla, la compra queda y se devuelve `weekError`). `week-effect` calcula qué día-rango cambia de semana al abrir, mover o anular; `GET /api/admin/week-openings/effect` devuelve cuántos pedidos y compras pasan de una semana a otra y la hoja lo muestra antes de confirmar.
- **Pantallas:** Inicio (`WeekPrompt`, `PerDayNote`: comparación por día solo cuando la semana actual y la anterior duran distinto), Ajustes → Semanas (`WeeksCard`: calendario y lista, ver más abajo), duración (`weekTitle`) en libro semanal y gráficas. Excel: hoja "Semanas" y aperturas anuladas en "Anulados"; respaldo JSON: tabla `week_openings`.
- **Desde / hasta (`domain/week-range.ts`, pura):** solo se guarda la fecha de inicio de cada semana; **el "hasta" es el día en que llegó el queso siguiente** y ese día ya cuenta para la semana nueva (la semana termina el día anterior). Por eso nunca hay huecos ni traslapes. `planWeekRange(aperturas, {from, until, editingId}, hoy)` devuelve los pasos (insertar fechas o mover una apertura, en un orden que siempre pasa `move_week_opening`) o el error en español; el servidor (`saveWeekRange`, `POST /api/admin/week-openings/range`) vuelve a validar con la misma función. Ya se pueden crear y editar semanas en cualquier punto de la historia (también antes de la primera apertura); Inicio ("Abrir hoy") y Compras ("Llegó el lote") siguen con la regla estricta de "después de la última apertura". Sin migración nueva.
- **Vista previa general (`domain/week-effect.ts`):** `calendarChanges(antes, después, hoy)` compara día por día y agrupa los tramos que cambian de semana; `affectedWeeks` da las semanas que quedan tocadas ("Así quedan"). `GET .../effect?action=rango` suma pedidos, compras y movimientos del proveedor de esos tramos.
- **Solo las semanas marcadas se muestran (`markedWeeks`, `dropEmptyLead` en `week-calendar.ts`):** la lista de Ajustes empieza en la primera apertura (sin las automáticas de antes ni la "migaja" de 1 día entre sábado y la primera apertura). Ganancias, Gráficas y la hoja "Semanas" del Excel recortan las semanas automáticas **vacías** del principio (`isEmptyWeek`): las sumas no cambian, nunca se quita una semana con datos ni una marcada a mano, y la primera semana deja sin flecha "anterior". `weekOf` y las cifras de cada movimiento no se tocan. Si queda un día suelto antes de la primera semana (`strayDays`), el panel del calendario lo avisa y ofrece "Juntarlo a esta semana".
- **Calendario (Ajustes → Semanas, `WeekCalendar`):** cuadrícula mensual que empieza en sábado (`GRID_FIRST_DAY`, `domain/week-month.ts`: `monthGrid` pura con bandas por semana, color = índice de la apertura módulo 4). Tocar un día selecciona su semana (o crea una en un día sin semana); con una abierta, cada toque mueve el borde elegido (Inicio | Fin, `domain/week-draft.ts`) y las bandas muestran cómo quedaría (usa `plan.after`). `DraftPanel` muestra resumen, aviso de efecto (`EffectNotice compact`) y Guardar / Cancelar / Anular; nada se guarda sin confirmar. La lista (Editar/Anular por fila) es la otra pestaña. Todo con fechas AAAA-MM-DD y el `today` del servidor (sin `new Date()` en el cliente). Accesible: tabla `role="grid"`, foco itinerante (flechas, Inicio/Fin, RePág/AvPág, Esc cancela), `aria-label` por día y chips de leyenda con texto. Animaciones: solo `.aparece` y `transition-colors` ya existentes (respetan "Quitar animaciones").
- **No cambia la ganancia ni se normalizan montos por duración:** es plata real; una semana de 9 días muestra su duración y, en Inicio, la cifra por día.

## Semana elegida (todo el panel)

El dueño elige una semana una sola vez y Inicio, Pedidos, Clientes, Compras, Ganancias y Gráficas se ven "como esa semana". Sin migración ni API nueva.

- **Dónde vive:** SOLO en la URL, `?semana=AAAA-MM-DD` (primer día de la semana). Sin parámetro, inválido, futuro o de la semana actual = semana actual y URL limpia. Sin cookie a propósito: al abrir la app (la PWA arranca en `/admin`) siempre cae en la semana actual, así nadie registra algo creyendo que es hoy; recargar y "atrás" funcionan.
- **Dominio (`domain/week-scope.ts`, puro):** `resolveWeek(cal, valor)` → `{ week, isCurrent, param }`, `inWeek` (instantes) / `inWeekDate` (columnas `date`), `scopeOrders(pedidos, semana|null)`. `lib/week-param.ts`: `withWeekParam(href, semana)` conserva los demás parámetros y quita `semana` si es null. `scopeLedger` (`domain/provider-ledger.ts`) recorta el libro del proveedor DESPUÉS de armarlo, así el saldo acumulado de cada fila sigue siendo el real. Las pruebas comprueban que la deuda de los pedidos de una semana = vendido − cobrado de Ganancias, y que Inicio (2 semanas) y Ganancias (12) dan el mismo punto.
- **Selector (`features/shell/components`):** `WeekScopeProvider` (contexto cliente; lee la URL, porque el layout NO se vuelve a pintar al navegar) con `useWeekScope()` → `scope`, `hrefFor(semana)`, `withScope(href)`; `WeekScopeSidebar` (menú lateral, PC), `WeekScopeMobile` (botón en la barra superior + hoja con la lista de semanas), `WeekScopeBanner` (franja fija mientras se mira una semana pasada), `ScopedLink` y los enlaces del menú conservan la semana. El layout trae `getWeekScopeData` (`features/weeks/server`: calendario + primer día con movimientos, tope hacia atrás de la lista). Los componentes de servidor reciben `semana` por props y arman sus enlaces con `withWeekParam`; si un enlace pierde `semana`, cae en la semana actual (fallo seguro).
- **Qué cambia por pantalla:** *Inicio* (`getDashboard(semana)`) cifras de la semana frente a la anterior; en una semana pasada, deudores = pedidos de esa semana y lo que falta por cobrar de ellos HOY (no una foto histórica), pendientes de esa semana, sin aviso "¿Llegó el queso?"; **en la semana actual deudores y pendientes siguen siendo todo lo que se debe, como antes** (así no desaparece el fiado de semanas viejas). *Ganancias/Gráficas*: la vista "12 semanas" y las gráficas terminan en la semana elegida ("todo" siempre en la actual); la antigüedad de la deuda es la de esa semana. *Pedidos*: con una semana pasada manda ella y se oculta el filtro de período; en la actual quedan los filtros de siempre (todo). *Clientes*: solo quienes compraron esa semana y su deuda de esos pedidos (el saldo a favor es global); en la actual, todos. *Compras*: cifras de la semana y libro solo con sus movimientos (totales de la semana y "saldo al cierre"); el saldo con el proveedor de arriba es el de hoy.
- **Acciones en una semana pasada:** "+ Venta" y "+ Compra" arrancan con el último día de la semana (aviso si se elige una fecha fuera de ella) y no ofrecen "Llegó el lote"; "+ Abono" avisa que se registra con la fecha de hoy y que en Ganancias cuenta en la semana del pedido (la ganancia se atribuye a la semana del pedido, no a la del abono). Tras guardar, `router.refresh()` conserva la semana. El calendario de Ajustes sigue siendo solo para EDITAR semanas (con "Ver esta semana" en el panel de una semana guardada).

## Respaldo diario

- `vercel.json` programa `GET /api/cron/backup` a las `0 4 * * *` UTC (≈ 11 p. m. en Colombia; en Hobby la hora es imprecisa y no hay reintentos). La ruta está fuera de `/api/admin` (no hay cookie): se protege con `Authorization: Bearer ${CRON_SECRET}` comparado en tiempo constante (`server/cron-auth.ts`); sin `CRON_SECRET` responde 401 siempre. `POST /api/admin/backup` (botón de Ajustes) hace lo mismo con la sesión del panel.
- `sendDailyBackup` (`features/reports/server/send-backup.ts`) manda por Telegram **dos archivos en silencio**: `respaldo-AAAA-MM-DD.json` (todas las tablas completas con ids y filas anuladas; es lo que sirve para restaurar; se comprime a `.json.gz` si pasa de 45 MB) y el Excel de todo el tiempo. Si algo falla, manda un aviso **con sonido** y responde 500. Telegram admite archivos de hasta 50 MB (`backup-file.ts`).
- Efecto lateral útil: un cron diario evita que Supabase Free pause el proyecto por inactividad.

## Formulario público protegido

`POST /api/orders` → `submitPublicOrder`: (1) campo trampa `website` (escondido; si viene lleno responde 201 `{ order: null }` sin guardar), (2) validación, (3) límites por ventana fija en la tabla `request_limits` vía la función `hit_limit` (`domain/order-limits.ts`: IP 6 por 10 min y 30 por día, nombre 3 por hora; la IP se guarda solo como HMAC con `ADMIN_PASSWORD`). Si la función o la tabla faltan, **deja pasar** (mejor un pedido de más que rechazar uno real). Si un cliente real pide para varias personas desde la misma conexión (o hay CGNAT), sube los números en `order-limits.ts`.

## Venta desde el panel

`POST /api/admin/orders` → `create-sale.ts`: mismo cálculo que el pedido público (`priceOrder`, precio vigente) más cliente existente o nuevo (`findOrCreateClient`), fecha opcional (mediodía de Bogotá si es pasada, `saleTimestamp`), "ya pagó" (llama a `registerPayment`; si el abono falla devuelve `paymentError` y la venta queda guardada) y **sin aviso por Telegram**. `GET /api/admin/clients` da los nombres para sugerir (se piden al abrir la hoja).

## Gráficas

Las gráficas viven en `/admin/ganancias/graficas` (`?semanas=12|8|26`, `get-charts-report.ts`, sin entrada en la barra inferior: cuelga de Ganancias y la deja resaltada). Inicio solo muestra lo accionable y carga 2 semanas (`getDashboard`); Ganancias conserva cifras, libro semanal y Excel.

## Tema oscuro del panel ("Bodega de curado")

- Los tokens (colores, sombras) viven en `src/app/globals.css`: los claros en `:root` (reserva) y los **oscuros solo bajo `[data-theme="oscuro"]`**. El atributo se pone en el `div.admin-root` de `src/app/admin/layout.tsx`.
- **No cambies los valores de `:root` para oscurecer el panel**: la página pública comparte `--tinta` y se rompería. Un tema nuevo = otro bloque `[data-theme="..."]` con los **mismos nombres de token** y el atributo en el layout; ningún componente cambia.
- Los componentes usan solo clases de token (`bg-hoja`, `text-tinta-2`, `bg-acento`, `text-sobre-acento`…). Nada de hex, `zinc-*`, `bg-white` ni `text-white` dentro de `ui/`, `features/` y `app/admin` (excepto el velo `rgb(0 0 0 / 0.75)` de `.hoja::backdrop` en `globals.css`, porque `::backdrop` no hereda bien las variables).
- Gráficas: series `serie-1/2/3` y `serie-1-claro`; antigüedad de deuda `--aging-1..4`. Si cambias una paleta, valida contraste (≥4.5:1 texto, ≥3:1 UI) y daltonismo.

## Movimiento del panel

Pocas animaciones, útiles y baratas (se usa a diario, en un teléfono de gama media-alta). Todo en CSS puro (`globals.css`, sección "Movimiento del panel"), cero dependencias.

**Tokens** (en `.admin-root` y en `.hoja::backdrop`): `--dur-instante` 100 ms (pulsar), `--dur-rapida` 150 (salidas, color), `--dur-media` 200 (entradas), `--dur-hoja` 240 (entrada de la hoja, el máximo) y `--dur-hoja-sale` 180; curvas `--ease-salida` `cubic-bezier(0.23,1,0.32,1)` y `--ease-hoja` `cubic-bezier(0.32,0.72,0,1)`; `--escala-press` 0.97.

**Reglas:** solo `transform` y `opacity` (más color en elementos diminutos); nunca `transition: all`; entradas con ease-out (nunca ease-in); salidas ~25 % más cortas; nada pasa de 240 ms; duraciones en ms (igual de rápido a 60 y a 120 Hz); `will-change` solo en `.hoja[open]`.

**Lo que hay (7):**
1. **Hoja** (`ui/Sheet.tsx`, clase `.hoja`): sube desde abajo en móvil; en escritorio (≥768 px) es una ventana centrada de 32 rem que entra con fundido y una escala de 0,98 (cierra con Esc, clic en el velo —solo si el gesto empezó y terminó ahí— o la X; el encabezado queda fijo al hacer scroll); el velo es solo opacidad (sin `backdrop-blur`). La salida se anima con `transition-behavior: allow-discrete`, sin `transitionend`. El `Sheet` congela el último contenido mientras sale y lo remonta (otra `key`) en cada apertura.
2. **Aviso** (`ui/Toast.tsx` + `ui/toast-store.ts`): confirma el guardado en los flujos que cierran una hoja (abono y compra rápida de Inicio, abono desde Pedidos). Uso: `avisar("Abono registrado")`. Uno a la vez (el nuevo reemplaza), 2,4 s visible, 150 ms de salida con timeout. Los formularios fijos de `/admin/compras` y `ClientEditor` conservan su "✓" en línea: no se duplican mensajes.
3. **Pulsar** (`@utility presionable`): `scale(0.97)` en `:active` para botones, segmentos, cerrar de la hoja; `0.94` (`[--escala-press:0.94]`) en la insignia de estado; la pastilla de `BottomNav` escala vía `group-active`. Nunca en filas ni tarjetas.
4. **Carga en enlaces** (`ui/LinkPending.tsx`, `useLinkStatus`): barrita bajo la etiqueta en segmentos, `BottomNav` y `SidebarNav`; aparece tras 120 ms, así que con red rápida no se ve.
5. **Esqueleto → contenido:** `.esqueleto-tardio` (aparece a los 120 ms) y `main#contenido > :not([aria-busy])` con fundido de opacidad. Depende de que `loading.tsx` mantenga `aria-busy` y de que la página cuelgue directo de `main` (sin `template.tsx`).
6. **Mensajes en línea** (`.aparece`): "✓ Guardado" y errores entran con un ascenso de 4 px.
7. **Color suave** en insignias (`Badge`) y en la pastilla/ítem activo de la navegación.

**Queso vendido (Inicio):** `WeeklyKgCard` suma los kg de la semana (pedidos vigentes, pendientes y entregados; los pedidos por valor ya guardan sus kg equivalentes). Se muestra con `formatWeight` (`domain/units.ts`): unidades enteras + gramos ("90 lb 380 g"), nunca libras con decimales (1 lb = 500 g, así que 0,30 lb son 150 g). El interruptor libras/kilos recuerda su elección en `localStorage` (`use-weight-unit.ts`).

**Lo que NO se hace (y por qué):** contadores que suben hasta la cifra y barras/líneas que crecen (retrasan leer el dato); entrada escalonada de tarjetas o filas (decorativa, se abre decenas de veces al día); animar tablas completas o resaltar la fila guardada; tooltip de gráfica con deslizamiento (debe seguir al dedo); shimmer en esqueletos; rebotes/springs y `scale(0)`; transiciones de página con View Transitions (las páginas son `force-dynamic` y pasan por `loading.tsx`, así que el morph no se forma; cuesta GPU y cansa); indicador deslizante en segmentos/barra inferior; arrastrar la hoja para cerrar; sacudir campos con error; confeti, parallax, fondos animados; `backdrop-blur` animado.

**Movimiento reducido:** la regla global heredada de la web pública (todo a 0,01 ms con `!important`) está limitada a lo que NO es `.admin-root`. En el panel: sin escala al pulsar, sin desplazamiento (la hoja y el aviso pasan a fundido de opacidad), sin pulso en la barrita; se conservan los fundidos cortos y el cambio de color. En Android/HyperOS se activa con "Quitar animaciones".

**Cómo añadir una animación nueva:** primero justifica el propósito (contexto espacial, confirmación o reducir la espera); usa los tokens de arriba; solo `transform`/`opacity`; añade su rama en el bloque `prefers-reduced-motion` del panel; y revisa en DevTools → Performance con la CPU a 4× que no haya tareas largas ni animaciones "non-composited".

**Pendiente de probar en el teléfono:** el `autoFocus` del monto del abono abre el teclado mientras la hoja sube; si se nota un tirón, ver el comentario de `features/orders/components/use-payment-form.ts`.

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
