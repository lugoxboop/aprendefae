import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { escucharFP } from "../../fp/aviso.js";
import { crearDisparador } from "../../racha/disparador.js";
import { crearRelojPausable, visibilidadDocumento } from "../../racha/visibilidad.js";
import { pedirMomentoRacha } from "../../racha/datos.js";
import { mensajeRacha, semana } from "../../racha/teseracto.js";
import { mascotaDe } from "../../mascota/mascotas.js";
import Mascota from "../Mascota.jsx";
import Llama from "./Llama.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MOMENTO DE RACHA: el grande, el de una vez al día.
 *
 * 25-nov (Mateo): «que no sea una forma geométrica, sino la mascotica con una
 * animación de fueguito; que la mascota esté feliz porque se mantuvo la
 * racha». El teseracto del plan piloto sale de aquí (sigue vivo en el panel
 * docente, FermiTrabajando); el protagonista es ahora LA MASCOTA DEL
 * ESTUDIANTE —la suya, con su especie, color y accesorios— saltando de
 * contenta delante de una llama grande que chisporrotea.
 *
 *   1. ENTRADA  la llama crece desde abajo, la mascota sube y salta; el número
 *               de la racha muestra el de ayer y, al segundo, salta al de hoy.
 *               Debajo, «Pasaste de racha N−1 a N».
 *   2. SEMANA   todo el bloque sube con transform (sin saltos de maqueta: el
 *               hueco de la tarjeta está reservado desde el principio) y entra
 *               la tarjeta con los siete días, cada uno una llamita.
 *
 * UN TOQUE EN CUALQUIER SITIO, o Escape, lo cierra en cualquier momento. La
 * tarjeta de la semana NO se cierra sola: es la única parte que se lee.
 *
 * Lo que NO cambia: cuándo sale (disparador.js y racha_momento(), migración
 * 0034), la semana que manda el servidor y el reloj que se pausa con la
 * página oculta. Solo cambia lo que se ve.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Los tiempos. La llama tarda 700 ms en crecer; el número cambia cuando ya
 * está arriba (1,3 s), con tiempo para verlo; y la entrada se queda un rato
 * más para que el estudiante vea a su mascota celebrar antes de la tarjeta.
 */
export const TIEMPOS = {
  crecer: 700,
  cambioNumero: 1300,
  entrada: 3400,
  transicion: 700,
  salida: 320,
};

/* Se conserva la firma de antes (la usaban las pruebas): ya no depende del día. */
export const duracionEntrada = () => TIEMPOS.entrada;

const CURVA = "cubic-bezier(.45,.05,.2,1)";
const REBOTE = "cubic-bezier(.34,1.56,.64,1)";
const GRIS = "rgba(248,249,250,0.34)";

const CSS = `
@keyframes fae-mr-aparecer { from { opacity: 0; } to { opacity: 1; } }
@keyframes fae-mr-crecer { 0% { opacity: 0; transform: scale(.15); } 60% { opacity: 1; transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
@keyframes fae-mr-subir { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
@keyframes fae-mr-pop { 0% { opacity: 0; transform: scale(1.9); } 55% { opacity: 1; transform: scale(.92); } 100% { opacity: 1; transform: scale(1); } }
@keyframes fae-mr-halo { 0%, 100% { opacity: .75; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
@keyframes fae-mr-onda { from { opacity: .7; transform: scale(.4); } to { opacity: 0; transform: scale(1.5); } }
.fae-mr-velo { animation: fae-mr-aparecer 380ms ease-out both; }
.fae-mr-llama { transform-origin: 50% 100%; animation: fae-mr-crecer ${TIEMPOS.crecer}ms ${CURVA} both; }
.fae-mr-mascota { animation: fae-mr-subir 620ms ${REBOTE} 260ms both; }
.fae-mr-halo { animation: fae-mr-halo 1.6s ease-in-out infinite; }
.fae-mr-numero { display: inline-block; animation: fae-mr-pop 560ms ${REBOTE} both; }
.fae-mr-onda { animation: fae-mr-onda 800ms ease-out both; }
.fae-mr-texto { animation: fae-mr-subir 520ms ${CURVA} 420ms both; }
@media (prefers-reduced-motion: reduce) {
  .fae-mr-velo, .fae-mr-llama, .fae-mr-mascota, .fae-mr-halo, .fae-mr-numero, .fae-mr-onda, .fae-mr-texto { animation: none !important; }
  .fae-mr-onda { display: none; }
  .fae-mr-bloque, .fae-mr-tarjeta { transition: none !important; }
}
`;

