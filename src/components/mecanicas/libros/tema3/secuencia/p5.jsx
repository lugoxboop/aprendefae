/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · P5 «Cerrar el periodo» en SecuenciaAprender · 10 pantallas (v4 de Itagaki).
 *
 * ⚠ La v4 de P5 la revisa Takamura en el lote 12: se monta, pero no se
 * fusiona sin ese PASA (paquete, «Estado»).
 *
 * Paquete e3-t3-secuencias-aprender-v3.md §3 y §4 (contra «Texto clave»).
 * Textos aprobados de contabilidadTema3Cierre.js; nuevos de t3SecuenciasTextos.js.
 *
 * ⛔ Las Acacias (pantallas 7, 8 y 9) no tienen datos en ninguna parte: ni
 * sus cuentas ni sus saldos (solo «Pérdida $100.000»). Quedan armadas y
 * esperando, sin inventar cifras.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  SEGMENTOS_CIERRE, CIERRE_TEXTO, CUENTAS_DEL_PERIODO, CUENTAS_QUE_SIGUEN, TOTAL_INGRESOS, TOTAL_GASTOS, QUEDA,
  SE_VACIAN, NO_SE_VACIAN, GANANCIAS_Y_PERDIDAS, QUEDA_TEXTO, DIAGRAMA_AJUSTES, DIAGRAMA_CIERRE, INGRESO, GASTO,
  PIEZA_CERRAR_EL_PERIODO,
} from "../../../../../data/contabilidadTema3Cierre.js";
import { PIEZA_VENDER_NO_ES_COBRAR } from "../../../../../data/contabilidadTema3.js";
import {
  TITULARES_P5, OPC_P5_2, OPC_P5_6, ERROR_P5_3, ERRORES_P5_6, PISTAS, PASOS_P5_2, YA_PUESTAS_P5_2, RAZON_HAZ_T3,
} from "../../../../../data/t3SecuenciasTextos.js";
import { hazResuelto, mostrarCorrecto, responderHaz } from "../../../../secuencia/secuencia.js";
import {
  Figura, Botones, ControlFlechas, HAZ_T3, elegir, zonaHaz, verDe, pesos, C, MONO, ALTO_FIGURA_T3, TCompacta, O4Compacto,
} from "./base.jsx";
import { medirEleccion } from "./p1.jsx";

const termino = (t) => PIEZA_CERRAR_EL_PERIODO.nombres.find((n) => n.termino === t);
const UTILIDAD = PIEZA_VENDER_NO_ES_COBRAR.nombres.find((n) => n.termino === "Utilidad").termino;
const ZONAS = [{ id: "vacia", nombre: SE_VACIAN }, { id: "no-vacia", nombre: NO_SE_VACIAN }];

/* ═══════════ LAS DOS ZONAS CON FICHAS DE 20 × 20 ═══════════ */

function Fichas({ cuentas, anillo }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 20px)", gap: "3px" }}>
      {cuentas.map((c) => (
        <span key={c} aria-hidden="true" data-ficha-cuenta={c} style={{
          width: "20px", height: "20px", borderRadius: "4px", background: C.neutro,
          boxShadow: anillo ? `0 0 0 2px ${C.texto}` : "none",
        }} />
      ))}
    </div>
  );
}

/* P5-1: las zonas de 125 × 98 con su rótulo; los nombres entran por paso. */
function FiguraApertura({ paso }) {
  const desdeYa = termino("Desde ya");
  const rot = [paso >= 1 ? termino("Cuentas del periodo").termino : "", paso >= 2 ? desdeYa.termino : ""];
  return (
    <Figura
      data-pantalla-t3="p5-apertura"
      modelo={(
        <div style={{ display: "flex", gap: "8px", height: "100%" }}>
          {ZONAS.map((z, k) => (
            <div key={z.id} data-zona-cuentas={z.id} style={{ flex: "1 1 0", minWidth: 0, display: "grid", gridTemplateRows: "16px 16px 1fr", rowGap: "4px", border: `1px solid ${C.quieto}`, borderRadius: "8px", padding: "4px 6px" }}>
              <span className="t3s-rotulo" style={{ color: C.texto, fontWeight: 700 }} data-rotulo-paso>{rot[k]}</span>
              <span className="t3s-rotulo">{z.nombre}</span>
              <Fichas cuentas={YA_PUESTAS_P5_2[z.id]} />
            </div>
          ))}
        </div>
      )}
      zona={paso >= 2 ? [{ texto: desdeYa.definicion }] : [{ texto: SEGMENTOS_CIERRE[0] }]}
    />
  );
}

