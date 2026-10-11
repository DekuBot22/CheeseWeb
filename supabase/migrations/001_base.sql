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
