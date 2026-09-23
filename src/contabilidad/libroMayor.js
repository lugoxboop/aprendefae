import { generador } from "../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LIBRO MAYOR COMO RED — la escena, sin React y sin canvas.
 *
 * Cuentas T derivando en tres planos de profundidad, y cada pocos segundos un
 * asiento: un arco entre dos de ellas y el MISMO monto anotado dos veces, al
 * debe de una y al haber de la otra. Eso es la partida doble, y es lo único
 * que el fondo tiene que decir.
 *
 * ═══════════ POR QUÉ LA ESCENA VIVE AQUÍ Y NO EN EL COMPONENTE ═══════════
 *
 * Casi todo lo que la ficha exige es comprobable —cuántas cuentas, que no
 * formen cuadrícula, cada cuánto entra un arco, cuántos pueden convivir, que
 * el monto salga dos veces y sea el mismo, que no lleve signo, que el debe sea
 * teal y el haber ámbar—, pero solo si no está enterrado dentro de un
 * requestAnimationFrame. Aquí es una función pura que avanza con un `dt`, así
 * que una prueba puede correr tres minutos de fondo en un milisegundo y mirar
 * lo que pasó.
 *
 * SEMBRADO. `crearEscena` recibe una semilla y el mismo número da siempre la
 * misma escena. Sin eso las pruebas medirían ruido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ───────────────────────────── los montos ───────────────────────────── */

export const RANGO_MONTO = { min: 50_000, max: 5_000_000 };

/*
 * Peso colombiano: punto de miles y sin decimales. Se agrupa a mano y no con
 * toLocaleString porque el resultado tiene que ser idéntico en el navegador de
 * un estudiante y en la prueba, sin depender de los datos de idioma que traiga
 * cada runtime.
 */
export function formatearMonto(valor) {
  const entero = Math.max(0, Math.round(Number(valor) || 0));
  const digitos = String(entero);
  let salida = "";
  for (let i = 0; i < digitos.length; i += 1) {
    if (i > 0 && (digitos.length - i) % 3 === 0) salida += ".";
    salida += digitos[i];
  }
  return `$${salida}`;
}

/*
 * Un monto realista: dentro del rango y redondeado a los quinientos, que es
 * como se ven las cifras de un libro de verdad. $1.240.000 y $320.500 se leen
 * como dinero; $1.239.847 se lee como ruido.
 */
export function montoAleatorio(rnd) {
  const bruto = RANGO_MONTO.min + rnd() * (RANGO_MONTO.max - RANGO_MONTO.min);
  return Math.round(bruto / 500) * 500;
}

/* ───────────────────────────── los planos ───────────────────────────── */

/*
 * Tres planos. El lejano es más pequeño, más tenue y algo desenfocado; el
 * cercano, nítido. Las opacidades son las de la ficha: 25 % lo lejano, 50 % lo
 * cercano.
 */
export const PLANOS = [
  { escala: 0.55, opacidad: 0.25, desenfoque: 1.4, grosor: 1 },
  { escala: 0.78, opacidad: 0.36, desenfoque: 0.6, grosor: 1.2 },
  { escala: 1, opacidad: 0.5, desenfoque: 0, grosor: 1.4 },
];

/* ───────────────────────────── los colores ───────────────────────────── */

/*
 * El debe en teal y el haber en ámbar. Coral no aparece: significa error en
 * todo el sitio y un asiento contable no es un error.
 */
export const COLOR_DEBE = "42,157,143";   // #2A9D8F
export const COLOR_HABER = "233,196,106"; // #E9C46A
export const COLOR_CUENTA = "61,90,128";  // #3D5A80

/* ───────────────────────────── los tiempos ───────────────────────────── */

export const CUENTAS = { min: 8, max: 14 };
/* Cruzar la pantalla entera, en segundos. */
export const TRAVESIA = { min: 60, max: 90 };
/* Cada cuánto entra un asiento. */
export const CADENCIA = { min: 3, max: 5 };
/*
 * Cuántos arcos pueden convivir. Tres: con la cadencia y la vida de abajo
 * casi nunca llegan a tantos, y el tope está para que una pestaña que vuelve
 * de segundo plano no suelte diez de golpe.
 */
export const ARCOS_A_LA_VEZ = 3;
/* Un arco: se traza, se sostiene y se desvanece. */
export const ARCO = { trazo: 0.9, sostén: 1.3, desvanecido: 0.9 };
export const VIDA_ARCO = ARCO.trazo + ARCO.sostén + ARCO.desvanecido;
/* El monto aparece con el arco ya trazado y se va con él: 2,2 s a la vista. */
export const VIDA_MONTO = VIDA_ARCO - ARCO.trazo;

