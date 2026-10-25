/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A2 «El fondo fijo» — LOS SLIDES (Hanayama §3, A2).
 *
 * La figura es el sobre de Rosa (el `Sobre` de aprender.jsx, con su llave
 * D9) y, donde hace falta, el cheque y el libro en compacto:
 *
 *   1 · la-suma        Haz     el sobre de hoy y «Sigue igual / Baja / Sube»;
 *                              resuelta, el mismo hueco pasa a «Pagar un gasto»
 *                              y «Reponer» (con la razón D7 debajo)
 *   2 · la-apertura    Haz     el cheque arriba, el sobre sin soportes y
 *                              «Bancos / Caja / Caja menor» (lote 2); resuelta,
 *                              el cheque entra al sobre (280 ms) y los billetes
 *                              cuentan hasta el fondo
 *   3 · los-gastos     Míralo  los ocho gastos del mes, uno por toque
 *   4 · cuanto-queda   Haz     tres cifras; la elegida va a los billetes y
 *                              «Suman» dice si da el fondo
 *   5 · el-reembolso   Míralo  el cheque de lo gastado repone el sobre
 *   6 · y-caja-menor   Haz     el libro en rejilla de 2 × 2 cuentas T; el debe
 *                              y el haber del reembolso se califican cada uno
 *                              al tocarlo (C2 por renglón)
 *   7 · subir-bajar    Cierre  el sobre, «Subir» / «Bajar» y el libro de 1 × 2
 *
 * El libro de A2 p2 no se dibuja (Hanayama §3): sigue en A2ElFondoFijo.jsx.
 * Solo se animan transform y opacity; bajo `.t4s` el movimiento reducido
 * apaga transiciones y animaciones (comun.jsx).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useId, useRef, useState } from "react";
import { C, cifra } from "../comun.jsx";
import { CSS_APRENDER, Sobre } from "../aprender.jsx";
import { DEBE, HABER } from "../../../data/contabilidadT4.js";
import {
  BANCOS as B, CAJA as CJ, CAJA_MENOR as CM, CUENTAS_A2, GASTOS_GENERALES as GG, PAGOS_P0, PASO_FONDO,
} from "../../../data/contabilidadT4A2.js";
import { A2_ID, SLIDES_A2, errorRenglonA2 } from "../../../data/contabilidadT4SlidesA2.js";
import {
  Banda, Control, HAZ_VACIO, Opciones, RAZON_HAZ, Slide, calificar, colocada, correctoTarjeta, resueltaTarjeta,
  tarjeta, todasResueltas, useTerminada, verDe,
} from "./comun.jsx";

const CURVA = "cubic-bezier(.3,.9,.4,1)";
/* p1: lo que el veredicto se queda en las opciones antes de que el hueco pase a «Pagar» y «Reponer». */
const MS_VEREDICTO = 700;

