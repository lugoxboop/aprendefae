import { A4_ID, INICIAL_A4, MOVIMIENTOS_A4, PIEZA_SAN_CALIXTO } from "./contabilidadT7_2_a4.js";
import { calcularCapas, METODOS_CAPAS } from "../contabilidad/t7_2Capas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A4 DE APRENDER — «Las capas que la venta corta» (Patrón de enganche
 * C, pieza 4, v6 de Watari). Ejemplo F-1 del libro, pp. 238-243.
 *
 * Reemplaza a «San Calixto en permanente» con el mismo id y en la misma
 * posición. Cada compra llega como una capa con su propio costo, y cada
 * venta corta capas: PEPS por abajo y UEPS por arriba. Con el promedio del
 * permanente, la compra se funde con lo que hay. Una sola fecha a la vez, con
 * un deslizador de diez paradas.
 *
 * Fuente: orquestador/conocimiento/paquetes/patron-enganche-c-v6.html (la
 * tabla «Pantalla por pantalla» y el código de referencia `a4.js`). Los
 * textos van letra por letra; una prueba los saca del HTML de la v6 y los
 * compara. La v6 ya lleva las 8 correcciones de Mello a la v4 (F1-F4, C1-C4).
 * La que sigue pendiente, A4-N1 (auditoria-mello-a4-v5-y-a3-recomendacion.md,
 * sección 1; confirmada en auditoria-mello-enganche-v6-y-t7-3-aciertos.md),
 * la aplica el componente con `SIGUE_HASTA_EL_28`.
 *
 * Los datos de las capas son los de la pieza de hoy (contabilidadT7_2_a4.js:
 * INICIAL_A4 y MOVIMIENTOS_A4), y la pantalla del cierre es la de esa pieza,
 * entre la pantalla 6 y el resumen (decisión de la v6: «Qué queda igual»),
 * rehecha por C1 (t7-2-a4-el-cierre-c1.md, con PASA de Mello). Por eso son 8
 * pantallas y no las 7 del prototipo.
 *
 * Los totales en pesos no se muestran (decisión de Mello sobre X2): todo va
 * como «unidades × costo unitario», salvo el cálculo del promedio del libro
 * en el acierto de la pantalla 5 (2.887.951, que no está en X2).
 *
 * PENDIENTE DE NEAR. La v6 dice que sus textos son «de muestra»: los que
 * propuso Mello van tal cual y los demás son «[ESCRITO POR CLAUDE —
 * PENDIENTE DE REVISIÓN], sobre la v1 de Near»; los cuatro mensajes de la
 * escalera (`pista`) son de Watari. Cada uno lleva su marca abajo. Near los
 * reescribe dentro de su presupuesto (40 palabras el texto, 15 el mensaje).
 *
 * Pieza de Aprender: cero FP, no entra al catálogo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { A4_ID };

export const TITULO_A4 = "Las capas que la venta corta";

/* Los movimientos, en la forma de la v6: { f, compra: [u, c] } o { f, venta }. */
export const INICIAL_CAPAS = { f: INICIAL_A4.fecha, u: INICIAL_A4[0], c: INICIAL_A4[1] };
export const MOVS_CAPAS = MOVIMIENTOS_A4.map((m) => (m.compra ? { f: m.fecha, compra: [...m.compra] } : { f: m.fecha, venta: m.venta }));

/* Los 30 estados de la pila: 10 fechas × 3 métodos. */
export const ESTADOS_CAPAS = Object.fromEntries(METODOS_CAPAS.map((m) => [m, calcularCapas(INICIAL_CAPAS, MOVS_CAPAS, m)]));

/* La existencia más alta del mes (4 feb): todas las barras usan la misma escala. */
export const ESCALA_CAPAS = 12200;

export const NOMBRE_METODO = { peps: "Método PEPS", ueps: "Método UEPS (no válido bajo NIIF)", promedio: "Método del costo promedio ponderado" };

/* El selector de la figura (pantallas 6 y 8): tres rótulos de una palabra. No califica. */
export const SELECTOR_METODO = { peps: "PEPS", ueps: "UEPS", promedio: "Promedio" };

