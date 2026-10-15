/*
 * CLAVE DE RESPUESTAS para la sonda de enganche (T4).
 * Uso: node enganche_clave.mjs [<raíz-del-build>] > clave.json   (por defecto, este repositorio)
 * Lee las respuestas de los datos DEL MISMO BUILD que se mide (src/data/contabilidadT4H*.js),
 * no de una copia: si Baki cambia una respuesta, la clave cambia con ella.
 * Por cada tarjeta da su texto (con el que la sonda la reconoce en pantalla), la respuesta
 * correcta y una equivocada que se comete con el mismo gesto.
 * Una pieza que no existe en ese build se omite (main hoy solo tiene H1).
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
// sin argumento, la raíz es este mismo repositorio (scripts/t4/sonda-enganche/ → ../../..)
const raiz = resolve(process.argv[2] ?? fileURLToPath(new URL("../../..", import.meta.url)));
const n = (s) => String(s).replace(/\s+/g, " ").trim();
const carga = async (p) => {
  const f = `${raiz}/src/data/contabilidadT4${p}.js`;
  return existsSync(f) ? import(pathToFileURL(f).href) : null;
};
const clave = {};

const h1 = await carga("H1");
if (h1) clave.H1 = { tarjeta: "[data-hecho]", items: Object.fromEntries(h1.ITEMS_H1.map((it) => [n(it.texto), {
  bien: { opcion: it.respuesta }, mal: { opcion: h1.DESTINOS_H1.map((d) => d.id ?? d).find((d) => d !== it.respuesta) } }])) };

const h2 = await carga("H2");
if (h2) clave.H2 = { tarjeta: "[data-caso]", items: Object.fromEntries(h2.CASOS_H2.map((c) => [n(c.caso), {
  bien: { opcion: c.correcta }, mal: { opcion: Object.keys(c.distractores)[0] } }])) };

const h3 = await carga("H3");
if (h3) clave.H3 = { tarjeta: "[data-enunciado]", items: Object.fromEntries(h3.SERIES_H3.flat().map((op) => [n(op.enunciado), {
  bien: { asiento: [[op.debe, "Debe"], [op.haber, "Haber"]] }, mal: { asiento: [[op.haber, "Debe"], [op.debe, "Haber"]] } }])) };

const h4 = await carga("H4");
if (h4) {
  const items = {};
  for (const r of h4.RONDAS_H4) for (const p of r.preguntas) {
    const mala = Object.keys(p.opciones).find((k) => k !== p.correcta);
    items[`${n(r.enunciado)}::${p.id}`] = { bien: { opcion: p.correcta }, mal: { opcion: mala } };
  }
  clave.H4 = { tarjeta: "[data-enunciado]", subtarjeta: "[data-tarjeta-pregunta]", items };
}

const h5 = await carga("H5");
if (h5) clave.H5 = { tarjeta: "[data-enunciado]", items: Object.fromEntries(h5.CASOS_H5.map((c) => {
  const gg = c.asiento.find((l) => l.lado === "debe");
  const banco = c.asiento.find((l) => l.lado === "haber");
  return [n(c.enunciado), {
    bien: { asiento: c.asiento.map((l) => [n(h5.nombreDe ? h5.nombreDe(l.cuenta) : l.cuenta), l.lado === "debe" ? "Debe" : "Haber", l.valor]) },
    // el error central del juego: dos filas, Bancos por lo mismo que los gastos (gesto mínimo, ver H5 v2)
    mal: { asiento: [[n(gg.cuenta), "Debe", gg.valor], [n(banco.cuenta), "Haber", gg.valor]] } }];
})) };

const h6 = await carga("H6");
if (h6) clave.H6 = { tarjeta: "[data-partida-texto]", items: Object.fromEntries(h6.ITEMS_H6.map((it) => [n(it.texto), {
  bien: { opcion: it.respuesta }, mal: { opcion: it.respuesta === h6.BANCO ? h6.EMPRESA : h6.BANCO } }])) };

const h7 = await carga("H7");
if (h7) {
  const items = {}, saldos = {};
  const dest = h7.DESTINOS_H7.map((d) => d.id ?? d);
  for (const s of h7.SERIES_H7) {
    for (const p of s.partidas) items[n(p.texto)] = { bien: { opcion: p.respuesta }, mal: { opcion: dest.find((d) => d !== p.respuesta) } };
    saldos[s.id] = { bien: { campos: { banco: s.conciliadoBanco, libros: s.conciliadoLibros } }, mal: { campos: { banco: s.extracto, libros: s.libros } } };
  }
  clave.H7 = { tarjeta: "[data-partida-texto]", items, saldos };
}

const h8 = await carga("H8");
if (h8) {
  const items = {}, notas = {}, saldos = {};
  for (const s of h8.SERIES_H8) {
    for (const p of s.partidas) items[n(p.texto)] = { bien: { opcion: p.respuesta }, mal: { opcion: p.respuesta === h8.SE_ASIENTA ? h8.NO_SE_ASIENTA : h8.SE_ASIENTA } };
    for (const q of s.notas) notas[n(q.texto)] = { bien: { asiento: [[q.debe, "Debe"], [q.haber, "Haber"]] }, mal: { asiento: [[q.haber, "Debe"], [q.debe, "Haber"]] } };
    saldos[s.id] = { bien: { campos: { mayor: s.saldoMayor } }, mal: { campos: { mayor: s.erroresEtapa3[0].cifra } } };
  }
  clave.H8 = { tarjeta: "[data-partida-texto]", notaTarjeta: "[data-tarjeta-nota]", items, notas, saldos };
}

console.log(JSON.stringify(clave));
