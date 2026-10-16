import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { prepararDom, textoDeFiguras, lineaEnFiguras, enOrden, CONDICION } from "./t7-3-recorte.mjs";
import { ENTREGA4, MELLO_E4, E4_MELLO, OPCIONAL_E4, entrega4ConMello, seccionFusion, citasAnidadas } from "./correccionesMelloFusiones.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A7 «La NIC 2 del libro» (Célula C) · Aprender · LA FUSIÓN DE A7 Y A8.
 *
 *   · la pieza es la sección de la entrega 4 de Near (lote1-entrega4-v1.md)
 *     con las correcciones obligatorias de Mello encima (P1, el renglón y el
 *     acierto de P2, los aciertos de P4 y P6), letra por letra y en los dos
 *     sentidos; la opcional de Mello (la regla de P5 al resumen) no entra
 *   · el error de fondo: «almacenamiento» solo como lo directamente
 *     atribuible a la adquisición; nada de «lo que cuesta guardarla»
 *   · se recorre entera, estado por estado: al llegar, la pista, el 2.º error,
 *     el acierto con su figura, el «¿Por qué?» plegado, el foco en el mensaje,
 *     la franja de la NIC 2 en todas, el pie con la marca del ejemplo, y lo
 *     que la norma pide informar, que se abre en el resumen
 *   · H6 y H7 siguen con lo de A7 (la frase y los rótulos de los renglones)
 *   · fuera del catálogo de FP; en T7-3 después de A6; A8 salió de la lista
 * ═══════════════════════════════════════════════════════════════════════════
 */

const w = prepararDom(JSDOM, VirtualConsole);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a7.js");
const { SUBJECTS, APRENDER, HACER } = await import("../../data/subjects.js");
const { default: PantallasT7_3 } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError, sinAsiEs } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const P = A.PIEZA_NIC2_COSTO;
const S = seccionFusion(entrega4ConMello(), `## ${A.A7_ID} · «`);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const s = (id) => S.pantallas.find((x) => x.id === id);
/* La pantalla `revelar` de A8 (su v1): lo que la fusión pliega en el resumen. */
const A8_V1 = leer("orquestador/conocimiento/paquetes/t7-3-a8-v1.md");

/*
 * Qué opción nombra cada clave de error del paquete. Casi todas son una
 * palabra de la opción; «al comprar» es «Cuando la tienda la compró».
 */
const CLAVES = {
  "que-es": { computador: ["computador"], local: ["local"] },
  "como-se-mide": { "$580.000": ["costo"], "$610.000": ["precio"] },
  "el-costo": { "transporte o bodegaje": ["transporte", "bodegaje"] },
  formulas: { FIFO: ["fifo"], promedio: ["promedio"] },
  "la-que-falta": { PEPS: ["peps"], promedio: ["promedio"] },
  sistemas: { "costo estándar": ["estandar"], "identificación": ["identificacion"] },
  gasto: { "al comprar": ["al-comprar"], nunca: ["nunca"] },
};

/* ═══════════ 1 · LOS DATOS, CONTRA EL PAQUETE CON MELLO ═══════════ */

