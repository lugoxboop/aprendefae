/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A0 «El activo corriente» — LOS SLIDES (Hanayama §3, A0).
 *
 * La figura es «El año en marcha» en compacto: el nombre a la izquierda de
 * cada fila (112 px) y el año a la derecha, con la raya al 65 %. Sin la pista
 * que se arrastra y sin `Pista`: el año lo mueven las decisiones (D9). Cada
 * fila resuelta corre hasta su mes a 220 ms por mes (§5) y se marca «plata»
 * o «se consumió»; la que no se vuelve plata cruza la raya.
 *
 *   1 · cual-cruza   Haz     tres filas, cada una con dos casillas (antes y
 *                            después de la raya), calificada al tocarla
 *   2 · va-primero   Haz     cuatro filas que se tocan enteras; ninguna
 *                            muestra su marca antes de decidir
 *   3 · se-consume   Haz     el arriendo y tres opciones de palabras
 *   4 · por-que-importan    Cierre: caja y edificio, quietos en el mes 12
 *
 * La fila corre cuando queda resuelta (acierto o segundo error), no con el
 * primer error: si corriera, el reintento ya no decidiría nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useRef } from "react";
import { FIGURA_ANO } from "../../../data/contabilidadT4A0.js";
import { A0_ID, CABECERA_A0, OPCIONES_ARRIENDO, RAYA_SLIDES_A0 as RAYA, SLIDES_A0, ladoA0 } from "../../../data/contabilidadT4SlidesA0.js";
import { C } from "../comun.jsx";
import {
  Banda, Control, HAZ_VACIO, Opciones, RAZON_HAZ, Slide, calificar, colocada, correctoTarjeta, resueltaTarjeta,
  tarjeta, todasResueltas, useTerminada, verDe,
} from "./comun.jsx";

const MS_POR_MES = 220;
const CURVA = "cubic-bezier(.3,.9,.4,1)";

export const CSS_SLIDES_A0 = `
.t4s0-cab { position: relative; height: 26px; margin-left: 112px; font: 600 12px/13px "Inter", sans-serif; }
.t4s0-cab > span { position: absolute; top: 0; display: grid; }
.t4s0-filas { display: grid; gap: 4px; }
.t4s0-fila { display: grid; grid-template-columns: 112px minmax(0, 1fr); align-items: center; min-height: 47px; min-width: 0; }
.t4s0-nom { display: grid; padding-right: 6px; font: 400 13px/16px "Inter", sans-serif; color: ${C.texto2}; min-width: 0; text-align: left; }
.t4s0-nom > .g { font-size: 12px; line-height: 15px; }
.t4s0-fila[data-estado="plata"] .t4s0-nom, .t4s0-fila[data-estado="consumio"] .t4s0-nom { color: ${C.texto}; }
.t4s0-carril { position: relative; height: 44px; min-width: 0; }
.t4s0-base { position: absolute; left: 0; width: ${RAYA}%; top: 21px; height: 1px; background: rgba(184,196,212,0.35); }
.t4s0-raya { position: absolute; left: calc(${RAYA}% - 1px); top: -4px; bottom: -4px; width: 2px; background: ${C.texto}; pointer-events: none; z-index: 2; }
.t4s0-mano { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.t4s0-tic { position: absolute; left: 0; top: 14px; width: 2px; height: 16px; margin-left: -1px; background: ${C.texto}; }
.t4s0-chip { position: absolute; top: 12px; height: 20px; padding: 0 5px; border: 1px solid ${C.texto}; border-radius: 6px; background: ${C.fondo}; font: 600 12px/18px "Inter", sans-serif; color: ${C.texto}; white-space: nowrap; pointer-events: none; z-index: 3; }
.t4s0-cruza { position: absolute; left: ${RAYA}%; right: 0; top: 20px; height: 2px; background: ${C.texto2}; pointer-events: none; z-index: 3; }
.t4s0-cruza::after { content: ""; position: absolute; right: 0; top: -4px; border-left: 7px solid ${C.texto2}; border-top: 5px solid transparent; border-bottom: 5px solid transparent; }
.t4s0-retrasa { animation: t4s-aparece 120ms ${CURVA} both; }
.t4s0-casilla { position: absolute; top: 0; height: 44px; }
/* La fila que se toca entera (p2): 47 px con el borde; el nombre en renglones de 15 para que tres quepan. */
button.t4s0-fila { width: 100%; height: 47px; min-height: 47px; padding: 0 0 0 6px; text-align: left; font: inherit; }
button.t4s0-fila[data-ver] { padding: 0 0 0 5px; }
button.t4s0-fila .t4s0-nom { line-height: 15px; }
`;

