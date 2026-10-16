import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CORRECCIONES OBLIGATORIAS DE MELLO A LAS FUSIONES DE NEAR
 * (lote 1, entregas 4 y 5):
 *
 *   · T7-3 «La NIC 2 del libro» (A7 con A8 adentro), lote1-entrega4-v1.md,
 *     sección «## t7-3-nic2-costo · «La NIC 2 del libro»»
 *   · T7-2 «Fletes y devoluciones en permanente» (A5 con A6 adentro),
 *     lote1-entrega5-v1.md, sección «## 1. T7-2 · …»
 *
 * Auditoría: orquestador/conocimiento/paquetes/mello-entregas-4-5-6-v1.md,
 * secciones «Entrega 4» (puntos 1 a 4) y «Entrega 5» › «Fletes y
 * devoluciones en permanente» (puntos 1 y 2). La técnica es la de
 * correccionesMello.mjs (que no se toca): los paquetes de Near se quedan como
 * llegaron y las pruebas los leen a través de `entrega4ConMello()` y
 * `entrega5ConMello()`, que cambian cada texto viejo por el de Mello. Cada
 * texto viejo tiene que estar UNA vez en su paquete, y cada texto nuevo,
 * letra por letra, en su sección de la auditoría.
 *
 * Lo «Opcional» de Mello NO se aplica: la regla de P5 («la misma fórmula
 * para inventarios parecidos») se queda en el plegado, no pasa al resumen.
 * Las correcciones a N3 de T5 (también en la entrega 5) ya están en main con
 * su propio ayudante (correccionesMelloEntregaD.mjs): aquí no entran.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQ = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQ), "utf8");

export const ENTREGA4 = leer("lote1-entrega4-v1.md");
export const ENTREGA5 = leer("lote1-entrega5-v1.md");
export const AUDITORIA_456 = leer("mello-entregas-4-5-6-v1.md");

const entre = (md, desde, hasta) => {
  const i = md.indexOf(desde);
  if (i < 0) throw new Error(`la auditoría no trae «${desde}»`);
  const j = md.indexOf(hasta, i + desde.length);
  return md.slice(i, j < 0 ? undefined : j);
};
/* Las dos secciones de la auditoría que valen aquí. */
export const MELLO_E4 = entre(AUDITORIA_456, "### Entrega 4 · «La NIC 2 del libro»", "\n### Entrega 5");
export const MELLO_E5_FLETES = entre(AUDITORIA_456, "**«Fletes y devoluciones en permanente»**", "**N3 con lo de N2**");

/*
 * Cada corrección: [texto viejo del paquete, texto nuevo, lo que la auditoría
 * trae letra por letra]. Casi siempre el texto nuevo es la cita misma; en el
 * renglón de P2 la auditoría da solo el rótulo, y el paquete lo lleva con su
 * cifra.
 */
export const E4_MELLO = [
  /* Punto 4 · P1: «Una norma de contabilidad para muchos países» no lo dice el libro. */
  ["«La NIC 2 es una norma de contabilidad para muchos países. Habla de los inventarios.»",
    "«Según el libro, la NIC 2 es una norma internacional. Trata de los inventarios.»"],
  /* Punto 1 · P2: el rótulo del renglón lleva la definición completa (C7: la condición no se pliega)… */
  ["«− Lo que cuesta vender $60.000»", "«− Lo que falta para terminarla y venderla $60.000»", "«− Lo que falta para terminarla y venderla»"],
  /* …y el acierto se acorta para no pasar de 60 palabras. */
  ["«Así es: el menor es el valor neto realizable.»", "«Así es: gana el valor neto realizable.»"],
  /* Punto 2 · P4: la condición de la identificación específica, a la vista. */
  ["«Así es: cada anillo lleva su propio costo.»", "«Así es: cada anillo es distinto, así que lleva su propio costo.»"],
  /* Punto 3 · P6: la condición que faltaba del método de los minoristas. */
  ["«Así es: el libro lo pone para tiendas con muchos artículos que se venden rápido.»",
    "«Así es: sirve a tiendas con muchos artículos que se venden rápido y dejan casi la misma ganancia.»"],
];

export const E5_MELLO = [
  /* Punto 1 · P1 y P2: lo que se paga no es $650.000 (el libro retiene el 1 %). */
  ["«Santa Martha usa el permanente. Compra mercancía y paga $650.000 de flete para traerla a su bodega.»",
    "«Santa Martha usa el permanente. Compra mercancía y asume un flete de $650.000 para traerla a su bodega.»"],
  ["«Otro caso: el flete lo asume La Popa, que vende. Lleva la mercancía hasta Santa Martha y paga $650.000.»",
    "«Otro caso: el flete lo asume La Popa, que vende. Lleva la mercancía hasta Santa Martha y el flete vale $650.000.»"],
  /* Punto 2 · el resumen: el primer asiento de la devolución de ventas, a la vista. */
  ["«Si se devuelve una venta, hay un segundo asiento: el costo vuelve al inventario.»",
    "«Si se devuelve una venta, hay dos asientos: uno en Devoluciones de ventas y otro que regresa el costo al inventario.»"],
];

