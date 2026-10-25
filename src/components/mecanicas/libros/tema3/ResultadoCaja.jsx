import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ACT_RESULTADO_CAJA, ELECCIONES, rotuloDe, ROTULO_CAJA_CIERRE, LEYENDA_PUNTEADO, LEYENDA_NEGATIVA, TU_RESPUESTA,
  INTERFAZ_RESULTADO_CAJA as UI, CIERRE_RESULTADO_CAJA, ALT_RESULTADO_CAJA,
} from "../../../../data/contabilidadTema3ResultadoCaja.js";
import {
  casoDe, evaluarResultadoCaja, puntuarResultadoCaja, escalaDe, renglonesDelPuente, leyendaDe, pesos, conSigno,
} from "../../../../contabilidad/resultadoCaja.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import {
  C, INTER, CIFRA, CONTADOR, SOLO_LECTOR, LECTOR, HUNDIDO, ESTADOS, Pastilla, Responder, Cita, useIntento,
} from "../../../repasoCap5/comun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «DEL RESULTADO A LA CAJA» (t3-del-resultado-a-la-caja) — paquete
 * e3-t3-del-resultado-a-la-caja-v4, con las condiciones A1 a A8 de Takamura.
 *
 * Arriba, la ficha del caso con su utilidad (no muestra la caja). Debajo, la
 * RANURA DE DECISIÓN: «Paso n de N» y una tarjeta por paso, con tres botones
 * («Suma», «Resta», «No mueve la caja»). Al elegir, la tarjeta se pliega en la
 * lista de decididas (la más reciente arriba) y entra la siguiente. Un toque
 * en un renglón de la lista devuelve su ficha a la ranura. Cuando todas están
 * decididas, «Comprobar» ocupa la ranura. No hay meta ni total corrido.
 *
 * ═══════════ LA REGLA DE VENTANA (T3) ═══════════
 *
 * La ranura no se mueve: la lista crece por debajo. Al empezar (también
 * después de «Así se juega»), la vista sube a la ficha del caso, como en
 * «¿Gasto o pago?»; así la ranura entera queda en la ventana a 320 × 568 y a
 * 375 × 667 en todos los pasos. Medido en scripts/t3/medir-resultado-caja.mjs.
 *
 * ═══════════ AL COMPROBAR (§8) ═══════════
 *
 * La lista con sus estados (bien: 2 px #F8F9FA y «Correcto»; mal: 2 px coral,
 * «No va aquí» y, a los 0,7 s, «Iba aquí: …»), el mensaje y el puente: una
 * cascada de la utilidad a la caja al cierre. Si falló, el punteado marca
 * adónde lo llevaban sus respuestas; si eso es negativo, no hay punteado y
 * queda solo la frase «Con tus respuestas, la caja daba −$X» (A7). Si
 * cuadra con errores, no hay punteado ni leyenda. Una ficha que no mueve la
 * caja y el estudiante sumó o restó lleva un renglón tenue (Kamogawa, #557).
 * Después, «Ver mi resumen» (A1: sin
 * «Siguiente caso»). Sin reintento.
 *
 * ═══════════ VERSIONES (A1) ═══════════
 *
 * A (San Calixto) en los intentos impares y B (Estudio Foco) en los pares,
 * con `useIntento` del repaso de la Célula E. El intento cuenta al terminarse.
 *
 * Usa las piezas del estándar único de la Célula E (repasoCap5/comun.jsx) y
 * no toca nada compartido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const PLIEGA_MS = 240;
const RENGLON_MS = 200;
const DESFASE_MS = 80;
const REVELA_MS = 700;
const BORDE_SUP = "1px solid rgba(248,249,250,0.12)";

const CSS = `
.fae-rdc button:focus-visible, .fae-rdc [tabindex]:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.fae-rdc-boton, .fae-rdc-renglon { -webkit-tap-highlight-color: transparent; transition: transform 90ms ${CURVA}; }
.fae-rdc-boton:active, .fae-rdc-renglon:not([aria-disabled="true"]):active { transform: scale(0.98); }
@keyframes fae-rdc-entra { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-rdc-entra { animation: fae-rdc-entra ${PLIEGA_MS}ms ${CURVA} both; }
@keyframes fae-rdc-pliega { from { opacity: 0; transform: translateY(-14px) scaleY(.9); } to { opacity: 1; transform: none; } }
.fae-rdc-pliega { animation: fae-rdc-pliega ${PLIEGA_MS}ms ${CURVA} both; transform-origin: top center; }
@keyframes fae-rdc-crece { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes fae-rdc-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-rdc-puente[data-armando="si"] [data-renglon], .fae-rdc-puente[data-armando="si"] [data-renglon-tenue] { animation: fae-rdc-aparece ${RENGLON_MS}ms ${CURVA} both; animation-delay: calc(var(--k) * ${DESFASE_MS}ms); }
.fae-rdc-puente[data-armando="si"] [data-tramo] { transform-origin: left center; animation: fae-rdc-crece ${RENGLON_MS}ms ${CURVA} both; animation-delay: calc(var(--k) * ${DESFASE_MS}ms); }
.fae-rdc-puente[data-armando="si"] [data-punteado], .fae-rdc-puente[data-armando="si"] [data-cifra-suya] { animation: fae-rdc-aparece 200ms ${CURVA} both; animation-delay: var(--tras); }
.fae-rdc-puente[data-armando="no"] * { animation: none !important; }
@media (prefers-reduced-motion: reduce) {
  .fae-rdc *, .fae-rdc-entra, .fae-rdc-pliega { animation: none !important; transition: none !important; }
}
`;

function reducido() {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
}

/* ═══════════ LA FICHA DEL CASO (§7): la empresa, el caso y la utilidad. No muestra la caja. ═══════════ */
function FichaDelCaso({ caso, refFicha, margen }) {
  return (
    <div
      ref={refFicha}
      tabIndex={-1}
      data-ficha-caso={caso.version}
      style={{ ...HUNDIDO, boxSizing: "border-box", minHeight: "128px", margin: margen, padding: "14px", borderRadius: "12px", outline: "none" }}
    >
      <p data-empresa style={{ margin: "0 0 6px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 700, color: C.apagado }}>{caso.empresa}</p>
      <p data-caso style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{caso.texto}</p>
      <p data-utilidad style={{ margin: "8px 0 0", display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "8px", fontFamily: INTER, fontSize: "13px", lineHeight: "20px", fontWeight: 600, color: C.texto }}>
        <span>{caso.rotuloUtilidad}</span>
        <span style={{ ...CIFRA, fontSize: "14px", fontWeight: 400 }}>{pesos(caso.utilidad)}</span>
      </p>
    </div>
  );
}

/* ═══════════ LA TARJETA EN CURSO (§7): nombre y monto; los tres botones. ═══════════ */
function Tarjeta({ ficha, elegida, onElegir, refGrupo }) {
  return (
    <div
      key={ficha.id}
      className="fae-rdc-entra"
      data-tarjeta={ficha.id}
      style={{ boxSizing: "border-box", padding: "10px 11px", borderRadius: "12px", background: C.panel, border: BORDE_SUP }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <p data-nombre style={{ margin: 0, minWidth: 0, maxWidth: "142px", fontFamily: INTER, fontSize: "14px", lineHeight: "18px", fontWeight: 600, color: C.texto }}>{ficha.nombre}</p>
        <p data-monto style={{ ...CIFRA, margin: 0, flex: "none", fontSize: "14px", lineHeight: "18px", color: C.texto }}>{pesos(ficha.monto)}</p>
      </div>
      <div ref={refGrupo} tabIndex={-1} role="group" aria-label={ficha.nombre} style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", columnGap: "8px", outline: "none" }}>
        {ELECCIONES.map((e) => {
          const si = elegida === e.id;
            /*
             * Relleno lateral de 3 (no 4): «No mueve» mide 63,25 px en Inter
             * 13/600 y a 320 el botón deja 64,7 por dentro. Así se parte en
             * dos renglones, «No mueve / la caja», y el botón queda en 44.
             */
          return (
            <button
              key={e.id}
              type="button"
              className="fae-rdc-boton"
              data-eleccion={e.id}
              aria-pressed={si}
              onClick={() => onElegir(ficha.id, e.id)}
              style={{
                boxSizing: "border-box", minWidth: 0, minHeight: "44px", padding: "0 3px", borderRadius: "8px", cursor: "pointer",
                border: si ? `2px solid ${C.texto}` : "1px solid rgba(248,249,250,0.35)", background: "transparent", color: C.texto,
                fontFamily: INTER, fontSize: "13px", lineHeight: "16px", fontWeight: 600, overflowWrap: "normal", wordBreak: "normal", hyphens: "manual",
              }}
            >
              {e.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════ UN RENGLÓN DE LA LISTA (§7, §8.1) ═══════════ */
function Renglon({ ficha, elegida, estado, revelada, onTocar, nuevo }) {
  const calificado = estado === "ok" || estado === "mal";
  const forma = calificado ? ESTADOS[estado] : { border: "1px solid rgba(248,249,250,0.12)", background: "transparent" };
  const contenido = (
    <>
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <span data-nombre style={{ minWidth: 0, fontFamily: INTER, fontSize: "13px", lineHeight: "16px", fontWeight: 600, color: C.texto, textAlign: "left" }}>{ficha.nombre}</span>
        <span data-elegida style={{ flex: "none", fontFamily: INTER, fontSize: "13px", lineHeight: "16px", color: C.apagado }}>{rotuloDe(elegida)}</span>
      </span>
      {calificado && (
        <span data-marcas style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 8px", marginTop: "4px", minHeight: "16px" }}>
          <Pastilla estado={estado} />
          {estado === "mal" && revelada && <span data-iba><Pastilla estado="revelada" valor={rotuloDe(ficha.va)} /></span>}
        </span>
      )}
    </>
  );
  const estilo = {
    display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", boxSizing: "border-box", minHeight: calificado ? "52px" : "44px", padding: calificado ? "6px 10px" : "6px 10px",
    borderRadius: "8px", border: forma.border, background: forma.background, color: C.texto, textAlign: "left",
  };
  if (calificado) {
    return <li data-renglon-lista={ficha.id} data-estado={estado} style={{ ...estilo, listStyle: "none" }}>{contenido}</li>;
  }
  return (
    <li data-renglon-lista={ficha.id} className={nuevo ? "fae-rdc-pliega" : undefined} style={{ listStyle: "none" }}>
      <button type="button" className="fae-rdc-renglon" aria-label={UI.cambiar(ficha.nombre, rotuloDe(elegida))} onClick={() => onTocar(ficha.id)} style={{ ...estilo, cursor: "pointer" }}>
        {contenido}
      </button>
    </li>
  );
}

/* ═══════════ EL PUENTE (§8.3) ═══════════ */
export function Puente({ caso, suya, respuestas = null, armar = true }) {
  const filas = renglonesDelPuente(caso, ROTULO_CAJA_CIERRE, respuestas);
  const escala = escalaDe(caso);
  const leyenda = leyendaDe(caso, suya);
  const fallo = leyenda === "punteado";
  const negativa = leyenda === "negativa";
  const caja = useRef(null);
  const [ancho, setAncho] = useState(0);
  const [armando, setArmando] = useState(false);
  const [visto, setVisto] = useState(false);
  useLayoutEffect(() => {
    const el = caja.current;
    if (!el) return undefined;
    const medir = () => setAncho(el.querySelector("[data-pista]")?.getBoundingClientRect().width ?? 0);
    medir();
    if (typeof ResizeObserver !== "function") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /* Se arma al entrar en la ventana (§10); con movimiento reducido, entero. */
  useEffect(() => {
    if (!armar || reducido() || typeof IntersectionObserver !== "function" || !caja.current) { setVisto(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setArmando(true); setVisto(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(caja.current);
    return () => io.disconnect();
  }, []);
  const parte = (x) => Math.max(0, Math.min(1, x / escala));
  const tras = `${(filas.length - 1) * DESFASE_MS + RENGLON_MS}ms`;
  const nombre = UI.puente(pesos(caso.utilidad), pesos(caso.caja), pesos(suya));
  return (
    <div
      ref={caja}
      className="fae-rdc-puente"
      data-puente
      data-armando={armando ? "si" : "no"}
      role="img"
      aria-label={nombre}
      onClick={() => setArmando(false)}
      style={{ boxSizing: "border-box", marginTop: "16px", padding: "12px", borderRadius: "12px", background: C.panel, border: BORDE_SUP, visibility: visto ? "visible" : "hidden" }}
    >
      {filas.map((f, k) => {
        /* El renglón tenue: la ficha que no mueve la caja, con lo que le puso el estudiante. Sin tramo. */
        if (f.tenue) {
          return (
            <div key={f.id} data-renglon-tenue={f.id} style={{ "--k": k, minHeight: "30px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", minHeight: "16px" }}>
                <span style={{ minWidth: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 600, color: C.apagado }}>{f.nombre}</span>
                <span data-cifra-tenue style={{ ...CIFRA, flex: "none", fontSize: "12px", lineHeight: "16px", color: C.apagado }}>{conSigno(f.signo, f.monto)} {TU_RESPUESTA}</span>
              </div>
            </div>
          );
        }
        const pxAncho = parte(f.hasta - f.desde) * ancho;
        const esCaja = f.id === "caja";
        const cifra = f.id === "utilidad" || esCaja ? pesos(f.monto) : conSigno(f.signo, f.monto);
        return (
          <div key={f.id} data-renglon={f.id} style={{ "--k": k, minHeight: "30px", boxSizing: "border-box" }}>
            {/* El nombre largo se parte en dos renglones antes que cortarse (a 320, en B, tres no caben en uno con su cifra). */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", minHeight: "16px" }}>
              <span style={{ minWidth: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 600, color: C.texto }}>{f.nombre}</span>
              <span data-cifra style={{ ...CIFRA, flex: "none", fontSize: "12px", lineHeight: "16px", color: C.texto }}>{cifra}</span>
            </div>
            <div data-pista style={{ position: "relative", height: "10px", margin: "2px 0 2px" }}>
              {/* E11: un tramo de menos de 4 px se queda solo con su cifra. */}
              {pxAncho >= 4 || ancho === 0 ? (
                <div data-tramo data-lleno={f.lleno ? "si" : "no"} style={{
                  "--k": k, position: "absolute", top: 0, height: "10px", boxSizing: "border-box", borderRadius: "2px",
                  left: `${parte(f.desde) * 100}%`, width: `${parte(f.hasta - f.desde) * 100}%`,
                  background: f.lleno ? C.hecho : "transparent", border: f.lleno ? "none" : `2px solid ${C.hecho}`,
                }} />
              ) : null}
              {esCaja && fallo && !negativa && (
                <div data-punteado style={{
                  "--tras": tras, position: "absolute", left: 0, top: "-2px", height: "14px", width: `${parte(suya) * 100}%`,
                  boxSizing: "border-box", border: `1px dashed ${C.atenuado}`, borderRadius: "3px",
                }} />
              )}
            </div>
          </div>
        );
      })}
      {/* La cifra de sus respuestas, bajo el final del punteado, y su leyenda. Solo si hay punteado. */}
      {fallo && (
        <p style={{ position: "relative", margin: 0, height: "16px" }}>
          <span data-cifra-suya style={{
            "--tras": tras, ...CIFRA, position: "absolute", top: 0, whiteSpace: "nowrap", fontSize: "12px", lineHeight: "16px", color: C.atenuado,
            ...(parte(suya) * ancho < 72 ? { left: 0 } : { left: `${parte(suya) * 100}%`, transform: "translateX(-100%)" }),
          }}>
            {pesos(suya)}
          </span>
        </p>
      )}
      {fallo && (
        <p data-leyenda="punteado" style={{ margin: 0, minHeight: "16px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.apagado }}>
          {LEYENDA_PUNTEADO}
        </p>
      )}
      {/* A7 (Kamogawa, #557): caja negativa, sin punteado; la frase va pegada a la cifra, con su signo. */}
      {negativa && (
        <p data-leyenda="negativa" style={{ margin: 0, minHeight: "16px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.apagado }}>
          {LEYENDA_NEGATIVA}{" "}
          <span data-cifra-suya style={{ "--tras": tras, ...CIFRA, whiteSpace: "nowrap", fontSize: "12px", lineHeight: "16px", fontWeight: 700, color: C.atenuado }}>{pesos(suya)}</span>
        </p>
      )}
      {/* Cuadra con errores: ni punteado ni cifra, así que no hay leyenda; lo dice ERROR_CUADRA_CON_ERRORES. */}
    </div>
  );
}

/* El mensaje (§8.2): fondo rgba(184,196,212,.12), raya #B8C4D4 o coral. */
function Mensaje({ r }) {
  return (
    <div aria-live="polite" data-devolucion={r ? (r.ok ? "acierto" : "error") : "vacia"}>
      {r && (
        <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${r.ok ? C.atenuado : C.coral}` }}>
          {r.textos.map((x, k) => (
            <p key={k} data-parrafo-devolucion style={{ margin: k ? "8px 0 0" : 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.texto }}>
              {k === 0 && <span style={SOLO_LECTOR}>{r.ok ? LECTOR.acierto : LECTOR.error}</span>}
              {x}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultadoCaja({
  Marco, rotulo, titulo, acento, onCompletar, caso: demo = null, modoDemo = false, onComoSeJuega = null, version: fija = null,
}) {
  const intento = useIntento(ACT_RESULTADO_CAJA.id, fija);
  const version = useRef(intento.version);
  const t = useTanda(() => [demo ?? casoDe(version.current)]);
  const caso = t.items[0];
  const fichas = caso.fichas;
  const cuantas = fichas.length;

  /* { [fichaId]: eleccion } y el orden en que se decidieron (la más reciente primero). */
  const [respuestas, setRespuestas] = useState({});
  const [orden, setOrden] = useState([]);
  /* La ficha que el estudiante devolvió a la ranura desde la lista. */
  const [reabierta, setReabierta] = useState(null);
  const [nueva, setNueva] = useState(null);
  const [r, setR] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const reloj = useRef(null);
  const fichaCaso = useRef(null);
  const ranura = useRef(null);
  const grupo = useRef(null);
  const comprobar = useRef(null);
  const lista = useRef(null);
  const raiz = useRef(null);
  const primera = useRef(true);

  const pendientes = fichas.filter((f) => !(f.id in respuestas));
  const actual = reabierta ? fichas.find((f) => f.id === reabierta) : pendientes[0] ?? null;
  const todas = pendientes.length === 0 && !reabierta;
  const pct = r ? puntuarResultadoCaja(r, cuantas) : 0;

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (!t.terminado || modoDemo) return;
    onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
    version.current = intento.terminar();
  }, [t.terminado]);

  /* La vista sube a la ficha del caso: la ranura entera queda en la ventana (regla de T3). */
  const subirALaFicha = () => {
    const el = fichaCaso.current;
    if (!el || modoDemo) return;
    el.scrollIntoView?.({ block: "start", behavior: reducido() ? "auto" : "smooth" });
  };
  /*
   * Como en «¿Gasto o pago?»: la partida se monta escondida bajo «Así se
   * juega»; cuando se vuelve visible, la vista sube a la ficha del caso, un
   * instante después del foco que JuegoConTutorial pone en la consigna.
   */
  useEffect(() => {
    if (modoDemo || typeof ResizeObserver !== "function" || !raiz.current) return undefined;
    let visible = false;
    let espera = null;
    const ro = new ResizeObserver(([e]) => {
      const ahora = e.contentRect.height > 0;
      if (ahora && !visible) { clearTimeout(espera); espera = setTimeout(subirALaFicha, 60); }
      visible = ahora;
    });
    ro.observe(raiz.current);
    return () => { ro.disconnect(); clearTimeout(espera); };
  }, [t.terminado]);

  /* El foco sigue a la ranura: la tarjeta nueva o «Comprobar» (sin mover la vista). */
  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    if (modoDemo || r) return;
    const el = todas ? comprobar.current : grupo.current;
    el?.focus({ preventScroll: true });
  }, [actual?.id, todas]);

  const elegir = (id, eleccion) => {
    if (r) return;
    const f = fichas.find((x) => x.id === id);
    setRespuestas((xs) => ({ ...xs, [id]: eleccion }));
    setOrden((xs) => [id, ...xs.filter((x) => x !== id)]);
    setReabierta(null);
    setNueva(id);
    setAnuncio(`${f.nombre}: ${rotuloDe(eleccion)}.`);
    /* §6: en la demo, la única ficha queda puesta y sale la resolución. */
    if (modoDemo) setR({ ok: true, textos: [caso.acierto], fichas: [], suya: caso.caja });
  };

  const reabrir = (id) => {
    if (r) return;
    setReabierta(id);
    setNueva(null);
    if (!modoDemo) ranura.current?.scrollIntoView?.({ block: "nearest", behavior: reducido() ? "auto" : "smooth" });
  };

  const alComprobar = () => {
    const ev = evaluarResultadoCaja(caso, respuestas);
    for (const f of ev.fichas) t.anotar(f.id, f.ok, f.ok ? null : f.elegida);
    setR(ev);
    setNueva(null);
    if (reducido()) setRevelada(true);
    else reloj.current = setTimeout(() => setRevelada(true), REVELA_MS);
    (globalThis.requestAnimationFrame ?? setTimeout)(() => {
      lista.current?.focus({ preventScroll: true });
      lista.current?.scrollIntoView?.({ block: "start", behavior: reducido() ? "auto" : "smooth" });
    });
  };

  const avanzar = () => t.setTerminado(true);
  const reiniciar = () => {
    clearTimeout(reloj.current);
    t.reiniciar();
    setRespuestas({}); setOrden([]); setReabierta(null); setNueva(null); setR(null); setRevelada(false); setAnuncio("");
    primera.current = true;
  };

  if (t.terminado) {
    const bien = r ? r.fichas.filter((f) => f.ok).length : 0;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <div ref={raiz} className="fae-rdc" data-resultado-caja data-version={caso.version} data-estado-partida="resumen">
          {/* §9: encima del resumen, el puente del caso jugado y CIERRE_RESULTADO_CAJA. */}
          <Puente caso={caso} suya={r?.suya ?? caso.caja} respuestas={respuestas} armar={false} />
          <p data-cierre-texto style={{ margin: "16px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>
            {CIERRE_RESULTADO_CAJA}
          </p>
          <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
            <p style={TEXTO_CIERRE}>
              {bien} de {cuantas} fichas en su lugar. Cada ficha valía {(100 / cuantas).toFixed(2)} %.
            </p>
          </Cierre>
        </div>
      </Marco>
    );
  }

  /* La lista: antes de comprobar, la más reciente arriba; después, en el orden de las fichas. */
  const enLista = r && !modoDemo ? fichas.map((f) => f.id) : orden.filter((id) => id !== reabierta);
  const estadoPartida = r ? (modoDemo ? "demo-resuelta" : r.ok ? "bien" : "mal") : todas ? "lista" : Object.keys(respuestas).length ? "a-mitad" : "vacio";

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div ref={raiz} className="fae-rdc" data-resultado-caja data-version={caso.version} data-estado-partida={estadoPartida}>
        {!modoDemo && (
          <div data-encabezado-hacer>
            <Encabezado consigna={ACT_RESULTADO_CAJA.consigna} onComoSeJuega={onComoSeJuega} />
          </div>
        )}

        <FichaDelCaso caso={caso} refFicha={fichaCaso} margen={modoDemo ? 0 : "16px 0 0"} />

        {/* La ranura de decisión (§7): «Paso n de N» y la tarjeta, o «Comprobar». Desaparece al comprobar. */}
        {!r && (
          <div ref={ranura} data-ranura style={{ marginTop: "12px", minHeight: "112px" }}>
            {actual ? (
              <>
                <p data-paso style={{ ...CONTADOR, margin: "0 0 4px" }}>{UI.paso(fichas.indexOf(actual) + 1, cuantas)}</p>
                <Tarjeta key={actual.id} ficha={actual} elegida={respuestas[actual.id] ?? null} onElegir={elegir} refGrupo={grupo} />
              </>
            ) : (
              <div data-ranura-comprobar>
                <Responder botonRef={comprobar} onClick={alComprobar} etiqueta={UI.comprobar} datos={{ "data-comprobar": true }}>{UI.comprobar}</Responder>
              </div>
            )}
          </div>
        )}

        {/* La lista de decididas (§7, §8.1). */}
        {enLista.length > 0 && (
          <ul ref={lista} tabIndex={-1} data-lista aria-label="Fichas puestas" style={{ margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: r && !modoDemo ? "6px" : "4px", outline: "none" }}>
            {enLista.map((id) => {
              const f = fichas.find((x) => x.id === id);
              const ev = r && !modoDemo ? r.fichas.find((x) => x.id === id) : null;
              return (
                <Renglon key={id} ficha={f} elegida={respuestas[id]} estado={ev ? (ev.ok ? "ok" : "mal") : null}
                  revelada={revelada} onTocar={reabrir} nuevo={nueva === id} />
              );
            })}
          </ul>
        )}

        <Mensaje r={r} />
        {r && !modoDemo && <Puente caso={caso} suya={r.suya} respuestas={respuestas} />}
        {r && !modoDemo && (
          <Responder onClick={avanzar} etiqueta={UI.verMiResumen} datos={{ "data-siguiente": true }}>{UI.verMiResumen}</Responder>
        )}

        <p aria-live="polite" style={SOLO_LECTOR}>{anuncio}</p>
        {!modoDemo && <Cita texto={caso.pie} />}
        {!modoDemo && <p style={SOLO_LECTOR}>{ALT_RESULTADO_CAJA}</p>}
      </div>
    </Marco>
  );
}