test("★★★ las correcciones de Mello entran en el paquete y salen los textos viejos; la opcional no se aplica", () => {
  const corregido = entrega4ConMello();
  for (const [viejo, nuevo] of E4_MELLO) {
    assert.equal(ENTREGA4.split(viejo).length - 1, 1, `el paquete trae una vez ${viejo}`);
    assert.ok(!corregido.includes(viejo), viejo);
    assert.ok(corregido.includes(nuevo), nuevo);
  }
  /* Los cuatro puntos de Mello: P1, el renglón y el acierto de P2, y los aciertos de P4 y P6. */
  assert.equal(E4_MELLO.length, 5);
  assert.equal(pantalla("que-es").parrafos[0], citasAnidadas(E4_MELLO[0][1])[0]);
  assert.equal(pantalla("como-se-mide").figuras[0].filas[1].rot, A.ROTULO_TERMINAR_Y_VENDER);
  assert.ok(MELLO_E4.includes(`«− ${A.ROTULO_TERMINAR_Y_VENDER}»`));
  assert.equal(pantalla("como-se-mide").acierto.texto, citasAnidadas(E4_MELLO[2][1])[0]);
  assert.equal(pantalla("formulas").acierto.texto, citasAnidadas(E4_MELLO[3][1])[0]);
  assert.equal(pantalla("sistemas").acierto.texto, citasAnidadas(E4_MELLO[4][1])[0]);
  /* La opcional: «la misma fórmula para inventarios parecidos» se queda en el plegado de P5, no va al resumen. */
  assert.match(OPCIONAL_E4, /^Opcional: en P5, la regla «la misma fórmula para inventarios parecidos»/);
  assert.match(pantalla("la-que-falta").acierto.porque, /la misma fórmula/);
  assert.ok(!JSON.stringify(pantalla("resumen")).includes("misma fórmula"));
});

test("★★★ pantallas, tipos, opciones, pista, errores, acierto y ¿Por qué?: los del paquete con Mello, letra por letra", () => {
  assert.equal(P.titulo, S.titulo);
  assert.equal(P.titulo, "La NIC 2 del libro");
  assert.deepEqual(P.pantallas.map((p) => [p.id, p.tipo]), S.pantallas.map((x) => [x.id, x.tipo]));
  assert.deepEqual(S.pantallas.map((x) => x.k), S.pantallas.map((_, k) => k));
  assert.equal(S.pantallas.length, 9);
  for (const x of S.pantallas.filter((y) => y.tipo === "eleccion")) {
    const p = pantalla(x.id);
    assert.deepEqual(p.opciones.map((o) => o.texto), x.opciones, `${x.id}: opciones`);
    assert.equal(p.pista, x.pista, `${x.id}: pista`);
    /* Cada mala tiene su error, por su clave; la correcta es la única que ningún error nombra. */
    const nombradas = new Set();
    for (const e of x.errores) {
      const ids = CLAVES[x.id][e.clave];
      assert.ok(ids, `${x.id}: clave sin opción: ${e.clave}`);
      for (const id of ids) {
        const o = p.opciones.find((y) => y.id === id);
        assert.ok(o && !o.correcta, `${x.id}: ${id}`);
        assert.equal(o.devolucion, e.texto, `${x.id}: error · ${e.clave}`);
        nombradas.add(id);
      }
    }
    assert.deepEqual(p.opciones.filter((o) => !nombradas.has(o.id)).map((o) => o.id), p.opciones.filter((o) => o.correcta).map((o) => o.id), `${x.id}: la correcta`);
    assert.equal(p.opciones.filter((o) => o.correcta).length, 1);
    assert.equal(p.acierto.texto, x.acierto.texto, `${x.id}: acierto`);
    assert.equal(p.acierto.porque ?? null, x.porque, `${x.id}: ¿Por qué?`);
    /* Ningún acierto lleva su «¿Por qué?» a la vista aparte: Near los pliega todos y Mello los pasó (ver la nota de abajo). */
    assert.equal(p.acierto.porqueALaVista, undefined, x.id);
  }
});

/*
 * LO QUE SE VE SIN TOCAR NADA, contra las líneas del paquete. Las de texto
 * son, en su orden, el objetivo, los párrafos, la pregunta y lo de después;
 * las de figura, lo que dicen las figuras. En la portada, la segunda línea es
 * la frase de la NIC 2: va en la franja (el `aviso` de la pieza).
 */
const lineasDeTexto = (p) => [p.objetivo, ...(p.parrafos ?? []), p.pregunta, ...(p.tras ?? []), p.desplegable?.boton].filter(Boolean);
const lineasDeFigura = (p) => (p.figuras ?? []).flatMap((f) => {
  const cifra = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  if (f.tipo === "renglones") return f.filas.map((r) => `${r.op ? `${r.op} ` : ""}${r.rot} ${cifra(r.v)}`);
  if (f.tipo === "fichas") return [f.medida.valor, ...f.fichas];
  return [];
});

