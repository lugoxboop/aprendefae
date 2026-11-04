-- ---------------------------------------------------------------------------
-- Prueba de la migración 0159, la clase en vivo.
--
-- LO QUE SE CUIDA. Que la correcta no se filtre al celular antes de tiempo, que
-- el servidor califique (una respuesta por pregunta, dentro del tiempo), que
-- solo un docente abra salas y solo su dueño las mueva, y que la asistencia y
-- el podio cuenten lo que pasó.
--
-- QUIÉN ES QUIÉN. Un docente (zzz-vivo-docente) y tres estudiantes (A y B
-- entran a la sala; C no). Para actuar como alguien se fija el JWT y se pasa a
-- `authenticated`; lo que se quiere comprobar se saca con set_config, porque
-- `authenticated` no puede escribir en la tabla temporal `res`.
--
-- No toca a nadie real: usuarios propios con email zzz-*, y ROLLBACK al final.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table quien(rol text primary key, uid uuid, email text) on commit drop;
grant select on quien to authenticated;

insert into quien values
  ('docente', gen_random_uuid(), 'zzz-vivo-docente@prueba.local'),
  ('a',       gen_random_uuid(), 'zzz-vivo-a@prueba.local'),
  ('b',       gen_random_uuid(), 'zzz-vivo-b@prueba.local'),
  ('c',       gen_random_uuid(), 'zzz-vivo-c@prueba.local');

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data, aud, role)
select uid, email, '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated' from quien;
insert into public.profiles (user_id, nickname)
select uid, 'zzzvivo' || rol from quien;
insert into public.docentes (email, nombre, materias, activo) values ('zzz-vivo-docente@prueba.local', 'Docente de prueba', '{contabilidad}', true);

/* Actuar como alguien: el JWT lleva sub y email, como en producción. */
create or replace function pg_temp.como(p_rol text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    (select json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text from quien where rol = p_rol), true);
end;
$$;

-- ── 1. Un estudiante no puede abrir una sala ──────────────────────────────
select pg_temp.como('a');
set local role authenticated;
do $$
begin
  perform public.vivo_crear('contabilidad', 'cuentas-debe-haber', 'Prueba', 30, '[{"enunciado":"x","opciones":[{"id":"a","texto":"A"},{"id":"b","texto":"B"}],"correcta":"a"}]'::jsonb);
  perform set_config('vivo.p1', 'creó', true);
exception when others then
  perform set_config('vivo.p1', 'rechazado', true);
end $$;
reset role;
insert into res select 1, 'un estudiante no abre salas', 'rechazado', current_setting('vivo.p1'), current_setting('vivo.p1') = 'rechazado';

-- ── 2. El docente abre la sala con tres preguntas ─────────────────────────
select pg_temp.como('docente');
set local role authenticated;
do $$
declare e jsonb;
begin
  e := public.vivo_crear('contabilidad', 'cuentas-debe-haber', 'Debe y haber', 30, '[
    {"enunciado":"Pregunta uno","pregunta":"Toca una","opciones":[{"id":"a","texto":"A"},{"id":"b","texto":"B"},{"id":"c","texto":"C"}],"correcta":"b"},
    {"enunciado":"Pregunta dos","opciones":[{"id":"x","texto":"X"},{"id":"y","texto":"Y"}],"correcta":"x"},
    {"enunciado":"Pregunta tres","opciones":[{"id":"si","texto":"Sí"},{"id":"no","texto":"No"}],"correcta":"si"}
  ]'::jsonb);
  perform set_config('vivo.sala', e ->> 'sala_id', true);
  perform set_config('vivo.codigo', e ->> 'codigo', true);
  perform set_config('vivo.p2', (e ->> 'estado') || '/' || (e ->> 'total'), true);
end $$;
reset role;
insert into res select 2, 'la sala nace en espera con 3 preguntas y código de 6 cifras', 'espera/3 + 6 cifras',
  current_setting('vivo.p2') || ' + ' || current_setting('vivo.codigo'),
  current_setting('vivo.p2') = 'espera/3' and current_setting('vivo.codigo') ~ '^[0-9]{6}$';

