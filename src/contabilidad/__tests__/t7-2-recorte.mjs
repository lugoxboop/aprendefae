import assert from "node:assert/strict";
import { CONDICION } from "./correccionesMelloRecortesT72.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · LOS RECORTES DE A1, A2 Y A3 — lo común de sus pruebas (no es una
 * prueba: lo importan).
 *
 *   · `compararConSeccion` compara los datos de la pieza con la sección del
 *     paquete corregido (correccionesMelloRecortesT72.mjs), letra por letra y
 *     en los dos sentidos: mismas pantallas, en su orden y con su tipo; las
 *     líneas de cada pantalla (texto o figura) en su orden; opciones; pista
 *     (de la pantalla o de cada línea); cada error con la opción o la línea
 *     que nombra; acierto, figura del acierto y «¿Por qué?»
 *   · `recorrer` monta la pieza y la recorre entera, estado por estado: al
 *     llegar (textos, figura, nada plegado, pie), cada error con la escalera
 *     de ayuda (pista; luego la respuesta y su porqué) y el foco en el
 *     mensaje, el acierto (con su «¿Por qué?» plegado o a la vista, y lo que
 *     se abre con «Ver…»), y la figura que crece con el acierto
 *
 * Cada prueba da, por pantalla, lo que sus datos dicen que se ve: `deDatos`
 * (las líneas, las opciones y la figura del acierto, en el orden del
 * paquete) y `alLlegar` (los textos y la figura que deben estar en el DOM).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const sinAsiEs = (t) => { const x = String(t).replace(/^(Así es|Exacto)[.:]\s*/, ""); return x.charAt(0).toUpperCase() + x.slice(1); };
export const respuesta = (t) => `La respuesta es «${String(t).replace(/\.$/, "")}».`;
const nombreLado = (l) => l.charAt(0).toUpperCase() + l.slice(1);

/** La opción mala que nombra la clave de un error del paquete («al cierre», «$2.140», «ingresos o gastos»). */
export function opcionDeClave(clave, opciones) {
  const malas = opciones.filter((o) => !o.correcta);
  const c = clave.toLowerCase();
  const t = (o) => o.texto.toLowerCase();
  /* Por último, palabra por palabra: «del inicio y del 14» nombra la opción que trae «inicio» y «14». */
  const palabras = (x) => x.split(/[\s,:]+/).filter((y) => y && !["y", "de", "del", "la", "las", "el", "los"].includes(y));
  const todas = (o) => palabras(c).every((p) => palabras(t(o)).includes(p));
  for (const f of [(o) => t(o) === c, (o) => t(o).startsWith(c), (o) => t(o).includes(c), todas]) {
    const x = malas.filter(f);
    if (x.length === 1) return x[0];
  }
  assert.fail(`la clave «${clave}» no nombra una sola opción mala`);
}

/**
 * Los datos contra la sección. `deDatos(p)` da, en el orden del paquete:
 *   lineas, opciones   lo que la pantalla muestra (texto o figura)
 *   erroresLados       en una pantalla de lados, [{ clave, texto }] en orden
 *   figuraAcierto      la figura del acierto, como la escribe el paquete
 */
