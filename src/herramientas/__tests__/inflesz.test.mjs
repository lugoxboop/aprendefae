import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { inflesz, silabasDePalabra, palabrasDe, frasesDe, letrasDesconocidas, UMBRAL, PALABRAS_MINIMAS } from "../inflesz.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CALCULADORA DE INFLESZ.
 *
 * Lo que importa no es que calcule: es que dé los MISMOS números que ya se
 * aprobaron. La tabla de referencia de abajo son textos con su INFLESZ medido
 * y aprobado por Levi o por Gen; la calculadora tiene que dar cada uno exacto,
 * con un decimal. Y cada regla tiene su prueba de que puede fallar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Act. 3 de Contabilidad, paquete aprobado por Levi el 2026-10-13. */
const ACT3 = [
  ["San Calixto usó cinco días una máquina de San Miguel, alquilada a $500 diarios. Son $2.500 y todavía no los ha pagado.", 71.2],
  ["San Calixto le pagó a Arriendos de la Costa tres meses de local por anticipado. Al cerrar junio ya usó un mes: $5.000.", 87.0],
  ["La Gata Caliente tomó en alquiler unos equipos de Home Mark y los usó quince días a $120.000 diarios. Son $1.800.000 y todavía no los ha pagado.", 78.0],
  ["La empresa cliente le pagó por anticipado un servicio a Servicios del Caribe. Al cerrar marzo ya se prestaron $120.000 de ese servicio.", 70.7],
  ["Lee el hecho. Arma el asiento de las dos empresas.", 95.9],
  ["Revisa que los dos asientos no sean una copia: cada empresa anota su propia cara del hecho.", 72.6],
  ["La panadería le debe al Banco Andino $50.000 de intereses del mes y todavía no los paga.", 65.2],
  ["El hecho es uno solo y los dos libros lo anotan al revés. La panadería tiene un gasto y una deuda. El Banco Andino tiene algo por cobrar y un ingreso.", 88.0],
  ["Ejemplo: en el libro de la panadería va Gasto interés en el debe e Intereses por pagar en el haber. En el del Banco Andino, Intereses por cobrar en el debe e Ingresos por intereses en el haber.", 76.4],
  ["Dos libros abiertos, uno por empresa. Cada uno tiene dos casillas vacías, una en el Debe y otra en el Haber. Al tocar una casilla se abren cinco cuentas para elegir.", 79.9],
  ["Los dos asientos quedaron iguales. Un hecho tiene dos caras, y la de una empresa nunca es la copia de la otra.", 91.1],
  ["Esa cuenta no se mueve. Aquí nadie ha pagado ni cobrado todavía, y por eso es un acumulado.", 73.2],
  ["Esa cuenta no se mueve en este hecho. Pertenece al otro tipo de ajuste, no a este.", 88.4],
  ["Una de las dos tiene los lados cambiados. El asiento cuadra, pero esa empresa está anotando al revés.", 76.7],
  ["Revisa los dos asientos juntos. Si San Calixto tiene un gasto, San Miguel no puede tener otro gasto: lo que para uno es gasto, para el otro es ingreso.", 84.9],
  ["Revisa los dos asientos juntos. Uno pagó por anticipado y el otro cobró por anticipado, así que sus cuentas no pueden ser las mismas.", 78.0],
  ["Revisa los dos asientos juntos. La Gata Caliente recibió los equipos y Home Mark los entregó, así que sus asientos son espejo, no copia.", 78.0],
  ["Revisa los dos asientos juntos. Quien recibió el pago por anticipado debía un servicio; quien pagó tenía un derecho. No pueden coincidir.", 69.2],
  ["Las dos anotan los mismos $2.500 y ninguna cuenta se repite. San Calixto usó la máquina y le debe; San Miguel se la alquiló y le deben.", 84.9],
  ["Mismo arriendo, dos lecturas. Para San Calixto, lo que ya pagó se va volviendo gasto; para Arriendos de la Costa, lo que ya cobró se va volviendo ingreso.", 83.8],
  ["Quince días a $120.000 para las dos. La Gata Caliente usó los equipos y aún no paga; Home Mark se los alquiló y aún no cobra.", 88.4],
  ["Los mismos $120.000 del servicio. Servicios del Caribe ya cumplió una parte de lo que le pagaron; la empresa cliente ya consumió una parte de lo que pagó.", 81.6],
  ["Ejemplo: el libro de la izquierda queda con el gasto en el debe y la deuda en el haber. El de la derecha, con lo que le deben en el debe y el ingreso en el haber.", 97.4],
  ["Cuatro hechos y ocho asientos. En ninguno los dos libros dicen lo mismo, porque un hecho siempre tiene dos caras.", 87.8],
];

