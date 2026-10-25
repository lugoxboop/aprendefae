-- ---------------------------------------------------------------------------
-- Prueba de la migración 0153 — una pieza de Aprender queda como hecha.
--
-- Lo que importa: que el estudiante registre SOLO lo suyo (paso 3), que
-- repetir no duplique (4), que lo de otro no se lea (5), que la forma del id y
-- la materia se validen (6 y 7), que anon no llame a nada (8 y 9) y que
-- actividades_hechas() siga contando solo lo que dio FP (10).
--
-- No toca a nadie real: usuarios zzz-* y ROLLBACK al final.
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(etiqueta text, uid uuid) on commit drop;
grant all on res to authenticated;
grant all on ids to authenticated;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-aprender-a@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-aprender-b@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');
insert into ids select 'a', id from auth.users where email = 'zzz-aprender-a@prueba.local';
insert into ids select 'b', id from auth.users where email = 'zzz-aprender-b@prueba.local';

-- ── 1-2. Existen la tabla y las dos funciones ──────────────────────────────
insert into res select 1, 'la tabla aprender_hecho existe con RLS forzada', 'true',
  (select (relrowsecurity and relforcerowsecurity)::text from pg_class where oid = 'public.aprender_hecho'::regclass),
  (select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.aprender_hecho'::regclass);
insert into res select 2, 'authenticated ejecuta las dos funciones', 'true',
  (has_function_privilege('authenticated', 'public.registrar_aprender(text, text)', 'execute')
   and has_function_privilege('authenticated', 'public.aprender_hechas()', 'execute'))::text,
  has_function_privilege('authenticated', 'public.registrar_aprender(text, text)', 'execute')
   and has_function_privilege('authenticated', 'public.aprender_hechas()', 'execute');

-- ── 3-4. A registra dos veces la misma pieza: queda una fila, la suya ──────
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'a'), 'role', 'authenticated')::text, true);
set local role authenticated;
select public.registrar_aprender('contabilidad', 't3-a1-vender-no-es-cobrar');
select public.registrar_aprender('contabilidad', 't3-a1-vender-no-es-cobrar');
select set_config('prueba.vistas_a', (select string_agg(activity_id, ',') from public.aprender_hechas()), true);
reset role;

insert into res select 3, 'A ve su pieza', 't3-a1-vender-no-es-cobrar',
  current_setting('prueba.vistas_a', true), current_setting('prueba.vistas_a', true) = 't3-a1-vender-no-es-cobrar';
insert into res select 4, 'repetir no duplica', '1',
  (select count(*)::text from public.aprender_hecho where user_id = (select uid from ids where etiqueta = 'a')),
  (select count(*) = 1 from public.aprender_hecho where user_id = (select uid from ids where etiqueta = 'a'));

-- ── 5. B no ve lo de A ─────────────────────────────────────────────────────
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'b'), 'role', 'authenticated')::text, true);
set local role authenticated;
select set_config('prueba.vistas_b', coalesce((select string_agg(activity_id, ',') from public.aprender_hechas()), 'nada'), true);
reset role;
insert into res select 5, 'B no ve lo de A', 'nada', current_setting('prueba.vistas_b', true), current_setting('prueba.vistas_b', true) = 'nada';

-- ── 6-7. Materia e id se validan ───────────────────────────────────────────
set local role authenticated;
do $$ begin
  begin perform public.registrar_aprender('zzz-materia', 'pieza-valida'); perform set_config('prueba.materia', 'aceptada', true);
  exception when others then perform set_config('prueba.materia', 'rechazada', true); end;
  begin perform public.registrar_aprender('contabilidad', 'Con Espacios; drop'); perform set_config('prueba.id', 'aceptado', true);
  exception when others then perform set_config('prueba.id', 'rechazado', true); end;
end $$;
reset role;
insert into res select 6, 'materia desconocida se rechaza', 'rechazada', current_setting('prueba.materia', true), current_setting('prueba.materia', true) = 'rechazada';
insert into res select 7, 'id con forma inválida se rechaza', 'rechazado', current_setting('prueba.id', true), current_setting('prueba.id', true) = 'rechazado';

-- ── 8-9. anon no llama a nada ──────────────────────────────────────────────
insert into res select 8, 'anon no ejecuta registrar_aprender', 'false',
  has_function_privilege('anon', 'public.registrar_aprender(text, text)', 'execute')::text,
  not has_function_privilege('anon', 'public.registrar_aprender(text, text)', 'execute');
insert into res select 9, 'anon no ejecuta aprender_hechas', 'false',
  has_function_privilege('anon', 'public.aprender_hechas()', 'execute')::text,
  not has_function_privilege('anon', 'public.aprender_hechas()', 'execute');

-- ── 10. actividades_hechas() no cuenta Aprender ────────────────────────────
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'a'), 'role', 'authenticated')::text, true);
set local role authenticated;
select set_config('prueba.hechas_a', coalesce((select string_agg(activity_id, ',') from public.actividades_hechas()), 'nada'), true);
reset role;
insert into res select 10, 'actividades_hechas() sigue contando solo lo que dio FP', 'nada',
  current_setting('prueba.hechas_a', true), current_setting('prueba.hechas_a', true) = 'nada';

-- ── Resumen ────────────────────────────────────────────────────────────────
select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado
from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
  (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
