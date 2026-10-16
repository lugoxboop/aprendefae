import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · LOS RECORTES DE A1, A2 Y A3 Y LOS PARCHES DE LA ENTREGA 6, CON LAS
 * CORRECCIONES DE MELLO ENCIMA (Célula C). No es una prueba: lo importan.
 *
 * Fuentes (orquestador/conocimiento/paquetes/):
 *   · lote1-entrega2-v1.md   solo la sección de T7-2 A1 (su NIC 2 la
 *                            reemplazó la entrega 4)
 *   · lote1-entrega6-v1.md   las secciones de A2 y A3, la línea 3 del
 *                            resumen de A1 y la tabla «En piezas publicadas
 *                            que no tocan los lotes». A4 no se recorta: la
 *                            renovó el enganche C, y su `el-cierre` lo rehízo
 *                            Near en otra rama
 *   · mello-entregas-4-5-6-v1.md   la auditoría, «Entrega 6 · T7-2»
 *
 * Los paquetes se quedan como llegaron. `seccionT72` lee la sección de una
 * pieza ya corregida: la línea 3 del resumen de A1 (Near, entrega 6) y las
 * correcciones OBLIGATORIAS de Mello (la pista de `la-compra`, los dos
 * errores de `lado-a-lado`). Cada texto nuevo de Mello se comprueba, letra
 * por letra, contra su auditoría; cada texto viejo, contra el paquete (una
 * sola vez). Las opcionales de Mello NO se aplican: `NO_APLICADAS`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const leer = (f) => readFileSync(new URL(`../../../orquestador/conocimiento/paquetes/${f}`, import.meta.url), "utf8");
export const E2 = leer("lote1-entrega2-v1.md");
export const E6 = leer("lote1-entrega6-v1.md");
export const MELLO = leer("mello-entregas-4-5-6-v1.md");
/* La parte de Mello que toca a T7-2 en la entrega 6. */
export const MELLO_E6 = MELLO.slice(MELLO.indexOf("### Entrega 6 · T7-2"));

const falla = (m) => { throw new Error(m); };
const unaVez = (md, t, donde) => { const n = md.split(t).length - 1; if (n !== 1) falla(`${donde}: «${t}» está ${n} veces`); };

/* ═══════════ LO QUE CAMBIA ═══════════ */

/* Entrega 6 de Near: la línea 3 del resumen de A1 (tabla «Campo · Viejo · Nuevo»). */
const FILA_A1 = E6.match(/^\| `t7-2-a1` · resumen, línea 3 \| «(.+?)» \| «(.+?)» \|$/m) ?? falla("no está la fila de t7-2-a1 en la entrega 6");
export const RESUMEN_A1_L3 = { viejo: FILA_A1[1], nuevo: FILA_A1[2] };

/* Mello, «Entrega 6 · T7-2»: [pieza, pantalla, campo, viejo (Near, entrega 6), nuevo (Mello)]. */
export const CORRECCIONES_MELLO_T72 = [
  ["t7-2-a2-la-venta-en-dos-asientos", "la-compra", "pista",
    "Ahora la empresa usa el permanente. Recuerda qué cuenta deja de estar quieta en este sistema.",
    "La mercancía que se compra es un activo. En el permanente se anota apenas entra."],
  ["t7-2-a3-el-kardex", "lado-a-lado", "error · UEPS",
    "Con UEPS cambia, porque importan las fechas.",
    "Aquí, con UEPS, cambia: importan las fechas de las ventas."],
  ["t7-2-a3-el-kardex", "lado-a-lado", "error · promedio",
    "Con el promedio cambia: se calcula otra vez en cada compra.",
    "Aquí, con el promedio, cambia: se calcula otra vez en cada compra."],
];
for (const [, , , , nuevo] of CORRECCIONES_MELLO_T72) if (!MELLO_E6.includes(`«${nuevo}»`)) falla(`no está en la auditoría de Mello: «${nuevo}»`);

