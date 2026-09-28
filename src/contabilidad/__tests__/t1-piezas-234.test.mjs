import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — las piezas 2, 3 y 4.
 *
 * Cuatro cosas se rompen sin hacer ruido.
 *
 * 1 · LA TORRE ES UNA SOLA. La pieza 2 ataca la creencia de que si un lado
 *     sube el otro baja, y lo hace enseñando UNA columna leída dos veces. Dos
 *     columnas enfrentadas, o un rótulo al lado del bloque equivocado, y la
 *     pieza enseña lo contrario de lo que dice. Sin que nada falle.
 *
 * 2 · LAS DOS FOTOS MIDEN LO MISMO. Que una fuera más grande diría que pesa
 *     más, y las dos son igual de reales en momentos distintos.
 *
 * 3 · LA BANDA NO ES LA FRANJA DEL ANILLO. Ni su patrón ni su pulso. Aquella
 *     significa «el ciclo de la información» y reusarla aquí la vaciaría.
 *
 * 4 · CERO CIFRAS EN LA PIEZA 4. El Gráfico 2.6 escribe «xxxxx» en todas sus
 *     líneas. Un número en pantalla está inventado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
/*
 * Movimiento reducido ENCENDIDO. No es por comodidad: con la animación puesta,
 * los tres componentes bloquean Repetir y Siguiente mientras la transformación
 * corre —eso es parte de lo que hacen, y está bien— y en JSDOM ese reloj no
 * avanza nunca, así que ningún paso se podría recorrer. Con movimiento
 * reducido la transformación no corre y los pasos se recorren igual que los
 * recorrería alguien que la tiene desactivada en su teléfono.
 */
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

const LaEcuacionContable = (await import("../../components/mecanicas/libros/intro/LaEcuacionContable.jsx")).default;
const ExploraLosCuatroCasos = (await import("../../components/mecanicas/libros/intro/ExploraLosCuatroCasos.jsx")).default;
const UnaFraseEcuacion = (await import("../../components/mecanicas/libros/intro/UnaFraseEcuacion.jsx")).default;
const LaFotoYLaPelicula = (await import("../../components/mecanicas/libros/intro/LaFotoYLaPelicula.jsx")).default;
const ExploraFotoOPelicula = (await import("../../components/mecanicas/libros/intro/ExploraFotoOPelicula.jsx")).default;
const UnaFraseFotoPelicula = (await import("../../components/mecanicas/libros/intro/UnaFraseFotoPelicula.jsx")).default;
const ComoSeArticulan = (await import("../../components/mecanicas/libros/intro/ComoSeArticulan.jsx")).default;
const ExploraLasFlechas = (await import("../../components/mecanicas/libros/intro/ExploraLasFlechas.jsx")).default;
const UnaFraseArticulacion = (await import("../../components/mecanicas/libros/intro/UnaFraseArticulacion.jsx")).default;
const Torre = (await import("../../components/mecanicas/libros/intro/Torre.jsx")).default;
const { torreEnPantalla } = await import("../../components/mecanicas/libros/intro/Torre.jsx");
const { ESCENAS_INTRO } = await import("../../components/mecanicas/libros/intro/escenasIntro.jsx");
const CuatroCapas = (await import("../../components/mecanicas/maquinas/CuatroCapas.jsx")).default;

const {
  tramosDeLaTorre, cambioDelCaso, movimientoDelCaso, evaluarP3, escenaDeAcierto,
  modoDeFlecha, informeQueRecibeP4, LAS_QUE_VIAJAN, evaluarOpcionP2, evaluarOpcionP3, evaluarOpcionP4,
} = await import("../aprenderTema1.js");
const {
  PIEZAS_INTRO, PIEZA_2, PIEZA_3, PIEZA_4, ID_P2, ID_P3, ID_P4,
  BLOQUES, CASOS_P2, NOTA_CAPA3_P2, OPCIONES_P2, SUBEN, BAJAN, DEL_BANCO, DE_LOS_DUENOS,
  FOTOS, PREGUNTAS_P3, RESPUESTAS_P3, ERROR_P3, OPCIONES_P3, FOTO, PELICULA, COMPARAR, ALT_P3,
  FLECHAS_P4, LINEAS_P4, OPCIONES_P4, INFORMES_P4, TEXTOS_P4, CIERRE_P4,
} = await import("../../data/contabilidadPiezas234.js");
const { ID } = await import("../../data/contabilidadIntro.js");
const { PRIMERO } = await import("../../data/contabilidadTema1.js");

const montar = (Comp, props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Comp, props)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const boton = (caja, sel) => caja.querySelector(sel);

const TEAL = /#52C4B0|#2a9d8f|rgba?\(\s*82,\s*196,\s*176|rgba?\(\s*42,\s*157,\s*143/i;
const AMBAR = /#E9C46A|rgba?\(\s*233,\s*196,\s*106/i;

