import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ Y ❌ VAN SEGUIDOS DE UN ESPACIO, en todos los datos de Contabilidad.
 *
 * Retro (corazon/juego.jsx) separa el emoji con `texto.slice(2)`: da por
 * hecho que después del emoji hay exactamente un espacio. Si alguien escribe
 * «❌No es esa.», Retro se come la «N» sin avisar. Hoy todos los datos lo
 * cumplen (Erwin lo contó en todo src); esta prueba es para que siga así.
 *
 * Recorre TODOS los módulos src/data/contabilidad*.js —sin lista de nombres:
 * un archivo nuevo entra solo— y todo lo que exportan, a cualquier
 * profundidad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CARPETA = new URL("../../data/", import.meta.url);
const ARCHIVOS = readdirSync(CARPETA).filter((f) => /^contabilidad.*\.js$/.test(f)).sort();

function* textos(valor, ruta, vistos = new Set()) {
  if (typeof valor === "string") { yield [ruta, valor]; return; }
  if (!valor || typeof valor !== "object" || vistos.has(valor)) return;
  vistos.add(valor);
  for (const [k, v] of Object.entries(valor)) yield* textos(v, `${ruta}.${k}`, vistos);
}

/* Empieza por ✅ o ❌ y lo que sigue no es exactamente un espacio y algo más. */
export const malEspaciado = (t) => /^(✅|❌)/.test(t) && !/^(✅|❌) \S/.test(t);

test("★★ la regla detecta lo que tiene que detectar", () => {
  assert.equal(malEspaciado("❌No es esa."), true);
  assert.equal(malEspaciado("✅  Dos espacios."), true);
  assert.equal(malEspaciado("✅"), true);
  assert.equal(malEspaciado("✅ Sí."), false);
  assert.equal(malEspaciado("Sin emoji."), false);
});

test("★★★ todo texto de los datos de Contabilidad que empieza por ✅ o ❌ lleva un espacio detrás", async () => {
  assert.ok(ARCHIVOS.length > 20, `solo encontré ${ARCHIVOS.length} archivos de datos: ¿cambió la carpeta?`);
  const malos = [];
  let conEmoji = 0;
  for (const f of ARCHIVOS) {
    const m = await import(new URL(f, CARPETA));
    for (const [ruta, t] of textos(m, f)) {
      if (/^(✅|❌)/.test(t)) conEmoji += 1;
      if (malEspaciado(t)) malos.push(`${ruta}: «${t.slice(0, 30)}»`);
    }
  }
  assert.ok(conEmoji > 100, `solo ${conEmoji} textos con emoji: el recorrido no está mirando los datos`);
  assert.deepEqual(malos, [], `Retro se comería una letra en: ${malos.join(" | ")}`);
});
