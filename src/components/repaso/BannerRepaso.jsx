import { useState } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { FAE } from "../../theme.js";
import { ACTIVIDADES_TRANSVERSALES, SUBJECTS, nombreDeTema } from "../../data/subjects.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { rachaVigente, proximoHito, HITOS } from "../../fp/racha.js";
import { useRepaso } from "../../repaso/useRepaso.js";
import { ID_REPASO, ITEMS_POR_REPASO } from "../../repaso/repaso.js";
import { NAVY_CLARO } from "../backgrounds/MeshGradientBackground.jsx";
import IconoRacha from "../shared/IconoRacha.jsx";
import { CARD_SHELL } from "../SubjectCard.jsx";
import { TONOS, identidadDeTema, variablesDeTono } from "../shared/TarjetaTema.jsx";

/* La ficha del Repaso, de donde salen su nombre y sus FP base. */
const REPASO = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === ID_REPASO);

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANNER DEL REPASO DIARIO — cerrado enseña estado, abierto enseña el día.
 *
 * No es un tema más, así que no tiene forma de tema: es una franja de ancho
 * completo. Lo que ya traía y se mantiene:
 *
 *   · Se ve el ESTADO sin entrar —pendiente, listo o bloqueado— porque la
 *     pregunta que el estudiante trae al índice es «¿ya lo hice hoy?».
 *   · Se EXPANDE EN SITIO, con el mismo patrón que la tarjeta partida de
 *     Aprender/Hacer: no navega, cambia de estado donde está.
 *   · La racha vive en una medalla con un anillo que se llena hacia el
 *     próximo bono (3, 7, 14, 30), y cerrado ya dice qué cuesta.
 *
 * ═══════════ EL REDISEÑO DEL 18-NOV (MAGNO): LA MISMA PIEZA QUE LOS TEMAS ═══════════
 *
 * Mateo pidió que el Repaso tenga la estética de las tarjetas de tema
 * (shared/TarjetaTema.jsx y las reglas .fae-tema de home.css): cristal con el
 * tono del tema en degradado, halo en la esquina, filo de luz arriba, marca
 * de agua grande, destello que cruza al pasar el puntero, pastilla de color
 * con su dibujo, rótulo en mayúsculas y flecha en círculo que se llena.
 *
 * Así que el banner ES una tarjeta .fae-tema, con su propio tono:
 *
 *   · TONO DURAZNO. Es el del fuego sin ser el coral (el coral es «error»
 *     en todo el sitio y aquí queda SOLO en el brillo de la llama viva).
 *   · LA MEDALLA ES LA PASTILLA. Con racha se ENCIENDE: pastilla llena de
 *     durazno y la llama en blanco, como los íconos de los temas. Sin racha
 *     es cristal oscuro con la llama gris: hay algo que encender. El anillo
 *     hacia el bono ahora rodea la pastilla.
 *   · LOS TEMAS DEL DÍA LLEVAN SU IDENTIDAD. Cada pastilla de «Hoy entran»
 *     usa el tono y el dibujo del tema en la rejilla de abajo: el estudiante
 *     reconoce Política Fiscal por su ámbar y su moneda antes de leerla.
 *   · Se fue la malla animada de fondo: las tarjetas de tema no la tienen y,
 *     al lado de ellas, el banner se leía como de otra aplicación.
 *
 * La llama de la medalla sigue QUIETA (cerrado es ambiente, no momento); lo
 * que se mueve es lo mismo que en los temas, y se apaga con reducir
 * movimiento igual que ahí.
 *
 * ═══════════ NUNCA SE ESCONDE ═══════════
 *
 * Bloqueado se ve atenuado, con su condición de desbloqueo escrita. Es la
 * misma regla del split Aprender/Hacer y de la Tienda: lo que todavía no está
 * disponible se enseña apagado, nunca se oculta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUBTITULO_REPASO = "Repasa lo que ya viste, mezclado entre todos los temas.";

/*
 * Las manchas de la malla que llevaba el banner hasta el 18-nov. Ya no se
 * pintan (ver arriba), pero se exportan igual: solo se agrega, nunca se borra.
 */
export const MANCHAS_BANNER = [
  { color: FAE.teal, tamano: "340px", izquierda: "-22%", arriba: "-110%", desenfoque: "56px", opacidad: 0.78, keyframes: "fae-mesh-a", duracion: "22s" },
  { color: NAVY_CLARO, tamano: "380px", izquierda: "38%", arriba: "-90%", desenfoque: "64px", opacidad: 0.7, keyframes: "fae-mesh-c", duracion: "27s" },
  { color: FAE.teal, tamano: "240px", izquierda: "8%", arriba: "10%", desenfoque: "52px", opacidad: 0.42, keyframes: "fae-mesh-b", duracion: "31s" },
];

