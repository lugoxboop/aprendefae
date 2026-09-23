import { useEffect, useRef } from "react";
import { shouldRenderStatic, isNarrowViewport } from "../../utils/device.js";
import {
  crearEscena, avanzarEscena, posicionDe, faseDelArco,
  cuentaBajoCursor, arcosDeLaCuenta,
  PLANOS, COLOR_DEBE, COLOR_HABER, COLOR_CUENTA, COLUMNAS, ARCO,
} from "../../contabilidad/libroMayor.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * FONDO DE CONTABILIDAD — «el libro mayor como red».
 *
 * Cuentas T derivando en tres planos y, cada pocos segundos, un asiento: un
 * arco entre dos de ellas y el MISMO monto anotado dos veces, al debe de una
 * —teal— y al haber de la otra —ámbar—. La partida doble, en movimiento.
 *
 * LA ESCENA NO VIVE AQUÍ. Cuántas cuentas hay, cada cuánto entra un asiento,
 * cuántos arcos pueden convivir y cuánto dura un monto los decide
 * contabilidad/libroMayor.js, que es una función pura y se puede medir sin
 * pintar un píxel. Este archivo solo dibuja lo que aquel calcula.
 *
 * ═══════════ LAS CUATRO CAPAS, DE ATRÁS HACIA DELANTE ═══════════
 *
 *   4. columnas de cifras, ilegibles a propósito (8 % de opacidad)
 *   1. las cuentas T, en tres planos: las lejanas pequeñas, tenues y algo
 *      desenfocadas; las cercanas nítidas
 *   2. los arcos, que se trazan progresivamente y se desvanecen
 *   3. los montos, dos por asiento, uno a cada lado
 *
 * ═══════════ CIFRAS TABULARES EN CANVAS, DE VERDAD ═══════════
 *
 * La ficha pide `font-variant-numeric: tabular-nums`. En canvas esa propiedad
 * NO EXISTE: el atajo `ctx.font` no admite variantes numéricas y no hay forma
 * de encender la característica `tnum` de la fuente. Poner la propiedad en el
 * estilo del lienzo no haría nada, y alguien lo intentaría.
 *
 * Así que se implementa el efecto, que es lo que importa: cada carácter se
 * dibuja en una celda del ancho del «0», así que todas las cifras ocupan lo
 * mismo por dígito y las columnas alinean como en un libro de verdad.
 *
 * ═══════════ EL MÓVIL NO TOCA EL FONDO ═══════════
 *
 * Sin escuchas táctiles de ningún tipo: el fondo corre su ciclo solo. El dedo
 * es para navegar el contenido. En escritorio, acercar el cursor a una cuenta
 * ilumina los asientos suyos que sigan en pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BG = "#0E1B2E";

/* Cuánto tarda el resaltado del cursor en encenderse y apagarse. */
const SUAVIZADO = 5;

