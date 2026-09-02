-- Panel docente: nombre real, lista de acceso y métricas de grupo.
--
-- Es la primera vez que un usuario del sitio puede ver datos de OTRO usuario.
-- Hasta aquí, RLS garantizaba que cada quien solo alcanzara su propia fila y
-- los rankings devolvían agregados sin identificar a nadie. Un docente sí
-- necesita ver a sus estudiantes por nombre, así que esta migración abre esa
-- puerta —y la abre estrecha:
--
--   1. La autorización es una lista blanca que Mateo administra a mano. No hay
--      forma de auto-inscribirse.
--   2. Nadie lee las tablas directamente: todo pasa por funciones que
--      comprueban la lista antes de devolver una sola fila.
--   3. Un docente autorizado ve el progreso, nunca el correo del estudiante.
--
-- Idempotente.

-- ---------------------------------------------------------------------------
-- Nombre real
--
-- Se pide en el primer ingreso, junto al apodo, y NO se muestra en ningún
-- ranking: el apodo sigue siendo lo único público entre estudiantes. Existe
-- solo para que un docente reconozca a quién está viendo — un apodo no sirve
-- para eso.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists full_name text;

alter table public.profiles drop constraint if exists profiles_full_name_len;
alter table public.profiles add constraint profiles_full_name_len
  check (full_name is null or char_length(btrim(full_name)) between 3 and 80);

-- ---------------------------------------------------------------------------
-- Lista blanca de docentes
--
-- Es una tabla y no una constante en el código a propósito: dar acceso a un
-- profesor no debería exigir un despliegue. Mateo añade la fila desde el panel
-- de Supabase y el acceso queda activo en la siguiente carga.
--
-- `materias` acota qué puede ver cada quien: un docente de Macroeconomía no
-- tiene por qué ver el grupo de Pensamiento Estratégico.
-- ---------------------------------------------------------------------------
create table if not exists public.docentes (
  email      text primary key,
  nombre     text,
  materias   text[] not null default '{}',
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);

alter table public.docentes enable row level security;
alter table public.docentes force row level security;
-- Sin políticas: nadie la lee ni la escribe desde el cliente. Solo la tocan las
-- funciones security definer de abajo y el panel de Supabase.

/*
 * ¿Quien llama es docente autorizado? El correo sale del JWT, no de un
 * parámetro: así no se puede suplantar pidiendo el panel de otro.
 */
create or replace function public.es_docente()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.docentes d
     where lower(d.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       and d.activo
  );
$$;

/* Las materias que ese docente tiene autorizadas. */
create or replace function public.materias_docente()
returns text[]
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select d.materias from public.docentes d
      where lower(d.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and d.activo
      limit 1),
    '{}'::text[]
  );
$$;

revoke all on function public.es_docente() from public, anon;
revoke all on function public.materias_docente() from public, anon;
grant execute on function public.es_docente() to authenticated;
grant execute on function public.materias_docente() to authenticated;

-- ---------------------------------------------------------------------------
-- Grupo curado
--
-- La lista de "activos en la materia" incluye a cualquiera que haya entrado,
-- porque explorar una materia no pide permiso. Pero las métricas agregadas y
-- las alertas de un curso tienen que calcularse sobre el curso, no sobre quien
-- pasaba por ahí. Aquí el docente marca quién es suyo.
-- ---------------------------------------------------------------------------
create table if not exists public.docente_grupo (
  docente_email text not null,
  subject_id    text not null,
  user_id       uuid not null references auth.users (id) on delete cascade,
  agregado_en   timestamptz not null default now(),
  primary key (docente_email, subject_id, user_id)
);

alter table public.docente_grupo enable row level security;
alter table public.docente_grupo force row level security;
-- Igual que docentes: solo se toca por las funciones de abajo.

-- ---------------------------------------------------------------------------
-- Métricas por estudiante de una materia.
--
-- Devuelve datos crudos por estudiante y deja el cálculo de alertas al
-- cliente: los umbrales son provisionales y se van a calibrar con datos reales
-- del semestre, y cambiar un número en un archivo JS es más barato que migrar
-- la base cada vez.
--
-- NO devuelve el correo del estudiante. Un docente necesita saber quién es y
-- cómo va, no cómo contactarlo por fuera de la universidad.
-- ---------------------------------------------------------------------------
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
  duracion_media_ms  numeric
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_email  text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_inicio timestamptz;
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;

  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  /* Ciclo semanal en horario de Bogotá, igual que los rankings. */
  v_inicio := date_trunc('week', now() at time zone 'America/Bogota') at time zone 'America/Bogota';

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
      avg(h.duration_ms)                                                   as dur_media
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
    a.dur_media
  from agregado a
  join public.profiles p on p.user_id = a.user_id
  left join public.docente_grupo g
    on g.user_id = a.user_id
   and g.subject_id = p_subject
   and g.docente_email = v_email
  order by a.ultima desc;
end;
$$;

revoke all on function public.panel_estudiantes(text) from public, anon;
grant execute on function public.panel_estudiantes(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Añadir y quitar del grupo propio.
--
-- El docente_email sale del JWT: no se puede editar el grupo de otro docente
-- ni pasando su correo por parámetro.
-- ---------------------------------------------------------------------------
create or replace function public.grupo_marcar(p_subject text, p_user_id uuid, p_incluir boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;
  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  if p_incluir then
    insert into public.docente_grupo (docente_email, subject_id, user_id)
    values (v_email, p_subject, p_user_id)
    on conflict do nothing;
  else
    delete from public.docente_grupo
     where docente_email = v_email and subject_id = p_subject and user_id = p_user_id;
  end if;
end;
$$;

revoke all on function public.grupo_marcar(text, uuid, boolean) from public, anon;
grant execute on function public.grupo_marcar(text, uuid, boolean) to authenticated;
