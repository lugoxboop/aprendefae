/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · EL ÍNDICE DE APRENDER DE UN TEMA (rediseño, Mateo 26-nov)
 *
 * Antes era una lista numerada de botones iguales («muy simple y muy sosa»).
 * Ahora es una cartelera en orden:
 *   1. Cabecera: tema, cuántas piezas y una barra con un tramo por pieza
 *      (vista / la que sigue / pendiente). Es avance de lectura, no puntaje:
 *      sin estrellas, sin rachas, sin FP.
 *   2. LA QUE SIGUE, en grande: la primera pieza sin ver, con su escena (el
 *      telón ilustrado del tema y su mascota) o el póster de su microvideo,
 *      el papel del estudiante (TU PAPEL de ESCENAS) y la duración.
 *   3. Las demás, en fila, unidas por un riel: miniatura (póster o escena),
 *      número, nombre, si es video (con duración) o interactiva, y ✓ Vista.
 *   4. El puente a los retos de Gen: «Ahora, a practicar».
 *
 * «Vista» se recuerda SOLO en este dispositivo (localStorage). Es comodidad
 * del estudiante, no dato suyo: no va al servidor, no da FP, y si el
 * navegador no deja guardar, todo se ve como pendiente y nada se rompe.
 *
 * Movimiento: entrada escalonada de 280 ms con la curva de la casa, solo
 * transform y opacity, una vez; con movimiento reducido, nada se mueve.
 * El escalón va con una variable --i puesta en línea (la ruta de respaldo de
 * Modern Web Guidance para sibling-index(), que aún no es Baseline amplio).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "./colores-da.js";
import { FONDOS_TEMA, HORAS, TEMAS_ESCENA } from "./Escenario.jsx";
import { INTERACCIONES, MASCOTAS, rutaInteraccion, rutaMascota } from "./mascotas.jsx";
import { duracion, videoDe } from "./videosAprender.js";

/* ─── «Vista», en este dispositivo ─── */
const CLAVE = "fae-macro26-aprender-vistas";

function leerVistas() {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
    return new Set(Array.isArray(v) ? v : []);
  } catch {
    return new Set();
  }
}

export function marcarVista(id) {
  try {
    const v = leerVistas();
    v.add(id);
    window.localStorage.setItem(CLAVE, JSON.stringify([...v]));
  } catch { /* sin almacenamiento: no se recuerda y no pasa nada */ }
}

const CURVA = "cubic-bezier(.3,.9,.4,1)";