function Dia({ etiqueta, estado }) {
  const lleno = estado === "completado" || estado === "hoy-hecho";
  const hoy = estado === "hoy" || estado === "hoy-hecho";
  return (
    <li data-dia={estado} style={{ listStyle: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: 0 }}>
      <span
        aria-hidden="true"
        style={{
          boxSizing: "border-box", width: "34px", height: "34px", borderRadius: "999px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: lleno ? "rgba(245,138,31,0.16)" : "rgba(248,249,250,0.05)",
          border: hoy ? `2.5px solid ${FAE.ambar}` : "1px solid rgba(248,249,250,0.10)",
          boxShadow: hoy ? "0 0 0 3px rgba(233,196,106,0.16)" : "none",
        }}
      >
        <Llama tamano={17} encendida={lleno} colorApagado={GRIS} id="fae-llama-dia" />
      </span>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11.5px", fontWeight: hoy ? 700 : 600, color: hoy ? FAE.text : "rgba(248,249,250,0.6)" }}>
        {etiqueta}
      </span>
    </li>
  );
}

const NOMBRE_ESTADO = { completado: "completado", "hoy-hecho": "hoy, completado", hoy: "hoy, pendiente", pendiente: "sin actividad" };

/**
 * La secuencia en pantalla. Separada del disparo para poder probarla y verla
 * sin sesión. `perfil` pinta la mascota del estudiante; sin perfil, la de
 * fábrica (mascotaDe).
 */
