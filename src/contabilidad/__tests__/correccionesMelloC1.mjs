import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C1 · DOS PANTALLAS DE APRENDER QUE DELATABAN SU RESPUESTA, REHECHAS POR
 * NEAR, CON MELLO ENCIMA (Célula C).
 *
 *   · T7-2 A4 `el-cierre`   paquete t7-2-a4-el-cierre-c1.md
 *   · T7-1 A5 `fob-cif-cyf` paquete barrido-c1-fob-cif-cyf.md, sección 1
 *                           (las secciones 2 y 3, A6 y `la-compra`, no son
 *                           de esta entrega)
 *   · la auditoría: auditoria-mello-el-cierre-y-fob-cif-cyf.md
 *
 * Los paquetes de Near y la auditoría quedan como llegaron. Este ayudante
 * lee las tablas de Near y les aplica lo OBLIGATORIO de Mello:
 *
 *   · `el-cierre` PASA. Lo único que Mello decide es aceptar la línea nueva
 *     del resumen que Near propone («Acéptala»).
 *   · `fob-cif-cyf` PASA CON CORRECCIONES:
 *       F-1  los cinco tramos de Near pasan a cuatro, con dos fichas sobre
 *            «En el mar» («Flete» y «Seguro»); en FOB, las correctas son
 *            Flete, Seguro y Transporte a la bodega
 *       F-2  la tabla del paso 2 de Near se cambia entera por la de Mello
 *            (quién paga el seguro, tres opciones)
 *       F-3  en el paso 2, los tramos de tierra atenuados y sin marca; solo
 *            «En el mar» lleva marcas (no trae texto)
 *
 * Cada texto nuevo sale citado de la auditoría y se comprueba, letra por
 * letra, que está ahí: si no, el ayudante falla. Cada fila de Near que se
 * cambia tiene que estar una sola vez en el paquete.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");

export const NEAR_CIERRE = leer("t7-2-a4-el-cierre-c1.md");
const BARRIDO = leer("barrido-c1-fob-cif-cyf.md");
export const NEAR_FOB = BARRIDO.slice(BARRIDO.indexOf("## 1. T7-1 A5"), BARRIDO.indexOf("\n## 2. "));
export const AUDITORIA = leer("auditoria-mello-el-cierre-y-fob-cif-cyf.md");

/* Las dos secciones de la auditoría. */
const MELLO_CIERRE = AUDITORIA.slice(AUDITORIA.indexOf("## 1. T7-2 A4"), AUDITORIA.indexOf("## 2. T7-1 A5"));
const MELLO_FOB = AUDITORIA.slice(AUDITORIA.indexOf("## 2. T7-1 A5"));
const veces = (md, t) => md.split(t).length - 1;
const en = (md, t, donde) => {
  if (!md.includes(t)) throw new Error(`no está en ${donde}: ${t}`);
  return t;
};

/** Los «…» de primer nivel de un texto (los de dentro, como «libre a bordo», se quedan en su cita). */
export function citas(t) {
  const out = [];
  let nivel = 0, actual = "";
  for (const c of String(t)) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  if (nivel !== 0) throw new Error(`las comillas no cierran: ${t}`);
  return out;
}

/** Las filas de la primera tabla «| Campo | Texto |» que hay después de `marca`: { campo: { fila, textos, palabras } }. */
export function tablaCampos(md, marca = "") {
  const desde = md.indexOf(marca);
  if (desde < 0) throw new Error(`no está «${marca}»`);
  const lineas = md.slice(desde).split("\n");
  const ini = lineas.findIndex((l) => /^\| Campo \| Texto( nuevo)? \|/.test(l));
  if (ini < 0) throw new Error(`sin tabla «Campo | Texto» después de «${marca}»`);
  const out = {};
  for (const l of lineas.slice(ini + 2)) {
    if (!l.startsWith("| ")) break;
    const c = l.slice(2, -2).split(" | ");
    out[c[0]] = { fila: l, textos: citas(c[1]), palabras: c[2] };
  }
  return out;
}

