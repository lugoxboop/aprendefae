import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PRUEBA DE GUARDIA · «nota débito» entre el Tema 4 y T6 (Célula B).
 *
 * HISTORIA. T6 · Aprender 1 explicaba «nota débito» con una glosa PROPIA
 * (b5-t6-glosa-nota-debito) porque el tema que la define todavía no estaba.
 * Esta guardia se ponía roja el día que otro tema la definiera. Se puso roja
 * con el Tema 4 · A4 de la Célula D (#183), que es la señal acordada (C4 /
 * A4-P): la glosa provisional se retiró y la nota del término 4 de T6 dice
 * ahora, letra por letra, la definición del Tema 4.
 *
 * QUÉ VIGILA AHORA. Que el sitio siga teniendo UNA sola explicación del
 * término: toda definición de «nota débito» fuera de T6 tiene que decir
 * exactamente lo mismo que la nota de T6 (NOTA_DEBITO_T6). Si el Tema 4
 * cambia su definición, o alguien cambia la nuestra, se pone roja.
 *
 * Recorre TODOS los módulos de src/data/ —menos los de T6— y todo lo que
 * exportan, a cualquier profundidad. No depende de ningún nombre de archivo.
 *
 * OJO: la prueba de A4 de la Célula D lee de este archivo, como texto, las
 * constantes ES_EL_TERMINO, CLAVES_DE_TERMINO y CLAVES_DE_DEFINICION. Se
 * conservan con su nombre y su forma.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const QUE_HACER = [
  "",
  "══ HAY DOS EXPLICACIONES DISTINTAS DE «NOTA DÉBITO» ══",
  "Qué hacer:",
  "  1. Si cambió la definición del otro tema (Tema 4 · A4, Célula D), la",
  "     Célula B copia el texto nuevo en NOTA_DEBITO_T6",
  "     (src/data/contabilidadT6Pieza1.js) y lo pasa por auditoría (Shoko):",
  "     es contenido publicado.",
  "  2. Si cambió la nuestra, se devuelve al texto del Tema 4.",
  "  3. No debilitar ni borrar esta prueba.",
].join("\n");

/* «Nota débito», «notas débito», «la nota débito», con o sin tilde ni mayúsculas. */
const normal = (t) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const ES_EL_TERMINO = /^(la |las )?notas? debito$/;
/* Las claves con las que los datos del sitio nombran un término. */
const CLAVES_DE_TERMINO = ["termino", "nombre", "titulo", "concepto", "palabra", "rotulo"];
/* Lo que hace que un objeto DEFINA el término y no solo lo mencione. */
const CLAVES_DE_DEFINICION = ["definicion", "delLibro", "texto", "glosa", "explicacion", "descripcion"];

/** ¿Este objeto define «nota débito»? Sí si lo nombra en una clave de término y trae una definición (texto de más de 20 caracteres en una clave de definición). */
export function defineNotaDebito(o) {
  if (!o || typeof o !== "object") return false;
  const nombra = CLAVES_DE_TERMINO.some((k) => typeof o[k] === "string" && ES_EL_TERMINO.test(normal(o[k])));
  return nombra && Boolean(laDefinicion(o));
}

/** El texto con el que el objeto define el término: la primera clave de definición con más de 20 caracteres. */
export function laDefinicion(o) {
  const k = CLAVES_DE_DEFINICION.find((c) => typeof o?.[c] === "string" && o[c].trim().length > 20);
  return k ? o[k].trim() : null;
}

function* objetos(valor, ruta, vistos = new Set()) {
  if (!valor || typeof valor !== "object" || vistos.has(valor)) return;
  vistos.add(valor);
  yield [ruta, valor];
  for (const [k, v] of Object.entries(valor)) yield* objetos(v, `${ruta}.${k}`, vistos);
}

const CARPETA = new URL("../../data/", import.meta.url);
const DE_T6 = /^contabilidadT6/;

