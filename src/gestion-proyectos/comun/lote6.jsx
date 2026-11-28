/*
 * GESTIÓN DE PROYECTOS · PIEZAS COMUNES DE LAS ESCENAS DEL LOTE 6 (caps. 11 y 12).
 *
 * La hoja del lote 5 (y con ella la del 4, el 3 y el 2) más lo propio de estos
 * capítulos: una rejilla de casillas (la bandeja de cata de 5 × 5, la ventana
 * del tanque de 3 × 3), la curva S del tablero de Galton con un cursor que se
 * arrastra (el % se lee donde se pone, no antes), el silo de la reserva con su
 * línea, las boyas de la ruta del contenedor y la disposición «rollos» (los
 * siete contratos en 4 + 3 a 320 px, diseño c12 H02).
 *
 * Regla de los lotes 5 y 6: ninguna lámina muestra la respuesta de un paso
 * antes de que el estudiante la dé (lo que aún no se resolvió va en «?»).
 */
import { useState } from "react";
import { CSS_LOTE5 } from "./lote5.jsx";
import { Grafica, miles } from "./lote4.jsx";

export { BarraH, Lamina, resuelto, destinoDe, puntos } from "./lote5.jsx";
export { Barras, Grafica, miles, coma } from "./lote4.jsx";

export const CSS_LOTE6 = `${CSS_LOTE5}
.gp6-rejilla { display: grid; gap: 3px; grid-template-columns: auto repeat(var(--gp6-cols, 5), minmax(0, 1fr)); align-items: stretch; font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.gp6-rejilla > span { display: grid; place-items: center; min-height: 34px; padding: 2px; border-radius: 6px; text-align: center; overflow-wrap: anywhere; }
.gp6-rejilla > .gp6-celda { background: rgba(244,245,247,.08); border: 1px solid rgba(244,245,247,.22); }
.gp6-rejilla > .gp6-celda[data-lleno="1"] { background: #fbf7ee; color: #121418; border-color: #fbf7ee; font-family: var(--planck-font-mono, ui-monospace, monospace); font-weight: 800; }
.gp6-rejilla > .gp6-eje { color: #b6bbc5; font-family: var(--planck-font-mono, ui-monospace, monospace); }
.gp6-cursor { display: grid; grid-template-columns: 48px minmax(0, 1fr) 48px; gap: 6px; align-items: center; margin-top: 6px; }
.gp6-cursor input[type="range"] { width: 100%; min-height: 44px; accent-color: var(--gp-acento, #a7bbff); }
.gp6-cursor button { min-width: 48px; min-height: 48px; border-radius: 10px; border: 2px solid rgba(244,245,247,.55); background: rgba(31,50,80,.92); color: #f4f5f7; font: 800 18px/1 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.gp6-lectura { margin: 4px 0 0; text-align: center; font: 800 16px/1.3 var(--planck-font-mono, ui-monospace, monospace); }
.gp6-silo { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 10px; align-items: end; }
.gp6-silo-tubo { position: relative; height: 150px; border-radius: 40px 40px 8px 8px; border: 2px solid #f4f5f7; background: rgba(8,16,30,.8); overflow: hidden; }
.gp6-silo-tubo > b { position: absolute; left: 0; right: 0; bottom: 0; height: 100%; transform-origin: 50% 100%; background: repeating-linear-gradient(135deg, #b07a3c 0 6px, #8a5a2b 6px 12px); transition: transform 620ms cubic-bezier(.2,.8,.2,1); }
.gp6-silo-tubo > s { position: absolute; left: -2px; right: -2px; height: 0; border-top: 3px dashed #f4f5f7; }
.gp6-silo-cifra { font: 800 22px/1.2 var(--planck-font-mono, ui-monospace, monospace); }
.gp6-boyas { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: 6px; }
.gp6-boya { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #f4f5f7; font: 800 12px/1 var(--planck-font-mono, ui-monospace, monospace); color: #f4f5f7; background: rgba(8,16,30,.8); }
.gp6-boya[data-on="1"] { background: #ffc978; color: #121418; }
.gp6-boya[data-on="1"]::after { content: ""; }
.gp-marca[data-apuesta="1"]::before { content: "● "; }
.gp-destinos[data-disposicion="rollos"] { --gp-cols: 4; }
.gp-destinos[data-disposicion="rollos"] .gp-destino { min-height: 52px; padding: 6px 2px; font-size: 14px; }
.gp-destinos[data-disposicion="rollos"] .gp-destino-txt { hyphens: none; -webkit-hyphens: none; overflow-wrap: normal; white-space: nowrap; }
.gp-destinos[data-disposicion="cinco"] { --gp-cols: 5; }
.gp-destinos[data-disposicion="cinco"] .gp-destino { min-height: 64px; padding: 6px 2px; }
.gp-destinos[data-disposicion="cinco"] .gp-destino-txt { font-size: 12px; hyphens: none; -webkit-hyphens: none; overflow-wrap: anywhere; }
.gp-visual[data-visual="cata"] .gp-opcion, .gp-visual[data-visual="cerradura"] .gp-opcion { position: relative; padding: 6px 2px; }
.gp-visual[data-visual="cata"] .gp-opcion[aria-pressed="true"]::before { position: absolute; top: 1px; left: 3px; font-size: 9px; }
.gp-visual[data-visual="cerradura"] .gp-casillas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gp-visual[data-visual="cerradura"] .gp-casillas > :last-child { grid-column: 1 / -1; }
.gp-visual[data-visual="cerradura"] .gp-casilla { padding: 6px; }
.gp-visual[data-visual="cerradura"] .gp-casilla .gp-opciones { --gp-cols: 2; }
@media (prefers-reduced-motion: reduce) { .gp6-silo-tubo > b { transition: none !important; } }
`;

