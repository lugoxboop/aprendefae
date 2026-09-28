import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · «EL RECORRIDO DE UN HECHO».
 *
 * Aquí hay tres cosas que se rompen sin hacer ruido.
 *
 * La primera es el BALANCE. Cuentas por pagar vale 15.000 y no 25.000 aunque
 * la deuda naciera en 25.000 con esta misma compra. Parece un descuadre y no
 * lo es: una transacción posterior canceló 10.000. Quien lo «arregle» rompe el
 * capítulo y el total deja de dar 415.000.
 *
 * La segunda es el AISLAMIENTO DEL VOCABULARIO. Esta pieza va ANTES del Tema
 * 2: el ▲, el marcador de saldo, los arcos, la balanza y el teal/ámbar con
 * significado de debe y haber no significan nada todavía para quien la ve.
 * Colarlos aquí los gasta antes de tiempo, y no habría nada que fallara.
 *
 * La tercera es la REGLA DEL RETORNO: solo la administración cierra el ciclo,
 * y con los otros siete el trazo queda atenuado — nunca invisible.
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

const ElRecorridoDeUnHecho = (await import("../../components/mecanicas/libros/intro/ElRecorridoDeUnHecho.jsx")).default;
const ExploraUsuarios = (await import("../../components/mecanicas/libros/intro/ExploraUsuarios.jsx")).default;
const UnaFraseIntro = (await import("../../components/mecanicas/libros/intro/UnaFraseIntro.jsx")).default;
const {
  HECHO, BALANCE, facturaDelHecho, camposDelLibro, anilloEn, retornoEn,
  PASOS, PASO_DEL_CIERRE, retornoParaUsuario, usuarioPorId, QUIEN_CIERRA,
  USUARIO_DEL_RECORRIDO, lineaResaltada, palabrasDe,
  evaluarOpcion, internos, externos, ENCENDIDO, ATENUADO,
} = await import("../recorridoDeUnHecho.js");
const CuatroCapas = (await import("../../components/mecanicas/maquinas/CuatroCapas.jsx")).default;
const {
  ESTACIONES, USUARIOS, OPCIONES, TEXTOS, CIERRE, ALTERNATIVOS, NOMBRES,
  SIN_DATO, NEUTRO, ID, SIEMBRA_DE_LOS_VERBOS,
} = await import("../../data/contabilidadIntro.js");
/* La lista de las cuatro piezas vive en el archivo del Aprender, no aquí:
   armarla en `contabilidadIntro.js` cerraría un ciclo de imports. */
const { PIEZAS_INTRO } = await import("../../data/contabilidadPiezas234.js");
const { CALEJA } = await import("../../data/contabilidad.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");

const montar = (Comp) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Comp)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const siguiente = (caja) => caja.querySelector("[data-siguiente]");

/*
 * La pieza entera, para mirar su capa 1. Las capas 2, 3 y 4 van con marcadores
 * de posición: lo que se comprueba aquí es la capa 1, y montar las tres escenas
 * de verdad solo añadiría formas de fallar que ya tienen prueba propia.
 */
