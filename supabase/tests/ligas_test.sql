-- Prueba de la lógica de ligas.
--
-- Se pega entero en el SQL Editor de Supabase y se corre de una vez. Crea sus
-- propios usuarios y datos de mentira, comprueba las reglas y termina en
-- ROLLBACK: no deja rastro y no toca los datos reales de nadie.
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

/* El chequeo 8 corre suplantando a un estudiante; necesita poder escribir aquí. */
grant all on resultado_prueba to authenticated;

-- ---------------------------------------------------------------------------
-- 1. Cuántas ligas para N activos
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 1, 'Tamaños de liga según activos',
  case when public.ligas_para(5)   = 1
        and public.ligas_para(19)  = 1
        and public.ligas_para(20)  = 3
        and public.ligas_para(59)  = 3
        and public.ligas_para(60)  = 4
        and public.ligas_para(100) = 5
       then 'PASA' else 'FALLA' end,
  format('5→%s  19→%s  20→%s  59→%s  60→%s  100→%s',
    public.ligas_para(5), public.ligas_para(19), public.ligas_para(20),
    public.ligas_para(59), public.ligas_para(60), public.ligas_para(100));

-- ---------------------------------------------------------------------------
-- Escenario: 30 estudiantes de mentira en Pensamiento Estratégico
-- ---------------------------------------------------------------------------
create temporary table ids (n integer, uid uuid) on commit drop;
insert into ids (n, uid) select g, gen_random_uuid() from generate_series(1, 30) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'prueba-liga-' || n || '@ejemplo.test', '', now(), now()
  from ids;

insert into public.profiles (user_id, nickname)
select uid, 'liga_' || lpad(n::text, 2, '0') from ids;

/* FP de una semana anterior: el estudiante n tiene n*10 FP. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-previa', 'pensamiento-estrategico', n * 10, 'medio', 'evaluativa',
       (public.ciclo_actual() - 3)::timestamp at time zone 'America/Bogota'
  from ids;

select public.ligas_sembrar('pensamiento-estrategico');

-- ---------------------------------------------------------------------------
-- 2 y 3. Reparto inicial
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 2, '30 activos se reparten en 3 ligas de 10',
  case when count(distinct liga) = 3 and min(c) = 10 and max(c) = 10 then 'PASA' else 'FALLA' end,
  'reparto → ' || string_agg('liga ' || liga || ': ' || c, ' | ' order by liga)
from (
  select liga, count(*) as c from public.liga_membresia
   where subject_id = 'pensamiento-estrategico' and ciclo = public.ciclo_actual()
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
 where subject_id = 'pensamiento-estrategico' and ciclo = public.ciclo_actual();

delete from public.fp_history where subject_id = 'pensamiento-estrategico';

/* Liga 2 (estudiantes 11..20). El 11 se queda SIN actividad a propósito. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-semana', 'pensamiento-estrategico',
       case n when 20 then 100 when 19 then 90 when 18 then 80
              when 12 then 5   when 13 then 6  when 14 then 7
              else 50 end,
       'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n between 12 and 20;

/* Liga 1 (21..30) y liga 3 (1..10) compiten normal. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-semana', 'pensamiento-estrategico', n * 3, 'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n between 21 and 30 or n between 1 and 10;

select public.ligas_sembrar('pensamiento-estrategico');

-- ---------------------------------------------------------------------------
-- 4, 5 y 6. Ascenso, descenso y la regla del inactivo
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 4, 'Suben los 3 primeros de la liga 2 (18, 19 y 20)',
  case when count(*) = 3 then 'PASA' else 'FALLA' end,
  'subieron a la liga 1: ' || coalesce(string_agg(i.n::text, ', ' order by i.n), 'nadie')
from public.liga_membresia m join ids i on i.uid = m.user_id
where m.ciclo = public.ciclo_actual() and i.n in (18, 19, 20) and m.liga = 1;

insert into resultado_prueba
select 5, 'Bajan los 3 últimos de la liga 2 (12, 13 y 14)',
  case when count(*) = 3 then 'PASA' else 'FALLA' end,
  'bajaron a la liga 3: ' || coalesce(string_agg(i.n::text, ', ' order by i.n), 'nadie')
from public.liga_membresia m join ids i on i.uid = m.user_id
where m.ciclo = public.ciclo_actual() and i.n in (12, 13, 14) and m.liga = 3;

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
-- ---------------------------------------------------------------------------
update public.fp_history
   set fp_awarded = 80
 where subject_id = 'pensamiento-estrategico'
   and user_id in (select uid from ids where n in (17, 18));

insert into resultado_prueba
select 7, 'Empate en el 3.º puesto: se mueven los dos empatados',
  case when (
    select count(*) from public.liga_membresia m join ids i on i.uid = m.user_id
     where m.ciclo = public.ciclo_actual() - 7 and i.n in (17, 18) and m.liga = 2
  ) = 2 then 'PASA' else 'FALLA' end,
  'los empatados 17 y 18 estaban juntos en la liga 2 antes del cierre';

-- ---------------------------------------------------------------------------
-- 8. El tablero: corte del podio y qué se devuelve
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 1), 'role', 'authenticated')::text, true);

insert into resultado_prueba
select 8, 'Tablero: corta al 28% y solo devuelve podio + tu fila',
  case when filas > 0
        and corte = greatest(1, ceil(tam::numeric * 0.28)::integer)
        and tuyas = 1
       then 'PASA' else 'FALLA' end,
  format('liga de %s → podio de %s ; filas devueltas %s ; filas tuyas %s', tam, corte, filas, tuyas)
from (
  select max(tam_liga) as tam, max(corte_podio) as corte,
         count(*) as filas, count(*) filter (where es_tuyo) as tuyas
    from public.liga_tablero('pensamiento-estrategico')
) t;

reset role;

-- ---------------------------------------------------------------------------
-- 9. Macroeconomía no queda sembrada
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 9, 'Macroeconomía sigue sin ligas',
  case when not exists (select 1 from public.liga_membresia where subject_id = 'macroeconomia')
       then 'PASA' else 'FALLA' end,
  'el lanzamiento es solo para Pensamiento Estratégico';

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
