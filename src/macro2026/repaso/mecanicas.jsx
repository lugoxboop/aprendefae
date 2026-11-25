/*
 * MACRO 2026 · EL REPASO DIARIO — LAS SEIS MECÁNICAS.
 *
 * Cada una recibe la consulta `c` (plantillas.js) y avisa con
 * `onResolver({ ok, respuesta })` cuando el estudiante se compromete. Después
 * se queda quieta (`resuelto`) enseñando su retro. Reusan las figuras de las
 * piezas de cada tema (la gráfica de DA, el carrito, la cascada, la balanza,
 * la aguja del real y las ramas): el estudiante reconoce lo que ya jugó, que
 * es justo lo que un repaso quiere (práctica de recuperación con las mismas
 * pistas visuales).
 */
import { useEffect, useRef, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR, COMPONENTES } from "../comun/colores-da.js";
import { Boton, Deslizador, Retro, movimientoReducido } from "../comun/ui.jsx";
import GraficaDA from "../comun/GraficaDA.jsx";
import { Carrito } from "../comun/carrito.jsx";
import { MascotaRol } from "../comun/mascotas.jsx";
import { IconoRama } from "../comun/iconos-pe.jsx";
import { colorRama } from "../comun/ramas.js";
import { Balanza, Dial, CSS_PC } from "../politica-cambiaria/comun-pc.jsx";
import { Cascada, CSS_PM, MONETARIA } from "../politica-monetaria/comun-pm.jsx";
import { pesos, zonaReal } from "./plantillas.js";

