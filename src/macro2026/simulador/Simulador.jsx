/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · EL SIMULADOR CON IA (orden de Mateo, 26-nov)
 *
 * El estudiante ENTRA a una oficina (puertas de vidrio que se abren), una
 * compañera del elenco lo recibe y lo capacita, y la IA le trae expedientes
 * que cambian en cada ronda. Él diagnostica, la compañera le explica, y en
 * cualquier momento le puede preguntar escribiendo o con el micrófono.
 *
 * Los cinco pasos de la REGLA MAESTRA:
 *   1. Ingenio: diagnosticar países como un médico; tres rondas de dificultad
 *      creciente (un virus, dos virus, un virus con trampa).
 *   2. Contexto: el titular y la frase de la compañera, antes de la consigna.
 *   3. Rol: «analista junior de Pulso», escrito en la escena.
 *   4. Pregunta: «¿Qué virus tiene Valdoria? Marca uno o varios.» (≤ 12).
 *   5. Visual: la oficina ilustrada, la compañera de 180 px, virus ilustrados.
 *
 * Movimiento dentro del Kit: una sola curva, solo transform y opacity, nada
 * en bucle. Con movimiento reducido, todo aparece sin desplazarse.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, ArrowUp, Volume2, VolumeX, Sparkles, FileText, Square } from "lucide-react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2, CORAL, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { CURVA } from "../comun/ui.jsx";
import { rutaMascota } from "../comun/mascotas.jsx";
import { rutaIlustrado } from "../comun/ilustrados.jsx";
import { IconoProblema } from "../comun/iconos-pe.jsx";
import { AVISO_IA, PROBLEMAS_PE, simuladorDe, explicacionLocal, veredictoLocal, nombreProblema } from "./escenas.js";
import { llamarSimulador } from "./api.js";
import { useDictado, hablar, callar, hayVoz } from "./voz.js";

const TEAL = "#5FD3C3";
const AMBAR = "#E9C46A";

