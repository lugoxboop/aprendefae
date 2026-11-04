/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0159 — LA CLASE EN VIVO: EL PROFESOR ABRE UNA SALA Y LA CLASE RESPONDE A LA VEZ
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199): es de nivel sitio. La abre el panel docente
 * y la juega cualquier estudiante con sesión, de cualquier materia.
 *
 * Encargo de Mateo (4-nov), fase 1 del análisis competitivo del modo en vivo:
 * el profesor elige el tema de hoy, proyecta un código, la clase entra desde
 * el celular, todos responden la misma pregunta contra el reloj, la clase ve
 * en barras cuántos eligieron cada opción y al final hay podio. Entrar a la
 * sala cuenta como asistencia.
 *
 * ═══════════ LA RESPUESTA CORRECTA NUNCA VIAJA ANTES DE TIEMPO ═══════════
 *
 * Las preguntas salen de los bancos del Repaso Diario, que viven en el sitio.
 * El profesor las manda al crear la sala; aquí la correcta se guarda en su
 * propia columna y el contenido que ve el estudiante se guarda SIN ella. Las
 * cuatro tablas tienen RLS encendido y ninguna política: nadie las lee
 * directo. Todo pasa por las funciones de abajo, y `vivo_estado` solo suelta
 * la correcta cuando la pregunta ya se cerró (o a quien es dueño de la sala).
 *
 * ═══════════ QUIÉN CALIFICA ═══════════
 *
 * El servidor, no el celular. `vivo_responder` compara contra la correcta
 * guardada, mide el tiempo con el reloj de la base y acepta UNA respuesta por
 * persona y pregunta. Un celular que mande otra opción después, o fuera de
 * tiempo, no cambia nada.
 *
 * Puntos: 700 por acertar más hasta 300 por rapidez; equivocarse da 0. Se
 * premia acertar por encima de apurarse —la crítica que reciben Kahoot y
 * Blooket— y la rapidez solo desempata.
 *
 * ═══════════ LO QUE ESTA MIGRACIÓN NO TOCA ═══════════
 *
 * Ni FP ni racha ni historial. La sala tiene sus propios puntos y vive aparte;
 * conectar el resultado con los FP es una decisión de la economía del sitio y
 * va en otra migración, cuando se decida cuánto vale una clase en vivo.
 *
 * ═══════════ CÓMO SE ENTERA EL CELULAR DE QUE ALGO CAMBIÓ ═══════════
 *
 * Fuera de la base: el profesor avisa por un canal de difusión de Supabase y
 * cada celular, al oír el aviso, pide `vivo_estado`. Por eso no se agrega
 * ninguna tabla a la publicación de cambios. Si el aviso no llega (el wifi del
 * salón), el celular pregunta solo cada pocos segundos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

create table if not exists public.vivo_salas (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null check (codigo ~ '^[0-9]{6}$'),
  docente_id  uuid not null references auth.users (id) on delete cascade,
  materia     text not null,
  tema        text not null,
  titulo      text not null,
  estado      text not null default 'espera'
              check (estado in ('espera', 'pregunta', 'resultados', 'final', 'cerrada')),
  indice      integer not null default -1,
  total       integer not null check (total between 1 and 30),
  duracion_s  integer not null default 30 check (duracion_s between 10 and 120),
  inicio      timestamptz,
  creada      timestamptz not null default now(),
  cerrada_en  timestamptz
);

/* Un código no se repite entre las salas que siguen abiertas. */
create unique index if not exists vivo_salas_codigo_abierta
  on public.vivo_salas (codigo) where estado <> 'cerrada';
create index if not exists vivo_salas_docente_idx on public.vivo_salas (docente_id, creada desc);

create table if not exists public.vivo_preguntas (
  sala_id    uuid not null references public.vivo_salas (id) on delete cascade,
  indice     integer not null,
  contenido  jsonb not null,
  correcta   text not null,
  primary key (sala_id, indice)
);

