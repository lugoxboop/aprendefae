-- Prueba de la partida en curso del Proyecto del Arca (migración 0028).
--
-- Se pega entero en el SQL Editor de Supabase, o lo corre el workflow de CI.
-- Crea sus propios usuarios, comprueba y termina en ROLLBACK: no deja rastro.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- EL ZOMBI VA PRIMERO
--
-- Antes que el camino feliz, a propósito. Es el fallo que no se puede escapar:
-- el estudiante termina el Arca, recarga, retoma lo que quedó guardado,
-- termina otra vez, y registrar_fp escribe un SEGUNDO juego de filas en
-- fp_detalle. No cuesta puntos —la repetición paga 0—, pero ese estudiante
-- entra dos veces en el diagnóstico de la cohorte, y con 13 estudiantes eso
-- es un sesgo que se ve.
--
-- Los chequeos 1 a 3 lo atacan por los dos lados: que tras registrar no quede
-- nada que retomar, y que un guardado que llega tarde no lo resucite. Y se
-- comprobó que FALLAN si se quita el borrado de registrar_fp: una
-- comprobación que no puede fallar no comprueba nada, y ya van cuatro así.
--
-- Después, los ítems repetidos al retomar (4 y 5), y el resto.
--
-- Los 14 deben decir PASA.

begin;

create temporary table resultado_prueba (
  n         integer,
  chequeo   text,
  resultado text,
  detalle   text
) on commit drop;
grant all on resultado_prueba to authenticated;

/* Lo que los pasos que corren como estudiante dejan para leer después. */
create temporary table mira (clave text primary key, valor text) on commit drop;
grant all on mira to authenticated;

/* Las partidas de estudiantes REALES antes de empezar: el último chequeo compara. */
create temporary table reales_antes on commit drop as
select user_id, activity_id, iniciada_en, actualizado_en from public.partida_en_curso;

create temporary table ids (n integer primary key, uid uuid) on commit drop;
grant select on ids to authenticated;
insert into ids values (1, gen_random_uuid()), (2, gen_random_uuid());

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'prueba-partida-' || n || '@ejemplo.test', '', now(), now()
  from ids;

insert into public.profiles (user_id, nickname)
select uid, 'partida_' || n from ids;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1-3 · EL ZOMBI
-- ═══════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 1), 'role', 'authenticated')::text, true);
set local role authenticated;

/* Etapa 1 terminada: primer guardado. El servidor pone la identidad de la partida. */
insert into mira
select 'inicio', public.partida_guardar('proyecto-arca',
  '{"version":1,"resultados":[80,null,null,null],"jugadoMs":120000}'::jsonb)::text;

/* Etapas 2, 3 y 4: continuaciones de la misma partida. */
select public.partida_guardar('proyecto-arca',
  '{"version":1,"resultados":[80,40,null,null],"jugadoMs":300000}'::jsonb,
  (select valor from mira where clave = 'inicio')::timestamptz);
select public.partida_guardar('proyecto-arca',
  '{"version":1,"resultados":[80,40,70,null],"jugadoMs":540000}'::jsonb,
  (select valor from mira where clave = 'inicio')::timestamptz);
select public.partida_guardar('proyecto-arca',
  '{"version":1,"resultados":[80,40,70,90],"jugadoMs":780000}'::jsonb,
  (select valor from mira where clave = 'inicio')::timestamptz);

/*
 * Justo antes de registrar HAY una partida guardada. Sin comprobarlo, el
 * chequeo 1 pasaría también si nunca se hubiera guardado nada.
 */
insert into mira select 'antes', count(*)::text from public.partida_leer('proyecto-arca');

/*
 * Termina el desafío. El detalle trae et3:par:a-c DOS veces —la etapa 3
 * rehecha al retomar—: primero mal, después bien.
 */
select public.registrar_fp('proyecto-arca', 780000, 70, '[
  {"item":"et1:e1","ok":true,"orden":1},
  {"item":"et2:estructura","ok":false,"respuesta":"eventos","orden":2},
  {"item":"et3:par:a-c","ok":false,"respuesta":"b","orden":3},
  {"item":"et3:par:a-c","ok":true,"orden":4},
  {"item":"et4:momento","ok":true,"orden":5}
]'::jsonb);

