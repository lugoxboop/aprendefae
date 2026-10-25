/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LO COMÚN A P2 Y P6 EN SecuenciaAprender (Célula E).
 *
 * Archivo propio, para no chocar con la rama de las condiciones de encendido
 * de #572 (que toca base.jsx). Usa la misma base: las clases y el reparto fijo
 * de base.jsx (modelo 98/148 + 8 + control 44), el mismo haz calificado de
 * secuencia.js y la misma clase `.t3-sec` de la vista. Lo que cambia aquí, y
 * por qué (lo aprendido en #572):
 *
 *   · LA PASTILLA NUNCA TAPA EL MODELO (condición 5 de Takamura). No va en la
 *     esquina del modelo, sino en la zona del apoyo, en línea delante del
 *     primer renglón: «✕ No va aquí» y la pista a continuación. No suma alto:
 *     la pastilla mide 22, lo mismo que un renglón de 14/22.
 *   · MANDA LA PISTA (Itagaki, lote 15): mientras la pista está en el apoyo,
 *     la razón del «Siguiente» se oculta con visibility, así conserva sus 16 px
 *     y nada salta. Nunca se ven las dos. Es una regla de estilo con :has(),
 *     escrita aquí: SecuenciaAprender no se toca.
 *   · CIFRAS EN INTER TABULAR: el sitio no carga ninguna mono (lote 16).
 *   · LO TAPADO (E8): un bloque relleno #0E1B2E con contorno punteado de 1 px
 *     (lote 19) y sin texto debajo
 *     (D9: el lector de pantalla no oye lo que todavía no se ve).
 *   · LA LISTA UNIDA (delta v3 §1, P6-7 y P6-9): las opciones que ocupan la
 *     figura van pegadas, 3 × 44 = 132, con una divisoria de 1 px y el estado
 *     dibujado por dentro (no suma alto). Va en `entera`: arranca arriba del
 *     modelo y baja sobre la separación y la fila de control, que quedan vacías;
 *     la reserva de 150/200 no cambia.
 *   · LA LÍNEA DE DATOS (v2 §1): un bloque `{ datos }` de la zona, 16 px,
 *     encima de la pista.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { CSS_T3S, C, pesos } from "./base.jsx";
import { hazResuelto, mostrarCorrecto, responderHaz, HAZ_INICIAL } from "../../../../secuencia/secuencia.js";

export const CIFRA = '"Inter", sans-serif';
export const TAPADO = "#0E1B2E";
/*
 * El contorno de lo tapado (Takamura, lote 19): el #0E1B2E solo casi no se
 * distingue del fondo. Lleva el mismo punteado de 1 px de «Del resultado a la
 * caja» (ResultadoCaja.jsx, `data-punteado`: 1px dashed, color atenuado #B8C4D4).
 */
export const PUNTEADO_TAPA = C.neutro;
/* El borde de 1 px de las placas y las superficies del modelo (forma v2, §1). */
export const SUPERFICIE = "#1C2939";
export const BORDE_SUP = "1px solid rgba(248,249,250,.12)";

const CSS_P2P6 = `
.t3s2 .t3s-t { position: relative; }
.t3s2-pastilla { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; margin-right: 6px; border-radius: 999px; border: 2px solid ${C.texto}; color: ${C.texto}; font: 600 12px/16px "Inter", sans-serif; white-space: nowrap; vertical-align: 1px; box-sizing: border-box; }
.t3s2-pastilla[data-ver="mal"] { border-color: ${C.error}; color: ${C.error}; }
.t3-sec:has(.t3s2 [data-texto="pista"]) [data-razon] { visibility: hidden; }
.t3s2-tapa { display: inline-block; vertical-align: -3px; height: 14px; border-radius: 3px; background: ${TAPADO}; box-sizing: border-box; border: 1px dashed ${PUNTEADO_TAPA}; }
.t3s2-fila { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; height: 16px; font: 400 12px/16px "Inter", sans-serif; color: ${C.apagado}; white-space: nowrap; min-width: 0; }
.t3s2-fila > span:first-child { min-width: 0; overflow: hidden; text-overflow: clip; }
.t3s2-fila b { font: 600 12px/16px ${CIFRA}; color: ${C.texto}; font-variant-numeric: tabular-nums; }
.t3s2-fila[data-resalta] { color: ${C.texto}; }
.t3s2-campo { flex: 1 1 0; min-width: 0; height: 44px; border-radius: 8px; border: 1px solid ${C.quieto}; background: transparent; color: ${C.texto}; font: 600 14px/18px ${CIFRA}; font-variant-numeric: tabular-nums; padding: 0 10px; box-sizing: border-box; }
.t3s2-campo:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t3s2-campo[data-ver="mal"] { border: 2px solid ${C.error}; }
.t3s2-campo[data-ver="bien"] { border: 2px solid ${C.texto}; }
.t3s2-entera { position: absolute; top: 0; left: 0; right: 0; z-index: 1; }
.t3s2-marca { height: 16px; margin: 0 0 2px; font: 600 12px/16px "Inter", sans-serif; color: ${C.apagado}; text-transform: uppercase; letter-spacing: .02em; white-space: nowrap; }
.t3s2-lista { display: grid; grid-auto-rows: 44px; border-radius: 8px; box-shadow: inset 0 0 0 1px ${C.quieto}; overflow: hidden; }
.t3s2-op { appearance: none; display: grid; grid-template-columns: 44px minmax(0, 1fr); grid-template-rows: 16px 16px; align-content: center; column-gap: 8px; height: 44px; width: 100%; margin: 0; padding: 0 10px; border: 0; border-top: 1px solid rgba(248,249,250,.12); border-radius: 0; background: transparent; color: ${C.texto}; text-align: left; cursor: pointer; font: 400 12px/16px "Inter", sans-serif; }
.t3s2-op:first-child { border-top: 0; border-radius: 8px 8px 0 0; }
.t3s2-op:last-child { border-radius: 0 0 8px 8px; }
.t3s2-op > span { white-space: nowrap; overflow: hidden; text-overflow: clip; min-width: 0; }
.t3s2-op > span:nth-child(odd) { color: ${C.apagado}; }
.t3s2-op > span:nth-child(even) { font-weight: 600; }
.t3s2-op[data-ver] { box-shadow: inset 0 0 0 2px ${C.texto}; }
.t3s2-op[data-ver="mal"] { box-shadow: inset 0 0 0 2px ${C.error}; }
.t3s2-op[aria-disabled="true"] { cursor: default; }
.t3s2-op:focus-visible { outline: 2px solid ${C.texto}; outline-offset: -4px; }
`;

/* La pastilla en línea: «Correcto» en blanco o «No va aquí» en coral (los literales publicados). */
export function Pastilla({ ver }) {
  if (!ver) return null;
  return (
    <span className="t3s2-pastilla" data-ver={ver} data-mensaje={ver === "bien" ? "acierto" : "error"} data-pastilla>
      <span aria-hidden="true">{ver === "bien" ? "✓" : "✕"}</span>
      {ver === "bien" ? "Correcto" : "No va aquí"}
    </span>
  );
}

/**
 * El marco de la figura de P2 y P6. Igual que Figura de base.jsx (mismas
 * clases, mismas medidas, mismos data-*), con la pastilla en la zona.
 *
 * zona  [{ texto, fuerte?, tipo? } | { paso } | { pie } | { rotulo }]
 */
export function FiguraP({ modelo = null, control = null, zona = [], ver = null, entera = null, ...datos }) {
  const bloques = zona.filter(Boolean);
  const primerTexto = bloques.findIndex((z) => z.texto !== undefined && !z.paso && !z.pie && !z.rotulo);
  return (
    <div className="t3s t3s2" {...datos}>
      <style>{CSS_T3S}{CSS_P2P6}</style>
      <div className="t3s-modelo" data-modelo>
        {modelo}
        {entera && <div className="t3s2-entera" data-figura-entera>{entera}</div>}
      </div>
      <div className="t3s-control" data-control>{control}</div>
      <div className="t3s-zona" data-zona aria-live="polite">
        {ver && primerTexto < 0 && <p className="t3s-t" data-texto="veredicto"><Pastilla ver={ver} /></p>}
        {bloques.map((z, k) => (
          z.datos ? <p key={k} className="t3s-cifras" style={{ margin: 0 }} data-linea-datos><DatosEnLinea pares={z.datos} /></p>
            : z.paso ? <p key={k} className="t3s-paso" data-paso-zona>{z.paso}</p>
            : z.pie ? <p key={k} className="t3s-paso" data-pie>{z.pie}</p>
              : z.rotulo ? <p key={k} className="t3s-rot" data-rotulo-zona>{z.rotulo}</p>
                : (
                  <p key={k} className="t3s-t" data-fuerte={z.fuerte ? "" : undefined} data-texto={z.tipo ?? "apoyo"}>
                    {k === primerTexto && <Pastilla ver={ver} />}
                    {z.texto}
                  </p>
                )
        ))}
      </div>
    </div>
  );
}

/** La línea de datos: [[rótulo, monto]] o [[rótulo]] (un rótulo solo, sin cifra), unidos por « · ». */
function DatosEnLinea({ pares }) {
  return pares.map(([nombre, monto], k) => (
    <span key={nombre}>
      {k > 0 && " · "}
      {nombre}{monto === undefined ? null : <> <b data-monto>{pesos(monto)}</b></>}
    </span>
  ));
}

/** Un monto tapado (E8): un bloque, sin la cifra debajo. El lector oye «tapado». */
export function Tapado({ ancho = 64, nombre = "tapado" }) {
  return (
    <>
      <span className="t3s2-tapa" aria-hidden="true" data-tapado style={{ width: `${ancho}px` }} />
      <span className="t3s-sr">{nombre}</span>
    </>
  );
}

/** Una cifra en Inter tabular, o tapada. */
export const Monto = ({ monto, tapado = false, ancho }) => (tapado ? <Tapado ancho={ancho} /> : <b data-monto>{pesos(monto)}</b>);

/**
 * La línea de lectura de 16 px: «Caja $X · Utilidad $Y» (Inter 12 #A8B6C8, las
 * cifras en Inter 12 tabular #F8F9FA). `pares` = [[rótulo, monto, tapado?]].
 */
export function Lectura({ pares }) {
  return (
    <div className="t3s-cifras" data-lectura>
      {pares.map(([nombre, monto, tapado], k) => (
        <span key={nombre}>
          {k > 0 && " · "}
          {nombre} <Monto monto={monto} tapado={tapado} ancho={52} />
        </span>
      ))}
    </div>
  );
}

/** Un renglón rótulo · cifra (16 px), para las pilas y el estado de resultados. */
export function Renglon({ rotulo, monto = null, tapado = false, resalta = false, ...datos }) {
  return (
    <div className="t3s2-fila" data-resalta={resalta ? "" : undefined} {...datos}>
      <span>{rotulo}</span>
      {monto === null ? <span /> : <Monto monto={monto} tapado={tapado} ancho={72} />}
    </div>
  );
}

/*
 * ═══════════ O4 MINI EN 72 PX ═══════════
 *
 * Dos barras (rótulo 16 + barra 8) y el renglón del resultado (16), con 4 de
 * aire: 24 + 4 + 24 + 4 + 16 = 72. La forma v2 da a O4 mini 86 px, pero en P2
 * el área del objeto es de 72 (72 + 4 + lectura 16 = 92 de 98): cabe en 72
 * con las barras de 8 en lugar de 10 y el resultado en 12/16. Anotado en el PR.
 *
 * filas = [{ nombre, monto, vacia? }] · max: el 100 % de las barras
 */
export function O4Mini({ filas, max, resultado = null }) {
  return (
    <div data-o4-mini style={{ display: "grid", gridTemplateRows: "24px 24px 16px", rowGap: "4px" }}>
      {filas.map((f) => (
        <div key={f.nombre} style={{ display: "grid", gridTemplateRows: "16px 8px" }} data-o4-fila={f.nombre}>
          <div className="t3s-cifras">{f.nombre} {f.vacia ? null : <b>{pesos(f.monto)}</b>}</div>
          <div style={{ height: "8px", background: "rgba(248,249,250,.08)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "8px", width: f.vacia ? 0 : `${Math.min(100, (f.monto / max) * 100)}%`, background: C.neutro, borderRadius: "2px", transition: "width 240ms cubic-bezier(.3,.9,.4,1)" }} />
          </div>
        </div>
      ))}
      <div data-o4-resultado style={{ height: "16px", font: `700 12px/16px "Inter", sans-serif`, color: C.texto }}>{resultado}</div>
    </div>
  );
}

/* ═══════════ EL CAMPO DE LA CIFRA (r5), con puntos de miles mientras se escribe ═══════════ */

export const CAMPO_INICIAL = { ...HAZ_INICIAL, eleccion: null, valor: "" };
export const leerCifra = (v) => {
  const d = String(v ?? "").replace(/[^\d]/g, "");
  return d === "" ? null : Number(d);
};
export const conPuntos = (v) => {
  const d = String(v ?? "").replace(/[^\d]/g, "").slice(0, 9);
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/** Califica la cifra escrita. Ya resuelto no se califica otra vez. */
export function escribir(estado, correcta) {
  const e = estado ?? CAMPO_INICIAL;
  if (hazResuelto(e)) return e;
  const n = leerCifra(e.valor);
  if (n === null) return e;
  return { ...e, ...responderHaz(e, n === correcta), eleccion: n };
}

/*
 * El campo y su botón. El literal del botón es el de P5-6 (#572, con PASA del
 * lote 15), para que los campos de T3 se usen igual; queda anotado en el PR
 * porque la forma dice que en Aprender no hay «Comprobar».
 */
export function CampoCifra({ estado, setEstado, correcta, nombre, ver = null }) {
  const e = estado ?? CAMPO_INICIAL;
  const listo = hazResuelto(e);
  const vacio = leerCifra(e.valor) === null;
  return (
    <div style={{ display: "flex", gap: "8px", flex: "1 1 0", minWidth: 0 }}>
      <input
        className="t3s2-campo"
        aria-label={nombre}
        inputMode="numeric"
        autoComplete="off"
        value={listo && mostrarCorrecto(e) ? conPuntos(correcta) : e.valor}
        disabled={listo}
        data-ver={ver ?? undefined}
        onChange={(ev) => { const v = conPuntos(ev.target.value); setEstado((s) => ({ ...(s ?? CAMPO_INICIAL), valor: v })); }}
        onKeyDown={(ev) => { if (ev.key === "Enter" && !listo) setEstado((s) => escribir(s, correcta)); }}
      />
      <button
        type="button"
        className="t3s-ctl"
        style={{ flex: "0 0 112px" }}
        aria-disabled={listo || vacio ? "true" : undefined}
        onClick={listo || vacio ? undefined : () => setEstado((s) => escribir(s, correcta))}
      >
        Comprobar
      </button>
    </div>
  );
}

/*
 * La pastilla de un Haz en que CADA TOQUE SE CALIFICA (P2-2 y P2-7): el toque
 * que acierta lleva «Correcto» aunque falte la otra clave; el que falla, «No va
 * aquí». verHaz no sirve aquí: con una clave marcada y la otra por tocar, ok
 * sigue en false y daría «No va aquí» a un toque correcto.
 */
export function verToque(e) {
  if (!e?.ultimo) return null;
  return e.ultimo === "acierto" ? "bien" : "mal";
}

/*
 * La lista unida (delta v3 §1). Cada opción es un asiento: «Debe X» y «Haber
 * Y», en dos renglones de 16. El estado se dibuja por dentro (2 px #F8F9FA o
 * coral). `marca`: el renglón de 16 + 2 de aire encima de la lista (P6-9).
 */
export function ListaUnida({ opciones, estado, correcta, onElegir, nombre, marca = null, verDe }) {
  const resuelto = hazResuelto(estado);
  return (
    <div data-lista-bloque>
      {marca && <p className="t3s2-marca" data-marca-escenario>{marca}</p>}
      <div className="t3s2-lista" role="group" aria-label={nombre} data-lista-unida>
        {opciones.map((o) => {
          const ver = verDe(estado, o.id, correcta);
          return (
            <button
              key={o.id}
              type="button"
              className="t3s2-op"
              data-opcion={o.id}
              data-ver={ver ?? undefined}
              aria-disabled={resuelto ? "true" : undefined}
              aria-pressed={estado?.eleccion === o.id ? "true" : "false"}
              aria-label={`Debe ${o.debe}; haber ${o.haber}`}
              onClick={resuelto ? undefined : () => onElegir(o.id)}
            >
              <span aria-hidden="true">Debe</span><span aria-hidden="true">{o.debe}</span>
              <span aria-hidden="true">Haber</span><span aria-hidden="true">{o.haber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* La pastilla de un haz de una sola respuesta, como verDe de base.jsx: acierto «Correcto»; error «No va aquí». */
export function verHaz(e) {
  if (!e?.ultimo) return null;
  return e.ok ? "bien" : "mal";
}
