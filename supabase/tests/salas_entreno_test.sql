-- ---------------------------------------------------------------------------
-- Prueba de la migración 0172 — salas de entrenamiento.
--
-- Lo que importa:
--   · solo se invita a amigos; un no-amigo no puede ni asomarse al lobby;
--   · el creador JUEGA y no ve la correcta antes de tiempo;
--   · el servidor califica, y la pregunta solo se cierra cuando todos
--     respondieron (o se acabó el tiempo);
--   · «siguiente» lo da el creador, o cualquiera pasados 7 s;
--   · los amigos de demostración solo se sientan en la sala de SU dueño, y
--     sortean su respuesta al abrir la pregunta;
--   · entrar con código solo en el lobby; si sale el creador, la sala pasa;
--   · emotes (0173): se ven, y solo los de la lista y de quien está adentro.
--
-- No toca a nadie real: cuentas zzz-* y ROLLBACK al final.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table quien(rol text, uid uuid, email text) on commit drop;
create temp table v(k text primary key, val text) on commit drop;
grant all on res, quien, v to authenticated, anon;

insert into quien values
  ('ana',  gen_random_uuid(), 'zzz-ent-ana@prueba.local'),
  ('beto', gen_random_uuid(), 'zzz-ent-beto@prueba.local'),
  ('cami', gen_random_uuid(), 'zzz-ent-cami@prueba.local'),
  ('dueno', gen_random_uuid(), 'zzz-ent-dueno@prueba.local');

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data, aud, role)
select uid, email, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated' from quien;
insert into public.profiles (user_id, nickname)
select uid, 'zzzent' || rol from quien q where not exists (select 1 from public.profiles p where p.user_id = q.uid);

/* Ana y Beto son amigos; Cami no es amiga de nadie. */
insert into public.amistades (solicitante, receptor, estado)
select (select uid from quien where rol = 'ana'), (select uid from quien where rol = 'beto'), 'aceptada';

/* Dos amigos de demostración del «dueño». */
insert into public.amigos_demo (dueno, apodo, mascota_especie)
select (select uid from quien where rol = 'dueno'), x, 'gato' from unnest(array['zzzbot1', 'zzzbot2']) x;

create or replace function pg_temp.como(p_rol text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    (select json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text from quien where rol = p_rol), true);
end;
$$;
create or replace function pg_temp.uid(p_rol text) returns uuid language sql as $$ select uid from quien where rol = p_rol $$;
create or replace function pg_temp.g(p_k text) returns text language sql as $$ select val from v where k = p_k $$;
create or replace function pg_temp.p(p_k text, p_val text) returns void language sql as $$
  insert into v values (p_k, p_val) on conflict (k) do update set val = excluded.val $$;

/* Dos preguntas: la correcta es «b» en las dos. */
select pg_temp.p('preg', '[
  {"enunciado":"¿Uno?","opciones":[{"id":"a","texto":"A"},{"id":"b","texto":"B"},{"id":"c","texto":"C"}],"correcta":"b"},
  {"enunciado":"¿Dos?","opciones":[{"id":"a","texto":"A"},{"id":"b","texto":"B"}],"correcta":"b"}]');

-- ── 1. Ana crea la sala e invita a Beto (amigo) y a Cami (no amiga) ────────
select pg_temp.como('ana');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.entreno_crear('Sala de prueba', 'contabilidad', 't1', 'Introducción', 20, pg_temp.g('preg')::jsonb,
                            array[pg_temp.uid('beto'), pg_temp.uid('cami')], '{}');
  perform pg_temp.p('sala', e->>'sala_id');
  perform pg_temp.p('codigo', e->>'codigo');
  perform pg_temp.p('p1', jsonb_array_length(e->'jugadores') || '/' || jsonb_array_length(e->'invitados') || '/' || (e->>'estado') || '/' || (e->>'soy_anfitrion'));
end $$;
reset role;
insert into res select 1, 'crear: 1 jugador (Ana), 1 invitado (solo Beto), lobby, Ana anfitriona', '1/1/lobby/true',
  pg_temp.g('p1'), pg_temp.g('p1') = '1/1/lobby/true';