export const CSS_SLIDES_A2 = CSS_APRENDER + `
.t4s2-hueco { display: grid; min-height: 48px; }
.t4s2-par { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4s2-par > .t4s-ctl { min-height: 48px; }
.t4s2-par > .t4s-ctl[aria-disabled="true"] { color: ${C.texto2}; border-color: rgba(184,196,212,0.4); }
.t4s2-razon { margin: 0; min-height: 16px; font: 400 12px/16px "Inter", sans-serif; color: ${C.texto2}; }
.t4s2-ch { transition: transform 280ms ${CURVA}, opacity 280ms ${CURVA}; }
.t4s2-ch[data-entra] { transform: translateY(48px); opacity: 0; pointer-events: none; }
.t4s2-ch[data-asentado] { transition: none; }
.t4s2-g { display: flex; justify-content: space-between; gap: 8px; min-height: 22px; margin: 0; font: 400 13px/22px "Inter", sans-serif; color: ${C.texto2}; }
.t4s2-g > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.t4s2-g > span:last-child { color: ${C.texto}; font-variant-numeric: tabular-nums; flex: none; }
.t4s2-uno { min-height: 44px; }
.t4s2-uno[data-usado] { visibility: hidden; }
/* El libro compacto: rótulo de 16, y cuentas T de nombre 16, destinos o T, y cifra 16. */
.t4s2-cab { display: flex; justify-content: space-between; align-items: center; gap: 8px; height: 16px; margin: 0; font: 500 12px/16px "Inter", sans-serif; color: ${C.texto2}; }
.t4s2-cab > span { white-space: nowrap; }
.t4s2-cab > span:first-child { letter-spacing: .04em; }
.t4s2-cab > span:last-child { color: ${C.texto}; font-variant-numeric: tabular-nums; }
.t4s2-libro { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4s2-t { display: grid; grid-template-rows: 16px auto 16px; min-width: 0; }
.t4s2-nom { margin: 0; font: 600 13px/16px "Sora", "Inter", sans-serif; color: ${C.texto}; white-space: nowrap; overflow: hidden; }
.t4s2-lados { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }
.t4s2-lados > .t4s-ctl { height: 44px; display: grid; align-content: end; justify-items: start; padding: 2px 6px 4px; font: 600 12px/16px "Inter", sans-serif; }
.t4s2-lados > .t4s-ctl[data-ver] { padding: 1px 5px 3px; }
.t4s2-lados > .t4s-ctl[data-lado="debe"] > span { color: ${C.debeTexto}; }
.t4s2-lados > .t4s-ctl[data-lado="haber"] > span { color: ${C.haber}; }
.t4s2-cif { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; font: 500 12px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto2}; }
.t4s2-cif > span { white-space: nowrap; padding: 0 2px; }
.t4s2-cif > span + span { text-align: right; }
.t4s2-cif > span[data-recien] { color: ${C.texto}; font-weight: 600; }
/* La T quieta del Cierre (24): Debe y Haber a cada lado del palo. */
.t4s2-raya { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); height: 24px; border-top: 1px solid ${C.neutro}; font: 600 12px/22px "Inter", sans-serif; }
.t4s2-raya > span { padding: 0 4px; }
.t4s2-raya > span:first-child { border-right: 1px solid ${C.neutro}; color: ${C.debeTexto}; }
.t4s2-raya > span:last-child { text-align: right; color: ${C.haber}; }
/* El Cierre: la razón D7 va dentro del botón de límite apagado. */
.t4s2-par > .t4s-ctl > small { display: block; font: 400 12px/16px "Inter", sans-serif; color: ${C.texto2}; }
`;

/* ═══════════ LAS PIEZAS DE LA FIGURA ═══════════ */

/*
 * El cheque: un botón con su cifra. `entra` lo baja al sobre y lo apaga
 * (translateY y opacity, 280 ms). Si al montar ya había entrado (se volvió
 * con «Anterior»), se queda asentado: sin animar.
 */
function Cheque({ monto, renglones, entra, onClick = null }) {
  const asentado = useRef(entra).current;
  return (
    <button type="button" className="t4ch t4s2-ch" data-cheque data-accion="cheque" data-entra={entra ? "" : undefined} data-asentado={asentado ? "" : undefined}
      disabled={!onClick || entra} aria-hidden={entra ? "true" : undefined} onClick={onClick ?? undefined}>
      <span>{renglones.map((t) => <span key={t}>{t}</span>)}</span>
      <span>{cifra(monto)}</span>
    </button>
  );
}

/* Una cuenta T compacta: el nombre, los dos lados (destinos o la T quieta) y sus cifras. */
function CuentaT({ id, lados, totales = {}, recien = [] }) {
  const c = CUENTAS_A2[id];
  const tot = totales[id] ?? {};
  return (
    <div className="t4s2-t" data-cuenta={id}>
      <p className="t4s2-nom">{c.renglones.join(" ")}</p>
      {lados}
      <div className="t4s2-cif" aria-hidden="true">
        {[DEBE, HABER].map((l) => (
          <span key={l} data-recien={recien.includes(`${id}:${l}`) ? "" : undefined} className={recien.includes(`${id}:${l}`) ? "t4s-nueva" : undefined}>
            {tot[l] ? cifra(tot[l]) : " "}
          </span>
        ))}
      </div>
    </div>
  );
}

const nombreLado = (id, lado, tot) => `${CUENTAS_A2[id].renglones.join(" ")} al ${lado}${tot?.[lado] ? `: ${cifra(tot[lado])}` : ""}`;

/* La devolución de una pantalla de una sola tarjeta (las opciones de p1, p2 y p4). */
function devUna(t, e, id) {
  const x = tarjeta(e, id);
  if (!x) return null;
  if (correctoTarjeta(e, id)) return { ver: "mal", textos: [t.porque] };
  if (x.ok) return { ver: "bien", textos: t.acierto };
  return { ver: "mal", textos: [t.errores[x.eleccion]], n: x.intentos };
}