export const CSS_MEC = `
.rd-cartel { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 12px; background: #f4ead2; color: #1b1d22; box-shadow: 0 6px 0 rgba(0,0,0,.25); }
.rd-cartel-etq { flex: none; font: 800 11px/1 var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .12em; padding: 5px 6px; border-radius: 6px; background: #1b1d22; color: #f4ead2; }
.rd-cartel-txt { font: 700 16px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.rd-opciones { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
.rd-op { display: flex; align-items: center; gap: 8px; min-height: 52px; padding: 8px 10px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 15px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; transition: transform 200ms cubic-bezier(.3,.9,.4,1); }
.rd-op:active { transform: scale(.97); }
.rd-op:disabled { cursor: default; }
.rd-op[data-estado="bien"] { border-color: ${INK}; background: ${INK}; color: ${TINTA_SOBRE_COLOR}; }
.rd-op[data-estado="mal"] { border-color: ${CORAL}; }
.rd-op[data-estado="revelada"] { border-color: ${INK}; border-style: dashed; }
.rd-op svg { flex: none; }
/* Bandejas */
.rd-expediente { position: relative; margin: 22px auto 0; max-width: 340px; padding: 14px 14px 12px; border-radius: 4px 14px 14px 14px; background: #f4ead2; color: #1b1d22; font: 700 17px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: center; box-shadow: 0 6px 0 rgba(0,0,0,.25); }
.rd-expediente::before { content: ""; position: absolute; top: -10px; left: 0; width: 38%; height: 12px; border-radius: 6px 6px 0 0; background: #e6d7b5; }
.rd-expediente small { display: block; margin-top: 6px; font: 600 12px/1 var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; color: #5a5446; }
.rd-bandejas { display: grid; gap: 8px; margin-top: 12px; }
.rd-bandejas[data-n="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.rd-bandejas[data-n="4"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.rd-bandeja { display: flex; flex-direction: column; gap: 6px; min-height: 96px; padding: 8px; border-radius: 14px; border: 2px dashed ${INK_2}; background: ${FONDO}; color: ${INK}; text-align: left; cursor: pointer; touch-action: manipulation; font: inherit; }
.rd-bandeja:disabled { cursor: default; border-style: solid; border-color: ${BORDE}; }
.rd-bandeja-cab { display: flex; align-items: center; gap: 6px; font: 700 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.rd-bandeja-det { font: 600 12px/1.2 var(--planck-font-mono, ui-monospace, monospace); color: ${INK_2}; }
.rd-chip { display: block; width: 100%; padding: 6px 8px; border-radius: 8px; border: 2px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 13px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; }
.rd-chip[data-estado="bien"] { border-color: ${INK}; }
.rd-chip[data-estado="mal"] { border-color: ${CORAL}; }
.rd-letra { flex: none; display: inline-grid; place-items: center; min-width: 30px; height: 26px; padding: 0 4px; border-radius: 6px; color: ${TINTA_SOBRE_COLOR}; font: 800 13px/1 var(--planck-font-mono, ui-monospace, monospace); }
/* Ordenar */
.rd-ranuras { display: grid; gap: 6px; margin-top: 10px; }
.rd-ranuras[data-estilo="escalera"] { display: flex; flex-direction: column-reverse; }
.rd-ranura { display: flex; align-items: stretch; gap: 6px; }
.rd-ranura-num { flex: none; display: grid; place-items: center; width: 30px; border-radius: 8px; background: ${BORDE}; color: ${INK}; font: 700 13px/1 var(--planck-font-mono, ui-monospace, monospace); }
.rd-ranuras[data-estilo="escalera"] .rd-ranura-num { width: auto; min-width: 86px; padding: 0 6px; font: 600 12px/1.1 var(--planck-font-sans, system-ui, sans-serif); }
.rd-hueco { flex: 1; min-width: 0; min-height: 48px; display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; border: 2px dashed ${BORDE}; background: ${FONDO}; color: ${INK_2}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: left; }
button.rd-hueco { cursor: pointer; touch-action: manipulation; }
.rd-hueco[data-lleno="1"] { border-style: solid; border-color: ${INK_2}; background: ${SUPERFICIE_2}; color: ${INK}; }
.rd-hueco[data-estado="bien"] { border-color: ${INK}; }
.rd-hueco[data-estado="mal"] { border-color: ${CORAL}; }
.rd-ranuras[data-estilo="domino"] .rd-hueco[data-lleno="1"] { transform-origin: top center; transition: transform 320ms cubic-bezier(.5,0,.75,0), opacity 320ms linear; }
.rd-ranuras[data-estilo="domino"] .rd-hueco[data-cae="1"] { transform: perspective(420px) rotateX(-62deg) translateY(4px); opacity: .6; }
.rd-ranuras[data-estilo="escalera"] .rd-ranura:nth-child(2) { padding-left: 8px; }
.rd-ranuras[data-estilo="escalera"] .rd-ranura:nth-child(3) { padding-left: 16px; }
.rd-ranuras[data-estilo="escalera"] .rd-ranura:nth-child(4) { padding-left: 24px; }
.rd-ranuras[data-estilo="escalera"] .rd-ranura:nth-child(5) { padding-left: 32px; }
.rd-ranuras[data-estilo="escalera"] .rd-ranura:nth-child(6) { padding-left: 40px; }
.rd-monton { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; padding: 10px; border-radius: 12px; background: rgba(8,16,30,.5); border: 1px solid ${BORDE}; min-height: 56px; }
.rd-monton-vacio { margin: auto; color: ${INK_2}; font-size: 13px; }
.rd-pieza { flex: 1 1 140px; min-height: 44px; padding: 8px 10px; border-radius: 10px; border: 2px solid ${INK_2}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; }
/* Pareja */
.rd-pareja { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
.rd-cliente { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px 8px; border-radius: 16px; border: 2px solid ${BORDE}; background: radial-gradient(circle at 50% 30%, rgba(108,195,213,.18), transparent 70%), ${FONDO}; color: ${INK}; cursor: pointer; touch-action: manipulation; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; }
.rd-cliente:disabled { cursor: default; }
.rd-cliente img { max-width: 100%; height: auto !important; }
.rd-cliente[data-estado="bien"] { border-color: ${INK}; box-shadow: 0 0 0 3px ${INK}; }
.rd-cliente[data-estado="mal"] { border-color: ${CORAL}; }
.rd-cliente[data-estado="revelada"] { border-color: ${INK}; border-style: dashed; }
.rd-tablero { display: flex; justify-content: center; align-items: baseline; gap: 8px; margin: 6px auto 0; padding: 8px 12px; border-radius: 10px; background: #08101e; border: 1px solid ${BORDE}; font: 700 18px/1.2 var(--planck-font-mono, ui-monospace, monospace); font-variant-numeric: tabular-nums; color: #ffc978; width: fit-content; max-width: 100%; }
.rd-tablero span { color: ${INK_2}; font-size: 13px; }
/* Factura */
.rd-factura { position: relative; margin: 6px auto 0; max-width: 320px; padding: 16px 16px 50px; background: #fbf7ee; color: #1b1d22; font: 500 14px/1.5 var(--planck-font-mono, ui-monospace, monospace); font-variant-numeric: tabular-nums; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), 95% 100%, 90% calc(100% - 8px), 85% 100%, 80% calc(100% - 8px), 75% 100%, 70% calc(100% - 8px), 65% 100%, 60% calc(100% - 8px), 55% 100%, 50% calc(100% - 8px), 45% 100%, 40% calc(100% - 8px), 35% 100%, 30% calc(100% - 8px), 25% 100%, 20% calc(100% - 8px), 15% 100%, 10% calc(100% - 8px), 5% 100%, 0 calc(100% - 8px)); }
.rd-factura h4 { margin: 0 0 8px; text-align: center; font: 800 13px/1.2 var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .14em; }
.rd-linea { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dashed #b9b2a2; padding: 3px 0; }
.rd-linea b { font-weight: 800; }
.rd-linea[data-total] { border-bottom: 0; border-top: 2px solid #1b1d22; margin-top: 4px; padding-top: 6px; font-size: 16px; }
.rd-sello { position: absolute; right: 18px; bottom: 16px; padding: 4px 10px; border: 3px solid #2a9d8f; border-radius: 8px; color: #1f7a6f; font: 800 16px/1 var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .1em; transform: rotate(-12deg); animation: rd-sello 380ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes rd-sello { from { opacity: 0; transform: rotate(-12deg) scale(1.8); } to { opacity: 1; transform: rotate(-12deg) scale(1); } }
.rd-billete { justify-content: center; font: 700 16px/1.2 var(--planck-font-mono, ui-monospace, monospace); font-variant-numeric: tabular-nums; }
.rd-leyenda { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 4px; font-size: 12px; line-height: 16px; color: ${INK_2}; }
.rd-col { transform-box: fill-box; transform-origin: bottom; animation: rd-crece 420ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes rd-crece { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@media (prefers-reduced-motion: reduce) { .rd-sello, .rd-col { animation: none; } .rd-ranuras[data-estilo="domino"] .rd-hueco[data-cae="1"] { transform: none; } }
${CSS_PC}
${CSS_PM}
`;

