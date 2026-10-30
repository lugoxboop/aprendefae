/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0155 — LAS OPINIONES DE LOS ESTUDIANTES SOBRE EL SITIO
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199): es una tabla nueva de nivel sitio, no de
 * una materia, así que no entra en el rango de ninguna célula.
 *
 * Encargo de Mateo del 30-oct: un botón en la portada para que los
 * estudiantes digan qué les parece la página, con puntuación, texto libre y
 * la opción de hacerlo anónimo.
 *
 * ═══════════ EL ANONIMATO ES UNA PROMESA, NO UNA CASILLA ═══════════
 *
 * La interfaz dice «nadie puede ver quién escribió esto». Si eso se cumpliera
 * solo porque el navegador manda `anonimo: true` y es amable, sería mentira:
 * cualquiera con la consola abierta podría mandar `anonimo: false` por otro.
 * Así que el anonimato se decide EN EL SERVIDOR, dentro de enviar_opinion():
 * cuando la opinión es anónima, el `user_id` no se escribe nunca — no es que
 * se esconda al leerlo, es que no existe la fila con el dato.
 *
 * Por eso tampoco se guarda agente de navegador ni ancho en píxeles. En un
 * curso de cuarenta y seis, «Chrome en un iPhone de 390 px a las 9:14 p.m.»
 * señala a una persona. Lo que de verdad hace falta para leer una queja es si
 * venía de un teléfono o de un portátil, y eso cabe en tres valores.
 *
 * ═══════════ POR QUÉ RPC Y NO UN INSERT CON POLÍTICA ═══════════
 *
 * La lección de 0011: lo que el cliente puede escribir directo, el cliente lo
 * puede falsear. No hay política de INSERT sobre la tabla; la única puerta es
 * la función, que valida el puntaje, recorta el texto, fija el anonimato y
 * frena el envío repetido. La tabla solo se puede LEER, y solo un docente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

begin;

create table if not exists public.opiniones (
  id          bigserial primary key,
  creado      timestamptz  not null default now(),
  /* 1 a 5. smallint porque es una escala, no una medida. */
  puntaje     smallint     not null check (puntaje between 1 and 5),
  /* Puede venir vacío: puntuar sin escribir es una opinión válida. */
  texto       text,
  anonimo     boolean      not null,
  /*
   * Nulo siempre que anonimo = true, y la restricción de abajo lo obliga: así
   * la promesa de la interfaz queda escrita en el esquema y no en la cortesía
   * de quien llame a la función.
   */
  user_id     uuid         references auth.users (id) on delete set null,
  /* Copia del apodo en el momento del envío, solo si la firmó. Evita el join
     y sobrevive a que luego se lo cambie. */
  apodo       text,
  /* Qué temas marcó, de los cuatro que ofrece la hoja. */
  temas       text[]       not null default '{}'::text[],
  /* De dónde salió el botón; hoy solo 'inicio', mañana puede haber más. */
  origen      text         not null default 'inicio',
  dispositivo text         check (dispositivo in ('telefono', 'tableta', 'escritorio')),

  constraint opiniones_anonimo_sin_dueno check (not anonimo or user_id is null),
  constraint opiniones_anonimo_sin_apodo check (not anonimo or apodo is null),
  constraint opiniones_texto_corto       check (texto is null or length(texto) <= 2000)
);

/* El panel las leerá por fecha descendente; es el único orden que va a pedir. */
create index if not exists opiniones_creado_idx on public.opiniones (creado desc);

alter table public.opiniones enable row level security;

/*
 * Sin política de INSERT a propósito (ver cabecera). Con RLS encendida y sin
 * política, nadie escribe: ni anon, ni un estudiante con sesión. La única vía
 * es enviar_opinion(), que es security definer y entra por encima de RLS.
 */
drop policy if exists "docentes leen las opiniones" on public.opiniones;
create policy "docentes leen las opiniones"
  on public.opiniones for select
  to authenticated
  using (public.es_docente());

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * enviar_opinion — la única puerta de entrada
 *
 * Devuelve true si quedó guardada y false si se frenó por repetida, para que
 * la hoja pueda dar las gracias igual sin mentir ni acusar a nadie.
 * ═══════════════════════════════════════════════════════════════════════════
 */