-- ── 2. Beto ve la invitación y se asoma; Cami no puede asomarse ────────────
select pg_temp.como('beto');
set local role authenticated;
do $$ declare m jsonb := public.entreno_mis_salas(); e jsonb; begin
  e := public.entreno_estado(pg_temp.g('sala')::uuid);
  perform pg_temp.p('p2', jsonb_array_length(m->'invitaciones') || '/' || (m->'invitaciones'->0->>'duelo') || '/' || (e->>'dentro'));
end $$;
reset role;
insert into res select 2, 'Beto: 1 invitación (duelo), se asoma sin estar dentro', '1/true/false',
  pg_temp.g('p2'), pg_temp.g('p2') = '1/true/false';

select pg_temp.como('cami');
set local role authenticated;
do $$ begin
  perform pg_temp.p('p3', 'entro');
  perform public.entreno_estado(pg_temp.g('sala')::uuid);
exception when others then perform pg_temp.p('p3', 'rechazada');
end $$;
reset role;
insert into res select 3, 'Cami (no invitada) no ve el lobby', 'rechazada', pg_temp.g('p3'), pg_temp.g('p3') = 'rechazada';

-- ── 3. Beto entra; Ana empieza; durante la cuenta atrás no hay pregunta ────
select pg_temp.como('beto');
set local role authenticated;
select public.entreno_entrar(pg_temp.g('sala')::uuid);
select public.entreno_listo(pg_temp.g('sala')::uuid, true);
reset role;
select pg_temp.como('ana');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.entreno_avanzar(pg_temp.g('sala')::uuid, 'empezar');
  perform pg_temp.p('p4', (e->>'estado') || '/' || jsonb_array_length(e->'jugadores') || '/' || coalesce(e->>'pregunta', 'sin'));
end $$;
reset role;
insert into res select 4, 'empezar: pregunta, 2 jugadores, la pregunta aún no se ve (cuenta atrás)', 'pregunta/2/sin',
  pg_temp.g('p4'), pg_temp.g('p4') = 'pregunta/2/sin';

/* Pasa la cuenta atrás (dentro de una transacción now() no avanza: se corre el inicio). */
update public.entreno_salas set inicio = now() - interval '2 seconds' where id = pg_temp.g('sala')::uuid;

-- ── 4. La anfitriona ve la pregunta pero NO la correcta; responde bien ─────
select pg_temp.como('ana');
set local role authenticated;
do $$ declare e jsonb; r jsonb; begin
  e := public.entreno_estado(pg_temp.g('sala')::uuid);
  r := public.entreno_responder(pg_temp.g('sala')::uuid, 0, 'b');
  perform pg_temp.p('p5', (e->'pregunta'->>'enunciado') || '/' || coalesce(e->>'correcta', 'oculta') || '/' || (r->>'aceptada'));
  /* Con Beto sin responder, «resultados» no cierra. */
  e := public.entreno_avanzar(pg_temp.g('sala')::uuid, 'resultados');
  perform pg_temp.p('p6', e->>'estado');
end $$;
reset role;
insert into res select 5, 'la anfitriona ve el enunciado, la correcta oculta, su respuesta cuenta', '¿Uno?/oculta/true',
  pg_temp.g('p5'), pg_temp.g('p5') = '¿Uno?/oculta/true';
insert into res select 6, 'con Beto sin responder la pregunta no se cierra', 'pregunta', pg_temp.g('p6'), pg_temp.g('p6') = 'pregunta';