/* ═══════════════════ LAS CUATRO PIEZAS ═══════════════════ */

test("★★ las cuatro piezas están, en orden, y todas son material teórico", async () => {
  const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
  assert.deepEqual(PIEZAS_INTRO.map((p) => p.id), [ID, ID_P2, ID_P3, ID_P4]);

  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === "introduccion-contabilidad");
  for (const p of PIEZAS_INTRO) {
    const fila = tema.actividades.find((a) => a.id === p.id);
    assert.ok(fila, `${p.id}: no está en el catálogo`);
    assert.equal(fila.clasificacion.tipo, APRENDER);
    assert.equal(fila.clasificacion.fpBase, undefined, `${p.id}: una pieza de Aprender no puede dar FP`);
    assert.equal(fila.clasificacion.dificultad, undefined, `${p.id}: una pieza de Aprender no tiene dificultad`);
    /* Y cada una tiene sus tres capas montadas. */
    const e = ESCENAS_INTRO[p.id];
    assert.ok(e?.Capa2 && e?.Exploracion && e?.Capa4, `${p.id}: le falta alguna capa`);
  }
});

test("★★ ninguna pieza reusa la figura de otra", () => {
  const figuras = { [ID_P2]: "[data-torre]", [ID_P3]: "[data-banda]", [ID_P4]: "[data-tres-informes]" };
  for (const [id, propia] of Object.entries(figuras)) {
    const { caja, desmontar } = montar(ESCENAS_INTRO[id].Capa2);
    try {
      assert.ok(caja.querySelector(propia), `${id}: no dibuja su propia figura`);
      for (const [otra, sel] of Object.entries(figuras)) {
        if (otra === id) continue;
        assert.equal(caja.querySelectorAll(sel).length, 0, `${id}: dibuja la figura de ${otra}`);
      }
      /*
       * Y ninguna trae el anillo de cinco puntos de la pieza 1 ni su franja:
       * aquel dibujo ya significa «el ciclo de la información».
       */
      assert.equal(caja.querySelectorAll("[data-franja], [data-estacion], [data-anillo]").length, 0,
        `${id}: se coló el anillo o la franja de la pieza 1`);
    } finally { desmontar(); }
  }
});

test("★★★ la definición del libro va debajo de la idea simple, nunca arriba", () => {
  const vacia = () => React.createElement("div");
  for (const p of [PIEZA_2, PIEZA_3, PIEZA_4]) {
    const conCita = p.nombres.filter((n) => n.delLibro);
    assert.ok(conCita.length > 0, `${p.id}: ninguna línea cita el libro`);
    const { caja, desmontar } = montar(CuatroCapas, {
      pieza: p, Capa2: vacia, Exploracion: vacia, Capa4: vacia,
    });
    try {
      const capa1 = caja.querySelector('[data-capa="1"]');
      const texto = capa1.textContent;
      for (const n of conCita) {
        assert.ok(capa1.querySelector("[data-del-libro]"), `${p.id}: la cita no se pinta`);
        assert.ok(texto.includes(n.delLibro), `${p.id}: la cita no sale en pantalla`);
        assert.ok(texto.indexOf(n.definicion) < texto.indexOf(n.delLibro),
          `${p.id}: la cita del libro se adelantó a la idea simple en «${n.termino}»`);
        /* Y la idea simple no ES la cita. */
        assert.notEqual(n.definicion, n.delLibro);
      }
    } finally { desmontar(); }
  }
});

/* ═══════════════════ PIEZA 2 · LA TORRE ═══════════════════ */

test("★★★ las tres columnas de la torre se recorren en el mismo orden", () => {
  const { celdas, tramos } = torreEnPantalla(null);
  assert.equal(celdas.length, BLOQUES.length);
  /*
   * La torre se apila desde abajo, así que en pantalla va al revés. Lo que se
   * comprueba es que las celdas y los tramos cuenten la misma historia: el
   * bloque k de la lista de celdas tiene que pertenecer al tramo que le toca
   * según dónde caiga. Aquí estuvo el fallo que cazó una captura: los rótulos
   * de la izquierda iban en un orden y los bloques en el otro, y «plata»
   * quedaba al lado de la máquina.
   */
  assert.deepEqual(celdas.map((c) => c.bloque.id), [...BLOQUES].reverse().map((b) => b.id));
  let i = 0;
  for (const t of tramos) {
    for (let k = 0; k < t.bloques.length; k += 1, i += 1) {
      assert.equal(celdas[i].tramo, t.tramo,
        `la celda ${i} dice «${celdas[i].tramo}» y el tramo que la cubre dice «${t.tramo}»`);
    }
  }

  /*
   * ═══════════ Y EN PANTALLA, NO SOLO EN LA FUNCIÓN ═══════════
   *
   * Comprobar `torreEnPantalla` no basta: el fallo original no estaba ahí sino
   * en el componente, que pintaba la columna de rótulos en un orden y la de
   * bloques en otro. La función devolvía lo correcto y la pantalla mentía.
   * Sobrevivió un mutante que volvía a invertir una de las dos.
   */
  for (const cambio of [null, ...CASOS_P2.map(cambioDelCaso)]) {
    const { caja, desmontar } = montar(Torre, { lado: "ambas", cambio });
    try {
      const izq = [...caja.querySelectorAll("[data-izq]")].map((e) => e.dataset.izq);
      const blo = [...caja.querySelectorAll("[data-bloque]")].map((e) => e.dataset.bloque);
      assert.deepEqual(izq, blo,
        `con cambio ${cambio?.tramo ?? "ninguno"}: los rótulos no están al lado de su bloque`);
      /* Y cada rótulo dice lo que su bloque es. */
      for (const e of caja.querySelectorAll("[data-izq]")) {
        if (e.dataset.izq === "extra") { assert.equal(e.textContent, ""); continue; }
        const b = BLOQUES.find((x) => x.id === e.dataset.izq);
        assert.equal(e.textContent, b.izquierda, `el rótulo de ${b.id} dice otra cosa`);
      }
    } finally { desmontar(); }
  }
});

