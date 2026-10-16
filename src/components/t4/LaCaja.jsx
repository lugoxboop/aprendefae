/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 «LA CAJA» · LO QUE HACE EL CAJÓN EN CADA PANTALLA (Hanayama,
 * rediseño de A1 §2).
 *
 *   · mapa       P0 y P6: el cajón vacío, sin acción
 *   · cobra      P1: «Cobrar» → el tubo de entrada se enciende, 435.000 entra
 *                al Debe y «En la caja» cuenta hasta 435.000; abajo, el asiento 1
 *   · consigna   P2: decisión con reintento. Haber: la plata sale a Bancos,
 *                «En la caja» baja a 0 y aparece el asiento 2. Debe o bandeja:
 *                coral y ✗, nada se escribe y se puede probar otra vez
 *   · salidas    P3: «Consignar» o «Pagar»; «Otra vez» deja probar la otra
 *   · cheques    P4: dos decisiones; la segunda tarjeta llega 1,4 s después
 *   · controles  P5: siete pestañas; cada una enciende la parte del cajón que
 *                ese control cuida
 *
 * En el error de Aprender no se escribe nada y se puede reintentar: los
 * destinos siguen activos (regla del Tema 2 con el reintento de la elección
 * publicada). El destino elegido lleva la pastilla con palabra, como en H1
 * (en blanco y negro se sabe cuál falló), pero nunca «Iba aquí»: nombraría
 * la respuesta. Carril de la Célula D.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import {
  FIGURA_CAJON, SUS_SERVICIOS, DEBE, HABER, INTERFAZ,
  CONTROLES_A1, CHEQUES_A1, CHEQUE_EN_FIGURA, ESPERA_CHEQUE_MS,
} from "../../data/contabilidadT4.js";
import { C, cifra, Mensaje } from "./comun.jsx";
import { Cajon } from "./Cajon.jsx";

const M = cifra(SUS_SERVICIOS);
const VIBRA_MS = 260;

export const CSS_A1 = `
.t4a1-as { display: grid; background: ${C.hundido}; border: 1px solid ${C.hundidoBorde}; border-radius: 10px; padding: 10px 12px; gap: 4px; }
.t4a1-as-f { display: grid; grid-template-columns: minmax(0,1fr) 72px 72px; gap: 4px; font-size: 14px; line-height: 1.35; }
.t4a1-as-f > span:nth-child(n+2) { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.t4a1-as-h > span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t4a1-tabs { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; margin-top: 10px; }
.t4r-tab { appearance: none; min-height: 44px; border-radius: 8px; border: 1px solid ${C.neutro}; background: transparent; color: ${C.texto}; font: 600 15px "Sora", "Inter", sans-serif; cursor: pointer; padding: 0; }
.t4r-tab[aria-pressed="true"] { background: ${C.texto}; color: ${C.fondo}; border-color: ${C.texto}; }
.t4a1-ctl { margin: 8px 0 0; min-height: 66px; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
`;

/* Un asiento de la p. 180, en lectura: «Debe» en teal y «Haber» en ámbar, que es su significado. */
export function AsientoA1({ asiento }) {
  return (
    <div className="t4a1-as t4r-nueva" role="table" aria-label={asiento.nombre} data-asiento={asiento.nombre}>
      <div className="t4a1-as-f t4a1-as-h" role="row">
        <span />
        <span role="columnheader" style={{ color: C.debeTexto }}>{INTERFAZ.debe}</span>
        <span role="columnheader" style={{ color: C.haber }}>{INTERFAZ.haber}</span>
      </div>
      {asiento.lineas.map((l) => (
        <div key={l.cuenta} className="t4a1-as-f" role="row" data-linea={l.cuenta} data-lado={l.lado} style={{ borderTop: `1px solid ${C.neutro}`, paddingTop: "4px" }}>
          <span role="rowheader" style={{ paddingLeft: l.lado === HABER ? "16px" : 0 }}>{l.cuenta}</span>
          <span role="cell">{l.lado === DEBE ? cifra(l.monto) : ""}</span>
          <span role="cell">{l.lado === HABER ? cifra(l.monto) : ""}</span>
        </div>
      ))}
    </div>
  );
}

/* Un temblor de una vez sobre el lado mal elegido; el reloj se limpia al desmontar. */
function useVibra() {
  const [vibra, setVibra] = useState(null);
  const reloj = useRef(0);
  useEffect(() => () => clearTimeout(reloj.current), []);
  const sacudir = (d) => { setVibra(d); clearTimeout(reloj.current); reloj.current = setTimeout(() => setVibra(null), VIBRA_MS); };
  return [vibra, sacudir];
}

function Mapa() {
  return <Cajon />;
}

function Cobra({ p }) {
  const [hecho, setHecho] = useState(false);
  return (
    <>
      <Cajon
        origen={{ rotulo: FIGURA_CAJON.rotuloOrigen, monto: M, montoFoco: !hecho, accion: { id: "cobrar", texto: FIGURA_CAJON.acciones.cobrar, hecha: hecho, onClick: () => setHecho(true) } }}
        glosas={{ debe: true }}
        debe={hecho ? [{ id: "cobro", v: M, foco: true }] : []}
        saldo={hecho ? SUS_SERVICIOS : 0}
        vivo={hecho ? ["entrada"] : []}
      />
      {hecho && <AsientoA1 asiento={p.asiento} />}
    </>
  );
}

