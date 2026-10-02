import { useEffect, useState } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FIGURA FACETADA DE LA PANTALLA DE RESUMEN.
 *
 * [PROVISIONAL — la especificación de Xeno no llegó con el paquete.] Está
 * hecha con las reglas de Levi y con el vocabulario «Facetado» que el sitio ya
 * tiene en los avatares (avatar/generador.js): polígono regular, facetas
 * triangulares que alternan opacidad 0,17 / 0,05, borde interior blanco. Si la
 * especificación dice otra cosa, se cambia aquí y en ningún otro sitio.
 *
 * Un solo tono: #B8C4D4 con blanco, y ningún otro color.
 *
 *   rica     diez lados, nodos, aristas blancas y UN pulso de brillo de 1,5 s
 *   sobria   seis lados, menos facetas, sin pulso
 *
 * Va en su propio hueco, a la derecha de las cifras: ningún texto queda
 * encima de ella ni de su destello.
 *
 * Es una capa de paso: entra, (pulsa), sale y se desmonta. No toma el puntero
 * —los botones de debajo funcionan desde el primer instante— y no existe para
 * el lector de pantalla. Con movimiento reducido aparece quieta, sin pulso,
 * 1,5 s, y se va.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TONO = "#B8C4D4";
const BLANCO = "#FFFFFF";

/* Tiempos, en ms. El pico del pulso es ENTRADA + PULSO / 2. */
export const ENTRADA = 450;
export const PULSO = 1500;
export const SALIDA = 400;
export const SOBRIA_QUIETA = 1000;
export const REDUCIDO_MS = 1500;
export const PICO_MS = ENTRADA + PULSO / 2;
export const DURACION = { rica: ENTRADA + PULSO + SALIDA, sobria: ENTRADA + SOBRIA_QUIETA + SALIDA };

/*
 * Radio del destello, en unidades del lienzo de 200. Se fijó midiendo en el
 * pico: con este radio todo el texto que queda encima conserva ≥4,5:1 (ver
 * las capturas del PR). Si se agranda, hay que volver a medir.
 */
export const RADIO_DESTELLO = 46;

/* Lado de la figura en pantalla. Va en su propio hueco, a la derecha de las cifras. */
export const TAMANO = 128;

const vertices = (n, r, giro = -Math.PI / 2) =>
  Array.from({ length: n }, (_, i) => {
    const a = giro + (i * 2 * Math.PI) / n;
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
  });
const puntos = (vs) => vs.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** La geometría de cada nivel. Pura, para poder probarla sin montar nada. */
export function geometria(nivel) {
  const rica = nivel === "rica";
  const n = rica ? 10 : 6;
  const fuera = vertices(n, 92);
  const dentro = vertices(n, rica ? 58 : 62);
  /* El marco: un cuadrilátero por lado, entre el polígono de fuera y el de dentro. */
  const facetas = fuera.map((v, i) => ({
    pts: puntos([v, fuera[(i + 1) % n], dentro[(i + 1) % n], dentro[i]]),
    op: rica ? (i % 2 ? 0.17 : 0.05) : (i % 2 ? 0.12 : 0.04),
  }));
  return {
    n,
    fuera: puntos(fuera),
    dentro: puntos(dentro),
    facetas,
    aristas: rica ? fuera.map((v, i) => ({ x1: v[0], y1: v[1], x2: dentro[i][0], y2: dentro[i][1] })) : [],
    nodos: rica ? fuera.map(([x, y]) => ({ x, y })) : [],
  };
}

const CSS = `
@keyframes fae-ff-entra { from { opacity: 0; transform: scale(.86) rotate(-14deg); } to { opacity: 1; transform: none; } }
@keyframes fae-ff-sale { to { opacity: 0; } }
@keyframes fae-ff-pulso { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
@keyframes fae-ff-aviva { 0%, 100% { opacity: .82; } 50% { opacity: 1; } }
.fae-ff { position: absolute; right: 0; top: 50%; width: ${TAMANO}px; height: ${TAMANO}px; margin-top: -${TAMANO / 2}px; pointer-events: none; z-index: 0; overflow: visible; }
.fae-ff-cuerpo { transform-origin: 100px 100px; transform-box: view-box; }
@media (prefers-reduced-motion: reduce) { .fae-ff, .fae-ff * { animation: none !important; } }
`;

const reducidoAhora = () => {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
};

export default function FiguraFacetada({ nivel }) {
  const [viva, setViva] = useState(Boolean(nivel));
  const [reducido] = useState(reducidoAhora);

  useEffect(() => {
    if (!nivel) return undefined;
    const t = setTimeout(() => setViva(false), reducido ? REDUCIDO_MS : DURACION[nivel]);
    return () => clearTimeout(t);
  }, [nivel, reducido]);

  if (!nivel || !viva) return null;

  const g = geometria(nivel);
  const rica = nivel === "rica";
  const total = DURACION[nivel];
  const anim = (nombre, ms, retraso = 0, relleno = "both") =>
    reducido ? undefined : `${nombre} ${ms}ms cubic-bezier(.3,.9,.4,1) ${retraso}ms ${relleno}`;

  return (
    <svg
      className="fae-ff"
      data-figura-facetada={nivel}
      data-reducido={reducido ? "si" : "no"}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      style={{ animation: anim("fae-ff-sale", SALIDA, total - SALIDA, "forwards") }}
    >
      <style>{CSS}</style>
      {rica && (
        <defs>
          <radialGradient id="fae-ff-destello" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLANCO} stopOpacity="0.55" />
            <stop offset="55%" stopColor={TONO} stopOpacity="0.18" />
            <stop offset="100%" stopColor={TONO} stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      <g className="fae-ff-cuerpo" style={{ animation: anim("fae-ff-entra", ENTRADA) }}>
        <g style={{ animation: rica ? anim("fae-ff-aviva", PULSO, ENTRADA) : undefined, opacity: rica && !reducido ? 0.82 : 1 }}>
          {g.facetas.map((f, i) => (
            <polygon key={i} data-faceta points={f.pts} fill={TONO} fillOpacity={f.op} />
          ))}
          <polygon points={g.fuera} fill="none" stroke={TONO} strokeOpacity={rica ? 0.85 : 0.6} strokeWidth={rica ? 1.8 : 1.4} strokeLinejoin="round" />
          <polygon points={g.dentro} fill="none" stroke={BLANCO} strokeOpacity={rica ? 0.38 : 0.22} strokeWidth="1.2" strokeLinejoin="round" />
          {g.aristas.map((a, i) => (
            <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={BLANCO} strokeOpacity="0.22" strokeWidth="1" />
          ))}
          {g.nodos.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.6" fill={TONO} />
          ))}
        </g>
        {rica && !reducido && (
          <circle
            data-destello
            cx="100"
            cy="100"
            r={RADIO_DESTELLO}
            fill="url(#fae-ff-destello)"
            style={{ opacity: 0, animation: anim("fae-ff-pulso", PULSO, ENTRADA, "none") }}
          />
        )}
      </g>
    </svg>
  );
}
