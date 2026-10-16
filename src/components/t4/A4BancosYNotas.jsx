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
 *   · causas (P3, pregunta; lote B §5.4, absorbe a «quien-lo-tiene»): seis
 *     tarjetas, cada una a la libreta que la tiene anotada; con el acierto, su
 *     rótulo se escribe en esa libreta; con el error, «No va aquí» en ella
 *   · conciliacion (P4, la última; lote B §5.2): se toca el renglón que le
 *     falta anotar a la empresa; con el acierto, la frase de cierre
 * Las libretas: renglones alineados de 64 px; donde una no tiene lo que la
 * otra, «todavía no / lo sabe». Sus rótulos van completos, en renglones fijos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useState } from "react";
import { C, Mensaje, Marca, LineaMarcas } from "./comun.jsx";
import { Tablero, Mayor } from "./tablero.jsx";
import { Fig, LectorError } from "./aprender.jsx";
import { DEBE, HABER, MARCA } from "../../data/contabilidadT4.js";
import {
  CONSIGNACION, CHEQUE_PROVEEDOR, MOVIMIENTOS_A4, RESERVA_MAYOR_A4, RENGLONES_EXTRACTO, CAUSAS_A4,
  RENGLONES_CONCILIACION, FIGURA_A4 as F,
} from "../../data/contabilidadT4A4.js";

export const CSS_A4 = `
.t4lt { display: grid; gap: 0; border: 1px solid ${C.neutro}; border-radius: 10px; overflow: hidden; }
.t4lt-f { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.t4lt-f > div, .t4lt-f > .t4lt-c { min-width: 0; padding: 6px 10px; }
.t4lt-f > * + * { border-left: 1px solid ${C.neutro}; }
.t4lt-cab > div { display: grid; border-bottom: 1px solid rgba(248,249,250,0.22); }
.t4lt-cab > div > span:first-child { font: 600 13px/1.3 "Sora", "Inter", sans-serif; white-space: nowrap; }
.t4lt-cab > div > span + span { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4lt-r > div, .t4lt-r > .t4lt-c { display: grid; align-content: center; min-height: 64px; border-bottom: 1px solid rgba(248,249,250,0.10); }
.t4lt-c > span { white-space: nowrap; font-size: 13px; line-height: 1.35; }
.t4lt-c[data-tinta] { box-shadow: inset 2px 0 0 ${C.neutro}; }
.t4lt-c[data-tinta] > span:first-child { font-weight: 600; }
.t4lt-c[data-tinta][data-luz] { box-shadow: inset 2px 0 0 ${C.texto}; }
.t4lt-c:not([data-tinta]) > span { color: ${C.texto2}; font-size: 12px; }
.t4lt-c[data-tinta] > span.e { font-size: 12px; color: ${C.texto2}; font-weight: 500; }
/* Lote B, §5.2: en la conciliación cada renglón es un destino (64 px), con su hueco de 20 px para la pastilla. */
.t4lt-dest { display: grid; }
.t4lt-boton { appearance: none; width: 100%; margin: 0; padding: 0; text-align: left; font: inherit; color: ${C.texto}; background: transparent; border: 1px solid ${C.reposo}; border-radius: 8px; cursor: pointer; }
.t4lt-boton:disabled { cursor: default; }
.t4lt-boton > .t4lt-c { border-bottom: none; }
.t4lt-boton[data-marca="bien"] { border: 2px solid ${C.texto}; }
.t4lt-boton[data-marca="mal"] { border: 2px solid ${C.error}; }
.t4lt-boton:focus-visible, .t4a4-lib:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4lt-hueco { display: flex; min-height: 20px; margin: 2px 0 4px; padding: 0 6px; }
.t4a4-c { display: grid; gap: 2px; align-content: center; border: 1px solid ${C.texto}; border-radius: 8px; padding: 8px 12px; min-height: 80px; }
.t4a4-c > span { font-size: 15px; line-height: 22px; overflow-wrap: anywhere; }
.t4a4-c > span + span { font-size: 12px; color: ${C.texto2}; line-height: 1.3; }
.t4a4-lado[data-marca="mal"] { border: 2px solid ${C.error}; }
.t4a4-lado { display: flex; align-items: center; justify-content: center; }
/* Lote B, §5.4: las dos libretas como destinos; cinco renglones reservados de 20 px y el hueco de la pastilla al pie. */
.t4a4-libs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4a4-lib { appearance: none; display: grid; grid-template-rows: auto 100px 20px; gap: 4px; min-width: 0; padding: 8px 10px; text-align: left; font: inherit; color: ${C.texto}; background: transparent; border: 1px solid ${C.reposo}; border-radius: 10px; cursor: pointer; }
.t4a4-lib:disabled { cursor: default; }
.t4a4-lib[data-marca="bien"] { border: 2px solid ${C.texto}; padding: 7px 9px; }
.t4a4-lib[data-marca="mal"] { border: 2px solid ${C.error}; padding: 7px 9px; }
.t4a4-lib-n { font: 600 13px/1.3 "Sora", "Inter", sans-serif; white-space: nowrap; border-bottom: 1px solid rgba(248,249,250,0.22); padding-bottom: 4px; }
.t4a4-lib-l { display: grid; align-content: start; }
.t4a4-lib-l > span { display: grid; }
.t4a4-lib-l > span > span { white-space: nowrap; font: 600 12px/20px "Inter", sans-serif; }
.t4a4-lib-m { display: flex; min-height: 20px; }
`;

