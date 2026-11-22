/*
 * H1 · Llena el carrito (da26-h1-llena-carrito, Hacer, Fácil, 10 FP × %).
 * Especificación de Gen §2 H1: 8 fichas sorteadas de 10 caen de una en una;
 * se arrastran (o tocar-tocar, o teclado) a la mano que hace la compra.
 * Acierto: la mano la agarra, el bloque cae al carrito (XN crece si exporta,
 * se encoge si importa). Error: la ficha rebota, borde coral 300 ms, la retro
 * de ESE destino, y un segundo intento que ya no suma.
 * Puntaje = aciertos al primer intento / 8.
 *
 * Decisión reversible (construccion-t1.md): si el segundo intento también
 * yerra, la ficha va sola a su mano correcta y se pasa a la siguiente.
 */
import { useMemo, useRef, useState } from "react";
import { COMPONENTES, ORDEN_COMPONENTES, CORAL, INK, FONDO } from "../comun/colores-da.js";
import { Carrito, IconoMano } from "../comun/carrito.jsx";
import { MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { sortear, azarDeLaPagina } from "../comun/azar.js";
import { BANCO_H1, CONSIGNAS, PARTIDA_H1 } from "./textos.js";

export const ID = "da26-h1-llena-carrito";
const UNIDAD = 30;

export function prepararH1(rng = Math.random) {
  return sortear(BANCO_H1, PARTIDA_H1, rng);
}

const CSS = `
.da26-h1-ficha { display: block; width: 100%; min-height: 64px; padding: 12px 14px; border-radius: 12px; border: 2px solid ${INK}; background: ${FONDO}; color: ${INK}; font: 600 16px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; position: relative; z-index: 2; }
.da26-h1-ficha[aria-pressed="true"] { box-shadow: 0 0 0 3px #b6bbc5; }
.da26-h1-ficha[data-estado="mal"] { border-color: ${CORAL}; }
.da26-h1-ficha.da26-arrastrando { cursor: grabbing; box-shadow: 0 10px 24px rgba(0,0,0,.5); }
.da26-h1-ficha.da26-vuelve { transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.da26-h1-manos { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0 8px; }
.da26-h1-mano { display: flex; align-items: center; gap: 8px; min-width: 120px; min-height: 64px; padding: 8px 10px; border-radius: 12px; border: 2px solid var(--mano); background: ${FONDO}; color: ${INK}; font: 600 14px/17px var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.da26-h1-mano[data-agarra="1"] { transform: scale(1.04); }
.da26-h1-mano[data-blanco="1"] { box-shadow: 0 0 0 3px var(--mano); }
.da26-h1-mano .da26-h1-letra { font: 700 15px/1 var(--planck-font-mono, monospace); display: inline-block; margin-bottom: 3px; min-width: 1.6em; padding: 2px 4px; border-radius: 4px; background: var(--mano); color: #121418; text-align: center; }
@media (prefers-reduced-motion: reduce) { .da26-h1-ficha.da26-vuelve, .da26-h1-mano { transition: opacity 120ms linear; } }
`;

export default function H1LlenaCarrito({ onTerminar, rng = null }) {
  const fichas = useMemo(() => prepararH1(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [intento, setIntento] = useState(1);
  const [detalle, setDetalle] = useState([]);
  const [carro, setCarro] = useState({ C: 0, I: 0, G: 0, XN: 0 });
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [agarra, setAgarra] = useState(null);
  const [elegida, setElegida] = useState(false);
  const [blanco, setBlanco] = useState(null);
  const [arrastre, setArrastre] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [rojo, setRojo] = useState(false);
  const manos = useRef({});
  const fichaRef = useRef(null);
  const ficha = fichas[n];

  const avanzar = (det, espera = 650) => {
    setTimeout(() => {
      setAgarra(null);
      setRetro(null);
      if (n + 1 >= fichas.length) {
        const bien = det.filter((d) => d.ok).length;
        onTerminar?.({ pct: Math.round((bien / fichas.length) * 100), detalle: det, duracionMs: tiempo() });
        return;
      }
      setN(n + 1);
      setIntento(1);
      setCerrando(false);
    }, espera);
  };

  const echar = (k) => {
    const unidades = ficha.correcta === "XN" ? (ficha.signo ?? 1) : 1;
    setCarro((c) => ({ ...c, [k]: c[k] + unidades * UNIDAD }));
  };

  const soltarEn = (k) => {
    if (!ficha || cerrando) return;
    setElegida(false);
    setBlanco(null);
    if (k === ficha.correcta) {
      const det = intento === 1 ? [...detalle, { item: ficha.id, ok: true, subtemas: ficha.subtemas }] : detalle;
      setDetalle(det);
      setRetro(null);
      setAgarra(k);
      echar(k);
      setCerrando(true);
      avanzar(det);
      return;
    }
    /* Error: rebota con borde coral 300 ms y la retro de ese destino. */
    setRetro(ficha.retro[k]);
    setMal((m) => m + 1);
    setRojo(true);
    setTimeout(() => setRojo(false), 300);
    if (intento === 1) {
      setDetalle((d) => [...d, { item: ficha.id, ok: false, subtemas: ficha.subtemas }]);
      setIntento(2);
    } else {
      /* Segundo error: la ficha va sola a su mano (decisión anotada). */
      const det = detalle;
      setAgarra(ficha.correcta);
      echar(ficha.correcta);
      setCerrando(true);
      avanzar(det, 2200);
    }
  };

  /* ─── Arrastre con Pointer Events ─── */
  const manoBajo = (x, y) => {
    for (const k of ORDEN_COMPONENTES) {
      const r = manos.current[k]?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return k;
    }
    return null;
  };
  const alBajar = (e) => {
    if (e.button !== 0 || cerrando) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setArrastre({ x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, movio: false });
  };
  const alMover = (e) => {
    if (!arrastre || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    const dx = e.clientX - arrastre.x0, dy = e.clientY - arrastre.y0;
    const movio = arrastre.movio || Math.hypot(dx, dy) > 6;
    setArrastre({ ...arrastre, dx, dy, movio });
    setBlanco(movio ? manoBajo(e.clientX, e.clientY) : null);
  };
  const alSoltar = (e) => {
    if (!arrastre) return;
    const k = arrastre.movio ? manoBajo(e.clientX, e.clientY) : null;
    const fueToque = !arrastre.movio;
    setArrastre(null);
    setBlanco(null);
    if (k) soltarEn(k);
    else if (fueToque) setElegida((v) => !v);
  };

  const estilo = arrastre
    ? { transform: `translate(${arrastre.dx}px, ${arrastre.dy}px)` }
    : { transform: "translate(0, 0)" };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${Math.min(n + 1, fichas.length)} / ${fichas.length}`}>
      <style>{CSS}</style>
      <div data-figura>
        {ficha && (
          <div className="da26-entra" key={ficha.id}>
            <button
              ref={fichaRef}
              type="button"
              key={`${ficha.id}-${mal}`}
              className={`da26-h1-ficha${arrastre ? " da26-arrastrando" : " da26-vuelve"}${retro && !cerrando ? " da26-tiembla" : ""}`}
              data-ficha={ficha.id}
              data-estado={rojo ? "mal" : undefined}
              aria-pressed={elegida}
              aria-label={`${ficha.ficha}. Toca la ficha y luego una mano, o arrástrala.`}
              style={{ ...estilo, opacity: cerrando ? 0.35 : 1 }}
              onPointerDown={alBajar}
              onPointerMove={alMover}
              onPointerUp={alSoltar}
              onPointerCancel={() => { setArrastre(null); setBlanco(null); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setElegida((v) => !v); } }}
            >
              {ficha.ficha}
            </button>
          </div>
        )}
        <div className="da26-h1-manos" role="group" aria-label="Las cuatro manos">
          {ORDEN_COMPONENTES.map((k) => (
            <button
              key={k}
              ref={(el) => { manos.current[k] = el; }}
              type="button"
              className="da26-h1-mano da26-marcable"
              data-mano={k}
              data-agarra={agarra === k ? "1" : "0"}
              data-blanco={blanco === k ? "1" : "0"}
              data-estado={agarra === k ? "bien" : undefined}
              style={{ "--mano": COMPONENTES[k].color }}
              onClick={() => soltarEn(k)}
              aria-label={`Llevar a ${COMPONENTES[k].nombre}`}
            >
              <IconoMano id={k} size={30} />
              <span><span className="da26-h1-letra">{COMPONENTES[k].letra}</span>{agarra === k ? " ✓" : ""}<br />{COMPONENTES[k].nombre}</span>
            </button>
          ))}
        </div>
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      <Carrito valores={carro} alto={170} escala={0.4} total={carro.C + carro.I + carro.G + carro.XN} />
    </MarcoHacer>
  );
}
