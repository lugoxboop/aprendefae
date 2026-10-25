import { FAE } from "../../../../theme.js";
import { Veredicto } from "../../../secuencia/SecuenciaAprender.jsx";
import { HAZ_INICIAL, responderHaz, hazResuelto, mostrarCorrecto } from "../../../secuencia/secuencia.js";
import { useNumeroQueSube } from "../verbos.jsx";
import { LAVADO_DE_AUTOS } from "../../../../data/contabilidad.js";
import { P1_ID, P1_TEXTOS as T, P1_ALTO_FIGURA, P1_SELECTOR_FAMILIA } from "../../../../data/contabilidadT2Secuencia.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · P1 «De qué está hecha una cuenta» EN SECUENCIA — las figuras y la pieza.
 *
 * Forma: c-t2-3-watari-figuras.md §1 (8 pantallas). Textos: contabilidadT2Secuencia.js.
 * Contenedor: SecuenciaAprender (compartido, de Erwin): aquí no hay ni
 * contador, ni pastilla, ni botones de navegación propios. El Haz calificado
 * usa responderHaz / hazResuelto / <Veredicto />, como pide #492.
 *
 * Colores con rol (Watari T2-3): teal solo para DEBE; ámbar para HABER; coral
 * solo para el error, punteado; blanco para el estado correcto. Los controles
 * de la figura son neutros, de 1 px de contorno y 44 px de alto. Movimiento:
 * la curva de la casa, solo transform y opacity, una vez; con movimiento
 * reducido, el estado final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const DEBE = FAE.teal;
const HABER = FAE.ambar;
const LINEA = "rgba(248,249,250,0.55)";
const SUAVE = "rgba(248,249,250,0.8)";
const SECUNDARIO = "#A8B6C8";

const ESTILOS = `
@keyframes fae-t2s-entra { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
@keyframes fae-t2s-raya { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes fae-t2s-cae { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.fae-t2s-llega { animation: fae-t2s-entra 360ms ${CURVA} both; }
.fae-t2s-raya-baja { transform-origin: top; animation: fae-t2s-raya 420ms ${CURVA} both; }
.fae-t2s-cae { animation: fae-t2s-cae 240ms ${CURVA} both; }
.fae-t2s-boton { transition: transform 160ms ${CURVA}; }
.fae-t2s-boton:active:not([disabled]) { transform: scale(.97); transition-duration: 100ms; }
.fae-t2s-boton:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .fae-t2s-llega, .fae-t2s-raya-baja, .fae-t2s-cae { animation: none !important; }
  .fae-t2s-boton { transition: none; }
}
`;