test("★★★ el caso decide QUÉ tramo se mueve, no solo cuánto mide la torre", () => {
  for (const c of CASOS_P2) {
    /*
     * El lado que se mueve se comprueba contra el NOMBRE del caso, que es
     * textual del libro, y no contra el campo `lado` —eso sería comparar el
     * campo consigo mismo—. Sobrevivió un mutante que cambiaba el caso c de
     * pasivo a patrimonio: la torre movía el tramo de los dueños mientras el
     * rótulo seguía diciendo «disminución en activo y en pasivo».
     */
    const nombre = c.nombre.toLowerCase();
    const diceElPasivo = nombre.includes("pasivo");
    const dicePatrimonio = nombre.includes("patrimonio");
    assert.notEqual(diceElPasivo, dicePatrimonio, `caso ${c.id}: el nombre no dice qué lado se mueve`);
    assert.equal(c.lado, diceElPasivo ? "pasivo" : "patrimonio",
      `caso ${c.id}: el nombre dice «${c.nombre}» y el lado que se mueve es «${c.lado}»`);
    /* Y el sentido también sale del nombre: aumento o disminución. */
    assert.equal(c.mueve, nombre.startsWith("aumento") ? SUBEN : BAJAN,
      `caso ${c.id}: el nombre dice «${c.nombre}» y el movimiento es «${c.mueve}»`);

    const cambio = cambioDelCaso(c);
    const esperado = diceElPasivo ? DEL_BANCO : DE_LOS_DUENOS;
    assert.equal(cambio.tramo, esperado, `caso ${c.id}: se mueve el tramo equivocado`);
    assert.equal(cambio.signo, c.mueve === SUBEN ? 1 : -1, `caso ${c.id}: el signo no es el del caso`);

    const base = torreEnPantalla(null);
    const despues = torreEnPantalla(cambio);
    /* La torre entera cambia de tamaño en el sentido que el caso dice. */
    assert.equal(Math.sign(despues.celdas.length - base.celdas.length), cambio.signo,
      `caso ${c.id}: la torre no se mueve en el sentido del caso`);

    /* Y el que cambia es SU tramo, no otro. */
    const mide = (r, tramo) => r.tramos.filter((t) => t.tramo === tramo)
      .reduce((s, t) => s + t.bloques.length + t.extra, 0);
    assert.equal(Math.sign(mide(despues, cambio.tramo) - mide(base, cambio.tramo)), cambio.signo,
      `caso ${c.id}: el tramo que se movió no es el que dice el caso`);
    const elOtro = cambio.tramo === DEL_BANCO ? DE_LOS_DUENOS : DEL_BANCO;
    assert.equal(mide(despues, elOtro), mide(base, elOtro), `caso ${c.id}: se movió el otro tramo`);
  }
});

/*
 * ═══════════ LOS DOS LADOS NUNCA VAN EN SENTIDOS CONTRARIOS ═══════════
 *
 * Es lo único que la pieza afirma, y no se comprueba leyendo una tabla: se
 * comprueba en los cuatro casos del libro, porque en los cuatro la función
 * devuelve el MISMO movimiento para los dos lados.
 */
test("★★★ en los cuatro casos los dos lados se mueven hacia el mismo sitio", () => {
  assert.equal(CASOS_P2.length, 4);
  for (const c of CASOS_P2) {
    const m = movimientoDelCaso(c);
    assert.equal(m.izquierda, m.derecha, `caso ${c.id}: un lado sube y el otro baja`);
    assert.ok(m.izquierda === SUBEN || m.izquierda === BAJAN);
  }
  /* Y hay de los dos: dos que suben y dos que bajan. */
  const suben = CASOS_P2.filter((c) => movimientoDelCaso(c).izquierda === SUBEN);
  assert.equal(suben.length, 2, "los cuatro casos van todos para el mismo lado");
});

