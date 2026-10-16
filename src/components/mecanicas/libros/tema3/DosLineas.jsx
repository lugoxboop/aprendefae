import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { COLOR, ROTULO_PISTA, RESULTADOS, CAJA, MARCAS, CONTADORES } from "../../../../data/contabilidadTema3.js";
import { DIAS, ROTULO_CORCHETE, ROTULO_CORTE, ROTULO_RETARDO } from "../../../../data/contabilidadTema3Pieza3.js";
import { MESES as MESES_P4, ROTULO_CIERRE, ROTULO_DIFERIDO } from "../../../../data/contabilidadTema3Pieza4.js";
import { pesos } from "../../../../contabilidad/dosLineas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DOS LÍNEAS QUE NO VAN PEGADAS — el bloque visual (especificación P2 de
 * Xeno, con las correcciones de Levi).
 *
 * Dos pistas, una sobre otra, y una columna por hecho. Cada hecho deja su
 * marca en su columna, en la pista que mueve; en la otra la celda queda
 * vacía, y esa celda vacía es «queda quieta». Las marcas no dependen del
 * color: forma = pista, relleno = sentido, tallo = dirección.
 *
 * Este componente solo PINTA un estado ya calculado (contabilidad/dosLineas.js).
 * Lo que anima, lo anima sobre ese estado, y con movimiento reducido no anima
 * nada: todo aparece en su lugar final.
 *
 * Teal, ámbar y coral no aparecen. #B8C4D4 nunca es color de texto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CIFRAS = { fontVariantNumeric: "tabular-nums" };

export const ENTRADA = "cubic-bezier(0.2, 0, 0, 1)";
export const CAMBIO = "cubic-bezier(0.4, 0, 0.2, 1)";

/* Alturas de Xeno, en px. */
const CARRIL = 64;
const BASE = 32;
const TALLO = 12;
const CABEZA = 14;
const CENTRO_CABEZA = 20;

/*
 * El tallo de cada columna, desde su borde izquierdo: +8 px con 4 columnas y
 * +28 px con 2 (Xeno). Si la columna es tan estrecha que el monto más largo
 * ya no cabe —a 320 px, «$15.000» con 4 columnas—, el tallo se acerca al
 * borde lo justo para que quepa; nunca más de lo que dice Xeno. Lo que debe
 * caber detrás del tallo: 11 px hasta el monto, el monto más largo (≈43 px
 * con 4 columnas, ≈52 con 2) y al menos 2 px de aire.
 */
const desplazamiento = (n) => (n >= 4
  ? `clamp(2px, calc(${100 / n}% - 58px), 8px)`
  : n === 2 ? "clamp(2px, calc(50% - 65px), 28px)" : "16px");
const xDeColumna = (i, n) => `calc(${(i * 100) / n}% + ${desplazamiento(n)})`;

const CSS = `
.fae-dl button:focus-visible, .fae-dl [tabindex]:focus-visible { outline: 2px solid ${COLOR.neutro}; outline-offset: 2px; }
@keyframes fae-dl-trazo { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes fae-dl-fundido { from { opacity: 0; } to { opacity: 1; } }
@keyframes fae-dl-tallo { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes fae-dl-cabeza { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
@keyframes fae-dl-sale { from { opacity: 1; } to { opacity: 0; } }
@keyframes fae-dl-retrae { from { transform: scaleY(1); } to { transform: scaleY(0); } }
@keyframes fae-dl-nombre-sale { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-4px); } }
@keyframes fae-dl-nombre-entra { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .fae-dl *, .fae-dl *::before, .fae-dl *::after { animation: none !important; transition: none !important; }
}
`;

/* ═══════════ EL MOVIMIENTO REDUCIDO, LEÍDO EN VIVO ═══════════ */
export function useReducido() {
  const leer = () => {
    try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
  };
  const [reducido, setReducido] = useState(leer);
  useEffect(() => {
    let consulta = null;
    try { consulta = window.matchMedia?.("(prefers-reduced-motion: reduce)"); } catch { /* sin matchMedia */ }
    if (!consulta) return undefined;
    const cambio = () => setReducido(consulta.matches);
    consulta.addEventListener?.("change", cambio);
    return () => consulta.removeEventListener?.("change", cambio);
  }, []);
  return reducido;
}

const pestanaOculta = () => {
  try { return document.visibilityState === "hidden"; } catch { return false; }
};

