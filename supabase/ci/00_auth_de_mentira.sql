-- ---------------------------------------------------------------------------
-- EL AUTH DE MENTIRA — lo mínimo de Supabase para que las migraciones apliquen.
--
-- Esto NO es Supabase. Es un decorado con las cuatro cosas que las
-- migraciones y las pruebas le piden al esquema `auth`, más los permisos por
-- defecto que Supabase da en `public` (ver abajo), y nada más:
--
--     auth.users     tabla, referenciada por clave foránea en cinco tablas
--     auth.uid()     usada en 38 políticas RLS
--     auth.jwt()     usada en 11 sitios, de donde salen el correo y el rol
--     anon / authenticated   los dos roles a los que se conceden permisos
--
-- Se inventarió con un barrido sobre supabase/migrations y supabase/tests, no
-- de memoria: si aparece un quinto objeto de `auth`, las migraciones fallarán
-- al aplicarse aquí y habrá que añadirlo A PROPÓSITO, que es justo lo que se
-- quiere. Un decorado que crezca solo deja de ser mínimo.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- QUÉ **NO** REPRODUCE, Y POR TANTO DÓNDE NO HAY QUE CONFIAR
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Este es el riesgo de todo el montaje: algo puede pasar aquí y fallar en
-- producción. Eso es peor que no tener CI, porque da confianza falsa. Así que
-- la lista se escribe entera y se mantiene:
--
--  1. auth.users TIENE MUCHAS MÁS COLUMNAS de verdad —confirmation_token,
--     recovery_token, phone, is_sso_user, deleted_at, banned_until y una
--     veintena más—. Aquí solo están las once que alguien usa. Una migración
--     que empezara a leer otra columna aplicaría aquí y reventaría en
--     producción... al revés: reventaría AQUÍ, que es lo bueno. Lo que no se
--     detecta es lo contrario: una columna que en producción tiene NOT NULL o
--     un default distinto, y que aquí acepta cualquier cosa.
--
--  2. NO HAY TRIGGERS DE auth. Supabase engancha triggers al alta de usuarios
--     (confirmación de correo, identidades, sesiones). Si alguna vez el sitio
--     dependiera de uno, aquí no existiría y no se notaría.
--
--  3. auth.uid() Y auth.jwt() LEEN request.jwt.claims, igual que las de verdad,
--     pero NADIE VALIDA LA FIRMA. En producción esos valores llegan de un JWT
--     verificado por PostgREST; aquí los pone quien escriba set_config. Por eso
--     estas pruebas NO dicen nada sobre si la autenticación real funciona: solo
--     sobre qué hacen las funciones DADO un JWT.
--
--  4. NO HAY PostgREST. Todo lo que es cosa suya queda fuera: la resolución de
--     firmas —el fallo PGRST203 que dejó seis actividades sin pagar FP—, la
--     caché de esquema, el mapeo de errores a HTTP y la exposición por REST.
--     Eso lo mira la sonda de postdespliegue, que corre contra la base real.
--
--  5. NO HAY RLS EN auth.users, ni los GRANTS finos que Supabase le pone. Aquí
--     el dueño lo ve todo. Las políticas que sí se prueban son las de `public`,
--     que son las que escriben las migraciones.
--
--  6. LOS ROLES TRAEN LOS PERMISOS POR DEFECTO DE SUPABASE, Y NADA MÁS.
--     Todo lo que se crea en `public` nace con ALL para anon y authenticated
--     en tablas y secuencias, y EXECUTE en funciones —ver el bloque de abajo—.
--     Lo que NO traen: ningún `alter role ... set` de producción, ni el rol
--     service_role, ni los permisos que Supabase da en otros esquemas.
--
--  7. LA VERSIÓN DE POSTGRES PUEDE NO COINCIDIR con la del proyecto en
--     Supabase. Si divergieran mucho, algo podría comportarse distinto.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Los dos roles ───────────────────────────────────────────────────────────
/*
 * NOLOGIN: no son cuentas, son etiquetas de permisos. `set local role` funciona
 * igual y nadie puede conectarse con ellas.
 */
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
end;
$$;

/*
 * El dueño de la conexión tiene que poder asumir esos roles para que
 * `set local role authenticated` no falle en las pruebas.
 */
do $$
begin
  execute format('grant anon, authenticated to %I', current_user);
end;
$$;

grant usage on schema public to anon, authenticated;

