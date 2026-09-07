-- ---------------------------------------------------------------------------
-- 0020 — Las cuentas de prueba dejan de contaminar los agregados del panel.
--
-- EL PROBLEMA. Mateo prueba todas las actividades del sitio con su cuenta de
-- estudiante: 30 registros desde el 1 de septiembre, 19 evaluativas al 22%.
-- Eso no es rendimiento, es control de calidad, y estaba entrando en el
-- promedio de la cohorte, en las alertas y en Destacados. Con 14 estudiantes
-- reales que empezaron hoy, su cuenta pesa más que ninguna otra y va a
-- ensuciar el diagnóstico por pregunta mucho más que el promedio.
--
-- ═══════════ DÓNDE SE FILTRA, Y POR QUÉ AHÍ ═══════════
--
-- EN EL SERVIDOR, dentro de cada función que agrega entre estudiantes. Si se
-- filtrara en el cliente, cada consumidor nuevo tendría que acordarse —el
-- resumen, las alertas, Destacados, el CSV, y mañana el diagnóstico por
-- cohorte— y el primero que se olvidara volvería a contaminar los promedios
-- sin que nada fallara.
--
--   panel_resumen    agrega entre estudiantes  ->  las excluye
--   panel_tendencia  agrega entre estudiantes  ->  las excluye
--   panel_estudiantes  es un CENSO, una fila por persona: no hay nada entre
--                      estudiantes que filtrar. Devuelve la columna es_prueba
--                      y la fila se queda.
--
-- LA FILA SE QUEDA A PROPÓSITO. Si desapareciera, no habría forma de
-- comprobar desde la interfaz que la marca está bien puesta, y un docente que
-- sabe que alguien jugó y no lo encuentra concluye que el panel está roto.
-- Sale marcada y fuera de los promedios.
--
-- ═══════════ LO QUE NO SE TOCA ═══════════
--
-- La marca NO SE LEE EN NINGUNA RUTA DEL ESTUDIANTE. Ni registrar_fp, ni el
-- ranking, ni las ligas, ni las medallas, ni el resumen de semestre la miran.
-- Mateo sigue ganando FP, subiendo de liga y viendo su perfil igual, y sigue
-- apareciendo en el ranking público: sacarlo de ahí cambiaría su liga y es
-- otra decisión, no esta.
--
-- Nadie la escribe desde el cliente. Se pone aquí, en la migración, para que
-- quede en el repositorio y no sea un cambio manual invisible.
--
-- ═══════════ LA TRANSACCIÓN Y LOS PERMISOS, OTRA VEZ ═══════════
--
-- Añadir es_prueba al `returns table` cambia el tipo de retorno, así que
-- panel_estudiantes vuelve a necesitar drop + create — Postgres no deja
-- hacerlo con create or replace. Mismo cuidado que en la 0019: dentro de una
-- transacción, para que no exista un instante sin la función, y reemitiendo
-- el revoke porque EL DROP SE LLEVA LOS GRANTS y una función recién creada
-- nace ejecutable por `public`, que en Supabase incluye a `anon`.
--
-- panel_resumen y panel_tendencia NO cambian de firma, así que van con
-- create or replace y no necesitan drop.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada.
-- ---------------------------------------------------------------------------

begin;

-- ── 1. La marca ──────────────────────────────────────────────────────────────
/*
 * ADITIVA: un add column, sin drop y sin reescribir la tabla.
 *
 * NOT NULL DEFAULT FALSE a propósito. Nadie es cuenta de prueba salvo que se
 * diga. Con un anulable haría falta un coalesce en cada consulta, y el día que
 * se olvidara uno un estudiante real desaparecería de los promedios sin que
 * nada fallara — el fallo silencioso de siempre.
 */
alter table public.profiles
  add column if not exists es_prueba boolean not null default false;

-- ── 2. Quién está marcado, hoy ───────────────────────────────────────────────
/*
 * Una sola cuenta: la de Mateo, que es quien prueba las actividades. La lista
 * la sacó él de los datos, no se adivinó por el patrón.
 *
 * Va por correo y no por uuid para que se lea sin tener que resolver un id
 * contra auth.users, y es idempotente: correrla dos veces deja lo mismo.
 */
update public.profiles p
   set es_prueba = true
  from auth.users u
 where u.id = p.user_id
   and lower(u.email) = 'lugox173@gmail.com';

-- ── 3. panel_resumen: los agregados salen sin cuentas de prueba ─────────────
/*
 * Aquí sí hay agregados entre estudiantes —cuántos activos, cuántos FP
 * nuevos, cuántos se movieron— y todos excluyen a las cuentas marcadas.
 *
 * El resto de la función no cambia: la ventana de gracia de 30 minutos, la
 * marca de última visita y el delta siguen exactamente igual.
 */