/* Los ejes de la pila; con el promedio se ocultan. */
export const EJES = { arriba: "Costo más reciente", abajo: "Costo más antiguo" };

/* Los rótulos fijos de la figura y de los mensajes, de la v6. */
export const INTERFAZ_A4 = {
  todo: "Todo",
  salen: "Salen",
  noEsta: "No es esta",
  noEste: "No es este",
  ok: "✓",
  verOtroMetodo: "Ver otro método",
  capasDelInventario: "Capas del inventario",
  fecha: "Fecha",
  seguir: "Seguir",
};

/*
 * A4-N1 de Mello: en el `input` del deslizador, con la pregunta de la
 * pantalla ya resuelta, en las pantallas 3, 4 y 5 el mensaje pasa a este
 * mientras `visto < 9`; después queda vacío. En las pantallas 6 y 8 (la 7 de
 * la v6) queda vacío.
 */
export const SIGUE_HASTA_EL_28 = "Sigue hasta el 28 de febrero.";

/* Cada pantalla de capas: su método y su fecha al llegar (idx), lo que se puede mover (rango), la fecha que espera la respuesta (gate) y cuánto hay que recorrer para seguir (listo: el visto mínimo). */
const PORTADA = {
  id: "portada",
  tipo: "capas",
  /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]» (v6: «texto de muestra», sobre la v1). */
  texto: "Al terminar, verás qué cambia en San Calixto cuando la empresa usa el sistema permanente.",
  metodo: "peps",
  idx: 0,
  boton: "Empezar",
};

const LLEGAN_LAS_CAPAS = {
  id: "llegan-las-capas",
  tipo: "capas",
  /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]» (v6: «texto de muestra»). */
  texto: "San Calixto lleva su inventario con el sistema permanente. Mueve la fecha: cada compra llega como una capa nueva, con su propio costo.",
  metodo: "peps",
  idx: 0,
  rango: [0, 2],
  listo: 2,
};

const PEPS = {
  id: "peps",
  tipo: "capas",
  /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]» (v6: «texto de muestra»; F2 de Mello: «la capa que la venta corta primero»). */
  texto: "PEPS supone que salen primero las unidades más antiguas. El 6 de febrero se venden 4.500. Toca la capa que la venta corta primero.",
  metodo: "peps",
  idx: 2,
  gate: 3,
  tocar: {
    correcta: "1 feb",
    /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]». */
    bien: "✓ Salen 4.500 del 1 de febrero, a $1.300. Sigue hasta el 28.",
    /* De Watari (escalera, C4 de Mello). */
    pista: "Es la del 1 de febrero: PEPS supone que sale primero la más antigua.",
    /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]». */
    mal: { "2 feb": "No es esta: con PEPS sale primero la capa más antigua.", "4 feb": "No es esta: con PEPS sale primero la capa más antigua." },
  },
  listo: 9,
};

const UEPS = {
  id: "ueps",
  tipo: "capas",
  /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]» (v6: «texto de muestra»; F2 de Mello: «la capa que la venta corta primero»). */
  texto: "UEPS supone que salen primero las últimas que entraron. Son las mismas ventas, pero la venta corta otra capa. Toca la capa que la venta del 6 de febrero corta primero.",
  metodo: "ueps",
  idx: 2,
  gate: 3,
  tocar: {
    correcta: "4 feb",
    /* F2 de Mello: «error y acierto nuevos de UEPS, los de Mello». */
    bien: "✓ Primero la del 4; luego 1.500 de la del 2. Sigue hasta el 28.",
    /* De Watari (escalera, C4 de Mello). */
    pista: "Es la del 4 de febrero: UEPS supone que sale primero la última que entró.",
    mal: {
      /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]». */
      "1 feb": "Esa es la de PEPS. Con UEPS sale primero la última que entró.",
      /* F2 de Mello. */
      "2 feb": "Esta se corta después: antes va la del 4 de febrero, más nueva.",
    },
  },
  listo: 9,
};

