import { FAE } from "../../../theme.js";
import { CierreConResumen } from "../../shared/PantallaResumen.jsx";
import { CSS_CORAZON } from "./circulatorio.jsx";
import { CARD_SHELL } from "../../SubjectCard.jsx";

/* El borde de las tarjetas del sitio, el mismo de CARD_SHELL. */
const BORDE_TARJETA = CARD_SHELL.border.replace(/^1px solid /, "");

/* El ancho mínimo de una columna de opciones: ver Opciones. */
export const ANCHO_MINIMO_OPCION = 170;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS COMPARTIDAS DE LOS SIETE JUEGOS DE DEMANDA AGREGADA.
 *
 * Esto NO es un vocabulario paralelo al de circulatorio.jsx: importa su CSS,
 * usa sus mismos tonos y vive en su misma carpeta. Lo que añade son las cuatro
 * cosas que un juego necesita y una pieza de "Aprender" no: una opción que se
 * toca, una devolución, un pulso de avance y un cierre.
 *
 * ═══════════ EL COLOR NUNCA VA SOLO ═══════════
 *
 * Una opción acertada no se distingue solo por ponerse teal: le aparece un
 * signo dibujado —un visto o un aspa— y la devolución de abajo lo dice con
 * palabras. Las tres señales van juntas siempre. Quien no distinga teal de
 * coral lee exactamente la misma información.
 *
 * ═══════════ EL EMOJI ES PARTE DE LA CADENA, Y NO BASTA ═══════════
 *
 * Las devoluciones empiezan por ✅ o ❌ y así están escritas en el banco: no se
 * tocan. Pero un lector de pantalla los lee de forma inconsistente —o los
 * ignora—, así que Retro los marca como decorativos y antepone "Correcto:" o
 * "Incorrecto:" en texto invisible. La cadena que se ve en pantalla sigue
 * siendo la del banco, carácter por carácter.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_JUEGO = `
${CSS_CORAZON}

/* Texto solo para lectores de pantalla. */
.fae-jg-oculto {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

/* Una opción libre bajo el dedo: el borde se aclara; el marcador sigue hueco. */
.fae-jg-opcion:not(:disabled):hover { border-color: rgba(248,249,250,0.32) !important; }
.fae-jg-opcion:focus-visible { outline: 2px solid ${FAE.teal}; outline-offset: 2px; }

/* El latido de la opción recién acertada: un solo pulso, no un bucle. */
@keyframes fae-jg-acierto {
  0%, 100% { transform: scale(1); }
  40%      { transform: scale(1.025); }
}
.fae-jg-acierto { animation: fae-jg-acierto 340ms ease-out; }

@keyframes fae-jg-fallo {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-4px); }
  75%      { transform: translateX(4px); }
}
.fae-jg-fallo { animation: fae-jg-fallo 300ms ease-out; }

@media (prefers-reduced-motion: reduce) {
  .fae-jg-acierto, .fae-jg-fallo { animation: none !important; }
}
`;

/* ─────────────────────────── la opción ─────────────────────────── */

/*
 * El marcador de la izquierda: un nodo, la misma pieza del logo y del camino.
 * Hueco mientras se puede elegir; al elegir SE LLENA, y el relleno es lo que
 * dice «esta es la tuya». Dentro del relleno va el signo —visto o aspa— para
 * que el color nunca informe solo.
 *
 *   libre       anillo claro, hueco
 *   correcta    lleno teal, con visto
 *   incorrecta  lleno coral, con aspa        ← el ÚNICO coral de la opción
 *   revelada    anillo teal con visto, hueco: la buena que NO se eligió
 *   elegida     lleno claro, sin signo: tomada, todavía sin veredicto
 */
