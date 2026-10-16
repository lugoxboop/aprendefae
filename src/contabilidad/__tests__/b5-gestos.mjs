/*
 * Los gestos de la capa 2 del tanque (T6 · A3, lote 7), para las pruebas que
 * recorren la capa con «Siguiente»: si «Siguiente» espera un gesto
 * (data-gesto-pendiente), se hace por la vía del teclado o del toque, que es
 * la misma que el arrastre (un toque coloca la ficha; Enter sube el asa).
 */
export async function hacerGesto(siguiente, act, w) {
  const g = siguiente?.dataset?.gestoPendiente;
  if (!g) return false;
  const raiz = siguiente.closest("[data-capa2-t6-a3]") ?? siguiente.ownerDocument;
  const click = (el) => act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  if (g === "gasto" || g === "pablo") await click(raiz.querySelector('[data-ficha][data-activa="si"]'));
  else if (g === "barra") await click(raiz.querySelector("button[data-barra]"));
  else if (g === "asa") await act(async () => { raiz.querySelector("[data-asa]").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  return true;
}
