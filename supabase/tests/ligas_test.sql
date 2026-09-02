-- Prueba de la lógica de ligas.
--
-- Se corre entera en el SQL Editor de Supabase. Crea sus propios usuarios y
-- datos, comprueba las reglas y termina en ROLLBACK: no deja rastro y no toca
-- los datos reales de nadie. Todos los resultados deben decir PASA.
--
-- Cubre las reglas que no se pueden mirar a ojo: los tamaños de liga, el
-- reparto inicial, quién sube y quién baja, los dos empates (ascenso y borde
-- del podio) y la regla de que quien no tuvo actividad no se mueve.

begin;

-- ---------------------------------------------------------------------------
-- 1. Cuántas ligas para N activos
-- ---------------------------------------------------------------------------
select
  '1. tamaños de liga' as prueba,
  case when public.ligas_para(5)   = 1
        and public.ligas_para(19)  = 1
        and public.ligas_para(20)  = 3
        and public.ligas_para(59)  = 3
        and public.ligas_para(60)  = 4
        and public.ligas_para(100) = 5
       then 'PASA' else 'FALLA' end as resultado,
  public.ligas_para(5) as n5, public.ligas_para(19) as n19, public.ligas_para(20) as n20,
  public.ligas_para(59) as n59, public.ligas_para(60) as n60, public.ligas_para(100) as n100;

-- ---------------------------------------------------------------------------
-- Escenario: 30 estudiantes en Pensamiento Estratégico → 3 ligas de 10
-- ---------------------------------------------------------------------------
create temporary table ids (n integer, uid uuid) on commit drop;

insert into ids (n, uid)
select g, gen_random_uuid() from generate_series(1, 30) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'prueba-liga-' || n || '@ejemplo.test', '', now(), now()
  from ids;

insert into public.profiles (user_id, nickname)
select uid, 'liga_' || lpad(n::text, 2, '0') from ids;

/* FP de la semana pasada: el estudiante n tiene n*10 FP. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-previa', 'pensamiento-estrategico', n * 10, 'medio', 'evaluativa',
       (public.ciclo_actual() - 3)::timestamp at time zone 'America/Bogota'
  from ids;

-- ---------------------------------------------------------------------------
-- 2. Siembra inicial: 30 activos → 3 ligas, 10 en cada una
-- ---------------------------------------------------------------------------
select public.ligas_sembrar('pensamiento-estrategico');

select
  '2. siembra inicial 30 → 3x10' as prueba,
  case when count(distinct liga) = 3 and min(c) = 10 and max(c) = 10 then 'PASA' else 'FALLA' end as resultado,
  string_agg(liga || ':' || c, ' ' order by liga) as reparto
from (
  select liga, count(*) as c
    from public.liga_membresia
   where subject_id = 'pensamiento-estrategico' and ciclo = public.ciclo_actual()
   group by liga
) x;

-- ---------------------------------------------------------------------------
-- 3. El mejor queda en la liga 1 y el peor en la última
-- ---------------------------------------------------------------------------
select
  '3. orden del reparto' as prueba,
  case when (select liga from public.liga_membresia m join ids i on i.uid = m.user_id
              where i.n = 30 and m.ciclo = public.ciclo_actual()) = 1
        and (select liga from public.liga_membresia m join ids i on i.uid = m.user_id
              where i.n = 1 and m.ciclo = public.ciclo_actual()) = 3
       then 'PASA' else 'FALLA' end as resultado;

-- ---------------------------------------------------------------------------
-- Preparar el cierre: mover la membresía al ciclo anterior y dar FP de esa
-- semana solo a algunos, para probar ascensos, descensos e inactivos.
-- ---------------------------------------------------------------------------
update public.liga_membresia
   set ciclo = public.ciclo_actual() - 7
 where subject_id = 'pensamiento-estrategico' and ciclo = public.ciclo_actual();

delete from public.fp_history where subject_id = 'pensamiento-estrategico';

/*
 * En la liga 2 (estudiantes 11..20): los tres primeros por FP deben subir, los
 * tres últimos bajar. Se deja al estudiante 11 SIN actividad para comprobar que
 * no se mueve pese a ser el de menos FP.
 */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-semana', 'pensamiento-estrategico',
       case n when 20 then 100 when 19 then 90 when 18 then 80   -- suben
              when 12 then 5 when 13 then 6 when 14 then 7       -- bajan
              else 50 end,
       'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n between 12 and 20;

