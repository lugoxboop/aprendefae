import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import {
  ACT_GASTO_O_PAGO, CASILLAS, nombreDeCasilla, ROTULO_GASTO, ROTULO_SIN_GASTO, ROTULO_SALIDA, ROTULO_SIN_SALIDA,
  INTERFAZ_GASTO_O_PAGO as UI, CIERRE_GASTO_O_PAGO, ALT_GASTO_O_PAGO,
} from "../../../../data/contabilidadTema3GastoOPago.js";
import {
  bancoDe, sortearGastoOPago, evaluarGastoOPago, aporteDe, contadores, escalaDe, puntuarGastoOPago, pesos,
} from "../../../../contabilidad/gastoOPago.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import {
  C, INTER, CIFRA, CONTADOR, SOLO_LECTOR, LECTOR, ESTADOS, Pastilla, Responder, useIntento,
} from "../../../repasoCap5/comun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «¿GASTO O PAGO?» (t3-gasto-o-pago) — paquete e3-t3-gasto-o-pago-v3,
 * con las condiciones C1 a C6 de Takamura.
 *
 * La ficha del hecho arriba y, debajo, una matriz de cuatro casillas: la fila
 * dice si hubo gasto y la columna si salió plata. Un toque califica (§7); no
 * hay «Comprobar» ni reintento. La ficha cae en la casilla y se mueven solo
 * los contadores que esa casilla toca: «Gastos» y «Salió» suman cosas
 * distintas, y en «ni gasto ni salida» no se mueve ninguno.
 *
 * ═══════════ AL FALLAR (§7, patrón de r5) ═══════════
 *
 *   0 ms     la casilla tocada en coral con «No va aquí»; la ficha cae ahí y
 *            los contadores van a lo que el estudiante dijo
 *   700 ms   la correcta toma 2 px #F8F9FA y «Iba aquí»
 *   900 ms   la ficha pasa a la correcta (320 ms) y los contadores a su valor
 *            (400 ms); queda la barra punteada de lo que habría sido (C3)
 *
 * Un toque en la matriz salta al final; «Siguiente hecho» completa y avanza.
 * Con movimiento reducido se ve todo a la vez.
 *
 * ═══════════ VERSIONES (C5) ═══════════
 *
 * A (Peluquería Doña Inés) en los intentos impares y B (Taller La Cadena) en
 * los pares, con `useIntento` del repaso de la Célula E. El intento cuenta al
 * terminarse.
 *
 * Usa las piezas del estándar único de la Célula E (repasoCap5/comun.jsx):
 * colores, pastilla, Responder y la versión por intento. No toca nada
 * compartido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const CAE_MS = 320;
const CUENTA_MS = 400;
const REVELA_MS = 700;
const CORRIGE_MS = 900;

const CSS = `
.fae-gp button:focus-visible, .fae-gp [tabindex]:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.fae-gp-casilla { -webkit-tap-highlight-color: transparent; transition: transform 90ms ${CURVA}; }
.fae-gp-casilla:not([aria-disabled="true"]):active { transform: scale(0.98); }
@keyframes fae-gp-cae { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
.fae-gp-cae { animation: fae-gp-cae ${CAE_MS}ms ${CURVA} both; }
.fae-gp-barra { transform-origin: left center; transition: transform ${CUENTA_MS}ms ${CURVA}; }
@keyframes fae-gp-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-gp-aparece { animation: fae-gp-aparece 200ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) {
  .fae-gp *, .fae-gp-cae, .fae-gp-barra, .fae-gp-aparece { animation: none !important; transition: none !important; }
}
`;

function reducido() {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
}

/* Una cifra que cuenta hasta su valor en 400 ms (§8). Con movimiento reducido, directo. */
function useCuenta(valor) {
  const [mostrado, setMostrado] = useState(valor);
  const desde = useRef(valor);
  useEffect(() => {
    const inicio = desde.current;
    if (inicio === valor) return undefined;
    if (reducido() || typeof requestAnimationFrame !== "function") { desde.current = valor; setMostrado(valor); return undefined; }
    let id = null;
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / CUENTA_MS);
      const v = inicio + (valor - inicio) * (1 - (1 - k) ** 3);
      desde.current = v;
      setMostrado(v);
      if (k < 1) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [valor]);
  return mostrado;
}