/* ──────────────────────────── la textura del fondo ──────────────────────────── */

/*
 * LA CAPA CON MÁS RIESGO DE COMPETIR, y competía.
 *
 * Con 7 columnas al 10 % y las cifras cada 22 px, la pantalla quedaba cubierta
 * de números perfectamente legibles que se solapaban entre sí —dos columnas
 * cruzadas daban manchas del doble de densidad— y le disputaban la atención al
 * texto de delante. Se vio a 375 px, no se dedujo.
 *
 * Ahora son 5 columnas repartidas con separación mínima, al 8 % —el suelo del
 * rango de la ficha—, y con el triple de aire entre cifras. Es textura, que es
 * lo que tenía que ser.
 */
export const COLUMNAS = { cuantas: 5, opacidad: 0.08, cifrasPorColumna: 9, separacion: 66 };

/* ───────────────────────────── crear la escena ───────────────────────────── */

/*
 * Las cuentas se reparten con un rechazo por distancia mínima: se propone un
 * sitio al azar y se descarta si cae encima de otra. Eso da un reparto
 * irregular —que es lo que pide la ficha— sin el riesgo de que dos se
 * superpongan, que es lo que pasaría con puro azar. Una cuadrícula quedaría
 * ordenada y muerta; el azar puro, apelotonado.
 */
export function crearEscena({ ancho = 1000, alto = 800, semilla = "contabilidad" } = {}) {
  const rnd = generador(String(semilla));
  const cuantas = CUENTAS.min + Math.floor(rnd() * (CUENTAS.max - CUENTAS.min + 1));
  const separacion = Math.min(ancho, alto) * 0.17;

  const cuentas = [];
  let intentos = 0;
  while (cuentas.length < cuantas && intentos < cuantas * 200) {
    intentos += 1;
    const x = rnd() * ancho;
    const y = rnd() * alto;
    if (cuentas.some((c) => Math.hypot(c.x - x, c.y - y) < separacion)) continue;
    /* Los tres planos se reparten por turnos: ninguno se queda vacío. */
    const plano = cuentas.length % PLANOS.length;
    const travesia = TRAVESIA.min + rnd() * (TRAVESIA.max - TRAVESIA.min);
    const angulo = rnd() * Math.PI * 2;
    const velocidad = ancho / travesia;
    cuentas.push({
      id: cuentas.length,
      x0: x, y0: y, x, y,
      plano,
      /* Deriva lenta y, encima, un bamboleo: la trayectoria no es una recta. */
      vx: Math.cos(angulo) * velocidad,
      vy: Math.sin(angulo) * velocidad * 0.5,
      faseBamboleo: rnd() * Math.PI * 2,
      amplitudBamboleo: separacion * (0.25 + rnd() * 0.35),
      periodoBamboleo: 18 + rnd() * 16,
    });
  }

  /*
   * Repartidas por franjas: cada columna cae dentro de su propio tramo del
   * ancho, con algo de holgura dentro. Con x puramente al azar dos columnas se
   * cruzaban y la mancha resultante dejaba de ser textura.
   */
  const franja = ancho / COLUMNAS.cuantas;
  const columnas = Array.from({ length: COLUMNAS.cuantas }, (_, i) => ({
    id: i,
    x: franja * i + franja * (0.3 + rnd() * 0.4),
    y: rnd() * alto,
    velocidad: (alto / (TRAVESIA.max * 1.6)) * (0.6 + rnd() * 0.5),
    cifras: Array.from({ length: COLUMNAS.cifrasPorColumna }, () => formatearMonto(montoAleatorio(rnd))),
  }));

  return {
    ancho, alto, rnd,
    t: 0,
    cuentas,
    columnas,
    arcos: [],
    proximoArco: CADENCIA.min + rnd() * (CADENCIA.max - CADENCIA.min),
    /* Para las pruebas y para el tope: cuántos asientos se han emitido. */
    asientos: 0,
  };
}

/* ───────────────────────────── avanzarla ───────────────────────────── */