-- ── 5. Beto falla; todos respondieron → cierra; la correcta y los puntos salen ──
select pg_temp.como('beto');
set local role authenticated;
do $$ declare e jsonb; r jsonb; begin
  r := public.entreno_responder(pg_temp.g('sala')::uuid, 0, 'a');
  perform public.entreno_responder(pg_temp.g('sala')::uuid, 0, 'b'); -- segunda vez: no cambia nada
  e := public.entreno_avanzar(pg_temp.g('sala')::uuid, 'resultados');
  perform pg_temp.p('p7', (e->>'estado') || '/' || (e->>'correcta') || '/' || (e->'mi_respuesta'->>'correcta') || '/' ||
    (select (j->>'puntos')::int >= 700 from jsonb_array_elements(e->'jugadores') j where j->>'anfitrion' = 'true')::text);
  /* Beto no puede adelantar antes de 7 s. */
  e := public.entreno_avanzar(pg_temp.g('sala')::uuid, 'siguiente');
  perform pg_temp.p('p8', e->>'estado');
end $$;
reset role;
insert into res select 7, 'todos respondieron: resultados, correcta b, Beto falló (no le valió repetir), Ana ≥700', 'resultados/b/false/true',
  pg_temp.g('p7'), pg_temp.g('p7') = 'resultados/b/false/true';
insert into res select 8, 'un invitado no adelanta antes de 7 s', 'resultados', pg_temp.g('p8'), pg_temp.g('p8') = 'resultados';

update public.entreno_salas set fase_desde = now() - interval '8 seconds' where id = pg_temp.g('sala')::uuid;
select pg_temp.como('beto');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.entreno_avanzar(pg_temp.g('sala')::uuid, 'siguiente');
  perform pg_temp.p('p9', (e->>'estado') || '/' || (e->>'indice'));
end $$;
reset role;
insert into res select 9, 'pasados 7 s cualquiera pasa a la siguiente', 'pregunta/1', pg_temp.g('p9'), pg_temp.g('p9') = 'pregunta/1';

-- ── 6. Los bots: solo en la sala de su dueño, y sortean al abrir ───────────
select pg_temp.como('cami');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.entreno_crear('', 'macroeconomia', 'x', 'X', 20, pg_temp.g('preg')::jsonb, '{}',
         (select array_agg(id) from public.amigos_demo where apodo like 'zzzbot%'));
  perform pg_temp.p('p10', jsonb_array_length(e->'jugadores')::text || '/' || (e->>'nombre'));
end $$;
reset role;
insert into res select 10, 'Cami no puede sentar bots ajenos; la sala toma su nombre por defecto', '1/Sala de zzzentcami',
  pg_temp.g('p10'), pg_temp.g('p10') = '1/Sala de zzzentcami';

select pg_temp.como('dueno');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.entreno_crear('Con bots', 'macroeconomia', 'x', 'X', 20, pg_temp.g('preg')::jsonb, '{}',
         (select array_agg(id) from public.amigos_demo where apodo like 'zzzbot%'));
  perform pg_temp.p('sala2', e->>'sala_id');
  perform pg_temp.p('codigo2', e->>'codigo');
  perform pg_temp.p('p11', jsonb_array_length(e->'jugadores')::text || '/' ||
    (select bool_and((j->>'listo')::boolean) from jsonb_array_elements(e->'jugadores') j)::text);
end $$;
reset role;
insert into res select 11, 'el dueño sienta a sus 2 bots, todos listos', '3/true', pg_temp.g('p11'), pg_temp.g('p11') = '3/true';

-- ── 7. Entrar con código: en el lobby sí; con la partida empezada no ───────
select pg_temp.como('cami');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.entreno_unirse(pg_temp.g('codigo2'));
  perform pg_temp.p('p12', jsonb_array_length(e->'jugadores')::text || '/' || (e->>'dentro'));
  e := public.entreno_unirse('000000x');
  perform pg_temp.p('p12b', coalesce(e->>'error', 'sin error'));
end $$;
reset role;
insert into res select 12, 'Cami entra con el código al lobby del dueño (4 en la sala)', '4/true', pg_temp.g('p12'), pg_temp.g('p12') = '4/true';
insert into res select 13, 'un código que no existe llega como dato', 'codigo', pg_temp.g('p12b'), pg_temp.g('p12b') = 'codigo';

