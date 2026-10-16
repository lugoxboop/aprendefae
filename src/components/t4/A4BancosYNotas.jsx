/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A4 «BANCOS Y NOTAS DEL BANCO» · BANCOS Y LAS DOS LIBRETAS (Hanayama).
 *
 * Carril de la Célula D. Portado del prototipo congelado (scratchpad hanayama/
 * sitio/src/components/t4r/A4R.jsx), con los textos de Katsumi en los datos
 * (src/data/contabilidadT4A4.js). El cuerpo de cada pantalla, según su `modo`:
 *   · cuenta (P0): «Consignar» sube Bancos por el debe; «Girar un cheque» la
 *     baja por el haber
 *   · extracto (P1): llegan la nota débito y la nota crédito a la libreta del
 *     banco; la de la empresa «todavía no lo sabe»
 *   · mandar (P2, pregunta): siete movimientos a «Sube» o «Baja». Con el
 *     acierto, su nombre entra al mayor y llega el siguiente; con el error, ✗
 *     en el botón tocado, nada se escribe y «Incorrecto.» solo para el lector.
 *     Con los siete, «Sube» y «Baja» desaparecen (corte de Yujiro)
 *   · quien (P3, pregunta): con el acierto, el renglón del cheque aparece en la
 *     libreta de la empresa (antes no existe: PH8-2)
 *   · causas (P4): seis botones, una causa a la vez
 *   · conciliacion (P5) y quieta (P6): las libretas, para leer
 * Las libretas: renglones alineados de 64 px; donde una no tiene lo que la
 * otra, «todavía no / lo sabe». Sus rótulos van completos, en renglones fijos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useState } from "react";
import { C, Mensaje, LineaMarcas } from "./comun.jsx";
import { Tablero, Mayor } from "./tablero.jsx";
import { Fig, Chips, LectorError } from "./aprender.jsx";
import { DEBE, HABER, MARCA } from "../../data/contabilidadT4.js";
import {
  CONSIGNACION, CHEQUE_PROVEEDOR, MOVIMIENTOS_A4, RESERVA_MAYOR_A4, RENGLONES_EXTRACTO, RENGLON_CHEQUE_30, CAUSAS_A4,
  RENGLONES_CONCILIACION, FIGURA_A4 as F,
} from "../../data/contabilidadT4A4.js";

export const CSS_A4 = `
.t4lt { display: grid; gap: 0; border: 1px solid ${C.neutro}; border-radius: 10px; overflow: hidden; }
.t4lt-f { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.t4lt-f > div { min-width: 0; padding: 6px 10px; }
.t4lt-f > div + div { border-left: 1px solid ${C.neutro}; }
.t4lt-cab > div { display: grid; border-bottom: 1px solid rgba(248,249,250,0.22); }
.t4lt-cab > div > span:first-child { font: 600 13px/1.3 "Sora", "Inter", sans-serif; white-space: nowrap; }
.t4lt-cab > div > span + span { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4lt-r > div { display: grid; align-content: center; min-height: 64px; border-bottom: 1px solid rgba(248,249,250,0.10); }
.t4lt-r > div > span { white-space: nowrap; font-size: 13px; line-height: 1.35; }
.t4lt-r > div[data-tinta] { box-shadow: inset 2px 0 0 ${C.neutro}; }
.t4lt-r > div[data-tinta] > span:first-child { font-weight: 600; }
.t4lt-r > div[data-tinta][data-luz] { box-shadow: inset 2px 0 0 ${C.texto}; }
.t4lt-r > div:not([data-tinta]) > span { color: ${C.texto2}; font-size: 12px; }
.t4lt-r > div[data-tinta] > span.e { font-size: 12px; color: ${C.texto2}; font-weight: 500; }
.t4a4-c { display: grid; gap: 2px; align-content: center; border: 1px solid ${C.texto}; border-radius: 8px; padding: 8px 12px; min-height: 80px; }
.t4a4-c > span { font-size: 15px; line-height: 22px; overflow-wrap: anywhere; }
.t4a4-c > span + span { font-size: 12px; color: ${C.texto2}; line-height: 1.3; }
.t4a4-lado[data-marca="mal"] { border: 2px solid ${C.error}; }
.t4a4-lado { display: flex; align-items: center; justify-content: center; }
.t4a4-causas { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4px; }
`;

