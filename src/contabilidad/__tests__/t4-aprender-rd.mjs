/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LO COMÚN A LAS PRUEBAS DE A2-A5 DEL REDISEÑO DE ENGANCHE. No es una
 * prueba: no termina en .test.mjs.
 *
 *   · porLugar(p)            lo que dice una pantalla de los datos, con el
 *                            nombre de lugar del paquete canon
 *   · abrir(P, id)           monta la pieza y llega a la pantalla `id`; las
 *                            preguntas del camino se aciertan con el plan de la
 *                            sonda (enganche_planes.json), como la guardia
 *   · jugar(m, P, id, hasta) juega el plan de una pantalla (con movimiento
 *                            reducido, sin sus esperas); con `hasta`, se para
 *                            antes del paso n
 *   · pruebasComunes(...)    lo que vale para las cuatro piezas: el texto
 *                            contra el canon, INFLESZ, el orden de la
 *                            pantalla, «Seguir» tras el acierto (D7), nada de
 *                            la devolución antes de responder (PH8-2), ningún
 *                            error que nombre la respuesta, B4 y Aprender sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const { w, h, montar, tocar, esperar, conColor, TEAL_AMBAR, CORAL, movimientoReducido, visible } = await import("./t4-dom.mjs");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");
const { pantallasDe, seccionDe, renglones, textoDe } = await import("./t4-rediseno-canon.mjs");

export const PLANES = JSON.parse(readFileSync(new URL("../../../scripts/t4/sonda-enganche/enganche_planes.json", import.meta.url), "utf8"));
export { leer, PAQUETES, RAIZ, pantallasDe, seccionDe, renglones, textoDe, inflesz };

/* Lo que la pantalla de los datos dice, por lugar del paquete (en el orden del paquete). */
export function porLugar(p) {
  const r = [];
  if (p.rotuloAccion) r.push(["Rótulo de la acción", p.rotuloAccion]);
  for (const t of p.antes ?? []) r.push(["Antes de la figura", t]);
  if (p.caso) r.push(["Caso (bajo el par, desde el principio)", p.caso]);
  if (p.rotuloPregunta) r.push(["Rótulo de la pregunta", p.rotuloPregunta]);
  for (const t of p.despues ?? []) r.push(["Después de la figura", t]);
  for (const x of p.despuesConAccion ?? []) r.push([`Después de la figura, con la acción${x.con ? ` (${x.con})` : ""}`, x.texto]);
  if (p.fin) r.push(["Tarjeta final", p.fin]);
  if ("acierto" in p) r.push(["Acierto (tras «Correcto.»)", p.acierto]);
  if (p.error) r.push(["Error (✗ y el texto)", p.error]);
  for (const [c, t] of Object.entries(p.errores ?? {})) r.push([`Error · ${c} (✗ y el texto)`, t]);
  if (p.cierre) r.push(["Frase de cierre", p.cierre]);
  if (p.alt) r.push(["Texto alternativo", p.alt]);
  if (p.siguiente) r.push(["Siguiente", p.siguiente]);
  r.push(["Pie", p.pie]);
  return r;
}
/* El lugar del paquete, sin la nota de cuándo aparece la frase de cierre («Frase de cierre (con el acierto…)»). */
export const lugarCanon = (lugar) => (lugar.startsWith("Frase de cierre") ? "Frase de cierre" : lugar);

export const q = (m, sel) => m.caja.querySelector(sel);
export const seguir = (m) => q(m, '[data-boton="seguir"]');
export const pantallaDe = (m) => q(m, "[data-pieza]").dataset.pantalla;

/* Juega el plan de la sonda de una pantalla (los toques; lo que es arrastrar lo mide Chromium). */
export async function jugar(m, P, id, hasta = Infinity) {
  const plan = PLANES[P.id]?.[id] ?? [];
  for (const [k, paso] of plan.entries()) {
    if (k >= hasta) break;
    if (paso.arrastra) continue;
    /* Un paso de solo espera (A1 · cheques: llega el cheque propio a los 1,4 s). */
    if (!paso.click) { await esperar(paso.espera ?? 0); continue; }
    const el = q(m, `[data-pieza] ${paso.click}`);
    assert.ok(el, `${P.id} · ${id}: el plan toca ${paso.click} y no está`);
    tocar(el);
    /*
     * Con movimiento reducido nada se anima: basta con dejar correr los
     * efectos. Las esperas de un segundo o más no son animación (la nota
     * siguiente de A5 llega a los 1,4 s): esas sí se esperan.
     */
    await esperar((paso.espera ?? 0) >= 1000 ? paso.espera : 0);
  }
}

