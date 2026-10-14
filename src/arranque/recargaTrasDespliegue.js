/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CUANDO UN DESPLIEGUE DEJA LA PESTAÑA ABIERTA CON TROZOS QUE YA NO EXISTEN.
 *
 * Las vistas se cargan con lazy(): cada tema es un trozo de JavaScript con un
 * hash en el nombre (PoliticaMonetariaView-Cq862mqH.js). Un despliegue los
 * reemplaza por otros nombres. Quien tenía la plataforma abierta conserva el
 * índice viejo, que pide el trozo viejo: 404, «Failed to fetch dynamically
 * imported module», y la pantalla en blanco sin un solo aviso. Lo vio Erwin
 * en vivo al publicar el PR #32.
 *
 * ═══════════ QUÉ HACE ═══════════
 *
 * Vite dispara `vite:preloadError` justo en ese caso (y lo deja cancelar).
 *
 *   un fallo              guarda la hora y suma una recarga en sessionStorage,
 *                         cancela el error y RECARGA con un parámetro nuevo en
 *                         la dirección. Recargar a secas no basta: Erwin lo
 *                         probó y siguió viendo el índice viejo; una dirección
 *                         distinta no puede salir de ninguna caché.
 *   más eventos, mientras  una misma navegación puede disparar varios (el JS y
 *   recarga               el CSS del mismo trozo). Se cancelan y se ignoran:
 *                         sin esto, el segundo encontraba la marca y pintaba
 *                         el aviso justo mientras todo se arreglaba (Levi).
 *   otro fallo, PRONTO    (menos de VENTANA_MS desde la última recarga) NO
 *                         recarga: es «recargué y volvió a fallar». Aviso.
 *   otro fallo, DESPUÉS   (la marca es vieja) es otro despliegue con la misma
 *                         pestaña abierta: recarga otra vez (Erwin)…
 *   …HASTA MAX_RECARGAS   por sesión. A partir de ahí, aviso. Tiempo Y cantidad
 *                         (Levi): ni un bucle lento —un celular que tarda más
 *                         que la ventana en recargar— se repite sin fin.
 *
 * EL AVISO TRAE «Recargar» (Levi). Hace lo mismo que la recarga automática.
 * Como lo toca el estudiante, no mira la marca ni el tope: no hay bucle
 * posible, y nadie se queda atrapado, tampoco sin sessionStorage. Sin el
 * botón, el aviso pedía algo que no funciona —volver a entrar sirve de la
 * caché el mismo índice viejo— y tapaba la cabecera para siempre.
 *
 * Sin sessionStorage (bloqueado o lleno) no hay forma de saber si ya se
 * recargó: aviso, nunca recarga automática. Mejor un aviso que un bucle.
 *
 * La marca NUNCA se borra al montar: es la que distingue un bucle de un
 * despliegue nuevo y la que cuenta el tope. Una marca que no es una hora
 * (dañada) cuenta como vieja; una en el futuro (reloj atrasado) cuenta por su
 * distancia.
 *
 * Al arrancar, si la dirección trae el parámetro de la recarga, se quita (sin
 * recargar ni tocar el hash de la ruta): la dirección queda limpia para
 * copiarla o guardarla.
 *
 * LO QUE ESTO NO CUBRE (Levi): que falle el archivo principal mismo. Este
 * guardia vive dentro de él; si no carga, no se ejecuta. Va en su propio PR.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CLAVE = "aprendefae-recarga-tras-despliegue";
export const CLAVE_VECES = "aprendefae-recarga-tras-despliegue-veces";
export const PARAMETRO = "recarga";
export const VENTANA_MS = 30 * 1000;
export const MAX_RECARGAS = 2;

/*
 * LOS DOS TEXTOS, DE GEN (verificados por Erwin: INFLESZ 97,5, 14 palabras,
 * 2 frases; ninguna expresión prohibida). Son los mismos en el guardia de
 * index.html, y una prueba lo vigila.
 *
 * NO SE CAMBIAN POR ALGO QUE «SUENE PARECIDO» (Erwin):
 *   «Prueba con el botón»   invita a reintentar; NO promete que el botón lo
 *                           arregle. El aviso sale justo cuando la recarga ya
 *                           no funcionó: prometer un arreglo ahí sería falso.
 *   «el fallo es nuestro»   es verdad en los tres casos en que sale el aviso,
 *                           sin decir cuál de los tres es.
 * Si alguna vez hay que recortarla, ese matiz no se puede perder. Tampoco
 * puede culpar al estudiante, ni afirmar que es la conexión, que volver a
 * entrar lo arregla, que hay una versión nueva o que el progreso está guardado.
 */
export const MENSAJE = "Esta parte no cargó y el fallo es nuestro. Prueba con el botón Recargar.";
export const BOTON = "Recargar";

/** La misma dirección, con el parámetro de la recarga puesto (o renovado). El hash de la ruta no se toca. */
export function direccionSinCache(href, marca) {
  const u = new URL(href);
  u.searchParams.set(PARAMETRO, String(marca));
  return u.toString();
}

