/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0158 — LA FÁBRICA: QUE EL PROFESOR CREE SUS PROPIAS ACTIVIDADES
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199): es de nivel sitio y la tocan el panel
 * docente y una función de servidor, no una materia.
 *
 * Encargo de Mateo (1-nov): que el profesor suba su material al panel, escriba
 * qué quiere, y el sitio le devuelva actividades hechas.
 *
 * ═══════════ LO QUE SE GUARDA, Y LO QUE NO ═══════════
 *
 * NO se guarda el archivo del profesor. Ni aquí ni en Storage ni en el repo.
 * Es material ajeno —un capítulo de un libro que no es nuestro— y el
 * repositorio es público: lo que entra, sale. El archivo viaja en la petición,
 * el modelo lo lee y se descarta. Lo que queda es la actividad, escrita con
 * palabras nuestras.
 *
 * Por eso `pieza` es jsonb y no un texto plano: es la actividad ya hecha, con
 * la forma que CuatroCapas sabe pintar —{titulo, nombres, pasos, pregunta,
 * respuesta}—, no un extracto del PDF.
 *
 * ═══════════ POR QUÉ BORRADORES Y NO ACTIVIDADES ═══════════
 *
 * Porque nada generado llega a un estudiante sin que una persona lo lea. Es
 * la misma regla con la que Duolingo genera ejercicios: la máquina propone
 * diez, el experto elige tres. Aquí el experto es el profesor, que es además
 * quien conoce a su curso. Un borrador no existe para el estudiante: vive en
 * el panel hasta que su autor lo publica.
 *
 * ═══════════ EL CUPO ═══════════
 *
 * Una llamada al modelo con un PDF cuesta de verdad. El contador por docente y
 * día es el mismo recurso que ya usa el asistente (0040) y por el mismo
 * motivo: una función de servidor no recuerda nada entre invocaciones, así que
 * el límite tiene que vivir en la base.
 * ═══════════════════════════════════════════════════════════════════════════
 */

begin;

/* ───────────────────────── LOS BORRADORES ───────────────────────── */

create table if not exists public.borradores_actividad (
  id           bigserial primary key,
  creado       timestamptz not null default now(),
  /* Quién la pidió. Es su borrador: nadie más lo ve, ni siquiera otro docente. */
  docente_id   uuid        not null references auth.users (id) on delete cascade,
  materia      text        not null,
  titulo       text        not null,
  /* La actividad ya hecha, con la forma que pinta CuatroCapas. */
  pieza        jsonb       not null,
  /* Lo que el profesor pidió, en sus palabras. Para que al revisarla se
     entienda de dónde salió sin tener que acordarse. */
  encargo      text,
  modelo       text,
  estado       text        not null default 'borrador'
                 check (estado in ('borrador', 'publicada', 'descartada')),
  publicada_en timestamptz,

  constraint borradores_titulo_corto check (length(titulo) between 1 and 120),
  constraint borradores_publicada_con_fecha
    check (estado <> 'publicada' or publicada_en is not null)
);

create index if not exists borradores_del_docente_idx
  on public.borradores_actividad (docente_id, materia, creado desc);

alter table public.borradores_actividad enable row level security;

/*
 * Sin política de INSERT ni de UPDATE: se entra por las funciones de abajo.
 * La lección de 0011 otra vez —lo que el cliente escribe directo, lo falsea—,
 * y aquí además hay que comprobar que la materia sea suya.
 */
drop policy if exists "cada docente ve sus borradores" on public.borradores_actividad;
create policy "cada docente ve sus borradores"
  on public.borradores_actividad for select
  to authenticated
  using (docente_id = auth.uid() and public.es_docente());

/* ───────────────────────── EL CUPO DIARIO ───────────────────────── */

create table if not exists public.fabrica_uso (
  docente_id uuid    not null references auth.users (id) on delete cascade,
  dia        date    not null,
  usadas     integer not null default 0 check (usadas >= 0),
  primary key (docente_id, dia)
);

alter table public.fabrica_uso enable row level security;
/* Nadie lee ni escribe esta tabla directo: solo la función de abajo. */

/*
 * Cobra una invocación y dice si se puede seguir. El día es el de Bogotá: un
 * docente que trabaja a las 11 de la noche no debería estrenar cupo a medianoche
 * UTC, que para él son las 7 de la tarde.
 */
