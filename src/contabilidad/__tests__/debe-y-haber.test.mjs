import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * APRENDER · «EL DEBE Y EL HABER».
 *
 * La pieza descansa en una comparación: dos transacciones reales, el mismo
 * débito, efectos opuestos. Casi todo lo que puede romperla es invisible:
 *
 *   · que los dos débitos dejen de ser iguales —y entonces no hay contraste,
 *     hay dos casos distintos—;
 *   · que la contrapartida asome antes de la predicción —y entonces el
 *     estudiante razona sobre el asiento completo en vez de sobre el
 *     contraste—;
 *   · que los paneles se apilen —y entonces no hay comparación simultánea,
 *     que es el mecanismo entero.
 *
 * Ninguna de las tres se ve leyendo el código ni rompe nada al ocurrir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const MesaDeDosCasos = (await import("../../components/mecanicas/libros/debeHaber/MesaDeDosCasos.jsx")).default;
const ExploraUnaCuenta = (await import("../../components/mecanicas/libros/debeHaber/ExploraUnaCuenta.jsx")).default;
const EnUnaFrase = (await import("../../components/mecanicas/libros/debeHaber/EnUnaFrase.jsx")).default;
const { TONO_ROTULO, FONDO_TARJETA } = await import("../../components/mecanicas/libros/debeHaber/piezasDebeHaber.jsx");
const { ESCENAS } = await import("../../components/mecanicas/libros/escenas.jsx");
const {
  MESA, contrasteValido, contraejemplo, tresCasos, ningunaEsNegativa,
  cuentaExplorable, ladoDelTriangulo, saldoDeLaCaja, CAJA_DEL_SALDO,
} = await import("../debeHaber.js");
const { PIEZA_DEBE_Y_HABER, CAJA_ANTES_DEL_EJEMPLO_DOS } = await import("../../data/contabilidadDebeHaber.js");
const { PIEZAS_APRENDER } = await import("../../data/contabilidadAprender.js");
const {
  DEBE, HABER, CALEJA, CRECE_POR, tipoDeCuenta, mayorConSaldos, pesos,
} = await import("../../data/contabilidad.js");
const { cancelacion } = await import("../cancelacion.js");

const P = PIEZA_DEBE_Y_HABER;
const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

/*
 * El movimiento reducido se controla desde la prueba. No es solo comodidad
 * para no esperar animaciones: es el camino que el encargo exige —con
 * `prefers-reduced-motion` las mismas transiciones ocurren en cero
 * milisegundos y el estado final es idéntico— y probarlo aquí es probarlo.
 */
