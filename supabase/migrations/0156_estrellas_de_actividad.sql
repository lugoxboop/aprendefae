/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0156 — PUNTUAR LA ACTIVIDAD QUE SE ACABA DE HACER
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199), como la 0155: es la misma tabla de nivel
 * sitio y no pertenece a ninguna materia.
 *
 * Encargo de Mateo del 30-oct: en la pantalla de resultados, cinco estrellas
 * para puntuar la actividad de 1 a 5 y un comentario opcional. Voluntario:
 * quien no quiera, pulsa «Volver» y ya.
 *
 * ═══════════ POR QUÉ LA MISMA TABLA Y NO UNA NUEVA ═══════════
 *
 * Porque es la misma pregunta hecha en otro sitio: «¿qué te parece esto?».
 * Dos tablas significarían dos funciones, dos políticas, dos pantallas en el
 * panel y, el día que se quiera saber si quien puntúa bajo una actividad
 * también puntúa bajo el sitio, un join que nadie va a escribir. Lo que
 * cambia entre una y otra es de dónde vino, y para eso ya está `origen`.
 *
 * ═══════════ POR QUÉ SE REEMPLAZA LA FUNCIÓN Y NO SE AÑADE OTRA ═══════════
 *
 * Añadir una segunda enviar_opinion() con más parámetros deja dos funciones
 * del mismo nombre, las dos con valores por defecto: Postgres no sabría cuál
 * quiere una llamada de seis argumentos y respondería «function is not
 * unique». Así que se borra la vieja y se crea la nueva DENTRO de la misma
 * transacción: fuera de ella nunca hay un instante sin función, y como los
 * dos parámetros nuevos tienen valor por defecto, la portada que ya está
 * publicada —que llama con seis— sigue funcionando sin tocar una línea. El
 * orden importa: esta migración puede correr antes de que se despliegue la
 * pantalla nueva, y nada se rompe mientras tanto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

begin;

/*
 * Qué actividad y de qué materia. Las dos nulas en las opiniones del sitio,
 * que no hablan de ninguna actividad en concreto.
 */
alter table public.opiniones add column if not exists activity_id text;
alter table public.opiniones add column if not exists subject_id  text;

/*
 * ═══════════ EL VALE DEL COMENTARIO ═══════════
 *
 * La estrella se manda en cuanto se toca, porque un estudiante que puntúa y
 * pulsa «Volver» no puede perder su voto por no haber confirmado. Pero el
 * comentario llega después, y tiene que ir a ESA MISMA fila: si entrara como
 * una segunda opinión, la actividad quedaría contada dos veces y su media
 * mentiría.
 *
 * Así que el navegador inventa un uuid al azar para ese envío y lo guarda
 * aquí. Es un vale al portador: quien lo tenga puede escribir el comentario
 * de esa fila una sola vez y durante dos horas. No identifica a nadie —se
 * genera por envío, no por persona, y no se guarda en ningún otro sitio—,
 * así que no abre ninguna grieta en el anonimato de 0155.
 */
alter table public.opiniones add column if not exists envio uuid;
create unique index if not exists opiniones_envio_idx
  on public.opiniones (envio) where envio is not null;

/*
 * El panel va a preguntar «¿cómo va esta actividad?», que es una lectura por
 * activity_id y por fecha. Parcial: la gran mayoría de filas de opinión del
 * sitio tienen activity_id nulo y no pintan nada en este índice.
 */
create index if not exists opiniones_actividad_idx
  on public.opiniones (activity_id, creado desc)
  where activity_id is not null;

drop function if exists public.enviar_opinion(smallint, text, boolean, text[], text, text);

