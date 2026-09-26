import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import {
  ESTACIONES, TEXTOS, CIERRE, EL_HECHO, ALTERNATIVOS, NEUTRO,
  BOTON_REPETIR, BOTON_SIGUIENTE,
} from "../../../../data/contabilidadIntro.js";
import {
  HECHO, BALANCE, facturaDelHecho, anilloEn, retornoEn,
  PASOS, PASO_DEL_CIERRE, USUARIO_DEL_RECORRIDO,
} from "../../../../contabilidad/recorridoDeUnHecho.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import FranjaDelCiclo, { ANCHO as ANCHO_FRANJA } from "./FranjaDelCiclo.jsx";
import { FormaHecho, FormaFactura, FormaRenglon, FormaEstado, FormaPregunta } from "./formas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 2 · «MÍRELO FUNCIONAR» — el recorrido de un hecho.
 *
 * Las cinco estaciones están a la vista desde el primer instante, apagadas. Un
 * solo hecho las recorre y cambia de forma en cada una.
 *
 * ═══════════ NADA AVANZA SOLO ═══════════
 *
 * Cada segmento se detiene al terminar y espera. Mientras la transformación
 * corre, Repetir y Siguiente están desactivados: si se pudiera adelantar a
 * mitad de la animación, la animación no sería parte del argumento sino un
 * adorno que se puede saltar.
 *
 * ═══════════ LA FICHA NO SE DESLIZA ═══════════
 *
 * Se desvanece donde estaba y reaparece con otra forma donde toca. No hay
 * superficie continua ni movimiento lateral: una cinta transporta sin cambiar,
 * y aquí lo único que importa es que cambia. Por eso la animación es opacidad,
 * nunca translateX.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t1-aparece { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
.fae-t1-aparece { animation: fae-t1-aparece 500ms ease-out both; }
@keyframes fae-t1-enciende { from { opacity: 0.35; } to { opacity: 1; } }
.fae-t1-enciende { animation: fae-t1-enciende 300ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-t1-aparece, .fae-t1-enciende { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";
/* Lo que tarda la transformación. Mientras corre, los botones no responden. */
const MS_TRANSFORMA = 500;

function Estacion({ e, contenido, refCaja, repeticion }) {
  return (
    <div
      ref={refCaja}
      data-estacion={e.n}
      data-encendida={e.encendida ? "si" : "no"}
      className={e.actual ? "fae-t1-enciende" : undefined}
      style={{
        padding: "9px 10px", borderRadius: "12px",
        background: e.encendida ? "rgba(184,196,212,0.08)" : "transparent",
        /* Encendida o apagada se distingue por opacidad Y por grosor de borde,
           no solo por tono: nada aquí se comunica únicamente con color. */
        border: `${e.encendida ? 2 : 1}px solid ${e.encendida ? NEUTRO : "rgba(248,249,250,0.16)"}`,
        opacity: e.encendida ? 1 : 0.5,
        transition: "opacity 300ms ease, background 300ms ease, border-color 300ms ease",
      }}
    >
      <div style={{ display: "flex", gap: "7px", alignItems: "baseline" }}>
        <span data-numero={e.n} style={{
          flex: "none", width: "17px", height: "17px", borderRadius: "999px",
          border: `1px solid ${NEUTRO}`, color: NEUTRO, fontFamily: SORA,
          fontSize: "10px", fontWeight: 700, lineHeight: "16px", textAlign: "center",
        }}>
          {e.n}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "block", fontFamily: SORA, fontSize: "11.5px", fontWeight: 700,
            lineHeight: 1.25, color: FAE.text,
          }}>
            {e.nombre}
          </span>
          {e.encendida && (
            <span data-rotulo style={{
              display: "block", marginTop: "2px", fontSize: "10px", lineHeight: 1.35,
              color: "rgba(248,249,250,0.6)",
            }}>
              {e.rotulo}
            </span>
          )}
        </span>
      </div>
      {contenido && <div key={repeticion} className="fae-t1-aparece" style={{ marginTop: "7px" }}>{contenido}</div>}
    </div>
  );
}

export default function ElRecorridoDeUnHecho() {
  const reducido = useMovimientoReducido();
  const [paso, setPaso] = useState(1);
  /*
   * Repetir tiene que volver a reproducir la transformación, y poner el paso
   * al valor que ya tenía no cambia el estado: React no vuelve a montar nada
   * y el botón se queda mirando. Este contador sí cambia, y es lo que entra en
   * la clave de la forma y en la dependencia del efecto.
   */
  const [repeticion, setRepeticion] = useState(0);
  const [transformando, setTransformando] = useState(false);
  const [nodos, setNodos] = useState([]);
  const reloj = useRef(null);
  const columna = useRef(null);
  const refs = useRef({});

  const cerrado = paso >= PASO_DEL_CIERRE;
  const anillo = anilloEn(Math.min(paso, PASOS));
  const factura = facturaDelHecho();

  useEffect(() => () => clearTimeout(reloj.current), []);

  /* Mientras la ficha se transforma, los botones no responden. */
  useEffect(() => {
    if (reducido) { setTransformando(false); return undefined; }
    setTransformando(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setTransformando(false), MS_TRANSFORMA);
    return () => clearTimeout(reloj.current);
  }, [paso, repeticion, reducido]);

  /*
   * Solo los nodos: dónde toca cada estación la franja. El ALTO ya no se
   * calcula aquí — la franja se estira sola en su carril, y medirlo desde
   * fuera era justo lo que hacía que creciera sin parar.
   */
  useLayoutEffect(() => {
    const caja = columna.current?.getBoundingClientRect();
    if (!caja) return;
    setNodos(ESTACIONES.map((e) => {
      const el = refs.current[e.n];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return Math.round(r.top + r.height / 2 - caja.top);
    }).filter((y) => y != null));
  }, [paso]);

  const contenidoDe = (n) => {
    if (paso < n) return null;
    if (n === 1) return <FormaHecho texto={EL_HECHO} />;
    if (n === 2) return <FormaFactura campos={factura} />;
    if (n === 3) return <FormaRenglon renglon={HECHO.renglon} />;
    if (n === 4) return <FormaEstado balance={BALANCE} />;
    return <FormaPregunta usuario={USUARIO_DEL_RECORRIDO} empresa={BALANCE.empresa} />;
  };

  const texto = cerrado ? CIERRE : TEXTOS[paso];
  const alternativo = cerrado ? ALTERNATIVOS.cierre : ALTERNATIVOS[paso];
  const puede = !transformando;

  const boton = (activo) => ({
    padding: "9px 15px", borderRadius: "999px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 600,
    cursor: activo ? "pointer" : "default", background: "transparent",
    border: `1px solid ${activo ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.1)"}`,
    color: activo ? FAE.text : "rgba(248,249,250,0.35)",
  });

  return (
    <div data-recorrido data-paso={paso}>
      <style>{CSS}</style>

      <p style={{
        margin: "0 0 9px", fontFamily: SORA, fontSize: "11px", fontWeight: 600,
        color: "rgba(248,249,250,0.55)",
      }}>
        {cerrado ? "El ciclo cerrado" : `Paso ${paso} de ${PASOS}`}
      </p>

      <div style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
        <FranjaDelCiclo
          nodos={nodos}
          retorno={retornoEn(paso) === "encendido" ? "encendido" : "atenuado"}
          pulso={cerrado}
          reducido={reducido}
        />
        <div ref={columna} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
          {anillo.map((e) => (
            <Estacion
              key={e.n}
              e={e}
              contenido={contenidoDe(e.n)}
              repeticion={repeticion}
              refCaja={(el) => { if (el) refs.current[e.n] = el; }}
            />
          ))}
        </div>
      </div>

      <p data-texto-paso aria-live="polite" style={{
        margin: "12px 0 0", fontSize: "13.5px", lineHeight: 1.6, color: FAE.text,
      }}>
        {texto}
      </p>
      {/* La versión que lee quien no ve la animación, tal cual la escribió la ficha. */}
      <p data-alternativo style={SOLO_LECTOR}>{alternativo}</p>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button
          type="button"
          data-repetir
          disabled={!puede}
          onClick={() => { if (puede) setRepeticion((r) => r + 1); }}
          style={boton(puede)}
        >
          {BOTON_REPETIR}
        </button>
        <button
          type="button"
          data-siguiente
          disabled={!puede || cerrado}
          onClick={() => { if (puede && !cerrado) setPaso((p) => p + 1); }}
          style={boton(puede && !cerrado)}
        >
          {BOTON_SIGUIENTE}
        </button>
        {cerrado && (
          <button type="button" data-reiniciar onClick={() => { setPaso(1); setRepeticion((r) => r + 1); }} style={boton(true)}>
            Desde el principio
          </button>
        )}
      </div>
    </div>
  );
}
