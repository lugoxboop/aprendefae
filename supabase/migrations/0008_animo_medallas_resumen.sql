-- ---------------------------------------------------------------------------
-- 0008 — Ánimo, medallas y resumen de semestre.
--
-- Tres funcionalidades que comparten capa de datos:
--
--   1. Ánimo: una reacción por par de estudiantes y por ciclo semanal.
--   2. Medallas: se calculan al vuelo desde lo que ya está guardado.
--   3. Resumen de semestre: los datos de la tarjeta compartible.
--
-- NADA DE ESTO GUARDA INSTANTÁNEAS NUEVAS DE LIGA. Los resultados de cada ciclo
-- cerrado se reconstruyen de fp_history + liga_membresia, que es exactamente lo
-- que ya hace ligas_sembrar para decidir ascensos. Así las medallas valen
-- también para los ciclos que ya pasaron, en vez de empezar a contar desde hoy.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Ajustes del sitio.
--
-- Existe para que las fechas del semestre no queden escritas en el código. El
-- panel de administración para editarlas TODAVÍA NO EXISTE: mientras tanto se
-- cambian con un update aquí. La lógica ya lee de esta tabla, así que cuando el
-- panel se construya no hay que tocar ninguna función.
-- ---------------------------------------------------------------------------
create table if not exists public.ajustes (
  clave text primary key,
  valor text not null,
  nota  text
);

alter table public.ajustes enable row level security;
alter table public.ajustes force row level security;
-- Sin políticas: solo lo leen las funciones security definer de abajo.

insert into public.ajustes (clave, valor, nota) values
  ('semestre_inicio', '2026-08-01', 'Primer día del semestre en curso, hora de Bogotá.'),
  ('semestre_fin',    '2026-12-15', 'Día de cierre. Desde esta fecha el resumen queda congelado.')
on conflict (clave) do nothing;

create or replace function public.ajuste_fecha(p_clave text, p_defecto date)
returns date
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select valor::date from public.ajustes where clave = p_clave), p_defecto);
$$;

-- ---------------------------------------------------------------------------
-- ÁNIMO
--
-- El emisor NUNCA se expone. La tabla lo guarda porque hace falta para impedir
-- que la misma persona anime dos veces en la misma semana, pero ninguna función
-- de lectura lo devuelve, ni siquiera al que lo recibió. Si algún día se quiere
-- una versión identificada, es una decisión de producto aparte y se verá aquí:
-- hoy no hay ninguna consulta que pueda revelarlo.
-- ---------------------------------------------------------------------------
create table if not exists public.animo (
  de_user_id   uuid not null references auth.users (id) on delete cascade,
  para_user_id uuid not null references auth.users (id) on delete cascade,
  ciclo        date not null,
  creado_en    timestamptz not null default now(),
  primary key (de_user_id, para_user_id, ciclo),
  -- Animarse a uno mismo se impide en la base, no solo escondiendo el botón.
  constraint animo_no_a_si_mismo check (de_user_id <> para_user_id)
);

create index if not exists animo_para_idx on public.animo (para_user_id);

alter table public.animo enable row level security;
alter table public.animo force row level security;
-- Sin políticas: ni siquiera un cliente autenticado puede leer la tabla directo.

