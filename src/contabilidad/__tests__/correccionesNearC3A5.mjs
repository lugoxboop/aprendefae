import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 A5 «Importados y fletes» · PATRÓN DE ENGANCHE C3 · LA PIEZA DE WATARI
 * CON LO DE NEAR Y LO DE MELLO ENCIMA (Célula C).
 *
 *   · Watari: patron-enganche-c3-v1.html, el código de A5 (de «/* C3 · T7-1
 *     A5» a su «})();»). Se EJECUTA su arreglo PANTALLAS y su CAPAS: los
 *     textos salen de ahí, no copiados a mano
 *   · Near: c3-rotulos-near.md, «## A5»: los rótulos [W] y el cambio de «en
 *     dólares» por «en moneda extranjera»
 *   · Mello: auditoria-mello-patron-c3.md: A5-1 (el selector) y M-1 (la
 *     consigna aparte de la pregunta)
 *
 * Los paquetes quedan como llegaron. Este ayudante aplica lo de Near y lo
 * OBLIGATORIO de Mello y devuelve la versión corregida. Cada texto nuevo
 * sale citado de su paquete y se comprueba, letra por letra, que está ahí:
 * si no, el ayudante falla. Cada texto de Watari que se cambia tiene que
 * estar en su código.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQUETES), "utf8");
const en = (md, t, donde) => {
  if (!md.includes(t)) throw new Error(`no está en ${donde}: ${t}`);
  return t;
};
const citas = (t) => [...String(t).matchAll(/«([^«»]+)»/g)].map((m) => m[1]);

/* ═══════════ WATARI ═══════════ */

const HTML = leer("patron-enganche-c3-v1.html");
const INI = HTML.indexOf("/* C3 · T7-1 A5 «Importados y fletes»");
const FIN = HTML.indexOf("window.C3A5.PANTALLAS = PANTALLAS;\n})();", INI);
if (INI < 0 || FIN < 0) throw new Error("no está el código de A5 en el patrón C3");
/** El código de A5 de Watari, tal cual. */
export const WATARI_A5 = HTML.slice(INI, FIN + "window.C3A5.PANTALLAS = PANTALLAS;\n})();".length);
/** La sección de A5 (la tabla «Pantalla por pantalla» y los [W]). */
export const SECCION_A5 = HTML.slice(HTML.indexOf('<section class="sec" id="a5">'), HTML.indexOf("</section>", HTML.indexOf('<section class="sec" id="a5">')));

/* Se ejecuta lo que define los textos: las cifras, PANTALLAS y CAPAS. */
const trozo = (desde, hasta) => {
  const i = WATARI_A5.indexOf(desde);
  const j = WATARI_A5.indexOf(hasta, i);
  if (i < 0 || j < 0) throw new Error(`no está «${desde}» en el código de A5`);
  return WATARI_A5.slice(i, j + hasta.length);
};
const DEFINE = [trozo("const FLETE = 650000", ";"), trozo("const PANTALLAS = [", "\n  ];"), trozo("const CAPAS = [", "];")].join("\n");
const { PANTALLAS, CAPAS, FLETE, RET, PAGO } = new Function(`${DEFINE}\nreturn { PANTALLAS, CAPAS, FLETE, RET, PAGO };`)();
/** Las pantallas de Watari, sin tocar. */
export const PANTALLAS_WATARI = PANTALLAS;
export const CIFRAS_WATARI = { flete: FLETE, retencion: RET, pago: PAGO };

/* ═══════════ NEAR · «## A5» de c3-rotulos-near.md ═══════════ */

const NEAR = leer("c3-rotulos-near.md");
export const NEAR_A5 = NEAR.slice(en(NEAR, "## A5 · Importados y fletes", "Near") && NEAR.indexOf("## A5 · Importados y fletes"), NEAR.indexOf("\n## A6"));
const fila = (rotulo) => {
  const l = NEAR_A5.split("\n").find((x) => x.startsWith(`| ${rotulo} | `));
  if (!l) throw new Error(`Near no tiene la fila «${rotulo}»`);
  return citas(l.split(" | ")[1]);
};
const unica = (rotulo) => {
  const c = fila(rotulo);
  if (c.length !== 1) throw new Error(`«${rotulo}»: se esperaba un texto`);
  return c[0];
};
/** Los rótulos [W] de Near, letra por letra. */
export const ROTULOS_NEAR = {
  pasarAPesos: unica("Botón «Pasar a pesos»"),
  hueco: unica("Hueco «¿Qué más?»"),
  cuentasDe: fila("Cuentas"),
  asiento: unica("Asiento"),
  /* Las dos «Línea», en su orden. */
  lineas: NEAR_A5.split("\n").filter((x) => x.startsWith("| Línea | ")).map((x) => citas(x.split(" | ")[1])[0]),
  columnas: fila("Columnas"),
  consigna: unica("Consigna (P7)"),
};
if (ROTULOS_NEAR.lineas.length !== 2) throw new Error("Near trae dos «Línea»");
if (ROTULOS_NEAR.cuentasDe.length !== 2 || ROTULOS_NEAR.columnas.length !== 2) throw new Error("Near: dos cuentas y dos columnas");
/* El cambio de Near fuera de los [W]: «en dólares» → «en moneda extranjera». */
const MONEDA = en(NEAR_A5, "- **Cambio en un texto de Watari que no está marcado [W]:** la capa base dice «en dólares».", "Near");
const PROPUESTA = en(NEAR_A5, "Propongo «en moneda extranjera».", "Near");
export const MONEDA_NEAR = { viejo: citas(MONEDA)[0], nuevo: citas(PROPUESTA)[0] };

/* ═══════════ MELLO · auditoria-mello-patron-c3.md ═══════════ */

export const MELLO = leer("auditoria-mello-patron-c3.md");
export const VEREDICTO_A5 = en(MELLO, "| A5 «Importados y fletes» | **PASA CON CORRECCIONES.**", "Mello");
/* A5-1: se va el rótulo de arriba; el grupo, «Empresa»; los botones, «Santa Martha» y «La Popa». */
const A5_1_ROTULO = en(MELLO, "- Sobre el selector dice «Quién asume el flete», con los botones «El comprador» y «El vendedor».", "Mello");
const A5_1_GRUPO = en(MELLO, "  - Se quita el rótulo `.c3-rotulo` de arriba; el `aria-label` del grupo pasa a «Empresa».", "Mello");
const A5_1_BOTONES = en(MELLO, "  - Los botones pasan a «Santa Martha» y «La Popa».", "Mello");
const A5_1_FICHA = en(MELLO, "la ficha ya dice «La Popa · pagado ese día».", "Mello");
export const A5_1 = {
  rotuloQueSeVa: citas(A5_1_ROTULO)[0],
  botonesViejos: citas(A5_1_ROTULO).slice(1),
  grupo: citas(A5_1_GRUPO)[0],
  botones: citas(A5_1_BOTONES),
  ficha: citas(A5_1_FICHA)[0],
};
/* M-1: la consigna de Watari del lado a lado, la que se ve solo hasta que sale la pregunta. */
const M1 = en(MELLO, "Son «Cambia entre la compra y la venta y mira los dos impuestos.», «Cambia quién asume el flete y mira a dónde va.»", "Mello");
export const CONSIGNA_WATARI = citas(M1)[1];
en(MELLO, "- La pieza separa `consigna` de `texto`, y el motor pinta la consigna mientras `!P.antes(s)`.", "Mello");
/* Condición 1 (en el lado a lado, ningún rótulo dice «asume») y 2 (FOB y C&F dentro del motor). */
export const CONDICION_ASUME = en(MELLO, "   - en el lado a lado de A5, ningún rótulo dice «asume».", "Mello");
export const CONDICION_FOB = en(MELLO, "2. **La pantalla «FOB y C&F» probada dentro del motor** (hoy es un marcador), con mis correcciones F-1 a F-3 ya aplicadas, y el paso de la pantalla 3 a la 5.", "Mello");
/* N-4: la consigna [W] de A5 repite la respuesta. Lo reescribe Near (pendiente). */
export const N4 = en(MELLO, "**N-4 · Las consignas [W] no pueden repetir la respuesta** (regla 9). «Cambia quién asume el flete…» repite la respuesta de A5.", "Mello");
/* Las opcionales de esta auditoría: no trae ninguna. */
export const OPCIONALES = [...MELLO.matchAll(/^#+ .*[Oo]pcional.*$/gm)].map((m) => m[0]);

/* ═══════════ LA VERSIÓN CORREGIDA ═══════════ */

/* Lo que Watari escribe en su código y Near (o Mello) cambia: cada viejo, una vez en el código. */
const CAMBIOS_WATARI = [
  ["<small>en dólares</small>", MONEDA_NEAR.viejo, MONEDA_NEAR.nuevo],
  ["'<li class=\"a5-capa hueco\">¿Qué más?</li>'", "¿Qué más?", ROTULOS_NEAR.hueco],
];
for (const [enCodigo] of CAMBIOS_WATARI) if (WATARI_A5.split(enCodigo).length !== 2) throw new Error(`no está una sola vez en el código de A5: ${enCodigo}`);
/* Los [W] de Watari que Near deja tal cual: están en su código. */
for (const t of [ROTULOS_NEAR.pasarAPesos, ...ROTULOS_NEAR.cuentasDe.map((c) => c.replace(/ (Santa Martha|La Popa)$/, " ")), ROTULOS_NEAR.asiento, ...ROTULOS_NEAR.lineas, ...ROTULOS_NEAR.columnas]) {
  if (!WATARI_A5.includes(t) && !WATARI_A5.includes(t.replace(/ $/, ""))) throw new Error(`el [W] de Near no está en el código de Watari: ${t}`);
}

/** La figura de A5: los textos de Watari con los de Near y A5-1 de Mello. */
export const FIGURA_CORREGIDA = {
  factura: "El valor de la factura del proveedor del exterior",
  facturaMoneda: MONEDA_NEAR.nuevo,
  facturaEnPesos: "El valor de la factura del proveedor del exterior, pasado a pesos",
  facturaTasa: "con la tasa de cambio del día de la compra",
  capas: CAPAS,
  hueco: ROTULOS_NEAR.hueco,
  pasarAPesos: ROTULOS_NEAR.pasarAPesos,
  cuentasDe: { "Santa Martha": ROTULOS_NEAR.cuentasDe[0], "La Popa": ROTULOS_NEAR.cuentasDe[1] },
  asiento: ROTULOS_NEAR.asiento,
  retencion: ROTULOS_NEAR.lineas[0],
  pago: ROTULOS_NEAR.lineas[1],
  empresa: A5_1.grupo,
  empresas: { comprador: A5_1.botones[0], vendedor: A5_1.botones[1] },
  columnas: ROTULOS_NEAR.columnas,
};
/* Lo de Watari que sigue igual: en su código, letra por letra. */
for (const k of ["factura", "facturaEnPesos", "facturaTasa"]) en(WATARI_A5, FIGURA_CORREGIDA[k], "el código de A5");

/**
 * Las pantallas de Watari corregidas, en la forma de los datos (sin funciones):
 *   · la de «FOB y C&F» de Watari es un marcador (`main: true`): va la de hoy
 *   · el lado a lado: M-1 separa la consigna de la pregunta, y la consigna es
 *     la de Near (PENDIENTE de N-4)
 *   · las opciones, con `texto` (Watari las llama `t`)
 */
export function pantallasCorregidas() {
  return PANTALLAS_WATARI.map((p) => {
    const q = Object.fromEntries(Object.entries(p).filter(([, v]) => typeof v !== "function"));
    if (q.opciones) q.opciones = q.opciones.map(({ t, ...o }) => ({ ...o, texto: t }));
    if (p.id === "lado-a-lado") {
      if (!q.texto.startsWith(`${CONSIGNA_WATARI} `)) throw new Error("el texto del lado a lado ya no empieza con la consigna de M-1");
      q.pregunta = q.texto.slice(CONSIGNA_WATARI.length + 1);
      q.consigna = ROTULOS_NEAR.consigna;
      delete q.texto;
    }
    return q;
  });
}
