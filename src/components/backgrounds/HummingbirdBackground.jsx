import { useEffect, useRef } from "react";
import { shouldRenderStatic, isNarrowViewport } from "../../utils/device.js";

/*
 * Fondo de la portada: un colibrí formado por partículas, libando de una flor.
 *
 * TERCERA TÉCNICA, y la que funcionó. Las dos anteriores dibujaban la silueta a
 * mano —primero con detalle realista, después limpia— y las dos se leían como
 * insecto. El problema no era el esfuerzo: acertar una silueta orgánica a base
 * de curvas escritas a ciegas es difícil, y cada iteración costaba un ciclo
 * entero de revisión.
 *
 * Aquí la técnica cambia y se apoya en algo que el sitio ya hacía bien: nubes
 * de partículas, como el fondo de nodos. La forma se define UNA vez como
 * máscara, se muestrean sus píxeles, y las partículas se reparten por ellos. Eso
 * separa dos problemas que antes iban juntos —definir la forma y dibujarla
 * bien—, y permite verificar la silueta contra un fondo limpio antes de animar
 * nada.
 *
 * LA SILUETA, contra la lista de rasgos que la separan de un insecto:
 *
 *   · Pico largo, fino y curvado, del DOBLE de largo que la cabeza. Es el rasgo
 *     que decide, y en los dos intentos anteriores iba corto.
 *   · Cuerpo compacto en gota, nunca alargado ni segmentado.
 *   · DOS alas, una por lado, y deliberadamente ASIMÉTRICAS: una dominante
 *     hacia atrás y arriba, la otra corta y asomando. Dos alas planas y
 *     simétricas saliendo a los lados son la firma de una libélula, que es
 *     justo lo que salió antes.
 *   · Cola en abanico corto con muesca, nunca larga y fina.
 *   · Postura de vuelo estacionario: cuerpo en diagonal casi vertical, cabeza
 *     arriba y cola apuntando abajo. Ningún insecto común se coloca así, y esa
 *     postura sola ya empuja la lectura hacia el lado correcto.
 */

const BG = "#0E1B2E";
const CLARO = "#CBDCF2";
const CORAL = "#E76F51";
const TEAL = "#2A9D8F";

const FPS = 30;

/*
 * La máscara, en un lienzo de 100×100. No se dibuja nunca en pantalla: solo se
 * leen sus píxeles para saber dónde va cada partícula.
 */
/*
 * Se exporta para poder verificarla en aislado: la silueta de producción y la
 * que se revisa tienen que ser literalmente la misma función, no una copia que
 * se pueda desincronizar.
 */
export function mascaraColibri(g) {
  /* Ala dominante: media luna ancha hacia atrás y arriba. */
  g.beginPath();
  g.moveTo(53, 45);
  g.bezierCurveTo(43, 27, 28, 13, 10, 14);
  g.bezierCurveTo(19, 26, 31, 39, 46, 53);
  g.closePath();
  g.fill();

  /* Ala secundaria: corta y pegada al cuerpo. Solo asoma, no compite. */
  g.beginPath();
  g.moveTo(51, 49);
  g.bezierCurveTo(43, 45, 34, 44, 27, 47);
  g.bezierCurveTo(35, 50, 44, 53, 50, 55);
  g.closePath();
  g.fill();

  /*
   * Cola: abanico ANCHO y corto, hacia abajo, con la muesca central.
   * En la verificación aislada salía estrecha y podía leerse como el abdomen
   * de un insecto; ensancharla es lo que la convierte en cola de pájaro.
   */
  g.beginPath();
  g.moveTo(41, 62);
  g.lineTo(29, 87);
  g.lineTo(42, 78);
  g.lineTo(51, 89);
  g.lineTo(55, 66);
  g.closePath();
  g.fill();

  /* Cuerpo: gota compacta, eje de arriba-derecha a abajo-izquierda. */
  g.beginPath();
  g.ellipse(50, 52, 14, 11, 2.0, 0, Math.PI * 2);
  g.fill();

  /* Cabeza. */
  g.beginPath();
  g.arc(60, 33, 9, 0, Math.PI * 2);
  g.fill();

  /* Pico: 34 unidades de largo contra 18 de cabeza. */
  g.beginPath();
  g.moveTo(68, 28);
  g.bezierCurveTo(79, 22, 89, 15, 97, 10);
  g.bezierCurveTo(90, 18, 80, 25, 69, 30);
  g.closePath();
  g.fill();
}

/* Flor: más pequeña y menos densa, para que no dispute el protagonismo. */
function mascaraFlor(g) {
  g.beginPath();
  g.moveTo(50, 56);
  g.quadraticCurveTo(56, 76, 52, 98);
  g.lineTo(46, 98);
  g.quadraticCurveTo(50, 76, 44, 56);
  g.closePath();
  g.fill();

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.save();
    g.translate(48, 46);
    g.rotate(a);
    g.beginPath();
    g.ellipse(0, -22, 10, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.beginPath();
  g.arc(48, 46, 9, 0, Math.PI * 2);
  g.fill();
}

/* Puntos de una máscara, submuestreados hasta la cantidad de partículas pedida. */
function puntosDe(dibujar, cuantos) {
  const off = document.createElement("canvas");
  off.width = off.height = 100;
  const g = off.getContext("2d", { willReadFrequently: true });
  g.fillStyle = "#fff";
  dibujar(g);
  const d = g.getImageData(0, 0, 100, 100).data;

  const todos = [];
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      if (d[(y * 100 + x) * 4 + 3] > 128) todos.push([x, y]);
    }
  }
  const paso = Math.max(1, Math.floor(todos.length / cuantos));
  const elegidos = [];
  for (let i = 0; i < todos.length; i += paso) elegidos.push(todos[i]);
  return elegidos;
}

