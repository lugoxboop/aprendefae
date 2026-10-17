import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "../../salaDeControl/marco.jsx";
import DecisionC4, { OpcionC4, marcaC4, mensajeC4 } from "./decisionC4.jsx";
import { INTERFAZ_C3 } from "./aprenderC3.jsx";
import { Mensaje, RegionViva } from "../b5/Devolucion.jsx";
import { CSS_T73P, Cuerpo, Pie, Boton, Desplegable, Figuras, Asiento, Textos } from "./PantallasT7_3.jsx";
import { Plazos, FranjaNIC2, CSS_T73_PATRON, sinPartir } from "./PatronT7_3.jsx";
import { CSS_T73C4, Cuadra, Cuenta, Regla, marcaDe, miles, mov } from "./T73C4Comun.jsx";
import { BOTON, INTERFAZ, FRASE_TARIFAS } from "../../../../data/contabilidadT7_3.js";
import { pesos, itemsAprender } from "../../../../contabilidad/c4/t73.js";
import { CONSECUENCIA_C4 as A1, W_A1 } from "../../../../contabilidad/c4/t73a1_c4.js";
import { CONSECUENCIA_C4 as A2 } from "../../../../contabilidad/c4/t73a2_c4.js";
import { CONSECUENCIA_C4 as A3, W_A3 } from "../../../../contabilidad/c4/t73a3_c4.js";
import { CONSECUENCIA_C4 as A4, W_A4, CUENTA_A4 } from "../../../../contabilidad/c4/t73a4_c4.js";
import { CONSECUENCIA_C4 as A5, W_A5 } from "../../../../contabilidad/c4/t73a5_c4.js";
import { CONSECUENCIA_C4 as A6, W_A6 } from "../../../../contabilidad/c4/t73a6_c4.js";
import { CONSECUENCIA_C4 as A7, W_A7, PROPIOS_A7 } from "../../../../contabilidad/c4/t73a7_c4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · APRENDER CON EL PATRÓN C4 «TODA DECISIÓN SE PINTA» (Célula C).
 * A1 a A7 (D4, Mello). El motor es t7/decisionC4.jsx, sin cambios; cada
 * pieza registra su consecuencia pura en src/contabilidad/c4/t73aN_c4.js.
 *
 * La pieza sigue siendo la de Near (sus `pantallas`, en su orden): la
 * portada, las lecturas y el resumen se pintan como antes (PantallasT7_3,
 * con «Empezar» y «Seguir»); cada tramo de pantallas de elección seguidas va
 * al motor C4, un ítem por pantalla. Al tocar una opción, la figura de la
 * pieza (su objeto propio: la factura, la barra de la cadena, la línea de
 * los plazos, los dos libros, libros contra conteo, inventario-provisión-
 * gasto, la ficha NIC 2) pinta lo que esa opción implica; el veredicto llega
 * después, con la escalera C2 del motor. El «Seguir» del último ítem de un
 * tramo pasa a la pantalla que sigue.
 *
 * Lo que la pantalla de Near trae además de sus textos va en la figura: sus
 * figuras del Patrón T7-3 (con lo que crece al acertar), su asiento y sus
 * cuentas T; con el acierto, lo que trae el acierto (figuras, asientos y el
 * texto que los sigue). El pie cambia con el estado (pregunta, error,
 * acierto), con la frase de las tarifas o la marca del ejemplo debajo.
 *
 * FIGURAS PROVISIONALES PARA WATARI: la forma es la de su prototipo
 * (f73.js), con las clases del Patrón T7-3 y de las cuentas T de esta pieza.
 * Rótulos de figura y textos de consecuencia: [W] pendiente de Near (en
 * src/contabilidad/c4/t73aN_c4.js); nunca van marcados en pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Ctx = createContext(null);
const Pasa = ({ children }) => children;
/* El «¿Por qué?» de los ítems propios (A7): el mismo botón del motor, con su alto de 44 px. */
const CSS_PROPIO = `
.t73c4-motor .c4-porque { min-height: 44px; }
`;

