/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 «SAN CALIXTO» · EL PAR QUE EL ESTUDIANTE IGUALA (Hanayama).
 *
 * Carril de la Célula D. Portado del prototipo congelado (scratchpad hanayama/
 * sitio/src/components/t4r/A5R.jsx), con los textos de Katsumi en los datos
 * (src/data/contabilidadT4A5.js). Arriba, el par («el banco» y «la empresa»).
 * El cuerpo de cada pantalla, según su `modo`:
 *   · saldo (P0, pregunta; lote B §5.3): el par con «difieren en…» al pie,
 *     el caso y «¿Cuál es el saldo verdadero?»; con el acierto, el tercer
 *     lugar del par, «saldo verdadero: ?», que P2 llena cuando sale el «=»
 *   · lado (P1 y P2, pregunta): cada partida a «Más» o a «Menos». Con el
 *     acierto, la cifra entra en su sección y el saldo de ese lado cuenta
 *     hasta su valor nuevo; con el error, «✗ No va aquí» en la sección, nada se
 *     escribe y «Incorrecto.» solo para el lector. El «=» es un signo, no un
 *     acierto: aparece cuando los dos saldos son iguales, y no antes
 *   · asienta (P3, pregunta): ¿se asienta el cheque sin cobrar?
 *   · asientos (P4, pregunta; lote B §5.5): una nota a la vez; se decide de
 *     qué lado va Bancos, y el asiento se escribe con su contrapartida
 *   · mayor (P5, la última): las cinco notas entran al mayor, una cada 350 ms
 *     (con movimiento reducido, de una vez), el saldo llega al conciliado y,
 *     debajo, el par igualado y la frase de cierre
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { C, Mensaje, Marca, cifra } from "./comun.jsx";
import { Tablero, Mayor, Par } from "./tablero.jsx";
import { Fig, Chips, LectorError, useReducido } from "./aprender.jsx";
import { DEBE, HABER, MARCA } from "../../data/contabilidadT4.js";
import {
  MAS, MENOS, saldoTrasA5, PASO_MAYOR_MS, ESPERA_NOTA_MS, DATOS_A5,
} from "../../data/contabilidadT4A5.js";
import { useDatosCaso } from "./caso.js";

/* D8: las cifras, las partidas, los asientos y los rótulos del caso en curso (1 o el B). */
const useCasoA5 = () => useDatosCaso(DATOS_A5);

export const CSS_A5 = `
.t4a5-t { display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 1px solid ${C.texto}; border-radius: 8px; padding: 6px 12px; min-height: 74px; }
.t4a5-t > span:first-child { font-size: 14px; line-height: 20px; min-width: 0; }
.t4a5-t > span:last-child { font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4a5-s { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4a5-d { position: relative; display: grid; gap: 2px; align-content: start; min-height: 44px; padding: 6px 8px; border-radius: 8px; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto}; text-align: right; font: inherit; cursor: pointer; min-width: 0; }
.t4a5-d:disabled { cursor: default; }
.t4a5-d[data-marca="mal"] { border: 2px solid ${C.error}; padding: 5px 7px; }
.t4a5-d > b { justify-self: start; font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .04em; }
.t4a5-d span.l { font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto2}; }
.t4a5-d span.l.f { color: ${C.texto}; font-weight: 600; }
.t4a5-nota { margin: 0; min-height: 44px; font-size: 14px; line-height: 22px; }
/* Lote B, §5.5: la tarjeta de la nota, con 2 renglones reservados, su contador y su monto. */
.t4a5-nt { display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 1px solid ${C.texto}; border-radius: 8px; padding: 6px 12px; }
.t4a5-nt > span:first-child { display: grid; gap: 2px; min-width: 0; }
.t4a5-nt .l { font-size: 14px; line-height: 20px; min-height: 40px; }
.t4a5-nt .c { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; }
.t4a5-nt > span:last-child { font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
`;

const NOMBRE = "el-par";

/* P0 y P6 · el par: los dos saldos. */
/*
 * P0 · ¿cuál es el saldo verdadero? (lote B, §2.1 y §5.3) El par, con
 * «difieren en…» al pie; el caso debajo; la pregunta con tres opciones. Con el
 * acierto, el par abre su tercer lugar, «saldo verdadero: ?».
 */
function Saldo({ p, onAcierto }) {
  const { EXTRACTO, LIBROS, DIFERENCIA_INICIAL, F } = useCasoA5();
  const [e, setE] = useState(null);
  const ok = e === p.correcta;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt}>
        <Par documentos izq={{ r: F.banco, v: EXTRACTO }} der={{ r: F.empresa, v: LIBROS }} pie={F.difieren(cifra(DIFERENCIA_INICIAL))}
          verdadero={ok ? { rotulo: F.verdadero, v: null, lector: F.verdaderoLector } : null} />
        <p className="t4r-p" data-caso>{p.caso}</p>
        <p className="t4r-rotacc" data-rotulo-pregunta>{p.rotuloPregunta}</p>
        <Chips opciones={p.opciones} elegida={e} correcta={p.correcta} onElegir={setE} rotulo={(o) => F.opcionesSaldo[o]} etiqueta={p.rotuloPregunta} palabras />
      </Fig>
      {e && <Mensaje key={e} ok={ok} texto={ok ? p.acierto : p.errores[e]} />}
    </>
  );
}

