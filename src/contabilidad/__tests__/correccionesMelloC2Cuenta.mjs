import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 A1 «La cuenta que sí se mueve» · EL PATRÓN DE ENGANCHE C2 DE WATARI,
 * CON LAS CORRECCIONES DE MELLO ENCIMA (Célula C). No es una prueba: lo
 * importa t7-2-la-cuenta-que-si-se-mueve.test.mjs.
 *
 * Fuentes (orquestador/conocimiento/paquetes/), que quedan como llegaron:
 *   · patron-enganche-c2-v1.html   la sección «cuenta» y su código de
 *                                  referencia (CODIGO.cuenta: JS y CSS)
 *   · auditoria-mello-patron-c2.md la sección 2 (T7-2 A1)
 *
 * Este ayudante saca de la C2 el código de referencia y le aplica lo
 * OBLIGATORIO de Mello, tal como lo escribió:
 *   · Cu-1  sus dos líneas de código, literales de la auditoría, en lugar
 *           de las dos de Watari que corrigen
 *   · Cu-2  su renglón inicial, literal, como primer renglón de la cuenta
 *   · Cu-3  el porqué de la pantalla 3 va plegado: sale `porqueALaVista`
 * Cada texto o línea de Mello se comprueba letra por letra en la auditoría,
 * y cada línea de Watari que se cambia tiene que estar una sola vez en su
 * código: si no, el ayudante falla. La prueba ejecuta el código corregido
 * como referencia y compara la pieza de la casa con él, estado por estado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");
const falla = (m) => { throw new Error(m); };
const veces = (t, x) => t.split(x).length - 1;
const unaVez = (t, x, donde) => { const n = veces(t, x); if (n !== 1) falla(`${donde}: «${x}» está ${n} veces`); return x; };

export const C2 = leer("patron-enganche-c2-v1.html");
export const AUDITORIA = leer("auditoria-mello-patron-c2.md");

/* La sección 2 de la auditoría (T7-2 A1) y las condiciones de fusión. */
export const MELLO_A1 = AUDITORIA.slice(
  AUDITORIA.indexOf("## 2. T7-2 A1 «La cuenta que sí se mueve»"),
  AUDITORIA.indexOf("## 3. T7-1 H2"),
);
export const MELLO_FUSION = AUDITORIA.slice(AUDITORIA.indexOf("## Condiciones de fusión"));
if (!MELLO_A1.startsWith("## 2.")) falla("no está la sección 2 de la auditoría");
/* Cada texto de Mello que se use: literal en su sección. */
export const deMello = (t, md = MELLO_A1) => unaVez(md, t, "auditoría de Mello");

/* La sección «cuenta» de la C2 (la tabla «Pantalla por pantalla», los estados y lo medido). */
export const SECCION = C2.slice(C2.indexOf('<section class="sec" id="cuenta">'), C2.indexOf("</section>", C2.indexOf('<section class="sec" id="cuenta">')));

/* El código de referencia que la C2 publica para Misa: CODIGO.cuenta = [JS, CSS + base]. */
const CODIGO = JSON.parse((C2.match(/\nconst CODIGO = (\{.*?\});\n/s) ?? falla("la C2 no trae CODIGO"))[1]);
export const [CUENTA_JS, CUENTA_CSS] = CODIGO.cuenta;

/* ═══════════ LAS CORRECCIONES, LITERALES DE LA AUDITORÍA ═══════════ */

/* Los bloques de código de una corrección: «**Cu-1 · …**» hasta la siguiente. */
const bloque = (id) => {
  const ini = MELLO_A1.indexOf(`**${id} ·`);
  if (ini < 0) falla(`no está ${id}`);
  const fin = MELLO_A1.indexOf("\n**Cu-", ini + 4);
  return MELLO_A1.slice(ini, fin < 0 ? undefined : fin);
};
const codigos = (md) => [...md.matchAll(/```js\n\s*([^\n]+)\n\s*```/g)].map((m) => m[1].trim());

const CU1 = codigos(bloque("Cu-1"));
if (CU1.length !== 2) falla(`Cu-1 trae ${CU1.length} bloques de código`);
/* Cu-1 · 1: la cuenta del costo aparece al acertar, no antes. */
export const CU1_APARECE = CU1[0];
/* Cu-1 · 2: al aparecer, trae ya la venta anterior; solo «Otra venta» es nueva. */
export const CU1_TRAE = CU1[1];

/* Cu-2: el renglón inicial, entre comillas invertidas en la auditoría. */
export const CU2_RENGLON = deMello("{ lado: 'debe', cajas: INICIO, rot: 'Saldo inicial' }");
/* El rótulo nuevo, el único texto de pantalla que pone Mello. [W]: pendiente de que Near lo confirme. */
export const SALDO_INICIAL = (CU2_RENGLON.match(/rot: '([^']+)'/) ?? falla("Cu-2 sin rótulo"))[1];
deMello("con el rótulo [W] para que Near lo confirme");
deMello(`«${SALDO_INICIAL}»`, MELLO_FUSION);
/* Lo que Mello midió con el renglón: el debe suma 9 cajas, el haber 5 y el saldo marca 4. */
export const CU2_CUADRA = { debe: 9, haber: 5, saldo: 4 };
deMello("el debe suma 9 cajas, el haber 5 y el saldo marca 4: cuadra");

/* Cu-3: el porqué de la pantalla 3, plegado; a la vista quedan 49 palabras. */
deMello("El porqué va plegado.");
export const CU3_A_LA_VISTA = Number((deMello("Total a la vista: 22 + 14 + 13 = **49**.").match(/\*\*(\d+)\*\*/))[1]);

/* La prueba de Cu-1 que pide la condición de fusión 1, y la justificación de la mecánica repetida (va en la ficha). */
export const PRUEBA_CU1 = deMello("al final de la pantalla 3, el costo tiene 2 renglones y el haber de Inventario tiene 5", MELLO_FUSION);
export const MECANICA_REPETIDA = deMello("es la pareja de T7-1 A1; aquí el toque mueve el modelo");

/* ═══════════ EL CÓDIGO DE WATARI, CORREGIDO ═══════════ */

/* [lo de Watari, lo de Mello]. Cada línea de Watari tiene que estar una sola vez en su código. */
export const PARCHES = [
  ["Cu-1", "q('[data-t=\"cmv\"]').hidden = !(P.cmv || s.p > 2);", CU1_APARECE],
  ["Cu-1", "s.cmv.push({ cajas: 1, rot: 'Otra venta', nuevo: true });", CU1_TRAE],
  ["Cu-2", "renglones: [],", `renglones: [${CU2_RENGLON}],`],
  ["Cu-3", "{ id: 'el-permanente', porqueALaVista: true, ", "{ id: 'el-permanente', "],
];

/** El código de referencia de la C2 con las correcciones obligatorias de Mello. */
export function referenciaCorregida(js = CUENTA_JS) {
  let out = js;
  for (const [id, viejo, nuevo] of PARCHES) {
    unaVez(out, viejo, `código de Watari (${id})`);
    out = out.replace(viejo, () => nuevo);
  }
  return out;
}

/* Las correcciones opcionales de Mello para A1: ninguna (la sección 2 solo trae obligatorias y la condición de la ficha). */
export const NO_APLICADAS = {};
