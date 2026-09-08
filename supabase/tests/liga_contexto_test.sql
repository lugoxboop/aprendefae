-- Prueba de liga_contexto (migración 0025).
--
-- Se pega entero en el SQL Editor de Supabase, o lo corre el workflow de CI
-- sobre un Postgres limpio. Crea sus propios datos, comprueba, y termina en
-- ROLLBACK: no deja rastro.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- LO QUE ESTA PRUEBA EXISTE PARA CAZAR
--
-- La función se EJECUTA con una sesión de estudiante de verdad, no solo se
-- comprueba que exista. Es la lección del 42702 de `panel_actividad`: en
-- plpgsql las columnas del `returns table` son variables en ámbito, así que un
-- choque de nombres no lo ve `create function` —la migración dice "Success"—
-- y revienta la primera vez que alguien la llama. Nada que no ejecute la
-- función con sesión puede detectar esa clase de fallo.
--
-- Y se comprueba el CONTENIDO, no solo que devuelva filas. Una función que
-- devolviera tres ceros pasaría cualquier prueba que solo cuente filas.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- EL ESCENARIO VIVE EN MATERIAS INVENTADAS
--
--   zzz-prueba-contexto   cuatro ciclos: uno con un solo nivel y tres con tres
--                         niveles. Sirve para el recuento de ciclos y para el
--                         nivel anterior.
--   zzz-prueba-un-nivel   un solo ciclo con un solo nivel. Es el estado de HOY
--                         en producción, y el que decide que no haya nombre.
--
-- Las membresías se insertan directamente en vez de simular semanas con
-- `ligas_sembrar`. Es a propósito: aquí se prueba `liga_contexto`, que solo
-- lee. Hacer pasar el escenario por el sembrador metería la lógica de reparto
-- —que ya tiene su propia prueba en ligas_test.sql— dentro de esta, y un fallo
-- allí saldría rojo aquí sin que esta función tuviera nada que ver.
--
-- LOS NUEVE deben decir PASA.

begin;

create temporary table resultado_prueba (
  n         integer,
  chequeo   text,
  resultado text,
  detalle   text
) on commit drop;

/* Los chequeos que suplantan a un estudiante corren como `authenticated`, que
   no es dueño de estas tablas temporales. Sin esto, Postgres los para antes de
   llegar a probar nada de ligas. */
grant all on resultado_prueba to authenticated;

create temporary table ids (n integer, uid uuid) on commit drop;
grant select on ids to authenticated;
insert into ids (n, uid) select g, gen_random_uuid() from generate_series(1, 5) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'prueba-contexto-' || n || '@ejemplo.test', '', now(), now()
  from ids;

insert into public.profiles (user_id, nickname)
select uid, 'ctx_' || lpad(n::text, 2, '0') from ids;

-- ---------------------------------------------------------------------------
-- Los cuatro ciclos de zzz-prueba-contexto
--
--   -21 días   los 5 en la liga 1            → UN nivel. No cuenta.
--   -14 días   repartidos en 3 ligas         → estreno
--    -7 días   repartidos; el usuario 1 en 2 → primera reordenación
--     hoy      repartidos; el usuario 1 en 1 → subió
--
-- El usuario 5 se salta la semana pasada a propósito: su nivel anterior tiene
-- que salir de hace dos semanas, no de un null.
-- ---------------------------------------------------------------------------
insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-prueba-contexto', public.ciclo_actual() - 21, uid, 1 from ids;

insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-prueba-contexto', public.ciclo_actual() - 14, uid,
       case when n <= 2 then 1 when n <= 4 then 2 else 3 end
  from ids;

insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-prueba-contexto', public.ciclo_actual() - 7, uid,
       case when n = 1 then 2 when n <= 3 then 1 else 3 end
  from ids
 where n <> 5;                       -- el 5 no compitió esa semana

insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-prueba-contexto', public.ciclo_actual(), uid,
       case when n <= 2 then 1 when n <= 4 then 2 else 3 end
  from ids;

/* La otra materia: un solo nivel, como Pensamiento Estratégico hoy. */
insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
select 'zzz-prueba-un-nivel', public.ciclo_actual(), uid, 1 from ids;

-- ---------------------------------------------------------------------------
-- 1. La función existe con la firma que el cliente llama
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 1, 'liga_contexto(text) existe, una sola definición',
  case when count(*) = 1 then 'PASA' else 'FALLA' end,
  format('%s definiciones encontradas', count(*))
from pg_proc p
join pg_namespace ns on ns.oid = p.pronamespace
where ns.nspname = 'public' and p.proname = 'liga_contexto';

-- ---------------------------------------------------------------------------
-- 2, 3 y 4. EJECUTADA con sesión de estudiante. Aquí es donde saldría un 42702.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 1), 'role', 'authenticated')::text, true);

set local role authenticated;

insert into resultado_prueba
select 2, 'Ejecuta con sesión y devuelve exactamente una fila',
  case when count(*) = 1 then 'PASA' else 'FALLA' end,
  format('%s filas', count(*))
