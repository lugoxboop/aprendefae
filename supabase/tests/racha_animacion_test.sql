-- ---------------------------------------------------------------------------
-- Prueba del control diario de la animación de racha.
--
-- Lo que hay que demostrar es que NO se repite: dos entradas el mismo día
-- tienen que dar una sola animación. Y de paso, que no salta cuando no toca —
-- sin actividad hoy, en el día 1, o tras perder la racha.
--
-- Misma forma que racha_test: solo se cambia a `authenticated` para llamar a la
-- función, que es lo único que necesita auth.uid(). Crear el usuario, mover las
-- fechas y anotar resultados se hacen como dueño, así ninguna tabla temporal se
-- toca desde otro rol y no hace falta ni un grant.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-anim@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-anim@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzanimprueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 1. Sin actividad hoy: no se anima ──────────────────────────────────────
update public.profiles
   set streak = 5, last_activity_day = (now() at time zone 'America/Bogota')::date - 1,
       racha_animacion_valor = 4
 where user_id = (select uid from ids);

set local role authenticated;
create temp table t1 as select * from public.racha_animacion();
reset role;

insert into res select 1, 'sin actividad hoy no se anima', 'false',
  (select mostrar::text from t1), (select mostrar = false from t1);

-- ── 2. Actividad hoy y la racha avanzó: se anima, y dice de 4 a 5 ──────────
update public.profiles
   set last_activity_day = (now() at time zone 'America/Bogota')::date
 where user_id = (select uid from ids);

set local role authenticated;
create temp table t2 as select * from public.racha_animacion();
reset role;

insert into res select 2, 'primera entrada del día: se anima', 'true',
  (select mostrar::text from t2), (select mostrar from t2);

insert into res select 3, 'la transición va de 4 a 5', '4 → 5',
  (select desde || ' → ' || hasta from t2),
  (select desde = 4 and hasta = 5 from t2);

-- ── 3. SEGUNDA ENTRADA EL MISMO DÍA: no se repite ──────────────────────────
-- Es el chequeo central. Nada cambia entre medias: solo se vuelve a llamar.
set local role authenticated;
create temp table t3 as select * from public.racha_animacion();
reset role;

insert into res select 4, 'segunda entrada el mismo día NO se repite', 'false',
  (select mostrar::text from t3), (select mostrar = false from t3);

-- ── 4. Y una tercera, por si acaso ─────────────────────────────────────────
set local role authenticated;
create temp table t4 as select * from public.racha_animacion();
reset role;

insert into res select 5, 'tercera entrada el mismo día tampoco', 'false',
  (select mostrar::text from t4), (select mostrar = false from t4);

-- ── 5. Al día siguiente, con la racha en 6: vuelve a animar ────────────────
update public.profiles
   set streak = 6,
       racha_animacion_dia = (now() at time zone 'America/Bogota')::date - 1
 where user_id = (select uid from ids);

set local role authenticated;
create temp table t5 as select * from public.racha_animacion();
reset role;

insert into res select 6, 'al día siguiente vuelve a animar', 'true',
  (select mostrar::text from t5), (select mostrar from t5);

-- ── 6. Racha de 1: no hay transición que celebrar ──────────────────────────
update public.profiles
   set streak = 1, racha_animacion_valor = 0, racha_animacion_dia = null
 where user_id = (select uid from ids);

set local role authenticated;
create temp table t6 as select * from public.racha_animacion();
reset role;

insert into res select 7, 'el día 1 no se anima', 'false',
  (select mostrar::text from t6), (select mostrar = false from t6);

-- ── 7. Racha perdida (de 7 a 1): tampoco se celebra ────────────────────────
update public.profiles
   set streak = 1, racha_animacion_valor = 7, racha_animacion_dia = null
 where user_id = (select uid from ids);

set local role authenticated;
create temp table t7 as select * from public.racha_animacion();
reset role;

insert into res select 8, 'reiniciar tras perder la racha no se celebra', 'false',
  (select mostrar::text from t7), (select mostrar = false from t7);

-- ── Resumen. Única consulta que devuelve filas. ────────────────────────────
select
  n::text as n, paso, esperado, obtenido,
  case when ok then 'OK' else 'FALLA' end as estado
from res
union all
select
  'TOTAL',
  (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res),
  '', '',
  (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
