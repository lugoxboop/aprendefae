import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_LA_FACTURA_COMPLETA, BOTON, INTERFAZ, DEBE, HABER } from "../../../../data/contabilidadT7_1_ap2.js";
import { Plegable } from "./plegable.jsx";
import { textosDelError, contarFallo, textosDeLinea, lineaCerrada, sumarFallosDeLineas, puestoTrasProbarOtra } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP2 «La factura completa», con la «Figura de AP2» de Watari:
 * «El asiento que se arma» y «Lado a lado».
 *
 * Siete pantallas, una a la vez:
 *
 *   · P0 y P1   lectura, sin figura (una factura dibujada adelantaría la base
 *               de la retención)
 *   · P2        la pregunta de la base, con el asiento del 16 de abril que ya
 *               trae «Compras · 5.000.000» resuelta (viene de AP1) y el cálculo
 *               del IVA; el de la retención aparece con el acierto
 *   · P3 y P4   el asiento se arma: cada línea con su cuenta (y su monto en el
 *               encabezado mientras no se coloca) y, debajo, Debe | Haber. Las
 *               líneas aparecen una por una; el total muestra «?» hasta el
 *               acierto; el error va debajo de su línea; «Probar otra» devuelve
 *               solo las mal puestas; las sumas aparecen solo al acertar. Al
 *               acertar, la frase que explica cada cuenta va debajo de su línea
 *               y el mensaje se queda con la del total. En la venta, las
 *               líneas pasan al orden del asiento completo
 *   · P5        la tabla lado a lado, con la fila de la retención señalada, y la
 *               pregunta
 *   · P6        el resumen, con la tabla sin nada señalado
 *
 * Cada pantalla lleva su pie en todos sus estados. NO CALIFICA y no da FP.
 * Clases con el prefijo `t7a2-`, para no tocar nada del sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" }; /* lado */

/* Las cifras van sin «$» dentro del asiento, como en el patrón. */
const cifra = (n) => n.toLocaleString("es-CO").replace(/,/g, ".");

