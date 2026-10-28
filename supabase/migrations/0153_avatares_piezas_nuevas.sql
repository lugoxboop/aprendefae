/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0153 — CUATRO FORMAS Y DOS PALETAS MÁS, Y LA TIENDA DEJA DE VACIARSE
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Va en el rango del coordinador (150-199) y no en el de una célula, porque
 * toca el ESQUEMA: dos columnas nuevas en profiles y tres funciones. El
 * avatar y la Tienda son piezas compartidas por las cinco células; una
 * migración de célula aquí sería justo el choque que el guardián evita.
 *
 * Encargo de Mateo del 28-oct: «mejora los avatares, dale más diseños» y
 * «crea una tienda». La Tienda ya existía, pero solo vendía los tres niveles
 * del avatar: comprados los tres, se quedaba vacía para siempre y los
 * Cristales dejaban de servir para nada. Esto le da seis artículos más.
 *
 *   formas nuevas    vertice (30) · enlace (60) · astro (75) · orbita (100)
 *   paletas nuevas   ascua (45) · arrecife (45)
 *
 * Las dos paletas son los DOS PARES ORDENADOS QUE FALTABAN de los tres
 * colores de marca. Con tres colores hay seis pares y había cuatro; aquí se
 * agota el espacio. Una séptima obligaría a un cuarto color, y el ámbar está
 * reservado para las alertas del panel docente.
 *
 * ═══════════ LO VIEJO SIGUE SIENDO GRATIS, Y ESO NO ES UN DETALLE ═══════════
 *
 * Las cinco formas y las cuatro paletas de siempre entran en el DEFECTO de
 * las columnas nuevas, así que todo el que ya tiene perfil amanece con ellas
 * desbloqueadas. Nadie pierde el avatar que eligió ni tiene que volver a
 * comprarlo. Cobrar por algo que ya era de alguien no es monetizar: es
 * quitárselo.
 *
 * ═══════════ Y LOS FP NO SE TOCAN ═══════════
 *
 * Se paga en Cristales, como todo en la Tienda. Los FP son el puntaje
 * académico —ranking, ligas, bono de nota— y no se gastan, no se restan y no
 * se convierten. Mateo lo confirmó el 28-oct cuando se le planteó cobrar en
 * FP: un ranking gastable haría bajar de puesto a quien compra y convertiría
 * la Tienda en una razón para farmear puntos.
 *
 * ═══════════ LA LISTA VIVE POR TRIPLICADO, A PROPÓSITO ═══════════
 *
 * El check de la columna (que nadie escriba una forma inventada ni por SQL
 * directo), la validación de avatar_elegir() (para dar un mensaje decente en
 * vez de un error de restricción) y generador.js (para pintarlas). SQL no lee
 * JavaScript, así que catalogo-avatares.test.mjs LEE esta migración y falla si
 * los tres dejan de coincidir, igual que cristales.test.mjs hace con los
 * precios de los niveles.
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- ── 1. Los checks de la columna, ensanchados ────────────────────────────────
alter table public.profiles drop constraint if exists profiles_avatar_shape_valida;
alter table public.profiles add constraint profiles_avatar_shape_valida
  check (avatar_shape in ('decaedro', 'prisma', 'nucleo', 'red', 'cuna', 'vertice', 'astro', 'enlace', 'orbita'));

/* 'comparacion' sigue sin estar, y sigue siendo la mitad de para qué existe este check. */
alter table public.profiles drop constraint if exists profiles_avatar_palette_valida;
alter table public.profiles add constraint profiles_avatar_palette_valida
  check (avatar_palette in ('nocturno', 'marea', 'brasa', 'aurora', 'ascua', 'arrecife'));

-- ── 2. Qué piezas tiene cada quien ──────────────────────────────────────────
/*
 * Dos columnas nuevas, con las de siempre en el defecto. Espejan exactamente
 * a avatar_unlocked_levels, que ya hacía esto mismo con los niveles: misma
 * forma, mismo tipo de arreglo, misma manera de crecer (`|| valor` atómico).
 */
alter table public.profiles
  add column if not exists avatar_unlocked_shapes   text[] not null default '{decaedro,prisma,nucleo,red,cuna}',
  add column if not exists avatar_unlocked_palettes text[] not null default '{nocturno,marea,brasa,aurora}';

comment on column public.profiles.avatar_unlocked_shapes is
'Formas de avatar que este perfil puede usar (0153). Las cinco originales van en el defecto: eran libres y lo siguen siendo. Las nuevas las añade comprar_pieza_avatar(); el cliente no tiene grant sobre esta columna.';

comment on column public.profiles.avatar_unlocked_palettes is
'Paletas de avatar que este perfil puede usar (0153). Las cuatro originales van en el defecto. Las nuevas las añade comprar_pieza_avatar().';

/*
 * Quien ya tenía perfil ANTES de esta migración recibe el defecto en las dos
 * columnas, pero si eligió una forma o paleta cuando aún no existía la
 * columna, hay que asegurarse de que la suya esté dentro: si no, su propio
 * avatar le quedaría bloqueado. Esto es defensivo y debería no cambiar nada.
 */
update public.profiles
   set avatar_unlocked_shapes = avatar_unlocked_shapes || avatar_shape
 where not (avatar_shape = any (avatar_unlocked_shapes));