/* Monta la pieza (con movimiento reducido, para que nada espere) y llega a la pantalla `id`. */
export async function abrir(P, id) {
  const antes = movimientoReducido(true);
  const k = P.pantallas.findIndex((p) => p.id === id);
  assert.ok(k >= 0, `${P.id}: no hay pantalla «${id}»`);
  const m = montar(h(PantallasT4, { pieza: P, rotulo: "T4 · APRENDER" }));
  for (let i = 0; i < k; i++) {
    if (P.pantallas[i].pregunta) await jugar(m, P, P.pantallas[i].id);
    const b = seguir(m);
    assert.ok(b, `${P.id} · ${P.pantallas[i].id}: no hay «Seguir»`);
    tocar(b);
  }
  assert.equal(pantallaDe(m), id);
  const desmontar = m.desmontar;
  return { ...m, desmontar: () => { desmontar(); movimientoReducido(antes); } };
}

/*
 * Las pruebas que valen para las cuatro piezas.
 *   P:        la pieza (los datos)
 *   canon:    el nombre del paquete canon
 *   datos:    el archivo de datos (para comprobar que nombra el canon)
 *   piezas:   los archivos de la pieza (componente y datos)
 *   noNombra: por pantalla con pregunta, lo que ningún error puede decir (la
 *             cifra o la cuenta correcta; Katsumi, «Para Baki» 11)
 *   antesDe:  el id de la pieza de Aprender que va justo antes
 *   preguntas: los ids de las pantallas con pregunta (Katsumi, decisión 2):
 *             si una deja de serlo en los datos, D7 se pone en rojo
 */
/*
 * D2 (Shibukawa; Yujiro): el objetivo de la pieza, una línea fija bajo el
 * título solo en la P0, con el texto del paquete. Va antes de la pantalla
 * (fuera de su zona), así que la P0 sigue abriendo con la figura (capa 1).
 */
export function pruebaObjetivo({ P, canon }) {
  const PAQ = leer(`${PAQUETES}${canon}`);
  test(`★★★ ${P.titulo} · D2: el objetivo del paquete, una línea fija bajo el título en la P0 y en ninguna otra`, async () => {
    const t = renglones(seccionDe(PAQ, "Objetivo de la pieza"));
    assert.deepEqual(t.map((x) => [x.lugar, x.texto]), [["Bajo el título, en la P0", P.objetivo]]);
    const m = await abrir(P, P.pantallas[0].id);
    try {
      const raiz = q(m, "[data-pieza]");
      const o = raiz.querySelector("[data-objetivo]");
      assert.equal(o?.textContent, P.objetivo);
      assert.equal(raiz.firstElementChild, o, "el objetivo no es lo primero bajo el título");
      assert.equal(o.closest(".t4r"), null, "el objetivo va dentro de la pantalla");
      assert.equal(q(m, "[data-pieza] .t4r").firstElementChild.matches("[data-figura]") || Boolean(q(m, "[data-pieza] .t4r").firstElementChild.querySelector(":scope > [data-figura]")), true, "la P0 ya no abre con la figura");
      if (P.pantallas[0].pregunta) await jugar(m, P, P.pantallas[0].id);
      assert.equal(q(m, "[data-objetivo]")?.textContent, P.objetivo, "el objetivo se va al responder la P0");
      tocar(seguir(m));
      assert.equal(pantallaDe(m), P.pantallas[1].id);
      assert.equal(q(m, "[data-objetivo]"), null, "el objetivo sigue después de la P0");
    } finally { m.desmontar(); }
  });
}

