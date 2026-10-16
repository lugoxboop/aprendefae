-- ---------------------------------------------------------------------------
-- Prueba de la 0208 y la 0209 (Célula D): el corte de calidad de los Hacer de
-- T4, contra el catálogo REALMENTE desplegado.
--
--   0208 · retiro blando de H2, H5 y H6 (t4-el-control-que-se-saltaron,
--          t4-al-empleado-o-al-gasto, t4-quien-se-entero-primero)
--   0209 · H4 (t4-el-arqueo-de-rosa), con H5 dentro, a difícil · 50
--
-- Lo que se comprueba:
--   1 · las tres quedaron retiradas, y SIGUEN en el catálogo (retiro blando:
--       no se borró nada)
--   2 · H4 quedó evaluativa · difícil · 50 · 1 etapa, y no retirada
--   3 · H4 al 100 % paga 50
--   4 · llamar a una retirada (un cliente con caché vieja) responde en vez de
--       reventar, como la lápida de la 0015
--   5 · las otras de T4 (H1, H3, H7, H8) siguen como las dejaron sus
--       migraciones, y no retiradas
--   6 · correr la 0208 y la 0209 otra vez no cambia nada (idempotentes)
--   7 · la prueba no movió una sola fila de fp_history fuera de su usuario
--
-- No toca a nadie real: usuario propio con email zzz-*, y ROLLBACK al final.
-- Solo se cambia a `authenticated` para llamar a registrar_fp; lo demás, como
-- dueño (escribir en `res` siendo authenticated da «permission denied»).
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;
create temp table antes(filas bigint) on commit drop;
create temp table catalogo_antes on commit drop as
  select activity_id, modalidad, dificultad, fp_base, etapas, retirada
    from public.actividad_catalogo
   where activity_id like 't4-%';

insert into antes select count(*) from public.fp_history;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-corte-t4@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');
insert into ids(uid) select id from auth.users where email = 'zzz-corte-t4@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzcortet4prueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 1. Las tres, retiradas y todavía en el catálogo ───────────────────────
insert into res select 1, 'H2, H5 y H6 retiradas, sin borrar', '3 de 3',
  (select count(*)::text || ' de 3' from public.actividad_catalogo
    where activity_id in ('t4-el-control-que-se-saltaron', 't4-al-empleado-o-al-gasto', 't4-quien-se-entero-primero')
      and retirada),
  (select count(*) = 3 from public.actividad_catalogo
    where activity_id in ('t4-el-control-que-se-saltaron', 't4-al-empleado-o-al-gasto', 't4-quien-se-entero-primero')
      and retirada);

-- ── 2. H4 difícil con 50 ──────────────────────────────────────────────────
insert into res select 2, 'H4 quedó evaluativa · difícil · 50 · 1 etapa, sin retirar', 'evaluativa/dificil/50/1/false',
  coalesce((select modalidad || '/' || dificultad || '/' || fp_base || '/' || etapas || '/' || retirada
              from public.actividad_catalogo where activity_id = 't4-el-arqueo-de-rosa'), 'NO ESTÁ'),
  (select modalidad = 'evaluativa' and dificultad = 'dificil' and fp_base = 50 and etapas = 1 and not retirada
     from public.actividad_catalogo where activity_id = 't4-el-arqueo-de-rosa');

-- ── 3. H4 paga 50 ─────────────────────────────────────────────────────────
set local role authenticated;
select public.registrar_fp('t4-el-arqueo-de-rosa', 300000, 100);
reset role;

insert into res select 3, 'H4 al 100 % paga 50', '50',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 't4-el-arqueo-de-rosa'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 't4-el-arqueo-de-rosa');

-- ── 4. Una retirada responde en vez de reventar ───────────────────────────
set local role authenticated;
do $lapida$
begin
  perform public.registrar_fp('t4-al-empleado-o-al-gasto', 200000, 100);
  perform set_config('prueba.lapida_t4', 'responde', true);
exception when others then
  perform set_config('prueba.lapida_t4', 'REVIENTA: ' || sqlerrm, true);
end;
$lapida$;
reset role;

