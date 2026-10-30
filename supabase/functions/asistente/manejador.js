/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MANEJADOR DEL ASISTENTE — la tubería, sin nada del asistente todavía.
 *
 * Recibe un mensaje del sitio, comprueba quién llama y cuánto lleva usado, le
 * pregunta al modelo y devuelve la respuesta. NO hay prompt de sistema, ni
 * comportamiento pedagógico, ni contexto: eso llega con Gen, después de los
 * pasos 1, 2 y 4.
 *
 * ═══════════ POR QUÉ ESTO ES .js Y NO .ts ═══════════
 *
 * Para poder probarlo. Las Edge Functions corren en Deno y el proyecto prueba
 * con Node; escribir la lógica en JavaScript plano, sin un solo import, deja
 * que los dos la carguen tal cual. index.ts solo conecta los cables —el
 * cliente de Supabase, el SDK de Anthropic, Deno.serve— y todo lo que puede
 * salir mal en seguridad vive aquí, donde hay pruebas que lo miran.
 *
 * ═══════════ LAS DEPENDENCIAS ENTRAN, NO SE IMPORTAN ═══════════
 *
 * `manejar(peticion, deps)` recibe con qué hablar con la base y con el modelo.
 * Así una prueba puede simular «la base dice que se pasó del límite» sin una
 * base, y «el modelo contestó esto» sin gastar un solo token — que además es
 * lo único que se puede hacer mientras no haya créditos de API.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * El límite POR DEFECTO, mientras Stanley cierra el número.
 *
 * Es provisional y está puesto bajo a propósito: si el secreto no llega a
 * configurarse, el fallo es «se gastó el cupo antes de tiempo», no una factura.
 * El valor de verdad se pone con `supabase secrets set ASISTENTE_LIMITE_DIARIO=N`
 * y NO requiere volver a desplegar la función ni tocar este archivo.
 */
export const LIMITE_PROVISIONAL = 10;

/* El modelo de prueba de la tubería. También configurable, por lo mismo. */
export const MODELO_POR_DEFECTO = "claude-haiku-4-5";

import { construirPeticion, recortarPalabras, MAX_MENSAJE } from "./bruno.js";

/* Techo de la respuesta. Corto: aquí solo se demuestra que el tubo conduce. */
/* Bruno no pasa de 120 palabras (~200 tokens en español); 400 deja margen sin pagar de más. */
export const MAX_TOKENS = 400;

/** Lee el límite del entorno. Devuelve también de dónde salió, para el registro. */
export function leerLimite(env) {
  const crudo = env?.ASISTENTE_LIMITE_DIARIO;
  if (crudo === undefined || crudo === null || String(crudo).trim() === "") {
    return { limite: LIMITE_PROVISIONAL, fuente: "provisional" };
  }
  const n = Number(crudo);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return { limite: LIMITE_PROVISIONAL, fuente: "provisional-por-valor-invalido", crudo: String(crudo) };
  }
  return { limite: n, fuente: "secreto" };
}

/*
 * ═══════════ LA CABECERA DE SESIÓN ═══════════
 *
 * Supabase ya verifica el JWT antes de que esta función arranque, salvo que se
 * despliegue con --no-verify-jwt. Aquí se comprueba OTRA VEZ, y no por
 * desconfianza: si alguien despliega mañana con esa bandera —para depurar, por
 * ejemplo— la función seguiría cerrada. Una puerta que depende de que nadie se
 * equivoque al desplegarla no es una puerta.
 */
export function hayCabeceraDeSesion(peticion) {
  const cabecera = peticion?.headers?.get?.("Authorization") ?? "";
  if (!/^Bearer\s+\S+/i.test(cabecera)) return false;
  /* «Bearer» seguido del anon key no es una sesión, pero eso no se puede saber
   * desde aquí: lo decide auth.uid() en la base, que es quien manda. */
  return true;
}

const JSON_CABECERAS = { "Content-Type": "application/json; charset=utf-8" };

/** Respuesta JSON con el código que toque. */
function responder(estado, cuerpo, cabeceras = {}) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...JSON_CABECERAS, ...cabeceras },
  });
}

