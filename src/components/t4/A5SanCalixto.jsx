/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 «SAN CALIXTO» · EL PAR QUE EL ESTUDIANTE IGUALA (Hanayama).
 *
 * Carril de la Célula D. Portado del prototipo congelado (scratchpad hanayama/
 * sitio/src/components/t4r/A5R.jsx), con los textos de Katsumi en los datos
 * (src/data/contabilidadT4A5.js). Arriba, el par («el banco» y «la empresa»).
 * El cuerpo de cada pantalla, según su `modo`:
 *   · par (P0 y P6): los dos saldos; en P6, iguales y con el «=»
 *   · lado (P1 y P2, pregunta): cada partida a «Más» o a «Menos». Con el
 *     acierto, la cifra entra en su sección y el saldo de ese lado cuenta
 *     hasta su valor nuevo; con el error, «✗ No va aquí» en la sección, nada se
 *     escribe y «Incorrecto.» solo para el lector. El «=» es un signo, no un
 *     acierto: aparece cuando los dos saldos son iguales, y no antes
 *   · asienta (P3, pregunta): ¿se asienta el cheque sin cobrar?
 *   · asientos (P4): cinco botones, un asiento a la vez, con la línea que dice
 *     de qué nota es (Katsumi, decisión 8); el tablero no se mueve
 *   · mayor (P5): las cinco notas entran al mayor, una cada 350 ms (con
 *     movimiento reducido, de una vez), y el saldo llega al conciliado
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { C, Mensaje, Marca, cifra } from "./comun.jsx";
import { Tablero, Mayor, Par } from "./tablero.jsx";
import { Fig, Chips, LectorError, useReducido } from "./aprender.jsx";
import { DEBE, HABER, MARCA } from "../../data/contabilidadT4.js";
import {
  EXTRACTO, LIBROS, MAS, MENOS, PARTIDAS_BANCO, PARTIDAS_EMPRESA, saldoTrasA5, CONCILIADO, CONCILIADO_BANCO, CHEQUE_P3,
  ASIENTOS_A5, SALDO_MAYOR, PASO_MAYOR_MS, FIGURA_A5 as F,
} from "../../data/contabilidadT4A5.js";

export const CSS_A5 = `
.t4a5-t { display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 1px solid ${C.texto}; border-radius: 8px; padding: 6px 12px; min-height: 74px; }
.t4a5-t > span:first-child { font-size: 14px; line-height: 20px; min-width: 0; }
.t4a5-t > span:last-child { font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4a5-s { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4a5-d { position: relative; display: grid; gap: 2px; align-content: start; min-height: 44px; padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(248,249,250,0.30); background: transparent; color: ${C.texto}; text-align: right; font: inherit; cursor: pointer; min-width: 0; }
.t4a5-d:disabled { cursor: default; }
.t4a5-d[data-marca="mal"] { border: 2px solid ${C.error}; padding: 5px 7px; background: rgba(248,249,250,0.08); }
.t4a5-d > b { justify-self: start; font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .04em; }
.t4a5-d span.l { font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto2}; }
.t4a5-d span.l.f { color: ${C.texto}; font-weight: 600; }
.t4a5-nota { margin: 0; min-height: 44px; font-size: 14px; line-height: 22px; }
.t4a5-n { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; }
`;

const NOMBRE = "el-par";

/* P0 y P6 · el par: los dos saldos. */
function SoloPar({ p }) {
  const v = p.igualado ? [CONCILIADO, CONCILIADO] : [EXTRACTO, LIBROS];
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Par izq={{ r: F.banco, v: v[0] }} der={{ r: F.empresa, v: v[1] }} igual={v[0] === v[1]} />
    </Fig>
  );
}

