import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ACIERTOS C7 (Célula C): cuatro pantallas de acierto de Aprender con su
 * condición a la vista (C7) y 60 palabras o menos al acertar (B2).
 *
 * Los paquetes de Near quedan como llegaron:
 *   · t7-1-a3-la-recomendacion-c7.md   (T7-1 A3 · `la-recomendacion`)
 *   · t7-3-tres-aciertos-c7.md         (T7-3 · `condiciones`, `no-operacional`
 *                                       y `sobrante`)
 * Este ayudante les aplica las correcciones OBLIGATORIAS de Mello, solo de la
 * sección 2 de cada auditoría (la técnica de `correccionesMello.mjs`):
 *   · auditoria-mello-a4-v5-y-a3-recomendacion.md       A3-1 y A3-2
 *   · auditoria-mello-enganche-v6-y-t7-3-aciertos.md    C-1 y N-1
 * Cada fila vieja tiene que estar, una sola vez, en el paquete de Near, y cada
 * fila nueva, letra por letra, en la sección 2 de la auditoría: si no, falla.
 * Lo de Mello que es «Opcional» u «Observación» NO se aplica.
 *
 * Después lee la tabla «Texto final» de cada pantalla (la primera tabla de
 * su sección) y la devuelve por campo, con sus textos entre «».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");

/* La sección 2 de una auditoría: de «## 2.» hasta la siguiente «## » (o el final). */
function seccion2(md) {
  const ini = md.indexOf("\n## 2. ");
  if (ini < 0) throw new Error("la auditoría no tiene sección 2");
  const fin = md.indexOf("\n## ", ini + 1);
  return md.slice(ini, fin < 0 ? undefined : fin);
}

export const NEAR_A3 = leer("t7-1-a3-la-recomendacion-c7.md");
export const NEAR_T73 = leer("t7-3-tres-aciertos-c7.md");
export const MELLO_A3 = seccion2(leer("auditoria-mello-a4-v5-y-a3-recomendacion.md"));
export const MELLO_T73 = seccion2(leer("auditoria-mello-enganche-v6-y-t7-3-aciertos.md"));

/* ═══════════ A3-1 (y A3-2): fila de Near → filas de Mello ═══════════ */

export const CORRECCIONES_A3 = [
  /* A3-1 · la pregunta pasa a precios que bajan. */
  ["| Pregunta | «Cuando los precios suben, ¿con qué método lo vendido queda más caro?» | 12 | 85,8 |",
    ["| Pregunta | «Si los precios bajan, ¿con qué método lo vendido queda más caro?» | 12 | 91,0 |"]],
  /* A3-1 · las mismas opciones; la correcta, PEPS. */
  ["| Opciones | «PEPS» · «UEPS (no válido bajo NIIF)» · «Promedio ponderado» | 8 | no aplica |",
    ["| Opciones | «PEPS» · «UEPS (no válido bajo NIIF)» · «Promedio ponderado» (correcta: **PEPS**) | 8 | no aplica |"]],
  /* A3-1 (y A3-2: el término «impuesto de renta» con su definición) · el acierto, la pista y los dos errores. */
  ["| Acierto | «Exacto: menos utilidad y menos impuesto sobre ella. Por eso el libro recomienda UEPS en épocas de inflación, cuando los precios suben, y PEPS en épocas de deflación, cuando bajan.» | 30 | 69,3 |",
    [
      "| Acierto | «Exacto: menos utilidad y menos impuesto de renta, que se calcula sobre ella. Por eso el libro recomienda PEPS en deflación, cuando los precios bajan, y UEPS en inflación, cuando suben.» | 31 | 72,8 |",
      "| Pista (1.er error) | «Si los precios bajan, ¿qué método deja en lo que queda los precios más bajos? Los $950.000 no cambian.» | 19 | 99,0 |",
      "| Si elige UEPS | «Con UEPS, lo vendido lleva los precios más recientes, que ahora son los más bajos.» | 15 | 92,2 |",
      "| Si elige Promedio | «El promedio queda en medio. Busca el método que le deja a lo vendido los precios más altos.» | 18 | 94,0 |",
    ]],
];

