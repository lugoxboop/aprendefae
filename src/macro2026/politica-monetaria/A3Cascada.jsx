/*
 * A3 · La cascada de vasos (pm26-a3-cascada, Aprender).
 * Especificación de Gen, t4 §2 A3. El grifo ilustrado (Gemini, 25-nov) llena el primer
 * vaso con 1.000; la franja gris del fondo es el encaje; el resto se vierte al
 * vaso siguiente. P3 «Siguiente préstamo» suma un vaso (900, 810, 729…), con
 * la fórmula del profesor al pie. P4 «Ver toda la cascada»: el contador llega
 * a 1.000 / encaje. P5 el deslizador del encaje (5 %–50 %, paso 5).
 */
import { useState } from "react";
import { MarcoAprender, Boton, Deslizador, usePasos } from "../comun/ui.jsx";
import { fmtEntero } from "../comun/modelo-da.js";
import { Cascada, CSS_PM, MONETARIA, depositos } from "./comun-pm.jsx";
import { A3, APRENDER, totalCascada, ESCENAS } from "./textos.js";

export const ID = "pm26-a3-cascada";
const TEXTOS = APRENDER[ID];
const TODOS = 7;

export default function A3Cascada({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [prestamos, setPrestamos] = useState(1);
  const [toda, setToda] = useState(false);
  const [encaje, setEncaje] = useState(A3.encajeInicial);

  const r = paso === 4 ? encaje : A3.encajeInicial;
  const visibles = paso >= 3 && (toda || paso === 4) ? TODOS : paso === 2 ? prestamos + 1 : 1;
  const lista = depositos(r, Math.min(visibles, 4)).map((d) => fmtEntero(d));
  const total = paso >= 3 && (toda || paso === 4) ? totalCascada(r) : depositos(r, visibles).reduce((a, b) => a + b, 0);

  const figura = (
    <div>
      <Cascada encaje={r} visibles={visibles} conEncaje={paso >= 1} grifo />
      <p className="pm26-cadena" data-cadena>
        {lista.map((x, k) => <span key={k}>{k > 0 ? "→ " : ""}{A3.personas[k]}·{A3.banco} {k + 1}: {x}</span>)}
        {visibles > 4 && <span>→ …</span>}
      </p>
      {paso >= 1 && (
        <p className="da26-rotulo" style={{ textAlign: "center", margin: "2px 0 0", fontSize: 13 }} data-rotulo-encaje>
          <span style={{ display: "inline-block", width: 12, height: 12, background: "#8e94a0", verticalAlign: "-1px", marginRight: 4 }} />
          {A3.encaje} {r} %
        </p>
      )}
      {paso >= 2 && (
        <div className="pm26-contador" style={{ marginTop: 8 }} data-contador-depositos={Math.round(total)}>
          <span>{A3.contador}</span><b className="da26-mono">{paso === 3 && toda ? "≈ " : ""}{fmtEntero(total)}</b>
        </div>
      )}
      {paso === 2 && <p className="da26-mono" style={{ textAlign: "center", margin: "8px 0 0", fontSize: 15, color: MONETARIA, fontWeight: 700 }} data-formula>{A3.formula}</p>}
    </div>
  );

  let controles = null;
  if (paso === 2) controles = <Boton onClick={() => setPrestamos((p) => Math.min(TODOS - 1, p + 1))} disabled={prestamos >= TODOS - 1} data-prestamo>{A3.siguiente}</Boton>;
  if (paso === 3) controles = <Boton onClick={() => setToda(true)} disabled={toda} data-toda>{A3.toda}</Boton>;
  if (paso === 4) controles = <Deslizador id="encaje" etiqueta={A3.encaje} min={5} max={50} paso={5} valor={encaje} onCambio={setEncaje} formato={(x) => `${x} %`} extremos={["5 %", "50 %"]} colorRelleno={MONETARIA} />;

  const puede = paso === 2 ? prestamos >= 3 : paso === 3 ? toda : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PM}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