-- ── Los permisos por defecto de Supabase en `public` ─────────────────────
/*
 * En Supabase, todo lo que se crea en `public` nace con permisos para anon y
 * authenticated: ALL en tablas y secuencias, EXECUTE en funciones. Lo pone
 * `alter default privileges` en la configuración del proyecto, NO ninguna
 * migración. Por eso ninguna migración concede SELECT sobre sus tablas, y por
 * eso la 0017 solo REVOCA insert/update/delete de fp_detalle: el select lo
 * da Supabase y lo filtra RLS.
 *
 * Sin esto, authenticated no podía leer ninguna tabla, y detalle_test.sql
 * reventaba en su paso 11 —la prueba de RLS— con "permission denied for table
 * fp_detalle", un error que en producción no existe. Y hay algo peor que el
 * error: un "no puedes leer esto" que viene de un GRANT que falta se parece
 * mucho a uno que viene de una política, y una prueba de RLS podía pasar por
 * el motivo equivocado.
 *
 * El mismo mecanismo da EXECUTE en cada función nueva a anon, que es la razón
 * de que las migraciones revoquen a mano. Con esto, esos revokes se ejercen
 * aquí igual que en producción.
 *
 * Tiene que ir ANTES de las migraciones: los permisos por defecto solo se
 * aplican a lo que se crea después.
 */
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;

-- ── El esquema y la tabla ───────────────────────────────────────────────────
create schema if not exists auth;
grant usage on schema auth to anon, authenticated;

/*
 * Las once columnas que alguien usa, ni una más. Los defaults están para que
 * una prueba que inserte solo (id, email) no reviente por una columna que en
 * producción se rellena sola.
 */
create table if not exists auth.users (
  id                 uuid primary key,
  instance_id        uuid,
  aud                text default 'authenticated',
  role               text default 'authenticated',
  email              text,
  encrypted_password text default '',
  email_confirmed_at timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  raw_app_meta_data  jsonb default '{}'::jsonb,
  raw_user_meta_data jsonb default '{}'::jsonb
);

/*
 * DIFERENCIA DELIBERADA CON PRODUCCIÓN, y va anotada porque es una de verdad.
 *
 * Supabase tiene un único parcial sobre (email) para usuarios no-SSO; aquí es
 * un único a secas. Es MÁS ESTRICTO que el real, que es el lado seguro de
 * equivocarse: como mucho da un rojo que en producción no habría. Al revés
 * —ser más laxo— dejaría pasar una prueba que allí falla.
 *
 * Además todas las pruebas buscan por `where email = ...` esperando una fila:
 * sin unicidad, un correo repetido daría fallos confusos en vez de claros.
 */
create unique index if not exists auth_users_email_unico on auth.users (lower(email));

-- ── Las dos funciones ───────────────────────────────────────────────────────
/*
 * Copiadas en comportamiento de las de Supabase: leen request.jwt.claims del
 * ajuste de sesión. Lo que NO hacen es verificar ninguna firma — ver el punto
 * 3 de la lista de arriba.
 *
 * `stable` y no `immutable`: dependen del ajuste de sesión, que puede cambiar
 * dentro de la misma transacción, y una función marcada immutable podría verse
 * cacheada por el planificador con el valor anterior.
 */
create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb
$$;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant execute on function auth.jwt() to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

-- ── Comprobación del propio decorado ────────────────────────────────────────
/*
 * Si el decorado estuviera mal montado, las migraciones fallarían más adelante
 * con un error que no señala aquí. Esto lo dice en el sitio.
 */
do $$
declare v uuid := gen_random_uuid();
begin
  perform set_config('request.jwt.claims',
                     json_build_object('sub', v, 'email', 'prueba@ci.local')::text, true);

  if auth.uid() is distinct from v then
    raise exception 'El auth de mentira está mal: auth.uid() no devuelve el sub del JWT';
  end if;
  if auth.jwt() ->> 'email' is distinct from 'prueba@ci.local' then
    raise exception 'El auth de mentira está mal: auth.jwt() no devuelve el correo del JWT';
  end if;

  perform set_config('request.jwt.claims', '', true);
  if auth.uid() is not null then
    raise exception 'El auth de mentira está mal: sin JWT, auth.uid() debería ser null';
  end if;

  raise notice 'Auth de mentira montado y comprobado.';
end;
$$;

-- ── Y los permisos por defecto se aplican de verdad ─────────────────────
/*
 * Se comprueba creando una tabla y una función reales en public, y se borran.
 * La función se mira en su ACL y no con has_function_privilege: Postgres da
 * EXECUTE a PUBLIC por su cuenta, y esa pregunta diría que sí aunque el
 * bloque de arriba no hubiera hecho nada.
 */
do $$
begin
  create table public.zzz_prueba_permisos (x integer);
  create function public.zzz_prueba_permisos_fn() returns integer language sql as 'select 1';

  if not has_table_privilege('authenticated', 'public.zzz_prueba_permisos', 'select') then
    raise exception 'El auth de mentira está mal: una tabla nueva de public no nace legible por authenticated, como en Supabase';
  end if;

  if not exists (
    select 1 from pg_proc p
     where p.proname = 'zzz_prueba_permisos_fn'
       and p.proacl::text like '%anon=X%'
  ) then
    raise exception 'El auth de mentira está mal: una función nueva de public no nace con EXECUTE explícito para anon, como en Supabase';
  end if;

  drop function public.zzz_prueba_permisos_fn();
  drop table public.zzz_prueba_permisos;
end
$$;