const NOMBRE = "libretas";

/*
 * Las dos libretas. renglones: [{ id, emp: { t: [..], e } | null, ban: {...} | null }];
 * `reserva`: renglones vacíos (el alto no cambia); `sub`: los subtítulos (solo en P5).
 */
function Libretas({ renglones, reserva = 0, sub = false, luz = false }) {
  const celda = (x, lado) => (x
    ? (
      <div data-tinta="" data-luz={luz ? "" : undefined} className="t4r-nueva" data-linea-libreta={x.t.join(" ")} data-libreta={lado}>
        {x.t.map((t) => <span key={t}>{t}</span>)}
        <span className="e">{x.e}</span>
      </div>
    )
    : <div data-libreta={lado} data-no-sabe=""><span>{F.noSabe[0]}</span><span>{F.noSabe[1]}</span></div>);
  return (
    <div className="t4lt" data-libretas>
      <div className="t4lt-f t4lt-cab">
        <div><span>{F.empresa}</span>{sub && <span>{F.subEmpresa}</span>}</div>
        <div><span>{F.banco}</span>{sub && <span>{F.subBanco}</span>}</div>
      </div>
      {renglones.map((r) => <div key={r.id} className="t4lt-f t4lt-r" data-renglon={r.id}>{celda(r.emp, "empresa")}{celda(r.ban, "banco")}</div>)}
      {Array.from({ length: reserva }, (_, k) => <div key={`v${k}`} className="t4lt-f t4lt-r" aria-hidden="true" data-renglon-vacio=""><div /><div /></div>)}
    </div>
  );
}

/* P0 · Bancos sube y baja: consignar y girar. */
function Cuenta({ p }) {
  const [h, setH] = useState({ consignar: false, girar: false });
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <div className="t4r-par2">
        <button type="button" className="t4r-btn2" data-accion="consignar" aria-disabled={h.consignar ? "true" : undefined} onClick={h.consignar ? undefined : () => setH({ ...h, consignar: true })}>{F.consignar}</button>
        <button type="button" className="t4r-btn2" data-accion="girar" aria-disabled={h.girar ? "true" : undefined} onClick={h.girar ? undefined : () => setH({ ...h, girar: true })}>{F.girar}</button>
      </div>
      <Tablero cuentas={[{ id: "bancos", renglones: [F.mayor] }]}
        totales={{ bancos: { [DEBE]: h.consignar ? CONSIGNACION : 0, [HABER]: h.girar ? CHEQUE_PROVEEDOR : 0 } }}
        activo={false} conMarcas={false} recien={[...(h.consignar ? [`bancos:${DEBE}`] : []), ...(h.girar ? [`bancos:${HABER}`] : [])]} etiqueta={F.tablero} />
    </Fig>
  );
}

/* P1 · llega el extracto: el banco tiene las dos notas; la empresa todavía no lo sabe. */
function Extracto({ p }) {
  const [llego, setLlego] = useState(false);
  const r = llego ? RENGLONES_EXTRACTO : [];
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Libretas renglones={r} reserva={RENGLONES_EXTRACTO.length - r.length} luz />
      <button type="button" className="t4r-btn2" data-accion="extracto" aria-disabled={llego ? "true" : undefined} onClick={llego ? undefined : () => setLlego(true)}>{F.extracto}</button>
    </Fig>
  );
}

