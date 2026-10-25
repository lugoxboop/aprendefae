/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · P2 «El mes de San Calixto» en SecuenciaAprender · 8 pantallas, 6 Haz.
 *
 * Pieza nueva (id t3-a2-el-mes-de-san-calixto), en el lugar libre de la pieza
 * 2. Forma: paquete #578, e3-t3-p2-p6-secuencia-v1.md §1-§2 (Itagaki v2).
 * Textos: t3SecuenciasTextosP2P6.js.
 *
 * ═══════════ LA LÍNEA DE LECTURA SALE DE LOS HECHOS (#572) ═══════════
 *
 * Ninguna cifra de la lectura ni de las barras está escrita a mano: salen del
 * enero publicado de San Calixto (contabilidadTema3.js, el aporte de la p. 121;
 * contabilidadTema3Cierre.js, las cuentas de enero) y de las cuatro fichas de
 * P2-2. Caja = aporte en plata + lo cobrado − los gastos pagados; Utilidad =
 * lo vendido − lo consumido. Una prueba comprueba que dan 14.650 y 6.450, los
 * mismos saldos que «Cerrar el periodo» ya publica.
 *
 * Cada hecho se cuenta UNA vez, en la pantalla que lo pone en juego: los
 * cobros en P2-2 (la caja sube con cada toque) y los gastos en P2-5. P2-3 y
 * P2-4 anotan hechos que la lectura ya tiene, así que no la mueven: en P2-4,
 * «la caja sube $3.000» se ve en el asiento (Caja al debe por $3.000).
 *
 * Modelo: objeto (72) + 4 + lectura (16) = 92 de 98, igual en las 8.
 * La utilidad de la lectura va tapada desde P2-2 hasta que se responde P2-6
 * (E8; Takamura, lote 19: en P2-2 a P2-4 mostraba $14.800, que son los
 * ingresos, no la utilidad). En P2-1 queda en $0.
 *
 * P2-7 va con el delta v3 §2 (PASA de Takamura, lote 17): las 4 opciones en
 * la rejilla de 2 × 2 ocupan el modelo (96) y la línea de lectura pasa a la
 * fila de control, siempre a la vista, con el puente debajo (16 + 4 + 24 = 44).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { SAN_CALIXTO, PIEZA_VENDER_NO_ES_COBRAR } from "../../../../../data/contabilidadTema3.js";
import { CUENTAS_DEL_PERIODO, CUENTAS_QUE_SIGUEN, GASTO } from "../../../../../data/contabilidadTema3Cierre.js";
import {
  PIEZA_P2, TITULARES_P2, TEXTOS_P2, ACIERTOS_P2, FICHAS_P2_2, ERROR_P2_2_FACTURA, CUENTAS_P2_3, CUENTAS_P2_4,
  OPC_P2_5, CORRECTA_P2_5, ERRORES_P2_5, ERROR_P2_6, OPC_P2_7, ERROR_P2_7_SOLO_UNA, CIERRE_P2, PISTAS_P2, RAZON_P2P6,
} from "../../../../../data/t3SecuenciasTextosP2P6.js";
import { hazResuelto, mostrarCorrecto, responderHaz } from "../../../../secuencia/secuencia.js";
import {
  Botones, ControlFlechas, HAZ_T3, elegir, zonaHaz, pesos, C, ALTO_FIGURA_T3,
  ASIENTO_INICIAL, ponerCuenta, asientoResuelto, cuentaEnCasilla, zonaAsiento, enOrden, medirAsiento,
} from "./base.jsx";
import { medirEleccion } from "./p1.jsx";
import { FiguraP, Lectura, O4Mini, Tapado, CampoCifra, CAMPO_INICIAL, escribir, verHaz, verToque, SUPERFICIE, BORDE_SUP, CIFRA } from "./comunP2P6.jsx";

/* ═══════════ LOS HECHOS DE ENERO ═══════════ */
const suma = (l) => l.reduce((s, x) => s + x, 0);
const cuentaQueSigue = (n) => CUENTAS_QUE_SIGUEN.find((c) => c.cuenta === n);
const APORTE = SAN_CALIXTO.hechos.find((h) => h.id === "aporte");
export const CAJA_INICIAL = suma(APORTE.marcas.filter((m) => m.tipo === "entrada").map((m) => m.monto));
export const EQUIPO = cuentaQueSigue("Equipo de computación");
export const APORTES = cuentaQueSigue("Aportes sociales");
/* Los cuatro gastos pagados de enero: los de la cuenta del periodo menos el de la máquina, que no se pagó (P3, p. 140). */
export const GASTOS_PAGADOS = CUENTAS_DEL_PERIODO.filter((c) => c.tipo === GASTO && c.cuenta !== "Gasto alquiler");
export const INGRESOS = suma(FICHAS_P2_2.map((f) => f.monto));
export const COBRADOS = FICHAS_P2_2.filter((f) => f.cobrado);
export const COBRADO = suma(COBRADOS.map((f) => f.monto));
export const GASTOS = suma(GASTOS_PAGADOS.map((c) => c.saldo));
export const CAJA_FIN = CAJA_INICIAL + COBRADO - GASTOS;
export const UTILIDAD_ENERO = INGRESOS - GASTOS;
export const POR_COBRAR = INGRESOS - COBRADO;

const UTILIDAD = PIEZA_VENDER_NO_ES_COBRAR.nombres.find((n) => n.termino === "Utilidad").termino;
const CAJA = "Caja";

/** La lectura de cada pantalla, desde los hechos que ya ocurrieron. */
export function lecturaP2(etapa, { cobradoHasta = COBRADO, gastosPagados = true, utilidadTapada } = {}) {
  const tras = { apertura: 0, cobrados: 1, anotados: 2, gastos: 3, final: 4 }[etapa];
  const caja = CAJA_INICIAL + (tras >= 1 ? cobradoHasta : 0) - (tras >= 3 && gastosPagados ? GASTOS : 0);
  const utilidad = (tras >= 1 ? INGRESOS : 0) - (tras >= 3 && gastosPagados ? GASTOS : 0);
  /* Tapada de P2-2 a P2-5 siempre; P2-6 la destapa al responder (lo pasa explícito). */
  const tapada = utilidadTapada ?? (tras >= 1 && tras <= 3);
  return [[CAJA, caja], [UTILIDAD, utilidad, tapada]];
}

const nombreFigura = "San Calixto en enero: el objeto de la pantalla y la línea de caja y utilidad";

/* El modelo de P2: objeto (72) + 4 + lectura (16). */
function ModeloP2({ objeto, lectura }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: "72px 16px", rowGap: "4px" }}>
      <div style={{ minWidth: 0, position: "relative" }}>{objeto}</div>
      <Lectura pares={lectura} />
    </div>
  );
}