export const CSS_SIM = `
.sim { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.sim > * { min-width: 0; }
.sim * { box-sizing: border-box; }
.sim-aviso { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; background: rgba(14,27,46,.82); border: 1px solid ${TEAL}; color: ${INK}; font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); }
.sim-aviso svg { color: ${TEAL}; flex: none; }
.sim-escena { position: relative; height: 250px; border-radius: 14px; overflow: hidden; border: 1px solid ${BORDE}; background: #0b1626; isolation: isolate; }
@media (min-width: 420px) { .sim-escena { height: 280px; } }
.sim-fondo { position: absolute; inset: -4%; background-size: cover; background-position: 88% 40%; transform: scale(1.14); opacity: .55; transition: transform 1400ms ${CURVA}, opacity 900ms ${CURVA}; }
.sim-escena[data-dentro="1"] .sim-fondo { transform: none; opacity: 1; }
.sim-escena::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,22,38,.55) 0%, rgba(11,22,38,0) 28%, rgba(11,22,38,0) 62%, rgba(11,22,38,.7) 100%); pointer-events: none; z-index: 1; }
.sim-escena .sim-aviso { position: absolute; top: 10px; left: 10px; z-index: 4; max-width: calc(100% - 20px); }
.sim-mascota { position: absolute; left: 6%; bottom: 8px; height: 190px; width: auto; z-index: 2; transform: translateX(-40px); opacity: 0; transition: transform 620ms ${CURVA} 500ms, opacity 420ms ${CURVA} 500ms; filter: drop-shadow(0 8px 10px rgba(0,0,0,.45)); }
@media (min-width: 420px) { .sim-mascota { height: 210px; } }
.sim-escena[data-dentro="1"] .sim-mascota { transform: none; opacity: 1; }
.sim-mascota[data-cambia="1"] { animation: sim-salta 360ms ${CURVA} 1; }
@keyframes sim-salta { 0% { transform: translateY(0); } 40% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
.sim-placa { position: absolute; z-index: 3; bottom: 12px; display: grid; gap: 2px; padding: 6px 10px; border-radius: 10px; background: rgba(14,27,46,.86); border: 1px solid ${BORDE}; font: 600 12px/15px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.sim-escena:not([data-dentro="1"]) .sim-placa { opacity: 0; }
.sim-placa { transition: opacity 400ms ${CURVA} 900ms; }
.sim-placa small { font-weight: 500; color: ${INK_2}; font-size: 11px; }
.sim-placa-yo { right: 10px; text-align: right; }
.sim-placa-ella { right: 10px; bottom: 54px; text-align: right; }

/* La puerta de vidrio: dos hojas que se corren. */
.sim-puerta { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; pointer-events: none; }
.sim-hoja { position: absolute; top: 0; bottom: 0; width: 50.5%; background: linear-gradient(115deg, rgba(196,226,240,.36) 0%, rgba(150,190,214,.22) 38%, rgba(220,240,250,.42) 52%, rgba(140,180,206,.2) 70%, rgba(190,222,238,.34) 100%); border: 1px solid rgba(235,245,252,.55); transition: transform 1100ms ${CURVA}; pointer-events: auto; }
.sim-hoja::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 22px, rgba(255,255,255,.05) 22px 23px); }
.sim-hoja-izq { left: 0; border-right-width: 2px; }
.sim-hoja-der { right: 0; border-left-width: 2px; }
.sim-manija { position: absolute; top: 34%; height: 32%; width: 7px; border-radius: 4px; background: linear-gradient(90deg, #8d99a6, #eef2f5 45%, #9aa6b2); box-shadow: 0 2px 6px rgba(0,0,0,.35); }
.sim-hoja-izq .sim-manija { right: 12px; }
.sim-hoja-der .sim-manija { left: 12px; }
.sim-escena[data-dentro="1"] .sim-hoja-izq { transform: translateX(-102%); }
.sim-escena[data-dentro="1"] .sim-hoja-der { transform: translateX(102%); }
.sim-rotulo-puerta { position: relative; z-index: 6; text-align: center; color: #f4f8fb; text-shadow: 0 1px 2px rgba(0,0,0,.5); transition: opacity 400ms ${CURVA}; }
.sim-rotulo-puerta b { display: block; font: 800 34px/36px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .32em; padding-left: .32em; }
.sim-rotulo-puerta span { display: block; margin-top: 4px; font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .2em; text-transform: uppercase; opacity: .9; }
.sim-escena[data-dentro="1"] .sim-rotulo-puerta { opacity: 0; }

/* El globo de la compañera. */
.sim-globo { position: relative; padding: 12px 14px; border-radius: 14px; background: ${INK}; color: ${TINTA_SOBRE_COLOR}; font-size: 16px; line-height: 1.42; min-height: 64px; }
.sim-globo::before { content: ""; position: absolute; top: -9px; left: 46px; width: 18px; height: 18px; background: ${INK}; transform: rotate(45deg); border-radius: 3px; }
.sim-globo-quien { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; font: 700 12px/16px var(--planck-font-sans, system-ui, sans-serif); color: #3a4658; letter-spacing: .02em; }
.sim-globo p { margin: 0; position: relative; }
.sim-palabra { display: inline-block; animation: sim-palabra 240ms ${CURVA} both; }
@keyframes sim-palabra { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
.sim-punto { display: inline-block; width: 7px; height: 7px; margin-right: 4px; border-radius: 999px; background: #3a4658; animation: sim-punto 900ms ${CURVA} 10 both; }
@keyframes sim-punto { 0%,100% { opacity: .25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
.sim-voz { display: inline-flex; align-items: center; gap: 4px; min-height: 32px; padding: 4px 10px; border-radius: 999px; border: 1px solid #b9c2cf; background: transparent; color: #26303d; font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; }

/* El expediente. */
.sim-expediente { position: relative; border-radius: 4px 14px 14px 14px; background: #f3ead8; color: #2a2116; padding: 14px 14px 12px; box-shadow: 0 10px 24px rgba(0,0,0,.35); animation: sim-cae 520ms ${CURVA} both; }
.sim-expediente::before { content: ""; position: absolute; top: -14px; left: 0; width: 120px; height: 16px; border-radius: 8px 8px 0 0; background: #f3ead8; }
@keyframes sim-cae { from { opacity: 0; transform: translateY(-14px) rotate(-1.5deg); } to { opacity: 1; transform: none; } }
.sim-exp-cab { display: flex; gap: 10px; align-items: center; }
.sim-exp-cab img { width: 46px; height: auto; flex: none; }
.sim-exp-pais { margin: 0; font: 800 20px/24px var(--planck-font-sans, system-ui, sans-serif); }
.sim-exp-sello { font: 700 11px/14px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; color: #8a5a2b; text-transform: uppercase; }
.sim-exp-titular { margin: 8px 0 10px; font: 600 16px/21px var(--planck-font-sans, system-ui, sans-serif); }
.sim-sintomas { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.sim-sintoma { display: grid; grid-template-columns: 30px 1fr; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 10px; background: #fffaf0; border: 1px solid #e0d2b6; animation: da26-entra 320ms ${CURVA} both; }
.sim-sintoma-flecha { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font: 800 16px/1 var(--planck-font-sans, system-ui, sans-serif); color: #fff; background: #6b5a43; }
.sim-sintoma-flecha[data-t="sube"] { background: #b5452e; }
.sim-sintoma-flecha[data-t="baja"] { background: #2b6f8f; }
.sim-sintoma-dato { font: 600 14px/18px var(--planck-font-sans, system-ui, sans-serif); }
.sim-sintoma-cifras { font: 500 14px/18px var(--planck-font-mono, ui-monospace, monospace); font-variant-numeric: tabular-nums; color: #5a4a33; }
.sim-sintoma-cifras b { color: #2a2116; }
.sim-testigo { margin: 10px 0 0; padding: 8px 10px 8px 12px; border-left: 4px solid #c9a66b; font: italic 500 15px/20px var(--planck-font-sans, system-ui, sans-serif); }
.sim-testigo small { display: block; font-style: normal; font-size: 12px; color: #6d5c44; margin-top: 2px; }
.sim-archivo { margin: 8px 0 0; font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); color: #8a5a2b; }

/* Los virus. */
.sim-consigna { margin: 2px 0 8px; font: 700 17px/22px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.sim-virus { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
@media (min-width: 560px) { .sim-virus { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 400px) {
  .sim-chip { flex-direction: column; justify-content: center; text-align: center; gap: 4px; min-height: 84px; padding: 8px 6px; font-size: 13px; line-height: 16px; }
}
.sim-chip { position: relative; display: flex; align-items: center; gap: 8px; min-height: 56px; padding: 6px 10px 6px 6px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 14px/17px var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; transition: transform 200ms ${CURVA}, border-color 200ms ${CURVA}; }
.sim-chip:active { transform: scale(.96); }
.sim-chip[aria-pressed="true"] { border-color: ${INK}; background: #2b4268; }
.sim-chip:disabled { cursor: default; }
.sim-chip-ilu { position: relative; width: 40px; height: 40px; flex: none; }
.sim-chip-ilu img { width: 40px; height: 40px; }
.sim-chip-ilu span { position: absolute; right: -4px; bottom: -4px; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 1.5px solid #0E1B2E; color: #0E1B2E; display: grid; place-items: center; }
.sim-chip-marca { position: absolute; top: -9px; right: 6px; padding: 1px 7px; border-radius: 999px; font: 700 11px/15px var(--planck-font-sans, system-ui, sans-serif); background: ${INK}; color: ${TINTA_SOBRE_COLOR}; }
.sim-chip[data-res="falto"] { border-style: dashed; border-color: ${AMBAR}; }
.sim-chip[data-res="falto"] .sim-chip-marca { background: ${AMBAR}; }
.sim-chip[data-res="sobro"] { border-color: ${CORAL}; }
.sim-chip[data-res="sobro"] .sim-chip-marca { background: ${CORAL}; color: #fff; }
.sim-chip[data-res="bien"] { border-color: ${TEAL}; }
.sim-chip[data-res="bien"] .sim-chip-marca { background: ${TEAL}; }

.sim-veredicto { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font: 800 14px/18px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .04em; text-transform: uppercase; }
.sim-veredicto[data-v="acierto"] { background: ${TEAL}; color: ${TINTA_SOBRE_COLOR}; }
.sim-veredicto[data-v="parcial"] { background: ${AMBAR}; color: ${TINTA_SOBRE_COLOR}; }
.sim-veredicto[data-v="fallo"] { background: ${CORAL}; color: #fff; }

/* La barra para hablar con la compañera. */
.sim-barra { display: flex; gap: 8px; align-items: flex-end; padding: 8px; border-radius: 16px; background: ${FONDO}; border: 1px solid ${BORDE}; }
.sim-barra textarea { flex: 1; min-width: 0; min-height: 44px; max-height: 120px; resize: none; padding: 11px 6px; border: 0; background: transparent; color: ${INK}; font: 400 16px/22px var(--planck-font-sans, system-ui, sans-serif); }
.sim-barra textarea:focus { outline: none; }
.sim-barra:focus-within { border-color: ${INK_2}; }
.sim-redondo { width: 44px; height: 44px; flex: none; border-radius: 50%; border: 1px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; display: grid; place-items: center; cursor: pointer; touch-action: manipulation; transition: transform 160ms ${CURVA}; }
.sim-redondo:active { transform: scale(.92); }
.sim-redondo:disabled { opacity: .4; cursor: default; }
.sim-redondo[data-primario="1"] { background: ${INK}; color: ${TINTA_SOBRE_COLOR}; border-color: ${INK}; }
.sim-redondo[data-oyendo="1"] { background: ${CORAL}; border-color: ${CORAL}; color: #fff; }
.sim-sugerencias { display: flex; flex-wrap: wrap; gap: 6px; }
.sim-sugerencia { min-height: 36px; padding: 6px 12px; border-radius: 999px; border: 1px dashed ${INK_2}; background: transparent; color: ${INK}; font: 500 13px/17px var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; text-align: left; }
.sim-charla, .sim-preg { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-charla > *, .sim-preg > * { min-width: 0; }
.sim-msg { max-width: 88%; overflow-wrap: anywhere; padding: 8px 12px; border-radius: 14px; font-size: 15px; line-height: 1.4; animation: da26-entra 260ms ${CURVA} both; }
.sim-msg[data-rol="estudiante"] { justify-self: end; background: #2b4268; border: 1px solid ${BORDE}; border-bottom-right-radius: 4px; }
.sim-msg[data-rol="companera"] { justify-self: start; background: ${SUPERFICIE_2}; border: 1px solid ${BORDE}; border-bottom-left-radius: 4px; }
.sim-msg small { display: block; font-size: 11px; color: ${INK_2}; margin-bottom: 2px; font-weight: 600; }
.sim-acciones { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.sim-cierre { display: grid; gap: 8px; }
.sim-cierre li { display: flex; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 10px; background: ${SUPERFICIE_2}; border: 1px solid ${BORDE}; }
.sim-cupo { font: 500 12px/16px var(--planck-font-mono, ui-monospace, monospace); color: ${INK_2}; text-align: right; }

@media (prefers-reduced-motion: reduce) {
  .sim-fondo, .sim-mascota, .sim-hoja, .sim-rotulo-puerta { transition: opacity 120ms linear !important; }
  .sim-escena[data-dentro="1"] .sim-hoja { opacity: 0; transform: none; }
  .sim-mascota { transform: none; }
  .sim-palabra, .sim-expediente, .sim-sintoma, .sim-msg, .sim-mascota[data-cambia="1"] { animation: none !important; }
  .sim-punto { animation: none; opacity: .7; }
}
`;

