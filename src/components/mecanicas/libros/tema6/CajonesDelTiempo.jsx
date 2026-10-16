import { useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import {
  T6_ACT6, GRUPOS_T6_ACT6, PARTES_T6_ACT6, PIES_T6_ACT6, ESCENARIO_T6_ACT6, ROTULOS_TOTAL_T6_ACT6,
} from "../../../../data/contabilidadT6Act6.js";
import { pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import { pesos } from "../../../../data/contabilidad.js";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, NAVY, BORDES } from "./MaquinaPegada.jsx";
import { Entra, KEYFRAMES_ENTRA } from "./CuentaQueSeLlena.jsx";
import { Pastilla, useRevelada, BLANCO, CORAL, CONTORNO } from "../b5/EstandarHacer.jsx";

const REPOSO = CONTORNO.reposo.replace(/^1px solid /, "");

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
 * responde tocando a un lado o al otro de la marca de 6. Con el estándar de
 * Hacer (b5/EstandarHacer.jsx): en reposo, contorno de 1 px; el elegido
 * correcto queda con 2 px blanco y la pastilla «Correcto»; el elegido por
 * error, 2 px coral y «No va aquí»; 0,7 s después se revela el correcto (2 px
 * blanco, «Iba aquí») y la deuda cae en él. Las pastillas van en una fila
 * reservada bajo el eje.
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

const [UBICAR, CALCULAR] = PARTES_T6_ACT6;
const N1 = UBICAR.casillas.length;
const MONTOS = Object.fromEntries(CALCULAR.datos.filas.filter((f) => !f.total).map((f) => [f.nombre, f.valor]));
const TOTAL = CALCULAR.datos.filas.find((f) => f.total);
const correcta = (c) => c.opciones.find((o) => o.tipo === null);
/* La casilla de la parte 2 que da la provisión de cada grupo (la 4, la 5 y la 6), y las del total (7 y 8). */
const CASILLA_DE_GRUPO = { g2: "p4", g3: "p5", g4: "p6" };
const [P7, P8] = ["p7", "p8"].map((id) => CALCULAR.casillas.find((c) => c.id === id));

/* ═══════════ EL EJE DE LOS CAJONES (parte 1) ═══════════ */

const ANCHOS = [22, 22, 28, 28];
const BORDES_EJE = ANCHOS.reduce((xs, a) => [...xs, xs[xs.length - 1] + a], [0]); // 0 · 22 · 44 · 72 · 100
/* Las marcas, con las palabras de los nombres de los grupos: «3 meses», «6 meses», «1 año». */
const MARCAS = GRUPOS_T6_ACT6.slice(0, 3).map((g, k) => ({ en: BORDES_EJE[k + 1], texto: g.nombre.match(/(\d+ (meses|año))$/)[1] }));
const centroDe = (k) => BORDES_EJE[k] + ANCHOS[k] / 2;
const deudaDe = (c) => c.enunciado.match(/(\d+) meses/)[0];
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

/*
 * Las pastillas del estándar, en su fila bajo el eje: cada una bajo su cajón y, si chocan (dos cajones
 * vecinos, o la del primero contra el borde), se apartan lo justo. Se mide en vivo: sus anchos dependen
 * de la fuente.
 */
const ALTO_FILA_PASTILLAS = 26;
const HUECO_PASTILLAS = 4;
function FilaPastillas({ pastillas, top }) {
  const caja = useRef(null);
  useLayoutEffect(() => {
    const el = caja.current;
    if (!el) return;
    const W = el.getBoundingClientRect().width;
    const ps = [...el.querySelectorAll("[data-pastilla-cajon]")];
    const xs = ps.map((p) => ({ p, w: p.getBoundingClientRect().width, c: (Number(p.dataset.centro) / 100) * W }));
    xs.sort((a, b) => a.c - b.c);
    /* Ida: centrada bajo su cajón, sin pisar a la anterior ni salir por la izquierda. */
    xs.forEach((x, i) => { x.left = Math.max(x.c - x.w / 2, 0, i ? xs[i - 1].left + xs[i - 1].w + HUECO_PASTILLAS : 0); });
    /* Vuelta: sin salir por la derecha ni pisar a la siguiente. */
    for (let i = xs.length - 1; i >= 0; i--) {
      const tope = i === xs.length - 1 ? W : xs[i + 1].left - HUECO_PASTILLAS;
      xs[i].left = Math.min(xs[i].left, tope - xs[i].w);
    }
    for (const x of xs) x.p.style.left = `${Math.max(0, x.left)}px`;
  });
  return (
    <div ref={caja} data-fila-pastillas style={{ position: "absolute", left: 0, right: 0, top: `${top}px`, height: `${ALTO_FILA_PASTILLAS}px` }}>
      {pastillas.map((x) => (
        <span key={x.k} data-pastilla-cajon={x.tipo} data-centro={centroDe(x.k)} style={{ position: "absolute", top: "2px", left: 0 }}>
          <Pastilla tipo={x.tipo} />
        </span>
      ))}
    </div>
  );
}

function Eje({ respondidas, abierta, reducido, eleccion = null }) {
  const { marcas, escalonado } = useEscalonado();
  const actual = abierta ?? respondidas - 1;
  /* Lote 6c: con `eleccion`, los cajones son las opciones de la casilla abierta. */
  const casilla = UBICAR.casillas[actual];
  const elegidoK = eleccion?.elegida ? GRUPOS_T6_ACT6.findIndex((g) => g.nombre === eleccion.elegida.texto) : -1;
  const correctoK = cajonDe(casilla);
  const fallo = Boolean(eleccion?.elegida) && elegidoK !== correctoK;
  /* Estándar de Hacer: el correcto se revela 0,7 s después del error (aquí no hay reintento). */
  const revelada = useRevelada(fallo);
  /* El estado de cada cajón tras responder: «correcto» (el elegido, si acertó), «error» (el elegido, si no) o «revelado». */
  const estadoDe = (k) => {
    if (!eleccion?.elegida) return null;
    if (k === elegidoK) return fallo ? "error" : "correcto";
    return k === correctoK && revelada ? "revelado" : null;
  };
  const pastillas = GRUPOS_T6_ACT6.map((g, k) => ({ k, tipo: { correcto: "correcto", error: "error", revelado: "iba" }[estadoDe(k)] })).filter((x) => x.tipo);
  /* La deuda de la casilla cae en su cajón al acertar, o con la revelada si falló. */
  const enCajonDe = (i) => i < respondidas && !(i === actual && fallo && !revelada);
  const conFila = Boolean(eleccion);
  const altoMarcas = TOPE_BARRA + ALTO_BARRA + 4 + LINEA_MARCA * (escalonado ? 2 : 1);
  return (
    <div data-eje {...(abierta !== null ? { "data-renglon-activo": "" } : {})} data-escalonado={escalonado ? "si" : "no"} style={{ position: "relative", height: `${altoMarcas + (conFila ? ALTO_FILA_PASTILLAS : 0)}px`, margin: "4px 0 12px" }}>
      {/* La barra, partida en cuatro cajones. */}
      <div style={{ position: "absolute", top: `${TOPE_BARRA}px`, left: 0, right: 0, height: `${ALTO_BARRA}px`, display: "flex" }}>
        {GRUPOS_T6_ACT6.map((g, k) => {
          const tiene = UBICAR.casillas.some((c, i) => enCajonDe(i) && cajonDe(c) === k);
          /* Sin elección (fuera de la partida): el cajón de la deuda recién respondida se ilumina como siempre. */
          const recien = !eleccion && abierta === null && cajonDe(UBICAR.casillas[actual]) === k;
          const estado = estadoDe(k);
          const Etiqueta = eleccion ? "button" : "div";
          const opcion = eleccion ? casilla.opciones.find((o) => o.texto === g.nombre) : null;
          /* El contorno del estándar: 2 px blanco si es el correcto o el revelado; 2 px coral si es el error. */
          const anillo = estado === "error" ? `inset 0 0 0 2px ${CORAL}` : estado ? `inset 0 0 0 2px ${BLANCO}` : recien ? `inset 0 0 0 2px ${NODO}` : "none";
          return (
            <Etiqueta key={g.id} data-cajon={g.id} data-con-deuda={tiene ? "si" : "no"} {...(k === ULTIMO ? { "data-abierto": "" } : {})}
              {...(eleccion ? {
                type: "button", "aria-label": `Grupo ${k + 1}: ${minuscula(g.nombre)}`, "data-estado-destino": estado ?? "",
                disabled: !eleccion.elegir, onClick: () => eleccion.elegir?.(opcion),
              } : {})}
              style={{
              position: "relative", padding: 0, margin: 0, font: "inherit", color: "inherit", cursor: eleccion?.elegir ? "pointer" : "default",
              borderTop: "none", borderRight: "none", borderBottom: "none",
              width: `${ANCHOS[k]}%`, boxSizing: "border-box", borderLeft: `1px solid ${eleccion ? REPOSO : BORDES}`,
              ...(k === ULTIMO
                ? { borderRight: "none", backgroundImage: `${DESVANECE}, ${DESVANECE}`, backgroundSize: "100% 1px", backgroundPosition: "top, bottom", backgroundRepeat: "no-repeat" }
                : { borderTop: `1px solid ${eleccion ? REPOSO : BORDES}`, borderBottom: `1px solid ${eleccion ? REPOSO : BORDES}` }),
              borderRadius: k === 0 ? "6px 0 0 6px" : 0,
              backgroundColor: recien ? NAVY : tiene ? TENUE : "transparent", boxShadow: anillo,
            }}>
              {/* La clave de la opción, como en las casillas de siempre (la sonda y el guion la buscan así). */}
              {eleccion && <span data-opcion={g.nombre} aria-hidden="true" />}
            </Etiqueta>
          );
        })}
      </div>
      {/* Las marcas, bajo los bordes interiores. */}
      {/* Medidos siempre en la primera línea: el escalón del medio va por transform, que no mueve su caja de medida. */}
      {MARCAS.map((m, k) => (
        <span key={m.texto} ref={(n) => { marcas.current[k] = n; }} data-marca style={{
          position: "absolute", top: `${TOPE_BARRA + ALTO_BARRA + 4}px`, left: `${m.en}%`,
          transform: `translateX(-50%)${escalonado && k === 1 ? ` translateY(${LINEA_MARCA}px)` : ""}`,
          ...PEQUENO, color: SECUNDARIO, whiteSpace: "nowrap",
        }}>{m.texto}</span>
      ))}
      {/* Las pastillas del estándar, en su fila reservada bajo las marcas (no salta nada cuando llegan). */}
      {conFila && <FilaPastillas pastillas={pastillas} top={altoMarcas} />}
      {/* Las deudas: las ya ubicadas, en su cajón; la de la casilla, como pastilla sobre su mes, y al responder, cae. */}
      {UBICAR.casillas.map((c, i) => {
        if (i > actual) return null;
        const enCajon = enCajonDe(i);
        const k = cajonDe(c);
        const anterior = enCajon && i !== actual;
        return (
          <span key={c.id} data-deuda={c.id} data-en-cajon={enCajon ? GRUPOS_T6_ACT6[k].id : ""} style={{
            position: "absolute", height: `${ALTO_PASTILLA}px`, boxSizing: "border-box", padding: enCajon ? "4px 0" : "2px 6px", borderRadius: "999px",
            top: enCajon ? `${TOPE_BARRA + (ALTO_BARRA - ALTO_PASTILLA) / 2}px` : 0,
            /* Esperando, siempre al inicio del eje, encima de él; en su cajón, centrada en él. */
            left: `${enCajon ? centroDe(k) : 0}%`, transform: enCajon ? "translateX(-50%)" : "none",
            border: enCajon ? "none" : `2px solid ${NODO}`, background: enCajon ? "transparent" : NAVY,
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

/* ═══════════ LA TABLA, CON SUS BARRAS (parte 2) ═══════════ */

const resalte = (activo) => ({
  margin: "0 -6px", padding: "4px 6px", borderRadius: "8px",
  border: `2px solid ${activo ? NODO : "transparent"}`, background: activo ? NAVY : "transparent",
});

/* Una barra de largo fijo, con la porción rellena al final y su porcentaje del largo. */
function Barra({ porcentaje, alto }) {
  return (
    <span data-barra style={{ flex: "1 1 auto", minWidth: "40px", height: `${alto}px`, border: `1px solid ${BORDES}`, borderRadius: "3px", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {porcentaje > 0 && <span data-porcion={porcentaje} style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${porcentaje}%`, background: NODO }} />}
    </span>
  );
}

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

export default function CajonesDelTiempo({ respondidas, abierta, reducido, anuncio, modoDemo = false, eleccion = null }) {
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
      <div data-regla="" style={{ padding: "8px 10px 10px", borderRadius: "12px", border: `1px solid ${BORDE}`, background: "rgba(248,249,250,0.05)" }}>
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
      {!modoDemo && !parte2 && <Eje respondidas={respondidas} abierta={abierta} reducido={reducido} eleccion={eleccion} />}
      <p data-anuncio aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{anuncio}</p>
    </div>
  );
}

/* Tras los dos puntos, el nombre del grupo va en minúscula (Shoko). */
const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);

/* Lo que se anuncia al responder la casilla k: lo que entra (siempre lo correcto). PARA SHOKO: frases armadas con palabras de la actividad. */
export function anuncioDe(k) {
  if (k < N1) {
    const c = UBICAR.casillas[k];
    return `${deudaDe(c)}: ${minuscula(correcta(c).texto)}`;
  }
  const c = CALCULAR.casillas[k - N1];
  const grupo = Object.entries(CASILLA_DE_GRUPO).find(([, id]) => id === c.id)?.[0];
  if (grupo) return `${minuscula(GRUPOS_T6_ACT6.find((g) => g.id === grupo).nombre)}: ${pesos(correcta(c).valor)}`;
  return `${c.id === P7.id ? ROTULOS_TOTAL_T6_ACT6.provision : ROTULOS_TOTAL_T6_ACT6.neto}: ${pesos(correcta(c).valor)}`;
}
