import { useCallback, useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import { cancelacion, alturaDe, referenciaDe, ALTO_COLUMNA } from "../../../contabilidad/cancelacion.js";
import { gradosDe } from "../../../contabilidad/balanza.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TRES VERBOS VISUALES DE CONTABILIDAD.
 *
 *   1. La ficha cae en una columna y el total cuenta hacia arriba.
 *   2. Las columnas se cancelan POR VALOR: la menor consume altura
 *      equivalente de la mayor y lo que queda en pie es el saldo.
 *   3. La balanza se inclina y se nivela según el registro.
 *
 * Viven aquí, en un solo archivo, porque el encargo pide que se vean IGUAL en
 * las piezas de Aprender, en las doce actividades y en el desafío. Eso no se
 * consigue describiendo el gesto tres veces: se consigue cuando es literalmente
 * el mismo componente. Si alguna superficie quisiera su propia versión de la
 * ficha que cae, el tema dejaría de sentirse como una sola cosa.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════ EL MOVIMIENTO, Y QUIEN NO LO QUIERE ═══════════════════ */

/*
 * Todo lo de este archivo se mueve, y moverse no es negociable para lo que
 * enseña: una ficha que aparece sin caer no muestra que algo pasó. Pero hay
 * quien marca en su sistema que prefiere no ver movimiento, y a esa persona se
 * le respeta: las mismas transiciones ocurren, en cero milisegundos. El estado
 * final es idéntico — nadie pierde información por apagar la animación.
 */
export function useMovimientoReducido() {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setReducido(consulta.matches);
    leer();
    consulta.addEventListener?.("change", leer);
    return () => consulta.removeEventListener?.("change", leer);
  }, []);
  return reducido;
}

/**
 * Un número que cuenta hasta su valor en vez de aparecer puesto.
 *
 * Es el primer verbo dicho en cifras: cuando la ficha cae, el total de esa
 * columna SUBE, y verlo subir es lo que conecta la ficha con el total. Un
 * número que salta de 1.000 a 1.500 no dice que se sumaron 500.
 */
export function useNumeroQueSube(valor, ms = 420) {
  const reducido = useMovimientoReducido();
  const [visible, setVisible] = useState(valor);
  const desde = useRef(valor);
  const raf = useRef(0);

  useEffect(() => {
    if (reducido || ms <= 0) { desde.current = valor; setVisible(valor); return undefined; }
    const inicio = performance.now();
    const salida = desde.current;
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / ms);
      /* Frena al final: el número se posa en su sitio en vez de chocar. */
      const suave = 1 - (1 - t) ** 3;
      setVisible(Math.round(salida + (valor - salida) * suave));
      if (t < 1) raf.current = requestAnimationFrame(paso);
      else desde.current = valor;
    };
    raf.current = requestAnimationFrame(paso);

    /*
     * ═══════════ Y UNA RED POR DEBAJO DEL requestAnimationFrame ═══════════
     *
     * El navegador NO llama a requestAnimationFrame mientras la página está
     * oculta. Si el total cambia justo cuando el estudiante se fue a otra
     * aplicación, la animación no arranca, y al volver se encuentra el número
     * congelado en el valor viejo —o en cero— mientras todo lo demás ya dice
     * otra cosa. Salió mirándolo: el colector de El Asiento Compuesto marcaba
     * $0 con los cuatro valores escritos y el conector cerrado.
     *
     * El temporizador sí corre con la página oculta, así que se deja uno de
     * red: cuando la animación debería haber terminado, el valor final queda
     * puesto pase lo que pase. Si el rAF corrió, no cambia nada —ya estaba—.
     */
    const red = setTimeout(() => { desde.current = valor; setVisible(valor); }, ms + 40);

    return () => { cancelAnimationFrame(raf.current); clearTimeout(red); };
  }, [valor, ms, reducido]);

  return visible;
}

/* ═══════════════════ EL GESTO: ARRASTRAR, TOCAR O TECLEAR ═══════════════════ */

