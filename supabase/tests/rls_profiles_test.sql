-- ===========================================================================
-- Verificación de RLS sobre public.profiles
--
-- No requiere contraseñas ni iniciar sesión con Google: se suplanta el JWT
-- dentro de la transacción, que es como Postgres evalúa auth.uid().
--
-- CREA SUS PROPIOS USUARIOS. Antes había que dar de alta tres usuarios a mano
-- en Supabase y pegar sus UUID aquí, lo que la dejaba fuera de CI: con los
-- marcadores sin reemplazar reventaba en la línea 25 con "invalid input syntax
-- for type uuid". Ahora inserta tres en auth.users dentro de la transacción,
-- igual que ligas_test.sql, y se corre tal cual: en el SQL Editor o en CI.
--
-- Se necesitan tres y no dos: el tercero existe en auth.users pero no tiene
-- perfil, y permite probar que un estudiante no puede crear una fila a nombre
-- de otro sin que el rechazo se confunda con un choque de clave primaria.
--
-- La transacción termina en ROLLBACK: no deja nada en la base.
-- Si tu editor no muestra la tabla de resultados, ejecuta hasta el SELECT
-- final y lanza el ROLLBACK aparte.
-- ===========================================================================

begin;

create temp table rls_ids (label text primary key, id uuid) on commit drop;
insert into rls_ids values
  ('A',       gen_random_uuid()),
  ('B',       gen_random_uuid()),
  ('C_libre', gen_random_uuid());   -- este se queda sin fila de perfil

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'rls-prueba-' || lower(label) || '@ejemplo.test', '', now(), now()
  from rls_ids;

create temp table rls_out (
  n        int,
  chequeo  text,
  esperado text,
  obtenido text,
  pasa     boolean
) on commit drop;

-- Los roles anon/authenticated tienen que poder leer los ids y anotar resultados.
grant select on rls_ids to authenticated, anon;
grant select, insert on rls_out to authenticated, anon;

-- Semillas para A y B. Se insertan como postgres, que no pasa por RLS.
insert into public.profiles (user_id, nickname)
values
  ((select id from rls_ids where label = 'A'), 'rls_test_a'),
  ((select id from rls_ids where label = 'B'), 'rls_test_b')
on conflict do nothing;

-- Una fila de FP para A, para que salga en el ranking (chequeo 11).
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality)
values ((select id from rls_ids where label = 'A'), 'zzz-rls-perfil', 'zzz-rls-materia', 10, 'facil', 'exploratoria');

-- ---------------------------------------------------------------------------
-- 0. La protección está encendida
-- ---------------------------------------------------------------------------
insert into rls_out
select 0,
       'RLS habilitada y forzada en profiles',
       'true / true',
       relrowsecurity::text || ' / ' || relforcerowsecurity::text,
       (relrowsecurity and relforcerowsecurity)
from pg_class where oid = 'public.profiles'::regclass;

-- ---------------------------------------------------------------------------
-- Como el estudiante A
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
  'request.jwt.claims',
  (select json_build_object('sub', id, 'role', 'authenticated')::text
   from rls_ids where label = 'A'),
  true
);

-- 1. Solo alcanza una fila en toda la tabla
insert into rls_out
select 1, 'A ve exactamente una fila', '1', count(*)::text, count(*) = 1
from public.profiles;

-- 2. Y esa fila es la suya
insert into rls_out
select 2, 'la fila que ve A es la de A', 'true',
       coalesce(bool_and(user_id = (select id from rls_ids where label = 'A')), false)::text,
       coalesce(bool_and(user_id = (select id from rls_ids where label = 'A')), false)
from public.profiles;

-- 3. La de B le resulta invisible
insert into rls_out
select 3, 'A no ve la fila de B', '0', count(*)::text, count(*) = 0
from public.profiles
where user_id = (select id from rls_ids where label = 'B');