select pg_temp.como('dueno');
set local role authenticated;
select public.entreno_avanzar(pg_temp.g('sala2')::uuid, 'empezar');
reset role;
insert into res select 14, 'al empezar, los 2 bots ya tienen su respuesta sorteada', '2',
  (select count(*)::text from public.entreno_respuestas r join public.entreno_jugadores j on j.id = r.jugador_id
    where r.sala_id = pg_temp.g('sala2')::uuid and j.demo_id is not null),
  (select count(*) from public.entreno_respuestas r join public.entreno_jugadores j on j.id = r.jugador_id
    where r.sala_id = pg_temp.g('sala2')::uuid and j.demo_id is not null) = 2;

select pg_temp.como('beto');
set local role authenticated;
do $$ begin
  perform pg_temp.p('p15', 'entro');
  perform public.entreno_unirse(pg_temp.g('codigo2'));
exception when others then perform pg_temp.p('p15', 'rechazado');
end $$;
reset role;
insert into res select 15, 'con la partida empezada ya no se entra con código', 'rechazado', pg_temp.g('p15'), pg_temp.g('p15') = 'rechazado';

-- ── 8. Si sale la anfitriona, la sala pasa a Beto ──────────────────────────
select pg_temp.como('ana');
set local role authenticated;
select public.entreno_salir(pg_temp.g('sala')::uuid);
reset role;
select pg_temp.como('beto');
set local role authenticated;
do $$ declare e jsonb := public.entreno_estado(pg_temp.g('sala')::uuid); begin
  perform pg_temp.p('p16', (e->>'soy_anfitrion') || '/' || jsonb_array_length(e->'jugadores'));
end $$;
reset role;
insert into res select 16, 'sale Ana: Beto queda de anfitrión, 1 jugador', 'true/1', pg_temp.g('p16'), pg_temp.g('p16') = 'true/1';

-- ── 9. Nadie lee las tablas directo; anon no llama nada ────────────────────
select pg_temp.como('beto');
set local role authenticated;
do $$ begin
  perform pg_temp.p('p17', 'leyo');
  perform 1 from public.entreno_preguntas limit 1;
exception when others then perform pg_temp.p('p17', 'rechazado');
end $$;
reset role;
insert into res select 17, 'un estudiante no puede leer las correctas directo de la tabla', 'rechazado', pg_temp.g('p17'), pg_temp.g('p17') = 'rechazado';

select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  perform pg_temp.p('p18', 'ejecuto');
  set local role anon;
  perform public.entreno_mis_salas();
exception when others then reset role; perform pg_temp.p('p18', 'rechazado');
end $$;
reset role;
insert into res select 18, 'anon no puede llamar entreno_mis_salas', 'rechazado', pg_temp.g('p18'), pg_temp.g('p18') = 'rechazado';

-- ── 10. Emotes (0173): se ven 5 s; uno desconocido o de alguien de fuera no entra ──
select pg_temp.como('beto');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.entreno_emote(pg_temp.g('sala')::uuid, 'baila');
  perform pg_temp.p('p19', (select j->>'emote' from jsonb_array_elements(e->'jugadores') j where (j->>'soy_yo')::boolean));
  begin
    perform public.entreno_emote(pg_temp.g('sala')::uuid, 'drop table');
    perform pg_temp.p('p20', 'entro');
  exception when others then perform pg_temp.p('p20', 'rechazado');
  end;
end $$;
reset role;
insert into res select 19, 'Beto hace «baila» y su mascota lo muestra', 'baila', pg_temp.g('p19'), pg_temp.g('p19') = 'baila';
insert into res select 20, 'un emote que no existe no entra', 'rechazado', pg_temp.g('p20'), pg_temp.g('p20') = 'rechazado';

select pg_temp.como('cami');
set local role authenticated;
do $$ begin
  perform pg_temp.p('p21', 'entro');
  perform public.entreno_emote(pg_temp.g('sala')::uuid, 'baila');
exception when others then perform pg_temp.p('p21', 'rechazado');
end $$;
reset role;
insert into res select 21, 'alguien de fuera de la sala no hace emotes en ella', 'rechazado', pg_temp.g('p21'), pg_temp.g('p21') = 'rechazado';

-- ── Resumen ────────────────────────────────────────────────────────────────
select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