/* Las opcionales de Mello en T7-2 (entrega 6): NO se aplican. */
export const NO_APLICADAS = {
  periodicoTrasResponder: "Sería mejor mostrar la fila «con el periódico» después de responder y pedir antes la predicción.",
};
for (const t of Object.values(NO_APLICADAS)) if (!MELLO_E6.includes(t)) falla(`no está en la auditoría de Mello: ${t}`);

/* ═══════════ LAS SECCIONES ═══════════ */

const desde = (md, id) => {
  const i = md.indexOf(`\n## ${id} · «`);
  if (i < 0) falla(`no está la sección de ${id}`);
  const fin = md.indexOf("\n## ", i + 1);
  return md.slice(i + 1, fin < 0 ? undefined : fin);
};

/** La sección de la pieza, tal como llegó (sin correcciones). */
export function seccionCruda(id) {
  return id === "t7-2-a1-la-cuenta-que-si-se-mueve" ? desde(E2, id) : desde(E6, id);
}

/** La sección de la pieza con lo de Near de la entrega 6 y lo de Mello encima. */
export function seccionCorregida(id) {
  let s = seccionCruda(id);
  if (id === "t7-2-a1-la-cuenta-que-si-se-mueve") {
    unaVez(s, `«${RESUMEN_A1_L3.viejo}»`, id);
    s = s.replace(`«${RESUMEN_A1_L3.viejo}»`, `«${RESUMEN_A1_L3.nuevo}»`);
  }
  for (const [pieza, , , viejo, nuevo] of CORRECCIONES_MELLO_T72) {
    if (pieza !== id) continue;
    unaVez(s, `«${viejo}»`, id);
    s = s.replace(`«${viejo}»`, `«${nuevo}»`);
  }
  return s;
}

/** Los textos entre «» de una línea, en orden; las comillas de dentro («Inventarios III») se conservan. */
export function citas(l) {
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const c of l) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  if (nivel !== 0) falla(`las comillas no cierran: ${l}`);
  return out;
}

/**
 * La sección corregida, pantalla por pantalla: líneas (lo que se ve al
 * llegar, en su orden), opciones o líneas, pista (de la pantalla o de cada
 * línea), errores, acierto (con su figura) y «¿Por qué?» plegado.
 */