/* ═══════════ P5-2: SEPARAR, UNA CUENTA POR PASO ═══════════ */

export const SEPARAR_INICIAL = { k: 0, it: {}, ultimo: null, viendo: null };

export function separar(estado, eleccion) {
  const e = estado ?? SEPARAR_INICIAL;
  if (e.k >= PASOS_P5_2.length) return e;
  const paso = PASOS_P5_2[e.k];
  const nuevo = { ...responderHaz(e.it[e.k], eleccion === paso.respuesta), eleccion };
  const k = hazResuelto(nuevo) ? e.k + 1 : e.k;
  return { k, it: { ...e.it, [e.k]: nuevo }, ultimo: { k: e.k, ok: nuevo.ok, dosErrores: mostrarCorrecto(nuevo) }, viendo: null };
}

const puestas = (e, zona) => [
  ...YA_PUESTAS_P5_2[zona],
  ...PASOS_P5_2.filter((p, k) => p.respuesta === zona && hazResuelto(e.it[k])).map((p) => p.cuenta),
];

export function zonaSeparar(estado) {
  const e = estado ?? SEPARAR_INICIAL;
  const u = e.ultimo;
  const t = u ? e.it[u.k] : null;
  /* Si hay una pista a la vista, la pista manda sobre la lista. */
  if (u && !u.ok && !u.dosErrores) return [{ paso: `Paso ${u.k + 1} de ${PASOS_P5_2.length}` }, { texto: PISTAS.p5.separar, fuerte: true, tipo: "pista" }];
  if (e.viendo) return [{ texto: puestas(e, e.viendo).join(", "), tipo: "lista" }];
  const sig = e.k < PASOS_P5_2.length ? [{ paso: `Paso ${e.k + 1} de ${PASOS_P5_2.length}` }] : [];
  if (u && u.dosErrores && t) return [...sig, { texto: PASOS_P5_2[u.k].error, fuerte: true, tipo: "porque" }];
  return sig;
}