export function SecuenciaRacha({ momento, perfil = null, onFin, visibilidad = visibilidadDocumento }) {
  const [fase, setFase] = useState("entrada");
  const [numero, setNumero] = useState(momento.desde);
  /*
   * Todas las esperas van por un reloj que se para con la página oculta y
   * retoma al volver: con setTimeout a secas, la secuencia se cerraba sola en
   * una pestaña que nadie estaba mirando.
   */
  const reloj = useRef(null);
  if (!reloj.current) reloj.current = crearRelojPausable(visibilidad);
  const tarjeta = useRef(null);
  const [bajada, setBajada] = useState(0);
  const cerrado = useRef(false);

  const dia = momento.hasta;
  const dias = semana(momento.hoy, momento.semana);
  const m = mascotaDe(perfil);
  const nombre = perfil?.mascota_nombre?.trim();

  const cerrar = () => {
    if (cerrado.current) return;
    cerrado.current = true;
    setFase("salida");
    reloj.current.programar(() => onFin?.(), TIEMPOS.salida);
  };

  useEffect(() => {
    reloj.current.programar(() => setNumero(momento.hasta), TIEMPOS.cambioNumero);
    reloj.current.programar(() => setFase((f) => (f === "entrada" ? "semana" : f)), duracionEntrada(dia));
    const tecla = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") cerrar(); };
    window.addEventListener("keydown", tecla);
    return () => { reloj.current.detener(); window.removeEventListener("keydown", tecla); };
  }, []);

  /*
   * El hueco de la tarjeta está en la maqueta desde el primer cuadro (oculto),
   * así que nada salta cuando aparece. En la entrada, el bloque de arriba baja
   * la mitad de ese hueco para quedar centrado; en la semana vuelve a su sitio
   * con una transición de transform.
   */
  useLayoutEffect(() => {
    if (!tarjeta.current) return;
    setBajada(Math.round((tarjeta.current.offsetHeight + 14) / 2));
  }, []);

  const alto = typeof window === "undefined" ? 667 : window.innerHeight;
  const ancho = typeof window === "undefined" ? 375 : window.innerWidth;
  /* La escena se ajusta al alto: en un 320 × 568 caben escena, número y tarjeta sin cortar la llama. */
  const H = Math.max(120, Math.round(Math.min(ancho * 0.62, (alto - 360) / 1.12, 250)));
  const enSemana = fase !== "entrada";
  const nuevo = numero === momento.hasta && momento.hasta !== momento.desde;

  return (
    <div
      data-momento-racha={fase}
      role="dialog"
      aria-modal="true"
      aria-label={`${mensajeRacha(momento.desde, momento.hasta)}. Toca para cerrar.`}
      onPointerDown={cerrar}
      className="fae-mr-velo"
      style={{
        position: "fixed", inset: 0, zIndex: 90, cursor: "pointer", overflow: "hidden",
        background: "radial-gradient(circle at 50% 34%, rgba(245,138,31,0.20) 0%, rgba(29,53,87,0.94) 38%, rgba(10,20,34,0.97) 72%)",
        opacity: fase === "salida" ? 0 : 1, transition: `opacity ${TIEMPOS.salida}ms ease-in`,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <style>{CSS}</style>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "16px", boxSizing: "border-box", pointerEvents: "none" }}>
        <div
          className="fae-mr-bloque"
          data-heroe-racha
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            transform: `translateY(${enSemana ? 0 : bajada}px)`,
            /* Solo con la semana: si la transición estuviera desde el principio, la
               medida inicial del hueco animaría un descenso al abrir. */
            transition: enSemana ? `transform ${TIEMPOS.transicion}ms ${CURVA}` : "none",
          }}
        >
          {/* La escena: halo, llama grande detrás y la mascota delante, saltando. */}
          <div data-escena-racha style={{ position: "relative", width: `${H}px`, height: `${Math.round(H * 1.12)}px` }}>
            <div
              aria-hidden="true"
              className="fae-mr-halo"
              style={{ position: "absolute", left: "-18%", right: "-18%", top: "-6%", bottom: "4%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,179,71,0.38) 0%, rgba(245,138,31,0.12) 45%, rgba(245,138,31,0) 70%)" }}
            />
            <div className="fae-mr-llama" data-llama-grande style={{ position: "absolute", left: "50%", top: 0, width: `${Math.round(H * 0.86)}px`, marginLeft: `-${Math.round(H * 0.43)}px` }}>
              <Llama tamano={Math.round(H * 0.86)} viva chispas id="fae-llama-grande" />
            </div>
            <div className="fae-mr-mascota" data-mascota-racha style={{ position: "absolute", left: "50%", bottom: 0, width: `${Math.round(H * 0.6)}px`, marginLeft: `-${Math.round(H * 0.3)}px`, filter: "drop-shadow(0 0 3px rgba(10,20,34,0.9)) drop-shadow(0 6px 12px rgba(10,20,34,0.55))" }}>
              <Mascota
                especie={m.especie}
                paleta={m.paleta}
                ojos={m.ojos}
                puestos={m.puestos}
                perfil={perfil}
                tamano={Math.round(H * 0.6)}
                encuadre="cuerpo"
                animo="feliz"
                titulo={nombre ? `${nombre}, tu mascota, salta de contenta` : "Tu mascota salta de contenta"}
              />
            </div>
          </div>

          {/* El número: ayer, y al segundo salta al de hoy. */}
          <div style={{ position: "relative", marginTop: "6px", textAlign: "center" }}>
            <p style={{ position: "relative", margin: 0, lineHeight: 1, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "clamp(52px, 15vw, 72px)", letterSpacing: "-0.03em", color: "#FFD27A", textShadow: "0 0 24px rgba(255,179,71,0.45)" }}>
              {nuevo && <span aria-hidden="true" className="fae-mr-onda" style={{ position: "absolute", left: "50%", top: "50%", width: "76px", height: "76px", margin: "-38px 0 0 -38px", borderRadius: "50%", border: `3px solid ${FAE.ambar}` }} />}
              <span key={numero} data-numero-racha={numero} className={nuevo ? "fae-mr-numero" : undefined}>{numero}</span>
            </p>
            <p style={{ margin: "4px 0 0", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", color: FAE.text }}>
              {numero === 1 ? "día de racha" : "días de racha"}
            </p>
            {/* Fuera del flujo: así no reserva sitio y la tarjeta cabe a 320 × 568. Se va al llegar la semana. */}
            <p aria-live="polite" style={{ position: "absolute", left: "-60px", right: "-60px", top: "100%", margin: "8px 0 0", opacity: enSemana ? 0 : 1, transition: "opacity 300ms ease-out", fontSize: "13.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.7)" }}>
              <span className="fae-mr-texto" style={{ display: "block" }}>{mensajeRacha(momento.desde, momento.hasta)}</span>
            </p>
          </div>
        </div>

        <section
          ref={tarjeta}
          className="fae-mr-tarjeta"
          {...(enSemana ? { "data-semana-racha": "" } : { "aria-hidden": "true" })}
          style={{
            position: "relative", boxSizing: "border-box", width: "100%", maxWidth: "380px",
            padding: "16px 16px 18px", borderRadius: "20px",
            background: "linear-gradient(180deg, rgba(36,62,99,0.92) 0%, rgba(21,41,74,0.96) 100%)",
            border: "1px solid rgba(147,197,253,0.22)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
            visibility: enSemana ? "visible" : "hidden",
            opacity: enSemana ? 1 : 0,
            transform: enSemana ? "none" : "translateY(24px)",
            transition: `opacity 480ms ${CURVA} 220ms, transform 560ms ${CURVA} 180ms`,
          }}
        >
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "18px", lineHeight: 1.25, color: FAE.text }}>
            Tu racha sigue viva.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.72)" }}>
            {nombre ? `${nombre} está feliz` : "Tu mascota está feliz"}: {dia} {dia === 1 ? "día seguido" : "días seguidos"} aprendiendo.
          </p>

          <ol aria-label="Esta semana" style={{ margin: "14px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
            {dias.map((d) => (
              <Dia key={d.fecha} etiqueta={d.etiqueta} estado={d.estado} />
            ))}
          </ol>
          {/* El único cierre de la tarjeta es del estudiante: este botón o un toque en cualquier sitio. */}
          <button
            type="button"
            data-continuar
            tabIndex={enSemana ? 0 : -1}
            onClick={cerrar}
            style={{
              pointerEvents: enSemana ? "auto" : "none", display: "block", width: "100%", marginTop: "16px",
              padding: "13px 18px", borderRadius: "999px", cursor: "pointer",
              background: FAE.teal, border: `1px solid ${FAE.teal}`, color: "#06202A",
              boxShadow: "0 8px 22px rgba(42,157,143,0.35)",
              fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700,
            }}
          >
            Continuar
          </button>

          <p className="fae-jg-oculto" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            {dias.map((d) => `${d.etiqueta}: ${NOMBRE_ESTADO[d.estado]}`).join(". ")}
          </p>
        </section>
      </div>

      {/* La pista se va con la semana: ahí ya está el botón, y a 320 × 568 la tarjeta la tapaba. */}
      <p style={{ position: "absolute", left: 0, right: 0, bottom: "max(14px, env(safe-area-inset-bottom))", margin: 0, textAlign: "center", fontSize: "12px", color: "rgba(248,249,250,0.55)", pointerEvents: "none", opacity: enSemana ? 0 : 1, transition: "opacity 300ms ease-out" }}>
        Toca para cerrar.
      </p>
    </div>
  );
}

