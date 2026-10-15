import { forwardRef, useImperativeHandle, useRef } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTANTE DE CAJONES (hoja 3 de Mai, calidad) — de la Célula B, para las
 * tres de fichas: b5-t5-a1, b5-t6-a1 y b5-t6-a7 (ClasificaDosNiveles).
 *
 * Un cajón por respuesta final, con la forma del árbol de decisión: el cajón
 * suelto de la opción de primer nivel que no abre panel, y un grupo de dos
 * cajones bajo una tapa con el nombre de la que sí lo abre. Los nombres son
 * los de las pestañas.
 *
 * Cada cajón lleva una pila de láminas (una por ficha colocada, 4 px de alto,
 * 2 de separación, crece hacia arriba; caben cuatro a la vista) y el número.
 * Sin color: la pila y el número dicen cuántas lleva. Todas las láminas son
 * iguales: el estante no pone nota.
 *
 * Lo elegido se ilumina (borde 2 nodo y relleno navy): el cajón suelto o la
 * tapa, y bajo la tapa el cajón del segundo nivel. Una copia de la ficha
 * vuela a su cajón (340 ms) o, en el primer fallo, va al elegido y rebota
 * (340 + 340 ms). Con movimiento reducido no hay vuelo: cambia al instante.
 *
 * Textos fijos (PARA SHOKO): el nombre del grupo, «Fichas colocadas», y la
 * lectura de cada cajón, «{nombre}: N fichas».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const FICHAS_COLOCADAS = "Fichas colocadas";
export const cuantasFichas = (n) => `${n} ${n === 1 ? "ficha" : "fichas"}`;

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const NODO = FAE.node;
const NAVY = FAE.navy;
const BORDE = NEUTRO;
const VISIBLES = 4;

/* La clave de un cajón: la opción suelta, o «grupo/opción». */
export const claveDe = (n1, n2) => (n2 ? `${n1}/${n2}` : n1);

/* La lectura de un cajón: «Otra cuenta por cobrar» o «Clientes, se debita». */
export function nombreLeido(config, clave) {
  const [a, b] = clave.split("/");
  const r1 = config.nivel1.find((x) => x.id === a).rotulo;
  if (!b) return r1;
  const r2 = config.nivel2.find((x) => x.id === b).rotulo;
  return `${r1}, ${r2.charAt(0).toLowerCase()}${r2.slice(1)}`;
}

const encendido = (si) => ({
  border: `${si ? 2 : 1}px solid ${si ? NODO : BORDE}`,
  background: si ? NAVY : "transparent",
});

function Cajon({ clave, nombre, cuantas, encendido: si, refDe, config }) {
  return (
    <div ref={refDe(clave)} data-cajon={clave} data-cuantas={cuantas} role="img" aria-label={`${nombreLeido(config, clave)}: ${cuantasFichas(cuantas)}`}
      style={{
        boxSizing: "border-box", minHeight: "70px", padding: si ? "5px" : "6px", borderRadius: "10px", minWidth: 0,
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "4px", ...encendido(si),
      }}>
      <span aria-hidden="true" style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "15px", color: FAE.text, overflowWrap: "anywhere" }}>{nombre}</span>
      <span aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        {/* La pila: crece hacia arriba; caben cuatro a la vista. */}
        <span data-pila style={{ display: "flex", flexDirection: "column-reverse", gap: "2px", width: "16px", minHeight: `${VISIBLES * 4 + (VISIBLES - 1) * 2}px` }}>
          {Array.from({ length: Math.min(cuantas, VISIBLES) }, (_, k) => (
            <span key={k} data-lamina style={{ display: "block", height: "4px", borderRadius: "1px", background: FAE.text }} />
          ))}
        </span>
        <span data-numero style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: FAE.text }}>{cuantas}</span>
      </span>
    </div>
  );
}

