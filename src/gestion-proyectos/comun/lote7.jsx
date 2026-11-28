/*
 * GESTIÓN DE PROYECTOS · PIEZAS COMUNES DE LAS ESCENAS DEL LOTE 7 (cap. 13).
 *
 * La hoja del lote 6 (y con ella las de los lotes 2 a 5) más lo propio de la
 * planta de agua de la vereda: las sillas del salón comunal (el medidor de
 * apoyo de H09: forma + texto, no solo color), los tramos de agua que avanzan
 * (la acequia de H10 y la planta en corte de H11) y la casa de guadua en
 * corte (H05: cada parte se enciende cuando recibe a su interesado).
 *
 * Regla de los lotes 5 a 7: ninguna lámina muestra la respuesta de un paso
 * antes de que el estudiante la dé (lo que aún no se resolvió va en «?» o
 * apagado).
 */
import { CSS_LOTE6 } from "./lote6.jsx";

export { BarraH, Lamina, resuelto, destinoDe, Rejilla } from "./lote6.jsx";
export { colocados, cuantos } from "./lote2.jsx";

export const CSS_LOTE7 = `${CSS_LOTE6}
.gp7-sillas { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4px; margin-top: 6px; }
.gp7-silla { height: 22px; border-radius: 6px 6px 2px 2px; border: 2px solid rgba(244,245,247,.45); background: transparent; }
.gp7-silla[data-llena="1"] { background: #fbf7ee; border-color: #fbf7ee; }
.gp7-silla[data-llena="1"]::after { content: ""; display: block; width: 10px; height: 10px; margin: 3px auto 0; border-radius: 50%; background: #121418; }
.gp7-tramos { display: grid; grid-template-columns: repeat(var(--gp7-n, 5), minmax(0, 1fr)); gap: 4px; }
.gp7-tramo { display: grid; place-items: center; min-height: 40px; padding: 2px; border-radius: 8px; border: 2px solid rgba(244,245,247,.35); background: rgba(8,16,30,.7); font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; overflow-wrap: anywhere; }
.gp7-tramo[data-agua="1"] { border-color: #8ecae6; background: linear-gradient(to top, rgba(142,202,230,.85) 0 60%, rgba(8,16,30,.7) 60%); color: #121418; }
.gp7-tramo[data-agua="1"]::before { content: "≈ "; }
.gp7-casa { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 4px; }
.gp7-casa > div { display: grid; gap: 2px; align-content: start; min-height: 44px; padding: 4px 6px; border-radius: 8px; border: 2px dashed rgba(244,245,247,.35); font: 600 12px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
.gp7-casa > div[data-luz="1"] { border-style: solid; border-color: #ffc978; background: rgba(255,201,120,.16); }
.gp7-casa > div[data-luz="1"] > b::after { content: " · luz encendida"; font-weight: 600; color: #ffc978; }
.gp7-casa > [data-ancho="1"] { grid-column: 1 / -1; }
`;

export const EstiloLote7 = () => <style>{CSS_LOTE7}</style>;

/** Las sillas del salón: `llenas` de `n`, con el texto de lo que pasó. */
export function Sillas({ n = 12, llenas = 0, texto = null }) {
  return (
    <div data-sillas={llenas}>
      <div className="gp7-sillas" role="img" aria-label={`${llenas} de ${n} sillas ocupadas`}>
        {Array.from({ length: n }, (_, k) => <span key={k} className="gp7-silla" data-llena={k < llenas ? "1" : undefined} />)}
      </div>
      {texto && <small style={{ display: "block", marginTop: 4 }} data-apoyo>{texto}</small>}
    </div>
  );
}

/** Los tramos por donde avanza el agua: `con` es la lista de los que ya la tienen. */
export function Tramos({ tramos, con = [] }) {
  return (
    <div className="gp7-tramos" style={{ "--gp7-n": Math.min(tramos.length, 6) }} data-tramos={con.length}>
      {tramos.map((t) => <span key={t.id} className="gp7-tramo" data-tramo={t.id} data-agua={con.includes(t.id) ? "1" : undefined}>{t.nombre}</span>)}
    </div>
  );
}
