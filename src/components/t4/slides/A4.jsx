/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A4 «Bancos y notas del banco» — LOS SLIDES (Hanayama §3, A4).
 *
 * Dos figuras con su significado, como en la A4 de antes: la cuenta Bancos
 * (su debe, su haber, su saldo y, en p3, su mayor) y las dos libretas («La
 * empresa» y «El banco»), con «todavía no / lo sabe» donde una no tiene lo
 * que la otra. Aquí van compactas, para caber en el modelo de 206:
 *
 *   1 · el-saldo        Haz     la cuenta Bancos (89) y tres saldos de cifra
 *                               (lote 2). Con el acierto, o con el segundo
 *                               error, debe, haber y saldo cuentan, 280 ms
 *                               cada uno (§5)
 *   2 · las-notas       Míralo  las libretas con su pestaña; «Llega el
 *                               extracto» va dentro de la libreta del banco
 *   3 · sube-o-baja     Haz     la tarjeta (44), «Sube»/«Baja» y el mayor
 *                               compacto de 100. Siete tarjetas, C2 por tarjeta
 *   4 · seis-causas     Haz     la tarjeta y las dos libretas como destinos
 *   5 · la-conciliacion Haz     los dos renglones (56) son el control. Con la
 *                               respuesta, la banda lleva la frase de cierre,
 *                               «Siguiente: «San Calixto».» y el pie. A4 no
 *                               tiene Cierre (lote 4): la pieza se da por
 *                               terminada al resolver p5
 *
 * La banda de p5 lleva pie y «Siguiente» tras responder, y la Banda de
 * comun.jsx no los lleva en la devolución: va aquí una copia con eso (aviso
 * en el informe de A4; comun.jsx no se toca).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { useMovimientoReducido, useNumeroQueSube } from "../../mecanicas/libros/verbos.jsx";
import { DEBE, HABER, MARCA } from "../../../data/contabilidadT4.js";
import {
  A4_ID, CHEQUE_PROVEEDOR, CONSIGNACION, FIGURA_A4 as F, FIGURA_SLIDES_A4, OPCIONES_SALDO_A4, RENGLONES_EXTRACTO, SALDO_A4, SLIDES_A4, libretaDe,
} from "../../../data/contabilidadT4SlidesA4.js";
import { C, cifra } from "../comun.jsx";
import {
  Banda, Control, HAZ_VACIO, Opciones, RAZON_HAZ, Slide, calificar, colocada, correctoTarjeta, resueltaTarjeta,
  tarjeta, todasResueltas, useTerminada, verDe,
} from "./comun.jsx";

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const MS_ASIENTO = 280;