/* La asistencia: quién entró a la sala y cuándo. */
create table if not exists public.vivo_participantes (
  sala_id   uuid not null references public.vivo_salas (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  unido_en  timestamptz not null default now(),
  primary key (sala_id, user_id)
);

create table if not exists public.vivo_respuestas (
  sala_id   uuid not null references public.vivo_salas (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  indice    integer not null,
  opcion    text not null,
  correcta  boolean not null,
  ms        integer not null,
  puntos    integer not null,
  creada    timestamptz not null default now(),
  primary key (sala_id, user_id, indice)
);

alter table public.vivo_salas         enable row level security;
alter table public.vivo_preguntas     enable row level security;
alter table public.vivo_participantes enable row level security;
alter table public.vivo_respuestas    enable row level security;

/* Sin políticas, a propósito: solo se entra por las funciones. */
revoke all on public.vivo_salas, public.vivo_preguntas, public.vivo_participantes, public.vivo_respuestas
  from anon, authenticated;

/* ─────────────────────────────────────────────────────────────────────────
 * La sala abierta de un id, si quien llama es su dueño o está adentro.
 * Una sala vieja (más de 8 horas) cuenta como cerrada aunque nadie la cerrara.
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_es_dueno(p_sala uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.vivo_salas s where s.id = p_sala and s.docente_id = auth.uid());
$$;

create or replace function public.vivo_estado(p_sala uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  s         public.vivo_salas;
  v_uid     uuid := auth.uid();
  v_dueno   boolean;
  v_dentro  boolean;
  v_preg    public.vivo_preguntas;
  v_mia     public.vivo_respuestas;
  v_ver     boolean;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.vivo_salas where id = p_sala;
  if not found then raise exception 'La sala no existe' using errcode = 'P0002'; end if;
  v_dueno := s.docente_id = v_uid;
  v_dentro := exists (select 1 from public.vivo_participantes p where p.sala_id = p_sala and p.user_id = v_uid);
  if not v_dueno and not v_dentro then raise exception 'No estás en esta sala' using errcode = '42501'; end if;

  if s.estado in ('pregunta', 'resultados') then
    select * into v_preg from public.vivo_preguntas q where q.sala_id = p_sala and q.indice = s.indice;
  end if;
  select * into v_mia from public.vivo_respuestas r where r.sala_id = p_sala and r.user_id = v_uid and r.indice = s.indice;
  /* La correcta se ve cuando la pregunta ya se cerró, o si eres el dueño. */
  v_ver := v_dueno or s.estado in ('resultados', 'final');

  return jsonb_build_object(
    'sala_id', s.id,
    'codigo', s.codigo,
    'titulo', s.titulo,
    'materia', s.materia,
    'tema', s.tema,
    'estado', case when s.estado <> 'cerrada' and s.creada < now() - interval '8 hours' then 'cerrada' else s.estado end,
    'indice', s.indice,
    'total', s.total,
    'duracion_s', s.duracion_s,
    'inicio', s.inicio,
    'ahora', now(),
    'soy_dueno', v_dueno,
    'participantes', (select count(*) from public.vivo_participantes p where p.sala_id = p_sala),
    'pregunta', case when v_preg.sala_id is null then null else v_preg.contenido end,
    'correcta', case when v_preg.sala_id is not null and v_ver then v_preg.correcta end,
    'mi_respuesta', case when v_mia.sala_id is null then null else jsonb_build_object(
      'opcion', v_mia.opcion,
      'correcta', case when v_ver then v_mia.correcta end,
      'puntos', case when v_ver then v_mia.puntos end) end,
    'mis_puntos', case when s.estado in ('resultados', 'final') or v_dueno
      then (select coalesce(sum(r.puntos), 0) from public.vivo_respuestas r where r.sala_id = p_sala and r.user_id = v_uid)
      else (select coalesce(sum(r.puntos), 0) from public.vivo_respuestas r where r.sala_id = p_sala and r.user_id = v_uid and r.indice < s.indice) end
  );
end;
$$;

/* ─────────────────────────────────────────────────────────────────────────
 * Crear la sala. Solo docentes. Cierra cualquier otra sala abierta del mismo
 * docente: un profesor da una clase a la vez.
 *
 * p_preguntas: [{ enunciado, opciones: [{id, texto}], correcta, ...lo demás }]
 * Todo lo que no sea la correcta se guarda tal cual como contenido.
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_crear(
  p_materia text, p_tema text, p_titulo text, p_duracion integer, p_preguntas jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
  v_uid     uuid := auth.uid();
  v_n       integer;
  v_codigo  text;
  v_sala    uuid;
  v_i       integer;
  v_p       jsonb;
  v_ids     text[];
  v_intento integer := 0;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  if not public.es_docente() then raise exception 'Solo un docente puede abrir una clase en vivo' using errcode = '42501'; end if;
  if jsonb_typeof(p_preguntas) is distinct from 'array' then raise exception 'Las preguntas tienen que llegar como lista' using errcode = '22023'; end if;
  v_n := jsonb_array_length(p_preguntas);
  if v_n < 1 or v_n > 30 then raise exception 'Entre 1 y 30 preguntas (llegaron %)', v_n using errcode = '22023'; end if;

  /* Cada pregunta: enunciado, de 2 a 8 opciones con id, y la correcta entre ellas. */
  for v_i in 0 .. v_n - 1 loop
    v_p := p_preguntas -> v_i;
    if coalesce(btrim(v_p ->> 'enunciado'), '') = '' then raise exception 'La pregunta % no tiene enunciado', v_i + 1 using errcode = '22023'; end if;
    if jsonb_typeof(v_p -> 'opciones') is distinct from 'array'
       or jsonb_array_length(v_p -> 'opciones') not between 2 and 8 then
      raise exception 'La pregunta % necesita entre 2 y 8 opciones', v_i + 1 using errcode = '22023';
    end if;
    select array_agg(o ->> 'id') into v_ids from jsonb_array_elements(v_p -> 'opciones') o;
    if not ((v_p ->> 'correcta') = any (v_ids)) then
      raise exception 'La correcta de la pregunta % no está entre sus opciones', v_i + 1 using errcode = '22023';
    end if;
  end loop;

  update public.vivo_salas set estado = 'cerrada', cerrada_en = now()
   where docente_id = v_uid and estado <> 'cerrada';

  loop
    v_intento := v_intento + 1;
    v_codigo := lpad((floor(random() * 1000000))::integer::text, 6, '0');
    exit when not exists (select 1 from public.vivo_salas where codigo = v_codigo and estado <> 'cerrada');
    if v_intento > 50 then raise exception 'No se encontró un código libre' using errcode = '55000'; end if;
  end loop;

  insert into public.vivo_salas (codigo, docente_id, materia, tema, titulo, total, duracion_s)
  values (v_codigo, v_uid, left(coalesce(p_materia, ''), 60), left(coalesce(p_tema, ''), 80),
          left(coalesce(nullif(btrim(p_titulo), ''), 'Clase en vivo'), 120), v_n,
          least(120, greatest(10, coalesce(p_duracion, 30))))
  returning id into v_sala;

  insert into public.vivo_preguntas (sala_id, indice, contenido, correcta)
  select v_sala, (e.ord - 1)::integer, e.p - 'correcta', e.p ->> 'correcta'
    from jsonb_array_elements(p_preguntas) with ordinality as e(p, ord);

  return public.vivo_estado(v_sala);
end;
$$;

/* ─────────────────────────────────────────────────────────────────────────
 * Entrar con el código. Cualquier estudiante con sesión. Queda en la
 * asistencia la primera vez; volver a entrar no duplica.
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_unirse(p_codigo text)
returns jsonb
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
  v_uid  uuid := auth.uid();
  v_sala uuid;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select id into v_sala from public.vivo_salas
   where codigo = regexp_replace(coalesce(p_codigo, ''), '\D', '', 'g')
     and estado <> 'cerrada' and creada > now() - interval '8 hours'
   order by creada desc limit 1;
  if v_sala is null then raise exception 'No hay ninguna clase abierta con ese código' using errcode = 'P0002'; end if;
  insert into public.vivo_participantes (sala_id, user_id) values (v_sala, v_uid)
  on conflict do nothing;
  return public.vivo_estado(v_sala);
end;
$$;

/* ─────────────────────────────────────────────────────────────────────────
 * Responder. Una vez por pregunta, dentro del tiempo (con 2 s de gracia por la
 * red del salón), y con una opción que exista.
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_responder(p_sala uuid, p_indice integer, p_opcion text)
returns jsonb
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
  v_uid   uuid := auth.uid();
  s       public.vivo_salas;
  v_preg  public.vivo_preguntas;
  v_ms    integer;
  v_ok    boolean;
  v_pts   integer;
  v_n     integer;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.vivo_salas where id = p_sala;
  if not found then raise exception 'La sala no existe' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.vivo_participantes p where p.sala_id = p_sala and p.user_id = v_uid) then
    raise exception 'No estás en esta sala' using errcode = '42501';
  end if;
  if s.estado <> 'pregunta' or s.indice <> p_indice then
    return jsonb_build_object('aceptada', false, 'motivo', 'cerrada');
  end if;
  v_ms := floor(extract(epoch from (now() - s.inicio)) * 1000)::integer;
  if v_ms > (s.duracion_s + 2) * 1000 then
    return jsonb_build_object('aceptada', false, 'motivo', 'tiempo');
  end if;
  select * into v_preg from public.vivo_preguntas q where q.sala_id = p_sala and q.indice = p_indice;
  if not exists (select 1 from jsonb_array_elements(v_preg.contenido -> 'opciones') o where o ->> 'id' = p_opcion) then
    return jsonb_build_object('aceptada', false, 'motivo', 'opcion');
  end if;
  v_ok := p_opcion = v_preg.correcta;
  v_ms := greatest(0, least(v_ms, s.duracion_s * 1000));
  v_pts := case when v_ok then 700 + round(300 * (1 - v_ms::numeric / (s.duracion_s * 1000)))::integer else 0 end;

  insert into public.vivo_respuestas (sala_id, user_id, indice, opcion, correcta, ms, puntos)
  values (p_sala, v_uid, p_indice, p_opcion, v_ok, v_ms, v_pts)
  on conflict do nothing;
  get diagnostics v_n = row_count;
  return jsonb_build_object('aceptada', v_n = 1, 'motivo', case when v_n = 1 then null else 'repetida' end);
end;
$$;

/* ─────────────────────────────────────────────────────────────────────────
 * El profesor mueve la clase.
 *   siguiente   abre la próxima pregunta (o pasa al final si ya no hay)
 *   resultados  cierra la pregunta abierta y muestra la correcta
 *   final       pasa al podio
 *   cerrar      termina la clase
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_avanzar(p_sala uuid, p_accion text)
returns jsonb
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
  s public.vivo_salas;
begin
  if auth.uid() is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.vivo_salas where id = p_sala for update;
  if not found or s.docente_id <> auth.uid() then raise exception 'Solo quien abrió la sala la mueve' using errcode = '42501'; end if;
  if s.estado = 'cerrada' then return public.vivo_estado(p_sala); end if;

  if p_accion = 'siguiente' then
    if s.estado = 'pregunta' then
      raise exception 'Primero se cierra la pregunta abierta' using errcode = '55000';
    elsif s.indice + 1 >= s.total then
      update public.vivo_salas set estado = 'final' where id = p_sala;
    else
      update public.vivo_salas set estado = 'pregunta', indice = s.indice + 1, inicio = now() where id = p_sala;
    end if;
  elsif p_accion = 'resultados' then
    if s.estado = 'pregunta' then update public.vivo_salas set estado = 'resultados' where id = p_sala; end if;
  elsif p_accion = 'final' then
    update public.vivo_salas set estado = 'final' where id = p_sala;
  elsif p_accion = 'cerrar' then
    update public.vivo_salas set estado = 'cerrada', cerrada_en = now() where id = p_sala;
  else
    raise exception 'Acción desconocida: %', p_accion using errcode = '22023';
  end if;
  return public.vivo_estado(p_sala);
end;
$$;

/* ─────────────────────────────────────────────────────────────────────────
 * Cuántos respondieron y qué. El dueño lo ve mientras corre la pregunta (solo
 * el total por opción, no quién); el estudiante, cuando ya se cerró.
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_conteo(p_sala uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  s       public.vivo_salas;
  v_uid   uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.vivo_salas where id = p_sala;
  if not found then raise exception 'La sala no existe' using errcode = 'P0002'; end if;
  if s.docente_id <> v_uid then
    if not exists (select 1 from public.vivo_participantes p where p.sala_id = p_sala and p.user_id = v_uid) then
      raise exception 'No estás en esta sala' using errcode = '42501';
    end if;
    if s.estado not in ('resultados', 'final') then
      return jsonb_build_object('indice', s.indice, 'respondieron', null, 'por_opcion', null);
    end if;
  end if;
  return jsonb_build_object(
    'indice', s.indice,
    'participantes', (select count(*) from public.vivo_participantes p where p.sala_id = p_sala),
    'respondieron', (select count(*) from public.vivo_respuestas r where r.sala_id = p_sala and r.indice = s.indice),
    'por_opcion', coalesce((select jsonb_object_agg(opcion, n) from (
        select r.opcion, count(*) as n from public.vivo_respuestas r
         where r.sala_id = p_sala and r.indice = s.indice group by r.opcion) t), '{}'::jsonb)
  );
end;
$$;

/* ─────────────────────────────────────────────────────────────────────────
 * El podio: los primeros por puntos, con apodo, y el puesto de quien pregunta.
 * Mientras una pregunta está abierta no cuenta esa pregunta (se vería quién
 * acertó antes de tiempo).
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_podio(p_sala uuid, p_limite integer default 5)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  s      public.vivo_salas;
  v_uid  uuid := auth.uid();
  v_tope integer;
  v_lista jsonb;
  v_mio   jsonb;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.vivo_salas where id = p_sala;
  if not found then raise exception 'La sala no existe' using errcode = 'P0002'; end if;
  if s.docente_id <> v_uid and not exists (select 1 from public.vivo_participantes p where p.sala_id = p_sala and p.user_id = v_uid) then
    raise exception 'No estás en esta sala' using errcode = '42501';
  end if;
  v_tope := case when s.estado = 'pregunta' then s.indice - 1 else s.indice end;

  with tabla as (
    select p.user_id,
           coalesce(nullif(btrim(pr.nickname), ''), 'Estudiante') as apodo,
           coalesce(sum(r.puntos), 0)::integer as puntos,
           count(*) filter (where r.correcta)::integer as aciertos,
           coalesce(sum(r.ms) filter (where r.correcta), 0) as ms
      from public.vivo_participantes p
      left join public.profiles pr on pr.user_id = p.user_id
      left join public.vivo_respuestas r on r.sala_id = p.sala_id and r.user_id = p.user_id and r.indice <= v_tope
     where p.sala_id = p_sala
     group by p.user_id, pr.nickname
  ), puestos as (
    select *, rank() over (order by puntos desc, aciertos desc) as puesto,
           row_number() over (order by puntos desc, aciertos desc, ms asc, apodo asc) as orden
      from tabla
  )
  select coalesce(jsonb_agg(jsonb_build_object('puesto', puesto, 'apodo', apodo, 'puntos', puntos, 'aciertos', aciertos, 'soy_yo', user_id = v_uid) order by orden)
           filter (where orden <= least(greatest(coalesce(p_limite, 5), 1), 50)), '[]'::jsonb),
         (jsonb_agg(jsonb_build_object('puesto', puesto, 'puntos', puntos, 'aciertos', aciertos)) filter (where user_id = v_uid)) -> 0
    into v_lista, v_mio
    from puestos;

  return jsonb_build_object('podio', v_lista, 'mio', v_mio, 'hasta', v_tope);
end;
$$;

/* ─────────────────────────────────────────────────────────────────────────
 * La asistencia de una sala, para su dueño: quién entró, a qué hora, y cómo le
 * fue. Ordenada por apodo, como se lee una lista.
 * ───────────────────────────────────────────────────────────────────────── */
create or replace function public.vivo_asistencia(p_sala uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.vivo_es_dueno(p_sala) then raise exception 'Solo quien abrió la sala ve la asistencia' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('apodo', apodo, 'unido_en', unido_en, 'aciertos', aciertos, 'respondidas', respondidas, 'puntos', puntos) order by lower(apodo))
      from (
        select coalesce(nullif(btrim(pr.nickname), ''), 'Estudiante') as apodo, p.unido_en,
               count(r.indice) filter (where r.correcta)::integer as aciertos,
               count(r.indice)::integer as respondidas,
               coalesce(sum(r.puntos), 0)::integer as puntos
          from public.vivo_participantes p
          left join public.profiles pr on pr.user_id = p.user_id
          left join public.vivo_respuestas r on r.sala_id = p.sala_id and r.user_id = p.user_id
         where p.sala_id = p_sala
         group by p.user_id, pr.nickname, p.unido_en
      ) t), '[]'::jsonb);