export function pruebasComunes({ P, canon, datos, piezas, noNombra = {}, antesDe, preguntas }) {
  pruebaObjetivo({ P, canon });
  const PAQ = leer(`${PAQUETES}${canon}`);
  const CANON_P = pantallasDe(PAQ);
  const nombre = P.titulo;

  test(`★★★ ${nombre}: el paquete del rediseño es el vigente y lo dice; los datos lo nombran`, () => {
    assert.match(PAQ, /\*\*Este archivo es la versión vigente de A\d\.\*\*/);
    assert.match(leer(datos), new RegExp(canon.replace(/\./g, "\\.")));
  });

  test(`★★★ ${nombre}: las ${CANON_P.length} pantallas, en el orden del paquete; id y título`, () => {
    assert.deepEqual(P.pantallas.map((p) => p.id), CANON_P.map((p) => p.id));
    assert.equal(PIEZAS_T4.find((x) => x.pieza.id === P.id).pieza, P);
  });

  for (const c of CANON_P) {
    test(`★★★ ${nombre} · ${c.id}: cada texto es el del paquete, letra por letra y en su lugar, ni uno más ni uno menos`, () => {
      const p = P.pantallas.find((x) => x.id === c.id);
      assert.deepEqual(porLugar(p), c.textos.map((x) => [lugarCanon(x.lugar), x.texto]));
    });
  }

  test(`★★ ${nombre}: INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y da lo que dice el paquete`, () => {
    for (const c of CANON_P) {
      for (const x of c.textos.filter((y) => y.medida)) {
        const r = inflesz(x.texto);
        if (r.aplica) {
          assert.ok(r.valor >= 65, `${c.id} · ${x.lugar}: ${r.valor}`);
          assert.equal(x.medida, r.valor.toFixed(1).replace(".", ","), `${c.id} · ${x.lugar}`);
        } else assert.equal(x.medida, "<10", `${c.id} · ${x.lugar}`);
      }
    }
  });

  test(`★★★ ${nombre}: cada pantalla, en el orden de Hanayama: antes → figura → después → lo que sale con la acción → frase de cierre → siguiente → «Seguir» → pie (tras jugar su plan)`, async () => {
    const m = await abrir(P, P.pantallas[0].id);
    try {
      for (const [k, p] of P.pantallas.entries()) {
        const zona = q(m, "[data-pieza]");
        assert.equal(zona.dataset.pantalla, p.id);
        await jugar(m, P, p.id);
        const orden = [...zona.querySelectorAll("[data-texto], [data-figura], [data-boton], [data-pie]")]
          .filter((e) => !e.parentElement.closest("[data-figura]"))
          .map((e) => (e.matches("[data-figura]") ? "FIGURA" : e.matches("[data-boton]") ? `BOTON:${e.dataset.boton}` : e.matches("[data-pie]") ? "PIE" : e.textContent));
        const ultima = k === P.pantallas.length - 1;
        const esperado = [...(p.antes ?? []), "FIGURA", ...(p.despues ?? []), ...(p.despuesConAccion ?? []).map((x) => x.texto),
          ...(p.cierre && !p.cierreEnCuerpo ? [p.cierre] : []), ...(p.siguiente ? [p.siguiente] : []), ...(ultima ? [] : ["BOTON:seguir"]), "PIE"];
        assert.deepEqual(orden, esperado, p.id);
        assert.equal(zona.querySelector("[data-figura] figcaption").textContent, p.alt, `${p.id}: el texto alternativo`);
        if (!ultima) tocar(seguir(m));
      }
    } finally { m.desmontar(); }
  });

  test(`★★★ ${nombre} · D7: «Seguir» no aparece sin el acierto en ninguna pantalla con pregunta (ni al llegar, ni tras cada error, ni a medio juego); en las demás, sí`, async () => {
    assert.deepEqual(P.pantallas.filter((p) => p.pregunta).map((p) => p.id), preguntas, "las pantallas con pregunta no son las de Katsumi (decisión 2)");
    for (const p of P.pantallas) {
      const m = await abrir(P, p.id);
      try {
        if (!p.pregunta) { if (p !== P.pantallas.at(-1)) assert.ok(seguir(m), `${p.id}: sin pregunta y sin «Seguir»`); continue; }
        assert.equal(seguir(m), null, `${p.id}: «Seguir» al llegar`);
        const plan = PLANES[P.id][p.id];
        assert.ok(plan?.length, `${p.id}: la pantalla pregunta y no tiene plan`);
        for (let n = 1; n < plan.length; n++) {
          await jugar(m, P, p.id, n);
          assert.equal(seguir(m), null, `${p.id}: «Seguir» tras el paso ${n} de ${plan.length} (${plan[n - 1].mide ?? plan[n - 1].click})`);
          m.desmontar();
          Object.assign(m, await abrir(P, p.id));
        }
        await jugar(m, P, p.id);
        if (p === P.pantallas.at(-1)) {
          /* La última no lleva «Seguir»: tras el acierto, la frase de cierre (capa 4). */
          assert.equal(seguir(m), null, `${p.id}: «Seguir» en la última pantalla`);
          assert.ok(q(m, "[data-cierre][data-visible]"), `${p.id}: tras el acierto no aparece la frase de cierre`);
          continue;
        }
        assert.ok(seguir(m), `${p.id}: tras el acierto no aparece «Seguir»`);
        tocar(seguir(m));
        assert.notEqual(pantallaDe(m), p.id, `${p.id}: «Seguir» no avanza`);
      } finally { m.desmontar(); }
    }
  });

  test(`★★★ ${nombre} · PH8-2: mientras se pregunta, nada de la devolución está en el DOM; cada error del plan da su veredicto y su texto, y el acierto el suyo`, async () => {
    for (const p of P.pantallas.filter((x) => x.pregunta && ("acierto" in x))) {
      const m = await abrir(P, p.id);
      try {
        const zona = q(m, "[data-pieza]");
        assert.equal(zona.querySelector("[data-mensaje]"), null, `${p.id}: devolución al llegar`);
        for (const t of [p.acierto, ...Object.values(p.errores ?? {})]) assert.ok(!zona.outerHTML.includes(t), `${p.id}: «${t}» en el DOM antes de responder`);
        const plan = PLANES[P.id][p.id];
        for (const [n, paso] of plan.entries()) {
          if (!paso.veredicto) continue;
          m.desmontar();
          Object.assign(m, await abrir(P, p.id));
          await jugar(m, P, p.id, n + 1);
          const ms = q(m, "[data-pieza]").querySelectorAll("[data-mensaje]");
          assert.equal(ms.length, 1, `${p.id} · ${paso.mide}: una sola devolución`);
          assert.equal(ms[0].dataset.mensaje, paso.veredicto, `${p.id} · ${paso.mide}`);
          const texto = ms[0].querySelector("[data-devolucion]").textContent;
          if (paso.veredicto === "acierto") assert.equal(texto, `Correcto.${p.acierto ? ` ${p.acierto}` : ""}`, p.id);
          else {
            assert.ok(texto.startsWith("Incorrecto. "), `${p.id}: el error sin «Incorrecto.» para el lector`);
            assert.ok(Object.values(p.errores).includes(texto.slice("Incorrecto. ".length)), `${p.id} · ${paso.mide}: «${texto}» no es un error del paquete`);
          }
        }
      } finally { m.desmontar(); }
    }
  });

  test(`★★★ ${nombre} · capa 1: la pieza abre con el objeto: en la P0 no hay texto antes de la figura, y lo que se dice va como rótulo o aparece debajo`, async () => {
    const p = P.pantallas[0];
    assert.deepEqual(p.antes ?? [], [], `${p.id}: texto antes de la figura`);
    const m = await abrir(P, p.id);
    try {
      const zona = q(m, "[data-pieza] .t4r");
      assert.ok(zona.firstElementChild.matches("[data-figura]") || zona.firstElementChild.querySelector(":scope > [data-figura]"), `${p.id}: la figura no es lo primero`);
      if (p.rotuloAccion) assert.equal(q(m, "[data-figura] [data-rotulo-accion]").textContent, p.rotuloAccion);
      /* Lo que aparece con la acción está reservado (no se ve) hasta la acción. */
      for (const x of p.despuesConAccion ?? []) {
        const r = q(m, `[data-con-accion="${x.con ?? "accion"}"]`);
        assert.ok(r && !r.hasAttribute("data-visible"), `${p.id}: «${x.texto}» se ve antes de la acción`);
        assert.equal(r.querySelector(".t4r-fantasma").textContent, x.texto, `${p.id}: no reserva su alto`);
      }
      await jugar(m, P, p.id);
      for (const x of p.despuesConAccion ?? []) assert.ok(q(m, `[data-con-accion="${x.con ?? "accion"}"][data-visible]`), `${p.id}: «${x.texto}» no aparece con la acción`);
    } finally { m.desmontar(); }
  });

  test(`★★★ ${nombre} · capa 4: no termina en una pantalla de lista de resumen; la frase de cierre aparece junto al modelo en su estado final`, async () => {
    assert.ok(P.pantallas.every((p) => !p.resumen && p.id !== "resumen"), "queda una pantalla de resumen");
    const p = P.pantallas.at(-1);
    assert.ok(p.cierre, `${p.id}: la última pantalla no tiene frase de cierre`);
    const m = await abrir(P, p.id);
    try {
      assert.equal(q(m, "[data-lista]"), null, "una lista de resumen en el DOM");
      if (p.cierreAl !== "llegar") assert.ok(!q(m, "[data-cierre][data-visible]") && !q(m, "[data-cierre].t4r-nueva"), `${p.id}: la frase de cierre se ve antes de que el modelo llegue a su estado final`);
      await jugar(m, P, p.id);
      const frase = q(m, "[data-cierre][data-visible] > [aria-live]") ?? q(m, "[data-figura] [data-cierre]");
      assert.ok(frase, `${p.id}: no aparece la frase de cierre`);
      assert.equal(visible(frase), p.cierre);
      /* Pegada al modelo: entre la figura (o su devolución) y la frase no hay otro texto. */
      const zona = q(m, "[data-pieza] .t4r");
      const hijos = [...zona.children];
      const iFig = hijos.findIndex((e) => e.matches("[data-figura]"));
      const iFrase = hijos.findIndex((e) => e.contains(frase));
      assert.ok(iFig >= 0 && iFrase >= iFig, `${p.id}: la frase no va debajo de la figura`);
      assert.ok(iFrase === iFig || hijos.slice(iFig + 1, iFrase).every((e) => e.matches("[data-mensaje], [data-aviso], .t4r-aviso") || !e.textContent.trim()), `${p.id}: hay otro texto entre la figura y la frase`);
      if (p.siguiente) assert.equal(visible(q(m, "[data-siguiente][data-visible] > [aria-live]") ?? q(m, "p[data-siguiente]")), p.siguiente);
    } finally { m.desmontar(); }
  });

  test(`★★★ ${nombre}: ningún error con reintento nombra la respuesta (Katsumi, «Para Baki» 11)`, () => {
    for (const [id, prohibido] of Object.entries(noNombra)) {
      const p = P.pantallas.find((x) => x.id === id);
      for (const [c, t] of Object.entries(p.errores)) for (const x of prohibido) assert.ok(!t.includes(x), `${id} · ${c}: «${t}» dice «${x}»`);
    }
  });

  test(`★★★ ${nombre} · B4: en cada acierto, teal y ámbar solo en los rótulos «Debe» y «Haber»; nada en coral`, async () => {
    for (const p of P.pantallas.filter((x) => x.pregunta)) {
      const m = await abrir(P, p.id);
      try {
        await jugar(m, P, p.id);
        const zona = q(m, "[data-pieza]");
        const tenidos = [...new Set(conColor(zona, TEAL_AMBAR).map((e) => e.textContent.trim()))];
        assert.ok(tenidos.every((t) => t === "Debe" || t === "Haber"), `${p.id}: en teal o ámbar: ${tenidos.join(", ")}`);
        assert.deepEqual(conColor(zona, CORAL).map((e) => e.outerHTML.slice(0, 80)), [], `${p.id}: coral en el acierto`);
      } finally { m.desmontar(); }
    }
  });

  test(`★★★ ${nombre}: sin piezas compartidas que pintan el acierto en teal (Opcion, ConstructorAsiento, Responder, EleccionT4)`, () => {
    for (const f of piezas) {
      const imports = leer(f).split("\n").filter((l) => /^import /.test(l)).join("\n");
      assert.doesNotMatch(imports, /\b(Opcion|Opciones|ConstructorAsiento|Responder|EleccionT4)\b/, f);
    }
  });

  test(`★★★ ${nombre}: fuera del catálogo de FP: Aprender en subjects.js (después de la pieza de Aprender anterior), ninguna migración la nombra, y ni la pieza ni sus datos llaman al motor`, () => {
    const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
    const ids = tema.actividades.map((a) => a.id);
    const a = tema.actividades.find((x) => x.id === P.id);
    assert.deepEqual(a.clasificacion, { tipo: APRENDER });
    assert.equal(a.nombre, P.titulo);
    const aprender = tema.actividades.filter((x) => x.clasificacion?.tipo === APRENDER).map((x) => x.id);
    assert.equal(aprender[aprender.indexOf(P.id) - 1], antesDe, "no va justo después de la pieza de Aprender anterior");
    assert.ok(ids.indexOf(P.id) > ids.indexOf(antesDe));
    const dir = new URL("supabase/migrations/", RAIZ);
    const migraciones = readdirSync(dir);
    assert.ok(migraciones.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
    assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(P.id)), []);
    for (const f of piezas) {
      assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(|onCompletar/, f);
    }
  });

  return { PAQ, CANON_P };
}

export { w, tocar, esperar, conColor, TEAL_AMBAR, CORAL, movimientoReducido };