/* ═══════════ O1 DE P2: casillas Debe y Haber con el monto en su cabecera ═══════════ */
function O1P({ debe = null, haber = null, monto = null, activa = null, onActivar = null }) {
  const casilla = (lado, valor) => {
    const cuerpo = { height: "52px", width: "100%", boxSizing: "border-box", borderRadius: "8px", font: "600 12px/16px Inter, sans-serif", color: C.texto, display: "grid", placeItems: "center", textAlign: "center", padding: "0 4px" };
    return (
      <div style={{ flex: "1 1 0", minWidth: 0, display: "grid", gridTemplateRows: "16px 52px", rowGap: "4px" }}>
        <div className="t3s-rotulo" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{lado === "debe" ? "Debe" : "Haber"}</span>
          {monto !== null && <b style={{ font: `600 12px/16px ${CIFRA}`, color: C.texto }} data-monto-dado>{pesos(monto)}</b>}
        </div>
        {onActivar ? (
          <button
            type="button"
            className="t3s-ctl"
            data-casilla={lado}
            data-activa={activa === lado ? "" : undefined}
            aria-pressed={activa === lado ? "true" : "false"}
            onClick={() => onActivar(lado)}
            style={{ ...cuerpo, flex: "none", fontWeight: 600 }}
          >
            {valor ?? ""}
          </button>
        ) : (
          <div data-casilla={lado} style={{ ...cuerpo, background: SUPERFICIE, border: BORDE_SUP }}>{valor ?? ""}</div>
        )}
      </div>
    );
  };
  return (
    <div data-o1 style={{ display: "flex", gap: "8px" }}>
      {casilla("debe", debe)}
      {casilla("haber", haber)}
    </div>
  );
}

