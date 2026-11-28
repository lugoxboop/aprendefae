/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · UN TEMA, CON SUS DOS MITADES (como Macroeconomía)
 *
 * #/<módulo>/aprender[/<id>] y #/<módulo>/hacer[/cap-N]. Mismo esqueleto que
 * src/macro2026/TemaMacro2026.jsx: botón de volver a la materia, la ceja
 * «GESTIÓN DE PROYECTOS · APRENDER», el título, y debajo la lista de piezas o
 * el camino de retos. Encima, un selector Aprender | Hacer para pasar de una
 * mitad a la otra sin volver al índice.
 *
 * APRENDER: las piezas que existen (el microvideo GP-01, el simulador del
 * acta) con la tarjeta grande de «Empieza aquí»; y, en orden de la guía, una
 * fila «Próximamente» por cada proceso que aún no tiene su lección. No se
 * inventa contenido: la fila solo nombra el proceso que va ahí.
 *
 * HACER: el camino compartido (CaminoHacer) partido por capítulo de la guía,
 * para que cada camino tenga el tamaño de uno de Macro. Cada reto se abre en
 * #/gestion-proyectos/hacer/<id> (Hacer.jsx), y al volver se cae en el mismo
 * capítulo.
 *
 * Sin animación propia: las entradas son las del sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useMemo, useState } from "react";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import CaminoHacer from "../components/shared/CaminoHacer.jsx";
import { Raiz, Boton } from "../macro2026/comun/ui.jsx";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../macro2026/comun/colores-da.js";
import FondoGP from "./comun/FondoGP.jsx";
import Microvideo from "./Microvideo.jsx";
import { hacerVisibles } from "./Hacer.jsx";
import { aprenderDeModulo, gruposDeHacer, moduloDe } from "./temas.js";

/* El acento de cada tema: el tono claro de su tarjeta en el índice (TarjetaTema.jsx). */
const ACENTO = {
  "gp-fundamentos": "#A7BBFF",
  "gp-inicio": "#86E0C3",
  "gp-planificacion": "#8FD3F2",
  "gp-ejecucion": "#F8C595",
  "gp-monitoreo-control": "#B9AEFF",
  "gp-cierre": "#F3ACD4",
};