create or replace function public.enviar_opinion(
  p_puntaje     smallint,
  p_texto       text    default null,
  p_anonimo     boolean default true,
  p_temas       text[]  default '{}'::text[],
  p_origen      text    default 'inicio',
  p_dispositivo text    default null
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
  v_previas integer;
begin
  if p_puntaje is null or p_puntaje < 1 or p_puntaje > 5 then
    raise exception 'La puntuación va de 1 a 5' using errcode = '22023';
  end if;

  /*
   * Sin sesión no hay a quién atribuirla, así que es anónima quiera o no. No
   * es un error: el sitio entra sin registro y esa opinión vale lo mismo.
   */
  if v_uid is null then
    v_anon := true;
  end if;

  v_texto := nullif(btrim(coalesce(p_texto, '')), '');
  if v_texto is not null then
    v_texto := left(v_texto, 2000);
  end if;

  /* Solo los cuatro temas que ofrece la hoja; lo demás se descarta en silencio. */
  select coalesce(array_agg(t), '{}'::text[]) into v_temas
    from unnest(coalesce(p_temas, '{}'::text[])) as t
   where t in ('interfaz', 'actividades', 'ejemplos', 'rankings');

  /*
   * Freno al envío repetido, y solo para quien tiene sesión: tres opiniones
   * por día bastan para corregirse y sobran para que nadie llene la tabla sin
   * querer dejando el dedo en el botón. A los anónimos no se les puede contar
   * sin ponerles una marca, que es exactamente lo que se les prometió no
   * hacer; ese riesgo se acepta a cambio de la promesa.
   */
  if v_uid is not null then
    select count(*) into v_previas
      from public.opiniones
     where user_id = v_uid
       and creado > now() - interval '1 day';
    if v_previas >= 3 then
      return false;
    end if;
  end if;

  if not v_anon then
    select nickname into v_apodo from public.profiles where id = v_uid;
  end if;

  insert into public.opiniones (
    puntaje, texto, anonimo, user_id, apodo, temas, origen, dispositivo
  )
  values (
    p_puntaje, v_texto, v_anon,
    case when v_anon then null else v_uid end,
    case when v_anon then null else v_apodo end,
    v_temas,
    coalesce(nullif(btrim(coalesce(p_origen, '')), ''), 'inicio'),
    case when p_dispositivo in ('telefono', 'tableta', 'escritorio') then p_dispositivo end
  );

  return true;
end;
$$;

revoke all on function public.enviar_opinion(smallint, text, boolean, text[], text, text) from public;
grant execute on function public.enviar_opinion(smallint, text, boolean, text[], text, text) to anon, authenticated;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * opiniones_recientes — para el panel docente
 *
 * Va en esta migración aunque todavía no haya pantalla que la use: el día que
 * se añada el bloque al panel será solo interfaz, sin tocar la base. Devuelve
 * el apodo o 'Anónimo', nunca el user_id: ni el panel necesita saberlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */
create or replace function public.opiniones_recientes(p_limite integer default 100)
returns table (
  id          bigint,
  creado      timestamptz,
  puntaje     smallint,
  texto       text,
  quien       text,
  temas       text[],
  dispositivo text
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
  select o.id, o.creado, o.puntaje, o.texto,
         case when o.anonimo then 'Anónimo' else coalesce(o.apodo, 'Sin apodo') end,
         o.temas, o.dispositivo
    from public.opiniones o
   order by o.creado desc
   limit greatest(1, least(coalesce(p_limite, 100), 500));
end;
$$;

/*
 * `from public, anon` y no solo `from public`: medido en producción, tras el
 * revoke a PUBLIC la función seguía apareciendo con permiso de ejecución para
 * `anon` —Supabase se lo concede por privilegios por defecto del esquema—.
 * No era un agujero, porque la primera línea de la función exige es_docente()
 * y un visitante sin sesión no lo es; pero una puerta cerrada por dentro y
 * además sin llave se revisa más rápido que una cerrada solo por dentro.
 */
revoke all on function public.opiniones_recientes(integer) from public, anon;
grant execute on function public.opiniones_recientes(integer) to authenticated;

commit;

/*
 * ═══════════ PARA DESHACERLO ═══════════
 *
 * drop function if exists public.opiniones_recientes(integer);
 * drop function if exists public.enviar_opinion(smallint, text, boolean, text[], text, text);
 * drop table if exists public.opiniones;
 *
 * No toca ninguna tabla existente, así que deshacerlo no puede perder nada de
 * nadie — solo las opiniones que se hubieran recogido.
 */
