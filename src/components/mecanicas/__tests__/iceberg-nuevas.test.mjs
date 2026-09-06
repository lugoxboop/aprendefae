import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PISTAS_TRIBUNAL, HIPOTESIS_TRIBUNAL, ORDEN_TRIBUNAL, CRITERIOS_TRIBUNAL,
  FRAGMENTOS_TRANSMISION, RANURAS_TRANSMISION, CORRIENTE,
} from "../../../data/icebergActividades.js";
import { puntuarTribunal, PARES } from "../TribunalProfundidad.jsx";
import { puntuarTransmision, CLARAS } from "../TransmisionSuperficie.jsx";
import { mezclarCorriente } from "../CorrienteCruzada.jsx";
import { barajarDistinto } from "../../../utils/barajar.js";

/*
 * Las tres actividades nuevas del iceberg. Lo que se mide aquí no es la
 * interfaz —eso se ve en el navegador— sino las tres cosas que en el navegador
 * no se ven de un vistazo: que el 100% se puede alcanzar, que el mínimo es 0 y
 * no un negativo (el motor de FP recibe este número), y que el intercalado de la
 * corriente cumple su promesa en cualquier barajado, no solo en el que salió al
 * probar.
 */

/* ═══════════════════ 6. Tribunal ═══════════════════ */

test("tribunal: el orden canónico está justificado por los datos", () => {
  /*
   * Si dos hipótesis explicaran el mismo número de pistas, el orden que se pide
   * sería arbitrario y la actividad no tendría respuesta. Esto lo impide.
   */
  const alcances = ORDEN_TRIBUNAL.map(
    (id) => HIPOTESIS_TRIBUNAL.find((h) => h.id === id).explica.length
  );
  for (let i = 1; i < alcances.length; i++) {
    assert.ok(
      alcances[i - 1] > alcances[i],
      `la posición ${i} explica ${alcances[i]} y la anterior ${alcances[i - 1]}: empatan o van al revés`
    );
  }
});

test("tribunal: cada hipótesis apunta a pistas que existen", () => {
  const ids = new Set(PISTAS_TRIBUNAL.map((p) => p.id));
  for (const h of HIPOTESIS_TRIBUNAL)
    for (const p of h.explica)
      assert.ok(ids.has(p), `${h.id} dice explicar "${p}", que no es ninguna pista`);
});

test("tribunal: hay exactamente un criterio correcto", () => {
  assert.equal(CRITERIOS_TRIBUNAL.filter((c) => c.correcto).length, 1);
});

test("tribunal: el 100% se alcanza y el 0% es el suelo", () => {
  const bueno = CRITERIOS_TRIBUNAL.find((c) => c.correcto).id;
  const malo = CRITERIOS_TRIBUNAL.find((c) => !c.correcto).id;

  assert.equal(puntuarTribunal(ORDEN_TRIBUNAL, bueno).pct, 100);
  assert.equal(puntuarTribunal([...ORDEN_TRIBUNAL].reverse(), malo).pct, 0);
});

test("tribunal: ningún resultado se sale de 0..100 ni trae decimales", () => {
  /* Las 6 ordenaciones posibles por los 3 criterios: 18 combinaciones. */
  const permutaciones = [];
  const permutar = (resto, acc) => {
    if (!resto.length) return permutaciones.push(acc);
    resto.forEach((x, i) => permutar([...resto.slice(0, i), ...resto.slice(i + 1)], [...acc, x]));
  };
  permutar(ORDEN_TRIBUNAL, []);
  assert.equal(permutaciones.length, 6);

  const vistos = new Set();
  for (const orden of permutaciones)
    for (const c of CRITERIOS_TRIBUNAL) {
      const { pct } = puntuarTribunal(orden, c.id);
      assert.ok(Number.isInteger(pct) && pct >= 0 && pct <= 100, `pct fuera de rango: ${pct}`);
      vistos.add(pct);
    }

  /* Con 3 pares a 25 y el criterio a 25, los peldaños son de 25 en 25. */
  assert.deepEqual([...vistos].sort((a, b) => a - b), [0, 25, 50, 75, 100]);
});

