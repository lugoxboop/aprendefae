/*
 * CLAVE DE RESPUESTAS para la sonda de enganche (T4).
 * Uso: node enganche_clave.mjs [<raíz-del-build>] > clave.json   (por defecto, este repositorio)
 * Lee las respuestas de los datos DEL MISMO BUILD que se mide (src/data/contabilidadT4H*.js),
 * no de una copia: si Baki cambia una respuesta, la clave cambia con ella.
 * Por cada tarjeta da su texto (con el que la sonda la reconoce en pantalla), la respuesta
 * correcta y una equivocada que se comete con el mismo gesto.
 * Una pieza que no existe en ese build se omite (main hoy solo tiene H1). Una pieza de la pila vieja
 * (H3, H4, H7 y H8 antes del rediseño) tampoco: la clave es la del rediseño.
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
// H1 rediseñado (el cajón como tablero, con saldo inicial): el gesto es tocar un destino del cajón (data-destino);
// el de antes era una opción de radio (data-opcion). La clave sale del build que se mide.
const gestoH1 = h1 && h1.SALDO_INICIAL_H1 != null ? "destino" : "opcion";
if (h1) clave.H1 = { tarjeta: "[data-hecho]", items: Object.fromEntries(h1.ITEMS_H1.map((it) => [n(it.texto), {
  bien: { [gestoH1]: it.respuesta }, mal: { [gestoH1]: h1.DESTINOS_H1.map((d) => d.id ?? d).find((d) => d !== it.respuesta) } }])) };

/*
 * Los Hacer rediseñados (H3, H4 con H5, H7 con H6 y H8: el tablero, la regla, las libretas y el mayor).
 * El gesto es «toques»: los selectores que se tocan en orden dentro de la pieza, y «comprobar» si
 * después va el botón. La respuesta equivocada se comete con el MISMO gesto mínimo. H2, H5 y H6
 * salieron del catálogo con el corte de calidad (15 oct): ya no tienen clave.
 */
const destino = (k) => `[data-destino="${k}"]`;
const h3 = await carga("H3");
if (h3?.CUENTAS_H3) clave.H3 = { tarjeta: "[data-hecho]", items: Object.fromEntries(h3.SERIES_H3.flatMap((s) => s.ops).map((op) => [n(op.texto), {
  bien: { toques: [destino(`${op.debe}:debe`), destino(`${op.haber}:haber`)], comprobar: true },
  /* las dos cuentas bien, pero al revés: el error más mecánico, con los mismos dos toques */
  mal: { toques: [destino(`${op.haber}:debe`), destino(`${op.debe}:haber`)], comprobar: true } }])) };

const h4 = await carga("H4");
if (h4?.RONDAS_H4) {
  const items = {};
  for (const r of h4.RONDAS_H4) for (const p of r.preguntas) {
    const k = `${n(r.titulo + r.tarjeta)}::${p.id}`;
    if (p.id === h4.CUENTA) {
      const c = p.correcta;
      items[k] = { bien: { toques: [destino(`${c.cuenta}:${c.lado}`)], comprobar: true }, mal: { toques: [destino(`${h4.CM}:${c.lado}`)], comprobar: true } };
    } else {
      const mala = p.opciones.find((o) => o !== p.correcta);
      items[k] = { bien: { toques: [`[data-opcion="${p.correcta}"]`] }, mal: { toques: [`[data-opcion="${mala}"]`] } };
    }
  }
  clave.H4 = { tarjeta: "[data-tarjeta-ronda]", subtarjeta: "[data-tarjeta-pregunta]", items };
}

const h7 = await carga("H7");
if (h7?.SECCIONES_H7) {
  const items = {}, saldos = {};
  for (const s of h7.SERIES_H7) {
    for (const p of s.partidas) items[n(p.texto)] = { bien: { toques: [destino(p.va)] }, mal: { toques: [destino(h7.SECCIONES_H7.find((x) => x !== p.va))] } };
    saldos[s.id] = { bien: { campos: { banco: s.conciliadoBanco, libros: s.conciliadoLibros } }, mal: { campos: { banco: s.extracto, libros: s.libros } } };
  }
  clave.H7 = { tarjeta: "[data-hecho]", items, saldos };
}

const h8 = await carga("H8");
if (h8?.BANDEJAS_H8) {
  /* Las partidas de la etapa 1 y las notas de la etapa 2 tienen el mismo texto: la clave va por etapa. */
  const items = {}, saldos = {};
  for (const s of h8.SERIES_H8) {
    for (const p of s.partidas) {
      const r = h8.ETAPA1_H8[p.tipo].respuesta;
      items[`1::${n(p.texto)}`] = { bien: { toques: [destino(r)] }, mal: { toques: [destino(r === h8.SE_ASIENTA ? h8.NO_SE_ASIENTA : h8.SE_ASIENTA)] } };
    }
    for (const q of s.notas) items[`2::${n(q.texto)}`] = { bien: { toques: [destino(`${q.debe}:debe`), destino(`${q.haber}:haber`)], comprobar: true }, mal: { toques: [destino(`${q.haber}:debe`), destino(`${q.debe}:haber`)], comprobar: true } };
    saldos[s.id] = { bien: { campos: { mayor: s.saldoMayor } }, mal: { campos: { mayor: s.erroresEtapa3[0].cifra } } };
  }
  clave.H8 = { tarjeta: "[data-hecho]", porEtapa: true, items, saldos };
}

console.log(JSON.stringify(clave));
