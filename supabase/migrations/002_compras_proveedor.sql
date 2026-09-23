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
