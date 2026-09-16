-- ═══════════════════════════════════════════════════════════════════════════
-- 0032 — UN ESTUDIANTE SOLO PUEDE ESCRIBIR SU APODO Y SU NOMBRE REAL
--
-- EL HUECO. La política "perfil propio: actualizar" (0001) es de FILA: dice
-- qué fila puede tocar un estudiante —la suya— pero no qué columnas. Y
-- Supabase le da ALL sobre toda tabla nueva de public. Resultado: desde el
-- navegador, con su propia sesión, un estudiante podía hacer
--
--     supabase.from("profiles").update({ points: 99999, streak: 400,
--       best_streak: 400, es_prueba: true }).eq("user_id", yo)
--
-- y la base lo aceptaba. es_prueba, además, lo sacaba de los agregados del
-- panel docente. Salió al construir Editar perfil, que escribe en esta tabla.
--
-- EL ARREGLO: permisos por COLUMNA, sumados a la política de fila que ya hay.
--
--   update   solo nickname y full_name
--   insert   solo user_id, nickname y full_name (el primer ingreso); el resto
--            de columnas nace con su default
--   delete   ninguno (tampoco había política que lo permitiera)
--
-- Es el mismo patrón que la 0017 con fp_detalle: Supabase concede ALL y la
-- migración REVOCA lo que no toca. Se eligió frente a un trigger BEFORE UPDATE
-- porque aquí no hay que adivinar quién llama: los permisos por columna los
-- aplica Postgres antes de mirar una fila, y un trigger dentro de una función
-- security definer vería al dueño, no al estudiante.
--
-- LO QUE SIGUE INTACTO:
--   · registrar_fp y racha_animacion, las únicas funciones que escriben FP y
--     rachas en profiles, son security definer: corren con los permisos de su
--     dueño, no con los de authenticated. Este revoke no las toca.
--   · el rol de servicio no se toca: se revoca solo a anon y authenticated.
--   · leer (select) sigue igual: lo da Supabase y lo filtra RLS.
--
-- Se puede correr dos veces: revocar lo ya revocado y conceder lo ya concedido
-- no cambia nada.
-- ═══════════════════════════════════════════════════════════════════════════

revoke insert, update, delete, truncate on public.profiles from anon, authenticated;

grant insert (user_id, nickname, full_name) on public.profiles to authenticated;
grant update (nickname, full_name) on public.profiles to authenticated;
