-- ---------------------------------------------------------------------------
-- Prueba de punta a punta de la racha, contra la función REALMENTE desplegada.
--
-- POR QUÉ EXISTE. La migración 0007 se aplicó y el relleno histórico se revisó,
-- pero eso comprueba el pasado: que los datos viejos quedaran coherentes. No
-- comprueba que completar una actividad HOY mueva el contador. Las cuatro
-- medallas de racha no se podían montar sobre algo que nadie había visto
-- incrementar de verdad, así que esto lo cierra.
--
-- ═══════════ QUÉ SE ADAPTÓ, Y POR QUÉ ESTABA ROTO ═══════════
--
-- Este archivo llamaba a registrar_fp con la firma de OCHO argumentos, en la
-- que el cliente mandaba sus propios puntos, su dificultad y su modalidad. La
-- 0011 la sustituyó y la 0012 la eliminó con un `drop function`, así que desde
-- entonces el archivo fallaba entero con "function does not exist" antes de
-- comprobar nada.
--
-- Dos cambios, y el segundo no es evidente:
--
--   1. Las cinco llamadas pasan a la firma actual, de tres argumentos:
--      registrar_fp(p_activity_id, p_duration_ms, p_correct_pct).
--
--   2. HAY QUE SEMBRAR EL CATÁLOGO. Las actividades inventadas ya no pueden
--      declarar su dificultad por parámetro: la función las busca en
--      actividad_catalogo y lanza "Actividad desconocida" si no están. Se
--      siembran como dueño al principio de la transacción, y el ROLLBACK final
--      se las lleva igual que a todo lo demás.
--
-- LA REGLA DE REPETICIÓN NO AFECTA A ESTA PRUEBA, y se comprobó en vez de
-- suponerlo: la 0011 dejó que repetir una actividad pague 0. Aquí cada paso usa
-- una actividad distinta —zzz-act-1 … zzz-act-5— así que ninguna se repite y
-- las cinco pagan completo. El paso 9 lo verifica con el total, para que si
-- algún día alguien reutiliza un id la prueba lo cace en vez de callárselo.
--
-- ═══════════ QUIÉN ES QUIÉN, QUE ES LO QUE SE ROMPIÓ LA PRIMERA VEZ ═══════════
--
-- Solo se cambia a `authenticated` para llamar a registrar_fp, que es lo único
-- que necesita una sesión: usa auth.uid(). Todo lo demás —crear el usuario,
-- sembrar el catálogo, mover las fechas, anotar resultados— se hace como dueño.
--
-- Así las tablas temporales nunca se tocan desde otro rol y no hace falta ni un
-- grant. La versión anterior insertaba en `res` siendo `authenticated`, que no
-- es su dueño, y fallaba con "permission denied for table res".
--
-- SOBRE profiles, actividad_catalogo Y RLS FORZADO. Las dos tienen force row
-- level security y sus políticas no alcanzan al dueño. No importa: el rol del
-- editor SQL de Supabase es postgres, que tiene BYPASSRLS, y ese atributo gana
-- sobre el force. La prueba de que funciona es que ligas_test ya insertaba en
-- profiles como dueño y pasó sus nueve chequeos.
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

-- Las cinco actividades inventadas, en el catálogo. Fácil y exploratoria, que
-- con la base de 10 y sin porcentaje de aciertos paga 10 exactos.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('zzz-act-1', 'zzz-prueba-racha', 'zzz-tema', 'exploratoria', 'facil', 10),
  ('zzz-act-2', 'zzz-prueba-racha', 'zzz-tema', 'exploratoria', 'facil', 10),
  ('zzz-act-3', 'zzz-prueba-racha', 'zzz-tema', 'exploratoria', 'facil', 10),
  ('zzz-act-4', 'zzz-prueba-racha', 'zzz-tema', 'exploratoria', 'facil', 10),
  ('zzz-act-5', 'zzz-prueba-racha', 'zzz-tema', 'exploratoria', 'facil', 10);

-- La sesión simulada. `true` la deja fijada para toda la transacción, así que
-- sobrevive a los cambios de rol de más abajo y basta con ponerla una vez.
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 0. La firma vieja de ocho argumentos ya no existe ──────────────────────
-- Si volviera a estar, este archivo podría "pasar" llamando a la equivocada.
insert into res
select 0, 'la firma vieja de 8 argumentos ya no existe', '0',
  count(*)::text, count(*) = 0
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'registrar_fp'
  and pg_get_function_identity_arguments(p.oid) like '%integer, text, text%';