create or replace function public.panel_resumen(p_subject text)
returns table (
  desde               timestamptz,
  estudiantes_total   integer,
  estudiantes_activos integer,
  fp_nuevos           bigint,
  estudiantes_movidos integer,
  actividades_nuevas  text[]
)
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
  v_email  text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_desde  timestamptz;
  v_inicio timestamptz;
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;

  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  select d.ultima_visita into v_desde
    from public.docentes d
   where lower(d.email) = v_email;

  v_inicio := date_trunc('week', now() at time zone 'America/Bogota') at time zone 'America/Bogota';

  return query
  with h as (
    /* El filtro entra aquí, una sola vez, y lo hereda todo lo de abajo. */
    select f.*
      from public.fp_history f
      join public.profiles pr on pr.user_id = f.user_id
     where f.subject_id = p_subject
       and not pr.es_prueba
  ),
  nuevo as (
    select * from h where v_desde is not null and h.created_at > v_desde
  )
  select
    v_desde,
    (select count(distinct h.user_id)::integer from h),
    (select count(distinct h.user_id)::integer from h where h.created_at >= v_inicio),
    coalesce((select sum(n.fp_awarded)::bigint from nuevo n), 0),
    coalesce((select count(distinct n.user_id)::integer from nuevo n), 0),
    coalesce(
      (select array_agg(distinct n.activity_id) from nuevo n where n.modality <> 'racha'),
      '{}'::text[]
    );

  update public.docentes
     set ultima_visita = now()
   where lower(email) = v_email
     and (ultima_visita is null or ultima_visita < now() - interval '30 minutes');
end;
$$;

-- ── 4. panel_tendencia: la serie temporal, también sin cuentas de prueba ────
/*
 * Es toda ella un agregado entre estudiantes, así que el filtro es obligatorio
 * aquí o la curva de las últimas semanas es sobre todo Mateo probando.
 *
 * DE PASO, LOS BONOS DE RACHA PASAN A FILTRARSE POR MODALITY. Estaban con
 * `activity_id not like 'racha-%'`, que FUNCIONA —los ids son literalmente
 * racha-N— pero es un filtro de texto de la familia que ya ha fallado tres
 * veces en este proyecto. `modality <> 'racha'` compara contra una columna
 * cerrada con tres valores. No es un arreglo: es no dejar la mina puesta.
 */