-- 4. No puede modificarla (la fila ni siquiera entra en el UPDATE)
with intento as (
  update public.profiles set nickname = 'suplantado'
  where user_id = (select id from rls_ids where label = 'B')
  returning 1
)
insert into rls_out
select 4, 'A no puede modificar la fila de B', '0 filas', count(*)::text || ' filas', count(*) = 0
from intento;

-- 5. No puede crear una fila a nombre de otro.
--    Se usa C, que existe en auth.users pero no tiene perfil: así el rechazo
--    solo puede venir de RLS (42501) y no de la clave primaria (23505).
do $$
declare estado text;
begin
  insert into public.profiles (user_id, nickname)
  values ((select id from rls_ids where label = 'C_libre'), 'rls_test_suplantacion');
  insert into rls_out values (5, 'A no puede crear filas a nombre de otro', 'rechazado', 'PERMITIDO', false);
exception when others then
  estado := SQLSTATE;
  insert into rls_out values (
    5, 'A no puede crear filas a nombre de otro', 'rechazado (42501)',
    'rechazado (' || estado || ')', estado = '42501'
  );
end $$;

-- ---------------------------------------------------------------------------
-- Editar perfil: A cambia su apodo y su nombre, y el cambio se ve donde se lee
-- ---------------------------------------------------------------------------

-- 9. A puede cambiar su propio apodo y nombre real
with cambio as (
  update public.profiles set nickname = 'rls_test_a_nuevo', full_name = 'Ana Prueba Nueva'
  where user_id = (select id from rls_ids where label = 'A')
  returning 1
)
insert into rls_out
select 9, 'A cambia su propio apodo y nombre', '1 fila', count(*)::text || ' filas', count(*) = 1
from cambio;

-- 10. Y la fila queda con los valores nuevos
insert into rls_out
select 10, 'la fila de A tiene los valores nuevos', 'rls_test_a_nuevo / Ana Prueba Nueva',
       nickname || ' / ' || full_name,
       nickname = 'rls_test_a_nuevo' and full_name = 'Ana Prueba Nueva'
from public.profiles where user_id = (select id from rls_ids where label = 'A');

-- 11. El ranking no guarda copia: lee el apodo nuevo en el acto
insert into rls_out
select 11, 'el ranking muestra el apodo nuevo de A', '1', count(*)::text, count(*) = 1
from public.ranking_fp()
where es_tuyo and nickname = 'rls_test_a_nuevo';

-- 12. La regla de la base que sigue en pie: el apodo no se repite (sin mayúsculas)
do $$
declare estado text;
begin
  update public.profiles set nickname = 'RLS_TEST_B'
  where user_id = (select id from rls_ids where label = 'A');
  insert into rls_out values (12, 'A no puede tomar el apodo de B', 'rechazado (23505)', 'PERMITIDO', false);
exception when others then
  estado := SQLSTATE;
  insert into rls_out values (12, 'A no puede tomar el apodo de B', 'rechazado (23505)', 'rechazado (' || estado || ')', estado = '23505');
end $$;

-- ---------------------------------------------------------------------------
-- 0032: sobre SU PROPIA fila, A solo escribe apodo y nombre real
-- ---------------------------------------------------------------------------

/*
 * 13. Cada una de las demás columnas, una por una, sacadas del catálogo y no de
 *     una lista escrita a mano: si mañana se añade una columna a profiles, entra
 *     sola en la prueba. Se intenta `col = col` sobre la fila de A, que no
 *     cambia ningún valor ni puede chocar con un check: si pasa, es que el
 *     permiso existe. Tiene que rechazarse con 42501 en todas.
 */
do $$
declare
  c record;
  permitidas text[] := '{}';
  protegidas integer := 0;
