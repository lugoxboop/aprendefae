/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MANEJADOR DE LA FÁBRICA — el orden en que se dice que no.
 *
 * Mismo reparto que el asistente: aquí toda la lógica y las puertas, en .js
 * plano para que Deno y las pruebas de Node lo carguen igual; en index.ts solo
 * los cables. Las dependencias entran por parámetro, así que una prueba puede
 * simular «el modelo devolvió basura» o «se acabó el cupo» sin base y sin
 * gastar un token.
 *
 * ═══════════ EL ORDEN IMPORTA ═══════════
 *
 * Sesión → clave → encargo → archivos → cupo → modelo. El cupo va al final de
 * las comprobaciones baratas a propósito: cobrarle una invocación a quien
 * mandó un archivo de 40 MB sería cobrarle por un error que no llegó a costar
 * nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  MAX_MENSAJE, MODELO_POR_DEFECTO, MAX_TOKENS, MOTIVOS, PIEZAS_POR_LOTE,
  construirPeticion, leerPiezas, revisarArchivos, leerLimite,
} from "./fabrica.js";

const JSON_CABECERAS = { "Content-Type": "application/json; charset=utf-8" };

function responder(estado, cuerpo, cabeceras = {}) {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...JSON_CABECERAS, ...cabeceras } });
}

export function hayCabeceraDeSesion(peticion) {
  const cabecera = peticion?.headers?.get?.("Authorization") ?? "";
  return /^Bearer\s+\S+/i.test(cabecera);
}

/**
 * @param {Request} peticion
 * @param {object} deps
 * @param {object} deps.env
 * @param {Function} deps.consumirCupo   (limite) → {permitido, usadas, limite}
 * @param {Function} deps.llamarModelo   ({system, messages, modelo, maxTokens}) → texto
 * @param {Function} deps.guardar        ({materia, piezas, encargo, modelo}) → nº guardadas
 * @param {Function} [deps.registrar]
 */
export async function manejar(peticion, deps) {
  const { env = {}, consumirCupo, llamarModelo, guardar, registrar = () => {} } = deps ?? {};

  if (peticion.method !== "POST") return responder(405, { error: "Método no permitido" }, { Allow: "POST" });
  if (!hayCabeceraDeSesion(peticion)) return responder(401, { error: MOTIVOS.sinSesion });
  if (!env.ANTHROPIC_API_KEY) {
    registrar("error", "ANTHROPIC_API_KEY no está configurada como secreto");
    return responder(503, { error: MOTIVOS.sinClave });
  }

  let cuerpo;
  try { cuerpo = await peticion.json(); } catch { return responder(400, { error: MOTIVOS.sinEncargo }); }

  const materia = typeof cuerpo?.materia === "string" ? cuerpo.materia.trim().slice(0, 60) : "";
  if (!materia) return responder(400, { error: MOTIVOS.sinEncargo });

  const mensaje = typeof cuerpo?.mensaje === "string" ? cuerpo.mensaje.trim().slice(0, MAX_MENSAJE) : "";
  const revision = revisarArchivos(cuerpo?.archivos);
  if (!revision.ok) return responder(400, { error: revision.motivo });

  /* Hace falta algo de lo que partir: o lo que escribió, o lo que adjuntó. */
  if (!mensaje && revision.archivos.length === 0) return responder(400, { error: MOTIVOS.sinEncargo });

  /* El cupo. Lo decide la base: es la única que puede contar bien. */
  const { limite, fuente } = leerLimite(env);
  let cupo;
  try {
    cupo = await consumirCupo(limite);
  } catch (e) {
    /* 42501 lo levanta fabrica_consumir() cuando quien llama no es docente. */
    if (e?.code === "42501") return responder(403, { error: MOTIVOS.noDocente });
    registrar("error", "No se pudo consultar el cupo: " + (e?.message ?? e));
    return responder(503, { error: MOTIVOS.modelo });
  }
  if (!cupo?.permitido) {
    return responder(429, { error: MOTIVOS.limite, usadas: cupo?.usadas ?? limite, limite: cupo?.limite ?? limite });
  }

  const modelo = env.FABRICA_MODELO || MODELO_POR_DEFECTO;
  const { system, messages } = construirPeticion({ materia, mensaje, archivos: revision.archivos });

  let crudo;
  try {
    crudo = await llamarModelo({ system, messages, modelo, maxTokens: MAX_TOKENS });
  } catch (e) {
    /* El detalle va al registro: un error del proveedor puede traer la clave. */
    registrar("error", "El modelo falló: " + (e?.message ?? e));
    return responder(502, { error: MOTIVOS.modelo });
  }

  const { piezas, descartadas, ilegible } = leerPiezas(crudo, PIEZAS_POR_LOTE);
  if (ilegible) registrar("error", "La respuesta del modelo no traía JSON legible");
  if (descartadas) registrar("info", `${descartadas} pieza(s) descartadas por no encajar en el molde`);
  if (piezas.length === 0) return responder(422, { error: MOTIVOS.vacio });

  let guardadas = piezas.length;
  try {
    const n = await guardar({ materia, piezas, encargo: mensaje, modelo });
    if (Number.isInteger(n)) guardadas = n;
  } catch (e) {
    if (e?.code === "42501") return responder(403, { error: MOTIVOS.noDocente });
    registrar("error", "No se pudieron guardar los borradores: " + (e?.message ?? e));
    return responder(503, { error: MOTIVOS.modelo });
  }

  return responder(200, {
    creadas: guardadas,
    /* Se devuelven también para poder enseñarlas sin otra vuelta a la base. */
    piezas,
    descartadas,
    modelo,
    usadas: cupo.usadas,
    limite: cupo.limite,
    limiteFuente: fuente,
  });
}
