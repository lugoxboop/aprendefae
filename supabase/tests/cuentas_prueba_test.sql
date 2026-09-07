-- ---------------------------------------------------------------------------
-- Prueba de la migración 0020 — las cuentas de prueba fuera de los agregados.
--
-- EL CASO QUE IMPORTA, y por eso el archivo está montado así: se mide TODO dos
-- veces, antes y después de marcar la misma cuenta. Una prueba que solo mirara
-- el estado final no distinguiría "el filtro funciona" de "esa cuenta no tenía
-- datos", que es la forma más fácil de tener un filtro que no filtra nada y no
-- enterarse.
--
-- Las dos mitades del contrato:
--   · marcar CAMBIA los agregados  (pasos 4, 5, 6, 10 y 11)
--   · marcar NO borra la fila      (pasos 7 y 8)
--
-- QUIÉN ES QUIÉN. Un docente zzz y dos estudiantes zzz: uno "real" y otro que
-- se marcará a mitad de la prueba. Los números están elegidos para que la
-- diferencia sea inconfundible —el que se marca tiene el doble de FP y la
-- mitad de acierto— y no un decimal que podría venir de un redondeo.
--
-- No toca a nadie real: usuarios y docente propios zzz-*, y ROLLBACK al final.
-- La marca de lugox173@gmail.com que pone la migración no se altera aquí.
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
values (gen_random_uuid(), 'zzz-real@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-tester@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(etiqueta, uid)
select 'real', id from auth.users where email = 'zzz-real@prueba.local'
union all
select 'test', id from auth.users where email = 'zzz-tester@prueba.local';

insert into public.profiles(user_id, nickname, full_name)
select uid, 'zzz' || etiqueta, 'Zzz ' || etiqueta from ids;

insert into public.docentes(email, nombre, materias, activo)
values ('zzz-doc-prueba@prueba.local', 'Docente', array['zzz-materia'], true);

/*
 * El "real": una evaluativa al 90%, 100 FP, hoy.
 * El "tester": dos evaluativas al 20%, 400 FP en total, hoy.
 * Con los dos dentro, la media de acierto de la cohorte es (90+20+20)/3 = 43,33.
 * Con el tester fuera, es 90 clavado. La diferencia no se puede confundir.
 */
insert into public.fp_history
  (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, correct_pct, created_at)
select uid, 'zzz-act-1', 'zzz-materia', 100, 'medio', 'evaluativa', 90, now() from ids where etiqueta = 'real'
union all
select uid, 'zzz-act-1', 'zzz-materia', 200, 'medio', 'evaluativa', 20, now() from ids where etiqueta = 'test'
union all
select uid, 'zzz-act-2', 'zzz-materia', 200, 'medio', 'evaluativa', 20, now() from ids where etiqueta = 'test';

select set_config('request.jwt.claims',
                  json_build_object('sub', gen_random_uuid(),
                                    'email', 'zzz-doc-prueba@prueba.local',
                                    'role', 'authenticated')::text,
                  true);

-- ── 1. La columna existe, es boolean, not null y con default false ──────────
/*
 * SI FALLARA DE VERDAD: con la columna anulable, cada consulta necesitaría un
 * coalesce y el día que se olvidara uno un estudiante real desaparecería de
 * los promedios. Con default true, TODOS nacerían marcados y el panel saldría
 * vacío. Los dos casos los ve este paso.
 */
insert into res
select 1, 'es_prueba: boolean, not null, default false', 'boolean/NO/false',
  coalesce((select data_type || '/' || is_nullable || '/' || coalesce(column_default, 'sin default')
              from information_schema.columns
             where table_schema = 'public' and table_name = 'profiles'
               and column_name = 'es_prueba'), 'NO EXISTE'),
  exists (select 1 from information_schema.columns
           where table_schema = 'public' and table_name = 'profiles'
             and column_name = 'es_prueba'
             and data_type = 'boolean' and is_nullable = 'NO'
             and column_default like '%false%');

-- ── 2. Nadie nace marcado ───────────────────────────────────────────────────
insert into res
select 2, 'los dos zzz nacen sin marcar', '0 marcados',
  (select count(*) filter (where es_prueba)::text || ' marcados'
     from public.profiles where user_id in (select uid from ids)),
  (select count(*) filter (where es_prueba) = 0
     from public.profiles where user_id in (select uid from ids));

-- ── 3. Y la migración marcó a la cuenta de Mateo ────────────────────────────
/*
 * Si el correo cambiara, o el update de la 0020 se hubiera escrito mal, aquí
 * saldría "sin marcar" y el panel seguiría contaminado en silencio.
 */
insert into res
select 3, 'lugox173@gmail.com quedó marcada por la migración', 'marcada',
  coalesce((select case when p.es_prueba then 'marcada' else 'SIN MARCAR' end
              from public.profiles p join auth.users u on u.id = p.user_id
             where lower(u.email) = 'lugox173@gmail.com'), 'no tiene perfil'),
  coalesce((select p.es_prueba from public.profiles p join auth.users u on u.id = p.user_id
             where lower(u.email) = 'lugox173@gmail.com'), false);

-- ═══════════ FOTO ANTES DE MARCAR ═══════════
create temp table antes_est as select * from public.panel_estudiantes('zzz-materia');
create temp table antes_res as select * from public.panel_resumen('zzz-materia');
create temp table antes_ten as select * from public.panel_tendencia('zzz-materia', 8);

-- ── 4. Con los dos dentro, panel_resumen ve dos estudiantes ────────────────
insert into res
select 4, 'ANTES · panel_resumen cuenta 2 estudiantes', '2',
  (select estudiantes_total::text from antes_res),
  (select estudiantes_total = 2 from antes_res);

-- ── 5. Y la tendencia también ──────────────────────────────────────────────
insert into res
select 5, 'ANTES · panel_tendencia cuenta 2 activos y 3 actividades', '2 y 3',
  coalesce((select sum(estudiantes_activos)::text || ' y ' || sum(actividades)::text from antes_ten), 'NO HAY'),
  (select sum(estudiantes_activos) = 2 and sum(actividades) = 3 from antes_ten);

-- ── 6. Con el tester dentro, la media es 43.33 ─────────────────────────────
insert into res
select 6, 'ANTES · la media de acierto de la tendencia es 43.3', '43.3',
  coalesce((select round(avg(pct_medio), 1)::text from antes_ten), 'NO HAY'),
  (select round(avg(pct_medio), 1) = 43.3 from antes_ten);

-- ═══════════ SE MARCA LA CUENTA ═══════════
update public.profiles set es_prueba = true where user_id = (select uid from ids where etiqueta = 'test');

create temp table despues_est as select * from public.panel_estudiantes('zzz-materia');
create temp table despues_res as select * from public.panel_resumen('zzz-materia');
create temp table despues_ten as select * from public.panel_tendencia('zzz-materia', 8);

-- ── 7. LA MITAD QUE IMPORTA (a): la fila NO desaparece ─────────────────────
/*
 * panel_estudiantes es un censo, no un promedio. Si marcar borrara la fila, no
 * habría forma de comprobar desde la interfaz que la marca está bien puesta.
 *
 * SI FALLARA DE VERDAD: añadir `and not p.es_prueba` al where de
 * panel_estudiantes deja este paso en 1 de 2. Comprobado antes de darlo bueno.
 */
insert into res
select 7, 'DESPUÉS · la fila marcada SIGUE en la lista', '2 filas',
  (select count(*)::text || ' filas' from despues_est),
  (select count(*) = 2 from despues_est);

-- ── 8. Y sale con su marca puesta ──────────────────────────────────────────
insert into res
select 8, 'DESPUÉS · sale con es_prueba = true', 'true',
  coalesce((select es_prueba::text from despues_est
             where user_id = (select uid from ids where etiqueta = 'test')), 'NO ESTÁ'),
  (select es_prueba from despues_est where user_id = (select uid from ids where etiqueta = 'test'));

-- ── 9. Y el estudiante real sigue sin marcar ───────────────────────────────
insert into res
select 9, 'DESPUÉS · el estudiante real sigue sin marcar', 'false',
  coalesce((select es_prueba::text from despues_est
             where user_id = (select uid from ids where etiqueta = 'real')), 'NO ESTÁ'),
  (select not es_prueba from despues_est where user_id = (select uid from ids where etiqueta = 'real'));

-- ── 10. LA MITAD QUE IMPORTA (b): los agregados SÍ cambian ─────────────────
/*
 * SI FALLARA DE VERDAD: quitar el join con profiles del CTE `h` de
 * panel_resumen deja este paso en 2. Es el chequeo que distingue "el filtro
 * funciona" de "esa cuenta no tenía datos".
 */
insert into res
select 10, 'DESPUÉS · panel_resumen baja de 2 estudiantes a 1', 'de 2 a 1',
  (select 'de ' || a.estudiantes_total || ' a ' || d.estudiantes_total
     from antes_res a, despues_res d),
  (select a.estudiantes_total = 2 and d.estudiantes_total = 1
     from antes_res a, despues_res d);

-- ── 11. Y la tendencia se queda con la actividad del real ──────────────────
insert into res
select 11, 'DESPUÉS · la tendencia baja a 1 activo y 1 actividad', '1 y 1',
  coalesce((select sum(estudiantes_activos)::text || ' y ' || sum(actividades)::text from despues_ten), 'NO HAY'),
  (select sum(estudiantes_activos) = 1 and sum(actividades) = 1 from despues_ten);

-- ── 12. La media pasa de 43.3 a 90: el 22% del tester ya no arrastra ───────
/*
 * Este es el número que motivó la migración entera. Que suba de 43,3 a 90 es
 * la prueba de que el filtro hace lo que dice, y no un decimal de redondeo.
 */
insert into res
select 12, 'DESPUÉS · la media de acierto sube de 43.3 a 90.0', 'de 43.3 a 90.0',
  coalesce((select 'de ' || (select round(avg(pct_medio), 1) from antes_ten)
                 || ' a ' || (select round(avg(pct_medio), 1) from despues_ten)), 'NO HAY'),
  (select (select round(avg(pct_medio), 1) from antes_ten) = 43.3
      and (select round(avg(pct_medio), 1) from despues_ten) = 90.0);

-- ── 13. El FP del tester sigue en su sitio: marcar no borra datos ──────────
/*
 * La marca es para los agregados del panel, no una papelera. El estudiante
 * sigue viendo sus FP, su liga y su perfil igual.
 */
insert into res
select 13, 'marcar no toca fp_history: sus 400 FP siguen', '400',
  (select coalesce(sum(fp_awarded), 0)::text from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'test')),
  (select coalesce(sum(fp_awarded), 0) = 400 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'test'));