/* ═══════════ T7-2 A4 · `el-cierre` (PASA) ═══════════ */

export const VEREDICTO_CIERRE = en(AUDITORIA, "| T7-2 A4 `el-cierre` | **PASA.** Corrige además una falsedad de lo publicado. |", "la auditoría");
const T_CIERRE = tablaCampos(NEAR_CIERRE, "## Textos");
const uno = (campo) => {
  const f = T_CIERRE[campo];
  if (!f || f.textos.length !== 1) throw new Error(`«${campo}»: se esperaba un texto`);
  return f.textos[0];
};
export const CIERRE = {
  texto: uno("Texto"),
  encabezado: uno("Encabezado de la figura"),
  /* Las cinco del periódico, en el orden de Near. */
  periodico: T_CIERRE["Filas que se tocan (periódico)"].textos,
  pista: uno("Pista (1.er error, si solo le faltó marcar alguna)"),
  retroVentas: uno("Retro propia (1.er error, si marcó «Cerrar Ingresos por ventas»)"),
  retroGastos: uno("Retro propia (1.er error, si marcó «Cerrar Gastos de administración y ventas»)"),
  respuesta: uno("2.º error (la respuesta)"),
  acierto: uno("Acierto"),
  /* «Cerrar Ingresos por ventas» · «Cerrar Costo de mercancía vendida» (nuevo) · «Cerrar Gastos…». */
  permanente: T_CIERRE["Figura final (permanente)"].textos,
  palabras: Object.fromEntries(Object.entries(T_CIERRE).map(([k, v]) => [k, v.palabras])),
};
/* La fila que entra lleva la marca «nuevo», dicha en la figura final y en «Para Misa». */
if (!T_CIERRE["Figura final (permanente)"].fila.includes("«Cerrar Costo de mercancía vendida» (nuevo)")) throw new Error("la figura final de Near no marca «nuevo»");
en(NEAR_CIERRE, "  - **Solución:** `inicial`, `final` y `compras`.", "el paquete de Near");
en(NEAR_CIERRE, "  - **Filas que no sobran:** `ventas` y `gastos`, cada una con su retro.", "el paquete de Near");
en(NEAR_CIERRE, "  - En el acierto o en el segundo error: salen las tres filas que sobran y entra la fila `cmv` con la marca «nuevo».", "el paquete de Near");
export const MARCA_NUEVO = "nuevo";
/* El botón: «Comprobar», en la mecánica de Near. */
export const BOTON_COMPROBAR = citas(en(NEAR_CIERRE, "Él toca los que le sobran a San Calixto en el permanente y luego pulsa «Comprobar».", "el paquete de Near"))[0];
export const PIE_CIERRE = citas(en(NEAR_CIERRE, "- **Pie**, sin cambio: «Basado en el libro, pp. 225 y 243».", "el paquete de Near"))[0];

/* El resumen: la línea de Near que Mello acepta. */
const FILA_RESUMEN = en(NEAR_CIERRE, "| Resumen de la pieza | «El cierre del permanente no lleva los asientos del inventario inicial y final.» | Propongo: «El cierre del permanente no lleva los asientos del inventario ni el de Compras, y cierra Costo de mercancía vendida.» (20 palabras · 68,5; suma 6 palabras al resumen) |", "el paquete de Near");
if (veces(NEAR_CIERRE, FILA_RESUMEN) !== 1) throw new Error("la fila del resumen no está una sola vez");
export const [RESUMEN_VIEJO, RESUMEN_NUEVO] = citas(FILA_RESUMEN);
en(MELLO_CIERRE, "- **La línea nueva del resumen** («…ni el de Compras, y cierra Costo de mercancía vendida.», 20 palabras, 68,5) es exacta. **Acéptala:** la línea de hoy repite la omisión de Compras.", "la auditoría de Mello");
if (!RESUMEN_NUEVO.endsWith("ni el de Compras, y cierra Costo de mercancía vendida.")) throw new Error("la línea que Mello acepta no es la de Near");

