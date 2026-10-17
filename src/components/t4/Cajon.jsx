/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · «EL CAJÓN DE PASO», OPERABLE (Hanayama, rediseño de A1 §1 y H1 §1).
 *
 * La figura de A1 que ahora el estudiante maneja, y el tablero de H1: el
 * mismo dibujo con el mismo significado. Carril de la Célula D, no
 * compartido. Portado del prototipo (t4r/Cajon.jsx) con los rótulos en
 * src/data/contabilidadT4.js.
 *
 *   · DESTINOS: las dos columnas del cajón y la bandeja «Caja no se mueve»
 *     son botones (data-destino) cuando la pantalla pregunta
 *   · ACCIONES: «Cobrar» en el origen, «Consignar» en Bancos, «Pagar» en
 *     Pago en efectivo (data-accion)
 *   · «En la caja»: el saldo, que CUENTA hasta su valor (useNumeroQueSube,
 *     compartido y sin cambios). Una cifra, no el marcador del Tema 2
 *   · la LUZ (borde de 2 px #F8F9FA) sobre la parte que se señala
 *
 * Lo que la plata hace se ve con el trazo que se enciende (#B8C4D4 →
 * #F8F9FA) y la cifra que aparece en su columna con fundido de 120 ms. Nada
 * vuela. Acierto: borde #F8F9FA y ✓. Error: borde coral y ✗, y no se escribe
 * nada. Teal y ámbar solo en «Debe» y «Haber».
 *
 * Con `palabras` (H1), la marca de cada destino lleva palabra y va en un
 * hueco reservado al pie de la columna o en la segunda línea de la bandeja:
 * no tapa «DEBE» ni «HABER» y la figura no crece al responder (Hanayama §9.5).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useId, useRef } from "react";
import { useNumeroQueSube } from "../mecanicas/libros/verbos.jsx";
import { FIGURA_CAJON, DEBE, HABER, NO_SE_MUEVE, MARCA } from "../../data/contabilidadT4.js";
import { C, cifra, Marca } from "./comun.jsx";

const BOCA = 40;

export const CSS_CAJON = `
.t4cv { position: relative; margin: 0; display: grid; min-width: 0; color: ${C.texto}; font-family: "Inter", sans-serif; }
.t4cv * { box-sizing: border-box; }
.t4cv-origen { position: relative; display: grid; gap: 2px; border: 1px solid ${C.reposo}; border-radius: 8px; padding: 8px 12px; }
/*
 * D9 (Hanayama), solo en H1: los hechos ya respondidos se apilan detrás de la
 * tarjeta como un fajo, hasta 7 cantos de 1 px #B8C4D4, cada uno 2 px más
 * arriba y más angosto. Sus 14 px se reservan desde el primer hecho: el fajo
 * crece sin mover nada. Quieto: sin movimiento.
 */
.t4cv-fajo { position: relative; padding-top: 14px; }
.t4cv-canto { position: absolute; height: 6px; border: 1px solid ${C.neutro}; border-bottom: none; border-radius: 8px 8px 0 0; pointer-events: none; }
.t4cv-rot { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${C.texto2}; }
.t4cv-hecho { font-size: 15px; line-height: 22px; overflow-wrap: anywhere; }
.t4cv-origen[data-tarjeta] .t4cv-hecho { min-height: 66px; }
.t4cv-lin { display: flex; justify-content: space-between; align-items: center; gap: 4px 10px; min-height: 22px; }
.t4cv-monto { margin-left: auto; font: 500 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto2}; }
.t4cv-foco { color: ${C.texto}; font-weight: 600; }
.t4cv-tubo { position: relative; }
.t4cv-v { position: absolute; width: 2px; background: ${C.neutro}; }
.t4cv-h { position: absolute; height: 2px; background: ${C.neutro}; }
.t4cv-vivo { background: ${C.texto}; }
.t4cv-cajon { position: relative; padding: 10px 12px; border-left: 1px solid ${C.neutro}; border-right: 1px solid ${C.neutro}; border-radius: 12px; display: grid; gap: 8px; }
.t4cv-cajon[data-luz] { border-left: 2px solid ${C.texto}; border-right: 2px solid ${C.texto}; }
.t4cv-borde { position: absolute; left: -1px; right: -1px; height: 12px; display: flex; justify-content: space-between; pointer-events: none; }
.t4cv-borde > span { border-color: ${C.neutro}; border-style: solid; border-width: 0; }
.t4cv-cajon[data-luz] .t4cv-borde > span { border-color: ${C.texto}; }
.t4cv-nombre { margin: 0; justify-self: center; text-align: center; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
/* Lote B, capa 1 (A1 P0): la glosa de cada cuenta, bajo su nombre (Hanayama §2.1; Katsumi). */
.t4cv-glosa-c { display: grid; margin: 0; font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; }
.t4cv-glosa-c > span { white-space: nowrap; }
.t4cv-nombre + .t4cv-glosa-c { justify-items: center; margin-top: -6px; }
.t4cv-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; }
.t4cv-col { position: relative; display: grid; gap: 4px; align-content: start; min-width: 0; padding: 6px 8px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: inherit; text-align: left; font: inherit; }
.t4cv-col-h { justify-items: end; text-align: right; }
button.t4cv-col { cursor: pointer; border-color: rgba(248,249,250,0.35); min-height: 44px; }
button.t4cv-col:disabled { cursor: default; }
.t4cv-col[data-luz] { border: 2px solid ${C.texto}; padding: 5px 7px; }
.t4cv-col[data-marca="bien"], .t4cv-col[data-marca="era"] { border: 2px solid ${C.texto}; padding: 5px 7px; }
.t4cv-col[data-marca="mal"] { border: 2px solid ${C.error}; padding: 5px 7px; }
.t4cv-lado { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t4cv-glosa { display: grid; font-size: 12px; line-height: 1.35; color: ${C.texto2}; }
.t4cv-glosa > span { white-space: nowrap; }
.t4cv-lineas { display: grid; gap: 2px; align-content: start; }
.t4cv-lineas > span { font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto2}; }
.t4cv-lineas > span.t4cv-foco { color: ${C.texto}; font-weight: 600; }
/* El hueco de la pastilla se mete 6 px en el relleno a cada lado: así cabe «No va aquí» a 320 (P2 de Hanayama, §2.3-1). */
.t4cv-hueco { min-height: 20px; display: flex; margin-inline: -6px; }
.t4cv-col-h .t4cv-hueco { justify-content: flex-end; }
.t4cv-saldo { display: flex; justify-content: center; align-items: baseline; gap: 8px; padding: 4px 8px; border-radius: 8px; border: 1px solid transparent; }
.t4cv-saldo[data-luz] { border: 2px solid ${C.texto}; }
.t4cv-saldo > span:first-child { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4cv-saldo > span:last-child { font: 600 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
/*
 * La bandeja va en el flujo del tubo (no absoluta): si su segunda línea parte en
 * dos a 320 o 375 (el cheque y su pastilla), el tubo crece con ella y no tacha
 * la pastilla con el borde del cajón ni tapa «Caja» (Shibukawa, #308). Sin
 * partir, mide lo de antes: 6 + 44 + 8 = 58 px.
 */
.t4cv-tubo[data-con-bandeja] { padding: 6px 0 8px 36%; }
.t4cv-band { position: relative; min-height: 44px; display: grid; align-content: center; gap: 0; padding: 4px 26px 4px 10px; border-radius: 8px; border: 1px solid rgba(248,249,250,0.35); background: transparent; color: ${C.texto}; text-align: left; font: inherit; }
button.t4cv-band { cursor: pointer; }
button.t4cv-band:disabled { cursor: default; }
.t4cv-band[data-marca="bien"], .t4cv-band[data-marca="era"] { border: 2px solid ${C.texto}; padding: 3px 25px 3px 9px; }
.t4cv-band[data-marca="mal"] { border: 2px solid ${C.error}; padding: 3px 25px 3px 9px; }
.t4cv-band > span:first-child { font: 600 13px/1.3 "Inter", sans-serif; white-space: nowrap; }
.t4cv-band > span + span { font: 500 13px/1.3 "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; font-variant-numeric: tabular-nums; }
.t4cv-band-l2 { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; }
.t4cv-rama { position: relative; height: 24px; }
.t4cv-dest { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; }
.t4cv-caja2 { display: grid; gap: 4px; align-content: start; min-width: 0; border: 1px solid ${C.neutro}; border-radius: 8px; padding: 8px 10px; min-height: 76px; }
.t4cv-caja2[data-luz] { border: 2px solid ${C.texto}; padding: 7px 9px; }
.t4cv-caja2-n { font: 600 13px/1.3 "Sora", "Inter", sans-serif; display: grid; }
.t4cv-caja2-n > span { white-space: nowrap; }
.t4cv-caja2 .t4cv-monto { margin-left: 0; justify-self: end; }
.t4cv-caja2 .t4r-btn2 { width: 100%; padding: 0 6px; }
.t4cv-d { color: ${C.debeTexto}; } .t4cv-hb { color: ${C.haber}; }
.t4cv-oculto { visibility: hidden; }
/*
 * D9 (Hanayama), solo en A1 (la prop \`cajonA1\`; H1 no la pasa): el cajón es
 * un cajón de verdad. Bajo su base, centrada, una manija de 24 × 4 px; con
 * cada cobro, consignación o pago, el cajón «se abre» 4 px y vuelve
 * (translateY, 220 ms de ida y 220 de vuelta). Con movimiento reducido, no se
 * mueve.
 */
.t4cv-manija { position: absolute; left: calc(50% - 12px); bottom: -8px; width: 24px; height: 4px; border-radius: 2px; background: ${C.neutro}; pointer-events: none; }
/*
 * A1 P6 (controles): los siete controles son botones de 44 px como mínimo en
 * la parte del cajón que cuidan (Hanayama); tocar uno enciende esa parte. No
 * se califican: sin pastilla. A1 P5 (el-faltante): lo que no llegó al libro,
 * junto al tubo de entrada, en neutro (no es un error).
 */
.t4cv-rc { display: flex; flex-wrap: wrap; gap: 6px; }
.t4cv-rc[data-parte="cols"] { justify-content: center; }
.t4cv-cab { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 6px; }
.t4cv-cab > .t4cv-rc { justify-self: end; }
.t4cv-saldo > .t4cv-rc[data-parte="saldo"] { margin-left: auto; }
.t4cv-caja2 .t4cv-rc { display: grid; }
.t4cv-ctl { appearance: none; min-height: 44px; min-width: 44px; padding: 0 10px; border-radius: 8px; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto2}; font: 600 12px/1.2 "Inter", sans-serif; white-space: nowrap; cursor: pointer; }
.t4cv-ctl[aria-pressed="true"] { border: 2px solid ${C.texto}; padding: 0 9px; color: ${C.texto}; }
.t4cv-ctl:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4cv-saldo:has(.t4cv-rc) { align-items: center; }
.t4cv-sin { position: absolute; left: calc(25% + 8px); top: 3px; font: 500 12px/14px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; font-variant-numeric: tabular-nums; }
`;

function Borde({ arriba, cerrado = false }) {
  const centro = arriba ? "25%" : "75%";
  const lado = arriba ? "borderTopWidth" : "borderBottomWidth";
  /* Sin salidas (A1 P5), el fondo del cajón no tiene boca. */
  if (cerrado) return <span className="t4cv-borde" aria-hidden="true" style={{ bottom: 0 }}><span style={{ width: "100%", borderBottomWidth: "1px", borderLeftWidth: "1px", borderRightWidth: "1px", borderRadius: "0 0 12px 12px" }} /></span>;
  return (
    <span className="t4cv-borde" aria-hidden="true" style={arriba ? { top: 0 } : { bottom: 0 }}>
      <span style={{ width: `calc(${centro} - ${BOCA / 2}px)`, [lado]: "1px", borderLeftWidth: "1px", borderRadius: arriba ? "12px 0 0 0" : "0 0 0 12px" }} />
      <span style={{ width: `calc(100% - ${centro} - ${BOCA / 2}px)`, [lado]: "1px", borderRightWidth: "1px", borderRadius: arriba ? "0 12px 0 0" : "0 0 12px 0" }} />
    </span>
  );
}

/* Lo que oye el lector de un destino: su nombre y, tras responder, su marca con palabra. */
const etiquetaDestino = (id, marca) => (marca ? `${FIGURA_CAJON.destino[id]}: ${MARCA[marca]}` : FIGURA_CAJON.destino[id]);

function Columna({ lado, glosa, lineas, reserva, destinos, luz, vibra, palabras }) {
  const marca = destinos?.marcas?.[lado] ?? null;
  const Elemento = destinos ? "button" : "div";
  return (
    <Elemento
      type={destinos ? "button" : undefined}
      className={`t4cv-col${lado === HABER ? " t4cv-col-h" : ""}${vibra === lado ? " t4r-vibra" : ""}`}
      data-columna={lado}
      data-destino={destinos ? lado : undefined}
      data-marca={marca ?? undefined}
      data-luz={luz ? "" : undefined}
      disabled={destinos ? !destinos.activos : undefined}
      aria-label={destinos ? etiquetaDestino(lado, marca) : undefined}
      onClick={destinos ? () => destinos.onElegir(lado) : undefined}
    >
      <span className={`t4cv-lado ${lado === DEBE ? "t4cv-d" : "t4cv-hb"}`}>{lado === DEBE ? "Debe" : "Haber"}</span>
      {glosa && <span className="t4cv-glosa">{glosa.map((t) => <span key={t}>{t}</span>)}</span>}
      <span className="t4cv-lineas" style={{ minHeight: `${reserva * 22}px` }}>
        {lineas.map((l) => <span key={l.id} className={`t4r-nueva${l.foco ? " t4cv-foco" : ""}`} data-linea={l.id}>{l.v}</span>)}
      </span>
      {(palabras || destinos) && <span className="t4cv-hueco" data-hueco={lado}><Marca marca={marca} /></span>}
    </Elemento>
  );
}

/*
 * origen   { rotulo?, texto?, monto?, montoFoco?, clave?, tarjeta?, accion? }  la tarjeta de arriba
 * debe, haber  [{ id, v, foco? }]   las líneas de cada columna; `reserva` las que se reservan
 * saldo    número, "—" o null       «En la caja»
 * vivo     ["entrada", "salida", "bancos", "pago"]  los trazos encendidos
 * luz      ["cols", "bancos", "pago", "saldo", "cajon", "origen"]
 * bancos, pago  { monto?, accion? }
 * bandeja  { ultimo? } o null       con bandeja, la fila del tubo lleva «Caja no se mueve»
 * destinos { activos, onElegir(id), marcas: { debe|haber|no-se-mueve: bien|mal|era } } o null
 * controles { lista: [{ rotulo, luz: [parte] }], activo, onTocar(i) } o null
 *                                    A1 P6: cada control, un botón en la parte que cuida
 * sinAnotar texto o null             A1 P5: lo cobrado que no llegó al libro, junto al tubo de entrada
 * salidas  false                     A1 P5: sin Bancos ni «Pago en efectivo» (el caso no los usa)
 */
export function Cajon({
  origen = null, glosas = {}, debe = [], haber = [], reserva = 1, saldo = null, vivo = [],
  bancos = {}, pago = {}, destinos = null, bandeja = null, luz = [], vibra = null, alt = FIGURA_CAJON.alt, children = null, palabras = false,
  glosasCuenta = false, controles = null, sinAnotar = null, salidas = true, cajonA1 = null,
}) {
  /* D9, solo A1: `cajonA1 = { abre }`; cada vez que `abre` sube, el cajón se abre 4 px y vuelve. */
  const refCajon = useRef(null);
  const abre = cajonA1?.abre ?? 0;
  useEffect(() => {
    const el = refCajon.current;
    if (!abre || !el?.animate) return;
    if (el.ownerDocument?.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    el.animate([{ transform: "translateY(0)" }, { transform: "translateY(4px)" }, { transform: "translateY(0)" }], { duration: 440, easing: "cubic-bezier(.3,.9,.4,1)" });
  }, [abre]);
  const idAlt = useId();
  const visto = useNumeroQueSube(typeof saldo === "number" ? saldo : 0);
  const v = (k) => (vivo.includes(k) ? " t4cv-vivo" : "");
  const L = (k) => (luz.includes(k) ? "" : undefined);
  const marcaBand = destinos?.marcas?.[NO_SE_MUEVE] ?? null;
  const Band = destinos ? "button" : "div";
  /* Los rótulos de los controles que van en una parte (A1 P5). */
  const rc = (parte) => {
    const r = (controles?.lista ?? []).map((c, i) => ({ ...c, i })).filter((c) => c.luz[0] === parte);
    return r.length ? (
      <span className="t4cv-rc" data-parte={parte}>
        {r.map((c) => (
          <button key={c.rotulo} type="button" className="t4cv-ctl" data-control={c.i + 1} aria-pressed={controles.activo === c.i} onClick={() => controles.onTocar(c.i)}>{c.rotulo}</button>
        ))}
      </span>
    ) : null;
  };
  /* El fajo de H1 (D9): `origen.fajo` cantos detrás de la tarjeta, como mucho 7. */
  const fajo = origen?.fajo != null ? Math.min(origen.fajo, 7) : null;
  const tarjetaOrigen = origen && (
    <div className={`t4cv-origen t4r-nueva${vibra === "origen" ? " t4r-vibra" : ""}`} data-origen data-tarjeta={origen.tarjeta ? "" : undefined} key={origen.clave}>
      {origen.rotulo && <span className="t4cv-rot">{origen.rotulo}</span>}
      {origen.texto && <span className="t4cv-hecho" data-hecho tabIndex={origen.refHecho ? -1 : undefined} ref={origen.refHecho ?? undefined} style={{ outline: "none" }}>{origen.texto}</span>}
      <span className="t4cv-lin">
        {origen.accion && (
          <button type="button" className={`t4r-btn2${origen.accion.hecha ? " t4cv-oculto" : ""}`} data-accion={origen.accion.id} onClick={origen.accion.onClick}>{origen.accion.texto}</button>
        )}
        {origen.monto != null && <span className={`t4cv-monto${origen.montoFoco ? " t4cv-foco" : ""}`} data-monto="origen">{origen.monto}</span>}
      </span>
    </div>
  );
  const ultimo = bandeja?.ultimo ? <span className="t4r-nueva" key={bandeja.ultimo} data-linea="bandeja">{bandeja.ultimo}</span> : null;
  return (
    <figure className="t4cv" data-figura="cajon" aria-describedby={idAlt}>
      {origen && (fajo != null ? (
        <div className="t4cv-fajo" data-fajo={fajo}>
          {Array.from({ length: fajo }, (_, k) => (
            <span key={k} className="t4cv-canto" aria-hidden="true" data-canto={k + 1} style={{ top: `${12 - 2 * k}px`, left: `${3 * (k + 1)}px`, right: `${3 * (k + 1)}px` }} />
          ))}
          {tarjetaOrigen}
        </div>
      ) : tarjetaOrigen)}
      <div className="t4cv-tubo" data-con-bandeja={bandeja ? "" : undefined} style={bandeja ? undefined : { height: sinAnotar ? "20px" : "16px" }} aria-hidden={bandeja || sinAnotar ? undefined : "true"}>
        <span className={`t4cv-v${v("entrada")}`} data-trazo="entrada" aria-hidden="true" style={{ left: "calc(25% - 1px)", top: 0, bottom: 0 }} />
        {sinAnotar && <span className="t4cv-sin" data-sin-anotar>{sinAnotar}</span>}
        {bandeja && (
          <Band
            type={destinos ? "button" : undefined}
            className={`t4cv-band${vibra === NO_SE_MUEVE ? " t4r-vibra" : ""}`}
            data-destino={destinos ? NO_SE_MUEVE : undefined}
            data-bandeja
            data-marca={marcaBand ?? undefined}
            disabled={destinos ? !destinos.activos : undefined}
            aria-label={destinos ? etiquetaDestino(NO_SE_MUEVE, marcaBand) : undefined}
            onClick={destinos ? () => destinos.onElegir(NO_SE_MUEVE) : undefined}
          >
            <span>{FIGURA_CAJON.bandeja}</span>
            {(palabras || destinos) && marcaBand
              ? <span className="t4cv-band-l2">{marcaBand !== "mal" ? ultimo : null}<Marca marca={marcaBand} /></span>
              : ultimo}
          </Band>
        )}
      </div>
      <div className="t4cv-cajon" data-cajon data-luz={L("cajon")} ref={refCajon} data-abre={cajonA1 ? abre : undefined}>
        {cajonA1 && <span className="t4cv-manija" aria-hidden="true" data-manija />}
        <Borde arriba />
        <Borde cerrado={!salidas} />
        {rc("cajon")
          ? <div className="t4cv-cab"><span /><p className="t4cv-nombre">{FIGURA_CAJON.cuenta}</p>{rc("cajon")}</div>
          : <p className="t4cv-nombre">{FIGURA_CAJON.cuenta}</p>}
        {glosasCuenta && <p className="t4cv-glosa-c" data-glosa-cuenta="caja">{FIGURA_CAJON.glosaCaja.map((t) => <span key={t}>{t}</span>)}</p>}
        <div className="t4cv-cols">
          <Columna lado={DEBE} glosa={glosas.debe ? FIGURA_CAJON.glosaDebe : null} lineas={debe} reserva={reserva} destinos={destinos} luz={luz.includes("cols")} vibra={vibra} palabras={palabras} />
          <Columna lado={HABER} glosa={glosas.haber ? FIGURA_CAJON.glosaHaber : null} lineas={haber} reserva={reserva} destinos={destinos} luz={luz.includes("cols")} vibra={vibra} palabras={palabras} />
        </div>
        {rc("cols")}
        {saldo !== null && (
          <div className="t4cv-saldo" data-saldo={saldo} data-luz={L("saldo")}>
            <span>{FIGURA_CAJON.enLaCaja}</span>
            <span data-saldo-visto>{saldo === "—" ? "—" : cifra(visto)}</span>
            {rc("saldo")}
          </div>
        )}
      </div>
      {salidas && (
        <>
        <div className="t4cv-rama" aria-hidden="true">
          <span className={`t4cv-v${v("salida")}`} data-trazo="salida" style={{ left: "calc(75% - 1px)", top: 0, height: "13px" }} />
          <span className={`t4cv-h${v("bancos")}`} data-trazo="cruce" style={{ left: "calc(25% - 1px)", width: "calc(50% + 2px)", top: "11px" }} />
          <span className={`t4cv-v${v("bancos")}`} data-trazo="a-bancos" style={{ left: "calc(25% - 1px)", top: "11px", bottom: 0 }} />
          <span className={`t4cv-v${v("pago")}`} data-trazo="a-pago" style={{ left: "calc(75% - 1px)", top: "11px", bottom: 0 }} />
        </div>
        <div className="t4cv-dest">
          <div className="t4cv-caja2" data-caja2="bancos" data-luz={L("bancos")}>
            <span className="t4cv-caja2-n"><span>{FIGURA_CAJON.bancos}</span></span>
            {glosasCuenta && <p className="t4cv-glosa-c" data-glosa-cuenta="bancos">{FIGURA_CAJON.glosaBancos.map((t) => <span key={t}>{t}</span>)}</p>}
            {rc("bancos")}
            {bancos.accion && <button type="button" className={`t4r-btn2${bancos.accion.hecha ? " t4cv-oculto" : ""}`} data-accion={bancos.accion.id} onClick={bancos.accion.onClick}>{bancos.accion.texto}</button>}
            {bancos.monto && <span className="t4cv-monto t4cv-foco t4r-nueva" data-monto="bancos">{bancos.monto}</span>}
          </div>
          <div className="t4cv-caja2" data-caja2="pago" data-luz={L("pago")}>
            <span className="t4cv-caja2-n">{FIGURA_CAJON.pago.map((t) => <span key={t}>{t}</span>)}</span>
            {rc("pago")}
            {pago.accion && <button type="button" className={`t4r-btn2${pago.accion.hecha ? " t4cv-oculto" : ""}`} data-accion={pago.accion.id} onClick={pago.accion.onClick}>{pago.accion.texto}</button>}
            {pago.monto && <span className="t4cv-monto t4cv-foco t4r-nueva" data-monto="pago">{pago.monto}</span>}
          </div>
        </div>
        </>
      )}
      {children}
      <figcaption id={idAlt} className="t4f-sr">{alt}</figcaption>
    </figure>
  );
}
