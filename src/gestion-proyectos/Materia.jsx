/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS — LA PÁGINA DE LA MATERIA PARA ESTUDIANTES
 *
 * Publicada por orden de Mateo el 27-nov-2026 («publica todo»), solo con lo que
 * él aprobó: el microvideo GP-01 y el simulador «Arma tu acta». Lo demás sale
 * cuando él apruebe cada pieza (entra a PUBLICADAS en catalogo.js).
 *
 * Decisión de Mateo (27-nov): inicio → cierre se enseña como GRUPOS DE PROCESOS,
 * nunca como una línea de tiempo de fases (guía PMBOK 6.ª ed., p. 18: «Los
 * grupos de procesos de la dirección de proyectos no son fases del proyecto»).
 * Por eso los grupos van como tarjetas, sin flechas entre ellas.
 *
 * La vista previa interna (cobertura, espacios libres) sigue en
 * #/gestion-proyectos/previa.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { FAE } from "../theme.js";
import { GUIA, MODULOS, NOMBRE_MATERIA } from "./estructura.js";
import { PIEZAS, estaPublicada } from "./catalogo.js";
import Microvideo from "./Microvideo.jsx";


const VERDE = FAE.teal;
const LINEA = "rgba(203,220,242,0.16)";
const TENUE = "rgba(248,249,250,0.72)";

const CSS = `
.gpm { min-height: 100vh; background: ${FAE.bg}; color: ${FAE.text}; font-family: Inter, system-ui, sans-serif; -webkit-text-size-adjust: 100%; }
.gpm *, .gpm *::before, .gpm *::after { box-sizing: border-box; }
.gpm-hoja { max-width: 820px; margin: 0 auto; padding: 24px 16px 64px; }
.gpm-volver { min-height: 44px; padding: 10px 16px; border-radius: 999px; border: 1px solid ${LINEA}; background: transparent; color: ${FAE.text}; font: 600 14px/20px Inter, system-ui, sans-serif; cursor: pointer; }
.gpm-volver:focus-visible, .gpm-sim:focus-visible { outline: 2px solid ${VERDE}; outline-offset: 3px; }
.gpm-titulo { font-family: Sora, Inter, sans-serif; font-size: clamp(28px, 7vw, 44px); line-height: 1.1; margin: 20px 0 8px; overflow-wrap: anywhere; }
.gpm-guia { margin: 0; color: ${TENUE}; font-size: 14px; line-height: 1.45; }
.gpm-h2 { font: 700 20px/1.25 Sora, Inter, sans-serif; margin: 32px 0 12px; }
.gpm-empieza { display: grid; gap: 16px; }
@media (min-width: 700px) { .gpm-empieza { grid-template-columns: minmax(0, 320px) minmax(0, 1fr); align-items: start; } }
.gpm-tarjeta { border: 1px solid ${LINEA}; border-radius: 16px; background: rgba(29,53,87,0.35); padding: 16px; }
.gpm-rotulo { margin: 0; font-size: 13px; font-weight: 600; color: ${FAE.teal}; }
.gpm-tarjeta h3 { font: 700 18px/1.3 Sora, Inter, sans-serif; margin: 6px 0 8px; overflow-wrap: anywhere; }
.gpm-tarjeta p { margin: 0 0 10px; font-size: 15px; line-height: 1.5; color: ${TENUE}; }
.gpm-sim { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 12px 18px; border-radius: 999px; background: ${VERDE}; color: ${FAE.bg}; font: 700 15px/1.2 Inter, system-ui, sans-serif; text-decoration: none; text-align: center; }
.gpm-simulador { position: relative; overflow: hidden; padding-right: 16px; background: linear-gradient(160deg, rgba(42,157,143,0.22), rgba(29,53,87,0.45) 60%); border-color: rgba(42,157,143,0.45); }
.gpm-pia { float: right; width: 92px; height: auto; margin: -4px -6px 4px 10px; shape-outside: margin-box; }
.gpm-sim { border: 0; cursor: pointer; clear: both; }
.gpm-grupos { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 10px; padding: 0; margin: 0; list-style: none; }
.gpm-grupo { border: 1px solid ${LINEA}; border-radius: 14px; padding: 14px; background: rgba(29,53,87,0.35); }
.gpm-grupo[data-con-piezas="1"] { border-color: rgba(42,157,143,0.6); }
.gpm-grupo b { display: block; font: 700 16px/1.3 Sora, Inter, sans-serif; overflow-wrap: anywhere; }
.gpm-grupo span { display: block; margin-top: 4px; font-size: 13px; line-height: 1.4; color: ${TENUE}; }
.gpm-estado { display: inline-block !important; margin-top: 8px !important; font-size: 11px !important; font-weight: 700; padding: 3px 8px; border-radius: 999px; border: 1px solid ${LINEA}; }
`;

export default function MateriaGestionProyectos({ onBack, onSimulador }) {
  const publicadas = (id) => (PIEZAS[id] ?? []).filter((pz) => estaPublicada(pz.id));
  const fundamentos = MODULOS[0];
  const grupos = MODULOS.slice(1);
  const videos = MODULOS.flatMap((m) => publicadas(m.id)).filter((pz) => pz.microvideo);
  return (
    <div className="gpm" data-materia="gestion-proyectos">
      <style>{CSS}</style>
      <main className="gpm-hoja">
        <button type="button" className="gpm-volver" onClick={onBack}>← Inicio</button>
        <h1 className="gpm-titulo">{NOMBRE_MATERIA}</h1>
        <p className="gpm-guia">Basada en la {GUIA}. Microlecciones de pocos minutos y simuladores donde armas los documentos de tu propio proyecto.</p>

        <h2 className="gpm-h2">Empieza aquí · {fundamentos.titulo}</h2>
        <div className="gpm-empieza">
          {videos.map((pz) => <Microvideo key={pz.id} id={pz.id} />)}
          <div className="gpm-tarjeta gpm-simulador" data-simulador="acta">
            <img className="gpm-pia" src="/gestion-proyectos/pia/feliz-cuerpo.webp" alt="" width="150" height="192" />
            <p className="gpm-rotulo">Simulador con IA</p>
            <h3>Arma el acta de constitución de tu proyecto</h3>
            <p>
              Pía te pregunta por tu idea: qué vas a hacer, para qué, cuánto cuesta, cuánto
              tiempo toma y quién decide. Con tus respuestas se escribe el acta, componente por
              componente, hasta dejarla lista para firmar.
            </p>
            <button type="button" className="gpm-sim" onClick={onSimulador}>Armar mi acta</button>
          </div>
        </div>

        <h2 className="gpm-h2">Los cinco grupos de procesos</h2>
        <p className="gpm-guia" style={{ marginBottom: 12 }}>
          Los grupos de procesos no son fases del proyecto: se pueden repetir dentro de cada fase.
        </p>
        <ul className="gpm-grupos">
          {grupos.map((m) => {
            const n = publicadas(m.id).length;
            return (
              <li className="gpm-grupo" key={m.id} data-modulo={m.id} data-con-piezas={n > 0 ? "1" : "0"}>
                <b>{m.titulo}</b>
                <span>{m.resumen}</span>
                <span className="gpm-estado">{n > 0 ? `${n} ${n === 1 ? "pieza" : "piezas"}` : "Próximamente"}</span>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
