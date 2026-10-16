/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A2 «EL FONDO FIJO» · EL SOBRE Y EL LIBRO, MANEJADOS (Hanayama).
 *
 * Carril de la Célula D. Portado del prototipo congelado (scratchpad hanayama/
 * sitio/src/components/t4r/A2R.jsx), con los textos de Katsumi en los datos
 * (src/data/contabilidadT4A2.js). La pantalla misma es PantallasT4 de la vista;
 * aquí va el cuerpo de cada pantalla, según su `modo`:
 *   · pagar (P0): pagar hasta tres gastos y reponer; «Suman» no se mueve
 *   · apertura (P1): el cheque abre el sobre y el libro escribe sus dos líneas
 *   · gastos (P2): los ocho gastos de mayo; los billetes, «sin contar»
 *   · cuanto (P3, pregunta): la cifra elegida va a los billetes y «Suman» da
 *     cifra + soportes; con una equivocada, «Suman (no es el fondo)»
 *   · reembolso (P4): el cheque repone; los soportes se van y «Suman» se queda
 *   · asiento (P5, pregunta): el reembolso en el libro, con «Comprobar». En el
 *     error no se escribe nada y solo se marca la mitad que falla
 *   · subir-bajar (P6): de a 100.000 (supuesto), y el libro con ellos
 *   · quieta (P7): el sobre con el fondo
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useId, useState } from "react";
import { C, Mensaje, Avance, cifra } from "./comun.jsx";
import { Tablero } from "./tablero.jsx";
import { Fig, Sobre, Cheque, Rotulo, Chips } from "./aprender.jsx";
import { DEBE, HABER, MARCA } from "../../data/contabilidadT4.js";
import {
  FONDO, GASTOS_MAYO, GASTADO, QUEDA, PAGOS_P0, PASO_FONDO, FONDO_MIN, FONDO_MAX, OPCIONES_QUEDA,
  CAJA_MENOR as CM, BANCOS as B, CAJA as CJ, GASTOS_GENERALES as GG, CUENTAS_A2, REEMBOLSO_A2, errorReembolsoA2, FIGURA_A2 as F,
} from "../../data/contabilidadT4A2.js";

export const CSS_A2 = `
.t4a2-g { display: flex; justify-content: space-between; gap: 8px; min-height: 22px; margin: 0; font-size: 13px; color: ${C.texto2}; }
.t4a2-g > span { white-space: nowrap; }
.t4a2-g > span:last-child { color: ${C.texto}; font-variant-numeric: tabular-nums; }
`;

const NOMBRE = "sobre-y-libro";
const sumaGastos = (n) => GASTOS_MAYO.slice(0, n).reduce((s, g) => s + g.valor, 0);

function Libro({ cuentas, totales, recien = [] }) {
  return (
    <>
      <Rotulo>{F.libro}</Rotulo>
      <Tablero cuentas={cuentas.map((c) => CUENTAS_A2[c])} totales={totales} activo={false} conMarcas={false} recien={recien} etiqueta={F.tablero} />
    </>
  );
}

/* P0 · pagar y reponer: los billetes bajan, los soportes suben, «Suman» se queda. */
function Pagar({ p }) {
  const [n, setN] = useState(0);
  const idRazon = useId();
  /* D7: los dos son de límite (vuelven a servir), así que se quedan; apagado, cada uno dice al lado por qué (Katsumi). */
  const razon = !n ? F.razonReponer : n >= PAGOS_P0 ? F.razonPagar : null;
  const pagado = sumaGastos(n);
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Sobre rotulo={F.sobre} filas={[
        { id: "billetes", r: F.billetes, v: FONDO - pagado },
        { id: "soportes", r: F.soportes, v: pagado, oculta: !pagado },
        { id: "suman", r: F.suman, v: FONDO, suma: true },
      ]} />
      <div className="t4r-par2">
        <button type="button" className="t4r-btn2" data-accion="pagar" aria-disabled={n >= PAGOS_P0 ? "true" : undefined} aria-describedby={n >= PAGOS_P0 ? idRazon : undefined} onClick={n < PAGOS_P0 ? () => setN(n + 1) : undefined}>{F.pagar}</button>
        <button type="button" className="t4r-btn2" data-accion="reponer" aria-disabled={!n ? "true" : undefined} aria-describedby={!n ? idRazon : undefined} onClick={n ? () => setN(0) : undefined}>{F.reponer}</button>
      </div>
      <p className="t4r-razon" id={idRazon} data-razon>{razon}</p>
    </Fig>
  );
}