test("★★★ la nota de la capa 3 nunca dice que uno sube y el otro baja", () => {
  assert.equal(NOTA_CAPA3_P2, "En el caso a suben las dos. En el c bajan las dos.");
  const { caja, desmontar } = montar(ExploraLosCuatroCasos);
  try {
    const nota = caja.querySelector("[data-nota]");
    assert.equal(nota.textContent, NOTA_CAPA3_P2);
    /*
     * Y ningún texto de la pieza dice la frase que la pieza desmiente. Se mira
     * el contenido entero, no solo la nota: es la afirmación que no puede
     * aparecer en ninguna parte.
     */
    for (const c of CASOS_P2) {
      tocar(caja.querySelector(`[data-caso="${c.id}"]`));
      const t = caja.textContent.toLowerCase();
      assert.ok(!/una sub\w+ y la otra baj/.test(t), `caso ${c.id}: aparece «una subiendo y la otra bajando»`);
      const m = movimientoDelCaso(c);
      assert.equal(caja.querySelector("[data-movimiento]").dataset.movimiento, m.izquierda);
      tocar(caja.querySelector(`[data-caso="${c.id}"]`));
    }
  } finally { desmontar(); }
});

test("★★ la capa 2 de la pieza 2 no avanza sola y se detiene en cada paso", () => {
  const { caja, desmontar } = montar(LaEcuacionContable);
  try {
    const lados = [];
    for (let k = 1; k <= 5; k += 1) {
      lados.push(caja.querySelector("[data-torre]").dataset.lado);
      assert.ok(boton(caja, "[data-repetir]"), `paso ${k}: falta Repetir`);
      if (k < 5) tocar(boton(caja, "[data-siguiente]"));
    }
    /* Las lecturas se encienden en orden: ninguna, izquierda, derecha, ambas. */
    assert.deepEqual(lados.slice(0, 4), ["ninguna", "izquierda", "derecha", "ambas"]);
    tocar(boton(caja, "[data-siguiente]"));
    assert.equal(boton(caja, "[data-siguiente]").disabled, true, "se puede seguir después del cierre");
    assert.ok(boton(caja, "[data-reiniciar]"), "no se puede volver a empezar");
  } finally { desmontar(); }
});

/* ═══════════════════ PIEZA 3 · LA FOTO Y LA PELÍCULA ═══════════════════ */

test("★★★ las dos fotos se pintan con el mismo componente y ninguna recibe tamaño propio", () => {
  const { caja, desmontar } = montar(ExploraFotoOPelicula);
  try {
    const fotos = [...caja.querySelectorAll("[data-figura-tiempo] > [data-foto]")];
    assert.equal(fotos.length, 2, "no hay dos fotos");
    /*
     * Mismo estilo salvo lo que el estado cambia. Se comparan las propiedades
     * de TAMAÑO: si una trajera un ancho, un alto o una escala propia, diría
     * que pesa más que la otra.
     */
    for (const prop of ["width", "height", "padding", "fontSize", "transform", "maxWidth"]) {
      const a = fotos[0].style[prop];
      const b = fotos[1].style[prop];
      assert.equal(a, b, `las dos fotos no miden lo mismo: ${prop} es «${a}» y «${b}»`);
    }
    /* Y las dos llevan su fecha escrita. */
    for (const [k, f] of FOTOS.entries()) {
      assert.ok(fotos[k].textContent.includes(f.fecha), `falta la fecha de ${f.id}`);
    }
  } finally { desmontar(); }
});

test("★★★ la banda no reusa el patrón de la franja del anillo, y no late", () => {
  const { caja, desmontar } = montar(LaFotoYLaPelicula);
  try {
    const banda = caja.querySelector("[data-banda]");
    assert.ok(banda, "no hay banda");
    /* Ni un nodo, ni un punteado, ni una línea de retorno: eso es la franja. */
    assert.equal(caja.querySelectorAll("[data-franja], [data-nodo], [data-retorno], [data-fusion]").length, 0,
      "se coló el patrón de la franja del anillo");
    assert.equal(caja.querySelectorAll("[data-pulso]").length, 0, "la banda late");
    assert.ok(!/dashed/.test(banda.getAttribute("style") ?? ""), "la banda va punteada, como la franja");
    /*
     * Y ninguna animación de esta pieza se repite: un pulso es una animación
     * infinita o de varias vueltas, y aquí todas corren una sola vez.
     */
    const css = [...caja.querySelectorAll("style")].map((s) => s.textContent).join("");
    assert.ok(!/animation:[^;]*infinite/.test(css), "hay una animación infinita: eso es un pulso");
  } finally { desmontar(); }
});

