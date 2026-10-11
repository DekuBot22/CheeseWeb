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
