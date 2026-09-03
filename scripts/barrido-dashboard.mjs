import { simular, evaluar } from "../src/components/mecanicas/DashboardEconomico.jsx";

/*
 * Barrido exhaustivo del espacio de decisión: recorre las tres palancas en
 * toda su amplitud, con su propio paso, y reporta qué niveles de resultado son
 * alcanzables. Sirve para saber si la meta oficial se puede cumplir.
 *
 * Ningún nivel debe salir en 0: uno inalcanzable es una rama muerta, y si es
 * el 100% significa que la actividad pide algo imposible.
 */

const RANGOS = [
  { id: "impuesto", min: 20, max: 35, paso: 0.5 },
  { id: "tasa", min: 4, max: 12, paso: 0.25 },
  { id: "aranceles", min: 0, max: 20, paso: 0.5 },
];

const conteo = { 100: 0, 60: 0, 10: 0 };
/*
 * Escenarios que la tabla de niveles no cubre explícitamente. Se cuentan
 * aparte para saber si son alcanzables y si su texto de feedback encaja.
 */
const huecos = { unaMetaConRecesion: 0, ningunaMetaConRecesion: 0, ambasMetasConRecesion: 0 };
let total = 0;
let mejorInflacionConEmpleoOk = Infinity;
let mejorCaso = null;
let ejemploCien = null;
let ejemploUnaMetaRecesion = null;

for (let i = RANGOS[0].min; i <= RANGOS[0].max; i += RANGOS[0].paso) {
  for (let t = RANGOS[1].min; t <= RANGOS[1].max; t += RANGOS[1].paso) {
    for (let a = RANGOS[2].min; a <= RANGOS[2].max; a += RANGOS[2].paso) {
      const v = { impuesto: i, tasa: t, aranceles: a };
      const ind = simular(v);
      const { porcentaje } = evaluar(ind);
      conteo[porcentaje]++;
      total++;

      const okD = ind.desempleo <= 12;
      const okI = ind.inflacion <= 6;
      const recesion = ind.pib < 0;
      if ((okD !== okI) && recesion) {
        huecos.unaMetaConRecesion++;
        ejemploUnaMetaRecesion ??= { ...v, ...ind, porcentaje };
      }
      if (!okD && !okI && recesion) huecos.ningunaMetaConRecesion++;
      if (okD && okI && recesion) huecos.ambasMetasConRecesion++;
      if (porcentaje === 100) ejemploCien ??= { ...v, ...ind };
      if (ind.desempleo <= 12 && ind.inflacion < mejorInflacionConEmpleoOk) {
        mejorInflacionConEmpleoOk = ind.inflacion;
        mejorCaso = { ...v, ...ind };
      }
    }
  }
}

console.log(`Combinaciones evaluadas: ${total}\n`);
console.table(
  Object.entries(conteo).map(([nivel, n]) => ({
    nivel: `${nivel}%`,
    combinaciones: n,
    alcanzable: n > 0 ? "SÍ" : "NO",
  }))
);

console.log("\nMejor intento de cumplir AMBAS metas:");
console.log("  Con desempleo ya en meta (<=12%), la inflación más baja posible es",
  mejorInflacionConEmpleoOk.toFixed(2) + "% (meta: <=6%)");
if (mejorCaso) {
  console.log("  Con impuesto", mejorCaso.impuesto + "%, tasa", mejorCaso.tasa + "%, aranceles", mejorCaso.aranceles + "%");
  console.log("  ->  desempleo", mejorCaso.desempleo.toFixed(2) + "%, inflación", mejorCaso.inflacion.toFixed(2) + "%, PIB", mejorCaso.pib.toFixed(2) + "%");
}

const cien = conteo[100] > 0;
console.log(`\n${cien ? "La meta oficial ES alcanzable." : "La meta oficial NO es alcanzable con estos rangos y coeficientes."}`);

const muestra = (nombre, c) =>
  c
    ? `  ${nombre}: impuesto ${c.impuesto}%, tasa ${c.tasa}%, aranceles ${c.aranceles}% -> desempleo ${c.desempleo.toFixed(1)}%, inflación ${c.inflacion.toFixed(1)}%, PIB ${c.pib.toFixed(1)}%`
    : `  ${nombre}: sin ejemplo (no alcanzable)`;

console.log("\nEjemplos concretos:");
console.log(muestra("100%", ejemploCien));

console.log("\nEscenarios fuera de la tabla de niveles:");
console.table([
  { escenario: "una meta cumplida + recesión", combinaciones: huecos.unaMetaConRecesion, alcanzable: huecos.unaMetaConRecesion > 0 ? "SÍ" : "NO" },
  { escenario: "ninguna meta + recesión", combinaciones: huecos.ningunaMetaConRecesion, alcanzable: huecos.ningunaMetaConRecesion > 0 ? "SÍ" : "NO" },
  { escenario: "ambas metas + recesión (el viejo 30%)", combinaciones: huecos.ambasMetasConRecesion, alcanzable: huecos.ambasMetasConRecesion > 0 ? "SÍ" : "NO" },
]);
if (ejemploUnaMetaRecesion) {
  console.log(muestra(`una meta + recesión (hoy cae en ${ejemploUnaMetaRecesion.porcentaje}%)`, ejemploUnaMetaRecesion));
}
