/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EDGE FUNCTION «asistente» — solo los cables.
 *
 * Todo lo que puede salir mal está en manejador.js, que se prueba con Node.
 * Aquí solo se conecta: el cliente de Supabase con la sesión del estudiante,
 * el SDK de Anthropic con la clave del servidor, y Deno.serve.
 *
 * ═══════════ LA CLAVE NO PASA NUNCA POR EL NAVEGADOR ═══════════
 *
 * ANTHROPIC_API_KEY se lee con Deno.env.get, del almacén de secretos de
 * Supabase. NO es una variable VITE_*, y esa diferencia no es de estilo:
 *
 *   VITE_GOOGLE_CLIENT_ID    es público POR DISEÑO. Google lo publica en el
 *                            botón; su seguridad está en los orígenes
 *                            autorizados, no en el secreto.
 *   VITE_SUPABASE_ANON_KEY   es público por diseño. Lo que protege las filas
 *                            es RLS, no que la clave no se vea.
 *   ANTHROPIC_API_KEY        NO es público. Quien la tenga puede gastar el
 *                            saldo de la cuenta hasta agotarlo.
 *
 * Vite incrusta en el bundle TODO lo que empiece por VITE_. Poner esta clave
 * ahí la publicaría a cada estudiante, y a cualquiera que abra el sitio. Por
 * eso vive aquí, del lado del servidor, y hay una prueba que busca su patrón
 * dentro de dist/ en cada ejecución.
 *
 * ═══════════ LA SESIÓN SE COMPRUEBA DOS VECES ═══════════
 *
 * Supabase verifica el JWT antes de invocar esta función (salvo que se
 * despliegue con --no-verify-jwt). Aun así, el cliente de abajo se construye
 * CON LA CABECERA DEL ESTUDIANTE, no con la service_role: así `auth.uid()`
 * dentro de asistente_consumir() es el estudiante de verdad, y el cupo se le
 * cobra a quien llamó. Con la service_role, auth.uid() sería null y el límite
 * no distinguiría a nadie.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { manejar } from "./manejador.js";

/* El sitio es una sola página en aprendefae.com; en local, el dev server. */
const ORIGENES = ["https://aprendefae.com", "https://www.aprendefae.com", "http://localhost:5173"];

function cabecerasCors(origen: string | null) {
  const permitido = origen && ORIGENES.includes(origen) ? origen : ORIGENES[0];
  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (peticion: Request) => {
  const cors = cabecerasCors(peticion.headers.get("Origin"));

  if (peticion.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const env = Deno.env.toObject();
  const autorizacion = peticion.headers.get("Authorization") ?? "";

  /*
   * El cliente habla como el ESTUDIANTE, no como el servidor: se le pasa su
   * cabecera tal cual. Es lo que hace que auth.uid() sea él dentro de la RPC.
   */
  const supabase = createClient(
    env.SUPABASE_URL ?? "",
    env.SUPABASE_ANON_KEY ?? "",
    { global: { headers: { Authorization: autorizacion } }, auth: { persistSession: false } },
  );

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY ?? "" });

  const respuesta = await manejar(peticion, {
    env,

    async consumirCupo(limite: number) {
      const { data, error } = await supabase.rpc("asistente_consumir", { p_limite: limite });
      if (error) throw error;
      const fila = Array.isArray(data) ? data[0] : data;
      return {
        permitido: fila?.permitido === true,
        usadas: Number(fila?.usadas ?? 0),
        limite: Number(fila?.limite ?? limite),
      };
    },

    async llamarModelo({ system, messages, modelo, maxTokens }: { system: string; messages: unknown[]; modelo: string; maxTokens: number }) {
      /* Bruno (bruno.js): prompt de sistema pedagógico, con el contexto de la pantalla en el turno. */
      const r = await anthropic.messages.create({
        model: modelo,
        max_tokens: maxTokens,
        system,
        // deno-lint-ignore no-explicit-any
        messages: messages as any,
      });
      return r.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("")
        .trim();
    },

    registrar(nivel: string, texto: string) {
      /* Al registro del servidor, nunca a la respuesta. */
      if (nivel === "error") console.error("[asistente]", texto);
      else console.log("[asistente]", texto);
    },
  });

  for (const [k, v] of Object.entries(cors)) respuesta.headers.set(k, v);
  return respuesta;
});
