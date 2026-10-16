import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * B4 · EL ACIERTO EN CONTABILIDAD NO VA EN TEAL.
 *
 * En esta materia el teal es el DEBE y el ámbar es el HABER: son los dos
 * lados de la partida doble, no un veredicto. Si el acierto también se pinta
 * de teal, el color deja de significar «debe» y pasa a significar dos cosas
 * a la vez, que es lo mismo que no significar ninguna. El acierto va en el
 * neutro de la casa (FAE.text).
 *
 * Esta guardia es textual a propósito: busca el PATRÓN —teal decidido por un
 * estado de acierto en el mismo renglón— en todas las piezas de Contabilidad,
 * no en las cinco que arreglé a mano. Quien escriba la sexta se entera aquí.
 * (Que el archivo además compile lo cubre todo-compila.test.mjs.)
 *
 * Lo que NO prohíbe: teal como DEBE, como botón primario o como progreso, y
 * el teal de debeHaber/EnUnaFrase.jsx, donde teal y ámbar son los dos lados
 * de la frase y no la calificación de nadie.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CARPETAS = [
  "src/components/mecanicas/libros",
  "src/components/t4",
  "src/components/repasoCap5",
];
/* El estado de acierto, como lo nombran las piezas. */
const ACIERTO = /"correcta"|'correcta'|\bcorrecto\b|\besLaBuena\b|\bacierto\b|\bbien\b|\.ok\b/;
const TEAL = /FAE\.teal/;

/** Todos los .jsx de una carpeta y sus subcarpetas. */
function jsx(dir) {
  const salida = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) salida.push(...jsx(p));
    else if (e.name.endsWith(".jsx")) salida.push(p);
  }
  return salida;
}

const ARCHIVOS = CARPETAS.flatMap(jsx);

/* Una excepción, nombrada y con su razón: ahí el teal es el DEBE de la frase. */
const EXCEPCIONES = new Set(["src/components/mecanicas/libros/debeHaber/EnUnaFrase.jsx"]);

test("★★★ B4: ninguna pieza de Contabilidad pinta el acierto en teal", () => {
  /* Si la búsqueda se queda vacía, el verde no vale nada. */
  assert.ok(ARCHIVOS.length > 60, `solo encontré ${ARCHIVOS.length} piezas: la búsqueda se rompió`);

  const culpables = [];
  for (const f of ARCHIVOS) {
    if (EXCEPCIONES.has(f)) continue;
    readFileSync(f, "utf8").split("\n").forEach((linea, i) => {
      if (TEAL.test(linea) && ACIERTO.test(linea)) culpables.push(`${f}:${i + 1} → ${linea.trim().slice(0, 90)}`);
    });
  }
  assert.deepEqual(culpables, [], `el acierto vuelve a ir en teal:\n${culpables.join("\n")}`);
});

test("★★ la guardia puede fallar: reconoce el patrón cuando lo ve", () => {
  const falso = `  if (estado === "correcta") return FAE.teal;`;
  assert.ok(TEAL.test(falso) && ACIERTO.test(falso), "la guardia no reconocería el caso que arreglé");
  const inocente = `  const colorDebe = FAE.teal;`;
  assert.ok(!(TEAL.test(inocente) && ACIERTO.test(inocente)), "la guardia señalaría el teal del DEBE");
});
