-- ---------------------------------------------------------------------------
-- 0019 — El panel docente recuerda la última visita, y sabe contar historia.
--
-- Trae tres cosas:
--   · docentes.ultima_visita, para el delta del resumen de cabecera
--   · panel_resumen(), que devuelve ese delta y AVANZA la marca
--   · panel_historial(), el historial de un estudiante agrupado por actividad
-- y modifica panel_estudiantes() para añadirle una ventana de 14 días.
--
-- ═══════════ POR QUÉ ESTA MIGRACIÓN VA DENTRO DE UNA TRANSACCIÓN ═══════════
--
-- Es la primera del proyecto que lo hace, y no es capricho.
--
-- Añadir columnas al `returns table` CAMBIA EL TIPO DE RETORNO, y Postgres no
-- deja hacer eso con create or replace: "cannot change return type of existing
-- function". Hace falta un drop y un create.
--
-- Un drop y un create sueltos dejan una ventana —corta, pero real— en la que
-- panel_estudiantes NO EXISTE. Si el script se interrumpe entre los dos, el
-- panel docente se queda sin su función principal hasta que alguien lo note.
-- Es el mismo accidente que el de registrar_fp de la semana pasada visto del
-- revés: allí quedaron dos versiones vivas, aquí podrían quedar cero.
--
-- El DDL en Postgres es transaccional, así que begin/commit lo vuelve
-- atómico: o están las dos cosas o no está ninguna. Nadie ve el hueco.
--
-- ═══════════ Y LA TRAMPA DE LOS PERMISOS ═══════════
--
-- DROP FUNCTION SE LLEVA SUS GRANTS. Una función recién creada nace ejecutable
-- por `public`, que en Supabase incluye a `anon`. Si esta migración no
-- reemitiera el revoke, el panel docente entero —con nombres reales de
-- estudiantes— quedaría al alcance de cualquiera con la clave anónima.
--
-- Por eso el revoke y el grant se repiten abajo aunque la 0005 ya los tuviera,
-- y por eso el test los comprueba explícitamente.
--
-- ═══════════ ORDEN DE DESPLIEGUE ═══════════
--
-- Los dos órdenes son seguros, pero el bueno es MIGRACIÓN PRIMERO.
--
--   · Migración antes que el push: el cliente viejo ignora las columnas nuevas
--     y no llama a las funciones nuevas. No se entera de nada.
--   · Push antes que la migración: el cliente nuevo pide columnas que todavía
--     no existen (llegan undefined) y llama a dos funciones que no existen
--     (PGRST202). Está escrito para aguantarlo: Destacados se queda solo con
--     el top de la semana, el resumen omite el delta y la fila expandida dice
--     que el historial no está disponible. Se degrada, no se rompe.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada.
-- ---------------------------------------------------------------------------

begin;

-- ── 1. La marca de última visita ─────────────────────────────────────────────
/*
 * ANULABLE Y SIN DEFAULT a propósito. `null` significa "nunca ha abierto el
 * panel", que no es lo mismo que "abrió hace mucho": con null la cabecera dice
 * "primera visita" en vez de inventar un cero o un delta desde el principio de
 * los tiempos.
 */
alter table public.docentes
  add column if not exists ultima_visita timestamptz;