/* Política Monetaria: los textos que Gen y Levi entregaron con su INFLESZ (sin «Ḡ»). */
const MACRO = [
  ["Se llega a una arteria cuando alguien cambia cuánto gasta.", 78.5],
  ["Ahí alguien sí cambió cuánto gasta. Mira en cuál de las cuatro arterias.", 94.9],
  ["Todavía no. Ahí cambió un precio, pero nadie ha cambiado cuánto gasta.", 76.2],
  ["Esa no es. La tasa de interés (i) entra por la válvula de elasticidad (b), y esa válvula está en la arteria de la inversión.", 84.7],
  ["Esa no es. El canal cambiario mueve el tipo de cambio (tc), y el tc es el vaso de las exportaciones netas.", 96.7],
  ["La tasa no reparte parejo. Entra directo por la inversión, llega al consumo y a las exportaciones netas por otros caminos, y en el modelo al gasto público no lo toca.", 74.8],
  ["Las dos políticas desembocan en la misma cámara. Aquí ves por dónde entra cada una y si empujan igual.", 76.0],
  ["Al subir la tasa de intervención sube la i del modelo, y la i entra por la válvula b, en la arteria de la inversión.", 82.2],
  ["Esa decisión toca los impuestos (T), que drenan antes de la renta disponible y por ahí llegan al consumo.", 73.1],
  ["Esa decisión toca las transferencias (TR), que suman a la renta disponible junto con la renta Y.", 76.2],
  ["Mira la dirección de cada flecha, no su tamaño. Dos flechas hacia el mismo lado se refuerzan.", 88.4],
  ["El modelo no dice cuál de las dos pesa más. Cuando van en contra, el resultado queda abierto.", 94.0],
  ["Esa no es. Con el crédito más caro, son las familias las que tienen menos con qué consumir. Eso llega al consumo (C).", 98.9],
  ["Lee qué decide el Banco, el Gobierno o los dos, y toca la respuesta.", 90.5],
];

test("★★★ da exactamente los 24 números aprobados de la act. 3 de Contabilidad", () => {
  for (const [t, aprobado] of ACT3) assert.equal(inflesz(t).valor, aprobado, t);
});

test("★★★ da exactamente los 14 números aprobados de Política Monetaria medidos sin «Ḡ»", () => {
  for (const [t, aprobado] of MACRO) assert.equal(inflesz(t).valor, aprobado, t);
});

test("★★★ las variables cuentan como una palabra de una sílaba, «Ḡ» incluida (Levi, opción A)", () => {
  const t = "El gasto público (Ḡ) es autónomo en el modelo: ninguna decisión de tasa lo mueve. Esa arteria nunca es la respuesta.";
  assert.equal(inflesz(t).valor, 74.7);
  /* El número viejo (72,2) es el de una herramienta que saltaba «Ḡ»: una palabra y una sílaba menos. */
  assert.equal(inflesz(t.replace(" (Ḡ)", "")).valor, 72.2);
  assert.deepEqual(palabrasDe("Ḡ, T y TR, i, b, tc e Y").map((x) => [x.texto, x.silabas]),
    [["Ḡ", 1], ["T", 1], ["y", 1], ["TR", 1], ["i", 1], ["b", 1], ["tc", 1], ["e", 1], ["Y", 1]]);
});

test("★★★ «Ḡ» da lo mismo escrita como un carácter o como «G» más la raya combinada", () => {
  const junta = "El gasto público (\u1E20) es autónomo en el modelo: ninguna decisión de tasa lo mueve.";
  const separada = "El gasto público (G\u0304) es autónomo en el modelo: ninguna decisión de tasa lo mueve.";
  assert.notEqual(junta, separada, "las dos formas son cadenas distintas");
  assert.deepEqual(inflesz(separada), inflesz(junta));
  /* Falla si alguien quita la normalización: la forma separada tiene que salir como el carácter único. */
  assert.deepEqual(palabrasDe("G\u0304").map((x) => x.texto), ["\u1E20"]);
  /* Y una raya que no tiene carácter compuesto (U+0305) sigue pegada a su letra: una palabra, no dos. */
  assert.deepEqual(palabrasDe("G\u0305 sube").map((x) => [x.texto.length, x.silabas]), [[2, 1], [4, 2]]);
});

test("★★★ nada se salta en silencio: una letra que no sabe leer se cuenta y se reporta", () => {
  /* Lo que tiene base de la a a la z (tildes, ü, ñ, «Ḡ», «ç») se sabe leer; «ß» y «ø» no. */
  assert.deepEqual(letrasDesconocidas("año, Ḡ, ü, Ñ, ç, ß y ø"), ["ß", "ø"]);
  const r = inflesz("La tasa α sube y el consumo baja un poco este año en el país.");
  assert.deepEqual(r.desconocidas, ["α"]);
  assert.ok(palabrasDe("La tasa α sube").some((x) => x.texto === "α"), "α cuenta como palabra, no se salta");
  assert.deepEqual(inflesz("Lee el hecho. Arma el asiento de las dos empresas.").desconocidas, []);
  /* El comando lo avisa. */
  const cli = fileURLToPath(new URL("../../../scripts/inflesz.mjs", import.meta.url));
  const salida = execFileSync("node", [cli, "La tasa α sube y el consumo baja un poco este año en el país."], { encoding: "utf8" });
  assert.match(salida, /AVISO: letras que no sé leer, contadas como consonante: α/);
});

