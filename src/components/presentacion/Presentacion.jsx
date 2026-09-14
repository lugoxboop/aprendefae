import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * UNA PRESENTACIÓN PARA PROYECTAR EN CLASE.
 *
 * Todo el sitio está pensado para un estudiante solo, con el teléfono. Esto no:
 * lo proyecta un profesor y lo avanza mientras habla. Tres cosas cambian.
 *
 * ═══════════ 1. EL TEXTO SE MIDE CONTRA LA IMAGEN, NO CONTRA EL PÍXEL ═══════════
 *
 * Lo que decide si se lee desde la sexta fila es qué fracción del ALTO de la
 * imagen ocupa una letra, así que los tamaños van en vh:
 *
 *   --pres-min       3 vh    el suelo: etiquetas, botones, rótulos
 *   --pres-lectura   3,6 vh  el texto que se lee
 *   --pres-destacado 4,6 vh  la pregunta, la medida
 *   --pres-titulo    6 vh    el título de la escena
 *
 * El suelo sale de dos cuentas que coinciden. A seis alturas de imagen —la
 * sexta fila de un aula normal— una mayúscula de 3 vh subtiende unos 12
 * minutos de arco: el doble del límite de agudeza, dentro de lo que se lee
 * sin esfuerzo en etiquetas cortas. Y es lo mismo que la regla clásica de las
 * diapositivas, 18 pt como mínimo en una lámina de 7,5 pulgadas de alto (un
 * 3,3 %). A 1080 p son unos 32 px; el suelo del resto del sitio, 12 px, sería
 * un 1,1 % de la imagen y no se leería desde la mitad del aula.
 *
 * SI NO CABE, ENCOGE; NO SE DESPLAZA. Con un mando no se puede desplazar la
 * página, así que una escena que no cabe en el alto de la imagen se queda a
 * medias. En 16:9 —1920×1080, 1366×768— las cuatro escenas de Política Fiscal
 * caben con el suelo entero. En un proyector 4:3 (1024×768) las columnas son
 * más estrechas, el texto se parte en más líneas y dos escenas no caben: ahí
 * el texto encoge lo justo, nunca por debajo del 80 % (2,4 vh). Es la única
 * excepción al suelo, y es a propósito: entre letra algo menor y media escena
 * fuera de la imagen, la letra algo menor.
 *
 * ═══════════ 2. SE PROYECTA PRIMERO, SE REPASA EN EL TELÉFONO DESPUÉS ═══════════
 *
 * Al revés que el resto del sitio. En pantalla apaisada manda la proyección:
 * todo en vh, a escena completa. En vertical o por debajo de 760 px —el
 * teléfono con el que se repasa antes de clase— los mismos elementos pasan a
 * una columna con los tamaños del sitio, sin nada por debajo de 14 px. Lo
 * decide una media query, como en el resto del sitio.
 *
 * ═══════════ 3. SE AVANZA SIN RATÓN, Y SE PUEDE VOLVER ═══════════
 *
 *   → · ↓ · espacio · Av Pág      SIGUIENTE
 *   ← · ↑ · Mayús+espacio · Re Pág ANTERIOR
 *   Inicio · Fin                   primera y última escena
 *   F                              proyectar a pantalla completa
 *
 * Un mando de presentación manda Av Pág / Re Pág o las flechas, y eso son
 * sus dos únicos botones. Por eso SIGUIENTE hace primero el siguiente PASO
 * pendiente de la escena —revelar la punta siguiente, abrir el siguiente
 * mecanismo, aplicar la medida, revelar la respuesta— y solo cuando no queda
 * ninguno pasa de escena. Con el mando se da la clase entera; con el ratón o
 * el dedo se toca en el orden que se quiera.
 *
 * ANTERIOR vuelve a la escena anterior y NO DESHACE NADA: el estado de cada
 * escena vive aquí, en la presentación, no dentro de la escena, así que lo
 * revelado sigue revelado al volver. Y se guarda en la pestaña: si el profesor
 * recarga sin querer en mitad de la clase, vuelve a la misma escena con lo
 * mismo revelado.
 *
 * ═══════════ QUÉ ES UNA ESCENA ═══════════
 *
 *   { id, titulo, identidad, estadoInicial, Componente,
 *     siguientePaso(estado) → estado nuevo, o null si no queda paso,
 *     textoPaso(estado)     → lo que hará ese paso, dicho en el botón }
 *
 * El estado tiene que ser JSON: se guarda en sessionStorage.
 *
 * NO PUNTÚA NI SE COMPLETA. No hay onCompletar: es material teórico.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Qué hace una tecla, o null si no es de la presentación. Pura: la prueba la llama directo. */
