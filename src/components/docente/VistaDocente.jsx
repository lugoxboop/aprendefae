import { ArrowLeft } from "lucide-react";
import { TONOS, variablesDeTono } from "../shared/TarjetaTema.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MARCO DE CADA VISTA INTERNA DEL PANEL DOCENTE (Mateo, 18 nov.: «una vez
 * entro a cualquiera de los componentes de adentro, no mantienen esta misma
 * estética»).
 *
 * La portada (PortadaDocente) presenta seis tarjetas, cada una con su color.
 * Al tocar una, la vista que se abre CONTINÚA esa tarjeta: misma pastilla,
 * mismo color, mismo rótulo y el título en grande. Así el docente sabe dónde
 * está sin leer, y la vuelta («‹ Panel») siempre está en el mismo sitio.
 *
 * El color se hereda por variables CSS (--tono, --tono-rgb, --tono-claro):
 * toda tarjeta de dentro (tarjetaV1, estiloV1.js) lo lee y se tiñe apenas.
 * Las cifras y los textos siguen en blanco o en el gris de siempre; el tono
 * solo pinta formas, bordes y rótulos (la regla de las tarjetas de temas).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TONO_VISTA = {
  riesgo: "rosa",
  estudiantes: "cielo",
  estudiante: "cielo",
  actividades: "violeta",
  actividad: "violeta",
  esfuerzo: "indigo",
  clase: "menta",
  atencion: "ambar",
  fabrica: "menta",
};

