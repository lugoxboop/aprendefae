import { FORMATO_RUTA, PUEDE_ENTREGAR } from "./ruta.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ROLES: quién corre con qué modelo, con cuánto esfuerzo y con qué manos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════ POR QUÉ TODOS VAN EN EL MODELO CAPAZ, DE MOMENTO ═══════════
 *
 * El encargo pide reservar el modelo más capaz para la compilación y usar uno
 * más barato en «pasos mecánicos: reportes de Ukyo, chequeos de formato».
 *
 * En esta primera versión NO HAY ningún paso mecánico que baje de modelo:
 *
 *   · Ukyo no está conectado todavía.
 *   · Los chequeos de formato los hace el código —`ruta.js`, `topes.js`—, no un
 *     modelo. Gratis y determinista.
 *   · El intérprete parece mecánico y no lo es: su trabajo es NEGARSE a
 *     adivinar cuando la orden es ambigua. Una clasificación que se equivoca
 *     hacia «ya entendí» arranca una cadena entera hacia el tema equivocado, y
 *     eso cuesta mucho más que la diferencia de precio del paso.
 *
 * Y hay un costo que no se ve: la caché es por modelo. Un paso barato que
 * necesite el Kit paga su propia escritura de caché y puede salir más caro que
 * dejarlo donde estaba.
 *
 * Cuando Ukyo entre, ese sí baja. El campo está aquí para cambiarlo en una
 * línea cuando llegue el momento.
 */
export const MODELO_CAPAZ = "claude-opus-5";
export const MODELO_BARATO = "claude-sonnet-5";

export const ROLES = {
  gen: {
    id: "gen",
    nombre: "Gen",
    modelo: MODELO_CAPAZ,
    esfuerzo: "high",
    herramientas: [],
  },
  levi: {
    id: "levi",
    nombre: "Levi",
    modelo: MODELO_CAPAZ,
    esfuerzo: "high",
    herramientas: [],
  },
  xeno: {
    id: "xeno",
    nombre: "Xeno",
    modelo: MODELO_CAPAZ,
    esfuerzo: "high",
    herramientas: [],
  },
  compilacion: {
    id: "compilacion",
    nombre: "Compilación",
    /*
     * El paso que más importa, y el único con manos. `xhigh` y no `high`: es
     * donde el razonamiento se paga solo, porque es el que tiene que notar que
     * dos documentos se contradicen antes de que nadie construya nada.
     */
    modelo: MODELO_CAPAZ,
    esfuerzo: "xhigh",
    herramientas: ["leer_archivo", "buscar_en_repo", "calcular"],
  },
};

/*
 * ═══════════ LA INSTRUCCIÓN DE RUTA VA EN EL MENSAJE, NO EN EL SYSTEM ═══════
 *
 * El `system` es lo que se cachea y no cambia. La instrucción de ruta cambia
 * poco, pero si viviera ahí y algún día se ajustara, invalidaría la caché del
 * Kit entero para todos los roles a la vez. Va al final del turno del usuario,
 * que es lo barato de cambiar.
 */
export function instruccionDeRuta(rolId) {
  const otros = Object.values(ROLES)
    .filter((r) => r.id !== rolId)
    .map((r) => `${r.id} (${r.nombre})`)
    .join(", ");

  return [
    "",
    "───────────────────────────────────────",
    "ANTES DE TERMINAR — a quién le toca seguir",
    "───────────────────────────────────────",
    "",
    "Termina tu respuesta con estas dos líneas, exactamente en este formato y",
    "sin nada después:",
    "",
    FORMATO_RUTA,
    "",
    `Puedes mandarlo a: ${otros}.`,
    ...(rolId === PUEDE_ENTREGAR
      ? [
        "",
        "Y a `entregar` cuando el encargo maestro esté terminado. Eso cierra la",
        "corrida y lo que escribiste se guarda como el encargo.",
      ]
      : [
        "También a `compilacion`, cuando el material ya esté listo para",
        "convertirse en un encargo de construcción.",
      ]),
    "",
    "Y a `detener` cuando haga falta una decisión que no te corresponde: un",
    "conflicto entre documentos, un dato que nadie puede verificar, una",
    "aprobación de Mateo. Detener no es fallar — seguir sin esa decisión sí.",
    "",
    ...(rolId === PUEDE_ENTREGAR
      ? [
        "`entregar` y `detener` no son lo mismo. Si el encargo está listo, es",
        "`entregar`; si falta una decisión, es `detener` y el encargo no sale.",
        "",
      ]
      : []),
    "",
    "La decisión de a quién sigue es tuya. El orquestador hace lo que digas y",
    "no interpreta: si estas dos líneas no están, la cadena se para ahí.",
  ].join("\n");
}
