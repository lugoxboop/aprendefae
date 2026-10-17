import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 A2 «La factura completa» · EL PATRÓN DE ENGANCHE C3 DE WATARI, CON LAS
 * CORRECCIONES DE MELLO ENCIMA (Célula C). No es una prueba: lo importa
 * t7-1-a2-la-factura-completa-c3.test.mjs.
 *
 * Fuentes (orquestador/conocimiento/paquetes/), que quedan como llegaron:
 *   · patron-enganche-c3-v1.html    la sección «a2» y su código de
 *                                   referencia (CODIGO.a2: JS y CSS)
 *   · auditoria-mello-patron-c3.md  §3 (A2-1, A2-2) y §4 (condiciones)
 *
 * Este ayudante saca de la C3 el código de A2 y le aplica lo OBLIGATORIO de
 * Mello, tal como lo escribió:
 *   · A2-1  `conBase` y el rótulo de las tarifas: sus dos líneas de código,
 *           literales de la auditoría. La retención, «Queda debiendo» y la
 *           caja de la Dirección de Impuestos en `$?` mientras !conBase: Mello
 *           lo escribe en prosa (literal abajo) y aquí va en código.
 *   · A2-2  `.a2-tile` con `border: var(--reposo)` (literal). La pieza de la
 *           casa va más allá, como Mello prefiere: usa C3.cruce y `.c3-tile`.
 * Y dos de Misa, marcadas aparte (MISA), que el código de Watari necesita:
 *   · §4 de Mello pide que «en la pantalla 3 […] la retención está en `$?`»;
 *     en el código, ese renglón va apagado («—») hasta el acierto. Se ve.
 *   · La portada, con la mercancía sola (la tabla de estados de la C3:
 *     «Portada: la factura con la barra de la mercancía sola»).
 * Cada texto de Mello se comprueba letra por letra en la auditoría, y cada
 * línea de Watari que se cambia tiene que estar una sola vez en su código: si
 * no, el ayudante falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");
const falla = (m) => { throw new Error(m); };
const veces = (t, x) => t.split(x).length - 1;
const unaVez = (t, x, donde) => { const n = veces(t, x); if (n !== 1) falla(`${donde}: «${x}» está ${n} veces`); return x; };

export const C3 = leer("patron-enganche-c3-v1.html");
export const AUDITORIA = leer("auditoria-mello-patron-c3.md");

/* §3 (correcciones) y §4 (condiciones de fusión) de la auditoría. */
const entre = (md, a, b) => { const i = md.indexOf(a); const j = md.indexOf(b, i + 1); if (i < 0 || j < 0) falla(`no está «${a}»`); return md.slice(i, j); };
export const MELLO_3 = entre(AUDITORIA, "## 3. Correcciones de diseño y código", "## 4. Condiciones de fusión");
export const MELLO_4 = entre(AUDITORIA, "## 4. Condiciones de fusión", "## 5. Para Near");
export const MELLO_A2_1 = entre(MELLO_3, "**A2-1 ·", "**A2-2 ·");
export const MELLO_A2_2 = entre(MELLO_3, "**A2-2 ·", "**A5-1 ·");
export const deMello = (t, md = MELLO_3) => unaVez(md, t, "auditoría de Mello");

/* La sección «a2» de la C3 y su código de referencia: CODIGO.a2 = [JS, CSS]. */
export const SECCION = C3.slice(C3.indexOf('<section class="sec" id="a2">'), C3.indexOf("</section>", C3.indexOf('<section class="sec" id="a2">')));
const CODIGO = JSON.parse((C3.match(/\nconst CODIGO = (\{.*?\});\n/s) ?? falla("la C3 no trae CODIGO"))[1]);
export const [A2_JS, A2_CSS] = CODIGO.a2;

/* ═══════════ LAS CORRECCIONES, LITERALES DE LA AUDITORÍA ═══════════ */

/* A2-1: `conBase` (entre comillas invertidas) y el rótulo (bloque de código). */
export const A2_1_CONBASE = deMello("const conBase = ctx.s.resuelto['base-de-la-retencion'];", MELLO_A2_1);
const bloques = [...MELLO_A2_1.matchAll(/```js\n\s*([^\n]+)\n\s*```/g)].map((m) => m[1].trim());
if (bloques.length !== 1) falla(`A2-1 trae ${bloques.length} bloques de código`);
export const A2_1_ROTULO = bloques[0];
/* La prosa de A2-1 que pide los `$?`, y la que deja igual la pantalla 2. */
export const A2_1_PENDIENTE = deMello("Retención, «Queda debiendo» y la caja de la Dirección de Impuestos: `$?` mientras `!conBase`.", MELLO_A2_1);
export const A2_1_PANTALLA_2 = deMello("El botón y la caída a la Dirección de Impuestos de la pantalla 2 no cambian.", MELLO_A2_1);
/* Lo que el rótulo deja de decir hasta la base, sacado del código de Mello. */
export const SIN_EL_IVA = (A2_1_ROTULO.match(/'(, sobre la mercancía sin el IVA)'/) ?? falla("A2-1 sin el texto condicional"))[1];