export const CSS_VISTAS = `
@keyframes pdv-sube { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes pdv-entra { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
@keyframes pdv-barra { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.pdv-sube { animation: pdv-sube 460ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 60ms); }
.pdv-entra { animation: pdv-entra 340ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(140ms + min(var(--i, 0), 12) * 28ms); }

/* La vuelta: una pastilla con flecha, siempre arriba a la izquierda. */
.pdv-volver {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px 0 12px; margin-bottom: 14px;
  border-radius: 999px; cursor: pointer; font-family: Sora, sans-serif; font-size: 13.5px; font-weight: 600; color: #F8F9FA;
  background: rgba(var(--tono-rgb), 0.10); border: 1px solid rgba(var(--tono-rgb), 0.32);
  transition: background-color 180ms ease, border-color 180ms ease, transform 220ms cubic-bezier(.22,1,.36,1);
}
.pdv-volver svg { color: var(--tono-claro); transition: transform 220ms cubic-bezier(.34,1.56,.64,1); }
.pdv-volver:hover, .pdv-volver:focus-visible { background: rgba(var(--tono-rgb), 0.18); border-color: rgba(var(--tono-rgb), 0.6); }
.pdv-volver:hover svg { transform: translateX(-3px); }
.pdv-volver:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }

/* La cabecera: la tarjeta de la portada, abierta. */
.pdv-hero {
  position: relative; overflow: hidden; isolation: isolate; margin-bottom: 18px;
  padding: clamp(18px, 3vw, 28px); border-radius: 24px;
  background:
    radial-gradient(110% 130% at 0% 0%, rgba(var(--tono-rgb), 0.26), transparent 55%),
    linear-gradient(180deg, #1B2B47 0%, #142139 100%);
  border: 1px solid rgba(var(--tono-rgb), 0.30);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px -30px rgba(var(--tono-rgb), 0.55);
}
.pdv-hero__linea { position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(var(--tono-rgb), 0.95), transparent); opacity: .7; }
.pdv-hero__marca { position: absolute; right: -30px; bottom: -44px; color: var(--tono); opacity: .09; transform: rotate(-12deg); pointer-events: none; }
.pdv-hero__fila { display: flex; align-items: center; gap: 16px; min-width: 0; }
.pdv-hero .fae-tema__pastilla { width: 56px; height: 56px; }
.pdv-hero__texto { flex: 1; min-width: 0; }
.pdv-rotulo { margin: 0 0 4px; font-family: Sora, sans-serif; font-weight: 700; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--tono-claro); }
.pdv-titulo { margin: 0; font-family: Sora, sans-serif; font-weight: 700; font-size: clamp(24px, 3.4vw, 32px); line-height: 1.1; letter-spacing: -.025em; color: #F8F9FA; overflow-wrap: anywhere; }
.pdv-sub { margin: 12px 0 0; font-size: 14.5px; line-height: 1.55; color: rgba(248,249,250,0.76); max-width: 66ch; }
.pdv-accion { flex-shrink: 0; }
@media (max-width: 519px) {
  /* Rejilla: pastilla y título arriba, el texto debajo y la acción al final, a lo ancho. */
  .pdv-hero { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 14px; align-items: center; }
  .pdv-hero__fila { display: contents; }
  .pdv-sub { grid-column: 1 / -1; grid-row: 2; }
  .pdv-accion { grid-column: 1 / -1; grid-row: 3; margin-top: 14px; }
  .pdv-hero .fae-tema__pastilla { width: 48px; height: 48px; border-radius: 15px; }
  .pdv-accion { width: 100%; }
  .pdv-accion > * { width: 100%; justify-content: center; }
}

/* Cifras en ficha: el número grande, la etiqueta debajo. */
.pdv-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.pdv-kpi {
  min-width: 0; padding: 14px 14px 13px; border-radius: 16px;
  background: rgba(248,249,250,0.045); border: 1px solid rgba(248,249,250,0.09);
}
.pdv-kpi__rotulo { margin: 0 0 8px; font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #A8B6C8; }
.pdv-kpi__valor { margin: 0; font-family: Sora, sans-serif; font-size: 26px; font-weight: 700; line-height: 1.05; font-variant-numeric: tabular-nums; color: #F8F9FA; }
.pdv-kpi__pie { margin: 6px 0 0; font-size: 12px; line-height: 1.4; color: #A8B6C8; }

/* Una fila de lista que se toca: como las del menú de la cuenta. */
.pdv-fila {
  width: 100%; display: flex; align-items: center; gap: 12px; min-height: 58px; padding: 8px 12px; border-radius: 14px;
  text-align: left; font: inherit; color: #F8F9FA; cursor: pointer;
  background: rgba(248,249,250,0.035); border: 1px solid rgba(248,249,250,0.07);
  transition: background-color 160ms ease, border-color 160ms ease, transform 220ms cubic-bezier(.22,1,.36,1);
}
.pdv-fila:hover, .pdv-fila:focus-visible { background: rgba(var(--tono-rgb), 0.10); border-color: rgba(var(--tono-rgb), 0.45); transform: translateX(2px); }
.pdv-fila:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.pdv-fila__flecha { flex-shrink: 0; color: var(--tono-claro); opacity: .45; transition: opacity 160ms ease, transform 200ms ease; }
.pdv-fila:hover .pdv-fila__flecha, .pdv-fila:focus-visible .pdv-fila__flecha { opacity: 1; transform: translateX(2px); }

/* La inicial en su círculo, en lugar de la foto que el panel no tiene. */
.pdv-inicial { width: 40px; height: 40px; border-radius: 999px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; font-family: Sora, sans-serif; font-weight: 700; font-size: 15px; color: #0E1B2E; }

/* Botones: el principal se llena del tono, el secundario es un contorno. */
.pdv-boton {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 0 16px;
  border-radius: 999px; cursor: pointer; font-family: Sora, sans-serif; font-size: 13px; font-weight: 600;
  color: #F8F9FA; background: rgba(var(--tono-rgb), 0.16); border: 1px solid rgba(var(--tono-rgb), 0.5);
  transition: background-color 160ms ease, border-color 160ms ease;
}
.pdv-boton:hover, .pdv-boton:focus-visible { background: rgba(var(--tono-rgb), 0.28); }
.pdv-boton--suave { background: transparent; border-color: rgba(248,249,250,0.16); color: #C9D3DF; }
.pdv-boton--suave:hover, .pdv-boton--suave:focus-visible { background: rgba(248,249,250,0.06); border-color: rgba(248,249,250,0.3); }
.pdv-boton:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }

/* La barra de progreso de una fila (temas, historial). */
.pdv-barra { height: 7px; border-radius: 999px; background: rgba(248,249,250,0.09); overflow: hidden; }
.pdv-barra > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, rgba(var(--tono-rgb), 0.85), var(--tono-claro)); transform-origin: left; animation: pdv-barra 900ms cubic-bezier(.22,1,.36,1) 250ms both; }

/* Un rótulo de sección dentro de una vista. */
.pdv-seccion { margin: 22px 2px 10px; font-family: Sora, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--tono-claro); }

.pdv-buscar {
  width: 100%; min-height: 48px; padding: 0 16px; border-radius: 14px; box-sizing: border-box; margin-bottom: 14px;
  background: rgba(248,249,250,0.05); border: 1px solid rgba(var(--tono-rgb), 0.28); color: #F8F9FA;
  font-family: Inter, sans-serif; font-size: 14.5px; transition: border-color 160ms ease, background-color 160ms ease;
}
.pdv-buscar::placeholder { color: #8E9BAD; }
.pdv-buscar:focus { outline: none; border-color: rgba(var(--tono-rgb), 0.8); background: rgba(var(--tono-rgb), 0.06); }

@media (prefers-reduced-motion: reduce) {
  .pdv-sube, .pdv-entra, .pdv-barra > span { animation: none; }
  .pdv-fila, .pdv-fila:hover, .pdv-volver, .pdv-volver:hover svg { transform: none; transition: none; }
}
`;

