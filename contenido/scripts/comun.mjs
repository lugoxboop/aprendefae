// Utilidades comunes de los scripts de contenido/. Sin dependencias: Node 20+ (fetch nativo).
// Las claves solo se leen del entorno; nunca se imprimen ni se escriben en disco.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ESTUDIO = path.join(RAIZ, "estudio");

export function clave(nombre) {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta ${nombre} en el entorno (es un secreto de GitHub Actions; nunca va en el repo).`);
  return v;
}

export async function pide(url, opciones = {}, { reintentos = 2 } = {}) {
  for (let intento = 0; ; intento++) {
    const r = await fetch(url, opciones);
    if (r.ok) return r;
    const cuerpo = (await r.text()).slice(0, 400);
    if (intento >= reintentos || (r.status < 500 && r.status !== 429)) {
      throw new Error(`${opciones.method || "GET"} ${url.split("?")[0]} → ${r.status}: ${cuerpo}`);
    }
    await new Promise((ok) => setTimeout(ok, 2000 * (intento + 1)));
  }
}

export const leeJSON = (f, def = null) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : def);
export const escribeJSON = (f, d) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };

/* Hora real de Bogotá, para la bitácora y los registros. */
export const ahoraBogota = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" }).format(new Date());

/* Anota una línea en el registro del día (contenido/registro/AAAA-MM.md). */
export function registra(linea) {
  const mes = ahoraBogota().slice(0, 7);
  const f = path.join(RAIZ, "registro", `${mes}.md`);
  if (!fs.existsSync(f)) fs.writeFileSync(f, `# Registro de contenido — ${mes}\n\n`);
  fs.appendFileSync(f, `- ${ahoraBogota()} — ${linea}\n`);
  console.log(linea);
}

/* Aviso visible en el resumen de GitHub Actions. */
export const aviso = (msg) => console.log(process.env.GITHUB_ACTIONS ? `::warning::${msg}` : `AVISO: ${msg}`);