export const CSS_SLIDES_A4 = `
/* p1 · la cuenta Bancos: cabecera 14 + 4 + nombre 19 + 4 + mitades 44 = 85 */
.t4s4-cta { display: grid; gap: 4px; min-width: 0; }
.t4s4-cab { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; font: 700 12px/14px "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t4s4-cab > span { padding: 0 9px; }
.t4s4-cab > span + span { text-align: right; }
.t4s4-nomf { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; min-width: 0; height: 19px; }
.t4s4-nom { font: 600 14px/19px "Sora", "Inter", sans-serif; white-space: nowrap; }
.t4s4-saldo { display: flex; gap: 6px; align-items: baseline; white-space: nowrap; }
.t4s4-saldo > span:first-child { font: 500 12px/19px "Inter", sans-serif; color: ${C.texto2}; }
.t4s4-saldo > span:last-child { font: 600 15px/19px "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t4s4-mits { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4s4-mit { display: grid; align-items: center; height: 44px; padding: 0 9px; border: 1px solid ${C.reposo}; border-radius: 8px; font: 500 15px/22px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto2}; white-space: nowrap; }
.t4s4-mit[data-lleno] { color: ${C.texto}; }
.t4s4-mit + .t4s4-mit { justify-items: end; }
.t4s4-entra { transition: opacity 280ms ${CURVA}; }
/* p2 y p5 · las libretas: cabecera de 31 y renglones de 56 */
.t4s4-pest { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); height: 21px; margin-bottom: -1px; position: relative; z-index: 1; }
.t4s4-tab { grid-column: 2; justify-self: start; margin-left: 10px; padding: 2px 10px 1px; border: 1px solid ${C.neutro}; border-bottom-color: ${C.fondo}; border-radius: 6px 6px 0 0; background: ${C.fondo}; font: 500 12px/16px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; transition: opacity 120ms ${CURVA}; }
.t4s4-lib { display: grid; border: 1px solid ${C.neutro}; border-radius: 10px; overflow: hidden; min-width: 0; }
.t4s4-f { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); min-width: 0; }
.t4s4-f > * { min-width: 0; padding: 0 10px; }
.t4s4-f > * + * { border-left: 1px solid ${C.neutro}; }
.t4s4-libcab > span { font: 600 13px/18px "Sora", "Inter", sans-serif; white-space: nowrap; padding-top: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(248,249,250,0.22); }
.t4s4-r > * { display: grid; align-content: center; height: 56px; }
.t4s4-r + .t4s4-r > * { border-top: 1px solid rgba(248,249,250,0.10); }
.t4s4-c { display: grid; align-content: center; min-width: 0; }
.t4s4-c > span { white-space: nowrap; font: 600 13px/16px "Inter", sans-serif; }
.t4s4-c > span.e { font: 500 12px/16px "Inter", sans-serif; color: ${C.texto2}; }
.t4s4-c[data-no-sabe] > span { font: 400 12px/16px "Inter", sans-serif; color: ${C.texto2}; }
.t4s4-cuerpo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: 56px 56px; }
.t4s4-cuerpo > * { min-width: 0; }
.t4s4-cuerpo > [data-libreta="banco"] { border-left: 1px solid ${C.neutro}; }
.t4s4-hueco { grid-column: 2; grid-row: 1 / span 2; display: grid; align-content: center; padding: 0 8px; border-left: 1px solid ${C.neutro}; }
.t4s4-hueco > .t4s-ctl { width: 100%; font: 600 13px/16px "Inter", sans-serif; }
/* p3 y p4 · la tarjeta: 44, dos renglones como mucho */
.t4s4-tj { display: grid; align-content: center; height: 44px; padding: 3px 10px; border: 1px solid ${C.texto}; border-radius: 8px; min-width: 0; }
.t4s4-tj > p { margin: 0; font: 400 14px/18px "Inter", sans-serif; overflow-wrap: anywhere; }
/* El contador flota a la derecha del primer renglón: solo ese renglón cede ancho. */
.t4s4-tj .n { float: right; margin-left: 8px; font: 500 12px/18px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4s4-par { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
/* p3 · el mayor compacto: 100 */
.t4s4-my { display: grid; grid-template-rows: 16px 1fr; height: 100px; padding: 3px 10px; border: 1px solid ${C.hundidoBorde}; border-radius: 10px; background: ${C.hundido}; min-width: 0; overflow: hidden; }
.t4s4-myt { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid rgba(248,249,250,0.22); font: 700 12px/15px "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t4s4-myt > b { font: 600 13px/15px "Sora", "Inter", sans-serif; letter-spacing: 0; text-transform: none; }
.t4s4-myt > span:last-child { text-align: right; }
.t4s4-myc { display: grid; grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr); gap: 0 10px; padding-top: 2px; min-height: 0; }
.t4s4-myc > i { background: rgba(248,249,250,0.22); }
.t4s4-col { display: grid; align-content: start; min-width: 0; }
.t4s4-col[data-columna="haber"] { justify-items: end; text-align: right; }
.t4s4-col > span { display: grid; }
.t4s4-col > span > span { white-space: nowrap; font: 500 12px/15px "Inter", sans-serif; color: ${C.texto2}; }
.t4s4-col > span[data-foco] > span { color: ${C.texto}; font-weight: 600; }
/* p4 · las dos libretas como destinos: 152 */
.t4s4-libs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4s-ctl.t4s4-libd { display: grid; grid-template-rows: auto 1fr; align-content: start; gap: 4px; height: 152px; padding: 6px 9px; text-align: left; font: inherit; }
.t4s-ctl.t4s4-libd[data-ver] { padding: 5px 8px; }
.t4s4-libd > .t4s4-libn { font: 600 13px/18px "Sora", "Inter", sans-serif; white-space: nowrap; padding-bottom: 4px; border-bottom: 1px solid rgba(248,249,250,0.22); }
.t4s4-libd > .t4s4-libl { display: grid; align-content: start; gap: 4px; min-width: 0; }
.t4s4-libl > span { display: grid; }
.t4s4-libl > span > span { white-space: nowrap; font: 600 12px/16px "Inter", sans-serif; }
/* p5 · cada renglón es un control */
.t4s4-filas { display: grid; gap: 6px; padding: 6px; }
.t4s-ctl.t4s4-fila { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); height: 56px; padding: 0; text-align: left; font: inherit; }
.t4s-ctl.t4s4-fila[data-ver] { padding: 0; }
.t4s4-fila > .t4s4-c { display: grid; align-content: center; min-width: 0; padding: 0 9px; }
.t4s4-fila > .t4s4-c + .t4s4-c { border-left: 1px solid rgba(248,249,250,0.22); }
.t4s4-tab[data-oculta] { opacity: 0; }
`;

