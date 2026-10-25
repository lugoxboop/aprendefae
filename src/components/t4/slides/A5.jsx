/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 «San Calixto» — LOS SLIDES (Hanayama §3, A5).
 *
 * La figura es el par horizontal: «el banco», el «=» y «la empresa» en un
 * renglón de 47 (cada lado 117 px a 320), más un renglón de 20 para «saldo
 * verdadero». El Par de tablero.jsx mide 91-112 y no se deja compactar por
 * props, así que aquí va uno compacto (ParA5), con el mismo dibujo de D9: la
 * hoja con la esquina doblada y el libro con lomo.
 *
 *   1 · dos-saldos          Haz     el par y tres opciones; el caso y la pregunta, a la banda
 *   2 · lado-del-banco      Haz     tarjeta de 48 y «Más»/«Menos» (44) con el total
 *                                   del lado y la última partida; el saldo cuenta
 *   3 · lado-de-la-empresa  Haz     igual; el «=» sale cuando los lados se igualan
 *   4 · que-se-asienta      Haz     la tarjeta y «Se asienta / No se asienta»
 *   5 · los-asientos        Haz     nota de 64, Bancos ya puesto y la contrapartida entre tres cuentas (Katsumi, #488)
 *   6 · el-mayor            Cierre  mayor de 131 y, debajo, «Asentar las cinco notas»
 *                                   y, en su lugar, el par igualado
 *
 * C2 por tarjeta: la partida o la nota que falla dos veces pasa sola a su
 * lugar y la banda da el porqué. La tarjeta se mueve a su lugar al quedar
 * resuelta, no con el primer error.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { useNumeroQueSube } from "../../mecanicas/libros/verbos.jsx";
import { useReducido } from "../aprender.jsx";
import { SON_IGUALES } from "../tablero.jsx";
import { C, cifra } from "../comun.jsx";
import { DEBE, HABER } from "../../../data/contabilidadT4.js";
import { MAS, MENOS, saldoTrasA5 } from "../../../data/contabilidadT4A5.js";
import { A5_ID, ESPERA_NOTA_MS, PASO_MAYOR_MS, SLIDES_A5 } from "../../../data/contabilidadT4SlidesA5.js";
import {
  Banda, Control, HAZ_VACIO, Opciones, RAZON_HAZ, Slide, calificar, colocada, correctoTarjeta, resueltaTarjeta,
  tarjeta, todasResueltas, useTerminada, verDe,
} from "./comun.jsx";

const ROTULO = { [DEBE]: "Debe", [HABER]: "Haber" };

export const CSS_SLIDES_A5 = `
.t4s5-col { display: grid; gap: 6px; align-content: start; min-width: 0; }
.t4s5-par { display: grid; min-width: 0; }
.t4s5-par-fila { display: grid; grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr); align-items: center; height: 47px; }
.t4s5-lado { position: relative; display: grid; align-content: center; height: 47px; min-width: 0; }
.t4s5-lado .r { font: 500 12px/16px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4s5-lado .v { font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4s5-lado .v[data-foco] { font-weight: 600; }
.t4s5-lado[data-lado-par="izq"] { border: 1px solid ${C.neutro}; border-radius: 4px; padding: 0 14px 0 8px; }
.t4s5-lado[data-lado-par="izq"]::after { content: ""; position: absolute; top: -1px; right: -1px; width: 8px; height: 8px; background: ${C.neutro}; clip-path: polygon(0 0, 100% 100%, 0 100%); }
.t4s5-lado[data-lado-par="der"] { border-left: 2px solid ${C.neutro}; padding: 0 4px 0 10px; justify-items: end; text-align: right; }
.t4s5-lado[data-lado-par="der"]::before { content: ""; position: absolute; left: 3px; top: 0; bottom: 0; width: 1px; background: ${C.neutro}; }
.t4s5-igual { display: block; text-align: center; font: 600 17px/20px "Inter", sans-serif; }
.t4s5-f20 { margin: 0; height: 20px; display: flex; justify-content: center; align-items: center; white-space: nowrap; }
.t4s5-dif { font: 500 12px/20px "Inter", sans-serif; color: ${C.texto2}; }
.t4s5-ver { font: 600 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t4s5-tj { display: block; min-height: 48px; padding: 7px 10px; border: 1px solid ${C.texto}; border-radius: 8px; font: 400 13px/16px "Inter", sans-serif; overflow-wrap: anywhere; }
.t4s5-tj .m { float: right; margin-left: 8px; font: 600 14px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4s5-dests { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4s5-dest { display: grid; grid-template-rows: 44px 16px 16px; min-width: 0; }
.t4s5-dest > .t4s-ctl { width: 100%; }
.t4s5-dest .tot { font: 600 13px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; padding-right: 8px; }
.t4s5-dest .ult { font: 400 12px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; padding-right: 8px; color: ${C.texto2}; }
.t4s5-nt { display: grid; grid-template-rows: 32px 16px; align-content: center; min-height: 64px; padding: 6px 10px; border: 1px solid ${C.texto}; border-radius: 8px; }
.t4s5-nt .l { font: 400 13px/16px "Inter", sans-serif; overflow-wrap: anywhere; }
.t4s5-nt .p { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font: 500 12px/16px "Inter", sans-serif; color: ${C.texto2}; }
.t4s5-nt .p > b { font: 600 14px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto}; white-space: nowrap; }
/* p5 (Katsumi, #488): Bancos ya puesto (no se toca: 36 px) y tres cuentas que sí; nombres en Inter 12/14 con guiones del español. */
.t4s5-p5 { display: grid; gap: 6px; }
.t4s5-p5 .t4s5-cta { grid-template-rows: 14px 36px; gap: 2px; }
.t4s5-p5 .t4s5-mt { min-height: 36px; }
.t4s5-ops { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.t4s5-ops > .t4s-ctl { display: grid; align-content: center; justify-items: center; gap: 0; min-height: 60px; padding: 2px 4px; text-align: center; }
/* A la derecha, 12 px de más: la ✓ de la esquina nunca tapa el nombre (Shibukawa: «Cuentas por»). */
.t4s5-ops > .t4s-ctl { padding-right: 12px; }
.t4s5-ops > .t4s-ctl[data-ver] { padding: 1px 11px 1px 3px; }
.t4s5-ops .n { display: grid; font: 600 12px/14px "Inter", sans-serif; hyphens: auto; overflow-wrap: anywhere; }
.t4s5-ops .v { min-height: 14px; font: 600 12px/14px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4s5-tb { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t4s5-cta { display: grid; grid-template-rows: 28px 44px; gap: 4px; min-width: 0; }
.t4s5-cta > .n { align-self: end; font: 600 12px/14px "Sora", "Inter", sans-serif; overflow-wrap: anywhere; }
.t4s5-mts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px; }
.t4s5-mt { display: grid; align-content: center; justify-items: start; min-height: 44px; min-width: 0; padding: 2px 2px 2px 3px; border-radius: 8px; border: 1px solid ${C.hundidoBorde}; text-align: left; }
.t4s5-mt.t4s-ctl { border-color: ${C.reposo}; padding: 2px 2px 2px 3px; }
.t4s5-mt.t4s-ctl[data-ver] { border-color: ${C.texto}; padding: 1px 1px 1px 2px; }
.t4s5-mt.t4s-ctl[data-ver="mal"] { border-color: ${C.error}; }
.t4s5-mt .k { font: 600 12px/14px "Inter", sans-serif; }
.t4s5-mt .v { min-height: 18px; font: 600 13px/18px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto}; }
.t4s5-my { display: grid; gap: 4px; padding: 4px 8px; border-radius: 10px; background: ${C.hundido}; border: 1px solid ${C.hundidoBorde}; }
.t4s5-my > .t { margin: 0; text-align: center; font: 600 13px/16px "Sora", "Inter", sans-serif; }
.t4s5-my-cols { display: grid; grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr); gap: 0 8px; border-top: 1px solid rgba(248,249,250,0.22); padding-top: 3px; }
.t4s5-my-col { display: grid; grid-template-rows: 14px 52px; gap: 2px; min-width: 0; }
.t4s5-my-col > span { font: 600 12px/14px "Inter", sans-serif; }
.t4s5-my-ls { display: grid; grid-auto-rows: 16px; gap: 2px; align-content: start; }
.t4s5-my-l { display: flex; justify-content: flex-end; align-items: baseline; gap: 4px; white-space: nowrap; font: 500 14px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto2}; }
.t4s5-my-l > .r { font: 500 12px/16px "Inter", sans-serif; margin-right: auto; }
.t4s5-my-l[data-foco] { color: ${C.texto}; font-weight: 600; }
.t4s5-my-saldo { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; height: 22px; border-top: 1px solid rgba(248,249,250,0.22); padding-top: 3px; }
.t4s5-my-saldo > span:first-child { font: 500 12px/18px "Inter", sans-serif; color: ${C.texto2}; }
.t4s5-my-saldo > span:last-child { font: 600 15px/18px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4s5-op .t4s-opc > .t4s-ctl { padding: 2px 17px 2px 3px; }
.t4s5-op .t4s-opc > .t4s-ctl[data-ver] { padding: 1px 16px 1px 2px; }
.t4s5-slot { display: grid; align-content: start; min-height: 47px; }
.t4s5-slot > .t4s-ctl { width: 100%; }
`;

/* ═══════════ El par compacto ═══════════ */

function LadoPar({ lado, r, v, foco }) {
  const x = useNumeroQueSube(v);
  return (
    <div className="t4s5-lado" data-lado-par={lado}>
      <span className="r">{r}</span>
      <span className="v" data-foco={foco ? "" : undefined} aria-hidden="true">{cifra(x)}</span>
      <span className="t4s-sr">{cifra(v)}</span>
    </div>
  );
}

function ParA5({ F, izq, der, focoIzq = false, focoDer = false, igual = false, children = null }) {
  return (
    <div className="t4s5-par" data-par data-igual={igual ? "" : undefined}>
      <div className="t4s5-par-fila">
        <LadoPar lado="izq" r={F.banco} v={izq} foco={focoIzq} />
        <span aria-hidden="true">{igual && <span className="t4s5-igual t4s-nueva" data-igual-signo>=</span>}</span>
        <LadoPar lado="der" r={F.empresa} v={der} foco={focoDer} />
      </div>
      {igual && <span className="t4s-sr">{SON_IGUALES}</span>}
      {children}
    </div>
  );
}

/* El renglón de 20 del tercer lugar: «saldo verdadero: ?» o, con los lados iguales, la cifra que cuenta. */
function Verdadero({ F, v, visible }) {
  const x = useNumeroQueSube(v ?? 0);
  return (
    <p className="t4s5-f20 t4s5-ver" data-verdadero={visible ? (v ?? "?") : undefined} style={{ visibility: visible ? "visible" : "hidden" }}>
      <span aria-hidden="true">{F.verdadero} {v != null ? cifra(x) : "?"}</span>
      <span className="t4s-sr">{v != null ? `${F.verdadero} ${cifra(v)}` : F.verdaderoLector}</span>
    </p>
  );
}

/* La devolución de una tarjeta: acierto, error (por opción, si el hilo lo da) o el porqué del segundo error. */
function devDe(t, e, id, { acierto = [], error = () => [] } = {}) {
  const x = tarjeta(e, id);
  if (!x) return null;
  if (correctoTarjeta(e, id)) return { ver: "mal", textos: [t.porque], n: x.intentos };
  if (x.ok) return { ver: "bien", textos: acierto };
  return { ver: "mal", textos: error(x.eleccion), n: x.intentos };
}

/* ═══════════ 1 · dos-saldos ═══════════ */

function FiguraSaldo({ t, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const { D } = t;
  const hecha = resueltaTarjeta(e, "saldo");
  const dev = devDe(t, e, "saldo", { acierto: t.acierto, error: (o) => [t.errores[o]] });
  return (
    <Slide banda={<Banda antes={t.antes} dev={dev} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
    ]} />}>
      <ParA5 F={D.F} izq={D.EXTRACTO} der={D.LIBROS}>
        <p className="t4s5-f20 t4s5-dif" data-pie-par>{t.difieren}</p>
        <Verdadero F={D.F} v={null} visible={hecha} />
      </ParA5>
      <div className="t4s5-op"><Opciones
        opciones={t.opciones}
        etiqueta={t.antes[1]}
        apagadas={hecha}
        ver={(id) => verDe(e, "saldo", id, t.correcta)}
        onElegir={(id) => setEstado((x) => calificar(x, "saldo", id, t.correcta))}
      /></div>
    </Slide>
  );
}