insert into res select 4, 'llamar a H5 (retirada) responde en vez de reventar', 'responde',
  current_setting('prueba.lapida_t4', true),
  current_setting('prueba.lapida_t4', true) = 'responde';

-- ── 5. Las otras de T4, intactas ──────────────────────────────────────────
insert into res select 5, 'H1, H3, H7 y H8 siguen como las dejaron sus migraciones', '4 de 4',
  (select count(*)::text || ' de 4' from public.actividad_catalogo
    where not retirada and (
         (activity_id = 't4-entra-o-sale-de-caja'   and modalidad = 'exploratoria' and dificultad = 'facil'   and fp_base = 10)
      or (activity_id = 't4-se-mueve-la-caja-menor' and modalidad = 'evaluativa'   and dificultad = 'medio'   and fp_base = 25)
      or (activity_id = 't4-concilia-la-cuenta'     and modalidad = 'evaluativa'   and dificultad = 'dificil' and fp_base = 50)
      or (activity_id = 't4-se-asienta-o-no'        and modalidad = 'evaluativa'   and dificultad = 'experto' and fp_base = 90))),
  (select count(*) = 4 from public.actividad_catalogo
    where not retirada and (
         (activity_id = 't4-entra-o-sale-de-caja'   and modalidad = 'exploratoria' and dificultad = 'facil'   and fp_base = 10)
      or (activity_id = 't4-se-mueve-la-caja-menor' and modalidad = 'evaluativa'   and dificultad = 'medio'   and fp_base = 25)
      or (activity_id = 't4-concilia-la-cuenta'     and modalidad = 'evaluativa'   and dificultad = 'dificil' and fp_base = 50)
      or (activity_id = 't4-se-asienta-o-no'        and modalidad = 'evaluativa'   and dificultad = 'experto' and fp_base = 90)));

-- ── 6. Idempotentes: correrlas otra vez no cambia nada ────────────────────
-- Las mismas sentencias de la 0208 y de la 0209, otra vez.
update public.actividad_catalogo
   set retirada = true
 where activity_id in ('t4-el-control-que-se-saltaron', 't4-al-empleado-o-al-gasto', 't4-quien-se-entero-primero');
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t4-el-arqueo-de-rosa', 'contabilidad', 'efectivo-caja-menor-bancos', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id, topic_id = excluded.topic_id, modalidad = excluded.modalidad,
  dificultad = excluded.dificultad, fp_base = excluded.fp_base, etapas = excluded.etapas;

insert into res select 6, 'correrlas otra vez no cambia el catálogo de T4', '0 diferencias',
  (select count(*)::text || ' diferencias' from (
     (select activity_id, modalidad, dificultad, fp_base, etapas, retirada from public.actividad_catalogo where activity_id like 't4-%'
      except select * from catalogo_antes)
     union all
     (select * from catalogo_antes
      except select activity_id, modalidad, dificultad, fp_base, etapas, retirada from public.actividad_catalogo where activity_id like 't4-%')) d),
  (select count(*) = 0 from (
     (select activity_id, modalidad, dificultad, fp_base, etapas, retirada from public.actividad_catalogo where activity_id like 't4-%'
      except select * from catalogo_antes)
     union all
     (select * from catalogo_antes
      except select activity_id, modalidad, dificultad, fp_base, etapas, retirada from public.actividad_catalogo where activity_id like 't4-%')) d);

-- ── 7. Nada de fp_history fuera del usuario de prueba ─────────────────────
insert into res select 7, 'fp_history solo creció con las filas del usuario de prueba', 'igual',
  (select case when count(*) filter (where user_id <> (select uid from ids)) = (select filas from antes) then 'igual' else 'CAMBIÓ' end
     from public.fp_history),
  (select count(*) filter (where user_id <> (select uid from ids)) = (select filas from antes) from public.fp_history);

select n, paso, esperado, obtenido, case when ok then 'PASA' else 'FALLA' end as veredicto from res order by n;
select case when count(*) = 7 and bool_and(ok) then 'TODO OK: 7 de 7' else 'FALLA: ' || count(*) filter (where not ok) || ' en rojo' end as resumen from res;

rollback;
