import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * NI UN CARÁCTER DE CONTROL SUELTO EN EL REPOSITORIO.
 *
 * Esto existe por un fallo que costó varios días de despliegues fantasma.
 *
 * QUÉ PASÓ. Al escribir un paso del workflow a través del shell, la secuencia
 * `\r` de un `tr -d '\r'` se convirtió en un RETORNO DE CARRO LITERAL (0x0D)
 * dentro del archivo. En YAML un CR suelto ES UN SALTO DE LÍNEA, así que el
 * bloque `run: |` se partía por la mitad y lo que seguía caía a la columna 1,
 * fuera del bloque. GitHub Actions rechazaba el archivo entero:
 *
 *     Invalid workflow file: .github/workflows/deploy.yml#L180
 *
 * Y AL RECHAZARLO NO DESPLIEGA NADA. Los commits salían, las pruebas pasaban
 * en verde y el sitio seguía sirviendo una versión de hace días. Ningún error
 * en ningún sitio donde se mirara.
 *
 * POR QUÉ NO BASTA CON «¿PARSEA EL YAML?». Se comprobó con el paquete `yaml`
 * y pasó: esa librería trata el CR suelto como salto de línea, lo normaliza y
 * devuelve EXACTAMENTE la misma estructura que el archivo sano. Medido: mismos
 * 10 pasos, misma sonda, mismas 95 líneas de `run`. La validación daba verde
 * sobre el archivo que GitHub estaba rechazando. Por eso este guardia mira los
 * BYTES y no el árbol.
 *
 * El mismo shell metió un 0x08 dentro de una expresión regular de una prueba
 * el mismo día. Es una clase de fallo, no un accidente: se vigila entera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const EXTENSIONES = /\.(js|jsx|mjs|yml|yaml|sql|json|md|css|html)$/;
const IGNORADOS = /^(node_modules|dist|\.git|coverage)$/;

/** Los bytes permitidos por debajo del espacio: salto de línea y tabulador. */
const PERMITIDOS = new Set([0x0a, 0x09]);

function archivos(dir, acc = []) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORADOS.test(entrada.name)) continue;
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) archivos(ruta, acc);
    else if (EXTENSIONES.test(entrada.name)) acc.push(ruta);
  }
  return acc;
}

/** Los caracteres de control de un archivo, con su línea, para poder arreglarlo. */
export function controlesSueltos(ruta) {
  const bytes = readFileSync(ruta);
  const hallazgos = [];
  let linea = 1;
  for (let i = 0; i < bytes.length; i += 1) {
    const b = bytes[i];
    if (b === 0x0a) { linea += 1; continue; }
    if (PERMITIDOS.has(b)) continue;
    /* Un CRLF completo es un final de línea de Windows, no un CR suelto. */
    if (b === 0x0d && bytes[i + 1] === 0x0a) continue;
    if (b < 0x20 || b === 0x7f) {
      hallazgos.push({ linea, byte: `0x${b.toString(16).padStart(2, "0")}` });
    }
  }
  return hallazgos;
}

test("ningún archivo del repositorio lleva un carácter de control suelto", () => {
  const sucios = [];
  for (const ruta of archivos(".")) {
    const hallazgos = controlesSueltos(ruta);
    if (hallazgos.length) {
      sucios.push(`${ruta.replace(/\\/g, "/")} → ${hallazgos.map((h) => `${h.byte} en la línea ${h.linea}`).join(", ")}`);
    }
  }
  assert.deepEqual(sucios, [], `archivos con bytes de control:\n  ${sucios.join("\n  ")}`);
});

test("los workflows, en particular: es donde un CR suelto no da la cara", () => {
  /*
   * Se mira aparte y con nombre propio porque aquí el fallo es MUDO: en un .js
   * un carácter raro suele reventar en el acto; en un .yml de GitHub, el
   * archivo se rechaza en un sitio donde nadie mira y todo lo demás sigue
   * aparentando normalidad.
   */
  const workflows = archivos(".github/workflows");
  assert.ok(workflows.length >= 2, "no se encontraron los workflows");
  for (const ruta of workflows) {
    assert.deepEqual(controlesSueltos(ruta), [], `${ruta} tiene bytes de control`);
  }
});

test("y el paso que lo provocó sigue pidiendo el escape, no el carácter", () => {
  /*
   * La sonda necesita quitar los retornos de carro de las cabeceras HTTP, así
   * que `tr -d` tiene que seguir ahí — pero escrito con la barra invertida y la
   * erre, dos caracteres, no con el byte.
   */
  const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");
  const usos = deploy.match(/tr -d '[^']*'/g) ?? [];
  assert.ok(usos.length >= 2, "desapareció el tr -d de la sonda");
  for (const uso of usos) {
    assert.equal(uso, "tr -d '\\r'", `${JSON.stringify(uso)} no es el escape de dos caracteres`);
  }
});
