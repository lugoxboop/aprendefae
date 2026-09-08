-- ---------------------------------------------------------------------------
-- EL AUTH DE MENTIRA — lo mínimo de Supabase para que las migraciones apliquen.
--
-- Esto NO es Supabase. Es un decorado con las cuatro cosas que las 23
-- migraciones y las pruebas le piden al esquema `auth`, y nada más:
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
--  6. LOS ROLES SON CÁSCARAS. `anon` y `authenticated` existen para que los
--     grant/revoke de las migraciones tengan a quién apuntar y para que
--     `set local role` funcione en las pruebas, pero no traen la configuración
--     que Supabase les da. Un `alter role ... set` de producción no está.
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
