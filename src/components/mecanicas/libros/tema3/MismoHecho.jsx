import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import {
  ACT3_T3, PARES_ACT3, UI, ESTADO_VACIO, ALT_INICIAL, ALT_ACIERTO, CIERRE_ACT3, revisaCasillas,
} from "../../../../data/contabilidadTema3Act3.js";
import { hojaDe, completo, evaluarPar, puntuarAct3, nombreAccesible, ORDEN_DE_LECTURA } from "../../../../contabilidad/mismoHecho.js";
import { pesos } from "../../../../contabilidad/queLeToca.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 3 · «EL MISMO HECHO, DOS EMPRESAS» (P2 de Xeno con sus
 * reemplazos; inventario por estado de Levi, que manda sobre los dos).
 *
 * Un hecho y dos libros, uno por empresa. En cada libro, dos casillas (Debe y
 * Haber). Al tocar una casilla sube una hoja con las cinco cuentas de esa
 * empresa, en orden alfabético. «Comprobar», un solo intento.
 *
 * Componente nuevo y solo de Contabilidad: no toca nada compartido. Reutiliza
 * sin cambios el encabezado, «¿Cómo se juega?», el avance, el botón de
 * avanzar y el cierre de la act. 6.
 *
 * ═══════════ «COMPROBAR», CON aria-disabled ═══════════
 *
 * Levi: mientras falta una casilla, el botón NO lleva `disabled` —que lo saca
 * del recorrido del teclado y el lector nunca llega a su aria-describedby—
 * sino aria-disabled, y apunta a «Completa las 4 casillas». El `Responder`
 * publicado usa `disabled`, así que aquí va su mismo botón, con los mismos
 * estilos, y la única diferencia es ese atributo. `Responder` no se toca.
 *
 * ═══════════ POR QUÉ NO ES `position: sticky` ═══════════
 *
 * El fondo de la materia lleva `overflow: hidden` y con eso `sticky` no se
 * pega a nada (igual que en «Cerrar el periodo»). «Comprobar» se pinta fijo
 * abajo mientras la actividad está a la vista y su sitio todavía no entra en
 * pantalla; cuando entra, se queda en él.
 *
 * Coral solo en el error. Teal y ámbar solo en el Debe y el Haber.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CORAL = FAE.coral; // #E76F51
/* El texto del error, ligado al coral (Xeno; Levi). */
export const CORAL_TEXTO = "#F4A592";
export const FONDO_TARJETA = "#294061";
const FONDO_PRESIONADA = "#304666";
const TEAL_RAYA = FAE.teal; // #2A9D8F, el borde del Debe
const TEAL_TEXTO = "#52C4B0"; // el rótulo «Debe»
const AMBAR = FAE.ambar; // #E9C46A
const CURVA = "cubic-bezier(.2,.8,.2,1)";
const ALTO_COMPROBAR = 80;

const CSS = `
.fae-a3 button { -webkit-tap-highlight-color: transparent; }
.fae-a3 [data-casilla]:focus-visible, .fae-a3-hoja button:focus-visible, .fae-a3 [data-titulo-panel]:focus-visible, .fae-a3 [data-tarjeta-hecho]:focus-visible { outline: 2px solid ${COLOR.neutro}; outline-offset: 2px; }
.fae-a3-hoja [data-opcion]:active { background: ${FONDO_PRESIONADA} !important; }
@keyframes fae-a3-llena { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes fae-a3-estado { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes fae-a3-panel { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes fae-a3-sube { from { transform: translateY(100%); } to { transform: none; } }
@keyframes fae-a3-baja { from { transform: none; } to { transform: translateY(100%); } }
@keyframes fae-a3-velo { from { opacity: 0; } to { opacity: 1; } }
@keyframes fae-a3-velo-fuera { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .fae-a3 *, .fae-a3-hoja, .fae-a3-hoja * { animation: none !important; transition: none !important; } }
`;

