/*
 * GESTIÓN DE PROYECTOS · PIEZAS COMUNES DE LAS ESCENAS DEL LOTE 5 (caps. 9 y 10).
 *
 * La hoja del lote 4 (y con ella la del 3 y el 2) más lo propio de estos
 * capítulos: la tabla de una lámina (la RACI de la tarima, la hoja de
 * catación, el tablero de salidas), una barra horizontal con su cifra escrita
 * (estibas, ecosonda, el revelado del faro) y la disposición «consola» de
 * c09 H09 (tres controles por fila también a 320 px, diseño H09).
 *
 * Regla de este lote (orden de Gen tras el lote 4): ninguna lámina muestra la
 * respuesta de un paso antes de que el estudiante la dé. Lo que aún no se ha
 * resuelto se pinta como «?»; las ayudas `resuelto` y `hecho` dicen si un paso
 * de la etapa ya quedó atrás.
 */
import { CSS_LOTE4 } from "./lote4.jsx";

export const CSS_LOTE5 = `${CSS_LOTE4}
.gp5-tabla { width: 100%; border-collapse: collapse; font: 600 13px/1.25 var(--planck-font-sans, system-ui, sans-serif); color: #f4f5f7; table-layout: fixed; }
.gp5-tabla th, .gp5-tabla td { padding: 4px 2px; text-align: center; border-top: 1px solid rgba(244,245,247,.2); overflow-wrap: anywhere; }
.gp5-tabla th { font-size: 12px; color: #b6bbc5; font-weight: 700; }
.gp5-tabla th:first-child, .gp5-tabla td:first-child { text-align: left; }
.gp5-tabla tr[data-actual="1"] td { background: rgba(255,201,120,.14); }
.gp5-tabla .gp5-mono { font-family: var(--planck-font-mono, ui-monospace, monospace); font-weight: 800; }
.gp5-barras { display: grid; gap: 6px; }
.gp5-barra { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 8px; align-items: center; font: 600 13px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
.gp5-barra > i { grid-column: 1 / -1; position: relative; height: 12px; border-radius: 999px; background: rgba(244,245,247,.16); overflow: hidden; }
.gp5-barra > i > b { position: absolute; inset: 0; transform-origin: 0 50%; background: var(--gp5-color, #ffc978); transition: transform 520ms cubic-bezier(.2,.8,.2,1); }
.gp5-barra > i > s { position: absolute; top: -2px; bottom: -2px; width: 0; border-left: 2px dashed #f4f5f7; }
.gp5-barra .gp5-mono { font-family: var(--planck-font-mono, ui-monospace, monospace); font-weight: 800; }
.gp5-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.gp5-chip { padding: 2px 8px; border-radius: 999px; background: rgba(244,245,247,.14); border: 1px solid rgba(244,245,247,.3); font: 600 12px/18px var(--planck-font-sans, system-ui, sans-serif); }
.gp5-chip[data-on="1"] { background: #fbf7ee; color: #121418; border-color: #fbf7ee; }
.gp-destinos[data-disposicion="consola"] { --gp-cols: 3; }
.gp-destinos[data-disposicion="consola"] .gp-destino { min-height: 64px; padding: 6px 3px; }
.gp-destinos[data-disposicion="consola"] .gp-destino-txt { font-size: 12px; line-height: 1.2; hyphens: none; -webkit-hyphens: none; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .gp5-barra > i > b { transition: none !important; } }
`;

export const EstiloLote5 = () => <style>{CSS_LOTE5}</style>;

/* ¿El paso `id` ya quedó resuelto en esta etapa (o es el actual y acaba de encajar)? */
export function resuelto(estado, id) {
  if ((estado.etapa?.hechos ?? []).some((h) => h.paso.id === id)) return true;
  return estado.paso?.id === id && Boolean(estado.encaja || estado.revelado);
}

/* El `destino` con que terminó un paso anterior de la etapa (la apuesta de c10 H04). */
export const destinoDe = (estado, id) => (estado.etapa?.hechos ?? []).find((h) => h.paso.id === id)?.destino ?? null;

/* «12000» → «12.000». */
export const puntos = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Una barra horizontal: `valor` de `max`, con la cifra escrita; `marca` es la línea punteada del plan. */
export function BarraH({ nombre, valor = null, max, texto = null, marca = null, color = "#ffc978" }) {
  const f = valor == null ? 0 : Math.max(0, Math.min(1, valor / max));
  return (
    <div className="gp5-barra" data-barra-h={nombre}>
      <span>{nombre}</span>
      <span className="gp5-mono">{texto ?? (valor == null ? "?" : puntos(valor))}</span>
      <i aria-hidden="true">
        <b style={{ transform: `scaleX(${f})`, "--gp5-color": color }} />
        {marca != null && <s style={{ left: `${Math.min(100, (marca / max) * 100)}%` }} />}
      </i>
    </div>
  );
}

/** Una lámina con título (la hoja del lote 4) y su contenido. */
export function Lamina({ titulo, children, ...resto }) {
  return (
    <div className="gp4-lamina" {...resto}>
      {titulo && <b>{titulo}</b>}
      {children}
    </div>
  );
}
