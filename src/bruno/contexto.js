/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO QUE BRUNO VE (#bruno, orden de Mateo del 30-oct).
 *
 * Dos cosas, sin tocar ninguna pieza una por una:
 *
 *   1. LA PANTALLA: el texto visible de la actividad abierta, leído del DOM en
 *      el momento de preguntar. Vale para las 110 piezas de Hacer y para las
 *      secuencias de Aprender por igual.
 *   2. LOS DATOS DEL ÍTEM: lo que la pieza está preguntando ahora, con su
 *      respuesta. Lo registra `useTanda` (mecanicas/libros/piezas.jsx), que es
 *      el motor de rondas de 132 usos en todo el catálogo: cada vez que cambia
 *      el ítem, queda aquí. Bruno lo recibe marcado como «no revelar».
 *
 * Nada de esto sale del navegador hasta que el estudiante le escribe a Bruno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

let datosActuales = null;
let duenoActual = null;

/** Lo llama useTanda al cambiar de ítem. `dueno` permite soltarlo al desmontar sin borrar el de otro. */
export function registrarDatos(datos, dueno) {
  datosActuales = datos;
  duenoActual = dueno;
}

export function soltarDatos(dueno) {
  if (duenoActual === dueno) { datosActuales = null; duenoActual = null; }
}

/*
 * Un ítem puede traer elementos de React, funciones o referencias circulares.
 * Se pasa a JSON plano, con profundidad acotada y sin nada de eso.
 */
export function aDatosPlanos(valor, profundidad = 0, vistos = new WeakSet()) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "function" || typeof valor === "symbol") return undefined;
  if (typeof valor !== "object") return valor;
  if (profundidad > 5 || vistos.has(valor)) return undefined;
  if (valor.$$typeof) return undefined; /* un elemento de React */
  vistos.add(valor);
  if (Array.isArray(valor)) return valor.slice(0, 30).map((x) => aDatosPlanos(x, profundidad + 1, vistos)).filter((x) => x !== undefined);
  const salida = {};
  for (const [k, v] of Object.entries(valor).slice(0, 40)) {
    if (k.startsWith("_")) continue;
    const plano = aDatosPlanos(v, profundidad + 1, vistos);
    if (plano !== undefined) salida[k] = plano;
  }
  return salida;
}

export const MAX_PANTALLA = 2500;

/** El texto de la actividad abierta: el último panel visible; si no hay, la vista entera. Sin la propia ventana de Bruno. */
export function leerPantalla(raiz = typeof document !== "undefined" ? document : null) {
  if (!raiz) return "";
  const visible = (el) => { const r = el.getBoundingClientRect?.(); return !r || r.width > 0 || r.height > 0; };
  const paneles = [...raiz.querySelectorAll("section")].filter((s) => s.querySelector(":scope > header h3") && !s.closest("[data-bruno]") && visible(s));
  const zona = paneles[paneles.length - 1] ?? raiz.querySelector(".fae-sec-raiz") ?? raiz.querySelector("#root") ?? raiz.body;
  if (!zona) return "";
  const copia = zona.cloneNode(true);
  copia.querySelectorAll?.("[data-bruno], script, style, [aria-hidden='true']").forEach((n) => n.remove());
  const texto = (copia.innerText ?? copia.textContent ?? "").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  return texto.slice(0, MAX_PANTALLA);
}

/** El título de la actividad abierta, para que Bruno sepa dónde está. */
export function leerActividad(raiz = typeof document !== "undefined" ? document : null) {
  const h = raiz?.querySelectorAll?.("section > header h3, .fae-sec-titular");
  return h && h.length ? (h[h.length - 1].textContent ?? "").trim().slice(0, 160) : "";
}

/** Todo junto, listo para mandar. */
export function contextoActual({ materia = "", tema = "" } = {}) {
  let datos = null;
  try { datos = datosActuales ? aDatosPlanos(datosActuales) : null; } catch { datos = null; }
  return { materia, tema, actividad: leerActividad(), pantalla: leerPantalla(), datos };
}
