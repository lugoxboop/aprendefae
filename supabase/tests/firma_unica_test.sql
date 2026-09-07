-- ---------------------------------------------------------------------------
-- Prueba de la migración 0018 — que solo quede UNA firma de registrar_fp.
--
-- POR QUÉ EXISTE. El incidente no lo causó una función mal escrita: lo causó
-- que hubiera DOS. Ninguna prueba anterior miraba cuántas firmas vivas había,
-- así que la ambigüedad llegó a producción y costó puntos a estudiantes reales.
-- Esta prueba mira exactamente eso.
--
-- El paso 1 es el que importa. Los demás confirman que retirar la vieja no
-- rompió nada de lo que ya funcionaba.
--
-- QUIÉN ES QUIÉN. Solo se cambia a `authenticated` para llamar a registrar_fp.
-- Todo lo demás —crear el usuario, escribir en `res`— se hace como dueño.
--
-- No toca a nadie real: usuario propio zzz-*, y ROLLBACK al final.
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
values (gen_random_uuid(), 'zzz-firma@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-firma@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzfirmaprueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 1. EL CHEQUEO QUE FALTABA: una sola firma viva ────────────────────────
-- Con dos, cualquier llamada de tres argumentos da PGRST203 y no paga nada.
insert into res
select 1, 'registrar_fp tiene exactamente UNA firma', '1',
  count(*)::text, count(*) = 1
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'registrar_fp';

-- ── 2. Y es la de cuatro argumentos ───────────────────────────────────────
insert into res
select 2, 'la firma viva es la de cuatro, con jsonb al final',
  'text, integer, numeric, jsonb',
  coalesce((select pg_get_function_identity_arguments(p.oid)
              from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'registrar_fp' limit 1), 'NO HAY'),
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'registrar_fp'
       and pg_get_function_identity_arguments(p.oid) = 'text, integer, numeric, jsonb'
  );

-- ── 3. La llamada de TRES argumentos resuelve y paga ──────────────────────
-- Es la que hacen seis de las siete actividades. Con las dos firmas vivas,
-- esto era exactamente lo que fallaba.
set local role authenticated;
select public.registrar_fp('diagnostico-en-vivo', 120000, 100);
reset role;

insert into res select 3, 'la llamada de 3 argumentos resuelve y paga sus 25 FP', '25',
  coalesce((select fp_awarded::text from public.fp_history
             where user_id = (select uid from ids) and activity_id = 'diagnostico-en-vivo'),
           'NO HAY FILA — sigue ambigua'),
  (select fp_awarded = 25 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'diagnostico-en-vivo');

-- ── 4. Y p_detalle toma su default: no deja detalle ───────────────────────
insert into res select 4, 'sin p_detalle no se escribe detalle', '0',
  (select count(*)::text from public.fp_detalle
    where user_id = (select uid from ids) and activity_id = 'diagnostico-en-vivo'),
  (select count(*) = 0 from public.fp_detalle
    where user_id = (select uid from ids) and activity_id = 'diagnostico-en-vivo');

-- ── 5. La de CUATRO sigue funcionando y sí escribe detalle ────────────────
set local role authenticated;
select public.registrar_fp('arma-grupo-logico', 200000, 100, '[
  {"item":"a-c1","ok":true,"orden":1},
  {"item":"a-c2","ok":false,"respuesta":"problema","orden":2}
]'::jsonb);
reset role;

insert into res select 5, 'la llamada de 4 argumentos paga y escribe sus 2 filas', '50 y 2',
  coalesce((select h.fp_awarded::text || ' y ' ||
                   (select count(*)::text from public.fp_detalle d
                     where d.fp_history_id = h.id)
              from public.fp_history h
             where h.user_id = (select uid from ids) and h.activity_id = 'arma-grupo-logico'),
           'NO HAY FILA'),
  (select h.fp_awarded = 50
            and (select count(*) from public.fp_detalle d where d.fp_history_id = h.id) = 2
     from public.fp_history h
    where h.user_id = (select uid from ids) and h.activity_id = 'arma-grupo-logico');

-- ── 6. La firma de ocho que retiró la 0012 sigue sin volver ───────────────
insert into res
select 6, 'la firma vieja de 8 argumentos sigue retirada', '0',
  count(*)::text, count(*) = 0
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'registrar_fp'
  and pg_get_function_identity_arguments(p.oid) like '%integer, text, text%';

-- ── 7. Ninguna otra función del esquema quedó duplicada ───────────────────
-- El mismo error puede repetirse con cualquier otra: se comprueban todas.
insert into res
select 7, 'ninguna función pública tiene firmas duplicadas', 'ninguna',
  coalesce((select string_agg(proname || ' (' || n || ')', ', ')
              from (select p.proname, count(*) as n
                      from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
                     where ns.nspname = 'public'
                     group by p.proname having count(*) > 1) t), 'ninguna'),
  not exists (
    select 1 from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
     where ns.nspname = 'public'
     group by p.proname having count(*) > 1
  );

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
