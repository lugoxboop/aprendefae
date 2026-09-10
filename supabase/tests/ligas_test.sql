-- Prueba de la lógica de ligas.
--
-- Se pega entero en el SQL Editor de Supabase y se corre de una vez. Crea sus
-- propios usuarios y datos de mentira, comprueba las reglas y termina en
-- ROLLBACK: no deja rastro.
--
-- EL ESCENARIO VIVE EN SU PROPIA MATERIA INVENTADA, 'zzz-prueba-ligas', y no
-- en una real. Dos motivos, y los dos importan:
--
--   1. Nada de lo que hace aquí puede tocar el historial de un estudiante de
--      verdad, ni siquiera si alguien ejecutara un trozo suelto del archivo
--      fuera de la transacción.
--   2. Los conteos salen deterministas. Sembrando sobre una materia con uso
--      real, los 30 estudiantes de mentira se mezclarían con los reales y
--      "3 ligas de 10" fallaría sin que nada estuviera roto.
--
-- La lógica de ligas es genérica por materia, así que probarla en una materia
-- de mentira la prueba igual de bien.
--
-- Los nueve chequeos se van guardando en una tabla temporal y se muestran
-- juntos al final, en un único resultado. Es a propósito: el editor de Supabase
-- enseña solo la última consulta de un lote, así que nueve SELECT sueltos
-- dejarían ocho invisibles.
--
-- TODOS deben decir PASA.

begin;

create temporary table resultado_prueba (
  n        integer,
  chequeo  text,
  resultado text,
  detalle  text
) on commit drop;

/*
 * El chequeo 8 corre suplantando a un estudiante con el rol `authenticated`,
 * que no es dueño de estas tablas temporales. Sin estos permisos, Postgres lo
 * para en seco antes de llegar a probar nada de ligas.
 */
grant all on resultado_prueba to authenticated;

/*
 * La foto de las materias REALES antes de tocar nada, para el último
 * chequeo. Ver allí por qué se compara contra una foto y no contra "no hay
 * filas".
 */
create temporary table reales_antes on commit drop as
select subject_id, ciclo, user_id, liga
  from public.liga_membresia
 where subject_id in ('macroeconomia', 'pensamiento-estrategico');

-- ---------------------------------------------------------------------------
-- 1. Cuántas ligas para N activos
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 1, 'Tamaños de liga según activos',
  case when public.ligas_para(5)   = 1
        and public.ligas_para(19)  = 1
        and public.ligas_para(20)  = 3
        and public.ligas_para(59)  = 3
        and public.ligas_para(60)   = 4
        and public.ligas_para(100)  = 4
        and public.ligas_para(1000) = 4
       then 'PASA' else 'FALLA' end,
  format('5→%s  19→%s  20→%s  59→%s  60→%s  100→%s  1000→%s  (techo de 4 desde la 0026)',
    public.ligas_para(5), public.ligas_para(19), public.ligas_para(20),
    public.ligas_para(59), public.ligas_para(60), public.ligas_para(100),
    public.ligas_para(1000));

-- ---------------------------------------------------------------------------
-- Escenario: 30 estudiantes de mentira en la materia de prueba
-- ---------------------------------------------------------------------------
create temporary table ids (n integer, uid uuid) on commit drop;
grant select on ids to authenticated;
insert into ids (n, uid) select g, gen_random_uuid() from generate_series(1, 30) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'prueba-liga-' || n || '@ejemplo.test', '', now(), now()
  from ids;

insert into public.profiles (user_id, nickname)
select uid, 'liga_' || lpad(n::text, 2, '0') from ids;