/*
 * ═══════════ UNA SOLA MÁQUINA DE ESTADOS PARA LAS TRES FORMAS ═══════════
 *
 * El encargo pide arrastrar. Arrastrar solo, sin embargo, deja fuera a quien
 * navega con teclado, a quien usa un lector de pantalla y a quien sencillamente
 * no acierta a soltar en el sitio. El sitio ya resolvió esto una vez —el
 * volante de Política Monetaria se gira con el dedo Y trae una barra debajo
 * que hace lo mismo— y aquí se sigue la misma regla.
 *
 * La solución es que las tres formas sean LA MISMA operación:
 *
 *   tomar una ficha  →  soltarla en un destino
 *
 * Tocar la ficha la toma. Arrastrarla también la toma, y además la lleva
 * pegada al dedo. Soltar encima de un destino la deja ahí; soltar en el vacío
 * la deja tomada, que es exactamente donde queda si se tocó. Y como la ficha y
 * los destinos son botones de verdad, el teclado y el lector de pantalla
 * funcionan sin nada más.
 *
 * Por eso no hay «modo arrastre» y «modo toque»: hay un estado —qué está
 * tomado— y tres maneras de moverlo.
 */
/* Cuánto hay que mover el dedo para que un toque se convierta en arrastre. */
export const UMBRAL_ARRASTRE = 8;

/* Texto que solo existe para el lector de pantalla, sin ocupar la pantalla. */
export const SOLO_LECTOR = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

export function useArrastre({ onSoltar } = {}) {
  const [tomada, setTomada] = useState(null);
  const [puntero, setPuntero] = useState(null);
  const arrastrando = useRef(false);
  const origen = useRef(null);
  const huboArrastre = useRef(false);

  const soltarEn = useCallback((destino) => {
    if (tomada == null) return;
    const ficha = tomada;
    setTomada(null);
    setPuntero(null);
    onSoltar?.(ficha, destino);
  }, [tomada, onSoltar]);

  /* Tomar y soltar sin arrastrar: dos toques, o dos Enter. */
  const alternar = useCallback((ficha) => {
    setTomada((actual) => (actual === ficha ? null : ficha));
    setPuntero(null);
  }, []);

  /*
   * ═══════════ EL ARRASTRE EMPIEZA AL MOVERSE, NO AL TOCAR ═══════════
   *
   * Esto salió probándolo en el navegador y no diseñándolo. Un toque en una
   * pantalla dispara pointerdown, pointerup Y DESPUÉS click. Si el pointerdown
   * tomaba la ficha, el click que venía detrás la soltaba: tocar la ficha no
   * hacía absolutamente nada, y el camino accesible —el que no exige arrastrar—
   * estaba roto sin que ninguna prueba se enterara.
   *
   * Así que el arrastre no empieza al tocar: empieza cuando el dedo SE MUEVE
   * más de un umbral. Por debajo de eso es un toque, y lo atiende el click.
   * Y cuando sí hubo arrastre, se marca para que el click posterior se ignore.
   */
  const gestos = useCallback((ficha) => ({
    onPointerDown: (e) => {
      origen.current = { x: e.clientX, y: e.clientY };
      huboArrastre.current = false;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e) => {
      if (!origen.current) return;
      const lejos = Math.hypot(e.clientX - origen.current.x, e.clientY - origen.current.y) > UMBRAL_ARRASTRE;
      if (!lejos && !arrastrando.current) return;
      if (!arrastrando.current) {
        arrastrando.current = true;
        huboArrastre.current = true;
        setTomada(ficha);
      }
      setPuntero({ x: e.clientX, y: e.clientY });
    },
    onPointerUp: (e) => {
      origen.current = null;
      if (!arrastrando.current) return;
      arrastrando.current = false;
      const bajo = typeof document !== "undefined"
        ? document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-destino]")
        : null;
      if (bajo) soltarEn(bajo.getAttribute("data-destino"));
      else setPuntero(null);
    },
    onPointerCancel: () => { origen.current = null; arrastrando.current = false; setPuntero(null); },
  }), [soltarEn]);

  /* El toque, que es también lo que hace Enter sobre la ficha enfocada. */
  const tocar = useCallback((ficha) => {
    if (huboArrastre.current) { huboArrastre.current = false; return; }
    alternar(ficha);
  }, [alternar]);

  const limpiar = useCallback(() => {
    setTomada(null); setPuntero(null);
    origen.current = null; arrastrando.current = false; huboArrastre.current = false;
  }, []);

  return { tomada, puntero, gestos, tocar, alternar, soltarEn, limpiar };
}

/* ═══════════════════ VERBO 1 · LA FICHA QUE CAE ═══════════════════ */

