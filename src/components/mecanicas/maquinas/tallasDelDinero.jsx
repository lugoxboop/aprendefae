import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { Parte, Volante, CSS_MAQUINAS } from "./salaDeMaquinas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS TALLAS DEL DINERO — la escalera de liquidez, dentro de la Sala de Máquinas.
 *
 * Archivo nuevo. Usa Parte, Volante y CSS_MAQUINAS de salaDeMaquinas.jsx sin
 * tocarlo. Diseño: Watari (Célula C).
 *
 * POR QUÉ UNA ESCALERA DE MANO. Sus peldaños miden lo mismo. Así el dibujo no
 * dice nada del tamaño de cada agregado: el orden lo da la liquidez —abajo lo
 * más líquido, arriba lo menos— y no cuánta plata hay en cada uno.
 *
 * BASE Y M1 SE CRUZAN, NO SE CONTIENEN. M1 ⊂ M2 ⊂ M3 se escribe en el
 * peldaño («M1 + ahorro y CDT»). La base va aparte: comparte con M1 solo el
 * efectivo, que sale en los dos peldaños con el mismo trazo teal. La reserva
 * está solo en la base y la cuenta corriente solo en M1.
 *
 * DOS DIBUJOS, UNA ESCENA. Por debajo de 560 px de ancho de la caja se pinta
 * la escalera vertical (lienzo de 300); desde 560, la ancha (lienzo de 700),
 * pensada para el proyector. Se elige por el ancho de la caja, no de la
 * ventana. Las dos tienen las mismas partes con los mismos ids, y solo se
 * pinta una a la vez.
 *
 * LETRA. Lienzo de 300 con letra de 14: a 236 px de escena (teléfono de 320)
 * queda en 11,0 px, sobre el mínimo de 10,5 del sitio. Lienzo de 700 con
 * letra de 19: en un portátil de 1280 la escena mide 748 px y la letra 20,3.
 *
 * Sin cifras: nada de saldos ni tamaños. Sin coral: en Aprender no hay errores.
 * Teal para lo que crece; ámbar para lo que se achica, como en la sala.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LINEA = "rgba(248,249,250,0.72)";
const TENUE = "rgba(248,249,250,0.35)";
const TEXTO = "rgba(248,249,250,0.86)";
export const CORTE_ANCHO = 560;

/* Las dos geometrías. Todo lo que cambia entre teléfono y proyector vive aquí. */
const G = {
  angosta: {
    w: 300, h: 446, t: 14, tt: 15, lh: 17,
    rieles: [4, 206], peldano: { x: 10, w: 190, h: 66, tab: 40 },
    filas: { m3: 34, m2: 106, m1: 178, base: 250 },
    persona: { x: 262, y: 52, escala: 1.15 },
    cdt: { x: 240, y: 116, w: 42, h: 40 },
    billete: { x: 222, y: 192, w: 36, h: 22 },
    tarjeta: { x: 264, y: 191, w: 36, h: 24 },
    bancos: { x: 226, y: 272, w: 54, h: 34, rx: 253, ry: 328 },
    multi: { x: 214, de: 290, hasta: ["m1", "m2"], badge: { x: 214, y: 248 } },
    encaje: { x: 210, y: 352, w: 42, h: 34, rx: 231, ry: 404 },
    tasa: { cx: 280, cy: 370, r: 15, rx: 280, ry: 404, rAnchor: "middle", credito: [[278, 353], [266, 310]] },
    banrep: { x: 98, y: 370, w: 84, h: 36, rx: 140, ry: [422, 439] },
    pesos: { x: 140, de: 362, a: 320 },
    tes: { x: 26, y: 368, w: 40, h: 38, flecha: [70, 96, 388], oma: 424 },
    liquido: { menos: [10, 24, "start"], mas: [10, 342, "start"] },
    efectos: { base: [150, 344, "start"], multiplica: [226, 262, "start"], credito: [300, 438, "end"] },
  },
  ancha: {
    w: 700, h: 402, t: 19, tt: 20, lh: 22,
    rieles: [214, 474], peldano: { x: 220, w: 248, h: 76, tab: 62 },
    filas: { m3: 28, m2: 110, m1: 192, base: 274 },
    persona: { x: 66, y: 60, escala: 1.6 },
    cdt: { x: 116, y: 124, w: 56, h: 46 },
    billete: { x: 96, y: 212, w: 50, h: 28 },
    tarjeta: { x: 154, y: 210, w: 50, h: 32 },
    bancos: { x: 528, y: 270, w: 76, h: 44, rx: 566, ry: 338 },
    multi: { x: 490, de: 312, hasta: ["m1", "m2"], badge: { x: 496, y: 274 } },
    encaje: { x: 624, y: 276, w: 58, h: 42, rx: 653, ry: 338 },
    tasa: { cx: 596, cy: 140, r: 26, rx: 632, ry: 147, rAnchor: "start", credito: [[588, 168], [568, 264]] },
    banrep: { x: 76, y: 308, w: 104, h: 40, rx: 128, ry: [370, 394] },
    pesos: { horizontal: [184, 212] },
    tes: { x: 10, y: 306, w: 50, h: 42, flecha: [62, 72, 327], oma: 372 },
    liquido: { menos: [344, 20, "middle"], mas: [344, 376, "middle"] },
    efectos: { base: [204, 294, "end"], multiplica: [512, 238, "start"], credito: [596, 80, "middle"] },
  },
};