/* Pequeños íconos de movimiento de la curva (forma, no solo texto). */
function IconoMov({ id }) {
  const d = {
    sube: "M3 17 17 9M3 11 17 3M10 13V5M7 8l3-3 3 3",
    baja: "M3 11 17 3M3 17 17 9M10 6v8M7 11l3 3 3-3",
    empina: "M3 17 17 7M3 17 13 3",
    aplana: "M3 17 17 7M3 17 19 12",
  }[id];
  return <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

/* ═══════════════ 1 · CALCULAR (deslizador o aguja) ═══════════════ */

/** Los ecos del multiplicador: el gasto inicial, sus rondas y el total. */
function Ecos({ dG, ronda, maximo, elegido, correcta, revelar }) {
  const W = 320, H = 230, piso = 196, alto = 176;
  const y = (v) => piso - (v / maximo) * alto;
  const rondas = Array.from({ length: 7 }, (_, k) => dG * ronda ** k);
  const ancho = 26, x0 = 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", maxWidth: 440, margin: "0 auto" }} role="img"
      aria-label={revelar ? `Las rondas de gasto suman ${correcta}` : `Gasto inicial ${dG}; tu respuesta ${elegido}`} data-ecos>
      <line x1="0" x2={W} y1={piso} y2={piso} stroke={BORDE} strokeWidth="1.5" />
      {rondas.map((v, k) => {
        const x = x0 + k * (ancho + 5);
        const primera = k === 0;
        const visible = primera || revelar;
        return (
          <g key={k}>
            {visible
              ? <rect className="rd-col" style={{ animationDelay: `${primera ? 0 : k * 110}ms` }} x={x} y={y(v)} width={ancho} height={piso - y(v)} rx="3" fill={primera ? COMPONENTES.G.color : COMPONENTES.C.color} />
              : <rect x={x} y={y(v)} width={ancho} height={piso - y(v)} rx="3" fill="none" stroke={INK_2} strokeDasharray="3 4" />}
            <text x={x + ancho / 2} y={piso + 14} textAnchor="middle" fontSize="11" fill={INK_2}>{primera ? "G" : `${k}`}</text>
          </g>
        );
      })}
      <text x={x0} y={piso + 28} fontSize="11" fill={INK_2}>gasto inicial y rondas de consumo</text>
      {/* La columna del total */}
      <g transform="translate(246 0)">
        <rect x="0" y={piso - alto} width="68" height={alto} rx="6" fill="rgba(244,245,247,.04)" stroke={BORDE} />
        {revelar && <rect className="rd-col" style={{ animationDelay: "800ms" }} x="6" y={y(correcta)} width="56" height={piso - y(correcta)} rx="4" fill={INK} opacity=".9" />}
        {elegido != null && (
          <g data-marca-estudiante>
            <line x1="-6" x2="74" y1={y(elegido)} y2={y(elegido)} stroke={INK} strokeWidth="2.5" strokeDasharray={revelar ? "5 4" : undefined} />
            <text x="34" y={y(elegido) - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill={INK}>tú</text>
          </g>
        )}
        <text x="34" y={piso + 14} textAnchor="middle" fontSize="12" fontWeight="700" fill={INK}>ΔY total</text>
      </g>
    </svg>
  );
}

export function Calcular({ c, onResolver, resuelto }) {
  const [v, setV] = useState(c.inicio);
  const [tocado, setTocado] = useState(false);
  const fijar = (x) => { if (!resuelto) { setV(x); setTocado(true); } };
  const valor = v ?? 0;
  const ev = resuelto ? c.evaluar(valor) : null;
  let figura = null;
  if (c.figura === "ecos") {
    figura = <Ecos dG={c.datos.dG} ronda={c.datos.ronda} maximo={c.max} elegido={tocado ? valor : null} correcta={c.correcta} revelar={resuelto} />;
  } else if (c.figura === "cascada") {
    const { D, encaje } = c.datos;
    figura = (
      <div data-figura-cascada>
        <Cascada encaje={encaje} visibles={resuelto ? 2 : 1} etiqueta={`Depósito de ${pesos(D)} con encaje de ${encaje} %`} />
        <div className="rd-leyenda" style={{ justifyContent: "center" }}>
          <span><b style={{ color: MONETARIA }}>■</b> depósito {pesos(D)}</span>
          <span><b style={{ color: "#8e94a0" }}>■</b> encaje {encaje} %</span>
          {resuelto && <span>→ el préstamo pasa al siguiente vaso</span>}
        </div>
      </div>
    );
  } else if (c.figura === "dial") {
    figura = <Dial valor={v} onCambio={resuelto ? null : fijar} fantasma={resuelto && !ev.ok ? c.correcta : null} itcrTexto={resuelto ? zonaReal(c.correcta) : null} />;
  }
  return (
    <div data-mecanica="calcular">
      <div data-figura className="da26-entra">{figura}</div>
      {c.figura === "dial" ? (
        <div className="da26-fila" style={{ justifyContent: "center", marginTop: 8 }}>
          <Boton aria-label="Bajar medio punto" disabled={resuelto} onClick={() => fijar(Math.max(c.min, valor - c.paso))}>−</Boton>
          <span className="da26-mono" style={{ alignSelf: "center", minWidth: 90, textAlign: "center", fontWeight: 700 }} data-lectura>{v == null ? "toca la aguja" : c.formato(valor)}</span>
          <Boton aria-label="Subir medio punto" disabled={resuelto} onClick={() => fijar(Math.min(c.max, valor + c.paso))}>+</Boton>
        </div>
      ) : (
        <Deslizador id={c.id} etiqueta="Tu respuesta" min={c.min} max={c.max} paso={c.paso} valor={valor} onCambio={fijar} formato={c.formato} disabled={resuelto}
          extremos={[c.formato(c.min), c.formato(c.max)]} />
      )}
      {ev && <Retro estado={ev.ok ? "bien" : "mal"}>{ev.retro}</Retro>}
      {!resuelto && (
        <div className="da26-nav"><span /><Boton primario disabled={!tocado} onClick={() => { const r = c.evaluar(valor); onResolver({ ok: r.ok, respuesta: String(valor) }); }} data-responder>Responder</Boton></div>
      )}
    </div>
  );
}

/* ═══════════════ 2 · CURVA (¿gira o se desplaza?) ═══════════════ */

const RECTA_BASE = { arranque: 500, pendiente: 0.5 };
const RECTA_DE = {
  sube: { arranque: 820, pendiente: 0.5 },
  baja: { arranque: 220, pendiente: 0.5 },
  empina: { arranque: 500, pendiente: 0.74 },
  aplana: { arranque: 500, pendiente: 0.28 },
};

export function Curva({ c, onResolver, resuelto }) {
  const [elegida, setElegida] = useState(null);
  const lineas = [{ id: "antes", ...RECTA_BASE, estilo: "fantasma" }];
  if (elegida) lineas.push({ id: "tuya", ...RECTA_DE[elegida], estilo: "estudiante" });
  if (resuelto && elegida !== c.correcta) lineas.push({ id: "correcta", ...RECTA_DE[c.correcta], estilo: "punteada" });
  const elegir = (id) => {
    if (resuelto) return;
    setElegida(id);
    onResolver({ ok: id === c.correcta, respuesta: id });
  };
  const op = c.opciones.find((o) => o.id === elegida);
  return (
    <div data-mecanica="curva">
      <div className="rd-cartel" data-noticia><span className="rd-cartel-etq">NOTICIA</span><span className="rd-cartel-txt">{c.noticia}.</span></div>
      <div data-figura style={{ marginTop: 10 }}>
        <GraficaDA lineas={lineas} titulo="Curva de demanda agregada antes y después de la noticia" />
        <div className="rd-leyenda"><span>– – antes</span>{elegida && <span>━ tu curva</span>}{resuelto && elegida !== c.correcta && <span>· · · la correcta</span>}</div>
      </div>
      <div className="rd-opciones" role="group" aria-label="Movimientos de la curva">
        {c.opciones.map((o) => (
          <button key={o.id} type="button" className="rd-op" data-opcion={o.id} disabled={resuelto} onClick={() => elegir(o.id)}
            data-estado={!resuelto ? undefined : o.id === elegida ? (o.id === c.correcta ? "bien" : "mal") : o.id === c.correcta ? "revelada" : undefined}>
            <IconoMov id={o.id} /><span>{o.texto}</span>
          </button>
        ))}
      </div>
      {resuelto && op && <Retro estado={elegida === c.correcta ? "bien" : "mal"}>{op.retro}</Retro>}
    </div>
  );
}

/* ═══════════════ 3 · BANDEJAS (clasificar, una ficha a la vez) ═══════════════ */

function FiguraBandejas({ c, puestas }) {
  if (c.figura === "carrito") {
    const valores = { C: 0, I: 0, G: 0, XN: 0 };
    for (const f of c.fichas) if (puestas[f.id]) valores[puestas[f.id]] += puestas[f.id] === "XN" ? f.valor : Math.abs(f.valor);
    return <Carrito valores={valores} alto={170} escala={0.9} />;
  }
  if (c.figura === "medidor" || c.figura === "boveda") {
    const neto = c.fichas.reduce((s, f) => s + (puestas[f.id] === "expansiva" ? 1 : puestas[f.id] === "contraccionista" ? -1 : 0), 0);
    const ang = neto * 26;
    const etiqueta = c.figura === "medidor" ? "Demanda agregada" : "Dinero en la economía";
    return (
      <svg viewBox="0 0 300 150" style={{ width: "100%", height: "auto", maxWidth: 360, display: "block", margin: "0 auto" }} role="img" aria-label={`${etiqueta}: ${neto > 0 ? "sube" : neto < 0 ? "baja" : "igual"}`} data-medidor={neto}>
        <path d="M40 130a110 110 0 0 1 220 0" fill="none" stroke={BORDE} strokeWidth="18" />
        <path d="M40 130a110 110 0 0 1 110 -110" fill="none" stroke={INK_2} strokeWidth="18" opacity=".35" />
        <path d="M150 20a110 110 0 0 1 110 110" fill="none" stroke={c.figura === "boveda" ? MONETARIA : colorRama("fiscal")} strokeWidth="18" opacity=".8" />
        <text x="44" y="148" fontSize="13" fill={INK_2}>frena ↓</text>
        <text x="256" y="148" fontSize="13" fill={INK_2} textAnchor="end">empuja ↑</text>
        <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: "150px 130px", transition: movimientoReducido() ? "none" : "transform 420ms cubic-bezier(.3,.9,.4,1)" }}>
          <path d="M150 130L150 40" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        </g>
        <circle cx="150" cy="130" r="10" fill={INK} />
        <text x="150" y="16" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>{etiqueta}</text>
      </svg>
    );
  }
  return null;
}