/* Una cuenta T: titular, cuenta y los movimientos de cada lado; la que la opción movió, marcada. */
function CuentaT({ titular, cuenta, debe, haber, saldo = null, fuera = null, toca = false, nuevo = null, vista }) {
  const lado = (cual, movs) => (
    <div className="t73p-t-lado" data-lado-t={cual}>
      <span className={`t73p-t-rot ${cual === "debe" ? "t73p-d" : "t73p-hb"}`}>{cual === "debe" ? INTERFAZ.debe : INTERFAZ.haber}</span>
      {movs.map((m, k) => <span key={k} className={`t73p-t-mov${toca && k === nuevo?.[cual] ? mov(true) : ""}`} data-mov-t><span className="t73p-t-v">{miles(m)}</span></span>)}
    </div>
  );
  return (
    <div className={`t73p-t${marcaDe(vista, toca)}`} data-cuenta-t={titular} data-toca={toca ? "" : undefined} role="group" aria-label={`${titular}, ${cuenta}`}>
      <div className="t73p-titular">{titular}</div>
      <p className="t73p-t-cuenta">{cuenta}</p>
      <div className="t73p-t-lados">{lado("debe", debe)}{lado("haber", haber)}</div>
      {saldo != null && <p className="t73c4-linea" data-saldo>{W_A4.saldo}: {pesos(saldo)}</p>}
      {fuera != null && <p className="t73c4-fuera c4-mov" data-fuera>{miles(fuera)}</p>}
    </div>
  );
}

/* Lo que la pantalla de Near trae para mostrar, menos lo que la figura C4 ya pinta (`sin`). */
function DeNear({ p, acerto, sin = [] }) {
  return (
    <>
      {!sin.includes("figuras") && <Figuras lista={p.figuras} acerto={acerto} />}
      {!sin.includes("asientos") && (p.asientos ?? []).map((a, k) => <Asiento key={k} asiento={a} revelar={acerto} />)}
    </>
  );
}

/* Con el acierto, lo que trae el acierto de Near: figuras, asientos y el texto que los sigue. */
function DelAcierto({ p, vista }) {
  const a = p.acierto;
  if (!a || !vista.veredicto || !vista.resuelto) return null;
  return (
    <div className="t73p" data-del-acierto>
      <Figuras lista={a.figuras} nuevo />
      <Textos lista={a.parrafos} nueva enteros />
      {(a.asientos ?? []).map((x, k) => <Asiento key={k} asiento={x} nuevo />)}
      <Textos lista={a.despues} nueva enteros />
    </div>
  );
}

/* ═══════════ LAS FIGURAS DE CADA PIEZA ═══════════ */

/* A1 · la factura de San Calixto. */
function FiguraA1({ estado, item, vista, p }) {
  if (item.id === "no-se-registra") {
    const a = p.asientos[0];
    const x = estado.ingresos;
    const lineas = a.lineas.map((l) => (l.cuenta !== "Ingresos por ventas" ? l
      : x == null ? l : { ...l, monto: x, enBlanco: undefined, marca: `${marcaDe(vista, true).trim()} c4-mov` }));
    return (
      <>
        <Asiento asiento={{ ...a, lineas }} />
        {estado.cobra != null && <p className="t73c4-linea c4-mov" data-cobra>{W_A1.cobra}: <b className="t73c4-num">{pesos(estado.cobra)}</b></p>}
      </>
    );
  }
  return (
    <>
      <Cuenta titulo={estado.titulo} filas={estado.filas} vista={vista} dato="factura" />
      {estado.aparte && <p className={`t73c4-aparte c4-mov${marcaDe(vista, true)}`} data-aparte>{estado.aparte}</p>}
    </>
  );
}

/* A2 · la barra de la cadena: un rótulo va dentro de su tramo solo si cabe entero a 320 px (230 px de barra); si no, en la leyenda. */
const cabe = (w, total, rot) => (w / total) * 230 >= rot.length * 7.4 + 10;
function Barra({ estado, vista }) {
  const fuera = estado.partes.filter((x) => x.rot && !cabe(x.w, estado.total, x.rot));
  return (
    <div className="t73c4-obj" data-c4-objeto="barra">
      <p className="t73c4-tit">{sinPartir(estado.titulo)}</p>
      <div className="t73c4-barra" role="img" aria-label={estado.partes.map((x) => x.rot).filter(Boolean).join(" · ") || estado.titulo}>
        {estado.partes.map((x, k) => (
          <i key={k} className={`${x.corte ? "corte" : "queda"}${mov(x.toca)}${marcaDe(vista, x.toca)}`} style={{ flex: `${x.w / estado.total} 1 0` }} data-tramo={x.corte ? "corte" : "queda"}>
            {x.rot && cabe(x.w, estado.total, x.rot) && <span>{x.rot}</span>}
          </i>
        ))}
      </div>
      {fuera.length > 0 && <p className="t73c4-linea t73c4-leyenda" data-leyenda>{fuera.map((x) => x.rot).join(" · ")}</p>}
    </div>
  );
}
function FiguraA2({ estado, vista, p }) {
  return (
    <>
      <DeNear p={p} acerto={vista.veredicto && vista.resuelto} />
      <Barra estado={estado} vista={vista} />
    </>
  );
}

