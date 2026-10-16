/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PISO DE 12 PX, MEDIDO EN LA PÁGINA.
 *
 * La regla está en kit.md: ningún texto que el estudiante tenga que leer baja
 * de 12 px. Hasta hoy se comprobaba con `grep fontSize` sobre los archivos, y
 * así se encontraron cinco sitios. Esta sonda, sobre el paquete construido,
 * encontró 112 en seis rutas.
 *
 * POR QUÉ EL GREP NO LLEGA:
 *
 *   · un tamaño heredado no aparece en el archivo del texto: el `span` que se
 *     lee a 9,5 px no dice nada, lo dice su contenedor;
 *   · un tamaño en `em` o en `rem` depende de dónde cuelgue;
 *   · un tamaño en una hoja de CSS no está en ningún `fontSize:`;
 *   · y un `fontSize: "11px"` que ningún estado llega a pintar es un falso
 *     positivo que hace perder la tarde.
 *
 * Lo que mide: cada elemento con texto propio visible, su `font-size`
 * calculado, y de paso si algo se sale del ancho. Mide el texto QUE SE VE: si
 * una pantalla no se abre, no se mide, y lo dice.
 *
 * CÓMO SE CORRE (hace falta el paquete construido y servido):
 *
 *   VITE_SUPABASE_URL=https://x.supabase.co VITE_SUPABASE_ANON_KEY=x npm run build
 *   (cd dist && python3 -m http.server 8099 &)
 *   node scripts/piso-de-12.mjs 320
 *
 * El alto del marco va holgado a propósito: a 900 px varias pantallas dejan
 * contenido fuera, y lo que no se pinta no se mide. Es el mismo error que la
 * primera sonda de blancos de toque.
 *
 * LOS JUEGOS (Célula B, T5 y T6). Una ruta con `juego` entra al camino de
 * Hacer, toca el nodo del juego y mide cuatro pantallas: «Así se juega», la
 * primera del juego, la que queda después de un fallo y la que queda después
 * de un acierto. La retroalimentación cuenta: es texto que se lee.
 *
 *   · `opciones` (cajones, elección, casillas): cada pasada abre el juego en
 *     una página nueva y toca otra opción del primer ítem, hasta haber visto
 *     un fallo y un acierto. Math.random va con semilla fija, para que el
 *     primer ítem sea el mismo en todas las pasadas.
 *   · `mesa` (asientos): la primera pasada arma un asiento cuadrado pero
 *     equivocado; el juego revela el correcto, se lee de la mesa, y la
 *     segunda pasada lo escribe.
 *
 * Una pantalla que no se alcanza no se mide, y lo dice. Las «cejillas» (un
 * rótulo corto en mayúsculas encima de un bloque, como «RESULTADO») pueden
 * quedar por debajo de 12: la sonda las marca con «cejilla?» para la prueba
 * del dedo, pero las sigue contando en el total, como antes.
 *
 * El puerto se cambia con PUERTO=8137 si el 8099 está ocupado.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import pkg from "/opt/npm-tools/node_modules/playwright-core/index.js";
const { chromium } = pkg;

const ANCHO = Number(process.argv[2] ?? 320);
const PISO = 11.95; /* 11,95 y no 12: un 12 px calculado puede llegar como 11,999 */
const RAIZ = `http://127.0.0.1:${process.env.PUERTO ?? 8099}/`;

const RUTAS = [
  { n: "T1 Aprender", p: ["Contabilidad", "Introducción a la contabilidad", "El material que explica"] },
  { n: "T2 Aprender", p: ["Contabilidad", "Las cuentas, el debe y el haber", "El material que explica"] },
  { n: "T3 Aprender", p: ["Contabilidad", "Ingresos, gastos y ajustes", "El material que explica"] },
  { n: "T5 Aprender", p: ["Contabilidad", "Activos financieros temporales", "El material que explica"] },
  { n: "T6 Aprender", p: ["Contabilidad", "Cuentas por cobrar", "El material que explica"] },
  { n: "T1 Hacer", p: ["Contabilidad", "Introducción a la contabilidad", "Los juegos que dan FP"] },
  /*
   * Célula B. Aprender de T5 y T6 recorrido: cada «Siguiente» de la capa 2 hasta el último paso, y
   * cada pregunta de la capa 3 respondida (una pasada con la primera opción, otra con la última:
   * así sale una devolución de fallo y una de acierto). Después, el camino de Hacer y cada juego
   * (b5-t6-a7 está retirado).
   */
  { n: "T5 Aprender · recorrido", p: ["Contabilidad", "Activos financieros temporales", "El material que explica"], recorrer: true },
  { n: "T6 Aprender · recorrido", p: ["Contabilidad", "Cuentas por cobrar", "El material que explica"], recorrer: true },
  { n: "T5 Hacer", p: ["Contabilidad", "Activos financieros temporales", "Los juegos que dan FP"] },
  { n: "T6 Hacer", p: ["Contabilidad", "Cuentas por cobrar", "Los juegos que dan FP"] },
  ...[["b5-t5-a1", "opciones"], ["b5-t5-a2", "mesa"]].map(([id, tipo]) => (
    { n: id, p: ["Contabilidad", "Activos financieros temporales", "Los juegos que dan FP"], juego: { id, tipo } })),
  ...[["b5-t6-a1", "opciones"], ["b5-t6-a2", "mesa"], ["b5-t6-a3", "mesa"], ["b5-t6-a4", "opciones"], ["b5-t6-a5", "opciones"], ["b5-t6-a6", "opciones"]]
    .map(([id, tipo]) => ({ n: id, p: ["Contabilidad", "Cuentas por cobrar", "Los juegos que dan FP"], juego: { id, tipo } })),
];

