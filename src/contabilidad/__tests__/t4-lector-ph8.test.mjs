import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · PH8-2 TAMBIÉN PARA LO QUE OYE EL LECTOR (Yujiro, por lotes).
 *
 * PH8-2 dice que antes de responder la respuesta no está en la pantalla. Las
 * pruebas de cada pieza lo miran en el texto y en el DOM. Esta mira lo que
 * solo oye el lector de pantalla: el texto alternativo de la figura, los
 * aria-label que no son el nombre de un control y el texto solo para lector
 * (`.t4f-sr`, `figcaption`, lo recortado con `clip`). Katsumi encontró dos
 * que daban la respuesta (A3 P2: «la aguja de la suma queda a la derecha de
 * la marca del fondo», que ya decía «sobra»; A4 P3: «el cheque aparece en la
 * de la empresa»), y por eso esta prueba existe.
 *
 * LA RESPUESTA SALE DE LA MISMA CLAVE QUE LA SONDA:
 *   · Aprender: `enganche_planes.json`. En cada pantalla con veredicto, el
 *     acierto es el toque con «acierto» (o, si ese toque es «Comprobar», las
 *     elecciones que lo preceden desde el veredicto anterior). Se mira al
 *     llegar y tras cada error del plan: en Aprender se reintenta, así que la
 *     respuesta tampoco puede oírse después de fallar.
 *   · Hacer: `enganche_clave.mjs` (se corre igual que la corre la sonda). Se
 *     juega cada tarjeta de cada serie con la respuesta buena, y se mira cada
 *     una al llegar. En los Hacer el error escribe lo que iba («Iba aquí»):
 *     después de fallar ya no es antes de responder.
 *
 * QUÉ ES «DECIR LA RESPUESTA»: nombrar el control correcto —su nombre sin la
 * cifra que muestra, o su texto—. Las zonas de la regla también se nombran por
 * su lugar (sobra queda a la derecha de la marca del fondo, falta a la
 * izquierda), porque así lo dice la figura. Una cifra de respuesta cuenta solo
 * si no se ve también fuera de los controles: lo que el estudiante vidente ya
 * tiene delante no es una fuga por oírlo. No cuenta el nombre de los propios
 * controles (cada opción se llama a sí misma, todas por igual), ni un texto
 * que nombre todas las opciones a la vez.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { h, montar, tocar, esperar, movimientoReducido } = await import("./t4-dom.mjs");
const { PIEZAS_T4, SeMueveLaCajaMenor, ElArqueo, ConciliaLaCuenta, SeAsientaONo, EntraOSaleDeCaja } = await import("../../components/ContabilidadT4View.jsx");
const { PLANES, abrir } = await import("./t4-aprender-rd.mjs");
const { MARCA } = await import("../../data/contabilidadT4.js");
const { cifra } = await import("../../components/t4/comun.jsx");
const H1 = await import("../../data/contabilidadT4H1.js");
const H3 = await import("../../data/contabilidadT4H3.js");
const H4 = await import("../../data/contabilidadT4H4.js");
const H7 = await import("../../data/contabilidadT4H7.js");
const H8 = await import("../../data/contabilidadT4H8.js");

const CLAVE = JSON.parse(execFileSync(process.execPath, [fileURLToPath(new URL("../../../scripts/t4/sonda-enganche/enganche_clave.mjs", import.meta.url))], { encoding: "utf8" }));

/* ═══════════ EL DETECTOR ═══════════ */

