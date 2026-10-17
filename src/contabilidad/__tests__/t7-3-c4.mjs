import assert from "node:assert/strict";
import { mock } from "node:test";
import { textoDeFiguras, lineaEnFiguras, opcionesDeClave } from "./t7-3-recorte.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · LAS APRENDER CON EL PATRÓN C4 (Célula C) — lo común de sus pruebas
 * (no es una prueba: lo importan las de A1 a A7).
 *
 * `recorrerC4` monta la pieza en la vista de T7-3 (AprenderT7_3C4) y la
 * recorre entera contra el paquete de Near, letra por letra:
 *   · las lecturas (portada, asiento, resumen) como siempre: sus textos, sus
 *     figuras, su pie y su botón
 *   · cada pantalla de elección, en el motor C4: al llegar (texto, pregunta,
 *     opciones, figura sin elegir, nada de mensaje, «Seguir» inactivo); cada
 *     mala, en el orden de los datos: la figura pinta SU consecuencia antes
 *     del veredicto (sin mensaje ni falla), y a los 380 ms la falla en texto,
 *     el mensaje (1.er error, la pista; 2.º, la devolución del paquete con la
 *     correcta marcada) y el foco en el mensaje; la buena: su consecuencia,
 *     el acierto, el «¿Por qué?» que se abre, lo que cuadra y el pie
 *   · las figuras: cada línea de figura del paquete está en la figura
 *
 * Usa los relojes de prueba (mock.timers) para los 380 ms del motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ESPERA = 380;

export function ayudas(c, w, act) {
  const q = (s) => c.querySelector(s);
  const qq = (s) => [...c.querySelectorAll(s)];
  const tocar = async (el) => {
    assert.ok(el, "no está el elemento que se quería tocar");
    await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  };
  const pasar = async (ms = ESPERA) => { await act(async () => { mock.timers.tick(ms); }); };
  const estado = () => JSON.parse(q("[data-c4-estado]").dataset.c4Estado);
  const figura = () => q("[data-figura]");
  const mensaje = () => q("[data-mensaje]");
  const retro = () => q("[data-mensaje] [data-texto-retro]")?.textContent ?? null;
  const falla = () => q("[data-falla]")?.textContent ?? null;
  const pies = () => qq("[data-pie-fuente], [data-pie-tarifas], [data-pie-marca], [data-pie]:not(.c4-pie)").map((x) => x.textContent);
  const op = (id) => q(`[data-op="${id}"]`);
  const seguir = () => q('.c4-seguir[data-boton]');
  return { q, qq, tocar, pasar, estado, figura, mensaje, retro, falla, pies, op, seguir };
}

/** El motor con relojes de prueba. */
export const conReloj = (fn) => async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try { await fn(); } finally { mock.timers.reset(); }
};

/**
 * Recorre la pieza montada en `c`. opciones:
 *   P, S         la pieza (datos) y su sección del paquete (seccion / seccionFusion)
 *   c4           su CONSECUENCIA_C4
 *   errorDe(s, o)   el texto del paquete para la mala `o` (por defecto, por la clave del error)
 *   tarifas, frase  pantallas con la frase de las tarifas en el pie
 *   alLlegar(id, H), alElegir(id, o, H), alVeredicto(id, o, H), alAcertar(id, H)   lo propio de la pieza
 *   lineasFuera     líneas del paquete que van fuera de la pantalla (la franja de la NIC 2)
 *   figuraDelAcierto  false: la pieza mira la figura del acierto por su cuenta
 */
