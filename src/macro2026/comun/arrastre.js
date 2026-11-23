/*
 * MACRO 2026 · arrastrar con tocar-tocar y teclado (T2 en adelante).
 *
 * Guía «drag» de Modern Web Guidance: Pointer Events + setPointerCapture
 * (Baseline amplio), `touch-action: none` y `user-select: none` SOLO en lo que
 * se arrastra, y siempre una alternativa sin arrastre: tocar la pieza la elige
 * (aria-pressed) y tocar un destino la suelta ahí; con teclado, Enter o
 * Espacio eligen (la pieza es un botón) y los destinos son botones. El destino se reconoce por su
 * rectángulo (data-destino), no por elementFromPoint: la pieza arrastrada va
 * encima y lo taparía.
 */
import { useRef, useState } from "react";

export function useArrastre({ alSoltar, activo = true, raiz = null }) {
  const [arrastre, setArrastre] = useState(null);
  const [elegido, setElegido] = useState(null);
  const [blanco, setBlanco] = useState(null);
  const propio = useRef(null);
  const sinClick = useRef(false);
  const contenedor = raiz ?? propio;

  const destinoBajo = (x, y) => {
    const base = contenedor.current ?? (typeof document !== "undefined" ? document : null);
    if (!base) return null;
    for (const el of base.querySelectorAll("[data-destino]")) {
      if (el.disabled) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return el.dataset.destino;
    }
    return null;
  };

  const soltar = (id, destino) => { setElegido(null); setBlanco(null); alSoltar(id, destino); };

  const pieza = (id) => ({
    "aria-pressed": elegido === id,
    onPointerDown: (e) => {
      if (!activo || (e.button !== undefined && e.button !== 0)) return;
      sinClick.current = false;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setArrastre({ id, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, x: e.clientX, y: e.clientY, movio: false });
    },
    onPointerMove: (e) => {
      if (!arrastre || arrastre.id !== id) return;
      const dx = e.clientX - arrastre.x0, dy = e.clientY - arrastre.y0;
      const movio = arrastre.movio || Math.hypot(dx, dy) > 6;
      setArrastre({ ...arrastre, dx, dy, x: e.clientX, y: e.clientY, movio });
      setBlanco(movio ? destinoBajo(e.clientX, e.clientY) : null);
    },
    onPointerUp: (e) => {
      if (!arrastre || arrastre.id !== id) return;
      const d = arrastre.movio ? destinoBajo(e.clientX, e.clientY) : null;
      /* Tras un arrastre el navegador manda además un click: se ignora. */
      sinClick.current = arrastre.movio;
      setArrastre(null);
      setBlanco(null);
      if (d) soltar(id, d);
    },
    /* Tocar (o Enter / Espacio, que el botón convierte en click) elige. */
    onClick: () => {
      if (sinClick.current) { sinClick.current = false; return; }
      if (!activo) return;
      setElegido((v) => (v === id ? null : id));
    },
    onPointerCancel: () => { setArrastre(null); setBlanco(null); },
    onKeyDown: (e) => { if (e.key === "Escape") setElegido(null); },
    style: arrastre?.id === id
      ? { transform: `translate(${arrastre.dx}px, ${arrastre.dy}px)`, zIndex: 5, position: "relative" }
      : { transform: "translate(0, 0)" },
    "data-arrastrando": arrastre?.id === id && arrastre.movio ? "1" : undefined,
  });

  /*
   * Un destino: tocarlo suelta ahí lo elegido. Con `directo` (cuando solo hay
   * una pieza en juego), tocar el destino la suelta aunque no se haya elegido.
   */
  const destino = (d, directo = null) => ({
    "data-destino": d,
    "data-blanco": blanco === d ? "1" : "0",
    onClick: () => {
      if (!activo) return;
      const id = elegido ?? directo;
      if (id != null) soltar(id, d);
    },
  });

  return { contenedor: propio, pieza, destino, elegido, setElegido, arrastre, blanco };
}