-- ── 3. La correcta no queda dentro del contenido que ve el estudiante ─────
insert into res select 3, 'el contenido guardado no trae la correcta', '0 con correcta',
  (select count(*) filter (where contenido ? 'correcta') || ' con correcta' from public.vivo_preguntas where sala_id = current_setting('vivo.sala')::uuid),
  (select count(*) filter (where contenido ? 'correcta') = 0 and count(*) = 3 from public.vivo_preguntas where sala_id = current_setting('vivo.sala')::uuid);

-- ── 4. A y B entran con el código; entrar dos veces no duplica ────────────
select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform public.vivo_unirse(current_setting('vivo.codigo'));
  perform public.vivo_unirse(' ' || current_setting('vivo.codigo') || ' ');
end $$;
reset role;
select pg_temp.como('b');
set local role authenticated;
do $$ begin perform public.vivo_unirse(current_setting('vivo.codigo')); end $$;
reset role;
insert into res select 4, 'la asistencia tiene a A y a B, una vez cada uno', '2',
  (select count(*)::text from public.vivo_participantes where sala_id = current_setting('vivo.sala')::uuid),
  (select count(*) = 2 from public.vivo_participantes where sala_id = current_setting('vivo.sala')::uuid);

-- ── 5. Un código que no existe no deja entrar ─────────────────────────────
select pg_temp.como('c');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.vivo_unirse('000000x');
  perform set_config('vivo.p5', case when e ->> 'error' = 'codigo' then 'rechazado' else 'entró' end, true);
exception when others then perform set_config('vivo.p5', 'rechazado', true);
end $$;
reset role;
insert into res select 5, 'un código inventado no deja entrar', 'rechazado', current_setting('vivo.p5'),
  current_setting('vivo.p5') = 'rechazado' or (select codigo from public.vivo_salas where id = current_setting('vivo.sala')::uuid) = '000000';

-- ── 6. El docente abre la primera pregunta; A no ve la correcta ───────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'siguiente'); end $$;
reset role;
select pg_temp.como('a');
set local role authenticated;
do $$
declare e jsonb;
begin
  e := public.vivo_estado(current_setting('vivo.sala')::uuid);
  perform set_config('vivo.p6', (e ->> 'estado') || '/' || (e ->> 'indice') || '/' || coalesce(e ->> 'correcta', 'oculta') || '/' || (e -> 'pregunta' ->> 'enunciado'), true);
end $$;
reset role;
insert into res select 6, 'con la pregunta abierta el estudiante no ve la correcta', 'pregunta/0/oculta/Pregunta uno',
  current_setting('vivo.p6'), current_setting('vivo.p6') = 'pregunta/0/oculta/Pregunta uno';

-- ── 7. A acierta, intenta cambiar su respuesta; B se equivoca ─────────────
select pg_temp.como('a');
set local role authenticated;
do $$
declare r1 jsonb; r2 jsonb;
begin
  r1 := public.vivo_responder(current_setting('vivo.sala')::uuid, 0, 'b');
  r2 := public.vivo_responder(current_setting('vivo.sala')::uuid, 0, 'c');
  perform set_config('vivo.p7', (r1 ->> 'aceptada') || '/' || (r2 ->> 'aceptada') || '/' || (r2 ->> 'motivo'), true);
end $$;
reset role;
select pg_temp.como('b');
set local role authenticated;
do $$ begin perform public.vivo_responder(current_setting('vivo.sala')::uuid, 0, 'a'); end $$;
reset role;
insert into res select 7, 'una sola respuesta por pregunta: la segunda no cuenta', 'true/false/repetida',
  current_setting('vivo.p7'), current_setting('vivo.p7') = 'true/false/repetida';
insert into res select 8, 'el servidor calificó: A acertó y B no', 'b=acierto, a=error',
  (select string_agg(opcion || '=' || case when correcta then 'acierto' else 'error' end, ', ' order by opcion desc)
     from public.vivo_respuestas where sala_id = current_setting('vivo.sala')::uuid and indice = 0),
  (select bool_and(correcta = (opcion = 'b')) and count(*) = 2 from public.vivo_respuestas where sala_id = current_setting('vivo.sala')::uuid and indice = 0);

