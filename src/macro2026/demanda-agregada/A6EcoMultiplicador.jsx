/*
 * A6 · El eco del multiplicador (da26-a6-eco-multiplicador, Aprender, sin FP).
 * Especificación de Gen §2 A6. El gasto como un grito en un cañón: cada eco es
 * un anillo más pequeño (c(1 − t) del anterior) y una barra apila lo que suma
 * cada eco. Cifras del modelo común (comun/modelo-da.js).
 */
import { useState } from "react";
import { COMPONENTES, INK, INK_2, BORDE, FONDO, SUPERFICIE_2 } from "../comun/colores-da.js";
import { BASE, ecos, fmtCorto, fmtDecimal, fmtEco, fmtEntero, fmtLimpio, modelo, multiplicador, pendiente } from "../comun/modelo-da.js";
import { Boton, Deslizador, MarcoAprender, Retro, useAncho, usePasos } from "../comun/ui.jsx";
import { APRENDER, RETRO_A6_P1 } from "./textos.js";

export const ID = "da26-a6-eco-multiplicador";
const TX = APRENDER[ID];
const QUIEN = ["Cobran los obreros", "Cobra la tienda", "Cobra el transportador", "Cobra la panadería", "Cobra el taller", "Cobra el mercado"];
const N_ECOS = 14;

