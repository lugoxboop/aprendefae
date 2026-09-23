import { useEffect, useRef } from "react";
import { shouldRenderStatic, isNarrowViewport } from "../../utils/device.js";
import { VERTICES, ARISTAS, CARAS, rotarTodos, proyectar } from "../../contabilidad/solido.js";
import {
  estadoInicial, avanzarChapoteo, normalDeSuperficie, cuerpoDelLiquido, INCLINACION_MAXIMA,
} from "../../contabilidad/liquido.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * FONDO DE CONTABILIDAD — el rombicuboctaedro de Pacioli, medio lleno.
 *
 * El sólido que Leonardo dibujó para «De divina proportione» y que aparece en
 * el retrato de Pacioli, girando despacio, con líquido dentro. La partida
 * doble en una sola imagen: se puede inclinar cuanto se quiera y las dos
 * mitades siguen siendo iguales.
 *
 * ═══════════ LA REGLA QUE SOSTIENE TODO ═══════════
 *
 * La superficie del líquido es HORIZONTAL RESPECTO AL MUNDO. El sólido gira
 * por debajo; el líquido no gira con él. Aquí eso no es una intención: los
 * vértices se rotan y el corte se calcula DESPUÉS, contra una normal que sale
 * de contabilidad/liquido.js y que nunca ha visto los ángulos del poliedro.
 * La prueba lo comprueba con el sólido en veinte orientaciones.
 *
 * ═══════════ QUÉ SE DIBUJA, EN QUÉ ORDEN ═══════════
 *
 *   1. las caras de atrás, en vidrio muy tenue, para que se vea el volumen
 *   2. el líquido: las caras recortadas a lo que queda bajo la superficie
 *   3. la tapa de la superficie, un punto más clara — es lo que la lee
 *   4. las aristas, dos capas cada una (halo ancho tenue + núcleo fino), con
 *      el brillo según la profundidad: el mismo enfoque del teseracto
 *   5. los vértices, puntos pequeños, el lenguaje de nodos de la marca
 *
 * ═══════════ GAMA BAJA Y MOVIMIENTO REDUCIDO ═══════════
 *
 * `shouldRenderStatic` decide, igual que en los otros tres fondos: un solo
 * fotograma con el sólido quieto y el líquido nivelado. No hay bucle, no hay
 * escuchas de puntero y no se pide un solo fotograma más.
 *
 * ═══════════ SIN GIROSCOPIO ═══════════
 *
 * En el teléfono se inclina arrastrando el dedo. El giroscopio pide permiso
 * explícito en iOS y es la clase de dependencia frágil que el resto del sitio
 * ya evita; además dejaría el fondo moviéndose sin que nadie lo tocara.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BG = "#0E1B2E";
const NAVY = "61,90,128";      // #3D5A80, el navy de los avatares
const TEAL = "42,157,143";     // #2A9D8F
const NODO = "203,220,242";

/* Una vuelta completa entre 40 y 60 s: aquí, 52. */
export const SEGUNDOS_POR_VUELTA = 52;
const GIRO = (Math.PI * 2) / SEGUNDOS_POR_VUELTA;

/* Cuánto llega a inclinar el cursor al sólido, en radianes. */
export const INCLINACION_CURSOR = 0.34;
/* Con qué suavidad persigue el sólido a la posición del cursor. */
const SEGUIMIENTO = 2.6;
/* Y con cuánta vuelve al reposo cuando se suelta. */
const REGRESO = 1.1;