insert into resultado_prueba
select 1, 'ZOMBI · Después de registrar no queda partida que retomar',
  case when (select valor from mira where clave = 'antes') = '1' and count(*) = 0 then 'PASA' else 'FALLA' end,
  format('partidas guardadas: justo antes de registrar %s, después %s (esperado 1 y 0)',
         (select valor from mira where clave = 'antes'), count(*))
from public.partida_leer('proyecto-arca');

/* El guardado de la etapa 4 que llega tarde, cuando registrar_fp ya cerró la partida. */
do $tarde$
declare v_resp text;
begin
  begin
    perform public.partida_guardar('proyecto-arca',
      '{"version":1,"resultados":[80,40,70,90],"jugadoMs":780000}'::jsonb,
      (select valor from mira where clave = 'inicio')::timestamptz);
    v_resp := 'ACEPTADO';
  exception when others then
    v_resp := sqlstate;
  end;
  insert into resultado_prueba
  select 2, 'ZOMBI · Un guardado que llega tarde no resucita la partida',
    case when v_resp = '55000' and not exists (select 1 from public.partida_leer('proyecto-arca'))
         then 'PASA' else 'FALLA' end,
    format('respuesta del servidor: %s (esperado 55000) ; partidas después: %s',
           v_resp, (select count(*) from public.partida_leer('proyecto-arca')));
end
$tarde$;

reset role;

/* Como dueño: lo que quedó escrito de verdad. */
insert into resultado_prueba
select 3, 'ZOMBI · Un solo juego de filas: 1 registro de FP y 4 ítems, no dos juegos',
  case when x.historias = 1 and x.filas = 4 then 'PASA' else 'FALLA' end,
  format('registros de FP del Arca: %s ; filas de detalle: %s (se mandaron 5 elementos, uno repetido)',
         x.historias, x.filas)
from (
  select
    (select count(*) from public.fp_history h
      where h.user_id = (select uid from ids where n = 1) and h.activity_id = 'proyecto-arca') as historias,
    (select count(*) from public.fp_detalle d
      where d.user_id = (select uid from ids where n = 1) and d.activity_id = 'proyecto-arca') as filas
) x;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4-5 · LOS ÍTEMS REPETIDOS AL RETOMAR
-- ═══════════════════════════════════════════════════════════════════════════
insert into resultado_prueba
select 4, 'RETOMAR · Un ítem repetido queda una sola vez, con la última respuesta',
  case when count(*) = 1 and bool_and(d.acerto) then 'PASA' else 'FALLA' end,
  format('filas de et3:par:a-c: %s ; acertó: %s (esperado 1 fila y true: la etapa rehecha)',
         count(*), coalesce(bool_and(d.acerto)::text, 'sin filas'))
from public.fp_detalle d
where d.user_id = (select uid from ids where n = 1)
  and d.activity_id = 'proyecto-arca'
  and d.item_id = 'et3:par:a-c';

/* La garantía de ESQUEMA: meter a mano el mismo ítem en la misma partida. */
do $esquema$
declare v_resp text;
begin
  begin
    insert into public.fp_detalle (fp_history_id, user_id, activity_id, item_id, acerto)
    select d.fp_history_id, d.user_id, d.activity_id, d.item_id, false
      from public.fp_detalle d
     where d.user_id = (select uid from ids where n = 1)
       and d.item_id = 'et3:par:a-c';
    v_resp := 'ACEPTADO';
  exception when unique_violation then
    v_resp := 'RECHAZADO';
  end;
  insert into resultado_prueba values (
    5, 'RETOMAR · El esquema no admite el mismo ítem dos veces en la misma partida',
    case when v_resp = 'RECHAZADO' then 'PASA' else 'FALLA' end,
    format('insertar a mano un et3:par:a-c repetido: %s', v_resp));
end
$esquema$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6-10 · EL CAMINO FELIZ, Y SUS BORDES
-- ═══════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 1), 'role', 'authenticated')::text, true);
set local role authenticated;

insert into mira
select 'inicio2', public.partida_guardar('proyecto-arca',
  '{"version":1,"resultados":[80,40,null,null],"jugadoMs":300000}'::jsonb)::text;

