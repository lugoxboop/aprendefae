import { ShoppingBag, Briefcase, HardHat, User } from "lucide-react";
import { FAE } from "../../../../theme.js";
import { DEUDORES_T6_ACT1 } from "../../../../data/contabilidadT6Act1.js";
import { deudorDeT6Act1 } from "../../../../contabilidad/t6Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a1 · «¿QUIÉN LE DEBE A LA EMPRESA?» (lote 24, D9, P2 de Mai).
 *
 * La galería de deudores, en dos grupos con su borde: «Clientes», en su
 * propia fila (los cuatro en una no caben a 320), con ShoppingBag, «clientes»
 * y «les vendió a crédito»; «Otras cuentas por cobrar», en tres columnas
 * (Briefcase, «socios y accionistas»; HardHat, «trabajadores»; User,
 * «particulares») y, debajo, «otros motivos».
 *
 * Al responder la decisión 1, el número de la ficha entra bajo su deudor, con
 * lo correcto (el registro): resaltado (2 nodo y relleno navy) hasta la ficha
 * siguiente, y su deudor con contorno 2 #F8F9FA mientras tanto. Antes de
 * responder, solo lo de las fichas anteriores (R10). Al final de la partida se
 * ve quién debía qué. El número entra con opacidad en 240 ms; con movimiento
 * reducido, al instante. Íconos lucide de 24, trazo 2, aria-hidden.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = DEUDORES_T6_ACT1;
const ICONO = { clientes: ShoppingBag, socios: Briefcase, trabajadores: HardHat, particulares: User };
const PALABRA = { fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px" };
const NOMBRE_GRUPO = { margin: "0 2px 6px", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, color: FAE.text };
const GRUPO = { borderRadius: "10px", border: "1px solid rgba(248,249,250,0.22)", padding: "8px 5px" };

function Numero({ n, resaltado, reducido }) {
  return (
    <span data-numero-ficha={n} data-resaltado={resaltado ? "si" : "no"} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "24px", height: "22px", padding: "0 5px", boxSizing: "border-box", borderRadius: "7px",
      fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums",
      ...(resaltado ? { border: `2px solid ${FAE.node}`, background: "#1D3557" } : { border: "1px solid rgba(248,249,250,0.35)" }),
      animation: reducido || !resaltado ? "none" : "b5-funde 240ms linear both",
    }}>{n}</span>
  );
}

/* Un deudor: su ícono (si tiene), su palabra y, debajo, los números de sus fichas. */
function Deudor({ id, palabra, numeros, actual, reducido, fila = false, motivo = null }) {
  const Icono = ICONO[id];
  const activo = numeros.includes(actual);
  return (
    <div data-deudor={id} data-activo={activo ? "si" : "no"} style={{
      minWidth: 0, borderRadius: "8px", padding: "4px 2px", boxSizing: "border-box",
      boxShadow: activo ? `inset 0 0 0 2px ${FAE.text}` : "none",
      display: "flex", flexDirection: fila ? "row" : "column", alignItems: fila ? "center" : "flex-start", gap: fila ? "6px" : "3px", flexWrap: fila ? "wrap" : "nowrap",
    }}>
      {Icono && <Icono aria-hidden="true" size={24} strokeWidth={2} color={FAE.text} />}
      <span style={{ ...PALABRA, fontWeight: 600, color: FAE.text }}>{palabra}</span>
      {motivo && <span style={{ ...PALABRA, color: "#A8B6C8" }}>{motivo}</span>}
      <span data-numeros style={{ display: "flex", flexWrap: "wrap", gap: "4px", minHeight: "22px", ...(fila ? { marginLeft: "auto" } : null) }}>
        {numeros.map((n) => <Numero key={n} n={n} resaltado={n === actual} reducido={reducido} />)}
      </span>
    </div>
  );
}

export default function QuienLeDebe({ items, indice, hecha, reducido }) {
  /* Las fichas ya respondidas: las anteriores y, si su decisión 1 ya terminó, la de ahora (resaltada). */
  const hasta = indice + (hecha ? 1 : 0);
  const actual = hecha ? indice + 1 : null;
  const numerosDe = (id) => items.slice(0, hasta).map((f, k) => [k + 1, deudorDeT6Act1(f)]).filter(([, d]) => d === id).map(([n]) => n);
  const lector = actual ? D.lector(actual, D.frases[deudorDeT6Act1(items[indice])]) : D.titulo;
  return (
    <div data-quien-le-debe role="img" aria-label={lector}
      style={{ margin: "14px 0 0", padding: "10px 8px", borderRadius: "12px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" }}>
      <style>{"@keyframes b5-funde { from { opacity: 0; } to { opacity: 1; } }"}</style>
      <p style={{ margin: "0 4px 8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text }}>{D.titulo}</p>
      <div aria-hidden="true" style={{ display: "grid", rowGap: "8px" }}>
        <div data-grupo-deudores="clientes" style={GRUPO}>
          <p style={NOMBRE_GRUPO}>{D.clientes.nombre}</p>
          <Deudor id="clientes" palabra={D.clientes.palabra} motivo={D.clientes.motivo} numeros={numerosDe("clientes")} actual={actual} reducido={reducido} fila />
        </div>
        <div data-grupo-deudores="otras" style={GRUPO}>
          <p style={NOMBRE_GRUPO}>{D.otras.nombre}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", columnGap: "4px" }}>
            {D.otras.columnas.map((c) => <Deudor key={c.id} id={c.id} palabra={c.palabra} numeros={numerosDe(c.id)} actual={actual} reducido={reducido} />)}
          </div>
          <div style={{ marginTop: "6px", borderTop: "1px dashed rgba(248,249,250,0.18)", paddingTop: "4px" }}>
            <Deudor id="otro" palabra={D.otras.motivo} numeros={numerosDe("otro")} actual={actual} reducido={reducido} fila />
          </div>
        </div>
      </div>
    </div>
  );
}