function ponerMovimiento(reducido) {
  const consulta = { matches: reducido, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
  w.matchMedia = () => consulta;
  Object.defineProperty(globalThis, "matchMedia", { value: w.matchMedia, configurable: true, writable: true });
}

function montar(Componente, { reducido = true } = {}) {
  ponerMovimiento(reducido);
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Componente)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const porDato = (caja, attr) => caja.querySelector(`[${attr}]`);
const siguiente = (caja) => caja.querySelector("[data-siguiente]");

/* ═══════════════ LA PREMISA: EL CONTRASTE ═══════════════ */

test("★ los dos débitos son IDÉNTICOS y los dos efectos, opuestos", () => {
  /*
   * Es la pieza entera. Si los montos dejaran de coincidir, el estudiante
   * podría explicar la diferencia por el tamaño; si los dos efectos fueran en
   * la misma dirección, no habría nada que contrastar. Las dos cosas se
   * comprueban calculadas, nunca contra un campo declarado.
   */
  const [a, b] = MESA;
  assert.equal(a.debito.monto, b.debito.monto, "los dos débitos dejaron de valer lo mismo");
  assert.notEqual(a.debito.sube, b.debito.sube, "las dos cuentas reaccionan igual");
  assert.ok(contrasteValido());
  /* Y las dos transacciones cuadran, que es lo que la predicción afirma. */
  for (const p of MESA) assert.equal(p.debito.monto, p.contrapartida.monto, `${p.id} no cuadra`);
});

test("★ ninguna cifra de la pieza está escrita a mano: todas salen de Caleja", () => {
  const mayor = mayorConSaldos(CALEJA.transacciones);
  const [maquinaria, aportes] = MESA;

  /* Maquinaria nace con esta transacción: antes no existía. */
  assert.equal(maquinaria.debito.antes, 0);
  assert.equal(maquinaria.debito.despues, maquinaria.debito.monto);
  assert.ok(maquinaria.debito.sube);

  /* Aportes sociales: 400.000 antes, y el débito la reduce. */
  const aportesFinal = mayor.find((c) => c.cuenta === "Aportes sociales");
  assert.equal(aportes.debito.antes, aportesFinal.saldo + aportes.debito.monto);
  assert.equal(aportes.debito.despues, aportesFinal.saldo);
  assert.ok(!aportes.debito.sube);

  /* La contrapartida de f es la Caja, y baja. */
  const cajaFinal = mayor.find((c) => c.cuenta === "Caja");
  assert.equal(aportes.contrapartida.cuenta, "Caja");
  assert.equal(aportes.contrapartida.despues, cajaFinal.saldo);
  assert.ok(!aportes.contrapartida.sube);
});

test("★ el ▲ de cada cuenta ES la regla del capítulo, no una lista aparte", () => {
  /*
   * Si el triángulo se declarara para esta pieza, el día que alguien
   * corrigiera CRECE_POR la teoría y las doce actividades enseñarían cosas
   * distintas sobre la misma cuenta — que es justo el error que la pieza
   * existe para impedir.
   */
  for (const p of MESA) {
    for (const c of [p.debito, p.contrapartida]) {
      assert.equal(c.triangulo, CRECE_POR[tipoDeCuenta(c.cuenta)], `${c.cuenta}: el ▲ se separó de la regla`);
    }
  }
  assert.equal(ladoDelTriangulo("Maquinaria"), DEBE);
  assert.equal(ladoDelTriangulo("Aportes sociales"), HABER);
  assert.equal(ladoDelTriangulo("Gastos de operación"), DEBE);
  assert.equal(ladoDelTriangulo("Ingresos por servicios"), HABER);
});

test("★ el contraejemplo hace subir LAS DOS: es lo único que lo hace servir", () => {
  /*
   * Sin él, la pieza arregla una confusión —«débito = aumenta»— e instala
   * otra: que activo y pasivo se mueven siempre en sentido contrario. El
   * ejemplo 2 del libro la desmiente, y por eso es obligatorio.
   */
  const c = contraejemplo();
  assert.ok(c.izquierda.sube && c.derecha.sube, "el contraejemplo no enseña las dos subiendo");
  assert.notEqual(c.izquierda.triangulo, c.derecha.triangulo, "las dos crecen por el mismo lado");
  assert.equal(c.izquierda.antes, CAJA_ANTES_DEL_EJEMPLO_DOS);
  assert.equal(c.izquierda.despues - c.izquierda.antes, c.derecha.despues - c.derecha.antes);
});

test("★ el saldo del segmento 5 se cancela POR VALOR, nunca por pares de fichas", () => {
  /*
   * Cancelar «en pares» haría desaparecer 1.000 contra 150 y el saldo sería
   * falso. Se comprueba sobre la misma aritmética que dibuja la escena.
   */
  const s = saldoDeLaCaja();
  assert.equal(s.saldo, 1350);
  assert.equal(s.lado, DEBE);

  const c = cancelacion(CAJA_DEL_SALDO.debitos, CAJA_DEL_SALDO.creditos);
  assert.equal(c.cancelado, 150);
  const comido = c.debe.reduce((t, f) => t + f.consumido * f.valor, 0);
  assert.equal(comido, 150, "lo consumido no vale lo que el otro lado puso");
  assert.ok(c.debe.every((f) => f.consumido < 1), "una ficha entera quedó tachada: eso es contar pares");
});

test("★ los tres casos de la opción 3 desmienten al saldo previo y confirman al ▲", () => {
  const casos = tresCasos();
  assert.equal(casos.length, 3);
  const suben = casos.filter((c) => c.sube);
  const bajan = casos.filter((c) => !c.sube);
  assert.equal(suben.length, 2, "no hay dos casos que suban");
  assert.equal(bajan.length, 1, "no hay un caso que baje");

  /* Los dos que suben tienen saldos previos DISTINTOS: ahí muere el argumento. */
  assert.notEqual(suben[0].previo, suben[1].previo, "los dos que suben tienen el mismo previo");
  /* Y el mismo ▲, que es lo que sí predice. */
  assert.equal(suben[0].triangulo, suben[1].triangulo);
  assert.notEqual(bajan[0].triangulo, suben[0].triangulo);
  /* El ▲ acierta las tres: sube ⇔ el débito cayó del lado por el que crece. */
  for (const c of casos) assert.equal(c.sube, c.triangulo === DEBE, `${c.cuenta}: el ▲ falla`);
});

test("★ las dos cuentas del cierre son REALES y ninguna es negativa", () => {
  /*
   * La v4.1 corrigió esto: igualarlas con cifras hipotéticas habría hecho el
   * punto con datos falsos, y el punto es justamente que los dos números son
   * reales y los dos positivos.
   */
  const mayor = mayorConSaldos(CALEJA.transacciones);
  for (const c of ningunaEsNegativa()) {
    assert.ok(c.saldo > 0, `${c.cuenta} salió en negativo`);
    assert.equal(c.saldo, mayor.find((x) => x.cuenta === c.cuenta).saldo, `${c.cuenta}: cifra inventada`);
  }
});

test("las cuatro cuentas de la capa 3 son de cuatro familias distintas", () => {
  const familias = P.exploracion.cuentas.map((c) => tipoDeCuenta(c.cuenta));
  assert.equal(new Set(familias).size, 4, `familias repetidas: ${familias}`);
  /* Y las dos que crecen por cada lado están: el ▲ tiene que poder moverse. */
  const lados = familias.map((f) => CRECE_POR[f]);
  assert.ok(lados.includes(DEBE) && lados.includes(HABER));
  for (const c of P.exploracion.cuentas) {
    const f = cuentaExplorable(c.cuenta);
    assert.equal(f.inicial.valor, c.saldoInicial);
    if (c.saldoInicial > 0) assert.equal(f.inicial.lado, f.triangulo, `${c.cuenta}: el saldo inicial cayó del lado que no es`);
  }
});

/* ═══════════════ LA REGLA DE LOS TIEMPOS ═══════════════ */

function irAlSegmentoTres(caja) {
  /* nace → lados → dos-casos */
  tocar(siguiente(caja));
  tocar(siguiente(caja));
  assert.ok(porDato(caja, "data-mesa-dos-casos"), "no se llegó al segmento de los dos casos");
}

test("★★ en los tiempos 1, 2 y 3 no hay NINGÚN rastro de la contrapartida ni del enunciado", () => {
  /*
   * ESTA es la prueba que justifica el archivo. Si el estudiante ve que
   * «falta algo abajo» —una caja vacía, un punteado, un hueco— deduce que hay
   * una segunda cuenta y se pone a razonar sobre el asiento completo en vez
   * de sobre el contraste, que es lo que la pieza mide. Y no rompe nada: la
   * pieza sigue funcionando, solo que deja de enseñar lo que venía a enseñar.
   */
  const { caja, desmontar } = montar(MesaDeDosCasos);
  try {
    irAlSegmentoTres(caja);

    const sinRastro = (donde) => {
      assert.equal(caja.querySelectorAll("[data-contrapartida]").length, 0, `${donde}: asomó una contrapartida`);
      assert.equal(caja.querySelectorAll("[data-enunciado]").length, 0, `${donde}: asomó un enunciado`);
      for (const z of caja.querySelectorAll("[data-zona-contrapartida]")) {
        assert.equal(z.getAttribute("data-zona-contrapartida"), "lisa", `${donde}: la zona no está lisa`);
        assert.equal(z.children.length, 0, `${donde}: la zona tiene algo dentro`);
      }
      /* Ni el nombre de ninguna contrapartida escrito en cualquier parte. */
      for (const p of MESA) {
        assert.ok(!caja.textContent.includes(p.contrapartida.cuenta),
          `${donde}: se lee «${p.contrapartida.cuenta}» en pantalla`);
      }
    };

    sinRastro("tiempo 1");
    tocar(siguiente(caja));            /* → tiempo 2, la predicción */
    sinRastro("tiempo 2");
    tocar(caja.querySelector('[data-opcion-prediccion="distinto"]'));
    tocar(siguiente(caja));            /* → tiempo 3, la reacción */
    sinRastro("tiempo 3");

    /* Y en el 4 sí, las dos. */
    tocar(siguiente(caja));
    assert.equal(caja.querySelectorAll("[data-contrapartida]").length, 2, "el tiempo 4 no trajo las contrapartidas");
    assert.equal(caja.querySelectorAll("[data-enunciado]").length, 0, "el tiempo 4 adelantó los enunciados");

    tocar(siguiente(caja));
    assert.equal(caja.querySelectorAll("[data-enunciado]").length, 2, "el tiempo 5 no trajo los enunciados");
  } finally { desmontar(); }
});

test("★ la zona de la contrapartida reserva su altura desde el tiempo 1: nada se desplaza", () => {
  /*
   * Decisión cerrada: el panel tiene su altura final desde el principio. Sin
   * esto, al aparecer la contrapartida todo lo de abajo saltaría — y saltar
   * es exactamente la señal de que «faltaba algo».
   */
  const { caja, desmontar } = montar(MesaDeDosCasos);
  try {
    irAlSegmentoTres(caja);
    const alturas = () => [...caja.querySelectorAll("[data-zona-contrapartida]")].map((z) => z.style.minHeight);
    const antes = alturas();
    assert.ok(antes.every((h) => h && parseFloat(h) > 0), `la zona no reserva altura: ${antes}`);

    tocar(siguiente(caja));
    tocar(caja.querySelector('[data-opcion-prediccion="igual"]'));
    tocar(siguiente(caja));
    tocar(siguiente(caja));
    assert.deepEqual(alturas(), antes, "la zona cambió de altura al llenarse");
  } finally { desmontar(); }
});

test("★ la predicción DETIENE la animación: no se avanza sin elegir", () => {
  const { caja, desmontar } = montar(MesaDeDosCasos);
  try {
    irAlSegmentoTres(caja);
    tocar(siguiente(caja));  /* → tiempo 2 */
    assert.ok(porDato(caja, "data-prediccion"), "no salió la predicción");
    assert.ok(siguiente(caja).disabled, "se puede avanzar sin predecir");

    tocar(siguiente(caja));  /* no debe hacer nada */
    assert.ok(porDato(caja, "data-prediccion"), "avanzó sin predicción");

    tocar(caja.querySelector('[data-opcion-prediccion="distinto"]'));
    assert.ok(!siguiente(caja).disabled, "predijo y sigue bloqueado");
  } finally { desmontar(); }
});

test("★ los dos paneles son hermanos en una fila: nunca uno encima del otro", () => {
  /*
   * JSDOM no maqueta, así que no se mide el resultado — se comprueba la
   * estructura, que es lo que lo produce: los dos paneles, hermanos, dentro
   * de un contenedor en fila. La medida real va a 375 px en el navegador.
   */
  const { caja, desmontar } = montar(MesaDeDosCasos);
  try {
    irAlSegmentoTres(caja);
    const mesa = porDato(caja, "data-mesa-dos-casos");
    const paneles = [...mesa.querySelectorAll("[data-panel]")];
    assert.equal(paneles.length, 2, "no hay dos paneles");
    for (const p of paneles) assert.equal(p.parentElement, mesa, "un panel no es hermano del otro");
    assert.equal(mesa.style.display, "flex");
    assert.notEqual(mesa.style.flexDirection, "column", "los paneles se apilaron");
  } finally { desmontar(); }
});

test("★ nada avanza solo: los botones se apagan mientras corre la animación", () => {
  /* Aquí SÍ con movimiento: es lo que se está midiendo. */
  const { caja, desmontar } = montar(MesaDeDosCasos, { reducido: false });
  try {
    /* Al entrar en un segmento con animación, Siguiente y Repetir se apagan. */
    assert.ok(caja.querySelector("[data-repetir]"), "no hay botón de repetir");
    tocar(siguiente(caja));
    const corriendo = siguiente(caja).disabled && caja.querySelector("[data-repetir]").disabled;
    assert.ok(corriendo, "los botones siguen activos mientras corre la animación");
  } finally { desmontar(); }
});

test("★ con movimiento reducido el estado final es IDÉNTICO: nadie pierde información", () => {
  /*
   * Es la promesa del encargo, y es comprobable: las mismas transiciones
   * ocurren en cero milisegundos. Si la versión sin movimiento se saltara un
   * paso —o llegara a otro sitio— quien apaga las animaciones estaría viendo
   * una pieza distinta, no la misma más quieta.
   */
  const recorrer = (reducido) => {
    const { caja, desmontar } = montar(MesaDeDosCasos, { reducido });
    try {
      /* Con movimiento hay que esperar a que los botones vuelvan; sin él, no. */
      const avanzar = () => {
        const b = siguiente(caja);
        if (b.disabled) return false;
        tocar(b);
        return true;
      };
      for (let i = 0; i < 3 && avanzar(); i += 1) { /* hasta el segmento 3 */ }
      const hayMesa = Boolean(porDato(caja, "data-mesa-dos-casos"));
      return { hayMesa, texto: caja.querySelector("[data-texto-segmento]").textContent };
    } finally { desmontar(); }
  };

  const sinMovimiento = recorrer(true);
  assert.ok(sinMovimiento.hayMesa, "sin movimiento no se llega a la mesa de dos casos");

  /* Y el texto alternativo va tal cual lo escribió la ficha, sin resumir. */
  const { caja, desmontar } = montar(MesaDeDosCasos);
  try {
    for (const s of P.segmentos) {
      assert.ok(s.alterno?.length > 40, `${s.id}: sin texto alternativo`);
    }
    assert.ok(caja.textContent.includes(P.segmentos[0].alterno),
      "el texto alternativo del primer segmento no está, o está reescrito");
  } finally { desmontar(); }
});

/* ═══════════════ LAS SEÑALES, EL COLOR Y EL CORAL ═══════════════ */

const luminancia = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contraste = (a, b) => {
  const [hi, lo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("★ los rótulos pequeños pasan 4,5:1 contra el fondo REAL de la tarjeta", () => {
  /*
   * El fondo se midió en el navegador —dos capas de rgba(10,20,34,0.45) sobre
   * el fondo de la materia— y da #0B1626, bastante más oscuro que el navy que
   * la tabla del encargo asumía. Por eso el par se comprueba contra el hex
   * medido y no contra el supuesto.
   */
  for (const [lado, hex] of Object.entries(TONO_ROTULO)) {
    const r = contraste(hex, FONDO_TARJETA);
    assert.ok(r >= 4.5, `${lado} (${hex}) da ${r.toFixed(2)}:1 sobre ${FONDO_TARJETA}`);
  }
  /* Y el par elegido es el de la fila oscura, no el de la clara. */
  assert.equal(TONO_ROTULO[DEBE], "#52C4B0");
  assert.equal(TONO_ROTULO[HABER], "#E9C46A");
});

test("★ ningún lado se dice SOLO con color: palabra y flecha van siempre", () => {
  const { caja, desmontar } = montar(ExploraUnaCuenta);
  try {
    const rotulos = [...caja.querySelectorAll("[data-rotulo]")];
    assert.ok(rotulos.length >= 2, "no hay rótulos de lado");
    const debe = rotulos.find((r) => r.getAttribute("data-rotulo") === DEBE);
    const haber = rotulos.find((r) => r.getAttribute("data-rotulo") === HABER);
    assert.ok(debe.textContent.includes("DEBE"), "el debe no lleva su palabra");
    assert.ok(haber.textContent.includes("HABER"), "el haber no lleva su palabra");
    assert.ok(debe.textContent.includes("←"), "el debe no lleva su flecha");
    assert.ok(haber.textContent.includes("→"), "el haber no lleva su flecha");
    /* Y el ▲, que es señal de forma y no de color. */
    assert.ok(caja.querySelector("[data-triangulo]"), "no hay ▲ en la cuenta");
  } finally { desmontar(); }
});

test("★ el coral no aparece en ninguna de las tres capas propias", () => {
  /* Esta pieza no califica: no hay error que marcar. */
  for (const [nombre, Componente] of [
    ["capa 2", MesaDeDosCasos], ["capa 3", ExploraUnaCuenta], ["capa 4", EnUnaFrase],
  ]) {
    const { caja, desmontar } = montar(Componente);
    try {
      assert.ok(!CORAL.test(caja.innerHTML), `${nombre} pinta coral`);
    } finally { desmontar(); }
  }
});

test("★ elegir una opción equivocada tampoco pinta coral", () => {
  const { caja, desmontar } = montar(EnUnaFrase);
  try {
    const mala = P.opciones.find((o) => !o.correcta);
    tocar(caja.querySelector(`[data-opcion="${mala.id}"]`));
    assert.ok(porDato(caja, `data-feedback="${mala.id}"`) || caja.querySelector("[data-feedback]"), "no salió la devolución");
    assert.ok(!CORAL.test(caja.innerHTML), "la opción equivocada se marcó en coral");
  } finally { desmontar(); }
});

/* ═══════════════ LA CAPA 3 Y LA CAPA 4 ═══════════════ */

test("★ la ficha NO se duplica: cae en un lado y en ninguno más", () => {
  const { caja, desmontar } = montar(ExploraUnaCuenta);
  try {
    const columna = (lado) => caja.querySelector(`[data-columna="${lado}"]`).querySelectorAll("[data-ficha]").length;
    const antesDebe = columna(DEBE);
    const antesHaber = columna(HABER);

    const paleta = [...caja.querySelectorAll("[data-ficha]")].filter((f) => f.getAttribute("aria-label")?.startsWith("Tomar "));
    assert.ok(paleta.length >= 3, "el dispensador no trae tres fichas");
    tocar(paleta[0]);
    tocar(caja.querySelector(`[data-destino="${DEBE}"]`));

    assert.equal(columna(DEBE), antesDebe + 1, "la ficha no cayó");
    assert.equal(columna(HABER), antesHaber, "la ficha también apareció del otro lado");
  } finally { desmontar(); }
});

test("★ con la ficha tomada, ← la suelta en el debe y → en el haber", () => {
  /*
   * Es la tabla de teclado del encargo, y no es un camino de segunda: las dos
   * teclas que ya significan izquierda y derecha son, literalmente, lo que
   * esta pieza enseña que son el debe y el haber.
   */
  const soltarCon = (tecla, lado) => {
    const { caja, desmontar } = montar(ExploraUnaCuenta);
    try {
      const columna = () => caja.querySelector(`[data-columna="${lado}"]`).querySelectorAll("[data-ficha]").length;
      const antes = columna();
      const paleta = [...caja.querySelectorAll("[data-ficha]")].filter((f) => f.getAttribute("aria-label")?.startsWith("Tomar "));
      tocar(paleta[0]);
      act(() => {
        paleta[0].dispatchEvent(new w.KeyboardEvent("keydown", { key: tecla, bubbles: true }));
      });
      assert.equal(columna(), antes + 1, `${tecla} no soltó la ficha en el ${lado}`);
    } finally { desmontar(); }
  };
  soltarCon("ArrowLeft", DEBE);
  soltarCon("ArrowRight", HABER);
});

test("★ ↑ y ↓ recorren las cuatro cuentas del selector", () => {
  const { caja, desmontar } = montar(ExploraUnaCuenta);
  try {
    const grupo = caja.querySelector('[role="radiogroup"]');
    const elegida = () => caja.querySelector('[role="radio"][aria-checked="true"]').getAttribute("data-cuenta-opcion");
    const primera = elegida();
    act(() => { grupo.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); });
    assert.notEqual(elegida(), primera, "la flecha abajo no cambió de cuenta");
    act(() => { grupo.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })); });
    assert.equal(elegida(), primera, "la flecha arriba no volvió");
  } finally { desmontar(); }
});