/* La ficha caída: 22 × 22, el número del hecho en mono 12, radio 4 (§6). */
function Ficha({ numero, enCurso }) {
  return (
    <span
      data-ficha-caida={numero}
      data-en-curso={enCurso ? "si" : "no"}
      className={enCurso ? "fae-gp-cae" : undefined}
      aria-hidden="true"
      style={{
        ...CIFRA, display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
        width: "22px", height: "22px", borderRadius: "4px", fontSize: "12px", lineHeight: 1, color: C.texto,
        border: `2px solid ${enCurso ? C.texto : C.atenuado}`,
      }}
    >
      {numero}
    </span>
  );
}

/* Una casilla de la matriz: un botón de 56 px de alto con su nombre de dos rótulos (§6, §8, C3). */
function Casilla({ casilla, estado, fichas, activa, onTocar }) {
  const forma = ESTADOS[estado] ?? ESTADOS.reposo;
  return (
    <button
      type="button"
      className="fae-gp-casilla"
      data-casilla={casilla.id}
      data-estado={estado}
      aria-label={nombreDeCasilla(casilla)}
      aria-disabled={activa ? undefined : "true"}
      onClick={() => onTocar(casilla.id)}
      style={{
        position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start",
        gap: "4px", boxSizing: "border-box", height: "56px", minWidth: 0, padding: "4px 0 0", borderRadius: "8px",
        cursor: activa ? "pointer" : "default", border: forma.border, background: forma.background, color: C.texto,
      }}
    >
      {/*
        * La pastilla, centrada y sin relleno lateral. A 320 la casilla mide 85 y,
        * con el contorno de 2 px, deja 81 por dentro: «No va aquí» con su X mide
        * 81,5 con el hueco de 4 del estándar y 80,5 con 3 (medido, Inter 12/700).
        * Por eso aquí el hueco es 3. A 375 sobra (112,5).
        */}
      <span style={{ display: "flex", justifyContent: "center", alignSelf: "stretch", height: "16px", lineHeight: "16px" }}>
        {(estado === "ok" || estado === "mal" || estado === "revelada") && <Pastilla estado={estado} hueco={3} />}
      </span>
      <span data-fichas style={{ display: "flex", flexWrap: "wrap", gap: "4px", paddingLeft: "3px" }}>
        {fichas.map((f) => <Ficha key={f.numero} numero={f.numero} enCurso={f.enCurso} />)}
      </span>
    </button>
  );
}

const ROTULO = { fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 600, color: C.apagado };

/* Un contador: rótulo, total en mono 14, barra de 10 px y, si cambió, la cifra punteada (§6, C3). */
function Contador({ id, rotulo, valor, escala, habria }) {
  const v = useCuenta(valor);
  const parte = (x) => Math.max(0, Math.min(1, escala ? x / escala : 0));
  return (
    <div data-contador={id} style={{ minWidth: 0 }}>
      <p style={{ ...ROTULO, margin: 0 }}>{rotulo}</p>
      <p data-total style={{ ...CIFRA, margin: "2px 0 4px", fontSize: "14px", lineHeight: "18px", color: C.texto }}>{pesos(v)}</p>
      <div style={{ position: "relative", height: "10px", borderRadius: "2px", background: "rgba(248,249,250,0.08)" }}>
        <div className="fae-gp-barra" data-barra style={{
          position: "absolute", inset: 0, borderRadius: "2px", background: C.hecho, transform: `scaleX(${parte(valor)})`,
        }} />
        {habria !== null && (
          <div data-punteada className="fae-gp-aparece" style={{
            position: "absolute", left: 0, top: 0, height: "10px", width: `${parte(habria) * 100}%`, boxSizing: "border-box",
            border: `1px dashed ${C.atenuado}`, borderRadius: "2px",
          }} />
        )}
      </div>
      <p data-cifra-punteada style={{ ...CIFRA, margin: "2px 0 0", fontSize: "12px", lineHeight: "16px", color: C.atenuado, visibility: habria === null ? "hidden" : "visible" }}>
        {habria === null ? " " : pesos(habria)}
      </p>
    </div>
  );
}

