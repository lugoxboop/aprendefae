import { flushSync } from "react-dom";
import { escucharFP } from "../fp/aviso.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MOVIMIENTO — el sistema de animación de todo AprendeFAE (orden de Mateo,
 * 14-nov: «aplica estos conceptos a toda la plataforma, y muy importante, a
 * las actividades: al entrar, al jugar y al salir»).
 *
 * Esta pieza y su hoja, src/styles/movimiento.css, son el SUELO: llegan solas
 * a cualquier pantalla y a cualquier actividad, también a las que ninguna
 * célula ha coreografiado, porque reaccionan a señales que el sitio ya usa
 * (botones, `data-estado`, regiones `aria-live`, la ruta). Ninguna actividad
 * tiene que cambiar una línea para recibirlo.
 *
 * LOS VEINTE PRINCIPIOS Y DÓNDE VIVE CADA UNO
 *
 *   Squash & stretch ...... el botón se aplasta al pulsarlo; el acierto se
 *                           aplasta y se estira; la cifra del resumen aterriza
 *   Anticipation .......... la pantalla que se va retrocede un poco antes de
 *                           irse; el resumen se encoge antes de abrirse
 *   Staging ............... se anima SOLO lo que acaba de cambiar (el
 *                           observador mira cambios, no montajes), y en el
 *                           encabezado y el resumen las partes entran en fila
 *   Pose to pose .......... todo son fotogramas clave; el navegador interpola
 *   Follow through ........ el botón suelto se pasa de largo y vuelve
 *                           (curva RESORTE); el error se sacude y se asienta
 *   Slow in & slow out .... CURVA, la de la casa, en todo lo que entra y sale
 *   Arcs .................. lo que entra baja en curva (x e y no llegan a la
 *                           vez), no en línea recta
 *   Secondary action ...... el anillo que sale de un acierto
 *   Timing ................ UI ≤ 300 ms (TIEMPO); solo los momentos raros de
 *                           celebración pasan de ahí
 *   Exaggeration .......... el acierto y el error se notan más de lo real
 *   Solid drawing ......... tarjetas, medallas y accesorios se inclinan en 3D
 *                           hacia el puntero
 *   Appeal ................ la suma
 *   Fitts / hit areas ..... los botones de volver y cerrar tienen 8 px de
 *                           toque invisible alrededor (en la hoja)
 *   Hick / Miller ......... las filas escalonadas se cortan en 7: lo que
 *                           pasa del séptimo entra junto (en la hoja)
 *   Doherty ............... toda respuesta empieza en el mismo cuadro del
 *                           toque; ninguna transición bloquea más de 320 ms
 *   Postel ................ `leerNumero`: acepta «$ 1.250.000», «1,250,000»,
 *                           «1250000,5» y devuelve un número limpio
 *   Jakob ................. avanzar desliza hacia la izquierda y volver hacia
 *                           la derecha, como cualquier app del celular
 *   Frecuencia de uso ..... lo que se toca mil veces (navegar, pulsar) se
 *                           mueve poco; lo raro (acierto, cierre) se mueve
 *                           mucho; y una región que cambia a cada rato (un
 *                           reloj) deja de animarse sola
 *
 * LAS REGLAS QUE NO CAMBIAN
 *   · Solo `opacity` y las propiedades sueltas `scale`, `translate` y
 *     `rotate`. Las sueltas se SUMAN al `transform` que ya tenga un elemento,
 *     así que esto no le pisa a nadie su posición.
 *   · Nada en bucle.
 *   · Con movimiento reducido no se mueve nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Entrar y salir: arranca rápido y frena. La curva de la casa. */
export const CURVA = "cubic-bezier(.3,.9,.4,1)";
/** Asentarse: se pasa un poco de largo y vuelve (follow through). */
export const RESORTE = "cubic-bezier(.34,1.56,.64,1)";
/** Tope de una animación de interfaz (snappy timing). */
export const TIEMPO = 300;