begin
  for c in
    select column_name from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles'
       and column_name not in ('nickname', 'full_name')
     order by ordinal_position
  loop
    protegidas := protegidas + 1;
    begin
      execute format('update public.profiles set %I = %I where user_id = $1', c.column_name, c.column_name)
        using (select id from rls_ids where label = 'A');
      permitidas := permitidas || c.column_name;
    exception when insufficient_privilege then
      null;
    end;
  end loop;
  insert into rls_out values (
    13, 'A no puede escribir ninguna otra columna de su fila (' || protegidas || ' columnas)', 'ninguna',
    coalesce(nullif(array_to_string(permitidas, ', '), ''), 'ninguna'),
    cardinality(permitidas) = 0 and protegidas >= 8
  );
end $$;

-- 14. El caso que motivó la 0032, escrito tal cual: FP y racha propios
do $$
declare estado text;
begin
  update public.profiles set points = 99999, streak = 400
  where user_id = (select id from rls_ids where label = 'A');
  insert into rls_out values (14, 'A no puede subirse FP ni racha', 'rechazado (42501)', 'PERMITIDO', false);
exception when others then
  estado := SQLSTATE;
  insert into rls_out values (14, 'A no puede subirse FP ni racha', 'rechazado (42501)', 'rechazado (' || estado || ')', estado = '42501');
end $$;

-- ---------------------------------------------------------------------------
-- Como C, que aún no tiene perfil: el primer ingreso solo escribe lo suyo
-- ---------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  (select json_build_object('sub', id, 'role', 'authenticated')::text
   from rls_ids where label = 'C_libre'),
  true
);

-- 15. No puede crearse el perfil con FP de regalo
do $$
declare estado text;
begin
  insert into public.profiles (user_id, nickname, full_name, points)
  values ((select id from rls_ids where label = 'C_libre'), 'rls_test_c', 'Carla Prueba', 5000);
  insert into rls_out values (15, 'C no puede crear su perfil con FP', 'rechazado (42501)', 'PERMITIDO', false);
exception when others then
  estado := SQLSTATE;
  insert into rls_out values (15, 'C no puede crear su perfil con FP', 'rechazado (42501)', 'rechazado (' || estado || ')', estado = '42501');
end $$;

-- 16. Y sí puede crearlo con lo que pide el primer ingreso. Dentro de un
--     bloque: si el 15 dejó pasar el alta con FP, la fila ya existe y esto
--     tiene que quedar como FALLA, no cortar la prueba a medias.
do $$
declare v_puntos integer;
begin
  insert into public.profiles (user_id, nickname, full_name)
  values ((select id from rls_ids where label = 'C_libre'), 'rls_test_c', 'Carla Prueba')
  returning points into v_puntos;
  insert into rls_out values (16, 'C crea su perfil con apodo y nombre, FP en su default', '1 fila, 0 FP',
    '1 fila, ' || v_puntos || ' FP', v_puntos = 0);
exception when others then
  insert into rls_out values (16, 'C crea su perfil con apodo y nombre, FP en su default', '1 fila, 0 FP',
    'error (' || SQLSTATE || ')', false);
end $$;

-- ---------------------------------------------------------------------------
-- Como el estudiante B: el aislamiento tiene que ser simétrico
-- ---------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  (select json_build_object('sub', id, 'role', 'authenticated')::text
   from rls_ids where label = 'B'),
  true
);

insert into rls_out
select 6, 'B ve exactamente una fila', '1', count(*)::text, count(*) = 1
from public.profiles;

insert into rls_out
select 7, 'B no ve la fila de A', '0', count(*)::text, count(*) = 0
from public.profiles
where user_id = (select id from rls_ids where label = 'A');

-- ---------------------------------------------------------------------------
-- Sin sesión: un visitante anónimo no debe leer ningún perfil
-- ---------------------------------------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', '', true);

insert into rls_out
select 8, 'anónimo no ve ninguna fila', '0', count(*)::text, count(*) = 0
from public.profiles;

-- ---------------------------------------------------------------------------
-- Resultado
-- ---------------------------------------------------------------------------
reset role;

select
  n,
  chequeo,
  esperado,
  obtenido,
  case when pasa then 'PASA' else 'FALLA' end as resultado
from rls_out
order by n;

rollback;
