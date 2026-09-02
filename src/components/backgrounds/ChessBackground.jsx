import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildPieceGeometries, buildBoardTexture, buildGlowTexture } from "./chessPieces.js";
import { detectQualityTier, QUALITY } from "../../utils/device.js";
import chessFallback from "../../assets/chess-fallback.jpg";

/*
 * Fondo de Pensamiento Estratégico: una partida en curso sobre un tablero 3D.
 *
 * Todo es geometría generada por código (ver chessPieces.js) para no cargar
 * modelos pesados. La secuencia de jugadas es fija —no hay reglas de ajedrez—
 * y al terminar el tablero vuelve a la posición inicial con un fundido, así que
 * el bucle no tiene un salto visible.
 *
 * En gama baja, con prefers-reduced-motion o sin WebGL se muestra una imagen
 * estática y no se inicializa nada de Three.js.
 */

const BG = 0x0e1b2e;
const TEAL = 0x2a9d8f;

/* Ritmo de cada media jugada, en segundos. */
const TELEGRAPH = 0.55;  // la pieza se ilumina antes de salir
const TRAVEL = 1.45;     // desplazamiento
const REST = 0.8;        // pausa antes de la siguiente
const STEP = TELEGRAPH + TRAVEL + REST;
const FADE = 0.7;        // fundido de reinicio del bucle

/* Apertura italiana: doce medias jugadas, sin capturas. */
const MOVES = [
  "e2e4", "e7e5",
  "g1f3", "b8c6",
  "f1c4", "f8c5",
  "d2d3", "d7d6",
  "c1g5", "c8g4",
  "b1c3", "g8f6",
];

const SEQ_END = MOVES.length * STEP;
const LOOP = SEQ_END + FADE * 2;

/* Posición inicial: fila trasera + peones, para blancas y negras. */
const BACK_RANK = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