const CSS = `
.m26i { --m26i-acento: #f2c14e; display: grid; gap: 14px; }
.m26i-cabeza { display: grid; gap: 6px; padding: 2px 2px 0; }
.m26i-ceja { margin: 0; font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .1em; color: var(--m26i-acento); }
.m26i-titulo { margin: 0; font: 800 28px/32px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: -.02em; color: ${INK}; }
.m26i-resumen { margin: 0; font-size: 14px; line-height: 20px; color: ${INK_2}; }
.m26i-barra { display: flex; gap: 4px; margin-top: 4px; }
.m26i-tramo { flex: 1; height: 6px; border-radius: 3px; background: ${BORDE}; }
.m26i-tramo[data-estado="vista"] { background: ${INK}; }
.m26i-tramo[data-estado="sigue"] { background: var(--m26i-acento); }

.m26i-entra { animation: m26i-entra 280ms ${CURVA} both 1; animation-delay: calc(var(--i, 0) * 60ms); }
@keyframes m26i-entra { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .m26i-entra { animation: none; } }

.m26i button { font: inherit; color: inherit; text-align: left; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.m26i button:focus-visible { outline: 2px solid ${INK}; outline-offset: 3px; }

/* ── La que sigue ── */
.m26i-sigue { display: block; width: 100%; padding: 0; border-radius: 18px; border: 1px solid var(--m26i-acento); background: ${SUPERFICIE}; overflow: hidden; box-shadow: 0 14px 34px rgba(4, 10, 20, .5); transition: transform 280ms ${CURVA}; }
.m26i-sigue:active { transform: scale(.985); }
@media (hover: hover) { .m26i-sigue:hover { transform: translateY(-2px); } }
.m26i-lienzo { position: relative; isolation: isolate; overflow: hidden; height: 196px; display: flex; align-items: flex-end; }
@media (min-width: 400px) { .m26i-lienzo { height: 224px; } }
.m26i-lienzo-fondo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: right center; z-index: -2; }
.m26i-lienzo-poster { object-position: center 38%; }
.m26i-lienzo-velo { position: absolute; inset: 0; z-index: -1; background: linear-gradient(0deg, rgba(8, 16, 30, .92) 0%, rgba(8, 16, 30, .25) 46%, rgba(8, 16, 30, 0) 70%); }
.m26i-lienzo[data-video="0"] .m26i-lienzo-velo { background: linear-gradient(90deg, rgba(8, 16, 30, .55), rgba(8, 16, 30, .1) 60%), linear-gradient(0deg, rgba(8, 16, 30, .9) 0%, rgba(8, 16, 30, 0) 55%); }
.m26i-mascota { position: absolute; left: 12px; bottom: 0; height: 150px; width: auto; max-width: 62%; object-fit: contain; object-position: left bottom; z-index: -1; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, .45)); }
@media (min-width: 400px) { .m26i-mascota { height: 172px; } }
.m26i-play { position: absolute; right: 14px; bottom: 14px; width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; background: rgba(8, 16, 30, .72); border: 2px solid ${INK}; box-shadow: 0 0 0 6px rgba(244, 245, 247, .14); }
.m26i-play svg { margin-left: 4px; }
.m26i-sello { position: absolute; top: 10px; left: 10px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--m26i-acento); color: ${TINTA_SOBRE_COLOR}; font: 700 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; }
.m26i-chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; background: rgba(8, 16, 30, .82); border: 1px solid ${BORDE}; color: ${INK}; font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); font-variant-numeric: tabular-nums; white-space: nowrap; }
.m26i-lienzo .m26i-chip { position: absolute; top: 10px; right: 10px; }
.m26i-sigue-cuerpo { display: grid; gap: 6px; padding: 12px 14px 14px; }
.m26i-num { font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; color: ${INK_2}; }
.m26i-sigue-nombre { font: 800 21px/26px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: -.01em; color: ${INK}; }
.m26i-papel { font-size: 15px; line-height: 21px; color: ${INK_2}; }
.m26i-papel b { display: block; font: 700 11px/14px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .1em; color: var(--m26i-acento); margin-bottom: 1px; }
.m26i-accion { justify-self: start; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 4px; padding: 10px 18px; border-radius: 999px; background: ${INK}; color: ${TINTA_SOBRE_COLOR}; font: 700 15px/20px var(--planck-font-sans, system-ui, sans-serif); }

/* ── Las demás, en riel ── */
.m26i-lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; position: relative; }
.m26i-lista::before { content: ""; position: absolute; left: 33px; top: 20px; bottom: 20px; width: 2px; background: ${BORDE}; border-radius: 1px; }
.m26i-fila { position: relative; display: grid; grid-template-columns: 66px minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; min-height: 92px; padding: 8px 12px 8px 8px; border-radius: 14px; border: 1px solid ${BORDE}; background: ${SUPERFICIE}; transition: transform 280ms ${CURVA}, border-color 280ms ${CURVA}; }
.m26i-fila:active { transform: scale(.985); }
@media (hover: hover) { .m26i-fila:hover { border-color: ${INK_2}; transform: translateX(2px); } }
.m26i-mini { position: relative; isolation: isolate; width: 66px; height: 76px; border-radius: 10px; overflow: hidden; background: ${FONDO}; border: 1px solid rgba(244, 245, 247, .16); }
.m26i-mini img { position: absolute; display: block; }
.m26i-mini-fondo { inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 78% center; z-index: -2; opacity: .85; }
.m26i-mini-poster { inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 40%; }
.m26i-mini-mascota { left: 50%; bottom: -8px; height: 72px; width: auto; max-width: none; transform: translateX(-50%); z-index: -1; filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .5)); }
.m26i-mini-play { position: absolute; right: 4px; bottom: 4px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: rgba(8, 16, 30, .8); border: 1px solid ${INK}; }
.m26i-mini-play svg { margin-left: 2px; }
.m26i-fila[data-vista="1"] .m26i-mini { opacity: .62; }
.m26i-texto { display: grid; gap: 3px; min-width: 0; }
.m26i-nombre { font: 700 16px/21px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; overflow-wrap: anywhere; }
.m26i-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 13px; line-height: 18px; color: ${INK_2}; }
.m26i-meta-tipo { display: inline-flex; align-items: center; gap: 4px; }
.m26i-estado { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid ${BORDE}; color: ${INK_2}; flex: none; }
.m26i-fila[data-vista="1"] .m26i-estado { background: ${INK}; border-color: ${INK}; color: ${TINTA_SOBRE_COLOR}; }
.m26i-vista { font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); color: ${INK}; }

.m26i-seccion { margin: 6px 2px -4px; font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .1em; color: ${INK_2}; }

/* ── El puente a los retos ── */
.m26i-puente { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; min-height: 72px; margin-top: 4px; padding: 14px 16px; border-radius: 14px; border: 1px dashed var(--m26i-acento); background: linear-gradient(135deg, ${SUPERFICIE_2}, ${SUPERFICIE}); }
.m26i-puente-t { font: 700 16px/21px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.m26i-puente-s { display: block; font-size: 13px; line-height: 18px; color: ${INK_2}; margin-top: 2px; }
.m26i-flecha { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--m26i-acento); color: ${TINTA_SOBRE_COLOR}; }
`;