/** El texto de la compañera, palabra por palabra (una vez). */
function Palabras({ texto }) {
  const palabras = useMemo(() => String(texto ?? "").split(/\s+/).filter(Boolean), [texto]);
  const paso = Math.min(45, 1400 / Math.max(1, palabras.length));
  return palabras.map((p, k) => (
    <span key={`${texto.length}-${k}`} className="sim-palabra" style={{ animationDelay: `${Math.round(k * paso)}ms` }}>{p}{k < palabras.length - 1 ? " " : ""}</span>
  ));
}

function Puerta({ sim }) {
  return (
    <div className="sim-puerta" aria-hidden="true">
      <div className="sim-hoja sim-hoja-izq"><span className="sim-manija" /></div>
      <div className="sim-hoja sim-hoja-der"><span className="sim-manija" /></div>
      <div className="sim-rotulo-puerta"><b>{sim.firma}</b><span>{sim.lema}</span></div>
    </div>
  );
}

function Escena({ sim, dentro, pose }) {
  const m = rutaMascota(sim.companera.mascota, pose);
  const [cambia, setCambia] = useState(false);
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) { primera.current = false; return undefined; }
    setCambia(true);
    const t = setTimeout(() => setCambia(false), 400);
    return () => clearTimeout(t);
  }, [pose]);
  return (
    <div className="sim-escena" data-dentro={dentro ? "1" : "0"} data-sim-escena>
      <div className="sim-fondo" style={{ backgroundImage: `url(${sim.fondo})` }} />
      <span className="sim-aviso" data-aviso-ia><Sparkles size={14} aria-hidden="true" />{AVISO_IA}</span>
      <img className="sim-mascota" src={m.src} width={m.tam[0]} height={m.tam[1]} alt={`${sim.companera.nombre}, tu compañera en ${sim.firma}`} data-cambia={cambia ? "1" : "0"} />
      <div className="sim-placa sim-placa-ella">{sim.companera.nombre}<small>Compañera con IA</small></div>
      <div className="sim-placa sim-placa-yo">{sim.rol}</div>
      <Puerta sim={sim} />
    </div>
  );
}