test("★★★ la banda se llena de extremo a extremo, y solo en el último paso", () => {
  const { caja, desmontar } = montar(LaFotoYLaPelicula);
  try {
    const llenado = () => Number(caja.querySelector("[data-banda]").dataset.llenado);
    const fotos = () => caja.querySelectorAll("[data-figura-tiempo] [data-foto], [data-pieza3] [data-foto]").length;
    assert.equal(llenado(), 0, "la banda arranca llena");
    assert.equal(fotos(), 0, "hay fotos antes de tomarlas");
    tocar(boton(caja, "[data-siguiente]"));
    assert.equal(fotos(), 1, "el paso 2 no toma la primera foto");
    assert.equal(llenado(), 0, "la banda se llenó antes de tiempo");
    tocar(boton(caja, "[data-siguiente]"));
    assert.equal(fotos(), 2, "el paso 3 no toma la segunda foto");
    assert.equal(llenado(), 0, "la banda se llenó antes de tiempo");
    tocar(boton(caja, "[data-siguiente]"));
    assert.equal(llenado(), 100, "la banda no se llena de extremo a extremo");
  } finally { desmontar(); }
});

test("★★★ el hueco de la foto que falta mide lo mismo que la foto", () => {
  const { caja, desmontar } = montar(LaFotoYLaPelicula);
  try {
    /*
     * Si el hueco midiera menos, al aparecer la segunda foto todo lo de abajo
     * se movería de sitio y las dos dejarían de poder compararse sin volver a
     * buscarlas.
     */
    assert.equal(caja.querySelectorAll("[data-hueco]").length, 2, "no se reserva el sitio de las dos");
    tocar(boton(caja, "[data-siguiente]"));
    assert.equal(caja.querySelectorAll("[data-hueco]").length, 1);
    tocar(boton(caja, "[data-siguiente]"));
    assert.equal(caja.querySelectorAll("[data-hueco]").length, 0);
  } finally { desmontar(); }
});

/*
 * ═══════════ LA C SE PARTE EN DOS, Y NO ES UN CAPRICHO ═══════════
 *
 * «Marcó comparar» no significa lo mismo si la buena era la foto que si era la
 * película. Una sola explicación para los dos casos diría media verdad en uno.
 */
test("★★★ las cinco reglas de error salen de la pareja, no solo de lo que marcó", () => {
  const casos = [
    { correcta: FOTO, marcada: PELICULA, patron: "A" },
    { correcta: PELICULA, marcada: FOTO, patron: "B" },
    { correcta: FOTO, marcada: COMPARAR, patron: "C1" },
    { correcta: PELICULA, marcada: COMPARAR, patron: "C2" },
    { correcta: COMPARAR, marcada: FOTO, patron: "D" },
    { correcta: COMPARAR, marcada: PELICULA, patron: "D" },
  ];
  for (const c of casos) {
    const q = PREGUNTAS_P3.find((x) => x.respuesta === c.correcta);
    assert.ok(q, `no hay ninguna pregunta que se conteste con «${c.correcta}»`);
    const r = evaluarP3(q, c.marcada);
    assert.equal(r.patron, c.patron, `era «${c.correcta}» y marcó «${c.marcada}»`);
    assert.equal(r.texto, ERROR_P3[c.patron].texto);
  }
  /* C1 y C2 dicen cosas distintas: si fueran la misma, partirla no serviría. */
  assert.notEqual(ERROR_P3.C1.texto, ERROR_P3.C2.texto, "las dos variantes de C son la misma");
  assert.ok(ERROR_P3.C1.texto.includes("Con una foto basta"));
  assert.ok(ERROR_P3.C2.texto.includes("Con la película basta"));
  /* Y las cinco explicaciones son cinco. */
  assert.equal(new Set(Object.values(ERROR_P3).map((e) => e.texto)).size, 5);
});

test("★★ acertar no trae explicación de error, y enciende lo que responde", () => {
  for (const q of PREGUNTAS_P3) {
    const r = evaluarP3(q, q.respuesta);
    assert.equal(r.ok, true, `${q.id}: lo correcto no acierta`);
    assert.equal(r.texto, null, `${q.id}: acertar trae un texto de error`);
    assert.equal(r.escena, escenaDeAcierto(q.respuesta));
  }
  assert.equal(escenaDeAcierto(FOTO), "una-foto");
  assert.equal(escenaDeAcierto(PELICULA), "banda");
  assert.equal(escenaDeAcierto(COMPARAR), "dos-fotos");
});

test("★★ las cinco preguntas cubren las tres respuestas, y la de comparar es una", () => {
  assert.equal(PREGUNTAS_P3.length, 5);
  const porRespuesta = {};
  for (const q of PREGUNTAS_P3) (porRespuesta[q.respuesta] ??= []).push(q.id);
  assert.equal(Object.keys(porRespuesta).length, 3, "alguna respuesta no la usa ninguna pregunta");
  assert.equal(porRespuesta[COMPARAR].length, 1, "la de comparar dejó de ser una sola");
  /* Las que se contestan con una foto dicen CUÁL; las otras no. */
  for (const q of PREGUNTAS_P3) {
    assert.equal(Boolean(q.foto), q.respuesta === FOTO,
      `${q.id}: la foto que responde está puesta al revés`);
  }
});

