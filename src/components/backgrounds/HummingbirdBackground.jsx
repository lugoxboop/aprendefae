import { useEffect, useRef } from "react";
import { shouldRenderStatic, isNarrowViewport } from "../../utils/device.js";

/*
 * Fondo de la portada: un colibrí libando entre flores.
 *
 * Es lo primero que ve cualquiera, así que se dibuja en canvas 2D y no con
 * vídeo ni con Three.js. Un loop de vídeo presentable son megas, y esta
 * pantalla es justo donde el peso más duele: hoy la portada entera son 53 kB
 * comprimidos. Esto no añade ni una dependencia.
 *
 * DÓNDE ESTÁ EL REALISMO, que es lo que se pidió y no es lo mismo que detalle:
 *
 *   · El ala no se anima batiendo. Un colibrí bate a 50 Hz y el ojo no ve un
 *     ala: ve un huso borroso. Se dibuja ese huso —varias siluetas
 *     superpuestas con alfa bajo— y se le modula la amplitud. Intentar animar
 *     el batido a 30 fps daría un aleteo de dibujo animado, justo lo contrario.
 *   · El vuelo estacionario nunca está quieto: dos senos de periodos primos
 *     entre sí desplazan el cuerpo unos pocos píxeles, así que la posición no
 *     se repite de forma reconocible.
 *   · Al libar, el pico entra en la corola y el cuerpo retrocede un poco: un
 *     colibrí se sostiene contra la flor, no la empuja.
 *   · Los traslados van por una Bézier con salida y entrada suaves, y el cuerpo
 *     se inclina hacia donde va. Nunca hay tirones.
 *
 * PALETA: el navy de la marca al fondo; coral y teal en los pétalos y en la
 * iridiscencia de la garganta, que es donde un colibrí de verdad los tendría.
 *
 * COMPOSICIÓN: las flores viven en la banda baja y en los laterales. La franja
 * central alta, donde va el titular rotativo, se deja despejada a propósito.
 */

const BG = "#0E1B2E";
const CORAL = "#E76F51";
const TEAL = "#2A9D8F";
const CLARO = "#CBDCF2";

/* Cap de fotogramas, igual que los otros fondos del sitio. */
const FPS = 30;

/* Posiciones en fracción del lienzo. Ninguna cae en el centro alto. */
const FLORES_ANCHO = [
  { x: 0.09, y: 0.82, escala: 1.0, tono: CORAL, giro: -0.25 },
  { x: 0.91, y: 0.79, escala: 0.9, tono: TEAL, giro: 0.3 },
  { x: 0.66, y: 0.9, escala: 0.8, tono: CORAL, giro: 0.1 },
  { x: 0.34, y: 0.93, escala: 0.72, tono: TEAL, giro: -0.15 },
];

/* En vertical caben menos y más abajo: el titular ocupa más proporción. */
const FLORES_ANGOSTO = [
  { x: 0.12, y: 0.86, escala: 0.92, tono: CORAL, giro: -0.2 },
  { x: 0.87, y: 0.83, escala: 0.82, tono: TEAL, giro: 0.28 },
  { x: 0.5, y: 0.95, escala: 0.74, tono: CORAL, giro: 0.05 },
];

const lerp = (a, b, t) => a + (b - a) * t;
/* Suavizado en los dos extremos: ni arranca de golpe ni frena en seco. */
const suave = (t) => t * t * (3 - 2 * t);

