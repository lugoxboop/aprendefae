-- Prueba de la expansión de las ligas (migración 0026): el techo, el recuento
-- guardado, el recálculo por activos y la partición con las decisiones de Xeno.
--
-- Se pega entero en el SQL Editor de Supabase, o lo corre el workflow de CI.
-- Crea sus propios datos, comprueba y termina en ROLLBACK: no deja rastro.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- LOS TRES ESCENARIOS QUE HOY NO EXISTEN EN DATOS, Y UNO QUE SÍ PUEDE PASAR
--
--   A  EL REPARTO, de 1 a 3 niveles, con 20 activos: el cruce del umbral.
--      Ordena por el ciclo más reciente y no por acumulados, empates en el
--      borde hacia arriba, inactivos abajo. Después, EL DÍA OCHO: el primer
--      cierre normal con grupos de ~7, que es donde se ve la rotación.
--
--   B  LA APERTURA DE ÉLITE, de 3 a 4 niveles, con 60 activos. Solo se parte
--      Avanzado; nadie baja; Intermedio y Emergente no cambian de nombre.
--
--   C  EL GRUPO QUE SE VACÍA: 3 niveles y solo 10 activos. No encoge.
--
--   Y la red de sembrar, los permisos, y las materias reales intactas.
--
-- Los 23 deben decir PASA.

begin;

create temporary table resultado_prueba (
  n         integer,
  chequeo   text,
  resultado text,
  detalle   text
) on commit drop;
grant all on resultado_prueba to authenticated;

/* Lo que los chequeos que corren como estudiante dejan para leer después. */
create temporary table mira (clave text primary key, valor text) on commit drop;
grant all on mira to authenticated;

/*
 * La foto de las materias REALES antes de tocar nada, para el último chequeo.
 * "No tocado" es "igual que antes", no "vacío": en producción Pensamiento
 * Estratégico tiene membresía de verdad.
 */
create temporary table reales_membresia on commit drop as
select subject_id, ciclo, user_id, liga
  from public.liga_membresia
 where subject_id in ('macroeconomia', 'pensamiento-estrategico');

create temporary table reales_ciclo on commit drop as
select subject_id, ciclo, niveles, activos
  from public.liga_ciclo
 where subject_id in ('macroeconomia', 'pensamiento-estrategico');

create temporary table reales_reparto on commit drop as
select subject_id, ciclo, user_id, tipo, liga_antes, liga_despues
  from public.liga_reparto
 where subject_id in ('macroeconomia', 'pensamiento-estrategico');

/* 65 estudiantes de mentira. Cada escenario usa un tramo. */
create temporary table ids (n integer primary key, uid uuid) on commit drop;
grant select on ids to authenticated;
insert into ids (n, uid) select g, gen_random_uuid() from generate_series(1, 65) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'prueba-crece-' || n || '@ejemplo.test', '', now(), now()
  from ids;

insert into public.profiles (user_id, nickname)
select uid, 'crece_' || lpad(n::text, 2, '0') from ids;

/* La liga de cada estudiante en un ciclo de una materia, para leer rápido. */
create temporary view nivel_de as
select m.subject_id, m.ciclo, i.n, m.liga
  from public.liga_membresia m
  join ids i on i.uid = m.user_id;

-- ═══════════════════════════════════════════════════════════════════════════
-- A · EL REPARTO: de un nivel a tres
--
-- La semana pasada: 23 personas en un solo nivel.
--   · 1..20 con actividad: el estudiante n tiene n*10 FP. El 13 tiene 140,
--     lo mismo que el 14: están empatados JUSTO en el borde entre el grupo 1
--     y el 2 (puesto 7 de 20, el último del primer tramo).
--   · el 1 tiene además 5000 FP de hace tres semanas: con acumulados sería el
--     primero; con el ciclo más reciente es el último.
--   · 21, 22 y 23 no tuvieron actividad la semana pasada (sí antes).
--   · el 24 no está: es quien llega a mitad de la semana del reparto.
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-crece-reparto', public.ciclo_actual() - 7, uid, 1 from ids where n <= 23;

