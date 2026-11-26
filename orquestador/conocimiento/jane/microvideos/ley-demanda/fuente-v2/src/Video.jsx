/*
 * «El mango de Toby» — la ley de la demanda (Jane, estándar de video v2).
 * Una idea: si el precio sube, baja la cantidad demandada (si todo lo demás
 * sigue igual), y eso es moverse SOBRE la curva, no mover la curva.
 * Datos: 5, 3, 1 y 4 mangos a $1.000, $2.000, $3.000 y $1.500 (P = 3.500 − 500·Q).
 * Todo va por cuadro (useCurrentFrame); la voz manda los tiempos (tiempos.json).
 */
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ESTILO, usePrecarga, TINTA, CREMA, MANGO } from "./base.jsx";
import { Gancho, Calle, Puesto, PizarraGrande } from "./Escenas.jsx";
import { FPS, TRAMOS, SUBS, AUDIO, DURACION_S, clamp01, rampa, rebote, sale } from "./tiempo.js";
import { PLANOS, T_BARRIDO, FUNDIDO, ROTULOS, ROTULO_FIN, SFX, M } from "./guion.js";

const ARTE = ["art/calle.jpg", "art/calle-blur.jpg", "art/puesto.jpg", "art/puesto-frente.png", "art/canasta.png", "art/mango.png",
  "art/jugo-vaso.png", "art/monedas.png", "art/camion-vacio.png", "art/camion-lleno.png"];

function Plano({ p, t }) {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "calle") return <Calle t={t} n={p.n} />;
  if (p.tipo === "puesto") return <Puesto t={t} />;
  return <PizarraGrande t={t} />;
}

/* Los planos y sus transiciones: barrido (paneo rápido), destello y fundido */
function Planos({ t }) {
  let k = 0;
  PLANOS.forEach((p, i) => { if (t >= p.desde) k = i; });
  const act = PLANOS[k], ant = PLANOS[k - 1];
  const dur = act.entra === "fundido" ? FUNDIDO : act.entra === "destello" ? 0.3 : T_BARRIDO;
  const p = ant ? clamp01((t - act.desde) / dur) : 1;
  if (p >= 1) return <Plano p={act} t={t} />;
  if (act.entra === "barrido") {
    const e = p * p * (3 - 2 * p);
    const desen = Math.sin(p * Math.PI) * 26;
    return (
      <AbsoluteFill style={{ background: TINTA }}>
        <AbsoluteFill style={{ transform: `translateX(${-e * 1080}px)`, filter: `blur(${desen}px)` }}><Plano p={ant} t={t} /></AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${(1 - e) * 1080}px)`, filter: `blur(${desen}px)` }}><Plano p={act} t={t} /></AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (act.entra === "fundido") {
    return (
      <AbsoluteFill>
        <Plano p={ant} t={t} />
        <AbsoluteFill style={{ opacity: p }}><Plano p={act} t={t} /></AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Plano p={act} t={t} />
      <AbsoluteFill style={{ background: CREMA, opacity: 1 - p }} />
    </AbsoluteFill>
  );
}

/* Rótulo del día, como hoja de calendario */
function Rotulo({ t }) {
  let k = -1;
  ROTULOS.forEach((r, i) => { if (t >= r.t) k = i; });
  if (k < 0) return null;
  const r = ROTULOS[k];
  const fuera = rampa(t, ROTULO_FIN, 0.4);
  if (fuera >= 1) return null;
  const p = rampa(t, r.t, 0.4);
  return (
    <div style={{
      position: "absolute", left: 44, top: 150, transformOrigin: "0% 0%", opacity: 1 - fuera,
      transform: `translateY(${-fuera * 80}px) scale(${rebote(p)}) rotate(${-4 + 8 * (1 - sale(p))}deg)`,
    }}>
      <div style={{ background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 9px 0 rgba(42,30,23,.3)" }}>
        <div style={{ background: "#E5484D", height: 30, borderBottom: `6px solid ${TINTA}` }} />
        <div style={{ padding: "6px 34px 12px", fontFamily: "Sora", fontWeight: 800, fontSize: 70, color: TINTA, letterSpacing: "-0.02em" }}>{r.txt}</div>
      </div>
    </div>
  );
}

/* Subtítulos grandes, con las cifras y el concepto resaltados */
const CLAVE = /^(uno|cinco|tres|cuatro|mil|dos|quinientos|pesos|ley|demanda|sube|baja|sobre)[.,:?…]*$/i;
function Subtitulos({ t }) {
  const s = SUBS.find((o) => t >= o.ini - 0.06 && t < o.hasta);
  if (!s) return null;
  const p = rampa(t, s.ini - 0.06, 0.16);
  const resalta = [3, 4, 5, 6, 7, 8, 9, 12, 13, 14].includes(s.i);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1560, height: 230, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        maxWidth: 980, textAlign: "center", fontFamily: "Inter", fontWeight: 800, fontSize: 60, lineHeight: 1.2, color: "#fff",
        background: "rgba(28,20,15,.84)", borderRadius: 26, padding: "18px 34px 22px", textWrap: "balance",
        transform: `translateY(${(1 - sale(p)) * 18}px) scale(${0.96 + 0.04 * sale(p)})`, opacity: Math.min(1, p * 1.5),
        boxShadow: "0 8px 0 rgba(28,20,15,.25)",
      }}>
        {s.txt.split(" ").map((w, i) => (
          <span key={i} style={{ color: resalta && CLAVE.test(w) ? MANGO : "#fff" }}>{w} </span>
        ))}
      </div>
    </div>
  );
}

function Credito({ t }) {
  const p = rampa(t, M.credito, 0.5);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1822, display: "flex", justifyContent: "center", opacity: p }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 34, color: "#fff", background: "rgba(28,20,15,.72)", borderRadius: 999, padding: "8px 26px" }}>Voz: elevenlabs.io</div>
    </div>
  );
}

/* la música baja cuando habla el narrador */
function volumenMusica(t) {
  let habla = 0;
  TRAMOS.forEach((tr) => { habla = Math.max(habla, Math.min(clamp01((t - tr.habla + 0.3) / 0.3), clamp01((tr.calla + 0.35 - t) / 0.35))); });
  const base = 0.5 - 0.36 * habla;
  return base * clamp01(t / 0.6) * clamp01((DURACION_S - t) / 1.4);
}

export const ElMangoDeToby = ({ sinSonido = false }) => {
  usePrecarga(ARTE);
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: TINTA, overflow: "hidden" }}>
      <style>{ESTILO}</style>
      <Planos t={t} />
      <Rotulo t={t} />
      <Subtitulos t={t} />
      <Credito t={t} />
      {!sinSonido && AUDIO && TRAMOS.map((tr, i) => (
        <Sequence key={i} from={Math.round(tr.v * FPS)} durationInFrames={Math.round((tr.a1 - tr.a0) * FPS)}>
          <Audio src={staticFile("audio/" + AUDIO)} startFrom={Math.round(tr.a0 * FPS)} />
        </Sequence>
      ))}
      {!sinSonido && <Audio src={staticFile("sfx/musica.wav")} volume={(f) => volumenMusica(f / FPS)} />}
      {!sinSonido && SFX.map((s, i) => (
        <Sequence key={"fx" + i} from={Math.max(0, Math.round(s.t * FPS))}>
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