/* ═══════════ P2-1 · APERTURA: las 3 placas se arman una vez ═══════════ */
const PLACAS = [
  { id: "caja", nombre: CAJA, monto: CAJA_INICIAL },
  { id: "equipo", nombre: EQUIPO.cuenta, monto: EQUIPO.saldo },
  { id: "aportes", nombre: APORTES.cuenta, monto: APORTES.saldo },
];
function FiguraApertura({ primeraVez, reducido }) {
  return (
    <FiguraP
      data-pantalla-t3="p2-apertura"
      modelo={(
        <ModeloP2
          lectura={lecturaP2("apertura")}
          objeto={(
            <div style={{ display: "flex", gap: "8px", height: "100%", alignItems: "start" }}>
              {PLACAS.map((p, k) => (
                <div
                  key={p.id}
                  data-placa={p.id}
                  className={primeraVez && !reducido ? "t3s-nueva" : undefined}
                  style={{
                    flex: "1 1 0", minWidth: 0, height: "56px", boxSizing: "border-box", padding: "4px 6px", borderRadius: "8px",
                    background: SUPERFICIE, border: BORDE_SUP, display: "grid", alignContent: "space-between",
                    animationDelay: primeraVez ? `${k * 80}ms` : undefined,
                  }}
                >
                  <span style={{ font: "600 12px/16px Inter, sans-serif", color: C.apagado }}>{p.nombre}</span>
                  <b style={{ font: `600 12px/16px ${CIFRA}`, color: C.texto }}>{pesos(p.monto)}</b>
                </div>
              ))}
            </div>
          )}
        />
      )}
      zona={[{ texto: TEXTOS_P2.apertura }]}
    />
  );
}

/* ═══════════ P2-2 · ¿CUÁLES SE COBRARON? Cada toque se califica ═══════════ */
export const COBRADOS_INICIAL = { ...HAZ_T3, marcadas: [] };

export function tocarFicha(estado, id) {
  const e = estado ?? COBRADOS_INICIAL;
  if (hazResuelto(e) || e.marcadas.includes(id)) return e;
  const f = FICHAS_P2_2.find((x) => x.id === id);
  if (!f) return e;
  if (f.cobrado) {
    const marcadas = [...e.marcadas, id];
    const todas = COBRADOS.every((c) => marcadas.includes(c.id));
    return { ...e, marcadas, ultimo: "acierto", ok: todas, eleccion: id };
  }
  const r = responderHaz({ ...e, ok: false }, false);
  /* Con dos errores, el estado correcto: los dos cobrados, marcados. */
  return { ...e, ...r, eleccion: id, marcadas: mostrarCorrecto(r) ? COBRADOS.map((c) => c.id) : e.marcadas };
}

const zonaCobrados = (estado) => {
  const e = estado ?? COBRADOS_INICIAL;
  if (e.ok) return [{ texto: ACIERTOS_P2.cobrados }];
  if (mostrarCorrecto(e)) return [{ texto: ERROR_P2_2_FACTURA, fuerte: true, tipo: "porque" }];
  if (e.ultimo === "error" && e.intentos === 1) return [{ texto: PISTAS_P2.cobrados, fuerte: true, tipo: "pista" }];
  return [{ texto: TEXTOS_P2.cobrados }];
};