/* Lo que mide una pantalla: el texto propio bajo el piso, los desbordes y el scroll horizontal. */
function medirPantalla(piso) {
  const chicas = [], desbordes = [];
  let cejillas = 0;
  for (const el of document.querySelectorAll("body *")) {
    const caja = el.getBoundingClientRect();
    if (!caja.width || !caja.height) continue;
    const clase = (el.className || "").toString();
    if (!clase.includes("fae-mesh-blob") && (caja.right > window.innerWidth + 1 || caja.left < -1)) {
      desbordes.push(el.tagName.toLowerCase() + "." + clase.split(" ")[0]);
    }
    /* Texto PROPIO: si no, el <div> de arriba se lleva la culpa de su hijo. */
    if (![...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim().length > 1)) continue;
    const estilo = getComputedStyle(el);
    const px = parseFloat(estilo.fontSize);
    if (px < piso) {
      const datos = [...el.attributes].filter((a) => a.name.startsWith("data-")).map((a) => a.name).join(",");
      /* Candidata a cejilla: corta y en mayúsculas (por CSS o escrita así). La decide la prueba del dedo. */
      const propio = [...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join("").trim();
      const mayus = estilo.textTransform === "uppercase" || (/\p{L}/u.test(propio) && propio === propio.toUpperCase());
      const cejilla = mayus && propio.length <= 48;
      const linea = `${px}px  ${el.tagName.toLowerCase()}${clase ? "." + clase.split(" ")[0] : ""}${datos ? "[" + datos + "]" : ""}  «${el.textContent.trim().slice(0, 30)}»${cejilla ? "  cejilla?" : ""}`;
      if (!chicas.includes(linea)) { chicas.push(linea); if (cejilla) cejillas += 1; }
    }
  }
  return { desbordes: [...new Set(desbordes)], chicas, cejillas,
           texto: (document.body.innerText || "").trim().length,
           scrollH: document.documentElement.scrollWidth > window.innerWidth + 1 };
}

/* Math.random con semilla (mulberry32): el mismo orden de ítems en cada pasada. */
const SEMILLA = () => {
  let a = 20261015;
  Math.random = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pausa = (pagina) => pagina.waitForTimeout(600);

async function abrir(ruta, errores) {
  const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: 1400 } });
  if (ruta.juego) await pagina.addInitScript(SEMILLA);
  pagina.on("pageerror", (e) => errores.push(String(e).slice(0, 70)));
  await pagina.goto(RAIZ, { waitUntil: "networkidle" });
  for (const paso of ruta.p) {
    await pagina.locator(`button:visible:has-text("${paso}")`).first().click({ timeout: 8000 });
    await pausa(pagina);
  }
  return pagina;
}

/* Del camino al juego: el nodo, y «Así se juega» (que se mide antes de salir con «Siguiente»). */
async function entrarAlJuego(pagina, id, alEntrar) {
  await pagina.locator(`[data-nodo="${id}"]:visible`).first().click({ timeout: 8000 });
  await pausa(pagina);
  if (alEntrar) await alEntrar();
  await pagina.locator(`button:visible:has-text("Siguiente")`).first().click({ timeout: 8000 });
  await pausa(pagina);
}

/*
 * El veredicto de la última respuesta: por la marca de la opción (data-estado «correcta» /
 * «incorrecta», data-marca «tachada») y, si no la hay, por lo que se anuncia («Incorrecto: »).
 */