insert into resultado_prueba
select 6, 'Guardar y leer: vuelve el resultado sellado y la misma identidad',
  case when (p.estado -> 'resultados' ->> 1) = '40'
        and p.iniciada_en = (select valor from mira where clave = 'inicio2')::timestamptz
        and p.actualizado_en is not null
       then 'PASA' else 'FALLA' end,
  format('etapa 2 = %s ; identidad igual: %s', p.estado -> 'resultados' ->> 1,
         p.iniciada_en = (select valor from mira where clave = 'inicio2')::timestamptz)
from public.partida_leer('proyecto-arca') p;

/* "Empezar de nuevo": una partida nueva reemplaza a la vieja, y la vieja ya no se puede continuar. */
insert into mira
select 'inicio3', public.partida_guardar('proyecto-arca',
  '{"version":1,"resultados":[10,null,null,null],"jugadoMs":60000}'::jsonb)::text;

do $vieja$
declare v_resp text;
begin
  begin
    perform public.partida_guardar('proyecto-arca',
      '{"version":1,"resultados":[80,40,70,null],"jugadoMs":540000}'::jsonb,
      (select valor from mira where clave = 'inicio2')::timestamptz);
    v_resp := 'ACEPTADO';
  exception when others then
    v_resp := sqlstate;
  end;
  insert into resultado_prueba
  select 7, 'Empezar de nuevo: la partida vieja ya no se puede continuar',
    case when v_resp = '55000'
          and (select valor from mira where clave = 'inicio3') <> (select valor from mira where clave = 'inicio2')
          and (select p.estado -> 'resultados' ->> 0 from public.partida_leer('proyecto-arca') p) = '10'
         then 'PASA' else 'FALLA' end,
    format('continuar la vieja: %s (esperado 55000) ; la guardada es la nueva: %s',
           v_resp, (select p.estado -> 'resultados' ->> 0 from public.partida_leer('proyecto-arca') p) = '10');
end
$vieja$;

select public.partida_borrar('proyecto-arca');

insert into resultado_prueba
select 8, 'Borrar: no queda nada que retomar',
  case when count(*) = 0 then 'PASA' else 'FALLA' end,
  format('partidas después de borrar: %s', count(*))
from public.partida_leer('proyecto-arca');

/* Solo el Arca guarda partida. Una actividad con reloj no, y lo dice el servidor. */
do $solo_arca$
declare v_resp text;
begin
  begin
    perform public.partida_guardar('camara-presion', '{"version":1}'::jsonb);
    v_resp := 'ACEPTADO';
  exception when others then
    v_resp := sqlstate;
  end;
  insert into resultado_prueba values (
    9, 'Solo el Arca guarda partida: una actividad con reloj se rechaza',
    case when v_resp = '22023' then 'PASA' else 'FALLA' end,
    format('guardar camara-presion: %s (esperado 22023)', v_resp));
end
$solo_arca$;

do $bordes$
declare v_lista text; v_grande text;
begin
  begin
    perform public.partida_guardar('proyecto-arca', '[1, 2, 3]'::jsonb);
    v_lista := 'ACEPTADO';
  exception when others then v_lista := sqlstate;
  end;
  begin
    perform public.partida_guardar('proyecto-arca', jsonb_build_object('relleno', repeat('x', 70000)));
    v_grande := 'ACEPTADO';
  exception when others then v_grande := sqlstate;
  end;
  insert into resultado_prueba values (
    10, 'El estado tiene que ser un objeto y no pasar de 64 KB',
    case when v_lista = '22023' and v_grande = '22023' then 'PASA' else 'FALLA' end,
    format('una lista: %s ; 70 KB: %s (esperado 22023 los dos)', v_lista, v_grande));
end
$bordes$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 11-14 · QUIÉN PUEDE QUÉ
-- ═══════════════════════════════════════════════════════════════════════════
/* A guarda una partida. */
select public.partida_guardar('proyecto-arca',
  '{"version":1,"resultados":[80,null,null,null],"jugadoMs":120000}'::jsonb);

/* B no la ve, ni por la función ni leyendo la tabla, y su borrar no la toca. */
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 2), 'role', 'authenticated')::text, true);

insert into mira select 'b_funcion', count(*)::text from public.partida_leer('proyecto-arca');
insert into mira select 'b_tabla', count(*)::text from public.partida_en_curso;
select public.partida_borrar('proyecto-arca');