export const CSS_AP2 = `
.t7a2 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t7a2 * { box-sizing: border-box; }
.t7a2-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7a2-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7a2-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a2-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7a2-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7a2-btn:focus-visible, .t7a2-op:focus-visible, .t7a2-cas:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7a2-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7a2-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a2-ficha dd { margin: 0 0 4px; font-size: 15px; overflow-wrap: anywhere; }
.t7a2-ops { display: grid; gap: 8px; }
.t7a2-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; }
.t7a2-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7a2-op:disabled { cursor: default; }
.t7a2-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a2-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7a2-msg-error { border-color: ${P.error}; }
.t7a2-msg-ok { border-color: ${P.borde}; }
.t7a2-msg svg { margin-top: 2px; }
.t7a2-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7a2-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7a2-msg-error .t7a2-msg-palabra { color: ${P.error}; }
.t7a2-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t7a2-err { margin-top: 2px; }
.t7a2-nueva { animation: t7a2-aparece .12s ease-out; }
@keyframes t7a2-aparece { from { opacity: 0; } to { opacity: 1; } }
/* cálculos: el resultado en blanco */
.t7a2-calcs { display: grid; gap: 4px; }
.t7a2-calc-l { margin: 0; font: 400 14px/1.45 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a2-calc-l b { color: ${P.texto}; font-weight: 600; white-space: nowrap; }
/* el asiento que se arma */
.t7a2-ae { margin: 0; display: grid; gap: 10px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; min-width: 0; grid-template-columns: minmax(0, 1fr); }
.t7a2-ae-head { display: grid; gap: 6px; grid-template-columns: minmax(0, 1fr); }
.t7a2-fecha { font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t7a2-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7a2-dh { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t7a2-d { color: ${P.debe}; } .t7a2-h { color: ${P.haber}; }
.t7a2-linea { display: grid; gap: 6px; min-width: 0; grid-template-columns: minmax(0, 1fr); }
.t7a2-linea + .t7a2-linea { padding-top: 6px; }
.t7a2-cab { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; min-width: 0; }
.t7a2-cuenta { font-size: 15px; line-height: 1.3; overflow-wrap: anywhere; min-width: 0; }
.t7a2-monto { font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${P.texto2}; flex: none; }
.t7a2-resuelta .t7a2-cuenta { color: ${P.texto2}; }
.t7a2-cas { position: relative; appearance: none; display: flex; align-items: center; justify-content: flex-end; min-height: 44px; min-width: 0; padding: 0 8px; border: 1px dashed ${P.borde}; border-radius: 6px; background: transparent; color: ${P.texto}; font: 500 15px/1 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; cursor: pointer; transition: box-shadow .12s, border-color .12s; }
.t7a2-cas-objetivo { border-style: solid; border-color: ${P.texto}; box-shadow: inset 0 0 0 1px ${P.texto}; }
.t7a2-cas-llena { border-style: solid; border-color: ${P.borde}; }
.t7a2-cas-vacia { border-style: dashed; }
.t7a2-cas-error { border-style: solid; border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a2-cas-ok { border-style: solid; border-color: ${P.texto2}; cursor: default; }
.t7a2-cas-nada { visibility: hidden; }
.t7a2-q { color: ${P.texto2}; }
.t7a2-marca { position: absolute; top: -7px; left: -7px; width: 16px; height: 16px; border-radius: 50%; background: ${P.fondo}; display: block; line-height: 0; color: ${P.error}; }
.t7a2-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a2-sumas { display: grid; gap: 4px; border-top: 1px solid ${P.borde}; padding-top: 8px; }
.t7a2-sumas-rot { font-size: 12px; color: ${P.texto2}; }
.t7a2-sum { text-align: right; padding-inline: 9px; font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
/* lado a lado */
.t7a2-lal { margin: 0; display: grid; border: 1px solid ${P.borde}; border-radius: 10px; min-width: 0; grid-template-columns: minmax(0, 1fr); }
.t7a2-lal-f { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; row-gap: 6px; padding: 10px 12px; }
.t7a2-lal-f + .t7a2-lal-f { border-top: 1px solid ${P.borde}; }
.t7a2-lal-h > span:not(.t7a2-sr) { font: 600 13px/1.3 "Sora", "Inter", sans-serif; overflow-wrap: anywhere; min-width: 0; }
.t7a2-lal-rot { grid-column: 1 / -1; font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${P.texto2}; }
.t7a2-lal-c { display: grid; gap: 2px; align-content: start; min-width: 0; }
.t7a2-lal-lado { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t7a2-lal-cuenta { font-size: 13px; line-height: 1.35; overflow-wrap: anywhere; }
.t7a2-foco, .t7a2-foco .t7a2-lal-cuenta { color: ${P.texto}; font-weight: 600; }
.t7a2-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .t7a2 *, .t7a2 *::before, .t7a2 *::after { transition: none !important; animation: none !important; } }
`;

const nombreLado = (lado) => (lado === DEBE ? INTERFAZ.debe : INTERFAZ.haber);

function Pie({ texto }) { return <p className="t7a2-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7a2-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, refFoco, clase = "" }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7a2-msg ${ok ? "t7a2-msg-ok" : "t7a2-msg-error"} ${clase}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7a2-msg-cuerpo">
        <span className="t7a2-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto><Plegable texto={t} /></p>)}
      </div>
    </div>
  );
}

/* Un cálculo con su resultado (lo que va después del último «= ») en blanco. */
function Calculos({ lista, nuevos = [] }) {
  return (
    <div className="t7a2-calcs" data-calculos>
      {lista.map((c) => {
        const i = c.lastIndexOf("= ");
        return <p key={c} className={`t7a2-calc-l${nuevos.includes(c) ? " t7a2-nueva" : ""}`} data-texto data-calculo>{c.slice(0, i + 2)}<b>{c.slice(i + 2)}</b></p>;
      })}
    </div>
  );
}

