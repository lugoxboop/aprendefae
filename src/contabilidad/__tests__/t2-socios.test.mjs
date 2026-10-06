import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 2 · EL PATRIMONIO ES LO QUE LA EMPRESA LES RECONOCE A LOS SOCIOS.
 *
 * Los cuatro textos finales de Levi (pendientes del PR #18), textuales, y
 * ninguna cadena que se vea en el Tema 2 dice «dueño».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { IZQUIERDA_O_DERECHA, ACTIVIDADES } = await import("../../data/contabilidadActividades.js");
const BALANCE = await import("../../data/contabilidadBalance.js");
const CUADRO = await import("../../data/contabilidadCuadro.js");
const DEBITA = await import("../../data/contabilidadDebitaOAcredita.js");
const CONSIGNAS = await import("../../data/contabilidadConsignas.js");
const B3 = await import("../../data/asiSeJuegaBloque3.js");
const { ACTIVO, PASIVO, PATRIMONIO } = await import("../../data/contabilidad.js");

test("★★★ los cuatro textos de Levi, textuales", () => {
  assert.equal(IZQUIERDA_O_DERECHA.errorC,
    "Acertaste todas las de activo y fallaste todas las de pasivo o patrimonio. Eso no es mala suerte. Es que estás leyendo el debe como si fuera siempre subir.");
  assert.equal(BALANCE.ERROR_POR_CRUCE[`${ACTIVO}>${PATRIMONIO}`].texto,
    "❌ Esto sí es una cosa que la empresa tiene. El patrimonio no son cosas: es lo que la empresa les reconoce a los socios.");
  assert.equal(BALANCE.RAZON_POR_CUENTA.Acciones,
    "✅ Patrimonio. Es lo que la empresa les reconoce a quienes compraron sus acciones.");
  assert.equal(BALANCE.SECCIONES.find((s) => s.id === PATRIMONIO).pie,
    "lo que la empresa les reconoce a los socios");
});

test("★★ los resaltados del patrimonio dicen «socios»", () => {
  const rotulos = Object.values(BALANCE.ERROR_POR_CRUCE)
    .flatMap((e) => e.resaltar).filter((r) => r.seccion === PATRIMONIO).map((r) => r.rotulo);
  assert.ok(rotulos.includes("de los socios"));
  assert.ok(rotulos.includes("a los socios"));
  assert.equal(BALANCE.ERROR_POR_CRUCE[`${PASIVO}>${PATRIMONIO}`].resaltar[1].rotulo, "a los socios");
});

/** Todas las cadenas de un módulo, recorriendo objetos y listas. */
const cadenasDe = (valor, vistas = new Set()) => {
  if (typeof valor === "string") return [valor];
  if (!valor || typeof valor !== "object" || vistas.has(valor)) return [];
  vistas.add(valor);
  return Object.values(valor).flatMap((v) => cadenasDe(v, vistas));
};

test("★★★ nada de lo que se ve en las actividades del Tema 2 dice «dueño»", () => {
  const ids = new Set(ACTIVIDADES.map((a) => a.id));
  const asi = Object.values(B3.ASI_SE_JUEGA_BLOQUE3).filter((v) => ids.has(v.actividadId));
  assert.equal(asi.length, 7, "no están las siete «Así se juega» del Tema 2");
  const textos = [
    ...cadenasDe(IZQUIERDA_O_DERECHA), ...cadenasDe({ ...BALANCE }), ...cadenasDe({ ...CUADRO }),
    ...cadenasDe({ ...DEBITA }), ...cadenasDe({ ...CONSIGNAS }), ...cadenasDe(asi),
  ];
  assert.ok(textos.length > 50);
  for (const t of textos) assert.doesNotMatch(t, /dueñ/iu, t);
});
