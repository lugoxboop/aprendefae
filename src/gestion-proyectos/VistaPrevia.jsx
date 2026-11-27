/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · LA VISTA PREVIA (NO PUBLICADA)
 *
 * Se abre SOLO escribiendo la dirección #/gestion-proyectos. Ningún índice,
 * tarjeta ni camino del sitio enlaza aquí, y la materia no está en
 * src/data/subjects.js: nada se ve para los estudiantes hasta que Mateo
 * apruebe. Es el mismo trato que la vista previa de Macro 2026.
 *
 * Qué enseña: el esqueleto de la materia (módulos, procesos, documentos) y,
 * por cada proceso, si su espacio de Aprender y de Hacer ya tiene pieza. Es
 * la hoja de ruta común de Gen, Jane y quien construya: un hueco se ve aquí.
 *
 * Sin animaciones a propósito (regla p): es una página de consulta. Los
 * módulos se abren con <details>, que es Baseline amplio y accesible solo.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { FAE } from "../theme.js";
import { AREAS, GUIA, MODULOS, NOMBRE_MATERIA, SUBTEMAS } from "./estructura.js";
import { PIEZAS, coberturaDe, todasLasPiezas } from "./catalogo.js";
import Microvideo from "./Microvideo.jsx";

const VERDE = FAE.teal;
const LINEA = "rgba(203,220,242,0.16)";
const TENUE = "rgba(248,249,250,0.68)";

const CSS = `
.gp-previa { min-height: 100vh; background: ${FAE.bg}; color: ${FAE.text}; font-family: Inter, system-ui, sans-serif; -webkit-text-size-adjust: 100%; }
.gp-previa *, .gp-previa *::before, .gp-previa *::after { box-sizing: border-box; }
.gp-hoja { max-width: 820px; margin: 0 auto; padding: 24px 16px 64px; }
.gp-volver { min-height: 44px; padding: 10px 16px; border-radius: 999px; border: 1px solid ${LINEA}; background: transparent; color: ${FAE.text}; font: 600 14px/20px Inter, system-ui, sans-serif; cursor: pointer; }
.gp-volver:focus-visible, .gp-modulo > summary:focus-visible { outline: 2px solid ${VERDE}; outline-offset: 3px; }
.gp-sello { display: inline-block; margin-top: 20px; padding: 4px 10px; border-radius: 999px; border: 1px solid ${VERDE}; color: ${VERDE}; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.gp-titulo { font-family: Sora, Inter, sans-serif; font-size: clamp(28px, 7vw, 44px); line-height: 1.1; margin: 12px 0 8px; overflow-wrap: anywhere; }
.gp-guia { margin: 0; color: ${TENUE}; font-size: 14px; line-height: 1.45; }
.gp-cifras { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 24px 0; }
@media (min-width: 560px) { .gp-cifras { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.gp-cifra { border: 1px solid ${LINEA}; border-radius: 14px; padding: 12px; background: rgba(29,53,87,0.45); }
.gp-cifra b { display: block; font-family: Sora, Inter, sans-serif; font-size: 26px; line-height: 1.1; font-variant-numeric: tabular-nums; }
.gp-cifra span { font-size: 12px; color: ${TENUE}; }
.gp-ruta { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0 0 24px; list-style: none; }
.gp-ruta li { font-size: 12px; font-weight: 600; padding: 6px 10px; border-radius: 999px; background: rgba(42,157,143,0.14); color: ${FAE.text}; }
.gp-ruta li + li::before { content: "→ "; color: ${VERDE}; }
.gp-modulos { display: flex; flex-direction: column; gap: 12px; }
.gp-modulo { border: 1px solid ${LINEA}; border-radius: 16px; background: rgba(29,53,87,0.35); overflow: hidden; }
.gp-modulo[open] { border-color: rgba(42,157,143,0.55); }
.gp-modulo > summary { list-style: none; cursor: pointer; padding: 16px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 12px; align-items: start; }
.gp-modulo > summary::-webkit-details-marker { display: none; }
.gp-num { grid-row: span 3; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: ${VERDE}; color: ${FAE.bg}; font: 700 16px/1 Sora, Inter, sans-serif; }
.gp-mod-titulo { font: 700 18px/1.25 Sora, Inter, sans-serif; margin: 0; overflow-wrap: anywhere; }
.gp-mod-resumen { margin: 0; font-size: 14px; line-height: 1.4; color: ${TENUE}; }
.gp-mod-datos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.gp-dato { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; border: 1px solid ${LINEA}; color: ${TENUE}; white-space: nowrap; }
.gp-dato[data-alerta="1"] { border-color: rgba(233,196,106,0.6); color: ${FAE.ambar}; }
.gp-procesos { list-style: none; margin: 0; padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px; }
.gp-proceso { border-top: 1px solid ${LINEA}; padding-top: 12px; }
.gp-pro-cabeza { display: flex; gap: 10px; align-items: baseline; }
.gp-seccion { flex: none; font: 600 12px/1 ui-monospace, "Geist Mono", monospace; color: ${VERDE}; min-width: 34px; }
.gp-pro-nombre { margin: 0; font-size: 15px; line-height: 1.35; font-weight: 600; overflow-wrap: anywhere; }
.gp-area { font-size: 12px; color: ${TENUE}; margin: 2px 0 0 44px; }
.gp-docs { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0 44px; padding: 0; list-style: none; }
.gp-doc { font-size: 12px; line-height: 1.3; padding: 4px 8px; border-radius: 8px; background: rgba(203,220,242,0.10); }
.gp-doc::before { content: "📄 "; }
.gp-espacios { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0 44px; }
.gp-espacio { font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 8px; border: 1px dashed ${LINEA}; color: ${TENUE}; }
.gp-espacio[data-lleno="1"] { border-style: solid; border-color: ${VERDE}; color: ${FAE.text}; }
.gp-nota { margin-top: 28px; font-size: 13px; line-height: 1.5; color: ${TENUE}; }
@media (max-width: 400px) {
  .gp-area, .gp-docs, .gp-espacios { margin-left: 0; }
}
`;

