import { FAE } from "../../../../theme.js";
import {
  T6_ACT6, GRUPOS_T6_ACT6, PARTES_T6_ACT6, PIES_T6_ACT6, ESCENARIO_T6_ACT6, ROTULOS_TOTAL_T6_ACT6,
} from "../../../../data/contabilidadT6Act6.js";
import { pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import { pesos } from "../../../../data/contabilidad.js";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, NAVY, BORDES } from "./MaquinaPegada.jsx";
import { Entra, KEYFRAMES_ENTRA } from "./CuentaQueSeLlena.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a6 «PROVISIÓN POR EDADES» · LOS CAJONES DEL TIEMPO Y LA PORCIÓN QUE
 * NO SE COBRA (hoja 2 de Mai, calidad).
 *
 * El visual de la actividad, encima de la casilla, y su registro:
 *   · la nota y la tabla de la regla, con su pie (rótulo y fuente del
 *     porcentaje), como en calidad 1;
 *   · parte 1: bajo la tabla, el eje de los cajones (22 · 22 · 28 · 28 %, con
 *     las marcas «3 meses», «6 meses» y «1 año»). El último cajón, «más de 1
 *     año», queda ABIERTO: sin borde derecho, sus bordes se desvanecen; ningún
 *     tope que el libro no pone (Shoko). La deuda de la casilla espera
 *     ENCIMA del eje, siempre en el mismo sitio y sin palito: su posición no
 *     puede delatar el grupo (Shoko). Al responder cae en su cajón CORRECTO
 *     (320 ms; con movimiento reducido, ya dentro), del todo dentro de él:
 *     «6 meses» queda en «Más de 3 hasta 6 meses» sin tocar la marca;
 *   · parte 2: cada fila gana una barra del mismo largo, con la porción
 *     provisionada rellena al final (5, 10 y 15 % del largo) y la provisión
 *     del grupo, que entra al responder. En la casilla 7 aparece la barra
 *     del total, con su porción (la provisión) y, debajo, «El valor neto» y
 *     «La provisión».
 *
 * Lo que entra es siempre el valor correcto. En blanco y negro: los cajones
 * se leen por sus marcas y su orden; la porción es relleno y el resto
 * contorno; lo activo, por el borde de 2 y el relleno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BORDE = "rgba(248,249,250,0.14)";