test("★★★ la convención de las cifras: una palabra de tres sílabas, sin partir por el separador", () => {
  for (const c of ["$1.800.000", "$2.500", "$500", "5,35%", "3", "2026"]) {
    assert.deepEqual(palabrasDe(c).map((x) => [x.texto, x.silabas, x.cifra]), [[c, 3, true]], c);
  }
  /* El largo de la cifra no cambia nada. */
  const corto = inflesz("Son $5 y todavía no los ha pagado a su dueño de siempre.");
  const largo = inflesz("Son $1.800.000 y todavía no los ha pagado a su dueño de siempre.");
  assert.deepEqual([corto.palabras, corto.silabas, corto.valor], [largo.palabras, largo.silabas, largo.valor]);
  /* Y el punto de miles no cierra frase. */
  assert.equal(frasesDe("Son $1.800.000 y todavía no los ha pagado."), 1);
});

test("★★★ las pruebas pueden fallar: con otra convención de cifras, los números aprobados dejan de cuadrar", () => {
  const conCifras = ACT3.filter(([t]) => /\d/.test(t));
  assert.ok(conCifras.length >= 8);
  for (const s of [1, 2, 4]) {
    const cuadran = conCifras.filter(([t, a]) => inflesz(t, { silabasPorCifra: s }).valor === a).length;
    assert.equal(cuadran, 0, `con ${s} sílabas por cifra todavía cuadran ${cuadran}`);
  }
  /* Y un texto cambiado en una sola palabra ya no da su número. */
  const [t, a] = ACT3[4];
  assert.notEqual(inflesz(t.replace("asiento", "registro contable")).valor, a);
});

test("★★ las sílabas: diptongos, hiatos, «y» vocal, siglas", () => {
  const casos = {
    cuánto: 2, país: 2, ahí: 2, todavía: 4, arteria: 3, teatro: 3, aéreo: 4, buey: 1, rey: 1, y: 1, Uruguay: 3,
    guion: 1, que: 1, pingüino: 3, aún: 2, cohete: 3, prohíbe: 3, constitucional: 5, haber: 2, tc: 1, b: 1, Ḡ: 1, TR: 1,
  };
  for (const [p, n] of Object.entries(casos)) assert.equal(silabasDePalabra(p), n, p);
});

test("★★ las frases: punto, interrogación y exclamación cierran; dos puntos y punto y coma no", () => {
  assert.equal(frasesDe("Uno. Dos. Tres."), 3);
  assert.equal(frasesDe("¿Uno? ¡Dos! Tres"), 3);
  assert.equal(frasesDe("Uno: dos; tres"), 1);
  assert.equal(frasesDe("Sin punto final"), 1);
});

test("★★ la fórmula de Szigriszt-Pazos, con un caso calculado a mano", () => {
  /* «Lee el hecho. Arma el asiento de las dos empresas.»: 10 palabras, 17 sílabas, 2 frases. */
  const r = inflesz("Lee el hecho. Arma el asiento de las dos empresas.");
  assert.deepEqual([r.palabras, r.silabas, r.frases], [10, 17, 2]);
  assert.equal(r.exacto, 206.835 - 62.3 * (17 / 10) - 10 / 2);
});

test("★★ el umbral: 65, solo en textos de 10 palabras o más", () => {
  assert.equal(UMBRAL, 65);
  assert.equal(PALABRAS_MINIMAS, 10);
  assert.equal(inflesz("Lee el hecho.").aplica, false);
  assert.equal(inflesz("Lee el hecho.").cumple, null);
  assert.equal(inflesz("La panadería le debe al Banco Andino $50.000 de intereses del mes y todavía no los paga.").cumple, true);
  const largo = inflesz("La institucionalización constitucional internacionalizada caracteriza simultáneamente organizaciones interdisciplinarias contemporáneas extraordinariamente necesarias.");
  assert.equal(largo.aplica, true);
  assert.equal(largo.cumple, false);
  assert.equal(inflesz("").valor, null);
});

test("★ el comando: un texto suelto, y un archivo con un texto por línea; sale con 1 si alguno no cumple", () => {
  const cli = fileURLToPath(new URL("../../../scripts/inflesz.mjs", import.meta.url));
  const salida = execFileSync("node", [cli, "Lee el hecho. Arma el asiento de las dos empresas."], { encoding: "utf8" });
  assert.match(salida, /95,9 +10 p · +17 s · 2 f +cumple/);
  assert.throws(
    () => execFileSync("node", [cli, "La institucionalización constitucional internacionalizada caracteriza simultáneamente organizaciones interdisciplinarias contemporáneas extraordinariamente necesarias."], { encoding: "utf8" }),
    (e) => e.status === 1 && /NO CUMPLE/.test(e.stdout),
  );
});