insert into public.liga_ciclo (subject_id, ciclo, niveles)
values ('zzz-crece-reparto', public.ciclo_actual() - 7, 1);

insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-crece', 'zzz-crece-reparto',
       case when n = 13 then 140 else n * 10 end,
       'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n <= 20;

insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-vieja', 'zzz-crece-reparto',
       case when n = 1 then 5000 else 300 end,
       'medio', 'evaluativa',
       (public.ciclo_actual() - 20)::timestamp at time zone 'America/Bogota'
  from ids where n = 1 or n between 21 and 23;

insert into resultado_prueba
select 1, 'A · Precondición: 23 en un nivel, 20 activos, y ligas_para(20) pide 3',
  case when public.ligas_para(20) = 3
        and (select count(*) from nivel_de where subject_id = 'zzz-crece-reparto'
              and ciclo = public.ciclo_actual() - 7) = 23
       then 'PASA' else 'FALLA' end,
  format('ligas_para(20)=%s ; miembros la semana pasada=%s',
         public.ligas_para(20),
         (select count(*) from nivel_de where subject_id = 'zzz-crece-reparto'
           and ciclo = public.ciclo_actual() - 7));

select public.ligas_sembrar('zzz-crece-reparto');

insert into resultado_prueba
select 2, 'A · El reparto guarda 3 niveles y los 20 activos que lo decidieron',
  case when lc.niveles = 3 and lc.activos = 20 then 'PASA' else 'FALLA' end,
  format('liga_ciclo: niveles=%s activos=%s', lc.niveles, lc.activos)
from public.liga_ciclo lc
where lc.subject_id = 'zzz-crece-reparto' and lc.ciclo = public.ciclo_actual();

/*
 * rank() sobre 20 activos: 20..14 son los puestos 1..7 y el 13 empata en el 7.
 * Tramos: puestos 1-7 → grupo 1, 9-14 → grupo 2, 15-20 → grupo 3. El empate
 * lleva al 13 arriba: 8 en el grupo 1, 6 en el 2, y 6 activos + 3 inactivos
 * en el 3.
 */
insert into resultado_prueba
select 3, 'A · Tamaños: 8 / 6 / 9 (el empate engorda el de arriba, los inactivos el de abajo)',
  case when x.g1 = 8 and x.g2 = 6 and x.g3 = 9 then 'PASA' else 'FALLA' end,
  format('Avanzado=%s  Intermedio=%s  Emergente=%s', x.g1, x.g2, x.g3)
from (
  select
    count(*) filter (where liga = 1) as g1,
    count(*) filter (where liga = 2) as g2,
    count(*) filter (where liga = 3) as g3
  from nivel_de where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual()
) x;

insert into resultado_prueba
select 4, 'A · Manda el ciclo más reciente: el de 5000 acumulados queda abajo, el recién llegado arriba',
  case when x.el_1 = 3 and x.el_20 = 1 then 'PASA' else 'FALLA' end,
  format('el 1 (5010 acumulados, 10 la semana pasada) → nivel %s ; el 20 (200, sin historia) → nivel %s',
         x.el_1, x.el_20)
from (
  select
    (select liga from nivel_de where subject_id = 'zzz-crece-reparto'
      and ciclo = public.ciclo_actual() and n = 1) as el_1,
    (select liga from nivel_de where subject_id = 'zzz-crece-reparto'
      and ciclo = public.ciclo_actual() and n = 20) as el_20
) x;

insert into resultado_prueba
select 5, 'A · Empate en el borde: los dos al grupo de arriba',
  case when x.el_13 = 1 and x.el_14 = 1 then 'PASA' else 'FALLA' end,
  format('13 y 14, empatados en 140 en el puesto 7 → niveles %s y %s', x.el_13, x.el_14)
from (
  select
    (select liga from nivel_de where subject_id = 'zzz-crece-reparto'
      and ciclo = public.ciclo_actual() and n = 13) as el_13,
    (select liga from nivel_de where subject_id = 'zzz-crece-reparto'
      and ciclo = public.ciclo_actual() and n = 14) as el_14
) x;