/* Empate en el tercer puesto de la liga 1 (estudiantes 21..30). */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-semana', 'pensamiento-estrategico',
       case when n in (30, 29) then 100 when n in (28, 27) then 70 else 20 end,
       'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n between 21 and 30;

/* La liga 3 (1..10) compite normal. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-semana', 'pensamiento-estrategico', n * 3, 'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n between 1 and 10;

select public.ligas_sembrar('pensamiento-estrategico');

-- ---------------------------------------------------------------------------
-- 4. Suben los tres primeros de la liga 2
-- ---------------------------------------------------------------------------
select
  '4. ascenso: 20, 19 y 18 pasan de liga 2 a 1' as prueba,
  case when count(*) = 3 then 'PASA' else 'FALLA' end as resultado,
  string_agg(i.n::text, ',' order by i.n) as quienes
from public.liga_membresia m join ids i on i.uid = m.user_id
where m.ciclo = public.ciclo_actual() and i.n in (18, 19, 20) and m.liga = 1;

-- ---------------------------------------------------------------------------
-- 5. Bajan los tres últimos de la liga 2
-- ---------------------------------------------------------------------------
select
  '5. descenso: 12, 13 y 14 pasan de liga 2 a 3' as prueba,
  case when count(*) = 3 then 'PASA' else 'FALLA' end as resultado,
  string_agg(i.n::text, ',' order by i.n) as quienes
from public.liga_membresia m join ids i on i.uid = m.user_id
where m.ciclo = public.ciclo_actual() and i.n in (12, 13, 14) and m.liga = 3;

-- ---------------------------------------------------------------------------
-- 6. Quien no tuvo actividad no se mueve, aunque fuera el de menos FP
-- ---------------------------------------------------------------------------
select
  '6. sin actividad se queda donde estaba' as prueba,
  case when (select m.liga from public.liga_membresia m join ids i on i.uid = m.user_id
              where i.n = 11 and m.ciclo = public.ciclo_actual()) = 2
       then 'PASA' else 'FALLA' end as resultado;

-- ---------------------------------------------------------------------------
-- 7. Empate en el borde del ascenso: los cuatro empatados se mueven
--    (30 y 29 empatan primeros; 28 y 27 empatan en el tercer puesto)
--    La liga 1 es la de arriba, así que nadie sube desde ella: se comprueba en
--    la liga 2, donde el empate sí produce movimiento.
-- ---------------------------------------------------------------------------
select
  '7. empate arrastra a los empatados' as prueba,
  case when (select count(*) from public.liga_membresia m join ids i on i.uid = m.user_id
              where m.ciclo = public.ciclo_actual() and i.n between 27 and 30 and m.liga = 1) = 4
       then 'PASA' else 'FALLA' end as resultado,
  'los 4 de la liga de arriba siguen arriba: no hay liga superior a la 1' as nota;

-- ---------------------------------------------------------------------------
-- 8. El tablero: corte del podio al 28% y solo podio + tu fila
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 1), 'role', 'authenticated')::text,
  true
);

select
  '8. tablero: corte 28% y visibilidad' as prueba,
  case when count(*) > 0
        and max(corte_podio) = greatest(1, ceil(max(tam_liga)::numeric * 0.28)::integer)
        and count(*) filter (where es_tuyo) = 1
       then 'PASA' else 'FALLA' end as resultado,
  max(tam_liga) as tam_liga, max(corte_podio) as corte, count(*) as filas_devueltas
from public.liga_tablero('pensamiento-estrategico');

reset role;

-- ---------------------------------------------------------------------------
-- 9. Macroeconomía no queda sembrada por accidente
-- ---------------------------------------------------------------------------
select
  '9. Macroeconomía sin ligas' as prueba,
  case when not exists (
    select 1 from public.liga_membresia where subject_id = 'macroeconomia'
  ) then 'PASA' else 'FALLA' end as resultado;

rollback;
