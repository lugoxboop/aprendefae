-- ═══════════════════════════════════════════════════════════════════════════
-- 0037 — EL AVATAR EN EL RANKING Y EN LA LIGA
--
-- Las dos funciones que pintan filas de OTROS estudiantes devuelven ahora, con
-- cada fila, la combinación de su avatar: forma, paleta y nivel puesto.
--
--   ranking_fp     derivada de la 0004 —la única que la define—
--   liga_tablero   derivada de la 0026 —la última que la define—
--
-- Cada una con UN cambio: tres columnas más en el retorno, leídas de profiles
-- en la fila que ya se devolvía. Ni una fila más, ni un filtro distinto, ni un
-- cálculo tocado: el podio sigue siendo la zona de ascenso, el top sigue siendo
-- de 10, y la posición exacta de quien no sale en el podio sigue llegando solo
-- a su dueño.
--
-- ═══════════ QUÉ SE EXPONE, Y POR QUÉ ES LO MISMO QUE ANTES ═══════════
--
-- El avatar es un adorno elegido para enseñarse, igual que el apodo, y sale
-- exactamente en las filas donde el apodo ya salía. NO se exponen los niveles
-- comprados (avatar_unlocked_levels) ni el saldo de Cristales: el ranking dice
-- qué lleva puesto alguien, no qué tiene ni cuánto le queda. Cristales nunca
-- entran en un ranking.
--
-- ═══════════ DROP + CREATE, Y POR TANTO GRANTS OTRA VEZ ═══════════
--
-- create or replace no puede cambiar el tipo de retorno. El drop se lleva los
-- permisos y la función renace ejecutable por public —que en Supabase incluye a
-- anon—, así que al final se revocan y se conceden de nuevo, y
-- avatar_ranking_test.sql comprueba que anon no las ejecuta.
--
-- Va DESPUÉS de la 0036. Idempotente: el drop lleva if exists.
-- ═══════════════════════════════════════════════════════════════════════════

drop function if exists public.ranking_fp(text, text);
drop function if exists public.liga_tablero(text);

-- ── ranking_fp: + avatar ────────────────────────────────────────────────────

create function public.ranking_fp(
  p_subject text default null,          -- null = ranking general (todas las materias)
  p_periodo text default 'semestre'     -- diario | semanal | semestre
)
returns table (
  posicion bigint,
  nickname text,
  fp       bigint,
  es_tuyo  boolean,
  avatar_shape   text,      -- (0037)
  avatar_palette text,      -- (0037)
  avatar_level   integer    -- (0037)
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid   uuid := auth.uid();
  v_desde timestamptz;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para ver el ranking' using errcode = '42501';
  end if;

  /*
   * La ventana se calcula en horario de Bogotá, no en UTC: "hoy" y "esta
   * semana" tienen que ser los del estudiante. Con UTC, el ranking diario se
   * reiniciaría a las 7 p.m. hora local.
   * date_trunc('week') empieza en lunes, que es justo lo pedido.
   */
  if p_periodo = 'diario' then
    v_desde := date_trunc('day',  now() at time zone 'America/Bogota') at time zone 'America/Bogota';
  elsif p_periodo = 'semanal' then
    v_desde := date_trunc('week', now() at time zone 'America/Bogota') at time zone 'America/Bogota';
  else
    v_desde := '-infinity'::timestamptz;
  end if;

  return query
  with totales as (
    select h.user_id, sum(h.fp_awarded)::bigint as fp
      from public.fp_history h
     where h.created_at >= v_desde
       and (p_subject is null or h.subject_id = p_subject)
     group by h.user_id
    having sum(h.fp_awarded) > 0
  ),
  clasificados as (
    select
      rank() over (order by t.fp desc)::bigint as posicion,
      p.nickname,
      t.fp,
      (t.user_id = v_uid) as es_tuyo,
      p.avatar_shape, p.avatar_palette, p.avatar_level   -- (0037)
    from totales t
    join public.profiles p on p.user_id = t.user_id
  )
  -- Top 10 y, si el estudiante quedó fuera, su propia fila.
  select c.posicion, c.nickname, c.fp, c.es_tuyo,
         c.avatar_shape, c.avatar_palette, c.avatar_level   -- (0037)
    from clasificados c
   where c.posicion <= 10 or c.es_tuyo
   order by c.posicion;
end;
$$;


-- ── liga_tablero: + avatar ──────────────────────────────────────────────────

create function public.liga_tablero(p_subject text)
returns table (
  liga          integer,
  total_ligas   integer,
  tam_liga      integer,
  corte_podio   integer,
  posicion      bigint,
  nickname      text,
  fp            bigint,
  es_tuyo       boolean,
  en_podio      boolean,
  avatar_shape   text,      -- (0037)
  avatar_palette text,      -- (0037)
  avatar_level   integer    -- (0037)
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

  /* Del recuento guardado: la misma respuesta que da liga_contexto. */
  v_total := public.liga_niveles(p_subject, v_ciclo);

  /*
   * EL PODIO YA NO ES EL 28% DE LA LIGA. Es la zona de ascenso: quien subiría
   * si la semana terminara ahora, con ligas_zona(), la misma función del
   * cierre semanal. corte_podio pasa a ser el cupo del nivel. Ver las
   * secciones 6 y 7 de la 0026.
   */

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
  zonas as (
    select
      t.user_id,
      public.ligas_zona(
        rank() over (order by t.fp desc),
        rank() over (order by t.fp asc),
        count(*) over ()
      ) as zona
    from tabla t
    where t.fp > 0
  ),
  con_podio as (
    select c.*, coalesce(z.zona = 'sube', false) as en_podio
      from clasificada c
      left join zonas z on z.user_id = c.user_id
  )
  select
    v_liga, v_total, v_tam,
    (select public.ligas_cupo(count(*)) from tabla t2 where t2.fp > 0),
    c.posicion, p.nickname, c.fp,
    (c.user_id = v_uid) as es_tuyo,
    c.en_podio,
    p.avatar_shape, p.avatar_palette, p.avatar_level   -- (0037)
  from con_podio c
  join public.profiles p on p.user_id = c.user_id
  where c.en_podio or c.user_id = v_uid
  order by c.posicion;
end;
$$;



-- ── Permisos: los mismos de antes del drop ──────────────────────────────────
revoke all on function public.ranking_fp(text, text) from public, anon;
grant execute on function public.ranking_fp(text, text) to authenticated;
revoke all on function public.liga_tablero(text) from public, anon;
grant execute on function public.liga_tablero(text) to authenticated;