/* P2 · ¿sube o baja? Los siete movimientos, uno a la vez. */
function Mandar({ p, onAcierto }) {
  const [i, setI] = useState(0);
  const [mal, setMal] = useState(null);
  const [errores, setErrores] = useState(0);
  const total = MOVIMIENTOS_A4.length;
  const m = MOVIMIENTOS_A4[i];
  const fin = !m;
  useEffect(() => { if (fin) onAcierto?.(); }, [fin]); // eslint-disable-line react-hooks/exhaustive-deps
  const puestos = MOVIMIENTOS_A4.slice(0, i);
  const ultimo = puestos[puestos.length - 1];
  const elegir = (lado) => {
    if (!m) return;
    if (lado === m.va) { setMal(null); setI(i + 1); } else { setMal(lado); setErrores((n) => n + 1); }
  };
  const lineas = (lado) => puestos.filter((x) => x.va === lado).map((x) => ({ id: x.id, v: x.mayor, chico: true, foco: x === ultimo }));
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <div className="t4a4-c" data-tarjeta-mov={m?.id ?? "fin"} aria-live="polite">
        {m ? <><span>{m.texto}</span><span>{F.contador(i + 1, total)}</span></> : <span>{p.fin}</span>}
      </div>
      {!fin && (
        <>
        <div className="t4r-par2">
          {[[DEBE, F.sube], [HABER, F.baja]].map(([lado, t]) => (
            <button key={lado} type="button" className="t4r-btn2 t4a4-lado" data-destino={lado} data-marca={mal === lado ? "mal" : undefined}
              aria-label={mal === lado ? `${t}: ${MARCA.mal}` : undefined} onClick={() => elegir(lado)}>
              <span>{t}</span>
            </button>
          ))}
        </div>
        <LineaMarcas columnas={2} marcas={{ 0: mal === DEBE ? { marca: "mal" } : null, 1: mal === HABER ? { marca: "mal" } : null }} />
        </>
      )}
      <LectorError error={Boolean(mal)} clave={errores} />
      <Mayor titulo={F.mayor} reserva={RESERVA_MAYOR_A4} debe={lineas(DEBE)} haber={lineas(HABER)} />
    </Fig>
  );
}

/* P3 · ¿quién tiene anotado el cheque del 30? Con el acierto aparece su renglón. */
function Quien({ p, onAcierto }) {
  const [e, setE] = useState(null);
  const ok = e === p.correcta;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt}>
        <Libretas renglones={ok ? [RENGLON_CHEQUE_30] : []} reserva={ok ? 0 : 1} luz />
        <Chips opciones={p.opciones} elegida={e} correcta={p.correcta} onElegir={setE} rotulo={(o) => F.chips[o]} etiqueta={F.quien} />
      </Fig>
      {e && <Mensaje key={e} ok={ok} texto={ok ? p.acierto : p.errores[e]} />}
    </>
  );
}

/* P4 · las seis causas, una a la vez. */
function Causas({ p }) {
  const [k, setK] = useState(null);
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <div className="t4a4-causas" role="group" aria-label={F.causas}>
        {CAUSAS_A4.map((c, i) => <button key={c.id} type="button" className="t4r-tab" data-control={i + 1} aria-pressed={k === i} onClick={() => setK(i)}>{i + 1}</button>)}
      </div>
      {/* Al tocar 1 a 6 cambia el renglón de las libretas: la región viva hace que el lector lo oiga (Katsumi). */}
      <div aria-live="polite" data-lector-causa>
        <Libretas renglones={k != null ? [CAUSAS_A4[k]] : []} reserva={k != null ? 0 : 1} luz />
      </div>
    </Fig>
  );
}

function Conciliacion({ p }) {
  return <Fig nombre={NOMBRE} alt={p.alt}><Libretas sub renglones={RENGLONES_CONCILIACION} /></Fig>;
}

function Quieta({ p }) {
  return <Fig nombre={NOMBRE} alt={p.alt}><Libretas renglones={[]} /></Fig>;
}

const MODOS = { cuenta: Cuenta, extracto: Extracto, mandar: Mandar, quien: Quien, causas: Causas, conciliacion: Conciliacion, quieta: Quieta };

export function CuerpoA4({ p, onAcierto }) {
  const M = MODOS[p.modo];
  return <M p={p} onAcierto={onAcierto} />;
}