export function accionDeTecla(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return null;
  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
      return "siguiente";
    case " ":
    case "Spacebar":
      return e.shiftKey ? "anterior" : "siguiente";
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      return "anterior";
    case "Home":
      return "inicio";
    case "End":
      return "final";
    case "f":
    case "F":
      return "proyectar";
    default:
      return null;
  }
}

/* Lo más que encoge el texto para que una escena quepa: el suelo baja de 3 a 2,4 vh. */
const ESCALA_MINIMA = 0.8;
/* Solo proyectando: en el teléfono la página se desplaza con el dedo y los tamaños son fijos. */
const PROYECCION = "(orientation: landscape) and (min-width: 761px)";

const VERSION_GUARDADO = 1;
const claveDe = (clave) => `fae-presentacion:${clave}`;

function leerGuardado(clave, n) {
  try {
    const g = JSON.parse(sessionStorage.getItem(claveDe(clave)));
    if (!g || g.v !== VERSION_GUARDADO || !Array.isArray(g.estados) || g.estados.length !== n) return null;
    return g;
  } catch {
    return null;
  }
}

function guardar(clave, datos) {
  try {
    sessionStorage.setItem(claveDe(clave), JSON.stringify({ v: VERSION_GUARDADO, ...datos }));
  } catch {
    /* Sin almacenamiento, la presentación funciona igual: solo no sobrevive a una recarga. */
  }
}

