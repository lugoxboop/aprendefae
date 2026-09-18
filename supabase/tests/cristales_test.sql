-- ---------------------------------------------------------------------------
-- Prueba de los Cristales y del avatar (0035, enganchados por la 0036).
--
--   · el perfil nace con Decaedro · Nocturno · Nivel I y saldo 0
--   · los hitos de racha pagan 5 / 10 / 20 / 50, una sola vez cada uno
--   · el contador paga 20 cada 5 actividades DISTINTAS: las repeticiones no
--     cuentan y las filas de bono 'racha-N' no son actividades
--   · comprar es independiente, permanente, no se ata a forma ni paleta y nunca
--     deja el saldo en negativo
--   · 'comparacion' no es una paleta que se pueda guardar
--   · LOS FP NO SE TOCAN: comprar no resta puntos
--   · el cliente no puede escribir el saldo ni el avatar a mano
--
-- Todo en una materia inventada, 'zzz-cristales', y termina en ROLLBACK.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
grant all on res to authenticated;
create temp table ids(uid uuid) on commit drop;
grant select on ids to authenticated;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'zzz-cristales@prueba.local', '', now(), now());
insert into ids(uid) select id from auth.users where email = 'zzz-cristales@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzcristales' from ids;

/* Doce actividades de mentira, todas iguales: lo que se mide aquí no es el FP. */
insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base)
select 'zzz-cr' || lpad(g::text, 2, '0'), 'zzz-cristales', 'zzz', 'exploratoria', 'facil', 10
  from generate_series(1, 12) g;

select set_config('request.jwt.claims',
  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text, true);

-- ── 1. Cómo nace el perfil ──────────────────────────────────────────────────
insert into res
select 1, 'nace con saldo 0, Decaedro, Nocturno, nivel I y solo el I comprado',
  '0 decaedro nocturno 1 {1}',
  cristales_balance || ' ' || avatar_shape || ' ' || avatar_palette || ' ' || avatar_level || ' ' || avatar_unlocked_levels::text,
  cristales_balance = 0 and avatar_shape = 'decaedro' and avatar_palette = 'nocturno'
    and avatar_level = 1 and avatar_unlocked_levels = array[1]
from public.profiles where user_id = (select uid from ids);

-- ── 2. El hito de racha del día 3 paga 5 ────────────────────────────────────
update public.profiles
   set streak = 2, last_activity_day = (now() at time zone 'America/Bogota')::date - 1
 where user_id = (select uid from ids);

set local role authenticated;
select public.registrar_fp('zzz-cr01', 60000, null);
reset role;

insert into res
select 2, 'al llegar al día 3 de racha paga 5 Cristales', '5',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 5 from public.profiles where user_id = (select uid from ids));

insert into res
select 3, 'y queda en el libro con la clave del hito y del día', '1 fila',
  (select count(*)::text || ' fila(s)' from public.cristal_movimiento
    where user_id = (select uid from ids)
      and clave = 'racha-3-' || (now() at time zone 'America/Bogota')::date),
  (select count(*) = 1 from public.cristal_movimiento
    where user_id = (select uid from ids)
      and clave = 'racha-3-' || (now() at time zone 'America/Bogota')::date);

-- ── 3. Repetir la misma actividad no paga nada, ni FP ni Cristales ──────────
set local role authenticated;
select public.registrar_fp('zzz-cr01', 60000, null);
reset role;

insert into res
select 4, 'repetir la misma actividad no mueve el saldo', '5',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 5 from public.profiles where user_id = (select uid from ids));

-- ── 4. El contador: 5 actividades distintas pagan 20 ────────────────────────
set local role authenticated;
select public.registrar_fp('zzz-cr02', 60000, null);
select public.registrar_fp('zzz-cr03', 60000, null);
select public.registrar_fp('zzz-cr04', 60000, null);
reset role;

insert into res
select 5, 'con 4 actividades distintas todavía no hay premio de contador', '5',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 5 from public.profiles where user_id = (select uid from ids));

set local role authenticated;
select public.registrar_fp('zzz-cr05', 60000, null);
reset role;

insert into res
select 6, 'la quinta actividad distinta paga 20 (5 + 20)', '25',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 25 from public.profiles where user_id = (select uid from ids));

/*
 * Nueve actividades distintas y una fila de bono 'racha-3'. Son diez filas con
 * activity_id distinto: si el bono contara como actividad, el contador llegaría
 * a 10 aquí y pagaría otros 20. Este paso es el que lo demuestra.
 */
