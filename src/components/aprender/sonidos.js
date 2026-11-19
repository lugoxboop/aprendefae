/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SONIDOS DEL APRENDER (Mateo, 19 nov.: «que tenga sonidos, que sea más
 * llamativo»).
 *
 * Sintetizados en el navegador con Web Audio: no hay archivos que descargar,
 * no pesan nada y no dependen de ningún servicio. Cada sonido es una o varias
 * notas cortas con su envolvente; el volumen general es bajo a propósito,
 * porque esto se usa en clase y en el bus.
 *
 * Reglas:
 *   · Nada suena antes del primer toque del estudiante (el navegador lo exige
 *     y además es lo correcto: entrar a una página no debe hacer ruido).
 *   · Se pueden apagar con el botón de la portada; la elección se recuerda en
 *     este dispositivo (localStorage, «fae-sonido»). No es dato de estudiante.
 *   · Si el navegador no tiene Web Audio, todo sigue funcionando en silencio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CLAVE = "fae-sonido";
const VOLUMEN = 0.16;

let contexto = null;
let maestro = null;
const oyentes = new Set();

export function sonidoEncendido() {
  try {
    return globalThis.localStorage?.getItem(CLAVE) !== "apagado";
  } catch {
    return true;
  }
}

export function ponerSonido(encendido) {
  try {
    globalThis.localStorage?.setItem(CLAVE, encendido ? "encendido" : "apagado");
  } catch {
    /* Sin almacenamiento la elección dura lo que dure la página. */
  }
  estadoEnMemoria = encendido;
  oyentes.forEach((f) => f(encendido));
}

let estadoEnMemoria = null;
const encendido = () => (estadoEnMemoria ?? sonidoEncendido());

export function alCambiarSonido(f) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

function audio() {
  if (contexto) return contexto;
  const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Ctx) return null;
  try {
    contexto = new Ctx();
    maestro = contexto.createGain();
    maestro.gain.value = VOLUMEN;
    maestro.connect(contexto.destination);
  } catch {
    contexto = null;
  }
  return contexto;
}

/* Una nota: frecuencia, cuándo empieza (s), cuánto dura (s), forma y volumen relativo. */
function nota(ctx, { f, f2 = null, t = 0, d = 0.12, forma = "sine", v = 1 }) {
  const ahora = ctx.currentTime + t;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = forma;
  osc.frequency.setValueAtTime(f, ahora);
  if (f2) osc.frequency.exponentialRampToValueAtTime(f2, ahora + d);
  env.gain.setValueAtTime(0.0001, ahora);
  env.gain.exponentialRampToValueAtTime(v, ahora + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, ahora + d);
  osc.connect(env);
  env.connect(maestro);
  osc.start(ahora);
  osc.stop(ahora + d + 0.02);
}

/*
 * El repertorio. Pocas piezas y siempre las mismas: el oído aprende rápido
 * que «ding-ding» es acierto y que el arpegio largo es una pieza terminada.
 */
const REPERTORIO = {
  /* Un toque cualquiera: un clic suave, casi táctil. */
  toque: (c) => nota(c, { f: 1250, f2: 900, d: 0.05, forma: "sine", v: 0.35 }),
  /* Avanzar de pantalla: dos notas que suben. */
  avanza: (c) => {
    nota(c, { f: 660, d: 0.09, forma: "triangle", v: 0.5 });
    nota(c, { f: 990, t: 0.07, d: 0.12, forma: "triangle", v: 0.45 });
  },
  /* Volver: las mismas dos, bajando y más quietas. */
  vuelve: (c) => {
    nota(c, { f: 880, d: 0.08, forma: "triangle", v: 0.3 });
    nota(c, { f: 620, t: 0.06, d: 0.1, forma: "triangle", v: 0.28 });
  },
  /* Acierto: campanita de tres notas (do-mi-sol). */
  acierto: (c) => {
    nota(c, { f: 1046.5, d: 0.16, forma: "sine", v: 0.6 });
    nota(c, { f: 1318.5, t: 0.08, d: 0.18, forma: "sine", v: 0.55 });
    nota(c, { f: 1568, t: 0.16, d: 0.32, forma: "sine", v: 0.5 });
    nota(c, { f: 3136, t: 0.16, d: 0.22, forma: "sine", v: 0.12 });
  },
  /* Error: un «bonc» grave y corto. Avisa sin regañar. */
  error: (c) => {
    nota(c, { f: 240, f2: 150, d: 0.22, forma: "sine", v: 0.7 });
    nota(c, { f: 180, f2: 120, t: 0.05, d: 0.2, forma: "triangle", v: 0.25 });
  },
  /* Se desbloquea «Siguiente» tras resolver: un destello. */
  listo: (c) => {
    nota(c, { f: 1568, d: 0.1, forma: "sine", v: 0.35 });
    nota(c, { f: 2093, t: 0.06, d: 0.16, forma: "sine", v: 0.3 });
  },
  /* Pieza terminada: arpegio que sube y queda brillando. */
  logro: (c) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(c, { f, t: i * 0.085, d: 0.26, forma: "triangle", v: 0.5 }));
    nota(c, { f: 1567.98, t: 0.34, d: 0.5, forma: "sine", v: 0.35 });
    nota(c, { f: 2093, t: 0.42, d: 0.45, forma: "sine", v: 0.18 });
  },
};

export const SONIDOS = Object.keys(REPERTORIO);

export function sonar(nombre) {
  if (!encendido()) return;
  const tocar = REPERTORIO[nombre];
  if (!tocar) return;
  const ctx = audio();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") ctx.resume();
    tocar(ctx);
  } catch {
    /* Un sonido que falla no rompe la pantalla. */
  }
}
