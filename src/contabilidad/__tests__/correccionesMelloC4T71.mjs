import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * Auditoría de Mello del patrón de enganche C4 (orquestador/conocimiento/
 * paquetes/auditoria-mello-patron-c4.md), para T7-1 H4 y H6 (las que no
 * montan el motor, precedente de #424). Las pruebas aplican estas
 * correcciones; cada texto de aquí está literal en la auditoría (deMello).
 *   · C4-1  mientras se escribe, la figura solo muestra la cifra
 *   · C4-3  H6 · iva-reversa y retencion-reversa: la frase de Mello
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AUDITORIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/auditoria-mello-patron-c4.md", import.meta.url), "utf8");

export function deMello(texto) {
  if (!AUDITORIA.includes(texto)) throw new Error(`no está en la auditoría de Mello: «${texto}»`);
  return texto;
}

const fila = (pieza) => AUDITORIA.split("\n").find((l) => l.startsWith(`| ${pieza}`));
const filaH6 = deMello(fila("T7-1 H6 · iva-reversa y retencion-reversa"));
export const C4_3_H6 = {
  distractores: [1_088_000, 238_000],
  hoy: ["128 % de lo devuelto", "28 %"].map(deMello),
  iva: filaH6.match(/\| «([^»]+)», y la misma idea/)[1],
};

deMello("no puede contener `c4-cuadra`, `c4-falla` ni ` mal`");
export const C4_1_PROHIBIDO = ["c4-cuadra", "c4-falla", " mal", "data-c4-linea"];
deMello("ninguna figura muestra montos negativos ni unidades fraccionarias");
