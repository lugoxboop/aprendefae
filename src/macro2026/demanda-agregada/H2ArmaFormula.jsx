/*
 * H2 · Arma la fórmula (da26-h2-arma-formula, Hacer, Medio, 25 × 3 FP × %).
 * Especificación de Gen §2 H2. La fórmula con huecos de borde punteado y una
 * bandeja de fichas (símbolo); mantener pulsada una ficha muestra su nombre
 * (y también al elegirla). Cada colocación se juzga al soltar: correcta, encaja
 * con ✓; errada, la ficha vuelve con SU retro y ese hueco ya no puntúa.
 * Al completar cada etapa la fórmula se enciende término a término sobre su
 * dibujo en miniatura (A2 para el consumo, A3 para la inversión, A6 para el
 * equilibrio). Puntaje = huecos correctos al primer intento / 10.
 * Arrastrar con Pointer Events, tocar-tocar (ficha y luego hueco) y teclado.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { BORDE, COMPONENTES, CORAL, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, movimientoReducido, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, barajar } from "../comun/azar.js";
import { CONSIGNAS, ETAPAS_H2, FICHAS_H2 } from "./textos.js";

export const ID = "da26-h2-arma-formula";

/** ¿El hueco acepta la ficha, dado lo ya puesto? (b·i conmutativo en la etapa 2). */
export function aceptaH2(etapa, huecoId, ficha, puestos) {
  const h = etapa.huecos.find((x) => x.id === huecoId);
  if (!h || !h.acepta.includes(ficha)) return false;
  if (h.par && puestos[h.par] === ficha) return false;
  return true;
}

export const prepararH2 = (rng = Math.random) => ETAPAS_H2.map((e) => ({ ...e, fichas: barajar(e.fichas, rng) }));

const CSS = `
.da26-h2-formula { display: flex; flex-direction: column; align-items: center; gap: 8px; font: 600 17px/1 var(--planck-font-mono, monospace); color: ${INK}; padding: 8px 0; }
.da26-h2-fila { display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: nowrap; white-space: nowrap; }
.da26-h2-frac { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; }
.da26-h2-frac > .da26-h2-num { border-bottom: 2px solid ${INK}; padding: 0 6px 4px; width: 100%; text-align: center; }
.da26-h2-hueco { min-width: 44px; min-height: 44px; padding: 0 6px; border-radius: 8px; border: 2px dashed ${INK_2}; background: transparent; color: ${INK}; font: 700 18px/1 var(--planck-font-mono, monospace); cursor: pointer; touch-action: manipulation; }
.da26-h2-hueco[data-lleno="1"] { border-style: solid; border-color: ${INK}; background: ${SUPERFICIE_2}; cursor: default; }
.da26-h2-hueco[data-blanco="1"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.da26-h2-hueco[data-estado="mal"] { border-color: ${CORAL}; }
.da26-h2-hueco[data-fallado="1"]:not([data-lleno="1"]) { border-color: ${INK_2}; }
.da26-h2-bandeja { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
.da26-h2-ficha { position: relative; min-height: 48px; border-radius: 10px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 20px/1 var(--planck-font-mono, monospace); cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.da26-h2-ficha[aria-pressed="true"] { border-color: ${INK}; box-shadow: 0 0 0 2px ${INK}; }
.da26-h2-ficha[data-estado="mal"] { border-color: ${CORAL}; }
.da26-h2-ficha.da26-arrastrando { cursor: grabbing; z-index: 3; box-shadow: 0 10px 24px rgba(0,0,0,.5); }
.da26-h2-ficha.da26-vuelve { transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.da26-h2-nombre { position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%); white-space: nowrap; font: 500 13px/1.2 var(--planck-font-sans, system-ui); background: ${INK}; color: #121418; padding: 4px 8px; border-radius: 6px; pointer-events: none; }
.da26-h2-mini [data-parte] { transition: opacity 280ms cubic-bezier(.3,.9,.4,1); }
@media (prefers-reduced-motion: reduce) { .da26-h2-ficha.da26-vuelve, .da26-h2-mini [data-parte] { transition: opacity 120ms linear; } }
`;