const LINEAS = {
  m3: [["M2"], ["+ bonos de bancos"], ["+ otros depósitos"]],
  m2: [["M1"], ["+ ahorro y CDT"]],
  m1: [["Efectivo", "efectivo"], ["+ cuenta corriente"]],
  base: [["Efectivo", "efectivo"], ["+ reserva bancaria"]],
};
const NOMBRE = { m3: "M3", m2: "M2", m1: "M1", base: "Base" };

function Texto({ g, x, y, children, anchor = "start", peso = 400, color = TEXTO, tam }) {
  return (
    <text x={x} y={y} textAnchor={anchor}
      style={{ fontFamily: peso >= 700 ? "Sora, Inter, sans-serif" : "Inter, sans-serif", fontSize: `${tam ?? g.t}px`, fontWeight: peso, fill: color }}>
      {children}
    </text>
  );
}

function Peldano({ g, id }) {
  const p = g.peldano;
  const y = g.filas[id];
  const lineas = LINEAS[id];
  return (
    <g>
      <rect x={p.x} y={y} width={p.w} height={p.h} rx="8" fill="rgba(14,27,46,0.9)" stroke={LINEA} strokeWidth="2" />
      <line x1={p.x + p.tab} y1={y + 8} x2={p.x + p.tab} y2={y + p.h - 8} stroke={TENUE} strokeWidth="1.5" />
      <Texto g={g} x={p.x + p.tab / 2} y={y + 8 + g.lh - 4} anchor="middle" peso={700} tam={g.tt} color={FAE.text}>{NOMBRE[id]}</Texto>
      {lineas.map(([txt, marca], k) => (
        <Texto key={k} g={g} x={p.x + p.tab + 8} y={y + 8 + g.lh * (k + 1) - 4}
          color={marca === "efectivo" ? FAE.teal : TEXTO} peso={marca === "efectivo" ? 600 : 400}>{txt}</Texto>
      ))}
    </g>
  );
}

function Edificio({ x, y, ancho, alto, cupula = false }) {
  const cols = 4;
  return (
    <g fill="none" stroke={LINEA} strokeWidth="2" strokeLinejoin="round">
      {cupula
        ? <path d={`M${x + ancho * 0.25} ${y} A${ancho * 0.25} ${ancho * 0.2} 0 0 1 ${x + ancho * 0.75} ${y}`} />
        : <path d={`M${x} ${y} L${x + ancho / 2} ${y - ancho * 0.16} L${x + ancho} ${y} Z`} />}
      <rect x={x} y={y} width={ancho} height={alto} rx="2" />
      {Array.from({ length: cols }, (_, k) => {
        const cx = x + (ancho / (cols + 1)) * (k + 1);
        return <line key={k} x1={cx} y1={y + 6} x2={cx} y2={y + alto - 6} />;
      })}
    </g>
  );
}

