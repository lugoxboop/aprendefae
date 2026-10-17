import { FAE } from "../../../../theme.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { ESCENA_T6_A3, MOMENTOS_T6_A3, CUENTA_T_T6_A3 } from "../../../../data/contabilidadT6Pieza3.js";
import { SORA, INTER, TEXTO, SECUNDARIO, BORDES } from "./MaquinaPegada.jsx";
import { HUNDIDO_B, TEXTO_B } from "../b5/Devolucion.jsx";
import { BARRA_T6_ACT2 } from "../../../../data/contabilidadT6Act2.js";
import { FIGURAS_CAPA1_B } from "../../../../data/figurasCapa1B.js";
import { Eco, BarraNeto } from "./CifraQueMueve.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a2 «LA PROVISIÓN DE EL TORITO» · LA CUENTA QUE SE LLENA (hoja 1 de
 * Mai; en el lote 6b, la hoja de la fusión de a5 en a2).
 *
 * Nació en b5-t6-a5, que se retiró: ahora acompaña los cinco pasos de a2
 * (P1 → Asiento 1 → P2 → Asiento 2 → P3). Dos piezas que el estudiante ya
 * conoce de T6 · A3, con su estilo y sus palabras publicadas (ESCENA_T6_A3 y
 * MOMENTOS_T6_A3):
 *   · la cuenta T «Provisión para cuentas incobrables» (la de la capa 3), que
 *     arranca con el tutorial: $148.800 en el HABER. Va encima del paso y no
 *     se mueve en pantalla;
 *   · el bloque «En el estado de situación financiera» (borde 1, radio 10,
 *     relleno 6/8/8; el neto bajo un filete), solo en la pregunta 1, con «El
 *     valor neto» vacío y encendido.
 *
 * R10: mientras se arma un asiento no hay huecos. El renglón nuevo entra al
 * confirmar (siempre el del asiento correcto, se acierte o no: la cuenta es
 * el registro, no la nota) y queda encendido (borde 2 #F8F9FA, sin relleno:
 * lote 6d)
 * hasta el paso siguiente. El saldo ocupa las dos columnas mientras se
 * pregunta y aparece solo después de cada respuesta.
 *
 * En blanco y negro: el lado se lee por la palabra (DEBE, HABER) y la
 * columna; el saldo en contra, por «Le faltan», su sitio bajo DEBE y su
 * recuadro; el renglón activo, por el borde de 2 y el relleno.
 *
 * La cifra que entra aparece en 240 ms (opacidad y 4 px); con movimiento
 * reducido, de golpe. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LINEA_T = `2px solid ${BORDES}`;
const NOMBRE = { fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3 };
const MONTO = { margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: TEXTO };
const MOMENTO = { margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: SECUNDARIO };
const SALDO = { margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.35, color: TEXTO };

/* El resalte de la serie, sin moverse: borde de 2 transparente que se vuelve #F8F9FA (lote 6d: sin relleno navy), y margen −6. */
const resalte = (activo) => ({
  margin: "0 -6px", padding: "2px 6px", borderRadius: "8px",
  border: `2px solid ${activo ? TEXTO_B : "transparent"}`, background: "transparent",
});
const marcaActivo = (activo) => (activo ? { "data-renglon-activo": "" } : {});

/* Una cifra que entra: aparece con opacidad y 4 px en 240 ms; con movimiento reducido, sin animación. */
export function Entra({ reducido, children }) {
  return <span data-entra="" style={{ display: "inline-block", animation: reducido ? "none" : "b5-entra 240ms ease-out both" }}>{children}</span>;
}

export const KEYFRAMES_ENTRA = "@keyframes b5-entra { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }";

