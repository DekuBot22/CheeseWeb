-- Foto consolidada del esquema: 001 + 002 + 003 + 004 + 005, en orden.
-- Úsala para crear una base NUEVA (SQL Editor de Supabase > New query > pegar > Run).
-- Si ya tienes una base en marcha, corre solo las migraciones que te falten.
-- Regla: cada cambio de esquema = una migración nueva en migrations/ Y este archivo actualizado en el mismo cambio.

-- ===== 001_base.sql =====
-- Ejecuta este script una sola vez en el SQL Editor de tu proyecto de Supabase
-- (Panel de Supabase > SQL Editor > New query > pega esto > Run).

create extension if not exists "pgcrypto";

create table if not exists settings (
  id integer primary key default 1,
  price_per_kg numeric(12, 2) not null,
  cost_per_kg numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

insert into settings (id, price_per_kg, cost_per_kg)
values (1, 20000, 0)
on conflict (id) do nothing;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null,
  phone text,
  notes text,
  credit_balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists clients_name_key_idx on clients (name_key);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients (id),
  client_name text not null,
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null check (unit in ('kg', 'lb')),
  cheese_type text not null check (cheese_type in ('duro', 'semi', 'blando')),
  salt_level text not null check (salt_level in ('alto', 'intermedio', 'bajo')),
  price_per_kg_snapshot numeric(12, 2) not null,
  cost_per_kg_snapshot numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  amount_paid numeric(12, 2) not null default 0,
  payment_status text not null default 'debe' check (payment_status in ('debe', 'parcial', 'pagado')),
  status text not null default 'pendiente' check (status in ('pendiente', 'completado')),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_client_id_idx on orders (client_id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  method text,
  created_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx on payments (order_id);

-- La app solo se conecta a Supabase desde el servidor (con la service role
-- key), nunca desde el navegador. Por eso activamos RLS sin políticas
-- públicas: nadie puede leer ni escribir estas tablas directamente.
alter table settings enable row level security;
alter table clients enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;

-- ===== 002_compras_proveedor.sql =====
-- Ejecuta este script una sola vez en el SQL Editor de tu proyecto de Supabase
-- (igual que supabase/schema.sql). Agrega el registro de compras al
-- proveedor y los pagos que le haces, para poder calcular el costo real
-- (no solo el estimado) en el cierre semanal.

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_date date not null,
  kg numeric(10, 2) not null check (kg > 0),
  total_cost numeric(12, 2) not null check (total_cost >= 0),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists purchases_date_idx on purchases (purchase_date);

create table if not exists provider_payments (
  id uuid primary key default gen_random_uuid(),
  payment_date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  method text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists provider_payments_date_idx on provider_payments (payment_date);

alter table purchases enable row level security;
alter table provider_payments enable row level security;

-- ===== 003_indices.sql =====
-- Migración 003: índices para las consultas del panel (cuentas por cobrar,
-- pedidos pendientes y filtros de la pantalla Pedidos). Es idempotente:
-- se puede correr más de una vez sin problema.

create index if not exists orders_open_idx
  on orders (created_at)
  where payment_status <> 'pagado';

create index if not exists orders_pending_idx
  on orders (created_at desc)
  where status = 'pendiente';

create index if not exists orders_status_created_idx
  on orders (status, payment_status, created_at desc);



-- ===== 004_descuentos_proveedor.sql =====
-- Migración 004: descuentos del proveedor (notas crédito).
-- Un descuento reduce lo que se le debe al proveedor y el costo real de su
-- semana, sin editar ni borrar la compra original (trazabilidad).
-- Es idempotente: se puede correr más de una vez sin problema.
-- Ejecútala en el SQL Editor de Supabase ANTES de desplegar el código que la usa.

create table if not exists provider_discounts (
  id uuid primary key default gen_random_uuid(),
  discount_date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  reason text not null check (reason in ('salado', 'mal_estado', 'faltante', 'otro')),
  purchase_id uuid references purchases (id) on delete restrict,
  kg numeric(10, 2) check (kg is null or kg > 0),
  notes text check (notes is null or char_length(notes) <= 300),
  created_at timestamptz not null default now(),
  constraint provider_discounts_otro_con_nota
    check (reason <> 'otro' or coalesce(btrim(notes), '') <> '')
);

create index if not exists provider_discounts_date_idx
  on provider_discounts (discount_date);

create index if not exists provider_discounts_purchase_idx
  on provider_discounts (purchase_id)
  where purchase_id is not null;

-- Igual que el resto: solo el servidor (service role) lee y escribe.
alter table provider_discounts enable row level security;

-- Pide a la API de Supabase que vea la tabla nueva de inmediato.
notify pgrst, 'reload schema';


-- ===== 005_anular_editar_limites.sql =====
-- Migración 005: anular y editar (pedidos, abonos, compras, pagos y descuentos
-- del proveedor), abono atómico y límites del formulario público.
-- No borra ni cambia datos: agrega columnas vacías, una tabla pequeña y funciones.
-- Va en una transacción (si algo falla no queda a medias) y es idempotente.
-- Córrela en el SQL Editor de Supabase ANTES de desplegar el código que la usa.


-- 1) Anulación: null = vigente. Nunca se borra una fila.
alter table orders
  add column if not exists voided_at timestamptz,
  add column if not exists void_reason text,
  add column if not exists edited_at timestamptz;
alter table payments
  add column if not exists voided_at timestamptz,
  add column if not exists void_reason text;
alter table purchases
  add column if not exists voided_at timestamptz,
  add column if not exists void_reason text;
alter table provider_payments
  add column if not exists voided_at timestamptz,
  add column if not exists void_reason text;
alter table provider_discounts
  add column if not exists voided_at timestamptz,
  add column if not exists void_reason text;

-- Anulado ⇔ tiene motivo (3 a 300 letras).
do $$
declare t text;
begin
  foreach t in array array['orders', 'payments', 'purchases', 'provider_payments', 'provider_discounts'] loop
    if not exists (select 1 from pg_constraint where conname = t || '_anulacion_check') then
      execute format(
        'alter table %I add constraint %I check ((voided_at is null) = (void_reason is null) '
        'and (void_reason is null or char_length(btrim(void_reason)) between 3 and 300))',
        t, t || '_anulacion_check');
    end if;
  end loop;
end $$;

create index if not exists payments_order_active_idx on payments (order_id) where voided_at is null;

-- 2) Límites del formulario público (ventana fija).
create table if not exists request_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
create index if not exists request_limits_window_idx on request_limits (window_start);
alter table request_limits enable row level security;

create or replace function hit_limit(p_key text, p_window_seconds integer, p_max integer)
returns boolean language plpgsql set search_path = public as $$
declare v_start timestamptz; v_hits integer;
begin
  v_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into request_limits (key, window_start, hits) values (p_key, v_start, 1)
  on conflict (key, window_start) do update set hits = request_limits.hits + 1
  returning hits into v_hits;
  -- Limpieza barata: solo cuando se abre una ventana nueva para esa clave.
  if v_hits = 1 then
    delete from request_limits where window_start < now() - interval '2 days';
  end if;
  return v_hits <= p_max;
end $$;

-- 3) Saldos de un pedido desde sus abonos vigentes.
-- Espejo de `settleOrder` en src/domain/order.ts: si cambias una, cambia la otra.
-- Excedente = lo abonado que no cabe en el pedido (un pedido anulado no cobra nada).
create or replace function order_credit_excess(p_order_id uuid)
returns numeric language sql stable set search_path = public as $$
  select coalesce((
    select greatest(
      coalesce((select sum(p.amount) from payments p where p.order_id = o.id and p.voided_at is null), 0)
        - case when o.voided_at is null then o.total else 0 end,
      0)
    from orders o where o.id = p_order_id
  ), 0);