-- ── 2. panel_resumen: el delta, y avanzar la marca ───────────────────────────
/*
 * ═══════════ LA VENTANA DE GRACIA DE 30 MINUTOS ═══════════
 *
 * La marca se escribe AL ABRIR, no al cerrar. No es preferencia: no hay evento
 * de cierre fiable en web. `beforeunload` no dispara cuando el sistema mata la
 * pestaña en móvil, ni al cambiar de app, ni si se cae la red. Con "al cerrar"
 * la marca a veces no se escribiría nunca y el delta crecería sin límite hasta
 * parecer roto.
 *
 * Pero la marca SOLO AVANZA SI LA ANTERIOR TIENE MÁS DE 30 MINUTOS. Un solo
 * mecanismo resuelve cuatro cosas:
 *
 *   · el docente abre, se distrae y vuelve a los diez minutos: ve el mismo delta
 *   · recargar la página no lo borra
 *   · un clic sin querer no cuesta nada
 *   · React monta dos veces en desarrollo (StrictMode) y la segunda llamada no
 *     se come el delta de la primera
 *
 * Media hora porque una clase dura unos cincuenta minutos: aguanta una
 * distracción y una recarga, y es lo bastante corta para que "qué hay nuevo"
 * siga queriendo decir algo dentro del mismo día.
 *
 * EL LÍMITE, DICHO: si el docente deja el panel abierto dos horas y recarga al
 * minuto 45, la marca avanza y pierde el delta de esos 45 minutos. A los 45
 * minutos mirando la pantalla eso ya no era información.
 *
 * NO DEVUELVE RECUENTOS DE ALERTAS. Las alertas se calculan en el cliente, en
 * alertas.js, sobre lo que devuelve panel_estudiantes(). Duplicar esas reglas
 * aquí crearía dos verdades sobre lo mismo, que se separan en la primera
 * modificación.
 *
 * `actividades_nuevas` devuelve ids, no frases: el cliente los agrupa por tema
 * con subjects.js. El servidor no conoce los temas y no debe empezar a
 * conocerlos.
 *
 * ES VOLATILE, no stable: escribe. Por eso vive aparte de panel_estudiantes,
 * que sigue siendo stable y de solo lectura.
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

  /* El valor ANTERIOR: el delta se mide contra él, no contra el nuevo. */
  select d.ultima_visita into v_desde
    from public.docentes d
   where lower(d.email) = v_email;

  v_inicio := date_trunc('week', now() at time zone 'America/Bogota') at time zone 'America/Bogota';

  return query
  with h as (
    select * from public.fp_history where subject_id = p_subject
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

  /* Y ahora sí, la marca avanza — solo si la anterior ya estaba vieja. */
  update public.docentes
     set ultima_visita = now()
   where lower(email) = v_email
     and (ultima_visita is null or ultima_visita < now() - interval '30 minutes');
end;
$$;

-- ── 3. panel_historial: un estudiante, agrupado por actividad ────────────────
/*
 * UNA FILA POR ACTIVIDAD, no por intento. Es lo que convierte treinta filas
 * sueltas en ocho líneas y hace visible "lo intentó tres veces y sigue en 40%".
 *
 * LOS BONOS DE RACHA FUERA CON `modality <> 'racha'`, no con un like sobre el
 * activity_id. Los bonos se insertan con difficulty 'bono' y modality 'racha',
 * y son las únicas filas con esa modalidad. Un like sobre el id sería otro
 * filtro de texto de los que ya han fallado tres veces en este proyecto.
 *
 * MEJOR_PCT Y MEJOR_FP VAN SEPARADOS. En las exploratorias correct_pct puede
 * ser null y el FP no depende del acierto, así que un solo campo "mejor
 * resultado" mentiría en la mitad de las filas.
 *
 * PRIMER_INTENTO sale gratis del mismo group by, y es lo que distingue "lo
 * intentó tres veces a lo largo de dos semanas" de "tres veces la misma tarde".
 *
 * SOBRE p_user, QUE LO PONE EL CLIENTE: no lleva guarda propia y no hace falta.
 * La consulta filtra subject_id = p_subject, así que pedir el historial de
 * alguien que no ha tocado esa materia devuelve CERO FILAS, no datos de otro.
 * Un docente de Macroeconomía que pruebe el uuid de un estudiante de
 * Pensamiento Estratégico no ve nada. El test lo comprueba.
 */
create or replace function public.panel_historial(p_subject text, p_user uuid)
returns table (
  activity_id    text,
  modality       text,
  difficulty     text,
  intentos       integer,
  mejor_pct      numeric,
  mejor_fp       integer,
  fp_total       bigint,
  primer_intento timestamptz,
  ultimo_intento timestamptz
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
  select
    h.activity_id,
    min(h.modality)          as modality,
    min(h.difficulty)        as difficulty,
    count(*)::integer        as intentos,
    max(h.correct_pct)       as mejor_pct,
    max(h.fp_awarded)        as mejor_fp,
    sum(h.fp_awarded)::bigint as fp_total,
    min(h.created_at)        as primer_intento,
    max(h.created_at)        as ultimo_intento
  from public.fp_history h
  where h.subject_id = p_subject
    and h.user_id = p_user
    and h.modality <> 'racha'
  group by h.activity_id
  order by max(h.created_at) desc;
end;
$$;

-- ── 4. panel_estudiantes: la ventana de 14 días ──────────────────────────────
/*
 * EL DROP Y EL CREATE VAN JUNTOS Y EN ESTE ORDEN, dentro de la transacción de
 * arriba. La lista de argumentos NO cambia —sigue siendo (text)— así que aquí
 * no puede repetirse el PGRST203 de registrar_fp, que venía de dos listas de
 * argumentos distintas conviviendo. Lo que se protege con la transacción es lo
 * contrario: que no quede ninguna.
 *
 * El cuerpo NO está reescrito a mano. Se derivó de la 0005 con un script que
 * declara cada cambio y falla si alguno no aplica exactamente una vez, y que
 * comprueba ocho cadenas que no podían perderse: las dos guardas, el errcode,
 * el join con docente_grupo, el filtro por docente_email, el orden y dos
 * agregados. Reescribirla a mano ya salió mal una vez.
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
  dias_activos_14d   integer
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
    coalesce(a.dias_14d, 0)
  from agregado a
  join public.profiles p on p.user_id = a.user_id
  left join public.docente_grupo g
    on g.user_id = a.user_id
   and g.subject_id = p_subject
   and g.docente_email = v_email
  order by a.ultima desc;
end;
$$;

-- ── 5. Permisos ──────────────────────────────────────────────────────────────
/*
 * EL REVOKE DE panel_estudiantes NO ES REDUNDANTE aunque la 0005 ya lo tuviera:
 * el drop de arriba se llevó los permisos por delante, y una función recién
 * creada nace ejecutable por `public`. Sin esta línea, el panel docente entero
 * quedaría al alcance de la clave anónima.
 */
revoke all on function public.panel_estudiantes(text) from public, anon;
revoke all on function public.panel_resumen(text) from public, anon;
revoke all on function public.panel_historial(text, uuid) from public, anon;

grant execute on function public.panel_estudiantes(text) to authenticated;
grant execute on function public.panel_resumen(text) to authenticated;
grant execute on function public.panel_historial(text, uuid) to authenticated;

commit;