const leerReducido = () => {
  try { return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
};

/* «Comprobar» fijo abajo mientras su sitio no entra en pantalla (ver la cabecera). */
function useFijo(contenedor, hueco, activo) {
  const [fijo, setFijo] = useState(null);
  useEffect(() => {
    if (!activo || typeof IntersectionObserver === "undefined") { setFijo(null); return undefined; }
    const c = contenedor.current;
    const h = hueco.current;
    if (!c || !h) return undefined;
    const vis = { capa: false, hueco: false };
    const medir = () => {
      const r = h.getBoundingClientRect();
      const abajo = r.top > (globalThis.innerHeight ?? 0);
      setFijo(vis.capa && !vis.hueco && abajo ? { left: r.left, width: r.width } : null);
    };
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.target === c) vis.capa = e.isIntersecting;
        if (e.target === h) vis.hueco = e.isIntersecting && e.intersectionRatio >= 0.99;
      }
      medir();
    }, { threshold: [0, 0.99, 1] });
    io.observe(c);
    io.observe(h);
    globalThis.addEventListener?.("resize", medir);
    return () => { io.disconnect(); globalThis.removeEventListener?.("resize", medir); };
  }, [contenedor, hueco, activo]);
  return fijo;
}

/* ═══════════ LA CASILLA ═══════════ */
function Casilla({ empresa, lado, cuenta, monto, estado, correcta, abierta, evaluado, retraso, reducido, onTocar, refBoton }) {
  const color = lado === "debe" ? TEAL_RAYA : AMBAR;
  const error = estado === "error";
  const bien = estado === "bien";
  const borde = abierta ? `3px solid ${COLOR.blanco}`
    : error ? `2px solid ${CORAL}`
    : cuenta ? `2px solid ${color}`
    : `2px dashed ${COLOR.quieto}`;
  const animEstado = evaluado && !reducido ? `fae-a3-estado 160ms ${CURVA} ${retraso}ms both` : undefined;
  const etiqueta = nombreAccesible({
    empresa: empresa.nombre, lado, cuenta, monto: pesos(monto),
    error: error ? { elegida: cuenta, correcta } : null,
  });
  return (
    <button
      ref={refBoton}
      type="button"
      data-casilla={`${empresa.indice}:${lado}`}
      data-estado-casilla={estado ?? (cuenta ? "llena" : "vacia")}
      aria-haspopup="dialog"
      aria-label={etiqueta}
      aria-disabled={evaluado ? "true" : undefined}
      onClick={() => { if (!evaluado) onTocar(); }}
      style={{
        flex: "1 1 0", minWidth: 0, minHeight: "72px", boxSizing: "border-box", padding: "10px 8px",
        display: "flex", flexDirection: "column", alignItems: "stretch", gap: "4px", textAlign: "left",
        borderRadius: "12px", border: borde, background: "transparent", color: COLOR.blanco,
        cursor: evaluado ? "default" : "pointer", touchAction: "manipulation",
      }}
    >
      {bien && (
        <span data-marca-bien style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 600, color: COLOR.blanco, animation: animEstado }}>
          <Check size={16} color={COLOR.blanco} strokeWidth={2.5} aria-hidden="true" />{UI.bien}
        </span>
      )}
      {error && (
        <span data-marca-error style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 600, color: CORAL_TEXTO, animation: animEstado }}>
          <X size={16} color={CORAL_TEXTO} strokeWidth={2.5} aria-hidden="true" />{UI.revisa}
        </span>
      )}
      {cuenta ? (
        <span key={cuenta} data-nombre-cuenta style={{
          fontFamily: INTER, fontSize: "14px", lineHeight: "20px", fontWeight: 600, overflowWrap: "normal", wordBreak: "normal", hyphens: "manual",
          color: error ? COLOR.apagado : COLOR.blanco, animation: !evaluado && !reducido ? `fae-a3-llena 160ms ${CURVA} both` : undefined,
        }}>{cuenta}</span>
      ) : (
        <span data-elige style={{ fontFamily: INTER, fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: COLOR.apagado }}>{UI.eligeLaCuenta}</span>
      )}
      {error && (
        <>
          <span data-va style={{ fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 600, color: CORAL_TEXTO, animation: animEstado }}>{UI.va}</span>
          <span data-correcta style={{ fontFamily: INTER, fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: COLOR.blanco, animation: animEstado }}>{correcta}</span>
        </>
      )}
      {/* La fila del monto: solo la cifra (Xeno). Sin «Monto:» y sin chevrón: con ellos no cabía en 97 px a 320. */}
      <span data-monto-casilla style={{ marginTop: "auto", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 500, color: COLOR.apagado, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {pesos(monto)}
      </span>
    </button>
  );
}

