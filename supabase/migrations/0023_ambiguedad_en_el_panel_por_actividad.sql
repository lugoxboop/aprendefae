-- ---------------------------------------------------------------------------
-- 0023 — Las dos funciones del panel por actividad dejan de ser ambiguas.
--
-- CORRECTIVA. Reescribe panel_actividad y panel_items con create or replace,
-- sin cambiar su firma ni su tipo de retorno. No hay drop, así que NO se
-- pierden los grants y no hay ventana sin función. No toca ninguna tabla, ni
-- una sola fila de fp_history.
--
-- ═══════════ QUÉ ESTABA MAL ═══════════
--
--   42702: column reference "modality" is ambiguous
--
-- En plpgsql, las columnas del RETURNS TABLE son PARÁMETROS DE SALIDA, y por
-- tanto variables en ámbito dentro del cuerpo. La 0021 tiene una CTE
-- —por_alumno— con columnas llamadas `modality` y `difficulty`, y las
-- referenciaba sin cualificar:
--
--     (select max(modality) from por_alumno)
--
-- Postgres no puede saber si eso es la columna de la CTE o el parámetro de
-- salida del mismo nombre, y aborta. La corrección es una sola cosa repetida:
-- ponerle alias a la CTE y cualificar la referencia.
--
-- ═══════════ Y panel_items TENÍA EL MISMO FALLO, SIN QUE SE VIERA ═══════════
--
-- `select item_id, respuesta, n from (...) x` choca igual con el parámetro de
-- salida `item_id`. No se manifestó porque la función devuelve pronto cuando
-- hay menos de cinco intentos con detalle, y hoy ninguna actividad llega: el
-- Arca tiene cuatro registros y ninguno con captura. Habría reventado el primer
-- día que una actividad cruzara ese umbral, que es exactamente cuando el
-- diagnóstico por pregunta empieza a servir para algo.
--
-- ═══════════ POR QUÉ NO LO VIO NADIE ═══════════
--
-- `create function` solo ANALIZA la sintaxis del cuerpo; no resuelve nombres
-- de columna. Por eso la 0021 dio "Success. No rows returned" con las dos
-- funciones rotas, y por eso una sonda que llama sin sesión —y se conforma con
-- el 42501 de la guarda— da verde igual: el 42501 se levanta ANTES de llegar a
-- la consulta ambigua. Solo ejecutar el cuerpo entero, con las guardas
-- satisfechas, lo saca.
--
-- El test que acompaña a esta migración hace justamente eso: siembra un docente
-- en la transacción, ejecuta las dos funciones y comprueba que DEVUELVEN FILAS.
--
-- ═══════════ CÓMO SE GENERÓ ═══════════
--
-- Este archivo NO se escribió a mano: se derivó de la 0021 con un script que
-- extrae las dos funciones tal cual, aplica los ocho reemplazos —seis de
-- modality, uno de difficulty, uno de item_id— comprobando que cada uno ocurre
-- el número exacto de veces esperado, y verifica que las guardas de
-- autorización, el filtro de cuentas de prueba y los tres umbrales siguen
-- presentes. Cualquier otra diferencia con la 0021 sería un error.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase.
-- ---------------------------------------------------------------------------

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
    (select max(pa.modality) from por_alumno pa),
    (select max(pa.difficulty) from por_alumno pa),
    (select count(*)::integer from por_alumno),
    (select count(*)::integer from por_alumno pa
       join public.docente_grupo g on g.user_id = pa.user_id
      where g.docente_email = v_email and g.subject_id = p_subject),
    (select total from grupo),
    (select count(*) from h),
    /* El desempeño solo tiene sentido en evaluativa. */
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
         then (select round(avg(mejor_pct), 1) from por_alumno) end,
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
         then (select con_pct > 0 and least(
                 case when alta  > 0 then alta  else 999 end,
                 case when media > 0 then media else 999 end,
                 case when baja  > 0 then baja  else 999 end
               ) >= c_min_celda from bandas)
         else false end,
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
          and (select con_pct > 0 and least(
                 case when alta  > 0 then alta  else 999 end,
                 case when media > 0 then media else 999 end,
                 case when baja  > 0 then baja  else 999 end
               ) >= c_min_celda from bandas)
         then (select alta::integer from bandas) end,
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
          and (select con_pct > 0 and least(
                 case when alta  > 0 then alta  else 999 end,
                 case when media > 0 then media else 999 end,
                 case when baja  > 0 then baja  else 999 end
               ) >= c_min_celda from bandas)
         then (select media::integer from bandas) end,
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
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
    select x.item_id, x.respuesta, x.n from (
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

-- ---------------------------------------------------------------------------
-- Permisos.
--
-- create or replace NO se lleva los grants —eso solo lo hace drop— así que
-- esto es defensivo: reemitirlos cuesta nada y deja el archivo completo si
-- algún día alguien lo corre sobre una base donde las funciones no existan.
-- ---------------------------------------------------------------------------
revoke all on function public.panel_actividad(text, text) from public, anon;
revoke all on function public.panel_items(text, text) from public, anon;

grant execute on function public.panel_actividad(text, text) to authenticated;
grant execute on function public.panel_items(text, text) to authenticated;
