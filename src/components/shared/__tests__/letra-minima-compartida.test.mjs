/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LETRA MÍNIMA DE 12 PX EN LO COMPARTIDO.
 *
 * Gemela de la que escribió la Célula C para lo suyo
 * (contabilidad/__tests__/letra-minima-celula-c.test.mjs), y nace de la misma
 * medición: la de C encontró texto a 10 y 11,5 px y dijo, con razón, que casi
 * todo lo que había encontrado NO era suyo. Esto cubre esa otra mitad.
 *
 * La regla está en kit.md: 12 px es el piso de lo que el estudiante LEE para
 * entender. Por debajo no concluye que apuntó mal: concluye que la página no
 * sirve.
 *
 * ═══════════ LA EXCEPCIÓN, Y POR QUÉ VA DECLARADA UNA POR UNA ═══════════
 *
 * Un rótulo de cejilla puede ir por debajo de 12: «RESULTADO» sobre un número
 * de 28 px no es lo que se lee, es la etiqueta de algo que ya se entiende sin
 * ella. La prueba de kit.md para distinguirlos: si al taparlo con el dedo la
 * pantalla sigue diciendo lo mismo, es cejilla; si se pierde algo, es texto.
 *
 * Pero una excepción sin nombre se convierte en un agujero: cualquiera añade
 * un texto pequeño y lo llama cejilla. Así que cada una va escrita aquí con
 * su razón, y añadir una obliga a escribirla. Si alguien mete un tamaño
 * pequeño nuevo sin declararlo, esto se pone rojo.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const RAIZ = new URL("../../../../", import.meta.url);
const leer = (ruta) => readFileSync(new URL(ruta, RAIZ), "utf8");
const enCarpeta = (dir) =>
  readdirSync(new URL(dir, RAIZ))
    .filter((f) => f.endsWith(".jsx"))
    .map((f) => dir + f);

const ARCHIVOS = [
  ...enCarpeta("src/components/shared/"),
  "src/components/mecanicas/libros/piezas.jsx",
  "src/components/mecanicas/corazon/juego.jsx",
];

/* Los mismos patrones que usa la Célula C, a propósito: dos guardias que
   midan distinto acabarían discutiendo entre ellas. */
const PATRONES = [
  /fontSize:\s*"(\d+(?:\.\d+)?)px"/g,
  /font-size:\s*(\d+(?:\.\d+)?)px/g,
  /\bfont:\s*(?:italic\s+)?(?:\d{3}\s+)?(\d+(?:\.\d+)?)px/g,
];

const PISO = 12;

/*
 * Las cejillas declaradas. La clave es el archivo; el valor, cuántas se
 * permiten y por qué. El número importa: si aparece una más, salta.
 */
const CEJILLAS = {
  "src/components/mecanicas/libros/piezas.jsx": {
    cuantas: 1,
    razon: "«EL ASIENTO CORRECTO» y demás rótulos de AsientoEnLineas: etiquetan el asiento que está justo debajo y se entiende sin ellos.",
  },
  "src/components/mecanicas/corazon/juego.jsx": {
    cuantas: 2,
    razon: "«RESULTADO» sobre el número de 28 px del cierre, y el rótulo opcional de la tarjeta de resultado. Los dos etiquetan algo que ya se lee solo.",
  },
};

const tamanosPequenos = (fuente) => {
  const chicos = [];
  for (const patron of PATRONES) {
    for (const m of fuente.matchAll(patron)) {
      const v = Number(m[1]);
      if (v < PISO) chicos.push(v);
    }
  }
  return chicos;
};

test("★★★ ningún texto de lo compartido baja de 12 px, salvo las cejillas declaradas", () => {
  assert.ok(ARCHIVOS.length >= 10, `se leyeron ${ARCHIVOS.length} archivos: la prueba habría pasado mirando casi nada`);
  const reproches = [];
  for (const ruta of ARCHIVOS) {
    const chicos = tamanosPequenos(leer(ruta));
    const permitidas = CEJILLAS[ruta]?.cuantas ?? 0;
    if (chicos.length > permitidas) {
      reproches.push(
        `${ruta}: ${chicos.length} tamaño(s) por debajo de ${PISO} px (${chicos.join(", ")}) y solo ${permitidas} declarada(s) como cejilla.` +
          (permitidas ? ` Declaradas: ${CEJILLAS[ruta].razon}` : ""),
      );
    }
  }
  assert.deepEqual(
    reproches,
    [],
    "\n" +
      reproches.join("\n") +
      "\n\nQué hacer: si es texto que el estudiante lee para entender, súbelo a 12 px." +
      "\nSi de verdad es una cejilla —tápala con el dedo: si la pantalla sigue diciendo lo mismo, lo es—," +
      "\nañádela a CEJILLAS aquí con su razón escrita. No subas el número sin escribir por qué.\n",
  );
});

test("★★ y las cejillas declaradas siguen estando: una declaración que ya no se usa es basura que engaña", () => {
  for (const [ruta, { cuantas }] of Object.entries(CEJILLAS)) {
    const chicos = tamanosPequenos(leer(ruta));
    assert.equal(
      chicos.length,
      cuantas,
      `${ruta} declara ${cuantas} cejilla(s) y tiene ${chicos.length}. Si quitaste una, baja el número; si añadiste una, escribe su razón.`,
    );
  }
});

test("★★★ la prueba mide algo: un tamaño pequeño sin declarar se caza", () => {
  /* Sin esto, los dos de arriba podrían estar pasando sobre un patrón roto. */
  const inventado = 'const x = { fontSize: "9px" };\n.algo { font-size: 8px; }';
  assert.deepEqual(tamanosPequenos(inventado), [9, 8]);
  assert.deepEqual(tamanosPequenos('const x = { fontSize: "13px" };'), []);
});

test("★★ el piso que mide esta prueba es el que dice el canon", () => {
  const kit = leer("orquestador/conocimiento/kit.md");
  assert.ok(kit.length > 5000, "no se leyó el canon: la comprobación habría pasado mirando nada");
  assert.match(kit, /12 px es el piso de lo que el estudiante lee/i);
});