const NOMBRE = "libretas";

/*
 * Las dos libretas. renglones: [{ id, emp: { t: [..], e } | null, ban: {...} | null }];
 * `reserva`: renglones vacíos (el alto no cambia).
 */
/* Una celda de libreta: el renglón anotado, con su efecto, o «todavía no / lo sabe». */
function Celda({ x, lado, luz = false, nueva = false }) {
  return x
    ? (
      <span className={`t4lt-c${nueva ? " t4r-nueva" : ""}`} data-tinta="" data-luz={luz ? "" : undefined} data-linea-libreta={x.t.join(" ")} data-libreta={lado}>
        {x.t.map((t) => <span key={t}>{t}</span>)}
        <span className="e">{x.e}</span>
      </span>
    )
    : <span className="t4lt-c" data-libreta={lado} data-no-sabe=""><span>{F.noSabe[0]}</span><span>{F.noSabe[1]}</span></span>;
}

function Libretas({ renglones, reserva = 0, luz = false }) {
  const celda = (x, lado) => <Celda key={lado} x={x} lado={lado} luz={luz} nueva={Boolean(x)} />;
  return (
    <div className="t4lt" data-libretas>
      <div className="t4lt-f t4lt-cab">
        <div><span>{F.empresa}</span></div>
        <div><span>{F.banco}</span></div>
      </div>
      {renglones.map((r) => <div key={r.id} className="t4lt-f t4lt-r" data-renglon={r.id}>{celda(r.emp, "empresa")}{celda(r.ban, "banco")}</div>)}
      {Array.from({ length: reserva }, (_, k) => <div key={`v${k}`} className="t4lt-f t4lt-r" aria-hidden="true" data-renglon-vacio=""><div /><div /></div>)}
    </div>
  );
}