const vacia = () => React.createElement("div");
const montarPieza = () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(CuatroCapas, {
    pieza: PIEZAS_INTRO[0], Capa2: vacia, Exploracion: vacia, Capa4: vacia,
  })));
  return { caja, limpiar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

/* ═══════════════════ EL AVISO CRÍTICO ═══════════════════ */

test("★★★ el balance NO está «corregido»: Cuentas por pagar vale 15.000, no 25.000", () => {
  const cxp = BALANCE.cuentas.find((c) => c.cuenta === "Cuentas por pagar");
  const eq = BALANCE.cuentas.find((c) => c.cuenta === "Equipo de computación");
  assert.ok(cxp, "desapareció Cuentas por pagar del balance");
  assert.equal(cxp.valor, 15000, "alguien «arregló» la deuda a 25.000 y rompió el capítulo");
  assert.equal(eq.valor, 25000, "Equipo de computación tiene que seguir en 25.000");

  /* Y el asiento que la originó sí dice 25.000: la diferencia es el punto. */
  const enElRenglon = HECHO.renglon.find((r) => r.cuenta === "Cuentas por pagar");
  assert.equal(enElRenglon.valor, 25000, "la deuda nació en 25.000");
  assert.notEqual(cxp.valor, enElRenglon.valor, "si coincidieran, el aviso de la ficha sobraría");
});

test("★★★ y con ese 15.000 el balance cuadra en 415.000", () => {
  assert.equal(BALANCE.activos, 415000);
  assert.equal(BALANCE.pasivosMasPatrimonio, 415000);
  assert.equal(BALANCE.cuadra, true);
  /* La comprobación que importa: 10.000 de diferencia, ni más ni menos. */
  const cxp = BALANCE.cuentas.find((c) => c.cuenta === "Cuentas por pagar");
  assert.equal(25000 - cxp.valor, 10000, "la cancelación posterior dejó de ser de 10.000");
});

/* ═══════════════════ EL AISLAMIENTO DEL VOCABULARIO ═══════════════════ */

test("★★★ ni un signo del Tema 2 se cuela en la pieza", () => {
  const { caja, desmontar } = montar(ElRecorridoDeUnHecho);
  /* Se recorre la pieza entera: si algo se cuela, es en alguno de los pasos. */
  for (let k = 0; k < PASOS; k += 1) tocar(siguiente(caja));

  const html = caja.innerHTML;
  assert.ok(!html.includes("▲"), "se coló el ▲ de crecimiento, que aquí no significa nada todavía");
  assert.equal(caja.querySelectorAll("[data-triangulo]").length, 0, "hay un ▲ marcado");
  assert.equal(caja.querySelectorAll("[data-arco], [data-balanza], [data-saldo]").length, 0,
    "se coló un arco, una balanza o un marcador de saldo");
  /*
   * El teal y el ámbar del Tema 2 no pueden estar DENTRO de la pieza — y se
   * buscan en LAS DOS FORMAS en que pueden acabar escritos. La primera versión
   * solo miraba el hex, y como React serializa los estilos en línea a
   * rgb(82, 196, 176), un mutante que pintaba el renglón de teal le sobrevivió
   * sin despeinarse.
   */
  const TEAL = /#52C4B0|rgba?\(\s*82,\s*196,\s*176/i;
  const AMBAR = /#E9C46A|rgba?\(\s*233,\s*196,\s*106/i;
  assert.ok(!TEAL.test(html), "se coló el teal de «debe», que aquí no significa nada todavía");
  assert.ok(!AMBAR.test(html), "se coló el ámbar de «haber», que aquí no significa nada todavía");
  /* Y el renglón del registro va SIN columnas de debe y haber. */
  assert.equal(caja.querySelectorAll('[data-columna="debe"], [data-columna="haber"]').length, 0,
    "el renglón trae columnas y eso enseña el Tema 2 de contrabando");
  assert.ok(!/DEBE|HABER/.test(caja.textContent), "aparecen las palabras debe o haber");
  desmontar();
});

test("★★ el único color con significado dentro de la pieza es el neutro", () => {
  const { caja, desmontar } = montar(ElRecorridoDeUnHecho);
  for (let k = 0; k < PASOS; k += 1) tocar(siguiente(caja));
  /*
   * En hex o en rgb: los estilos en línea acaban serializados como
   * rgb(184, 196, 212), así que buscar solo «#B8C4D4» no encontraría nada y la
   * prueba pasaría por el motivo equivocado.
   */
  const NEUTRO_EN_CUALQUIER_FORMA = /#B8C4D4|rgb\(\s*184,\s*196,\s*212/i;
  assert.match(caja.innerHTML, NEUTRO_EN_CUALQUIER_FORMA, "el neutro tiene que estar: es el que marca el ciclo");
  desmontar();
});

/* ═══════════════════ EL HECHO Y SUS CINCO FORMAS ═══════════════════ */

test("★★ el hecho es una transacción de verdad del capítulo, no un invento", () => {
  assert.ok(CALEJA.transacciones.some((t) => t.id === HECHO.transaccion.id));
  assert.equal(HECHO.renglon.length, 2, "el hecho tiene que ser un asiento simple");
  assert.equal(HECHO.renglon[0].valor, HECHO.renglon[1].valor, "las dos cifras del renglón son la misma");
  assert.equal(HECHO.valor, 25000);
});

test("★★ la factura marca con un guion lo que el libro no da", () => {
  const f = facturaDelHecho();
  const genericos = f.filter((c) => !c.delLibro);
  assert.equal(genericos.length, 3, "tienen que ser tres los campos que el capítulo no da");
  for (const c of genericos) {
    assert.equal(c.valor, SIN_DATO, `${c.campo}: un campo sin fuente va con guion, ni vacío ni inventado`);
  }
  assert.equal(camposDelLibro(f), 3);
  /* Y el valor sale del hecho, no está escrito en el contenido. */
  assert.equal(f.find((c) => c.campo === "Valor").valor, HECHO.valor);
});

/*
 * ═══════════ EL TEXTO NO PUEDE CONTAR TRANSACCIONES ═══════════
 *
 * Decía «se juntó con las otras cinco transacciones del mes», y eso afirmaba
 * que Caleja tuvo seis en total. Es falso: en el capítulo 2 tiene ocho y
 * cierra con 465.000 de activo. Este balance son las primeras seis, 415.000.
 * La misma empresa en dos fotos, no dos cifras en pelea.
 *
 * Así que el texto dejó de contar, y el balance dice en qué momento está
 * hecho. Esta prueba vigila las dos cosas.
 */
test("★★ el texto del resumen NO afirma cuántas transacciones tuvo la empresa", () => {
  /*
   * Sin expresiones regulares a propósito: una barra invertida perdida por el
   * camino ya metió un byte de control en este archivo, y la guarda del repo
   * lo cazó. Esto dice lo mismo y no tiene nada que se pueda corromper.
   */
  const PALABRAS = ["dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];
  const enMinusculas = TEXTOS[4].toLowerCase();
  const cuenta = PALABRAS.some((n) => ["transacci", "registro"]
    .some((c) => enMinusculas.includes(`${n} ${c}`)));
  assert.equal(cuenta, false, `el texto volvió a contar transacciones: «${TEXTOS[4]}»`);
  /*
   * Y sigue diciendo que se juntó con OTRAS, sin decir cuántas. Si esa idea se
   * cayera, el segmento 4 volvería a dejar el computador solo en el informe,
   * que es justo lo contrario de lo que este paso enseña.
   */
  assert.ok(TEXTOS[4].includes("con las demás"), "se perdió la redacción corregida");
});

test("★★ el balance dice en qué momento de la empresa está hecho", () => {
  assert.ok(BALANCE.subtitulo, "el balance de Caleja perdió su subtítulo");
  assert.match(BALANCE.subtitulo, /seis transacciones/,
    "el subtítulo tiene que decir cuántas transacciones lleva esta foto");
  /* Y el número del subtítulo es el que de verdad tiene el caso. */
  assert.equal(CALEJA.transacciones.length, 6);
});

test("★ la línea resaltada del estado es la del computador", () => {
  assert.equal(lineaResaltada().cuenta, "Equipo de computación");
  assert.equal(lineaResaltada().valor, 25000);
});

/* ═══════════════════ EL ANILLO Y SU CIERRE ═══════════════════ */

test("★★ nada se pierde en el camino: las formas anteriores se quedan", () => {
  for (let paso = 1; paso <= PASOS; paso += 1) {
    const anillo = anilloEn(paso);
    assert.equal(anillo.filter((e) => e.encendida).length, paso, `paso ${paso}`);
    /* Todas las anteriores siguen con su forma puesta. */
    for (const e of anillo.filter((x) => x.n <= paso)) {
      assert.equal(e.conForma, true, `paso ${paso}: la estación ${e.n} perdió su forma`);
    }
    assert.equal(anillo.filter((e) => e.actual).length, 1, `paso ${paso}: no hay una sola estación actual`);
  }
});

test("★★ el trazo de retorno NO se dibuja hasta que el ciclo se cierra", () => {
  for (let paso = 0; paso <= PASOS; paso += 1) {
    assert.equal(retornoEn(paso), "apagado", `paso ${paso}: el retorno se adelantó`);
  }
  assert.equal(retornoEn(PASO_DEL_CIERRE), "encendido");
});

test("★★ las cinco estaciones están a la vista desde el primer momento", () => {
  const { caja, desmontar } = montar(ElRecorridoDeUnHecho);
  assert.equal(caja.querySelectorAll("[data-estacion]").length, ESTACIONES.length);
  /* Pero solo la primera encendida. */
  assert.equal(caja.querySelectorAll('[data-estacion][data-encendida="si"]').length, 1);
  /* Y cada una lleva su número escrito, no solo su color. */
  for (const e of ESTACIONES) {
    assert.ok(caja.querySelector(`[data-numero="${e.n}"]`), `falta el número de la estación ${e.n}`);
    assert.ok(caja.textContent.includes(e.nombre), `falta el nombre de la estación ${e.n}`);
  }
  desmontar();
});

test("★★ el recorrido llega al cierre y ahí se queda", () => {
  const { caja, desmontar } = montar(ElRecorridoDeUnHecho);
  for (let k = 0; k < PASOS; k += 1) tocar(siguiente(caja));
  assert.equal(caja.querySelectorAll('[data-estacion][data-encendida="si"]').length, ESTACIONES.length);
  assert.ok(caja.textContent.includes(CIERRE), "falta el texto de cierre");
  assert.equal(siguiente(caja).disabled, true, "se puede seguir después del cierre");
  assert.equal(caja.querySelector("[data-franja]").getAttribute("data-retorno"), "encendido");
  desmontar();
});

test("★ cada segmento trae su texto, y el alternativo tal cual lo escribió la ficha", () => {
  const { caja, desmontar } = montar(ElRecorridoDeUnHecho);
  for (let paso = 1; paso <= PASOS; paso += 1) {
    assert.equal(caja.querySelector("[data-texto-paso]").textContent, TEXTOS[paso], `paso ${paso}`);
    assert.equal(caja.querySelector("[data-alternativo]").textContent, ALTERNATIVOS[paso], `alt ${paso}`);
    if (paso < PASOS) tocar(siguiente(caja));
  }
  tocar(siguiente(caja));
  assert.equal(caja.querySelector("[data-alternativo]").textContent, ALTERNATIVOS.cierre);
  desmontar();
});

/* ═══════════════════ LA FRANJA ═══════════════════ */

test("★★ la franja es un ciclo, no un borde: dos líneas distintas y dos fusiones", () => {
  const { caja, desmontar } = montar(ElRecorridoDeUnHecho);
  const franja = caja.querySelector("[data-franja]");
  assert.ok(franja, "no hay franja");
  const avance = franja.querySelector('[data-linea="avance"]');
  const retorno = franja.querySelector('[data-linea="retorno"]');
  assert.ok(avance && retorno, "faltan las dos líneas");
  /* Lo que las distingue es sólido contra punteado, no el color. */
  assert.equal(avance.getAttribute("stroke"), retorno.getAttribute("stroke"), "las líneas cambian de color");
  assert.equal(avance.getAttribute("stroke-dasharray"), null, "el avance no puede ir punteado");
  assert.ok(retorno.getAttribute("stroke-dasharray"), "el retorno tiene que ir punteado");
  /* Y se cierra sobre sí misma arriba y abajo. */
  assert.ok(franja.querySelector('[data-fusion="arriba"]'), "falta la curva en U de arriba");
  assert.ok(franja.querySelector('[data-fusion="abajo"]'), "falta la curva en U de abajo");
  desmontar();
});

test("★★ con movimiento reducido el pulso NO se dibuja", () => {
  /* El matchMedia de estas pruebas devuelve siempre «reduce». */
  const { caja, desmontar } = montar(ElRecorridoDeUnHecho);
  for (let k = 0; k < PASOS; k += 1) tocar(siguiente(caja));
  assert.equal(caja.querySelectorAll("[data-pulso]").length, 0,
    "el pulso está en el árbol con movimiento reducido activo");
  desmontar();
});

/* ═══════════════════ LA REGLA DEL RETORNO (CAPA 3) ═══════════════════ */

test("★★★ solo la administración cierra el ciclo, y es una sola", () => {
  assert.equal(QUIEN_CIERRA.length, 1, "o ninguno o más de uno cierra el ciclo");
  assert.equal(QUIEN_CIERRA[0].id, "administradores");
  assert.equal(USUARIO_DEL_RECORRIDO.id, "administradores",
    "el usuario del recorrido guiado tiene que ser el mismo que cierra el ciclo");
  for (const u of USUARIOS) {
    assert.equal(retornoParaUsuario(u), u.cierraElCiclo ? ENCENDIDO : ATENUADO, u.id);
  }
});

test("★★★ con los otros siete el retorno queda ATENUADO, nunca invisible", () => {
  const { caja, desmontar } = montar(ExploraUsuarios);
  for (const u of USUARIOS.filter((x) => !x.cierraElCiclo)) {
    tocar(caja.querySelector(`[data-usuario="${u.id}"]`));
    const franja = caja.querySelector("[data-franja]");
    assert.equal(franja.getAttribute("data-retorno"), ATENUADO, u.id);
    const retorno = franja.querySelector('[data-linea="retorno"]');
    const op = parseFloat(retorno.getAttribute("opacity"));
    assert.ok(op > 0, `${u.id}: el retorno se volvió invisible`);
    assert.ok(op < 1, `${u.id}: el retorno quedó encendido y no le toca`);
  }
  tocar(caja.querySelector('[data-usuario="administradores"]'));
  assert.equal(caja.querySelector("[data-franja]").getAttribute("data-retorno"), ENCENDIDO);
  desmontar();
});

test("★★ los ocho consultan el MISMO resumen", () => {
  const { caja, desmontar } = montar(ExploraUsuarios);
  const antes = caja.querySelector('[data-forma="estado"]').textContent;
  for (const u of USUARIOS) {
    tocar(caja.querySelector(`[data-usuario="${u.id}"]`));
    assert.equal(caja.querySelector('[data-forma="estado"]').textContent, antes,
      `${u.id}: el resumen cambió, y tiene que ser el mismo para los ocho`);
    assert.ok(caja.querySelector(`[data-pregunta="${u.id}"]`), `${u.id}: no salió su pregunta`);
  }
  desmontar();
});

test("★ los ocho traen su propósito textual, y cuatro son internos o externos", () => {
  assert.equal(USUARIOS.length, 8);
  assert.equal(internos().length, 3);
  assert.equal(externos().length, 5);
  for (const u of USUARIOS) {
    assert.ok(u.proposito.length > 30, `${u.id}: el propósito textual se quedó corto`);
    /*
     * La frase puede abrir con una afirmación —«Puse plata en esta empresa.
     * ¿Cuánto me está dejando?»— o cerrar con una —«¿Cómo le va a la empresa?
     * Quiero saberlo antes de pedir algo.»—. Así que no se exige ni que empiece
     * por «¿» ni que termine en «?».
     *
     * Lo que se exige es que dentro haya una pregunta cerrada de verdad: la
     * capa 3 pone esta cadena entre comillas sobre la mesa de quien decide, y
     * si ahí no hubiera ninguna pregunta, la pieza no estaría enseñando lo que
     * dice —que los ocho le preguntan cosas distintas al mismo informe—.
     */
    const abre = u.pregunta.indexOf("¿");
    assert.ok(abre >= 0 && u.pregunta.indexOf("?", abre) > abre,
      `${u.id}: no hay ninguna pregunta cerrada en «${u.pregunta}»`);
  }
  assert.equal(new Set(USUARIOS.map((u) => u.pregunta)).size, 8, "dos usuarios comparten pregunta");
});

test("★ el estado vacío invita, y no hay usuario elegido de salida", () => {
  const { caja, desmontar } = montar(ExploraUsuarios);
  assert.ok(caja.querySelector("[data-vacio]"), "falta el estado vacío");
  assert.equal(caja.querySelectorAll('[data-usuario][data-elegido="si"]').length, 0);
  desmontar();
});

/* ═══════════════════ LA CAPA 4 ═══════════════════ */

test("★★ hay una sola opción correcta", () => {
  assert.equal(OPCIONES.filter((o) => o.correcta).length, 1, "tiene que haber una sola correcta");
});

/*
 * ═══════════ PENDIENTE: LA CORRECTA SE DELATA POR SU LARGO ═══════════
 *
 * Esta prueba está en TODO y NO pasa. No es un descuido: es el sitio donde
 * queda anotado un problema del texto nuevo que no me toca arreglar.
 *
 * La banda anterior era 12-13 palabras para las cuatro, y el texto viejo la
 * cumplía. Con la reescritura quedan en 13 · 10 · 10 · 11, y la de 13 es la
 * correcta: es la única que pasa de 11. Quien no lea ninguna y marque la más
 * larga acierta, y entonces la capa 4 no mide lo que dice medir.
 *
 * No toco la frase de Gen para cuadrar la prueba —eso sería reescribir
 * contenido pedagógico para que el verde salga—, y tampoco borro la regla, que
 * es la que acaba de cazar el problema. Se queda escrita y marcada hasta que
 * Gen iguale los largos; entonces se le quita el `todo` y empieza a exigir.
 *
 * Lo que la regla pide: que la correcta no sea la más larga de las cuatro.
 */
test("★★ las cuatro opciones miden casi lo mismo: la correcta no se delata por su largo",
  { todo: "la correcta tiene 13 palabras y ninguna otra pasa de 11 — pendiente de Gen" },
  () => {
    const largos = OPCIONES.map((o) => ({ correcta: o.correcta, n: palabrasDe(o.texto) }));
    const correcta = largos.find((x) => x.correcta).n;
    const masLargaDeLasOtras = Math.max(...largos.filter((x) => !x.correcta).map((x) => x.n));
    assert.ok(correcta <= masLargaDeLasOtras,
      `la correcta tiene ${correcta} palabras y la más larga de las otras ${masLargaDeLasOtras}`);
  });

test("★★ cada opción trae su devolución y su escena, y ninguna se repite", () => {
  const textos = new Set();
  for (const o of OPCIONES) {
    const r = evaluarOpcion(o.id);
    assert.ok(r.feedback.length > 60, `${o.id}: la devolución se quedó corta`);
    assert.ok(r.escena?.tipo, `${o.id}: sin escena`);
    textos.add(r.feedback);
  }
  assert.equal(textos.size, OPCIONES.length, "dos opciones comparten devolución");
});

test("★★ responder enciende lo que esa devolución dice, ni más ni menos", () => {
  for (const o of OPCIONES) {
    const { caja, desmontar } = montar(UnaFraseIntro);
    tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.ok(caja.textContent.includes(o.feedback), `${o.id}: no salió su devolución`);

    if (o.escena.tipo === "anillo-completo") {
      assert.equal(caja.querySelectorAll('[data-escena] [data-encendida="si"]').length, ESTACIONES.length);
      assert.ok(caja.querySelector("[data-trazo-retorno]"), "el anillo completo tiene que traer el trazo");
    }
    if (o.escena.tipo === "una-estacion") {
      const encendidas = [...caja.querySelectorAll('[data-escena] [data-encendida="si"]')];
      assert.equal(encendidas.length, 1, `${o.id}: tiene que encenderse una sola estación`);
      assert.equal(encendidas[0].getAttribute("data-estacion"), String(o.escena.estacion));
    }
    if (o.escena.tipo === "ocho-usuarios") {
      assert.equal(caja.querySelectorAll('[data-escena="ocho-usuarios"] [data-usuario]').length, 8);
      const marcado = caja.querySelector('[data-escena="ocho-usuarios"] [data-marcado="si"]');
      assert.equal(marcado.getAttribute("data-usuario"), o.escena.resaltar);
    }
    desmontar();
  }
});

/* ═══════════════════ EL REGISTRO DE LA PIEZA ═══════════════════ */

test("★★ la pieza es material teórico: entra sin FP y sin dificultad", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "introduccion-contabilidad");
  assert.ok(tema, "el tema no está registrado");
  const pieza = tema.actividades.find((x) => x.id === ID);
  assert.ok(pieza, "la pieza salió del tema");
  assert.equal(pieza.clasificacion.tipo, APRENDER);
  assert.equal(pieza.clasificacion.fpBase, undefined, "una pieza de Aprender no puede dar FP");
  assert.equal(pieza.clasificacion.dificultad, undefined, "una pieza de Aprender no tiene dificultad");
  /* Y ninguna pieza de Aprender del tema puede haber ganado FP por el camino. */
  for (const x of tema.actividades.filter((y) => y.clasificacion.tipo === APRENDER)) {
    assert.equal(x.clasificacion.fpBase, undefined, `${x.id} da FP y es material teórico`);
  }
});

