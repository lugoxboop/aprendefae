-- ---------------------------------------------------------------------------
-- Prueba de punta a punta de la racha, contra la función REALMENTE desplegada.
--
-- POR QUÉ EXISTE. La migración 0007 se aplicó y el relleno histórico se revisó,
-- pero eso comprueba el pasado: que los datos viejos quedaran coherentes. No
-- comprueba que completar una actividad HOY mueva el contador. Las cuatro
-- medallas de racha no se podían montar sobre algo que nadie había visto
-- incrementar de verdad, así que esto lo cierra.
--
-- QUIÉN ES QUIÉN, QUE ES LO QUE SE ROMPIÓ LA PRIMERA VEZ.
-- Solo se cambia a `authenticated` para llamar a registrar_fp, que es lo único
-- que necesita una sesión: usa auth.uid(). Todo lo demás —crear el usuario,
-- mover las fechas, anotar resultados— se hace como dueño.
--
-- Así las tablas temporales nunca se tocan desde otro rol y no hace falta ni un
-- grant. La versión anterior insertaba en `res` siendo `authenticated`, que no
-- es su dueño, y fallaba con "permission denied for table res".
--
-- SOBRE profiles Y RLS FORZADO. profiles tiene force row level security y sus
-- políticas son TO authenticated, así que en teoría el dueño quedaría fuera. No
-- pasa: el rol del editor SQL de Supabase es postgres, que tiene BYPASSRLS, y
-- ese atributo gana sobre el force. La prueba de que funciona es que ligas_test
-- ya insertaba en profiles como dueño y pasó sus nueve chequeos.
--
-- No toca a nadie real: usuario propio, materia inventada, y ROLLBACK al final.
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

-- La sesión simulada. `true` la deja fijada para toda la transacción, así que
-- sobrevive a los cambios de rol de más abajo y basta con ponerla una vez.
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 1. Primera actividad: la racha arranca en 1 ────────────────────────────
set local role authenticated;
select public.registrar_fp('zzz-act-1', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);
reset role;

insert into res select 1, 'primera actividad deja la racha en 1', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

-- ── 2. Otra actividad el MISMO día: la racha no se mueve ───────────────────
set local role authenticated;
select public.registrar_fp('zzz-act-2', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);
reset role;

insert into res select 2, 'segunda actividad del mismo día no sube la racha', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

-- ── 3. Al día siguiente: la racha sube a 2 ─────────────────────────────────
-- Se retrasa el último día un día para simular que pasó una noche.
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids);

set local role authenticated;
select public.registrar_fp('zzz-act-3', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);
reset role;

insert into res select 3, 'día seguido sube la racha a 2', '2',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 2 from public.profiles where user_id = (select uid from ids));

-- ── 4. Tercer día seguido: llega a 3, que es el primer hito ────────────────
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids);

set local role authenticated;
select public.registrar_fp('zzz-act-4', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);
reset role;

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
update public.profiles set last_activity_day = last_activity_day - 3
 where user_id = (select uid from ids);

set local role authenticated;
select public.registrar_fp('zzz-act-5', 'zzz-prueba-racha', 10, 'facil', 'exploratoria', 60000, null, 0);
reset role;

insert into res select 7, 'tras un día en blanco la racha vuelve a 1', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

insert into res select 8, 'el récord sobrevive al corte', '3',
  (select best_streak::text from public.profiles where user_id = (select uid from ids)),
  (select best_streak = 3 from public.profiles where user_id = (select uid from ids));

-- ── Resumen. Es la única consulta que devuelve filas: el editor de Supabase
--    solo enseña la última, así que todo se acumula y se lee de una vez. ────
select
  n::text                                    as n,
  paso,
  esperado,
  obtenido,
  case when ok then 'OK' else 'FALLA' end    as estado
from res
union all
select
  'TOTAL',
  (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res),
  '',
  '',
  (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