const CSS = `
.gpt { --gpt-acento: #86E0C3; display: grid; gap: 14px; }
.gpt-cabeza { display: grid; gap: 6px; padding: 2px 2px 0; }
.gpt-ceja { margin: 0; font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .1em; color: var(--gpt-acento); }
.gpt-titulo { margin: 0; font: 800 28px/32px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: -.02em; color: ${INK}; overflow-wrap: anywhere; }
.gpt-resumen { margin: 0; font-size: 14px; line-height: 20px; color: ${INK_2}; }

.gpt-mitades { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 999px; background: ${SUPERFICIE}; border: 1px solid ${BORDE}; }
.gpt .gpt-mitad { display: flex; align-items: center; justify-content: center; text-align: center; min-height: 44px; border-radius: 999px; border: 0; background: transparent; color: ${INK_2}; font: 700 14px/18px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .02em; cursor: pointer; touch-action: manipulation; }
.gpt .gpt-mitad[aria-pressed="true"] { background: ${INK}; color: ${TINTA_SOBRE_COLOR}; }
.gpt-mitad span { font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); opacity: .75; margin-left: 4px; }

.gpt button { font: inherit; color: inherit; text-align: left; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.gpt button:focus-visible { outline: 2px solid ${INK}; outline-offset: 3px; }

/* ── La tarjeta grande ── */
.gpt-sigue { display: block; width: 100%; padding: 0; border-radius: 18px; border: 1px solid var(--gpt-acento); background: ${SUPERFICIE}; overflow: hidden; box-shadow: 0 14px 34px rgba(4, 10, 20, .5); }
.gpt-lienzo { position: relative; isolation: isolate; overflow: hidden; height: 196px; display: flex; align-items: flex-end; background: linear-gradient(160deg, rgba(42,157,143,.35), ${SUPERFICIE_2} 70%); }
@media (min-width: 400px) { .gpt-lienzo { height: 224px; } }
.gpt-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 38%; z-index: -2; }
.gpt-velo { position: absolute; inset: 0; z-index: -1; background: linear-gradient(0deg, rgba(8, 16, 30, .92) 0%, rgba(8, 16, 30, .2) 50%, rgba(8, 16, 30, 0) 72%); }
.gpt-pia { position: absolute; right: 10px; bottom: 0; height: 168px; width: auto; z-index: -1; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, .45)); }
@media (min-width: 400px) { .gpt-pia { height: 192px; } }
.gpt-sello { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 999px; background: var(--gpt-acento); color: ${TINTA_SOBRE_COLOR}; font: 700 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; }
.gpt-chip { position: absolute; top: 10px; right: 10px; padding: 3px 9px; border-radius: 999px; background: rgba(8, 16, 30, .82); border: 1px solid ${BORDE}; color: ${INK}; font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); }
.gpt-play { position: absolute; right: 14px; bottom: 14px; width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; background: rgba(8, 16, 30, .72); border: 2px solid ${INK}; box-shadow: 0 0 0 6px rgba(244, 245, 247, .14); }
.gpt-play svg { margin-left: 4px; }
.gpt-cuerpo { display: grid; gap: 6px; padding: 12px 14px 14px; }
.gpt-num { font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; color: ${INK_2}; }
.gpt-nombre-grande { font: 800 21px/26px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: -.01em; color: ${INK}; overflow-wrap: anywhere; }
.gpt-texto-grande { font-size: 15px; line-height: 21px; color: ${INK_2}; }
.gpt-accion { justify-self: start; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 4px; padding: 10px 18px; border-radius: 999px; background: ${INK}; color: ${TINTA_SOBRE_COLOR}; font: 700 15px/20px var(--planck-font-sans, system-ui, sans-serif); }

/* ── Las filas ── */
.gpt-seccion { margin: 6px 2px -4px; font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .1em; color: ${INK_2}; }
.gpt-cap { margin: 4px 2px -2px; font: 700 13px/18px var(--planck-font-sans, system-ui, sans-serif); color: var(--gpt-acento); }
.gpt-lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; position: relative; }
.gpt-lista::before { content: ""; position: absolute; left: 33px; top: 20px; bottom: 20px; width: 2px; background: ${BORDE}; border-radius: 1px; }
.gpt-fila { position: relative; display: grid; grid-template-columns: 66px minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; min-height: 80px; padding: 8px 12px 8px 8px; border-radius: 14px; border: 1px solid ${BORDE}; background: ${SUPERFICIE}; }
.gpt-fila[data-proxima="1"] { border-style: dashed; background: rgba(22, 38, 61, .72); grid-template-columns: 52px minmax(0, 1fr) auto; min-height: 60px; padding: 6px 12px 6px 8px; }
.gpt-fila[data-proxima="1"] .gpt-mini { width: 52px; height: 44px; font-size: 12px; }
.gpt-mini { position: relative; width: 66px; height: 64px; border-radius: 10px; display: grid; place-items: center; background: ${FONDO}; border: 1px dashed rgba(244, 245, 247, .22); font: 700 13px/1 var(--planck-font-mono, ui-monospace, monospace); color: var(--gpt-acento); }
.gpt-mini img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
.gpt-txt { display: grid; gap: 3px; min-width: 0; }
.gpt-nombre { font: 700 15px/20px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; overflow-wrap: anywhere; }
.gpt-meta { font-size: 13px; line-height: 18px; color: ${INK_2}; }
.gpt-estado { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid ${BORDE}; color: ${INK_2}; flex: none; }

/* ── El puente a los retos ── */
.gpt-puente { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; min-height: 72px; margin-top: 4px; padding: 14px 16px; border-radius: 14px; border: 1px dashed var(--gpt-acento); background: linear-gradient(135deg, ${SUPERFICIE_2}, ${SUPERFICIE}); }
.gpt-puente-t { font: 700 16px/21px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.gpt-puente-s { display: block; font-size: 13px; line-height: 18px; color: ${INK_2}; margin-top: 2px; }
.gpt-flecha { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--gpt-acento); color: ${TINTA_SOBRE_COLOR}; }

/* ── Los capítulos del camino ── */
.gpt-caps { display: flex; gap: 8px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; padding: 2px 2px 8px; margin: 0 -2px; scrollbar-width: thin; }
.gpt-caps > * { flex: none; scroll-snap-align: start; }
.gpt .gpt-capbtn { text-align: center; min-height: 44px; padding: 8px 14px; border-radius: 999px; border: 1px solid ${BORDE}; background: ${SUPERFICIE}; color: ${INK}; font: 600 14px/18px var(--planck-font-sans, system-ui, sans-serif); white-space: nowrap; }
.gpt-capbtn[aria-pressed="true"] { background: var(--gpt-acento); border-color: var(--gpt-acento); color: ${TINTA_SOBRE_COLOR}; }
.gpt-capbtn span { font: 600 12px/16px var(--planck-font-mono, ui-monospace, monospace); margin-left: 6px; opacity: .8; }
.gpt-capbtn[data-completo="1"]::after { content: " ✓"; }
.gpt-camino-titulo { margin: 6px 2px 0; font: 700 18px/24px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
`;

