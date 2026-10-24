-- ---------------------------------------------------------------------------
-- Prueba de la migración 0033 — El Repaso Diario.
--
-- LO QUE MÁS IMPORTA son los pasos 6, 8 y 11, las dos caras de la marca
-- «renovable a diario»:
--   · el Repaso paga la primera vez de cada día y no la segunda del mismo día
--     (6 y 8);
--   · y una actividad SIN la marca sigue sin pagar al repetirse otro día (11):
--     registrar_fp se reemplazó entera, y si la condición nueva se hubiera
--     escrito mal, todas las actividades del sitio volverían a pagar cada día.
--
-- Los días se simulan moviendo hacia atrás, como dueño, el created_at de las
-- filas de ESTE usuario de prueba y su last_activity_day —igual que
-- racha_test—. Dentro de la transacción now() no avanza, así que «ayer» es
-- mover la fila, no esperar.
--
-- QUIÉN ES QUIÉN. Solo se cambia a `authenticated` para llamar a las funciones
-- que usan auth.uid(); lo que se lee así sale por set_config, nunca con un
-- insert a `res` (ver detalle_test).
--
-- No toca a nadie real: usuarios zzz-*, una actividad zzz y ROLLBACK al final.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(etiqueta text, uid uuid) on commit drop;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-repaso-a@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-repaso-b@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids select 'a', id from auth.users where email = 'zzz-repaso-a@prueba.local';
insert into ids select 'b', id from auth.users where email = 'zzz-repaso-b@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzrepaso' || etiqueta from ids;

/* Una actividad normal, sin la marca, para el paso 11. Medio y base 25, como las de verdad. */
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('zzz-no-renovable', 'zzz-materia', 'zzz-tema', 'evaluativa', 'medio', 25);

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'a'), 'role', 'authenticated')::text,
                  true);

-- ── 1. La marca existe y solo la lleva el Repaso ───────────────────────────
-- Desde la 0152 son dos: el de Macro y el de Contabilidad, y ninguna más.
insert into res select 1, 'renovable_diario solo en los dos Repasos', 'repaso-diario, repaso-diario-contabilidad',
  coalesce((select string_agg(activity_id, ', ' order by activity_id)
              from public.actividad_catalogo where renovable_diario), 'ninguna'),
  (select coalesce(array_agg(activity_id order by activity_id), '{}') = array['repaso-diario', 'repaso-diario-contabilidad']
     from public.actividad_catalogo where renovable_diario);

-- ── 2. La fila del catálogo ────────────────────────────────────────────────
insert into res select 2, 'repaso-diario: evaluativa, medio, base 60', 'evaluativa/medio/60',
  (select modalidad || '/' || dificultad || '/' || fp_base from public.actividad_catalogo where activity_id = 'repaso-diario'),
  (select modalidad = 'evaluativa' and dificultad = 'medio' and fp_base = 60 and etapas = 1
     from public.actividad_catalogo where activity_id = 'repaso-diario');

-- ── El ítem ya visto en su actividad, hace dos días, bien ──────────────────
set local role authenticated;
select public.registrar_fp('sala-monitores', 200000, 100, '[{"item":"hospital","ok":true,"intentos":1,"orden":1}]'::jsonb);
reset role;
update public.fp_detalle set created_at = created_at - interval '2 days'
 where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'sala-monitores';

-- ── 3. Primer repaso del día: 6 de 10 → 36 FP ──────────────────────────────
set local role authenticated;
select public.registrar_fp('repaso-diario', 60000, 60, '[
  {"item":"sala-monitores:hospital","ok":false,"intentos":1,"respuesta":"I","orden":1},
  {"item":"que-rama-es:iva","ok":true,"intentos":1,"respuesta":"fiscal","orden":2}
]'::jsonb);
reset role;

insert into res select 3, 'el primer repaso del día paga base 60 × 60 %', '36',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario'),
  (select fp_awarded = 36 and repeat_index = 0 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario');

-- ── 4. La racha se alimenta sola ───────────────────────────────────────────
insert into res select 4, 'la actividad del día deja la racha en 1', '1',
  (select streak::text from public.profiles where user_id = (select uid from ids where etiqueta = 'a')),
  (select streak = 1 from public.profiles where user_id = (select uid from ids where etiqueta = 'a'));

-- ── 5. El historial junta la actividad de origen y el Repaso ───────────────
set local role authenticated;
select set_config('prueba.historial',
  coalesce((select veces || '/' || ultimo_ok from public.repaso_historial() where clave = 'sala-monitores:hospital'), 'sin fila'),
  true);
select set_config('prueba.claves', (select count(*)::text from public.repaso_historial()), true);
select set_config('prueba.hoy', public.repaso_hecho_hoy()::text, true);
reset role;

insert into res select 5, 'sala-monitores:hospital: 2 encuentros, el último mal', '2/false',
  current_setting('prueba.historial'), current_setting('prueba.historial') = '2/false';

insert into res select 6, 'dos claves en el historial (hospital e iva), sin duplicar', '2',
  current_setting('prueba.claves'), current_setting('prueba.claves') = '2';

insert into res select 7, 'repaso_hecho_hoy después del repaso', 'true',
  current_setting('prueba.hoy'), current_setting('prueba.hoy') = 'true';

-- ── 8. Otro repaso el MISMO día no paga ────────────────────────────────────
set local role authenticated;
select public.registrar_fp('repaso-diario', 60000, 100, null);
reset role;

insert into res select 8, 'el segundo repaso del mismo día paga 0', '0',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario'
    order by id desc limit 1),
  (select fp_awarded = 0 and repeat_index = 1 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario'
    order by id desc limit 1);

