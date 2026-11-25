-- ---------------------------------------------------------------------------
-- Prueba de la migración 0176 (auditoría externa del 25-nov).
--
-- 1. El cupo de Bruno no se puede inflar llamando la función directo.
-- 2. Una opinión firmada entra, con su apodo.
-- 3. El buzón anónimo tiene tope por origen: uno que abusa no calla a otro.
-- 4. Las funciones internas ya no se pueden llamar con sesión de estudiante,
--    y las que las usan por dentro siguen funcionando.
-- 5. La búsqueda de amigos no acepta comodines, y sigue encontrando.
-- 6. registrar_fp toma el cerrojo y una repetición sigue pagando cero.
--
-- Usuarios propios zzz-*, ROLLBACK al final: no toca a nadie real.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table quien(rol text primary key, uid uuid, email text) on commit drop;

insert into quien values
  ('a', gen_random_uuid(), 'zzz-s176-a@prueba.local'),
  ('b', gen_random_uuid(), 'zzz-s176-b@prueba.local');

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data, aud, role)
select uid, email, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated' from quien;
insert into public.profiles (user_id, nickname) select uid, 'zzzs176' || rol from quien;

create or replace function pg_temp.como(p_rol text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    (select json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text from quien where rol = p_rol), true);
end;
$$;

create or replace function pg_temp.anonimo(p_ip text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('request.headers', json_build_object('x-forwarded-for', p_ip || ', 10.0.0.1')::text, true);
end;
$$;

-- ── 1. El límite que llega se recorta al techo ────────────────────────────
select pg_temp.como('a');
set local role authenticated;
do $$ declare r record; begin
  select * into r from public.asistente_consumir(1000000);
  perform set_config('s176.p1a', r.limite::text, true);
  select * into r from public.asistente_consumir(3);
  perform set_config('s176.p1b', r.limite::text, true);
end $$;
reset role;
insert into res select 1, 'pedir un límite de un millón da el techo (100); pedir 3 sigue dando 3', '100/3',
  current_setting('s176.p1a') || '/' || current_setting('s176.p1b'),
  current_setting('s176.p1a') = '100' and current_setting('s176.p1b') = '3';

-- ── 2. Opinión firmada ────────────────────────────────────────────────────
select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform set_config('s176.p2', public.enviar_opinion(5::smallint, 'firmada', false)::text, true);
exception when others then
  perform set_config('s176.p2', 'error: ' || sqlerrm, true);
end $$;
reset role;
insert into res select 2, 'una opinión con firma entra y lleva el apodo', 'true/zzzs176a',
  current_setting('s176.p2') || '/' || coalesce((select apodo from public.opiniones where texto = 'firmada' limit 1), '(nada)'),
  current_setting('s176.p2') = 'true'
  and exists (select 1 from public.opiniones where texto = 'firmada' and apodo = 'zzzs176a');

-- ── 3. Tope por origen ────────────────────────────────────────────────────
select pg_temp.anonimo('203.0.113.9');
set local role anon;
do $$ declare v text := ''; begin
  for i in 1..6 loop
    v := v || public.enviar_opinion(4::smallint, 'anon-abusa-' || i)::text || ' ';
  end loop;
  perform set_config('s176.p3a', btrim(v), true);
end $$;
reset role;
select pg_temp.anonimo('198.51.100.7');
set local role anon;
do $$ begin
  perform set_config('s176.p3b', public.enviar_opinion(4::smallint, 'anon-otro')::text, true);
end $$;
reset role;
insert into res select 3, 'el mismo origen: 5 entran y la 6.ª no; otro origen sigue entrando',
  'true true true true true false / true',
  current_setting('s176.p3a') || ' / ' || current_setting('s176.p3b'),
  current_setting('s176.p3a') = 'true true true true true false' and current_setting('s176.p3b') = 'true';

insert into res select 4, 'la huella no guarda la dirección', '0',
  (select count(*)::text from public.opiniones_anon_origen where huella like '%203.0.113.9%'),
  not exists (select 1 from public.opiniones_anon_origen where huella like '%203.0.113.9%');

-- ── 4. Funciones internas ─────────────────────────────────────────────────
insert into res select 5, 'un estudiante ya no puede llamar liga_resultados, reto_avance ni son_amigos',
  'false/false/false',
  has_function_privilege('authenticated', 'public.liga_resultados(text, date)', 'execute')::text || '/' ||
  has_function_privilege('authenticated', 'public.reto_avance(uuid, timestamptz, timestamptz)', 'execute')::text || '/' ||
  has_function_privilege('authenticated', 'public.son_amigos(uuid, uuid)', 'execute')::text,
  not has_function_privilege('authenticated', 'public.liga_resultados(text, date)', 'execute')
  and not has_function_privilege('authenticated', 'public.reto_avance(uuid, timestamptz, timestamptz)', 'execute')
  and not has_function_privilege('authenticated', 'public.son_amigos(uuid, uuid)', 'execute');

select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform public.medallas();
  perform public.logros();
  perform public.retos_estado();
  perform set_config('s176.p6', 'funcionan', true);
exception when others then
  perform set_config('s176.p6', 'error: ' || sqlerrm, true);
end $$;
reset role;
insert into res select 6, 'medallas, logros y retos (que las usan por dentro) siguen funcionando', 'funcionan',
  current_setting('s176.p6'), current_setting('s176.p6') = 'funcionan';

-- ── 5. Buscar amigos ──────────────────────────────────────────────────────
select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform set_config('s176.p7a', jsonb_array_length(public.amigos_buscar('__'))::text, true);
  perform set_config('s176.p7b', jsonb_array_length(public.amigos_buscar('%%'))::text, true);
  perform set_config('s176.p7c', coalesce((select string_agg(e ->> 'apodo', ',')
     from jsonb_array_elements(public.amigos_buscar('zzzs176')) e), ''), true);
end $$;
reset role;
insert into res select 7, '«__» y «%%» no encuentran a nadie; «zzzs176» encuentra a B', '0/0/zzzs176b',
  current_setting('s176.p7a') || '/' || current_setting('s176.p7b') || '/' || current_setting('s176.p7c'),
  current_setting('s176.p7a') = '0' and current_setting('s176.p7b') = '0'
  and current_setting('s176.p7c') = 'zzzs176b';

-- ── 6. registrar_fp con cerrojo ───────────────────────────────────────────
insert into res select 8, 'registrar_fp toma el cerrojo por estudiante y actividad', 'sí',
  case when position('pg_advisory_xact_lock' in pg_get_functiondef('public.registrar_fp(text, integer, numeric, jsonb)'::regprocedure)) > 0 then 'sí' else 'no' end,
  position('pg_advisory_xact_lock' in pg_get_functiondef('public.registrar_fp(text, integer, numeric, jsonb)'::regprocedure)) > 0;

select pg_temp.como('b');
set local role authenticated;
do $$ declare v_act text; f1 integer; f2 integer; begin
  select activity_id into v_act from public.actividad_catalogo
   where not coalesce(renovable_diario, false) and fp_base > 0 order by activity_id limit 1;
  select fp_awarded into f1 from public.registrar_fp(v_act, 600000, 100);
  select fp_awarded into f2 from public.registrar_fp(v_act, 600000, 100);
  perform set_config('s176.p9', (f1 > 0)::text || '/' || f2::text, true);
end $$;
reset role;
insert into res select 9, 'la primera vez paga, la repetición paga cero', 'true/0',
  current_setting('s176.p9'), current_setting('s176.p9') = 'true/0';

-- ── Resumen ────────────────────────────────────────────────────────────────
select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