test("★★★ cada línea visible del paquete está en los datos, y nada más: texto, figura y la frase de la NIC 2", () => {
  for (const x of S.pantallas) {
    const p = pantalla(x.id);
    const lineas = x.id === "portada" ? x.lineas.filter((l) => l !== P.aviso) : x.lineas;
    if (x.id === "portada") assert.deepEqual(x.lineas, [p.objetivo, A.FRASE_NIC2]);
    assert.deepEqual([...lineasDeTexto(p), ...lineasDeFigura(p)].sort(), [...lineas].sort(), x.id);
    /* Y en su orden: lo de texto, como en el paquete. */
    assert.deepEqual(lineasDeTexto(p), lineas.filter((l) => lineasDeTexto(p).includes(l)), `${x.id}: el orden`);
  }
  assert.equal(P.aviso, A.FRASE_NIC2);
  /* La figura del acierto de P2: costo y valor neto realizable, el menor marcado. */
  const menor = pantalla("como-se-mide").acierto.figuras[0];
  assert.deepEqual(menor, A.cuentaMenor(A.EJEMPLO_A7.costo, A.EJEMPLO_A7.vnr));
  assert.equal(s("como-se-mide").acierto.figura, "Costo $580.000 Valor neto realizable $550.000 El menor");
  assert.deepEqual(menor.filas.map((f) => [f.rot, f.v, f.marca]), [["Costo", 580_000, null], ["Valor neto realizable", 550_000, "El menor"]]);
  /* La figura del acierto de P3: las dos columnas, letra por letra. */
  const [suma, resta] = s("el-costo").acierto.figura.match(/^Se suma: (.+) Se resta: (.+)$/).slice(1);
  assert.deepEqual(pantalla("el-costo").acierto.figuras[0].columnas, [{ titulo: "Se suma", texto: suma }, { titulo: "Se resta", texto: resta }]);
  assert.match(s("el-costo").figura, /^en el acierto: dos columnas, «Se suma» y «Se resta»$/);
  /* Ninguna otra pantalla trae figura en el acierto. */
  assert.deepEqual(P.pantallas.filter((p) => p.acierto?.figuras).map((p) => p.id), ["como-se-mide", "el-costo"]);
  assert.deepEqual(S.pantallas.filter((x) => x.acierto?.figura).map((x) => x.id), ["como-se-mide", "el-costo"]);
});

test("★★★ lo que la norma pide informar es la pantalla `revelar` de A8 (v1), letra por letra, plegada en el resumen", () => {
  const d = pantalla("resumen").desplegable;
  assert.equal(d.boton, "Ver lo que la norma pide informar");
  assert.ok(ENTREGA4.includes("pasa plegada al resumen («Ver lo que la norma pide informar»)"));
  const fila = (n) => A8_V1.split("\n").filter((l) => l.startsWith(`| ${n}`));
  assert.deepEqual(d.parrafos, citasAnidadas(fila("4 · Revelar")[0]).slice(0, 1));
  assert.deepEqual(d.lista, fila("4 |").flatMap((l) => citasAnidadas(l.split(" | ")[1])));
  assert.equal(d.lista.length, 5);
});

test("★★★ el error de fondo: el costo suma solo lo que es parte de adquirir; nada de «lo que cuesta guardarla»", () => {
  const todo = JSON.stringify(P);
  for (const viejo of ["lo que cuesta guardarla", "El almacenamiento", "el almacenamiento", "lo que hace falta para tener la mercancía"]) assert.ok(!todo.includes(viejo), viejo);
  const c = pantalla("el-costo");
  assert.deepEqual(c.opciones.filter((o) => !o.correcta).map((o) => o.texto), ["El transporte hasta la bodega", "El bodegaje en la aduana mientras llega"]);
  /* Lo visible dice el límite: la figura («otros costos de adquirirla») y el resumen («lo que es parte de adquirir»). */
  assert.match(c.acierto.figuras[0].columnas[0].texto, /otros costos de adquirirla$/);
  assert.ok(pantalla("resumen").tras.includes("El costo suma lo que es parte de adquirir la mercancía y resta los descuentos comerciales."));
  assert.match(c.acierto.porque, /^Lo que se paga por guardarla entra solo si es parte de la compra\. El libro: «directamente atribuibles a la adquisición»\./);
  assert.match(c.acierto.pie, /p\. 258/);
});