const Triangulo = ({ t = 22, color = INK }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5Z" fill={color} /></svg>
);
const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Candado = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
);

const dos = (n) => String(n).padStart(2, "0");
const seg = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* La pieza grande de arriba: un microvideo o el simulador. */
function TarjetaPieza({ pieza, numero, primera, onAbrir }) {
  const video = pieza.clase === "video" ? pieza.video : null;
  return (
    <button type="button" className="gpt-sigue" data-abrir={pieza.id} onClick={onAbrir}>
      <span className="gpt-lienzo">
        {video
          ? <img className="gpt-poster" src={video.poster} alt="" width="720" height="1280" decoding="async" />
          : <img className="gpt-pia" src="/gestion-proyectos/pia/feliz-cuerpo.webp" alt="" width="150" height="192" decoding="async" />}
        <span className="gpt-velo" aria-hidden="true" />
        <span className="gpt-sello">{primera ? "EMPIEZA AQUÍ" : "SIGUE AQUÍ"}</span>
        {video && <span className="gpt-chip">▶ {seg(video.segundos)}</span>}
        {video && <span className="gpt-play" aria-hidden="true"><Triangulo t={26} /></span>}
      </span>
      <span className="gpt-cuerpo">
        <span className="gpt-num">{dos(numero)} · {video ? "MICROVIDEO" : "SIMULADOR CON IA"}</span>
        <span className="gpt-nombre-grande">{pieza.nombre}</span>
        {!video && (
          <span className="gpt-texto-grande">
            Pía te pregunta por tu idea y, con tus respuestas, se escribe el acta componente por componente.
          </span>
        )}
        <span className="gpt-accion">{video ? <><Triangulo t={16} color={TINTA_SOBRE_COLOR} />Ver el video</> : <>Armar mi acta<Chevron /></>}</span>
      </span>
    </button>
  );
}

/* Cuando el tema aún no tiene ninguna lección: lo dice con Pía, sin dejar el hueco. */
function TarjetaEnCamino({ titulo, retos, onRetos }) {
  return (
    <div className="gpt-sigue" data-aprender-en-camino style={{ cursor: "default" }}>
      <span className="gpt-lienzo">
        <img className="gpt-pia" src="/gestion-proyectos/pia/piensa-cuerpo.webp" alt="" width="150" height="192" decoding="async" />
        <span className="gpt-velo" aria-hidden="true" />
        <span className="gpt-sello">PRÓXIMAMENTE</span>
      </span>
      <span className="gpt-cuerpo">
        <span className="gpt-num">MICROLECCIONES DE {titulo.toUpperCase()}</span>
        <span className="gpt-nombre-grande">Las lecciones de este tema vienen en camino</span>
        <span className="gpt-texto-grande">Abajo está el orden en que van a llegar, proceso por proceso. Mientras tanto, ya puedes practicar.</span>
        {retos > 0 && (
          <button type="button" className="gpt-accion" onClick={onRetos} data-ir-retos-arriba>
            Practicar · {retos} retos<Chevron />
          </button>
        )}
      </span>
    </div>
  );
}

function FilaPieza({ pieza, numero, onAbrir }) {
  const video = pieza.clase === "video" ? pieza.video : null;
  return (
    <li>
      <button type="button" className="gpt-fila" data-abrir={pieza.id} onClick={onAbrir}>
        <span className="gpt-mini" aria-hidden="true">
          {video ? <img src={video.poster} alt="" loading="lazy" /> : <img src="/gestion-proyectos/pia/feliz-cara.webp" alt="" loading="lazy" />}
        </span>
        <span className="gpt-txt">
          <span className="gpt-num">{dos(numero)}</span>
          <span className="gpt-nombre">{pieza.nombre}</span>
          <span className="gpt-meta">{video ? `Video · ${seg(video.segundos)}` : "Simulador con IA"}</span>
        </span>
        <span className="gpt-estado" aria-hidden="true"><Chevron /></span>
      </button>
    </li>
  );
}

