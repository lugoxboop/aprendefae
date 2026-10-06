import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { MESES, SAN_CALIXTO_P4, CONSIGNA_CAPA_3_P4 } from "../../../../data/contabilidadTema3Pieza4.js";
import { pesos } from "../../../../contabilidad/dosLineas.js";
import { estadoCapa3P4, MS_VUELO, ESCALON_VUELO } from "../../../../contabilidad/loQueYaSePago.js";
import DosLineas, { useReducido } from "./DosLineas.jsx";
import BloqueAnticipo, { useVuelo } from "./BloqueAnticipo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · CAPA 3 · «AHORA PRUEBE USTED» — un botón por mes (Xeno, P2 §6).
 *
 * El estado sale del mes tocado, no del orden: junio deja $10.000 en el
 * bloque y $5.000 de gasto; julio, $5.000 y $10.000; agosto, $0 y $15.000.
 * Las fichas que cambian vuelan —hacia arriba si se consumen, hacia abajo si
 * regresan—, 700 ms escalonadas 150 ms. Si se salta de junio a agosto, se ven
 * las dos fichas intermedias. Con movimiento reducido, todo al instante.
 *
 * Solo San Calixto, sin chip de empresa: el nombre queda en el rótulo del
 * bloque.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const SOLO_LECTOR = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };
const cerradosDe = (mes) => (mes === null ? 0 : MESES.indexOf(mes) + 1);
const cabezaDe = (caja, i) => caja?.querySelector(`[data-hecho="${SAN_CALIXTO_P4.id}-cierre-${i}"]`)?.children?.[1] ?? null;

function Visto() {
  return (
    <span data-visto-insignia aria-hidden="true" style={{
      position: "absolute", top: "-8px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%",
      background: COLOR.neutro, display: "grid", placeItems: "center",
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke={COLOR.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export default function CadaMes() {
  const reducido = useReducido();
  const [mes, setMes] = useState(null);
  const [vistos, setVistos] = useState([]);
  const [anuncio, setAnuncio] = useState("");
  const [vuelta, setVuelta] = useState(0);
  const escena = useRef(null);
  const volar = useVuelo(escena, { reducido, ms: MS_VUELO });
  /* Lo que hay que hacer volar tras pintar el mes nuevo. */
  const pendientes = useRef(null);
  const [retrasos, setRetrasos] = useState({});

  const base = useMemo(() => estadoCapa3P4(mes), [mes]);
  const estado = useMemo(() => ({
    ...base,
    marcas: base.marcas.map((m) => {
      const i = Number(m.hecho.split("-cierre-")[1]);
      return Number.isInteger(i) && retrasos[i] !== undefined ? { ...m, retraso: retrasos[i] } : m;
    }),
  }), [base, retrasos]);

  const tocar = (nuevo) => {
    const antes = cerradosDe(mes);
    const despues = cerradosDe(nuevo);
    const caja = escena.current;
    if (!reducido && caja && antes !== despues) {
      if (despues > antes) {
        /* Se consumen: de cada ficha a la cabeza de su marca, que aparece al llegar. */
        const viajes = [];
        const r = {};
        for (let i = antes; i < despues; i++) {
          const orden = i - antes;
          viajes.push({ i, desde: caja.querySelector(`[data-ficha-mes="${i}"]`)?.getBoundingClientRect(), retraso: orden * ESCALON_VUELO, haciaMarca: true });
          r[i] = MS_VUELO - 140 + orden * ESCALON_VUELO;
        }
        pendientes.current = viajes;
        setRetrasos(r);
      } else {
        /* Regresan: de la cabeza de cada marca a su ficha. */
        const viajes = [];
        for (let i = antes - 1; i >= despues; i--) {
          viajes.push({ i, desde: cabezaDe(caja, i)?.getBoundingClientRect(), retraso: (antes - 1 - i) * ESCALON_VUELO, haciaMarca: false });
        }
        pendientes.current = viajes;
        setRetrasos({});
      }
    } else {
      setRetrasos({});
    }
    setMes(nuevo);
    setVistos((v) => (v.includes(nuevo) ? v : [...v, nuevo]));
    const e = estadoCapa3P4(nuevo);
    setVuelta((n) => n + 1);
    setAnuncio(`${nuevo}. ${e.bloque.cuenta}: ${pesos(e.bloque.saldo)}.`);
  };

  useLayoutEffect(() => {
    const viajes = pendientes.current;
    pendientes.current = null;
    if (!viajes?.length) return;
    const caja = escena.current;
    volar(viajes.map((v) => {
      const destino = v.haciaMarca ? cabezaDe(caja, v.i) : caja?.querySelector(`[data-ficha-mes="${v.i}"]`);
      return { desde: v.desde, hasta: destino?.getBoundingClientRect(), retraso: v.retraso, relleno: "llena" };
    }));
  }, [mes]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-capa3-p4 style={{ position: "relative" }}>
      <p style={{ margin: "0 0 10px", padding: "0 8px", fontFamily: SORA, fontSize: "14px", fontWeight: 600, color: COLOR.blanco }}>{CONSIGNA_CAPA_3_P4}</p>

      <div className="fae-dl" role="group" aria-label="Meses" style={{ display: "flex", gap: "8px", padding: "0 8px", margin: "0 0 14px" }}>
        {MESES.map((m) => {
          const activo = mes === m;
          return (
            <button
              key={m}
              type="button"
              data-boton-mes={m}
              data-visto={vistos.includes(m) ? "si" : "no"}
              aria-pressed={activo}
              onClick={() => tocar(m)}
              style={{
                position: "relative", flex: "1 1 0", minWidth: "44px", height: "52px", borderRadius: "12px", cursor: "pointer",
                fontFamily: SORA, fontSize: "14px", fontWeight: activo ? 700 : 600,
                background: activo ? COLOR.neutro : "transparent",
                border: `2px solid ${COLOR.neutro}`,
                color: activo ? COLOR.navy : COLOR.blanco,
              }}
            >
              {m}
              {vistos.includes(m) && <Visto />}
            </button>
          );
        })}
      </div>

      <div ref={escena} style={{ position: "relative" }}>
        <DosLineas
          estado={estado}
          empresa={estado.empresa}
          sinEmpresa
          salidaMs={200}
          msContador={reducido ? 0 : MS_VUELO}
          calendario={estado.calendario}
          pie={<BloqueAnticipo bloque={estado.bloque} reducido={reducido} msSaldo={MS_VUELO} />}
        />
      </div>

      {/* Lo que se anuncia al elegir: «{Mes}. {Cuenta}: {saldo}.» */}
      <div data-anuncio-p4 aria-live="polite" aria-atomic="true" style={SOLO_LECTOR}>
        <span key={vuelta}>{anuncio}</span>
      </div>
    </div>
  );
}