const Flecha = ({ d, color = LINEA, ancho = 2.2 }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" />
);
/* Punta de flecha en (x, y) apuntando hacia `dir`: "izq", "der", "arr", "aba". */
function Punta({ x, y, dir, color = LINEA, t = 6 }) {
  const d = {
    izq: `M${x + t} ${y - t} L${x} ${y} L${x + t} ${y + t}`,
    der: `M${x - t} ${y - t} L${x} ${y} L${x - t} ${y + t}`,
    arr: `M${x - t} ${y + t} L${x} ${y} L${x + t} ${y + t}`,
    aba: `M${x - t} ${y - t} L${x} ${y} L${x + t} ${y - t}`,
  }[dir];
  return <Flecha d={d} color={color} />;
}

/* Un efecto de la exploración: texto corto junto a lo que reacciona primero. */
function Efecto({ g, donde, signo, children }) {
  if (!signo) return null;
  const [x, y, anchor] = g.efectos[donde];
  return (
    <Texto g={g} x={x} y={y} anchor={anchor} peso={700}
      color={signo > 0 ? FAE.teal : FAE.ambar}>
      <tspan data-efecto={donde}>{children}</tspan>
    </Texto>
  );
}

function Dibujo({ g, resaltar, efecto }) {
  const { peldano: p } = g;
  const centroFila = (id) => g.filas[id] + p.h / 2;
  const derecha = p.x + p.w + (g.rieles[1] - (p.x + p.w)); // riel derecho
  const etiquetaEfecto = {
    base: efecto.base > 0 ? "Crece" : "Se achica",
    multiplica: efecto.multiplica > 0 ? "× más" : "× menos",
    credito: efecto.credito > 0 ? "Más crédito" : "Menos crédito",
  };
  return (
    <>
      {/* Los rieles y el eje de liquidez no son partes: no se apagan. */}
      <g aria-hidden="true">
        {g.rieles.map((x) => (
          <line key={x} x1={x} y1={g.filas.m3 - 6} x2={x} y2={g.filas.base + p.h + 6} stroke={TENUE} strokeWidth="3" strokeLinecap="round" />
        ))}
        <Texto g={g} x={g.liquido.menos[0]} y={g.liquido.menos[1]} anchor={g.liquido.menos[2]} color="rgba(248,249,250,0.62)">▲ Menos líquido</Texto>
        <Texto g={g} x={g.liquido.mas[0]} y={g.liquido.mas[1]} anchor={g.liquido.mas[2]} color="rgba(248,249,250,0.62)">▼ Más líquido</Texto>
      </g>

      {["m3", "m2", "m1", "base"].map((id) => (
        <Parte key={id} id={id} resaltar={resaltar}><Peldano g={g} id={id} /></Parte>
      ))}

      <Parte id="persona" resaltar={resaltar}>
        <g fill={LINEA}>
          <circle cx={g.persona.x} cy={g.persona.y - 10 * g.persona.escala} r={6 * g.persona.escala} />
          <path d={`M${g.persona.x - 11 * g.persona.escala} ${g.persona.y + 12 * g.persona.escala} C${g.persona.x - 11 * g.persona.escala} ${g.persona.y - 2 * g.persona.escala}, ${g.persona.x + 11 * g.persona.escala} ${g.persona.y - 2 * g.persona.escala}, ${g.persona.x + 11 * g.persona.escala} ${g.persona.y + 12 * g.persona.escala} Z`} />
        </g>
        {/* Billetes del bolsillo */}
        <rect x={g.billete.x} y={g.billete.y} width={g.billete.w} height={g.billete.h} rx="3" fill="none" stroke={FAE.teal} strokeWidth="2" />
        <circle cx={g.billete.x + g.billete.w / 2} cy={g.billete.y + g.billete.h / 2} r={g.billete.h * 0.24} fill="none" stroke={FAE.teal} strokeWidth="1.8" />
        {/* Tarjeta de la cuenta corriente */}
        <rect x={g.tarjeta.x} y={g.tarjeta.y} width={g.tarjeta.w} height={g.tarjeta.h} rx="4" fill="none" stroke={LINEA} strokeWidth="2" />
        <line x1={g.tarjeta.x} y1={g.tarjeta.y + g.tarjeta.h * 0.32} x2={g.tarjeta.x + g.tarjeta.w} y2={g.tarjeta.y + g.tarjeta.h * 0.32} stroke={LINEA} strokeWidth="3" />
        {/* El CDT: un papel con su nombre */}
        <path d={`M${g.cdt.x} ${g.cdt.y} H${g.cdt.x + g.cdt.w - 10} L${g.cdt.x + g.cdt.w} ${g.cdt.y + 10} V${g.cdt.y + g.cdt.h} H${g.cdt.x} Z`} fill="none" stroke={LINEA} strokeWidth="2" strokeLinejoin="round" />
        <Texto g={g} x={g.cdt.x + g.cdt.w / 2} y={g.cdt.y + g.cdt.h / 2 + g.t * 0.36 + 2} anchor="middle" peso={700}>CDT</Texto>
      </Parte>

      <Parte id="bancos" resaltar={resaltar}>
        <Edificio x={g.bancos.x} y={g.bancos.y} ancho={g.bancos.w} alto={g.bancos.h} />
        <Texto g={g} x={g.bancos.rx} y={g.bancos.ry} anchor="middle">Bancos</Texto>
        {/* La multiplicación: de la base a los bancos, y de los bancos a M1 y M2 */}
        <Flecha d={`M${derecha + 2} ${g.multi.de} H${g.bancos.x - 4}`} />
        <Punta x={g.bancos.x - 4} y={g.multi.de} dir="der" />
        <Flecha d={`M${g.bancos.x + 6} ${g.bancos.y - 4} Q${g.multi.x} ${g.bancos.y - 4} ${g.multi.x} ${centroFila("m1") + 12} V${centroFila("m2")}`} />
        {g.multi.hasta.map((id) => (
          <g key={id}>
            <Flecha d={`M${g.multi.x} ${centroFila(id)} H${derecha + 4}`} />
            <Punta x={derecha + 4} y={centroFila(id)} dir="izq" />
          </g>
        ))}
        <circle cx={g.multi.badge.x} cy={g.multi.badge.y} r={g.t * 0.72} fill={FAE.bg} stroke={FAE.teal} strokeWidth="2" />
        <Texto g={g} x={g.multi.badge.x} y={g.multi.badge.y + g.t * 0.36} anchor="middle" peso={700} color={FAE.teal}>×</Texto>
      </Parte>

      <Parte id="encaje" resaltar={resaltar}>
        <rect x={g.encaje.x} y={g.encaje.y} width={g.encaje.w} height={g.encaje.h} rx="5" fill="none" stroke={LINEA} strokeWidth="2" />
        <circle cx={g.encaje.x + g.encaje.w / 2} cy={g.encaje.y + g.encaje.h / 2} r={g.encaje.h * 0.24} fill="none" stroke={LINEA} strokeWidth="2" />
        <line x1={g.encaje.x + g.encaje.w / 2} y1={g.encaje.y + g.encaje.h / 2} x2={g.encaje.x + g.encaje.w / 2 + g.encaje.h * 0.24} y2={g.encaje.y + g.encaje.h / 2} stroke={LINEA} strokeWidth="2" />
        <Texto g={g} x={g.encaje.rx} y={g.encaje.ry} anchor="middle">Encaje</Texto>
      </Parte>

      <Parte id="tasa" resaltar={resaltar}>
        <Volante cx={g.tasa.cx} cy={g.tasa.cy} r={g.tasa.r} giro={resaltar.includes("tasa") ? 45 * (efecto.credito ? -efecto.credito : 1) : 0} />
        <Texto g={g} x={g.tasa.rx} y={g.tasa.ry} anchor={g.tasa.rAnchor}>Tasa</Texto>
        {/* La correa del crédito: de la tasa a lo que se pide prestado en los bancos */}
        <Flecha d={`M${g.tasa.credito[0][0]} ${g.tasa.credito[0][1]} L${g.tasa.credito[1][0]} ${g.tasa.credito[1][1]}`} color={FAE.teal} />
        <Punta x={g.tasa.credito[1][0]} y={g.tasa.credito[1][1]} dir={g === G.ancha ? "aba" : "arr"} color={FAE.teal} />
      </Parte>

      <Parte id="banco-republica" resaltar={resaltar}>
        <Edificio x={g.banrep.x} y={g.banrep.y} ancho={g.banrep.w} alto={g.banrep.h} cupula />
        <Texto g={g} x={g.banrep.rx} y={g.banrep.ry[0]} anchor="middle">Banco de la</Texto>
        <Texto g={g} x={g.banrep.rx} y={g.banrep.ry[1]} anchor="middle">República</Texto>
        {/* Los pesos nuevos entran a la base */}
        {g.pesos.horizontal
          ? <><Flecha d={`M${g.pesos.horizontal[0]} ${g.filas.base + p.h / 2 + 14} H${g.pesos.horizontal[1]}`} color={FAE.teal} /><Punta x={g.pesos.horizontal[1]} y={g.filas.base + p.h / 2 + 14} dir="der" color={FAE.teal} /></>
          : <><Flecha d={`M${g.pesos.x} ${g.pesos.de} V${g.pesos.a}`} color={FAE.teal} /><Punta x={g.pesos.x} y={g.pesos.a} dir="arr" color={FAE.teal} /></>}
      </Parte>

      <Parte id="tes" resaltar={resaltar}>
        <path d={`M${g.tes.x} ${g.tes.y} H${g.tes.x + g.tes.w - 10} L${g.tes.x + g.tes.w} ${g.tes.y + 10} V${g.tes.y + g.tes.h} H${g.tes.x} Z`} fill="none" stroke={LINEA} strokeWidth="2" strokeLinejoin="round" />
        <Texto g={g} x={g.tes.x + g.tes.w / 2} y={g.tes.y + g.tes.h / 2 + g.t * 0.36 + 2} anchor="middle" peso={700}>TES</Texto>
        {/* La compra de TES es una operación de mercado abierto: el rótulo la ata a la OMA de la sala */}
        <Texto g={g} x={g.tes.x + g.tes.w / 2} y={g.tes.oma} anchor="middle" color="rgba(248,249,250,0.62)">OMA</Texto>
        {/* El Banco compra los TES: el papel va hacia el Banco */}
        <Flecha d={`M${g.tes.flecha[0]} ${g.tes.flecha[2]} H${g.tes.flecha[1]}`} />
        <Punta x={g.tes.flecha[1]} y={g.tes.flecha[2]} dir="der" />
      </Parte>

      <Efecto g={g} donde="base" signo={efecto.base}>{etiquetaEfecto.base}</Efecto>
      <Efecto g={g} donde="multiplica" signo={efecto.multiplica}>{etiquetaEfecto.multiplica}</Efecto>
      <Efecto g={g} donde="credito" signo={efecto.credito}>{etiquetaEfecto.credito}</Efecto>
    </>
  );
}

