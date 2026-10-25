/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · P6 «Lo que deja el periodo» en SecuenciaAprender · 10 pantallas.
 *
 * Pieza nueva (id t3-a6-lo-que-deja-el-periodo), después de «El cierre
 * completo». Lavalimpio S.A., enero (Libro, pp. 124-125 y 131-136). Forma:
 * paquete #578, e3-t3-p2-p6-secuencia-v1.md §1 y §3 (Itagaki v2). Textos:
 * t3SecuenciasTextosP2P6.js.
 *
 * Las cifras del estado de resultados no se escriben a mano: salen de los
 * ingresos de las dos quincenas (p. 131), de los cinco gastos de P6-2 y de la
 * tasa del 33 %. Una prueba comprueba que dan los números que Miyata verificó
 * a ojo en la p. 135 (6.020.000, 5.935.000, 1.958.550 y 3.976.450).
 *
 * P6-7, P6-9 y la pista de P6-4 van con el delta v3 (PASA de Takamura, lote
 * 17): las opciones en la lista unida (132) y, en P6-9, la marca «ESCENARIO
 * SIMULADO» en la figura, encima de la lista: 16 + 2 + 132 = 150 de 150.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  PIEZA_P6, TITULARES_P6, TEXTOS_P6, ACIERTOS_P6, OBJETIVO_P6, OPC_P6_1, ERRORES_P6_1, OPC_P6_2, GASTOS_P6_2, OPERACION,
  LAVALIMPIO_ENERO, ROTULOS_ESTADO as R, ERRORES_P6_3, ERRORES_P6_4, GANANCIAS_Y_PERDIDAS_P6, CUENTAS_P6_6,
  ZONAS_P6_8, CUENTAS_P6_8, CIERRE_P6, PISTAS_P6, RAZON_P2P6, OPC_P6_7, OPC_P6_9, MARCA_P6_9, LAS_ACACIAS_P6,
} from "../../../../../data/t3SecuenciasTextosP2P6.js";
import { hazResuelto, mostrarCorrecto, responderHaz } from "../../../../secuencia/secuencia.js";
import { Botones, ControlFlechas, HAZ_T3, elegir, zonaHaz, verBoton, pesos, C, ALTO_FIGURA_T3, TCompacta, enOrden } from "./base.jsx";
import { medirEleccion } from "./p1.jsx";
import { medirCampo } from "./p2.jsx";
import { FiguraP, Renglon, Tapado, CampoCifra, CAMPO_INICIAL, verHaz, ListaUnida, SUPERFICIE, BORDE_SUP, CIFRA } from "./comunP2P6.jsx";

/* ═══════════ EL ESTADO DE RESULTADOS DE ENERO, DESDE LOS HECHOS ═══════════ */
const suma = (l) => l.reduce((s, x) => s + x, 0);
export const INGRESOS_OP = suma(LAVALIMPIO_ENERO.ingresosOperacionales);
export const GASTOS_OP = suma(GASTOS_P6_2.filter((g) => g.respuesta === OPERACION).map((g) => g.saldo));
export const GASTOS_NO_OP = suma(GASTOS_P6_2.filter((g) => g.respuesta !== OPERACION).map((g) => g.saldo));
export const UTILIDAD_OP = INGRESOS_OP - GASTOS_OP;
export const ANTES = UTILIDAD_OP - GASTOS_NO_OP;
export const IMPUESTO = Math.round((ANTES * LAVALIMPIO_ENERO.tasaImpuesto) / 100);
export const EJERCICIO = ANTES - IMPUESTO;

const menos = (r) => `${R.menos} ${r}`;

/* ═══════════ P6-1 · LA T DE GANANCIAS Y PÉRDIDAS, CON EL SALDO TAPADO (2 pasos) ═══════════ */
const zonaApertura = (estado, paso) => (paso < 1
  ? [{ texto: OBJETIVO_P6, fuerte: true }]
  : zonaHaz(estado, { antes: [{ texto: TEXTOS_P6.apertura }], despues: [{ texto: ACIERTOS_P6.apertura }], pista: PISTAS_P6.apertura, porque: (el) => ERRORES_P6_1[el] ?? null }));

