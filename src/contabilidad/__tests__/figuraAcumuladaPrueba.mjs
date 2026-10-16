/*
 * Ayudante de las pruebas de la figura acumulada (lote 5 de L): lo que se ve
 * en la figura, bloque por bloque, en una línea cada uno.
 *
 *   renglones  «Título: v1 v2 [Subtítulo] v3 …», con «*» tras la cifra en negrita
 *   asiento    «asiento Título: n líneas»
 *   tabla      «tabla n filas»
 *   plazos     «plazos»
 *
 * Sin figura (nada cerrado todavía), una lista vacía.
 */
const limpio = (s) => s.replace(/\u00a0/g, " ").trim();

export function firma(caja) {
  const fig = caja.querySelector("[data-figura-acumulada]");
  if (!fig) return [];
  return [...fig.querySelectorAll("[data-figura-contenido] > *")].map((b) => {
    if (b.matches("[data-asiento-figura]")) {
      const t = b.querySelector("figcaption")?.textContent ?? "";
      return `asiento ${t}: ${[...b.querySelectorAll("[data-asiento] > div")].filter((d) => /^(DEBE|HABER)/.test(d.textContent)).length} líneas`;
    }
    if (b.matches("[data-tabla-figura]")) return `tabla ${b.querySelectorAll("[data-fila-tabla]").length} filas`;
    if (b.querySelector("[data-plazos]")) return "plazos";
    const r = b.querySelector("figure[data-renglones]");
    const t = r.querySelector("figcaption")?.textContent;
    const partes = [...r.querySelectorAll("[data-renglon], [data-subtitulo]")].map((f) => (f.matches("[data-subtitulo]")
      ? `[${limpio(f.textContent)}]`
      : `${limpio(f.querySelector(".rg-v").textContent)}${f.classList.contains("rg-fuerte") ? "*" : ""}`));
    return `${t ? `${limpio(t)}: ` : ""}${partes.join(" ")}`;
  });
}

/* El texto de la figura entera (para comprobar que la respuesta de un ítem no está antes de cerrarlo). */
export const textoFigura = (caja) => limpio(caja.querySelector("[data-figura-acumulada]")?.textContent ?? "");