/* P1 · la apertura: el cheque llena el sobre; Caja menor al debe y Bancos al haber. */
function Apertura({ p }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Cheque monto={FONDO} renglones={F.cheque} hecho={abierto} onClick={() => setAbierto(true)} />
      <Sobre rotulo={F.sobre} luz={abierto} filas={[
        { id: "billetes", r: F.billetes, v: abierto ? FONDO : 0 },
        { id: "suman", r: F.suman, v: abierto ? FONDO : 0, suma: true },
      ]} />
      <Libro cuentas={[CM, B]} totales={abierto ? { [CM]: { [DEBE]: FONDO }, [B]: { [HABER]: FONDO } } : {}} recien={abierto ? [`${CM}:${DEBE}`, `${B}:${HABER}`] : []} />
    </Fig>
  );
}

/* P2 · los gastos de mayo, uno por toque. Los billetes no se cuentan: 21.900 es la pregunta de P3. */
function Gastos({ p }) {
  const [n, setN] = useState(0);
  const g = n ? GASTOS_MAYO[n - 1] : null;
  const total = GASTOS_MAYO.length;
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Sobre rotulo={F.sobre} filas={[
        { id: "billetes", r: F.billetes, v: F.sinContar },
        { id: "soportes", r: F.soportes, v: sumaGastos(n), luz: Boolean(n) },
      ]} />
      <p className="t4a2-g" data-gasto={g ? n : undefined} aria-live="polite">{g ? <><span>{g.gasto}</span><span>{cifra(g.valor)}</span></> : <span>&nbsp;</span>}</p>
      <button type="button" className={`t4r-btn2${n >= total ? " t4r-oculto" : ""}`} data-accion="pagar" data-usado={n >= total ? "" : undefined} onClick={n < total ? () => setN(n + 1) : undefined}>{F.pagarSiguiente(Math.min(n + 1, total), total)}</button>
    </Fig>
  );
}

/* P3 · ¿cuánto queda? La cifra elegida va a los billetes, y «Suman» dice si da el fondo. */
function CuantoQueda({ p, onAcierto }) {
  const [e, setE] = useState(null);
  const ok = e === QUEDA;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt}>
        <Sobre rotulo={F.sobre} filas={[
          { id: "fondo", r: F.fondo, v: FONDO },
          { id: "billetes", r: F.billetes, v: e ?? "?", luz: e != null },
          { id: "soportes", r: F.soportes, v: GASTADO },
          { id: "suman", r: e != null && !ok ? F.sumanMal : F.suman, v: e != null ? e + GASTADO : "?", suma: true },
        ]} />
        <Chips opciones={OPCIONES_QUEDA} elegida={e} correcta={QUEDA} onElegir={setE} etiqueta={F.opciones} />
      </Fig>
      {e != null && <Mensaje key={e} ok={ok} texto={ok ? p.acierto : p.errores[e]} />}
    </>
  );
}

/* P4 · el reembolso: el cheque repone los billetes; los soportes se van; «Suman» no se mueve. */
function Reembolso({ p }) {
  const [hecho, setHecho] = useState(false);
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Cheque monto={GASTADO} renglones={F.cheque} hecho={hecho} onClick={() => setHecho(true)} />
      <Sobre rotulo={F.sobre} filas={[
        { id: "billetes", r: F.billetes, v: hecho ? FONDO : QUEDA, luz: hecho },
        { id: "soportes", r: F.soportes, v: GASTADO, oculta: hecho },
        { id: "suman", r: F.suman, v: FONDO, suma: true },
      ]} />
    </Fig>
  );
}

