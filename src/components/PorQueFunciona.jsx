import { useEffect, useRef } from "react";

/*
 * «¿Por qué funciona?» — la sección de evidencia del hub (orden de Mateo,
 * 5-nov). Vive DEBAJO de la portada centrada: quien entra ve primero la
 * marca y las materias; quien baja encuentra la prueba de que la plataforma
 * mueve la nota. Es aditiva y reversible: un componente aparte, un import y
 * una línea en HomeScreen. No toca ninguna materia ni dato de estudiante.
 *
 * Las cuatro medias son datos MEDIDOS de la plataforma (un semestre, 46
 * estudiantes), no estimaciones. «Uso sostenido» = 40+ actividades
 * completadas y cuenta activa al cierre. El 3,0 es la nota mínima de
 * aprobación. El gráfico se arma solo cuando la sección entra en pantalla;
 * «Ver otra vez» lo repite (útil al mostrarlo en vivo).
 */

const GRUPOS = [
  { nota: 2.41, titulo: "Nunca entró", n: 6 },
  { nota: 2.71, titulo: "Entró y abandonó", n: 7 },
  { nota: 2.80, titulo: "Uso ligero", n: 13 },
  { nota: 3.46, titulo: "40+ actividades", n: 20, clave: true },
];

const MAX = 5.0; // tope del eje: nota sobre 5,0
const BASE = 2.41; // el punto de partida, para las cifras de mejora