/* Sprite de partícula, pre-renderizado igual que en el fondo de nodos. */
function sprite(color) {
  const s = 32;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, color + "ff");
  grad.addColorStop(0.35, color + "aa");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
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
    const angosto = isNarrowViewport();

    const sprites = { base: sprite(CLARO), coral: sprite(CORAL), teal: sprite(TEAL) };

    /*
     * Semilla fija: el fotograma estático de gama baja tiene que salir siempre
     * igual, y la nube no debe recolocarse al redimensionar.
     */
    let semilla = 20260902;
    const rnd = () => (semilla = (semilla * 1664525 + 1013904223) % 4294967296) / 4294967296;

    const construir = (dibujar, cuantos, esColibri) =>
      puntosDe(dibujar, cuantos).map(([x, y]) => {
        /*
         * La zona del ala se mueve mucho más que el resto: es lo que sugiere el
         * aleteo sin animar un batido, que a 30 fps se vería de dibujo animado.
         */
        const enAla = esColibri && x < 48 && y < 56;
        const r = rnd();
        return {
          x, y,
          amp: enAla ? 1.1 + r * 1.6 : 0.25 + r * 0.4,
          vel: enAla ? 0.006 + r * 0.005 : 0.0011 + r * 0.0012,
          fase: r * Math.PI * 2,
          /* Acentos escasos: coral en la garganta, teal repartido. */
          sp: esColibri && x > 54 && y > 30 && y < 44 && r > 0.55 ? sprites.coral
            : r > 0.9 ? sprites.teal
            : sprites.base,
          tam: enAla ? 5 + r * 2 : 4.5 + r * 2.5,
        };
      });

    const colibri = construir(mascaraColibri, angosto ? 260 : 380, true);
    const flor = construir(mascaraFlor, angosto ? 60 : 80, false);

    let w = 0;
    let h = 0;

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /*
     * Composición. Medidas reales de la portada: el titular ocupa la franja
     * 0,26–0,42 del alto y las tarjetas 0,50–0,73, de 0,12 a 0,88 de ancho. La
     * única banda de verdad libre es la inferior derecha, y ahí va la escena.
     */
    const nube = (lista, cx, cy, escala, t) => {
      for (const p of lista) {
        const d = Math.sin(t * p.vel + p.fase) * p.amp;
        const px = cx + (p.x - 50 + d) * escala;
        const py = cy + (p.y - 50 + d * 0.5) * escala;
        const s = p.tam * escala * 0.5;
        ctx.drawImage(p.sp, px - s, py - s, s * 2, s * 2);
      }
    };

    const pintar = (t) => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const base = Math.min(w, h);

      /*
       * Dónde cabe, medido y no a ojo. En pantalla ancha las tarjetas solo
       * llegan hasta el 80% del ancho: la COLUMNA DERECHA está libre de arriba
       * abajo, y ahí el colibrí cabe grande sin tapar nada. En pantalla
       * angosta las tarjetas ocupan todo el ancho, así que el único hueco es la
       * banda de abajo y la escena baja allí, más pequeña.
       */
      /*
       * Medido en 1280×800 y en 390×844:
       *
       *   ancho    las tarjetas llegan al 80% del ancho → la columna derecha
       *            está libre de arriba abajo y ahí cabe grande.
       *   angosto  las tarjetas ocupan del 6% al 94% y bajan hasta el 80% del
       *            alto; solo quedan 120 px libres debajo y 24 px al lado. La
       *            escena baja ahí entera y más pequeña: es lo único que cabe
       *            sin que una tarjeta la corte por la mitad.
       */
      const escala = angosto ? w * 0.0049 : Math.min(w * 0.0021, h * 0.0034);

      const cx = angosto ? w * 0.68 : w * 0.885;
      const cy = angosto ? h * 0.905 : h * 0.5;

      /* Deriva lentísima: la nube nunca queda del todo quieta. */
      const dx = Math.sin(t * 0.00022) * base * 0.01;
      const dy = Math.sin(t * 0.00031) * base * 0.008;

      /* La flor, debajo del colibrí y en su misma columna. */
      /* La flor, a un lado del colibrí y en su misma zona libre. */
      nube(
        flor,
        cx + (angosto ? -w * 0.42 : w * 0.005),
        cy + (angosto ? h * 0.02 : h * 0.29),
        escala * 0.62,
        t
      );
      nube(colibri, cx + dx, cy + dy, escala, t);
    };

    medir();

    if (quieto) {
      /* Gama baja: un fotograma y ni una llamada a requestAnimationFrame. */
      pintar(0);
      onResize = () => { medir(); pintar(0); };
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
