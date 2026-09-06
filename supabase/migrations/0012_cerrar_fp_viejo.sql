-- ---------------------------------------------------------------------------
-- 0012 — Cierre de la brecha de FP (mitad DESTRUCTIVA).
--
-- ESTA ES LA QUE DE VERDAD CIERRA. La 0011 añadió la función nueva al lado de
-- la vieja para que el despliegue no dejara a nadie sin FP; mientras la vieja
-- siga existiendo y la política de insert siga abierta, la brecha sigue ahí.
--
-- CUÁNDO CORRERLA: DESPUÉS de que el código nuevo esté desplegado y
-- funcionando. Si se corre antes, el cliente que hay en producción llama a una
-- firma que ya no existe y deja de otorgarse FP.
--
-- Cómo saber que ya toca: entrar al sitio, completar una actividad y ver que
-- suma puntos. Si suma, el código nuevo ya está arriba y esta migración es
-- segura.
--
-- Las dos cosas que se retiran son las dos puertas:
--
--   · la firma vieja, que aceptaba el número de puntos del cliente;
--   · la política de RLS que permitía insertar en fp_history sin pasar por
--     ninguna función.
--
-- Cerrar solo una no habría servido de nada.
-- ---------------------------------------------------------------------------

-- La firma vieja: ocho parámetros, con p_fp entre ellos.
drop function if exists public.registrar_fp(text, text, integer, text, text, integer, numeric, integer);

-- La escritura directa al historial.
drop policy if exists "historial propio: registrar" on public.fp_history;
revoke insert, update, delete on public.fp_history from authenticated;

-- La lectura del historial propio se mantiene: el perfil, las medallas y el
-- resumen la necesitan, y leer lo suyo no permite falsear nada.