test("★★★ el detector reconoce una definición de «nota débito» y no una simple mención (control positivo)", () => {
  assert.equal(defineNotaDebito({ termino: "Nota débito", definicion: "Documento con el que el banco le resta un valor a la cuenta." }), true);
  assert.equal(defineNotaDebito({ termino: "Notas débito", delLibro: "«Notas débito que el banco ha cargado a la cuenta bancaria» (p. 188)" }), true);
  assert.equal(defineNotaDebito({ nombre: "nota debito", texto: "Lo que el banco descuenta de la cuenta de la empresa." }), true);
  /* Mencionarla dentro de otro texto no es definirla. */
  assert.equal(defineNotaDebito({ termino: "Cuándo sube lo que deben los clientes", definicion: "… o por una nota débito cuando el banco devuelve el cheque…" }), false);
  /* Nombrarla sin definirla tampoco (por ejemplo, un rótulo suelto). */
  assert.equal(defineNotaDebito({ rotulo: "Nota débito" }), false);
  /* Lee la definición que se va a comparar. */
  assert.equal(laDefinicion({ termino: "Nota débito", definicion: "  Con una nota débito, el banco le resta…  " }), "Con una nota débito, el banco le resta…");
});

test("★★★ GUARDIA: toda definición de «nota débito» fuera de T6 dice lo mismo que la nota de T6 (cuando se ponga roja, ver el mensaje)", async () => {
  const { NOTA_DEBITO_T6 } = await import("../../data/contabilidadT6Pieza1.js");
  const archivos = readdirSync(CARPETA).filter((f) => f.endsWith(".js") && !DE_T6.test(f)).sort();
  /* Que el recorrido mire de verdad: si la carpeta se vacía o cambia, esto falla antes de dar un falso verde. */
  assert.ok(archivos.length > 40, `solo encontré ${archivos.length} módulos en src/data: ¿cambió la carpeta?`);
  const distintas = [];
  let revisados = 0;
  for (const f of archivos) {
    const m = await import(new URL(f, CARPETA));
    for (const [ruta, o] of objetos(m, f)) {
      revisados += 1;
      if (defineNotaDebito(o) && laDefinicion(o) !== NOTA_DEBITO_T6.texto) distintas.push(`${ruta}: «${laDefinicion(o)}»`);
    }
  }
  assert.ok(revisados > 1000, `solo ${revisados} objetos revisados: el recorrido no está mirando los datos`);
  assert.deepEqual(distintas, [], `la nota de T6 dice «${NOTA_DEBITO_T6.texto}», y otra definición dice otra cosa: ${distintas.join(" | ")}${QUE_HACER}`);
});

test("★★★ la guardia se pone roja si las dos definiciones dejan de coincidir (control negativo)", async () => {
  const { NOTA_DEBITO_T6 } = await import("../../data/contabilidadT6Pieza1.js");
  const otra = { termino: "Nota débito", definicion: NOTA_DEBITO_T6.texto.replace("resta", "suma") };
  assert.equal(defineNotaDebito(otra), true);
  assert.notEqual(laDefinicion(otra), NOTA_DEBITO_T6.texto);
  assert.equal(laDefinicion({ termino: "Nota débito", definicion: NOTA_DEBITO_T6.texto }), NOTA_DEBITO_T6.texto);
});

test("★★ la glosa provisional ya no existe: el término 4 de T6 · Aprender 1 lleva la nota con la definición del Tema 4", async () => {
  const D = await import("../../data/contabilidadT6Pieza1.js");
  assert.equal(D.GLOSA_NOTA_DEBITO, undefined, "la glosa provisional b5-t6-glosa-nota-debito volvió");
  const t4 = D.PIEZA_LO_QUE_LE_DEBEN.nombres[3];
  assert.equal(t4.termino, "Cuándo sube lo que deben los clientes");
  assert.equal(t4.glosa, undefined);
  assert.equal(t4.delLibro, D.NOTA_DEBITO_T6.texto);
  assert.equal(t4.rotuloDelLibro, "Nota");
  /* Lo que la nota tiene que decir para seguir sirviendo a T6: que resta y el cheque devuelto. */
  assert.match(D.NOTA_DEBITO_T6.texto, /le resta un valor a la cuenta/);
  assert.match(D.NOTA_DEBITO_T6.texto, /devuelve el cheque con el que un cliente/);
});
