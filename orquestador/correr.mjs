#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cargarConocimiento } from "./src/conocimiento.js";
import { cargarCatalogo, interpretar } from "./src/interprete.js";
import { correrCadena, encargoDe, MOTIVOS } from "./src/orquestador.js";
import { Registro, carpetaDeCorrida } from "./src/registro.js";
import { crearHerramientas, raizDelRepo } from "./src/herramientas.js";
import { transporteReal, transporteSimulado } from "./src/transporte.js";
import { MODELO_CAPAZ } from "./src/roles.js";
import { TOPES } from "./src/topes.js";
import { cargarClave, comoArreglarlo } from "./src/clave.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA LÍNEA DE COMANDOS.
 *
 * El tablero viene después. Esta versión existe para probar lo caro y lo
 * riesgoso —la ruta y la compilación— sin gastar tiempo en interfaz: si la
 * cadena no sirve, un tablero bonito encima no la arregla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = raizDelRepo(path.join(AQUI, "src"));

const argumentos = process.argv.slice(2);
const simulado = argumentos.includes("--simulado");
const orden = argumentos.filter((a) => !a.startsWith("--")).join(" ").trim();

if (!orden) {
  console.error("Falta la orden.\n");
  console.error('  node correr.mjs "Gen, crea la pieza 5 del tema 1 de contabilidad"');
  console.error('  node correr.mjs --simulado "…"   (no toca la red, no gasta)\n');
  process.exit(1);
}

if (!simulado) {
  const clave = cargarClave();
  if (!clave.ok) {
    console.error(`${comoArreglarlo(clave)}\n`);
    console.error("No hay autenticación por suscripción: la documentación del Agent SDK");
    console.error("dice que el login de claude.ai no está permitido para productos");
    console.error("construidos sobre él, y esta herramienta llama a la API directamente.\n");
    console.error('Para ver la forma de una corrida sin gastar:  node correr.mjs --simulado "…"');
    process.exit(1);
  }
  console.log(`Clave: leída del ${clave.origen}, ${clave.largo} caracteres.`);
}

const carpeta = carpetaDeCorrida(AQUI);
const registro = new Registro(carpeta, orden);

console.log(`\n${simulado ? "◇ SIMULADO — no toca la red" : "◆ EN VIVO"}`);
console.log(`Orden: ${orden}`);
console.log(`Registro: ${path.relative(process.cwd(), carpeta)}\n`);

const catalogo = await cargarCatalogo(REPO);

/*
 * El guion simulado no inventa contenido: devuelve un esqueleto que declara la
 * ruta. Sirve para ver POR DÓNDE pasa la cadena, nunca para juzgar lo que
 * produciría un agente de verdad.
 *
 * El primer turno es la respuesta al intérprete, y va en JSON porque es lo que
 * el intérprete pide. Se toma la primera materia y el primer tema del catálogo
 * real, no unos inventados: así el modo simulado también ejercita la
 * validación contra el catálogo en vez de saltársela.
 */
function guionSimulado(peticion, i) {
  if (i === 0) {
    const m = catalogo[0];
    return JSON.stringify({
      entendida: true,
      materia: m.id,
      tema: m.temas[0].id,
      agente: "gen",
      tarea: "(simulado) lo que pidiera la orden",
      pieza: "pieza simulada",
    });
  }
  const destino = i === 1 ? "levi" : i === 2 ? "compilacion" : "entregar";
  return [
    `(simulado) Turno ${i}. Aquí iría lo que produjera el agente de verdad.`,
    "",
    `SIGUIENTE: ${destino}`,
    "PORQUE: guion de prueba, no una decisión real",
  ].join("\n");
}

const transporte = simulado ? transporteSimulado(guionSimulado) : await transporteReal();

/* ───────────────────── 1 · entender la orden ───────────────────── */

const leida = await interpretar({ orden, catalogo, transporte, modelo: MODELO_CAPAZ });

if (!leida.entendida) {
  registro.pregunta(leida.pregunta);
  console.log("⏸  La cadena no arrancó: falta un dato.\n");
  console.log(`   ${leida.pregunta}\n`);
  console.log("   Contéstalo y vuelve a correrla. No se gastó nada más.\n");
  process.exit(0);
}

console.log(`Materia: ${leida.materia}`);
console.log(`Tema:    ${leida.tema} — ${leida.tituloDelTema}`);
console.log(`Arranca: ${leida.agente}`);
console.log(`Tarea:   ${leida.tarea}\n`);

/* ───────────────────── 2 · correr la cadena ───────────────────── */

const conocimiento = cargarConocimiento({ materia: leida.materia });
if (conocimiento.vocabulario && conocimiento.vocabulario.texto === null) {
  console.log(`⚠  No hay vocabulario visual registrado para «${leida.materia}».`);
  console.log("   La cadena corre igual, pero nadie puede comprobar que un signo");
  console.log("   nuevo no choque con otro que ya significa algo.\n");
}

const herramientas = crearHerramientas(REPO, {
  alViolar: (v) => registro.parada("violacion-de-escritura", v),
});

const resultado = await correrCadena({
  orden: `${leida.tarea}\n\nMateria: ${leida.materia}. Tema: ${leida.tema} («${leida.tituloDelTema}»).`,
  arranque: leida.agente,
  pieza: leida.pieza,
  conocimiento,
  transporte,
  registro,
  herramientas,
  topes: TOPES,
});

/* ───────────────────── 3 · el entregable ───────────────────── */

console.log(registro.resumenLegible());
console.log("");

const gasto = resultado.contador.resumen();
console.log(`Saltos: ${gasto.saltos} · ${gasto.minutos} min · $${gasto.dolares.toFixed(2)}`);
if (gasto.tokens.cacheLectura > 0) {
  console.log(`Caché: ${gasto.tokens.cacheLectura.toLocaleString("es")} tokens leídos de caché.`);
} else if (!simulado && gasto.saltos > 1) {
  /* Si nunca se lee de caché, algo la está invalidando en cada llamada. */
  console.log("⚠  No se leyó nada de caché en toda la corrida: algo invalida el prefijo.");
}
console.log("");

const encargo = encargoDe(resultado);
if (encargo) {
  const archivo = path.join(carpeta, "encargo.md");
  fs.writeFileSync(archivo, encargo, "utf8");
  console.log("✔ Encargo maestro compilado:");
  console.log(`  ${path.relative(process.cwd(), archivo)}\n`);
  console.log("  Cópialo y pégalo en tu sesión de construcción. Esta versión no");
  console.log("  se lo manda a nadie: eso es la fase 2.\n");
} else {
  console.log(`✖ No hubo encargo. Motivo: ${resultado.motivo}`);
  if (resultado.detalle) console.log(`  ${resultado.detalle}`);
  if (resultado.motivo === MOTIVOS.detenidoPorTope) {
    console.log("\n  Queda bloqueado para revisión. El registro tiene cada salto.");
  }
  console.log("");
}
