import { FAE } from "../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CORAZÓN DE LA ECONOMÍA — LO QUE QUEDA DESPUÉS DEL RETIRO (22-nov-2026).
 *
 * Este archivo tenía el modelo de la demanda agregada (DA = C + I + G + XN,
 * con las fórmulas del profesor) y los casos del Estetoscopio. Salieron con
 * todo Macroeconomía, que se rehace desde cero (migración 0258; tabla y
 * commit de respaldo en orquestador/conocimiento/macro-2026/respaldo-retiro.md).
 *
 * QUEDA SOLO COMPONENTES, y no por Macro: lo pinta circulatorio.jsx, el dibujo
 * de la cámara que usan los marcos compartidos de los juegos (bloques/marcos.jsx),
 * de los que cuelga Contabilidad. Cada banda lleva su letra y su nombre
 * escritos, porque no puede depender solo del tono.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const COMPONENTES = [
  { id: "C",  color: FAE.teal,  nombre: "Consumo",             glosa: "lo que gastan las familias" },
  { id: "I",  color: FAE.ambar, nombre: "Inversión",           glosa: "lo que ponen las empresas" },
  { id: "G",  color: FAE.coral, nombre: "Gasto público",       glosa: "lo que gasta el Estado" },
  { id: "XN", color: FAE.node,  nombre: "Exportaciones netas", glosa: "lo que vendemos afuera menos lo que compramos" },
];
