import { useEffect, useRef } from "react";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { FAE } from "../../theme.js";
import { VERTICES, ARISTAS, CARAS, aristasReveladas, carasVisibles, proyectar, riqueza } from "../../racha/teseracto.js";
import { prefersReducedMotion, isLowEndDevice } from "../../utils/device.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TESERACTO, EN VIVO.
 *
 * Three.js, como el tablero de ajedrez, y no un video: la figura es distinta
 * cada día. Todo se recalcula en cada fotograma a partir de los 16 vértices —
 * rotación en 4D, proyección a 3D— así que dibujar una arista a medias es solo
 * mover su extremo.
 *
 *   Aristas  dos capas aditivas por arista: un halo ancho y tenue y un núcleo
 *            fino. El brillo de cada una depende de su profundidad en w, así
 *            que cada arista tiene el suyo y cambia al girar.
 *   Vértices un punto luminoso en cada intersección ya revelada.
 *   Caras    las que tienen sus cuatro aristas, con degradado navy → teal
 *            según la profundidad.
 *   Giro     continuo, con arranque suave: la velocidad entra con easing, no
 *            de golpe. Los planos xw y zw son los que cruzan el cubo interior
 *            con el exterior.
 *
 * GAMA BAJA: sin antialias, pixelRatio 1 y tope de 30 fps. Con «reducir
 * movimiento», un solo fotograma quieto con la figura completa del día. Sin
 * WebGL, avisa con `onSinWebGL` y quien lo usa sigue sin la figura.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TEAL = new THREE.Color(FAE.teal);
