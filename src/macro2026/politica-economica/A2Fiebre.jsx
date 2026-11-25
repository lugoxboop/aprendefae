/*
 * A2 · La economía con fiebre (pe26-a2-fiebre, Aprender).
 * Especificación de Gen, t2 §2 A2: el flujo circular como un cuerpo con
 * termómetro; puntos de dinero que dan UNA vuelta al entrar (el botón «Ver
 * circular» la repite); P2 cinco virus pegados a su parte, cada uno abre su
 * ficha y sube un grado el termómetro; P3 tres íconos fuera del circuito; P4
 * todos los virus se alinean hacia el maletín «Política económica».
 *
 * Las cifras van rotuladas «dato de clase» (§0). El déficit fiscal de 9,4 % NO
 * se usa (§0: parece errado).
 */
import { useEffect, useRef, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2, GRIS } from "../comun/colores-da.js";
import { MarcoAprender, usePasos, useAncho, movimientoReducido, Boton } from "../comun/ui.jsx";
import { IconoProblema } from "../comun/iconos-pe.jsx";
import { Ilustrado, TermometroVidrio } from "../comun/ilustrados.jsx";
import { APRENDER, VIRUS, FUERA_DEL_CIRCUITO, CIRCUITO, A2, DATO_DE_CLASE, ESCENAS } from "./textos.js";

export const ID = "pe26-a2-fiebre";
const TEXTOS = APRENDER[ID];
const ALTO = 320;

/* Dónde va cada parte (fracción del ancho y del alto) y su virus. */
const NODO = {
  bienes: [0.5, 0.06], hogares: [0.13, 0.5], empresas: [0.87, 0.5],
  factores: [0.5, 0.94], estado: [0.5, 0.5], exterior: [0.87, 0.06],
};
/* Hogares, empresas y Estado con su dibujo (Gemini, 25-nov; familia 10). El
 * desplazamiento en px deja libre el sitio de los virus. */
const NODO_ILU = { hogares: ["casa-pais", -36], empresas: ["fabrica", -36], estado: ["edificio-gobierno", 36] };
const VIRUS_EN = {
  inflacion: [0.5, 0.19], desempleo: [0.13, 0.64], recesion: [0.5, 0.8],
  deficitFiscal: [0.5, 0.34], deficitExterno: [0.87, 0.19],
};

const CSS = `
.pe26-a2-mapa { position: relative; width: 100%; height: ${ALTO}px; }
.pe26-a2-mapa svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.pe26-a2-nodo { position: absolute; transform: translate(-50%, -50%); padding: 3px 8px; border-radius: 999px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; white-space: nowrap; }
.pe26-a2-virus { position: absolute; transform: translate(-50%, -50%); width: 48px; height: 48px; border-radius: 50%; border: 2px solid transparent; background: transparent; color: #0E1B2E; display: grid; place-items: center; cursor: pointer; touch-action: manipulation; padding: 0; }
.pe26-a2-virus > img { width: 44px; height: 44px; }
.pe26-a2-virus-sello { position: absolute; right: -4px; bottom: -4px; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 1.5px solid #0E1B2E; display: grid; place-items: center; }
.pe26-a2-virus[data-abierto="1"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pe26-a2-nodo-ilu { position: absolute; transform: translate(-50%, -50%); pointer-events: none; }
.pe26-a2-virus[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pe26-a2-fuera { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.pe26-a2-fuera button { min-height: 64px; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 12px; border: 2px dashed ${INK_2}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 12px/15px var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pe26-a2-fuera button[data-abierto="1"] { border-style: solid; border-color: ${INK}; }
.pe26-a2-ficha { margin-top: 10px; padding: 10px 12px; border-radius: 10px; border: 2px solid ${INK}; background: ${FONDO}; min-height: 84px; }
.pe26-a2-ficha h3 { margin: 0 0 2px; font: 700 15px/20px var(--planck-font-sans, system-ui, sans-serif); }
.pe26-a2-ficha p { margin: 0; font-size: 14px; line-height: 1.35; }
.pe26-a2-cifra { margin-top: 6px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.pe26-a2-fila { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; justify-items: center; }
.pe26-a2-fila > span { width: 46px; height: 46px; border-radius: 50%; border: 2px solid ${INK_2}; display: grid; place-items: center; background: ${SUPERFICIE_2}; }
.pe26-a2-maletin { display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: 6px; font: 700 15px/20px var(--planck-font-sans, system-ui, sans-serif); }
`;