export function seccionT72(id) {
  const texto = seccionCorregida(id);
  const titulo = citas(texto.split("\n")[0])[0];
  const pantallas = [];
  let p = null;
  for (const l of texto.split("\n")) {
    const cab = l.match(/^\*\*P(\d+) · `([^`]+)`\*\* \(([\w-]+)\)(?: · figura: (.+))?$/);
    if (cab) {
      p = { k: Number(cab[1]), id: cab[2], tipo: cab[3], figura: cab[4] ?? null, lineas: [], opciones: [], pista: null, pistasLinea: {}, errores: [], acierto: null, porque: null };
      pantallas.push(p);
      continue;
    }
    if (!p) continue;
    let m;
    if ((m = l.match(/^- Opciones o líneas: (.+)$/))) p.opciones = citas(m[1]);
    else if ((m = l.match(/^- \*pista(?: · ([^(]+?))? \(1\.er error(?:, las cinco líneas)?\):\* (.+)$/))) {
      if (m[1]) p.pistasLinea[m[1].trim()] = citas(m[2])[0];
      else p.pista = citas(m[2])[0];
    } else if ((m = l.match(/^- \*error · ([^*]+):\* (.+)$/))) p.errores.push({ clave: m[1].trim(), texto: citas(m[2])[0] });
    else if ((m = l.match(/^- \*acierto:\* (.+)$/))) {
      const [t, figura = null] = citas(m[1]);
      p.acierto = { texto: t, figura: /Figura: «/.test(m[1]) ? figura : null };
    } else if ((m = l.match(/^ {2}- ¿Por qué\? \(plegado\): (.+)$/))) p.porque = citas(m[1])[0];
    else if (/^- «/.test(l)) p.lineas.push(citas(l)[0]);
  }
  return { titulo, pantallas };
}

/* La regla de L (plegable.jsx): una condición que limita una regla no se pliega. */
export const CONDICION = /(?<!\p{L})(solo|sólo|directamente|cuando|si)(?!\p{L})/iu;

/* ═══════════ LOS PARCHES A PIEZAS PUBLICADAS (entrega 6, que Mello da por buenos) ═══════════ */

/*
 * La tabla «En piezas publicadas que no tocan los lotes»: [pieza, viejo (lo
 * publicado), nuevo]. El viejo de las líneas de H5 llega abreviado en la
 * tabla («…es un gasto de ventas.»): aquí va entero, como está publicado, y
 * se comprueba que termina como la tabla dice. Cada nuevo está en la tabla.
 * Los pies de T7-3 A3 y la pregunta del 23 % ya están en main.
 */
export const TABLA_PARCHES = E6.slice(E6.indexOf("**En piezas publicadas que no tocan los lotes**"), E6.indexOf("**«Gasto de venta», un solo nombre.**"));
export const PARCHES = {
  h2Monto: { pieza: "t7-2-dos-asientos", viejo: "$5.600.000 la venta, $3.780.000 el costo", nuevo: "$5.600.000 y $3.780.000" },
  h2Costo: { pieza: "t7-2-dos-asientos", viejo: "El costo de la mercancía vendida tiene saldo deudor: va al debe.", nuevo: "Cada venta aumenta lo que costó lo vendido. Un costo que aumenta va al debe." },
  h5Consigna: { pieza: "t7-2-flete-y-devolucion", viejo: "Tienes un solo intento por pregunta.", nuevo: "Para cada hecho, elige la cuenta o calcula lo que se pide. Tienes un solo intento por pregunta." },
  h5Acierto: { pieza: "t7-2-flete-y-devolucion", viejo: "Así es. Cuando el flete lo asume quien vende, es un gasto de ventas.", nuevo: "Así es. Cuando el flete lo asume quien vende, es un gasto de venta.", abreviado: "…es un gasto de ventas." },
  h5Inventario: { pieza: "t7-2-flete-y-devolucion", viejo: "Este flete lo asume quien vende, y la mercancía ya salió. Es un gasto de ventas: va a Gasto de venta – fletes.", nuevo: "Este flete lo asume quien vende, y la mercancía ya salió. Es un gasto de venta: va a Gasto de venta – fletes.", abreviado: "…Es un gasto de ventas: va a Gasto de venta – fletes." },
  h5Costo: { pieza: "t7-2-flete-y-devolucion", viejo: "El costo de la mercancía vendida es lo que costó lo que salió. El flete del envío es un gasto de ventas.", nuevo: "El costo de la mercancía vendida es lo que costó lo que salió. El flete del envío es un gasto de venta.", abreviado: "…El flete del envío es un gasto de ventas." },
  pino: { pieza: "t7-3-ajuste-por-conteo", viejo: "Al cierre, Pino tiene una pérdida real de $185.000 por un faltante.", nuevo: "Al cierre, Pino tiene una pérdida real de $185.000." },
};
for (const [k, x] of Object.entries(PARCHES)) {
  if (!TABLA_PARCHES.includes(`«${x.nuevo}»`)) falla(`${k}: el nuevo no está en la tabla de la entrega 6`);
  if (x.abreviado) {
    if (!TABLA_PARCHES.includes(`«${x.abreviado}»`)) falla(`${k}: el viejo abreviado no está en la tabla`);
    if (!x.viejo.endsWith(x.abreviado.slice(1))) falla(`${k}: el viejo no termina como la tabla`);
  } else if (!TABLA_PARCHES.includes(`«${x.viejo}»`)) falla(`${k}: el viejo no está en la tabla`);
}
/* Y Mello los da por buenos. */
if (!MELLO_E6.includes("**Parches a main:** pasan todos (H2, H5, los pies de T7-3 A3, el caso de Pino y la pregunta del 23 %).")) falla("Mello no aprueba los parches");

/** Un texto de un paquete viejo de una pieza parchada, con el parche encima. */
export const parchado = (t) => Object.values(PARCHES).reduce((s, x) => (s === x.viejo ? x.nuevo : s), t);