const norm = (s) => String(s ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
const CONTROL = "button, input, select, textarea, [role=button], [role=radio], [role=checkbox], [role=option], [role=slider], [role=switch], [role=tab]";
const SOLO_LECTOR = '.t4f-sr, figcaption, [style*="clip"]';
/* El lugar de cada zona en la regla del fondo (la dibuja Regla.jsx: falta a la izquierda de la marca, sobra a la derecha). */
const LUGAR_EN_LA_REGLA = { falta: ["a la izquierda"], sobra: ["a la derecha"], cuadra: ["en la marca", "justo en la marca"] };

/* Lo que solo oye el lector: cada texto, una vez. */
export function loQueSoloOye(raiz) {
  const r = [];
  for (const el of [raiz, ...raiz.querySelectorAll("*")]) {
    if (el.closest('[aria-hidden="true"]') || el.closest("style, script")) continue;
    const control = el.closest(CONTROL);
    if (!control && el.hasAttribute("aria-label")) r.push(norm(el.getAttribute("aria-label")));
    if (el.matches("img[alt]")) r.push(norm(el.getAttribute("alt")));
    if (!control && el.matches(SOLO_LECTOR) && !el.parentElement?.closest(SOLO_LECTOR)) r.push(norm(el.textContent));
  }
  return r.filter(Boolean);
}

/* Lo que ve el vidente fuera de los controles candidatos (para las cifras). */
function loQueSeVeFuera(raiz, candidatos) {
  const t = [];
  const recorrer = (n) => {
    if (n.nodeType === 3) {
      const el = n.parentElement;
      if (el && !el.closest(SOLO_LECTOR) && !candidatos.some((c) => c.contains(el))) t.push(n.textContent);
      return;
    }
    if (n.nodeType === 1 && n.matches("style, script")) return;
    for (const c of n.childNodes) recorrer(c);
  };
  recorrer(raiz);
  return norm(t.join(" "));
}

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const esCifra = (f) => /^[$−-]?\s*\d{1,3}(\.\d{3})*$/.test(f);
const patron = (f) => (esCifra(f)
  ? new RegExp(`(?<![\\d.])${escapar(f.replace(/^[$−-]?\s*/, ""))}(?![\\d.])`, "u")
  : new RegExp(`(?<![\\p{L}\\p{N}])${escapar(f)}(?![\\p{L}\\p{N}])`, "iu"));
const dice = (texto, f) => patron(f).test(texto);

/* Las palabras de las marcas, que el nombre de un control lleva al final tras responder («: No va aquí»). */
const PALABRAS_MARCA = [...new Set(Object.values(MARCA).filter(Boolean))];
const SIN_MARCA = new RegExp(`(: (${PALABRAS_MARCA.map(escapar).join("|")}))+$`, "u");
/* El nombre con el que se reconoce un control: su aria-label sin la marca ni la cifra que muestra, o su texto. */
function frasesDe(el) {
  const base = norm(el.getAttribute("aria-label") ?? el.textContent).replace(SIN_MARCA, "").replace(/: [−-]?[\d.]+$/, "");
  const f = [base];
  const o = el.getAttribute("data-opcion");
  if (o && LUGAR_EN_LA_REGLA[o]) f.push(...LUGAR_EN_LA_REGLA[o]);
  return f.filter(Boolean);
}

/*
 * Las fugas: cada texto que solo oye el lector y nombra la respuesta.
 *   oye:        lo que solo oye el lector (loQueSoloOye)
 *   respuesta:  las frases de la respuesta
 *   candidatas: las frases de todas las opciones de la pregunta (buena y malas)
 *   seVe:       el texto visible fuera de los controles
 */
export function fugas({ oye, respuesta, candidatas = [], seVe = "" }) {
  const salida = [];
  for (const texto of oye) {
    /* Un texto que nombra todas las opciones a la vez no elige ninguna. */
    const nombres = [...new Set(candidatas.map((c) => c[0]))];
    if (nombres.length > 1 && nombres.every((c) => dice(texto, c))) continue;
    for (const f of respuesta) {
      /* «Se asienta» está dentro de «No se asienta»: se quita primero la opción más larga que la contiene. */
      let t = texto;
      for (const c of candidatas.flat()) if (c !== f && c.toLowerCase().includes(f.toLowerCase())) t = t.replace(patron(c), " ");
      if (!dice(t, f)) continue;
      if (esCifra(f) && dice(seVe, f)) continue;
      salida.push(`«${texto}» dice «${f}»`);
    }
  }
  return salida;
}

/* ═══════════ APRENDER: LA CLAVE DE LOS PLANES ═══════════ */

const ELIGE = /data-(opcion|destino|seg)\b/;
/* Por pantalla: [{ antes: [índices del plan tras los que se mira], respuesta: [selectores] }] */
function momentosDe(plan) {
  const r = [];
  let desde = 0;
  let mirar = [0];
  for (const [k, paso] of plan.entries()) {
    if (paso.veredicto === "error") { mirar.push(k + 1); continue; }
    if (paso.veredicto !== "acierto") continue;
    const tramo = plan.slice(desde, k + 1).map((x, i) => ({ ...x, i: desde + i }));
    const ultimoVeredicto = [...tramo].reverse().find((x) => x.i < k && x.veredicto);
    const elecciones = tramo.filter((x) => x.click && ELIGE.test(x.click) && x.i > (ultimoVeredicto?.i ?? -1));
    if (elecciones.length) r.push({ mirar, respuesta: elecciones.map((x) => x.click), candidatos: plan.filter((x) => x.click && ELIGE.test(x.click)).map((x) => x.click) });
    desde = k + 1;
    mirar = [k + 1];
  }
  return r;
}

/*
 * Los toques del plan hasta el paso `n`. Los arrastres y las esperas no se
 * juegan aquí (los mide Chromium); un momento que queda después de uno de
 * ellos no se mira en jsdom, porque la pantalla no estaría en ese estado.
 */
const jugable = (plan, n) => plan.slice(0, n).every((x) => x.click);
async function jugarHasta(m, plan, n) {
  for (const paso of plan.slice(0, n)) {
    const el = m.caja.querySelector(`[data-pieza] ${paso.click}`);
    assert.ok(el, `el plan toca ${paso.click} y no está`);
    tocar(el);
    await esperar(0);
  }
}

const piezas = PIEZAS_T4.map((x) => x.pieza);
let miradosAprender = 0;
for (const P of piezas) {
  for (const p of P.pantallas) {
    const plan = PLANES[P.id]?.[p.id];
    if (!plan) continue;
    const momentos = momentosDe(plan);
    if (!momentos.length) continue;
    test(`★★★ PH8-2 del lector · ${P.titulo} · ${p.id}: antes de responder, ni el texto alternativo, ni los aria-label, ni lo que es solo para el lector dicen la respuesta`, async () => {
      const malas = [];
      for (const mo of momentos) {
        for (const n of mo.mirar) {
          if (!jugable(plan, n)) continue;
          const m = await abrir(P, p.id);
          try {
            await jugarHasta(m, plan, n);
            const raiz = m.caja.querySelector("[data-pieza]");
            const el = (s) => raiz.querySelector(s);
            const respuesta = mo.respuesta.map(el).filter(Boolean);
            assert.ok(respuesta.length, `${p.id}: la clave elige ${mo.respuesta.join(" + ")} y no está`);
            const candidatos = [...new Set(mo.candidatos)].map(el).filter(Boolean);
            const f = fugas({ oye: loQueSoloOye(raiz), respuesta: respuesta.flatMap(frasesDe), candidatas: candidatos.map(frasesDe), seVe: loQueSeVeFuera(raiz, candidatos) });
            malas.push(...f.map((x) => `tras ${n} toque(s): ${x}`));
            miradosAprender++;
          } finally { m.desmontar(); }
        }
      }
      assert.deepEqual(malas, []);
    });
  }
}

/* ═══════════ HACER: LA CLAVE DE LA SONDA, TARJETA POR TARJETA ═══════════ */

const Marco = ({ children }) => h("section", null, children);
const HACER = [
  { s: "H1", raiz: "[data-t4-h1]", C: EntraOSaleDeCaja, tandas: [H1.ITEMS_H1] },
  { s: "H3", raiz: "[data-t4-h3]", C: SeMueveLaCajaMenor, tandas: H3.SERIES_H3 },
  { s: "H4", raiz: "[data-t4-h4]", C: ElArqueo, tandas: [0, 1].map((k) => H4.PARES_H4.map((par) => H4.RONDAS_H4.find((r) => r.id === par[k]))) },
  { s: "H7", raiz: "[data-t4-h7]", C: ConciliaLaCuenta, tandas: H7.SERIES_H7.map((serie) => ({ serie, partidas: serie.partidas })) },
  { s: "H8", raiz: "[data-t4-h8]", C: SeAsientaONo, tandas: H8.SERIES_H8.map((serie) => ({ serie, partidas: serie.partidas })) },
];
const selectorDe = (gesto) => (gesto.toques ?? [gesto.destino != null ? `[data-destino="${gesto.destino}"]` : `[data-opcion="${gesto.opcion}"]`]);

for (const { s, raiz: R, C, tandas } of HACER) {
  test(`★★★ PH8-2 del lector · ${s}: en cada tarjeta de cada serie, al llegar, lo que solo oye el lector no dice la respuesta (la clave de la sonda)`, async () => {
    const K = CLAVE[s];
    assert.ok(K, `la clave de la sonda no trae ${s}`);
    const malas = [];
    let mirados = 0;
    for (const items of tandas) {
      const antes = movimientoReducido(true);
      const m = montar(h(C, { Marco, items, onCompletar: () => {} }));
      try {
        for (let vuelta = 0; vuelta < 60; vuelta++) {
          const raiz = m.caja.querySelector(R);
          if (!raiz) break;
          const etapa = raiz.dataset.etapa ?? raiz.dataset.fase ?? "";
          const campos = [...raiz.querySelectorAll("[data-campo] input")];
          let gesto;
          let respuesta;
          let candidatos = [];
          if (campos.length) {
            const serie = raiz.dataset.serie;
            const sal = K.saldos?.[serie];
            assert.ok(sal, `${s}: la clave no trae los saldos de la serie ${serie}`);
            respuesta = Object.values(sal.bien.campos).map((v) => cifra(v));
          } else {
            const tarjeta = raiz.querySelector(K.tarjeta);
            if (!tarjeta) break;
            let carta = norm(tarjeta.textContent);
            if (K.subtarjeta) carta = `${carta}::${raiz.querySelector(K.subtarjeta).dataset.tarjetaPregunta}`;
            if (K.porEtapa) carta = `${etapa}::${carta}`;
            const it = K.items[carta];
            assert.ok(it, `${s}: la clave no reconoce la tarjeta «${carta}»`);
            gesto = it.bien;
            const els = selectorDe(gesto).map((x) => raiz.querySelector(x));
            assert.ok(els.every(Boolean), `${s} · «${carta}»: la clave toca algo que no está`);
            candidatos = [...els, ...selectorDe(it.mal).map((x) => raiz.querySelector(x)).filter(Boolean)];
            respuesta = els.flatMap(frasesDe);
          }
          const f = fugas({ oye: loQueSoloOye(raiz), respuesta, candidatas: candidatos.map(frasesDe), seVe: loQueSeVeFuera(raiz, candidatos) });
          malas.push(...f.map((x) => `${s} · ${etapa ? `etapa ${etapa} · ` : ""}tarjeta ${mirados + 1}: ${x}`));
          mirados++;
          if (!gesto) break; /* los saldos son lo último de la partida */
          for (const x of selectorDe(gesto)) { tocar(raiz.querySelector(x)); await esperar(0); }
          if (gesto.comprobar) { tocar(raiz.querySelector('[data-boton="comprobar"]')); await esperar(0); }
          await esperar(20);
          const sig = m.caja.querySelector('[data-boton="seguir-hacer"]');
          if (!sig) break;
          tocar(sig);
          await esperar(0);
        }
      } finally { m.desmontar(); movimientoReducido(antes); }
    }
    assert.ok(mirados >= 4, `${s}: solo se miraron ${mirados} tarjetas: la prueba no está recorriendo la partida`);
    assert.deepEqual(malas, []);
  });
}

/* ═══════════ EL DETECTOR CAZA LOS DOS QUE LA DABAN ═══════════ */

/*
 * Los dos textos alternativos que Katsumi corrigió (katsumi-texto-a2-a5.md,
 * «Revisión del lector»). Con ellos, esta prueba tiene que salir roja: si un
 * día el detector se afloja, aquí se ve. Las frases de la respuesta salen de
 * la pantalla montada y de la clave, como arriba.
 */
const VIEJOS = [
  { pieza: "t4-a3-el-arqueo", pantalla: "el-sobrante", alt: "El sobre con 478.100 en soportes y 24.000 en la caja. Con el acierto, la aguja de la suma queda a la derecha de la marca del fondo." },
  /*
   * Lote B: el de A4 (quien-lo-tiene) salió con su pantalla. Su pregunta
   * (¿quién anotó el cheque sin cobrar?) es ahora la causa 1 del juego de
   * «seis-causas»; se prueba allí, más abajo.
   */
];
for (const v of VIEJOS) {
  test(`★★★ el detector da en rojo el texto alternativo viejo de ${v.pieza} · ${v.pantalla}, y en verde el de ahora`, async () => {
    const P = piezas.find((x) => x.id === v.pieza);
    const [mo] = momentosDe(PLANES[P.id][v.pantalla]);
    const m = await abrir(P, v.pantalla);
    try {
      const raiz = m.caja.querySelector("[data-pieza]");
      const respuesta = mo.respuesta.map((x) => raiz.querySelector(x)).flatMap(frasesDe);
      const candidatas = mo.candidatos.map((x) => raiz.querySelector(x)).map(frasesDe);
      const seVe = loQueSeVeFuera(raiz, mo.candidatos.map((x) => raiz.querySelector(x)));
      assert.notDeepEqual(fugas({ oye: [v.alt], respuesta, candidatas, seVe }), [], "el texto viejo pasa: el detector no lo ve");
      const ahora = P.pantallas.find((x) => x.id === v.pantalla).alt;
      assert.notEqual(ahora, v.alt, "los datos todavía traen el texto viejo");
      assert.deepEqual(fugas({ oye: [ahora], respuesta, candidatas, seVe }), []);
    } finally { m.desmontar(); }
  });
}

test("★★ la prueba miró pantallas de Aprender de verdad", () => {
  assert.ok(miradosAprender >= 10, `solo ${miradosAprender} momentos de Aprender`);
});

/*
 * Lo que enseñaba el texto viejo de A4 · quien-lo-tiene (Katsumi: «el cheque
 * aparece en la de la empresa» daba la respuesta), donde vive ahora: la causa
 * 1 de «seis-causas» es ese cheque, y antes de mandarlo, lo que solo oye el
 * lector no habla del cheque (lo dice la tarjeta, que se ve y se oye) y no
 * elige libreta: nombra las dos o ninguna. El juego no lleva
 * veredicto en el plan (no abre panel), así que el bucle de arriba no lo mira.
 */
test("★★★ A4 · seis-causas, la causa 1 (el cheque sin cobrar, lo de «quien-lo-tiene»): al llegar, lo que solo oye el lector no elige libreta", async () => {
  const P = piezas.find((x) => x.id === "t4-a4-bancos-y-notas");
  const m = await abrir(P, "seis-causas");
  try {
    const raiz = m.caja.querySelector("[data-pieza]");
    assert.equal(raiz.querySelector("[data-tarjeta-causa]").dataset.tarjetaCausa, "cheque-sin-cobrar");
    const viejo = "Las dos libretas de la misma cuenta, con un renglón libre. Con el acierto, el cheque aparece en la de la empresa, que resta, y el banco todavía no lo sabe.";
    const habla = (t) => /cheque/i.test(t) || /\bempresa\b/i.test(t) !== /\bbanco\b/i.test(t);
    assert.ok(habla(viejo), "la regla no caza el texto viejo");
    const oye = loQueSoloOye(raiz);
    assert.ok(oye.some((t) => t === P.pantallas.find((x) => x.id === "seis-causas").alt), "no se miró el texto alternativo");
    for (const t of oye) assert.ok(!habla(t), `«${t}»: antes de responder habla del cheque o nombra una sola libreta`);
  } finally { m.desmontar(); }
});

/* ═══════════ LOS TRES ARREGLOS DE LECTOR (Katsumi; obligatorios por Yujiro) ═══════════ */

const pieza = (id) => piezas.find((x) => x.id === id);
const { SON_IGUALES } = await import("../../components/t4/tablero.jsx");

/*
 * Lote B: «seis-causas» es ahora el juego de llevar cada causa a su libreta
 * (las pestañas 1 a 6 salieron). Lo que cambia con cada toque se oye: la
 * causa siguiente en la región viva de la tarjeta, cuántas causas anotó cada
 * libreta y su marca en el nombre de la libreta, y el error en la región del
 * error.
 */
test("★★★ A4 · seis-causas: con cada toque, lo que cambia se oye (la causa siguiente en región viva; en cada libreta, cuántas anotó y su marca; el error)", async () => {
  const P = pieza("t4-a4-bancos-y-notas");
  const { CAUSAS_A4, FIGURA_A4: F } = await import("../../data/contabilidadT4A4.js");
  const m = await abrir(P, "seis-causas");
  try {
    const raiz = m.caja.querySelector("[data-pieza]");
    const viva = raiz.querySelector('[aria-live="polite"][data-tarjeta-causa]');
    assert.ok(viva, "la tarjeta de la causa no es una región viva");
    assert.equal(norm(viva.textContent), norm(CAUSAS_A4[0].tarjeta + F.contadorCausa(1, 6)));
    const lib = (l) => raiz.querySelector(`[data-destino=${l}]`).getAttribute("aria-label");
    assert.equal(lib("empresa"), F.anotadas(F.empresa, 0));
    tocar(raiz.querySelector("[data-destino=banco]"));
    await esperar(0);
    assert.ok(raiz.querySelector('[aria-live="assertive"][data-lector-error]')?.textContent, "el error no se oye");
    assert.equal(lib("banco"), `${F.anotadas(F.banco, 0)}: ${F.estadoLector.mal}`);
    tocar(raiz.querySelector("[data-destino=empresa]"));
    await esperar(0);
    assert.equal(lib("empresa"), `${F.anotadas(F.empresa, 1)}: ${F.estadoLector.bien}`);
    assert.equal(norm(viva.textContent), norm(CAUSAS_A4[1].tarjeta + F.contadorCausa(2, 6)), "la causa siguiente no llega a la región viva");
  } finally { m.desmontar(); }
});

test("★★★ tablero: el nombre de la mitad no tapa la cifra que se ve en ella (A2 · y-caja-menor, tras comprobar)", async () => {
  const P = pieza("t4-a2-el-fondo-fijo");
  const m = await abrir(P, "y-caja-menor");
  try {
    await jugarHasta(m, PLANES[P.id]["y-caja-menor"], 3);
    for (const b of m.caja.querySelectorAll("[data-pieza] [data-destino]")) {
      const vista = norm([...b.querySelectorAll("span")].filter((x) => !x.closest('[aria-hidden="true"]') && /^[−-]?\d{1,3}(\.\d{3})*$/.test(norm(x.textContent))).map((x) => x.textContent).join(""));
      if (vista) assert.match(b.getAttribute("aria-label"), new RegExp(`: ${escapar(vista)}(: |$)`), `«${b.getAttribute("aria-label")}» no dice ${vista}`);
    }
  } finally { m.desmontar(); }
});

test("★★★ A5 · el par: cuando aparece el «=», el lector lo oye (región viva y nombre del par); antes, no", async () => {
  const P = pieza("t4-a5-san-calixto");
  const plan = PLANES[P.id]["lado-de-la-empresa"];
  const m = await abrir(P, "lado-de-la-empresa");
  try {
    const par = () => m.caja.querySelector("[data-pieza] [data-par]");
    const viva = () => par().querySelector('[aria-live="polite"][data-lector-igual]');
    assert.ok(viva(), "el par no trae su región viva desde el principio");
    assert.equal(norm(viva().textContent), "");
    assert.ok(!par().getAttribute("aria-label").includes(SON_IGUALES));
    await jugarHasta(m, plan, plan.length);
    assert.equal(norm(viva().textContent), SON_IGUALES);
    assert.ok(par().getAttribute("aria-label").endsWith(`; ${SON_IGUALES}`), par().getAttribute("aria-label"));
  } finally { m.desmontar(); }
});
