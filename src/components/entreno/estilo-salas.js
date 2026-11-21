import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTILO DE LAS SALAS DE ENTRENAMIENTO (clases sal-*).
 *
 * La idea: el lobby de un juego. Una «arena» de noche con dos focos que
 * barren, un piso de rejilla en perspectiva y, de pie sobre él, las mascotas
 * de los que ya entraron, cada una con su placa de nombre y su «LISTO». Los
 * que faltan son siluetas punteadas. Entrar a la sala es CAER en la arena.
 *
 * Movimiento: solo transform y opacity; con «reducir movimiento» todo queda
 * quieto y en su sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ORO = "#E9B949";
export const VERDE = "#3DDC97";

export const CSS_SALAS = `
.sal, .sal * { box-sizing: border-box; }
.sal-marco { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto;
  padding: clamp(16px, 3vh, 28px) clamp(16px, 3vw, 28px) 120px; display: flex; flex-direction: column; gap: 18px; }
@media (max-width: 360px) { .sal-largo { display: none; } }
.sal-h1 { margin: 0; font-family: Sora, sans-serif; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; color: ${FAE.text}; text-wrap: balance; }
.sal-cejilla { font-family: Sora, sans-serif; font-size: 11.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #9FB4FF; }
.sal-nota { margin: 0; font-size: 14px; line-height: 1.5; color: rgba(248,249,250,0.7); }

/* ── La arena ─────────────────────────────────────────────────────────── */
.sal-arena { position: relative; isolation: isolate; overflow: hidden; border-radius: 28px; min-height: 330px;
  padding: 26px clamp(10px, 3vw, 28px) 34px;
  background:
    radial-gradient(90% 60% at 50% 0%, rgba(111,134,255,.40), transparent 62%),
    radial-gradient(60% 40% at 50% 100%, rgba(42,157,143,.35), transparent 70%),
    linear-gradient(180deg, #1C2B5C 0%, #142449 45%, #0E1B2E 100%);
  border: 1px solid rgba(159,180,255,.22);
  box-shadow: 0 30px 60px -30px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.08); }
.sal-arena::before { content: ""; position: absolute; inset: 0; z-index: -2; opacity: .55;
  background-image:
    radial-gradient(1.5px 1.5px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 28% 8%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 46% 22%, #fff, transparent), radial-gradient(1px 1px at 63% 12%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 81% 20%, #fff, transparent), radial-gradient(1px 1px at 92% 6%, #fff, transparent),
    radial-gradient(1px 1px at 6% 34%, #fff, transparent), radial-gradient(1px 1px at 72% 32%, #fff, transparent); }
.sal-piso { position: absolute; left: -30%; right: -30%; bottom: -8px; height: 46%; z-index: -1;
  transform: perspective(380px) rotateX(62deg); transform-origin: 50% 100%;
  background:
    repeating-linear-gradient(90deg, rgba(63,193,176,.38) 0 1px, transparent 1px 54px),
    repeating-linear-gradient(0deg, rgba(63,193,176,.38) 0 1px, transparent 1px 54px);
  -webkit-mask-image: linear-gradient(0deg, #000 30%, transparent 100%); mask-image: linear-gradient(0deg, #000 30%, transparent 100%); }
.sal-foco { position: absolute; top: -40%; width: 46%; height: 150%; z-index: -1; opacity: .5; pointer-events: none;
  background: conic-gradient(from 180deg at 50% 0%, transparent 168deg, rgba(200,214,255,.22) 180deg, transparent 192deg);
  transform-origin: 50% 0%; }
.sal-foco--i { left: 2%; animation: sal-barre 7s ease-in-out infinite; }
.sal-foco--d { right: 2%; animation: sal-barre 7s ease-in-out -3.5s infinite reverse; }
@keyframes sal-barre { 0%,100% { transform: rotate(-14deg); } 50% { transform: rotate(14deg); } }

.sal-puestos { position: relative; display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-end; gap: 6px clamp(4px, 1.6vw, 16px); }
.sal-puesto { position: relative; width: 124px; display: flex; flex-direction: column; align-items: center; }
.sal-puesto .amg-escenario svg[data-mascota] { width: 104px; height: auto; }
@media (max-width: 520px) {
  .sal-puesto { width: calc((100% - 16px) / 3); max-width: 112px; }
  .sal-puesto .amg-escenario { height: 108px !important; }
  .sal-puesto .amg-escenario svg[data-mascota] { width: 82px; }
}
.sal-cae { animation: sal-cae .7s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes sal-cae { 0% { opacity: 0; transform: translateY(-60px) scale(.9); } 60% { opacity: 1; } 100% { transform: none; } }
.sal-placa { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; margin-top: -4px; padding: 4px 10px; border-radius: 10px;
  background: rgba(6,12,22,.72); border: 1px solid rgba(var(--tono), .55); box-shadow: 0 4px 14px -6px rgba(0,0,0,.8);
  font-family: Sora, sans-serif; font-size: 12.5px; font-weight: 800; color: ${FAE.text}; }
.sal-placa > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.sal-placa[data-yo] { background: linear-gradient(180deg, rgba(var(--tono), .55), rgba(var(--tono), .3)); }
.sal-estado { margin-top: 6px; display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 999px;
  font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.sal-estado--listo { background: rgba(61,220,151,.16); border: 1px solid rgba(61,220,151,.5); color: #B9F5D8; }
.sal-estado--espera { background: rgba(248,249,250,.07); border: 1px solid rgba(248,249,250,.16); color: rgba(248,249,250,.62); }
.sal-corona { position: absolute; top: 2px; left: 50%; transform: translateX(-50%); z-index: 2; display: inline-flex;
  filter: drop-shadow(0 2px 6px rgba(233,185,73,.8)); }
.sal-demo { position: absolute; top: 6px; right: 6px; z-index: 2; padding: 1px 6px; border-radius: 6px; font-size: 9.5px; font-weight: 800;
  letter-spacing: .06em; text-transform: uppercase; background: rgba(6,12,22,.6); color: rgba(248,249,250,.6); border: 1px solid rgba(248,249,250,.15); }

.sal-hueco { height: 130px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; padding-bottom: 10px; }
.sal-silueta { width: 70px; height: 84px; border-radius: 36px 36px 18px 18px; border: 2px dashed rgba(248,249,250,.25);
  display: flex; align-items: center; justify-content: center; color: rgba(248,249,250,.45); background: rgba(248,249,250,.03); }
button.sal-hueco { all: unset; box-sizing: border-box; cursor: pointer; height: 130px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; padding-bottom: 10px; border-radius: 18px; }
button.sal-hueco:hover .sal-silueta { border-color: rgba(63,193,176,.8); color: #9FE8DC; }
button.sal-hueco:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
@media (max-width: 520px) { .sal-hueco, button.sal-hueco { height: 112px; } .sal-silueta { width: 58px; height: 70px; } }
.sal-fantasma { opacity: .45; filter: grayscale(.7); }
.sal-latido { animation: sal-latido 1.8s ease-in-out infinite; }
@keyframes sal-latido { 0%,100% { opacity: .5; } 50% { opacity: 1; } }

/* ── Tarjetas, chips y barra de acción ────────────────────────────────── */
.sal-panel { position: relative; border-radius: 22px; padding: 16px clamp(14px, 3vw, 22px);
  background: linear-gradient(180deg, rgba(248,249,250,0.07), rgba(248,249,250,0.03)); border: 1px solid rgba(248,249,250,0.12); }
.sal-codigo { display: inline-flex; align-items: center; gap: 10px; padding: 6px 6px 6px 14px; border-radius: 16px;
  background: rgba(6,12,22,.45); border: 1px solid rgba(248,249,250,.16); }
.sal-codigo b { font-family: Sora, sans-serif; font-size: 22px; letter-spacing: .14em; font-variant-numeric: tabular-nums; color: ${FAE.text}; }
.sal-barra { position: sticky; bottom: 0; z-index: 5; margin: 0 calc(-1 * clamp(16px, 3vw, 28px)); padding: 12px clamp(16px, 3vw, 28px) calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  background: linear-gradient(180deg, transparent, rgba(11,22,38,.92) 30%); }
.sal-barra > .sal-principal { flex: 1 1 220px !important; }
@media (max-width: 520px) {
  .sal-barra { flex-wrap: nowrap; gap: 8px; background: linear-gradient(180deg, rgba(11,22,38,0), rgba(11,22,38,.96) 22%); }
  .sal-barra > .sal-principal { flex: 1 1 auto !important; min-width: 0; padding: 6px 14px !important; white-space: normal !important; line-height: 1.2; text-align: center; }
  .sal-barra .sal-txt { display: none; }
  .sal-barra > .amg-boton:not(.sal-principal) { width: 48px; padding: 0 !important; }
}
[data-sal-fase=final] > *:not(.sal-confeti):not(.sal-barra) { position: relative; z-index: 4; }
.sal-brilla { animation: sal-brilla 2s ease-in-out infinite; }
@keyframes sal-brilla { 0%,100% { box-shadow: 0 0 0 0 rgba(233,185,73,.55), 0 8px 24px -8px rgba(233,185,73,.9); } 50% { box-shadow: 0 0 0 10px rgba(233,185,73,0), 0 8px 24px -8px rgba(233,185,73,.9); } }

.sal-materias { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.sal-materias .sal-opcion-tg { min-width: 0; }
@media (max-width: 360px) { .sal-materias .sal-opcion-tg { font-size: 13px; padding: 10px; gap: 6px; } }
.sal-opcion-tg { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 10px 14px; border-radius: 16px;
  background: rgba(248,249,250,.05); border: 1px solid rgba(248,249,250,.14); color: ${FAE.text}; font-family: Sora, sans-serif; font-weight: 700; font-size: 14px;
  transition: transform .15s ease, border-color .15s ease, background .15s ease; }
.sal-opcion-tg[aria-pressed="true"] { background: rgba(63,193,176,.16); border-color: #3FC1B0; box-shadow: inset 0 0 0 1px #3FC1B0; }
.sal-opcion-tg:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
.sal-opcion-tg:active { transform: scale(.98); }
.sal-temas { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }
.sal-temas .sal-opcion-tg { flex-direction: column; align-items: flex-start; gap: 2px; min-height: 64px; }
.sal-temas .sal-opcion-tg small { font-family: Inter, sans-serif; font-weight: 500; font-size: 12px; color: rgba(248,249,250,.6); }
.sal-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.sal-chips .sal-opcion-tg { min-height: 44px; padding: 0 16px; border-radius: 999px; justify-content: center; }

.sal-invitar { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); }
.sal-amigo { all: unset; box-sizing: border-box; cursor: pointer; position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 10px 6px 8px; border-radius: 16px; border: 1px solid rgba(248,249,250,.12); background: rgba(248,249,250,.04);
  transition: transform .15s ease, border-color .15s ease, background .15s ease; }
.sal-amigo[aria-pressed="true"] { border-color: #3FC1B0; background: rgba(63,193,176,.14); }
.sal-amigo:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
.sal-amigo:active { transform: scale(.97); }
.sal-amigo > b { font-family: Sora, sans-serif; font-size: 12px; font-weight: 700; color: ${FAE.text}; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sal-check { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: #3FC1B0; color: #06202A; }

/* ── La partida ───────────────────────────────────────────────────────── */
.sal-tira { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 2px 2px 4px; }
.sal-tira::-webkit-scrollbar { display: none; }
.sal-ficha-j { position: relative; flex: none; display: flex; flex-direction: column; align-items: center; gap: 3px; width: 56px; }
.sal-ficha-j > small { font-size: 10.5px; font-weight: 700; color: rgba(248,249,250,.7); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sal-ficha-j[data-respondio="si"] .amg-carita { box-shadow: 0 0 0 2px ${VERDE}, 0 0 14px rgba(61,220,151,.5); }
.sal-ok { position: absolute; top: 30px; right: 4px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: 2px solid ${FAE.bg}; }

.sal-velo { position: fixed; inset: 0; z-index: 80; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 20px;
  background: radial-gradient(60% 50% at 50% 45%, rgba(111,134,255,.35), rgba(6,12,22,.94)); text-align: center; }
.sal-numero { font-family: Sora, sans-serif; font-weight: 800; font-size: clamp(110px, 28vw, 190px); line-height: 1; color: ${FAE.text};
  text-shadow: 0 0 40px rgba(159,180,255,.8); animation: sal-numero .9s cubic-bezier(.3,1.4,.5,1) both; }
@keyframes sal-numero { 0% { opacity: 0; transform: scale(2.2); } 40% { opacity: 1; transform: scale(.92); } 100% { transform: none; } }

.sal-fila-t { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 14px; background: rgba(248,249,250,.05); border: 1px solid rgba(248,249,250,.1); }
.sal-fila-t[data-yo] { background: rgba(111,134,255,.14); border-color: rgba(111,134,255,.45); }
.sal-fila-t .sal-pos { flex: none; width: 26px; text-align: center; font-family: Sora, sans-serif; font-weight: 800; font-size: 15px; color: rgba(248,249,250,.75); }
.sal-fila-t .sal-nom { flex: 1; min-width: 0; font-family: Sora, sans-serif; font-weight: 700; font-size: 14px; color: ${FAE.text}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sal-fila-t .sal-pts { flex: none; font-family: Sora, sans-serif; font-weight: 800; font-size: 15px; font-variant-numeric: tabular-nums; color: ${FAE.text}; }
.sal-cuenta { height: 6px; border-radius: 999px; background: rgba(248,249,250,.1); overflow: hidden; }
.sal-cuenta > span { display: block; height: 100%; background: linear-gradient(90deg, #3FC1B0, #6F86FF); transform-origin: left center; transition: transform .25s linear; }

/* ── El podio ─────────────────────────────────────────────────────────── */
.sal-podio { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: end; gap: clamp(4px, 2vw, 18px); max-width: 560px; margin: 0 auto; width: 100%; }
.sal-podio .amg-escenario svg[data-mascota] { width: min(118px, 92%); height: auto; }
.sal-bloque { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 2px; padding-top: 10px; border-radius: 16px 16px 6px 6px;
  font-family: Sora, sans-serif; color: #0B1626; }
.sal-bloque b { font-size: 30px; font-weight: 800; line-height: 1; }
.sal-bloque small { font-size: 12px; font-weight: 700; opacity: .8; }
.sal-sube { animation: sal-sube .8s cubic-bezier(.3,1.2,.5,1) both; transform-origin: 50% 100%; }
@keyframes sal-sube { from { transform: scaleY(0); } to { transform: none; } }
.sal-confeti { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; opacity: .85; }
.sal-confeti i { position: absolute; top: -20px; width: 9px; height: 14px; border-radius: 2px; animation: sal-cae-confeti linear infinite; }
@keyframes sal-cae-confeti { to { transform: translateY(110vh) rotate(720deg); } }

/* ── Los emotes (0173) ────────────────────────────────────────────────── */
.sal-burbuja { position: absolute; top: -4px; left: 50%; z-index: 3; display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; margin-left: 8px; border-radius: 50% 50% 50% 8px; font-size: 22px; line-height: 1;
  background: rgba(248,249,250,.96); box-shadow: 0 6px 16px -6px rgba(0,0,0,.7); }
.sal-emotes-caja { flex: none; }
/* Anclada a la barra (sticky = contexto de posición), no al botón: así nunca se sale por la izquierda. */
.sal-emotes { position: absolute; right: clamp(16px, 3vw, 28px); bottom: calc(100% - 4px); z-index: 20; width: min(340px, calc(100vw - 32px));
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; padding: 12px;
  border-radius: 20px; background: #13233A; border: 1px solid rgba(159,180,255,.35); box-shadow: 0 24px 48px -16px rgba(0,0,0,.85);
  transform-origin: bottom right; }
.sal-emote { all: unset; box-sizing: border-box; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  min-height: 64px; padding: 6px 2px; border-radius: 14px; background: rgba(248,249,250,.05); border: 1px solid rgba(248,249,250,.1); }
.sal-emote > span { font-size: 26px; line-height: 1; }
.sal-emote > small { font-size: 11px; font-weight: 700; color: rgba(248,249,250,.75); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sal-emote:hover, .sal-emote[aria-pressed="true"] { background: rgba(111,134,255,.2); border-color: rgba(159,180,255,.55); }
.sal-emote:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
@media (prefers-reduced-motion: no-preference) {
  .sal-burbuja { animation: sal-burbuja 5s cubic-bezier(.3,1.4,.5,1) both; }
  .sal-emotes { animation: sal-bandeja .18s ease-out both; }
  .sal-emote { transition: transform .12s ease, background .12s ease; }
  .sal-emote:active { transform: scale(.94); }
}
@keyframes sal-burbuja { 0% { opacity: 0; transform: translateY(8px) scale(.4); } 8% { opacity: 1; transform: none; } 88% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-6px) scale(.9); } }
@keyframes sal-bandeja { from { opacity: 0; transform: scale(.85); } }

@media (prefers-reduced-motion: reduce) {
  .sal-foco, .sal-cae, .sal-latido, .sal-brilla, .sal-numero, .sal-sube, .sal-confeti i { animation: none !important; }
  .sal-confeti { display: none; }
  .sal-opcion-tg, .sal-amigo, .sal-cuenta > span { transition: none !important; }
}
`;