-- ── 9. El conteo: el docente lo ve en vivo, el estudiante no ──────────────
select pg_temp.como('a');
set local role authenticated;
do $$ begin perform set_config('vivo.p9a', coalesce((public.vivo_conteo(current_setting('vivo.sala')::uuid) ->> 'por_opcion'), 'oculto'), true); end $$;
reset role;
select pg_temp.como('docente');
set local role authenticated;
do $$ declare c jsonb; begin
  c := public.vivo_conteo(current_setting('vivo.sala')::uuid);
  perform set_config('vivo.p9d', (c ->> 'respondieron') || ' ' || (c -> 'por_opcion' ->> 'a') || (c -> 'por_opcion' ->> 'b'), true);
end $$;
reset role;
insert into res select 9, 'conteo en vivo: oculto al estudiante, visible al docente', 'oculto | 2 11',
  current_setting('vivo.p9a') || ' | ' || current_setting('vivo.p9d'),
  current_setting('vivo.p9a') = 'oculto' and current_setting('vivo.p9d') = '2 11';

-- ── 10. Un estudiante no mueve la clase ───────────────────────────────────
select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'resultados');
  perform set_config('vivo.p10', 'movió', true);
exception when others then perform set_config('vivo.p10', 'rechazado', true);
end $$;
reset role;
insert into res select 10, 'solo el dueño mueve la sala', 'rechazado', current_setting('vivo.p10'), current_setting('vivo.p10') = 'rechazado';

-- ── 11. Al cerrar la pregunta, A ve la correcta y sus puntos ──────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'resultados'); end $$;
reset role;
select pg_temp.como('a');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.vivo_estado(current_setting('vivo.sala')::uuid);
  perform set_config('vivo.p11', (e ->> 'correcta') || '/' || (e -> 'mi_respuesta' ->> 'correcta') || '/' || (e -> 'mi_respuesta' ->> 'puntos'), true);
end $$;
reset role;
insert into res select 11, 'cerrada la pregunta: correcta visible, acierto y puntos entre 700 y 1000', 'b/true/700..1000',
  current_setting('vivo.p11'),
  split_part(current_setting('vivo.p11'), '/', 1) = 'b' and split_part(current_setting('vivo.p11'), '/', 2) = 'true'
  and split_part(current_setting('vivo.p11'), '/', 3)::int between 700 and 1000;

-- ── 12. Fuera de tiempo no se acepta ──────────────────────────────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'siguiente'); end $$;
reset role;
update public.vivo_salas set inicio = now() - interval '60 seconds' where id = current_setting('vivo.sala')::uuid;
select pg_temp.como('b');
set local role authenticated;
do $$ declare r jsonb; begin
  r := public.vivo_responder(current_setting('vivo.sala')::uuid, 1, 'x');
  perform set_config('vivo.p12', (r ->> 'aceptada') || '/' || (r ->> 'motivo'), true);
end $$;
reset role;
insert into res select 12, 'una respuesta fuera de tiempo no cuenta', 'false/tiempo', current_setting('vivo.p12'), current_setting('vivo.p12') = 'false/tiempo';

-- ── 13. No se salta una pregunta abierta; al acabar, pasa al final ────────
select pg_temp.como('docente');
set local role authenticated;
do $$ declare e jsonb; begin
  begin
    perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'siguiente');
    perform set_config('vivo.p13a', 'saltó', true);
  exception when others then perform set_config('vivo.p13a', 'rechazado', true);
  end;
  perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'resultados');
  perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'siguiente');
  perform public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'resultados');
  e := public.vivo_avanzar(current_setting('vivo.sala')::uuid, 'siguiente');
  perform set_config('vivo.p13b', e ->> 'estado', true);
end $$;
reset role;
insert into res select 13, 'no se salta una pregunta abierta, y tras la última viene el final', 'rechazado/final',
  current_setting('vivo.p13a') || '/' || current_setting('vivo.p13b'),
  current_setting('vivo.p13a') = 'rechazado' and current_setting('vivo.p13b') = 'final';

-- ── 14. El podio: A primero, B con 0 ──────────────────────────────────────
select pg_temp.como('b');
set local role authenticated;
do $$ declare p jsonb; begin
  p := public.vivo_podio(current_setting('vivo.sala')::uuid, 5);
  perform set_config('vivo.p14', (p -> 'podio' -> 0 ->> 'apodo') || '/' || (p -> 'mio' ->> 'puesto') || '/' || (p -> 'mio' ->> 'puntos'), true);
end $$;
reset role;
insert into res select 14, 'podio: A primero; B ve su puesto con 0 puntos', 'zzzvivoa/2/0', current_setting('vivo.p14'), current_setting('vivo.p14') = 'zzzvivoa/2/0';