/* P0 · Bancos sube y baja: consignar y girar. */
function Cuenta({ p, onAccion }) {
  const [h, setH] = useState({ consignar: false, girar: false });
  /* Lote B, capa 1: cada definición aparece con su botón. */
  const hacer = (k) => { setH((x) => ({ ...x, [k]: true })); onAccion?.(k); };
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      {p.rotuloAccion && <p className="t4r-rotacc" data-rotulo-accion>{p.rotuloAccion}</p>}
      <div className="t4r-par2">
        <button type="button" className={`t4r-btn2${h.consignar ? " t4r-oculto" : ""}`} data-accion="consignar" data-usado={h.consignar ? "" : undefined} onClick={h.consignar ? undefined : () => hacer("consignar")}>{F.consignar}</button>
        <button type="button" className={`t4r-btn2${h.girar ? " t4r-oculto" : ""}`} data-accion="girar" data-usado={h.girar ? "" : undefined} onClick={h.girar ? undefined : () => hacer("girar")}>{F.girar}</button>
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
      <button type="button" className={`t4r-btn2${llego ? " t4r-oculto" : ""}`} data-accion="extracto" data-usado={llego ? "" : undefined} onClick={llego ? undefined : () => setLlego(true)}>{F.extracto}</button>
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

/*
 * P3 · las seis causas (lote B, §5.4): una tarjeta a la vez, a la libreta que
 * la tiene anotada. Con el acierto, el rótulo de la causa se escribe en esa
 * libreta (sin su efecto) y llega la siguiente; con el error, «No va aquí» en
 * la libreta tocada, nada se escribe y «Incorrecto.» para el lector.
 */
const LIBRETAS_A4 = [["empresa", "emp", F.empresa], ["banco", "ban", F.banco]];
function Causas({ p, onAcierto }) {
  const [i, setI] = useState(0);
  const [marca, setMarca] = useState(null);
  const [errores, setErrores] = useState(0);
  const total = CAUSAS_A4.length;
  const c = CAUSAS_A4[i];
  const fin = !c;
  useEffect(() => { if (fin) onAcierto?.(); }, [fin]); // eslint-disable-line react-hooks/exhaustive-deps
  const puestas = CAUSAS_A4.slice(0, i);
  const ladoDe = (x) => (x.emp ? "empresa" : "banco");
  const elegir = (lado) => {
    if (!c) return;
    if (lado === ladoDe(c)) { setMarca({ lado, m: "bien" }); setI(i + 1); } else { setMarca({ lado, m: "mal" }); setErrores((n) => n + 1); }
  };
  /* D6: una nota del banco llevada a la libreta de la empresa tiene su mensaje (Katsumi); los demás errores, solo la marca. */
  const textoError = marca?.m === "mal" && marca.lado === "empresa" && p.errorEmpresa?.causas.includes(c?.id) ? p.errorEmpresa.texto : null;
  return (
    <>
    <Fig nombre={NOMBRE} alt={p.alt}>
      <div className="t4a4-c" data-tarjeta-causa={c?.id ?? "fin"} aria-live="polite">
        {c ? <><span>{c.tarjeta}</span><span>{F.contadorCausa(i + 1, total)}</span></> : <span>{p.fin}</span>}
      </div>
      <div className="t4a4-libs">
        {LIBRETAS_A4.map(([lado, k, nombre]) => {
          const anotadas = puestas.filter((x) => ladoDe(x) === lado);
          const m = marca?.lado === lado ? marca.m : null;
          return (
            <button key={lado} type="button" className="t4a4-lib" data-destino={lado} data-marca={m ?? undefined} disabled={fin} onClick={() => elegir(lado)}
              aria-label={`${F.anotadas(nombre, anotadas.length)}${m ? `: ${F.estadoLector[m]}` : ""}`}>
              <span className="t4a4-lib-n">{nombre}</span>
              <span className="t4a4-lib-l">
                {anotadas.map((x) => <span key={x.id} className="t4r-nueva" data-causa-escrita={x.id}>{x[k].t.map((t) => <span key={t}>{t}</span>)}</span>)}
              </span>
              <span className="t4a4-lib-m">{m && <Marca marca={m} />}</span>
            </button>
          );
        })}
      </div>
      <LectorError error={marca?.m === "mal" && !textoError} clave={errores} />
    </Fig>
    {textoError && <Mensaje key={`${c.id}-${errores}`} ok={false} texto={textoError} />}
    </>
  );
}

/*
 * P4 · la conciliación (lote B, §5.2), la última de A4: los dos renglones de
 * las libretas son destinos. Se toca lo que le falta anotar a la empresa. En
 * el error, «No va aquí» en el renglón y su mensaje; reintento. Con el
 * acierto, «Correcto» en el renglón, la empresa pasa a «Nota débito · por
 * anotar» y, sin mensaje, aparece la frase de cierre.
 */
function Conciliacion({ p, onAcierto, onCierre }) {
  const [e, setE] = useState(null);
  const ok = e === p.correcta;
  useEffect(() => { if (ok) { onAcierto?.(); onCierre?.(); } }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt}>
        <p className="t4r-rotacc" data-rotulo-pregunta>{p.rotuloPregunta}</p>
        <div className="t4lt" data-libretas>
          <div className="t4lt-f t4lt-cab">
            <div><span>{F.empresa}</span></div>
            <div><span>{F.banco}</span></div>
          </div>
          {RENGLONES_CONCILIACION.map((r) => {
            const m = e === r.id ? (ok ? "bien" : "mal") : null;
            const emp = ok && r.id === p.correcta ? { t: r.ban.t, e: F.porAnotar } : r.emp;
            return (
              <div key={r.id} className="t4lt-dest" data-renglon={r.id}>
                <button type="button" className="t4lt-f t4lt-r t4lt-boton" data-destino={r.id} data-marca={m ?? undefined} disabled={ok}
                  aria-label={`${F.renglonLector[r.id]}${m ? `: ${F.estadoLector[m]}` : ""}`} onClick={() => setE(r.id)}>
                  <Celda x={emp} lado="empresa" nueva={ok && r.id === p.correcta} />
                  <Celda x={r.ban} lado="banco" />
                </button>
                <span className="t4lt-hueco" aria-hidden="true">{m && <Marca marca={m} />}</span>
              </div>
            );
          })}
        </div>
      </Fig>
      {e && !ok && <Mensaje key={e} ok={false} texto={p.errores[e]} />}
    </>
  );
}

const MODOS = { cuenta: Cuenta, extracto: Extracto, mandar: Mandar, causas: Causas, conciliacion: Conciliacion };

export function CuerpoA4(props) {
  const M = MODOS[props.p.modo];
  return <M {...props} />;
}

