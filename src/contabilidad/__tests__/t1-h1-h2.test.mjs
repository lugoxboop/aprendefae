import { test } from "node:test";
import assert from "node:assert/strict";
import {
  H1, PREGUNTAS_H1, MAZOS_H1, RESPUESTAS_H1, ALT_H1, ACIERTO_INFORME_H1,
  H2, FICHAS_H2, ASIENTOS_H2, CASOS_H2, DEVOLUCION_H2, PAREJAS_H2,
} from "../../data/contabilidadT1Hacer2.js";
import { FOTO, PELICULA, COMPARAR } from "../../data/contabilidadPiezas234.js";
import {
  sortearH1, evaluarH1, escenaH1, altH1, sortearH2, evaluarH2, enunciadoH2, porqueDeParejaH2,
} from "../tema1Hacer2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * H1 Y H2 DEL TEMA 1 · LO QUE SE PUEDE PERDER EN UN RETOQUE DE DATOS.
 *
 * H1: cada mazo pide las tres respuestas (si no, una vuelta se juega con un
 * solo botón), cada respuesta enciende algo distinto en la línea del año (D4)
 * y cada error trae la explicación corta de ERROR_P3 (Shoko: un solo juego).
 *
 * H2: en cada ficha hay cuatro asientos activos, la correcta entre ellos; cada
 * error tiene su devolución en las dos vueltas, y la pareja (2.ª opción) suma
 * su porqué. Los ocho lectores son siempre los mismos y en el mismo orden.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const sinBarajar = (xs) => xs;

/* ───────── H1 ───────── */

test("★ H1: los dos mazos son disjuntos, de cinco, y cada uno pide las tres respuestas", () => {
  const ids = PREGUNTAS_H1.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "ids repetidos en el banco");
  const { A, B } = MAZOS_H1;
  assert.equal(A.length, 5); assert.equal(B.length, 5);
  assert.equal(new Set([...A, ...B]).size, 10, "los mazos comparten preguntas");
  for (const [nombre, mazo] of Object.entries(MAZOS_H1)) {
    const qs = mazo.map((id) => PREGUNTAS_H1.find((q) => q.id === id));
    assert.ok(qs.every(Boolean), `${nombre}: un id que no está en el banco`);
    assert.deepEqual(new Set(qs.map((q) => q.respuesta)), new Set([FOTO, PELICULA, COMPARAR]), `${nombre}: no pide las tres`);
  }
  assert.deepEqual(sortearH1(sinBarajar).map((q) => q.id), A);
  assert.deepEqual(sortearH1(sinBarajar, true).map((q) => q.id), B);
});

test("H1: los tres rótulos son fijos y ninguno repite la fecha de la pregunta", () => {
  assert.deepEqual(RESPUESTAS_H1.map((r) => r.id), [FOTO, PELICULA, COMPARAR]);
  for (const r of RESPUESTAS_H1) assert.doesNotMatch(r.texto, /enero|diciembre/i, `«${r.texto}» delata la fecha`);
});

test("★ H1 · D4: en cada pregunta, las tres respuestas encienden figuras distintas", () => {
  for (const q of PREGUNTAS_H1) {
    const escenas = [FOTO, PELICULA, COMPARAR].map((r) => JSON.stringify(escenaH1(r, q)));
    assert.equal(new Set(escenas).size, 3, `${q.id}: dos respuestas dejan la línea igual`);
    for (const r of [FOTO, PELICULA, COMPARAR]) assert.ok(ALT_H1[altH1(r, q)], `${q.id}/${r}: sin texto alternativo`);
    if (q.respuesta === FOTO) assert.ok(["enero", "diciembre"].includes(q.foto), `${q.id}: una foto sin día`);
  }
});

test("★ H1: el acierto es el de su informe y el error, el corto de ERROR_P3 (distinto por confusión)", () => {
  for (const q of PREGUNTAS_H1) {
    const bien = evaluarH1(q, q.respuesta);
    assert.equal(bien.ok, true);
    assert.equal(bien.texto, ACIERTO_INFORME_H1[q.respuesta]);
    const malas = [FOTO, PELICULA, COMPARAR].filter((r) => r !== q.respuesta).map((r) => evaluarH1(q, r));
    for (const m of malas) {
      assert.equal(m.ok, false);
      assert.ok(m.texto && m.texto.length > 20, `${q.id}: error sin explicación`);
    }
    assert.notEqual(malas[0].texto, malas[1].texto, `${q.id}: los dos errores dicen lo mismo`);
  }
});

test("H1: la película marcada cuando había que comparar recibe la D2, no la D", () => {
  const q = PREGUNTAS_H1.find((x) => x.respuesta === COMPARAR);
  assert.equal(evaluarH1(q, PELICULA).patron, "D2");
  assert.equal(evaluarH1(q, FOTO).patron, "D");
});

