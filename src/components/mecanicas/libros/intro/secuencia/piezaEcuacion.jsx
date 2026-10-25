import { Clock } from "lucide-react";
import { FAE } from "../../../../../theme.js";
import { NEUTRO } from "../../../../../data/contabilidadIntro.js";
import {
  NOMBRES_P2, CASOS_P2, ROTULO_ACTIVO, ROTULO_PASIVO_PATRIMONIO, DEL_BANCO, DE_LOS_DUENOS, ID_P2,
} from "../../../../../data/contabilidadPiezas234.js";
import { A2_SEC, deFicha } from "../../../../../data/contabilidadT1Secuencia.js";
import { cambioDelCaso } from "../../../../../contabilidad/aprenderTema1.js";
import { torreEnPantalla, LineaDeAltura } from "../Torre.jsx";
import {
  MarcoFigura, Escenario, Nota, Fila, Tocable, SORA, INTER, SECUNDARIO, NAVY,
  paradaResuelta, ParadaModelo, figuraFrase, itemsDe, itemsResueltos, itemDelPaso, responderItem,
  CANTO, N2, SILUETA, conFases,
} from "./figurasT1.jsx";
import { pick, sinApoyo } from "./piezaRecorrido.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * cu0-a2 · LA ECUACIÓN CONTABLE, EN SECUENCIA — 10 pantallas (Mai §7).
 *
 * Las 15 pantallas de Futaba caben en 10: los tres nombres son toques de una
 * pantalla y los cuatro casos, cuatro pasos de otra. La figura es la torre de
 * Torre.jsx (la misma cuenta de bloques, `torreEnPantalla`), dibujada aquí con
 * el alto de bloque que cabe en el escenario de 184 y con el piso de 12. Sin
 * riel: el anillo de cinco puntos es de la pieza 1 (contabilidadPiezas234.js).
 *
 * Los tramos de la derecha y los rótulos de la izquierda quedan siempre al
 * lado del bloque que nombran (el fallo que cazó una captura en Torre.jsx):
 * las tres columnas salen de la misma lista de celdas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = A2_SEC.pantallas;
const F = (n) => deFicha(ID_P2, n);
const textoDe = (o) => o?.texto ?? null;

/*
 * ═══════════ LA TORRE, A 12 PX ═══════════
 *
 *   lado       "ninguna" (R10: sin rótulos ni corte de tramos) · "izquierda" · "derecha" · "ambas".
 *   cambio     { tramo, signo } de cambioDelCaso: crece o mengua el tramo que el caso nombra.
 *   marcar     "activo" (toda la izquierda) o el tramo que se resalta.
 *   esperando  { texto, entra }: el bloque nuevo de a2 · 6, encima y punteado hasta que entra.
 *   onLado     si llega, las dos columnas de rótulos son botones (≥ 44 de alto).
 *   rotulosLado lo que dice cada columna-botón antes de tocarla.
 */
