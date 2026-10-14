import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PRUEBA DE GUARDIA · la glosa provisional b5-t6-glosa-nota-debito (Célula B).
 *
 * T6 · Aprender 1 explica «nota débito» con una glosa PROPIA porque el tema
 * que la define —el Tema 4, de la Célula A— todavía no la ha publicado. El
 * día que la publique, el sitio tendría dos explicaciones del mismo término,
 * y la nuestra sobra.
 *
 * Esta prueba se pone ROJA ese día. No depende de ningún nombre de archivo
 * (el del Tema 4 todavía no existe): recorre TODOS los módulos de src/data/
 * —menos los de T6— y todo lo que exportan, a cualquier profundidad, y busca
 * un término o una glosa que defina «nota débito».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const QUE_HACER = [
  "",
  "══ OTRO TEMA YA DEFINE «NOTA DÉBITO» ══",
  "Qué hacer (Célula B):",
  "  1. Reemplazar la glosa b5-t6-glosa-nota-debito de T6 · Aprender 1",
  "     (src/data/contabilidadT6Pieza1.js) por la definición publicada, o",
  "     quitarla y remitir a ese tema.",
  "  2. Pasar el cambio por auditoría (Shoko, y Levi si toca lo publicado):",
  "     es contenido publicado.",
  "  3. No debilitar ni borrar esta prueba: cuando la glosa ya no exista,",
  "     se retira con ella, en el mismo PR.",
].join("\n");

/* «Nota débito», «notas débito», «la nota débito», con o sin tilde ni mayúsculas. */
const normal = (t) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const ES_EL_TERMINO = /^(la |las )?notas? debito$/;
/* Las claves con las que los datos del sitio nombran un término. */
const CLAVES_DE_TERMINO = ["termino", "nombre", "titulo", "concepto", "palabra", "rotulo"];
/* Lo que hace que un objeto DEFINA el término y no solo lo mencione. */
const CLAVES_DE_DEFINICION = ["definicion", "delLibro", "texto", "glosa", "explicacion", "descripcion"];

/**
 * ¿Este objeto define «nota débito»? Sí si:
 *  · lo nombra en una clave de término y trae una definición (texto de más de
 *    20 caracteres en una clave de definición), o
 *  · es una glosa con id de nota débito que no es la nuestra.
 */
export function defineNotaDebito(o) {
  if (!o || typeof o !== "object") return false;
  const nombra = CLAVES_DE_TERMINO.some((k) => typeof o[k] === "string" && ES_EL_TERMINO.test(normal(o[k])));
  const define = CLAVES_DE_DEFINICION.some((k) => typeof o[k] === "string" && o[k].trim().length > 20);
  if (nombra && define) return true;
  return typeof o.id === "string" && /nota-?debito/.test(normal(o.id)) && o.id !== "b5-t6-glosa-nota-debito";
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
  assert.equal(defineNotaDebito({ id: "a4-glosa-nota-debito", texto: "…" }), true);
  /* Mencionarla dentro de otro texto no es definirla. */
  assert.equal(defineNotaDebito({ termino: "Cuándo sube lo que deben los clientes", definicion: "… o por una nota débito cuando el banco devuelve el cheque…" }), false);
  /* Nombrarla sin definirla tampoco (por ejemplo, un rótulo suelto). */
  assert.equal(defineNotaDebito({ rotulo: "Nota débito" }), false);
  /* Y nuestra glosa no cuenta. */
  assert.equal(defineNotaDebito({ id: "b5-t6-glosa-nota-debito", texto: "Con una nota débito, el banco…" }), false);
});

test("★★★ GUARDIA: ningún tema fuera de T6 define «nota débito» (cuando se ponga roja, ver el mensaje)", async () => {
  const archivos = readdirSync(CARPETA).filter((f) => f.endsWith(".js") && !DE_T6.test(f)).sort();
  /* Que el recorrido mire de verdad: si la carpeta se vacía o cambia, esto falla antes de dar un falso verde. */
  assert.ok(archivos.length > 40, `solo encontré ${archivos.length} módulos en src/data: ¿cambió la carpeta?`);
  const hallazgos = [];
  let revisados = 0;
  for (const f of archivos) {
    const m = await import(new URL(f, CARPETA));
    for (const [ruta, o] of objetos(m, f)) {
      revisados += 1;
      if (defineNotaDebito(o)) hallazgos.push(ruta);
    }
  }
  assert.ok(revisados > 1000, `solo ${revisados} objetos revisados: el recorrido no está mirando los datos`);
  assert.deepEqual(hallazgos, [], `«nota débito» ya está definida en: ${hallazgos.join(" | ")}${QUE_HACER}`);
});

test("★★ la glosa provisional existe, debajo del término 4 de T6 · Aprender 1, con su id", async () => {
  const { PIEZA_LO_QUE_LE_DEBEN, GLOSA_NOTA_DEBITO } = await import("../../data/contabilidadT6Pieza1.js");
  assert.equal(GLOSA_NOTA_DEBITO.id, "b5-t6-glosa-nota-debito");
  const t4 = PIEZA_LO_QUE_LE_DEBEN.nombres[3];
  assert.equal(t4.termino, "Cuándo sube lo que deben los clientes");
  assert.equal(t4.glosa, GLOSA_NOTA_DEBITO.id);
  assert.equal(t4.delLibro, GLOSA_NOTA_DEBITO.texto);
  assert.equal(t4.rotuloDelLibro, "Nota");
});
