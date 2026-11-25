/*
 * MACRO 2026 · EL REPASO DIARIO — QUÉ CONSULTAS SALEN HOY.
 *
 * El sorteo es el MISMO motor del Repaso de Contabilidad (src/repaso/
 * seleccion.js, B4): primero lo fallado, luego lo que se está olvidando y lo
 * fresco, y al final lo nunca visto; tope de 4 por tema. Encima, tres reglas
 * propias de Macro (diseño de Gen, 24-nov):
 *
 *   1. Los cinco temas, siempre. Si el sorteo deja uno fuera, entra en el
 *      lugar de una consulta del tema que más tiene (nunca de una fallada).
 *   2. De menos a más: la ronda va por nivel (1 → 3).
 *   3. Variedad: dos consultas seguidas no repiten tema, mecánica ni mascota
 *      cuando se puede evitar.
 *
 * Las cifras de cada consulta se sortean al armarla (plantillas.js): la
 * selección del día es estable (semilla), los datos cambian en cada intento.
 */
import { seleccionarRepaso } from "../../repaso/seleccion.js";
import { generarConsulta, plantilla } from "./plantillas.js";
import { POOL_MACRO, ajustarItems } from "./pool.js";

export { ID_REPASO_MACRO, CONSULTAS_POR_RONDA, POOL_MACRO, equilibrar, ajustarItems } from "./pool.js";

const mezclarCon = (rng) => (lista) => {
  const a = [...lista];
  for (let k = a.length - 1; k > 0; k -= 1) {
    const j = Math.floor(rng() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
};

/**
 * Reglas 2 y 3. En cada paso sale la consulta pendiente de menor costo:
 * su nivel (×10) más lo que chocaría con la anterior (mismo tema 12, misma
 * mecánica 11, misma mascota 5). Así la ronda sube de nivel y, si hay que
 * escoger, prefiere adelantar una consulta un nivel a repetir lugar o juego.
 */
export function ordenarRonda(consultas) {
  const pendientes = [...consultas].sort((a, b) => a.nivel - b.nivel);
  const fuera = [];
  while (pendientes.length) {
    const prev = fuera[fuera.length - 1];
    const costo = (c) => c.nivel * 10 + (prev ? (c.tema === prev.tema ? 12 : 0) + (c.mecanica === prev.mecanica ? 11 : 0) + (c.escena.mascota?.id === prev.escena.mascota?.id ? 5 : 0) : 0);
    let k = 0;
    pendientes.forEach((c, j) => { if (costo(c) < costo(pendientes[k])) k = j; });
    fuera.push(pendientes.splice(k, 1)[0]);
  }
  return fuera;
}

/** Las consultas de unos ítems ya elegidos: cifras sorteadas con `rng` y en orden de ronda. */
export const consultasDe = (items, rng = Math.random) =>
  ordenarRonda(items.map((x) => generarConsulta(plantilla(x.plantilla), rng)));

/**
 * La ronda de hoy: diez consultas con sus datos sorteados.
 * `mezclar`: el barajado del motor. `rng`: el azar de las cifras.
 * En el sitio la selección la hace vistaPreviaDelDia (la misma tirada del
 * banner, sembrada con estudiante y día) y luego consultasDe; armarRonda
 * queda para la vista previa, las pruebas y los videos.
 */
export function armarRonda({ historial = new Map(), ahora = new Date(), mezclar = null, rng = Math.random } = {}) {
  const baraja = mezclar ?? mezclarCon(rng);
  const { items } = seleccionarRepaso({ pool: POOL_MACRO, historial, ahora, mezclar: baraja });
  return consultasDe(ajustarItems(items, { historial, mezclar: baraja }), rng);
}
