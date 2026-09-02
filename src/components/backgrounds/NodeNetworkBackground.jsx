import { useEffect, useRef } from "react";
import { shouldRenderStatic, isNarrowViewport } from "../../utils/device.js";

/*
 * Fondo animado de red de nodos en 3D.
 * Portado 1:1 del export de Claude Design: misma semilla, mismas frecuencias de
 * oscilación, mismo cap de ~30fps, mismos umbrales de conexión y de pulso.
 * En gama baja o con prefers-reduced-motion dibuja un único fotograma estático
 * (sin requestAnimationFrame) exactamente como el original.
 */

const BG = "#0E1B2E";

function makeSprite(color) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color + "ff");
  grad.addColorStop(0.28, color + "cc");
  grad.addColorStop(0.62, color + "33");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export default function NodeNetworkBackground({ animation = true, pulses = true, density = "normal" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let boot = 0;
    let tries = 0;
    let onResize = null;
    let onScroll = null;

    const init = (cv) => {
      const ctx = cv.getContext("2d", { alpha: false });
      const still = shouldRenderStatic(animation);
      const pulsesOn = pulses !== false;

      const sprites = {
        base: makeSprite("#CBDCF2"),
        coral: makeSprite("#E76F51"),
        teal: makeSprite("#2A9D8F"),
      };

      const dense = density === "alta";
      const narrow = isNarrowViewport();
      const N = narrow ? (dense ? 18 : 14) : (dense ? 34 : 26);

      // deterministic-ish seeded random so the static frame is reproducible
      let seed = 20260831;
      const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

      const nodes = [];
      for (let i = 0; i < N; i++) {
        nodes.push({
          ox: rnd() * 2 - 1, oy: rnd() * 2 - 1, oz: rnd() * 2 - 1,
          // organic drift: three slow, incommensurate oscillators per node
          ax: 0.10 + rnd() * 0.16, ay: 0.10 + rnd() * 0.16, az: 0.12 + rnd() * 0.18,
          fx: 0.019 + rnd() * 0.021, fy: 0.017 + rnd() * 0.020, fz: 0.013 + rnd() * 0.017,
          px: rnd() * 6.28, py: rnd() * 6.28, pz: rnd() * 6.28,
          base: 1.1 + rnd() * 1.2,
          x: 0, y: 0, z: 0,
        });
      }

      let w = 0, h = 0, dpr = 1, scroll = 0, ry = 0, rx = 0;
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = cv.clientWidth; h = cv.clientHeight;
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      onResize = resize;
      window.addEventListener("resize", resize);

      onScroll = () => { scroll = window.scrollY || 0; };
      window.addEventListener("scroll", onScroll, { passive: true });

      // pulse state: one node at a time, rare, ~2.4s arc
      let pulse = null, nextPulse = 3200;

      const step = (tms) => {
        const t = tms / 1000;
        for (const n of nodes) {
          n.x = n.ox + Math.sin(t * n.fx * 6.28 + n.px) * n.ax + Math.sin(t * n.fz * 3.1 + n.pz) * n.ax * 0.35;
          n.y = n.oy + Math.sin(t * n.fy * 6.28 + n.py) * n.ay + Math.cos(t * n.fx * 2.7 + n.px) * n.ay * 0.3;
          n.z = n.oz + Math.sin(t * n.fz * 6.28 + n.pz) * n.az;
        }
        ry = t * 0.012;
        rx = Math.sin(t * 0.045) * 0.16;
        if (pulsesOn) {
          if (!pulse && tms > nextPulse) {
            pulse = { i: Math.floor(rnd() * nodes.length), t0: tms, accent: rnd() < 0.5 ? "coral" : "teal" };
          }
          if (pulse) {
            const k = (tms - pulse.t0) / 2400;
            if (k >= 1) { pulse = null; nextPulse = tms + 6500 + rnd() * 5500; }
            else pulse.k = Math.sin(Math.PI * k); // 0 -> 1 -> 0
          }
        }
      };

      const project = (n) => {
        const cy = Math.cos(ry), sy = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
        let x = n.x * cy - n.z * sy;
        let z0 = n.x * sy + n.z * cy;
        let y = n.y * cxr - z0 * sxr;
        const z = n.y * sxr + z0 * cxr;
        const d = 1 / (2.45 - z * 0.75);          // depth factor: near = larger
        const spread = Math.max(w, h) * 0.66;
        const par = 0.02 + d * 0.26;               // near nodes parallax faster
        return { sx: w / 2 + x * spread * d, sy: h / 2 + y * spread * d - scroll * par, d: d, z: z };
      };

      const draw = () => {
        if (cv.clientWidth !== w || cv.clientHeight !== h) resize();
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, w, h);

        const pts = nodes.map(project);
        const pi = pulse ? pulse.i : -1;
        const pk = pulse ? (pulse.k || 0) : 0;
        const accentLine = pulse && pulse.accent === "coral" ? "231,111,81" : "42,157,143";
        const near = Math.min(w, h);

        // connections — appear/fade purely from proximity
        ctx.lineCap = "round";
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = pts[i], b = pts[j];
            const dist = Math.hypot(a.sx - b.sx, a.sy - b.sy);
            const involved = (i === pi || j === pi);
            const max = near * (involved ? 0.30 + 0.26 * pk : 0.28);
            if (dist > max) continue;
            const depth = (a.d + b.d) / 2;
            const fall = 1 - dist / max;
            let alpha = 0.19 * fall * fall * (0.45 + depth * 0.9);
            if (involved) alpha += 0.16 * pk * fall;
            ctx.strokeStyle = involved && pk > 0.05
              ? "rgba(" + accentLine + "," + Math.min(alpha, 0.34).toFixed(3) + ")"
              : "rgba(203,220,242," + Math.min(alpha, 0.2).toFixed(3) + ")";
            ctx.lineWidth = 0.5 + depth * 0.55;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
        }

        // nodes — far ones smaller and softer, near ones tighter and brighter
        const order = pts.map((p, i) => i).sort((a, b) => pts[a].z - pts[b].z);
        for (const i of order) {
          const p = pts[i], n = nodes[i];
          const isPulse = i === pi && pk > 0.02;
          const soft = 1.9 - p.d * 0.9;                       // far = wider halo (reads as blur)
          const r = n.base * p.d * 7 * soft * (isPulse ? 1 + 0.75 * pk : 1);
          const alpha = (0.16 + p.d * 0.5) * (isPulse ? 1 : 0.9);
          const img = isPulse ? sprites[pulse.accent] : sprites.base;
          ctx.globalAlpha = Math.min(alpha, 0.95);
          ctx.drawImage(img, p.sx - r, p.sy - r, r * 2, r * 2);
          // crisp core only for near nodes
          if (p.d > 0.42 || isPulse) {
            ctx.globalAlpha = Math.min(0.35 + p.d * 0.5 + (isPulse ? 0.3 * pk : 0), 1);
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, Math.max(0.7, n.base * p.d * 1.5), 0, Math.PI * 2);
            ctx.fillStyle = isPulse ? (pulse.accent === "coral" ? "#F0A48F" : "#7FD3C8") : "#EAF1FB";
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      };

      const safeDraw = () => { try { draw(); } catch (err) { console.error("bg draw failed", err); } };

      if (still) {                       // static fallback: one composed frame, no rAF
        step(4200);
        if (pulsesOn) { pulse = { i: Math.floor(N * 0.4), accent: "coral", k: 0.85, t0: 0 }; }
        safeDraw();
        return;
      }

      step(0);
      safeDraw();
      let last = 0;
      const loop = (tms) => {
        raf = requestAnimationFrame(loop);
        if (tms - last < 33) return;     // ~30fps cap
        last = tms;
        step(tms);
        safeDraw();
      };
      raf = requestAnimationFrame(loop);
    };

    const tryInit = () => {
      const cv = canvasRef.current || document.querySelector("canvas[data-fae-bg]");
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
      if (onScroll) window.removeEventListener("scroll", onScroll);
    };
  }, [animation, pulses, density]);

  return (
    <canvas
      ref={canvasRef}
      data-fae-bg="1"
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