function FiguraApertura({ estado, setEstado, paso }) {
  const e = estado ?? HAZ_T3;
  const listo = hazResuelto(e);
  return (
    <FiguraP
      data-pantalla-t3="p6-apertura"
      ver={paso >= 1 ? verHaz(e) : null}
      modelo={(
        <TCompacta
          nombre={GANANCIAS_Y_PERDIDAS_P6}
          debe={GASTOS_P6_2.map((g) => g.saldo)}
          haber={LAVALIMPIO_ENERO.ingresosOperacionales}
          saldo={(
            <span data-saldo-tapado style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tapado ancho={84} nombre="saldo tapado" />
              {/* La consecuencia: el impuesto se separa del saldo, sin cifra. */}
              {listo && <span className="t3s-rotulo" data-impuesto-separado style={{ color: C.texto }}>− {R.impuesto}</span>}
            </span>
          )}
        />
      )}
      control={paso >= 1 ? <Botones nombre={TEXTOS_P6.apertura} opciones={OPC_P6_1} estado={e} correcta="no" onElegir={(x) => setEstado((s) => elegir(s, x, "no"))} /> : null}
      zona={zonaApertura(e, paso)}
    />
  );
}

/* ═══════════ P6-2 · OPERACIÓN O NO OPERACIONAL, un gasto por paso ═══════════ */
export const SEPARAR6_INICIAL = { k: 0, it: {}, ultimo: null };
export function separar6(estado, eleccion) {
  const e = estado ?? SEPARAR6_INICIAL;
  if (e.k >= GASTOS_P6_2.length) return e;
  const g = GASTOS_P6_2[e.k];
  const nuevo = { ...responderHaz(e.it[e.k], eleccion === g.respuesta), eleccion };
  const k = hazResuelto(nuevo) ? e.k + 1 : e.k;
  return { k, it: { ...e.it, [e.k]: nuevo }, ultimo: { k: e.k, ok: nuevo.ok, dosErrores: mostrarCorrecto(nuevo) } };
}
export function zonaSeparar6(estado) {
  const e = estado ?? SEPARAR6_INICIAL;
  const u = e.ultimo;
  const n = GASTOS_P6_2.length;
  if (e.k >= n && u?.ok) return [{ texto: ACIERTOS_P6.separar }];
  const sig = e.k < n ? [{ paso: `Paso ${e.k + 1} de ${n}` }] : [];
  if (u && !u.ok && !u.dosErrores) return [{ paso: `Paso ${u.k + 1} de ${n}` }, { texto: PISTAS_P6.separar, fuerte: true, tipo: "pista" }];
  if (u && u.dosErrores) return [...sig, { texto: GASTOS_P6_2[u.k].error, fuerte: true, tipo: "porque" }];
  return e.k < n ? [...sig, { texto: TEXTOS_P6.separar }] : [{ texto: ACIERTOS_P6.separar }];
}
const puestas6 = (e, zona) => GASTOS_P6_2.filter((g, k) => g.respuesta === zona && hazResuelto(e.it[k]));

