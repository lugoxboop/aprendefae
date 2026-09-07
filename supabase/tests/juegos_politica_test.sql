-- ---------------------------------------------------------------------------
-- Prueba de la migración 0016, contra el catálogo REALMENTE desplegado.
--
-- POR QUÉ EXISTE. La 0016 devuelve "Success. No rows returned", que es lo
-- esperado en un insert y no dice absolutamente nada sobre si las cinco filas
-- quedaron con la dificultad correcta. Un `medio` donde debía ir `experto`
-- pagaría 25 en vez de 90 durante todo el semestre sin que nada fallara.
--
-- Se comprueban dos cosas distintas y las dos hacen falta:
--
--   · Que la FILA sea la que se quería (modalidad, dificultad, fp_base).
--   · Que la FUNCIÓN pague lo que esa fila promete. Lo primero se lee de una
--     tabla; lo segundo exige llamar a registrar_fp de verdad, que es lo único
--     que demuestra que la actividad funciona de punta a punta.
--
-- QUIÉN ES QUIÉN. Solo se cambia a `authenticated` para llamar a registrar_fp,
-- que es lo único que necesita sesión: usa auth.uid(). Todo lo demás —crear el
-- usuario, escribir en la tabla temporal `res`— se hace como dueño. Escribir en
-- `res` siendo `authenticated` da "permission denied for table res", que es el
-- error que rompió racha_test la primera vez.
--
-- LOS TIEMPOS NO SON ARBITRARIOS. Cada llamada pasa una duración por encima
-- del mínimo de su dificultad —45 s en medio, 90 s en difícil, 150 s en
-- experto— para que no entre la defensa de tiempo y se vea la base limpia. Con
-- una duración corta, las cinco pagarían el 60% y la prueba no distinguiría un
-- fp_base mal puesto de un recorte por rapidez.
--
-- No toca a nadie real: usuario propio con email zzz-*, y ROLLBACK al final.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;
create temp table antes(filas bigint) on commit drop;

-- Foto del historial antes de tocar nada, para el chequeo final.
insert into antes select count(*) from public.fp_history;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-juegos@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-juegos@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzjuegosprueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 1 a 5. Las cinco filas, tal como la 0016 debía dejarlas ────────────────
insert into res select 1, 'quien-gana-quien-pierde: evaluativa / medio / 25', 'evaluativa/medio/25',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'quien-gana-quien-pierde'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'medio' and fp_base = 25 and not retirada
     from public.actividad_catalogo where activity_id = 'quien-gana-quien-pierde');

insert into res select 2, 'corriente-titulares: evaluativa / dificil / 50', 'evaluativa/dificil/50',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'corriente-titulares'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'dificil' and fp_base = 50 and not retirada
     from public.actividad_catalogo where activity_id = 'corriente-titulares');

insert into res select 3, 'explica-la-politica: evaluativa / dificil / 50', 'evaluativa/dificil/50',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'explica-la-politica'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'dificil' and fp_base = 50 and not retirada
     from public.actividad_catalogo where activity_id = 'explica-la-politica');

insert into res select 4, 'tablero-decisiones: evaluativa / experto / 90', 'evaluativa/experto/90',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'tablero-decisiones'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'experto' and fp_base = 90 and not retirada
     from public.actividad_catalogo where activity_id = 'tablero-decisiones');

insert into res select 5, 'simulador-de-crisis: evaluativa / experto / 90', 'evaluativa/experto/90',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'simulador-de-crisis'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'experto' and fp_base = 90 and not retirada
     from public.actividad_catalogo where activity_id = 'simulador-de-crisis');

-- ── 6. Las cinco son de Política Económica ────────────────────────────────
insert into res select 6, 'las cinco quedaron en macroeconomia/politica-economica', '5 de 5',
  (select count(*)::text || ' de 5' from public.actividad_catalogo
    where activity_id in ('quien-gana-quien-pierde','corriente-titulares','explica-la-politica',
                          'tablero-decisiones','simulador-de-crisis')
      and subject_id = 'macroeconomia' and topic_id = 'politica-economica'),
  (select count(*) = 5 from public.actividad_catalogo
    where activity_id in ('quien-gana-quien-pierde','corriente-titulares','explica-la-politica',
                          'tablero-decisiones','simulador-de-crisis')
      and subject_id = 'macroeconomia' and topic_id = 'politica-economica');

