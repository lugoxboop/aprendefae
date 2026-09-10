/*
 * ═══════════════════════════════════════════════════════════════════════════
 * npm run verificar — el workflow «Pruebas» ejecutado aquí, antes de subir.
 *
 * ═══════════ PARA QUÉ EXISTE ═══════════
 *
 * Para correrlo ANTES DE CADA PUSH. No en vez del CI: EL VEREDICTO QUE MANDA
 * ES EL DE GITHUB ACTIONS. Esto sirve para que un fallo se vea aquí, con su
 * archivo y su línea, antes de que llegue allí.
 *
 * Y existe por una razón concreta: tres fallos llegaron a producción —el ×100,
 * las dos firmas vivas de registrar_fp, la columna ambigua de panel_actividad—
 * y la causa común fue SQL que nadie había ejecutado. Se verificaba todo
 * alrededor menos la cosa. Sin una forma de ejecutar SQL en esta máquina, esa
 * causa vuelve.
 *
 * ═══════════ QUÉ HACE ═══════════
 *
 * Lee .github/workflows/base.yml y ejecuta cada paso `run:` TAL CUAL, con el
 * mismo shell que GitHub —bash --noprofile --norc -eo pipefail—, el entorno
 * de cada job, y `psql` y `pg_isready` sustituidos por los de bin/, que corren
 * sobre PGlite. No reimplementa los pasos: si la lógica de un paso está mal,
 * falla aquí igual que allí. Así se reprodujo el primer rojo del workflow, que
 * moría mudo por la -e que GitHub añade a cada paso.
 *
 *   npm run verificar                    los dos jobs
 *   npm run verificar -- base-de-datos   solo migraciones y pruebas SQL
 *   npm run verificar -- javascript      solo pruebas JS y build
 *
 * Tarda unos cuatro minutos. Sale con código distinto de cero si algo falla.
 *
 * ═══════════ QUÉ **NO** REPRODUCE, Y POR TANTO EN QUÉ NO CONFIAR ═══════════
 *
 * La misma disciplina que el auth de mentira: si no se escribe, alguien va a
 * suponer que sí.
 *
 *  1. NO ES POSTGRES 16. PGlite es PostgreSQL 18.3 compilado a WebAssembly
 *     (versión 0.5.8, fijada en package.json). CI y Supabase usan 16. Algo que
 *     dependa de la versión —una función que solo existe en 18, un cambio de
 *     comportamiento, un mensaje de error distinto— puede pasar aquí y fallar
 *     allí. Por eso manda Actions. Si se sube la versión de PGlite, hay que
 *     mirar qué Postgres trae y corregir este párrafo.
 *
 *  2. EL psql ES UNA EMULACIÓN escrita para este proyecto (psql-pglite.mjs).
 *     Soporta lo que usa base.yml y nada más: -f, -c, -v ON_ERROR_STOP=1, -q,
 *     -A, -t, --version. Los meta-comandos (\set, \echo…) los avisa y los salta.
 *     Parte los archivos en sentencias con su propio divisor; un SQL raro que
 *     el psql real entienda podría partirse distinto. Su formato de salida
 *     imita al real lo justo para los greps del workflow.
 *
 *  3. NO HAY RUNNER DE GITHUB. Los pasos `uses:` (checkout, setup-node) se
 *     saltan: se usan el Node y el node_modules de esta máquina. `npm ci` NO se
 *     ejecuta —reinstalaría node_modules desde el lockfile—, así que un lockfile
 *     roto o una dependencia que falte en él pasa aquí y falla allí.
 *
 *  4. NO HAY SERVICIO DE POSTGRES. pg_isready siempre encuentra la base: los
 *     pasos que comprueban el arranque aquí no prueban nada.
 *
 *  5. Todo lo que el auth de mentira declara que no reproduce —ver
 *     supabase/ci/00_auth_de_mentira.sql— tampoco se reproduce aquí.
 *
 * La base vive en un directorio temporal que se borra al terminar: cada
 * ejecución empieza de cero, como en CI.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, writeFileSync, rmSync, mkdtempSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import YAML from "yaml";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "..", "..");
const BIN = path.join(AQUI, "bin");

/*
 * En Windows hace falta el bash de Git, y no cualquiera: el `bash` que Windows
 * trae es el de WSL, que corre en otro sistema de archivos y no ve este Node.
 */