/* El ancho de la caja, sin leer la ventana. En pruebas (sin ResizeObserver) queda en 0: escalera angosta. */
function useAnchoCaja(ref) {
  const [ancho, setAncho] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return ancho;
}

export function EscenaTallas({ resaltar = [], efecto = {} }) {
  const caja = useRef(null);
  const ancho = useAnchoCaja(caja);
  const g = ancho >= CORTE_ANCHO ? G.ancha : G.angosta;
  return (
    <div ref={caja}>
      <svg viewBox={`0 0 ${g.w} ${g.h}`} data-forma={g === G.ancha ? "ancha" : "angosta"} role="img"
        aria-label="La escalera de liquidez: abajo la base monetaria, encima M1, M2 y M3. El Banco de la República al pie, con los TES; los bancos multiplican la base hacia M1 y M2, con el encaje y la tasa; y una persona con billetes, una cuenta corriente y un CDT"
        style={{ width: "100%", display: "block" }}>
        <style>{CSS_MAQUINAS}</style>
        <Dibujo g={g} resaltar={resaltar} efecto={efecto} />
      </svg>
    </div>
  );
}

/* ═══════════════ CAPA 3 · LAS TRES PALANCAS ═══════════════
 *
 * Una palanca a la vez: la pregunta es qué reacciona PRIMERO. Cada palanca
 * enciende su instrumento y el punto de la escalera donde pega:
 *   TES     → la base (el Banco paga con pesos nuevos o los recoge). La compra y la
 *             venta de TES son operaciones de mercado abierto (OMA), el mismo
 *             instrumento de la escena de los instrumentos: no es una palanca nueva.
 *   encaje  → cuánto se multiplica la base hacia M1 y M2 (los bancos)
 *   tasa    → cuánto crédito se pide (la correa del crédito)
 * Sin cifras: el dibujo dice hacia dónde, no cuánto.
 *
 * [ESCRITO POR CLAUDE, NO POR LA FICHA]: los nombres de las palancas, las seis
 * frases de reacción (INFLESZ 75,6 a 99,4, medido con npm run inflesz) y los
 * rótulos de la escena (Menos líquido, Más líquido, Bancos, Encaje, Tasa, las
 * líneas de cada peldaño y los efectos Crece, Se achica, × más, × menos, Más
 * crédito, Menos crédito). Los rótulos tienen menos de 10 palabras: el canon
 * no les mide INFLESZ.
 */
