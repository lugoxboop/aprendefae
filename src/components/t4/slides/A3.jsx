/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A3 «El arqueo» — LOS SLIDES (Hanayama §3, A3).
 *
 * La figura común es el sobre sin el renglón «Suman» (78: rótulo 16, solapa
 * 18 y dos renglones) y la regla del fondo en compacto (64: un renglón de
 * 14 con el rótulo de la aguja, 30 de aguja y marcas, y un renglón de 14 con
 * «falta», «fondo» y «sobra»), con huecos de 6. El rótulo de la aguja dice lo
 * que decía la zona: «sobra $2.100», «falta $6.700» o «cuadra».
 *
 *   1 · contar         Haz     «Contar la caja» ocupa el hueco; al contar, la
 *                              solapa se abre y el hueco pasa a Falta, Cuadra
 *                              y Sobra. La aguja sale solo al quedar resuelta
 *   2 · mover          Míralo  el control mueve la plata de la caja
 *   3 · el-sobrante    Haz     igual que la 1, ya contada
 *   4 · el-cheque      Haz     tres cheques
 *   5 · el-asiento     Haz     la ficha a una cuenta y un lado: rejilla de
 *                              cuentas T (dos arriba, la tercera a lo ancho)
 *   6 · el-faltante    Haz     tres cheques
 *   7 · camino-1       Haz     la rejilla, con los 6.700
 *   8 · dos-caminos    Cierre  la regla, el interruptor (opcional) y la
 *                              cuenta T donde caen los 6.700
 *
 * Todo lo que se mueve lo hace con transform u opacity; con movimiento
 * reducido, comun.jsx apaga las animaciones bajo `.t4s`.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useNumeroQueSube } from "../../mecanicas/libros/verbos.jsx";
import { A3_ID, CUENTAS_A3, DATOS_A3, DEBE, HABER, REGLA_A3, SLIDES_A3, cifra } from "../../../data/contabilidadT4SlidesA3.js";
import { C } from "../comun.jsx";
import { xDe } from "../Regla.jsx";
import {
  Banda, Control, HAZ_VACIO, Opciones, RAZON_HAZ, Slide, calificar, colocada, correctoTarjeta, resueltaTarjeta,
  tarjeta, useTerminada, verDe,
} from "./comun.jsx";

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const LADOS = { [DEBE]: "Debe", [HABER]: "Haber" };
const pesos = (n) => `$${cifra(n)}`;