export function reducido() {
  try { return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
}

/* ═══════════ ESTADOS: qué cambio pide qué movimiento ═══════════ */

const ACIERTO = new Set(["acierto", "correcta", "correcto", "bien", "ok", "cuadra", "exacta", "exacto", "hecho", "completa", "completada", "ganada", "superada", "comprado", "comprada", "desbloqueado", "desbloqueada", "obtenida"]);
const ERROR = new Set(["error", "mal", "incorrecta", "incorrecto", "falla", "fallo", "no-cuadra", "rechazada"]);
const ELEGIDO = new Set(["elegida", "elegido", "seleccionada", "seleccionado", "marcada", "marcado", "activa", "activo", "puesta", "puesto", "colocada", "colocado"]);
const REVELADO = new Set(["revelada", "revelado", "abierta", "abierto", "visible"]);

/** Qué movimiento le toca a un valor nuevo de `data-estado` (o null: ninguno). */
export function tipoDeEstado(valor) {
  const v = String(valor ?? "").trim().toLowerCase();
  if (!v) return null;
  if (ACIERTO.has(v)) return "acierto";
  if (ERROR.has(v)) return "error";
  if (ELEGIDO.has(v)) return "elegido";
  if (REVELADO.has(v)) return "revelado";
  return null;
}

/*
 * Los fotogramas clave (pose to pose). Cada uno dura lo suyo y usa su curva.
 * El acierto: impacto (se aplasta), rebote (se estira), asienta. El error: se
 * sacude cada vez menos, como algo que pierde energía. Elegido: un aplastón
 * corto, el «clic» que se ve.
 */
export const MOVIMIENTOS = {
  acierto: {
    fotogramas: [
      { scale: "1" },
      { scale: "1.08 .92", offset: 0.22 },
      { scale: ".97 1.05", offset: 0.5 },
      { scale: "1.015 .99", offset: 0.76 },
      { scale: "1" },
    ],
    duracion: 300, curva: CURVA, sumar: true,
  },
  error: {
    fotogramas: [
      { translate: "0 0" },
      { translate: "-7px 0", offset: 0.18 },
      { translate: "6px 0", offset: 0.38 },
      { translate: "-4px 0", offset: 0.58 },
      { translate: "2px 0", offset: 0.78 },
      { translate: "0 0" },
    ],
    duracion: 300, curva: "cubic-bezier(.36,.07,.19,.97)", sumar: true,
  },
  elegido: {
    fotogramas: [{ scale: "1" }, { scale: ".94", offset: 0.35 }, { scale: "1.03", offset: 0.7 }, { scale: "1" }],
    duracion: 220, curva: CURVA, sumar: true,
  },
  revelado: {
    fotogramas: [{ opacity: 0, translate: "-4px 8px" }, { opacity: 1, translate: "-1px 1px", offset: 0.6 }, { opacity: 1, translate: "0 0" }],
    duracion: 240, curva: CURVA,
  },
  /* El mismo acierto para algo grande (un panel de retroalimentación): menos amplitud, la misma forma. */
  aciertoAncho: {
    fotogramas: [
      { scale: "1" },
      { scale: "1.025 .95", offset: 0.22 },
      { scale: ".995 1.02", offset: 0.5 },
      { scale: "1.004 .998", offset: 0.76 },
      { scale: "1" },
    ],
    duracion: 300, curva: CURVA, sumar: true,
  },
  /* La barra de avance crece: se estira hacia arriba y asienta. */
  avance: {
    fotogramas: [{ scale: "1" }, { scale: "1.02 1.35", offset: 0.3 }, { scale: ".995 .9", offset: 0.65 }, { scale: "1" }],
    duracion: 260, curva: CURVA, sumar: true,
  },
  /*
   * Ganar FP: la pastilla se encoge (anticipación), salta estirada y asienta
   * con un rebote. Es el momento más raro del sitio, así que es el único que
   * pasa de 300 ms.
   */
  ganar: {
    fotogramas: [
      { scale: "1", translate: "0 0" },
      { scale: "1.06 .9", translate: "0 2px", offset: 0.16 },
      { scale: ".94 1.12", translate: "0 -5px", offset: 0.42 },
      { scale: "1.04 .96", translate: "0 0", offset: 0.66 },
      { scale: ".99 1.01", translate: "0 0", offset: 0.84 },
      { scale: "1", translate: "0 0" },
    ],
    duracion: 520, curva: CURVA, sumar: true, celebracion: true,
  },
  /* Un aviso que cambia (aria-live): llega en arco desde abajo a la izquierda. */
  aviso: {
    fotogramas: [{ opacity: 0, translate: "-6px 8px" }, { opacity: 1, translate: "-1px 1px", offset: 0.6 }, { opacity: 1, translate: "0 0" }],
    duracion: 240, curva: CURVA,
  },
};

/* A partir de este ancho, el aplastón se hace en pequeño: 8 % de 340 px son 27 px, y eso ya no se lee como rebote. */
const ANCHO_GRANDE = 240;

function animar(el, tipo) {
  if (tipo === "acierto" && (el.getBoundingClientRect?.().width ?? 0) > ANCHO_GRANDE) tipo = "aciertoAncho";
  const m = MOVIMIENTOS[tipo];
  if (!m || typeof el?.animate !== "function") return null;
  /*
   * Las de forma se SUMAN a lo que el elemento ya tenga (su escala, su
   * posición); las que llevan opacidad no, porque sumar opacidad a 1 da 1 y el
   * fundido no se vería.
   */
  try {
    return el.animate(m.fotogramas, { duration: m.duracion, easing: m.curva, ...(m.sumar ? { composite: "add" } : {}) });
  } catch {
    /* Un navegador sin `composite` o sin propiedades sueltas: se queda quieto, que no es un error. */
    try { return el.animate(m.fotogramas, { duration: m.duracion, easing: m.curva }); } catch { return null; }
  }
}

/*
 * Acción secundaria del acierto: un anillo que sale del elemento y se
 * desvanece. Va en una capa fija aparte, encima de todo y sin recibir toques,
 * así que no mueve el diseño de la actividad. Solo para cosas del tamaño de
 * una opción: un panel entero no echa anillos.
 */
function anillo(el, color) {
  const doc = el.ownerDocument;
  const r = el.getBoundingClientRect?.();
  if (!doc?.body || !r || r.width === 0 || r.width > 420 || r.height > 260) return;
  const capa = doc.createElement("div");
  capa.setAttribute("aria-hidden", "true");
  capa.setAttribute("data-mv-anillo", "");
  const radio = getComputedStyle(el).borderRadius || "14px";
  Object.assign(capa.style, {
    position: "fixed", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
    borderRadius: radio, boxShadow: `0 0 0 2px ${color}`, pointerEvents: "none", zIndex: "90",
  });
  doc.body.appendChild(capa);
  const a = capa.animate?.(
    [{ opacity: 0.9, scale: "1" }, { opacity: 0, scale: "1.18 1.32" }],
    { duration: 420, easing: CURVA },
  );
  const quitar = () => capa.remove();
  if (a) { a.onfinish = quitar; a.oncancel = quitar; } else quitar();
}

const COLOR_ACIERTO = "#2A9D8F";
const COLOR_FP = "#E9C46A";

/* ═══════════ DE UN PUNTO AL SIGUIENTE DENTRO DE UNA ACTIVIDAD ═══════════
 *
 * «Siguiente alerta», «Siguiente hecho», «Continuar»… Cada mecánica cambia de
 * punto a su manera, y antes el punto nuevo aparecía de golpe. Aquí se
 * reconoce el botón por lo que dice, y el cambio pasa dentro de una
 * transición de vista limitada a la tarjeta de la actividad: el punto viejo
 * retrocede y se va a la izquierda (anticipación), el nuevo llega en arco
 * desde la derecha y se pasa un pelo antes de asentar (follow through). El
 * resto de la página no se mueve (staging). «Anterior» hace lo mismo al revés.
 *
 * Una pieza que ya coreografía su propio paso (la secuencia de Aprender, o
 * cualquiera marcada con `data-mv-sin-paso`) queda fuera: dos movimientos
 * encima del mismo cambio se estorban.
 */
export const SIGUIENTE = /^(siguiente|continuar|otra |otro |próxim|proxim|seguir|avanzar|pasar a|cerrar turno|ver resultado|ver cómo te fue|terminar|empezar|comenzar)/i;
export const ANTERIOR = /^(anterior|atrás|atras|regresar)/i;
const NO_ES_PASO = /google|sesión|cuenta|camino|inicio|tema|materia/i;
const CAJA_ITEM = "[data-mv-item], [data-partida], section, article";

/** Qué dirección tiene un botón por su texto: "adelante", "atras" o null. */
export function direccionDePaso(texto) {
  const t = String(texto ?? "").replace(/\s+/g, " ").trim();
  if (!t || NO_ES_PASO.test(t)) return null;
  if (SIGUIENTE.test(t)) return "adelante";
  if (ANTERIOR.test(t)) return "atras";
  return null;
}

/*
 * Cada célula nombró la retroalimentación a su manera: `data-estado`,
 * `data-retro`, `data-veredicto`, `data-marca`… Se escuchan todas. En las que
 * no son `data-estado` solo cuentan acierto y error: «activa» o «abierta»
 * pueden significar otra cosa ahí.
 */
export const ATRIBUTOS_RETRO = [
  "data-estado", "data-retro", "data-veredicto", "data-resultado", "data-respuesta", "data-mensaje",
  "data-panel", "data-devolucion", "data-ver", "data-marca", "data-caso", "data-punto",
  "data-vivo-veredicto", "data-estado-partida",
];
const SELECTOR_RETRO = ATRIBUTOS_RETRO.map((a) => `[${a}]`).join(",");

/** Qué movimiento le toca a un atributo de retroalimentación con un valor. */
export function tipoDeRetro(atributo, valor) {
  const t = tipoDeEstado(valor);
  if (atributo === "data-estado") return t;
  return t === "acierto" || t === "error" ? t : null;
}

/* Si una sola inserción trae más de esto, es una pantalla entera que se montó, no una respuesta. */
const TOPE_RETRO_NUEVA = 3;

/* ═══════════ PROFUNDIDAD: tarjetas que se inclinan hacia el puntero ═══════════ */

export const RELIEVE = ".fae-card, [data-accesorio], [data-medalla], [data-mv-relieve]";
const GRADOS = 7;

/** El giro 3D para un puntero en (px, py) dentro de una caja: [eje x, eje y, grados]. */
export function giroHacia(px, py, caja) {
  const dx = (px - (caja.left + caja.width / 2)) / (caja.width / 2);
  const dy = (py - (caja.top + caja.height / 2)) / (caja.height / 2);
  const cx = Math.max(-1, Math.min(1, dx));
  const cy = Math.max(-1, Math.min(1, dy));
  const fuerza = Math.min(1, Math.hypot(cx, cy));
  return [Number((-cy).toFixed(3)), Number(cx.toFixed(3)), Number((fuerza * GRADOS).toFixed(2))];
}

/* ═══════════ POSTEL: entrada desordenada, número limpio ═══════════ */

/**
 * Lee un número como lo escribiría una persona en Colombia o en cualquier
 * parte: «$ 1.250.000», «1,250,000», «1250000,5», «-3.500», «12 %».
 * Devuelve un número, o null si de verdad no hay número.
 */
export function leerNumero(texto) {
  if (typeof texto === "number") return Number.isFinite(texto) ? texto : null;
  let s = String(texto ?? "").trim().replace(/[\s$%€COPcop]/g, "").replace(/[−–]/g, "-");
  if (!s || !/\d/.test(s)) return null;
  const negativo = /^\(.*\)$/.test(s) || s.startsWith("-");
  s = s.replace(/[()+-]/g, "");
  const puntos = (s.match(/\./g) || []).length;
  const comas = (s.match(/,/g) || []).length;
  if (puntos && comas) {
    /* El que va último es el decimal. */
    const dec = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
    s = s.split(dec === "," ? "." : ",").join("").replace(dec, ".");
  } else if (puntos > 1 || comas > 1) {
    s = s.replace(/[.,]/g, "");
  } else if (puntos === 1 || comas === 1) {
    const sep = puntos ? "." : ",";
    const [ent, frac] = s.split(sep);
    /* «1.250» y «3,500» son miles; «1,5» y «2.75» son decimales. */
    s = frac.length === 3 && ent.length >= 1 && ent !== "0" ? ent + frac : `${ent}.${frac}`;
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negativo ? -n : n;
}

/* ═══════════ JAKOB: avanzar y volver se mueven como en el celular ═══════════ */

let enTransicion = false;
/** Verdadero mientras una transición de pantalla está en curso. */
export const hayTransicion = () => enTransicion;

/**
 * Cambia la pantalla con transición: la que se va retrocede (anticipación) y
 * la que llega entra en arco. `tipo`: "avanza" · "vuelve" · "abre" · "cierra".
 *
 * Usa las transiciones de vista del navegador, que animan una FOTO de la
 * página: nada de la página se transforma, así que el velo, la malla y la
 * ficha de FP (todo lo `position: fixed`) no se descolocan. Sin soporte, o con
 * movimiento reducido, el cambio pasa igual, sin transición.
 */
export function conTransicion(cambiar, tipo = "avanza") {
  const doc = globalThis.document;
  if (!doc?.startViewTransition || reducido() || enTransicion || doc.visibilityState === "hidden") {
    cambiar();
    return;
  }
  const raiz = doc.documentElement;
  enTransicion = true;
  raiz.dataset.mvTransicion = tipo;
  let hecho = false;
  const aplicar = () => {
    if (hecho) return;
    hecho = true;
    try { flushSync(cambiar); } catch { cambiar(); }
  };
  let t;
  try {
    t = doc.startViewTransition(aplicar);
  } catch {
    enTransicion = false;
    delete raiz.dataset.mvTransicion;
    aplicar();
    return;
  }
  const fin = () => { enTransicion = false; delete raiz.dataset.mvTransicion; };
  /* Si la transición se salta (otra empezó, nombres repetidos…), el cambio igual tiene que pasar. */
  t.updateCallbackDone?.catch(() => aplicar());
  (t.finished ?? Promise.resolve()).then(fin, fin);
}

/* ═══════════ LA INSTALACIÓN: un observador para todo el sitio ═══════════ */

const FRECUENTE_MS = 1200;

/**
 * Engancha el sistema al documento una sola vez. Devuelve la función que lo
 * desengancha (para las pruebas).
 */
export function instalarMovimiento(doc = globalThis.document) {
  const win = doc?.defaultView;
  if (!doc || !win || doc.__mvInstalado) return () => {};
  doc.__mvInstalado = true;

  /* ── Estados y avisos: se anima lo que CAMBIA, no lo que se monta (staging). ── */
  const ultimoAviso = new WeakMap();
  const frecuentes = new WeakSet();
  const pendientes = new Map();
  let marco = null;

  const encolar = (el, tipo) => {
    if (!pendientes.has(el)) pendientes.set(el, tipo);
    if (marco == null) marco = win.requestAnimationFrame(vaciar);
  };
  const vaciar = () => {
    marco = null;
    if (reducido()) { pendientes.clear(); return; }
    for (const [el, tipo] of pendientes) {
      if (!el.isConnected) continue;
      animar(el, tipo);
      if (tipo === "acierto") anillo(el, COLOR_ACIERTO);
    }
    pendientes.clear();
  };

  const regionDe = (nodo) => {
    const el = nodo?.nodeType === 1 ? nodo : nodo?.parentElement;
    return el?.closest?.("[aria-live]:not([aria-live='off'])") ?? null;
  };

  const aviso = (region) => {
    if (!region || frecuentes.has(region) || region.closest("[data-mv-quieto], [role='timer']")) return;
    /* Lo que solo leen los lectores de pantalla no se ve: no se anima. */
    const r = region.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    const ahora = win.performance.now();
    const antes = ultimoAviso.get(region);
    ultimoAviso.set(region, ahora);
    if (antes != null && ahora - antes < FRECUENTE_MS) { frecuentes.add(region); return; }
    encolar(region, "aviso");
  };

  const obs = new win.MutationObserver((lista) => {
    for (const m of lista) {
      if (m.type === "attributes") {
        const el = m.target;
        if (el.closest?.("[data-mv-quieto]")) continue;
        const nuevo = el.getAttribute(m.attributeName);
        if (nuevo === m.oldValue) continue;
        if (m.attributeName === "aria-valuenow") {
          if (Number(nuevo) > Number(m.oldValue)) encolar(el, "avance");
          continue;
        }
        if (m.attributeName === "data-nodo") {
          /* Los puntos del avance: el que se completa salta; el que toca, se marca. */
          if (nuevo === "hecho") encolar(el, "acierto");
          else if (nuevo === "actual") encolar(el, "elegido");
          continue;
        }
        if (m.attributeName.startsWith("data-")) {
          const tipo = tipoDeRetro(m.attributeName, nuevo);
          if (tipo) encolar(el, tipo);
        } else if (nuevo === "true") {
          encolar(el, "elegido");
        }
      } else {
        const region = regionDe(m.target);
        if (region) aviso(region);
        /* Un panel de retroalimentación que acaba de aparecer también cuenta. */
        for (const nodo of m.addedNodes ?? []) {
          if (nodo.nodeType !== 1 || nodo.closest?.("[data-mv-quieto]")) continue;
          const candidatos = nodo.matches?.(SELECTOR_RETRO) ? [nodo] : [];
          const dentro = nodo.querySelectorAll?.(SELECTOR_RETRO) ?? [];
          if (candidatos.length + dentro.length > TOPE_RETRO_NUEVA) continue;
          for (const el of [...candidatos, ...dentro]) {
            for (const a of ATRIBUTOS_RETRO) {
              const tipo = el.hasAttribute(a) ? tipoDeRetro(a, el.getAttribute(a)) : null;
              if (tipo === "acierto" || tipo === "error") { encolar(el, tipo); break; }
            }
          }
        }
      }
    }
  });
  obs.observe(doc.body ?? doc.documentElement, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeOldValue: true,
    attributeFilter: [...ATRIBUTOS_RETRO, "aria-pressed", "aria-checked", "aria-selected", "aria-valuenow", "data-nodo"],
  });

  /* ── De un punto al siguiente (ver direccionDePaso). ── */
  const alClic = (e) => {
    if (e.__mvReenviado || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!doc.startViewTransition || reducido() || enTransicion) return;
    const boton = e.target?.closest?.("button, [role='button']");
    if (!boton || boton.disabled || boton.getAttribute("aria-disabled") === "true" || boton.closest("a[href], [data-mv-quieto], [data-mv-sin-paso], [data-secuencia]")) return;
    const dir = direccionDePaso(boton.getAttribute("aria-label") || boton.textContent);
    if (!dir) return;
    const caja = boton.closest(CAJA_ITEM);
    if (!caja || caja === doc.body) return;

    e.stopImmediatePropagation();
    e.preventDefault();
    const raiz = doc.documentElement;
    const antes = caja.style.viewTransitionName;
    caja.style.viewTransitionName = "mv-item";
    raiz.dataset.mvTransicion = `item-${dir}`;
    enTransicion = true;
    let hecho = false;
    const reenviar = () => {
      if (hecho) return;
      hecho = true;
      const otro = new win.MouseEvent("click", { bubbles: true, cancelable: true, view: win, detail: e.detail, clientX: e.clientX, clientY: e.clientY });
      otro.__mvReenviado = true;
      try { flushSync(() => boton.dispatchEvent(otro)); } catch { boton.dispatchEvent(otro); }
    };
    const fin = () => {
      enTransicion = false;
      delete raiz.dataset.mvTransicion;
      caja.style.viewTransitionName = antes;
    };
    let t;
    try { t = doc.startViewTransition(reenviar); } catch { fin(); reenviar(); return; }
    t.updateCallbackDone?.catch(() => reenviar());
    (t.finished ?? Promise.resolve()).then(fin, fin);
  };
  doc.addEventListener("click", alClic, true);

  /* ── Ganar FP: la pastilla de la cuenta celebra mientras el número sube. ── */
  const dejarFP = escucharFP(({ fp } = {}) => {
    if (!(Number(fp) > 0) || reducido()) return;
    const pastilla = doc.querySelector("[data-fp-pastilla]");
    const cuerpo = pastilla?.closest("button") ?? pastilla;
    if (!cuerpo) return;
    animar(cuerpo, "ganar");
    win.setTimeout(() => anillo(cuerpo, COLOR_FP), 200);
  });

  /* ── Profundidad: solo con puntero que flota (ratón, lápiz), no con el dedo. ── */
  const conPuntero = () => { try { return win.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch { return false; } };
  let actual = null;
  let pedido = null;
  let ultimo = null;

  const soltar = (el) => {
    if (!el) return;
    const desde = el.style.rotate;
    el.style.rotate = "";
    el.style.translate = "";
    if (el.parentElement && el.parentElement.dataset.mvPerspectiva === "puesta") {
      el.parentElement.style.perspective = "";
      delete el.parentElement.dataset.mvPerspectiva;
    }
    if (desde && typeof el.animate === "function") {
      try { el.animate([{ rotate: desde, translate: "0 -3px" }, { rotate: "0 0 1 0deg", translate: "0 0" }], { duration: TIEMPO, easing: RESORTE }); } catch { /* quieto */ }
    }
  };

  const mover = (e) => {
    if (e.pointerType === "touch" || reducido() || !conPuntero()) return;
    const el = e.target?.closest?.(RELIEVE) ?? null;
    if (el !== actual) {
      soltar(actual);
      actual = el;
      if (el?.parentElement && !el.parentElement.style.perspective) {
        el.parentElement.style.perspective = "900px";
        el.parentElement.dataset.mvPerspectiva = "puesta";
      }
    }
    if (!el) return;
    ultimo = e;
    if (pedido == null) {
      pedido = win.requestAnimationFrame(() => {
        pedido = null;
        if (!actual || !ultimo) return;
        const [x, y, g] = giroHacia(ultimo.clientX, ultimo.clientY, actual.getBoundingClientRect());
        actual.style.rotate = `${x} ${y} 0 ${g}deg`;
        actual.style.translate = "0 -3px";
      });
    }
  };
  const salir = (e) => { if (!e.relatedTarget || !actual?.contains(e.relatedTarget)) { soltar(actual); actual = null; } };

  const fuera = (e) => { if (actual && e.target?.closest?.(RELIEVE) === actual) salir(e); };
  doc.addEventListener("pointermove", mover, { passive: true });
  doc.addEventListener("pointerout", fuera, { passive: true });

  return () => {
    obs.disconnect();
    doc.removeEventListener("click", alClic, true);
    dejarFP();
    doc.removeEventListener("pointermove", mover);
    doc.removeEventListener("pointerout", fuera);
    if (marco != null) win.cancelAnimationFrame(marco);
    soltar(actual);
    delete doc.__mvInstalado;
  };
}
