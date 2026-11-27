/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · SIMULADOR «ARMA TU ACTA» (Jane, 27-nov-2026)
 *
 * Dentro de AprendeFAE (orden de Mateo, 27-nov: «no tiene por qué ser un
 * artefacto, tiene que ser parte de lo que ya está dentro de la página»), en
 * #/gestion-proyectos/acta.
 *
 * Pía entrevista al estudiante y, con lo que él dice, se va escribiendo el
 * acta de constitución de SU proyecto: los 12 componentes de la Guía del
 * PMBOK® 6.ª ed. (4.1.3.1, p. 81). La IA corre en el servidor (función
 * «simulador», escenario gp26-acta, mismo cupo que los de Macro). Sin sesión,
 * sin cupo o sin conexión, sigue en preguntas guiadas con revisión local.
 *
 * Diseño: la mesa es la app (azul noche); el acta es una hoja de papel real
 * que se va escribiendo con tinta azul. Un solo momento fuerte: el sello con
 * Pía cuando el acta queda lista para firmar. El PDF sale de imprimir la hoja.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { llamarSimulador, SIN_SESION } from "../../macro2026/simulador/api.js";
import { CAMPOS, EJEMPLO, estadoVacio, pasoGuiado, revisaLocal, siguienteVacio, comoTexto } from "./acta.js";

const CLAVE = "gp26-acta-v1";
const PIA = (pose, parte = "cara") => `/gestion-proyectos/pia/${pose}-${parte}.webp`;
const ETIQUETA = { vacio: "Vacío", incompleto: "Incompleto", listo: "Listo" };

function leerGuardado() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (g && g.campos && Array.isArray(g.hilo)) return { ...estadoVacio(), ...g };
  } catch { /* sin almacenamiento: se empieza de cero */ }
  return estadoVacio();
}

