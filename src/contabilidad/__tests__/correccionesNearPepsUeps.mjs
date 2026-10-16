/*
 * Los aciertos de `peps` y `ueps` de T7-1 A3 «Tres formas», de Near
 * (paquetes/t7-1-ap3-aciertos-peps-ueps.md, tal como llegó).
 *
 * El recorte (lote1-recortes-t71-v1.md) sigue diciendo «Así es.» en esas dos
 * pantallas; este ayudante lee la tabla del paquete y da, por pantalla, el
 * viejo y el nuevo. Falla si la tabla no trae exactamente esas dos filas.
 */
import { readFileSync } from "node:fs";

const RAIZ = new URL("../../../", import.meta.url);
export const PAQUETE_PEPS_UEPS = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-ap3-aciertos-peps-ueps.md", RAIZ), "utf8");

const FILA = /^\| P\d+ `([^`]+)` \| `acierto\.texto` \| «([^»]+)» \| «([^»]+)» \| \d+ \| [\d,]+ \|$/gm;
export const ACIERTOS_NEAR = Object.fromEntries([...PAQUETE_PEPS_UEPS.matchAll(FILA)].map(([, id, viejo, nuevo]) => [id, { viejo, nuevo }]));

if (Object.keys(ACIERTOS_NEAR).join() !== "peps,ueps") throw new Error(`el paquete de peps y ueps no trae las dos filas: ${Object.keys(ACIERTOS_NEAR)}`);