insert into resultado_prueba
select 6, 'A · Sin actividad la semana pasada: al grupo de abajo, aunque tuvieran FP antes',
  case when count(*) = 3 then 'PASA' else 'FALLA' end,
  format('%s de 21, 22 y 23 en Emergente', count(*))
from nivel_de
where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual()
  and n between 21 and 23 and liga = 3;

insert into resultado_prueba
select 7, 'A · liga_reparto: una fila por repartido, todas tipo reparto y coherentes con la membresía',
  case when x.filas = 23 and x.bien = 23 then 'PASA' else 'FALLA' end,
  format('%s filas ; %s con tipo reparto, liga_antes 1 y liga_despues igual a su liga', x.filas, x.bien)
from (
  select
    count(*) as filas,
    count(*) filter (where r.tipo = 'reparto' and r.liga_antes = 1 and r.liga_despues = m.liga) as bien
  from public.liga_reparto r
  join public.liga_membresia m
    on m.subject_id = r.subject_id and m.ciclo = r.ciclo and m.user_id = r.user_id
  where r.subject_id = 'zzz-crece-reparto' and r.ciclo = public.ciclo_actual()
) x;

/* El reparto visto por un estudiante, con su rol de verdad. */
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 5), 'role', 'authenticated')::text, true);
set local role authenticated;

insert into resultado_prueba
select 8, 'A · El estudiante ve el reparto: 3 niveles, tipo reparto y N = 20 del dato',
  case when c.total_ligas = 3 and c.transicion = 'reparto' and c.activos_reparto = 20
        and c.liga_anterior = 1 and c.niveles_anterior = 1
       then 'PASA' else 'FALLA' end,
  format('total=%s transicion=%s N=%s liga_anterior=%s niveles_anterior=%s',
         c.total_ligas, c.transicion, c.activos_reparto, c.liga_anterior, c.niveles_anterior)
from public.liga_contexto('zzz-crece-reparto') c;

reset role;

/* Quien llega a mitad de la semana del reparto. */
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 24), 'role', 'authenticated')::text, true);
set local role authenticated;
select public.liga_entrar('zzz-crece-reparto');
insert into mira
select 'transicion_24', coalesce(c.transicion, 'ninguna') from public.liga_contexto('zzz-crece-reparto') c;
reset role;

insert into resultado_prueba
select 9, 'A · Quien llega a mitad de semana entra al medio y NO ve el mensaje del reparto',
  case when x.liga = 2 and x.transicion = 'ninguna' then 'PASA' else 'FALLA' end,
  format('el 24 entró al nivel %s ; su transición: %s', x.liga, x.transicion)
from (
  select
    (select liga from nivel_de where subject_id = 'zzz-crece-reparto'
      and ciclo = public.ciclo_actual() and n = 24) as liga,
    (select valor from mira where clave = 'transicion_24') as transicion
) x;

-- ───────────────────────────────────────────────────────────────────────────
-- A · EL DÍA OCHO: el primer cierre normal, con grupos de ~7
--
-- Se corre el reloj: la semana de antes pasa a ser hace dos, y la del reparto
-- pasa a ser la semana pasada. En dos pasos, para no chocar con la clave. Los
-- FP que deciden el movimiento son los mismos de antes: caen dentro de la
-- ventana de la semana que se cierra.
-- ───────────────────────────────────────────────────────────────────────────
update public.liga_membresia set ciclo = public.ciclo_actual() - 14
 where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual() - 7;
update public.liga_membresia set ciclo = public.ciclo_actual() - 7
 where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual();
update public.liga_ciclo set ciclo = public.ciclo_actual() - 14
 where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual() - 7;
update public.liga_ciclo set ciclo = public.ciclo_actual() - 7
 where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual();
update public.liga_reparto set ciclo = public.ciclo_actual() - 7
 where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual();

select public.ligas_sembrar('zzz-crece-reparto');

