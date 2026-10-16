import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5 AL ESTÁNDAR ÚNICO (Célula E, lote de Kamogawa). El PROMPT MAESTRO
 * (orquestador/conocimiento/prompts/disenadores-de-celula-v1.md, §4, §5 y §6)
 * aplicado a r5-1 … r5-5. Pruebas que no se debilitan:
 *
 *   1. ningún #1D3557 como fondo en repasoCap5/ (fuente y pantalla)
 *   2. ningún ámbar en botones ni en :focus
 *   3. los literales de feedback son exactamente los tres (y el lector,
 *      «Incorrecto.»); las palabras muertas no vuelven
 *   4. todo contador cumple «{Sustantivo} n de N» con el mismo sustantivo en
 *      su botón («Siguiente {sustantivo}», también en el aria-label) y el
 *      último dice «Ver mi resumen»; los botones son el Responder
 *   5. las cifras usan la pila monoespaciada (Sora solo en cifras de resultado)
 *   6. ningún font-size bajo 12 salvo la cejilla del título (10,5)
 *
 * Lo de pantalla se mira en un recorrido por las cinco actividades: cada
 * pantalla al abrir y, donde se puede jugar en un toque o en pocos, después
 * de un error (con reduced-motion, «Iba aquí» llega al instante).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(() => fn(performance.now()), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const K = await import("../../components/repasoCap5/comun.jsx");
const { FEEDBACK, VEREDICTO } = await import("../../data/repasoCap5Comun.js");
const D1 = await import("../../data/repasoCap5Cruzado.js");
const T2 = await import("../../data/repasoCap5ToroNegroTextos.js");
const T3 = await import("../../data/repasoCap5MateTextos.js");
const T4 = await import("../../data/repasoCap5BarranquillaTextos.js");
const T5 = await import("../../data/repasoCap5PermanenteTextos.js");
const { RepasoCruzado } = await import("../../components/RepasoCapitulo5View.jsx");
const { ToroNegro } = await import("../../components/repasoCap5/ToroNegro.jsx");
const { Mate, MesContable } = await import("../../components/repasoCap5/Mate.jsx");
const { ACTIVIDAD_BARRANQUILLA } = await import("../../components/repasoCap5/Barranquilla.jsx");
const { Permanente } = await import("../../components/repasoCap5/Permanente.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const MAESTRO = leer("orquestador/conocimiento/prompts/disenadores-de-celula-v1.md");

/* La fuente del lote: repasoCap5/, la vista y los datos repasoCap5*. */
const CARPETA = "src/components/repasoCap5/";
const COMPONENTES = [
  ...readdirSync(new URL(CARPETA, RAIZ)).filter((f) => /\.(jsx|js)$/.test(f)).map((f) => CARPETA + f),
  "src/components/RepasoCapitulo5View.jsx",
];
const DATOS = readdirSync(new URL("src/data/", RAIZ)).filter((f) => /^repasoCap5.*\.js$/.test(f)).map((f) => `src/data/${f}`);
/* Sin comentarios: lo que se pinta, no lo que se explica. */
const sinComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/* ═══════════ EL MONTAJE ═══════════ */

const montados = [];
afterEach(() => { while (montados.length) montados.pop()(); });
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  let vivo = true;
  const desmontar = () => { if (!vivo) return; vivo = false; act(() => raiz.unmount()); caja.remove(); };
  montados.push(desmontar);
  return { caja, desmontar };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const escribir = async (input, texto) => {
  assert.ok(input, "no está el campo");
  const fijar = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { fijar.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const esperar = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });
const $ = (caja, s) => caja.querySelector(s);
/* Lo que se pinta fuera de la caja (las hojas van a document.body) también cuenta. */
const todo = () => document.body;

const P1 = D1.PANTALLAS_R5_1;
const IDS5 = T5.PANTALLAS.map((x) => x.id);

/* r5-1: responde una pantalla con la opción `id` (en la 3, vende antes las latas; en la 9, vacía los lotes). */
async function responderR5_1(caja, p, id) {
  if (p.forma === "latas") for (let k = 0; k < p.vender; k++) await tocar($(caja, `[data-lata="primera-${k}"]`));
  if (p.forma === "lotes") for (let k = 1; k <= p.lotes.length; k++) await tocar($(caja, `[data-lote="${k}"]`));
  await tocar($(caja, `[data-opcion="${id}"] button`));
}
/* r5-3 y r5-4: un renglón por la hoja de dos pasos. */
const anadir = async (caja, lado, cuenta, valor) => {
  await tocar($(caja, `[data-anadir="${lado}"]`));
  await tocar(document.querySelector(`[data-hoja-renglon] [data-cuenta="${cuenta}"]`));
  await escribir(document.querySelector("[data-hoja-renglon] input"), String(valor));
  await tocar(document.querySelector("[data-hoja-renglon] [data-listo]"));
};

/*
 * El recorrido: cada estado se monta, se mira con `mirar(raiz, nombre,
 * actividad)` y se desmonta. Devuelve cuántos estados miró (la guarda).
 */
async function recorrer(mirar) {
  let n = 0;
  const ver = async (nombre, actividad, el, jugar = null) => {
    const { desmontar, caja } = await montar(el);
    if (jugar) await jugar(caja);
    mirar(todo(), nombre, actividad);
    n++;
    desmontar();
  };
  /* r5-1: cada pantalla al abrir y, las de opciones, con un error. */
  for (const p of P1) {
    await ver(`r5-1 ${p.id}`, "r5-1", h(RepasoCruzado, { pantallas: [p] }));
    if (p.opciones) {
      const mala = p.opciones.find((o) => !o.correcta).id;
      await ver(`r5-1 ${p.id} mal`, "r5-1", h(RepasoCruzado, { pantallas: [p] }), (c) => responderR5_1(c, p, mala));
      await ver(`r5-1 ${p.id} mal, con otra detrás`, "r5-1", h(RepasoCruzado, { pantallas: [p, P1[0]] }), (c) => responderR5_1(c, p, mala));
    }
  }
  /* La 4 (fichas) con un error. */
  const c8 = P1.find((p) => p.forma === "fichas");
  const claveC8 = Object.fromEntries(c8.datos.map((d) => [d.id, d.signo === "+" ? "suma" : d.signo === "−" ? "resta" : "fuera"]));
  await ver("r5-1 c8 mal", "r5-1", h(RepasoCruzado, { pantallas: [c8] }), async (c) => {
    for (const [f, b] of Object.entries({ ...claveC8, ventas: "suma" })) await tocar($(c, `[data-ficha="${f}"] [data-boton="${b}"]`));
    await tocar($(c, "[data-revisar]"));
  });
  /* El final de r5-1. */
  await ver("r5-1 final", "r5-1", h(RepasoCruzado, { pantallas: [P1[1]] }), async (c) => {
    await responderR5_1(c, P1[1], P1[1].opciones[0].id);
    await tocar($(c, "[data-siguiente]"));
  });

  /* r5-2: la entrada, a0 al abrir y con error, P1 con error y P4 (saldo) con error. */
  const toro = () => h(ToroNegro, { preparar: () => ({ hoja: T2.HOJA_DE_CUENTAS }) });
  await ver("r5-2 entrada", "r5-2", toro());
  await ver("r5-2 a0", "r5-2", toro(), (c) => tocar($(c, "[data-siguiente]")));
  await ver("r5-2 a0 mal", "r5-2", toro(), async (c) => {
    await tocar($(c, "[data-siguiente]"));
    await escribir($(c, "[data-fila-grupo] input"), "1");
    await escribir($(c, "[data-fila-total] input"), "1");
    await tocar($(c, "[data-revisar]"));
  });

  /* r5-3: cada asiento al abrir; el primero y el último con un error. */
  for (let k = 0; k < T3.ASIENTOS_MATE.length; k++) await ver(`r5-3 asiento ${k + 1}`, "r5-3", h(Mate, { pasoInicial: k }));
  await ver("r5-3 al abrir (sin entrada: el asiento 1)", "r5-3", h(Mate, {}));
  for (const k of [0, T3.ASIENTOS_MATE.length - 1]) {
    await ver(`r5-3 asiento ${k + 1} mal`, "r5-3", h(Mate, { pasoInicial: k }), async (c) => {
      await anadir(c, "debe", T3.HOJA_MATE[0], 1);
      await anadir(c, "haber", T3.HOJA_MATE[1], 1);
      await tocar($(c, "[data-revisar]"));
      await esperar();
    });
  }
  /* r5-4: el primer asiento, con un error. */
  await ver("r5-4 asiento 1 mal", "r5-4", h(MesContable, { actividad: ACTIVIDAD_BARRANQUILLA, pasoInicial: 0 }), async (c) => {
    await anadir(c, "debe", ACTIVIDAD_BARRANQUILLA.HOJA_MATE[0], 1);
    await anadir(c, "haber", ACTIVIDAD_BARRANQUILLA.HOJA_MATE[1], 1);
    await tocar($(c, "[data-revisar]"));
    await esperar();
  });

  /* r5-5: la entrada y cada movimiento al abrir; la 3 y la 5 (un toque) con error. */
  await ver("r5-5 entrada", "r5-5", h(Permanente, {}));
  for (const [k, id] of IDS5.entries()) await ver(`r5-5 ${id}`, "r5-5", h(Permanente, { pasoInicial: k }));
  await ver("r5-5 p1 mal", "r5-5", h(Permanente, { pasoInicial: 0 }), async (c) => {
    await tocar($(c, "[data-eleccion=gasto]"));
    await escribir($(c, "[data-campo=unitario]"), "250000");
    await tocar($(c, "[data-revisar]"));
  });
  await ver("r5-5 p3 mal", "r5-5", h(Permanente, { pasoInicial: 2 }), (c) => tocar($(c, "[data-eleccion=\"9000\"]")));
  await ver("r5-5 p5 mal", "r5-5", h(Permanente, { pasoInicial: 4 }), async (c) => {
    const mala = T5.PANTALLAS[4].opciones.find((o) => !o.correcta);
    await tocar($(c, "[data-fila-del-diez]"));
    await tocar($(c, `[data-opcion="${mala.id}"] button`));
  });
  return n;
}
const ESTADOS_DEL_RECORRIDO = 45;

/* El estilo que vale para un elemento: el suyo o el del antepasado más cercano que lo fija. */
const heredado = (el, prop) => {
  for (let x = el; x && x.style; x = x.parentElement) if (x.style[prop]) return x.style[prop];
  return "";
};
/*
 * El recuadro de resultado del Cierre es COMPARTIDO (mecanicas/corazon/juego.jsx,
 * fuera del carril de la célula E): su «RESULTADO» va a 11 px. Es PARADA
 * avisada a Kamogawa; aquí se deja fuera de lo que se mira, con su nombre.
 */
const COMPARTIDO = ".fae-cz-entrar";
const nuestro = (el) => !el.closest(COMPARTIDO);
const estiloDe = (el) => `${el.getAttribute("style") ?? ""} ${["fill", "stroke"].map((a) => el.getAttribute(a) ?? "").join(" ")}`;

/* ═══════════ 1 · EL NAVY NO ES SUPERFICIE ═══════════ */

const NAVY = /#1D3557|29,\s*53,\s*87/i;

test("★★★ 1 · ningún #1D3557 como fondo en repasoCap5/: ni en la fuente ni pintado (guarda: 45 estados)", async () => {
  /* La fuente: ni la cifra ni un nombre que la guarde. */
  for (const f of COMPONENTES) {
    const s = sinComentarios(leer(f));
    assert.doesNotMatch(s, NAVY, `${f}: #1D3557 en el código`);
    assert.doesNotMatch(s, /\bC\.navy\b|\bnavy\b/i, `${f}: el navy por su nombre`);
  }
  assert.equal("navy" in K.C, false, "comun.jsx vuelve a ofrecer el navy");
  /* Lo pintado: ningún fondo, relleno ni sombra de anillo en navy. */
  const malos = [];
  const n = await recorrer((raiz, nombre) => {
    for (const el of [...raiz.querySelectorAll("*")].filter(nuestro)) {
      const st = el.style ?? {};
      const fondo = `${st.background ?? ""} ${st.backgroundColor ?? ""} ${st.boxShadow ?? ""} ${el.getAttribute("fill") ?? ""}`;
      if (NAVY.test(fondo)) malos.push(`${nombre}: <${el.tagName.toLowerCase()} ${[...el.attributes].map((a) => a.name).filter((a) => a.startsWith("data-")).join(" ")}>`);
    }
  });
  assert.equal(n, ESTADOS_DEL_RECORRIDO, "no recorrió los estados que dice recorrer");
  assert.deepEqual(malos, []);
});

/* ═══════════ 2 · NI ÁMBAR EN BOTONES NI EN EL FOCO ═══════════ */

const AMBAR = /E9C46A|233,\s*196,\s*106/i;

test("★★★ 2 · ningún ámbar en un botón ni en :focus; el foco es el anillo de 2 px #F8F9FA separado 2 px (guarda: 45 estados, 216 botones)", async () => {
  /* Las reglas de foco de la fuente, una por una. */
  const reglas = [];
  for (const f of COMPONENTES) {
    for (const m of sinComentarios(leer(f)).replace(/\$\{C\.texto\}/g, "#F8F9FA").matchAll(/[^{}`]*:focus[^{]*\{[^}]*\}/g)) reglas.push([f, m[0].trim()]);
  }
  assert.ok(reglas.length >= 3, "no encontró las reglas de foco que dice mirar");
  for (const [f, r] of reglas) {
    assert.doesNotMatch(r, /ambar|E9C46A|233,\s*196|\$\{/i, `${f}: ${r}`);
    assert.match(r, /outline:\s*2px solid #F8F9FA;\s*outline-offset:\s*2px/i, `${f}: ${r}`);
  }
  assert.match(K.CSS_FOCO, /button:focus-visible/);
  /* Lo pintado: los botones (y lo que llevan dentro) y las hojas de estilo montadas. */
  const malos = [];
  let botones = 0;
  const n = await recorrer((raiz, nombre) => {
    for (const b of [...raiz.querySelectorAll("button")].filter(nuestro)) {
      botones++;
      for (const el of [b, ...b.querySelectorAll("*")]) if (AMBAR.test(estiloDe(el))) malos.push(`${nombre}: ${b.textContent.slice(0, 40)}`);
    }
    for (const s of raiz.querySelectorAll("style")) {
      for (const m of s.textContent.matchAll(/[^{}]*:focus[^{]*\{[^}]*\}/g)) if (AMBAR.test(m[0])) malos.push(`${nombre}: ${m[0].trim()}`);
    }
  });
  assert.equal(n, ESTADOS_DEL_RECORRIDO);
  assert.equal(botones, 216, "no revisó los botones que dice revisar");
  assert.deepEqual([...new Set(malos)], []);
});

/* ═══════════ 3 · LAS TRES PALABRAS DEL FEEDBACK ═══════════ */

const MUERTAS = /\b(Correcta|Incorrecta|No es este valor|No es este lado|Era esta|Era este|ERA ESTE|Era:)(?![\wáéíóúñ])/;

test("★★★ 3 · los literales de feedback son exactamente los tres de §4.2, y las palabras muertas no vuelven (guarda: 45 estados)", async () => {
  /* Los tres, como los escribe el PROMPT MAESTRO. */
  const acierto = MAESTRO.match(/- Acierto: Check en #F8F9FA \+ "([^"]+)"/)[1];
  const error = MAESTRO.match(/- Error: X coral #E76F51 \+ "([^"]+)"/)[1];
  const revelada = MAESTRO.match(/- Respuesta correcta revelada: "([^"]+)"/)[1];
  const lector = MAESTRO.match(/El lector de pantalla dice "([^"]+)"/)[1];
  assert.deepEqual([acierto, error, revelada, lector], ["Correcto", "No va aquí", "Iba aquí", "Incorrecto."]);
  assert.deepEqual({ ok: FEEDBACK.ok, mal: FEEDBACK.mal, revelada: FEEDBACK.revelada, lectorMal: FEEDBACK.lectorMal }, { ok: acierto, mal: error, revelada, lectorMal: lector });
  /* Cada texto de interfaz que califica es uno de los tres. */
  const TRES = { ok: acierto, mal: error, revelada };
  assert.deepEqual(VEREDICTO, { cuenta: TRES, valor: TRES, lado: TRES });
  const I = D1.INTERFAZ_R5_1;
  assert.deepEqual([I.correcta, I.incorrecta, I.eraEsta], [acierto, error, revelada]);
  assert.deepEqual([T2.ROTULOS_R5_2.eraEste, T2.ROTULOS_A0.correcta, T2.ROTULOS_A0.era("2.283.400")], [revelada, acierto, `${revelada}: 2.283.400`]);
  assert.equal(T3.ROTULOS_MATE.eraEste, revelada);
  /* Lote de textos (Miyata): los aciertos de r5-2 a r5-5 no abren con «Bien.», «Correcto.» ni «Exacto.»; la pastilla ya lo dice. */
  const aciertos = [
    ...T2.PREGUNTAS_R5_2.map((p) => p.acierto),
    ...T3.ASIENTOS_MATE.flatMap((a) => a.acierto),
    ...T4.ASIENTOS_BARRANQUILLA.flatMap((a) => [].concat(a.acierto)),
    ...T5.PANTALLAS.flatMap((p) => [].concat(p.acierto)),
  ];
  assert.equal(aciertos.length, 32, "no miró los aciertos que dice mirar");
  assert.deepEqual(aciertos.filter((t) => /^(Bien|Correcto|Exacto)\./.test(t)), []);
  /* Ninguna palabra muerta en la fuente ni en los datos (las cadenas, sin comentarios). */
  for (const f of [...COMPONENTES, ...DATOS]) {
    const cadenas = [...sinComentarios(leer(f)).matchAll(/"([^"\n]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2]);
    const muertas = cadenas.filter((c) => MUERTAS.test(c));
    assert.deepEqual(muertas, [], f);
  }
  /* Lo pintado: cada pastilla dice una de las tres y nada dice una muerta. */
  const VALIDAS = new RegExp(`^(${acierto}|${error}${lector.replace(".", "\\.")}|${revelada}|${revelada}: [\\d.,]+)$`);
  const vistas = new Set();
  const malas = [];
  const n = await recorrer((raiz, nombre) => {
    for (const v of raiz.querySelectorAll("[data-veredicto]")) {
      vistas.add(v.dataset.veredicto);
      if (!VALIDAS.test(v.textContent)) malas.push(`${nombre}: ${v.textContent}`);
      /* Solo el error lleva X; solo el acierto, Check; la revelada, ningún ícono. */
      const icono = v.querySelector("svg")?.getAttribute("class")?.match(/lucide-(check|x)\b/)?.[1] ?? "ninguno";
      if (icono !== { ok: "check", mal: "x", revelada: "ninguno" }[v.dataset.veredicto]) malas.push(`${nombre}: ${v.dataset.veredicto} con ${icono}`);
    }
    const m = raiz.textContent.match(MUERTAS);
    if (m) malas.push(`${nombre}: «${m[0]}»`);
  });
  assert.equal(n, ESTADOS_DEL_RECORRIDO);
  assert.deepEqual([...vistas].sort(), ["mal", "ok", "revelada"], "el recorrido no vio las tres");
  assert.deepEqual(malas, []);
});

/* ═══════════ 4 · EL CONTADOR, SU BOTÓN Y EL RESPONDER ═══════════ */

const SUSTANTIVO = { "r5-1": "Pregunta", "r5-2": "Paso", "r5-3": "Asiento", "r5-4": "Asiento", "r5-5": "Movimiento" };

test("★★★ 4 · todo contador dice «{Sustantivo} n de N» y su botón «Siguiente {sustantivo}» (también en el aria-label); el último, «Ver mi resumen»", async () => {
  /* Los datos: el mismo sustantivo en el contador y en el botón. */
  const textos = { "r5-1": D1.INTERFAZ_R5_1, "r5-2": T2.ROTULOS_R5_2, "r5-3": T3.ROTULOS_MATE, "r5-5": T5.ROTULOS_PERMANENTE };
  for (const [a, x] of Object.entries(textos)) {
    assert.equal(x.sustantivo, SUSTANTIVO[a], a);
    assert.equal(x.progreso(3, 7), `${SUSTANTIVO[a]} 3 de 7`, a);
    assert.equal(K.textoDeAvance(x.sustantivo, false), `Siguiente ${SUSTANTIVO[a].toLowerCase()}`);
  }
  assert.equal(K.textoDeAvance("Pregunta", true), "Ver mi resumen");
  assert.equal(FEEDBACK.verMiResumen, MAESTRO.match(/en el último, "([^"]+)"/)[1]);
  assert.equal(FEEDBACK.comprobar, MAESTRO.match(/^- "([^"]+)" va cuando la respuesta tiene varios campos/m)[1]);
  /* Las piezas no escriben su propio avance: todas usan BotonSiguiente con su sustantivo. */
  for (const f of COMPONENTES) {
    const s = sinComentarios(leer(f));
    for (const m of s.matchAll(/<BotonSiguiente\b[^>]*>/g)) assert.match(m[0], /sustantivo=\{(INTERFAZ_R5_1|RT|RM|RP)\.sustantivo\}/, `${f}: ${m[0]}`);
    assert.doesNotMatch(s, /"Siguiente"|"Ver resultado"|"Revisar"/, f);
  }
  /* Lo pintado. */
  const CONTADOR = /^(\S+) (\d+) de (\d+)$/;
  const vistos = { contador: new Set(), boton: new Set() };
  const malos = [];
  const n = await recorrer((raiz, nombre, actividad) => {
    const sust = SUSTANTIVO[actividad];
    for (const c of raiz.querySelectorAll("[data-progreso]")) {
      const m = c.textContent.match(CONTADOR);
      if (!m || m[1] !== sust || Number(m[2]) > Number(m[3])) malos.push(`${nombre}: contador «${c.textContent}»`);
      if (c.style.fontSize !== "12px" || c.style.color !== "rgb(168, 182, 200)" || c.style.textTransform === "uppercase") malos.push(`${nombre}: contador con ${c.getAttribute("style")}`);
      vistos.contador.add(actividad);
    }
    for (const b of raiz.querySelectorAll("[data-siguiente]")) {
      const t = b.textContent;
      if (t !== `Siguiente ${sust.toLowerCase()}` && t !== "Ver mi resumen") malos.push(`${nombre}: botón «${t}»`);
      if (b.getAttribute("aria-label") !== t) malos.push(`${nombre}: aria-label «${b.getAttribute("aria-label")}»`);
      vistos.boton.add(t);
    }
    /* «Comprobar» y el avance son el Responder: teal, texto #06202A, Sora 14/700; apagado, #A8B6C8 sobre rgba(248,249,250,.07). */
    for (const b of raiz.querySelectorAll("[data-siguiente], [data-revisar], [data-revisar-valores], [data-revisar-asiento], [data-empezar]")) {
      const s = b.style;
      const apagado = b.getAttribute("aria-disabled") === "true";
      const esperado = apagado ? ["rgba(248, 249, 250, 0.07)", "rgb(168, 182, 200)"] : ["rgb(42, 157, 143)", "rgb(6, 32, 42)"];
      if (s.background !== esperado[0] || s.color !== esperado[1] || s.fontFamily !== "Sora, sans-serif" || s.fontSize !== "14px" || s.fontWeight !== "700") malos.push(`${nombre}: «${b.textContent}» no es el Responder`);
      if (b.disabled) malos.push(`${nombre}: «${b.textContent}» con disabled (sale de la tabulación)`);
    }
    /* Donde un toque elige, ese toque califica: sin «Comprobar». */
    if (/^r5-1 c(1|3|5|6|9|10) |^r5-5 p(3|5) /.test(`${nombre} `) && raiz.querySelector("[data-revisar]")) malos.push(`${nombre}: «Comprobar» donde un toque elige`);
  });
  assert.equal(n, ESTADOS_DEL_RECORRIDO);
  assert.deepEqual([...vistos.contador].sort(), ["r5-1", "r5-2", "r5-3", "r5-4", "r5-5"], "el recorrido no vio los cinco contadores");
  assert.deepEqual([...vistos.boton].sort(), ["Siguiente asiento", "Siguiente movimiento", "Siguiente paso", "Siguiente pregunta", "Ver mi resumen"]);
  assert.deepEqual(malos, []);
});

/* ═══════════ 5 · LAS CIFRAS, EN LA PILA MONOESPACIADA ═══════════ */

/* Una cifra suelta: con punto de miles o coma decimal, con su signo, su $ o su «u». */
const CIFRA = /^[−+-]?\s?\$?\s?\d{1,3}(\.\d{3})+(,\d{1,2})?( u)?$|^[−+-]?\s?\$?\s?\d+,\d{1,2}$/;
/* Sora solo para la cifra de resultado (§5.3): el contador en vivo de C.8, «n de m» y el % del cierre. */
const RESULTADO = "[data-valor-contador], [data-n-de-m], [data-cierre] [data-pct], [data-resultado-cifra]";

test("★★★ 5 · las cifras van en ui-monospace, SFMono-Regular, Menlo, Consolas con tabular-nums (guarda: 45 estados, 191 cifras)", async () => {
  assert.equal(K.MONO, "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace");
  assert.deepEqual(K.CIFRA, { fontFamily: K.MONO, fontVariantNumeric: "tabular-nums" });
  const malas = [];
  let cifras = 0;
  const n = await recorrer((raiz, nombre) => {
    const hojas = [...raiz.querySelectorAll("span, p, div, td, li, label, strong, text, tspan, button")].filter((el) => nuestro(el) && !el.children.length && CIFRA.test(el.textContent.trim()));
    const campos = [...raiz.querySelectorAll("input")].filter((i) => i.getAttribute("inputmode") === "numeric" || i.getAttribute("inputmode") === "decimal");
    for (const el of [...hojas, ...campos]) {
      cifras++;
      const fuente = heredado(el, "fontFamily") || el.getAttribute("font-family") || "";
      const mono = fuente.startsWith("ui-monospace") && heredado(el, "fontVariantNumeric") === "tabular-nums";
      const resultado = fuente.startsWith("Sora") && el.closest(RESULTADO);
      if (!mono && !resultado) malas.push(`${nombre}: «${el.textContent || el.value || el.getAttribute("placeholder")}» en ${fuente || "(sin fuente)"}`);
    }
  });
  assert.equal(n, ESTADOS_DEL_RECORRIDO);
  assert.equal(cifras, 191, "no miró las cifras que dice mirar");
  assert.deepEqual([...new Set(malas)], []);
});

/* ═══════════ 6 · NADA BAJO 12 PX SALVO LA CEJILLA ═══════════ */

test("★★★ 6 · ningún font-size bajo 12 px salvo la cejilla del título (10,5): fuente y pantalla (guarda: 45 estados)", async () => {
  assert.equal(K.CEJILLA.fontSize, "10.5px");
  assert.equal(K.MARCA.fontSize, "12px");
  /* La fuente: todo tamaño escrito, en px, en número o en CSS. */
  const chicos = [];
  for (const f of COMPONENTES) {
    const s = sinComentarios(leer(f));
    for (const m of s.matchAll(/font(?:Size|-size)\s*[:=]\s*\{?\s*["'`]?(\d+(?:\.\d+)?)(px)?/g)) {
      if (Number(m[1]) < 12 && !(f.endsWith("comun.jsx") && /CEJILLA = \{ \.\.\.MARCA, fontSize: "10\.5px"/.test(s.slice(Math.max(0, m.index - 40), m.index + 30)))) chicos.push(`${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(chicos, []);
  /* Lo pintado: solo la cejilla (10,5 con .12em) baja de 12. */
  const malos = [];
  let cejillas = 0;
  const n = await recorrer((raiz, nombre) => {
    for (const el of [...raiz.querySelectorAll("*")].filter(nuestro)) {
      const t = el.style?.fontSize || el.getAttribute("font-size") || "";
      const px = parseFloat(t);
      if (!t || Number.isNaN(px) || px >= 12) continue;
      if (px === 10.5 && el.style.letterSpacing === "0.12em") { cejillas++; continue; }
      malos.push(`${nombre}: ${t} en «${el.textContent.slice(0, 30)}»`);
    }
  });
  assert.equal(n, ESTADOS_DEL_RECORRIDO);
  assert.ok(cejillas > 0, "no vio la cejilla");
  assert.deepEqual([...new Set(malos)], []);
});
