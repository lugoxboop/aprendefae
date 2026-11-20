import { createPortal } from "react-dom";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Plus, UserPlus, Check, X, Swords, Gamepad2 } from "lucide-react";
import { FAE } from "../../theme.js";
import { NavigationContext } from "../../navigation.js";
import { AuthContext } from "../../auth/AuthProvider.jsx";
import AvatarEstudiante from "../avatar/AvatarEstudiante.jsx";
import { useAmigosInicio } from "../../social/useAmigosInicio.js";
import { perfilDeTarjeta } from "./PanelAmigos.jsx";
import Entrada from "../shared/Entrada.jsx";
import { useMisSalas } from "../../entreno/datos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FILA DE AMIGOS DE LA PORTADA (pedido de Mateo, 20-nov-2026).
 *
 * Entre el titular y las materias, una fila de círculos con la mascota de cada
 * amigo, como la de inicio de las plataformas de juegos que los estudiantes ya
 * conocen: primero «Añadir amigos», luego los amigos, y «Ver todo» arriba a la
 * derecha.
 *
 * LA MISMA FILA, DOS ESTADOS:
 *   · sin amigos  → «Sugerencias de amistad»: se desliza, y cada una trae su
 *                   botón «Añadir». Tocar el círculo abre la ficha del otro,
 *                   que también tiene «Enviar solicitud».
 *   · con amigos  → los amigos. Con el primero aceptado las sugerencias se van
 *                   (lo decide amigos_inicio, 0170).
 *
 * Sin sesión no se pinta nada: la portada sigue siendo la de siempre, y
 * «Entrar no pide registro» sigue siendo verdad.
 *
 * Los colores siguen la regla de la casa: el teal es relleno con texto oscuro
 * (#06202A), nunca texto sobre el fondo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TEXTO_SUAVE = "#A8B6C8";

function EstiloFila() {
  return (
    <style>{`
.fae-amigos { width: 100%; max-width: 760px; }
.fae-amigos-cab { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 10px; }
.fae-amigos-titulo { font-family: Sora, sans-serif; font-weight: 700; font-size: 17px; letter-spacing: -0.01em; color: ${FAE.text}; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fae-amigos-titulo span { color: ${TEXTO_SUAVE}; font-weight: 600; }
.fae-amigos-acciones { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.fae-amigos-vertodo { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 6px 0 10px; border: 0; background: transparent; color: ${FAE.text}; font-family: Sora, sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; border-radius: 12px; }
.fae-amigos-vertodo:hover { background: rgba(248,249,250,0.06); }
.fae-amigos-vertodo svg { transition: transform .18s ease; }
.fae-amigos-vertodo:hover svg { transform: translateX(3px); }
.fae-amigos-flecha { display: none; width: 36px; height: 36px; border-radius: 999px; border: 1px solid rgba(248,249,250,0.14); background: rgba(248,249,250,0.04); color: ${FAE.text}; align-items: center; justify-content: center; cursor: pointer; transition: background .15s ease, opacity .15s ease; }
.fae-amigos-flecha:hover:not(:disabled) { background: rgba(248,249,250,0.1); }
.fae-amigos-flecha:disabled { opacity: .3; cursor: default; }
@media (hover: hover) and (pointer: fine) and (min-width: 560px) { .fae-amigos-flecha { display: inline-flex; } }
@media (max-width: 399px) { .fae-amigos-titulo .fae-largo { display: none; } }

.fae-amigos-pista { position: relative; margin: 0 -24px; }
.fae-amigos-fila { display: flex; gap: 6px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; scroll-padding: 0 24px; padding: 4px 24px 6px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.fae-amigos-fila::-webkit-scrollbar { display: none; }
.fae-amigos-pista[data-borde-d="si"] .fae-amigos-fila { -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 56px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 56px), transparent); }
.fae-amigos-pista[data-borde-i="si"] .fae-amigos-fila { -webkit-mask-image: linear-gradient(270deg, #000 calc(100% - 56px), transparent); mask-image: linear-gradient(270deg, #000 calc(100% - 56px), transparent); }
.fae-amigos-pista[data-borde-i="si"][data-borde-d="si"] .fae-amigos-fila { -webkit-mask-image: linear-gradient(90deg, transparent, #000 56px, #000 calc(100% - 56px), transparent); mask-image: linear-gradient(90deg, transparent, #000 56px, #000 calc(100% - 56px), transparent); }

.fae-amigo { flex: 0 0 auto; width: 88px; display: flex; flex-direction: column; align-items: center; gap: 7px; scroll-snap-align: start; padding: 4px 2px; border: 0; background: transparent; color: inherit; cursor: pointer; border-radius: 16px; font: inherit; -webkit-tap-highlight-color: transparent; }
.fae-amigo:focus-visible { outline: 2px solid ${FAE.teal}; outline-offset: 2px; }
.fae-amigo-circulo { position: relative; width: 74px; height: 74px; border-radius: 999px; display: grid; place-items: center; background: radial-gradient(120% 120% at 30% 20%, rgba(248,249,250,0.16), rgba(248,249,250,0.04) 60%), rgba(29,53,87,0.55); box-shadow: inset 0 0 0 2px rgba(248,249,250,0.12), 0 6px 18px -8px rgba(0,0,0,0.6); transition: transform .2s cubic-bezier(.2,.9,.3,1.3), box-shadow .2s ease; }
.fae-amigo-cara { width: 100%; height: 100%; border-radius: 999px; overflow: hidden; display: grid; place-items: end center; }
.fae-amigo:hover .fae-amigo-circulo, .fae-amigo:focus-visible .fae-amigo-circulo { transform: translateY(-3px); box-shadow: inset 0 0 0 2px ${FAE.teal}, 0 10px 22px -8px rgba(42,157,143,0.55); }
.fae-amigo:active .fae-amigo-circulo { transform: scale(.96); }
.fae-amigo-nombre { max-width: 100%; font-family: Sora, sans-serif; font-weight: 600; font-size: 12.5px; line-height: 1.25; color: ${FAE.text}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fae-amigo-racha { position: absolute; right: -4px; bottom: -2px; display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px 2px 4px; border-radius: 999px; background: #0E1B2E; box-shadow: 0 0 0 2px rgba(248,249,250,0.14); font-family: Sora, sans-serif; font-weight: 700; font-size: 11px; color: ${FAE.text}; line-height: 1.2; }
.fae-amigo-racha svg { color: ${FAE.ambar}; }

.fae-amigo-anadir .fae-amigo-circulo { background: rgba(248,249,250,0.05); box-shadow: inset 0 0 0 2px rgba(248,249,250,0.22); }
.fae-amigo-anadir .fae-amigo-circulo { border: 0; }
.fae-amigo-anadir .fae-amigo-nombre { white-space: normal; text-align: center; color: ${TEXTO_SUAVE}; }

.fae-sug { flex: 0 0 auto; width: 118px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 8px 10px; border-radius: 18px; background: rgba(248,249,250,0.045); box-shadow: inset 0 0 0 1px rgba(248,249,250,0.1); scroll-snap-align: start; }
.fae-sug .fae-amigo { width: 100%; padding: 0; }
.fae-sug-boton { display: inline-flex; align-items: center; justify-content: center; gap: 5px; width: 100%; min-height: 40px; border-radius: 999px; border: 0; font-family: Sora, sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: transform .15s ease, filter .15s ease; }
.fae-sug-boton[data-tono="si"] { background: ${FAE.teal}; color: #06202A; }
.fae-sug-boton[data-tono="si"]:hover { filter: brightness(1.08); }
.fae-sug-boton[data-tono="si"]:active { transform: scale(.97); }
.fae-sug-boton[data-tono="hecho"] { background: rgba(248,249,250,0.07); color: ${TEXTO_SUAVE}; cursor: default; box-shadow: inset 0 0 0 1px rgba(248,249,250,0.12); }
.fae-sug-pie { margin: 8px 0 0; font-size: 12.5px; color: ${TEXTO_SUAVE}; }

.fae-esq { flex: 0 0 auto; width: 88px; display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 4px 2px; }
.fae-esq i { display: block; width: 74px; height: 74px; border-radius: 999px; background: rgba(248,249,250,0.07); animation: fae-esq 1.2s ease-in-out infinite alternate; }
.fae-esq b { display: block; width: 52px; height: 10px; border-radius: 6px; background: rgba(248,249,250,0.07); animation: fae-esq 1.2s ease-in-out infinite alternate; }
@keyframes fae-esq { to { opacity: .45; } }

@media (min-width: 720px) {
  .fae-amigo { width: 96px; }
  .fae-amigo-circulo, .fae-esq i { width: 82px; height: 82px; }
  .fae-sug { width: 128px; }
  .fae-amigos-titulo { font-size: 18px; }
}

.fae-ficha-fondo { position: fixed; inset: 0; z-index: 60; background: rgba(5,12,22,0.62); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: fae-ficha-fondo .2s ease both; }
.fae-ficha { position: relative; width: 100%; max-width: 360px; border-radius: 24px; padding: 26px 22px 20px; text-align: center; color: ${FAE.text}; background: radial-gradient(140% 90% at 50% 0%, rgba(42,157,143,0.22), rgba(42,157,143,0) 60%), linear-gradient(180deg, #16294A, #0F1D33); box-shadow: inset 0 0 0 1px rgba(248,249,250,0.12), 0 30px 60px -20px rgba(0,0,0,0.7); animation: fae-ficha .32s cubic-bezier(.2,.9,.3,1.2) both; }
.fae-ficha-cerrar { position: absolute; top: 8px; right: 8px; width: 44px; height: 44px; border-radius: 999px; border: 0; background: transparent; color: ${TEXTO_SUAVE}; display: grid; place-items: center; cursor: pointer; }
.fae-ficha-cerrar:hover { background: rgba(248,249,250,0.08); color: ${FAE.text}; }
.fae-ficha-escenario { width: 150px; height: 150px; margin: 0 auto 12px; border-radius: 999px; display: grid; place-items: end center; overflow: hidden; background: radial-gradient(120% 120% at 30% 20%, rgba(248,249,250,0.18), rgba(248,249,250,0.04) 60%), rgba(29,53,87,0.6); box-shadow: inset 0 0 0 3px rgba(248,249,250,0.14); }
.fae-ficha h2 { font-family: Sora, sans-serif; font-weight: 700; font-size: 22px; letter-spacing: -0.02em; margin: 0; overflow-wrap: anywhere; }
.fae-ficha-sub { margin: 6px 0 0; font-size: 14px; color: ${TEXTO_SUAVE}; }
.fae-ficha-datos { display: flex; justify-content: center; gap: 10px; margin: 16px 0 18px; flex-wrap: wrap; }
.fae-ficha-dato { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px; background: rgba(248,249,250,0.06); box-shadow: inset 0 0 0 1px rgba(248,249,250,0.1); font-size: 13px; font-weight: 600; }
.fae-ficha-dato svg { color: ${FAE.ambar}; }
.fae-ficha-boton { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 48px; border-radius: 14px; border: 0; font-family: Sora, sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; }
.fae-ficha-boton[data-tono="si"] { background: ${FAE.teal}; color: #06202A; }
.fae-ficha-boton[data-tono="oro"] { background: linear-gradient(180deg, #FFE08A, #E9B949); color: #2A1A00; box-shadow: 0 6px 20px -6px rgba(233,185,73,.85); }
.fae-amigo-sala .fae-amigo-circulo { background: radial-gradient(120% 120% at 30% 20%, rgba(159,180,255,0.4), rgba(111,134,255,0.12) 60%), rgba(29,53,87,0.7); box-shadow: inset 0 0 0 2px rgba(159,180,255,0.55), 0 6px 18px -8px rgba(0,0,0,0.6); }
.fae-amigo-sala .fae-amigo-nombre { white-space: normal; text-align: center; color: #C9D2FF; }
.fae-sala-aviso { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; padding: 8px 8px 8px 14px; border-radius: 14px; background: linear-gradient(90deg, rgba(233,185,73,.18), rgba(248,249,250,.03)); border: 1px solid rgba(233,185,73,.5); color: ${FAE.text}; font-size: 13.5px; font-weight: 600; }
.fae-sala-aviso span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fae-sala-aviso button { flex: none; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 0; cursor: pointer; background: linear-gradient(180deg, #FFE08A, #E9B949); color: #2A1A00; font-family: Sora, sans-serif; font-weight: 800; font-size: 13px; }
.fae-ficha-boton[data-tono="hecho"] { background: rgba(248,249,250,0.07); color: ${TEXTO_SUAVE}; cursor: default; }
.fae-ficha-boton[data-tono="neutro"] { background: rgba(248,249,250,0.07); color: ${FAE.text}; box-shadow: inset 0 0 0 1px rgba(248,249,250,0.14); }
.fae-ficha-error { margin: 10px 0 0; font-size: 13px; color: #F4A28C; }
@keyframes fae-ficha-fondo { from { opacity: 0; } }
@keyframes fae-ficha { from { opacity: 0; transform: translateY(14px) scale(.96); } }
@media (max-width: 559px) {
  .fae-ficha-fondo { align-items: flex-end; padding: 0; }
  .fae-ficha { max-width: none; border-radius: 24px 24px 0 0; padding-bottom: calc(22px + env(safe-area-inset-bottom)); }
}
@media (prefers-reduced-motion: reduce) {
  .fae-amigo-circulo, .fae-ficha, .fae-ficha-fondo, .fae-esq i, .fae-esq b { transition: none; animation: none; }
}
`}</style>
  );
}

/* La cara de alguien dentro de su círculo. */
function Cara({ tarjeta, tamano }) {
  return (
    <span className="fae-amigo-cara">
      <AvatarEstudiante perfil={perfilDeTarjeta(tarjeta)} tamano={tamano} encuadre="busto" titulo={`Mascota de ${tarjeta.apodo}`} />
    </span>
  );
}

function Racha({ dias }) {
  if (!dias || dias < 1) return null;
  return (
    <span className="fae-amigo-racha" aria-label={`Racha de ${dias} días`}>
      <Flame size={11} strokeWidth={2.6} aria-hidden="true" />
      {dias}
    </span>
  );
}

function Circulo({ tarjeta, onAbrir }) {
  return (
    <button type="button" className="fae-amigo" data-amigo-inicio onClick={() => onAbrir(tarjeta)} aria-label={`Ver a ${tarjeta.apodo}`}>
      <span className="fae-amigo-circulo">
        <Cara tarjeta={tarjeta} tamano={82} />
        <Racha dias={tarjeta.racha} />
      </span>
      <span className="fae-amigo-nombre">{tarjeta.apodo}</span>
    </button>
  );
}

function textoBoton(s) {
  if (s.te_pidio) return { texto: "Aceptar", tono: "si", Icono: Check };
  if (s.enviada) return { texto: "Enviada", tono: "hecho", Icono: Check };
  return { texto: "Añadir", tono: "si", Icono: UserPlus };
}

function Sugerencia({ s, onAbrir, onPedir }) {
  const { texto, tono, Icono } = textoBoton(s);
  return (
    <div className="fae-sug" data-sugerencia>
      <Circulo tarjeta={s} onAbrir={onAbrir} />
      <button
        type="button"
        className="fae-sug-boton"
        data-tono={tono}
        disabled={tono === "hecho"}
        onClick={() => onPedir(s)}
        aria-label={tono === "hecho" ? `Solicitud enviada a ${s.apodo}` : `${texto} a ${s.apodo}`}
      >
        <Icono size={15} strokeWidth={2.6} aria-hidden="true" />
        {texto}
      </button>
    </div>
  );
}

/* La ficha del otro: su mascota en grande y, si no es amigo, «Enviar solicitud». */
function Ficha({ tarjeta, esAmigo, onCerrar, onPedir, onVerTodo, onDuelo }) {
  const cerrarRef = useRef(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    cerrarRef.current?.focus();
    const tecla = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  const pedir = async () => {
    setError(null);
    const r = await onPedir(tarjeta);
    if (r?.error) setError(r.error);
  };
  const b = textoBoton(tarjeta);

  return (
    <div className="fae-ficha-fondo" onClick={onCerrar}>
      <div className="fae-ficha" role="dialog" aria-modal="true" aria-label={`Perfil de ${tarjeta.apodo}`} onClick={(e) => e.stopPropagation()}>
        <button ref={cerrarRef} type="button" className="fae-ficha-cerrar" onClick={onCerrar} aria-label="Cerrar">
          <X size={20} aria-hidden="true" />
        </button>
        <div className="fae-ficha-escenario">
          <AvatarEstudiante perfil={perfilDeTarjeta(tarjeta)} tamano={150} encuadre="busto" animo="saluda" titulo={`Mascota de ${tarjeta.apodo}`} />
        </div>
        <h2>{tarjeta.apodo}</h2>
        {tarjeta.mascota_nombre && <p className="fae-ficha-sub">Con {tarjeta.mascota_nombre}</p>}
        <div className="fae-ficha-datos">
          <span className="fae-ficha-dato">
            <Flame size={14} strokeWidth={2.6} aria-hidden="true" />
            {tarjeta.racha > 0 ? `Racha de ${tarjeta.racha} ${tarjeta.racha === 1 ? "día" : "días"}` : "Sin racha todavía"}
          </span>
          {esAmigo && <span className="fae-ficha-dato" style={{ color: FAE.text }}>Tu amigo</span>}
        </div>
        {esAmigo && onDuelo && (
          <button type="button" className="fae-ficha-boton" data-tono="oro" onClick={() => onDuelo(tarjeta)} data-retar-duelo style={{ marginBottom: "8px" }}>
            <Swords size={18} strokeWidth={2.4} aria-hidden="true" />
            Retar a un duelo
          </button>
        )}
        {esAmigo ? (
          <button type="button" className="fae-ficha-boton" data-tono="neutro" onClick={onVerTodo}>
            Ver todos tus amigos
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="fae-ficha-boton" data-tono={b.tono} disabled={b.tono === "hecho"} onClick={pedir}>
            <b.Icono size={18} strokeWidth={2.6} aria-hidden="true" />
            {tarjeta.te_pidio ? "Aceptar solicitud" : tarjeta.enviada ? "Solicitud enviada" : "Enviar solicitud"}
          </button>
        )}
        {error && <p className="fae-ficha-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}

export default function FilaAmigos({ orden = 2 }) {
  /* Sin proveedor (pruebas de la portada) se comporta como sin sesión: no pinta nada. */
  const session = useContext(AuthContext)?.session ?? null;
  const nav = useContext(NavigationContext);
  const { amigos, total, sugerencias, cargando, solicitar, modo } = useAmigosInicio(Boolean(session));
  const salas = useMisSalas(Boolean(session));
  const [abierta, setAbierta] = useState(null);
  const filaRef = useRef(null);
  const [bordes, setBordes] = useState({ i: false, d: false });

  const medir = useCallback(() => {
    const el = filaRef.current;
    if (!el) return;
    const i = el.scrollLeft > 4;
    const d = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setBordes((b) => (b.i === i && b.d === d ? b : { i, d }));
  }, []);

  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [medir, amigos.length, sugerencias.length, cargando]);

  const cerrarFicha = useCallback(() => setAbierta(null), []);

  if (!session) return null;
  if (!cargando && modo === "vacio") return null;

  const verTodo = () => nav?.irA?.("amigos");
  const irSalas = (extra = null) => nav?.irA?.("salas", null, extra);
  const duelo = (t) => irSalas(t.user_id ? `duelo-${t.user_id}` : `duelo-demo-${t.demo_id}`);
  const invitacion = salas.invitaciones[0];
  const mover = (dir) => filaRef.current?.scrollBy({ left: dir * filaRef.current.clientWidth * 0.8, behavior: "smooth" });

  /* La ficha se lee de la lista viva, para que «Enviada» se vea al instante. */
  const fichaViva = abierta
    ? amigos.find((a) => a.apodo === abierta.apodo) || sugerencias.find((s) => s.apodo === abierta.apodo) || abierta
    : null;

  const titulo =
    modo === "sugerencias" ? (
      <>Sugerencias<span className="fae-largo" style={{ color: "inherit", fontWeight: "inherit" }}> de amistad</span></>
    ) : (
      <>
        Amigos <span>({total})</span>
      </>
    );

  return (
    <Entrada orden={orden} modo="sube" style={{ width: "100%", maxWidth: "760px" }}>
    <section className="fae-amigos" aria-label={modo === "sugerencias" ? "Sugerencias de amistad" : "Tus amigos"} data-fila-amigos={modo}>
      <EstiloFila />
      <div className="fae-amigos-cab">
        <h2 className="fae-amigos-titulo">{cargando ? "Amigos" : titulo}</h2>
        <div className="fae-amigos-acciones">
          {bordes.i || bordes.d ? (
            <>
              <button type="button" className="fae-amigos-flecha" onClick={() => mover(-1)} disabled={!bordes.i} aria-label="Anteriores">
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button type="button" className="fae-amigos-flecha" onClick={() => mover(1)} disabled={!bordes.d} aria-label="Siguientes">
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </>
          ) : null}
          <button type="button" className="fae-amigos-vertodo" onClick={verTodo}>
            Ver todo
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {invitacion && (
        <div className="fae-sala-aviso" data-aviso-sala>
          <Gamepad2 size={18} aria-hidden="true" color="#FFE3A1" />
          <span>{invitacion.de?.apodo} te {invitacion.duelo ? "retó a un duelo" : "invitó a su sala"}</span>
          <button type="button" onClick={() => irSalas()}>Entrar</button>
        </div>
      )}
      <div className="fae-amigos-pista" data-borde-i={bordes.i ? "si" : "no"} data-borde-d={bordes.d ? "si" : "no"}>
        <div className="fae-amigos-fila" ref={filaRef} onScroll={medir}>
          {cargando ? (
            Array.from({ length: 6 }, (_, k) => (
              <div className="fae-esq" key={k} aria-hidden="true">
                <i />
                <b />
              </div>
            ))
          ) : (
            <>
              {modo === "amigos" && (
                <button type="button" className="fae-amigo fae-amigo-anadir" onClick={verTodo} aria-label="Añadir amigos">
                  <span className="fae-amigo-circulo">
                    <Plus size={30} strokeWidth={2.2} color={FAE.text} aria-hidden="true" />
                  </span>
                  <span className="fae-amigo-nombre">Añadir amigos</span>
                </button>
              )}
              {modo === "amigos" && (
                <button type="button" className="fae-amigo fae-amigo-sala" onClick={() => irSalas()} aria-label="Salas de entrenamiento" data-ir-salas>
                  <span className="fae-amigo-circulo">
                    <Gamepad2 size={30} strokeWidth={2.1} color="#E4E9FF" aria-hidden="true" />
                  </span>
                  <span className="fae-amigo-nombre">Jugar en sala</span>
                </button>
              )}
              {modo === "amigos"
                ? amigos.map((a) => <Circulo key={a.user_id || a.demo_id || a.apodo} tarjeta={a} onAbrir={setAbierta} />)
                : sugerencias.map((s) => <Sugerencia key={s.user_id} s={s} onAbrir={setAbierta} onPedir={(x) => solicitar(x.apodo)} />)}
            </>
          )}
        </div>
      </div>
      {modo === "sugerencias" && !cargando && (
        <p className="fae-sug-pie">Estudia con amigos: se retan, se animan y no pierden la racha.</p>
      )}

      {fichaViva && createPortal(
        <Ficha
          tarjeta={fichaViva}
          esAmigo={modo === "amigos"}
          onCerrar={cerrarFicha}
          onPedir={(t) => solicitar(t.apodo)}
          onDuelo={(t) => { setAbierta(null); duelo(t); }}
          onVerTodo={() => {
            setAbierta(null);
            verTodo();
          }}
        />,
        document.body,
      )}
    </section>
    </Entrada>
  );
}