-- ── 14. Ni su fila de panel_estudiantes pierde sus cifras ─────────────────
insert into res
select 14, 'la fila marcada conserva sus 400 FP y su 20%', '400 y 20',
  coalesce((select fp_total::text || ' y ' || round(pct_evaluativa)::text from despues_est
             where user_id = (select uid from ids where etiqueta = 'test')), 'NO ESTÁ'),
  (select fp_total = 400 and round(pct_evaluativa) = 20 from despues_est
    where user_id = (select uid from ids where etiqueta = 'test'));

-- ── 15. Las tres funciones siguen cerradas a anon ─────────────────────────
/*
 * panel_estudiantes volvió a pasar por drop + create, así que volvió a nacer
 * ejecutable por `public`. Si la 0020 hubiera olvidado el revoke, esto daría 1.
 */
insert into res
select 15, 'anon no puede ejecutar ninguna funcion del panel', '0 con permiso',
  count(*)::text || ' con permiso', count(*) = 0
from (values ('panel_estudiantes(text)'), ('panel_resumen(text)'),
             ('panel_tendencia(text,integer)'), ('panel_historial(text,uuid)')) as f(sig)
where has_function_privilege('anon', 'public.' || f.sig, 'execute');

-- ── 16. Y authenticated sí ────────────────────────────────────────────────
insert into res
select 16, 'authenticated puede ejecutar las cuatro', '4 de 4',
  count(*)::text || ' de 4', count(*) = 4
from (values ('panel_estudiantes(text)'), ('panel_resumen(text)'),
             ('panel_tendencia(text,integer)'), ('panel_historial(text,uuid)')) as f(sig)
where has_function_privilege('authenticated', 'public.' || f.sig, 'execute');

-- ── 17. panel_estudiantes sigue con UNA firma y ahora 20 columnas ─────────
insert into res
select 17, 'panel_estudiantes: una firma y 20 columnas', '1 y 20',
  coalesce((select count(*)::text || ' y ' || max(cardinality(p.proallargtypes) - 1)::text
              from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'panel_estudiantes'), 'NO HAY'),
  (select count(*) = 1 and max(cardinality(p.proallargtypes) - 1) = 20
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'panel_estudiantes');

-- ── Resumen. Única consulta que devuelve filas. ───────────────────────────
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