-- ---------------------------------------------------------------------------
-- Dar ánimo. Se dirige por apodo porque el apodo ya es público —está impreso en
-- la fila que el estudiante está mirando— y es único. Así el cliente nunca
-- necesita conocer el user_id de nadie más, que es la misma regla que sostiene
-- ranking_fp y liga_tablero.
--
-- Devuelve true si quedó registrado, false si ya lo había dado esta semana.
-- ---------------------------------------------------------------------------
create or replace function public.animo_dar(p_nickname text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_para uuid;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para dar ánimo' using errcode = '42501';
  end if;

  select user_id into v_para
    from public.profiles
   where lower(nickname) = lower(btrim(p_nickname));

  if v_para is null then
    raise exception 'No existe ese apodo' using errcode = '22023';
  end if;

  if v_para = v_uid then
    raise exception 'No puedes darte ánimo a ti mismo' using errcode = '22023';
  end if;

  insert into public.animo (de_user_id, para_user_id, ciclo)
  values (v_uid, v_para, public.ciclo_actual())
  on conflict do nothing;

  return found;
end;
$$;

-- ---------------------------------------------------------------------------
-- Estado de ánimo para una lista de apodos: cuántos lleva cada uno y si YO ya
-- le di esta semana. Lo segundo es sobre la acción de quien pregunta, no sobre
-- quién le dio a quién: nadie puede averiguar así los emisores de otro.
-- ---------------------------------------------------------------------------
create or replace function public.animos_de(p_nicknames text[])
returns table (nickname text, recibidos bigint, ya_le_di boolean)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid   uuid := auth.uid();
  v_ciclo date := public.ciclo_actual();
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  return query
  select
    p.nickname,
    (select count(*) from public.animo a where a.para_user_id = p.user_id)::bigint,
    exists (
      select 1 from public.animo a
       where a.de_user_id = v_uid and a.para_user_id = p.user_id and a.ciclo = v_ciclo
    )
  from public.profiles p
  where lower(p.nickname) = any (select lower(x) from unnest(p_nicknames) x);
end;
$$;

/* Los que llevo recibidos. Solo el número: nunca de quién. */
create or replace function public.animos_recibidos()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::bigint from public.animo where para_user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Resultados de un ciclo de liga ya cerrado, reconstruidos.
--
-- Misma ventana y mismo criterio que usa ligas_sembrar para ascensos y que usa
-- liga_tablero para el podio (28% de la liga, redondeado hacia arriba, con
-- empates incluidos). Se reconstruye en vez de guardarse para que las medallas
-- cuenten también lo que pasó antes de que existieran.
-- ---------------------------------------------------------------------------
create or replace function public.liga_resultados(p_subject text, p_ciclo date)
returns table (user_id uuid, liga integer, posicion bigint, fp bigint, en_podio boolean, tam_liga integer)
language sql
security definer
set search_path = public
stable
as $$
  with fp_ciclo as (
    select
      m.user_id,
      m.liga,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = m.user_id
           and h.subject_id = p_subject
           and h.created_at >= p_ciclo::timestamp at time zone 'America/Bogota'
           and h.created_at <  (p_ciclo + 7)::timestamp at time zone 'America/Bogota'
      ), 0)::bigint as fp
    from public.liga_membresia m
    where m.subject_id = p_subject and m.ciclo = p_ciclo
  ),
  tam as (
    select liga, count(*)::integer as n from fp_ciclo group by liga
  ),
  clasificada as (
    select
      f.user_id, f.liga, f.fp,
      rank() over (partition by f.liga order by f.fp desc) as posicion,
      t.n as tam_liga
    from fp_ciclo f
    join tam t on t.liga = f.liga
  )
  select
    c.user_id, c.liga, c.posicion, c.fp,
    (c.posicion <= greatest(1, ceil(c.tam_liga::numeric * 0.28)::integer)) as en_podio,
    c.tam_liga
  from clasificada c;
$$;