test("★★★ H6 y H7 siguen con lo de A7: la frase de la NIC 2 y los rótulos de los renglones no cambian con la fusión", async () => {
  assert.equal(A.FRASE_NIC2, "Lo que ves aquí de la NIC 2 es lo que trae el libro. No lo tomes como el texto vigente de la norma.");
  assert.deepEqual(A.ROTULOS_A7, {
    precio: "Precio esperado de venta", terminar: "Lo que falta para terminar", vender: "Lo que cuesta vender",
    vnr: "Valor neto realizable", costo: "Costo", menorTit: "Se mide por el menor", menor: "El menor",
    ejemplo: "Ejemplo que no es del libro",
  });
  const { H6 } = await import("../../data/contabilidadT7_3_h6.js");
  const { H7 } = await import("../../data/contabilidadT7_3_h7.js");
  assert.equal(H6.aviso, A.FRASE_NIC2);
  assert.equal(H7.aviso, A.FRASE_NIC2);
  /* El rótulo nuevo de Mello es solo de `como-se-mide`: H7 no lo usa. */
  assert.ok(!JSON.stringify(H7).includes(A.ROTULO_TERMINAR_Y_VENDER));
  assert.deepEqual(A.cuentaVnr("x", 100, 10, 20).filas.map((f) => f.rot), [A.ROTULOS_A7.precio, A.ROTULOS_A7.terminar, A.ROTULOS_A7.vender, A.ROTULOS_A7.vnr]);
});

test("★★★ el ejemplo construido es el del registro de Near, y se mide por el menor; sin cifras de X1-X4 ni del OCR", () => {
  const E = A.EJEMPLO_A7;
  assert.equal(E.vnr, E.precio - E.vender);
  assert.equal(Math.min(E.costo, E.vnr), E.vnr);
  assert.equal(pantalla("como-se-mide").opciones.find((o) => o.correcta).texto, "$550.000");
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of [500_000, 800_000, 175_000, 5_800_000, 1_200_000, 8_700_000, 2_432_000, 17_632_000]) assert.ok(!numeros.has(x), String(x));
});

/* ═══════════ 2 · MONTADA, PANTALLA POR PANTALLA Y ESTADO POR ESTADO ═══════════ */

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(PantallasT7_3, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};

/*
 * EL «¿POR QUÉ?» DE P3 Y P7 TRAE «solo», «si» y «directamente», y va
 * plegado, como lo manda Near y lo pasó Mello (que revisó esta entrega
 * contra «ninguna condición plegada» y dio el límite por visible en la figura
 * y el resumen). La regla de los recortes (t7-3-recorte.mjs) lo pondría a la
 * vista, y P3 pasaría de 60 palabras: es una decisión de L. Aquí se deja
 * dicho cuáles son, para que no crezcan sin que se vea.
 */
test("★★ los «¿Por qué?» plegados que traen una palabra de condición son los de P3 y P7, y nada más", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.acierto?.porque && CONDICION.test(p.acierto.porque)).map((p) => p.id), ["el-costo", "gasto"]);
});

