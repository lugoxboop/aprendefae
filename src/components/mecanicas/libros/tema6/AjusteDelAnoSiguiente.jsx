import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { AJUSTE_T6_ACT2 } from "../../../../data/contabilidadT6Act2.js";
import { CIFRA_MONO, RELLENO_AMBAR, RAYADO_TEAL, CURVA } from "./TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a2 · «EL AJUSTE DEL AÑO SIGUIENTE» (lote 24, D9, P2 de Mai).
 *
 * Una regla horizontal con el cero marcado. A la izquierda del cero, rayado
 * teal, lo que la provisión se quedó corta en marzo (es saldo del DEBE, como
 * en el tanque de T6 A3); a la derecha, en ámbar, lo que pide el análisis.
 * Encima, el arco del salto, de un extremo al otro: el ajuste. Así se ve que
 * el ajuste sale de debajo del cero, no del saldo anterior.
 *
 * Escala: x(v) = (v + desde) / ancho, con `desde` y lo de la derecha
 * redondeados hacia arriba a 40.000. Con El Torito da la de Mai: de −40.000 a
 * 160.000, el cero en el 20 %. Con La Ceiba (D8), de −80.000 a 120.000.
 *
 * Entra solo tras la pregunta 3, la última (R10: el tramo derecho es el saldo
 * que se pregunta). Los tramos entran con opacidad y scaleX desde el cero en
 * 240 ms; con movimiento reducido, al instante. Lo que entra es lo correcto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = AJUSTE_T6_ACT2;
const PASO = 40000;
const arriba = (v) => Math.ceil(v / PASO) * PASO;
export const escalaAjuste = (corta, pide) => {
  const desde = arriba(corta);
  return { desde, ancho: desde + arriba(pide) };
};
const PALABRA = { fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: "#A8B6C8" };
const CIFRA = { ...CIFRA_MONO, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: FAE.text };

/* Las cifras salen de los pasos: la pregunta 2 (lo que falta), el asiento 2 (el ajuste) y la pregunta 3 (el saldo que pide el análisis). */
export function cifrasDelAjuste(partes) {
  const preguntas = partes.filter((p) => p.tipo === "pregunta");
  const asientos = partes.filter((p) => p.tipo !== "pregunta");
  /* Una tanda que no es la de los cinco pasos (las pruebas montan pasos sueltos) no tiene de dónde sacarlas. */
  if (preguntas.length < 3 || !asientos.length) return null;
  const ajuste = asientos.at(-1).asiento[0].valor;
  return { corta: preguntas[1].correcta, pide: preguntas[2].correcta, ajuste };
}

export default function AjusteDelAnoSiguiente({ partes, hechas, reducido }) {
  const cifras = cifrasDelAjuste(partes);
  /* Solo tras la pregunta 3, la última (R10). */
  if (!cifras || hechas < partes.length || partes.at(-1).tipo !== "pregunta") return null;
  const { corta, pide, ajuste } = cifras;
  const { desde, ancho } = escalaAjuste(corta, pide);
  const x = (v) => Math.round(((v + desde) / ancho) * 1000) / 10;
  const x0 = x(-corta);
  const cero = x(0);
  const x1 = x(pide);
  const entra = (origen) => ({ transformOrigin: origen, animation: reducido ? "none" : `b5-ajuste 240ms ${CURVA} both` });
  return (
    <div data-ajuste-ano-siguiente role="img" aria-label={T.lector(pesos(ajuste), pesos(corta), pesos(pide))}
      style={{ margin: "14px 0 0", padding: "10px 12px 8px", borderRadius: "12px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" }}>
      <style>{"@keyframes b5-ajuste { from { opacity: 0; transform: scaleX(0); } to { opacity: 1; transform: none; } }"}</style>
      <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text }}>{T.titulo}</p>
      <div aria-hidden="true" style={{ position: "relative", height: "124px" }}>
        {/* El salto: un arco de un extremo al otro, con su palabra y su cifra encima. */}
        <div data-salto style={{ position: "absolute", top: 0, left: `${x0}%`, width: `${x1 - x0}%`, textAlign: "center", ...entra("50% 100%") }}>
          <span style={PALABRA}>{T.ajuste} </span><span data-cifra-ajuste style={CIFRA}>{pesos(ajuste)}</span>
        </div>
        <svg data-arco style={{ position: "absolute", top: "18px", left: `${x0}%`, width: `${x1 - x0}%`, height: "24px", overflow: "visible" }} viewBox="0 0 100 24" preserveAspectRatio="none">
          <path d="M0 24 C 10 0, 90 0, 100 24" fill="none" stroke={FAE.text} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* La regla: los dos tramos, el cero y la línea base. */}
        <span data-tramo-ajuste="corta" style={{ position: "absolute", top: "44px", height: "22px", left: `${x0}%`, width: `${cero - x0}%`, boxSizing: "border-box",
          backgroundImage: RAYADO_TEAL, borderBottom: `2px solid ${FAE.teal}`, ...entra("100% 50%") }} />
        <span data-tramo-ajuste="pide" style={{ position: "absolute", top: "44px", height: "22px", left: `${cero}%`, width: `${x1 - cero}%`, boxSizing: "border-box",
          background: RELLENO_AMBAR, borderTop: `2px solid ${FAE.ambar}`, ...entra("0 50%") }} />
        <span style={{ position: "absolute", left: 0, right: 0, top: "66px", borderTop: "1px solid #B8C4D4" }} />
        <span data-cero style={{ position: "absolute", left: `${cero}%`, top: "38px", height: "34px", borderLeft: `2px solid ${FAE.text}`, transform: "translateX(-1px)" }} />
        <span style={{ position: "absolute", left: `${cero}%`, top: "72px", transform: "translateX(-50%)", ...CIFRA, fontWeight: 400 }}>0</span>
        {/* Bajo la regla, su palabra y su cifra: la de la izquierda contra el borde izquierdo, la de la derecha contra el derecho. */}
        <div style={{ position: "absolute", top: "90px", left: 0, whiteSpace: "nowrap" }}>
          <p style={{ margin: 0, ...PALABRA }}>{T.corta}</p>
          <p data-cifra-corta style={{ margin: 0, ...CIFRA }}>{pesos(corta)}</p>
        </div>
        <div style={{ position: "absolute", top: "90px", right: 0, whiteSpace: "nowrap", textAlign: "right" }}>
          <p style={{ margin: 0, ...PALABRA }}>{T.pide}</p>
          <p data-cifra-pide style={{ margin: 0, ...CIFRA }}>{pesos(pide)}</p>
        </div>
      </div>
    </div>
  );
}
