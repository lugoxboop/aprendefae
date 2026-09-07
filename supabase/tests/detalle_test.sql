-- ---------------------------------------------------------------------------
-- Prueba de la migración 0017 — detalle por ítem.
--
-- EL PASO QUE MÁS IMPORTA ES EL 4. Todo el diseño descansa en una promesa: que
-- un fallo escribiendo el diagnóstico NUNCA le cueste los puntos a nadie. El
-- paso 4 manda basura a propósito y comprueba que la fila de FP sigue ahí y
-- paga lo que debe. Si ese paso falla, la migración no debe desplegarse por
-- muy verdes que estén los demás.
--
-- De paso confirma algo que solo se puede comprobar corriéndolo: que un
-- `raise warning` dentro del manejador de una subtransacción NO aborta la
-- transacción exterior. Si abortara, el paso 4 saldría en rojo.
--
-- QUIÉN ES QUIÉN. Solo se cambia a `authenticated` para llamar a registrar_fp
-- y para las lecturas que prueban RLS. Todo lo demás —crear usuarios, escribir
-- en `res`— se hace como dueño. Escribir en `res` siendo `authenticated` da
-- "permission denied for table res", que es el error que rompió racha_test.
--
-- Para sacar un resultado de dentro de un bloque `do $$` que corre como
-- authenticated se usa set_config/current_setting, nunca un insert a `res`.
--
-- No toca a nadie real: dos usuarios propios zzz-*, y ROLLBACK al final.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(etiqueta text, uid uuid) on commit drop;
create temp table antes(filas bigint) on commit drop;

insert into antes select count(*) from public.fp_history;

-- Dos usuarios: uno actúa, el otro sirve para probar que no ve lo ajeno.
insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-det-a@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
       (gen_random_uuid(), 'zzz-det-b@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids select 'a', id from auth.users where email = 'zzz-det-a@prueba.local';
insert into ids select 'b', id from auth.users where email = 'zzz-det-b@prueba.local';
insert into public.profiles(user_id, nickname)
  select uid, 'zzzdet' || etiqueta from ids;

-- Sesión del usuario A.
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'a'),
                                    'role', 'authenticated')::text, true);

-- ── 1. La tabla existe con sus columnas ───────────────────────────────────
insert into res
select 1, 'fp_detalle existe con sus 10 columnas', '10',
  count(*)::text, count(*) = 10
from information_schema.columns
where table_schema = 'public' and table_name = 'fp_detalle';

-- ── 2. NO hay restricción de rango en intentos ────────────────────────────
-- Un check aquí sería la trampa que este diseño evita a propósito.
insert into res
select 2, 'intentos no tiene restricción de rango', '0',
  count(*)::text, count(*) = 0
from information_schema.check_constraints c
join information_schema.constraint_column_usage u using (constraint_name, constraint_schema)
where u.table_name = 'fp_detalle' and u.column_name = 'intentos'
  and c.check_clause not ilike '%IS NOT NULL%';

-- ── 3. Escritura normal: las filas llegan y quedan bien enlazadas ─────────
set local role authenticated;
select public.registrar_fp('diagnostico-en-vivo', 120000, 75, '[
  {"item":"t1a","ok":true,"intentos":1,"orden":1},
  {"item":"t3b","ok":false,"intentos":2,"respuesta":"fiscal","orden":2},
  {"item":"brecha","ok":false,"respuesta":"inflacion","orden":9}
]'::jsonb);
reset role;

insert into res select 3, 'las 3 filas de detalle entraron y apuntan a su fp_history', '3',
  (select count(*)::text from public.fp_detalle d
     join public.fp_history h on h.id = d.fp_history_id
    where d.user_id = (select uid from ids where etiqueta = 'a')
      and d.activity_id = 'diagnostico-en-vivo'
      and h.activity_id = d.activity_id
      and h.user_id = d.user_id),
  (select count(*) = 3 from public.fp_detalle d
     join public.fp_history h on h.id = d.fp_history_id
    where d.user_id = (select uid from ids where etiqueta = 'a')
      and h.activity_id = d.activity_id and h.user_id = d.user_id);

-- ── 4. LA PROMESA. Detalle corrupto, los FP intactos ──────────────────────
-- Se manda un jsonb sintácticamente válido pero inservible: un elemento sin
-- `item`, otro con `ok` que no es booleano, y basura suelta. Nada de esto
-- puede impedir que la actividad pague.
set local role authenticated;
select public.registrar_fp('arma-grupo-logico', 200000, 100, '[
  {"ok":true,"orden":1},
  {"item":"a-c2","ok":"puede ser"},
  {"item":null,"ok":false},
  "esto no es ni un objeto",
  {"item":"a-c3","ok":true,"intentos":"muchos"}
]'::jsonb);
reset role;

insert into res select 4, 'con detalle corrupto la actividad IGUAL paga sus 50 FP', '50',
  coalesce((select fp_awarded::text from public.fp_history
             where user_id = (select uid from ids where etiqueta = 'a')
               and activity_id = 'arma-grupo-logico'), 'NO HAY FILA DE FP'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'arma-grupo-logico');

-- ── 5. De ese lote solo entra lo que sirve, y no revienta ─────────────────
-- Solo 'a-c3' es estructuralmente válido: item string y ok booleano.
insert into res select 5, 'del lote corrupto entra solo el elemento válido', '1',
  (select count(*)::text from public.fp_detalle
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'arma-grupo-logico'),
  (select count(*) = 1 from public.fp_detalle
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'arma-grupo-logico');

-- ── 6. jsonb que NO es un array tampoco rompe nada ────────────────────────
set local role authenticated;
select public.registrar_fp('corriente-titulares', 200000, 100, '{"esto":"es un objeto"}'::jsonb);
reset role;

