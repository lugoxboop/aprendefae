-- ===========================================================================
-- Verificación de RLS sobre public.profiles
--
-- No requiere contraseñas ni iniciar sesión con Google: se suplanta el JWT
-- dentro de la transacción, que es como Postgres evalúa auth.uid().
--
-- ANTES DE CORRERLO
-- 1. Supabase → Authentication → Users → Add user. Crea TRES usuarios de
--    prueba (email y contraseña cualquiera, son desechables). Se necesitan
--    tres y no dos: el tercero permite probar que un estudiante no puede
--    crear una fila a nombre de otro sin que el fallo se confunda con un
--    choque de clave primaria.
-- 2. Copia sus UUID y pégalos abajo, donde dice PEGA-UUID.
-- 3. Pega todo el script en el SQL Editor y ejecútalo.
--
-- La transacción termina en ROLLBACK: no deja nada en la base.
-- Si tu editor no muestra la tabla de resultados, ejecuta hasta el SELECT
-- final y lanza el ROLLBACK aparte.
-- ===========================================================================

begin;

create temp table rls_ids (label text primary key, id uuid) on commit drop;
insert into rls_ids values
  ('A',       'PEGA-UUID-DEL-USUARIO-A'),
  ('B',       'PEGA-UUID-DEL-USUARIO-B'),
  ('C_libre', 'PEGA-UUID-DEL-USUARIO-C');   -- este se queda sin fila de perfil

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
