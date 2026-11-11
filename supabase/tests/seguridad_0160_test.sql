-- ---------------------------------------------------------------------------
-- Prueba de la migración 0160 (auditoría de seguridad del 11-nov).
--
-- 1. Un correo de docente sin confirmar no abre el panel.
-- 2. Bruno tiene techo diario para todo el sitio.
-- 3. Las opiniones sin sesión tienen tope por hora y texto corto.
-- 4. Los registros de FP con forma de trampa quedan marcados (sin quitar FP),
--    y el profesor de la materia los ve; un estudiante no.
--
-- Usuarios propios zzz-*, ROLLBACK al final: no toca a nadie real.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table quien(rol text primary key, uid uuid, email text, confirmado boolean) on commit drop;

insert into quien values
  ('docente',  gen_random_uuid(), 'zzz-seg-docente@prueba.local', true),
  ('impostor', gen_random_uuid(), 'zzz-seg-docente2@prueba.local', false),
  ('a',        gen_random_uuid(), 'zzz-seg-a@prueba.local', true),
  ('b',        gen_random_uuid(), 'zzz-seg-b@prueba.local', true),
  ('correo',   gen_random_uuid(), 'zzz-seg-docente3@prueba.local', true);

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data, aud, role)
select uid, email, '', case when confirmado then now() end, now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated' from quien;
insert into public.profiles (user_id, nickname) select uid, 'zzzseg' || rol from quien;
insert into public.docentes (email, nombre, materias, activo) values
  ('zzz-seg-docente@prueba.local',  'Docente confirmado', '{pensamiento-estrategico}', true),
  ('zzz-seg-docente2@prueba.local', 'Docente sin confirmar', '{pensamiento-estrategico}', true),
  ('zzz-seg-docente3@prueba.local', 'Docente de correo y contraseña', '{pensamiento-estrategico}', true);
/* (0161) La cuenta «correo» se registró con correo y contraseña: confirmada, pero no por Google. */
update auth.users set raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
 where email = 'zzz-seg-docente3@prueba.local';

create or replace function pg_temp.como(p_rol text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    (select json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text from quien where rol = p_rol), true);
end;
$$;

-- ── 1. El correo sin confirmar no es docente ──────────────────────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin perform set_config('seg.p1a', public.es_docente()::text, true); end $$;
reset role;
select pg_temp.como('impostor');
set local role authenticated;
do $$ begin perform set_config('seg.p1b', public.es_docente()::text, true); end $$;
reset role;
insert into res select 1, 'docente confirmado sí; el mismo rol con correo sin confirmar, no', 'true/false',
  current_setting('seg.p1a') || '/' || current_setting('seg.p1b'),
  current_setting('seg.p1a') = 'true' and current_setting('seg.p1b') = 'false';

-- ── 1b. (0161) Una cuenta de correo y contraseña no es docente, aunque esté confirmada ──
select pg_temp.como('correo');
set local role authenticated;
do $$ begin perform set_config('seg.p1c', public.es_docente()::text, true); end $$;
reset role;
insert into res select 9, 'cuenta de correo y contraseña con el correo de un profesor: no es docente', 'false',
  current_setting('seg.p1c'), current_setting('seg.p1c') = 'false';

-- ── 2. Techo diario total de Bruno ────────────────────────────────────────
update public.ajustes set valor = (
  select (coalesce(sum(invocaciones), 0) + 2)::text from public.asistente_uso
   where dia = (now() at time zone 'America/Bogota')::date)
 where clave = 'asistente_tope_global';
select pg_temp.como('a');
set local role authenticated;
do $$ declare r record; begin
  select * into r from public.asistente_consumir(50);
  perform set_config('seg.p2a', r.permitido::text, true);
  select * into r from public.asistente_consumir(50);
  perform set_config('seg.p2b', r.permitido::text, true);
end $$;
reset role;
select pg_temp.como('b');
set local role authenticated;
do $$ declare r record; begin
  select * into r from public.asistente_consumir(50);
  perform set_config('seg.p2c', r.permitido::text, true);
end $$;
reset role;
insert into res select 2, 'con techo de 2 en el sitio: A usa 2, B ya no puede aunque tenga cupo propio', 'true/true/false',
  current_setting('seg.p2a') || '/' || current_setting('seg.p2b') || '/' || current_setting('seg.p2c'),
  current_setting('seg.p2a') = 'true' and current_setting('seg.p2b') = 'true' and current_setting('seg.p2c') = 'false';