export default function LibroMayorBackground({ animation = true, semilla = "contabilidad" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return undefined;

    const quieto = shouldRenderStatic(animation);
    const movil = isNarrowViewport();
    const hayFiltro = typeof ctx.filter === "string";

    let raf = 0;
    let ancho = 0;
    let alto = 0;
    let escena = null;
    let texturaFondo = null;

    /* Dónde está el cursor y con cuánta fuerza está encendido el resaltado. */
    const cursor = { x: -1e4, y: -1e4, dentro: false };
    let resaltada = null;
    let fuerza = 0;

    /* ─────────────── cifras con dígitos de ancho fijo ─────────────── */

    const anchoDeCelda = () => ctx.measureText("0").width;

    /*
     * Dibuja un texto con cada carácter en una celda del mismo ancho. Es el
     * `tabular-nums` que el canvas no ofrece. `alineacion` decide si el texto
     * crece a la derecha o a la izquierda del punto dado.
     */
    const cifra = (texto, x, y, alineacion = "left") => {
      const celda = anchoDeCelda();
      const total = texto.length * celda;
      let cx = alineacion === "right" ? x - total : x;
      for (const caracter of texto) {
        /* El punto de miles y el signo de peso no merecen una celda entera. */
        const estrecho = caracter === "." || caracter === "$";
        const ancho = estrecho ? celda * 0.55 : celda;
        ctx.fillText(caracter, cx + (ancho - ctx.measureText(caracter).width) / 2, y);
        cx += ancho;
      }
      return total;
    };

    /* ─────────────── capa 4, pintada una sola vez ─────────────── */

    /*
     * Las columnas de cifras no cambian, solo se desplazan. Se pintan una vez
     * en un lienzo aparte y después se copian con un desfase: así el trabajo
     * por dígito se paga una vez y no sesenta veces por segundo.
     */
    const prepararTextura = () => {
      const cvTextura = document.createElement("canvas");
      cvTextura.width = Math.max(1, Math.round(ancho));
      cvTextura.height = Math.max(1, Math.round(alto * 1.3));
      const tx = cvTextura.getContext("2d");
      if (!tx) return null;
      /* 10 px y no 11: a 11 las cifras se leían, y tienen que ser textura. */
      tx.font = `10px Inter, system-ui, sans-serif`;
      tx.textBaseline = "middle";
      tx.fillStyle = `rgba(203,220,242,${COLUMNAS.opacidad})`;
      const celda = tx.measureText("0").width;
      /* El triple de aire que antes: sin esto las columnas formaban un muro. */
      const alturaLinea = COLUMNAS.separacion;
      for (const columna of escena.columnas) {
        columna.cifras.forEach((texto, i) => {
          const y = (columna.y + i * alturaLinea) % cvTextura.height;
          /* Alineadas a la derecha, como una columna de libro mayor. */
          let cx = columna.x;
          for (let k = texto.length - 1; k >= 0; k -= 1) {
            const c = texto[k];
            const w = c === "." || c === "$" ? celda * 0.55 : celda;
            cx -= w;
            tx.fillText(c, cx + (w - tx.measureText(c).width) / 2, y);
          }
        });
      }
      return cvTextura;
    };

    /*
     * MEDIR NO PUEDE COMETER UN LIENZO DE CERO.
     *
     * Pasó en producción: un `resize` llegó mientras el elemento todavía no
     * tenía tamaño, se fijó cv.width = 0 y se creó una escena de ancho 0. El
     * fondo se quedó en negro PARA SIEMPRE, porque `medir` solo volvía a
     * correr con otro `resize` y no llegaba ninguno. El elemento medía 375×812
     * y el lienzo, 0×0.
     *
     * Devuelve false cuando no hay tamaño todavía; quien llama decide si
     * reintentar. Y el bucle mira el tamaño en CADA fotograma en vez de fiarse
     * del evento, que es lo que ya hacen los otros fondos del sitio.
     */
    const medir = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (!w || !h) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2);
      ancho = w;
      alto = h;
      cv.width = Math.round(ancho * dpr);
      cv.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      escena = crearEscena({ ancho, alto, semilla });
      texturaFondo = prepararTextura();
      return true;
    };

    /* ─────────────── capa 1: una cuenta T ─────────────── */

    const dibujarCuenta = (cuenta, pos, intensidad) => {
      const plano = PLANOS[cuenta.plano];
      const brazo = 34 * plano.escala;
      const caida = 40 * plano.escala;
      const opacidad = Math.min(1, plano.opacidad * (1 + intensidad * 0.9));

      if (hayFiltro) ctx.filter = plano.desenfoque ? `blur(${plano.desenfoque}px)` : "none";
      ctx.strokeStyle = `rgba(${COLOR_CUENTA},${opacidad.toFixed(3)})`;
      ctx.lineWidth = plano.grosor;
      ctx.lineCap = "round";
      ctx.beginPath();
      /* La horizontal de arriba y la vertical que la cruza: la T de siempre. */
      ctx.moveTo(pos.x - brazo, pos.y - caida * 0.42);
      ctx.lineTo(pos.x + brazo, pos.y - caida * 0.42);
      ctx.moveTo(pos.x, pos.y - caida * 0.42);
      ctx.lineTo(pos.x, pos.y + caida * 0.58);
      ctx.stroke();
      if (hayFiltro) ctx.filter = "none";
    };

    /* ─────────────── capa 2: un arco ─────────────── */

    const dibujarArco = (arco, desde, hasta, fase, encendido) => {
      const mx = (desde.x + hasta.x) / 2;
      const my = (desde.y + hasta.y) / 2;
      const dx = hasta.x - desde.x;
      const dy = hasta.y - desde.y;
      /* El control de la curva, perpendicular a la cuerda. */
      const cx = mx - dy * arco.curvatura;
      const cy = my + dx * arco.curvatura;

      const grad = ctx.createLinearGradient(desde.x, desde.y, hasta.x, hasta.y);
      const alfa = fase.opacidad * (0.5 + encendido * 0.5);
      grad.addColorStop(0, `rgba(${COLOR_DEBE},${(alfa * 0.95).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${COLOR_HABER},${(alfa * 0.95).toFixed(3)})`);

      /*
       * Se traza progresivamente subdividiendo la curva: se recorre hasta
       * `progreso` y se para. Así el arco crece, no aparece hecho.
       */
      const pasos = 34;
      const hasta_i = Math.max(1, Math.round(pasos * fase.progreso));
      const punto = (t) => ({
        x: (1 - t) ** 2 * desde.x + 2 * (1 - t) * t * cx + t ** 2 * hasta.x,
        y: (1 - t) ** 2 * desde.y + 2 * (1 - t) * t * cy + t ** 2 * hasta.y,
      });

      /* Dos capas: un halo ancho y tenue y un núcleo fino. */
      for (const capa of [{ w: 5 * (0.6 + encendido * 0.8), a: 0.18 }, { w: 1.5, a: 1 }]) {
        ctx.globalAlpha = capa.a;
        ctx.strokeStyle = grad;
        ctx.lineWidth = capa.w;
        ctx.beginPath();
        for (let i = 0; i <= hasta_i; i += 1) {
          const p = punto(i / pasos);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    /* ─────────────── capa 3: los dos montos ─────────────── */

    /*
     * El mismo monto, dos veces: al DEBE de una cuenta —a su izquierda— y al
     * HABER de la otra —a su derecha—. Sin signos: el debe no es positivo ni el
     * haber negativo, y ponerles + y − sería enseñar mal la idea que el fondo
     * existe para insinuar.
     */
    const dibujarMontos = (arco, posDebe, posHaber, fase, encendido) => {
      if (!fase.montoVisible) return;
      const alfa = fase.opacidad * (0.75 + encendido * 0.25);
      ctx.font = "12.5px Inter, system-ui, sans-serif";
      ctx.textBaseline = "middle";

      ctx.fillStyle = `rgba(${COLOR_DEBE},${alfa.toFixed(3)})`;
      cifra(arco.texto, posDebe.x - 8, posDebe.y - 2, "right");

      ctx.fillStyle = `rgba(${COLOR_HABER},${alfa.toFixed(3)})`;
      cifra(arco.texto, posHaber.x + 8, posHaber.y - 2, "left");
    };

    /* ─────────────── el fotograma ─────────────── */

    const pintar = () => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, ancho, alto);

      /* Capa 4 — la textura, desplazándose muy despacio. */
      if (texturaFondo) {
        const desfase = (escena.t * 6) % texturaFondo.height;
        /* 1,4 px: con 0,7 las cifras seguían legibles una a una. */
        if (hayFiltro) ctx.filter = "blur(1.4px)";
        ctx.drawImage(texturaFondo, 0, desfase - texturaFondo.height);
        ctx.drawImage(texturaFondo, 0, desfase);
        if (hayFiltro) ctx.filter = "none";
      }

      const posiciones = new Map();
      for (const cuenta of escena.cuentas) {
        posiciones.set(cuenta.id, posicionDe(cuenta, escena.t, ancho, alto));
      }

      const iluminados = new Set(
        (resaltada === null ? [] : arcosDeLaCuenta(escena, resaltada)).map((a) => a.id),
      );

      /* Capa 1 — las cuentas, de lejos a cerca. */
      const porPlano = [...escena.cuentas].sort((a, b) => a.plano - b.plano);
      for (const cuenta of porPlano) {
        const suyo = cuenta.id === resaltada ? fuerza : 0;
        dibujarCuenta(cuenta, posiciones.get(cuenta.id), suyo);
      }

      /* Capas 2 y 3 — los asientos. */
      for (const arco of escena.arcos) {
        const fase = faseDelArco(arco.edad);
        if (fase.opacidad <= 0) continue;
        const desde = posiciones.get(arco.debe);
        const hasta = posiciones.get(arco.haber);
        if (!desde || !hasta) continue;
        const encendido = iluminados.has(arco.id) ? fuerza : 0;
        dibujarArco(arco, desde, hasta, fase, encendido);
        dibujarMontos(arco, desde, hasta, fase, encendido);
      }
    };

    /* ─────────────── gama baja: un fotograma y nada más ─────────────── */

    if (quieto) {
      /*
       * Se reintenta hasta que el elemento tenga tamaño: al montar dentro de
       * una transición puede tardar unos fotogramas en tenerlo.
       */
      let arranque = 0;
      let intentos = 0;
      const unFotograma = () => {
        if (!medir()) {
          if (intentos++ < 120) arranque = requestAnimationFrame(unFotograma);
          return;
        }
        /* Se adelanta la escena para que el fotograma tenga un asiento a la vista. */
        for (let i = 0; i < 80; i += 1) avanzarEscena(escena, 0.05);
        pintar();
      };
      unFotograma();
      const alRedimensionar = () => { intentos = 0; unFotograma(); };
      window.addEventListener("resize", alRedimensionar);
      return () => {
        cancelAnimationFrame(arranque);
        window.removeEventListener("resize", alRedimensionar);
      };
    }

    medir();

    /* ─────────────── el cursor, solo en escritorio ─────────────── */

    const alMover = (e) => {
      const r = cv.getBoundingClientRect();
      cursor.x = e.clientX - r.left;
      cursor.y = e.clientY - r.top;
      cursor.dentro = true;
    };
    const alSalir = () => { cursor.dentro = false; };

    if (!movil) {
      window.addEventListener("pointermove", alMover, { passive: true });
      window.addEventListener("pointerleave", alSalir, { passive: true });
    }

    /* ─────────────── el bucle ─────────────── */

    let previo = performance.now();
    const paso = (ahora) => {
      const dt = Math.min((ahora - previo) / 1000, 0.05);
      previo = ahora;

      /*
       * EL TAMAÑO SE MIRA AQUÍ, NO EN EL EVENTO. Un `resize` puede llegar con
       * el elemento todavía a cero, y entonces no llega ningún otro y el fondo
       * se queda en negro. Comprobarlo cada fotograma lo hace irrelevante: en
       * cuanto el elemento tiene tamaño, se mide. Es lo que ya hacen los otros
       * fondos del sitio.
       */
      if (!escena || cv.clientWidth !== ancho || cv.clientHeight !== alto) {
        if (!medir()) { raf = requestAnimationFrame(paso); return; }
      }

      avanzarEscena(escena, dt);

      if (!movil) {
        const bajo = cursor.dentro ? cuentaBajoCursor(escena, cursor.x, cursor.y) : null;
        const idBajo = bajo ? bajo.id : null;
        if (idBajo !== resaltada && fuerza <= 0.02) resaltada = idBajo;
        /* Sube y baja con suavizado: nada de saltos al cruzar una cuenta. */
        const meta = resaltada !== null && resaltada === idBajo ? 1 : 0;
        fuerza += (meta - fuerza) * Math.min(1, SUAVIZADO * dt);
        if (fuerza <= 0.02 && meta === 0) { fuerza = 0; resaltada = idBajo; }
      }

      pintar();
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    /*
     * Sin escucha de `resize` en el camino animado: el bucle ya mira el tamaño
     * en cada fotograma, así que el evento no aportaba nada y sí podía hacer
     * daño —era justo el que cometía el lienzo de cero—.
     */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerleave", alSalir);
    };
  }, [animation, semilla]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export { ARCO };