insert into resultado_prueba
select 10, 'A · Día ocho: semana normal, 3 niveles, sin filas de reparto',
  case when x.niveles = 3 and x.repartos = 0 then 'PASA' else 'FALLA' end,
  format('niveles=%s ; filas de reparto este ciclo=%s', x.niveles, x.repartos)
from (
  select
    (select lc.niveles from public.liga_ciclo lc
      where lc.subject_id = 'zzz-crece-reparto' and lc.ciclo = public.ciclo_actual()) as niveles,
    (select count(*) from public.liga_reparto r
      where r.subject_id = 'zzz-crece-reparto' and r.ciclo = public.ciclo_actual()) as repartos
) x;

/*
 * EL GRUPO DE 7. Intermedio tenía 7 personas: los 6 activos (7..12) y el 24,
 * que no tuvo FP. Suben 12, 11, 10; bajan 9, 8, 7; el 24 no se mueve. Los 6
 * activos cambian de nivel: todos.
 */
insert into resultado_prueba
select 11, 'A · Grupo de 7: suben 3, bajan 3, y solo se queda el que no tuvo actividad',
  case when x.subieron = 3 and x.bajaron = 3 and x.el_24 = 2 then 'PASA' else 'FALLA' end,
  format('de 10, 11, 12 subieron %s ; de 7, 8, 9 bajaron %s ; el 24 sigue en %s',
         x.subieron, x.bajaron, x.el_24)
from (
  select
    count(*) filter (where n in (10, 11, 12) and liga = 1) as subieron,
    count(*) filter (where n in (7, 8, 9) and liga = 3) as bajaron,
    max(liga) filter (where n = 24) as el_24
  from nivel_de where subject_id = 'zzz-crece-reparto' and ciclo = public.ciclo_actual()
) x;

/*
 * En todo el sistema: de Avanzado bajan 13, 14 y 15 (el empate del 13 y el 14
 * en 140 comparte el último puesto); de Intermedio se mueven 6; de Emergente
 * suben 6, 5 y 4. Doce de veinte activos cambian de nivel en una semana.
 */
insert into resultado_prueba
select 12, 'A · Día ocho en total: 12 de 20 activos cambian de nivel',
  case when count(*) = 12 then 'PASA' else 'FALLA' end,
  format('%s de 20 activos en un nivel distinto al de la semana del reparto', count(*))
from nivel_de ahora
join nivel_de antes
  on antes.subject_id = ahora.subject_id and antes.n = ahora.n
 and antes.ciclo = public.ciclo_actual() - 7
where ahora.subject_id = 'zzz-crece-reparto' and ahora.ciclo = public.ciclo_actual()
  and ahora.n <= 20 and ahora.liga <> antes.liga;

select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 12), 'role', 'authenticated')::text, true);
set local role authenticated;

insert into resultado_prueba
select 13, 'A · El que subió ve semana normal y sabe de dónde venía (2 de 3)',
  case when c.transicion is null and c.liga_anterior = 2 and c.niveles_anterior = 3 and c.total_ligas = 3
       then 'PASA' else 'FALLA' end,
  format('transicion=%s liga_anterior=%s niveles_anterior=%s total=%s',
         coalesce(c.transicion, 'ninguna'), c.liga_anterior, c.niveles_anterior, c.total_ligas)
from public.liga_contexto('zzz-crece-reparto') c;

reset role;

-- ═══════════════════════════════════════════════════════════════════════════
-- B · LA APERTURA DE ÉLITE: de tres niveles a cuatro
--
-- La semana pasada: 65 personas en tres niveles.
--   · Avanzado 1..20, Intermedio 21..40, Emergente 41..65.
--   · 1..60 activos: el n tiene (61 - n) * 10. El 11 tiene 510, igual que el
--     10: empatados justo en el corte de Élite (la mitad de 20 = puesto 10).
--   · 61..65 sin actividad.
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-crece-elite', public.ciclo_actual() - 7, uid,
       case when n <= 20 then 1 when n <= 40 then 2 else 3 end
  from ids;

