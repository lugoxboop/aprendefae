-- ---------------------------------------------------------------------------
-- Prueba de panel_actividad y panel_items — LAS EJECUTA, no las mira.
--
-- ═══════════ EL CASO QUE FALTABA, Y POR QUÉ FALTABA ═══════════
--
-- La 0021 se dio por buena comprobando que las dos funciones EXISTÍAN con su
-- firma, que tenían los permisos correctos y que sus guardas rechazaban a quien
-- no es docente. Las dos estaban rotas igualmente:
--
--   42702: column reference "modality" is ambiguous
--
-- Nada de aquello podía verlo. `create function` solo analiza la SINTAXIS del
-- cuerpo —no resuelve nombres de columna— así que la migración dijo "Success".
-- Y una llamada sin sesión levanta el 42501 de la guarda ANTES de llegar a la
-- consulta ambigua, así que conformarse con ese 42501 da verde con el cuerpo
-- roto. Es la forma exacta del fallo del ×100: nada falla y lo que se enseña no
-- es cierto.
--
-- Lo único que lo saca es ejecutar el cuerpo entero con las guardas
-- SATISFECHAS. Eso es lo que hace este archivo, y por eso el paso 1 es el más
-- importante: no comprueba un número, comprueba que la función llega al final.
--
-- ═══════════ CÓMO SE SIEMBRA LA SESIÓN ═══════════
--
-- es_docente() y materias_docente() sacan el correo del JWT, no de un
-- parámetro, así que basta con poner request.jwt.claims. Las llamadas de datos
-- se hacen como DUEÑO y no como `authenticated`: el rol solo decide si se puede
-- ejecutar, y eso se mira aparte en los pasos 10 a 13.
--
-- No toca a nadie real: usuarios, docente y materia propios zzz-*, y ROLLBACK
-- al final.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(etiqueta text, uid uuid) on commit drop;

-- ── Montaje ─────────────────────────────────────────────────────────────────
insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-pa-a@prueba.local', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-pa-b@prueba.local', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-pa-c@prueba.local', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-pa-p@prueba.local', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(etiqueta, uid)
select 'a', id from auth.users where email = 'zzz-pa-a@prueba.local'
union all select 'b', id from auth.users where email = 'zzz-pa-b@prueba.local'
union all select 'c', id from auth.users where email = 'zzz-pa-c@prueba.local'
union all select 'p', id from auth.users where email = 'zzz-pa-p@prueba.local';

/* Tres estudiantes reales y uno marcado como cuenta de prueba. */
insert into public.profiles(user_id, nickname, es_prueba)
select uid, 'zzzpa' || etiqueta, etiqueta = 'p' from ids;

insert into public.docentes(email, nombre, materias, activo)
values ('zzz-pa-doc@prueba.local', 'Docente de prueba', array['zzz-pa-materia'], true);

/* Los tres reales están en el grupo del docente; la cuenta de prueba también,
   para comprobar que no la cuenta ni estando dentro. */
insert into public.docente_grupo(docente_email, subject_id, user_id)
select 'zzz-pa-doc@prueba.local', 'zzz-pa-materia', uid from ids;

/*
 * Historial de zzz-pa-act, evaluativa:
 *   a  dos intentos: 50 y 92   -> su mejor es 92, banda alta
 *   b  un intento:   70        -> banda media
 *   c  un intento:   30        -> banda baja
 *   p  un intento:  100        -> cuenta de prueba, no debe contar en nada
 * Y un bono de racha, que no es un intento.
 */
insert into public.fp_history
  (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, correct_pct, duration_ms, created_at)
select uid, 'zzz-pa-act', 'zzz-pa-materia', 20, 'medio', 'evaluativa',  50, 100000, now() - interval '3 days' from ids where etiqueta = 'a'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 40, 'medio', 'evaluativa',  92, 200000, now() - interval '1 days' from ids where etiqueta = 'a'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 30, 'medio', 'evaluativa',  70, 300000, now() from ids where etiqueta = 'b'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 10, 'medio', 'evaluativa',  30, 400000, now() from ids where etiqueta = 'c'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 99, 'medio', 'evaluativa', 100, 999000, now() from ids where etiqueta = 'p'
union all
select uid, 'racha-3',    'zzz-pa-materia', 15, 'bono',  'racha',     null,   null, now() from ids where etiqueta = 'a';

/*
 * Detalle por ítem: SEIS intentos con captura, para pasar el mínimo de cinco de
 * panel_items. Sin esto la función devuelve pronto y su consulta —la que tenía
 * el item_id ambiguo— no llegaría a ejecutarse nunca, que es precisamente por
 * lo que ese fallo estuvo escondido.
 */
insert into public.fp_detalle(fp_history_id, user_id, activity_id, item_id, acerto, intentos, respuesta)
select h.id, h.user_id, h.activity_id, i.item, i.ok, 1, case when i.ok then null else 'otra' end
  from public.fp_history h
  join ids on ids.uid = h.user_id
 cross join (values ('p1', false), ('p2', true)) as i(item, ok)
 where h.activity_id = 'zzz-pa-act' and ids.etiqueta in ('a', 'b', 'c');