function Globo({ sim, texto, pensando, voz, onVoz }) {
  return (
    <div className="sim-globo" aria-live="polite" data-globo>
      <div className="sim-globo-quien">
        <span>{sim.companera.nombre}</span>
        {hayVoz() && (
          <button type="button" className="sim-voz" onClick={onVoz} aria-pressed={voz} data-voz>
            {voz ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}{voz ? "Voz encendida" : "Escuchar"}
          </button>
        )}
      </div>
      <p>{pensando ? <span aria-label="Pensando"><span className="sim-punto" /><span className="sim-punto" style={{ animationDelay: "150ms" }} /><span className="sim-punto" style={{ animationDelay: "300ms" }} /></span> : <Palabras texto={texto} />}</p>
    </div>
  );
}

function Expediente({ caso, ronda, total }) {
  return (
    <article className="sim-expediente" data-expediente aria-label={`Expediente de ${caso.pais}`}>
      <div className="sim-exp-cab">
        <img src={rutaIlustrado("lupa")} alt="" width="46" height="46" />
        <div>
          <span className="sim-exp-sello">Expediente {ronda} de {total}</span>
          <h3 className="sim-exp-pais">{caso.pais}</h3>
        </div>
      </div>
      <p className="sim-exp-titular">{caso.titular}</p>
      <ul className="sim-sintomas">
        {caso.sintomas.map((s, k) => (
          <li key={k} className="sim-sintoma" style={{ animationDelay: `${200 + k * 140}ms` }}>
            <span className="sim-sintoma-flecha" data-t={s.tendencia} aria-label={s.tendencia === "sube" ? "Sube" : s.tendencia === "baja" ? "Baja" : "Igual"}>
              {s.tendencia === "sube" ? "↑" : s.tendencia === "baja" ? "↓" : "="}
            </span>
            <span>
              <span className="sim-sintoma-dato">{s.dato}</span><br />
              <span className="sim-sintoma-cifras">{s.antes} → <b>{s.ahora}</b></span>
            </span>
          </li>
        ))}
      </ul>
      <p className="sim-testigo">«{caso.testigo}»<small>{caso.quien}</small></p>
      {caso.archivo && <p className="sim-archivo">Expediente de archivo: la IA no respondió esta vez.</p>}
    </article>
  );
}

