import { useState } from "react";
import { FAE } from "../../theme.js";
import { ACTIVIDADES_TRANSVERSALES, nombreDeTema } from "../../data/subjects.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { rachaVigente, proximoHito, HITOS } from "../../fp/racha.js";
import { useRepaso } from "../../repaso/useRepaso.js";
import { ID_REPASO, ITEMS_POR_REPASO } from "../../repaso/repaso.js";
import { MallaAnimada, NAVY_CLARO } from "../backgrounds/MeshGradientBackground.jsx";
import IconoRacha from "../shared/IconoRacha.jsx";

/* La ficha del Repaso, de donde salen su nombre y sus FP base. */
const REPASO = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === ID_REPASO);

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANNER DEL REPASO DIARIO — cerrado enseña estado, abierto enseña el día.
 *
 * No es un tema más, así que no tiene forma de tema: es una franja de ancho
 * completo. Lo que cambió respecto a la versión anterior:
 *
 *   · Se ve el ESTADO sin entrar —pendiente, listo o bloqueado— porque la
 *     pregunta que el estudiante trae al índice es «¿ya lo hice hoy?».
 *   · Se EXPANDE EN SITIO, con el mismo patrón que la tarjeta partida de
 *     Aprender/Hacer: no navega, cambia de estado donde está.
 *   · DESAPARECIÓ la pantalla intermedia de las tres puertas. Su botón vive
 *     ahora en esta expansión, y el dibujo de las puertas se borró del repo.
 *
 * ═══════════ UN SOLO ICONO, Y CASI SIEMPRE QUIETO ═══════════
 *
 * Antes había dos —un reloj y la llama— y el reloj se fue: dos iconos en una
 * franja compiten y ninguno significa nada. Queda el fuego, que sí dice algo:
 * la racha.
 *
 * Y está QUIETO en el banner cerrado. Es ambiente que el estudiante ve cada
 * vez que entra al índice; una llama animada de forma permanente le disputa la
 * atención a los temas, que es lo que de verdad hay que mirar ahí. Solo se
 * anima en un sitio: dentro de la expansión, cuando el repaso ya está hecho.
 * Ahí es un momento, no un decorado.
 *
 * ═══════════ EL REDISEÑO DEL 18-NOV: QUÉ ESTÁ EN JUEGO ═══════════
 *
 * Mateo lo vio plano. La referencia fueron las apps de hábito que mejor
 * retienen (Duolingo, y el estudio de Mobbin sobre 859 diseños de racha:
 * «las rachas tratan de no perder»). De ahí salen tres cambios:
 *
 *   · La llama vive en una MEDALLA con un anillo que se llena hacia el
 *     próximo bono de racha (3, 7, 14, 30). El estudiante ve cuánto le falta
 *     sin abrir nada: eso es lo que hace volver mañana.
 *   · El banner cerrado ya dice qué cuesta: «10 ítems · hasta 60 FP». La
 *     pregunta «¿me da tiempo ahora?» se contesta sin tocar.
 *   · Abierto, los temas son pastillas, las cifras son fichas y el botón es
 *     uno solo, grande. Una sola acción posible, imposible de no ver.
 *
 * La llama del banner cerrado sigue QUIETA; lo nuevo que se mueve (el realce
 * al pasar el puntero) se apaga con reducir movimiento.
 *
 * ═══════════ NUNCA SE ESCONDE ═══════════
 *
 * Bloqueado se ve atenuado, con su condición de desbloqueo escrita. Es la
 * misma regla del split Aprender/Hacer y de la Tienda: lo que todavía no está
 * disponible se enseña apagado, nunca se oculta. Esconderlo haría que el
 * Repaso apareciera un día de la nada, sin que nadie supiera que existía.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUBTITULO_REPASO = "Repasa lo que ya viste, mezclado entre todos los temas.";

