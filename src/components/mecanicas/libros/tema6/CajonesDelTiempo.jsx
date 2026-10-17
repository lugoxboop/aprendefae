import { useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import {
  T6_ACT6, GRUPOS_T6_ACT6, PARTES_T6_ACT6, PIES_T6_ACT6, ESCENARIO_T6_ACT6, ROTULOS_TOTAL_T6_ACT6,
} from "../../../../data/contabilidadT6Act6.js";
import { pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import { pesos } from "../../../../data/contabilidad.js";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, BORDES } from "./MaquinaPegada.jsx";
import { Entra, KEYFRAMES_ENTRA } from "./CuentaQueSeLlena.jsx";
import { CORRECTA, TACHADA, REVELADA } from "../b5/MarcasE4.jsx";
import { Pastilla, PALABRA_B, TEXTO_B, CORAL_B, ACIERTO_B } from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a6 «PROVISIÓN POR EDADES» · LOS CAJONES DEL TIEMPO Y LA PORCIÓN QUE
 * NO SE COBRA (hoja 2 de Mai, calidad).
 *
 * El visual de la actividad, encima de la casilla, y su registro:
 *   · la nota y la tabla de la regla, con su pie (rótulo y fuente del
 *     porcentaje), como en calidad 1;
 *   · parte 1: bajo la tabla, el eje de los cajones (22 · 22 · 28 · 28 %, con
 *     las marcas «3 meses», «6 meses» y «1 año»). El último cajón, «más de 1
 *     año», queda ABIERTO: sin borde derecho, sus bordes se desvanecen; ningún
 *     tope que el libro no pone (Shoko). La deuda de la casilla espera
 *     ENCIMA del eje, siempre en el mismo sitio y sin palito: su posición no
 *     puede delatar el grupo (Shoko). Al responder cae en su cajón CORRECTO
 *     (320 ms; con movimiento reducido, ya dentro), del todo dentro de él:
 *     «6 meses» queda en «Más de 3 hasta 6 meses» sin tocar la marca;
 *   · parte 2: cada fila gana una barra del mismo largo, con la porción
 *     provisionada rellena al final (5, 10 y 15 % del largo) y la provisión
 *     del grupo, que entra al responder. En la casilla 7 aparece la fila
 *     del total con su barra y su porción (la provisión) y, debajo, «El
 *     valor neto» y «La provisión» (lote 3: antes de la 7, ni la fila).
 *
 * LOTE 6c (hoja «Enganche B1-B5» de Mai): en las casillas 1 a 3, los cajones
 * del eje SON las opciones. Sale la lista de cuatro rangos; se toca el cajón
 * donde cae la deuda. El eje pasa a 44 de alto y cada cajón es un botón con
 * el nombre de su grupo («Grupo 1: vigentes o hasta 3 meses»…). «6 meses» se
 * responde tocando a un lado o al otro de la marca de 6. E4: el tocado por
 * error queda marcado y el correcto también (ver lote 6d, abajo); la deuda cae
 * en el correcto.
 *
 * LOTE 6d (estándar único de Hacer): el cajón tocado por error, 2 px coral y
 * «No va aquí»; el correcto, 2 px #F8F9FA y «Correcto» si se tocó, o «Iba
 * aquí» (0,7 s después) si no. Los cajones miden 57 a 72 px a 320 y la
 * pastilla no cabe dentro: va en la franja de encima del eje, donde esperaba
 * la deuda (ya cayó), alineada con su cajón; si hay dos y no caben en sus
 * sitios, se acercan sin montarse. La palabra entra en el nombre accesible
 * del cajón. Sin relleno navy: lo activo es solo el borde de 2 #F8F9FA.
 *
 * Lo que entra es siempre el valor correcto. En blanco y negro: los cajones
 * se leen por sus marcas y su orden; la porción es relleno y el resto
 * contorno; lo activo, por el borde de 2 y el relleno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BORDE = "rgba(248,249,250,0.14)";
const BORDE_TENUE = "rgba(248,249,250,0.08)";
const BORDE_FUERTE = "rgba(248,249,250,0.32)";
const TENUE = "rgba(203,220,242,0.12)";
const LINEA_PIE = { margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px" };
const NOMBRE = { fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, color: TEXTO };
const CIFRA = { fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: TEXTO };
const PEQUENO = { fontFamily: INTER, fontSize: "12px", lineHeight: "16px" };

const correcta = (c) => c.opciones.find((o) => o.tipo === null);
/* Tras los dos puntos, el nombre del grupo va en minúscula (Shoko). */
const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);

/* ═══════════ EL EJE DE LOS CAJONES (parte 1) ═══════════ */

const ANCHOS = [22, 22, 28, 28];
const BORDES_EJE = ANCHOS.reduce((xs, a) => [...xs, xs[xs.length - 1] + a], [0]); // 0 · 22 · 44 · 72 · 100
/* Las marcas, con las palabras de los nombres de los grupos: «3 meses», «6 meses», «1 año». */
const MARCAS = GRUPOS_T6_ACT6.slice(0, 3).map((g, k) => ({ en: BORDES_EJE[k + 1], texto: g.nombre.match(/(\d+ (meses|año))$/)[1] }));
const centroDe = (k) => BORDES_EJE[k] + ANCHOS[k] / 2;
/* La deuda de la casilla; el ejemplo de «Así se juega» la trae escrita (su enunciado dice «nueve meses»). */
const deudaDe = (c) => c.deuda ?? c.enunciado.match(/(\d+) meses/)[0];
/* El cajón correcto de una deuda: el del grupo de su opción correcta. */
const cajonDe = (c) => GRUPOS_T6_ACT6.findIndex((g) => g.nombre === correcta(c).texto);

const ALTO_PASTILLA = 24;
/* La deuda espera encima del eje, separada de él: nunca sobre sus meses. */
const TOPE_BARRA = ALTO_PASTILLA + 10;
const ULTIMO = GRUPOS_T6_ACT6.length - 1;
/* El borde que se desvanece, arriba y abajo del último cajón: queda abierto. */
const DESVANECE = `linear-gradient(to right, ${BORDES}, transparent)`;
const ALTO_BARRA = 44;

/*
 * Entre dos rótulos del eje, 8 px como mínimo (Sakuta). Si no caben (a 320,
 * «3 meses» y «6 meses» quedaban a 5,5 px), el rótulo del medio baja a una
 * segunda línea, escalonado, sin cambiar el texto. Se mide en vivo: con las
 * fuentes cargadas y con cada cambio de ancho.
 */
const SEPARACION_MINIMA = 8;
const LINEA_MARCA = 16;
function useEscalonado() {
  const marcas = useRef([]);
  const [escalonado, setEscalonado] = useState(false);
  useLayoutEffect(() => {
    const medir = () => {
      const rs = marcas.current.map((m) => m?.getBoundingClientRect()).filter(Boolean);
      if (rs.length < 2) return;
      const huecos = rs.slice(1).map((r, k) => r.left - rs[k].right);
      setEscalonado(huecos.some((h) => h < SEPARACION_MINIMA));
    };
    medir();
    let vivo = true;
    document.fonts?.ready?.then(() => { if (vivo) medir(); });
    window.addEventListener("resize", medir);
    return () => { vivo = false; window.removeEventListener("resize", medir); };
  }, []);
  return { marcas, escalonado };
}

function Eje({ respondidas, abierta, reducido, eleccion = null, casillas }) {
  const { marcas, escalonado } = useEscalonado();
  const actual = abierta ?? respondidas - 1;
  /* Lote 6c: con `eleccion`, los cajones son las opciones de la casilla abierta. */
  const casilla = casillas[actual];
  const elegidoK = eleccion?.elegida ? GRUPOS_T6_ACT6.findIndex((g) => g.nombre === eleccion.elegida.texto) : -1;
  const marcaDe = (k) => {
    if (!eleccion?.elegida) return null;
    if (k === cajonDe(casilla)) return k === elegidoK ? CORRECTA : REVELADA;
    return k === elegidoK ? TACHADA : null;
  };
  const palabraDe = { [CORRECTA]: PALABRA_B.correcto, [TACHADA]: PALABRA_B.noVaAqui, [REVELADA]: PALABRA_B.ibaAqui };
  const marcados = GRUPOS_T6_ACT6.map((g, k) => k).filter((k) => marcaDe(k));
  return (
    <div data-eje {...(abierta !== null ? { "data-renglon-activo": "" } : {})} data-escalonado={escalonado ? "si" : "no"} style={{ position: "relative", height: `${TOPE_BARRA + ALTO_BARRA + 4 + LINEA_MARCA * (escalonado ? 2 : 1)}px`, margin: "4px 0 12px" }}>
      {/* La barra, partida en cuatro cajones. */}
      <div style={{ position: "absolute", top: `${TOPE_BARRA}px`, left: 0, right: 0, height: `${ALTO_BARRA}px`, display: "flex" }}>
        {GRUPOS_T6_ACT6.map((g, k) => {
          const tiene = casillas.some((c, i) => i < respondidas && cajonDe(c) === k);
          /* El cajón de la deuda recién respondida se ilumina; los que ya tienen una deuda quedan con fondo tenue. */
          const recien = abierta === null && cajonDe(casillas[actual]) === k;
          const marca = marcaDe(k);
          const Etiqueta = eleccion ? "button" : "div";
          const opcion = eleccion ? casilla.opciones.find((o) => o.texto === g.nombre) : null;
          return (
            <Etiqueta key={g.id} data-cajon={g.id} data-con-deuda={tiene ? "si" : "no"} {...(k === ULTIMO ? { "data-abierto": "" } : {})}
              {...(eleccion ? {
                type: "button", "aria-label": `Grupo ${k + 1}: ${minuscula(g.nombre)}${marca ? `. ${palabraDe[marca]}` : ""}`, "data-marca-e4": marca ?? "",
                disabled: !eleccion.elegir, onClick: () => eleccion.elegir?.(opcion),
              } : {})}
              style={{
              position: "relative", padding: 0, margin: 0, font: "inherit", color: "inherit", cursor: eleccion?.elegir ? "pointer" : "default",
              borderTop: "none", borderRight: "none", borderBottom: "none",
              width: `${ANCHOS[k]}%`, boxSizing: "border-box", borderLeft: `1px solid ${BORDES}`,
              ...(k === ULTIMO
                ? { borderRight: "none", backgroundImage: `${DESVANECE}, ${DESVANECE}`, backgroundSize: "100% 1px", backgroundPosition: "top, bottom", backgroundRepeat: "no-repeat" }
                : { borderTop: `1px solid ${BORDES}`, borderBottom: `1px solid ${BORDES}` }),
              borderRadius: k === 0 ? "6px 0 0 6px" : 0,
              /* Lote 6d: sin relleno navy; el activo y el correcto, 2 px #F8F9FA; el tocado por error, 2 px coral. */
              backgroundColor: !recien && tiene ? TENUE : "transparent",
              boxShadow: marca === TACHADA ? `inset 0 0 0 2px ${CORAL_B}` : recien || marca ? `inset 0 0 0 2px ${TEXTO_B}` : "none",
            }}>
              {/* La clave de la opción, como en las casillas de siempre (la sonda y el guion la buscan así). */}
              {eleccion && <span data-opcion={g.nombre} aria-hidden="true" />}
              {marca && <span data-marca-cajon={marca} hidden />}
            </Etiqueta>
          );
        })}
      </div>
      {/* Lote 6d: las pastillas, en la franja de encima del eje, alineadas con su cajón (la palabra ya está en el nombre del cajón). */}
      {marcados.length > 0 && <FranjaDePastillas marcados={marcados} marcaDe={marcaDe} />}
      {/* Las marcas, bajo los bordes interiores. */}
      {/* Medidos siempre en la primera línea: el escalón del medio va por transform, que no mueve su caja de medida. */}
      {MARCAS.map((m, k) => (
        <span key={m.texto} ref={(n) => { marcas.current[k] = n; }} data-marca style={{
          position: "absolute", top: `${TOPE_BARRA + ALTO_BARRA + 4}px`, left: `${m.en}%`,
          transform: `translateX(-50%)${escalonado && k === 1 ? ` translateY(${LINEA_MARCA}px)` : ""}`,
          ...PEQUENO, color: SECUNDARIO, whiteSpace: "nowrap",
        }}>{m.texto}</span>
      ))}
      {/* Las deudas: las ya ubicadas, en su cajón; la de la casilla, como pastilla sobre su mes, y al responder, cae. */}
      {casillas.map((c, i) => {
        if (i > actual) return null;
        const enCajon = i < respondidas;
        const k = cajonDe(c);
        const anterior = enCajon && i !== actual;
        return (
          <span key={c.id} data-deuda={c.id} data-en-cajon={enCajon ? GRUPOS_T6_ACT6[k].id : ""} style={{
            position: "absolute", height: `${ALTO_PASTILLA}px`, boxSizing: "border-box", padding: enCajon ? "4px 0" : "2px 6px", borderRadius: "999px",
            top: enCajon ? `${TOPE_BARRA + (ALTO_BARRA - ALTO_PASTILLA) / 2}px` : 0,
            /* Esperando, siempre al inicio del eje, encima de él; en su cajón, centrada en él. */
            left: `${enCajon ? centroDe(k) : 0}%`, transform: enCajon ? "translateX(-50%)" : "none",
            border: enCajon ? "none" : ACIERTO_B, background: "transparent",
            ...PEQUENO, fontWeight: 600, whiteSpace: "nowrap", color: anterior ? SECUNDARIO : TEXTO,
            transition: reducido ? "none" : "top 320ms ease-out, left 320ms ease-out",
            /* Lote 6c: los cajones son botones; la deuda colocada no se come el toque del cajón que la lleva. */
            pointerEvents: "none",
          }}>
            {deudaDe(c)}
          </span>
        );
      })}
    </div>
  );
}

/*
 * La franja de pastillas (lote 6d): una fila del ancho del eje. La de la izquierda arranca en el borde
 * izquierdo de su cajón y la de la derecha termina en el borde derecho del suyo; con una sola, se alinea
 * por el lado que tiene sitio. Los huecos de los extremos se encogen antes de que dos se monten.
 */
function FranjaDePastillas({ marcados, marcaDe }) {
  const hueco = (pct) => <span aria-hidden="true" style={{ flex: `0 1 ${pct}%`, minWidth: 0 }} />;
  const relleno = <span aria-hidden="true" style={{ flex: "1 1 0", minWidth: "6px" }} />;
  const pastilla = (k) => <span key={k} data-pastilla-cajon={GRUPOS_T6_ACT6[k].id} style={{ flex: "none", display: "flex" }}><Pastilla marca={marcaDe(k)} /></span>;
  const [a, b] = marcados;
  const alaIzquierda = (k) => k <= 1;
  return (
    <div data-franja-pastillas aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${ALTO_PASTILLA}px`, display: "flex", alignItems: "center", pointerEvents: "none" }}>
      {b === undefined
        ? (alaIzquierda(a)
          ? <>{hueco(BORDES_EJE[a])}{pastilla(a)}{relleno}</>
          : <>{relleno}{pastilla(a)}{hueco(100 - BORDES_EJE[a + 1])}</>)
        : <>{hueco(BORDES_EJE[a])}{pastilla(a)}{relleno}{pastilla(b)}{hueco(100 - BORDES_EJE[b + 1])}</>}
    </div>
  );
}

/* ═══════════ LA TABLA, CON SUS BARRAS (parte 2) ═══════════ */

/* Lote 6d: el renglón activo, 2 px #F8F9FA y sin relleno navy. */
const resalte = (activo) => ({
  margin: "0 -6px", padding: "4px 6px", borderRadius: "8px",
  border: `2px solid ${activo ? TEXTO_B : "transparent"}`, background: "transparent",
});

/* Una barra de largo fijo, con la porción rellena al final y su porcentaje del largo. */
function Barra({ porcentaje, alto }) {
  return (
    <span data-barra style={{ flex: "1 1 auto", minWidth: "40px", height: `${alto}px`, border: `1px solid ${BORDES}`, borderRadius: "3px", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {porcentaje > 0 && <span data-porcion={porcentaje} style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${porcentaje}%`, background: NODO }} />}
    </span>
  );
}