-- ---------------------------------------------------------------------------
-- MEDALLAS
--
-- Se calculan al vuelo. No hay tabla de medallas ganadas y es deliberado: si el
-- criterio cambia, cambia la función y todo el mundo queda recalculado, en vez
-- de arrastrar filas otorgadas con una regla vieja.
--
-- `progreso` y `meta` sirven para las que aún no están: la interfaz muestra la
-- medalla apagada con su avance, nunca escondida.
-- ---------------------------------------------------------------------------
create or replace function public.medallas()
returns table (
  codigo      text,
  familia     text,
  titulo      text,
  descripcion text,
  rareza      text,
  subject_id  text,
  obtenida    boolean,
  progreso    integer,
  meta        integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid    uuid := auth.uid();
  v_ciclo  date := public.ciclo_actual();
  v_inicio date := public.ajuste_fecha('semestre_inicio', '2026-08-01');
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para ver tus medallas' using errcode = '42501';
  end if;

  return query
  with
  /* Ciclos ya cerrados: el que está en curso todavía no cuenta para nada. */
  ciclos as (
    select distinct m.subject_id, m.ciclo
      from public.liga_membresia m
     where m.ciclo < v_ciclo
  ),
  mios as (
    select c.subject_id, c.ciclo, r.liga, r.posicion, r.en_podio
      from ciclos c
      cross join lateral public.liga_resultados(c.subject_id, c.ciclo) r
     where r.user_id = v_uid
  ),
  /* Cuántas ligas tenía la materia en cada ciclo, para saber cuál es la alta. */
  ligas_por_ciclo as (
    select m.subject_id, m.ciclo, max(m.liga) as total
      from public.liga_membresia m
     group by m.subject_id, m.ciclo
  ),
  podios as (
    select subject_id, count(*)::integer as n
      from mios where en_podio group by subject_id
  ),
  primeros as (
    select m.subject_id, count(*)::integer as n
      from mios m
     where m.posicion = 1 and m.ciclo >= v_inicio
     group by m.subject_id
  ),
  /* Rachas de ciclos consecutivos en la liga 1. */
  en_alta as (
    select m.subject_id, m.ciclo,
           row_number() over (partition by m.subject_id order by m.ciclo) as fila
      from mios m
      join ligas_por_ciclo l on l.subject_id = m.subject_id and l.ciclo = m.ciclo
     where m.liga = 1 and l.total > 1
  ),
  rachas_alta as (
    select subject_id, max(largo)::integer as largo from (
      select subject_id, count(*) as largo
        from (select subject_id, ciclo, (ciclo - (fila * 7)) as grupo from en_alta) g
       group by subject_id, grupo
    ) s group by subject_id
  ),
  /* Actividades evaluativas distintas completadas. */
  evaluativas as (
    select count(distinct h.activity_id)::integer as n
      from public.fp_history h
     where h.user_id = v_uid and h.modality = 'evaluativa'
  ),
  /* Maestrías: genérico por actividad difícil/experta con el tope de acierto. */
  maestrias as (
    select distinct h.activity_id, h.subject_id
      from public.fp_history h
     where h.user_id = v_uid
       and h.modality = 'evaluativa'
       and h.difficulty in ('dificil', 'experto')
       and h.correct_pct >= 100
  ),
  ultimo as (select 1)

  -- 1. Primer podio (global)
  select 'primer-podio', 'podio', 'Primer podio',
         'Entraste al podio de una liga por primera vez.', 'baja-media', null::text,
         (select count(*) from mios where en_podio) > 0,
         least(1, (select count(*)::integer from mios where en_podio)), 1

  union all
  -- 2. Podios acumulados, por materia, dos escalones
  select 'podios-3-' || s.subject_id, 'podio', 'Tres podios',
         'Llegaste al podio 3 veces en esta materia.', 'media', s.subject_id,
         coalesce(p.n, 0) >= 3, least(3, coalesce(p.n, 0)), 3
    from (select distinct subject_id from public.liga_membresia) s
    left join podios p on p.subject_id = s.subject_id
  union all
  select 'podios-8-' || s.subject_id, 'podio', 'Ocho podios',
         'Llegaste al podio 8 veces en esta materia.', 'alta', s.subject_id,
         coalesce(p.n, 0) >= 8, least(8, coalesce(p.n, 0)), 8
    from (select distinct subject_id from public.liga_membresia) s
    left join podios p on p.subject_id = s.subject_id

  union all
  -- 3. Racha en liga alta
  select 'liga-alta-4-' || s.subject_id, 'liga', 'Cuatro ciclos arriba',
         'Te mantuviste 4 ciclos seguidos en la liga alta, sin descender.', 'alta', s.subject_id,
         coalesce(r.largo, 0) >= 4, least(4, coalesce(r.largo, 0)), 4
    from (select distinct subject_id from public.liga_membresia) s
    left join rachas_alta r on r.subject_id = s.subject_id

  union all
  -- 4. Primeros lugares del semestre
  select 'primero-semestre-' || s.subject_id, 'liga', 'Primer lugar del semestre',
         'Terminaste #1 de tu liga en esta materia durante el semestre.', 'muy-alta', s.subject_id,
         coalesce(pr.n, 0) > 0, coalesce(pr.n, 0), 1
    from (select distinct subject_id from public.liga_membresia) s
    left join primeros pr on pr.subject_id = s.subject_id

  union all
  /*
   * La 5 (Materia completa) NO se calcula aquí. Cuántas actividades tiene cada
   * materia vive en subjects.js, que es la única fuente de verdad del catálogo;
   * duplicar esa lista en SQL sería tener dos verdades que se separan sola la
   * primera vez que Gen añada una actividad. El cliente la arma con
   * actividades_hechas() y su propio catálogo.
   */
  union all
  -- 6. Maestrías, una por actividad difícil/experta con el tope alcanzado
  select 'maestria-' || m.activity_id, 'maestria', 'Maestría',
         'Alcanzaste el tope de acierto en esta actividad.', 'alta', m.subject_id,
         true, 1, 1
    from maestrias m

  union all
  -- 7. Explorador evaluativo, dos escalones
  select 'explorador-5', 'explorador', 'Explorador',
         'Completaste 5 actividades evaluativas distintas.', 'baja-media', null::text,
         (select n from evaluativas) >= 5, least(5, (select n from evaluativas)), 5
  union all
  select 'explorador-12', 'explorador', 'Explorador experto',
         'Completaste 12 actividades evaluativas distintas.', 'media', null::text,
         (select n from evaluativas) >= 12, least(12, (select n from evaluativas)), 12;
end;
$$;

/*
 * Qué actividades ha completado el estudiante, por materia. Es lo que el
 * cliente cruza con subjects.js para la medalla de "Materia completa" sin que
 * el catálogo tenga que existir dos veces.
 */
create or replace function public.actividades_hechas()
returns table (subject_id text, activity_id text)
language sql
security definer
set search_path = public
stable
as $
  select distinct h.subject_id, h.activity_id
    from public.fp_history h
   where h.user_id = auth.uid();
$;

-- ---------------------------------------------------------------------------
-- RESUMEN DE SEMESTRE
--
-- Devuelve una fila por materia más los totales. La tarjeta la dibuja el
-- cliente; aquí solo salen los números, ya recortados a la ventana del
-- semestre.
--
-- `cerrado` dice si la fecha de cierre ya pasó: antes es un avance, después es
-- la versión definitiva.
-- ---------------------------------------------------------------------------
create or replace function public.resumen_semestre()
returns table (
  subject_id      text,
  fp              bigint,
  actividades     integer,
  liga_final      integer,
  posicion_final  bigint,
  total_ligas     integer,
  ciclo_final     date
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid    uuid := auth.uid();
  v_inicio date := public.ajuste_fecha('semestre_inicio', '2026-08-01');
  v_fin    date := public.ajuste_fecha('semestre_fin', '2026-12-15');
  v_hasta  date := least(v_fin, (now() at time zone 'America/Bogota')::date);
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  return query
  with materias as (
    select distinct h.subject_id
      from public.fp_history h
     where h.user_id = v_uid
       and h.created_at >= v_inicio::timestamp at time zone 'America/Bogota'
       and h.created_at <  (v_hasta + 1)::timestamp at time zone 'America/Bogota'
  ),
  fp_materia as (
    select h.subject_id,
           sum(h.fp_awarded)::bigint as fp,
           count(distinct h.activity_id)::integer as actividades
      from public.fp_history h
     where h.user_id = v_uid
       and h.created_at >= v_inicio::timestamp at time zone 'America/Bogota'
       and h.created_at <  (v_hasta + 1)::timestamp at time zone 'America/Bogota'
     group by h.subject_id
  ),
  /* El último ciclo CERRADO antes del corte, nunca uno en curso. */
  ultimo_ciclo as (
    select m.subject_id, max(m.ciclo) as ciclo
      from public.liga_membresia m
     where m.ciclo >= v_inicio
       and m.ciclo + 7 <= v_hasta
     group by m.subject_id
  ),
  posicion as (
    select u.subject_id, u.ciclo, r.liga, r.posicion,
           (select max(m2.liga) from public.liga_membresia m2
             where m2.subject_id = u.subject_id and m2.ciclo = u.ciclo) as total_ligas
      from ultimo_ciclo u
      cross join lateral public.liga_resultados(u.subject_id, u.ciclo) r
     where r.user_id = v_uid
  )
  select
    m.subject_id,
    coalesce(f.fp, 0)::bigint,
    coalesce(f.actividades, 0),
    p.liga,
    p.posicion,
    p.total_ligas,
    p.ciclo
  from materias m
  left join fp_materia f on f.subject_id = m.subject_id
  left join posicion  p on p.subject_id = m.subject_id;
end;
$$;

/*
 * Racha máxima alcanzada DENTRO del semestre. No es el récord histórico, que
 * vive en profiles.best_streak y sigue siendo otra cosa.
 *
 * Se reconstruye de los días con actividad: no hay registro histórico de la
 * racha día a día, pero sí de qué días hubo FP, y de ahí sale.
 */
create or replace function public.racha_maxima_semestre()
returns integer
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid    uuid := auth.uid();
  v_inicio date := public.ajuste_fecha('semestre_inicio', '2026-08-01');
  v_fin    date := public.ajuste_fecha('semestre_fin', '2026-12-15');
  v_max    integer;
begin
  if v_uid is null then return 0; end if;

  select coalesce(max(largo), 0) into v_max from (
    select count(*) as largo
      from (
        select d.dia, (d.dia - (row_number() over (order by d.dia))::integer) as grupo
          from (
            select distinct (h.created_at at time zone 'America/Bogota')::date as dia
              from public.fp_history h
             where h.user_id = v_uid
               and (h.created_at at time zone 'America/Bogota')::date between v_inicio and v_fin
          ) d
      ) g
     group by g.grupo
  ) s;

  return v_max;
end;
$$;

/* Si el semestre ya cerró: decide si el resumen es avance o definitivo. */
create or replace function public.semestre_cerrado()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select (now() at time zone 'America/Bogota')::date
         >= public.ajuste_fecha('semestre_fin', '2026-12-15');
$$;

-- ---------------------------------------------------------------------------
-- Permisos: nada para anónimos, como el resto del esquema.
-- ---------------------------------------------------------------------------
revoke all on function public.ajuste_fecha(text, date) from public, anon;
revoke all on function public.animo_dar(text) from public, anon;
revoke all on function public.animos_de(text[]) from public, anon;
revoke all on function public.animos_recibidos() from public, anon;
revoke all on function public.liga_resultados(text, date) from public, anon;
revoke all on function public.medallas() from public, anon;
revoke all on function public.actividades_hechas() from public, anon;
revoke all on function public.resumen_semestre() from public, anon;
revoke all on function public.racha_maxima_semestre() from public, anon;
revoke all on function public.semestre_cerrado() from public, anon;

grant execute on function public.ajuste_fecha(text, date) to authenticated;
grant execute on function public.animo_dar(text) to authenticated;
grant execute on function public.animos_de(text[]) to authenticated;
grant execute on function public.animos_recibidos() to authenticated;
grant execute on function public.liga_resultados(text, date) to authenticated;
grant execute on function public.medallas() to authenticated;
grant execute on function public.actividades_hechas() to authenticated;
grant execute on function public.resumen_semestre() to authenticated;
grant execute on function public.racha_maxima_semestre() to authenticated;
grant execute on function public.semestre_cerrado() to authenticated;
