import { FAE } from "../../../../theme.js";
import { HAZ_INICIAL, hazResuelto, mostrarCorrecto } from "../../../secuencia/secuencia.js";
import { LAVADO_DE_AUTOS } from "../../../../data/contabilidad.js";
import { DEL_DIARIO_AL_MAYOR } from "../../../../data/contabilidadAprender.js";
import { P5_ID, P5_OBJETIVO, P5_TEXTOS as T, P5_ALTO_FIGURA } from "../../../../data/contabilidadT2Secuencia.js";
import {
  BLANCO, LINEA, CONTORNO, SUAVE, SECUNDARIO, pesos, Raiz, Encabezado, Rotulo, Lado, Control, Fila,
  responder, leerHaz, marcaDe, colaInicial, colaResuelta, fichaActual, responderCola,
} from "./secuenciaComun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · P5 «Del diario al mayor» EN SECUENCIA — las figuras y la pieza.
 *
 * Forma: c-t2-3-watari-figuras.md §5 (8 pantallas), con el delta T2-7
 * (altoFigura 197; los nueve hechos de «Verlos por fecha» a 12/15 px, sin
 * relleno vertical, y el hecho con Bancos con fondo y barra). Objeto propio:
 * el renglón que viaja del diario a su T. Datos: ene-03 y los nueve hechos de
 * Lavado (pp. 98-101) y el asiento del 1 de julio (asientoDeEjemplo).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HECHOS = LAVADO_DE_AUTOS.transacciones;
const ENE03 = HECHOS.find((t) => t.id === "ene-03");
/* Las cuatro líneas del 3 de enero, en el orden del diario. */
const LINEAS = [...ENE03.asiento.debe.map(([c, v]) => ({ cuenta: c, valor: v, lado: "debe" })), ...ENE03.asiento.haber.map(([c, v]) => ({ cuenta: c, valor: v, lado: "haber" }))];
const toca = (t, cuenta) => [...t.asiento.debe, ...t.asiento.haber].some(([c]) => c === cuenta);
/* La T de Bancos: cada movimiento de enero, en su lado. */
const BANCOS = {
  debe: HECHOS.flatMap((t) => t.asiento.debe.filter(([c]) => c === "Bancos").map(([, v]) => ({ fecha: t.fecha, valor: v }))),
  haber: HECHOS.flatMap((t) => t.asiento.haber.filter(([c]) => c === "Bancos").map(([, v]) => ({ fecha: t.fecha, valor: v }))),
};
const JULIO = DEL_DIARIO_AL_MAYOR.asientoDeEjemplo;

/* ─────────────── el diario ─────────────── */

/* Las columnas de cifras se ajustan a su contenido (12 px): a 320 el detalle se queda con el resto. */
const COLUMNAS = "auto minmax(0,1fr) auto auto";
const celda = { fontSize: "12px", lineHeight: "15px", fontVariantNumeric: "tabular-nums", minWidth: 0 };

/* Un renglón del diario: fecha · detalle · debe · haber. `corrido`: la cuenta del haber, un poco a la derecha. */
function RenglonDiario({ fecha, cuenta, debe, haber, corrido, encendido, clase, estilo }) {
  return (
    <div className={clase} data-encendido={encendido ? "true" : undefined} style={{
      display: "grid", gridTemplateColumns: COLUMNAS, columnGap: "6px", padding: "0 4px", ...estilo,
      ...(encendido ? { background: "rgba(248,249,250,0.08)", boxShadow: `inset 3px 0 0 ${BLANCO}` } : {}),
    }}>
      <span style={{ ...celda, color: SECUNDARIO }}>{fecha ?? ""}</span>
      <span style={{ ...celda, overflowWrap: "anywhere", paddingLeft: corrido ? "12px" : 0 }}>{cuenta}</span>
      <span style={{ ...celda, textAlign: "right" }}>{debe ? pesos(debe).slice(1) : ""}</span>
      <span style={{ ...celda, textAlign: "right" }}>{haber ? pesos(haber).slice(1) : ""}</span>
    </div>
  );
}