test("tribunal: un par mal puesto cuesta exactamente 25", () => {
  const bueno = CRITERIOS_TRIBUNAL.find((c) => c.correcto).id;
  /* Intercambiar los dos últimos rompe un solo par de los tres. */
  const casiBien = [ORDEN_TRIBUNAL[0], ORDEN_TRIBUNAL[2], ORDEN_TRIBUNAL[1]];
  const { paresBien, pct } = puntuarTribunal(casiBien, bueno);
  assert.equal(paresBien, PARES.length - 1);
  assert.equal(pct, 75);
});

/* ═══════════════════ 7. Transmisión ═══════════════════ */

test("transmisión: hay tantas frases claras como ranuras", () => {
  assert.equal(CLARAS.length, RANURAS_TRANSMISION);
});

test("transmisión: el banco tiene ruido de las dos clases", () => {
  const cuenta = (clase) => FRAGMENTOS_TRANSMISION.filter((f) => f.clase === clase).length;
  assert.ok(cuenta("jerga") >= 3, "poca jerga: es la trampa central de la actividad");
  assert.ok(cuenta("incorrecta") >= 3, "pocas frases falsas");
  assert.ok(FRAGMENTOS_TRANSMISION.length >= 10, "el banco se queda corto");
});

test("transmisión: el mensaje perfecto vale 100", () => {
  assert.equal(puntuarTransmision(CLARAS), 100);
});

test("transmisión: el peor mensaje posible da 0, no un negativo", () => {
  const peores = FRAGMENTOS_TRANSMISION.filter((f) => f.clase === "incorrecta").map((f) => f.id);
  const jergas = FRAGMENTOS_TRANSMISION.filter((f) => f.clase === "jerga").map((f) => f.id);
  const fatal = [...peores, ...jergas].slice(0, RANURAS_TRANSMISION);
  assert.equal(fatal.length, RANURAS_TRANSMISION);
  assert.equal(puntuarTransmision(fatal), 0);
});

test("transmisión: las cinco claras en mal orden valen la mitad", () => {
  /* Rotarlas deja las cinco fuera de sitio: 5 × 10. */
  const rotadas = [...CLARAS.slice(1), CLARAS[0]];
  assert.equal(puntuarTransmision(rotadas), 50);
});

test("transmisión: cambiar una clara por ruido cuesta más que descolocarla", () => {
  /*
   * ESTA es la invariante que sostiene la actividad, y hay que decirla con
   * cuidado porque la versión amplia —"elegir bien pesa más que ordenar bien"—
   * es falsa y este test la desmintió: cuatro claras en su sitio con una jerga
   * (70) valen más que las cinco claras todas descolocadas (50).
   *
   * Y está bien que así sea. En el iceberg el orden ES contenido: se baja de la
   * superficie al modelo mental, y contarlo desordenado se entiende peor. Lo que
   * no puede pasar nunca es que meter jerga salga más barato que descolocar una
   * frase buena, porque entonces la actividad premiaría hablar como el libro.
   *
   * Se mide sustituyendo en el MISMO sitio, que es la comparación justa.
   */
  const jerga = FRAGMENTOS_TRANSMISION.find((f) => f.clase === "jerga").id;
  const falsa = FRAGMENTOS_TRANSMISION.find((f) => f.clase === "incorrecta").id;

  const enSuSitio = puntuarTransmision(CLARAS);
  const descolocada = puntuarTransmision([CLARAS[1], CLARAS[0], ...CLARAS.slice(2)]);
  const conJerga = puntuarTransmision([jerga, ...CLARAS.slice(1)]);
  const conFalsa = puntuarTransmision([falsa, ...CLARAS.slice(1)]);

  assert.ok(enSuSitio > descolocada, "descolocar tiene que costar algo");
  assert.ok(descolocada > conJerga, "la jerga tiene que costar más que descolocar");
  assert.ok(conJerga > conFalsa, "una frase falsa tiene que costar más que una en jerga");
});