/* A3 · la línea de los plazos, las dos zonas y el 15 %. */
function FiguraA3({ estado, item, vista, p }) {
  if (item.id === "condiciones" || item.id === "cual-le-toca") {
    const acerto = vista.veredicto && vista.resuelto;
    const f0 = p.figuras[0];
    const f = acerto && f0.alAcertar ? { ...f0, ...f0.alAcertar } : f0;
    const marca = estado.dia == null ? null : { dia: estado.dia, rot: estado.pago, clase: `${marcaDe(vista, estado.toca).trim()}${mov(estado.toca)}` };
    return <Plazos {...f} nuevo={acerto && Boolean(f0.alAcertar)} marca={marca} />;
  }
  if (item.id === "que-es") {
    const chip = (t) => <span key={t} className={`t73c4-chip${mov(estado.toca)}`} data-chip>{t}</span>;
    return (
      <div className="t73c4-dos" data-c4-objeto="zonas">
        <div className="t73c4-zona" data-zona="factura"><span className="t73c4-zona-rot">{W_A3.soloFactura}</span>{estado.factura.map(chip)}</div>
        <div className={`t73c4-zona${marcaDe(vista, estado.toca)}`} data-zona="libro"><span className="t73c4-zona-rot">{W_A3.enLibro}</span>{estado.libro.map(chip)}</div>
      </div>
    );
  }
  return (
    <>
      <DeNear p={p} acerto={vista.veredicto && vista.resuelto} />
      <Cuenta titulo={estado.titulo} filas={estado.filas} vista={vista} dato="quince" />
    </>
  );
}

/* A4 · los dos libros; en `no-operacional`, el estado de resultados con las opciones por renglones. */
function FiguraA4({ estado, item, vista, ctx }) {
  if (item.id === "no-operacional") {
    return (
      <div className="t73c4-obj" data-c4-objeto="resultados">
        <p className="t73c4-tit">{W_A4.estado}</p>
        <div className="t73c4-renops">
          {["costo", "ingreso", "gasto"].map((id) => {
            const o = item.opciones.find((x) => x.id === id);
            const aqui = estado.renglon === id;
            return (
              <OpcionC4 key={id} ctx={ctx} opcion={o} className="t73c4-renop">
                <span>{o.t}</span><b className={`t73c4-num${mov(aqui)}`} data-renglon-v={id}>{aqui ? pesos(Math.abs(estado.utilidad)) : "—"}</b>
              </OpcionC4>
            );
          })}
        </div>
        <p className="t73c4-linea" data-utilidad>{W_A4.efecto}: {estado.utilidad == null ? "?" : `${estado.utilidad > 0 ? "+ " : "− "}${pesos(Math.abs(estado.utilidad))}`}</p>
      </div>
    );
  }
  const nuevo = (l) => (item.id === "cierre" ? { debe: 1, haber: 0 } : { debe: l.debe.length - 1, haber: l.haber.length - 1 });
  return (
    <div className={item.id === "el-pago" ? "t73c4-libros" : "t73c4-libro"} data-c4-objeto="libros">
      {estado.libros.map((l) => <CuentaT key={l.titular} titular={l.titular} cuenta={CUENTA_A4} debe={l.debe} haber={l.haber} saldo={l.saldo} fuera={l.fuera} toca={Boolean(l.toca)} nuevo={nuevo(l)} vista={vista} />)}
    </div>
  );
}