export async function recorrerC4({ c, w, act, P, S, c4, errorDe = null, frase = null, alLlegar, alElegir, alVeredicto, alAcertar, lineasFuera = [], figuraDelAcierto = true }) {
  const H = ayudas(c, w, act);
  const { q, qq, tocar, pasar } = H;
  const visitadas = [];
  const items = c4.items;
  const errorDelPaquete = errorDe ?? ((s, o, p) => s.errores.find((e) => opcionesDeClave(e.clave, p.opciones).some((x) => x.id === o.id))?.texto);
  for (const [k, s] of S.pantallas.entries()) {
    const p = P.pantallas[k];
    assert.equal(p.id, s.id);
    visitadas.push(s.id);
    const conFrase = (t) => [t, ...(p.pieTarifas ? [frase] : []), ...(p.pieMarca ? [p.pieMarca] : [])];
    const lineas = s.lineas.filter((l) => !lineasFuera.includes(l));
    if (s.tipo !== "eleccion") {
      /* Una lectura: sus textos en su orden; lo demás, en sus figuras; su pie y su botón. */
      assert.equal(q("[data-pantalla]")?.dataset.pantalla, s.id, `${s.id}: la pantalla`);
      assert.equal(q("[data-item]"), null, `${s.id}: el motor no está en una lectura`);
      const textos = qq("[data-pieza] [data-texto]").map((x) => x.textContent);
      const deTexto = lineas.filter((l) => textos.includes(l));
      assert.deepEqual(textos, deTexto, `${s.id}: los textos`);
      for (const l of lineas.filter((x) => !deTexto.includes(x))) assert.ok(lineaEnFiguras(l, textoDeFiguras(c)), `${s.id}: «${l}» no está en la figura`);
      assert.deepEqual(qq("[data-pie]").map((x) => x.textContent), conFrase(p.pie), `${s.id}: el pie`);
      await alLlegar?.(s.id, H);
      const ultima = k === S.pantallas.length - 1;
      const boton = q(`[data-boton="${s.tipo === "portada" ? "empezar" : "seguir"}"]`);
      assert.equal(boton === null, ultima, `${s.id}: el botón`);
      if (!ultima) {
        await tocar(boton);
        assert.equal(w.document.activeElement, q("[data-pieza-t73]"), `${s.id}: el foco vuelve a la pieza`);
      }
      continue;
    }

    /* ═══ una pantalla de elección, en el motor C4 ═══ */
    const I = items.find((x) => x.id === s.id);
    assert.ok(I, `${s.id}: no está en el registro C4`);
    assert.equal(q("[data-item]")?.dataset.item, s.id, `${s.id}: el ítem del motor`);
    assert.equal(q("[data-pieza]").dataset.modo, "aprender");
    const propio = I.tipo === "propio";
    /* Al llegar: el texto (párrafos y lo que sigue) y la pregunta, letra por letra; lo demás, en la figura. */
    const deTexto = [...(p.parrafos ?? []), ...(p.tras ?? [])];
    for (const l of deTexto) assert.ok(lineas.includes(l), `${s.id}: «${l}» no está en el paquete`);
    assert.equal(q("[data-texto].c4-txt").textContent, deTexto.join(" "), `${s.id}: el texto`);
    assert.equal(q("[data-texto].c4-txt").hidden, deTexto.length === 0);
    assert.ok(lineas.includes(p.pregunta), `${s.id}: la pregunta no está en el paquete`);
    assert.equal(q("[data-pregunta]").textContent, p.pregunta, `${s.id}: la pregunta`);
    for (const l of lineas.filter((x) => !deTexto.includes(x) && x !== p.pregunta)) assert.ok(lineaEnFiguras(l, textoDeFiguras(c)), `${s.id}: «${l}» no está en la figura`);
    /* El texto de cada opción (su primer hijo: en la figura, el renglón trae además su cifra). */
    assert.deepEqual(qq("[data-op]").map((x) => x.firstElementChild.textContent).sort(), [...s.opciones].sort(), `${s.id}: las opciones`);
    assert.equal(H.mensaje(), null);
    assert.equal(H.falla(), null);
    assert.deepEqual(H.pies(), conFrase(p.pie), `${s.id}: el pie al llegar`);
    assert.equal(H.seguir().getAttribute("aria-disabled"), "true", `${s.id}: «Seguir» inactivo`);
    const cejilla = q("[data-cejilla]").textContent;
    assert.match(cejilla, /^Pregunta \d+ de \d+$/, `${s.id}: la cejilla`);
    const base = propio ? null : H.estado();
    if (!propio) {
      assert.deepEqual(base, c4.consecuencia(I, null), `${s.id}: la figura sin elegir`);
      assert.equal(q("[data-del-acierto]"), null, `${s.id}: lo del acierto se adelanta`);
    }
    const baseTexto = propio ? null : H.figura().textContent;
    await alLlegar?.(s.id, H);

    /* Cada mala, en el orden de los datos: consecuencia, veredicto a los 380 ms, escalera C2. */
    const malas = p.opciones.filter((o) => !o.correcta);
    assert.equal(malas.length, 2, `${s.id}: dos malas`);
    for (const [n, o] of malas.entries()) {
      await tocar(H.op(o.id));
      const e = propio ? null : c4.consecuencia(I, o.id);
      if (!propio) {
        assert.deepEqual(H.estado(), e, `${s.id} · ${o.id}: la figura pinta su consecuencia`);
        assert.notEqual(H.figura().textContent, baseTexto, `${s.id} · ${o.id}: la figura se ve distinta`);
        assert.ok(H.op(o.id).classList.contains("tocada"), `${s.id} · ${o.id}: tocada`);
        assert.equal(H.mensaje(), null, `${s.id} · ${o.id}: el veredicto se adelanta`);
        assert.equal(H.falla(), null, `${s.id} · ${o.id}: la falla se adelanta`);
        await alElegir?.(s.id, o, H);
        await pasar();
        assert.equal(H.falla(), e.falla, `${s.id} · ${o.id}: la falla, en texto`);
      }
      assert.ok(H.op(o.id).classList.contains("mal"), `${s.id} · ${o.id}: la mala, en coral`);
      assert.equal(H.mensaje().dataset.mensaje, "error");
      const esperado = n === 0 ? s.pista : errorDelPaquete(s, o, p);
      assert.ok(esperado, `${s.id} · ${o.id}: sin texto en el paquete`);
      assert.equal(H.retro(), esperado, `${s.id} · error ${n + 1}`);
      assert.equal(w.document.activeElement, q("[data-c4-msg]"), `${s.id}: el foco va al mensaje`);
      assert.deepEqual(H.pies(), conFrase(p.error?.pie ?? p.pie), `${s.id}: el pie del error`);
      const correcta = p.opciones.find((x) => x.correcta);
      assert.equal(H.op(correcta.id).classList.contains("pista"), n === 1, `${s.id}: la correcta en blanco desde el 2.º error`);
      assert.ok(!c.textContent.includes("Iba aquí"), `${s.id}: nunca «Iba aquí» en Aprender`);
      assert.equal(H.seguir().getAttribute("aria-disabled"), "true");
      assert.equal(q("[data-del-acierto]"), null, `${s.id}: lo del acierto, con el error`);
      if (!propio) await alVeredicto?.(s.id, o, H);
    }

    /* La buena. */
    const buena = p.opciones.find((o) => o.correcta);
    await tocar(H.op(buena.id));
    if (!propio) {
      const e = c4.consecuencia(I, buena.id);
      assert.deepEqual(H.estado(), e, `${s.id} · ${buena.id}: la figura pinta su consecuencia`);
      assert.equal(e.falla, undefined);
      assert.equal(H.mensaje(), null, `${s.id}: el acierto se adelanta`);
      await alElegir?.(s.id, buena, H);
      await pasar();
      assert.equal(H.falla(), null);
      assert.equal(q("[data-cuadra]")?.textContent ?? null, e.cuadra ?? null, `${s.id}: lo que cuadra`);
    }
    assert.equal(H.mensaje().dataset.mensaje, "acierto");
    assert.equal(H.retro(), s.acierto.texto, `${s.id}: el acierto`);
    assert.equal(w.document.activeElement, q("[data-c4-msg]"), `${s.id}: el foco va al mensaje del acierto`);
    assert.ok(H.op(buena.id).classList.contains("bien"));
    assert.deepEqual(H.pies(), conFrase(p.acierto?.pie ?? p.pie), `${s.id}: el pie del acierto`);
    /* El «¿Por qué?», plegado detrás de su botón (aria-expanded), se abre y recibe el foco. */
    const por = q(".c4-porque");
    if (s.porque) {
      assert.equal(por.getAttribute("aria-expanded"), "false");
      assert.equal(q("[data-porque]"), null);
      await tocar(por);
      assert.equal(q("[data-porque]").textContent, s.porque, `${s.id}: el ¿Por qué?`);
      assert.equal(w.document.activeElement, q("[data-porque]"));
    } else assert.equal(por, null, `${s.id}: sin ¿Por qué?`);
    if (figuraDelAcierto && s.acierto.figura) assert.ok(lineaEnFiguras(s.acierto.figura.replace(/:/g, ""), textoDeFiguras(c, true)), `${s.id}: la figura del acierto («${s.acierto.figura}»)`);
    await alAcertar?.(s.id, H);
    assert.equal(H.seguir().getAttribute("aria-disabled"), "false");
    await tocar(H.seguir());
  }
  assert.deepEqual(visitadas, P.pantallas.map((x) => x.id));
}