function Marcador({ estado }) {
  const lleno = { correcta: FAE.teal, incorrecta: FAE.coral, elegida: FAE.node }[estado] ?? null;
  const anillo = lleno ?? (estado === "revelada" ? FAE.teal : "rgba(248,249,250,0.5)");
  const signo = estado === "revelada" ? FAE.teal : FAE.bg;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" data-marcador={estado ?? "libre"} style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="7.5" fill={lleno ?? "none"} stroke={anillo} strokeWidth={estado === "revelada" ? 2 : 1.5} />
      {(estado === "correcta" || estado === "revelada") && (
        <path d="M5.4 9.3 L7.9 11.7 L12.6 6.6" fill="none" stroke={signo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {estado === "incorrecta" && (
        <path d="M6.2 6.2 L11.8 11.8 M11.8 6.2 L6.2 11.8" fill="none" stroke={signo} strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

/*
 * Una opción que se toca: la tarjeta del sitio —el radio, el fondo apenas más
 * claro que el navy y el borde sutil de CARD_SHELL—, no un rectángulo de
 * formulario.
 *
 * `estado`: null mientras se puede elegir · "correcta" · "incorrecta" ·
 * "revelada" para la respuesta buena que el estudiante NO eligió, que se
 * enseña sin celebrarla · "elegida" para una pieza tomada que todavía no se
 * juzga (la línea de tiempo).
 */
export function Opcion({ children, onClick, estado = null, deshabilitada = false, ancho = false }) {
  const acierto = estado === "correcta";
  const fallo = estado === "incorrecta";
  const revelada = estado === "revelada";

  const borde = acierto
    ? FAE.teal
    : fallo
      ? FAE.coral
      : revelada
        ? `${FAE.teal}88`
        : estado === "elegida"
          ? "rgba(203,220,242,0.55)"
          : BORDE_TARJETA;
  const fondo = acierto ? "rgba(42,157,143,0.14)" : fallo ? "rgba(231,111,81,0.13)" : CARD_SHELL.background;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitada}
      data-estado={estado ?? "libre"}
      className={`fae-jg-opcion${acierto ? " fae-jg-acierto" : fallo ? " fae-jg-fallo" : ""}`}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        width: ancho ? "100%" : undefined, boxSizing: "border-box",
        textAlign: "left", padding: "13px 15px", borderRadius: CARD_SHELL.borderRadius,
        background: fondo, border: `1px solid ${borde}`,
        color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "13.5px", lineHeight: 1.45,
        /* Las que quedaron sin tocar se apagan un poco: el veredicto manda. */
        opacity: deshabilitada && !estado ? 0.62 : 1,
        cursor: deshabilitada ? "default" : "pointer",
        transition: "background 180ms ease, border-color 180ms ease, opacity 180ms ease",
      }}
    >
      <Marcador estado={estado} />
      <span style={{ minWidth: 0, flex: 1 }}>
        {children}
        {/*
          Debajo del texto y no en una columna a la derecha: en la rejilla de
          dos columnas del teléfono, esa columna partía «G · Gasto público» en
          tres renglones.
        */}
        {revelada && (
          /*
           * 12 px: «era esta» no es adorno, es lo que le dice al estudiante
           * cuál era la respuesta buena cuando no la eligió. Si se tapa, se
           * pierde esa información. A 11 px y al 62 % de opacidad era lo más
           * difícil de leer de toda la tarjeta, siendo de lo más importante.
           */
          <span style={{ display: "block", marginTop: "2px", fontSize: "12px", color: "rgba(248,249,250,0.62)" }}>
            era esta
          </span>
        )}
      </span>
    </button>
  );
}

/*
 * Una devolución del banco, tal cual está escrita.
 *
 * El primer carácter es ✅ o ❌ y de ahí sale el tono: no se pasa un booleano
 * aparte que pudiera contradecir al texto.
 *
 * Son TRES casos, no dos. Antes todo lo que no empezaba por ✅ salía en coral y
 * con «Incorrecto:» para quien escucha la pantalla: un aviso, una pista o una
 * nota cualquiera se leía como un error. El veredicto lo dice el emoji, que se
 * ve en blanco y negro; el color es la segunda señal. Un texto sin ✅ ni ❌ es
 * neutro: borde y fondo en el tono neutro del sitio, sin rótulo de veredicto y
 * entero —no se le parte el principio, que es lo que se hace con el emoji.
 */
export function Retro({ texto }) {
  if (!texto) return null;
  const ok = texto.startsWith("✅");
  const mal = texto.startsWith("❌");
  const veredicto = ok || mal;
  const emoji = veredicto ? texto.slice(0, 2).trim() : "";
  const resto = veredicto ? texto.slice(2) : texto;
  const tono = ok ? FAE.teal : mal ? FAE.coral : FAE.node;
  const fondo = ok ? "rgba(42,157,143,0.10)" : mal ? "rgba(231,111,81,0.10)" : "rgba(203,220,242,0.08)";

  return (
    <p
      role="status"
      data-retro={ok ? "ok" : mal ? "mal" : "neutro"}
      style={{
        margin: "12px 0 0", padding: "11px 13px", borderRadius: "12px",
        fontSize: "13px", lineHeight: 1.55,
        background: fondo,
        border: `1px solid ${tono}55`,
        color: "rgba(248,249,250,0.82)",
      }}
    >
      {veredicto && <span className="fae-jg-oculto">{ok ? "Correcto: " : "Incorrecto: "}</span>}
      {veredicto && <span aria-hidden="true">{emoji}</span>}
      {resto}
    </p>
  );
}

/*
 * El avance: una línea de nodos unidos —el lenguaje del logo, del fondo de la
 * portada y del camino—, no puntos sueltos.
 *
 *   hecho      lleno teal
 *   actual     anillo de énfasis, hueco
 *   pendiente  solo el contorno
 *
 * El tramo de línea hasta el nodo actual va en teal. NUNCA coral: en esta misma
 * pantalla el coral marca la respuesta incorrecta, y aquí diría otra cosa.
 *
 * «Ítem 3 de 10» va pegado a la línea, en Inter, como rótulo de la misma pieza.
 */
/*
 * ═══════════ CUÁNDO LOS NODOS DEJAN DE SER NODOS ═══════════
 *
 * Cada nodo pide unos 13 px de ancho mínimo, así que a 375 px caben catorce
 * contando el rótulo. La Mayorización pide diecinueve y veinticuatro —es la
 * única actividad que trabaja un caso entero— y con esos, la fila se salía y
 * el rótulo «Renglón 3 de 19» quedaba cortado por la derecha.
 *
 * Por encima del tope, los nodos se sustituyen por una barra continua. No es
 * una pérdida: catorce puntos ya no se cuentan de un vistazo, y lo que el
 * estudiante necesita saber —cuánto llevo— lo dice mejor una barra y el
 * rótulo, que sigue estando y sigue diciendo el número exacto.
 */
export const MAXIMO_NODOS = 14;

/*
 * ═══════════ EL RÓTULO DICE EL ÍTEM EN CURSO, NO LOS TERMINADOS ═══════════
 *
 * «Situación 0 de 5» en la primera pantalla se leía como «todavía no hay
 * nada», cuando el estudiante ya está en la primera. El rótulo dice cuál
 * tiene delante: 1 de 5 al empezar, 5 de 5 en la última (Levi).
 *
 * `enCurso` es ese número, 1 en adelante. Casi todas las actividades suman 1
 * a `hechos` al cerrar un ítem —para que el nodo se llene—, así que desde
 * `hechos` no se puede saber si el ítem en pantalla ya se cerró: por eso lo
 * pasan aparte. Sin él, vale el nodo actual: `hechos + 1`, sin pasar del
 * total. La barra y `aria-valuenow` siguen contando los terminados.
 *
 * `cuenta` es la excepción: el rótulo dice los terminados, desde 0. Es para
 * el Memorama, donde no hay un ítem «en curso» —las parejas se encuentran en
 * cualquier orden— y lo que se lleva es cuántas van (Levi).
 */
export function Pulsos({ total, hechos, etiqueta = "Avance", enCurso = null, cuenta = false }) {
  const numero = cuenta ? hechos : Math.max(1, Math.min(enCurso ?? hechos + 1, total));
  const actual = hechos < total ? hechos : null;
  const hasta = total > 1 ? Math.min(hechos, total - 1) / (total - 1) : 0;
  const NODO = 10;

  if (total > MAXIMO_NODOS) {
    const llevado = total > 0 ? Math.min(hechos, total) / total : 0;
    return (
      <div data-avance data-barra style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <div
          role="progressbar"
          aria-label={etiqueta}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={hechos}
          style={{
            position: "relative", flex: "1 1 auto", minWidth: "60px", height: "6px",
            borderRadius: "999px", background: "rgba(248,249,250,0.2)", overflow: "hidden",
          }}
        >
          <span
            aria-hidden="true"
            data-tramo-hecho
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${llevado * 100}%`, background: FAE.teal, transition: "width 240ms ease",
            }}
          />
        </div>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(248,249,250,0.62)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          {etiqueta} {numero} de {total}
        </span>
      </div>
    );
  }

  return (
    <div data-avance style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
      <div
        role="progressbar"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={hechos}
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between",
          flex: `0 1 ${total * 24}px`, minWidth: `${total * 13}px`, height: "16px",
        }}
      >
        <span aria-hidden="true" style={{ position: "absolute", left: NODO / 2, right: NODO / 2, top: "50%", height: "1.5px", marginTop: "-0.75px", background: "rgba(248,249,250,0.2)" }} />
        <span
          aria-hidden="true"
          data-tramo-hecho
          style={{ position: "absolute", left: NODO / 2, top: "50%", height: "1.5px", marginTop: "-0.75px", width: `calc((100% - ${NODO}px) * ${hasta})`, background: FAE.teal, transition: "width 240ms ease" }}
        />
        {Array.from({ length: total }, (_, k) => {
          const estado = k < hechos ? "hecho" : k === actual ? "actual" : "pendiente";
          return (
            <span
              key={k}
              aria-hidden="true"
              data-nodo={estado}
              style={{
                position: "relative", boxSizing: "border-box", borderRadius: "999px", flexShrink: 0,
                width: estado === "actual" ? "12px" : `${NODO}px`, height: estado === "actual" ? "12px" : `${NODO}px`,
                background: estado === "hecho" ? FAE.teal : FAE.bg,
                border: estado === "hecho" ? `1.5px solid ${FAE.teal}` : estado === "actual" ? `2px solid ${FAE.teal}` : "1.5px solid rgba(248,249,250,0.38)",
                boxShadow: estado === "actual" ? "0 0 0 3px rgba(42,157,143,0.22)" : "none",
              }}
            />
          );
        })}
      </div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(248,249,250,0.62)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
        {etiqueta} {numero} de {total}
      </span>
    </div>
  );
}

/*
 * El cierre. Enseña el porcentaje con el que se registró la actividad, que es
 * el mismo número que viajó al servidor: no se recalcula aquí ni se redondea
 * otra vez.
 */
/*
 * Con la pantalla de resumen encendida para la materia (ver
 * hacer/pantallaResumen.js), el recuadro cede su sitio a ella: el texto propio
 * de la actividad pasa a su recuadro y el reinicio, a su botón «Repetir». Sin
 * proveedor, con el interruptor apagado o si la salvaguarda lo pide, el
 * recuadro es el de siempre.
 */
export function Cierre(props) {
  return (
    <CierreConResumen texto={props.children} onReiniciar={props.onReiniciar ?? null}>
      <RecuadroDeResultado {...props} />
    </CierreConResumen>
  );
}

function RecuadroDeResultado({ pct, children, onReiniciar, textoReiniciar = "Jugar otra vez" }) {
  return (
    <div
      className="fae-cz-entrar"
      style={{
        marginTop: "18px", padding: "16px 18px", borderRadius: "16px",
        background: "rgba(42,157,143,0.09)", border: `1px solid ${FAE.teal}55`,
      }}
    >
      <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)" }}>
        RESULTADO
      </p>
      <p style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 700, color: FAE.teal, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {pct}%
      </p>
      {children}
      {onReiniciar && (
        <button
          type="button"
          onClick={onReiniciar}
          style={{
            marginTop: "12px", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
            /* 44 px: el mínimo que un dedo acierta a 320 px (kit.md). Este botón
               cierra TODA actividad que use Cierre, así que el defecto se
               multiplicaba por el catálogo entero. Va solo al final de la
               tarjeta, así que crecer no empuja nada. */
            minHeight: "44px", padding: "9px 15px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.72)",
          }}
        >
          {textoReiniciar}
        </button>
      )}
    </div>
  );
}

/*
 * El enunciado de una ronda. Mismo tratamiento en los siete juegos para que se
 * lean como una familia y no como siete pantallas sueltas.
 */
export function Enunciado({ rotulo, children, acento = FAE.teal }) {
  return (
    <div
      style={{
        padding: "15px 17px", borderRadius: "16px",
        background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
      }}
    >
      {rotulo && (
        <p style={{ margin: "0 0 7px", fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: acento }}>
          {rotulo}
        </p>
      )}
      <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.55, color: FAE.text }}>{children}</p>
    </div>
  );
}

/** La rejilla de opciones: una columna en móvil, dos cuando hay sitio. */
export function Opciones({ children, columnas = "repeat(auto-fit, minmax(240px, 1fr))" }) {
  /*
   * Ninguna columna por debajo de ANCHO_MINIMO_OPCION, pida lo que pida la
   * pantalla. El marcador y su hueco se comen ~30 px de cada tarjeta, y a 150 px
   * «Operaciones de Mercado Abierto» salía en tres renglones. Con este piso, en
   * un teléfono las opciones se apilan y en pantallas anchas siguen lado a lado.
   */
  const conPiso = columnas.replace(/minmax\((\d+)px/g, (_, n) => `minmax(${Math.max(Number(n), ANCHO_MINIMO_OPCION)}px`);
  return (
    <div style={{ display: "grid", gridTemplateColumns: conPiso, gap: "10px", marginTop: "14px" }}>
      {children}
    </div>
  );
}