function CabeceraDiario({ visible }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: COLUMNAS, columnGap: "6px", padding: "0 4px", borderBottom: `1px solid ${LINEA}`, minHeight: "16px" }}>
      {T.diario.columnas.map((c, k) => (
        <span key={c} className={visible ? "fae-t2s-cae" : undefined} style={{ ...celda, fontWeight: 700, color: visible ? FAE.text : "transparent", textAlign: k > 1 ? "right" : "left" }}>{c}</span>
      ))}
    </div>
  );
}

/* El asiento del 3 de enero en el diario. */
function DiarioEne03({ encender, anima, cabecera = true }) {
  return (
    <div>
      {cabecera && <CabeceraDiario visible />}
      {LINEAS.map((l, k) => (
        <RenglonDiario key={l.cuenta} fecha={k === 0 ? ENE03.fecha : null} cuenta={l.cuenta} corrido={l.lado === "haber"}
          debe={l.lado === "debe" ? l.valor : null} haber={l.lado === "haber" ? l.valor : null} encendido={encender === l.cuenta}
          clase={anima ? "fae-t2s-llega" : undefined} estilo={anima ? { animationDelay: `${140 * k}ms` } : undefined} />
      ))}
    </div>
  );
}

/* Una T chica del mayor: el nombre y sus dos lados. */
function TChica({ nombre, debe = [], haber = [], encender }) {
  const lado = (xs) => xs.map((m) => <span key={`${m.fecha}-${m.valor}`} data-encendido={m.fecha === encender ? "true" : undefined} style={{ ...celda, display: "flex", justifyContent: "space-between", gap: "2px", ...(m.fecha === encender ? { background: "rgba(248,249,250,0.08)", boxShadow: `inset 3px 0 0 ${BLANCO}` } : {}) }}><span style={{ color: SECUNDARIO }}>{m.fecha}</span><span>{pesos(m.valor)}</span></span>);
  return (
    <div style={{ minWidth: 0 }}>
      <Encabezado nombre={nombre} chico />
      <div style={{ display: "flex", minHeight: "18px" }}>
        <div style={{ flex: "1 1 0", minWidth: 0, padding: "0 3px" }}>{lado(debe)}</div>
        <div style={{ flex: "1 1 0", minWidth: 0, padding: "0 3px", borderLeft: `2px solid ${LINEA}` }}>{lado(haber)}</div>
      </div>
    </div>
  );
}

/* ─────────────── 0 · Apertura: el asiento del 3 de enero se escribe solo ─────────────── */

function FiguraApertura({ primeraVez, reducido }) {
  return <Raiz><DiarioEne03 anima={primeraVez && !reducido} /></Raiz>;
}

/* ─────────────── 1 · Haz sin calificar: ¿por fecha o por cuenta? ─────────────── */