const Triangulo = ({ t = 22, color = INK }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5Z" fill={color} /></svg>
);
const Visto = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Pantallas = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="13" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 7v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
);

/* La imagen de la mascota de una escena: una pose o una escena de varias. */
function arteMascota(escena) {
  if (escena?.escena && INTERACCIONES[escena.escena]) return rutaInteraccion(escena.escena);
  const m = escena?.mascota;
  if (m && MASCOTAS[m.id]) return rutaMascota(m.id, m.pose).src;
  return null;
}

const dos = (n) => String(n).padStart(2, "0");

function Tipo({ video }) {
  return video ? (
    <span className="m26i-meta-tipo"><Triangulo t={12} color="currentColor" />Video · <span className="da26-mono">{duracion(video.segundos)}</span></span>
  ) : (
    <span className="m26i-meta-tipo"><Pantallas />Interactiva</span>
  );
}

function LaQueSigue({ pieza, numero, escena, tema, repaso, onAbrir }) {
  const video = videoDe(pieza.id);
  const mascota = video ? null : arteMascota(escena);
  const [arriba, abajo] = HORAS[escena?.hora] ?? HORAS.dia;
  return (
    <button type="button" className="m26i-sigue m26i-entra" style={{ "--i": 1 }} data-abrir={pieza.id} data-la-que-sigue onClick={onAbrir}>
      <span className="m26i-lienzo" data-video={video ? "1" : "0"} style={{ background: `linear-gradient(180deg, ${arriba}, ${abajo})` }}>
        {video
          ? <img className="m26i-lienzo-fondo m26i-lienzo-poster" src={video.poster} alt="" width="720" height="1280" decoding="async" />
          : FONDOS_TEMA[tema] && <img className="m26i-lienzo-fondo" src={FONDOS_TEMA[tema]} alt="" width="1280" height="714" decoding="async" />}
        <span className="m26i-lienzo-velo" aria-hidden="true" />
        {mascota && <img className="m26i-mascota" src={mascota} alt="" decoding="async" />}
        <span className="m26i-sello">{repaso ? "REPASA" : numero === 1 ? "EMPIEZA AQUÍ" : "SIGUE AQUÍ"}</span>
        {video && <span className="m26i-chip"><Triangulo t={11} color="currentColor" />{duracion(video.segundos)}</span>}
        {video && <span className="m26i-play" aria-hidden="true"><Triangulo t={26} /></span>}
      </span>
      <span className="m26i-sigue-cuerpo">
        <span className="m26i-num">{dos(numero)} · {video ? "MICROVIDEO" : "INTERACTIVA"}</span>
        <span className="m26i-sigue-nombre">{pieza.nombre}</span>
        {escena?.rol && <span className="m26i-papel"><b>TU PAPEL</b>{escena.rol}</span>}
        <span className="m26i-accion">{video ? <><Triangulo t={16} color={TINTA_SOBRE_COLOR} />Ver el video</> : <>Empezar<Chevron /></>}</span>
      </span>
    </button>
  );
}