function CabBandeja({ c, b }) {
  if (c.figura === "carrito") return <><span className="rd-letra" style={{ background: COMPONENTES[b.id].color }}>{COMPONENTES[b.id].letra}</span><span>{b.nombre}</span></>;
  if (c.figura === "ramas") return <><IconoRama id={b.id} size={26} /><span>{b.nombre}</span></>;
  return <span>{b.nombre}{b.detalle && <span className="rd-bandeja-det" style={{ display: "block", marginTop: 2 }}>{b.detalle}</span>}</span>;
}

export function Bandejas({ c, onResolver, resuelto }) {
  const [puestas, setPuestas] = useState({});
  const actual = c.fichas.find((f) => !puestas[f.id]) ?? null;
  const poner = (b) => { if (!resuelto && actual) setPuestas((p) => ({ ...p, [actual.id]: b })); };
  const quitar = (id) => { if (!resuelto) setPuestas((p) => { const q = { ...p }; delete q[id]; return q; }); };
  const listas = Object.keys(puestas).length === c.fichas.length;
  const malas = resuelto ? c.fichas.filter((f) => puestas[f.id] !== f.correcta) : [];
  return (
    <div data-mecanica="bandejas">
      <div data-figura><FiguraBandejas c={c} puestas={puestas} /></div>
      {actual && !resuelto ? (
        <div className="rd-expediente da26-entra" key={actual.id} data-ficha-actual={actual.id}>
          {actual.texto}
          <small>{c.fichas.indexOf(actual) + 1} DE {c.fichas.length} · TOCA SU BANDEJA</small>
        </div>
      ) : null}
      <div className="rd-bandejas" data-n={c.bandejas.length}>
        {c.bandejas.map((b) => (
          <div key={b.id} role="group" aria-label={b.nombre}>
            <button type="button" className="rd-bandeja" style={{ width: "100%" }} data-bandeja={b.id} disabled={resuelto || !actual} onClick={() => poner(b.id)}
              aria-label={actual ? `Poner «${actual.texto}» en ${b.nombre}` : b.nombre}>
              <span className="rd-bandeja-cab"><CabBandeja c={c} b={b} /></span>
            </button>
            <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
              {c.fichas.filter((f) => puestas[f.id] === b.id).map((f) => (
                <button key={f.id} type="button" className="rd-chip da26-entra" data-chip={f.id} disabled={resuelto} onClick={() => quitar(f.id)}
                  data-estado={resuelto ? (f.correcta === b.id ? "bien" : "mal") : undefined} aria-label={resuelto ? f.texto : `${f.texto}. Toca para devolverla.`}>
                  {resuelto ? (f.correcta === b.id ? "✓ " : "✗ ") : ""}{f.texto}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {resuelto && malas.map((f) => <Retro key={f.id} estado="mal" data-retro-ficha={f.id}>{f.retro(puestas[f.id])}</Retro>)}
      {resuelto && malas.length === 0 && <Retro estado="bien">{c.fichas[0].retro(c.fichas[0].correcta)}</Retro>}
      {!resuelto && (
        <div className="da26-nav"><span />
          <Boton primario disabled={!listas} data-responder
            onClick={() => onResolver({ ok: c.fichas.every((f) => puestas[f.id] === f.correcta), respuesta: c.fichas.map((f) => `${f.id}>${puestas[f.id]}`).join(",") })}>Revisar</Boton>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ 4 · ORDENAR (escalera o dominó) ═══════════════ */

export function Ordenar({ c, onResolver, resuelto }) {
  const n = c.fichas.length;
  const [ranuras, setRanuras] = useState(() => Array(n).fill(null));
  const [caidas, setCaidas] = useState(0);
  const relojes = useRef([]);
  useEffect(() => () => relojes.current.forEach(clearTimeout), []);
  const enMonton = c.revuelta.filter((f) => !ranuras.some((r) => r?.id === f.id));
  const poner = (f) => {
    if (resuelto) return;
    const k = ranuras.indexOf(null);
    if (k === -1) return;
    const r = [...ranuras]; r[k] = f; setRanuras(r);
  };
  const quitar = (k) => { if (!resuelto && ranuras[k]) { const r = [...ranuras]; r[k] = null; setRanuras(r); } };
  const llenas = ranuras.every(Boolean);
  const bien = (k) => ranuras[k]?.orden === k;
  const revisar = () => {
    const ok = ranuras.every((f, k) => f.orden === k);
    onResolver({ ok, respuesta: ranuras.map((f) => f.orden).join("-") });
    if (c.estilo === "domino") {
      const hasta = ok ? n : ranuras.findIndex((f, k) => f.orden !== k);
      if (movimientoReducido()) { setCaidas(hasta); return; }
      for (let k = 1; k <= hasta; k += 1) relojes.current.push(setTimeout(() => setCaidas(k), k * 140));
    }
  };
  const malas = resuelto ? ranuras.map((f, k) => (f.orden !== k ? f : null)).filter(Boolean) : [];
  return (
    <div data-mecanica="ordenar" data-estilo={c.estilo}>
      <div className="rd-ranuras" data-estilo={c.estilo} data-figura role="list" aria-label={c.estilo === "escalera" ? "El plan, de abajo arriba" : "La cadena, de arriba abajo"}>
        {ranuras.map((f, k) => (
          <div key={k} className="rd-ranura" role="listitem">
            <span className="rd-ranura-num" aria-hidden="true">{c.estilo === "escalera" ? c.rotulos[k] : `${k + 1}.º`}</span>
            {f ? (
              <button type="button" className="rd-hueco" data-lleno="1" data-ranura={k} disabled={resuelto} onClick={() => quitar(k)}
                data-estado={resuelto ? (bien(k) ? "bien" : "mal") : undefined} data-cae={c.estilo === "domino" && k < caidas ? "1" : "0"}
                aria-label={`${c.estilo === "escalera" ? c.rotulos[k] : `Lugar ${k + 1}`}: ${f.texto}${resuelto ? "" : ". Toca para devolverla."}`}>
                {resuelto && (bien(k) ? "✓ " : "✗ ")}{f.texto}
              </button>
            ) : (
              <span className="rd-hueco" data-ranura={k} data-lleno="0">{k === ranuras.indexOf(null) ? "toca una ficha de abajo" : ""}</span>
            )}
          </div>
        ))}
      </div>
      {!resuelto && (
        <div className="rd-monton" aria-label="Fichas por ubicar">
          {enMonton.length === 0 && <span className="rd-monton-vacio">Todas puestas. Toca una para devolverla.</span>}
          {enMonton.map((f) => (
            <button key={f.id} type="button" className="rd-pieza da26-entra" data-pieza={f.id} onClick={() => poner(f)}>{f.texto}</button>
          ))}
        </div>
      )}
      {malas.slice(0, 3).map((f) => <Retro key={f.id} estado="mal" data-retro-ficha={f.id}>«{f.texto}» · {f.retro}</Retro>)}
      {resuelto && malas.length === 0 && <Retro estado="bien">{c.estilo === "escalera" ? "Plan completo y coherente: del problema a la meta." : "La cadena cae completa, de la causa al efecto."}</Retro>}
      {!resuelto && (
        <div className="da26-nav"><span /><Boton primario disabled={!llenas} onClick={revisar} data-responder>{c.estilo === "domino" ? "Empujar" : "Revisar"}</Boton></div>
      )}
    </div>
  );
}

/* ═══════════════ 5 · PAREJA (¿a quién le conviene?) ═══════════════ */

export function Pareja({ c, onResolver, resuelto }) {
  const [tc, setTc] = useState(c.tc0);
  const [elegida, setElegida] = useState(null);
  useEffect(() => {
    setTc(c.tc0);
    if (movimientoReducido()) { setTc(c.tc1); return undefined; }
    const t = setTimeout(() => setTc(c.tc1), 700);
    return () => clearTimeout(t);
  }, [c]);
  const elegir = (id) => {
    if (resuelto) return;
    setElegida(id);
    onResolver({ ok: id === c.correcta, respuesta: id });
  };
  const op = c.opciones.find((o) => o.id === elegida);
  return (
    <div data-mecanica="pareja">
      <div className="rd-tablero" data-tablero><span>USD 1 =</span>{pesos(c.tc0)} <span>→</span> {pesos(c.tc1)}</div>
      <div data-figura style={{ marginTop: 4 }}><Balanza tc={tc} /></div>
      <div className="rd-pareja" role="group" aria-label="Los dos clientes">
        {c.opciones.map((o) => (
          <button key={o.id} type="button" className="rd-cliente" data-cliente={o.id} disabled={resuelto} onClick={() => elegir(o.id)}
            data-estado={!resuelto ? undefined : o.id === elegida ? (o.id === c.correcta ? "bien" : "mal") : o.id === c.correcta ? "revelada" : undefined}>
            <MascotaRol id={o.id} pose={o.pose} alto={128} rotulo={false} decorativa />
            <span>{o.nombre}{resuelto && o.id === c.correcta ? " ✓" : ""}</span>
          </button>
        ))}
      </div>
      {resuelto && op && <Retro estado={elegida === c.correcta ? "bien" : "mal"}>{op.retro}</Retro>}
    </div>
  );
}

/* ═══════════════ 6 · FACTURA (la única de opciones) ═══════════════ */

export function Factura({ c, onResolver, resuelto }) {
  const [elegida, setElegida] = useState(null);
  const elegir = (id) => {
    if (resuelto) return;
    setElegida(id);
    onResolver({ ok: id === c.correcta, respuesta: id });
  };
  const op = c.opciones.find((o) => o.id === elegida);
  return (
    <div data-mecanica="factura">
      <div className="rd-factura" data-figura>
        <h4>FACTURA DE VENTA</h4>
        <div className="rd-linea"><span>{c.producto[0].toUpperCase() + c.producto.slice(1)}</span><b>{pesos(c.base)}</b></div>
        <div className="rd-linea"><span>IVA 19 %</span><b data-iva>{resuelto ? pesos(c.iva) : "¿?"}</b></div>
        <div className="rd-linea" data-total><span>TOTAL</span><b data-total-valor>{resuelto ? pesos(c.total) : "¿?"}</b></div>
        {resuelto && <span className="rd-sello" aria-hidden="true">PAGADO</span>}
      </div>
      <div className="rd-opciones" role="group" aria-label="Cuánto paga">
        {c.opciones.map((o) => (
          <button key={o.id} type="button" className="rd-op rd-billete" data-opcion={o.id} disabled={resuelto} onClick={() => elegir(o.id)}
            data-estado={!resuelto ? undefined : o.id === elegida ? (o.id === c.correcta ? "bien" : "mal") : o.id === c.correcta ? "revelada" : undefined}>
            {o.texto}
          </button>
        ))}
      </div>
      {resuelto && op && <Retro estado={elegida === c.correcta ? "bien" : "mal"}>{op.retro}</Retro>}
    </div>
  );
}

export const MECANICAS = { calcular: Calcular, curva: Curva, bandejas: Bandejas, ordenar: Ordenar, pareja: Pareja, factura: Factura };

