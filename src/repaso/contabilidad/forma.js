import { ubicacionDeActividad } from "../../data/subjects.js";
import { TEMAS_DEL_POOL_CONTABILIDAD } from "../repaso.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONTRATO DE UN ÍTEM DEL REPASO DE CONTABILIDAD.
 *
 * El motor (seleccion.js, la partida, el banner) es el mismo de Macro y lo
 * mantiene el coordinador. Lo que entra al pool lo escribe la célula dueña de
 * cada tema, en su archivo de esta carpeta (t1.js … t4.js), y solo con estas
 * tres funciones: así un ítem mal formado revienta al cargar el módulo y no
 * delante de un estudiante.
 *
 * ═══════════ LA MISMA REGLA DE MACRO: NI UNA COPIA DE CONTENIDO ═══════════
 *
 * Cada ítem se arma LEYENDO el banco de la actividad de origen (el mismo
 * archivo de src/data o src/contabilidad que usa la actividad), y su devolución
 * llama a la misma función de retroalimentación. Si alguien corrige un texto en
 * el banco, el Repaso lo enseña corregido sin tocar este pool.
 *
 * ═══════════ EL SUBTEMA: FIJO O REGLA (B2c del prompt del Repaso) ═══════════
 *
 *   fijo   toda la actividad —o toda una etapa— tiene un mismo subtema:
 *          subtemaFijo("t4-arqueo", "Arqueo de caja")
 *   regla  el subtema de cada ítem ES su respuesta, su ronda o su escenario,
 *          así que se escribe como un mapeo del dato del banco al nombre:
 *          subtemaPorRegla({ debe: "Débito", haber: "Crédito" }, x.respuesta)
 *
 * Las dos lanzan si el nombre sale vacío: un subtema vacío no pasa en
 * silencio, igual que en Macro.
 *
 * ═══════════ LA CLAVE ═══════════
 *
 *   clave = `${actividad}:${itemId}`
 *
 * Si la actividad de origen ya manda detalle por ítem a registrar_fp, el
 * `itemId` tiene que ser EXACTAMENTE el que manda: así lo visto en la
 * actividad y lo visto en el Repaso son un solo historial. Si no manda
 * detalle, el itemId es el id estable del ítem en su banco (nunca su índice
 * en el arreglo: reordenar el banco cambiaría el historial de todos).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const retro = (texto) => (texto ? [{ tipo: "retro", texto }] : []);

/**
 * Un ítem del pool: una elección de un toque, un intento.
 *
 * @param {string} actividad  id de la actividad de origen (de uno de los cuatro temas)
 * @param {string} itemId     id estable del ítem en su banco
 * @param {object} campos     { subtema, rotulo, enunciado, opciones: [{id, texto}],
 *                              correcta, devolucion(elegida) → [bloque],
 *                              pregunta?, detalle?, etiqueta?, grande?, barajarOpciones? }
 */
export function itemDeRepaso(actividad, itemId, campos) {
  const ubicacion = ubicacionDeActividad(actividad);
  if (!ubicacion) throw new Error(`Actividad fuera del catálogo: ${actividad}`);
  if (!TEMAS_DEL_POOL_CONTABILIDAD.includes(ubicacion.temaId)) {
    throw new Error(`${actividad} es de «${ubicacion.temaId}», que no está en el Repaso de Contabilidad`);
  }
  if (itemId === undefined || itemId === null || String(itemId) === "") throw new Error(`${actividad}: ítem sin id`);
  const { subtema, enunciado, opciones, correcta, devolucion } = campos ?? {};
  if (!subtema) throw new Error(`${actividad}:${itemId}: sin subtema`);
  if (!enunciado) throw new Error(`${actividad}:${itemId}: sin enunciado`);
  if (!Array.isArray(opciones) || opciones.length < 2) throw new Error(`${actividad}:${itemId}: hacen falta dos opciones o más`);
  if (!opciones.some((o) => o.id === correcta)) throw new Error(`${actividad}:${itemId}: la correcta no está entre las opciones`);
  if (typeof devolucion !== "function") throw new Error(`${actividad}:${itemId}: sin devolución`);
  return {
    clave: `${actividad}:${itemId}`,
    actividad,
    itemId: String(itemId),
    materia: ubicacion.temaId,
    barajarOpciones: false,
    ...campos,
  };
}

/** [fijo] El subtema de toda una actividad o etapa. */
export function subtemaFijo(nombre, contexto = "") {
  if (!nombre) throw new Error(`Sin subtema fijo${contexto ? `: ${contexto}` : ""}`);
  return nombre;
}

/** [regla] Del dato del banco al subtema; lanza si el dato no tiene nombre. */
export function subtemaPorRegla(regla, clave, contexto = "") {
  const nombre = regla?.[clave];
  if (!nombre) throw new Error(`Sin subtema para «${clave}»${contexto ? ` (${contexto})` : ""}`);
  return nombre;
}
