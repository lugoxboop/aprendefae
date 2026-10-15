import { FAE } from "../../../../theme.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { ESCENA_T6_A3, MOMENTOS_T6_A3, CUENTA_T_T6_A3 } from "../../../../data/contabilidadT6Pieza3.js";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, NAVY, BORDES } from "./MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a5 «LA CUENTA DE LA PROVISIÓN» · LA CUENTA QUE SE LLENA (hoja 1 de
 * Mai, calidad).
 *
 * Encima de la casilla, dos piezas que el estudiante ya conoce de T6 · A3, con
 * su estilo y sus palabras publicadas (ESCENA_T6_A3 y MOMENTOS_T6_A3):
 *   · el bloque «En el estado de situación financiera» (borde 1, radio 10,
 *     relleno 6/8/8; el neto bajo un filete);
 *   · la cuenta T «Provisión para deudas incobrables» (la de la capa 3), que
 *     arranca con el tutorial: $148.800 en el HABER.
 *
 * Cada casilla tiene su renglón, que se enciende (borde 2 nodo y relleno
 * navy) mientras está abierta. Al responder entra SIEMPRE el valor correcto,
 * se acierte o no: la cuenta es el registro, no la nota. Mientras se pregunta
 * el saldo, su hueco ocupa las dos columnas: el lado lo da la respuesta.
 *
 * En blanco y negro: el lado se lee por la palabra (DEBE, HABER) y la
 * columna; el saldo en contra, por «Le faltan», su sitio bajo DEBE y su
 * recuadro; el renglón activo, por el borde de 2 y el relleno.
 *
 * La cifra que entra aparece en 240 ms (opacidad y 4 px); con movimiento
 * reducido, de golpe. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const [DIC_2007, MARZO, DIC_SIGUIENTE] = MOMENTOS_T6_A3;
const E = ESCENA_T6_A3;
const LINEA_T = `2px solid ${BORDES}`;
const NOMBRE = { fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3 };
const MONTO = { margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: TEXTO };
const MOMENTO = { margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: SECUNDARIO };
const SALDO = { margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.35, color: TEXTO };

/* El resalte de la serie, sin moverse: borde de 2 transparente que se vuelve nodo, y margen −6. */
const resalte = (activo) => ({
  margin: "0 -6px", padding: "2px 6px", borderRadius: "8px",
  border: `2px solid ${activo ? NODO : "transparent"}`, background: activo ? NAVY : "transparent",
});
const marcaActivo = (activo) => (activo ? { "data-renglon-activo": "" } : {});

/* Una cifra que entra: aparece con opacidad y 4 px en 240 ms; con movimiento reducido, sin animación. */
export function Entra({ reducido, children }) {
  return <span data-entra="" style={{ display: "inline-block", animation: reducido ? "none" : "b5-entra 240ms ease-out both" }}>{children}</span>;
}

export const KEYFRAMES_ENTRA = "@keyframes b5-entra { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }";

/* Los pasos de la cuenta: qué se ve con `respondidas` casillas respondidas y la casilla `abierta` (o null). */
export function estadoDeLaCuenta(respondidas, abierta) {
  const r = (k) => respondidas > k;
  return {
    neto: { valor: r(0) ? E.valorNeto : null, activo: abierta === 0 },
    debe: abierta === 1 || r(1) ? [{ ...MARZO, monto: r(1) ? MARZO.monto : null, activo: abierta === 1 }] : [],
    haber: [
      { ...DIC_2007, activo: false },
      ...(abierta === 3 || r(3) ? [{ ...DIC_SIGUIENTE, monto: r(3) ? DIC_SIGUIENTE.monto : null, activo: abierta === 3 }] : []),
    ],
    /* El saldo: el de 2007 hasta el castigo; después, vacío hasta que se pregunta; en contra hasta el ajuste; al final, el del año siguiente. */
    saldo: r(4) ? DIC_SIGUIENTE.saldo : r(2) ? MARZO.saldo : r(1) ? null : DIC_2007.saldo,
    huecoSaldo: abierta === 2 || abierta === 4,
  };
}