const squareToFileRank = (sq) => [sq.charCodeAt(0) - 97, Number(sq[1]) - 1];
const fileRankToPos = (f, r) => ({ x: -3.5 + f, z: 3.5 - r });
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function ChessBackground() {
  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  /* El nivel de calidad se decide una sola vez, antes de tocar Three.js. */
  const [quality] = useState(() => detectQualityTier({ needsWebGL: true }));
  /* Medidor opcional: abrir la página con ?perf=1 para leer fps en un equipo real. */
  const [showHud] = useState(() => new URLSearchParams(window.location.search).has("perf"));
  const isStatic = quality.tier === QUALITY.STATIC;

  useEffect(() => {
    if (isStatic) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const narrow = quality.tier === QUALITY.MOBILE;
    const disposables = [];
    let raf = 0;

    /* ---------- renderer ---------- */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !narrow,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // exposición contenida: es un fondo, no debe competir con el texto de encima
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 16, 42);  // los bordes del tablero se funden con la página

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);

    /* ---------- luces ---------- */
    // cielo frío / rebote cálido: da volumen sin aplanar la madera
    const hemi = new THREE.HemisphereLight(0xbfd4f2, 0x2a1f16, 1.1);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff0dc, 2.6);
    key.position.set(5.5, 8.5, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(narrow ? 512 : 1024, narrow ? 512 : 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 26;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.035;   // evita el acné de sombra en las superficies torneadas
    scene.add(key);

    // relleno frío desde el lado opuesto: separa las piezas oscuras del fondo
    const fill = new THREE.DirectionalLight(0x9cc0ff, 0.55);
    fill.position.set(-6, 4, -5);
    scene.add(fill);

    /* ---------- tablero ---------- */
    const boardTex = buildBoardTexture();
    disposables.push(boardTex);

    const sideMat = new THREE.MeshStandardMaterial({ color: 0x8b6a45, roughness: 0.7 });
    const topMat = new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.5 });
    disposables.push(sideMat, topMat);

    const slabGeo = new THREE.BoxGeometry(8, 0.35, 8);
    disposables.push(slabGeo);
    // orden de materiales de BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
    const slab = new THREE.Mesh(slabGeo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
    slab.position.y = -0.175;
    slab.receiveShadow = true;
    scene.add(slab);

    const frameGeo = new THREE.BoxGeometry(9.3, 0.3, 9.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x5c4430, roughness: 0.65 });
    disposables.push(frameGeo, frameMat);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -0.3;
    frame.receiveShadow = true;
    scene.add(frame);

    /* ---------- piezas ---------- */
    const geos = buildPieceGeometries(narrow ? 12 : 18);
    Object.values(geos).forEach((g) => disposables.push(g));

    // maderas cálidas: el bando claro es arce tostado, no blanco
    const lightWood = { color: 0xd6bc93, roughness: 0.5 };
    const darkWood = { color: 0x463122, roughness: 0.55 };

    const pieces = [];   // { mesh, file, rank, mat, type }
    const bySquare = new Map();

    const addPiece = (type, file, rank, white) => {
      const mat = new THREE.MeshStandardMaterial(white ? lightWood : darkWood);
      mat.emissive = new THREE.Color(TEAL);
      mat.emissiveIntensity = 0;
      disposables.push(mat);

      const mesh = new THREE.Mesh(geos[type], mat);
      const { x, z } = fileRankToPos(file, rank);
      mesh.position.set(x, 0, z);
      // los caballos miran al rival
      if (type === "knight") mesh.rotation.y = white ? 0 : Math.PI;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const p = { mesh, type, file, rank, mat, home: { file, rank } };
      pieces.push(p);
      bySquare.set(`${file},${rank}`, p);
    };

    for (let f = 0; f < 8; f++) {
      addPiece(BACK_RANK[f], f, 0, true);
      addPiece("pawn", f, 1, true);
      addPiece("pawn", f, 6, false);
      addPiece(BACK_RANK[f], f, 7, false);
    }

    /* ---------- halo de la casilla de destino ---------- */
    const glowTex = buildGlowTexture();
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowGeo = new THREE.PlaneGeometry(1.5, 1.5);
    disposables.push(glowTex, glowMat, glowGeo);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.012;
    scene.add(glow);

    /* ---------- resolución de la secuencia ---------- */
    /*
     * Cada jugada se resuelve una sola vez contra la posición inicial, para saber
     * qué pieza se mueve sin recalcularlo en cada fotograma.
     */
    const plan = [];
    {
      const occ = new Map();
      pieces.forEach((p) => occ.set(`${p.home.file},${p.home.rank}`, p));
      for (const mv of MOVES) {
        const [ff, fr] = squareToFileRank(mv.slice(0, 2));
        const [tf, tr] = squareToFileRank(mv.slice(2, 4));
        const piece = occ.get(`${ff},${fr}`);
        if (!piece) continue;
        occ.delete(`${ff},${fr}`);
        occ.set(`${tf},${tr}`, piece);
        plan.push({ piece, from: fileRankToPos(ff, fr), to: fileRankToPos(tf, tr) });
      }
    }

    const resetBoard = () => {
      for (const p of pieces) {
        const { x, z } = fileRankToPos(p.home.file, p.home.rank);
        p.mesh.position.set(x, 0, z);
        p.mat.emissiveIntensity = 0;
      }
      glowMat.opacity = 0;
    };

    /* ---------- bucle ---------- */
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const applyState = (elapsed) => {
      // fase de reinicio: fundido a negro, se recolocan las piezas, fundido de vuelta
      if (elapsed >= SEQ_END) {
        const f = elapsed - SEQ_END;
        canvas.style.opacity = f < FADE ? String(1 - f / FADE) : String((f - FADE) / FADE);
        if (f >= FADE) resetBoard();
        return;
      }
      canvas.style.opacity = "1";

      const index = Math.floor(elapsed / STEP);
      const local = elapsed - index * STEP;

      for (const p of pieces) p.mat.emissiveIntensity = 0;
      glowMat.opacity = 0;

      // las jugadas ya completadas se dejan en su destino
      for (let i = 0; i < index && i < plan.length; i++) {
        const m = plan[i];
        m.piece.mesh.position.set(m.to.x, 0, m.to.z);
      }
      if (index >= plan.length) return;

      const move = plan[index];
      const lift = move.piece.type === "knight" ? 0.85 : 0.22;

      if (local < TELEGRAPH) {
        // aún quieta, pero encendida: se anuncia el movimiento
        const k = local / TELEGRAPH;
        move.piece.mesh.position.set(move.from.x, 0, move.from.z);
        move.piece.mat.emissiveIntensity = 0.5 * k;
        glow.position.set(move.to.x, 0.012, move.to.z);
        glowMat.opacity = 0.55 * k;
      } else if (local < TELEGRAPH + TRAVEL) {
        const k = (local - TELEGRAPH) / TRAVEL;
        const e = easeInOut(k);
        move.piece.mesh.position.set(
          move.from.x + (move.to.x - move.from.x) * e,
          Math.sin(Math.PI * k) * lift,
          move.from.z + (move.to.z - move.from.z) * e
        );
        move.piece.mat.emissiveIntensity = 0.5;
        glow.position.set(move.to.x, 0.012, move.to.z);
        glowMat.opacity = 0.55;
      } else {
        // ya llegó: el brillo se apaga durante la pausa
        const k = Math.min((local - TELEGRAPH - TRAVEL) / 0.45, 1);
        move.piece.mesh.position.set(move.to.x, 0, move.to.z);
        move.piece.mat.emissiveIntensity = 0.5 * (1 - k);
        glow.position.set(move.to.x, 0.012, move.to.z);
        glowMat.opacity = 0.55 * (1 - k);
      }
    };

    const placeCamera = (t) => {
      // órbita lenta y continua: una vuelta completa cada ~2 minutos
      const a = t * 0.052;
      const radius = 14.5;
      camera.position.set(
        Math.cos(a) * radius,
        10.5 + Math.sin(t * 0.075) * 0.9,
        Math.sin(a) * radius
      );
      camera.lookAt(0, 0.35, 0);

      /*
       * La luz principal acompaña a la cámara con un desfase fijo. Si se dejara
       * quieta, media vuelta de la órbita mostraría el tablero a contraluz;
       * así el volumen y las sombras se leen igual de bien en todo el giro.
       */
      key.position.set(Math.cos(a + 0.85) * 9, 9.5, Math.sin(a + 0.85) * 9);
      fill.position.set(Math.cos(a - 2.1) * 8, 4.5, Math.sin(a - 2.1) * 8);
    };

    const minFrameMs = narrow ? 33 : 0;   // 30 fps en móvil, libre en escritorio
    let last = -1e9;
    const t0 = performance.now();

    // contador de fps para el medidor opcional (?perf=1)
    let frames = 0;
    let fpsWindowStart = t0;
    let fpsMin = Infinity;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < minFrameMs) return;
      last = now;
      const t = (now - t0) / 1000;
      placeCamera(t);
      applyState(t % LOOP);
      renderer.render(scene, camera);

      if (hudRef.current) {
        frames++;
        const span = now - fpsWindowStart;
        if (span >= 1000) {
          const fps = Math.round((frames * 1000) / span);
          fpsMin = Math.min(fpsMin, fps);
          hudRef.current.textContent =
            `${quality.tier} · ${fps} fps (mín ${fpsMin}) · ${Math.round(t % LOOP)}s/${Math.round(LOOP)}s · ${quality.reason}`;
          frames = 0;
          fpsWindowStart = now;
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      scene.traverse((o) => { if (o.isMesh) o.geometry = null; });
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
    };
  }, [isStatic, quality]);

  /* Medidor de rendimiento, solo con ?perf=1. Nunca se monta en uso normal. */
  const hud = showHud ? (
    <div
      style={{
        position: "fixed",
        left: 8,
        bottom: 8,
        zIndex: 50,
        padding: "6px 10px",
        borderRadius: 8,
        background: "rgba(10,20,34,0.82)",
        border: "1px solid rgba(248,249,250,0.2)",
        color: "#EAF1FB",
        font: "12px/1.4 monospace",
        pointerEvents: "none",
      }}
    >
      <span ref={hudRef}>{`${quality.tier} · ${quality.reason}`}</span>
    </div>
  ) : null;

  if (isStatic) {
    return (
      <>
        <img
          src={chessFallback}
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            zIndex: 0,
          }}
        />
        {hud}
      </>
    );
  }

  return (
    <>
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
        /*
         * Sin transition de CSS a propósito: el fundido del reinicio lo escribe
         * el bucle en cada fotograma. Una transición encima iría con retraso y
         * el tablero se recolocaría cuando el canvas todavía es visible, que es
         * justo el parpadeo que el fundido pretende esconder.
         */
      }}
    />
    {hud}
    </>
  );
}
