import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ESTADOS DE CALIFICACIÓN DEL REPASO DEL CAPÍTULO 5 (Célula E).
 *
 * Kamogawa: una sola solución para r5-1 a r5-5. Los estados viven en
 * src/components/repasoCap5/comun.jsx con los valores del estándar único de
 * Hacer (PROMPT MAESTRO §4.1 y §4.2), junto con la pastilla, los puntos del
 * final y Veredicto. Estas pruebas fallan:
 *
 *   · si ok o revelada usan teal o ámbar (B4 de enganche.md: en
 *     Contabilidad son DEBE y HABER);
 *   · si un archivo de repasoCap5/ vuelve a definir sus estados.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({ window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node })) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const h = React.createElement;

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const K = await import("../../components/repasoCap5/comun.jsx");
const { VEREDICTO } = await import("../../data/repasoCap5Comun.js");
const { FAE } = await import("../../theme.js");

const montados = [];
afterEach(() => { while (montados.length) montados.pop()(); });
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await React.act(async () => { raiz.render(el); });
  montados.push(() => { React.act(() => raiz.unmount()); caja.remove(); });
  return caja;
};

const TEAL = new RegExp([FAE.teal, "teal", "42,\\s*157,\\s*143"].join("|"), "i");
const AMBAR = new RegExp([FAE.ambar, "ambar", "233,\\s*196,\\s*106"].join("|"), "i");

test("★★★ B4 · los estados comunes son los de §4.1: reposo 1 px, ok y revelada 2 px #F8F9FA, mal 2 px coral; ni teal ni ámbar (valores y fuente)", () => {
  /* Los valores, ya resueltos. */
  assert.deepEqual(K.ESTADOS.reposo, { border: "1px solid rgba(248,249,250,0.35)", background: "transparent" });
  assert.deepEqual(K.ESTADOS.ok, { border: "2px solid #F8F9FA", background: "transparent" });
  /* La revelada ya no es discontinua (§4.2). */
  assert.deepEqual(K.ESTADOS.revelada, { border: "2px solid #F8F9FA", background: "transparent" });
  assert.equal(K.ESTADOS.mal.border, `2px solid ${FAE.coral}`);
  for (const e of ["reposo", "ok", "revelada"]) {
    const v = JSON.stringify(K.ESTADOS[e]);
    assert.ok(!TEAL.test(v) && !AMBAR.test(v) && !/dashed|CBDCF2/i.test(v), `${e}: ${v}`);
  }
  /* La fuente: las líneas, sin nombrar C.teal ni C.ambar. */
  const fuente = leer("src/components/repasoCap5/comun.jsx");
  const bloque = fuente.slice(fuente.indexOf("export const ESTADOS = {"), fuente.indexOf("};", fuente.indexOf("export const ESTADOS = {")));
  const lineas = bloque.split("\n").filter((l) => /^\s*(reposo|ok|revelada):/.test(l));
  assert.equal(lineas.length, 3, "no encontró las líneas que dice mirar");
  for (const l of lineas) assert.ok(!/C\.teal|C\.ambar/.test(l), l.trim());
  assert.equal(FAE.text, "#F8F9FA");
  /* Mueren la marca «ERA ESTE» y los puntos #CBDCF2. */
  assert.equal(K.MARCA_ERA_ESTE, undefined);
  assert.equal(K.PUNTOS, undefined);
});

/* Las piezas del repaso que califican, y lo que no pueden volver a escribir. */
const CARPETA = "src/components/repasoCap5/";
const ARCHIVOS = readdirSync(new URL(CARPETA, RAIZ)).filter((f) => /\.(jsx|js)$/.test(f) && f !== "comun.jsx");
const PROPIOS = [
  [/const\s+ESTADO(S|_PIEZA)?\s*=/, "declara su propio objeto de estados"],
  [/\b(ok|mal|revelada|correcta|incorrecta|bien)\s*:\s*\{[^}\n]*\d(\.\d+)?px (solid|dashed)/, "escribe el borde de un estado"],
  [/calif === "(mal|bien)"[^\n]*\d(\.\d+)?px (solid|dashed)/, "escribe el borde de un estado"],
  [/data-punto[\s\S]{0,200}?(C\.teal|C\.hecho \}|2px solid \$\{C\.coral\})/, "pinta sus propios puntos del final"],
  [/function (Veredicto|MarcaPieza|Punto)\b/, "tiene su propia palabra o su propio punto"],
];