-- ── 1. Primera actividad: la racha arranca en 1 ────────────────────────────
-- 60 s está por encima del mínimo de 'facil' (20 s), así que no entra la
-- defensa de tiempo y la actividad paga su base completa.
set local role authenticated;
select public.registrar_fp('zzz-act-1', 60000, null);
reset role;

insert into res select 1, 'primera actividad deja la racha en 1', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

-- ── 2. Otra actividad el MISMO día: la racha no se mueve ───────────────────
set local role authenticated;
select public.registrar_fp('zzz-act-2', 60000, null);
reset role;

insert into res select 2, 'segunda actividad del mismo día no sube la racha', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

-- ── 3. Al día siguiente: la racha sube a 2 ─────────────────────────────────
-- Se retrasa el último día un día para simular que pasó una noche.
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids);

set local role authenticated;
select public.registrar_fp('zzz-act-3', 60000, null);
reset role;

insert into res select 3, 'día seguido sube la racha a 2', '2',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 2 from public.profiles where user_id = (select uid from ids));

-- ── 4. Tercer día seguido: llega a 3, que es el primer hito ────────────────
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids);

set local role authenticated;
select public.registrar_fp('zzz-act-4', 60000, null);
reset role;

insert into res select 4, 'tercer día seguido llega al hito de 3', '3',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 3 from public.profiles where user_id = (select uid from ids));

-- ── 5. El bono del hito quedó registrado como fila propia ──────────────────
-- bono_racha(3) = 10, así que la fila existe y trae esos 10 puntos.
insert into res select 5, 'el hito de 3 dejó su bono de 10 en el historial', '10',
  coalesce((select fp_awarded::text from public.fp_history
             where user_id = (select uid from ids) and activity_id = 'racha-3'), 'no hay fila'),
  (select count(*) = 1 and coalesce(sum(fp_awarded), -1) = 10
     from public.fp_history where user_id = (select uid from ids) and activity_id = 'racha-3');

-- ── 6. best_streak guarda el récord ────────────────────────────────────────
insert into res select 6, 'best_streak guarda el récord', '3',
  (select best_streak::text from public.profiles where user_id = (select uid from ids)),
  (select best_streak = 3 from public.profiles where user_id = (select uid from ids));

-- ── 7. Un día en blanco corta la racha viva, no el récord ──────────────────
update public.profiles set last_activity_day = last_activity_day - 3
 where user_id = (select uid from ids);

set local role authenticated;
select public.registrar_fp('zzz-act-5', 60000, null);
reset role;

insert into res select 7, 'tras un día en blanco la racha vuelve a 1', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids)),
  (select streak = 1 from public.profiles where user_id = (select uid from ids));

insert into res select 8, 'el récord sobrevive al corte', '3',
  (select best_streak::text from public.profiles where user_id = (select uid from ids)),
  (select best_streak = 3 from public.profiles where user_id = (select uid from ids));

-- ── 9. Ninguna actividad se repitió, así que las cinco pagaron completo ────
-- Cinco actividades distintas a 10 más el bono de 10 = 60. Si alguien
-- reutilizara un id, esa actividad pagaría 0 por la regla de repetición de la
-- 0011 y este total bajaría: el chequeo está para que eso no pase en silencio.
insert into res select 9, 'las 5 actividades pagaron completo, más el bono', '60',
  (select coalesce(sum(fp_awarded), 0)::text
     from public.fp_history where user_id = (select uid from ids)),
  (select coalesce(sum(fp_awarded), 0) = 60
     from public.fp_history where user_id = (select uid from ids));

-- ── 10. El total del perfil cuadra con el historial ────────────────────────
insert into res select 10, 'points del perfil = suma del historial',
  (select coalesce(sum(fp_awarded), 0)::text
     from public.fp_history where user_id = (select uid from ids)),
  (select points::text from public.profiles where user_id = (select uid from ids)),
  (select p.points = (select coalesce(sum(fp_awarded), 0)
                        from public.fp_history where user_id = p.user_id)
     from public.profiles p where p.user_id = (select uid from ids));

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
