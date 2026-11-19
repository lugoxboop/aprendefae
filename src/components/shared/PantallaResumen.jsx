import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Children } from "react";
import { FAE } from "../../theme.js";
import FiguraFacetada, { TAMANO as TAMANO_FIGURA } from "./FiguraFacetada.jsx";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import EstrellasActividad from "../opinion/EstrellasActividad.jsx";
import MascotaFestejo from "./MascotaFestejo.jsx";
import { escucharFP } from "../../fp/aviso.js";
import { conTransicion } from "../../estilo/movimiento.js";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { nombreDeActividad } from "../../data/subjects.js";
import {
  usaPantallaResumen, resumenDe, formatoDe, partidaValida, decidir, anunciarPartida,
  ROTULO_BIEN, ROTULO_PUNTOS, ROTULO_RESULTADO, NOTA_REPETICION,
  BOTON_VOLVER, BOTON_REPETIR, NOTA_REPETIR,
} from "../../hacer/pantallaResumen.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE RESUMEN — el componente compartido.
 *
 * Cuando el interruptor de la materia está encendido, ocupa el sitio del
 * recuadro de resultado (`Cierre`, en corazon/juego.jsx, o el cierre propio
 * de una mecánica envuelto en `CierreConResumen`) y el aviso de FP no sale.
 * La celebración de siempre se queda: esta pantalla espera a que acabe.
 *
 * SOLO MUESTRA. Los puntos y la repetición son los del aviso de FP —el mismo
 * valor que «+N FP» y la misma marca que «Ya completada»—; «bien a la
 * primera» se cuenta sobre el detalle con el mismo filtro con que el servidor
 * lo guarda. Si algo no es un número que se pueda enseñar, sale el cierre de
 * siempre (ver la salvaguarda en hacer/pantallaResumen.js). Aquí no se
 * escribe nada.
 *
 * Sin trofeos, coronas, cofres, gemas ni confeti; sin coral. Las cifras van en
 * blanco: ni verde azulado ni ámbar. El texto atenuado es #A8B6C8.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ATENUADO = "#A8B6C8";
const BLANCO = FAE.text;
const SORA = "Sora, sans-serif";
const SOLO_LECTOR = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};
const DURACION_CONTEO = 700;

/*
 * ═══════════ DÓNDE SE QUEDA LA FIGURA ═══════════
 *
 * Siempre en un hueco propio de 48 px, a la derecha: no comparte espacio con
 * ningún texto, así que no puede bajar el contraste de nada (Xeno).
 *
 *   "titulo"  a la derecha del título. Es lo que va.
 *   "cifras"  como tercera columna de la fila de cifras, tal cual la pide
 *             Xeno. A 375 px esa fila mide 275 px y las dos tarjetas la
 *             llenan: el hueco se lo quita a ellas (de 132 a ~102 px cada
 *             una) y «5 de 5», «100 %» y «Bien a la primera:» pasan a dos
 *             renglones. Queda a una línea por si Levi la prefiere.
 */
export const POSICION_FIGURA = "titulo";

/* ═══════════ EL CONTEXTO QUE PONE CADA VISTA ═══════════ */

/*
 * `activa` en falso —o ningún proveedor, que es lo mismo— deja `Cierre`
 * exactamente como era. Es lo que ven Macroeconomía y cualquier vista que no
 * haya conectado la pantalla.
 */
export const ContextoResumen = createContext({ activa: false });

export const useContextoResumen = () => useContext(ContextoResumen);

/**
 * Para una vista: guarda la partida que se acaba de cerrar y lo que el servidor
 * devolvió al registrarla.
 *
 *   const resumen = useResumenDePartida(MATERIA, celebrando);
 *   const r = await resumen.registrar({ actividadId, clasificacion, pct, detalle },
 *                                     () => registrarActividadCompletada(...));
 *   <ContextoResumen.Provider value={resumen.contexto(juego.id, volver)}>…
 *
 * Con el interruptor apagado, `registrar` llama a la función y devuelve lo
 * mismo que ella, sin nada antes ni después, y `contexto` dice `activa: false`.
 */
