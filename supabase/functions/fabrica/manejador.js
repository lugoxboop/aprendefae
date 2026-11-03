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
 *
 * ═══════════ DOS PASADAS, DOS PUERTAS ═══════════
 *
 * Desde el 3-nov un encargo son varias llamadas y no una: «plan» lee el
 * material y devuelve la lectura más el plan; «pieza» escribe UNA actividad
 * y la guarda. El archivo viaja solo en la primera.
 *
 * Partirlo era obligatorio, no una preferencia: una función de Supabase muere
 * a los 400 s —150 s en plan gratuito— y la generación buena tarda minutos.
 *
 * Cada pasada guarda lo suyo en cuanto lo tiene. Si el profesor cierra el
 * navegador en la tercera actividad, las dos primeras ya están en sus
 * borradores. Antes, un encargo interrumpido se perdía entero.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  MAX_MENSAJE, MODELO_POR_DEFECTO, MAX_TOKENS, MOTIVOS, PIEZAS_POR_LOTE,
  peticionPlan, peticionPieza, leerPlan, leerPieza, revisarArchivos, leerLimite,
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

  const pasada = cuerpo?.pasada === "pieza" ? "pieza" : "plan";
  const mensaje = typeof cuerpo?.mensaje === "string" ? cuerpo.mensaje.trim().slice(0, MAX_MENSAJE) : "";

  /* Lo que cada pasada necesita para arrancar. */
  let peticionAlModelo;
  if (pasada === "plan") {
    const revision = revisarArchivos(cuerpo?.archivos);
    if (!revision.ok) return responder(400, { error: revision.motivo });
    /* Hace falta algo de lo que partir: o lo que escribió, o lo que adjuntó. */
    if (!mensaje && revision.archivos.length === 0) return responder(400, { error: MOTIVOS.sinEncargo });
    peticionAlModelo = () => peticionPlan({ materia, mensaje, archivos: revision.archivos });
  } else {
    const lectura = cuerpo?.lectura;
    const actividad = cuerpo?.actividad;
    /* La lectura es lo que sustituye al archivo: sin ella la pasada escribiría
       del aire, y el resultado sería justo la actividad tosca que esto vino a
       arreglar. */
    if (!lectura || typeof lectura !== "object" || !actividad || typeof actividad !== "object") {
      return responder(400, { error: MOTIVOS.sinEncargo });
    }
    peticionAlModelo = () => peticionPieza({ materia, lectura, actividad, mensaje });
  }

  /* El cupo. Lo decide la base: es la única que puede contar bien. Cuenta
     LLAMADAS al modelo, no encargos, porque es la llamada lo que cuesta. */
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
  const { system, messages } = peticionAlModelo();

  let crudo;
  try {
    crudo = await llamarModelo({ system, messages, modelo, maxTokens: MAX_TOKENS });
  } catch (e) {
    /* El detalle va al registro: un error del proveedor puede traer la clave. */
    registrar("error", "El modelo falló: " + (e?.message ?? e));
    return responder(502, { error: MOTIVOS.modelo });
  }

  const cuenta = { usadas: cupo.usadas, limite: cupo.limite, limiteFuente: fuente, modelo };

  if (pasada === "plan") {
    const { plan, ilegible } = leerPlan(crudo, PIEZAS_POR_LOTE);
    if (ilegible) registrar("error", "El plan del modelo no traía JSON legible");
    if (!plan) return responder(422, { error: MOTIVOS.vacio });
    return responder(200, { pasada, plan, ...cuenta });
  }

  const { pieza, ilegible } = leerPieza(crudo);
  if (ilegible) registrar("error", "La pieza del modelo no traía JSON legible");
  /* Una pieza sin escena, o con pasos que no encienden nada, no se guarda. El
     cliente decide si la vuelve a pedir; aquí no se publica a medias. */
  if (!pieza) return responder(422, { error: MOTIVOS.vacio });

  let guardadas = 1;
  try {
    const n = await guardar({ materia, piezas: [pieza], encargo: mensaje, modelo });
    if (Number.isInteger(n)) guardadas = n;
  } catch (e) {
    if (e?.code === "42501") return responder(403, { error: MOTIVOS.noDocente });
    registrar("error", "No se pudo guardar el borrador: " + (e?.message ?? e));
    return responder(503, { error: MOTIVOS.modelo });
  }

  /* Se devuelve también para poder enseñarla sin otra vuelta a la base. */
  return responder(200, { pasada, pieza, creadas: guardadas, ...cuenta });
}
