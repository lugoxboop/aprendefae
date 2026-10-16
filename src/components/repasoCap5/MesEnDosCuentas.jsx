import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { C, INTER, MARCA } from "./comun.jsx";
import { cifra } from "./ToroNegro.jsx";
import { MES_COMUN } from "../../data/repasoCap5Comun.js";
import { estadoDelMes, anchosDelLado, diferenciaDe } from "../../data/repasoCap5Mes.js";
import { useReducido, useTemporizadores, enFase } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «EL MES EN DOS CUENTAS» — el panel común de r5-3 y r5-4 (Célula E).
 *
 * Paquete e5-mes-en-dos-cuentas, con las correcciones de Takamura, que mandan:
 *
 *   · va DESPUÉS de la devolución, sin desplazamiento forzado; su animación
 *     arranca cuando entra en la ventana (con reduced-motion, estado final);
 *   · lo de este asiento va RAYADO (rayas #0E1B2E de 2 px con 2 de hueco sobre
 *     el color de su lado), lo acumulado liso, con un corte de 2 px #1D3557;
 *   · un asiento que no toca ninguna de las dos cuentas lleva la versión
 *     compacta: la marca y la línea de Miyata, sin barras.
 *
 * Cada cuenta: DEBE con su barra teal y HABER con su barra ámbar (el color
 * siempre con su palabra), el acumulado de cada lado y la diferencia, sin
 * color. La escala es fija todo el mes y las barras solo crecen.
 *
 * Animación (§c): lo rayado del asiento anterior pasa a liso (120 ms); cada
 * renglón del asiento correcto que toca una de las cuentas, en su orden, hace
 * crecer su tramo y cuenta su acumulado (400 ms, 150 de desfase); luego la
 * diferencia cuenta (300 ms) y, si cambia de lado, la frase se funde (200 ms).
 * Un toque en el panel salta al estado final.
 *
 * `hasta` es el índice del asiento en curso; null es la pantalla final (todo
 * liso, sin leyenda, y la diferencia de la cuenta `final.cuenta` cambiada por
 * su frase final).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LISO_MS = 120;
const TRAMO_MS = 400;
const DESFASE_MS = 150;
const DIF_MS = 300;
const FUNDIDO_MS = 200;
const RAYAS = (color) => `repeating-linear-gradient(45deg, ${C.fondo} 0 2px, transparent 2px 4px), linear-gradient(${color}, ${color})`;
const LINEA = "1px solid rgba(184,196,212,0.25)";

/* El guion de la animación del asiento `hasta`: cuándo crece cada tramo. */
export function guionDelMes(movs, hasta) {
  if (hasta === null) return { tramos: {}, total: 0 };
  const orden = [];
  for (const m of movs[hasta]) {
    const k = `${m.cuenta}|${m.lado}`;
    if (!orden.includes(k)) orden.push(k);
  }
  const tramos = Object.fromEntries(orden.map((k, i) => [k, LISO_MS + i * DESFASE_MS]));
  const fin = orden.length ? LISO_MS + (orden.length - 1) * DESFASE_MS + TRAMO_MS : LISO_MS;
  return { tramos, diferencia: fin, total: fin + DIF_MS };
}

/* Una cifra que cuenta de `desde` a `hasta` cuando la fase anima. */
function Cuenta({ fase, desde, hasta, retraso, ms }) {
  const [v, setV] = useState(fase === "final" ? hasta : desde);
  useEffect(() => {
    if (fase !== "animando") { setV(fase === "final" ? hasta : desde); return undefined; }
    let id = null;
    const t = setTimeout(() => {
      const t0 = performance.now();
      const paso = (ahora) => {
        const x = Math.min(1, (ahora - t0) / ms);
        setV(desde + (hasta - desde) * (1 - (1 - x) ** 3));
        if (x < 1) id = requestAnimationFrame(paso);
      };
      id = requestAnimationFrame(paso);
    }, retraso);
    return () => { clearTimeout(t); if (id) cancelAnimationFrame(id); };
  }, [fase, desde, hasta, retraso, ms]);
  return cifra(Math.round(v));
}