/*
 * La matriz con sus contadores. `colocadas` son las fichas que ya cayeron:
 * { numero, casilla, enCurso }. `estados` dice cómo se ve cada casilla.
 */
export function Matriz({ colocadas, estados, activa, onTocar, valores, habria, escala, refMatriz }) {
  const fichasDe = (id) => colocadas.filter((f) => f.casilla === id);
  const conPunteada = habria.gastos !== null || habria.salio !== null;
  const rotuloFila = (texto) => (
    <span aria-hidden="true" style={{ ...ROTULO, display: "flex", alignItems: "center", minWidth: 0 }}>{texto}</span>
  );
  const casilla = (id) => {
    const c = CASILLAS.find((x) => x.id === id);
    return <Casilla key={id} casilla={c} estado={estados[id] ?? "reposo"} fichas={fichasDe(id)} activa={activa} onTocar={onTocar} />;
  };
  return (
    <div data-matriz ref={refMatriz} style={{
      boxSizing: "border-box", padding: "11px", borderRadius: "12px", background: C.panel, border: "1px solid rgba(248,249,250,0.12)",
    }}>
      <div role="group" aria-label="Casillas" style={{ display: "grid", gridTemplateColumns: "56px minmax(0, 1fr) minmax(0, 1fr)", columnGap: "4px", rowGap: "4px" }}>
        <span aria-hidden="true" style={{ height: "36px" }} />
        {[ROTULO_SIN_SALIDA, ROTULO_SALIDA].map((r) => (
          <span key={r} aria-hidden="true" data-rotulo-columna style={{ ...ROTULO, height: "36px", display: "flex", alignItems: "flex-end", justifyContent: "center", textAlign: "center", paddingBottom: "4px", boxSizing: "border-box" }}>{r}</span>
        ))}
        {rotuloFila(ROTULO_GASTO)}
        {casilla("gasto")}
        {casilla("gasto-salida")}
        {rotuloFila(ROTULO_SIN_GASTO)}
        {casilla("ninguno")}
        {casilla("salida")}
      </div>
      <p data-leyenda style={{ ...ROTULO, fontWeight: 400, color: C.atenuado, margin: "8px 0 4px", visibility: conPunteada ? "visible" : "hidden" }}>
        {UI.leyendaPunteada}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: "8px" }}>
        <Contador id="gastos" rotulo={ROTULO_GASTO} valor={valores.gastos} escala={escala} habria={habria.gastos} />
        <Contador id="salio" rotulo={ROTULO_SALIDA} valor={valores.salio} escala={escala} habria={habria.salio} />
      </div>
    </div>
  );
}