export const CSS_SLIDES_A3 = `
.t4s3-col { display: grid; gap: 6px; align-content: start; min-width: 0; }
.t4s3-sb { display: grid; min-width: 0; }
.t4s3-sb-rot { margin: 0; height: 16px; font: 500 12px/16px "Inter", sans-serif; letter-spacing: .04em; color: ${C.texto2}; white-space: nowrap; overflow: hidden; }
.t4s3-sb svg { display: block; width: 100%; height: 18px; overflow: visible; }
.t4s3-solapa { transform-box: view-box; transform-origin: 50% 50%; transition: transform 220ms ${CURVA}; }
.t4s3-solapa[data-abierta] { transform: rotateX(180deg); }
.t4s3-sb-caja { border: 1px solid ${C.neutro}; border-top: none; border-radius: 0 0 10px 10px; padding: 0 12px; }
.t4s3-sb-caja[data-luz] { border-color: ${C.texto}; }
.t4s3-sb-f { display: flex; justify-content: space-between; align-items: center; gap: 8px; height: 21px; font: 400 13px/16px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4s3-sb-f > span:last-child { font: 500 15px/18px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto}; }
.t4s3-sb-f[data-luz] > span:first-child { color: ${C.texto}; font-weight: 600; }
.t4s3-rg { position: relative; height: 64px; min-width: 0; }
.t4s3-rg > span { position: absolute; display: block; }
.t4s3-pista { left: 0; right: 0; top: 30px; height: 2px; background: ${C.neutro}; }
.t4s3-tic { top: 26px; width: 1px; height: 10px; background: ${C.neutro}; }
.t4s3-marca { left: calc(50% - 1px); top: 16px; width: 2px; height: 28px; background: ${C.texto}; }
.t4s3-tramo { top: 38px; width: 50%; height: 6px; border-radius: 3px; background: ${C.texto}; transition: transform 120ms ${CURVA}; }
.t4s3-mano { left: 0; top: 0; width: 100%; height: 44px; pointer-events: none; transition: transform 120ms ${CURVA}; }
.t4s3-aguja { position: absolute; left: -1px; top: 14px; width: 2px; height: 26px; background: ${C.texto}; }
.t4s3-rot { position: absolute; top: 0; font: 600 12px/14px "Inter", sans-serif; color: ${C.texto}; white-space: nowrap; font-variant-numeric: tabular-nums; }
.t4s3-pie { top: 50px; font: 500 12px/14px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4s3-pie b { font-weight: 600; color: ${C.texto}; font-variant-numeric: tabular-nums; }
.t4s3-hueco { display: grid; min-height: 48px; }
.t4s3-hueco > * { grid-area: 1 / 1; min-width: 0; }
.t4s3-hueco > [data-oculta] { visibility: hidden; }
.t4s3-contar { appearance: none; min-height: 44px; align-self: start; border-radius: 8px; border: 1px solid ${C.texto}; background: transparent; color: ${C.texto}; font: 600 14px/18px "Inter", sans-serif; cursor: pointer; }
.t4s3-contar:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4s3-control { display: block; width: 100%; height: 44px; margin: 0; accent-color: ${C.texto}; cursor: pointer; }
.t4s3-rotfila { display: flex; justify-content: space-between; align-items: center; gap: 8px; height: 16px; }
.t4s3-rotfila > p { margin: 0; font: 500 12px/16px "Inter", sans-serif; letter-spacing: .04em; color: ${C.texto2}; white-space: nowrap; overflow: hidden; }
.t4s3-ficha { height: 16px; padding: 0 6px; border: 1px solid ${C.texto}; border-radius: 6px; font: 600 12px/14px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto}; transition: opacity 120ms ${CURVA}; }
.t4s3-ficha[data-puesta] { opacity: 0; }
.t4s3-lib { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px 8px; }
.t4s3-cta { display: grid; gap: 2px; align-content: end; min-width: 0; }
.t4s3-cta[data-ancha] { grid-column: 1 / -1; }
.t4s3-nom { margin: 0; font: 500 12px/13px "Inter", sans-serif; color: ${C.texto}; overflow-wrap: anywhere; }
.t4s3-t { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 4px; border-top: 2px solid ${C.neutro}; }
.t4s3-lado { display: grid; align-content: center; justify-items: start; gap: 0; text-align: left; padding: 2px 8px; }
.t4s3-lado[data-ver] { padding: 1px 7px; }
.t4s3-lado > .l { font: 400 12px/14px "Inter", sans-serif; color: ${C.texto2}; }
.t4s3-lado > .v { font: 600 13px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto}; min-height: 16px; }
.t4s3-lado-q { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-height: 30px; padding: 0 8px; border: 1px solid ${C.reposo}; border-radius: 8px; }
.t4s3-lado-q > .l { font: 400 12px/14px "Inter", sans-serif; color: ${C.texto2}; }
.t4s3-lado-q > .v { font: 600 13px/16px "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t4s3-par { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.t4s3-par > .t4s-ctl { text-wrap: balance; }
.t4s3-par > .t4s-ctl[aria-pressed="true"] { border-width: 2px; border-color: ${C.texto}; padding: 1px 5px; }
`;

/* ═══════════ LA FIGURA COMÚN ═══════════ */

function CifraQueSube({ v }) {
  const x = useNumeroQueSube(v);
  return <>{cifra(x)}</>;
}

/* El sobre sin «Suman»: los soportes y la caja. `abierta` (null sin solapa que se mueva): la solapa de «Contar la caja» (D9). */
function SobreA3({ F, gastado, caja, luz = false, abierta = null, sube = true }) {
  return (
    <div className="t4s3-sb" data-sobre>
      <p className="t4s3-sb-rot">{F.sobre}</p>
      <svg aria-hidden="true" viewBox="0 0 100 18" preserveAspectRatio="none" data-solapa={abierta ? "abierta" : "cerrada"}>
        <path d="M0 18 L0 9 L100 9 L100 18" fill="none" stroke={luz ? C.texto : C.neutro} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path className="t4s3-solapa" data-abierta={abierta ? "" : undefined} d="M0 9 L50 17 L100 9" fill="none" stroke={luz ? C.texto : C.neutro} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="t4s3-sb-caja" data-luz={luz ? "" : undefined}>
        <div className="t4s3-sb-f" data-fila-sobre="soportes"><span>{F.soportes}</span><span>{cifra(gastado)}</span></div>
        <div className="t4s3-sb-f" data-fila-sobre="caja" data-luz={luz ? "" : undefined} data-valor={caja ?? undefined}>
          <span>{F.caja}</span><span>{caja == null ? F.sinContar : sube ? <CifraQueSube v={caja} /> : cifra(caja)}</span>
        </div>
      </div>
    </div>
  );
}