function FiguraSeparar({ estado, setEstado }) {
  const e = estado ?? SEPARAR_INICIAL;
  const actual = PASOS_P5_2[e.k] ?? null;
  const u = e.ultimo;
  const ver = u ? (u.ok ? "bien" : u.dosErrores ? null : "mal") : null;
  const it = actual ? e.it[e.k] ?? HAZ_T3 : HAZ_T3;
  return (
    <Figura
      data-pantalla-t3="p5-separar"
      ver={ver}
      modelo={(
        <div style={{ display: "grid", gridTemplateRows: "44px 48px", rowGap: "4px" }}>
          <div data-cuenta-en-curso style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", border: `2px solid ${C.texto}`, borderRadius: "8px", padding: "0 10px", marginRight: ver ? "110px" : 0 }}>
            <span style={{ font: "600 14px/18px Inter, sans-serif", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{actual?.cuenta ?? ""}</span>
            <b style={{ font: `600 12px/16px ${MONO}` }}>{actual ? pesos(actual.saldo) : ""}</b>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {ZONAS.map((z) => (
              <button
                key={z.id}
                type="button"
                className="t3s-ctl"
                data-ver-zona={z.id}
                aria-label={`Ver las cuentas de ${z.nombre}`}
                aria-pressed={e.viendo === z.id ? "true" : "false"}
                onClick={() => setEstado((x) => ({ ...(x ?? SEPARAR_INICIAL), viendo: z.id }))}
                style={{ height: "48px", display: "grid", gridTemplateColumns: "1fr", alignContent: "center", justifyItems: "center", padding: "1px" }}
              >
                <Fichas cuentas={puestas(e, z.id)} anillo={e.viendo === z.id} />
              </button>
            ))}
          </div>
        </div>
      )}
      control={actual ? <Botones nombre={`¿${actual.cuenta} se vacía?`} opciones={OPC_P5_2} estado={it} correcta={actual.respuesta} onElegir={(x) => setEstado((s) => separar(s, x))} /> : null}
      zona={zonaSeparar(e)}
    />
  );
}

function medirSeparar() {
  const jugar = (lista) => lista.reduce((e, x) => separar(e, x), SEPARAR_INICIAL);
  const bien = PASOS_P5_2.map((p) => p.respuesta);
  const mal = (r) => (r === "vacia" ? "no-vacia" : "vacia");
  /* El porqué más largo es el de Aportes sociales (paso 5). */
  const hastaUltimo = bien.slice(0, 4);
  return [
    { nombre: "sin-responder", estado: SEPARAR_INICIAL },
    { nombre: "pista", estado: jugar([mal(bien[0])]) },
    { nombre: "dos-errores-paso-5", estado: jugar([...hastaUltimo, mal(bien[4]), mal(bien[4])]) },
    { nombre: "lista-se-vacian", estado: { ...jugar(bien), viendo: "vacia" } },
    { nombre: "lista-no-se-vacian", estado: { ...jugar(bien), viendo: "no-vacia" } },
  ];
}

/* ═══════════ P5-3: ORDENAR ═══════════ */
const OPC_ORDEN = [{ id: DIAGRAMA_AJUSTES, texto: DIAGRAMA_AJUSTES }, { id: DIAGRAMA_CIERRE, texto: DIAGRAMA_CIERRE }];
function Diagrama({ listo }) {
  const caja = (t, k) => (
    <span key={k} style={{ flex: "1 1 0", height: "44px", border: `2px ${listo ? "solid" : "dashed"} ${listo ? C.texto : C.quieto}`, borderRadius: "8px", display: "grid", placeItems: "center", font: "600 14px/18px Inter, sans-serif" }}>{listo ? t : `${k + 1}`}</span>
  );
  return (
    <div data-diagrama style={{ display: "flex", alignItems: "center", gap: "8px", height: "60px" }}>
      {caja(DIAGRAMA_AJUSTES, 0)}
      <span aria-hidden="true" style={{ color: listo ? C.texto : C.quieto, fontSize: "18px" }}>→</span>
      {caja(DIAGRAMA_CIERRE, 1)}
    </div>
  );
}

/* ═══════════ P5-4 y P5-5: PASAR CON ‹ cuenta › ═══════════ */
const SIGUEN = CUENTAS_QUE_SIGUEN.map((c) => c.cuenta);
const ingresos = CUENTAS_DEL_PERIODO.filter((c) => c.tipo === INGRESO);
const gastos = CUENTAS_DEL_PERIODO.filter((c) => c.tipo === GASTO);
export const PASAR_INICIAL = { ...HAZ_T3, indice: 0, pasadas: [] };

export function pasar(estado, objetivo, cuenta) {
  const e = estado ?? PASAR_INICIAL;
  if (hazResuelto(e)) return e;
  const ok = objetivo.some((c) => c.cuenta === cuenta);
  if (ok) {
    const pasadas = e.pasadas.includes(cuenta) ? e.pasadas : [...e.pasadas, cuenta];
    const todas = objetivo.every((c) => pasadas.includes(c.cuenta));
    return { ...e, pasadas, ultimo: "acierto", ok: todas ? true : e.ok, eleccion: cuenta };
  }
  const r = responderHaz({ ...e, ok: false }, false);
  /* Con dos errores, el estado correcto: todas las que se vacían, pasadas. */
  return { ...e, ...r, eleccion: cuenta, pasadas: mostrarCorrecto(r) ? objetivo.map((c) => c.cuenta) : e.pasadas };
}

function pantallaPasar({ id, titular, objetivo, antes, despues, previas = [] }) {
  const candidatas = [...objetivo.map((c) => c.cuenta), ...SIGUEN];
  const zonaDe = (estado) => zonaHaz(estado, { antes, despues, pista: PISTAS.p5.pasar, porque: () => null });
  function F({ estado, setEstado }) {
    const e = estado ?? PASAR_INICIAL;
    const listo = hazResuelto(e);
    const enCentro = candidatas[e.indice ?? 0];
    const pasada = e.pasadas.includes(enCentro);
    const debe = [...previas.filter((c) => c.tipo === GASTO), ...objetivo.filter((c) => c.tipo === GASTO && e.pasadas.includes(c.cuenta))].map((c) => c.saldo);
    const haber = [...previas.filter((c) => c.tipo === INGRESO), ...objetivo.filter((c) => c.tipo === INGRESO && e.pasadas.includes(c.cuenta))].map((c) => c.saldo);
    return (
      <Figura
        data-pantalla-t3={`p5-${id}`}
        ver={e.ultimo ? (e.ultimo === "acierto" ? "bien" : mostrarCorrecto(e) ? null : "mal") : null}
        modelo={<TCompacta nombre={GANANCIAS_Y_PERDIDAS} debe={debe} haber={haber} />}
        control={(
          <ControlFlechas
            nombre="Elige la cuenta que pasa"
            valores={candidatas}
            indice={e.indice ?? 0}
            apagado={listo}
            rotulo={(c) => (pasada && c === enCentro ? `${c} $0` : c)}
            onMover={(i) => setEstado((s) => ({ ...(s ?? PASAR_INICIAL), indice: i }))}
            onConfirmar={(c) => setEstado((s) => ({ ...pasar(s, objetivo, c), indice: (s ?? PASAR_INICIAL).indice }))}
          />
        )}
        zona={zonaDe(e)}
      />
    );
  }
  const jugar = (lista) => lista.reduce((e, c) => pasar(e, objetivo, c), PASAR_INICIAL);
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura: `La cuenta ${GANANCIAS_Y_PERDIDAS} en T y las cuentas de San Calixto`,
    estadoInicial: PASAR_INICIAL, resuelta: hazResuelto, razon: RAZON_HAZ_T3, zonaDe,
    medir: [
      { nombre: "sin-responder", estado: PASAR_INICIAL },
      { nombre: "pista", estado: jugar([SIGUEN[0]]) },
      { nombre: "acierto", estado: jugar(objetivo.map((c) => c.cuenta)) },
      { nombre: "dos-errores", estado: jugar([SIGUEN[0], SIGUEN[1]]) },
      /* El nombre más largo en el centro del control. */
      { nombre: "centro-mas-largo", estado: { ...PASAR_INICIAL, indice: candidatas.reduce((a, c, k) => (c.length > candidatas[a].length ? k : a), 0) } },
    ],
  };
}

/* ═══════════ P5-6: ESCRIBE EL SALDO (campo de r5) ═══════════ */
export const SALDO_INICIAL = { ...HAZ_T3, valor: "" };
const leer = (v) => { const n = Number(String(v).replace(/[^\d]/g, "")); return String(v).trim() === "" || Number.isNaN(n) ? null : n; };

function FiguraSaldo({ estado, setEstado }) {
  const e = estado ?? SALDO_INICIAL;
  const listo = hazResuelto(e);
  const zonaDe = (x) => zonaHaz(x, { antes: [], despues: [{ rotulo: GANANCIAS_Y_PERDIDAS }, { texto: SEGMENTOS_CIERRE[6] }], pista: PISTAS.p5.saldo, porque: () => null });
  return (
    <Figura
      data-pantalla-t3="p5-saldo"
      ver={verDe(e)}
      modelo={<O4Compacto ingresos={TOTAL_INGRESOS} gastos={TOTAL_GASTOS} tapado={!listo} resultado={`${UTILIDAD} ${pesos(QUEDA)}`} />}
      control={(
        <div style={{ display: "flex", gap: "8px", flex: "1 1 0", minWidth: 0 }}>
          <input
            aria-label="Escribe el saldo"
            inputMode="numeric"
            value={e.valor}
            disabled={listo}
            onChange={(ev) => { const v = ev.target.value; setEstado((s) => ({ ...(s ?? SALDO_INICIAL), valor: v })); }}
            style={{ flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "8px", border: `1px solid ${C.quieto}`, background: "transparent", color: C.texto, font: `600 14px/18px ${MONO}`, padding: "0 10px" }}
          />
          <button
            type="button"
            className="t3s-ctl"
            style={{ flex: "0 0 112px" }}
            aria-disabled={listo || leer(e.valor) === null ? "true" : undefined}
            onClick={listo || leer(e.valor) === null ? undefined : () => setEstado((s) => ({ ...elegir(s ?? SALDO_INICIAL, String(leer((s ?? SALDO_INICIAL).valor)), String(QUEDA)), valor: (s ?? SALDO_INICIAL).valor }))}
          >
            Comprobar
          </button>
        </div>
      )}
      zona={zonaDe(e)}
    />
  );
}

/* ═══════════ LAS ACACIAS: ARMADAS Y ESPERANDO SUS DATOS ═══════════ */
function pendienteAcacias(id, titular) {
  function F() {
    return <Figura data-pantalla-t3={`p5-${id}`} data-pendiente="las-acacias" modelo={null} zona={[]} />;
  }
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura: "Las cuentas de Las Acacias", estadoInicial: HAZ_T3,
    resuelta: () => false, razon: RAZON_HAZ_T3, zonaDe: () => [], pendiente: "Los datos de Las Acacias (cuentas y saldos)",
    medir: [{ nombre: "pendiente", estado: HAZ_T3 }],
  };
}