/* ═══════════ EL LIBRO DE UNA EMPRESA ═══════════ */
function Libro({ empresa, eleccion, monto, r, abierta, reducido, onTocar, refs, id }) {
  const evaluado = Boolean(r);
  const estadoDe = (lado) => {
    if (!r) return null;
    const c = r.casillas.find((x) => x.empresa === empresa.indice && x.lado === lado);
    return c.ok ? "bien" : "error";
  };
  const retrasoDe = (lado) => ORDEN_DE_LECTURA.findIndex(([e, l]) => e === empresa.indice && l === lado) * 60;
  return (
    <section id={id} data-libro={empresa.indice} aria-label={empresa.nombre} style={{
      padding: "8px", borderRadius: "16px", background: FONDO_TARJETA, boxSizing: "border-box",
    }}>
      <p data-empresa style={{ margin: 0, fontFamily: SORA, fontSize: "15px", lineHeight: "22px", fontWeight: 700, color: COLOR.blanco }}>{empresa.nombre}</p>
      <div aria-hidden="true" style={{ display: "flex", gap: "8px", margin: "6px 0 6px" }}>
        <span style={{ flex: "1 1 0", minWidth: 0, fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 600, color: TEAL_TEXTO }}>{UI.debe}</span>
        <span style={{ flex: "1 1 0", minWidth: 0, fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 600, color: AMBAR, textAlign: "right" }}>{UI.haber}</span>
      </div>
      <div data-casillas style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
        {["debe", "haber"].map((lado) => (
          <Casilla key={lado} empresa={empresa} lado={lado} cuenta={eleccion[lado]} monto={monto}
            estado={estadoDe(lado)} correcta={empresa[lado]} evaluado={evaluado} retraso={retrasoDe(lado)} reducido={reducido}
            abierta={abierta === lado} onTocar={() => onTocar(lado)} refBoton={(el) => { refs.current[`${empresa.indice}:${lado}`] = el; }} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════ LA HOJA DE OPCIONES ═══════════ */
function Hoja({ empresa, lado, opciones, actual, enLaOtra, onElegir, onCancelar, cerrando, modoDemo, reducido }) {
  const caja = useRef(null);
  const idTitulo = useId();
  const otroLado = lado === "debe" ? "haber" : "debe";

  /* El foco entra en la hoja (en la cuenta puesta, o en la primera) y queda atrapado. */
  useEffect(() => {
    if (modoDemo) return;
    const botones = [...(caja.current?.querySelectorAll("button") ?? [])];
    const puesta = caja.current?.querySelector('[aria-checked="true"]');
    (puesta ?? botones[0])?.focus({ preventScroll: true });
  }, []);
  const teclas = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onCancelar(); return; }
    if (e.key !== "Tab") return;
    const botones = [...caja.current.querySelectorAll("button")];
    const k = botones.indexOf(document.activeElement);
    if (e.shiftKey && k <= 0) { e.preventDefault(); botones.at(-1).focus(); }
    else if (!e.shiftKey && k === botones.length - 1) { e.preventDefault(); botones[0].focus(); }
  };

  const titulo = (
    <h3 id={idTitulo} data-titulo-hoja style={{ margin: "0 0 12px", fontFamily: SORA, fontSize: "15px", lineHeight: "22px", fontWeight: 700, color: COLOR.blanco }}>
      {empresa.nombre} · <span style={{ color: lado === "debe" ? TEAL_TEXTO : AMBAR }}>{lado === "debe" ? UI.debe : UI.haber}</span>
    </h3>
  );
  const animHoja = reducido || modoDemo ? undefined : cerrando ? `fae-a3-baja 160ms ${CURVA} both` : `fae-a3-sube 320ms ${CURVA} both`;
  const animVelo = reducido || modoDemo ? undefined : cerrando ? `fae-a3-velo-fuera 160ms ${CURVA} both` : `fae-a3-velo 320ms ${CURVA} both`;

  const hoja = (
    <div
      ref={caja}
      role="dialog"
      aria-modal={modoDemo ? undefined : "true"}
      aria-labelledby={idTitulo}
      data-hoja={`${empresa.indice}:${lado}`}
      onKeyDown={teclas}
      className="fae-a3-hoja"
      style={{
        ...(modoDemo ? { position: "relative", marginTop: "10px", borderRadius: "20px" } : {
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 61, maxHeight: "90vh", overflowY: "auto",
          borderRadius: "20px 20px 0 0",
        }),
        boxSizing: "border-box", background: COLOR.navy, padding: "10px 16px calc(16px + env(safe-area-inset-bottom, 0px))",
        animation: animHoja,
      }}
    >
      <div aria-hidden="true" style={{ width: "36px", height: "4px", borderRadius: "999px", background: COLOR.quieto, margin: "0 auto 12px" }} />
      {titulo}
      <div role="radiogroup" aria-labelledby={idTitulo} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {opciones.map((o) => {
          const elegida = o === actual;
          const enOtra = o === enLaOtra;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={elegida ? "true" : "false"}
              data-opcion={o}
              onClick={() => onElegir(o)}
              style={{
                minHeight: "56px", width: "100%", boxSizing: "border-box", padding: "8px 16px", borderRadius: "12px",
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", textAlign: "left",
                background: FONDO_TARJETA, border: elegida ? `2px solid ${COLOR.neutro}` : "2px solid transparent",
                color: COLOR.blanco, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", fontWeight: 600, cursor: "pointer",
              }}
            >
              <span>{o}</span>
              {elegida && <span data-elegida style={{ fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 400, color: COLOR.apagado }}>{UI.elegida}</span>}
              {!elegida && enOtra && (
                <span data-en-la-otra style={{ fontFamily: INTER, fontSize: "13px", lineHeight: "18px", fontWeight: 400, color: COLOR.apagado }}>
                  {otroLado === "debe" ? UI.estaEnElDebe : UI.estaEnElHaber}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button type="button" data-cancelar onClick={onCancelar} style={{
        marginTop: "12px", width: "100%", minHeight: "56px", borderRadius: "999px", cursor: "pointer",
        background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: COLOR.blanco,
        fontFamily: SORA, fontSize: "14px", fontWeight: 600,
      }}>{UI.cancelar}</button>
    </div>
  );

  if (modoDemo) return hoja;
  return createPortal(
    <>
      <div data-velo aria-hidden="true" onClick={onCancelar} style={{
        position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,16,30,.60)", animation: animVelo,
      }} />
      {hoja}
    </>,
    document.body,
  );
}

/* «Comprobar»: el botón de siempre, con aria-disabled en vez de disabled (ver la cabecera). */
function Comprobar({ listo, onClick, idPista }) {
  return (
    <button
      type="button"
      data-comprobar
      aria-disabled={listo ? undefined : "true"}
      aria-describedby={listo ? undefined : idPista}
      onClick={() => { if (listo) onClick(); }}
      style={{
        marginTop: "14px", width: "100%", padding: "13px 18px", borderRadius: "999px", minHeight: "48px",
        cursor: listo ? "pointer" : "default",
        background: listo ? FAE.teal : "rgba(248,249,250,0.07)",
        border: "none", color: listo ? "#06202A" : COLOR.apagado,
        fontFamily: SORA, fontSize: "14px", fontWeight: 700,
      }}
    >
      {UI.comprobar}
    </button>
  );
}

const vacias = () => [{ debe: null, haber: null }, { debe: null, haber: null }];

export default function MismoHecho({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? PARES_ACT3);
  const [elecciones, setElecciones] = useState(vacias);
  const [abierta, setAbierta] = useState(null); /* { empresa, lado } */
  const [cerrando, setCerrando] = useState(false);
  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [colocada, setColocada] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [reducido] = useState(leerReducido);
  const refsCasilla = useRef({});
  const tituloPanel = useRef(null);
  const capa = useRef(null);
  const hueco = useRef(null);
  const tarjeta = useRef(null);
  const primeraVez = useRef(true);
  const idPista = useId();
  const idAlt = useId();
  const idLibro = useId();

  const par = t.items[t.i];
  const cuantos = t.items.length;
  const pct = puntuarAct3(respuestas, cuantos);
  const empresas = par.empresas.map((e, k) => ({ ...e, indice: k }));
  const listo = completo(elecciones);
  const fijo = useFijo(capa, hueco, !r && !modoDemo);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  /* Al cambiar de par, el foco pasa a la tarjeta del hecho. */
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (!modoDemo) tarjeta.current?.focus({ preventScroll: false });
  }, [t.i]);

  const cerrarHoja = (devolverFoco = true) => {
    const k = abierta && `${abierta.empresa}:${abierta.lado}`;
    const fin = () => {
      setAbierta(null);
      setCerrando(false);
      if (devolverFoco && !modoDemo && k) refsCasilla.current[k]?.focus({ preventScroll: true });
    };
    if (reducido || modoDemo) { fin(); return; }
    setCerrando(true);
    setTimeout(fin, 160);
  };

  const elegir = (cuenta) => {
    const { empresa: e, lado } = abierta;
    const otro = lado === "debe" ? "haber" : "debe";
    setElecciones((xs) => xs.map((x, k) => {
      if (k !== e) return x;
      /* Un nombre no puede estar en las dos casillas del mismo libro: se mueve. */
      return { ...x, [lado]: cuenta, [otro]: x[otro] === cuenta ? null : x[otro] };
    }));
    setColocada(true);
    setAnuncio(`${cuenta} en el ${lado === "debe" ? UI.debe : UI.haber} de ${par.empresas[e].nombre}`);
    cerrarHoja(true);
  };

  const comprobar = () => {
    if (!listo || r) return;
    const nuevo = evaluarPar(par, elecciones);
    t.anotar(par.id, nuevo.ok, nuevo.ok ? null : nuevo.caso);
    setRespuestas((xs) => [...xs, { id: par.id, ok: nuevo.ok }]);
    setR(nuevo);
    setAnuncio(nuevo.ok ? ALT_ACIERTO : "");
  };

  /* Tras comprobar: con error, sube hasta el libro del primer error; sin error, al panel. El foco va al título del panel. */
  useLayoutEffect(() => {
    if (!r || modoDemo) return;
    const primera = r.casillas.find((c) => !c.ok);
    const destino = primera ? document.getElementById(`${idLibro}-${primera.empresa}`) : tituloPanel.current;
    const y = destino ? destino.getBoundingClientRect().top + (globalThis.scrollY ?? 0) - 16 : null;
    tituloPanel.current?.focus({ preventScroll: true });
    if (y !== null) {
      try { globalThis.scrollTo?.({ top: y, behavior: reducido ? "auto" : "smooth" }); } catch { /* sin ventana */ }
    }
  }, [r]);

  const avanzar = () => {
    setR(null); setElecciones(vacias()); setColocada(false); setAnuncio("");
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); setR(null); setElecciones(vacias()); setColocada(false); setRespuestas([]); setAnuncio(""); };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.ok).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantos} al primer intento. Cada par valía {(100 / cuantos).toFixed(2)} %.
          </p>
          <p data-cierre-texto style={TEXTO_CIERRE}>{CIERRE_ACT3}</p>
        </Cierre>
      </Marco>
    );
  }

  const opciones = abierta ? hojaDe(par.empresas[abierta.empresa]) : [];
  const eleccionAbierta = abierta ? elecciones[abierta.empresa] : null;
  const libro = (e) => (
    <Libro key={`${par.id}-${e.indice}`} id={`${idLibro}-${e.indice}`} empresa={e} eleccion={elecciones[e.indice]} monto={par.monto} r={r}
      abierta={abierta?.empresa === e.indice ? abierta.lado : null} reducido={reducido} refs={refsCasilla}
      onTocar={(lado) => setAbierta({ empresa: e.indice, lado })} />
  );

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div ref={capa} className="fae-a3" data-act3>
        {!modoDemo && (
          <>
            <Encabezado consigna={ACT3_T3.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Par" />
            </div>
          </>
        )}

        {/* La tarjeta del hecho. No dice si es acumulado o diferido: delataría la respuesta. */}
        <div ref={tarjeta} tabIndex={-1} data-tarjeta-hecho={par.id} style={{
          margin: "0 0 12px", padding: "16px", borderRadius: "16px", background: FONDO_TARJETA, outline: "none",
        }}>
          {par.titulo && <p data-titulo-par style={{ margin: "0 0 6px", fontFamily: SORA, fontSize: "17px", lineHeight: "24px", fontWeight: 700, color: COLOR.blanco }}>{par.titulo}</p>}
          <p data-hecho style={{ margin: "0 0 8px", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{par.hecho}</p>
          <p data-monto style={{ margin: 0, fontFamily: SORA, fontSize: "20px", lineHeight: "28px", fontWeight: 700, color: COLOR.blanco, fontVariantNumeric: "tabular-nums" }}>
            {UI.monto} {pesos(par.monto)}
          </p>
          {par.pie && <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado }}>{par.pie}</p>}
        </div>

        {/* Los dos libros. El alternativo inicial describe esta zona, no la pantalla entera. */}
        <div data-libros aria-describedby={idAlt} role="group" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p id={idAlt} style={SOLO_LECTOR}>{ALT_INICIAL}</p>
          {libro(empresas[0])}
          {abierta?.empresa === 0 && modoDemo && (
            <Hoja empresa={empresas[0]} lado={abierta.lado} opciones={opciones} actual={eleccionAbierta[abierta.lado]}
              enLaOtra={eleccionAbierta[abierta.lado === "debe" ? "haber" : "debe"]} onElegir={elegir} onCancelar={() => cerrarHoja(true)}
              cerrando={cerrando} modoDemo reducido={reducido} />
          )}
          {!colocada && (
            <p data-estado-vacio style={{ margin: 0, textAlign: "center", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: COLOR.apagado }}>{ESTADO_VACIO}</p>
          )}
          {libro(empresas[1])}
          {abierta?.empresa === 1 && modoDemo && (
            <Hoja empresa={empresas[1]} lado={abierta.lado} opciones={opciones} actual={eleccionAbierta[abierta.lado]}
              enLaOtra={eleccionAbierta[abierta.lado === "debe" ? "haber" : "debe"]} onElegir={elegir} onCancelar={() => cerrarHoja(true)}
              cerrando={cerrando} modoDemo reducido={reducido} />
          )}
        </div>

        {/* «Comprobar», fijo abajo hasta que su sitio entra en pantalla; debajo, por qué no avanza. */}
        {!r && (
          <div ref={hueco} data-comprobar-caja style={{ minHeight: modoDemo ? undefined : `${ALTO_COMPROBAR}px` }}>
            <div style={fijo ? {
              position: "fixed", bottom: 0, left: `${fijo.left}px`, width: `${fijo.width}px`, zIndex: 20,
              padding: "0 0 12px", background: `linear-gradient(to bottom, transparent, ${FAE.bg} 30%)`,
            } : { padding: "0 0 12px" }}>
              <Comprobar listo={listo} onClick={comprobar} idPista={idPista} />
              <p id={idPista} data-pista style={{
                margin: "6px 0 0", textAlign: "center", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: COLOR.apagado,
                ...(listo ? SOLO_LECTOR : {}),
              }}>
                {listo ? "" : UI.completa}
              </p>
            </div>
          </div>
        )}

        {/* El panel del resultado. */}
        {r && (
          <div data-panel={r.ok ? "acierto" : "error"} data-caso={r.caso ?? "acierto"} style={{
            marginTop: "14px", padding: "14px 14px 14px 16px", borderRadius: "16px", background: FONDO_TARJETA,
            borderLeft: `4px solid ${r.ok ? COLOR.neutro : CORAL}`,
            animation: reducido || modoDemo ? undefined : `fae-a3-panel 320ms ${CURVA} both`,
          }}>
            <h3 ref={tituloPanel} tabIndex={-1} data-titulo-panel style={{
              margin: "0 0 8px", display: "flex", alignItems: "center", gap: "6px", outline: "none",
              fontFamily: SORA, fontSize: "15px", lineHeight: "22px", fontWeight: 700, color: COLOR.blanco,
            }}>
              {r.ok
                ? <><Check size={20} color={COLOR.blanco} strokeWidth={2.5} aria-hidden="true" />{UI.correcto}</>
                : <><X size={20} color={CORAL_TEXTO} strokeWidth={2.5} aria-hidden="true" />{revisaCasillas(r.malas)}</>}
            </h3>
            {r.lineas.map((x) => (
              <p key={x} data-linea-casilla style={{ margin: "0 0 4px", fontFamily: INTER, fontSize: "14px", lineHeight: "20px", color: COLOR.blanco }}>{x}</p>
            ))}
            {r.textos.map((x) => (
              <p key={x} data-texto-retro style={{ margin: "6px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{x}</p>
            ))}
          </div>
        )}

        {/* Lo que se anuncia: cada cuenta puesta y, al acertar, el alternativo de acierto. */}
        <p aria-live="polite" data-anuncio style={SOLO_LECTOR}>{anuncio}</p>
      </div>

      {r && !modoDemo && (
        <Responder onClick={avanzar}>{t.i + 1 === cuantos ? UI.verResumen : UI.siguientePar}</Responder>
      )}

      {abierta && !modoDemo && (
        <Hoja empresa={empresas[abierta.empresa]} lado={abierta.lado} opciones={opciones} actual={eleccionAbierta[abierta.lado]}
          enLaOtra={eleccionAbierta[abierta.lado === "debe" ? "haber" : "debe"]} onElegir={elegir} onCancelar={() => cerrarHoja(true)}
          cerrando={cerrando} reducido={reducido} />
      )}
    </Marco>
  );
}