/*
 * El estante. `cuentas` es { clave: n }; `n1` y `n2`, lo elegido. Por la ref
 * expone `volar(clave, { rebote })`: una copia de `origen` (la ficha) vuela
 * al cajón y, con rebote, vuelve. Devuelve una promesa que se cumple al
 * llegar (o al instante, con movimiento reducido o sin animaciones).
 */
const EstanteDeCajones = forwardRef(function EstanteDeCajones({ config, cuentas, n1, n2, reducido, anuncio }, ref) {
  const cajones = useRef({});
  const refDe = (clave) => (el) => { cajones.current[clave] = el; };
  const suelta = config.nivel1.find((x) => x.id !== config.abre);
  const grupo = config.nivel1.find((x) => x.id === config.abre);

  useImperativeHandle(ref, () => ({
    volar(clave, origen, { rebote = false } = {}) {
      const destino = cajones.current[clave];
      if (reducido || !origen || !destino || typeof origen.animate !== "function") return Promise.resolve();
      const a = origen.getBoundingClientRect();
      const b = destino.getBoundingClientRect();
      const copia = origen.cloneNode(true);
      copia.removeAttribute("data-ficha");
      copia.setAttribute("aria-hidden", "true");
      Object.assign(copia.style, {
        position: "fixed", left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
        margin: 0, boxSizing: "border-box", pointerEvents: "none", zIndex: 30, transformOrigin: "top left", overflow: "hidden",
      });
      document.body.appendChild(copia);
      const escala = Math.min(b.width / a.width, b.height / a.height, 1) * 0.6;
      const llega = `translate(${b.left + (b.width - a.width * escala) / 2 - a.left}px, ${b.top + (b.height - a.height * escala) / 2 - a.top}px) scale(${escala})`;
      const pasos = rebote
        ? [{ transform: "none", opacity: 1 }, { transform: llega, opacity: 0.9, offset: 0.5 }, { transform: "none", opacity: 0 }]
        : [{ transform: "none", opacity: 1 }, { transform: llega, opacity: 0.9 }];
      const vuelo = copia.animate(pasos, { duration: rebote ? 680 : 340, easing: "ease-out", fill: "forwards" });
      return vuelo.finished.catch(() => {}).then(() => copia.remove());
    },
  }), [reducido]);

  const sueltaOn = n1 === suelta.id;
  const tapaOn = n1 === grupo.id;
  return (
    <div data-estante role="group" aria-label={FICHAS_COLOCADAS} style={{
      display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", columnGap: "6px", alignItems: "end", margin: "0 0 10px",
    }}>
      <div style={{ gridColumn: "1", gridRow: "2" }}>
        <Cajon clave={suelta.id} nombre={suelta.rotulo} cuantas={cuentas[suelta.id] ?? 0} encendido={sueltaOn} refDe={refDe} config={config} />
      </div>
      {/* La tapa del grupo: una pestaña sin borde inferior, apoyada sobre sus dos cajones. */}
      <div data-tapa={grupo.id} aria-hidden="true" style={{
        gridColumn: "2 / span 2", gridRow: "1", boxSizing: "border-box", padding: tapaOn ? "2px 9px" : "3px 10px", marginBottom: "-1px",
        borderRadius: "8px 8px 0 0", borderBottom: "none", ...encendido(tapaOn), borderBottomStyle: "none",
        fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "15px", color: FAE.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {grupo.rotulo}
      </div>
      {config.nivel2.map((o, k) => {
        const clave = claveDe(grupo.id, o.id);
        return (
          <div key={o.id} style={{ gridColumn: String(k + 2), gridRow: "2" }}>
            <Cajon clave={clave} nombre={o.rotulo} cuantas={cuentas[clave] ?? 0} encendido={tapaOn && n2 === o.id} refDe={refDe} config={config} />
          </div>
        );
      })}
      <p data-anuncio-estante aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", margin: 0 }}>{anuncio}</p>
    </div>
  );
});

export default EstanteDeCajones;