/*
 * ═══════════ UN CONTADOR QUE SIEMPRE TERMINA EN SU VALOR ═══════════
 *
 * La lección del PR #14: una cifra que cuenta con requestAnimationFrame se
 * quedaba en 0 si el navegador no avanzaba la animación. Aquí, con
 * movimiento reducido o la pestaña oculta sale el valor final directo, y un
 * reloj de respaldo lo escribe al acabar el conteo, avance o no la animación.
 */
export function useCifra(objetivo, { reducido, ms = 450 } = {}) {
  const [valor, setValor] = useState(objetivo);
  const desde = useRef(objetivo);
  useEffect(() => {
    const inicio0 = desde.current;
    desde.current = objetivo;
    if (reducido || pestanaOculta() || inicio0 === objetivo) { setValor(objetivo); return undefined; }
    let marco = null;
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const paso = (ahora) => {
      const t = Math.min(1, Math.max(0, (ahora - t0) / ms));
      const e = 1 - (1 - t) ** 3;
      setValor(Math.round(inicio0 + (objetivo - inicio0) * e));
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    const respaldo = setTimeout(() => { cancelAnimationFrame(marco); setValor(objetivo); }, ms + 100);
    return () => { cancelAnimationFrame(marco); clearTimeout(respaldo); setValor(objetivo); };
  }, [objetivo, reducido, ms]);
  return valor;
}

/* ═══════════ LAS PIEZAS ═══════════ */

/* El glifo de 10 px de la leyenda: misma forma y relleno que la marca. */
function Glifo({ tipo }) {
  const m = MARCAS[tipo];
  return (
    <span aria-hidden="true" style={{
      display: "inline-block", width: "10px", height: "10px", flex: "none", boxSizing: "border-box",
      borderRadius: m.forma === "circulo" ? "50%" : "2px",
      background: m.llena ? COLOR.blanco : "transparent",
      border: m.llena ? "none" : `2px solid ${COLOR.blanco}`,
    }} />
  );
}

function Contador({ tipo, monto, resaltado, reducido, ms }) {
  const v = useCifra(monto, { reducido, ms });
  return (
    <span data-contador={tipo} style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
      <Glifo tipo={tipo} />
      <span style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{MARCAS[tipo].nombre}</span>
      <span
        data-monto
        data-final={pesos(monto)}
        data-resaltado={resaltado ? "si" : "no"}
        style={{
          fontFamily: INTER, fontSize: "12px", fontWeight: 700, ...CIFRAS,
          color: resaltado ? COLOR.navy : COLOR.blanco,
          background: resaltado ? COLOR.neutro : "transparent",
          padding: resaltado ? "1px 6px" : 0, borderRadius: "999px",
          transition: `background 200ms ${CAMBIO}, color 200ms ${CAMBIO}`,
        }}
      >
        {pesos(v)}
      </span>
    </span>
  );
}

/* Una marca: tallo, cabeza y monto, en la columna de su hecho. */
function Marca({ marca, n, nueva, saliendo, salidaMs, reducido, xDe = null, sinMonto = false, escalon = 0 }) {
  const m = MARCAS[marca.tipo];
  const color = marca.actual ? COLOR.blanco : COLOR.neutro;
  const colorMonto = marca.actual ? COLOR.blanco : COLOR.apagado;
  const x = marca.x ?? (xDe ? xDe(marca.columna) : xDeColumna(marca.columna, n));
  /* La cascada de la pieza 3: cada marca sale `escalon` ms después de la anterior. */
  const d = marca.retraso ?? escalon * marca.columna;
  const centro = m.arriba ? BASE - CENTRO_CABEZA : BASE + CENTRO_CABEZA;
  const anima = nueva && !reducido && !saliendo;
  const sale = saliendo && !reducido ? `fae-dl-sale ${salidaMs}ms ${CAMBIO} forwards` : undefined;
  return (
    <div data-marca={marca.tipo} data-hecho={marca.hecho} data-actual={marca.actual ? "si" : "no"} style={{ position: "absolute", inset: 0, pointerEvents: "none", animation: sale }}>
      {/* El tallo, desde 1 px de la línea base. */}
      <span aria-hidden="true" style={{
        position: "absolute", left: x, width: "2px", height: `${TALLO}px`,
        top: m.arriba ? `${BASE - 1 - TALLO}px` : `${BASE + 1}px`,
        background: color, transformOrigin: m.arriba ? "bottom" : "top",
        transition: `background 200ms ${CAMBIO}`,
        animation: saliendo && !reducido ? `fae-dl-retrae ${salidaMs}ms ${CAMBIO} forwards` : anima ? `fae-dl-tallo 200ms ${ENTRADA}${d ? ` ${d}ms` : ""} both` : undefined,
      }} />
      {/* La cabeza: cuadrado (ingresos y gastos) o círculo (caja); llena suma, vacía resta. */}
      <span aria-hidden="true" style={{
        position: "absolute", left: `calc(${x} - ${CABEZA / 2 - 1}px)`, top: `${centro - CABEZA / 2}px`,
        width: `${CABEZA}px`, height: `${CABEZA}px`, boxSizing: "border-box",
        borderRadius: m.forma === "circulo" ? "50%" : "2px",
        background: m.llena ? color : "transparent",
        border: m.llena ? "none" : `2px solid ${color}`,
        transition: `background 200ms ${CAMBIO}, border-color 200ms ${CAMBIO}`,
        animation: anima ? `fae-dl-cabeza 160ms ${ENTRADA} ${200 + d}ms both` : undefined,
      }} />
      {/* El monto, a la derecha de la cabeza y centrado con ella. La pieza 3 no lo lleva. */}
      {!sinMonto && <span data-monto-marca style={{
        position: "absolute", ...(marca.montoIzquierda ? { right: `calc(100% - ${x} + 9px)` } : { left: `calc(${x} + 11px)` }), top: `${centro - 7}px`,
        fontFamily: INTER, fontSize: "12px", lineHeight: "14px", fontWeight: 600, ...CIFRAS,
        color: colorMonto, whiteSpace: "nowrap",
        transition: `color 200ms ${CAMBIO}`,
        animation: anima ? `fae-dl-fundido 140ms ${ENTRADA} 320ms both` : undefined,
      }}>
        {pesos(marca.monto)}
      </span>}
    </div>
  );
}

const claveMarca = (m) => `${m.hecho}-${m.tipo}`;

/*
 * Las marcas que se van (Anterior, o el reinicio) se quedan un momento para
 * desvanecerse; con movimiento reducido se van de inmediato.
 */
function useSalientes(marcas, { reducido, ms }) {
  const previas = useRef(marcas);
  const [salientes, setSalientes] = useState([]);
  useLayoutEffect(() => {
    const ahora = new Set(marcas.map(claveMarca));
    const idas = previas.current.filter((m) => !ahora.has(claveMarca(m)));
    previas.current = marcas;
    if (reducido || !idas.length) { setSalientes([]); return undefined; }
    setSalientes(idas);
    const t = setTimeout(() => setSalientes([]), ms);
    return () => clearTimeout(t);
  }, [marcas, reducido, ms]);
  return salientes;
}

function Pista({
  pista, estado, columnas, columnaActual, marcas, salientes, salidaMs, nuevas, contadores, resaltados, reducido, trazar, retraso, msContador,
  xDe = null, sinMonto = false, escalon = 0, finLinea = null, extras = null, soloEncabezado = false,
}) {
  const xRanura = (i) => (xDe ? xDe(i) : xDeColumna(i, columnas));
  const linea = estado === "activa"
    ? { color: COLOR.blanco, alto: 3 }
    : estado === "quieta" ? { color: COLOR.quieto, alto: 2 } : { color: COLOR.neutro, alto: 2 };
  return (
    <div data-pista={pista} data-estado={estado}>
      <div style={{ height: "40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", animation: trazar ? `fae-dl-fundido 200ms ${ENTRADA} both` : undefined }}>
        <p style={{ margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 600, lineHeight: 1.2, color: COLOR.blanco }}>{ROTULO_PISTA[pista]}</p>
        <p style={{ margin: 0, display: "flex", flexWrap: "wrap", columnGap: "12px", rowGap: "2px" }}>
          {CONTADORES[pista].map((tipo) => (
            <Contador key={tipo} tipo={tipo} monto={contadores[tipo]} resaltado={resaltados.includes(tipo)} reducido={reducido} ms={msContador} />
          ))}
        </p>
      </div>
      {!soloEncabezado && <div aria-hidden="true" data-carril style={{ position: "relative", height: `${CARRIL}px` }}>
        {/* La banda de la columna actual, solo en la pista que se mueve. */}
        {columnaActual !== null && estado === "activa" && (
          <span data-banda style={{
            position: "absolute", top: 0, height: `${CARRIL}px`, borderRadius: "8px",
            left: `calc(${(columnaActual * 100) / columnas}% + 1px)`, width: `calc(${100 / columnas}% - 2px)`,
            background: "rgba(184,196,212,0.12)",
          }} />
        )}
        {/* La línea base. */}
        <span data-linea style={{
          position: "absolute", left: 0, ...(finLinea ? { width: finLinea } : { right: 0 }), top: `${BASE - linea.alto / 2}px`, height: `${linea.alto}px`,
          borderRadius: "2px", background: linea.color, transformOrigin: "left",
          transition: `background 200ms ${CAMBIO}, height 200ms ${CAMBIO}, top 200ms ${CAMBIO}`,
          animation: trazar ? `fae-dl-trazo 400ms ${ENTRADA} ${retraso}ms both` : undefined,
        }} />
        {/* Una ranura por columna, en el x del tallo. */}
        {Array.from({ length: columnas }, (_, i) => (
          <span key={i} data-ranura style={{
            position: "absolute", left: xRanura(i), top: `${BASE - 3}px`, width: "2px", height: "6px", background: COLOR.quieto,
          }} />
        ))}
        {extras}
        {marcas.map((m) => (
          <Marca key={claveMarca(m)} marca={m} n={columnas} nueva={nuevas.has(claveMarca(m))} reducido={reducido} xDe={xDe} sinMonto={sinMonto} escalon={escalon} />
        ))}
        {salientes.map((m) => (
          <Marca key={`sale-${claveMarca(m)}`} marca={m} n={columnas} saliendo salidaMs={salidaMs} reducido={reducido} xDe={xDe} sinMonto={sinMonto} />
        ))}
      </div>}
    </div>
  );
}

/*
 * ═══════════ EL CALENDARIO DE LA PIEZA 3 (Xeno, A1) ═══════════
 *
 * Cinco ranuras de día, del 27 al 31, y a la derecha la zona del futuro.
 * Todo va en proporciones del carril, con los mínimos de Xeno: ranura =
 * 14,5 % (mín. 30 px), separación del corte ≈ 3,6 % (10 px a 375, 8 a 320),
 * futuro = el resto.
 */
const RANURA = "max(30px, 14.5%)";
const SEPARACION = "3.6%";
const ESCALON_DIA = 140;
/* El centro de la ranura i, menos 1 px: el tallo de 2 px queda centrado. */
const xDeDia = (i) => `calc(${i} * ${RANURA} + ${RANURA} / 2 - 1px)`;
const CENTRO_DIA = (i) => `calc(${i} * ${RANURA} + ${RANURA} / 2)`;
const X_CORTE = `calc(5 * ${RANURA} + ${SEPARACION} / 2)`;
const INICIO_FUTURO = `calc(5 * ${RANURA} + ${SEPARACION})`;
const FIN_DIAS = `calc(5 * ${RANURA})`;

const CSS_CAL = `
@keyframes fae-p3-baja { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes fae-p3-dia { from { background: transparent; color: ${COLOR.apagado}; } to { background: ${COLOR.neutro}; color: ${COLOR.navy}; } }
`;

/* La línea del corte: blanca, 2 px, discontinua 6/4. Solo sobre la regla y los carriles. */
const trazoCorte = (alto, anima, retraso = 0) => ({
  position: "absolute", left: `calc(${X_CORTE} - 1px)`, width: "2px", height: alto,
  backgroundImage: `repeating-linear-gradient(to bottom, ${COLOR.blanco} 0 6px, transparent 6px 10px)`,
  transformOrigin: "top",
  animation: anima ? `fae-p3-baja 600ms cubic-bezier(0, 0, 0.2, 1) ${retraso}ms both` : undefined,
});

function Regla({ calendario, anima, animaCorte }) {
  const { regla, corchete, corte } = calendario;
  return (
    <div aria-hidden="true" data-regla={regla ? "si" : "no"} style={{ position: "relative", height: "54px" }}>
      <style>{CSS_CAL}</style>
      {/* Rótulos: «$500 por día» sobre los días, «Cierre del mes» sobre el corte. */}
      {corchete && (
        <span data-rotulo-corchete style={{
          position: "absolute", left: CENTRO_DIA(2), top: 0, transform: "translateX(-50%)", whiteSpace: "nowrap",
          fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: COLOR.blanco,
          animation: anima ? `fae-dl-fundido 150ms ${ENTRADA} 700ms both` : undefined,
        }}>
          {ROTULO_CORCHETE}
        </span>
      )}
      {corte && (
        <span data-rotulo-corte style={{
          position: "absolute", left: X_CORTE, top: 0, transform: "translateX(-38%)", whiteSpace: "nowrap",
          fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: COLOR.blanco,
          animation: animaCorte ? `fae-dl-fundido 200ms ${ENTRADA} 600ms both` : undefined,
        }}>
          {ROTULO_CORTE}
        </span>
      )}
      {/* El corchete: 2 px #B8C4D4 con remates de 5 px. */}
      {corchete && (
        <span data-corchete style={{
          position: "absolute", left: "3px", width: `calc(${FIN_DIAS} - 6px)`, top: "20px", height: "5px",
          borderTop: `2px solid ${COLOR.neutro}`, borderLeft: `2px solid ${COLOR.neutro}`, borderRight: `2px solid ${COLOR.neutro}`,
          boxSizing: "border-box", transformOrigin: "left",
          animation: anima ? `fae-dl-trazo 300ms ${ENTRADA} 400ms both` : undefined,
        }} />
      )}
      {/* Los cinco días: chips de 24 × 20, marcados. Ocultos hasta que sale la regla. */}
      {DIAS.map((dia, i) => (
        <span key={dia} data-dia={dia} style={{
          position: "absolute", left: `calc(${CENTRO_DIA(i)} - 12px)`, top: "30px", width: "24px", height: "20px",
          display: "grid", placeItems: "center", borderRadius: "5px", visibility: regla ? "visible" : "hidden",
          fontFamily: INTER, fontSize: "12px", fontWeight: 700, ...CIFRAS,
          background: COLOR.neutro, color: COLOR.navy,
          animation: anima ? `fae-p3-dia 1ms linear ${i * 80}ms both` : undefined,
        }}>
          {dia}
        </span>
      ))}
      {corte && <span data-corte style={{ ...trazoCorte("34px", animaCorte), top: "20px" }} />}
    </div>
  );
}

/*
 * Lo que va dentro de cada carril en la pieza 3: el corte, el futuro
 * discontinuo con su punta de flecha y, en la caja, el retardo.
 */
function Futuro({ calendario, pista, anima, reducido }) {
  const { corte, retardo } = calendario;
  const aCorte = anima.corte && !reducido;
  const aRetardo = anima.retardo && !reducido;
  return (
    <>
      {retardo && pista === CAJA && (
        <span data-retardo style={{
          position: "absolute", left: 0, width: FIN_DIAS, top: 0, height: `${CARRIL}px`, borderRadius: "8px",
          background: "rgba(184,196,212,0.12)",
          animation: aRetardo ? `fae-dl-fundido 200ms ${ENTRADA} ${aCorte ? 800 : 0}ms both` : undefined,
        }}>
          <span data-chip-retardo style={{
            position: "absolute", left: "50%", top: `${BASE - 11}px`, transform: "translateX(-50%)",
            width: "66px", height: "22px", borderRadius: "11px", display: "grid", placeItems: "center",
            background: COLOR.neutro, color: COLOR.navy, fontFamily: INTER, fontSize: "12px", fontWeight: 700,
          }}>
            {ROTULO_RETARDO}
          </span>
        </span>
      )}
      {corte && (
        <>
          <span data-corte style={{ ...trazoCorte(`${CARRIL}px`, aCorte, pista === CAJA ? 0 : 0), top: 0 }} />
          {/* El futuro: discontinuo #8C9BB0 5/5 y una punta de flecha de 16 px. */}
          <span data-futuro style={{
            position: "absolute", left: INICIO_FUTURO, right: "14px", top: `${BASE - 1}px`, height: "2px",
            backgroundImage: `repeating-linear-gradient(to right, ${COLOR.quieto} 0 5px, transparent 5px 10px)`,
            animation: aCorte ? `fae-dl-fundido 200ms ${ENTRADA} 600ms both` : undefined,
          }} />
          <svg data-punta width="16" height="16" viewBox="0 0 16 16" style={{
            position: "absolute", right: 0, top: `${BASE - 8}px`,
            animation: aCorte ? `fae-dl-fundido 200ms ${ENTRADA} 600ms both` : undefined,
          }}>
            <path d="M3 2 L14 8 L3 14" fill="none" stroke={COLOR.quieto} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      )}
    </>
  );
}

/*
 * ═══════════ EL CALENDARIO POR MESES DE LA PIEZA 4 (Xeno, P2) ═══════════
 *
 * Tres ranuras iguales —junio, julio, agosto— y un corte al borde derecho de
 * cada una. Cada corte tiene tres estados: «por venir» (#8C9BB0, 5/5),
 * «activo» (blanco, 6/4) y «pasado» (#A8B6C8, 6/4). Solo se dibujan sobre la
 * regla y los carriles, nunca sobre rótulos ni contadores.
 */
const N_MESES = MESES_P4.length;
const xDeMes = (i) => `calc(${((i + 0.5) * 100) / N_MESES}% - 1px)`;
const xCorteMes = (i) => `calc(${((i + 1) * 100) / N_MESES}% - 2px)`;
const ESTILO_CORTE = {
  porVenir: { color: COLOR.quieto, raya: 5, hueco: 5 },
  activo: { color: COLOR.blanco, raya: 6, hueco: 4 },
  pasado: { color: COLOR.apagado, raya: 6, hueco: 4 },
};
const trazoCorteMes = (i, estadoCorte, alto, anima) => {
  const e = ESTILO_CORTE[estadoCorte];
  return {
    position: "absolute", left: xCorteMes(i), width: "2px", height: alto,
    backgroundImage: `repeating-linear-gradient(to bottom, ${e.color} 0 ${e.raya}px, transparent ${e.raya}px ${e.raya + e.hueco}px)`,
    transformOrigin: "top",
    animation: anima ? `fae-p3-baja 600ms cubic-bezier(0, 0, 0.2, 1) both` : undefined,
  };
};

function ReglaMeses({ calendario, anima, reducido }) {
  const ver = calendario.meses;
  const fundido = anima.meses && !reducido ? `fae-dl-fundido 200ms ${ENTRADA} both` : undefined;
  return (
    <div aria-hidden="true" data-regla-meses={ver ? "si" : "no"} style={{ position: "relative", height: "54px", visibility: ver ? "visible" : "hidden" }}>
      <style>{CSS_CAL}</style>
      {MESES_P4.map((mes, i) => (
        <span key={`c-${mes}`} data-rotulo-cierre={i} style={{
          position: "absolute", right: `calc(100% - ${xCorteMes(i)} + 5px)`, top: 0, whiteSpace: "nowrap",
          fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: COLOR.apagado, animation: fundido,
        }}>
          {ROTULO_CIERRE}
        </span>
      ))}
      {MESES_P4.map((mes, i) => (
        <span key={mes} data-mes={mes} style={{
          position: "absolute", left: `calc(${((i + 0.5) * 100) / N_MESES}%)`, top: "30px", transform: "translateX(-50%)",
          height: "20px", padding: "0 8px", borderRadius: "5px", display: "grid", placeItems: "center", whiteSpace: "nowrap",
          fontFamily: INTER, fontSize: "12px", fontWeight: 700, background: COLOR.neutro, color: COLOR.navy, animation: fundido,
        }}>
          {mes}
        </span>
      ))}
      {calendario.cortes.map((c, i) => (
        <span key={`k-${i}`} data-corte={i} data-estado-corte={c} style={{ ...trazoCorteMes(i, c, "36px", anima.cortes?.[i] && !reducido), top: "18px" }} />
      ))}
    </div>
  );
}

function CortesMeses({ calendario, pista, anima, reducido }) {
  if (!calendario.meses) return null;
  return (
    <>
      {calendario.diferido && pista === RESULTADOS && (
        <span data-diferido style={{
          position: "absolute", left: 0, right: 0, top: 0, height: `${CARRIL}px`, borderRadius: "8px",
          background: "rgba(184,196,212,0.12)",
          animation: anima.diferido && !reducido ? `fae-dl-fundido 200ms ${ENTRADA} both` : undefined,
        }}>
          <span data-chip-diferido style={{
            position: "absolute", left: "50%", top: `${BASE - 11}px`, transform: "translateX(-50%)",
            height: "22px", padding: "0 12px", borderRadius: "11px", display: "grid", placeItems: "center",
            background: COLOR.neutro, color: COLOR.navy, fontFamily: INTER, fontSize: "12px", fontWeight: 700,
          }}>
            {ROTULO_DIFERIDO}
          </span>
        </span>
      )}
      {calendario.cortes.map((c, i) => (
        <span key={i} data-corte={i} data-estado-corte={c} style={{ ...trazoCorteMes(i, c, `${CARRIL}px`, anima.cortes?.[i] && !reducido), top: 0 }} />
      ))}
    </>
  );
}

/*
 * ═══════════ EL BLOQUE ═══════════
 *
 * `encabezado` es lo que va entre la etiqueta de empresa y las pistas (la
 * tarjeta del hecho en la capa 2). El orden de lectura es el de Xeno:
 * empresa → hecho → pista 1 con sus contadores → pista 2 → lo que venga
 * después.
 */
export default function DosLineas({
  estado, empresa, recienCambiada = false, cruzandoNombre = false, encabezado = null,
  descripcion = null, idDescripcion, chipRef = null, salidaMs = 160, msContador = 450,
  calendario = null, soloEncabezados = false, pie = null, sinEmpresa = false,
}) {
  const reducido = useReducido();
  const caja = useRef(null);

  /*
   * A1: las pistas se trazan una sola vez, al entrar el bloque en pantalla
   * (60 % visible). Sin IntersectionObserver, o con movimiento reducido,
   * aparecen completas.
   */
  const [trazar, setTrazar] = useState(false);
  const yaTrazo = useRef(false);
  useEffect(() => {
    if (reducido || yaTrazo.current || typeof IntersectionObserver === "undefined" || !caja.current) return undefined;
    const io = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.intersectionRatio >= 0.6) && !yaTrazo.current) {
        yaTrazo.current = true;
        setTrazar(true);
        io.disconnect();
        setTimeout(() => setTrazar(false), 700);
      }
    }, { threshold: [0.6] });
    io.observe(caja.current);
    return () => io.disconnect();
  }, [reducido]);

  /* Las marcas que acaban de aparecer, para animarlas una vez (A2). */
  const previas = useRef(new Set(estado.marcas.map(claveMarca)));
  const nuevasP1 = new Set(estado.marcas.map(claveMarca).filter((k) => !previas.current.has(k)));
  useEffect(() => { previas.current = new Set(estado.marcas.map(claveMarca)); }, [estado.marcas]);
  /*
   * En la pieza 3 la cascada dura ≈1,2 s: las nuevas se calculan una vez por
   * estado (el padre lo memoriza por paso) y no se pierden si el padre vuelve
   * a pintar a mitad de camino. La pieza 1 sigue con su cálculo de siempre.
   */
  const cascada = useRef({ marcas: estado.marcas, nuevas: new Set() });
  if (calendario && cascada.current.marcas !== estado.marcas) {
    const antesK = new Set(cascada.current.marcas.map(claveMarca));
    cascada.current = { marcas: estado.marcas, nuevas: new Set(estado.marcas.map(claveMarca).filter((k) => !antesK.has(k))) };
  }
  const nuevas = calendario ? cascada.current.nuevas : nuevasP1;
  const salientes = useSalientes(estado.marcas, { reducido, ms: salidaMs });

  /*
   * El calendario de la pieza 3 (Xeno, A1): lo que es nuevo en este estado se
   * anima una vez; lo que ya estaba, se queda quieto. Sin calendario —la
   * pieza 1— nada de esto existe.
   */
  const cal = useRef({ actual: calendario, anima: {} });
  const igual = (a, b) => ["regla", "corchete", "corte", "retardo"].every((k) => Boolean(a?.[k]) === Boolean(b?.[k]));
  if (calendario && !igual(calendario, cal.current.actual)) {
    const prev = cal.current.actual;
    const nuevo = (k) => Boolean(calendario[k] && !prev?.[k]);
    cal.current = { actual: calendario, anima: { regla: nuevo("regla"), corte: nuevo("corte"), retardo: nuevo("retardo") } };
  }
  const animaCal = cal.current.anima;

  /* El calendario por meses de la pieza 4: los meses, el «Diferido» y cada corte que pasa a activo. */
  const calM = useRef({ actual: calendario, anima: { cortes: [] } });
  const mismaCal = (a, b) => Boolean(a?.meses) === Boolean(b?.meses) && Boolean(a?.diferido) === Boolean(b?.diferido)
    && (a?.cortes ?? []).join() === (b?.cortes ?? []).join();
  if (calendario?.tipo === "meses" && !mismaCal(calendario, calM.current.actual)) {
    const prev = calM.current.actual;
    calM.current = {
      actual: calendario,
      anima: {
        meses: Boolean(calendario.meses && !prev?.meses),
        diferido: Boolean(calendario.diferido && !prev?.diferido),
        cortes: calendario.cortes.map((c, i) => c === "activo" && prev?.cortes?.[i] !== "activo"),
      },
    };
  }
  const animaMeses = calM.current.anima;
  const porMeses = calendario?.tipo === "meses";

  const pistaProps = (pista, retraso) => ({
    pista, estado: estado.pistas[pista], columnas: estado.columnas, columnaActual: estado.columnaActual,
    marcas: estado.marcas.filter((m) => m.pista === pista), salientes: salientes.filter((m) => m.pista === pista),
    salidaMs, nuevas, contadores: estado.contadores, resaltados: estado.resaltados, reducido,
    trazar: trazar && !reducido, retraso, msContador,
    ...(porMeses ? {
      xDe: xDeMes, soloEncabezado: soloEncabezados,
      extras: <CortesMeses calendario={calendario} pista={pista} anima={animaMeses} reducido={reducido} />,
    } : calendario ? {
      xDe: xDeDia, sinMonto: true, escalon: ESCALON_DIA, soloEncabezado: soloEncabezados,
      finLinea: calendario.corte ? X_CORTE : null,
      extras: <Futuro calendario={calendario} pista={pista} anima={animaCal} reducido={reducido} />,
    } : {}),
  });

  return (
    <div
      ref={caja}
      className="fae-dl"
      role="group"
      aria-label="Dos líneas: ingresos y gastos, y caja"
      aria-describedby={descripcion ? idDescripcion : undefined}
      data-dos-lineas
      style={{ padding: "0 8px", color: COLOR.blanco }}
    >
      <style>{CSS}</style>
      {descripcion && <p id={idDescripcion} data-alternativo hidden>{descripcion}</p>}

      {/* La etiqueta de empresa: fija, y resaltada mientras está «recién cambiada». */}
      {!sinEmpresa && <p style={{ margin: calendario ? "0 0 6px" : "0 0 10px" }}>
        <span
          ref={chipRef}
          tabIndex={-1}
          data-empresa={empresa.id}
          data-recien-cambiada={recienCambiada ? "si" : "no"}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", boxSizing: "border-box",
            padding: "0 13px", borderRadius: "12px", overflow: "hidden",
            fontFamily: INTER, fontSize: "13px", lineHeight: 1,
            background: recienCambiada ? COLOR.neutro : "transparent",
            border: recienCambiada ? "1px solid transparent" : `1px solid ${COLOR.quieto}`,
            transition: `background 200ms ${CAMBIO}`,
          }}
        >
          <span style={{ color: recienCambiada ? COLOR.navy : COLOR.apagado }}>Empresa:</span>
          <strong
            key={empresa.id}
            style={{
              color: recienCambiada ? COLOR.navy : COLOR.blanco, fontWeight: 700,
              animation: cruzandoNombre && !reducido ? `fae-dl-nombre-entra 250ms ${ENTRADA} both` : undefined,
            }}
          >
            {empresa.nombre}
          </strong>
        </span>
      </p>}

      {encabezado}

      {porMeses && <ReglaMeses calendario={calendario} anima={animaMeses} reducido={reducido} />}
      {calendario && !porMeses && <Regla calendario={calendario} anima={animaCal.regla && !reducido} animaCorte={animaCal.corte && !reducido} />}

      {/* Los números de columna, alineados con el tallo. */}
      {!calendario && <div aria-hidden="true" style={{ position: "relative", height: "16px" }}>
        {Array.from({ length: estado.columnas }, (_, i) => (
          <span key={i} style={{
            position: "absolute", left: `calc(${xDeColumna(i, estado.columnas)} - 3px)`, top: 0,
            fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado, ...CIFRAS,
          }}>
            {i + 1}
          </span>
        ))}
      </div>}

      <Pista {...pistaProps(RESULTADOS, 0)} />
      <div style={{ height: "12px" }} />
      <Pista {...pistaProps(CAJA, 100)} />
      {pie}
      {/* La pieza 3 vive en un escenario de alto fijo: sin el aire final. */}
      {!calendario && <div style={{ height: "16px" }} />}
    </div>
  );
}