update public.profiles
   set avatar_unlocked_palettes = avatar_unlocked_palettes || avatar_palette
 where not (avatar_palette = any (avatar_unlocked_palettes));

-- ── 3. Cuánto cuesta cada pieza ─────────────────────────────────────────────
/*
 * null = no se vende, y eso incluye a las nueve piezas originales: no están
 * aquí porque no se compran, igual que el Nivel I no está en
 * precio_nivel_avatar().
 *
 * Los precios suben con lo elaborada que es la figura, no al azar: Vértice es
 * un triángulo y Órbita teje dieciséis vértices con cuerdas. Las dos paletas
 * valen lo mismo entre sí porque son el mismo trabajo.
 */
create or replace function public.precio_pieza_avatar(p_tipo text, p_clave text)
returns integer
language sql
immutable
as $$
  select case
    when p_tipo = 'forma' then case p_clave
      when 'vertice' then 30
      when 'enlace'  then 60
      when 'astro'   then 75
      when 'orbita'  then 100
      else null
    end
    when p_tipo = 'paleta' then case p_clave
      when 'ascua'    then 45
      when 'arrecife' then 45
      else null
    end
    else null
  end;
$$;

-- ── 4. Comprar una pieza ────────────────────────────────────────────────────
/*
 * Calcada de comprar_nivel_avatar(): el saldo se descuenta en la MISMA
 * sentencia que comprueba que alcanza y que no la tenía ya, así que dos
 * toques seguidos no pueden dejar el saldo en negativo ni cobrar dos veces.
 * Quien manda es la base; el cliente solo pinta el botón.
 */
create or replace function public.comprar_pieza_avatar(p_tipo text, p_clave text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_precio integer := public.precio_pieza_avatar(p_tipo, p_clave);
  v_fila   public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para comprar' using errcode = '42501';
  end if;

  if v_precio is null then
    raise exception 'Esa pieza de avatar no se compra: % %', p_tipo, p_clave using errcode = '22023';
  end if;

  if p_tipo = 'forma' then
    update public.profiles
       set cristales_balance    = cristales_balance - v_precio,
           avatar_unlocked_shapes = avatar_unlocked_shapes || p_clave
     where user_id = v_uid
       and cristales_balance >= v_precio
       and not (p_clave = any (avatar_unlocked_shapes))
    returning * into v_fila;
  elsif p_tipo = 'paleta' then
    update public.profiles
       set cristales_balance      = cristales_balance - v_precio,
           avatar_unlocked_palettes = avatar_unlocked_palettes || p_clave
     where user_id = v_uid
       and cristales_balance >= v_precio
       and not (p_clave = any (avatar_unlocked_palettes))
    returning * into v_fila;
  else
    raise exception 'Tipo de pieza desconocido: %', p_tipo using errcode = '22023';
  end if;

  if v_fila.user_id is null then
    /*
     * Una de tres: no alcanza, ya la tenía, o no hay perfil. No se distingue
     * con códigos distintos porque el cliente ya sabe el saldo y lo que tiene:
     * si llegó aquí con el botón apagado, es que su copia estaba vieja.
     */
    raise exception 'No se pudo comprar % «%» (saldo insuficiente o ya comprada)', p_tipo, p_clave
      using errcode = '22023';
  end if;

  /* La compra queda en el libro, con signo negativo, como la de los niveles. */
  insert into public.cristal_movimiento (user_id, clave, cristales, motivo)
  values (v_uid, p_tipo || '-' || p_clave, -v_precio, initcap(p_tipo) || ' ' || p_clave || ' del avatar')
  on conflict (user_id, clave) do nothing;

  return v_fila;
end;
$$;

-- ── 5. avatar_elegir(): ahora también exige TENER la pieza ──────────────────
/*
 * Se reescribe entera porque en PostgreSQL no se parchea un trozo. Lo que
 * cambia respecto a la 0035 son las dos listas y las dos comprobaciones de
 * propiedad; el resto —la sesión obligatoria, el rango del nivel y que el
 * nivel esté COMPRADO— va letra por letra como estaba. Esa última es la razón
 * de que esto sea una función y no un permiso de escritura, y no se afloja.
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

  if p_forma is not null then
    if p_forma not in ('decaedro', 'prisma', 'nucleo', 'red', 'cuna', 'vertice', 'astro', 'enlace', 'orbita') then
      raise exception 'Forma de avatar desconocida: %', p_forma using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.profiles p
       where p.user_id = v_uid and p_forma = any (p.avatar_unlocked_shapes)
    ) then
      raise exception 'La forma % no está desbloqueada', p_forma using errcode = '22023';
    end if;
  end if;

  if p_paleta is not null then
    if p_paleta not in ('nocturno', 'marea', 'brasa', 'aurora', 'ascua', 'arrecife') then
      raise exception 'Paleta de avatar desconocida: %', p_paleta using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.profiles p
       where p.user_id = v_uid and p_paleta = any (p.avatar_unlocked_palettes)
    ) then
      raise exception 'La paleta % no está desbloqueada', p_paleta using errcode = '22023';
    end if;
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
revoke all on function public.precio_pieza_avatar(text, text) from public, anon, authenticated;
revoke all on function public.comprar_pieza_avatar(text, text) from public, anon;
grant execute on function public.comprar_pieza_avatar(text, text) to authenticated;