export default function VistaPreviaGestionProyectos({ onBack }) {
  const documentos = new Set(SUBTEMAS.flatMap((s) => s.documentos));
  const procesos = SUBTEMAS.filter((s) => s.area).length;
  const piezas = todasLasPiezas().length;
  return (
    <div className="gp-previa" data-vista-previa-gp>
      <style>{CSS}</style>
      <main className="gp-hoja">
        <button type="button" className="gp-volver" onClick={onBack}>← Inicio</button>
        <span className="gp-sello">Vista previa · no publicada</span>
        <h1 className="gp-titulo">{NOMBRE_MATERIA}</h1>
        <p className="gp-guia">{GUIA}. Esqueleto de la materia: el detalle fino se ajusta con el syllabus.</p>

        <div className="gp-cifras">
          <div className="gp-cifra"><b>{MODULOS.length}</b><span>módulos</span></div>
          <div className="gp-cifra"><b>{procesos}</b><span>procesos de la guía</span></div>
          <div className="gp-cifra"><b>{documentos.size}</b><span>documentos</span></div>
          <div className="gp-cifra"><b>{piezas}</b><span>piezas en sus espacios</span></div>
        </div>

        <ol className="gp-ruta" aria-label="Orden de los módulos">
          {MODULOS.map((m) => <li key={m.id}>{m.titulo}</li>)}
        </ol>

        <div className="gp-modulos">
          {MODULOS.map((m, i) => {
            const cob = coberturaDe(m.id);
            const porId = new Map(cob.procesos.map((x) => [x.id, x]));
            const docs = new Set(m.procesos.flatMap((pr) => pr.documentos)).size;
            return (
              <details className="gp-modulo" key={m.id} data-modulo={m.id} open={i === 0}>
                <summary>
                  <span className="gp-num" aria-hidden="true">{i}</span>
                  <h2 className="gp-mod-titulo">{m.titulo}</h2>
                  <p className="gp-mod-resumen">{m.resumen}</p>
                  <span className="gp-mod-datos">
                    <span className="gp-dato">{m.procesos.length} {m.id === "gp-fundamentos" ? "subtemas" : "procesos"}</span>
                    {docs > 0 && <span className="gp-dato">{docs} documentos</span>}
                    <span className="gp-dato">Aprender {cob.aprender} · Hacer {cob.hacer}</span>
                    {cob.sinPieza > 0 && <span className="gp-dato" data-alerta="1">{cob.sinPieza} sin pieza</span>}
                  </span>
                </summary>
                <ul className="gp-procesos">
                  {m.procesos.map((pr) => {
                    const c = porId.get(pr.id);
                    return (
                      <li className="gp-proceso" key={pr.id} data-subtema={pr.id}>
                        <div className="gp-pro-cabeza">
                          <span className="gp-seccion">{pr.seccion}</span>
                          <p className="gp-pro-nombre">{pr.nombre}</p>
                        </div>
                        {pr.area && <p className="gp-area">Área: {AREAS[pr.area].nombre}</p>}
                        {pr.documentos.length > 0 && (
                          <ul className="gp-docs">
                            {pr.documentos.map((d) => <li className="gp-doc" key={d}>{d}</li>)}
                          </ul>
                        )}
                        {(PIEZAS[m.id] ?? []).filter((pz) => pz.microvideo && pz.subtemas?.[0] === pr.id).map((pz) => <Microvideo key={pz.id} id={pz.id} />)}
                        <div className="gp-espacios">
                          <span className="gp-espacio" data-lleno={c?.aprender ? "1" : "0"}>Aprender {c?.aprender ? "✓" : "· espacio libre"}</span>
                          <span className="gp-espacio" data-lleno={c?.hacer ? "1" : "0"}>Hacer {c?.hacer ? "✓" : "· espacio libre"}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>

        <p className="gp-nota">
          Esta página solo existe por su dirección y no aparece en el sitio. Las piezas de Jane y Gen
          entran en el espacio de su proceso ({Object.keys(PIEZAS).length} módulos listos para recibirlas).
        </p>
      </main>
    </div>
  );
}
