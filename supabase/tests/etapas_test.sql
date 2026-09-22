-- ---------------------------------------------------------------------------
-- Prueba de la regla de desafíos de varias etapas (migración 0014), contra la
-- función REALMENTE desplegada.
--
-- POR QUÉ EXISTE. La 0014 hace dos cosas que no se ven mirando el archivo:
-- añade una columna a una tabla que ya tenía filas, y reemplaza registrar_fp
-- por una versión derivada. Lo primero puede dejar filas viejas con un valor
-- que no esperábamos; lo segundo, si la derivación hubiera salido mal, cambiaría
-- en silencio cómo pagan TODAS las actividades, no solo el desafío. Los dos
-- riesgos se comprueban aquí, y el segundo es el que de verdad importa.
--
-- QUIÉN ES QUIÉN. Solo se cambia a `authenticated` para llamar a registrar_fp,
-- que es lo único que necesita sesión porque usa auth.uid(). Todo lo demás
-- —crear el usuario, sembrar filas de catálogo inventadas, anotar resultados—
-- se hace como dueño. Así las tablas temporales nunca se tocan desde otro rol y
-- no hace falta ni un grant, que fue lo que rompió racha_test la primera vez.
--
-- No toca a nadie real: usuario propio, actividades inventadas con prefijo zzz,
-- y ROLLBACK al final. La única actividad real que se usa es 'proyecto-arca',
-- y su fila del catálogo no se modifica: solo se lee.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-etapas@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-etapas@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzetapasprueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- Filas de catálogo inventadas. Se meten como dueño; RLS forzado no le aplica
-- al rol postgres del editor SQL porque tiene BYPASSRLS.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('zzz-desafio-parcial', 'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 4),
  ('zzz-desafio-piso',    'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 4),
  ('zzz-desafio-rapido',  'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 4),
  ('zzz-desafio-nueve',   'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 9);

-- Esta se inserta SIN la columna, a propósito: comprueba el valor por defecto.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('zzz-normal-sin-etapas', 'zzz-materia', 'zzz-tema', 'evaluativa', 'dificil', 50);

-- ── 1. La columna existe y su defecto es 1 ─────────────────────────────────
insert into res select 1, 'una fila sin etapas declaradas vale 1', '1',
  (select etapas::text from public.actividad_catalogo where activity_id = 'zzz-normal-sin-etapas'),
  (select etapas = 1 from public.actividad_catalogo where activity_id = 'zzz-normal-sin-etapas');

-- ── 2. Ninguna actividad vieja quedó con etapas raras ──────────────────────
-- La columna se añadió a una tabla que ya tenía filas. Si el default no hubiera
-- aplicado, alguna actividad de siempre pagaría de más sin que nadie lo note.
--
-- Se excluyen las filas zzz que siembra esta misma prueba: sin ese filtro el
-- chequeo se contaba a sí mismo y fallaba siempre.
--
-- Y se excluyen los desafíos, que son los únicos que declaran más de una etapa
-- a propósito. La lista es explícita y no un `etapas > 1` cualquiera: así,
-- cuando alguien le ponga etapas a una actividad normal por error, esto lo
-- caza igual que el día que se escribió. El desafío nuevo que llegue hay que
-- añadirlo aquí a mano, que es exactamente la fricción que se busca.
insert into res select 2, 'las actividades reales que no son desafío siguen en 1 etapa', '0 con etapas>1',
  (select count(*)::text || ' con etapas>1'
     from public.actividad_catalogo
    where etapas > 1 and activity_id not in ('proyecto-arca', 'comite-nova') and activity_id not like 'zzz-%'),
  (select count(*) = 0 from public.actividad_catalogo
    where etapas > 1 and activity_id not in ('proyecto-arca', 'comite-nova') and activity_id not like 'zzz-%');

-- ── 13. Y los dos desafíos declaran sus cuatro etapas ─────────────────────
-- El complemento del chequeo de arriba: excluirlos de la cuenta no puede
-- significar dejar de mirarlos.
insert into res select 13, 'los dos desafíos declaran 4 etapas y base 90', '2 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where activity_id in ('proyecto-arca', 'comite-nova') and etapas = 4 and fp_base = 90),
  (select count(*) = 2 from public.actividad_catalogo
    where activity_id in ('proyecto-arca', 'comite-nova') and etapas = 4 and fp_base = 90);

-- ── 3. Lo de siempre sigue pagando lo de siempre ───────────────────────────
-- EL CHEQUEO MÁS IMPORTANTE DEL ARCHIVO. registrar_fp se reemplazó entera; si
-- la derivación hubiera salido mal, esto es lo que lo delata.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-normal-sin-etapas', 200000, 100);
reset role;

insert into res select 3, 'una evaluativa difícil al 100% sigue pagando su base', '50',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-normal-sin-etapas'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-normal-sin-etapas');

-- ── 4. El desafío real está en el catálogo con sus cuatro etapas ───────────
insert into res select 4, 'proyecto-arca existe y declara 4 etapas', 'experto/90/4',
  coalesce((select dificultad || '/' || fp_base || '/' || etapas
              from public.actividad_catalogo where activity_id = 'proyecto-arca'),
           'NO ESTÁ'),
  (select dificultad = 'experto' and fp_base = 90 and etapas = 4
     from public.actividad_catalogo where activity_id = 'proyecto-arca');

-- ── 5. El desafío al 100% paga 360 ─────────────────────────────────────────
-- 90 de base × 4 etapas. Duración por encima del mínimo de experto (150 s)
-- para que no entre la defensa de tiempo.
set local role authenticated;
select fp_awarded from public.registrar_fp('proyecto-arca', 600000, 100);
reset role;

insert into res select 5, 'el desafío completo al 100% paga base × 4', '360',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca'),
  (select fp_awarded = 360 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca');

-- ── 6. Repetir el desafío no paga ──────────────────────────────────────────
set local role authenticated;
select fp_awarded from public.registrar_fp('proyecto-arca', 600000, 100);
reset role;

insert into res select 6, 'repetir el desafío paga 0', '0',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca' and repeat_index = 1),
  (select fp_awarded = 0 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca' and repeat_index = 1);

-- ── 7. Un desempeño parcial escala sobre los 360 ───────────────────────────
-- El 68% es el resultado de la partida imperfecta que se jugó en el navegador:
-- 243 de 360 puntos repartidos entre las cuatro etapas. round(360 × 0.68) = 245.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-parcial', 600000, 68);
reset role;

insert into res select 7, 'un desafío al 68% paga 245', '245',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-parcial'),
  (select fp_awarded = 245 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-parcial');

-- ── 8. El piso del 50% también se multiplica ───────────────────────────────
-- Decisión confirmada: un desafío fallado entero paga 180. Está aquí escrito
-- como número para que, si algún día se cambia, se vea qué se está cambiando.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-piso', 600000, 0);
reset role;

insert into res select 8, 'un desafío al 0% cae al piso: la mitad de 360', '180',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-piso'),
  (select fp_awarded = 180 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-piso');

-- ── 9. El tope de cuatro etapas lo aplica el servidor ──────────────────────
-- La fila declara 9. Si el tope viviera en la fila y no en el cálculo, esto
-- pagaría 810 y sería la forma de inflar puntos partiendo una actividad.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-nueve', 600000, 100);
reset role;

insert into res select 9, 'una fila que declara 9 etapas paga como 4', '360',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-nueve'),
  (select fp_awarded = 360 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-nueve');

-- ── 10. La defensa de tiempo se aplica sobre el total ya multiplicado ──────
-- 360 × 100% × 0.6 = 216. Y el mínimo NO escala con las etapas: es una decisión
-- tomada, no un descuido —escalarlo a diez minutos penalizaría una demostración
-- en clase— así que 1 s basta para dispararla en un desafío de cuatro etapas.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-rapido', 1000, 100);
reset role;

insert into res select 10, 'terminar demasiado rápido recorta el total al 60%', '216',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-rapido'),
  (select fp_awarded = 216 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-rapido');

-- ── 11. La escritura directa sigue cerrada ─────────────────────────────────
-- La 0012 la cerró; la 0014 reemplaza la función y no debería reabrirla.
--
-- El resultado sale del bloque por set_config y NO escribiendo en `res`: `res`
-- es del dueño, y escribirla siendo `authenticated` es exactamente el error
-- "permission denied for table res" que rompió racha_test la primera vez.
set local role authenticated;
do $puerta$
begin
  insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded,
                                 difficulty, modality, repeat_index)
  values (auth.uid(), 'zzz-a-mano', 'zzz-materia', 99999, 'experto', 'evaluativa', 0);
  perform set_config('prueba.puerta', 'ABIERTA', true);
exception when others then
  perform set_config('prueba.puerta', 'rechazado', true);
end;
$puerta$;
reset role;

insert into res select 11, 'insertar en el historial a mano queda rechazado', 'rechazado',
  current_setting('prueba.puerta', true),
  current_setting('prueba.puerta', true) = 'rechazado';

-- ── 12. El total del perfil cuadra con el historial ────────────────────────
insert into res select 12, 'points del perfil = suma del historial',
  (select coalesce(sum(fp_awarded), 0)::text from public.fp_history where user_id = (select uid from ids)),
  (select points::text from public.profiles where user_id = (select uid from ids)),
  (select p.points = (select coalesce(sum(fp_awarded), 0) from public.fp_history where user_id = p.user_id)
     from public.profiles p where p.user_id = (select uid from ids));

-- ── Resumen. Única consulta que devuelve filas. ────────────────────────────
select
  n::text as n, paso, esperado, obtenido,
  case when ok then 'OK' else 'FALLA' end as estado
from res
union all
select
  'TOTAL',
  (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res),
  '', '',
  (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
