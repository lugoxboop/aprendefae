-- ---------------------------------------------------------------------------
-- Prueba de racha_momento() (0034): las tres reglas del momento de racha.
--
--   con sesión · solo si avanzó hoy · una vez al día
--
-- y los dos fallos por los que la animación anterior no salía: preguntar antes
-- de jugar (paso 2 vs 3) y el valor celebrado que no se reiniciaba al perder
-- la racha (paso 7).
--
-- Los días se simulan moviendo hacia atrás, como dueño, las fechas de ESTE
-- usuario de prueba. No toca a nadie real y termina en ROLLBACK.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values (gen_random_uuid(), 'zzz-momento@prueba.local', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');
insert into ids(uid) select id from auth.users where email = 'zzz-momento@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzmomento' from ids;
insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('zzz-m1', 'zzz', 'zzz', 'exploratoria', 'facil', 10),
  ('zzz-m2', 'zzz', 'zzz', 'exploratoria', 'facil', 10),
  ('zzz-m3', 'zzz', 'zzz', 'exploratoria', 'facil', 10);

-- ── 1. Sin sesión: nunca ───────────────────────────────────────────────────
set local role authenticated;
create temp table r1 on commit drop as select * from public.racha_momento();
reset role;
insert into res select 1, 'sin sesión no sale', 'false', (select mostrar::text from r1), (select not mostrar from r1);

select set_config('request.jwt.claims', json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text, true);

-- Ayer jugó y llevaba 4.
update public.profiles set streak = 4, last_activity_day = (now() at time zone 'America/Bogota')::date - 1,
       racha_animacion_dia = (now() at time zone 'America/Bogota')::date - 1, racha_animacion_valor = 4
 where user_id = (select uid from ids);

-- ── 2. Al entrar, antes de jugar: no ───────────────────────────────────────
set local role authenticated;
create temp table r2 on commit drop as select * from public.racha_momento();
-- Juega la primera actividad del día.
select public.registrar_fp('zzz-m1', 60000, null);
-- ── 3. Tras jugar: sí, de 4 a 5 ────────────────────────────────────────────
create temp table r3 on commit drop as select * from public.racha_momento();
-- ── 4. Otra actividad y otra pregunta el mismo día: no ─────────────────────
select public.registrar_fp('zzz-m2', 60000, null);
create temp table r4 on commit drop as select * from public.racha_momento();
reset role;

insert into res select 2, 'al entrar, antes de jugar, no sale', 'false', (select mostrar::text from r2), (select not mostrar from r2);
insert into res select 3, 'tras la primera actividad del día sale, de 4 a 5', 'true 4→5',
  (select mostrar || ' ' || desde || '→' || hasta from r3), (select mostrar and desde = 4 and hasta = 5 from r3);
insert into res select 4, 'una segunda vez el mismo día no sale', 'false', (select mostrar::text from r4), (select not mostrar from r4);
insert into res select 5, 'la semana trae hoy como día con actividad', 'hoy ∈ semana',
  (select array_to_string(semana, ',') from r4), (select hoy = any(semana) from r4);

-- ── 6. Al día siguiente, tras jugar: vuelve a salir, de 5 a 6 ──────────────
update public.fp_history set created_at = created_at - interval '1 day' where user_id = (select uid from ids);
update public.profiles set last_activity_day = last_activity_day - 1, racha_animacion_dia = racha_animacion_dia - 1
 where user_id = (select uid from ids);
set local role authenticated;
select public.registrar_fp('zzz-m3', 60000, null);
create temp table r6 on commit drop as select * from public.racha_momento();
reset role;
insert into res select 6, 'al día siguiente vuelve a salir, de 5 a 6', 'true 5→6',
  (select mostrar || ' ' || desde || '→' || hasta from r6), (select mostrar and desde = 5 and hasta = 6 from r6);

-- ── 7. EL FALLO VIEJO: perder una racha de 7 y llevar la nueva a 2 ─────────
update public.profiles set streak = 2, racha_animacion_valor = 7, racha_animacion_dia = null,
       last_activity_day = (now() at time zone 'America/Bogota')::date
 where user_id = (select uid from ids);
set local role authenticated;
create temp table r7 on commit drop as select * from public.racha_momento();
reset role;
insert into res select 7, 'tras perder una racha de 7, el día 2 de la nueva SÍ sale', 'true 1→2',
  (select mostrar || ' ' || desde || '→' || hasta from r7), (select mostrar and desde = 1 and hasta = 2 from r7);

-- ── 8. El día 1 se celebra: de 0 a 1 ───────────────────────────────────────
update public.profiles set streak = 1, racha_animacion_dia = null where user_id = (select uid from ids);
set local role authenticated;
create temp table r8 on commit drop as select * from public.racha_momento();
reset role;
insert into res select 8, 'el día 1 sale, de 0 a 1', 'true 0→1',
  (select mostrar || ' ' || desde || '→' || hasta from r8), (select mostrar and desde = 0 and hasta = 1 from r8);

-- ── 9. Sin actividad hoy: no, aunque haya racha ────────────────────────────
update public.profiles set streak = 9, racha_animacion_dia = null,
       last_activity_day = (now() at time zone 'America/Bogota')::date - 1
 where user_id = (select uid from ids);
set local role authenticated;
create temp table r9 on commit drop as select * from public.racha_momento();
reset role;
insert into res select 9, 'sin actividad hoy no sale aunque la racha siga viva', 'false', (select mostrar::text from r9), (select not mostrar from r9);

-- ── 10. anon no la ejecuta ─────────────────────────────────────────────────
insert into res select 10, 'anon no puede ejecutar racha_momento', 'false',
  has_function_privilege('anon', 'public.racha_momento()', 'execute')::text,
  not has_function_privilege('anon', 'public.racha_momento()', 'execute');

select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