/* ───────── H2 ───────── */

test("★ H2: ocho lectores fijos; cada ficha activa cuatro, con la correcta, y se juegan las ocho", () => {
  const lectores = ASIENTOS_H2.map((a) => a.id);
  assert.equal(new Set(lectores).size, 8);
  for (const a of ASIENTOS_H2) assert.ok(a.nombre && a.pregunta, `${a.id}: sin nombre o sin pregunta`);
  assert.equal(FICHAS_H2.length, 8);
  for (const f of FICHAS_H2) {
    assert.equal(f.opciones.length, 4, `${f.id}: no son cuatro activos`);
    assert.equal(new Set(f.opciones).size, 4, `${f.id}: un activo repetido`);
    assert.ok(f.opciones.includes(f.correcta), `${f.id}: la correcta no está activa`);
    assert.ok(f.opciones.every((o) => lectores.includes(o)), `${f.id}: un activo que no está en la mesa`);
    assert.ok(CASOS_H2[f.id], `${f.id}: sin caso para la segunda vuelta`);
  }
  assert.equal(sortearH2(sinBarajar).length, 8);
});

test("★ H2: cada error tiene devolución en las dos vueltas, y solo la pareja suma su porqué", () => {
  for (const f of FICHAS_H2) {
    for (const vuelta of [1, 2]) {
      assert.equal(evaluarH2(f, f.correcta, vuelta).ok, true);
      const malas = f.opciones.filter((o) => o !== f.correcta);
      const textos = malas.map((o) => evaluarH2(f, o, vuelta).texto);
      assert.equal(new Set(textos).size, malas.length, `${f.id}/v${vuelta}: dos errores con el mismo mensaje`);
    }
    const pareja = f.opciones[1];
    if (pareja !== f.correcta) {
      assert.ok(porqueDeParejaH2(f, pareja), `${f.id}: la pareja ${f.correcta}/${pareja} no tiene porqué`);
      assert.ok(PAREJAS_H2.some((p) => p.par.includes(f.correcta) && p.par.includes(pareja)));
    }
    for (const o of f.opciones.slice(2)) assert.equal(porqueDeParejaH2(f, o), null);
  }
});

test("H2: un asiento atenuado no se puede responder", () => {
  const f = FICHAS_H2[0];
  const apagado = ASIENTOS_H2.find((a) => !f.opciones.includes(a.id)).id;
  assert.throws(() => evaluarH2(f, apagado), /no está activo/);
});

test("H2: el propósito se pinta con mayúscula y punto, sin tocar el dato del banco", () => {
  for (const f of FICHAS_H2) {
    const e = enunciadoH2(f, 1);
    assert.match(e, /^[A-ZÁÉÍÓÚÑ¿]/, `${f.id}: no empieza en mayúscula`);
    assert.match(e, /[.!?]$/, `${f.id}: sin punto final`);
    assert.equal(enunciadoH2(f, 2), CASOS_H2[f.id]);
  }
});

test("H1 y H2 tienen id, objetivo y consigna", () => {
  for (const j of [H1, H2]) assert.ok(j.id && j.objetivo && j.consigna, `${j.id}: falta objetivo o consigna`);
  assert.equal(H1.id, "t1-un-dia-o-un-ano");
  assert.equal(H2.id, "t1-quien-pregunta-esto");
});

test("★★★ H1: el acierto nombra el informe (Futaba, lote F), uno por respuesta, sin «Correcto.» ni fecha fija", () => {
  const nombre = { [FOTO]: /estado de situación financiera/, [PELICULA]: /estado de resultados/, [COMPARAR]: /estados de situación financiera/ };
  for (const q of PREGUNTAS_H1) {
    const t = evaluarH1(q, q.respuesta).texto;
    assert.match(t, nombre[q.respuesta], q.id);
    assert.doesNotMatch(t, /^Correcto/, `${q.id}: abre con el veredicto`);
    assert.doesNotMatch(t, /31 de diciembre|1 de enero/, `${q.id}: la fecha fija mentiría en otro ítem`);
    assert.ok(t.split(/\s+/).length <= 25);
  }
});

test("★★ H2: la reserva bajo la mesa es fija, de 48 px (Shoko, #539 b), y el rótulo de los atenuados tiene su sitio", async () => {
  const { ALTO_RESERVA_H2 } = await import("../../components/mecanicas/libros/tema1/QuienPreguntaEsto.jsx");
  assert.equal(ALTO_RESERVA_H2, 48);
  assert.equal(H2.rotuloAtenuados, "En esta ficha solo se elige entre los cuatro encendidos.");
});