const posiblesUna = (t) => [
  { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
];

/* ═══════════ 1 · la-suma ═══════════ */

function FiguraSuma({ t, estado, setEstado, reducido }) {
  const { d } = t;
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "suma");
  /* El hueco pasa a «Pagar» y «Reponer» cuando el veredicto ya se vio; si se vuelve con «Anterior», ya está. */
  const [par, setPar] = useState(hecha);
  useEffect(() => {
    if (!hecha || par) return undefined;
    const k = setTimeout(() => setPar(true), reducido ? 0 : MS_VEREDICTO);
    return () => clearTimeout(k);
  }, [hecha, par, reducido]);
  const [n, setN] = useState(0);
  const idRazon = useId();
  const pagado = d.sumaGastos(n);
  const razon = !par ? null : !n ? d.F.razonReponer : n >= PAGOS_P0 ? d.F.razonPagar : null;
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "suma")} posibles={posiblesUna(t)} />}>
      <Sobre llave rotulo={d.F.sobre} filas={[
        { id: "billetes", r: d.F.billetes, v: d.FONDO - pagado },
        { id: "soportes", r: d.F.soportes, v: pagado, oculta: !pagado },
        { id: "suman", r: d.F.suman, v: d.FONDO, suma: true },
      ]} />
      <div className="t4s2-hueco">
        {par ? (
          <div className="t4s2-par t4s-nueva" data-par>
            <Control data-accion="pagar" apagado={n >= PAGOS_P0} aria-describedby={n >= PAGOS_P0 ? idRazon : undefined} onClick={() => setN((x) => Math.min(PAGOS_P0, x + 1))}>{d.F.pagar}</Control>
            <Control data-accion="reponer" apagado={!n} aria-describedby={!n ? idRazon : undefined} onClick={() => setN(0)}>{d.F.reponer}</Control>
          </div>
        ) : (
          <Opciones opciones={t.opciones} etiqueta={t.antes[1]} apagadas={hecha}
            ver={(id) => verDe(e, "suma", id, t.correcta)}
            onElegir={(id) => setEstado((x) => calificar(x, "suma", id, t.correcta))} />
        )}
      </div>
      <p className="t4s2-razon" id={idRazon} data-razon>{razon}</p>
    </Slide>
  );
}

/* ═══════════ 2 · la-apertura ═══════════ */

function FiguraApertura({ t, estado, setEstado }) {
  const { d } = t;
  const e = estado ?? HAZ_VACIO;
  const abierto = resueltaTarjeta(e, "abre");
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "abre")} posibles={posiblesUna(t)} />}>
      {/* Sin «sale de Bancos»: el cheque no dice la respuesta. */}
      <Cheque monto={d.FONDO} renglones={[d.F.cheque[0]]} entra={abierto} />
      {/* Solo los billetes (medido: con «Suman», el modelo da 209 a 320 y 375; sin él, cabe). */}
      <Sobre rotulo={d.F.sobre} luz={abierto} filas={[{ id: "billetes", r: d.F.billetes, v: abierto ? d.FONDO : 0, luz: abierto }]} />
      <Opciones opciones={t.opciones} etiqueta={t.titular} apagadas={abierto}
        ver={(id) => verDe(e, "abre", id, t.correcta)}
        onElegir={(id) => setEstado((x) => calificar(x, "abre", id, t.correcta))} />
    </Slide>
  );
}

/* ═══════════ 3 · los-gastos (Míralo) ═══════════ */

function FiguraGastos({ t, estado, setEstado }) {
  const { d } = t;
  const n = estado?.n ?? 0;
  const total = d.GASTOS_MAYO.length;
  const g = n ? d.GASTOS_MAYO[n - 1] : null;
  return (
    <Slide banda={<Banda antes={t.antes} />}>
      <Sobre llave rotulo={d.F.sobre} filas={[
        { id: "billetes", r: d.F.billetes, v: d.F.sinContar },
        { id: "soportes", r: d.F.soportes, v: d.sumaGastos(n), luz: Boolean(n) },
      ]} />
      <p className="t4s2-g" data-gasto={g ? n : undefined} aria-live="polite">{g ? <><span>{g.gasto}</span><span>{cifra(g.valor)}</span></> : <span>&nbsp;</span>}</p>
      <Control className="t4s2-uno" data-accion="pagar" data-usado={n >= total ? "" : undefined} apagado={n >= total} aria-hidden={n >= total ? "true" : undefined}
        onClick={() => setEstado((x) => ({ n: Math.min(total, (x?.n ?? 0) + 1) }))}>
        {d.F.pagarSiguiente(Math.min(n + 1, total), total)}
      </Control>
    </Slide>
  );
}

/* ═══════════ 4 · cuanto-queda ═══════════ */