/* La inicial con el color que le toque (el nivel de alerta, o el tono de la vista). */
export function Inicial({ nombre, color = "var(--tono)", tamano = 40 }) {
  const letra = (nombre ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="pdv-inicial" aria-hidden="true" style={{ background: color, width: `${tamano}px`, height: `${tamano}px`, fontSize: `${Math.round(tamano * 0.38)}px` }}>
      {letra}
    </span>
  );
}

export function Kpi({ rotulo, valor, pie, i = 0, ...resto }) {
  return (
    <div className="pdv-kpi pdv-sube" style={{ "--i": i }} {...resto}>
      <p className="pdv-kpi__rotulo">{rotulo}</p>
      <p className="pdv-kpi__valor">{valor}</p>
      {pie && <p className="pdv-kpi__pie">{pie}</p>}
    </div>
  );
}

/*
 * El marco: la vuelta, la cabecera con el color de la tarjeta de la portada,
 * y debajo lo de siempre. `vista` elige el tono (TONO_VISTA).
 */
export default function VistaDocente({
  vista, Glifo, rotulo, titulo, tituloId, sub, accion, onVolver, textoVolver = "Panel", children, ...resto
}) {
  const tono = TONOS[TONO_VISTA[vista] ?? "cielo"];
  return (
    <div className="pdv" style={variablesDeTono(tono)} {...resto}>
      <style>{CSS_VISTAS}</style>
      <button type="button" className="pdv-volver pdv-sube" onClick={onVolver} data-volver>
        <ArrowLeft size={17} strokeWidth={2.4} aria-hidden="true" />
        {textoVolver}
      </button>
      <header className="pdv-hero pdv-sube" style={{ "--i": 1 }}>
        <span className="pdv-hero__linea" aria-hidden="true" />
        {Glifo && <span className="pdv-hero__marca" aria-hidden="true"><Glifo size={170} strokeWidth={1.2} /></span>}
        <div className="pdv-hero__fila">
          {Glifo && (
            <span className="fae-tema__pastilla" aria-hidden="true">
              <Glifo size={26} strokeWidth={2} />
            </span>
          )}
          <div className="pdv-hero__texto">
            {rotulo && <p className="pdv-rotulo">{rotulo}</p>}
            <h2 id={tituloId} className="pdv-titulo">{titulo}</h2>
          </div>
          {accion && <div className="pdv-accion">{accion}</div>}
        </div>
        {/* En el teléfono la acción baja a lo ancho; el texto va debajo de ella, no entre el título y el botón. */}
        {sub && <div className="pdv-sub">{sub}</div>}
      </header>
      <div className="pdv-sube" style={{ "--i": 2 }}>{children}</div>
    </div>
  );
}