function FiguraFechaOCuenta({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  const [porFecha, porCuenta] = T.fechaOCuenta.opciones;
  return (
    <Raiz>
      {elegida === porCuenta ? (
        <div key="cuenta" className="fae-t2s-cae">
          <TChica nombre="Bancos" debe={BANCOS.debe} haber={BANCOS.haber} />
        </div>
      ) : (
        <div key="fecha" data-nueve style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {HECHOS.map((t) => (
            <p key={t.id} className={elegida && toca(t, "Bancos") ? "fae-t2s-cae" : undefined} data-encendido={elegida === porFecha && toca(t, "Bancos") ? "true" : undefined} style={{
              margin: 0, padding: "0 4px", fontSize: "12px", lineHeight: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              ...(elegida === porFecha && toca(t, "Bancos") ? { background: "rgba(248,249,250,0.08)", boxShadow: `inset 3px 0 0 ${BLANCO}` } : {}),
            }}>
              <span style={{ color: SECUNDARIO }}>{t.fecha}</span> · {[...t.asiento.debe, ...t.asiento.haber].map(([c]) => c).join(" · ")}
            </p>
          ))}
        </div>
      )}
      <Fila>
        {T.fechaOCuenta.opciones.map((op) => <Control key={op} chico onClick={() => setEstado({ elegida: op })} elegido={elegida === op}>{op}</Control>)}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 2 · Míralo: tocar el asiento nombra sus columnas ─────────────── */

function FiguraDiario({ estado, setEstado }) {
  const nombradas = Boolean(estado?.nombradas);
  return (
    <Raiz>
      <button type="button" className="fae-t2s-boton" onClick={() => setEstado({ nombradas: true })} aria-pressed={nombradas ? "true" : "false"} aria-label="El asiento del 3 de enero"
        style={{ width: "100%", minHeight: "44px", padding: "4px 0", borderRadius: "8px", border: `1px solid ${nombradas ? BLANCO : CONTORNO}`, background: "transparent", color: FAE.text, cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}>
        <CabeceraDiario visible={nombradas} />
        <DiarioEne03 cabecera={false} />
      </button>
    </Raiz>
  );
}

/* ─────────────── 3 · Míralo: el haber se corre a la derecha y llega la explicación ─────────────── */

function FiguraComoSeEscribe({ estado, setEstado }) {
  const corrido = Boolean(estado?.corrido);
  return (
    <Raiz>
      <button type="button" className="fae-t2s-boton" onClick={() => setEstado({ corrido: true })} aria-pressed={corrido ? "true" : "false"} aria-label={`El asiento del ${JULIO.fecha}`}
        style={{ width: "100%", minHeight: "44px", padding: "4px 0", borderRadius: "8px", border: `1px solid ${corrido ? BLANCO : CONTORNO}`, background: "transparent", color: FAE.text, cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}>
        <CabeceraDiario visible />
        {JULIO.debe.map(([c, v]) => <RenglonDiario key={c} fecha={JULIO.fecha} cuenta={c} debe={v} />)}
        {JULIO.haber.map(([c, v]) => <RenglonDiario key={c} cuenta={c} haber={v} corrido={corrido} />)}
        {corrido && <RenglonDiario clase="fae-t2s-cae" cuenta={<span style={{ color: SUAVE }}>{JULIO.nota}</span>} />}
      </button>
    </Raiz>
  );
}

/* ─────────────── 4 · Míralo: «Ver el mayor» y las cuatro T vacías ─────────────── */

function CuatroT({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px", marginTop: "8px" }}>{children}</div>;
}

function FiguraMayor({ estado, setEstado }) {
  const visto = Boolean(estado?.visto);
  return (
    <Raiz>
      <DiarioEne03 />
      {visto
        ? <CuatroT>{LINEAS.map((l) => <div key={l.cuenta} className="fae-t2s-cae"><TChica nombre={l.cuenta} /></div>)}</CuatroT>
        : <Fila><Control onClick={() => setEstado({ visto: true })}>{T.mayor.control}</Control></Fila>}
    </Raiz>
  );
}

/* ─────────────── 5 · Haz de cuatro fichas: mayorizar ─────────────── */

const ladoBueno = (k) => LINEAS[k].lado;
const destinoDe = (cuenta, lado) => `${cuenta}|${lado}`;

function FiguraMayorizar({ estado, setEstado }) {
  const e = estado ?? colaInicial(LINEAS.length);
  const k = fichaActual(e);
  const actual = k >= 0 ? LINEAS[k] : null;
  const tocar = (cuenta, lado) => { if (actual && cuenta === actual.cuenta) responderCola(setEstado, (i, d) => d === destinoDe(LINEAS[i].cuenta, ladoBueno(i)), destinoDe(cuenta, lado)); };
  const marca = (cuenta, lado) => {
    if (e.item === null || e.item === undefined || LINEAS[e.item].cuenta !== cuenta) return null;
    const r = e.cola[e.item];
    if (e.eleccion === destinoDe(cuenta, lado) && r.ultimo) return r.ok ? "bien" : "mal";
    if (mostrarCorrecto(r) && lado === ladoBueno(e.item)) return "verdad";
    return null;
  };
  const valorEn = (i, lado) => {
    const r = e.cola[i];
    if (hazResuelto(r) && lado === ladoBueno(i)) return <span className="fae-t2s-cae" data-valor style={{ ...celda, display: "block", textAlign: "center", padding: "0 2px", borderRadius: "4px", border: `2px solid ${mostrarCorrecto(r) ? BLANCO : "transparent"}` }}>{pesos(LINEAS[i].valor)}</span>;
    if (!hazResuelto(r) && r.ultimo === "error" && e.destinos[i] === destinoDe(LINEAS[i].cuenta, lado)) return <span className="fae-t2s-cae" data-valor="error" style={{ ...celda, display: "block", textAlign: "center", padding: "0 2px", borderRadius: "4px", border: `2px dashed ${FAE.coral}`, color: FAE.coral }}>{pesos(LINEAS[i].valor)}</span>;
    return null;
  };
  return (
    <Raiz>
      <div style={{ minHeight: "19px", border: `1px solid ${actual ? LINEA : "transparent"}`, borderRadius: "6px" }}>
        {actual && <RenglonDiario key={k} clase="fae-t2s-llega" fecha={ENE03.fecha} cuenta={actual.cuenta} debe={actual.lado === "debe" ? actual.valor : null} haber={actual.lado === "haber" ? actual.valor : null} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 8px", marginTop: "6px" }}>
        {LINEAS.map((l, i) => (
          <div key={l.cuenta} style={{ minWidth: 0 }}>
            <Encabezado nombre={l.cuenta} chico />
            <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
              {["debe", "haber"].map((lado) => (
                <Lado key={lado} onClick={() => tocar(l.cuenta, lado)} disabled={!actual || actual.cuenta !== l.cuenta} etiqueta={`${l.cuenta}, ${lado}`}
                  marca={marca(l.cuenta, lado)} style={{ padding: "2px", gap: "1px" }}>
                  <Rotulo lado={lado}>{lado === "debe" ? "DEBE" : "HABER"}</Rotulo>
                  {valorEn(i, lado)}
                </Lado>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Raiz>
  );
}

/* ─────────────── 6 · Haz calificado: dos preguntas ─────────────── */

function FiguraDosPreguntas({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const [porFecha, porCuenta] = T.dosPreguntas.opciones;
  const banco03 = LINEAS.find((l) => l.cuenta === "Bancos");
  return (
    <Raiz>
      <div style={{ border: `1px solid ${LINEA}`, borderRadius: "6px" }}>
        <RenglonDiario fecha={ENE03.fecha} cuenta="Bancos" haber={banco03.valor} corrido encendido={verdad} />
      </div>
      <div style={{ marginTop: "6px" }}>
        {error ? (
          /* El mayor en orden de fecha, punteado y en coral: sería otro diario. La T no cambia de verdad. */
          <div className="fae-t2s-cae" data-mayor-error style={{ border: `2px dashed ${FAE.coral}`, borderRadius: "6px", color: FAE.coral }}>
            {LINEAS.map((l, k) => <RenglonDiario key={l.cuenta} fecha={k === 0 ? ENE03.fecha : null} cuenta={l.cuenta} debe={l.lado === "debe" ? l.valor : null} haber={l.lado === "haber" ? l.valor : null} />)}
          </div>
        ) : (
          <TChica nombre="Bancos" debe={BANCOS.debe} haber={BANCOS.haber} encender={verdad ? ENE03.fecha : null} />
        )}
      </div>
      <Fila>
        {[porFecha, porCuenta].map((op) => (
          <Control key={op} chico onClick={() => { if (!resuelto) responder(setEstado, op === porCuenta, op); }} elegido={e.eleccion === op} marca={marcaDe(e, op, porCuenta)}>{op}</Control>
        ))}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 7 · Cierre: el diario de ene-03 con el renglón de Bancos encendido ─────────────── */

function FiguraCierre() {
  return <Raiz><DiarioEne03 encender="Bancos" /></Raiz>;
}

/* ─────────────── la pieza ─────────────── */

const devolucionDe = (t) => () => ({ pista: t.pista, porque: t.porque, consecuencia: t.consecuencia ?? null });

export const PIEZA_P5 = {
  id: P5_ID,
  objetivo: P5_OBJETIVO,
  altoFigura: P5_ALTO_FIGURA,
  pantallas: [
    { id: "objetivo", tipo: "apertura", titular: T.apertura.titular, apoyo: T.apertura.apoyo, Figura: FiguraApertura, nombreFigura: "El asiento del 3 de enero en el diario" },
    {
      id: "fecha-o-cuenta", tipo: "haz", titular: T.fechaOCuenta.titular, apoyo: T.fechaOCuenta.apoyo, razon: T.fechaOCuenta.razon,
      Figura: FiguraFechaOCuenta, nombreFigura: "Los nueve hechos de enero de Lavado de Autos Mateo", estadoInicial: { elegida: null },
      prediccion: true, resuelta: (e) => Boolean(e?.elegida), opciones: T.fechaOCuenta.opciones,
    },
    { id: "el-diario", tipo: "miralo", titular: T.diario.titular, apoyo: T.diario.apoyo, Figura: FiguraDiario, nombreFigura: "El diario con el asiento del 3 de enero", estadoInicial: { nombradas: false } },
    { id: "como-se-escribe", tipo: "miralo", titular: T.comoSeEscribe.titular, apoyo: T.comoSeEscribe.apoyo, Figura: FiguraComoSeEscribe, nombreFigura: "El asiento del 1 de julio en el diario", estadoInicial: { corrido: false } },
    { id: "el-mayor", tipo: "miralo", titular: T.mayor.titular, apoyo: T.mayor.apoyo, textual: true, Figura: FiguraMayor, nombreFigura: "El diario del 3 de enero y su mayor", estadoInicial: { visto: false } },
    {
      id: "mayorizar", tipo: "haz", titular: T.mayorizar.titular, apoyo: T.mayorizar.apoyo, razon: T.mayorizar.razon,
      Figura: FiguraMayorizar, nombreFigura: "Las cuatro T de las cuentas del 3 de enero", estadoInicial: colaInicial(LINEAS.length), resuelta: colaResuelta,
      devolucion: devolucionDe(T.mayorizar), fichas: LINEAS.map((l) => l.cuenta), destinos: LINEAS.map((l) => destinoDe(l.cuenta, l.lado)),
      buenoDe: (i) => destinoDe(LINEAS[i].cuenta, ladoBueno(i)), malaDe: (i) => destinoDe(LINEAS[i].cuenta, ladoBueno(i) === "debe" ? "haber" : "debe"),
    },
    {
      id: "dos-preguntas", tipo: "haz", titular: T.dosPreguntas.titular, apoyo: T.dosPreguntas.apoyo, razon: T.dosPreguntas.razon,
      Figura: FiguraDosPreguntas, nombreFigura: "El renglón de Bancos en el diario y la T de Bancos", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.dosPreguntas), opciones: T.dosPreguntas.opciones, buena: T.dosPreguntas.opciones[1],
    },
    { id: "cierre", tipo: "cierre", titular: T.cierre.titular, apoyo: T.cierre.apoyo, Figura: FiguraCierre, nombreFigura: "El diario del 3 de enero con el renglón de Bancos" },
  ],
};
