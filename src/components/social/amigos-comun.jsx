import { FAE, ANCHO_ESTRECHO } from "../../theme.js";
import Mascota from "../Mascota.jsx";
import { mascotaDe, colorDe, ESPECIES } from "../../mascota/mascotas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZAS COMUNES DE LA PANTALLA DE AMIGOS (rediseño del 20-nov, estilo juego).
 *
 * La idea, dicha en una línea: a cada amigo se le ve ENTERO, con su mascota
 * vestida como se vistió en la tienda, de pie sobre un escenario teñido con el
 * color de su pelaje, y el nombre debajo. Como la lista de amigos de un juego,
 * no como una lista de contactos.
 *
 * Aquí viven: el escenario con la mascota, el botón de la casa, el punto de
 * «estudió hoy», la ficha de racha y la hoja de estilo (clases amg-*).
 * Solo pintan; los datos y las acciones llegan por props.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Convierte la tarjeta de la base en el «perfil» que la mascota entiende. */
export function perfilDeTarjeta(t) {
  return {
    id: t?.user_id,
    mascota_especie: t?.mascota_especie,
    mascota_paleta: t?.mascota_paleta,
    mascota_ojos: t?.mascota_ojos,
    mascota_puestos: t?.mascota_puestos,
  };
}

/* «r, g, b» del pelaje de la mascota: el tono del escenario de cada amigo. */
export function tonoDe(perfil) {
  const { especie, paleta } = mascotaDe(perfil);
  const hex = (colorDe(especie, paleta)?.fur || "#D7A468").replace("#", "");
  const n = parseInt(hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function nombreEspecie(perfil) {
  const { especie } = mascotaDe(perfil);
  return ESPECIES.find((e) => e.id === especie)?.nombre ?? "";
}

/*
 * El escenario: la mascota de cuerpo entero sobre un pedestal de luz del color
 * de su pelaje. `tamano` es el ancho de la mascota; el alto lo pone ella.
 */
export function Escenario({ perfil, tamano = 118, animo = "quieta", titulo = null, alto = null, className = "", foco = false }) {
  const { especie, paleta, ojos, puestos } = mascotaDe(perfil);
  const tono = tonoDe(perfil);
  const h = alto ?? Math.round((tamano * 150) / 140) + 18;
  return (
    <div
      className={`amg-escenario ${className}`}
      style={{ "--tono": tono, position: "relative", height: `${h}px`, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <span aria-hidden="true" className="amg-halo" />
      <span aria-hidden="true" className={`amg-pedestal${foco ? " amg-pedestal-vivo" : ""}`} />
      <span className="amg-figura" style={{ position: "relative", display: "flex", marginBottom: "10px" }}>
        <Mascota
          especie={especie}
          paleta={paleta}
          ojos={ojos}
          puestos={puestos}
          tamano={tamano}
          encuadre="cuerpo"
          animo={animo}
          titulo={titulo}
        />
      </span>
    </div>
  );
}

/* La cara redonda (busto), para filas y sugerencias. */
export function Carita({ perfil, tamano = 44, titulo = null, enLinea = false }) {
  const { especie, paleta, ojos, puestos } = mascotaDe(perfil);
  const tono = tonoDe(perfil);
  return (
    <span
      className="amg-carita"
      style={{
        "--tono": tono,
        position: "relative", flexShrink: 0, display: "inline-flex", alignItems: "flex-end", justifyContent: "center",
        width: `${tamano}px`, height: `${tamano}px`, borderRadius: "50%",
      }}
    >
      <span style={{ display: "flex", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", alignItems: "flex-end", justifyContent: "center" }}>
        <Mascota especie={especie} paleta={paleta} ojos={ojos} puestos={puestos} tamano={Math.round(tamano * 0.92)} encuadre="busto" titulo={titulo} />
      </span>
      {enLinea && <PuntoHoy tamano={Math.max(10, Math.round(tamano * 0.24))} />}
    </span>
  );
}

/* El «en línea» de esta casa: ya estudió hoy. */
export function PuntoHoy({ tamano = 14, style = null }) {
  return (
    <span
      data-estudio-hoy
      aria-hidden="true"
      style={{
        position: "absolute", right: 0, bottom: 0, width: `${tamano}px`, height: `${tamano}px`, borderRadius: "50%",
        background: "#3DDC97", border: `2px solid ${FAE.bg}`, boxShadow: "0 0 10px rgba(61,220,151,0.75)",
        ...(style ?? {}),
      }}
    />
  );
}

export function Racha({ dias }) {
  if (!dias) return null;
  return (
    <span
      data-racha
      title={`Racha de ${dias} ${dias === 1 ? "día" : "días"}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "999px",
        background: "rgba(231,111,81,0.16)", border: "1px solid rgba(231,111,81,0.38)",
        fontSize: "11.5px", fontWeight: 700, color: "#FFC3B0", whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">🔥</span>
      {dias}
    </span>
  );
}

/*
 * El botón de la casa. El teal nunca es color de texto (no llega a 4,5:1): el
 * tono afirmativo es un RELLENO teal con texto oscuro encima (teal-no-es-texto).
 */
export function Boton({ onClick, children, tono = "neutro", etiqueta, grande = false, ancho = false, disabled = false, type = "button", className = "", style = null, ...resto }) {
  const tonos = {
    si: { color: "#06202A", border: "transparent", fondo: `linear-gradient(180deg, #3FC1B0, ${FAE.teal})`, sombra: "0 6px 18px -6px rgba(42,157,143,0.8), inset 0 1px 0 rgba(255,255,255,0.35)" },
    oro: { color: "#2A1A00", border: "transparent", fondo: "linear-gradient(180deg, #FFE08A, #E9B949)", sombra: "0 6px 20px -6px rgba(233,185,73,0.85), inset 0 1px 0 rgba(255,255,255,0.5)" },
    neutro: { color: FAE.text, border: "rgba(248,249,250,0.18)", fondo: "rgba(248,249,250,0.07)", sombra: "none" },
    suave: { color: "#A8B6C8", border: "rgba(248,249,250,0.14)", fondo: "transparent", sombra: "none" },
    peligro: { color: "#FFB4A2", border: "rgba(231,111,81,0.5)", fondo: "rgba(231,111,81,0.12)", sombra: "none" },
  };
  const c = tonos[tono] || tonos.neutro;
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      disabled={disabled}
      className={`amg-boton ${className}`}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
        minHeight: grande ? "48px" : "44px", padding: grande ? "0 20px" : "0 15px",
        width: ancho ? "100%" : undefined,
        borderRadius: "999px", border: `1px solid ${c.border}`, background: c.fondo, color: c.color, boxShadow: c.sombra,
        fontFamily: "Sora, sans-serif", fontSize: grande ? "14.5px" : "13px", fontWeight: 700,
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1, flexShrink: 0, whiteSpace: "nowrap",
        ...(style ?? {}),
      }}
      {...resto}
    >
      {children}
    </button>
  );
}

export function TituloSeccion({ children, cuenta = null, derecha = null, id }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 14px", flexWrap: "wrap" }}>
      <h2 id={id} style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "19px", letterSpacing: "-0.02em", margin: 0, color: FAE.text }}>
        {children}
      </h2>
      {cuenta != null && (
        <span style={{ padding: "2px 10px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", fontSize: "12.5px", fontWeight: 700, color: "#CBD5E1" }}>
          {cuenta}
        </span>
      )}
      {derecha && <span style={{ marginLeft: "auto" }}>{derecha}</span>}
    </div>
  );
}

export const PANEL = {
  position: "relative",
  borderRadius: "22px",
  background: "linear-gradient(180deg, rgba(248,249,250,0.07), rgba(248,249,250,0.03))",
  border: "1px solid rgba(248,249,250,0.12)",
  boxShadow: "0 18px 40px -24px rgba(0,0,0,0.6)",
};

export const ESTILO_AMIGOS = `
.amg-escenario .amg-halo { position: absolute; inset: 6% 8% 14px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(var(--tono), .34), rgba(var(--tono), .08) 65%, transparent); }
.amg-escenario .amg-pedestal { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%);
  width: 74%; height: 24px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(var(--tono), .6), rgba(var(--tono), .14) 70%, transparent);
  box-shadow: 0 0 26px rgba(var(--tono), .3); }
.amg-pedestal-vivo { animation: amg-brillo 3.6s ease-in-out infinite; }
@keyframes amg-brillo { 0%,100% { opacity: .7; } 50% { opacity: 1; } }
.amg-carita { background: radial-gradient(circle at 50% 70%, rgba(var(--tono), .5), rgba(var(--tono), .16) 70%);
  box-shadow: 0 0 0 2px rgba(var(--tono), .55), 0 6px 14px -6px rgba(0,0,0,.6); }

.amg-boton { transition: transform .15s ease, filter .15s ease; }
.amg-boton:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.08); }
.amg-boton:not(:disabled):active { transform: translateY(1px) scale(.98); }
.amg-boton:focus-visible, .amg-tocar:focus-visible, .amg-input:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }

/* La rejilla de amigos: tarjetas grandes, el nombre debajo. */
.amg-rejilla { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
@media (max-width: 640px) { .amg-rejilla { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }
.amg-carta { position: relative; display: flex; flex-direction: column; border-radius: 20px; overflow: hidden;
  background: linear-gradient(180deg, rgba(var(--tono), .16), rgba(248,249,250,0.035) 62%);
  border: 1px solid rgba(var(--tono), .3);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.amg-carta:hover { transform: translateY(-4px); border-color: rgba(var(--tono), .65);
  box-shadow: 0 18px 34px -16px rgba(var(--tono), .55); }
.amg-carta:hover .amg-figura { transform: translateY(-3px) scale(1.04); }
.amg-figura { transition: transform .25s cubic-bezier(.3,.9,.4,1); }
.amg-tocar { all: unset; cursor: pointer; display: block; border-radius: 20px 20px 0 0; }
.amg-carta .amg-escenario svg[data-mascota] { width: min(150px, 86%); height: auto; }
.amg-nombre { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.amg-nueva { border: 2px dashed rgba(248,249,250,0.22); background: rgba(248,249,250,0.03); }
.amg-nueva:hover { border-color: rgba(63,193,176,0.7); box-shadow: 0 18px 34px -16px rgba(42,157,143,.55); }

/* El encabezado: tu mascota y agregar amigos, lado a lado en escritorio. */
.amg-portada { display: grid; gap: 0; grid-template-columns: minmax(0, 1fr); overflow: hidden; }
@media (min-width: 820px) { .amg-portada { grid-template-columns: 300px minmax(0, 1fr); } }
.amg-yo { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px 18px;
  background: radial-gradient(120% 90% at 50% 0%, rgba(var(--tono), .22), transparent 70%); }
@media (max-width: 819px) {
  .amg-yo { flex-direction: row; gap: 14px; padding: 16px 16px 6px; justify-content: flex-start; background: none; }
  .amg-yo .amg-escenario { height: 112px !important; width: 96px; flex-shrink: 0; }
  .amg-yo .amg-escenario svg[data-mascota] { width: 86px; height: auto; }
  .amg-yo-texto { text-align: left !important; }
}
@media (max-width: 480px) { .amg-txt-agregar { display: none; } }
.amg-pasos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 18px; }
@media (max-width: 819px) { .amg-pasos { display: none; } }
.amg-sugerencias { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
@media (max-width: 400px) { @media (max-width: 480px) { .amg-txt-agregar { display: none; } }
.amg-pasos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 18px; }
@media (max-width: 819px) { .amg-pasos { display: none; } }
.amg-sugerencias { grid-template-columns: minmax(0, 1fr); } }

/* Las filas que se deslizan (solicitudes, esperando respuesta). */
.amg-fila { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding: 4px 2px 6px; scroll-snap-type: x proximity; }
.amg-fila::-webkit-scrollbar { display: none; }
.amg-fila > * { scroll-snap-align: start; }

/* El reto: dos mascotas frente a frente y una barra compartida. */
.amg-duelo { display: grid; grid-template-columns: 1fr minmax(0, 1.5fr) 1fr; align-items: end; gap: 6px; }
.amg-duelo .amg-escenario svg[data-mascota] { width: min(104px, 100%); height: auto; }
@media (max-width: 520px) {
  .amg-duelo .amg-escenario { height: 104px !important; }
  .amg-duelo .amg-escenario svg[data-mascota] { width: 78px; }
}
.amg-espejo .amg-figura { transform: scaleX(-1); }
.amg-barra-llena { background: linear-gradient(90deg, #3FC1B0, #6F86FF); }
.amg-barra-brillo { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  transform: translateX(-100%); animation: amg-barrido 2.8s ease-in-out infinite; }
@keyframes amg-barrido { 60%,100% { transform: translateX(100%); } }
.amg-listo { animation: amg-latido 1.6s ease-in-out infinite; }
@keyframes amg-latido { 0%,100% { box-shadow: 0 0 0 0 rgba(233,185,73,.55), 0 6px 20px -6px rgba(233,185,73,.85); } 50% { box-shadow: 0 0 0 8px rgba(233,185,73,0), 0 6px 20px -6px rgba(233,185,73,.85); } }

/* La ficha de un amigo (al tocar su tarjeta). */
.amg-velo { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 16px;
  background: rgba(6,12,22,0.72); backdrop-filter: blur(6px); animation: amg-aparece .18s ease; }
.amg-ficha { animation: amg-sube .26s cubic-bezier(.3,.9,.4,1); }
@keyframes amg-aparece { from { opacity: 0; } }
@keyframes amg-sube { from { opacity: 0; transform: translateY(18px) scale(.97); } }
@media (max-width: ${ANCHO_ESTRECHO}px) {
  .amg-velo { align-items: flex-end; padding: 0; }
  .amg-ficha { border-radius: 26px 26px 0 0 !important; width: 100% !important; max-width: none !important; }
}

/* La pastilla de la cuenta va fija arriba a la izquierda en escritorio. */
@media (min-width: ${ANCHO_ESTRECHO + 1}px) {
  .amg-cabecera { padding-left: max(0px, calc(122px - max(0px, (100vw - 1080px) / 2))); }
}

@media (prefers-reduced-motion: reduce) {
  .amg-carta, .amg-figura, .amg-boton, .amg-pedestal-vivo, .amg-barra-brillo, .amg-listo, .amg-velo, .amg-ficha { transition: none !important; animation: none !important; }
  .amg-carta:hover, .amg-carta:hover .amg-figura { transform: none; }
}
`;