/* El termómetro de vidrio ilustrado (Gemini; familia 10): sube un grado por
 * cada virus abierto. */
function Termometro({ grados, x }) {
  return <TermometroVidrio x={x} y={4} alto={96} nivel={Math.min(5, grados) / 5} data-termometro={grados} />;
}

function Ficha({ v }) {
  if (!v) return <div className="pe26-a2-ficha" aria-hidden="true" style={{ visibility: "hidden" }} />;
  return (
    <div className="pe26-a2-ficha da26-entra" role="status" aria-live="polite" data-ficha-virus={v.id} key={v.id}>
      <h3>{v.nombre}</h3>
      <p>{v.descripcion}</p>
      {v.cifra && (
        <div className="pe26-a2-cifra">
          <span className="da26-mono" style={{ fontSize: 16, fontWeight: 600 }}>{v.cifra}</span>
          <span className="da26-rotulo">{DATO_DE_CLASE}</span>
        </div>
      )}
    </div>
  );
}

export default function A2Fiebre({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [ref, ancho] = useAncho(264);
  const [vuelta, setVuelta] = useState(0);
  const [fase, setFase] = useState(1);
  const [abiertos, setAbiertos] = useState(new Set());
  const [actual, setActual] = useState(null);
  const marco = useRef(0);

  /* Una vuelta de los puntos al entrar y con «Ver circular»; luego quietos. */
  useEffect(() => {
    if (paso !== 0) return undefined;
    if (movimientoReducido()) { setFase(1); return undefined; }
    const ini = performance.now();
    const dur = 2200;
    const tic = (t) => {
      const f = Math.min(1, (t - ini) / dur);
      setFase(f);
      if (f < 1) marco.current = requestAnimationFrame(tic);
    };
    setFase(0);
    marco.current = requestAnimationFrame(tic);
    const respaldo = setTimeout(() => setFase(1), dur + 200);
    return () => { cancelAnimationFrame(marco.current); clearTimeout(respaldo); };
  }, [paso, vuelta]);

  const abrir = (v) => { setActual(v); setAbiertos((a) => new Set(a).add(v.id)); };
  const grados = VIRUS.filter((v) => abiertos.has(v.id)).length;
  const cx = ancho / 2, cy = ALTO / 2, rx = ancho * 0.37, ry = ALTO * 0.44;
  const puntos = [0, 0.25, 0.5, 0.75].map((d) => {
    const a = -Math.PI / 2 + (d + fase) * 2 * Math.PI;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

  const mapa = (
    <div className="pe26-a2-mapa" ref={ref} data-circuito>
      <svg viewBox={`0 0 ${ancho} ${ALTO}`} aria-hidden="true">
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK_2} strokeWidth="2.5" />
        {[0.12, 0.62].map((d) => {
          const a = -Math.PI / 2 + d * 2 * Math.PI;
          const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
          const ang = (Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180) / Math.PI;
          return <path key={d} d="M-6 -6 L4 0 L-6 6" transform={`translate(${x} ${y}) rotate(${ang})`} fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
        })}
        <path d={`M${cx} ${cy - 14}V${ALTO * 0.1}M${cx} ${cy + 14}V${ALTO * 0.9}`} stroke={BORDE} strokeWidth="2" strokeDasharray="4 5" />
        <path d={`M${ancho * 0.87} ${ALTO * 0.1}V${ALTO * 0.46}`} stroke={BORDE} strokeWidth="2" strokeDasharray="4 5" />
        {paso === 0 && puntos.map(([x, y], k) => <circle key={k} cx={x} cy={y} r="5" fill={INK} data-punto-dinero />)}
        {paso === 1 && <Termometro grados={grados} x={0} />}
      </svg>
      {CIRCUITO.filter((n) => NODO_ILU[n.id]).map((n) => (
        <Ilustrado key={`i-${n.id}`} id={NODO_ILU[n.id][0]} alto={34} className="pe26-a2-nodo-ilu" data-nodo-ilu={n.id}
          style={{ position: "absolute", left: `${NODO[n.id][0] * 100}%`, top: `calc(${NODO[n.id][1] * 100}% + ${NODO_ILU[n.id][1]}px)` }} />
      ))}
      {CIRCUITO.map((n) => (
        <span key={n.id} className="pe26-a2-nodo" data-nodo={n.id} style={{ left: `${NODO[n.id][0] * 100}%`, top: `${NODO[n.id][1] * 100}%` }}>{n.nombre}</span>
      ))}
      {paso === 1 && VIRUS.map((v) => (
        <button
          key={v.id}
          type="button"
          className="pe26-a2-virus da26-entra"
          data-virus={v.id}
          data-abierto={abiertos.has(v.id) ? "1" : "0"}
          aria-pressed={actual?.id === v.id}
          aria-label={v.nombre}
          style={{ left: `${VIRUS_EN[v.id][0] * 100}%`, top: `${VIRUS_EN[v.id][1] * 100}%` }}
          onClick={() => abrir(v)}
        >
          <Ilustrado id="virus" alto={44} />
          <span className="pe26-a2-virus-sello"><IconoProblema id={v.id} size={16} /></span>
        </button>
      ))}
    </div>
  );

  let figura;
  if (paso === 0) {
    figura = <>{mapa}<div className="da26-fila" style={{ marginTop: 8 }}><Boton onClick={() => setVuelta((n) => n + 1)} data-ver-circular>{A2.verCircular}</Boton></div></>;
  } else if (paso === 1) {
    figura = <>{mapa}<Ficha v={actual && VIRUS.some((v) => v.id === actual.id) ? actual : null} /></>;
  } else if (paso === 2) {
    figura = (
      <>
        <div className="pe26-a2-fuera" role="group" aria-label="Fuera del circuito">
          {FUERA_DEL_CIRCUITO.map((v) => (
            <button key={v.id} type="button" data-virus={v.id} data-abierto={abiertos.has(v.id) ? "1" : "0"} aria-pressed={actual?.id === v.id} onClick={() => abrir(v)}>
              <IconoProblema id={v.id} size={30} /><span>{v.nombre}</span>
            </button>
          ))}
        </div>
        <Ficha v={actual && FUERA_DEL_CIRCUITO.some((v) => v.id === actual.id) ? actual : null} />
      </>
    );
  } else {
    figura = (
      <div data-maletin>
        <div className="pe26-a2-fila">
          {[...VIRUS, ...FUERA_DEL_CIRCUITO].map((v, k) => (
            <span key={v.id} className="da26-entra" style={{ animationDelay: `${k * 60}ms` }} title={v.nombre}><IconoProblema id={v.id} size={24} /></span>
          ))}
        </div>
        <svg width="100%" height="34" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
          {[12.5, 37.5, 62.5, 87.5].map((x) => <path key={x} d={`M${x} 2L50 30`} stroke={GRIS} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />)}
        </svg>
        <div className="pe26-a2-maletin">
          <svg width="52" height="44" viewBox="0 0 52 44" aria-hidden="true" style={{ width: 52, height: 44 }}>
            <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round"><rect x="4" y="12" width="44" height="28" rx="4" fill={SUPERFICIE_2} /><path d="M18 12V6h16v6M26 20v12M20 26h12" /></g>
          </svg>
          <span>{A2.maletin}</span>
        </div>
      </div>
    );
  }

  return (
    <MarcoAprender escena={ESCENAS[ID]}
      id={ID}
      paso={paso}
      total={TEXTOS.length}
      texto={TEXTOS[paso]}
      figura={<><style>{CSS}</style>{figura}</>}
      onSiguiente={() => { setActual(null); siguiente(); }}
      onAnterior={() => { setActual(null); anterior(); }}
      onTerminar={() => onTerminar?.()}
    />
  );
}