test("★★★ ningún archivo de repasoCap5/ vuelve a definir sus estados: los importa de comun.jsx (guarda: 16 archivos)", () => {
  assert.equal(ARCHIVOS.length, 16, `los archivos cambiaron: ${ARCHIVOS.join(", ")}`);
  const malos = [];
  for (const f of ARCHIVOS) {
    const fuente = leer(CARPETA + f);
    for (const [re, que] of PROPIOS) if (re.test(fuente)) malos.push(`${f}: ${que}`);
  }
  assert.deepEqual(malos, []);
  /* Los que califican piezas usan los de comun.jsx. */
  for (const f of ["ToroNegro.jsx", "Mate.jsx", "OpcionR5.jsx", "Fichas.jsx"]) {
    assert.match(leer(CARPETA + f), /import \{[^}]*\bESTADOS\b[^}]*\} from "\.\/comun\.jsx"/, f);
  }
  /* La palabra: r5-2 con Veredicto; r5-3 con las dos marcas por renglón (MarcaPieza). */
  assert.match(leer(CARPETA + "ToroNegro.jsx"), /import \{[^}]*\bVeredicto\b[^}]*\} from "\.\/comun\.jsx"/, "ToroNegro: Veredicto");
  assert.match(leer(CARPETA + "Mate.jsx"), /import \{[^}]*\bMarcaPieza\b[^}]*\} from "\.\/comun\.jsx"/, "Mate: MarcaPieza");
  for (const f of ["ToroNegro.jsx", "Mate.jsx"]) {
    assert.match(leer(CARPETA + f), /import \{[^}]*\bPunto\b[^}]*\} from "\.\/comun\.jsx"/, `${f}: Punto`);
  }
  /* Los puntos del final de r5-1 también. */
  assert.match(leer("src/components/RepasoCapitulo5View.jsx"), /import \{[^}]*\bPunto\b[^}]*\} from "\.\/repasoCap5\/comun\.jsx"/);
});

test("★★★ Veredicto y MarcaPieza dicen la pastilla de §4.2 debajo de cada pieza calificada, y nada si la pieza no se calificó", async () => {
  const TRES = { ok: "Correcto", mal: "No va aquí", revelada: "Iba aquí" };
  assert.deepEqual(VEREDICTO, { cuenta: TRES, valor: TRES, lado: TRES });
  const caja = await montar(h("div", null,
    h(K.Veredicto, { estado: "ok" }),
    h(K.Veredicto, { estado: "mal" }),
    h(K.Veredicto, { estado: null }),
    h(K.Veredicto, { estado: "revelada" }),
    h(K.Veredicto, { estado: "revelada", valor: "2.300,00" }),
  ));
  /* El error: «No va aquí» a la vista y «Incorrecto.» para el lector. */
  assert.deepEqual([...caja.querySelectorAll("[data-veredicto]")].map((x) => `${x.dataset.veredicto}:${x.textContent}`), [
    "ok:Correcto", "mal:No va aquíIncorrecto.", "revelada:Iba aquí", "revelada:Iba aquí: 2.300,00",
  ]);
  /* Íconos: Check en el acierto, X coral en el error, ninguno en la revelada; 16 px, trazo 2,5. */
  const iconos = [...caja.querySelectorAll("[data-veredicto]")].map((x) => [...x.querySelectorAll("svg")].map((s) => `${s.getAttribute("class").match(/lucide-(check|x)\b/)[1]}:${s.getAttribute("width")}:${s.getAttribute("stroke-width")}:${s.getAttribute("stroke")}`).join());
  assert.deepEqual(iconos, [`check:16:2.5:${FAE.text}`, `x:16:2.5:${FAE.coral}`, "", ""]);
  const mal = caja.querySelector('[data-veredicto="mal"]');
  assert.match(mal.style.color, /^(#EE8266|rgb\(238, 130, 102\))$/i);
  assert.equal(mal.querySelector("[aria-hidden=true]:not(svg)").textContent, "No va aquí");
  /* MarcaPieza: la pastilla de UNA pieza; nada si no se calificó. */
  const marcas = await montar(h("div", null,
    h(K.MarcaPieza, { pieza: "cuenta", estado: "ok" }),
    h(K.MarcaPieza, { pieza: "valor", estado: "mal" }),
    h(K.MarcaPieza, { pieza: "valor", estado: null }),
  ));
  assert.deepEqual([...marcas.querySelectorAll("[data-marca-pieza]")].map((x) => `${x.dataset.marcaPieza}:${x.dataset.veredicto}:${x.textContent}`), [
    "cuenta:ok:Correcto", "valor:mal:No va aquíIncorrecto.",
  ]);
  /* El punto del final: forma (Check o X) además de color, oculto al lector. */
  const puntos = await montar(h("div", null, h(K.Punto, { ok: true }), h(K.Punto, { ok: false })));
  assert.deepEqual([...puntos.querySelectorAll("[data-punto]")].map((x) => `${x.dataset.punto}:${x.getAttribute("class").match(/lucide-(check|x)\b/)[1]}:${x.getAttribute("aria-hidden")}`), ["acierto:check:true", "error:x:true"]);
});