test("★★ las tres respuestas van siempre en el mismo orden", () => {
  const { caja, desmontar } = montar(ExploraFotoOPelicula);
  try {
    const orden = () => [...caja.querySelectorAll("[data-respuesta]")].map((b) => b.dataset.respuesta);
    const primero = orden();
    assert.deepEqual(primero, RESPUESTAS_P3.map((r) => r.id));
    for (let k = 0; k < 4; k += 1) {
      tocar(caja.querySelector(`[data-respuesta="${FOTO}"]`));
      tocar(caja.querySelector("[data-siguiente-pregunta]"));
      assert.deepEqual(orden(), primero, "las opciones cambiaron de sitio entre preguntas");
    }
  } finally { desmontar(); }
});

test("★★ el alternativo usa anclajes de tiempo, no de izquierda y derecha", () => {
  /*
   * El de Gen. Sobrevive si el layout vuelve a cambiar, que es justo lo que le
   * pasó al anterior: decía izquierda y derecha sobre un layout vertical.
   */
  for (const palabra of ["izquierda", "derecha", "arriba", "abajo"]) {
    assert.ok(!ALT_P3.toLowerCase().includes(palabra),
      `el alternativo se ancla al espacio con «${palabra}»`);
  }
  assert.ok(ALT_P3.includes("Al comenzar el año") && ALT_P3.includes("Al terminar el año"),
    "el alternativo perdió sus anclajes de tiempo");
});

/* ═══════════════════ PIEZA 4 · LAS CINCO FLECHAS ═══════════════════ */

test("★★★ CERO CIFRAS en toda la pieza 4", () => {
  /*
   * El Gráfico 2.6 escribe «xxxxx» en todas sus líneas: no trae un solo
   * número. Se barre el contenido de las tres capas buscando dígitos. Los
   * únicos que se permiten son los del contador de pasos —«Paso 2 de 4»—, que
   * es interfaz y no contenido del gráfico.
   */
  const soloDelContador = (texto) => texto
    .replace(/Paso \d+ de \d+/g, "")
    .replace(/\d+ de \d+/g, "");
  /* El CSS de las animaciones va lleno de números y no es contenido. */
  const loQueSeLee = (caja) => {
    const copia = caja.cloneNode(true);
    for (const s of copia.querySelectorAll("style")) s.remove();
    return soloDelContador(copia.textContent);
  };
  for (const Comp of [ComoSeArticulan, ExploraLasFlechas, UnaFraseArticulacion]) {
    const { caja, desmontar } = montar(Comp);
    try {
      /* Se recorren los cuatro pasos, porque las cifras podrían salir en uno. */
      for (let k = 0; k < 5; k += 1) {
        const limpio = loQueSeLee(caja);
        const digitos = limpio.match(/\d/g) ?? [];
        assert.deepEqual(digitos, [],
          `${Comp.name}, paso ${k + 1}: salió un número en pantalla: «${limpio.match(/.{0,30}\d.{0,30}/)?.[0]}»`);
        const sig = boton(caja, "[data-siguiente]");
        if (!sig || sig.disabled) break;
        tocar(sig);
      }
    } finally { desmontar(); }
  }
  /* Y el banco tampoco trae ninguna. */
  for (const l of LINEAS_P4) assert.ok(!/\d/.test(l.nombre), `la línea «${l.nombre}» trae una cifra`);
  for (const t of Object.values(TEXTOS_P4)) assert.ok(!/\d/.test(t), `un segmento trae una cifra: «${t}»`);
  assert.ok(!/\d/.test(CIERRE_P4), "el cierre trae una cifra");
});

test("★★★ solo una de las cinco flechas viaja; las otras cuatro explican", () => {
  assert.equal(LAS_QUE_VIAJAN.length, 1, `viajan ${LAS_QUE_VIAJAN.length} flechas, no una`);
  const laQueViaja = LAS_QUE_VIAJAN[0];
  /* Es la del saldo final de efectivo: la única que repite la misma cifra. */
  assert.equal(laQueViaja.desde, "l-saldo-final");
  for (const f of FLECHAS_P4) {
    const m = modoDeFlecha(f.id);
    assert.equal(m.viaja, f.id === laQueViaja.id, `${f.id}: viaja cuando no debería, o al revés`);
    assert.equal(m.marca, f.id === laQueViaja.id ? "la misma cifra" : "explica esta línea");
  }
});