/* Sesión: el docente zzz. */
select set_config('request.jwt.claims',
                  json_build_object('sub', gen_random_uuid(),
                                    'email', 'zzz-pa-doc@prueba.local',
                                    'role', 'authenticated')::text,
                  true);

-- ── 1. panel_actividad EJECUTA Y DEVUELVE UNA FILA ──────────────────────────
/*
 * EL PASO QUE FALTABA. Con la 0021 tal como se desplegó, esto levanta
 * 42702 y `obtenido` sale con el mensaje de Postgres en vez de 'una fila'.
 *
 * SI FALLARA DE VERDAD: es lo que le pasó a Mateo en pantalla, con la 0021
 * aplicada y este archivo sin existir.
 *
 * NO ESTÁ COMPROBADO CONTRA LA 0021, y conviene decirlo. En esta máquina no hay
 * Postgres, ni psql, ni Docker: no puedo ejecutar SQL, que es precisamente el
 * agujero que esta prueba viene a tapar y que solo se cierra de verdad con
 * infraestructura. Lo que sí está comprobado es que la ambigüedad está en el
 * SELECT final de panel_actividad, por el que pasa toda llamada que supere las
 * guardas — así que este paso no puede no verla.
 */
do $x$
declare v int;
begin
  select count(*) into v from public.panel_actividad('zzz-pa-materia', 'zzz-pa-act');
  perform set_config('prueba.pa_ejecuta', v::text, true);
exception when others then
  perform set_config('prueba.pa_ejecuta', sqlstate || ': ' || sqlerrm, true);
end;
$x$;

insert into res select 1, 'panel_actividad se ejecuta entera y devuelve una fila', '1',
  current_setting('prueba.pa_ejecuta', true),
  current_setting('prueba.pa_ejecuta', true) = '1';

-- ── 2. panel_items EJECUTA Y DEVUELVE SUS ÍTEMS ─────────────────────────────
/*
 * Con seis intentos con captura pasa el mínimo de cinco y entra en la consulta
 * que tenía el item_id ambiguo. Dos ítems distintos: p1 y p2.
 */
do $x$
declare v int;
begin
  select count(*) into v from public.panel_items('zzz-pa-materia', 'zzz-pa-act');
  perform set_config('prueba.pi_ejecuta', v::text, true);
exception when others then
  perform set_config('prueba.pi_ejecuta', sqlstate || ': ' || sqlerrm, true);
end;
$x$;

insert into res select 2, 'panel_items se ejecuta entera y devuelve sus dos ítems', '2',
  current_setting('prueba.pi_ejecuta', true),
  current_setting('prueba.pi_ejecuta', true) = '2';

-- ── 3 a 8. Las cifras son las sembradas, no cualquier fila ─────────────────
/*
 * Que devuelva UNA fila no basta: podría devolver una fila de ceros. Esto mira
 * los números que se pueden calcular a mano desde el montaje.
 *
 * completaron = 3 (a, b, c) y NO 4: la cuenta de prueba no cuenta.
 * intentos    = 4 y NO 5: el bono de racha no es un intento.
 * pct_medio   = (92 + 70 + 30) / 3 = 64,0 — con el MEJOR de cada uno, no con
 *               los cinco intentos.
 */
/*
 * LA TABLA SE DECLARA Y LUEGO SE LLENA, y no las dos cosas a la vez.
 *
 * Con `create temp table pa as select * from panel_actividad(...)`, una función
 * que levante 42702 aborta la transacción entera y este archivo no llega a
 * imprimir ni el resumen: el paso 1 habría detectado el fallo y nadie lo vería.
 * Declarando las columnas y llenándolas dentro de un bloque con manejador, un
 * fallo deja la tabla vacía y los pasos 3 a 7 salen en rojo con el resumen
 * puesto, que es lo que sirve para diagnosticar.
 *
 * Que las columnas estén escritas aquí es deliberado: son el contrato que el
 * cliente consume por nombre. Si la firma cambiara, esta prueba lo dice en voz
 * alta en vez de adaptarse en silencio.
 */
create temp table pa(
  activity_id           text,
  modality              text,
  difficulty            text,
  completaron           integer,
  en_grupo              integer,
  grupo_total           integer,
  intentos              bigint,
  pct_medio             numeric,
  distribucion_visible  boolean,
  banda_alta            integer,
  banda_media           integer,
  banda_baja            integer,
  duracion_media_ms     numeric,
  fp_medio              numeric,
  intentos_con_detalle  integer,
  detalle_desde         timestamptz
) on commit drop;

do $x$
begin
  insert into pa select * from public.panel_actividad('zzz-pa-materia', 'zzz-pa-act');
exception when others then
  /* El paso 1 ya reportó qué pasó; aquí solo se evita tumbar la transacción. */
  null;
end;
$x$;

insert into res select 3, 'completaron cuenta personas reales, no intentos ni cuentas de prueba', '3',
  (select completaron::text from pa),
  (select completaron = 3 from pa);

insert into res select 4, 'intentos excluye el bono de racha', '4',
  (select intentos::text from pa),
  (select intentos = 4 from pa);

