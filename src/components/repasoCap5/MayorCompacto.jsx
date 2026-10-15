import { useEffect, useState } from "react";
import { C, INTER, SORA } from "./comun.jsx";
import { cifra } from "./ToroNegro.jsx";
import { INTERFAZ_R5_1 } from "../../data/repasoCap5Cruzado.js";
import { useReproduccion, enFase } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MAYOR COMPACTO de las pantallas 2 y 6 (Itagaki, §c).
 *
 * Una sola caja con las cuentas apiladas y una sola cabecera: «DEBE» con su
 * barra teal y «HABER» con su barra ámbar (el color siempre con su palabra).
 * Cada cuenta: el nombre a todo el ancho; la fila A con el saldo de antes en
 * gris, en su columna, o «Sin saldo» centrado. Después del asiento, solo en
 * las cuentas que toca: la fila B con lo que entra y la fila C con la raya y
 * el saldo nuevo, en blanco.
 *
 * El asiento se reproduce así (§b): la cifra del debe y luego la del haber
 * bajan 16 px y aparecen (280 ms, 200 de desfase); luego la raya se dibuja
 * (200 ms) y el saldo cuenta del viejo al nuevo (400 ms). Una cuenta que el
 * asiento trae nueva (Costo de mercancía vendida en la 6) se despliega antes
 * al final del mayor (300 ms).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CIFRA_MS = 280;
const DESFASE_MS = 200;
const RAYA_MS = 200;
const CUENTA_MS = 400;
const NUEVA_MS = 300;

export function guionDeAsiento(cuentas) {
  const base = cuentas.some((c) => c.nueva) ? NUEVA_MS : 0;
  return {
    nueva: 0,
    debe: base,
    haber: base + DESFASE_MS,
    raya: base + DESFASE_MS + CIFRA_MS,
    saldo: base + DESFASE_MS + CIFRA_MS + RAYA_MS,
    total: base + DESFASE_MS + CIFRA_MS + RAYA_MS + CUENTA_MS,
  };
}

const firmado = (lado, valor) => (lado === "haber" ? -valor : valor);

/* El saldo nuevo, que cuenta desde el de antes cuando la fase anima. */
function SaldoQueCuenta({ fase, desde, hasta, retraso }) {
  const [pintado, setPintado] = useState(fase === "final" ? hasta : desde);
  useEffect(() => {
    if (fase !== "animando") { setPintado(fase === "final" ? hasta : desde); return undefined; }
    let id = null;
    const arranque = setTimeout(() => {
      const t0 = performance.now();
      const paso = (t) => {
        const x = Math.min(1, (t - t0) / CUENTA_MS);
        setPintado(desde + (hasta - desde) * (1 - (1 - x) ** 3));
        if (x < 1) id = requestAnimationFrame(paso);
      };
      id = requestAnimationFrame(paso);
    }, retraso);
    return () => { clearTimeout(arranque); if (id) cancelAnimationFrame(id); };
  }, [fase, desde, hasta, retraso]);
  return cifra(Math.round(Math.abs(pintado)));
}