/** Dónde está una cuenta en el instante `t`, con su deriva y su bamboleo. */
export function posicionDe(cuenta, t, ancho, alto) {
  const avanceX = cuenta.x0 + cuenta.vx * t;
  const avanceY = cuenta.y0 + cuenta.vy * t;
  const giro = (t / cuenta.periodoBamboleo) * Math.PI * 2 + cuenta.faseBamboleo;
  /* El bamboleo va perpendicular a la deriva: curva el camino, no lo alarga. */
  const norma = Math.hypot(cuenta.vx, cuenta.vy) || 1;
  const px = -cuenta.vy / norma;
  const py = cuenta.vx / norma;
  const desvio = Math.sin(giro) * cuenta.amplitudBamboleo;
  /* Y se envuelve por los bordes con margen, para que no aparezcan de la nada. */
  const margen = Math.min(ancho, alto) * 0.14;
  const envolver = (v, tope) => ((((v + margen) % (tope + margen * 2)) + tope + margen * 2) % (tope + margen * 2)) - margen;
  return {
    x: envolver(avanceX + px * desvio, ancho),
    y: envolver(avanceY + py * desvio, alto),
  };
}

/**
 * Emite un asiento entre dos cuentas distintas.
 *
 * `desde` es la cuenta que se DEBITA —su monto va al debe, en teal— y `hasta`
 * la que se ACREDITA —al haber, en ámbar—. El monto es uno solo y se anota dos
 * veces: eso es la partida doble, y es la razón de que el fondo exista.
 */
export function emitirAsiento(escena) {
  if (escena.cuentas.length < 2) return null;
  if (escena.arcos.length >= ARCOS_A_LA_VEZ) return null;
  const a = Math.floor(escena.rnd() * escena.cuentas.length);
  let b = Math.floor(escena.rnd() * escena.cuentas.length);
  if (b === a) b = (b + 1) % escena.cuentas.length;

  const monto = montoAleatorio(escena.rnd);
  const arco = {
    id: escena.asientos,
    debe: escena.cuentas[a].id,
    haber: escena.cuentas[b].id,
    monto,
    texto: formatearMonto(monto),
    edad: 0,
    curvatura: (escena.rnd() - 0.5) * 0.9,
  };
  escena.arcos.push(arco);
  escena.asientos += 1;
  return arco;
}

/** Cuánto se ha trazado del arco (0..1) y cuánta opacidad le queda (0..1). */
export function faseDelArco(edad) {
  const progreso = Math.max(0, Math.min(1, edad / ARCO.trazo));
  const restante = VIDA_ARCO - edad;
  const opacidad = restante <= 0 ? 0 : Math.max(0, Math.min(1, restante / ARCO.desvanecido));
  /* El monto solo se ve cuando el arco ya está trazado. */
  return { progreso, opacidad, montoVisible: edad >= ARCO.trazo && restante > 0 };
}

/**
 * Avanza la escena `dt` segundos.
 *
 * El paso se acota: una pestaña que vuelve de segundo plano traía un dt de
 * treinta segundos y, sin tope, soltaba una ráfaga de asientos de golpe.
 */
export function avanzarEscena(escena, dt) {
  const paso = Math.max(0, Math.min(dt, 0.05));
  escena.t += paso;

  for (const cuenta of escena.cuentas) {
    const p = posicionDe(cuenta, escena.t, escena.ancho, escena.alto);
    cuenta.x = p.x;
    cuenta.y = p.y;
  }

  for (const columna of escena.columnas) {
    columna.y = ((columna.y + columna.velocidad * paso) % (escena.alto * 1.3)) - escena.alto * 0.15;
  }

  escena.proximoArco -= paso;
  if (escena.proximoArco <= 0) {
    emitirAsiento(escena);
    escena.proximoArco = CADENCIA.min + escena.rnd() * (CADENCIA.max - CADENCIA.min);
  }

  for (const arco of escena.arcos) arco.edad += paso;
  escena.arcos = escena.arcos.filter((a) => a.edad < VIDA_ARCO);

  return escena;
}

/* ───────────────────────────── el cursor ───────────────────────────── */

/* A qué distancia se considera que el cursor está «sobre» una cuenta. */
export const RADIO_CURSOR = 90;

/** La cuenta más cercana al cursor, o null si ninguna está lo bastante cerca. */
export function cuentaBajoCursor(escena, x, y, radio = RADIO_CURSOR) {
  let mejor = null;
  let mejorDistancia = radio;
  for (const cuenta of escena.cuentas) {
    const d = Math.hypot(cuenta.x - x, cuenta.y - y);
    if (d < mejorDistancia) { mejor = cuenta; mejorDistancia = d; }
  }
  return mejor;
}

/**
 * Los arcos aún vivos que tocaron esa cuenta. Son los que se iluminan al
 * acercar el cursor: los asientos recientes de esa cuenta, no todos.
 */
export function arcosDeLaCuenta(escena, cuentaId) {
  if (cuentaId === null || cuentaId === undefined) return [];
  return escena.arcos.filter((a) => a.debe === cuentaId || a.haber === cuentaId);
}