-- ── 15. La asistencia es del dueño ────────────────────────────────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin perform set_config('vivo.p15d', jsonb_array_length(public.vivo_asistencia(current_setting('vivo.sala')::uuid))::text, true); end $$;
reset role;
select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform public.vivo_asistencia(current_setting('vivo.sala')::uuid);
  perform set_config('vivo.p15a', 'la vio', true);
exception when others then perform set_config('vivo.p15a', 'rechazado', true);
end $$;
reset role;
insert into res select 15, 'la asistencia: 2 para el docente, nada para el estudiante', '2/rechazado',
  current_setting('vivo.p15d') || '/' || current_setting('vivo.p15a'),
  current_setting('vivo.p15d') = '2' and current_setting('vivo.p15a') = 'rechazado';

-- ── 16. Quien no entró no ve la sala ──────────────────────────────────────
select pg_temp.como('c');
set local role authenticated;
do $$ begin
  perform public.vivo_estado(current_setting('vivo.sala')::uuid);
  perform set_config('vivo.p16', 'la vio', true);
exception when others then perform set_config('vivo.p16', 'rechazado', true);
end $$;
reset role;
insert into res select 16, 'quien no entró no ve el estado', 'rechazado', current_setting('vivo.p16'), current_setting('vivo.p16') = 'rechazado';

-- ── 17. Nadie lee las tablas directo ──────────────────────────────────────
select pg_temp.como('a');
set local role authenticated;
do $$ begin
  perform count(*) from public.vivo_preguntas;
  perform set_config('vivo.p17', 'leyó', true);
exception when others then perform set_config('vivo.p17', 'rechazado', true);
end $$;
reset role;
insert into res select 17, 'las preguntas (con la correcta) no se leen directo', 'rechazado', current_setting('vivo.p17'), current_setting('vivo.p17') = 'rechazado';

-- ── 18. Sin sesión, ni entrar ─────────────────────────────────────────────
set local role anon;
do $$ begin
  perform public.vivo_unirse(current_setting('vivo.codigo'));
  perform set_config('vivo.p18', 'entró', true);
exception when others then perform set_config('vivo.p18', 'rechazado', true);
end $$;
reset role;
insert into res select 18, 'un visitante sin sesión no entra', 'rechazado', current_setting('vivo.p18'), current_setting('vivo.p18') = 'rechazado';

-- ── 19. Abrir otra sala cierra la anterior del mismo docente ──────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin
  perform public.vivo_crear('macroeconomia', 'politica-monetaria', 'Otra', 20, '[{"enunciado":"y","opciones":[{"id":"a","texto":"A"},{"id":"b","texto":"B"}],"correcta":"a"}]'::jsonb);
end $$;
reset role;
insert into res select 19, 'abrir otra sala cierra la anterior', 'cerrada',
  (select estado from public.vivo_salas where id = current_setting('vivo.sala')::uuid),
  (select estado = 'cerrada' from public.vivo_salas where id = current_setting('vivo.sala')::uuid);

-- ── 20. Una correcta que no está entre las opciones se rechaza ───────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin
  perform public.vivo_crear('contabilidad', 'x', 'Mal', 30, '[{"enunciado":"z","opciones":[{"id":"a","texto":"A"},{"id":"b","texto":"B"}],"correcta":"q"}]'::jsonb);
  perform set_config('vivo.p20', 'creó', true);
exception when others then perform set_config('vivo.p20', 'rechazado', true);
end $$;
reset role;
insert into res select 20, 'una pregunta con la correcta fuera de sus opciones no entra', 'rechazado', current_setting('vivo.p20'), current_setting('vivo.p20') = 'rechazado';


-- ── 21. Lo que se guarda no trae la clave del banco ───────────────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ declare e jsonb; begin
  e := public.vivo_crear('contabilidad', 'x', 'Clave', 30, '[{"clave":"t2-debe:caja","actividad":"t2-debe","enunciado":"z","opciones":[{"id":"a","texto":"A","extra":1},{"id":"b","texto":"B"}],"correcta":"a"}]'::jsonb);
  perform set_config('vivo.sala2', e ->> 'sala_id', true);
  perform set_config('vivo.codigo2', e ->> 'codigo', true);
