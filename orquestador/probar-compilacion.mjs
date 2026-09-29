#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cargarConocimiento, sistemaPara } from "./src/conocimiento.js";
import { crearHerramientas, raizDelRepo } from "./src/herramientas.js";
import { transporteReal } from "./src/transporte.js";
import { ROLES, instruccionDeRuta } from "./src/roles.js";
import { leerRuta, cuerpoSinRuta } from "./src/ruta.js";
import { Contador } from "./src/topes.js";
import { Registro, carpetaDeCorrida } from "./src/registro.js";
import { cargarClave, comoArreglarlo } from "./src/clave.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANCO DE PRUEBAS DE LA COMPILACIÓN.
 *
 * Corre SOLO el paso de compilación contra encargos reales cuyo defecto ya se
 * conoce, y dice si lo encontró. Es lo único que puede contestar la pregunta
 * que importa antes de confiar en la cadena entera: ¿este paso caza los
 * errores que de verdad han llegado a producción, o solo reescribe documentos
 * con buena letra?
 *
 * ═══════════ CÓMO SE CALIFICA, Y QUÉ NO PRUEBA ═══════════
 *
 * Cada caso declara «señales»: cosas que el hallazgo tiene que mencionar. Se
 * comprueba que estén. Eso es crudo y hay que decirlo: un texto puede contener
 * «235» y estar diciendo una tontería alrededor. La señal detecta que MIRÓ
 * donde había que mirar; que lo haya entendido lo juzga quien lea la salida,
 * que se guarda entera.
 *
 * Lo que sí prueba de verdad: si el hallazgo NO está, el paso no sirve. Un
 * suspenso aquí es información dura; un aprobado es una invitación a leer.
 *
 * ═══════════ ESTO GASTA DINERO ═══════════
 *
 * Cada caso es una llamada al modelo capaz con herramientas. Se imprime el
 * costo real al final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = raizDelRepo(path.join(AQUI, "src"));
const CASOS = path.join(AQUI, "pruebas", "compilacion");

const __clave = cargarClave();
if (!__clave.ok) {
  console.error(`${comoArreglarlo(__clave)}
`);
  console.error("Este banco corre contra el modelo de verdad: es lo único que");
  console.error("contesta si la compilación caza los errores o solo reescribe.\n");
  process.exit(1);
}

const soloEste = process.argv[2] ?? null;

const casos = fs.readdirSync(CASOS)
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const id = path.basename(f, ".json");
    return {
      id,
      esperado: JSON.parse(fs.readFileSync(path.join(CASOS, f), "utf8")),
      encargo: fs.readFileSync(path.join(CASOS, `${id}.md`), "utf8"),
    };
  })
  .filter((c) => !soloEste || c.id === soloEste);

if (casos.length === 0) {
  console.error(soloEste ? `No hay ningún caso «${soloEste}».` : "No hay casos.");
  process.exit(1);
}

const transporte = await transporteReal();
const conocimiento = cargarConocimiento({ materia: "contabilidad" });
const carpeta = carpetaDeCorrida(AQUI);
const registro = new Registro(carpeta, `banco de pruebas de la compilación (${casos.length} casos)`);
const contador = new Contador();
const definicion = ROLES.compilacion;

console.log(`\n◆ Banco de pruebas de la compilación — ${casos.length} caso(s)`);
console.log(`Registro: ${path.relative(process.cwd(), carpeta)}\n`);

const resultados = [];

