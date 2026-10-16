-- ---------------------------------------------------------------------------
-- Prueba de la migración 0015, contra el catálogo REALMENTE desplegado.
--
-- POR QUÉ EXISTE. La 0015 hace tres cosas que no se ven leyendo el archivo:
-- añade una columna a una tabla que ya tenía filas, marca una actividad como
-- retirada, y da de alta dos juegos nuevos. Los tres riesgos son de los que no
-- avisan:
--
--   · Si el default de la columna no aplicara, alguna actividad viva podría
--     quedar marcada como retirada sin que nadie lo note.
--   · Si la lápida no quedara puesta, el retiro no sería tal.
--   · Si las dos altas quedaran con otra dificultad, pagarían otra cosa.
--
-- Y hay un cuarto, el más importante: que la 0015 no haya movido nada de
-- fp_history ni de los puntos de nadie. Eso se comprueba explícitamente.
--
-- QUIÉN ES QUIÉN. Solo se cambia a `authenticated` para llamar a registrar_fp,
-- que es lo único que necesita una sesión: usa auth.uid(). Todo lo demás
-- —crear el usuario, escribir en la tabla temporal `res`— se hace como dueño.
-- Escribir en `res` siendo `authenticated` da "permission denied for table res",
-- que es el error que rompió racha_test la primera vez.
--
-- Para sacar un resultado de dentro de un bloque `do $$` que corre como
-- authenticated se usa set_config/current_setting, nunca un insert a `res`.
--
-- No toca a nadie real: usuario propio con email zzz-*, y ROLLBACK al final.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;
create temp table antes(filas bigint, suma bigint) on commit drop;

-- Foto del historial ANTES de tocar nada, para poder comprobar al final que
-- esta prueba no le movió una sola fila a nadie.
insert into antes select count(*), coalesce(sum(fp_awarded), 0) from public.fp_history;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-retiro@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-retiro@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzretiroprueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 1. La columna existe, es boolean, y su defecto es de verdad false ─────
-- SE INSERTA UNA FILA SIN NOMBRAR `retirada` y se mira cómo sale. La versión
-- anterior de este paso decía "con default false" y solo comprobaba
-- data_type = 'boolean': el default aparecía en la columna que se muestra,
-- nunca en la condición. Con un `default true` habría dado OK igual.
--
-- SI FALLARA DE VERDAD: con el default en true, la fila zzz saldría retirada y
-- este paso daría FALLA. Sin la columna, el insert reventaría antes. Se prueba
-- el comportamiento y no la cadena del catálogo, que además cambia de forma
-- entre versiones de Postgres.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('zzz-default-retirada', 'zzz-materia', 'zzz-tema', 'evaluativa', 'facil', 10);

insert into res
select 1, 'retirada es boolean y una fila nueva nace en false', 'boolean/false',
  coalesce((select c.data_type || '/' ||
                   (select case when a.retirada then 'true' else 'false' end
                      from public.actividad_catalogo a
                     where a.activity_id = 'zzz-default-retirada')
              from information_schema.columns c
             where c.table_schema = 'public' and c.table_name = 'actividad_catalogo'
               and c.column_name = 'retirada'), 'NO EXISTE'),
  (select c.data_type = 'boolean' and c.is_nullable = 'NO'
     from information_schema.columns c
    where c.table_schema = 'public' and c.table_name = 'actividad_catalogo'
      and c.column_name = 'retirada')
  and (select not retirada from public.actividad_catalogo
        where activity_id = 'zzz-default-retirada');

-- ── 2. Solo están retiradas las que se retiraron a propósito ────────────────
-- Si el default no hubiera aplicado, aquí saldrían de más. Cada retiro blando
-- (puerta del #289) se añade a esta lista en el mismo PR: 0015 el dashboard;
-- 0076 b5-t6-a7 y 0077 b5-t6-a5 (Célula B); 0208 t4-el-control-que-se-saltaron,
-- t4-al-empleado-o-al-gasto y t4-quien-se-entero-primero (Célula D); 0115
-- t7-2-debe-o-haber, t7-2-periodico-o-permanente, t7-3-comercial-o-condicionado
-- y t7-3-que-entra-al-costo (Célula C).
insert into res select 2, 'solo están retiradas las retiradas a propósito', 'b5-t6-a5, b5-t6-a7, dashboard-economico, t4-al-empleado-o-al-gasto, t4-el-control-que-se-saltaron, t4-quien-se-entero-primero, t7-2-debe-o-haber, t7-2-periodico-o-permanente, t7-3-comercial-o-condicionado, t7-3-que-entra-al-costo',
  coalesce((select string_agg(activity_id, ', ' order by activity_id)
              from public.actividad_catalogo where retirada), 'ninguna'),
  (select coalesce(string_agg(activity_id, ',' order by activity_id), '') = 'b5-t6-a5,b5-t6-a7,dashboard-economico,t4-al-empleado-o-al-gasto,t4-el-control-que-se-saltaron,t4-quien-se-entero-primero,t7-2-debe-o-haber,t7-2-periodico-o-permanente,t7-3-comercial-o-condicionado,t7-3-que-entra-al-costo'
     from public.actividad_catalogo where retirada);

-- ── 3. La lápida sigue ahí: retirada NO es lo mismo que borrada ────────────
insert into res select 3, 'la fila del dashboard sigue existiendo', 'existe',
  (select case when count(*) = 1 then 'existe' else 'no está' end
     from public.actividad_catalogo where activity_id = 'dashboard-economico'),
  (select count(*) = 1 from public.actividad_catalogo where activity_id = 'dashboard-economico');

-- ── 4 y 5. Los dos juegos nuevos, con su dificultad y sus puntos ───────────
insert into res select 4, 'diagnostico-en-vivo entró como medio con 25', 'evaluativa/medio/25',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'diagnostico-en-vivo'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'medio' and fp_base = 25 and not retirada
     from public.actividad_catalogo where activity_id = 'diagnostico-en-vivo');

