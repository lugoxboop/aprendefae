import { useCallback, useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../data/contabilidadIntro.js";
import { CSS_SALA } from "../salaDeControl/marco.jsx";
import { CSS_JUEGO } from "../corazon/juego.jsx";
import { Responder } from "./piezas.jsx";
import { SOLO_LECTOR } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — el mini-tutorial de una actividad.
 *
 * Una pantalla entera: el nombre de la actividad, su consigna, tres pasos y
 * una demo. La demo es EL COMPONENTE REAL de la actividad, en modo demo, con
 * un ejemplo que llega desde afuera y un guion de toques con sus tiempos. Una
 * mano fantasma va a cada punto y lo toca; el componente responde igual que
 * en la partida, porque es la partida.
 *
 * ═══════════ LA DEMO NO SE PUEDE TOCAR, Y NO GUARDA NADA ═══════════
 *
 * Solo la caja del componente lleva `inert`: la figura, su descripción y los
 * controles de fuera siguen vivos. Los toques del guion quitan el `inert` un
 * instante —dentro del mismo tick, sin que nadie pueda meter un dedo en
 * medio— para que el clic llegue igual en todos los navegadores. Y el
 * componente en modo demo no llama a `onCompletar`: ni FP, ni intentos, ni
 * progreso.
 *
 * ═══════════ UNA VEZ, SIN BUCLE ═══════════
 *
 * La demo corre una vez. Fuera de ella, un control: «Pausar» mientras corre y
 * «Ver de nuevo» cuando termina. «Siguiente» está apagado —y lo dice: «Mira el
 * ejemplo»— hasta que la primera pasada termina.
 *
 * ═══════════ MOVIMIENTO REDUCIDO: TRES CUADROS ═══════════
 *
 * Sin animación, la demo son tres cuadros fijos —inicio, gesto, resultado—
 * que se pasan con «Siguiente cuadro». En el del gesto la mano se queda quieta
 * sobre el punto tocado. «Siguiente» se enciende en el tercero.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
/* Lo que tarda la mano en llegar a su punto antes de tocarlo. */
const VIAJE_MS = 700;
const TIC_MS = 40;
/* Dónde queda la punta del dedo dentro del dibujo de la mano (34 × 34). */
const PUNTA = { x: 11, y: 3 };

const CSS = `
@keyframes fae-asj-onda { from { transform: translate(-50%, -50%) scale(0.3); opacity: 0.85; } to { transform: translate(-50%, -50%) scale(1.6); opacity: 0; } }
.fae-asj-onda { animation: fae-asj-onda 520ms ease-out both; }
.fae-asj-pausa * { animation-play-state: paused !important; }
@media (prefers-reduced-motion: reduce) {
  .fae-asj-onda { animation: none !important; opacity: 0 !important; }
}
`;

/* El marco de la demo: ninguno. Solo las hojas de estilo que el componente espera. */
function MarcoDemo({ children }) {
  return (
    <>
      <style>{CSS_SALA + CSS_JUEGO}</style>
      {children}
    </>
  );
}

const leerReducido = () => {
  try {
    return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
};

/* La mano. Solo decoración: el lector de pantalla tiene la descripción de la figura. */
function Mano({ pos, visible, reducido }) {
  return (
    <svg
      data-mano
      aria-hidden="true"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      style={{
        position: "absolute", left: 0, top: 0, zIndex: 3, pointerEvents: "none", overflow: "visible",
        transform: `translate(${pos.x - PUNTA.x}px, ${pos.y - PUNTA.y}px)`,
        opacity: visible ? 0.92 : 0,
        transition: reducido ? "none" : `transform ${VIAJE_MS - 100}ms cubic-bezier(.3,.7,.3,1), opacity 250ms ease`,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))",
      }}
    >
      <g fill="#F8F9FA" stroke={NAVY_DEL_CHIP} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12M11 11.5v-2a1.5 1.5 0 0 1 3 0V12M14 10.5a1.5 1.5 0 0 1 3 0V12M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.3 15.2a1.6 1.6 0 0 1 2.6-1.9L8 15" />
      </g>
    </svg>
  );
}

/**
 *   asi          la entrada de la actividad en `data/asiSeJuegaBloque1.js`
 *   Mecanica     el componente real de la actividad
 *   onSiguiente  al pulsar «Siguiente»: se va a la partida
 *   escala       multiplica los tiempos del guion (las pruebas lo aceleran)
 */