const CSS = `
/* Caveat servida desde el sitio (como Sora e Inter): ninguna visita va a Google. */
@font-face { font-family: "Caveat FAE"; font-style: normal; font-weight: 700; font-display: swap; src: url(/gestion-proyectos/fuentes/caveat-latin-700-normal.woff2) format("woff2"); }
.gpa { --noche: #0E1B2E; --noche-2: #15263D; --noche-3: #1D3557; --borde: rgba(203,220,242,.14);
  --texto: #F8F9FA; --texto-2: rgba(248,249,250,.72); --teal: #2A9D8F; --teal-claro: #5CC6B8; --coral: #E76F51; --ambar: #E9C46A;
  --hoja: #FFFDF7; --tinta: #14233A; --tinta-2: #5A6B82; --raya: #E6E0D2; --resalte: #FFF1C9; --boligrafo: #1F4FBF;
  min-height: 100vh; background: var(--noche); color: var(--texto); font: 15px/1.5 Inter, system-ui, sans-serif; -webkit-text-size-adjust: 100%;
  background-image: radial-gradient(900px 500px at 85% -10%, rgba(42,157,143,.16), transparent 70%), radial-gradient(700px 400px at -10% 110%, rgba(233,196,106,.07), transparent 70%);
  padding: 16px 16px 24px; }
.gpa *, .gpa *::before, .gpa *::after { box-sizing: border-box; }
.gpa button, .gpa input, .gpa textarea { font: inherit; }
.gpa button { cursor: pointer; }
.gpa :focus-visible { outline: 3px solid var(--ambar); outline-offset: 2px; }
.gpa-cabeza { max-width: 1180px; margin: 0 auto 14px; display: flex; gap: 10px 16px; align-items: center; flex-wrap: wrap; }
.gpa-cabeza-txt { flex: 1 1 260px; min-width: 0; }
.gpa-cabeza h1 { font: 700 clamp(22px, 3vw, 30px)/1.15 Sora, Inter, sans-serif; margin: 0; letter-spacing: -.01em; }
.gpa-cabeza p { margin: 4px 0 0; color: var(--texto-2); font-size: 13.5px; }
.gpa-acc { display: flex; gap: 8px; flex-wrap: wrap; }
.gpa-fantasma { min-height: 44px; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--borde); background: rgba(255,255,255,.04); color: var(--texto); font-weight: 600; font-size: 14px; }
.gpa-fantasma:hover { background: rgba(255,255,255,.09); }
.gpa-fantasma[data-alerta="1"] { border-color: var(--coral); color: #FFB6A3; }
.gpa-pestanas { display: none; max-width: 1180px; margin: 0 auto 12px; padding: 4px; gap: 4px; border-radius: 999px; background: var(--noche-2); border: 1px solid var(--borde); }
.gpa-pestanas button { flex: 1; min-height: 44px; border: 0; border-radius: 999px; background: transparent; color: var(--texto-2); font-weight: 600; font-size: 14.5px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.gpa-pestanas button[aria-selected="true"] { background: var(--texto); color: var(--noche); }
.gpa-mini { font: 700 12px/1 Sora, Inter, sans-serif; padding: 4px 7px; border-radius: 999px; background: var(--teal); color: #fff; font-variant-numeric: tabular-nums; }
.gpa-mesa { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 20px; align-items: start; }

.gpa-charla { background: var(--noche-2); border: 1px solid var(--borde); border-radius: 24px; display: flex; flex-direction: column; height: min(80vh, 780px); min-height: 480px; overflow: hidden; position: sticky; top: 16px; }
.gpa-charla-cabeza { display: flex; gap: 12px; align-items: center; padding: 12px 16px; background: linear-gradient(180deg, var(--noche-3), var(--noche-2)); border-bottom: 1px solid var(--borde); }
.gpa-avatar { width: 52px; height: 52px; flex: none; border-radius: 50%; background: radial-gradient(circle at 50% 35%, #FFE9B8, var(--ambar)); overflow: hidden; display: grid; place-items: end center; box-shadow: 0 0 0 3px rgba(233,196,106,.25); }
.gpa-avatar img { width: 118%; height: auto; display: block; margin-bottom: -4%; }
.gpa-avatar[data-salta="1"] img { animation: gpa-salta .45s ease-out; }
@keyframes gpa-salta { 40% { transform: translateY(-5px) scale(1.04); } }
.gpa-charla-cabeza b { font: 700 16px/1.2 Sora, Inter, sans-serif; display: block; }
.gpa-charla-cabeza span { font-size: 13px; color: var(--texto-2); }
.gpa-modo { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--texto-2); white-space: nowrap; }
.gpa-modo::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.gpa-modo[data-ia="1"] { color: var(--teal-claro); }
.gpa-hilo { flex: 1; overflow-y: auto; padding: 18px 16px; display: flex; flex-direction: column; gap: 12px; }
.gpa-msg { max-width: 86%; padding: 11px 14px; border-radius: 18px; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
.gpa-msg[data-rol="companera"] { background: var(--noche-3); border-bottom-left-radius: 6px; align-self: flex-start; }
.gpa-msg[data-rol="estudiante"] { background: var(--teal); color: #fff; border-bottom-right-radius: 6px; align-self: flex-end; }
.gpa-msg[data-rol="nota"] { align-self: center; max-width: 100%; color: var(--texto-2); font-size: 13px; text-align: center; padding: 2px 8px; }
.gpa-pista { display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; padding: 8px 10px; border-radius: 12px; background: rgba(233,196,106,.10); border-left: 3px solid var(--ambar); font-size: 13.5px; color: #F3E3B5; white-space: normal; }
.gpa-pista img { width: 28px; height: 24px; flex: none; }
.gpa-pista small { display: block; font-size: 12px; font-weight: 600; color: var(--ambar); }
.gpa-bienvenida { margin: auto auto 0; width: 132px; height: auto; opacity: .95; }
.gpa-pensando { display: inline-flex; gap: 5px; padding: 6px 2px; }
.gpa-pensando i { width: 7px; height: 7px; border-radius: 50%; background: var(--texto-2); animation: gpa-punto 1s infinite; }
.gpa-pensando i:nth-child(2) { animation-delay: .15s; } .gpa-pensando i:nth-child(3) { animation-delay: .3s; }
@keyframes gpa-punto { 0%, 60%, 100% { transform: translateY(0); opacity: .45 } 30% { transform: translateY(-4px); opacity: 1 } }
.gpa-escribe { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--borde); align-items: flex-end; }
.gpa-escribe textarea { flex: 1; min-width: 0; resize: none; border: 1px solid var(--borde); border-radius: 16px; padding: 11px 14px; background: var(--noche); color: var(--texto); height: 46px; max-height: 140px; line-height: 1.4; font-size: 16px; }
.gpa-escribe textarea::placeholder { color: rgba(248,249,250,.45); }
.gpa-escribe textarea:focus { outline: none; border-color: var(--teal-claro); box-shadow: 0 0 0 3px rgba(92,198,184,.2); }
.gpa-enviar { flex: none; width: 46px; height: 46px; border-radius: 50%; border: 0; background: var(--ambar); color: var(--noche); display: grid; place-items: center; }
.gpa-enviar:disabled { opacity: .45; cursor: default; }

.gpa-hoja { background: var(--hoja); color: var(--tinta); border-radius: 4px; padding: clamp(20px, 4vw, 44px) clamp(18px, 4vw, 48px) clamp(24px, 4vw, 40px); box-shadow: 0 24px 48px -20px rgba(0,0,0,.6), 0 2px 6px rgba(0,0,0,.25); position: relative; }
.gpa-hoja::after { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 6px; background: linear-gradient(90deg, var(--teal), var(--teal-claro)); border-radius: 4px 4px 0 0; }
.gpa-membrete { display: flex; justify-content: space-between; gap: 4px 12px; flex-wrap: wrap; font-size: 12.5px; color: var(--tinta-2); padding-bottom: 12px; border-bottom: 1px solid var(--raya); }
.gpa-membrete b { font-weight: 600; color: var(--tinta); }
.gpa-hoja h2 { font: 800 clamp(22px, 3vw, 30px)/1.12 Sora, Inter, sans-serif; margin: 18px 0 4px; letter-spacing: -.015em; text-wrap: balance; color: var(--tinta); }
.gpa-nombre { width: 100%; border: 0; border-bottom: 1.5px solid var(--raya); background: transparent; color: var(--boligrafo); font: 600 19px/1.35 Sora, Inter, sans-serif; padding: 6px 0; text-overflow: ellipsis; }
.gpa-nombre::placeholder { color: #A9B3C2; font-weight: 500; }
.gpa-nombre:focus { outline: none; border-color: var(--boligrafo); }
.gpa-que-es { margin: 10px 0 0; font-size: 13.5px; color: var(--tinta-2); max-width: 62ch; }
.gpa-avance { display: flex; align-items: center; gap: 12px; margin: 18px 0 6px; }
.gpa-marcas { flex: 1; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; }
.gpa-marcas i { height: 6px; border-radius: 3px; background: var(--raya); transition: background-color .4s; }
.gpa-marcas i[data-e="incompleto"] { background: #F2B8A6; } .gpa-marcas i[data-e="listo"] { background: var(--teal); }
.gpa-avance b { font: 700 13.5px Sora, Inter, sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.gpa-campo { padding: 14px 8px 12px; margin: 0 -8px; box-shadow: inset 0 -1px 0 var(--raya); display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; gap: 2px 10px; align-items: baseline; transition: background-color .9s; }
.gpa-campo[data-recien="1"] { background-color: var(--resalte); transition: none; }
.gpa-num { font: 700 13px/1.6 Sora, Inter, sans-serif; color: #A9B3C2; font-variant-numeric: tabular-nums; }
.gpa-campo[data-e="listo"] .gpa-num { color: var(--teal); }
.gpa-campo label { font: 700 15px/1.35 Sora, Inter, sans-serif; display: block; }
.gpa-ayuda { font-size: 13px; color: var(--tinta-2); display: block; margin-top: 1px; }
.gpa-campo textarea { grid-column: 2 / 4; resize: none; border: 0; border-radius: 6px; background: transparent; color: var(--tinta); font: 15.5px/1.55 Inter, system-ui, sans-serif; padding: 6px 8px; margin: 4px 0 0 -8px; width: calc(100% + 8px); min-height: 34px; overflow: hidden; }
.gpa-campo textarea:hover { background: #F7F3EA; }
.gpa-campo textarea:focus { outline: none; background: #F2EEE4; box-shadow: inset 0 -2px 0 var(--boligrafo); }
.gpa-campo textarea::placeholder { color: #B5BDC9; }
.gpa-estado { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; white-space: nowrap; color: #7E8A9C; }
.gpa-estado::before { content: ""; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid currentColor; }
.gpa-estado[data-e="incompleto"] { color: #B9472A; }
.gpa-estado[data-e="listo"] { color: #1D7F72; } .gpa-estado[data-e="listo"]::before { background: currentColor; }
.gpa-cierre { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px 24px; align-items: end; margin-top: 28px; }
.gpa-firmas { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.gpa-firma input { width: 100%; border: 0; border-bottom: 1.5px solid var(--tinta); background: transparent; color: var(--boligrafo); font: 700 32px/1.15 "Caveat FAE", "Segoe Script", cursive; padding: 0 0 2px; }
.gpa-firma input::placeholder { color: #C7CDD6; }
.gpa-firma input:focus { outline: none; border-bottom-color: var(--boligrafo); }
.gpa-firma span { font-size: 12.5px; color: var(--tinta-2); display: block; margin-top: 6px; }
.gpa-sello { width: 118px; height: 118px; border-radius: 50%; display: grid; place-items: center; align-content: center; text-align: center; position: relative; color: #8A5E00; transform: rotate(-12deg) scale(.4); opacity: 0; transition: transform .5s cubic-bezier(.2,1.6,.4,1), opacity .3s; }
.gpa-sello::before { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 3px solid #C99A2E; box-shadow: 0 0 0 5px var(--hoja), 0 0 0 7px #C99A2E; background: rgba(233,196,106,.16); }
.gpa-sello img { width: 58px; position: relative; }
.gpa-sello small { position: relative; font: 800 10.5px/1.1 Sora, Inter, sans-serif; }
.gpa-sello[data-listo="1"] { opacity: 1; transform: rotate(-12deg) scale(1); }
.gpa-acciones { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; align-items: center; padding-top: 16px; border-top: 1px dashed var(--raya); }
.gpa-aviso { font-size: 13.5px; color: var(--tinta-2); flex: 1 1 220px; margin: 0; }
.gpa-btn { min-height: 44px; padding: 10px 18px; border-radius: 999px; font-weight: 600; font-size: 14.5px; border: 1px solid #CFD6E0; background: #fff; color: var(--tinta); }
.gpa-btn:hover { background: #F4F6F9; }
.gpa-btn[data-primario="1"] { background: var(--tinta); color: #fff; border-color: var(--tinta); }

.gpa-ejemplo { border: 0; padding: 0; background: transparent; width: min(720px, calc(100% - 32px)); max-height: 90vh; }
.gpa-ejemplo::backdrop { background: rgba(6,12,22,.72); }
.gpa-ejemplo .gpa-hoja { max-height: 90vh; overflow-y: auto; }
.gpa-ej-cabeza { display: flex; gap: 14px; align-items: center; }
.gpa-ej-cabeza img { width: 64px; flex: none; }
.gpa-ej-cabeza h2 { margin: 0; }
.gpa-ej-cabeza p { margin: 2px 0 0; color: var(--tinta-2); font-size: 13.5px; }
.gpa-ej-campo { padding: 10px 0; border-bottom: 1px solid var(--raya); }
.gpa-ej-campo b { font: 700 14.5px/1.3 Sora, Inter, sans-serif; display: block; }
.gpa-ej-campo p { margin: 3px 0 0; font-size: 15px; }

@media (max-width: 899px) {
  .gpa-pestanas { display: flex; }
  .gpa-mesa { grid-template-columns: minmax(0, 1fr); }
  .gpa-mesa[data-vista="charla"] .gpa-hoja { display: none; }
  .gpa-mesa[data-vista="acta"] .gpa-charla { display: none; }
  .gpa-charla { height: calc(100dvh - 236px); min-height: 420px; position: static; }
  .gpa-cabeza { margin-bottom: 10px; gap: 8px 10px; }
  .gpa-cabeza h1 { font-size: 22px; }
  .gpa-cierre { grid-template-columns: minmax(0, 1fr); }
  .gpa-sello { justify-self: center; }
}
@media (max-width: 420px) {
  .gpa-cabeza p { display: none; }
  .gpa-fantasma { padding: 9px 12px; font-size: 13.5px; }
  .gpa-msg { max-width: 92%; }
}
@media (prefers-reduced-motion: reduce) { .gpa *, .gpa *::before { animation: none !important; transition: none !important; } }
@media print {
  body * { visibility: hidden !important; }
  .gpa-hoja, .gpa-hoja * { visibility: visible !important; }
  .gpa-hoja { display: block !important; position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; }
  .gpa-hoja::after, .gpa-acciones, .gpa-avance { display: none !important; }
  .gpa-campo textarea { height: auto !important; }
}
`;