/* Lo que dice el rótulo de la aguja: «cuadra», «sobra $X» o «falta $X». */
export const rotuloAguja = (desv) => (desv === 0 ? REGLA_A3.cuadra : `${desv > 0 ? REGLA_A3.sobra : REGLA_A3.falta} ${pesos(Math.abs(desv))}`);

/*
 * La regla compacta (64). `desv`: la suma menos el fondo, o null (sin aguja).
 * La aguja y su rótulo viajan juntos en una capa del ancho de la regla que se
 * corre con translateX; el tramo crece desde la marca con scaleX.
 */
function ReglaA3({ fondo, desv = null, tramo = true }) {
  const x = desv == null ? 50 : xDe(desv);
  const lado = x > 62 ? "izq" : x < 38 ? "der" : x > 50 ? "der" : x < 50 ? "izq" : "centro";
  const rot = lado === "izq" ? "translateX(calc(-100% - 5px))" : lado === "der" ? "translateX(5px)" : "translateX(-50%)";
  const conTramo = tramo && desv != null && desv !== 0;
  return (
    <div className="t4s3-rg" data-regla aria-hidden="true">
      <span className="t4s3-pista" />
      {Array.from({ length: 11 }, (_, k) => <span key={k} className="t4s3-tic" style={{ left: `${2 + k * 9.2}%` }} />)}
      <span className="t4s3-marca" />
      {conTramo && (
        <span className="t4s3-tramo t4s-nueva" data-tramo={desv > 0 ? "sobra" : "falta"}
          style={desv > 0
            ? { left: "50%", transformOrigin: "0 50%", transform: `scaleX(${(x - 50) / 50})` }
            : { left: 0, transformOrigin: "100% 50%", transform: `scaleX(${(50 - x) / 50})` }} />
      )}
      {desv != null && (
        <span className="t4s3-mano t4s-nueva" data-aguja={desv === 0 ? "cuadra" : desv > 0 ? "sobra" : "falta"} style={{ transform: `translateX(${x}%)` }}>
          <span className="t4s3-aguja" />
          <span className="t4s3-rot" data-rot-aguja style={{ transform: rot }}>{rotuloAguja(desv)}</span>
        </span>
      )}
      <span className="t4s3-pie" style={{ left: 0 }}>{REGLA_A3.falta}</span>
      <span className="t4s3-pie" style={{ left: "50%", transform: "translateX(-50%)" }}>{REGLA_A3.fondo} <b>{cifra(fondo)}</b></span>
      <span className="t4s3-pie" style={{ right: 0 }}>{REGLA_A3.sobra}</span>
    </div>
  );
}

/* ═══════════ LA DEVOLUCIÓN DE UN HAZ DE UNA SOLA TARJETA ═══════════ */

function devUna(t, e, id, errorDe) {
  const x = tarjeta(e, id);
  if (!x) return null;
  if (correctoTarjeta(e, id)) return { ver: "mal", textos: [t.porque] };
  if (x.ok) return { ver: "bien", textos: t.acierto };
  return { ver: "mal", textos: [errorDe(x.eleccion)], n: x.intentos };
}

const posiblesDe = (t) => [
  { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] },
  ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
];

/* ═══════════ 1 · contar y 3 · el-sobrante ═══════════ */

