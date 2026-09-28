import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import { ROTULO_BANDA, RANGO_BANDA, ROTULO_AMPLIAR } from "../../../../data/contabilidadPiezas234.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DOS FOTOS Y EL TRAMO — la figura de la pieza 3.
 *
 * ═══════════ EL LAYOUT ES VERTICAL, Y ES EL ÚNICO ═══════════
 *
 * Foto del 1 de enero arriba, la banda del año en medio, foto del 31 de
 * diciembre abajo. A 375 px las dos fotos caben enteras en una pantalla, que
 * es lo que hace que se puedan comparar de un vistazo — y compararlas es la
 * mitad de lo que la pieza enseña.
 *
 * ═══════════ LAS DOS FOTOS, SIEMPRE DEL MISMO TAMAÑO ═══════════
 *
 * No es simetría decorativa. Si una fuera más grande, diría que pesa más, y
 * las dos son igual de reales en momentos distintos. Por eso las dos se pintan
 * con el mismo componente y ninguna recibe un tamaño propio.
 *
 * ═══════════ LA BANDA NO ES LA FRANJA DEL ANILLO ═══════════
 *
 * La franja de la pieza 1 es una línea fina con nodos circulares y un trazo de
 * retorno punteado, y late. Esta banda es un bloque ancho y macizo que se
 * llena de extremo a extremo, SIN nodos, SIN línea de retorno, SIN punteado y
 * SIN pulso. Reusar aquel patrón lo vaciaría: allá significa «el ciclo de la
 * información» y aquí significaría «un periodo de tiempo».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

/*
 * Una foto. `abrir` es opcional: el ícono de ampliar es un detalle de más,
 * nunca la única forma de ver el contenido. La vista con las dos fotos
 * visibles a la vez es siempre la primera que se ve.
 */
export function Foto({ foto, atenuada = false, resaltada = false, conCifras = false, onAbrir = null }) {
  return (
    <div
      data-foto={foto.id}
      data-atenuada={atenuada ? "si" : undefined}
      data-resaltada={resaltada ? "si" : undefined}
      style={{
        position: "relative", padding: "9px 11px", borderRadius: "11px",
        background: resaltada ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.45)",
        border: `${resaltada ? 2 : 1}px solid ${resaltada ? NEUTRO : "rgba(248,249,250,0.16)"}`,
        opacity: atenuada ? 0.35 : 1,
        transition: "opacity 300ms ease, border-color 300ms ease, background 300ms ease",
      }}
    >
      <p data-fecha={foto.fecha} style={{
        margin: "0 0 6px", fontFamily: SORA, fontSize: "11.5px", fontWeight: 700, color: FAE.text,
      }}>
        {foto.fecha}
      </p>
      {foto.lineas.map((l) => (
        <p key={l.rotulo} data-linea-foto={l.rotulo} style={{
          margin: "0 0 3px", display: "flex", flexWrap: "wrap", gap: "2px 6px",
          fontSize: "10.5px", lineHeight: 1.35,
        }}>
          <span style={{ color: "rgba(248,249,250,0.5)" }}>{l.rotulo}</span>
          <span style={{ color: "rgba(248,249,250,0.85)" }}>{l.texto}</span>
          {/*
            Las cifras solo aparecen cuando la devolución que las pide está en
            pantalla —la que dice que los dos informes tienen cifras—. No hay
            números en el banco: lo que se enseña es que HAY cifras, no cuáles.
          */}
          {conCifras && <span data-hay-cifra style={{ color: NEUTRO }}>· con su cifra</span>}
        </p>
      ))}
      {onAbrir && (
        <button
          type="button"
          data-ampliar={foto.id}
          aria-label={`${ROTULO_AMPLIAR}: ${foto.fecha}`}
          onClick={onAbrir}
          style={{
            position: "absolute", top: "6px", right: "6px",
            width: "22px", height: "22px", borderRadius: "7px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.2)",
            color: NEUTRO, fontSize: "11px", lineHeight: 1,
          }}
        >
          <span aria-hidden="true">⤢</span>
        </button>
      )}
    </div>
  );
}

/*
 * La banda del año. `llenado` va de 0 a 1 y es lo único que se anima: el
 * bloque se llena de extremo a extremo. No hay pulso, y la animación termina y
 * se queda quieta.
 */
