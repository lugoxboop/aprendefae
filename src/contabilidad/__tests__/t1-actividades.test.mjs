import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · T1-1 «¿DESDE DÓNDE PREGUNTAN?» y T1-2 «¿QUÉ ENTRÓ Y QUÉ SALIÓ?»
 *
 * Lo que aquí se rompe en silencio son dos cosas.
 *
 * La primera es que la ZONA y el TRAZO se confundan. Pertenecer a la empresa
 * y decidir lo que la empresa hace son dos cosas distintas: un propietario
 * está dentro y no decide. Si el trazo se encendiera por acertar, estaría
 * diciendo que interno significa «el que manda», que es justo la confusión
 * que la actividad ataca.
 *
 * La segunda es la MATRIZ de T1-2. Ocho explicaciones para veinte cruces, y
 * la ficha llegó con dos intercambiadas respecto a sus propios textos. Una
 * matriz mal cableada no falla: solo le cuenta a un estudiante la confusión
 * de otro.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const DesdeDondePreguntan = (await import("../../components/mecanicas/libros/tema1/DesdeDondePreguntan.jsx")).default;
const QueEntroYQueSalio = (await import("../../components/mecanicas/libros/tema1/QueEntroYQueSalio.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  INTERNOS, EXTERNOS, sortearT1_1, evaluarT1_1, sortearT1_2, evaluarT1_2,
  claveDelError, CLASES_IDS, puntuar, pesoDeCadaItem, sinObjeto,
  preguntaDeUsuario, empresaDeItem, PATRON_A, PATRON_B,
  correctaSegundaT1_2,
} = await import("../tema1.js");
const {
  USUARIOS_T1_1, EMPRESAS, CLASES, ERROR_T1_2, ERROR_T1_1, SIN_INSUMO,
  ZONA_DENTRO, ZONA_FUERA, T1_1, T1_2, ACIERTO_T1_1, ACIERTO_T1_2, ROTULO_ZONA,
} = await import("../../data/contabilidadTema1.js");
const { USUARIOS } = await import("../../data/contabilidadIntro.js");
const { barajar } = await import("../../utils/barajar.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { FAE } = await import("../../theme.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

const montar = (Comp) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Comp, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => new RegExp(texto, "i").test(b.textContent));

/* ═══════════════════ T1-1 · LAS DOS SEÑALES ═══════════════════ */

test("★★★ la zona sale del tipo del libro: los tres internos y nadie más", () => {
  assert.deepEqual(
    INTERNOS.map((u) => u.id).sort(),
    ["administradores", "empleados", "propietarios"],
    "los usuarios internos del libro son los propietarios, los administradores y los empleados",
  );
  assert.equal(EXTERNOS.length, 5);
  /* Y la zona no se declara aparte: se deduce del tipo que ya tiene la pieza 1. */
  for (const u of USUARIOS_T1_1) {
    const enLaPieza = USUARIOS.find((x) => x.id === u.id);
    assert.equal(u.zona, enLaPieza.tipo === "interno" ? ZONA_DENTRO : ZONA_FUERA, u.id);
  }
});

test("★★★ pertenecer a la empresa y cerrar el ciclo son DOS señales distintas", () => {
  const dentroQueNoDeciden = INTERNOS.filter((u) => !u.cierraElCiclo);
  assert.ok(dentroQueNoDeciden.length >= 2,
    "si todos los internos cerraran el ciclo, las dos señales serían la misma y la actividad no enseñaría nada");
  for (const u of dentroQueNoDeciden) {
    const r = evaluarT1_1(u, ZONA_DENTRO);
    assert.equal(r.ok, true, u.id);
    assert.equal(r.enciendeTrazo, false, `${u.id} está dentro y NO decide: el trazo no puede encenderse`);
  }
  const admin = USUARIOS_T1_1.find((u) => u.id === "administradores");
  assert.equal(evaluarT1_1(admin, ZONA_DENTRO).enciendeTrazo, true);
});

test("★★★ en un error el trazo NO se enciende nunca, ni con la administración", () => {
  for (const u of USUARIOS_T1_1) {
    const malaZona = u.zona === ZONA_DENTRO ? ZONA_FUERA : ZONA_DENTRO;
    const r = evaluarT1_1(u, malaZona);
    assert.equal(r.ok, false, u.id);
    assert.equal(r.enciendeTrazo, false, `${u.id}: el trazo se encendió en un error`);
  }
});

test("★★ el patrón del error lo decide de dónde es el usuario, no qué zona tocó", () => {
  for (const u of USUARIOS_T1_1) {
    const malaZona = u.zona === ZONA_DENTRO ? ZONA_FUERA : ZONA_DENTRO;
    const r = evaluarT1_1(u, malaZona);
    assert.equal(r.patron, u.zona === ZONA_DENTRO ? PATRON_A : PATRON_B, u.id);
    assert.equal(r.texto, ERROR_T1_1[r.patron].texto);
  }
});

test("★★★ el sorteo es 2 internos y 4 externos, siempre", () => {
  /*
   * Enumerado sobre 300 sorteos. Libre, uno de cada varios intentos daría un
   * solo interno, y a quien crea que «interno» es «el que manda» le bastaría
   * con acertar los externos por descarte.
   */
  for (let k = 0; k < 300; k += 1) {
    const s = sortearT1_1(barajar);
    assert.equal(s.length, T1_1.porPartida, `vuelta ${k}`);
    assert.equal(new Set(s.map((u) => u.id)).size, s.length, `vuelta ${k}: uno repetido`);
    assert.equal(s.filter((u) => u.zona === ZONA_DENTRO).length, 2, `vuelta ${k}: el reparto no es 2+4`);
  }
});

test("★ los ocho tienen devolución de acierto, y los cuatro de la ficha van textuales", () => {
  for (const u of USUARIOS_T1_1) {
    const r = evaluarT1_1(u, u.zona);
    assert.ok(r.texto.startsWith("✅"), u.id);
    assert.ok(!/\{/.test(r.texto), `${u.id}: quedó un hueco`);
    if (ACIERTO_T1_1[u.id]) assert.equal(r.texto, ACIERTO_T1_1[u.id], `${u.id} no usa el texto de la ficha`);
  }
});

/* ═══════════════════ T1-2 · LA MATRIZ ═══════════════════ */

test("★★★ los veinte cruces tienen explicación, y ninguna cae en el vacío", () => {
  for (const marcada of CLASES_IDS) {
    for (const real of CLASES_IDS) {
      if (marcada === real) continue;
      const clave = claveDelError(marcada, real);
      assert.ok(clave, `${marcada} contra ${real}: sin clave`);
      assert.ok(ERROR_T1_2[clave], `${marcada} contra ${real}: la clave ${clave} no tiene texto`);
    }
  }
});

test("★★★ E y G no están intercambiadas: cada texto describe su propio caso", () => {
  /*
   * Aquí estaba el error de la ficha. E es «marcaste servicios y SÍ había un
   * objeto»; G es «era de servicios y NO había nada que entrara». Si se
   * cruzan, al estudiante se le señala el recuadro equivocado.
   *
   * Se comprueba contra lo que cada texto dice de sí mismo, no contra la tabla.
   */
  const e = claveDelError("servicios", "comercial");
  assert.equal(e, "E", "marcar servicios cuando era comercial tiene que ser E");
  assert.ok(ERROR_T1_2.E.includes("sí hay una cosa que puedes señalar"),
    "el texto de E dejó de hablar de la cosa que sí existe");

  const g = claveDelError("comercial", "servicios");
  assert.equal(g, "G", "marcar comercial cuando era de servicios tiene que ser G");
  /*
   * La G cita el recuadro de entrada a mano, ahora que no hay interpolación.
   * Se comprueba contra la cadena que el banco de verdad escribe ahí: si
   * `SIN_INSUMO` cambiara de redacción, esta explicación citaría una frase que
   * no está en pantalla, y eso falla aquí en vez de pasar inadvertido.
   */
  assert.ok(ERROR_T1_2.G.includes(SIN_INSUMO),
    `la G cita el recuadro de entrada y el banco escribe «${SIN_INSUMO}»`);

  /* Y cualquier cruce con servicios de un lado u otro cae en la que le toca. */
  for (const otra of CLASES_IDS.filter((c) => c !== "servicios")) {
    assert.equal(claveDelError("servicios", otra), "E", `servicios contra ${otra}`);
    assert.equal(claveDelError(otra, "servicios"), "G", `${otra} contra servicios`);
  }
});

test("★★ la matriz es simétrica fuera de servicios: la confusión es la misma en los dos sentidos", () => {
  const sinServicios = CLASES_IDS.filter((c) => c !== "servicios");
  for (const a of sinServicios) {
    for (const b of sinServicios) {
      if (a === b) continue;
      assert.equal(claveDelError(a, b), claveDelError(b, a), `${a} contra ${b} no es simétrico`);
    }
  }
});

test("★★ el recuadro de entrada nunca va vacío, y «sin insumo» es el dato", () => {
  for (const e of EMPRESAS) {
    assert.ok(e.entra && e.entra.trim().length > 0, `${e.id}: el recuadro ENTRA está en blanco`);
    assert.ok(e.sale && e.sale.trim().length > 0, `${e.id}: el recuadro SALE está en blanco`);
    /* Y las que no reciben nada lo dicen con todas sus letras. */
    if (sinObjeto(e)) assert.equal(e.entra, SIN_INSUMO, e.id);
  }
  /* Las de servicios y las mineras son justamente las que no reciben objeto. */
  for (const e of EMPRESAS.filter((x) => ["servicios", "minera"].includes(x.clase))) {
    assert.ok(sinObjeto(e), `${e.id} es de ${e.clase} y declara un insumo físico`);
  }
});

test("★★★ el sorteo trae al menos una de cada clase, y las dos agropecuarias rotan", () => {
  const vistas = new Map(EMPRESAS.map((e) => [e.id, 0]));
  for (let k = 0; k < 300; k += 1) {
    const s = sortearT1_2(barajar);
    assert.equal(s.length, T1_2.porPartida, `vuelta ${k}`);
    assert.equal(new Set(s.map((e) => e.id)).size, s.length, `vuelta ${k}: una repetida`);
    for (const c of CLASES_IDS) {
      assert.ok(s.some((e) => e.clase === c), `vuelta ${k}: falta la clase ${c}`);
    }
    for (const e of s) vistas.set(e.id, vistas.get(e.id) + 1);
  }
  /*
   * Con una sola agropecuaria en el banco, esa casilla no sorteaba nada: la
   * misma empresa salía forzada en los 300 intentos. Con dos, las dos salen.
   */
  const agro = EMPRESAS.filter((e) => e.clase === "agropecuaria");
  assert.equal(agro.length, 2, "el banco volvió a tener una sola agropecuaria");
  for (const e of agro) assert.ok(vistas.get(e.id) > 0, `${e.id} no salió ni una vez en 300 sorteos`);
});

test("★ acertar trae la relación; fallar no la trae nunca", () => {
  for (const e of EMPRESAS) {
    const bien = evaluarT1_2(e, e.clase);
    assert.equal(bien.ok, true, e.id);
    assert.equal(bien.relacion, e.relacion, `${e.id}: el trazo no dice la relación`);
    assert.ok(bien.texto.startsWith("✅"));

    const otra = CLASES_IDS.find((c) => c !== e.clase);
    const mal = evaluarT1_2(e, otra);
    assert.equal(mal.ok, false, e.id);
    assert.equal(mal.relacion, null, `${e.id}: el fallo enseñó la relación, que es la respuesta`);
    assert.ok(mal.texto.startsWith("❌"));
    assert.ok(!/\{/.test(mal.texto), `${e.id}: quedó un hueco sin llenar`);
  }
});

/*
 * ═══════════ YA NO QUEDA NINGÚN HUECO POR RELLENAR ═══════════
 *
 * Aquí había una prueba de que la explicación A se rellenaba con lo que había
 * pasado de verdad: «lo que salió sí es / no es lo mismo» según la empresa. Los
 * textos nuevos son fijos y esa interpolación se retiró.
 *
 * Lo que queda por vigilar es el resto que puede dejar una interpolación al
 * irse: una llave sin rellenar se pinta tal cual en pantalla —«dice {entra}»—
 * y no rompe nada.
 */
test("★★ ninguna explicación quedó con un hueco sin rellenar", () => {
  for (const [clave, texto] of Object.entries(ERROR_T1_2)) {
    assert.ok(!texto.includes("{"), `la explicación ${clave} conserva un hueco: «${texto}»`);
  }
  for (const [id, texto] of Object.entries(ACIERTO_T1_2)) {
    assert.ok(!texto.includes("{"), `el acierto de ${id} conserva un hueco`);
  }
  /* Y las dos explicaciones que se rellenaban siguen siendo las de su cruce. */
  const comercial = EMPRESAS.find((e) => e.clase === "comercial");
  const industrial = EMPRESAS.find((e) => e.clase === "industrial");
  assert.equal(evaluarT1_2(comercial, "industrial").clave, "A");
  assert.equal(evaluarT1_2(industrial, "comercial").clave, "A");
  assert.equal(evaluarT1_2(comercial, "industrial").texto, ERROR_T1_2.A);
});

/*
 * ═══════════ LAS DEVOLUCIONES ESTÁN TODAS, Y NO HAY REPUESTO ═══════════
 *
 * Antes faltaban y se servía un genérico —el de la zona en T1-1, el de la clase
 * en T1-2—, los dos redactados por mí. Ahora la ficha trae las diecinueve, y
 * evaluar sin la suya se cae en vez de disimular.
 */
test("★★ los ocho usuarios y las once empresas tienen su propia devolución", () => {
  for (const u of USUARIOS_T1_1) {
    const texto = evaluarT1_1(u, u.zona).texto;
    assert.ok(texto.startsWith("✅"), `${u.id}: el acierto perdió su marca`);
    assert.equal(texto, ACIERTO_T1_1[u.id], `${u.id}: no sirve su propio texto`);
  }
  for (const e of EMPRESAS) {
    assert.equal(evaluarT1_2(e, e.clase).texto, ACIERTO_T1_2[e.id], `${e.id}: no sirve su propio texto`);
  }
  /* Y ninguna se repite: dos usuarios con el mismo acierto es una que falta. */
  assert.equal(new Set(Object.values(ACIERTO_T1_1)).size, USUARIOS_T1_1.length);
  assert.equal(new Set(Object.values(ACIERTO_T1_2)).size, EMPRESAS.length);
});

test("★★ si a un usuario le falta su devolución, evaluar se cae", () => {
  const inventado = { id: "no-existe", zona: "dentro", cierraElCiclo: false };
  assert.throws(() => evaluarT1_1(inventado, "dentro"), /no tiene devolución/,
    "sirvió un texto de repuesto en vez de avisar");
});

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LITERALIDAD · lo que se pinta contra el archivo de contenido.
 *
 * Mismo espíritu que la prueba que fijó los ids de ítem: el texto del
 * estudiante vive en un solo archivo y esto comprueba que en pantalla sale ESE
 * y no otro. No compara contra cadenas escritas aquí —eso solo diría que dos
 * copias coinciden—: compara la pantalla contra la fuente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

test("★★ el objetivo y la consigna están, y se quedan toda la partida", () => {
  for (const [Comp, a] of [[DesdeDondePreguntan, T1_1], [QueEntroYQueSalio, T1_2]]) {
    const { caja, desmontar } = montar(Comp);
    try {
      /*
       * Se comprueba que se VEN, no solo que están en el árbol. Un `hidden` o
       * un `display: none` dejan el texto en `textContent` tal cual, así que
       * una prueba que solo lea el texto da por buena una línea que el
       * estudiante no tiene delante. Salió de un mutante que sobrevivió
       * poniéndole `hidden` a la consigna.
       */
      const visible = (el, que) => {
        assert.ok(el, `${a.id}: no hay ${que}`);
        assert.equal(el.hidden, false, `${a.id}: ${que} está oculta con hidden`);
        assert.notEqual(getComputedStyle(el).display, "none", `${a.id}: ${que} está en display none`);
        assert.notEqual(getComputedStyle(el).visibility, "hidden", `${a.id}: ${que} está en visibility hidden`);
        return el;
      };
      const enc = () => caja.querySelector("[data-encabezado]");
      visible(enc(), "el encabezado");
      assert.equal(visible(caja.querySelector("[data-objetivo]"), "el objetivo").textContent,
        a.objetivo, `${a.id}: objetivo`);
      assert.equal(visible(caja.querySelector("[data-consigna]"), "la consigna").textContent,
        a.consigna, `${a.id}: consigna`);

      /*
       * Y siguen ahí después de responder. La consigna es una línea fija, no un
       * aviso de bienvenida: quien se pierde a mitad de la tanda tiene que
       * poder volver a leer qué le piden.
       */
      const primera = caja.querySelector("[data-zona], [data-clase]");
      tocar(primera);
      visible(enc(), "el encabezado después de responder");
      assert.equal(visible(caja.querySelector("[data-consigna]"), "la consigna después de responder").textContent,
        a.consigna, `${a.id}: la consigna cambió al responder`);
    } finally { desmontar(); }
  }
});

test("★★ la consigna no reemplaza al vacío: son dos líneas distintas", () => {
  /* T1-1 ya no tiene vacío (Bloque 2 de «Así se juega»); T1-2 lo conserva. */
  assert.equal(T1_1.pregunta, undefined, "T1-1 volvió a tener pregunta de vacío");
  for (const a of [T1_2]) {
    assert.ok(a.consigna && a.pregunta, `${a.id}: falta una de las dos`);
    assert.notEqual(a.consigna, a.pregunta, `${a.id}: la consigna y el vacío son el mismo texto`);
  }
  /* El vacío pregunta; la consigna manda hacer algo. */
  for (const a of [T1_2]) {
    assert.ok(a.pregunta.includes("¿"), `${a.id}: el vacío dejó de preguntar`);
    assert.ok(!a.consigna.includes("¿"), `${a.id}: la consigna se volvió una pregunta`);
  }
});

test("★★ los rótulos de zona marcan el lugar y nada más", () => {
  assert.equal(ROTULO_ZONA[ZONA_DENTRO], "ADENTRO");
  assert.equal(ROTULO_ZONA[ZONA_FUERA], "AFUERA");
  /*
   * Y no repiten «de la empresa», que ya está dicho en la consigna y en el
   * vacío. En un rótulo de 9,5 px esa coletilla solo gastaba ancho.
   */
  for (const cual of [ZONA_DENTRO, ZONA_FUERA]) {
    assert.ok(!ROTULO_ZONA[cual].toLowerCase().includes("empresa"),
      `el rótulo de ${cual} volvió a nombrar la empresa`);
  }
  const { caja, desmontar } = montar(DesdeDondePreguntan);
  try {
    for (const cual of [ZONA_DENTRO, ZONA_FUERA]) {
      const z = caja.querySelector(`[data-zona="${cual}"]`);
      assert.ok(z.textContent.includes(ROTULO_ZONA[cual]), `${cual}: el rótulo no sale en pantalla`);
      assert.equal(z.getAttribute("aria-label"), ROTULO_ZONA[cual], `${cual}: aria-label`);
    }
  } finally { desmontar(); }
});

/*
 * ═══════════ NADA SE SALE DEL PANEL ═══════════
 *
 * Salió de una captura a 375 px: la zona de fuera llevaba `width: 100%` y un
 * margen izquierdo de 26 px, así que medía 26 px más que su sitio y el borde
 * punteado se cortaba contra el filo de la pantalla. El DOM no tenía nada que
 * decir al respecto y no aparecía barra de scroll, así que ninguna prueba lo
 * veía.
 *
 * Esta lo mide. JSDOM no maqueta, así que no puede comprobar píxeles: lo que
 * comprueba es la causa —que ninguna caja de la actividad declare a la vez un
 * ancho completo y un margen—, que es la combinación que lo produjo.
 */
test("★★ ninguna zona pide el ancho entero y además un margen", () => {
  const { caja, desmontar } = montar(DesdeDondePreguntan);
  try {
    for (const z of caja.querySelectorAll("[data-zona]")) {
      const s = z.style;
      const conMargen = s.marginLeft && s.marginLeft !== "0px" && s.marginLeft !== "0";
      const anchoEntero = s.width === "100%";
      assert.ok(!(conMargen && anchoEntero),
        `la zona «${z.dataset.zona}» mide 100% y además se desplaza ${s.marginLeft}: se sale del panel`);
    }
  } finally { desmontar(); }
});

/*
 * Los aciertos dicen «Adentro» y «Afuera», y los rótulos también. Antes decían
 * «DENTRO DE LA EMPRESA» y «FUERA» mientras la devolución decía otra cosa, y
 * quien acertaba leía dos palabras distintas para el mismo sitio.
 */
test("★★ el acierto nombra la zona con la misma palabra que el rótulo", () => {
  for (const u of USUARIOS_T1_1) {
    const palabra = ROTULO_ZONA[u.zona];
    const texto = ACIERTO_T1_1[u.id];
    assert.ok(texto.toUpperCase().includes(palabra),
      `${u.id}: el acierto dice «${texto.slice(2, 12).trim()}» y el rótulo «${palabra}»`);
  }
});

/* ═══════════════════ PUNTAJE Y PANEL ═══════════════════ */

test("seis ítems en las dos, y el reintento vale la mitad", () => {
  for (const a of [T1_1, T1_2]) {
    assert.equal(a.porPartida, 6);
    assert.equal(a.fpBase, 10);
    assert.equal(a.dificultad, "facil");
  }
  assert.equal(pesoDeCadaItem(6).toFixed(2), (100 / 6).toFixed(2));
  const seis = Array.from({ length: 6 }, (_, k) => ({ id: k }));
  assert.equal(puntuar(seis.map((x) => ({ ...x, primeroOk: true })), 6), 100);
  assert.equal(puntuar(seis.map((x) => ({ ...x, primeroOk: false, segundoOk: true })), 6), 50);
  assert.equal(puntuar(seis.map((x) => ({ ...x, primeroOk: false, segundoOk: false })), 6), 0);
});

test("★ el panel docente sabe leer las dos", () => {
  for (const u of USUARIOS_T1_1) {
    const e = etiquetaDeItem("t1-desde-donde-preguntan", u.id);
    assert.ok(e, `${u.id} sin etiqueta`);
  }
  for (const x of EMPRESAS) {
    const e = etiquetaDeItem("t1-que-entro-y-que-salio", x.id);
    assert.ok(e && e.includes(x.empresa), `${x.id} sin etiqueta`);
  }
  assert.equal(preguntaDeUsuario("inventado"), null);
  assert.equal(empresaDeItem("inventado"), null);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★ T1-1: el anillo sale con la estación 5 encendida y el retorno atenuado", () => {
  const { caja, desmontar } = montar(DesdeDondePreguntan);
  const est = [...caja.querySelectorAll("[data-estacion]")];
  assert.equal(est.length, 5);
  assert.equal(est.filter((e) => e.getAttribute("data-encendida") === "si").length, 1);
  assert.equal(est[4].getAttribute("data-encendida"), "si", "la encendida tiene que ser la quinta");
  assert.equal(caja.querySelector("[data-franja]").getAttribute("data-retorno"), "atenuado");
  desmontar();
});

test("★★ T1-1: las zonas se distinguen por posición y rótulo, no por color", () => {
  const { caja, desmontar } = montar(DesdeDondePreguntan);
  const dentro = caja.querySelector('[data-zona="dentro"]');
  const fuera = caja.querySelector('[data-zona="fuera"]');
  assert.ok(dentro && fuera);
  /* La de dentro toca la franja; la de fuera se separa con un blanco real. */
  assert.equal(dentro.style.marginLeft, "0px");
  assert.ok(parseInt(fuera.style.marginLeft, 10) > 0, "la zona de fuera tiene que estar separada");
  /* Y las dos llevan su rótulo escrito. */
  assert.ok(dentro.getAttribute("aria-label").includes("DENTRO"));
  assert.ok(fuera.getAttribute("aria-label").includes("FUERA"));
  /* Ninguna usa un fondo que clasifique por tono. */
  assert.equal(dentro.style.background, "transparent");
  assert.equal(fuera.style.background, "transparent");
  desmontar();
});

test("★★★ T1-1: un error no asienta nada y no enciende el trazo", () => {
  const { caja, desmontar } = montar(DesdeDondePreguntan);
  const id = caja.querySelector("[data-pregunta]").getAttribute("data-pregunta");
  const u = USUARIOS_T1_1.find((x) => x.id === id);
  const mala = u.zona === ZONA_DENTRO ? ZONA_FUERA : ZONA_DENTRO;

  tocar(caja.querySelector(`[data-zona="${mala}"]`));
  assert.equal(Boolean(caja.querySelector("[data-asentada]")), false, "se asentó algo tras un error");
  assert.equal(caja.querySelector("[data-franja]").getAttribute("data-retorno"), "atenuado");
  assert.ok(caja.querySelector("[data-fallo]"), "falta el aviso de que volvió a flotar");
  assert.match(caja.querySelector("[data-fallo]").style.border, CORAL);
  desmontar();
});

test("★★★ T1-1: al acertar la pregunta SE ASIENTA, y sigue habiendo dónde verlo", () => {
  /*
   * Salió mirándolo en el navegador: al responder desaparecían las zonas, y
   * con ellas el sitio donde la pregunta tenía que asentarse. La animación
   * principal de la actividad no se veía nunca.
   */
  const { caja, desmontar } = montar(DesdeDondePreguntan);
  const id = caja.querySelector("[data-pregunta]").getAttribute("data-pregunta");
  const u = USUARIOS_T1_1.find((x) => x.id === id);

  tocar(caja.querySelector(`[data-zona="${u.zona}"]`));
  const asentada = caja.querySelector("[data-asentada]");
  assert.ok(asentada, "la pregunta no se asentó en ninguna parte");
  assert.equal(asentada.getAttribute("data-asentada"), u.id);
  assert.equal(asentada.closest("[data-zona]").getAttribute("data-zona"), u.zona);
  desmontar();
});

test("★★ T1-2: el trazo con la relación solo aparece al acertar", () => {
  const { caja, desmontar } = montar(QueEntroYQueSalio);
  const id = caja.querySelector("[data-empresa]").getAttribute("data-empresa");
  const e = EMPRESAS.find((x) => x.id === id);
  assert.equal(Boolean(caja.querySelector("[data-trazo]")), false, "el trazo estaba antes de responder");

  const otra = CLASES_IDS.find((c) => c !== e.clase);
  tocar(caja.querySelector(`[data-clase="${otra}"]`));
  assert.equal(Boolean(caja.querySelector("[data-trazo]")), false, "el fallo enseñó el trazo");
  assert.equal(caja.querySelectorAll('[data-clase][data-marcada="si"]').length, 0,
    "quedó una clase marcada tras un error");

  tocar(caja.querySelector(`[data-clase="${e.clase}"]`));
  assert.equal(caja.querySelector("[data-trazo]").getAttribute("data-trazo"), e.relacion);
  desmontar();
});

test("★★ T1-2: el recuadro de entrada nunca se dibuja vacío", () => {
  const { caja, desmontar } = montar(QueEntroYQueSalio);
  const entra = caja.querySelector('[data-recuadro="ENTRA"]');
  assert.ok(entra.textContent.replace("ENTRA", "").trim().length > 0,
    "el recuadro de entrada quedó en blanco y se lee como un error de carga");
  desmontar();
});

test("★ T1-2: se juegan seis y ninguna se repite", () => {
  const { caja, desmontar } = montar(QueEntroYQueSalio);
  const vistas = [];
  for (let k = 0; k < T1_2.porPartida; k += 1) {
    const id = caja.querySelector("[data-empresa]").getAttribute("data-empresa");
    const e = EMPRESAS.find((x) => x.id === id);
    vistas.push(id);
    tocar(caja.querySelector(`[data-clase="${e.clase}"]`));
    /*
     * La segunda decisión (D4) es obligatoria para avanzar: una decisión que
     * se puede saltar no es una decisión. Así que la tanda se recorre
     * contestando las dos, no solo la clase.
     */
    tocar(caja.querySelector(`[data-opcion-segunda="${correctaSegundaT1_2(e)}"]`));
    tocar(boton(caja, k + 1 === T1_2.porPartida ? "Ver el resultado" : "Siguiente empresa"));
  }
  assert.equal(new Set(vistas).size, T1_2.porPartida);
  desmontar();
});

test("★★ ni un signo del Tema 2 se cuela en las dos actividades", () => {
  for (const Comp of [DesdeDondePreguntan, QueEntroYQueSalio]) {
    const { caja, desmontar } = montar(Comp);
    /*
     * Dentro del CONTENIDO, no del marco. El teal y el ámbar siguen siendo los
     * colores de la interfaz —rótulos de sección, botones, encabezados— y ahí
     * no significan debe ni haber: significan «esto es AprendeFAE». Lo que no
     * pueden hacer es entrar donde el estudiante está razonando.
     */
    const contenido = caja.querySelector("[data-contenido]");
    assert.ok(contenido, "la actividad no delimita su contenido");
    /* Los rótulos de sección son marca, no contenido: se apartan antes de mirar. */
    const copia = contenido.cloneNode(true);
    for (const rot of copia.querySelectorAll("[data-rotulo-seccion]")) rot.remove();
    assert.ok(copia.querySelectorAll("*").length > 5, "se apartó tanto que no queda nada que mirar");
    const html = copia.innerHTML;
    assert.ok(!html.includes("▲"), "se coló el ▲ de crecimiento");
    assert.equal(caja.querySelectorAll("[data-arco], [data-balanza], [data-ancla], [data-colector]").length, 0,
      "se coló un arco, una balanza, un anclaje o un colector");
    const TEAL = /#52C4B0|rgba?\(\s*82,\s*196,\s*176/i;
    const AMBAR = /#E9C46A|rgba?\(\s*233,\s*196,\s*106/i;
    assert.ok(!TEAL.test(html), "se coló el teal de «debe»");
    assert.ok(!AMBAR.test(html), "se coló el ámbar de «haber»");
    desmontar();
  }
});