export function TorreSec({
  lado = "ninguna", cambio = null, marcar = null, alto = 20, gap = 3, ancho = 48, encabezado = false,
  esperando = null, onLado = null, rotulosLado = null, conIzq = true, conDer = true, mini = false,
}) {
  const verIzq = lado === "izquierda" || lado === "ambas";
  const verDer = lado === "derecha" || lado === "ambas";
  const base = torreEnPantalla(cambio);
  const celdas = [...base.celdas];
  const tramos = base.tramos.map((t) => ({ tramo: t.tramo, n: t.bloques.length + t.extra }));
  if (esperando) {
    celdas.unshift({ extra: true, espera: !esperando.entra, key: "espera" });
    tramos.unshift({ tramo: esperando.texto, n: 1, nuevo: true, espera: !esperando.entra });
  }
  const altoDe = (n) => n * alto + (n - 1) * gap;
  const total = altoDe(celdas.length);

  const columna = (cual, hijos) => {
    const comun = { flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: `${gap}px` };
    if (!onLado) return <div data-lectura={cual} style={{ ...comun, alignItems: cual === "izquierda" ? "flex-end" : "stretch" }}>{hijos}</div>;
    const visto = cual === "izquierda" ? verIzq : verDer;
    return (
      <button type="button" className={CANTO} data-tocable data-lado={cual} aria-pressed={visto} onClick={() => onLado(cual)} style={{
        ...comun, alignItems: cual === "izquierda" ? "flex-end" : "stretch", minHeight: `${Math.max(44, total)}px`, padding: "0 4px",
        margin: 0, borderRadius: "8px", boxSizing: "border-box", cursor: "pointer", font: "inherit", color: FAE.text,
        background: N2, border: visto ? "2px solid transparent" : "2px dashed rgba(248,249,250,.5)",
        position: "relative",
      }}>
        {!visto && rotulosLado && (
          <span style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
            fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", padding: "0 4px",
          }}>{rotulosLado[cual]}</span>
        )}
        {hijos}
      </button>
    );
  };

  return (
    <div data-torre data-lado={lado} data-altura={celdas.length} style={{ flex: "none" }}>
      {encabezado && !mini && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
          {[[ROTULO_ACTIVO, verIzq, "right"], [null], [ROTULO_PASIVO_PATRIMONIO, verDer, "left"]].map(([t, ver, al], k) => (t === null
            ? <span key={k} aria-hidden="true" style={{ flex: "none", width: `${ancho}px` }} />
            : <span key={k} data-rotulo-lado={t} style={{
              flex: "1 1 0", minWidth: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px",
              letterSpacing: "0.06em", color: NEUTRO, textAlign: al, visibility: ver ? "visible" : "hidden",
            }}>{t}</span>))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: mini ? 0 : "6px" }}>
        {conIzq && !mini && columna("izquierda", celdas.map((c) => (
          <span key={c.key} data-izq={c.extra ? "extra" : c.bloque.id} style={{
            height: `${alto}px`, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 4px", borderRadius: "5px",
            fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: marcar === "activo" ? NAVY : FAE.text,
            background: marcar === "activo" && verIzq ? "#B8C4D4" : "transparent",
          }}>
            {verIzq && !c.extra ? c.bloque.izquierda : ""}
          </span>
        )))}
        <div aria-hidden="true" style={{ flex: "none", display: "flex", flexDirection: "column", gap: `${gap}px` }}>
          {celdas.map((c) => (
            <div key={c.key} data-bloque={c.espera ? "espera" : c.extra ? "extra" : c.bloque.id} className={c.extra && !c.espera ? "fae-t1s-aparece" : undefined} style={{
              width: `${ancho}px`, height: `${alto}px`, borderRadius: mini ? "3px" : "6px", boxSizing: "border-box",
              background: c.espera ? "transparent" : c.extra ? "rgba(184,196,212,0.55)" : NEUTRO,
              border: c.espera ? `2px dashed ${NEUTRO}` : `1px solid ${NEUTRO}`,
              marginBottom: c.espera ? `${gap + 4}px` : 0,
            }} />
          ))}
        </div>
        {conDer && !mini && columna("derecha", lado === "ninguna" ? null : tramos.map((t) => {
          const marcado = marcar === t.tramo && verDer;
          const ver = verDer || t.nuevo;
          return (
            <span key={t.tramo} data-tramo={t.tramo} data-marcado={marcado ? "si" : undefined} style={{
              height: `${altoDe(t.n)}px`, marginBottom: t.espera ? "4px" : 0, display: "flex", alignItems: "center", gap: "4px",
              padding: "0 2px", whiteSpace: t.n === 1 ? "nowrap" : "normal", borderRadius: "6px", boxSizing: "border-box",
              background: marcado ? "#B8C4D4" : "transparent", color: marcado ? NAVY : FAE.text,
              fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: marcado ? 700 : 400,
            }}>
              {ver && (
                <>
                  <span aria-hidden="true" style={{ flex: "none", width: "3px", alignSelf: "stretch", borderRadius: "2px", background: marcado ? NAVY : NEUTRO, margin: "2px 0" }} />
                  <span style={{ minWidth: 0 }}>{t.tramo}</span>
                </>
              )}
            </span>
          );
        }))}
      </div>
    </div>
  );
}