export function compararConSeccion(P, S, deDatos) {
  assert.equal(P.titulo, S.titulo);
  assert.deepEqual(P.pantallas.map((p) => [p.id, p.tipo]), S.pantallas.map((s) => [s.id, s.tipo]));
  for (const [k, s] of S.pantallas.entries()) {
    const p = P.pantallas[k];
    const d = deDatos(p);
    assert.equal(s.k, k, `${s.id}: P${s.k}`);
    assert.deepEqual(d.lineas, s.lineas, `${s.id}: las líneas`);
    assert.deepEqual(d.opciones ?? [], s.opciones, `${s.id}: opciones o líneas`);
    assert.equal(p.pista ?? null, s.pista, `${s.id}: pista`);
    if (s.tipo === "lados") {
      /* Las pistas propias de línea: las del paquete, por nombre; las demás líneas, sin otra que la del lote 2 (las prueba cada pieza). */
      for (const [nombre, pista] of Object.entries(s.pistasLinea)) assert.equal(p.lineas.find((l) => l.id === nombre)?.pista, pista, `${s.id} · ${nombre}: pista`);
      assert.deepEqual(d.erroresLados, s.errores, `${s.id}: errores`);
    } else if (s.tipo === "eleccion") {
      assert.deepEqual(s.pistasLinea, {});
      const nombradas = new Set();
      for (const e of s.errores) {
        const o = opcionDeClave(e.clave, p.opciones);
        assert.equal(o.devolucion, e.texto, `${s.id}: error · ${e.clave}`);
        nombradas.add(o.id);
      }
      /* Cada mala tiene su error; la correcta es la que queda, y es una. */
      assert.deepEqual(p.opciones.filter((o) => !nombradas.has(o.id)).map((o) => o.id), p.opciones.filter((o) => o.correcta).map((o) => o.id), `${s.id}: la correcta`);
      assert.equal(p.opciones.filter((o) => o.correcta).length, 1);
    } else {
      assert.equal(p.opciones, undefined, s.id);
      assert.deepEqual([s.pista, s.errores, s.acierto, s.porque], [null, [], null, null], s.id);
    }
    if (s.acierto) {
      assert.equal(p.acierto.texto, s.acierto.texto, `${s.id}: acierto`);
      assert.equal(d.figuraAcierto ?? null, s.acierto.figura, `${s.id}: la figura del acierto`);
      /* El «¿Por qué?»: escrito aparte, o un «Ver…» que abre lo que nombra. */
      assert.equal(p.acierto.porque ?? p.acierto.ver?.texto ?? null, s.porque, `${s.id}: ¿Por qué?`);
      assert.ok(!(p.acierto.porque && p.acierto.ver), `${s.id}: porque y ver a la vez`);
      /* Regla de L: con condición, a la vista; sin ella, plegado. */
      assert.equal(Boolean(p.acierto.porqueALaVista), Boolean(p.acierto.porque && CONDICION.test(p.acierto.porque)), `${s.id}: ¿Por qué? con condición, a la vista`);
    }
  }
}

/* ═══════════ MONTADA ═══════════ */

const limpio = (t) => String(t).replace(/\s+/g, " ").trim();

/** El texto de las figuras (sin lo que solo oye el lector), cada una aparte, con sus trozos separados por un espacio. */
export function figuras(c) {
  return [...c.querySelectorAll("[data-pieza] figure, [data-pieza] [data-figura]")]
    .filter((el, _, todos) => !todos.some((o) => o !== el && o.contains(el)))
    .map((el) => {
      const x = el.cloneNode(true);
      for (const s of x.querySelectorAll(".t7b2-sr, .t7bp-sr, [hidden], [aria-hidden=\"true\"]")) s.remove();
      /* Cada trozo de texto, aparte: «Debe» y «Entradas» son dos celdas. */
      const trozos = [];
      const andar = x.ownerDocument.createTreeWalker(x, 4);
      for (let n = andar.nextNode(); n; n = andar.nextNode()) if (n.textContent.trim()) trozos.push(n.textContent.trim());
      return limpio(trozos.join(" "));
    });
}

/** Los textos de la pantalla fuera de mensajes, figuras, «Ver…» abiertos y filas de lados, en el orden del DOM. */
export const textosFuera = (c) => [...c.querySelectorAll("[data-pieza] [data-texto]")]
  .filter((el) => !el.closest("[data-mensaje], figure, [data-figura], [data-visto], [data-fila]"))
  .map((el) => el.textContent);

/**
 * Recorre la pieza montada. `alLlegar(p)` da { textos, lineasBarajadas, figuras }:
 * los textos fuera de las filas de lados, en orden; los de las filas (se
 * barajan: se comparan ordenados); y el texto de cada figura al llegar.
 * `figurasAlAcertar(p)` da las figuras tras acertar (lo que crece).
 * `alVer(p, c)` comprueba lo que abre el «Ver…».
 */
