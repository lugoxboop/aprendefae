import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * B2 · CADA PANTALLA DE LA CAPA 1 TIENE 60 PALABRAS O MENOS (Célula B).
 *
 * Con un término por pantalla (CuatroCapas paginada), cada pantalla de la capa
 * 1 de las siete piezas de Aprender de la célula (T5 · A1 y A2, T6 · A1 a A5)
 * se lee entera: el nombre del término, su definición, la cita y la nota (con
 * «Más sobre este término» abierto) y sus rótulos («Así lo dice el libro»,
 * «Nota»). Se cuentan como cuenta Futaba: todo lo que se lee, rótulos
 * incluidos. El pie de fuente no cuenta: no es texto de la explicación.
 *
 * Una palabra es lo que va entre espacios y trae al menos una letra o una
 * cifra: «–», «·» y «%» sueltos no cuentan; «(p.» y «191)», sí.
 *
 * Si se pone roja, el texto se devuelve a Futaba: aquí no se recorta.
 *
 * PENDIENTE (15-oct): «Activo financiero» (T5 · A1) cuenta 61 con su cita y
 * su rótulo. Va aparte, como TODO, con el mismo límite: no se le sube el
 * máximo ni se recorta el texto. Cuando Futaba lo ajuste, sale de PENDIENTES
 * y la prueba de abajo lo vigila como a los demás.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MAXIMO = 60;
const ROTULO_DEL_LIBRO = "Así lo dice el libro";

const PIEZAS = [
  ["T5 · A1", "contabilidadT5Pieza1.js", "PIEZA_DEL_EFECTIVO", 9],
  ["T5 · A2", "contabilidadT5Pieza2.js", "PIEZA_TRES_MOMENTOS", 4],
  ["T6 · A1", "contabilidadT6Pieza1.js", "PIEZA_LO_QUE_LE_DEBEN", 6],
  ["T6 · A2", "contabilidadT6Pieza2.js", "PIEZA_NO_VA_A_PAGAR", 7],
  ["T6 · A3", "contabilidadT6Pieza3.js", "PIEZA_LA_PROVISION", 6],
  ["T6 · A4", "contabilidadT6Pieza4.js", "PIEZA_SI_PAGA", 5],
  ["T6 · A5", "contabilidadT6Pieza5.js", "PIEZA_COMO_SE_CALCULA", 5],
];

/* Las pantallas que hoy pasan de 60, en espera de Futaba (ver arriba). */
const PENDIENTES = ["T5 · A1 · Activo financiero"];

export const palabras = (t) => t.split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;

/* Todo lo que se lee en la pantalla de un término. */
export function textoDePantalla(n) {
  const partes = [n.termino, n.definicion];
  if (n.delLibro) partes.push(n.rotuloDelLibro ?? ROTULO_DEL_LIBRO, n.delLibro);
  if (n.notaDebajo) partes.push(n.notaDebajo.rotulo, n.notaDebajo.texto);
  for (const p of partes) assert.equal(typeof p, "string", `«${n.termino}»: una parte no es texto, no se puede contar`);
  return partes.join(" ");
}

test("★★★ el contador cuenta como Futaba (control)", () => {
  assert.equal(palabras("Cuentas por cobrar – clientes"), 4);
  assert.equal(palabras("Es el 5 % para deudas"), 5);
  assert.equal(palabras("«…colocaciones de dinero…» (p. 191)"), 5);
  assert.equal(palabras(textoDePantalla({ termino: "Clientes", definicion: "Uno dos.", delLibro: "«Tres.» (p. 1)", notaDebajo: { rotulo: "Nota", texto: "Cuatro." } })),
    1 + 2 + 5 + 3 + 1 + 1);
});

test("★★★ B2: ninguna pantalla de la capa 1 de la Célula B pasa de 60 palabras", async () => {
  const largas = [];
  let contadas = 0;
  for (const [pieza, archivo, nombre, cuantos] of PIEZAS) {
    const p = (await import(`../../data/${archivo}`))[nombre];
    assert.equal(p.nombres.length, cuantos, `${pieza}: ${p.nombres.length} términos, B2 dice ${cuantos}`);
    for (const n of p.nombres) {
      contadas += 1;
      if (PENDIENTES.includes(`${pieza} · ${n.termino}`)) continue;
      const total = palabras(textoDePantalla(n));
      if (total > MAXIMO) largas.push(`${pieza} · «${n.termino}»: ${total} palabras`);
    }
  }
  assert.equal(contadas, 42, "la guarda: las siete piezas, 42 pantallas");
  assert.deepEqual(largas, []);
});

test("★★★ B2: «Activo financiero» (T5 · A1) tampoco pasa de 60 palabras", { todo: "cuenta 61 con su cita y su rótulo — pendiente de Futaba (no se recorta aquí)" }, async () => {
  const p = (await import("../../data/contabilidadT5Pieza1.js")).PIEZA_DEL_EFECTIVO;
  const n = p.nombres.find((x) => x.termino === "Activo financiero");
  assert.ok(n, "la guarda: el término existe");
  assert.ok(palabras(textoDePantalla(n)) <= MAXIMO, `«Activo financiero»: ${palabras(textoDePantalla(n))} palabras`);
});