/* La torre de 12 px de alto por bloque, sin rótulos: para la franja de la capa 4 y la miniatura del cierre del tema. */
export const TorreMini = ({ alto = 10, ancho = 28 }) => <TorreSec mini alto={alto} gap={2} ancho={ancho} />;

/* Qué marca cada uno de los tres nombres (pantallas 2 y 3). */
const MARCA = {
  activo: { lado: "izquierda", marcar: "activo" },
  pasivo: { lado: "derecha", marcar: DEL_BANCO },
  patrimonio: { lado: "derecha", marcar: DE_LOS_DUENOS },
};
const NOMBRE = { activo: NOMBRES_P2[0], pasivo: NOMBRES_P2[1], patrimonio: NOMBRES_P2[2] };

/* ═══════════ 1 · La predicción (R10: la torre sin rótulos ni corte de tramos) ═══════════ */
const RESPUESTA = textoDe(F(1).respuesta);
function FiguraPrediccion({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  return (
    <MarcoFigura>
      <Escenario>
        {/* La respuesta trae el corte: «una parte la pusieron otros y el resto, los dueños». */}
        <TorreSec lado={elegida === null ? "ninguna" : "derecha"} alto={16} gap={2} conIzq={false} />
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

/* ═══════════ 2 y 3 · Los tres nombres, y la ecuación armada con ellos ═══════════ */
const figuraNombres = (ecuacion) => function FiguraNombres({ estado, setEstado }) {
  const vistos = estado?.vistos ?? [];
  const ultimo = estado?.ultimo ?? null;
  const tocar = (k) => setEstado({ vistos: vistos.includes(k) ? vistos : [...vistos, k], ultimo: k });
  const boton = (k) => (
    <Tocable key={k} data-tocable data-nombre={k} on={ultimo === k} visto={vistos.includes(k)} onClick={() => tocar(k)}>
      {ecuacion ? NOMBRE[k].termino : T.nombres.rotulos[k]}
    </Tocable>
  );
  const signo = (s) => <span aria-hidden="true" style={{ alignSelf: "center", fontFamily: SORA, fontSize: "15px", fontWeight: 700, color: FAE.text }}>{s}</span>;
  const marca = ultimo ? MARCA[ultimo] : { lado: "ninguna", marcar: null };
  return (
    <MarcoFigura>
      <Escenario>
        {ecuacion ? (
          <div role="group" data-ecuacion style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1.3fr)", gap: "4px" }}>
            {boton("activo")}{signo("=")}{boton("pasivo")}{signo("+")}{boton("patrimonio")}
          </div>
        ) : (
          <div role="group" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
            {["activo", "pasivo", "patrimonio"].map(boton)}
          </div>
        )}
        <TorreSec lado={ecuacion ? "ambas" : marca.lado} marcar={marca.marcar} alto={16} gap={2} encabezado={ecuacion} />
        {!ecuacion && ultimo && <Nota key={ultimo} data-revela={ultimo}>{NOMBRE[ultimo].definicion}</Nota>}
      </Escenario>
    </MarcoFigura>
  );
};

/* ═══════════ 4 · Los dos lados, con la cita del libro ═══════════ */
const CITA_LADOS = NOMBRES_P2[4].delLibro;
const ladoDe = (vistos) => (vistos.length === 2 ? "ambas" : vistos[0] ?? "ninguna");
function FiguraDosLados({ estado, setEstado }) {
  const vistos = estado?.vistos ?? [];
  const tocar = (l) => !vistos.includes(l) && setEstado({ vistos: [...vistos, l] });
  return (
    <MarcoFigura>
      <Escenario plano>
        <TorreSec lado={ladoDe(vistos)} alto={16} onLado={tocar} rotulosLado={T.dosLados.rotulos} />
        <p data-cita aria-label={`Así lo dice el libro: ${CITA_LADOS}`} style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
          «{CITA_LADOS}»
        </p>
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 5 · La misma torre, contada dos veces (dos toques y un paso) ═══════════ */
function FiguraDosVeces({ estado, setEstado, paso }) {
  const vistos = estado?.vistos ?? [];
  const ultimo = estado?.ultimo ?? null;
  const tocar = (l) => setEstado({ vistos: vistos.includes(l) ? vistos : [...vistos, l], ultimo: l });
  const final = paso >= 1;
  return (
    <MarcoFigura>
      <Escenario plano>
        <div>
          <TorreSec lado={final ? "ambas" : ladoDe(vistos)} alto={20} encabezado onLado={tocar} rotulosLado={T.dosVeces.rotulos} />
          {final && <div className="fae-t1s-aparece"><LineaDeAltura /></div>}
        </div>
        {final
          ? <Nota data-paso-final>{T.dosVeces.pasos[2]}</Nota>
          : ultimo && <Nota key={ultimo} data-revela={ultimo}>{T.dosVeces.pasos[ultimo === "izquierda" ? 0 : 1]}</Nota>}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 6 · La parada: compra algo y lo queda debiendo ═══════════ */
const PARADA = F(11);
const CORRECTA_PARADA = PARADA.opciones.find((o) => o.correcta).id;
function FiguraParada({ estado, setEstado }) {
  const e = estado;
  const entra = paradaResuelta(e);
  return (
    <ParadaModelo
      estado={e} setEstado={setEstado}
      opciones={PARADA.opciones.map((o) => ({ id: o.id, texto: T.parada.rotulos[o.id] }))}
      correcta={CORRECTA_PARADA}
      pista={textoDe(PARADA.pista)}
      porqueDe={(id) => textoDe(PARADA.opciones.find((o) => o.id === id)?.devolucion)}
      acierto={textoDe(PARADA.opciones.find((o) => o.correcta).devolucion)}
      modelo={<TorreSec lado="derecha" alto={18} gap={2} ancho={26} conIzq={false} esperando={{ texto: T.parada.vendedor, entra }} />}
      anchoModelo={118}
    />
  );
}

/* ═══════════ 7 · Los cuatro casos: un hecho por paso ═══════════ */
const CASOS = F(12);
const ID_DE_RESPUESTA = { [CASOS.opciones[0].texto]: "crecen", [CASOS.opciones[1].texto]: "bajan", [CASOS.opciones[2].texto]: "al-reves" };
const N_CASOS = CASOS.hechos.length;
/* Después de los casos a y c, la nota de Levi; tras el último, el cierre de los cuatro (lote C de Futaba). */
const ACIERTO_DEL_CASO = (h) => (h.caso.id === CASOS.notaTrasLosCasos[1] ? textoDe(CASOS.nota) : null);
function FiguraCasos({ estado, setEstado, paso }) {
  const k = itemDelPaso(estado, paso, N_CASOS);
  const h = CASOS.hechos[k];
  const e = itemsDe(estado)[k];
  const correcta = ID_DE_RESPUESTA[h.correcta];
  const resuelto = paradaResuelta(e);
  const porqueDe = (id) => textoDe(id === "al-reves" ? CASOS.devoluciones.unoSube : id === "crecen" ? CASOS.devoluciones.crecenEnVezDeBajan : CASOS.devoluciones.bajanEnVezDeCrecen);
  const ultimo = k === N_CASOS - 1;
  const alFinal = ultimo && e?.ok;
  return (
    <ParadaModelo
      estado={e} setEstado={(v) => setEstado(responderItem(estado, k, v.elegidas[v.elegidas.length - 1], correcta))}
      opciones={["crecen", "bajan", "al-reves"].map((id) => ({ id, texto: T.casos.rotulos[id] }))}
      correcta={correcta}
      pista={textoDe(CASOS.pista)}
      porqueDe={porqueDe}
      acierto={ultimo ? null : ACIERTO_DEL_CASO(h)}
      arriba={alFinal ? (
        /* Los cuatro resueltos con acierto: el cierre de los cuatro ocupa el sitio del hecho (a 320 no cabe junto a la torre). */
        <p data-al-final className="fae-t1s-aparece" style={{ margin: 0, height: "48px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: FAE.text, fontWeight: 700 }}>
          {textoDe(CASOS.alFinal)}
        </p>
      ) : (
        <p key={`${k}-${resuelto}`} data-caso={h.caso.id} data-hecho={h.hecho.id} className="fae-t1s-aparece" style={{
          margin: 0, height: "32px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: FAE.text, fontWeight: resuelto ? 700 : 400,
        }}>
          {resuelto ? h.caso.nombre : h.hecho.texto}
        </p>
      )}
      modelo={<TorreSec lado="derecha" alto={18} gap={2} ancho={26} conIzq={false} cambio={resuelto ? cambioDelCaso(h.caso) : null} />}
      anchoModelo={118}
    />
  );
}

/* ═══════════ 8 · La regla: tres movimientos ═══════════ */
const MOVIMIENTO = { suben: CASOS_P2[0], bajan: CASOS_P2[2], igual: null };
function FiguraRegla({ estado, setEstado }) {
  const vistos = estado?.vistos ?? [];
  const ultimo = estado?.ultimo ?? null;
  const tocar = (k) => setEstado({ vistos: vistos.includes(k) ? vistos : [...vistos, k], ultimo: k });
  const caso = ultimo ? MOVIMIENTO[ultimo] : null;
  return (
    <MarcoFigura>
      <Escenario>
        <div role="group" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
          {Object.keys(MOVIMIENTO).map((k) => (
            <Tocable key={k} data-tocable data-movimiento={k} on={ultimo === k} visto={vistos.includes(k)} onClick={() => tocar(k)}>{T.regla.rotulos[k]}</Tocable>
          ))}
        </div>
        <div key={ultimo ?? "-"} className="fae-t1s-forma">
          <TorreSec lado="ambas" alto={16} gap={2} cambio={caso ? cambioDelCaso(caso) : null} />
          <LineaDeAltura />
        </div>
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 9 · La capa 4 (excepción de Mai): sin figura ═══════════ */
export const FICHA_FRASE_A2 = F(14);

/* ═══════════ 10 · El puente: la torre es una foto de un día ═══════════ */
function FiguraPuente() {
  return (
    <MarcoFigura>
      <Escenario centrado>
        <TorreSec lado="ambas" alto={20} encabezado />
        <div aria-hidden="true" style={{ display: "flex", justifyContent: "center" }}>
          <Clock size={24} strokeWidth={1.75} color={SECUNDARIO} />
        </div>
      </Escenario>
    </MarcoFigura>
  );
}

export const PIEZA_ECUACION = conFases({
  id: ID_P2,
  altoFigura: { a320: 184, a375: 184 },
  pantallas: [
    { id: "prediccion", tipo: "apertura", ...sinApoyo(T.prediccion), Figura: FiguraPrediccion },
    { id: "nombres", tipo: "apertura", ...pick(T.nombres), Figura: figuraNombres(false) },
    { id: "ecuacion", tipo: "miralo", ...pick(T.ecuacion), Figura: figuraNombres(true) },
    { id: "dos-lados", tipo: "miralo", ...pick(T.dosLados), Figura: FiguraDosLados },
    { id: "dos-veces", tipo: "miralo", ...pick(T.dosVeces), pasos: 1, rotulosPaso: [T.dosVeces.pasos[2]], Figura: FiguraDosVeces },
    { id: "parada", tipo: "haz", ...sinApoyo(T.parada), resuelta: paradaResuelta, Figura: FiguraParada },
    {
      id: "casos", tipo: "haz", ...sinApoyo(T.casos), pasos: N_CASOS - 1,
      rotulosPaso: CASOS.hechos.slice(1).map((h) => h.hecho.texto), resuelta: itemsResueltos(N_CASOS), Figura: FiguraCasos,
    },
    { id: "regla", tipo: "miralo", ...pick(T.regla), Figura: FiguraRegla },
    { id: "frase", tipo: "haz", ...pick(T.frase), resuelta: paradaResuelta, Figura: figuraFrase(FICHA_FRASE_A2) },
    { id: "puente", tipo: "cierre", ...pick(T.puente), Figura: FiguraPuente },
  ],
});