function Consigna({ p, onAcierto }) {
  const [elegida, setElegida] = useState(null);
  const [vibra, sacudir] = useVibra();
  const ok = elegida === p.correcta;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  const elegir = (d) => {
    if (ok) return;
    setElegida(d);
    if (d !== p.correcta) sacudir(d);
  };
  return (
    <>
      <Cajon
        origen={{ texto: p.tarjeta, monto: M, montoFoco: !ok, clave: "consigna" }}
        debe={[{ id: "cobro", v: M }]}
        haber={ok ? [{ id: "consigna", v: M, foco: true }] : []}
        saldo={ok ? 0 : SUS_SERVICIOS}
        vivo={ok ? ["salida", "bancos"] : []}
        bancos={ok ? { monto: M } : {}}
        bandeja={{}}
        destinos={{ activos: !ok, onElegir: elegir, marcas: elegida ? { [elegida]: ok ? "bien" : "mal" } : {} }}
        palabras
        vibra={vibra}
      />
      {elegida && <Mensaje key={elegida} ok={ok} texto={ok ? p.acierto : p.errores[elegida]} />}
      {ok && <AsientoA1 asiento={p.asiento} />}
    </>
  );
}

function DosSalidas() {
  const [salio, setSalio] = useState(null);
  return (
    <Cajon
      glosas={{ haber: true }}
      debe={[{ id: "cobro", v: M }]}
      haber={salio ? [{ id: salio, v: M, foco: true }] : []}
      saldo={salio ? 0 : SUS_SERVICIOS}
      vivo={salio ? ["salida", salio] : []}
      bancos={{ monto: salio === "bancos" ? M : null, accion: { id: "consignar", texto: FIGURA_CAJON.acciones.consignar, hecha: Boolean(salio), onClick: () => setSalio("bancos") } }}
      pago={{ monto: salio === "pago" ? M : null, accion: { id: "pagar", texto: FIGURA_CAJON.acciones.pagar, hecha: Boolean(salio), onClick: () => setSalio("pago") } }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", visibility: salio ? "visible" : "hidden" }}>
        <button type="button" className="t4r-btn2" data-accion="otra-vez" onClick={() => setSalio(null)}>{FIGURA_CAJON.acciones.otraVez}</button>
      </div>
    </Cajon>
  );
}

function Cheques({ onAcierto }) {
  const [k, setK] = useState(0);
  const [hechos, setHechos] = useState([]);
  const [elegida, setElegida] = useState(null);
  const [vibra, sacudir] = useVibra();
  const reloj = useRef(0);
  useEffect(() => () => clearTimeout(reloj.current), []);
  const ch = CHEQUES_A1[k];
  const ok = elegida === ch.correcta;
  const ambos = hechos.length === CHEQUES_A1.length;
  useEffect(() => { if (ambos) onAcierto?.(); }, [ambos]); // eslint-disable-line react-hooks/exhaustive-deps
  const elegir = (d) => {
    if (ok) return;
    setElegida(d);
    if (d !== ch.correcta) { sacudir(d); return; }
    setHechos((h) => [...h, ch.id]);
    if (k + 1 < CHEQUES_A1.length) reloj.current = setTimeout(() => { setK(k + 1); setElegida(null); }, ESPERA_CHEQUE_MS);
  };
  return (
    <>
      <Cajon
        origen={{ texto: ch.tarjeta, clave: ch.id }}
        debe={hechos.includes("recibido") ? [{ id: "cheque", v: CHEQUE_EN_FIGURA.recibido, foco: k === 0 }] : []}
        vivo={hechos.includes("recibido") && k === 0 ? ["entrada"] : []}
        bandeja={{ ultimo: hechos.includes("propio") ? CHEQUE_EN_FIGURA.propio : null }}
        luz={hechos.includes("propio") ? ["bancos"] : []}
        destinos={{ activos: !ambos && !ok, onElegir: elegir, marcas: elegida ? { [elegida]: ok ? "bien" : "mal" } : {} }}
        palabras
        vibra={vibra}
      />
      {elegida && <Mensaje key={ch.id + elegida} ok={ok} texto={ok ? ch.acierto : ch.errores[elegida]} />}
    </>
  );
}

function Controles() {
  const [k, setK] = useState(null);
  const c = k != null ? CONTROLES_A1[k] : null;
  return (
    <Cajon saldo="—" luz={c?.luz ?? []} vivo={c?.vivo ?? []}>
      <div className="t4a1-tabs" role="group" aria-label={FIGURA_CAJON.controles}>
        {CONTROLES_A1.map((x, i) => (
          <button key={x.texto} type="button" className="t4r-tab" data-control={i + 1} aria-pressed={k === i} onClick={() => setK(i)}>{i + 1}</button>
        ))}
      </div>
      <p className="t4a1-ctl" data-texto-control aria-live="polite">{c ? c.texto : ""}</p>
    </Cajon>
  );
}

const CUERPOS = { mapa: Mapa, cobra: Cobra, consigna: Consigna, salidas: DosSalidas, cheques: Cheques, controles: Controles };

/* El cuerpo de una pantalla de A1: el cajón y lo que sale debajo con la acción. */
export function CuerpoA1({ p, onAcierto }) {
  const Cuerpo = CUERPOS[p.tipo];
  return <Cuerpo p={p} onAcierto={onAcierto} />;
}

