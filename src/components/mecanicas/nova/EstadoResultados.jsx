import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { LINEAS, FUERA_DEL_ESTADO, MESES } from "../../../data/nova.js";
import { cascadaDe, enMillones, enEntero } from "../../../nova/estado.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DEL FONDO DE LA SALA DE JUNTAS: el estado de resultados de NOVA.
 *
 * Está SIEMPRE, en las cuatro etapas y en las transiciones. Es el hilo del
 * desafío, y un hilo que desaparece a ratos deja de ser un hilo: el estudiante
 * nunca deja de ver las consecuencias de lo que decide el Gobierno.
 *
 * ═══════════ QUÉ SE MUEVE Y QUÉ NO ═══════════
 *
 * `movida` enciende una línea —la que la medida tocó primero— y la cascada
 * enciende, más tenue, las que dependen de ella. Las dos utilidades no se
 * fijan nunca a mano: se calculan, que es el contenido de la Etapa 2.
 *
 * La cifra CUENTA hacia su nuevo valor cuando hay valor nuevo. Cuando la ficha
 * solo fija la dirección —ver la nota larga en nova/estado.js—, la línea se
 * enciende y enseña la flecha, y la cifra se queda donde está en vez de contar
 * hacia un número que nadie escribió.
 *
 * ═══════════ LA LÍNEA QUE DUERME ═══════════
 *
 * Gastos financieros arranca en $0 y apagada. Es la única del estado que
 * despierta en todo el desafío, y lo hace una sola vez, en la medida del costo
 * del crédito de la Etapa 2. Por eso `dormida` es del dato y no un estado
 * interno: que esté dormida es información del caso.
 *
 * ═══════════ A 375 px ═══════════
 *
 * En el teléfono la pantalla no se encoge hasta ser ilegible: el rótulo pasa a
 * dos líneas si hace falta y la cifra se queda a la derecha, alineada por
 * unidades con `tabular-nums`. Ninguna cifra baja de 12,5 px.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-nv-encender {
  0%   { box-shadow: inset 0 0 0 0 rgba(42,157,143,0); }
  30%  { box-shadow: inset 0 0 0 40px rgba(42,157,143,0.20); }
  100% { box-shadow: inset 0 0 0 40px rgba(42,157,143,0); }
}
.fae-nv-encender { animation: fae-nv-encender 1200ms ease-out both; }
@keyframes fae-nv-cascada {
  0%   { box-shadow: inset 0 0 0 0 rgba(233,196,106,0); }
  40%  { box-shadow: inset 0 0 0 40px rgba(233,196,106,0.13); }
  100% { box-shadow: inset 0 0 0 40px rgba(233,196,106,0); }
}
.fae-nv-cascada { animation: fae-nv-cascada 1200ms ease-out 260ms both; }
@keyframes fae-nv-despertar {
  from { opacity: .3; }
  to   { opacity: 1; }
}
.fae-nv-despertar { animation: fae-nv-despertar 900ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-nv-encender, .fae-nv-cascada, .fae-nv-despertar { animation: none !important; }
}
`;

/* Cuánto tarda una cifra en llegar a su nuevo valor. */
export const MS_CONTEO = 900;

/*
 * Una cifra que cuenta. Sin `requestAnimationFrame` disponible —jsdom, una
 * prueba— salta directamente al valor final: la cifra correcta importa más que
 * el trayecto, y así nada se queda a medio contar fuera del navegador.
 */
export function useConteo(valor, ms = MS_CONTEO) {
  const [visible, setVisible] = useState(valor);
  const desde = useRef(valor);

  useEffect(() => {
    const origen = desde.current;
    if (origen === valor) return undefined;
    const reducido = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof requestAnimationFrame !== "function" || reducido || ms <= 0) {
      desde.current = valor;
      setVisible(valor);
      return undefined;
    }
    const t0 = performance.now();
    let vivo = true;
    const paso = (t) => {
      if (!vivo) return;
      const k = Math.min(1, (t - t0) / ms);
      setVisible(Math.round(origen + (valor - origen) * k));
      if (k < 1) requestAnimationFrame(paso);
      else desde.current = valor;
    };
    requestAnimationFrame(paso);
    return () => { vivo = false; };
  }, [valor, ms]);

  return visible;
}

function Cifra({ valor, formato }) {
  const visible = useConteo(valor);
  return (
    <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
      {formato === "entero" ? enEntero(visible) : enMillones(visible)}
    </span>
  );
}

const FLECHA = { sube: "▲", baja: "▼" };

/**
 * @param {object} p
 * @param {Object<string,number>} p.estado valores por id de línea, ya calculados
 * @param {string} [p.movida] la línea que se acaba de mover
 * @param {"sube"|"baja"} [p.direccion] hacia dónde se movió
 * @param {boolean} [p.despierta] la línea dormida ya se encendió
 * @param {number} [p.mes] índice 0..11 del mes del calendario
 * @param {string} [p.nota] una línea corta bajo el calendario
 * @param {(id:string)=>void} [p.onTocar] en la Etapa 2 las líneas SON los botones:
 *        el estudiante toca sobre la pantalla del fondo, no sobre una lista aparte
 * @param {string} [p.erronea] la línea que se acaba de tocar y no era
 */
export default function EstadoResultados({
  estado, movida = null, direccion = null, despierta = false, mes = 0, nota = null,
  onTocar = null, erronea = null,
}) {
  const enCascada = movida ? cascadaDe(movida) : [];

  return (
    <section
      data-estado-resultados
      aria-label="Estado de resultados de NOVA"
      style={{
        borderRadius: "18px",
        background: "linear-gradient(170deg, rgba(29,53,87,0.42), rgba(10,20,34,0.72) 60%)",
        border: "1px solid rgba(248,249,250,0.15)",
        padding: "clamp(12px, 2.2vw, 18px)",
      }}
    >
      <style>{CSS}</style>

      {/* La chapa de la pantalla: quién es y en qué mes va el año fiscal. */}
      <header style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", alignItems: "baseline", justifyContent: "space-between", marginBottom: "10px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, margin: 0 }}>
          NOVA · ESTADO DE RESULTADOS
        </p>
        <p data-calendario style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.5)", margin: 0 }}>
          {(MESES[mes] ?? MESES[0]).toUpperCase()}
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {LINEAS.map((linea) => {
          const esMovida = movida === linea.id;
          const enCola = enCascada.includes(linea.id);
          const dormida = linea.dormida && !despierta && estado[linea.id] === 0;
          const clase = esMovida ? "fae-nv-encender" : enCola ? "fae-nv-cascada" : undefined;
          const fallada = erronea === linea.id;
          /*
           * Con `onTocar` la fila ES el botón. No se pinta una lista de
           * opciones al lado: la ficha dice que el estudiante toca la línea que
           * se mueve, y una lista paralela convertiría «leer el estado» en
           * «elegir de un menú».
           */
          const Fila = onTocar ? "button" : "div";
          return (
            <Fila
              key={linea.id}
              type={onTocar ? "button" : undefined}
              onClick={onTocar ? () => onTocar(linea.id) : undefined}
              data-linea={linea.id}
              data-movida={esMovida ? "" : undefined}
              data-cascada={enCola ? "" : undefined}
              data-dormida={dormida ? "" : undefined}
              data-fallada={fallada ? "" : undefined}
              className={[clase, linea.dormida && despierta ? "fae-nv-despertar" : null].filter(Boolean).join(" ") || undefined}
              style={{
                display: "flex", alignItems: "baseline", gap: "10px", width: "100%", textAlign: "left",
                padding: "7px 9px", borderRadius: "8px",
                cursor: onTocar ? "pointer" : "default",
                background: linea.derivada ? "rgba(248,249,250,0.05)" : "transparent",
                borderTop: linea.derivada ? "1px solid rgba(248,249,250,0.12)" : "1px solid transparent",
                border: onTocar ? `1px solid ${fallada ? FAE.coral : "rgba(248,249,250,0.12)"}` : undefined,
                borderTopColor: linea.derivada && !onTocar ? "rgba(248,249,250,0.12)" : undefined,
                opacity: dormida ? 0.42 : 1,
                font: "inherit", color: "inherit",
              }}
            >
              <span
                style={{
                  flex: 1, minWidth: 0, fontSize: "12.5px", lineHeight: 1.35,
                  color: linea.derivada ? FAE.text : "rgba(248,249,250,0.78)",
                  fontWeight: linea.derivada ? 600 : 400,
                }}
              >
                {linea.rotulo}
              </span>
              {esMovida && direccion && (
                <span data-flecha={direccion} aria-label={direccion === "sube" ? "sube" : "baja"} style={{ flexShrink: 0, fontSize: "10px", color: FAE.teal }}>
                  {FLECHA[direccion]}
                </span>
              )}
              <span style={{ flexShrink: 0, fontSize: "12.5px", color: esMovida ? FAE.teal : FAE.text }}>
                <Cifra valor={estado[linea.id]} />
              </span>
            </Fila>
          );
        })}
      </div>

      {/* Lo que no es una línea del estado, separado de verdad y no solo más abajo. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: "11px", paddingTop: "9px", borderTop: "1px dashed rgba(248,249,250,0.16)" }}>
        {FUERA_DEL_ESTADO.map((d) => (
          <p key={d.id} data-fuera={d.id} style={{ fontSize: "12px", color: "rgba(248,249,250,0.55)", margin: 0 }}>
            {d.rotulo}:{" "}
            <span style={{ color: "rgba(248,249,250,0.82)" }}>
              <Cifra valor={d.valor} formato={d.formato} />
            </span>
          </p>
        ))}
      </div>

      {nota && (
        <p style={{ fontSize: "12px", lineHeight: 1.5, color: "rgba(248,249,250,0.5)", margin: "9px 0 0" }}>
          {nota}
        </p>
      )}
    </section>
  );
}
