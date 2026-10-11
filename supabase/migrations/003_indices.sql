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
