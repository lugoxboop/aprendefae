/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EDGE FUNCTION «fabrica» — solo los cables.
 *
 * Recibe el encargo de un docente (lo que escribió y lo que adjuntó), se lo
 * pasa al modelo con el molde de una pieza de Aprender, y guarda lo que salga
 * como BORRADORES suyos. Nada llega a un estudiante por aquí: publicar es un
 * acto del profesor, en su panel.
 *
 * Toda la lógica está en manejador.js y fabrica.js, que se prueban con Node.
 * Aquí solo se conecta: el cliente de Supabase con la sesión del docente, el
 * SDK de Anthropic con la clave del servidor, y Deno.serve.
 *
 * ═══════════ EL CLIENTE HABLA COMO EL DOCENTE ═══════════
 *
 * Igual que en «asistente», y por el mismo motivo: con la service_role,
 * auth.uid() sería null dentro de las funciones y ni el cupo sabría a quién
 * cobrarle ni el borrador de quién es. Con su cabecera, la base reconoce al
 * docente y es ella la que comprueba que la materia sea suya.
 *
 * ═══════════ EL ARCHIVO NO SE GUARDA EN NINGÚN SITIO ═══════════
 *
 * Entra en el cuerpo de la petición, se le pasa al modelo y muere con la
 * invocación. No hay Storage, no hay tabla y no hay repositorio de por medio.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { manejar } from "./manejador.js";

const ORIGENES = ["https://aprendefae.com", "https://www.aprendefae.com", "http://localhost:5173"];
const CABECERAS_BASE = "authorization, x-client-info, apikey, content-type";

function cabecerasCors(origen: string | null, pedidas: string | null) {
  const permitido = origen && ORIGENES.includes(origen) ? origen : ORIGENES[0];
  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Headers": pedidas ? `${CABECERAS_BASE}, ${pedidas}` : CABECERAS_BASE,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (peticion: Request) => {
  const cors = cabecerasCors(peticion.headers.get("Origin"), peticion.headers.get("Access-Control-Request-Headers"));
  if (peticion.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const env = Deno.env.toObject();
  const autorizacion = peticion.headers.get("Authorization") ?? "";

  const supabase = createClient(
    env.SUPABASE_URL ?? "",
    env.SUPABASE_ANON_KEY ?? "",
    { global: { headers: { Authorization: autorizacion } }, auth: { persistSession: false } },
  );

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY ?? "" });

  const respuesta = await manejar(peticion, {
    env,

    async consumirCupo(limite: number) {
      const { data, error } = await supabase.rpc("fabrica_consumir", { p_limite: limite });
      if (error) throw error;
      const fila = Array.isArray(data) ? data[0] : data;
      return {
        permitido: fila?.permitido === true,
        usadas: Number(fila?.usadas ?? 0),
        limite: Number(fila?.limite ?? limite),
      };
    },

    async llamarModelo({ system, messages, modelo, maxTokens }: { system: string; messages: unknown[]; modelo: string; maxTokens: number }) {
      // deno-lint-ignore no-explicit-any
      const r = await (anthropic.messages.create as any)({ model: modelo, max_tokens: maxTokens, system, messages });
      return (r.content as { type: string; text?: string }[])
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("")
        .trim();
    },

    async guardar({ materia, piezas, encargo, modelo }: { materia: string; piezas: unknown[]; encargo: string; modelo: string }) {
      const { data, error } = await supabase.rpc("guardar_borradores", {
        p_materia: materia, p_piezas: piezas, p_encargo: encargo, p_modelo: modelo,
      });
      if (error) throw error;
      return Number(data);
    },

    registrar(nivel: string, texto: string) {
      if (nivel === "error") console.error("[fabrica]", texto);
      else console.log("[fabrica]", texto);
    },
  });

  for (const [k, v] of Object.entries(cors)) respuesta.headers.set(k, v);
  return respuesta;
});