/* ═══════════ La banda con pie (p5) ═══════════ */

/* Copia de la Capa de comun.jsx que deja el pie y «Siguiente» también en la devolución (p5 cierra la pieza). */
function Capa({ textos = [], ver = null, pie = null, siguiente = null, oculta = false, ...datos }) {
  const pastilla = ver ? (
    <span className="t4s-pastilla" data-ver={ver} data-palabra>
      {ver === "bien" ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : <X size={14} strokeWidth={2.5} color={C.error} aria-hidden="true" />}
      {MARCA[ver]}
    </span>
  ) : null;
  const lineas = textos.length ? textos : ver ? [""] : [];
  return (
    <div className="t4s-capa" data-oculta={oculta ? "" : undefined} aria-hidden={oculta ? "true" : undefined} {...datos}>
      {lineas.map((t, k) => (
        <p key={k} className="t4s-t" data-fuerte={ver ? "" : undefined} data-texto={t ? "" : undefined}>
          {k === 0 && pastilla}
          {t}
        </p>
      ))}
      {siguiente && <p className="t4s-sig" data-sig-pieza>{siguiente}</p>}
      {pie && <p className="t4s-pie" data-pie>{pie}</p>}
    </div>
  );
}

function BandaConPie({ antes = [], dev = null, posibles = [] }) {
  return (
    <div className="t4s-banda" data-banda data-dueno={dev ? "devolucion" : "antes"}>
      <Capa textos={antes} oculta />
      {posibles.map((d, k) => <Capa key={k} textos={d.textos} ver={d.ver} pie={d.pie} siguiente={d.siguiente} oculta />)}
      <div aria-live="polite" data-capa-viva>
        {dev ? (
          <Capa key={`${dev.ver}:${dev.textos.join("|")}:${dev.n ?? 0}`} textos={dev.textos} ver={dev.ver} pie={dev.pie} siguiente={dev.siguiente}
            className="t4s-capa t4s-nueva" data-mensaje={dev.ver === "bien" ? "acierto" : "error"} />
        ) : (
          <Capa textos={antes} data-antes />
        )}
      </div>
    </div>
  );
}

/* ═══════════ 1 · el-saldo ═══════════ */

/*
 * Una cifra del asiento que cuenta hasta su valor cuando le toca (280 ms tras
 * la anterior). Si la pantalla ya estaba resuelta al montar (se volvió con
 * «Anterior»), o con movimiento reducido, va directa.
 */
function Cuenta({ v, orden, asentada }) {
  const reducido = useMovimientoReducido();
  const directo = asentada || reducido;
  const [meta, setMeta] = useState(directo ? v : 0);
  useEffect(() => {
    if (directo || !v) { setMeta(v); return undefined; }
    const id = setTimeout(() => setMeta(v), orden * MS_ASIENTO);
    return () => clearTimeout(id);
  }, [v, orden, directo]);
  const x = useNumeroQueSube(meta, directo ? 0 : MS_ASIENTO);
  return v ? <span className="t4s-nueva">{cifra(x)}</span> : <span aria-hidden="true">&nbsp;</span>;
}

function CuentaBancos({ hecha }) {
  const asentada = useRef(hecha).current;
  return (
    <div className="t4s4-cta" data-cuenta="bancos">
      <div className="t4s4-cab" aria-hidden="true"><span style={{ color: C.debeTexto }}>Debe</span><span style={{ color: C.haber }}>Haber</span></div>
      <div className="t4s4-nomf">
        <span className="t4s4-nom">{F.mayor}</span>
        <span className="t4s4-saldo t4s4-entra" data-saldo={hecha ? SALDO_A4 : ""} style={{ opacity: hecha ? 1 : 0 }} aria-hidden={hecha ? undefined : "true"}>
          <span>Saldo</span>
          <Cuenta v={hecha ? SALDO_A4 : 0} orden={2} asentada={asentada} />
        </span>
      </div>
      <div className="t4s4-mits">
        <span className="t4s4-mit" data-lado={DEBE} data-lleno={hecha ? "" : undefined}><Cuenta v={hecha ? CONSIGNACION : 0} orden={0} asentada={asentada} /></span>
        <span className="t4s4-mit" data-lado={HABER} data-lleno={hecha ? "" : undefined}><Cuenta v={hecha ? CHEQUE_PROVEEDOR : 0} orden={1} asentada={asentada} /></span>
      </div>
    </div>
  );
}

