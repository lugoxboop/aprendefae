/*
 * psql de reemplazo sobre PGlite, para npm run verificar. Lo invoca bin/psql.
 *
 * NO ES EL psql DE VERDAD, y conviene saber exactamente en qué se diferencia:
 *
 *   · SOPORTA SOLO lo que usa .github/workflows/base.yml: -f ARCHIVO, -c SQL,
 *     -v ON_ERROR_STOP=1, -q, -A, -t, -X, combinados (-Atc) y --version.
 *     Cualquier otra opción se ignora en silencio.
 *   · LOS META-COMANDOS (set, echo, gset…) no se ejecutan: se avisa por
 *     stderr y se saltan. Hoy ningún archivo del repositorio los usa.
 *   · PARTE LOS ARCHIVOS EN SENTENCIAS con su propio divisor, que entiende
 *     comillas, identificadores entre comillas dobles, $etiqueta$ y comentarios
 *     anidados. Un SQL raro que el psql real entienda podría partirse distinto.
 *   · LA SALIDA imita al psql real lo justo para los greps del workflow
 *     (FALLA, PASA, ERROR:). No es byte a byte igual.
 *   · Y DEBAJO NO HAY POSTGRES 16 sino PostgreSQL 18.3 en WebAssembly (PGlite).
 *
 * Lo que sí hace igual que psql, porque de eso depende el workflow:
 *   · con ON_ERROR_STOP sale con código 3 en el primer error; sin él, sigue;
 *   · -c con error sale con 1;
 *   · un error se imprime como  psql:ARCHIVO:LÍNEA: ERROR:  mensaje, con
 *     DETAIL, HINT y CONTEXT.
 *
 * La base vive en el directorio de PGLITE_DATA, así que cada invocación ve lo
 * que dejaron las anteriores, como un servidor de verdad. verificar.mjs lo
 * crea en un temporal y lo borra al terminar.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
let archivo = null;
let comando = null;
let pararEnError = false;
let sinAlinear = false;
let soloFilas = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--version" || a === "-V") {
    console.log("psql (PostgreSQL) — emulado sobre PGlite");
    process.exit(0);
  }
  if (a === "-v" || a === "--set") {
    const kv = args[++i] ?? "";
    if (/^ON_ERROR_STOP=(1|on|true)$/i.test(kv)) pararEnError = true;
    continue;
  }
  if (a.startsWith("-v") && a.length > 2) {
    if (/ON_ERROR_STOP=(1|on|true)$/i.test(a)) pararEnError = true;
    continue;
  }
  if (a === "-f") { archivo = args[++i]; continue; }
  if (a === "-c") { comando = args[++i]; continue; }
  if (/^-[AtqXc]+$/.test(a)) {
    for (const ch of a.slice(1)) {
      if (ch === "A") sinAlinear = true;
      else if (ch === "t") soloFilas = true;
      else if (ch === "c") comando = args[++i];
    }
    continue;
  }
}

const datos = process.env.PGLITE_DATA;
if (!datos) {
  console.error("psql-pglite: falta PGLITE_DATA (directorio de la base)");
  process.exit(2);
}

/* ── divisor de sentencias, con líneas ── */
function dividir(sql) {
  const out = [];
  const n = sql.length;
  let i = 0;
  let linea = 1;
  let inicio = -1;
  let lineaInicio = 0;

  while (i < n) {
    const c = sql[i];
    const d = sql[i + 1];

    if (c === "\n") { linea++; i++; continue; }
    if (inicio < 0 && /\s/.test(c)) { i++; continue; }
    if (c === "-" && d === "-") { while (i < n && sql[i] !== "\n") i++; continue; }
    if (c === "/" && d === "*") {
      let prof = 1;
      i += 2;
      while (i < n && prof > 0) {
        if (sql[i] === "\n") linea++;
        if (sql[i] === "/" && sql[i + 1] === "*") { prof++; i += 2; }
        else if (sql[i] === "*" && sql[i + 1] === "/") { prof--; i += 2; }
        else i++;
      }
      continue;
    }
    if (inicio < 0) {
      if (c === "\\") {
        const fin = sql.indexOf("\n", i);
        out.push({ meta: sql.slice(i, fin < 0 ? n : fin), linea, fin: linea });
        i = fin < 0 ? n : fin;
        continue;
      }
      inicio = i;
      lineaInicio = linea;
    }
    if (c === "'") {
      const escapes = /[eE]/.test(sql[i - 1] ?? "") && !/\w/.test(sql[i - 2] ?? "");
      i++;
      while (i < n) {
        if (sql[i] === "\n") linea++;
        if (escapes && sql[i] === "\\") { i += 2; continue; }
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { i += 2; continue; }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === '"') {
      i++;
      while (i < n && sql[i] !== '"') { if (sql[i] === "\n") linea++; i++; }
      i++;
      continue;
    }
    if (c === "$" && !/\w/.test(sql[i - 1] ?? "")) {
      const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i, i + 80));
      if (m) {
        const fin = sql.indexOf(m[0], i + m[0].length);
        const j = fin < 0 ? n : fin + m[0].length;
        for (let k = i; k < j; k++) if (sql[k] === "\n") linea++;
        i = j;
        continue;
      }
    }
    if (c === ";") {
      out.push({ sql: sql.slice(inicio, i + 1), linea: lineaInicio, fin: linea });
      inicio = -1;
      i++;
      continue;
    }
    i++;
  }
  if (inicio >= 0) {
    const resto = sql.slice(inicio).trim();
    if (resto) out.push({ sql: resto, linea: lineaInicio, fin: linea });
  }
  return out;
}

