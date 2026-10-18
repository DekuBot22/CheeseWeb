-- Migración 007: aperturas de semana. El dueño marca el día en que empieza cada
-- semana de negocio (el queso no siempre llega el sábado). Una semana dura hasta
-- el día antes de la siguiente apertura. Antes de la primera apertura vigente
-- sigue la regla de siempre (sábado a viernes), así que NINGUNA cifra actual cambia.
-- No toca tablas existentes: crea una tabla pequeña y una función.
-- Va en una transacción y es idempotente (se puede correr más de una vez).
-- Córrela en el SQL Editor de Supabase ANTES de usar "Abrir semana" en la web.

begin;

create table if not exists week_openings (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now(),
  -- Igual que el resto: nunca se borra, se anula (null = vigente).
  voided_at timestamptz,
  void_reason text
);

-- Anulado ⇔ tiene motivo (3 a 300 letras).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'week_openings_anulacion_check') then
    alter table week_openings add constraint week_openings_anulacion_check
      check ((voided_at is null) = (void_reason is null)
             and (void_reason is null or char_length(btrim(void_reason)) between 3 and 300));
  end if;
end $$;

-- Una sola apertura vigente por día.
create unique index if not exists week_openings_start_active_idx
  on week_openings (start_date) where voided_at is null;

-- Solo el servidor (service role) lee y escribe.
alter table week_openings enable row level security;

-- Mover una apertura = anular la vieja y crear la nueva, en un solo paso.
-- Reglas (la base es la autoridad): no puede ser futura y debe quedar entre la
-- apertura anterior y la siguiente.
create or replace function move_week_opening(p_id uuid, p_new_date date)
returns json language plpgsql set search_path = public as $$
declare v_old week_openings; v_prev date; v_next date; v_new week_openings;
begin
  select * into v_old from week_openings where id = p_id for update;
  if not found then raise exception 'apertura_no_encontrada' using errcode = 'P0001'; end if;
  if v_old.voided_at is not null then raise exception 'apertura_ya_anulada' using errcode = 'P0001'; end if;
  if p_new_date is null or p_new_date > (now() at time zone 'America/Bogota')::date then
    raise exception 'fecha_futura' using errcode = 'P0001';
  end if;
  if p_new_date = v_old.start_date then raise exception 'misma_fecha' using errcode = 'P0001'; end if;
  select max(start_date) into v_prev from week_openings where voided_at is null and start_date < v_old.start_date;
  select min(start_date) into v_next from week_openings where voided_at is null and start_date > v_old.start_date;
  if (v_prev is not null and p_new_date <= v_prev) or (v_next is not null and p_new_date >= v_next) then
    raise exception 'fecha_fuera_de_orden' using errcode = 'P0001';
  end if;
  update week_openings
    set voided_at = now(), void_reason = 'Movida al ' || to_char(p_new_date, 'DD/MM/YYYY')
    where id = p_id;
  insert into week_openings (start_date, note) values (p_new_date, v_old.note) returning * into v_new;
  return row_to_json(v_new);
end $$;

revoke all on function move_week_opening(uuid, date) from public, anon, authenticated;
grant execute on function move_week_opening(uuid, date) to service_role;

commit;

-- Pide a la API de Supabase que vea la tabla y la función nuevas de inmediato.
notify pgrst, 'reload schema';
