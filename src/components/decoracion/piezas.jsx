/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS DE DECORACIÓN DE LAS TABLAS DE POSICIONES (Hanayama, v3).
 *
 * Dibujadas y reservadas por Hanayama: orquestador/revisiones/decoracion-
 * ranking/zonas-hanayama.md §7 y los archivos de piezas/. Aquí van letra por
 * letra (una prueba compara cada `d` contra los .svg). Familia de la §5.1 de
 * vida-visual-v1 (Ukyo): trazo de 1,5 px sin relleno, #CBDCF2 al 0,45, lienzo
 * 40×40. Decorativas de verdad: aria-hidden y sin nombre accesible.
 *
 * Quedan fuera de las bandas, reservadas: la chispa (3), la moneda (4) y el
 * sello (9). ⛔ El sello hexagonal no va nunca en la liga ni en Estratégico.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TRAZO = { color: "#CBDCF2", opacidad: 0.45, ancho: 1.5 };

/* El cuerpo de cada pieza: { archivo, cuerpo } con los elementos del .svg tal cual. */
export const PIEZAS = {
  tetraedro: { archivo: "01-tetraedro.svg", elementos: [["path", { d: "M20 5L6 30L21 36L34 29Z M20 5L21 36 M6 30L34 29" }]] },
  cubo: { archivo: "02-cubo.svg", elementos: [["path", { d: "M7 14h19v19H7Z M14 7h19v19H14Z M7 14l7-7 M26 14l7-7 M26 33l7-7 M7 33l7-7" }]] },
  billete: {
    archivo: "05-billete.svg", giro: "3deg",
    elementos: [["rect", { x: 5, y: 12, width: 30, height: 16, rx: 2 }], ["circle", { cx: 20, cy: 20, r: 4 }], ["path", { d: "M9 16h3 M28 24h3" }]],
  },
  flecha: { archivo: "06-flecha.svg", elementos: [["path", { d: "M5 31L14 22L20 27L33 13 M25 13h8v8" }]] },
  libro: { archivo: "07-libro.svg", elementos: [["path", { d: "M20 12C15 9 9 9 5 11V31C9 29 15 29 20 32C25 29 31 29 35 31V11C31 9 25 9 20 12Z M20 12V32" }]] },
  clip: { archivo: "08-clip.svg", giro: "6deg", elementos: [["path", { d: "M26 14V28a6 6 0 0 1-12 0V10a4 4 0 0 1 8 0V27a2 2 0 0 1-4 0V14" }]] },
  torre: { archivo: "11-torre.svg", elementos: [["path", { d: "M12 9h3v3h3.5V9h3v3H25V9h3v8H12Z M14 17L15.5 30H24.5L26 17 M11 30h18v4H11Z" }]] },
};

/*
 * Fae (10), estática y sin bucle. Desde el 25-oct va siempre con «saluda»
 * (poses.js; Ukyo #567). «celebra» y «mira» quedan aquí como reserva de
 * Hanayama, sin uso, igual que sus .svg en piezas/.
 */
const CUERPO_FAE = [["circle", { cx: 20, cy: 10, r: 6 }], ["rect", { x: 14, y: 19, width: 12, height: 16, rx: 6 }]];
export const FAE_POSES = {
  saluda: { archivo: "10-fae-saluda.svg", elementos: [...CUERPO_FAE, ["path", { d: "M18 9.5h.01 M22 9.5h.01 M26 23L31 15 M14 24L10 29" }]] },
  celebra: { archivo: "10-fae-celebra.svg", elementos: [...CUERPO_FAE, ["path", { d: "M18 9.5h.01 M22 9.5h.01 M14 23L9 15 M26 23L31 15" }]] },
  mira: { archivo: "10-fae-mira.svg", elementos: [...CUERPO_FAE, ["path", { d: "M20 10h.01 M24 10h.01 M14 24L11 30 M26 24L29 30" }]] },
};

export function Dibujo({ pieza, tamano, ...resto }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width={tamano} height={tamano}
      fill="none" stroke={TRAZO.color} strokeOpacity={TRAZO.opacidad} strokeWidth={TRAZO.ancho}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...resto}
    >
      {pieza.elementos.map(([Etiqueta, a], k) => <Etiqueta key={k} {...a} />)}
    </svg>
  );
}
