import { C, INTER, MARCA } from "./comun.jsx";
import { INTERFAZ_R5_1 } from "../../data/repasoCap5Cruzado.js";

/*
 * La cabecera de las pantallas del repaso («PREGUNTA n DE m» y la silueta del
 * tema al 50 %) y la pista a pedido. Eran de RepasoCapitulo5View.jsx (r5-1
 * v2); salen aquí, sin cambios, para que r5-5 las use sin importar la vista
 * (que la importa a ella).
 */

/* ═══════════ LAS TRES SILUETAS (HTML/CSS a px reales, trazo de 2) ═══════════ */

const TRAZO = `2px solid ${C.hecho}`;
const caja = (estilo) => <span aria-hidden="true" style={{ position: "absolute", boxSizing: "border-box", ...estilo }} />;

/* Inversiones · el título valor. */
function TituloValor() {
  return (
    <span data-silueta="titulo-valor" style={{ position: "relative", display: "block", width: "168px", height: "44px", boxSizing: "border-box", border: TRAZO, borderRadius: "4px" }}>
      {/* La línea punteada del talón, en x = 44: puntos de 2, huecos de 4. */}
      {caja({ left: "42px", top: 0, width: "2px", height: "100%", backgroundImage: `repeating-linear-gradient(to bottom, ${C.hecho} 0 2px, transparent 2px 6px)` })}
      {[0, 1, 2].map((k) => caja({ left: "16px", top: `${7 + k * 10}px`, width: "6px", height: "6px", borderRadius: "50%", background: C.hecho }))}
      {caja({ left: "56px", top: "12px", width: "64px", height: "4px", background: C.hecho })}
      {caja({ left: "56px", top: "24px", width: "44px", height: "4px", background: C.hecho })}
      {caja({ right: "10px", top: "10px", width: "20px", height: "20px", borderRadius: "50%", border: TRAZO })}
    </span>
  );
}

/* El borde discontinuo de la cuarta factura: guiones de 4, huecos de 3. */
const discontinuo = (lado) => {
  const dir = lado === "top" || lado === "bottom" ? "to right" : "to bottom";
  return `repeating-linear-gradient(${dir}, ${C.hecho} 0 4px, transparent 4px 7px)`;
};

/* Cartera · las facturas. */
function Facturas() {
  return (
    <span data-silueta="facturas" style={{ display: "flex", gap: "10px" }}>
      {[0, 1, 2, 3].map((k) => {
        const ultima = k === 3;
        const barras = ultima ? 0.5 : 1;
        return (
          <span
            key={k}
            style={{
              position: "relative", display: "block", width: "30px", height: "44px", boxSizing: "border-box", borderRadius: "3px",
              ...(ultima
                ? {
                  backgroundImage: [discontinuo("top"), discontinuo("bottom"), discontinuo("left"), discontinuo("right")].join(", "),
                  backgroundSize: "100% 2px, 100% 2px, 2px 100%, 2px 100%",
                  backgroundPosition: "top left, bottom left, top left, top right",
                  backgroundRepeat: "no-repeat",
                }
                : { border: TRAZO }),
            }}
          >
            {caja({ left: "4px", top: "6px", width: "18px", height: "4px", background: C.hecho, opacity: barras })}
            {caja({ left: "4px", top: "14px", width: "12px", height: "4px", background: C.hecho, opacity: barras })}
            {caja({ left: "4px", bottom: "6px", width: "18px", height: "4px", background: C.hecho, opacity: barras })}
          </span>
        );
      })}
    </span>
  );
}

/* Inventarios · la bodega: repisas en y = 22 e y = 46, 7 cajas arriba y 5 abajo. */
function Bodega() {
  const fila = (n, abajo) => Array.from({ length: n }, (_, k) =>
    caja({ left: `${8 + k * 18}px`, top: `${abajo - 14}px`, width: "14px", height: "14px", borderRadius: "2px", background: C.hecho }));
  return (
    <span data-silueta="bodega" style={{ position: "relative", display: "block", width: "200px", height: "48px" }}>
      {caja({ left: 0, top: 0, width: "2px", height: "48px", background: C.hecho })}
      {caja({ right: 0, top: 0, width: "2px", height: "48px", background: C.hecho })}
      {caja({ left: 0, top: "22px", width: "200px", height: "2px", background: C.hecho })}
      {caja({ left: 0, top: "46px", width: "200px", height: "2px", background: C.hecho })}
      {fila(7, 22)}
      {fila(5, 46)}
    </span>
  );
}

