/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS SONDAS, SOLAS, EN CADA PR (#581).
 *
 * Levi: «una guardia estática que atrapa el literal más una sonda que no corre
 * sola deja exactamente el caso que ya nos pasó cuatro veces esta noche». El
 * teal que llega por una variable (`color: acento`) no lo ve ninguna prueba de
 * texto: solo lo ve la sonda de contraste, que mide lo pintado. Y la ficha de
 * FP que tapa un control solo la ve ficha-tapa. Hasta hoy las dos se corrían a
 * mano, cuando alguien se acordaba.
 *
 * Esto corre, para UN tema (lo que hace una celda de la matriz del flujo
 * `sondas.yml`) o para todos (`--todas`, a mano), a 320 y a 375:
 *   - contraste.mjs en Aprender,
 *   - contraste.mjs --hacer --partidas (los juegos, no solo el camino),
 *   - ficha-tapa.mjs en Hacer.
 *
 * ═══════════ EL TRINQUETE ═══════════
 *
 * Hoy hay fallos (el teal de los 87 sitios, entre otros), así que «cero» no
 * puede ser la vara el primer día: se pondría rojo todo. La vara es
 * scripts/sondas/linea-base.json: por tema, sonda y ancho, cuántos fallos hay
 * hoy. Un PR que SUBE cualquiera de esos números se pone rojo; bajarlo está
 * bien, y quien lo baja actualiza la línea base en su PR. Sin entrada en la
 * línea base, la celda solo informa: así entra un tema nuevo.
 *
 * «NO MEDIDO» (la sonda no llegó a la pantalla) no es un cero: sale escrito y
 * marcado, y si la línea base sí tenía número, se pone rojo, porque algo que
 * se medía dejó de medirse.
 *
 * Uso:
 *   PUERTO=8099 node scripts/sondas/ci.mjs --materia contabilidad --tema "Las cuentas, el debe y el haber"
 *   PUERTO=8099 node scripts/sondas/ci.mjs --todas --salida /tmp/sondas
 *   node scripts/sondas/ci.mjs --juntar /tmp/sondas   # imprime la línea base nueva
 * (con el paquete construido y servido en PUERTO; ver sondas.yml)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve, join } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const BASE = join(RAIZ, "scripts/sondas/linea-base.json");
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const ANCHOS = [320, 375];
const SONDAS = [
  { id: "contraste-aprender", script: "scripts/contraste.mjs", extra: [] },
  { id: "contraste-hacer", script: "scripts/contraste.mjs", extra: ["--hacer", "--partidas"] },
  { id: "ficha-tapa", script: "scripts/ficha-tapa.mjs", extra: [] },
];

const clave = (materia, tema, sonda, ancho) => `${materia}|${tema}|${sonda}|${ancho}`;
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ═══════════ juntar: de los resultados a la línea base ═══════════ */
if (process.argv.includes("--juntar")) {
  const dir = arg("--juntar");
  const base = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    for (const r of JSON.parse(readFileSync(join(dir, f), "utf8"))) if (r.fallos != null) base[clave(r.materia, r.tema, r.sonda, r.ancho)] = r.fallos;
  }
  console.log(JSON.stringify(Object.fromEntries(Object.entries(base).sort()), null, 2));
  process.exit(0);
}

/* ═══════════ qué temas ═══════════ */
const { SUBJECTS, temasVisibles } = await import(join(RAIZ, "src/data/subjects.js"));
let temas;
if (process.argv.includes("--todas")) {
  temas = Object.entries(SUBJECTS).flatMap(([id, m]) => temasVisibles(m).map((t) => ({ materia: id, nombreMateria: m.name, tema: t.title })));
} else {
  const materia = arg("--materia");
  const tema = arg("--tema");
  if (!materia || !tema || !SUBJECTS[materia]) { console.error("Falta --materia <id> y --tema <título>, o --todas."); process.exit(64); }
  temas = [{ materia, nombreMateria: SUBJECTS[materia].name, tema }];
}
if (process.argv.includes("--lista")) {
  console.log(JSON.stringify(temas.map(({ materia, tema }) => ({ materia, tema }))));
  process.exit(0);
}