end $$;
reset role;
insert into res select 21, 'el contenido no lleva la clave ni nada que no se pinte', 'sin clave ni actividad ni extra',
  (select contenido::text from public.vivo_preguntas where sala_id = current_setting('vivo.sala2')::uuid),
  (select not (contenido ? 'clave') and not (contenido ? 'actividad') and not (contenido -> 'opciones' -> 0 ? 'extra')
     from public.vivo_preguntas where sala_id = current_setting('vivo.sala2')::uuid);

-- ── 22. Opciones con id repetido no entran ────────────────────────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ begin
  perform public.vivo_crear('contabilidad', 'x', 'Mal', 30, '[{"enunciado":"z","opciones":[{"id":"a","texto":"A"},{"id":"a","texto":"B"}],"correcta":"a"}]'::jsonb);
  perform set_config('vivo.p22', 'creó', true);
exception when others then perform set_config('vivo.p22', 'rechazado', true);
end $$;
reset role;
insert into res select 22, 'opciones con el id repetido no entran', 'rechazado', current_setting('vivo.p22'), current_setting('vivo.p22') = 'rechazado';

-- ── 23. Expulsar: B sale del conteo y no puede responder ni volver ────────
select pg_temp.como('a');
set local role authenticated;
do $$ begin perform public.vivo_unirse(current_setting('vivo.codigo2')); end $$;
reset role;
select pg_temp.como('b');
set local role authenticated;
do $$ begin perform public.vivo_unirse(current_setting('vivo.codigo2')); end $$;
reset role;
select pg_temp.como('docente');
set local role authenticated;
do $$ declare e jsonb; begin
  perform public.vivo_expulsar(current_setting('vivo.sala2')::uuid, (select uid from quien where rol = 'b'));
  e := public.vivo_avanzar(current_setting('vivo.sala2')::uuid, 'siguiente');
  perform set_config('vivo.p23n', e ->> 'participantes', true);
end $$;
reset role;
select pg_temp.como('b');
set local role authenticated;
do $$ declare e jsonb; begin
  begin
    perform public.vivo_responder(current_setting('vivo.sala2')::uuid, 0, 'a');
    perform set_config('vivo.p23r', 'respondió', true);
  exception when others then perform set_config('vivo.p23r', 'rechazado', true);
  end;
  e := public.vivo_unirse(current_setting('vivo.codigo2'));
  perform set_config('vivo.p23v', coalesce(e ->> 'error', 'entró'), true);
end $$;
reset role;
insert into res select 23, 'expulsado: fuera del conteo, sin responder, sin volver', '1/rechazado/expulsado',
  current_setting('vivo.p23n') || '/' || current_setting('vivo.p23r') || '/' || current_setting('vivo.p23v'),
  current_setting('vivo.p23n') = '1' and current_setting('vivo.p23r') = 'rechazado' and current_setting('vivo.p23v') = 'expulsado';

-- ── 24. Del podio no se vuelve a una pregunta ─────────────────────────────
select pg_temp.como('docente');
set local role authenticated;
do $$ declare e jsonb; begin
  perform public.vivo_avanzar(current_setting('vivo.sala2')::uuid, 'final');
  e := public.vivo_avanzar(current_setting('vivo.sala2')::uuid, 'siguiente');
  perform set_config('vivo.p24', e ->> 'estado', true);
end $$;
reset role;
insert into res select 24, 'en el podio, «siguiente» no reabre preguntas', 'final', current_setting('vivo.p24'), current_setting('vivo.p24') = 'final';

-- ── 25. Diez códigos equivocados y hay que esperar ───────────────────────
select pg_temp.como('c');
set local role authenticated;
do $$ declare k int; begin
  -- C ya falló una vez en el paso 5: nueve más completan diez.
  for k in 1 .. 9 loop perform public.vivo_unirse('99999' || k); end loop;
  begin
    perform public.vivo_unirse(current_setting('vivo.codigo2'));
    perform set_config('vivo.p25', 'entró', true);
  exception when others then perform set_config('vivo.p25', 'frenado', true);
  end;
end $$;
reset role;
insert into res select 25, 'tras 10 códigos equivocados, ni el correcto entra por un rato', 'frenado', current_setting('vivo.p25'), current_setting('vivo.p25') = 'frenado';

-- ── Resumen. Única consulta que devuelve filas. ────────────────────────────
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
