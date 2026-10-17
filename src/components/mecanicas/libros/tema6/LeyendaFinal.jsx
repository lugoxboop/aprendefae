import { useEffect, useMemo } from "react";
import { FAE } from "../../../../theme.js";

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
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: o?.correcta ? o.texto : null };
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

/* El modelo y, debajo, la frase buena como su leyenda. */
export function ConLeyenda({ id, leyenda, children }) {
  return (
    <div data-modelo-final={id}>
      <div style={{ maxWidth: "320px", margin: "0 auto" }}>{children}</div>
      {leyenda && <p data-leyenda style={{ margin: "8px 0 0", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.5, color: FAE.text }}>{leyenda}</p>}
    </div>
  );
}