/* Las manchas del banner: en px porque la franja es baja y un vmax la desbordaría. */
export const MANCHAS_BANNER = [
  { color: FAE.teal, tamano: "340px", izquierda: "-22%", arriba: "-110%", desenfoque: "56px", opacidad: 0.78, keyframes: "fae-mesh-a", duracion: "22s" },
  { color: NAVY_CLARO, tamano: "380px", izquierda: "38%", arriba: "-90%", desenfoque: "64px", opacidad: 0.7, keyframes: "fae-mesh-c", duracion: "27s" },
  { color: FAE.teal, tamano: "240px", izquierda: "8%", arriba: "10%", desenfoque: "52px", opacidad: 0.42, keyframes: "fae-mesh-b", duracion: "31s" },
];

/* El gris del fuego apagado. No es un color nuevo: es el de las miniaturas de forma. */
export const GRIS_APAGADO = "#7A8798";

/* El ámbar de la marca en rgb, para los halos: el coral se reserva al brillo del fuego. */
const AMBAR_RGB = "233, 196, 106";
const TEAL_RGB = "42, 157, 143";

const CSS = `
/*
 * ═══════════ LA CABECERA APILA EN EL TELÉFONO ═══════════
 *
 * En una sola fila —medalla, texto, chip, botón— a 375 px el título se parte
 * en tres líneas. Medido. Así que en estrecho va en dos filas: arriba la
 * medalla y el texto con todo el ancho, abajo el chip y el botón. Desde 620 px
 * cabe la fila única. El chip y el botón nunca encogen; lo que cede es el texto.
 */
.fae-repaso__cabecera {
  display: grid;
  align-items: center;
  column-gap: 16px;
  row-gap: 12px;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "llama texto texto" "estado estado flecha";
}
.fae-repaso__llama { grid-area: llama; }
.fae-repaso__texto { grid-area: texto; min-width: 0; }
.fae-repaso__estado { grid-area: estado; justify-self: start; }
.fae-repaso__flecha { grid-area: flecha; justify-self: end; }
@media (min-width: 620px) {
  .fae-repaso__cabecera {
    grid-template-columns: auto 1fr auto auto;
    grid-template-areas: "llama texto estado flecha";
  }
  .fae-repaso__estado { justify-self: end; }
}

.fae-repaso {
  transition: border-color 180ms ease, box-shadow 220ms ease, transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 14px 34px -18px rgba(${TEAL_RGB}, 0.55), inset 0 1px 0 rgba(248, 249, 250, 0.10);
}
.fae-repaso--activo:hover {
  border-color: rgba(${TEAL_RGB}, 0.85);
  box-shadow: 0 18px 40px -16px rgba(${TEAL_RGB}, 0.7), inset 0 1px 0 rgba(248, 249, 250, 0.14);
  transform: translateY(-1px);
}
.fae-repaso__cabecera:focus-visible { outline: 2px solid ${FAE.teal}; outline-offset: -4px; border-radius: 18px; }

/*
 * La expansión, con el patrón de la tarjeta partida: una rejilla de una fila
 * que pasa de 0fr a 1fr. Animar grid-template-rows —en vez de max-height con un
 * número inventado— hace que la altura final la ponga el contenido.
 */
.fae-repaso__caja { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1); }
.fae-repaso__caja--abierta { grid-template-rows: 1fr; }
.fae-repaso__interior { overflow: hidden; min-height: 0; }

/* El botón redondo de la derecha: gira al abrir y se rellena al pasar. */
.fae-repaso__flecha {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 999px; flex-shrink: 0;
  border: 1px solid rgba(248, 249, 250, 0.22);
  background: rgba(248, 249, 250, 0.06);
  transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1), background 180ms ease, border-color 180ms ease;
}
.fae-repaso--activo:hover .fae-repaso__flecha { background: ${FAE.teal}; border-color: ${FAE.teal}; color: ${FAE.bg}; }
.fae-repaso__flecha--abierta { transform: rotate(90deg); }

/* Las fichas de cifras: tres en fila desde 520 px, apiladas en el teléfono. */
.fae-repaso__fichas { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; width: 100%; }
.fae-repaso__ficha--racha { grid-column: 1 / -1; }
@media (min-width: 560px) {
  .fae-repaso__fichas { grid-template-columns: 1fr 1fr 1.6fr; }
  .fae-repaso__ficha--racha { grid-column: auto; }
}

/* El botón de empezar: lleno, ancho en el teléfono, con su flecha. */
.fae-repaso__empezar {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
  box-shadow: 0 10px 24px -10px rgba(${TEAL_RGB}, 0.9);
}
.fae-repaso__empezar::after { content: "→"; font-size: 17px; transition: transform 180ms ease; }
.fae-repaso__empezar:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 14px 28px -10px rgba(${TEAL_RGB}, 1); }
.fae-repaso__empezar:hover::after { transform: translateX(3px); }
.fae-repaso__empezar:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 3px; }
@media (min-width: 560px) { .fae-repaso__empezar { width: auto; } }

/*
 * ═══════════ LA LLAMA DEL REPASO CUMPLIDO ═══════════
 *
 * Dos ciclos de duración DISTINTA a propósito —3,5 s la flotación y 2,8 s el
 * brillo— para que no coincidan nunca en el mismo punto. Con la misma duración
 * el movimiento se lee como un reloj; desfasados, como algo que respira.
 */
@keyframes fae-repaso-flota {
  from { transform: translateY(0); }
  to   { transform: translateY(-3px); }
}
@keyframes fae-repaso-brilla {
  from { filter: drop-shadow(0 0 4px rgba(231, 111, 81, 0.25)); }
  to   { filter: drop-shadow(0 0 10px rgba(231, 111, 81, 0.5)); }
}
.fae-repaso__llama-viva {
  display: inline-block;
  animation:
    fae-repaso-flota 3.5s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate,
    fae-repaso-brilla 2.8s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}

@media (prefers-reduced-motion: reduce) {
  .fae-repaso, .fae-repaso__caja, .fae-repaso__flecha, .fae-repaso__empezar, .fae-repaso__empezar::after { transition: none; }
  .fae-repaso--activo:hover, .fae-repaso__empezar:hover { transform: none; }
  /* Quieta en su posición de base, sin halo: la información es la misma. */
  .fae-repaso__llama-viva { animation: none; filter: none; transform: none; }
}
`;