for (const caso of casos) {
  /*
   * El tope se mira ANTES de cada caso. La primera corrida real se fue a siete
   * dólares porque este banco contaba el gasto y no lo miraba nunca: el
   * contador existía, el límite existía, y nadie los puso a hablar.
   */
  const pasado = contador.motivoParaParar();
  if (pasado) {
    console.log(`⏹  ${pasado}`);
    console.log("   Los casos que faltan no se corrieron.\n");
    registro.parada("detenido-por-tope", pasado);
    break;
  }

  process.stdout.write(`→ ${caso.esperado.nombre}\n`);

  const herramientas = crearHerramientas(REPO, {
    alViolar: (v) => registro.parada("violacion-de-escritura", v),
  });

  const entrada = [
    "# El material a compilar",
    "",
    caso.encargo,
    "",
    "# Qué se te pide",
    "",
    "Compílalo en un encargo maestro, verificando contra el repositorio todo lo",
    "que sea verificable. Usa tus herramientas: no des por cierta una afirmación",
    "comprobable sin comprobarla.",
    instruccionDeRuta("compilacion"),
  ].join("\n");

  let respuesta;
  try {
    respuesta = await transporte.enviar({
      modelo: definicion.modelo,
      esfuerzo: definicion.esfuerzo,
      sistema: sistemaPara(conocimiento, "compilacion"),
      mensajes: [{ role: "user", content: entrada }],
      herramientas,
    });
  } catch (e) {
    console.log(`   ✖ se cayó: ${e.message}\n`);
    resultados.push({ caso, error: e.message });
    continue;
  }

  contador.anotarUso(definicion.modelo, respuesta.uso);
  const ruta = leerRuta(respuesta.texto);
  const cuerpo = cuerpoSinRuta(respuesta.texto);
  registro.salto({
    rol: "compilacion",
    modelo: definicion.modelo,
    entrada,
    salida: respuesta.texto,
    ruta,
    uso: respuesta.uso,
  });
  fs.writeFileSync(path.join(carpeta, `${caso.id}.md`), cuerpo, "utf8");

  /* Qué herramientas usó: si no usó ninguna, no verificó nada contra nada. */
  const usadas = [...new Set(respuesta.pasosDeHerramienta.map((p) => p.herramienta))];
  const enMinusculas = cuerpo.toLowerCase();

  const hallazgos = caso.esperado.queDebeEncontrar.map((q) => ({
    ...q,
    encontrado: q.senales.every((s) => enMinusculas.includes(s.toLowerCase())),
    faltan: q.senales.filter((s) => !enMinusculas.includes(s.toLowerCase())),
  }));

  for (const h of hallazgos) {
    console.log(`   ${h.encontrado ? "✔" : "✖"} ${h.descripcion}`);
    if (!h.encontrado) console.log(`      no menciona: ${h.faltan.join(", ")}`);
  }
  console.log(`   herramientas usadas: ${usadas.length ? usadas.join(", ") : "NINGUNA"}`);
  console.log(`   ruta declarada: ${ruta.destino ?? `(ilegible: ${ruta.error})`}`);
  console.log(`   salida completa: ${path.relative(process.cwd(), path.join(carpeta, `${caso.id}.md`))}\n`);

  resultados.push({ caso, hallazgos, usadas, ruta, cuerpo });
}

/* ───────────────────── el veredicto ───────────────────── */

const conHallazgos = resultados.filter((r) => r.hallazgos);
const todos = conHallazgos.flatMap((r) => r.hallazgos);
const encontrados = todos.filter((h) => h.encontrado).length;
const gasto = contador.resumen();

console.log("───────────────────────────────────────");
console.log(`Hallazgos esperados: ${encontrados} de ${todos.length}`);
const sinHerramientas = conHallazgos.filter((r) => r.usadas.length === 0);
if (sinHerramientas.length) {
  console.log(`⚠  ${sinHerramientas.length} caso(s) no usaron ninguna herramienta: no verificaron nada.`);
}
console.log(`Costo real: $${gasto.dolares.toFixed(2)} · ${gasto.saltos} llamada(s) · ${gasto.minutos} min`);
if (gasto.tokens.cacheLectura > 0) {
  console.log(`Caché: ${gasto.tokens.cacheLectura.toLocaleString("es")} tokens leídos.`);
}
console.log("");
console.log("Un ✔ dice que miró donde había que mirar, no que lo entendiera.");
console.log("Lee las salidas completas antes de dar el paso por bueno.\n");

process.exit(encontrados === todos.length ? 0 : 1);