export function useResumenDePartida(materiaId, celebrando = false) {
  const [partida, setPartida] = useState(null);
  const contador = useRef(0);
  const auth = useAuthOpcional();
  const conCuenta = Boolean(auth?.usuario);

  const registrar = useCallback(async ({ actividadId, clasificacion, pct, detalle }, registrarEnServidor) => {
    if (!usaPantallaResumen(materiaId, actividadId)) return registrarEnServidor();
    contador.current += 1;
    const id = contador.current;
    const base = { id, actividadId, clasificacion, formato: formatoDe(actividadId, clasificacion), pct, detalle, conCuenta };

    /* Lo que ya se sabe antes de registrar: si no vale, cierre de siempre desde ya. */
    const previa = partidaValida(base);
    if (!previa.valida) {
      setPartida({ ...base, registro: null, aviso: null, listo: true, valida: false, motivo: previa.motivo });
      return registrarEnServidor();
    }

    setPartida({ ...base, registro: null, aviso: null, listo: false });
    /* El aviso de FP pregunta por esta partida mientras se registra (ver anunciarPartida). */
    const soltar = anunciarPartida(actividadId, base);
    let aviso = null;
    const dejarDeEscuchar = escucharFP((d) => { if (d?.actividadId === actividadId) aviso = d; });
    let resultado = null;
    try {
      resultado = await registrarEnServidor();
      return resultado;
    } finally {
      dejarDeEscuchar();
      soltar();
      /* La misma decisión que tomó el aviso, con el mismo aviso. */
      const decision = decidir({ ...base, aviso });
      setPartida((p) => (p && p.id === id
        ? { ...p, registro: resultado?.registro ?? null, aviso, listo: true, valida: decision.valida, motivo: decision.motivo }
        : p));
    }
  }, [materiaId, conCuenta]);

  const limpiar = useCallback(() => setPartida(null), []);

  const contexto = (actividadId, onVolver) => ({
    activa: usaPantallaResumen(materiaId, actividadId),
    /* Para las estrellas de opinión: con qué actividad y de qué materia. */
    materiaId,
    partida: partida && partida.actividadId === actividadId ? partida : null,
    celebrando,
    limpiar,
    /* Salir de la actividad aleja la pantalla (sistema de movimiento: «cierra»). */
    onVolver: () => conTransicion(() => { limpiar(); onVolver?.(); }, "cierra"),
  });

  return { registrar, limpiar, contexto };
}

/** ¿La partida cae al cierre de siempre? Solo cuando ya se decidió que no vale. */
export const caeAlCierreDeSiempre = (ctx) => Boolean(ctx?.partida?.listo && ctx.partida.valida === false);

/*
 * ═══════════ EL CIERRE, CON O SIN PANTALLA ═══════════
 *
 * Envuelve el cierre de siempre de una actividad. Sin contexto activo lo deja
 * tal cual —el mismo marcado, nada alrededor—. Con el contexto activo pinta la
 * pantalla de resumen, salvo que la salvaguarda diga que no: entonces vuelve
 * el cierre de siempre, sin cambios.
 *
 * El cierre propio nunca pierde nada (regla de Levi):
 *
 *   texto      un cierre que es solo un texto corto: ese texto va dentro del
 *              recuadro de la pantalla.
 *   completo   un cierre que trae más (listas, diagnóstico por ítem): se
 *              enseña entero, tal cual, y la pantalla va debajo, sin recuadro
 *              —su texto ya está arriba—.
 *
 * Y UNA SOLA CIFRA DE RESULTADO (regla de Levi): si el cierre propio ya
 * enseña su resultado —siempre con `completo`; con `texto`, cuando el texto
 * lo dice (`conResultado`)—, la pantalla no enseña ningún porcentaje ni
 * «X de N»: solo los puntos.
 *
 * Al desmontarse (la actividad vuelve a empezar, o se sale) olvida la partida,
 * para que la siguiente no herede la decisión de esta.
 */
function useOlvidarAlSalir(ctx) {
  const limpiar = useRef(null);
  limpiar.current = ctx.activa ? ctx.limpiar : null;
  useEffect(() => () => { limpiar.current?.(); }, []);
}

