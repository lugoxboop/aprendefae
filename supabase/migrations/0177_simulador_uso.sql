-- ═══════════════════════════════════════════════════════════════════════════
-- 0177 — EL CONTADOR DE USO DEL SIMULADOR CON IA (orden de Mateo, 26-nov)
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Gemelo de la 0040 (asistente_uso), con su propia tabla: una partida del
-- simulador gasta varias llamadas al modelo (expedientes, diagnósticos y
-- preguntas) y no debe dejar al estudiante sin su mascota tutora, que cuenta
-- aparte. El LÍMITE no vive aquí: la función lo pasa como parámetro desde el
-- secreto SIMULADOR_LIMITE_DIARIO, para cambiarlo sin migrar.
--
-- ADITIVA: una tabla nueva y dos funciones nuevas. No toca ninguna tabla que
-- ya exista ni datos de estudiantes. El día es el de Bogotá, como en la 0040.
-- Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.simulador_uso (
  user_id      uuid    not null references auth.users (id) on delete cascade,
  dia          date    not null,
  invocaciones integer not null default 0 check (invocaciones >= 0),
  primary key (user_id, dia)
);

comment on table public.simulador_uso is
'Llamadas al simulador con IA por estudiante y día de Bogotá (0177). El límite llega como parámetro a simulador_consumir().';

/* RLS encendida y forzada, sin políticas: solo la función de abajo la toca. */
alter table public.simulador_uso enable row level security;
alter table public.simulador_uso force row level security;
revoke all on table public.simulador_uso from anon, authenticated;

create or replace function public.simulador_consumir(p_limite integer)
returns table (permitido boolean, usadas integer, limite integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_dia  date := (now() at time zone 'America/Bogota')::date;
  v_tras integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para usar el simulador' using errcode = '42501';
  end if;
  if p_limite is null or p_limite < 0 then
    raise exception 'Límite de simulador inválido: %', p_limite using errcode = '22023';
  end if;

  /* Decide y escribe en una sola sentencia: el where del upsert ES el límite. */
  insert into public.simulador_uso (user_id, dia, invocaciones)
  values (v_uid, v_dia, 1)
      on conflict (user_id, dia) do update
         set invocaciones = public.simulador_uso.invocaciones + 1
       where public.simulador_uso.invocaciones < p_limite
  returning public.simulador_uso.invocaciones into v_tras;

  if v_tras is not null then
    return query select true, v_tras, p_limite;
  end if;

  return query
    select false, coalesce(u.invocaciones, 0), p_limite
      from public.simulador_uso u
     where u.user_id = v_uid and u.dia = v_dia;
end;
$$;

comment on function public.simulador_consumir(integer) is
'Consume una llamada del simulador con IA si queda cupo hoy (0177). Devuelve (permitido, usadas, limite).';

revoke all on function public.simulador_consumir(integer) from public, anon;
grant execute on function public.simulador_consumir(integer) to authenticated;

select
  to_regclass('public.simulador_uso') is not null as tabla,
  has_function_privilege('anon', 'public.simulador_consumir(integer)', 'execute') as anon_puede,
  'PASA' as resultado;