export default function RombicuboctaedroBackground({ animation = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return undefined;

    const quieto = shouldRenderStatic(animation);
    const movil = isNarrowViewport();

    let raf = 0;
    let ancho = 0;
    let alto = 0;

    /* Rotación de reposo y la inclinación que añade el puntero. */
    const giro = { x: 0.38, y: 0.6, z: 0.12 };
    const objetivo = { x: 0, z: 0 };   // hacia dónde lo empuja el cursor
    const inclina = { x: 0, z: 0 };    // dónde está de verdad, persiguiendo
    let tocando = false;
    let chapoteo = estadoInicial();

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2);
      ancho = cv.clientWidth;
      alto = cv.clientHeight;
      cv.width = Math.round(ancho * dpr);
      cv.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /*
     * DESPLAZADO DEL CENTRO, a propósito. En el índice hay un título arriba a
     * la izquierda y la rejilla de temas al centro; el sólido se va hacia la
     * derecha y abajo para acompañar sin disputar, igual que la malla del home
     * no se pone detrás del titular.
     */
    const encuadre = () => {
      const menor = Math.min(ancho, alto);
      /*
       * ENTERO EN PANTALLA, Y ESO MANDA SOBRE «GRANDE».
       *
       * El primer encuadre lo sacaba por abajo y por la derecha, y un sólido
       * cortado pierde justo lo que esta pieza tiene que decir: que está medio
       * lleno. Sin el contorno cerrado, la línea del líquido es una raya en una
       * mancha. El radio se calcula para que el sólido quepa con aire:
       *
       *   radio en mundo 2,8 · perspectiva hasta ×1,34 ≈ 3,75 unidades de k
       *
       * así que k = menor/3,75/2 deja el diámetro en la mitad del lado menor.
       */
      const k = (menor / 3.75) * (movil ? 0.46 : 0.5);
      const radio = k * 3.75;
      return {
        /* Pegado al borde que queda libre, pero sin morderlo. */
        cx: Math.min(ancho * (movil ? 0.66 : 0.72), ancho - radio - 8),
        cy: Math.min(alto * (movil ? 0.7 : 0.62), alto - radio - 8),
        k,
      };
    };

    const pintar = () => {
      const { cx, cy, k } = encuadre();
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, ancho, alto);

      const V = rotarTodos(VERTICES, giro.x + inclina.x, giro.y, giro.z + inclina.z);
      const P = V.map((v) => {
        const [px, py] = proyectar(v, { escala: k });
        return [cx + px, cy + py];
      });

      /* El orden de pintado sale de la profundidad: lo de atrás primero. */
      const carasOrdenadas = CARAS
        .map((c, i) => ({ c, i, z: c.indices.reduce((s, j) => s + V[j][2], 0) / c.indices.length }))
        .sort((a, b) => a.z - b.z);

      /*
       * 1 · el vidrio.
       *
       * LA OPACIDAD POR CARA NO ES LA QUE SE VE. Se dibujan las 26 de atrás
       * hacia delante y se suman: con 0,08 por cara, una docena superpuestas
       * daban un bloque teal opaco que le disputaba la pantalla a la tarjeta
       * del ranking —se vio, no se dedujo—. Con 0,035 por cara el apilado
       * aterriza donde pide la ficha: un vidrio de 8-12 % apenas perceptible.
       */
      for (const { c } of carasOrdenadas) {
        const opacidad = 0.035 + 0.02 * (1 - Math.abs(c.normal[2]));
        ctx.beginPath();
        c.indices.forEach((j, n) => (n ? ctx.lineTo(P[j][0], P[j][1]) : ctx.moveTo(P[j][0], P[j][1])));
        ctx.closePath();
        ctx.fillStyle = `rgba(${TEAL},${opacidad.toFixed(3)})`;
        ctx.fill();
      }

      /* 2 y 3 · el líquido, calculado en el mundo y proyectado después. */
      const n = normalDeSuperficie(chapoteo);
      const { partes, superficie } = cuerpoDelLiquido(V, n);
      const alPlano = ([x, y, z]) => {
        const [px, py] = proyectar([x, y, z], { escala: k });
        return [cx + px, cy + py];
      };

      /* El líquido sí va al 35 % de la ficha: es lo que tiene que leerse. */
      ctx.fillStyle = `rgba(${TEAL},0.35)`;
      for (const parte of partes) {
        if (parte.puntos.length < 3) continue;
        ctx.beginPath();
        parte.puntos.forEach((p, i) => {
          const [x, y] = alPlano(p);
          return i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
      }

      if (superficie.length >= 3) {
        ctx.beginPath();
        superficie.forEach((p, i) => {
          const [x, y] = alPlano(p);
          return i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
        /* La tapa, un punto más clara: es lo que hace que se lea como superficie. */
        ctx.fillStyle = `rgba(${TEAL},0.46)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${TEAL},0.65)`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      /*
       * 4 · las aristas. Dos capas por arista —halo ancho y tenue, núcleo
       * fino— y el brillo según la profundidad, que es el enfoque del
       * teseracto. Lo de delante brilla; lo de detrás se insinúa.
       */
      ctx.lineCap = "round";
      for (const capa of [
        { ancho: movil ? 2.6 : 3.4, alfa: 0.16 },
        { ancho: 1, alfa: 0.85 },
      ]) {
        ctx.lineWidth = capa.ancho;
        for (const [a, b] of ARISTAS) {
          const z = (V[a][2] + V[b][2]) / 2;
          /* z va de −2,8 a 2,8: se normaliza a 0..1 para modular el brillo. */
          const frente = (z + 2.8) / 5.6;
          ctx.strokeStyle = `rgba(${NAVY},${(capa.alfa * (0.28 + 0.72 * frente)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(P[a][0], P[a][1]);
          ctx.lineTo(P[b][0], P[b][1]);
          ctx.stroke();
        }
      }

      /* 5 · los vértices. */
      for (let i = 0; i < P.length; i += 1) {
        const frente = (V[i][2] + 2.8) / 5.6;
        ctx.beginPath();
        ctx.arc(P[i][0], P[i][1], 1.5 + 1.1 * frente, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${NODO},${(0.18 + 0.42 * frente).toFixed(3)})`;
        ctx.fill();
      }
    };

    medir();

    if (quieto) {
      pintar();
      const alRedimensionar = () => { medir(); pintar(); };
      window.addEventListener("resize", alRedimensionar);
      return () => window.removeEventListener("resize", alRedimensionar);
    }

    /* ─────────────────────────── el puntero ─────────────────────────── */

    /*
     * INFLUENCIA AMBIENTE, NO ARRASTRE. Con el ratón basta con moverlo por la
     * página: no hay que agarrar nada. Con el dedo sí hace falta arrastrar,
     * porque sin contacto no hay posición que leer.
     */
    const desde = (clienteX, clienteY) => {
      const r = cv.getBoundingClientRect();
      const nx = (clienteX - r.left) / r.width - 0.5;
      const ny = (clienteY - r.top) / r.height - 0.5;
      objetivo.z = Math.max(-1, Math.min(1, nx * 2)) * INCLINACION_CURSOR;
      objetivo.x = Math.max(-1, Math.min(1, ny * 2)) * INCLINACION_CURSOR;
      tocando = true;
    };

    const alMover = (e) => desde(e.clientX, e.clientY);
    const alSalir = () => { tocando = false; };
    const alTocar = (e) => { if (e.touches?.[0]) desde(e.touches[0].clientX, e.touches[0].clientY); };
    const alSoltar = () => { tocando = false; };

    if (movil) {
      window.addEventListener("touchmove", alTocar, { passive: true });
      window.addEventListener("touchend", alSoltar, { passive: true });
      window.addEventListener("touchcancel", alSoltar, { passive: true });
    } else {
      window.addEventListener("pointermove", alMover, { passive: true });
      window.addEventListener("pointerleave", alSalir, { passive: true });
    }

    /* ─────────────────────────── el bucle ─────────────────────────── */

    let previo = performance.now();
    const paso = (ahora) => {
      const dt = Math.min((ahora - previo) / 1000, 0.05);
      previo = ahora;

      giro.y += GIRO * dt;

      /*
       * La inclinación persigue al objetivo, y al soltar vuelve al reposo sin
       * corte: los dos casos son el mismo movimiento con distinta velocidad.
       */
      const meta = tocando ? objetivo : { x: 0, z: 0 };
      const ritmo = Math.min(1, (tocando ? SEGUIMIENTO : REGRESO) * dt);
      const antes = { x: inclina.x, z: inclina.z };
      inclina.x += (meta.x - inclina.x) * ritmo;
      inclina.z += (meta.z - inclina.z) * ritmo;

      /*
       * EL LÍQUIDO SE AGITA CON EL CAMBIO, no con la posición. Un sólido
       * quieto en una inclinación rara no chapotea; uno que se mueve, sí.
       */
      chapoteo = avanzarChapoteo(chapoteo, dt, {
        x: (inclina.x - antes.x) * -1.6,
        z: (inclina.z - antes.z) * -1.6,
      });

      pintar();
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    const alRedimensionar = () => medir();
    window.addEventListener("resize", alRedimensionar);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", alRedimensionar);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerleave", alSalir);
      window.removeEventListener("touchmove", alTocar);
      window.removeEventListener("touchend", alSoltar);
      window.removeEventListener("touchcancel", alSoltar);
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
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export { INCLINACION_MAXIMA };
