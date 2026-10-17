import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { TANQUE_T6_A3 } from "../../../../data/contabilidadT6Pieza3.js";
import { leerRespuesta } from "../../../../contabilidad/t6Act2.js";
import TanqueProvision, { CURVA, CIFRA_MONO, RELLENO_AMBAR, escalaTanque } from "./TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a2 · LA CIFRA ESCRITA MUEVE EL MODELO (lote 17, P2 de Mai, bloque A).
 *
 * Regla única: mientras se escribe, el modelo dibuja la cifra del estudiante
 * como BORRADOR (borde discontinuo 1,5 px #CBDCF2) y no dibuja nada contra lo
 * que alinearla (R10); tras «Comprobar», lo FIRME es siempre lo correcto, se
 * acierte o no (el modelo es el registro).
 *   · el eco: la cifra en la fila que la nombra (la del valor neto, la del
 *     saldo de la T), en monospace; sin dígitos, el hueco de 72 × 12;
 *   · la Barra del valor neto (pregunta 1): solo la cola del dominio, con el
 *     corte en zigzag; la pista acaba en lo que deben los clientes (66,67 %);
 *   · el tanque (preguntas 2 y 3): el de T6 · A3 a 84 × 120, de −40.000 a
 *     200.000; antes de «Comprobar», solo el cero.
 *
 * El borrador se dibuja con un rectángulo entero que se TRASLADA dentro de un
 * recorte (no con scaleX/scaleY, que deformaría el borde discontinuo), en
 * 160 ms; borrador → firme, por opacidad en 240 ms. Con movimiento reducido,
 * al instante. Barra y tanque van aria-hidden: la cifra ya está en el campo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BORRADOR = `1.5px dashed ${FAE.node}`;
const RELLENO_BORRADOR = "rgba(203,220,242,0.10)";
const NEUTRO = "#B8C4D4";
const mover = (reducido) => (reducido ? "none" : `transform 160ms ${CURVA}`);
const fundir = (reducido) => (reducido ? "none" : "opacity 240ms linear");

/* La cifra escrita, para el eco: «$31.200» (o «−$31.200» si puso el signo). */
export function cifraDelEco(texto) {
  const v = leerRespuesta(texto);
  if (v === null) return null;
  return `${v < 0 ? "−" : ""}${pesos(Math.abs(v))}`;
}

/*
 * El eco en la fila que nombra la cifra. Alto fijo (20 px, borde incluido): escribir no mueve nada de
 * sitio. Sin dígitos, el hueco de hoy; con ellos, el borrador; comprobado, `firme` con 2 px #F8F9FA.
 */
export function Eco({ texto, prefijo = null, firme = null }) {
  const caja = { display: "inline-flex", alignItems: "center", boxSizing: "border-box", height: "20px", padding: "0 5px", borderRadius: "6px", ...CIFRA_MONO, fontSize: "12.5px", fontWeight: 700 };
  if (firme) return <span data-eco="firme" style={{ ...caja, border: `2px solid ${FAE.text}` }}>{firme}</span>;
  const cifra = cifraDelEco(texto);
  if (!cifra) {
    return (
      <span data-eco="hueco" style={{ display: "inline-flex", alignItems: "center", height: "20px" }}>
        <span style={{ display: "block", width: "72px", height: "12px", borderRadius: "4px", background: "rgba(248,249,250,0.08)" }} />
      </span>
    );
  }
  return <span data-eco="borrador" style={{ ...caja, border: BORRADOR }}>{prefijo ? `${prefijo} ${cifra}` : cifra}</span>;
}

/* ═══ La Barra del valor neto ═══ */

/* x(v) = (v − desde) / ancho, en [0, 1]. */
export const escalaBarra = ({ desde, ancho }) => (v) => Math.min(1, Math.max(0, (v - desde) / ancho));

/* El corte en zigzag de la izquierda: «no empieza en cero». */
function Zigzag() {
  return (
    <svg aria-hidden="true" width="8" height="26" viewBox="0 0 8 26" style={{ position: "absolute", left: 0, top: 0, zIndex: 2 }}>
      <path d="M4 0 L1 4.3 L7 8.7 L1 13 L7 17.3 L1 21.7 L4 26" fill="none" stroke={NEUTRO} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* Un tramo de la barra con borde, sin deformarse: un rectángulo entero que se traslada dentro de su recorte. */
function Tramo({ x, estilo, transicion, atributos }) {
  return (
    <span aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "4px" }}>
      <span {...atributos} style={{ position: "absolute", inset: 0, boxSizing: "border-box", borderRadius: "4px", transform: `translateX(${(x - 1) * 100}%)`, transition: transicion, ...estilo }} />
    </span>
  );
}

export function BarraNeto({ texto, comprobada, escala, rotulo, reducido }) {
  const x = escalaBarra(escala);
  const v = leerRespuesta(texto);
  const borrador = comprobada || v === null ? 0 : x(v);
  const fin = x(escala.clientes);
  const neto = x(escala.neto);
  return (
    <div data-barra-neto aria-hidden="true" style={{ margin: "8px 0 0" }}>
      <div style={{ position: "relative", height: "26px" }}>
        <Zigzag />
        {/* La pista: lo que deben los clientes, hasta su final. */}
        <span data-pista style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fin * 100}%`, boxSizing: "border-box", border: "1px solid rgba(248,249,250,0.35)", borderLeft: "none", borderRadius: "0 4px 4px 0" }} />
        {/* Tras «Comprobar»: la provisión en ámbar y el relleno firme hasta el valor neto. */}
        <span data-firme style={{ position: "absolute", inset: 0, opacity: comprobada ? 1 : 0, transition: fundir(reducido) }}>
          <span data-provision style={{ position: "absolute", top: 0, bottom: 0, left: `${neto * 100}%`, width: `${(fin - neto) * 100}%`, boxSizing: "border-box", background: RELLENO_AMBAR, borderLeft: `2px solid ${FAE.ambar}`, borderRight: `2px solid ${FAE.ambar}` }} />
          <span data-neto style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${neto * 100}%`, boxSizing: "border-box", background: "rgba(184,196,212,0.35)", borderRight: `2px solid ${FAE.text}` }} />
        </span>
        {/* El borrador: la cifra escrita crece desde la izquierda. */}
        <span style={{ position: "absolute", inset: 0, opacity: comprobada ? 0 : 1, transition: fundir(reducido) }}>
          <Tramo x={borrador} transicion={mover(reducido)} atributos={{ "data-borrador": borrador }} estilo={{ border: BORRADOR, borderLeft: "none", background: RELLENO_BORRADOR }} />
        </span>
      </div>
      {/* El rótulo, con su renglón guardado desde el principio: tras «Comprobar» no se mueve nada. */}
      <div style={{ position: "relative", height: "16px" }}>
        <span data-rotulo-provision style={{
          position: "absolute", top: "2px", left: `${neto * 100}%`, width: `${(fin - neto) * 100}%`, textAlign: "center",
          fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "14px", color: "#A8B6C8", opacity: comprobada ? 1 : 0, transition: fundir(reducido),
        }}>{rotulo}</span>
      </div>
    </div>
  );
}

