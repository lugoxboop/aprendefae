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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * NI UNA TILDE SUELTA, QUE ES LA MISMA CLASE DE FALLO SIN SER UN CONTROL.
 *
 * Al escribir la expresión regular que quita los acentos de un nombre de
 * cuenta, el rango de marcas combinantes —escrito con los escapes u0300 y
 * u036f— se convirtió en ESOS CARACTERES de verdad dentro del archivo. El
 * código seguía funcionando, porque era un rango literal de esos mismos
 * caracteres, pero en el editor quedaba una tilde pegada a un corchete y otra
 * pegada a un guion: invisibles, imposibles de teclear a mano y a merced de la
 * primera herramienta que normalice el archivo. No son caracteres de control,
 * así que el guardia de arriba no los ve.
 *
 * La regla: una marca combinante tiene que ir sobre una LETRA. Sobre la «o» de
 * «computación» es una palabra en español; sobre un corchete es un accidente.
 *
 * (La expresión de la que salió esto se reescribió con la clase Unicode, que
 * es ASCII puro y no se puede estropear al copiarla.)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * El selector de variación (U+FE00 a U+FE0F) también es una marca combinante,
 * pero es lo que convierte ⚠ o ⚖ en su versión a color. Va detrás de un símbolo
 * a propósito y en todo el sitio: no es un accidente y se deja pasar.
 */
const ES_SELECTOR = (c) => c >= "︀" && c <= "️";

/** Las marcas combinantes que no van sobre una letra, con su línea. */
export function tildesSueltas(ruta) {
  const texto = readFileSync(ruta, "utf8");
  const hallazgos = [];
  let linea = 1;
  let anterior = "";
  /* Por puntos de código, no por unidades: si no, un emoji se parte en dos. */
  for (const c of texto) {
    if (c === "\n") { linea += 1; anterior = c; continue; }
    if (/\p{Mark}/u.test(c) && !ES_SELECTOR(c)) {
      /* Una marca sobre otra marca sigue siendo parte de la misma letra. */
      const sobreLetra = /\p{Letter}|\p{Mark}/u.test(anterior);
      if (!sobreLetra) hallazgos.push({ linea, sobre: JSON.stringify(anterior) });
    }
    anterior = c;
  }
  return hallazgos;
}

test("ninguna marca combinante anda suelta sobre un signo de puntuación", () => {
  const sucios = [];
  for (const ruta of archivos(".")) {
    const hallazgos = tildesSueltas(ruta);
    if (hallazgos.length) {
      const donde = hallazgos.map((h) => `línea ${h.linea}, sobre ${h.sobre}`).join(", ");
      sucios.push(`${ruta.split("\\").join("/")} → ${donde}`);
    }
  }
  assert.deepEqual(sucios, [], `archivos con tildes sueltas:\n  ${sucios.join("\n  ")}`);
});