reset role;

insert into resultado_prueba
select 11, 'La partida de A es invisible e intocable para B',
  case when (select valor from mira where clave = 'b_funcion') = '0'
        and (select valor from mira where clave = 'b_tabla') = '0'
        and x.de_a = 1
       then 'PASA' else 'FALLA' end,
  format('B ve por la función %s y en la tabla %s ; la de A sigue ahí: %s',
         (select valor from mira where clave = 'b_funcion'),
         (select valor from mira where clave = 'b_tabla'), x.de_a)
from (
  select count(*) as de_a from public.partida_en_curso pc
   where pc.user_id = (select uid from ids where n = 1)
) x;

/* Escribir la tabla directamente, sin pasar por partida_guardar, está cerrado. */
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 1), 'role', 'authenticated')::text, true);
set local role authenticated;

do $directo$
declare v_ins text; v_upd text;
begin
  begin
    insert into public.partida_en_curso (user_id, activity_id, estado)
    values ((select uid from ids where n = 1), 'proyecto-arca', '{"trampa":true}'::jsonb);
    v_ins := 'ACEPTADO';
  exception when others then v_ins := sqlstate;
  end;
  begin
    update public.partida_en_curso set estado = '{"trampa":true}'::jsonb;
    v_upd := 'ACEPTADO';
  exception when others then v_upd := sqlstate;
  end;
  insert into resultado_prueba values (
    12, 'Nadie escribe la tabla directamente: insert y update cerrados al estudiante',
    case when v_ins = '42501' and v_upd = '42501' then 'PASA' else 'FALLA' end,
    format('insert directo: %s ; update directo: %s (esperado 42501 los dos)', v_ins, v_upd));
end
$directo$;

/* Sin sesión no se guarda. */
select set_config('request.jwt.claims', '', true);

do $sin_sesion$
declare v_resp text;
begin
  begin
    perform public.partida_guardar('proyecto-arca', '{"version":1}'::jsonb);
    v_resp := 'ACEPTADO';
  exception when others then v_resp := sqlstate;
  end;
  insert into resultado_prueba values (
    13, 'Sin sesión no se guarda, y anon no ejecuta ninguna de las tres',
    case when v_resp = '42501'
          and not has_function_privilege('anon', 'public.partida_guardar(text, jsonb, timestamptz)', 'execute')
          and not has_function_privilege('anon', 'public.partida_leer(text)', 'execute')
          and not has_function_privilege('anon', 'public.partida_borrar(text)', 'execute')
         then 'PASA' else 'FALLA' end,
    format('guardar sin sesión: %s (esperado 42501) ; anon ejecuta guardar/leer/borrar: %s/%s/%s', v_resp,
           has_function_privilege('anon', 'public.partida_guardar(text, jsonb, timestamptz)', 'execute'),
           has_function_privilege('anon', 'public.partida_leer(text)', 'execute'),
           has_function_privilege('anon', 'public.partida_borrar(text)', 'execute')));
end
$sin_sesion$;

reset role;

insert into resultado_prueba
select 14, 'Las partidas de estudiantes reales no se tocaron',
  case when not exists (
         (select user_id, activity_id, iniciada_en, actualizado_en from public.partida_en_curso
           where user_id not in (select uid from ids))
         except (select * from reales_antes))
        and not exists (
         (select * from reales_antes)
         except (select user_id, activity_id, iniciada_en, actualizado_en from public.partida_en_curso
                  where user_id not in (select uid from ids)))
       then 'PASA' else 'FALLA' end,
  format('%s partidas reales antes, las mismas después', (select count(*) from reales_antes));

-- ---------------------------------------------------------------------------
-- RESULTADO
-- ---------------------------------------------------------------------------
select
  n as "#",
  chequeo,
  resultado,
  detalle
from resultado_prueba
union all
select
  99,
  '=== RESUMEN ===',
  case when exists (select 1 from resultado_prueba where resultado = 'FALLA')
            or (select count(*) from resultado_prueba) <> 14
       then 'HAY FALLOS' else 'LOS 14 PASAN' end,
  format('%s de 14 en verde', (select count(*) from resultado_prueba where resultado = 'PASA'))
order by 1;

rollback;
