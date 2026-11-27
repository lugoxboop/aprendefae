/*
 * El armazón común de cada microvideo: planos con transiciones, subtítulos
 * grandes, crédito de la voz, la voz por tramos, música con ducking y efectos.
 * Cada video pone su tiempo (crearTiempo), sus planos, cómo se pinta cada plano
 * y su lista de efectos.
 */
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ESTILO, usePrecarga, TINTA, CREMA, MANGO } from "./base.jsx";
import { FPS, clamp01, rampa, sale } from "./tiempo.js";

export const T_BARRIDO = 0.36, T_FUNDIDO = 0.7;

function Planos({ t, planos, pinta }) {
  let k = 0;
  planos.forEach((p, i) => { if (t >= p.desde) k = i; });
  const act = planos[k], ant = planos[k - 1];
  const dur = act.entra === "fundido" ? T_FUNDIDO : act.entra === "destello" ? 0.3 : act.entra === "corte" ? 0.001 : T_BARRIDO;
  const p = ant ? clamp01((t - act.desde) / dur) : 1;
  if (p >= 1) return pinta(act, t);
  if (act.entra === "barrido" || act.entra === "barrido-izq") {
    const d = act.entra === "barrido" ? 1 : -1;
    const e = p * p * (3 - 2 * p);
    const desen = Math.sin(p * Math.PI) * 26;
    return (
      <AbsoluteFill style={{ background: TINTA }}>
        <AbsoluteFill style={{ transform: `translateX(${-d * e * 1080}px)`, filter: `blur(${desen}px)` }}>{pinta(ant, t)}</AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${d * (1 - e) * 1080}px)`, filter: `blur(${desen}px)` }}>{pinta(act, t)}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (act.entra === "fundido") {
    return (<AbsoluteFill>{pinta(ant, t)}<AbsoluteFill style={{ opacity: p }}>{pinta(act, t)}</AbsoluteFill></AbsoluteFill>);
  }
  if (act.entra === "zoom") {
    /* el plano nuevo entra creciendo desde el centro */
    const e = sale(p);
    return (<AbsoluteFill>{pinta(ant, t)}<AbsoluteFill style={{ opacity: Math.min(1, p * 2.5), transform: `scale(${0.6 + 0.4 * e})` }}>{pinta(act, t)}</AbsoluteFill></AbsoluteFill>);
  }
  return (<AbsoluteFill>{pinta(act, t)}<AbsoluteFill style={{ background: CREMA, opacity: 1 - p }} /></AbsoluteFill>);
}

function Subtitulos({ t, T, clave, sinResaltar = [] }) {
  const s = T.SUBS.find((o) => t >= o.ini - 0.06 && t < o.hasta);
  if (!s) return null;
  const p = rampa(t, s.ini - 0.06, 0.16);
  const resalta = !sinResaltar.includes(s.i);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1560, height: 230, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        maxWidth: 980, textAlign: "center", fontFamily: "Inter", fontWeight: 800, fontSize: 60, lineHeight: 1.2, color: "#fff",
        background: "rgba(28,20,15,.84)", borderRadius: 26, padding: "18px 34px 22px", textWrap: "balance",
        transform: `translateY(${(1 - sale(p)) * 18}px) scale(${0.96 + 0.04 * sale(p)})`, opacity: Math.min(1, p * 1.5),
        boxShadow: "0 8px 0 rgba(28,20,15,.25)",
      }}>
        {s.txt.split(" ").map((w, i) => (
          <span key={i} style={{ color: resalta && clave && clave.test(w) ? MANGO : "#fff" }}>{w} </span>
        ))}
      </div>
    </div>
  );
}

function Credito({ t, desde }) {
  const p = rampa(t, desde, 0.5);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1822, display: "flex", justifyContent: "center", opacity: p }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 34, color: "#fff", background: "rgba(28,20,15,.72)", borderRadius: 999, padding: "8px 26px" }}>Voz: elevenlabs.io</div>
    </div>
  );
}

function volumenMusica(t, T) {
  let habla = 0;
  T.TRAMOS.forEach((tr) => { habla = Math.max(habla, Math.min(clamp01((t - tr.habla + 0.3) / 0.3), clamp01((tr.calla + 0.35 - t) / 0.35))); });
  const base = 0.5 - 0.36 * habla;
  return base * clamp01(t / 0.6) * clamp01((T.DURACION_S - t) / 1.4);
}

/*
 * Pistas por separado (--props='{"pista":"fx"}'): «fx» saca solo los efectos, «musica» solo
 * la música y «voz» solo la narración ya repartida en sus tramos. La mezcla final (voz, música variada y efectos por debajo de la voz) la hace
 * sonido/mezcla.py con esas pistas; ver sonido/README.md.
 */
const PISTA = (() => { try { return getInputProps().pista || "todo"; } catch { return "todo"; } })();

export function VideoMicro({ T, planos, pinta, sfx, clave, arte = [], audio, musica = "musica", sinSonido = false, encima = null, sinResaltar }) {
  usePrecarga(arte);
  const conVoz = PISTA === "todo" || PISTA === "voz", conMusica = PISTA === "todo" || PISTA === "musica", conFx = PISTA === "todo" || PISTA === "fx";
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: TINTA, overflow: "hidden" }}>
      <style>{ESTILO}</style>
      <Planos t={t} planos={planos} pinta={pinta} />
      {encima && encima(t)}
      <Subtitulos t={t} T={T} clave={clave} sinResaltar={sinResaltar} />
      <Credito t={t} desde={T.S(T.N) + 0.2} />
      {!sinSonido && conVoz && audio && T.TRAMOS.map((tr, i) => (
        <Sequence key={i} from={Math.round(tr.v * FPS)} durationInFrames={Math.max(1, Math.round((tr.a1 - tr.a0) * FPS))}>
          <Audio src={staticFile(audio)} startFrom={Math.round(tr.a0 * FPS)} />
        </Sequence>
      ))}
      {!sinSonido && conMusica && <Audio src={staticFile(`sfx/${musica}.wav`)} volume={(f) => volumenMusica(f / FPS, T)} />}
      {!sinSonido && conFx && sfx.map((s, i) => (
        <Sequence key={"fx" + i} from={Math.max(0, Math.round(s.t * FPS))}>
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

/* lista de efectos: fx(t, nombre, volumen) */
export function hazSfx() { const L = []; const fx = (t, f, vol = 0.55) => L.push({ t, f, vol }); return [L, fx]; }

/* cámara por movimientos: {a, b, s, x, y}; antes de a se queda donde estaba */
export function mover(t, inicio, movs) {
  let est = inicio;
  for (const m of movs) {
    if (t >= m.b) est = m;
    else if (t > m.a) {
      const p = (t - m.a) / (m.b - m.a); const q = p * p * (3 - 2 * p);
      return { s: est.s + (m.s - est.s) * q, x: est.x + (m.x - est.x) * q, y: est.y + (m.y - est.y) * q };
    } else break;
  }
  return est;
}
