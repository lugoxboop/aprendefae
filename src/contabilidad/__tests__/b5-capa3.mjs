/*
 * Para las pruebas de la capa 3 de la Célula B (hoja 6 de Mai): abrir una caja
 * y decidir. `zona` es la caja ([data-hecho]); `opcion`, el id de la opción
 * elegida. No es un archivo de pruebas: lo importan las de cada pieza.
 */
export async function decidir(tocar, zona, opcion) {
  const boton = zona.querySelector("button[aria-expanded]");
  if (boton.getAttribute("aria-expanded") !== "true") await tocar(boton);
  await tocar(zona.querySelector(`[data-opcion="${opcion}"]`));
}