/*
 * Activos corrientes (C.1, v2.3) · la raya del año en miniatura (Itagaki,
 * figura en la orientación de RayaDelAno §4): raya horizontal en y = 28 de
 * x = 24 a 160, eje en x = 30 de y = 4 a 28, dos puntos rellenos sobre el eje
 * (y = 9 y 20) y uno de contorno debajo de la raya (x = 70, y = 38).
 */
function Raya() {
  const punto = (x, y, relleno) => caja({ left: `${x - 5}px`, top: `${y - 5}px`, width: "10px", height: "10px", borderRadius: "50%", ...(relleno ? { background: C.hecho } : { border: TRAZO }) });
  return (
    <span data-silueta="raya" style={{ position: "relative", display: "block", width: "160px", height: "44px" }}>
      {caja({ left: "24px", top: "27px", width: "136px", height: "2px", background: C.hecho })}
      {caja({ left: "29px", top: "4px", width: "2px", height: "24px", background: C.hecho })}
      {punto(30, 9, true)}
      {punto(30, 20, true)}
      {punto(70, 38, false)}
    </span>
  );
}

export const SILUETAS = { raya: Raya, "titulo-valor": TituloValor, facturas: Facturas, bodega: Bodega };
export const ANCHO_SILUETA = { raya: 160, "titulo-valor": 168, facturas: 150, bodega: 200 };
export const ALTO_SILUETA = { raya: 44, "titulo-valor": 44, facturas: 44, bodega: 48 };

/* ═══════════ LA CABECERA: «PREGUNTA n DE 6» Y LA SILUETA DEL TEMA AL 50 % ═══════════ */

/*
 * v2 (§0): sale la banda de escena de 72 px de v1. Queda un renglón de 40 px
 * con la marca a la izquierda y la silueta del tema a la mitad a la derecha
 * (título 84 × 22, facturas 75 × 22, bodega 100 × 24).
 */
export function Cabecera({ actual, total, escena, progreso = INTERFAZ_R5_1.progreso }) {
  const Silueta = SILUETAS[escena];
  return (
    <div data-cabecera-r5 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "40px", gap: "12px" }}>
      <p data-progreso style={{ ...MARCA, margin: 0 }}>{progreso(actual + 1, total)}</p>
      <span aria-hidden="true" data-silueta-cabecera={escena} style={{ position: "relative", width: `${ANCHO_SILUETA[escena] / 2}px`, height: `${ALTO_SILUETA[escena] / 2}px`, flexShrink: 0 }}>
        <span style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.5)", transformOrigin: "left top" }}><Silueta /></span>
      </span>
    </div>
  );
}

/*
 * v1.3 · LA PISTA, A PEDIDO. Se pide con un botón antes de responder, debajo
 * de la interacción (decisión 7 de v2: nunca encima de la figura); no quita
 * FP (la nota es «bien a la primera», y la pista no es un intento). Al
 * responder se va: la devolución ocupa su sitio.
 */
export function Pista({ texto, abierta, onAbrir, rotulos = INTERFAZ_R5_1 }) {
  if (!abierta) {
    return (
      <button
        type="button"
        data-ver-pista
        aria-expanded="false"
        onClick={onAbrir}
        style={{
          marginTop: "16px", minHeight: "44px", padding: "0 16px", borderRadius: "999px",
          background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.22)",
          color: C.texto, cursor: "pointer", fontFamily: INTER, fontSize: "14px", fontWeight: 600,
        }}
      >
        {rotulos.verPista}
      </button>
    );
  }
  return (
    <div data-pista style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "12px", background: C.navy, borderLeft: `3px solid ${C.hecho}` }}>
      <p style={{ ...MARCA, margin: "0 0 4px" }}>{rotulos.marcaPista}</p>
      <p style={{ margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.texto }}>{texto}</p>
    </div>
  );
}