/** El fuego de la racha. Sin racha no lleva número: un «0» junto a una llama se lee como fracaso. */
export function LlamaRacha({ racha, tamano = 26, viva = false }) {
  const encendida = racha >= 1;
  return (
    <span
      data-llama={encendida ? "encendida" : "apagada"}
      style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
    >
      <span className={viva ? "fae-repaso__llama-viva" : undefined}>
        <IconoRacha tamano={tamano} encendida={encendida} colorApagado={GRIS_APAGADO} />
      </span>
      {encendida && (
        <span
          data-racha-numero
          style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", color: FAE.coral, fontVariantNumeric: "tabular-nums" }}
        >
          {racha}
        </span>
      )}
    </span>
  );
}

/*
 * Cuánto va del camino hacia el próximo bono, de 0 a 1. Se mide desde el hito
 * anterior —de 3 a 7, no de 0 a 7— para que el anillo se vacíe al cobrar un
 * bono y vuelva a llenarse: ver el anillo moverse cada día es el punto.
 */
export function avanceHaciaHito(racha) {
  const hito = proximoHito(racha);
  if (hito === null) return 1;
  const desde = [...HITOS].reverse().find((h) => h <= racha) ?? 0;
  return Math.max(0, Math.min(1, (racha - desde) / (hito - desde)));
}

/** La frase del próximo bono. Sin racha invita; con racha cuenta hacia atrás. */
export function copiaHito(racha) {
  const hito = proximoHito(racha);
  if (hito === null) return `${racha} días seguidos. Racha legendaria.`;
  const faltan = hito - racha;
  if (racha === 0) return `Primer bono de racha a los ${hito} días`;
  return faltan === 1 ? `Mañana llegas al bono de ${hito} días` : `Faltan ${faltan} días para el bono de ${hito}`;
}

