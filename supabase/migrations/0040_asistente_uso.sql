-- ═══════════════════════════════════════════════════════════════════════════
-- 0040 — EL CONTADOR DE USO DEL ASISTENTE
--
-- La mitad del límite que vive en la base. La otra mitad —cuántas invocaciones
-- se permiten— NO está aquí: llega como parámetro en cada llamada, porque el
-- número lo está definiendo Stanley y tiene que poder cambiar sin migrar nada
-- ni volver a desplegar la función.
--
-- ═══════════ POR QUÉ EL CONTADOR ESTÁ EN POSTGRES Y NO EN LA FUNCIÓN ═══════════
--
-- Una Edge Function no tiene memoria entre invocaciones: cada llamada puede
-- caer en una instancia distinta, así que un contador en memoria no cuenta
-- nada. Y contar en la base tiene otras dos ventajas que importan aquí: el
-- límite sobrevive a un redespliegue, y se puede PROBAR con las pruebas SQL que
-- el proyecto ya corre en CI, en vez de a mano contra un servidor.
--
-- ═══════════ CONSUMIR Y COMPROBAR SON LA MISMA SENTENCIA ═══════════
--
-- `asistente_consumir` no pregunta primero y escribe después: hace un insert
-- con `on conflict do update` cuya cláusula `where` es el propio límite. Dos
-- llamadas simultáneas del mismo estudiante no pueden colarse las dos por el
-- mismo hueco, porque la segunda choca contra la fila que dejó la primera.
-- Preguntar y luego escribir sería una carrera con el límite por premio.
--
-- ═══════════ EL DÍA ES EL DE BOGOTÁ ═══════════
--
-- Como el corte del Repaso, el de las ligas y el de los rankings. En UTC el
-- contador se reiniciaría a las 7 p.m. hora local, a media tarde de clase.
--
-- Va DESPUÉS de la 0039. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. El contador: una fila por estudiante y día ──────────────────────────
create table if not exists public.asistente_uso (
  user_id      uuid    not null references auth.users (id) on delete cascade,
  dia          date    not null,          -- día de Bogotá
  invocaciones integer not null default 0 check (invocaciones >= 0),
  primary key (user_id, dia)
);

comment on table public.asistente_uso is
'Invocaciones del asistente por estudiante y día de Bogotá (0040). El LÍMITE no vive aquí: se pasa como parámetro a asistente_consumir(), porque el número lo define producto y tiene que poder cambiar sin migración.';

/*
 * RLS encendida y forzada, y SIN POLÍTICAS: nadie llega a esta tabla desde el
 * navegador, ni para leer. Lo único que la toca es la función de abajo, que
 * corre como su dueño. Un estudiante no tiene por qué poder consultar —ni
 * mucho menos escribir— su propio contador.
 */
alter table public.asistente_uso enable row level security;
alter table public.asistente_uso force row level security;
revoke all on table public.asistente_uso from anon, authenticated;

-- ── 2. Consumir una invocación, si queda cupo ──────────────────────────────
create or replace function public.asistente_consumir(p_limite integer)
returns table (permitido boolean, usadas integer, limite integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_dia   date := (now() at time zone 'America/Bogota')::date;
  v_tras  integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para usar el asistente' using errcode = '42501';
  end if;

  /*
   * El límite tiene que ser un número sensato. Un null o un negativo no se
   * interpretan como «sin límite»: se rechazan. «Sin límite» es una decisión
   * de producto y tendría que escribirse a propósito, no colarse por un
   * parámetro mal pasado desde la función.
   */
  if p_limite is null or p_limite < 0 then
    raise exception 'Límite de asistente inválido: %', p_limite using errcode = '22023';
  end if;

  /*
   * Una sola sentencia decide y escribe. El `where` del update ES el límite:
   * si ya se llegó, no hay fila actualizada y `v_tras` queda null.
   */
  insert into public.asistente_uso (user_id, dia, invocaciones)
  values (v_uid, v_dia, 1)
      on conflict (user_id, dia) do update
         set invocaciones = public.asistente_uso.invocaciones + 1
       where public.asistente_uso.invocaciones < p_limite
  returning public.asistente_uso.invocaciones into v_tras;

  if v_tras is not null then
    return query select true, v_tras, p_limite;
  end if;

  /*
   * No se pudo consumir. Se devuelve cuánto lleva —que es el límite— para que
   * quien llame pueda decirlo en pantalla sin una segunda consulta.
   */
  return query
    select false, coalesce(u.invocaciones, 0), p_limite
      from public.asistente_uso u
     where u.user_id = v_uid and u.dia = v_dia;
end;
$$;

comment on function public.asistente_consumir(integer) is
'Consume una invocación del asistente si queda cupo hoy (0040). Devuelve (permitido, usadas, limite). El límite llega por parámetro: no está escrito en la base.';

-- ── 3. Cuánto lleva hoy, sin consumir ──────────────────────────────────────
/*
 * Para poder pintar «te quedan N» sin gastar una. Solo lectura, y solo de lo
 * propio: `auth.uid()` no es negociable desde el cliente.
 */
create or replace function public.asistente_uso_hoy()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select u.invocaciones from public.asistente_uso u
      where u.user_id = auth.uid()
        and u.dia = (now() at time zone 'America/Bogota')::date),
    0);
$$;

-- ── 4. Permisos ────────────────────────────────────────────────────────────
/*
 * En Supabase, una función nueva del esquema public nace ejecutable por anon.
 * Se revoca explícito —la 0002 ya dejó dicho que un `revoke from public` no
 * basta— y se concede solo a quien tiene sesión.
 */
revoke all on function public.asistente_consumir(integer) from public, anon;
revoke all on function public.asistente_uso_hoy() from public, anon;
grant execute on function public.asistente_consumir(integer) to authenticated;
grant execute on function public.asistente_uso_hoy() to authenticated;

-- ── 5. Resumen ─────────────────────────────────────────────────────────────
select
  to_regclass('public.asistente_uso') is not null                  as tabla,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'asistente_consumir') as fn_consumir,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'asistente_uso_hoy')  as fn_uso_hoy,
  has_function_privilege('anon', 'public.asistente_consumir(integer)', 'execute') as anon_puede,
  'PASA' as resultado;
