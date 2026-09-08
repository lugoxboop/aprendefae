import { createClient } from "@supabase/supabase-js";

/*
 * Cliente de Supabase.
 *
 * Las credenciales llegan por variables de entorno (.env.local en desarrollo,
 * variables del hosting en producción). La anon key es pública por diseño: lo
 * que protege los datos son las políticas RLS de la tabla, no el secreto de
 * esta clave.
 */

/*
 * FUERA DE VITE, import.meta.env NO EXISTE.
 *
 * Las pruebas corren con node a secas, y hasta ahora cualquier módulo que
 * importara este —directa o indirectamente— reventaba al cargarse con
 * "Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')", antes
 * de llegar a ninguna aserción. Eso dejaba sin poder probar todo src/docente,
 * que importa datos.js, que importa esto.
 *
 * Con el entorno vacío el módulo hace exactamente lo que ya hacía sin
 * credenciales: exporta supabase en null. No hay rama nueva que mantener.
 */
const env = import.meta.env ?? {};

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID ?? "";

/* Sin credenciales el sitio sigue funcionando: solo no habrá inicio de sesión. */
export const supabaseConfigurado = Boolean(url && anonKey);

export const supabase = supabaseConfigurado
  ? createClient(url, anonKey, {
      auth: {
        // la sesión sobrevive a recargas y se renueva sola con el refresh token
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "aprendefae-auth",
      },
    })
  : null;

if (!supabaseConfigurado && env.DEV) {
  console.warn(
    "[aprendeFAE] Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY: el inicio de sesión queda desactivado."
  );
}