/*
 * D8 (lote 18): la figura se arma con las partes y el escenario de la vuelta (el de hoy o la variante de
 * Futaba). Todo lo que sale de los datos vive aquí dentro; el eje y sus piezas no dependen de ellos.
 */
export function crearCajones(partes, escenario) {
  const [UBICAR, CALCULAR] = partes;
  const N1 = UBICAR.casillas.length;
  const MONTOS = Object.fromEntries(CALCULAR.datos.filas.filter((f) => !f.total).map((f) => [f.nombre, f.valor]));
  const TOTAL = CALCULAR.datos.filas.find((f) => f.total);
  /* La casilla de la parte 2 que da la provisión de cada grupo (la 4, la 5 y la 6), y las del total (7 y 8): por su lugar. */
  const [C4, C5, C6, P7, P8] = CALCULAR.casillas;
  const CASILLA_DE_GRUPO = { g2: C4.id, g3: C5.id, g4: C6.id };
  const ESCENARIO_T6_ACT6 = escenario;

  function FilaGrupo({ g, k, parte2, valor, activo, reducido }) {
    const pct = ESCENARIO_T6_ACT6.grupos.find((x) => x.id === g.id).porcentaje;
    const enColumna = pct > 0;
    return (
      <div data-fila={g.id} {...(activo ? { "data-renglon-activo": "" } : {})} style={{ borderTop: k ? `1px solid ${BORDE}` : "none", ...(parte2 ? resalte(activo) : { padding: "4px 0" }) }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline" }}>
          <span style={NOMBRE}>{g.nombre}</span>
          {parte2
            ? <span data-monto="" style={CIFRA}>{MONTOS[g.nombre]}</span>
            : enColumna && <span style={{ ...PEQUENO, fontWeight: 600, color: TEXTO, whiteSpace: "nowrap" }}>{pegarPorcentaje(g.porcentaje)}</span>}
        </div>
        {parte2 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            {enColumna && <span style={{ ...PEQUENO, fontWeight: 600, color: TEXTO, whiteSpace: "nowrap" }}>{pegarPorcentaje(g.porcentaje)}</span>}
            <Barra porcentaje={pct} alto={8} />
            {enColumna && <span data-provision-grupo={g.id} style={{ ...CIFRA, minWidth: "62px", textAlign: "right" }}>{valor && <Entra reducido={reducido}>{valor}</Entra>}</span>}
          </div>
        )}
        {!enColumna && (
          <p style={{ margin: "2px 0 0", ...PEQUENO, textAlign: "right", color: SECUNDARIO }}>{g.porcentaje}</p>
        )}
      </div>
    );
  }

  function Total({ respondidas, abierta, reducido }) {
    const i7 = N1 + CALCULAR.casillas.indexOf(P7);
    const i8 = N1 + CALCULAR.casillas.indexOf(P8);
    const activo = abierta === i7 || abierta === i8;
    /* Entra entera en la casilla 7 (fila y barra), con la aparición de la serie; con movimiento reducido, al instante. */
    return (
      <div data-fila="total" data-total="" {...(activo ? { "data-renglon-activo": "" } : {})} style={{
        borderTop: `1px solid ${BORDE_FUERTE}`, marginTop: "4px", ...resalte(activo), animation: reducido ? "none" : "b5-entra 240ms ease-out both",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline" }}>
          <span style={{ ...PEQUENO, color: SECUNDARIO }}>{TOTAL.nombre}</span>
          <span style={CIFRA}>{TOTAL.valor}</span>
        </div>
        <div data-barra-total style={{ marginTop: "6px" }}>
          <div style={{ display: "flex" }}><Barra porcentaje={(ESCENARIO_T6_ACT6.provision / ESCENARIO_T6_ACT6.total) * 100} alto={14} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "4px" }}>
            <div>
              <p style={{ margin: 0, ...PEQUENO, color: SECUNDARIO }}>{ROTULOS_TOTAL_T6_ACT6.neto}</p>
              <p data-valor-neto style={{ ...CIFRA, margin: 0, minHeight: "16px" }}>{respondidas > i8 && <Entra reducido={reducido}>{pesos(correcta(P8).valor)}</Entra>}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, ...PEQUENO, color: SECUNDARIO }}>{ROTULOS_TOTAL_T6_ACT6.provision}</p>
              <p data-valor-provision style={{ ...CIFRA, margin: 0, minHeight: "16px" }}>{respondidas > i7 && <Entra reducido={reducido}>{pesos(correcta(P7).valor)}</Entra>}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function CajonesDelTiempo({ respondidas, abierta, reducido, anuncio, modoDemo = false, eleccion = null, casillaDemo = null }) {
    /* En «Así se juega» no hay partida: solo la nota, la regla y su pie. */
    const enCurso = abierta ?? Math.max(0, respondidas - 1);
    const parte2 = !modoDemo && enCurso >= N1;
    const valorDe = (g) => {
      const id = CASILLA_DE_GRUPO[g.id];
      if (!id) return null; // el primer grupo no lleva provisión
      const i = N1 + CALCULAR.casillas.findIndex((c) => c.id === id);
      return respondidas > i ? pesos(correcta(CALCULAR.casillas[i - N1]).valor) : null;
    };
    const activoDe = (g) => abierta !== null && CALCULAR.casillas[abierta - N1]?.id === CASILLA_DE_GRUPO[g.id];
    return (
      <div data-cajones-del-tiempo style={{ margin: "0 0 12px" }}>
        <style>{KEYFRAMES_ENTRA}</style>
        <p data-nota-regla style={{ margin: "0 0 10px", fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.75)" }}>{T6_ACT6.nota}</p>
        {/* Lote 6d: la tabla va directo sobre el Panel, sin tarjeta propia. */}
        <div data-regla="" style={{ padding: 0 }}>
          <div {...(parte2 ? { "data-datos-parte": "" } : {})}>
            {GRUPOS_T6_ACT6.map((g, k) => (
              <FilaGrupo key={g.id} g={g} k={k} parte2={parte2} valor={parte2 ? valorDe(g) : null} activo={parte2 && activoDe(g)} reducido={reducido} />
            ))}
            {/*
              * La fila del total («$1.400.000») y su barra no se dibujan antes de la casilla 7, la primera que
              * las usa (hoja de Mai, lote 3 · B): las casillas 4 a 6 usan solo la fila de su grupo, y así la
              * casilla 4 cabe a 320×568 con su rótulo y su fila.
              */}
            {parte2 && enCurso >= N1 + CALCULAR.casillas.indexOf(P7) && <Total respondidas={respondidas} abierta={abierta} reducido={reducido} />}
          </div>
          {/* El pie de la tabla (calidad 1): el rótulo y la fuente del porcentaje, dos líneas sin cajas. */}
          <div data-pie-tabla="" style={{ margin: "6px 0 0", padding: "6px 0 0", borderTop: `1px solid ${BORDE_TENUE}` }}>
            <p data-rotulo-simulado="" style={{ ...LINEA_PIE, fontWeight: 600, color: NODO }}>{T6_ACT6.rotulo}</p>
            <p data-pie-porcentaje="" style={{ ...LINEA_PIE, fontWeight: 400, color: SECUNDARIO }}>{PIES_T6_ACT6.regla}</p>
          </div>
        </div>
        {!modoDemo && !parte2 && <Eje respondidas={respondidas} abierta={abierta} reducido={reducido} eleccion={eleccion} casillas={UBICAR.casillas} />}
        {/* «Así se juega» enseña el mismo gesto que la partida: la deuda del ejemplo se ubica tocando su cajón. */}
        {modoDemo && casillaDemo && <Eje respondidas={respondidas} abierta={abierta} reducido={reducido} eleccion={eleccion} casillas={[casillaDemo]} />}
        <p data-anuncio aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{anuncio}</p>
      </div>
    );
  }


  /* Lo que se anuncia al responder la casilla k: lo que entra (siempre lo correcto). PARA SHOKO: frases armadas con palabras de la actividad. */
  function anuncioDe(k) {
    if (k < N1) {
      const c = UBICAR.casillas[k];
      return `${deudaDe(c)}: ${minuscula(correcta(c).texto)}`;
    }
    const c = CALCULAR.casillas[k - N1];
    const grupo = Object.entries(CASILLA_DE_GRUPO).find(([, id]) => id === c.id)?.[0];
    if (grupo) return `${minuscula(GRUPOS_T6_ACT6.find((g) => g.id === grupo).nombre)}: ${pesos(correcta(c).valor)}`;
    return `${c.id === P7.id ? ROTULOS_TOTAL_T6_ACT6.provision : ROTULOS_TOTAL_T6_ACT6.neto}: ${pesos(correcta(c).valor)}`;
  }

  return { CajonesDelTiempo, anuncioDe, casillasUbicar: UBICAR.casillas };
}

const HOY = crearCajones(PARTES_T6_ACT6, ESCENARIO_T6_ACT6);
export default HOY.CajonesDelTiempo;
export const anuncioDe = HOY.anuncioDe;