const veredicto = (pagina) => pagina.evaluate(() => {
  if (document.querySelector('[data-estado="incorrecta"], [data-marca="tachada"]')) return "fallo";
  if (document.querySelector('[data-estado="correcta"]')) return "acierto";
  const t = document.body.textContent;
  return /Incorrecto/.test(t) ? "fallo" : /Correcto/.test(t) ? "acierto" : null;
});

const OPCION = `button[data-cajon]:visible:not([disabled]), button[data-estado="libre"]:visible:not([disabled])`;

/* La unión de varias medidas de la misma página: lo que haya salido en cualquiera de sus estados. */
function unir(medidas) {
  const chicas = [...new Set(medidas.flatMap((m) => m.chicas))];
  return { chicas, cejillas: chicas.filter((c) => c.endsWith("cejilla?")).length,
           desbordes: [...new Set(medidas.flatMap((m) => m.desbordes))],
           texto: Math.min(...medidas.map((m) => m.texto)), scrollH: medidas.some((m) => m.scrollH) };
}

/* Aprender recorrido: los pasos de la capa 2 y las preguntas de la capa 3, en dos pasadas. */
async function recorrerAprender(ruta, errores) {
  const medidas = [];
  for (const orden of ["primera", "última"]) {
    const pagina = await abrir(ruta, errores);
    try {
      medidas.push(await pagina.evaluate(medirPantalla, PISO));
      for (let vuelta = 0; vuelta < 30; vuelta++) {
        const siguientes = pagina.locator(`button[data-siguiente]:visible:not([disabled])`);
        if (!(await siguientes.count())) break;
        await siguientes.first().click({ timeout: 5000 });
        await pagina.waitForTimeout(250);
        medidas.push(await pagina.evaluate(medirPantalla, PISO));
      }
      /* Las preguntas: cada grupo de [data-opcion] que siga abierto, con su primera (o última) opción. */
      for (let vuelta = 0; vuelta < 40; vuelta++) {
        const libres = pagina.locator(`button[data-opcion][data-elegida="no"]:visible:not([disabled])`);
        const n = await libres.count();
        if (!n) break;
        const antes = await pagina.evaluate(() => document.querySelectorAll('[data-elegida="si"]').length);
        await libres.nth(orden === "primera" ? 0 : n - 1).click({ timeout: 5000 });
        await pagina.waitForTimeout(350);
        medidas.push(await pagina.evaluate(medirPantalla, PISO));
        const despues = await pagina.evaluate(() => document.querySelectorAll('[data-elegida="si"]').length);
        if (despues <= antes) break; /* el clic no hizo nada: no se insiste */
      }
    } finally { await pagina.close(); }
  }
  return { ...unir(medidas), estados: medidas.length };
}

/* Las pantallas de un juego: { nombre: medida }. Las que no se alcanzan quedan fuera, y se dice. */
async function pantallasDelJuego(ruta, errores) {
  const { id, tipo } = ruta.juego;
  const pantallas = {};
  const medir = async (pagina, nombre) => { if (!pantallas[nombre]) pantallas[nombre] = await pagina.evaluate(medirPantalla, PISO); };

  if (tipo === "opciones") {
    for (let k = 0; k < 4 && !(pantallas.fallo && pantallas.acierto); k++) {
      const pagina = await abrir(ruta, errores);
      try {
        await entrarAlJuego(pagina, id, () => medir(pagina, "así se juega"));
        await medir(pagina, "inicio");
        const opciones = pagina.locator(OPCION);
        if (k >= (await opciones.count())) break;
        await opciones.nth(k).click({ timeout: 5000 });
        await pausa(pagina);
        const v = await veredicto(pagina);
        if (v) await medir(pagina, v);
        /* Cajones: tras un primer fallo queda un intento; se toca otra opción (segundo fallo o acierto). */
        if (v === "fallo" && (await pagina.locator(OPCION).count()) > 0 && !(await pagina.locator(`button:visible:has-text("Siguiente")`).count())) {
          await pagina.locator(OPCION).first().click({ timeout: 5000 });
          await pausa(pagina);
          /* La marca del primer fallo sigue puesta: el segundo fallo se reconoce porque revela «(respuesta correcta)». */
          const v2 = await pagina.evaluate(() => /respuesta correcta/.test(document.body.textContent));
          await medir(pagina, v2 ? "segundo fallo" : "acierto");
        }
      } finally { await pagina.close(); }
    }
  } else {
    /* Pasada 1: un asiento cuadrado pero equivocado. El juego revela el correcto; se lee. */
    let correcto = [];
    let pagina = await abrir(ruta, errores);
    try {
      await entrarAlJuego(pagina, id, () => medir(pagina, "así se juega"));
      await medir(pagina, "inicio");
      await pagina.locator(`button[data-sacar$=":debe"]:visible`).first().click();
      await pagina.locator(`button[data-sacar$=":haber"]:visible`).first().click();
      for (const campo of await pagina.locator("[data-campo-cifra]").all()) await campo.fill("1000");
      await pausa(pagina);
      await medir(pagina, "mesa armada");
      await pagina.locator("[data-confirmar-parte]").first().click();
      await pausa(pagina);
      await medir(pagina, "fallo");
      correcto = await pagina.evaluate(() => [...document.querySelectorAll("[data-en-mesa]")].map((m) => ({
        cuenta: m.dataset.enMesa, lado: m.closest("[data-columna]").dataset.columna, valor: m.querySelector("input").value })));
    } finally { await pagina.close(); }
    /* Pasada 2: el mismo asiento, bien. */
    pagina = await abrir(ruta, errores);
    try {
      await entrarAlJuego(pagina, id);
      for (const { cuenta, lado } of correcto) await pagina.locator(`button[data-sacar="${cuenta}:${lado}"]`).first().click();
      for (const { cuenta, valor } of correcto) await pagina.locator(`[data-campo-cifra="${cuenta}"]`).fill(valor);
      await pagina.locator("[data-confirmar-parte]").first().click();
      await pausa(pagina);
      if ((await pagina.locator(`[data-panel="acierto"]`).count()) > 0) await medir(pagina, "acierto");
    } finally { await pagina.close(); }
  }
  return pantallas;
}