const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

const CSS_VERBOS = `
@keyframes fae-cae { from { opacity: 0; transform: translateY(-34px) scale(0.94); } to { opacity: 1; transform: none; } }
.fae-cae { animation: fae-cae 380ms cubic-bezier(.26,.84,.38,1) both; }
@media (prefers-reduced-motion: reduce) { .fae-cae { animation-duration: 1ms !important; } }
`;

/** El CSS de los tres verbos. Va una vez por pantalla, como CSS_JUEGO. */
export const EstilosDeVerbos = () => <style>{CSS_VERBOS}</style>;

/**
 * Una ficha de valor: el objeto que se arrastra, cae y se cancela.
 *
 * `tomada` la levanta; `consumido` la come de abajo hacia arriba —es la
 * cancelación por valor vista en una sola ficha—; `cae` la hace entrar cayendo.
 */
/*
 * ═══════════ EL PISO DE ALTURA, Y POR QUÉ ES TAN BAJO ═══════════
 *
 * La regla del verbo es que la altura sea PROPORCIONAL al monto, y cualquier
 * piso la rompe para los montos pequeños. Así que el piso se puso por debajo
 * de todo lo que existe en el capítulo: la ficha más baja de los dos casos son
 * los $10.000 de la Caja de Caleja contra una referencia de $300.000, y miden
 * 4,9 px. Con el piso en cuatro, NINGUNA ficha real lo toca — la proporción es
 * exacta en todo lo que un estudiante va a ver, y hay una prueba que lo exige.
 *
 * El piso existe solo para que un monto absurdamente pequeño se dibuje como
 * una raya fina en vez de como nada. Desaparecer no es proporcional: es mentir.
 */
export const PISO_FICHA = 4;

/* Por debajo de esto no cabe una cifra, y se dibuja sin texto. El lector de
 * pantalla la sigue anunciando: lo que se pierde es el hueco, no el dato. */
const MINIMO_PARA_TEXTO = 18;

/*
 *  reemplaza la cifra cuando la ficha no es un monto sino un nombre —el
 * balance de ¿De qué familia es? mueve cuentas, no pesos—. Es la misma ficha,
 * el mismo gesto y la misma caída: lo único que cambia es qué lleva escrito.
 */
export function Ficha({
  valor, lado = DEBE, tomada = false, consumido = 0, cae = false,
  alto = null, etiqueta = null, onClick = null, gestos = null, deshabilitada = false,
  texto = null, color: colorPedido = null,
}) {
  const color = colorPedido ?? COLOR_LADO[lado];
  const comida = Math.max(0, Math.min(1, consumido));
  const Elemento = onClick || gestos ? "button" : "div";
  const conTexto = alto == null || alto >= MINIMO_PARA_TEXTO;

  return (
    <Elemento
      type={Elemento === "button" ? "button" : undefined}
      disabled={Elemento === "button" ? deshabilitada : undefined}
      onClick={onClick ?? undefined}
      aria-label={etiqueta ?? (texto ?? `${pesos(valor)} ${lado === DEBE ? "al debe" : "al haber"}`)}
      aria-pressed={onClick ? tomada : undefined}
      data-ficha={texto ?? valor}
      data-consumido={comida}
      className={cae ? "fae-cae" : undefined}
      {...(gestos ?? {})}
      style={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        boxSizing: "border-box", width: "100%",
        height: alto != null ? `${Math.max(alto, PISO_FICHA)}px` : undefined,
        padding: alto != null ? 0 : "8px 12px",
        borderRadius: "9px", overflow: "hidden",
        background: `${color}${tomada ? "3A" : "22"}`,
        border: `1px solid ${tomada ? FAE.text : color}`,
        color: FAE.text, ...CIFRA, fontSize: "13px", fontWeight: 600,
        /*
         * Una ficha gastada TIENE que verse gastada. Sin esto, el nombre ya
         * puesto en una cuenta seguía en el banco con el mismo aspecto que
         * los disponibles: no se podía tomar, y nada lo decía. Se vio
         * mirándolo, no leyéndolo.
         */
        opacity: deshabilitada ? 0.38 : 1,
        cursor: deshabilitada ? "default" : (gestos ? "grab" : onClick ? "pointer" : "default"),
        touchAction: gestos ? "none" : undefined,
        transform: tomada ? "scale(1.04)" : "none",
        boxShadow: tomada ? `0 6px 18px rgba(0,0,0,0.45)` : "none",
        transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
      }}
    >
      {/*
        Lo consumido se tapa desde ABAJO, que es por donde se come la
        cancelación. Una ficha mordida a medias se ve mordida a medias.
      */}
      {comida > 0 && (
        <span
          aria-hidden="true"
          data-comido
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            height: `${comida * 100}%`,
            background: "rgba(10,20,34,0.82)",
            borderTop: comida < 1 ? `1px dashed ${color}88` : "none",
            transition: "height 420ms cubic-bezier(.4,0,.2,1)",
          }}
        />
      )}
      {conTexto && (
        <span style={{ position: "relative", opacity: comida >= 1 ? 0.28 : 1, lineHeight: 1.3 }}>{texto ?? pesos(valor)}</span>
      )}
    </Elemento>
  );
}