function crece(ta) { if (ta) { ta.style.height = "auto"; ta.style.height = `${ta.scrollHeight}px`; } }

function Campo({ c, i, s, recien, onCambia, onRevisa }) {
  const ref = useRef(null);
  useLayoutEffect(() => crece(ref.current));
  return (
    <div className="gpa-campo" data-e={s.estado} data-recien={recien ? "1" : "0"} id={`gpa-c-${c.id}`}>
      <span className="gpa-num">{String(i + 1).padStart(2, "0")}</span>
      <div><label htmlFor={`gpa-v-${c.id}`}>{c.t}</label><span className="gpa-ayuda">{c.a}</span></div>
      <span className="gpa-estado" data-e={s.estado}>{ETIQUETA[s.estado]}</span>
      <textarea ref={ref} id={`gpa-v-${c.id}`} rows={1} placeholder="Sin llenar" value={s.valor}
        onChange={(e) => onCambia(c.id, e.target.value)} onBlur={(e) => onRevisa(c, e.target.value)} />
    </div>
  );
}

export default function ArmaTuActa({ onBack }) {
  const [E, setE] = useState(leerGuardado);
  const [vista, setVista] = useState("charla");
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [conIA, setConIA] = useState(true);
  const [recien, setRecien] = useState([]);
  const [salta, setSalta] = useState(false);
  const [confirma, setConfirma] = useState(false);
  const [copiado, setCopiado] = useState("");
  const hilo = useRef(null);
  const dialogo = useRef(null);
  const entrada = useRef(null);

  useEffect(() => { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch { /* sin almacenamiento */ } }, [E]);
  useEffect(() => { const h = hilo.current; if (h) h.scrollTop = h.scrollHeight; }, [E.hilo.length, ocupado, vista]);
  useEffect(() => {
    if (!recien.length) return undefined;
    const t = setTimeout(() => setRecien([]), 1400);
    return () => clearTimeout(t);
  }, [recien]);

  const listos = CAMPOS.filter((c) => E.campos[c.id].estado === "listo").length;
  const lista = listos === 12 && E.nombre.trim();
  const firmada = lista && E.firmas.patro.trim() && E.firmas.dir.trim();
  const pose = lista ? "estrellas" : ocupado ? "piensa" : salta ? "feliz" : "tranquila";

  function marca(ids) {
    setRecien(ids);
    if (ids.length) { setSalta(true); setTimeout(() => setSalta(false), 1800); }
  }

  async function enviar(ev) {
    ev?.preventDefault();
    const t = texto.trim();
    if (!t || ocupado) return;
    setTexto("");
    if (entrada.current) entrada.current.style.height = "";
    const conMensaje = { ...E, hilo: [...E.hilo, { rol: "estudiante", texto: t }] };
    setE(conMensaje);
    if (!conIA) { const r = pasoGuiado(conMensaje, t); setE(r.E); marca(r.cambiados); return; }
    setOcupado(true);
    const r = await llamarSimulador({
      escenario: "gp26-acta", accion: "pregunta", mensaje: t,
      acta: { nombre: E.nombre, campos: E.campos },
      historial: E.hilo.filter((h) => h.rol !== "nota").map((h) => ({ rol: h.rol, texto: h.texto })),
    });
    setOcupado(false);
    if (r?.error) {
      /* Sin sesión, sin cupo o sin servidor: Pía sigue con las preguntas guiadas, sin perder lo escrito. */
      setConIA(false);
      const motivo = r.error === SIN_SESION ? "Sin sesión iniciada sigo con preguntas guiadas." : `${r.error} Sigo con preguntas guiadas.`;
      const base = { ...conMensaje, paso: Math.max(0, siguienteVacio(conMensaje)), hilo: [...conMensaje.hilo, { rol: "nota", texto: motivo }] };
      const g = pasoGuiado(base, t);
      setE(g.E); marca(g.cambiados);
      return;
    }
    const nuevo = structuredClone(conMensaje);
    if (r.nombre) nuevo.nombre = r.nombre;
    const ids = [];
    for (const c of r.campos ?? []) {
      if (!nuevo.campos[c.id]) continue;
      nuevo.campos[c.id] = { valor: c.valor, estado: c.estado };
      ids.push(c.id);
    }
    nuevo.hilo.push({ rol: "companera", texto: r.dice });
    setE(nuevo); marca(ids);
  }

  const cambiaCampo = (id, valor) => setE((p) => {
    const est = !valor.trim() ? "vacio" : p.campos[id].estado === "vacio" ? "incompleto" : p.campos[id].estado;
    return { ...p, campos: { ...p.campos, [id]: { valor, estado: est } } };
  });
  const revisaCampo = (c, valor) => setE((p) => {
    if (!valor.trim()) return p;
    return { ...p, campos: { ...p.campos, [c.id]: { valor, estado: revisaLocal(c, valor) ? "listo" : "incompleto" } } };
  });

  function reiniciar() {
    if (!confirma) { setConfirma(true); setTimeout(() => setConfirma(false), 3500); return; }
    setConfirma(false); setConIA(true); setE(estadoVacio());
  }
  async function copiar() {
    try { await navigator.clipboard.writeText(comoTexto(E)); setCopiado("Copiada"); } catch { setCopiado("No se pudo copiar"); }
    setTimeout(() => setCopiado(""), 1800);
  }
  function guardarPdf() { setVista("acta"); setTimeout(() => window.print(), 50); }

  const aviso = !lista ? "Completa los 12 componentes para firmarla. También puedes escribir directo en la hoja."
    : !firmada ? "Lista para firmar: escribe el nombre del patrocinador y del director."
      : "Firmada. Guárdala en PDF desde el diálogo de impresión.";

  return (
    <div className="gpa" data-simulador="gp26-acta">
      <style>{CSS}</style>
      <header className="gpa-cabeza">
        <button type="button" className="gpa-fantasma" onClick={onBack}>← Gestión de Proyectos</button>
        <div className="gpa-cabeza-txt">
          <h1>Arma tu acta</h1>
          <p>El acta de constitución de tu proyecto, componente por componente, con la Guía del PMBOK® 6.ª ed. (4.1.3.1).</p>
        </div>
        <div className="gpa-acc">
          <button type="button" className="gpa-fantasma" onClick={() => dialogo.current?.showModal()}>Ver el acta de Pía</button>
          <button type="button" className="gpa-fantasma" data-alerta={confirma ? "1" : "0"} onClick={reiniciar}>{confirma ? "¿Borrar todo? Toca otra vez" : "Empezar de nuevo"}</button>
        </div>
      </header>

      <div className="gpa-pestanas" role="tablist" aria-label="Vista">
        <button type="button" role="tab" aria-selected={vista === "charla"} onClick={() => setVista("charla")}>Conversación</button>
        <button type="button" role="tab" aria-selected={vista === "acta"} onClick={() => setVista("acta")} data-tab-acta>Tu acta <span className="gpa-mini">{listos}/12</span></button>
      </div>

      <main className="gpa-mesa" data-vista={vista}>
        <section className="gpa-charla" aria-label="Conversación con Pía">
          <div className="gpa-charla-cabeza">
            <div className="gpa-avatar" data-salta={salta ? "1" : "0"}><img src={PIA(pose)} alt="" width="172" height="150" /></div>
            <div><b>Pía</b><span className="gpa-modo" data-ia={conIA ? "1" : "0"}>{conIA ? "Te entrevista con IA" : "Preguntas guiadas"}</span></div>
          </div>
          <div className="gpa-hilo" ref={hilo} aria-live="polite">
            {E.hilo.map((m, k) => (
              <div key={k} className="gpa-msg" data-rol={m.rol}>
                {m.texto}
                {m.pista && (
                  <span className="gpa-pista"><img src={PIA("feliz")} alt="" width="28" height="24" /><span><small>En el acta de Pía</small>{m.pista}</span></span>
                )}
              </div>
            ))}
            {E.hilo.length === 1 && <img className="gpa-bienvenida" src={PIA("tranquila", "cuerpo")} alt="" width="150" height="192" />}
            {ocupado && <div className="gpa-msg" data-rol="companera" aria-label="Pía está escribiendo"><span className="gpa-pensando"><i /><i /><i /></span></div>}
          </div>
          <form className="gpa-escribe" onSubmit={enviar}>
            <textarea ref={entrada} id="gpa-entrada" rows={1} placeholder="Escribe tu respuesta" aria-label="Tu respuesta" value={texto}
              onChange={(e) => { setTexto(e.target.value); const t = e.target; t.style.height = "auto"; t.style.height = `${Math.min(140, t.scrollHeight)}px`; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }} />
            <button className="gpa-enviar" type="submit" aria-label="Enviar" disabled={ocupado || !texto.trim()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
            </button>
          </form>
        </section>

        <article className="gpa-hoja" aria-label="Acta de constitución del proyecto">
          <div className="gpa-membrete"><span><b>Acta de constitución</b>, grupo de procesos de Inicio</span><span>Guía del PMBOK® 6.ª ed., p. 81</span></div>
          <h2>Acta de constitución del proyecto</h2>
          <input className="gpa-nombre" placeholder="Nombre de tu proyecto" aria-label="Nombre del proyecto" value={E.nombre} onChange={(e) => setE({ ...E, nombre: e.target.value })} />
          <p className="gpa-que-es">Es el documento con el que el patrocinador autoriza formalmente el proyecto y le da al director la autoridad para usar los recursos de la organización.</p>
          <div className="gpa-avance" aria-hidden="true">
            <div className="gpa-marcas">{CAMPOS.map((c) => <i key={c.id} data-e={E.campos[c.id].estado} />)}</div>
            <b>{listos} de 12</b>
          </div>
          <div>
            {CAMPOS.map((c, i) => <Campo key={c.id} c={c} i={i} s={E.campos[c.id]} recien={recien.includes(c.id)} onCambia={cambiaCampo} onRevisa={revisaCampo} />)}
          </div>
          <div className="gpa-cierre">
            <div className="gpa-firmas">
              <div className="gpa-firma"><input aria-label="Firma del patrocinador" placeholder="Firma" value={E.firmas.patro} onChange={(e) => setE({ ...E, firmas: { ...E.firmas, patro: e.target.value } })} /><span>Patrocinador: quien autoriza</span></div>
              <div className="gpa-firma"><input aria-label="Firma del director del proyecto" placeholder="Firma" value={E.firmas.dir} onChange={(e) => setE({ ...E, firmas: { ...E.firmas, dir: e.target.value } })} /><span>Director del proyecto</span></div>
            </div>
            <div className="gpa-sello" data-listo={lista ? "1" : "0"} aria-hidden={!lista}>
              <img src={PIA("estrellas")} alt="" width="58" height="51" /><small>Lista para<br />firmar</small>
            </div>
          </div>
          <div className="gpa-acciones">
            <p className="gpa-aviso" aria-live="polite">{aviso}</p>
            <button type="button" className="gpa-btn" onClick={copiar}>{copiado || "Copiar texto"}</button>
            {firmada && <button type="button" className="gpa-btn" data-primario="1" onClick={guardarPdf}>Guardar en PDF</button>}
          </div>
        </article>
      </main>

      <dialog className="gpa-ejemplo" ref={dialogo} aria-label="Ejemplo: el acta de Pía" onClick={(e) => { if (e.target === dialogo.current) dialogo.current.close(); }}>
        <div className="gpa-hoja">
          <div className="gpa-ej-cabeza">
            <img src={PIA("feliz", "cuerpo")} alt="" width="64" height="82" />
            <div style={{ flex: 1, minWidth: 0 }}><h2>El acta de Pía</h2><p>Panadería Pía, segunda sede. Así queda un acta completa.</p></div>
            <button type="button" className="gpa-btn" onClick={() => dialogo.current?.close()}>Cerrar</button>
          </div>
          <div style={{ marginTop: 12 }}>
            {CAMPOS.map((c, i) => <div key={c.id} className="gpa-ej-campo"><b>{i + 1}. {c.t}</b><p>{EJEMPLO[c.id]}</p></div>)}
          </div>
        </div>
      </dialog>
    </div>
  );
}
