import { FAE } from "../../../../../theme.js";
import { HAZ_INICIAL, responderHaz, hazResuelto, mostrarCorrecto, FASES, TIPOS } from "../../../../secuencia/secuencia.js";
import { SORA, INTER, SECUNDARIO, NAVY, RIEL, HUNDIDO, REPOSO, ACIERTO, FANTASMA, estiloC2, CURVA } from "../../tema1/registro.jsx";

export { estiloC2 };

/*
 * ═══════════ EL VOLUMEN (#545, aplicado por Mai: fichas/b-t1-secuencia-a1-volumen-mai.md §3) ═══════════
 *
 * La escalera N0 #0E1B2E (página) → N1 #1D3557 (canto) → N2 #344968 (cara).
 * EL CANTO MARCA LO QUE SE PULSA: cara N2 sobre un canto N1 de 4 px, que es
 * una sombra sin desenfoque (no un border-bottom) y por eso la cara conserva
 * sus 44 táctiles y el bloque mide 48. Al pulsar, la cara se hunde 4 px
 * (100 ms; vuelve en 160) y tapa el canto. Lo que no se pulsa lleva solo el
 * contorno de silueta de 1 px al 18 %. Con movimiento reducido no hay hundido.
 */
export const N1 = "#1D3557";
export const N2 = "#344968";
export const SILUETA = "rgba(248,249,250,.18)";
export const HUNDIDO_T1 = { ...HUNDIDO, border: `1px solid ${SILUETA}` };
/* La decoración del tema, quieta: los renglones del libro mayor (la trama y el tono de CSS_SALA, marco.jsx), detrás. */
export const TRAMA = "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(203,220,242,.05) 21px 22px)";
export const CANTO = "fae-t1s-canto";

/* La cara de un botón de parada según su estado C2 (lo de estiloC2, con la cara N2 y sin el inset). */
export function estiloBoton(estado) {
  if (estado === ACIERTO) return { border: `2px solid ${FAE.text}`, background: N2 };
  if (estado === FANTASMA) return { border: `2px dashed ${FAE.coral}`, background: "transparent", "--fae-canto": "transparent" };
  return { border: "2px solid transparent", background: N2 };
}

/*
 * ═══════════ LAS CEJILLAS NO RETROCEDEN (Mai, volumen §1 · 12) ═══════════
 * Una parada en medio de pantallas Míralo dice «Mírelo funcionar»: la fase de
 * una pantalla es la más temprana de las que quedan por delante. Los
 * literales son los de FASES (compartidos); aquí solo se elige cuál.
 */
