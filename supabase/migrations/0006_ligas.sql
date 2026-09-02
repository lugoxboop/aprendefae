-- Ligas: capa competitiva por grupos de pares, encima de los rankings de FP.
--
-- No sustituye a los rankings diario/semanal/semestre: aquellos ordenan a toda
-- la materia, y esto reparte a la gente en grupos parecidos para que competir
-- tenga sentido cuando el grupo crece.
--
-- Seguridad: mismo patrón que ranking_fp. `liga_tablero` es security definer
-- porque las políticas RLS de fp_history solo dejan ver las filas propias y sin
-- eso no habría forma de agregar; a cambio devuelve únicamente el podio y la
-- fila de quien pregunta. Nunca filas por estudiante de los demás.
--
-- Idempotente.

-- ---------------------------------------------------------------------------
-- Membresía por ciclo
--
-- Hace falta guardarla: en qué liga estás no se puede derivar solo de los FP
-- del ciclo, porque depende de dónde estabas la semana pasada y de si subiste
-- o bajaste.
--
-- Las ligas se numeran 1 = la de arriba. La interfaz NO usa esos números como
-- nombre: los muestra como "Grupo 1, 2, 3" sin decir cuál es mejor. La
-- jerarquía existe en la estructura, no en la etiqueta.
-- ---------------------------------------------------------------------------
create table if not exists public.liga_membresia (
  subject_id  text not null,
  ciclo       date not null,          -- lunes del ciclo, en horario de Bogotá
  user_id     uuid not null references auth.users (id) on delete cascade,
  liga        integer not null check (liga >= 1),
  entro_en    timestamptz not null default now(),
  primary key (subject_id, ciclo, user_id)
);

create index if not exists liga_membresia_ciclo_idx
  on public.liga_membresia (subject_id, ciclo, liga);

alter table public.liga_membresia enable row level security;
alter table public.liga_membresia force row level security;
-- Sin políticas: solo la tocan las funciones de abajo.

-- ---------------------------------------------------------------------------
-- Utilidades de ciclo
-- ---------------------------------------------------------------------------
create or replace function public.ciclo_actual()
returns date
language sql
stable
as $$
  select (date_trunc('week', now() at time zone 'America/Bogota'))::date;
$$;

/*
 * Cuántas ligas para N activos.
 *
 *   < 20   una sola: dividir un grupo pequeño deja ligas de cuatro personas,
 *          donde el podio es casi todo el mundo y no significa nada.
 *   20-60  tres.
 *   >= 60  las que hagan falta para mantener ~20 por liga, mínimo 4.
 *
 * En el tramo alto la regla de "15-25 por liga" manda sobre el "4 o 5 ligas":
 * son incompatibles a partir de ~125 activos, y la que tiene justificación
 * pedagógica es el tamaño —de él sale que el podio del 28% queden ~5 puestos,
 * y que no salir en él sea la situación normal de la mayoría—. Revisar cuando
 * haya adopción real de ese tamaño.
 */
create or replace function public.ligas_para(n integer)
returns integer
language sql
immutable
as $$
  select case
    when n < 20 then 1
    when n < 60 then 3
    else greatest(4, ceil(n::numeric / 20)::integer)
  end;
$$;