/* ═══ El tanque de las preguntas 2 y 3 ═══ */

const ALTO = 120;
const ANCHO = 84;
const y = escalaTanque(ALTO);
const CERO = y(0);

/*
 * `modo`: «faltante» (pregunta 2, baja desde el cero, tope 20 px) o «nivel» (pregunta 3, sube, tope
 * 100 px). Antes de «Comprobar», el tanque solo lleva el cero; el borrador topa con su borde.
 */
export function TanqueCifra({ parte, texto, resultado, reducido }) {
  const modo = parte.tanque;
  const comprobada = Boolean(resultado);
  const v = leerRespuesta(texto);
  const espacio = modo === "faltante" ? ALTO - CERO : CERO;
  const alto = comprobada || v === null || v <= 0 ? 0 : Math.min(espacio, CERO - y(v));
  const firme = modo === "faltante" ? -parte.correcta : parte.correcta;
  const recorte = modo === "faltante" ? { top: `${CERO}px`, bottom: 0 } : { top: 0, height: `${CERO}px` };
  const dentro = modo === "faltante"
    ? { border: BORRADOR, borderTop: "none", transform: `translateY(${alto - espacio}px)` }
    : { border: BORRADOR, borderBottom: "none", transform: `translateY(${espacio - alto}px)` };
  return (
    <div data-tanque-cifra={modo} aria-hidden="true" style={{ position: "relative", width: `${ANCHO}px`, height: `${ALTO}px` }}>
      <TanqueProvision nivel={0} alto={ALTO} ancho={ANCHO} textos={TANQUE_T6_A3} reducido>
        <span style={{ position: "absolute", left: 0, right: 0, ...recorte, overflow: "hidden", opacity: comprobada ? 0 : 1, transition: fundir(reducido) }}>
          <span data-borrador={alto} style={{ position: "absolute", inset: 0, boxSizing: "border-box", background: RELLENO_BORRADOR, transition: mover(reducido), ...dentro }} />
        </span>
      </TanqueProvision>
      {/* Lo firme, encima, entra por opacidad: el tanque de lo correcto. */}
      {comprobada && (
        <div data-tanque-firme style={{ position: "absolute", inset: 0, animation: reducido ? "none" : "b5-funde 240ms linear both" }}>
          <style>{"@keyframes b5-funde { from { opacity: 0; } to { opacity: 1; } }"}</style>
          <TanqueProvision nivel={firme} alto={ALTO} ancho={ANCHO} textos={TANQUE_T6_A3} reducido />
        </div>
      )}
    </div>
  );
}