export default function PorQueFunciona() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cols = Array.from(root.querySelectorAll(".pqf-col"));
    const c1 = root.querySelector("#pqf-c1");
    const c2 = root.querySelector("#pqf-c2");
    const fmt = (n) => n.toFixed(2).replace(".", ",");

    function contar(el, a, b, ms) {
      if (!el) return;
      if (ms <= 0) { el.textContent = fmt(b); return; }
      const t0 = performance.now();
      function paso(t) {
        if (!el.isConnected) return;
        const k = Math.min(1, (t - t0) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(a + (b - a) * e);
        if (k < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }

    function animarCifras() {
      const dif = 3.46 - BASE; // 1,05
      const pct = Math.round((dif / BASE) * 100); // 44 %
      if (reduce) {
        if (c1) c1.textContent = "+" + fmt(dif);
        if (c2) c2.textContent = "+" + pct + "%";
        return;
      }
      const t0 = performance.now();
      const ms = 900;
      function paso(t) {
        if (!c1 || !c1.isConnected) return;
        const k = Math.min(1, (t - t0) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        c1.textContent = "+" + fmt(dif * e);
        if (c2) c2.textContent = "+" + Math.round(pct * e) + "%";
        if (k < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }

    function animar() {
      cols.forEach((c) => {
        c.classList.remove("visible");
        c.querySelector(".pqf-barra").style.height = "0px";
        c.querySelector(".pqf-valor").textContent = "0,00";
      });
      if (c1) c1.textContent = "+0,00";
      if (c2) c2.textContent = "+0%";
      cols.forEach((c, i) => {
        const nota = parseFloat(c.getAttribute("data-nota"));
        const d = reduce ? 0 : 180 + i * 260;
        setTimeout(() => {
          if (!c.isConnected) return;
          c.querySelector(".pqf-barra").style.height = (nota / MAX) * 100 + "%";
          c.classList.add("visible");
          contar(c.querySelector(".pqf-valor"), 0, nota, reduce ? 0 : 800);
        }, d);
      });
      setTimeout(animarCifras, reduce ? 0 : 180 + cols.length * 260 + 300);
    }

    const btn = root.querySelector(".pqf-replay");
    if (btn) btn.addEventListener("click", animar);

    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (es) => { if (es[0].isIntersecting) { animar(); io.disconnect(); } },
        { threshold: 0.3 }
      );
      io.observe(root.querySelector(".pqf-plot"));
    } else {
      animar();
    }

    return () => {
      if (io) io.disconnect();
      if (btn) btn.removeEventListener("click", animar);
    };
  }, []);

  return (
    <section ref={ref} className="pqf" aria-label="Por qué funciona AprendeFAE">
      <style>{CSS}</style>

      <p className="pqf-sello"><i></i> POR QUÉ FUNCIONA</p>
      <h2 className="pqf-h1">Entre más la usan,<br /><span className="res">mejor les va.</span></h2>
      <p className="pqf-bajada">
        No es una promesa: es lo que muestran las notas de un semestre. Cuanto más
        sostenido es el uso de la plataforma, más sube el promedio del estudiante
        — hasta cruzar la línea de aprobación.
      </p>

      <div className="pqf-lamina">
        <div className="pqf-cabe">
          <h3>Promedio de nota, según cuánto la usan</h3>
          <button className="pqf-replay" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" /></svg>
            Ver otra vez
          </button>
        </div>
        <p className="pqf-leyenda"><i></i> Línea de aprobación · 3,0</p>

        <div className="pqf-plot">
          <div className="pqf-eje">
            <div className="pqf-ref apr" style={{ bottom: "60%" }}><span>3,0</span></div>
            <div className="pqf-ref" style={{ bottom: "40%" }}><span>2,0</span></div>
            <div className="pqf-ref" style={{ bottom: "80%" }}><span>4,0</span></div>
          </div>
          <div className="pqf-barras">
            {GRUPOS.map((g) => (
              <div key={g.titulo} className={"pqf-col" + (g.clave ? " clave" : "")} data-nota={g.nota}>
                <div className="pqf-barra">
                  {g.clave && <span className="pqf-corona">USO SOSTENIDO</span>}
                  <span className="pqf-valor">0,00</span>
                </div>
                <div className="pqf-etq"><b>{g.titulo}</b><span>n = {g.n}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pqf-cifras">
        <div className="pqf-cifra"><b id="pqf-c1">+0,00</b><span>más de nota, en promedio, entre no entrar y usarla de forma sostenida</span></div>
        <div className="pqf-cifra"><b id="pqf-c2">+0%</b><span>de mejora sobre el promedio de quien nunca la abrió</span></div>
        <div className="pqf-cifra"><b>1 de 4</b><span>grupos cruza el 3,0 — y es justo el que la usa en serio</span></div>
      </div>
    </section>
  );
}

const CSS = `
.pqf{ position:relative; max-width:880px; margin:0 auto; padding:clamp(48px,8vh,96px) 20px clamp(28px,5vh,52px); font-family:Inter,system-ui,sans-serif; color:#F8F9FA; }
.pqf::before{ content:""; position:absolute; top:0; left:50%; transform:translateX(-50%); width:min(100%,520px); height:1px; background:linear-gradient(90deg,transparent,rgba(248,249,250,.14),transparent); }
.pqf-sello{ display:inline-flex; align-items:center; gap:9px; font-family:Sora,sans-serif; font-size:10.5px; font-weight:700; letter-spacing:.2em; color:rgba(248,249,250,.55); margin:0 0 18px; }
.pqf-sello i{ width:7px; height:7px; background:#6F86FF; transform:rotate(45deg); display:block; }
.pqf-h1{ font-family:Sora,sans-serif; font-weight:800; letter-spacing:-.02em; line-height:1.05; font-size:clamp(30px,6vw,52px); margin:0 0 16px; max-width:16ch; }
.pqf-h1 .res{ color:#F8F9FA; }
.pqf-bajada{ margin:0; max-width:54ch; color:rgba(248,249,250,.74); font-size:clamp(14.5px,2.2vw,17px); line-height:1.58; }
.pqf-lamina{ margin:clamp(30px,5vw,48px) 0 0; border:1px solid rgba(248,249,250,.10); border-radius:20px; background:rgba(29,53,87,.34); padding:clamp(20px,4vw,32px) clamp(16px,3.5vw,28px) clamp(18px,3vw,24px); }
.pqf-cabe{ display:flex; justify-content:space-between; align-items:baseline; gap:14px; flex-wrap:wrap; margin-bottom:4px; }
.pqf-cabe h3{ font-family:Sora,sans-serif; font-weight:700; font-size:clamp(16px,2.6vw,20px); margin:0; letter-spacing:-.01em; }
.pqf-replay{ appearance:none; border:1px solid rgba(248,249,250,.10); background:transparent; color:rgba(248,249,250,.74); font-family:Sora,sans-serif; font-weight:600; font-size:12px; padding:7px 13px; border-radius:999px; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:border-color .18s ease,color .18s ease; }
.pqf-replay:hover{ border-color:rgba(111,134,255,.55); color:#F8F9FA; }
.pqf-replay svg{ width:13px; height:13px; }
.pqf-leyenda{ display:inline-flex; align-items:center; gap:8px; margin:4px 0 0; font-family:Sora,sans-serif; font-size:12px; font-weight:600; color:rgba(248,249,250,.55); letter-spacing:.02em; }
.pqf-leyenda i{ width:18px; border-top:1.5px dashed rgba(233,196,106,.8); display:block; flex:none; }
.pqf-plot{ position:relative; height:344px; margin-top:24px; padding-top:30px; }
.pqf-eje{ position:absolute; left:38px; right:2px; top:30px; bottom:46px; pointer-events:none; }
.pqf-ref{ position:absolute; left:0; right:0; border-top:1px dashed rgba(248,249,250,.10); }
.pqf-ref span{ position:absolute; right:calc(100% + 9px); top:-7px; font-size:10.5px; font-family:Sora,sans-serif; color:rgba(248,249,250,.34); letter-spacing:.06em; white-space:nowrap; }
.pqf-ref.apr{ border-top:1.5px dashed rgba(233,196,106,.6); }
.pqf-ref.apr span{ color:#E9C46A; font-weight:700; }
.pqf-barras{ position:absolute; left:38px; right:2px; top:30px; bottom:46px; display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(8px,2.4vw,20px); align-items:end; }
.pqf-col{ position:relative; height:100%; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; }
.pqf-barra{ width:100%; max-width:94px; border-radius:9px 9px 2px 2px; height:0; background:linear-gradient(180deg,rgba(203,220,242,.9),rgba(203,220,242,.45)); transition:height 1s cubic-bezier(.3,.9,.4,1); position:relative; }
.pqf-col.clave .pqf-barra{ background:linear-gradient(180deg,#6F86FF,rgba(111,134,255,.55)); box-shadow:0 0 0 1px rgba(111,134,255,.5),0 14px 34px -14px rgba(111,134,255,.8); }
.pqf-valor{ position:absolute; top:-30px; left:50%; transform:translateX(-50%); font-family:Sora,sans-serif; font-weight:800; font-size:clamp(17px,3vw,22px); white-space:nowrap; opacity:0; transition:opacity .4s ease; }
.pqf-col.clave .pqf-valor{ color:#F8F9FA; }
.pqf-col.visible .pqf-valor{ opacity:1; }
.pqf-corona{ position:absolute; top:-52px; left:50%; transform:translateX(-50%); font-family:Sora,sans-serif; font-weight:700; font-size:10.5px; letter-spacing:.1em; color:#121418; background:#6F86FF; padding:3px 9px; border-radius:999px; white-space:nowrap; opacity:0; transition:opacity .5s ease .2s; }
.pqf-col.visible .pqf-corona{ opacity:1; }
.pqf-etq{ position:absolute; top:calc(100% + 10px); left:0; right:0; text-align:center; }
.pqf-etq b{ display:block; font-family:Sora,sans-serif; font-weight:600; font-size:clamp(12px,2vw,13px); line-height:1.25; }
.pqf-etq span{ display:block; margin-top:3px; font-size:10.5px; color:rgba(248,249,250,.34); font-family:Sora,sans-serif; letter-spacing:.06em; }
.pqf-col.clave .pqf-etq b{ color:#F8F9FA; }
.pqf-cifras{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:clamp(24px,4vw,34px); }
.pqf-cifra{ border:1px solid rgba(248,249,250,.10); border-radius:15px; background:rgba(29,53,87,.34); padding:18px 18px 16px; }
.pqf-cifra b{ display:block; font-family:Sora,sans-serif; font-weight:800; font-size:clamp(25px,4.5vw,33px); letter-spacing:-.02em; color:#F8F9FA; }
.pqf-cifra span{ display:block; margin-top:6px; color:rgba(248,249,250,.74); font-size:13px; line-height:1.4; }
@media(max-width:560px){ .pqf-plot{ height:306px; } .pqf-cifras{ grid-template-columns:1fr; } }
@media(prefers-reduced-motion:reduce){ .pqf-barra,.pqf-valor,.pqf-corona{ transition:none; } }
`;