const NAVY = new THREE.Color(FAE.navy);
const BLANCO = new THREE.Color("#EAF7F5");
const ESCALA = 3.1;

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function texturaBrillo() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.25, "rgba(220,250,245,0.85)");
  r.addColorStop(0.6, "rgba(42,157,143,0.25)");
  r.addColorStop(1, "rgba(42,157,143,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/**
 * @param {object}  p
 * @param {number}  p.dia            la racha que se enseña
 * @param {boolean} [p.trazarNuevas] dibujar las aristas nuevas de hoy
 * @param {number}  [p.inicioTrazoMs]
 * @param {number}  [p.msPorArista]
 * @param {Function}[p.onSinWebGL]
 */
export default function Teseracto({ dia, trazarNuevas = false, inicioTrazoMs = 450, msPorArista = 900, onSinWebGL }) {
  const lienzo = useRef(null);

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return undefined;

    const quieto = prefersReducedMotion();
    const bajo = isLowEndDevice();
    const total = aristasReveladas(dia);
    const antes = trazarNuevas && !quieto ? aristasReveladas(dia - 1) : total;
    const rico = riqueza(dia);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !bajo, alpha: true, powerPreference: "low-power" });
    } catch {
      onSinWebGL?.();
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, bajo ? 1 : 2));
    renderer.setClearColor(0x000000, 0);

    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camara.position.set(0, 0, 7.2);
    const grupo = new THREE.Group();
    escena.add(grupo);
    const desechables = [];

    /* ── aristas: halo y núcleo ── */
    const posiciones = new Float32Array(ARISTAS.length * 6);
    const colores = new Float32Array(ARISTAS.length * 6);
    const capa = (ancho, opacidad) => {
      const geo = new LineSegmentsGeometry();
      geo.setPositions(posiciones);
      geo.setColors(colores);
      const mat = new LineMaterial({
        linewidth: ancho, vertexColors: true, transparent: true, opacity: opacidad,
        blending: THREE.AdditiveBlending, depthWrite: false, worldUnits: false,
      });
      const linea = new LineSegments2(geo, mat);
      grupo.add(linea);
      desechables.push(geo, mat);
      return { geo, mat };
    };
    const halo = capa(bajo ? 6 : 9, 0.2 + rico * 0.16);
    const nucleo = capa(2.2, 0.95);

    /* ── vértices ── */
    const geoPuntos = new THREE.BufferGeometry();
    const posPuntos = new Float32Array(16 * 3);
    const colPuntos = new Float32Array(16 * 3);
    geoPuntos.setAttribute("position", new THREE.BufferAttribute(posPuntos, 3));
    geoPuntos.setAttribute("color", new THREE.BufferAttribute(colPuntos, 3));
    const textura = texturaBrillo();
    const matPuntos = new THREE.PointsMaterial({
      size: 0.34 * (1 + rico * 0.55), map: textura, vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    grupo.add(new THREE.Points(geoPuntos, matPuntos));
    desechables.push(geoPuntos, matPuntos, textura);

    /* ── caras ── */
    const geoCaras = new THREE.BufferGeometry();
    const posCaras = new Float32Array(16 * 3);
    const colCaras = new Float32Array(16 * 3);
    geoCaras.setAttribute("position", new THREE.BufferAttribute(posCaras, 3));
    geoCaras.setAttribute("color", new THREE.BufferAttribute(colCaras, 3));
    const indicesDe = (caras) => caras.flatMap(([a, b, c, d]) => [a, b, c, a, c, d]);
    geoCaras.setIndex(indicesDe(carasVisibles(antes)));
    const matCaras = new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.12 + rico * 0.06, side: THREE.DoubleSide, depthWrite: false,
    });
    grupo.add(new THREE.Mesh(geoCaras, matCaras));
    desechables.push(geoCaras, matCaras);

    /* ── tamaño ── */
    const ajustar = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camara.aspect = width / height;
      camara.updateProjectionMatrix();
      halo.mat.resolution.set(width, height);
      nucleo.mat.resolution.set(width, height);
    };
    ajustar();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(ajustar) : null;
    ro?.observe(canvas);

    /* ── un fotograma ── */
    const proyectados = VERTICES.map(() => [0, 0, 0, 0]);
    let fase = 0;
    let carasPuestas = antes;
    const t0 = performance.now();
    let anterior = t0;

    const pintar = (ahora) => {
      const ms = ahora - t0;
      const dt = Math.min(0.05, (ahora - anterior) / 1000);
      anterior = ahora;

      /* La velocidad entra con easing en el primer segundo y medio; completa, gira un poco más ancho. */
      const velocidad = quieto ? 0 : easeOut(Math.min(1, ms / 1500)) * (1 + rico * 0.2);
      fase += dt * velocidad;
      const axw = 0.6 + fase * 0.42;
      const azw = 0.3 + fase * 0.27 + Math.sin(fase * 0.35) * 0.25;
      grupo.rotation.y = 0.5 + fase * 0.16;
      grupo.rotation.x = 0.38 + Math.sin(fase * 0.23) * 0.12;

      for (let i = 0; i < 16; i++) {
        const p = proyectar(VERTICES[i], axw, azw);
        proyectados[i] = p;
        posPuntos[i * 3] = p[0] * ESCALA;
        posPuntos[i * 3 + 1] = p[1] * ESCALA;
        posPuntos[i * 3 + 2] = p[2] * ESCALA;
        posCaras[i * 3] = p[0] * ESCALA;
        posCaras[i * 3 + 1] = p[1] * ESCALA;
        posCaras[i * 3 + 2] = p[2] * ESCALA;
        /* Degradado de las caras: navy en lo lejano, teal en lo cercano. */
        const cerca = (p[3] + 1) / 2;
        const c = NAVY.clone().lerp(TEAL, 0.05 + cerca * 0.95);
        colCaras[i * 3] = c.r; colCaras[i * 3 + 1] = c.g; colCaras[i * 3 + 2] = c.b;
      }

      /* Cuánto lleva trazado cada arista nueva. */
      const trazo = (k) => {
        if (k < antes) return 1;
        const desde = inicioTrazoMs + (k - antes) * msPorArista;
        return easeInOut(Math.max(0, Math.min(1, (ms - desde) / msPorArista)));
      };

      const visibles = new Set();
      let n = 0;
      for (let k = 0; k < total; k++) {
        const t = trazo(k);
        if (t <= 0) continue;
        const [a, b] = ARISTAS[k];
        const pa = proyectados[a], pb = proyectados[b];
        const o = n * 6;
        posiciones[o] = pa[0] * ESCALA; posiciones[o + 1] = pa[1] * ESCALA; posiciones[o + 2] = pa[2] * ESCALA;
        posiciones[o + 3] = (pa[0] + (pb[0] - pa[0]) * t) * ESCALA;
        posiciones[o + 4] = (pa[1] + (pb[1] - pa[1]) * t) * ESCALA;
        posiciones[o + 5] = (pa[2] + (pb[2] - pa[2]) * t) * ESCALA;
        /* El brillo propio: más cerca en w, más luz; la nueva, encendida mientras se traza. */
        const cerca = ((pa[3] + pb[3]) / 2 + 1) / 2;
        const destello = k >= antes && t < 1 ? 0.6 * Math.sin(Math.PI * t) : 0;
        const luz = Math.min(1.4, 0.45 + cerca * 0.55 + rico * 0.25 + destello);
        const col = TEAL.clone().lerp(BLANCO, Math.min(1, 0.2 + destello + rico * 0.2)).multiplyScalar(luz);
        colores.set([col.r, col.g, col.b, col.r, col.g, col.b], o);
        visibles.add(a);
        if (t >= 1) visibles.add(b);
        n++;
      }
      for (const capaLinea of [halo, nucleo]) {
        const inicio = capaLinea.geo.attributes.instanceStart.data;
        inicio.array.set(posiciones);
        inicio.needsUpdate = true;
        const color = capaLinea.geo.attributes.instanceColorStart.data;
        color.array.set(colores);
        color.needsUpdate = true;
        capaLinea.geo.instanceCount = n;
      }

      const latido = rico ? 0.12 * Math.sin(ms / 520) : 0;
      for (let i = 0; i < 16; i++) {
        const on = visibles.has(i) ? 0.75 + ((proyectados[i][3] + 1) / 2) * 0.35 + rico * 0.3 + latido : 0;
        colPuntos[i * 3] = on; colPuntos[i * 3 + 1] = on; colPuntos[i * 3 + 2] = on;
        /*
         * Un vértice sin arista no se pinta en negro: con el lienzo transparente,
         * «color cero» se veía como un punto oscuro. Se saca del encuadre.
         */
        if (!visibles.has(i)) posPuntos[i * 3 + 2] = -1000;
      }
      geoPuntos.attributes.position.needsUpdate = true;
      geoPuntos.attributes.color.needsUpdate = true;
      geoCaras.attributes.position.needsUpdate = true;
      geoCaras.attributes.color.needsUpdate = true;

      /* Las caras de las aristas nuevas entran cuando terminan de trazarse. */
      if (carasPuestas < total && trazo(total - 1) >= 1) {
        geoCaras.setIndex(indicesDe(carasVisibles(total)));
        carasPuestas = total;
      }

      renderer.render(escena, camara);
    };

    let raf = 0;
    let ultimo = 0;
    const bucle = (ahora) => {
      raf = requestAnimationFrame(bucle);
      if (bajo && ahora - ultimo < 1000 / 30) return;
      ultimo = ahora;
      pintar(ahora);
    };
    if (quieto) pintar(t0 + 10000);
    else raf = requestAnimationFrame(bucle);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      desechables.forEach((d) => d.dispose?.());
      renderer.dispose();
    };
  }, [dia, trazarNuevas, inicioTrazoMs, msPorArista]);

  return <canvas ref={lienzo} data-teseracto={dia} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%" }} />;
}
