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
 *   1.er fallo            guarda la hora en sessionStorage, cancela el error
 *                         y RECARGA, una sola vez, con un parámetro nuevo en
 *                         la dirección. Recargar a secas no basta: Erwin lo
 *                         probó y siguió viendo el índice viejo; una dirección
 *                         distinta no puede salir de ninguna caché.
 *   otro fallo, PRONTO    (menos de VENTANA_MS desde la última recarga) NO
 *                         recarga: es «recargué y volvió a fallar», el trozo
 *                         falta de verdad y recargar sería un bucle. Muestra
 *                         un aviso, fuera de React (el árbol puede haber
 *                         quedado vacío).
 *   otro fallo, DESPUÉS   (la marca es vieja) no es un bucle: es otro
 *                         despliegue con la misma pestaña abierta, y merece su
 *                         recarga. Una sesión larga de estudio cruza dos
 *                         despliegues sin esfuerzo; la primera marca no puede
 *                         silenciar las siguientes (Erwin).
 *
 * POR QUÉ CINCO MINUTOS. El bucle es cuestión de segundos; un despliegue
 * nuevo, de horas. Si la ventana se queda corta, un celular lento que tarda
 * más que ella en recargar entraría en bucle: ese es el error grave. Si se
 * queda larga, lo peor es un aviso de más cuando dos despliegues caen en la
 * misma ventana. Por eso se elige larga. En el peor caso, una recarga cada
 * cinco minutos, y solo si el estudiante vuelve a abrir esa parte.
 *
 * Una marca que no es una hora (dañada) cuenta como vieja. Una marca en el
 * futuro (el reloj del equipo se atrasó) cuenta por su distancia: si está
 * lejos, es vieja.
 *
 * Sin sessionStorage (bloqueado o lleno) no hay forma de saber si ya se
 * recargó: se muestra el aviso y no se recarga. Mejor un aviso que un bucle.
 *
 * Al arrancar, si la dirección trae el parámetro de la recarga, se quita (sin
 * recargar ni tocar el hash de la ruta): la dirección queda limpia para
 * copiarla o guardarla. La marca se queda: es la que distingue un
 * bucle de un despliegue nuevo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CLAVE = "aprendefae-recarga-tras-despliegue";
export const PARAMETRO = "recarga";
export const VENTANA_MS = 5 * 60 * 1000;

/*
 * PENDIENTE DE GEN. Es la propuesta inicial de Erwin; el texto final lo
 * aprueba Gen y se cambia aquí, en una sola línea. Restricción de Erwin: NO
 * puede mandar al estudiante a revisar su conexión. En el caso que lo dispara
 * la conexión está bien; lo que falló es que la página quedó vieja o le falta
 * una parte.
 */
export const MENSAJE = "No pudimos cargar esta parte. Revisa tu conexión y vuelve a entrar.";

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

function leer(almacen) {
  try { return { ok: true, valor: almacen.getItem(CLAVE) }; } catch { return { ok: false, valor: null }; }
}
function marcar(almacen, valor) {
  try { almacen.setItem(CLAVE, valor); return true; } catch { return false; }
}

/* ¿La marca es de hace menos de VENTANA_MS? Una marca dañada no es reciente. */
export function reciente(marca, ahora) {
  if (marca === null || marca === undefined || marca === "") return false;
  const t = Number(marca);
  return Number.isFinite(t) && Math.abs(ahora - t) < VENTANA_MS;
}

/**
 * Qué hacer con un `vite:preloadError`. Devuelve "recarga" o "aviso".
 *   evento    el evento de Vite (cancelable)
 *   almacen   sessionStorage
 *   recargar  (direccion) => void
 *   avisar    () => void
 */
export function alFallarLaCarga(evento, { almacen, href, recargar, avisar, ahora = Date.now() }) {
  const previo = leer(almacen);
  if (previo.ok && !reciente(previo.valor, ahora) && marcar(almacen, String(ahora))) {
    evento?.preventDefault?.();
    recargar(direccionSinCache(href, ahora));
    return "recarga";
  }
  avisar();
  return "aviso";
}

/* El aviso: una franja fija arriba, fuera del árbol de React. Una sola vez. */
export function mostrarAviso(doc, texto = MENSAJE) {
  if (!doc?.body || doc.querySelector?.("[data-aviso-carga]")) return;
  const caja = doc.createElement("div");
  caja.setAttribute("role", "alert");
  caja.setAttribute("data-aviso-carga", "");
  caja.textContent = texto;
  Object.assign(caja.style, {
    position: "fixed", left: "16px", right: "16px", top: "16px", zIndex: "9999",
    padding: "14px 16px", borderRadius: "12px", boxSizing: "border-box",
    background: "#1D3557", color: "#FFFFFF", border: "1px solid rgba(248,249,250,0.22)",
    fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px",
    boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
  });
  doc.body.appendChild(caja);
}

/** Lo instala en la ventana. Se llama una vez, al arrancar, antes de montar React. */
export function instalarRecargaTrasDespliegue(win = globalThis.window) {
  if (!win?.addEventListener) return;
  /* Quita el parámetro de una recarga anterior, sin recargar. */
  try {
    const limpia = direccionLimpia(win.location.href);
    if (limpia) win.history?.replaceState?.(win.history.state, "", limpia);
  } catch { /* sin history: la dirección se queda con el parámetro, nada más */ }

  win.addEventListener("vite:preloadError", (evento) => {
    let almacen = null;
    try { almacen = win.sessionStorage; } catch { /* bloqueado */ }
    alFallarLaCarga(evento, {
      almacen: almacen ?? { getItem() { throw new Error("sin almacén"); }, setItem() { throw new Error("sin almacén"); } },
      href: win.location.href,
      recargar: (direccion) => win.location.replace(direccion),
      avisar: () => mostrarAviso(win.document),
    });
  });
}