const COLUMNA = { flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 8px", boxSizing: "border-box" };
const LINEA_CENTRAL = { width: "2px", alignSelf: "stretch", background: C.atenuado, flexShrink: 0 };

/* Una fila de dos columnas con la línea central; `lado` dice en cuál va el contenido. */
function Fila({ lado, children, alto = 28, dato }) {
  return (
    <div data-fila={dato} data-lado={lado} style={{ display: "flex", minHeight: `${alto}px` }}>
      <div style={COLUMNA}>{lado === "debe" ? children : null}</div>
      <span aria-hidden="true" style={LINEA_CENTRAL} />
      <div style={COLUMNA}>{lado === "haber" ? children : null}</div>
    </div>
  );
}

const ANTES = { fontFamily: INTER, fontSize: "14px", fontVariantNumeric: "tabular-nums", color: C.atenuado, whiteSpace: "nowrap" };
const NUEVO = { fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, whiteSpace: "nowrap" };

function Cuenta({ c, fase, g }) {
  const tocada = Boolean(c.entra);
  const entra = c.entra
    ? enFase(fase, { opacity: 0, transform: "translateY(-16px)" }, { opacity: 1, transform: "none" }, { ms: CIFRA_MS, retraso: c.entra.lado === "debe" ? g.debe : g.haber })
    : null;
  const raya = enFase(fase, { transform: "scaleX(0)" }, { transform: "scaleX(1)" }, { ms: RAYA_MS, retraso: g.raya });
  /*
   * Quieta (preparándose), la cuenta nueva ya ocupa su alto final, invisible:
   * así la página se desplaza sabiendo cuánto va a crecer la figura (E2).
   */
  const despliega = c.nueva && fase === "quieta"
    ? { opacity: 0 }
    : c.nueva
    ? enFase(fase, { maxHeight: "0px", opacity: 0 }, { maxHeight: fase === "final" ? "none" : "160px", opacity: 1 }, { ms: NUEVA_MS, retraso: g.nueva, propiedades: "max-height, opacity" })
    : null;
  return (
    <div data-cuenta={c.nombre} data-nueva={c.nueva ? "si" : "no"} style={{ marginTop: "8px", ...(despliega ? { overflow: "hidden", ...despliega } : {}) }}>
      <p style={{ margin: 0, padding: "0 0 2px", fontFamily: INTER, fontSize: "14px", fontWeight: 600, lineHeight: "18px", color: C.texto, borderBottom: `1px solid ${C.atenuado}` }}>
        {c.nombre}
      </p>
      <div style={{ height: "4px", display: "flex" }}><div style={{ flex: 1 }} /><span aria-hidden="true" style={LINEA_CENTRAL} /><div style={{ flex: 1 }} /></div>
      {c.saldo ? (
        <Fila lado={c.naturaleza} dato="antes"><span data-saldo-antes={c.saldo} style={ANTES}>{cifra(c.saldo)}</span></Fila>
      ) : (
        <div data-fila="antes" data-sin-saldo style={{ minHeight: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...ANTES, background: C.navy, padding: "0 6px", position: "relative" }}>{INTERFAZ_R5_1.sinSaldo}</span>
        </div>
      )}
      {tocada && (
        <>
          <Fila lado={c.entra.lado} dato="entra"><span data-entra={c.entra.valor} style={{ ...NUEVO, display: "inline-block", ...entra }}>{cifra(c.entra.valor)}</span></Fila>
          <div style={{ position: "relative" }}>
            <span aria-hidden="true" data-raya style={{ position: "absolute", left: 0, right: 0, top: 0, height: "1px", background: C.atenuado, transformOrigin: "left", ...raya }} />
            <Fila lado={c.saldoNuevo.lado} dato="saldo-nuevo">
              <span data-saldo-nuevo={c.saldoNuevo.valor} data-saldo-lado={c.saldoNuevo.lado} style={{ ...NUEVO, fontFamily: SORA }}>
                <SaldoQueCuenta
                  fase={fase}
                  desde={firmado(c.naturaleza, c.saldo)}
                  hasta={firmado(c.saldoNuevo.lado, c.saldoNuevo.valor)}
                  retraso={g.saldo}
                />
              </span>
            </Fila>
          </div>
        </>
      )}
    </div>
  );
}

/*
 * `cuentas`: el mayor antes de responder, o el de `mayorTrasAsiento` después.
 * `clave` cambia en cada reproducción.
 */
export function MayorCompacto({ cuentas, clave, onTerminar }) {
  const tras = cuentas.some((c) => c.entra);
  const g = guionDeAsiento(cuentas);
  const { fase, saltar } = useReproduccion(tras ? clave : null, tras ? g.total : 0, onTerminar);
  return (
    <div data-figura="mayor" data-fase={fase} onClick={saltar}>
      <p style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.atenuado }}>{INTERFAZ_R5_1.leyendaMayor}</p>
      <div data-cabecera-mayor style={{ display: "flex", marginTop: "6px", minHeight: "20px" }}>
        {[["debe", C.teal], ["haber", C.ambar]].map(([lado, color], k) => (
          <div key={lado} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", order: k * 2 }}>
            <span data-marca-lado={lado} style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", lineHeight: "14px", color: C.texto }}>
              {lado === "debe" ? INTERFAZ_R5_1.debe : INTERFAZ_R5_1.haber}
            </span>
            <span aria-hidden="true" data-barra-lado={lado} style={{ display: "block", width: "24px", height: "3px", marginTop: "3px", background: color }} />
          </div>
        ))}
        <span aria-hidden="true" style={{ ...LINEA_CENTRAL, order: 1 }} />
      </div>
      {cuentas.map((c) => <Cuenta key={c.nombre} c={c} fase={fase} g={g} />)}
    </div>
  );
}
