import { readFileSync } from "node:fs";
import { citas } from "./correccionesMelloAciertos.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 A3 «El descuento condicionado» · `cual-le-toca` REHECHA (Célula C).
 *
 * El paquete de Near (t7-3-condicionado-cual-le-toca.md) y la auditoría de
 * Mello (auditoria-mello-t7-3-cual-le-toca.md) quedan como llegaron. Este
 * ayudante lee la tabla «Pantalla» de Near y le aplica lo OBLIGATORIO de
 * Mello, con la decisión de L:
 *
 *   · «Corrección obligatoria» · `sobre-que` se queda sin datos: la figura
 *     de la factura (lista, menos el 5 % comercial, igual al valor a
 *     facturar) y la frase «Con el IVA y la retención, Santa Martha debe
 *     $4.488.750.» van a `sobre-que`, antes de la pregunta. Si con el acierto
 *     pasa de 60 palabras (B2), el asiento se va al resumen (L).
 *   · «Para Misa (menor)» · la figura de antes de responder es
 *     `PLAZOS_A3(false)` tal cual: la fila «Figura» de Near se cambia por lo
 *     que Mello dice que pinta («Venta 25 may» y lo que lleva cada plazo).
 *
 * Cada texto nuevo sale citado de la auditoría y se comprueba, letra por
 * letra, que está ahí: si no, el ayudante falla. Cada fila de Near que se
 * cambia tiene que estar una sola vez en el paquete.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");

export const NEAR_CLT = leer("t7-3-condicionado-cual-le-toca.md");
const AUDITORIA = leer("auditoria-mello-t7-3-cual-le-toca.md");

/* Una sección «## …» de la auditoría, hasta la siguiente (o el final). */
function seccionDe(md, titulo) {
  const ini = md.indexOf(`\n## ${titulo}\n`);
  if (ini < 0) throw new Error(`la auditoría no tiene la sección «${titulo}»`);
  const fin = md.indexOf("\n## ", ini + 1);
  return md.slice(ini, fin < 0 ? undefined : fin);
}
export const MELLO_OBLIGATORIA = seccionDe(AUDITORIA, "Corrección obligatoria");
export const MELLO_PARA_MISA = seccionDe(AUDITORIA, "Para Misa (menor)");
const MELLO = `${MELLO_OBLIGATORIA}\n${MELLO_PARA_MISA}`;

const veces = (md, t) => md.split(t).length - 1;
const enMello = (t) => {
  if (!MELLO.includes(t)) throw new Error(`no está en la auditoría de Mello: ${t}`);
  return t;
};

/* ═══════════ LA TABLA «PANTALLA» DE NEAR ═══════════ */

/** { campo: { texto (la celda), textos (sus «…»), palabras } }, de la primera tabla «| Campo | Texto |». */
function tablaPantalla(md) {
  const filas = md.split("\n").filter((l) => l.startsWith("| "));
  const ini = filas.findIndex((l) => /^\| Campo \| Texto \|/.test(l));
  if (ini < 0) throw new Error("sin tabla «Pantalla»");
  const out = {};
  for (const l of filas.slice(ini + 2)) {
    if (/^\| Campo \|/.test(l)) break;
    const [campo, texto, palabras] = l.replace(/^\| /, "").split(" | ");
    out[campo] = { fila: l, texto, textos: citas(texto), palabras: Number(palabras) };
  }
  return out;
}
export const TABLA_NEAR = tablaPantalla(NEAR_CLT);

/* ═══════════ «PARA MISA» · LA FIGURA ES `PLAZOS_A3(false)` TAL CUAL ═══════════ */

export const FILA_FIGURA_NEAR = "| Figura | La franja de plazos de `condiciones`, **sin el pago marcado**: «15/10 · 5/20 · n/30» sobre «10 · 20 · 30 días» | 6 | no aplica |";
if (veces(NEAR_CLT, FILA_FIGURA_NEAR) !== 1) throw new Error(`no está una sola vez en el paquete de Near: ${FILA_FIGURA_NEAR}`);
if (TABLA_NEAR.Figura.fila !== FILA_FIGURA_NEAR) throw new Error("la fila «Figura» de Near cambió");
/* Lo que, según Mello, pinta `PLAZOS_A3(false)`: la venta y lo que lleva cada plazo. */
const LINEA_PINTA = enMello("Por eso pinta «Venta 25 may» y lo que lleva cada plazo («10 días 15 %», «20 días 5 %», «30 días: sin descuento»).");
export const FIGURA_ANTES = citas(LINEA_PINTA);
enMello("usar `PLAZOS_A3(false)` tal cual");

/* ═══════════ «CORRECCIÓN OBLIGATORIA» · LOS DATOS DE `sobre-que` ═══════════ */

const LINEA_FACTURA = enMello("la factura (precio de lista $4.200.000, menos el 5 % comercial, igual a $3.990.000);");
enMello("**La figura `FACTURA`, antes de la pregunta:** lista, menos el 5 % comercial, igual al valor a facturar.");
const LINEA_FRASE = enMello("**La frase**, corregida para que no quede incompleta: «Con el IVA y la retención, Santa Martha debe $4.488.750.»");
const cifraDe = (t) => Number(t.replace(/[$.]/g, ""));
const [lista, factura] = [...LINEA_FACTURA.matchAll(/\$[\d.]+/g)].map((m) => cifraDe(m[0]));
export const SOBRE_QUE_MELLO = {
  /* La figura: lista, menos el 5 % comercial, igual al valor a facturar. */
  factura: { lista, comercial: Number(LINEA_FACTURA.match(/(\d+) % comercial/)[1]), factura },
  /* La frase, antes de la pregunta. */
  frase: citas(LINEA_FRASE)[0],
};
/* Decisión de L (Mello deja escoger): si `sobre-que` pasa de 60 con el acierto, el asiento va al resumen; la factura nunca sale de la pregunta. */
enMello("Si pasa de 60, el asiento puede ir en la pantalla siguiente o en el resumen, pero la factura no puede salir de la pregunta.");

/* ═══════════ LA PANTALLA CORREGIDA ═══════════ */

const t = TABLA_NEAR;
const opciones = t.Opciones.texto.split(" · ").map((x) => ({ texto: citas(x)[0], correcta: /\(correcta\)/.test(x) }));
if (opciones.filter((o) => o.correcta).length !== 1) throw new Error("las opciones de Near no marcan una correcta");

/** `cual-le-toca`, como la lee la prueba: Near con Mello encima. */
export const CUAL_LE_TOCA = {
  texto: t.Texto.textos[0],
  /* La figura antes de responder (Mello): lo que pinta `PLAZOS_A3(false)`. */
  figura: FIGURA_ANTES,
  pregunta: t.Pregunta.textos[0],
  opciones,
  pista: t["Pista (1.er error)"].textos[0],
  /* El 2.º error de cada opción mala: su devolución propia. */
  errores: Object.entries(t).filter(([c]) => /^2\.º error · /.test(c)).map(([c, f]) => ({ clave: citas(c)[0], texto: f.textos[0] })),
  acierto: t.Acierto.textos[0],
  /* «4 jun» en el día 10: `PLAZOS_A3(true)`. */
  figuraAcierto: t["Figura del acierto"].textos[0],
  /* El pie, de las decisiones de Near. */
  pie: citas(NEAR_CLT.match(/^- \*\*Pie:\*\* (.+)$/m)[1])[0],
};

/* Las palabras de Near (su columna), para la cuenta de B2 del paquete. */
export const palabrasNear = (campos) => campos.reduce((n, c) => n + t[c].palabras, 0);