-- ── Pasa la noche ──────────────────────────────────────────────────────────
update public.fp_history set created_at = created_at - interval '1 day'
 where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario';
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids where etiqueta = 'a');

set local role authenticated;
select set_config('prueba.hoy', public.repaso_hecho_hoy()::text, true);
select public.registrar_fp('repaso-diario', 60000, 100, null);
reset role;

insert into res select 9, 'al día siguiente repaso_hecho_hoy vuelve a false', 'false',
  current_setting('prueba.hoy'), current_setting('prueba.hoy') = 'false';

insert into res select 10, 'al día siguiente el repaso vuelve a pagar: 10 de 10 → 60', '60',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario'
    order by id desc limit 1),
  (select fp_awarded = 60 and repeat_index = 0 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario'
    order by id desc limit 1);

insert into res select 11, 'y la racha sube a 2', '2',
  (select streak::text from public.profiles where user_id = (select uid from ids where etiqueta = 'a')),
  (select streak = 2 from public.profiles where user_id = (select uid from ids where etiqueta = 'a'));

-- ── 12. El tiempo mínimo es el de Medio: 45 s ──────────────────────────────
update public.fp_history set created_at = created_at - interval '1 day'
 where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario';
update public.profiles set last_activity_day = last_activity_day - 1
 where user_id = (select uid from ids where etiqueta = 'a');

set local role authenticated;
select public.registrar_fp('repaso-diario', 10000, 100, null);
reset role;

insert into res select 12, 'un repaso en 10 s cae a la defensa de tiempo: 60 × 0,6', '36',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario'
    order by id desc limit 1),
  (select fp_awarded = 36 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'repaso-diario'
    order by id desc limit 1);

-- ── 13. LO DE SIEMPRE SIGUE IGUAL: sin la marca, repetir otro día no paga ──
set local role authenticated;
select public.registrar_fp('zzz-no-renovable', 60000, 100, null);
reset role;
update public.fp_history set created_at = created_at - interval '3 days'
 where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'zzz-no-renovable';
set local role authenticated;
select public.registrar_fp('zzz-no-renovable', 60000, 100, null);
reset role;

insert into res select 13, 'una actividad sin la marca, repetida días después, paga 25 y luego 0', '25, 0',
  (select string_agg(fp_awarded::text, ', ' order by id) from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'zzz-no-renovable'),
  (select array_agg(fp_awarded order by id) = array[25, 0] from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a') and activity_id = 'zzz-no-renovable');

-- ── 14. El historial es de cada uno ────────────────────────────────────────
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'b'), 'role', 'authenticated')::text,
                  true);
set local role authenticated;
select set_config('prueba.ajeno', (select count(*)::text from public.repaso_historial()), true);
select set_config('prueba.ajeno_hoy', public.repaso_hecho_hoy()::text, true);
reset role;

insert into res select 14, 'otro estudiante no ve el historial de A ni su repaso de hoy', '0/false',
  current_setting('prueba.ajeno') || '/' || current_setting('prueba.ajeno_hoy'),
  current_setting('prueba.ajeno') = '0' and current_setting('prueba.ajeno_hoy') = 'false';

-- ── 15. anon no puede llamar a las lecturas ────────────────────────────────
insert into res select 15, 'anon no ejecuta repaso_historial ni repaso_hecho_hoy', 'false/false',
  has_function_privilege('anon', 'public.repaso_historial()', 'execute')::text || '/' ||
  has_function_privilege('anon', 'public.repaso_hecho_hoy()', 'execute')::text,
  not has_function_privilege('anon', 'public.repaso_historial()', 'execute')
  and not has_function_privilege('anon', 'public.repaso_hecho_hoy()', 'execute');

-- ── 16. (0152) La fila del Repaso de Contabilidad: la misma clasificación que el de Macro ──
insert into res select 16, 'repaso-diario-contabilidad: contabilidad, evaluativa, medio, base 60',
  'contabilidad/evaluativa/medio/60',
  coalesce((select subject_id || '/' || modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'repaso-diario-contabilidad'), 'sin fila'),
  coalesce((select subject_id = 'contabilidad' and modalidad = 'evaluativa' and dificultad = 'medio' and fp_base = 60
              from public.actividad_catalogo where activity_id = 'repaso-diario-contabilidad'), false);

-- ── 17. (0152) anon tampoco llama a la lectura nueva ───────────────────────
insert into res select 17, 'anon no ejecuta repaso_hecho_hoy_de', 'false',
  has_function_privilege('anon', 'public.repaso_hecho_hoy_de(text)', 'execute')::text,
  not has_function_privilege('anon', 'public.repaso_hecho_hoy_de(text)', 'execute');

-- ── Resumen ────────────────────────────────────────────────────────────────
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