function dibujarFlor(g, f, w, h, t) {
  const x = f.x * w;
  const y = f.y * h;
  const s = f.escala * Math.min(w, h) * 0.075;
  /* Vaivén lentísimo, como de aire quieto. Cada flor con su propia fase. */
  const mecer = Math.sin(t * 0.0004 + f.x * 9) * 0.05;

  g.save();
  g.translate(x, y);
  g.rotate(f.giro + mecer);

  /* Tallo: una curva, no una línea recta. */
  g.beginPath();
  g.moveTo(0, s * 0.6);
  g.quadraticCurveTo(s * 0.35, s * 2.4, s * 0.1, s * 4.6);
  g.strokeStyle = "rgba(203,220,242,0.16)";
  g.lineWidth = Math.max(1.2, s * 0.075);
  g.stroke();

  /* Dos hojas lanceoladas. */
  for (const [dy, lado] of [[s * 1.9, 1], [s * 3.1, -1]]) {
    g.beginPath();
    g.ellipse(lado * s * 0.5, dy, s * 0.62, s * 0.2, lado * 0.5, 0, Math.PI * 2);
    g.fillStyle = "rgba(42,157,143,0.13)";
    g.fill();
  }

  /* Corola: cinco pétalos abiertos. */
  const petalos = 5;
  for (let i = 0; i < petalos; i++) {
    const a = (i / petalos) * Math.PI * 2 + mecer * 2;
    g.save();
    g.rotate(a);
    const grad = g.createLinearGradient(0, 0, 0, -s * 1.15);
    grad.addColorStop(0, f.tono + "20");
    grad.addColorStop(0.55, f.tono + "6e");
    grad.addColorStop(1, f.tono + "12");
    g.beginPath();
    g.ellipse(0, -s * 0.62, s * 0.3, s * 0.62, 0, 0, Math.PI * 2);
    g.fillStyle = grad;
    g.fill();
    g.restore();
  }

  /* Centro, con un halo tenue que le da profundidad a la corola. */
  const halo = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.55);
  halo.addColorStop(0, "rgba(248,249,250,0.5)");
  halo.addColorStop(1, "rgba(248,249,250,0)");
  g.beginPath();
  g.arc(0, 0, s * 0.55, 0, Math.PI * 2);
  g.fillStyle = halo;
  g.fill();

  g.restore();
}

/*
 * El colibrí. `dir` es 1 mirando a la derecha y -1 a la izquierda; `inclina` lo
 * ladea hacia donde viaja; `libando` mete el pico y abre la cola.
 */