/* La columna del año de una fila: la base, la raya y, si corre, la mano, la marca o la flecha que cruza. */
function Carril({ fila, corre, casillas = null }) {
  /* Si al montar ya corría (se volvió con «Anterior»), se dibuja asentada: sin animar. */
  const asentada = useRef(corre).current;
  const meses = fila.mes ?? 12;
  const x = (meses / 12) * RAYA;
  const dur = asentada ? 0 : meses * MS_POR_MES;
  const marca = fila.mes == null ? null : fila.consume ? FIGURA_ANO.marca.consumio : FIGURA_ANO.marca.plata;
  const retraso = { animationDelay: `${dur}ms`, animationDuration: asentada ? "0ms" : undefined };
  return (
    <span className="t4s0-carril" aria-hidden={casillas ? undefined : "true"} style={{ display: "block" }}>
      <span className="t4s0-base" aria-hidden="true" />
      {casillas}
      <span className="t4s0-raya" aria-hidden="true" />
      {/* La mano está siempre, quieta en «hoy» y sin verse: al quedar `corre`, se mueve (solo transform y opacity). */}
      <span className="t4s0-mano" aria-hidden="true" data-corre={corre ? fila.id : undefined}
        style={{ transform: `translateX(${corre ? x : 0}%)`, opacity: corre ? 1 : 0, transition: asentada ? "none" : `transform ${dur}ms ${CURVA}` }}>
        <span className="t4s0-tic" />
      </span>
      {corre && marca && (
        <span className="t4s0-chip t4s0-retrasa" data-marca-fila={fila.consume ? "consumio" : "plata"} aria-hidden="true"
          style={{ ...(x > 30 ? { right: `calc(${100 - x}% + 5px)` } : { left: `calc(${x}% + 5px)` }), ...retraso }}>{marca}</span>
      )}
      {corre && !marca && <span className="t4s0-cruza t4s0-retrasa" data-cruza aria-hidden="true" style={retraso} />}
    </span>
  );
}

const estadoDe = (fila, corre) => (!corre ? "espera" : fila.mes == null ? "despues" : fila.consume ? "consumio" : "plata");

function Nombre({ fila }) {
  return (
    <span className="t4s0-nom">
      {fila.texto.map((t) => <span key={t}>{t}</span>)}
      {fila.glosa.map((t) => <span key={t} className="g">{t}</span>)}
    </span>
  );
}

function Fila({ fila, corre, casillas = null }) {
  return (
    <div className="t4s0-fila" data-fila={fila.id} data-estado={estadoDe(fila, corre)}>
      <Nombre fila={fila} />
      <Carril fila={fila} corre={corre} casillas={casillas} />
    </div>
  );
}

const Cabecera = () => (
  <div className="t4s0-cab" aria-hidden="true">
    <span style={{ left: 0 }}>{CABECERA_A0.si.map((t) => <span key={t}>{t}</span>)}</span>
    <span style={{ right: 0, textAlign: "right", color: C.texto2 }}>{CABECERA_A0.no.map((t) => <span key={t}>{t}</span>)}</span>
  </div>
);

/* ═══════════ 1 · cual-cruza ═══════════ */

function devCruza(t, e, filas) {
  const ids = filas.map((f) => f.id);
  const foco = tarjeta(e, e?.foco);
  if (!foco) return null;
  const fin = todasResueltas(e, ids);
  if (correctoTarjeta(e, e.foco)) return { ver: "mal", textos: [t.porque], n: foco.intentos };
  if (foco.ok) return { ver: "bien", textos: fin ? t.acierto : [] };
  const errorDeuda = e.foco === t.deuda && foco.eleccion === "antes";
  return { ver: "mal", textos: [errorDeuda ? t.errorDeuda : t.error], n: foco.intentos };
}

function FiguraCruza({ t, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  return (
    <Slide banda={<Banda antes={t.antes} dev={devCruza(t, e, t.filas)} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.error] }, { ver: "mal", textos: [t.errorDeuda] }, { ver: "mal", textos: [t.porque] },
    ]} />}>
      <Cabecera />
      <div className="t4s0-filas">
        {t.filas.map((f) => {
          const correcta = ladoA0(f);
          const hecha = resueltaTarjeta(e, f.id);
          const casillas = ["antes", "despues"].map((lado) => (
            <Control
              key={lado}
              className="t4s0-casilla"
              data-seg={lado}
              ver={verDe(e, f.id, lado, correcta)}
              apagado={hecha}
              nombre={`${f.texto.join(" ")}: ${FIGURA_ANO.casilla[lado]}`}
              aria-pressed={tarjeta(e, f.id)?.eleccion === lado}
              onClick={() => setEstado((x) => calificar(x, f.id, lado, correcta))}
              style={lado === "antes" ? { left: 0, width: `calc(${RAYA}% - 4px)` } : { left: `calc(${RAYA}% + 4px)`, right: 0 }}
            />
          ));
          return <Fila key={f.id} fila={f} corre={colocada(e, f.id, correcta) != null} casillas={casillas} />;
        })}
      </div>
    </Slide>
  );
}

