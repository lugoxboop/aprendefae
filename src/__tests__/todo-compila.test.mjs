import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TODO ARCHIVO DE src/ COMPILA.
 *
 * Suena a que sobra, porque la compilación ya corre en CI. No sobra, y la
 * razón es de proceso: el repertorio se corre a cada rato y la compilación
 * no, así que un error de sintaxis puede vivir media hora dentro de una rama
 * con todas las pruebas en verde.
 *
 * EL CASO QUE LO MOTIVÓ, tres veces el mismo día y las tres en el mismo
 * archivo: una comilla invertida dentro de una plantilla de CSS. La cierra.
 *
 * Dentro de una plantilla de CSS, una comilla invertida en un comentario
 * —por ejemplo citando una propiedad— cierra la plantilla, y a partir de ahí
 * el archivo se parsea como código. El error que sale no habla de comillas:
 * dice «Expected ";" but found max», veinte líneas más abajo.
 *
 * (Y escribiendo ESTA prueba caí en la hermana del mismo error: puse un
 * comentario de CSS de ejemplo aquí dentro, con su cierre de bloque, y cerró
 * este comentario. El archivo de la prueba que comprueba que todo compila no
 * compilaba. Por eso el ejemplo va en palabras y no en código.)
 *
 * Y las pruebas que vigilan esa misma hoja salieron verdes las tres veces,
 * porque la leen con readFileSync y una expresión regular: para ellas un
 * texto roto es un texto. Una prueba que lee un archivo como texto no lo
 * compila (herramientas.md).
 *
 * Esto compila de verdad, con esbuild, sin ejecutar nada: ni monta
 * componentes ni importa módulos, así que no depende de que un archivo se
 * pueda ejecutar en Node. Tarda un par de segundos para todo src/.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../", import.meta.url).pathname;
const SRC = join(RAIZ, "src");

function archivos(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) { salida.push(...archivos(ruta)); continue; }
    if (/\.(jsx|js|mjs)$/.test(nombre)) salida.push(ruta);
  }
  return salida;
}

test("★★★ todo archivo de src/ compila: una comilla invertida en una plantilla de CSS no pasa", async () => {
  const esbuild = await import("esbuild");
  const lista = archivos(SRC);
  assert.ok(lista.length > 100, `se esperaban cientos de archivos y se encontraron ${lista.length}: la búsqueda está rota, y una búsqueda vacía diría que todo compila`);

  const roturas = [];
  for (const ruta of lista) {
    try {
      await esbuild.transform(readFileSync(ruta, "utf8"), {
        loader: ruta.endsWith(".jsx") ? "jsx" : "js",
        sourcefile: ruta,
      });
    } catch (e) {
      const corto = ruta.slice(RAIZ.length);
      roturas.push(`${corto}: ${(e.errors?.[0]?.text ?? e.message)} (línea ${e.errors?.[0]?.location?.line ?? "?"})`);
    }
  }
  assert.deepEqual(roturas, [], `no compilan:\n  ${roturas.join("\n  ")}`);
});
