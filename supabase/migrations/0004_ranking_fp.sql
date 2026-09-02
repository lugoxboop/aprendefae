-- Rankings de FP.
--
-- Por qué hace falta una función y no basta con consultar fp_history desde el
-- cliente: las políticas RLS solo dejan ver las filas propias, así que un
-- SELECT del navegador jamás podría sumar los FP de los demás. Esta función
-- corre como security definer para poder agregar sobre toda la tabla, pero
-- devuelve únicamente el agregado —apodo, FP y posición— y nunca filas de
-- historial ajenas, ni correos, ni nombres reales.
--
-- El apodo sí es público entre estudiantes: es exactamente lo que anuncia la
-- política de privacidad.
--
-- Nota: `subject_id` ya venía desde la migración 0003, así que no hay que
-- añadir la columna ni rellenar el histórico.

create or replace function public.ranking_fp(
  p_subject text default null,          -- null = ranking general (todas las materias)
  p_periodo text default 'semestre'     -- diario | semanal | semestre
)
returns table (
  posicion bigint,
  nickname text,
  fp       bigint,
  es_tuyo  boolean
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
      (t.user_id = v_uid) as es_tuyo
    from totales t
    join public.profiles p on p.user_id = t.user_id
  )
  -- Top 10 y, si el estudiante quedó fuera, su propia fila.
  select c.posicion, c.nickname, c.fp, c.es_tuyo
    from clasificados c
   where c.posicion <= 10 or c.es_tuyo
   order by c.posicion;
end;
$$;

-- Supabase concede EXECUTE a anon por privilegios por defecto: revocar a
-- PUBLIC no basta (ver migración 0002). Un anónimo no debe ver apodos.
revoke all on function public.ranking_fp(text, text) from public;
revoke all on function public.ranking_fp(text, text) from anon;
grant execute on function public.ranking_fp(text, text) to authenticated;