function FiguraCobrados({ estado, setEstado }) {
  const e = estado ?? COBRADOS_INICIAL;
  const listo = hazResuelto(e);
  const cobradoHasta = suma(FICHAS_P2_2.filter((f) => e.marcadas.includes(f.id)).map((f) => f.monto));
  return (
    <FiguraP
      data-pantalla-t3="p2-cobrados"
      ver={verToque(e)}
      modelo={(
        <ModeloP2
          lectura={lecturaP2("cobrados", { cobradoHasta })}
          objeto={<O4Mini max={INGRESOS} filas={[{ nombre: "Ingresos", monto: INGRESOS }, { nombre: "Cobrado", monto: cobradoHasta }]} />}
        />
      )}
      control={(
        <div role="group" aria-label="Los cuatro servicios de enero" style={{ display: "flex", gap: "8px", flex: "1 1 0", minWidth: 0 }}>
          {FICHAS_P2_2.map((f) => {
            const marcada = e.marcadas.includes(f.id);
            const mal = e.eleccion === f.id && e.ultimo === "error" && !marcada;
            return (
              <button
                key={f.id}
                type="button"
                className="t3s-ctl"
                data-ficha={f.id}
                data-ver={marcada ? "bien" : mal ? "mal" : undefined}
                aria-label={`${f.nombre}, ${pesos(f.monto)}`}
                aria-pressed={marcada ? "true" : "false"}
                onClick={listo || marcada ? undefined : () => setEstado((s) => tocarFicha(s, f.id))}
                style={{ display: "grid", alignContent: "center", padding: "0 2px", lineHeight: "16px" }}
              >
                <span aria-hidden="true" style={{ font: "600 12px/16px Inter, sans-serif" }}>{f.rotulo}</span>
                <span aria-hidden="true" style={{ font: `400 12px/16px ${CIFRA}` }}>{pesos(f.monto)}</span>
              </button>
            );
          })}
        </div>
      )}
      zona={zonaCobrados(e)}
    />
  );
}

/* ═══════════ P2-3 · MÍRALO: el asiento de una factura ═══════════ */
const FACTURAS = FICHAS_P2_2.filter((f) => !f.cobrado);
function FiguraHaber({ estado, setEstado }) {
  const vista = FACTURAS.find((f) => f.id === estado?.vista) ?? null;
  return (
    <FiguraP
      data-pantalla-t3="p2-haber"
      modelo={(
        <ModeloP2
          lectura={lecturaP2("anotados")}
          objeto={<O1P debe={vista ? CUENTAS_P2_3.debe : null} haber={vista ? CUENTAS_P2_3.haber : null} monto={vista ? vista.monto : null} />}
        />
      )}
      control={(
        <div role="group" aria-label="Las facturas por cobrar" style={{ display: "flex", gap: "8px", flex: "1 1 0", minWidth: 0 }}>
          {FACTURAS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="t3s-ctl"
              data-factura={f.id}
              data-activa={vista?.id === f.id ? "" : undefined}
              aria-pressed={vista?.id === f.id ? "true" : "false"}
              onClick={() => setEstado(() => ({ vista: f.id }))}
            >
              {f.rotulo} <span style={{ font: `400 12px/16px ${CIFRA}` }}>{pesos(f.monto)}</span>
            </button>
          ))}
        </div>
      )}
      zona={[{ texto: TEXTOS_P2.haber }]}
    />
  );
}

/* ═══════════ P2-4 · EL ASIENTO DE LCDV con ‹ cuenta › (el monto, a la vista antes de responder) ═══════════ */
const LCDV = FICHAS_P2_2.find((f) => f.id === "lcdv");
const resueltaAsiento = asientoResuelto(CUENTAS_P2_4);
const zonaAsientoP2 = (estado) => zonaAsiento(estado, CUENTAS_P2_4, { antes: [{ texto: TEXTOS_P2.asiento }], despues: [{ texto: ACIERTOS_P2.asiento }], pista: PISTAS_P2.asiento });

function verAsiento(e) {
  const u = e?.ultimo;
  if (!u) return null;
  return u.ok ? "bien" : "mal";
}