test("★★★ se recorre entera: cada pantalla y cada estado, contra el paquete con Mello, con la franja de la NIC 2 en todas", async () => {
  const m = await montar();
  const c = m.caja;
  const textos = () => [...c.querySelectorAll("[data-pieza] [data-texto]")].map((x) => x.textContent);
  const boton = (n) => c.querySelector(`[data-boton="${n}"]`);
  const pies = () => [...c.querySelectorAll("[data-pie]")].map((x) => x.textContent);
  const franja = () => {
    const f = c.querySelector("[data-pieza]").firstElementChild;
    assert.ok(f.matches("p.t73pt-nic2[data-aviso]"), "la franja no es lo primero de la pieza");
    assert.equal(f.textContent, A.FRASE_NIC2);
  };
  const visitadas = [];
  try {
    for (const [k, x] of S.pantallas.entries()) {
      const p = P.pantallas[k];
      assert.equal(c.querySelector("[data-pantalla]").dataset.pantalla, x.id);
      visitadas.push(x.id);
      const pieDe = (t) => (p.pieMarca ? [t, p.pieMarca] : [t]);
      /* Al llegar: las líneas de texto, en su orden y nada más; las de figura, en las figuras; nada plegado. */
      franja();
      const lineas = x.lineas.filter((l) => l !== A.FRASE_NIC2);
      const deTexto = lineas.filter((l) => textos().includes(l));
      assert.deepEqual(textos(), deTexto, `${x.id}: los textos al llegar`);
      for (const l of lineas.filter((y) => !deTexto.includes(y))) assert.ok(lineaEnFiguras(l, textoDeFiguras(c)), `${x.id}: «${l}» no está en la figura`);
      assert.equal(c.querySelector("[data-mensaje], [data-por-que], [data-plegado]"), null, `${x.id}: algo plegado o un mensaje al llegar`);
      assert.deepEqual(pies(), pieDe(p.pie), `${x.id}: el pie`);
      if (x.figura) assert.equal(Boolean(c.querySelector("figure, [data-figura]")), !/^en el acierto/.test(x.figura), `${x.id}: la figura`);
      if (x.tipo !== "eleccion") {
        const ultima = k === S.pantallas.length - 1;
        assert.equal(boton(x.tipo === "portada" ? "empezar" : "seguir") === null, ultima, `${x.id}: el botón`);
        if (!ultima) { await tocar(boton(x.tipo === "portada" ? "empezar" : "seguir")); continue; }
        /* El resumen: lo que la norma pide informar, cerrado; se abre con su botón (aria-expanded) y se vuelve a cerrar. */
        const b = c.querySelector("[data-desplegable] button");
        assert.equal(b.getAttribute("aria-expanded"), "false");
        assert.equal(b.dataset.boton, undefined, "no es un botón de interfaz");
        assert.equal(c.querySelector("[data-desplegado]"), null);
        await tocar(b);
        assert.equal(b.getAttribute("aria-expanded"), "true");
        const abierto = c.querySelector("[data-desplegado]");
        assert.equal(b.getAttribute("aria-controls"), abierto.id);
        assert.deepEqual([...abierto.querySelectorAll("[data-texto]")].map((y) => y.textContent), [...p.desplegable.parrafos, ...p.desplegable.lista]);
        await tocar(b);
        assert.equal(c.querySelector("[data-desplegado]"), null);
        franja();
        continue;
      }
      /* Las opciones del paquete; «Confirmar» inactivo hasta elegir; la figura del acierto no se adelanta. */
      assert.deepEqual([...c.querySelectorAll("[data-opcion]")].map((y) => y.textContent).sort(), [...x.opciones].sort());
      assert.equal(boton("confirmar").getAttribute("aria-disabled"), "true");
      const figAcierto = () => c.querySelector("[data-columnas], figure[data-renglones='Se mide por el menor']");
      assert.equal(figAcierto(), null, `${x.id}: la figura del acierto se adelanta`);
      /* La escalera: el 1.er error da la pista; el 2.º, la respuesta y el acierto sin «Así es». */
      let n = 0;
      for (const o of p.opciones.filter((y) => !y.correcta)) {
        await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton("confirmar"));
        n += 1;
        const msj = c.querySelector("[data-mensaje]");
        assert.equal(msj.dataset.mensaje, "error");
        assert.equal(w.document.activeElement, msj, `${x.id}: el foco va al mensaje`);
        const esperado = n === 1 ? [x.pista] : [`La respuesta es «${p.opciones.find((y) => y.correcta).texto}».`, sinAsiEs(x.acierto.texto)];
        assert.deepEqual([...msj.querySelectorAll("[data-texto]")].map((y) => y.textContent), esperado, `${x.id}: error ${n}`);
        assert.deepEqual(textosDelError(p, o, n), esperado);
        assert.deepEqual(pies(), pieDe(p.error.pie), `${x.id}: el pie del error`);
        assert.equal(figAcierto(), null, `${x.id}: la figura del acierto, con el error`);
        franja();
        await tocar(boton("probar-otra"));
        assert.equal(c.querySelector("[data-mensaje]"), null);
      }
      assert.equal(n, 2, `${x.id}: dos malas`);
      await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      await tocar(boton("confirmar"));
      const msj = c.querySelector("[data-mensaje]");
      assert.equal(msj.dataset.mensaje, "acierto");
      assert.equal(w.document.activeElement, msj);
      assert.deepEqual(pies(), pieDe(p.acierto.pie), `${x.id}: el pie del acierto`);
      franja();
      /* El acierto, entero, y su «¿Por qué?» plegado detrás del botón, que se abre al tocarlo. */
      const ps = [...msj.querySelectorAll("[data-texto]")];
      assert.equal(ps.length, 1);
      assert.equal(ps[0].textContent, `${x.acierto.texto} ${x.porque}`);
      const plegado = ps[0].querySelector("[data-plegado]");
      assert.equal(plegado.textContent, ` ${x.porque}`);
      assert.equal(plegado.hidden, true, `${x.id}: el ¿Por qué? va plegado`);
      const por = ps[0].querySelector("[data-por-que]");
      assert.equal(por.getAttribute("aria-expanded"), "false");
      await tocar(por);
      assert.equal(ps[0].querySelector("[data-plegado]").hidden, false);
      /* La figura del acierto, la que trae el paquete. */
      if (x.id === "como-se-mide") {
        const f = c.querySelector("figure[data-renglones='Se mide por el menor']");
        assert.ok(f, "sin la figura del menor");
        const filas = [...f.querySelectorAll("[data-renglon]")];
        assert.ok(enOrden("Costo $580.000", filas[0].textContent));
        assert.ok(enOrden("Valor neto realizable $550.000", filas[1].textContent.replace("El menor", "")));
        assert.equal(filas[1].querySelector(".rg-etq").textContent, "El menor");
        assert.ok(filas[1].classList.contains("rg-fuerte"));
        /* Los renglones del ejemplo siguen ahí: la figura crece. */
        assert.equal(c.querySelectorAll("figure[data-renglones]").length, 2);
      } else if (x.id === "el-costo") {
        const cols = [...c.querySelectorAll("[data-columnas] [data-columna]")];
        assert.deepEqual(cols.map((y) => [y.querySelector(".t73p-col-t").textContent, y.querySelector(".t73p-col-x").textContent]), [["Se suma", "precio, transporte, aranceles, impuestos que no se recuperan y otros costos de adquirirla"], ["Se resta", "descuentos comerciales y rebajas"]]);
        assert.ok(enOrden(x.acierto.figura.replace(/:/g, ""), textoDeFiguras(c)));
      } else assert.equal(figAcierto(), null);
      await tocar(boton("seguir"));
    }
    assert.deepEqual(visitadas, P.pantallas.map((p) => p.id));
  } finally {
    m.desmontar();
  }
});