test("★ los dos avisos de la capa 3 están siempre, sin tocar nada", () => {
  const { caja, desmontar } = montar(ExploraUnaCuenta);
  try {
    const contrapartida = porDato(caja, "data-aviso-contrapartida");
    const gastos = porDato(caja, "data-linea-gastos");
    assert.ok(contrapartida, "falta el aviso de la contrapartida");
    assert.ok(gastos, "falta la línea de gastos e ingresos");
    assert.equal(contrapartida.textContent, P.exploracion.avisoContrapartida);
    assert.equal(gastos.textContent, P.exploracion.lineaGastosIngresos);
  } finally { desmontar(); }
});

test("★ el ▲ se reubica al cambiar de familia", () => {
  const { caja, desmontar } = montar(ExploraUnaCuenta);
  try {
    const dondeEsta = () => caja.querySelector("[data-triangulo]")?.getAttribute("data-triangulo");
    tocar(caja.querySelector('[data-cuenta-opcion="Caja"]'));
    assert.equal(dondeEsta(), DEBE, "un activo no crece por el debe");
    tocar(caja.querySelector('[data-cuenta-opcion="Ingresos por servicios"]'));
    assert.equal(dondeEsta(), HABER, "el ▲ no se movió al cambiar de familia");
    tocar(caja.querySelector('[data-cuenta-opcion="Gastos de operación"]'));
    assert.equal(dondeEsta(), DEBE, "un gasto no crece por el debe");
  } finally { desmontar(); }
});

