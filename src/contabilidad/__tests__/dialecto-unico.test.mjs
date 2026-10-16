import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL DIALECTO ÚNICO DE CONTABILIDAD.
 *
 * Una sola materia no puede calificar de cinco maneras. El estándar es:
 *
 *   acierto ........ «Correcto», con Check
 *   error .......... «No va aquí», con X coral
 *   la revelada .... «Iba aquí»   (en Hacer; en Aprender no se revela)
 *
 * Esta guardia no mira cómo se pinta: mira las PALABRAS. Busca el rótulo
 * suelto —una cadena que es exactamente «Bien», «Revisa», «Va:»…— en los
 * datos y en las piezas de Contabilidad. Prosa que contenga esas palabras
 * dentro de una frase no cuenta: califica quien las dice solas.
 *
 * Nació del barrido que dejó a «El mismo hecho, dos empresas» hablando como
 * el resto. Está para que la sexta pieza que invente su propio dialecto se
 * entere aquí y no en la pantalla de un estudiante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CARPETAS = ["src/components/mecanicas/libros", "src/components/t4", "src/components/repasoCap5"];
const DATOS = "src/data";

/* Rótulos de veredicto que ya no existen en Contabilidad. */
const FUERA = ["Bien", "Mal", "Revisa", "Va:", "Casi", "Ojo", "Muy bien", "Así es", "Exacto", "Correcta", "Incorrecta"];
const SUELTO = new RegExp(`["'](${FUERA.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})["']`, "g");

/*
 * Las dos excepciones vivas, cada una con su razón medida. No son permisos
 * en blanco: si una pieza nueva quiere entrar aquí, que traiga su medida.
 *
 *   · contabilidadT4A0.js — Katsumi midió la casilla de después de la raya:
 *     73,4 px a 320. «✓ Bien» (56) y «✗ Mal» (52) caben; «✓ Correcto» y
 *     «✗ No va aquí» no. Decisión de la Célula D, escrita en el archivo.
 *   · repasoCap5MateTextos.js — «Acierto» y «Error» son rótulos SOLO para
 *     lector de pantalla (LECTOR.*), no se ven. De la Célula E alinearlos
 *     con el «Incorrecto.» del canon.
 */
const EXCEPCIONES = new Set(["src/data/contabilidadT4A0.js", "src/data/repasoCap5MateTextos.js"]);

function jsx(dir, ext) {
  const salida = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) salida.push(...jsx(p, ext));
    else if (e.name.endsWith(ext)) salida.push(p);
  }
  return salida;
}

const PIEZAS = CARPETAS.flatMap((d) => jsx(d, ".jsx"));
const FICHEROS_DATOS = jsx(DATOS, ".js").filter((f) => /contabilidad|repasoCap5/i.test(f));
const TODOS = [...PIEZAS, ...FICHEROS_DATOS].filter((f) => !EXCEPCIONES.has(f));

test("★★★ Contabilidad califica con un solo dialecto: «Correcto», «No va aquí», «Iba aquí»", () => {
  /* Un verde sobre una lista vacía no es un verde. */
  assert.ok(PIEZAS.length > 60, `solo encontré ${PIEZAS.length} piezas`);
  assert.ok(FICHEROS_DATOS.length > 20, `solo encontré ${FICHEROS_DATOS.length} ficheros de datos`);

  const culpables = [];
  for (const f of TODOS) {
    readFileSync(f, "utf8").split("\n").forEach((linea, i) => {
      /* Los comentarios cuentan la historia; no califican a nadie. */
      const limpia = linea.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*$/, "").replace(/^\s*\*.*$/, "");
      for (const m of limpia.matchAll(SUELTO)) culpables.push(`${f}:${i + 1} → ${m[1]}`);
    });
  }
  assert.deepEqual(culpables, [], `rótulos fuera del dialecto único:\n${culpables.join("\n")}`);
});

test("★★ la guardia puede fallar: reconoce el rótulo suelto y deja pasar la prosa", () => {
  const malo = `  bien: "Bien",`;
  assert.equal([...malo.matchAll(SUELTO)].length, 1, "no reconocería el rótulo que acabo de quitar");
  const prosa = `  texto: "Revisa que los dos asientos no sean una copia",`;
  assert.equal([...prosa.matchAll(SUELTO)].length, 0, "señalaría una frase que no califica");
});