create or replace function public.panel_tendencia(
  p_subject text,
  p_semanas integer default 8
)
returns table (
  ciclo               date,
  estudiantes_activos bigint,
  actividades         bigint,
  pct_medio           numeric
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;
  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  return query
  select (date_trunc('week', h.created_at at time zone 'America/Bogota'))::date,
         count(distinct h.user_id),
         count(*),
         round(avg(h.correct_pct) filter (where h.modality = 'evaluativa'), 1)
    from public.fp_history h
    join public.profiles pr on pr.user_id = h.user_id
   where h.subject_id = p_subject
     and not pr.es_prueba
     /* Los bonos de racha no son actividades: inflarían el conteo. */
     and h.modality <> 'racha'
     and h.created_at >= now() - (greatest(1, least(52, p_semanas)) || ' weeks')::interval
   group by 1
   order by 1;
end;
$$;

-- ── 5. panel_estudiantes: devuelve la marca, y la fila se queda ─────────────
/*
 * Drop + create porque el returns table gana una columna. El cuerpo NO está
 * reescrito a mano: se derivó de la 0019 con un script que declara cada cambio
 * y falla si alguno no aplica exactamente una vez, más nueve cadenas que no
 * podían perderse.
 */
drop function if exists public.panel_estudiantes(text);

create or replace function public.panel_estudiantes(p_subject text)
returns table (
  user_id            uuid,
  nickname           text,
  full_name          text,
  en_mi_grupo        boolean,
  fp_total           bigint,
  fp_ciclo           bigint,
  ultima_actividad   timestamptz,
  dias_inactivo      integer,
  primera_actividad  timestamptz,
  actividades        text[],
  n_registros        bigint,
  pct_evaluativa     numeric,
  n_evaluativas      bigint,
  pct_exploratoria   numeric,
  n_exploratorias    bigint,
  duracion_media_ms  numeric,
  /*
   * ═══════════ LOS TRES CAMPOS DE LA VENTANA DE 14 DÍAS ═══════════
   *
   * Los de arriba miran TODO el historial, que es lo que necesita el bloque de
   * alertas. Estos miran los últimos catorce días, que es lo que necesita
   * Destacados: reconocer a quien va bien AHORA, no a quien fue bien en marzo.
   *
   * Van aquí y no en una función aparte porque salen del mismo recorrido de
   * fp_history: separarlos costaría una segunda pasada por la misma tabla para
   * responder sobre las mismas filas.
   */
  pct_evaluativa_14d numeric,
  n_evaluativas_14d  bigint,
  dias_activos_14d   integer,
  /*
   * ═══════════ POR QUÉ LA FILA SIGUE SALIENDO ═══════════
   *
   * Esta función es un CENSO, no un promedio: devuelve una fila por
   * estudiante y no calcula nada entre estudiantes. Así que aquí no hay
   * ningún agregado del que sacar a las cuentas de prueba — lo que hay es una
   * fila, y esa fila se queda.
   *
   * Se queda porque si desapareciera no habría forma de comprobar desde la
   * interfaz que la marca está bien puesta, y un docente que sabe que alguien
   * jugó y no lo encuentra concluye que el panel está roto.
   *
   * Quien SÍ agrega entre estudiantes —panel_resumen y panel_tendencia— las
   * excluye en su propio SQL. Y los agregados que se calculan en el cliente
   * (alertas, Destacados, promedios de cohorte) salen todos de una sola
   * definición de cohorte, que filtra por esta columna una vez.
   */
  es_prueba          boolean
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_email  text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_inicio timestamptz;
  v_14d    timestamptz;
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;

  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  /* Ciclo semanal en horario de Bogotá, igual que los rankings. */
  v_inicio := date_trunc('week', now() at time zone 'America/Bogota') at time zone 'America/Bogota';
  /* Catorce días hacia atrás desde ahora, no desde el lunes: la ventana se
     mueve con el día, que es lo que quiere decir "últimamente". */
  v_14d := now() - interval '14 days';

  return query
  with h as (
    select * from public.fp_history where subject_id = p_subject
  ),
  agregado as (
    select
      h.user_id,
      sum(h.fp_awarded)::bigint                                            as fp_total,
      sum(h.fp_awarded) filter (where h.created_at >= v_inicio)::bigint    as fp_ciclo,
      max(h.created_at)                                                    as ultima,
      min(h.created_at)                                                    as primera,
      array_agg(distinct h.activity_id)                                    as actividades,
      count(*)::bigint                                                     as n_registros,
      avg(h.correct_pct) filter (where h.modality = 'evaluativa')          as pct_eval,
      count(*) filter (where h.modality = 'evaluativa')::bigint            as n_eval,
      avg(h.correct_pct) filter (where h.modality = 'exploratoria')        as pct_expl,
      count(*) filter (where h.modality = 'exploratoria')::bigint          as n_expl,
      /* Cruza con el % de aciertos para la señal informativa de "iba deprisa". */
      avg(h.duration_ms)                                                   as dur_media,
      /*
       * Ventana de 14 días. Los bonos de racha se excluyen de los días activos
       * por modality y no por un like sobre el id: son las únicas filas con
       * modality 'racha' y un día en el que solo se cobró un bono no es un día
       * en el que el estudiante hizo algo.
       */
      avg(h.correct_pct) filter (
        where h.modality = 'evaluativa' and h.created_at >= v_14d
      )                                                                    as pct_eval_14d,
      count(*) filter (
        where h.modality = 'evaluativa' and h.created_at >= v_14d
      )::bigint                                                            as n_eval_14d,
      count(distinct (h.created_at at time zone 'America/Bogota')::date) filter (
        where h.created_at >= v_14d and h.modality <> 'racha'
      )::integer                                                           as dias_14d
    from h
    group by h.user_id
  )
  select
    a.user_id,
    p.nickname,
    p.full_name,
    (g.user_id is not null) as en_mi_grupo,
    coalesce(a.fp_total, 0),
    coalesce(a.fp_ciclo, 0),
    a.ultima,
    extract(day from (now() - a.ultima))::integer as dias_inactivo,
    a.primera,
    a.actividades,
    a.n_registros,
    a.pct_eval,
    a.n_eval,
    a.pct_expl,
    a.n_expl,
    a.dur_media,
    a.pct_eval_14d,
    a.n_eval_14d,
    coalesce(a.dias_14d, 0),
    coalesce(p.es_prueba, false)
  from agregado a
  join public.profiles p on p.user_id = a.user_id
  left join public.docente_grupo g
    on g.user_id = a.user_id
   and g.subject_id = p_subject
   and g.docente_email = v_email
  order by a.ultima desc;
end;
$$;

-- ── 6. Permisos ──────────────────────────────────────────────────────────────
/*
 * El revoke de panel_estudiantes NO es redundante: el drop de arriba se llevó
 * sus permisos y la función renació ejecutable por `public`. Sin esta línea el
 * panel entero quedaría al alcance de la clave anónima.
 *
 * Los otros dos se reemiten por simetría; con create or replace se conservan,
 * pero repetirlos cuesta nada y quita la duda de si hacía falta.
 */
revoke all on function public.panel_estudiantes(text) from public, anon;
revoke all on function public.panel_resumen(text) from public, anon;
revoke all on function public.panel_tendencia(text, integer) from public, anon;

grant execute on function public.panel_estudiantes(text) to authenticated;
grant execute on function public.panel_resumen(text) to authenticated;
grant execute on function public.panel_tendencia(text, integer) to authenticated;

commit;