/*
 * La medalla: la llama al centro y, alrededor, el anillo hacia el próximo
 * bono. El número de la racha cuelga abajo, como en los marcos de medalla.
 * Apagada (sin racha o bloqueado) es solo el aro gris: nada que celebrar aún.
 */
function Medalla({ racha, tamano = 60, viva = false }) {
  const encendida = racha >= 1;
  const r = tamano / 2 - 3;
  const largo = 2 * Math.PI * r;
  const avance = encendida ? avanceHaciaHito(racha) : 0;
  return (
    <span data-medalla data-llama={encendida ? "encendida" : "apagada"} style={{ position: "relative", display: "inline-flex", width: tamano, height: tamano, flexShrink: 0, alignItems: "center", justifyContent: "center" }}>
      {/* El halo de detrás: ámbar con racha, apenas un velo sin ella. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, borderRadius: "999px",
          background: encendida
            ? `radial-gradient(circle at 50% 60%, rgba(${AMBAR_RGB}, 0.30) 0%, rgba(${AMBAR_RGB}, 0.08) 55%, rgba(14,27,46,0.55) 100%)`
            : `radial-gradient(circle at 50% 55%, rgba(${TEAL_RGB},0.22) 0%, rgba(14,27,46,0.5) 100%)`,
          boxShadow: encendida ? `0 0 22px -4px rgba(${AMBAR_RGB}, 0.45)` : "none",
        }}
      />
      <svg aria-hidden="true" width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="fae-repaso-anillo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={FAE.ambar} />
            <stop offset="100%" stopColor={FAE.coral} />
          </linearGradient>
        </defs>
        <circle cx={tamano / 2} cy={tamano / 2} r={r} fill="none" stroke="rgba(248,249,250,0.14)" strokeWidth="3" />
        {avance > 0 && (
          <circle
            data-anillo={avance.toFixed(2)}
            cx={tamano / 2} cy={tamano / 2} r={r} fill="none"
            stroke="url(#fae-repaso-anillo)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${largo * avance} ${largo}`}
          />
        )}
      </svg>
      <span className={viva ? "fae-repaso__llama-viva" : undefined} style={{ position: "relative" }}>
        <IconoRacha tamano={Math.round(tamano * 0.46)} encendida={encendida} colorApagado={GRIS_APAGADO} />
      </span>
      {/* El número, en su pastilla colgada del aro. Sin racha no hay pastilla: nunca un cero. */}
      {encendida && (
        <span
          data-racha-numero
          style={{
            position: "absolute", left: "50%", bottom: "-8px", transform: "translateX(-50%)",
            minWidth: "24px", boxSizing: "border-box", textAlign: "center",
            padding: "1px 7px", borderRadius: "999px",
            background: FAE.bg, border: `1.5px solid ${FAE.ambar}`,
            fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", lineHeight: "16px",
            color: FAE.ambar, fontVariantNumeric: "tabular-nums",
          }}
        >
          {racha}
        </span>
      )}
    </span>
  );
}

/** El chip de estado del banner cerrado. */
function Chip({ hecho }) {
  return (
    <span
      data-chip={hecho ? "listo" : "pendiente"}
      style={{
        display: "inline-flex", alignItems: "center", gap: "7px", flexShrink: 0,
        fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700,
        letterSpacing: "0.04em", padding: "6px 12px", borderRadius: "999px",
        whiteSpace: "nowrap",
        background: hecho ? FAE.teal : FAE.ambar,
        color: FAE.bg,
        boxShadow: hecho ? `0 6px 16px -8px rgba(${TEAL_RGB}, 0.9)` : `0 6px 16px -8px rgba(${AMBAR_RGB}, 0.9)`,
      }}
    >
      {hecho
        ? <span aria-hidden="true">✓</span>
        : <span aria-hidden="true" style={{ width: "6px", height: "6px", borderRadius: "999px", background: FAE.bg, opacity: 0.75 }} />}
      {hecho ? "Listo hoy" : "Pendiente hoy"}
    </span>
  );
}