insert into public.liga_ciclo (subject_id, ciclo, niveles)
values ('zzz-crece-elite', public.ciclo_actual() - 7, 3);

insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-crece', 'zzz-crece-elite',
       case when n = 11 then 510 else (61 - n) * 10 end,
       'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n <= 60;

insert into resultado_prueba
select 14, 'B · Precondición: 3 niveles guardados y ligas_para(60) pide 4',
  case when public.ligas_para(60) = 4
        and public.liga_niveles('zzz-crece-elite', public.ciclo_actual() - 7) = 3
       then 'PASA' else 'FALLA' end,
  format('ligas_para(60)=%s ; niveles la semana pasada=%s',
         public.ligas_para(60), public.liga_niveles('zzz-crece-elite', public.ciclo_actual() - 7));

select public.ligas_sembrar('zzz-crece-elite');

insert into resultado_prueba
select 15, 'B · Se guardan 4 niveles con los 60 activos',
  case when lc.niveles = 4 and lc.activos = 60 then 'PASA' else 'FALLA' end,
  format('niveles=%s activos=%s', lc.niveles, lc.activos)
from public.liga_ciclo lc
where lc.subject_id = 'zzz-crece-elite' and lc.ciclo = public.ciclo_actual();

insert into resultado_prueba
select 16, 'B · Avanzado se parte: 11 a Élite (el empate del corte sube) y 9 siguen en Avanzado',
  case when x.elite = 11 and x.avanzado = 9 and x.elite_bien = 11 then 'PASA' else 'FALLA' end,
  format('Élite=%s (de ellos, del 1 al 11: %s) ; Avanzado=%s', x.elite, x.elite_bien, x.avanzado)
from (
  select
    count(*) filter (where liga = 1) as elite,
    count(*) filter (where liga = 1 and n <= 11) as elite_bien,
    count(*) filter (where liga = 2) as avanzado
  from nivel_de where subject_id = 'zzz-crece-elite' and ciclo = public.ciclo_actual()
) x;

/*
 * NADIE BAJA, y por eso esa semana no hay movimiento: los mejores de
 * Intermedio (21, 22, 23) tampoco suben. Todo Intermedio pasa a la liga 3 y
 * todo Emergente a la 4 — el mismo nombre con otro número.
 */
insert into resultado_prueba
select 17, 'B · Nadie baja: Intermedio y Emergente cambian de número, no de nombre, y no se mueven',
  case when x.inter_bien = 20 and x.emerg_bien = 25 then 'PASA' else 'FALLA' end,
  format('Intermedio (21-40) en la liga 3: %s de 20 ; Emergente (41-65) en la 4: %s de 25',
         x.inter_bien, x.emerg_bien)
from (
  select
    count(*) filter (where n between 21 and 40 and liga = 3) as inter_bien,
    count(*) filter (where n between 41 and 65 and liga = 4) as emerg_bien
  from nivel_de where subject_id = 'zzz-crece-elite' and ciclo = public.ciclo_actual()
) x;

insert into resultado_prueba
select 18, 'B · El mensaje de Élite es solo para Avanzado: 20 filas tipo elite, ninguna fuera',
  case when x.elite = 20 and x.fuera = 0 then 'PASA' else 'FALLA' end,
  format('filas tipo elite de quienes estaban en Avanzado: %s ; de cualquier otro: %s', x.elite, x.fuera)
from (
  select
    count(*) filter (where r.tipo = 'elite' and r.liga_antes = 1) as elite,
    count(*) filter (where r.tipo <> 'elite' or r.liga_antes <> 1) as fuera
  from public.liga_reparto r
  where r.subject_id = 'zzz-crece-elite' and r.ciclo = public.ciclo_actual()
) x;

select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 15), 'role', 'authenticated')::text, true);
set local role authenticated;
insert into mira
select 'elite_15', coalesce(c.transicion, 'ninguna') || '/' || c.total_ligas
  from public.liga_contexto('zzz-crece-elite') c;
reset role;