create function public.enviar_opinion(
  p_puntaje     smallint,
  p_texto       text    default null,
  p_anonimo     boolean default true,
  p_temas       text[]  default '{}'::text[],
  p_origen      text    default 'inicio',
  p_dispositivo text    default null,
  p_actividad   text    default null,
  p_materia     text    default null,
  p_envio       uuid    default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid    := auth.uid();
  v_anon    boolean := coalesce(p_anonimo, true);
  v_texto   text;
  v_temas   text[];
  v_apodo   text;
  v_origen  text;
  v_previas integer;
  /*
   * El tope diario, por origen. Tres opiniones del sitio bastan para
   * corregirse y sobran para que nadie llene la tabla sin querer. Las de
   * actividad son otra cosa: un estudiante aplicado cierra ocho o diez
   * actividades en una tarde y sería absurdo que la cuarta estrella no se
   * guardara. Treinta deja hacer eso dos veces y sigue siendo un tope.
   */
  v_tope    integer;
begin
  if p_puntaje is null or p_puntaje < 1 or p_puntaje > 5 then
    raise exception 'La puntuación va de 1 a 5' using errcode = '22023';
  end if;

  /* Los dos sitios desde los que se puede opinar hoy; cualquier otra cosa
     entra como opinión del sitio en vez de inventar una categoría nueva. */
  v_origen := case when p_origen = 'actividad' then 'actividad' else 'inicio' end;
  v_tope   := case when v_origen = 'actividad' then 30 else 3 end;

  /* Sin sesión no hay a quién atribuirla: es anónima quiera o no. */
  if v_uid is null then
    v_anon := true;
  end if;

  v_texto := nullif(btrim(coalesce(p_texto, '')), '');
  if v_texto is not null then
    v_texto := left(v_texto, 2000);
  end if;

  select coalesce(array_agg(t), '{}'::text[]) into v_temas
    from unnest(coalesce(p_temas, '{}'::text[])) as t
   where t in ('interfaz', 'actividades', 'ejemplos', 'rankings');

  if v_uid is not null then
    select count(*) into v_previas
      from public.opiniones
     where user_id = v_uid
       and origen = v_origen
       and creado > now() - interval '1 day';
    if v_previas >= v_tope then
      return false;
    end if;
  end if;

  if not v_anon then
    select nickname into v_apodo from public.profiles where id = v_uid;
  end if;

  insert into public.opiniones (
    puntaje, texto, anonimo, user_id, apodo, temas, origen, dispositivo,
    activity_id, subject_id, envio
  )
  values (
    p_puntaje, v_texto, v_anon,
    case when v_anon then null else v_uid end,
    case when v_anon then null else v_apodo end,
    v_temas,
    v_origen,
    case when p_dispositivo in ('telefono', 'tableta', 'escritorio') then p_dispositivo end,
    /* Solo se guardan si la opinión viene de una actividad: en una del sitio
       no significarían nada y ensuciarían el índice. */
    case when v_origen = 'actividad' then left(nullif(btrim(coalesce(p_actividad, '')), ''), 120) end,
    case when v_origen = 'actividad' then left(nullif(btrim(coalesce(p_materia,   '')), ''), 60)  end,
    p_envio
  );

  return true;
end;
$$;

revoke all on function public.enviar_opinion(smallint, text, boolean, text[], text, text, text, text, uuid) from public;
grant execute on function public.enviar_opinion(smallint, text, boolean, text[], text, text, text, text, uuid) to anon, authenticated;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * comentar_opinion — escribir el comentario en la fila que ya se mandó
 *
 * Tres cerrojos, y los tres hacen falta: el vale tiene que ser el de esa fila
 * (uuid al azar, no se adivina), la fila no puede tener comentario todavía
 * (así nadie reescribe lo que otro dijo) y no puede haber pasado de dos horas
 * (el vale caduca con la pantalla que lo creó). Devuelve false sin ruido si
 * algo de eso falla: no hay nada que explicarle a quien ya se fue.
 * ═══════════════════════════════════════════════════════════════════════════
 */
create or replace function public.comentar_opinion(p_envio uuid, p_texto text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_texto text := nullif(btrim(coalesce(p_texto, '')), '');
  v_filas integer;
begin
  if p_envio is null or v_texto is null then
    return false;
  end if;

  update public.opiniones
     set texto = left(v_texto, 2000)
   where envio = p_envio
     and texto is null
     and creado > now() - interval '2 hours';

  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;

revoke all on function public.comentar_opinion(uuid, text) from public;
grant execute on function public.comentar_opinion(uuid, text) to anon, authenticated;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * actividades_puntuadas — para el panel docente
 *
 * Una fila por actividad, ordenada por la peor nota: la pregunta que el panel
 * va a hacer no es «¿qué puntuaron?» sino «¿cuál hay que arreglar?».
 *
 * `n` va al lado de la media a propósito: 1,0 de una sola estrella y 2,1 de
 * catorce no son el mismo hallazgo, y una media sin su n invita a confundirlos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
create or replace function public.actividades_puntuadas(p_materia text default null)
returns table (
  activity_id text,
  subject_id  text,
  n           bigint,
  media       numeric,
  comentarios bigint,
  ultima      timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.es_docente() then
    raise exception 'Opiniones: no autorizado' using errcode = '42501';
  end if;

  return query
  select o.activity_id, o.subject_id,
         count(*)::bigint,
         round(avg(o.puntaje)::numeric, 2),
         count(*) filter (where o.texto is not null)::bigint,
         max(o.creado)
    from public.opiniones o
   where o.origen = 'actividad'
     and o.activity_id is not null
     and (p_materia is null or o.subject_id = p_materia)
   group by o.activity_id, o.subject_id
   order by avg(o.puntaje) asc, count(*) desc;
end;
$$;

revoke all on function public.actividades_puntuadas(text) from public, anon;
grant execute on function public.actividades_puntuadas(text) to authenticated;

commit;

/*
 * ═══════════ PARA DESHACERLO ═══════════
 *
 * drop function if exists public.actividades_puntuadas(text);
 * drop function if exists public.comentar_opinion(uuid, text);
 * alter table public.opiniones drop column if exists envio;
 * alter table public.opiniones drop column if exists activity_id;
 * alter table public.opiniones drop column if exists subject_id;
 *
 * Y volver a crear enviar_opinion con la firma de 0155. Ninguna de las dos
 * cosas toca datos de ningún estudiante.
 */