function FiguraQueda({ t, estado, setEstado }) {
  const { d } = t;
  const e = estado ?? HAZ_VACIO;
  const x = tarjeta(e, "queda");
  const hecha = resueltaTarjeta(e, "queda");
  /* La cifra en los billetes: la elegida (también la equivocada) o, con dos errores, la que da el fondo. */
  const v = colocada(e, "queda", t.correcta) ?? x?.eleccion ?? null;
  const mal = v != null && v !== t.correcta;
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "queda")} posibles={posiblesUna(t)} />}>
      <Sobre llave rotulo={d.F.sobre} filas={[
        { id: "fondo", r: d.F.fondo, v: d.FONDO },
        { id: "billetes", r: d.F.billetes, v: v ?? "?", luz: v != null },
        { id: "soportes", r: d.F.soportes, v: d.GASTADO },
        { id: "suman", r: mal ? d.F.sumanMal : d.F.suman, v: v != null ? v + d.GASTADO : "?", suma: true },
      ]} />
      <Opciones cifra opciones={d.OPCIONES_QUEDA.map((o) => ({ id: o, texto: cifra(o) }))} etiqueta={d.F.opciones} apagadas={hecha}
        ver={(id) => verDe(e, "queda", id, t.correcta)}
        onElegir={(id) => setEstado((y) => calificar(y, "queda", id, t.correcta))} />
    </Slide>
  );
}

/* ═══════════ 5 · el-reembolso (Míralo) ═══════════ */

function FiguraReembolso({ t, estado, setEstado }) {
  const { d } = t;
  const hecho = Boolean(estado?.hecho);
  return (
    <Slide banda={<Banda antes={t.antes} />}>
      <Cheque monto={d.GASTADO} renglones={d.F.cheque} entra={hecho} onClick={() => setEstado({ hecho: true })} />
      <Sobre llave rotulo={d.F.sobre} luz={hecho} filas={[
        { id: "billetes", r: d.F.billetes, v: hecho ? d.FONDO : d.QUEDA, luz: hecho },
        { id: "soportes", r: d.F.soportes, v: d.GASTADO, oculta: hecho },
        { id: "suman", r: d.F.suman, v: d.FONDO, suma: true },
      ]} />
    </Slide>
  );
}

/* ═══════════ 6 · y-caja-menor ═══════════ */

const RENGLONES = [DEBE, HABER];

function devAsiento(t, e) {
  const foco = tarjeta(e, e?.foco);
  if (!foco) return null;
  if (correctoTarjeta(e, e.foco)) return { ver: "mal", textos: [t.porque], n: foco.intentos };
  if (foco.ok) return { ver: "bien", textos: todasResueltas(e, RENGLONES) ? t.acierto : [] };
  return { ver: "mal", textos: [t.errores[errorRenglonA2(e.foco, foco.eleccion)]], n: foco.intentos };
}

function FiguraAsiento({ t, estado, setEstado }) {
  const { d } = t;
  const e = estado ?? HAZ_VACIO;
  const puesto = (l) => colocada(e, l, t.correcta[l]) != null;
  const totales = {
    [CM]: { [DEBE]: d.FONDO },
    [B]: { [HABER]: d.FONDO + (puesto(HABER) ? d.GASTADO : 0) },
    [GG]: { [DEBE]: puesto(DEBE) ? d.GASTADO : 0 },
  };
  const recien = [puesto(DEBE) && `${GG}:${DEBE}`, puesto(HABER) && `${B}:${HABER}`].filter(Boolean);
  return (
    <Slide banda={<Banda antes={t.antes} dev={devAsiento(t, e)} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
    ]} />}>
      <p className="t4s2-cab"><span>{d.F.libro}</span><span>{`${d.F.cheque[0]} ${cifra(d.GASTADO)}`}</span></p>
      <div className="t4s2-libro" role="group" aria-label={d.F.tablero}>
        {[CM, B, CJ, GG].map((id) => (
          <CuentaT key={id} id={id} totales={totales} recien={recien} lados={(
            <div className="t4s2-lados">
              {RENGLONES.map((l) => (
                <Control key={l} data-lado={l} data-destino={`${id}:${l}`}
                  ver={verDe(e, l, id, t.correcta[l])}
                  apagado={resueltaTarjeta(e, l)}
                  nombre={nombreLado(id, l, totales[id])}
                  onClick={() => setEstado((x) => calificar(x, l, id, t.correcta[l]))}>
                  <span>{l === DEBE ? "Debe" : "Haber"}</span>
                </Control>
              ))}
            </div>
          )} />
        ))}
      </div>
    </Slide>
  );
}

/* ═══════════ 7 · subir-bajar (Cierre) ═══════════ */