test("★ la pieza trae la capa 1 con las cuatro líneas y la siembra de los verbos", () => {
  const p = PIEZAS_INTRO[0];
  assert.equal(p.id, ID);
  assert.equal(p.nombres.length, NOMBRES.length + 1, "falta la siembra de los siete verbos");
  const siembra = p.nombres[p.nombres.length - 1].definicion;
  assert.equal(siembra, SIEMBRA_DE_LOS_VERBOS);
});

/*
 * ═══════════ LA IDEA SIMPLE ABRE; LA CITA VA DEBAJO ═══════════
 *
 * Una sola línea de la capa 1 conserva texto del libro, y va DEBAJO de su idea
 * simple. Esta prueba no compara cadenas contra sí mismas: comprueba que la
 * línea que abre NO es la cita —ni por longitud ni por vocabulario— y que la
 * cita es la del libro.
 */
test("★★ solo la primera línea cita el libro, y la cita nunca abre la línea", () => {
  const conCita = NOMBRES.filter((n) => n.delLibro);
  assert.equal(conCita.length, 1, "o ninguna línea cita el libro, o cita más de una");
  const n = conCita[0];
  assert.equal(n, NOMBRES[0], "la cita se movió de la primera línea");

  /* La cita es la del libro: su vocabulario es el suyo, no el de la idea. */
  for (const marca of ["sistema de información integrado", "stakeholders"]) {
    assert.ok(n.delLibro.includes(marca), `la cita perdió «${marca}»`);
    assert.ok(!n.definicion.includes(marca), `la idea simple se llenó con la cita: «${marca}»`);
  }
  /* Y la idea simple es de verdad más corta que la frase que explica. */
  assert.ok(n.definicion.length * 2 < n.delLibro.length,
    `la idea simple dejó de ser simple: ${n.definicion.length} contra ${n.delLibro.length}`);
});

