/*
 * A5 · La balanza fiscal (pf26-a5-balanza, Aprender).
 * Especificación de Gen, t3 §2 A5. Un sube y baja: las fichas de medidas van
 * a un plato y un globo «DA» sube o baja con la inclinación. La cifra Y₀ sale
 * del modelo de T1 (comun/modelo-da.js); las transferencias entran
 * multiplicadas por c, como en T1.
 *   P1 la ecuación con las tres perillas fiscales: G, TR, t;
 *   P2 plato «Expansiva»: más G, más TR, menos t;
 *   P3 plato «Contraccionista»: menos G, menos TR, más t;
 *   P4 deslizadores t (lupa «multiplicador») y G (globo);
 *   P5 «Reforma para recaudar» cae en el plato contraccionista;
 *   P6 cuatro personajes y su impacto.
 */
import { useEffect, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { BASE, modelo, produccion, multiplicador, fmtEntero, fmtDecimal } from "../comun/modelo-da.js";
import { Deslizador, MarcoAprender, usePasos, useAnimado } from "../comun/ui.jsx";
import { useArrastre } from "../comun/arrastre.js";
import { colorRama } from "../comun/ramas.js";
import { MascotaRol } from "../comun/mascotas.jsx";
import { Objeto } from "../comun/kit.jsx";
import { APRENDER, A5 } from "./textos.js";

export const ID = "pf26-a5-balanza";
const TEXTOS = APRENDER[ID];
const FISCAL = colorRama("fiscal");
const Y_BASE = produccion(BASE);
/* Empresa y región con los objetos del kit (Gen): la fábrica y la carretera. */
const OBJETO_IMPACTO = { empresa: "fabrica", region: "carretera" };
/* La pose de cada mascota en P6: la familia con el mercado (capacidad de compra), el
 * inversionista con el ladrillo; nunca la tableta, cuya línea que sube regala «atraer». */
const POSE_IMPACTO = { familia: "mercado", inversionista: "ladrillo" };
const TODAS = [...A5.fichasExpansivas, ...A5.fichasContraccionistas];
const GRADOS_POR_FICHA = 7;
const ANCHO = 260;
const PIVOTE = { x: 130, y: 122 };
const BRAZO = 74;

/** Los cambios al modelo de T1 que suman las fichas puestas. */
export function cambiosDe(fichas) {
  const c = { G: BASE.G, TR: BASE.TR, t: BASE.t };
  for (const f of fichas) {
    c.G += f.dG ?? 0;
    c.TR += f.dTR ?? 0;
    c.t = Math.round((c.t + (f.dt ?? 0)) * 100) / 100;
  }
  return c;
}

export const CSS_A5 = `
.pf26-a5-ec { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 3px; padding: 12px 6px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 16px/1 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); }
.pf26-a5-tok { padding: 4px 1px; color: ${INK_2}; }
.pf26-a5-perilla { min-width: 44px; min-height: 44px; padding: 0 8px; border-radius: 999px; border: 2px solid ${FISCAL}; background: ${FISCAL}; color: ${TINTA_SOBRE_COLOR}; font: 700 16px/1 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); cursor: pointer; touch-action: manipulation; }
.pf26-a5-perilla[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK}; }
.pf26-a5-nombre { display: block; min-height: 22px; margin-top: 8px; text-align: center; font: 600 14px/1.4 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-a5-balanza { position: relative; width: ${ANCHO}px; height: 226px; margin: 0 auto; }
.pf26-a5-balanza svg { position: absolute; inset: 0; width: ${ANCHO}px !important; height: 226px; }
.pf26-a5-viga { transform-origin: ${PIVOTE.x}px ${PIVOTE.y}px; transition: transform 520ms cubic-bezier(.3,.9,.4,1); }
.pf26-a5-globo { transition: transform 520ms cubic-bezier(.3,.9,.4,1); }
.pf26-a5-plato { position: absolute; top: 0; left: 0; width: 112px; min-height: 48px; padding: 4px 6px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; transition: transform 520ms cubic-bezier(.3,.9,.4,1); }
.pf26-a5-plato[data-activo="1"] { border-color: ${FISCAL}; }
.pf26-a5-plato[data-blanco="1"] { box-shadow: 0 0 0 3px ${FISCAL}; }
.pf26-a5-plato:disabled { cursor: default; color: ${INK_2}; }
.pf26-a5-fichas { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; min-height: 48px; margin-top: 8px; }
.pf26-a5-ficha { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; min-height: 44px; padding: 4px 14px; border-radius: 999px; border: 2px solid ${FISCAL}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 14px/1.15 var(--planck-font-sans, system-ui, sans-serif); cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.pf26-a5-ficha[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK}; }
.pf26-a5-ficha[data-arrastrando="1"] { cursor: grabbing; }
.pf26-a5-ficha small { font: 500 12px/1.1 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); color: ${INK_2}; }
.pf26-a5-puestas { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 10px; min-height: 18px; font: 500 12px/1.4 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.pf26-a5-cae { animation: pf26-a5-cae 520ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes pf26-a5-cae { from { transform: translateY(-30px); opacity: 0; } to { transform: none; opacity: 1; } }
.pf26-a5-lupa { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 76px; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-a5-lupa svg { transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pf26-a5-gente { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.pf26-a5-quien { min-height: 44px; padding: 6px 8px; border-radius: 999px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-a5-quien[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-a5-escenario { min-height: 290px; margin-top: 10px; }
.pf26-a5-impacto { margin: 0; max-width: 300px; text-align: center; font: 500 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); }
@media (prefers-reduced-motion: reduce) { .pf26-a5-viga, .pf26-a5-globo, .pf26-a5-plato, .pf26-a5-lupa svg { transition: none; } .pf26-a5-cae { animation: none; } }
`;

function Globo({ Y, dy }) {
  const y = useAnimado(Y);
  return (
    <g className="pf26-a5-globo" style={{ transform: `translateY(${dy}px)` }} data-globo={Math.round(Y)}>
      <path d={`M${PIVOTE.x} 66 L${PIVOTE.x} 86`} stroke={INK_2} strokeWidth="1.5" />
      <ellipse cx={PIVOTE.x} cy="44" rx="40" ry="24" fill={SUPERFICIE_2} stroke={INK} strokeWidth="2.5" />
      <text x={PIVOTE.x} y="40" textAnchor="middle" fill={INK} fontSize="13" fontWeight="700">{A5.globo}</text>
      <text x={PIVOTE.x} y="56" textAnchor="middle" fill={INK} fontSize="12" fontWeight="600" className="da26-mono">Y₀ {fmtEntero(y)}</text>
    </g>
  );
}

export function Balanza({ exp, con, Y, destino, activos }) {
  const grados = GRADOS_POR_FICHA * (con - exp);
  const rad = (grados * Math.PI) / 180;
  const dy = Math.max(-26, Math.min(26, -(Y - Y_BASE) * 0.065));
  const extremo = (lado) => ({ x: PIVOTE.x + lado * BRAZO * Math.cos(rad), y: PIVOTE.y + lado * BRAZO * Math.sin(rad) });
  const plato = (id, lado, nombre) => {
    const e = extremo(lado);
    return (
      <button type="button" className="pf26-a5-plato" data-plato={id} data-activo={activos.includes(id) ? "1" : "0"}
        disabled={!activos.includes(id)} aria-label={`Plato ${nombre}`}
        style={{ transform: `translate(${e.x - 56}px, ${e.y + 10}px)` }} {...(activos.includes(id) ? destino(id) : {})}>
        {nombre}
      </button>
    );
  };
  return (
    <div className="pf26-a5-balanza" data-balanza data-inclinacion={grados}>
      <svg viewBox={`0 0 ${ANCHO} 226`} aria-hidden="true">
        <Globo Y={Y} dy={dy} />
        <path d={`M${PIVOTE.x} ${PIVOTE.y}l-22 56h44Z`} fill="none" stroke={INK_2} strokeWidth="3" strokeLinejoin="round" />
        <g className="pf26-a5-viga" style={{ transform: `rotate(${grados}deg)` }}>
          <rect x={PIVOTE.x - BRAZO - 4} y={PIVOTE.y - 4} width={2 * BRAZO + 8} height="8" rx="4" fill={INK} />
        </g>
        <circle cx={PIVOTE.x} cy={PIVOTE.y} r="5" fill={FONDO} stroke={INK} strokeWidth="2" />
      </svg>
      {plato("expansiva", -1, A5.expansiva)}
      {plato("contraccionista", 1, A5.contraccionista)}
    </div>
  );
}

export function Lupa({ m }) {
  const esc = Math.max(0.6, Math.min(1.7, m / multiplicador(BASE)));
  return (
    <div className="pf26-a5-lupa" data-multiplicador={m.toFixed(3)}>
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" style={{ width: 40, height: 40, transform: `scale(${esc})` }}>
        <circle cx="17" cy="17" r="11" fill="none" stroke={FISCAL} strokeWidth="3" />
        <path d="M25 25 35 35" stroke={FISCAL} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span>{A5.multiplicador}</span>
      <span className="da26-mono" style={{ fontSize: 16 }}>{fmtDecimal(m, 2)}</span>
    </div>
  );
}

export default function A5Balanza({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [perilla, setPerilla] = useState(null);
  const [puestas, setPuestas] = useState([]);
  const [reforma, setReforma] = useState(false);
  const [v, setV] = useState({ G: BASE.G, t: BASE.t });
  /* P6: la familia abre la pantalla; los demás, al tocarlos. */
  const [quien, setQuienBase] = useState("familia");
  const [vistos, setVistos] = useState(new Set(["familia"]));
  const setQuien = (id) => { setQuienBase(id); setVistos((v) => new Set(v).add(id)); };
  useEffect(() => { setPuestas([]); setReforma(false); setV({ G: BASE.G, t: BASE.t }); }, [paso]);

  const enJuego = paso === 1 ? A5.fichasExpansivas : paso === 2 ? A5.fichasContraccionistas : [];
  const soltar = (id) => {
    if (id === "reforma") { setReforma(true); return; }
    setPuestas((p) => (p.includes(id) ? p : [...p, id]));
  };
  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: paso === 1 || paso === 2 || paso === 4 });

  const fichasPuestas = TODAS.filter((f) => puestas.includes(f.id));
  const exp = fichasPuestas.filter((f) => A5.fichasExpansivas.includes(f)).length;
  const con = fichasPuestas.length - exp + (reforma ? 1 : 0);
  const cambios = paso === 3 ? v : cambiosDe(reforma ? [...fichasPuestas, A5.reforma] : fichasPuestas);
  const p = modelo(cambios);
  const Y = produccion(p);

  let figura;
  let controles = null;
  let puedeSeguir = true;
  if (paso === 0) {
    const K = (t) => (
      <button type="button" className="pf26-a5-perilla" data-perilla={t} aria-pressed={perilla === t} aria-label={A5.perillas[t]} onClick={() => setPerilla(t)}>{t}</button>
    );
    figura = (
      <>
        <div className="pf26-a5-ec" aria-label={A5.ecuacion} role="group">
          <span className="pf26-a5-tok">DA =</span><span className="pf26-a5-tok">C̄ + c(Y +</span>{K("TR")}<span className="pf26-a5-tok">−</span>{K("t")}<span className="pf26-a5-tok">Y)</span>
          <span className="pf26-a5-tok">+ Ī − b·i +</span>{K("G")}<span className="pf26-a5-tok">+ XN</span>
        </div>
        <span className="pf26-a5-nombre" aria-live="polite" data-nombre-perilla>{perilla ? A5.perillas[perilla] : ""}</span>
      </>
    );
  } else if (paso === 1 || paso === 2 || paso === 4) {
    const plato = paso === 1 ? "expansiva" : "contraccionista";
    const restantes = paso === 4 ? (reforma ? [] : [{ id: "reforma", texto: A5.reforma.texto, rotulo: A5.reforma.rotulo }]) : enJuego.filter((f) => !puestas.includes(f.id));
    figura = (
      <div ref={contenedor}>
        <Balanza exp={exp} con={con} Y={Y} destino={(d) => destino(d, paso === 4 ? "reforma" : null)} activos={paso === 4 ? ["expansiva", "contraccionista"] : [plato]} />
        <div className="pf26-a5-puestas" aria-live="polite" data-puestas={puestas.join(",") + (reforma ? "reforma" : "")}>
          {fichasPuestas.map((f) => <span key={f.id} className="pf26-a5-cae">{f.texto}</span>)}
          {reforma && <span className="pf26-a5-cae" data-reforma-cayo>{A5.reforma.texto} → {A5.contraccionista}</span>}
        </div>
        <div className="pf26-a5-fichas" role="group" aria-label="Fichas">
          {restantes.map((f) => (
            <button key={f.id} type="button" className="pf26-a5-ficha" data-ficha={f.id} aria-label={`${f.texto}. Arrástrala al plato o tócala y toca el plato.`} {...pieza(f.id)}>
              <span>{f.texto}</span>{f.rotulo && <small>{f.rotulo}</small>}
            </button>
          ))}
        </div>
      </div>
    );
    puedeSeguir = paso === 4 ? reforma : restantes.length === 0;
  } else if (paso === 3) {
    figura = (
      <>
        <svg viewBox={`0 0 ${ANCHO} 100`} style={{ width: ANCHO, height: 100, display: "block", margin: "0 auto" }} aria-hidden="true">
          <g transform="translate(0 6)"><Globo Y={Y} dy={Math.max(-26, Math.min(26, -(Y - Y_BASE) * 0.065)) + 0} /></g>
        </svg>
        <Lupa m={multiplicador(p)} />
      </>
    );
    controles = (
      <>
        <Deslizador id="t" etiqueta={A5.perillas.t} min={0} max={40} paso={1} valor={Math.round(v.t * 100)} onCambio={(x) => setV({ ...v, t: x / 100 })} formato={(x) => `${x} %`} extremos={["0 %", "40 %"]} colorRelleno={FISCAL} />
        <Deslizador id="G" etiqueta={A5.perillas.G} min={100} max={400} paso={10} valor={v.G} onCambio={(x) => setV({ ...v, G: x })} formato={fmtEntero} extremos={["100", "400"]} colorRelleno={FISCAL} />
      </>
    );
  } else {
    const q = A5.impactos.find((x) => x.id === quien);
    figura = (
      <>
        <div className="pf26-a5-gente" role="group" aria-label="A quién le llega">
          {A5.impactos.map((x) => (
            <button key={x.id} type="button" className="pf26-a5-quien" data-impacto={x.id} aria-pressed={quien === x.id} onClick={() => setQuien(x.id)}>
              {x.nombre}{vistos.has(x.id) ? " ✓" : ""}
            </button>
          ))}
        </div>
        <div className="pf26-a5-escenario" aria-live="polite" data-escenario={q?.id ?? ""}>
          {q && (
            <div className="da26-entra" key={q.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {q.personaje
                ? <MascotaRol id={q.personaje} pose={POSE_IMPACTO[q.id]} alto={180} />
                : <span data-objeto-impacto={q.id} style={{ display: "grid", placeItems: "center", height: 200 }}><Objeto id={OBJETO_IMPACTO[q.id]} alto={150} nombre={q.nombre} /></span>}
              <p className="pf26-a5-impacto" data-texto-impacto>{q.texto}</p>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <MarcoAprender
      id={ID}
      paso={paso}
      total={TEXTOS.length}
      texto={TEXTOS[paso]}
      figura={<><style>{CSS_A5}</style>{figura}</>}
      controles={controles}
      puedeSeguir={puedeSeguir}
      onSiguiente={siguiente}
      onAnterior={anterior}
      onTerminar={() => onTerminar?.()}
    />
  );
}