/* ═══════════ T7-1 A5 · `fob-cif-cyf` (PASA CON CORRECCIONES) ═══════════ */

export const VEREDICTO_FOB = en(AUDITORIA, "| T7-1 A5 `fob-cif-cyf` | **PASA CON CORRECCIONES.**", "la auditoría");
export const NOMBRE_FOB = citas(en(NEAR_FOB, "## 1. T7-1 A5 · `fob-cif-cyf` → «El viaje de la compra» (rehecha)", "el paquete de Near"))[0];
export const PIE_FOB = citas(en(NEAR_FOB, "**Pie:** «Basado en el libro, p. 228».", "el paquete de Near"))[0];
en(MELLO_FOB, "- **Pie:** «Basado en el libro, p. 228», sin cambio.", "la auditoría de Mello");

/* Los tramos de Near (5) y su leyenda. */
const T_TRAMOS = (() => {
  const desde = NEAR_FOB.indexOf("| Tramo (rótulo) | Palabras |");
  const filas = [];
  for (const l of NEAR_FOB.slice(desde).split("\n").slice(2)) {
    if (!l.startsWith("| ")) break;
    filas.push(l);
  }
  return filas;
})();
const LEYENDA_NEAR = T_TRAMOS.find((l) => l.startsWith("| Leyenda que aparece al resolver:"));
export const TRAMOS_NEAR = T_TRAMOS.filter((l) => l !== LEYENDA_NEAR).map((l) => citas(l)[0]);
if (TRAMOS_NEAR.length !== 5) throw new Error(`Near trae ${TRAMOS_NEAR.length} tramos, no 5`);
export const LEYENDA = citas(LEYENDA_NEAR);

/* F-1 · cuatro tramos, y dos fichas sobre «En el mar». */
const F1 = en(MELLO_FOB, "- **Corrección:** la línea tiene cuatro tramos: «Transporte al puerto» · «Subir al buque» · «En el mar» · «Transporte a la bodega». Sobre «En el mar» van dos fichas, una al lado de la otra: «Flete» y «Seguro».", "la auditoría de Mello");
/* Sus citas: los cuatro tramos, «En el mar» otra vez y las dos fichas. */
const F1_CITAS = citas(F1);
export const TRAMOS = F1_CITAS.slice(0, 4);
if (F1_CITAS[4] !== TRAMOS[2]) throw new Error("F-1 ya no pone las fichas sobre «En el mar»");
export const FICHAS_MAR = F1_CITAS.slice(5);
en(MELLO_FOB, "  - Se tocan las cinco fichas, igual que hoy, y en FOB las correctas siguen siendo Flete, Seguro y Transporte a la bodega.", "la auditoría de Mello");
/* Las dos fichas de Mello reemplazan a «Flete del buque» y «Seguro en el mar» de Near. */
const REEMPLAZO_F1 = { "Flete del buque": "Flete", "Seguro en el mar": "Seguro" };
for (const [viejo, nuevo] of Object.entries(REEMPLAZO_F1)) {
  if (!TRAMOS_NEAR.includes(viejo)) throw new Error(`Near no tiene el tramo «${viejo}»`);
  if (!FICHAS_MAR.includes(nuevo)) throw new Error(`Mello no tiene la ficha «${nuevo}»`);
}
/* Los rótulos que se ven: 15 palabras (Mello: «Los rótulos bajan de 17 a 15 palabras»). */
en(MELLO_FOB, "  - Los rótulos bajan de 17 a 15 palabras.", "la auditoría de Mello");

