-- Racha diaria: que el número del perfil signifique algo.
--
-- `profiles.streak` existía desde la primera migración y nadie la escribía
-- nunca: estaba en 0 para todo el mundo y la interfaz la mostraba igual. No era
-- una función a medias, era un dato falso en pantalla.
--
-- Aquí se le da contenido, y se añade el récord personal, que el perfil ya
-- tenía hueco reservado.
--
-- Idempotente.

-- ---------------------------------------------------------------------------
-- Columnas nuevas
--
-- `last_activity_day` guarda el DÍA de la última actividad, en horario de
-- Bogotá, no la marca de tiempo: la racha se cuenta en días de calendario del
-- estudiante, y con UTC el día cambiaría a las 7 p.m. hora local.
--
-- `best_streak` es el récord histórico. Se guarda aparte porque la racha actual
-- se pierde, y el récord no: es lo que el perfil quiere enseñar cuando la racha
-- viva vuelve a empezar.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists best_streak integer not null default 0;
alter table public.profiles add column if not exists last_activity_day date;

-- ---------------------------------------------------------------------------
-- Bonos por hitos de racha.
--
-- LOS VALORES SON PROVISIONALES. Las reglas de FP fijan los puntos base de las
-- actividades pero no estos bonos, así que están puestos con un criterio
-- sencillo —que un hito valga más o menos como una actividad difícil, y que
-- llegar a 30 días compense de verdad— y agrupados aquí para poder ajustarlos
-- sin tocar nada más. Mismo trato que los TIEMPO_MINIMO_MS del motor.
-- ---------------------------------------------------------------------------
create or replace function public.bono_racha(dias integer)
returns integer
language sql
immutable
as $$
  select case dias
    when 3  then 10
    when 7  then 25
    when 14 then 50
    when 30 then 120
    else 0
  end;
$$;

-- ---------------------------------------------------------------------------
-- registrar_fp, ahora también lleva la racha.
--
-- Sigue sin ser security definer: corre con los permisos de quien llama, RLS
-- sigue aplicando y el user_id sale de auth.uid(), no de un parámetro. Lo que
-- cambia es que, además de sumar los puntos, mueve la racha.
--
-- La racha sube UNA VEZ POR DÍA DE CALENDARIO, no por actividad: hacer cinco
-- ejercicios el martes es un día de racha, no cinco.
--
-- El bono del hito se registra como una fila propia en fp_history, con su
-- activity_id 'racha-N'. Así aparece en el historial y cuenta para rankings y
-- ligas como cualquier otro FP, en vez de ser un número que aparece de la nada
-- en el total del perfil.
-- ---------------------------------------------------------------------------
create or replace function public.registrar_fp(
  p_activity_id  text,
  p_subject_id   text,
  p_fp           integer,
  p_difficulty   text,
  p_modality     text,
  p_duration_ms  integer,
  p_correct_pct  numeric,
  p_repeat_index integer
)
returns public.fp_history
language plpgsql
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_fila   public.fp_history;
  v_hoy    date;
  v_ultimo date;
  v_racha  integer;
  v_bono   integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para registrar FP' using errcode = '42501';
  end if;

  insert into public.fp_history (
    user_id, activity_id, subject_id, fp_awarded,
    difficulty, modality, duration_ms, correct_pct, repeat_index
  )
  values (
    v_uid, p_activity_id, p_subject_id, greatest(p_fp, 0),
    p_difficulty, p_modality, p_duration_ms, p_correct_pct, greatest(p_repeat_index, 0)
  )
  returning * into v_fila;

  v_hoy := (now() at time zone 'America/Bogota')::date;

  select last_activity_day, streak into v_ultimo, v_racha
    from public.profiles where user_id = v_uid;

  if v_ultimo = v_hoy then
    /* Ya contó hoy: la racha no se mueve por hacer más actividades el mismo día. */
    v_racha := coalesce(v_racha, 0);
    v_bono  := 0;
  elsif v_ultimo = v_hoy - 1 then
    /* Día seguido: la racha crece. */
    v_racha := coalesce(v_racha, 0) + 1;
    v_bono  := public.bono_racha(v_racha);
  else
    /*
     * Pasó un día entero en blanco (o es la primera actividad): la racha
     * vuelve a empezar. Hoy cuenta como el día 1, no como cero.
     */
    v_racha := 1;
    v_bono  := public.bono_racha(1);
  end if;

  update public.profiles
     set points            = points + greatest(p_fp, 0) + coalesce(v_bono, 0),
         streak            = v_racha,
         best_streak       = greatest(best_streak, v_racha),
         last_activity_day = v_hoy
   where user_id = v_uid;

  /* El bono deja su propia huella en el historial. */
  if coalesce(v_bono, 0) > 0 then
    insert into public.fp_history (
      user_id, activity_id, subject_id, fp_awarded, difficulty, modality, repeat_index
    )
    values (
      v_uid, 'racha-' || v_racha, p_subject_id, v_bono, 'bono', 'racha', 0
    );
  end if;

  return v_fila;
end;
$$;

revoke all on function public.registrar_fp(text, text, integer, text, text, integer, numeric, integer) from public, anon;
grant execute on function public.registrar_fp(text, text, integer, text, text, integer, numeric, integer) to authenticated;
revoke all on function public.bono_racha(integer) from public, anon;
grant execute on function public.bono_racha(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Rellenar el histórico.
--
-- Los estudiantes que ya venían usando el sitio tienen actividad real en
-- fp_history y una racha en 0. Se les calcula la racha que traen de verdad, en
-- vez de arrancarlos todos desde cero y perder lo que ya habían hecho.
--
-- Se cuentan los días de calendario consecutivos hacia atrás desde su última
-- actividad. No se pagan los bonos retroactivos: se reconoce la racha, pero no
-- se inventan puntos que nunca se otorgaron.
-- ---------------------------------------------------------------------------
with dias as (
  select distinct
    user_id,
    (created_at at time zone 'America/Bogota')::date as dia
  from public.fp_history
),
numerados as (
  select
    user_id,
    dia,
    dia - (row_number() over (partition by user_id order by dia))::integer as grupo
  from dias
),
tramos as (
  select user_id, grupo, count(*) as largo, max(dia) as fin
    from numerados
   group by user_id, grupo
),
resumen as (
  select
    user_id,
    max(largo) as record,
    (array_agg(largo order by fin desc))[1] as ultima_racha,
    max(fin) as ultimo_dia
  from tramos
  group by user_id
)
update public.profiles p
   set streak            = r.ultima_racha,
       best_streak       = greatest(p.best_streak, r.record),
       last_activity_day = r.ultimo_dia
  from resumen r
 where p.user_id = r.user_id;