insert into res select 6, 'un jsonb que no es array no impide el pago', '50',
  coalesce((select fp_awarded::text from public.fp_history
             where user_id = (select uid from ids where etiqueta = 'a')
               and activity_id = 'corriente-titulares'), 'NO HAY FILA DE FP'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'corriente-titulares');

-- ── 7. Compatibilidad: la llamada de TRES argumentos sigue funcionando ────
-- Es lo que evita la ventana de despliegue: el cliente en producción hoy no
-- manda p_detalle y tiene que seguir cobrando igual.
set local role authenticated;
select public.registrar_fp('explica-la-politica', 200000, 100);
reset role;

insert into res select 7, 'la llamada de 3 argumentos sigue pagando', '50',
  coalesce((select fp_awarded::text from public.fp_history
             where user_id = (select uid from ids where etiqueta = 'a')
               and activity_id = 'explica-la-politica'), 'NO HAY FILA DE FP'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'explica-la-politica');

insert into res select 8, 'y no deja detalle, porque no se le mandó', '0',
  (select count(*)::text from public.fp_detalle
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'explica-la-politica'),
  (select count(*) = 0 from public.fp_detalle
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'explica-la-politica');

-- ── 9. El sujetado de intentos ────────────────────────────────────────────
-- 500 se guarda como 99, no rechaza la fila ni tumba el lote.
set local role authenticated;
select public.registrar_fp('simulador-de-crisis', 300000, 100, '[
  {"item":"sq-o","ok":false,"intentos":500,"orden":1},
  {"item":"sq-e","ok":true,"intentos":-7,"orden":2}
]'::jsonb);
reset role;

insert into res select 9, 'intentos fuera de rango se sujeta a 99 y a 1', '99/1',
  coalesce((select string_agg(intentos::text, '/' order by item_id)
              from public.fp_detalle
             where user_id = (select uid from ids where etiqueta = 'a')
               and activity_id = 'simulador-de-crisis'), 'NO HAY FILAS'),
  (select count(*) = 2 and max(intentos) = 99 and min(intentos) = 1
     from public.fp_detalle
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'simulador-de-crisis');

-- ── 10. on delete cascade ─────────────────────────────────────────────────
insert into res select 10, 'borrar la fila de fp_history se lleva su detalle', '0 tras borrar',
  (with borrada as (
     delete from public.fp_history
      where user_id = (select uid from ids where etiqueta = 'a')
        and activity_id = 'simulador-de-crisis'
      returning id
   )
   select count(*)::text || ' tras borrar' from public.fp_detalle
    where fp_history_id in (select id from borrada)),
  (select count(*) = 0 from public.fp_detalle
    where user_id = (select uid from ids where etiqueta = 'a')
      and activity_id = 'simulador-de-crisis');

-- ── 11. RLS: cada quien ve lo suyo ────────────────────────────────────────
-- El usuario B no puede ver el detalle de A. Se saca por set_config para no
-- escribir en `res` desde el rol authenticated.
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'b'),
                                    'role', 'authenticated')::text, true);
set local role authenticated;
do $ajeno$
declare v_n integer;
begin
  select count(*) into v_n from public.fp_detalle;
  perform set_config('prueba.ajeno', v_n::text, true);
end;
$ajeno$;
reset role;

insert into res select 11, 'el estudiante B no ve ni una fila de detalle de A', '0',
  current_setting('prueba.ajeno', true),
  current_setting('prueba.ajeno', true) = '0';

-- ── 12. Y sí ve las suyas ─────────────────────────────────────────────────
set local role authenticated;
select public.registrar_fp('diagnostico-en-vivo', 120000, 100, '[
  {"item":"t2a","ok":true,"orden":1}
]'::jsonb);
do $propio$
declare v_n integer;
begin
  select count(*) into v_n from public.fp_detalle;
  perform set_config('prueba.propio', v_n::text, true);
end;
$propio$;
reset role;

insert into res select 12, 'el estudiante B sí ve la fila que acaba de generar', '1',
  current_setting('prueba.propio', true),
  current_setting('prueba.propio', true) = '1';

-- ── 13. Nadie puede escribir detalle a mano ───────────────────────────────
select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids where etiqueta = 'a'),
                                    'role', 'authenticated')::text, true);
set local role authenticated;
do $mano$
begin
  insert into public.fp_detalle (fp_history_id, user_id, activity_id, item_id, acerto)
  values (1, auth.uid(), 'trampa', 'x', true);
  perform set_config('prueba.mano', 'PASÓ', true);
exception when others then
  perform set_config('prueba.mano', 'rechazado', true);
end;
$mano$;
reset role;

insert into res select 13, 'insertar detalle a mano queda rechazado', 'rechazado',
  current_setting('prueba.mano', true),
  current_setting('prueba.mano', true) = 'rechazado';

-- ── 14. panel_tendencia rechaza a quien no es docente ─────────────────────
set local role authenticated;
do $tend$
begin
  perform public.panel_tendencia('macroeconomia', 8);
  perform set_config('prueba.tend', 'PASÓ', true);
exception when others then
  perform set_config('prueba.tend', 'rechazado', true);
end;
$tend$;
reset role;

insert into res select 14, 'panel_tendencia rechaza a un estudiante', 'rechazado',
  current_setting('prueba.tend', true),
  current_setting('prueba.tend', true) = 'rechazado';

-- ── 15. El historial de los demás no se movió ─────────────────────────────
insert into res select 15, 'nadie más ganó ni perdió filas de historial',
  (select filas::text || ' filas ajenas' from antes),
  (select count(*) filter (where user_id not in (select uid from ids))::text || ' filas ajenas'
     from public.fp_history),
  (select count(*) filter (where user_id not in (select uid from ids)) = (select filas from antes)
     from public.fp_history);

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