const CSS_PRESENTACION = `
.fae-pres {
  --pres-min: max(14px, calc(3vh * var(--pres-escala, 1)));
  --pres-lectura: max(16px, calc(3.6vh * var(--pres-escala, 1)));
  --pres-destacado: max(19px, calc(4.6vh * var(--pres-escala, 1)));
  --pres-titulo: max(24px, calc(6vh * var(--pres-escala, 1)));
  --pres-hueco: max(12px, 2.2vh);
  --pres-borde: max(2px, 0.3vh);
  --pres-tinta: #F8F9FA;
  --pres-tinta-2: rgba(248,249,250,0.9);
  position: relative; display: flex; flex-direction: column; gap: var(--pres-hueco);
  min-height: 84vh; box-sizing: border-box;
  padding: var(--pres-hueco) clamp(16px, 3vw, 72px);
  border-radius: 20px; border: var(--pres-borde) solid rgba(248,249,250,0.2);
  /* Fondo propio y opaco: el fondo animado de la materia es ruido en un proyector. */
  background-color: #0E1B2E; color: var(--pres-tinta);
  font-family: Inter, sans-serif; font-size: var(--pres-lectura); line-height: 1.35;
}
.fae-pres:fullscreen { min-height: 100vh; height: 100vh; border-radius: 0; border: none; overflow: auto; }
.fae-pres-cabeza { display: flex; align-items: baseline; gap: 0 1.1em; flex-wrap: wrap; }
/*
 * El control de cuenta del sitio va fijo arriba a la derecha. Al subir la
 * escena al borde de la ventana (ver iPrevio) quedaría encima del final del
 * título —a 1024×768 tapaba «prestado»—; a pantalla completa no está.
 */
.fae-pres:not(:fullscreen) .fae-pres-cabeza { padding-right: 160px; }
.fae-pres-num { font-family: Sora, sans-serif; font-size: var(--pres-min); font-weight: 700; letter-spacing: 0.14em; color: #E9C46A; margin: 0; }
.fae-pres-titulo { font-family: Sora, sans-serif; font-size: var(--pres-titulo); font-weight: 700; letter-spacing: -0.02em; line-height: 1.08; margin: 0; }
/* Crece hasta llenar, pero nunca por debajo de su contenido: si no cabe, la escena se desplaza en vez de pisar la barra. */
.fae-pres-cuerpo { flex: 1 0 auto; display: flex; flex-direction: column; justify-content: center; }
.fae-pres-barra { display: flex; align-items: center; gap: var(--pres-hueco); flex-wrap: wrap; border-top: var(--pres-borde) solid rgba(248,249,250,0.18); padding-top: calc(var(--pres-hueco) * 0.7); }
.fae-pres-boton {
  display: inline-flex; align-items: center; gap: 0.4em; cursor: pointer;
  font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-min); line-height: 1.2;
  padding: 0.45em 1em; border-radius: 999px;
  border: var(--pres-borde) solid rgba(248,249,250,0.6); background: transparent; color: var(--pres-tinta);
}
.fae-pres-boton:disabled { opacity: 0.35; cursor: default; }
.fae-pres-siguiente { background: #E9C46A; border-color: #E9C46A; color: #0E1B2E; }
.fae-pres-puntos { display: flex; gap: 0.45em; }
.fae-pres-punto {
  width: 2.1em; height: 2.1em; border-radius: 999px; cursor: pointer;
  font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-min);
  border: var(--pres-borde) solid rgba(248,249,250,0.6); background: transparent; color: var(--pres-tinta);
}
.fae-pres-punto[aria-current="step"] { background: var(--pres-tinta); color: #0E1B2E; }
/* La ayuda va la última y es lo único que cede: si no cabe, se parte ella, no la fila de botones. */
.fae-pres-ayuda { flex: 1 1 9em; min-width: 0; text-align: right; font-size: var(--pres-min); color: var(--pres-tinta-2); margin: 0; }
.fae-pres :focus-visible { outline: max(3px, 0.45vh) solid #E9C46A; outline-offset: 3px; }
@media (orientation: portrait), (max-width: 760px) {
  .fae-pres {
    --pres-min: 14px; --pres-lectura: 16px; --pres-destacado: 19px; --pres-titulo: 24px;
    --pres-hueco: 14px; --pres-borde: 2px;
    min-height: 0; padding: 16px;
  }
  .fae-pres-ayuda { display: none; }
  .fae-pres-siguiente { flex: 1 1 100%; justify-content: center; order: -1; }
  /* En el teléfono el control es un círculo de 40 px: la misma reserva que las cabeceras del sitio. */
  .fae-pres:not(:fullscreen) .fae-pres-cabeza { padding-right: 40px; }
}
`;