function devUna(t, e, id) {
  const x = tarjeta(e, id);
  if (!x) return null;
  if (correctoTarjeta(e, id)) return { ver: "mal", textos: [t.porque] };
  if (x.ok) return { ver: "bien", textos: t.acierto };
  return { ver: "mal", textos: [t.errores[x.eleccion]], n: x.intentos };
}

function FiguraSaldo({ t, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "saldo");
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "saldo")} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
    ]} />}>
      <CuentaBancos hecha={hecha} />
      <Opciones
        cifra
        /* Parada 4 (§7): «$1.274.200» en Inter 13/600 tabular mide 74,3 px y la opción deja 68 (72 en el diseño): 2 + 1 columnas; la que queda sola es «$398.200», nunca la correcta. */
        columnas={2}
        opciones={OPCIONES_SALDO_A4}
        etiqueta={F.mayor}
        apagadas={hecha}
        ver={(id) => verDe(e, "saldo", id, t.correcta)}
        onElegir={(id) => setEstado((x) => calificar(x, "saldo", id, t.correcta))}
      />
    </Slide>
  );
}

/* ═══════════ Las libretas (p2 y p5) ═══════════ */

function Celda({ x, lado, nueva = false }) {
  return x ? (
    <span className={`t4s4-c${nueva ? " t4s-nueva" : ""}`} data-libreta={lado} data-linea-libreta={x.t.join(" ")}>
      {x.t.map((r) => <span key={r}>{r}</span>)}
      <span className="e">{x.e}</span>
    </span>
  ) : (
    <span className="t4s4-c" data-libreta={lado} data-no-sabe=""><span>{F.noSabe[0]}</span><span>{F.noSabe[1]}</span></span>
  );
}

const CabLibretas = () => (
  <div className="t4s4-f t4s4-libcab"><span>{F.empresa}</span><span>{F.banco}</span></div>
);

/* ═══════════ 2 · las-notas (Míralo) ═══════════ */