from public.liga_contexto('zzz-prueba-contexto');

insert into resultado_prueba
select 3, 'total_ligas = 3 y ciclos_con_niveles = 3 (el ciclo de un nivel no cuenta)',
  case when c.total_ligas = 3 and c.ciclos_con_niveles = 3 then 'PASA' else 'FALLA' end,
  format('total_ligas=%s  ciclos_con_niveles=%s  (hay 4 ciclos, uno con un solo nivel)',
         c.total_ligas, c.ciclos_con_niveles)
from public.liga_contexto('zzz-prueba-contexto') c;

insert into resultado_prueba
select 4, 'liga_anterior es la del ciclo pasado, no la de este',
  case when c.liga_anterior = 2 then 'PASA' else 'FALLA' end,
  format('este ciclo está en la 1 y liga_anterior dice %s (esperado 2: subió)', c.liga_anterior)
from public.liga_contexto('zzz-prueba-contexto') c;

-- ---------------------------------------------------------------------------
-- 5. La materia de un solo nivel
--
-- Es el estado de producción hoy. Si esto devolviera 3 o 0 en vez de 1, la
-- interfaz enseñaría un nombre de nivel donde no debe haber ninguno.
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 5, 'Con un solo nivel: total_ligas = 1 y ciclos_con_niveles = 0',
  case when c.total_ligas = 1 and c.ciclos_con_niveles = 0 then 'PASA' else 'FALLA' end,
  format('total_ligas=%s  ciclos_con_niveles=%s', c.total_ligas, c.ciclos_con_niveles)
from public.liga_contexto('zzz-prueba-un-nivel') c;

-- ---------------------------------------------------------------------------
-- 6. Una materia donde quien pregunta nunca ha estado
--
-- No es un error: es un cero. La interfaz lo trata como "sin nombre".
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 6, 'Materia sin membresías: ceros y nulo, sin reventar',
  case when c.total_ligas = 0 and c.ciclos_con_niveles = 0 and c.liga_anterior is null
       then 'PASA' else 'FALLA' end,
  format('total_ligas=%s  ciclos_con_niveles=%s  liga_anterior=%s',
         c.total_ligas, c.ciclos_con_niveles, coalesce(c.liga_anterior::text, 'null'))
from public.liga_contexto('zzz-materia-que-no-existe') c;

reset role;

-- ---------------------------------------------------------------------------
-- 7. El que se saltó una semana
--
-- Su nivel anterior sale del ciclo más reciente ANTERIOR a este, que para él
-- es el de hace dos semanas. Buscar "hace exactamente 7 días" daría null.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid::text from ids where n = 5), 'role', 'authenticated')::text, true);

set local role authenticated;

insert into resultado_prueba
select 7, 'Quien se saltó una semana toma el ciclo anterior más reciente que sí tiene',
  case when c.liga_anterior = 3 then 'PASA' else 'FALLA' end,
  format('sin fila hace 7 días; liga_anterior dice %s (esperado 3, la de hace 14)',
         coalesce(c.liga_anterior::text, 'null'))
from public.liga_contexto('zzz-prueba-contexto') c;

reset role;

-- ---------------------------------------------------------------------------
-- 8. Sin sesión: 42501, y no otra cosa
--
-- Importa el CÓDIGO, no que falle. Una función rota también falla, y con un
-- chequeo de "lanza excepción" a secas las dos cosas se ven idénticas — que es
-- justo lo que dejó pasar el 42702 en la sonda de despliegue.
-- ---------------------------------------------------------------------------
do $prueba$
declare v_codigo text;
begin
  perform set_config('request.jwt.claims', '', true);
  begin
    perform 1 from public.liga_contexto('zzz-prueba-contexto');
    insert into resultado_prueba
      values (8, 'Sin sesión responde 42501', 'FALLA', 'no lanzó ninguna excepción');
  exception when others then
    get stacked diagnostics v_codigo = returned_sqlstate;
    insert into resultado_prueba
      values (8, 'Sin sesión responde 42501',
              case when v_codigo = '42501' then 'PASA' else 'FALLA' end,
              format('código devuelto: %s', v_codigo));
  end;
end
$prueba$;

-- ---------------------------------------------------------------------------
-- 9. anon no puede ejecutarla, y ninguna materia real quedó tocada
-- ---------------------------------------------------------------------------
insert into resultado_prueba
select 9, 'anon sin permiso de ejecución y ninguna materia real tocada',
  case when not has_function_privilege('anon', 'public.liga_contexto(text)', 'execute')
        and not exists (
          select 1 from public.liga_membresia
           where subject_id in ('macroeconomia', 'pensamiento-estrategico')
        )
       then 'PASA' else 'FALLA' end,
  format('anon puede ejecutar: %s ; el escenario vivió entero en materias de prueba',
         has_function_privilege('anon', 'public.liga_contexto(text)', 'execute'));

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
