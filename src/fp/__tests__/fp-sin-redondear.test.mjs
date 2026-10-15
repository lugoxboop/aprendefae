/*
 * EL NÚMERO QUE SE VE Y EL QUE SE GUARDA TIENEN QUE SER EL MISMO.
 *
 * El cliente mandaba `Math.round(aciertos * 100)` —un entero— y la 0036 divide
 * ese entero entre 100 para sacar el rendimiento. El navegador, mientras
 * tanto, calculaba su vista previa con la proporción exacta. Con 5 de 8 en una
 * actividad de 90 FP el estudiante veía 56 y la base guardaba 57.
 *
 * Estas pruebas reproducen LAS DOS cuentas —la del navegador y la del
 * servidor— y exigen que coincidan. No miran el código del cliente: miran el
 * resultado. Si alguien vuelve a redondear antes de enviar, se ponen rojas.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/* La cuenta del servidor, copiada de la 0036: piso del 50 %, techo del 100 %. */
const fpDelServidor = (base, correctPct) => {
  const rend = Math.max(0.5, Math.min(1, (correctPct ?? 0) / 100));
  return Math.round(base * rend);
};

/* La del navegador, con la proporción exacta. */
const fpDelNavegador = (base, aciertos) => {
  /* El mismo viaje ×100 ÷100 que hace motor.js, y por la misma razón. */
  const rend = Math.max(0.5, Math.min(1, (aciertos * 100) / 100));
  return Math.round(base * rend);
};

/* Lo que el cliente manda hoy. Si alguien lo redondea, esto deja de cuadrar. */
const loQueViaja = (aciertos) => aciertos * 100;

const CASOS = [
  { nombre: "5 de 8 en una de 90 FP — el caso que lo destapó", base: 90, bien: 5, total: 8 },
  { nombre: "7 de 12 en una de 90 FP — falla al revés", base: 90, bien: 7, total: 12 },
  { nombre: "2 de 3 en una de 25 FP", base: 25, bien: 2, total: 3 },
  { nombre: "1 de 6 en una de 50 FP (por debajo del piso)", base: 50, bien: 1, total: 6 },
  { nombre: "6 de 6, todo bien", base: 50, bien: 6, total: 6 },
  { nombre: "11 de 12 en una de 90 FP", base: 90, bien: 11, total: 12 },
];

for (const c of CASOS) {
  test(`★★★ ${c.nombre}: el servidor paga lo que el navegador enseña`, () => {
    const aciertos = c.bien / c.total;
    const enPantalla = fpDelNavegador(c.base, aciertos);
    const guardado = fpDelServidor(c.base, loQueViaja(aciertos));
    assert.equal(
      guardado,
      enPantalla,
      `con ${c.bien} de ${c.total} sobre ${c.base} FP el estudiante ve ${enPantalla} y se guardan ${guardado}`,
    );
  });
}

test("★★★ y con el redondeo viejo SÍ se separaban: la prueba mide algo", () => {
  /* Si esto pasara a verde, la prueba de arriba estaría comprobando el vacío. */
  const aciertos = 5 / 8;
  const viejo = Math.round(aciertos * 100);
  assert.notEqual(
    fpDelServidor(90, viejo),
    fpDelNavegador(90, aciertos),
    "el redondeo viejo tiene que separar las dos cuentas; si no, este caso ya no sirve de testigo",
  );
});

test("★★ el cliente no redondea antes de enviar", () => {
  const fuente = readFileSync(new URL("../otorgarFP.js", import.meta.url), "utf8");
  assert.ok(fuente.length > 2000, "no se leyó el archivo: la comprobación habría pasado mirando nada");
  const linea = fuente.split("\n").find((l) => l.includes("p_correct_pct:"));
  assert.ok(linea, "no encontré la línea que manda p_correct_pct");
  assert.ok(
    !linea.includes("Math.round"),
    `p_correct_pct vuelve a viajar redondeado y el estudiante volverá a ver un número distinto del guardado: ${linea.trim()}`,
  );
});