/* FP de una semana anterior: el estudiante n tiene n*10 FP. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-previa', 'zzz-prueba-ligas', n * 10, 'medio', 'evaluativa',
       (public.ciclo_actual() - 3)::timestamp at time zone 'America/Bogota'
  from ids;

select public.ligas_sembrar('zzz-prueba-ligas');

-- ---------------------------------------------------------------------------
-- 2 y 3. Reparto inicial
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 2, '30 activos se reparten en 3 ligas de 10',
  case when count(distinct liga) = 3 and min(c) = 10 and max(c) = 10 then 'PASA' else 'FALLA' end,
  'reparto → ' || string_agg('liga ' || liga || ': ' || c, ' | ' order by liga)
from (
  select liga, count(*) as c from public.liga_membresia
   where subject_id = 'zzz-prueba-ligas' and ciclo = public.ciclo_actual()
   group by liga
) x;

insert into resultado_prueba
select 3, 'El de más FP arriba, el de menos abajo',
  case when arriba = 1 and abajo = 3 then 'PASA' else 'FALLA' end,
  format('estudiante 30 → liga %s ; estudiante 1 → liga %s', arriba, abajo)
from (
  select
    (select liga from public.liga_membresia m join ids i on i.uid = m.user_id
      where i.n = 30 and m.ciclo = public.ciclo_actual()) as arriba,
    (select liga from public.liga_membresia m join ids i on i.uid = m.user_id
      where i.n = 1 and m.ciclo = public.ciclo_actual()) as abajo
) y;

-- ---------------------------------------------------------------------------
-- Cierre de ciclo: se mueve la membresía a la semana pasada y se dan FP de esa
-- semana solo a algunos, para probar ascensos, descensos e inactivos.
-- ---------------------------------------------------------------------------
update public.liga_membresia
   set ciclo = public.ciclo_actual() - 7
 where subject_id = 'zzz-prueba-ligas' and ciclo = public.ciclo_actual();

delete from public.fp_history
 where subject_id = 'zzz-prueba-ligas'
   and user_id in (select uid from ids);

/* Liga 2 (estudiantes 11..20). El 11 se queda SIN actividad a propósito. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-semana', 'zzz-prueba-ligas',
       case n when 20 then 100 when 19 then 90 when 18 then 80
              when 12 then 5   when 13 then 6  when 14 then 7
              else 50 end,
       'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n between 12 and 20;

/* Liga 1 (21..30) y liga 3 (1..10) compiten normal. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-semana', 'zzz-prueba-ligas', n * 3, 'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n between 21 and 30 or n between 1 and 10;

select public.ligas_sembrar('zzz-prueba-ligas');

-- ---------------------------------------------------------------------------
-- 4, 5 y 6. Ascenso, descenso y la regla del inactivo
-- ---------------------------------------------------------------------------
/*
 * CON EL CUPO PROPORCIONAL (0026). La liga 2 tuvo 9 activos —el 11 no—: el
 * cupo es el 15% de 9, redondeado, 1. Sube solo el primero, el 20. Con la
 * regla de 3 fijos subían 18, 19 y 20. Se mira a todos los de la liga 2 que
 * acabaron en la 1, no solo a los esperados: que suba uno de más también es
 * fallo.
 */
insert into resultado_prueba
select 4, 'Con 9 activos el cupo es 1: sube solo el primero de la liga 2 (el 20)',
  case when coalesce(string_agg(i.n::text, ', ' order by i.n), '') = '20' then 'PASA' else 'FALLA' end,
  'de la liga 2 subieron a la 1: ' || coalesce(string_agg(i.n::text, ', ' order by i.n), 'nadie')
from public.liga_membresia m join ids i on i.uid = m.user_id
where m.ciclo = public.ciclo_actual() and i.n between 11 and 20 and m.liga = 1;

insert into resultado_prueba
select 5, 'Con cupo 1 baja solo el último de la liga 2 (el 12)',
  case when coalesce(string_agg(i.n::text, ', ' order by i.n), '') = '12' then 'PASA' else 'FALLA' end,
  'de la liga 2 bajaron a la 3: ' || coalesce(string_agg(i.n::text, ', ' order by i.n), 'nadie')
from public.liga_membresia m join ids i on i.uid = m.user_id
where m.ciclo = public.ciclo_actual() and i.n between 11 and 20 and m.liga = 3;

insert into resultado_prueba
select 6, 'Sin actividad en la semana: no se mueve',
  case when liga_ahora = 2 then 'PASA' else 'FALLA' end,
  format('estudiante 11 (0 FP esta semana) sigue en la liga %s, esperado 2', liga_ahora)
from (
  select (select m.liga from public.liga_membresia m join ids i on i.uid = m.user_id
           where i.n = 11 and m.ciclo = public.ciclo_actual()) as liga_ahora
) z;

-- ---------------------------------------------------------------------------
-- 7. Empate en el borde del ascenso: se mueven todos los empatados
--
-- HAY QUE VOLVER A SEMBRAR. La versión anterior de este paso creaba el empate
-- DESPUÉS de `ligas_sembrar` y luego comprobaba que 17 y 18 estaban juntos en
-- la liga 2 *antes* del cierre — es decir, comprobaba su propio montaje. No
-- podía fallar nunca, ni siquiera si el cierre resolviera mal los empates, y
-- `ligas_sembrar` vuelve sin hacer nada si el ciclo ya está sembrado.
--
-- QUÉ SE PRUEBA. Con el cupo proporcional la liga 2 sube a UNO (9 activos).
-- Con 19 y 20 empatados en 100, rank() da el puesto 1 a los dos, los dos caen
-- dentro del cupo, y el cierre sube a los dos aunque el cupo sea 1. Con
-- row_number() en vez de rank(), subiría uno solo.
--
-- SI FALLARA DE VERDAD: cambiar rank() por row_number() en ligas_sembrar deja
-- a uno de los dos en la liga 2 y este paso cuenta 1 en vez de 2 → FALLA.
--
-- El resembrado no altera nada de lo ya medido: los pasos 4, 5 y 6 ya
-- escribieron su fila, y el estudiante 1 —el de la sesión del paso 8— sigue en
-- la misma liga 3 con los mismos compañeros.
-- ---------------------------------------------------------------------------
update public.fp_history
   set fp_awarded = 100
 where subject_id = 'zzz-prueba-ligas'
   and user_id in (select uid from ids where n = 19);

