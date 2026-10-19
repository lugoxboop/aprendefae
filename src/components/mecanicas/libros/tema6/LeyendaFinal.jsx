import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { vueltasDe, sumarVuelta, esVariante } from "../../../../contabilidad/b5Vuelta.js";
import { barajar } from "../../../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FRASE PEGADA AL MODELO · lo común de la capa 4 con `FiguraFinal`
 * (lote 7 en T6 · A3, lote 12 en el resto de T6, lote 13 en T5).
 * CuatroCapas pinta la `FiguraFinal` encima de la Capa4 y le pasa a esta
 * `ponerLeyenda`; aquí, cómo la Capa4 la usa y cómo la figura la pinta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Lote 7 (A3) y lote 12 (A1, A2, A4 y A5): la frase buena viaja como «escena»;
 * así la leyenda del modelo final la pone un efecto, no el render.
 */
export const evaluadorDe = (opciones) => (id) => {
  const o = opciones.find((x) => x.id === id);
  /* Lote 29: si la opción trae su `frase` (la devolución de la correcta en la segunda visita), esa va pegada al modelo. */
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: o?.correcta ? (o.frase ?? o.texto) : null };
};
function LeyendaDeLaFrase({ escena, ponerLeyenda }) {
  useEffect(() => {
    if (!ponerLeyenda || !escena) return undefined;
    ponerLeyenda(escena);
    return () => ponerLeyenda(null);
  }, [escena, ponerLeyenda]);
  return null;
}
/* Un tipo estable: si cambiara en cada render, la leyenda se quitaría y se pondría sin fin. */
export const useEscenaConLeyenda = (ponerLeyenda) =>
  useMemo(() => function EscenaConLeyenda({ escena }) { return <LeyendaDeLaFrase escena={escena} ponerLeyenda={ponerLeyenda} />; }, [ponerLeyenda]);

/*
 * Lote 27 · D8 (propuesta de Shoko): la capa 4 de la segunda visita usa la pregunta de antes del cambio C1.
 * Cuenta como visita cada capa 4 acertada (la frase buena llega a la leyenda); la visita k usa la de antes
 * si es impar, como las vueltas de los Hacer (b5Vuelta.js). La figura lee la misma cuenta al montarse.
 */
const claveAprender = (id) => `aprender:${id}`;
export const useVarianteCapa4 = (id) => useState(() => esVariante(vueltasDe(claveAprender(id))))[0];
export function useVueltaCapa4(id, ponerLeyenda) {
  const variante = useVarianteCapa4(id);
  const contada = useRef(false);
  const poner = useCallback((t) => {
    if (t && !contada.current) { contada.current = true; sumarVuelta(claveAprender(id)); }
    ponerLeyenda?.(t);
  }, [id, ponerLeyenda]);
  return { variante, poner };
}

/*
 * Lote 28 · D8 en T6 A2, A4 y A5 (sin pregunta de antes de C1): desde la segunda visita (una capa 4 ya
 * acertada), la capa 3 baraja una vez por intento el orden de sus cajas y el de las opciones de cada caja,
 * como la Célula C en #449; siempre distinto del de los datos, para que la visita no salga igual. La capa 4
 * (UnaFrase) ya baraja sus opciones en cada intento. Sin texto nuevo.
 */
export function barajarDistinto(xs, mezclar = barajar) {
  if (xs.length < 2) return xs;
  for (let k = 0; k < 8; k++) {
    const r = mezclar(xs);
    if (r.some((x, i) => x !== xs[i])) return r;
  }
  return [...xs.slice(1), xs[0]];
}
export const useSegundaVisita = (id) => useState(() => vueltasDe(claveAprender(id)) >= 1)[0];

/* El modelo y, debajo, la frase buena como su leyenda. */
export function ConLeyenda({ id, leyenda, children }) {
  return (
    <div data-modelo-final={id}>
      <div style={{ maxWidth: "320px", margin: "0 auto" }}>{children}</div>
      {leyenda && <p data-leyenda style={{ margin: "8px 0 0", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.5, color: FAE.text }}>{leyenda}</p>}
    </div>
  );
}