export const PALANCAS = [
  { id: "tes", nombre: "Operaciones de Mercado Abierto", opciones: [["comprar", "Comprar TES"], ["vender", "Vender TES"]] },
  { id: "encaje", nombre: "Encaje", opciones: [["bajar", "Bajar"], ["subir", "Subir"]] },
  { id: "tasa", nombre: "Tasa de intervención", opciones: [["bajar", "Bajar"], ["subir", "Subir"]] },
];

export function reaccionTallas(sel) {
  if (!sel) return { resaltar: [], efecto: {}, texto: "Elija una palanca. Verá qué se mueve primero en la escalera." };
  const { palanca, v } = sel;
  if (palanca === "tes") {
    const s = v === "comprar" ? 1 : -1;
    return {
      resaltar: ["tes", "banco-republica", "base"], efecto: { base: s }, primero: "base",
      texto: s > 0
        ? "Primero se mueve la base. En una operación de mercado abierto, el Banco paga los TES con pesos nuevos, y la base crece."
        : "Primero se mueve la base. En una operación de mercado abierto, el Banco vende TES y recibe pesos. Los saca de circulación, y la base se achica.",
    };
  }
  if (palanca === "encaje") {
    const s = v === "bajar" ? 1 : -1;
    return {
      resaltar: ["encaje", "bancos"], efecto: { multiplica: s }, primero: "multiplica",
      texto: s > 0
        ? "Primero se mueve la multiplicación. Los bancos guardan menos de cada depósito. Prestan más, y la base se multiplica más."
        : "Primero se mueve la multiplicación. Los bancos guardan más de cada depósito. Prestan menos, y la base se multiplica menos.",
    };
  }
  const s = v === "bajar" ? 1 : -1;
  return {
    resaltar: ["tasa"], efecto: { credito: s }, primero: "credito",
    texto: s > 0
      ? "Primero se mueve el crédito. Los préstamos salen más baratos, y la gente pide más."
      : "Primero se mueve el crédito. Los préstamos salen más caros, y la gente pide menos.",
  };
}