/* P1 y P2 · un lado: cada partida a «Más» o a «Menos»; el saldo de ese lado cuenta. */
function Lado({ p, onAcierto }) {
  const banco = p.lado === "banco";
  const partidas = banco ? PARTIDAS_BANCO : PARTIDAS_EMPRESA;
  const [i, setI] = useState(0);
  const [mal, setMal] = useState(null);
  const [errores, setErrores] = useState(0);
  const x = partidas[i];
  const fin = !x;
  useEffect(() => { if (fin) onAcierto?.(); }, [fin]); // eslint-disable-line react-hooks/exhaustive-deps
  const puestas = partidas.slice(0, i);
  const ultima = puestas[puestas.length - 1];
  const saldo = saldoTrasA5(banco ? EXTRACTO : LIBROS, partidas, i);
  const elegir = (s) => {
    if (!x) return;
    if (s === x.va) { setMal(null); setI(i + 1); } else { setMal(s); setErrores((n) => n + 1); }
  };
  /* La sección reserva los renglones del lado más cargado: el tope de lo de abajo no cambia. */
  const reservar = Math.max(...[MAS, MENOS].map((s) => partidas.filter((y) => y.va === s).length));
  const seccion = (s, rotulo) => (
    <button type="button" className="t4a5-d" data-destino={s} data-marca={mal === s ? "mal" : undefined} disabled={fin} onClick={() => elegir(s)}
      aria-label={`${F.seccion(rotulo, p.lado)}${mal === s ? `: ${MARCA.mal[1]}` : ""}`}>
      <b>{rotulo}</b>
      <span style={{ display: "grid", gap: "2px", minHeight: `${reservar * 22}px`, alignContent: "start" }}>
        {puestas.filter((y) => y.va === s).map((y) => <span key={y.id} className={`l t4r-nueva${y === ultima ? " f" : ""}`} data-linea={y.id}>{cifra(y.monto)}</span>)}
      </span>
      {mal === s && <span style={{ display: "flex", justifyContent: "flex-end" }}><Marca marca="mal" /></span>}
    </button>
  );
  const izq = banco ? { r: F.banco, v: saldo, foco: i > 0 } : { r: F.banco, v: CONCILIADO_BANCO };
  const der = banco ? { r: F.empresa, v: LIBROS } : { r: F.empresa, v: saldo, foco: i > 0 };
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Par izq={izq} der={der} igual={izq.v === der.v} />
      <div className="t4a5-t" data-tarjeta-partida={x?.id ?? "fin"} aria-live="polite">
        {x ? <><span>{x.texto}</span><span>{cifra(x.monto)}</span></> : <span>{F.fin}</span>}
      </div>
      <div className="t4a5-s">{seccion(MAS, F.mas)}{seccion(MENOS, F.menos)}</div>
      <LectorError error={Boolean(mal)} clave={errores} />
    </Fig>
  );
}

/* P3 · ¿se asienta el cheque sin cobrar? */
function Asienta({ p, onAcierto }) {
  const [e, setE] = useState(null);
  const ok = e === p.correcta;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt}>
        <div className="t4a5-t" data-tarjeta-partida={CHEQUE_P3.id}><span>{CHEQUE_P3.texto}</span><span>{cifra(CHEQUE_P3.monto)}</span></div>
        <Chips opciones={p.opciones} elegida={e} correcta={p.correcta} onElegir={setE} rotulo={(o) => F.chips[o]} etiqueta={F.asienta} />
      </Fig>
      {e && <Mensaje key={e} ok={ok} texto={ok ? p.acierto : p.errores[e]} />}
    </>
  );
}

/* P4 · los cinco asientos, uno a la vez, con la línea que dice de qué nota es. */
function Asientos({ p }) {
  const [k, setK] = useState(0);
  const a = ASIENTOS_A5[k];
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <div className="t4a5-n" role="group" aria-label={F.asientos}>
        {ASIENTOS_A5.map((x, i) => <button key={x.id} type="button" className="t4r-tab" data-control={i + 1} aria-pressed={k === i} onClick={() => setK(i)}>{i + 1}</button>)}
      </div>
      <p className="t4a5-nota" data-nota-asiento={a.id} aria-live="polite">{a.linea}</p>
      <Tablero key={a.id} cuentas={a.cuentas} totales={{ [a.debe]: { [DEBE]: a.monto }, [a.haber]: { [HABER]: a.monto } }} activo={false}
        recien={[`${a.debe}:${DEBE}`, `${a.haber}:${HABER}`]} ancho={70} etiqueta={F.tablero} />
    </Fig>
  );
}

/* P5 · el mayor: asentar las cinco notas y llegar al saldo conciliado. */
function ElMayor({ p }) {
  const reducido = useReducido();
  const [n, setN] = useState(0);
  const reloj = useRef(0);
  useEffect(() => () => clearInterval(reloj.current), []);
  const total = ASIENTOS_A5.length;
  const asentar = () => {
    if (reducido) { setN(total); return; }
    let k = 0;
    reloj.current = setInterval(() => { k += 1; setN(k); if (k >= total) clearInterval(reloj.current); }, PASO_MAYOR_MS);
  };
  const hechos = ASIENTOS_A5.slice(0, n);
  const ultimo = hechos[hechos.length - 1];
  const debe = [{ id: "saldo", r: F.saldo, v: cifra(LIBROS) }, ...hechos.filter((a) => a.debe === "bancos").map((a) => ({ id: a.id, v: cifra(a.monto), foco: a === ultimo }))];
  const haber = hechos.filter((a) => a.haber === "bancos").map((a) => ({ id: a.id, v: cifra(a.monto), foco: a === ultimo }));
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <button type="button" className="t4r-btn2" data-accion="asentar" aria-disabled={n ? "true" : undefined} onClick={n ? undefined : asentar}>{F.asentar}</button>
      <Mayor titulo={F.mayor} debe={debe} haber={haber} reserva={3} saldo={n === total ? cifra(SALDO_MAYOR) : null} rotuloSaldo={F.saldo} />
    </Fig>
  );
}

const MODOS = { par: SoloPar, lado: Lado, asienta: Asienta, asientos: Asientos, mayor: ElMayor };

export function CuerpoA5({ p, onAcierto }) {
  const M = MODOS[p.modo];
  return <M p={p} onAcierto={onAcierto} />;
}
