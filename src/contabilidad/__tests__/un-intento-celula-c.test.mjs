import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sinUnSoloIntento } from "../armaLaLinea.js";

/*
 * LOTE 3 · «Tienes un solo intento…» sale de las consignas y pasa a un
 * distintivo junto al contador, en TODO Hacer de la célula (T7 y T5). Un Hacer
 * es el componente que pinta el Encabezado y el contador (Pulsos).
 */

const RAIZ = new URL("../../components/mecanicas/libros/", import.meta.url);
const hacer = ["t7", "t5"].flatMap((d) =>
  readdirSync(new URL(`${d}/`, RAIZ)).filter((f) => f.endsWith(".jsx")).map((f) => `${d}/${f}`))
  .map((ruta) => ({ ruta, src: readFileSync(new URL(ruta, RAIZ), "utf8") }))
  .filter(({ src }) => src.includes("<Encabezado") && src.includes("<Pulsos"));

/* 22 con el motor C4 (t7/decisionC4.jsx), que pinta Encabezado y Pulsos como un Hacer más. */
test("★★★ los Hacer de la célula son los 22 de hoy", () => {
  assert.equal(hacer.length, 22, hacer.map((h) => h.ruta).join(", "));
});

test("★★★ todo Hacer pinta la consigna sin la frase del intento y el contador con su distintivo", () => {
  for (const { ruta, src } of hacer) {
    for (const [, valor] of src.matchAll(/<Encabezado[^>]*\sconsigna=\{([^\n]*?)\}\s+onComoSeJuega/g))
      assert.match(valor, /^sinUnSoloIntento\(/, `${ruta}: consigna={${valor}}`);
    const pulsos = (src.match(/<Pulsos\b/g) ?? []).length;
    /* ContadorPrimerIntento es el de la escalera (EscaleraHacer.jsx): mismo lugar, con el texto «Vale el primer intento» de los datos. */
    const envueltos = (src.match(/<(?:ContadorConIntento|ContadorPrimerIntento\b[^>]*)>\s*<Pulsos\b/g) ?? []).length;
    assert.equal(envueltos, pulsos, `${ruta}: Pulsos sin distintivo`);
  }
});

test("★★★ sinUnSoloIntento quita la frase en todas sus formas y deja lo demás, letra por letra", () => {
  assert.equal(sinUnSoloIntento("Registra cada ajuste. Tienes un solo intento por pregunta."), "Registra cada ajuste.");
  assert.equal(sinUnSoloIntento("Tienes un solo intento por pregunta."), "");
  assert.equal(sinUnSoloIntento("Tienes un solo intento por hecho. Después de responder, verás el porqué."), "Después de responder, verás el porqué.");
  assert.equal(sinUnSoloIntento("Lee. Tienes un solo intento por caso. Después, decide."), "Lee. Después, decide.");
  assert.equal(sinUnSoloIntento("Sin la frase."), "Sin la frase.");
});