$$;

create or replace function sync_order_payment(p_order_id uuid)
returns void language plpgsql set search_path = public as $$
declare v_total numeric; v_paid numeric; v_applied numeric;
begin
  select o.total,
         coalesce((select sum(p.amount) from payments p where p.order_id = o.id and p.voided_at is null), 0)
    into v_total, v_paid
  from orders o where o.id = p_order_id and o.voided_at is null;
  if not found then return; end if;  -- un pedido anulado conserva sus cifras históricas
  v_applied := least(v_paid, v_total);
  update orders set
    amount_paid = v_applied,
    payment_status = case when v_applied + 0.01 >= v_total then 'pagado'
                          when v_applied > 0 then 'parcial' else 'debe' end
  where id = p_order_id;
end $$;

create or replace function shift_client_credit(p_client_id uuid, p_delta numeric)
returns void language plpgsql set search_path = public as $$
begin
  if p_client_id is null or coalesce(p_delta, 0) = 0 then return; end if;
  update clients set credit_balance = greatest(credit_balance + p_delta, 0) where id = p_client_id;
end $$;

create or replace function clean_void_reason(p_reason text)
returns text language plpgsql immutable set search_path = public as $$
begin
  if p_reason is null or char_length(btrim(p_reason)) < 3 then
    raise exception 'motivo_invalido' using errcode = 'P0001';
  end if;
  return left(btrim(p_reason), 300);
end $$;

-- 4) Abono atómico (reemplaza las 3 escrituras sueltas).
create or replace function register_payment(
  p_order_id uuid, p_amount numeric, p_method text default null, p_created_at timestamptz default null)