-- ── 7 a 11. Cada una paga su base al 100% ─────────────────────────────────
-- Duración por encima del mínimo de su dificultad: sin defensa de tiempo.
set local role authenticated;
select public.registrar_fp('quien-gana-quien-pierde', 120000, 100);
select public.registrar_fp('corriente-titulares', 200000, 100);
select public.registrar_fp('explica-la-politica', 200000, 100);
select public.registrar_fp('tablero-decisiones', 300000, 100);
select public.registrar_fp('simulador-de-crisis', 300000, 100);
reset role;

insert into res select 7, 'quien-gana-quien-pierde al 100% paga 25', '25',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'quien-gana-quien-pierde'),
  (select fp_awarded = 25 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'quien-gana-quien-pierde');

insert into res select 8, 'corriente-titulares al 100% paga 50', '50',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'corriente-titulares'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'corriente-titulares');

insert into res select 9, 'explica-la-politica al 100% paga 50', '50',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'explica-la-politica'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'explica-la-politica');

insert into res select 10, 'tablero-decisiones al 100% paga 90', '90',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'tablero-decisiones'),
  (select fp_awarded = 90 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'tablero-decisiones');

insert into res select 11, 'simulador-de-crisis al 100% paga 90', '90',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'simulador-de-crisis'),
  (select fp_awarded = 90 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'simulador-de-crisis');

-- ── 12. El piso del 50%, sobre una actividad que no es de la 0016 ─────────
-- camara-presion es medio con base 25, así que al 0% de aciertos da
-- 25 × 0,5 = 12,5, que redondea a 13. Se usa una actividad de OTRO tema a
-- propósito: las cinco nuevas ya se jugaron arriba y repetirlas pagaría 0,
-- que taparía el piso en vez de mostrarlo.
set local role authenticated;
select public.registrar_fp('camara-presion', 200000, 0);
reset role;

insert into res select 12, 'una evaluativa al 0% cae al piso del 50% de su base', '13',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'camara-presion'),
  (select fp_awarded = 13 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'camara-presion');

-- ── 13. Repetir una de las nuevas paga 0 ──────────────────────────────────
set local role authenticated;
select public.registrar_fp('tablero-decisiones', 300000, 100);
reset role;

insert into res select 13, 'repetir una de las nuevas paga 0', '0',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'tablero-decisiones' and repeat_index = 1),
  (select fp_awarded = 0 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'tablero-decisiones' and repeat_index = 1);

-- ── 14. Las dos de la 0015 siguen donde estaban ───────────────────────────
-- La 0016 solo debía añadir. Si hubiera tocado las anteriores, aquí se vería.
insert into res select 14, 'las dos actividades de la 0015 siguen intactas', '2 de 2',
  (select count(*)::text || ' de 2' from public.actividad_catalogo
    where (activity_id = 'diagnostico-en-vivo' and dificultad = 'medio'   and fp_base = 25)
       or (activity_id = 'arma-grupo-logico'   and dificultad = 'dificil' and fp_base = 50)),
  (select count(*) = 2 from public.actividad_catalogo
    where (activity_id = 'diagnostico-en-vivo' and dificultad = 'medio'   and fp_base = 25)
       or (activity_id = 'arma-grupo-logico'   and dificultad = 'dificil' and fp_base = 50));

-- ── 15. La lápida del dashboard sigue puesta ──────────────────────────────
insert into res select 15, 'dashboard-economico sigue retirado', 'retirada',
  coalesce((select case when retirada then 'retirada' else 'ACTIVA' end
              from public.actividad_catalogo where activity_id = 'dashboard-economico'), 'NO ESTÁ'),
  (select retirada from public.actividad_catalogo where activity_id = 'dashboard-economico');

-- ── 16. El historial de los demás no se movió ─────────────────────────────
insert into res select 16, 'nadie más ganó ni perdió filas de historial',
  (select filas::text || ' filas ajenas' from antes),
  (select count(*) filter (where user_id <> (select uid from ids))::text || ' filas ajenas'
     from public.fp_history),
  (select count(*) filter (where user_id <> (select uid from ids)) = (select filas from antes)
     from public.fp_history);

-- ── Resumen. Única consulta que devuelve filas. ───────────────────────────
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