function Columna({ lado, movimientos, reducido }) {
  return (
    <div data-columna={lado} style={{ padding: "6px 8px 4px", textAlign: "right", borderLeft: lado === "haber" ? LINEA_T : "none", minWidth: 0 }}>
      <p style={{ margin: "0 0 4px", textAlign: "center", fontFamily: SORA, fontSize: "9px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>
        {CUENTA_T_T6_A3[lado]}
      </p>
      {movimientos.map((m) => (
        <div key={m.id} data-movimiento={m.id} {...marcaActivo(m.activo)} style={{ marginTop: "6px", ...resalte(m.activo) }}>
          <p style={{ ...MONTO, minHeight: "17px" }}>{m.monto && (m.id === DIC_2007.id ? m.monto : <Entra reducido={reducido}>{m.monto}</Entra>)}</p>
          <p style={MOMENTO}>{m.nombre}</p>
        </div>
      ))}
    </div>
  );
}

export default function CuentaQueSeLlena({ respondidas, abierta, reducido, anuncio }) {
  const c = estadoDeLaCuenta(respondidas, abierta);
  return (
    <div data-cuenta-que-se-llena style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "0 0 12px" }}>
      <style>{KEYFRAMES_ENTRA}</style>

      {/* El estado de situación financiera (T6 · A3): Clientes, la provisión restada y, bajo un filete, el neto. */}
      <div data-bloque-estado style={{ border: `1px solid ${BORDES}`, borderRadius: "10px", padding: "6px 8px 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <p style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: SECUNDARIO }}>{E.estado}</p>
        {[[E.clientes, E.saldoClientes], [E.provision, E.menos]].map(([nombre, valor]) => (
          <div key={nombre} style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline", ...NOMBRE, color: TEXTO, ...resalte(false) }}>
            <span>{nombre}</span>
            <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{valor}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${BORDES}`, paddingTop: "6px" }}>
          <div data-fila-neto {...marcaActivo(c.neto.activo)} style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline", ...NOMBRE, color: TEXTO, ...resalte(c.neto.activo) }}>
            <span>{E.neto}</span>
            <span data-valor style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", minWidth: "1px" }}>{c.neto.valor && <Entra reducido={reducido}>{c.neto.valor}</Entra>}</span>
          </div>
        </div>
      </div>

      {/* La cuenta T de la provisión (capa 3 de T6 · A3). */}
      <div data-cuenta-t style={{ border: `1px solid ${BORDES}`, borderRadius: "12px", padding: "10px 12px 12px" }}>
        <p style={{ margin: 0, textAlign: "center", fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: TEXTO }}>{CUENTA_T_T6_A3.nombre}</p>
        <div style={{ marginTop: "6px", borderTop: LINEA_T, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <Columna lado="debe" movimientos={c.debe} reducido={reducido} />
          <Columna lado="haber" movimientos={c.haber} reducido={reducido} />
        </div>
        {c.saldo?.enContra && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "8px" }}>
            <p data-saldo="en-contra" style={{ ...SALDO, justifySelf: "start", padding: "5px 8px", borderRadius: "10px", border: `2px solid ${FAE.node}` }}>
              <Entra reducido={reducido}>{c.saldo.texto}</Entra>
            </p>
          </div>
        )}
        {/* Mientras se pregunta, el hueco del saldo ocupa las dos columnas: si estuviera bajo un lado, delataría la respuesta. */}
        {c.huecoSaldo && (
          <div data-saldo="hueco" data-renglon-activo="" style={{ marginTop: "8px", minHeight: "22px", ...resalte(true), margin: "8px -6px 0" }} />
        )}
        {c.saldo && !c.saldo.enContra && !c.huecoSaldo && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "8px" }}>
            <p data-saldo="normal" style={{ ...SALDO, gridColumn: "2", paddingTop: "4px", borderTop: `1px solid ${BORDES}`, textAlign: "right" }}>
              {respondidas > 4 ? <Entra reducido={reducido}>{c.saldo.texto}</Entra> : c.saldo.texto}
            </p>
          </div>
        )}
      </div>

      {/* Lo que entró, para el lector de pantalla. */}
      <p data-anuncio aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{anuncio}</p>
    </div>
  );
}

/* Lo que se anuncia al responder la casilla k (el valor correcto, que es lo que entra). */
export function anuncioDe(k) {
  const lado = (l) => CUENTA_T_T6_A3[l].charAt(0) + CUENTA_T_T6_A3[l].slice(1).toLowerCase();
  /* La fecha va en mitad de la frase: en minúscula («marzo del año siguiente»). Se nota en braille (Shoko). */
  const enFrase = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  if (k === 0) return `${E.neto}, ${E.valorNeto}`;
  if (k === 1) return `${lado(MARZO.lado)}, ${MARZO.monto}, ${enFrase(MARZO.nombre)}`;
  if (k === 2) return MARZO.saldo.texto;
  if (k === 3) return `${lado(DIC_SIGUIENTE.lado)}, ${DIC_SIGUIENTE.monto}, ${enFrase(DIC_SIGUIENTE.nombre)}`;
  return DIC_SIGUIENTE.saldo.texto;
}
