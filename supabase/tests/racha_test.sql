-- ---------------------------------------------------------------------------
-- Prueba de punta a punta de la racha, contra la función REALMENTE desplegada.
--
-- POR QUÉ EXISTE. La migración 0007 se aplicó y el relleno histórico se revisó,
-- pero eso comprueba el pasado: que los datos viejos quedaran coherentes. No
-- comprueba que completar una actividad HOY mueva el contador. Las cuatro
-- medallas de racha no se podían montar sobre algo que nadie había visto
-- incrementar de verdad, así que esto lo cierra.
--
-- Llama a registrar_fp de verdad, como usuario autenticado, moviendo
-- last_activity_day entre llamadas para simular días. No toca a nadie real:
-- crea su propio usuario en una materia inventada y termina en ROLLBACK.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;

-- Usuario de prueba, en una materia que no existe.
insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-racha@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-racha@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzrachaprueba' from ids;
grant select on ids to authenticated;

-- El uid se lee ANTES de cambiar de rol: después, la tabla temporal no se ve.
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);
set local role authenticated;

-- ── 1. Primera actividad: la racha arranca en 1 ────────────────────────────
select public.registrar_fp('zzz-act-1', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);

insert into res select 1, 'primera actividad deja la racha en 1', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

-- ── 2. Otra actividad el MISMO día: la racha no se mueve ───────────────────
select public.registrar_fp('zzz-act-2', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);

insert into res select 2, 'segunda actividad del mismo día no sube la racha', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

-- ── 3. Al día siguiente: la racha sube a 2 ─────────────────────────────────
-- Se retrasa el último día para simular que pasó una noche.
reset role;
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids);
set local role authenticated;

select public.registrar_fp('zzz-act-3', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);

insert into res select 3, 'día seguido sube la racha a 2', '2',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 2 from public.profiles where user_id = (select uid from ids));

-- ── 4. Tercer día seguido: llega a 3, que es el primer hito ────────────────
reset role;
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids);
set local role authenticated;

select public.registrar_fp('zzz-act-4', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);

insert into res select 4, 'tercer día seguido llega al hito de 3', '3',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 3 from public.profiles where user_id = (select uid from ids));

-- ── 5. El bono del hito quedó registrado como fila propia ──────────────────
insert into res select 5, 'el hito de 3 dejó su bono en el historial', 'sí',
  (select case when count(*) > 0 then 'sí' else 'no' end
     from public.fp_history where user_id = (select uid from ids) and activity_id = 'racha-3'),
  (select count(*) > 0
     from public.fp_history where user_id = (select uid from ids) and activity_id = 'racha-3');

-- ── 6. best_streak guarda el récord ────────────────────────────────────────
insert into res select 6, 'best_streak guarda el récord', '3',
  (select best_streak::text from public.profiles where user_id = (select uid from ids)),
  (select best_streak = 3 from public.profiles where user_id = (select uid from ids));

-- ── 7. Un día en blanco corta la racha viva, no el récord ──────────────────
reset role;
update public.profiles set last_activity_day = last_activity_day - 3
 where user_id = (select uid from ids);
set local role authenticated;

select public.registrar_fp('zzz-act-5', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);

insert into res select 7, 'tras un día en blanco la racha vuelve a 1', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

insert into res select 8, 'el récord sobrevive al corte', '3',
  (select best_streak::text from public.profiles where user_id = (select uid from ids)),
  (select best_streak = 3 from public.profiles where user_id = (select uid from ids));

-- ── Resumen. Es la única consulta que devuelve filas: el editor de Supabase
--    solo enseña la última, así que todo se acumula y se lee de una vez. ────
reset role;

select
  n,
  paso,
  esperado,
  obtenido,
  case when ok then 'OK' else 'FALLA' end as estado
from res
union all
select
  99,
  (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res),
  '', '',
  (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