set local role authenticated;
select public.registrar_fp('zzz-cr06', 60000, null);
select public.registrar_fp('zzz-cr07', 60000, null);
select public.registrar_fp('zzz-cr08', 60000, null);
select public.registrar_fp('zzz-cr09', 60000, null);
reset role;

insert into res
select 7, 'la fila de bono racha-N NO cuenta como actividad (9 distintas, sigue en 25)', '25',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 25 from public.profiles where user_id = (select uid from ids));

set local role authenticated;
select public.registrar_fp('zzz-cr10', 60000, null);
reset role;

insert into res
select 8, 'la décima actividad distinta paga otros 20', '45',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 45 from public.profiles where user_id = (select uid from ids));

-- ── 5. Los otros tres hitos: 7, 14 y 30 ────────────────────────────────────
update public.profiles
   set streak = 6, last_activity_day = (now() at time zone 'America/Bogota')::date - 1
 where user_id = (select uid from ids);
set local role authenticated;
select public.registrar_fp('zzz-cr11', 60000, null);
reset role;

insert into res
select 9, 'el día 7 paga 10 (45 + 10)', '55',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 55 from public.profiles where user_id = (select uid from ids));

/* Los días 14 y 30 se llegan repitiendo una actividad: repetir no paga FP, pero
 * sí mueve la racha, así que el hito y sus Cristales llegan igual. */
update public.profiles
   set streak = 13, last_activity_day = (now() at time zone 'America/Bogota')::date - 1
 where user_id = (select uid from ids);
set local role authenticated;
select public.registrar_fp('zzz-cr01', 60000, null);
reset role;

update public.profiles
   set streak = 29, last_activity_day = (now() at time zone 'America/Bogota')::date - 1
 where user_id = (select uid from ids);
set local role authenticated;
select public.registrar_fp('zzz-cr01', 60000, null);
reset role;

insert into res
select 10, 'los días 14 y 30 pagan 20 y 50 (55 + 70)', '125',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 125 from public.profiles where user_id = (select uid from ids));

insert into res
select 11, 'el libro cuadra con el saldo: 4 hitos + 2 tramos de contador', '6 filas / 125',
  (select count(*) || ' filas / ' || sum(cristales) from public.cristal_movimiento where user_id = (select uid from ids)),
  (select count(*) = 6 and sum(cristales) = 125 from public.cristal_movimiento where user_id = (select uid from ids));

-- ── 6. El mismo hito dos veces el mismo día no paga dos veces ───────────────
update public.profiles
   set streak = 2, last_activity_day = (now() at time zone 'America/Bogota')::date - 1
 where user_id = (select uid from ids);
set local role authenticated;
select public.registrar_fp('zzz-cr01', 60000, null);
reset role;