export default function GastoOPago({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null, version: fija = null,
}) {
  const intento = useIntento(ACT_GASTO_O_PAGO.id, fija);
  const version = useRef(intento.version);
  const t = useTanda(() => items ?? sortearGastoOPago(barajar, version.current));
  const [jugada, setJugada] = useState(version.current);
  /* La respuesta del hecho en curso: { casilla, r }. */
  const [toque, setToque] = useState(null);
  /* null · «elegida» · «revelada» · «corregida» (§7). */
  const [fase, setFase] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const relojes = useRef([]);
  const boton = useRef(null);
  const ficha = useRef(null);
  const primera = useRef(true);

  const h = t.items[t.i];
  const cuantas = t.items.length;
  const datos = bancoDe(jugada);
  const empresa = h?.empresa ?? datos.empresa;
  const escala = Math.max(escalaDe(jugada), contadores(t.items).gastos, contadores(t.items).salio);
  const pct = puntuarGastoOPago(respuestas, cuantas);

  const limpiar = () => { relojes.current.forEach(clearTimeout); relojes.current = []; };
  useEffect(() => limpiar, []);
  useEffect(() => {
    if (!t.terminado || modoDemo) return;
    onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
    version.current = intento.terminar();
  }, [t.terminado]);
  /*
   * §9, decisión de Kamogawa (#506, 24-oct): el encabezado de Hacer (167 px,
   * compartido) puede quedar fuera de la vista. En cada hecho la vista sube
   * para que la ficha quede arriba: ficha + matriz + contadores (418 px)
   * caben juntos en la ventana. Con movimiento reducido, sin animación.
   */
  const subirALaFicha = () => {
    const el = ficha.current;
    if (!el || modoDemo) return;
    el.scrollIntoView?.({ block: "start", behavior: reducido() ? "auto" : "smooth" });
  };
  /* Al pasar de hecho, el foco va a la ficha (sin que el foco mueva la vista) y la vista sube a ella. */
  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    if (modoDemo) return;
    ficha.current?.focus({ preventScroll: true });
    subirALaFicha();
  }, [t.i]);
  /*
   * El hecho 1: la partida se monta escondida debajo de «Así se juega» y se
   * muestra al tocar «Siguiente», que además pone el foco en la consigna
   * (JuegoConTutorial, compartido). Cuando la partida se vuelve visible (su
   * alto pasa de 0), la vista sube a la ficha, un instante después de ese
   * foco para que no la devuelva a la consigna.
   */
  const raiz = useRef(null);
  useEffect(() => {
    if (modoDemo || typeof ResizeObserver !== "function" || !raiz.current) return undefined;
    let visible = false;
    let reloj = null;
    const ro = new ResizeObserver(([e]) => {
      const ahora = e.contentRect.height > 0;
      if (ahora && !visible && t.i === 0) { clearTimeout(reloj); reloj = setTimeout(subirALaFicha, 60); }
      visible = ahora;
    });
    ro.observe(raiz.current);
    return () => { ro.disconnect(); clearTimeout(reloj); };
  }, []);

  const tocar = (casilla) => {
    if (!h) return;
    if (toque) {
      /* Un toque en la matriz salta al estado final (§8). */
      if (fase !== "corregida" && !toque.r.ok) { limpiar(); setFase("corregida"); }
      return;
    }
    const r = evaluarGastoOPago(h, casilla);
    t.anotar(h.id, r.ok, r.ok ? null : casilla);
    setRespuestas((xs) => [...xs, { id: h.id, ok: r.ok }]);
    setToque({ casilla, r });
    if (r.ok || reducido()) { setFase("corregida"); return; }
    setFase("elegida");
    relojes.current.push(setTimeout(() => setFase((f) => (f === "elegida" ? "revelada" : f)), REVELA_MS));
    relojes.current.push(setTimeout(() => setFase("corregida"), CORRIGE_MS));
  };

  const avanzar = () => {
    limpiar();
    setToque(null); setFase(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    limpiar();
    setJugada(version.current);
    t.reiniciar(); setToque(null); setFase(null); setRespuestas([]);
  };

  /* Las fichas de los hechos anteriores, cada una en su casilla correcta. */
  const hechosAntes = t.items.slice(0, t.terminado ? cuantas : t.i);
  const anteriores = hechosAntes.map((x, k) => ({ numero: k + 1, casilla: x.tipo, enCurso: false }));
  const base = contadores(hechosAntes);

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.ok).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <div className="fae-gp" data-gasto-o-pago data-version={jugada} data-estado-partida="resumen">
          <Matriz colocadas={anteriores} estados={{}} activa={false} onTocar={() => {}} valores={base}
            habria={{ gastos: null, salio: null }} escala={escala} />
          <p data-cierre-texto style={{ margin: "16px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>
            {CIERRE_GASTO_O_PAGO}
          </p>
          <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
            <p style={TEXTO_CIERRE}>
              {bien} de {cuantas} hechos en su casilla. Cada hecho valía {(100 / cuantas).toFixed(2)} %.
            </p>
          </Cierre>
        </div>
      </Marco>
    );
  }

  /* Dónde está la ficha en curso y cómo se ve cada casilla, según la fase. */
  const estados = {};
  let enCurso = null;
  let valores = base;
  const habria = { gastos: null, salio: null };
  if (toque) {
    const { casilla, r } = toque;
    if (r.ok) {
      estados[casilla] = "ok";
      enCurso = casilla;
    } else {
      estados[casilla] = "mal";
      if (fase === "revelada" || fase === "corregida") estados[r.correcta] = "revelada";
      enCurso = fase === "corregida" ? r.correcta : casilla;
      if (fase === "corregida") {
        const suyo = aporteDe(h, casilla);
        const real = aporteDe(h, r.correcta);
        if (suyo.gastos !== real.gastos) habria.gastos = base.gastos + suyo.gastos;
        if (suyo.salio !== real.salio) habria.salio = base.salio + suyo.salio;
      }
    }
    const a = aporteDe(h, enCurso);
    valores = { gastos: base.gastos + a.gastos, salio: base.salio + a.salio };
  }
  const colocadas = enCurso ? [...anteriores, { numero: t.i + 1, casilla: enCurso, enCurso: true }] : anteriores;
  const final = toque ? (() => { const a = aporteDe(h, h.tipo); return { gastos: base.gastos + a.gastos, salio: base.salio + a.salio }; })() : null;
  const ultimo = t.i + 1 === cuantas;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div ref={raiz} className="fae-gp" data-gasto-o-pago data-version={jugada} data-estado-partida={toque ? (toque.r.ok ? "bien" : `mal-${fase}`) : "vacio"}>
        {!modoDemo && (
          <div data-encabezado-hacer>
            <Encabezado consigna={ACT_GASTO_O_PAGO.consigna} onComoSeJuega={onComoSeJuega} />
            <p data-progreso style={{ ...CONTADOR, margin: 0 }}>{UI.contador(t.i + 1, cuantas)}</p>
          </div>
        )}

        {/* La ficha del hecho (§6): la empresa en 12/700 #A8B6C8 y el hecho en Inter 15/22. Sin pie (C5). */}
        <div
          ref={ficha}
          tabIndex={-1}
          data-ficha={h.id}
          style={{
            boxSizing: "border-box", minHeight: "130px", margin: modoDemo ? 0 : "16px 0 0", padding: "14px",
            borderRadius: "12px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)", outline: "none",
          }}
        >
          <p data-empresa style={{ margin: "0 0 6px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 700, color: C.apagado }}>{empresa}</p>
          <p data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{h.texto}</p>
        </div>

        <div style={{ marginTop: "12px" }}>
          <Matriz colocadas={colocadas} estados={estados} activa={!toque || (!toque.r.ok && fase !== "corregida")}
            onTocar={tocar} valores={valores} habria={habria} escala={escala} />
        </div>

        {/* El bloque de mensaje (§7): hasta dos textos separados por 8 px; raya #B8C4D4 o coral. */}
        <div aria-live="polite" data-devolucion={toque ? (toque.r.ok ? "acierto" : "error") : "vacia"}>
          {toque && (
            <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${toque.r.ok ? C.atenuado : C.coral}` }}>
              {toque.r.textos.map((x, k) => (
                <p key={k} data-parrafo-devolucion style={{ margin: k ? "8px 0 0" : 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.texto }}>
                  {k === 0 && <span style={SOLO_LECTOR}>{toque.r.ok ? LECTOR.acierto : LECTOR.error}</span>}
                  {x}
                </p>
              ))}
            </div>
          )}
        </div>
        {/* §8: lo que anuncia el lector, con los contadores ya en su valor correcto. */}
        <p aria-live="polite" style={SOLO_LECTOR}>{final ? UI.anuncio(pesos(final.gastos), pesos(final.salio)) : ""}</p>

        {toque && !modoDemo && (
          <Responder botonRef={boton} onClick={avanzar} etiqueta={ultimo ? UI.verMiResumen : UI.siguiente} datos={{ "data-siguiente": true }}>
            {ultimo ? UI.verMiResumen : UI.siguiente}
          </Responder>
        )}

        {!modoDemo && <p style={SOLO_LECTOR}>{ALT_GASTO_O_PAGO}</p>}
      </div>
    </Marco>
  );
}
