-- ---------------------------------------------------------------------------
-- 0010 — La animación de racha, una vez al día.
--
-- Guarda DOS cosas, no una: qué día se mostró y con qué valor de racha. Con
-- solo la fecha no se podría distinguir "hoy ya la vio" de "hoy la racha
-- avanzó", y con solo el valor no se sabría si ya se celebró hoy.
--
-- Van en profiles y no en tabla aparte porque son dos datos por estudiante que
-- se leen y se escriben siempre juntos con el resto de su perfil. Una tabla
-- nueva sería una unión más para guardar dos columnas.
--
-- NO SE TOCA registrar_fp. Esa función está verificada de punta a punta y en
-- producción; meterle mano por una animación sería arriesgar el contador de
-- rachas por un adorno. Todo lo que hace falta se deduce de lo que ya guarda.
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists racha_animacion_dia date;
alter table public.profiles add column if not exists racha_animacion_valor integer not null default 0;

-- ---------------------------------------------------------------------------
-- Decide si toca animar y, si toca, lo deja marcado en la misma llamada.
--
-- Que leer y marcar sean lo mismo es deliberado: si fueran dos pasos, dos
-- pestañas abiertas a la vez podrían colarse las dos entre la lectura y la
-- marca, y el estudiante vería la animación dos veces. Se prefiere el riesgo
-- contrario —que se pierda si el cliente se cae justo después— porque una
-- animación perdida no se nota y una repetida sí.
--
-- Se anima cuando se cumplen las tres:
--   · hubo actividad HOY, así que la racha se movió hoy;
--   · la racha va por 2 o más, porque de 0 a 1 no hay transición que celebrar
--     —y un reinicio tras perderla tampoco es una celebración—;
--   · el valor de hoy es mayor que el último celebrado, así que avanzó de
--     verdad y no es la misma racha vista otra vez.
-- ---------------------------------------------------------------------------
create or replace function public.racha_animacion()
returns table (mostrar boolean, desde integer, hasta integer)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid    uuid := auth.uid();
  v_hoy    date := (now() at time zone 'America/Bogota')::date;
  v_perfil public.profiles;
begin
  if v_uid is null then
    return query select false, 0, 0;
    return;
  end if;

  select * into v_perfil from public.profiles where user_id = v_uid;

  if v_perfil.user_id is null
     or v_perfil.last_activity_day is distinct from v_hoy
     or coalesce(v_perfil.streak, 0) < 2
     or coalesce(v_perfil.streak, 0) <= coalesce(v_perfil.racha_animacion_valor, 0)
     or v_perfil.racha_animacion_dia = v_hoy
  then
    return query select false, coalesce(v_perfil.racha_animacion_valor, 0), coalesce(v_perfil.streak, 0);
    return;
  end if;

  update public.profiles
     set racha_animacion_dia   = v_hoy,
         racha_animacion_valor = v_perfil.streak
   where user_id = v_uid;

  return query select true, coalesce(v_perfil.racha_animacion_valor, 0), v_perfil.streak;
end;
$$;

revoke all on function public.racha_animacion() from public, anon;
grant execute on function public.racha_animacion() to authenticated;