test("★★★ figuras: el ejemplo en renglones sin título, con la marca en el pie; las fichas del resumen", async () => {
  const m = await montar();
  const c = m.caja;
  try {
    const ir = async (id) => {
      for (let i = 0; i < 20 && c.querySelector("[data-pantalla]").dataset.pantalla !== id; i++) {
        const p = pantalla(c.querySelector("[data-pantalla]").dataset.pantalla);
        if (p.opciones) {
          await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
          await tocar(c.querySelector('[data-boton="confirmar"]'));
        }
        await tocar(c.querySelector('[data-boton="seguir"], [data-boton="empezar"]'));
      }
    };
    await ir("como-se-mide");
    const f = c.querySelector("figure[data-renglones]");
    assert.equal(f.querySelector("figcaption"), null, "el ejemplo ya no lleva su marca de título");
    assert.deepEqual([...f.querySelectorAll("[data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, r.querySelector(".rg-rot").lastChild.textContent, r.querySelector(".rg-v").textContent, r.classList.contains("rg-res")]),
      [["", "Precio esperado de venta", "610.000", false], ["−", "Lo que falta para terminarla y venderla", "60.000", false], ["=", "Valor neto realizable", "550.000", true]]);
    assert.equal(c.querySelector("[data-pie-marca]").textContent, "Ejemplo que no es del libro");
    await ir("resumen");
    const fichas = c.querySelector("[data-fichas]");
    assert.deepEqual([...fichas.querySelector("[data-medida]").children].map((y) => y.textContent), ["Costo o valor neto realizable", "El menor de los dos"]);
    assert.deepEqual([...fichas.querySelectorAll("[data-ficha-nic2]")].map((y) => y.textContent), ["Identificación específica", "FIFO", "Promedio ponderado"]);
    assert.equal(c.querySelector("[data-pie-marca]"), null, "la marca del ejemplo solo va en su pantalla");
    /* El resumen va primero con la figura y después sus tres textos (el paquete, en ese orden). */
    assert.ok(fichas.compareDocumentPosition(c.querySelector("[data-pieza] [data-texto]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO, VISTA Y LOS HACER QUE DEPENDEN DE ELLA ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-3 después de A6 (con H5 en medio); la última Aprender del tema, con su nuevo nombre", () => {
  assert.equal(A.A7_ID, "t7-3-nic2-costo");
  assert.equal(P.numero, 7);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A7_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A7_ID), ids.indexOf("t7-3-ajuste-por-conteo") + 1);
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.A7_ID), aprender.indexOf("t7-3-provision-inventarios") + 1);
  assert.equal(aprender.at(-1), A.A7_ID);
  assert.equal(PIEZAS_T7_3.at(-1).pieza, P);
  assert.equal(PIEZAS_T7_3.find((x) => x.pieza.id === A.A7_ID).Pieza, PantallasT7_3);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A7_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a7.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
  /* Ningún texto interno en pantalla. */
  const visible = JSON.stringify(P);
  for (const interno of ["CONSTRUCCIÓN", "Near", "Mello", "ESCRITO POR CLAUDE", "PENDIENTE_DE_REVISION", "INFLESZ"]) assert.ok(!visible.includes(interno), interno);
});

test("★★★ A8 salió del catálogo y de la vista; H6 salió con la 0115, así que H7 va justo después de A7 y cierra el tema", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const ids = tema.actividades.map((x) => x.id);
  assert.ok(!ids.includes("t7-3-nic2-formulas"));
  assert.ok(!PIEZAS_T7_3.some((x) => x.pieza.id === "t7-3-nic2-formulas"));
  assert.ok(ENTREGA4.includes("A8 (`t7-3-nic2-formulas`) sale de la lista."));
  assert.ok(!ids.includes("t7-3-que-entra-al-costo"), "H6 sigue en el camino");
  assert.equal(ids.indexOf("t7-3-costo-o-vnr"), ids.indexOf(A.A7_ID) + 1);
  assert.equal(ids.at(-1), "t7-3-costo-o-vnr");
  assert.equal(tema.actividades.at(-1).clasificacion.tipo, HACER);
  /* Lo publicado de Aprender es lo del catálogo, en su orden. */
  assert.deepEqual(PIEZAS_T7_3.map((x) => x.pieza.id), tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id));
});