/* A3-2 · Mello acepta el cambio de Near en la tarjeta UEPS de `a-favor-y-en-contra`. */
export const TARJETA_UEPS_A3_2 = "Si los precios suben, lo vendido sale más caro y el impuesto sobre la utilidad baja.";

/* ═══════════ C-1 y N-1 ═══════════ */

export const CORRECCIONES_T73 = [
  /* C-1 · `condiciones`: «5 %» pasa a «30 %», con su retro y la nueva de «15 %». */
  ["| Opciones | «15 %» · «5 %» · «Ninguno» | 5 | no aplica |",
    [
      "| Opciones | «15 %» · «30 %» · «Ninguno» (correcta: Ninguno) | 5 | no aplica |",
      "| Si elige 30 % | «En n/30, el 30 son los días. No trae ningún porcentaje.» | 11 | 86,6 |",
      "| Si elige 15 % | «A los treinta días ya pasó el plazo del 15 %.» | 11 | 97,2 |",
    ]],
  /* N-1 · `no-operacional`: el acierto lleva la condición del saldo, sin «Así es.». */
  ["| Acierto | «Así es. En Santa Martha es ingreso no operacional. Si usaran el permanente, San Calixto haría otro asiento: el del costo. Y Santa Martha usaría Inventario de mercancías, no Compras.» | 30 | 66,4 |",
    ["| Acierto | «En Santa Martha, con saldo en el haber, es ingreso no operacional. Con el permanente, San Calixto anota también el costo. Santa Martha usa Inventario de mercancías, no Compras.» | 29 | 72,6 |"]],
];

const veces = (md, t) => md.split(t).length - 1;
function aplicar(near, mello, correcciones) {
  let md = near;
  for (const [vieja, nuevas] of correcciones) {
    if (veces(near, vieja) !== 1) throw new Error(`no está una sola vez en el paquete de Near: ${vieja}`);
    for (const n of nuevas) if (!mello.includes(n)) throw new Error(`no está en la auditoría de Mello: ${n}`);
    md = md.split(vieja).join(nuevas.join("\n"));
  }
  return md;
}
if (!MELLO_A3.includes(`«${TARJETA_UEPS_A3_2}»`)) throw new Error(`no está en la auditoría de Mello: ${TARJETA_UEPS_A3_2}`);
if (!NEAR_A3.includes(`«${TARJETA_UEPS_A3_2}»`)) throw new Error(`no está en el paquete de Near: ${TARJETA_UEPS_A3_2}`);

export const A3_CORREGIDO = aplicar(NEAR_A3, MELLO_A3, CORRECCIONES_A3);
export const T73_CORREGIDO = aplicar(NEAR_T73, MELLO_T73, CORRECCIONES_T73);

/* ═══════════ LA TABLA «TEXTO FINAL» ═══════════ */

export const citas = (t) => [...String(t).matchAll(/«([^»]+)»/g)].map((m) => m[1]);

/** La primera tabla de un trozo de paquete: { campo: { textos, correcta, palabras } }. */
export function tablaFinal(md) {
  const filas = md.split("\n").filter((l) => l.startsWith("| "));
  const ini = filas.findIndex((l) => /^\| Campo \| Texto/.test(l));
  if (ini < 0) throw new Error("sin tabla «Texto final»");
  const out = {};
  for (const l of filas.slice(ini + 2)) {
    if (/^\| Campo \|/.test(l) || /^\| ---/.test(l)) break;
    const [campo, texto, palabras] = l.split(" | ").map((x) => x.replace(/^\| /, ""));
    out[campo] = { textos: citas(texto), correcta: texto.match(/\(correcta: (?:\*\*)?([^)*]+)(?:\*\*)?\)/)?.[1] ?? null, palabras: Number(palabras) };
  }
  return out;
}