export default function Presentacion({ escenas, clave, rotulo = "Presentación" }) {
  const n = escenas.length;
  const [i, setI] = useState(() => {
    const g = leerGuardado(clave, n);
    return g ? Math.min(Math.max(0, Number(g.i) | 0), n - 1) : 0;
  });
  const [estados, setEstados] = useState(
    () => leerGuardado(clave, n)?.estados ?? escenas.map((e) => e.estadoInicial ?? null),
  );
  const [proyectando, setProyectando] = useState(false);
  const [escala, setEscala] = useState(1);
  /* Cambia con el tamaño de la ventana y al terminar de cargar las fuentes: las dos cosas mueven el alto. */
  const [lienzo, setLienzo] = useState(0);
  const escenario = useRef(null);
  const medida = useRef(null);

  useEffect(() => { guardar(clave, { i, estados }); }, [clave, i, estados]);

  const escena = escenas[i];
  const paso = escena.siguientePaso ? escena.siguientePaso(estados[i]) : null;
  const textoSiguiente = paso
    ? escena.textoPaso?.(estados[i]) ?? "Siguiente paso"
    : i < n - 1
      ? `Escena ${i + 2}: ${escenas[i + 1].titulo}`
      : null;

  const cambiarEstado = (k) => (valor) =>
    setEstados((es) => es.map((e, j) => (j === k ? (typeof valor === "function" ? valor(e) : valor) : e)));

  const siguiente = () => {
    if (paso) return cambiarEstado(i)(paso);
    if (i < n - 1) setI(i + 1);
  };
  const anterior = () => { if (i > 0) setI(i - 1); };

  const proyectar = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else escenario.current?.requestFullscreen?.()?.catch?.(() => {});
  };

  /*
   * Al cambiar de escena, la presentación sube al borde de la ventana. Sin
   * «Proyectar» —con F11, o proyectando la ventana tal cual— el encabezado del
   * sitio le quitaría alto a cada escena. Solo al cambiar de escena: un paso
   * dentro de la escena no mueve la página. Se compara con la escena anterior
   * y no con "es el primer pintado" para que el doble montaje de StrictMode no
   * haga saltar la página al abrirla.
   */
  /*
   * ENCAJAR (ver la cabecera). Cada vez que cambia lo que se ve —la escena, su
   * estado, la ventana— se vuelve a la escala 1 y se mide; si no cabe, se
   * encoge en proporción y se vuelve a medir, porque al encoger el texto se
   * parte distinto. Todo antes de pintar, así que no se ve ningún salto.
   */
  useEffect(() => {
    const otra = () => setLienzo((x) => x + 1);
    window.addEventListener("resize", otra);
    document.fonts?.ready?.then(otra);
    return () => window.removeEventListener("resize", otra);
  }, []);

  useLayoutEffect(() => {
    const el = escenario.current;
    if (!el) return;
    const clave = `${i}|${JSON.stringify(estados[i])}|${lienzo}|${proyectando}`;
    if (medida.current?.clave !== clave) {
      /* lo: la mayor escala que se sabe que cabe; hi: la menor que se sabe que no. */
      medida.current = { clave, lo: null, hi: 1 };
      if (escala !== 1) {
        setEscala(1);
        return;
      }
    }
    if (!window.matchMedia?.(PROYECCION).matches) return;

    const disponible = window.innerHeight;
    const necesario = el.scrollHeight;
    const b = medida.current;
    if (necesario <= disponible + 1) {
      if (escala === 1) return;
      b.lo = escala;
    } else {
      b.hi = escala;
      if (escala <= ESCALA_MINIMA) return; /* ni al mínimo cabe: se queda ahí y se desplaza */
    }
    /*
     * La primera vez, una estimación en proporción al alto que sobra; después,
     * bisección entre lo que cabe y lo que no, porque al encoger el texto se
     * parte en menos líneas y la proporción se queda corta: sin esto, la
     * escena 2 a 1024×768 bajaba al 80 % cuando le bastaba bastante menos.
     */
    const siguiente =
      b.lo === null
        ? Math.max(ESCALA_MINIMA, escala * (disponible / necesario) * 0.99)
        : b.hi - b.lo < 0.01
          ? b.lo
          : (b.lo + b.hi) / 2;
    if (siguiente !== escala) setEscala(siguiente);
  });

  const iPrevio = useRef(i);
  useEffect(() => {
    if (iPrevio.current === i) return;
    iPrevio.current = i;
    const el = escenario.current;
    if (!el || document.fullscreenElement) return;
    if (Math.abs(el.getBoundingClientRect().top) > 1) el.scrollIntoView?.({ block: "start" });
  }, [i]);

  useEffect(() => {
    const alCambiar = () => setProyectando(Boolean(document.fullscreenElement) && document.fullscreenElement === escenario.current);
    document.addEventListener("fullscreenchange", alCambiar);
    return () => document.removeEventListener("fullscreenchange", alCambiar);
  }, []);

  /*
   * El teclado, en la ventana entera: el profesor no tiene que haber hecho clic
   * en ningún sitio antes. Se vuelve a enganchar en cada pintado para leer
   * siempre el estado del momento.
   *
   * La barra espaciadora se queda para la presentación AUNQUE haya un botón
   * enfocado —por ejemplo, la punta de la brújula que se acaba de tocar con el
   * ratón—: si no, el mismo espacio que avanza la clase volvería a pulsar ese
   * botón. Los botones se siguen activando con Intro. Y una tecla mantenida no
   * se repite: sin eso, un espacio un poco largo se saltaría tres escenas.
   */
  useEffect(() => {
    const esCampo = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName ?? ""));
    const alPulsar = (e) => {
      if (esCampo(e.target)) return;
      const accion = accionDeTecla(e);
      if (!accion) return;
      e.preventDefault();
      if (e.repeat) return;
      if (accion === "siguiente") siguiente();
      else if (accion === "anterior") anterior();
      else if (accion === "inicio") setI(0);
      else if (accion === "final") setI(n - 1);
      else if (accion === "proyectar") proyectar();
    };
    /* Un botón se activa con la barra al SOLTARLA: cancelar solo la pulsación no basta. */
    const alSoltar = (e) => {
      if (!esCampo(e.target) && (e.key === " " || e.key === "Spacebar") && accionDeTecla(e)) e.preventDefault();
    };
    window.addEventListener("keydown", alPulsar);
    window.addEventListener("keyup", alSoltar);
    return () => {
      window.removeEventListener("keydown", alPulsar);
      window.removeEventListener("keyup", alSoltar);
    };
  });

  const { Componente } = escena;

  return (
    <div
      ref={escenario}
      className={`fae-pres${escena.identidad === "tesoreria" ? " fae-sc-rejilla" : ""}`}
      role="region"
      aria-roledescription="presentación"
      aria-label={rotulo}
      style={{ "--pres-escala": escala }}
    >
      <style>{CSS_PRESENTACION}</style>

      <header className="fae-pres-cabeza" aria-live="polite">
        <p className="fae-pres-num">ESCENA {i + 1} DE {n}</p>
        <h2 className="fae-pres-titulo">{escena.titulo}</h2>
      </header>

      <div className="fae-pres-cuerpo">
        <Componente estado={estados[i]} cambiar={cambiarEstado(i)} />
      </div>

      <nav className="fae-pres-barra" aria-label="Navegación de la presentación">
        <button type="button" className="fae-pres-boton" onClick={anterior} disabled={i === 0}>
          <ChevronLeft size="1.1em" aria-hidden="true" /> Anterior
        </button>
        <div className="fae-pres-puntos">
          {escenas.map((e, k) => (
            <button
              key={e.id}
              type="button"
              className="fae-pres-punto"
              aria-current={k === i ? "step" : undefined}
              aria-label={`Escena ${k + 1}: ${e.titulo}`}
              onClick={() => setI(k)}
            >
              {k + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="fae-pres-boton fae-pres-siguiente"
          onClick={siguiente}
          disabled={!textoSiguiente}
          aria-label={textoSiguiente ? `Siguiente: ${textoSiguiente}` : "No hay más"}
        >
          {textoSiguiente ?? "Fin"} <ChevronRight size="1.1em" aria-hidden="true" />
        </button>
        <button type="button" className="fae-pres-boton" onClick={proyectar} aria-pressed={proyectando}>
          {proyectando ? <Minimize2 size="1em" aria-hidden="true" /> : <Maximize2 size="1em" aria-hidden="true" />}
          {proyectando ? "Salir" : "Proyectar"}
        </button>
        {/*
          * La ayuda del teclado, solo en la primera escena: es donde el profesor
          * aprende el mando, y la brújula tiene alto de sobra. En las demás, esa
          * línea de más era la que hacía que no cupieran en 1080.
          */}
        {i === 0 && <p className="fae-pres-ayuda">← → · espacio · Re Pág / Av Pág</p>}
      </nav>
    </div>
  );
}