function FiguraZona({ t, caso, estado, setEstado, conContar = false }) {
  const D = DATOS_A3[caso];
  const e = estado ?? HAZ_VACIO;
  const contado = !conContar || Boolean(e.contado);
  const puesta = colocada(e, "zona", t.correcta) != null;
  const hecha = resueltaTarjeta(e, "zona");
  const elegir = (id) => setEstado((x) => ({ ...calificar(x, "zona", id, t.correcta), contado: true }));
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "zona", (o) => t.errores[o])} posibles={posiblesDe(t)} />}>
      <div className="t4s3-col">
        <SobreA3 F={D.F} gastado={D.GASTADO} caja={contado ? t.caja : null} luz={conContar && contado} abierta={conContar ? contado : null} />
        <ReglaA3 fondo={D.FONDO} desv={puesta ? D.GASTADO + t.caja - D.FONDO : null} />
        <div className="t4s3-hueco">
          {conContar && (
            <button type="button" className="t4s3-contar" data-accion="contar" data-oculta={contado ? "" : undefined}
              aria-hidden={contado ? "true" : undefined} tabIndex={contado ? -1 : undefined}
              onClick={contado ? undefined : () => setEstado((x) => ({ ...(x ?? HAZ_VACIO), contado: true }))}>
              {D.F.contar}
            </button>
          )}
          <div data-oculta={contado ? undefined : ""}>
            <Opciones opciones={t.opciones} etiqueta={D.F.opcionesZona} apagadas={hecha}
              ver={(id) => verDe(e, "zona", id, t.correcta)} onElegir={elegir} />
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ═══════════ 2 · mover (Míralo) ═══════════ */

function FiguraMover({ t, caso, estado, setEstado }) {
  const D = DATOS_A3[caso];
  const caja = estado?.caja ?? t.control.inicio;
  const desv = D.GASTADO + caja - D.FONDO;
  return (
    <Slide banda={<Banda antes={t.antes} />}>
      <div className="t4s3-col">
        <SobreA3 F={D.F} gastado={D.GASTADO} caja={caja} luz sube={false} />
        <ReglaA3 fondo={D.FONDO} desv={desv} />
        <input type="range" className="t4s3-control" data-accion="mover" aria-label={D.F.control}
          aria-valuetext={`${cifra(caja)}, ${rotuloAguja(desv)}`}
          min={t.control.min} max={t.control.max} step={t.control.paso} value={caja}
          onChange={(ev) => setEstado({ caja: Number(ev.target.value) })} />
      </div>
    </Slide>
  );
}

/* ═══════════ 4 · el-cheque y 6 · el-faltante ═══════════ */

function FiguraCheque({ t, caso, estado, setEstado }) {
  const D = DATOS_A3[caso];
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "cheque");
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "cheque", (o) => t.errores[o])} posibles={posiblesDe(t)} />}>
      <div className="t4s3-col">
        <SobreA3 F={D.F} gastado={D.GASTADO} caja={t.caja} />
        <ReglaA3 fondo={D.FONDO} desv={D.GASTADO + t.caja - D.FONDO} />
        <Opciones opciones={t.opciones} etiqueta={D.F.opcionesCheque} apagadas={hecha} cifra
          ver={(id) => verDe(e, "cheque", id, t.correcta)}
          onElegir={(id) => setEstado((x) => calificar(x, "cheque", id, t.correcta))} />
      </div>
    </Slide>
  );
}

/* ═══════════ 5 · el-asiento y 7 · camino-1 ═══════════ */

const nombreCuenta = (id) => CUENTAS_A3[id].renglones.join(" ");

