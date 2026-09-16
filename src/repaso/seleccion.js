import { ubicacionDeActividad } from "../data/subjects.js";
import { barajar } from "../utils/barajar.js";
import {
  ID_REPASO, MATERIAS_DEL_POOL, ITEMS_POR_REPASO, MINIMO_ACTIVIDADES, MINIMO_POOL,
  CUPOS, DIAS_PARA_OLVIDO, topePorMateria,
} from "./repaso.js";
import { poolDe } from "./items.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL SORTEO DEL REPASO DIARIO (B4) Y SU DESBLOQUEO.
 *
 * Funciones puras: reciben lo hecho, el historial y la fecha, y devuelven. Ni
 * React ni Supabase, para que cada regla se pruebe con una fecha fija.
 *
 * ═══════════ UNIDAD, NO ÍTEM ═══════════
 *
 * Se sortea por CLAVE de historial. Casi siempre una clave es un ítem; en el
 * Electrocardiograma una clave son las dos lecturas de un término, y de esa
 * unidad sale una sola, al azar. Así nunca hay dos ítems con la misma clave
 * en un repaso —su fila de detalle chocaría— y el pool se mide en lo que de
 * verdad se puede preguntar por separado.
 *
 * ═══════════ EL ORDEN DE PRIORIDAD ═══════════
 *
 *   1. Fallados      último resultado mal                    hasta 4, el más viejo primero
 *   2. Olvidándose   último bien, hace 7 días o más           hasta 3, el más viejo primero
 *   3. Frescos       último bien, hace menos de 7 días        hasta 3, el más viejo primero
 *      Lo que un cupo no llena pasa al siguiente: 1 → 2 → 3.
 *   4. Sin ver       ítems del pool que nunca salieron        al azar (decisión de Mateo)
 *   5. Repetir       lo visto que quedó fuera, el más viejo primero
 *
 * Tope por materia en todos los pasos (repaso.js). Si con el tope no se llega
 * a diez y el pool tiene más, un último paso lo ignora: un repaso de ocho por
 * respetar el tope sería peor que uno con cinco de una misma materia. Solo
 * pasa cuando una materia domina el pool, y se deja dicho en el resultado.
 *
 * El orden de presentación es aleatorio: el orden de prioridad decide QUÉ
 * sale, nunca en qué orden.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ZONA = "America/Bogota";

/** "AAAA-MM-DD" de un instante, en Bogotá. */
export function diaBogota(instante) {
  const fecha = instante instanceof Date ? instante : new Date(instante);
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(fecha);
}