test("★★★ en la capa 3, la ficha solo viaja en la flecha que repite la cifra", () => {
  const { caja, desmontar } = montar(ExploraLasFlechas);
  try {
    for (const f of FLECHAS_P4) {
      tocar(caja.querySelector(`[data-flecha="${f.id}"]`));
      const viaja = modoDeFlecha(f.id).viaja;
      assert.equal(Boolean(caja.querySelector("[data-ficha]")), viaja,
        `${f.id}: ${viaja ? "no viaja la ficha y debería" : "viaja una ficha que afirma que la cifra es la misma, y no lo es"}`);
      /* Y los dos extremos se encienden en las cinco. */
      assert.ok(caja.querySelector(`[data-linea="${f.desde}"][data-encendida="si"]`), `${f.id}: el origen no se enciende`);
      assert.ok(caja.querySelector(`[data-linea="${f.hasta}"][data-encendida="si"]`), `${f.id}: el destino no se enciende`);
      assert.equal(caja.querySelector("[data-marca]").dataset.marca, viaja ? "viaja" : "explica");
      tocar(caja.querySelector(`[data-flecha="${f.id}"]`));
    }
  } finally { desmontar(); }
});

test("★★★ el cierre de la capa 2 dibuja las cinco a la vez y resalta el que recibe", () => {
  const { caja, desmontar } = montar(ComoSeArticulan);
  try {
    assert.equal(caja.querySelectorAll('[data-flecha][data-activa="si"]').length, 0,
      "hay flechas dibujadas antes de empezar");
    for (let k = 0; k < 4; k += 1) tocar(boton(caja, "[data-siguiente]"));
    const activas = [...caja.querySelectorAll('[data-flecha][data-activa="si"]')].map((f) => f.dataset.flecha);
    assert.deepEqual(activas.sort(), FLECHAS_P4.map((f) => f.id).sort(), "el cierre no dibuja las cinco");
    const resaltado = caja.querySelector("[data-informe][data-resaltado]");
    assert.ok(resaltado, "el cierre no resalta el informe que recibe");
    assert.equal(resaltado.dataset.informe, informeQueRecibeP4());
    assert.equal(informeQueRecibeP4(), PRIMERO);
  } finally { desmontar(); }
});

test("★★ y antes del cierre no coexisten todas: una a la vez, salvo el paso de las tres", () => {
  const { caja, desmontar } = montar(ComoSeArticulan);
  try {
    const cuantas = () => caja.querySelectorAll('[data-flecha][data-activa="si"]').length;
    const vistas = [];
    for (let k = 0; k < 4; k += 1) { vistas.push(cuantas()); tocar(boton(caja, "[data-siguiente]")); }
    assert.deepEqual(vistas, [0, 1, 1, 3],
      "los segmentos dejaron de enseñar una flecha a la vez (el cuarto enseña las tres de la plata)");
  } finally { desmontar(); }
});

/* ═══════════════════ LAS CAPAS 4 DE LAS TRES ═══════════════════ */

test("★★ cada capa 4 tiene una sola correcta y cuatro devoluciones distintas", () => {
  for (const [nombre, opciones, evaluar] of [
    ["pieza 2", OPCIONES_P2, evaluarOpcionP2],
    ["pieza 3", OPCIONES_P3, evaluarOpcionP3],
    ["pieza 4", OPCIONES_P4, evaluarOpcionP4],
  ]) {
    assert.equal(opciones.length, 4, `${nombre}: no son cuatro opciones`);
    assert.equal(opciones.filter((o) => o.correcta).length, 1, `${nombre}: no hay una sola correcta`);
    assert.equal(new Set(opciones.map((o) => o.feedback)).size, 4, `${nombre}: dos opciones comparten devolución`);
    assert.equal(new Set(opciones.map((o) => o.escena.tipo)).size, 4, `${nombre}: dos opciones encienden lo mismo`);
    for (const o of opciones) {
      const r = evaluar(o.id);
      assert.equal(r, o, `${nombre}: evaluar no devuelve la opción`);
      assert.ok(o.feedback.length > 40, `${nombre}/${o.id}: la devolución se quedó corta`);
    }
  }
});

test("★★★ la confusión central de la pieza 2 está puesta de distractor, y se desmiente", () => {
  const distractor = OPCIONES_P2.find((o) => o.texto.includes("cuando un lado sube, el otro siempre baja"));
  assert.ok(distractor, "el distractor de la confusión central desapareció");
  assert.equal(distractor.correcta, false);
  assert.equal(distractor.escena.tipo, "cuatro-casos", "el distractor no enseña los cuatro casos");

  const { caja, desmontar } = montar(UnaFraseEcuacion);
  try {
    tocar(caja.querySelector(`[data-opcion="${distractor.id}"]`));
    const escena = caja.querySelector('[data-escena="cuatro-casos"]');
    assert.ok(escena, "la devolución no reproduce los cuatro casos");
    /*
     * Las ocho flechas —dos por caso— apuntan al mismo lado dentro de cada
     * caso. Eso es lo que desmiente la creencia, y no el texto.
     */
    for (const c of CASOS_P2) {
      const fila = escena.querySelector(`[data-caso="${c.id}"]`);
      const flechas = fila.querySelector("[data-flechas]").textContent.trim().split(/\s+/);
      assert.equal(flechas.length, 2, `caso ${c.id}: no hay dos flechas`);
      assert.equal(flechas[0], flechas[1], `caso ${c.id}: las dos flechas apuntan a lados distintos`);
      assert.equal(fila.dataset.mueve, movimientoDelCaso(c).izquierda);
    }
  } finally { desmontar(); }
});