/** Una pastilla de dato en la cabecera: pequeña, translúcida, que no compite con el título. */
function Dato({ children, ...resto }) {
  return (
    <span
      {...resto}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "3px 9px", borderRadius: "999px",
        background: "rgba(14,27,46,0.38)", border: "1px solid rgba(248,249,250,0.12)",
        fontSize: "12px", fontWeight: 600, lineHeight: 1.4, color: "rgba(248,249,250,0.9)",
        maxWidth: "100%", boxSizing: "border-box",
      }}
    >
      {children}
    </span>
  );
}

/** El texto del bloqueo, según por qué está bloqueado. */
export function copiaBloqueo(estado, faltan) {
  if (estado === "pocas-actividades") {
    return faltan === 1
      ? "Te falta 1 actividad para desbloquearlo"
      : `Te faltan ${faltan} actividades para desbloquearlo`;
  }
  return "Completa más actividades para desbloquearlo";
}

/* La llama de agua de fondo: la misma silueta, enorme y casi invisible. Da profundidad sin un icono más. */
function MarcaDeAgua() {
  return (
    <span aria-hidden="true" style={{ position: "absolute", right: "-26px", top: "-34px", zIndex: 0, opacity: 0.07, transform: "rotate(14deg)", pointerEvents: "none" }}>
      <IconoRacha tamano={150} encendida={false} colorApagado={FAE.text} />
    </span>
  );
}

/*
 * `repaso` es inyectable por la misma razón que `onGuardar` en el selector de
 * avatar y `onComprar` en la Tienda: los tres estados del banner dependen de lo
 * que diga la base, y una prueba tiene que poder ponerlos sin una base. En
 * producción nadie lo pasa y manda el hook.
 */