export function conFases(pieza) {
  const pts = pieza.pantallas;
  const orden = (t) => TIPOS.indexOf(t);
  return {
    ...pieza,
    pantallas: pts.map((p, i) => {
      const t = TIPOS[Math.min(...pts.slice(i).map((q) => orden(q.tipo)))];
      return t === p.tipo ? p : { ...p, fase: FASES[t] };
    }),
  };
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 · LAS PIEZAS COMUNES DE LAS FIGURAS DE LA SECUENCIA (lote 6, Célula B).
 *
 * Una figura de T1 es, de arriba abajo, el riel de la pieza (30 px) y el
 * escenario (el resto de la reserva de la pieza). Lo que se toca vive dentro
 * de la figura: `SecuenciaAprender` solo da «Anterior» y «Siguiente».
 *
 * La reserva es la misma en todas las pantallas de una pieza (D5): cada
 * escenario ocupa el alto que le da la secuencia y su contenido no lo empuja.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { SORA, INTER, SECUNDARIO, NAVY, RIEL, CURVA };

export const CSS_FIGURAS_T1 = `
@keyframes fae-t1s-nodo { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
@keyframes fae-t1s-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-t1s-nodo { animation: fae-t1s-nodo 240ms ${CURVA} both; }
.fae-t1s-aparece { animation: fae-t1s-aparece 240ms ${CURVA} both; }
.fae-t1s-forma { animation: fae-t1s-aparece 500ms ${CURVA} both; }
.fae-t1s-canto { --fae-canto: #1D3557; box-shadow: 0 4px 0 0 var(--fae-canto), 0 0 0 1px rgba(248,249,250,.18); margin-bottom: 4px; transition: transform 160ms ${CURVA}, box-shadow 160ms ${CURVA}; }
.fae-t1s-canto:active:not([aria-disabled="true"]) { transform: translateY(4px); box-shadow: 0 0 0 0 var(--fae-canto), 0 0 0 1px rgba(248,249,250,.18); transition-duration: 100ms; }
@media (prefers-reduced-motion: reduce) {
  .fae-t1s-nodo, .fae-t1s-aparece, .fae-t1s-forma { animation: none !important; }
  .fae-t1s-canto { transition: none; }
  .fae-t1s-canto:active:not([aria-disabled="true"]) { transform: none; box-shadow: 0 4px 0 0 var(--fae-canto), 0 0 0 1px rgba(248,249,250,.18); }
}
`;

/*
 * El riel: las cinco estaciones del ciclo como una fila de nodos unidos por
 * un trazo, y la vuelta del 5 al 1 por encima. Va `aria-hidden`: lo que dice
 * lo dice el titular (Mai §2). Sin nombres: el nombre de la estación
 * encendida es el titular de la pantalla.
 *
 *   nodos     false: la vía sin nodos (R10 de la predicción).
 *   encendidos cuántos nodos van encendidos, de la izquierda.
 *   duda      el número del nodo que lleva un signo de pregunta.
 *   vuelta    "tenue" | "solida".
 *   entran    los nodos entran con escala, de a 60 ms (la respuesta de la predicción).
 */
/* El riel mide 24 y deja 8 hasta el escenario: con la reserva de 184 de Mai, el escenario es de 152. */
export const ALTO_RIEL = 24;
export function Riel({ nodos = true, encendidos = 0, duda = null, vuelta = "tenue", entran = false }) {
  const xs = [10, 30, 50, 70, 90];
  return (
    <svg data-riel data-encendidos={encendidos} data-vuelta={vuelta} viewBox="0 0 100 30" preserveAspectRatio="none"
      aria-hidden="true" style={{ display: "block", flex: "none", width: "100%", height: `${ALTO_RIEL}px`, overflow: "visible" }}>
      {/* La vuelta: sube del 5, cruza por arriba y baja al 1. */}
      <path d="M 90 14 L 90 3 L 10 3 L 10 14" fill="none" vectorEffect="non-scaling-stroke"
        stroke={vuelta === "solida" ? FAE.text : "rgba(184,196,212,.35)"} strokeWidth={vuelta === "solida" ? 2 : 1.5}
        strokeDasharray={vuelta === "solida" ? "none" : "3 3"} className={vuelta === "solida" ? "fae-t1s-aparece" : undefined} />
      {/* La vía, de nodo a nodo. */}
      <line x1="10" y1="20" x2="90" y2="20" vectorEffect="non-scaling-stroke" stroke={nodos ? RIEL : "rgba(184,196,212,.35)"} strokeWidth="2" />
      {nodos && xs.map((x, k) => {
        const n = k + 1;
        const on = n <= encendidos;
        return (
          <g key={n} data-nodo={n} data-encendido={on ? "si" : "no"}
            className={entran ? "fae-t1s-nodo" : undefined}
            style={entran ? { animationDelay: `${k * 60}ms`, transformOrigin: `${x}% 66%`, transformBox: "fill-box" } : undefined}>
            <ellipse cx={x} cy="20" rx="2.6" ry="7" vectorEffect="non-scaling-stroke"
              fill={on ? FAE.text : "#0E1B2E"} stroke={on ? FAE.text : RIEL} strokeWidth="2" />
            {duda === n && <text x={x} y="23" textAnchor="middle" fontSize="9" fill={FAE.text} style={{ fontFamily: SORA, fontWeight: 700 }}>?</text>}
          </g>
        );
      })}
    </svg>
  );
}

/*
 * El escenario: donde está la forma. Llena el resto de la reserva. `plano`:
 * sin fondo ni relleno, cuando la forma trae su propia tarjeta (la factura
 * llena los 144 de Mai) o cuando el ancho hace falta entero (la rejilla 2×2).
 */
export function Escenario({ children, centrado = false, plano = false, gap = 8 }) {
  return (
    <div data-escenario style={{
      ...(plano ? {} : HUNDIDO_T1), flex: 1, minHeight: 0, boxSizing: "border-box", padding: plano ? 0 : "6px 8px",
      display: "flex", flexDirection: "column", gap: `${gap}px`, justifyContent: centrado ? "center" : "flex-start",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

/* El marco de una figura de T1: riel arriba (si la pieza lo lleva) y escenario debajo. */
export function MarcoFigura({ riel = null, children }) {
  return (
    <div data-figura-t1 style={{ height: "100%", display: "flex", flexDirection: "column", gap: "8px", backgroundImage: TRAMA }}>
      <style>{CSS_FIGURAS_T1}</style>
      {riel}
      {children}
    </div>
  );
}

/* Un texto corto dentro del escenario (lo que revela un toque, la respuesta de la predicción). */
export function Nota({ children, ...resto }) {
  return (
    <p {...resto} className="fae-t1s-aparece" style={{ margin: 0, fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: FAE.text }}>
      {children}
    </p>
  );
}

/*
 * Las opciones de una parada, EN FILA (Mai §2.1.3): apiladas, a 320 la
 * tercera nacía detrás del bloque pegado. Rótulos cortos, de dos renglones
 * como mucho.
 */
export function Fila({ opciones, estadoDe = () => REPOSO, onElegir, activa = true, data = "data-opcion", eraEsta = null }) {
  return (
    <div role="group" style={{ display: "grid", gridTemplateColumns: `repeat(${opciones.length}, minmax(0, 1fr))`, gap: "6px" }}>
      {opciones.map((o) => {
        const estado = estadoDe(o.id);
        return (
          <button
            key={o.id}
            type="button"
            className={CANTO}
            {...{ [data]: o.id }}
            data-estado={estado}
            aria-disabled={!activa || undefined}
            onClick={() => activa && onElegir(o.id)}
            style={{
              minWidth: 0, minHeight: "44px", padding: "4px 6px", borderRadius: "10px", boxSizing: "border-box",
              fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: "16px", color: FAE.text,
              cursor: activa ? "pointer" : "default", overflowWrap: "anywhere",
              ...estiloBoton(estado), position: "relative",
            }}
          >
            {o.id === eraEsta && <EraEsta />}
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

/*
 * ═══════════ LA PARADA CALIFICADA (Haz, C2 de enganche.md) ═══════════
 *
 * Primer error: lo tocado queda como fantasma y sale la pista. Segundo error:
 * se enciende la correcta con el porqué de lo elegido, y «Siguiente» se
 * libera. Un acierto libera en el acto. El estado es JSON (se guarda en la
 * pestaña): `{ intentos, ok, ultimo, elegidas }`.
 */
export const PARADA_INICIAL = { ...HAZ_INICIAL, elegidas: [] };
export const paradaResuelta = hazResuelto;

export function responderParada(estado, id, correcta) {
  const e = estado ?? PARADA_INICIAL;
  if (hazResuelto(e)) return e;
  return { ...responderHaz(e, id === correcta), elegidas: [...(e.elegidas ?? []), id] };
}

/* El estado de cada botón de la parada. */
export function estadoEnParada(estado, correcta) {
  const e = estado ?? PARADA_INICIAL;
  const ultima = e.elegidas?.[e.elegidas.length - 1];
  return (id) => {
    if (e.ok && id === correcta) return ACIERTO;
    if (mostrarCorrecto(e) && id === correcta) return ACIERTO;
    if (!e.ok && id === ultima) return FANTASMA;
    return REPOSO;
  };
}

/*
 * La devolución de la parada, compacta para caber en el escenario: la misma
 * pastilla que `Veredicto` de la secuencia («Correcto» en blanco, «No va
 * aquí» en coral, nunca teal ni ámbar) y debajo la pista o el porqué, en
 * Inter 13/18. Lleva `data-mensaje` para la sonda de enganche.
 */
/*
 * ═══════════ LA MARCA DE LA CORRECTA AL SEGUNDO ERROR (Mai, volumen §5.5) ═══════════
 * Contorno blanco continuo (estiloBoton ACIERTO, sin relleno navy: ese es
 * ahora el color del canto) y la pastilla ✓ «Era esta», que se distingue sin
 * color de la elegida mal (coral discontinuo y ✕ «No va aquí»). Va colgada
 * del borde de abajo de la opción (sobre su canto), para no cambiarle el alto
 * ni salirse del escenario por arriba. «Era esta» es
 * literal nuevo de Mai: lo confirman Futaba y Shoko.
 */
export const ERA_ESTA = "Era esta";
export function EraEsta() {
  return (
    <span data-era-esta style={{
      position: "absolute", bottom: "-11px", left: "50%", transform: "translateX(-50%)", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "0 6px", borderRadius: "999px", border: `2px solid ${FAE.text}`, background: "#0E1B2E", color: FAE.text,
      fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "14px", whiteSpace: "nowrap", pointerEvents: "none",
    }}>
      <span aria-hidden="true">✓</span>{ERA_ESTA}
    </span>
  );
}
/* El id de la correcta cuando toca enseñarla (dos errores y ningún acierto), o null. */
export const eraEstaDe = (estado, correcta) => (mostrarCorrecto(estado ?? PARADA_INICIAL) ? correcta : null);

export function DevolucionParada({ estado, pista, porqueDe, acierto = null, chica = false }) {
  const e = estado ?? PARADA_INICIAL;
  if (!e.ultimo) return null;
  const ultima = e.elegidas?.[e.elegidas.length - 1];
  const ok = e.ultimo === "acierto";
  const color = ok ? FAE.text : FAE.coral;
  const texto = ok ? acierto : mostrarCorrecto(e) ? porqueDe(ultima) : pista;
  return (
    <div data-devolucion-parada data-mensaje={ok ? "acierto" : "error"} role="status">
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "6px", padding: chica ? "1px 8px" : "2px 9px", borderRadius: "999px",
        border: `2px solid ${color}`, color, fontFamily: INTER, fontSize: chica ? "12px" : "13px", fontWeight: 600, lineHeight: chica ? "16px" : "18px",
      }}>
        <span aria-hidden="true">{ok ? "✓" : "✕"}</span>{ok ? "Correcto" : "No va aquí"}
      </span>
      {texto && <p style={{ margin: chica ? "2px 0 0" : "4px 0 0", fontFamily: INTER, fontSize: chica ? "12px" : "13px", lineHeight: chica ? "16px" : "18px", color: "rgba(248,249,250,0.85)" }}>{texto}</p>}
    </div>
  );
}

/*
 * ═══════════ LA PARADA CON SU MODELO (piezas 2, 3 y 4) ═══════════
 *
 * Lo que la pregunta mira arriba (`arriba`: el hecho, la pregunta), la fila de
 * opciones, y debajo el modelo que se mueve con la respuesta junto a la
 * devolución (E2: la consecuencia queda al lado de lo que la causa). A 320 el
 * escenario no da para el modelo encima de la devolución: van lado a lado, y
 * la devolución va en 12/16 (`chica`).
 */
export function ParadaModelo({ estado, setEstado, opciones, correcta, pista, porqueDe, acierto = null, arriba = null, modelo = null, anchoModelo = 110 }) {
  const e = estado ?? PARADA_INICIAL;
  const resuelta = paradaResuelta(e);
  return (
    <MarcoFigura>
      <Escenario plano gap={6}>
        {arriba}
        <Fila
          opciones={opciones}
          estadoDe={estadoEnParada(e, correcta)}
          onElegir={(id) => setEstado(responderParada(e, id, correcta))}
          activa={!resuelta}
          data="data-parada"
          eraEsta={eraEstaDe(e, correcta)}
        />
        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "8px" }}>
          {modelo && <div data-modelo style={{ flex: `0 0 ${anchoModelo}px`, minWidth: 0 }}>{modelo}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <DevolucionParada chica={Boolean(modelo)} estado={e} pista={pista} porqueDe={porqueDe} acierto={acierto} />
          </div>
        </div>
      </Escenario>
    </MarcoFigura>
  );
}

/*
 * ═══════════ UN HAZ DE VARIOS ÍTEMS (a2 · 7, a3 · 8, a4 · 8) ═══════════
 *
 * Un ítem por paso (Mai §7 y §8): «Siguiente» da el paso. El estado guarda
 * una parada por ítem: `{ items: [parada, …] }`. La pantalla queda resuelta
 * cuando lo están todos.
 *
 * `SecuenciaAprender` da el paso aunque el ítem de ese paso no tenga
 * respuesta (queHaceSiguiente mira los pasos antes que la espera). Para que
 * nadie quede atascado con un ítem saltado, la figura enseña el primer ítem
 * sin resolver hasta el del paso: un ítem saltado vuelve antes que el
 * siguiente. ⛔ Lo limpio es que la secuencia espere al ítem del paso; eso
 * es de Erwin (anotado en el PR).
 */
export const itemsDe = (estado) => estado?.items ?? [];
export const itemsResueltos = (n) => (estado) => Array.from({ length: n }, (_, k) => paradaResuelta(itemsDe(estado)[k])).every(Boolean);
export function itemDelPaso(estado, paso, n) {
  const it = itemsDe(estado);
  const primero = Array.from({ length: n }, (_, k) => k).find((k) => !paradaResuelta(it[k])) ?? n - 1;
  return Math.max(0, Math.min(paso, primero, n - 1));
}
export function responderItem(estado, k, id, correcta) {
  const it = [...itemsDe(estado)];
  while (it.length <= k) it.push(PARADA_INICIAL);
  it[k] = responderParada(it[k], id, correcta);
  return { items: it };
}

/*
 * ═══════════ LA CAPA 4 · «EN UNA FRASE» ═══════════
 *
 * ⛔ EXCEPCIÓN DECLARADA de Mai (fichas/b-t1-titulares-medidos-mai.md §4),
 * PROVISIONAL HASTA #558. Las cuatro frases publicadas no caben con la
 * reserva de 184 a 320, y no se pueden recortar ni desplazar dentro de la
 * figura (Shoko, auditoría del #559: la cuarta frase y la devolución no se
 * leían). En esta pantalla, y solo en esta, NO HAY FIGURA (Mai, volumen
 * §1 · 11, que corrige su §4: ni la franja de 44): las cuatro frases enteras
 * y la devolución van en flujo, y la que se desplaza es la PANTALLA (Mai midió
 * 102 px a 320, ninguno a 375).
 *
 * `SecuenciaAprender` siempre pinta un <figure> con el alto reservado (#558) y
 * no se toca; por eso las frases llevan `data-capa4` y su propia regla
 * `:has()`, que suelta ese alto solo cuando las contiene.
 *
 * Las frases van apiladas (no en fila: son frases), con canto (se pulsan). La
 * pista del 1.er error es la devolución de lo tocado (`opcion.devolucion`, la
 * de la ficha); con el 2.º se enciende la correcta con el porqué de lo elegido.
 */
const CSS_CAPA4 = "figure.fae-sec-figura:has([data-capa4]) { height: auto !important; }";

export function FiguraFrase({ ficha, estado, setEstado }) {
  const e = estado ?? PARADA_INICIAL;
  const correcta = ficha.opciones.find((o) => o.correcta).id;
  const estadoDe = estadoEnParada(e, correcta);
  const resuelta = paradaResuelta(e);
  const devolucion = (id) => ficha.opciones.find((o) => o.id === id)?.devolucion?.texto ?? null;
  const ultima = e.elegidas?.[e.elegidas.length - 1];
  return (
    <div data-figura-t1 data-capa4 data-escenario data-frases style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <style>{CSS_FIGURAS_T1}{CSS_CAPA4}</style>
      {ficha.opciones.map((o) => (
        <button key={o.id} type="button" className={CANTO} data-frase={o.id} data-estado={estadoDe(o.id)} aria-disabled={resuelta || undefined}
          onClick={() => !resuelta && setEstado(responderParada(e, o.id, correcta))}
          style={{
            flex: "none", minHeight: "44px", padding: "6px 10px", borderRadius: "10px", boxSizing: "border-box", textAlign: "left",
            fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: FAE.text, cursor: resuelta ? "default" : "pointer",
            ...estiloBoton(estadoDe(o.id)), position: "relative",
          }}>
          {o.id === eraEstaDe(e, correcta) && <EraEsta />}
          {o.texto.texto}
        </button>
      ))}
      <DevolucionParada estado={e} pista={devolucion(ultima)} porqueDe={devolucion} acierto={devolucion(correcta)} />
    </div>
  );
}

/* La Figura de una pantalla de capa 4: la pantalla de la ficha, sin figura. */
export const figuraFrase = (ficha) => function FiguraCapa4(props) {
  return <FiguraFrase {...props} ficha={ficha} />;
};

/* Las opciones de una capa 4 que no traen devolución en la ficha (no se inventan: se anotan). */
export const sinDevolucion = (ficha) => ficha.opciones.filter((o) => !o.devolucion?.texto).map((o) => o.id);

/* Un botón que se toca para revelar algo (Míralo), con canto: claro al tocarlo (canto gris quieto), punteado si nunca se tocó. */
export function Tocable({ on = false, visto = false, children, style = {}, ...resto }) {
  return (
    <button type="button" aria-pressed={on} {...resto} className={CANTO} style={{
      minWidth: 0, minHeight: "44px", padding: "4px 8px", borderRadius: "10px", boxSizing: "border-box",
      fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: "16px", cursor: "pointer",
      color: on ? NAVY : FAE.text, background: on ? "#B8C4D4" : N2,
      border: on || visto ? "2px solid transparent" : "2px dashed rgba(248,249,250,.5)",
      ...(on ? { "--fae-canto": "#8C9BB0" } : {}),
      ...style,
    }}>
      {children}
    </button>
  );
}
