import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { prepararDom, textoDeFiguras, lineaEnFiguras, enOrden, CONDICION } from "./t7-3-recorte.mjs";
import { recorrerC4, conReloj } from "./t7-3-c4.mjs";
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
const { default: AprenderT7_3C4 } = await import("../../components/mecanicas/libros/t7/AprenderT7_3C4.jsx");
const { CONSECUENCIA_C4: C4, PROPIOS_A7 } = await import("../c4/t73a7_c4.js");
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

/* ═══════════ 2 · MONTADA, EN EL PATRÓN C4, PANTALLA POR PANTALLA Y ESTADO POR ESTADO ═══════════ */

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AprenderT7_3C4, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const sp = (t) => t.replace(/\u00a0/g, " ");

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

test("★★★ se recorre entera en el patrón C4: cada pantalla y cada estado, contra el paquete con Mello, con la franja de la NIC 2 en todas; cada opción pinta la ficha", conReloj(async () => {
  const m = await montar();
  const c = m.caja;
  const franja = () => {
    const f = c.querySelector("[data-pieza-t73]").firstElementChild;
    assert.ok(f.matches("p.t73pt-nic2[data-aviso]"), "la franja no es lo primero de la pieza");
    assert.equal(f.textContent, A.FRASE_NIC2);
  };
  const figAcierto = () => c.querySelector("[data-columnas], figure[data-renglones='Se mide por el menor']");
  try {
    await recorrerC4({
      c, w, act, P, S, c4: C4, lineasFuera: [A.FRASE_NIC2], figuraDelAcierto: false,
      errorDe: (x, o) => x.errores.find((e) => CLAVES[x.id][e.clave].includes(o.id))?.texto,
      async alLlegar(id) {
        franja();
        if (id === "resumen") {
          /* El resumen: lo que la norma pide informar, cerrado; se abre con su botón (aria-expanded) y se vuelve a cerrar. */
          const b = c.querySelector("[data-desplegable] button");
          assert.equal(b.getAttribute("aria-expanded"), "false");
          assert.equal(b.dataset.boton, undefined, "no es un botón de interfaz");
          assert.equal(c.querySelector("[data-desplegado]"), null);
          await act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
          assert.equal(b.getAttribute("aria-expanded"), "true");
          const abierto = c.querySelector("[data-desplegado]");
          assert.equal(b.getAttribute("aria-controls"), abierto.id);
          assert.deepEqual([...abierto.querySelectorAll("[data-texto]")].map((y) => y.textContent), [...pantalla("resumen").desplegable.parrafos, ...pantalla("resumen").desplegable.lista]);
          await act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
          assert.equal(c.querySelector("[data-desplegado]"), null);
        }
        if (pantalla(id).tipo === "eleccion") assert.equal(figAcierto(), null, `${id}: la figura del acierto se adelanta`);
        if (id === "que-es") assert.equal(c.querySelector('[data-zona="inventario"] [data-chip]'), null);
        if (id === "como-se-mide") {
          assert.deepEqual([...c.querySelectorAll(".t73c4-marca")].map((x) => x.textContent), ["VNR $550.000", "Costo $580.000"]);
          assert.equal(c.querySelector("[data-valor]"), null);
        }
        if (id === "el-costo") assert.deepEqual([...c.querySelectorAll("[data-c4-objeto='costo'] .rg-op")].map((x) => x.textContent), ["+", "+", "+", "?"]);
        if (id === "gasto") assert.equal(c.querySelector("[data-chip]"), null);
        if (["formulas", "la-que-falta", "sistemas"].includes(id)) assert.equal(c.querySelector("[data-figura]"), null, `${id}: sin figura (ítem propio)`);
      },
      async alElegir(id, o) {
        if (id === "que-es") assert.equal(c.querySelector('[data-zona="inventario"] [data-chip]').textContent, { mercancia: "La mercancía", computador: "El computador", local: "El local" }[o.id]);
        if (id === "como-se-mide") {
          const v = c.querySelector("[data-valor]");
          assert.equal(v.textContent, o.texto);
          /* Sobre la regla de $500.000 a $650.000. */
          assert.equal(v.parentElement.style.left, `${(100 * (Number(o.texto.replace(/\D/g, "")) - 500000)) / 150000}%`);
        }
        if (id === "el-costo") {
          const filas = [...c.querySelectorAll("[data-c4-objeto='costo'] [data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, sp(r.querySelector(".rg-rot").lastChild.textContent)]);
          assert.deepEqual(filas.filter(([op]) => op === "−").map(([, t]) => t), [o.texto], "lo tocado resta");
          assert.equal(filas.filter(([op]) => op === "+").length, 3);
        }
        if (id === "gasto") assert.equal(c.querySelector("[data-chip]").textContent, `Pasa a gasto: ${{ marzo: "Marzo · con la venta", "al-comprar": "Al comprar", nunca: "Nunca" }[o.id]}`);
        franja();
      },
      async alVeredicto(id, o, H) {
        franja();
        assert.ok(H.figura().querySelector(".t73c4-mal"), `${id} · ${o.id}: sin la marca coral`);
        assert.equal(figAcierto(), null, `${id}: la figura del acierto, con el error`);
      },
      async alAcertar(id) {
        franja();
        /* La figura del acierto, la que trae el paquete. */
        if (id === "como-se-mide") {
          const f = c.querySelector("figure[data-renglones='Se mide por el menor']");
          assert.ok(f, "sin la figura del menor");
          const filas = [...f.querySelectorAll("[data-renglon]")];
          assert.ok(enOrden("Costo $580.000", filas[0].textContent));
          assert.ok(enOrden("Valor neto realizable $550.000", filas[1].textContent.replace("El menor", "")));
          assert.equal(filas[1].querySelector(".rg-etq").textContent, "El menor");
          assert.ok(filas[1].classList.contains("rg-fuerte"));
          /* Los renglones del ejemplo siguen ahí: la figura crece. */
          assert.equal(c.querySelectorAll("figure[data-renglones]").length, 2);
        } else if (id === "el-costo") {
          const cols = [...c.querySelectorAll("[data-columnas] [data-columna]")];
          assert.deepEqual(cols.map((y) => [y.querySelector(".t73p-col-t").textContent, y.querySelector(".t73p-col-x").textContent]), [["Se suma", "precio, transporte, aranceles, impuestos que no se recuperan y otros costos de adquirirla"], ["Se resta", "descuentos comerciales y rebajas"]]);
          assert.ok(enOrden(s(id).acierto.figura.replace(/:/g, ""), textoDeFiguras(c)));
        } else assert.equal(figAcierto(), null);
      },
    });
  } finally {
    m.desmontar();
  }
}));

test("★★★ figuras: el ejemplo en renglones sin título, con la marca en el pie; las fichas del resumen", conReloj(async () => {
  const m = await montar();
  const c = m.caja;
  const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  try {
    const ir = async (id) => {
      for (let i = 0; i < 20; i++) {
        const aqui = c.querySelector("[data-item]")?.dataset.item ?? c.querySelector("[data-pantalla]").dataset.pantalla;
        if (aqui === id) return;
        const p = pantalla(aqui);
        if (p.opciones) {
          await tocar(c.querySelector(`[data-op="${p.opciones.find((o) => o.correcta).id}"]`));
          await act(async () => { mock.timers.tick(380); });
          await tocar(c.querySelector(".c4-seguir"));
        } else await tocar(c.querySelector('[data-boton="seguir"], [data-boton="empezar"]'));
      }
      assert.fail(`no se llegó a ${id}: ${c.querySelector("[data-item]")?.dataset.item} ${c.querySelector("[data-pantalla]")?.dataset.pantalla} ${c.querySelector(".c4-seguir")?.getAttribute("aria-disabled")} ${c.querySelector("[data-mensaje]")?.textContent}`);
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
}));

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
  assert.equal(PIEZAS_T7_3.find((x) => x.pieza.id === A.A7_ID).Pieza, AprenderT7_3C4);
  /* Las tres pantallas que vinieron de A8 van como ítem «propio» del motor C4 (sin figura de Watari todavía). */
  assert.deepEqual(PROPIOS_A7, ["formulas", "la-que-falta", "sistemas"]);
  assert.deepEqual(C4.items.filter((i) => i.tipo === "propio").map((i) => i.id), PROPIOS_A7);
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