/** El fantasma que sigue al dedo mientras se arrastra. */
export function FichaEnVuelo({ valor, lado, puntero, texto = null, color = null }) {
  if (!puntero) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", left: puntero.x, top: puntero.y, zIndex: 60,
        transform: "translate(-50%, -50%)", width: texto ? "150px" : "92px", pointerEvents: "none",
      }}
    >
      <Ficha valor={valor} lado={lado} texto={texto} color={color} tomada />
    </div>
  );
}

/* ═══════════════════ VERBO 2 · LAS COLUMNAS QUE SE CANCELAN ═══════════════════ */

/**
 * Una cuenta T con sus dos lados como COLUMNAS DE VALOR: cada ficha mide lo
 * que vale, no lo mismo que las demás.
 *
 *   debitos, creditos  [{ valor }]
 *   cancelar           true para consumir y dejar en pie el saldo
 *   destinos           true para que los dos lados reciban fichas
 *   recien             el valor que acaba de caer, para que entre cayendo
 */
/*
 * ═══════════ EL ▲ Y LAS SEÑALES REDUNDANTES ═══════════
 *
 * `triangulo` marca el lado por el que ESA cuenta crece, y no es decoración:
 * es la regla del capítulo codificada de forma permanente en la cuenta.
 *
 * Va apagado por defecto, y eso importa: en la pieza de Aprender está siempre
 * visible porque ahí se está enseñando la regla; en las doce actividades
 * saldría regalando la respuesta, así que solo aparece al corregir. Quien lo
 * pide decide cuándo.
 *
 * `flechas` añade ← y → a los rótulos, y `tonoRotulo` permite subirles el
 * contraste sin tocar el teal y el ámbar de marca, que siguen mandando en
 * rellenos e iconos. Los dos también apagados por defecto: lo que ya está
 * construido no cambia de aspecto porque una pieza nueva necesite más.
 */
