import { useMemo, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { barajar } from "../../../../utils/barajar.js";
import { PIEZA_DEBE_Y_HABER } from "../../../../data/contabilidadDebeHaber.js";
import { MESA, tresCasos, ningunaEsNegativa, contraejemplo } from "../../../../contabilidad/debeHaber.js";
import { TONO_ROTULO, PANEL, Triangulito, Barra } from "./piezasDebeHaber.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 4 · «EN UNA FRASE» — selector, no texto libre.
 *
 * Cuatro opciones en orden aleatorio, cada una con su devolución Y SU DIBUJO.
 * El dibujo no es adorno: las tres equivocadas son confusiones concretas, y a
 * una confusión concreta se le responde enseñándole el caso que la desmiente,
 * no repitiéndole la regla.
 *
 * La opción 4 existe a propósito: es la confusión que una versión anterior de
 * esta pieza iba a instalar por error —que si un lado de la ecuación sube el
 * otro baja— y ahora sirve para detectarla.
 *
 * NO SE CALIFICA. Esta pieza no da FP y no tiene estado de acierto: la opción
 * correcta se marca en teal y las otras en ámbar, nunca en coral. Coral es
 * error en todo el sitio, y aquí nadie se está equivocando en una evaluación.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = PIEZA_DEBE_Y_HABER;

const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

const ROTULO_NAVY = {
  margin: "6px 0 0", padding: "7px 10px", borderRadius: "9px", fontSize: "11.5px",
  lineHeight: 1.4, color: "rgba(248,249,250,0.82)",
  background: "rgba(61,90,128,0.2)", border: "1px solid rgba(61,90,128,0.55)",
};

/* ═══════════ LOS CUATRO DIBUJOS ═══════════ */

/* La correcta: las dos cuentas con su ▲ y su trazo al término de la ecuación. */
function Ecuacion() {
  return (
    <div data-visual="ecuacion" style={{ display: "flex", gap: "12px" }}>
      {MESA.map((p) => (
        <div key={p.id} style={{ ...PANEL, flex: "1 1 0", minWidth: 0, padding: "9px 7px" }}>
          <p style={{
            margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontWeight: 700,
            fontSize: "11px", lineHeight: 1.2, color: FAE.text, textAlign: "center",
          }}>
            {p.debito.cuenta}
          </p>
          <Triangulito lado={p.debito.triangulo} />
          <p style={{ margin: "4px 0 0", textAlign: "center", color: "rgba(248,249,250,0.45)", fontSize: "12px" }} aria-hidden="true">↓</p>
          <p data-termino style={{
            margin: "3px 0 0", textAlign: "center",
            fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
            padding: "3px 5px", borderRadius: "7px",
            color: TONO_ROTULO[p.debito.triangulo],
            background: `${COLOR_LADO[p.debito.triangulo]}1A`,
            border: `1px solid ${COLOR_LADO[p.debito.triangulo]}`,
          }}>
            {p.debito.tipo === "activo" ? "ACTIVO · izquierda" : "PATRIMONIO · derecha"}
          </p>
        </div>
      ))}
    </div>
  );
}

/*
 * «El patrimonio es negativo»: las dos cuentas REALES del cierre de Caleja,
 * dibujadas del mismo tipo, las dos en navy, las dos por encima de la misma
 * línea de cero. Igualarlas con cifras inventadas habría hecho el punto con
 * datos falsos — y el punto es justamente que los dos números son reales.
 */
function NingunaNegativa() {
  const cuentas = ningunaEsNegativa();
  const maximo = Math.max(...cuentas.map((c) => c.saldo));
  return (
    <div data-visual="ninguna-negativa">
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", minHeight: "92px" }}>
        {cuentas.map((c) => (
          <div key={c.cuenta} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <span style={{ ...CIFRA, display: "block", fontSize: "11.5px", fontWeight: 700, color: "rgba(248,249,250,0.85)" }}>
              {pesos(c.saldo)}
            </span>
            <span data-barra-neutra={c.cuenta} style={{
              display: "block", height: `${(c.saldo / maximo) * 62}px`, marginTop: "4px",
              background: "rgba(61,90,128,0.75)", border: "1px solid rgba(61,90,128,1)",
              borderRadius: "5px 5px 0 0",
            }} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" style={{ height: "1px", background: "rgba(248,249,250,0.4)" }} />
      <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
        {cuentas.map((c) => (
          <span key={c.cuenta} style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: "10.5px", color: "rgba(248,249,250,0.7)" }}>
            {c.cuenta}
          </span>
        ))}
      </div>
      <p style={{ ...ROTULO_NAVY, textAlign: "center" }}>ninguna de las dos es negativa</p>
    </div>
  );
}

/* «Una tenía más saldo»: los tres casos reales, con la columna del ▲ resaltada. */
function TresCasos() {
  const casos = tresCasos();
  const o = P.opciones.find((x) => x.id === "saldo-previo");
  const celda = { padding: "5px 4px", fontSize: "10.5px", textAlign: "right", ...CIFRA };
  return (
    <div data-visual="tres-casos">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "rgba(248,249,250,0.5)", fontFamily: "Sora, sans-serif", fontSize: "9px", letterSpacing: "0.08em" }}>
            <th style={{ ...celda, textAlign: "left" }}>CUENTA</th>
            <th style={celda}>PREVIO</th>
            <th style={celda}>RESULTADO</th>
            <th style={{ ...celda, textAlign: "center" }}>▲</th>
          </tr>
        </thead>
        <tbody>
          {casos.map((c) => (
            <tr key={c.cuenta} data-caso={c.cuenta} data-sube={c.sube ? "si" : "no"} style={{
              borderTop: "1px solid rgba(248,249,250,0.1)",
              /* Las dos que suben, con el mismo tratamiento; la que baja, distinto. */
              background: c.sube ? "rgba(82,196,176,0.09)" : "rgba(233,196,106,0.09)",
            }}>
              <td style={{ ...celda, textAlign: "left", color: FAE.text }}>{c.cuenta}</td>
              <td style={{ ...celda, color: "rgba(248,249,250,0.75)" }}>{pesos(c.previo)}</td>
              <td style={{ ...celda, color: TONO_ROTULO[c.sube ? DEBE : HABER] }}>
                {c.sube ? "↑ " : "↓ "}{pesos(c.resultado)}
              </td>
              <td data-triangulo-de={c.cuenta} style={{
                ...celda, textAlign: "center", fontWeight: 700,
                color: TONO_ROTULO[c.triangulo],
                background: "rgba(248,249,250,0.06)",
              }}>
                ▲ {c.triangulo === DEBE ? "debe" : "haber"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={ROTULO_NAVY}>{o.rotulos.saldo}</p>
      <p style={ROTULO_NAVY}>{o.rotulos.triangulo}</p>
    </div>
  );
}

/* «Si un lado sube el otro baja»: el préstamo, con las dos barras subiendo. */
function Contraejemplo() {
  const c = contraejemplo();
  return (
    <div data-visual="contraejemplo">
      <div style={{ display: "flex", gap: "12px" }}>
        {[c.izquierda, c.derecha].map((x) => (
          <div key={x.cuenta} style={{ ...PANEL, flex: "1 1 0", minWidth: 0, padding: "9px 7px" }}>
            <p style={{
              margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontWeight: 700,
              fontSize: "11px", lineHeight: 1.2, color: FAE.text, textAlign: "center",
            }}>
              {x.cuenta}
            </p>
            <Triangulito lado={x.triangulo} />
            <Barra valor={x.despues} maximo={c.izquierda.despues} lado={x.triangulo} signo="+" />
            <p style={{ margin: "4px 0 0", fontSize: "9.5px", textAlign: "center", color: "rgba(248,249,250,0.6)", ...CIFRA }}>
              {pesos(x.antes)} → {pesos(x.despues)}
            </p>
          </div>
        ))}
      </div>
      <p style={{ ...ROTULO_NAVY, textAlign: "center" }}>las dos suben al mismo tiempo</p>
    </div>
  );
}

const VISUALES = {
  ecuacion: Ecuacion,
  "ninguna-negativa": NingunaNegativa,
  "tres-casos": TresCasos,
  contraejemplo: Contraejemplo,
};

/* ═══════════════════════════ EL SELECTOR ═══════════════════════════ */

export default function EnUnaFrase() {
  /* Orden aleatorio en cada carga, como todo el sitio. */
  const opciones = useMemo(() => barajar(P.opciones), []);
  const [elegida, setElegida] = useState(null);

  const o = elegida ? P.opciones.find((x) => x.id === elegida) : null;
  const Visual = o ? VISUALES[o.visual] : null;

  return (
    <div data-capa4-debe-haber>
      <p style={{
        margin: 0, fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700,
        lineHeight: 1.45, color: FAE.text,
      }}>
        {P.pregunta}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {opciones.map((x) => {
          const esta = elegida === x.id;
          /*
           * Teal la correcta, ámbar las otras — nunca coral. Esta pieza no
           * califica: no hay «fallo» que marcar, hay una confusión que
           * desmontar.
           */
          const tono = !elegida ? null : x.correcta ? FAE.teal : (esta ? FAE.ambar : null);
          return (
            <button
              key={x.id}
              type="button"
              data-opcion={x.id}
              data-estado={!elegida ? "" : x.correcta ? "correcta" : esta ? "elegida" : "otra"}
              aria-pressed={esta}
              disabled={Boolean(elegida)}
              onClick={() => setElegida(x.id)}
              style={{
                textAlign: "left", padding: "11px 13px", borderRadius: "12px",
                cursor: elegida ? "default" : "pointer",
                background: tono ? `${tono}14` : "rgba(10,20,34,0.4)",
                border: `1px solid ${tono ?? "rgba(248,249,250,0.2)"}`,
                color: FAE.text, fontSize: "13.5px", lineHeight: 1.45,
                opacity: elegida && !esta && !x.correcta ? 0.5 : 1,
                transition: "border-color 200ms ease, background 200ms ease, opacity 200ms ease",
              }}
            >
              <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ flex: 1, minWidth: 0 }}>{x.texto}</span>
                {/*
                  LA MARCA, PORQUE EL TONO SOLO NO BASTA.
                  Elegida la opción, lo único que separaba «la correcta» de
                  «la que elegiste» era teal contra ámbar. Quien no distingue
                  esos dos tonos veía dos opciones resaltadas igual y tenía
                  que bajar a leer la devolución para saber cuál era cuál.
                  El texto de la devolución sí lo dice —la información no se
                  perdía—, pero el color era la única señal EN LA LISTA, y esa
                  es justo la regla de kit.md.
                  Ni ✓ ni ✗: esta pieza no califica a nadie, así que la marca
                  dice «esta es» y la elegida dice «la tuya», con palabras.
                */}
                {elegida && (x.correcta || esta) && (
                  <span style={{
                    flexShrink: 0, fontFamily: "Sora, sans-serif", fontSize: "10px",
                    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: x.correcta ? FAE.teal : FAE.ambar,
                  }}>
                    {x.correcta ? "esta es" : "la tuya"}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {o && (
        <div data-feedback={o.id} style={{ marginTop: "14px" }}>
          <p role="status" style={{
            margin: "0 0 12px", padding: "12px 14px", borderRadius: "12px",
            fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)",
            background: o.correcta ? "rgba(42,157,143,0.1)" : "rgba(233,196,106,0.09)",
            borderLeft: `3px solid ${o.correcta ? FAE.teal : FAE.ambar}`,
          }}>
            {o.feedback}
          </p>
          <Visual />

          {/*
            EL CIERRE. Se repite el objetivo —el mismo con el que la pieza
            abrió— sobre la mesa de dos casos en su estado final. No es
            redundancia: es la frase que ahora sí significa algo, porque ya se
            vio ocurrir.
          */}
          <div data-cierre style={{ marginTop: "16px" }}>
            <Ecuacion />
            <p style={{
              margin: "10px 0 0", padding: "11px 13px", borderRadius: "12px",
              fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)",
              background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}`,
            }}>
              {P.objetivo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