/* ── salida ── */
function valor(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "t" : "f";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function imprimir(res) {
  if (!res || !res.fields || res.fields.length === 0) return;
  const cols = res.fields.map((f) => f.name);
  const filas = res.rows.map((r) => cols.map((c) => valor(r[c])));
  if (sinAlinear && soloFilas) {
    for (const f of filas) console.log(f.join("|"));
    return;
  }
  const anchos = cols.map((c, j) => Math.max(c.length, ...filas.map((f) => f[j].length)));
  const linea = (celdas) => " " + celdas.map((x, j) => x.padEnd(anchos[j])).join(" | ");
  if (!soloFilas) {
    console.log(linea(cols));
    console.log(anchos.map((w) => "-".repeat(w + 2)).join("+"));
  }
  for (const f of filas) console.log(linea(f));
  if (!soloFilas) console.log(`(${filas.length} ${filas.length === 1 ? "fila" : "filas"})\n`);
}

function error(e, nombre, sent) {
  let lineaError = sent ? sent.fin : 0;
  const pos = Number(e.position);
  if (sent && Number.isFinite(pos) && pos > 0) {
    lineaError = sent.linea + (sent.sql.slice(0, pos - 1).match(/\n/g) ?? []).length;
  }
  const donde = nombre ? `psql:${nombre}:${lineaError}: ` : "";
  console.error(`${donde}ERROR:  ${e.message}`);
  if (e.detail) console.error(`DETAIL:  ${e.detail}`);
  if (e.hint) console.error(`HINT:  ${e.hint}`);
  if (e.where) console.error(`CONTEXT:  ${e.where}`);
  if (sent) {
    const primera = sent.sql.split("\n")[0].slice(0, 100);
    console.error(`SENTENCIA (líneas ${sent.linea}-${sent.fin}):  ${primera}${sent.sql.includes("\n") ? " …" : ""}`);
  }
}

/* ── ejecutar ── */
const db = new PGlite(datos);
await db.waitReady;
let codigo = 0;

try {
  if (comando !== null) {
    try {
      const res = await db.exec(comando);
      for (const r of res) imprimir(r);
    } catch (e) {
      error(e, null, null);
      codigo = 1;
    }
  } else if (archivo) {
    const texto = readFileSync(archivo, "utf8");
    for (const s of dividir(texto)) {
      if (s.meta) {
        console.error(`psql:${archivo}:${s.linea}: AVISO: meta-comando de psql no soportado por el emulador: ${s.meta}`);
        continue;
      }
      try {
        const res = await db.exec(s.sql);
        for (const r of res) imprimir(r);
      } catch (e) {
        error(e, archivo, s);
        if (pararEnError) { codigo = 3; break; }
      }
    }
  }
} finally {
  await db.close();
}
process.exit(codigo);