export default function BannerRepaso({ actividad, onEmpezar, repaso = null }) {
  const { perfil } = useAuth();
  /* El repaso de ESTA tarjeta: el de Macro o el de Contabilidad, según `actividad`. */
  const delHook = useRepaso(actividad?.id);
  const [abierto, setAbierto] = useState(false);

  const { cargando, error, estado, previa, faltan, racha } = {
    ...delHook,
    racha: rachaVigente(perfil),
    ...(repaso ?? {}),
  };
  const bloqueado = estado === "pocas-actividades" || estado === "pool-corto";
  const hecho = estado === "hecho-hoy";
  /* Mientras carga se ve activo y cerrado: la franja no salta de forma al llegar el dato. */
  const activo = !bloqueado;
  const fpBase = actividad.clasificacion?.fpBase ?? REPASO.clasificacion.fpBase;

  const alternar = () => { if (activo) setAbierto((v) => !v); };

  const marco = {
    position: "relative", overflow: "hidden", isolation: "isolate",
    width: "100%", boxSizing: "border-box",
    borderRadius: "20px",
    border: `1px solid ${activo ? (hecho ? `rgba(${TEAL_RGB},0.6)` : `rgba(${TEAL_RGB},0.45)`) : "rgba(248,249,250,0.14)"}`,
    background: FAE.navy,
    color: FAE.text,
    /* Bloqueado: plano y atenuado. Sin degradado y sin manchas. */
    opacity: activo ? 1 : 0.55,
  };

  const relleno = "clamp(16px, 2.4vh, 22px) clamp(16px, 3vw, 24px)";

  return (
    <div data-banner={actividad.id} data-estado={bloqueado ? "bloqueado" : hecho ? "hecho" : "pendiente"} className={`fae-repaso ${activo ? "fae-repaso--activo" : ""}`} style={marco}>
      <style>{CSS}</style>

      {activo && (
        <>
          <MallaAnimada manchas={MANCHAS_BANNER} fija={false} fondo={`linear-gradient(100deg, ${FAE.teal}55 0%, ${FAE.navy} 58%, ${FAE.bg} 100%)`} />
          {/* Velo hacia la derecha: el texto blanco necesita base aunque pase una mancha teal. */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(14,27,46,0.05) 0%, rgba(14,27,46,0.42) 100%)" }} />
          {/* El brillo del canto superior: la franja se lee como pieza, no como recuadro. */}
          <div aria-hidden="true" style={{ position: "absolute", left: "8%", right: "8%", top: 0, height: "1px", zIndex: 0, background: `linear-gradient(90deg, transparent, rgba(${AMBAR_RGB},0.55), transparent)` }} />
          <MarcaDeAgua />
        </>
      )}

      {/* ── la cabecera, siempre visible ── */}
      {activo ? (
        <button
          type="button"
          className="fae-repaso__cabecera"
          onClick={alternar}
          aria-expanded={abierto}
          aria-label={`${actividad.nombre}. ${SUBTITULO_REPASO}`}
          style={{
            position: "relative", zIndex: 1,
            width: "100%", boxSizing: "border-box", textAlign: "left", cursor: "pointer",
            padding: relleno,
            background: "transparent", border: "none", color: "inherit", font: "inherit",
          }}
        >
          <span className="fae-repaso__llama" style={{ paddingBottom: racha >= 1 ? "6px" : 0 }}><Medalla racha={racha} /></span>

          <span className="fae-repaso__texto">
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(19px, 2.3vw, 24px)", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
              {actividad.nombre}
            </span>
            <span style={{ display: "block", margin: "5px 0 0", fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.86)" }}>
              {SUBTITULO_REPASO}
            </span>
            {!cargando && !error && (
              <span data-datos style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                {!hecho && previa && <Dato data-dato-cuenta>{previa.cuantos} ítems</Dato>}
                {!hecho && previa && <Dato data-dato-fp>hasta {fpBase} FP</Dato>}
                <Dato data-dato-hito>{copiaHito(racha)}</Dato>
              </span>
            )}
          </span>

          <span className="fae-repaso__estado">{!cargando && !error && <Chip hecho={hecho} />}</span>

          <span
            aria-hidden="true"
            className={`fae-repaso__flecha${abierto ? " fae-repaso__flecha--abierta" : ""}`}
            style={{ fontSize: "18px", lineHeight: 1 }}
          >
            →
          </span>
        </button>
      ) : (
        <div
          style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", gap: "16px",
            padding: relleno,
          }}
        >
          {/* Bloqueado: el fuego siempre apagado, aunque tenga racha por otras actividades. */}
          <Medalla racha={0} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(19px, 2.3vw, 24px)", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
              {actividad.nombre}
            </span>
            <span data-bloqueo style={{ display: "block", margin: "5px 0 0", fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.86)" }}>
              {copiaBloqueo(estado, faltan)}
            </span>
          </span>
        </div>
      )}

      {/* ── la expansión ── */}
      {activo && (
        <div className={`fae-repaso__caja${abierto ? " fae-repaso__caja--abierta" : ""}`} style={{ position: "relative", zIndex: 1 }}>
          <div className="fae-repaso__interior">
            <div
              data-expansion
              aria-hidden={!abierto}
              style={{
                margin: "0 clamp(10px, 2vw, 14px) clamp(10px, 2vw, 14px)",
                padding: "clamp(16px, 2.4vh, 20px) clamp(14px, 2.4vw, 20px)",
                borderRadius: "16px",
                background: "rgba(14,27,46,0.55)",
                border: "1px solid rgba(248,249,250,0.10)",
                backdropFilter: "blur(6px)",
              }}
            >
              {error && (
                <p role="alert" style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.82)" }}>
                  No se pudo cargar el Repaso. Intenta de nuevo en un momento.
                </p>
              )}

              {!error && cargando && (
                <p role="status" style={{ margin: 0, fontSize: "14px", color: "rgba(248,249,250,0.6)" }}>Cargando…</p>
              )}

              {!error && !cargando && hecho && <YaHecho racha={racha} />}

              {!error && !cargando && !hecho && previa && (
                <Pendiente previa={previa} racha={racha} onEmpezar={onEmpezar} fpBase={fpBase} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ETIQUETA = { margin: 0, fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(248,249,250,0.62)" };

/** Una ficha de cifra: el número grande y, debajo, qué es. */
function Ficha({ valor, rotulo, className, children, ...resto }) {
  return (
    <div
      {...resto}
      className={className}
      style={{
        padding: "12px 14px", borderRadius: "14px", minWidth: 0,
        background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.10)",
      }}
    >
      {valor !== undefined && (
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "22px", lineHeight: 1.1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{valor}</p>
      )}
      {rotulo && <p style={{ margin: "4px 0 0", fontSize: "12.5px", lineHeight: 1.35, color: "rgba(248,249,250,0.72)" }}>{rotulo}</p>}
      {children}
    </div>
  );
}

/* La barra hacia el próximo bono, la misma idea que el anillo, a lo ancho. */
function BarraHito({ racha }) {
  const avance = avanceHaciaHito(racha);
  return (
    <div aria-hidden="true" style={{ height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.12)", overflow: "hidden", marginTop: "8px" }}>
      <div style={{ width: `${Math.round(avance * 100)}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${FAE.ambar}, ${FAE.coral})` }} />
    </div>
  );
}

function Pendiente({ previa, racha, onEmpezar, fpBase = REPASO.clasificacion.fpBase }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
      <div style={{ width: "100%" }}>
        <p style={ETIQUETA}>Hoy entran</p>
        <ul data-temas style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {previa.temas.map((t) => (
            <li
              key={t}
              data-tema
              style={{
                padding: "5px 11px", borderRadius: "999px",
                background: `rgba(${TEAL_RGB}, 0.16)`, border: `1px solid rgba(${TEAL_RGB}, 0.5)`,
                fontSize: "13px", fontWeight: 600, lineHeight: 1.35, color: FAE.text,
              }}
            >
              {nombreDeTema(t)}
            </li>
          ))}
        </ul>
      </div>

      <div data-cuenta className="fae-repaso__fichas">
        <Ficha valor={previa.cuantos} rotulo="ítems" />
        <Ficha valor={fpBase} rotulo="FP como máximo" />
        <Ficha className="fae-repaso__ficha--racha" data-ficha-racha>
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: 1.3 }}>
            {racha >= 1 ? `Racha de ${racha} ${racha === 1 ? "día" : "días"}` : "Sin racha todavía"}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", lineHeight: 1.35, color: "rgba(248,249,250,0.72)" }}>
            {racha === 0 ? <span data-empieza-racha>Hazlo hoy y empiezas tu racha.</span> : copiaHito(racha)}
          </p>
          <BarraHito racha={racha} />
        </Ficha>
      </div>

      <button
        type="button"
        data-empezar
        className="fae-repaso__empezar"
        onClick={onEmpezar}
        style={{
          fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700,
          padding: "14px 26px", borderRadius: "14px", cursor: "pointer",
          background: `linear-gradient(180deg, #33B3A3 0%, ${FAE.teal} 100%)`, border: `1px solid ${FAE.teal}`, color: FAE.bg,
        }}
      >
        Empezar el repaso
      </button>
    </div>
  );
}

function YaHecho({ racha }) {
  return (
    <div data-ya-hecho style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {/* Aquí SÍ se anima: es el momento que el estudiante ve al abrir tras cumplir. */}
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", flexShrink: 0, borderRadius: "999px", background: `radial-gradient(circle, rgba(${AMBAR_RGB},0.28) 0%, rgba(14,27,46,0) 70%)` }}>
        <LlamaRacha racha={racha} tamano={30} viva />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", color: FAE.text }}>
          Racha del día asegurada
        </p>
        <p style={{ margin: "3px 0 0", fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.78)" }}>
          Vuelve mañana para seguir repasando.
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "12.5px", lineHeight: 1.35, color: "rgba(248,249,250,0.72)" }}>{copiaHito(racha)}</p>
        <BarraHito racha={racha} />
      </div>
    </div>
  );
}

/* Por si alguien lo sigue importando: el número de ítems sale de la configuración. */
export { ITEMS_POR_REPASO };