function Lado({ lado, rotulo, datos, anchos, fase, retraso }) {
  const color = lado === "debe" ? C.teal : C.ambar;
  const crece = enFase(fase, { width: "0px" }, { width: `${anchos.tramo}px` }, { ms: TRAMO_MS, retraso, propiedades: "width" });
  const sinRayas = enFase(fase, { opacity: 1 }, { opacity: 0 }, { ms: LISO_MS, propiedades: "opacity" });
  return (
    <div data-lado-mes={lado} style={{ marginTop: lado === "haber" ? "6px" : "6px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", minHeight: "20px" }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: "6px", minWidth: 0 }}>
          <span style={{ ...MARCA, flexShrink: 0 }}>{lado === "debe" ? MES_COMUN.debe : MES_COMUN.haber}</span>
          <span style={{ fontFamily: INTER, fontSize: "13px", color: C.texto }}>{rotulo}</span>
        </span>
        <span data-acumulado={datos.total} style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, whiteSpace: "nowrap" }}>
          <Cuenta fase={fase} desde={datos.antes} hasta={datos.total} retraso={retraso} ms={TRAMO_MS} />
        </span>
      </div>
      {/* El riel: lo liso, lo del asiento anterior (rayado que pasa a liso) y el tramo de este asiento, rayado. */}
      <div aria-hidden="true" data-riel={lado} style={{ position: "relative", height: "10px", marginTop: "4px", borderRadius: "2px", background: C.fondo, overflow: "hidden" }}>
        <span data-liso style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${anchos.liso + anchos.previo}px`, background: color }} />
        {anchos.previo > 0 && (
          <span data-previo style={{ position: "absolute", left: `${anchos.liso}px`, top: 0, bottom: 0, width: `${anchos.previo}px`, backgroundImage: RAYAS(color), borderLeft: `2px solid ${C.navy}`, boxSizing: "border-box", ...sinRayas }} />
        )}
        {anchos.tramo > 0 && (
          <span data-tramo={anchos.tramo} style={{ position: "absolute", left: `${anchos.liso + anchos.previo}px`, top: 0, bottom: 0, backgroundImage: RAYAS(color), borderLeft: `2px solid ${C.navy}`, boxSizing: "border-box", ...crece }} />
        )}
      </div>
    </div>
  );
}

function CuentaDelMes({ c, movs, hasta, ancho, fase, guion, fraseFinal }) {
  const anchos = (lado) => anchosDelLado(movs, c.cuenta, lado, c.escala, ancho, hasta);
  const antes = diferenciaDe(c.debe.antes, c.haber.antes);
  const ahora = diferenciaDe(c.debe.total, c.haber.total);
  const frase = (d) => (d.lado === null ? MES_COMUN.sinDiferencia : d.lado === "debe" ? c.difDebe : c.difHaber);
  const retrasoDe = (lado) => guion.tramos[`${c.cuenta}|${lado}`] ?? 0;
  const cambia = frase(antes) !== frase(ahora);
  const fundido = cambia ? enFase(fase, { opacity: 0 }, { opacity: 1 }, { ms: FUNDIDO_MS, retraso: guion.diferencia, propiedades: "opacity" }) : {};
  return (
    <div data-cuenta-mes={c.cuenta}>
      <p style={{ margin: 0, fontFamily: INTER, fontSize: "14px", fontWeight: 600, lineHeight: "20px", color: C.texto }}>{c.nombre}</p>
      <Lado lado="debe" rotulo={c.debe_rotulo} datos={c.debe} anchos={anchos("debe")} fase={fase} retraso={retrasoDe("debe")} />
      <Lado lado="haber" rotulo={c.haber_rotulo} datos={c.haber} anchos={anchos("haber")} fase={fase} retraso={retrasoDe("haber")} />
      <div data-diferencia={ahora.lado ?? "ninguna"} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", minHeight: "22px", marginTop: "8px", paddingTop: "4px", borderTop: LINEA }}>
        {fraseFinal ? (
          <p data-frase-final style={{ margin: 0, fontFamily: INTER, fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: C.texto }}>{fraseFinal}</p>
        ) : (
          <>
            <span style={{ fontFamily: INTER, fontSize: "14px", fontWeight: 600, color: C.texto, ...(fase === "final" || !cambia ? {} : fundido) }}>
              {fase === "inicio" ? frase(antes) : frase(ahora)}
            </span>
            <span data-valor-diferencia={ahora.valor} style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, whiteSpace: "nowrap" }}>
              <Cuenta fase={fase} desde={antes.valor} hasta={ahora.valor} retraso={guion.diferencia} ms={DIF_MS} />
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/*
 * `cuentas`: [{ cuenta, nombre, debe, haber, difDebe, difHaber }] (los rótulos
 * de Miyata de cada pieza). `movs`: movimientosDelMes. `linea`: la línea del
 * asiento que no toca ninguna de las dos (versión compacta). `final`: la
 * cuenta cuya diferencia cambia por la frase final en la pantalla final.
 */
export function MesEnDosCuentas({ cuentas, movs, hasta, linea = null, final = null }) {
  const reducido = useReducido();
  const { despues } = useTemporizadores();
  const caja = useRef(null);
  const [ancho, setAncho] = useState(264);
  const compacta = hasta !== null && movs[hasta].length === 0;
  const guion = guionDelMes(movs, hasta);
  /* «espera» hasta entrar en la ventana; luego anima; «final» al acabar o al tocar. */
  const [fase, setFase] = useState(reducido || hasta === null || compacta ? "final" : "espera");

  useLayoutEffect(() => {
    const riel = caja.current?.querySelector("[data-riel]");
    if (riel?.clientWidth) setAncho(riel.clientWidth);
  }, []);

  useEffect(() => {
    if (fase !== "espera") return undefined;
    const empezar = () => {
      setFase("inicio");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setFase((f) => (f === "inicio" ? "animando" : f));
        despues(guion.total, () => setFase("final"));
      }));
    };
    if (typeof IntersectionObserver !== "function" || !caja.current) { empezar(); return undefined; }
    const obs = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting && e.intersectionRatio >= 0.99)) { obs.disconnect(); empezar(); }
    }, { threshold: [0, 0.5, 0.99, 1] });
    obs.observe(caja.current);
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saltar = () => { if (fase !== "final") setFase("final"); };
  /* Mientras espera a entrar en la ventana, se pinta como al inicio: el estado anterior. */
  const vista = fase === "espera" ? "inicio" : fase;

  if (compacta) {
    return (
      <div ref={caja} data-mes-en-dos-cuentas="compacta" style={{ marginTop: "16px", background: C.navy, borderRadius: "12px", padding: "12px" }}>
        <p style={{ ...MARCA, margin: 0 }}>{MES_COMUN.marca}</p>
        <p data-linea-mes style={{ margin: "6px 0 0", paddingLeft: "10px", borderLeft: `3px solid ${C.hecho}`, fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 600, color: C.texto }}>{linea}</p>
      </div>
    );
  }

  const estado = estadoDelMes(movs, cuentas, hasta).map((c, k) => ({ ...c, debe_rotulo: cuentas[k].debe, haber_rotulo: cuentas[k].haber }));
  return (
    <div
      ref={caja}
      data-mes-en-dos-cuentas={hasta === null ? "final" : "asiento"}
      data-fase={fase}
      onClick={saltar}
      style={{ marginTop: "16px", background: C.navy, borderRadius: "12px", padding: "12px" }}
    >
      <p style={{ ...MARCA, margin: 0, lineHeight: "14px" }}>{MES_COMUN.marca}</p>
      {hasta !== null && (
        <div data-leyenda-mes style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", minHeight: "16px" }}>
          <span aria-hidden="true" style={{ width: "16px", height: "10px", borderRadius: "2px", backgroundImage: RAYAS(C.hecho), flexShrink: 0 }} />
          <span style={{ fontFamily: INTER, fontSize: "12px", color: C.atenuado }}>{MES_COMUN.leyenda}</span>
        </div>
      )}
      {estado.map((c, k) => {
        const conFrase = hasta === null && final && final.cuenta === c.cuenta;
        const d = diferenciaDe(c.debe.total, c.haber.total);
        return (
          <div key={c.cuenta} style={k ? { marginTop: "6px", paddingTop: "7px", borderTop: LINEA } : { marginTop: "10px" }}>
            <CuentaDelMes c={c} movs={movs} hasta={hasta} ancho={ancho} fase={vista} guion={guion} fraseFinal={conFrase ? final[d.lado === "debe" ? "debe" : "haber"](d.valor) : null} />
          </div>
        );
      })}
    </div>
  );
}
