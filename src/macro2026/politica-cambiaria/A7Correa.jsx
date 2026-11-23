/*
 * A7 · La correa del dólar (pc26-a7-correa, Aprender).
 * Especificación de Gen, t5 §2 A7. P1 el BanRep (panda autoridad, pose
 * «carpeta», 180 px: protagoniza) con sus dos metas; P2–P3 los dos baldes
 * (compra y vende dólares) que mueven el tanque de reservas y el tc; P4 el
 * perro y su dueño: la escena viajero-banco-central (perro y panda). P5–P8
 * las cuatro correas: el rastro del tc con el perro en la punta, una vez
 * por pantalla (sin bucle) y «Otra vez»; en P8, «Flotación sucia». P9 el
 * candado y las dos etiquetas de precio.
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { DOLAR } from "../comun/monedas.js";
import { fmtEntero } from "../comun/modelo-da.js";
import { Boton, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { EscenaMascotas, MascotaRol } from "../comun/mascotas.jsx";
import { Objeto } from "../comun/kit.jsx";
import { CAMBIARIA, CSS_PC, Correa } from "./comun-pc.jsx";
import { A7, APRENDER, REGIMENES } from "./textos.js";

export const ID = "pc26-a7-correa";
const TEXTOS = APRENDER[ID];
const REG_DE_PASO = { 4: "fijo", 5: "banda", 6: "gota", 7: "flexible" };

const CSS = `
.pc26-a7-baldes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.pc26-a7-balde { display: grid; justify-items: center; gap: 4px; min-height: 96px; padding: 8px 4px; border-radius: 14px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pc26-a7-balde[aria-pressed="true"] { border-color: ${CAMBIARIA}; }
.pc26-a7-balde:disabled { cursor: default; }
.pc26-a7-tanque { position: relative; width: 100%; height: 64px; border-radius: 10px; border: 2px solid ${INK}; background: ${FONDO}; overflow: hidden; }
.pc26-a7-agua { position: absolute; inset: 0; transform-origin: bottom; background: ${DOLAR}; opacity: .7; transition: transform 600ms cubic-bezier(.3,.9,.4,1); }
.pc26-a7-metas { display: grid; gap: 8px; align-content: center; }
.pc26-a7-meta { display: grid; justify-items: center; gap: 2px; padding: 6px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: center; }
@media (prefers-reduced-motion: reduce) { .pc26-a7-agua { transition: none; } }
`;

function Balde({ dibujo }) {
  return (
    <svg viewBox="0 0 60 50" width="60" height="50" aria-hidden="true">
      <path d="M8 12h44l-6 34H14Z" fill={SUPERFICIE_2} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M8 12c0-10 44-10 44 0" fill="none" stroke={INK_2} strokeWidth="2" />
      <text x="30" y="36" textAnchor="middle" fill={dibujo === "compra" ? DOLAR : CAMBIARIA} fontSize="18" fontWeight="800">{dibujo === "compra" ? "+" : "−"}</text>
    </svg>
  );
}
function Candado() {
  return (
    <svg viewBox="0 0 60 64" width="60" height="64" aria-hidden="true">
      <path d="M18 28v-8a12 12 0 0 1 24 0v8" fill="none" stroke={INK} strokeWidth="4" />
      <rect x="10" y="28" width="40" height="30" rx="6" fill={CAMBIARIA} stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}
function Etiquetas() {
  return (
    <svg viewBox="0 0 100 64" width="100" height="64" aria-hidden="true">
      {[[6, 8, "$1"], [48, 22, "$2"]].map(([x, y, t]) => (
        <g key={t}>
          <path d={`M${x} ${y}h36l10 14-10 14h-36Z`} fill={SUPERFICIE_2} stroke={INK} strokeWidth="2" />
          <text x={x + 18} y={y + 19} textAnchor="middle" fill={INK} fontSize="14" fontWeight="800">{t}</text>
        </g>
      ))}
    </svg>
  );
}

export default function A7Correa({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [baldes, setBaldes] = useState({ compra: 0, vende: 0 });
  const [ultimo, setUltimo] = useState(null);
  const [vez, setVez] = useState({});
  const [sucia, setSucia] = useState(false);
  const [antes, setAntes] = useState(paso);
  /* Cada correa se reproduce una vez al entrar a su pantalla. */
  if (antes !== paso) { setAntes(paso); if (REG_DE_PASO[paso]) setVez((v) => ({ ...v, [paso]: (v[paso] ?? 0) + 1 })); }

  const neto = baldes.compra - baldes.vende;
  const reservas = Math.max(0.15, Math.min(0.95, 0.5 + neto * 0.15));
  const tc = 4000 + neto * 100;
  const usar = (b) => { setBaldes((x) => ({ ...x, [b]: x[b] + 1 })); setUltimo(b); };

  let figura;
  if (paso === 0) {
    figura = (
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 8, alignItems: "center" }}>
        <MascotaRol id="autoridad-economica" pose="carpeta" alto={180} />
        <div className="pc26-a7-metas">
          <div className="pc26-a7-meta" data-meta="estabilidad"><Objeto id="balanza" alto={48} />{A7.estabilidad}</div>
          <div className="pc26-a7-meta" data-meta="equilibrio"><span className="da26-mono" style={{ fontSize: 18, fontWeight: 800 }}>BP = 0</span>{A7.equilibrio}</div>
        </div>
      </div>
    );
  } else if (paso === 1 || paso === 2) {
    figura = (
      <div>
        <div className="pc26-a7-baldes">
          {["compra", "vende"].map((b) => (
            <button key={b} type="button" className="pc26-a7-balde" aria-pressed={paso === 2 && ultimo === b} data-balde={b} disabled={paso !== 2} onClick={() => usar(b)}>
              <Balde dibujo={b} />{b === "compra" ? A7.compra : A7.vende}
            </button>
          ))}
        </div>
        {paso === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, marginTop: 8, alignItems: "center" }}>
            <div>
              <div className="pc26-a7-tanque" data-reservas={reservas.toFixed(2)} role="img" aria-label={A7.reservas}><div className="pc26-a7-agua" style={{ transform: `scaleY(${reservas})` }} /></div>
              <p className="da26-rotulo" style={{ margin: "2px 0 0", textAlign: "center", fontSize: 14, color: INK }}>{A7.reservas}</p>
            </div>
            <p className="pc26-contador" style={{ margin: 0 }} data-tc-a7={tc}><span>tc</span><b>${fmtEntero(tc)}{ultimo ? (ultimo === "compra" ? " ↑" : " ↓") : ""}</b></p>
          </div>
        )}
      </div>
    );
  } else if (paso === 3) {
    figura = (
      <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
        <EscenaMascotas id="viajero-banco-central" alto={180} perezosa={false} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          <span className="pc26-chip" data-rol-perro>{A7.perro}</span>
          <span className="pc26-chip" data-rol-dueno>{A7.dueno}</span>
        </div>
      </div>
    );
  } else if (REG_DE_PASO[paso]) {
    const reg = REG_DE_PASO[paso];
    figura = (
      <div>
        <p className="pc26-chip" style={{ margin: "0 0 6px", borderColor: CAMBIARIA, borderWidth: 2 }} data-regimen={reg}>{REGIMENES.find((r) => r.id === reg).nombre}</p>
        <Correa regimen={reg} vez={vez[paso] ?? 0} sucia={reg === "flexible" && sucia} />
      </div>
    );
  } else {
    figura = (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
        <div className="pc26-a7-meta" data-instrumento="controles"><Candado />{A7.controles}</div>
        <div className="pc26-a7-meta" data-instrumento="diferenciales"><Etiquetas />{A7.diferenciales}</div>
      </div>
    );
  }

  let controles = null;
  if (REG_DE_PASO[paso]) {
    controles = (
      <div className="da26-fila">
        <Boton onClick={() => setVez((v) => ({ ...v, [paso]: (v[paso] ?? 0) + 1 }))} data-otra-vez>{A7.otraVez}</Boton>
        {paso === 7 && <Boton onClick={() => { setSucia(true); setVez((v) => ({ ...v, [paso]: (v[paso] ?? 0) + 1 })); }} aria-pressed={sucia} data-sucia>{A7.sucia}</Boton>}
      </div>
    );
  }

  const puede = paso === 2 ? baldes.compra > 0 && baldes.vende > 0 : paso === 7 ? sucia : true;
  return (
    <MarcoAprender id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PC}{CSS}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