/* A5 · libros contra conteo: las barras de Near y la de los libros ajustados, a la misma escala. */
function FiguraA5({ estado, vista, p }) {
  const f = p.figuras[0];
  const max = Math.max(f.escala ?? 0, estado.libros, estado.conteo, estado.ajustados ?? 0);
  const barras = [...f.barras.map((b) => ({ ...b, toca: false })), ...(estado.ajustados != null ? [{ rot: W_A5.ajustados, v: estado.ajustados, toca: true }] : [])];
  return (
    <div className="t73pt">
      <figure className="br" role="table" aria-label={f.titulo} data-barras={f.titulo} data-c4-objeto="barras">
        <figcaption className="rg-tit">{f.titulo}</figcaption>
        {barras.map((b) => (
          <div key={b.rot} role="row" className={`br-f${marcaDe(vista, b.toca)}${mov(b.toca)}`} data-barra={b.rot}>
            <span className="br-rot" role="rowheader">{b.rot}</span>
            <span className="br-fila" role="cell">
              <span className="br-pista" aria-hidden="true"><i className="br-relleno" style={{ width: `${(b.v / max) * 100}%` }} /></span>
              <span className="br-v">{miles(b.v)}</span>
            </span>
          </div>
        ))}
      </figure>
    </div>
  );
}

/* A6 · inventario, provisión y gasto del periodo. */
function FiguraA6({ estado, vista }) {
  const filas = [["inventario", W_A6.inventario, estado.inventario], ["provision", W_A6.provision, estado.provision], ["gasto", W_A6.gasto, estado.gasto]]
    .map(([id, rot, v]) => ({ rot, v, toca: estado.toca === id }));
  return <Cuenta titulo={estado.titulo} filas={filas} vista={vista} dato="provision" />;
}

/* A7 · la ficha NIC 2 de la tienda. */
function FiguraA7({ estado, item, vista, p }) {
  if (item.id === "que-es") {
    return (
      <div className="t73c4-dos" data-c4-objeto="ficha">
        <div className={`t73c4-zona${marcaDe(vista, Boolean(estado.inventario))}`} data-zona="inventario">
          <span className="t73c4-zona-rot">{W_A7.inventario}</span>
          {estado.inventario && <span className="t73c4-chip c4-mov" data-chip>{estado.inventario}</span>}
        </div>
        <div className="t73c4-zona" data-zona="no-es"><span className="t73c4-zona-rot">{W_A7.noEsInventario}</span></div>
      </div>
    );
  }
  if (item.id === "como-se-mide") {
    return (
      <>
        <DeNear p={p} acerto={false} />
        <div className="t73c4-obj" data-c4-objeto="regla">
          <p className="t73c4-tit">{W_A7.enLosLibros}</p>
          <Regla marcas={estado.marcas} desde={estado.desde} hasta={estado.hasta} valor={estado.valor} vista={vista} fmt={pesos} />
        </div>
      </>
    );
  }
  if (item.id === "el-costo") {
    const filas = estado.partes.map((x) => ({ op: x.signo, rot: x.t, v: "", toca: x.toca }));
    return <Cuenta titulo={W_A7.costoTit} filas={filas} vista={vista} dato="costo" />;
  }
  return (
    <div className="t73c4-obj" data-c4-objeto="tiempo">
      <p className="t73c4-tit">{W_A7.valorTit}</p>
      <div className="t73c4-tiempo">{W_A7.pasos.map((t) => <span key={t}>{t}</span>)}</div>
      {estado.cuando && <p className={`t73c4-chip c4-mov${marcaDe(vista, true)}`} data-chip>{W_A7.pasaAGasto(estado.cuando)}</p>}
    </div>
  );
}

const PIEZAS = {
  [A1.id]: { c4: A1, Fig: FiguraA1 },
  [A2.id]: { c4: A2, Fig: FiguraA2 },
  [A3.id]: { c4: A3, Fig: FiguraA3 },
  [A4.id]: { c4: A4, Fig: FiguraA4 },
  [A5.id]: { c4: A5, Fig: FiguraA5 },
  [A6.id]: { c4: A6, Fig: FiguraA6 },
  [A7.id]: { c4: A7, Fig: FiguraA7, propios: PROPIOS_A7 },
};
export const PIEZAS_C4_T73 = PIEZAS;

