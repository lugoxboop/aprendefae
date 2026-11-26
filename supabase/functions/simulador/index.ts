/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EDGE FUNCTION «simulador» — solo los cables (la lógica, en manejador.js).
 *
 * La clave es la MISMA que ya usa «asistente»: ANTHROPIC_API_KEY, del almacén
 * de secretos de Supabase, leída con Deno.env. Nunca una VITE_*: Vite la
 * metería en el bundle y cualquiera podría gastar el saldo. Ver
 * ../asistente/README.md, «Por qué esta clave no es una VITE_*».
 *
 * El cliente de Supabase habla con la cabecera del ESTUDIANTE, para que
 * auth.uid() dentro de simulador_consumir() sea él y el cupo se le cobre a
 * quien llamó.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import { createClient } from "jsr:@supabase/supabase-js@2.112.4";
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

/* Los modelos de la generación 5 piensan: el pensamiento sale del mismo
 * max_tokens. Esfuerzo bajo: la tarea es corta y el estudiante espera. */
function opcionesDelModelo(modelo: string, maxTokens: number) {
  if (/^claude-(sonnet|opus|haiku|fable)-5/.test(modelo)) {
    return { max_tokens: Math.max(maxTokens, 2500), thinking: { type: "adaptive" }, effort: "low" };
  }
  return { max_tokens: maxTokens };
}

Deno.serve(async (peticion: Request) => {
  const cors = cabecerasCors(peticion.headers.get("Origin"), peticion.headers.get("Access-Control-Request-Headers"));
  if (peticion.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const env = Deno.env.toObject();
  const supabase = createClient(env.SUPABASE_URL ?? "", env.SUPABASE_ANON_KEY ?? "", {
    global: { headers: { Authorization: peticion.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY ?? "" });

  const respuesta = await manejar(peticion, {
    env,
    async consumirCupo(limite: number) {
      const { data, error } = await supabase.rpc("simulador_consumir", { p_limite: limite });
      if (error) throw error;
      const fila = Array.isArray(data) ? data[0] : data;
      return { permitido: fila?.permitido === true, usadas: Number(fila?.usadas ?? 0), limite: Number(fila?.limite ?? limite) };
    },
    async llamarModelo({ system, messages, modelo, maxTokens, esquema }: { system: string; messages: unknown[]; modelo: string; maxTokens: number; esquema: unknown }) {
      const { effort, ...opciones } = opcionesDelModelo(modelo, maxTokens) as Record<string, unknown>;
      // deno-lint-ignore no-explicit-any
      const r = await (anthropic.messages.create as any)({
        model: modelo,
        ...opciones,
        /* El prompt de sistema es fijo por escenario: se cachea. */
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages,
        output_config: { ...(effort ? { effort } : {}), format: { type: "json_schema", schema: esquema } },
      });
      if (r.stop_reason === "refusal") throw new Error("refusal");
      return (r.content as { type: string; text?: string }[]).filter((b) => b.type === "text").map((b) => b.text ?? "").join("").trim();
    },
    registrar(nivel: string, texto: string) {
      if (nivel === "error") console.error("[simulador]", texto);
      else console.log("[simulador]", texto);
    },
  });

  for (const [k, v] of Object.entries(cors)) respuesta.headers.set(k, v);
  return respuesta;
});