function Fila({ pieza, numero, escena, tema, vista, orden, onAbrir }) {
  const video = videoDe(pieza.id);
  const mascota = arteMascota(escena);
  const [arriba, abajo] = HORAS[escena?.hora] ?? HORAS.dia;
  return (
    <li className="m26i-entra" style={{ "--i": orden }}>
      <button type="button" className="m26i-fila" data-abrir={pieza.id} data-vista={vista ? "1" : "0"} onClick={onAbrir}
        aria-label={`${numero}. ${pieza.nombre}. ${video ? `Video de ${duracion(video.segundos)}` : "Interactiva"}${vista ? ". Vista" : ""}`}>
        <span className="m26i-mini" aria-hidden="true" style={{ background: `linear-gradient(180deg, ${arriba}, ${abajo})` }}>
          {video ? (
            <>
              <img className="m26i-mini-poster" src={video.poster} alt="" width="720" height="1280" loading="lazy" decoding="async" />
              <span className="m26i-mini-play"><Triangulo t={11} /></span>
            </>
          ) : (
            <>
              {FONDOS_TEMA[tema] && <img className="m26i-mini-fondo" src={FONDOS_TEMA[tema]} alt="" width="1280" height="714" loading="lazy" decoding="async" />}
              {mascota && <img className="m26i-mini-mascota" src={mascota} alt="" loading="lazy" decoding="async" />}
            </>
          )}
        </span>
        <span className="m26i-texto">
          <span className="m26i-num">{dos(numero)}</span>
          <span className="m26i-nombre">{pieza.nombre}</span>
          <span className="m26i-meta"><Tipo video={video} />{vista && <span className="m26i-vista">Vista</span>}</span>
        </span>
        <span className="m26i-estado" aria-hidden="true">{vista ? <Visto /> : <Chevron />}</span>
      </button>
    </li>
  );
}

/**
 * piezas: las Aprender visibles del tema, en orden. escenas: el mapa ESCENAS
 * del tema (llega aparte, con sus textos; null mientras carga). retos: cuántas
 * Hacer publicadas tiene el tema (0 = sin puente).
 */
export default function IndiceAprender({ temaId, titulo, escenaTema = "plaza", piezas, escenas, retos = 0, onAbrir, onRetos }) {
  const [vistas, setVistas] = useState(() => new Set());
  useEffect(() => { setVistas(leerVistas()); }, [temaId]);

  const acento = (TEMAS_ESCENA[escenaTema] ?? TEMAS_ESCENA.plaza).acento;
  const n = piezas.length;
  const nVistas = piezas.filter((p) => vistas.has(p.id)).length;
  const k = piezas.findIndex((p) => !vistas.has(p.id));
  const repaso = k === -1;
  const sigueIdx = repaso ? 0 : k;
  const sigue = piezas[sigueIdx];
  const nVideos = piezas.filter((p) => videoDe(p.id)).length;

  const resumen = [
    `${n} ${n === 1 ? "pieza" : "piezas"}`,
    nVideos > 0 && `${nVideos} ${nVideos === 1 ? "microvideo" : "microvideos"}`,
    nVistas > 0 && (repaso ? "todas vistas" : `${nVistas} de ${n} vistas`),
  ].filter(Boolean).join(" · ");

  return (
    <div className="m26i" data-tema-publicado={temaId} data-indice-aprender style={{ "--m26i-acento": acento }}>
      <style>{CSS}</style>
      <header className="m26i-cabeza m26i-entra" style={{ "--i": 0 }}>
        <p className="m26i-ceja">MACROECONOMÍA · APRENDER</p>
        <h1 className="m26i-titulo">{titulo}</h1>
        <p className="m26i-resumen" data-resumen>{resumen}</p>
        <div className="m26i-barra" role="img" aria-label={`${nVistas} de ${n} piezas vistas`}>
          {piezas.map((p, i) => (
            <span key={p.id} className="m26i-tramo" data-estado={vistas.has(p.id) ? "vista" : i === sigueIdx ? "sigue" : "pendiente"} />
          ))}
        </div>
      </header>

      {sigue && (
        <LaQueSigue pieza={sigue} numero={sigueIdx + 1} escena={escenas?.[sigue.id]} tema={escenaTema} repaso={repaso} onAbrir={() => onAbrir(sigue.id)} />
      )}

      {n > 1 && <p className="m26i-seccion m26i-entra" style={{ "--i": 2 }}>TODAS LAS PIEZAS</p>}
      {n > 1 && (
        <ol className="m26i-lista">
          {piezas.map((p, i) => (i === sigueIdx ? null : (
            <Fila key={p.id} pieza={p} numero={i + 1} escena={escenas?.[p.id]} tema={escenaTema} vista={vistas.has(p.id)}
              orden={Math.min(i + 3, 8)} onAbrir={() => onAbrir(p.id)} />
          )))}
        </ol>
      )}

      {retos > 0 && onRetos && (
        <button type="button" className="m26i-puente m26i-entra" style={{ "--i": 9 }} onClick={onRetos} data-ir-retos>
          <span>
            <span className="m26i-puente-t">Ahora, a practicar</span>
            <span className="m26i-puente-s">{retos} {retos === 1 ? "reto" : "retos"} de {titulo}</span>
          </span>
          <span className="m26i-flecha" aria-hidden="true"><Chevron /></span>
        </button>
      )}
    </div>
  );
}