export const SECUENCIA_P5 = {
  id: PIEZA_CERRAR_EL_PERIODO.id,
  titulo: PIEZA_CERRAR_EL_PERIODO.titulo,
  altoFigura: ALTO_FIGURA_T3,
  pantallas: [
    {
      id: "apertura", tipo: "apertura", titular: TITULARES_P5.apertura, Figura: FiguraApertura, nombreFigura: `Las cuentas de San Calixto en dos montones: ${SE_VACIAN} y ${NO_SE_VACIAN}`,
      pasos: 2, rotulosPaso: [termino("Cuentas del periodo").termino, termino("Desde ya").termino],
      zonaDe: (_, paso) => (paso >= 2 ? [{ texto: termino("Desde ya").definicion }] : [{ texto: SEGMENTOS_CIERRE[0] }]),
      medir: [{ nombre: "paso-0", estado: null, paso: 0 }, { nombre: "paso-1", estado: null, paso: 1 }, { nombre: "paso-2-desde-ya", estado: null, paso: 2 }],
    },
    {
      id: "separar", tipo: "haz", titular: TITULARES_P5.separar, Figura: FiguraSeparar, nombreFigura: `La cuenta en curso y los montones ${SE_VACIAN} y ${NO_SE_VACIAN}`,
      estadoInicial: SEPARAR_INICIAL, resuelta: (e) => (e?.k ?? 0) >= PASOS_P5_2.length, razon: RAZON_HAZ_T3, zonaDe: zonaSeparar, medir: medirSeparar(),
    },
    (() => {
      const zonaDe = (estado) => zonaHaz(estado, { antes: [], despues: [{ texto: SEGMENTOS_CIERRE[1] }], pista: PISTAS.p5.ordenar, porque: (el) => (el === DIAGRAMA_CIERRE ? ERROR_P5_3 : null) });
      function F({ estado, setEstado }) {
        const e = estado ?? HAZ_T3;
        return (
          <Figura
            data-pantalla-t3="p5-ordenar"
            ver={verDe(e)}
            modelo={<Diagrama listo={hazResuelto(e)} />}
            control={<Botones nombre="¿Cuál va primero?" opciones={OPC_ORDEN} estado={e} correcta={DIAGRAMA_AJUSTES} onElegir={(x) => setEstado((s) => elegir(s, x, DIAGRAMA_AJUSTES))} />}
            zona={zonaDe(e)}
          />
        );
      }
      return {
        id: "ordenar", tipo: "haz", titular: TITULARES_P5.ordenar, Figura: F, nombreFigura: "El diagrama del libro: dos casillas en orden",
        estadoInicial: HAZ_T3, resuelta: hazResuelto, razon: RAZON_HAZ_T3, zonaDe, medir: medirEleccion(OPC_ORDEN, DIAGRAMA_AJUSTES),
      };
    })(),
    /*
     * P5-4: el paquete pide 3 pasos (pasar el ingreso; «Cerrar» como rótulo
     * con su definición; la primera oración de la cita de la p. 123,
     * CITA_P5_123). SecuenciaAprender da los pasos antes de que un Haz espere,
     * no después (#534): va el paso 1; los otros dos entran cuando se pueda.
     */
    pantallaPasar({
      id: "ingresos", titular: TITULARES_P5.ingresos, objetivo: ingresos,
      antes: [{ texto: SEGMENTOS_CIERRE[2] }], despues: [{ texto: SEGMENTOS_CIERRE[3] }],
    }),
    pantallaPasar({
      id: "gastos", titular: TITULARES_P5.gastos, objetivo: gastos, previas: ingresos,
      antes: [{ texto: SEGMENTOS_CIERRE[4] }], despues: [{ texto: SEGMENTOS_CIERRE[5] }],
    }),
    {
      id: "saldo", tipo: "haz", titular: TITULARES_P5.saldo, Figura: FiguraSaldo, nombreFigura: `${GANANCIAS_Y_PERDIDAS}: ingresos y gastos en barras`,
      estadoInicial: SALDO_INICIAL, resuelta: hazResuelto, razon: RAZON_HAZ_T3,
      zonaDe: (estado) => zonaHaz(estado, { antes: [], despues: [{ rotulo: GANANCIAS_Y_PERDIDAS }, { texto: SEGMENTOS_CIERRE[6] }], pista: PISTAS.p5.saldo, porque: () => null }),
      medir: [
        { nombre: "sin-responder", estado: SALDO_INICIAL },
        { nombre: "pista", estado: { ...elegir(SALDO_INICIAL, "25650", String(QUEDA)), valor: "25650" } },
        { nombre: "acierto", estado: { ...elegir(SALDO_INICIAL, String(QUEDA), String(QUEDA)), valor: "3950" } },
      ],
    },
    pendienteAcacias("acacias-ingresos", TITULARES_P5.acaciasIngresos),
    pendienteAcacias("acacias-gastos", TITULARES_P5.acaciasGastos),
    /* P5-9 tiene sus opciones, errores y pista (OPC_P5_6), pero el O4 necesita los totales de Las Acacias. */
    { ...pendienteAcacias("perdida", TITULARES_P5.perdida), opciones: OPC_P5_6, errores: ERRORES_P5_6, pista: PISTAS.p5.acacias },
    {
      id: "cierre", tipo: "cierre", titular: TITULARES_P5.cierre, nombreFigura: `La T de ${GANANCIAS_Y_PERDIDAS} al final de enero`,
      Figura: () => (
        <Figura
          data-pantalla-t3="p5-cierre"
          modelo={<TCompacta nombre={GANANCIAS_Y_PERDIDAS} debe={gastos.map((c) => c.saldo)} haber={ingresos.map((c) => c.saldo)} saldo={QUEDA_TEXTO(pesos(QUEDA))} />}
          zona={[{ texto: CIERRE_TEXTO, fuerte: true }]}
        />
      ),
      zonaDe: () => [{ texto: CIERRE_TEXTO }], medir: [{ nombre: "cierre", estado: null }],
    },
  ],
};