function FiguraNotas({ t, estado, setEstado }) {
  const llego = Boolean(estado?.llego);
  return (
    <Slide banda={<Banda antes={t.antes} />}>
      <div>
        <div className="t4s4-pest">
          <span className="t4s4-tab" data-pestana data-oculta={llego ? undefined : ""} aria-hidden={llego ? undefined : "true"}>{F.pestanaExtracto}</span>
        </div>
        <div className="t4s4-lib" data-libretas>
          <CabLibretas />
          <div className="t4s4-cuerpo">
            {llego ? RENGLONES_EXTRACTO.map((r, k) => [
              <span key={`e${r.id}`} style={{ gridColumn: 1, gridRow: k + 1, display: "grid", padding: "0 10px", borderTop: k ? "1px solid rgba(248,249,250,0.10)" : undefined }} data-renglon={r.id}><Celda x={r.emp} lado="empresa" /></span>,
              <span key={`b${r.id}`} data-libreta="banco" style={{ gridColumn: 2, gridRow: k + 1, display: "grid", padding: "0 10px", borderTop: k ? "1px solid rgba(248,249,250,0.10)" : undefined }}><Celda x={r.ban} lado="banco" nueva /></span>,
            ]) : (
              <>
                <span style={{ gridColumn: 1, gridRow: "1 / span 2" }} />
                <span className="t4s4-hueco">
                  <Control nombre={F.extracto} data-accion="extracto" onClick={() => setEstado((x) => ({ ...(x ?? {}), llego: true }))}>{F.extracto}</Control>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ═══════════ 3 y 4 · una tarjeta a la vez ═══════════ */

/* La tarjeta en curso: la primera sin resolver; con todas resueltas, la última (sus controles, quietos). */
function enCurso(e, lista) {
  const k = lista.findIndex((x) => !resueltaTarjeta(e, x.id));
  return k < 0 ? lista.length - 1 : k;
}

function devTarjetas(t, e, lista, textoError) {
  const foco = tarjeta(e, e?.foco);
  if (!foco) return null;
  if (correctoTarjeta(e, e.foco)) return { ver: "mal", textos: [t.porque], n: foco.intentos };
  if (foco.ok) return { ver: "bien", textos: todasResueltas(e, lista.map((x) => x.id)) ? t.acierto : [] };
  const x = textoError(e.foco, foco.eleccion);
  return { ver: "mal", textos: x ? [x] : [], n: foco.intentos };
}

function Tarjeta({ id, texto, n }) {
  return (
    <div className="t4s4-tj t4s-nueva" data-tarjeta={id}>
      <p><span className="n">{n}</span><span data-texto-tarjeta>{texto}</span></p>
    </div>
  );
}

/* ═══════════ 3 · sube-o-baja ═══════════ */

function MayorCompacto({ debe, haber, foco }) {
  const col = (lado, ls) => (
    <div className="t4s4-col" data-columna={lado}>
      {ls.map((m) => (
        <span key={m.id} className="t4s-nueva" data-linea={m.id} data-foco={m.id === foco ? "" : undefined}>
          {m.mayor.map((r) => <span key={r}>{r}</span>)}
        </span>
      ))}
    </div>
  );
  return (
    <div className="t4s4-my" data-mayor>
      <div className="t4s4-myt"><span style={{ color: C.debeTexto }}>Debe</span><b>{F.mayor}</b><span style={{ color: C.haber }}>Haber</span></div>
      <div className="t4s4-myc">{col(DEBE, debe)}<i aria-hidden="true" />{col(HABER, haber)}</div>
    </div>
  );
}

function FiguraMandar({ t, datos, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const lista = datos.MOVIMIENTOS_A4;
  const k = enCurso(e, lista);
  const m = lista[k];
  const hecha = resueltaTarjeta(e, m.id);
  const puestos = lista.filter((x) => colocada(e, x.id, x.va) != null);
  return (
    <Slide banda={<Banda antes={t.antes} dev={devTarjetas(t, e, lista, () => null)} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] },
    ]} />}>
      <Tarjeta key={m.id} id={m.id} texto={m.texto} n={F.contador(k + 1, lista.length)} />
      <div className="t4s4-par" role="group" aria-label={m.texto}>
        {[[DEBE, F.sube], [HABER, F.baja]].map(([lado, rot]) => (
          <Control key={lado} data-destino={lado} ver={verDe(e, m.id, lado, m.va)} apagado={hecha} nombre={rot}
            onClick={() => setEstado((x) => calificar(x, m.id, lado, m.va))}>
            {rot}
          </Control>
        ))}
      </div>
      <MayorCompacto debe={puestos.filter((x) => x.va === DEBE)} haber={puestos.filter((x) => x.va === HABER)} foco={e.foco} />
    </Slide>
  );
}

/* ═══════════ 4 · seis-causas ═══════════ */

const LIBRETAS = [["empresa", "emp", F.empresa], ["banco", "ban", F.banco]];

function FiguraCausas({ t, datos, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const lista = datos.CAUSAS_A4;
  const k = enCurso(e, lista);
  const c = lista[k];
  const correcta = libretaDe(c);
  const hecha = resueltaTarjeta(e, c.id);
  const puestas = lista.filter((x) => colocada(e, x.id, libretaDe(x)) != null);
  /* D6: una nota del banco llevada a la libreta de la empresa tiene su texto; los demás errores, solo la pastilla. */
  const textoError = (id, lado) => (lado === "empresa" && t.errorEmpresa.causas.includes(id) ? t.errorEmpresa.texto : null);
  return (
    <Slide banda={<Banda antes={t.antes} dev={devTarjetas(t, e, lista, textoError)} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, { ver: "mal", textos: [t.errorEmpresa.texto] },
    ]} />}>
      <Tarjeta key={c.id} id={c.id} texto={c.tarjeta} n={F.contadorCausa(k + 1, lista.length)} />
      <div className="t4s4-libs">
        {LIBRETAS.map(([lado, clave, nombre]) => {
          const anotadas = puestas.filter((x) => libretaDe(x) === lado);
          return (
            <Control key={lado} className="t4s4-libd" data-destino={lado} ver={verDe(e, c.id, lado, correcta)} apagado={hecha}
              nombre={F.anotadas(nombre, anotadas.length)} onClick={() => setEstado((x) => calificar(x, c.id, lado, correcta))}>
              <span className="t4s4-libn">{nombre}</span>
              <span className="t4s4-libl">
                {anotadas.map((x) => <span key={x.id} className="t4s-nueva" data-causa-escrita={x.id}>{x[clave].t.map((r) => <span key={r}>{r}</span>)}</span>)}
              </span>
            </Control>
          );
        })}
      </div>
    </Slide>
  );
}