export default function AsiSeJuega({ asi, Mecanica, onSiguiente, escala = 1 }) {
  const [reducido, setReducido] = useState(leerReducido);
  const [vuelta, setVuelta] = useState(0);
  const [corriendo, setCorriendo] = useState(true);
  const [terminada, setTerminada] = useState(false);
  const [vista, setVista] = useState(false);
  const [cuadro, setCuadro] = useState(1);
  const [mano, setMano] = useState({ pos: { x: 0, y: 0 }, visible: false });
  const [onda, setOnda] = useState(null);

  const figura = useRef(null);
  const escenario = useRef(null);
  const transcurrido = useRef(0);
  const hechos = useRef(0);

  /* El guion hecho eventos: para cada toque, primero el viaje y luego el toque. */
  const toques = asi.guion.toques;
  const eventos = useRef([]);
  eventos.current = toques.flatMap((t, k) => [
    { ms: Math.max(0, t.ms - VIAJE_MS) * escala, tipo: "viajar", k },
    { ms: t.ms * escala, tipo: "tocar", k },
  ]).concat({ ms: asi.guion.duracion * escala, tipo: "fin" });

  useEffect(() => {
    if (!globalThis.matchMedia) return undefined;
    const consulta = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setReducido(Boolean(consulta.matches));
    consulta.addEventListener?.("change", leer);
    return () => consulta.removeEventListener?.("change", leer);
  }, []);

  /* Solo la caja del componente es inerte. */
  useEffect(() => {
    escenario.current?.setAttribute("inert", "");
  }, [vuelta]);

  /* Al empezar, la mano espera abajo a la derecha, fuera de lo que va a tocar. */
  useEffect(() => {
    if (reducido) return;
    const caja = figura.current;
    const ancho = caja?.clientWidth ?? 0;
    const alto = caja?.clientHeight ?? 0;
    setMano({ pos: { x: Math.max(0, ancho - 28), y: Math.max(0, alto - 18) }, visible: true });
  }, [vuelta, reducido]);

  const buscar = useCallback((toque) => {
    const raiz = escenario.current;
    if (!raiz) return null;
    if (toque.en) return raiz.querySelector(toque.en);
    return [...raiz.querySelectorAll("button")].find((b) => b.textContent.trim() === toque.texto) ?? null;
  }, []);

  const centroDe = useCallback((el) => {
    const base = figura.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!base) return { x: 0, y: 0 };
    return { x: Math.round(r.left - base.left + r.width / 2), y: Math.round(r.top - base.top + r.height / 2) };
  }, []);

  /* El toque del guion: fuera el `inert` un instante, el clic, y otra vez dentro. */
  const pulsar = useCallback((el) => {
    const raiz = escenario.current;
    raiz?.removeAttribute("inert");
    try {
      el.click();
    } finally {
      raiz?.setAttribute("inert", "");
    }
  }, []);

  /* Un evento del guion. Devuelve false si su punto todavía no está en pantalla. */
  const ejecutar = useCallback((ev) => {
    if (ev.tipo === "fin") {
      setMano((m) => ({ ...m, visible: false }));
      setTerminada(true); setCorriendo(false); setVista(true);
      return true;
    }
    const el = buscar(toques[ev.k]);
    if (!el || el.disabled) return false;
    const pos = centroDe(el);
    if (ev.tipo === "viajar") {
      setMano({ pos, visible: true });
      return true;
    }
    setMano({ pos, visible: true });
    setOnda({ ...pos, clave: `${vuelta}-${ev.k}` });
    pulsar(el);
    return true;
  }, [buscar, centroDe, pulsar, toques, vuelta]);

  /*
   * ═══════════ EL RELOJ ═══════════
   *
   * Uno solo y pausable: avanza de a poco mientras corre, y cada evento sale
   * cuando le toca. Si su punto aún no existe —el componente todavía está en
   * su propia animación— se reintenta en el siguiente tic, y los que van
   * detrás esperan: el orden del guion no se salta nunca.
   */
  useEffect(() => {
    if (reducido || !corriendo) return undefined;
    let antes = Date.now();
    const id = setInterval(() => {
      const ahora = Date.now();
      transcurrido.current += ahora - antes;
      antes = ahora;
      while (hechos.current < eventos.current.length) {
        const ev = eventos.current[hechos.current];
        if (ev.ms > transcurrido.current) break;
        if (!ejecutar(ev)) break;
        hechos.current += 1;
      }
    }, TIC_MS);
    return () => clearInterval(id);
  }, [reducido, corriendo, ejecutar]);

  const deNuevo = () => {
    transcurrido.current = 0;
    hechos.current = 0;
    setOnda(null);
    setTerminada(false);
    setCuadro(1);
    setVuelta((v) => v + 1);
    setCorriendo(true);
  };

  /*
   * ═══════════ LOS TRES CUADROS ═══════════
   *
   * El 2 hace los toques del gesto y deja la mano quieta sobre el último. El 3
   * hace el resto de uno en uno —cada toque puede hacer aparecer el siguiente—
   * y quita la mano.
   */
  const reloj = useRef([]);
  useEffect(() => () => reloj.current.forEach(clearTimeout), []);
  const enOrden = (lista, alFinal, intentos = 60) => {
    if (lista.length === 0) { alFinal?.(); return; }
    const [toque, ...resto] = lista;
    const el = buscar(toque);
    if (!el || el.disabled) {
      if (intentos > 0) reloj.current.push(setTimeout(() => enOrden(lista, alFinal, intentos - 1), 50));
      return;
    }
    pulsar(el);
    alFinal && resto.length === 0 ? alFinal(el) : enOrden(resto, alFinal);
  };
  const siguienteCuadro = () => {
    const gesto = asi.cuadros?.gesto ?? 1;
    if (cuadro === 1) {
      setCuadro(2);
      enOrden(toques.slice(0, gesto), (ultimo) => {
        if (ultimo) setMano({ pos: centroDe(ultimo), visible: true });
      });
      return;
    }
    if (cuadro === 2) {
      setCuadro(3);
      setMano((m) => ({ ...m, visible: false }));
      enOrden(toques.slice(gesto));
      setVista(true);
    }
  };
  const deNuevoCuadros = () => {
    reloj.current.forEach(clearTimeout);
    reloj.current = [];
    setMano({ pos: { x: 0, y: 0 }, visible: false });
    setCuadro(1);
    setVuelta((v) => v + 1);
  };

  let control;
  if (reducido) {
    control = cuadro < 3
      ? { texto: "Siguiente cuadro", accion: siguienteCuadro }
      : { texto: "Ver de nuevo", accion: deNuevoCuadros };
  } else if (terminada) {
    control = { texto: "Ver de nuevo", accion: deNuevo };
  } else if (corriendo) {
    control = { texto: "Pausar", accion: () => setCorriendo(false) };
  } else {
    control = { texto: "Seguir", accion: () => setCorriendo(true) };
  }

  return (
    <section data-asi-se-juega={asi.actividadId} aria-labelledby={`asj-${asi.actividadId}`}>
      <style>{CSS}</style>
      <h2 id={`asj-${asi.actividadId}`} style={{
        margin: "0 0 6px", fontFamily: SORA, fontSize: "21px", fontWeight: 700,
        lineHeight: 1.25, letterSpacing: "-0.01em", color: FAE.text,
      }}>
        {asi.titulo}
      </h2>
      <p data-asj-consigna style={{ margin: "0 0 14px", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)" }}>
        {asi.consigna}
      </p>

      <ol data-asj-pasos style={{ margin: "0 0 18px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
        {asi.pasos.map((p, k) => (
          <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13.5px", lineHeight: 1.45, color: FAE.text }}>
            <span aria-hidden="true" style={{
              flex: "none", width: "22px", height: "22px", borderRadius: "999px", background: NEUTRO,
              color: NAVY_DEL_CHIP, fontFamily: SORA, fontSize: "12px", fontWeight: 700,
              lineHeight: "22px", textAlign: "center", marginTop: "-1px",
            }}>
              {k + 1}
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ol>

      <div data-asj-demo style={{
        position: "relative", padding: "16px 10px 12px", borderRadius: "14px",
        border: `1.5px dashed ${NEUTRO}`, background: "rgba(10,20,34,0.3)",
      }}>
        <span aria-hidden="true" style={{
          position: "absolute", top: "-10px", left: "12px", padding: "2px 9px", borderRadius: "999px",
          background: NEUTRO, color: NAVY_DEL_CHIP, fontFamily: SORA, fontSize: "10px",
          fontWeight: 700, letterSpacing: "0.16em",
        }}>
          EJEMPLO
        </span>
        <figure ref={figura} data-asj-figura style={{ position: "relative", margin: 0 }}>
          <figcaption style={SOLO_LECTOR}>{asi.alt}</figcaption>
          <div
            key={vuelta}
            ref={escenario}
            data-asj-escenario
            className={!corriendo && !terminada && !reducido ? "fae-asj-pausa" : undefined}
            style={{ userSelect: "none" }}
          >
            <Mecanica Marco={MarcoDemo} modoDemo acento={FAE.ambar} {...asi.demo} />
          </div>
          {onda && !reducido && (
            <span key={onda.clave} data-onda aria-hidden="true" className="fae-asj-onda" style={{
              position: "absolute", left: `${onda.x}px`, top: `${onda.y}px`, zIndex: 2,
              width: "38px", height: "38px", borderRadius: "999px", pointerEvents: "none",
              border: `2px solid ${NEUTRO}`, background: "rgba(184,196,212,0.18)",
            }} />
          )}
          <Mano pos={mano.pos} visible={mano.visible} reducido={reducido} />
        </figure>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
        <button
          type="button"
          data-asj-control
          onClick={control.accion}
          style={{
            minHeight: "40px", padding: "0 16px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
            color: "rgba(248,249,250,0.82)", fontFamily: SORA, fontSize: "12.5px", fontWeight: 600,
          }}
        >
          {control.texto}
        </button>
      </div>
      {reducido && (
        <p data-asj-cuadro style={{ margin: "6px 0 0", textAlign: "center", fontSize: "12px", color: "rgba(248,249,250,0.6)" }}>
          Cuadro {cuadro} de 3
        </p>
      )}

      {/* «Siguiente» se queda pegado abajo aunque la página tenga que hacer scroll. */}
      <div data-asj-siguiente style={{
        position: "sticky", bottom: 0, zIndex: 5, marginTop: "6px", paddingBottom: "14px",
        background: `linear-gradient(to bottom, transparent, ${FAE.bg} 30%)`,
      }}>
        <Responder onClick={onSiguiente} deshabilitado={!vista}>
          {vista ? "Siguiente" : "Mira el ejemplo"}
        </Responder>
      </div>
    </section>
  );
}
