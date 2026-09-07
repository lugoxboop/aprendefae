-- ---------------------------------------------------------------------------
-- 0021 — El panel, mirado por actividad en vez de por estudiante.
--
-- Todo lo que hay agrega por PERSONA: quién se descuelga, cómo le va a cada
-- uno. Esto responde la otra pregunta —«¿cómo le fue al grupo en ESTA
-- actividad?»— sin tener que cruzar el curso entero.
--
-- Dos funciones, no una:
--   panel_actividad  las cifras de una actividad: finalización, distribución,
--                    tiempo, FP, y la procedencia del diagnóstico
--   panel_items      el diagnóstico por pregunta de esa misma actividad
--
-- SEPARADAS A PROPÓSITO. Devolver los ítems anidados en un jsonb dentro de la
-- primera obligaría a construir y transportar el diagnóstico incluso cuando la
-- actividad no tiene ítems o cuando no hay bastantes intentos para enseñarlo.
--
-- ═══════════ NADA NUEVO EN EL MODELO DE ACCESO ═══════════
--
-- Las mismas dos guardas de panel_estudiantes: es_docente() y materia
-- autorizada, con el mismo errcode 42501. Y el mismo `and not pr.es_prueba`:
-- la exclusión de cuentas de prueba se aplica AQUÍ, en el SQL de cada función,
-- no heredada de nadie.
--
-- ADITIVA: solo crea. No toca ninguna función existente, así que no hay drop,
-- ni ventana sin función, ni permisos que reemitir por haberlos perdido.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase.
-- ---------------------------------------------------------------------------

-- ── 1. Las cifras de una actividad ──────────────────────────────────────────
/*
 * ═══════════ LAS BANDAS SE CUENTAN POR ESTUDIANTE ═══════════
 *
 * Con su MEJOR correct_pct en esa actividad, no por intento. Contando intentos,
 * quien repite tres veces pesaría el triple en la distribución y la curva
 * hablaría de constancia en vez de desempeño.
 *
 * ═══════════ LOS CORTES SON LOS QUE EL SITIO YA USA ═══════════
 *
 *   alto   >= 85   es UMBRALES_DESTACADO.precisionPct, el listón de
 *                  "precisión sostenida" en Destacados
 *   bajo   <  60   es UMBRALES.pctEvaluativaBaja, el que dispara la alerta
 *                  ámbar del panel, y el mismo 60 que ya reparten cinco
 *                  mecánicas para separar teal de coral
 *
 * No son una escala nueva: son las dos líneas que el proyecto ya trazó. Así,
 * un estudiante en banda baja aquí es EXACTAMENTE el que tiene alerta ámbar
 * allá.
 *
 * AQUÍ VAN COMO NÚMEROS Y EN EL CLIENTE SE IMPORTAN DE SU MÓDULO, porque SQL
 * no puede leer el JS. Esa duplicación es real y por eso hay una prueba que
 * falla si los dos lados dejan de coincidir: es la única forma de que mover un
 * umbral no deje dos verdades.
 *
 * ═══════════ EL UMBRAL DE CELDA, Y POR QUÉ VIVE AQUÍ ═══════════
 *
 * Con trece estudiantes activos, una banda con una sola persona la nombra —y
 * más cruzándola con el panel, donde el docente ve quién está en riesgo—. Si
 * alguna banda no vacía tiene menos de MIN_CELDA estudiantes, los tres
 * recuentos vuelven en null y `distribucion_visible` en false.
 *
 * Se decide en el servidor y no al pintar por tres razones: el próximo
 * consumidor no tiene que acordarse; los recuentos exactos NI SIQUIERA LLEGAN
 * al navegador, así que no se pueden leer en la respuesta de red; y el umbral
 * queda en un solo sitio para subirlo o bajarlo cuando la cohorte crezca.
 */
