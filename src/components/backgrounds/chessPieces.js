import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
 * Geometría de las piezas, generada por código — nada de modelos 3D importados.
 * Las piezas de ajedrez reales se tornean, así que un LatheGeometry sobre un
 * perfil 2D da la silueta correcta con muy pocos triángulos. El caballo, que no
 * es una pieza torneada, se extruye desde una silueta plana.
 *
 * Todas las geometrías quedan con su base en y = 0 para apoyarlas sobre el tablero.
 */

const v2 = (pairs) => pairs.map(([r, y]) => new THREE.Vector2(r, y));

/* Perfiles (radio, altura). Una casilla mide 1 unidad. */
const PROFILES = {
  pawn: [
    [0, 0], [0.30, 0], [0.32, 0.045], [0.27, 0.085], [0.19, 0.125],
    [0.135, 0.20], [0.128, 0.285], [0.185, 0.325], [0.125, 0.355],
    [0.15, 0.40], [0.185, 0.455], [0.17, 0.515], [0.105, 0.56], [0, 0.585],
  ],
  rook: [
    [0, 0], [0.33, 0], [0.35, 0.05], [0.29, 0.10], [0.235, 0.145],
    [0.215, 0.42], [0.25, 0.455], [0.285, 0.50], [0.30, 0.56],
    [0.235, 0.56], [0.235, 0.60], [0.30, 0.60], [0.30, 0.625], [0, 0.625],
  ],
  bishop: [
    [0, 0], [0.31, 0], [0.33, 0.045], [0.28, 0.09], [0.19, 0.13],
    [0.145, 0.26], [0.14, 0.34], [0.205, 0.375], [0.135, 0.41],
    [0.175, 0.47], [0.165, 0.56], [0.115, 0.635], [0.055, 0.68],
    [0.085, 0.705], [0.05, 0.745], [0, 0.775],
  ],
  queen: [
    [0, 0], [0.35, 0], [0.37, 0.05], [0.31, 0.10], [0.21, 0.15],
    [0.16, 0.30], [0.155, 0.42], [0.225, 0.46], [0.15, 0.50],
    [0.19, 0.58], [0.235, 0.66], [0.20, 0.70], [0.235, 0.735], [0.12, 0.78], [0, 0.80],
  ],
  king: [
    [0, 0], [0.36, 0], [0.38, 0.05], [0.32, 0.10], [0.22, 0.15],
    [0.165, 0.32], [0.16, 0.45], [0.23, 0.49], [0.155, 0.53],
    [0.195, 0.62], [0.235, 0.71], [0.20, 0.755], [0.16, 0.79], [0, 0.80],
  ],
  knightBase: [
    [0, 0], [0.33, 0], [0.35, 0.05], [0.29, 0.10], [0.22, 0.145],
    [0.20, 0.22], [0.215, 0.26], [0, 0.27],
  ],
};

/* Silueta de cabeza de caballo, extruida para dar volumen. */
function knightHeadShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.17, 0.00);
  s.lineTo(-0.20, 0.16);
  s.lineTo(-0.14, 0.30);
  s.lineTo(-0.15, 0.44);
  s.lineTo(-0.07, 0.52);
  s.lineTo(-0.02, 0.62);
  s.lineTo(0.04, 0.50);
  s.lineTo(0.14, 0.46);
  s.lineTo(0.21, 0.34);
  s.lineTo(0.23, 0.22);
  s.lineTo(0.15, 0.17);
  s.lineTo(0.06, 0.20);
  s.lineTo(0.02, 0.10);
  s.lineTo(0.14, 0.02);
  s.lineTo(0.17, 0.00);
  s.closePath();
  return s;
}

/*
 * mergeGeometries exige que todas las partes coincidan en atributos e indexado.
 * LatheGeometry viene indexada y ExtrudeGeometry no, así que se pasa todo a
 * no indexado antes de unir.
 */
function merge(parts) {
  const flat = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  const merged = mergeGeometries(flat, false);
  flat.forEach((g, i) => { if (g !== parts[i]) g.dispose(); });
  parts.forEach((g) => g.dispose());
  merged.computeVertexNormals();
  return merged;
}

export function buildPieceGeometries(segments = 16) {
  const lathe = (key) => new THREE.LatheGeometry(v2(PROFILES[key]), segments);

  const pawn = lathe("pawn");
  const rook = lathe("rook");
  const bishop = lathe("bishop");

  // Reina: cuerpo torneado + corona de esferas + remate
  const queenParts = [lathe("queen")];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bead = new THREE.SphereGeometry(0.055, 8, 6);
    bead.translate(Math.cos(a) * 0.20, 0.775, Math.sin(a) * 0.20);
    queenParts.push(bead);
  }
  const finial = new THREE.SphereGeometry(0.062, 10, 8);
  finial.translate(0, 0.845, 0);
  queenParts.push(finial);
  const queen = merge(queenParts);

  // Rey: cuerpo torneado + cruz
  const kingParts = [lathe("king")];
  const crossV = new THREE.BoxGeometry(0.055, 0.20, 0.055);
  crossV.translate(0, 0.89, 0);
  const crossH = new THREE.BoxGeometry(0.155, 0.055, 0.055);
  crossH.translate(0, 0.925, 0);
  kingParts.push(crossV, crossH);
  const king = merge(kingParts);

  // Caballo: base torneada + cabeza extruida, mirando hacia -Z
  const head = new THREE.ExtrudeGeometry(knightHeadShape(), {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.022,
    bevelSegments: 2,
    curveSegments: 3,
  });
  head.rotateY(Math.PI / 2);       // la silueta mira a lo largo de -Z
  head.translate(0.09, 0.20, 0);
  const knight = merge([lathe("knightBase"), head]);

  return { pawn, rook, knight, bishop, queen, king };
}

/* Textura de tablero generada en un canvas: una sola llamada de dibujo para las 64 casillas. */
export function buildBoardTexture(light = "#C5A375", dark = "#67472C") {
  const px = 512;
  const cell = px / 8;
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d");

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      g.fillStyle = (r + f) % 2 === 0 ? dark : light;
      g.fillRect(f * cell, r * cell, cell, cell);
    }
  }

  /*
   * Veta en dos capas. Primero trazos cortos por casilla —no líneas que crucen
   * el tablero entero, que se leerían como rayas de contrachapado—, y encima
   * grano fino por píxel para quitarle el aspecto plano.
   */
  g.globalAlpha = 0.035;
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * px;
    const x0 = Math.random() * px;
    const len = cell * (0.5 + Math.random() * 1.1);
    g.strokeStyle = Math.random() > 0.5 ? "#000" : "#fff";
    g.lineWidth = 0.4 + Math.random() * 0.9;
    g.beginPath();
    g.moveTo(x0, y);
    g.quadraticCurveTo(x0 + len * 0.5, y + (Math.random() - 0.5) * 3, x0 + len, y);
    g.stroke();
  }
  g.globalAlpha = 1;

  const img = g.getImageData(0, 0, px, px);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* Halo radial usado para marcar la casilla de destino. */
export function buildGlowTexture(rgb = "42,157,143") {
  const px = 128;
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
  grad.addColorStop(0, `rgba(${rgb},0.95)`);
  grad.addColorStop(0.45, `rgba(${rgb},0.38)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, px, px);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
