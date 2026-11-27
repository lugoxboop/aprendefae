/*
 * Para las pruebas y el video de evidencia: la clave de cada cosa que una
 * partida puede pedir, sacada de los mismos textos que juega la pieza.
 * No es una prueba (no termina en .test.mjs).
 */
import { PIEZAS_TEXTO_GP } from "../etiquetas.js";

export function solucionario() {
  const claves = {};
  const ordenes = {};
  const frases = {};
  const rieles = {};
  let posiciones = [];
  const ponDecidir = (x) => { if (x.id && x.clave) claves[x.id] = x.clave; };
  const ponOrden = (m) => { ordenes[m.id] = m.items.map((x) => x.id); };
  for (const p of PIEZAS_TEXTO_GP) {
    for (const e of p.etapas) {
      for (const x of e.banco ?? []) ponDecidir(x);
      if (e.despues) (e.despues.tipo === "ordenar" ? ponOrden : ponDecidir)(e.despues);
      for (const m of e.pasos ?? []) {
        if (m.tipo === "ordenar") ponOrden(m);
        else if (m.items) m.items.forEach(ponDecidir);
        else if (m.opciones) continue;
        else ponDecidir(m);
      }
      for (const r of e.rieles ?? []) rieles[r.id] = r.clave;
      for (const f of e.frases ?? []) frases[f.id] = f.error;
      if (e.posiciones) posiciones = e.posiciones.map((x) => x.id);
    }
  }
  return { claves, ordenes, frases, rieles, posiciones };
}

/* Una respuesta que NO es la clave, para jugar un error a propósito. */
export function otraDe(destinos, clave) {
  return destinos.find((d) => d !== clave);
}
