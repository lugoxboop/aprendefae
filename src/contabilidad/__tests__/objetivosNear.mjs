import { readFileSync } from "node:fs";

/*
 * Lote O · los objetivos de Near (orquestador/conocimiento/paquetes/
 * lote-o-objetivos.md), tal como llegaron: id del Hacer → oración, sin las
 * comillas «» de la tabla. El paquete no se toca; si la tabla no trae sus 20
 * filas (o repite un id), esto falla al cargar.
 */

const PAQUETE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/lote-o-objetivos.md", import.meta.url), "utf8");

const FILA = /^\| `([a-z0-9-]+)` \| «(.+)» \| \d+,\d \|$/;

const filas = PAQUETE.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("| `"));
const OBJETIVOS = {};
for (const l of filas) {
  const m = FILA.exec(l);
  if (!m) throw new Error(`objetivosNear: fila que no se entiende: ${l}`);
  if (m[1] in OBJETIVOS) throw new Error(`objetivosNear: id repetido: ${m[1]}`);
  OBJETIVOS[m[1]] = m[2];
}
if (Object.keys(OBJETIVOS).length !== 20) {
  throw new Error(`objetivosNear: la tabla trae ${Object.keys(OBJETIVOS).length} filas, no 20`);
}

export const OBJETIVOS_NEAR = Object.freeze(OBJETIVOS);