const pesos = (n) => `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/* ─────────────── piezas de dibujo ─────────────── */

const raiz = { width: "100%", fontFamily: "Inter, sans-serif", color: FAE.text };

/* El nombre de la cuenta sobre la barra de la T. */
function Encabezado({ nombre }) {
  return (
    <p style={{ margin: 0, padding: "0 0 4px", textAlign: "center", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, lineHeight: "18px", borderBottom: `2px solid ${LINEA}` }}>
      {nombre}
    </p>
  );
}

/* Una cifra en la T. `marca` es el borde de un saldo: blanco (correcto) o coral punteado (error). */
function Cifra({ valor, fecha, marca, clase }) {
  const borde = marca === "error" ? `2px dashed ${FAE.coral}` : marca === "bien" ? "2px solid #F8F9FA" : "2px solid transparent";
  return (
    <span className={clase} style={{
      display: "flex", justifyContent: fecha ? "space-between" : "center", gap: "6px", padding: "0 6px", borderRadius: "6px", border: borde,
      fontSize: "14px", lineHeight: "20px", fontVariantNumeric: "tabular-nums", color: marca === "error" ? FAE.coral : FAE.text,
    }}>
      {fecha && <span style={{ fontSize: "12px", color: SECUNDARIO }}>{fecha}</span>}
      <span>{valor}</span>
    </span>
  );
}

/*
 * El nombre de un lado, 12 px. El color del rol (DEBE teal, HABER ámbar) va en
 * la raya de debajo y no en la letra: teal a 12 px sobre el Panel mide 4,47:1
 * (sonda de contraste, 24-oct), bajo el 4,5 que pide el texto normal.
 */
const Rotulo = ({ lado, children }) => (
  <span style={{ display: "block", textAlign: "center", fontSize: "12px", lineHeight: "14px", fontWeight: 700, letterSpacing: "0.06em", color: FAE.text }}>
    <span style={{ borderBottom: `2px solid ${lado === "debe" ? DEBE : HABER}` }}>{children}</span>
  </span>
);

/* Un lado de la T. Si recibe onClick es un botón (44 px como mínimo, contorno neutro de 1 px). */
function Lado({ onClick, etiqueta, elegido, icono, children, derecha }) {
  const base = {
    flex: "1 1 0", minWidth: 0, minHeight: "44px", boxSizing: "border-box", padding: "4px 4px 6px",
    display: "flex", flexDirection: "column", gap: "2px", alignItems: "stretch",
    ...(derecha ? { borderLeft: `2px solid ${LINEA}` } : {}),
  };
  if (!onClick) return <div style={base}>{children}</div>;
  return (
    <button
      type="button"
      className="fae-t2s-boton"
      onClick={onClick}
      aria-label={etiqueta}
      aria-pressed={elegido ? "true" : "false"}
      style={{
        ...base, cursor: "pointer", color: FAE.text, font: "inherit", background: elegido ? "rgba(248,249,250,0.06)" : "transparent",
        border: `1px solid ${elegido ? "#F8F9FA" : "rgba(248,249,250,0.32)"}`, borderRadius: "8px",
        ...(derecha ? { borderLeft: `1px solid ${elegido ? "#F8F9FA" : "rgba(248,249,250,0.32)"}` } : {}),
      }}
    >
      {icono && <span aria-hidden="true" style={{ alignSelf: "flex-end", fontSize: "12px", lineHeight: "12px", color: icono === "✕" ? FAE.coral : "#F8F9FA" }}>{icono}</span>}
      {children}
    </button>
  );
}

/* Un control de la figura: neutro, contorno de 1 px, 44 px. */
function Control({ children, onClick, elegido, icono, disabled }) {
  return (
    <button
      type="button"
      className="fae-t2s-boton"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={elegido === undefined ? undefined : elegido ? "true" : "false"}
      style={{
        flex: "1 1 0", minWidth: 0, minHeight: "44px", borderRadius: "999px", padding: "0 12px", boxSizing: "border-box",
        background: "transparent", color: disabled ? SECUNDARIO : FAE.text, cursor: disabled ? "default" : "pointer",
        border: `1px solid ${elegido ? "#F8F9FA" : "rgba(248,249,250,0.32)"}`,
        fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600,
      }}
    >
      {icono && <span aria-hidden="true" style={{ marginRight: "6px", color: icono === "✕" ? FAE.coral : "#F8F9FA" }}>{icono}</span>}
      {children}
    </button>
  );
}

const Fila = ({ children }) => <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>{children}</div>;

/* La frase de consecuencia de un error (C4): en la zona del mensaje, encima de la pista. */
const Consecuencia = ({ children }) => (
  <p data-consecuencia style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: "20px", color: SUAVE }}>{children}</p>
);

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

const suma = (xs) => xs.reduce((a, b) => a + b, 0);

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
  const e = estado ?? HAZ_INICIAL;
  const resuelto = hazResuelto(e);
  const verdad = e.ok || mostrarCorrecto(e);
  const error = !verdad && e.ultimo === "error";
  const responder = (lado) => {
    if (resuelto) return;
    setEstado((antes) => ({ ...responderHaz(antes, lado === "debe"), eleccion: lado }));
  };
  const saldoEn = (lado) => {
    if (verdad && lado === "debe") return <Cifra clase="fae-t2s-cae" valor={pesos(SALDO_CAJA)} marca="bien" />;
    if (error && lado === "haber") return <Cifra clase="fae-t2s-cae" valor={pesos(SALDO_CAJA)} marca="error" />;
    return <span style={{ minHeight: "24px" }} />;
  };
  const icono = (lado) => (e.eleccion !== lado ? null : e.ok ? "✓" : e.ultimo === "error" ? "✕" : null);
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Caja" />
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {["debe", "haber"].map((lado, k) => (
          <Lado key={lado} onClick={() => responder(lado)} etiqueta={T.saldo.opciones[k]} elegido={e.eleccion === lado} icono={icono(lado)}>
            <Rotulo lado={lado}>{T.saldo.opciones[k]}</Rotulo>
            <Cifra valor={pesos(lado === "debe" ? suma(CAJA.entra) : suma(CAJA.sale))} />
            {saldoEn(lado)}
          </Lado>
        ))}
      </div>
      {error && <Consecuencia>{T.saldo.consecuencia}</Consecuencia>}
      <Veredicto estado={e} pista={T.saldo.pista} porque={T.saldo.porque} />
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
  return <Cifra valor={`Saldo ${pesos(x)}`} marca={marca} />;
}

function FiguraDebeNoEsSubir({ estado, setEstado }) {
  const e = estado ?? HAZ_INICIAL;
  const resuelto = hazResuelto(e);
  const verdad = e.ok || mostrarCorrecto(e);
  const error = !verdad && e.ultimo === "error";
  const responder = (op) => {
    if (resuelto) return;
    setEstado((antes) => ({ ...responderHaz(antes, op === "Baja"), eleccion: op }));
  };
  const elegirCuenta = (k) => setEstado((antes) => ({ ...antes, cuenta: k }));
  const cuenta = P1_SELECTOR_FAMILIA[e.cuenta ?? 0];
  return (
    <div style={raiz}>
      <style>{ESTILOS}</style>
      <Encabezado nombre="Cuentas por pagar" />
      <div style={{ display: "flex" }}>
        <Lado>
          <Rotulo lado="debe">DEBE</Rotulo>
          {LAVADO_CXP.filter((m) => m.debe).map((m) => <Cifra key={m.fecha} fecha={m.fecha} valor={pesos(m.debe)} />)}
        </Lado>
        <Lado derecha>
          <Rotulo lado="haber">HABER</Rotulo>
          {LAVADO_CXP.filter((m) => m.haber).map((m) => <Cifra key={m.fecha} fecha={m.fecha} valor={pesos(m.haber)} />)}
          {/* La T dice la verdad (D3): el saldo cambia solo con la respuesta correcta; el error se dibuja punteado aparte. */}
          <SaldoCxp valor={verdad ? CXP_ANTES - CXP_PAGO : CXP_ANTES} marca={verdad ? "bien" : undefined} />
          {error && <Cifra clase="fae-t2s-cae" valor={`Saldo ${pesos(CXP_ANTES + CXP_PAGO)}`} marca="error" />}
        </Lado>
      </div>
      {!resuelto && (
        <Fila>
          {T.debeNoEsSubir.opciones.map((op) => (
            <Control key={op} onClick={() => responder(op)} elegido={e.eleccion === op} icono={e.eleccion === op && e.ultimo === "error" ? "✕" : null}>{op}</Control>
          ))}
        </Fila>
      )}
      <Veredicto estado={e} pista={T.debeNoEsSubir.pista} porque={T.debeNoEsSubir.porque} />
      {resuelto && (
        /* Delta T2-3 de Near: un selector entre dos cuentas reales, que no califica. */
        <>
          <Fila>
            {P1_SELECTOR_FAMILIA.map((c, k) => (
              <Control key={c.cuenta} onClick={() => elegirCuenta(k)} elegido={(e.cuenta ?? 0) === k}>{c.cuenta}</Control>
            ))}
          </Fila>
          <p data-familia style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "20px", color: SUAVE }}>
            {cuenta.cuenta} · {cuenta.familia} · saldo {pesos(cuenta.saldo)} en el{" "}
            <span style={{ fontWeight: 700, borderBottom: `2px solid ${cuenta.lado === "debe" ? DEBE : HABER}` }}>{cuenta.lado}</span>
          </p>
        </>
      )}
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

export const PIEZA_P1 = {
  id: P1_ID,
  /* #524: la secuencia todavía no lo lee (main fija 150/200). PENDIENTE_DE_WATARI: 213 > 206. */
  altoFigura: P1_ALTO_FIGURA,
  pantallas: [
    { id: "objetivo", tipo: "apertura", ...T.apertura, Figura: FiguraApertura, nombreFigura: "La cuenta Caja y tres valores por anotar" },
    {
      id: "de-que-lado", tipo: "haz", titular: T.lado.titular, apoyo: T.lado.apoyo, razon: T.lado.razon,
      Figura: FiguraLado, nombreFigura: "La cuenta Caja con sus dos lados", estadoInicial: { lado: null },
      /* Predicción: vale cualquier lado; no lleva pastilla (Watari T2-3). */
      resuelta: (e) => Boolean(e?.lado),
    },
    { id: "que-es-una-cuenta", tipo: "miralo", titular: T.cuenta.titular, apoyo: T.cuenta.apoyo, textual: true, Figura: FiguraCuenta, nombreFigura: "La cuenta Caja con lo que entra y lo que sale", estadoInicial: { vistas: [] } },
    { id: "debe-y-haber", tipo: "miralo", titular: T.debeHaber.titular, apoyo: T.debeHaber.apoyo, Figura: FiguraDebeHaber, nombreFigura: "La cuenta Caja partida por la raya", estadoInicial: { vistos: [] } },
    { id: "movimientos", tipo: "miralo", titular: T.movimientos.titular, apoyo: T.movimientos.apoyo, Figura: FiguraMovimientos, nombreFigura: "La cuenta Caja con sus dos columnas", estadoInicial: { sumado: false } },
    {
      id: "el-saldo", tipo: "haz", titular: T.saldo.titular, apoyo: T.saldo.apoyo, razon: T.saldo.razon,
      Figura: FiguraSaldo, nombreFigura: "La cuenta Caja con sus dos movimientos", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
    },
    {
      id: "debe-no-es-subir", tipo: "haz", titular: T.debeNoEsSubir.titular, apoyo: T.debeNoEsSubir.apoyo, razon: T.debeNoEsSubir.razon,
      Figura: FiguraDebeNoEsSubir, nombreFigura: "La cuenta Cuentas por pagar de Lavado de Autos Mateo", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
    },
    {
      id: "cierre", tipo: "cierre", titular: T.cierre.titular, apoyo: T.cierre.apoyo,
      Figura: FiguraCierre, nombreFigura: "Una cuenta con $50 en el debe y $30 en el haber", pasos: 1, rotulosPaso: [T.cierre.frase],
    },
  ],
};

/* Las piezas que ya están en secuencia, en el orden del tema. P2-P5 entran en la segunda parte de T2-7. */
export const PIEZAS_SECUENCIA_T2 = [PIEZA_P1];
