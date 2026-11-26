/*
 * Armazón de un Reel de Instagram (Nino). Parte del VideoMicro de Jane, con tres cambios
 * para redes: subtítulos de 1 a 4 palabras con la palabra que suena en mango (Sora 800,
 * borde de tinta) DENTRO de la zona segura; sin crédito de voz (plan Creator, uso
 * comercial); y una plantilla de zonas seguras que se enciende con la prop `zonas`.
 * Zonas de Instagram en 1080×1920: 250 px arriba, 420 abajo, 140 a la derecha.
 */
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ESTILO, usePrecarga, TINTA, CREMA, MANGO } from "./base.jsx";
import { FPS, clamp01, rampa, sale } from "./tiempo.js";

export const ZONA = { arriba: 250, abajo: 1920 - 420, der: 1080 - 140, izq: 60 };
const T_BARRIDO = 0.34;

function Planos({ t, planos, pinta }) {
  let k = 0;
  planos.forEach((p, i) => { if (t >= p.desde) k = i; });
  const act = planos[k], ant = planos[k - 1];
  const dur = act.entra === "corte" ? 0.001 : act.entra === "zoom" ? 0.42 : T_BARRIDO;
  const p = ant ? clamp01((t - act.desde) / dur) : 1;
  if (p >= 1) return pinta(act, t);
  if (act.entra === "zoom") {
    const e = sale(p);
    return (<AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.5 * e})`, filter: `blur(${e * 14}px)` }}>{pinta(ant, t)}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: Math.min(1, p * 2.2), transform: `scale(${0.7 + 0.3 * e})` }}>{pinta(act, t)}</AbsoluteFill>
    </AbsoluteFill>);
  }
  const d = act.entra === "barrido-izq" ? -1 : 1;
  const e = p * p * (3 - 2 * p), desen = Math.sin(p * Math.PI) * 24;
  return (
    <AbsoluteFill style={{ background: TINTA }}>
      <AbsoluteFill style={{ transform: `translateX(${-d * e * 1080}px)`, filter: `blur(${desen}px)` }}>{pinta(ant, t)}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${d * (1 - e) * 1080}px)`, filter: `blur(${desen}px)` }}>{pinta(act, t)}</AbsoluteFill>
    </AbsoluteFill>
  );
}

/* Trozos de 1 a 4 palabras, cortando en la puntuación; cada palabra con su tiempo. */
export function trozosSub(T, max = 4) {
  const L = [];
  T.ESC.forEach((e, idx) => {
    const tr = T.TRAMOS[idx];
    let cur = [];
    const cierra = () => { if (cur.length) L.push(cur); cur = []; };
    e.palabras.forEach((p) => {
      cur.push({ w: p.w, ini: tr.v + (p.ini - tr.a0) / T.RITMO, fin: tr.v + (p.fin - tr.a0) / T.RITMO });
      if (cur.length >= max || /[.,:;?!…]$/.test(p.w)) cierra();
    });
    cierra();
  });
  return L.map((ws, i) => ({ ws, ini: ws[0].ini, hasta: L[i + 1] && L[i + 1][0].ini - ws.at(-1).fin < 0.7 ? L[i + 1][0].ini : ws.at(-1).fin + 0.45 }));
}

function Subtitulos({ t, subs, y = 1300 }) {
  const s = subs.find((o) => t >= o.ini - 0.05 && t < o.hasta);
  if (!s) return null;
  const p = sale(rampa(t, s.ini - 0.05, 0.14));
  return (
    <div style={{ position: "absolute", left: ZONA.izq, width: ZONA.der - ZONA.izq, top: y - 110, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 82, lineHeight: 1.08, letterSpacing: "-0.01em",
        color: "#fff", WebkitTextStroke: `14px ${TINTA}`, wordSpacing: "0.1em", paintOrder: "stroke fill", textWrap: "balance",
        transform: `scale(${0.86 + 0.14 * p}) translateY(${(1 - p) * 20}px)`, opacity: Math.min(1, p * 1.6),
        filter: "drop-shadow(0 8px 0 rgba(20,14,10,.35))",
      }}>
        {s.ws.map((w, i) => {
          const suena = t >= w.ini - 0.03 && t < w.fin + 0.08;
          return <span key={i} style={{ color: suena ? MANGO : "#fff", display: "inline-block", transform: `scale(${suena ? 1.07 : 1})` }}>{w.w}{i < s.ws.length - 1 ? " " : ""} </span>;
        })}
      </div>
    </div>
  );
}

/* Plantilla de zonas seguras (solo para revisar; nunca sale en el render final). */
const Zonas = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: ZONA.arriba, background: "rgba(255,0,80,.28)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: ZONA.abajo, bottom: 0, background: "rgba(255,0,80,.28)" }} />
    <div style={{ position: "absolute", left: ZONA.der, right: 0, top: ZONA.arriba, bottom: 420, background: "rgba(255,0,80,.18)" }} />
  </AbsoluteFill>
);

function volumenMusica(t, T, base, baja) {
  let habla = 0;
  T.TRAMOS.forEach((tr) => { habla = Math.max(habla, Math.min(clamp01((t - tr.habla + 0.3) / 0.3), clamp01((tr.calla + 0.35 - t) / 0.35))); });
  return (base - baja * habla) * clamp01(t / 0.15) * clamp01((T.DURACION_S - t) / 1.2);
}

export function Reel({ T, planos, pinta, sfx, arte = [], musica, musicaBase = 0.55, musicaBaja = 0.38, sinSonido = false, zonas = false, encima = null, subY }) {
  usePrecarga(arte);
  const t = useCurrentFrame() / FPS;
  const subs = trozosSub(T);
  return (
    <AbsoluteFill style={{ background: TINTA, overflow: "hidden" }}>
      <style>{ESTILO}</style>
      <Planos t={t} planos={planos} pinta={pinta} />
      {encima && encima(t)}
      <Subtitulos t={t} subs={subs} y={subY} />
      {zonas && <Zonas />}
      {!sinSonido && T.TRAMOS.map((tr, i) => (
        <Sequence key={i} from={Math.round(tr.v * FPS)} durationInFrames={Math.max(1, Math.round(((tr.a1 - tr.a0) / T.RITMO) * FPS))}>
          <Audio src={staticFile(T.AUDIO)} trimBefore={Math.round(tr.a0 * FPS)} playbackRate={T.RITMO} />
        </Sequence>
      ))}
      {!sinSonido && musica && <Audio src={staticFile(`sfx/${musica}.wav`)} volume={(f) => volumenMusica(f / FPS, T, musicaBase, musicaBaja)} />}
      {!sinSonido && sfx.map((s, i) => (
        <Sequence key={"fx" + i} from={Math.max(0, Math.round(s.t * FPS))}>
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
export { CREMA };
