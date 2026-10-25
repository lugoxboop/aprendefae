import { FAE } from "../../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../../data/contabilidadIntro.js";
import {
  ID_P4, NOMBRES_P4, INFORMES_P4, LINEAS_P4, FLECHAS_P4, TEXTOS_P4, MODO_FLECHA, VIAJA, EXPLICA,
} from "../../../../../data/contabilidadPiezas234.js";
import { PRIMERO, SEGUNDO, FLUJOS } from "../../../../../data/contabilidadTema1.js";
import { A4_SEC, deFicha } from "../../../../../data/contabilidadT1Secuencia.js";
import { lineaP4, modoDeFlecha } from "../../../../../contabilidad/aprenderTema1.js";
import {
  MarcoFigura, Escenario, Nota, Fila, Tocable, Riel, SORA, INTER, SECUNDARIO, NAVY, HUNDIDO_T1,
  paradaResuelta, ParadaModelo, figuraFrase, itemsDe, itemsResueltos, itemDelPaso, responderItem,
  CANTO, N2, SILUETA, conFases,
} from "./figurasT1.jsx";
import { TorreMini } from "./piezaEcuacion.jsx";
import { LineaCompacta } from "./piezaFotoPelicula.jsx";
import { pick, sinApoyo } from "./piezaRecorrido.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * cu0-a4 · CÓMO SE ARTICULAN, EN SECUENCIA — 10 pantallas (Mai §8.2).
 *
 * La figura de TresInformes.jsx (los tres informes y las cinco flechas que
 * llegan a la foto) no cabe en el escenario de 184 a 320: diez líneas con sus
 * nombres a 12 px miden más de 250. Aquí va de dos maneras:
 *
 *   · el MAPA: los tres informes con sus líneas como barras sin nombre (el
 *     Gráfico 2.6 escribe «xxxxx» en todas), y las flechas entre barras. Es la
 *     convergencia, que es lo que el mapa enseña; aria-hidden, lo dice el
 *     nombre de la figura y el texto de la pantalla.
 *   · la FILA de una flecha: «línea de origen → línea de destino», con los
 *     nombres publicados de LINEAS (la de la llave, «Activos y pasivos, en
 *     bloque»). Es lo que se toca y lo que se clasifica.
 *
 * Cero cifras (contabilidadPiezas234.js). La que repite la cifra (f2) lleva
 * «la misma cifra»; las otras, «explica esta línea» (VIAJA / EXPLICA).
 * Decisiones posteriores a la ficha de Mai: f1 SÍ se clasifica (explica) y la
 * nota «Es la misma cifra con otro nombre» ya no existe.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = A4_SEC.pantallas;
const F = (n) => deFicha(ID_P4, n);
const textoDe = (o) => o?.texto ?? null;
const informe = (id) => INFORMES_P4.find((i) => i.id === id);
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const corto = (id) => mayuscula(informe(id).corto);
const flecha = (id) => FLECHAS_P4.find((f) => f.id === id);

/* ═══════════ EL MAPA ═══════════ */
const PAD = 6;
const BARRA = 6;
const PASO_BARRA = 10;
const lineasDe = (inf) => LINEAS_P4.filter((l) => l.informe === inf);

function geometria(conCabecera) {
  const cab = conCabecera ? 20 : 0;
  const alto = (n) => PAD + cab + (n ? n * PASO_BARRA - (PASO_BARRA - BARRA) : 0) + PAD;
  const pel = { top: 0, alto: alto(lineasDe(SEGUNDO).length) };
  const plata = { top: pel.alto + 8, alto: alto(lineasDe(FLUJOS).length) };
  const foto = { top: 0, alto: alto(lineasDe(PRIMERO).length) };
  const y = (caja, i) => caja.top + PAD + cab + i * PASO_BARRA + BARRA / 2;
  const centro = {};
  for (const [inf, caja] of [[SEGUNDO, pel], [FLUJOS, plata], [PRIMERO, foto]]) lineasDe(inf).forEach((l, i) => { centro[l.id] = y(caja, i); });
  return { cajas: { [SEGUNDO]: pel, [FLUJOS]: plata, [PRIMERO]: foto }, alto: Math.max(plata.top + plata.alto, foto.alto), centro, cab };
}

