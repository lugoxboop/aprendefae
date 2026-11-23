/*
 * A4 · El tanque del Estado (pf26-a4-tanque, Aprender).
 * Especificación de Gen, t3 §2 A4. Un tanque con un grifo (tributos), una
 * manguera (préstamo) y tres desagües (funcionamiento, inversión, servicio de
 * la deuda). Al lado, dos montañas de deuda.
 *   P1 deslizador «Tributos»: el nivel sube;
 *   P2–P4 abrir cada desagüe: el nivel baja y salen sus destinos;
 *   P5 con el tanque vacío se habilita la manguera con dos boquillas;
 *   P6 las montañas a escala: 840 y 354, suma 1.194 (d. 42);
 *   P7 la montaña (saldo) junto a la cubeta (servicio del año).
 * El nivel se conserva de una pantalla a otra.
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { fmtEntero } from "../comun/modelo-da.js";
import { Deslizador, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { colorRama } from "../comun/ramas.js";
import { IconoTrazo } from "../comun/iconos-pf.jsx";
import { Objeto } from "../comun/kit.jsx";
import { APRENDER, A4 } from "./textos.js";

export const ID = "pf26-a4-tanque";
const TEXTOS = APRENDER[ID];
const AGUA = colorRama("fiscal");
const DESAGUE_DE_PASO = [null, "funcionamiento", "inversion", "servicio"];
const ICONOS_DESTINO = { funcionamiento: ["nomina", "insumos", "servicios"], inversion: ["via", "escuela", "metro"], servicio: ["intereses"] };
/* Los destinos que tienen objeto en el kit (Gen): la vía y la escuela. */
const OBJETO_DESTINO = { via: "carretera", escuela: "escuela" };
const BAJA = 20;
const SUBE = 30;

const CSS = `
.pf26-a4-tanque { display: block; width: 100%; max-width: 280px; margin: 0 auto; }
.pf26-a4-agua { transform-box: fill-box; transform-origin: bottom; transition: transform 520ms cubic-bezier(.3,.9,.4,1); }
.pf26-a4-desagues { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, .8fr) minmax(0, 1fr); gap: 6px; margin-top: 8px; }
.pf26-a4-desague { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: 52px; padding: 4px 2px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; text-align: center; min-width: 0; overflow-wrap: anywhere; }
.pf26-a4-desague[data-meta="1"] { border-color: ${AGUA}; }
.pf26-a4-desague[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-a4-desague:disabled { opacity: .45; cursor: not-allowed; }
.pf26-a4-destinos { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; min-height: 56px; margin-top: 8px; }
.pf26-a4-destino { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 64px; font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pf26-a4-boquillas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
.pf26-a4-gota { animation: pf26-a4-gota 520ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes pf26-a4-gota { from { transform: translateY(-10px); opacity: 1; } to { transform: translateY(16px); opacity: 0; } }
.pf26-a4-montes { display: block; width: 100%; max-width: 300px; margin: 0 auto; }
.pf26-a4-monte { transform-box: fill-box; transform-origin: bottom; transition: transform 520ms cubic-bezier(.3,.9,.4,1); }
.pf26-a4-billon { display: block; text-align: center; margin-top: 6px; padding: 4px 10px; border-radius: 999px; border: 1px solid ${INK_2}; font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
@media (prefers-reduced-motion: reduce) { .pf26-a4-agua, .pf26-a4-monte { transition: none; } .pf26-a4-gota { animation: none; opacity: 0; } }
`;

