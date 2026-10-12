-- Migración 006: nota breve en cada pedido (ej. "2 kg, pero 1 y 1 separados").
-- Es opcional (puede ser null), de hasta 300 caracteres.
-- Es idempotente: se puede correr más de una vez sin problema.
-- Ejecútala en el SQL Editor de Supabase ANTES de usar el campo "Nota" en la web.

alter table orders
  add column if not exists note text;

alter table orders
  drop constraint if exists orders_note_len;
alter table orders
  add constraint orders_note_len check (note is null or char_length(note) <= 300);

-- Pide a la API de Supabase que vea la columna nueva de inmediato.
notify pgrst, 'reload schema';