const MARCA = { bien: "Acertaste", falto: "Faltó", sobro: "No era" };

function Virus({ elegidos, onToggle, resultado, correctos }) {
  return (
    <div className="sim-virus" role="group" aria-label="Los ocho virus">
      {PROBLEMAS_PE.map((p) => {
        const sel = elegidos.includes(p.id);
        let res = null;
        if (resultado) {
          const real = correctos.includes(p.id);
          res = real && sel ? "bien" : real ? "falto" : sel ? "sobro" : null;
        }
        return (
          <button key={p.id} type="button" className="sim-chip" aria-pressed={sel} disabled={Boolean(resultado)} onClick={() => onToggle(p.id)} data-virus={p.id} data-res={res ?? undefined}>
            <span className="sim-chip-ilu">
              <img src={rutaIlustrado("virus")} alt="" width="40" height="40" />
              <span><IconoProblema id={p.id} size={14} /></span>
            </span>
            {p.nombre}
            {res && <span className="sim-chip-marca">{MARCA[res]}</span>}
          </button>
        );
      })}
    </div>
  );
}

const ETIQUETA_V = { acierto: "Diagnóstico exacto", parcial: "Diagnóstico a medias", fallo: "Diagnóstico errado" };

/**
 * @param {string} escenaId     id de la Aprender (p. ej. «pe26-a2-fiebre»)
 * @param {Function} [llamar]   para las pruebas: (cuerpo) → respuesta del servidor
 */
