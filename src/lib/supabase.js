import { createClient } from "@supabase/supabase-js";

/*
 * Cliente de Supabase.
 *
 * Las credenciales llegan por variables de entorno (.env.local en desarrollo,
 * variables del hosting en producción). La anon key es pública por diseño: lo
 * que protege los datos son las políticas RLS de la tabla, no el secreto de
 * esta clave.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

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

if (!supabaseConfigurado && import.meta.env.DEV) {
  console.warn(
    "[aprendeFAE] Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY: el inicio de sesión queda desactivado."
  );
}