const navegador = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
console.log(`——— piso de 12 px · ${ANCHO} px ———`);
let total = 0;
let totalCejillas = 0;
let medidas = 0;
const informar = (n, r, errores) => {
  total += r.chicas.length;
  totalCejillas += r.cejillas;
  medidas += 1;
  const bien = r.chicas.length === 0 && r.desbordes.length === 0 && !r.scrollH && r.texto > 50 && errores.length === 0;
  console.log(`${bien ? "✅" : "⚠️ "} ${n.padEnd(12)} bajo 12 px: ${String(r.chicas.length).padStart(3)}${r.cejillas ? ` (cejillas? ${r.cejillas})` : ""} · desborde ${r.desbordes.length} · scrollH ${r.scrollH}${errores.length ? " · JS " + errores[0] : ""}`);
  for (const c of r.chicas) console.log("        " + c);
};
/* SOLO=b5-t6 mide solo las rutas cuyo nombre lo contiene (para repetir una sin esperar las demás). */
const ELEGIDAS = process.env.SOLO ? RUTAS.filter((r) => r.n.includes(process.env.SOLO)) : RUTAS;
for (const ruta of ELEGIDAS) {
  const { n } = ruta;
  const errores = [];
  if (ruta.recorrer) {
    try { const r = await recorrerAprender(ruta, errores); informar(`${n} (${r.estados} estados)`, r, errores); }
    catch (e) { console.log(`   ✗ ${n.padEnd(12)} no se pudo recorrer: ${String(e).slice(0, 60)} — NO se midió`); }
    continue;
  }
  if (ruta.juego) {
    try {
      const pantallas = await pantallasDelJuego(ruta, errores);
      for (const pantalla of ["así se juega", "inicio", "mesa armada", "fallo", "segundo fallo", "acierto"]) {
        if (pantallas[pantalla]) informar(`${n} · ${pantalla}`, pantallas[pantalla], errores);
      }
      for (const falta of ["inicio", "fallo", "acierto"].filter((x) => !pantallas[x])) {
        console.log(`   ✗ ${n} · ${falta}: no se alcanzó — NO se midió`);
      }
    } catch (e) {
      console.log(`   ✗ ${n.padEnd(12)} no se pudo jugar: ${String(e).slice(0, 60)} — NO se midió`);
    }
    continue;
  }
  const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: 1400 } });
  pagina.on("pageerror", (e) => errores.push(String(e).slice(0, 70)));
  try {
    await pagina.goto(RAIZ, { waitUntil: "networkidle" });
    for (const paso of ruta.p) {
      await pagina.locator(`button:visible:has-text("${paso}")`).first().click({ timeout: 8000 });
      await pagina.waitForTimeout(600);
    }
    informar(n, await pagina.evaluate(medirPantalla, PISO), errores);
  } catch (e) {
    console.log(`   ✗ ${n.padEnd(12)} no se pudo abrir: ${String(e).slice(0, 60)} — NO se midió`);
  }
  await pagina.close();
}
console.log(`\n${total === 0 ? "✅" : "⚠️ "} ${total} texto(s) por debajo de 12 px en ${medidas} pantallas de ${ELEGIDAS.length} rutas${totalCejillas ? ` (${totalCejillas} con forma de cejilla)` : ""}.`);
await navegador.close();