-- ── 3. Opiniones sin sesión: texto corto y tope por hora ──────────────────
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin perform set_config('seg.p3a', public.enviar_opinion(4::smallint, repeat('x', 900), true, '{}', 'inicio', null, null, null, null)::text, true); end $$;
reset role;
insert into res select 3, 'una opinión sin sesión entra con el texto recortado a 600', 'true/600',
  current_setting('seg.p3a') || '/' || (select length(texto) from public.opiniones where user_id is null order by creado desc, id desc limit 1),
  current_setting('seg.p3a') = 'true' and (select length(texto) from public.opiniones where user_id is null order by creado desc, id desc limit 1) = 600;

insert into public.opiniones (puntaje, texto, anonimo, user_id, origen)
select 3, 'relleno', true, null, 'inicio' from generate_series(1, 30);
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin perform set_config('seg.p4', public.enviar_opinion(4::smallint, 'otra', true, '{}', 'inicio', null, null, null, null)::text, true); end $$;
reset role;
insert into res select 4, 'con 30 opiniones sin sesión en la última hora, la siguiente no entra', 'false',
  current_setting('seg.p4'), current_setting('seg.p4') = 'false';

-- ── 5. Ráfaga: 13 actividades en 10 minutos; la 13 queda marcada ──────────
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, duration_ms, correct_pct, repeat_index)
select (select uid from quien where rol = 'a'), 'zzz-act-' || k, 'pensamiento-estrategico', 10, 'medio', 'exploratoria', 60000, 100, 0
  from generate_series(1, 13) k;
insert into res select 5, 'la actividad 13 en 10 minutos queda marcada como ráfaga; las 12 primeras no', '12 sin marca, 1 ráfaga',
  (select count(*) filter (where sospecha is null) || ' sin marca, ' || count(*) filter (where sospecha = 'rafaga') || ' ráfaga'
     from public.fp_history where user_id = (select uid from quien where rol = 'a')),
  (select count(*) filter (where sospecha is null) = 12 and count(*) filter (where sospecha = 'rafaga') = 1
     from public.fp_history where user_id = (select uid from quien where rol = 'a'));

-- ── 6. Imposible: evaluativa al 100 % en 2 s; una honesta, sin marca ──────
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, duration_ms, correct_pct, repeat_index)
values ((select uid from quien where rol = 'b'), 'zzz-rapida', 'pensamiento-estrategico', 40, 'medio', 'evaluativa', 2000, 100, 0),
       ((select uid from quien where rol = 'b'), 'zzz-honesta', 'pensamiento-estrategico', 40, 'medio', 'evaluativa', 90000, 100, 0),
       ((select uid from quien where rol = 'b'), 'zzz-sin-dato', 'pensamiento-estrategico', 40, 'medio', 'evaluativa', null, 80, 0);
insert into res select 6, '100 % en 2 s se marca; 100 % en 90 s y la que no trae duración, no', 'zzz-rapida=imposible',
  (select string_agg(activity_id || '=' || coalesce(sospecha, 'sin marca'), ', ' order by activity_id)
     from public.fp_history where user_id = (select uid from quien where rol = 'b')),
  (select bool_and(case when activity_id = 'zzz-rapida' then sospecha = 'imposible' else sospecha is null end)
     from public.fp_history where user_id = (select uid from quien where rol = 'b'));
insert into res select 7, 'marcar no quita FP', '40 en las tres',
  (select string_agg(fp_awarded::text, ',') from public.fp_history where user_id = (select uid from quien where rol = 'b')),
  (select bool_and(fp_awarded = 40) from public.fp_history where user_id = (select uid from quien where rol = 'b'));

-- ── 8. El profesor de la materia ve las marcas; un estudiante no ─────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin perform set_config('seg.p8d', (select count(*)::text from public.panel_sospechas('pensamiento-estrategico') s where s.nickname like 'zzzseg%'), true); end $$;
reset role;
select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform public.panel_sospechas('pensamiento-estrategico');
  perform set_config('seg.p8a', 'las vio', true);
exception when others then perform set_config('seg.p8a', 'rechazado', true);
end $$;
reset role;
insert into res select 8, 'el profesor ve a A y a B marcados; un estudiante no ve nada', '2/rechazado',
  current_setting('seg.p8d') || '/' || current_setting('seg.p8a'),
  current_setting('seg.p8d') = '2' and current_setting('seg.p8a') = 'rechazado';

-- ── Resumen ────────────────────────────────────────────────────────────────
select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