/** La dirección sin el parámetro de la recarga, o null si no lo traía. */
export function direccionLimpia(href) {
  const u = new URL(href);
  if (!u.searchParams.has(PARAMETRO)) return null;
  u.searchParams.delete(PARAMETRO);
  return u.toString();
}

function leer(almacen, clave) {
  try { return { ok: true, valor: almacen.getItem(clave) }; } catch { return { ok: false, valor: null }; }
}
function marcar(almacen, clave, valor) {
  try { almacen.setItem(clave, valor); return true; } catch { return false; }
}

/* ¿La marca es de hace menos de VENTANA_MS? Una marca dañada no es reciente. */
export function reciente(marca, ahora) {
  if (marca === null || marca === undefined || marca === "") return false;
  const t = Number(marca);
  return Number.isFinite(t) && Math.abs(ahora - t) < VENTANA_MS;
}

/* Cuántas recargas automáticas lleva la sesión. Un valor dañado cuenta como el tope: ante la duda, no recargar. */
export function recargasHechas(valor) {
  if (valor === null || valor === undefined) return 0;
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 ? n : MAX_RECARGAS;
}

/**
 * Qué hacer con un `vite:preloadError`. Devuelve "recarga", "ignorado" o "aviso".
 *   evento    el evento de Vite (cancelable)
 *   almacen   sessionStorage
 *   recargar  (direccion) => void
 *   avisar    () => void
 *   estado    { recargando }: uno por página. Mientras recarga, lo demás se ignora.
 */
export function alFallarLaCarga(evento, { almacen, href, recargar, avisar, ahora = Date.now(), estado = { recargando: false } }) {
  if (estado.recargando) {
    evento?.preventDefault?.();
    return "ignorado";
  }
  const hora = leer(almacen, CLAVE);
  const veces = leer(almacen, CLAVE_VECES);
  const n = recargasHechas(veces.valor);
  const puede = hora.ok && veces.ok && !reciente(hora.valor, ahora) && n < MAX_RECARGAS;
  /* La cuenta se escribe primero: si no se puede contar, no se recarga. */
  if (puede && marcar(almacen, CLAVE_VECES, String(n + 1)) && marcar(almacen, CLAVE, String(ahora))) {
    estado.recargando = true;
    evento?.preventDefault?.();
    recargar(direccionSinCache(href, ahora));
    return "recarga";
  }
  avisar();
  return "aviso";
}

/* El aviso: una franja fija arriba, fuera del árbol de React, con «Recargar». Una sola vez. */
export function mostrarAviso(doc, { texto = MENSAJE, alRecargar } = {}) {
  if (!doc?.body || doc.querySelector?.("[data-aviso-carga]")) return;
  const caja = doc.createElement("div");
  caja.setAttribute("role", "alert");
  caja.setAttribute("data-aviso-carga", "");
  Object.assign(caja.style, {
    position: "fixed", left: "16px", right: "16px", top: "16px", zIndex: "9999",
    display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
    padding: "12px 12px 12px 16px", borderRadius: "12px", boxSizing: "border-box",
    background: "#1D3557", color: "#FFFFFF", border: "1px solid rgba(248,249,250,0.22)",
    fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px",
    boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
  });
  const frase = doc.createElement("span");
  frase.textContent = texto;
  frase.style.flex = "1 1 180px";
  const boton = doc.createElement("button");
  boton.type = "button";
  boton.textContent = BOTON;
  Object.assign(boton.style, {
    minHeight: "44px", padding: "0 18px", borderRadius: "10px", border: "none", cursor: "pointer",
    background: "#FFFFFF", color: "#1D3557", fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: "600",
  });
  boton.addEventListener("click", () => alRecargar?.());
  caja.append(frase, boton);
  doc.body.appendChild(caja);
}

/**
 * Lo instala en la ventana. Se llama una vez, al arrancar, antes de montar React.
 * `reloj` existe para las pruebas.
 */
export function instalarRecargaTrasDespliegue(win = globalThis.window, { reloj = () => Date.now() } = {}) {
  if (!win?.addEventListener) return;
  /* Quita el parámetro de una recarga anterior, sin recargar. */
  try {
    const limpia = direccionLimpia(win.location.href);
    if (limpia) win.history?.replaceState?.(win.history.state, "", limpia);
  } catch { /* sin history: la dirección se queda con el parámetro, nada más */ }

  const estado = { recargando: false };
  const recargar = (direccion) => win.location.replace(direccion);
  win.addEventListener("vite:preloadError", (evento) => {
    let almacen = null;
    try { almacen = win.sessionStorage; } catch { /* bloqueado */ }
    alFallarLaCarga(evento, {
      almacen: almacen ?? { getItem() { throw new Error("sin almacén"); }, setItem() { throw new Error("sin almacén"); } },
      href: win.location.href,
      recargar,
      /* El botón lo toca el estudiante: no mira la marca ni el tope. */
      avisar: () => mostrarAviso(win.document, { alRecargar: () => recargar(direccionSinCache(win.location.href, reloj())) }),
      ahora: reloj(),
      estado,
    });
  });
}