/* P1 y P2 · un lado: cada partida a «Más» o a «Menos»; el saldo de ese lado cuenta. */
function Lado({ p, onAcierto }) {
  const { EXTRACTO, LIBROS, PARTIDAS_BANCO, PARTIDAS_EMPRESA, CONCILIADO_BANCO, F } = useCasoA5();
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
      aria-label={`${F.seccion(rotulo, p.lado)}${mal === s ? `: ${MARCA.mal}` : ""}`}>
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
      <Par documentos izq={izq} der={der} igual={izq.v === der.v}
        verdadero={{ rotulo: F.verdadero, v: izq.v === der.v ? izq.v : null, lector: F.verdaderoLector }} />
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
  const { CHEQUE_P3, F } = useCasoA5();
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
/*
 * P4 · de qué lado va Bancos (lote B, §5.5): una nota a la vez. Se toca una
 * mitad de Bancos; el toque califica en el acto. Acierto: «Correcto» y el
 * monto, y la contrapartida escribe el monto en su otra mitad; a los 1,4 s, la
 * nota siguiente. Error: «No va aquí», nada se escribe, su mensaje y reintento.
 */
function Asientos({ p, onAcierto }) {
  const { ASIENTOS_A5, F } = useCasoA5();
  const [i, setI] = useState(0);
  const [r, setR] = useState(null);
  const reloj = useRef(0);
  useEffect(() => () => clearTimeout(reloj.current), []);
  const total = ASIENTOS_A5.length;
  const a = ASIENTOS_A5[i];
  const ladoBancos = a.debe === "bancos" ? DEBE : HABER;
  const otraCuenta = a.cuentas.find((c) => c.id !== "bancos");
  const ok = r?.lado === ladoBancos;
  const fin = ok && i === total - 1;
  useEffect(() => { if (fin) onAcierto?.(); }, [fin]); // eslint-disable-line react-hooks/exhaustive-deps
  const elegir = (cuenta, lado) => {
    if (cuenta !== "bancos" || ok) return;
    setR({ lado });
    if (lado === ladoBancos && i < total - 1) reloj.current = setTimeout(() => { setR(null); setI((x) => x + 1); }, ESPERA_NOTA_MS);
  };
  const totales = ok ? { bancos: { [ladoBancos]: a.monto }, [otraCuenta.id]: { [ladoBancos === DEBE ? HABER : DEBE]: a.monto } } : {};
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt}>
        <div className="t4a5-nt" data-tarjeta-nota={a.id} aria-live="polite">
          <span><span className="l">{a.linea}</span><span className="c">{F.contadorNota(i + 1, total)}</span></span>
          <span>{cifra(a.monto)}</span>
        </div>
        <Tablero key={a.id} cuentas={[a.cuentas.find((c) => c.id === "bancos"), otraCuenta]} totales={totales} activo={!ok} activas={["bancos"]}
          marcas={r ? { [`bancos:${r.lado}`]: ok ? "bien" : "mal" } : {}} recien={ok ? [`bancos:${ladoBancos}`, `${otraCuenta.id}:${ladoBancos === DEBE ? HABER : DEBE}`] : []}
          onElegir={elegir} etiqueta={F.tablero} />
      </Fig>
      {r && !ok && <Mensaje key={`${a.id}-${r.lado}`} ok={false} texto={p.error} />}
    </>
  );
}

/* P5 · el mayor: asentar las cinco notas y llegar al saldo conciliado. */
function ElMayor({ p, onCierre }) {
  const { LIBROS, CONCILIADO, ASIENTOS_A5, SALDO_MAYOR, F } = useCasoA5();
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
  /* Lote B, capa 4: con las cinco asentadas, bajo el mayor el par igualado y la frase de cierre. */
  useEffect(() => { if (n === total) onCierre?.(); }, [n === total]); // eslint-disable-line react-hooks/exhaustive-deps
  const hechos = ASIENTOS_A5.slice(0, n);
  const ultimo = hechos[hechos.length - 1];
  const debe = [{ id: "saldo", r: F.saldo, v: cifra(LIBROS) }, ...hechos.filter((a) => a.debe === "bancos").map((a) => ({ id: a.id, v: cifra(a.monto), foco: a === ultimo }))];
  const haber = hechos.filter((a) => a.haber === "bancos").map((a) => ({ id: a.id, v: cifra(a.monto), foco: a === ultimo }));
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <button type="button" className={`t4r-btn2${n ? " t4r-oculto" : ""}`} data-accion="asentar" data-usado={n ? "" : undefined} onClick={n ? undefined : asentar}>{F.asentar}</button>
      <Mayor titulo={F.mayor} debe={debe} haber={haber} reserva={3} saldo={n === total ? cifra(SALDO_MAYOR) : null} rotuloSaldo={F.saldo} />
      {/* El par igualado reserva su sitio (visibility), así que nada salta al aparecer. */}
      <div style={{ visibility: n === total ? "visible" : "hidden" }} aria-hidden={n === total ? undefined : "true"} data-par-final={n === total ? "" : undefined}>
        <Par documentos izq={{ r: F.banco, v: CONCILIADO }} der={{ r: F.empresa, v: CONCILIADO }} igual={n === total} />
      </div>
    </Fig>
  );
}

const MODOS = { saldo: Saldo, lado: Lado, asienta: Asienta, asientos: Asientos, mayor: ElMayor };

export function CuerpoA5(props) {
  const M = MODOS[props.p.modo];
  return <M {...props} />;
}
