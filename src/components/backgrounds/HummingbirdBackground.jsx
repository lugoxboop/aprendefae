import { useEffect, useRef } from "react";
import { shouldRenderStatic, isNarrowViewport } from "../../utils/device.js";

/*
 * Fondo de la portada: un colibrí en silueta, acercándose y alejándose.
 *
 * SEGUNDA DIRECCIÓN. La primera buscaba realismo —plumaje, iridiscencia,
 * barrido del ala— y a tamaño de fondo no se leía como un colibrí: se leía como
 * un insecto. El detalle fino no sobrevive a 40 px. Aquí no hay detalle: hay
 * una silueta grande y limpia, y la profundidad la da el TAMAÑO, no la textura.
 *
 * LO QUE HACE QUE SE LEA COMO COLIBRÍ, en orden de importancia:
 *
 *   1. EL PICO. Es el rasgo que decide, y era lo que fallaba antes: iba corto y
 *      recto. Aquí es largo —más de medio cuerpo—, fino y curvado. Sin eso,
 *      cualquier pájaro pequeño en silueta con las alas abiertas se lee como
 *      una mosca.
 *   2. La cola en abanico con la muesca central. Un insecto no tiene cola; esa
 *      horquilla descarta la lectura de insecto de un vistazo.
 *   3. El cuerpo compacto y sin cuello: la proporción del colibrí.
 *   4. Las alas como dos barridos curvos hacia atrás, no como aspas. Sugieren
 *      el aleteo sin animarlo: animar un batido de 50 Hz a 30 fps daría un
 *      aleteo de dibujo animado.
 *
 * La silueta se traza en coordenadas de cuerpo (1 = largo del cuerpo) y se
 * escala entera, así que la forma es idéntica de cerca y de lejos — que es
 * justo lo que se busca con la perspectiva por tamaño.
 */

const BG = "#0E1B2E";

const FPS = 30;

/* Ciclo de acercarse y alejarse. Lento a propósito. */
const CICLO_MS = 26000;

const suave = (t) => t * t * (3 - 2 * t);

/*
 * La silueta, en coordenadas de cuerpo, mirando a la derecha.
 *
 * El orden de dibujo importa: alas y cola primero, cuerpo y cabeza encima. Así
 * las alas nacen por detrás del cuerpo y no hay que recortar nada.
 */
