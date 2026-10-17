/*
 * Los gestos de la capa 2 del tanque (T6 · A3, lote 7), para las pruebas que
 * recorren la capa con «Siguiente»: si «Siguiente» espera un gesto
 * (data-gesto-pendiente), se hace por la vía del teclado o del toque, que es
 * la misma que el arrastre (un toque coloca la ficha; Enter sube el asa).
 */
export async function hacerGesto(siguiente, act, w) {
  const g = siguiente?.dataset?.gestoPendiente;
  if (!g) return false;
  const raiz = siguiente.closest("[data-capa2-t6-a3], [data-capa2-t5-a2], [data-capa2-t5-a1], [data-capa2-t6], [data-capa2-t6-a2], [data-capa2-t6-a4], [data-capa2-t6-a5]") ?? siguiente.ownerDocument;
  const click = (el) => act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  const enter = (el) => act(async () => { el.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  /* Lote 21: la ficha que entra (T5 A1, T6 A1, T6 A2, T6 A4 y T6 A5): se toca la ficha resaltada. */
  const fichaQueEntra = raiz.querySelector('[data-ficha-entra][data-activa="si"]');
  if (fichaQueEntra) { await click(fichaQueEntra); return true; }
  /* Lote 11 (T5 · A2): la ficha de Bancos, la marca de la fecha y el riel de venta. */
  if (g === "bancos") { await click(raiz.querySelector('[data-ficha][data-activa="si"]')); return true; }
  if (g === "agosto" || g === "noviembre") { await enter(raiz.querySelector("[data-marca-fecha]")); return true; }
  if (g === "vende75" || g === "vendeResto") { await enter(raiz.querySelector("[data-riel-venta]")); return true; }
  if (g === "gasto" || g === "pablo") await click(raiz.querySelector('[data-ficha][data-activa="si"]'));
  else if (g === "barra") await click(raiz.querySelector("button[data-barra]"));
  else if (g === "asa") await act(async () => { raiz.querySelector("[data-asa]").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  return true;
}