insert into res select 5, 'arma-grupo-logico entró como difícil con 50', 'evaluativa/dificil/50',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base
              from public.actividad_catalogo where activity_id = 'arma-grupo-logico'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'dificil' and fp_base = 50 and not retirada
     from public.actividad_catalogo where activity_id = 'arma-grupo-logico');

-- ── 6 y 7. Los juegos nuevos pagan lo que dicen ────────────────────────────
-- Evaluativa al 100% y con tiempo de sobra: la base entera.
set local role authenticated;
select public.registrar_fp('diagnostico-en-vivo', 120000, 100);
reset role;

insert into res select 6, 'diagnostico-en-vivo al 100% paga 25', '25',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'diagnostico-en-vivo'),
  (select fp_awarded = 25 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'diagnostico-en-vivo');

set local role authenticated;
select public.registrar_fp('arma-grupo-logico', 200000, 100);
reset role;

insert into res select 7, 'arma-grupo-logico al 100% paga 50', '50',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'arma-grupo-logico'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'arma-grupo-logico');

-- ── 8. Repetir no paga, tampoco en las actividades recién metidas ──────────
-- Segunda vuelta a arma-grupo-logico, esta vez con 0%. Da 0 por la regla de
-- repetición de la 0011, que manda por encima del piso del 50%: si pagara 25
-- —el piso— sería que la fila nueva no está contando bien las repeticiones.
set local role authenticated;
select public.registrar_fp('arma-grupo-logico', 200000, 0);
reset role;

insert into res select 8, 'repetir no paga, ni siquiera con otro porcentaje', '0',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'arma-grupo-logico' and repeat_index = 1),
  (select fp_awarded = 0 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'arma-grupo-logico' and repeat_index = 1);

-- ── 9. Una actividad retirada NO revienta: era el motivo de la lápida ──────
-- Un cliente con caché vieja tiene que recibir respuesta, no una excepción.
set local role authenticated;
do $lapida$
begin
  perform public.registrar_fp('dashboard-economico', 200000, 100);
  perform set_config('prueba.lapida', 'responde', true);
exception when others then
  perform set_config('prueba.lapida', 'REVIENTA: ' || sqlerrm, true);
end;
$lapida$;
reset role;

insert into res select 9, 'llamar a una retirada responde en vez de reventar', 'responde',
  current_setting('prueba.lapida', true),
  current_setting('prueba.lapida', true) = 'responde';

-- ── 10. Una actividad que no existe SÍ tiene que reventar ──────────────────
-- El contraste del paso 9: la lápida abre la puerta a la retirada, no a todas.
set local role authenticated;
do $fantasma$
begin
  perform public.registrar_fp('zzz-actividad-que-no-existe', 200000, 100);
  perform set_config('prueba.fantasma', 'PASÓ', true);
exception when others then
  perform set_config('prueba.fantasma', 'rechazada', true);
end;
$fantasma$;
reset role;

insert into res select 10, 'una actividad inexistente sigue siendo rechazada', 'rechazada',
  current_setting('prueba.fantasma', true),
  current_setting('prueba.fantasma', true) = 'rechazada';

-- ── 11. Ninguna actividad viva perdió su configuración ─────────────────────
-- La 0015 solo debía añadir una columna. Si hubiera tocado otra cosa, aquí se
-- vería: estas cuatro son de temas que la migración ni menciona.
--
-- La cuarta era 'simulador-da' hasta que la 0022 lo borró del catálogo con el
-- simulador entero. Se cambia por 'constructor-mapa-causal', que cumple lo
-- mismo —tema que la 0015 no toca, dificultad y puntos estables desde la
-- 0011—. Dejarlo habría hecho fallar esta prueba por algo que la 0015 no hizo.
insert into res select 11, 'las actividades de otros temas siguen intactas', '4 de 4',
  (select count(*)::text || ' de 4' from public.actividad_catalogo
    where (activity_id = 'camara-presion'         and dificultad = 'medio'   and fp_base = 25)
       or (activity_id = 'arquitecto-profundidades' and dificultad = 'experto' and fp_base = 90)
       or (activity_id = 'proyecto-arca'          and dificultad = 'experto' and fp_base = 90 and etapas = 4)
       or (activity_id = 'constructor-mapa-causal' and dificultad = 'dificil' and fp_base = 50)),
  (select count(*) = 4 from public.actividad_catalogo
    where (activity_id = 'camara-presion'         and dificultad = 'medio'   and fp_base = 25)
       or (activity_id = 'arquitecto-profundidades' and dificultad = 'experto' and fp_base = 90)
       or (activity_id = 'proyecto-arca'          and dificultad = 'experto' and fp_base = 90 and etapas = 4)
       or (activity_id = 'constructor-mapa-causal' and dificultad = 'dificil' and fp_base = 50));

-- ── 12. El historial de los demás no se movió ──────────────────────────────
-- Lo único que fp_history puede haber ganado son las filas de ESTA prueba, que
-- el ROLLBACK se lleva. Si el número no cuadra, algo tocó datos ajenos.
insert into res select 12, 'nadie más ganó ni perdió filas de historial',
  (select filas::text || ' filas ajenas' from antes),
  (select count(*) filter (where user_id <> (select uid from ids))::text || ' filas ajenas'
     from public.fp_history),
  (select count(*) filter (where user_id <> (select uid from ids)) = (select filas from antes)
     from public.fp_history);

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
