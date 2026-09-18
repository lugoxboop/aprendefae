-- ═══════════════════════════════════════════════════════════════════════════
-- 0035 — EL AVATAR Y LOS CRISTALES
--
-- Dos cosas nuevas y ninguna toca los FP:
--
--   1. La combinación del avatar en el perfil: forma, paleta, nivel puesto y
--      niveles comprados. Con sus restricciones, para que una escritura rara
--      no deje un perfil pintando una figura que no existe.
--   2. Los Cristales: saldo, libro de movimientos, las funciones que pagan y
--      la que cobra. La 0036 los engancha a la racha, al contador de
--      actividades y al podio semanal de liga.
--
-- ═══════════ LA INVARIANTE, ESCRITA DONDE SE PUEDE ROMPER ═══════════
--
--   FP         es el puntaje académico —ranking, ligas, bono de nota—. NUNCA se
--              gasta, nunca se resta, nunca baja. Ninguna función de este
--              archivo resta `points`, y ninguna otra del proyecto lo hace: se
--              buscó antes de escribir esto.
--   Cristales  son moneda, y lo único que se gasta. No entran en ningún
--              ranking ni en ninguna nota.
--
-- Y NO HAY CONVERSIÓN ENTRE LOS DOS EN NINGUNA DIRECCIÓN. No es que falte:
-- es que no existe, y no debe existir. Un tipo de cambio convertiría el
-- puntaje académico en poder de compra, y la Tienda en una razón para farmear
-- FP —que es exactamente lo que el «repetir no paga» de la 0033 vino a cerrar—.
--
-- ═══════════ POR QUÉ NO HAY GRANT POR COLUMNA PARA EL AVATAR ═══════════
--
-- La 0032 dejó al cliente escribiendo solo nickname y full_name, y el camino
-- obvio aquí era añadir un grant para las columnas del avatar. NO SE HIZO:
-- avatar_level solo es válido si ese nivel está COMPRADO, y un grant por
-- columna no sabe comprobar nada —concede o no concede—. Con el grant,
-- cualquiera se pondría el nivel IV desde la consola sin gastar un Cristal.
--
-- Así que las cinco columnas nuevas se LEEN desde el cliente (RLS ya limita la
-- lectura a la fila propia) y se ESCRIBEN solo por avatar_elegir() y
-- comprar_nivel_avatar(), que comprueban. El saldo, además, no lo escribe
-- ninguna función que el cliente pueda llamar directamente.
--
-- Va DESPUÉS de la 0034. Idempotente: se puede correr dos veces.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Las columnas del perfil ──────────────────────────────────────────────
alter table public.profiles
  add column if not exists cristales_balance      integer   not null default 0,
  add column if not exists avatar_shape           text      not null default 'decaedro',
  add column if not exists avatar_palette         text      not null default 'nocturno',
  add column if not exists avatar_level           integer   not null default 1,
  add column if not exists avatar_unlocked_levels integer[] not null default '{1}';

comment on column public.profiles.cristales_balance is
'Saldo de Cristales (0035). Moneda, no puntaje: no entra en rankings ni notas, y no se puede convertir a FP ni al contrario. Lo escriben cristales_dar() y comprar_nivel_avatar(); el cliente no tiene grant sobre esta columna.';
comment on column public.profiles.avatar_palette is
'Paleta del avatar (0035). NUNCA vale ''comparacion'': esa es la gris interna de las miniaturas de forma del selector, y el check de abajo la deja fuera de la tabla a propósito.';
comment on column public.profiles.avatar_unlocked_levels is
'Niveles de avatar comprados (0035). El 1 está siempre: es gratis y no se transa. La compra es permanente y de cuenta — no se ata nunca a una forma ni a una paleta.';

