import { FAE } from "../../../../theme.js";
import { HAZ_INICIAL, hazResuelto, mostrarCorrecto } from "../../../secuencia/secuencia.js";
import { useNumeroQueSube } from "../verbos.jsx";
import { LAVADO_DE_AUTOS, CALEJA } from "../../../../data/contabilidad.js";
import { P4_ID, P4_OBJETIVO, P4_TEXTOS as T, P4_ALTO_FIGURA } from "../../../../data/contabilidadT2Secuencia.js";
import {
  BLANCO, LINEA, SUAVE, pesos, suma, Raiz, Lado, Control, Fila,
  responder, leerHaz, marcaDe, colaInicial, colaResuelta, fichaActual, responderCola, marcaDestino,
} from "./secuenciaComun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · P4 «La partida doble y las dos reglas» EN SECUENCIA — figuras y pieza.
 *
 * Forma: c-t2-3-watari-figuras.md §4 (10 pantallas), con el delta T2-7
 * (altoFigura 181 a 320 y 178 a 375; sin la línea de estado bajo «Sí, lo
 * descuadra» y «No lo descuadra»). Objeto propio: la balanza de totales con
 * nombres. P4·8 y P4·9 van con ene-04 (1 contra 2, $4.800), por el delta T2-3
 * de Near que L aceptó, aunque la maqueta de Watari diga ene-03. P4·7 sigue
 * con ene-30 y ene-03. Datos: cal-2 de CALEJA y Lavado (pp. 98-101).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const asiento = (id) => LAVADO_DE_AUTOS.transacciones.find((t) => t.id === id).asiento;
const CAL2 = CALEJA.transacciones.find((t) => t.id === "cal-2").asiento;
const [EQUIPO, EQUIPO_MONTO] = CAL2.debe[0];
const [CXP, CXP_MONTO] = CAL2.haber[0];
const ENE30 = asiento("ene-30");
const ENE03 = asiento("ene-03");
const ENE04 = asiento("ene-04");

/* Bancos antes del 30 de enero: todo lo que movió Bancos del 2 al 26 de enero (Watari: $2.250). */
const BANCOS_ANTES = suma(LAVADO_DE_AUTOS.transacciones.filter((t) => t.id !== "ene-30").map((t) =>
  suma(t.asiento.debe.filter(([c]) => c === "Bancos").map(([, v]) => v)) - suma(t.asiento.haber.filter(([c]) => c === "Bancos").map(([, v]) => v))));
/* La hipoteca antes del pago: la de ene-03. */
const HIPOTECA_ANTES = ENE03.haber.find(([c]) => c === "Hipoteca por pagar")[1];
const PAGO = ENE30.debe[0][1];

/* ─────────────── la balanza ─────────────── */

/* Un renglón dentro de un platillo: nombre y cifra; `marca` "error" (coral punteado) o "bien" (borde blanco). */
function Renglon({ nombre, valor, marca, clase }) {
  /* Sin marca no lleva borde: 4 px menos por renglón (la figura cabe en su altoFigura). */
  const borde = marca === "error" ? `2px dashed ${FAE.coral}` : marca === "bien" ? `2px solid ${BLANCO}` : "0";
  return (
    <span className={clase} data-renglon={marca || undefined} style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "4px", padding: marca ? "0 4px" : "0 6px", borderRadius: "6px", border: borde,
      fontSize: "12px", lineHeight: "15px", color: marca === "error" ? FAE.coral : FAE.text,
    }}>
      <span style={{ minWidth: 0, overflowWrap: "anywhere", textAlign: "left" }}>{nombre}</span>
      {valor !== undefined && <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{typeof valor === "number" ? pesos(valor) : valor}</span>}
    </span>
  );
}

