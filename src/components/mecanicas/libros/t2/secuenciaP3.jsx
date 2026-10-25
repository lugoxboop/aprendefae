import { FAE } from "../../../../theme.js";
import { HAZ_INICIAL, hazResuelto, mostrarCorrecto } from "../../../secuencia/secuencia.js";
import { useNumeroQueSube } from "../verbos.jsx";
import { CALEJA } from "../../../../data/contabilidad.js";
import { PIEZA_DEBE_Y_HABER, transaccionDelEjemploDos } from "../../../../data/contabilidadDebeHaber.js";
import { P3_ID, P3_OBJETIVO, P3_TEXTOS as T, P3_ALTO_FIGURA } from "../../../../data/contabilidadT2Secuencia.js";
import {
  BLANCO, LINEA, CONTORNO, SUAVE, pesos, suma, Raiz, Encabezado, Cifra, Lado, Control, Fila,
  responder, leerHaz, marcaDe, useBarajado, enOrden, colaInicial, colaResuelta, fichaActual, responderCola, marcaDestino,
} from "./secuenciaComun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · P3 «El debe y el haber» EN SECUENCIA — las figuras y la pieza.
 *
 * Forma: c-t2-3-watari-figuras.md §3 (9 pantallas), con el delta T2-7
 * (altoFigura 180 a 320 y 173 a 375; las tres opciones de la pantalla 7 sin
 * pastilla dentro). Objeto propio: la mesa de dos casos. Datos: cal-3 y cal-6
 * de CALEJA («Basado en el libro»), el pagaré cu6-pagare (p. 89) y las cuatro
 * cuentas de la exploración (pp. 90, 93 y 113).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const debeDe = (id) => CALEJA.transacciones.find((t) => t.id === id).asiento.debe[0];
const [MAQ, MAQ_MONTO] = debeDe("cal-3");
const [APORTES, APORTES_MONTO] = debeDe("cal-6");
/* El saldo de Aportes sociales antes de cal-6: lo que aportaron cal-1 y cal-5 (p. 93). */
const APORTES_ANTES = suma(CALEJA.transacciones.flatMap((t) => (t.id === "cal-6" ? [] : t.asiento.haber.filter(([c]) => c === APORTES).map(([, v]) => v))));
const CASO = [
  { cuenta: MAQ, monto: MAQ_MONTO, antes: 0, despues: MAQ_MONTO, sube: true },
  { cuenta: APORTES, monto: APORTES_MONTO, antes: APORTES_ANTES, despues: APORTES_ANTES - APORTES_MONTO, sube: false },
];

/* El saldo que cuenta hacia su valor nuevo. */
function Saldo({ valor, flecha, marca }) {
  const x = useNumeroQueSube(valor);
  return <Cifra chico marca={marca} valor={`Saldo ${pesos(x)}${flecha ? ` ${flecha}` : ""}`} />;
}

/* Una T de la mesa: el nombre, el debe y el haber, y el saldo debajo. */
function MesaT({ nombre, debe, haber, saldo, flecha, marca, children }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0 }}>
      <Encabezado nombre={nombre} chico />
      <div style={{ display: "flex", minHeight: "20px" }}>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>{debe !== undefined && <Cifra chico valor={pesos(debe)} />}</div>
        <div style={{ flex: "1 1 0", minWidth: 0, borderLeft: `2px solid ${LINEA}` }}>{haber !== undefined && <Cifra chico valor={pesos(haber)} />}</div>
      </div>
      {saldo !== undefined && <Saldo valor={saldo} flecha={flecha} marca={marca} />}
      {children}
    </div>
  );
}

/* La mesa de los dos casos de Caleja. `registrado`: los saldos ya cambiaron. */
function Mesa({ registrado }) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {CASO.map((c) => (
        <MesaT key={c.cuenta} nombre={c.cuenta} debe={c.monto} saldo={registrado ? c.despues : c.antes} flecha={registrado ? (c.sube ? "▲" : "▼") : null} />
      ))}
    </div>
  );
}

/* ─────────────── 0 · Apertura: la mesa con los dos registros ─────────────── */

