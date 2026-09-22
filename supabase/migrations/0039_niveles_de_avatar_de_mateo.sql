-- ═══════════════════════════════════════════════════════════════════════════
-- 0039 — LOS CUATRO NIVELES DE AVATAR, DESBLOQUEADOS EN LA CUENTA DE MATEO
--
-- Un desbloqueo puntual y nada más. Mateo necesita ver las cuatro figuras en
-- el sitio real —para revisar el diseño con Xeno— y comprarlas con Cristales
-- que no ha ganado sería falsear su saldo.
--
-- ═══════════ LO QUE ESTO **NO** ES ═══════════
--
-- NO ES UN ROL DE ADMINISTRADOR, y no se debe leer como el principio de uno.
-- No añade columna, ni tabla, ni función, ni política: es un UPDATE a UNA fila,
-- escrito una vez. El día que haga falta un administrador de verdad, se diseña
-- aparte y con su propia discusión — no heredando de aquí.
--
-- NO SIMULA UNA COMPRA. `cristales_balance` no se toca y no se escribe nada en
-- `cristal_movimiento`, a propósito: ese libro registra movimientos de verdad,
-- y aquí no hubo ninguno. Meterle una fila inventada haría que el saldo dejara
-- de cuadrar con su historial, que es justo lo que ese libro sirve para poder
-- comprobar.
--
-- NO TOCA `avatar_level`. Desbloquear no es elegir: Mateo escoge el nivel que
-- quiera llevar en el selector, como cualquiera.
--
-- ═══════════ LA GUARDA DEL user_id, Y POR QUÉ ESTÁ ═══════════
--
-- El uuid de abajo llegó por fuera del repositorio. Se buscó en los archivos
-- —incluida la 0034, de donde se dijo que salía— y NO ESTÁ EN NINGUNO: ninguna
-- migración fija un user_id concreto. No se pudo confirmar contra nada de aquí.
--
-- Un uuid equivocado no daría error: le desbloquearía los cuatro niveles a OTRO
-- estudiante, en silencio, y nadie se enteraría hasta verlo con un avatar que
-- no compró. Así que no se escribe a ciegas: la migración comprueba que ese
-- uuid corresponda a la cuenta de Mateo —el mismo correo que la 0020 ya usa
-- como ancla— antes de escribir. Cero filas tocadas si algo no cuadra.
--
-- ═══════════ NO EXISTIR Y SER OTRO NO SON EL MISMO CASO ═══════════
--
-- La diferencia importa porque CI aplica las 39 migraciones sobre una base
-- VACÍA en cada push, y ahí la cuenta de Mateo no existe. Si «no existe» fuera
-- un error, este archivo dejaría el workflow en rojo para siempre.
--
--   el uuid no existe        → se salta, con aviso. En una base recién creada
--                              es lo esperado; en Supabase significa que el
--                              uuid está mal, y la fila resumen lo dice.
--   el uuid es de OTRA cuenta → ABORTA. Es el caso peligroso: seguir sería
--                              desbloquearle los niveles a otro estudiante.
--
-- Va DESPUÉS de la 0038. Idempotente: la segunda vez el array ya es el mismo y
-- el update no cambia nada.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  v_uid    constant uuid := '9282d5d3-99fd-4e96-8cf1-a3ea69c6ff20';
  v_correo constant text := 'lugox173@gmail.com';
  v_real   text;
  v_apodo  text;
  v_antes  integer[];
  v_filas  integer;
begin
  -- ── 1. ¿Ese uuid es de quien decimos? ─────────────────────────────────────
  select lower(u.email) into v_real
    from auth.users u
   where u.id = v_uid;

  if v_real is null then
    raise notice '0039 — el usuario % no existe en esta base: NO SE TOCÓ NADA.', v_uid;
    raise notice '0039 — sobre una base recién creada (CI) es lo esperado. Si sale en Supabase, el uuid está mal.';
    return;
  end if;

  if v_real is distinct from v_correo then
    raise exception
      '0039: el usuario % es «%», no «%». ABORTADO sin tocar nada: con el uuid equivocado esto le desbloquearía los niveles a otro estudiante.',
      v_uid, v_real, v_correo
      using errcode = '22023';
  end if;

  -- ── 2. ¿Tiene perfil? ─────────────────────────────────────────────────────
  select p.nickname, p.avatar_unlocked_levels into v_apodo, v_antes
    from public.profiles p
   where p.user_id = v_uid;

  if not found then
    raise notice '0039 — % existe pero no tiene fila en profiles: NO SE TOCÓ NADA.', v_correo;
    return;
  end if;

  -- ── 3. El desbloqueo. Una fila, y solo el array. ──────────────────────────
  /*
   * El where lleva el uuid Y una condición sobre el propio array: la segunda
   * vez que se corra no hay nada que actualizar, y v_filas sale 0. Eso no es
   * un fallo —es la idempotencia— y el aviso de abajo lo dice con esa palabra
   * en vez de dejar a nadie pensando que no funcionó.
   */
  update public.profiles
     set avatar_unlocked_levels = array[1, 2, 3, 4]
   where user_id = v_uid
     and avatar_unlocked_levels is distinct from array[1, 2, 3, 4];
  get diagnostics v_filas = row_count;

  raise notice '0039 — cuenta: % (%)', v_apodo, v_correo;
  raise notice '0039 — niveles antes: %', v_antes;
  raise notice '0039 — niveles ahora: %', array[1, 2, 3, 4];
  raise notice '0039 — filas actualizadas: %  %', v_filas,
    case when v_filas = 0 then '(ya los tenía: la migración es idempotente)' else '' end;
end $$;

-- ── 4. La fila resumen, para leerla en el editor de Supabase ────────────────
/*
 * Se comprueban las tres cosas que importan: que él los tenga los cuatro, que
 * su saldo de Cristales siga donde estaba —esto no cobra— y, sobre todo, que
 * NADIE MÁS haya quedado con más de un nivel sin haberlo comprado.
 *
 * Ese último recuento es el que convierte esta migración en algo que se puede
 * verificar de un vistazo: si algún día sale distinto de 0 sin que haya habido
 * compras, es que alguien escribió un uuid de más.
 */
/*
 * Va por LEFT JOIN a propósito: así devuelve UNA fila pase lo que pase. Con un
 * `where` a secas, un uuid equivocado daría cero filas —un resultado vacío que
 * se lee como «no pasó nada» y se pasa por alto—. Aquí sale escrito.
 */
select
  coalesce(p.nickname, '(ese uuid no tiene perfil en esta base)')  as cuenta,
  p.avatar_unlocked_levels                                         as niveles,
  p.cristales_balance                                              as cristales,
  coalesce(p.avatar_unlocked_levels @> array[1, 2, 3, 4], false)   as tiene_los_cuatro,
  (select count(*) from public.profiles o
    where o.user_id is distinct from q.uid
      and array_length(o.avatar_unlocked_levels, 1) > 1)           as otros_con_niveles_extra,
  case
    when p.user_id is null then 'NO APLICADA — comprueba el uuid'
    when p.avatar_unlocked_levels @> array[1, 2, 3, 4] then 'PASA'
    else 'FALLA'
  end                                                              as resultado
from (select '9282d5d3-99fd-4e96-8cf1-a3ea69c6ff20'::uuid as uid) q
left join public.profiles p on p.user_id = q.uid;