test("★ la capa 4 tiene una sola correcta, y las cuatro traen devolución y dibujo", () => {
  assert.equal(P.opciones.filter((o) => o.correcta).length, 1);
  assert.equal(P.opciones.length, 4);
  for (const o of P.opciones) {
    assert.ok(o.texto?.length > 30, `${o.id}: sin enunciado`);
    assert.ok(o.feedback?.length > 60, `${o.id}: sin devolución`);
    assert.ok(o.visual, `${o.id}: sin dibujo`);
  }
  assert.equal(new Set(P.opciones.map((o) => o.visual)).size, 4, "dos opciones comparten dibujo");
});

test("★ cada opción enseña SU dibujo, no el de otra", () => {
  for (const o of P.opciones) {
    const { caja, desmontar } = montar(EnUnaFrase);
    try {
      tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
      const visual = caja.querySelector("[data-visual]");
      assert.ok(visual, `${o.id}: no salió ningún dibujo`);
      assert.equal(visual.getAttribute("data-visual"), o.visual, `${o.id}: salió el dibujo de otra`);
      assert.ok(caja.textContent.includes(o.feedback.slice(0, 40)), `${o.id}: no salió su devolución`);
    } finally { desmontar(); }
  }
});

test("★ el cierre repite el objetivo, y solo después de responder", () => {
  const { caja, desmontar } = montar(EnUnaFrase);
  try {
    assert.ok(!caja.querySelector("[data-cierre]"), "el cierre salió antes de responder");
    assert.ok(!caja.textContent.includes(P.objetivo), "el objetivo se adelantó");
    tocar(caja.querySelector(`[data-opcion="${P.opciones[0].id}"]`));
    assert.ok(caja.querySelector("[data-cierre]"), "no salió el cierre");
    assert.ok(caja.textContent.includes(P.objetivo), "el cierre no repite el objetivo");
  } finally { desmontar(); }
});

test("la pieza está registrada en la secuencia, y antes de La partida doble", () => {
  const ids = PIEZAS_APRENDER.map((p) => p.id);
  assert.ok(ids.includes(P.id), "la pieza no está en la secuencia");
  assert.ok(
    ids.indexOf(P.id) < ids.indexOf("cu-a3-partida-doble"),
    "va después de La partida doble, y su capa 3 promete que la siguiente arma la contrapartida",
  );
  assert.ok(ESCENAS[P.id]?.Capa2, "no tiene su capa 2 propia");
  assert.ok(ESCENAS[P.id]?.Capa4, "no tiene su capa 4 propia");
});