function FiguraAsiento({ estado, setEstado }) {
  const e = estado ?? ASIENTO_INICIAL;
  const lista = enOrden(CUENTAS_P2_4);
  return (
    <FiguraP
      data-pantalla-t3="p2-asiento"
      ver={verAsiento(e)}
      modelo={(
        <ModeloP2
          lectura={lecturaP2("anotados")}
          objeto={(
            <O1P
              monto={LCDV.monto}
              debe={cuentaEnCasilla(e, CUENTAS_P2_4, "debe")}
              haber={cuentaEnCasilla(e, CUENTAS_P2_4, "haber")}
              activa={e.activa}
              onActivar={resueltaAsiento(e) ? null : (lado) => setEstado((x) => ({ ...(x ?? ASIENTO_INICIAL), activa: lado }))}
            />
          )}
        />
      )}
      control={(
        <ControlFlechas
          nombre="Elige la cuenta"
          valores={lista.map((c) => c.cuenta)}
          indice={e.indice}
          apagado={!e.activa || resueltaAsiento(e)}
          rotulo={(v) => v}
          onMover={(i) => setEstado((x) => ({ ...(x ?? ASIENTO_INICIAL), indice: i }))}
          onConfirmar={(cuenta) => setEstado((x) => ponerCuenta(x, CUENTAS_P2_4, cuenta))}
        />
      )}
      zona={zonaAsientoP2(e)}
    />
  );
}

/* ═══════════ P2-5 · ¿QUÉ SE MUEVE? ═══════════ */
const zonaGastos = (estado) => zonaHaz(estado, { antes: [{ texto: TEXTOS_P2.gastos }], despues: [{ texto: ACIERTOS_P2.gastos }], pista: PISTAS_P2.gastos, porque: (el) => ERRORES_P2_5[el] ?? null });
function FiguraGastos({ estado, setEstado }) {
  const e = estado ?? HAZ_T3;
  const listo = hazResuelto(e);
  return (
    <FiguraP
      data-pantalla-t3="p2-gastos"
      ver={verHaz(e)}
      modelo={(
        <ModeloP2
          lectura={lecturaP2("gastos", { gastosPagados: listo, utilidadTapada: true })}
          objeto={<O4Mini max={INGRESOS} filas={[{ nombre: "Gastos", monto: GASTOS, vacia: !listo }, { nombre: "Salió", monto: GASTOS, vacia: !listo }]} />}
        />
      )}
      control={<Botones nombre="¿Qué se mueve?" opciones={OPC_P2_5} estado={e} correcta={CORRECTA_P2_5} onElegir={(x) => setEstado((s) => elegir(s, x, CORRECTA_P2_5))} />}
      zona={zonaGastos(e)}
    />
  );
}

/* ═══════════ P2-6 · ESCRIBE LA UTILIDAD (campo de r5) ═══════════ */
const zonaUtilidad = (estado) => zonaHaz(estado, { antes: [{ texto: TEXTOS_P2.utilidad }], despues: [{ texto: ACIERTOS_P2.utilidad }], pista: PISTAS_P2.utilidad, porque: () => ERROR_P2_6 });
function FiguraUtilidad({ estado, setEstado }) {
  const e = estado ?? CAMPO_INICIAL;
  const listo = hazResuelto(e);
  return (
    <FiguraP
      data-pantalla-t3="p2-utilidad"
      ver={verHaz(e)}
      modelo={(
        <ModeloP2
          lectura={lecturaP2("gastos", { utilidadTapada: !listo })}
          objeto={(
            <O4Mini
              max={INGRESOS}
              filas={[{ nombre: "Ingresos", monto: INGRESOS }, { nombre: "Gastos", monto: GASTOS }]}
              resultado={<span data-corchete>{UTILIDAD} {listo ? <b style={{ fontFamily: CIFRA }}>{pesos(UTILIDAD_ENERO)}</b> : <Tapado ancho={52} />}</span>}
            />
          )}
        />
      )}
      control={<CampoCifra estado={e} setEstado={setEstado} correcta={UTILIDAD_ENERO} nombre="Escribe la utilidad" ver={verHaz(e)} />}
      zona={zonaUtilidad(e)}
    />
  );
}

/* ═══════════ P2-7 · LO QUE SEPARA CAJA Y UTILIDAD (delta v3 §2). Cada toque se califica ═══════════ */
/*
 * El puente sale de los hechos: utilidad + lo que entró sin ser ingreso (el
 * aporte en plata) − lo que es ingreso pero no entró (lo que falta cobrar) =
 * la caja. 6.450 + 15.000 − 6.800 = 14.650; una prueba lo comprueba.
 */