export async function recorrer({ caja: c, P, tocar, w, alLlegar, figurasAlAcertar, alVer }) {
  const boton = (n) => c.querySelector(`[data-boton="${n}"]`);
  const pies = () => [...c.querySelectorAll("[data-pie]")].map((x) => x.textContent);
  const mensaje = () => c.querySelector("[data-mensaje]");
  const visitadas = [];
  for (const [k, p] of P.pantallas.entries()) {
    assert.equal(c.querySelector("[data-pantalla]").dataset.pantalla, p.id);
    visitadas.push(p.id);
    const e = alLlegar(p);
    assert.deepEqual(textosFuera(c), e.textos, `${p.id}: los textos al llegar`);
    assert.deepEqual([...c.querySelectorAll("[data-fila] [data-texto]")].filter((x) => !x.closest("[data-mensaje]")).map((x) => x.textContent).sort(), [...(e.lineasBarajadas ?? [])].sort(), `${p.id}: las líneas`);
    assert.deepEqual(figuras(c), e.figuras, `${p.id}: las figuras al llegar`);
    assert.equal(Boolean(mensaje()), false);
    /* Lo del recorte se ve entero: nada plegado al llegar. */
    assert.equal(Boolean(c.querySelector("[data-por-que], [data-plegado]")), false, `${p.id}: un texto plegado al llegar`);
    assert.deepEqual(pies(), [p.pie], `${p.id}: el pie`);
    /* Un «Ver…» antes de responder (A2, P2): cerrado; se abre y se cierra. */
    if (p.ver) await probarVer(c, tocar, p, alVer);
    if (p.tipo === "portada" || p.tipo === "lectura" || p.tipo === "resumen") {
      const ultima = k === P.pantallas.length - 1;
      assert.equal(c.querySelector("[data-boton]") === null, ultima, `${p.id}: el botón`);
      if (!ultima) await tocar(boton(p.tipo === "portada" ? "empezar" : "seguir"));
      continue;
    }
    if (p.tipo === "eleccion") {
      assert.deepEqual([...c.querySelectorAll("[data-opcion]")].map((x) => x.textContent).sort(), p.opciones.map((o) => o.texto).sort());
      assert.equal(boton("confirmar").getAttribute("aria-disabled"), "true");
      let n = 0;
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton("confirmar"));
        n += 1;
        assert.equal(mensaje().dataset.mensaje, "error");
        assert.ok(w.document.activeElement === mensaje(), `${p.id}: el foco va al mensaje`);
        const esperado = n === 1 ? [p.pista] : [respuesta(p.opciones.find((x) => x.correcta).texto), sinAsiEs(p.acierto.texto)];
        assert.deepEqual([...mensaje().querySelectorAll("[data-texto]")].map((x) => x.textContent), esperado, `${p.id}: error ${n}`);
        assert.deepEqual(pies(), [p.error.pie], `${p.id}: el pie del error`);
        /* Lo del acierto no se adelanta con el error. */
        assert.deepEqual(figuras(c), e.figuras, `${p.id}: las figuras, con el error`);
        assert.equal(Boolean(c.querySelector("[data-ver]")), Boolean(p.ver), `${p.id}: el «Ver…» con el error`);
        await tocar(boton("probar-otra"));
        assert.equal(Boolean(mensaje()), false);
      }
      assert.equal(n, 2, `${p.id}: dos malas`);
      await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      await tocar(boton("confirmar"));
    } else {
      /* Lados: todas al lado equivocado dos veces (pista; luego la respuesta y la línea cerrada), y luego bien. */
      const casilla = (id, lado) => c.querySelector(`[data-linea="${id}"][data-lado="${lado}"]`);
      const otro = (l) => (l === "debe" ? "haber" : "debe");
      const errores = () => p.lineas.map((l) => [l.id, [...c.querySelectorAll(`[data-fila="${l.id}"] [data-mensaje] [data-texto]`)].map((x) => x.textContent)]);
      for (const n of [1, 2]) {
        for (const l of p.lineas) await tocar(casilla(l.id, otro(l.lado)));
        assert.equal(boton("confirmar").getAttribute("aria-disabled"), null);
        await tocar(boton("confirmar"));
        assert.deepEqual(errores(), p.lineas.map((l) => [l.id, n === 1 ? [l.pista ?? p.pista] : [respuesta(nombreLado(l.lado)), l.devolucion]]), `${p.id}: error ${n}`);
        assert.ok(w.document.activeElement === c.querySelector("[data-mensaje]"), `${p.id}: el foco va al primer mensaje`);
        assert.deepEqual(pies(), [p.error.pie]);
        assert.deepEqual(figuras(c), e.figuras, `${p.id}: las figuras, con el error`);
        await tocar(boton("probar-otra"));
        for (const l of p.lineas) assert.equal(casilla(l.id, l.lado).getAttribute("aria-pressed"), n === 1 ? "false" : "true", `${p.id} · ${l.id}: tras probar otra`);
      }
      /* Cerradas en su lado: ya no se mueven. */
      await tocar(casilla(p.lineas[0].id, otro(p.lineas[0].lado)));
      assert.equal(casilla(p.lineas[0].id, p.lineas[0].lado).getAttribute("aria-pressed"), "true");
      await tocar(boton("confirmar"));
    }
    const msj = mensaje();
    assert.equal(msj.dataset.mensaje, "acierto", `${p.id}: el acierto`);
    assert.ok(w.document.activeElement === msj, `${p.id}: el foco va al acierto`);
    assert.deepEqual(pies(), [p.acierto.pie], `${p.id}: el pie del acierto`);
    const ps = [...msj.querySelectorAll("[data-texto]")];
    const a = p.acierto;
    if (!a.porque) {
      assert.deepEqual(ps.map((x) => x.textContent), [a.texto], `${p.id}: el acierto`);
      assert.equal(Boolean(msj.querySelector("[data-por-que]")), false);
    } else if (a.porqueALaVista) {
      assert.deepEqual(ps.map((x) => x.textContent), [a.texto, a.porque], `${p.id}: el ¿Por qué? a la vista`);
      assert.equal(Boolean(msj.querySelector("[data-por-que], [data-plegado]")), false);
    } else {
      assert.equal(ps.length, 1);
      assert.equal(ps[0].textContent, `${a.texto} ${a.porque}`);
      const plegado = ps[0].querySelector("[data-plegado]");
      assert.equal(plegado.textContent, ` ${a.porque}`);
      assert.equal(plegado.hidden, true, `${p.id}: el ¿Por qué? va plegado`);
      const por = ps[0].querySelector("[data-por-que]");
      assert.equal(por.getAttribute("aria-expanded"), "false");
      await tocar(por);
      assert.equal(ps[0].querySelector("[data-plegado]").hidden, false);
    }
    assert.deepEqual(figuras(c), figurasAlAcertar(p), `${p.id}: las figuras con el acierto`);
    if (a.ver) await probarVer(c, tocar, { ...p, ver: a.ver }, alVer);
    else assert.equal(c.querySelectorAll("[data-ver]").length, p.ver ? 1 : 0, `${p.id}: un «Ver…» que no es del acierto`);
    await tocar(boton("seguir"));
  }
  assert.deepEqual(visitadas, P.pantallas.map((p) => p.id));
}

/* El «Ver…»: un botón real, cerrado con `aria-expanded="false"`; al tocarlo se abre lo que nombra; al tocarlo otra vez, se cierra. */
async function probarVer(c, tocar, p, alVer) {
  const caja = c.querySelector("[data-ver]");
  assert.ok(caja, `${p.id}: falta el «Ver…»`);
  const b = caja.querySelector("button");
  assert.equal(b.getAttribute("type"), "button");
  assert.equal(b.textContent, p.ver.texto);
  assert.equal(b.getAttribute("aria-expanded"), "false");
  assert.equal(Boolean(caja.querySelector("[data-visto]")), false, `${p.id}: lo del «Ver…» antes de tocarlo`);
  await tocar(b);
  assert.equal(b.getAttribute("aria-expanded"), "true");
  const visto = caja.querySelector("[data-visto]");
  assert.equal(b.getAttribute("aria-controls"), visto.id);
  await alVer(p, visto);
  await tocar(b);
  assert.equal(b.getAttribute("aria-expanded"), "false");
  assert.equal(Boolean(caja.querySelector("[data-visto]")), false);
}