function dibujarColibri(g, x, y, escala, dir, inclina, libando, t) {
  const s = escala;

  g.save();
  g.translate(x, y);
  g.rotate(inclina);
  g.scale(dir, 1);

  /* ---------- alas: el huso borroso, no un ala dibujada ---------- */
  const barrido = 0.34 + Math.sin(t * 0.02) * 0.06;
  for (let i = 0; i < 5; i++) {
    const k = i / 4;
    const ang = lerp(-barrido, barrido, k) - 0.15;
    g.save();
    g.translate(-s * 0.1, -s * 0.05);
    g.rotate(ang);
    g.beginPath();
    g.ellipse(-s * 0.95, 0, s * 1.0, s * 0.19, 0, 0, Math.PI * 2);
    /* Los extremos del barrido pesan menos: así el borrón tiene volumen. */
    g.fillStyle = `rgba(203,220,242,${0.07 + 0.075 * Math.sin(k * Math.PI)})`;
    g.fill();
    g.restore();
  }

  /* ---------- cola ---------- */
  const abanico = libando ? 0.32 : 0.14;
  for (let i = -2; i <= 2; i++) {
    g.save();
    g.rotate(i * abanico * 0.5);
    g.beginPath();
    g.ellipse(-s * 1.35, 0, s * 0.5, s * 0.075, 0, 0, Math.PI * 2);
    g.fillStyle = "rgba(203,220,242,0.3)";
    g.fill();
    g.restore();
  }

  /* ---------- cuerpo: el dorso lleva la iridiscencia teal→coral ---------- */
  const cuerpo = g.createLinearGradient(-s * 0.9, -s * 0.3, s * 0.6, s * 0.3);
  cuerpo.addColorStop(0, TEAL);
  cuerpo.addColorStop(0.55, "#3f7d86");
  cuerpo.addColorStop(1, "#2b4a63");
  g.beginPath();
  g.ellipse(-s * 0.15, 0, s * 0.82, s * 0.36, 0, 0, Math.PI * 2);
  g.fillStyle = cuerpo;
  g.fill();

  /* Garganta: el destello coral que un colibrí enseña al girar. */
  const gorguera = g.createRadialGradient(s * 0.42, s * 0.1, 0, s * 0.42, s * 0.1, s * 0.36);
  const brillo = 0.45 + 0.3 * Math.sin(t * 0.0012);
  gorguera.addColorStop(0, `rgba(231,111,81,${brillo})`);
  gorguera.addColorStop(1, "rgba(231,111,81,0)");
  g.beginPath();
  g.ellipse(s * 0.42, s * 0.1, s * 0.36, s * 0.26, 0, 0, Math.PI * 2);
  g.fillStyle = gorguera;
  g.fill();

  /* ---------- cabeza y pico ---------- */
  g.beginPath();
  g.arc(s * 0.62, -s * 0.1, s * 0.29, 0, Math.PI * 2);
  g.fillStyle = "#2f5a6b";
  g.fill();

  g.beginPath();
  g.arc(s * 0.72, -s * 0.16, s * 0.055, 0, Math.PI * 2);
  g.fillStyle = "rgba(14,27,46,0.9)";
  g.fill();

  g.beginPath();
  g.moveTo(s * 0.86, -s * 0.12);
  g.lineTo(s * 1.95, -s * 0.02);
  g.lineTo(s * 0.86, s * 0.02);
  g.closePath();
  g.fillStyle = "rgba(203,220,242,0.72)";
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
    let flores = FLORES_ANCHO;

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flores = isNarrowViewport() ? FLORES_ANGOSTO : FLORES_ANCHO;
    };

    /*
     * El recorrido: de flor en flor, en orden, sin repetir la anterior. Cada
     * visita son dos tramos —viaje y libado— y el ciclo no se reinicia nunca,
     * así que no hay costura visible.
     */
    const VIAJE = 5200;
    const LIBAR = 4200;
    const CICLO = VIAJE + LIBAR;

    const posicionColibri = (t) => {
      const n = flores.length;
      const paso = Math.floor(t / CICLO);
      const fase = (t % CICLO) / CICLO;
      const desde = flores[paso % n];
      const hasta = flores[(paso + 1) % n];

      /* Punto de libado: justo al lado de la corola, a la altura del pico. */
      const puntoDe = (f) => ({
        x: f.x * w - (f.x > 0.5 ? 1 : -1) * Math.min(w, h) * 0.075,
        y: f.y * h - Math.min(w, h) * 0.012,
      });
      const a = puntoDe(desde);
      const b = puntoDe(hasta);

      const tViaje = VIAJE / CICLO;
      let x;
      let y;
      let libando = false;
      let avance = 0;

      if (fase < tViaje) {
        const k = suave(fase / tViaje);
        /* Bézier con un control alto: el colibrí sube antes de cruzar. */
        const cx = (a.x + b.x) / 2;
        const cy = Math.min(a.y, b.y) - h * 0.075;
        const u = 1 - k;
        x = u * u * a.x + 2 * u * k * cx + k * k * b.x;
        y = u * u * a.y + 2 * u * k * cy + k * k * b.y;
        avance = (b.x - a.x) * 0.001;
      } else {
        libando = true;
        const k = (fase - tViaje) / (1 - tViaje);
        /* Se acerca, bebe y se separa: un solo gesto de ida y vuelta. */
        const entrada = Math.sin(Math.min(1, k * 1.35) * Math.PI) * Math.min(w, h) * 0.022;
        const dir = hasta.x > 0.5 ? 1 : -1;
        x = b.x + dir * entrada;
        y = b.y;
      }

      /* Vuelo estacionario: dos senos de periodo distinto, nunca se repiten igual. */
      x += Math.sin(t * 0.0011) * 3.5;
      y += Math.sin(t * 0.0017 + 1.1) * 4.5 + Math.sin(t * 0.0006) * 2;

      const mira = libando ? (hasta.x > 0.5 ? 1 : -1) : b.x >= a.x ? 1 : -1;
      const inclina = libando ? Math.sin(t * 0.0009) * 0.05 : Math.max(-0.3, Math.min(0.3, avance)) * -mira;

      return { x, y, mira, inclina, libando };
    };

    const pintar = (t) => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      /* Un rescoldo cálido abajo, para que el navy no quede plano. */
      const suelo = ctx.createRadialGradient(w * 0.5, h * 1.02, 0, w * 0.5, h * 1.02, h * 0.72);
      suelo.addColorStop(0, "rgba(42,157,143,0.11)");
      suelo.addColorStop(1, "rgba(42,157,143,0)");
      ctx.fillStyle = suelo;
      ctx.fillRect(0, 0, w, h);

      for (const f of flores) dibujarFlor(ctx, f, w, h, t);

      const p = posicionColibri(t);
      dibujarColibri(ctx, p.x, p.y, Math.min(w, h) * 0.052, p.mira, p.inclina, p.libando, t);
    };

    medir();

    if (quieto) {
      /*
       * Gama baja o movimiento reducido: un solo fotograma, con el colibrí ya
       * libando en la primera flor. No se pide requestAnimationFrame ni una vez.
       */
      pintar(VIAJE + LIBAR * 0.5);
      onResize = () => { medir(); pintar(VIAJE + LIBAR * 0.5); };
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
