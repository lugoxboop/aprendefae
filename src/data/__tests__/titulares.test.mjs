import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FRASES, FRASES_DIA, FRANJAS, HERO_PHRASES, TOPE_CARACTERES, franjaDe, titularesDe,
} from "../heroPhrases.js";
import { elegirTitular } from "../../components/Hero.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANCO DE TITULARES
 *
 * Lo que estas pruebas guardan es la orden del 27 de octubre: que el titular
 * hable del estudiante y de la hora, y no de la página. Lo que se puede
 * comprobar a máquina es el tamaño, la cobertura de las 24 horas y que el
 * sorteo cumpla sus tres reglas; el tono lo mira una persona.
 * ═══════════════════════════════════════════════════════════════════════════
 */

test("★★★ ninguna frase desborda el titular a 320 px", () => {
  const largas = HERO_PHRASES.filter((f) => f.length > TOPE_CARACTERES);
  assert.deepEqual(largas, [], `pásalas a ${TOPE_CARACTERES} caracteres o menos; el tope no se sube`);
});

test("★★★ el banco es grande, variado y sin repetidas", () => {
  assert.ok(HERO_PHRASES.length >= 60, `hay ${HERO_PHRASES.length} frases; el banco tiene que ser grande`);
  assert.equal(new Set(HERO_PHRASES).size, HERO_PHRASES.length, "ninguna frase está dos veces");
  for (const franja of FRANJAS) {
    assert.ok((FRASES[franja.id] || []).length >= 8, `${franja.id} necesita al menos 8 frases propias`);
  }
});

test("★★★ las 24 horas tienen franja, y cada franja tiene de sobra para sortear", () => {
  for (let h = 0; h < 24; h++) {
    const f = franjaDe(h);
    assert.ok(FRANJAS.some((x) => x.id === f), `la hora ${h} cae en una franja`);
    assert.ok(titularesDe(new Date(2026, 9, 27, h)).length >= 20, `a las ${h} hay de dónde elegir`);
  }
  assert.equal(franjaDe(NaN), "manana", "una hora ilegible no deja la portada sin titular");
});

test("★★★ ninguna frase presume de la página", () => {
  /* El error que se corrigió: titulares cuyo sujeto éramos nosotros. */
  const presume = /\b(por fin|aquí sí|esto sí|la mejor|nunca más|a diferencia)\b/i;
  const malas = HERO_PHRASES.filter((f) => presume.test(f));
  assert.deepEqual(malas, [], "el sujeto es el estudiante o la hora, nunca AprendeFAE");
});

test("★★★ a cada hora sale una frase de su franja o de siempre, nunca de otra", () => {
  const ajena = (franja) =>
    Object.entries(FRASES)
      .filter(([k]) => k !== franja && k !== "siempre")
      .flatMap(([, v]) => v);
  for (const h of [2, 8, 15, 21]) {
    const franja = franjaDe(h);
    const lote = titularesDe(new Date(2026, 9, 27, h));
    for (const f of ajena(franja)) {
      assert.ok(!lote.includes(f), `a las ${h} no puede salir «${f}», que es de otra franja`);
    }
  }
});

test("★★★ el domingo añade lo suyo sin quitar lo de la hora", () => {
  const domingo = new Date(2026, 9, 25, 21); // domingo
  const lote = titularesDe(domingo);
  for (const f of FRASES_DIA[0]) assert.ok(lote.includes(f), `el domingo ofrece «${f}»`);
  for (const f of FRASES.noche) assert.ok(lote.includes(f), "y sigue ofreciendo las de la noche");
});

/* ── el sorteo ── */

function almacenFalso() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() };
}
function conAlmacen(fn) {
  const previo = [globalThis.sessionStorage, globalThis.localStorage];
  Object.defineProperty(globalThis, "sessionStorage", { value: almacenFalso(), configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: almacenFalso(), configurable: true });
  try { return fn(); } finally {
    Object.defineProperty(globalThis, "sessionStorage", { value: previo[0], configurable: true });
    Object.defineProperty(globalThis, "localStorage", { value: previo[1], configurable: true });
  }
}

test("★★★ dentro de la sesión el titular no cambia al recargar", () => {
  conAlmacen(() => {
    const ahora = new Date(2026, 9, 27, 8);
    const primera = elegirTitular(ahora, () => 0.37);
    /* Otro sorteo distinto: si no estuviera guardado, saldría otra. */
    assert.equal(elegirTitular(ahora, () => 0.91), primera);
  });
});

test("★★★ si cambió la franja, se vuelve a sortear", () => {
  conAlmacen(() => {
    const noche = elegirTitular(new Date(2026, 9, 27, 23, 50), () => 0);
    const madrugada = elegirTitular(new Date(2026, 9, 28, 0, 10), () => 0);
    assert.ok(FRASES.noche.includes(noche) || FRASES.siempre.includes(noche));
    assert.ok(!FRASES.noche.includes(madrugada), "a las 00:10 ya no se ofrece una de la noche anterior");
  });
});

test("★★★ no repite el titular de la visita anterior", () => {
  conAlmacen(() => {
    const ahora = new Date(2026, 9, 27, 8);
    const primera = elegirTitular(ahora, () => 0);
    sessionStorage.clear(); // otra visita, mismo navegador
    assert.notEqual(elegirTitular(ahora, () => 0), primera);
  });
});

test("★★★ sin almacenamiento la portada sigue teniendo titular", () => {
  const previo = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", {
    get() { throw new Error("bloqueado"); }, configurable: true,
  });
  try {
    const f = elegirTitular(new Date(2026, 9, 27, 8), () => 0.5);
    assert.ok(typeof f === "string" && f.length > 0, "devuelve una frase igual");
  } finally {
    if (previo) Object.defineProperty(globalThis, "sessionStorage", previo);
    else delete globalThis.sessionStorage;
  }
});