export function Banda({ llenado = 0, atenuada = false, resaltada = false, reducido = false }) {
  const pct = Math.round(Math.max(0, Math.min(1, llenado)) * 100);
  return (
    <div
      data-banda
      data-llenado={pct}
      data-resaltada={resaltada ? "si" : undefined}
      style={{
        position: "relative", height: "62px", borderRadius: "10px", overflow: "hidden",
        background: "rgba(10,20,34,0.5)",
        border: `${resaltada ? 2 : 1}px solid ${resaltada ? NEUTRO : "rgba(248,249,250,0.16)"}`,
        opacity: atenuada ? 0.3 : 1,
        transition: "opacity 300ms ease, border-color 300ms ease",
      }}
    >
      {/* El relleno, de arriba abajo: de enero a diciembre. */}
      <div
        data-relleno
        aria-hidden="true"
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: `${pct}%`,
          background: "rgba(184,196,212,0.18)",
          borderBottom: pct > 0 && pct < 100 ? `1px solid ${NEUTRO}` : "none",
          transition: reducido ? "none" : "height 600ms cubic-bezier(.26,.84,.38,1)",
        }}
      />
      <div style={{
        position: "relative", height: "100%", padding: "8px 11px", boxSizing: "border-box",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: "2px",
      }}>
        <span style={{ fontFamily: SORA, fontSize: "11px", fontWeight: 700, lineHeight: 1.3, color: FAE.text }}>
          {ROTULO_BANDA}
        </span>
        <span data-rango style={{ fontSize: "10px", color: "rgba(248,249,250,0.6)" }}>{RANGO_BANDA}</span>
      </div>
    </div>
  );
}

/*
 * La figura entera. `escena` decide qué se atenúa y qué se resalta, y nada
 * más: el orden y el tamaño de las dos fotos no dependen de nada.
 */
export function FiguraDelTiempo({
  fotos, escena = null, llenado = 1, reducido = false, conCifras = false, interactiva = false,
}) {
  const [ampliada, setAmpliada] = useState(null);
  const cual = escena?.foto ?? null;

  const estadoFoto = (id) => {
    if (escena?.tipo === "una-foto") return { atenuada: cual !== id, resaltada: cual === id };
    if (escena?.tipo === "dos-fotos") return { atenuada: false, resaltada: true };
    if (escena?.tipo === "banda") return { atenuada: true, resaltada: false };
    return { atenuada: false, resaltada: false };
  };
  const bandaResaltada = escena?.tipo === "banda";
  const bandaAtenuada = escena?.tipo === "una-foto" || escena?.tipo === "dos-fotos";

  const foto = fotos.find((f) => f.id === ampliada) ?? null;

  return (
    <div data-figura-tiempo style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <Foto
        foto={fotos[0]}
        conCifras={conCifras}
        onAbrir={interactiva ? () => setAmpliada(fotos[0].id) : null}
        {...estadoFoto(fotos[0].id)}
      />
      <Banda llenado={llenado} atenuada={bandaAtenuada} resaltada={bandaResaltada} reducido={reducido} />
      <Foto
        foto={fotos[1]}
        conCifras={conCifras}
        onAbrir={interactiva ? () => setAmpliada(fotos[1].id) : null}
        {...estadoFoto(fotos[1].id)}
      />

      {/* Las dos resaltadas a la vez llevan además la línea escrita entre ellas. */}
      {escena?.tipo === "dos-fotos" && (
        <p data-entre-las-dos style={{
          margin: 0, padding: "5px 9px", borderRadius: "8px", fontSize: "11px", textAlign: "center",
          color: NAVY_DEL_CHIP, background: NEUTRO, fontFamily: SORA, fontWeight: 700,
        }}>
          la diferencia entre las dos
        </p>
      )}

      {foto && (
        <div data-ampliada={foto.id} style={{
          padding: "11px 13px", borderRadius: "12px",
          background: "rgba(10,20,34,0.7)", border: `1px solid ${NEUTRO}`,
        }}>
          <Foto foto={foto} conCifras={conCifras} />
          <button
            type="button"
            data-cerrar-ampliada
            onClick={() => setAmpliada(null)}
            style={{
              marginTop: "8px", padding: "6px 12px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.3)",
              color: FAE.text, fontFamily: SORA, fontSize: "11.5px", fontWeight: 600,
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