/* La figura que el motor monta: la de la pieza, el estado pintado, lo de Near, lo del acierto y lo que cuadra. */
function FiguraT73({ estado, item, vista, ctx }) {
  const { conf, pantalla, reportar } = useContext(Ctx);
  const p = pantalla(item.id);
  useEffect(() => { reportar(item.id, { veredicto: vista.veredicto, ok: vista.ok, resuelto: vista.resuelto }); }, [item.id, vista.veredicto, vista.ok, vista.resuelto, reportar]);
  const Fig = conf.Fig;
  return (
    <div className={`t73c4${vista.veredicto && !vista.ok && vista.eleccion != null ? " t73c4-fallo" : ""}`} data-c4-estado={JSON.stringify(estado)}>
      <Fig estado={estado} item={item} vista={vista} ctx={ctx} p={p} />
      <Cuadra estado={estado} vista={vista} />
      <DelAcierto p={p} vista={vista} />
    </div>
  );
}

/*
 * Las pantallas de A8 que A7 fusionó (`formulas`, `la-que-falta`, `sistemas`):
 * elección con la escalera C2 del motor, sin figura de consecuencia (el
 * prototipo de Watari no las dibuja). Las mismas opciones y el mismo mensaje
 * que el motor, con sus funciones.
 */
const APRENDER = { modo: "aprender" };
function PropioT73({ item, terminar }) {
  const { reportar } = useContext(Ctx);
  const [E, setE] = useState({ eleccion: null, errores: 0, resuelto: false, veredicto: false, abierto: false });
  const msgRef = useRef(null);
  const porqueRef = useRef(null);
  const [foco, setFoco] = useState(null);
  useEffect(() => { reportar(item.id, { veredicto: E.veredicto, ok: E.resuelto, resuelto: E.resuelto }); }, [item.id, E.veredicto, E.resuelto, reportar]);
  useEffect(() => { if (foco) (foco.que === "porque" ? porqueRef : msgRef).current?.focus({ preventScroll: true }); }, [foco]);
  const elegir = (id) => {
    const o = item.opciones.find((x) => x.id === id);
    if (!o || E.resuelto) return;
    setE((x) => ({ ...x, eleccion: id, veredicto: true, resuelto: o.correcta, errores: x.errores + (o.correcta ? 0 : 1), abierto: false }));
    setFoco({ que: "msg", n: E.errores + 1 });
    if (o.correcta) terminar(true, id);
  };
  const ctx = { vista: { bloqueada: E.resuelto }, elegir, marca: (id) => marcaC4(APRENDER, item, E, id) };
  /* El mensaje del motor, como si fuera un ítem de elección (mensajeC4 calla en los propios). */
  const msg = mensajeC4(APRENDER, { ...item, tipo: "eleccion" }, E);
  return (
    <>
      <p className="c4-preg" data-pregunta>{item.pregunta}</p>
      <div className="c4-ops" role="group" aria-label={item.pregunta}>
        {item.opciones.map((o) => <OpcionC4 key={o.id} ctx={ctx} opcion={o} />)}
      </div>
      <div ref={msgRef} tabIndex={-1} className="c4-msg" data-c4-msg>
        <RegionViva>
          {msg && (
            <Mensaje ok={msg.ok} texto={msg.t}>
              {msg.porque && (E.abierto
                ? <p ref={porqueRef} tabIndex={-1} className="c4-porque-txt" data-porque>{msg.porque}</p>
                : <button type="button" className="c4-porque" aria-expanded="false" onClick={() => { setE((x) => ({ ...x, abierto: true })); setFoco({ que: "porque" }); }}>{INTERFAZ_C3.porQue}</button>)}
            </Mensaje>
          )}
        </RegionViva>
      </div>
    </>
  );
}

/* Un ítem propio nuevo, un estado nuevo: el motor monta el mismo componente para dos ítems propios seguidos. */
const PropioPorItem = (props) => <PropioT73 key={props.item.id} {...props} />;

/* El pie de la pantalla en su estado: la fuente (pregunta, error o acierto) y, debajo, la frase de las tarifas o la marca del ejemplo. */
function PieT73({ id }) {
  const { pantalla, vistas } = useContext(Ctx);
  const p = pantalla(id);
  const v = vistas[id];
  const texto = !v?.veredicto ? p.pie : v.ok ? p.acierto?.pie ?? p.pie : p.error?.pie ?? p.pie;
  return (
    <>
      <span className="t73c4-pie-l" data-pie-fuente>{texto}</span>
      {p.pieTarifas && <span className="t73c4-pie-l" data-pie-tarifas>{FRASE_TARIFAS}</span>}
      {p.pieMarca && <span className="t73c4-pie-l" data-pie-marca>{p.pieMarca}</span>}
    </>
  );
}