const CLAVES_P2_7 = OPC_P2_7.filter((o) => o.correcta);
export const PUENTE_P2_7 = { utilidad: UTILIDAD_ENERO, suma: CAJA_INICIAL, resta: POR_COBRAR, caja: CAJA_FIN };
export const SEPARAN_INICIAL = { ...HAZ_T3, marcadas: [] };

export function tocarSeparan(estado, id) {
  const e = estado ?? SEPARAN_INICIAL;
  const o = OPC_P2_7.find((x) => x.id === id);
  if (hazResuelto(e) || !o || e.marcadas.includes(id)) return e;
  if (o.correcta) {
    const marcadas = [...e.marcadas, id];
    return { ...e, marcadas, ultimo: "acierto", ok: CLAVES_P2_7.every((c) => marcadas.includes(c.id)), eleccion: id };
  }
  const r = responderHaz({ ...e, ok: false }, false);
  /* Con dos errores, el estado correcto: las dos claves, marcadas. */
  return { ...e, ...r, eleccion: id, marcadas: mostrarCorrecto(r) ? CLAVES_P2_7.map((c) => c.id) : e.marcadas };
}

/*
 * La zona. Sin línea de datos: la lectura sigue a la vista en la fila de
 * control (delta v3 §2). Con una clave marcada y la otra por tocar, el error
 * «Eligió solo una de las dos claves» de Miyata (v2), como en P2-2 el de
 * «Dejó sin marcar uno cobrado» (que allí es la razón).
 */
export const zonaSeparan = (estado) => {
  const e = estado ?? SEPARAN_INICIAL;
  if (e.ok) return [{ texto: ACIERTOS_P2.separan }];
  if (mostrarCorrecto(e)) {
    const p = OPC_P2_7.find((o) => o.id === e.eleccion)?.error;
    return [{ texto: p ?? ACIERTOS_P2.separan, fuerte: true, tipo: "porque" }];
  }
  if (e.ultimo === "error" && e.intentos === 1) return [{ texto: PISTAS_P2.separan, fuerte: true, tipo: "pista" }];
  if (e.ultimo === "acierto" && e.marcadas.length === 1) return [{ texto: ERROR_P2_7_SOLO_UNA }];
  return [{ texto: TEXTOS_P2.separan }];
};

const sinSigno = (n) => pesos(n).slice(1);

