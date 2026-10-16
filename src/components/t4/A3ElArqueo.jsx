/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A3 «EL ARQUEO» · EL SOBRE CON LA REGLA DEL FONDO (Hanayama).
 *
 * Carril de la Célula D. Portado del prototipo congelado (scratchpad hanayama/
 * sitio/src/components/t4r/A3R.jsx), con los textos de Katsumi en los datos
 * (src/data/contabilidadT4A3.js). La regla es la de H4 (Regla.jsx): el arqueo
 * y su práctica se leen igual. El cuerpo de cada pantalla, según su `modo`:
 *   · contar (P0): la caja dice 21.900 y la aguja «suman» cae en la marca
 *   · mover (P1): un control mueve la plata de la caja; la aguja corre, se
 *     dibuja el tramo y debajo se lee si cuadra o cuánto sobra o falta
 *   · zona (P2, pregunta): la aguja aparece solo con el acierto (antes
 *     delataría la respuesta)
 *   · cheque (P3 y P5, pregunta): la aguja «caja + tu cheque» cae donde dice
 *     el cheque elegido; solo el correcto la deja en la marca
 *   · ficha (P4 y P7, pregunta): la diferencia a una cuenta y un lado, con
 *     «Comprobar». En el error no se escribe nada y solo se marca lo elegido
 *   · tramo (P6), caminos (P8: cambiar de camino solo cambia la cuenta de los
 *     6.700; no se califica) y quieta (P9)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useState } from "react";
import { C, Mensaje, cifra } from "./comun.jsx";
import { Tablero } from "./tablero.jsx";
import { Regla } from "./Regla.jsx";
import { Fig, Sobre, Rotulo, Chips } from "./aprender.jsx";
import { DEBE, HABER, MARCA } from "../../data/contabilidadT4.js";
import { FONDO, GASTADO } from "../../data/contabilidadT4A2.js";
import {
  CONTROL_A3, ZONAS_A3, EFECTIVO_FALTANTE, FALTANTE, CHEQUE_FALTANTE,
  GASTOS_GENERALES as GG, BANCOS as B, CXC_EMPLEADOS as CXC, GASTOS_FALTANTE as GNO, CUENTAS_A3, FIGURA_A3 as F,
} from "../../data/contabilidadT4A3.js";

export const CSS_A3 = `
.t4a3-zona { margin: 0; min-height: 22px; text-align: center; font: 600 14px/22px "Inter", sans-serif; white-space: nowrap; }
.t4a3-control { display: block; width: 100%; height: 44px; margin: 0; accent-color: ${C.texto}; cursor: pointer; }
.t4a3-camino { display: grid; gap: 6px; }
.t4a3-camino > button { width: 100%; padding: 0 6px; }
.t4a3-camino > button[aria-pressed="true"] { border-width: 2px; border-color: ${C.texto}; }
`;

const NOMBRE = "sobre-y-regla";
const R = { fondo: FONDO };

const SobreArqueo = ({ caja, luz = false }) => (
  <Sobre rotulo={F.sobre} filas={[
    { id: "soportes", r: F.soportes, v: GASTADO },
    { id: "caja", r: F.caja, v: caja ?? F.sinContar, luz },
  ]} />
);

/* P0 · contar: la caja dice lo que tiene y la aguja de la suma cae en la marca del fondo. */
function Contar({ p }) {
  const [c, setC] = useState(false);
  const caja = FONDO - GASTADO;
  return (
    <Fig nombre={NOMBRE} alt={p.alt} gap={6}>
      <SobreArqueo caja={c ? caja : null} luz={c} />
      <Regla r={R} suman={c ? GASTADO + caja : null} />
      <button type="button" className="t4r-btn2" data-accion="contar" aria-disabled={c ? "true" : undefined} onClick={c ? undefined : () => setC(true)}>{F.contar}</button>
    </Fig>
  );
}

/* P1 · mover la plata de la caja: la aguja cruza la marca y debajo se lee qué hay. */
function Mover({ p }) {
  const [caja, setCaja] = useState(CONTROL_A3.inicio);
  const d = GASTADO + caja - FONDO;
  const zona = d === 0 ? "cuadra" : d > 0 ? "sobra" : "falta";
  return (
    <Fig nombre={NOMBRE} alt={p.alt} gap={6}>
      <SobreArqueo caja={caja} luz />
      <Regla r={R} suman={GASTADO + caja} tramos={d ? [{ id: "dif", desv: d }] : []} />
      <p className="t4a3-zona" data-zona={zona} aria-live="polite">{F.zona[zona]}{d ? ` · ${cifra(Math.abs(d))}` : ""}</p>
      <input type="range" className="t4a3-control" data-accion="mover" aria-label={F.control} aria-valuetext={cifra(caja)}
        min={CONTROL_A3.min} max={CONTROL_A3.max} step={CONTROL_A3.paso} value={caja} onChange={(e) => setCaja(Number(e.target.value))} />
    </Fig>
  );
}