function Ficha({ ficha }) {
  return (
    <dl className="t7a2-ficha" data-ficha>
      {ficha.map((f) => (
        <div key={f.dato} data-dato>
          <dt>{f.dato}</dt>
          <dd>{f.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

/* La línea que viene resuelta (Compras, de AP1): en gris, ya en su lado, sin tocarse. */
function LineaResuelta({ l }) {
  return (
    <div className="t7a2-linea t7a2-resuelta" data-fila={l.id} data-resuelta>
      <div className="t7a2-cab"><span className="t7a2-cuenta">{l.cuenta}</span></div>
      <span className="t7a2-g2">
        {[DEBE, HABER].map((lado) => (lado === l.lado
          ? <span key={lado} className="t7a2-cas t7a2-cas-ok" aria-label={`${l.cuenta}: ${nombreLado(lado)}, ${cifra(l.monto)}`}>{cifra(l.monto)}</span>
          : <span key={lado} className="t7a2-cas t7a2-cas-nada" aria-hidden="true" />))}
      </span>
    </div>
  );
}

function CabeceraAsiento({ fecha }) {
  return (
    <div className="t7a2-ae-head">
      <span className="t7a2-fecha" data-fecha>{fecha}</span>
      <span className="t7a2-g2" aria-hidden="true"><span className="t7a2-dh t7a2-d">{INTERFAZ.debe}</span><span className="t7a2-dh t7a2-h">{INTERFAZ.haber}</span></span>
    </div>
  );
}

/* ═══════════ LA TABLA LADO A LADO ═══════════ */

/* «Debe (IVA por pagar)» → lado y cuenta: la tabla de la v2 se lee tal cual y se reparte. */
const partir = (celda) => {
  const m = celda.match(/^(Debe|Haber) \((.+)\)$/);
  return { lado: m[1] === "Debe" ? DEBE : HABER, cuenta: m[2] };
};

export function LadoALado({ tabla, foco }) {
  const celda = (texto, f) => {
    const { lado, cuenta } = partir(texto);
    return (
      <span role="cell" className={`t7a2-lal-c${f ? " t7a2-foco" : ""}`}>
        <span className={`t7a2-lal-lado ${lado === DEBE ? "t7a2-d" : "t7a2-h"}`}>{nombreLado(lado)}</span>
        <span className="t7a2-lal-cuenta">{cuenta}</span>
      </span>
    );
  };
  return (
    <div className="t7a2-lal" role="table" aria-label={INTERFAZ.nombreLadoALado} data-lado-a-lado>
      <div className="t7a2-lal-f t7a2-lal-h" role="row">
        <span className="t7a2-sr" role="columnheader">{INTERFAZ.impuesto}</span>
        {tabla.columnas.slice(1).map((c) => <span key={c} role="columnheader">{c}</span>)}
      </div>
      {tabla.filas.map(([rot, compra, venta]) => {
        /* La fila de la retención va señalada: es la de la pregunta (Watari). */
        const f = foco && rot === "Retención";
        return (
          <div key={rot} className="t7a2-lal-f" role="row" data-fila-lal={rot}>
            <span className={`t7a2-lal-rot${f ? " t7a2-foco" : ""}`} role="rowheader">{rot}</span>
            {celda(compra, f)}
            {celda(venta, f)}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════ ELECCIÓN ═══════════ */

function Eleccion({ pantalla, onSeguir }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  /* Cuántas veces se ha fallado esta pregunta: la escalera de ayuda (escaleraAyuda.js). */
  const [fallos, setFallos] = useState(0);
  const ref = useRef(null);
  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);
  const nuevos = estado === "acierto" ? pantalla.acierto.calculos ?? [] : [];

  return (
    <div className="t7a2" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.enunciado && <p className="t7a2-p" data-texto data-enunciado>{pantalla.enunciado}</p>}
      {pantalla.ficha && <Ficha ficha={pantalla.ficha} />}
      {pantalla.resuelta && (
        <>
          <figure className="t7a2-ae" aria-label={pantalla.fecha} data-asiento>
            <CabeceraAsiento fecha={pantalla.fecha} />
            <LineaResuelta l={pantalla.resuelta} />
          </figure>
          <Calculos lista={[...pantalla.calculos, ...nuevos]} nuevos={nuevos} />
        </>
      )}
      {pantalla.tabla && <LadoALado tabla={pantalla.tabla} foco />}
      <p className="t7a2-p t7a2-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7a2-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button
              key={o.id}
              type="button"
              className={`t7a2-op${estado === "error" && esta ? " t7a2-op-error" : ""}`}
              data-opcion={o.id}
              aria-pressed={esta}
              disabled={Boolean(confirmada)}
              onClick={() => setElegida(o.id)}
            >
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => { contarFallo(pantalla, elegida, setFallos); setConfirmada(elegida); }} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={textosDelError(pantalla, opcion, fallos)} refFoco={ref} />
          <Boton
            nombre="probar-otra"
            texto={BOTON.probarOtra}
            onClick={() => { setOrden((a) => barajarDistinto(pantalla.opciones, a, (o) => o.id)); setElegida(null); setConfirmada(null); }}
          />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={pantalla.acierto.textos} refFoco={ref} />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={estado === "error" ? pantalla.error.pie : estado === "acierto" ? pantalla.acierto.pie : pantalla.pie} />
    </div>
  );
}

/* ═══════════ EL ASIENTO QUE SE ARMA ═══════════ */

function Lados({ pantalla, onSeguir }) {
  const [puesto, setPuesto] = useState({});
  const [veredicto, setVeredicto] = useState(null);
  const [fallosLinea, setFallosLinea] = useState({});
  const cerrada = (l) => lineaCerrada(pantalla, l, fallosLinea[l.id]);
  const [visibles, setVisibles] = useState(1);
  const ref = useRef(null);
  const malas = veredicto?.malas ?? [];
  const estado = !veredicto ? "colocando" : malas.length ? "error" : "acierto";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);

  /* El monto de cada línea sale del asiento del acierto: las cifras no se escriben dos veces. */
  const monto = (l) => pantalla.acierto.asiento.lineas.find((x) => l.texto.startsWith(x.cuenta)).monto;
  const cuenta = (l) => pantalla.acierto.asiento.lineas.find((x) => l.texto.startsWith(x.cuenta)).cuenta;
  const esTotal = (l) => Boolean(l.textoResuelto);
  const completo = pantalla.lineas.every((l) => puesto[l.id]);
  const lineas = estado === "acierto" ? pantalla.acierto.orden.map((id) => pantalla.lineas.find((l) => l.id === id)) : pantalla.lineas.slice(0, visibles);
  const sumas = pantalla.acierto.asiento.sumas;

  const tocar = (l, lado) => {
    if (estado !== "colocando" || cerrada(l)) return;
    setPuesto((p) => ({ ...p, [l.id]: p[l.id] === lado ? undefined : lado }));
    const k = pantalla.lineas.indexOf(l);
    if (k === visibles - 1) setVisibles((v) => Math.min(v + 1, pantalla.lineas.length));
  };
  const confirmar = () => {
    const malas = pantalla.lineas.filter((l) => puesto[l.id] !== l.lado).map((l) => l.id);
    setFallosLinea((f) => sumarFallosDeLineas(f, malas));
    setVeredicto({ malas });
  };
  const probarOtra = () => {
    setPuesto((p) => puestoTrasProbarOtra(p, malas, pantalla.lineas, cerrada));
    setVeredicto(null);
  };

  return (
    <div className="t7a2" data-lados={pantalla.id} data-estado={estado}>
      {pantalla.enunciado && <p className="t7a2-p" data-texto data-enunciado>{pantalla.enunciado}</p>}
      {pantalla.ficha && <Ficha ficha={pantalla.ficha} />}
      {pantalla.calculos && <Calculos lista={pantalla.calculos} />}
      <p className="t7a2-p" data-texto data-consigna>{pantalla.consigna}</p>
      <figure className="t7a2-ae" aria-label={pantalla.fecha} data-asiento>
        <CabeceraAsiento fecha={pantalla.fecha} />
        {pantalla.resuelta && <LineaResuelta l={pantalla.resuelta} />}
        {lineas.map((l) => {
          const lado = puesto[l.id];
          const mala = malas.includes(l.id);
          /* El total muestra «?» hasta el acierto (Watari). */
          const visible = esTotal(l) && estado !== "acierto" ? INTERFAZ.interrogacion : cifra(monto(l));
          const cas = (cual) => {
            const llena = lado === cual;
            let clase = "t7a2-cas";
            let nombre;
            if (estado === "acierto") {
              clase += llena ? " t7a2-cas-ok" : " t7a2-cas-nada";
              nombre = llena ? `${nombreLado(cual)}, ${visible}, correcto` : `${nombreLado(cual)}, vacía`;
            } else if (llena) {
              clase += mala ? " t7a2-cas-error" : " t7a2-cas-llena";
              nombre = `${nombreLado(cual)}, ${visible}${mala ? ", incorrecto" : ""}`;
            } else if (!lado) {
              clase += " t7a2-cas-objetivo";
              nombre = `${nombreLado(cual)}, vacía, lista para recibir`;
            } else {
              clase += " t7a2-cas-vacia";
              nombre = `${nombreLado(cual)}, vacía`;
            }
            return (
              <button
                type="button"
                className={clase}
                data-linea={l.id}
                data-lado={cual}
                data-llena={llena ? "si" : "no"}
                aria-label={`${cuenta(l)}: ${nombre}`}
                aria-pressed={llena}
                tabIndex={estado === "acierto" ? -1 : 0}
                aria-disabled={cerrada(l) ? "true" : undefined}
                aria-hidden={estado === "acierto" && !llena ? "true" : undefined}
                onClick={() => tocar(l, cual)}
              >
                {llena && mala && <span className="t7a2-marca"><X size={16} aria-hidden="true" /></span>}
                {llena ? <span className={visible === INTERFAZ.interrogacion ? "t7a2-q" : undefined}>{visible}</span> : ""}
              </button>
            );
          };
          const k = pantalla.lineas.indexOf(l);
          const nota = estado === "acierto" ? pantalla.acierto.textos[pantalla.acierto.notas[l.id]] : null;
          return (
            <div key={l.id} className={`t7a2-linea${k > 0 && estado !== "acierto" ? " t7a2-nueva" : ""}`} data-fila={l.id}>
              <div className="t7a2-cab">
                <span className="t7a2-cuenta">{cuenta(l)}</span>
                {!lado && <span className={`t7a2-monto${visible === INTERFAZ.interrogacion ? " t7a2-q" : ""}`} data-monto-suelto>{visible}</span>}
              </div>
              <span className="t7a2-g2">{cas(DEBE)}{cas(HABER)}</span>
              {mala && estado === "error" && <Mensaje ok={false} textos={textosDeLinea(pantalla, l, fallosLinea[l.id] ?? 0)} clase="t7a2-err" refFoco={l.id === malas[0] ? ref : undefined} />}
              {nota && <p className="t7a2-nota t7a2-nueva" data-texto data-nota>{nota}</p>}
            </div>
          );
        })}
        {estado === "acierto" && (
          <div className="t7a2-sumas t7a2-nueva" data-sumas>
            <span className="t7a2-sumas-rot">{INTERFAZ.sumas}</span>
            <span className="t7a2-g2">
              <span className="t7a2-sum" data-suma={DEBE} aria-label={`${INTERFAZ.sumas}, ${INTERFAZ.debe}: ${sumas.debe}`}>{sumas.debe}</span>
              <span className="t7a2-sum" data-suma={HABER} aria-label={`${INTERFAZ.sumas}, ${INTERFAZ.haber}: ${sumas.haber}`}>{sumas.haber}</span>
            </span>
          </div>
        )}
      </figure>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!completo} onClick={confirmar} />}
      {estado === "error" && <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={probarOtra} />}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.textos[0]]} refFoco={ref} />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={estado === "error" ? pantalla.error.pie : estado === "acierto" ? pantalla.acierto.pie : pantalla.pie} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function LaFacturaCompleta({ pieza = PIEZA_LA_FACTURA_COMPLETA, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);
  const tablaResumen = pieza.pantallas.find((x) => x.tabla)?.tabla ?? PIEZA_LA_FACTURA_COMPLETA.pantallas.find((x) => x.tabla).tabla;

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_AP2}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {(p.tipo === "portada" || p.tipo === "lectura" || p.tipo === "resumen") && (
          <div className="t7a2">
            {p.objetivo && <p className="t7a2-p" data-texto data-objetivo>{p.objetivo}</p>}
            {(p.parrafos ?? []).map((t) => <p key={t} className="t7a2-p" data-texto><Plegable texto={t} /></p>)}
            {p.tipo === "resumen" && <LadoALado tabla={tablaResumen} foco={false} />}
            {p.siguiente && <p className="t7a2-p" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
        {p.tipo === "eleccion" && <Eleccion key={p.id} pantalla={p} onSeguir={seguir} />}
        {p.tipo === "lados" && <Lados key={p.id} pantalla={p} onSeguir={seguir} />}
      </div>
    </Panel>
  );
}
