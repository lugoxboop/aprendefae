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
import { seleccionarRepaso, categoriaDe } from "../../repaso/seleccion.js";
import { PLANTILLAS, TEMAS_REPASO, generarConsulta, plantilla } from "./plantillas.js";

export const ID_REPASO_MACRO = "repaso-diario-macro";
export const CONSULTAS_POR_RONDA = 10;

/** Las unidades del pool, con la forma que espera el motor. */
export const POOL_MACRO = PLANTILLAS.map((pl) => ({
  clave: pl.id, itemId: pl.id, actividad: pl.actividad, materia: pl.tema, plantilla: pl.id,
}));

const mezclarCon = (rng) => (lista) => {
  const a = [...lista];
  for (let k = a.length - 1; k > 0; k -= 1) {
    const j = Math.floor(rng() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
};

/** Regla 1: los cinco temas presentes. */
export function equilibrar(ids, historial, ahora, rng) {
  const elegidas = [...ids];
  for (const tema of TEMAS_REPASO.map((t) => t.id)) {
    if (elegidas.some((id) => plantilla(id).tema === tema)) continue;
    const candidatas = mezclarCon(rng)(PLANTILLAS.filter((pl) => pl.tema === tema && !elegidas.includes(pl.id)));
    if (!candidatas.length) continue;
    const cuenta = new Map();
    for (const id of elegidas) cuenta.set(plantilla(id).tema, (cuenta.get(plantilla(id).tema) ?? 0) + 1);
    const reemplazable = elegidas
      .filter((id) => cuenta.get(plantilla(id).tema) > 1 && categoriaDe(historial.get(id), ahora) !== "fallado")
      .sort((a, b) => cuenta.get(plantilla(b).tema) - cuenta.get(plantilla(a).tema))[0];
    if (reemplazable) elegidas[elegidas.indexOf(reemplazable)] = candidatas[0].id;
  }
  return elegidas;
}

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

/**
 * La ronda de hoy: diez consultas con sus datos sorteados.
 * `mezclar`: el barajado del motor (sembrado con estudiante y día en el
 * sitio, para que el banner y la partida coincidan). `rng`: el azar de las
 * cifras (Math.random en el sitio; con semilla en pruebas y videos).
 */
export function armarRonda({ historial = new Map(), ahora = new Date(), mezclar = null, rng = Math.random } = {}) {
  const { items } = seleccionarRepaso({ pool: POOL_MACRO, historial, ahora, mezclar: mezclar ?? mezclarCon(rng) });
  const ids = equilibrar(items.map((x) => x.plantilla), historial, ahora, rng).slice(0, CONSULTAS_POR_RONDA);
  return ordenarRonda(ids.map((id) => generarConsulta(plantilla(id), rng)));
}