/* ═══════════════════ EL VOCABULARIO PROHIBIDO ═══════════════════ */

test("★★★ ni el ▲ ni el teal ni el ámbar entran en el contenido de las tres piezas", () => {
  for (const id of [ID_P2, ID_P3, ID_P4]) {
    const e = ESCENAS_INTRO[id];
    for (const [cual, Comp] of Object.entries({ Capa2: e.Capa2, Exploracion: e.Exploracion, Capa4: e.Capa4 })) {
      const { caja, desmontar } = montar(Comp);
      try {
        const copia = caja.cloneNode(true);
        for (const rot of copia.querySelectorAll("[data-rotulo-seccion]")) rot.remove();
        assert.ok(copia.querySelectorAll("*").length > 3, `${id}/${cual}: no queda nada que mirar`);
        assert.ok(!copia.textContent.includes("▲"), `${id}/${cual}: se coló el ▲`);
        assert.ok(!TEAL.test(copia.innerHTML), `${id}/${cual}: se coló el teal de «debe»`);
        assert.ok(!AMBAR.test(copia.innerHTML), `${id}/${cual}: se coló el ámbar de «haber»`);
        assert.equal(copia.querySelectorAll("[data-arco], [data-balanza], [data-saldo], [data-ancla], [data-colector]").length, 0,
          `${id}/${cual}: se coló una pieza del vocabulario del Tema 2`);
      } finally { desmontar(); }
    }
  }
});

/*
 * ═══════════ EL PANEL DOCENTE LEE LOS ÍTEMS DE LAS CUATRO ═══════════
 *
 * La prueba del repo exige que cada actividad publicada TENGA regla de
 * etiqueta, y fue la que avisó cuando las cuatro salieron del cajón. Pero solo
 * comprueba que la regla exista: una que devolviera null para todos sus ítems
 * la pasaría igual, y el profesor seguiría viendo «cal-4» en su panel.
 *
 * Esto comprueba que de verdad traduzcan, con ítems reales de cada banco.
 */
test("★★★ las cuatro actividades nuevas traducen sus ítems para el profesor", async () => {
  const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
  const { TRANSACCIONES_CAP2, CONCEPTOS } = await import("../../data/contabilidadTema1.js");

  const bancos = {
    "t1-que-le-pasa-a-cada-uno": TRANSACCIONES_CAP2.map((t) => t.id),
    "t1-la-ecuacion-en-movimiento": TRANSACCIONES_CAP2.map((t) => t.id),
    "t1-en-cual-estado-aparece": CONCEPTOS.map((c) => c.id),
    "t1-la-articulacion": FLECHAS_P4.map((f) => `${f.desde}>${f.hasta}`),
  };
  for (const [actividad, ids] of Object.entries(bancos)) {
    const etiquetas = ids.map((id) => etiquetaDeItem(actividad, id));
    for (const [k, e] of etiquetas.entries()) {
      assert.ok(e, `${actividad}: el ítem «${ids[k]}» no se traduce y el profesor vería el id crudo`);
      assert.ok(!/^[a-z0-9-]+(>[a-z0-9-]+)?$/.test(e), `${actividad}: «${ids[k]}» se traduce a otro id`);
    }
    /* Y dos ítems distintos no se leen igual: si no, no se distinguen. */
    assert.equal(new Set(etiquetas).size, ids.length,
      `${actividad}: dos ítems distintos se leen igual en el panel`);
  }
});

test("★★ ninguna de las tres piezas califica ni marca nada en coral sin error", () => {
  const CORAL = /#e76f51|rgba?\(\s*231,\s*111,\s*81/i;
  for (const id of [ID_P2, ID_P3, ID_P4]) {
    for (const Comp of Object.values(ESCENAS_INTRO[id])) {
      const { caja, desmontar } = montar(Comp);
      try {
        assert.ok(!CORAL.test(caja.innerHTML), `${id}: hay coral sin que nadie se haya equivocado`);
      } finally { desmontar(); }
    }
  }
  /* Y la única que marca coral lo hace al fallar, no al acertar. */
  const { caja, desmontar } = montar(ExploraFotoOPelicula);
  try {
    const q = PREGUNTAS_P3[0];
    const mala = RESPUESTAS_P3.find((r) => r.id !== q.respuesta);
    tocar(caja.querySelector(`[data-respuesta="${mala.id}"]`));
    assert.ok(CORAL.test(caja.innerHTML), "fallar no se marca en coral");
    assert.ok(caja.querySelector("[data-explicacion]"), "fallar no trae explicación");
  } finally { desmontar(); }
});