-- ---------------------------------------------------------------------------
-- Sembrar el ciclo actual.
--
-- Se llama sola cuando alguien abre el tablero o gana FP; no hay tarea
-- programada. El primero que llega en la semana paga el cierre de la anterior,
-- que cuesta una consulta sobre un puñado de filas.
--
-- Reglas de movimiento, todas en un sitio:
--   · suben los ~3 primeros de una liga que no sea la de arriba
--   · bajan los ~3 últimos de una liga que no sea la de abajo
--   · los empates en el borde arrastran a todos los empatados: mover a los dos
--     que empataron en el puesto 3 desbalancea la liga esa semana, pero es más
--     transparente que un desempate oculto, y el tamaño se corrige solo al
--     ciclo siguiente
--
--   · QUIEN NO TUVO ACTIVIDAD EN LA SEMANA NO SE MUEVE: ni sube ni baja, se
--     queda donde estaba.
--
--     REGLA TEMPORAL. Existe mientras no haya congelación de racha (streak
--     freeze), que es una función aparte y todavía sin construir. Cuando esa
--     función exista hay que revisar esto: lo razonable será que una semana sin
--     actividad sí cuente como descenso salvo que el estudiante haya gastado
--     una congelación. Mientras tanto, no castigar una ausencia que el sistema
--     todavía no le da forma de justificar.
-- ---------------------------------------------------------------------------
create or replace function public.ligas_sembrar(p_subject text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ciclo    date := public.ciclo_actual();
  v_anterior date;
  v_n        integer;
  v_ligas    integer;
begin
  /* Ya sembrado: nada que hacer. */
  if exists (select 1 from public.liga_membresia where subject_id = p_subject and ciclo = v_ciclo) then
    return;
  end if;

  select max(ciclo) into v_anterior
    from public.liga_membresia
   where subject_id = p_subject and ciclo < v_ciclo;

  if v_anterior is null then
    /*
     * Primera vez en esta materia: se reparte a quien tenga historial, ordenado
     * por sus FP acumulados, en tantas ligas como toque.
     */
    select count(distinct user_id) into v_n from public.fp_history where subject_id = p_subject;
    if v_n = 0 then return; end if;
    v_ligas := public.ligas_para(v_n);

    insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
    select
      p_subject,
      v_ciclo,
      t.user_id,
      least(v_ligas, 1 + ((row_number() over (order by t.fp desc, t.user_id)) - 1) * v_ligas / v_n)
    from (
      select user_id, sum(fp_awarded) as fp
        from public.fp_history
       where subject_id = p_subject
       group by user_id
    ) t;
    return;
  end if;

  /* Cierre del ciclo anterior. */
  select count(*), max(liga) into v_n, v_ligas
    from public.liga_membresia
   where subject_id = p_subject and ciclo = v_anterior;

  insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
  with fp_anterior as (
    select
      m.user_id,
      m.liga,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = m.user_id
           and h.subject_id = p_subject
           and h.created_at >= v_anterior::timestamp at time zone 'America/Bogota'
           and h.created_at <  v_ciclo::timestamp at time zone 'America/Bogota'
      ), 0) as fp
    from public.liga_membresia m
    where m.subject_id = p_subject and m.ciclo = v_anterior
  ),
  /* Solo compiten por moverse quienes tuvieron actividad. Ver nota de arriba. */
  activos as (
    select
      f.*,
      rank() over (partition by f.liga order by f.fp desc) as puesto_arriba,
      rank() over (partition by f.liga order by f.fp asc)  as puesto_abajo
    from fp_anterior f
    where f.fp > 0
  )
  select
    p_subject,
    v_ciclo,
    f.user_id,
    case
      /* rank() empata: dos en el puesto 3 suben los dos. */
      when a.puesto_arriba <= 3 and f.liga > 1 then f.liga - 1
      when a.puesto_abajo  <= 3 and f.liga < v_ligas then f.liga + 1
      else f.liga
    end
  from fp_anterior f
  left join activos a on a.user_id = f.user_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Entrada a mitad de ciclo.