/* ═══════════ 2 · va-primero ═══════════ */

function devPrimero(t, e) {
  const x = tarjeta(e, "primero");
  if (!x) return null;
  if (correctoTarjeta(e, "primero")) return { ver: "mal", textos: [t.porque] };
  if (x.ok) return { ver: "bien", textos: t.acierto };
  return { ver: "mal", textos: [t.errores[x.eleccion]], n: x.intentos };
}

function FiguraPrimero({ t, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "primero");
  return (
    <Slide banda={<Banda antes={t.antes} dev={devPrimero(t, e)} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
    ]} />}>
      <div className="t4s0-filas" role="group" aria-label={t.titular}>
        {t.filas.map((f) => {
          const ver = verDe(e, "primero", f.id, t.correcta);
          return (
            <Control
              key={f.id}
              className="t4s0-fila"
              data-fila={f.id}
              data-estado={estadoDe(f, hecha)}
              ver={ver}
              apagado={hecha}
              nombre={[...f.texto, ...f.glosa].join(" ")}
              onClick={() => setEstado((x) => calificar(x, "primero", f.id, t.correcta))}
            >
              <Nombre fila={f} />
              <Carril fila={f} corre={hecha} />
            </Control>
          );
        })}
      </div>
    </Slide>
  );
}

/* ═══════════ 3 · se-consume ═══════════ */

function devConsume(t, e) {
  const x = tarjeta(e, "arriendo");
  if (!x) return null;
  if (correctoTarjeta(e, "arriendo")) return { ver: "mal", textos: [t.porque] };
  if (x.ok) return { ver: "bien", textos: t.acierto };
  return { ver: "mal", textos: [t.errores[x.eleccion]], n: x.intentos };
}

function FiguraConsume({ t, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "arriendo");
  return (
    <Slide banda={<Banda antes={t.antes} dev={devConsume(t, e)} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
    ]} />}>
      <Cabecera />
      <Fila fila={t.fila} corre={hecha} />
      <Opciones
        opciones={OPCIONES_ARRIENDO}
        etiqueta={t.titular}
        apagadas={hecha}
        ver={(id) => verDe(e, "arriendo", id, t.correcta)}
        onElegir={(id) => setEstado((x) => calificar(x, "arriendo", id, t.correcta))}
      />
    </Slide>
  );
}

/* ═══════════ 4 · por-que-importan (Cierre) ═══════════ */

function FiguraSeparar({ t }) {
  useTerminada(A0_ID);
  return (
    <Slide banda={<Banda antes={[t.cierre]} siguiente={t.siguiente} pie={t.pie} />}>
      <Cabecera />
      <div className="t4s0-filas">
        {t.filas.map((f) => <Fila key={f.id} fila={f} corre />)}
      </div>
    </Slide>
  );
}

/* ═══════════ La pieza ═══════════ */

const NOMBRE_FIGURA = "Activos en filas sobre el año, con la raya de un año entre corriente y no corriente";

export function piezaSlidesA0(caso = 1) {
  const t = SLIDES_A0[caso] ?? SLIDES_A0[1];
  const con = (Fig, datos) => (props) => <Fig t={datos} {...props} />;
  return {
    id: A0_ID,
    pantallas: [
      {
        id: "cual-cruza", tipo: "haz", titular: t.cruza.titular, antes: t.cruza.antes, Figura: con(FiguraCruza, t.cruza), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: HAZ_VACIO, resuelta: (e) => todasResueltas(e, t.cruza.filas.map((f) => f.id)), razon: RAZON_HAZ,
      },
      {
        id: "va-primero", tipo: "haz", titular: t.primero.titular, antes: t.primero.antes, Figura: con(FiguraPrimero, t.primero), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, "primero"), razon: RAZON_HAZ,
      },
      {
        id: "se-consume", tipo: "haz", titular: t.consume.titular, antes: t.consume.antes, Figura: con(FiguraConsume, t.consume), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, "arriendo"), razon: RAZON_HAZ,
      },
      {
        id: "por-que-importan", tipo: "cierre", titular: t.separar.titular, antes: [t.separar.cierre], Figura: con(FiguraSeparar, t.separar), nombreFigura: NOMBRE_FIGURA,
      },
    ],
    /* Para las pruebas y la sonda: lo que la banda puede decir, por pantalla. */
    textos: t,
  };
}