/* A2-2: el borde de reposo, y la preferencia de Mello por el cruce del motor. */
export const A2_2_BORDE = deMello("**Corrección:** `border: var(--reposo)`, igual que `.c3-tile`.", MELLO_A2_2);
export const A2_2_CRUCE = deMello("Mejor aún: que A2 use `C3.cruce` y `.c3-tile` como A5 y A6.", MELLO_A2_2);

/* §4: lo que Misa reproduce en la pieza construida. */
export const PRUEBA_A2_1 = deMello("en la pantalla 3 de A2, el rótulo no dice «sin el IVA» y la retención está en `$?`;", MELLO_4);
/* M-1 ya va en el motor; aquí solo su consigna de A2, literal. */
export const M1_CONSIGNA = (deMello("«Cambia entre la compra y la venta y mira los dos impuestos.»").match(/«(.+)»/))[1];

/* ═══════════ EL CÓDIGO DE WATARI, CORREGIDO ═══════════ */

const VIEJO = {
  factura: "function factura(ctx, P) {",
  rotulo: '<p class="a2-tarifa">IVA 16 % y retención 3,5 %, sobre la mercancía sin el IVA. Tarifas del libro, no las de hoy.</p>',
  esc: "const esc = 5800000;",
  ret: "<div class=\"a2-ren${ret ? '' : ' off'}\"><span>− Retención (3,5 %)</span><b class=\"c2-num\">${ret ? '$175.000' : '—'}</b></div>",
  total: "<div class=\"a2-ren total${iva && ret ? '' : ' off'}\"><span>Queda debiendo</span><b class=\"c2-num\">${iva && ret ? '$5.625.000' : '—'}</b></div>",
  dian: "<p class=\"a2-dian${ret ? ' on' : ''}\"><span>Dirección de Impuestos</span><b class=\"c2-num\">${ret ? '$175.000' : ''}</b></p>",
  iva: "const iva = f.iva || P.id !== 'dos-impuestos';",
  tile: ".a2-tile { display: grid; gap: 2px; padding: 8px 10px; border: 2px solid var(--texto);",
};

/* [quién, lo de Watari, lo nuevo]. Cada línea de Watari tiene que estar una sola vez en su código. */
export const PARCHES = [
  ["A2-1", VIEJO.factura, `${VIEJO.factura}\n    ${A2_1_CONBASE}`],
  ["A2-1", VIEJO.rotulo, `<p class="a2-tarifa">\${${A2_1_ROTULO}}</p>`],
  ["MISA §4", VIEJO.esc, `const retVisto = ret || elige; ${VIEJO.esc}`],
  ["A2-1", VIEJO.ret, "<div class=\"a2-ren${retVisto ? '' : ' off'}\"><span>− Retención (3,5 %)</span><b class=\"c2-num\">${retVisto ? (conBase ? '$175.000' : '$?') : '—'}</b></div>"],
  ["A2-1", VIEJO.total, "<div class=\"a2-ren total${iva && retVisto ? '' : ' off'}\"><span>Queda debiendo</span><b class=\"c2-num\">${iva && retVisto ? (conBase ? '$5.625.000' : '$?') : '—'}</b></div>"],
  ["A2-1", VIEJO.dian, "<p class=\"a2-dian${retVisto ? ' on' : ''}\"><span>Dirección de Impuestos</span><b class=\"c2-num\">${retVisto ? (conBase ? '$175.000' : '$?') : ''}</b></p>"],
  ["MISA estados", VIEJO.iva, "const iva = f.iva || !['dos-impuestos', 'portada'].includes(P.id);"],
];
export const PARCHES_CSS = [["A2-2", VIEJO.tile, VIEJO.tile.replace("border: 2px solid var(--texto);", "border: var(--reposo);")]];
deMello("`.a2-tile` lleva `border: 2px solid var(--texto)`.", MELLO_A2_2);

function parchar(codigo, parches) {
  let out = codigo;
  for (const [id, viejo, nuevo] of parches) {
    unaVez(out, viejo, `código de Watari (${id})`);
    out = out.replace(viejo, () => nuevo);
  }
  return out;
}

/** El código de referencia de A2 con las correcciones obligatorias de Mello (y las dos de Misa). */
export const referenciaCorregida = (js = A2_JS) => parchar(js, PARCHES);
export const cssCorregido = (css = A2_CSS) => parchar(css, PARCHES_CSS);

/* Lo opcional de Mello para A2: nada en §3. El §5 es de Near (N-1, N-2, N-3): pendiente. */
export const NO_APLICADAS = {};