/** La sección de una pantalla del paquete de T7-3: «## n. «…» · `id`: …». */
function seccionT73(md, id) {
  const ini = md.search(new RegExp(`\\n## \\d\\. «[^»]+» · \`${id}\``));
  if (ini < 0) throw new Error(`no está la sección de ${id}`);
  const fin = md.indexOf("\n## ", ini + 1);
  return md.slice(ini, fin < 0 ? undefined : fin);
}

/* `la-recomendacion`, con A3-1 y A3-2. */
export const RECOMENDACION = tablaFinal(A3_CORREGIDO);
/* Las tres de T7-3, con C-1 y N-1. `sobrante` pasa tal cual Near. */
export const CONDICIONES = tablaFinal(seccionT73(T73_CORREGIDO, "condiciones"));
export const NO_OPERACIONAL = tablaFinal(seccionT73(T73_CORREGIDO, "no-operacional"));
export const SOBRANTE = tablaFinal(seccionT73(T73_CORREGIDO, "sobrante"));

/* Lo que NO se aplica (se comprueba que sigue en la auditoría, y nada más). */
export const NO_APLICADAS = {
  a3Opcional: "Según el libro, cada empresa escoge el método que más le sirva",
  t73Observacion: "**Observación (fuera de este encargo, ya estaba en main):**",
  t73Opcional: "Quitar «Baja el costo de la mercancía vendida»",
};
if (!MELLO_A3.includes(NO_APLICADAS.a3Opcional)) throw new Error("la opcional de A3 ya no está en la auditoría");
if (!MELLO_T73.includes(NO_APLICADAS.t73Observacion) || !MELLO_T73.includes(NO_APLICADAS.t73Opcional)) throw new Error("la observación o la opcional de T7-3 ya no están en la auditoría");

/* ═══════════ PARA LAS PRUEBAS ═══════════ */

/* Los campos de la tabla que se ven al llegar, en su orden (lo demás es opción, retro o acierto). */
const AL_LLEGAR = /^(Texto|Definición|Pantalla, línea 1|Rótulos? de .+|Pregunta)$/;
const AL_ACERTAR = /^(Texto|Definición|Pantalla, línea 1|Rótulos? de .+|Pregunta|Opciones|Acierto|Figura del acierto)$/;

/** Las palabras visibles al acertar, con el contador de Near (la columna «Palabras»). */
export const palabrasAlAcertar = (tabla) => Object.entries(tabla).filter(([c]) => AL_ACERTAR.test(c)).reduce((n, [, f]) => n + f.palabras, 0);

/**
 * Pone una pantalla del recorte de T7-3 (la que lee `seccion` de
 * t7-3-recorte.mjs) al día con su tabla final: líneas al llegar, opciones,
 * errores que la tabla trae («Si elige …»), acierto, figura del acierto y
 * pista (si la trae). Sin «¿Por qué?»: no queda plegado (C7). Lo que la
 * tabla no trae (pista, errores) se queda como en el recorte.
 */
export function aplicarAlRecorte(s, tabla) {
  s.lineas = Object.entries(tabla).filter(([c]) => AL_LLEGAR.test(c)).flatMap(([c, f]) => (/^Rótulos de/.test(c) ? f.textos : [f.textos.join(" · ")]));
  s.opciones = tabla.Opciones.textos;
  const errores = Object.entries(tabla).filter(([c]) => /^Si elige /.test(c)).map(([c, f]) => ({ clave: c.replace(/^Si elige /, ""), texto: f.textos[0] }));
  if (errores.length) s.errores = errores;
  if (tabla["Pista (1.er error)"]) s.pista = tabla["Pista (1.er error)"].textos[0];
  const figura = tabla["Figura del acierto"]?.textos.map((t) => t.replace(/ · /g, " ")).join(" ") ?? null;
  s.acierto = { texto: tabla.Acierto.textos[0], figura };
  s.porque = null;
  return s;
}