export const EstiloLote6 = () => <style>{CSS_LOTE6}</style>;

/**
 * Una rejilla de casillas con su eje: filas de arriba abajo, columnas de izquierda a derecha.
 * `celda(fila, columna)` devuelve lo que va escrito (o null: casilla vacía).
 */
export function Rejilla({ filas, columnas, celda, nombre }) {
  return (
    <div className="gp6-rejilla" style={{ "--gp6-cols": columnas.length }} role="img" aria-label={nombre} data-rejilla={nombre}>
      <span className="gp6-eje" />
      {columnas.map((c) => <span key={`c${c.id}`} className="gp6-eje">{c.nombre}</span>)}
      {filas.map((f) => [
        <span key={`f${f.id}`} className="gp6-eje">{f.nombre}</span>,
        ...columnas.map((c) => {
          const v = celda(f.id, c.id);
          return <span key={`${f.id}-${c.id}`} className="gp6-celda" data-celda={`${f.id}-${c.id}`} data-lleno={v ? "1" : undefined}>{v ?? ""}</span>;
        }),
      ])}
    </div>
  );
}

/* La probabilidad acumulada de la curva en `x`, interpolando entre sus puntos. */
export function acumuladaEn(curva, x) {
  if (x <= curva[0][0]) return curva[0][1];
  for (let k = 1; k < curva.length; k += 1) {
    const [x0, y0] = curva[k - 1]; const [x1, y1] = curva[k];
    if (x <= x1) return Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
  }
  return curva.at(-1)[1];
}

/**
 * La curva S con el cursor vertical: el % se lee solo donde el estudiante lo
 * pone (empieza en el extremo izquierdo). Ejes sin cifras intermedias: leer es
 * la tarea.
 */
export function CurvaCursor({ curva, meta, paso = 50 }) {
  const x0 = curva[0][0]; const x1 = curva.at(-1)[0];
  const [x, setX] = useState(x0);
  const mover = (v) => setX(Math.max(x0, Math.min(x1, v)));
  const p = acumuladaEn(curva, x);
  const desde = (v) => v - x0;
  return (
    <div data-curva-cursor={x}>
      <Grafica
        titulo="Curva S del costo: probabilidad acumulada"
        xMax={x1 - x0} yMax={100}
        series={[{ id: "s", puntos: curva.map(([cx, cy]) => [desde(cx), cy]), color: "#ffc978" }]}
        marcas={[{ id: "cursor", x: desde(x), y: p, r: 6 }, { id: "meta", x: desde(meta), y: 0, r: 4, lleno: false, texto: "meta", dy: -8 }]}
        corte={desde(x)}
        etiquetasX={[]}
        etiquetasY={[]}
        alto={150}
      />
      <div className="gp6-cursor">
        <button type="button" aria-label="Cursor a la izquierda" onClick={() => mover(x - paso)} data-cursor-menos>◀</button>
        <input type="range" min={x0} max={x1} step={paso} value={x} onChange={(ev) => mover(Number(ev.target.value))} aria-label="Cursor sobre la curva" data-cursor />
        <button type="button" aria-label="Cursor a la derecha" onClick={() => mover(x + paso)} data-cursor-mas>▶</button>
      </div>
      <p className="gp6-lectura" data-lectura>Costo ≤ ${miles(x)} → {p} %</p>
    </div>
  );
}

/** El silo de la reserva: el nivel en vivo y la línea punteada del riesgo que queda. */
export function Silo({ valor, max, linea = null, texto = null }) {
  return (
    <div className="gp6-silo" data-silo={valor}>
      <div className="gp6-silo-tubo" aria-hidden="true">
        <b style={{ transform: `scaleY(${Math.max(0, Math.min(1, valor / max))})` }} />
        {linea != null && <s style={{ bottom: `${(linea / max) * 100}%` }} />}
      </div>
      <div>
        <small>Reserva para contingencias</small>
        <div className="gp6-silo-cifra" data-reserva>${miles(valor)}</div>
        {texto && <small>{texto}</small>}
      </div>
    </div>
  );
}

/** Las boyas numeradas: las primeras `encendidas` brillan. */
export function Boyas({ n = 10, encendidas = 0 }) {
  return (
    <div className="gp6-boyas" data-boyas={encendidas} aria-label={`${encendidas} de ${n} boyas encendidas`} role="img">
      {Array.from({ length: n }, (_, k) => <span key={k} className="gp6-boya" data-on={k < encendidas ? "1" : undefined}>{k + 1}</span>)}
    </div>
  );
}