select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 30), 'role', 'authenticated')::text, true);
set local role authenticated;
insert into mira
select 'elite_30', coalesce(c.transicion, 'ninguna') || '/' || c.total_ligas
  from public.liga_contexto('zzz-crece-elite') c;
reset role;

insert into resultado_prueba
select 19, 'B · Desde fuera: el 15 (se quedó en Avanzado) ve Élite; el 30 (Intermedio) no ve nada',
  case when (select valor from mira where clave = 'elite_15') = 'elite/4'
        and (select valor from mira where clave = 'elite_30') = 'ninguna/4'
       then 'PASA' else 'FALLA' end,
  format('el 15 → %s ; el 30 → %s',
         (select valor from mira where clave = 'elite_15'),
         (select valor from mira where clave = 'elite_30'));

-- ═══════════════════════════════════════════════════════════════════════════
-- C · EL GRUPO QUE SE VACÍA: tres niveles y solo 10 activos
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-crece-encoge', public.ciclo_actual() - 7, uid,
       case when n <= 8 then 1 when n <= 16 then 2 else 3 end
  from ids where n <= 23;

insert into public.liga_ciclo (subject_id, ciclo, niveles)
values ('zzz-crece-encoge', public.ciclo_actual() - 7, 3);

insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'act-crece', 'zzz-crece-encoge', n * 5, 'medio', 'evaluativa',
       (public.ciclo_actual() - 5)::timestamp at time zone 'America/Bogota'
  from ids where n <= 10;

select public.ligas_sembrar('zzz-crece-encoge');

insert into resultado_prueba
select 20, 'C · Con 10 activos los niveles no encogen: siguen 3, nadie repartido, nadie perdido',
  case when x.niveles = 3 and x.activos = 10 and x.repartos = 0 and x.miembros = 23
       then 'PASA' else 'FALLA' end,
  format('niveles=%s activos=%s repartos=%s miembros=%s', x.niveles, x.activos, x.repartos, x.miembros)
from (
  select
    (select lc.niveles from public.liga_ciclo lc
      where lc.subject_id = 'zzz-crece-encoge' and lc.ciclo = public.ciclo_actual()) as niveles,
    (select lc.activos from public.liga_ciclo lc
      where lc.subject_id = 'zzz-crece-encoge' and lc.ciclo = public.ciclo_actual()) as activos,
    (select count(*) from public.liga_reparto r
      where r.subject_id = 'zzz-crece-encoge' and r.ciclo = public.ciclo_actual()) as repartos,
    (select count(*) from nivel_de
      where subject_id = 'zzz-crece-encoge' and ciclo = public.ciclo_actual()) as miembros
) x;

-- ═══════════════════════════════════════════════════════════════════════════
-- LA RED: un ciclo roto hace fallar el cierre, con nombre
--
-- Directo sobre ligas_cerrar_ciclo, con un estado roto a mano: dos personas,
-- una en el nivel 2. Pedirle "al menos 5" o "un solo nivel" tiene que lanzar.
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-crece-red', public.ciclo_actual(), uid, n from ids where n <= 2;

do $red$
declare v_pierde text; v_rango text;
begin
  begin
    perform public.ligas_cerrar_ciclo('zzz-crece-red', public.ciclo_actual(), 3, 5, 0);
    v_pierde := 'NO LANZÓ';
  exception when others then v_pierde := sqlerrm;
  end;
  begin
    perform public.ligas_cerrar_ciclo('zzz-crece-red', public.ciclo_actual(), 1, 0, 0);
    v_rango := 'NO LANZÓ';
  exception when others then v_rango := sqlerrm;
  end;
  insert into resultado_prueba values (
    21, 'La red: perder gente o salirse de rango hace fallar el cierre, con nombre',
    case when v_pierde like '%debía tener al menos%' and v_rango like '%hay alguien en el nivel%'
         then 'PASA' else 'FALLA' end,
    format('pierde gente → %s  |  fuera de rango → %s', v_pierde, v_rango)
  );