function FiguraAjusta({ t, estado, setEstado }) {
  useTerminada(A2_ID);
  const { d } = t;
  const f = estado?.f ?? d.FONDO;
  const sube = Math.max(0, f - d.FONDO);
  const baja = Math.max(0, d.FONDO - f);
  const tope = f >= d.FONDO_MAX;
  const minimo = f <= d.FONDO_MIN;
  const mover = (paso) => setEstado((x) => ({ f: Math.min(d.FONDO_MAX, Math.max(d.FONDO_MIN, (x?.f ?? d.FONDO) + paso)) }));
  const totales = { [CM]: { [DEBE]: d.FONDO + sube, [HABER]: baja }, [B]: { [HABER]: d.FONDO + sube } };
  const recien = sube ? [`${CM}:${DEBE}`, `${B}:${HABER}`] : baja ? [`${CM}:${HABER}`] : [];
  const raya = <div className="t4s2-raya" aria-hidden="true"><span>Debe</span><span>Haber</span></div>;
  return (
    <Slide banda={<Banda antes={[t.cierre]} siguiente={t.siguiente} pie={t.pie} />}>
      <Sobre rotulo={d.F.sobre} filas={[{ id: "billetes", r: d.F.billetes, v: f, luz: f !== d.FONDO }]} />
      <div className="t4s2-par">
        <Control data-accion="subir" apagado={tope} onClick={() => mover(PASO_FONDO)}>
          {d.F.subir}{tope && <small>{d.F.razonSubir}</small>}
        </Control>
        <Control data-accion="bajar" apagado={minimo} onClick={() => mover(-PASO_FONDO)}>
          {d.F.bajar}{minimo && <small>{d.F.razonBajar}</small>}
        </Control>
      </div>
      <div className="t4s2-libro" role="group" aria-label={d.F.tablero}>
        {[CM, B].map((id) => (
          <div key={id} role="group" aria-label={[DEBE, HABER].filter((l) => totales[id][l]).map((l) => nombreLado(id, l, totales[id])).join(", ")}>
            <CuentaT id={id} totales={totales} recien={recien} lados={raya} />
          </div>
        ))}
      </div>
    </Slide>
  );
}

/* ═══════════ La pieza ═══════════ */

const NOMBRES = {
  suma: "El sobre de la caja menor: los billetes, los soportes de gastos y lo que suman",
  abre: "Un cheque y el sobre de la caja menor, todavía vacío",
  gastos: "El sobre de la caja menor y los gastos del mes, uno por uno",
  queda: "El sobre de la caja menor: el fondo, los billetes por contar, los soportes y lo que suman",
  repone: "Un cheque y el sobre de la caja menor, con los soportes del mes",
  asiento: "El libro con cuatro cuentas, cada una con su debe y su haber",
  ajusta: "El sobre de la caja menor y el libro con Caja menor y Bancos",
};

export function piezaSlidesA2(caso = 1) {
  const t = SLIDES_A2[caso] ?? SLIDES_A2[1];
  const con = (Fig, datos) => (props) => <Fig t={{ ...datos, d: t.d }} {...props} />;
  const haz = (id, clave, Fig, resuelta) => ({
    id, tipo: "haz", titular: t[clave].titular, antes: t[clave].antes, Figura: con(Fig, t[clave]), nombreFigura: NOMBRES[clave],
    estadoInicial: HAZ_VACIO, resuelta, razon: RAZON_HAZ,
  });
  const { d, ...textos } = t;
  return {
    id: A2_ID,
    pantallas: [
      haz("la-suma", "suma", FiguraSuma, (e) => resueltaTarjeta(e, "suma")),
      haz("la-apertura", "abre", FiguraApertura, (e) => resueltaTarjeta(e, "abre")),
      { id: "los-gastos", tipo: "miralo", titular: t.gastos.titular, antes: t.gastos.antes, Figura: con(FiguraGastos, t.gastos), nombreFigura: NOMBRES.gastos, estadoInicial: { n: 0 } },
      haz("cuanto-queda", "queda", FiguraQueda, (e) => resueltaTarjeta(e, "queda")),
      { id: "el-reembolso", tipo: "miralo", titular: t.repone.titular, antes: t.repone.antes, Figura: con(FiguraReembolso, t.repone), nombreFigura: NOMBRES.repone, estadoInicial: { hecho: false } },
      haz("y-caja-menor", "asiento", FiguraAsiento, (e) => todasResueltas(e, RENGLONES)),
      { id: "subir-bajar", tipo: "cierre", titular: t.ajusta.titular, antes: [t.ajusta.cierre], Figura: con(FiguraAjusta, t.ajusta), nombreFigura: NOMBRES.ajusta, estadoInicial: { f: d.FONDO } },
    ],
    /* Para las pruebas y la sonda: lo que la banda puede decir, por pantalla. */
    textos,
  };
}