/** Días de calendario de Bogotá entre dos instantes (b − a). */
export function diasEntre(a, b) {
  const dia = (x) => {
    const [y, m, d] = diaBogota(x).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((dia(b) - dia(a)) / 86400000);
}

/** Las actividades completadas que cuentan para el desbloqueo: las de las materias del pool. */
export function actividadesDelPool(hechas) {
  return [...hechas].filter((id) => id !== ID_REPASO && MATERIAS_DEL_POOL.includes(ubicacionDeActividad(id)?.temaId));
}

/** Las materias con al menos una actividad completada, en el orden de MATERIAS_DEL_POOL. */
export function materiasCompletadas(hechas) {
  const temas = new Set(actividadesDelPool(hechas).map((id) => ubicacionDeActividad(id).temaId));
  return MATERIAS_DEL_POOL.filter((m) => temas.has(m));
}

/** El pool agrupado por clave: [{ clave, materia, variantes }]. */
export function unidadesDe(pool) {
  const porClave = new Map();
  for (const x of pool) {
    const u = porClave.get(x.clave);
    if (u) u.variantes.push(x);
    else porClave.set(x.clave, { clave: x.clave, materia: x.materia, variantes: [x] });
  }
  return [...porClave.values()];
}

/** En qué grupo del sorteo cae una clave: "sin-ver" · "fallado" · "olvidandose" · "fresco". */
export function categoriaDe(entrada, ahora) {
  if (!entrada) return "sin-ver";
  if (!entrada.ultimoOk) return "fallado";
  return diasEntre(entrada.ultimoEn, ahora) >= DIAS_PARA_OLVIDO ? "olvidandose" : "fresco";
}

/**
 * En qué punto está el Repaso para este estudiante.
 *   "hecho-hoy" · "pocas-actividades" · "pool-corto" · "listo"
 */
export function estadoRepaso({ hechas, hechoHoy }) {
  if (hechoHoy) return "hecho-hoy";
  if (actividadesDelPool(hechas).length < MINIMO_ACTIVIDADES) return "pocas-actividades";
  if (unidadesDe(poolDe(hechas)).length < MINIMO_POOL) return "pool-corto";
  return "listo";
}

/**
 * Los diez ítems de hoy.
 *
 * @param {object}   p
 * @param {Array}    p.pool       ítems del pool (poolDe)
 * @param {Map}      p.historial  clave → { ultimoEn, ultimoOk, veces }
 * @param {Date}     p.ahora
 * @param {Function} [p.mezclar]  barajar; se inyecta en las pruebas
 * @returns {{ items: Array, tope: number, topeRelajado: boolean }}
 */
export function seleccionarRepaso({ pool, historial, ahora, mezclar = barajar }) {
  const unidades = unidadesDe(pool);
  const tope = topePorMateria(new Set(unidades.map((u) => u.materia)).size);

  const cuando = (u) => new Date(historial.get(u.clave).ultimoEn).getTime();
  const masViejoPrimero = (a, b) => cuando(a) - cuando(b);
  const de = (categoria) => unidades.filter((u) => categoriaDe(historial.get(u.clave), ahora) === categoria);

  const vistos = unidades.filter((u) => historial.has(u.clave));
  const fallados = de("fallado").sort(masViejoPrimero);
  const olvidandose = de("olvidandose").sort(masViejoPrimero);
  const frescos = de("fresco").sort(masViejoPrimero);
  const sinVer = mezclar(de("sin-ver"));

  const elegidas = [];
  const tomadas = new Set();
  const porMateria = new Map();

  /* Toma de `lista`, en su orden, hasta `cupo` unidades que quepan. Devuelve cuántas tomó. */
  const tomar = (lista, cupo, conTope = true) => {
    let n = 0;
    for (const u of lista) {
      if (n >= cupo || elegidas.length >= ITEMS_POR_REPASO) break;
      if (tomadas.has(u.clave)) continue;
      if (conTope && (porMateria.get(u.materia) ?? 0) >= tope) continue;
      elegidas.push(u);
      tomadas.add(u.clave);
      porMateria.set(u.materia, (porMateria.get(u.materia) ?? 0) + 1);
      n++;
    }
    return n;
  };

  let arrastre = CUPOS.fallados - tomar(fallados, CUPOS.fallados);
  arrastre = CUPOS.olvidandose + arrastre - tomar(olvidandose, CUPOS.olvidandose + arrastre);
  tomar(frescos, CUPOS.frescos + arrastre);

  const faltan = () => ITEMS_POR_REPASO - elegidas.length;
  tomar(sinVer, faltan());
  tomar([...vistos].sort(masViejoPrimero), faltan());

  let topeRelajado = false;
  if (faltan() > 0 && elegidas.length < unidades.length) {
    topeRelajado = true;
    for (const lista of [fallados, olvidandose, frescos, sinVer, [...vistos].sort(masViejoPrimero)]) tomar(lista, faltan(), false);
  }

  const items = mezclar(elegidas).map((u) => (u.variantes.length > 1 ? mezclar(u.variantes)[0] : u.variantes[0]));
  return { items, tope, topeRelajado };
}

/** Si este ítem cuenta como «antes fallado»: su último resultado, antes de hoy, fue un error. */
export const estabaFallado = (historial, clave) => historial.get(clave)?.ultimoOk === false;