const BORDE_TENUE = "rgba(248,249,250,0.08)";
const BORDE_FUERTE = "rgba(248,249,250,0.32)";
const TENUE = "rgba(203,220,242,0.12)";
const LINEA_PIE = { margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px" };
const NOMBRE = { fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, color: TEXTO };
const CIFRA = { fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: TEXTO };
const PEQUENO = { fontFamily: INTER, fontSize: "12px", lineHeight: "16px" };

const [UBICAR, CALCULAR] = PARTES_T6_ACT6;
const N1 = UBICAR.casillas.length;
const MONTOS = Object.fromEntries(CALCULAR.datos.filas.filter((f) => !f.total).map((f) => [f.nombre, f.valor]));
const TOTAL = CALCULAR.datos.filas.find((f) => f.total);
const correcta = (c) => c.opciones.find((o) => o.tipo === null);
/* La casilla de la parte 2 que da la provisión de cada grupo (la 4, la 5 y la 6), y las del total (7 y 8). */
const CASILLA_DE_GRUPO = { g2: "p4", g3: "p5", g4: "p6" };
const [P7, P8] = ["p7", "p8"].map((id) => CALCULAR.casillas.find((c) => c.id === id));

/* ═══════════ EL EJE DE LOS CAJONES (parte 1) ═══════════ */

const ANCHOS = [22, 22, 28, 28];
const BORDES_EJE = ANCHOS.reduce((xs, a) => [...xs, xs[xs.length - 1] + a], [0]); // 0 · 22 · 44 · 72 · 100
/* Las marcas, con las palabras de los nombres de los grupos: «3 meses», «6 meses», «1 año». */
const MARCAS = GRUPOS_T6_ACT6.slice(0, 3).map((g, k) => ({ en: BORDES_EJE[k + 1], texto: g.nombre.match(/(\d+ (meses|año))$/)[1] }));
const centroDe = (k) => BORDES_EJE[k] + ANCHOS[k] / 2;
const deudaDe = (c) => c.enunciado.match(/(\d+) meses/)[0];
/* El cajón correcto de una deuda: el del grupo de su opción correcta. */
const cajonDe = (c) => GRUPOS_T6_ACT6.findIndex((g) => g.nombre === correcta(c).texto);

const ALTO_PASTILLA = 24;
/* La deuda espera encima del eje, separada de él: nunca sobre sus meses. */
const TOPE_BARRA = ALTO_PASTILLA + 10;
const ULTIMO = GRUPOS_T6_ACT6.length - 1;
/* El borde que se desvanece, arriba y abajo del último cajón: queda abierto. */
const DESVANECE = `linear-gradient(to right, ${BORDES}, transparent)`;
const ALTO_BARRA = 30;

function Eje({ respondidas, abierta, reducido }) {
  const actual = abierta ?? respondidas - 1;
  return (
    <div data-eje {...(abierta !== null ? { "data-renglon-activo": "" } : {})} style={{ position: "relative", height: `${TOPE_BARRA + ALTO_BARRA + 4 + 16}px`, margin: "4px 0 12px" }}>
      {/* La barra, partida en cuatro cajones. */}
      <div style={{ position: "absolute", top: `${TOPE_BARRA}px`, left: 0, right: 0, height: `${ALTO_BARRA}px`, display: "flex" }}>
        {GRUPOS_T6_ACT6.map((g, k) => {
          const tiene = UBICAR.casillas.some((c, i) => i < respondidas && cajonDe(c) === k);
          /* El cajón de la deuda recién respondida se ilumina; los que ya tienen una deuda quedan con fondo tenue. */
          const recien = abierta === null && cajonDe(UBICAR.casillas[actual]) === k;
          return (
            <div key={g.id} data-cajon={g.id} data-con-deuda={tiene ? "si" : "no"} {...(k === ULTIMO ? { "data-abierto": "" } : {})} style={{
              width: `${ANCHOS[k]}%`, boxSizing: "border-box", borderLeft: `1px solid ${BORDES}`,
              ...(k === ULTIMO
                ? { borderRight: "none", backgroundImage: `${DESVANECE}, ${DESVANECE}`, backgroundSize: "100% 1px", backgroundPosition: "top, bottom", backgroundRepeat: "no-repeat" }
                : { borderTop: `1px solid ${BORDES}`, borderBottom: `1px solid ${BORDES}` }),
              borderRadius: k === 0 ? "6px 0 0 6px" : 0,
              backgroundColor: recien ? NAVY : tiene ? TENUE : "transparent", boxShadow: recien ? `inset 0 0 0 2px ${NODO}` : "none",
            }} />
          );
        })}
      </div>
      {/* Las marcas, bajo los bordes interiores. */}
      {MARCAS.map((m) => (
        <span key={m.texto} data-marca style={{ position: "absolute", top: `${TOPE_BARRA + ALTO_BARRA + 4}px`, left: `${m.en}%`, transform: "translateX(-50%)", ...PEQUENO, color: SECUNDARIO, whiteSpace: "nowrap" }}>{m.texto}</span>
      ))}
      {/* Las deudas: las ya ubicadas, en su cajón; la de la casilla, como pastilla sobre su mes, y al responder, cae. */}
      {UBICAR.casillas.map((c, i) => {
        if (i > actual) return null;
        const enCajon = i < respondidas;
        const k = cajonDe(c);
        const anterior = enCajon && i !== actual;
        return (
          <span key={c.id} data-deuda={c.id} data-en-cajon={enCajon ? GRUPOS_T6_ACT6[k].id : ""} style={{
            position: "absolute", height: `${ALTO_PASTILLA}px`, boxSizing: "border-box", padding: enCajon ? "4px 0" : "2px 6px", borderRadius: "999px",
            top: enCajon ? `${TOPE_BARRA + (ALTO_BARRA - ALTO_PASTILLA) / 2}px` : 0,
            /* Esperando, siempre al inicio del eje, encima de él; en su cajón, centrada en él. */
            left: `${enCajon ? centroDe(k) : 0}%`, transform: enCajon ? "translateX(-50%)" : "none",
            border: enCajon ? "none" : `2px solid ${NODO}`, background: enCajon ? "transparent" : NAVY,
            ...PEQUENO, fontWeight: 600, whiteSpace: "nowrap", color: anterior ? SECUNDARIO : TEXTO,
            transition: reducido ? "none" : "top 320ms ease-out, left 320ms ease-out",
          }}>
            {deudaDe(c)}
          </span>
        );
      })}
    </div>
  );
}

/* ═══════════ LA TABLA, CON SUS BARRAS (parte 2) ═══════════ */

const resalte = (activo) => ({
  margin: "0 -6px", padding: "4px 6px", borderRadius: "8px",
  border: `2px solid ${activo ? NODO : "transparent"}`, background: activo ? NAVY : "transparent",
});

/* Una barra de largo fijo, con la porción rellena al final y su porcentaje del largo. */
function Barra({ porcentaje, alto }) {
  return (
    <span data-barra style={{ flex: "1 1 auto", minWidth: "40px", height: `${alto}px`, border: `1px solid ${BORDES}`, borderRadius: "3px", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {porcentaje > 0 && <span data-porcion={porcentaje} style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${porcentaje}%`, background: NODO }} />}
    </span>
  );
}

function FilaGrupo({ g, k, parte2, valor, activo, reducido }) {
  const pct = ESCENARIO_T6_ACT6.grupos.find((x) => x.id === g.id).porcentaje;
  const enColumna = pct > 0;
  return (
    <div data-fila={g.id} {...(activo ? { "data-renglon-activo": "" } : {})} style={{ borderTop: k ? `1px solid ${BORDE}` : "none", ...(parte2 ? resalte(activo) : { padding: "4px 0" }) }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline" }}>
        <span style={NOMBRE}>{g.nombre}</span>
        {parte2
          ? <span data-monto="" style={CIFRA}>{MONTOS[g.nombre]}</span>
          : enColumna && <span style={{ ...PEQUENO, fontWeight: 600, color: TEXTO, whiteSpace: "nowrap" }}>{pegarPorcentaje(g.porcentaje)}</span>}
      </div>
      {parte2 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          {enColumna && <span style={{ ...PEQUENO, fontWeight: 600, color: TEXTO, whiteSpace: "nowrap" }}>{pegarPorcentaje(g.porcentaje)}</span>}
          <Barra porcentaje={pct} alto={8} />
          {enColumna && <span data-provision-grupo={g.id} style={{ ...CIFRA, minWidth: "62px", textAlign: "right" }}>{valor && <Entra reducido={reducido}>{valor}</Entra>}</span>}
        </div>
      )}
      {!enColumna && (
        <p style={{ margin: "2px 0 0", ...PEQUENO, textAlign: "right", color: SECUNDARIO }}>{g.porcentaje}</p>
      )}
    </div>
  );
}

function Total({ respondidas, abierta, enCurso, reducido }) {
  const i7 = N1 + CALCULAR.casillas.indexOf(P7);
  const i8 = N1 + CALCULAR.casillas.indexOf(P8);
  const conBarra = enCurso >= i7;
  const activo = abierta === i7 || abierta === i8;
  return (
    <div data-fila="total" data-total="" {...(activo ? { "data-renglon-activo": "" } : {})} style={{ borderTop: `1px solid ${BORDE_FUERTE}`, marginTop: "4px", ...resalte(activo) }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline" }}>
        <span style={{ ...PEQUENO, color: SECUNDARIO }}>{TOTAL.nombre}</span>
        <span style={CIFRA}>{TOTAL.valor}</span>
      </div>
      {/* La barra del total: no se dibuja antes de la casilla 7, la primera que la usa. */}
      {conBarra && (
        <div data-barra-total style={{ marginTop: "6px" }}>
          <div style={{ display: "flex" }}><Barra porcentaje={(ESCENARIO_T6_ACT6.provision / ESCENARIO_T6_ACT6.total) * 100} alto={14} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "4px" }}>
            <div>
              <p style={{ margin: 0, ...PEQUENO, color: SECUNDARIO }}>{ROTULOS_TOTAL_T6_ACT6.neto}</p>
              <p data-valor-neto style={{ ...CIFRA, margin: 0, minHeight: "16px" }}>{respondidas > i8 && <Entra reducido={reducido}>{pesos(correcta(P8).valor)}</Entra>}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, ...PEQUENO, color: SECUNDARIO }}>{ROTULOS_TOTAL_T6_ACT6.provision}</p>
              <p data-valor-provision style={{ ...CIFRA, margin: 0, minHeight: "16px" }}>{respondidas > i7 && <Entra reducido={reducido}>{pesos(correcta(P7).valor)}</Entra>}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CajonesDelTiempo({ respondidas, abierta, reducido, anuncio, modoDemo = false }) {
  /* En «Así se juega» no hay partida: solo la nota, la regla y su pie. */
  const enCurso = abierta ?? Math.max(0, respondidas - 1);
  const parte2 = !modoDemo && enCurso >= N1;
  const valorDe = (g) => {
    const id = CASILLA_DE_GRUPO[g.id];
    if (!id) return null; // el primer grupo no lleva provisión
    const i = N1 + CALCULAR.casillas.findIndex((c) => c.id === id);
    return respondidas > i ? pesos(correcta(CALCULAR.casillas[i - N1]).valor) : null;
  };
  const activoDe = (g) => abierta !== null && CALCULAR.casillas[abierta - N1]?.id === CASILLA_DE_GRUPO[g.id];
  return (
    <div data-cajones-del-tiempo style={{ margin: "0 0 12px" }}>
      <style>{KEYFRAMES_ENTRA}</style>
      <p data-nota-regla style={{ margin: "0 0 10px", fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.75)" }}>{T6_ACT6.nota}</p>
      <div data-regla="" style={{ padding: "8px 10px 10px", borderRadius: "12px", border: `1px solid ${BORDE}`, background: "rgba(248,249,250,0.05)" }}>
        <div {...(parte2 ? { "data-datos-parte": "" } : {})}>
          {GRUPOS_T6_ACT6.map((g, k) => (
            <FilaGrupo key={g.id} g={g} k={k} parte2={parte2} valor={parte2 ? valorDe(g) : null} activo={parte2 && activoDe(g)} reducido={reducido} />
          ))}
          {parte2 && <Total respondidas={respondidas} abierta={abierta} enCurso={enCurso} reducido={reducido} />}
        </div>
        {/* El pie de la tabla (calidad 1): el rótulo y la fuente del porcentaje, dos líneas sin cajas. */}
        <div data-pie-tabla="" style={{ margin: "6px 0 0", padding: "6px 0 0", borderTop: `1px solid ${BORDE_TENUE}` }}>
          <p data-rotulo-simulado="" style={{ ...LINEA_PIE, fontWeight: 600, color: NODO }}>{T6_ACT6.rotulo}</p>
          <p data-pie-porcentaje="" style={{ ...LINEA_PIE, fontWeight: 400, color: SECUNDARIO }}>{PIES_T6_ACT6.regla}</p>
        </div>
      </div>
      {!modoDemo && !parte2 && <Eje respondidas={respondidas} abierta={abierta} reducido={reducido} />}
      <p data-anuncio aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{anuncio}</p>
    </div>
  );
}

/* Tras los dos puntos, el nombre del grupo va en minúscula (Shoko). */
const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);

/* Lo que se anuncia al responder la casilla k: lo que entra (siempre lo correcto). PARA SHOKO: frases armadas con palabras de la actividad. */
export function anuncioDe(k) {
  if (k < N1) {
    const c = UBICAR.casillas[k];
    return `${deudaDe(c)}: ${minuscula(correcta(c).texto)}`;
  }
  const c = CALCULAR.casillas[k - N1];
  const grupo = Object.entries(CASILLA_DE_GRUPO).find(([, id]) => id === c.id)?.[0];
  if (grupo) return `${minuscula(GRUPOS_T6_ACT6.find((g) => g.id === grupo).nombre)}: ${pesos(correcta(c).valor)}`;
  return `${c.id === P7.id ? ROTULOS_TOTAL_T6_ACT6.provision : ROTULOS_TOTAL_T6_ACT6.neto}: ${pesos(correcta(c).valor)}`;
}