function trazarColibri(g, apertura) {
  /*
   * ---------- alas ----------
   * Elipses alargadas, no curvas cerradas. Se probaron las dos formas: con
   * curvas de Bézier los dos bordes se juntaban cerca de la punta y el ala
   * salía como una púa —de ahí venía la lectura de insecto—. Una elipse tiene
   * ancho en el centro por construcción, que es lo que hace que se lea como ala.
   */
  const ala = (ang, largo, ancho) => {
    g.save();
    g.translate(-0.06, -0.16);
    g.rotate(ang);
    g.beginPath();
    g.ellipse(-largo * 0.86, 0, largo, ancho, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  ala(0.62, 0.86 * apertura, 0.2);   // la de atrás, más baja
  ala(1.02, 0.98 * apertura, 0.26);  // la principal, más alta y ancha

  /* ---------- cola: corta, ancha y ahorquillada ---------- */
  g.beginPath();
  g.moveTo(-0.34, -0.14);
  g.lineTo(-1.05, -0.34);
  g.quadraticCurveTo(-0.84, -0.02, -1.02, 0.28);
  g.lineTo(-0.34, 0.22);
  g.closePath();
  g.fill();

  /* ---------- cuerpo: compacto, sin cuello ---------- */
  g.beginPath();
  g.ellipse(0.02, 0, 0.5, 0.4, -0.14, 0, Math.PI * 2);
  g.fill();

  /* ---------- cabeza, fundida con el cuerpo ---------- */
  g.beginPath();
  g.arc(0.55, -0.24, 0.28, 0, Math.PI * 2);
  g.fill();

  /*
   * ---------- pico ----------
   * Sale de la CABEZA, no del cuerpo, y mide más que el cuerpo entero. Va por
   * el borde superior hasta la punta y vuelve por el inferior, así que se
   * estrecha de forma continua en vez de ser un triángulo.
   */
  g.beginPath();
  g.moveTo(0.78, -0.35);
  g.bezierCurveTo(1.3, -0.5, 1.9, -0.58, 2.32, -0.56);
  g.bezierCurveTo(1.9, -0.45, 1.3, -0.33, 0.8, -0.2);
  g.closePath();
  g.fill();
}

/* Flor en silueta: presente, pero claramente por detrás en importancia. */
function trazarFlor(g, s, t) {
  g.save();
  g.rotate(Math.sin(t * 0.0004) * 0.04);

  g.beginPath();
  g.moveTo(0, s * 0.5);
  g.quadraticCurveTo(s * 0.4, s * 2.2, s * 0.15, s * 4.2);
  g.strokeStyle = "rgba(42,157,143,0.22)";
  g.lineWidth = Math.max(1.5, s * 0.09);
  g.stroke();

  g.fillStyle = "rgba(231,111,81,0.24)";
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i / 5) * Math.PI * 2);
    g.beginPath();
    g.ellipse(0, -s * 0.66, s * 0.3, s * 0.66, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.beginPath();
  g.arc(0, 0, s * 0.24, 0, Math.PI * 2);
  g.fillStyle = "rgba(231,111,81,0.38)";
  g.fill();

  g.restore();
}

export default function HummingbirdBackground({ animation = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let onResize = null;
    const cv = canvasRef.current;
    if (!cv) return;

    const ctx = cv.getContext("2d", { alpha: false });
    const quieto = shouldRenderStatic(animation);
    let w = 0;
    let h = 0;
    let angosto = false;

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      angosto = isNarrowViewport();
    };

    const pintar = (t) => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const base = Math.min(w, h);

      /*
       * La flor vive en la banda baja, del lado contrario al colibrí. La franja
       * del titular queda despejada, igual que en la versión anterior: es lo
       * que sostiene el contraste medido.
       */
      ctx.save();
      ctx.translate(w * (angosto ? 0.84 : 0.93), h * (angosto ? 0.9 : 0.9));
      trazarFlor(ctx, base * (angosto ? 0.055 : 0.062), t);
      ctx.restore();

      /*
       * Perspectiva por tamaño: un ciclo lento de acercarse y alejarse, con
       * suavizado en los dos extremos para que no haya un instante de rebote.
       */
      const fase = (t % CICLO_MS) / CICLO_MS;
      const cerca = suave(1 - Math.abs(fase * 2 - 1));
      const escala = base * (angosto ? 0.085 : 0.11) * (0.5 + cerca * 0.5);

      /* Al acercarse baja y deriva hacia la flor: refuerza la profundidad. */
      const x = w * (angosto ? 0.32 : 0.58) + cerca * w * (angosto ? 0.26 : 0.2);
      const y = h * (angosto ? 0.88 : 0.895) + Math.sin(t * 0.0013) * base * 0.012;

      /* Vuelo estacionario: la silueta nunca queda perfectamente quieta. */
      const cabeceo = Math.sin(t * 0.0009) * 0.06 + Math.sin(t * 0.0021) * 0.02;
      const apertura = 0.92 + Math.sin(t * 0.0016) * 0.08;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(escala, escala);
      ctx.rotate(cabeceo);

      /*
       * Un tono con degradado sutil de teal a coral a lo largo del cuerpo. No
       * es plumaje: es que la silueta pertenezca a la marca.
       */
      const tinte = ctx.createLinearGradient(-1.5, 0, 2.2, 0);
      tinte.addColorStop(0, "rgba(42,157,143,0.38)");
      tinte.addColorStop(0.55, "rgba(58,150,152,0.62)");
      tinte.addColorStop(1, "rgba(231,111,81,0.74)");
      ctx.fillStyle = tinte;

      trazarColibri(ctx, apertura);
      ctx.restore();
    };

    medir();

    if (quieto) {
      /* Gama baja: un fotograma con el colibrí ya cerca. Sin rAF ni una vez. */
      const congelado = CICLO_MS * 0.5;
      pintar(congelado);
      onResize = () => { medir(); pintar(congelado); };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const inicio = performance.now();
    let ultimo = 0;
    const bucle = (ahora) => {
      raf = requestAnimationFrame(bucle);
      if (ahora - ultimo < 1000 / FPS) return;
      ultimo = ahora;
      pintar(ahora - inicio);
    };
    raf = requestAnimationFrame(bucle);

    onResize = () => medir();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      if (onResize) window.removeEventListener("resize", onResize);
    };
  }, [animation]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, display: "block", pointerEvents: "none" }}
    />
  );
}