function elegirBash() {
  if (process.platform !== "win32") return "bash";
  const git = "C:/Program Files/Git/bin/bash.exe";
  if (existsSync(git)) return git;
  console.error("verificar: no encuentro el bash de Git for Windows en " + git);
  console.error("           (el bash de WSL no sirve: no ve el Node ni los archivos de esta máquina).");
  process.exit(2);
}
const BASH = elegirBash();

const flujo = YAML.parse(readFileSync(path.join(REPO, ".github/workflows/base.yml"), "utf8"));
const pedidos = process.argv.slice(2);
const desconocidos = pedidos.filter((p) => !(p in flujo.jobs));
if (desconocidos.length) {
  console.error(`verificar: no existe el job ${desconocidos.join(", ")}. Hay: ${Object.keys(flujo.jobs).join(", ")}`);
  process.exit(2);
}
const jobs = Object.entries(flujo.jobs).filter(([id]) => pedidos.length === 0 || pedidos.includes(id));

const resumen = [];
let rojo = false;

for (const [id, job] of jobs) {
  console.log(`\n████ JOB ${id} — ${job.name ?? ""}`);
  const temporal = mkdtempSync(path.join(tmpdir(), "aprendefae-verificar-"));
  const datos = path.join(temporal, "base");
  const guion = path.join(temporal, "paso.sh");

  const entorno = {
    ...process.env,
    ...(job.env ?? {}),
    PGLITE_DATA: datos,
    PATH: `${BIN}${path.delimiter}${process.env.PATH}`,
  };

  let estadoJob = "verde";
  try {
    for (const paso of job.steps) {
      const nombre = paso.name ?? paso.uses ?? paso.run?.split("\n")[0];
      if (paso.uses) {
        console.log(`\n──── ${nombre}  (se salta: acción de GitHub ${paso.uses})`);
        continue;
      }
      if (/^\s*npm ci\s*$/.test(paso.run)) {
        console.log(`\n──── ${nombre}  (se salta: reinstalaría node_modules desde el lockfile)`);
        continue;
      }
      console.log(`\n──── ${nombre}`);
      writeFileSync(guion, paso.run.replace(/\r\n/g, "\n"));
      const t0 = Date.now();
      const r = spawnSync(BASH, ["--noprofile", "--norc", "-eo", "pipefail", guion], {
        cwd: REPO,
        env: entorno,
        stdio: "inherit",
      });
      const s = ((Date.now() - t0) / 1000).toFixed(1);
      if (r.status !== 0) {
        console.log(`\n✘ «${nombre}» terminó con código ${r.status ?? r.signal} (${s} s). GitHub pararía el job aquí.`);
        estadoJob = `ROJO en «${nombre}»`;
        rojo = true;
        break;
      }
      console.log(`✔ «${nombre}» (${s} s)`);
    }
  } finally {
    rmSync(temporal, { recursive: true, force: true });
  }
  resumen.push(`  ${estadoJob === "verde" ? "✔" : "✘"} ${id}: ${estadoJob}`);
}

console.log("\n══════════════════════ VERIFICACIÓN LOCAL ══════════════════════");
console.log(resumen.join("\n"));
console.log(
  [
    "",
    rojo ? "EN ROJO. Arréglalo antes de subir." : "EN VERDE aquí.",
    "",
    "Esto es un ensayo, no el veredicto: el que manda es GitHub Actions.",
    "Aquí es PostgreSQL 18.3 (allí 16), el psql es una emulación y no hay runner",
    "de GitHub. Ver la cabecera de scripts/verificar/verificar.mjs.",
  ].join("\n"),
);
process.exit(rojo ? 1 : 0);