--
-- Quien gana su primer FP entra en la LIGA MEDIA en ese momento, sin esperar al
-- lunes. Entrar por la media y no por la última es lo que evita castigar a
-- quien empieza tarde: al segundo ciclo su posición ya la decide su desempeño y
-- no su fecha de llegada.
-- ---------------------------------------------------------------------------
create or replace function public.liga_entrar(p_subject text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_ciclo date := public.ciclo_actual();
  v_ligas integer;
begin
  if v_uid is null then return; end if;

  perform public.ligas_sembrar(p_subject);

  if exists (
    select 1 from public.liga_membresia
     where subject_id = p_subject and ciclo = v_ciclo and user_id = v_uid
  ) then
    return;
  end if;

  select coalesce(max(liga), 0) into v_ligas
    from public.liga_membresia where subject_id = p_subject and ciclo = v_ciclo;

  /* Sin ligas todavía en este ciclo: es el primero, y su liga es la única. */
  if v_ligas = 0 then v_ligas := 1; end if;

  insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
  values (p_subject, v_ciclo, v_uid, ((v_ligas + 1) / 2))
  on conflict do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- El tablero.
--
-- Devuelve el podio (top ~28% de la liga, ampliado si hay empate en el borde) y
-- la fila de quien pregunta aunque no esté en él. Exactamente lo que hace
-- ranking_fp: nunca filas por estudiante de los demás.
--
-- La posición exacta de cada quien es dato privado suyo: llega en `es_tuyo` y
-- la interfaz solo la enseña en su propio espacio.
-- ---------------------------------------------------------------------------
create or replace function public.liga_tablero(p_subject text)
returns table (
  liga          integer,
  total_ligas   integer,
  tam_liga      integer,
  corte_podio   integer,
  posicion      bigint,
  nickname      text,
  fp            bigint,
  es_tuyo       boolean,
  en_podio      boolean
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid   uuid := auth.uid();
  v_ciclo date := public.ciclo_actual();
  v_liga  integer;
  v_tam   integer;
  v_total integer;
  v_corte integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para ver tu liga' using errcode = '42501';
  end if;

  select m.liga into v_liga
    from public.liga_membresia m
   where m.subject_id = p_subject and m.ciclo = v_ciclo and m.user_id = v_uid;

  /* Sin membresía todavía: aún no ha ganado FP en la materia este ciclo. */
  if v_liga is null then return; end if;

  select count(*), max(m2.liga) into v_tam, v_total
    from public.liga_membresia m2
   where m2.subject_id = p_subject and m2.ciclo = v_ciclo and m2.liga = v_liga;

  select max(m3.liga) into v_total
    from public.liga_membresia m3
   where m3.subject_id = p_subject and m3.ciclo = v_ciclo;

  /* 28% de la liga, redondeado hacia arriba: a 17 personas son 5 puestos. */
  v_corte := greatest(1, ceil(v_tam::numeric * 0.28)::integer);

  return query
  with tabla as (
    select
      m.user_id,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = m.user_id
           and h.subject_id = p_subject
           and h.created_at >= v_ciclo::timestamp at time zone 'America/Bogota'
      ), 0)::bigint as fp
    from public.liga_membresia m
    where m.subject_id = p_subject and m.ciclo = v_ciclo and m.liga = v_liga
  ),
  clasificada as (
    select
      t.user_id,
      t.fp,
      rank() over (order by t.fp desc) as posicion
    from tabla t
  ),
  /*
   * Empate justo en el borde del podio: se amplía el podio esa semana en vez de
   * romper el empate por detrás. Misma transparencia que en el borde de ascenso.
   * rank() ya da el mismo número a los empatados, así que basta con incluir a
   * todos los que compartan el puesto de corte.
   */
  con_podio as (
    select c.*, (c.posicion <= v_corte) as en_podio from clasificada c
  )
  select
    v_liga, v_total, v_tam, v_corte,
    c.posicion, p.nickname, c.fp,
    (c.user_id = v_uid) as es_tuyo,
    c.en_podio
  from con_podio c
  join public.profiles p on p.user_id = c.user_id
  where c.en_podio or c.user_id = v_uid
  order by c.posicion;
end;
$$;

revoke all on function public.ciclo_actual() from public, anon;
revoke all on function public.ligas_para(integer) from public, anon;
revoke all on function public.ligas_sembrar(text) from public, anon;
revoke all on function public.liga_entrar(text) from public, anon;
revoke all on function public.liga_tablero(text) from public, anon;
grant execute on function public.ciclo_actual() to authenticated;
grant execute on function public.ligas_para(integer) to authenticated;
grant execute on function public.ligas_sembrar(text) to authenticated;
grant execute on function public.liga_entrar(text) to authenticated;
grant execute on function public.liga_tablero(text) to authenticated;