delete from public.liga_membresia
 where subject_id = 'zzz-prueba-ligas' and ciclo = public.ciclo_actual();

select public.ligas_sembrar('zzz-prueba-ligas');

insert into resultado_prueba
select 7, 'Empate en el borde del cupo: 19 y 20, empatados en 100, suben LOS DOS',
  case when count(*) = 2 then 'PASA' else 'FALLA' end,
  'empatados en 100 que subieron a la liga 1: ' ||
  coalesce(string_agg(i.n::text, ', ' order by i.n), 'ninguno') || ' (esperados 19 y 20)'
from public.liga_membresia m join ids i on i.uid = m.user_id
where m.ciclo = public.ciclo_actual() and i.n in (19, 20) and m.liga = 1;

-- ---------------------------------------------------------------------------
-- 8. El tablero: corte del podio y qué se devuelve
-- ---------------------------------------------------------------------------
/*
 * El orden importa: primero se lee el uid de la tabla temporal, y DESPUÉS se
 * cambia de rol. Al revés, la lectura de `ids` ya corre como `authenticated`,
 * que no es dueño de esa tabla, y Postgres la rechaza con "permission denied
 * for table ids" antes de llegar a probar nada de ligas.
 */
/*
 * FP de ESTA semana para cinco compañeros de nivel del estudiante 1, del 2
 * (50) al 6 (10). El 1 no suma: así su fila sale aparte y no en el podio.
 * Con 5 activos el cupo es 1: el podio es el 2, y nadie más.
 */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-hoy', 'zzz-prueba-ligas', (7 - n) * 10, 'medio', 'evaluativa', now()
  from ids where n between 2 and 6;

select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 1), 'role', 'authenticated')::text, true);

set local role authenticated;

insert into resultado_prueba
select 8, 'Tablero: el podio es la zona de ascenso — 5 activos, 1 nombre, y tu fila aparte',
  case when corte = 1 and podio = 1 and primero = 'liga_02' and tuyas = 1 and filas = 2
       then 'PASA' else 'FALLA' end,
  format('cupo %s ; en el podio %s (%s) ; filas devueltas %s ; filas tuyas %s',
         corte, podio, primero, filas, tuyas)
from (
  select max(corte_podio) as corte,
         count(*) filter (where en_podio) as podio,
         max(nickname) filter (where en_podio) as primero,
         count(*) as filas,
         count(*) filter (where es_tuyo) as tuyas
    from public.liga_tablero('zzz-prueba-ligas')
) t;

reset role;

-- ---------------------------------------------------------------------------
-- 9. Ninguna materia real quedó tocada
-- ---------------------------------------------------------------------------
/*
 * ANTES ESTO AFIRMABA QUE NO HABÍA NINGUNA FILA de las materias reales. En CI
 * se cumple —la base nace vacía—, pero en producción Pensamiento Estratégico
 * tiene membresía de verdad, y ahí salía FALLA sin que la prueba hubiera
 * tocado nada. "No tocado" es "igual que antes", no "vacío".
 */
insert into resultado_prueba
select 9, 'Ninguna materia real quedó tocada',
  case when not exists (
         (select subject_id, ciclo, user_id, liga from public.liga_membresia
           where subject_id in ('macroeconomia', 'pensamiento-estrategico'))
         except
         (select subject_id, ciclo, user_id, liga from reales_antes)
       )
        and not exists (
         (select subject_id, ciclo, user_id, liga from reales_antes)
         except
         (select subject_id, ciclo, user_id, liga from public.liga_membresia
           where subject_id in ('macroeconomia', 'pensamiento-estrategico'))
       )
       then 'PASA' else 'FALLA' end,
  format('%s filas reales antes, las mismas después', (select count(*) from reales_antes));

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
       then 'HAY FALLOS' else 'LOS 9 PASAN' end,
  format('%s de 9 en verde', (select count(*) from resultado_prueba where resultado = 'PASA'))
order by 1;

rollback;
