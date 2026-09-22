import { useState } from "react";
import { FAE } from "../../theme.js";
import { ACTIVIDADES_TRANSVERSALES, nombreDeTema } from "../../data/subjects.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { rachaVigente } from "../../fp/racha.js";
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

const CSS = `
/*
 * ═══════════ LA CABECERA APILA EN EL TELÉFONO ═══════════
 *
 * En una sola fila —llama, texto, chip, flecha— a 375 px el título se parte en
 * tres líneas («El / Repaso / Diario») y el subtítulo se corta. Medido.
 *
 * Así que en estrecho va en dos filas: arriba la llama y el texto con todo el
 * ancho, abajo el chip y la flecha alineados a la derecha. Desde 620 px cabe
 * la fila única del diseño. El chip y la flecha nunca encogen; lo que cede es
 * el texto, igual que en las cabeceras de actividad.
 */
.fae-repaso__cabecera {
  display: grid;
  align-items: center;
  column-gap: 14px;
  row-gap: 10px;
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

.fae-repaso { transition: border-color 180ms ease; }
.fae-repaso--activo:hover { border-color: rgba(42,157,143,0.85); }
.fae-repaso__cabecera:focus-visible { outline: 2px solid ${FAE.teal}; outline-offset: 3px; }

/*
 * La expansión, con el patrón de la tarjeta partida: una rejilla de una fila
 * que pasa de 0fr a 1fr. Animar grid-template-rows —en vez de max-height con un
 * número inventado— hace que la altura final la ponga el contenido, así que da
 * igual cuántas líneas traiga el día.
 */
.fae-repaso__caja { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1); }
.fae-repaso__caja--abierta { grid-template-rows: 1fr; }
.fae-repaso__interior { overflow: hidden; min-height: 0; }

.fae-repaso__flecha { transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1); }
.fae-repaso__flecha--abierta { transform: rotate(90deg); }

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
  .fae-repaso, .fae-repaso__caja, .fae-repaso__flecha { transition: none; }
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

/** El chip de estado del banner cerrado. */
function Chip({ hecho }) {
  return (
    <span
      data-chip={hecho ? "listo" : "pendiente"}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px", flexShrink: 0,
        fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700,
        letterSpacing: "0.04em", padding: "5px 11px", borderRadius: "999px",
        whiteSpace: "nowrap",
        background: hecho ? FAE.teal : FAE.ambar,
        color: FAE.bg,
      }}
    >
      {hecho && <span aria-hidden="true">✓</span>}
      {hecho ? "Listo hoy" : "Pendiente hoy"}
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

/*
 * `repaso` es inyectable por la misma razón que `onGuardar` en el selector de
 * avatar y `onComprar` en la Tienda: los tres estados del banner dependen de lo
 * que diga la base, y una prueba tiene que poder ponerlos sin una base. En
 * producción nadie lo pasa y manda el hook.
 */
export default function BannerRepaso({ actividad, onEmpezar, repaso = null }) {
  const { perfil } = useAuth();
  const delHook = useRepaso();
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

  const alternar = () => { if (activo) setAbierto((v) => !v); };

  const marco = {
    position: "relative", overflow: "hidden", isolation: "isolate",
    width: "100%", boxSizing: "border-box",
    borderRadius: "18px",
    border: `1px solid ${activo ? "rgba(42,157,143,0.45)" : "rgba(248,249,250,0.14)"}`,
    background: FAE.navy,
    color: FAE.text,
    /* Bloqueado: plano y atenuado. Sin degradado y sin manchas. */
    opacity: activo ? 1 : 0.55,
  };

  return (
    <div data-banner={actividad.id} data-estado={bloqueado ? "bloqueado" : hecho ? "hecho" : "pendiente"} className={`fae-repaso ${activo ? "fae-repaso--activo" : ""}`} style={marco}>
      <style>{CSS}</style>

      {activo && (
        <>
          <MallaAnimada manchas={MANCHAS_BANNER} fija={false} fondo={`linear-gradient(100deg, ${FAE.teal}55 0%, ${FAE.navy} 58%, ${FAE.bg} 100%)`} />
          {/* Velo hacia la derecha: el texto blanco necesita base aunque pase una mancha teal. */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(14,27,46,0.05) 0%, rgba(14,27,46,0.42) 100%)" }} />
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
            padding: "clamp(14px, 2.2vh, 20px) clamp(14px, 3vw, 22px)",
            background: "transparent", border: "none", color: "inherit", font: "inherit",
          }}
        >
          <span className="fae-repaso__llama"><LlamaRacha racha={racha} /></span>

          <span className="fae-repaso__texto">
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "clamp(19px, 2.2vw, 24px)", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
              {actividad.nombre}
            </span>
            <span style={{ display: "block", margin: "5px 0 0", fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.86)" }}>
              {SUBTITULO_REPASO}
            </span>
          </span>

          <span className="fae-repaso__estado">{!cargando && !error && <Chip hecho={hecho} />}</span>

          <span
            aria-hidden="true"
            className={`fae-repaso__flecha${abierto ? " fae-repaso__flecha--abierta" : ""}`}
            style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }}
          >
            →
          </span>
        </button>
      ) : (
        <div
          style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", gap: "14px",
            padding: "clamp(14px, 2.2vh, 20px) clamp(14px, 3vw, 22px)",
          }}
        >
          {/* Bloqueado: el fuego siempre apagado, aunque tenga racha por otras actividades. */}
          <LlamaRacha racha={0} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "clamp(19px, 2.2vw, 24px)", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
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
                padding: "0 clamp(14px, 3vw, 22px) clamp(16px, 2.4vh, 22px)",
                borderTop: "1px solid rgba(248,249,250,0.12)",
                marginTop: "2px", paddingTop: "16px",
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
                <Pendiente previa={previa} racha={racha} onEmpezar={onEmpezar} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const LINEA = { margin: 0, fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.88)" };

function Pendiente({ previa, racha, onEmpezar }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
      <p data-temas style={LINEA}>
        Hoy entran: {previa.temas.map(nombreDeTema).join(" · ")}
      </p>
      <p data-cuenta style={LINEA}>
        {previa.cuantos} ítems · hasta {REPASO.clasificacion.fpBase} FP
      </p>
      {racha === 0 && (
        <p data-empieza-racha style={{ ...LINEA, color: "rgba(248,249,250,0.72)" }}>
          Hazlo hoy y empiezas tu racha.
        </p>
      )}
      <button
        type="button"
        data-empezar
        onClick={onEmpezar}
        style={{
          marginTop: "4px",
          fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
          padding: "13px 22px", borderRadius: "14px", cursor: "pointer",
          background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
        }}
      >
        Empezar el repaso
      </button>
    </div>
  );
}

function YaHecho({ racha }) {
  return (
    <div data-ya-hecho style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      {/* Aquí SÍ se anima: es el momento que el estudiante ve al abrir tras cumplir. */}
      <LlamaRacha racha={racha} tamano={34} viva />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", color: FAE.text }}>
          Racha del día asegurada
        </p>
        <p style={{ margin: "3px 0 0", fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.78)" }}>
          Vuelve mañana para seguir repasando.
        </p>
      </div>
    </div>
  );
}

/* Por si alguien lo sigue importando: el número de ítems sale de la configuración. */
export { ITEMS_POR_REPASO };