function Total({ valor }) {
  const x = useNumeroQueSube(valor ?? 0);
  return (
    <span data-total style={{ display: "block", marginTop: 0, paddingTop: "1px", borderTop: `1px solid ${LINEA}`, textAlign: "right", fontSize: "12px", lineHeight: "15px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
      {valor === null ? "$?" : pesos(x)}
    </span>
  );
}

/*
 * La balanza: un brazo que se inclina (transform, una vez) y dos platillos.
 * `inclina`: -1 baja la izquierda, 1 baja la derecha, 0 nivelada. Un platillo
 * con onClick es un botón (destino).
 */
function Balanza({ izq, der, inclina = 0 }) {
  const platillo = (p, k) => {
    const contenido = (
      <>
        <span style={{ display: "block", textAlign: "center", fontSize: "12px", lineHeight: "15px", fontWeight: 700 }}>{p.titulo}</span>
        {p.children}
        {p.total !== undefined && <Total valor={p.total} />}
      </>
    );
    const baja = inclina === (k === 0 ? -1 : 1) ? 6 : 0;
    const estilo = { flex: "1 1 0", minWidth: 0, transform: `translateY(${baja}px)`, justifyContent: "flex-start", minHeight: "52px" };
    return p.onClick
      ? <Lado key={k} onClick={p.onClick} etiqueta={p.etiqueta ?? p.titulo} marca={p.marca} disabled={p.disabled} style={estilo}>{contenido}</Lado>
      : <div key={k} className="fae-t2s-gira" style={{ ...estilo, display: "flex", flexDirection: "column", gap: "2px", padding: "4px", border: `1px solid ${LINEA}`, borderRadius: "8px", boxSizing: "border-box" }}>{contenido}</div>;
  };
  return (
    <div data-balanza={inclina === 0 ? "nivelada" : "inclinada"}>
      <div aria-hidden="true" style={{ position: "relative", height: "10px" }}>
        <span className="fae-t2s-gira" style={{ position: "absolute", left: "10%", right: "10%", top: "3px", height: "2px", background: LINEA, transform: `rotate(${inclina * -3}deg)` }} />
        <span style={{ position: "absolute", left: "50%", top: "2px", marginLeft: "-6px", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: `8px solid ${LINEA}` }} />
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        {platillo(izq, 0)}
        {platillo(der, 1)}
      </div>
    </div>
  );
}

const A = "Activo";
const PPT = "Pasivo + Patrimonio";

/* ─────────────── 0 · Apertura: la balanza vacía y nivelada ─────────────── */

function FiguraApertura({ primeraVez, reducido }) {
  return (
    <Raiz>
      <div className={primeraVez && !reducido ? "fae-t2s-llega" : undefined}>
        <Balanza izq={{ titulo: A }} der={{ titulo: PPT }} />
      </div>
    </Raiz>
  );
}

/* ─────────────── 1 · Haz sin calificar: una sola línea ─────────────── */

function FiguraUnaLinea({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  const anotado = elegida !== null;
  return (
    <Raiz>
      <Balanza inclina={anotado ? -1 : 0}
        izq={{ titulo: A, children: anotado && <Renglon clase="fae-t2s-cae" nombre={EQUIPO} valor={EQUIPO_MONTO} /> }}
        der={{ titulo: PPT }} />
      <Fila style={{ marginTop: "12px" }}>
        {T.unaLinea.opciones.map((op) => <Control key={op} chico onClick={() => setEstado({ elegida: op })} elegido={elegida === op}>{op}</Control>)}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 2 · Míralo: la regla trae la segunda línea ─────────────── */

function FiguraPartidaDoble({ estado, setEstado }) {
  const vista = Boolean(estado?.vista);
  return (
    <Raiz>
      <Balanza inclina={-1} izq={{ titulo: A, children: <Renglon nombre={EQUIPO} valor={EQUIPO_MONTO} /> }} der={{ titulo: PPT }} />
      <div style={{ minHeight: "21px", marginTop: "8px" }}>
        {vista && <span className="fae-t2s-cae" data-segunda-linea style={{ display: "block", border: `1px solid ${LINEA}`, borderRadius: "6px" }}><Renglon nombre={CXP} valor={CXP_MONTO} /></span>}
      </div>
      <Fila style={{ marginTop: "6px" }}><Control onClick={() => setEstado({ vista: true })} disabled={vista}>{T.partidaDoble.titular}</Control></Fila>
    </Raiz>
  );
}

/* ─────────────── 3 · Haz calificado: la balanza ─────────────── */

function FiguraBalanza({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const tocar = (p) => { if (!resuelto) responder(setEstado, p === PPT, p); };
  const deuda = (marca) => <Renglon clase="fae-t2s-cae" nombre={CXP} valor={CXP_MONTO} marca={marca} />;
  return (
    <Raiz>
      <div style={{ minHeight: "19px", marginBottom: "2px" }}>
        {!verdad && !error && <span style={{ display: "block", border: `1px solid ${LINEA}`, borderRadius: "6px" }}><Renglon nombre={CXP} valor={CXP_MONTO} /></span>}
      </div>
      <Balanza inclina={verdad ? 0 : -1}
        izq={{ titulo: A, onClick: () => tocar(A), marca: marcaDe(e, A, PPT), children: <>
          <Renglon nombre={EQUIPO} valor={EQUIPO_MONTO} />
          {error && deuda("error")}
        </> }}
        der={{ titulo: PPT, onClick: () => tocar(PPT), marca: marcaDe(e, PPT, PPT), children: verdad && deuda(mostrarCorrecto(e) ? "bien" : undefined) }} />
    </Raiz>
  );
}

/* ─────────────── 4 · Míralo: primera regla ─────────────── */

const DEBE_G = "Crece por el debe";
const HABER_G = "Crece por el haber";

function FiguraPrimeraRegla({ estado, setEstado }) {
  const dentro = estado?.dentro ?? [];
  const meter = (f) => setEstado({ dentro: dentro.includes(f) ? dentro : [...dentro, f] });
  const fuera = T.primeraRegla.familias.filter((f) => !dentro.includes(f));
  return (
    <Raiz>
      <Fila style={{ marginTop: 0, minHeight: "44px", gap: "6px" }}>
        {fuera.map((f) => <Control key={f} chico onClick={() => meter(f)}>{f}</Control>)}
      </Fila>
      <div style={{ marginTop: "8px" }}>
        <Balanza
          izq={{ titulo: DEBE_G, children: dentro.map((f) => <Renglon key={f} clase="fae-t2s-cae" nombre={f} />) }}
          der={{ titulo: HABER_G }} />
      </div>
    </Raiz>
  );
}

/* ─────────────── 5 · Haz de tres fichas: segunda regla ─────────────── */

const FAMILIAS_5 = T.segundaRegla.familias;
const grupoBueno = () => HABER_G;

function FiguraSegundaRegla({ estado, setEstado }) {
  const e = estado ?? colaInicial(FAMILIAS_5.length);
  const k = fichaActual(e);
  const dentro = (g) => FAMILIAS_5.map((f, i) => {
    const r = e.cola[i];
    if (hazResuelto(r) && g === HABER_G) return <Renglon key={f} clase="fae-t2s-cae" nombre={f} marca={mostrarCorrecto(r) ? "bien" : undefined} />;
    if (!hazResuelto(r) && r.ultimo === "error" && e.destinos[i] === g) return <Renglon key={f} clase="fae-t2s-cae" nombre={f} marca="error" />;
    return null;
  });
  const tocar = (g) => { if (k >= 0) responderCola(setEstado, (i, d) => grupoBueno(i) === d, g); };
  return (
    <Raiz>
      <div style={{ minHeight: "21px", textAlign: "center" }}>
        {k >= 0 && <span key={k} className="fae-t2s-llega" data-ficha-actual style={{ display: "inline-block", minWidth: "96px", border: `1px solid ${LINEA}`, borderRadius: "6px" }}><Renglon nombre={FAMILIAS_5[k]} /></span>}
      </div>
      <div style={{ marginTop: "4px" }}>
        <Balanza
          izq={{ titulo: DEBE_G, onClick: () => tocar(DEBE_G), disabled: k < 0, marca: marcaDestino(e, DEBE_G, grupoBueno), children: <>
            <span style={{ display: "block", fontSize: "12px", lineHeight: "15px", color: SUAVE, textAlign: "center" }}>{T.primeraRegla.familias.join(" · ")}</span>
            {dentro(DEBE_G)}
          </> }}
          der={{ titulo: HABER_G, onClick: () => tocar(HABER_G), disabled: k < 0, marca: marcaDestino(e, HABER_G, grupoBueno), children: dentro(HABER_G) }} />
      </div>
    </Raiz>
  );
}

/* ─────────────── 6 · Haz calificado: un pago, dos bajas ─────────────── */

function FiguraUnPago({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const [soloBancos, soloHipoteca, lasDos] = T.unPago.opciones;
  const bancos = verdad ? BANCOS_ANTES - PAGO : BANCOS_ANTES;
  const hipoteca = verdad ? HIPOTECA_ANTES - PAGO : HIPOTECA_ANTES;
  return (
    <Raiz>
      <Balanza
        izq={{ titulo: A, children: <>
          <Renglon nombre="Bancos" valor={bancos} marca={verdad ? "bien" : undefined} />
          {error && e.eleccion === soloHipoteca && <Renglon clase="fae-t2s-cae" nombre="Bancos" valor={BANCOS_ANTES + PAGO} marca="error" />}
        </> }}
        der={{ titulo: PPT, children: <>
          <Renglon nombre="Hipoteca por pagar" valor={hipoteca} marca={verdad ? "bien" : undefined} />
          {error && e.eleccion === soloBancos && <Renglon clase="fae-t2s-cae" nombre="Hipoteca por pagar" valor={HIPOTECA_ANTES + PAGO} marca="error" />}
        </> }} />
      <Fila style={{ marginTop: "8px", gap: "4px" }}>
        {T.unPago.opciones.map((op) => (
          <Control key={op} chico onClick={() => { if (!resuelto) responder(setEstado, op === lasDos, op); }} elegido={e.eleccion === op} marca={marcaDe(e, op, lasDos)}
            style={{ padding: "0 4px", fontSize: "12px", lineHeight: "15px", borderRadius: "14px" }}>{op}</Control>
        ))}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 7 · Míralo: simple o compuesto ─────────────── */

const DEBE_T = "Debe";
const HABER_T = "Haber";
const renglones = (lado) => lado.map(([c, v]) => <Renglon key={c} nombre={c} valor={v} />);
const totalDe = (lado) => suma(lado.map(([, v]) => v));

function FiguraSimpleCompuesto({ estado, setEstado }) {
  const cual = estado?.cual ?? T.simpleCompuesto.opciones[0];
  const a = cual === T.simpleCompuesto.opciones[0] ? ENE30 : ENE03;
  return (
    <Raiz>
      <Fila style={{ marginTop: 0 }}>
        {T.simpleCompuesto.opciones.map((op) => <Control key={op} chico onClick={() => setEstado({ cual: op })} elegido={cual === op}>{op}</Control>)}
      </Fila>
      <div key={cual} className="fae-t2s-cae" style={{ marginTop: "2px" }}>
        <Balanza izq={{ titulo: DEBE_T, children: renglones(a.debe), total: totalDe(a.debe) }} der={{ titulo: HABER_T, children: renglones(a.haber), total: totalDe(a.haber) }} />
      </div>
    </Raiz>
  );
}

/* ─────────────── 8 · Haz calificado: ¿muchas cuentas descuadran? (ene-04) ─────────────── */

function FiguraDescuadran({ estado, setEstado }) {
  const { e, resuelto, verdad } = leerHaz(estado);
  const [si, no] = T.descuadran.opciones;
  return (
    <Raiz>
      <Balanza
        izq={{ titulo: DEBE_T, children: renglones(ENE04.debe), total: verdad ? totalDe(ENE04.debe) : null }}
        der={{ titulo: HABER_T, children: renglones(ENE04.haber), total: verdad ? totalDe(ENE04.haber) : null }} />
      <Fila style={{ marginTop: "8px" }}>
        {[si, no].map((op) => (
          <Control key={op} chico onClick={() => { if (!resuelto) responder(setEstado, op === no, op); }} elegido={e.eleccion === op} marca={marcaDe(e, op, no)}>{op}</Control>
        ))}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 9 · Cierre: ene-04 nivelada, con sus totales ─────────────── */

function FiguraCierre() {
  return (
    <Raiz>
      <Balanza izq={{ titulo: DEBE_T, children: renglones(ENE04.debe), total: totalDe(ENE04.debe) }} der={{ titulo: HABER_T, children: renglones(ENE04.haber), total: totalDe(ENE04.haber) }} />
    </Raiz>
  );
}

/* ─────────────── la pieza ─────────────── */

const devolucionDe = (t) => () => ({ pista: t.pista, porque: t.porque, consecuencia: t.consecuencia ?? null });

/* P4·5: la devolución nombra la familia en juego (Near T2-7 §6); la consecuencia es la de Ingresos (Watari T2-7). */
const devolucionSegundaRegla = (estado) => {
  const f = FAMILIAS_5[estado?.item ?? 0];
  return { pista: T.segundaRegla.pista, porque: T.segundaRegla.porque.replace("{Familia}", f), consecuencia: f === "Ingresos" ? T.segundaRegla.consecuenciaIngresos : null };
};

/* P4·6: cada opción mala tiene su devolución (Near v2). */
const devolucionUnPago = (estado) => {
  const soloBancos = estado?.eleccion === T.unPago.opciones[0];
  return {
    pista: T.unPago.pista,
    porque: soloBancos ? T.unPago.porqueSoloBancos : T.unPago.porqueSoloHipoteca,
    consecuencia: soloBancos ? T.unPago.consecuenciaSoloBancos : null,
  };
};

export const PIEZA_P4 = {
  id: P4_ID,
  objetivo: P4_OBJETIVO,
  altoFigura: P4_ALTO_FIGURA,
  pantallas: [
    { id: "objetivo", tipo: "apertura", titular: T.apertura.titular, apoyo: T.apertura.apoyo, Figura: FiguraApertura, nombreFigura: "La balanza de la ecuación, vacía y nivelada" },
    {
      id: "una-sola-linea", tipo: "haz", titular: T.unaLinea.titular, apoyo: T.unaLinea.apoyo, razon: T.unaLinea.razon,
      Figura: FiguraUnaLinea, nombreFigura: "La balanza de la ecuación de Caleja", estadoInicial: { elegida: null },
      prediccion: true, resuelta: (e) => Boolean(e?.elegida), opciones: T.unaLinea.opciones,
    },
    { id: "partida-doble", tipo: "miralo", titular: T.partidaDoble.titular, apoyo: T.partidaDoble.apoyo, textual: true, Figura: FiguraPartidaDoble, nombreFigura: "La balanza con el equipo en el activo", estadoInicial: { vista: false } },
    {
      id: "la-balanza", tipo: "haz", titular: T.balanza.titular, apoyo: T.balanza.apoyo, razon: T.balanza.razon,
      Figura: FiguraBalanza, nombreFigura: "La balanza con sus dos platillos", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.balanza), opciones: [A, PPT], buena: PPT,
    },
    { id: "primera-regla", tipo: "miralo", titular: T.primeraRegla.titular, apoyo: T.primeraRegla.apoyo, Figura: FiguraPrimeraRegla, nombreFigura: "Los grupos que crecen por el debe y por el haber", estadoInicial: { dentro: [] } },
    {
      id: "segunda-regla", tipo: "haz", titular: T.segundaRegla.titular, apoyo: T.segundaRegla.apoyo, razon: T.segundaRegla.razon,
      Figura: FiguraSegundaRegla, nombreFigura: "Los grupos que crecen por el debe y por el haber", estadoInicial: colaInicial(FAMILIAS_5.length), resuelta: colaResuelta,
      devolucion: devolucionSegundaRegla, fichas: FAMILIAS_5, destinos: [DEBE_G, HABER_G], buenoDe: grupoBueno, malaDe: () => DEBE_G,
    },
    {
      id: "un-pago-dos-bajas", tipo: "haz", titular: T.unPago.titular, apoyo: T.unPago.apoyo, razon: T.unPago.razon,
      Figura: FiguraUnPago, nombreFigura: "La balanza con Bancos y Hipoteca por pagar", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionUnPago, opciones: T.unPago.opciones, buena: T.unPago.opciones[2],
    },
    { id: "simple-o-compuesto", tipo: "miralo", titular: T.simpleCompuesto.titular, apoyo: T.simpleCompuesto.apoyo, Figura: FiguraSimpleCompuesto, nombreFigura: "Un asiento en la balanza del debe y el haber", estadoInicial: { cual: T.simpleCompuesto.opciones[0] } },
    {
      id: "muchas-cuentas", tipo: "haz", titular: T.descuadran.titular, apoyo: T.descuadran.apoyo, razon: T.descuadran.razon,
      Figura: FiguraDescuadran, nombreFigura: "El asiento del 4 de enero en la balanza", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.descuadran), opciones: T.descuadran.opciones, buena: T.descuadran.opciones[1],
    },
    { id: "cierre", tipo: "cierre", titular: T.cierre.titular, apoyo: T.cierre.apoyo, Figura: FiguraCierre, nombreFigura: "El asiento del 4 de enero, nivelado" },
  ],
};