/* ─── Las tres fórmulas con sus huecos ─── */
function Formula({ etapa, Hueco }) {
  if (etapa.id === "consumo") {
    return (
      <div className="da26-h2-formula" data-formula="consumo">
        <div className="da26-h2-fila">C = <Hueco id="k1" /> +</div>
        <div className="da26-h2-fila"><Hueco id="k2" />( Y + <Hueco id="k3" /> − <Hueco id="k4" /> )</div>
      </div>
    );
  }
  if (etapa.id === "inversion") {
    return (
      <div className="da26-h2-formula" data-formula="inversion">
        <div className="da26-h2-fila">I = <Hueco id="k1" /> − <Hueco id="k2" /> · <Hueco id="k3" /></div>
      </div>
    );
  }
  return (
    <div className="da26-h2-formula" data-formula="equilibrio">
      <div className="da26-h2-fila">Y₀ =
        <span className="da26-h2-frac">
          <span className="da26-h2-num">1</span>
          <span className="da26-h2-fila">1 − <Hueco id="k1" />(1 − <Hueco id="k2" />)</span>
        </span>
      </div>
      <div className="da26-h2-fila">· ( <Hueco id="k3" /> − b·i )</div>
    </div>
  );
}

/* ─── Las miniaturas que se encienden al cerrar cada etapa ─── */
function Mini({ etapa, encendidos }) {
  const op = (k) => (encendidos > k ? 1 : 0.2);
  const C = COMPONENTES.C.color, I = COMPONENTES.I.color;
  if (etapa.id === "consumo") {
    const partes = [["C̄", "taza"], ["c", "la parte que se gasta"], ["TR", "gotero"], ["T", "desagüe"]];
    return (
      <svg className="da26-h2-mini" viewBox="0 0 260 96" width="100%" role="img" aria-label="Miniatura del vaso de la renta" data-mini="consumo">
        <path d="M60 20 L66 86 H118 L124 20" fill="none" stroke={INK_2} strokeWidth={2.5} />
        <rect x={67} y={44} width={50} height={42} fill="#9fb4d6" opacity={0.6} />
        <g data-parte="0" opacity={op(0)}><path d="M180 16h40l-5 22h-30z" fill={C} /><text x={200} y={54} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>C̄</text></g>
        <g data-parte="1" opacity={op(1)}><path d="M126 50 Q150 50 170 70" fill="none" stroke={INK} strokeWidth={2} /><path d="M172 66h40l-5 20h-30z" fill={C} /><text x={150} y={44} fontSize={13} fontWeight={700} fill={INK}>c</text></g>
        <g data-parte="2" opacity={op(2)}><path d="M110 2v10l-3 5h6l-3-5" fill="none" stroke={INK} strokeWidth={2} /><text x={118} y={14} fontSize={13} fontWeight={700} fill={INK}>TR</text></g>
        <g data-parte="3" opacity={op(3)}><path d="M80 86v6h-40" fill="none" stroke={INK} strokeWidth={3} /><text x={14} y={94} fontSize={13} fontWeight={700} fill={INK}>T</text></g>
        <title>{partes.map((p) => p[0]).join(", ")}</title>
      </svg>
    );
  }
  if (etapa.id === "inversion") {
    return (
      <svg className="da26-h2-mini" viewBox="0 0 260 96" width="100%" role="img" aria-label="Miniatura del columpio de la tasa" data-mini="inversion">
        <path d="M118 90 L130 66 L142 90 Z" fill={BORDE} />
        <g data-parte="2" opacity={op(2)}><circle cx={60} cy={56} r={12} fill="none" stroke={INK} strokeWidth={2} /><text x={60} y={61} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>i</text></g>
        <g data-parte="1" opacity={op(1)}><line x1={60} y1={70} x2={210} y2={62} stroke={INK} strokeWidth={4} /><text x={170} y={84} fontSize={13} fontWeight={700} fill={INK}>b</text></g>
        <g data-parte="0" opacity={op(0)}><rect x={190} y={30} width={40} height={28} fill={I} opacity={0.5} stroke={I} /><text x={238} y={50} fontSize={13} fontWeight={700} fill={INK}>Ī</text></g>
        <rect x={196} y={10} width={28} height={20} fill={I} />
      </svg>
    );
  }
  return (
    <svg className="da26-h2-mini" viewBox="0 0 260 96" width="100%" role="img" aria-label="Miniatura del eco del multiplicador" data-mini="equilibrio">
      <circle cx={30} cy={48} r={6} fill={COMPONENTES.G.color} />
      <g data-parte="0" opacity={op(0)}>{[22, 40, 58].map((r, k) => <path key={k} d={`M${30 + r * 0.62} ${48 - r * 0.78} A${r} ${r} 0 0 1 ${30 + r * 0.62} ${48 + r * 0.78}`} fill="none" stroke={INK} strokeWidth={4 - k} />)}<text x={70} y={14} fontSize={13} fontWeight={700} fill={INK}>c</text></g>
      <g data-parte="1" opacity={op(1)}><text x={96} y={52} fontSize={13} fontWeight={700} fill={INK}>(1 − t)</text></g>
      <g data-parte="2" opacity={op(2)}><rect x={200} y={14} width={34} height={74} fill={FONDO} stroke={BORDE} /><rect x={202} y={50} width={30} height={36} fill={COMPONENTES.G.color} /><text x={190} y={92} textAnchor="end" fontSize={13} fontWeight={700} fill={INK}>Ā</text></g>
    </svg>
  );
}