/* ═══════════ 2 y 3 · un lado: cada partida a «Más» o a «Menos» ═══════════ */

function Total({ v }) {
  const x = useNumeroQueSube(v);
  return <span className="tot" data-total={v}>{v ? cifra(x) : ""}</span>;
}

const partidasDe = (D, lado) => (lado === "banco" ? D.PARTIDAS_BANCO : D.PARTIDAS_EMPRESA);

function FiguraLado({ t, lado, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const { D } = t;
  const F = D.F;
  const banco = lado === "banco";
  const partidas = partidasDe(D, lado);
  const k = partidas.findIndex((p) => !resueltaTarjeta(e, p.id));
  const i = k < 0 ? partidas.length : k;
  const x = partidas[i];
  const puestas = partidas.filter((p) => colocada(e, p.id, p.va) != null);
  const saldo = saldoTrasA5(banco ? D.EXTRACTO : D.LIBROS, partidas, i);
  const izq = banco ? saldo : D.CONCILIADO_BANCO;
  const der = banco ? D.LIBROS : saldo;
  const igual = izq === der;
  const foco = partidas.find((p) => p.id === e.foco) ?? null;
  const dev = devDe(t, e, e.foco);
  const destino = (s, rotulo) => {
    const mias = puestas.filter((p) => p.va === s);
    const ultima = mias[mias.length - 1];
    return (
      <div className="t4s5-dest" key={s}>
        <Control
          data-destino={s}
          nombre={F.seccion(rotulo, lado)}
          ver={foco ? verDe(e, foco.id, s, foco.va) : null}
          apagado={!x}
          onClick={() => setEstado((z) => calificar(z, x.id, s, x.va))}
        >
          <span>{rotulo}</span>
        </Control>
        <Total v={mias.reduce((n, p) => n + p.monto, 0)} />
        <span className="ult" data-ultima={ultima?.id}>{ultima ? cifra(ultima.monto) : ""}</span>
      </div>
    );
  };
  return (
    <Slide banda={<Banda antes={t.antes} dev={dev} posibles={[{ ver: "bien", textos: [] }, { ver: "mal", textos: [t.porque] }]} />}>
      <div className="t4s5-col">
        <ParA5 F={F} izq={izq} der={der} focoIzq={banco && i > 0} focoDer={!banco && i > 0} igual={igual}>
          <Verdadero F={F} v={igual ? izq : null} visible />
        </ParA5>
        <p className="t4s5-tj t4s-nueva" key={x?.id ?? "fin"} data-tarjeta-partida={x?.id ?? "fin"} style={{ margin: 0 }}>
          {x ? <><span className="m">{cifra(x.monto)}</span><span>{x.texto}</span></> : <span>{F.fin}</span>}
        </p>
        <div className="t4s5-dests" role="group" aria-label={x?.texto ?? F.fin}>
          {destino(MAS, F.mas)}
          {destino(MENOS, F.menos)}
        </div>
      </div>
    </Slide>
  );
}

/* ═══════════ 4 · que-se-asienta ═══════════ */

function FiguraAsienta({ t, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const ch = t.D.CHEQUE_P3;
  const hecha = resueltaTarjeta(e, "cheque");
  const dev = devDe(t, e, "cheque", { acierto: t.acierto, error: (o) => [t.errores[o]] });
  return (
    <Slide banda={<Banda antes={t.antes} dev={dev} posibles={[
      { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
    ]} />}>
      <p className="t4s5-tj" data-tarjeta-partida={ch.id} style={{ margin: 0 }}><span className="m">{cifra(ch.monto)}</span><span>{ch.texto}</span></p>
      <Opciones
        opciones={t.opciones}
        etiqueta={t.etiqueta}
        apagadas={hecha}
        ver={(id) => verDe(e, "cheque", id, t.correcta)}
        onElegir={(id) => setEstado((x) => calificar(x, "cheque", id, t.correcta))}
      />
    </Slide>
  );
}

/* ═══════════ 5 · los-asientos ═══════════ */

const ladoBancos = (a) => (a.debe === "bancos" ? DEBE : HABER);

/*
 * Katsumi (#488, condición d): la decisión ya no es el lado de Bancos (eso
 * era A5 p3 otra vez). Bancos aparece puesto en su lado y la nota se lleva a
 * su contrapartida, entre tres de las cuentas de la p. 191: la correcta y dos
 * de las otras, siempre en el mismo orden (el de la p. 191), sin el lado.
 * Una nota a la vez; la siguiente llega a los 1,4 s, como en A5 de antes, y
 * un toque mientras tanto la trae ya. Con movimiento reducido llega de una vez.
 */
function cuentasDe(A) {
  const todas = new Map();
  for (const a of A) for (const c of a.cuentas) if (c.id !== "bancos" && !todas.has(c.id)) todas.set(c.id, c.renglones);
  return [...todas].map(([id, renglones]) => ({ id, renglones }));
}

export function opcionesNota(A, k) {
  const a = A[k];
  const correcta = a.cuentas.find((c) => c.id !== "bancos").id;
  const otras = cuentasDe(A).filter((c) => c.id !== correcta);
  const fuera = otras[k % otras.length].id;
  return cuentasDe(A).filter((c) => c.id !== fuera);
}

function FiguraAsientos({ t, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const { D } = t;
  const F = D.F;
  const A = D.ASIENTOS_A5;
  const total = A.length;
  const reducido = useReducido();
  const k = A.findIndex((a) => !resueltaTarjeta(e, a.id));
  const actual = k < 0 ? total - 1 : k;
  const [vista, setVista] = useState(actual);
  const reloj = useRef(0);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (vista === actual) return undefined;
    if (reducido) { setVista(actual); return undefined; }
    reloj.current = setTimeout(() => setVista(actual), ESPERA_NOTA_MS);
    return () => clearTimeout(reloj.current);
  }, [vista, actual, reducido]);
  const a = A[vista];
  const espera = vista !== actual;
  const lado = ladoBancos(a);
  const correcta = a.cuentas.find((c) => c.id !== "bancos").id;
  const puesta = colocada(e, a.id, correcta) != null;
  const dev = devDe(t, e, e.foco, { error: () => [t.error] });
  return (
    <Slide banda={<Banda antes={t.antes} dev={dev} posibles={[{ ver: "bien", textos: [] }, { ver: "mal", textos: [t.porque] }, { ver: "mal", textos: [t.error] }]} />}>
      <div className="t4s5-nt t4s-nueva" key={a.id} data-tarjeta-nota={a.id}>
        <span className="l">{a.linea}</span>
        <span className="p"><span>{F.contadorNota(vista + 1, total)}</span><b>{cifra(a.monto)}</b></span>
      </div>
      <div className="t4s5-p5" lang="es">
      <div className="t4s5-cta" data-cuenta="bancos">
        <span className="n">{a.cuentas.find((c) => c.id === "bancos").renglones.join(" ")}</span>
        <div className="t4s5-mts">
          {[DEBE, HABER].map((l) => (
            <span key={l} className="t4s5-mt" data-mitad={`bancos:${l}`}>
              <span className="k" style={{ color: l === DEBE ? C.debeTexto : C.haber }}>{ROTULO[l]}</span>
              <span className="v">{l === lado ? cifra(a.monto) : null}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="t4s5-ops" role="group" aria-label={t.titular} data-contrapartidas>
        {opcionesNota(A, vista).map((c) => {
          const nombre = c.renglones.join(" ");
          const v = puesta && c.id === correcta ? cifra(a.monto) : null;
          return (
            <Control
              key={`${a.id}:${c.id}`}
              data-opcion={c.id}
              ver={verDe(e, a.id, c.id, correcta)}
              apagado={!espera && resueltaTarjeta(e, a.id)}
              nombre={`${nombre}${v ? `: ${v}` : ""}`}
              onClick={() => (espera ? setVista(actual) : setEstado((z) => calificar(z, a.id, c.id, correcta)))}
            >
              <span className="n">{c.renglones.map((r) => <span key={r}>{r}</span>)}</span>
              <span className={`v${v ? " t4s-nueva" : ""}`}>{v}</span>
            </Control>
          );
        })}
      </div>
      </div>
    </Slide>
  );
}

/* ═══════════ 6 · el-mayor (Cierre) ═══════════ */

function FiguraMayor({ t }) {
  useTerminada(A5_ID);
  const { D } = t;
  const F = D.F;
  const A = D.ASIENTOS_A5;
  const total = A.length;
  const reducido = useReducido();
  const [n, setN] = useState(0);
  const reloj = useRef(0);
  useEffect(() => () => clearInterval(reloj.current), []);
  const asentar = () => {
    if (n) return;
    if (reducido) { setN(total); return; }
    let j = 0;
    setN(0.5);
    reloj.current = setInterval(() => { j += 1; setN(j); if (j >= total) clearInterval(reloj.current); }, PASO_MAYOR_MS);
  };
  const hechos = A.slice(0, Math.floor(n));
  const ultimo = hechos[hechos.length - 1];
  const fin = n === total;
  const linea = (a) => (
    <span key={a.id} className="t4s5-my-l t4s-nueva" data-linea={a.id} data-foco={a === ultimo && !fin ? "" : undefined}>{cifra(a.monto)}</span>
  );
  return (
    <Slide banda={<Banda antes={[t.cierre]} pie={t.pie} />}>
      <div className="t4s5-my" data-mayor>
        <p className="t">{F.mayor}</p>
        <div className="t4s5-my-cols">
          <div className="t4s5-my-col" data-columna="debe">
            <span style={{ color: C.debeTexto }}>{ROTULO[DEBE]}</span>
            <div className="t4s5-my-ls">
              <span className="t4s5-my-l" data-linea="saldo"><span className="r">{F.saldo}</span>{cifra(D.LIBROS)}</span>
              {hechos.filter((a) => a.debe === "bancos").map(linea)}
            </div>
          </div>
          <span style={{ background: "rgba(248,249,250,0.22)" }} />
          <div className="t4s5-my-col" data-columna="haber">
            <span style={{ color: C.haber, textAlign: "right" }}>{ROTULO[HABER]}</span>
            <div className="t4s5-my-ls">{hechos.filter((a) => a.haber === "bancos").map(linea)}</div>
          </div>
        </div>
        <div className="t4s5-my-saldo" data-saldo-mayor={fin ? D.SALDO_MAYOR : ""} style={{ visibility: fin ? "visible" : "hidden" }}>
          <span>{F.saldo}</span><span className={fin ? "t4s-nueva" : undefined}>{cifra(D.SALDO_MAYOR)}</span>
        </div>
      </div>
      <div className="t4s5-slot">
        {n === 0 && <Control data-accion="asentar" nombre={F.asentar} onClick={asentar}><span>{F.asentar}</span></Control>}
        {fin && <div className="t4s-nueva" data-par-final><ParA5 F={F} izq={D.CONCILIADO_BANCO} der={D.CONCILIADO} igual /></div>}
      </div>
    </Slide>
  );
}

/* ═══════════ La pieza ═══════════ */

export function piezaSlidesA5(caso = 1) {
  const t = SLIDES_A5[caso] ?? SLIDES_A5[1];
  const D = t.D;
  const con = (Fig, datos, extra = {}) => (props) => <Fig t={{ ...datos, D }} {...extra} {...props} />;
  const haz = (id, datos, Fig, resuelta, extra) => ({
    id, tipo: "haz", titular: datos.titular, antes: datos.antes, Figura: con(Fig, datos, extra), nombreFigura: datos.alt,
    estadoInicial: HAZ_VACIO, resuelta, razon: RAZON_HAZ,
  });
  return {
    id: A5_ID,
    pantallas: [
      haz("dos-saldos", t.saldo, FiguraSaldo, (e) => resueltaTarjeta(e, "saldo")),
      haz("lado-del-banco", t.banco, FiguraLado, (e) => todasResueltas(e, D.PARTIDAS_BANCO.map((p) => p.id)), { lado: "banco" }),
      haz("lado-de-la-empresa", t.empresa, FiguraLado, (e) => todasResueltas(e, D.PARTIDAS_EMPRESA.map((p) => p.id)), { lado: "empresa" }),
      haz("que-se-asienta", t.asienta, FiguraAsienta, (e) => resueltaTarjeta(e, "cheque")),
      haz("los-asientos", t.asientos, FiguraAsientos, (e) => todasResueltas(e, D.ASIENTOS_A5.map((a) => a.id))),
      {
        id: "el-mayor", tipo: "cierre", titular: t.mayor.titular, antes: [t.mayor.cierre], Figura: con(FiguraMayor, t.mayor), nombreFigura: t.mayor.alt,
      },
    ],
    /* Para las pruebas y la sonda: lo que la banda puede decir, por pantalla (sin las cifras de la figura). */
    textos: { saldo: t.saldo, banco: t.banco, empresa: t.empresa, asienta: t.asienta, asientos: t.asientos, mayor: t.mayor },
  };
}
