-- ---------------------------------------------------------------------------
-- Prueba de la migración 0019 — resumen, historial y la ventana de 14 días.
--
-- POR QUÉ EXISTE, Y QUÉ MIRA DE VERDAD.
--
-- Esta migración hace la cosa que salió mal la semana pasada: tocar una
-- función que está en producción. Allí fue registrar_fp y quedaron dos firmas
-- vivas; aquí el riesgo es el contrario —que un drop deje cero— y uno nuevo:
--
--   DROP FUNCTION SE LLEVA LOS GRANTS. Una función recién creada nace
--   ejecutable por `public`, que en Supabase incluye a `anon`. Si la migración
--   olvidara el revoke, el panel docente entero —con nombres reales de
--   estudiantes— quedaría al alcance de la clave anónima, y NADA FALLARÍA.
--   El paso 4 es el que mira eso, y es el más importante del archivo.
--
-- QUIÉN ES QUIÉN. Se crea un docente zzz y dos estudiantes zzz. El JWT lleva
-- el correo del docente, que es de donde lo saca es_docente().
--
-- LAS LLAMADAS DE DATOS SE HACEN COMO DUEÑO, no como `authenticated`. Las
-- guardas de estas funciones salen del JWT y no del rol de Postgres, así que el
-- rol solo decide si se puede EJECUTAR; eso se mira aparte, en los pasos 4, 5
-- y 21. Crear tablas temporales siendo authenticated es lo que rompió
-- racha_test la primera vez.
--
-- No toca a nadie real: usuarios y docente propios zzz-*, y ROLLBACK al final.
-- La marca ultima_visita de los docentes de verdad no se mueve.
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
values (gen_random_uuid(), 'zzz-alum-a@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-alum-b@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(etiqueta, uid)
select 'a', id from auth.users where email = 'zzz-alum-a@prueba.local'
union all
select 'b', id from auth.users where email = 'zzz-alum-b@prueba.local';

insert into public.profiles(user_id, nickname)
select uid, 'zzzalum' || etiqueta from ids;

insert into public.docentes(email, nombre, materias, activo)
values ('zzz-docente@prueba.local', 'Docente de prueba', array['zzz-materia'], true);

/*
 * Historial sembrado a mano, con fechas controladas:
 *   · act-1  tres intentos (hace 10, 5 y 1 días), aciertos 40, 70, 55
 *   · act-2  un intento hoy, exploratoria sin correct_pct
 *   · racha-3 un bono, que NO debe aparecer en el historial ni contar día
 *   · act-vieja  un intento hace 40 días: fuera de la ventana de 14
 */
insert into public.fp_history
  (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, correct_pct, created_at)
select uid, 'zzz-act-1', 'zzz-materia', 20, 'medio', 'evaluativa', 40, now() - interval '10 days' from ids where etiqueta = 'a'
union all
select uid, 'zzz-act-1', 'zzz-materia', 35, 'medio', 'evaluativa', 70, now() - interval '5 days'  from ids where etiqueta = 'a'
union all
select uid, 'zzz-act-1', 'zzz-materia', 0,  'medio', 'evaluativa', 55, now() - interval '1 days'  from ids where etiqueta = 'a'
union all
select uid, 'zzz-act-2', 'zzz-materia', 50, 'dificil', 'exploratoria', null, now()                from ids where etiqueta = 'a'
union all
select uid, 'racha-3',   'zzz-materia', 15, 'bono', 'racha', null, now()                          from ids where etiqueta = 'a'
union all
select uid, 'zzz-act-vieja', 'zzz-materia', 90, 'experto', 'evaluativa', 100, now() - interval '40 days' from ids where etiqueta = 'a'
union all
select uid, 'zzz-act-1', 'zzz-materia', 25, 'medio', 'evaluativa', 90, now() - interval '2 days'  from ids where etiqueta = 'b';

/* El estudiante B además tiene actividad en OTRA materia, para el paso 9. */
insert into public.fp_history
  (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, correct_pct, created_at)
select uid, 'zzz-otra-act', 'zzz-otra-materia', 10, 'facil', 'evaluativa', 100, now() from ids where etiqueta = 'b';

/* Sesión: el docente zzz. es_docente() saca el correo del JWT, no de un parámetro. */
select set_config('request.jwt.claims',
                  json_build_object('sub', gen_random_uuid(),
                                    'email', 'zzz-docente@prueba.local',
                                    'role', 'authenticated')::text,
                  true);

-- ── 1. La columna existe, es timestamptz, anulable y SIN default ─────────────
/*
 * SI FALLARA DE VERDAD: con un `default now()` la columna nacería con fecha en
 * todos los docentes y el primer delta de cada uno saldría vacío en vez de
 * decir "primera visita". Con `not null` el alter habría reventado sobre las
 * filas existentes. Los dos casos los ve este paso.
 */
insert into res
select 1, 'ultima_visita: timestamptz, anulable, sin default', 'timestamptz/YES/sin default',
  coalesce((select data_type || '/' || is_nullable || '/' || coalesce(column_default, 'sin default')
              from information_schema.columns
             where table_schema = 'public' and table_name = 'docentes'
               and column_name = 'ultima_visita'), 'NO EXISTE'),
  exists (select 1 from information_schema.columns
           where table_schema = 'public' and table_name = 'docentes'
             and column_name = 'ultima_visita'
             and data_type = 'timestamp with time zone'
             and is_nullable = 'YES'
             and column_default is null);

-- ── 2. panel_estudiantes sigue teniendo UNA sola firma ──────────────────────
/*
 * El drop + create de la 0019 no puede haber dejado dos. La lista de
 * argumentos no cambia, así que aquí no cabe el PGRST203 de registrar_fp; lo
 * que se vigila es que no quede ninguna ni sobre alguna.
 */
insert into res
select 2, 'panel_estudiantes tiene exactamente UNA firma', '1',
  count(*)::text, count(*) = 1
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'panel_estudiantes';

-- ── 3. Y devuelve 19 columnas: las 16 de siempre más las 3 nuevas ───────────
insert into res
select 3, 'panel_estudiantes devuelve 19 columnas', '19',
  coalesce((select (cardinality(p.proallargtypes) - 1)::text
              from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'panel_estudiantes'), 'NO HAY'),
  (select cardinality(p.proallargtypes) - 1 = 19
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'panel_estudiantes');

-- ── 4. EL PASO QUE IMPORTA: anon NO puede ejecutar ninguna de las tres ──────
/*
 * El drop de panel_estudiantes se llevó sus grants y la función renació
 * ejecutable por `public`. Si la migración hubiera olvidado el revoke, esto
 * daría 3 y el panel entero estaría abierto con la clave anónima.
 *
 * SI FALLARA DE VERDAD: comentar una línea de revoke en la 0019 hace que este
 * paso cuente esa función. Comprobado antes de darlo por bueno.
 */
insert into res
select 4, 'anon no puede ejecutar ninguna funcion del panel', '0 con permiso',
  count(*)::text || ' con permiso',
  count(*) = 0
from (values ('panel_estudiantes(text)'), ('panel_resumen(text)'), ('panel_historial(text,uuid)')) as f(sig)
where has_function_privilege('anon', 'public.' || f.sig, 'execute');

-- ── 5. Y authenticated sí puede ejecutar las tres ───────────────────────────
insert into res
select 5, 'authenticated puede ejecutar las tres', '3 de 3',
  count(*)::text || ' de 3', count(*) = 3
from (values ('panel_estudiantes(text)'), ('panel_resumen(text)'), ('panel_historial(text,uuid)')) as f(sig)
where has_function_privilege('authenticated', 'public.' || f.sig, 'execute');

-- ── 6. Primera visita: desde = null y la marca queda puesta ─────────────────
/*
 * Las llamadas de datos se hacen como dueño. Las guardas de estas funciones
 * salen del JWT —es_docente() lee auth.jwt() ->> 'email'— y no del rol de
 * Postgres, así que el rol solo decide si se puede EJECUTAR. Eso se comprueba
 * aparte, en los pasos 4, 5 y 21. Crear tablas temporales siendo
 * `authenticated` es justo lo que rompió racha_test la primera vez.
 */
create temp table primera as select * from public.panel_resumen('zzz-materia');

insert into res
select 6, 'primera visita: desde es null', 'null',
  coalesce((select desde::text from primera), 'null'),
  (select desde is null from primera);

insert into res
select 7, 'y la marca queda escrita', 'escrita',
  coalesce((select case when ultima_visita is null then 'sin escribir' else 'escrita' end
              from public.docentes where email = 'zzz-docente@prueba.local'), 'NO ESTA'),
  (select ultima_visita is not null from public.docentes where email = 'zzz-docente@prueba.local');

-- ── 8. LA VENTANA DE GRACIA: volver a llamar no mueve la marca ──────────────
/*
 * Es el mecanismo que sostiene las cuatro promesas de la propuesta: la
 * distracción, la recarga, el misclic y el doble montaje de StrictMode.
 *
 * SI FALLARA DE VERDAD: quitar la condición `and (ultima_visita is null or
 * ultima_visita < now() - interval '30 minutes')` del update hace que la marca
 * avance en la segunda llamada y este paso lo dice. Comprobado.
 */
create temp table marca_1 as
  select ultima_visita from public.docentes where email = 'zzz-docente@prueba.local';

create temp table segunda as select * from public.panel_resumen('zzz-materia');

insert into res
select 8, 'segunda llamada seguida NO mueve la marca', 'igual',
  (select case when d.ultima_visita = m.ultima_visita then 'igual' else 'SE MOVIO' end
     from public.docentes d, marca_1 m where d.email = 'zzz-docente@prueba.local'),
  (select d.ultima_visita = m.ultima_visita
     from public.docentes d, marca_1 m where d.email = 'zzz-docente@prueba.local');

-- ── 9. Pasados los 30 minutos, sí avanza ───────────────────────────────────
update public.docentes
   set ultima_visita = now() - interval '45 minutes'
 where email = 'zzz-docente@prueba.local';

create temp table tercera as select * from public.panel_resumen('zzz-materia');

insert into res
select 9, 'con la marca vieja (45 min) si avanza', 'avanzo',
  (select case when ultima_visita > now() - interval '5 minutes' then 'avanzo' else 'NO AVANZO' end
     from public.docentes where email = 'zzz-docente@prueba.local'),
  (select ultima_visita > now() - interval '5 minutes'
     from public.docentes where email = 'zzz-docente@prueba.local');

-- ── 10. El historial agrupa por actividad ──────────────────────────────────
/*
 * act-1 tiene TRES intentos del estudiante A. Si el historial devolviera una
 * fila por intento, esto contaría 3 filas en vez de 1 con intentos = 3.
 */
create temp table hist as
  select * from public.panel_historial('zzz-materia', (select uid from ids where etiqueta = 'a'));

insert into res
select 10, 'act-1: una sola fila con intentos = 3', '1 fila / 3 intentos',
  coalesce((select count(*)::text || ' fila / ' || max(intentos)::text || ' intentos'
              from hist where activity_id = 'zzz-act-1'), 'NO HAY'),
  (select count(*) = 1 and max(intentos) = 3 from hist where activity_id = 'zzz-act-1');

-- ── 11. mejor_pct es el máximo, no el último ni la media ───────────────────
insert into res
select 11, 'act-1: mejor_pct es 70, el maximo de 40/70/55', '70',
  coalesce((select mejor_pct::text from hist where activity_id = 'zzz-act-1'), 'NO HAY'),
  (select mejor_pct = 70 from hist where activity_id = 'zzz-act-1');

-- ── 12. Y mejor_fp va aparte: 35, el mayor de 20/35/0 ──────────────────────
insert into res
select 12, 'act-1: mejor_fp es 35 y fp_total 55', '35 y 55',
  coalesce((select mejor_fp::text || ' y ' || fp_total::text from hist where activity_id = 'zzz-act-1'), 'NO HAY'),
  (select mejor_fp = 35 and fp_total = 55 from hist where activity_id = 'zzz-act-1');

-- ── 13. La exploratoria sin correct_pct no rompe nada ──────────────────────
insert into res
select 13, 'act-2 exploratoria: mejor_pct null, mejor_fp 50', 'null y 50',
  coalesce((select coalesce(mejor_pct::text, 'null') || ' y ' || mejor_fp::text
              from hist where activity_id = 'zzz-act-2'), 'NO HAY'),
  (select mejor_pct is null and mejor_fp = 50 from hist where activity_id = 'zzz-act-2');

-- ── 14. Los bonos de racha NO aparecen ─────────────────────────────────────
/*
 * Filtrados por `modality <> 'racha'`, no por un like sobre el activity_id.
 * SI FALLARA DE VERDAD: quitar esa condición del where hace aparecer la fila
 * 'racha-3' y este paso la cuenta.
 */
insert into res
select 14, 'los bonos racha-N no salen en el historial', '0',
  (select count(*)::text from hist where activity_id like 'racha-%'),
  (select count(*) = 0 from hist where activity_id like 'racha-%');

-- ── 15. primer_intento y ultimo_intento son distintos donde debe ───────────
insert into res
select 15, 'act-1: primer y ultimo intento separados 9 dias', 'separados',
  coalesce((select case when ultimo_intento - primer_intento > interval '8 days'
                        then 'separados' else 'JUNTOS' end
              from hist where activity_id = 'zzz-act-1'), 'NO HAY'),
  (select ultimo_intento - primer_intento > interval '8 days'
     from hist where activity_id = 'zzz-act-1');

-- ── 16. Pedir a alguien de OTRA materia devuelve cero filas, no datos ──────
/*
 * p_user lo pone el cliente y no lleva guarda propia. El filtro por materia es
 * lo que impide pescar: el estudiante B tiene historial en 'zzz-otra-materia',
 * y pedirlo desde 'zzz-materia' no puede devolver esa fila.
 */
create temp table ajeno as
  select * from public.panel_historial('zzz-materia', (select uid from ids where etiqueta = 'b'));

insert into res
select 16, 'el historial no filtra datos de otra materia', 'solo lo de esta materia',
  (select coalesce(string_agg(activity_id, ', '), 'ninguna') from ajeno),
  (select count(*) filter (where activity_id = 'zzz-otra-act') = 0 from ajeno);

-- ── 17. La ventana de 14 dias: dias activos ────────────────────────────────
/*
 * El estudiante A tiene actividad hace 10, 5, 2(no), 1 y 0 días, más una hace
 * 40 que queda fuera, más el bono de racha de hoy que NO cuenta como día.
 * Días distintos dentro de la ventana: hace 10, hace 5, hace 1 y hoy = 4.
 */
create temp table est as select * from public.panel_estudiantes('zzz-materia');

insert into res
select 17, 'A: 4 dias activos en la ventana de 14', '4',
  coalesce((select dias_activos_14d::text from est
             where user_id = (select uid from ids where etiqueta = 'a')), 'NO HAY'),
  (select dias_activos_14d = 4 from est
    where user_id = (select uid from ids where etiqueta = 'a'));

-- ── 18. Y las evaluativas de la ventana excluyen la de hace 40 dias ────────
/*
 * A tiene cuatro evaluativas en total (40, 70, 55 y la vieja de 100). Dentro
 * de la ventana solo las tres primeras: media 55.
 * SI FALLARA DE VERDAD: sin el filtro `created_at >= v_14d` entrarían las
 * cuatro y la media saldría 66,25.
 */
insert into res
select 18, 'A: 3 evaluativas en la ventana, media 55', '3 y 55.00',
  coalesce((select n_evaluativas_14d::text || ' y ' || round(pct_evaluativa_14d, 2)::text
              from est where user_id = (select uid from ids where etiqueta = 'a')), 'NO HAY'),
  (select n_evaluativas_14d = 3 and round(pct_evaluativa_14d, 2) = 55.00
     from est where user_id = (select uid from ids where etiqueta = 'a'));

-- ── 19. Lo de siempre sigue igual: la columna de todo el historial ─────────
/*
 * EL CHEQUEO ANTIRREGRESIÓN. panel_estudiantes se reemplazó entera; si la
 * derivación hubiera salido mal, esto es lo que lo delata. A tiene cuatro
 * evaluativas en TODO el historial: media (40+70+55+100)/4 = 66,25.
 */
insert into res
select 19, 'pct_evaluativa (todo el historial) sigue en 66.25', '4 y 66.25',
  coalesce((select n_evaluativas::text || ' y ' || round(pct_evaluativa, 2)::text
              from est where user_id = (select uid from ids where etiqueta = 'a')), 'NO HAY'),
  (select n_evaluativas = 4 and round(pct_evaluativa, 2) = 66.25
     from est where user_id = (select uid from ids where etiqueta = 'a'));

-- ── 20. Y el FP total tampoco se movió ─────────────────────────────────────
insert into res
select 20, 'fp_total de A sigue siendo 210 (bono incluido)', '210',
  coalesce((select fp_total::text from est
             where user_id = (select uid from ids where etiqueta = 'a')), 'NO HAY'),
  (select fp_total = 210 from est
    where user_id = (select uid from ids where etiqueta = 'a'));

-- ── 21. Las dos guardas siguen cerradas para quien no es docente ───────────
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'a'),
                                    'email', 'zzz-alum-a@prueba.local',
                                    'role', 'authenticated')::text,
                  true);

set local role authenticated;
do $g$
begin
  perform 1 from public.panel_historial('zzz-materia', '00000000-0000-0000-0000-000000000000');
  perform set_config('prueba.guarda', 'ABIERTA', true);
exception when others then
  perform set_config('prueba.guarda', 'rechazado', true);
end;
$g$;
reset role;

insert into res select 21, 'un estudiante no puede llamar a panel_historial', 'rechazado',
  current_setting('prueba.guarda', true),
  current_setting('prueba.guarda', true) = 'rechazado';

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