/* El gris del fuego apagado. No es un color nuevo: es el de las miniaturas de forma. */
export const GRIS_APAGADO = "#7A8798";

/* El tono propio del Repaso, de la paleta de los temas. */
export const TONO_REPASO = TONOS.durazno;

/* El ámbar de la marca en rgb, para los halos: el coral se reserva al brillo del fuego. */
const AMBAR_RGB = "233, 196, 106";

/*
 * La identidad de cada tema, por su id, sin importar la materia: la necesitan
 * las pastillas de «Hoy entran». Se calcula una vez con el mismo índice que
 * usa la rejilla, así el tono coincide con el de la tarjeta de abajo.
 */
const IDENTIDAD_POR_TEMA = new Map();
for (const [materia, datos] of Object.entries(SUBJECTS)) {
  (datos.topics ?? []).forEach((tema, i) => {
    if (!IDENTIDAD_POR_TEMA.has(tema.id)) IDENTIDAD_POR_TEMA.set(tema.id, identidadDeTema(materia, tema, i));
  });
}
const identidadDe = (temaId, i) => IDENTIDAD_POR_TEMA.get(temaId) ?? identidadDeTema(null, { id: temaId }, i);

const CSS = `
/*
 * ═══════════ LA TARJETA ═══════════
 *
 * Hereda todo de .fae-card.fae-tema (home.css). Aquí solo lo propio: abierta
 * no salta al pasar el puntero (como la tarjeta partida abierta), y bloqueada
 * no reacciona.
 */
.fae-repaso.fae-tema[data-abierto="true"]:hover,
.fae-repaso.fae-tema[data-abierto="true"]:focus-within { transform: none; }
.fae-repaso[data-estado="bloqueado"]:hover { transform: none; }

/*
 * La cabecera: arriba la medalla y el estado; abajo rótulo, título, frase y
 * la base con los datos y la flecha. Es la cara de un tema, a lo ancho.
 */
.fae-repaso__cabecera {
  display: flex; flex-direction: column; gap: clamp(14px, 2.4vh, 22px);
  width: 100%; box-sizing: border-box; text-align: left; cursor: pointer;
  padding: clamp(18px, 2.4vh, 26px);
  background: transparent; border: none; color: inherit; font: inherit;
  border-radius: 18px;
}
.fae-repaso__cabecera:focus-visible { outline: 2px solid var(--tono-claro); outline-offset: -4px; }
.fae-repaso__frase { display: block; margin: 6px 0 0; font-size: 13.5px; line-height: 1.45; color: rgba(248, 249, 250, 0.8); }
.fae-repaso__datos { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.fae-repaso__dato {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 999px;
  background: rgba(var(--tono-rgb), 0.10); border: 1px solid rgba(var(--tono-rgb), 0.32);
  font-size: 12px; font-weight: 600; line-height: 1.4; color: rgba(248, 249, 250, 0.92);
  max-width: 100%; box-sizing: border-box;
}

/* La flecha en círculo de los temas; aquí además gira al abrir. */
.fae-repaso__flecha svg { transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.fae-repaso .fae-repaso__flecha--abierta svg,
.fae-tema.fae-repaso:hover .fae-repaso__flecha--abierta svg { transform: rotate(90deg); }
.fae-repaso__flecha--abierta { background: var(--tono); color: #0E1B2E; }

/*
 * ═══════════ LA MEDALLA-PASTILLA ═══════════
 *
 * Con racha es una .fae-tema__pastilla de verdad: llena del tono, la llama en
 * blanco. Sin racha, cristal oscuro con la llama gris. El anillo hacia el
 * próximo bono la rodea con las mismas esquinas.
 */
.fae-repaso__medalla { position: relative; display: inline-flex; flex-shrink: 0; }
.fae-repaso__medalla .fae-tema__pastilla[data-apagada] {
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.10), rgba(248, 249, 250, 0.03));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 20px -10px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(var(--tono-rgb), 0.35);
}
.fae-repaso__anillo { position: absolute; inset: -6px; pointer-events: none; overflow: visible; }

/*
 * La expansión, con el patrón de la tarjeta partida: una rejilla de una fila
 * que pasa de 0fr a 1fr. Animar grid-template-rows —en vez de max-height con un
 * número inventado— hace que la altura final la ponga el contenido.
 */
.fae-repaso__caja { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 300ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.fae-repaso__caja--abierta { grid-template-rows: 1fr; }
.fae-repaso__interior { overflow: hidden; min-height: 0; }
.fae-repaso__panel {
  margin: 0 clamp(10px, 2vw, 14px) clamp(10px, 2vw, 14px);
  padding: clamp(16px, 2.4vh, 22px) clamp(14px, 2.4vw, 22px);
  border-radius: 16px;
  background: rgba(14, 27, 46, 0.55);
  border: 1px solid rgba(var(--tono-rgb), 0.20);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  opacity: 0; transform: translateY(-6px);
  transition: opacity 260ms ease, transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fae-repaso__caja--abierta .fae-repaso__panel { opacity: 1; transform: none; transition-delay: 60ms; }

/* «Hoy entran»: cada tema con su tono y su dibujo, como en su tarjeta. */
.fae-repaso__tema {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 4px 12px 4px 4px; border-radius: 999px;
  background: rgba(var(--tono-rgb), 0.14); border: 1px solid rgba(var(--tono-rgb), 0.45);
  font-size: 13px; font-weight: 600; line-height: 1.35; color: #F8F9FA;
}
.fae-repaso__tema-icono {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0; color: #fff;
  background: linear-gradient(145deg, rgba(var(--tono-rgb), 0.95), rgba(var(--tono-rgb), 0.6));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 10px -4px rgba(var(--tono-rgb), 0.8);
}
.fae-repaso__caja--abierta .fae-repaso__tema { animation: fae-repaso-tema-entra 460ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
@keyframes fae-repaso-tema-entra {
  from { opacity: 0; transform: translateY(6px) scale(0.92); }
  to   { opacity: 1; transform: none; }
}

/* Las fichas de cifras: tres en fila desde 560 px, apiladas en el teléfono. */
.fae-repaso__fichas { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; width: 100%; }
.fae-repaso__ficha--racha { grid-column: 1 / -1; }
@media (min-width: 560px) {
  .fae-repaso__fichas { grid-template-columns: 1fr 1fr 1.6fr; }
  .fae-repaso__ficha--racha { grid-column: auto; }
}
.fae-repaso__ficha {
  position: relative; overflow: hidden;
  padding: 12px 14px; border-radius: 14px; min-width: 0;
  background: linear-gradient(160deg, rgba(var(--tono-rgb), 0.10) 0%, rgba(248, 249, 250, 0.035) 60%);
  border: 1px solid rgba(248, 249, 250, 0.10);
}
.fae-repaso__ficha::before {
  content: ""; position: absolute; top: 0; left: 14%; right: 14%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--tono-rgb), 0.7), transparent);
}

/* El botón de empezar: lleno del tono, ancho en el teléfono, con su flecha. */
.fae-repaso__empezar {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%;
  font-family: Sora, sans-serif; font-size: 15px; font-weight: 700;
  padding: 14px 26px; border-radius: 14px; cursor: pointer;
  background: linear-gradient(180deg, var(--tono-claro) 0%, var(--tono) 100%);
  border: 1px solid var(--tono); color: #0E1B2E;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 12px 26px -12px rgba(var(--tono-rgb), 0.95);
  transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease, filter 180ms ease;
}
.fae-repaso__empezar svg { transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.fae-repaso__empezar:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 18px 32px -12px rgba(var(--tono-rgb), 1); }
.fae-repaso__empezar:hover svg { transform: translateX(4px); }
.fae-repaso__empezar::before {
  content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-18deg); opacity: 0; pointer-events: none;
}
.fae-repaso__empezar:hover::before { animation: fae-tema-destello 900ms ease forwards; }
.fae-repaso__empezar:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 3px; }
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
  .fae-repaso__caja, .fae-repaso__panel, .fae-repaso__flecha svg, .fae-repaso__empezar, .fae-repaso__empezar svg { transition: none; }
  .fae-repaso__panel { transform: none; }
  .fae-repaso__empezar:hover, .fae-repaso__empezar:hover svg { transform: none; }
  .fae-repaso__empezar:hover::before, .fae-repaso__caja--abierta .fae-repaso__tema { animation: none; }
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
 * La medalla, ahora con forma de pastilla de tema. Encendida (con racha) es
 * la pastilla llena del tono con la llama en blanco; apagada, cristal con la
 * llama gris. El anillo hacia el bono la rodea; el número cuelga de la esquina.
 */
function Medalla({ racha, lado = 58 }) {
  const encendida = racha >= 1;
  const avance = encendida ? avanceHaciaHito(racha) : 0;
  const caja = lado + 12;
  return (
    <span data-medalla data-llama={encendida ? "encendida" : "apagada"} className="fae-repaso__medalla">
      <span className="fae-tema__pastilla" aria-hidden="true" {...(encendida ? {} : { "data-apagada": "" })}>
        <span className="fae-tema__pastilla-anillo" />
        <IconoRacha tamano={Math.round(lado * 0.5)} encendida={false} colorApagado={encendida ? "#FFFFFF" : GRIS_APAGADO} />
      </span>
      <svg aria-hidden="true" className="fae-repaso__anillo" width={caja} height={caja} viewBox={`0 0 ${caja} ${caja}`}>
        <rect x="1.5" y="1.5" width={caja - 3} height={caja - 3} rx="22" fill="none" stroke="rgba(248,249,250,0.12)" strokeWidth="2.5" />
        {avance > 0 && (
          <rect
            data-anillo={avance.toFixed(2)}
            x="1.5" y="1.5" width={caja - 3} height={caja - 3} rx="22" fill="none"
            stroke={`rgb(${AMBAR_RGB})`} strokeWidth="2.5" strokeLinecap="round"
            pathLength="100" strokeDasharray={`${(avance * 100).toFixed(1)} 100`}
            style={{ filter: `drop-shadow(0 0 4px rgba(${AMBAR_RGB}, 0.6))` }}
          />
        )}
      </svg>
      {/* El número, en su pastilla colgada de la esquina. Sin racha no hay pastilla: nunca un cero. */}
      {encendida && (
        <span
          data-racha-numero
          style={{
            position: "absolute", right: "-12px", bottom: "-10px", zIndex: 2,
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
        letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", borderRadius: "999px",
        whiteSpace: "nowrap",
        background: hecho ? FAE.teal : FAE.ambar,
        color: FAE.bg,
        boxShadow: hecho ? "0 6px 16px -8px rgba(42, 157, 143, 0.9)" : `0 6px 16px -8px rgba(${AMBAR_RGB}, 0.9)`,
      }}
    >
      {hecho
        ? <span aria-hidden="true">✓</span>
        : <span aria-hidden="true" style={{ width: "6px", height: "6px", borderRadius: "999px", background: FAE.bg, opacity: 0.75 }} />}
      {hecho ? "Listo hoy" : "Pendiente hoy"}
    </span>
  );
}

/** Una pastilla de dato en la cabecera: pequeña, teñida del tono, que no compite con el título. */
function Dato({ children, ...resto }) {
  return <span {...resto} className="fae-repaso__dato">{children}</span>;
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

/* Las luces de la tarjeta de tema, con la llama de marca de agua. */
function Luces() {
  return (
    <>
      <span className="fae-tema__brillo" aria-hidden="true" />
      <span className="fae-tema__linea" aria-hidden="true" />
      <span className="fae-tema__marca-agua" aria-hidden="true">
        <Flame size={150} strokeWidth={1.2} focusable="false" />
      </span>
      <span className="fae-tema__destello" aria-hidden="true" />
    </>
  );
}

const ROTULO = "Cada día · todos los temas";

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

  /* Bloqueado: sin tono, plano. Las variables siguen ahí para que nada quede sin color. */
  const tono = activo ? TONO_REPASO : { base: GRIS_APAGADO, claro: "#B5C0CE", rgb: "122,135,152" };

  const marco = {
    ...CARD_SHELL,
    ...variablesDeTono(tono),
    minHeight: 0,
    padding: 0,
    borderRadius: "20px",
    boxSizing: "border-box",
    /* Bloqueado: plano y atenuado. */
    opacity: activo ? 1 : 0.55,
  };

  return (
    <div
      data-banner={actividad.id}
      data-estado={bloqueado ? "bloqueado" : hecho ? "hecho" : "pendiente"}
      data-abierto={abierto ? "true" : "false"}
      /* Es tres veces más ancha que un tema: con los 7° de las tarjetas, marea (Mateo, 18-nov). Se queda, pero suave. */
      data-mv-grados="2.5"
      className={`fae-repaso${activo ? " fae-repaso--activo fae-card fae-tema" : ""}`}
      style={marco}
    >
      <style>{CSS}</style>

      {activo && <Luces />}

      {/* ── la cabecera, siempre visible ── */}
      {activo ? (
        <button
          type="button"
          className="fae-repaso__cabecera"
          onClick={alternar}
          aria-expanded={abierto}
          aria-label={`${actividad.nombre}. ${SUBTITULO_REPASO}`}
        >
          <span className="fae-tema__fila" style={{ alignItems: "center" }}>
            <Medalla racha={racha} />
            <span className="fae-repaso__estado">{!cargando && !error && <Chip hecho={hecho} />}</span>
          </span>

          <span className="fae-tema__pie">
            <span className="fae-tema__rotulo" style={{ display: "block" }}>{ROTULO}</span>
            <span className="fae-tema__titulo" style={{ display: "block" }}>{actividad.nombre}</span>
            <span className="fae-repaso__frase">{SUBTITULO_REPASO}</span>
            <span className="fae-tema__base" style={{ marginTop: "14px", alignItems: "flex-end" }}>
              <span data-datos className="fae-repaso__datos">
                {!cargando && !error && !hecho && previa && <Dato data-dato-cuenta>{previa.cuantos} ítems</Dato>}
                {!cargando && !error && !hecho && previa && <Dato data-dato-fp>hasta {fpBase} FP</Dato>}
                {!cargando && !error && <Dato data-dato-hito>{copiaHito(racha)}</Dato>}
              </span>
              <span
                aria-hidden="true"
                className={`fae-tema__flecha fae-repaso__flecha${abierto ? " fae-repaso__flecha--abierta" : ""}`}
              >
                <ArrowRight size={20} strokeWidth={2.4} focusable="false" />
              </span>
            </span>
          </span>
        </button>
      ) : (
        <div
          style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", gap: "16px",
            padding: "clamp(18px, 2.4vh, 26px)",
          }}
        >
          {/* Bloqueado: el fuego siempre apagado, aunque tenga racha por otras actividades. */}
          <Medalla racha={0} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(20px, 2.4vw, 26px)", lineHeight: 1.12, letterSpacing: "-0.025em" }}>
              {actividad.nombre}
            </span>
            <span data-bloqueo style={{ display: "block", margin: "5px 0 0", fontSize: "13.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.86)" }}>
              {copiaBloqueo(estado, faltan)}
            </span>
          </span>
        </div>
      )}

      {/* ── la expansión ── */}
      {activo && (
        <div className={`fae-repaso__caja${abierto ? " fae-repaso__caja--abierta" : ""}`}>
          <div className="fae-repaso__interior">
            <div data-expansion aria-hidden={!abierto} className="fae-repaso__panel">
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

const ETIQUETA = { margin: 0, fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--tono-claro)" };

/** Una ficha de cifra: el número grande y, debajo, qué es. */
function Ficha({ valor, rotulo, className = "", children, ...resto }) {
  return (
    <div {...resto} className={`fae-repaso__ficha ${className}`.trim()}>
      {valor !== undefined && (
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", lineHeight: 1.1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{valor}</p>
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
      <div style={{ width: `${Math.round(avance * 100)}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${FAE.ambar}, ${TONO_REPASO.base})`, boxShadow: `0 0 8px rgba(${AMBAR_RGB}, 0.6)` }} />
    </div>
  );
}

/* Un tema de «Hoy entran», con el tono y el dibujo de su tarjeta. */
function TemaDelDia({ temaId, indice }) {
  const { tono, Glifo } = identidadDe(temaId, indice);
  return (
    <li
      data-tema
      className="fae-repaso__tema"
      style={{ ...variablesDeTono(tono), animationDelay: `${120 + indice * 70}ms` }}
    >
      <span className="fae-repaso__tema-icono" aria-hidden="true">
        {Glifo
          ? <Glifo size={14} strokeWidth={2.4} focusable="false" />
          : <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#fff" }} />}
      </span>
      {nombreDeTema(temaId)}
    </li>
  );
}

function Pendiente({ previa, racha, onEmpezar, fpBase = REPASO.clasificacion.fpBase }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", alignItems: "flex-start" }}>
      <div style={{ width: "100%" }}>
        <p style={ETIQUETA}>Hoy entran</p>
        <ul data-temas style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {previa.temas.map((t, i) => <TemaDelDia key={t} temaId={t} indice={i} />)}
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

      <button type="button" data-empezar className="fae-repaso__empezar" onClick={onEmpezar}>
        Empezar el repaso
        <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}

function YaHecho({ racha }) {
  return (
    <div data-ya-hecho style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {/* Aquí SÍ se anima: es el momento que el estudiante ve al abrir tras cumplir. */}
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", flexShrink: 0, borderRadius: "18px", background: `radial-gradient(circle, rgba(${AMBAR_RGB},0.28) 0%, rgba(14,27,46,0) 70%)`, border: "1px solid rgba(var(--tono-rgb), 0.3)" }}>
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