end;
$$;

revoke all on function public.vivo_es_dueno(uuid) from public, anon;
revoke all on function public.vivo_estado(uuid) from public, anon;
revoke all on function public.vivo_crear(text, text, text, integer, jsonb) from public, anon;
revoke all on function public.vivo_unirse(text) from public, anon;
revoke all on function public.vivo_responder(uuid, integer, text) from public, anon;
revoke all on function public.vivo_avanzar(uuid, text) from public, anon;
revoke all on function public.vivo_conteo(uuid) from public, anon;
revoke all on function public.vivo_podio(uuid, integer) from public, anon;
revoke all on function public.vivo_asistencia(uuid) from public, anon;

grant execute on function public.vivo_es_dueno(uuid) to authenticated;
grant execute on function public.vivo_estado(uuid) to authenticated;
grant execute on function public.vivo_crear(text, text, text, integer, jsonb) to authenticated;
grant execute on function public.vivo_unirse(text) to authenticated;
grant execute on function public.vivo_responder(uuid, integer, text) to authenticated;
grant execute on function public.vivo_avanzar(uuid, text) to authenticated;
grant execute on function public.vivo_conteo(uuid) to authenticated;
grant execute on function public.vivo_podio(uuid, integer) to authenticated;
grant execute on function public.vivo_asistencia(uuid) to authenticated;

/*
 * Para deshacer (solo si nadie la ha usado todavía; borra asistencias):
 *
 * drop function if exists public.vivo_asistencia(uuid);
 * drop function if exists public.vivo_podio(uuid, integer);
 * drop function if exists public.vivo_conteo(uuid);
 * drop function if exists public.vivo_avanzar(uuid, text);
 * drop function if exists public.vivo_responder(uuid, integer, text);
 * drop function if exists public.vivo_unirse(text);
 * drop function if exists public.vivo_crear(text, text, text, integer, jsonb);
 * drop function if exists public.vivo_estado(uuid);
 * drop function if exists public.vivo_es_dueno(uuid);
 * drop table if exists public.vivo_respuestas, public.vivo_participantes, public.vivo_preguntas, public.vivo_salas;
 */