function FiguraApertura({ primeraVez, reducido }) {
  return (
    <Raiz>
      <div className={primeraVez && !reducido ? "fae-t2s-llega" : undefined}><Mesa registrado={false} /></div>
    </Raiz>
  );
}

/* ─────────────── 1 · Haz sin calificar: ¿reaccionan igual? ─────────────── */

function FiguraMismoLado({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  return (
    <Raiz>
      <Mesa registrado={false} />
      <Fila style={{ marginTop: "10px" }}>
        {T.mismoLado.opciones.map((op) => (
          <Control key={op} onClick={() => setEstado({ elegida: op })} elegido={elegida === op}>{op}</Control>
        ))}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 2 · Míralo: «Registrar» y los saldos cuentan a su valor nuevo ─────────────── */

function FiguraEfectos({ estado, setEstado }) {
  const registrado = Boolean(estado?.registrado);
  return (
    <Raiz>
      <Mesa registrado={registrado} />
      {/* «Registrar»: lo aprobó Mello en T2-9 (el verbo del libro, y dice qué pasa). */}
      <Fila style={{ marginTop: "10px" }}><Control onClick={() => setEstado({ registrado: true })} disabled={registrado}>Registrar</Control></Fila>
    </Raiz>
  );
}

/* ─────────────── 3 · Haz de dos fichas: dónde vive cada cuenta ─────────────── */

const CASAS = ["Activo", "Pasivo + Patrimonio"];
const casaBuena = (k) => (k === 0 ? CASAS[0] : CASAS[1]);

function FichaCuenta({ texto, marca, clase }) {
  const borde = marca === "error" ? `2px dashed ${FAE.coral}` : marca === "bien" ? `2px solid ${BLANCO}` : `1px solid ${LINEA}`;
  return (
    <span className={clase} data-ficha={marca || undefined} style={{
      display: "block", padding: "1px 6px", borderRadius: "6px", border: borde, textAlign: "center",
      fontSize: "12px", lineHeight: "15px", color: marca === "error" ? FAE.coral : FAE.text, overflowWrap: "anywhere",
    }}>{texto}</span>
  );
}

function FiguraDondeVive({ estado, setEstado }) {
  const e = estado ?? colaInicial(CASO.length);
  const k = fichaActual(e);
  const dentro = (casa) => CASO.map((c, i) => {
    const r = e.cola[i];
    if (hazResuelto(r) && casaBuena(i) === casa) return <FichaCuenta key={c.cuenta} clase="fae-t2s-cae" texto={c.cuenta} marca={mostrarCorrecto(r) ? "bien" : undefined} />;
    if (!hazResuelto(r) && r.ultimo === "error" && e.destinos[i] === casa) return <FichaCuenta key={c.cuenta} clase="fae-t2s-cae" texto={c.cuenta} marca="error" />;
    return null;
  });
  return (
    <Raiz>
      <div style={{ minHeight: "21px", textAlign: "center" }}>
        {k >= 0 && <span key={k} className="fae-t2s-llega" data-ficha-actual style={{ display: "inline-block" }}><FichaCuenta texto={CASO[k].cuenta} /></span>}
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: "6px", marginTop: "6px" }}>
        {CASAS.map((casa, n) => (
          <div key={casa} style={{ display: "contents" }}>
            {n === 1 && <span aria-hidden="true" style={{ alignSelf: "center", fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700 }}>=</span>}
            <Lado onClick={() => { if (k >= 0) responderCola(setEstado, (i, d) => casaBuena(i) === d, casa); }} etiqueta={casa} disabled={k < 0}
              marca={marcaDestino(e, casa, casaBuena)} style={{ minHeight: "76px", justifyContent: "flex-start" }}>
              <span style={{ textAlign: "center", fontSize: "12px", lineHeight: "15px", fontWeight: 700 }}>{casa}</span>
              <span style={{ textAlign: "center", fontSize: "12px", lineHeight: "15px", color: SUAVE }}>{n === 0 ? "izquierda" : "derecha"}</span>
              {dentro(casa)}
            </Lado>
          </div>
        ))}
      </div>
    </Raiz>
  );
}

/* ─────────────── 4 · Haz calificado: la trampa del préstamo ─────────────── */

/*
 * El préstamo de los datos (Mello T2-9, S10): el monto es el pagaré cu6-pagare
 * (p. 89), y la Caja de antes es el saldo inicial de Caja en la exploración
 * (p. 90, que ya trae el pagaré) menos ese pagaré.
 */
const PAGARE = transaccionDelEjemploDos();
const PRESTAMO_MONTO = PAGARE.asiento.debe.find(([c]) => c === "Caja")[1];
const PRESTAMO = {
  monto: PRESTAMO_MONTO,
  cajaAntes: PIEZA_DEBE_Y_HABER.exploracion.cuentas.find((c) => c.cuenta === "Caja").saldoInicial - PRESTAMO_MONTO,
};

function FiguraTrampa({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const [gano, deuda] = T.trampa.opciones;
  const orden = useBarajado(estado, setEstado, 2);
  return (
    <Raiz>
      <div style={{ display: "flex", gap: "10px" }}>
        <MesaT nombre="Caja" debe={PRESTAMO.monto} saldo={PRESTAMO.cajaAntes + PRESTAMO.monto} flecha="▲" />
        <MesaT nombre="Documentos por pagar" haber={verdad ? PRESTAMO.monto : undefined} saldo={verdad ? PRESTAMO.monto : 0} flecha={verdad ? "▲" : null} marca={verdad ? "bien" : undefined}>
          {error && <Cifra chico clase="fae-t2s-cae" marca="error" valor={`Ingreso ${pesos(PRESTAMO.monto)}`} />}
        </MesaT>
      </div>
      <Fila style={{ marginTop: "10px" }}>
        {enOrden([gano, deuda], orden).map((op) => (
          <Control key={op} chico onClick={() => { if (!resuelto) responder(setEstado, op === deuda, op); }} elegido={e.eleccion === op} marca={marcaDe(e, op, deuda)}>{op}</Control>
        ))}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 5 · Míralo: una ficha de $100 en Gastos y otra en Ingresos ─────────────── */

/* La ficha de $100: la primera de las fichas de «Prueba tú» (Mello T2-9, S10). */
const FICHA_100 = T.pruebaTu.fichas[0];

function FiguraGastosIngresos({ estado, setEstado }) {
  const sueltas = estado?.sueltas ?? [];
  const soltar = (c) => setEstado({ sueltas: sueltas.includes(c) ? sueltas : [...sueltas, c] });
  const gasto = sueltas.includes("Gastos de operación");
  const ingreso = sueltas.includes("Ingresos por servicios");
  const cambio = (ingreso ? FICHA_100 : 0) - (gasto ? FICHA_100 : 0);
  return (
    <Raiz>
      <div style={{ display: "flex", gap: "8px" }}>
        {[["Gastos de operación", gasto, "debe"], ["Ingresos por servicios", ingreso, "haber"]].map(([c, ya, lado]) => (
          <Lado key={c} onClick={() => soltar(c)} etiqueta={c} elegido={ya} style={{ padding: "4px" }}>
            <MesaT nombre={c} debe={lado === "debe" && ya ? FICHA_100 : undefined} haber={lado === "haber" && ya ? FICHA_100 : undefined} />
          </Lado>
        ))}
      </div>
      <p data-patrimonio style={{ margin: "8px 0 0", textAlign: "center", fontSize: "14px", lineHeight: "20px", fontVariantNumeric: "tabular-nums" }}>
        Patrimonio {cambio > 0 ? "+" : ""}{pesos(cambio)} {cambio > 0 ? "▲" : cambio < 0 ? "▼" : ""}
      </p>
    </Raiz>
  );
}

/* ─────────────── 6 · Míralo: prueba tú, cuatro saldos en cifras ─────────────── */

const CUENTAS_6 = PIEZA_DEBE_Y_HABER.exploracion.cuentas;
/* Crece por el debe: activo y gasto. Por el haber: patrimonio e ingreso (la regla de P3·3 y P3·5). */
const CRECE_DEBE = new Set(["Caja", "Gastos de operación"]);
const PRUEBA_INICIAL = { cuenta: 0, ficha: T.pruebaTu.fichas[0], saldos: CUENTAS_6.map((c) => c.saldoInicial) };

function FiguraPruebaTu({ estado, setEstado }) {
  const s = estado ?? PRUEBA_INICIAL;
  const soltar = (lado) => setEstado((antes) => {
    const a = antes ?? s;
    const c = CUENTAS_6[a.cuenta];
    const signo = (lado === "debe") === CRECE_DEBE.has(c.cuenta) ? 1 : -1;
    return { ...a, saldos: a.saldos.map((v, i) => (i === a.cuenta ? v + signo * a.ficha : v)), ultimo: { cuenta: a.cuenta, lado } };
  });
  return (
    <Raiz>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {CUENTAS_6.map((c, i) => (
          <button key={c.cuenta} type="button" className="fae-t2s-boton" onClick={() => setEstado({ ...s, cuenta: i })} aria-pressed={s.cuenta === i ? "true" : "false"}
            style={{ minHeight: "44px", minWidth: 0, padding: "3px 6px", borderRadius: "8px", border: `1px solid ${s.cuenta === i ? BLANCO : CONTORNO}`, background: s.cuenta === i ? "rgba(248,249,250,0.06)" : "transparent", color: FAE.text, cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}>
            <span style={{ display: "block", fontSize: "12px", lineHeight: "15px", fontWeight: 700, overflowWrap: "anywhere" }}>{c.cuenta}</span>
            <span data-saldo style={{ display: "block", fontSize: "12px", lineHeight: "15px", fontVariantNumeric: "tabular-nums", color: SUAVE }}>{pesos(s.saldos[i])}</span>
          </button>
        ))}
      </div>
      <Fila style={{ gap: "4px" }}>
        {T.pruebaTu.fichas.map((f) => (
          <Control key={f} chico onClick={() => setEstado({ ...s, ficha: f })} elegido={s.ficha === f} style={{ padding: "0 2px", fontSize: "12px" }}>{pesos(f)}</Control>
        ))}
        {/* «Debe» y «Haber», y las fichas: los aprobó Mello en T2-9 (el destino de la ficha, en neutro). */}
        <Control chico onClick={() => soltar("debe")} style={{ padding: "0 2px", fontSize: "12px" }}>Debe</Control>
        <Control chico onClick={() => soltar("haber")} style={{ padding: "0 2px", fontSize: "12px" }}>Haber</Control>
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 7 · Haz de tres opciones: ¿por qué? (la pregunta de cierre de Near) ─────────────── */

function MesaEnLinea() {
  return (
    <p data-mesa-linea style={{ margin: 0, textAlign: "center", fontSize: "12px", lineHeight: "16px", fontVariantNumeric: "tabular-nums", color: SUAVE }}>
      {CASO.map((c) => `${c.cuenta} ${pesos(c.despues)} ${c.sube ? "▲" : "▼"}`).join(" · ")}
    </p>
  );
}

function FiguraPorQue({ estado, setEstado }) {
  const { e, resuelto } = leerHaz(estado);
  const buena = T.porQue.opciones[T.porQue.correcta];
  const orden = useBarajado(estado, setEstado, T.porQue.opciones.length);
  return (
    <Raiz>
      <MesaEnLinea />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
        {enOrden(T.porQue.opciones, orden).map((op) => (
          <Control key={op} chico onClick={() => { if (!resuelto) responder(setEstado, op === buena, op); }} elegido={e.eleccion === op} marca={marcaDe(e, op, buena)}
            style={{ flex: "none", width: "100%", borderRadius: "12px", textAlign: "left", justifyContent: "flex-start" }}>{op}</Control>
        ))}
      </div>
    </Raiz>
  );
}

/* ─────────────── 8 · Cierre: la respuesta pegada a la mesa final ─────────────── */

function FiguraCierre() {
  return <Raiz><Mesa registrado /></Raiz>;
}

/* ─────────────── la pieza ─────────────── */

const devolucionDe = (t) => () => ({ pista: t.pista, porque: t.porque, consecuencia: t.consecuencia ?? null });

/* P3·7: un porqué por opción mala (Mello T2-9, S6): «a la derecha» no es la misma confusión que «en el haber». */
const devolucionPorQue = (estado) => ({
  pista: T.porQue.pista,
  porque: estado?.eleccion === T.porQue.opciones[0] ? T.porQue.porqueDerecha : T.porQue.porque,
  consecuencia: null,
});

/* P3·3: la frase de consecuencia es la de Maquinaria (Watari T2-7); Aportes sociales no trae la suya. */
const devolucionDondeVive = (estado) => ({
  pista: T.dondeVive.pista,
  porque: T.dondeVive.porque,
  consecuencia: (estado?.item ?? 0) === 0 ? T.dondeVive.consecuenciaMaquinaria : null,
});

export const PIEZA_P3 = {
  id: P3_ID,
  objetivo: P3_OBJETIVO,
  altoFigura: P3_ALTO_FIGURA,
  pantallas: [
    { id: "objetivo", tipo: "apertura", titular: T.apertura.titular, apoyo: T.apertura.apoyo, Figura: FiguraApertura, nombreFigura: "Maquinaria y Aportes sociales con $50.000 en el debe" },
    {
      id: "mismo-lado", tipo: "haz", titular: T.mismoLado.titular, apoyo: T.mismoLado.apoyo, razon: T.mismoLado.razon,
      Figura: FiguraMismoLado, nombreFigura: "Las cuentas Maquinaria y Aportes sociales", estadoInicial: { elegida: null },
      prediccion: true, resuelta: (e) => Boolean(e?.elegida), opciones: T.mismoLado.opciones,
    },
    { id: "efectos-opuestos", tipo: "miralo", titular: T.efectos.titular, apoyo: T.efectos.apoyo, Figura: FiguraEfectos, nombreFigura: "Los saldos de Maquinaria y de Aportes sociales", estadoInicial: { registrado: false } },
    {
      id: "donde-vive", tipo: "haz", titular: T.dondeVive.titular, apoyo: T.dondeVive.apoyo, razon: T.dondeVive.razon,
      Figura: FiguraDondeVive, nombreFigura: "Las dos casas de la ecuación", estadoInicial: colaInicial(CASO.length), resuelta: colaResuelta,
      devolucion: devolucionDondeVive, fichas: CASO.map((c) => c.cuenta), destinos: CASAS, buenoDe: casaBuena, malaDe: (i) => CASAS.find((c) => c !== casaBuena(i)),
    },
    {
      id: "la-trampa", tipo: "haz", titular: T.trampa.titular, apoyo: T.trampa.apoyo, razon: T.trampa.razon,
      Figura: FiguraTrampa, nombreFigura: "Caja y Documentos por pagar con el préstamo", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.trampa), opciones: T.trampa.opciones, buena: T.trampa.opciones[1],
    },
    { id: "gastos-e-ingresos", tipo: "miralo", titular: T.gastosIngresos.titular, apoyo: T.gastosIngresos.apoyo, Figura: FiguraGastosIngresos, nombreFigura: "Gastos de operación, Ingresos por servicios y el patrimonio", estadoInicial: { sueltas: [] } },
    { id: "prueba-tu", tipo: "miralo", titular: T.pruebaTu.titular, apoyo: T.pruebaTu.apoyo, Figura: FiguraPruebaTu, nombreFigura: "Cuatro cuentas con su saldo", estadoInicial: PRUEBA_INICIAL },
    {
      id: "por-que", tipo: "haz", titular: T.porQue.titular, apoyo: T.porQue.apoyo, razon: T.porQue.razon,
      Figura: FiguraPorQue, nombreFigura: "Los saldos finales de Maquinaria y de Aportes sociales", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionPorQue, opciones: T.porQue.opciones, buena: T.porQue.opciones[T.porQue.correcta],
    },
    { id: "cierre", tipo: "cierre", titular: T.cierre.titular, apoyo: T.cierre.apoyo, Figura: FiguraCierre, nombreFigura: "La mesa final de Maquinaria y Aportes sociales", ...(T.cierre.pie ? { razon: T.cierre.pie } : {}) },
  ],
};