export default function H2ArmaFormula({ onTerminar, rng = null }) {
  const etapas = useMemo(() => prepararH2(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [k, setK] = useState(0);
  const e = etapas[k];
  const [puestos, setPuestos] = useState({});
  const [fallados, setFallados] = useState({});
  const [elegida, setElegida] = useState(null);
  const [nombre, setNombre] = useState(null);
  const [retro, setRetro] = useState(null);
  const [rojo, setRojo] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [encendidos, setEncendidos] = useState(0);
  const [arrastre, setArrastre] = useState(null);
  const [blanco, setBlanco] = useState(null);
  const huecos = useRef({});
  const pulsar = useRef(null);
  const completa = e.huecos.every((h) => puestos[h.id]);

  useEffect(() => {
    if (!completa) return undefined;
    if (movimientoReducido()) { setEncendidos(9); return undefined; }
    if (encendidos > e.huecos.length) return undefined;
    const t = setTimeout(() => setEncendidos((n) => n + 1), 280);
    return () => clearTimeout(t);
  }, [completa, encendidos, e.huecos.length]);

  const enBandeja = e.fichas.filter((f) => !Object.values(puestos).includes(f));

  const colocar = (fid, hid) => {
    if (!fid || puestos[hid] || completa) return;
    setElegida(null);
    setNombre(null);
    const yaJuzgado = detalle.some((d) => d.item === `${e.id}-${hid}`);
    if (aceptaH2(e, hid, fid, puestos)) {
      setPuestos((p) => ({ ...p, [hid]: fid }));
      setRetro(null);
      if (!yaJuzgado) setDetalle((d) => [...d, { item: `${e.id}-${hid}`, ok: true, subtemas: e.subtemas }]);
      return;
    }
    setRetro(e.retro[fid]);
    setRojo({ fid, hid });
    setTimeout(() => setRojo(null), 300);
    setFallados((f) => ({ ...f, [hid]: true }));
    if (!yaJuzgado) setDetalle((d) => [...d, { item: `${e.id}-${hid}`, ok: false, subtemas: e.subtemas }]);
  };

  const seguir = () => {
    if (k + 1 >= etapas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setK(k + 1);
    setPuestos({});
    setFallados({});
    setRetro(null);
    setEncendidos(0);
  };

  const huecoBajo = (x, y) => {
    for (const [id, el] of Object.entries(huecos.current)) {
      const r = el?.getBoundingClientRect();
      if (r && x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) return id;
    }
    return null;
  };

  const Hueco = ({ id }) => {
    const f = puestos[id];
    return (
      <button
        type="button"
        ref={(el) => { huecos.current[id] = el; }}
        className="da26-h2-hueco"
        data-hueco={id}
        data-lleno={f ? "1" : "0"}
        data-blanco={blanco === id ? "1" : "0"}
        data-fallado={fallados[id] ? "1" : "0"}
        data-estado={rojo?.hid === id ? "mal" : f ? "bien" : undefined}
        aria-label={f ? `Hueco con ${FICHAS_H2[f].simbolo}` : `Hueco vacío${elegida ? `: poner ${FICHAS_H2[elegida].simbolo}` : ""}`}
        onClick={() => colocar(elegida, id)}
      >
        {f ? <>{FICHAS_H2[f].simbolo}<span style={{ fontSize: 12, marginLeft: 2 }}>✓</span></> : " "}
      </button>
    );
  };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${k + 1} / ${etapas.length}`}>
      <style>{CSS}</style>
      <p className="da26-rotulo da26-mono" style={{ margin: "0 0 2px" }} data-etapa={e.id}>ETAPA {k + 1} · {e.nombre.toUpperCase()}</p>
      <div data-figura className="da26-entra" key={e.id}>
        <Formula etapa={e} Hueco={Hueco} />
        {completa && <Mini etapa={e} encendidos={encendidos} />}
      </div>
      {!completa && (
        <>
          <p className="da26-rotulo" style={{ minHeight: 18, margin: "4px 0 0", textAlign: "center" }} aria-live="polite" data-nombre-ficha>
            {elegida ? `${FICHAS_H2[elegida].simbolo}: ${FICHAS_H2[elegida].nombre}` : " "}
          </p>
          <div className="da26-h2-bandeja" role="group" aria-label="Bandeja de fichas">
            {enBandeja.map((f) => (
              <button
                key={f}
                type="button"
                className={`da26-h2-ficha${arrastre?.f === f ? " da26-arrastrando" : " da26-vuelve"}${rojo?.fid === f ? " da26-tiembla" : ""}`}
                data-ficha={f}
                data-estado={rojo?.fid === f ? "mal" : undefined}
                aria-pressed={elegida === f}
                aria-label={`${FICHAS_H2[f].simbolo}, ${FICHAS_H2[f].nombre}`}
                style={arrastre?.f === f ? { transform: `translate(${arrastre.dx}px, ${arrastre.dy}px)` } : undefined}
                onPointerDown={(ev) => {
                  if (ev.button !== 0) return;
                  ev.currentTarget.setPointerCapture?.(ev.pointerId);
                  setArrastre({ f, x0: ev.clientX, y0: ev.clientY, dx: 0, dy: 0, movio: false });
                  clearTimeout(pulsar.current);
                  pulsar.current = setTimeout(() => setNombre(f), 350);
                }}
                onPointerMove={(ev) => {
                  if (!arrastre || arrastre.f !== f || !ev.currentTarget.hasPointerCapture?.(ev.pointerId)) return;
                  const dx = ev.clientX - arrastre.x0, dy = ev.clientY - arrastre.y0;
                  const movio = arrastre.movio || Math.hypot(dx, dy) > 6;
                  if (movio) clearTimeout(pulsar.current);
                  setArrastre({ ...arrastre, dx, dy, movio });
                  setBlanco(movio ? huecoBajo(ev.clientX, ev.clientY) : null);
                }}
                onPointerUp={(ev) => {
                  clearTimeout(pulsar.current);
                  setNombre(null);
                  if (!arrastre) return;
                  const h = arrastre.movio ? huecoBajo(ev.clientX, ev.clientY) : null;
                  const toque = !arrastre.movio;
                  setArrastre(null);
                  setBlanco(null);
                  if (h) colocar(f, h);
                  else if (toque) setElegida((x) => (x === f ? null : f));
                }}
                onPointerCancel={() => { clearTimeout(pulsar.current); setNombre(null); setArrastre(null); setBlanco(null); }}
                onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setElegida((x) => (x === f ? null : f)); } }}
              >
                {FICHAS_H2[f].simbolo}
                {nombre === f && <span className="da26-h2-nombre" aria-hidden="true">{FICHAS_H2[f].nombre}</span>}
              </button>
            ))}
          </div>
        </>
      )}
      <Retro estado="mal" key={`r${detalle.length}-${retro}`}>{retro}</Retro>
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!completa} data-siguiente>{k + 1 >= etapas.length ? "Terminar" : "Siguiente etapa"}</Boton>
      </div>
    </MarcoHacer>
  );
}