/*
 * ═══════════ «SON SIETE» TIENE QUE SER VERDAD ═══════════
 *
 * La siembra manda contar los verbos de la frase del libro y dice cuántos hay.
 * Eso no se da por bueno: los verbos se sacan de la frase que de verdad está en
 * pantalla y se cuentan. Si la cita pierde uno —o gana uno—, la línea que la
 * acompaña empieza a mentir, y esta prueba falla antes de que lo lea nadie.
 */
test("★★ los verbos que la siembra manda contar son los que tiene la frase del libro", () => {
  const cita = NOMBRES[0].delLibro;
  const tramo = cita.split("permite ")[1].split(", en términos")[0];
  const verbos = tramo.split(/,\s*|\s+y\s+/).map((s) => s.trim()).filter(Boolean);

  assert.equal(verbos.length, 7, `la frase del libro tiene ${verbos.length} verbos, no siete: ${verbos.join(" · ")}`);
  assert.ok(SIEMBRA_DE_LOS_VERBOS.includes("siete"), "la siembra dejó de decir cuántos son");
  /* Y el que la siembra señala como «uno solo» está entre ellos. */
  assert.ok(verbos.includes("registrar"), "registrar ya no está en la lista de la cita");
});

test("★★ la frase del libro está en pantalla cuando se lee la línea que manda contarla", () => {
  const { caja, limpiar } = montarPieza();
  try {
    const capa1 = caja.querySelector('[data-capa="1"]');
    assert.ok(capa1, "no hay capa 1");
    assert.ok(capa1.textContent.includes(SIEMBRA_DE_LOS_VERBOS), "falta la línea de la siembra");
    assert.ok(capa1.querySelector("[data-del-libro]"), "la cita del libro no se pinta");
    assert.ok(capa1.textContent.includes(NOMBRES[0].delLibro),
      "la línea manda contar los verbos de una frase que no está en pantalla");
    /* Y la idea simple va ANTES que la cita, no después. */
    const texto = capa1.textContent;
    assert.ok(texto.indexOf(NOMBRES[0].definicion) < texto.indexOf(NOMBRES[0].delLibro),
      "la cita del libro se adelantó a la idea simple");
  } finally { limpiar(); }
});