function FiguraAsiento({ t, caso, estado, setEstado }) {
  const D = DATOS_A3[caso];
  const e = estado ?? HAZ_VACIO;
  const correcta = `${t.va.id}:${t.va.lado}`;
  const hecha = resueltaTarjeta(e, "ficha");
  const puesta = colocada(e, "ficha", correcta) != null;
  const errorDe = (o) => {
    const [cuenta] = o.split(":");
    return cuenta === t.va.id ? t.errores.lado : t.errores[cuenta];
  };
  /* Dos cuentas arriba y la de nombre más largo a lo ancho: así los nombres completos caben a 320 (C5). */
  const orden = [...t.cuentas.filter((c) => c !== t.ancha), t.ancha];
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "ficha", errorDe)} posibles={posiblesDe(t)} />}>
      <div className="t4s3-col">
        <div className="t4s3-rotfila">
          <p>{t.rotulo}</p>
          <span className="t4s3-ficha" data-ficha data-puesta={puesta ? "" : undefined} aria-hidden="true">{cifra(t.monto)}</span>
        </div>
        <div className="t4s3-lib" role="group" aria-label={D.F.tablero}>
          {orden.map((c) => (
            <div key={c} className="t4s3-cta" data-cuenta={c} data-ancha={c === t.ancha ? "" : undefined}>
              <p className="t4s3-nom">{nombreCuenta(c)}</p>
              <div className="t4s3-t">
                {[DEBE, HABER].map((lado) => {
                  const id = `${c}:${lado}`;
                  const base = t.base[c]?.[lado];
                  const valor = base ?? (puesta && id === correcta ? t.monto : null);
                  return (
                    <Control key={lado} className="t4s3-lado" data-lado={id} ver={verDe(e, "ficha", id, correcta)} apagado={hecha}
                      nombre={`${nombreCuenta(c)}: ${LADOS[lado]}${base != null ? `, ${cifra(base)}` : ""}`}
                      onClick={() => setEstado((x) => calificar(x, "ficha", id, correcta))}>
                      <span className="l">{LADOS[lado]}</span>
                      <span className={`v${base == null && valor != null ? " t4s-nueva" : ""}`}>{valor != null ? cifra(valor) : ""}</span>
                    </Control>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

/* ═══════════ 8 · dos-caminos (Cierre) ═══════════ */

function FiguraCaminos({ t, caso, estado, setEstado }) {
  useTerminada(A3_ID);
  const D = DATOS_A3[caso];
  const asume = Boolean(estado?.asume);
  const va = asume ? "gno-faltante" : "cxc-empleados";
  return (
    <Slide banda={<Banda antes={[t.cierre]} siguiente={t.siguiente} pie={t.pie} />}>
      <div className="t4s3-col">
        <ReglaA3 fondo={D.FONDO} desv={-D.FALTANTE} />
        <div className="t4s3-par">
          {[[false, "cobra"], [true, "asume"]].map(([v, id]) => (
            <Control key={id} data-accion={id} aria-pressed={asume === v} onClick={() => setEstado({ asume: v })}>
              <span>{t.caminos[id]}</span>
            </Control>
          ))}
        </div>
        <div className="t4s3-cta" data-cuenta={va} key={va}>
          <p className="t4s3-nom t4s-nueva">{nombreCuenta(va)}</p>
          <div className="t4s3-t">
            <span className="t4s3-lado-q"><span className="l">{LADOS[DEBE]}</span><span className="v t4s-nueva">{cifra(D.FALTANTE)}</span></span>
            <span className="t4s3-lado-q"><span className="l">{LADOS[HABER]}</span><span className="v" /></span>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ═══════════ La pieza ═══════════ */

const NOMBRE_SOBRE = "El sobre con los soportes y la caja, sobre la regla del fondo";
const NOMBRE_ASIENTO = "El asiento del reembolso, en cuentas T con su debe y su haber";
const NOMBRE_CAMINOS = "La regla del fondo, quién paga lo que falta y la cuenta donde va";

export function piezaSlidesA3(caso = 1) {
  const k = SLIDES_A3[caso] ? caso : 1;
  const t = SLIDES_A3[k];
  const con = (Fig, datos, extra = {}) => (props) => <Fig t={datos} caso={k} {...extra} {...props} />;
  const haz = (id, datos, Fig, nombre, tarjetaId, extra) => ({
    id, tipo: "haz", titular: datos.titular, antes: datos.antes, Figura: con(Fig, datos, extra), nombreFigura: nombre,
    estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, tarjetaId), razon: RAZON_HAZ,
  });
  return {
    id: A3_ID,
    pantallas: [
      haz("contar", t.contar, FiguraZona, NOMBRE_SOBRE, "zona", { conContar: true }),
      { id: "cuando-no-cuadra", tipo: "miralo", titular: t.mover.titular, antes: t.mover.antes, Figura: con(FiguraMover, t.mover), nombreFigura: NOMBRE_SOBRE },
      haz("el-sobrante", t.sobrante, FiguraZona, NOMBRE_SOBRE, "zona"),
      haz("el-cheque", t.chequeSobra, FiguraCheque, NOMBRE_SOBRE, "cheque"),
      haz("el-asiento", t.asientoSobra, FiguraAsiento, NOMBRE_ASIENTO, "ficha"),
      haz("el-faltante", t.chequeFalta, FiguraCheque, NOMBRE_SOBRE, "cheque"),
      haz("camino-1", t.asientoFalta, FiguraAsiento, NOMBRE_ASIENTO, "ficha"),
      { id: "dos-caminos", tipo: "cierre", titular: t.caminos.titular, antes: [t.caminos.cierre], Figura: con(FiguraCaminos, t.caminos), nombreFigura: NOMBRE_CAMINOS },
    ],
    /* Para las pruebas y la sonda: lo que la banda puede decir, por pantalla. */
    textos: t,
  };
}