/* ═══════════ 5 · la-conciliacion ═══════════ */

function Terminar() {
  useTerminada(A4_ID);
  return null;
}

function devConcilia(t, e) {
  const x = tarjeta(e, "concilia");
  if (!x) return null;
  if (correctoTarjeta(e, "concilia")) return { ver: "mal", textos: [t.porque], pie: t.pie, siguiente: t.siguiente };
  if (x.ok) return { ver: "bien", textos: [t.cierre], pie: t.pie, siguiente: t.siguiente };
  return { ver: "mal", textos: [t.errores[x.eleccion]], n: x.intentos };
}

function FiguraConcilia({ t, datos, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "concilia");
  return (
    <Slide banda={<BandaConPie antes={t.antes} dev={devConcilia(t, e)} posibles={[
      { ver: "bien", textos: [t.cierre], pie: t.pie, siguiente: t.siguiente },
      { ver: "mal", textos: [t.porque], pie: t.pie, siguiente: t.siguiente },
      ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
    ]} />}>
      {hecha && <Terminar />}
      <div className="t4s4-lib" data-libretas>
        <CabLibretas />
        <div className="t4s4-filas" role="group" aria-label={t.titular}>
          {datos.RENGLONES_CONCILIACION.map((r) => {
            const anota = hecha && r.id === t.correcta;
            const emp = anota ? { t: r.ban.t, e: F.porAnotar } : r.emp;
            return (
              <Control key={r.id} className="t4s4-fila" data-destino={r.id} data-renglon={r.id} ver={verDe(e, "concilia", r.id, t.correcta)} apagado={hecha}
                nombre={datos.renglonLector[r.id]} onClick={() => setEstado((x) => calificar(x, "concilia", r.id, t.correcta))}>
                <Celda x={emp} lado="empresa" nueva={anota} />
                <Celda x={r.ban} lado="banco" />
              </Control>
            );
          })}
        </div>
      </div>
    </Slide>
  );
}

/* ═══════════ La pieza ═══════════ */

export function piezaSlidesA4(caso = 1) {
  const t = SLIDES_A4[caso] ?? SLIDES_A4[1];
  const datos = FIGURA_SLIDES_A4[caso] ?? FIGURA_SLIDES_A4[1];
  const con = (Fig, x) => (props) => <Fig t={x} datos={datos} {...props} />;
  const ids = (lista) => lista.map((x) => x.id);
  return {
    id: A4_ID,
    pantallas: [
      {
        id: "el-saldo", tipo: "haz", titular: t.saldo.titular, antes: t.saldo.antes, Figura: con(FiguraSaldo, t.saldo),
        nombreFigura: "La cuenta Bancos, con su debe, su haber y su saldo",
        estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, "saldo"), razon: RAZON_HAZ,
      },
      {
        id: "las-notas", tipo: "miralo", titular: t.notas.titular, antes: t.notas.antes, Figura: con(FiguraNotas, t.notas),
        nombreFigura: "Las dos libretas, la de la empresa y la del banco",
        estadoInicial: { llego: false },
      },
      {
        id: "sube-o-baja", tipo: "haz", titular: t.mandar.titular, antes: t.mandar.antes, Figura: con(FiguraMandar, t.mandar),
        nombreFigura: "Una tarjeta, Sube y Baja, y el mayor de Bancos",
        estadoInicial: HAZ_VACIO, resuelta: (e) => todasResueltas(e, ids(datos.MOVIMIENTOS_A4)), razon: RAZON_HAZ,
      },
      {
        id: "seis-causas", tipo: "haz", titular: t.causas.titular, antes: t.causas.antes, Figura: con(FiguraCausas, t.causas),
        nombreFigura: "Una tarjeta y las dos libretas, la de la empresa y la del banco",
        estadoInicial: HAZ_VACIO, resuelta: (e) => todasResueltas(e, ids(datos.CAUSAS_A4)), razon: RAZON_HAZ,
      },
      {
        id: "la-conciliacion", tipo: "haz", titular: t.concilia.titular, antes: t.concilia.antes, Figura: con(FiguraConcilia, t.concilia),
        nombreFigura: "Las dos libretas, cada una con dos renglones",
        estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, "concilia"), razon: RAZON_HAZ,
      },
    ],
    textos: t,
  };
}
