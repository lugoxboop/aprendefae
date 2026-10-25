import { FAE } from "../../../../theme.js";
import { HAZ_INICIAL, hazResuelto } from "../../../secuencia/secuencia.js";
import { useNumeroQueSube } from "../verbos.jsx";
import { LAVADO_DE_AUTOS } from "../../../../data/contabilidad.js";
import { P1_ID, P1_OBJETIVO, P1_TEXTOS as T, P1_ALTO_FIGURA } from "../../../../data/contabilidadT2Secuencia.js";
import {
  DEBE, HABER, LINEA, SUAVE, ESTILOS, pesos, suma, raiz, Encabezado, Cifra, Rotulo, Lado, Control, Fila,
  responder, leerHaz, marcaDe,
} from "./secuenciaComun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · P1 «De qué está hecha una cuenta» EN SECUENCIA — las figuras y la pieza.
 *
 * Forma: c-t2-3-watari-figuras.md §1 (8 pantallas), con el delta T2-7
 * (altoFigura 183, la marca ✓/✕ en el control tocado). Textos:
 * contabilidadT2Secuencia.js. Contenedor: SecuenciaAprender (compartido, de
 * Erwin): aquí no hay ni contador, ni pastilla, ni botones de navegación
 * propios. El Haz calificado usa responderHaz / hazResuelto; la devolución
 * (consecuencia, pista, porqué) la declara cada Haz en `devolucion` y NO se
 * pinta dentro de la figura hasta #536.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─────────────── piezas de dibujo ─────────────── */

/* Las cifras del ejemplo de Caja (el mismo de la pieza vieja: «el ejemplo del libro»). */
const CAJA = { entra: [1000, 500], sale: [150] };

/* ─────────────── 0 · Apertura: la T sin raya y las tres fichas entran, una vez ─────────────── */