const BOTON = (activo) => ({
  minHeight: "44px", padding: "10px 14px", borderRadius: "999px", cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
  background: activo ? "rgba(42,157,143,0.16)" : "transparent",
  border: `1px solid ${activo ? FAE.teal : "rgba(248,249,250,0.22)"}`,
  color: activo ? FAE.text : "rgba(248,249,250,0.78)",
});

export function ExploraTallas() {
  const [sel, setSel] = useState(null);
  const r = reaccionTallas(sel);
  return (
    <div>
      <div style={{ borderRadius: "14px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.1)", padding: "10px" }}>
        <EscenaTallas resaltar={r.resaltar} efecto={r.efecto} />
      </div>
      <div style={{ marginTop: "12px" }}>
        {PALANCAS.map((p) => (
          <fieldset key={p.id} style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, color: FAE.text, marginBottom: "7px" }}>{p.nombre}</legend>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {p.opciones.map(([v, etiqueta]) => {
                const activo = sel?.palanca === p.id && sel?.v === v;
                return (
                  <button key={v} type="button" aria-pressed={activo} onClick={() => setSel(activo ? null : { palanca: p.id, v })} style={BOTON(activo)}>
                    {etiqueta}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <p data-reaccion={r.primero ?? ""} role="status" style={{ margin: "4px 0 0", fontSize: "15px", lineHeight: 1.55, color: FAE.text }}>{r.texto}</p>
    </div>
  );
}