test("transmisión: la escala completa, de mejor a peor", () => {
  /*
   * La tabla que se usó para decidir los puntos, congelada. Si alguien cambia un
   * valor de PUNTOS, esto dice exactamente qué escenario se movió y adónde.
   */
  const jerga = FRAGMENTOS_TRANSMISION.filter((f) => f.clase === "jerga").map((f) => f.id);
  const falsas = FRAGMENTOS_TRANSMISION.filter((f) => f.clase === "incorrecta").map((f) => f.id);
  const C = CLARAS;

  const escala = [
    ["las 5 claras en su orden", C, 100],
    ["un intercambio entre vecinas", [C[0], C[2], C[1], C[3], C[4]], 80],
    ["4 en su sitio + 1 jerga", [...C.slice(0, 4), jerga[0]], 70],
    ["4 en su sitio + 1 falsa", [...C.slice(0, 4), falsas[0]], 60],
    /* Al revés la del medio se queda en su sitio; rotadas no se salva ninguna. */
    ["las 5 al revés", [...C].reverse(), 60],
    ["las 5 rotadas", [...C.slice(1), C[0]], 50],
    ["3 en su sitio + 2 jergas", [...C.slice(0, 3), jerga[0], jerga[1]], 40],
    ["3 en su sitio + 2 falsas", [...C.slice(0, 3), falsas[0], falsas[1]], 20],
    ["3 falsas + 2 jergas", [...falsas, ...jerga.slice(0, 2)], 0],
  ];

  for (const [nombre, envio, esperado] of escala)
    assert.equal(puntuarTransmision(envio), esperado, nombre);
});

/* ═══════════════════ 8. Corriente cruzada ═══════════════════ */

test("corriente: las cuatro clases están en los cuatro casos", () => {
  const casos = [...new Set(CORRIENTE.map((c) => c.caso))];
  assert.equal(casos.length, 4, "la práctica intercalada necesita varios casos");
  for (const caso of casos) {
    const niveles = new Set(CORRIENTE.filter((c) => c.caso === caso).map((c) => c.nivel));
    assert.equal(niveles.size, 4, `${caso} no tiene los cuatro niveles`);
  }
});

test("corriente: nunca salen dos frases seguidas del mismo caso", () => {
  /*
   * Es LA propiedad de la actividad: si se agrupasen, esto sería el radar cuatro
   * veces. Se barre mil veces porque el barajado es aleatorio y un solo pase no
   * probaría nada.
   */
  for (let intento = 0; intento < 1000; intento++) {
    const tanda = mezclarCorriente(CORRIENTE);
    for (let i = 1; i < tanda.length; i++) {
      assert.notEqual(
        tanda[i].caso, tanda[i - 1].caso,
        `pase ${intento}: "${tanda[i - 1].texto}" y "${tanda[i].texto}" son las dos de ${tanda[i].caso}`
      );
    }
  }
});

test("corriente: la tanda trae todas las frases y ninguna repetida", () => {
  for (let intento = 0; intento < 200; intento++) {
    const tanda = mezclarCorriente(CORRIENTE);
    assert.equal(tanda.length, CORRIENTE.length);
    assert.equal(new Set(tanda.map((x) => x.id)).size, CORRIENTE.length);
  }
});

/* ═══════════════════ el barajado compartido ═══════════════════ */

test("barajarDistinto nunca devuelve el orden anterior", () => {
  const xs = ["a", "b", "c", "d"];
  let anterior = xs;
  for (let i = 0; i < 500; i++) {
    const siguiente = barajarDistinto(xs, anterior);
    assert.notDeepEqual(siguiente, anterior);
    assert.deepEqual([...siguiente].sort(), [...xs].sort());
    anterior = siguiente;
  }
});