export default function Simulador({ escenaId, llamar = llamarSimulador }) {
  const sim = simuladorDe(escenaId);
  const [fase, setFase] = useState("puerta");
  const [paso, setPaso] = useState(0);
  const [dice, setDice] = useState("");
  const [pensando, setPensando] = useState(false);
  const [ronda, setRonda] = useState(1);
  const [caso, setCaso] = useState(null);
  const [elegidos, setElegidos] = useState([]);
  const [razon, setRazon] = useState("");
  const [resultado, setResultado] = useState(null);
  const [historia, setHistoria] = useState([]);
  const [charla, setCharla] = useState([]);
  const [sugerencias, setSugerencias] = useState(sim?.sugerenciasIniciales ?? []);
  const [pregunta, setPregunta] = useState("");
  const [voz, setVoz] = useState(false);
  const [cupo, setCupo] = useState(null);
  const vozRef = useRef(voz);
  vozRef.current = voz;
  const archivoUsado = useRef(0);
  const dictadoPregunta = useDictado((t) => setPregunta(t));
  const dictadoRazon = useDictado((t) => setRazon(t));

  useEffect(() => () => callar(), []);
  if (!sim) return null;

  const decir = (texto) => { setDice(texto); if (vozRef.current) hablar(texto); };
  const anotarCupo = (r) => { if (r?.limite) setCupo({ usadas: r.usadas, limite: r.limite }); };

  const entrar = () => {
    setFase("capacitacion");
    setTimeout(() => decir(sim.capacitacion[0]), 900);
  };

  const seguirCapacitacion = () => {
    const sig = paso + 1;
    if (sig < sim.capacitacion.length) { setPaso(sig); decir(sim.capacitacion[sig]); return; }
    traerCaso(1);
  };

  async function traerCaso(n) {
    setFase("caso");
    setRonda(n);
    setCaso(null);
    setElegidos([]);
    setRazon("");
    setResultado(null);
    setPensando(true);
    const r = await llamar({ escenario: sim.id, accion: "caso", ronda: n, previos: historia.map((h) => ({ pais: h.caso.pais, problemas: h.caso.problemas })), semilla: Math.floor(Math.random() * 1e6) });
    setPensando(false);
    if (r?.caso) {
      anotarCupo(r);
      setCaso(r.caso);
      decir(r.dice);
      if (r.sugerencias?.length) setSugerencias(r.sugerencias);
      return;
    }
    const usados = new Set(historia.map((h) => h.caso.pais));
    const libres = sim.archivo.filter((c) => !usados.has(c.pais));
    const c = libres[archivoUsado.current % Math.max(1, libres.length)] ?? sim.archivo[archivoUsado.current % sim.archivo.length];
    archivoUsado.current += 1;
    setCaso({ ...c, archivo: true });
    decir(`${r?.error ?? "La IA no respondió."} Mientras tanto, revisa este expediente de archivo: ${c.pais}.`);
  }

  async function diagnosticar() {
    if (!caso || !elegidos.length) return;
    dictadoRazon.parar();
    if (caso.archivo) {
      const v = veredictoLocal(caso.problemas, elegidos);
      setResultado({ veredicto: v.estado, correctos: caso.problemas });
      setFase("veredicto");
      decir(explicacionLocal(caso, v));
      setHistoria((h) => [...h, { caso, veredicto: v.estado }]);
      return;
    }
    setPensando(true);
    const r = await llamar({ escenario: sim.id, accion: "diagnostico", ronda, caso, elegidos, razon });
    setPensando(false);
    let res;
    if (r?.veredicto) {
      anotarCupo(r);
      res = { veredicto: r.veredicto, correctos: r.correctos ?? caso.problemas };
      decir(r.dice);
      if (r.sugerencias?.length) setSugerencias(r.sugerencias);
    } else {
      const v = veredictoLocal(caso.problemas, elegidos);
      res = { veredicto: v.estado, correctos: caso.problemas };
      decir(explicacionLocal(caso, v));
    }
    setResultado(res);
    setFase("veredicto");
    setHistoria((h) => [...h, { caso, veredicto: res.veredicto }]);
  }

  async function preguntar(texto) {
    const t = String(texto ?? "").trim();
    if (!t || pensando) return;
    dictadoPregunta.parar();
    setPregunta("");
    const nueva = [...charla, { rol: "estudiante", texto: t }];
    setCharla(nueva);
    setPensando(true);
    const r = await llamar({ escenario: sim.id, accion: "pregunta", mensaje: t, caso, diagnosticado: Boolean(resultado), historial: charla });
    setPensando(false);
    const respuesta = r?.dice ?? r?.error ?? "No pude responder ahora.";
    anotarCupo(r);
    setCharla([...nueva, { rol: "companera", texto: respuesta }]);
    decir(respuesta);
    if (r?.sugerencias?.length) setSugerencias(r.sugerencias);
  }

  const alternar = (id) => setElegidos((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const alternarVoz = () => { const v = !voz; setVoz(v); if (v) hablar(dice); else callar(); };
  const pose = sim.companera.poses[fase === "veredicto" || fase === "cierre" ? "veredicto" : fase === "caso" ? "caso" : "capacitacion"];
  const dentro = fase !== "puerta";

  return (
    <section className="sim" data-simulador={sim.id} data-fase={fase}>
      <style>{CSS_SIM}</style>
      <Escena sim={sim} dentro={dentro} pose={pose} />

      {fase === "puerta" && (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, color: INK, fontSize: 16, lineHeight: 1.4 }}>
            Te contrataron en <b>{sim.firma}</b>, una firma que diagnostica economías. Hoy es tu primer día.
          </p>
          <button type="button" className="da26-boton da26-primario" onClick={entrar} data-entrar style={{ marginLeft: 0, width: "100%" }}>Entrar a la oficina</button>
        </div>
      )}

      {dentro && (dice || pensando) && <Globo sim={sim} texto={dice} pensando={pensando && fase !== "capacitacion"} voz={voz} onVoz={alternarVoz} />}

      {fase === "capacitacion" && (
        <div className="sim-acciones">
          <span className="da26-rotulo da26-mono" style={{ marginRight: "auto", alignSelf: "center" }}>Capacitación {paso + 1}/{sim.capacitacion.length}</span>
          <button type="button" className="da26-boton da26-primario" onClick={seguirCapacitacion} data-siguiente-capacitacion>
            {paso + 1 < sim.capacitacion.length ? "Sigue" : sim.empezar}
          </button>
        </div>
      )}

      {(fase === "caso" || fase === "veredicto") && caso && (
        <>
          <Expediente caso={caso} ronda={ronda} total={sim.rondas} />
          <div>
            <p className="sim-consigna" data-consigna>{sim.consigna(caso.pais)}</p>
            <Virus elegidos={elegidos} onToggle={alternar} resultado={resultado} correctos={resultado?.correctos ?? []} />
          </div>
          {fase === "caso" && (
            <>
              <div className="sim-barra">
                <textarea rows={1} value={razon} onChange={(e) => setRazon(e.target.value)} placeholder={sim.preguntaRazon} aria-label={sim.preguntaRazon} maxLength={400} data-razon />
                {dictadoRazon.soportado && (
                  <button type="button" className="sim-redondo" data-oyendo={dictadoRazon.escuchando ? "1" : "0"} onClick={dictadoRazon.escuchando ? dictadoRazon.parar : dictadoRazon.iniciar} aria-label={dictadoRazon.escuchando ? "Parar el micrófono" : "Dictar tu razón"}>
                    {dictadoRazon.escuchando ? <Square size={16} /> : <Mic size={18} />}
                  </button>
                )}
              </div>
              <div className="sim-acciones">
                <button type="button" className="da26-boton da26-primario" onClick={diagnosticar} disabled={!elegidos.length || pensando} data-diagnosticar style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FileText size={16} aria-hidden="true" />Entregar diagnóstico
                </button>
              </div>
            </>
          )}
          {fase === "veredicto" && resultado && (
            <div className="sim-acciones" style={{ alignItems: "center" }}>
              <span className="sim-veredicto" data-v={resultado.veredicto} data-veredicto={resultado.veredicto} style={{ marginRight: "auto" }}>
                {resultado.veredicto === "acierto" ? "✓" : resultado.veredicto === "parcial" ? "½" : "✕"} {ETIQUETA_V[resultado.veredicto]}
              </span>
              {ronda < sim.rondas
                ? <button type="button" className="da26-boton da26-primario" onClick={() => traerCaso(ronda + 1)} disabled={pensando} data-siguiente-caso>Siguiente expediente</button>
                : <button type="button" className="da26-boton da26-primario" onClick={() => { setFase("cierre"); decir(`Buen turno. Diagnosticaste ${historia.length} economías. Mañana llegan pacientes nuevos.`); }} data-cerrar-turno>Cerrar el turno</button>}
            </div>
          )}
        </>
      )}

      {fase === "cierre" && (
        <div className="sim-cierre" data-cierre>
          <p className="sim-consigna" style={{ margin: 0 }}>Tu turno en {sim.firma}</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {historia.map((h, k) => (
              <li key={k}><span><b>{h.caso.pais}</b> · {h.caso.problemas.map(nombreProblema).join(" + ")}</span><span className="sim-veredicto" data-v={h.veredicto} style={{ padding: "2px 8px", fontSize: 11 }}>{h.veredicto}</span></li>
            ))}
          </ul>
          <div className="sim-acciones">
            <button type="button" className="da26-boton da26-primario" onClick={() => { setHistoria([]); traerCaso(1); }} data-otro-turno>Otro turno, casos nuevos</button>
          </div>
        </div>
      )}

      {dentro && fase !== "capacitacion" && (
        <div className="sim-preg" data-preguntas>
          {charla.length > 0 && (
            <div className="sim-charla">
              {charla.slice(-4).map((m, k) => (
                <div key={charla.length - 4 + k} className="sim-msg" data-rol={m.rol}><small>{m.rol === "estudiante" ? "Tú" : sim.companera.nombre}</small>{m.texto}</div>
              ))}
            </div>
          )}
          {sugerencias.length > 0 && (
            <div className="sim-sugerencias">
              {sugerencias.map((s) => <button key={s} type="button" className="sim-sugerencia" onClick={() => preguntar(s)} disabled={pensando} data-sugerencia>{s}</button>)}
            </div>
          )}
          <form className="sim-barra" onSubmit={(e) => { e.preventDefault(); preguntar(pregunta); }}>
            <textarea rows={1} value={pregunta} onChange={(e) => setPregunta(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); preguntar(pregunta); } }} placeholder={sim.placeholder} aria-label={sim.placeholder} maxLength={600} data-pregunta />
            {dictadoPregunta.soportado && (
              <button type="button" className="sim-redondo" data-oyendo={dictadoPregunta.escuchando ? "1" : "0"} onClick={dictadoPregunta.escuchando ? dictadoPregunta.parar : dictadoPregunta.iniciar} aria-label={dictadoPregunta.escuchando ? "Parar el micrófono" : "Preguntar con el micrófono"} data-microfono>
                {dictadoPregunta.escuchando ? <Square size={16} /> : <Mic size={18} />}
              </button>
            )}
            <button type="submit" className="sim-redondo" data-primario="1" disabled={!pregunta.trim() || pensando} aria-label="Enviar pregunta" data-enviar><ArrowUp size={18} /></button>
          </form>
          {cupo && <p className="sim-cupo" style={{ margin: 0 }}>Consultas de hoy: {cupo.usadas}/{cupo.limite}</p>}
        </div>
      )}
    </section>
  );
}