const base = existsSync(BASE) ? JSON.parse(readFileSync(BASE, "utf8")) : {};
const salida = arg("--salida") ?? join(RAIZ, "sondas-resultado");
mkdirSync(salida, { recursive: true });

function correr(script, args, env) {
  return new Promise((ok) => {
    const hijo = spawn(process.execPath, [join(RAIZ, script), ...args], { cwd: RAIZ, env: { ...process.env, ...env } });
    let texto = "";
    hijo.stdout.on("data", (d) => { texto += d; });
    hijo.stderr.on("data", (d) => { texto += d; });
    const tope = setTimeout(() => hijo.kill("SIGKILL"), 15 * 60 * 1000);
    hijo.on("close", (codigo) => { clearTimeout(tope); ok({ codigo, texto }); });
  });
}

/* ═══════════ medir ═══════════ */
const filas = [];
for (const t of temas) {
  for (const s of SONDAS) {
    for (const ancho of ANCHOS) {
      const inicio = Date.now();
      const { codigo, texto } = await correr(s.script, [t.tema, String(ancho), ...s.extra], { MATERIA: t.nombreMateria });
      const m = texto.match(/^(\d+) (?:texto|elemento)\(s\)/m);
      const noMedido = codigo === 2 || /NO MEDIDO/.test(texto) || !m;
      const fallos = noMedido ? null : Number(m[1]);
      /* Cuántas pantallas miró: un cero sobre pocas pantallas dice poco, y se escribe al lado. */
      const p = texto.match(/en (\d+) pantalla\(s\)/) ?? texto.match(/Pantallas CON ficha: (\d+)/);
      const pantallas = p ? Number(p[1]) : null;
      const k = clave(t.materia, t.tema, s.id, ancho);
      const antes = k in base ? base[k] : undefined;
      let veredicto;
      if (antes === undefined) veredicto = noMedido ? "no medido (sin línea base)" : "informa (sin línea base)";
      else if (noMedido) veredicto = "ROJO: dejó de medirse";
      else if (fallos > antes) veredicto = `ROJO: sube de ${antes} a ${fallos}`;
      else if (fallos < antes) veredicto = `baja de ${antes} a ${fallos}: actualiza la línea base`;
      else veredicto = "igual";
      const fila = { materia: t.materia, tema: t.tema, sonda: s.id, ancho, fallos, pantallas, antes: antes ?? null, veredicto, segundos: Math.round((Date.now() - inicio) / 1000) };
      filas.push(fila);
      console.log(`${veredicto.startsWith("ROJO") ? "✗" : "·"} ${t.tema} · ${s.id} · ${ancho}px → ${fallos ?? "NO MEDIDO"} en ${pantallas ?? "?"} pantallas (antes ${antes ?? "—"}) · ${veredicto} · ${fila.segundos}s`);
      if (process.env.GITHUB_ACTIONS && veredicto.startsWith("ROJO")) console.log(`::error title=${s.id} ${ancho}px · ${t.tema}::${veredicto}`);
      if (veredicto.startsWith("ROJO") || process.env.SONDAS_DETALLE) console.log(texto.split("\n").slice(-40).map((l) => "    " + l).join("\n"));
    }
  }
}

const archivo = join(salida, `${temas.length === 1 ? `${temas[0].materia}-${slug(temas[0].tema)}` : "todas"}.json`);
writeFileSync(archivo, JSON.stringify(filas, null, 2));

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = ["| Tema | Sonda | Ancho | Fallos | Pantallas | Línea base | Veredicto |", "|---|---|---|---|---|---|---|",
    ...filas.map((f) => `| ${f.tema} | ${f.sonda} | ${f.ancho} | ${f.fallos ?? "NO MEDIDO"} | ${f.pantallas ?? "?"} | ${f.antes ?? "—"} | ${f.veredicto} |`)].join("\n");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${md}\n`);
}
process.exit(filas.some((f) => f.veredicto.startsWith("ROJO")) ? 1 : 0);