/* La opcional de Mello en la entrega 4: se lista, no se aplica. */
export const OPCIONAL_E4 = MELLO_E4.split("\n").find((l) => l.startsWith("Opcional:"));
if (!OPCIONAL_E4) throw new Error("la auditoría ya no trae la opcional de la entrega 4");

for (const [viejo, nuevo, enAuditoria = nuevo] of E4_MELLO) {
  if (!nuevo.includes(enAuditoria.slice(1, -1))) throw new Error(`la cita no es parte del texto nuevo: ${enAuditoria}`);
  if (!MELLO_E4.includes(enAuditoria)) throw new Error(`no está en la auditoría de Mello (entrega 4): ${enAuditoria}`);
  if (viejo === nuevo) throw new Error(`corrección sin cambio: ${viejo}`);
}
for (const [viejo, nuevo] of E5_MELLO) {
  if (!MELLO_E5_FLETES.includes(nuevo)) throw new Error(`no está en la auditoría de Mello (entrega 5): ${nuevo}`);
  if (viejo === nuevo) throw new Error(`corrección sin cambio: ${viejo}`);
}

const aplicar = (md, pares) => pares.reduce((s, [viejo, nuevo]) => {
  const veces = s.split(viejo).length - 1;
  if (veces !== 1) throw new Error(`el texto viejo está ${veces} veces en el paquete: ${viejo}`);
  return s.replace(viejo, () => nuevo);
}, md);

/** La entrega 4 de Near (la NIC 2 fusionada), con las correcciones obligatorias de Mello encima. */
export const entrega4ConMello = () => aplicar(ENTREGA4, E4_MELLO);
/** La entrega 5 de Near (fletes y devoluciones), con las correcciones obligatorias de Mello encima. */
export const entrega5ConMello = () => aplicar(ENTREGA5, E5_MELLO);

/* ═══════════ LA LECTURA DE LAS SECCIONES DE LAS FUSIONES ═══════════ */

/** Las citas «…» de primer nivel de un texto; una cita puede llevar otra adentro («El libro: «directamente…».»). */
export function citasAnidadas(t) {
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const c of String(t)) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»" && nivel > 0) { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  if (nivel !== 0) throw new Error(`las comillas no cierran: ${t}`);
  return out;
}

/**
 * Una sección de pieza de un paquete de fusión, pantalla por pantalla: sus
 * líneas «…» en el orden en que se ven, sus opciones, su pista (y las de
 * línea, por clave), sus errores por clave, su acierto con la figura que
 * trae y su «¿Por qué?» plegado. `desde` es el encabezado de la sección; la
 * sección termina en el siguiente «## ».
 */
export function seccionFusion(md, desde) {
  const ini = md.indexOf(desde);
  if (ini < 0) throw new Error(`no está la sección «${desde}»`);
  const fin = md.indexOf("\n## ", ini + 1);
  const texto = md.slice(ini, fin < 0 ? undefined : fin);
  const titulo = citasAnidadas(texto.split("\n")[0])[0];
  const pantallas = [];
  let p = null;
  for (const l of texto.split("\n")) {
    const cab = l.match(/^\*\*P(\d+) · `([^`]+)`\*\* \(([\w-]+)\)(?: · figura: (.+))?$/);
    if (cab) {
      p = { k: Number(cab[1]), id: cab[2], tipo: cab[3], figura: cab[4] ?? null, lineas: [], opciones: [], pista: null, pistasDeLinea: {}, errores: [], acierto: null, porque: null };
      pantallas.push(p);
      continue;
    }
    if (!p) continue;
    let m;
    if ((m = l.match(/^- Opciones o líneas: (.+)$/))) p.opciones = citasAnidadas(m[1]);
    else if ((m = l.match(/^- \*pista \(1\.er error\):\* (.+)$/))) p.pista = citasAnidadas(m[1])[0];
    else if ((m = l.match(/^- \*pista · ([^(]+?) \(1\.er error\):\* (.+)$/))) p.pistasDeLinea[m[1]] = citasAnidadas(m[2])[0];
    else if ((m = l.match(/^- \*error · ([^*]+):\* (.+)$/))) p.errores.push({ clave: m[1], texto: citasAnidadas(m[2])[0] });
    else if ((m = l.match(/^- \*acierto:\* (.+)$/))) {
      const [t, figura = null] = citasAnidadas(m[1]);
      p.acierto = { texto: t, figura: /Figura: «/.test(m[1]) ? figura : null };
    } else if ((m = l.match(/^ {2}- ¿Por qué\? \(plegado\): (.+)$/))) p.porque = citasAnidadas(m[1])[0];
    else if (/^- «/.test(l)) p.lineas.push(citasAnidadas(l)[0]);
    else if (l.trim().startsWith("- ")) throw new Error(`línea del paquete que no se sabe leer: ${l}`);
  }
  return { titulo, pantallas };
}