/* La fila de control de P2-7: lectura (16) + 4 + puente (16 + 2 + barra de 6) = 44. */
function FilaLecturaPuente({ visible }) {
  const { utilidad, suma: mas, resta, caja } = PUENTE_P2_7;
  const tope = utilidad + mas;
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, display: "grid", gridTemplateRows: "16px 24px", rowGap: "4px" }} data-fila-lectura>
      <Lectura pares={lecturaP2("final")} />
      <div data-puente={visible ? "" : "vacio"} style={{ display: "grid", gridTemplateRows: "16px 6px", rowGap: "2px", visibility: visible ? "visible" : "hidden" }} aria-hidden={visible ? undefined : "true"}>
        <div className="t3s-cifras" style={{ color: C.texto, fontFamily: CIFRA }}>
          {sinSigno(utilidad)} +{sinSigno(mas)} −{sinSigno(resta)} = <b>{sinSigno(caja)}</b>
        </div>
        <div aria-hidden="true" style={{ position: "relative", height: "6px", borderRadius: "2px", background: "rgba(248,249,250,.08)", overflow: "hidden" }}>
          <span data-puente-utilidad style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(utilidad / tope) * 100}%`, background: C.neutro }} />
          <span data-puente-aporte style={{ position: "absolute", left: `${(utilidad / tope) * 100}%`, top: 0, bottom: 0, width: `${((caja - utilidad) / tope) * 100}%`, background: C.texto }} />
        </div>
      </div>
    </div>
  );
}

function FiguraSeparan({ estado, setEstado }) {
  const e = estado ?? SEPARAN_INICIAL;
  const listo = hazResuelto(e);
  return (
    <FiguraP
      data-pantalla-t3="p2-separan"
      ver={verToque(e)}
      modelo={(
        <div role="group" aria-label="Lo que separa la caja y la utilidad" data-rejilla-p2-7 style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "44px 44px", gap: "8px" }}>
          {OPC_P2_7.map((o) => {
            const marcada = e.marcadas.includes(o.id);
            const mal = e.eleccion === o.id && e.ultimo === "error" && !marcada;
            return (
              <button
                key={o.id}
                type="button"
                className="t3s-ctl"
                data-opcion={o.id}
                data-ver={marcada ? "bien" : mal ? "mal" : undefined}
                aria-pressed={marcada ? "true" : "false"}
                aria-disabled={listo || marcada ? "true" : undefined}
                onClick={listo || marcada ? undefined : () => setEstado((s) => tocarSeparan(s, o.id))}
              >
                {o.texto}
              </button>
            );
          })}
        </div>
      )}
      control={<FilaLecturaPuente visible={listo} />}
      zona={zonaSeparan(e)}
    />
  );
}

function medirSeparan() {
  const jugar = (ids) => ids.reduce((e, id) => tocarSeparan(e, id), SEPARAN_INICIAL);
  return [
    { nombre: "sin-responder", estado: SEPARAN_INICIAL },
    { nombre: "una-clave", estado: jugar(["aporte"]) },
    { nombre: "pista", estado: jugar(["gastos-pagados"]) },
    { nombre: "pista-equipo", estado: jugar(["equipo"]) },
    { nombre: "acierto", estado: jugar(["aporte", "falta-cobrar"]) },
    { nombre: "dos-errores-gastos-pagados", estado: jugar(["equipo", "gastos-pagados"]) },
    { nombre: "dos-errores-equipo", estado: jugar(["gastos-pagados", "equipo"]) },
  ];
}

/* ═══════════ P2-8 · CIERRE sin acción, 2 pasos por frase ═══════════ */
const zonaCierre = (paso) => (paso >= 1 ? [{ texto: CIERRE_P2[1], fuerte: true }, { pie: PIEZA_P2.pie }] : [{ texto: CIERRE_P2[0], fuerte: true }]);
function FiguraCierre({ paso }) {
  return (
    <FiguraP
      data-pantalla-t3="p2-cierre"
      modelo={(
        <ModeloP2
          lectura={lecturaP2("final")}
          objeto={(
            <O4Mini
              max={INGRESOS}
              filas={[{ nombre: "Ingresos", monto: INGRESOS }, { nombre: "Gastos", monto: GASTOS }]}
              resultado={<span data-corchete>{UTILIDAD} <b style={{ fontFamily: CIFRA }}>{pesos(UTILIDAD_ENERO)}</b></span>}
            />
          )}
        />
      )}
      zona={zonaCierre(paso)}
    />
  );
}

/* Los estados que la sonda mide de P2-2. */
function medirCobrados() {
  const jugar = (ids) => ids.reduce((e, id) => tocarFicha(e, id), COBRADOS_INICIAL);
  return [
    { nombre: "sin-responder", estado: COBRADOS_INICIAL },
    { nombre: "uno-cobrado", estado: jugar(["dia-5"]) },
    { nombre: "pista", estado: jugar(["jcc"]) },
    { nombre: "pista-retirada", estado: jugar(["jcc", "dia-5"]) },
    { nombre: "acierto", estado: jugar(["dia-5", "lcdv"]) },
    { nombre: "dos-errores", estado: jugar(["jcc", "mps"]) },
  ];
}

function medirCampo(correcta, malas) {
  const pon = (valores) => valores.reduce((e, v) => escribirValor(e, v, correcta), CAMPO_INICIAL);
  return [
    { nombre: "sin-responder", estado: CAMPO_INICIAL },
    { nombre: "escribiendo", estado: { ...CAMPO_INICIAL, valor: pesos(correcta).slice(1) } },
    ...malas.map((m) => ({ nombre: `pista-${m}`, estado: pon([m]) })),
    { nombre: "acierto", estado: pon([correcta]) },
    ...malas.map((m) => ({ nombre: `dos-errores-${m}`, estado: pon([malas.find((x) => x !== m) ?? m, m]) })),
  ];
}
/* Escribe y califica, como el campo. */
export const escribirValor = (e, v, correcta) => escribir({ ...(e ?? CAMPO_INICIAL), valor: String(v) }, correcta);
export { medirCampo };

export const SECUENCIA_P2 = {
  id: PIEZA_P2.id,
  titulo: PIEZA_P2.titulo,
  altoFigura: ALTO_FIGURA_T3,
  pantallas: [
    {
      id: "apertura", tipo: "apertura", titular: TITULARES_P2.apertura, Figura: FiguraApertura,
      nombreFigura: "Lo que San Calixto tiene el 2 de enero, en tres placas, y la línea de caja y utilidad",
      zonaDe: () => [{ texto: TEXTOS_P2.apertura }], medir: [{ nombre: "apertura", estado: null }],
    },
    {
      id: "cobrados", tipo: "haz", titular: TITULARES_P2.cobrados, Figura: FiguraCobrados,
      nombreFigura: "Ingresos y lo cobrado en barras, y los cuatro servicios de enero",
      estadoInicial: COBRADOS_INICIAL, resuelta: hazResuelto, razon: RAZON_P2P6.p2Cobrados, zonaDe: zonaCobrados, medir: medirCobrados(),
    },
    {
      id: "haber", tipo: "miralo", titular: TITULARES_P2.haber, Figura: FiguraHaber,
      nombreFigura: "Un asiento con sus casillas Debe y Haber, y las dos facturas por cobrar",
      estadoInicial: { vista: null }, zonaDe: () => [{ texto: TEXTOS_P2.haber }],
      medir: [{ nombre: "sin-tocar", estado: { vista: null } }, ...FACTURAS.map((f) => ({ nombre: `factura-${f.id}`, estado: { vista: f.id } }))],
    },
    {
      id: "asiento", tipo: "haz", titular: TITULARES_P2.asiento, Figura: FiguraAsiento,
      nombreFigura: "El asiento de LCDV: la casilla Debe y la casilla Haber, con su monto",
      estadoInicial: ASIENTO_INICIAL, resuelta: resueltaAsiento, razon: RAZON_P2P6.asiento, zonaDe: zonaAsientoP2, medir: medirAsiento(CUENTAS_P2_4),
    },
    {
      id: "gastos", tipo: "haz", titular: TITULARES_P2.gastos, Figura: FiguraGastos,
      nombreFigura: "Los gastos y lo que salió de la caja, en barras",
      estadoInicial: HAZ_T3, resuelta: hazResuelto, razon: RAZON_P2P6.opcion, zonaDe: zonaGastos, medir: medirEleccion(OPC_P2_5, CORRECTA_P2_5),
    },
    {
      id: "utilidad", tipo: "haz", titular: TITULARES_P2.utilidad, Figura: FiguraUtilidad,
      nombreFigura: "Ingresos y gastos de enero en barras, con el resultado tapado",
      estadoInicial: CAMPO_INICIAL, resuelta: hazResuelto, razon: RAZON_P2P6.cifra, zonaDe: zonaUtilidad,
      medir: medirCampo(UTILIDAD_ENERO, [INGRESOS + GASTOS, INGRESOS]),
    },
    {
      id: "separan", tipo: "haz", titular: TITULARES_P2.separan, Figura: FiguraSeparan,
      nombreFigura: "Las cuatro opciones, y debajo la línea de caja y utilidad con el puente entre las dos",
      estadoInicial: SEPARAN_INICIAL, resuelta: hazResuelto, razon: RAZON_P2P6.opcion, zonaDe: zonaSeparan, medir: medirSeparan(),
    },
    {
      id: "cierre", tipo: "cierre", titular: TITULARES_P2.cierre, Figura: FiguraCierre, nombreFigura,
      pasos: 1, rotulosPaso: [CIERRE_P2[1]],
      zonaDe: (_, paso) => zonaCierre(paso),
      medir: [{ nombre: "paso-1", estado: null, paso: 0 }, { nombre: "paso-2", estado: null, paso: 1 }],
    },
  ],
};