export function CierreConResumen({ texto = null, completo = false, conResultado = false, onReiniciar = null, children }) {
  const ctx = useContextoResumen();
  const cierrePropio = useRef(null);
  useOlvidarAlSalir(ctx);
  if (!ctx.activa || caeAlCierreDeSiempre(ctx)) return children;
  if (!completo) return <PantallaResumen texto={texto} onRepetir={onReiniciar} sinResultado={conResultado} />;
  return (
    <div ref={cierrePropio} data-cierre-propio style={{ scrollMarginTop: "88px" }}>
      {children}
      <PantallaResumen sinRecuadro sinResultado desplazarA={cierrePropio} onRepetir={onReiniciar} />
    </div>
  );
}

/**
 * Lo mismo que `completo`, para un cierre propio repartido por la actividad
 * (Explica la política: el resultado en el panel, el detalle frase por frase
 * y su botón debajo). Se pone al final de ese cierre; `desplazarA` es el
 * comienzo del cierre, adonde se lleva la vista.
 */
export function ResumenDebajo({ onReiniciar = null, desplazarA = null }) {
  const ctx = useContextoResumen();
  useOlvidarAlSalir(ctx);
  if (!ctx.activa || caeAlCierreDeSiempre(ctx)) return null;
  return <PantallaResumen sinRecuadro sinResultado desplazarA={desplazarA} onRepetir={onReiniciar} />;
}

/* ═══════════ LAS CIFRAS QUE CUENTAN DESDE 0 ═══════════ */

function movimientoReducido() {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
}

/*
 * La cifra cuenta desde 0 hasta su valor, pero NUNCA se queda a medio camino.
 * Si el navegador no avanza la animación —pestaña en segundo plano, una
 * lectura de la página sin pintarla—, la tarjeta se quedaba en 0 mientras la
 * línea del lector ya decía el valor real: así se vio «0 %» en un Diagnóstico
 * en vivo de 90 %. Ahora:
 *   · con la pestaña oculta, sale directamente el valor final
 *   · y un reloj de respaldo pone el valor final al acabar el conteo, avance
 *     o no la animación.
 */
const pestanaOculta = () => {
  try { return document.visibilityState === "hidden"; } catch { return false; }
};

function useConteo(objetivo) {
  const [valor, setValor] = useState(() => (movimientoReducido() || pestanaOculta() ? objetivo : 0));
  useEffect(() => {
    if (movimientoReducido() || pestanaOculta() || objetivo <= 0) { setValor(objetivo); return undefined; }
    let marco = null;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, Math.max(0, (ahora - inicio) / DURACION_CONTEO));
      /* Frena al final: el último número se lee quieto. */
      setValor(Math.round(objetivo * (1 - (1 - t) ** 3)));
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    const respaldo = setTimeout(() => { cancelAnimationFrame(marco); setValor(objetivo); }, DURACION_CONTEO + 100);
    return () => { cancelAnimationFrame(marco); clearTimeout(respaldo); };
  }, [objetivo]);
  return valor;
}

/* Cada cifra es una tarjeta con fondo sólido (≥92 % de opacidad). */
export const FONDO_TARJETA = "rgba(14,27,46,0.94)";

function Cifra({ rotulo, children, dato, centrada = false, nota = null }) {
  return (
    <div data-cifra={dato} style={{ position: "relative", flex: "1 1 0", minWidth: 0, textAlign: centrada ? "center" : "left" }}>
      <div
        data-tarjeta
        className="fae-rs-ficha"
        style={{
          height: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: "16px",
          background: FONDO_TARJETA, border: "1px solid rgba(134,224,195,0.22)",
        }}
      >
      <p className="fae-rs-ceja" style={{ margin: "0 0 6px", color: ATENUADO }}>{rotulo}</p>
      <p
        data-valor
        style={{
          margin: 0, fontFamily: SORA, fontSize: "36px", fontWeight: 700, lineHeight: 1.05,
          color: BLANCO, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", whiteSpace: "nowrap",
        }}
      >
        {children}
      </p>
      {nota}
      </div>
    </div>
  );
}

/*
 * ═══════════ EL ESTILO DEL REDISEÑO (19-nov) ═══════════
 *
 * La misma familia que el banner del Repaso Diario, el ranking y el panel
 * docente: tarjeta de cristal con luz de tono arriba, cejilla en mayúsculas
 * espaciadas, fichas con filo de luz, pastillas, y el botón principal lleno
 * con su flecha. El tono es la menta del «terminaste» (#86E0C3 de texto,
 * teal solo en formas: el teal nunca es color de texto).
 */
