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
-- SATISFECHAS. Eso es lo que hacen los pasos 1 y 2.
--
-- ═══════════ Y EJECUTAR NO BASTA: HAY QUE MIRAR LO QUE DEVUELVE ═══════════
--
-- La primera versión de este archivo solo comprobaba que panel_items devolviera
-- dos filas. Devolvió CERO, y cero no es un error: no revienta, no avisa, y el
-- panel lo pintaría como "todavía no hay nada que diagnosticar". Otra vez la
-- misma forma.
--
-- La causa era de la siembra, no de la función, y queda escrita porque es fácil
-- volver a caer. HAY TRES FORMAS DE CONTAR "intentos con captura" Y DAN
-- NÚMEROS DISTINTOS con exactamente los mismos datos:
--
--     filas de fp_detalle .............. 8   (4 intentos × 2 ítems)
--     estudiantes distintos ............ 3   (a, b, c)
--     intentos con al menos un ítem .... 4   <- ESTO es lo que cuenta
--
-- panel_items hace `count(distinct d.fp_history_id)`: cuenta INTENTOS que
-- dejaron detalle, ni filas ni personas. Se sembraron cuatro creyendo que eran
-- seis, el mínimo son cinco, y la función devolvió pronto y en silencio.
--
-- Ahora se siembran cinco —justo el mínimo, para que el paso 2 esté EN el borde
-- y compruebe que el corte es "menos de 5" y no "5 o menos"— y los pasos 4 y 5
-- miran el CONTENIDO de las dos filas, no su número.
--
-- ═══════════ CÓMO SE SIEMBRA LA SESIÓN ═══════════
--
-- es_docente() y materias_docente() sacan el correo del JWT, no de un
-- parámetro, así que basta con poner request.jwt.claims. Las llamadas de datos
-- se hacen como DUEÑO y no como `authenticated`: el rol solo decide si se puede
-- ejecutar, y eso se mira aparte en los pasos 17 a 21.
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
       (gen_random_uuid(), 'zzz-pa-p@prueba.local', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-pa-f@prueba.local', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(etiqueta, uid)
select 'a', id from auth.users where email = 'zzz-pa-a@prueba.local'
union all select 'b', id from auth.users where email = 'zzz-pa-b@prueba.local'
union all select 'c', id from auth.users where email = 'zzz-pa-c@prueba.local'
union all select 'p', id from auth.users where email = 'zzz-pa-p@prueba.local'
union all select 'f', id from auth.users where email = 'zzz-pa-f@prueba.local';

/* Tres estudiantes reales y uno marcado como cuenta de prueba. */
insert into public.profiles(user_id, nickname, es_prueba)
select uid, 'zzzpa' || etiqueta, etiqueta = 'p' from ids;

insert into public.docentes(email, nombre, materias, activo)
values ('zzz-pa-doc@prueba.local', 'Docente de prueba', array['zzz-pa-materia'], true);

/*
 * Al grupo entran a, b, c y la cuenta de prueba —esta última para comprobar
 * que no cuenta en los promedios ni estando dentro—. `f` se queda FUERA a
 * propósito: tiene actividad en la materia pero no es del grupo del docente.
 *
 * Es la única forma de comprobar que las dos poblaciones de la vista son
 * distintas de verdad: los agregados de panel_actividad cuentan a `f` y la
 * tabla de panel_grupo_actividad no debe enseñarlo.
 */
insert into public.docente_grupo(docente_email, subject_id, user_id)
select 'zzz-pa-doc@prueba.local', 'zzz-pa-materia', uid from ids where etiqueta <> 'f';

/*
 * Historial de zzz-pa-act, evaluativa. CINCO intentos reales:
 *
 *   a  50 y 92   -> su mejor es 92, banda alta   · en el grupo
 *   b  70 y 60   -> su mejor es 70, banda media  · en el grupo
 *   c  30        -> banda baja                   · en el grupo
 *   f  45        -> banda baja                   · FUERA del grupo
 *   p  100       -> cuenta de prueba: no cuenta en nada
 *
 * Y un bono de racha de `a`, que no es un intento.
 *
 * Cinco es el mínimo exacto de panel_items, y está puesto ahí a propósito: si
 * el corte se escribiera como "5 o menos" en vez de "menos de 5", el paso 2 se
 * pondría en rojo.
 */
insert into public.fp_history
  (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, correct_pct, duration_ms, created_at)
select uid, 'zzz-pa-act', 'zzz-pa-materia', 20, 'medio', 'evaluativa',  50, 100000, now() - interval '3 days' from ids where etiqueta = 'a'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 40, 'medio', 'evaluativa',  92, 200000, now() - interval '1 days' from ids where etiqueta = 'a'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 30, 'medio', 'evaluativa',  70, 300000, now() from ids where etiqueta = 'b'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 20, 'medio', 'evaluativa',  60, 200000, now() - interval '2 days' from ids where etiqueta = 'b'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 10, 'medio', 'evaluativa',  30, 400000, now() from ids where etiqueta = 'c'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 99, 'medio', 'evaluativa', 100, 999000, now() from ids where etiqueta = 'p'
union all
select uid, 'zzz-pa-act', 'zzz-pa-materia', 15, 'medio', 'evaluativa',  45, 500000, now() from ids where etiqueta = 'f'
union all
select uid, 'racha-3',    'zzz-pa-materia', 15, 'bono',  'racha',     null,   null, now() from ids where etiqueta = 'a';

/*
 * Detalle: DOS ÍTEMS EN CADA UNO de los cinco intentos reales.
 *
 *   p1  fallado siempre, y siempre con la misma respuesta equivocada
 *   p2  acertado siempre
 *
 * Así el paso 4 recorre el camino con respuesta_top y el 5 el camino SIN ella
 * —el LEFT JOIN de la función—, que es donde un INNER JOIN mal puesto haría
 * desaparecer justo los ítems que nadie falla.
 *
 * La cuenta de prueba NO deja detalle: si lo dejara y la función no la
 * excluyera, los recuentos del paso 4 saldrían en 6 en vez de 5.
 */
insert into public.fp_detalle(fp_history_id, user_id, activity_id, item_id, acerto, intentos, respuesta)
select h.id, h.user_id, h.activity_id, i.item, i.ok, 1, case when i.ok then null else 'confunde-con-esto' end
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
 * EL PASO QUE FALTABA EN LA 0021. Con aquella versión esto levanta 42702 y
 * `obtenido` sale con el mensaje de Postgres en vez de '1'.
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

-- ── 2. panel_items EJECUTA Y DEVUELVE SUS DOS ÍTEMS ─────────────────────────
/*
 * SI ESTO DA 0: o la siembra no llega al mínimo —ver la nota de las tres formas
 * de contar, arriba— o la función devuelve vacío por otra razón. El paso 3
 * separa las dos cosas: dice cuántos intentos con captura ve el servidor.
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

-- ── 3. Las dos funciones cuentan los intentos con captura IGUAL ─────────────
/*
 * panel_items decide con `count(distinct fp_history_id)` si hay bastante para
 * diagnosticar; panel_actividad devuelve ese mismo número en
 * `intentos_con_detalle` para que el cliente explique por qué la sección está
 * vacía. Si los dos se separaran, el panel podría decir "hacen falta 5 y hay 7"
 * y no enseñar nada — un mensaje que se contradice solo.
 *
 * Las dos consultas NO son idénticas: la de panel_items cruza con fp_history
 * para acotar la materia y la de panel_actividad no, porque activity_id es
 * único en el catálogo. Hoy dan lo mismo; esto lo comprueba en vez de suponerlo.
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

insert into res select 3, 'intentos_con_detalle coincide con lo que mira panel_items', '5',
  (select coalesce(intentos_con_detalle::text, 'NULO') from pa),
  (select intentos_con_detalle = 5 from pa);

-- ── 4 y 5. El CONTENIDO de panel_items, no su número ────────────────────────
/*
 * Que devuelva dos filas no basta: podrían venir con ceros. Estos dos pasos
 * miran los números que se calculan a mano desde la siembra.
 */
create temp table pit(
  item_id             text,
  veces               integer,
  fallos              integer,
  pct_fallo           numeric,
  respuesta_top       text,
  respuesta_top_veces integer
) on commit drop;

do $x$
begin
  insert into pit select * from public.panel_items('zzz-pa-materia', 'zzz-pa-act');
exception when others then
  null;
end;
$x$;

insert into res select 4, 'el ítem siempre fallado trae sus cinco fallos y su respuesta',
  '5 de 5 · 100.0 · confunde-con-esto x5',
  coalesce((select fallos || ' de ' || veces || ' · ' || pct_fallo || ' · ' ||
                   coalesce(respuesta_top, 'SIN RESPUESTA') || ' x' || coalesce(respuesta_top_veces::text, '0')
              from pit where item_id = 'p1'), 'NO ESTÁ'),
  coalesce((select veces = 5 and fallos = 5 and pct_fallo = 100.0
                   and respuesta_top = 'confunde-con-esto' and respuesta_top_veces = 5
              from pit where item_id = 'p1'), false);

insert into res select 5, 'el ítem siempre acertado NO desaparece, y viene sin respuesta_top',
  '0 de 5 · 0.0 · sin respuesta',
  coalesce((select fallos || ' de ' || veces || ' · ' || pct_fallo || ' · ' ||
                   coalesce(respuesta_top, 'sin respuesta')
              from pit where item_id = 'p2'), 'NO ESTÁ'),
  coalesce((select veces = 5 and fallos = 0 and pct_fallo = 0.0 and respuesta_top is null
              from pit where item_id = 'p2'), false);

-- ── 6 a 12. Las cifras de panel_actividad son las sembradas ────────────────
/*
 * completaron = 4 (a, b, c, f) y NO 5: la cuenta de prueba no cuenta. Sí
 *               cuenta `f`, que no es del grupo: los agregados son de la
 *               materia, no del grupo.
 * intentos    = 6 y NO 7: el bono de racha no es un intento.
 * pct_medio   = (92 + 70 + 30 + 45) / 4 = 59,25 -> 59,3 — el MEJOR de cada
 * estudiante, incluido el que no es del grupo.
 */
insert into res select 6, 'completaron cuenta a los de dentro Y fuera del grupo, sin cuentas de prueba', '4',
  (select coalesce(completaron::text, 'NULO') from pa),
  (select completaron = 4 from pa);

insert into res select 7, 'intentos excluye el bono de racha y la cuenta de prueba', '6',
  (select coalesce(intentos::text, 'NULO') from pa),
  (select intentos = 6 from pa);

insert into res select 8, 'pct_medio usa el MEJOR intento de cada estudiante', '59.3',
  (select coalesce(pct_medio::text, 'NULO') from pa),
  (select pct_medio = 59.3 from pa);

insert into res select 9, 'modality y difficulty salen resueltas, no nulas', 'evaluativa / medio',
  (select coalesce(modality, 'NULO') || ' / ' || coalesce(difficulty, 'NULO') from pa),
  (select modality = 'evaluativa' and difficulty = 'medio' from pa);

insert into res select 10, 'el tiempo medio ignora el bono y la cuenta de prueba', '283333',
  (select coalesce(duracion_media_ms::text, 'NULO') from pa),
  (select duracion_media_ms = 283333 from pa);

insert into res select 11, 'el FP medio ignora el bono y la cuenta de prueba', '22.5',
  (select coalesce(fp_medio::text, 'NULO') from pa),
  (select fp_medio = 22.5 from pa);

/*
 * EL UMBRAL DE CELDA SE RETIRÓ EN LA 0024, y este paso es el que lo comprueba.
 *
 * Antes, con bandas de una persona los tres recuentos volvían en NULL. Ahora
 * se devuelven: 1 alta (92), 1 media (70) y 2 bajas (30 y 45). Si alguien
 * repusiera el umbral sin querer, esto se pondría en rojo con los tres en
 * null, que es exactamente lo que hay que ver.
 *
 * La decisión y su razón están escritas encima de la función en la 0024.
 */
insert into res select 12, 'sin umbral de celda, la distribución se devuelve entera', 'true / 1-1-2',
  (select coalesce(distribucion_visible::text, 'NULO') || ' / ' ||
          coalesce(banda_alta::text, 'null') || '-' || coalesce(banda_media::text, 'null') || '-' ||
          coalesce(banda_baja::text, 'null') from pa),
  (select distribucion_visible = true and banda_alta = 1 and banda_media = 1 and banda_baja = 2 from pa);

-- ── 13 a 16. panel_grupo_actividad: quién es quién ─────────────────────────
/*
 * LA TABLA HABLA DEL GRUPO CURADO; LOS AGREGADOS DE ARRIBA, DE LA MATERIA.
 * Son dos poblaciones distintas y estos pasos lo comprueban: `f` cuenta en
 * completaron y en las bandas, y NO puede aparecer aquí.
 *
 * La cuenta de prueba SÍ aparece, marcada. Es lo decidido para el panel
 * principal y aquí se mantiene: la fila se enseña con su distintivo en vez de
 * desaparecer, y sigue fuera de todos los promedios.
 */
create temp table pg(
  user_id   uuid,
  nickname  text,
  full_name text,
  es_prueba boolean,
  mejor_pct numeric,
  fp_total  bigint,
  intentos  integer,
  ultimo    timestamptz
) on commit drop;

do $x$
begin
  insert into pg select * from public.panel_grupo_actividad('zzz-pa-materia', 'zzz-pa-act');
exception when others then
  perform set_config('prueba.pg_error', sqlstate || ': ' || sqlerrm, true);
end;
$x$;

insert into res select 13, 'panel_grupo_actividad se ejecuta y devuelve el grupo (con la de prueba)', '4',
  coalesce(current_setting('prueba.pg_error', true), (select count(*)::text from pg)),
  (select count(*) = 4 from pg);

insert into res select 14, 'el estudiante de fuera del grupo NO aparece en la tabla', 'no está',
  coalesce((select 'SÍ ESTÁ' from pg where nickname = 'zzzpaf'), 'no está'),
  not exists (select 1 from pg where nickname = 'zzzpaf');

/*
 * El contenido de una fila, calculado a mano: `a` tiene dos intentos (50 y 92),
 * su mejor es 92 y sus FP son 20 + 40 = 60. Sumados, no el mejor: el motor paga
 * la primera vez y las repeticiones dan cero, así que sumar es lo que responde
 * "cuántos FP le dio esto".
 */
insert into res select 15, 'la fila de un estudiante trae mejor_pct, FP sumados e intentos', '92 / 60 / 2',
  coalesce((select mejor_pct::text || ' / ' || fp_total::text || ' / ' || intentos::text
              from pg where nickname = 'zzzpaa'), 'NO ESTÁ'),
  coalesce((select mejor_pct = 92 and fp_total = 60 and intentos = 2
              from pg where nickname = 'zzzpaa'), false);

/*
 * Y el orden: de menor a mayor acierto, porque la pregunta que trae aquí a un
 * docente es a quién acompañar. El primero tiene que ser `c`, con 30.
 */
insert into res select 16, 'la tabla ordena de menor a mayor acierto', 'zzzpac',
  coalesce((select nickname from pg limit 1), 'VACÍA'),
  (select nickname = 'zzzpac' from pg limit 1);

-- ── 17 a 20. Las guardas siguen cerradas ────────────────────────────────────
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

/* La función nueva lleva las mismas dos guardas, y hay que comprobarlo. */
do $g$
begin
  perform 1 from public.panel_grupo_actividad('zzz-pa-materia', 'zzz-pa-act');
  perform set_config('prueba.g5', 'pasó', true);
exception when insufficient_privilege then
  perform set_config('prueba.g5', 'rechazado', true);
end;
$g$;

insert into res select 17, 'un estudiante no puede leer panel_actividad', 'rechazado',
  current_setting('prueba.g1', true),
  current_setting('prueba.g1', true) = 'rechazado';

insert into res select 18, 'un estudiante no puede leer panel_items', 'rechazado',
  current_setting('prueba.g2', true),
  current_setting('prueba.g2', true) = 'rechazado';

insert into res select 19, 'un estudiante no puede leer la tabla de nombres', 'rechazado',
  current_setting('prueba.g5', true),
  current_setting('prueba.g5', true) = 'rechazado';

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

insert into res select 20, 'un docente de otra materia tampoco entra', 'rechazado',
  current_setting('prueba.g3', true),
  current_setting('prueba.g3', true) = 'rechazado';

/*
 * Y el GRANT, que es una defensa distinta de la guarda: create or replace no se
 * lleva los permisos, pero la 0023 los reemite igual y esto lo confirma.
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

insert into res select 21, 'anon no puede ejecutar panel_actividad', 'rechazado',
  current_setting('prueba.g4', true),
  current_setting('prueba.g4', true) = 'rechazado';

-- ── Resumen. Única consulta que devuelve filas. ────────────────────────────
/*
 * `lpad` para que el orden sea 01, 02, ... 16 y no 1, 10, 11, ... 2: la
 * columna es texto porque la última fila dice TOTAL, y ordenar texto pone el 10
 * antes que el 2. Con dieciséis pasos ya se nota.
 */
select
  lpad(n::text, 2, '0')                   as n,
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