function Columna({ lado, movimientos, reducido, fijo }) {
  return (
    <div data-columna={lado} style={{ padding: "6px 8px 4px", textAlign: "right", borderLeft: lado === "haber" ? LINEA_T : "none", minWidth: 0 }}>
      <p style={{ margin: "0 0 4px", textAlign: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>
        {CUENTA_T_T6_A3[lado]}
      </p>
      {movimientos.map((m) => (
        <div key={m.id} data-movimiento={m.id} {...marcaActivo(m.activo)} style={{ marginTop: "6px", ...resalte(m.activo) }}>
          <p style={{ ...MONTO, minHeight: "17px" }}>{m.monto && (m.id === fijo ? m.monto : <Entra reducido={reducido}>{m.monto}</Entra>)}</p>
          <p style={MOMENTO}>{m.nombre}</p>
        </div>
      ))}
    </div>
  );
}

/* El prefijo publicado de un saldo («Le faltan», «El saldo queda en»): lo que va antes de la cifra. */
const prefijoDe = (texto) => texto.replace(/\s*[−-]?\$.*$/, "");
/* «provisión», el rótulo de la Barra del valor neto en la capa 1 (lote 10). */
const ROTULO_PROVISION = FIGURAS_CAPA1_B["b5-t6-a3-la-provision-de-un-ano-al-siguiente"][0].provision;

/*
 * D8 (lote 18): la T, el bloque del estado y lo que se anuncia, armados con los tres momentos, la escena y
 * la escala de la Barra de la vuelta (El Torito hoy; La Ceiba en la variante de Futaba).
 */
export function crearCuenta({ momentos, escena, barra }) {
  const [DIC_2007, MARZO, DIC_SIGUIENTE] = momentos;
  const E = escena;

  /*
   * Qué se ve en el paso `paso` (0-4) con su respuesta `comprobada` o no. Los
   * pasos: 0 · P1, el neto; 1 · Asiento 1, el castigo de marzo; 2 · P2, lo que
   * le falta; 3 · Asiento 2, el ajuste del año siguiente; 4 · P3, el saldo final.
   */
  function estadoDeLaCuenta(paso, comprobada) {
    const hecho = (k) => k < paso || (k === paso && comprobada);
    const encendido = (k) => k === paso && comprobada;
    let saldo = DIC_2007.saldo;
    if (hecho(4)) saldo = DIC_SIGUIENTE.saldo;
    else if (paso === 4 || hecho(3)) saldo = null;
    else if (hecho(2)) saldo = MARZO.saldo;
    else if (paso === 2 || hecho(1)) saldo = null;
    return {
      neto: { valor: hecho(0) ? E.valorNeto : null, activo: paso === 0 && !comprobada },
      debe: hecho(1) ? [{ ...MARZO, activo: encendido(1) }] : [],
      haber: [{ ...DIC_2007, activo: false }, ...(hecho(3) ? [{ ...DIC_SIGUIENTE, activo: encendido(3) }] : [])],
      saldo,
      /* El saldo se pregunta en P2 y en P3: su hueco, en las dos columnas, hasta que se responde. */
      huecoSaldo: (paso === 2 || paso === 4) && !comprobada,
      cierre: hecho(4),
    };
  }

  /*
   * El estado de situación financiera (T6 · A3): Clientes, la provisión restada y, bajo un filete, el neto.
   * Solo en la pregunta 1. Lote 17: la cifra escrita hace eco en «El valor neto» y mueve la Barra de abajo.
   */
  function BloqueEstado({ comprobada, reducido, texto = "" }) {
    const activo = !comprobada;
    return (
      <div data-bloque-estado style={{ ...HUNDIDO_B, borderRadius: "10px", padding: "6px 8px 8px", display: "flex", flexDirection: "column", gap: "6px", margin: "10px 0 0" }}>
        <p style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: SECUNDARIO }}>{E.estado}</p>
        {[[E.clientes, E.saldoClientes], [E.provision, E.menos]].map(([nombre, valor]) => (
          <div key={nombre} style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline", ...NOMBRE, color: TEXTO, ...resalte(false) }}>
            <span>{nombre}</span>
            <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{valor}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${BORDES}`, paddingTop: "6px" }}>
          <div data-fila-neto {...marcaActivo(activo)} style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline", ...NOMBRE, color: TEXTO, ...resalte(activo) }}>
            <span>{E.neto}</span>
            <span data-valor style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", minWidth: "1px", display: "inline-flex", alignItems: "center", height: "20px", alignSelf: "center" }}>
              {comprobada ? <Entra reducido={reducido}><Eco firme={E.valorNeto} /></Entra> : <Eco texto={texto} />}
            </span>
          </div>
        </div>
        <BarraNeto texto={texto} comprobada={comprobada} escala={barra} rotulo={ROTULO_PROVISION} reducido={reducido} />
      </div>
    );
  }

  function CuentaQueSeLlena({ paso, comprobada, reducido, cierre = null, texto = "" }) {
    const c = estadoDeLaCuenta(paso, comprobada);
    return (
      <div data-cuenta-que-se-llena style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "0 0 12px" }}>
        <style>{KEYFRAMES_ENTRA}</style>

        {/* La cuenta T de la provisión (capa 3 de T6 · A3). */}
        {/* Lote 6d: la cuenta T va en el hundido de Cuentas. */}
        <div data-cuenta-t style={{ ...HUNDIDO_B, borderRadius: "12px", padding: "10px 12px 12px" }}>
          <p style={{ margin: 0, textAlign: "center", fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: TEXTO }}>{CUENTA_T_T6_A3.nombre}</p>
          <div style={{ marginTop: "6px", borderTop: LINEA_T, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <Columna lado="debe" movimientos={c.debe} reducido={reducido} fijo={DIC_2007.id} />
            <Columna lado="haber" movimientos={c.haber} reducido={reducido} fijo={DIC_2007.id} />
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
            <div data-saldo="hueco" data-renglon-activo="" style={{ minHeight: "22px", height: "22px", ...resalte(true), margin: "8px -6px 0", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "20px" }}>
              {/* Lote 17: el eco de la cifra escrita, con las palabras del saldo que se pregunta. */}
              <Eco texto={texto} prefijo={prefijoDe((paso === 2 ? MARZO : DIC_SIGUIENTE).saldo.texto)} />
            </div>
          )}
          {c.saldo && !c.saldo.enContra && !c.huecoSaldo && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "8px" }}>
              <p data-saldo="normal" style={{ ...SALDO, gridColumn: "2", paddingTop: "4px", borderTop: `1px solid ${BORDES}`, textAlign: "right" }}>
                {c.cierre ? <Entra reducido={reducido}>{c.saldo.texto}</Entra> : c.saldo.texto}
              </p>
            </div>
          )}
        </div>

        {/* El cierre, debajo de la T, después de la pregunta 3. */}
        {c.cierre && cierre && (
          <p data-cierre-t style={{ margin: 0, padding: "8px 10px", borderRadius: "10px", background: "rgba(184,196,212,0.13)", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: TEXTO }}>
            <Entra reducido={reducido}>{cierre}</Entra>
          </p>
        )}

        {/* Lo que entró, para el lector de pantalla. */}
        <p data-anuncio aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{comprobada ? anuncioDe(paso) : ""}</p>
      </div>
    );
  }

  /* Lo que se anuncia al comprobar el paso k (lo que entra a la cuenta, que es siempre lo correcto). */
  function anuncioDe(k) {
    const lado = (l) => CUENTA_T_T6_A3[l].charAt(0) + CUENTA_T_T6_A3[l].slice(1).toLowerCase();
    /* La fecha va en mitad de la frase: en minúscula («marzo del año siguiente»). Se nota en braille (Shoko). */
    const enFrase = (t) => t.charAt(0).toLowerCase() + t.slice(1);
    const movimiento = (m) => `${lado(m.lado)}, ${m.monto}, ${enFrase(m.nombre)}`;
    if (k === 0) return `${E.neto}, ${E.valorNeto}`;
    if (k === 1) return movimiento(MARZO);
    if (k === 2) return MARZO.saldo.texto;
    if (k === 3) return movimiento(DIC_SIGUIENTE);
    return DIC_SIGUIENTE.saldo.texto;
  }

  return { CuentaQueSeLlena, BloqueEstado, estadoDeLaCuenta, anuncioDe };
}

const HOY = crearCuenta({ momentos: MOMENTOS_T6_A3, escena: ESCENA_T6_A3, barra: BARRA_T6_ACT2 });
export default HOY.CuentaQueSeLlena;
export const { BloqueEstado, estadoDeLaCuenta, anuncioDe } = HOY;
