/*
 * A7 · El termostato (pm26-a7-termostato, Aprender).
 * Especificación de Gen, t4 §2 A7. P1 la casa con el termómetro (tono cálido,
 * nunca coral): «Subir el aire» enciende el aire y el mercurio baja 3 s
 * después, a propósito (es el rezago). P2 la banda 2 %–4 %. P3 la gráfica
 * 2016–2026 con un deslizador de años: el punto de cada año da sus dos
 * cifras. P4 se resalta 2021–2023. Datos: lectura aproximada del gráfico del
 * BanRep (textos.js, SERIE_A7).
 */
import { useEffect, useState } from "react";
import { BORDE, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { Boton, Deslizador, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { fmtDecimal } from "../comun/modelo-da.js";
import { CALIDO, CSS_PM, MONETARIA, Termostato } from "./comun-pm.jsx";
import { A7, APRENDER, SERIE_A7, ESCENAS } from "./textos.js";

export const ID = "pm26-a7-termostato";
const TEXTOS = APRENDER[ID];
export const REZAGO_MS = 3000;
const CALIENTE = 9, FRESCA = 5;

const X0 = 34, X1 = 290, Y0 = 170, Y1 = 10, VMAX = 14;
const xDe = (anio) => X0 + ((anio - 2016) / 10) * (X1 - X0);
const yDe = (v) => Y0 - (v / VMAX) * (Y0 - Y1);
const linea = (campo) => SERIE_A7.filter((d) => d[campo] != null).map((d, k) => `${k ? "L" : "M"}${xDe(d.anio)} ${yDe(d[campo])}`).join("");

export function GraficaCaso({ anio, resalte = false }) {
  const d = SERIE_A7.find((x) => x.anio === anio);
  return (
    <svg viewBox="0 0 300 196" style={{ width: "100%", height: "auto", maxWidth: 380, display: "block", margin: "0 auto" }} role="img"
      aria-label={`${anio}: ${A7.inflacion} ${fmtDecimal(d.inflacion, 1)} %, ${A7.tasa} ${d.tasa == null ? "sin lectura" : `${fmtDecimal(d.tasa, 2)} %`}`} data-grafica-caso data-anio={anio}>
      {resalte && <rect x={xDe(2021)} y={Y1} width={xDe(2023) - xDe(2021)} height={Y0 - Y1} fill={INK} opacity=".08" data-resalte />}
      <rect x={X0} y={yDe(4)} width={X1 - X0} height={yDe(2) - yDe(4)} fill={MONETARIA} opacity=".25" data-banda />
      <path d={`M${X0} ${Y1}V${Y0}H${X1}`} fill="none" stroke={INK_2} strokeWidth="1.5" />
      {[0, 4, 8, 12].map((v) => <text key={v} x={X0 - 6} y={yDe(v) + 5} textAnchor="end" fill={INK_2} fontSize="14">{v}</text>)}
      {[2016, 2021, 2026].map((a) => <text key={a} x={xDe(a)} y={Y0 + 20} textAnchor="middle" fill={INK_2} fontSize="14">{a}</text>)}
      <path d={linea("inflacion")} fill="none" stroke={CALIDO} strokeWidth="3" strokeLinejoin="round" data-linea="inflacion" />
      <path d={linea("tasa")} fill="none" stroke={MONETARIA} strokeWidth="3" strokeDasharray="7 4" strokeLinejoin="round" data-linea="tasa" />
      <path d={`M${xDe(anio)} ${Y1}V${Y0}`} stroke={INK} strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={xDe(anio)} cy={yDe(d.inflacion)} r="6" fill={CALIDO} stroke={INK} strokeWidth="2" />
      {d.tasa != null && <circle cx={xDe(anio)} cy={yDe(d.tasa)} r="6" fill={MONETARIA} stroke={INK} strokeWidth="2" />}
    </svg>
  );
}

const CSS = `
.pm26-a7-leyenda { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 14px; margin: 4px 0 0; font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-a7-leyenda i { display: inline-block; width: 18px; height: 4px; border-radius: 2px; vertical-align: middle; margin-right: 4px; }
.pm26-a7-fuente { margin: 4px 0 0; text-align: center; font: 500 12px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.pm26-a7-cifras { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 6px; padding: 6px; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; text-align: center; font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-a7-cifras b { display: block; font: 700 17px/1.2 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); color: ${INK}; }
`;

export function Leyenda() {
  return (
    <>
      <p className="pm26-a7-leyenda"><span><i style={{ background: CALIDO }} />{A7.inflacion}</span><span><i style={{ background: MONETARIA }} />{A7.tasa}</span></p>
      <p className="pm26-a7-fuente" data-fuente>{A7.fuente}</p>
    </>
  );
}

export default function A7Termostato({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [aire, setAire] = useState(false);
  const [fresca, setFresca] = useState(false);
  const [anio, setAnio] = useState(2016);
  const [recorridos, setRecorridos] = useState(new Set([2016]));
  useEffect(() => {
    if (!aire) return undefined;
    const t = setTimeout(() => setFresca(true), REZAGO_MS);
    return () => clearTimeout(t);
  }, [aire]);

  let figura;
  if (paso <= 1) {
    figura = <Termostato inflacion={fresca ? FRESCA : CALIENTE} banda={paso === 1} aire={aire} />;
  } else {
    const a = paso === 3 ? (anio >= 2021 && anio <= 2023 ? anio : 2022) : anio;
    const d = SERIE_A7.find((x) => x.anio === a);
    figura = (
      <div>
        <GraficaCaso anio={a} resalte={paso === 3} />
        <Leyenda />
        <div className="pm26-a7-cifras" aria-live="polite" data-cifras-anio={a}>
          <span>{A7.anio}<b>{a}</b></span>
          <span>{A7.inflacion}<b>{fmtDecimal(d.inflacion, 1)} %</b></span>
          <span>{A7.tasa}<b>{d.tasa == null ? "—" : `${fmtDecimal(d.tasa, 2)} %`}</b></span>
        </div>
      </div>
    );
  }

  let controles = null;
  if (paso === 0) controles = <Boton onClick={() => setAire(true)} disabled={aire} data-subir-aire>{A7.subir}</Boton>;
  if (paso === 2 || paso === 3) {
    const min = paso === 3 ? 2021 : 2016, max = paso === 3 ? 2023 : 2026;
    const v = Math.max(min, Math.min(max, anio));
    controles = <Deslizador id="anio" etiqueta={A7.anio} min={min} max={max} paso={1} valor={v}
      onCambio={(x) => { setAnio(x); setRecorridos((s) => new Set(s).add(x)); }} formato={String} extremos={[String(min), String(max)]} colorRelleno={MONETARIA} />;
  }

  const puede = paso === 0 ? fresca : paso === 2 ? recorridos.size >= 4 : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PM}{CSS}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