function FilaProxima({ proceso }) {
  return (
    <li className="gpt-fila" data-proxima="1" data-subtema={proceso.id} aria-label={`${proceso.seccion} ${proceso.nombre}. Próximamente`}>
      <span className="gpt-mini" aria-hidden="true">{proceso.seccion}</span>
      <span className="gpt-txt">
        <span className="gpt-nombre">{proceso.nombre}</span>
        <span className="gpt-meta">Microlección · Próximamente</span>
      </span>
      <span className="gpt-estado" aria-hidden="true"><Candado /></span>
    </li>
  );
}

function Aprender({ mod, retos, onAbrir, onSimulador, onRetos }) {
  const { listas, proximas, totalProximas } = aprenderDeModulo(mod.id);
  const abrir = (p) => (p.clase === "simulador" ? onSimulador() : onAbrir(p.id));
  const [primera, ...resto] = listas;
  return (
    <>
      {primera ? <TarjetaPieza pieza={primera} numero={1} primera onAbrir={() => abrir(primera)} /> : <TarjetaEnCamino titulo={mod.titulo} retos={retos} onRetos={onRetos} />}
      {resto.length > 0 && (
        <>
          <p className="gpt-seccion">TODAS LAS PIEZAS</p>
          <ol className="gpt-lista">{resto.map((p, i) => <FilaPieza key={p.id} pieza={p} numero={i + 2} onAbrir={() => abrir(p)} />)}</ol>
        </>
      )}
      {totalProximas > 0 && (
        <>
          <p className="gpt-seccion" data-proximas={totalProximas}>PRÓXIMAMENTE · {totalProximas} {totalProximas === 1 ? "LECCIÓN" : "LECCIONES"}</p>
          {proximas.map((g) => (
            <section key={g.cap} style={{ display: "grid", gap: 10 }}>
              {proximas.length > 1 && <p className="gpt-cap">Cap. {g.cap} · {g.nombre}</p>}
              <ul className="gpt-lista">{g.procesos.map((pr) => <FilaProxima key={pr.id} proceso={pr} />)}</ul>
            </section>
          ))}
        </>
      )}
      {retos > 0 && (
        <button type="button" className="gpt-puente" onClick={onRetos} data-ir-retos>
          <span>
            <span className="gpt-puente-t">Ahora, a practicar</span>
            <span className="gpt-puente-s">{retos} {retos === 1 ? "reto" : "retos"} de {mod.titulo}</span>
          </span>
          <span className="gpt-flecha" aria-hidden="true"><Chevron /></span>
        </button>
      )}
    </>
  );
}

function PiezaVideo({ mod, id, onVolver }) {
  return (
    <div className="da26-tarjeta" data-gp-aprender={id} style={{ display: "grid", justifyItems: "center" }}>
      <Microvideo id={id} />
      <div className="da26-nav" style={{ width: "100%" }}>
        <Boton primario onClick={onVolver}>Volver a {mod.titulo}</Boton>
      </div>
    </div>
  );
}

function Hacer({ mod, capInicial, onAbrirReto }) {
  const hechas = useCompletadas();
  const grupos = useMemo(() => gruposDeHacer(hacerVisibles(mod.id)), [mod.id]);
  const conNodos = grupos.map((g) => ({ ...g, nodos: nodosDe(g.piezas.map(({ id, nombre, clasificacion }) => ({ id, nombre, clasificacion })), hechas) }));
  const pendiente = conNodos.find((g) => g.nodos.some((n) => !n.completada)) ?? conNodos[0];
  const [cap, setCap] = useState(capInicial ?? pendiente?.cap ?? null);
  useEffect(() => { if (capInicial != null) setCap(capInicial); }, [capInicial]);
  const actual = conNodos.find((g) => g.cap === cap) ?? pendiente;
  useEffect(() => {
    const el = document.querySelector(`.gpt-caps [data-cap="${actual?.cap}"]`);
    const fila = el?.parentElement;
    if (el && fila) fila.scrollLeft = el.offsetLeft - fila.offsetLeft - 8;
  }, [actual?.cap]);
  if (!actual) return <CaminoHacer nodos={[]} vacio="Este tema todavía no tiene retos." />;
  return (
    <>
      {conNodos.length > 1 && (
        <div className="gpt-caps" role="group" aria-label="Capítulos de la guía">
          {conNodos.map((g) => (
            <button key={g.cap} type="button" className="gpt-capbtn" aria-pressed={g.cap === actual.cap ? "true" : "false"}
              data-completo={g.nodos.every((n) => n.completada) ? "1" : "0"} data-cap={g.cap} onClick={() => setCap(g.cap)}>
              Cap. {g.cap} · {g.nombre}<span>{g.nodos.length}</span>
            </button>
          ))}
        </div>
      )}
      <h2 className="gpt-camino-titulo" data-camino-cap={actual.cap}>Cap. {actual.cap} · {actual.nombre}</h2>
      <div data-camino-gp={mod.id}>
        <CaminoHacer key={actual.cap} nodos={actual.nodos} onAbrir={onAbrirReto} vacio="Este capítulo todavía no tiene retos." />
      </div>
    </>
  );
}

