-- ---------------------------------------------------------------------------
-- 0024 — Quién es quién en una actividad, y el umbral de celda se retira.
--
-- DOS COSAS, Y LA SEGUNDA ES UNA DECISIÓN DE PRIVACIDAD TOMADA A PROPÓSITO.
--
-- ═══════════ 1. panel_grupo_actividad: la tabla de estudiantes ═══════════
--
-- La vista por actividad decía que hay uno en banda baja y no a quién
-- acompañar. Esta función devuelve una fila por estudiante con su mejor
-- porcentaje, sus FP y cuántas veces la intentó.
--
-- FUNCIÓN NUEVA Y NO UNA COLUMNA MÁS EN panel_actividad, por dos razones. La
-- forma no encaja —una devuelve un agregado y la otra N filas— y, sobre todo,
-- ampliar el RETURNS TABLE de panel_actividad cambia su tipo de retorno, lo
-- que obliga a drop + create. El drop se lleva los grants, y una función
-- recién creada nace ejecutable por public, que en Supabase incluye a anon. Es
-- la maniobra que ya causó un incidente; no se repite por comodidad.
--
-- ═══════════ 2. El umbral de celda sale de panel_actividad ═══════════
--
-- La nota larga está dentro, encima de la función. En resumen: el anonimato
-- protege a los estudiantes entre sí, no de su profesor; con la tabla de
-- nombres justo debajo, suprimir el recuento era una protección aparente. Se
-- comprobó antes de tocarlo que ese umbral no vive en ningún camino de
-- estudiante: era el único del esquema.
--
-- panel_actividad va con create or replace y SIN cambio de firma, así que no
-- hay drop, no se pierden grants y no hay ventana sin función.
--
-- ADITIVA salvo por el comportamiento del umbral. No toca ninguna tabla, ni
-- una sola fila de fp_history.
--
-- ═══════════ CÓMO SE GENERÓ ═══════════
--
-- panel_actividad NO se escribió a mano: se derivó de la 0023 con un script
-- que la extrae tal cual y aplica los cinco cambios declarados —uno por
-- distribucion_visible, tres por las bandas y la constante que se va—,
-- comprobando que cada uno ocurre exactamente una vez y que siguen presentes
-- las guardas de autorización, el filtro de cuentas de prueba y los dos cortes
-- de banda. Cualquier otra diferencia con la 0023 sería un error.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase.
-- ---------------------------------------------------------------------------