/*
 * ═══════════ LO QUE NUNCA SALE EN UNA RESPUESTA ═══════════
 *
 * Ni la clave, ni el mensaje crudo de un error del proveedor —que puede traer
 * cabeceras, ids de organización o el cuerpo de la petición—. Al estudiante le
 * llega un motivo corto; el detalle va al registro del servidor, que solo ve
 * quien administra el proyecto.
 */
export const MOTIVOS = {
  sinSesion: "Necesitas iniciar sesión para usar el asistente.",
  limite: "Llegaste al límite de consultas de hoy. Vuelve mañana.",
  sinMensaje: "No llegó ninguna pregunta.",
  sinClave: "El asistente no está configurado en el servidor.",
  modelo: "El asistente no pudo responder en este momento. Inténtalo otra vez.",
};

/**
 * @param {Request} peticion
 * @param {object} deps
 * @param {object} deps.env                 el entorno (Deno.env.toObject() o un objeto de prueba)
 * @param {Function} deps.consumirCupo      (limite) → {permitido, usadas, limite} | lanza
 * @param {Function} deps.llamarModelo      ({mensaje, modelo, maxTokens}) → texto
 * @param {Function} [deps.registrar]       para el registro del servidor
 * @returns {Promise<Response>}
 */
export async function manejar(peticion, deps) {
  const { env = {}, consumirCupo, llamarModelo, registrar = () => {} } = deps ?? {};

  if (peticion.method !== "POST") {
    return responder(405, { error: "Método no permitido" }, { Allow: "POST" });
  }

  /* 1. ¿Hay sesión? Sin cabecera no se sigue: ni se mira el cuerpo. */
  if (!hayCabeceraDeSesion(peticion)) {
    return responder(401, { error: MOTIVOS.sinSesion });
  }

  /* 2. ¿Está configurada la clave? Se comprueba ANTES de gastar una del cupo. */
  if (!env.ANTHROPIC_API_KEY) {
    registrar("error", "ANTHROPIC_API_KEY no está configurada como secreto");
    return responder(503, { error: MOTIVOS.sinClave });
  }

  /* 3. El mensaje. */
  let cuerpo;
  try {
    cuerpo = await peticion.json();
  } catch {
    return responder(400, { error: MOTIVOS.sinMensaje });
  }
  const mensaje = typeof cuerpo?.mensaje === "string" ? cuerpo.mensaje.trim().slice(0, MAX_MENSAJE) : "";
  if (!mensaje) return responder(400, { error: MOTIVOS.sinMensaje });
  /* Bruno: el prompt pedagógico, lo que ve el estudiante y la conversación (bruno.js). */
  const { system, messages } = construirPeticion({ mensaje, contexto: cuerpo?.contexto, historial: cuerpo?.historial });

  /* 4. El cupo. Lo decide la base, no esta función. */
  const { limite, fuente } = leerLimite(env);
  let cupo;
  try {
    cupo = await consumirCupo(limite);
  } catch (e) {
    /*
     * 42501 es lo que levanta asistente_consumir() cuando auth.uid() es null:
     * la cabecera venía, pero no era una sesión de verdad. Es un 401, no un 500.
     */
    if (e?.code === "42501") return responder(401, { error: MOTIVOS.sinSesion });
    registrar("error", "No se pudo consultar el cupo: " + (e?.message ?? e));
    return responder(503, { error: MOTIVOS.modelo });
  }

  if (!cupo?.permitido) {
    return responder(429, {
      error: MOTIVOS.limite,
      usadas: cupo?.usadas ?? limite,
      limite: cupo?.limite ?? limite,
    });
  }

  /* 5. El modelo. */
  const modelo = env.ASISTENTE_MODELO || MODELO_POR_DEFECTO;
  let texto;
  try {
    texto = recortarPalabras(await llamarModelo({ mensaje, system, messages, modelo, maxTokens: MAX_TOKENS }));
  } catch (e) {
    /* El detalle va al registro; al estudiante, un motivo corto. */
    registrar("error", "El modelo falló: " + (e?.message ?? e));
    return responder(502, { error: MOTIVOS.modelo });
  }

  return responder(200, {
    respuesta: texto,
    modelo,
    usadas: cupo.usadas,
    limite: cupo.limite,
    /* De dónde salió el límite, para saber si el secreto está puesto. */
    limiteFuente: fuente,
  });
}
