import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { porcentaje, decimal } from "../porcentaje.js";

/*
 * #542: los porcentajes que se le enseñan al estudiante van con coma decimal.
 */

test("★ porcentaje: coma decimal, sin ceros de relleno, espacio que no se parte", () => {
  assert.equal(porcentaje(100 / 6), "16,67 %");
  assert.equal(porcentaje(100 / 8), "12,5 %");
  assert.equal(porcentaje(25), "25 %");
  assert.equal(porcentaje(100 / 3, 1), "33,3 %");
  assert.equal(porcentaje(0), "0 %");
  assert.equal(porcentaje(-0.001), "0 %");
  assert.equal(decimal(-2.5, 1), "−2,5");
  assert.equal(porcentaje(NaN), "—");
  assert.equal(porcentaje(undefined), "—");
  assert.doesNotMatch(porcentaje(100 / 7), /\./);
});

/*
 * ═══════════ EL TRINQUETE ═══════════
 *
 * Hoy hay piezas que escriben `{x.toFixed(2)} %` en el texto que lee el
 * estudiante. Cada una es de su célula y la corrige su célula (#542 dice cuál
 * es de quién): esta lista solo puede ENCOGER. Si aparece un archivo nuevo con
 * el patrón, o uno de la lista suma otro, se pone rojo. Al corregir el suyo,
 * la célula lo borra de aquí en el mismo PR.
 *
 * Lo que no cuenta: `${x.toFixed(1)}%` dentro de una plantilla (es CSS: un
 * fotograma clave o un ancho, no texto).
 */
const PATRON = /(?<!\$)\{[^{}]*\.toFixed\([1-9]\)\}\s?%/g;

const PENDIENTES = {
  /* Célula E · T3 */
  "src/components/mecanicas/libros/tema3/ArmaElAjuste.jsx": 1,
  "src/components/mecanicas/libros/tema3/GastoOPago.jsx": 1,
  "src/components/mecanicas/libros/tema3/CuandoSeCausa.jsx": 1,
  "src/components/mecanicas/libros/tema3/IngresoOCobro.jsx": 1,
  "src/components/mecanicas/libros/tema3/MismoHecho.jsx": 1,
  "src/components/mecanicas/libros/tema3/ResultadoCaja.jsx": 1,
  "src/components/mecanicas/libros/tema3/QueLeToca.jsx": 1,
  /* Célula B · T1 */
  "src/components/mecanicas/libros/tema1/DondeSeRompio.jsx": 1,
  "src/components/mecanicas/libros/tema1/EnCualEstadoAparece.jsx": 1,
  "src/components/mecanicas/libros/tema1/LaArticulacion.jsx": 1,
  "src/components/mecanicas/libros/tema1/DesdeDondePreguntan.jsx": 1,
  "src/components/mecanicas/libros/tema1/UnDiaOUnAno.jsx": 1,
  "src/components/mecanicas/libros/tema1/QuienPreguntaEsto.jsx": 1,
  "src/components/mecanicas/libros/tema1/QueEntroYQueSalio.jsx": 1,
  "src/components/mecanicas/libros/tema1/LaEcuacionEnMovimiento.jsx": 1,
  /* Célula C · T2 */
  "src/components/mecanicas/libros/CuadroDeDinamicas.jsx": 1,
  "src/components/mecanicas/libros/ElAsientoCompuestoNuevo.jsx": 1,
  "src/components/mecanicas/libros/ElAsientoSimple.jsx": 1,
  "src/components/mecanicas/libros/ElSaldoDeLaCuenta.jsx": 1,
  "src/components/mecanicas/libros/ArmaElBalance.jsx": 1,
  "src/components/mecanicas/libros/DebitaOAcredita.jsx": 1,
  /* Macroeconomía: estudiantes reales, no se toca sin visto bueno. Queda anotada. */
  "src/components/mecanicas/DashboardEconomico.jsx": 3,
  "src/components/mecanicas/TableroDeDecisiones.jsx": 7,
};

const RAIZ = new URL("../../../", import.meta.url);
function jsx(dir, fuera = []) {
  for (const f of readdirSync(new URL(dir, RAIZ))) {
    const ruta = `${dir}${f}`;
    if (f === "__tests__" || f === "node_modules") continue;
    if (statSync(new URL(ruta, RAIZ)).isDirectory()) jsx(`${ruta}/`, fuera);
    else if (f.endsWith(".jsx")) fuera.push(ruta);
  }
  return fuera;
}

test("★★★ ningún porcentaje nuevo con punto decimal en lo que lee el estudiante (trinquete)", () => {
  const archivos = jsx("src/");
  assert.ok(archivos.length > 100, `se leyeron ${archivos.length} archivos: la prueba habría pasado mirando casi nada`);
  const reproches = [];
  for (const ruta of archivos) {
    const n = (readFileSync(new URL(ruta, RAIZ), "utf8").match(PATRON) ?? []).length;
    const permitidos = PENDIENTES[ruta] ?? 0;
    if (n > permitidos) {
      reproches.push(`${ruta}: ${n} porcentaje(s) con .toFixed() y punto decimal (permitidos ${permitidos}). Usa porcentaje() de src/hacer/porcentaje.js.`);
    }
  }
  assert.deepEqual(reproches, []);
});