create or replace function public.fabrica_consumir(p_limite integer)
returns table (permitido boolean, usadas integer, limite integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_dia date := (now() at time zone 'America/Bogota')::date;
  v_n   integer;
begin
  if v_uid is null or not public.es_docente() then
    raise exception 'Fábrica: no autorizado' using errcode = '42501';
  end if;

  insert into public.fabrica_uso (docente_id, dia, usadas)
  values (v_uid, v_dia, 1)
  on conflict (docente_id, dia) do update set usadas = public.fabrica_uso.usadas + 1
  returning public.fabrica_uso.usadas into v_n;

  return query select v_n <= greatest(0, coalesce(p_limite, 0)), v_n, greatest(0, coalesce(p_limite, 0));
end;
$$;

revoke all on function public.fabrica_consumir(integer) from public, anon;
grant execute on function public.fabrica_consumir(integer) to authenticated;

/* ───────────────────── GUARDAR LO QUE SALIÓ ───────────────────── */

/*
 * Recibe el lote entero y lo escribe como borradores del docente que llama.
 * Devuelve cuántos quedaron: la función de servidor no tiene por qué saber de
 * ids, y el panel los vuelve a pedir con mis_borradores().
 */
create or replace function public.guardar_borradores(
  p_materia text,
  p_piezas  jsonb,
  p_encargo text default null,
  p_modelo  text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_p   jsonb;
  v_n   integer := 0;
begin
  if v_uid is null or not public.es_docente() then
    raise exception 'Fábrica: no autorizado' using errcode = '42501';
  end if;
  if not (p_materia = any (public.materias_docente())) then
    raise exception 'Fábrica: materia no autorizada' using errcode = '42501';
  end if;
  if jsonb_typeof(p_piezas) <> 'array' then
    raise exception 'Fábrica: se esperaba una lista de piezas' using errcode = '22023';
  end if;

  /*
   * Un tope por lote. No es desconfianza del modelo: es que una respuesta rara
   * no pueda llenar la tabla de un tirón.
   */
  for v_p in select * from jsonb_array_elements(p_piezas) limit 10 loop
    /* Lo mínimo para que CuatroCapas pueda pintarla. Lo que no cumpla, fuera. */
    continue when jsonb_typeof(v_p) <> 'object'
               or coalesce(btrim(v_p ->> 'titulo'), '') = ''
               or jsonb_typeof(v_p -> 'nombres') <> 'array'
               or jsonb_typeof(v_p -> 'pasos') <> 'array'
               or coalesce(btrim(v_p ->> 'pregunta'), '') = '';

    insert into public.borradores_actividad (docente_id, materia, titulo, pieza, encargo, modelo)
    values (v_uid, p_materia, left(btrim(v_p ->> 'titulo'), 120), v_p,
            left(nullif(btrim(coalesce(p_encargo, '')), ''), 2000), left(p_modelo, 60));
    v_n := v_n + 1;
  end loop;

  return v_n;
end;
$$;

revoke all on function public.guardar_borradores(text, jsonb, text, text) from public, anon;
grant execute on function public.guardar_borradores(text, jsonb, text, text) to authenticated;

/* ───────────────────── LEER, DESCARTAR, PUBLICAR ───────────────────── */

create or replace function public.mis_borradores(p_materia text, p_limite integer default 50)
returns table (
  id bigint, creado timestamptz, titulo text, pieza jsonb,
  encargo text, modelo text, estado text, publicada_en timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.es_docente() then
    raise exception 'Fábrica: no autorizado' using errcode = '42501';
  end if;

  return query
  select b.id, b.creado, b.titulo, b.pieza, b.encargo, b.modelo, b.estado, b.publicada_en
    from public.borradores_actividad b
   where b.docente_id = v_uid
     and b.materia = p_materia
     and b.estado <> 'descartada'
   order by b.creado desc
   limit greatest(1, least(coalesce(p_limite, 50), 200));
end;
$$;

revoke all on function public.mis_borradores(text, integer) from public, anon;
grant execute on function public.mis_borradores(text, integer) to authenticated;

/*
 * Cambiar el estado de UN borrador propio.
 *
 * Descartar no borra la fila: la marca. Borrar de verdad dejaría al profesor
 * sin poder deshacer un clic, y una fila escondida no le estorba a nadie.
 */
create or replace function public.estado_borrador(p_id bigint, p_estado text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_filas integer;
begin
  if v_uid is null or not public.es_docente() then
    raise exception 'Fábrica: no autorizado' using errcode = '42501';
  end if;
  if p_estado not in ('borrador', 'publicada', 'descartada') then
    raise exception 'Fábrica: estado desconocido' using errcode = '22023';
  end if;

  update public.borradores_actividad
     set estado = p_estado,
         publicada_en = case when p_estado = 'publicada' then coalesce(publicada_en, now()) else publicada_en end
   where id = p_id
     and docente_id = v_uid;

  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;

revoke all on function public.estado_borrador(bigint, text) from public, anon;
grant execute on function public.estado_borrador(bigint, text) to authenticated;

commit;

/*
 * ═══════════ PARA DESHACERLO ═══════════
 *
 * drop function if exists public.estado_borrador(bigint, text);
 * drop function if exists public.mis_borradores(text, integer);
 * drop function if exists public.guardar_borradores(text, jsonb, text, text);
 * drop function if exists public.fabrica_consumir(integer);
 * drop table if exists public.fabrica_uso;
 * drop table if exists public.borradores_actividad;
 *
 * No toca nada de lo que ya existe: ni una tabla, ni una función, ni un dato
 * de ningún estudiante.
 */