insert into res
select 12, 'volver a pisar el hito del día 3 hoy no vuelve a pagar', '125',
  (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  (select cristales_balance = 125 from public.profiles where user_id = (select uid from ids));

-- ── 7. Comprar: independiente, permanente y nunca en negativo ───────────────
create temp table antes on commit drop as
select points, cristales_balance from public.profiles where user_id = (select uid from ids);

set local role authenticated;
do $$
begin
  begin
    perform public.comprar_nivel_avatar(2);
    perform set_config('zzz.compra2', 'ok', true);
  exception when others then
    perform set_config('zzz.compra2', sqlstate, true);
  end;
  /* Sin saldo para el IV (300): tiene 65. */
  begin
    perform public.comprar_nivel_avatar(4);
    perform set_config('zzz.compra4', 'ok', true);
  exception when others then
    perform set_config('zzz.compra4', sqlstate, true);
  end;
  /* Y el II otra vez: ya lo tiene. */
  begin
    perform public.comprar_nivel_avatar(2);
    perform set_config('zzz.compra2bis', 'ok', true);
  exception when others then
    perform set_config('zzz.compra2bis', sqlstate, true);
  end;
end;
$$;
reset role;

insert into res
select 13, 'comprar el nivel II cuesta 60 y lo añade a los comprados', 'ok 65 {1,2}',
  current_setting('zzz.compra2') || ' ' || (select cristales_balance::text from public.profiles where user_id = (select uid from ids))
    || ' ' || (select avatar_unlocked_levels::text from public.profiles where user_id = (select uid from ids)),
  current_setting('zzz.compra2') = 'ok'
    and (select cristales_balance = 65 and avatar_unlocked_levels @> array[1, 2] and array_length(avatar_unlocked_levels, 1) = 2
           from public.profiles where user_id = (select uid from ids));

insert into res
select 14, 'sin saldo no se compra, y el saldo NO queda negativo', '22023 y 65',
  current_setting('zzz.compra4') || ' / ' || (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  current_setting('zzz.compra4') = '22023'
    and (select cristales_balance = 65 from public.profiles where user_id = (select uid from ids));

insert into res
select 15, 'comprar dos veces el mismo nivel se rechaza y no cobra', '22023 y 65',
  current_setting('zzz.compra2bis') || ' / ' || (select cristales_balance::text from public.profiles where user_id = (select uid from ids)),
  current_setting('zzz.compra2bis') = '22023'
    and (select cristales_balance = 65 from public.profiles where user_id = (select uid from ids));

insert into res
select 16, 'comprar NO resta FP: los puntos quedan donde estaban', (select points::text from antes),
  (select points::text from public.profiles where user_id = (select uid from ids)),
  (select p.points = a.points from public.profiles p, antes a where p.user_id = (select uid from ids));

insert into res
select 17, 'comprar no activa el nivel: sigue puesto el que estaba', '1',
  (select avatar_level::text from public.profiles where user_id = (select uid from ids)),
  (select avatar_level = 1 from public.profiles where user_id = (select uid from ids));

-- ── 8. Orden libre: el IV sin haber comprado el III ─────────────────────────
update public.profiles set cristales_balance = 400 where user_id = (select uid from ids);

set local role authenticated;
do $$
begin
  begin
    perform public.comprar_nivel_avatar(4);
    perform set_config('zzz.salto', 'ok', true);
  exception when others then
    perform set_config('zzz.salto', sqlstate, true);
  end;
  /* Ponerse el IV, que ya es suyo. */
  begin
    perform public.avatar_elegir(null, null, 4);
    perform set_config('zzz.pone4', 'ok', true);
  exception when others then
    perform set_config('zzz.pone4', sqlstate, true);
  end;
  /* Y el III, que no compró. */
  begin
    perform public.avatar_elegir(null, null, 3);
    perform set_config('zzz.pone3', 'ok', true);
  exception when others then
    perform set_config('zzz.pone3', sqlstate, true);
  end;
end;
$$;
reset role;

insert into res
select 18, 'el IV se compra sin el III: no es una escalera obligatoria', 'ok 100 {1,2,4}',
  current_setting('zzz.salto') || ' ' || (select cristales_balance::text from public.profiles where user_id = (select uid from ids))
    || ' ' || (select avatar_unlocked_levels::text from public.profiles where user_id = (select uid from ids)),
  current_setting('zzz.salto') = 'ok'
    and (select cristales_balance = 100 and avatar_unlocked_levels @> array[1, 2, 4]
           and not (3 = any (avatar_unlocked_levels)) from public.profiles where user_id = (select uid from ids));

insert into res
select 19, 'se puede poner un nivel comprado y NO uno sin comprar', 'ok / 22023',
  current_setting('zzz.pone4') || ' / ' || current_setting('zzz.pone3'),
  current_setting('zzz.pone4') = 'ok' and current_setting('zzz.pone3') = '22023';

-- ── 9. El nivel comprado no se ata a forma ni paleta ───────────────────────
set local role authenticated;
select public.avatar_elegir('red', 'brasa', null);
reset role;

insert into res
select 20, 'cambiar de forma y paleta no hace perder un nivel pagado', 'red brasa 4 {1,2,4}',
  (select avatar_shape || ' ' || avatar_palette || ' ' || avatar_level || ' ' || avatar_unlocked_levels::text
     from public.profiles where user_id = (select uid from ids)),
  (select avatar_shape = 'red' and avatar_palette = 'brasa' and avatar_level = 4
            and avatar_unlocked_levels @> array[1, 2, 4]
     from public.profiles where user_id = (select uid from ids));

-- ── 10. 'comparacion' no se puede guardar, ni por la función ni a mano ──────
set local role authenticated;
do $$
begin
  begin
    perform public.avatar_elegir(null, 'comparacion', null);
    perform set_config('zzz.comparacion', 'ok', true);
  exception when others then
    perform set_config('zzz.comparacion', sqlstate, true);
  end;
end;
$$;
reset role;

do $$
begin
  begin
    update public.profiles set avatar_palette = 'comparacion'
     where user_id = (select uid from ids);
    perform set_config('zzz.comparacion_dueno', 'ok', true);
  exception when others then
    perform set_config('zzz.comparacion_dueno', sqlstate, true);
  end;
end;
$$;

insert into res
select 21, 'la paleta de comparación se rechaza por la función y por el check', '22023 / 23514',
  current_setting('zzz.comparacion') || ' / ' || current_setting('zzz.comparacion_dueno'),
  current_setting('zzz.comparacion') = '22023' and current_setting('zzz.comparacion_dueno') = '23514';

-- ── 11. El saldo no puede quedar negativo ni escribirse desde el cliente ────
do $$
begin
  begin
    update public.profiles set cristales_balance = -1 where user_id = (select uid from ids);
    perform set_config('zzz.negativo', 'ok', true);
  exception when others then
    perform set_config('zzz.negativo', sqlstate, true);
  end;
end;
$$;

insert into res
select 22, 'un saldo negativo lo rechaza la propia tabla', '23514',
  current_setting('zzz.negativo'), current_setting('zzz.negativo') = '23514';

set local role authenticated;
do $$
begin
  begin
    update public.profiles set cristales_balance = 9999 where user_id = (select uid from ids);
    perform set_config('zzz.regalo', 'ok', true);
  exception when others then
    perform set_config('zzz.regalo', sqlstate, true);
  end;
  begin
    update public.profiles set avatar_level = 4, avatar_unlocked_levels = array[1, 2, 3, 4]
     where user_id = (select uid from ids);
    perform set_config('zzz.gratis', 'ok', true);
  exception when others then
    perform set_config('zzz.gratis', sqlstate, true);
  end;
end;
$$;
reset role;

insert into res
select 23, 'un estudiante no puede regalarse Cristales ni niveles desde el cliente', '42501 / 42501',
  current_setting('zzz.regalo') || ' / ' || current_setting('zzz.gratis'),
  current_setting('zzz.regalo') = '42501' and current_setting('zzz.gratis') = '42501';

-- ── 12. Quién puede ejecutar qué ────────────────────────────────────────────
insert into res
select 24, 'anon no ejecuta las funciones del avatar; authenticated sí', 'anon no / auth sí',
  case when has_function_privilege('anon', 'public.avatar_elegir(text,text,integer)', 'execute') then 'anon sí' else 'anon no' end
    || ' / ' ||
  case when has_function_privilege('authenticated', 'public.comprar_nivel_avatar(integer)', 'execute') then 'auth sí' else 'auth no' end,
  not has_function_privilege('anon', 'public.avatar_elegir(text,text,integer)', 'execute')
    and not has_function_privilege('anon', 'public.comprar_nivel_avatar(integer)', 'execute')
    and has_function_privilege('authenticated', 'public.avatar_elegir(text,text,integer)', 'execute')
    and has_function_privilege('authenticated', 'public.comprar_nivel_avatar(integer)', 'execute');

insert into res
select 25, 'y nadie más que el servidor puede repartir Cristales', 'ninguno',
  coalesce((select string_agg(v.rolname, ', ') from (values ('anon'), ('authenticated')) v(rolname)
             where has_function_privilege(v.rolname, 'public.cristales_dar(uuid,text,integer,text)', 'execute')), 'ninguno'),
  not has_function_privilege('anon', 'public.cristales_dar(uuid,text,integer,text)', 'execute')
    and not has_function_privilege('authenticated', 'public.cristales_dar(uuid,text,integer,text)', 'execute');

-- ── 13. Los precios y las cantidades, tal cual ──────────────────────────────
insert into res
select 26, 'precios II/III/IV = 60/150/300 y el I no se compra', '60 150 300 null',
  coalesce(public.precio_nivel_avatar(2)::text, 'null') || ' ' || coalesce(public.precio_nivel_avatar(3)::text, 'null')
    || ' ' || coalesce(public.precio_nivel_avatar(4)::text, 'null') || ' ' || coalesce(public.precio_nivel_avatar(1)::text, 'null'),
  public.precio_nivel_avatar(2) = 60 and public.precio_nivel_avatar(3) = 150
    and public.precio_nivel_avatar(4) = 300 and public.precio_nivel_avatar(1) is null;

insert into res
select 27, 'hitos de racha = 5 / 10 / 20 / 50, y ningún otro día paga', '5 10 20 50 y 0',
  public.cristales_racha(3) || ' ' || public.cristales_racha(7) || ' ' || public.cristales_racha(14)
    || ' ' || public.cristales_racha(30),
  public.cristales_racha(3) = 5 and public.cristales_racha(7) = 10 and public.cristales_racha(14) = 20
    and public.cristales_racha(30) = 50
    and (select bool_and(public.cristales_racha(d) = 0) from generate_series(1, 60) d
          where d not in (3, 7, 14, 30));

select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