create or replace function public.panel_actividad(p_subject text, p_activity_id text)
returns table (
  activity_id           text,
  modality              text,
  difficulty            text,
  /* Cobertura, sobre todo el historial */
  completaron           integer,
  en_grupo              integer,
  grupo_total           integer,
  intentos              bigint,
  /* Desempeño. Todo null si la actividad es exploratoria. */
  pct_medio             numeric,
  distribucion_visible  boolean,
  banda_alta            integer,
  banda_media           integer,
  banda_baja            integer,
  /* Esfuerzo */
  duracion_media_ms     numeric,
  fp_medio              numeric,
  /* Procedencia del diagnóstico */
  intentos_con_detalle  integer,
  detalle_desde         timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_email     text := lower(coalesce(auth.jwt() ->> 'email', ''));
  /* Menos de tres personas en una banda no vacía y la banda señala a alguien. */
  c_min_celda constant integer := 3;
  c_alto      constant numeric := 85;
  c_bajo      constant numeric := 60;
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;

  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  return query
  with h as (
    /* Sin cuentas de prueba y sin bonos de racha, que no son intentos. */
    select f.*
      from public.fp_history f
      join public.profiles pr on pr.user_id = f.user_id
     where f.subject_id = p_subject
       and f.activity_id = p_activity_id
       and f.modality <> 'racha'
       and not pr.es_prueba
  ),
  por_alumno as (
    select h.user_id,
           max(h.correct_pct) as mejor_pct,
           max(h.modality)    as modality,
           max(h.difficulty)  as difficulty
      from h group by h.user_id
  ),
  bandas as (
    select
      count(*) filter (where mejor_pct >= c_alto)                      as alta,
      count(*) filter (where mejor_pct >= c_bajo and mejor_pct < c_alto) as media,
      count(*) filter (where mejor_pct <  c_bajo)                      as baja,
      count(*) filter (where mejor_pct is not null)                    as con_pct
    from por_alumno
  ),
  det as (
    /*
     * activity_id es único en todo el catálogo —es su clave primaria— así que
     * no hace falta cruzar con fp_history para acotar la materia.
     */
    select count(distinct d.fp_history_id)::integer as n, min(d.created_at) as desde
      from public.fp_detalle d
      join public.profiles pr on pr.user_id = d.user_id
     where d.activity_id = p_activity_id and not pr.es_prueba
  ),
  grupo as (
    select count(*)::integer as total
      from public.docente_grupo g
     where g.docente_email = v_email and g.subject_id = p_subject
  )
  select
    p_activity_id,
    (select max(modality) from por_alumno),
    (select max(difficulty) from por_alumno),
    (select count(*)::integer from por_alumno),
    (select count(*)::integer from por_alumno pa
       join public.docente_grupo g on g.user_id = pa.user_id
      where g.docente_email = v_email and g.subject_id = p_subject),
    (select total from grupo),
    (select count(*) from h),
    /* El desempeño solo tiene sentido en evaluativa. */
    case when (select max(modality) from por_alumno) = 'evaluativa'
         then (select round(avg(mejor_pct), 1) from por_alumno) end,
    case when (select max(modality) from por_alumno) = 'evaluativa'
         then (select con_pct > 0 and least(
                 case when alta  > 0 then alta  else 999 end,
                 case when media > 0 then media else 999 end,
                 case when baja  > 0 then baja  else 999 end
               ) >= c_min_celda from bandas)
         else false end,
    case when (select max(modality) from por_alumno) = 'evaluativa'
          and (select con_pct > 0 and least(
                 case when alta  > 0 then alta  else 999 end,
                 case when media > 0 then media else 999 end,
                 case when baja  > 0 then baja  else 999 end
               ) >= c_min_celda from bandas)
         then (select alta::integer from bandas) end,
    case when (select max(modality) from por_alumno) = 'evaluativa'
          and (select con_pct > 0 and least(
                 case when alta  > 0 then alta  else 999 end,
                 case when media > 0 then media else 999 end,
                 case when baja  > 0 then baja  else 999 end
               ) >= c_min_celda from bandas)
         then (select media::integer from bandas) end,
    case when (select max(modality) from por_alumno) = 'evaluativa'
          and (select con_pct > 0 and least(
                 case when alta  > 0 then alta  else 999 end,
                 case when media > 0 then media else 999 end,
                 case when baja  > 0 then baja  else 999 end
               ) >= c_min_celda from bandas)
         then (select baja::integer from bandas) end,
    (select round(avg(h.duration_ms), 0) from h),
    (select round(avg(h.fp_awarded), 1) from h),
    (select n from det),
    (select desde from det);
end;
$$;

-- ── 2. El diagnóstico por pregunta de esa actividad ─────────────────────────
/*
 * Una fila por ítem, con lo que un docente puede llevar a clase: cuántos lo
 * fallaron y QUÉ contestaron en su lugar.
 *
 * ═══════════ EL MÍNIMO DE CINCO INTENTOS ═══════════
 *
 * Por debajo de cinco intentos con captura NO DEVUELVE NADA. Con tres
 * intentos, «2 de 3 fallaron el ítem X» casi señala con el dedo, y además no
 * es un diagnóstico: es una anécdota. Cambiar una actividad que no tenía nada
 * malo por lo que hicieron tres personas es peor que no tener la sección.
 *
 * Que la sección esté vacía por FALTA DE INTENTOS y no porque la actividad no
 * tenga ítems lo decide el cliente con `sinItems` de subjects.js: son dos
 * vacíos distintos y se leen distinto.
 *
 * `respuesta_top` es la equivocación más repetida. Es lo único de aquí que
 * responde «en qué se confunden» en vez de «cuánto fallan».
 */
create or replace function public.panel_items(p_subject text, p_activity_id text)
returns table (
  item_id        text,
  veces          integer,
  fallos         integer,
  pct_fallo      numeric,
  respuesta_top  text,
  respuesta_top_veces integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  c_min_intentos constant integer := 5;
  v_intentos integer;
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;

  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  select count(distinct d.fp_history_id) into v_intentos
    from public.fp_detalle d
    join public.fp_history h on h.id = d.fp_history_id
    join public.profiles pr on pr.user_id = d.user_id
   where d.activity_id = p_activity_id
     and h.subject_id = p_subject
     and not pr.es_prueba;

  if coalesce(v_intentos, 0) < c_min_intentos then
    return;   /* Cero filas. El cliente ya sabe por qué: se lo dijo panel_actividad. */
  end if;

  return query
  with d as (
    select dd.*
      from public.fp_detalle dd
      join public.fp_history h on h.id = dd.fp_history_id
      join public.profiles pr on pr.user_id = dd.user_id
     where dd.activity_id = p_activity_id
       and h.subject_id = p_subject
       and not pr.es_prueba
  ),
  por_item as (
    select d.item_id,
           count(*)::integer                              as veces,
           count(*) filter (where not d.acerto)::integer  as fallos
      from d group by d.item_id
  ),
  top as (
    /*
     * La equivocación más repetida de cada ítem. Con row_number y no con
     * distinct on: distinct on sobre un group by es válido pero se lee mal, y
     * esto lo va a mantener alguien que no escribió la consulta.
     *
     * El desempate por `respuesta` no es decorativo: sin él, dos respuestas
     * empatadas devolverían una u otra según el plan y el panel enseñaría cosas
     * distintas en dos recargas seguidas.
     */
    select item_id, respuesta, n from (
      select d.item_id, d.respuesta, count(*)::integer as n,
             row_number() over (
               partition by d.item_id order by count(*) desc, d.respuesta
             ) as rn
        from d
       where not d.acerto and d.respuesta is not null
       group by d.item_id, d.respuesta
    ) x where rn = 1
  )
  select p.item_id, p.veces, p.fallos,
         round((p.fallos * 100.0) / nullif(p.veces, 0), 1),
         t.respuesta, t.n
    from por_item p
    left join top t on t.item_id = p.item_id
   order by p.fallos desc, p.item_id;
end;
$$;

-- ── 3. Permisos ─────────────────────────────────────────────────────────────
/*
 * Aditiva, así que aquí no hay grants perdidos que reemitir — pero el revoke
 * sigue siendo obligatorio: toda función nace ejecutable por `public`, que en
 * Supabase incluye a `anon`.
 */
revoke all on function public.panel_actividad(text, text) from public, anon;
revoke all on function public.panel_items(text, text) from public, anon;

grant execute on function public.panel_actividad(text, text) to authenticated;
grant execute on function public.panel_items(text, text) to authenticated;