export const CSS_RESUMEN = `
.fae-rs { position: relative; overflow: hidden; scroll-margin-top: 88px; margin-top: 18px; border-radius: 22px;
  background: linear-gradient(170deg, rgba(42,157,143,0.20) 0%, rgba(20,38,58,0.92) 34%, rgba(12,23,40,0.96) 100%);
  border: 1px solid rgba(134,224,195,0.30);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 48px -28px rgba(42,157,143,0.65); }
.fae-rs--sin-recuadro { margin-top: 22px; }
.fae-rs-luz { position: absolute; left: 50%; top: -120px; width: 520px; height: 360px; transform: translateX(-50%); pointer-events: none;
  background: radial-gradient(closest-side, rgba(134,224,195,0.26), rgba(134,224,195,0.06) 60%, transparent); }
.fae-rs-rayos { position: absolute; left: 50%; top: 40px; width: 560px; height: 560px; margin-left: -280px; pointer-events: none; opacity: .5;
  background: repeating-conic-gradient(from 0deg, rgba(248,249,250,0.05) 0deg 6deg, transparent 6deg 22deg);
  -webkit-mask-image: radial-gradient(closest-side, #000 20%, transparent 72%); mask-image: radial-gradient(closest-side, #000 20%, transparent 72%);
  animation: fae-rs-girar 40s linear infinite; }
@keyframes fae-rs-girar { to { transform: rotate(360deg); } }
.fae-rs-escena { position: relative; padding: 22px 16px 4px; }
.fae-rs-cuerpo { position: relative; z-index: 1; display: grid; gap: 16px; padding: 4px 18px 20px; }
.fae-rs-ceja { font-family: Sora, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.3; }
.fae-rs-pastillas { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.fae-rs-pastilla { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 999px; max-width: 100%; box-sizing: border-box;
  background: rgba(134,224,195,0.10); border: 1px solid rgba(134,224,195,0.32); font-size: 12px; font-weight: 600; line-height: 1.4; color: rgba(248,249,250,0.92); }
.fae-rs-ficha { position: relative; overflow: hidden; }
.fae-rs-ficha::before { content: ""; position: absolute; top: 0; left: 14%; right: 14%; height: 1px; background: linear-gradient(90deg, transparent, rgba(134,224,195,0.75), transparent); }
.fae-rs-mensaje { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 16px; font-size: 14px; line-height: 1.55; color: #F8F9FA;
  background: rgba(14,27,46,0.55); border: 1px solid rgba(134,224,195,0.20); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); }
.fae-rs-mensaje p { margin: 0; }
.fae-rs-icono { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 10px; color: #0E1B2E;
  background: linear-gradient(145deg, #86E0C3, #2A9D8F); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 14px -6px rgba(42,157,143,0.9); }
.fae-rs-volver { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(180deg, #4FC3AE 0%, #2A9D8F 100%); border: 1px solid #2A9D8F;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 14px 28px -14px rgba(42,157,143,1);
  transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 220ms ease, filter 180ms ease; }
.fae-rs-volver svg { transition: transform 320ms cubic-bezier(0.34,1.56,0.64,1); }
.fae-rs-volver:hover { transform: translateY(-2px); filter: brightness(1.05); }
.fae-rs-volver:hover svg { transform: translateX(4px); }
.fae-rs-volver:focus-visible, .fae-rs-repetir:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 3px; }
.fae-rs-repetir { display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: background 180ms ease, border-color 180ms ease; }
.fae-rs-repetir:hover { background: rgba(248,249,250,0.06) !important; border-color: rgba(248,249,250,0.5) !important; }
.fae-rs-entra { animation: fae-rs-entra 520ms cubic-bezier(0.2,0.8,0.2,1) both; }
@keyframes fae-rs-entra { from { opacity: 0; transform: translateY(10px); } }
@media (prefers-reduced-motion: reduce) { .fae-rs, .fae-rs * { animation: none !important; transition: none !important; } }
`;

function FiguraBien({ bien, n }) {
  const x = useConteo(bien);
  /* «de N» debajo y más chico: el número que importa es el de aciertos, y así no se parte a 320 px. */
  return <>{x}<span style={{ display: "block", marginTop: "4px", fontSize: "15px", fontWeight: 600, letterSpacing: 0, color: "rgba(248,249,250,0.72)" }}> de {n}</span></>;
}