const PROMEDIO = {
  id: "promedio",
  tipo: "capas",
  /* F3 de Mello: «en el permanente», sin «sale un costo nuevo». */
  texto: "En el permanente, el promedio no tiene capas: cada compra se mezcla con lo que hay. El 12 de febrero llegan 2.500 a $1.350. ¿Qué pasa con el costo?",
  metodo: "promedio",
  idx: 4,
  gate: 5,
  opciones: [{ id: "sube", t: "Sube" }, { id: "baja", t: "Baja" }, { id: "igual", t: "No cambia" }],
  elegir: {
    correcta: "sube",
    /* C2 de Mello: el cálculo del libro (p. 240). */
    /* Con espacios duros (\u00a0) como en la v6, para que el cálculo no se parta. */
    bien: "✓ Sube: (2.887.951\u00a0+\u00a02.500\u00a0×\u00a01.350) ÷\u00a04.700 ≈\u00a0$1.332,54. Sigue hasta el 28.",
    /* De Watari (escalera, C4 de Mello). */
    pista: "Sube: entran unidades más caras que el promedio de ese día.",
    /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]» (sobre las devoluciones de la v1). */
    mal: { baja: "Entran unidades más caras que el promedio: no puede bajar.", igual: "En el permanente, el promedio se calcula otra vez con cada compra." },
  },
  listo: 9,
};

/* C1 de Mello: el selector de método va dentro de la figura y no califica; las opciones de abajo sí (y no repiten el selector, por B5). */
const MISMO_FINAL = {
  id: "mismo-final",
  tipo: "capas",
  /* C1 de Mello: «texto y errores de Mello». */
  texto: "En el periódico, el final se calcula una sola vez, al cierre. Aquí, mueve la fecha y cambia de método. ¿Con cuál queda el mismo final que con el periódico?",
  metodo: "peps",
  idx: 9,
  rango: [0, 9],
  selector: true,
  opciones: [{ id: "peps", t: "Con PEPS" }, { id: "ueps", t: "Con UEPS" }, { id: "promedio", t: "Con el promedio" }],
  elegir: {
    correcta: "peps",
    /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]» (la v6 no lo atribuye a Mello). */
    bien: "✓ Con PEPS quedan 1.100 del 25 de febrero, como en el periódico.",
    /* De Watari (escalera, C4 de Mello). */
    pista: "Es PEPS: quedan las últimas que entraron, sin importar cuándo se vendió.",
    /* C1 de Mello. */
    mal: { ueps: "Con UEPS, el final depende de cuándo se vendió. En el periódico eso no cuenta.", promedio: "Aquí el promedio cambió con cada compra. En el periódico se calcula una vez." },
  },
};

/*
 * La pantalla del cierre, de la pieza de hoy (v6, «Qué queda igual»: no trata
 * de capas), rehecha por C1: ya no es una pregunta de opción con la respuesta
 * en el párrafo de arriba, sino la lista de los cierres del periódico que se
 * tocan (ver contabilidadT7_2_a4.js, P6).
 */
const EL_CIERRE = PIEZA_SAN_CALIXTO.pantallas.find((p) => p.id === "el-cierre");

const RESUMEN = {
  id: "resumen",
  tipo: "capas",
  /* PENDIENTE DE NEAR · la v6 lo marca «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]» (v6: «texto de muestra»; son las dos primeras líneas del resumen de la v1). */
  texto: "Con PEPS, el permanente deja el mismo inventario final que el periódico. Con UEPS y con el promedio cambia, porque importan las fechas de las ventas.",
  metodo: "peps",
  idx: 9,
  rango: [0, 9],
  selector: true,
  boton: "Siguiente pieza",
};

export const PIEZA_LAS_CAPAS = {
  id: A4_ID,
  numero: 4,
  titulo: TITULO_A4,
  pantallas: [PORTADA, LLEGAN_LAS_CAPAS, PEPS, UEPS, PROMEDIO, MISMO_FINAL, EL_CIERRE, RESUMEN],
};