export function CuentaDeValor({
  cuenta, debitos = [], creditos = [], cancelar = false, destinos = false,
  recien = null, tomada = null, alto = ALTO_COLUMNA, resaltar = null, onSoltar = null,
  triangulo = null, flechas = false, tonoRotulo = null, sub = null,
}) {
  const c = cancelacion(debitos, creditos);
  const referencia = referenciaDe(debitos, creditos);
  const totalDebe = useNumeroQueSube(c.totalDebe);
  const totalHaber = useNumeroQueSube(c.totalHaber);

  const columna = (lado, fichas, total) => {
    const atenuado = resaltar && resaltar !== lado ? 0.4 : 1;
    const Marco = destinos ? "button" : "div";
    return (
      <Marco
        type={destinos ? "button" : undefined}
        data-destino={destinos ? lado : undefined}
        data-columna={lado}
        aria-label={destinos ? `Soltar en el ${lado === DEBE ? "debe" : "haber"}` : undefined}
        /*
         * El destino atiende el TOQUE además del arrastre. Sin esto la
         * columna se ilumina al tomar la ficha y no recibe nada al tocarla:
         * el camino accesible se queda a medio hacer, que es peor que no
         * ofrecerlo. Salió probándolo, no leyéndolo.
         */
        onClick={destinos && onSoltar ? () => onSoltar(lado) : undefined}
        style={{
          flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
          justifyContent: "flex-end", gap: "3px",
          padding: "6px", borderRadius: "10px", opacity: atenuado,
          background: destinos && tomada != null ? `${COLOR_LADO[lado]}14` : "transparent",
          border: destinos
            ? `1px dashed ${tomada != null ? COLOR_LADO[lado] : "rgba(248,249,250,0.18)"}`
            : "1px solid transparent",
          minHeight: `${alto + 12}px`,
          cursor: destinos ? "pointer" : "default",
          transition: "background 180ms ease, border-color 180ms ease, opacity 220ms ease",
        }}
      >
        {/*
          El ▲ va ENCIMA del rótulo del lado por el que la cuenta crece. Es
          una señal de FORMA, no de color: sobrevive a quien no distingue el
          teal del ámbar, que es justo para quien las otras señales se le
          quedan en menos.
        */}
        <span
          data-triangulo={triangulo === lado ? lado : undefined}
          aria-hidden="true"
          style={{
            height: "11px", lineHeight: "11px", fontSize: "10px", textAlign: "center",
            color: COLOR_LADO[lado],
          }}
        >
          {triangulo === lado ? "▲" : ""}
        </span>
        {/*
          El glifo se le oculta al lector de pantalla —«triángulo apuntando
          hacia arriba» no es información— y en su lugar va la frase que sí lo
          es. Un símbolo que solo significa algo mirándolo no está dicho.
        */}
        {triangulo === lado && <span style={SOLO_LECTOR}>Esta cuenta crece por aquí.</span>}
        <span data-rotulo={lado} style={{
          fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.14em", color: tonoRotulo?.[lado] ?? COLOR_LADO[lado], textAlign: "center",
        }}>
          {flechas && lado === DEBE ? "← " : ""}
          {lado === DEBE ? "DEBE" : "HABER"}
          {flechas && lado === HABER ? " →" : ""}
        </span>
        <span style={{ flex: 1 }} />
        {fichas.length === 0
          ? <span style={{ ...CIFRA, fontSize: "12px", color: "rgba(248,249,250,0.3)", textAlign: "center" }}>—</span>
          : fichas.map((f, k) => (
            <Ficha
              key={`${lado}-${k}`}
              valor={f.valor}
              lado={lado}
              alto={alturaDe(f.valor, referencia, alto)}
              consumido={cancelar ? f.consumido : 0}
              cae={recien != null && k === fichas.length - 1 && f.valor === recien}
            />
          ))}
        <span data-total={lado} style={{
          ...CIFRA, fontSize: "12.5px", fontWeight: 700, color: COLOR_LADO[lado],
          textAlign: "center", borderTop: `1px solid ${COLOR_LADO[lado]}44`, paddingTop: "5px", marginTop: "4px",
        }}>
          {pesos(total)}
        </span>
      </Marco>
    );
  };

  return (
    <div
      data-cuenta-valor={cuenta}
      style={{
        padding: "12px 13px", borderRadius: "14px",
        background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
      }}
    >
      <p style={{
        margin: sub ? "0 0 1px" : "0 0 9px", fontFamily: "Sora, sans-serif", fontWeight: 700,
        fontSize: "14px", color: FAE.text, textAlign: "center",
      }}>
        {cuenta}
      </p>
      {/*
        De quién es esta cuenta, cuando hace falta decirlo. En «El Saldo de la
        Cuenta» hay tres que se llaman «Caja» —la del ejemplo del capítulo, la
        de Caleja y la del lavado— con movimientos distintos las tres: sin la
        empresa debajo serían tres preguntas escritas exactamente igual.
      */}
      {sub && (
        <p data-sub={sub} style={{
          margin: "0 0 9px", fontSize: "10.5px", color: "rgba(248,249,250,0.5)", textAlign: "center",
        }}>
          {sub}
        </p>
      )}
      <div style={{ display: "flex", gap: "10px", borderTop: "1px solid rgba(248,249,250,0.22)", paddingTop: "9px" }}>
        {columna(DEBE, c.debe, totalDebe)}
        <div aria-hidden="true" style={{ width: "1px", background: "rgba(248,249,250,0.22)" }} />
        {columna(HABER, c.haber, totalHaber)}
      </div>
      {cancelar && c.lado && (
        <div
          data-saldo={c.saldo}
          style={{
            display: "flex", justifyContent: c.lado === DEBE ? "flex-start" : "flex-end",
            borderTop: "1px solid rgba(248,249,250,0.22)", marginTop: "9px", paddingTop: "8px",
          }}
        >
          <span style={{ ...CIFRA, fontWeight: 700, fontSize: "14px", color: COLOR_LADO[c.lado] }}>
            {pesos(c.saldo)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ VERBO 3 · LA BALANZA ═══════════════════ */

/**
 * La ecuación contable donde se puede ver. La viga gira lo que diga
 * `inclinacion` (−1 a 1) y los dos platillos suben y bajan con ella.
 */
/*
 * ═══════════ EL PLATILLO QUE RECIBE ═══════════
 *
 * `destino` convierte UNO de los dos platillos en sitio donde soltar: el
 * liviano, en «¿Cuadra o no cuadra?». Es el mismo trato que las columnas de
 * CuentaDeValor —botón con `data-destino`, y `onClick` además del arrastre—
 * porque el camino accesible ya se rompió una vez en silencio por no tenerlo.
 */
export function Balanza({
  inclinacion = 0, izquierda = null, derecha = null, etiqueta = null,
  destino = null, tomada = null, onSoltar = null,
}) {
  const grados = gradosDe(inclinacion);
  const recta = grados === 0;
  const color = recta ? FAE.teal : FAE.ambar;
  const caida = (grados / 11) * 15;

  return (
    <div
      data-balanza={grados}
      data-nivelada={recta ? "si" : "no"}
      role="img"
      aria-label={etiqueta ?? (recta ? "La balanza está nivelada" : "La balanza está inclinada")}
      style={{ padding: "6px 4px 2px" }}
    >
      <div style={{ position: "relative", height: "62px" }}>
        {/* La viga. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", left: "8%", right: "8%", top: "16px", height: "3px",
            borderRadius: "999px", background: color,
            transform: `rotate(${grados}deg)`, transformOrigin: "50% 50%",
            transition: "transform 520ms cubic-bezier(.34,1.2,.5,1), background 300ms ease",
          }}
        />
        {/* El fiel. */}
        <div aria-hidden="true" style={{
          position: "absolute", left: "50%", top: "17px", width: "2px", height: "30px",
          marginLeft: "-1px", background: "rgba(248,249,250,0.3)",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", left: "50%", bottom: "6px", width: "44px", height: "3px",
          marginLeft: "-22px", borderRadius: "999px", background: "rgba(248,249,250,0.3)",
        }} />
        {/* Los dos platillos, que suben y bajan con la viga. */}
        {[["izquierda", izquierda, 1], ["derecha", derecha, -1]].map(([donde, contenido, signo]) => {
          const lado = donde === "izquierda" ? DEBE : HABER;
          const recibe = destino === lado;
          const Marco = recibe ? "button" : "div";
          return (
            <Marco
              key={donde}
              type={recibe ? "button" : undefined}
              data-platillo={donde}
              data-destino={recibe ? lado : undefined}
              aria-label={recibe ? `Soltar en el platillo del ${lado === DEBE ? "debe" : "haber"}` : undefined}
              onClick={recibe && onSoltar ? () => onSoltar(lado) : undefined}
              style={{
                position: "absolute", top: `${18 + signo * caida}px`,
                [donde === "izquierda" ? "left" : "right"]: "6%",
                minWidth: "70px", textAlign: "center", padding: 0,
                background: "transparent", border: "none",
                cursor: recibe ? "pointer" : "default",
                transition: "top 520ms cubic-bezier(.34,1.2,.5,1)",
              }}
            >
              <div aria-hidden="true" style={{ width: "1px", height: "12px", margin: "0 auto", background: "rgba(248,249,250,0.28)" }} />
              <div style={{
                padding: "4px 8px", borderRadius: "8px",
                background: recibe && tomada != null ? `${COLOR_LADO[lado]}1F` : "rgba(10,20,34,0.6)",
                border: recibe
                  ? `1px dashed ${tomada != null ? COLOR_LADO[lado] : "rgba(248,249,250,0.35)"}`
                  : `1px solid ${COLOR_LADO[lado]}66`,
                ...CIFRA, fontSize: "12px", fontWeight: 700,
                color: COLOR_LADO[lado],
                transition: "background 180ms ease, border-color 180ms ease",
              }}>
                {contenido}
              </div>
            </Marco>
          );
        })}
      </div>
    </div>
  );
}
