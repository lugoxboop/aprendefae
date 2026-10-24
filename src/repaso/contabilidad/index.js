import { ITEMS_T1, FUERA_T1 } from "./t1.js";
import { ITEMS_T2, FUERA_T2 } from "./t2.js";
import { ITEMS_T3, FUERA_T3 } from "./t3.js";
import { ITEMS_T4, FUERA_T4 } from "./t4.js";

/*
 * El pool del Repaso de Contabilidad: los ítems de los cuatro temas del
 * semestre, en el orden del libro. Cada tema lo escribe su célula (t1.js …
 * t4.js); este archivo solo los junta.
 */
export const POOL_CONTABILIDAD = [...ITEMS_T1, ...ITEMS_T2, ...ITEMS_T3, ...ITEMS_T4];

/* Lo que cada célula dejó fuera del pool, a propósito y con su razón. */
export const FUERA_DEL_POOL_CONTABILIDAD = [...FUERA_T1, ...FUERA_T2, ...FUERA_T3, ...FUERA_T4];