/* P2 · ¿qué muestra el arqueo? La aguja aparece solo con el acierto. */
function Zona({ p, onAcierto }) {
  const [e, setE] = useState(null);
  const ok = e === p.correcta;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt} gap={6}>
        <SobreArqueo caja={p.caja} />
        <Regla r={R} suman={ok ? GASTADO + p.caja : null} />
        <Chips opciones={ZONAS_A3} elegida={e} correcta={p.correcta} onElegir={setE} rotulo={(o) => F.chips[o]} etiqueta={F.opcionesZona} />
      </Fig>
      {e && <Mensaje key={e} ok={ok} texto={ok ? p.acierto : p.errores[e]} />}
    </>
  );
}

/* P3 y P5 · el cheque: la aguja «caja + tu cheque» cae donde dice el cheque elegido. */
function ElCheque({ p, onAcierto }) {
  const [e, setE] = useState(null);
  const ok = e === p.correcta;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  const desv = e != null ? p.caja + e - FONDO : 0;
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt} gap={6}>
        <SobreArqueo caja={p.caja} />
        <Regla r={R} suman={GASTADO + p.caja}
          aguja2={e != null ? [{ id: "con-el-cheque", desv, mal: !ok }] : []}
          etiquetas={e != null ? [{ id: "tu-cheque", fila: "A", desv, valor: p.caja + e, texto: F.aguja, mal: !ok }] : []} />
        <Chips opciones={p.opciones} elegida={e} correcta={p.correcta} onElegir={setE} etiqueta={F.opcionesCheque} />
      </Fig>
      {e != null && <Mensaje key={e} ok={ok} texto={ok ? p.acierto : p.errores[e]} />}
    </>
  );
}

/* P4 y P7 · una ficha a su cuenta y su lado. Una sola ficha: el toque califica en el acto, sin «Comprobar» (prompt maestro §4.3; P2 de Hanayama, §5.2). */
function Ficha({ p, onAcierto }) {
  const [r, setR] = useState(null);
  const ok = Boolean(r) && r.id === p.va.id && r.lado === p.va.lado;
  useEffect(() => { if (ok) onAcierto?.(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  const k = (x) => `${x.id}:${x.lado}`;
  const totales = ok ? { ...p.base, [p.va.id]: { ...(p.base[p.va.id] ?? {}), [p.va.lado]: p.monto } } : p.base;
  const marcas = !r ? {} : { [k(r)]: ok ? "bien" : "mal" };
  const elegir = (id, lado) => { if (ok) return; setR({ id, lado }); };
  return (
    <>
      <Fig nombre={NOMBRE} alt={p.alt} gap={6}>
        <Rotulo>{F.asiento}</Rotulo>
        <Tablero cuentas={p.cuentas.map((c) => CUENTAS_A3[c])} totales={totales} puestas={{}} monto={cifra(p.monto)}
          onElegir={elegir} activo={!ok} marcas={marcas} recien={ok ? [k(p.va)] : []} etiqueta={F.tablero} />
      </Fig>
      {r && <Mensaje key={`${k(r)}-${ok}`} ok={ok} texto={ok ? p.acierto : (p.errores[r.id] ?? p.errores.lado)} />}
    </>
  );
}

/* P6 · el tramo de lo que falta, a la izquierda de la marca del fondo. */
function Tramo({ p }) {
  return (
    <Fig nombre={NOMBRE} alt={p.alt} gap={6}>
      <Regla r={R} suman={GASTADO + EFECTIVO_FALTANTE} tramos={[{ id: "dif", desv: -FALTANTE }]} />
    </Fig>
  );
}

/* P8 · dos caminos: cambiar de camino solo cambia la cuenta de los 6.700. No se califica. */
function Caminos({ p }) {
  const [asume, setAsume] = useState(false);
  const va = asume ? GNO : CXC;
  return (
    <Fig nombre={NOMBRE} alt={p.alt} gap={6}>
      <div className="t4a3-camino">
        {[[false, "cobra"], [true, "asume"]].map(([v, id]) => (
          <button key={id} type="button" className="t4r-btn2" data-accion={id} aria-pressed={asume === v} onClick={() => setAsume(v)}>{F.caminos[id]}</button>
        ))}
      </div>
      <Tablero cuentas={[GG, va, B].map((c) => CUENTAS_A3[c])} totales={{ [GG]: { [DEBE]: GASTADO }, [va]: { [DEBE]: FALTANTE }, [B]: { [HABER]: CHEQUE_FALTANTE } }}
        activo={false} conMarcas={false} recien={[`${va}:${DEBE}`]} etiqueta={F.tablero} />
    </Fig>
  );
}

function Quieta({ p }) {
  return <Fig nombre={NOMBRE} alt={p.alt} gap={6}><Regla r={R} suman={null} /></Fig>;
}

const MODOS = { contar: Contar, mover: Mover, zona: Zona, cheque: ElCheque, ficha: Ficha, tramo: Tramo, caminos: Caminos, quieta: Quieta };

export function CuerpoA3({ p, onAcierto }) {
  const M = MODOS[p.modo];
  return <M p={p} onAcierto={onAcierto} />;
}
