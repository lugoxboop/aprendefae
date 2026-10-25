import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as V from "../volumen.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL VOLUMEN DEL CAMINO DE HACER (#560; forma de Ukyo).
 *
 *   ·  nodo: cara N2 #344968 sobre canto N1 #1D3557 corrido 4 px; hecho, teal
 *      sobre #1D6B61; la cara se hunde al pulsar y el canto no se mueve
 *   ·  líneas: canto corrido 4 px detrás y cara opaca encima
 *   ·  hundido: translateY(4px), 100/160 ms, una curva, solo transform, sin bucle
 *   ·  el canto nunca es borde ni sombra
 *   ·  placa N1 detrás del camino donde la sonda la exige (Estratégico)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");
const camino = leer("../../components/shared/CaminoHacer.jsx");

test("★★★ los valores son los de Ukyo: cara N2, canto N1, teal sobre #1D6B61, 4 px, 100/160 ms", () => {
  assert.deepEqual(V.FAMILIAS, { n2: { cara: "#344968", canto: "#1D3557" }, teal: { cara: "#2A9D8F", canto: "#1D6B61" } });
  assert.equal(V.ELEVACION, 4);
  assert.match(V.CSS_VOLUMEN, /\.fae-vol-svg:active \.fae-vol-cara \{ transform: translateY\(4px\); transition-duration: 100ms; \}/);
  assert.match(V.CSS_VOLUMEN, /\.fae-vol-cara \{ transition: transform 160ms cubic-bezier\(\.3,\.9,\.4,1\); \}/);
  assert.match(V.CSS_VOLUMEN, /prefers-reduced-motion: reduce\) \{ \.fae-vol-cara \{ transition: none; \} \}/);
});

test("★★★ solo transform, nada en bucle, y el canto nunca es borde ni sombra", () => {
  assert.doesNotMatch(V.CSS_VOLUMEN, /animation|infinite|box-shadow|border-bottom/);
  for (const [, propiedad] of V.CSS_VOLUMEN.matchAll(/transition:\s*([a-z-]+)/g)) assert.ok(["transform", "none"].includes(propiedad), propiedad);
});

test("★★★ el nodo: canto hermano detrás, corrido 4 px, y la cara entera en el grupo que se hunde", () => {
  assert.match(camino, /<g\s+className=\{CLASE_SVG\}\s+data-nodo=\{nodo\.id\}/);
  assert.match(camino, /<circle data-canto cx=\{x\} cy=\{y \+ ELEVACION\} r=\{m\.radio\} fill=\{nodo\.completada \? FAMILIAS\.teal\.canto : FAMILIAS\.n2\.canto\}/);
  assert.match(camino, /<g className=\{CLASE_CARA\}>\s*<circle\s+cx=\{x\}\s+cy=\{y\}\s+r=\{m\.radio\}\s+fill=\{nodo\.completada \? FAE\.teal : FAMILIAS\.n2\.cara\}/);
  assert.ok(camino.indexOf("<circle data-canto") < camino.indexOf("<g className={CLASE_CARA}>"), "el canto va antes: detrás");
});

test("★★★ las líneas llevan cuerpo: canto corrido 4 px ANTES y cara opaca después, en las dos formas del camino", () => {
  const cantos = [...camino.matchAll(/<path data-canto-linea [^>]*transform=\{`translate\(0 \$\{ELEVACION\}\)`\}/g)];
  assert.equal(cantos.length, 3, "línea simple, tramo teal y línea por bloques");
  assert.match(camino, /<path d=\{d\} fill="none" stroke=\{FAMILIAS\.n2\.cara\}/);
  assert.match(camino, /<path data-linea d=\{trazo\(puntos\)\} fill="none" stroke=\{FAMILIAS\.n2\.cara\}/);
  assert.doesNotMatch(camino, /stroke="rgba\(248,249,250,0\.22\)"/, "ninguna línea en rgba: la cara es opaca");
});

test("★★ la placa: N1 opaca, silueta y 16 px; la piden las tres vistas de Estratégico y nadie más", () => {
  assert.match(camino, /const PLACA = \{ background: FAMILIAS\.n2\.canto, outline: `1px solid \$\{SILUETA\}`, outlineOffset: "-1px", borderRadius: "16px"/);
  const vistas = ["PensamientoSistemicoView", "PorterView", "IcebergView"];
  for (const v of vistas) assert.match(leer(`../../components/${v}.jsx`), /<CaminoHacer[\s\S]{0,160}?\bplaca\b/, v);
  for (const v of ["PoliticaMonetariaView", "PoliticaFiscalView", "PoliticaEconomicaView", "DemandaAgregadaHacerView", "IntroContabilidadView", "CuentasDebeHaberView"]) {
    assert.doesNotMatch(leer(`../../components/${v}.jsx`), /<CaminoHacer[^>]*\bplaca\b/, v);
  }
});