/*
 * Las restricciones van en un bloque porque `add constraint if not exists` no
 * existe. Los valores son los mismos que FORMAS, PALETAS y NIVELES de
 * src/avatar/generador.js, y avatar.test.mjs LEE este archivo para comprobar
 * que los dos lados no se separen — el mismo trato que niveles.test.mjs le da a
 * los umbrales de liga.
 */
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_cristales_no_negativo') then
    alter table public.profiles add constraint profiles_cristales_no_negativo
      check (cristales_balance >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_shape_valida') then
    alter table public.profiles add constraint profiles_avatar_shape_valida
      check (avatar_shape in ('decaedro', 'prisma', 'nucleo', 'red', 'cuna'));
  end if;

  /* 'comparacion' NO está, y es la mitad de para qué existe este check. */
  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_palette_valida') then
    alter table public.profiles add constraint profiles_avatar_palette_valida
      check (avatar_palette in ('nocturno', 'marea', 'brasa', 'aurora'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_level_valido') then
    alter table public.profiles add constraint profiles_avatar_level_valido
      check (avatar_level between 1 and 4);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_niveles_validos') then
    alter table public.profiles add constraint profiles_avatar_niveles_validos
      check (avatar_unlocked_levels <@ array[1, 2, 3, 4] and 1 = any (avatar_unlocked_levels));
  end if;
end;
$$;

-- ── 2. El libro de movimientos ──────────────────────────────────────────────
/*
 * Una fila por cada vez que alguien gana o gasta Cristales, con una CLAVE que
 * dice qué la causó: 'racha-7-2026-09-17', 'actividades-15',
 * 'podio-pensamiento-estrategico-2026-09-14', 'nivel-3'.
 *
 * LA CLAVE ES LA IDEMPOTENCIA, y por eso es parte de la llave primaria. El
 * cierre semanal de ligas puede intentar pagar el mismo podio dos veces —dos
 * estudiantes jugando en el mismo minuto lo disparan a la vez—, y la racha se
 * recalcula en cada actividad del día. Sin esta tabla habría que confiar en que
 * ninguna de esas rutas se repita; con ella, repetirla no cuesta nada: la
 * segunda inserción no entra y no se suma nada al saldo.
 *
 * Es también el registro de por qué alguien tiene lo que tiene. Un saldo sin
 * historia no se puede auditar cuando un estudiante diga que le faltan 20.
 */
create table if not exists public.cristal_movimiento (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  clave      text        not null,
  cristales  integer     not null,
  motivo     text        not null,
  creado_en  timestamptz not null default now(),
  primary key (user_id, clave)
);

alter table public.cristal_movimiento enable row level security;
alter table public.cristal_movimiento force row level security;
/* Sin políticas: igual que liga_membresia, solo la tocan las funciones de abajo. */

-- ── 3. Pagar ────────────────────────────────────────────────────────────────
/*
 * La única puerta por la que entran Cristales. Devuelve cuántos dio: 0 si esa
 * clave ya estaba pagada, lo que se pidió si no.
 *
 * Invocador nunca: es definer y está revocada a todos los roles de cliente. La
 * llaman registrar_fp y el cierre semanal, que ya son definer.
 */
create or replace function public.cristales_dar(
  p_uid      uuid,
  p_clave    text,
  p_cantidad integer,
  p_motivo   text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
begin
  if p_uid is null or coalesce(p_cantidad, 0) <= 0 then return 0; end if;

  insert into public.cristal_movimiento (user_id, clave, cristales, motivo)
  values (p_uid, p_clave, p_cantidad, p_motivo)
  on conflict (user_id, clave) do nothing;

  get diagnostics v_filas = row_count;
  if v_filas = 0 then
    /* Ya estaba pagado. No es un error: es la garantía de no pagar dos veces. */
    return 0;
  end if;

  update public.profiles
     set cristales_balance = cristales_balance + p_cantidad
   where user_id = p_uid;

  return p_cantidad;
end;
$$;

/*
 * Cuántos Cristales vale cada hito de racha. Los mismos números que
 * CRISTALES_RACHA de src/cristales/cristales.js.
 *
 * Los días son los de bono_racha() —3, 7, 14 y 30—: un hito que pague FP y no
 * Cristales, o al contrario, sería un hito distinto según dónde se mire.
 */
create or replace function public.cristales_racha(p_dias integer)
returns integer
language sql
immutable
as $$
  select case p_dias
    when 3  then 5
    when 7  then 10
    when 14 then 20
    when 30 then 50
    else 0
  end;
$$;

/*
 * El hito de racha, pagado EN PARALELO al bono de FP: la misma condición y el
 * mismo instante, sin volver a detectar nada. La clave lleva el día de Bogotá
 * porque la racha se puede perder y volver a llegar al día 3 —el bono de FP se
 * paga otra vez, y estos Cristales también—; lo que la clave impide es pagar
 * dos veces el MISMO hito del MISMO día, que es lo que pasaría si el estudiante
 * completa dos actividades seguidas.
 */
create or replace function public.cristales_por_racha(p_uid uuid, p_dias integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cant integer := public.cristales_racha(p_dias);
begin
  if v_cant <= 0 then return 0; end if;
  return public.cristales_dar(
    p_uid,
    'racha-' || p_dias || '-' || (now() at time zone 'America/Bogota')::date,
    v_cant,
    'Hito de racha de ' || p_dias || ' días'
  );
end;
$$;

/*
 * ═══════════ EL CONTADOR DE ACTIVIDADES: DISTINTAS, NUNCA REPETICIONES ══════
 *
 * Cada 5 actividades DISTINTAS paga 20. Se cuentan ids de actividad únicos, así
 * que repetir una que ya hiciste no mueve el contador: las repeticiones pagan 0
 * FP desde la 0033 pero SÍ dejan fila, y contarlas convertiría el contador en
 * un botón de farmear —abrir la misma actividad veinte veces—.
 *
 * Y las filas de bono 'racha-N' quedan fuera: no son actividades, son el premio
 * de un hábito. El Repaso Diario, en cambio, cuenta UNA VEZ como cualquier otra
 * actividad distinta: sus repeticiones diarias ya están premiadas por los hitos
 * de racha, y contarlo cada día pagaría el mismo hábito por dos vías.
 *
 * El bucle va desde el primer múltiplo y no desde el último pagado: cristales_dar
 * es idempotente, así que recorrerlos todos cuesta una consulta que no escribe
 * y deja el contador AL DÍA aunque alguien haya hecho actividades antes de que
 * esta migración existiera. Sin eso, quien ya tenía 40 actividades hechas
 * empezaría de cero.
 */
create or replace function public.cristales_por_actividades(p_uid uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_distintas integer;
  v_k         integer;
  v_dados     integer := 0;
begin
  if p_uid is null then return 0; end if;

  select count(distinct h.activity_id) into v_distintas
    from public.fp_history h
   where h.user_id = p_uid
     and h.activity_id not like 'racha-%';

  v_k := 5;
  while v_k <= v_distintas loop
    v_dados := v_dados + public.cristales_dar(
      p_uid, 'actividades-' || v_k, 20, v_k || ' actividades distintas completadas'
    );
    v_k := v_k + 5;
  end loop;

  return v_dados;
end;
$$;

-- ── 4. Cobrar: los niveles del avatar ───────────────────────────────────────
/*
 * Lo que cuesta cada nivel. El I no está: es de todos desde el primer día, sin
 * transacción. Los mismos números que PRECIO_NIVEL de src/cristales/cristales.js.
 *
 * NO SE REPRECIA NUNCA. Un precio que sube deja al que ahorró con menos de lo
 * que creía tener, y uno que baja convierte en tonto al que ya compró.
 */
create or replace function public.precio_nivel_avatar(p_nivel integer)
returns integer
language sql
immutable
as $$
  select case p_nivel
    when 2 then 60
    when 3 then 150
    when 4 then 300
    else null
  end;
$$;

/*
 * Comprar un nivel.
 *
 * ═══════════ UNA SOLA SENTENCIA: COMPROBAR Y COBRAR NO SE PUEDEN SEPARAR ════
 *
 * El saldo se comprueba en el WHERE del mismo UPDATE que lo descuenta, no en un
 * `if` antes. Con el `if`, dos toques del botón en el mismo segundo leen los
 * dos el saldo viejo, los dos deciden que alcanza y el saldo queda en negativo
 * —el check de la tabla lo rechazaría, pero con un error feo en vez de un «no
 * alcanza»—. Postgres serializa los dos UPDATE sobre la misma fila y re-evalúa
 * el WHERE con la fila ya cambiada: el segundo no encuentra nada que actualizar.
 *
 * COMPRAR NO ACTIVA. El nivel comprado se añade a la lista y nada más; ponerlo
 * es un toque del estudiante en la pestaña «Nivel». Comprar y lucir son dos
 * decisiones, y encadenarlas le quitaría la segunda.
 *
 * Y NO SE ATA A NADA. Ni a la forma ni a la paleta con las que se compró:
 * cambiar de figura después no hace perder un nivel pagado.
 */
create or replace function public.comprar_nivel_avatar(p_nivel integer)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_precio integer := public.precio_nivel_avatar(p_nivel);
  v_fila   public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para comprar' using errcode = '42501';
  end if;

  if v_precio is null then
    raise exception 'Ese nivel de avatar no se compra: %', p_nivel using errcode = '22023';
  end if;

  update public.profiles
     set cristales_balance      = cristales_balance - v_precio,
         /*
          * Sin ordenar y sin subconsulta, a propósito: `|| p_nivel` es atómico
          * sobre la fila que el UPDATE ya tiene bloqueada. El orden lo pone
          * quien lo lee (nivelesDesbloqueados en el cliente).
          */
         avatar_unlocked_levels = avatar_unlocked_levels || p_nivel
   where user_id = v_uid
     and cristales_balance >= v_precio
     and not (p_nivel = any (avatar_unlocked_levels))
  returning * into v_fila;

  if v_fila.user_id is null then
    /*
     * Una de tres: no alcanza, ya lo tenía, o no hay perfil. No se dice cuál
     * con un código distinto porque el cliente ya sabe el saldo y los niveles:
     * si llegó aquí con el botón apagado, es que su copia estaba vieja.
     */
    raise exception 'No se pudo comprar el nivel % (saldo insuficiente o ya comprado)', p_nivel
      using errcode = '22023';
  end if;

  /* La compra también queda en el libro, con signo negativo. */
  insert into public.cristal_movimiento (user_id, clave, cristales, motivo)
  values (v_uid, 'nivel-' || p_nivel, -v_precio, 'Nivel ' || p_nivel || ' del avatar')
  on conflict (user_id, clave) do nothing;

  return v_fila;
end;
$$;

-- ── 5. Elegir: forma, paleta y nivel ────────────────────────────────────────
/*
 * El guardado del selector. Se llama en CADA TOQUE —no hay botón de guardar—
 * así que manda solo lo que cambió: los nulls dejan el resto como estaba.
 *
 * Comprueba las tres cosas que el cliente no puede garantizar:
 *   · la forma y la paleta existen ('comparacion' NO es una paleta elegible:
 *     el check de la columna la rechaza, y aquí se dice con un mensaje)
 *   · el nivel está entre 1 y 4
 *   · Y ESTÁ COMPRADO. Es la razón de que esto sea una función y no un grant.
 */
create or replace function public.avatar_elegir(
  p_forma  text    default null,
  p_paleta text    default null,
  p_nivel  integer default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_fila public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para guardar tu avatar' using errcode = '42501';
  end if;

  if p_forma is not null and p_forma not in ('decaedro', 'prisma', 'nucleo', 'red', 'cuna') then
    raise exception 'Forma de avatar desconocida: %', p_forma using errcode = '22023';
  end if;

  if p_paleta is not null and p_paleta not in ('nocturno', 'marea', 'brasa', 'aurora') then
    raise exception 'Paleta de avatar desconocida: %', p_paleta using errcode = '22023';
  end if;

  if p_nivel is not null then
    if p_nivel < 1 or p_nivel > 4 then
      raise exception 'Nivel de avatar fuera de rango: %', p_nivel using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.profiles p
       where p.user_id = v_uid
         and (p_nivel = 1 or p_nivel = any (p.avatar_unlocked_levels))
    ) then
      raise exception 'El nivel % no está desbloqueado', p_nivel using errcode = '22023';
    end if;
  end if;

  update public.profiles
     set avatar_shape   = coalesce(p_forma, avatar_shape),
         avatar_palette = coalesce(p_paleta, avatar_palette),
         avatar_level   = coalesce(p_nivel, avatar_level)
   where user_id = v_uid
  returning * into v_fila;

  if v_fila.user_id is null then
    raise exception 'No hay perfil que actualizar' using errcode = '22023';
  end if;

  return v_fila;
end;
$$;

-- ── 6. Permisos ─────────────────────────────────────────────────────────────
/*
 * Las cinco internas, fuera del alcance de TODOS los roles de cliente,
 * `authenticated` incluido: ningún estudiante tiene por qué poder decir «dame
 * 300 Cristales». Las llaman registrar_fp y el cierre semanal, que corren como
 * su dueño.
 *
 * El revoke a anon y authenticated va explícito: en Supabase los privilegios
 * por defecto les dan ejecución al crear la función.
 */
revoke all on function public.cristales_dar(uuid, text, integer, text) from public, anon, authenticated;
revoke all on function public.cristales_racha(integer) from public, anon, authenticated;
revoke all on function public.cristales_por_racha(uuid, integer) from public, anon, authenticated;
revoke all on function public.cristales_por_actividades(uuid) from public, anon, authenticated;
revoke all on function public.precio_nivel_avatar(integer) from public, anon, authenticated;

/* Las dos del estudiante: comprar y elegir. */
revoke all on function public.comprar_nivel_avatar(integer) from public, anon;
revoke all on function public.avatar_elegir(text, text, integer) from public, anon;
grant execute on function public.comprar_nivel_avatar(integer) to authenticated;
grant execute on function public.avatar_elegir(text, text, integer) to authenticated;

/*
 * Y NINGÚN grant de escritura sobre las columnas nuevas de profiles. La 0032
 * revocó insert/update/delete a anon y authenticated y concedió solo nickname y
 * full_name; añadir una columna no reabre nada, pero se dice aquí para que la
 * próxima migración que toque profiles no lo dé por hecho.
 */