function FiguraApertura({ primeraVez, reducido }) {
  const anima = primeraVez && !reducido;
  const fichas = [...CAJA.entra, ...CAJA.sale];
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Caja" />
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
        {fichas.map((v, k) => (
          <span key={k} className={anima ? "fae-t2s-llega" : undefined} style={{
            animationDelay: anima ? `${120 * k}ms` : undefined, padding: "4px 10px", borderRadius: "8px", border: `1px solid ${LINEA}`,
            fontSize: "14px", lineHeight: "20px", fontVariantNumeric: "tabular-nums",
          }}>
            {pesos(v)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── 1 · Haz sin calificar: ¿de qué lado? ─────────────── */

function FiguraLado({ estado, setEstado }) {
  const lado = estado?.lado ?? null;
  const elegir = (l) => setEstado({ lado: l });
  const dentro = (l) => (lado === null ? [] : lado === l ? CAJA.entra : CAJA.sale);
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Caja" />
      {lado === null && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "6px 0 2px" }}>
          {[...CAJA.entra, ...CAJA.sale].map((v, k) => (
            <span key={k} style={{ padding: "0 8px", borderRadius: "6px", border: `1px solid ${LINEA}`, fontSize: "14px", lineHeight: "20px" }}>{pesos(v)}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {T.lado.opciones.map((op, k) => {
          const l = k === 0 ? "izq" : "der";
          return (
            <Lado key={op} onClick={() => elegir(l)} etiqueta={op} elegido={lado === l}>
              <span style={{ textAlign: "center", fontSize: "14px", fontWeight: 600, lineHeight: "20px" }}>{op}</span>
              {dentro(l).map((v, j) => <Cifra key={`${lado}-${j}`} clase="fae-t2s-cae" valor={pesos(v)} />)}
            </Lado>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── 2 · Míralo: qué registra una cuenta ─────────────── */

function FiguraCuenta({ estado, setEstado }) {
  const vistas = estado?.vistas ?? [];
  const tocar = (k) => setEstado({ vistas: vistas.includes(k) ? vistas : [...vistas, k] });
  const ficha = (k, v, que) => (
    <button key={k} type="button" className="fae-t2s-boton" onClick={() => tocar(k)} aria-pressed={vistas.includes(k) ? "true" : "false"} style={{
      minHeight: "44px", width: "100%", borderRadius: "8px", border: `1px solid rgba(248,249,250,0.32)`, background: "transparent",
      color: FAE.text, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "2px 6px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: "14px", lineHeight: "18px", fontVariantNumeric: "tabular-nums" }}>{pesos(v)}</span>
      {vistas.includes(k) && <span className="fae-t2s-cae" style={{ fontSize: "12px", lineHeight: "16px", color: SUAVE }}>{que}</span>}
    </button>
  );
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Caja" />
      <div style={{ display: "flex" }}>
        <Lado>
          {CAJA.entra.map((v, k) => <div key={k} style={{ marginTop: k ? "6px" : 0 }}>{ficha(`e${k}`, v, "aumento")}</div>)}
        </Lado>
        <Lado derecha>
          {CAJA.sale.map((v, k) => ficha(`s${k}`, v, "disminución"))}
        </Lado>
      </div>
    </div>
  );
}

/* ─────────────── 3 · Míralo: la raya baja y cada lado dice su nombre ─────────────── */

function FiguraDebeHaber({ estado, setEstado, primeraVez, reducido }) {
  const vistos = estado?.vistos ?? [];
  const ver = (l) => setEstado({ vistos: vistos.includes(l) ? vistos : [...vistos, l] });
  const lado = (l, cifras, derecha) => (
    <Lado onClick={() => ver(l)} etiqueta={derecha ? "Lado derecho" : "Lado izquierdo"} elegido={vistos.includes(l)} derecha={derecha}>
      <span style={{ minHeight: "16px" }}>{vistos.includes(l) && <span className="fae-t2s-cae" style={{ display: "block" }}><Rotulo lado={l}>{l === "debe" ? "DEBE" : "HABER"}</Rotulo></span>}</span>
      {cifras.map((v, k) => <Cifra key={k} valor={pesos(v)} />)}
    </Lado>
  );
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Caja" />
      <div style={{ position: "relative", display: "flex", gap: "8px", marginTop: "6px" }}>
        <span aria-hidden="true" className={primeraVez && !reducido ? "fae-t2s-raya-baja" : undefined}
          style={{ position: "absolute", left: "50%", top: "-6px", bottom: 0, width: "2px", marginLeft: "-1px", background: LINEA }} />
        {lado("debe", CAJA.entra, false)}
        {lado("haber", CAJA.sale, true)}
      </div>
    </div>
  );
}

/* ─────────────── 4 · Míralo: «Sumar» y cada total sube ─────────────── */

function Total({ valor }) {
  const x = useNumeroQueSube(valor ?? 0);
  return (
    <span style={{ display: "block", marginTop: "2px", paddingTop: "2px", borderTop: `1px solid ${LINEA}`, textAlign: "center", fontSize: "14px", lineHeight: "20px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: valor === null ? "transparent" : FAE.text }}>
      {valor === null ? "·" : pesos(x)}
    </span>
  );
}


function FiguraMovimientos({ estado, setEstado }) {
  const sumado = Boolean(estado?.sumado);
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Caja" />
      <div style={{ display: "flex" }}>
        <Lado>
          <Rotulo lado="debe">DEBE</Rotulo>
          {CAJA.entra.map((v, k) => <Cifra key={k} valor={pesos(v)} />)}
          <Total valor={sumado ? suma(CAJA.entra) : null} lado="debe" />
        </Lado>
        <Lado derecha>
          <Rotulo lado="haber">HABER</Rotulo>
          {CAJA.sale.map((v, k) => <Cifra key={k} valor={pesos(v)} />)}
          <span style={{ flex: 1 }} />
          <Total valor={sumado ? suma(CAJA.sale) : null} lado="haber" />
        </Lado>
      </div>
      <Fila><Control onClick={() => setEstado({ sumado: true })} disabled={sumado}>Sumar</Control></Fila>
    </div>
  );
}

/* ─────────────── 5 · Haz calificado: ¿de qué lado va el saldo? ─────────────── */

const SALDO_CAJA = suma(CAJA.entra) - suma(CAJA.sale);

function FiguraSaldo({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const tocar = (lado) => { if (!resuelto) responder(setEstado, lado === "debe", lado); };
  const saldoEn = (lado) => {
    if (verdad && lado === "debe") return <Cifra clase="fae-t2s-cae" valor={pesos(SALDO_CAJA)} marca="bien" />;
    if (error && lado === "haber") return <Cifra clase="fae-t2s-cae" valor={pesos(SALDO_CAJA)} marca="error" />;
    return <span style={{ minHeight: "24px" }} />;
  };
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Caja" />
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {["debe", "haber"].map((lado, k) => (
          <Lado key={lado} onClick={() => tocar(lado)} etiqueta={T.saldo.opciones[k]} elegido={e.eleccion === lado} marca={marcaDe(e, lado, "debe")}>
            <Rotulo lado={lado}>{T.saldo.opciones[k]}</Rotulo>
            <Cifra valor={pesos(lado === "debe" ? suma(CAJA.entra) : suma(CAJA.sale))} />
            {saldoEn(lado)}
          </Lado>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── 6 · Haz calificado: debe no es subir ─────────────── */

const LAVADO_CXP = LAVADO_DE_AUTOS.transacciones
  .filter((t) => ["Ene 8", "Ene 12", "Ene 18"].includes(t.fecha))
  .map((t) => ({
    fecha: t.fecha,
    debe: t.asiento.debe.find(([c]) => c === "Cuentas por pagar")?.[1] ?? null,
    haber: t.asiento.haber.find(([c]) => c === "Cuentas por pagar")?.[1] ?? null,
  }));
const CXP_ANTES = suma(LAVADO_CXP.map((m) => m.haber ?? 0));
const CXP_PAGO = suma(LAVADO_CXP.map((m) => m.debe ?? 0));

function SaldoCxp({ valor, marca }) {
  const x = useNumeroQueSube(valor);
  return <Cifra chico valor={`Saldo ${pesos(x)}`} marca={marca} />;
}

function FiguraDebeNoEsSubir({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const tocar = (op) => { if (!resuelto) responder(setEstado, op === "Baja", op); };
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Cuentas por pagar" />
      <div style={{ display: "flex" }}>
        <Lado>
          <Rotulo lado="debe">DEBE</Rotulo>
          {LAVADO_CXP.filter((m) => m.debe).map((m) => <Cifra chico key={m.fecha} fecha={m.fecha} valor={pesos(m.debe)} />)}
        </Lado>
        <Lado derecha>
          <Rotulo lado="haber">HABER</Rotulo>
          {LAVADO_CXP.filter((m) => m.haber).map((m) => <Cifra chico key={m.fecha} fecha={m.fecha} valor={pesos(m.haber)} />)}
          {/* La T dice la verdad (D3): el saldo cambia solo con la respuesta correcta; el error se dibuja punteado aparte. */}
          <SaldoCxp valor={verdad ? CXP_ANTES - CXP_PAGO : CXP_ANTES} marca={verdad ? "bien" : undefined} />
          {error && <Cifra chico clase="fae-t2s-cae" valor={`Saldo ${pesos(CXP_ANTES + CXP_PAGO)}`} marca="error" />}
        </Lado>
      </div>
      <Fila style={{ marginTop: "4px" }}>
        {T.debeNoEsSubir.opciones.map((op) => (
          <Control key={op} onClick={() => tocar(op)} elegido={e.eleccion === op} marca={marcaDe(e, op, "Baja")}>{op}</Control>
        ))}
      </Fila>
      {/* P1·6 va sin el selector Caja / Documentos por pagar del delta T2-3 (L, #471, 25-oct): la figura de T2-3, 183 px. */}
    </div>
  );
}

/* ─────────────── 7 · Cierre: «Siguiente» da el paso y el saldo de $20 cae en el debe ─────────────── */

const CIERRE = { debe: 50, haber: 30 };

function FiguraCierre({ paso }) {
  const listo = paso >= 1;
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Una cuenta" />
      <div style={{ display: "flex" }}>
        <Lado>
          <Rotulo lado="debe">DEBE</Rotulo>
          <Cifra valor={pesos(CIERRE.debe)} />
          {listo ? <Cifra clase="fae-t2s-cae" valor={`Saldo ${pesos(CIERRE.debe - CIERRE.haber)}`} marca="bien" /> : <span style={{ minHeight: "24px" }} />}
        </Lado>
        <Lado derecha>
          <Rotulo lado="haber">HABER</Rotulo>
          <Cifra valor={pesos(CIERRE.haber)} />
        </Lado>
      </div>
      {listo && <p className="fae-t2s-cae" data-frase-cierre style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: "20px", color: FAE.text }}>{T.cierre.frase}</p>}
    </div>
  );
}

/* ─────────────── la pieza ─────────────── */

/* La devolución de un Haz de una respuesta: la misma en cada error, para la banda de #536. */
const devolucionDe = (t) => (estado) => ({ pista: t.pista, porque: t.porque, consecuencia: t.consecuencia ?? null });

export const PIEZA_P1 = {
  id: P1_ID,
  /* S1: la oración completa de la v2; en pantalla va repartida entre titular y apoyo (Near T2-7). */
  objetivo: P1_OBJETIVO,
  altoFigura: P1_ALTO_FIGURA,
  pantallas: [
    { id: "objetivo", tipo: "apertura", titular: T.apertura.titular, apoyo: T.apertura.apoyo, Figura: FiguraApertura, nombreFigura: "La cuenta Caja y tres valores por anotar" },
    {
      id: "de-que-lado", tipo: "haz", titular: T.lado.titular, apoyo: T.lado.apoyo, razon: T.lado.razon,
      Figura: FiguraLado, nombreFigura: "La cuenta Caja con sus dos lados", estadoInicial: { lado: null },
      /* Predicción: vale cualquier lado; no lleva marca ni pastilla (Watari T2-3). */
      prediccion: true,
      resuelta: (e) => Boolean(e?.lado),
    },
    { id: "que-es-una-cuenta", tipo: "miralo", titular: T.cuenta.titular, apoyo: T.cuenta.apoyo, textual: true, Figura: FiguraCuenta, nombreFigura: "La cuenta Caja con lo que entra y lo que sale", estadoInicial: { vistas: [] } },
    { id: "debe-y-haber", tipo: "miralo", titular: T.debeHaber.titular, apoyo: T.debeHaber.apoyo, Figura: FiguraDebeHaber, nombreFigura: "La cuenta Caja partida por la raya", estadoInicial: { vistos: [] } },
    { id: "movimientos", tipo: "miralo", titular: T.movimientos.titular, apoyo: T.movimientos.apoyo, Figura: FiguraMovimientos, nombreFigura: "La cuenta Caja con sus dos columnas", estadoInicial: { sumado: false } },
    {
      id: "el-saldo", tipo: "haz", titular: T.saldo.titular, apoyo: T.saldo.apoyo, razon: T.saldo.razon,
      Figura: FiguraSaldo, nombreFigura: "La cuenta Caja con sus dos movimientos", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.saldo), opciones: T.saldo.opciones, buena: T.saldo.opciones[0],
    },
    {
      id: "debe-no-es-subir", tipo: "haz", titular: T.debeNoEsSubir.titular, apoyo: T.debeNoEsSubir.apoyo, razon: T.debeNoEsSubir.razon,
      Figura: FiguraDebeNoEsSubir, nombreFigura: "La cuenta Cuentas por pagar de Lavado de Autos Mateo", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.debeNoEsSubir), opciones: T.debeNoEsSubir.opciones, buena: "Baja",
    },
    {
      id: "cierre", tipo: "cierre", titular: T.cierre.titular, apoyo: T.cierre.apoyo,
      Figura: FiguraCierre, nombreFigura: "Una cuenta con $50 en el debe y $30 en el haber", pasos: 1, rotulosPaso: [T.cierre.frase],
    },
  ],
};