returns json language plpgsql set search_path = public as $$
declare v_order orders; v_before numeric; v_after numeric;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'monto_invalido' using errcode = 'P0001'; end if;
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'pedido_no_encontrado' using errcode = 'P0001'; end if;
  if v_order.voided_at is not null then raise exception 'pedido_anulado' using errcode = 'P0001'; end if;
  v_before := order_credit_excess(p_order_id);
  insert into payments (order_id, amount, method, created_at)
  values (p_order_id, round(p_amount, 2), nullif(btrim(coalesce(p_method, '')), ''), coalesce(p_created_at, now()));
  perform sync_order_payment(p_order_id);
  v_after := order_credit_excess(p_order_id);
  perform shift_client_credit(v_order.client_id, v_after - v_before);
  select * into v_order from orders where id = p_order_id;
  return json_build_object('order', row_to_json(v_order), 'credit_added', v_after - v_before);
end $$;

create or replace function void_payment(p_payment_id uuid, p_reason text)
returns json language plpgsql set search_path = public as $$
declare v_order_id uuid; v_order orders; v_reason text; v_before numeric; v_after numeric;
begin
  v_reason := clean_void_reason(p_reason);
  select order_id into v_order_id from payments where id = p_payment_id;
  if not found then raise exception 'abono_no_encontrado' using errcode = 'P0001'; end if;
  select * into v_order from orders where id = v_order_id for update;
  v_before := order_credit_excess(v_order_id);
  update payments set voided_at = now(), void_reason = v_reason
  where id = p_payment_id and voided_at is null;
  if not found then raise exception 'abono_ya_anulado' using errcode = 'P0001'; end if;
  perform sync_order_payment(v_order_id);
  v_after := order_credit_excess(v_order_id);
  perform shift_client_credit(v_order.client_id, v_after - v_before);
  select * into v_order from orders where id = v_order_id;
  return json_build_object('order', row_to_json(v_order), 'credit_delta', v_after - v_before);
end $$;

create or replace function void_order(p_order_id uuid, p_reason text, p_void_payments boolean default true)
returns json language plpgsql set search_path = public as $$
declare v_order orders; v_reason text; v_before numeric; v_after numeric;
begin
  v_reason := clean_void_reason(p_reason);
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'pedido_no_encontrado' using errcode = 'P0001'; end if;
  if v_order.voided_at is not null then raise exception 'pedido_ya_anulado' using errcode = 'P0001'; end if;
  v_before := order_credit_excess(p_order_id);
  if p_void_payments then
    update payments set voided_at = now(), void_reason = left('Pedido anulado: ' || v_reason, 300)
    where order_id = p_order_id and voided_at is null;
  end if;
  update orders set voided_at = now(), void_reason = v_reason where id = p_order_id;
  v_after := order_credit_excess(p_order_id);  -- con total 0: lo abonado vigente queda a favor
  perform shift_client_credit(v_order.client_id, v_after - v_before);
  select * into v_order from orders where id = p_order_id;
  return json_build_object('order', row_to_json(v_order), 'credit_delta', v_after - v_before);
end $$;

create or replace function edit_order(
  p_order_id uuid, p_client_id uuid, p_client_name text, p_quantity numeric, p_unit text, p_total numeric)
returns json language plpgsql set search_path = public as $$
declare v_old orders; v_new orders; v_before numeric; v_after numeric;
begin
  if p_total is null or p_total <= 0 or p_total > 100000000 then
    raise exception 'total_invalido' using errcode = 'P0001'; end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'cantidad_invalida' using errcode = 'P0001'; end if;
  if p_client_name is null or char_length(btrim(p_client_name)) < 2 then
    raise exception 'cliente_invalido' using errcode = 'P0001'; end if;
  select * into v_old from orders where id = p_order_id for update;
  if not found then raise exception 'pedido_no_encontrado' using errcode = 'P0001'; end if;
  if v_old.voided_at is not null then raise exception 'pedido_anulado' using errcode = 'P0001'; end if;
  v_before := order_credit_excess(p_order_id);
  update orders set client_id = p_client_id, client_name = btrim(p_client_name),
    quantity = round(p_quantity, 2), unit = p_unit, total = round(p_total, 2), edited_at = now()
  where id = p_order_id;
  perform sync_order_payment(p_order_id);
  v_after := order_credit_excess(p_order_id);
  if v_old.client_id is distinct from p_client_id then
    perform shift_client_credit(v_old.client_id, -v_before);
    perform shift_client_credit(p_client_id, v_after);
  else
    perform shift_client_credit(p_client_id, v_after - v_before);
  end if;
  select * into v_new from orders where id = p_order_id;
  return json_build_object('order', row_to_json(v_new), 'credit_delta', v_after - v_before);
end $$;

-- 5) Solo el servidor (service role) puede llamarlas; PostgREST expone public a anon.
do $$
declare f text;
begin
  foreach f in array array[
    'hit_limit(text, integer, integer)', 'order_credit_excess(uuid)', 'sync_order_payment(uuid)',
    'shift_client_credit(uuid, numeric)', 'clean_void_reason(text)',
    'register_payment(uuid, numeric, text, timestamptz)', 'void_payment(uuid, text)',
    'void_order(uuid, text, boolean)', 'edit_order(uuid, uuid, text, numeric, text, numeric)'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