/**
 * activas   las flechas que se ven.
 * lineas    false: los informes solos (la predicción, sin flechas ni líneas).
 * mini      sin cabeceras (la miniatura del cierre del tema).
 */
export function MapaSec({ activas = [], lineas = true, mini = false }) {
  const g = geometria(!mini);
  const extremos = new Set(activas.flatMap((id) => [flecha(id).desde, flecha(id).hasta]));
  const enBloque = new Set(activas.filter((id) => modoDeFlecha(id).deBloque).map((id) => lineaP4(flecha(id).hasta).informe));
  const caja = (inf, izquierda) => {
    const c = g.cajas[inf];
    const resaltada = enBloque.has(inf);
    return (
      <div key={inf} data-informe-mapa={inf} data-resaltado={resaltada ? "si" : undefined} style={{
        position: "absolute", top: `${c.top}px`, height: lineas ? `${c.alto}px` : "28px", width: "40%", [izquierda ? "left" : "right"]: 0,
        boxSizing: "border-box", padding: `${PAD}px 8px`, borderRadius: "8px",
        background: resaltada ? "rgba(184,196,212,0.14)" : "rgba(10,20,34,0.5)",
        border: `${resaltada ? 2 : 1}px solid ${resaltada ? NEUTRO : SILUETA}`,
      }}>
        {!mini && <p style={{ margin: 0, height: "16px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: FAE.text, whiteSpace: "nowrap" }}>{corto(inf)}</p>}
        {lineas && (
          <div style={{ marginTop: mini ? 0 : "4px", display: "flex", flexDirection: "column", gap: `${PASO_BARRA - BARRA}px` }}>
            {lineasDe(inf).map((l) => (
              <span key={l.id} data-barra={l.id} data-encendida={extremos.has(l.id) ? "si" : undefined} style={{
                display: "block", height: `${BARRA}px`, borderRadius: "3px", width: l.llave ? "100%" : "82%",
                background: extremos.has(l.id) ? NEUTRO : "transparent", border: `1px solid ${extremos.has(l.id) ? NEUTRO : "rgba(184,196,212,0.45)"}`, boxSizing: "border-box",
              }} />
            ))}
          </div>
        )}
      </div>
    );
  };
  /* La cuenta de las barras empieza con el informe ya armado: sin líneas, las cajas solo miden su nombre. */
  const alto = lineas ? g.alto : 28 + 8 + 28;
  if (!lineas) { g.cajas[FLUJOS] = { ...g.cajas[FLUJOS], top: 36 }; }
  return (
    <div data-mapa aria-hidden="true" style={{ position: "relative", height: `${alto}px`, flex: "none" }}>
      {caja(SEGUNDO, true)}{caja(FLUJOS, true)}{caja(PRIMERO, false)}
      {lineas && (
        <svg viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          {activas.map((id) => (
            <line key={id} data-trazo={id} className="fae-t1s-aparece" x1="40" y1={g.centro[flecha(id).desde]} x2="60" y2={g.centro[flecha(id).hasta]}
              stroke={FAE.text} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      )}
    </div>
  );
}

/* La fila de una flecha: «origen → destino», con los nombres publicados de las líneas. */
const textoFlecha = (id) => `${lineaP4(flecha(id).desde).nombre} → ${lineaP4(flecha(id).hasta).nombre}`;
function FlechaFila({ id, onTocar = null, on = false, visto = false, marca = null }) {
  const dentro = (
    <>
      <span>{textoFlecha(id)}</span>
      {marca && (
        <span data-marca={marca} style={{
          marginLeft: "6px", padding: "0 6px", borderRadius: "6px", background: NEUTRO, color: NAVY_DEL_CHIP,
          fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px", whiteSpace: "nowrap",
        }}>{marca}</span>
      )}
    </>
  );
  const estilo = { textAlign: "left", fontSize: "12px", lineHeight: "16px", fontWeight: 600, display: "block", width: "100%" };
  if (onTocar) return <Tocable data-tocable data-flecha-sec={id} on={on} visto={visto} onClick={onTocar} style={estilo}>{dentro}</Tocable>;
  return (
    <div data-flecha-sec={id} style={{ ...HUNDIDO_T1, ...estilo, minHeight: "44px", padding: "6px 8px", display: "flex", alignItems: "center", flexWrap: "wrap", fontFamily: INTER, color: FAE.text }}>
      {dentro}
    </div>
  );
}

/* ═══════════ 1 · La predicción (los tres informes separados, sin flechas: R10) ═══════════ */
const RESPUESTA = textoDe(F(1).respuesta);
function FiguraPrediccion({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  return (
    <MarcoFigura>
      <Escenario>
        <MapaSec lineas={false} />
        <Fila
          opciones={T.prediccion.opciones.map((t) => ({ id: t, texto: t }))}
          estadoDe={(id) => (id === elegida ? "acierto" : "reposo")}
          onElegir={(id) => setEstado({ elegida: id })}
          activa={elegida === null}
          data="data-prediccion"
        />
        {elegida !== null && <Nota data-respuesta-prediccion>{RESPUESTA}</Nota>}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 2 · El tercer informe, con su cita ═══════════ */
const CITA_FLUJOS = NOMBRES_P4[0].delLibro;
function FiguraFlujos({ estado, setEstado }) {
  const abierto = Boolean(estado?.abierto);
  return (
    <MarcoFigura>
      <Escenario plano>
        <Tocable data-tocable data-informe-sec={FLUJOS} on={false} visto={abierto} onClick={() => setEstado({ abierto: true })}
          style={{ textAlign: "left", display: "block", width: "100%", padding: "6px 10px" }}>
          <span style={{ display: "block", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px" }}>{corto(FLUJOS)} · {informe(FLUJOS).nombre}</span>
          {abierto ? (
            <span data-lineas-flujos style={{ display: "block", marginTop: "2px", fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
              {lineasDe(FLUJOS).map((l) => <span key={l.id} data-linea={l.id} style={{ display: "block" }}>{l.nombre}</span>)}
            </span>
          ) : (
            <span style={{ display: "block", marginTop: "2px", fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>{T.flujos.toca}</span>
          )}
        </Tocable>
        <p data-cita aria-label={`Así lo dice el libro: ${CITA_FLUJOS}`} style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
          «{CITA_FLUJOS}»
        </p>
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 3 · Los tres carriles, apilados en bandas de 44 (Mai, medidas §2) ═══════════ */
function FiguraMotivos({ estado, setEstado }) {
  const vistos = estado?.vistos ?? [];
  const tocar = (k) => !vistos.includes(k) && setEstado({ vistos: [...vistos, k] });
  return (
    <MarcoFigura>
      <Escenario plano gap={6}>
        {T.motivos.carriles.map((c) => {
          const visto = vistos.includes(c.id);
          return (
            <Tocable key={c.id} data-tocable data-carril={c.id} on={visto} visto={visto} onClick={() => tocar(c.id)}
              style={{ width: "100%", height: "44px", textAlign: "left", padding: "0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: SORA, fontWeight: 700 }}>{c.rotulo}</span>
              {visto && <span data-idea className="fae-t1s-aparece" style={{ fontWeight: 400, fontSize: "12px", minWidth: 0 }}>· {c.idea}</span>}
            </Tocable>
          );
        })}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 4 · Dos informes y una flecha; el paso trae los tres con sus líneas ═══════════ */
function FiguraArticula({ estado, setEstado, paso }) {
  const tocada = Boolean(estado?.tocada);
  if (paso >= 1) {
    return (
      <MarcoFigura>
        <Escenario plano>
          <MapaSec />
          <Nota data-paso-tres>{TEXTOS_P4[1]}</Nota>
        </Escenario>
      </MarcoFigura>
    );
  }
  const tarjeta = (inf) => (
    <div data-informe-mapa={inf} style={{
      flex: 1, minWidth: 0, height: "44px", borderRadius: "8px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: FAE.text,
      background: tocada ? "rgba(184,196,212,0.14)" : "rgba(10,20,34,0.5)", border: `${tocada ? 2 : 1}px solid ${tocada ? NEUTRO : SILUETA}`,
    }}>{corto(inf)}</div>
  );
  return (
    <MarcoFigura>
      <Escenario plano>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {tarjeta(SEGUNDO)}
          <Tocable data-tocable data-flecha-sola="f1" on={tocada} visto={tocada} aria-label={textoFlecha("f1")} onClick={() => setEstado({ tocada: true })}
            style={{ flex: "none", width: "52px", fontSize: "18px", fontFamily: SORA }}>→</Tocable>
          {tarjeta(PRIMERO)}
        </div>
        {tocada && <div className="fae-t1s-aparece"><FlechaFila id="f1" /></div>}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 5 · La parada: ¿a dónde llega la utilidad del año? ═══════════ */
const PARADA = F(6);
const CORRECTA_PARADA = PARADA.opciones.find((o) => o.correcta).id;
const UTILIDAD = lineaP4(flecha("f1").desde);
function FiguraParada({ estado, setEstado }) {
  return (
    <ParadaModelo
      estado={estado} setEstado={setEstado}
      opciones={PARADA.opciones.map((o) => ({ id: o.id, texto: T.parada.rotulos[o.id] }))}
      correcta={CORRECTA_PARADA}
      pista={textoDe(PARADA.pista)}
      porqueDe={(id) => textoDe(PARADA.opciones.find((o) => o.id === id)?.devolucion)}
      acierto={textoDe(PARADA.opciones.find((o) => o.correcta).devolucion)}
      arriba={(
        <div data-resaltada-sin-flecha={UTILIDAD.id} style={{
          flex: "none", height: "36px", borderRadius: "8px", boxSizing: "border-box", padding: "0 10px", display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(184,196,212,0.14)", border: `2px solid ${NEUTRO}`, fontFamily: INTER, fontSize: "13px", color: FAE.text,
        }}>
          <span style={{ fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: SECUNDARIO }}>{corto(SEGUNDO)}</span>
          <span style={{ fontWeight: 700 }}>{UTILIDAD.nombre}</span>
        </div>
      )}
    />
  );
}

/* ═══════════ 6 y 7 · Las flechas, al tocarlas ═══════════ */
const marcaDe = (id) => (MODO_FLECHA[id].viaja ? VIAJA : EXPLICA);
const figuraFlechas = (ids, { notas = null, marcas = false, final = null } = {}) => function FiguraFlechas({ estado, setEstado, paso }) {
  const vistos = estado?.vistos ?? [];
  const ultimo = estado?.ultimo ?? null;
  const tocar = (k) => setEstado({ vistos: vistos.includes(k) ? vistos : [...vistos, k], ultimo: k });
  if (final && paso >= 1) {
    return (
      <MarcoFigura>
        <Escenario plano>
          <MapaSec activas={FLECHAS_P4.map((f) => f.id)} />
          <Nota data-paso-cinco>{final}</Nota>
        </Escenario>
      </MarcoFigura>
    );
  }
  return (
    <MarcoFigura>
      <Escenario plano gap={6}>
        {ids.map((id) => (
          <FlechaFila key={id} id={id} on={ultimo === id} visto={vistos.includes(id)} onTocar={() => tocar(id)}
            marca={vistos.includes(id) && (marcas || MODO_FLECHA[id].viaja) ? marcaDe(id) : null} />
        ))}
        {notas && ultimo && <Nota key={ultimo} data-revela={ultimo}>{notas[ultimo]}</Nota>}
      </Escenario>
    </MarcoFigura>
  );
};

/* ═══════════ 8 · ¿Repite o explica? Una flecha por paso, las cinco (f1 también) ═══════════ */
const CLASIFICA = F(11);
const N_FLECHAS = CLASIFICA.seClasifican.length;
const correctaDe = (id) => (CLASIFICA.modo[id].viaja ? "repite" : "explica");
function FiguraClasifica({ estado, setEstado, paso }) {
  const k = itemDelPaso(estado, paso, N_FLECHAS);
  const id = CLASIFICA.seClasifican[k];
  const e = itemsDe(estado)[k];
  const correcta = correctaDe(id);
  const devolucion = textoDe(correcta === "repite" ? CLASIFICA.devolucionRepiteMarcadaExplica : CLASIFICA.devolucionExplicaMarcadaRepite);
  return (
    <ParadaModelo
      estado={e} setEstado={(v) => setEstado(responderItem(estado, k, v.elegidas[v.elegidas.length - 1], correcta))}
      opciones={["repite", "explica"].map((o) => ({ id: o, texto: T.clasifica.rotulos[o] }))}
      correcta={correcta}
      pista={devolucion}
      porqueDe={() => devolucion}
      arriba={<div key={id} className="fae-t1s-aparece"><FlechaFila id={id} /></div>}
    />
  );
}

/* ═══════════ 9 · La capa 4 (excepción de Mai): sin figura ═══════════ */
export const FICHA_FRASE_A4 = F(12);
/* ═══════════ 10 · El cierre del tema: las cuatro figuras en miniatura ═══════════ */
function FiguraCierre() {
  const celda = (hijo, data) => (
    <div data-miniatura={data} style={{ ...HUNDIDO_T1, minHeight: 0, padding: "2px 8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ width: "100%" }}>{hijo}</div>
    </div>
  );
  return (
    <MarcoFigura>
      <div data-escenario aria-hidden="true" style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
        {celda(<Riel encendidos={5} vuelta="solida" />, "ciclo")}
        {celda(<div style={{ display: "flex", justifyContent: "center" }}><TorreMini alto={14} ancho={36} /></div>, "torre")}
        {celda(<div style={{ width: "64px", margin: "0 auto" }}><LineaCompacta dic="foto" banda /></div>, "fotos")}
        {celda(<div style={{ transform: "scale(.6)", transformOrigin: "center", width: "160%", marginLeft: "-30%" }}><MapaSec mini activas={FLECHAS_P4.map((f) => f.id)} /></div>, "flechas")}
      </div>
    </MarcoFigura>
  );
}

export const PIEZA_ARTICULAN = conFases({
  id: ID_P4,
  altoFigura: { a320: 184, a375: 184 },
  pantallas: [
    { id: "prediccion", tipo: "apertura", ...sinApoyo(T.prediccion), Figura: FiguraPrediccion },
    { id: "flujos", tipo: "apertura", ...pick(T.flujos), Figura: FiguraFlujos },
    { id: "motivos", tipo: "miralo", ...pick(T.motivos), Figura: FiguraMotivos },
    { id: "articula", tipo: "miralo", ...pick(T.articula), pasos: 1, rotulosPaso: [TEXTOS_P4[1]], Figura: FiguraArticula },
    { id: "parada", tipo: "haz", ...sinApoyo(T.parada), resuelta: paradaResuelta, Figura: FiguraParada },
    { id: "dos-flechas", tipo: "miralo", ...pick(T.dosFlechas), Figura: figuraFlechas(["f1", "f2"], { notas: { f1: TEXTOS_P4[2], f2: TEXTOS_P4[3] } }) },
    {
      id: "cinco-flechas", tipo: "miralo", ...pick(T.cincoFlechas), pasos: 1, rotulosPaso: [T.cincoFlechas.paso],
      Figura: figuraFlechas(["f3", "f4", "f5"], { marcas: true, final: T.cincoFlechas.paso }),
    },
    {
      id: "clasifica", tipo: "haz", ...sinApoyo(T.clasifica), pasos: N_FLECHAS - 1,
      rotulosPaso: CLASIFICA.seClasifican.slice(1).map(textoFlecha), resuelta: itemsResueltos(N_FLECHAS), Figura: FiguraClasifica,
    },
    { id: "frase", tipo: "haz", ...sinApoyo(T.frase), resuelta: paradaResuelta, Figura: figuraFrase(FICHA_FRASE_A4) },
    /* El último cierre del tema: «Ir a Hacer» lo pinta la vista (`final`), que hoy dice «tema» (pendiente de Erwin y Miku). */
    { id: "cierre", tipo: "cierre", ...pick(T.cierre), Figura: FiguraCierre },
  ],
});
