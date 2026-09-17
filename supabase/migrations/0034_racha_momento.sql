-- ═══════════════════════════════════════════════════════════════════════════
-- 0034 — EL MOMENTO DE RACHA (teseracto + calendario semanal)
--
-- Sustituye, del lado del cliente, a racha_animacion() de la 0010. Esa función
-- no se toca ni se borra —ya está aplicada y no molesta—, pero el sitio deja
-- de llamarla. Por qué no salía nunca:
--
--   1. CUÁNDO SE PREGUNTABA (cliente). Solo al abrir la sesión, y la racha sube
--      en registrar_fp al terminar la primera actividad del día, que es
--      DESPUÉS. Al entrar la respuesta era «no toca» y nadie volvía a
--      preguntar. Eso se arregla en src/racha/disparador.js.
--
--   2. racha_animacion_valor NO SE REINICIABA al perder la racha. Con un
--      récord celebrado de 7, la racha nueva pedía «streak > 7» y los días 2 a
--      7 no se animaban. Aquí no se compara con el último valor celebrado:
--      registrar_fp solo mueve la racha una vez al día —a racha + 1 o a 1—, así
--      que «hubo actividad hoy» YA ES «la racha avanzó hoy».
--
-- Las tres reglas, en un solo UPDATE ... RETURNING, que lee y marca a la vez:
-- dos pestañas no pueden colarse entre medias.
--   · con sesión                 auth.uid() no nulo
--   · solo si avanzó             last_activity_day = hoy (Bogotá)
--   · una vez al día             racha_animacion_dia distinto de hoy
--
-- El día 1 SÍ se celebra ahora: la fórmula del teseracto revela su primera
-- arista ese día («Pasaste de racha 0 a 1»).
--
-- Devuelve también la semana (lunes a hoy, Bogotá) con los días que tuvieron
-- actividad, para el calendario, y la fecha de hoy según el servidor.
--
-- No escribe en fp_history. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.racha_momento()
returns table (mostrar boolean, desde integer, hasta integer, hoy date, semana date[])
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid    uuid := auth.uid();
  v_hoy    date := (now() at time zone 'America/Bogota')::date;
  v_lunes  date := v_hoy - (extract(isodow from (now() at time zone 'America/Bogota'))::int - 1);
  v_racha  integer;
  v_semana date[];
begin
  if v_uid is null then
    return query select false, 0, 0, v_hoy, array[]::date[];
    return;
  end if;

  update public.profiles p
     set racha_animacion_dia   = v_hoy,
         racha_animacion_valor = p.streak
   where p.user_id = v_uid
     and p.last_activity_day = v_hoy
     and coalesce(p.streak, 0) >= 1
     and p.racha_animacion_dia is distinct from v_hoy
  returning p.streak into v_racha;

  select coalesce(array_agg(distinct d order by d), array[]::date[]) into v_semana
    from (
      select (h.created_at at time zone 'America/Bogota')::date as d
        from public.fp_history h
       where h.user_id = v_uid
         and h.activity_id not like 'racha-%'
    ) x
   where d between v_lunes and v_hoy;

  if v_racha is null then
    return query select false, 0, 0, v_hoy, v_semana;
    return;
  end if;

  return query select true, v_racha - 1, v_racha, v_hoy, v_semana;
end;
$$;

revoke all on function public.racha_momento() from public, anon;
grant execute on function public.racha_momento() to authenticated;
