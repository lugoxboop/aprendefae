-- ---------------------------------------------------------------------------
-- Prueba de la migración 0170 — los amigos en la portada.
--
-- Lo que importa:
--   · la siembra de demostración cae SOLO en la cuenta de Mateo, y correrla
--     dos veces deja 11, no 22;
--   · los amigos de demostración solo los ve su dueño (ni en las sugerencias
--     de otro, ni por RLS);
--   · sin amigos hay sugerencias, sin cuentas de prueba ni el propio;
--   · con el primer amigo aceptado las sugerencias se van.
--
-- No toca a nadie real: cuentas zzz-* y ROLLBACK al final. La cuenta «mateo»
-- de aquí es una copia de mentira con el mismo correo, dentro de la
-- transacción; en una base vacía de CI no existe la de verdad.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table quien(rol text, uid uuid, email text) on commit drop;

insert into quien values
  ('mateo', gen_random_uuid(), 'lugox173@gmail.com'),
  ('ana',   gen_random_uuid(), 'zzz-ami-ana@prueba.local'),
  ('beto',  gen_random_uuid(), 'zzz-ami-beto@prueba.local'),
  ('cami',  gen_random_uuid(), 'zzz-ami-cami@prueba.local'),
  ('test',  gen_random_uuid(), 'zzz-ami-test@prueba.local');

/* Si la base ya tenía la cuenta (no en CI), no se duplica. */
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data, aud, role)
select uid, email, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'
  from quien q
 where not exists (select 1 from auth.users u where lower(u.email) = q.email);
update quien q set uid = u.id from auth.users u where lower(u.email) = q.email;

insert into public.profiles (user_id, nickname)
select uid, 'zzzami' || rol from quien q
 where not exists (select 1 from public.profiles p where p.user_id = q.uid);
update public.profiles set es_prueba = true where user_id = (select uid from quien where rol = 'test');

create or replace function pg_temp.como(p_rol text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    (select json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text from quien where rol = p_rol), true);
end;
$$;

-- ── 1. La siembra, dos veces, deja 11 y solo en Mateo ──────────────────────
\i supabase/migrations/0170_amigos_en_el_inicio.sql
\i supabase/migrations/0170_amigos_en_el_inicio.sql
insert into res select 1, 'la siembra deja 11 amigos de demostración en Mateo y 0 en los demás', '11/0',
  (select count(*) from public.amigos_demo where dueno = (select uid from quien where rol = 'mateo'))::text || '/' ||
  (select count(*) from public.amigos_demo where dueno in (select uid from quien where rol <> 'mateo'))::text,
  (select count(*) from public.amigos_demo where dueno = (select uid from quien where rol = 'mateo')) = 11
  and not exists (select 1 from public.amigos_demo where dueno in (select uid from quien where rol <> 'mateo'));

-- ── 2. Mateo ve sus 11 en la portada, sin sugerencias ──────────────────────
select pg_temp.como('mateo');
set local role authenticated;
do $$ declare j jsonb := public.amigos_inicio(); begin
  perform set_config('ami.p2', (j->>'total') || '/' || jsonb_array_length(j->'sugerencias')::text || '/' ||
                               ((j->'amigos'->0->>'demo')), true);
end $$;
reset role;
insert into res select 2, 'Mateo: 11 amigos, 0 sugerencias, marcados demo', '11/0/true',
  current_setting('ami.p2'), current_setting('ami.p2') = '11/0/true';

-- ── 3. Ana no ve los de Mateo, ni por la función ni leyendo la tabla ───────
select pg_temp.como('ana');
set local role authenticated;
do $$ declare j jsonb := public.amigos_inicio(); begin
  perform set_config('ami.p3', (j->>'total') || '/' ||
    (select count(*) from public.amigos_demo)::text || '/' ||
    (select count(*) from jsonb_array_elements(j->'sugerencias') s where s->>'apodo' in ('valen.conta','Sebas_FAE'))::text, true);
end $$;
reset role;
insert into res select 3, 'Ana: 0 amigos, la tabla demo le sale vacía, ningún demo en sus sugerencias', '0/0/0',
  current_setting('ami.p3'), current_setting('ami.p3') = '0/0/0';

-- ── 4. Sugerencias de Ana: Beto y Cami sí; ella misma y la de prueba no ────
select pg_temp.como('ana');
set local role authenticated;
do $$ declare j jsonb := public.amigos_inicio(); a text[]; begin
  select array_agg(s->>'apodo') into a from jsonb_array_elements(j->'sugerencias') s;
  perform set_config('ami.p4',
    ('zzzamibeto' = any(a))::text || '/' || ('zzzamicami' = any(a))::text || '/' ||
    coalesce(('zzzamiana' = any(a)), false)::text || '/' || coalesce(('zzzamitest' = any(a)), false)::text, true);
end $$;
reset role;
insert into res select 4, 'sugiere a Beto y Cami; no a sí misma ni a la cuenta de prueba', 'true/true/false/false',
  current_setting('ami.p4'), current_setting('ami.p4') = 'true/true/false/false';

-- ── 5. Ana pide a Beto: la sugerencia queda «enviada» ──────────────────────
select pg_temp.como('ana');
set local role authenticated;
select public.amistad_solicitar('zzzamibeto');
do $$ declare j jsonb := public.amigos_inicio(); begin
  perform set_config('ami.p5', (select s->>'enviada' from jsonb_array_elements(j->'sugerencias') s where s->>'apodo' = 'zzzamibeto'), true);
end $$;
reset role;
insert into res select 5, 'tras pedirla, la sugerencia de Beto dice enviada', 'true',
  current_setting('ami.p5'), current_setting('ami.p5') = 'true';

-- ── 6. Beto ve que Ana le pidió ────────────────────────────────────────────
select pg_temp.como('beto');
set local role authenticated;
do $$ declare j jsonb := public.amigos_inicio(); begin
  perform set_config('ami.p6', (select s->>'te_pidio' from jsonb_array_elements(j->'sugerencias') s where s->>'apodo' = 'zzzamiana'), true);
end $$;
-- y la acepta desde la sugerencia (amistad_solicitar cruza la solicitud)
select public.amistad_solicitar('zzzamiana');
reset role;
insert into res select 6, 'Beto ve «te pidió» en la sugerencia de Ana', 'true',
  current_setting('ami.p6'), current_setting('ami.p6') = 'true';

-- ── 7. Con el primer amigo, las sugerencias se van ─────────────────────────
select pg_temp.como('ana');
set local role authenticated;
do $$ declare j jsonb := public.amigos_inicio(); begin
  perform set_config('ami.p7', (j->>'total') || '/' || jsonb_array_length(j->'sugerencias')::text || '/' ||
                               (j->'amigos'->0->>'apodo') || '/' || (j->'amigos'->0->>'demo'), true);
end $$;
reset role;
insert into res select 7, 'Ana: 1 amigo (Beto, real), 0 sugerencias', '1/0/zzzamibeto/false',
  current_setting('ami.p7'), current_setting('ami.p7') = '1/0/zzzamibeto/false';

-- ── 8. Sin sesión no hay nada ──────────────────────────────────────────────
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  perform set_config('ami.p8', 'ejecuto', true);
  set local role anon;
  perform public.amigos_inicio();
exception when others then perform set_config('ami.p8', 'rechazado', true);
end $$;
reset role;
insert into res select 8, 'anon no puede llamar amigos_inicio', 'rechazado',
  current_setting('ami.p8'), current_setting('ami.p8') = 'rechazado';

-- ── Resumen ────────────────────────────────────────────────────────────────
select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