/* Las pantallas de Near en tramos: cada lectura sola; las elecciones seguidas, juntas (un tramo del motor). */
export function tramosDe(pantallas) {
  const tramos = [];
  for (const p of pantallas) {
    const ultimo = tramos.at(-1);
    if (p.tipo === "eleccion" && ultimo?.tipo === "c4") ultimo.pantallas.push(p);
    else tramos.push(p.tipo === "eleccion" ? { tipo: "c4", pantallas: [p] } : { tipo: "lectura", pantalla: p });
  }
  return tramos;
}


export default function AprenderT7_3C4({ pieza, rotulo }) {
  const conf = PIEZAS[pieza.id];
  const tramos = useMemo(() => tramosDe(pieza.pantallas), [pieza]);
  const [k, setK] = useState(0);
  const [vistas, setVistas] = useState({});
  const marco = useRef(null);
  const primera = useRef(true);
  const tramo = tramos[Math.min(k, tramos.length - 1)];
  const ultimo = k >= tramos.length - 1;
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  const reportar = useCallback((id, v) => setVistas((s) => (JSON.stringify(s[id]) === JSON.stringify(v) ? s : { ...s, [id]: v })), []);
  const pantalla = useCallback((id) => pieza.pantallas.find((p) => p.id === id), [pieza]);
  const ctx = useMemo(() => ({ conf, pantalla, reportar, vistas }), [conf, pantalla, reportar, vistas]);

  /* Los ítems del tramo: los del registro C4 de la pieza, con el pie que cambia con el estado. */
  const piezaC4 = useMemo(() => {
    if (tramo.tipo !== "c4") return null;
    const ids = tramo.pantallas.map((p) => p.id);
    const items = itemsAprender(tramo.pantallas, conf.propios ?? []).filter((i) => ids.includes(i.id)).map((i) => ({ ...i, pie: <PieT73 id={i.id} /> }));
    return {
      ...conf.c4, titulo: pieza.titulo, items, Figura: FiguraT73, Propio: PropioPorItem, clase: "t73c4-motor",
      interfaz: ultimo ? {} : { siguientePieza: BOTON.seguir },
    };
  }, [tramo, conf, pieza, ultimo]);

  /* El «Seguir» del último ítem del tramo lleva a la pantalla que sigue (el motor, solo, iría a la pieza siguiente). */
  const alTocar = (ev) => {
    const b = ev.target.closest?.('[data-boton="siguiente-pieza"]');
    if (!b || ultimo || b.getAttribute("aria-disabled") === "true") return;
    ev.stopPropagation();
    ev.preventDefault();
    setK((x) => x + 1);
  };

  const p = tramo.tipo === "lectura" ? tramo.pantalla : null;
  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T73P + CSS_T73_PATRON + CSS_T73C4 + CSS_PROPIO}</style>
      <Ctx.Provider value={ctx}>
        <div ref={marco} tabIndex={-1} data-pieza-t73={pieza.id} data-tramo={tramo.tipo} data-pantalla={p ? p.id : undefined}
          className={pieza.aviso ? "t73pt-pieza" : undefined} style={{ outline: "none" }} onClickCapture={alTocar}>
          {pieza.aviso && <FranjaNIC2 texto={pieza.aviso} />}
          {p ? (
            <div className="t73p" data-pieza={pieza.id}>
              <Cuerpo p={p} enteros={Boolean(pieza.textosEnteros)} />
              {p.desplegable && <Desplegable d={p.desplegable} />}
              {p.siguiente && <p className="t73p-nota" data-texto data-siguiente>{p.siguiente}</p>}
              {p.boton && !ultimo && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={() => setK((x) => x + 1)} />}
              <Pie texto={p.pie} tarifas={p.pieTarifas} marca={p.pieMarca} />
            </div>
          ) : (
            <DecisionC4 key={`tramo-${k}`} pieza={piezaC4} Marco={Pasa} />
          )}
        </div>
      </Ctx.Provider>
    </Panel>
  );
}