/*
 * ═══════════ LAS BANDAS SE CUENTAN POR ESTUDIANTE ═══════════
 *
 * Con su MEJOR correct_pct en esa actividad, no por intento. Contando
 * intentos, quien repite tres veces pesaría el triple en la distribución y la
 * curva hablaría de constancia en vez de desempeño.
 *
 * Los cortes son los que el sitio ya usa —85 de Destacados y 60 de la alerta
 * ámbar—. Aquí van como números y en el cliente se importan de su módulo,
 * porque SQL no puede leer el JS; bandas.test.mjs lee este archivo y falla si
 * los dos lados dejan de coincidir.
 *
 * ═══════════ EL UMBRAL DE CELDA SE RETIRÓ, Y FUE UNA DECISIÓN ═══════════
 *
 * AQUÍ HABÍA UNA SUPRESIÓN POR CELDA PEQUEÑA. Si alguna banda no vacía tenía
 * menos de tres estudiantes, los tres recuentos volvían en null y
 * distribucion_visible en false, para que una banda de una persona no la
 * señalara.
 *
 * SE QUITÓ A PROPÓSITO, no por descuido. Quien lea esto dentro de seis meses
 * no debe reponerlo creyendo que se perdió en una edición.
 *
 * La razón: el anonimato protege a los estudiantes ENTRE SÍ, no de su
 * profesor. Un docente mirando su propio grupo curado tiene derecho legítimo
 * a ver quién es quién —es la función del panel y es lo que le permite
 * acompañar a alguien que va mal— y debajo de esta distribución va ahora una
 * tabla con nombres, puntajes e intentos. Ocultar el recuento no ocultaba
 * nada: dejaba una protección aparente sobre un dato que la tabla de al lado
 * da entero.
 *
 * Y ANTES DE QUITARLO SE COMPROBÓ DÓNDE MÁS VIVÍA UN UMBRAL ASÍ, porque en un
 * camino de estudiante la razón original seguiría en pie. No vive en ninguno:
 * era el único de todo el esquema, las seis funciones panel_* llevan la guarda
 * es_docente() y ninguna pantalla de estudiante enseña una distribución de su
 * cohorte. El ranking y las ligas muestran personas por apodo, que es su
 * diseño declarado —el apodo es público, el nombre no— y ahí no hay agregado
 * que suprimir.
 *
 * SI ALGÚN DÍA SE AÑADE UNA VISTA DE COHORTE PARA ESTUDIANTES, el umbral
 * vuelve a hacer falta ahí. No aquí.
 *
 * distribucion_visible se queda, con otro significado: ahora dice solo si hay
 * algo que repartir —al menos un estudiante con porcentaje—. Se conserva la
 * columna en vez de borrarla porque quitarla cambiaría el tipo de retorno, y
 * eso obliga a drop + create, que se lleva los grants: es exactamente la
 * maniobra que dejó dos firmas vivas de registrar_fp. No vale un booleano.
 *
 * ═══════════ LA POBLACIÓN DE LAS BANDAS, DICHA EN VOZ ALTA ═══════════
 *
 * Las bandas cuentan a TODOS los que terminaron la actividad en la materia,
 * sin cuentas de prueba — no solo al grupo del docente. La tabla de abajo
 * (panel_grupo_actividad) sí es del grupo. Son dos poblaciones distintas y por
 * eso el cliente etiqueta cada una: es el mismo error que ya se corrigió en la
 * cabecera del panel, donde el número era correcto y la etiqueta mentía.
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
         then (select con_pct > 0 from bandas)
         else false end,
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
         then (select alta::integer from bandas) end,
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
         then (select media::integer from bandas) end,
    case when (select max(pa.modality) from por_alumno pa) = 'evaluativa'
         then (select baja::integer from bandas) end,
    (select round(avg(h.duration_ms), 0) from h),
    (select round(avg(h.fp_awarded), 1) from h),
    (select n from det),
    (select desde from det);
end;
$$;

-- ── panel_grupo_actividad: una fila por estudiante ──────────────────────────
/*
 * Quién es quién en esta actividad, para poder acompañar a alguien concreto.
 *
 * ═══════════ DE QUIÉN HABLA ═══════════
 *
 * Del GRUPO CURADO del docente en esta materia. Si todavía no armó grupo, de
 * todos los que tienen actividad — la misma convención que el resto del panel,
 * que prefiere hablar de todos antes que no hablar, y decirlo.
 *
 * EL FILTRO ES DEL SERVIDOR. Los nombres de quien no está en el grupo no salen
 * de aquí, así que no se pueden leer en la respuesta de red aunque la interfaz
 * cambie o alguien mire la pestaña de red del navegador.
 *
 * ═══════════ LAS CUENTAS DE PRUEBA VIENEN, MARCADAS ═══════════
 *
 * Coherente con lo ya decidido para el panel principal: la fila se enseña con
 * su distintivo en vez de desaparecer, porque un docente que ve una fila de más
 * de las que suman los promedios tiene que poder leer por qué sin abrir nada.
 * Siguen fuera de todos los agregados de panel_actividad, que las excluye en su
 * propio SQL.
 *
 * ═══════════ EL ORDEN ═══════════
 *
 * De menor a mayor porcentaje. La pregunta que trae aquí a un docente es "a
 * quién acompaño", y la respuesta tiene que estar arriba, no al final de la
 * tabla. Quien no tenga porcentaje —una exploratoria— va al final.
 *
 * ═══════════ COHERENCIA CON LAS BANDAS ═══════════
 *
 * mejor_pct es max(correct_pct), exactamente lo mismo con lo que panel_actividad
 * reparte las bandas. Si las dos se separaran, la tabla enseñaría a alguien en
 * un sitio y la distribución lo contaría en otro.
 *
 * fp_total es la SUMA de lo que esa actividad le dejó, no el mejor intento: el
 * motor paga la primera vez y las repeticiones dan cero, así que sumar es lo
 * que responde "cuántos FP le dio esto".
 *
 * LOS BONOS DE RACHA NO SON INTENTOS y se filtran por modality, no por el texto
 * del id: 'racha' es lo que el motor escribe, y un filtro por nombre se rompe
 * el día que un id cambie de forma.
 */
create or replace function public.panel_grupo_actividad(p_subject text, p_activity_id text)
returns table (
  user_id   uuid,
  nickname  text,
  full_name text,
  es_prueba boolean,
  mejor_pct numeric,
  fp_total  bigint,
  intentos  integer,
  ultimo    timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_email     text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_hay_grupo boolean;
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;

  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.docente_grupo g
     where g.docente_email = v_email and g.subject_id = p_subject
  ) into v_hay_grupo;

  return query
  with hh as (
    select f.*
      from public.fp_history f
     where f.subject_id = p_subject
       and f.activity_id = p_activity_id
       and f.modality <> 'racha'
  )
  select
    pr.user_id,
    pr.nickname,
    pr.full_name,
    pr.es_prueba,
    max(hh.correct_pct),
    sum(hh.fp_awarded)::bigint,
    count(*)::integer,
    max(hh.created_at)
  from hh
  join public.profiles pr on pr.user_id = hh.user_id
  where (not v_hay_grupo)
     or exists (
          select 1 from public.docente_grupo g
           where g.docente_email = v_email
             and g.subject_id = p_subject
             and g.user_id = hh.user_id
        )
  group by pr.user_id, pr.nickname, pr.full_name, pr.es_prueba
  order by max(hh.correct_pct) asc nulls last, pr.nickname;
end;
$$;

-- ── Permisos ────────────────────────────────────────────────────────────────
/*
 * El revoke es obligatorio aunque la función sea nueva: toda función nace
 * ejecutable por `public`, que en Supabase incluye a `anon`. Sin esto, la tabla
 * de nombres y puntajes quedaría al alcance de la clave anónima.
 *
 * El de panel_actividad se reemite por costumbre: create or replace no se lleva
 * los grants, pero deja el archivo completo si alguien lo corriera sobre una
 * base donde la función no existiera.
 */
revoke all on function public.panel_grupo_actividad(text, text) from public, anon;
revoke all on function public.panel_actividad(text, text) from public, anon;

grant execute on function public.panel_grupo_actividad(text, text) to authenticated;
grant execute on function public.panel_actividad(text, text) to authenticated;
