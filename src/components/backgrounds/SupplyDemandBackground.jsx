import { useEffect, useRef } from "react";
import { shouldRenderStatic } from "../../utils/device.js";

/*
 * Fondo de Macroeconomía: dos curvas —oferta y demanda— que derivan lentamente
 * en direcciones opuestas y se cruzan en puntos distintos con el tiempo.
 * No es una gráfica de libro: sin ejes, sin números, sin etiquetas.
 * El punto de equilibrio destella en coral de vez en cuando, no de forma continua.
 */

const BG = "#0E1B2E";
const LINE = "203,220,242";   // blanco azulado suave
const CORAL = "231,111,81";

const SAMPLES = 64;           // puntos por curva: suficiente para verse suave
const PULSE_MS = 2600;        // duración del destello del equilibrio
const PULSE_GAP_MIN = 5200;   // espera mínima entre destellos
const PULSE_GAP_VAR = 4800;   // variación extra de la espera

function makeGlowSprite(color) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color + "ff");
  grad.addColorStop(0.3, color + "aa");
  grad.addColorStop(0.65, color + "2e");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export default function SupplyDemandBackground({ animation = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let boot = 0;
    let tries = 0;
    let onResize = null;

    const init = (cv) => {
      const ctx = cv.getContext("2d", { alpha: false });
      const still = shouldRenderStatic(animation);
      const coralSprite = makeGlowSprite("#E76F51");

      // semilla fija: el fotograma estático siempre sale igual
      let seed = 20260901;
      const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

      let w = 0, h = 0, dpr = 1;
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = cv.clientWidth; h = cv.clientHeight;
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      onResize = resize;
      window.addEventListener("resize", resize);

      /*
       * Cada curva ocupa el ancho completo. `dir` = +1 baja hacia la derecha
       * (demanda), -1 sube hacia la derecha (oferta). La deriva vertical de las
       * dos va en sentido contrario, así que el cruce se desplaza sin parar.
       */
      const curveY = (u, t, dir) => {
        const span = h * 0.33;
        const mid = h * 0.5;
        const drift = Math.sin(t * 0.055 * dir + (dir > 0 ? 0 : 1.7)) * h * 0.11 * dir;
        /*
         * Cada curva se dobla como la que representa: la demanda cae rápido y
         * luego se aplana, la oferta arranca plana y luego sube. Así se leen
         * como curvas y no como dos rectas cruzándose.
         */
        const bend = dir > 0
          ? 1 - Math.pow(1 - u, 2.1)   // demanda: desciende hacia la derecha
          : Math.pow(u, 2.1);          // oferta: asciende hacia la derecha
        const wobble = Math.sin(u * 2.3 + t * 0.21 * dir) * h * 0.022
                     + Math.sin(u * 5.1 - t * 0.13 * dir) * h * 0.009;
        return mid + drift + dir * (bend * 2 - 1) * span + wobble;
      };

      /* Cruce: se busca el cambio de signo entre las dos curvas y se interpola. */
      const findCrossing = (t) => {
        let prev = curveY(0, t, 1) - curveY(0, t, -1);
        for (let i = 1; i <= SAMPLES; i++) {
          const u = i / SAMPLES;
          const d = curveY(u, t, 1) - curveY(u, t, -1);
          if ((prev <= 0 && d >= 0) || (prev >= 0 && d <= 0)) {
            const f = prev === d ? 0.5 : prev / (prev - d);
            const u0 = (i - 1) / SAMPLES;
            const uc = u0 + f / SAMPLES;
            return { x: uc * w, y: curveY(uc, t, 1) };
          }
          prev = d;
        }
        return null;
      };

      const strokeCurve = (t, dir) => {
        ctx.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
          const u = i / SAMPLES;
          const x = u * w;
          const y = curveY(u, t, dir);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        // halo ancho y tenue + trazo fino y nítido: da sensación de brillo sin blur costoso
        ctx.strokeStyle = `rgba(${LINE},0.07)`;
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${LINE},0.30)`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      };

      let pulse = null;
      let nextPulse = 2400;

      const step = (tms) => {
        if (!pulse && tms > nextPulse) {
          pulse = { t0: tms };
        }
        if (pulse) {
          const k = (tms - pulse.t0) / PULSE_MS;
          if (k >= 1) {
            pulse = null;
            nextPulse = tms + PULSE_GAP_MIN + rnd() * PULSE_GAP_VAR;
          } else {
            pulse.k = Math.sin(Math.PI * k); // 0 → 1 → 0
          }
        }
      };

      const draw = (tms) => {
        if (cv.clientWidth !== w || cv.clientHeight !== h) resize();
        const t = tms / 1000;

        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, w, h);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        strokeCurve(t, 1);   // demanda: desciende hacia la derecha
        strokeCurve(t, -1);  // oferta: asciende hacia la derecha

        const pk = pulse ? (pulse.k || 0) : 0;
        if (pk > 0.01) {
          const cross = findCrossing(t);
          if (cross) {
            const r = 26 + 30 * pk;
            ctx.globalAlpha = Math.min(0.75 * pk, 0.75);
            ctx.drawImage(coralSprite, cross.x - r, cross.y - r, r * 2, r * 2);
            ctx.globalAlpha = Math.min(0.35 + 0.6 * pk, 1);
            ctx.beginPath();
            ctx.arc(cross.x, cross.y, 2 + 1.6 * pk, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${CORAL})`;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      };

      const safeDraw = (tms) => {
        try { draw(tms); } catch (err) { console.error("supply/demand draw failed", err); }
      };

      if (still) {
        // fotograma único: un instante con el equilibrio ya destellando
        pulse = { t0: 0, k: 0.8 };
        safeDraw(5200);
        return;
      }

      let last = 0;
      const loop = (tms) => {
        raf = requestAnimationFrame(loop);
        if (tms - last < 33) return;   // tope de ~30 fps, igual que el fondo del home
        last = tms;
        step(tms);
        safeDraw(tms);
      };
      step(0);
      safeDraw(0);
      raf = requestAnimationFrame(loop);
    };

    const tryInit = () => {
      const cv = canvasRef.current;
      if (!cv || !cv.clientWidth || !cv.clientHeight) {
        if (tries++ < 120) boot = requestAnimationFrame(tryInit);
        return;
      }
      init(cv);
    };

    tryInit();

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(boot);
      if (onResize) window.removeEventListener("resize", onResize);
    };
  }, [animation]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
        willChange: "transform",
      }}
    />
  );
}