function FiguraPorcentaje({ p }) {
  const x = useConteo(p);
  return <>{x}<span style={{ fontSize: "22px", fontWeight: 600, color: "rgba(248,249,250,0.72)" }}> %</span></>;
}

function FiguraPuntos({ fp }) {
  return <>{useConteo(fp)}</>;
}

/* ═══════════ LA PANTALLA ═══════════ */

/**
 * La pinta `Cierre` cuando el contexto está activo. `texto` es el texto de
 * cierre propio de la actividad (lo que antes iba dentro del recuadro) y
 * `onRepetir`, el reinicio de la actividad.
 */
export default function PantallaResumen({ texto = null, onRepetir = null, sinRecuadro = false, desplazarA = null, sinResultado = false }) {
  const ctx = useContextoResumen();
  const titulo = useRef(null);
  const caja = useRef(null);
  const partida = ctx.partida;
  const visible = Boolean(partida && partida.listo && partida.valida && !ctx.celebrando);

  useEffect(() => {
    if (!visible) return;
    /* Con el cierre propio encima, se lleva la vista a su comienzo: se lee de arriba abajo. */
    const destino = desplazarA?.current ?? caja.current;
    try { destino?.scrollIntoView?.({ block: "start", behavior: movimientoReducido() ? "auto" : "smooth" }); } catch { /* sin scroll */ }
    titulo.current?.focus?.({ preventScroll: true });
  }, [visible]);

  /* Mientras suena la celebración, nada: la pantalla llega cuando termina. */
  if (!partida || ctx.celebrando) return null;
  if (!partida.listo) {
    return (
      <p data-resumen-esperando role="status" style={{ margin: "18px 0 0", fontSize: "13px", color: ATENUADO }}>
        Guardando el resultado…
      </p>
    );
  }

  const r = resumenDe(partida);
  const conTexto = Children.toArray(texto).length > 0;

  /*
   * El hueco de la figura: solo existe cuando hay figura (nunca en la
   * repetición), mide lo que ella y no lleva texto. La figura crece, pulsa y
   * se queda en reposo: no se desmonta.
   */
  const figura = r.figura ? (
    <span
      data-hueco-figura
      aria-hidden="true"
      style={{ flex: "none", alignSelf: "center", width: `${TAMANO_FIGURA}px`, height: `${TAMANO_FIGURA}px`, pointerEvents: "none" }}
    >
      <FiguraFacetada key={partida.id} nivel={r.figura} />
    </span>
  ) : null;

  const notaRepeticion = r.repeticion ? (
    <p data-nota-repeticion style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: 1.4, color: ATENUADO }}>
      {NOTA_REPETICION}
    </p>
  ) : null;

  const nombre = nombreDeActividad(partida.actividadId);

  return (
    <section
      ref={caja}
      data-pantalla-resumen
      data-franja={r.exploratoria ? "exploratoria" : r.franja}
      data-repeticion={r.repeticion ? "si" : "no"}
      aria-labelledby="fae-resumen-titulo"
      className={`fae-rs${sinRecuadro ? " fae-rs--sin-recuadro" : ""}`}
    >
      <style>{CSS_RESUMEN}</style>
      <span className="fae-rs-luz" aria-hidden="true" />
      <span className="fae-rs-rayos" aria-hidden="true" />
      <p role="status" data-lector style={SOLO_LECTOR}>{sinResultado ? r.lectorSoloPuntos : r.lector}</p>

      {/*
        * La mascota del estudiante festeja que terminó (pedido de Mateo,
        * 19-nov): en grande y arriba, en su escenario con luz y rayos. Siempre
        * feliz; con un resultado bajo solo cambia la frase (MascotaFestejo.jsx).
        */}
      <div className="fae-rs-escena">
        <MascotaFestejo key={partida.id} franja={r.exploratoria ? null : r.franja} tamano={168} />
      </div>

      <div className="fae-rs-cuerpo">
      <div className="fae-rs-entra">
        <p className="fae-rs-ceja" style={{ margin: "0 0 6px", color: "#86E0C3" }}>
          {r.repeticion ? "Repetición terminada" : "Actividad completada"}
        </p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h3
          id="fae-resumen-titulo"
          ref={titulo}
          tabIndex={-1}
          style={{ flex: "1 1 0", minWidth: 0, margin: 0, fontFamily: SORA, fontSize: "clamp(22px, 5.6vw, 26px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: BLANCO, outline: "none" }}
        >
          {r.titulo}
        </h3>
        {POSICION_FIGURA === "titulo" && figura}
      </div>
      {nombre && (
        <div className="fae-rs-pastillas">
          <span className="fae-rs-pastilla" data-pastilla-actividad>{nombre}</span>
        </div>
      )}
      </div>

      <div aria-hidden="true" style={{ display: "flex", alignItems: "stretch", gap: "12px" }}>
        {/* Una sola cifra de resultado: si ya la enseña el cierre propio, aquí no va. */}
        {!r.exploratoria && !sinResultado && (r.conteo ? (
          <Cifra rotulo={ROTULO_BIEN} dato="bien"><FiguraBien bien={r.conteo.bien} n={r.conteo.n} /></Cifra>
        ) : (
          <Cifra rotulo={ROTULO_RESULTADO} dato="resultado"><FiguraPorcentaje p={r.porcentaje} /></Cifra>
        ))}
        <Cifra
          rotulo={ROTULO_PUNTOS}
          dato="puntos"
          centrada={r.exploratoria}
          nota={notaRepeticion}
        >
          <FiguraPuntos fp={r.fp} />
        </Cifra>
        {POSICION_FIGURA === "cifras" && figura}
      </div>

      {!sinRecuadro && (
        <div data-recuadro className="fae-rs-mensaje">
          <span className="fae-rs-icono" aria-hidden="true"><Sparkles size={16} strokeWidth={2.2} /></span>
          <div style={{ minWidth: 0, flex: "1 1 0" }}>
            {conTexto ? texto : <p style={{ margin: 0 }}>{r.mensaje}</p>}
          </div>
        </div>
      )}

      {/*
        * Las estrellas van ENCIMA de los botones y debajo de las cifras: se
        * ven al leer el resultado de arriba abajo, y no se cruzan con la
        * salida. No son un paso: quien no quiera, pulsa «Volver».
        *
        * No salen en la repetición. A la segunda vuelta la actividad ya no se
        * está estrenando —y quien repite suele venir a subir el puntaje, no a
        * juzgarla—, así que preguntarle otra vez es justo la saturación que
        * Mateo pidió evitar.
        */}
      {!r.repeticion && partida.actividadId && (
        <EstrellasActividad actividadId={partida.actividadId} materiaId={ctx.materiaId} />
      )}

      <div style={{ display: "grid", gap: "10px", marginTop: "4px" }}>
        <button
          type="button"
          data-volver
          className="fae-rs-volver"
          onClick={ctx.onVolver}
          style={{
            /*
             * 44 px, y medían 43 y 41. Los dos cierran TODA actividad que use
             * esta pantalla, así que el defecto se multiplicaba por el
             * catálogo entero; lo reportaron dos células por separado —C a 39
             * y E «menos de 44»— y las dos tenían razón: el botón que yo había
             * arreglado a las 11:48 era el de `Cierre`, no estos.
             *
             * Ocupan el ancho entero de una rejilla con hueco, así que crecer
             * uno o tres píxeles no mueve nada de lado.
             */
            width: "100%", minHeight: "44px", padding: "14px 22px", borderRadius: "14px", cursor: "pointer",
            color: "#06202A", fontFamily: SORA, fontSize: "15px", fontWeight: 700,
          }}
        >
          {BOTON_VOLVER}
          <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
        {onRepetir && (
          <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
            <button
              type="button"
              data-repetir
              className="fae-rs-repetir"
              onClick={() => { ctx.limpiar?.(); onRepetir(); }}
              style={{
                width: "100%", minHeight: "44px", padding: "12px 18px", borderRadius: "14px", cursor: "pointer",
                background: "rgba(248,249,250,0.03)", border: "1px solid rgba(248,249,250,0.28)", color: BLANCO,
                fontFamily: SORA, fontSize: "14px", fontWeight: 600,
              }}
            >
              <RotateCcw size={15} strokeWidth={2.2} aria-hidden="true" />
              {BOTON_REPETIR}
            </button>
            <p data-nota-repetir style={{ margin: 0, fontSize: "12.5px", color: ATENUADO }}>{NOTA_REPETIR}</p>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