/**
 * El disparo y la secuencia juntos, con sus dependencias a la vista: la sesión,
 * la pregunta al servidor, el canal de FP y la visibilidad de la página. Así la
 * prueba monta exactamente lo que monta App, con una pestaña oculta de mentira.
 */
export function MomentoRachaCon({ sesionActiva, perfil = null, pedir, escucharFP: escuchar, visibilidad = visibilidadDocumento, esperaMs }) {
  const [momento, setMomento] = useState(null);
  const disparador = useRef(null);

  useEffect(() => {
    disparador.current = crearDisparador({ pedir, escucharFP: escuchar, alMostrar: setMomento, visibilidad, esperaMs });
    return () => disparador.current.detener();
  }, []);

  useEffect(() => {
    disparador.current?.sesion(Boolean(sesionActiva));
  }, [sesionActiva]);

  if (!momento) return null;
  return <SecuenciaRacha momento={momento} perfil={perfil} visibilidad={visibilidad} onFin={() => setMomento(null)} />;
}

/** Montado una vez en App: escucha, pregunta cuando toca y enseña la secuencia. */
export default function MomentoRacha() {
  const { session, perfil } = useAuth();
  return <MomentoRachaCon sesionActiva={Boolean(session)} perfil={perfil} pedir={pedirMomentoRacha} escucharFP={escucharFP} />;
}