function Eco({ p, mostrados, marcar = false, gasto = 100 }) {
  const [ref, W] = useAncho(262);
  const H = 214;
  const lista = ecos(p, gasto, N_ECOS);
  const total = gasto * multiplicador(p);
  const visibles = lista.slice(0, mostrados);
  const suma = mostrados >= N_ECOS ? total : visibles.reduce((s, v) => s + v, 0);
  const barX = W - 64, barW = 34, barBase = H - 22, barAlto = 168;
  const esc = barAlto / Math.max(250, total);
  let y = barBase;
  const k = pendiente(p);
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Ecos del gasto: suman ${fmtCorto(suma)}`} data-ecos={mostrados} data-suma={Math.round(suma * 10) / 10}>
        {/* el cañón y la boca que grita */}
        <circle cx={24} cy={96} r={7} fill={COMPONENTES.G.color} />
        {visibles.slice(0, 6).map((v, j) => {
          const r = 20 + j * Math.max(15, (barX - 80) / 6);
          return (
            <g key={j} className="da26-entra" data-anillo={j}>
              <path d={`M${24 + r * Math.cos(-0.9)} ${96 + r * Math.sin(-0.9)} A ${r} ${r} 0 0 1 ${24 + r * Math.cos(0.9)} ${96 + r * Math.sin(0.9)}`}
                fill="none" stroke={j === 0 ? COMPONENTES.G.color : INK} strokeWidth={1 + (v / gasto) * 6} opacity={0.35 + 0.65 * (v / gasto)} strokeLinecap="round" />
              <text x={24 + r * Math.cos(j % 2 ? 1.05 : -1.05)} y={96 + r * Math.sin(j % 2 ? 1.05 : -1.05) + (j % 2 ? 16 : -6)} fontSize={12} fill={INK} textAnchor="middle" className="da26-mono">{fmtEco(v)}</text>
            </g>
          );
        })}
        {mostrados > 0 && mostrados <= QUIEN.length && (
          <text x={4} y={12} fontSize={12} fill={INK_2} data-quien>{QUIEN[mostrados - 1]}</text>
        )}
        {marcar && mostrados > 1 && (
          <text x={24 + 35} y={150} fontSize={12} fill={INK} fontWeight={700}>× {fmtLimpio(k, 2)} = c(1 − t)</text>
        )}
        {/* la barra que apila */}
        <rect x={barX} y={barBase - barAlto} width={barW} height={barAlto} fill={FONDO} stroke={BORDE} />
        {visibles.map((v, j) => {
          const h = v * esc;
          y -= h;
          return <rect key={j} className="da26-entra" x={barX + 2} y={y} width={barW - 4} height={Math.max(0.5, h - 1)} fill={j === 0 ? COMPONENTES.G.color : INK} opacity={j === 0 ? 1 : 0.55 + 0.4 * (j % 2)} />;
        })}
        {mostrados >= N_ECOS && <rect x={barX + 2} y={barBase - total * esc} width={barW - 4} height={Math.max(0, (total - visibles.reduce((s, v) => s + v, 0)) * esc)} fill={INK} opacity={0.55} />}
        <text x={barX + barW / 2} y={barBase + 16} fontSize={12} fill={INK} textAnchor="middle" className="da26-mono" fontWeight={700} data-suma-texto>{fmtCorto(suma)}</text>
        <text x={barX + barW / 2} y={barBase - barAlto - 6} fontSize={13} fill={INK} textAnchor="middle" fontWeight={700} data-por>× {fmtDecimal(multiplicador(p), 1)}</text>
      </svg>
    </div>
  );
}

export default function A6EcoMultiplicador({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(6);
  const [apuesta, setApuesta] = useState(null);
  const [mostrados, setMostrados] = useState(1);
  const [c, setC] = useState(BASE.c);
  const [tPct, setT] = useState(25);
  const [c5, setC5] = useState(BASE.c);
  const [abierto, setAbierto] = useState(false);
  const p0 = modelo();

  let figura;
  let controles = null;
  let puede = true;
  if (paso === 0) {
    figura = (
      <svg viewBox="0 0 260 120" width="100%" role="img" aria-label="Una vía en obra con más 100 del Gobierno">
        <path d="M10 110 L110 30 H150 L250 110 Z" fill={SUPERFICIE_2} stroke={BORDE} strokeWidth={2} />
        <path d="M130 36v12M130 60v16M130 88v20" stroke={INK} strokeWidth={4} />
        <path d="M200 100 l12 -40 l12 40 z" fill="none" stroke={COMPONENTES.G.color} strokeWidth={3} />
        <rect x={20} y={16} width={64} height={30} rx={8} fill={COMPONENTES.G.color} />
        <text x={52} y={37} textAnchor="middle" fontSize={18} fontWeight={700} fill="#121418" className="da26-mono">+100</text>
        <text x={92} y={36} fontSize={13} fill={INK}>G</text>
      </svg>
    );
    controles = (
      <>
        <div className="da26-fila" role="group" aria-label="Tu apuesta">
          {[["igual", "Sube 100"], ["mas", "Sube más de 100"], ["menos", "Sube menos de 100"]].map(([k, r]) => (
            <Boton key={k} aria-pressed={apuesta === k} disabled={apuesta != null} onClick={() => setApuesta(k)} data-apuesta={k} style={{ flex: "1 1 40%" }}>{r}</Boton>
          ))}
        </div>
        {apuesta && <Retro estado={apuesta === "mas" ? "bien" : "mal"}>{RETRO_A6_P1[apuesta]}</Retro>}
      </>
    );
    puede = apuesta != null;
  } else if (paso === 1 || paso === 2) {
    figura = <Eco p={p0} mostrados={mostrados} marcar={paso === 2} />;
    controles = paso === 1 && (
      <div className="da26-fila">
        <Boton onClick={() => setMostrados((m) => Math.min(N_ECOS, m + 1))} disabled={mostrados >= N_ECOS} data-otro-eco style={{ flex: 1 }}>Otro eco</Boton>
        <Boton onClick={() => setMostrados(N_ECOS)} disabled={mostrados >= N_ECOS} data-ver-todos style={{ flex: 1 }}>Ver todos</Boton>
      </div>
    );
    if (paso === 2) {
      figura = (
        <>
          {figura}
          <p className="da26-mono" style={{ textAlign: "center", fontSize: 17, margin: "6px 0 0" }} data-formula>1 / [1 − c(1 − t)] = {fmtDecimal(multiplicador(p0), 1)}</p>
        </>
      );
    }
  } else if (paso === 3) {
    const p = modelo({ c, t: tPct / 100 });
    figura = <Eco p={p} mostrados={N_ECOS} />;
    controles = (
      <>
        <Deslizador id="a6-c" etiqueta="c" min={0.5} max={0.95} paso={0.05} valor={c} onCambio={(v) => setC(Math.round(v * 100) / 100)} formato={(v) => fmtDecimal(v, 2)} />
        <Deslizador id="a6-t" etiqueta="t" min={0} max={40} valor={tPct} onCambio={setT} formato={(v) => `${v} %`} />
      </>
    );
  } else if (paso === 4) {
    const p = modelo({ c: c5 });
    const Marcador = ({ rotulo, valor, id }) => (
      <div style={{ flex: 1, border: `1px solid ${BORDE}`, borderRadius: 12, padding: "10px 8px", textAlign: "center", background: FONDO }} data-marcador={id}>
        <div style={{ fontSize: 13, color: INK_2, lineHeight: 1.3 }}>{rotulo}</div>
        <div className="da26-mono" style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{valor}</div>
      </div>
    );
    figura = (
      <div style={{ display: "flex", gap: 8 }}>
        <Marcador id="inclinacion" rotulo="Inclinación c(1 − t)" valor={fmtLimpio(pendiente(p), 2)} />
        <Marcador id="multiplicador" rotulo="Multiplicador" valor={fmtDecimal(multiplicador(p), 1)} />
      </div>
    );
    controles = <Deslizador id="a6-c5" etiqueta="c" min={0.5} max={0.95} paso={0.05} valor={c5} onCambio={(v) => setC5(Math.round(v * 100) / 100)} formato={(v) => fmtDecimal(v, 2)} />;
  } else {
    const L = ({ k, children }) => <span style={{ color: COMPONENTES[k].color }}>{children}</span>;
    figura = (
      <div style={{ textAlign: "center", font: "600 18px/1.6 var(--planck-font-mono, monospace)" }} data-formula>
        <div>Y₀ = multiplicador ×</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          (<Boton aria-pressed={abierto} onClick={() => setAbierto((v) => !v)} data-termino="Abar" aria-label="Ā: toca para desplegarlo"><span className="da26-mono">Ā</span></Boton> − b·i)
        </div>
        {abierto && (
          <div className="da26-entra" data-despliegue style={{ fontSize: 16, marginTop: 6 }}>
            Ā = <L k="C">C̄</L> + <L k="C">c·TR</L> + <L k="I">Ī</L><br />+ <L k="G">G</L> + <L k="XN">XN</L>
            <div className="da26-rotulo" style={{ marginTop: 4 }}>{fmtEntero(BASE.Cbar)} + {fmtEntero(BASE.c * BASE.TR)} + {fmtEntero(BASE.Ibar)} + {fmtEntero(BASE.G)} + {fmtEntero(BASE.XN)} = 590</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <MarcoAprender
      id={ID} paso={paso} total={6} texto={TX[paso]} figura={figura} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={onTerminar}
    />
  );
}