export default function TemaGP({ moduloId, modo = null, extra = null, onBack, onIr, onAbrirReto, onSimulador }) {
  const mod = moduloDe(moduloId);
  const mitad = modo === "hacer" ? "hacer" : "aprender";
  const id = extra ? String(extra).split("?")[0] : null;
  const retos = hacerVisibles(moduloId).length;
  const { listas, totalProximas } = aprenderDeModulo(moduloId);
  const video = mitad === "aprender" && id ? listas.find((p) => p.id === id && p.clase === "video") : null;
  const capInicial = mitad === "hacer" && id && /^cap-\d+$/.test(id) ? Number(id.slice(4)) : null;
  if (!mod) return null;
  const nAprender = listas.length + totalProximas;
  const resumen = mitad === "aprender"
    ? [listas.length > 0 && `${listas.length} ${listas.length === 1 ? "pieza" : "piezas"}`, totalProximas > 0 && `${totalProximas} por llegar`].filter(Boolean).join(" · ")
    : `${retos} ${retos === 1 ? "reto" : "retos"} · ${mod.resumen}`;
  return (
    <FondoGP style={{ color: INK }}>
      <Raiz data-gp-tema={moduloId} data-mitad={mitad}>
        <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
          <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", maxWidth: 640, margin: "0 auto 12px" }}>
            {video
              ? <Boton onClick={() => onIr(moduloId, "aprender")} data-volver-lista>‹ {mod.titulo}</Boton>
              : <Boton onClick={onBack} data-volver-indice>‹ Gestión de Proyectos</Boton>}
          </div>
          <div className="gpt" style={{ "--gpt-acento": ACENTO[moduloId] ?? "#86E0C3" }}>
            <style>{CSS}</style>
            {video ? (
              <PiezaVideo mod={mod} id={video.id} onVolver={() => onIr(moduloId, "aprender")} />
            ) : (
              <>
                <header className="gpt-cabeza">
                  <p className="gpt-ceja">GESTIÓN DE PROYECTOS · {mitad === "hacer" ? "HACER" : "APRENDER"}</p>
                  <h1 className="gpt-titulo">{mod.titulo}</h1>
                  <p className="gpt-resumen" data-resumen>{resumen}</p>
                </header>
                <div className="gpt-mitades" role="group" aria-label="Mitad del tema">
                  <button type="button" className="gpt-mitad" aria-pressed={mitad === "aprender" ? "true" : "false"} onClick={() => onIr(moduloId, "aprender")} data-mitad-btn="aprender">
                    Aprender<span>{nAprender}</span>
                  </button>
                  <button type="button" className="gpt-mitad" aria-pressed={mitad === "hacer" ? "true" : "false"} onClick={() => onIr(moduloId, "hacer")} data-mitad-btn="hacer">
                    Hacer<span>{retos}</span>
                  </button>
                </div>
                {mitad === "aprender"
                  ? <Aprender mod={mod} retos={retos} onAbrir={(pid) => onIr(moduloId, "aprender", pid)} onSimulador={onSimulador} onRetos={() => onIr(moduloId, "hacer")} />
                  : <Hacer mod={mod} capInicial={capInicial} onAbrirReto={onAbrirReto} />}
              </>
            )}
          </div>
        </div>
      </Raiz>
    </FondoGP>
  );
}