/* Paso 1 · FOB: la tabla de Near, con las correctas de F-1. */
const T_P1 = tablaCampos(NEAR_FOB, "### Paso 1 · FOB");
export const PASO1 = {
  texto: T_P1.Texto.textos[0],
  correctos: T_P1.Correctos.textos.map((t) => REEMPLAZO_F1[t] ?? t),
  pista: T_P1["Pista (1.er error, si le faltó alguno)"].textos[0],
  /* La retro de Near nombra los dos tramos a los que se aplica. */
  retroDe: citas("Retro (1.er error, si tocó «Transporte al puerto» o «Subir al buque»)"),
  retro: T_P1["Retro (1.er error, si tocó «Transporte al puerto» o «Subir al buque»)"].textos[0],
  respuesta: T_P1["2.º error"].textos[0],
  acierto: T_P1.Acierto.textos[0],
};
if (PASO1.correctos.join(" · ") !== "Flete · Seguro · Transporte a la bodega") throw new Error(`las correctas de FOB con F-1: ${PASO1.correctos}`);
en(NEAR_FOB, "### Paso 1 · FOB (se tocan varios tramos y luego «Comprobar»)", "el paquete de Near");

/* F-2 · el paso 2 de Near sale entero; entra la tabla de Mello. */
const T_P2_NEAR = tablaCampos(NEAR_FOB, "### Paso 2 · C&F");
export const PASO2_NEAR = Object.values(T_P2_NEAR).flatMap((f) => f.textos);
const T_P2 = tablaCampos(MELLO_FOB, "**F-2 · El paso C&F se resuelve emparejando palabras (regla 9).**");
const OPCIONES_F2 = T_P2.Opciones.fila;
export const PASO2 = {
  texto: T_P2.Texto.textos[0],
  opciones: T_P2.Opciones.textos,
  correcta: OPCIONES_F2.match(/«([^»]+)» \(correcta\)/)[1],
  pista: T_P2["Pista (1.er error)"].textos[0],
  retroDe: citas("Retro si elige «Los dos, a medias»")[0],
  retro: T_P2["Retro si elige «Los dos, a medias»"].textos[0],
  respuesta: T_P2["2.º error"].textos[0],
  acierto: T_P2.Acierto.textos[0],
};
for (const t of [PASO2.texto, ...PASO2.opciones, PASO2.pista, PASO2.retro, PASO2.respuesta, PASO2.acierto]) en(MELLO_FOB, t, "la auditoría de Mello");
/* Lo que la figura hace con el acierto (F-2): «Flete» pasa a «Vendedor»; «Seguro» se queda en «Comprador». */
const FIG_F2 = en(MELLO_FOB, "- **La figura del acierto:** la ficha «Flete» pasa a «Vendedor», tal como lo dice el libro, y «Seguro» se queda en «Comprador».", "la auditoría de Mello");
export const CYF = { [citas(FIG_F2)[0]]: citas(FIG_F2)[1], [citas(FIG_F2)[2]]: citas(FIG_F2)[3] };

/* F-3 · sin texto: los tramos de tierra, atenuados y sin marca en el paso 2. */
export const F3 = en(MELLO_FOB, "- **Corrección:** en el paso 2, los tres tramos de tierra quedan atenuados y sin marca, y solo «En el mar» lleva marcas. Sin texto agregado, para no pasar de 60.", "la auditoría de Mello");

/* El botón del paso 1: «Comprobar» (Near, en el título del paso, y Mello, «Para Misa»). */
en(MELLO_FOB, "  - Paso 1: selección múltiple entre las cinco fichas y «Comprobar».", "la auditoría de Mello");
en(MELLO_FOB, "  - Paso 2: tres opciones de texto debajo, con los tramos de tierra atenuados.", "la auditoría de Mello");

/* Las opcionales de Mello: esta auditoría no trae ninguna (solo «Correcciones (obligatorias)»). */
export const OPCIONALES = [...AUDITORIA.matchAll(/^#+ .*[Oo]pcional.*$/gm)].map((m) => m[0]);
