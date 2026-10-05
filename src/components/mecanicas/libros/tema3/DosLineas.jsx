import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { COLOR, ROTULO_PISTA, RESULTADOS, CAJA, MARCAS, CONTADORES } from "../../../../data/contabilidadTema3.js";
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
function Marca({ marca, n, nueva, saliendo, salidaMs, reducido }) {
  const m = MARCAS[marca.tipo];
  const color = marca.actual ? COLOR.blanco : COLOR.neutro;
  const colorMonto = marca.actual ? COLOR.blanco : COLOR.apagado;
  const x = xDeColumna(marca.columna, n);
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
        animation: saliendo && !reducido ? `fae-dl-retrae ${salidaMs}ms ${CAMBIO} forwards` : anima ? `fae-dl-tallo 200ms ${ENTRADA} both` : undefined,
      }} />
      {/* La cabeza: cuadrado (ingresos y gastos) o círculo (caja); llena suma, vacía resta. */}
      <span aria-hidden="true" style={{
        position: "absolute", left: `calc(${x} - ${CABEZA / 2 - 1}px)`, top: `${centro - CABEZA / 2}px`,
        width: `${CABEZA}px`, height: `${CABEZA}px`, boxSizing: "border-box",
        borderRadius: m.forma === "circulo" ? "50%" : "2px",
        background: m.llena ? color : "transparent",
        border: m.llena ? "none" : `2px solid ${color}`,
        transition: `background 200ms ${CAMBIO}, border-color 200ms ${CAMBIO}`,
        animation: anima ? `fae-dl-cabeza 160ms ${ENTRADA} 200ms both` : undefined,
      }} />
      {/* El monto, a la derecha de la cabeza y centrado con ella. */}
      <span data-monto-marca style={{
        position: "absolute", left: `calc(${x} + 11px)`, top: `${centro - 7}px`,
        fontFamily: INTER, fontSize: "12px", lineHeight: "14px", fontWeight: 600, ...CIFRAS,
        color: colorMonto, whiteSpace: "nowrap",
        transition: `color 200ms ${CAMBIO}`,
        animation: anima ? `fae-dl-fundido 140ms ${ENTRADA} 320ms both` : undefined,
      }}>
        {pesos(marca.monto)}
      </span>
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

function Pista({ pista, estado, columnas, columnaActual, marcas, salientes, salidaMs, nuevas, contadores, resaltados, reducido, trazar, retraso, msContador }) {
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
      <div aria-hidden="true" data-carril style={{ position: "relative", height: `${CARRIL}px` }}>
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
          position: "absolute", left: 0, right: 0, top: `${BASE - linea.alto / 2}px`, height: `${linea.alto}px`,
          borderRadius: "2px", background: linea.color, transformOrigin: "left",
          transition: `background 200ms ${CAMBIO}, height 200ms ${CAMBIO}, top 200ms ${CAMBIO}`,
          animation: trazar ? `fae-dl-trazo 400ms ${ENTRADA} ${retraso}ms both` : undefined,
        }} />
        {/* Una ranura por columna, en el x del tallo. */}
        {Array.from({ length: columnas }, (_, i) => (
          <span key={i} data-ranura style={{
            position: "absolute", left: xDeColumna(i, columnas), top: `${BASE - 3}px`, width: "2px", height: "6px", background: COLOR.quieto,
          }} />
        ))}
        {marcas.map((m) => (
          <Marca key={claveMarca(m)} marca={m} n={columnas} nueva={nuevas.has(claveMarca(m))} reducido={reducido} />
        ))}
        {salientes.map((m) => (
          <Marca key={`sale-${claveMarca(m)}`} marca={m} n={columnas} saliendo salidaMs={salidaMs} reducido={reducido} />
        ))}
      </div>
    </div>
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
  const nuevas = new Set(estado.marcas.map(claveMarca).filter((k) => !previas.current.has(k)));
  useEffect(() => { previas.current = new Set(estado.marcas.map(claveMarca)); }, [estado.marcas]);
  const salientes = useSalientes(estado.marcas, { reducido, ms: salidaMs });

  const pistaProps = (pista, retraso) => ({
    pista, estado: estado.pistas[pista], columnas: estado.columnas, columnaActual: estado.columnaActual,
    marcas: estado.marcas.filter((m) => m.pista === pista), salientes: salientes.filter((m) => m.pista === pista),
    salidaMs, nuevas, contadores: estado.contadores, resaltados: estado.resaltados, reducido,
    trazar: trazar && !reducido, retraso, msContador,
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
      <p style={{ margin: "0 0 10px" }}>
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
      </p>

      {encabezado}

      {/* Los números de columna, alineados con el tallo. */}
      <div aria-hidden="true" style={{ position: "relative", height: "16px" }}>
        {Array.from({ length: estado.columnas }, (_, i) => (
          <span key={i} style={{
            position: "absolute", left: `calc(${xDeColumna(i, estado.columnas)} - 3px)`, top: 0,
            fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado, ...CIFRAS,
          }}>
            {i + 1}
          </span>
        ))}
      </div>

      <Pista {...pistaProps(RESULTADOS, 0)} />
      <div style={{ height: "12px" }} />
      <Pista {...pistaProps(CAJA, 100)} />
      <div style={{ height: "16px" }} />
    </div>
  );
}