function FiguraSeparar({ estado, setEstado }) {
  const e = estado ?? SEPARAR6_INICIAL;
  const actual = GASTOS_P6_2[e.k] ?? null;
  const u = e.ultimo;
  const ver = u ? (u.ok ? "bien" : "mal") : null;
  const it = actual ? e.it[e.k] ?? HAZ_T3 : HAZ_T3;
  return (
    <FiguraP
      data-pantalla-t3="p6-separar"
      ver={ver}
      modelo={(
        <div style={{ display: "grid", gridTemplateRows: "44px 48px", rowGap: "4px" }}>
          <div data-cuenta-en-curso style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", border: `2px solid ${actual ? C.texto : C.quieto}`, borderRadius: "8px", padding: "0 10px" }}>
            <span style={{ font: "600 14px/18px Inter, sans-serif", minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" }}>{actual?.cuenta ?? ""}</span>
            <b style={{ font: `600 12px/16px ${CIFRA}` }}>{actual ? pesos(actual.saldo) : ""}</b>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {OPC_P6_2.map((z) => (
              <div key={z.id} data-zona-gastos={z.id} style={{ flex: "1 1 0", minWidth: 0, height: "48px", boxSizing: "border-box", borderRadius: "8px", background: SUPERFICIE, border: BORDE_SUP, padding: "4px 6px", display: "grid", gridTemplateRows: "16px 20px", rowGap: "4px" }}>
                <span className="t3s-rotulo">{z.texto}</span>
                <span style={{ display: "flex", gap: "3px" }}>
                  {puestas6(e, z.id).map((g) => (
                    <span key={g.cuenta} aria-hidden="true" className="t3s-nueva" data-ficha-gasto={g.cuenta} style={{ width: "20px", height: "20px", borderRadius: "4px", background: C.neutro }} />
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      control={actual ? <Botones nombre={`¿${actual.cuenta} es de la operación?`} opciones={OPC_P6_2} estado={it} correcta={actual.respuesta} onElegir={(x) => setEstado((s) => separar6(s, x))} /> : null}
      zona={zonaSeparar6(e)}
    />
  );
}
function medirSeparar6() {
  const jugar = (l) => l.reduce((e, x) => separar6(e, x), SEPARAR6_INICIAL);
  const bien = GASTOS_P6_2.map((g) => g.respuesta);
  const mal = (r) => OPC_P6_2.find((o) => o.id !== r).id;
  return [
    { nombre: "sin-responder", estado: SEPARAR6_INICIAL },
    { nombre: "pista", estado: jugar([mal(bien[0])]) },
    { nombre: "dos-errores-operacion", estado: jugar([mal(bien[0]), mal(bien[0])]) },
    { nombre: "dos-errores-interes", estado: jugar([...bien.slice(0, 4), mal(bien[4]), mal(bien[4])]) },
    { nombre: "paso-5", estado: jugar(bien.slice(0, 4)) },
    { nombre: "acierto", estado: jugar(bien) },
  ];
}

/* ═══════════ P6-3 y P6-4 · LA PILA (renglón de 16 cada 20 px) ═══════════ */
function Pila({ renglones }) {
  return (
    <div data-pila style={{ display: "grid", gridAutoRows: "16px", rowGap: "4px" }}>
      {renglones.map((r) => <Renglon key={r.rotulo} data-renglon={r.rotulo} {...r} />)}
    </div>
  );
}
const RENGLONES_ANTES = (destapado) => [
  { rotulo: R.operacional, monto: UTILIDAD_OP },
  { rotulo: menos(R.noOperacionales), monto: GASTOS_NO_OP },
  { rotulo: R.antes, monto: ANTES, tapado: !destapado, resalta: destapado },
];
const RENGLONES_IMPUESTO = (destapado) => [
  { rotulo: R.operacional, monto: UTILIDAD_OP },
  { rotulo: menos(R.noOperacionales), monto: GASTOS_NO_OP },
  { rotulo: R.antes, monto: ANTES },
  { rotulo: menos(R.impuesto), monto: IMPUESTO, tapado: !destapado, resalta: destapado },
  { rotulo: R.ejercicio, monto: EJERCICIO, tapado: !destapado, resalta: destapado },
];

function pantallaCifra({ id, titular, correcta, renglones, pista, errores, antes, despues, nombre, malas }) {
  const zonaDe = (estado) => zonaHaz(estado, { antes, despues, pista, porque: (v) => errores[v] ?? null });
  function F({ estado, setEstado }) {
    const e = estado ?? CAMPO_INICIAL;
    return (
      <FiguraP
        data-pantalla-t3={`p6-${id}`}
        ver={verHaz(e)}
        modelo={<Pila renglones={renglones(hazResuelto(e))} />}
        control={<CampoCifra estado={e} setEstado={setEstado} correcta={correcta} nombre={nombre} ver={verHaz(e)} />}
        zona={zonaDe(e)}
      />
    );
  }
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura: "La pila del estado de resultados de Lavalimpio, con lo que falta tapado",
    estadoInicial: CAMPO_INICIAL, resuelta: hazResuelto, razon: RAZON_P2P6.cifra, zonaDe,
    medir: medirCampo(correcta, malas),
  };
}

/* ═══════════ P6-5 · MÍRALO: los tramos del estado, con ‹ › ═══════════ */
const RESUMEN = [
  { rotulo: R.ingresos, monto: INGRESOS_OP },
  { rotulo: R.operacional, monto: UTILIDAD_OP },
  { rotulo: R.antes, monto: ANTES },
  { rotulo: R.ejercicio, monto: EJERCICIO },
];
export const TRAMOS = [
  { rotulo: R.gastosOperacionales, monto: GASTOS_OP },
  { rotulo: R.noOperacionales, monto: GASTOS_NO_OP },
  { rotulo: R.impuesto, monto: IMPUESTO },
];
function FiguraEstado({ estado, setEstado }) {
  const i = estado?.tramo ?? 0;
  return (
    <FiguraP
      data-pantalla-t3="p6-estado"
      modelo={(
        <div style={{ display: "grid", gridAutoRows: "16px", rowGap: "4px" }}>
          <div className="t3s-rot" data-rotulo-estado>{R.titulo}</div>
          {RESUMEN.map((r, k) => (
            <div key={r.rotulo} style={{ position: "relative", paddingLeft: "8px" }}>
              {(k === i || k === i + 1) && <span aria-hidden="true" data-tramo-marca style={{ position: "absolute", left: 0, top: k === i ? "8px" : 0, bottom: k === i ? "-4px" : "8px", width: "2px", background: C.texto }} />}
              <Renglon rotulo={r.rotulo} monto={r.monto} resalta={k === i || k === i + 1} />
            </div>
          ))}
        </div>
      )}
      control={(
        <ControlFlechas
          nombre="Los tramos del estado de resultados"
          valores={TRAMOS.map((_, k) => k)}
          indice={i}
          onMover={(k) => setEstado(() => ({ tramo: k }))}
          onConfirmar={() => {}}
          rotulo={(k) => (
            <span style={{ display: "grid", lineHeight: "16px" }} data-tramo={k}>
              {/* En dos renglones de 16 que no se parten: el rótulo en 12/400 y, debajo, lo que se resta. */}
              <span style={{ font: "400 12px/16px Inter, sans-serif", whiteSpace: "nowrap" }}>{TRAMOS[k].rotulo}</span>
              <span style={{ font: `600 12px/16px ${CIFRA}`, whiteSpace: "nowrap" }}>− {pesos(TRAMOS[k].monto)}</span>
            </span>
          )}
        />
      )}
      zona={[{ texto: TEXTOS_P6.estado }]}
    />
  );
}

/* ═══════════ P6-6 · CIERRA GANANCIAS Y PÉRDIDAS: una cuenta del haber por paso ═══════════ */
const HABER_P6_6 = CUENTAS_P6_6.filter((c) => c.lado === "haber").map((c, k) => ({ ...c, monto: [IMPUESTO, EJERCICIO][k] }));
export const REPARTE_INICIAL = { k: 0, it: {}, indice: 0, ultimo: null };
export function ponerHaber(estado, cuenta) {
  const e = estado ?? REPARTE_INICIAL;
  if (e.k >= HABER_P6_6.length) return e;
  const ok = cuenta === HABER_P6_6[e.k].cuenta;
  const nuevo = { ...responderHaz(e.it[e.k], ok), eleccion: cuenta };
  const k = hazResuelto(nuevo) ? e.k + 1 : e.k;
  return { ...e, k, it: { ...e.it, [e.k]: nuevo }, ultimo: { k: e.k, ok, cuenta, dosErrores: mostrarCorrecto(nuevo) } };
}
export const reparteResuelto = (e) => (e?.k ?? 0) >= HABER_P6_6.length;
export function zonaReparte(estado) {
  const e = estado ?? REPARTE_INICIAL;
  const u = e.ultimo;
  const n = HABER_P6_6.length;
  if (reparteResuelto(e) && u?.ok) return [{ texto: ACIERTOS_P6.reparte }];
  const sig = e.k < n ? [{ paso: `Paso ${e.k + 1} de ${n}` }] : [];
  if (u && !u.ok && !u.dosErrores) return [{ paso: `Paso ${u.k + 1} de ${n}` }, { texto: PISTAS_P6.reparte, fuerte: true, tipo: "pista" }];
  if (u && u.dosErrores) {
    const err = CUENTAS_P6_6.find((c) => c.cuenta === u.cuenta)?.error;
    return err ? [...sig, { texto: err, fuerte: true, tipo: "porque" }] : (e.k < n ? [...sig, { texto: TEXTOS_P6.reparte }] : [{ texto: ACIERTOS_P6.reparte }]);
  }
  return e.k < n ? [...sig, { texto: TEXTOS_P6.reparte }] : [{ texto: ACIERTOS_P6.reparte }];
}
function LineaAsiento({ lado, cuenta, monto, ...datos }) {
  return (
    <div className="t3s2-fila" {...datos} style={{ paddingLeft: lado === "haber" ? "16px" : 0 }}>
      <span><span style={{ color: C.apagado }}>{lado === "debe" ? "Debe" : "Haber"} · </span><span style={{ color: C.texto }}>{cuenta}</span></span>
      <b>{pesos(monto)}</b>
    </div>
  );
}
function FiguraReparte({ estado, setEstado }) {
  const e = estado ?? REPARTE_INICIAL;
  const lista = enOrden(CUENTAS_P6_6);
  const listo = reparteResuelto(e);
  const u = e.ultimo;
  const enCurso = HABER_P6_6[e.k] ?? null;
  return (
    <FiguraP
      data-pantalla-t3="p6-reparte"
      ver={u ? (u.ok ? "bien" : "mal") : null}
      modelo={(
        <div style={{ display: "grid", gridTemplateRows: "16px 16px 16px 44px", rowGap: "4px" }} data-asiento-p6>
          <LineaAsiento lado="debe" cuenta={GANANCIAS_Y_PERDIDAS_P6} monto={ANTES} data-linea-dada />
          {HABER_P6_6.map((h, k) => (k < e.k ? <LineaAsiento key={h.cuenta} lado="haber" cuenta={h.cuenta} monto={h.monto} data-haber-puesto /> : <div key={h.cuenta} />))}
          {enCurso ? (
            <div data-casilla-en-curso style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "44px", boxSizing: "border-box", border: `2px solid ${C.texto}`, borderRadius: "8px", padding: "0 10px", marginLeft: "16px" }}>
              <span className="t3s-rotulo">Haber</span>
              <b style={{ font: `600 12px/16px ${CIFRA}`, color: C.texto }} data-monto-dado>{pesos(enCurso.monto)}</b>
            </div>
          ) : <div />}
        </div>
      )}
      control={(
        <ControlFlechas
          nombre="Elige la cuenta del haber"
          valores={lista.map((c) => c.cuenta)}
          indice={e.indice}
          apagado={listo}
          rotulo={(v) => v}
          onMover={(i) => setEstado((x) => ({ ...(x ?? REPARTE_INICIAL), indice: i }))}
          onConfirmar={(cuenta) => setEstado((x) => ponerHaber(x, cuenta))}
        />
      )}
      zona={zonaReparte(e)}
    />
  );
}
function medirReparte() {
  const jugar = (l) => l.reduce((e, c) => ponerHaber(e, c), REPARTE_INICIAL);
  const [a, b] = HABER_P6_6.map((h) => h.cuenta);
  const lista = enOrden(CUENTAS_P6_6);
  const largo = lista.reduce((m, c, k) => (c.cuenta.length > lista[m].cuenta.length ? k : m), 0);
  return [
    { nombre: "sin-responder", estado: REPARTE_INICIAL },
    { nombre: "pista", estado: jugar(["Caja"]) },
    { nombre: "dos-errores-por-pagar", estado: jugar(["Caja", "Impuesto de renta por pagar"]) },
    { nombre: "paso-2", estado: jugar([a]) },
    { nombre: "acierto", estado: jugar([a, b]) },
    { nombre: "centro-mas-largo", estado: { ...REPARTE_INICIAL, indice: largo } },
  ];
}

/* ═══════════ P6-8 · CADA CUENTA A SU ESTADO, una por paso (zonas que se tocan) ═══════════ */
export const LLEVAR_INICIAL = { k: 0, it: {}, ultimo: null };
export function llevar(estado, zona) {
  const e = estado ?? LLEVAR_INICIAL;
  if (e.k >= CUENTAS_P6_8.length) return e;
  const c = CUENTAS_P6_8[e.k];
  const nuevo = { ...responderHaz(e.it[e.k], zona === c.respuesta), eleccion: zona };
  const k = hazResuelto(nuevo) ? e.k + 1 : e.k;
  return { k, it: { ...e.it, [e.k]: nuevo }, ultimo: { k: e.k, ok: nuevo.ok, dosErrores: mostrarCorrecto(nuevo) } };
}
export const llevarResuelto = (e) => (e?.k ?? 0) >= CUENTAS_P6_8.length;
export function zonaLlevar(estado) {
  const e = estado ?? LLEVAR_INICIAL;
  const u = e.ultimo;
  const n = CUENTAS_P6_8.length;
  if (llevarResuelto(e) && u?.ok) return [{ texto: ACIERTOS_P6.aSuEstado }];
  const sig = e.k < n ? [{ paso: `Paso ${e.k + 1} de ${n}` }] : [];
  if (u && !u.ok && !u.dosErrores) return [{ paso: `Paso ${u.k + 1} de ${n}` }, { texto: PISTAS_P6.aSuEstado, fuerte: true, tipo: "pista" }];
  if (u && u.dosErrores) return [...sig, { texto: CUENTAS_P6_8[u.k].error, fuerte: true, tipo: "porque" }];
  return e.k < n ? [...sig, { texto: TEXTOS_P6.aSuEstado }] : [{ texto: ACIERTOS_P6.aSuEstado }];
}
function FiguraLlevar({ estado, setEstado }) {
  const e = estado ?? LLEVAR_INICIAL;
  const actual = CUENTAS_P6_8[e.k] ?? null;
  const u = e.ultimo;
  const listo = llevarResuelto(e);
  return (
    <FiguraP
      data-pantalla-t3="p6-a-su-estado"
      ver={u ? (u.ok ? "bien" : "mal") : null}
      modelo={(
        <div style={{ display: "grid", gridTemplateRows: "32px 60px", rowGap: "4px" }}>
          <div data-cuenta-en-curso style={{ display: "flex", alignItems: "center", height: "32px", boxSizing: "border-box", border: `2px solid ${actual ? C.texto : C.quieto}`, borderRadius: "8px", padding: "0 10px", font: "600 14px/18px Inter, sans-serif", whiteSpace: "nowrap", overflow: "hidden" }}>
            {actual?.cuenta ?? ""}
          </div>
          <div role="group" aria-label={actual ? `¿Adónde va ${actual.cuenta}?` : "Pasivo y patrimonio"} style={{ display: "flex", gap: "8px" }}>
            {ZONAS_P6_8.map((z) => {
              const dentro = CUENTAS_P6_8.filter((c, k) => c.respuesta === z.id && hazResuelto(e.it[k]));
              const mal = u && !u.ok && !u.dosErrores && e.it[u.k]?.eleccion === z.id;
              return (
                <button
                  key={z.id}
                  type="button"
                  className="t3s-ctl"
                  data-zona-estado={z.id}
                  data-ver={mal ? "mal" : undefined}
                  aria-disabled={listo ? "true" : undefined}
                  onClick={listo ? undefined : () => setEstado((s) => llevar(s, z.id))}
                  style={{ height: "60px", display: "grid", gridTemplateRows: "16px 1fr", alignContent: "start", justifyItems: "start", textAlign: "left", padding: "6px 8px", rowGap: "2px" }}
                >
                  <span className="t3s-rotulo" style={{ color: C.texto }}>{z.nombre}</span>
                  <span style={{ font: "400 12px/16px Inter, sans-serif", color: C.texto }}>
                    {dentro.map((c) => <span key={c.cuenta} className="t3s-nueva" data-cuenta-puesta={c.cuenta} style={{ display: "block" }}>{c.cuenta}</span>)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      control={null}
      zona={zonaLlevar(e)}
    />
  );
}
function medirLlevar() {
  const jugar = (l) => l.reduce((e, z) => llevar(e, z), LLEVAR_INICIAL);
  const bien = CUENTAS_P6_8.map((c) => c.respuesta);
  const mal = (r) => ZONAS_P6_8.find((z) => z.id !== r).id;
  return [
    { nombre: "sin-responder", estado: LLEVAR_INICIAL },
    { nombre: "pista", estado: jugar([mal(bien[0])]) },
    { nombre: "dos-errores-utilidad", estado: jugar([mal(bien[0]), mal(bien[0])]) },
    { nombre: "dos-errores-impuesto", estado: jugar([bien[0], mal(bien[1]), mal(bien[1])]) },
    { nombre: "acierto", estado: jugar(bien) },
  ];
}

/* ═══════════ P6-7 y P6-9 · ELIGE EL ASIENTO: la lista unida (delta v3 §1) ═══════════ */
/*
 * Las 3 opciones ocupan la figura (3 × 44 = 132; P6-9, con la marca, 150).
 * La línea de datos va encima de la pista, solo con error (v2 §1; delta v3
 * §2: P6 no tiene línea de lectura). Sus cifras salen de los hechos: el
 * impuesto calculado arriba y la pérdida de Las Acacias del texto de Miyata.
 */
export const DATOS_P6_7 = [[R.impuesto, IMPUESTO]];
export const DATOS_P6_9 = [[LAS_ACACIAS_P6.nombre], [LAS_ACACIAS_P6.rotulo, LAS_ACACIAS_P6.perdida]];

function pantallaAsiento({ id, titular, opciones, texto, acierto, pista, datos, marca = null, nombreFigura }) {
  const correcta = opciones.find((o) => o.correcta).id;
  const zonaDe = (estado) => {
    const z = zonaHaz(estado, { antes: [{ texto }], despues: [{ texto: acierto }], pista, porque: (el) => opciones.find((o) => o.id === el)?.error ?? null });
    return z[0]?.tipo === "pista" ? [{ datos }, ...z] : z;
  };
  function F({ estado, setEstado }) {
    const e = estado ?? HAZ_T3;
    return (
      <FiguraP
        data-pantalla-t3={`p6-${id}`}
        ver={verHaz(e)}
        entera={(
          <ListaUnida
            nombre="Elige el asiento"
            opciones={opciones}
            estado={e}
            correcta={correcta}
            marca={marca}
            verDe={verBoton}
            onElegir={(x) => setEstado((s) => elegir(s, x, correcta))}
          />
        )}
        zona={zonaDe(e)}
      />
    );
  }
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura, estadoInicial: HAZ_T3,
    resuelta: hazResuelto, razon: RAZON_P2P6.opcion, zonaDe, medir: medirEleccion(opciones, correcta),
  };
}

/* ═══════════ P6-10 · CIERRE: el estado completo, 2 pasos ═══════════ */
const ESTADO_COMPLETO = [
  { rotulo: R.ingresos, monto: INGRESOS_OP },
  { rotulo: menos(R.gastosOperacionales), monto: GASTOS_OP },
  { rotulo: R.operacional, monto: UTILIDAD_OP },
  { rotulo: menos(R.noOperacionales), monto: GASTOS_NO_OP },
  { rotulo: R.antes, monto: ANTES },
  { rotulo: menos(R.impuesto), monto: IMPUESTO },
  { rotulo: R.ejercicio, monto: EJERCICIO, resalta: true },
];
/*
 * A 320 el modelo tiene 98 px: 7 renglones de 14 (Inter 12/14) = 98, sin el
 * rótulo «Estado de resultados», que ya está en el titular. A 375 (148 px): el
 * rótulo (16) + 7 renglones de 18 = 142.
 */
const CSS_CIERRE = `
.t3s2-estado .t3s2-fila { height: 14px; line-height: 14px; }
.t3s2-estado .t3s2-fila b { line-height: 14px; }
.t3s2-estado [data-rotulo-estado] { display: none; }
@media (min-width: 375px) and (min-height: 640px) {
  .t3s2-estado .t3s2-fila, .t3s2-estado .t3s2-fila b { height: 18px; line-height: 18px; }
  .t3s2-estado [data-rotulo-estado] { display: block; }
}`;
const zonaCierre = (paso) => (paso >= 1 ? [{ texto: CIERRE_P6[1], fuerte: true }, { pie: PIEZA_P6.pie }] : [{ texto: CIERRE_P6[0], fuerte: true }]);
function FiguraCierre({ paso }) {
  return (
    <FiguraP
      data-pantalla-t3="p6-cierre"
      modelo={(
        <div className="t3s2-estado" data-estado-completo>
          <style>{CSS_CIERRE}</style>
          <div className="t3s-rot" data-rotulo-estado>{R.titulo}</div>
          {ESTADO_COMPLETO.map((r) => <Renglon key={r.rotulo} data-renglon={r.rotulo} {...r} />)}
        </div>
      )}
      zona={zonaCierre(paso)}
    />
  );
}

export const SECUENCIA_P6 = {
  id: PIEZA_P6.id,
  titulo: PIEZA_P6.titulo,
  altoFigura: ALTO_FIGURA_T3,
  pantallas: [
    {
      /*
       * La forma la llama «Haz, 2 pasos», pero SecuenciaAprender exige que la
       * primera pantalla sea la apertura (faltasDePieza). Va como apertura con
       * 1 paso: el objetivo y, después, el Sí / No calificado (pista, porqué y
       * pastilla como un Haz). Lo único que no hace es apagar «Siguiente».
       */
      id: "apertura", tipo: "apertura", titular: TITULARES_P6.apertura, Figura: FiguraApertura,
      nombreFigura: `La cuenta ${GANANCIAS_Y_PERDIDAS_P6} en T, con su saldo tapado`,
      estadoInicial: HAZ_T3, pasos: 1, rotulosPaso: [TEXTOS_P6.apertura], zonaDe: zonaApertura,
      medir: [
        { nombre: "paso-1-objetivo", estado: HAZ_T3, paso: 0 },
        ...medirEleccion(OPC_P6_1, "no").map((m) => ({ ...m, paso: 1 })),
      ],
    },
    {
      id: "separar", tipo: "haz", titular: TITULARES_P6.separar, Figura: FiguraSeparar,
      nombreFigura: "El gasto en curso y las zonas Operación y No operacional",
      estadoInicial: SEPARAR6_INICIAL, resuelta: (e) => (e?.k ?? 0) >= GASTOS_P6_2.length, razon: RAZON_P2P6.ubicar, zonaDe: zonaSeparar6, medir: medirSeparar6(),
    },
    pantallaCifra({
      id: "antes", titular: TITULARES_P6.antes, correcta: ANTES, renglones: RENGLONES_ANTES, pista: PISTAS_P6.antes, errores: ERRORES_P6_3,
      antes: [{ texto: TEXTOS_P6.antes }], despues: [{ texto: ACIERTOS_P6.antes }], nombre: "Escribe la utilidad antes de impuestos",
      malas: [UTILIDAD_OP, UTILIDAD_OP + GASTOS_NO_OP],
    }),
    pantallaCifra({
      id: "impuesto", titular: TITULARES_P6.impuesto, correcta: IMPUESTO, renglones: RENGLONES_IMPUESTO, pista: PISTAS_P6.impuesto, errores: ERRORES_P6_4,
      antes: [{ texto: TEXTOS_P6.impuesto }], despues: [{ texto: ACIERTOS_P6.impuesto }], nombre: "Escribe el impuesto",
      malas: [Math.round((UTILIDAD_OP * LAVALIMPIO_ENERO.tasaImpuesto) / 100), EJERCICIO],
    }),
    {
      id: "estado", tipo: "miralo", titular: TITULARES_P6.estado, Figura: FiguraEstado,
      nombreFigura: "El estado de resultados de Lavalimpio en cuatro renglones",
      estadoInicial: { tramo: 0 }, zonaDe: () => [{ texto: TEXTOS_P6.estado }],
      medir: TRAMOS.map((t, k) => ({ nombre: `tramo-${k + 1}`, estado: { tramo: k } })),
    },
    {
      id: "reparte", tipo: "haz", titular: TITULARES_P6.reparte, Figura: FiguraReparte,
      nombreFigura: `El asiento que cierra ${GANANCIAS_Y_PERDIDAS_P6}: el debe dado y el haber por poner`,
      estadoInicial: REPARTE_INICIAL, resuelta: reparteResuelto, razon: RAZON_P2P6.asiento, zonaDe: zonaReparte, medir: medirReparte(),
    },
    pantallaAsiento({
      id: "por-pagar", titular: TITULARES_P6.porPagar, opciones: OPC_P6_7, texto: TEXTOS_P6.porPagar, acierto: ACIERTOS_P6.porPagar,
      pista: PISTAS_P6.porPagar, datos: DATOS_P6_7, nombreFigura: "Tres asientos posibles para el impuesto, en una lista",
    }),
    {
      id: "a-su-estado", tipo: "haz", titular: TITULARES_P6.aSuEstado, Figura: FiguraLlevar,
      nombreFigura: "La cuenta en curso y las zonas Pasivo y Patrimonio",
      estadoInicial: LLEVAR_INICIAL, resuelta: llevarResuelto, razon: RAZON_P2P6.ubicar, zonaDe: zonaLlevar, medir: medirLlevar(),
    },
    pantallaAsiento({
      id: "acacias", titular: TITULARES_P6.acacias, opciones: OPC_P6_9, texto: TEXTOS_P6.acacias, acierto: ACIERTOS_P6.acacias,
      pista: PISTAS_P6.acacias, datos: DATOS_P6_9, marca: MARCA_P6_9,
      nombreFigura: "Escenario simulado: tres asientos posibles para cerrar la pérdida, en una lista",
    }),
    {
      id: "cierre", tipo: "cierre", titular: TITULARES_P6.cierre, Figura: FiguraCierre,
      nombreFigura: "El estado de resultados de Lavalimpio, de arriba abajo",
      pasos: 1, rotulosPaso: [CIERRE_P6[1]], zonaDe: (_, paso) => zonaCierre(paso),
      medir: [{ nombre: "paso-1", estado: null, paso: 0 }, { nombre: "paso-2", estado: null, paso: 1 }],
    },
  ],
};