function Tanque({ nivel, manguera, gota }) {
  const f = Math.max(0, Math.min(100, nivel)) / 100;
  return (
    <svg className="pf26-a4-tanque" viewBox="0 0 240 172" style={{ width: "100%", height: "auto" }} role="img" aria-label={`${A4.nivel}: ${Math.round(nivel)} %`} data-nivel={Math.round(nivel)}>
      {/* Grifo de tributos. */}
      <path d="M20 22h46v14" fill="none" stroke={INK_2} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="18" y="14" fill={INK} fontSize="13" fontWeight="600">{A4.tributos}</text>
      {/* Manguera del préstamo. */}
      <path d="M222 22h-46v14" fill="none" stroke={manguera ? INK : BORDE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={manguera ? "none" : "4 4"} />
      <text x="222" y="14" textAnchor="end" fill={manguera ? INK : INK_2} fontSize="13" fontWeight="600">{A4.prestamo}</text>
      {/* Tanque. */}
      <rect className="pf26-a4-agua" x="62" y="40" width="116" height="100" fill={AGUA} style={{ transform: `scaleY(${f})` }} />
      <rect x="60" y="38" width="120" height="104" rx="6" fill="none" stroke={INK} strokeWidth="3" />
      {/* Tres desagües. */}
      {[86, 120, 154].map((x) => <path key={x} d={`M${x} 142v18`} stroke={INK_2} strokeWidth="6" strokeLinecap="round" />)}
      {gota != null && <circle key={gota.n} className="pf26-a4-gota" cx={[86, 120, 154][gota.k]} cy="160" r="5" fill={AGUA} />}
    </svg>
  );
}

/** Dos montañas: alturas proporcionales a `valores`, con su cifra. */
function Montanas({ interna, externa, tope, cifras = true }) {
  const alto = (v) => (110 * v) / tope;
  const pico = (cx, v, id, nombre) => {
    const h = Math.max(6, alto(v));
    return (
      <g data-montana={id} data-valor={v}>
        <path className="pf26-a4-monte" d={`M${cx - 62} 130 L${cx} ${130 - h} L${cx + 62} 130 Z`} fill="none" stroke={AGUA} strokeWidth="3" strokeLinejoin="round" />
        {cifras && <text x={cx} y={Math.max(16, 124 - h)} textAnchor="middle" fill={INK} fontSize="15" fontWeight="700" className="da26-mono">{fmtEntero(v)}</text>}
        <text x={cx} y="151" textAnchor="middle" fill={INK} fontSize="15" fontWeight="600">{nombre}</text>
      </g>
    );
  };
  return (
    <svg className="pf26-a4-montes" viewBox="0 0 300 156" style={{ width: "100%", height: "auto" }} role="img" aria-label={`Deuda interna ${fmtEntero(interna)}, externa ${fmtEntero(externa)}`}>
      <path d="M4 130h292" stroke={BORDE} strokeWidth="2" />
      {pico(80, interna, "interna", A4.montanas.interna)}
      {pico(220, externa, "externa", A4.montanas.externa)}
    </svg>
  );
}

export default function A4Tanque({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [nivel, setNivel] = useState(60);
  const [abiertos, setAbiertos] = useState(new Set());
  const [ultimo, setUltimo] = useState(null);
  const [gota, setGota] = useState(null);
  const [prestado, setPrestado] = useState({ interna: 0, externa: 0 });
  const meta = DESAGUE_DE_PASO[paso];

  const abrir = (id, k) => {
    setNivel((x) => Math.max(0, x - BAJA));
    setAbiertos((s) => new Set(s).add(id));
    setUltimo(id);
    setGota((g) => ({ k, n: (g?.n ?? 0) + 1 }));
  };
  const prestar = (id) => {
    setNivel((x) => Math.min(100, x + SUBE));
    setPrestado((p) => ({ ...p, [id]: p[id] + 1 }));
  };

  let figura;
  let controles = null;
  let puedeSeguir = true;
  if (paso <= 4) {
    const vacio = nivel <= 0;
    const desagueDestinos = ultimo && A4.desagues.find((d) => d.id === ultimo);
    figura = (
      <>
        <Tanque nivel={nivel} manguera={paso === 4 && vacio} gota={gota} />
        {paso >= 1 && (
          <div className="pf26-a4-desagues" role="group" aria-label="Desagües">
            {A4.desagues.map((d, k) => (
              <button key={d.id} type="button" className="pf26-a4-desague" data-desague={d.id} data-meta={meta === d.id ? "1" : "0"}
                aria-pressed={ultimo === d.id} disabled={k + 1 > paso || vacio} aria-label={`${A4.abrir}: ${d.nombre}`} onClick={() => abrir(d.id, k)}>
                {d.nombre}
              </button>
            ))}
          </div>
        )}
        {paso >= 1 && paso <= 3 && (
          <div className="pf26-a4-destinos" aria-live="polite" data-destinos={ultimo ?? ""}>
            {desagueDestinos && desagueDestinos.destinos.map((n, j) => (
              <span key={`${ultimo}-${n}`} className="pf26-a4-destino da26-entra" data-destino-gasto={ICONOS_DESTINO[ultimo][j]}>
                {OBJETO_DESTINO[ICONOS_DESTINO[ultimo][j]]
                  ? <Objeto id={OBJETO_DESTINO[ICONOS_DESTINO[ultimo][j]]} alto={40} />
                  : <IconoTrazo id={ICONOS_DESTINO[ultimo][j]} size={28} color={INK} />}{n}
              </span>
            ))}
          </div>
        )}
        {paso === 4 && (
          <>
            <div className="pf26-a4-boquillas" role="group" aria-label={A4.prestamo}>
              {A4.boquillas.map((b) => (
                <button key={b.id} type="button" className="pf26-a4-desague" data-boquilla={b.id} disabled={!vacio && prestado.interna + prestado.externa === 0} onClick={() => prestar(b.id)}>
                  {b.nombre}
                </button>
              ))}
            </div>
            <Montanas interna={10 + 12 * prestado.interna} externa={10 + 12 * prestado.externa} tope={110} cifras={false} />
          </>
        )}
      </>
    );
    if (paso === 0) {
      controles = <Deslizador id="tributos" etiqueta={A4.tributos} min={0} max={100} paso={5} valor={nivel} onCambio={setNivel} formato={(x) => `${x} %`} extremos={["0 %", "100 %"]} colorRelleno={AGUA} />;
    }
    if (meta) puedeSeguir = abiertos.has(meta);
    if (paso === 4) puedeSeguir = prestado.interna + prestado.externa > 0;
  } else if (paso === 5) {
    figura = (
      <>
        <Montanas interna={A4.deuda.interna} externa={A4.deuda.externa} tope={A4.deuda.interna} />
        <p className="da26-mono" style={{ textAlign: "center", margin: "4px 0 0", fontSize: 16, fontWeight: 700 }} data-suma={A4.deuda.total}>
          {fmtEntero(A4.deuda.interna)} + {fmtEntero(A4.deuda.externa)} = {fmtEntero(A4.deuda.total)} {A4.unidad}
        </p>
        <span className="pf26-a4-billon" data-billon>{A4.billon}</span>
      </>
    );
  } else {
    figura = (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 8, alignItems: "end" }}>
        <div data-saldo>
          <svg viewBox="0 0 160 120" style={{ width: "100%", height: "auto" }} role="img" aria-label={A4.saldo}>
            <path d="M8 110 L80 14 L152 110 Z" fill="none" stroke={AGUA} strokeWidth="3" strokeLinejoin="round" />
            <text x="80" y="96" textAnchor="middle" fill={INK} fontSize="15" fontWeight="700" className="da26-mono">{fmtEntero(A4.deuda.total)}</text>
          </svg>
          <span className="da26-rotulo" style={{ display: "block", textAlign: "center", color: INK }}>{A4.saldo}</span>
        </div>
        <div data-cubeta>
          <svg viewBox="0 0 100 120" style={{ width: "100%", height: "auto" }} role="img" aria-label={A4.cubeta}>
            <path d="M50 0v26" stroke={INK_2} strokeWidth="6" strokeLinecap="round" />
            <circle className="pf26-a4-gota" cx="50" cy="40" r="5" fill={AGUA} />
            <path d="M22 62h56l-7 48H29Z" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d="M28 82h44" stroke={AGUA} strokeWidth="10" />
          </svg>
          <span className="da26-rotulo" style={{ display: "block", textAlign: "center", color: INK }}>{A4.cubeta}</span>
        </div>
      </div>
    );
  }

  return (
    <MarcoAprender
      id={ID}
      paso={paso}
      total={TEXTOS.length}
      texto={TEXTOS[paso]}
      figura={<><style>{CSS}</style>{figura}</>}
      controles={controles}
      puedeSeguir={puedeSeguir}
      onSiguiente={siguiente}
      onAnterior={anterior}
      onTerminar={() => onTerminar?.()}
    />
  );
}