end
$red$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PERMISOS
--
-- liga_contexto se recreó con drop, que se lleva los grants: aquí se comprueba
-- que anon quedó fuera y authenticated dentro.
-- ═══════════════════════════════════════════════════════════════════════════
insert into resultado_prueba
select 22, 'Internas cerradas a todo cliente, liga_contexto solo para authenticated, RLS forzada',
  case when not (x.internas_abiertas)
        and not x.anon_contexto and x.auth_contexto
        and x.rls_ciclo and x.rls_reparto
       then 'PASA' else 'FALLA' end,
  format('alguna interna ejecutable por anon o authenticated: %s ; liga_contexto anon/auth: %s/%s ; RLS forzada ciclo/reparto: %s/%s',
         x.internas_abiertas, x.anon_contexto, x.auth_contexto, x.rls_ciclo, x.rls_reparto)
from (
  select
    exists (
      select 1
        from unnest(array[
          'public.liga_niveles(text, date)',
          'public.ligas_cerrar_ciclo(text, date, integer, integer, integer)',
          'public.ligas_repartir(text, date, date, integer)',
          'public.ligas_abrir_elite(text, date, date)',
          'public.ligas_transicion(text, date, date, integer, integer)'
        ]) f(firma)
        cross join unnest(array['anon', 'authenticated']) r(rol)
       where has_function_privilege(r.rol, f.firma, 'execute')
    ) as internas_abiertas,
    has_function_privilege('anon', 'public.liga_contexto(text)', 'execute') as anon_contexto,
    has_function_privilege('authenticated', 'public.liga_contexto(text)', 'execute') as auth_contexto,
    (select c.relrowsecurity and c.relforcerowsecurity from pg_class c
      where c.oid = 'public.liga_ciclo'::regclass) as rls_ciclo,
    (select c.relrowsecurity and c.relforcerowsecurity from pg_class c
      where c.oid = 'public.liga_reparto'::regclass) as rls_reparto
) x;

-- ═══════════════════════════════════════════════════════════════════════════
-- LAS MATERIAS REALES, IGUAL QUE ANTES
-- ═══════════════════════════════════════════════════════════════════════════
insert into resultado_prueba
select 23, 'Ninguna materia real quedó tocada: membresía, liga_ciclo ni liga_reparto',
  case when not exists (
         (select subject_id, ciclo, user_id, liga from public.liga_membresia
           where subject_id in ('macroeconomia', 'pensamiento-estrategico'))
         except (select * from reales_membresia))
        and not exists (
         (select * from reales_membresia)
         except (select subject_id, ciclo, user_id, liga from public.liga_membresia
                  where subject_id in ('macroeconomia', 'pensamiento-estrategico')))
        and not exists (
         (select subject_id, ciclo, niveles, activos from public.liga_ciclo
           where subject_id in ('macroeconomia', 'pensamiento-estrategico'))
         except (select * from reales_ciclo))
        and not exists (
         (select * from reales_ciclo)
         except (select subject_id, ciclo, niveles, activos from public.liga_ciclo
                  where subject_id in ('macroeconomia', 'pensamiento-estrategico')))
        and not exists (
         (select subject_id, ciclo, user_id, tipo, liga_antes, liga_despues from public.liga_reparto
           where subject_id in ('macroeconomia', 'pensamiento-estrategico'))
         except (select * from reales_reparto))
        and not exists (
         (select * from reales_reparto)
         except (select subject_id, ciclo, user_id, tipo, liga_antes, liga_despues from public.liga_reparto
                  where subject_id in ('macroeconomia', 'pensamiento-estrategico')))
       then 'PASA' else 'FALLA' end,
  format('antes y después: %s filas de membresía, %s de liga_ciclo, %s de liga_reparto',
         (select count(*) from reales_membresia), (select count(*) from reales_ciclo),
         (select count(*) from reales_reparto));

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
            or (select count(*) from resultado_prueba) <> 23
       then 'HAY FALLOS' else 'LOS 23 PASAN' end,
  format('%s de 23 en verde', (select count(*) from resultado_prueba where resultado = 'PASA'))
order by 1;

rollback;
