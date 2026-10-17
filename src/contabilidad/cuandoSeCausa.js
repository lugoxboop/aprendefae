import { ITEMS_ACT2, ERROR_POR_TIPO, HECHO, ERRORES_SEGUNDA_ACT2 } from "../data/contabilidadTema3Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 2 · ¿CUÁNDO SE CAUSA? — la evaluación.
 *
 * Un solo intento por ítem: el primer toque califica. La correcta es la
 * marca de tipo «hecho». En un error se muestra primero el texto del tipo de
 * marca tocada y después el acierto del ítem (Levi).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const correctaDe = (item) => item.marcas.find((m) => m.tipo === HECHO) ?? null;

export function evaluarAct2(item, marcaId) {
  const marca = item.marcas.find((m) => m.id === marcaId);
  if (!marca) throw new Error(`«${marcaId}» no es una marca de «${item.id}»`);
  const ok = marca.tipo === HECHO;
  return {
    ok,
    tipo: marca.tipo,
    correcta: correctaDe(item).id,
    textos: ok ? [item.acierto] : [ERROR_POR_TIPO[marca.tipo], item.acierto],
  };
}

/*
 * La segunda decisión: en los ítems que llevan `queda`, después de acertar el
 * día. Un toque, un intento.
 */
export const tieneSegunda = (item) => Boolean(item?.queda);

export function evaluarSegundaAct2(item, elegida) {
  const ok = elegida === item.queda;
  return { ok, correcta: item.queda, error: ok ? null : ERRORES_SEGUNDA_ACT2[item.queda][elegida] };
}

/*
 * Un ítem bien al primer toque vale 1; no hay reintento. Con segunda
 * decisión, `ok` es el de las dos: cuenta solo si las dos son correctas (Yujiro).
 */
export function puntuarAct2(respuestas, cuantos) {
  if (!cuantos) return 0;
  return (respuestas.filter((r) => r.ok).length / cuantos) * 100;
}

/* Si el dedo se movió más de esto entre bajar y subir, era scroll: no cuenta. */
export const UMBRAL_ARRASTRE = 10;
export const esArrastre = (dx, dy) => Math.hypot(dx, dy) > UMBRAL_ARRASTRE;

/* Para el panel docente: el hecho de un id, con su empresa delante. */
export const hechoDeItem = (id) => {
  const it = ITEMS_ACT2.find((x) => x.id === id);
  return it ? `${it.empresa} · ${it.hecho}` : null;
};