insert into res select 5, 'pct_medio usa el MEJOR intento de cada estudiante', '64.0',
  (select pct_medio::text from pa),
  (select pct_medio = 64.0 from pa);

insert into res select 6, 'modality y difficulty salen resueltas, no nulas', 'evaluativa / medio',
  (select coalesce(modality, 'NULO') || ' / ' || coalesce(difficulty, 'NULO') from pa),
  (select modality = 'evaluativa' and difficulty = 'medio' from pa);

-- ── 9. El umbral de celda: con 1 por banda, no se enseña la distribución ────
/*
 * Las tres bandas tienen una persona cada una (92 alta, 70 media, 30 baja), y
 * el mínimo son tres. Así que los tres recuentos vuelven en NULL y
 * distribucion_visible en false: los números exactos ni siquiera salen de aquí.
 */
insert into res select 7, 'el tiempo medio ignora el bono y la cuenta de prueba', '250000',
  (select coalesce(duracion_media_ms::text, 'NULO') from pa),
  (select duracion_media_ms = 250000 from pa);

insert into res select 8, 'el FP medio ignora el bono y la cuenta de prueba', '25.0',
  (select coalesce(fp_medio::text, 'NULO') from pa),
  (select fp_medio = 25.0 from pa);

insert into res select 9, 'con una persona por banda, la distribución no se devuelve', 'false / null',
  (select distribucion_visible::text || ' / ' ||
          coalesce(banda_alta::text, 'null') || coalesce(banda_media::text, '') || coalesce(banda_baja::text, '') from pa),
  (select distribucion_visible = false and banda_alta is null and banda_media is null and banda_baja is null from pa);

-- ── 10. Y las dos guardas siguen cerradas para quien no es docente ──────────
/*
 * Esto es lo que la 0021 ya comprobaba, y sigue haciendo falta: arreglar la
 * ambigüedad no puede haber abierto la puerta. Va DESPUÉS de los pasos que
 * ejecutan de verdad, para que un 42501 no se pueda confundir con "pasa".
 */
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'a'),
                                    'email', 'zzz-pa-a@prueba.local',
                                    'role', 'authenticated')::text,
                  true);

do $g$
begin
  perform 1 from public.panel_actividad('zzz-pa-materia', 'zzz-pa-act');
  perform set_config('prueba.g1', 'pasó', true);
exception when insufficient_privilege then
  perform set_config('prueba.g1', 'rechazado', true);
end;
$g$;

do $g$
begin
  perform 1 from public.panel_items('zzz-pa-materia', 'zzz-pa-act');
  perform set_config('prueba.g2', 'pasó', true);
exception when insufficient_privilege then
  perform set_config('prueba.g2', 'rechazado', true);
end;
$g$;

insert into res select 10, 'un estudiante no puede leer panel_actividad', 'rechazado',
  current_setting('prueba.g1', true),
  current_setting('prueba.g1', true) = 'rechazado';

insert into res select 11, 'un estudiante no puede leer panel_items', 'rechazado',
  current_setting('prueba.g2', true),
  current_setting('prueba.g2', true) = 'rechazado';

-- ── 12. Un docente de OTRA materia tampoco ──────────────────────────────────
insert into public.docentes(email, nombre, materias, activo)
values ('zzz-pa-otro@prueba.local', 'Docente de otra materia', array['zzz-pa-otra'], true);

select set_config('request.jwt.claims',
                  json_build_object('sub', gen_random_uuid(),
                                    'email', 'zzz-pa-otro@prueba.local',
                                    'role', 'authenticated')::text,
                  true);

do $g$
begin
  perform 1 from public.panel_actividad('zzz-pa-materia', 'zzz-pa-act');
  perform set_config('prueba.g3', 'pasó', true);
exception when insufficient_privilege then
  perform set_config('prueba.g3', 'rechazado', true);
end;
$g$;

insert into res select 12, 'un docente de otra materia tampoco entra', 'rechazado',
  current_setting('prueba.g3', true),
  current_setting('prueba.g3', true) = 'rechazado';

-- ── 13. anon no puede ni ejecutarlas ────────────────────────────────────────
/*
 * Esto mira el GRANT, no la guarda: son dos defensas distintas y las dos tienen
 * que estar. Un create or replace no se lleva los grants, pero la 0023 los
 * reemite igualmente y esto lo confirma.
 */
set local role anon;
do $g$
begin
  perform 1 from public.panel_actividad('zzz-pa-materia', 'zzz-pa-act');
  perform set_config('prueba.g4', 'pasó', true);
exception when insufficient_privilege then
  perform set_config('prueba.g4', 'rechazado', true);
end;
$g$;
reset role;

insert into res select 13, 'anon no puede ejecutar panel_actividad', 'rechazado',
  current_setting('prueba.g4', true),
  current_setting('prueba.g4', true) = 'rechazado';

-- ── Resumen. Única consulta que devuelve filas. ────────────────────────────
select
  n::text                                 as n,
  paso,
  esperado,
  obtenido,
  case when ok then 'OK' else 'FALLA' end as estado
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