/* P5 · ¿qué mueve el reembolso? La ficha en un debe y en un haber, y «Comprobar». */
function YCajaMenor({ p, onAcierto }) {
  const [puestas, setPuestas] = useState({ [DEBE]: null, [HABER]: null });
  const [r, setR] = useState(null);
  const ok = Boolean(r) && r[DEBE] === REEMBOLSO_A2[DEBE] && r[HABER] === REEMBOLSO_A2[HABER];
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  const base = { [CM]: { [DEBE]: FONDO }, [B]: { [HABER]: FONDO } };
  const totales = ok ? { ...base, [GG]: { [DEBE]: GASTADO }, [B]: { [HABER]: FONDO + GASTADO } } : base;
  /* En el error solo se marca lo que falla: una ✓ en la mitad buena delataría la respuesta. */
  const marcas = !r ? {} : ok
    ? { [`${GG}:${DEBE}`]: "bien", [`${B}:${HABER}`]: "bien" }
    : {
      ...(r[DEBE] !== REEMBOLSO_A2[DEBE] ? { [`${r[DEBE]}:${DEBE}`]: "mal" } : {}),
      ...(r[HABER] !== REEMBOLSO_A2[HABER] ? { [`${r[HABER]}:${HABER}`]: "mal" } : {}),
    };
  const elegir = (id, lado) => {
    if (ok) return;
    setR(null);
    setPuestas((x) => {
      const otro = lado === DEBE ? HABER : DEBE;
      const n = { ...x, [lado]: id };
      if (n[otro] === id) n[otro] = null;
      return n;
    });
  };
  const listo = Boolean(puestas[DEBE] && puestas[HABER]);
  /* «Comprobar» nunca se apaga (P2 de Hanayama, §5.3): con algo incompleto, avisa. */
  const [aviso, setAviso] = useState(false);
  const comprobar = () => { if (!listo) { setAviso(true); return; } setAviso(false); setR({ ...puestas }); };
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt}>
        <Rotulo>{F.libro}</Rotulo>
        <Tablero cuentas={[CM, B, CJ, GG].map((c) => CUENTAS_A2[c])} totales={totales} puestas={ok ? {} : puestas} monto={cifra(GASTADO)}
          onElegir={elegir} activo={!ok} marcas={marcas} recien={ok ? [`${GG}:${DEBE}`, `${B}:${HABER}`] : []} etiqueta={F.tablero} />
        {!ok && <Avance nombre="comprobar" onClick={comprobar}>{F.comprobar}</Avance>}
        <p className="t4r-aviso" data-aviso aria-live="polite">{aviso && !listo ? F.aviso : null}</p>
      </Fig>
      {r && <Mensaje key={`${r[DEBE]}-${r[HABER]}-${ok}`} ok={ok} texto={ok ? p.acierto : p.errores[errorReembolsoA2(r)]} />}
    </>
  );
}

/* P6 · subir y bajar el fondo, de a 100.000 (supuesto). Subir: Caja menor / Bancos. Bajar: Caja / Caja menor. */
function SubirBajar({ p }) {
  const [f, setF] = useState(FONDO);
  const idRazon = useId();
  /* D7: «Bajar» y «Subir» son de límite; apagado, cada uno dice al lado por qué (Katsumi). */
  const razon = f <= FONDO_MIN ? F.razonBajar : f >= FONDO_MAX ? F.razonSubir : null;
  const sube = Math.max(0, f - FONDO);
  const baja = Math.max(0, FONDO - f);
  return (
    <Fig nombre={NOMBRE} alt={p.alt}>
      <Sobre rotulo={F.sobre} filas={[{ id: "billetes", r: F.billetes, v: f, luz: f !== FONDO }]} />
      <div className="t4r-par2">
        <button type="button" className="t4r-btn2" data-accion="bajar" aria-disabled={f <= FONDO_MIN ? "true" : undefined} aria-describedby={f <= FONDO_MIN ? idRazon : undefined} onClick={f > FONDO_MIN ? () => setF(f - PASO_FONDO) : undefined}>{F.bajar}</button>
        <button type="button" className="t4r-btn2" data-accion="subir" aria-disabled={f >= FONDO_MAX ? "true" : undefined} aria-describedby={f >= FONDO_MAX ? idRazon : undefined} onClick={f < FONDO_MAX ? () => setF(f + PASO_FONDO) : undefined}>{F.subir}</button>
      </div>
      <p className="t4r-razon" id={idRazon} data-razon>{razon}</p>
      <Libro cuentas={[CM, B, CJ]}
        totales={{ [CM]: { [DEBE]: FONDO + sube, [HABER]: baja }, [B]: { [HABER]: FONDO + sube }, [CJ]: { [DEBE]: baja } }}
        recien={sube ? [`${CM}:${DEBE}`, `${B}:${HABER}`] : baja ? [`${CM}:${HABER}`, `${CJ}:${DEBE}`] : []} />
    </Fig>
  );
}

function Quieta({ p }) {
  return <Fig nombre={NOMBRE} alt={p.alt}><Sobre rotulo={F.sobre} filas={[{ id: "billetes", r: F.billetes, v: FONDO }]} /></Fig>;
}

const MODOS = { pagar: Pagar, apertura: Apertura, gastos: Gastos, cuanto: CuantoQueda, reembolso: Reembolso, asiento: YCajaMenor, "subir-bajar": SubirBajar, quieta: Quieta };

export function CuerpoA2({ p, onAcierto }) {
  const M = MODOS[p.modo];
  return <M p={p} onAcierto={onAcierto} />;
}
